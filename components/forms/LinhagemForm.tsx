'use client';

import React, { useState } from 'react';
import { createLinhagem } from '@/lib/actions/linhagens';
import { Especie } from '@/lib/types';
import { Save, X } from 'lucide-react';
import Link from 'next/link';

interface LinhagemFormProps {
  especies: Especie[];
}

export default function LinhagemForm({ especies }: LinhagemFormProps) {
  const [loading, setLoading] = useState(false);

  return (
    <form action={createLinhagem} onSubmit={() => setLoading(true)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="especie_id">Espécie</label>
          <select id="especie_id" name="especie_id" required>
            <option value="">Selecione uma espécie...</option>
            {especies.map((e) => (
              <option key={e.id} value={e.id}>{e.nome} ({e.nome_cientifico})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nome">Nome da Linhagem</label>
          <input 
            id="nome" 
            name="nome" 
            type="text" 
            required 
            placeholder="Ex: Blue Diamond, Red Dragon"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição (Opcional)</label>
        <textarea 
          id="descricao" 
          name="descricao" 
          rows={4}
          placeholder="Características principais, origem ou padrões de seleção..."
        />
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <p className="text-xs text-slate-500 flex items-center gap-2 italic">
          💡 O código da linhagem será gerado automaticamente (ex: 001, 002) conforme a ordem de cadastro para esta espécie.
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
        <Link 
          href="/linhagens" 
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
          {loading ? 'Salvando...' : 'Salvar Linhagem'}
        </button>
      </div>
    </form>
  );
}
