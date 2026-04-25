import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAlertasDashboard } from '@/lib/alertas';
import Link from 'next/link';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Baby, 
  Fish, 
  Layers 
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const alertas = await getAlertasDashboard();

  // Buscar estatísticas
  const [
    { count: totalNinhadas },
    { count: totalIndividuos },
    { count: totalEstruturas }
  ] = await Promise.all([
    supabase.from('ninhadas').select('*', { count: 'exact', head: true }).eq('status', 'ativa'),
    supabase.from('individuos').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('estruturas').select('*', { count: 'exact', head: true }).eq('ativa', true)
  ]);

  const nomeUsuario = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Produtor';

  const alertasAlta = alertas.filter(a => a.prioridade === 'alta');
  const alertasMedia = alertas.filter(a => a.prioridade === 'media');
  const alertasBaixa = alertas.filter(a => a.prioridade === 'baixa');

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bom dia, {nomeUsuario}</h1>
        <p className="text-slate-500 font-medium">Aqui está o resumo da sua produção hoje.</p>
      </div>

      {/* 1. DASHBOARD: Cards de métricas no topo (Sempre visíveis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Baby size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ninhadas</p>
            <p className="text-3xl font-black text-slate-900">{totalNinhadas || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
            <Fish size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reprodutores</p>
            <p className="text-3xl font-black text-slate-900">{totalIndividuos || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <Layers size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aquários</p>
            <p className="text-3xl font-black text-slate-900">{totalEstruturas || 0}</p>
          </div>
        </div>
      </div>

      {/* Alertas com cores semânticas */}
      <div className="space-y-6">
        {alertas.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-10 text-center">
            <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-green-900">Tudo em ordem hoje!</h2>
            <p className="text-green-700 font-medium">Não há pendências urgentes no sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Urgente (Vermelho) */}
            {alertasAlta.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-red-600">
                  <AlertCircle size={20} className="animate-pulse" />
                  <h2 className="font-black uppercase tracking-widest text-sm">Urgente</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertasAlta.map((alerta, i) => (
                    <Link key={i} href={alerta.link} className="block group">
                      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group-hover:translate-x-1 border border-red-100">
                        <h4 className="font-bold text-red-900">{alerta.titulo}</h4>
                        <p className="text-sm text-red-700 mt-1">{alerta.descricao}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Hoje (Amarelo) */}
            {alertasMedia.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-amber-600">
                  <AlertTriangle size={20} />
                  <h2 className="font-black uppercase tracking-widest text-sm">Para Hoje</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertasMedia.map((alerta, i) => (
                    <Link key={i} href={alerta.link} className="block group">
                      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group-hover:translate-x-1 border border-amber-100">
                        <h4 className="font-bold text-amber-900">{alerta.titulo}</h4>
                        <p className="text-sm text-amber-800 mt-1">{alerta.descricao}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Informativo (Azul) */}
            {alertasBaixa.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <Info size={20} />
                  <h2 className="font-black uppercase tracking-widest text-sm">Informações</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {alertasBaixa.map((alerta, i) => (
                    <div key={i} className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 shadow-sm border border-blue-100">
                      <h4 className="font-bold text-blue-900 text-sm">{alerta.titulo}</h4>
                      <p className="text-xs text-blue-700 mt-1">{alerta.descricao}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
