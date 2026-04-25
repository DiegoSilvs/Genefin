// ─── Métricas e estatísticas ─────────────────────────────

export type DesempenhoCruzamento = {
  totalFilhos: number;
  classificacao: string;
};

export type EstatisticasPeixe = {
  totalCruzamentos: number;
  totalFilhos: number;
  mediaFilhosPorCruzamento: number;
};

/**
 * Classifica o desempenho de um cruzamento baseado
 * na quantidade de filhos gerados.
 */
export function classificarCruzamento(totalFilhos: number): DesempenhoCruzamento {
  let classificacao: string;

  if (totalFilhos === 0) {
    classificacao = 'Sem sucesso';
  } else if (totalFilhos <= 3) {
    classificacao = 'Baixa reprodução';
  } else if (totalFilhos <= 10) {
    classificacao = 'Boa reprodução';
  } else {
    classificacao = 'Alta reprodução';
  }

  return { totalFilhos, classificacao };
}

/**
 * Retorna a cor do badge baseado na classificação.
 */
export function corDesempenho(classificacao: string): string {
  switch (classificacao) {
    case 'Sem sucesso':
      return 'badge-morto';
    case 'Baixa reprodução':
      return 'badge-reservado';
    case 'Boa reprodução':
      return 'badge-ativo';
    case 'Alta reprodução':
      return 'badge-vendido';
    default:
      return '';
  }
}
