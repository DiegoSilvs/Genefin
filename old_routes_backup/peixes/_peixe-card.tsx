'use client';
 
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Fish, MapPin, Activity } from 'lucide-react';
import type { Peixe } from '@/lib/types';
 
const statusMap: Record<string, { label: string; class: string }> = {
  ativo: { label: 'Ativo', class: 'badge-ativo' },
  reservado: { label: 'Reservado', class: 'badge-reservado' },
  vendido: { label: 'Vendido', class: 'badge-vendido' },
  morto: { label: 'Morto', class: 'badge-morto' },
};
 
export function PeixeCard({ peixe }: { peixe: Peixe }) {
  const status = statusMap[peixe.status] || { label: peixe.status, class: '' };

  return (
    <Link href={`/peixes/${peixe.id}`} className="peixe-card">
      <div className="peixe-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: peixe.sexo === 'macho' ? '#3b82f6' : '#ec4899' 
          }} />
          <span className="peixe-id">{peixe.id}</span>
        </div>
        <span className={`badge ${status.class}`} style={{ fontSize: '0.7rem' }}>
          {status.label}
        </span>
      </div>
      
      <div style={{ margin: '0.75rem 0' }}>
        <p className="peixe-linhagem" style={{ fontSize: '1rem', fontWeight: 700 }}>{peixe.linhagem}</p>
        <p className="peixe-especie" style={{ fontSize: '0.8125rem', opacity: 0.7 }}>{peixe.especie}</p>
      </div>

      <div className="peixe-meta" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <MapPin size={12} />
          <span>{peixe.tankId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <Activity size={12} />
          <span style={{ textTransform: 'capitalize' }}>{peixe.cor}</span>
        </div>
      </div>
    </Link>
  );
}
 
export function PeixeListContainer({ peixes }: { peixes: Peixe[] }) {
  const [search, setSearch] = useState('');
 
  const filteredPeixes = useMemo(() => {
    const term = search.toLowerCase();
    return peixes.filter(p => 
      p.id.toLowerCase().includes(term) || 
      p.linhagem.toLowerCase().includes(term) || 
      p.especie.toLowerCase().includes(term) ||
      p.cor.toLowerCase().includes(term)
    );
  }, [peixes, search]);

  return (
    <>
      <div className="card" style={{ marginBottom: '2rem', padding: '0.75rem 1.25rem' }}>
        <div className="search-bar" style={{ gap: '1rem' }}>
          <Search size={20} style={{ color: 'var(--primary)', opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Pesquisar por ID, linhagem ou espécie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ fontSize: '1rem', fontWeight: 500 }}
          />
          <div style={{ 
            height: '24px', 
            width: '1px', 
            background: 'var(--border)',
            margin: '0 0.5rem'
          }} />
          <Filter size={20} style={{ color: 'var(--primary)', cursor: 'pointer' }} />
        </div>
      </div>
 
      <div className="peixe-list">
        {filteredPeixes.length === 0 ? (
          <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.2 }}>
              <Fish size={48} />
            </div>
            <p style={{ fontWeight: 600 }}>Nenhum peixe encontrado</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Tente ajustar seus termos de busca</p>
          </div>
        ) : (
          filteredPeixes.map((peixe) => (
            <PeixeCard key={peixe.id} peixe={peixe} />
          ))
        )}
      </div>
    </>
  );
}
