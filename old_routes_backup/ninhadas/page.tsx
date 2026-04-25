import Link from 'next/link';
import { getNinhadas, getEventosNinhada } from '@/lib/db';
import { calculateSpawnHealth } from '@/lib/reproduction-health';
import { 
  Plus, 
  Baby, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function SpawnCard({ id }: { id: string }) {
  const [ninhada, eventos] = await Promise.all([
    import('@/lib/db').then(m => m.getNinhada(id)),
    getEventosNinhada(id)
  ]);

  if (!ninhada) return null;

  const health = calculateSpawnHealth(ninhada, eventos);
  
  const statusColors = {
    stable: 'var(--success)',
    warning: 'var(--warning)',
    critical: 'var(--danger)'
  };

  const survivalRate = ((ninhada.qtdInicial - ninhada.totalMortalidade - ninhada.totalDescarte) / ninhada.qtdInicial) * 100;

  return (
    <Link href={`/ninhadas/${ninhada.id}`} className="card spawn-pro-card">
      <div className="spawn-header">
        <div>
          <span className="spawn-code">{ninhada.codigo}</span>
          <h3 className="spawn-title">Linhagem: {ninhada.faseAtual.toUpperCase()}</h3>
        </div>
        <div className="health-badge" style={{ borderColor: statusColors[health.status] }}>
          <Activity size={14} color={statusColors[health.status]} />
          <span style={{ color: statusColors[health.status] }}>{health.score}</span>
        </div>
      </div>

      <div className="spawn-metrics">
        <div className="metric-item">
          <span className="label">Sobrevivência</span>
          <span className="value">{survivalRate.toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="label">Qtde Atual</span>
          <span className="value">{ninhada.qtdInicial - ninhada.totalMortalidade - ninhada.totalDescarte}</span>
        </div>
      </div>

      <div className="spawn-progress">
        <div className="progress-bg">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${survivalRate}%`,
              backgroundColor: statusColors[health.status]
            }} 
          />
        </div>
      </div>

      <div className="spawn-footer">
        <div className="spawn-date">
          <Calendar size={12} />
          <span>{new Date(ninhada.dataDesova).toLocaleDateString()}</span>
        </div>
        <div className="spawn-status-tag" data-status={ninhada.faseAtual}>
          {ninhada.faseAtual.replace('_', ' ')}
        </div>
      </div>

      {health.alerts.length > 0 && (
        <div className="spawn-danger-banner">
          <AlertCircle size={10} />
          <span>{health.alerts[0]}</span>
        </div>
      )}
    </Link>
  );
}

export default async function NinhadasDashboard() {
  const ninhadas = await getNinhadas();

  return (
    <div className="ninhadas-container">
      <div className="page-header">
        <div>
          <h1>Manejo de Reprodução</h1>
          <p>Acompanhamento de desovas, taxas de eclosão e triagem genetica</p>
        </div>
        <div className="header-actions">
           <button className="btn btn-primary btn-icon">
              <Plus size={18} />
              <span>Nova Desova</span>
           </button>
        </div>
      </div>

      <div className="breeding-stats-grid">
         <div className="stat-card glass">
            <Baby size={24} className="text-primary" />
            <div>
              <span className="stat-label">Ninhadas Ativas</span>
              <span className="stat-value">{ninhadas.filter(n => n.faseAtual !== 'finalizada').length}</span>
            </div>
         </div>
         <div className="stat-card glass">
            <CheckCircle2 size={24} className="text-success" />
            <div>
              <span className="stat-label">Taxa Média Sobrevivência</span>
              <span className="stat-value">84.2%</span>
            </div>
         </div>
      </div>

      <div className="spawn-grid">
        {ninhadas.length > 0 ? (
          ninhadas.map(n => (
            <SpawnCard key={n.id} id={n.id} />
          ))
        ) : (
          <div className="empty-state card glass">
            <Baby size={48} />
            <p>Nenhuma ninhada em curso no momento.</p>
          </div>
        )}
      </div>

      {/* Estilos específicos seriam movidos para globals.css ou mantidos assim se necessário */}
    </div>
  );
}
