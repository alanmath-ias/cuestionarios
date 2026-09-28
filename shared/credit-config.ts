export interface CategoryCreditConfig {
  baseRate: number;      // Créditos base por cuestionario, por cuestionario al terminar nodo y por cuestionario de familia
  scoreBonus: number;    // Bono adicional si la nota es >= 8.0
  mapCompletion: number; // Créditos otorgados al completar el 100% del mapa
}

export const CATEGORY_CREDIT_CONFIG: Record<number, CategoryCreditConfig> = {
  1:  { baseRate: 5,  scoreBonus: 3, mapCompletion: 1000 }, // Aritmética
  2:  { baseRate: 7,  scoreBonus: 4, mapCompletion: 1500 }, // Álgebra
  3:  { baseRate: 8,  scoreBonus: 5, mapCompletion: 1500 }, // Trigonometría
  4:  { baseRate: 9,  scoreBonus: 5, mapCompletion: 2000 }, // Cálculo Diferencial
  5:  { baseRate: 10, scoreBonus: 6, mapCompletion: 2000 }, // Cálculo Integral
  6:  { baseRate: 12, scoreBonus: 7, mapCompletion: 2500 }, // Ec. Diferenciales
  10: { baseRate: 10, scoreBonus: 6, mapCompletion: 2500 }, // Física Mecánica
  16: { baseRate: 8,  scoreBonus: 5, mapCompletion: 1500 }, // Geometría Analítica
  17: { baseRate: 9,  scoreBonus: 5, mapCompletion: 2000 }, // Álgebra Lineal
  18: { baseRate: 12, scoreBonus: 7, mapCompletion: 2500 }, // Series de Fourier y EDPs
  19: { baseRate: 8,  scoreBonus: 5, mapCompletion: 1500 }, // Estadística
};

export const DEFAULT_CREDIT_CONFIG: CategoryCreditConfig = {
  baseRate: 5,
  scoreBonus: 3,
  mapCompletion: 1000
};

export function getCreditConfig(categoryId?: number | string | null): CategoryCreditConfig {
  if (categoryId === undefined || categoryId === null) {
    return DEFAULT_CREDIT_CONFIG;
  }
  const id = Number(categoryId);
  return CATEGORY_CREDIT_CONFIG[id] || DEFAULT_CREDIT_CONFIG;
}
