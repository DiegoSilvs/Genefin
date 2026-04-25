import React from 'react';
import { createClient } from '@/lib/supabase/server';
import EstruturaForm from '@/components/forms/EstruturaForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NovaEstruturaPage() {
  const supabase = await createClient();
  
  // Buscar linhagens para o select do formulário
  const { data: linhagens } = await supabase
    .from('linhagens')
    .select('*')
    .order('nome');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/estruturas" 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Estrutura</h1>
          <p className="text-slate-500 text-sm">Adicione um novo aquário ou tanque ao seu sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <EstruturaForm linhagens={linhagens || []} />
      </div>
    </div>
  );
}
