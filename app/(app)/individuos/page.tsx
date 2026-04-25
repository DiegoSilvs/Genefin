import React from 'react';
import Link from 'next/link';
import { Plus, Fish, Filter, Search, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyStateGuide from '@/components/ui/EmptyStateGuide';

export default async function IndividuosPage({
  searchParams,
}: {
  searchParams: { linhagem?: string; especie?: string; sexo?: string; status?: string };
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Buscar filtros para o cabeçalho
  const [
    { data: especies },
    { data: linhagens }
  ] = await Promise.all([
    supabase.from('especies').select('*').order('nome'),
    supabase.from('linhagens').select('*').order('nome')
  ]);

  // Construir query de indivíduos
  let query = supabase
    .from('individuos')
    .select('*, especie:especies(nome), linhagem:linhagens(nome)')
    .order('created_at', { ascending: false });

  if (params.especie) query = query.eq('especie_id', params.especie);
  if (params.linhagem) query = query.eq('linhagem_id', params.linhagem);
  if (params.sexo) query = query.eq('sexo', params.sexo);
  if (params.status) query = query.eq('status', params.status);

  const { data: individuos } = await query;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plantel de Reprodutores</h1>
          <p className="text-slate-500 font-medium">Gestão genética e controle de matrizes</p>
        </div>
        {individuos && individuos.length > 0 && (
          <Link 
            href="/individuos/novo" 
            className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 font-bold shadow-lg shadow-slate-200"
          >
            <Plus size={20} />
            Novo Indivíduo
          </Link>
        )}
      </div>

      {/* Barra de Filtros */}
      {individuos && individuos.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          </div>
          
          <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 ring-teal-500/20">
            <option value="">Todas Espécies</option>
            {especies?.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>

          <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 ring-teal-500/20">
            <option value="">Todas Linhagens</option>
            {linhagens?.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>

          <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 ring-teal-500/20">
            <option value="">Todos Sexos</option>
            <option value="M">Macho</option>
            <option value="F">Fêmea</option>
            <option value="I">Indeterminado</option>
          </select>

          <div className="flex-1 min-w-[200px] relative">
            <input 
              placeholder="Buscar por código ou nome..." 
              className="w-full bg-slate-50 border-none text-xs font-bold rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 ring-teal-500/20"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      )}

      {/* Grid de Indivíduos */}
      {individuos && individuos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {individuos.map((i: any) => (
            <Link 
              key={i.id} 
              href={`/individuos/${i.id}`}
              className="bg-white rounded-3xl border-2 border-slate-100 hover:shadow-xl hover:border-indigo-500/30 transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl transition-all ${
                    i.sexo === 'M' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 
                    i.sexo === 'F' ? 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white' : 
                    'bg-slate-100 text-slate-500 group-hover:bg-slate-500 group-hover:text-white'
                  }`}>
                    <Fish size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Geração</p>
                    <p className="text-2xl font-black text-slate-900">G{i.geracao}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{i.codigo}</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-wider">
                    {i.linhagem?.nome}
                  </p>
                  {i.nome_popular && (
                    <p className="text-xs font-medium text-slate-400 italic mt-1">"{i.nome_popular}"</p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Espécie</p>
                  <p className="text-sm font-bold text-slate-700">{i.especie?.nome}</p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i.status === 'ativo' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {i.status}
                  </span>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyStateGuide 
          title="Nenhum peixe cadastrado"
          description="Cadastre seus reprodutores e matrizes para começar a gerar linhagens."
          currentStep={3}
        />
      )}
    </div>
  );
}
