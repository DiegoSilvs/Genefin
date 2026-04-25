import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  Dna, 
  Calendar, 
  MapPin, 
  ArrowRightLeft, 
  Activity,
  History,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { updateIndividuoStatus, moveIndividuo } from '@/lib/actions/individuos';

export default async function IndividuoPerfilPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  // Buscar indivíduo com relações
  const { data: individuo } = await supabase
    .from('individuos')
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

  if (!individuo) notFound();

  // Buscar ninhadas onde é pai ou mãe
  const { data: ninhadas } = await supabase
    .from('ninhadas')
    .select('*')
    .or(`pai_id.eq.${id},mae_id.eq.${id}`)
    .order('data_nascimento', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700';
      case 'morto': return 'bg-red-100 text-red-700';
      case 'vendido': return 'bg-blue-100 text-blue-700';
      case 'descartado': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/individuos" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{individuo.codigo}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(individuo.status)}`}>
                {individuo.status}
              </span>
            </div>
            {individuo.nome_popular && <p className="text-xl text-slate-500 font-medium">{individuo.nome_popular}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Ações Rápidas (Simuladas) */}
          <button className="btn btn-outline">
            <ArrowRightLeft size={18} /> Mover
          </button>
          <button className="btn btn-primary">
            <Activity size={18} /> Alterar Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Info e Pedigree */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card de Informações Gerais */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Info size={18} /> Detalhes Genéticos
              </h2>
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Espécie</p>
                <p className="font-bold text-slate-900">{individuo.especie?.nome}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Linhagem</p>
                <p className="font-bold text-slate-900">{individuo.linhagem?.nome}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Geração</p>
                <p className="font-bold text-slate-900">G{individuo.geracao}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">COI</p>
                <p className="font-bold text-teal-600">—</p>
              </div>
            </div>
          </div>

          {/* Pedigree Visual Simples */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
              <Dna size={18} /> Pedigree (Árvore Genealógica)
            </h2>
            
            <div className="flex flex-col items-center gap-8 relative">
              {/* Pais */}
              <div className="flex gap-12 w-full justify-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Pai</p>
                  {individuo.pai ? (
                    <Link href={`/individuos/${individuo.pai.id}`} className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center hover:bg-blue-100 transition-colors">
                      <p className="font-bold text-blue-700">{individuo.pai.codigo}</p>
                      <p className="text-[10px] text-blue-600">{individuo.pai.nome_popular || '—'}</p>
                    </Link>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                      Externo / Desconhecido
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] uppercase font-bold text-pink-500 tracking-widest">Mãe</p>
                  {individuo.mae ? (
                    <Link href={`/individuos/${individuo.mae.id}`} className="p-4 bg-pink-50 border border-pink-100 rounded-xl text-center hover:bg-pink-100 transition-colors">
                      <p className="font-bold text-pink-700">{individuo.mae.codigo}</p>
                      <p className="text-[10px] text-pink-600">{individuo.mae.nome_popular || '—'}</p>
                    </Link>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                      Externo / Desconhecida
                    </div>
                  )}
                </div>
              </div>

              {/* Conector Visual (Simples) */}
              <div className="h-8 w-px bg-slate-200"></div>

              {/* O Próprio Indivíduo */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl text-center shadow-lg transform scale-110">
                <p className="font-black text-lg tracking-tight">{individuo.codigo}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Este Indivíduo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Status e Histórico */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Localização</p>
                <p className="font-bold text-slate-900">{individuo.estrutura?.nome || 'Não definido'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nascimento</p>
                <p className="font-bold text-slate-900">
                  {individuo.data_nascimento ? new Date(individuo.data_nascimento).toLocaleDateString() : 'Não informada'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Características</p>
              <div className="grid gap-2">
                {individuo.fenotipo && Object.entries(individuo.fenotipo).length > 0 ? (
                  Object.entries(individuo.fenotipo).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                      <span className="text-slate-500 capitalize">{k}:</span>
                      <span className="font-bold text-slate-700">{v}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma característica registrada.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <h3 className="font-bold text-slate-700 text-sm">Histórico Reprodutivo</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {ninhadas && ninhadas.length > 0 ? (
                ninhadas.map(n => (
                  <Link key={n.id} href={`/ninhadas/${n.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 text-sm">{n.codigo}</span>
                      <span className="text-[10px] text-slate-400">{new Date(n.data_nascimento).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500">Total: {n.total_nascidos} alevinos</p>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  Nenhuma ninhada registrada para este indivíduo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
