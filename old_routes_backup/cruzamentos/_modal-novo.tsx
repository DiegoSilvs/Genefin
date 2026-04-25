'use client';

import { useState } from 'react';
import { Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { addCruzamento, getPeixesPorSexo } from '@/lib/db';
import { Peixe } from '@/lib/types';
import { checkParentesco, ResultadoGenetico } from '@/lib/genetica';

export function NovoCruzamentoModal() {
  const [open, setOpen] = useState(false);
  const [machos, setMachos] = useState<Peixe[]>([]);
  const [femeas, setFemeas] = useState<Peixe[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [machoSelecionado, setMachoSelecionado] = useState<string>('');
  const [femeaSelecionada, setFemeaSelecionada] = useState<string>('');
  const [validacao, setValidacao] = useState<ResultadoGenetico | null>(null);

  async function loadParents() {
    if (loaded) return;
    try {
      const [m, f] = await Promise.all([
        getPeixesPorSexo('macho'),
        getPeixesPorSexo('femea'),
      ]);
      setMachos(m);
      setFemeas(f);
      setLoaded(true);
    } catch {
      // silent fail
    }
  }

  function handleOpen() {
    setOpen(true);
    loadParents();
  }

  function validar() {
    if (!machoSelecionado || !femeaSelecionada) {
      setValidacao(null);
      return;
    }
    const macho = machos.find((m) => m.id === machoSelecionado);
    const femea = femeas.find((f) => f.id === femeaSelecionada);
    if (!macho || !femea) {
      setValidacao(null);
      return;
    }
    setValidacao(checkParentesco(macho, femea));
  }

  function onMachoChange(id: string) {
    setMachoSelecionado(id);
    setTimeout(() => validar(), 0);
  }

  function onFemeaChange(id: string) {
    setFemeaSelecionada(id);
    setTimeout(() => validar(), 0);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação final antes de enviar
    if (validacao?.status === 'proibido') {
      alert(validacao.motivo);
      return;
    }

    setSaving(true);

    const fd = new FormData(e.currentTarget);
    try {
      await addCruzamento({
        machoId: fd.get('machoId') as string,
        femeaId: fd.get('femeaId') as string,
        data: fd.get('data') as string,
        observacao: (fd.get('observacao') as string) || undefined,
      });
    } catch (err) {
      alert('Erro ao registrar: ' + (err as Error).message);
      setSaving(false);
      return;
    }

    window.location.reload();
  };

  return (
    <>
      <button className="btn btn-primary" onClick={handleOpen}>
        <Plus size={18} />
        Novo Cruzamento
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Novo Cruzamento</h2>
              <button onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="machoId">Macho</label>
                  <select
                    id="machoId"
                    name="machoId"
                    required
                    value={machoSelecionado}
                    onChange={(e) => onMachoChange(e.target.value)}
                  >
                    <option value="">Selecione o macho...</option>
                    {machos.map((m) => (
                      <option key={m.id} value={m.id}>{m.id} — {m.linhagem}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="femeaId">Fêmea</label>
                  <select
                    id="femeaId"
                    name="femeaId"
                    required
                    value={femeaSelecionada}
                    onChange={(e) => onFemeaChange(e.target.value)}
                  >
                    <option value="">Selecione a fêmea...</option>
                    {femeas.map((f) => (
                      <option key={f.id} value={f.id}>{f.id} — {f.linhagem}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="data">Data do cruzamento</label>
                  <input id="data" name="data" type="date" required />
                </div>
              </div>

              {/* Feedback de validação genética */}
              {validacao && (
                <div className={`validacao-msg ${validacao.status}`}>
                  {validacao.status === 'proibido' ? (
                    <>
                      <AlertTriangle size={18} />
                      <span>{validacao.motivo}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Cruzamento geneticamente válido</span>
                    </>
                  )}
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="observacao">Observações</label>
                <textarea id="observacao" name="observacao" placeholder="Notas sobre o cruzamento..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || validacao?.status === 'proibido'}
                >
                  {saving ? 'Salvando...' : 'Registrar Cruzamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
