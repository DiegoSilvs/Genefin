import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getPeixes } from '@/lib/db';
import { PeixeListContainer } from './_peixe-card';
 
export const dynamic = 'force-dynamic';
 
export default async function PeixesPage() {
  const peixes = await getPeixes();
 
  const stats = {
    total: peixes.length,
    ativos: peixes.filter((p) => p.status === 'ativo').length,
    especies: [...new Set(peixes.map((p) => p.especie))].length,
  };
 
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>Plantel</h1>
          <p style={{ fontSize: '1rem', color: '#64748b' }}>
            {stats.total} peixes no total · {stats.ativos} exemplares ativos
          </p>
        </div>
        <Link href="/peixes/novo" className="btn btn-primary">
          <Plus size={18} />
          Cadastrar Novo
        </Link>
      </div>
 
      <PeixeListContainer peixes={peixes} />
    </div>
  );
}
