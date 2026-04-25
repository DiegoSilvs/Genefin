import React from 'react';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyStateGuide from '@/components/ui/EmptyStateGuide';
import NinhadaListCard from '@/components/ninhadas/NinhadaListCard';

export default async function NinhadasPage({
  searchParams,
}: {
  searchParams: { linhagem?: string; status?: string };
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: linhagens }] = await Promise.all([
    supabase.from('linhagens').select('*').order('nome'),
  ]);

  let query = supabase
    .from('ninhadas')
    .select('*, linhagem:linhagens(nome), pai:individuos!pai_id(codigo), mae:individuos!mae_id(codigo)')
    .order('data_nascimento', { ascending: false });

  if (params.linhagem) query = query.eq('linhagem_id', params.linhagem);
  if (params.status) query = query.eq('status', params.status);

  const { data: ninhadas } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ninhadas em Curso</h1>
          <p className="text-slate-500 font-medium">Acompanhamento de alevinos e taxas de seleção</p>
        </div>
        {ninhadas && ninhadas.length > 0 && (
          <Link 
            href="/ninhadas/nova" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            Nova Ninhada
          </Link>
        )}
      </div>

      {ninhadas && ninhadas.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          </div>
          
          <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
            <option value="">Todas Linhagens</option>
            {linhagens?.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>

          <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
            <option value="">Status: Ativas</option>
            <option value="ativa">Ativa</option>
            <option value="finalizada">Finalizada</option>
            <option value="perdida">Perdida</option>
          </select>
        </div>
      )}

      {ninhadas && ninhadas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ninhadas.map((n: any) => (
            <NinhadaListCard key={n.id} n={n} />
          ))}
        </div>
      ) : (
        <EmptyStateGuide 
          title="Nenhuma ninhada em curso"
          description="O último passo é registrar o cruzamento e acompanhar o desenvolvimento dos alevinos."
          currentStep={4}
        />
      )}
    </div>
  );
}
