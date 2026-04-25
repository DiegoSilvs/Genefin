import { getNinhada, getEventosNinhada, getCruzamento, getTanque } from '@/lib/db';
import { calculateSpawnHealth } from '@/lib/reproduction-health';
import SelectionWizard from './_selection-wizard';
import { 
  ArrowLeft, 
  Baby, 
  Droplets, 
  History, 
  Activity,
  HeartPulse,
  Info,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NinhadaDetailPage({ params }: { params: { id: string } }) {
  const ninhadaId = params.id;
  
  const [ninhada, eventos] = await Promise.all([
    getNinhada(ninhadaId),
    getEventosNinhada(ninhadaId)
  ]);

  if (!ninhada) return <div>Ninhada não encontrada.</div>;

  const [cruzamento, tanque] = await Promise.all([
    getCruzamento(ninhada.cruzamentoId),
    getTanque(ninhada.tankId)
  ]);

  const health = calculateSpawnHealth(ninhada, eventos);

  const survivalRate = ((ninhada.qtdInicial - ninhada.totalMortalidade - ninhada.totalDescarte) / ninhada.qtdInicial) * 100;

  return (
    <div className="ninhada-detail-container">
      <div className="detail-header">
        <Link href="/ninhadas" className="btn-back">
          <ArrowLeft size={18} />
          <span>Voltar ao Dashboard</span>
        </Link>
        <div className="header-title">
          <h1>{ninhada.codigo}</h1>
          <div className="badge-fase" data-fase={ninhada.faseAtual}>
            {ninhada.faseAtual.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="detail-grid-pro">
        {/* LOUÇA 1: VITALIDADE E MÉTRICAS */}
        <div className="grid-column">
          <div className="card glass metrics-overview">
            <div className="health-gauge">
               <HeartPulse size={32} className={health.status === 'stable' ? 'text-success' : health.status === 'warning' ? 'text-warning' : 'text-danger'} />
               <div className="gauge-text">
                  <span className="gauge-value">{health.score}</span>
                  <span className="gauge-label">Pontos de Saúde</span>
               </div>
            </div>
            <div className="metrics-list-pro">
               <div className="metric-row">
                  <span>Quantidade Inicial</span>
                  <span className="val">{ninhada.qtdInicial}</span>
               </div>
               <div className="metric-row">
                  <span>Mortalidade Acumulada</span>
                  <span className="val text-danger">-{ninhada.totalMortalidade}</span>
               </div>
               <div className="metric-row">
                  <span>Descarte (Culling)</span>
                  <span className="val text-warning">-{ninhada.totalDescarte}</span>
               </div>
               <div className="metric-row">
                  <span>Sobreviventes</span>
                  <span className="val text-success">{ninhada.qtdInicial - ninhada.totalMortalidade - ninhada.totalDescarte}</span>
               </div>
            </div>
            
            <div className="survival-bar-container">
               <div className="bar-labels">
                  <span>Taxa de Sucesso</span>
                  <span>{survivalRate.toFixed(1)}%</span>
               </div>
               <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${survivalRate}%` }} />
               </div>
            </div>
          </div>

          {/* ALERTAS E SUGESTÕES */}
          <div className="card glass suggestions-panel">
             <div className="panel-header">
                <Info size={18} />
                <h3>Análise e Sugestões</h3>
             </div>
             {health.alerts.length > 0 || health.suggestions.length > 0 ? (
               <div className="content">
                  {health.alerts.map((a, i) => (
                    <div key={i} className="alert-item">
                       <AlertCircle size={14} className="text-danger" />
                       <span>{a}</span>
                    </div>
                  ))}
                  {health.suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item">
                       <ChevronRight size={14} className="text-primary" />
                       <span>{s}</span>
                    </div>
                  ))}
               </div>
             ) : (
               <p className="text-secondary p-4">Ambiente saudável. Continue o manejo padrão.</p>
             )}
          </div>
        </div>

        {/* LOUÇA 2: MANEJO E LINHAGEM */}
        <div className="grid-column">
          <div className="card glass info-card">
            <h3>Dados Técnicos</h3>
            <div className="info-grid">
               <div className="info-item">
                  <span className="label">Tanque Atual</span>
                  <span className="value">{tanque?.codigo || '—'}</span>
               </div>
               <div className="info-item">
                  <span className="label">Pai (ID)</span>
                  <span className="value">{cruzamento?.machoId || '—'}</span>
               </div>
               <div className="info-item">
                  <span className="label">Mãe (ID)</span>
                  <span className="value">{cruzamento?.femeaId || '—'}</span>
               </div>
               <div className="info-item">
                  <span className="label">Duração da Fase</span>
                  <span className="value">12 dias</span>
               </div>
            </div>
          </div>

          <SelectionWizard ninhadaId={ninhada.id} codigoBase={ninhada.codigo} />
        </div>

        {/* LOUÇA 3: LOG DE EVENTOS (Full Width ou Column) */}
        <div className="grid-full">
           <div className="card glass events-timeline">
              <div className="panel-header">
                 <History size={18} />
                 <h3>Histórico de Manejo</h3>
              </div>
              <div className="timeline-content">
                 {eventos.map((e, i) => (
                   <div key={e.id} className="timeline-row">
                      <div className="time-marker">
                         <span className="date">{new Date(e.createdAt).toLocaleDateString()}</span>
                         <span className="hour">{new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="event-type" data-event={e.tipoEvento}>
                         {e.tipoEvento}
                      </div>
                      <div className="event-details">
                         {e.quantidade > 0 && <strong>{e.quantidade} unidades - </strong>}
                         <span>{e.nota || `Registro de ${e.tipoEvento} na fase ${e.faseNoMomento}`}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
