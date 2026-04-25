import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCruzamento, getPeixe, getFilhosDoCruzamento } from '@/lib/db';
import { NovoFilhoModal } from './_modal-filho';
import { StatusSelect } from './_status-select';
import { classificarCruzamento, corDesempenho } from '@/lib/stats';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  planejado: 'Planejado', em_curso: 'Em curso', finalizado: 'Finalizado', falhou: 'Falhou',
};

const statusClasses: Record<string, string> = {
  planejado: 'badge-reservado', em_curso: 'badge-ativo', finalizado: 'badge-vendido', falhou: 'badge-morto',
};

export default async function CruzamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cruzamento = await getCruzamento(id);

  if (!cruzamento) {
    return (
      <div className="card empty-state">
        <p>Cruzamento não encontrado.</p>
        <Link href="/cruzamentos" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar aos cruzamentos
        </Link>
      </div>
    );
  }

  const [macho, femea, filhos] = await Promise.all([
    getPeixe(cruzamento.machoId),
    getPeixe(cruzamento.femeaId),
    getFilhosDoCruzamento(cruzamento.id),
  ]);

  const desempenho = classificarCruzamento(filhos.length);

  return (
    <div>
      <div className="page-header">
        <Link href="/cruzamentos" className="btn btn-outline">
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <NovoFilhoModal cruzamento={cruzamento} />
          <StatusSelect id={cruzamento.id} currentStatus={cruzamento.status} />
        </div>
      </div>

      {/* Info do cruzamento */}
      <div className="card" style={{ maxWidth: 800, marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div className="crz-header" style={{ marginBottom: '0.5rem' }}>
            <span className="crz-id" style={{ fontSize: '1.25rem' }}>{cruzamento.id}</span>
            <span className={`badge ${statusClasses[cruzamento.status]}`}>
              {statusLabels[cruzamento.status]}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Data: {new Date(cruzamento.data).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Casal */}
        <div className="crz-casal" style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
          <Link href={`/peixes/${cruzamento.machoId}`} className="crz-parent">
            <span className="crz-sexo" style={{ fontSize: '1.5rem' }}>&#9794;</span>
            <span className="crz-name" style={{ fontSize: '1.125rem' }}>{macho ? macho.id : cruzamento.machoId}</span>
            {macho && <span className="crz-linhagem">{macho.linhagem} · {macho.especie}</span>}
          </Link>

          <span className="crz-cross" style={{ fontSize: '1.5rem' }}>&times;</span>

          <Link href={`/peixes/${cruzamento.femeaId}`} className="crz-parent">
            <span className="crz-sexo" style={{ fontSize: '1.5rem' }}>&#9792;</span>
            <span className="crz-name" style={{ fontSize: '1.125rem' }}>{femea ? femea.id : cruzamento.femeaId}</span>
            {femea && <span className="crz-linhagem">{femea.linhagem} · {femea.especie}</span>}
          </Link>
        </div>

        {cruzamento.observacao && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
            <strong>Observações:</strong>
            <p style={{ marginTop: '0.25rem', color: '#64748b' }}>{cruzamento.observacao}</p>
          </div>
        )}

        {/* Métrica de desempenho */}
        <div className="stat-box">
          <div className="stat-row">
            <span className="stat-label">Filhos gerados</span>
            <span className="stat-value">{filhos.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Desempenho</span>
            <span className={`badge ${corDesempenho(desempenho.classificacao)}`}>
              {desempenho.classificacao}
            </span>
          </div>
        </div>
      </div>

      {/* Filhos */}
      <div style={{ maxWidth: 800 }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>
          Filhos ({filhos.length})
        </h3>

        {filhos.length === 0 ? (
          <div className="card empty-state">
            <p>Nenhum filhote registrado neste cruzamento.</p>
          </div>
        ) : (
          <div className="crz-list">
            {filhos.map((filho) => (
              <Link key={filho.id} href={`/peixes/${filho.id}`} className="card filho-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="peixe-id">{filho.id}</span>
                  <span>{filho.sexo === 'macho' ? '♂' : '♀'}</span>
                </div>
                <p className="peixe-linhagem">{filho.linhagem}</p>
                <div className="peixe-meta">
                  <span>Cor: {filho.cor}</span>
                  <span>Bacia {filho.tankId}</span>
                  <span>Nasc. {new Date(filho.nascimento).toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
