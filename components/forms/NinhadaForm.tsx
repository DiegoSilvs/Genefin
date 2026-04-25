'use client';

import React, { useState, useMemo } from 'react';
import { createNinhada } from '@/lib/actions/ninhadas';
import { Especie, Linhagem, Estrutura, Individuo } from '@/lib/types';
import { Save, X, Baby, Heart } from 'lucide-react';
import Link from 'next/link';

interface NinhadaFormProps {
  especies: Especie[];
  linhagens: Linhagem[];
  estruturas: Estrutura[];
  possiveisPais: Individuo[];
}

export default function NinhadaForm({ especies, linhagens, estruturas, possiveisPais }: NinhadaFormProps) {
  const [especieId, setEspecieId] = useState('');
  const [linhagemId, setLinhagemId] = useState('');
  const [loading, setLoading] = useState(false);

  const linhagensFiltradas = useMemo(() => {
    return linhagens.filter(l => l.especie_id === especieId);
  }, [especieId, linhagens]);

  const machosFiltrados = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'M');
  }, [linhagemId, possiveisPais]);

  const femeasFiltradas = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'F');
  }, [linhagemId, possiveisPais]);

  return (
    <form action={createNinhada} onSubmit={() => setLoading(true)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="especie_id">Espécie</label>
          <select 
            id="especie_id" 
            name="especie_id" 
            required
            value={especieId}
            onChange={(e) => { setEspecieId(e.target.value); setLinhagemId(''); }}
          >
            <option value="">Selecione...</option>
            {especies.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="linhagem_id">Linhagem</label>
          <select 
            id="linhagem_id" 
            name="linhagem_id" 
            required
            disabled={!especieId}
            value={linhagemId}
            onChange={(e) => setLinhagemId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {linhagensFiltradas.map(l => <option key={l.id} value={l.id}>{l.nome} ({l.sigla})</option>)}
          </select>
        </div>
      </div>

      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-teal-800 flex items-center gap-2">
          <Heart size={18} /> Seleção do Casal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="pai_id">Macho Reprodutor</label>
            <select id="pai_id" name="pai_id" required disabled={!linhagemId}>
              <option value="">Selecione o macho...</option>
              {machosFiltrados.map(p => <option key={p.id} value={p.id}>{p.codigo} {p.nome_popular ? `(${p.nome_popular})` : ''}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mae_id">Fêmea Reprodutora</label>
            <select id="mae_id" name="mae_id" required disabled={!linhagemId}>
              <option value="">Selecione a fêmea...</option>
              {femeasFiltradas.map(m => <option key={m.id} value={m.id}>{m.codigo} {m.nome_popular ? `(${m.nome_popular})` : ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label htmlFor="data_cruzamento">Data do Cruzamento</label>
          <input id="data_cruzamento" name="data_cruzamento" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="form-group">
          <label htmlFor="data_nascimento">Data do Nascimento</label>
          <input id="data_nascimento" name="data_nascimento" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="form-group">
          <label htmlFor="total_nascidos">Total de Nascidos (Estimado)</label>
          <input id="total_nascidos" name="total_nascidos" type="number" required min="1" placeholder="Ex: 300" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="estrutura_id">Aquário dos Alevinos</label>
          <select id="estrutura_id" name="estrutura_id" required>
            <option value="">Selecione o aquário...</option>
            {estruturas.map(e => <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observações Iniciais</label>
          <textarea id="observacoes" name="observacoes" rows={2} placeholder="Condições da água, comportamento do casal..." />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
        <Link href="/ninhadas" className="btn btn-outline">
          <X size={18} /> Cancelar
        </Link>
        <button type="submit" className="btn btn-primary px-8" disabled={loading}>
          <Save size={18} />
          {loading ? 'Salvando...' : 'Criar Ninhada'}
        </button>
      </div>
    </form>
  );
}
