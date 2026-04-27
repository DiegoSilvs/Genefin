'use client';

import React, { useState, useMemo } from 'react';
import { saveMedicaoAgua } from '@/lib/actions/agua';
import { Estrutura, MedicaoAgua, Especie } from '@/lib/types';
import { 
  Droplets, 
  Thermometer, 
  FlaskConical, 
  Save, 
  History, 
  AlertCircle,
  Activity,
  CheckCircle2,
  Search,
  Pencil,
  X
} from 'lucide-react';
import { updateMedicaoAgua } from '@/lib/actions/agua';

interface WaterQualityClientProps {
  estruturas: (Estrutura & { linhagem: { especie: Especie } | null })[];
  medicoesIniciais: MedicaoAgua[];
}

export default function WaterQualityClient({ estruturas, medicoesIniciais }: WaterQualityClientProps) {
  const [selectedId, setSelectedId] = useState(estruturas[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingMedicao, setEditingMedicao] = useState<MedicaoAgua | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const selectedEstrutura = useMemo(() => 
    estruturas.find(e => e.id === selectedId), 
  [selectedId, estruturas]);

  const selectedMedicoes = useMemo(() => 
    medicoesIniciais.filter(m => m.estrutura_id === selectedId).slice(0, 10),
  [selectedId, medicoesIniciais]);

  const especie = selectedEstrutura?.linhagem?.especie;

  const checkStatus = (val: any, min: any, max: any, type?: 'ph' | 'temp') => {
    // Regra Crítica: converter para número antes de comparar
    const v = val !== null && val !== undefined && val !== '' ? parseFloat(val) : null;
    
    // Neutro/cinza: APENAS quando o valor for null ou undefined (ou vazio)
    if (v === null || isNaN(v)) return 'bg-slate-300';
    
    let mn = min !== null && min !== undefined && min !== '' ? parseFloat(min) : null;
    let mx = max !== null && max !== undefined && max !== '' ? parseFloat(max) : null;

    // BUG 1: Se a espécie não estiver disponível, usar faixas padrão
    if (mn === null && mx === null) {
      if (type === 'ph') {
        mn = 6.0;
        mx = 8.0;
      } else if (type === 'temp') {
        mn = 20.0;
        mx = 30.0;
      }
    }

    // Se ainda não houver limites (para outros parâmetros), mantemos cinza claro
    if (mn === null && mx === null) return 'bg-slate-200';
    
    const isWithin = (mn === null || v >= mn) && (mx === null || v <= mx);
    if (isWithin) return 'bg-green-500';

    // Amarelo se até 10% fora da faixa (baseado nos limites)
    const thresholdMin = mn !== null ? mn * 0.1 : 0;
    const thresholdMax = mx !== null ? mx * 0.1 : 0;

    const isClose = (mn === null || v >= mn - thresholdMin) && (mx === null || v <= mx + thresholdMax);
    return isClose ? 'bg-amber-500' : 'bg-red-500';
  };

  const getAmoniaStatus = (val: any) => {
    // Regra Crítica: converter para número antes de comparar
    const v = val !== null && val !== undefined && val !== '' ? parseFloat(val) : null;

    // Neutro/cinza: APENAS quando o valor for null ou undefined (ou vazio)
    if (v === null || isNaN(v)) return 'bg-slate-300';

    if (v <= 0.02) return 'bg-green-500';
    if (v <= 0.05) return 'bg-amber-500';
    return 'bg-red-500';
  };


  return (
    <div className="space-y-6">
      {/* 3. TELA ÁGUA: Seletor de aquário em destaque no topo */}
      <div className="bg-slate-900 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
              <Droplets size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Qualidade da Água</h1>
              <p className="text-slate-400 font-medium">Selecione o aquário para medir ou ver o histórico</p>
            </div>
          </div>
          
          <div className="relative min-w-[300px]">
            <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 text-white font-black rounded-2xl px-6 py-4 outline-none focus:ring-4 ring-blue-500/30 appearance-none text-lg cursor-pointer"
            >
              {estruturas.map(e => (
                <option key={e.id} value={e.id} className="text-slate-900">{e.nome} ({e.tipo})</option>
              ))}
            </select>
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Banner Verde com Faixa Ideal */}
        {especie && (
          <div className="bg-green-500/10 border-2 border-green-500/20 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="font-bold text-sm uppercase tracking-widest text-green-200">Faixa Ideal {especie.nome}:</span>
            </div>
            <div className="flex gap-8 font-black text-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs font-black uppercase">pH</span>
                <span>{especie.ph_min || '—'} a {especie.ph_max || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs font-black uppercase">Temp</span>
                <span>{especie.temp_min || '—'}°C a {especie.temp_max || '—'}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs font-black uppercase">Amônia</span>
                <span>0.0 ppm</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Medição */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" />
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest">Nova Medição</h2>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const formData = new FormData(e.currentTarget);
                try {
                  const res = await saveMedicaoAgua(formData);
                  if (res.success) {
                    (e.target as HTMLFormElement).reset();
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                  }
                } catch (error) {
                  console.error('Erro ao salvar:', error);
                } finally {
                  setLoading(false);
                }
              }} 
              className="p-8 space-y-6"
            >
              <input type="hidden" name="estrutura_id" value={selectedId} />
              
              {showSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 size={16} /> Medição salva!
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-xs font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest mb-2">
                    <FlaskConical size={14} /> pH
                  </label>
                  <input name="ph" type="number" step="0.1" placeholder="Ex: 7.2" required className="text-lg font-bold" />
                </div>
                <div className="form-group">
                  <label className="text-xs font-black text-orange-600 flex items-center gap-1 uppercase tracking-widest mb-2">
                    <Thermometer size={14} /> Temp. (°C)
                  </label>
                  <input name="temperatura" type="number" step="0.1" placeholder="Ex: 26.5" required className="text-lg font-bold" />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Amônia (ppm)</label>
                <input name="amonia" type="number" step="0.01" placeholder="Crítico: 0.0" className="text-lg font-bold" />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center mb-6">Opcionais</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase">Nitrito</label>
                    <input name="nitrito" type="number" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase">Nitrato</label>
                    <input name="nitrato" type="number" step="0.1" />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full btn btn-primary py-5 rounded-2xl shadow-xl shadow-blue-100 text-lg font-black"
                disabled={loading}
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Medição'}
              </button>
            </form>
          </div>
        </div>

        {/* Histórico com Indicadores de Cor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={24} className="text-slate-400" />
                <h2 className="font-black text-slate-800 text-xl tracking-tight">Histórico de Medições</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">Data / Hora</th>
                    <th className="p-6">pH</th>
                    <th className="p-6">Temperatura</th>
                    <th className="p-6">Amônia</th>
                    <th className="p-6">Nitrito</th>
                    <th className="p-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedMedicoes.length > 0 ? (
                    selectedMedicoes.map((m) => (
                      <tr key={m.id} className="text-base font-bold text-slate-700 hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <p className="text-slate-900">{new Date(m.data_medicao).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">{new Date(m.data_medicao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full shadow-inner ${checkStatus(m.ph, especie?.ph_min || null, especie?.ph_max || null, 'ph')}`}></div>
                            <span className="text-lg">{m.ph?.toFixed(1) || '—'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full shadow-inner ${checkStatus(m.temperatura, especie?.temp_min || null, especie?.temp_max || null, 'temp')}`}></div>
                            <span className="text-lg">{m.temperatura ? `${m.temperatura.toFixed(1)}°C` : '—'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full shadow-inner ${getAmoniaStatus(m.amonia)}`}></div>
                            <span className="text-lg">{m.amonia?.toFixed(2) ?? '—'}</span>
                          </div>
                        </td>
                        <td className="p-6 text-slate-400 font-medium">{m.nitrito?.toFixed(2) ?? '—'}</td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => setEditingMedicao(m)}
                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar medição"
                          >
                            <Pencil size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                        <Droplets size={48} className="mx-auto mb-4 opacity-10" />
                        Nenhuma medição registrada para este aquário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingMedicao && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Pencil size={20} className="text-blue-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Editar Medição</h3>
              </div>
              <button onClick={() => setEditingMedicao(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                const formData = new FormData(e.currentTarget);
                try {
                  const res = await updateMedicaoAgua(editingMedicao.id, formData);
                  if (res.success) {
                    setEditingMedicao(null);
                  }
                } finally {
                  setEditLoading(false);
                }
              }}
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">pH</label>
                  <input name="ph" type="number" step="0.1" defaultValue={editingMedicao.ph || ''} required />
                </div>
                <div className="form-group">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Temp. (°C)</label>
                  <input name="temperatura" type="number" step="0.1" defaultValue={editingMedicao.temperatura || ''} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase">Amônia</label>
                  <input name="amonia" type="number" step="0.01" defaultValue={editingMedicao.amonia || ''} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase">Nitrito</label>
                  <input name="nitrito" type="number" step="0.01" defaultValue={editingMedicao.nitrito || ''} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase">Nitrato</label>
                  <input name="nitrato" type="number" step="0.1" defaultValue={editingMedicao.nitrato || ''} />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Observações</label>
                <textarea 
                  name="observacoes" 
                  defaultValue={editingMedicao.observacoes || ''} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 min-h-[100px] outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingMedicao(null)}
                  className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] btn btn-primary py-4 rounded-2xl shadow-lg shadow-blue-100 font-black"
                  disabled={editLoading}
                >
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
