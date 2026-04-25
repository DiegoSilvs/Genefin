'use client';

import React, { useState, useMemo } from 'react';
import { createIndividuo } from '@/lib/actions/individuos';
import { Especie, Linhagem, Estrutura, Individuo } from '@/lib/types';
import { Save, X, Plus, Trash2, Fish } from 'lucide-react';
import Link from 'next/link';

interface IndividuoFormProps {
  especies: Especie[];
  linhagens: Linhagem[];
  estruturas: Estrutura[];
  possiveisPais: Individuo[];
}

export default function IndividuoForm({ especies, linhagens, estruturas, possiveisPais }: IndividuoFormProps) {
  const [especieId, setEspecieId] = useState('');
  const [linhagemId, setLinhagemId] = useState('');
  const [origem, setOrigem] = useState('fundador');
  const [loading, setLoading] = useState(false);
  const [fenotipos, setFenotipos] = useState([{ chave: '', valor: '' }]);

  const linhagensFiltradas = useMemo(() => {
    return linhagens.filter(l => l.especie_id === especieId);
  }, [especieId, linhagens]);

  const paisFiltrados = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'M');
  }, [linhagemId, possiveisPais]);

  const maesFiltradas = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'F');
  }, [linhagemId, possiveisPais]);

  const addFenotipo = () => setFenotipos([...fenotipos, { chave: '', valor: '' }]);
  const removeFenotipo = (index: number) => setFenotipos(fenotipos.filter((_, i) => i !== index));
  const updateFenotipo = (index: number, field: 'chave' | 'valor', value: string) => {
    const newF = [...fenotipos];
    newF[index][field] = value;
    setFenotipos(newF);
  };

  return (
    <form action={createIndividuo} onSubmit={() => setLoading(true)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {linhagensFiltradas.map(l => (
              <option key={l.id} value={l.id}>
                {l.nome} ({l.numero.toString().padStart(3, '0')})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sexo">Sexo</label>
          <select id="sexo" name="sexo" required>
            <option value="M">Macho</option>
            <option value="F">Fêmea</option>
            <option value="I">Indeterminado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl">
        <div className="form-group">
          <label htmlFor="origem">Origem</label>
          <select 
            id="origem" 
            name="origem" 
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            required
          >
            <option value="fundador">Fundador (Compra/Externo)</option>
            <option value="ninhada">Promovido de Ninhada</option>
          </select>
        </div>

        {origem === 'fundador' ? (
          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento (Aprox.)</label>
            <input id="data_nascimento" name="data_nascimento" type="date" />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="ninhada_origem_id">Ninhada de Origem</label>
            <select id="ninhada_origem_id" name="ninhada_origem_id">
              <option value="">Selecione a ninhada...</option>
              {/* Ninhadas virão aqui no futuro */}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="pai_id">Pai (Genitor)</label>
          <select id="pai_id" name="pai_id" disabled={!linhagemId}>
            <option value="">Desconhecido / Externo</option>
            {paisFiltrados.map(p => <option key={p.id} value={p.id}>{p.codigo} {p.nome_popular ? `(${p.nome_popular})` : ''}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mae_id">Mãe (Matriz)</label>
          <select id="mae_id" name="mae_id" disabled={!linhagemId}>
            <option value="">Desconhecida / Externa</option>
            {maesFiltradas.map(m => <option key={m.id} value={m.id}>{m.codigo} {m.nome_popular ? `(${m.nome_popular})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="nome_popular">Nome Popular / Apelido</label>
          <input id="nome_popular" name="nome_popular" type="text" placeholder="Ex: Blue 01, O Grande" />
        </div>

        <div className="form-group">
          <label htmlFor="estrutura_id">Aquário Atual</label>
          <select id="estrutura_id" name="estrutura_id">
            <option value="">Sem aquário definido</option>
            {estruturas.map(e => <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>)}
          </select>
        </div>
      </div>

      {/* Fenótipos Dinâmicos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Fish size={18} />
            Características (Fenótipos)
          </h3>
          <button 
            type="button" 
            onClick={addFenotipo}
            className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
        <div className="grid gap-3">
          {fenotipos.map((f, i) => (
            <div key={i} className="flex gap-3">
              <input 
                name="fenotipo_chave"
                placeholder="Característica (ex: Cor)" 
                className="flex-1"
                value={f.chave}
                onChange={(e) => updateFenotipo(i, 'chave', e.target.value)}
              />
              <input 
                name="fenotipo_valor"
                placeholder="Valor (ex: Azul Cobalto)" 
                className="flex-1"
                value={f.valor}
                onChange={(e) => updateFenotipo(i, 'valor', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => removeFenotipo(i)}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
        <Link href="/individuos" className="btn btn-outline">
          <X size={18} /> Cancelar
        </Link>
        <button type="submit" className="btn btn-primary px-8" disabled={loading}>
          <Save size={18} />
          {loading ? 'Processando...' : 'Salvar Indivíduo'}
        </button>
      </div>
    </form>
  );
}
