'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Especie, Linhagem, Estrutura, Individuo } from '@/lib/types';
import { Save, X, Baby, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface NinhadaFormProps {
  especies: Especie[];
  linhagens: Linhagem[];
  estruturas: Estrutura[];
  possiveisPais: Individuo[];
}

export default function NinhadaForm({ especies, linhagens, estruturas, possiveisPais }: NinhadaFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [especieId, setEspecieId] = useState('');
  const [linhagemId, setLinhagemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linhagensFiltradas = useMemo(() => {
    return linhagens.filter(l => l.especie_id === especieId);
  }, [especieId, linhagens]);

  const machosFiltrados = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'M');
  }, [linhagemId, possiveisPais]);

  const femeasFiltradas = useMemo(() => {
    return possiveisPais.filter(p => p.linhagem_id === linhagemId && p.sexo === 'F');
  }, [linhagemId, possiveisPais]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Iniciando submissão da ninhada...", { especieId, linhagemId });

    try {
      const formData = new FormData(e.currentTarget);
      
      // 1. Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      console.log("Usuário autenticado:", user.id);

      // 2. Gerar código único via RPC do banco de dados
      const { data: codigo, error: rpcError } = await supabase.rpc('gerar_codigo_ninhada', {
        p_especie_id: especieId,
        p_linhagem_id: linhagemId
      });

      if (rpcError) {
        console.error("Erro no RPC gerar_codigo_ninhada:", rpcError);
        throw rpcError;
      }

      console.log("Código gerado com sucesso:", codigo);

      // 3. Salvar a ninhada no banco
      const totalNascidos = parseInt(formData.get('total_nascidos') as string);
      
      const insertData = {
        usuario_id: user.id,
        especie_id: especieId,
        linhagem_id: linhagemId,
        pai_id: formData.get('pai_id') || null,
        mae_id: formData.get('mae_id') || null,
        estrutura_id: formData.get('estrutura_id') || null,
        codigo: codigo,
        data_cruzamento: formData.get('data_cruzamento'),
        data_nascimento: formData.get('data_nascimento'),
        total_nascidos: totalNascidos,
        total_atual: totalNascidos,
        status: 'ativa',
        observacoes: formData.get('observacoes')
      };

      console.log("Tentando inserir dados:", insertData);

      const { error: insertError } = await supabase.from('ninhadas').insert(insertData);

      if (insertError) {
        console.error("Erro no insert da ninhada:", insertError);
        throw insertError;
      }

      console.log("Ninhada registrada com sucesso!");

      // 4. Sucesso: Redirecionar e atualizar
      router.push('/ninhadas');
      router.refresh();
      
    } catch (err: any) {
      console.error('Erro completo capturado:', err);
      setError(err.message || 'Falha ao processar a criação da ninhada.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
        </div>
      )}

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
            {linhagensFiltradas.map(l => (
              <option key={l.id} value={l.id}>{l.nome} ({l.numero.toString().padStart(3, '0')})</option>
            ))}
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
              {machosFiltrados.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo} {p.nome_popular ? `(${p.nome_popular})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mae_id">Fêmea Reprodutora</label>
            <select id="mae_id" name="mae_id" required disabled={!linhagemId}>
              <option value="">Selecione a fêmea...</option>
              {femeasFiltradas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.codigo} {m.nome_popular ? `(${m.nome_popular})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label htmlFor="data_cruzamento">Data do Cruzamento</label>
          <input 
            id="data_cruzamento" 
            name="data_cruzamento" 
            type="date" 
            required 
            defaultValue={new Date().toISOString().split('T')[0]} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="data_nascimento">Data do Nascimento</label>
          <input 
            id="data_nascimento" 
            name="data_nascimento" 
            type="date" 
            required 
            defaultValue={new Date().toISOString().split('T')[0]} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="total_nascidos">Total de Nascidos (Estimado)</label>
          <input 
            id="total_nascidos" 
            name="total_nascidos" 
            type="number" 
            required 
            min="1" 
            placeholder="Ex: 300" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="estrutura_id">Aquário dos Alevinos</label>
          <select id="estrutura_id" name="estrutura_id" required>
            <option value="">Selecione o aquário...</option>
            {estruturas.map(e => (
              <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observações Iniciais</label>
          <textarea 
            id="observacoes" 
            name="observacoes" 
            rows={2} 
            placeholder="Condições da água, comportamento do casal..." 
          />
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
