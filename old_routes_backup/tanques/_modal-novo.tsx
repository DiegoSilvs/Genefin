'use client';

import { useState } from 'react';
import { X, Save, Thermometer, Droplets, LayoutGrid, Ruler, ShieldCheck } from 'lucide-react';
import { addTanque } from '@/lib/db';
import { Tanque } from '@/lib/types';

interface NovoTanqueModalProps {
  onSuccess?: (tanque: Tanque) => void;
  onClose: () => void;
}

export function NovoTanqueModal({ onSuccess, onClose }: NovoTanqueModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      tipo: formData.get('tipo') as string,
      tipoUso: formData.get('tipoUso') as any,
      status: formData.get('status') as any,
      volumeLitros: Number(formData.get('volumeLitros')),
      capacidadeBiologica: Number(formData.get('capacidadeBiologica')),
      phIdealMin: Number(formData.get('phIdealMin')),
      phIdealMax: Number(formData.get('phIdealMax')),
      tempIdealMin: Number(formData.get('tempIdealMin')),
      tempIdealMax: Number(formData.get('tempIdealMax')),
    };

    try {
      const novoTanque = await addTanque(data);
      if (onSuccess) onSuccess(novoTanque);
      onClose();
    } catch (err: any) {
      console.error('Erro ao cadastrar tanque:', err);
      // Se for erro de enum, avisar especificamente
      if (err.message?.includes('tipo_uso_tanque')) {
        setError('Erro de permissão no banco: Você precisa executar o SQL para adicionar a categoria "Matriz".');
      } else {
        setError(err.message || 'Erro inesperado ao salvar o tanque.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="modal" style={{ 
        maxWidth: '520px', 
        padding: 0, 
        overflowY: 'auto', 
        maxHeight: 'calc(100vh - 4rem)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Fixo */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Configurar Novo Tanque</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Defina o ambiente e parâmetros de biosegurança</p>
          <button 
            type="button"
            onClick={onClose} 
            className="btn-icon" 
            style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '1.5rem', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              borderRadius: '8px'
            }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div className="validation-error" style={{ 
              marginBottom: '1.5rem', 
              background: '#fee2e2', 
              border: '1px solid #ef4444', 
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {/* Seção 1: Identificação */}
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutGrid size={14} /> Identificação e Finalidade
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nome" style={{ fontSize: '0.75rem', color: '#64748b' }}>NOME DO TANQUE</label>
                <input id="nome" name="nome" type="text" placeholder="Ex: Matrizes Betta A1" required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="tipo" style={{ fontSize: '0.75rem', color: '#64748b' }}>ESTRUTURA</label>
                  <select id="tipo" name="tipo" required>
                    <option value="bacia">Bacia Plástica</option>
                    <option value="aquario">Aquário</option>
                    <option value="caixa_dagua">Caixa d'água</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="tipoUso" style={{ fontSize: '0.75rem', color: '#64748b' }}>FINALIDADE</label>
                  <select id="tipoUso" name="tipoUso" required>
                    <option value="matriz">Matriz</option>
                    <option value="reproducao">Reprodução</option>
                    <option value="crescimento">Crescimento</option>
                    <option value="quarentena">Quarentena</option>
                    <option value="isolamento">Isolamento</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 2: Capacidade */}
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ruler size={14} /> Dimensionamento
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="volumeLitros" style={{ fontSize: '0.75rem', color: '#64748b' }}>VOLUME (L)</label>
                <input id="volumeLitros" name="volumeLitros" type="number" defaultValue={20} required />
              </div>
              <div className="form-group">
                <label htmlFor="capacidadeBiologica" style={{ fontSize: '0.75rem', color: '#64748b' }}>LIMITE BIO</label>
                <input id="capacidadeBiologica" name="capacidadeBiologica" type="number" defaultValue={10} required />
              </div>
            </div>
          </section>

          {/* Seção 3: Parâmetros */}
          <section style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> Parâmetros de Segurança
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={14} color="#0369a1" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>pH Ideal</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input name="phIdealMin" type="number" step="0.1" defaultValue={6.5} style={{ width: '60px', padding: '0.3rem', textAlign: 'center' }} />
                    <span style={{ fontSize: '0.7rem' }}>-</span>
                    <input name="phIdealMax" type="number" step="0.1" defaultValue={7.5} style={{ width: '60px', padding: '0.3rem', textAlign: 'center' }} />
                 </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Thermometer size={14} color="#991b1b" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Temp. (°C)</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input name="tempIdealMin" type="number" step="0.5" defaultValue={24.0} style={{ width: '60px', padding: '0.3rem', textAlign: 'center' }} />
                    <span style={{ fontSize: '0.7rem' }}>-</span>
                    <input name="tempIdealMax" type="number" step="0.5" defaultValue={28.0} style={{ width: '60px', padding: '0.3rem', textAlign: 'center' }} />
                 </div>
              </div>
            </div>
          </section>

          <div className="form-group">
            <label htmlFor="status" style={{ fontSize: '0.75rem', color: '#64748b' }}>STATUS</label>
            <select id="status" name="status" defaultValue="ativo">
              <option value="ativo">Disponível / Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, height: '44px' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, height: '44px', justifyContent: 'center' }}>
              <Save size={18} />
              {loading ? 'Salvando...' : 'Criar Tanque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
