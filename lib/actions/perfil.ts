'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const nome = formData.get('nome') as string;
  const nome_fazenda = formData.get('nome_fazenda') as string;
  const cidade = formData.get('cidade') as string;
  const estado = formData.get('estado') as string;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      nome,
      nome_fazenda,
      cidade,
      estado,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { error: 'Falha ao atualizar perfil' };
  }

  revalidatePath('/perfil');
  return { success: true };
}
