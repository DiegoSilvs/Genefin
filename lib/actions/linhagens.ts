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
