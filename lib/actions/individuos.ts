'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { StatusIndividuo } from '@/lib/types';

// Funções de manipulação de indivíduos (Cadastro movido para Client Component)

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
