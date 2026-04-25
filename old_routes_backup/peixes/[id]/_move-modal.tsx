'use client';

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { registrarMovimentacao } from '@/lib/db';
import { Tanque } from '@/lib/types';

export function MoveFishModal({ peixeId, currentTankId, tanques }: { peixeId: string; currentTankId: string; tanques: Tanque[] }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [destinoId, setDestinoId] = useState('');

  const handleMove = async () => {
    if (!destinoId) return;
    setSaving(true);
    try {
      await registrarMovimentacao(peixeId, destinoId, 'Manejo de rotina');
      window.location.reload();
    } catch (err) {
      alert('Erro ao mover peixe: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }} onClick={() => setOpen(true)}>
        <RefreshCw size={14} />
        Trocar Bacia
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Mover Peixe</h2>
              <button onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
               <label>Selecione o Tanque de Destino</label>
               <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} style={{ marginTop: '0.5rem' }}>
                  <option value="">Selecione...</option>
                  {tanques.filter(t => t.id !== currentTankId).map(t => (
                    <option key={t.id} value={t.id}>{t.id} — {t.nome || t.tipo}</option>
                  ))}
               </select>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '1rem' }}>
              Esta ação será registrada no histórico de rastreabilidade do peixe.
            </p>

            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleMove} disabled={saving || !destinoId}>
                {saving ? 'Movendo...' : 'Confirmar Mudança'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
