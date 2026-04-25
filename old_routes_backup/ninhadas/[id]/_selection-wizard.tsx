'use client';

import { useState } from 'react';
import { individualizarFilhote } from '@/lib/db';
import { QualidadePeixe } from '@/lib/types';
import { 
  Users, 
  Dna, 
  Trash2, 
  Save, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface SelectionWizardProps {
  ninhadaId: string;
  codigoBase: string;
}

export default function SelectionWizard({ ninhadaId, codigoBase }: SelectionWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Array<{
    sexo: 'macho' | 'femea';
    cor: string;
    qualidade: QualidadePeixe;
    nota: string;
  }>>([]);

  const addRow = () => {
    setSelections([...selections, { sexo: 'macho', cor: '', qualidade: 'regular', nota: '' }]);
  };

  const removeRow = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: string, value: string) => {
    const newSelections = [...selections];
    (newSelections[index] as any)[field] = value;
    setSelections(newSelections);
  };

  const handleSave = async () => {
    if (selections.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // Processar em lote (o RPC v3 garante a atomicidade de cada inserção)
      // Em uma aplicação real, poderíamos ter um RPC que aceitasse um array jsonb
      for (const sel of selections) {
        await individualizarFilhote({
          ninhadaId,
          sexo: sel.sexo,
          cor: sel.cor,
          qualidade: sel.qualidade,
          nota: sel.nota
        });
      }
      
      // Limpar e notificar sucesso
      setSelections([]);
      alert("Filhotes individualizados com sucesso!");
      window.location.reload();
    } catch (e: any) {
      setError(e.message || "Erro ao processar seleção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass selection-wizard">
      <div className="wizard-header">
        <Users size={20} />
        <h2>Individualização (Triagem)</h2>
      </div>

      {selections.length > 0 ? (
        <div className="selection-table-container">
          <table className="selection-table">
            <thead>
              <tr>
                <th>Linhagem/ID</th>
                <th>Sexo</th>
                <th>Cor Dominante</th>
                <th>Qualidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {selections.map((sel, i) => (
                <tr key={i}>
                  <td className="text-secondary">{codigoBase}-??</td>
                  <td>
                    <select 
                      value={sel.sexo} 
                      onChange={(e) => updateRow(i, 'sexo', e.target.value)}
                    >
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      placeholder="Ex: Vermelho" 
                      value={sel.cor} 
                      onChange={(e) => updateRow(i, 'cor', e.target.value)}
                    />
                  </td>
                  <td>
                    <select 
                      value={sel.qualidade} 
                      onChange={(e) => updateRow(i, 'qualidade', e.target.value)}
                    >
                      <option value="show">Show Grade</option>
                      <option value="top">Top</option>
                      <option value="regular">Regular</option>
                      <option value="pet">Pet</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-icon text-danger" onClick={() => removeRow(i)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="wizard-actions">
            <button className="btn btn-secondary btn-icon" onClick={addRow}>
              <Plus size={16} />
              <span>Adicionar Mais</span>
            </button>
            <button 
              className="btn btn-primary btn-icon" 
              onClick={handleSave}
              disabled={loading}
            >
              <Save size={16} />
              <span>{loading ? 'Salvando...' : 'Finalizar Lote'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="wizard-empty">
          <Dna size={32} className="text-secondary" />
          <p>Selecione os exemplares que atingiram o padrão desejado para individualizá-los.</p>
          <button className="btn btn-primary btn-icon" onClick={addRow}>
            <Plus size={16} />
            <span>Iniciar Seleção</span>
          </button>
        </div>
      )}

      {error && (
        <div className="error-box">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
