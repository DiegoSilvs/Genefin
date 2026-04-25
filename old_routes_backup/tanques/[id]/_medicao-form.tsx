'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { addMedicao } from '@/lib/db';

export function MedicaoForm({ tankId }: { tankId: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const fd = new FormData(e.currentTarget);
    try {
      await addMedicao({
        tankId,
        ph: parseFloat(fd.get('ph') as string),
        temp: parseFloat(fd.get('temp') as string),
        amonia: fd.get('amonia') ? parseFloat(fd.get('amonia') as string) : undefined,
        nitrito: fd.get('nitrito') ? parseFloat(fd.get('nitrito') as string) : undefined,
        nitrato: fd.get('nitrato') ? parseFloat(fd.get('nitrato') as string) : undefined,
        nota: fd.get('nota') as string || undefined,
      });
      window.location.reload();
    } catch (err) {
      alert('Erro ao registrar medição: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={18} />
        Nova Medição
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Registrar Parâmetros</h2>
              <button onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="ph">pH</label>
                  <input id="ph" name="ph" type="number" step="0.1" placeholder="ex: 7.2" required />
                </div>
                <div className="form-group">
                  <label htmlFor="temp">Temperatura (°C)</label>
                  <input id="temp" name="temp" type="number" step="0.1" placeholder="ex: 26.5" required />
                </div>
                <div className="form-group">
                  <label htmlFor="amonia">Amônia (ppm)</label>
                  <input id="amonia" name="amonia" type="number" step="0.01" placeholder="ex: 0.25" />
                </div>
                <div className="form-group">
                  <label htmlFor="nitrito">Nitrito (ppm)</label>
                  <input id="nitrito" name="nitrito" type="number" step="0.01" />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="nota">Notas de Observação</label>
                <textarea id="nota" name="nota" placeholder="Algas, turbidez, comportamento dos peixes..." />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Gravando...' : 'Salvar Medição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
