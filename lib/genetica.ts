// ─── Validação genética para cruzamentos ─────────────────

export interface PeixeBasico {
  id: string;
  paiId?: string;
  maeId?: string;
}

export type ResultadoParentesco = 'permitido' | 'proibido';

export interface ResultadoGenetico {
  status: ResultadoParentesco;
  motivo?: string;
}

/**
 * Verifica se dois peixes podem cruzar.
 *
 * Bloqueia:
 * - Mesmo peixe
 * - Pai com filho
 * - Mãe com filho
 * - Irmãos (mesmo pai ou mesma mãe)
 */
export function checkParentesco(a: PeixeBasico, b: PeixeBasico): ResultadoGenetico {
  // 1. Mesmo peixe
  if (a.id === b.id) {
    return { status: 'proibido', motivo: 'Não é possível cruzar um peixe com ele mesmo' };
  }

  // 2. Pai com filho (a é pai de b)
  if (b.paiId && b.paiId === a.id) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são pai e filho' };
  }

  // 3. Mãe com filho (a é mãe de b)
  if (b.maeId && b.maeId === a.id) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são mãe e filho' };
  }

  // 4. Pai com filho (b é pai de a)
  if (a.paiId && a.paiId === b.id) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são pai e filho' };
  }

  // 5. Mãe com filho (b é mãe de a)
  if (a.maeId && a.maeId === b.id) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são mãe e filho' };
  }

  // 6. Irmãos (mesmo pai)
  if (a.paiId && b.paiId && a.paiId === b.paiId) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são irmãos (mesmo pai)' };
  }

  // 7. Irmãos (mesma mãe)
  if (a.maeId && b.maeId && a.maeId === b.maeId) {
    return { status: 'proibido', motivo: 'Cruzamento não permitido: peixes são irmãos (mesma mãe)' };
  }

  return { status: 'permitido' };
}

export interface Probabilidade {
  caracteristica: string;
  opcoes: { valor: string; chance: number }[];
}

/**
 * Calcula probabilidades genéticas simplificadas para o cruzamento.
 */
export function calculateProbabilidades(macho: { cor: string; linhagem: string }, femea: { cor: string; linhagem: string }): Probabilidade[] {
  const probCor: Probabilidade = {
    caracteristica: 'Cor Predominante',
    opcoes: [],
  };

  if (macho.cor === femea.cor) {
    probCor.opcoes = [
      { valor: macho.cor, chance: 90 },
      { valor: 'Outras', chance: 10 },
    ];
  } else {
    probCor.opcoes = [
      { valor: macho.cor, chance: 45 },
      { valor: femea.cor, chance: 45 },
      { valor: 'Mix/Outras', chance: 10 },
    ];
  }

  const probLinhagem: Probabilidade = {
    caracteristica: 'Linhagem (F1)',
    opcoes: [],
  };

  if (macho.linhagem === femea.linhagem) {
    probLinhagem.opcoes = [{ valor: macho.linhagem, chance: 95 }, { valor: 'Mutação', chance: 5 }];
  } else {
    probLinhagem.opcoes = [
      { valor: `${macho.linhagem} x ${femea.linhagem}`, chance: 80 },
      { valor: 'Outras', chance: 20 },
    ];
  }

  return [probCor, probLinhagem];
}
