'use server';

import { 
  PeixeRow, 
  CruzamentoRow, 
  NinhadaRow, 
  EventoNinhadaRow, 
  TanqueRow, 
  MedicaoRow,
  Peixe, 
  Cruzamento, 
  Ninhada, 
  EventoNinhada, 
  Tanque, 
  Medicao,
  MovimentacaoTanque
} from './types';

import { createClient } from '@/lib/supabase/server';
import { checkParentesco } from './genetica';

// ─── Mappers ─────────────────────────────────────────────

function toTanque(row: any): Tanque {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    volumeLitros: row.volume_litros,
    capacidadeBiologica: row.capacidade_biologica,
    tipoUso: row.tipo_uso,
    tipoFiltragem: row.tipo_filtragem,
    status: row.status,
    intervaloMedicaoDias: row.intervalo_medicao_dias,
    phIdealMin: row.ph_ideal_min ?? undefined,
    phIdealMax: row.ph_ideal_max ?? undefined,
    tempIdealMin: row.temp_ideal_min ?? undefined,
    tempIdealMax: row.temp_ideal_max ?? undefined,
    peixesCount: row.peixes_count?.[0]?.count ?? 0,
  };
}

function toPeixe(row: PeixeRow): Peixe {
  return {
    id: row.id,
    codigoVisivel: row.codigo_visivel,
    especie: row.especie,
    linhagem: row.linhagem,
    sexo: row.sexo,
    nascimento: row.nascimento,
    cor: row.cor,
    tankId: row.tank_id,
    status: row.status,
    nota: row.nota ?? undefined,
    paiId: row.pai_id ?? undefined,
    maeId: row.mae_id ?? undefined,
    cruzamentoId: row.cruzamento_id ?? undefined,
    ninhadaId: row.ninhada_id ?? undefined,
    linhagemIndex: row.linhagem_index ?? undefined,
    qualidade: row.qualidade ?? undefined,
  };
}

// ─── Tanques ───────────────────────────────────────────

export async function getTanques(options: { includeDeleted?: boolean } = {}): Promise<Tanque[]> {
  const supabase = await createClient();
  let query = supabase.from('tanques').select('*, peixes_count:peixes(count)');
  
  if (!options.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('nome');

  if (error) throw error;
  return (data || []).map(toTanque);
}

export async function getTanque(id: string): Promise<Tanque | null> {
  const { data, error } = await (await createClient())
    .from('tanques')
    .select('*, peixes_count:peixes(count)')
    .or(`id.eq.${id},nome.eq.${id}`)
    .maybeSingle();

  if (error || !data) return null;
  return toTanque(data);
}

export async function moverPeixe(peixeId: string, destinoId: string, motivo: string): Promise<void> {
  const { error } = await (await createClient())
    .rpc('mover_peixe_v2', {
      p_peixe_id: peixeId,
      p_destino_id: destinoId,
      p_motivo: motivo
    });
  if (error) throw error;
}

export async function getHistoricoMovimentacao(peixeId: string, limit = 20): Promise<MovimentacaoTanque[]> {
  const { data, error } = await (await createClient())
    .from('movimentacoes_tanque')
    .select('*')
    .eq('peixe_id', peixeId)
    .order('data', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    peixeId: r.peixe_id,
    origemId: r.origem_id ?? undefined,
    destinoId: r.destino_id,
    data: r.data,
    motivo: r.motivo ?? undefined
  }));
}

export async function getMovimentacoesTanque(tanqueId: string, limit = 20): Promise<MovimentacaoTanque[]> {

// ─── Peixes ─────────────────────────────────────────────

export async function getPeixes(options: { tankId?: string; status?: string } = {}): Promise<Peixe[]> {
  const supabase = await createClient();
  let query = supabase.from('peixes').select('*');
  
  if (options.tankId) query = query.eq('tank_id', options.tankId);
  if (options.status) query = query.eq('status', options.status);
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(toPeixe);
}

export async function getPeixe(id: string): Promise<Peixe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('peixes')
    .select('*')
    .or(`id.eq.${id},codigo_visivel.eq.${id}`)
    .maybeSingle();

  if (error || !data) return null;
  return toPeixe(data);
}

