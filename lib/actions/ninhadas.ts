'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TipoEvento, Sexo } from '@/lib/types';

export async function createNinhada(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const especie_id = formData.get('especie_id') as string;
  const linhagem_id = formData.get('linhagem_id') as string;
  const pai_id = formData.get('pai_id') as string;
  const mae_id = formData.get('mae_id') as string;
  const data_cruzamento = formData.get('data_cruzamento') as string;
  const data_nascimento = formData.get('data_nascimento') as string;
  const total_nascidos = parseInt(formData.get('total_nascidos') as string);
  const estrutura_id = formData.get('estrutura_id') as string;
  const observacoes = formData.get('observacoes') as string | null;

  // Gerar código
  const { data: codigo, error: errorCodigo } = await supabase.rpc('gerar_codigo_ninhada', {
    p_especie_id: especie_id,
    p_linhagem_id: linhagem_id
  });

  if (errorCodigo) throw errorCodigo;

  const { error } = await supabase.from('ninhadas').insert({
    usuario_id: user.id,
    especie_id,
    linhagem_id,
    pai_id,
    mae_id,
    data_cruzamento,
    data_nascimento,
    total_nascidos,
    total_atual: total_nascidos,
    estrutura_id,
    codigo,
    status: 'ativa',
    observacoes
  });

  if (error) throw error;

  revalidatePath('/ninhadas');
  redirect('/ninhadas');
}

export async function registrarEventoNinhada(
  ninhadaId: string, 
  tipo: 'selecao' | 'morte', 
  quantidade: number, 
  criterio: string | null
) {
  const supabase = await createClient();
  
  // 1. Buscar dados atuais da ninhada
  const { data: ninhada } = await supabase.from('ninhadas').select('*').eq('id', ninhadaId).single();
  if (!ninhada) throw new Error('Ninhada não encontrada');

  const novoTotalAtual = ninhada.total_atual - quantidade;
  const novoTotalDescartado = tipo === 'selecao' ? ninhada.total_descartado + quantidade : ninhada.total_descartado;
  const novoTotalMorto = tipo === 'morte' ? ninhada.total_morto + quantidade : ninhada.total_morto;

  // 2. Criar evento
  const { error: errorEvento } = await supabase.from('eventos_ninhada').insert({
    ninhada_id: ninhadaId,
    tipo,
    quantidade,
    total_restante: novoTotalAtual,
    criterio,
    data_evento: new Date().toISOString()
  });

  if (errorEvento) throw errorEvento;

  // 3. Atualizar ninhada
  const { error: errorNinhada } = await supabase.from('ninhadas').update({
    total_atual: novoTotalAtual,
    total_descartado: novoTotalDescartado,
    total_morto: novoTotalMorto
  }).eq('id', ninhadaId);

  if (errorNinhada) throw errorNinhada;

  revalidatePath(`/ninhadas/${ninhadaId}`);
}

export async function promoverAlevinos(
  ninhadaId: string,
  alevinos: { sexo: Sexo; nome_popular?: string }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: ninhada } = await supabase.from('ninhadas').select('*').eq('id', ninhadaId).single();
  if (!ninhada) throw new Error('Ninhada não encontrada');

  for (const alevino of alevinos) {
    // Gerar código para o novo indivíduo
    const { data: codigo } = await supabase.rpc('gerar_codigo_individuo', {
      p_especie_id: ninhada.especie_id,
      p_linhagem_id: ninhada.linhagem_id,
      p_sexo: alevino.sexo
    });

    const { data: geracao } = await supabase.rpc('calcular_geracao', {
      p_pai_id: ninhada.pai_id,
      p_mae_id: ninhada.mae_id
    });

    await supabase.from('individuos').insert({
      usuario_id: user.id,
      especie_id: ninhada.especie_id,
      linhagem_id: ninhada.linhagem_id,
      sexo: alevino.sexo,
      origem: 'ninhada',
      ninhada_origem_id: ninhadaId,
      pai_id: ninhada.pai_id,
      mae_id: ninhada.mae_id,
      codigo,
      geracao,
      nome_popular: alevino.nome_popular,
      estrutura_id: ninhada.estrutura_id,
      status: 'ativo'
    });
  }

  // Criar evento de promoção
  const novoTotalAtual = ninhada.total_atual - alevinos.length;
  await supabase.from('eventos_ninhada').insert({
    ninhada_id: ninhadaId,
    tipo: 'promocao',
    quantidade: alevinos.length,
    total_restante: novoTotalAtual,
    data_evento: new Date().toISOString()
  });

  // Atualizar ninhada
  await supabase.from('ninhadas').update({
    total_atual: novoTotalAtual,
    total_promovido: ninhada.total_promovido + alevinos.length
  }).eq('id', ninhadaId);

  revalidatePath(`/ninhadas/${ninhadaId}`);
}
