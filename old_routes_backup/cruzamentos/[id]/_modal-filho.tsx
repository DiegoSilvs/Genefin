'use client';

import { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { LINHAGENS_BETTA } from '@/lib/mock-data';
import { addFilhoAoCruzamento, getIdsFilhosDoCruzamento } from '@/lib/db';
import { Cruzamento } from '@/lib/types';

export function NovoFilhoModal({ cruzamento }: { cruzamento: Cruzamento }) {
  const [open, setOpen] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [idsGerados, setIdsGerados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [baseIndex, setBaseIndex] = useState(1);

  // Ao abrir, carregar contagem de filhos existentes
  async function loadSugestao() {
    try {
      const ids = await getIdsFilhosDoCruzamento(cruzamento.id);
      const newBase = ids.length + 1;
      setBaseIndex(newBase);
      // Gerar IDs iniciais
      const novos: string[] = [];
      for (let i = 0; i < quantidade; i++) {
        novos.push(`A${newBase + i}`);
      }
      setIdsGerados(novos);
    } catch {
      setBaseIndex(1);
    }
  }

  function abrir() {
    setOpen(true);
    loadSugestao();
  }

  function handleQuantidadeChange(newQtd: number) {
    setQuantidade(newQtd);
    const novos: string[] = [];
    for (let i = 0; i < newQtd; i++) {
      novos.push(`A${baseIndex + i}`);
    }
    setIdsGerados(novos);
  }


  function onIdChange(index: number, valor: string) {
    setIdsGerados((prev) => {
      const next = [...prev];
      next[index] = valor;
      return next;
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    // Adicionar cada filhote
    for (const id of idsGerados) {
      try {
        await addFilhoAoCruzamento(cruzamento.id, {
          id,
          linhagem: fd.get('linhagem') as string,
          cor: fd.get('cor') as string,
          tankId: fd.get('tankId') as string,
          nascimento: fd.get('nascimento') as string,
          nota: (fd.get('nota') as string) || undefined,
        });
      } catch (err) {
        alert(`Erro ao adicionar ${id}: ${(err as Error).message}`);
        setLoading(false);
        return;
      }
    }

    window.location.reload();
  };

  return (
    <>
      <button className="btn btn-primary" onClick={abrir}>
        <Plus size={18} />
        Adicionar Filho
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Adicionar Filho{quantidade > 1 ? 's' : ''}</h2>
              <button onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Preview de IDs */}
              <div className="form-group">
                <label>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Sparkles size={14} /> IDs gerados
                  </span>
                </label>
                <div className="ids-preview">
                  {idsGerados.map((id, i) => (
                    <input
                      key={i}
                      type="text"
                      value={id}
                      onChange={(e) => onIdChange(i, e.target.value)}
                      className="id-input"
                      required
                    />
                  ))}
                </div>
                <div className="quantidade-row">
                  <label htmlFor="qtd">Quantidade de filhotes:</label>
                  <select
                    id="qtd"
                    value={quantidade}
                    onChange={(e) => handleQuantidadeChange(Number(e.target.value))}
                    className="qtd-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campos comuns (todos compartilham) */}
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="nascimento">Data de nascimento</label>
                  <input id="nascimento" name="nascimento" type="date" required />
                </div>
                <div className="form-group">
                  <label htmlFor="linhagem">Linhagem</label>
                  <select id="linhagem" name="linhagem" required>
                    <option value="">Selecione...</option>
                    {LINHAGENS_BETTA.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cor">Cor/Padrão</label>
                  <input id="cor" name="cor" type="text" placeholder="ex: Multicolorido" required />
                </div>
                <div className="form-group">
                  <label htmlFor="tankId">Bacia/Tanque</label>
                  <input id="tankId" name="tankId" type="text" placeholder="ex: A3" required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="nota">Observações (aplica a todos)</label>
                <textarea id="nota" name="nota" placeholder="Notas sobre os filhotes..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : `Adicionar ${quantidade} Filhote${quantidade > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
