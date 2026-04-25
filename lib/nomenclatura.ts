// ─── Nomenclatura automática de peixes ───────────────────

export type PrefixoEspecie = 'BT' | 'GP' | 'PL' | 'ML';

// Mapeamento espécie → prefixo
const PREFIXOS: Record<string, PrefixoEspecie> = {
  betta: 'BT',
  guppy: 'GP',
  platy: 'PL',
  molly: 'ML',
};

/**
 * Gera sugestão de ID para um novo peixe.
 * Baseado na espécie e no último ID usado.
 *
 * @param chaveEspecie - chave da especie (ex: 'betta', 'guppy')
 * @param ultimoNumero - último número usado (0 = inicia do 1)
 */
export function gerarIdPeixe(chaveEspecie: string, ultimoNumero: number = 0): string {
  const prefixo = PREFIXOS[chaveEspecie] ?? 'XX';
  const proximo = ultimoNumero + 1;
  return `${prefixo}-${String(proximo).padStart(3, '0')}`;
}

/**
 * Gera ID para filhote de um cruzamento.
 * Formato: CRZ-XXX-F1, CRZ-XXX-F2, etc.
 */
export function gerarIdFilho(cruzamentoId: string, quantidade: number): string[] {
  const ids: string[] = [];
  for (let i = 1; i <= quantidade; i++) {
    ids.push(`${cruzamentoId}-F${i}`);
  }
  return ids;
}

/**
 * Extrai o último número de uma sequência de IDs.
 * Ex: ['BT-001', 'BT-003', 'BT-007'] → 7
 */
export function extrairUltimoNumero(ids: string[], prefixo: string): number {
  const regex = new RegExp(`^${prefixo}-(\\d+)$`);
  let max = 0;
  for (const id of ids) {
    const match = id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  return max;
}
