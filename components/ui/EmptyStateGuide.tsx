import React from 'react';
import { Tag, Layers, Fish, Baby, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateGuideProps {
  title: string;
  description: string;
  currentStep: 1 | 2 | 3 | 4;
}

export default function EmptyStateGuide({ title, description, currentStep }: EmptyStateGuideProps) {
  const steps = [
    { id: 1, title: 'Linhagens', icon: Tag, href: '/linhagens/nova', label: 'Cadastrar Linhagem' },
    { id: 2, title: 'Aquários', icon: Layers, href: '/estruturas/nova', label: 'Cadastrar Aquário' },
    { id: 3, title: 'Reprodutores', icon: Fish, href: '/individuos/novo', label: 'Cadastrar Peixe' },
    { id: 4, title: 'Ninhadas', icon: Baby, href: '/ninhadas/nova', label: 'Iniciar Ninhada' },
  ];

  const firstIncomplete = steps.find(s => s.id === currentStep);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 md:p-12 text-center max-w-4xl mx-auto">
      <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 font-medium mb-10">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div 
              key={step.id} 
              className={`p-6 rounded-2xl border-2 transition-all ${
                isCurrent ? 'border-teal-500 bg-teal-50 shadow-md scale-105 z-10' : 
                isDone ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-100 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isCurrent ? 'bg-teal-500 text-white' : 
                isDone ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-400'
              }`}>
                <span className="text-sm font-black">{step.id}</span>
              </div>
              <Icon size={24} className={isCurrent ? 'text-teal-600' : 'text-slate-400'} style={{margin: '0 auto 8px'}} />
              <p className={`text-xs font-black uppercase tracking-widest ${isCurrent ? 'text-teal-800' : 'text-slate-400'}`}>
                {step.title}
              </p>
            </div>
          );
        })}
      </div>

      {firstIncomplete && (
        <Link 
          href={firstIncomplete.href} 
          className="btn btn-primary px-10 py-4 text-lg font-black shadow-xl shadow-teal-100 group"
        >
          {firstIncomplete.label}
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
