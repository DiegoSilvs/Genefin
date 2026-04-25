import LinhagensClient from '@/components/linhagens/LinhagensClient';

export default async function LinhagensPage() {
  const supabase = await createClient();
  const { data: linhagens } = await supabase
    .from('linhagens')
    .select('*, especie:especies(nome, sigla)')
    .order('nome');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Linhagens</h1>
          <p className="text-slate-500 font-medium">Defina os padrões genéticos do seu plantel</p>
        </div>
        <Link 
          href="/linhagens/nova" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Nova Linhagem
        </Link>
      </div>

      {linhagens && linhagens.length > 0 ? (
        <LinhagensClient linhagens={linhagens as any} />
      ) : (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center max-w-4xl mx-auto">
          <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300 mb-6">
            <Dna size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Nenhuma linhagem cadastrada</h3>
          <p className="text-slate-500 font-medium mb-10">Cadastre linhagens para organizar seus peixes por características genéticas e gerar códigos automáticos.</p>
          <Link 
            href="/linhagens/nova" 
            className="btn btn-primary px-10 py-4 font-black"
          >
            Cadastrar Primeira Linhagem
          </Link>
        </div>
      )}
    </div>
  );
}
