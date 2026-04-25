import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import NinhadaDetailView from '@/components/ninhadas/NinhadaDetailView';

export default async function NinhadaDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Buscar ninhada com pais e estrutura
  const { data: ninhada } = await supabase
    .from('ninhadas')
    .select(`
      *,
      especie:especies(*),
      linhagem:linhagens(*),
      estrutura:estruturas(*),
      pai:individuos!pai_id(id, codigo, nome_popular),
      mae:individuos!mae_id(id, codigo, nome_popular)
    `)
    .eq('id', id)
    .single();

  if (!ninhada) notFound();

  // 2. Buscar eventos
  const { data: eventos } = await supabase
    .from('eventos_ninhada')
    .select('*')
    .eq('ninhada_id', id)
    .order('data_evento', { ascending: false });

  // 3. Buscar indivíduos promovidos desta ninhada
  const { data: promovidos } = await supabase
    .from('individuos')
    .select('id, codigo, sexo, nome_popular')
    .eq('ninhada_origem_id', id)
    .order('created_at', { ascending: false });

  return (
    <NinhadaDetailView 
      ninhada={ninhada} 
      eventos={eventos || []} 
      promovidos={promovidos || []} 
    />
  );
}
