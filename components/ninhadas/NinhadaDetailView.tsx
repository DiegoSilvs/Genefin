'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Baby, 
  Heart, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  History,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { ModalSelecao, ModalMorte, ModalPromocao } from '../modals/NinhadaModals';

export default function NinhadaDetailView({ ninhada, eventos, promovidos }: any) {
  const [modal, setModal] = useState<'selecao' | 'morte' | 'promocao' | null>(null);

  const idadeDias = Math.floor((new Date().getTime() - new Date(ninhada.data_nascimento).getTime()) / (1000 * 60 * 60 * 24));
  const taxaAprovacao = ((ninhada.total_atual / ninhada.total_nascidos) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ninhadas" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{ninhada.codigo}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                ninhada.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {ninhada.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold mt-1">
              <Heart size={16} className="text-red-400" />
              <span>{ninhada.pai?.codigo} × {ninhada.mae?.codigo}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setModal('selecao')} className="btn btn-primary bg-teal-600 hover:bg-teal-700">
            <TrendingUp size={18} /> Seleção
          </button>
          <button onClick={() => setModal('morte')} className="btn btn-outline text-red-500 border-red-100 hover:bg-red-50">
            <AlertTriangle size={18} /> Morte
          </button>
          <button onClick={() => setModal('promocao')} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700">
            <Award size={18} /> Promover
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Calendar size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Idade</p>
            <p className="text-xl font-black text-slate-900">{idadeDias} dias</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><MapPin size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Aquário</p>
            <p className="text-xl font-black text-slate-900">{ninhada.estrutura?.nome}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-500 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Atual</p>
            <p className="text-xl font-black text-slate-900">{ninhada.total_atual}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Taxa Aprovação</p>
            <p className="text-xl font-black text-slate-900">{taxaAprovacao}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl text-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nascidos</p>
              <p className="text-2xl font-black">{ninhada.total_nascidos}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descartados</p>
              <p className="text-2xl font-black text-amber-600">{ninhada.total_descartado}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baixas</p>
              <p className="text-2xl font-black text-red-600">{ninhada.total_morto}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Promovidos</p>
              <p className="text-2xl font-black text-indigo-600">{ninhada.total_promovido}</p>
            </div>
          </div>

          {/* Histórico de Eventos */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <History size={20} className="text-slate-400" />
              <h2 className="font-black text-slate-800 uppercase tracking-tight">Histórico da Ninhada</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {eventos && eventos.length > 0 ? (
                eventos.map((ev: any) => (
                  <div key={ev.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className={`p-2 rounded-lg ${
                        ev.tipo === 'selecao' ? 'bg-amber-50 text-amber-600' :
                        ev.tipo === 'morte' ? 'bg-red-50 text-red-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {ev.tipo === 'selecao' ? <TrendingUp size={18} /> : ev.tipo === 'morte' ? <AlertTriangle size={18} /> : <Award size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 capitalize">{ev.tipo}</h4>
                        <p className="text-xs text-slate-500">{ev.critério || 'Registro manual'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">-{ev.quantidade}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(ev.data_evento).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 italic">
                  Nenhum evento registrado ainda. Comece realizando a primeira seleção.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Reprodutores Promovidos */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="font-black text-indigo-900 text-sm uppercase tracking-widest">Novos Reprodutores</h2>
            </div>
            <div className="p-4 space-y-3">
              {promovidos && promovidos.length > 0 ? (
                promovidos.map((p: any) => (
                  <Link key={p.id} href={`/individuos/${p.id}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Award size={16} className="text-indigo-400" />
                      <span className="font-bold text-slate-700 text-sm">{p.codigo}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${p.sexo === 'M' ? 'text-blue-500' : 'text-pink-500'}`}>
                      {p.sexo}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-8 italic">Nenhum peixe desta ninhada foi promovido ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalSelecao isOpen={modal === 'selecao'} onClose={() => setModal(null)} ninhadaId={ninhada.id} />
      <ModalMorte isOpen={modal === 'morte'} onClose={() => setModal(null)} ninhadaId={ninhada.id} />
      <ModalPromocao isOpen={modal === 'promocao'} onClose={() => setModal(null)} ninhadaId={ninhada.id} />
    </div>
  );
}