export async function addMedicao(input: any): Promise<void> {
  const { error } = await (await createClient())
    .from('medicoes')
    .insert({
      tank_id: input.tankId,
      ph: input.ph,
      temp: input.temp,
      amonia: input.amonia,
      nitrito: input.nitrito,
      nitrato: input.nitrato,
      nota: input.nota
    });
  if (error) throw error;
}

export async function getPeixesNoTanque(tankId: string): Promise<Peixe[]> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .select('*')
    .eq('tank_id', tankId)
    .eq('status', 'ativo')
    .order('codigo_visivel');
  if (error) throw error;
  return (data || []).map(toPeixe);
}

export async function deleteTanque(id: string): Promise<void> {
  const { error } = await (await createClient())
    .from('tanques')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
// ─── Medicao ───────────────────────────────────────────

export async function getMedicoes(tankId: string, limit = 10): Promise<Medicao[]> {
  const { data, error } = await (await createClient())
    .from('medicoes')
    .select('*')
    .eq('tank_id', tankId)
    .order('measured_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    tankId: row.tank_id,
    ph: row.ph ?? undefined,
    temp: row.temp ?? undefined,
    amonia: row.amonia ?? undefined,
    nitrito: row.nitrito ?? undefined,
    nitrato: row.nitrato ?? undefined,
    measuredAt: row.measured_at,
    nota: row.nota ?? undefined,
  }));
}

export async function getPeixesPorSexo(sexo: 'macho' | 'femea', statusFilter = 'ativo'): Promise<Peixe[]> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .select('*')
    .eq('sexo', sexo)
    .eq('status', statusFilter)
    .order('codigo_visivel');

  if (error) throw error;
  return (data || []).map(toPeixe);
}

export async function getIdsPorPrefixo(prefixo: string): Promise<string[]> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .select('codigo_visivel')
    .like('codigo_visivel', `${prefixo}-%`);
  if (error) throw error;
  return (data || []).map((r: any) => r.codigo_visivel);
}

export async function getPaiDe(peixe: Peixe): Promise<Peixe | null> {
  if (!peixe.paiId) return null;
  return getPeixe(peixe.paiId);
}

export async function getMaeDe(peixe: Peixe): Promise<Peixe | null> {
  if (!peixe.maeId) return null;
  return getPeixe(peixe.maeId);
}

export async function getFilhosDe(peixeId: string): Promise<Peixe[]> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .select('*')
    .or(`pai_id.eq.${peixeId},mae_id.eq.${peixeId}`)
    .order('created_at');
  if (error) throw error;
  return (data || []).map(toPeixe);
}

export async function addPeixe(input: any): Promise<Peixe> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .insert({
      codigo_visivel: input.id || input.codigoVisivel,
      especie: input.especie,
      linhagem: input.linhagem,
      sexo: input.sexo,
      nascimento: input.nascimento,
      cor: input.cor,
      tank_id: input.tankId,
      status: input.status,
      nota: input.nota,
      pai_id: input.paiId,
      mae_id: input.maeId,
      cruzamento_id: input.cruzamentoId
    })
    .select()
    .single();

  if (error) throw error;
  return toPeixe(data);
}

export async function addTanque(input: any): Promise<Tanque> {
  const { data, error } = await (await createClient())
    .from('tanques')
    .insert({
      nome: input.nome,
      tipo: input.tipo,
      volume_litros: input.volumeLitros,
      capacidade_biologica: input.capacidadeBiologica,
      tipo_uso: input.tipoUso,
      status: input.status || 'ativo',
      tipo_filtragem: input.tipoFiltragem || 'esponja',
      ph_ideal_min: input.phIdealMin,
      ph_ideal_max: input.phIdealMax,
      temp_ideal_min: input.tempIdealMin,
      temp_ideal_max: input.tempIdealMax
    })
    .select()
    .single();

  if (error) throw error;
  return toTanque(data);
}

// ─── Cruzamentos ────────────────────────────────────────

