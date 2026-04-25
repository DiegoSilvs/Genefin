'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLinhagem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const especie_id = formData.get('especie_id') as string;
  const nome = formData.get('nome') as string;
  const descricao = formData.get('descricao') as string | null;

  const { error } = await supabase.from('linhagens').insert({
    usuario_id: user.id,
    especie_id,
    nome,
    descricao,
    ativa: true
  });

  if (error) {
    console.error('Erro ao criar linhagem:', error);
    return { error: 'Falha ao salvar linhagem no banco de dados' };
  }

  revalidatePath('/linhagens');
  redirect('/linhagens');
}

export async function deleteLinhagem(id: string) {
  const supabase = await createClient();
  
  // 1. Verificar se existem indivíduos
  const { count: countIndividuos } = await supabase
    .from('individuos')
    .select('*', { count: 'exact', head: true })
    .eq('linhagem_id', id);

  // 2. Verificar se existem ninhadas
  const { count: countNinhadas } = await supabase
    .from('ninhadas')
    .select('*', { count: 'exact', head: true })
    .eq('linhagem_id', id);

  if ((countIndividuos || 0) > 0 || (countNinhadas || 0) > 0) {
    return { error: 'Não é possível excluir: existem indivíduos ou ninhadas vinculados a esta linhagem. Sugestão: Arquivar.' };
  }

  const { error } = await supabase.from('linhagens').delete().eq('id', id);
  if (error) throw error;

  revalidatePath('/linhagens');
  return { success: true };
}

export async function archiveLinhagem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('linhagens').update({ ativa: false }).eq('id', id);
  if (error) throw error;

  revalidatePath('/linhagens');
  return { success: true };
}
