import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { 
  getPeixe, 
  getPaiDe, 
  getMaeDe, 
  getFilhosDe, 
  countCruzamentosDoPeixe, 
  countFilhosDoPeixe, 
  getCruzamentosDoPeixe,
  getHistoricoMovimentacao,
  getTanques
} from '@/lib/db';
import { ArvoreGenealogica } from './_arvore';
import { MoveFishModal } from './_move-modal';

export const dynamic = 'force-dynamic';

export default async function PeixeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peixe = await getPeixe(id);

  if (!peixe) {
    return (
      <div className="card empty-state">
        <p>Peixe não encontrado.</p>
        <Link href="/peixes" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar ao plantel
        </Link>
      </div>
    );
  }

  const [pai, mae, filhos] = await Promise.all([
    getPaiDe(peixe),
    getMaeDe(peixe),
    getFilhosDe(peixe.id),
  ]);

  // Buscar avós (paralelo)
  // Buscar avós e dados ambientais (paralelo)
  const [
    avPaterno, 
    avMaterno, 
    amPaterna, 
    amMaterna, 
    totalCruzamentos, 
    totalFilhos, 
    cruzamentos,
    historico,
    allTanques
  ] = await Promise.all([
    pai ? getPaiDe(pai) : null,
    mae ? getPaiDe(mae) : null,
    pai ? getMaeDe(pai) : null,
    mae ? getMaeDe(mae) : null,
    countCruzamentosDoPeixe(peixe.id),
    countFilhosDoPeixe(peixe.id),
    getCruzamentosDoPeixe(peixe.id),
    getHistoricoMovimentacao(peixe.id),
    getTanques()
  ]);

  const mediaFilhos = totalCruzamentos > 0 ? (totalFilhos / totalCruzamentos).toFixed(1) : '0';

  const statusMap: Record<string, string> = {
    ativo: 'Ativo', reservado: 'Reservado', vendido: 'Vendido', morto: 'Morto',
  };

  return (
    <div>
      <div className="page-header">
        <Link href="/peixes" className="btn btn-outline">
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline">
            <Edit2 size={18} />
            Editar
          </button>
          <button className="btn btn-danger">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Dados do peixe */}
      <div className="card" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: '1rem' }}>
          <div className="peixe-header" style={{ marginBottom: '0.5rem' }}>
            <span className="peixe-id" style={{ fontSize: '1.25rem' }}>{peixe.id}</span>
            <span className={`badge badge-${peixe.status}`}>{statusMap[peixe.status]}</span>
          </div>
          <p className="peixe-especie" style={{ fontSize: '0.9375rem' }}>{peixe.especie}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Linhagem</span>
            <span className="detail-value">{peixe.linhagem}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Sexo</span>
            <span className="detail-value">{peixe.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Nascimento</span>
            <span className="detail-value">{new Date(peixe.nascimento).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cor/Padrão</span>
            <span className="detail-value">{peixe.cor}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bacia/Tanque Atual</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href={`/tanques/${peixe.tankId}`} className="detail-value" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>
                {peixe.tankId}
              </Link>
              <MoveFishModal peixeId={peixe.id} currentTankId={peixe.tankId} tanques={allTanques} />
            </div>
          </div>
        </div>

        {peixe.nota && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
            <strong>Observações:</strong>
            <p style={{ marginTop: '0.25rem', color: '#64748b' }}>{peixe.nota}</p>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {(totalCruzamentos > 0 || totalFilhos > 0) && (
        <div className="card" style={{ maxWidth: 800, marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Estatísticas</h3>
          <div className="stat-box">
            <div className="stat-row">
              <span className="stat-label">Cruzamentos</span>
              <span className="stat-value">{totalCruzamentos}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total de filhos</span>
              <span className="stat-value">{totalFilhos}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Média filhos/cruzamento</span>
              <span className="stat-value">{mediaFilhos}</span>
            </div>
          </div>

          {cruzamentos.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.875rem' }}>Cruzamentos recentes</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {cruzamentos.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/cruzamentos/${c.id}`} className="cruzamento-mini">
                    <span>{c.id}</span>
                    <span className="cruzamento-mini-data">{new Date(c.data).toLocaleDateString('pt-BR')}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rastreabilidade Ambiental */}
      <div className="card" style={{ maxWidth: 800, marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Rastreabilidade Ambiental</h3>
        <div className="history-timeline">
           {historico.length === 0 ? (
             <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Sem movimentações registradas (Tanque inicial: {peixe.tankId})</p>
           ) : (
             historico.map((log) => (
               <div key={log.id} className="history-log-item">
                  <div className="log-date">{new Date(log.data).toLocaleDateString('pt-BR')}</div>
                  <div className="log-content">
                    <span className="log-path">{log.origemId || '—'} &rarr; {log.destinoId}</span>
                    <span className="log-reason">{log.motivo}</span>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>


      {/* Árvore genealógica */}
      <div style={{ maxWidth: 800, marginTop: '1.5rem' }}>
        <ArvoreGenealogica
          peixe={peixe}
          pai={pai}
          mae={mae}
          avPaterno={avPaterno}
          amPaterna={amPaterna}
          avMaterno={avMaterno}
          amMaterna={amMaterna}
          filhos={filhos}
        />
      </div>
    </div>
  );
}
