import React from 'react';
import Link from 'next/link';
import { Plus, Dna } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function LinhagensPage() {
  const supabase = await createClient();
  const { data: linhagens } = await supabase
    .from('linhagens')
    .select('*, especie:especies(nome, sigla)')
    .order('nome');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Linhagens</h1>
          <p className="text-slate-500 font-medium">Defina os padrões genéticos do seu plantel</p>
        </div>
        <Link 
          href="/linhagens/nova" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Nova Linhagem
        </Link>
      </div>

      {linhagens && linhagens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {linhagens.map((l: any) => (
            <div 
              key={l.id} 
              className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Dna size={28} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  l.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {l.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Código: {l.especie?.sigla}·{l.numero?.toString().padStart(3, '0')}
                </p>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{l.nome}</h3>
                <p className="text-sm font-bold text-indigo-600">{l.especie?.nome}</p>
              </div>

              <p className="text-sm text-slate-500 mt-4 line-clamp-2 italic">
                {l.descricao || 'Sem descrição detalhada.'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center max-w-4xl mx-auto">
          <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300 mb-6">
            <Dna size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Nenhuma linhagem cadastrada</h3>
          <p className="text-slate-500 font-medium mb-10">Cadastre linhagens para organizar seus peixes por características genéticas e gerar códigos automáticos.</p>
          <Link 
            href="/linhagens/nova" 
            className="btn btn-primary px-10 py-4 font-black"
          >
            Cadastrar Primeira Linhagem
          </Link>
        </div>
      )}
    </div>
  );
}
