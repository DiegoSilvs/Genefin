'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TipoAlimento, StatusAlimento } from '@/lib/types';

export async function createLoteAlimento(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const tipo = formData.get('tipo') as TipoAlimento;
  const quantidade_insumo = parseFloat(formData.get('quantidade_insumo') as string);
  const unidade = formData.get('unidade') as string;
  const temperatura_cultivo = parseFloat(formData.get('temperatura_cultivo') as string);
  const estrutura_destino_id = formData.get('estrutura_destino_id') as string | null;
  const data_inicio = new Date();

  // Lógica de cálculo de janelas (Simplificada conforme regra)
  let horasInicio = 24;
  let horasFim = 36;

  if (tipo === 'artemia') {
    // Se temperatura > 28°C, acelera
    horasInicio = temperatura_cultivo > 28 ? 20 : 24;
    horasFim = temperatura_cultivo > 28 ? 30 : 36;
  } else if (tipo === 'infusorio') {
    horasInicio = 72;
    horasFim = 120;
  } else if (tipo === 'dafnia') {
    horasInicio = 120; // 5 dias
    horasFim = 240; // 10 dias
  } else if (tipo === 'minhoca_branca') {
    horasInicio = 168; // 7 dias
    horasFim = 336; // 14 dias
  }

  const janela_uso_inicio = new Date(data_inicio.getTime() + (horasInicio * 60 * 60 * 1000));
  const janela_uso_fim = new Date(data_inicio.getTime() + (horasFim * 60 * 60 * 1000));

  const codigo = `${tipo.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const { error } = await supabase.from('lotes_alimento').insert({
    usuario_id: user.id,
    tipo,
    codigo,
    quantidade_insumo,
    unidade,
    data_inicio: data_inicio.toISOString(),
    temperatura_cultivo,
    janela_uso_inicio: janela_uso_inicio.toISOString(),
    janela_uso_fim: janela_uso_fim.toISOString(),
    status: 'preparando',
    estrutura_destino_id: estrutura_destino_id || null
  });

  if (error) throw error;

  revalidatePath('/alimentos');
}

export async function updateEstoqueInsumo(id: string, quantidade: number, operacao: 'entrada' | 'saida') {
  const supabase = await createClient();
  
  const { data: insumo } = await supabase.from('estoque_insumos').select('quantidade_atual').eq('id', id).single();
  if (!insumo) throw new Error('Insumo não encontrado');

  const novaQuantidade = operacao === 'entrada' 
    ? insumo.quantidade_atual + quantidade 
    : insumo.quantidade_atual - quantidade;

  const { error } = await supabase.from('estoque_insumos').update({
    quantidade_atual: novaQuantidade,
    updated_at: new Date().toISOString()
  }).eq('id', id);

  if (error) throw error;

  revalidatePath('/alimentos');
}

export async function updateLoteStatus(id: string, status: StatusAlimento) {
  const supabase = await createClient();
  const { error } = await supabase.from('lotes_alimento').update({ status }).eq('id', id);
  if (error) throw error;
  revalidatePath('/alimentos');
}

export async function createEstoqueInsumo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const nome = formData.get('nome') as string;
  const tipo = formData.get('tipo') as string;
  const quantidade_atual = parseFloat(formData.get('quantidade_atual') as string);
  const unidade = formData.get('unidade') as string;
  const quantidade_minima = parseFloat(formData.get('quantidade_minima') as string);
  const data_validade = formData.get('data_validade') as string || null;

  const { error } = await supabase.from('estoque_insumos').insert({
    usuario_id: user.id,
    nome,
    tipo,
    quantidade_atual,
    unidade,
    quantidade_minima,
    data_validade: data_validade || null
  });

  if (error) throw error;

  revalidatePath('/alimentos');
}
