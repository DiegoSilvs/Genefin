'use client';

import React, { useState } from 'react';
import { 
  Sprout, 
  Package, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Thermometer, 
  Target,
  AlertTriangle,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { createLoteAlimento, updateEstoqueInsumo, updateLoteStatus } from '@/lib/actions/alimentos';
import { LoteAlimento, EstoqueInsumo, Estrutura } from '@/lib/types';

interface AlimentosClientProps {
  lotes: LoteAlimento[];
  estoque: EstoqueInsumo[];
  estruturas: Estrutura[];
}

export default function AlimentosClient({ lotes, estoque, estruturas }: AlimentosClientProps) {
  const [activeTab, setActiveTab] = useState<'lotes' | 'estoque'>('lotes');
  const [isLoteModalOpen, setIsLoteModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState<{ id: string, type: 'entrada' | 'saida' } | null>(null);
  const [loading, setLoading] = useState(false);

  const agora = new Date();

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex justify-between items-center">
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex gap-1">
          <button 
            onClick={() => setActiveTab('lotes')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'lotes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Sprout size={18} /> Lotes Ativos
          </button>
          <button 
            onClick={() => setActiveTab('estoque')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'estoque' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Package size={18} /> Estoque
          </button>
        </div>

        {activeTab === 'lotes' ? (
          <button onClick={() => setIsLoteModalOpen(true)} className="btn btn-primary bg-teal-600 hover:bg-teal-700 font-bold">
            <Plus size={20} /> Novo Lote
          </button>
        ) : (
          <button className="btn btn-outline font-bold">
            <Plus size={20} /> Novo Insumo
          </button>
        )}
      </div>

      {activeTab === 'lotes' ? (
        /* ABA 1: LOTES ATIVOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotes.length > 0 ? (
            lotes.map((lote) => {
              const fimUso = new Date(lote.janela_uso_fim || '');
              const inicioUso = new Date(lote.janela_uso_inicio || '');
              const isUrgent = lote.status === 'preparando' && 
                               inicioUso.getTime() < agora.getTime() + (2 * 60 * 60 * 1000) &&
                               inicioUso.getTime() > agora.getTime();

              return (
                <div key={lote.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`p-3 rounded-xl ${
                        lote.status === 'pronto' ? 'bg-green-50 text-green-600' : 
                        lote.status === 'em_uso' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <Sprout size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg uppercase leading-none">{lote.codigo}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 capitalize">{lote.tipo}</p>
                      </div>
                    </div>
                    {isUrgent && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded animate-pulse">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Janela de Uso</p>
                        <p className="font-bold">
                          {inicioUso.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} às {fimUso.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-xs font-normal text-slate-400 ml-1">({fimUso.toLocaleDateString()})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Target size={16} className="text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino</p>
                        <p className="font-bold">
                          {estruturas.find(e => e.id === lote.estrutura_destino_id)?.nome || 'Não definido'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lote.status}
                    </span>
                    <div className="flex gap-2">
                      {lote.status === 'preparando' && (
                        <button 
                          onClick={() => updateLoteStatus(lote.id, 'pronto')}
                          className="text-[10px] font-black text-green-600 hover:underline"
                        >
                          MARCAR PRONTO
                        </button>
                      )}
                      {lote.status === 'pronto' && (
                        <button 
                          onClick={() => updateLoteStatus(lote.id, 'em_uso')}
                          className="text-[10px] font-black text-blue-600 hover:underline"
                        >
                          INICIAR USO
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-12 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">
              Nenhum lote ativo em cultivo no momento.
            </div>
          )}
        </div>
      ) : (
        /* ABA 2: ESTOQUE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Insumo</th>
                <th className="p-6">Quantidade Atual</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estoque.map((insumo) => {
                const isLow = insumo.quantidade_minima && insumo.quantidade_atual <= insumo.quantidade_minima;
                return (
                  <tr key={insumo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-slate-900">{insumo.nome}</p>
                      <p className="text-xs text-slate-500 capitalize">{insumo.tipo.replace('_', ' ')}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-xl font-black text-slate-900">{insumo.quantidade_atual}</span>
                      <span className="text-xs font-bold text-slate-400 ml-1">{insumo.unidade}</span>
                    </td>
                    <td className="p-6">
                      {isLow ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase">
                          <AlertTriangle size={14} /> Estoque Baixo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                          <CheckCircle2 size={14} /> Normal
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsStockModalOpen({ id: insumo.id, type: 'entrada' })}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Entrada"
                        >
                          <ArrowDownLeft size={20} />
                        </button>
                        <button 
                          onClick={() => setIsStockModalOpen({ id: insumo.id, type: 'saida' })}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Saída"
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Lote */}
      {isLoteModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-50">
              <h3 className="font-bold text-teal-800 flex items-center gap-2">
                <Sprout size={20} /> Iniciar Novo Cultivo
              </h3>
              <button onClick={() => setIsLoteModalOpen(false)}><X size={20} /></button>
            </div>
            <form action={createLoteAlimento} onSubmit={() => {setLoading(true); setIsLoteModalOpen(false);}} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label>Tipo de Alimento</label>
                  <select name="tipo" required>
                    <option value="artemia">Artêmia</option>
                    <option value="infusorio">Infusório</option>
                    <option value="dafnia">Dáfnia</option>
                    <option value="minhoca_branca">Minhoca Branca</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Temp. Cultivo (°C)</label>
                  <input name="temperatura_cultivo" type="number" step="0.1" defaultValue="27" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label>Qtd. Insumo</label>
                  <input name="quantidade_insumo" type="number" step="0.1" required />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select name="unidade">
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="colher">Colher</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Aquário de Destino</label>
                <select name="estrutura_destino_id">
                  <option value="">Nenhum específico</option>
                  {estruturas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsLoteModalOpen(false)} className="btn btn-outline flex-1">Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1">Iniciar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Estoque (Simplificado para o exemplo) */}
      {isStockModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              {isStockModalOpen.type === 'entrada' ? <ArrowDownLeft className="text-green-500" /> : <ArrowUpRight className="text-red-500" />}
              Registrar {isStockModalOpen.type}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const val = (e.target as any).quantidade.value;
              await updateEstoqueInsumo(isStockModalOpen.id, parseFloat(val), isStockModalOpen.type);
              setIsStockModalOpen(null);
            }} className="space-y-4">
              <div className="form-group">
                <label>Quantidade</label>
                <input name="quantidade" type="number" step="0.1" required autoFocus />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsStockModalOpen(null)} className="btn btn-outline flex-1">Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
