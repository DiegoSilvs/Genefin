import Link from 'next/link';
import type { Peixe } from '@/lib/types';

/* ── Node Component ── */
function PedigreeNode({ 
  peixe, 
  highlight, 
  connectorRight, 
  connectorLeft,
  branch
}: { 
  peixe: Peixe | null; 
  highlight?: boolean;
  connectorRight?: boolean;
  connectorLeft?: boolean;
  branch?: boolean;
}) {
  if (!peixe) {
    return (
      <div className={`pedigree-node-wrapper ${branch ? 'pedigree-branch' : ''}`}>
        <div className="arvore-vazio">Desconhecido</div>
      </div>
    );
  }

  const genderClass = peixe.sexo === 'macho' ? 'pedigree-node--macho' : 'pedigree-node--femea';
  const highlightClass = highlight ? 'pedigree-node--highlight' : '';

  return (
    <div className={`pedigree-node-wrapper 
      ${connectorRight ? 'pedigree-connector-right' : ''} 
      ${connectorLeft ? 'pedigree-connector-left' : ''}
      ${branch ? 'pedigree-branch' : ''}
    `}>
      <Link href={`/peixes/${peixe.id}`} className={`pedigree-node ${genderClass} ${highlightClass}`}>
        <div className="pedigree-info-top">
          <span className="pedigree-id">{peixe.codigoVisivel || peixe.id}</span>
          <span className="pedigree-sex-icon">{peixe.sexo === 'macho' ? '♂' : '♀'}</span>
        </div>
        <div className="pedigree-linhagem">{peixe.linhagem}</div>
        {peixe.qualidade && (
          <div className="pedigree-qualidade">{peixe.qualidade}</div>
        )}
      </Link>
    </div>
  );
}

/* ── Horizontal Pedigree Tree ── */
export function ArvoreGenealogica({
  peixe,
  pai,
  mae,
  avPaterno,
  amPaterna,
  avMaterno,
  amMaterna,
  filhos,
}: {
  peixe: Peixe;
  pai: Peixe | null;
  mae: Peixe | null;
  avPaterno: Peixe | null;
  amPaterna: Peixe | null;
  avMaterno: Peixe | null;
  amMaterna: Peixe | null;
  filhos: Peixe[];
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>
        Análise de Pedigree (Linhagem)
      </h3>
      
      <div className="pedigree-container">
        <div className="pedigree-tree">
          
          {/* G2: Avós */}
          <div className="pedigree-col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PedigreeNode peixe={avPaterno} connectorRight />
              <PedigreeNode peixe={amPaterna} connectorRight />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PedigreeNode peixe={avMaterno} connectorRight />
              <PedigreeNode peixe={amMaterna} connectorRight />
            </div>
          </div>

          {/* G1: Pais */}
          <div className="pedigree-col">
            <div style={{ height: '50%', display: 'flex', alignItems: 'center' }}>
              <PedigreeNode peixe={pai} connectorRight connectorLeft branch />
            </div>
            <div style={{ height: '50%', display: 'flex', alignItems: 'center' }}>
              <PedigreeNode peixe={mae} connectorRight connectorLeft branch />
            </div>
          </div>

          {/* G0: Peixe Atual */}
          <div className="pedigree-col">
            <PedigreeNode peixe={peixe} highlight connectorLeft branch connectorRight={filhos.length > 0} />
          </div>

          {/* Descendentes: Filhos */}
          {filhos.length > 0 && (
            <div className="pedigree-col">
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filhos.slice(0, 4).map((f, idx) => (
                  <PedigreeNode key={f.id} peixe={f} connectorLeft branch={idx > 0} />
                ))}
                {filhos.length > 4 && (
                  <div className="arvore-vazio" style={{ border: 'none' }}>
                    + {filhos.length - 4} outros
                  </div>
                )}
               </div>
            </div>
          )}

        </div>
      </div>
      
      <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
        &larr; Use o scroll horizontal para navegar na linhagem &rarr;
      </p>
    </div>
  );
}
