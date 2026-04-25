import { Tanque, Medicao, Peixe } from './types';
import { RiskCalculator, RiskScore } from './risk-engine';

export interface SimulationResult {
  currentRisk: RiskScore;
  projectedRisk: RiskScore;
  uncertaintyRange: [number, number]; // Low-High projected risk
  recommendation: string;
}

export class TankSimulator {
  private engine = new RiskCalculator();

  /**
   * Simulates adding fish to a tank
   */
  public simulateMove(
    tanque: Tanque, 
    currentPeixes: Peixe[], 
    peixesToAddCount: number, 
    historico: Medicao[]
  ): SimulationResult {
    const currentCount = currentPeixes.length;
    const projectedCount = currentCount + peixesToAddCount;
    
    const currentRisk = this.engine.calculate(tanque, currentCount, historico);
    const projectedRisk = this.engine.calculate(tanque, projectedCount, historico);
    
    // Calculate uncertainty based on data freshness and simulation jump size
    // Uncertainty grows if data is old or if we are adding many fish
    const freshnessPenalty = 1 - currentRisk.confidence;
    const massPenalty = (peixesToAddCount / tanque.capacidadeBiologica) * 0.5;
    
    const uncertaintyFactor = (freshnessPenalty + massPenalty) * 20; // Max +/- 20 points
    
    const low = Math.max(0, projectedRisk.score - uncertaintyFactor);
    const high = Math.min(100, projectedRisk.score + uncertaintyFactor);

    let recommendation = 'A operação parece segura.';
    if (high > 70) recommendation = 'Risco elevado. Considere aumentar a filtragem ou monitorar amônia diariamente após a mudança.';
    if (projectedRisk.score > 85) recommendation = 'ALERTA: Superlotação crítica provável. A operação não é recomendada sem expansão biológica.';
    if (currentRisk.confidence < 0.3) recommendation = 'Incerteza alta nos dados. Realize novas medições da água antes de qualquer movimentação.';

    return {
      currentRisk,
      projectedRisk,
      uncertaintyRange: [Math.round(low), Math.round(high)],
      recommendation
    };
  }
}
