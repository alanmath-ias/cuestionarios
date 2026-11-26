import { ArithmeticNode } from './arithmetic-map-data';

export const statisticsMapNodes: ArithmeticNode[] = [
    // ==========================================
    // DOMINIO I: FUNDAMENTOS DE DATOS, RECOLECCIÓN Y AZAR INTUITIVO (1° - 3°)
    // ==========================================
    {
        id: 'stat-d1',
        label: 'Dominio I: Fundamentos de Datos, Recolección y Azar Intuitivo',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Naturaleza de la información, clasificación de datos, instrumentos de recolección y primeras nociones lúdicas del azar.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-dato-variables',
        label: 'El Dato Estadístico y Tipos de Variables',
        level: 1,
        type: 'basic',
        requires: ['stat-d1'],
        description: 'Concepto de dato vs. información, variables cualitativas (nominales/ordinales) y cuantitativas (discretas/continuas).',
        xOffset: -50,
        subcategoryId: 350,
        additionalSubcategories: [351],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-metodos-recoleccion',
        label: 'Métodos de Recolección, Encuestas y Experimentos',
        level: 1,
        type: 'basic',
        requires: ['stat-d1'],
        description: 'Observación directa, diseño de preguntas sin sesgo en cuestionarios y recolección estructurada de datos.',
        xOffset: 50,
        subcategoryId: 369,
        additionalSubcategories: [371],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-azar-intuitivo',
        label: 'Incertidumbre y Azar: Seguro, Posible e Imposible',
        level: 2,
        type: 'applied',
        requires: ['stat-dato-variables', 'stat-metodos-recoleccion'],
        description: 'Diferenciación entre fenómenos deterministas y aleatorios, eventos seguros, posibles e imposibles, y juegos de azar cotidianos.',
        xOffset: 0,
        subcategoryId: 363,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO II: TABULACIÓN, VISUALIZACIÓN Y PROBABILIDAD CLÁSICA (4° - 5°)
    // ==========================================
    {
        id: 'stat-d2',
        label: 'Dominio II: Organización, Visualización y Probabilidad Clásica',
        level: 3,
        type: 'basic',
        requires: ['stat-azar-intuitivo'],
        description: 'Construcción de tablas de frecuencia, gráficos de resumen y cuantificación matemática elemental de la probabilidad.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-tablas-frecuencia-simple',
        label: 'Tablas de Frecuencia Simple y Porcentual',
        level: 4,
        type: 'basic',
        requires: ['stat-d2'],
        description: 'Conteo sistemático, frecuencia absoluta (fᵢ), relativa (hᵢ), porcentual (%f) y frecuencias acumuladas para datos no agrupados.',
        xOffset: -50,
        subcategoryId: 355,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-graficos-barras-sectores',
        label: 'Gráficos de Barras, Líneas y Sectores Circulares',
        level: 4,
        type: 'basic',
        requires: ['stat-d2'],
        description: 'Representación visual de variables discretas y categóricas: gráficos de barras simples/agrupadas, líneas de tendencia y diagramas circulares.',
        xOffset: 50,
        subcategoryId: 357,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-probabilidad-laplace',
        label: 'Probabilidad Clásica (Laplace) y Empírica',
        level: 5,
        type: 'critical',
        requires: ['stat-tablas-frecuencia-simple', 'stat-graficos-barras-sectores'],
        description: 'Espacios muestrales equiprobables, regla de Laplace P = favorables/posibles, escala [0, 1] y aproximación frecuencial experimental.',
        xOffset: 0,
        subcategoryId: 364,
        additionalSubcategories: [365],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO III: DATOS AGRUPADOS, HISTOGRAMAS Y TENDENCIA CENTRAL (6° - 7°)
    // ==========================================
    {
        id: 'stat-d3',
        label: 'Dominio III: Datos Agrupados, Histogramas y Tendencia Central',
        level: 6,
        type: 'basic',
        requires: ['stat-probabilidad-laplace'],
        description: 'Agrupación de datos en intervalos continuos, representación gráfica formal y cálculo de medidas de centro.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-tablas-intervalos-histogramas',
        label: 'Intervalos de Clase, Histogramas y Ojivas',
        level: 7,
        type: 'basic',
        requires: ['stat-d3'],
        description: 'Límites reales, amplitud, marca de clase (xᵢ), histogramas continuos, polígonos de frecuencia y ojivas acumuladas.',
        xOffset: -50,
        subcategoryId: 356,
        additionalSubcategories: [358],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-tendencia-central',
        label: 'Medidas de Tendencia Central y Media Ponderada',
        level: 7,
        type: 'critical',
        requires: ['stat-d3'],
        description: 'Media aritmética como punto de equilibrio, mediana (par/impar), moda, media ponderada y cálculo en datos agrupados.',
        xOffset: 50,
        subcategoryId: 353,
        additionalSubcategories: [354],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-principios-conteo-factorial',
        label: 'Principios de Conteo (Aditivo/Multiplicativo) y Factorial',
        level: 8,
        type: 'applied',
        requires: ['stat-tablas-intervalos-histogramas', 'stat-tendencia-central'],
        description: 'Regla de la suma y del producto, diagramas de árbol de decisión, conteo por etapas y definición rigurosa del factorial (n!).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO IV: DISPERSIÓN, POSICIÓN Y COMBINATORIA SISTEMÁTICA (8° - 9°)
    // ==========================================
    {
        id: 'stat-d4',
        label: 'Dominio IV: Dispersión, Posición y Estructuras Combinatorias',
        level: 9,
        type: 'basic',
        requires: ['stat-principios-conteo-factorial'],
        description: 'Cuantificación de la variabilidad, localización de datos no centrales y dominio del conteo combinatorio con fórmulas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-dispersion-varianza',
        label: 'Rango, Varianza, Desviación Estándar y CV',
        level: 10,
        type: 'critical',
        requires: ['stat-d4'],
        description: 'Desviaciones respecto a la media, varianza (s²), desviación estándar (s) e índice de homogeneidad por coeficiente de variación (CV).',
        xOffset: -50,
        subcategoryId: 359,
        additionalSubcategories: [360],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-posicion-boxplots',
        label: 'Cuartiles, Percentiles y Diagramas de Caja (Boxplots)',
        level: 10,
        type: 'applied',
        requires: ['stat-d4'],
        description: 'Medidas de posición (Q₁, Q₂, Q₃, percentiles), rango intercuartílico (IQR), detección de valores atípicos (outliers) y asimetría gráfica.',
        xOffset: 50,
        subcategoryId: 361,
        additionalSubcategories: [362],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-combinatoria-sistematica',
        label: 'Permutaciones, Variaciones, Combinaciones y Binomio',
        level: 11,
        type: 'critical',
        requires: ['stat-dispersion-varianza', 'stat-posicion-boxplots'],
        description: 'El algoritmo de las 3 preguntas: orden, elementos y repetición. Permutaciones lineales/circulares, combinaciones, Pascal y binomio de Newton.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO V: PROBABILIDAD COMPUESTA, CONDICIONAL Y MODELOS DISCRETOS (9° - 10°)
    // ==========================================
    {
        id: 'stat-d5',
        label: 'Dominio V: Probabilidad Compuesta, Condicional y Modelos Discretos',
        level: 12,
        type: 'basic',
        requires: ['stat-combinatoria-sistematica'],
        description: 'Operaciones con eventos, independencia estocástica, Teorema de Bayes y variables aleatorias discretas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-operaciones-contingencia',
        label: 'Álgebra de Eventos, Diagramas de Venn y Contingencia',
        level: 13,
        type: 'basic',
        requires: ['stat-d5'],
        description: 'Unión, intersección, complemento, diferencia de sucesos, regla de la suma general P(A∪B) y tablas de contingencia 2×2.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-prob-condicional-bayes',
        label: 'Probabilidad Condicional, Independencia y Teorema de Bayes',
        level: 13,
        type: 'critical',
        requires: ['stat-d5'],
        description: 'Definición formal P(A|B), regla del producto, pruebas con/sin reemplazo, Teorema de Probabilidad Total y Bayes en diagnóstico médico.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-variables-discretas-binomial',
        label: 'Variables Aleatorias Discretas y Distribución Binomial',
        level: 14,
        type: 'applied',
        requires: ['stat-operaciones-contingencia', 'stat-prob-condicional-bayes'],
        description: 'Función de probabilidad, valor esperado E[X], varianza de una V.A., ensayos de Bernoulli y distribución binomial B(n, p).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VI: DISTRIBUCIÓN NORMAL, ANÁLISIS BIVARIADO E INFERENCIA ESCOLAR (10° - 11° / SABER 11)
    // ==========================================
    {
        id: 'stat-d6',
        label: 'Dominio VI: Distribución Normal, Análisis Bivariado e Inferencia Escolar',
        level: 15,
        type: 'basic',
        requires: ['stat-variables-discretas-binomial'],
        description: 'La campana de Gauss, modelación lineal bivariada, muestreo probabilístico e interpretación de intervalos y márgenes de error.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-distribucion-normal-z',
        label: 'La Distribución Normal, Estandarización y Puntuaciones Z',
        level: 16,
        type: 'critical',
        requires: ['stat-d6'],
        description: 'Propiedades de la curva normal de Gauss, regla 68-95-99.7, estandarización Z = (X-μ)/σ y uso de tablas para cálculo de percentiles.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-bivariado-regresion',
        label: 'Correlación de Pearson, Causalidad y Recta de Regresión',
        level: 16,
        type: 'applied',
        requires: ['stat-d6'],
        description: 'Diagramas de dispersión, coeficiente de correlación r, falacia "correlación implica causalidad", y recta de mínimos cuadrados para predicción.',
        xOffset: 50,
        subcategoryId: 366,
        additionalSubcategories: [367, 368],
        behavior: 'quiz_list'
    },
    {
        id: 'stat-muestreo-inferencia-escolar',
        label: 'Muestreo, Sesgos, Intervalos de Confianza y Contraste',
        level: 17,
        type: 'evaluation',
        requires: ['stat-distribucion-normal-z', 'stat-bivariado-regresion'],
        description: 'Parámetros vs. estadísticos, muestreo aleatorio (simple, estratificado, conglomerados), sesgos, margen de error, intervalos de confianza e hipótesis.',
        xOffset: 0,
        subcategoryId: 352,
        additionalSubcategories: [370],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VII: PROBABILIDAD CONTINUA Y FUNDAMENTOS TEÓRICOS (UNIVERSIDAD)
    // ==========================================
    {
        id: 'stat-d7',
        label: 'Dominio VII: Probabilidad Continua, Modelos Teóricos y Teorema Central',
        level: 18,
        type: 'basic',
        requires: ['stat-muestreo-inferencia-escolar'],
        description: 'Integración de cálculo con probabilidad: densidades continuas, familias de distribuciones teóricas y Teorema del Límite Central.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-densidades-continuas-pdf',
        label: 'Variables Continuas, Función de Densidad (PDF) y Acumulada (CDF)',
        level: 19,
        type: 'basic',
        requires: ['stat-d7'],
        description: 'Propiedades integrales de f(x), cálculo de P(a≤X≤b), función de distribución acumulada F(x), esperanza y varianza continua.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-modelos-continuos-teoricos',
        label: 'Familias de Distribuciones Continuas: Exponencial, Gamma, χ², t y F',
        level: 19,
        type: 'applied',
        requires: ['stat-d7'],
        description: 'Distribución exponencial (falta de memoria), distribución Gamma, y distribuciones fundamentales del muestreo: Chi-cuadrado, Student y Fisher.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-vectores-clt-formal',
        label: 'Distribuciones Conjuntas, Covarianza y Teorema del Límite Central',
        level: 20,
        type: 'critical',
        requires: ['stat-densidades-continuas-pdf', 'stat-modelos-continuos-teoricos'],
        description: 'Vectores aleatorios continuos, funciones generadoras de momentos (MGF), covarianza y demostración/aplicación formal del CLT.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VIII: INFERENCIA PARAMÉTRICA FORMAL Y MODELACIÓN MULTIVARIADA (UNIVERSIDAD)
    // ==========================================
    {
        id: 'stat-d8',
        label: 'Dominio VIII: Inferencia Formal, Pruebas de Hipótesis y Modelación Multivariada',
        level: 21,
        type: 'basic',
        requires: ['stat-vectores-clt-formal'],
        description: 'Teoría de estimación óptima, contrastes de significancia estadística rigurosos y análisis multivariado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'stat-estimacion-mle-propiedades',
        label: 'Estimación Puntual (MLE, Momentos) y Propiedades de Estimadores',
        level: 22,
        type: 'basic',
        requires: ['stat-d8'],
        description: 'Máxima verosimilitud (MLE), método de momentos, insesgadez, consistencia, suficiencia y cota inferior de Cramér-Rao.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-pruebas-hipotesis-anova',
        label: 'Pruebas de Hipótesis Formales, p-Valor, ANOVA y Chi-cuadrado',
        level: 22,
        type: 'critical',
        requires: ['stat-d8'],
        description: 'Lema de Neyman-Pearson, pruebas Z y t (1 y 2 colas), ANOVA de un factor (F-test), y contrastes Chi-cuadrado de bondad de ajuste e independencia.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'stat-regresion-multiple-diagnostico',
        label: 'Regresión Lineal Múltiple, Supuestos de Gauss-Markov y Logística',
        level: 23,
        type: 'applied',
        requires: ['stat-estimacion-mle-propiedades', 'stat-pruebas-hipotesis-anova'],
        description: 'Modelo matricial Y = Xβ + ε, estimación MCO, diagnóstico de residuos (homocedasticidad, normalidad, multicolinealidad VIF) y modelo logístico.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // CORONA SUPREMA DE MAESTRÍA EN PROBABILIDAD Y ESTADÍSTICA UNIVERSAL
    // ==========================================
    {
        id: 'stat-mastery',
        label: 'Pantocrátor de la Probabilidad y la Inferencia Estadística Universal',
        level: 24,
        type: 'evaluation',
        requires: [],
        description: 'Máximo galardón del pensamiento aleatorio y la ciencia de datos. Domina desde la exploración de datos, combinatoria y modelos probabilísticos hasta la inferencia rigurosa y la toma de decisiones bajo incertidumbre.',
        xOffset: 0,
        subcategoryId: 372,
        behavior: 'quiz_list'
    }
];
