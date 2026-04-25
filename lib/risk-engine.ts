import { Tanque, Medicao } from './types';

export interface RiskScore {
  score: number; // 0-100
  confidence: number; // 0-1 (based on data freshness)
  factors: {
    ammonia: number;
    bioload: number;
    trend: number;
    freshness: number;
    filtration: number;
  };
  alerts: string[];
}

export class RiskCalculator {
  // Configurable weights (sum should be 1.0)
  private weights = {
    ammonia: 0.4,
    bioload: 0.2,
    trend: 0.2,
    freshness: 0.1,
    filtration: 0.1,
  };

  /**
   * Normalizes values using a sigmoid-like function to map them to 0-1
   * @param value Raw value
   * @param threshold Value at which risk starts to become significant (0.5)
   * @param steepness How fast the risk grows
   */
  private normalize(value: number, threshold: number, steepness: number = 5): number {
    return 1 / (1 + Math.exp(-steepness * (value - threshold)));
  }

  /**
   * Calculates Total Ammonia Nitrogen (TAN) risk based on pH and Temp
   */
  private calculateAmmoniaRisk(medicao: Medicao): number {
    if (!medicao.amonia) return 0;
    
    // Simplistic TAN risk: highly dependent on pH
    // If pH > 8.0, ammonia is much more toxic
    const phFactor = medicao.ph ? (medicao.ph > 8 ? 1.5 : 1.0) : 1.0;
    const rawRisk = medicao.amonia * phFactor;
    
    return this.normalize(rawRisk, 0.25); // 0.25ppm is a common danger threshold
  }

  /**
   * Calculate risk based on population vs biological capacity
   */
  private calculateBioloadRisk(peixesCount: number, tanque: Tanque): number {
    const ratio = peixesCount / tanque.capacidadeBiologica;
    return this.normalize(ratio, 1.0, 8); // Risk spikes as we approach/cross 100% capacity
  }

  /**
   * Calculate risk based on how old the data is
   */
  private calculateFreshnessRisk(lastMedicaoDate: string, intervalDays: number): number {
    const lastDate = new Date(lastMedicaoDate);
    const now = new Date();
    const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
    
    const ratio = diffDays / intervalDays;
    return this.normalize(ratio, 1.2, 4); // Risk grows if we exceed the interval by 20%
  }

  /**
   * Detects dangerous trends in pH or Ammonia
   */
  private calculateTrendRisk(historico: Medicao[]): number {
    if (historico.length < 3) return 0;

    // Last 3 points trend for pH
    const phs = historico.slice(0, 3).map(m => m.ph || 7);
    const phChange = phs[0] - phs[2]; // Rate of change

    // If pH is dropping fast (acidification), risk is high
    if (phChange < -0.3) return 0.8;
    if (phChange < -0.1) return 0.4;
    
    return 0;
  }

  public calculate(tanque: Tanque, peixesCount: number, historico: Medicao[]): RiskScore {
    const lastMedicao = historico[0];
    
    const factors = {
      ammonia: lastMedicao ? this.calculateAmmoniaRisk(lastMedicao) : 0.5, // 0.5 if no data
      bioload: this.calculateBioloadRisk(peixesCount, tanque),
      trend: this.calculateTrendRisk(historico),
      freshness: lastMedicao ? this.calculateFreshnessRisk(lastMedicao.measuredAt, tanque.intervaloMedicaoDias) : 1.0,
      filtration: tanque.tipoFiltragem === 'esponja' ? 0.3 : 0.1, // Basic penalty for low filtration
    };

    const weightedScore = (
      factors.ammonia * this.weights.ammonia +
      factors.bioload * this.weights.bioload +
      factors.trend * this.weights.trend +
      factors.freshness * this.weights.freshness +
      factors.filtration * this.weights.filtration
    ) * 100;

    const alerts: string[] = [];
    if (factors.ammonia > 0.7) alerts.push('Nível de amônia crítico detectado!');
    if (factors.bioload > 0.9) alerts.push('Tanque próximo da capacidade biológica máxima.');
    if (factors.trend > 0.5) alerts.push('Instabilidade detectada nos parâmetros (Queda de pH).');
    if (factors.freshness > 0.8) alerts.push('Dados de medição desatualizados.');

    const confidence = lastMedicao 
      ? Math.max(0, 1 - factors.freshness) 
      : 0;

    return {
      score: Math.round(weightedScore),
      confidence,
      factors,
      alerts
    };
  }
}
