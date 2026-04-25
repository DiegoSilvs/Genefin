'use client';

import React, { useState } from 'react';
import { Activity, ArrowRightLeft, X } from 'lucide-react';
import { updateIndividuoStatus, moveIndividuo } from '@/lib/actions/individuos';
import { StatusIndividuo, Estrutura } from '@/lib/types';

interface IndividuoActionsClientProps {
  individuoId: string;
  currentStatus: StatusIndividuo;
  currentEstruturaId: string | null;
  estruturas: Estrutura[];
}

export default function IndividuoActionsClient({ 
  individuoId, 
  currentStatus, 
  currentEstruturaId, 
  estruturas 
}: IndividuoActionsClientProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as StatusIndividuo;
    
    try {
      await updateIndividuoStatus(individuoId, status);
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const estruturaId = formData.get('estrutura_id') as string || null;
    
    try {
      await moveIndividuo(individuoId, estruturaId === '' ? null : estruturaId);
      setIsMoveModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao mover indivíduo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsMoveModalOpen(true)}
          className="btn btn-outline"
        >
          <ArrowRightLeft size={18} /> Mover
        </button>
        <button 
          onClick={() => setIsStatusModalOpen(true)}
          className="btn btn-primary"
        >
          <Activity size={18} /> Alterar Status
        </button>
      </div>

      {/* Modal Status */}
      {isStatusModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Alterar Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-8 space-y-4">
              <div className="form-group">
                <label>Selecione o novo status</label>
                <select name="status" defaultValue={currentStatus} required>
                  <option value="ativo">Ativo</option>
                  <option value="morto">Morto</option>
                  <option value="vendido">Vendido</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="btn btn-outline flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Salvando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mover */}
      {isMoveModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Mover para Aquário</h3>
              <button onClick={() => setIsMoveModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleMove} className="p-8 space-y-4">
              <div className="form-group">
                <label>Selecione o destino</label>
                <select name="estrutura_id" defaultValue={currentEstruturaId || ''} required>
                  <option value="">Nenhum</option>
                  {estruturas.map(e => (
                    <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsMoveModalOpen(false)} className="btn btn-outline flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Movendo...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
