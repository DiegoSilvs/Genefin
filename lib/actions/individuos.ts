'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Sexo, StatusIndividuo, OrigemIndividuo } from '@/lib/types';

export async function createIndividuo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const especie_id = formData.get('especie_id') as string;
  const linhagem_id = formData.get('linhagem_id') as string;
  const sexo = formData.get('sexo') as Sexo;
  const origem = formData.get('origem') as OrigemIndividuo;
  const pai_id = formData.get('pai_id') as string | null;
  const mae_id = formData.get('mae_id') as string | null;
  const nome_popular = formData.get('nome_popular') as string | null;
  const estrutura_id = formData.get('estrutura_id') as string | null;
  const data_nascimento = formData.get('data_nascimento') as string | null;
  
  // Fenótipos (simulado como JSON)
  const fenotipoChave = formData.getAll('fenotipo_chave') as string[];
  const fenotipoValor = formData.getAll('fenotipo_valor') as string[];
  const fenotipo: Record<string, string> = {};
  fenotipoChave.forEach((chave, i) => {
    if (chave && fenotipoValor[i]) fenotipo[chave] = fenotipoValor[i];
  });

  // 1. Gerar código chamando a RPC
  const { data: codigo, error: errorCodigo } = await supabase.rpc('gerar_codigo_individuo', {
    p_especie_id: especie_id,
    p_linhagem_id: linhagem_id,
    p_sexo: sexo
  });

  if (errorCodigo) throw errorCodigo;

  // 2. Calcular geração chamando a RPC
  const { data: geracao, error: errorGeracao } = await supabase.rpc('calcular_geracao', {
    p_pai_id: pai_id || null,
    p_mae_id: mae_id || null
  });

  if (errorGeracao) throw errorGeracao;

  // 3. Inserir indivíduo
  const { error: errorInsert } = await supabase.from('individuos').insert({
    usuario_id: user.id,
    especie_id,
    linhagem_id,
    sexo,
    origem,
    pai_id: pai_id || null,
    mae_id: mae_id || null,
    codigo,
    geracao,
    nome_popular,
    estrutura_id,
    data_nascimento,
    fenotipo,
    status: 'ativo'
  });

  if (errorInsert) {
    console.error('Erro ao inserir indivíduo:', errorInsert);
    return { error: 'Falha ao salvar indivíduo' };
  }

  revalidatePath('/individuos');
  redirect('/individuos');
}

export async function updateIndividuoStatus(id: string, status: StatusIndividuo) {
  const supabase = await createClient();
  const { error } = await supabase.from('individuos').update({ status }).eq('id', id);
  if (error) throw error;
  revalidatePath(`/individuos/${id}`);
}

export async function moveIndividuo(id: string, estrutura_id: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from('individuos').update({ estrutura_id }).eq('id', id);
  if (error) throw error;
  revalidatePath(`/individuos/${id}`);
}
