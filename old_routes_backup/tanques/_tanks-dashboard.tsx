'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Clock, 
  Layers, 
  Droplets, 
  Thermometer, 
  Plus,
  ArrowUpDown,
  Trash2,
  Settings,
  ArrowRightLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Tanque, Medicao, Peixe } from '@/lib/types';
import { RiskCalculator, RiskScore } from '@/lib/risk-engine';
import { NovoTanqueModal } from './_modal-novo';
import { MoverPeixeModal } from './_modal-mover';
import { deleteTanque, getTanques } from '@/lib/db';

export default function TanquesDashboard({ 
  initialTanques,
  initialData 
}: { 
  initialTanques: Tanque[];
  initialData: Record<string, { peixes: Peixe[], historico: Medicao[] }>;
}) {
  const [tanques, setTanques] = useState(initialTanques);
  const [showModal, setShowModal] = useState(false);
  const [movingTankId, setMovingTankId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'name'>('risk');
  const [showInactives, setShowInactives] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Recarregar tanques se o filtro de inativos mudar
  useEffect(() => {
    async function refresh() {
      const updated = await getTanques({ includeDeleted: showInactives });
      setTanques(updated);
    }
    refresh();
  }, [showInactives]);

  const calculator = new RiskCalculator();

  const processedTanques = useMemo(() => {
    return tanques.map(t => {
      const data = initialData[t.id] || { peixes: [], historico: [] };
      const risk = calculator.calculate(t, data.peixes.length, data.historico);
      return {
        ...t,
        risk: risk,
        peixesCount: data.peixes.length,
        lastMedicao: data.historico[0]
      };
    }).sort((a, b) => {
      if (sortBy === 'risk') return b.risk.score - a.risk.score;
      return a.nome.localeCompare(b.nome);
    });
  }, [tanques, sortBy, initialData]);

  const summary = useMemo(() => {
    const total = processedTanques.length;
    const criticos = processedTanques.filter(t => t.risk.score > 70).length;
    const atencao = processedTanques.filter(t => t.risk.score > 35 && t.risk.score <= 70).length;
    return { total, criticos, atencao };
  }, [processedTanques]);

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja arquivar o tanque "${nome}"?`)) return;
    try {
      await deleteTanque(id);
      setTanques(prev => prev.filter(t => t.id !== id));
      setToast({ msg: 'Tanque arquivado com sucesso!', type: 'success' });
    } catch (err) {
      setToast({ msg: (err as Error).message, type: 'error' });
    }
  }

  return (
    <div className="tanques-container">
      {toast && (
        <div className={`toast toast-${toast.type} slide-in`}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Inteligência de Tanques</h1>
          <p style={{ color: '#64748b' }}>Análise preditiva de risco e monitoramento operacional</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginRight: '1rem', cursor: 'pointer' }}>
             <input 
               type="checkbox" 
               checked={showInactives} 
               onChange={(e) => setShowInactives(e.target.checked)}
               style={{ width: '16px', height: '16px' }}
             />
             Ver Arquivados
           </label>

           <button 
             className="btn btn-outline" 
             onClick={() => setSortBy(prev => prev === 'risk' ? 'name' : 'risk')}
           >
             <ArrowUpDown size={18} />
             {sortBy === 'risk' ? 'Por Severidade' : 'Por Nome'}
           </button>
           <button className="btn btn-primary" onClick={() => setShowModal(true)}>
             <Plus size={18} />
             Novo Tanque
           </button>
        </div>
      </div>

      <div className="dashboard-summary-pro card glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="summary-item">
            <span className="summary-label">Ambientes</span>
            <span className="summary-value">{summary.total}</span>
         </div>
         <div className="summary-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <span className="summary-label">Críticos</span>
            <span className="summary-value" style={{ color: 'var(--danger)' }}>{summary.criticos}</span>
         </div>
         <div className="summary-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <span className="summary-label">Atenção</span>
            <span className="summary-value" style={{ color: 'var(--warning)' }}>{summary.atencao}</span>
         </div>
         <div className="summary-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <span className="summary-label">Confiança Média</span>
            <span className="summary-value" style={{ color: 'var(--primary)' }}>94%</span>
         </div>
      </div>

      <div className="tank-pro-grid">
        {processedTanques.map(t => {
          const bioloadPercent = Math.min(100, (t.peixesCount / t.capacidadeBiologica) * 100);
          
          let priorityLabel = 'Estável';
          let priorityColor = 'var(--success)';
          let priorityBg = '#dcfce7';

          if (t.risk.score > 70) {
            priorityLabel = 'Crítico';
            priorityColor = 'var(--danger)';
            priorityBg = '#fee2e2';
          } else if (t.risk.score > 35) {
            priorityLabel = 'Atenção';
            priorityColor = '#92400e';
            priorityBg = '#fef9c3';
          }

          return (
            <div key={t.id} className="card tank-pro-card" style={{ padding: 0, borderTop: `4px solid ${priorityColor}`, opacity: t.status === 'inativo' ? 0.7 : 1 }}>
              <div style={{ padding: '1.25rem' }}>
                <div className="tank-header" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ 
                        background: priorityBg, 
                        color: priorityColor, 
                        fontSize: '0.65rem', 
                        fontWeight: 900, 
                        textTransform: 'uppercase', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px' 
                      }}>
                        {priorityLabel}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{t.tipoUso}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{t.nome}</h3>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: priorityColor, lineHeight: 1 }}>{t.risk.score}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8' }}>Índice de Risco</div>
                  </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem', border: '1px solid #f1f5f9' }}>
                   <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Fatores de Risco Detalhados</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <RiskFactorRow label="Amônia/Toxinas" score={t.risk.factors.ammonia * 100} />
                      <RiskFactorRow label="Lotação Biológica" score={t.risk.factors.bioload * 100} />
                      <RiskFactorRow label="Defasagem de Dados" score={t.risk.factors.freshness * 100} />
                   </div>
                </div>

                <div className="tank-mini-stat" style={{ marginBottom: '1.25rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                      <span>Ocupação Total</span>
                      <span>{t.peixesCount} / {t.capacidadeBiologica}</span>
                   </div>
                   <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${bioloadPercent}%`, 
                        background: bioloadPercent > 90 ? 'var(--danger)' : bioloadPercent > 70 ? 'var(--warning)' : 'var(--primary)',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                   </div>
                </div>

                {t.risk.alerts.length > 0 && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: t.risk.score > 70 ? '#fee2e2' : '#fffbeb', 
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <AlertTriangle size={16} style={{ color: priorityColor, flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: priorityColor }}>
                       {t.risk.alerts[0]}
                       {t.risk.alerts.length > 1 && <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>+{t.risk.alerts.length - 1} alertas</span>}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                   <Link href={`/tanques/${t.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem', textDecoration: 'none' }}>
                     <Droplets size={14} /> Registrar Medição
                   </Link>
                   <button 
                     className="btn btn-outline" 
                     style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                     onClick={() => setMovingTankId(t.id)}
                   >
                     <ArrowRightLeft size={14} /> Mover Peixe
                   </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                  <Clock size={12} />
                  <span>Última medição: {t.lastMedicao ? new Date(t.lastMedicao.measuredAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <Link href={`/tanques/${t.id}`} className="btn-icon" style={{ padding: '0.25rem', borderRadius: '4px' }}>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NovoTanqueModal 
          onClose={() => setShowModal(false)} 
          onSuccess={(newT) => {
            setTanques(prev => [...prev, newT]);
            setToast({ msg: `Tanque "${newT.nome}" criado com sucesso!`, type: 'success' });
          }}
        />
      )}

      {movingTankId && (
        <MoverPeixeModal 
          tankId={movingTankId}
          onClose={() => setMovingTankId(null)}
          onSuccess={(msg) => setToast({ msg, type: 'success' })}
        />
      )}

      <style jsx>{`
        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 1000;
          font-weight: 700;
          border-left: 4px solid var(--primary);
        }
        .toast-success { border-left-color: var(--success); color: #166534; }
        .toast-error { border-left-color: var(--danger); color: #991b1b; }
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function RiskFactorRow({ label, score }: { label: string; score: number }) {
  let color = 'var(--success)';
  if (score > 40) color = 'var(--warning)';
  if (score > 70) color = 'var(--danger)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>
      <span style={{ flex: 1, color: '#64748b' }}>{label}</span>
      <div style={{ width: '60px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color }} />
      </div>
      <span style={{ width: '25px', textAlign: 'right', color: color }}>{Math.round(score)}%</span>
    </div>
  );
}
