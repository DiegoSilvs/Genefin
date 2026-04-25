'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ESPECIES, LINHAGENS_BETTA, LINHAGENS_GUPPY } from '@/lib/mock-data';
import { addPeixe, getPeixesPorSexo, getIdsPorPrefixo, getTanques } from '@/lib/db';
import { Peixe, Tanque } from '@/lib/types';
import { gerarIdPeixe, extrairUltimoNumero } from '@/lib/nomenclatura';
import { NovoTanqueModal } from '@/app/tanques/_modal-novo';
import { Plus } from 'lucide-react';

const especieMap: Record<string, string> = {
  betta: 'Betta splendens',
  guppy: 'Poecilia reticulata (Guppy)',
  platy: 'Platy (Xiphophorus maculatus)',
  molly: 'Molly (Poecilia sphenops)',
};

export default function NovoPeixePage() {
  const router = useRouter();
  const [especie, setEspecie] = useState('betta');
  const [sugestaoId, setSugestaoId] = useState('BT-001');
  const [machos, setMachos] = useState<Peixe[]>([]);
  const [femeas, setFemeas] = useState<Peixe[]>([]);
  const [loading, setLoading] = useState(false);
  const [tanques, setTanques] = useState<Tanque[]>([]);
  const [showTankModal, setShowTankModal] = useState(false);
  const [selectedTankId, setSelectedTankId] = useState('');

  const linhagens = especie === 'guppy' ? LINHAGENS_GUPPY : LINHAGENS_BETTA;
  const especieLabel = especieMap[especie] || '';

  // Calcular sugestão de ID quando muda espécie
  async function loadNextId(chave: string) {
    const prefixoMap: Record<string, string> = {
      betta: 'BT', guppy: 'GP', platy: 'PL', molly: 'ML',
    };
    const prefixo = prefixoMap[chave] ?? 'XX';
    try {
      const ids = await getIdsPorPrefixo(prefixo);
      const ultimo = extrairUltimoNumero(ids, prefixo);
      setSugestaoId(gerarIdPeixe(chave, ultimo));
    } catch {
      setSugestaoId(gerarIdPeixe(chave));
    }
  }

  async function loadParents() {
    try {
      const [m, f] = await Promise.all([
        getPeixesPorSexo('macho'),
        getPeixesPorSexo('femea'),
      ]);
      setMachos(m);
      setFemeas(f);
    } catch {
      setMachos([]);
      setFemeas([]);
    }
  }


  async function handleSpeciesChange(newEspecie: string) {
    setEspecie(newEspecie);
    setMachos([]);
    setFemeas([]);
    setSugestaoId('...');
    setTimeout(() => {
      loadNextId(newEspecie);
      loadParents();
    }, 0);
  }

  // Carregar ID inicial e quando muda a espécie
  useEffect(() => {
    let active = true;
    async function load() {
      const prefixoMap: Record<string, string> = {
        betta: 'BT', guppy: 'GP', platy: 'PL', molly: 'ML',
      };
      const prefixo = prefixoMap[especie] ?? 'XX';
      try {
        const ids = await getIdsPorPrefixo(prefixo);
        const ultimo = extrairUltimoNumero(ids, prefixo);
        if (active) setSugestaoId(gerarIdPeixe(especie, ultimo));

        // Carregar dados auxiliares
        const [m, f, t] = await Promise.all([
          getPeixesPorSexo('macho'),
          getPeixesPorSexo('femea'),
          getTanques()
        ]);
        if (active) {
          setMachos(m);
          setFemeas(f);
          setTanques(t);
        }
      } catch {
        if (active) setSugestaoId(gerarIdPeixe(especie));
      }
    }
    load();
    return () => { active = false; };
  }, [especie]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await addPeixe({
        id: formData.get('id') as string,
        especie: especieLabel,
        linhagem: formData.get('linhagem') as string,
        sexo: formData.get('sexo') as 'macho' | 'femea',
        nascimento: formData.get('nascimento') as string,
        cor: formData.get('cor') as string,
        tankId: formData.get('tankId') as string,
        status: formData.get('status') as string,
        nota: (formData.get('nota') as string) || undefined,
        paiId: (formData.get('paiId') as string) || undefined,
        maeId: (formData.get('maeId') as string) || undefined,
      });
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
      setLoading(false);
      return;
    }

    router.push('/peixes');
  };

  return (
    <div>
      <div className="page-header">
        <Link href="/peixes" className="btn btn-outline">
          <ArrowLeft size={18} />
          Voltar
        </Link>
        <h1>Novo Peixe</h1>
      </div>

      <form onSubmit={handleSubmit} className="card form-card">
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="id">
              Identificação (ID)
              {sugestaoId && sugestaoId !== '...' && (
                <span className="id-sugestao"> sugerido: {sugestaoId}</span>
              )}
            </label>
            <input
              id="id"
              name="id"
              type="text"
              defaultValue={sugestaoId === '...' ? '' : sugestaoId}
              placeholder="ex: BT-005"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="especie">Espécie</label>
            <select
              id="especie"
              name="especie"
              value={especie}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              required
            >
              {ESPECIES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="linhagem">Linhagem</label>
            <select id="linhagem" name="linhagem" required>
              <option value="">Selecione...</option>
              {linhagens.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" name="sexo" required>
              <option value="">Selecione...</option>
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nascimento">Data de nascimento</label>
            <input id="nascimento" name="nascimento" type="date" required />
          </div>

          <div className="form-group">
            <label htmlFor="cor">Cor/Padrão</label>
            <input id="cor" name="cor" type="text" placeholder="ex: Azul metálico" required />
          </div>

          <div className="form-group">
            <label htmlFor="tankId">Bacia/Tanque</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                id="tankId" 
                name="tankId" 
                value={selectedTankId}
                onChange={(e) => setSelectedTankId(e.target.value)}
                required 
                style={{ flex: 1 }}
              >
                <option value="">Selecione...</option>
                {tanques.map(t => (
                  <option key={t.id} value={t.id} disabled={t.status !== 'ativo'}>
                    {t.nome} ({t.status})
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ padding: '0.5rem', width: '42px', justifyContent: 'center' }}
                onClick={() => setShowTankModal(true)}
                title="Cadastrar novo tanque"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="ativo" required>
              <option value="ativo">Ativo</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
              <option value="morto">Morto</option>
            </select>
          </div>

          {/* Parentage */}
          <div className="form-group">
            <label htmlFor="paiId">Pai (opcional)</label>
            <select id="paiId" name="paiId">
              <option value="">Nenhum</option>
              {machos.map((m) => (
                <option key={m.id} value={m.id}>{m.id} — {m.linhagem}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maeId">Mãe (opcional)</label>
            <select id="maeId" name="maeId">
              <option value="">Nenhum</option>
              {femeas.map((f) => (
                <option key={f.id} value={f.id}>{f.id} — {f.linhagem}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="nota">Observações</label>
          <textarea id="nota" name="nota" placeholder="Notas sobre o peixe..." />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Peixe'}
          </button>
        </div>
      </form>

      {showTankModal && (
        <NovoTanqueModal 
          onClose={() => setShowTankModal(false)}
          onSuccess={(novo) => {
            setTanques(prev => [...prev, novo]);
            setSelectedTankId(novo.id);
          }}
        />
      )}
    </div>
  );
}
