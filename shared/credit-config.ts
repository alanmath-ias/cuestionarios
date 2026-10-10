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

export const GRADE_CREDIT_CONFIG: Record<string, CategoryCreditConfig> = {
  // Primaria (1° a 5°): 4 créditos base, sin bono por nota, copa de oro escalonada
  'grade-1': { baseRate: 4, scoreBonus: 0, mapCompletion: 400 },
  'grade-2': { baseRate: 4, scoreBonus: 0, mapCompletion: 500 },
  'grade-3': { baseRate: 4, scoreBonus: 0, mapCompletion: 600 },
  'grade-4': { baseRate: 4, scoreBonus: 0, mapCompletion: 700 },
  'grade-5': { baseRate: 4, scoreBonus: 0, mapCompletion: 800 },
  // Secundaria: 6° y 7° igual a Aritmética; 8° y 9° igual a Álgebra
  'grade-6': { baseRate: 5, scoreBonus: 3, mapCompletion: 1000 },
  'grade-7': { baseRate: 5, scoreBonus: 3, mapCompletion: 1000 },
  'grade-8': { baseRate: 7, scoreBonus: 4, mapCompletion: 1500 },
  'grade-9': { baseRate: 7, scoreBonus: 4, mapCompletion: 1500 },
};

export const DEFAULT_CREDIT_CONFIG: CategoryCreditConfig = {
  baseRate: 5,
  scoreBonus: 3,
  mapCompletion: 1000
};

export function normalizeGradeKey(grade?: string | number | null): string | null {
  if (grade === undefined || grade === null) return null;
  const str = String(grade).trim().toLowerCase();
  if (!str) return null;
  // Match single digit 1-9 or 'grade-X' (strictly matching whole string)
  const match = str.match(/^grade-?([1-9])$/i) || str.match(/^([1-9])$/);
  if (match) {
    return `grade-${match[1]}`;
  }
  return null;
}

export function getCreditConfig(
  categoryId?: number | string | null,
  gradeLevel?: number | string | null
): CategoryCreditConfig {
  // 1. Check if gradeLevel was passed directly (e.g. grade roadmaps 1° - 9°)
  if (gradeLevel !== undefined && gradeLevel !== null && String(gradeLevel).trim() !== '') {
    const gradeFromParam = normalizeGradeKey(gradeLevel);
    if (gradeFromParam && GRADE_CREDIT_CONFIG[gradeFromParam]) {
      return GRADE_CREDIT_CONFIG[gradeFromParam];
    }
  }

  // 2. Check if categoryId itself represents an explicit grade key (e.g. 'grade-1' or completedMaps['grade-1'])
  if (typeof categoryId === 'string' && /^grade-?[1-9]$/i.test(categoryId.trim())) {
    const gradeFromCategory = normalizeGradeKey(categoryId);
    if (gradeFromCategory && GRADE_CREDIT_CONFIG[gradeFromCategory]) {
      return GRADE_CREDIT_CONFIG[gradeFromCategory];
    }
  }

  // 3. Fallback to categoryId lookup (e.g. 1=Aritmética, 2=Álgebra, 4=Cálculo Diferencial, etc.)
  if (categoryId !== undefined && categoryId !== null) {
    const id = Number(categoryId);
    if (!isNaN(id) && CATEGORY_CREDIT_CONFIG[id]) {
      return CATEGORY_CREDIT_CONFIG[id];
    }
  }

  return DEFAULT_CREDIT_CONFIG;
}
