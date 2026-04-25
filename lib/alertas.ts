import { createClient } from '@/lib/supabase/server';
import { AlertaDashboard, Ninhada, MedicaoAgua, Estrutura, LoteAlimento, EstoqueInsumo, Especie } from './types';

/**
 * Gera a lista de alertas do dashboard com base em regras de negócio.
 * Esta função é executada no lado do servidor.
 */
export async function getAlertasDashboard(): Promise<AlertaDashboard[]> {
  const supabase = await createClient();
  const alertas: AlertaDashboard[] = [];
  const agora = new Date();

  // 1. Buscar dados necessários
  const [
    { data: ninhadas },
    { data: estruturas },
    { data: lotesAlimento },
    { data: estoqueInsumos }
  ] = await Promise.all([
    supabase.from('ninhadas').select('*, especie:especies(*)').eq('status', 'ativa'),
    supabase.from('estruturas').select('*, linhagem:linhagens(*, especie:especies(*))').eq('ativa', true),
    supabase.from('lotes_alimento').select('*').in('status', ['preparando', 'pronto']),
    supabase.from('estoque_insumos').select('*')
  ]);

  // ---------------------------------------------------------
  // REGRAS DE PRIORIDADE ALTA (VERMELHO)
  // ---------------------------------------------------------

  if (ninhadas) {
    for (const ninhada of ninhadas) {
      // Ninhada com mais de 15 dias sem nenhum evento de seleção
      const { data: eventos } = await supabase
        .from('eventos_ninhada')
        .select('created_at')
        .eq('ninhada_id', ninhada.id)
        .eq('tipo', 'selecao')
        .order('created_at', { ascending: false })
        .limit(1);

      const ultimaSelecao = eventos && eventos.length > 0 
        ? new Date(eventos[0].created_at) 
        : new Date(ninhada.created_at);
      
      const diasSemSelecao = Math.floor((agora.getTime() - ultimaSelecao.getTime()) / (1000 * 60 * 60 * 24));

      if (diasSemSelecao > 15) {
        alertas.push({
          tipo: 'selecao_pendente',
          prioridade: 'alta',
          titulo: `Seleção Crítica: ${ninhada.codigo}`,
          descricao: `Esta ninhada está há ${diasSemSelecao} dias sem seleção registrada. Risco de perda de padrão.`,
          link: `/ninhadas/${ninhada.id}`,
          entidade_id: ninhada.id
        });
      } else if (diasSemSelecao >= 10) {
        // PRIORIDADE MÉDIA: Ninhada entre 10-15 dias sem seleção
        alertas.push({
          tipo: 'selecao_pendente',
          prioridade: 'media',
          titulo: `Seleção Pendente: ${ninhada.codigo}`,
          descricao: `Ninhada há ${diasSemSelecao} dias sem seleção. Recomenda-se realizar triagem em breve.`,
          link: `/ninhadas/${ninhada.id}`,
          entidade_id: ninhada.id
        });
      }

      // PRIORIDADE BAIXA: Ninhada recém-criada há menos de 3 dias
      const diasDeVida = Math.floor((agora.getTime() - new Date(ninhada.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (diasDeVida < 3) {
        alertas.push({
          tipo: 'selecao_pendente', // Usando tipo aproximado
          prioridade: 'baixa',
          titulo: `Acompanhamento: ${ninhada.codigo}`,
          descricao: `Ninhada recém-criada. Verifique o nado livre e início da alimentação.`,
          link: `/ninhadas/${ninhada.id}`,
          entidade_id: ninhada.id
        });
      }
    }
  }

  // Medição de água fora da faixa ideal (ALTA) e Estruturas sem medição (MÉDIA)
  if (estruturas) {
    for (const estrutura of estruturas) {
      const especie = (estrutura as any).linhagem?.especie as Especie;
      if (!especie) continue; // Só gera alerta de água para estruturas com espécie definida

      const { data: medicoes } = await supabase
        .from('medicoes_agua')
        .select('*')
        .eq('estrutura_id', estrutura.id)
        .order('data_medicao', { ascending: false })
        .limit(1);

      if (medicoes && medicoes.length > 0) {
        const ultimaMedicao = medicoes[0] as MedicaoAgua;
        const dataMedicao = new Date(ultimaMedicao.data_medicao);
        const diasSemMedicao = Math.floor((agora.getTime() - dataMedicao.getTime()) / (1000 * 60 * 60 * 24));

        // Bug 2 corrigido: Se medição com mais de 3 dias, alerta MÉDIA
        if (diasSemMedicao > 3) {
          alertas.push({
            tipo: 'agua_vencida',
            prioridade: 'media',
            titulo: `Medição Atrasada: ${estrutura.nome}`,
            descricao: `Última medição realizada há ${diasSemMedicao} dias. Recomenda-se nova análise.`,
            link: `/agua`,
            entidade_id: estrutura.id
          });
        }

        // Bug 1 corrigido: pH fora da faixa em mais de 10%, alerta ALTA
        let critico = false;
        let detalhe = '';

        if (ultimaMedicao.ph && (especie.ph_min || especie.ph_max)) {
          const mn = especie.ph_min ? Number(especie.ph_min) : null;
          const mx = especie.ph_max ? Number(especie.ph_max) : null;
          const val = Number(ultimaMedicao.ph);

          const thresholdMin = mn ? mn * 0.1 : 0;
          const thresholdMax = mx ? mx * 0.1 : 0;

          if ((mn && val < mn - thresholdMin) || (mx && val > mx + thresholdMax)) {
            critico = true;
            detalhe += `pH Crítico (${val}). `;
          }
        }

        if (critico) {
          alertas.push({
            tipo: 'agua_fora_faixa',
            prioridade: 'alta',
            titulo: `Parâmetro Crítico: ${estrutura.nome}`,
            descricao: `Atenção: ${detalhe} Verifique o aquário imediatamente.`,
            link: `/agua`,
            entidade_id: estrutura.id
          });
        }
      } else {
        // Nunca medido
        alertas.push({
          tipo: 'agua_vencida',
          prioridade: 'media',
          titulo: `Sem Medição: ${estrutura.nome}`,
          descricao: `Nenhuma medição de água registrada para este aquário com ${especie.nome}.`,
          link: `/agua`,
          entidade_id: estrutura.id
        });
      }
    }
  }

  // Regras de Alimento Vivo
  if (lotesAlimento) {
    for (const lote of lotesAlimento) {
      if (lote.status === 'pronto' && lote.janela_uso_fim) {
        const fimUso = new Date(lote.janela_uso_fim);
        
        // PRIORIDADE ALTA: Alimento vencido
        if (fimUso < agora) {
          alertas.push({
            tipo: 'alimento_vencendo',
            prioridade: 'alta',
            titulo: `Alimento Vencido: ${lote.codigo}`,
            descricao: `O lote de ${lote.tipo} venceu em ${fimUso.toLocaleTimeString()}. Descarte necessário.`,
            link: `/alimentos`,
            entidade_id: lote.id
          });
        } 
        // PRIORIDADE MÉDIA: Vence em menos de 2 horas
        else if (fimUso.getTime() < agora.getTime() + (2 * 60 * 60 * 1000)) {
          alertas.push({
            tipo: 'alimento_vencendo',
            prioridade: 'media',
            titulo: `Alimento no Fim: ${lote.codigo}`,
            descricao: `O lote de ${lote.tipo} vence em menos de 2 horas. Use agora.`,
            link: `/alimentos`,
            entidade_id: lote.id
          });
        }
      }

      // PRIORIDADE BAIXA: Quase pronto (janela_uso_inicio <= NOW + 1h)
      if (lote.status === 'preparando' && lote.janela_uso_inicio) {
        const inicioUso = new Date(lote.janela_uso_inicio);
        if (inicioUso.getTime() <= agora.getTime() + (1 * 60 * 60 * 1000)) {
          alertas.push({
            tipo: 'alimento_pronto',
            prioridade: 'baixa',
            titulo: `Alimento Quase Pronto`,
            descricao: `Lote ${lote.codigo} estará pronto para uso em instantes.`,
            link: `/alimentos`,
            entidade_id: lote.id
          });
        }
      }
    }
  }

  // Regras de Estoque (MÉDIA)
  if (estoqueInsumos) {
    for (const insumo of estoqueInsumos) {
      if (insumo.quantidade_minima && insumo.quantidade_atual <= insumo.quantidade_minima) {
        alertas.push({
          tipo: 'estoque_baixo',
          prioridade: 'media',
          titulo: `Estoque Baixo: ${insumo.nome}`,
          descricao: `Quantidade atual (${insumo.quantidade_atual}${insumo.unidade}) abaixo do mínimo seguro.`,
          link: `/alimentos`, // Geralmente estoque fica na página de alimentos/insumos
          entidade_id: insumo.id
        });
      }
    }
  }

  // Ordenar alertas por prioridade (Alta -> Média -> Baixa)
  const pesoPrioridade = { alta: 3, media: 2, baixa: 1 };
  return alertas.sort((a, b) => pesoPrioridade[b.prioridade] - pesoPrioridade[a.prioridade]);
}
