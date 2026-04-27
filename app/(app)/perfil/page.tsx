import { createClient } from '@/lib/supabase/server';
import { User, MapPin, Home, Save, CheckCircle2 } from 'lucide-react';
import { updateProfile } from '@/lib/actions/perfil';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca dados do perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();


  // O caso de retorno null do Supabase (usuário novo) é tratado aqui:
  // Se 'profile' for null, os campos do formulário ficarão vazios (defaultValue={profile?.campo || ''})
  // e o upsert no server action criará o registro.

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-teal-500/10 text-teal-600 rounded-2xl">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
          <p className="text-slate-500 font-medium">Gerencie suas informações e da sua fazenda</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle2 size={18} className="text-teal-500" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Informações Pessoais</h2>
          </div>
          <p className="text-sm text-slate-500">Estes dados ajudam a identificar você no sistema</p>
        </div>

        <form action={updateProfile} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Seu Nome Completo
              </label>
              <input 
                name="nome" 
                type="text" 
                defaultValue={profile?.nome || ''} 
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-teal-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Home size={14} /> Nome da Fazenda/Criadouro
              </label>
              <input 
                name="nome_fazenda" 
                type="text" 
                defaultValue={profile?.nome_fazenda || ''} 
                placeholder="Ex: Fazenda dos Discus"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-teal-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Cidade
              </label>
              <input 
                name="cidade" 
                type="text" 
                defaultValue={profile?.cidade || ''} 
                placeholder="Sua cidade"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-teal-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Estado
              </label>
              <select 
                name="estado" 
                defaultValue={profile?.estado || ''}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-teal-500 focus:bg-white outline-none transition-all appearance-none"
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2 tracking-tight">Segurança da Conta</h3>
          <p className="text-slate-400 font-medium">Sua conta está vinculada ao e-mail:</p>
          <p className="text-teal-400 font-black text-lg">{user.email}</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-teal-500/10 -skew-x-12 translate-x-1/2"></div>
      </div>
    </div>
  );
}
