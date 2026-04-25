'use client';

import Link from 'next/link';
import type { Peixe } from '@/lib/types';

export function ParentLink({ peixe, label, icon }: { peixe: Peixe | null; label: string; icon: string }) {
  if (!peixe) {
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        <span className="detail-value" style={{ color: '#94a3b8', fontStyle: 'italic' }}>Desconhecido</span>
      </div>
    );
  }
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <Link href={`/peixes/${peixe.id}`} className="parent-link">
        <span>{icon}</span>
        <span>{peixe.id}</span>
        <span className="detail-sub">{peixe.linhagem}</span>
      </Link>
    </div>
  );
}

export function FilhoBadge({ peixe }: { peixe: Peixe }) {
  return (
    <Link href={`/peixes/${peixe.id}`} className="filho-badge">
      {peixe.id}
    </Link>
  );
}
