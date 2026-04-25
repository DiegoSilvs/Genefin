import React from 'react';
import { createClient } from '@/lib/supabase/server';
import WaterQualityClient from '@/components/agua/WaterQualityClient';

export default async function AguaPage() {
  const supabase = await createClient();

  // 1. Buscar todas as estruturas com suas espécies associadas
  const { data: estruturas } = await supabase
    .from('estruturas')
    .select('*, linhagem:linhagens(especie:especies(*))')
    .eq('ativa', true)
    .order('nome');

  // 2. Buscar todas as medições para filtrar no cliente
  const { data: medicoes } = await supabase
    .from('medicoes_agua')
    .select('*')
    .order('data_medicao', { ascending: false });

  return (
    <WaterQualityClient 
      estruturas={estruturas || []} 
      medicoesIniciais={medicoes || []} 
    />
  );
}
