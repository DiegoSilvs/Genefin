import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AlimentosClient from '@/components/alimentos/AlimentosClient';

export default async function AlimentosPage() {
  const supabase = await createClient();

  // 1. Buscar lotes ativos (ordenados por janela de uso)
  const { data: lotes } = await supabase
    .from('lotes_alimento')
    .select('*')
    .in('status', ['preparando', 'pronto', 'em_uso'])
    .order('janela_uso_inicio', { ascending: true });

  // 2. Buscar estoque de insumos
  const { data: estoque } = await supabase
    .from('estoque_insumos')
    .select('*')
    .order('nome');

  // 3. Buscar estruturas (para destino do alimento)
  const { data: estruturas } = await supabase
    .from('estruturas')
    .select('*')
    .eq('ativa', true)
    .order('nome');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alimentos Vivos & Insumos</h1>
        <p className="text-slate-500 font-medium">Controle de eclosão, janelas de uso e reposição de estoque</p>
      </div>

      <AlimentosClient 
        lotes={lotes || []} 
        estoque={estoque || []} 
        estruturas={estruturas || []} 
      />
    </div>
  );
}