export async function getCruzamentos(): Promise<Cruzamento[]> {
  const { data, error } = await (await createClient())
    .from('cruzamentos')
    .select('*')
    .order('data', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCruzamento(id: string): Promise<Cruzamento | null> {
  const { data, error } = await (await createClient())
    .from('cruzamentos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function updateCruzamentoStatus(id: string, status: Cruzamento['status']): Promise<void> {
  const { error } = await (await createClient())
    .from('cruzamentos')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function getCruzamentosDoPeixe(peixeId: string): Promise<Cruzamento[]> {
  const { data, error } = await (await createClient())
    .from('cruzamentos')
    .select('*')
    .or(`macho_id.eq.${peixeId},femea_id.eq.${peixeId}`)
    .order('data', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function countCruzamentosDoPeixe(peixeId: string): Promise<number> {
  const { count, error } = await (await createClient())
    .from('cruzamentos')
    .select('*', { count: 'exact', head: true })
    .or(`macho_id.eq.${peixeId},femea_id.eq.${peixeId}`);
  if (error) throw error;
  return count || 0;
}

export async function countFilhosDoPeixe(peixeId: string): Promise<number> {
  const { count, error } = await (await createClient())
    .from('peixes')
    .select('*', { count: 'exact', head: true })
    .or(`pai_id.eq.${peixeId},mae_id.eq.${peixeId}`);
  if (error) throw error;
  return count || 0;
}

export async function addCruzamento(input: any): Promise<Cruzamento> {
  const { data, error } = await (await createClient())
    .from('cruzamentos')
    .insert({
      codigo: input.codigo,
      macho_id: input.machoId,
      femea_id: input.femeaId,
      data: input.data,
      observacao: input.observacao,
      status: 'planejado'
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getFilhosDoCruzamento(cruzamentoId: string): Promise<Peixe[]> {
  const { data, error } = await (await createClient())
    .from('peixes')
    .select('*')
    .eq('cruzamento_id', cruzamentoId);
  if (error) throw error;
  return (data || []).map(toPeixe);
}

// ─── Ninhadas ───────────────────────────────────────────

export async function getNinhadas(): Promise<Ninhada[]> {
  const { data, error } = await (await createClient())
    .from('ninhadas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getNinhada(id: string): Promise<Ninhada | null> {
  const { data, error } = await (await createClient())
    .from('ninhadas')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function addNinhada(input: any): Promise<Ninhada> {
  const { data, error } = await (await createClient())
    .from('ninhadas')
    .insert({
      codigo: input.codigo,
      cruzamento_id: input.cruzamentoId,
      tank_id: input.tankId,
      data_desova: input.dataDesova,
      qtd_inicial: input.qtdInicial,
      fase_atual: 'ovo'
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getEventosNinhada(ninhadaId: string): Promise<EventoNinhada[]> {
  const { data, error } = await (await createClient())
    .from('eventos_ninhada')
    .select('*')
    .eq('ninhada_id', ninhadaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    ninhadaId: r.ninhada_id,
    tipoEvento: r.tipo_evento,
    quantidade: r.quantidade,
    faseNoMomento: r.fase_no_momento,
    nota: r.nota ?? undefined,
    createdAt: r.created_at
  }));
}

export async function addEventoNinhada(input: any): Promise<void> {
  const { error } = await (await createClient())
    .from('eventos_ninhada')
    .insert({
      ninhada_id: input.ninhadaId,
      tipo_evento: input.tipoEvento,
      quantidade: input.quantidade,
      fase_no_momento: input.faseNoMomento,
      nota: input.nota
    });
  if (error) throw error;
}

export async function individualizarFilhote(input: any): Promise<string> {
  const { data, error } = await (await createClient())
    .rpc('individualizar_filhote_v3', {
      p_ninhada_id: input.ninhadaId,
      p_sexo: input.sexo,
      p_cor: input.cor,
      p_qualidade: input.qualidade,
      p_nota: input.nota
    });
  if (error) throw error;
  return data;
}

export async function updatePeixe(id: string, updates: Partial<Peixe>): Promise<void> {
  const { error } = await (await createClient())
    .from('peixes')
    .update({
      codigo_visivel: updates.codigoVisivel,
      status: updates.status,
      nota: updates.nota,
      tank_id: updates.tankId
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deletePeixe(id: string): Promise<void> {
  const { error } = await (await createClient())
    .from('peixes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
