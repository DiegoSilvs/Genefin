import React from 'react';
import Link from 'next/link';
import { Plus, Layers, Shield, Baby, TrendingUp, Presentation, Droplets } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import EmptyStateGuide from '@/components/ui/EmptyStateGuide';

export default async function EstruturasPage() {
  const supabase = await createClient();
  
  // Buscar estruturas com linhagem e a última medição de água
  const { data: estruturas } = await supabase
    .from('estruturas')
    .select(`
      *,
      linhagem:linhagens(nome, especie:especies(*)),
      medicoes:medicoes_agua(id, ph, temperatura, amonia, data_medicao)
    `)
    .order('nome');

  // Filtrar para ter apenas a última medição de cada estrutura (o Supabase traz todas)
  const estruturasComUltimaMedicao = estruturas?.map(e => {
    const ultimaMedicao = e.medicoes && e.medicoes.length > 0 
      ? e.medicoes.sort((a: any, b: any) => new Date(b.data_medicao).getTime() - new Date(a.data_medicao).getTime())[0]
      : null;
    return { ...e, ultimaMedicao };
  });

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'reproducao': return <Baby size={20} />;
      case 'crescimento': return <TrendingUp size={20} />;
      case 'quarentena': return <Shield size={20} />;
      case 'exibicao': return <Presentation size={20} />;
      default: return <Layers size={20} />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      reproducao: 'Reprodução',
      crescimento: 'Crescimento',
      quarentena: 'Quarentena',
      exibicao: 'Exibição'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      reproducao: 'bg-purple-100 text-purple-700',
      crescimento: 'bg-teal-100 text-teal-700',
      quarentena: 'bg-amber-100 text-amber-700',
      exibicao: 'bg-blue-100 text-blue-700'
    };
    return colors[tipo] || 'bg-slate-100 text-slate-700';
  };

  const getStatusAgua = (estrutura: any) => {
    const m = estrutura.ultimaMedicao;
    if (!m) return { color: 'bg-slate-300', label: 'Sem medição' };

    const diasSemMedicao = Math.floor((new Date().getTime() - new Date(m.data_medicao).getTime()) / (1000 * 60 * 60 * 24));
    if (diasSemMedicao > 3) return { color: 'bg-amber-500', label: 'Atrasada' };

    // Checar se está fora da faixa (lógica simplificada aqui)
    const esp = estrutura.linhagem?.especie;
    if (esp) {
      const phOk = (!esp.ph_min || m.ph >= esp.ph_min) && (!esp.ph_max || m.ph <= esp.ph_max);
      const tempOk = (!esp.temp_min || m.temperatura >= esp.temp_min) && (!esp.temp_max || m.temperatura <= esp.temp_max);
      if (!phOk || !tempOk || (m.amonia > 0.05)) return { color: 'bg-red-500', label: 'Crítico' };
    }

    return { color: 'bg-green-500', label: 'Água OK' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estruturas</h1>
          <p className="text-slate-500 font-medium">Gerencie seus aquários, tanques e baias</p>
        </div>
        {estruturas && estruturas.length > 0 && (
          <Link 
            href="/estruturas/nova" 
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Nova Estrutura
          </Link>
        )}
      </div>

      {estruturasComUltimaMedicao && estruturasComUltimaMedicao.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estruturasComUltimaMedicao.map((e: any) => {
            const status = getStatusAgua(e);
            return (
              <div 
                key={e.id} 
                className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${getTipoColor(e.tipo)}`}>
                      {getIcon(e.tipo)}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <div className={`w-2.5 h-2.5 rounded-full ${status.color} shadow-sm`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{status.label}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">{e.nome}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${getTipoColor(e.tipo)}`}>
                      {getTipoLabel(e.tipo)}
                    </span>
                  </div>

                  <div className="pt-4 space-y-3 border-t border-slate-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Linhagem</span>
                      <span className="text-slate-700 font-black">{e.linhagem?.nome || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Capacidade</span>
                      <span className="text-slate-700 font-black">{e.capacidade ? `${e.capacidade} un.` : '—'}</span>
                    </div>
                  </div>

                  {/* Último dado de água */}
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Droplets size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Última Medição</span>
                    </div>
                    {e.ultimaMedicao ? (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">pH</p>
                          <p className="font-black text-slate-900">{e.ultimaMedicao.ph.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Temp</p>
                          <p className="font-black text-slate-900">{e.ultimaMedicao.temperatura.toFixed(1)}°</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Amônia</p>
                          <p className="font-black text-slate-900">{e.ultimaMedicao.amonia.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-1">Nenhuma medição registrada.</p>
                    )}
                  </div>
                </div>

                <Link 
                  href={`/estruturas/${e.id}`}
                  className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center hover:bg-slate-100 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ver Detalhes</span>
                  <ArrowRight size={16} className="text-slate-300" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyStateGuide 
          title="Nenhum aquário cadastrado"
          description="Para organizar seu plantel, você precisa primeiro definir onde os peixes ficarão."
          currentStep={2}
        />
      )}
    </div>
  );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <TrendingUp size={size} className={className} style={{ transform: 'rotate(90deg)' }} />
);
