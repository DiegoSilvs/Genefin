import { Ninhada, EventoNinhada, FaseNinhada } from './types';

export interface HealthReport {
  score: number;
  status: 'stable' | 'warning' | 'critical';
  alerts: string[];
  suggestions: string[];
}

/**
 * Motor de Saúde Biológica para Ninhadas
 * Implementa penalidades progressivas e análise de tendência (Spike Detection)
 */
export function calculateSpawnHealth(
  ninhada: Ninhada,
  events: EventoNinhada[]
): HealthReport {
  // Edge Case: Ninhada sem quantidade inicial
  if (ninhada.qtdInicial <= 0) {
    return { score: 100, status: 'stable', alerts: [], suggestions: ['Defina a quantidade inicial da desova.'] };
  }

  let score = 100;
  const alerts: string[] = [];
  const suggestions: string[] = [];

  // 1. PENALIDADE PROGRESSIVA DE MORTALIDADE (ABSOLUTA)
  const mortalityRate = (ninhada.totalMortalidade / ninhada.qtdInicial) * 100;
  
  // Limites agressivos por fase
  const phaseLimits: Record<FaseNinhada, number> = {
    ovo: 40,
    larva: 25,
    nado_livre: 15,
    alevino: 10,
    triagem: 5,
    finalizada: 5
  };

  const limit = phaseLimits[ninhada.faseAtual];

  if (mortalityRate > limit) {
    const overstep = mortalityRate - limit;
    // Penalidade exponencial: cresce rápido após o limite
    // Max penalty de 50 pontos para mortalidade absoluta
    const penalty = Math.min(50, Math.pow(overstep, 1.4) * 2);
    score -= penalty;
    alerts.push(`Mortalidade acumulada (${mortalityRate.toFixed(1)}%) acima do limite para ${ninhada.faseAtual}.`);
  }

  // 2. ANÁLISE DE TENDÊNCIA (Picos de Mortalidade)
  // Só analisa se houver dados significativos (> 2 eventos ou perda > 5%)
  const recentEvents = events
    .filter(e => e.tipoEvento === 'mortalidade')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const last48h = recentEvents.filter(e => {
    const diff = Date.now() - new Date(e.createdAt).getTime();
    return diff < 48 * 60 * 60 * 1000;
  });

  if (last48h.length >= 1) {
    const recentLoss = last48h.reduce((acc, e) => acc + e.quantidade, 0);
    const recentLossRate = (recentLoss / ninhada.qtdInicial) * 100;

    // Critério Híbrido: Perda súbita de >10% ou Spike em relação à média
    const historicalTotal = ninhada.totalMortalidade - recentLoss;
    const daysActive = Math.max(1, (Date.now() - new Date(ninhada.dataDesova).getTime()) / (1000 * 60 * 60 * 24));
    const avgDailyLoss = historicalTotal / daysActive;

    if (recentLossRate > 10 || (recentLoss > avgDailyLoss * 4 && recentLoss > 2)) {
      const spikePenalty = Math.min(40, recentLossRate * 3 + 10);
      score -= spikePenalty;
      alerts.push("Alerta de Tendência: Pico de mortalidade detectado nas últimas 48h.");
    }
  }

  // 3. PENALIDADE POR "DADOS ANTIGOS" (FRESHNESS)
  const lastUpdate = events[0] ? new Date(events[0].createdAt).getTime() : new Date(ninhada.dataDesova).getTime();
  const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate > 7 && ninhada.faseAtual !== 'finalizada') {
    score -= 10;
    alerts.push("Atenção: Sem atualizações de manejo nos últimos 7 dias.");
  }

  // 4. SUGESTÕES BASEADAS NO SCORE E FASE
  if (score < 40) {
    suggestions.push("Quarentena imediata recomendada.");
    suggestions.push("Verifique Amônia, Nitrito e Oxigenação agora.");
  } else if (score < 75) {
    if (ninhada.faseAtual === 'larva' || ninhada.faseAtual === 'nado_livre') {
      suggestions.push("Otimize a higiene do fundo e frequência de TPA.");
    }
    suggestions.push("Aumente a observação clínica nas próximas 72h.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    status: score < 50 ? 'critical' : score < 80 ? 'warning' : 'stable',
    alerts,
    suggestions
  };
}
