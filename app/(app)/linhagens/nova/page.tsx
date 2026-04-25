import React from 'react';
import { createClient } from '@/lib/supabase/server';
import LinhagemForm from '@/components/forms/LinhagemForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NovaLinhagemPage() {
  const supabase = await createClient();
  
  // Buscar espécies pré-cadastradas
  const { data: especies } = await supabase
    .from('especies')
    .select('*')
    .order('nome');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/linhagens" 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Linhagem</h1>
          <p className="text-slate-500 text-sm">Defina uma nova variação genética para o seu plantel</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <LinhagemForm especies={especies || []} />
      </div>
    </div>
  );
}
