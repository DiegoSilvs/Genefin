'use client';

import React, { useState, useMemo } from 'react';
import { Especie, Linhagem, Estrutura, Individuo } from '@/lib/types';
import { Save, X, Plus, Trash2, Fish, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface IndividuoFormProps {
  especies: Especie[];
  linhagens: Linhagem[];
  estruturas: Estrutura[];
  possiveisPais: Individuo[];
}

export default function IndividuoForm({ especies, linhagens, estruturas, possiveisPais }: IndividuoFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estados dos Campos
  const [especieId, setEspecieId] = useState('');
  const [linhagemId, setLinhagemId] = useState('');
  const [sexo, setSexo] = useState('M');
  const [origem, setOrigem] = useState('fundador');
  const [paiId, setPaiId] = useState('');
  const [maeId, setMaeId] = useState('');
  const [estruturaId, setEstruturaId] = useState('');
  const [nomePopular, setNomePopular] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fenotipos, setFenotipos] = useState([{ chave: '', valor: '' }]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // 1. Gerar código automático via RPC
      const { data: codigo, error: errorCodigo } = await supabase.rpc('gerar_codigo_individuo', {
        p_especie_id: especieId,
        p_linhagem_id: linhagemId,
        p_sexo: sexo
      });
      if (errorCodigo) throw errorCodigo;

      // 2. Calcular geração via RPC
      const { data: geracao, error: errorGeracao } = await supabase.rpc('calcular_geracao', {
        p_pai_id: paiId || null,
        p_mae_id: maeId || null
      });
      if (errorGeracao) throw errorGeracao;

      // 3. Montar objeto de fenotipos
      const fenotipoObj: Record<string, string> = {};
      fenotipos.forEach(f => {
        if (f.chave && f.valor) fenotipoObj[f.chave] = f.valor;
      });

      // 4. Inserir no banco
      const { data: novoIndividuo, error: insertError } = await supabase
        .from('individuos')
        .insert({
          usuario_id: user.id,
          especie_id: especieId,
          linhagem_id: linhagemId,
          sexo: sexo,
          origem: origem,
          codigo: codigo,
          geracao: geracao ?? 1,
          pai_id: paiId || null,
          mae_id: maeId || null,
          estrutura_id: estruturaId || null,
          nome_popular: nomePopular || null,
          fenotipo: fenotipoObj,
          data_nascimento: dataNascimento || null,
          status: 'ativo'
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      setSucesso(true);
      router.push(`/individuos/${novoIndividuo.id}`);
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setErro(err.message || 'Erro ao salvar reprodutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mensagens de Feedback */}
      {erro && (
        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="shrink-0" size={20} />
          <div>
            <p className="font-black text-sm uppercase tracking-tight">Erro ao salvar</p>
            <p className="text-sm font-medium opacity-90">{erro}</p>
          </div>
        </div>
      )}

      {sucesso && (
        <div className="p-4 bg-green-50 border-2 border-green-100 rounded-2xl flex items-start gap-3 text-green-700">
          <CheckCircle2 className="shrink-0" size={20} />
          <div>
            <p className="font-black text-sm uppercase tracking-tight">Sucesso!</p>
            <p className="text-sm font-medium opacity-90">Indivíduo cadastrado. Redirecionando...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label htmlFor="especie_id">Espécie</label>
          <select 
            id="especie_id" 
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
          <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} required>
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
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            required
          >
            <option value="fundador">Fundador (Compra/Externo)</option>
            <option value="ninhada">Promovido de Ninhada</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="data_nascimento">Data de Nascimento (Aprox.)</label>
          <input 
            id="data_nascimento" 
            type="date" 
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="pai_id">Pai (Genitor)</label>
          <select id="pai_id" value={paiId} onChange={(e) => setPaiId(e.target.value)} disabled={!linhagemId}>
            <option value="">Desconhecido / Externo</option>
            {paisFiltrados.map(p => <option key={p.id} value={p.id}>{p.codigo} {p.nome_popular ? `(${p.nome_popular})` : ''}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mae_id">Mãe (Matriz)</label>
          <select id="mae_id" value={maeId} onChange={(e) => setMaeId(e.target.value)} disabled={!linhagemId}>
            <option value="">Desconhecida / Externa</option>
            {maesFiltradas.map(m => <option key={m.id} value={m.id}>{m.codigo} {m.nome_popular ? `(${m.nome_popular})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="nome_popular">Nome Popular / Apelido</label>
          <input 
            id="nome_popular" 
            type="text" 
            value={nomePopular}
            onChange={(e) => setNomePopular(e.target.value)}
            placeholder="Ex: Blue 01, O Grande" 
          />
        </div>

        <div className="form-group">
          <label htmlFor="estrutura_id">Aquário Atual</label>
          <select id="estrutura_id" value={estruturaId} onChange={(e) => setEstruturaId(e.target.value)}>
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
                placeholder="Característica (ex: Cor)" 
                className="flex-1"
                value={f.chave}
                onChange={(e) => updateFenotipo(i, 'chave', e.target.value)}
              />
              <input 
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
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processando...</>
          ) : (
            <><Save size={18} /> Salvar Indivíduo</>
          )}
        </button>
      </div>
    </form>
  );
}
