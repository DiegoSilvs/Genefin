'use client';

import { updateCruzamentoStatus } from '@/lib/db';
import type { Cruzamento } from '@/lib/types';

export function StatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  return (
    <select
      className="crz-status-select"
      value={currentStatus}
      onChange={async (e) => {
        await updateCruzamentoStatus(id, e.target.value as Cruzamento['status']);
        window.location.reload();
      }}
    >
      <option value="planejado">Planejado</option>
      <option value="em_curso">Em curso</option>
      <option value="finalizado">Finalizado</option>
      <option value="falhou">Falhou</option>
    </select>
  );
}
