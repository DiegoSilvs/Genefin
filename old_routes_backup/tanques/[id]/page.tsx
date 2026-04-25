import Link from 'next/link';
import { getTanque, getPeixesNoTanque, getMedicoes, getMovimentacoesTanque } from '@/lib/db';
import { RiskCalculator } from '@/lib/risk-engine';
import { 
  ArrowLeft, 
  Droplets,
  Thermometer,
  Activity, 
  History, 
  Plus,
  Info,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import { MedicaoForm } from './_medicao-form';
import { SimuladorManejo } from './_simulador';

export const dynamic = 'force-dynamic';

export default async function TanqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tanque, peixes, historico, movimentacoes] = await Promise.all([
    getTanque(id),
    getPeixesNoTanque(id),
    getMedicoes(id, 20),
    getMovimentacoesTanque(id, 20)
  ]);

  if (!tanque) {
    return (
      <div className="card empty-state">
        <p>Tanque não encontrado.</p>
        <Link href="/tanques" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar à lista
        </Link>
      </div>
    );
  }

  const calculator = new RiskCalculator();
  const risk = calculator.calculate(tanque, peixes.length, historico);
  const lastMedicao = historico[0];

  // Identificar se os dados estão obsoletos (Stale Data)
  const isStale = risk.factors.freshness > 0.8;

  return (
    <div className="tanque-detail-container">
      {isStale && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem 1.5rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          border: '1px solid #fecaca',
          boxShadow: '0 4px 12px rgba(153, 27, 27, 0.08)'
        }}>
          <AlertTriangle size={24} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.9375rem' }}>DADOS DESATUALIZADOS</h4>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
              Este tanque não recebe medições há mais de {tanque.intervaloMedicaoDias} dias. O índice de risco ({risk.score}) pode não refletir a realidade atual.
            </p>
          </div>
        </div>
      )}

      <div className="page-header">
        <Link href="/tanques" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <SimuladorManejo tanque={tanque} currentPeixes={peixes} historico={historico} />
           <MedicaoForm tankId={tanque.id} />
        </div>
      </div>

      <div className="tanque-top-summary">
        <div className="card risk-main-card" style={{ borderLeft: `6px solid ${risk.score > 70 ? 'var(--danger)' : risk.score > 35 ? 'var(--warning)' : 'var(--primary)'}` }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className={`badge badge-${tanque.status === 'ativo' ? 'ativo' : 'morto'}`} style={{ fontSize: '0.65rem' }}>{tanque.status}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{tanque.tipoUso}</span>
               </div>
               <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>{tanque.nome}</h1>
               <p style={{ color: '#64748b', fontWeight: 500 }}>Capacidade Bio: <strong>{tanque.capacidadeBiologica}</strong> | Volume: <strong>{tanque.volumeLitros}L</strong> | Filtragem: <strong>{tanque.tipoFiltragem}</strong></p>
             </div>
             <div className="risk-score-circle" data-risk={risk.score} style={{ background: risk.score > 70 ? '#fee2e2' : risk.score > 35 ? '#fef9c3' : '#dcfce7' }}>
                <span className="risk-score-val" style={{ color: risk.score > 70 ? 'var(--danger)' : risk.score > 35 ? '#92400e' : 'var(--success)' }}>{risk.score}</span>
                <span className="risk-score-label" style={{ color: risk.score > 70 ? 'var(--danger)' : risk.score > 35 ? '#92400e' : 'var(--success)' }}>Risco Bio</span>
             </div>
           </div>
           
           {risk.alerts.length > 0 && (
             <div className="risk-alerts-list" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
               <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Alertas de Biosegurança</h4>
               {risk.alerts.map((alert, i) => (
                 <div key={i} className="risk-alert-item" style={{ marginBottom: '0.5rem', color: risk.score > 70 ? '#991b1b' : '#92400e', fontWeight: 600 }}>
                   <Info size={14} />
                   <span>{alert}</span>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="grid-3" style={{ marginTop: '1.5rem' }}>
          <div className="card param-card" style={{ background: lastMedicao && (lastMedicao.ph! < tanque.phIdealMin! || lastMedicao.ph! > tanque.phIdealMax!) ? '#fff1f2' : '' }}>
            <span className="param-label"><Droplets size={14} /> pH Atual</span>
            <span className="param-value">{lastMedicao?.ph || '—'}</span>
            <span className="param-hint">Ideal: {tanque.phIdealMin}-{tanque.phIdealMax}</span>
          </div>
          <div className="card param-card" style={{ background: lastMedicao && (lastMedicao.temp! < tanque.tempIdealMin! || lastMedicao.temp! > tanque.tempIdealMax!) ? '#fff1f2' : '' }}>
            <span className="param-label"><Thermometer size={14} /> Temperatura</span>
            <span className="param-value">{lastMedicao?.temp ? `${lastMedicao.temp}°C` : '—'}</span>
            <span className="param-hint">Ideal: {tanque.tempIdealMin}-{tanque.tempIdealMax}</span>
          </div>
          <div className="card param-card" style={{ background: lastMedicao && lastMedicao.amonia! > 0.25 ? '#fff1f2' : '' }}>
            <span className="param-label"><Activity size={14} /> Amônia (NH3)</span>
            <span className="param-value">{lastMedicao?.amonia !== undefined ? `${lastMedicao.amonia} ppm` : '—'}</span>
            <span className="param-hint">Desejável: &lt; 0.25</span>
          </div>
        </div>
      </div>

      <div className="tanque-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Inventário Vivo ({peixes.length})</h2>
            </div>
            <div className="fish-mini-list">
              {peixes.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>Este tanque está vazio.</p>
              ) : (
                peixes.map(p => (
                  <Link href={`/peixes/${p.id}`} key={p.id} className="fish-mini-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: p.sexo === 'macho' ? '#3b82f6' : '#ec4899', fontWeight: 800 }}>{p.sexo === 'macho' ? '♂' : '♀'}</span>
                      <span style={{ fontWeight: 700 }}>{p.codigoVisivel}</span>
                      <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>{p.linhagem}</span>
                    </div>
                    <Plus size={14} className="chevron-mini" />
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ArrowRightLeft size={18} /> Histórico de Movimentações
            </h2>
            <div className="medicoes-timeline">
              {movimentacoes.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Nenhuma movimentação registrada.</p>
              ) : (
                movimentacoes.map(m => {
                  const isEntry = m.destinoId === tanque.id;
                  return (
                    <div key={m.id} className="medicao-entry" style={{ borderLeftColor: isEntry ? 'var(--success)' : 'var(--danger)' }}>
                      <div className="medicao-date">
                        {new Date(m.data).toLocaleDateString('pt-BR')} — {isEntry ? 'Entrada' : 'Saída'}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        Peixe: {m.peixeId.substring(0, 8)}... | Motivo: <span style={{ color: 'var(--primary)' }}>{m.motivo}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <section className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <History size={18} /> Histórico de Medições
          </h2>
          <div className="medicoes-timeline">
            {historico.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sem medições registradas.</p>
            ) : (
              historico.map(m => (
                <div key={m.id} className="medicao-entry">
                  <div className="medicao-date">
                    {new Date(m.measuredAt).toLocaleDateString('pt-BR')} {new Date(m.measuredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="medicao-vals">
                    <span style={{ color: m.ph! < tanque.phIdealMin! || m.ph! > tanque.phIdealMax! ? 'var(--danger)' : '' }}>pH {m.ph}</span>
                    <span style={{ color: m.temp! < tanque.tempIdealMin! || m.temp! > tanque.tempIdealMax! ? 'var(--danger)' : '' }}>{m.temp}°C</span>
                    {m.amonia !== undefined && <span className={m.amonia > 0.25 ? 'val-danger' : ''}>NH3 {m.amonia}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
