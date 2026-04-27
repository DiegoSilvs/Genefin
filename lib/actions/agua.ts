'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveMedicaoAgua(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const estrutura_id = formData.get('estrutura_id') as string;
  const ph = formData.get('ph') ? parseFloat(formData.get('ph') as string) : null;
  const temperatura = formData.get('temperatura') ? parseFloat(formData.get('temperatura') as string) : null;
  const amonia = formData.get('amonia') ? parseFloat(formData.get('amonia') as string) : null;
  const nitrito = formData.get('nitrito') ? parseFloat(formData.get('nitrito') as string) : null;
  const nitrato = formData.get('nitrato') ? parseFloat(formData.get('nitrato') as string) : null;
  const condutividade = formData.get('condutividade') ? parseInt(formData.get('condutividade') as string) : null;
  const dureza_gh = formData.get('dureza_gh') ? parseInt(formData.get('dureza_gh') as string) : null;
  const observacoes = formData.get('observacoes') as string | null;

  const { error } = await supabase.from('medicoes_agua').insert({
    usuario_id: user.id,
    estrutura_id,
    ph,
    temperatura,
    amonia,
    nitrito,
    nitrato,
    condutividade,
    dureza_gh,
    data_medicao: new Date().toISOString(),
    observacoes
  });

  if (error) {
    console.error('Erro ao salvar medição:', error);
    return { error: 'Falha ao salvar medição' };
  }

  revalidatePath('/agua');
  return { success: true };
}

export async function updateMedicaoAgua(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const ph = formData.get('ph') ? parseFloat(formData.get('ph') as string) : null;
  const temperatura = formData.get('temperatura') ? parseFloat(formData.get('temperatura') as string) : null;
  const amonia = formData.get('amonia') ? parseFloat(formData.get('amonia') as string) : null;
  const nitrito = formData.get('nitrito') ? parseFloat(formData.get('nitrito') as string) : null;
  const nitrato = formData.get('nitrato') ? parseFloat(formData.get('nitrato') as string) : null;
  const observacoes = formData.get('observacoes') as string | null;

  const { error } = await supabase
    .from('medicoes_agua')
    .update({
      ph,
      temperatura,
      amonia,
      nitrito,
      nitrato,
      observacoes
    })
    .eq('id', id)
    .eq('usuario_id', user.id);

  if (error) {
    console.error('Erro ao atualizar medição:', error);
    return { error: 'Falha ao atualizar medição' };
  }

  revalidatePath('/agua');
  return { success: true };
}
