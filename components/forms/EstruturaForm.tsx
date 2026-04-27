'use client';

import React, { useState } from 'react';
import { createEstrutura } from '@/lib/actions/estruturas';
import { Linhagem } from '@/lib/types';
import { Save, X } from 'lucide-react';
import Link from 'next/link';

interface EstruturaFormProps {
  linhagens: Linhagem[];
}

export default function EstruturaForm({ linhagens }: EstruturaFormProps) {
  const [tipo, setTipo] = useState('reproducao');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    // O formulário usa Server Action, mas podemos adicionar feedback aqui
  }

  return (
    <form action={createEstrutura} onSubmit={() => setLoading(true)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="nome">Nome da Estrutura</label>
          <input 
            id="nome" 
            name="nome" 
            type="text" 
            required 
            placeholder="Ex: AQ-01, Tanque Externo, Baia A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Uso</label>
          <select 
            id="tipo" 
            name="tipo" 
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="reproducao">Reprodução</option>
            <option value="crescimento">Crescimento</option>
            <option value="quarentena">Quarentena</option>
            <option value="exibicao">Exibição</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="linhagem_id">Linhagem Associada</label>
          <select 
            id="linhagem_id" 
            name="linhagem_id"
            disabled={tipo === 'quarentena'}
            className={tipo === 'quarentena' ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}
          >
            <option value="">Nenhuma / Mista</option>
            {linhagens.map((l) => (
              <option key={l.id} value={l.id}>{l.nome} ({l.numero.toString().padStart(3, '0')})</option>
            ))}
          </select>
          {tipo === 'quarentena' && (
            <p className="text-[10px] text-amber-600 font-medium mt-1">
              Estruturas de quarentena não podem ser vinculadas a uma linhagem fixa.
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="capacidade">Capacidade (nº de peixes)</label>
          <input 
            id="capacidade" 
            name="capacidade" 
            type="number" 
            placeholder="Opcional"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observacoes">Observações</label>
        <textarea 
          id="observacoes" 
          name="observacoes" 
          rows={4}
          placeholder="Detalhes sobre filtragem, iluminação ou histórico..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
        <Link 
          href="/estruturas" 
          className="btn btn-outline"
        >
          <X size={18} />
          Cancelar
        </Link>
        <button 
          type="submit" 
          className="btn btn-primary px-8"
          disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Salvando...' : 'Salvar Estrutura'}
        </button>
      </div>
    </form>
  );
}
