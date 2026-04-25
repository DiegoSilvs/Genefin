'use server';

import { getTanques, getPeixes, moverPeixe } from '@/lib/db';
import { Tanque, Peixe } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function submitMovement(formData: FormData) {
  const peixeId = formData.get('peixeId') as string;
  const destinoId = formData.get('destinoId') as string;
  const motivo = formData.get('motivo') as string;
  const currentTankId = formData.get('currentTankId') as string;

  if (!peixeId || !destinoId || !motivo) {
    throw new Error('Todos os campos são obrigatórios.');
  }

  await moverPeixe(peixeId, destinoId, motivo);
  revalidatePath(`/tanques/${currentTankId}`);
  revalidatePath(`/tanques/${destinoId}`);
  revalidatePath('/tanques');
}

export async function getMovementData(tankId: string) {
  const [peixes, allTanques] = await Promise.all([
    getPeixes({ tankId, status: 'ativo' }),
    getTanques({ includeDeleted: false })
  ]);
  
  return {
    peixes,
    tanques: allTanques.filter(t => t.id !== tankId && t.status === 'ativo')
  };
}
