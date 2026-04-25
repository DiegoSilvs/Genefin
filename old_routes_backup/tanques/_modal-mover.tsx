'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Info, AlertTriangle } from 'lucide-react';
import { Peixe, Tanque } from '@/lib/types';
import { getMovementData, submitMovement } from './_mover-actions';

export function MoverPeixeModal({ 
  tankId, 
  onClose,
  onSuccess 
}: { 
  tankId: string; 
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [peixes, setPeixes] = useState<Peixe[]>([]);
  const [tanques, setTanques] = useState<Tanque[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMovementData(tankId);
        setPeixes(data.peixes);
        setTanques(data.tanques);
      } catch (err) {
        setError('Erro ao carregar dados para movimentação.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tankId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('currentTankId', tankId);

    try {
      await submitMovement(formData);
      onSuccess(`Peixe transferido com sucesso!`);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
        <p>Carregando inventário...</p>
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={20} className="text-primary" />
              Mover Peixe
            </h2>
            <p className="modal-subtitle">Transfira um exemplar para outro ambiente</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: '#f1f5f9' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="validation-error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {peixes.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>Este tanque não possui peixes ativos para mover.</p>
            <button onClick={onClose} className="btn btn-outline" style={{ marginTop: '1rem' }}>Sair</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="peixeId">Selecione o Peixe</label>
              <select id="peixeId" name="peixeId" required>
                <option value="">Selecione...</option>
                {peixes.map(p => (
                  <option key={p.id} value={p.id}>{p.codigoVisivel} — {p.linhagem} ({p.sexo})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="destinoId">Tanque de Destino</label>
              <select id="destinoId" name="destinoId" required>
                <option value="">Selecione...</option>
                {tanques.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} (Vaga: {t.capacidadeBiologica - (t.peixesCount || 0)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="motivo">Motivo da Movimentação</label>
              <select id="motivo" name="motivo" required>
                <option value="">Selecione um motivo...</option>
                <option value="crescimento">Transferência p/ Crescimento</option>
                <option value="reproducao">Início de Reprodução</option>
                <option value="quarentena">Entrada em Quarentena</option>
                <option value="tratamento">Tratamento de Saúde</option>
                <option value="venda">Preparação p/ Venda</option>
                <option value="outro">Outro (especificar nas notas)</option>
              </select>
            </div>

            <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Info size={16} style={{ color: '#1d4ed8', flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.4 }}>
                Esta ação é <strong>irreversível</strong> e será registrada no histórico de ambos os tanques para fins de biosegurança.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <ArrowRightLeft size={18} />
                {submitting ? 'Transferindo...' : 'Confirmar Transferência'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
