import { ArithmeticNode } from './arithmetic-map-data';

export const grade10StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: MEDIDAS DE POSICIÓN FINA Y FORMA DE LA DISTRIBUCIÓN
    // ==========================================
    {
        id: 'g10-stat-u1-posicion-fina-asimetria',
        label: 'Posición Fina (Percentiles) y Forma de la Distribución',
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
        type: 'critical',
        requires: ['g10-stat-u1-posicion-fina-asimetria'],
        description: 'Mide matemáticamente la desviación de la simetría: As > 0 (sesgo positivo hacia la derecha), As = 0 (simétrica) y As < 0 (sesgo negativo).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-interpretacion-reportes-estandarizados',
        label: 'Interpretación de Percentiles en Pruebas Estandarizadas',
        level: 2,
        type: 'applied',
        requires: ['g10-stat-deciles-percentiles-calculo', 'g10-stat-coeficiente-asimetria-pearson'],
        description: 'Comprende reportes oficiales (Saber 11, PISA, curvas de crecimiento pediátrico): estar en el percentil 85 significa superar al 85% de la población evaluada.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TEOREMA DE LA PROBABILIDAD TOTAL Y TEOREMA DE BAYES
    // ==========================================
    {
        id: 'g10-stat-u2-probabilidad-total-bayes',
        label: 'Teorema de la Probabilidad Total y Teorema de Bayes',
        level: 3,
        type: 'basic',
        requires: ['g10-stat-interpretacion-reportes-estandarizados'],
        description: 'Partición del espacio muestral, teorema de probabilidad total y la joya del razonamiento bajo incertidumbre: actualización bayesiana.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-particion-espacio-probabilidad-total',
        label: 'Teorema de la Probabilidad Total: P(B) = ∑ P(Aᵢ)·P(B|Aᵢ)',
        level: 4,
        type: 'critical',
        requires: ['g10-stat-u2-probabilidad-total-bayes'],
        description: 'Descompone un suceso B en función de una partición exhaustiva y mutuamente excluyente A₁, A₂, ..., Aₖ mediante árboles de probabilidad.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-teorema-de-bayes-formula',
        label: 'El Teorema de Bayes: P(Aᵢ|B) = [P(Aᵢ)·P(B|Aᵢ)] / P(B)',
        level: 4,
        type: 'critical',
        requires: ['g10-stat-u2-probabilidad-total-bayes'],
        description: 'Inversión de causas: calcula la probabilidad a posteriori de que una causa Aᵢ haya provocado el efecto B observado.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-bayes-diagnostico-medico-pruebas',
        label: 'Aplicaciones de Bayes: Pruebas Diagnósticas y Falsos Positivos',
        level: 5,
        type: 'applied',
        requires: ['g10-stat-particion-espacio-probabilidad-total', 'g10-stat-teorema-de-bayes-formula'],
        description: 'La paradoja de los falsos positivos: analiza sensibilidad, especificidad y prevalencia de una enfermedad para evaluar la confiabilidad de un test positivo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: VARIABLES ALEATORIAS DISCRETAS Y DISTRIBUCIONES
    // ==========================================
    {
        id: 'g10-stat-u3-variables-aleatorias-discretas',
        label: 'Variables Aleatorias Discretas y Distribuciones',
        level: 6,
        type: 'basic',
        requires: ['g10-stat-bayes-diagnostico-medico-pruebas'],
        description: 'Modelación matemática formal: asignación de valores numéricos a los resultados de un experimento y función de cuantía de probabilidad.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-definicion-variable-aleatoria-x',
        label: 'Concepto de Variable Aleatoria Discreta (X)',
        level: 7,
        type: 'basic',
        requires: ['g10-stat-u3-variables-aleatorias-discretas'],
        description: 'Función X: S → ℝ que transforma los eventos aleatorios en números reales. Rango o soporte discreto de la variable {x₁, x₂, ..., xₙ}.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-funcion-probabilidad-cuantia',
        label: 'Función de Probabilidad: P(X = x) y Propiedad ∑P = 1',
        level: 7,
        type: 'critical',
        requires: ['g10-stat-u3-variables-aleatorias-discretas'],
        description: 'Condiciones axiomáticas: 0 ≤ P(X = xᵢ) ≤ 1 para todo i, y la suma de todas las probabilidades sobre el soporte es exactamente 1.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-funcion-distribucion-acumulada-f-x',
        label: 'Función de Distribución Acumulada Discreta: F(x) = P(X ≤ x)',
        level: 8,
        type: 'applied',
        requires: ['g10-stat-definicion-variable-aleatoria-x', 'g10-stat-funcion-probabilidad-cuantia'],
        description: 'Gráfico escalonado de la función acumulativa F(x), propiedades monótonas crecientes y cálculo de probabilidades por tramos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: ESPERANZA MATEMÁTICA Y VARIANZA DE UNA VARIABLE ALEATORIA
    // ==========================================
    {
        id: 'g10-stat-u4-esperanza-varianza-va',
        label: 'Esperanza Matemática y Varianza de una V.A.',
        level: 9,
        type: 'basic',
        requires: ['g10-stat-funcion-distribucion-acumulada-f-x'],
        description: 'Estadísticos poblacionales teóricos: el valor esperado como centro de gravedad y la varianza como dispersión estocástica.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-valor-esperado-esperanza-formula',
        label: 'El Valor Esperado: E[X] = μ = ∑ [xᵢ · P(X = xᵢ)]',
        level: 10,
        type: 'critical',
        requires: ['g10-stat-u4-esperanza-varianza-va'],
        description: 'Promedio ponderado por probabilidades: representa el resultado medio a largo plazo tras un número infinito de repeticiones.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-varianza-desviacion-va-formula',
        label: 'Varianza de una V.A.: Var(X) = E[X²] - (E[X])²',
        level: 10,
        type: 'critical',
        requires: ['g10-stat-u4-esperanza-varianza-va'],
        description: 'Cálculo abreviado computacional: Var(X) = ∑ xᵢ²·P(X = xᵢ) - μ², y desviación estándar teórica σ = √Var(X).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-esperanza-juegos-apuestas-seguros',
        label: 'Juegos Justos, Apuestas Financieras y Seguros de Vida',
        level: 11,
        type: 'applied',
        requires: ['g10-stat-valor-esperado-esperanza-formula', 'g10-stat-varianza-desviacion-va-formula'],
        description: 'Un juego es justo si E[ganancia] = 0. Modela primas de pólizas de seguros y riesgo de inversión mediante esperanza matemática.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: LA DISTRIBUCIÓN BINOMIAL
    // ==========================================
    {
        id: 'g10-stat-u5-distribucion-binomial',
        label: 'La Distribución Binomial B(n, p)',
        level: 12,
        type: 'basic',
        requires: ['g10-stat-esperanza-juegos-apuestas-seguros'],
        description: 'El modelo discreto más importante: repetición de n ensayos de Bernoulli independientes con probabilidad constante de éxito p.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-ensayo-bernoulli-condiciones-binomial',
        label: 'El Ensayo de Bernoulli y las Cuatro Condiciones Binomiales',
        level: 13,
        type: 'basic',
        requires: ['g10-stat-u5-distribucion-binomial'],
        description: '1) n pruebas fijas, 2) solo dos resultados (éxito/fracaso), 3) probabilidad de éxito p constante, 4) ensayos independientes.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-formula-distribucion-binomial-calculo',
        label: 'La Función de Probabilidad Binomial: P(X = k) = C(n, k)·pᵏ·(1-p)ⁿ⁻ᵏ',
        level: 13,
        type: 'critical',
        requires: ['g10-stat-u5-distribucion-binomial'],
        description: 'Cálculo exacto: C(n, k) cuenta los caminos posibles y pᵏ·(1-p)ⁿ⁻ᵏ es la probabilidad de cada secuencia específica.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-media-varianza-binomial-aplicaciones',
        label: 'Media (μ = np), Varianza (σ² = npq) y Problemas Reales',
        level: 14,
        type: 'applied',
        requires: ['g10-stat-ensayo-bernoulli-condiciones-binomial', 'g10-stat-formula-distribucion-binomial-calculo'],
        description: 'Deducción compacta de sus parámetros y resolución de problemas de control de calidad, efectividad de medicamentos y lanzamientos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: MODELOS DISCRETOS ESPECIALES Y GRAN CORONA DE 10.°
    // ==========================================
    {
        id: 'g10-stat-u6-modelos-especiales-maestria-decimo',
        label: 'Modelos Discretos Especiales y Gran Corona de 10.°',
        level: 15,
        type: 'basic',
        requires: ['g10-stat-media-varianza-binomial-aplicaciones'],
        description: 'Distribución uniforme discreta, introducción al modelo de Poisson y culminación del décimo grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g10-stat-distribucion-uniforme-discreta',
        label: 'La Distribución Uniforme Discreta: P(X = x) = 1 / k',
        level: 16,
        type: 'basic',
        requires: ['g10-stat-u6-modelos-especiales-maestria-decimo'],
        description: 'Cuando todos los valores del soporte tienen la misma probabilidad exacta: dados de k caras, ruletas y números aleatorios.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-introduccion-distribucion-poisson',
        label: 'Introducción al Proceso y Distribución de Poisson',
        level: 16,
        type: 'basic',
        requires: ['g10-stat-u6-modelos-especiales-maestria-decimo'],
        description: 'Modelación de eventos raros en un intervalo de tiempo o espacio continuo (clientes por hora, fallas por metro): P(X=k) = (λᵏ·e⁻ˡ) / k!.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g10-stat-corona-maestria-decimo',
        label: 'Gran Corona de Maestría de Probabilidad y Estadística de 10.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g10-stat-distribucion-uniforme-discreta', 'g10-stat-introduccion-distribucion-poisson'],
        description: '¡Máximo galardón de 10.º de Educación Media! Domina percentiles, asimetría, Teorema de Bayes, variables aleatorias discretas, valor esperado y distribución binomial.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
