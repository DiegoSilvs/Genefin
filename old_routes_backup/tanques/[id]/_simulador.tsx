'use client';

import { useState } from 'react';
import { Zap, X, ShieldAlert, BadgeCheck, HelpCircle } from 'lucide-react';
import { Tanque, Peixe, Medicao } from '@/lib/types';
import { TankSimulator, SimulationResult } from '@/lib/simulator';

export function SimuladorManejo({ 
  tanque, 
  currentPeixes, 
  historico 
}: { 
  tanque: Tanque; 
  currentPeixes: Peixe[]; 
  historico: Medicao[] 
}) {
  const [open, setOpen] = useState(false);
  const [peixesToAdd, setPeixesToAdd] = useState(1);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulator = new TankSimulator();

  const handleSimulate = () => {
    const res = simulator.simulateMove(tanque, currentPeixes, peixesToAdd, historico);
    setResult(res);
  };

  const reset = () => {
    setOpen(false);
    setResult(null);
    setPeixesToAdd(1);
  };

  return (
    <>
      <button className="btn btn-outline" onClick={() => setOpen(true)}>
        <Zap size={18} />
        Simulador de Manejo
      </button>

      {open && (
        <div className="modal-backdrop" onClick={reset}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Zap size={22} color="var(--primary)" />
                   Simulador &quot;What-If&quot;
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Projete o impacto biológico antes de agir</p>
              </div>
              <button onClick={reset} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div className="sim-form" style={{ marginBottom: '2rem' }}>
               <label style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                 Quantos novos peixes deseja adicionar?
               </label>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="number" 
                    value={peixesToAdd} 
                    onChange={(e) => setPeixesToAdd(parseInt(e.target.value) || 0)}
                    min="1"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={handleSimulate}>
                    Rodar Projeção
                  </button>
               </div>
            </div>

            {result && (
              <div className="sim-results card" style={{ background: '#f8fafc', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                   <div className="res-item">
                      <span className="res-label">Risco Atual</span>
                      <span className="res-val">{result.currentRisk.score}</span>
                   </div>
                   <div style={{ alignSelf: 'center', color: '#94a3b8' }}>&rarr;</div>
                   <div className="res-item">
                      <span className="res-label">Projeção</span>
                      <span className="res-val" style={{ 
                        color: result.projectedRisk.score > 70 ? 'var(--danger)' : result.projectedRisk.score > 40 ? 'var(--warning)' : 'var(--success)' 
                      }}>
                        {result.projectedRisk.score}
                      </span>
                   </div>
                </div>

                <div className="uncertainty-box">
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.375rem' }}>
                      <span>MARGEM DE INCERTEZA</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <HelpCircle size={10} /> ± {result.uncertaintyRange[1] - result.projectedRisk.score} pts
                      </span>
                   </div>
                   <div className="uncertainty-bar">
                      <div className="uncertainty-fill" style={{ 
                        left: `${result.uncertaintyRange[0]}%`, 
                        width: `${result.uncertaintyRange[1] - result.uncertaintyRange[0]}%` 
                      }} />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8' }}>
                      <span>Otimista: {result.uncertaintyRange[0]}</span>
                      <span>Pessimista: {result.uncertaintyRange[1]}</span>
                   </div>
                </div>

                <div className="recommendation">
                   {result.projectedRisk.score < 50 ? <BadgeCheck size={18} color="var(--success)" /> : <ShieldAlert size={18} color="var(--warning)" />}
                   <p>{result.recommendation}</p>
                </div>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={reset}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .res-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .res-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .res-val {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .uncertainty-box {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .uncertainty-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          position: relative;
        }
        .uncertainty-fill {
          position: absolute;
          height: 100%;
          background: var(--primary);
          opacity: 0.4;
          border-radius: 3px;
        }
        .recommendation {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          line-height: 1.4;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
