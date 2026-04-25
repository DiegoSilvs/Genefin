'use client';

import React from 'react';
import { Dna, Trash2, Archive } from 'lucide-react';
import { deleteLinhagem, archiveLinhagem } from '@/lib/actions/linhagens';

interface Linhagem {
  id: string;
  nome: string;
  numero: number;
  descricao: string | null;
  ativa: boolean;
  especie?: {
    nome: string;
    sigla: string;
  };
}

export default function LinhagensClient({ linhagens }: { linhagens: Linhagem[] }) {
  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a linhagem "${nome}"?`)) return;

    const result = await deleteLinhagem(id);
    if (result?.error) {
      alert(result.error);
    }
  };

  const handleArchive = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja arquivar a linhagem "${nome}"? Ela deixará de aparecer em novos registros.`)) return;
    await archiveLinhagem(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {linhagens.map((l) => (
        <div 
          key={l.id} 
          className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
              <Dna size={28} />
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              l.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {l.ativa ? 'Ativa' : 'Arquivada'}
            </span>
          </div>
          
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Código: {l.especie?.sigla}·{l.numero?.toString().padStart(3, '0')}
            </p>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">{l.nome}</h3>
            <p className="text-sm font-bold text-indigo-600">{l.especie?.nome}</p>
            
            <p className="text-sm text-slate-500 mt-4 line-clamp-2 italic">
              {l.descricao || 'Sem descrição detalhada.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
            {l.ativa && (
              <button 
                onClick={() => handleArchive(l.id, l.nome)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Archive size={14} /> Arquivar
              </button>
            )}
            <button 
              onClick={() => handleDelete(l.id, l.nome)}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
