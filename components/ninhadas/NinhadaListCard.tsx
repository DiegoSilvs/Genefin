'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Baby, Heart, ArrowRight, TrendingUp, Award, Calendar } from 'lucide-react';
import { ModalSelecao, ModalPromocao } from '../modals/NinhadaModals';

export default function NinhadaListCard({ n }: { n: any }) {
  const [modal, setModal] = useState<'selecao' | 'promocao' | null>(null);

  const idade = Math.floor((new Date().getTime() - new Date(n.data_nascimento).getTime()) / (1000 * 60 * 60 * 24));
  const taxaSobrevivencia = n.total_nascidos > 0 ? (n.total_atual / n.total_nascidos) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
      <div className="p-6 space-y-4 flex-1">
        <div className="flex justify-between items-start">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Baby size={28} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Idade</p>
            <div className="flex items-center gap-1 justify-end">
              <Calendar size={14} className="text-slate-400" />
              <p className="text-xl font-black text-slate-900">{idade} dias</p>
            </div>
          </div>
        </div>

        <Link href={`/ninhadas/${n.id}`}>
          <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{n.codigo}</h3>
          <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-wider">{n.linhagem?.nome}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-2">
            <Heart size={14} className="text-red-300" />
            <span>{n.pai?.codigo} × {n.mae?.codigo}</span>
          </div>
        </Link>

        {/* Barra de Sobrevivência */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Sobrevivência</span>
            <span className="text-indigo-600">{taxaSobrevivencia.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
              style={{ width: `${taxaSobrevivencia}%` }}
            />
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="text-center p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Nasc.</p>
            <p className="font-black text-slate-900">{n.total_nascidos}</p>
          </div>
          <div className="text-center p-2 bg-indigo-50 rounded-xl">
            <p className="text-[10px] font-bold text-indigo-400 uppercase">Atual</p>
            <p className="font-black text-indigo-600">{n.total_atual}</p>
          </div>
          <div className="text-center p-2 bg-teal-50 rounded-xl">
            <p className="text-[10px] font-bold text-teal-400 uppercase">Prom.</p>
            <p className="font-black text-teal-600">{n.total_promovido}</p>
          </div>
        </div>
      </div>
      
      {/* Ações Rápidas */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button 
          onClick={() => setModal('selecao')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 hover:text-amber-700 transition-colors"
        >
          <TrendingUp size={14} /> Seleção
        </button>
        <button 
          onClick={() => setModal('promocao')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
        >
          <Award size={14} /> Promover
        </button>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
        <span className={`text-[10px] font-black uppercase tracking-wider ${
          n.status === 'ativa' ? 'text-green-600' : 'text-slate-400'
        }`}>
          {n.status}
        </span>
        <Link href={`/ninhadas/${n.id}`} className="text-slate-300 group-hover:text-indigo-500">
          <ArrowRight size={16} />
        </Link>
      </div>

      <ModalSelecao isOpen={modal === 'selecao'} onClose={() => setModal(null)} ninhadaId={n.id} />
      <ModalPromocao isOpen={modal === 'promocao'} onClose={() => setModal(null)} ninhadaId={n.id} />
    </div>
  );
}
