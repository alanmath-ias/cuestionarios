import { ArithmeticNode } from './arithmetic-map-data';

export const grade10StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: POSICIÓN FINA (PERCENTILES) Y ASIMETRÍA DE LA DISTRIBUCIÓN
    // ==========================================
    {
        id: 'g10-stat-u1-posicion-fina-asimetria',
        label: 'Posición Fina (Percentiles) y Asimetría de la Distribución',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Inicio de la Educación Media: localización precisa de datos mediante percentiles (Pₖ), deciles y cuantificación formal del sesgo o asimetría.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-deciles-percentiles-calculo',
        label: 'Deciles (Dₖ) y Percentiles (Pₖ) en Distribuciones Continuas',
        level: 1,
        type: 'basic',
        requires: ['g10-stat-u1-posicion-fina-asimetria'],
        description: 'División en 10 y 100 partes iguales: cálculo formal de percentiles P₁ a P₉₉ en tablas de datos agrupados e interpretación de baremos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-coeficiente-asimetria-pearson',
        label: 'Coeficiente de Asimetría de Pearson: As = 3(x̄ - Me) / s',
        level: 1,
        type: 'basic',
        requires: ['g10-stat-u1-posicion-fina-asimetria'],
        description: 'Mide matemáticamente la desviación de la simetría: As > 0 (sesgo positivo hacia la derecha), As = 0 (simétrica) y As < 0 (sesgo negativo).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-interpretacion-reportes-estandarizados',
        label: 'Interpretación de Percentiles en Pruebas Estandarizadas (Saber 11)',
        level: 2,
        type: 'applied',
        requires: ['g10-stat-deciles-percentiles-calculo', 'g10-stat-coeficiente-asimetria-pearson'],
        description: 'Comprende reportes oficiales (Saber 11, PISA, curvas de crecimiento pediátrico): estar en el percentil 85 significa superar al 85% de la población evaluada.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: COMBINATORIA AVANZADA E INCLUSIÓN-EXCLUSIÓN
    // ==========================================
    {
        id: 'g10-stat-u2-conteo-avanzado-inclusion-exclusion',
        label: 'Combinatoria Avanzada e Inclusión-Exclusión',
        level: 3,
        type: 'basic',
        requires: ['g10-stat-interpretacion-reportes-estandarizados'],
        description: 'Técnicas combinatorias profundas para resolver problemas con restricciones complejas y solapamientos múltiples.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-principio-inclusion-exclusion',
        label: 'Principio de Inclusión-Exclusión para 2 y 3 Conjuntos',
        level: 4,
        type: 'basic',
        requires: ['g10-stat-u2-conteo-avanzado-inclusion-exclusion'],
        description: 'Fórmula general para la cardinalidad de la unión de conjuntos: |A ∪ B ∪ C| sumando tamaños individuales, restando pares y sumando la intersección triple.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-combinatoria-con-restricciones-grupos',
        label: 'Problemas Combinatorios con Restricciones y Distribución en Grupos',
        level: 4,
        type: 'basic',
        requires: ['g10-stat-u2-conteo-avanzado-inclusion-exclusion'],
        description: 'Distribución de objetos distinguibles e indistinguibles en cajas o grupos y ordenamientos con condiciones de vecindad obligatoria.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-aplicaciones-conteo-probabilidad-avanzada',
        label: 'Aplicaciones del Conteo a la Probabilidad Clásica Avanzada',
        level: 5,
        type: 'applied',
        requires: ['g10-stat-principio-inclusion-exclusion', 'g10-stat-combinatoria-con-restricciones-grupos'],
        description: 'Uso de técnicas combinatorias avanzadas para calcular probabilidades de eventos en juegos de azar, loterías y problemas de desórdenes (derangements).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TEOREMA DE LA PROBABILIDAD TOTAL Y TEOREMA DE BAYES
    // ==========================================
    {
        id: 'g10-stat-u3-probabilidad-total-bayes',
        label: 'Teorema de la Probabilidad Total y Teorema de Bayes',
        level: 6,
        type: 'basic',
        requires: ['g10-stat-aplicaciones-conteo-probabilidad-avanzada'],
        description: 'Partición del espacio muestral, teorema de probabilidad total y la joya del razonamiento bajo incertidumbre: actualización bayesiana.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-particion-espacio-probabilidad-total',
        label: 'Teorema de la Probabilidad Total: P(B) = ∑ P(Aᵢ)·P(B|Aᵢ)',
        level: 7,
        type: 'basic',
        requires: ['g10-stat-u3-probabilidad-total-bayes'],
        description: 'Descompone un suceso B en función de una partición exhaustiva y mutuamente excluyente A₁, A₂, ..., Aₖ mediante árboles de probabilidad ponderados.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-teorema-de-bayes-formula',
        label: 'El Teorema de Bayes: P(Aᵢ|B) = [P(Aᵢ)·P(B|Aᵢ)] / P(B)',
        level: 7,
        type: 'basic',
        requires: ['g10-stat-u3-probabilidad-total-bayes'],
        description: 'Inversión de causas: calcula la probabilidad a posteriori de que una causa específica Aᵢ haya provocado el efecto observable B.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-bayes-diagnostico-medico-pruebas',
        label: 'Aplicaciones de Bayes: Pruebas Diagnósticas y Falsos Positivos',
        level: 8,
        type: 'applied',
        requires: ['g10-stat-particion-espacio-probabilidad-total', 'g10-stat-teorema-de-bayes-formula'],
        description: 'La paradoja de los falsos positivos: analiza sensibilidad, especificidad y prevalencia de una enfermedad para evaluar la confiabilidad de un test positivo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: VARIABLES ALEATORIAS DISCRETAS Y DISTRIBUCIONES
    // ==========================================
    {
        id: 'g10-stat-u4-variables-aleatorias-discretas',
        label: 'Variables Aleatorias Discretas y Distribuciones',
        level: 9,
        type: 'basic',
        requires: ['g10-stat-bayes-diagnostico-medico-pruebas'],
        description: 'Modelación matemática formal: asignación de valores numéricos a los resultados de un experimento y función de cuantía de probabilidad.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-definicion-variable-aleatoria-x',
        label: 'Concepto Formal de Variable Aleatoria Discreta (X) y Soporte',
        level: 10,
        type: 'basic',
        requires: ['g10-stat-u4-variables-aleatorias-discretas'],
        description: 'Función X: S → ℝ que transforma los eventos aleatorios en números reales. Rango o soporte discreto de la variable {x₁, x₂, ..., xₙ}.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-funcion-probabilidad-cuantia',
        label: 'Función de Cuantía de Probabilidad: P(X = x) y Propiedad ∑P = 1',
        level: 10,
        type: 'basic',
        requires: ['g10-stat-u4-variables-aleatorias-discretas'],
        description: 'Condiciones axiomáticas: 0 ≤ P(X = xᵢ) ≤ 1 para todo i, y la suma de todas las probabilidades sobre el soporte es exactamente 1.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-funcion-distribucion-acumulada-f-x',
        label: 'Función de Distribución Acumulada Discreta: F(x) = P(X ≤ x)',
        level: 11,
        type: 'applied',
        requires: ['g10-stat-definicion-variable-aleatoria-x', 'g10-stat-funcion-probabilidad-cuantia'],
        description: 'Gráfico escalonado de la función acumulativa F(x), propiedades monótonas crecientes y cálculo de probabilidades acumuladas por tramos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: ESPERANZA MATEMÁTICA, VARIANZA Y DECISIONES
    // ==========================================
    {
        id: 'g10-stat-u5-esperanza-varianza-va',
        label: 'Esperanza Matemática, Varianza y Decisiones',
        level: 12,
        type: 'basic',
        requires: ['g10-stat-funcion-distribucion-acumulada-f-x'],
        description: 'Estadísticos poblacionales teóricos: el valor esperado como centro de gravedad y la varianza como dispersión estocástica.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-valor-esperado-esperanza-formula',
        label: 'El Valor Esperado: E[X] = μ = ∑ [xᵢ · P(X = xᵢ)]',
        level: 13,
        type: 'basic',
        requires: ['g10-stat-u5-esperanza-varianza-va'],
        description: 'Promedio ponderado por probabilidades: representa el resultado medio a largo plazo tras un número infinito de repeticiones del experimento.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-varianza-desviacion-va-formula',
        label: 'Varianza de una V.A.: Var(X) = E[X²] - (E[X])² y Desviación σ',
        level: 13,
        type: 'basic',
        requires: ['g10-stat-u5-esperanza-varianza-va'],
        description: 'Cálculo abreviado computacional: Var(X) = ∑ xᵢ²·P(X = xᵢ) - μ², y desviación estándar teórica σ = √Var(X).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-esperanza-juegos-apuestas-seguros',
        label: 'Modelación de Juegos Justos, Apuestas Financieras y Pólizas de Seguros',
        level: 14,
        type: 'applied',
        requires: ['g10-stat-valor-esperado-esperanza-formula', 'g10-stat-varianza-desviacion-va-formula'],
        description: 'Un juego es justo si E[ganancia] = 0. Modela primas de pólizas de seguros y riesgo de inversión mediante esperanza matemática.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: MODELOS DE PROBABILIDAD: BINOMIAL, UNIFORME Y POISSON
    // ==========================================
    {
        id: 'g10-stat-u6-modelos-discretos-binomial-poisson',
        label: 'Modelos de Probabilidad: Binomial, Uniforme y Poisson',
        level: 15,
        type: 'advanced',
        requires: ['g10-stat-esperanza-juegos-apuestas-seguros'],
        description: 'Distribuciones de probabilidad discretas paradigmáticas: el modelo binomial de Bernoulli, el modelo uniforme y el proceso de Poisson.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-distribucion-binomial-calculo',
        label: 'La Función de Probabilidad Binomial: P(X = k) = C(n, k)·pᵏ·(1-p)ⁿ⁻ᵏ',
        level: 16,
        type: 'basic',
        requires: ['g10-stat-u6-modelos-discretos-binomial-poisson'],
        description: 'El modelo de n ensayos de Bernoulli independientes con probabilidad constante p: cálculo de probabilidades exactas y acumuladas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-parametros-binomial-aplicaciones',
        label: 'Parámetros de la Binomial (μ = np, σ² = npq) y Aplicaciones Reales',
        level: 16,
        type: 'basic',
        requires: ['g10-stat-u6-modelos-discretos-binomial-poisson'],
        description: 'Deducción compacta de sus parámetros teóricos y resolución de problemas de control de calidad, efectividad médica y encuestas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-distribucion-uniforme-poisson-intro',
        label: 'Modelos Discretos: Distribución Uniforme y Modelo de Poisson',
        level: 17,
        type: 'applied',
        requires: ['g10-stat-distribucion-binomial-calculo', 'g10-stat-parametros-binomial-aplicaciones'],
        description: 'Distribución Uniforme Discreta (P = 1/k) e introducción al modelo de Poisson para eventos raros por intervalo de tiempo o espacio: P(X=k) = (λᵏ·e⁻ˡ) / k!.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
