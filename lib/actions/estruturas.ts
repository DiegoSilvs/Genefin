'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TipoEstrutura } from '@/lib/types';

export async function createEstrutura(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const nome = formData.get('nome') as string;
  const tipo = formData.get('tipo') as TipoEstrutura;
  const linhagem_id = formData.get('linhagem_id') as string | null;
  const capacidade = formData.get('capacidade') ? parseInt(formData.get('capacidade') as string) : null;
  const observacoes = formData.get('observacoes') as string | null;

  const { error } = await supabase.from('estruturas').insert({
    usuario_id: user.id,
    nome,
    tipo,
    linhagem_id: tipo === 'quarentena' ? null : (linhagem_id || null),
    capacidade,
    observacoes,
    ativa: true
  });

  if (error) {
    console.error('Erro ao criar estrutura:', error);
    return { error: 'Falha ao salvar estrutura no banco de dados' };
  }

  revalidatePath('/estruturas');
  redirect('/estruturas');
}
