'use client';

import React, { useState } from 'react';
import { registrarEventoNinhada, promoverAlevinos } from '@/lib/actions/ninhadas';
import { Sexo } from '@/lib/types';
import { X, Save, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ninhadaId: string;
}

export function ModalSelecao({ isOpen, onClose, ninhadaId }: ModalProps) {
  const [quantidade, setQuantidade] = useState('');
  const [criterio, setCriterio] = useState('tamanho abaixo do padrão');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await registrarEventoNinhada(ninhadaId, 'selecao', parseInt(quantidade), criterio);
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-50">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <TrendingUp size={20} /> Registrar Seleção
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-group">
            <label>Quantidade Descartada</label>
            <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required min="1" />
          </div>
          <div className="form-group">
            <label>Critério de Descarte</label>
            <select value={criterio} onChange={(e) => setCriterio(e.target.value)}>
              <option value="tamanho abaixo do padrão">Tamanho abaixo do padrão</option>
              <option value="coloração fora">Coloração fora do padrão</option>
              <option value="deformidade">Deformidade física</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Seleção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalMorte({ isOpen, onClose, ninhadaId }: ModalProps) {
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await registrarEventoNinhada(ninhadaId, 'morte', parseInt(quantidade), 'Morte súbita / Doença');
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} /> Registrar Baixa (Morte)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-group">
            <label>Quantidade de Baixas</label>
            <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required min="1" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn btn-danger flex-1" disabled={loading}>
              {loading ? 'Registrar...' : 'Confirmar Mortes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalPromocao({ isOpen, onClose, ninhadaId }: ModalProps) {
  const [alevinos, setAlevinos] = useState([{ sexo: 'I' as Sexo, nome_popular: '' }]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const addAlevino = () => setAlevinos([...alevinos, { sexo: 'I', nome_popular: '' }]);
  const removeAlevino = (i: number) => setAlevinos(alevinos.filter((_, idx) => idx !== i));
  const updateAlevino = (i: number, field: any, value: any) => {
    const newA = [...alevinos];
    (newA[i] as any)[field] = value;
    setAlevinos(newA);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await promoverAlevinos(ninhadaId, alevinos);
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h3 className="font-bold text-indigo-800 flex items-center gap-2">
            <TrendingUp size={20} /> Promover para Reprodutores
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {alevinos.map((a, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl relative space-y-4">
              <button 
                type="button" 
                onClick={() => removeAlevino(i)} 
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-[10px]">Sexo</label>
                  <select value={a.sexo} onChange={(e) => updateAlevino(i, 'sexo', e.target.value)}>
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                    <option value="I">Indeterminado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px]">Nome Popular (Opcional)</label>
                  <input value={a.nome_popular} onChange={(e) => updateAlevino(i, 'nome_popular', e.target.value)} placeholder="Ex: Matriz 01" />
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addAlevino}
            className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-indigo-200 hover:text-indigo-500 transition-colors"
          >
            + Adicionar outro indivíduo
          </button>
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Processando...' : 'Finalizar Promoção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
