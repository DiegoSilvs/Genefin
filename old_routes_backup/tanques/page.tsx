import { getTanques, getPeixesNoTanque, getMedicoes } from '@/lib/db';
import TanquesDashboard from './_tanks-dashboard';
import { Tanque, Peixe, Medicao } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TanquesPage() {
  const tanques = await getTanques();
  
  // Buscar dados iniciais para todos os tanques em paralelo para evitar waterfalls no cliente
  const tanksData: Record<string, { peixes: Peixe[], historico: Medicao[] }> = {};
  
  await Promise.all(
    tanques.map(async (t) => {
      const [peixes, historico] = await Promise.all([
        getPeixesNoTanque(t.id),
        getMedicoes(t.id, 5)
      ]);
      tanksData[t.id] = { peixes, historico };
    })
  );

  return (
    <TanquesDashboard 
      initialTanques={tanques} 
      initialData={tanksData} 
    />
  );
}
