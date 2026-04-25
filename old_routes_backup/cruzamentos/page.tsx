import Link from 'next/link';
import { getCruzamentos, getCruzamento, getPeixe, getFilhosDoCruzamento } from '@/lib/db';
import { NovoCruzamentoModal } from './_modal-novo';

export const dynamic = 'force-dynamic';
import { StatusSelect } from './_status-select';

const statusLabels: Record<string, string> = {
  planejado: 'Planejado', em_curso: 'Em curso', finalizado: 'Finalizado', falhou: 'Falhou',
};

const statusClasses: Record<string, string> = {
  planejado: 'badge-reservado', em_curso: 'badge-ativo', finalizado: 'badge-vendido', falhou: 'badge-morto',
};

import { calculateProbabilidades } from '@/lib/genetica';
import { Target, Zap, Clock } from 'lucide-react';
 
async function CruzamentoCard({ id }: { id: string }) {
  const cruzamento = await getCruzamento(id);
  if (!cruzamento) return null;
 
  const [macho, femea, filhos] = await Promise.all([
    getPeixe(cruzamento.machoId),
    getPeixe(cruzamento.femeaId),
    getFilhosDoCruzamento(cruzamento.id),
  ]);

  const probs = (macho && femea) ? calculateProbabilidades(macho, femea) : [];
 
  return (
    <div className="card cruzamento-card" style={{ padding: '0' }}>
      <div style={{ padding: '1.25rem' }}>
        <div className="crz-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
            <span className="crz-id" style={{ fontSize: '1.125rem', fontWeight: 800 }}>{cruzamento.id}</span>
          </div>
          <span className={`badge ${statusClasses[cruzamento.status]}`}>
            {statusLabels[cruzamento.status]}
          </span>
        </div>
 
        <div className="crz-casal" style={{ 
          background: 'var(--primary-light)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background decoration */}
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', opacity: 0.1, color: 'var(--primary)' }}>
            <Zap size={64} />
          </div>

          <Link href={`/peixes/${cruzamento.machoId}`} className="crz-parent" style={{ background: 'transparent', zIndex: 1 }}>
            <span className="crz-sexo" style={{ color: '#3b82f6' }}>&#9794;</span>
            <span className="crz-name" style={{ fontSize: '1rem' }}>{macho ? macho.id : cruzamento.machoId}</span>
            {macho && <span className="crz-linhagem" style={{ fontSize: '0.75rem' }}>{macho.linhagem}</span>}
          </Link>
 
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', zIndex: 1 }}>
            <span className="crz-cross" style={{ fontSize: '1.25rem', background: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>&times;</span>
          </div>
 
          <Link href={`/peixes/${cruzamento.femeaId}`} className="crz-parent" style={{ background: 'transparent', zIndex: 1 }}>
            <span className="crz-sexo" style={{ color: '#ec4899' }}>&#9792;</span>
            <span className="crz-name" style={{ fontSize: '1rem' }}>{femea ? femea.id : cruzamento.femeaId}</span>
            {femea && <span className="crz-linhagem" style={{ fontSize: '0.75rem' }}>{femea.linhagem}</span>}
          </Link>
        </div>

        {probs.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Target size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Probabilidades F1</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {probs.map(p => (
                <div key={p.caracteristica} style={{ flex: 1, background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: 700 }}>{p.caracteristica}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{p.opcoes[0].valor}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)' }}>{p.opcoes[0].chance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1rem 1.25rem', 
        background: '#f8fafc', 
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
             <Clock size={12} />
             <span>{new Date(cruzamento.data).toLocaleDateString('pt-BR')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
             <Zap size={12} />
             <span>{filhos.length} descendentes</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <Link href={`/cruzamentos/${cruzamento.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
             Detalhes
           </Link>
           <StatusSelect id={cruzamento.id} currentStatus={cruzamento.status} />
        </div>
      </div>
    </div>
  );
}

export default async function CruzamentosPage() {
  const cruzamentos = await getCruzamentos();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Cruzamentos</h1>
          <p>{cruzamentos.length} cruzamentos registrados</p>
        </div>
        <NovoCruzamentoModal />
      </div>

      <div className="crz-list">
        {cruzamentos.length === 0 ? (
          <div className="card empty-state">
            <p>Nenhum cruzamento registrado ainda.</p>
          </div>
        ) : (
          cruzamentos.map((c) => <CruzamentoCard key={c.id} id={c.id} />)
        )}
      </div>
    </div>
  );
}
