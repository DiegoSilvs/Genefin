import React from 'react';
import { createClient } from '@/lib/supabase/server';
import IndividuoForm from '@/components/forms/IndividuoForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NovoIndividuoPage() {
  const supabase = await createClient();
  
  const [
    { data: especies },
    { data: linhagens },
    { data: estruturas },
    { data: possiveisPais }
  ] = await Promise.all([
    supabase.from('especies').select('*').order('nome'),
    supabase.from('linhagens').select('*').order('nome'),
    supabase.from('estruturas').select('*').order('nome'),
    supabase.from('individuos').select('*').eq('status', 'ativo')
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/individuos" 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Indivíduo</h1>
          <p className="text-slate-500 text-sm">Cadastre um novo reprodutor ou matriz no plantel</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <IndividuoForm 
          especies={especies || []} 
          linhagens={linhagens || []} 
          estruturas={estruturas || []}
          possiveisPais={possiveisPais || []}
        />
      </div>
    </div>
  );
}
