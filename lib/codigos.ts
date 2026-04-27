import { createClient } from '@/lib/supabase/server';

/**
 * Chama a função RPC gerar_codigo_individuo no Supabase.
 */
export async function gerarCodigoIndividuo(especieId: string, linhagemId: string, sexo: 'M' | 'F' | 'I') {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('gerar_codigo_individuo', {
    p_especie_id: especieId,
    p_linhagem_id: linhagemId,
    p_sexo: sexo
  });

  if (error) throw error;
  return data as string;
}

/**
 * Chama a função RPC gerar_codigo_ninhada no Supabase.
 */
export async function gerarCodigoNinhada(especieId: string, linhagemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('gerar_codigo_ninhada', {
    p_especie_id: especieId,
    p_linhagem_id: linhagemId
  });

  if (error) throw error;
  return data as string;
}

/**
 * Chama a função RPC calcular_geracao no Supabase.
 */
export async function calcularGeracao(paiId: string | null, maeId: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('calcular_geracao', {
    p_pai_id: paiId,
    p_mae_id: maeId
  });

  if (error) throw error;
  return data as number;
}
