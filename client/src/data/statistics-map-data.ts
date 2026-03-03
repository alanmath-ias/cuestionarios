import { ArithmeticNode } from './arithmetic-map-data';

export const statisticsMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL 1: INTRODUCCIÓN A LOS DATOS
    // ==========================================
    {
        id: 's1-intro-container',
        label: 'Introducción a los Datos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de la estadística y tipos de información.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's1-1-dato',
        label: '¿Qué es un dato?',
        level: 1,
        type: 'basic',
        requires: ['s1-intro-container'],
        description: 'Definición, ejemplos y datos vs información.',
        xOffset: -60,
        subcategoryId: 350,
        behavior: 'quiz_list'
    },
    {
        id: 's1-2-variables',
        label: 'Tipos de Variables',
        level: 1,
        type: 'basic',
        requires: ['s1-intro-container'],
        description: 'Variables cualitativas y cuantitativas.',
        xOffset: 0,
        subcategoryId: 351,
        behavior: 'quiz_list'
    },
    {
        id: 's1-3-poblacion',
        label: 'Población y Muestra',
        level: 1,
        type: 'basic',
        requires: ['s1-intro-container'],
        description: 'Conceptos de población, muestra y muestreo intuitivo.',
        xOffset: 60,
        subcategoryId: 352,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 2: MEDIDAS DE TENDENCIA CENTRAL
    // ==========================================
    {
        id: 's2-mtc-container',
        label: 'Tendencia Central',
        level: 2,
        type: 'critical',
        requires: ['s1-2-variables'],
        description: 'Las medidas que nos indican el centro de los datos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's2-1-no-agrupados',
        label: 'Datos no Agrupados',
        level: 3,
        type: 'basic',
        requires: ['s2-mtc-container'],
        description: 'Media, mediana y moda para listas simples.',
        xOffset: -40,
        subcategoryId: 353,
        behavior: 'quiz_list'
    },
    {
        id: 's2-2-agrupados',
        label: 'Datos Agrupados',
        level: 3,
        type: 'critical',
        requires: ['s2-mtc-container'],
        description: 'MTC para tablas con intervalos.',
        xOffset: 40,
        subcategoryId: 354,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 3: ORGANIZACIÓN Y TABULACIÓN
    // ==========================================
    {
        id: 's3-org-container',
        label: 'Organización y Tabulación',
        level: 4,
        type: 'basic',
        requires: ['s1-1-dato'],
        description: 'Cómo ordenar y resumir datos en tablas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's3-1-frec-simple',
        label: 'Tablas Frecuencia Simple',
        level: 5,
        type: 'basic',
        requires: ['s3-org-container'],
        description: 'Tabulación para pocas categorías.',
        xOffset: -40,
        subcategoryId: 355,
        behavior: 'quiz_list'
    },
    {
        id: 's3-2-intervalos',
        label: 'Tablas por Intervalos',
        level: 5,
        type: 'basic',
        requires: ['s3-org-container'],
        description: 'Agrupación de grandes conjuntos de datos.',
        xOffset: 40,
        subcategoryId: 356,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 4: GRÁFICOS ESTADÍSTICOS
    // ==========================================
    {
        id: 's4-graficos-container',
        label: 'Gráficos Estadísticos',
        level: 6,
        type: 'basic',
        requires: ['s3-1-frec-simple', 's3-2-intervalos'],
        description: 'Visualización efectiva de la información.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's4-1-barras-circular',
        label: 'Barras y Circular',
        level: 7,
        type: 'basic',
        requires: ['s4-graficos-container'],
        description: 'Gráficos básicos para variables cualitativas.',
        xOffset: -40,
        subcategoryId: 357,
        behavior: 'quiz_list'
    },
    {
        id: 's4-2-histograma',
        label: 'Histograma y Polígono',
        level: 7,
        type: 'basic',
        requires: ['s4-graficos-container'],
        description: 'Visualización de datos continuos y agrupados.',
        xOffset: 40,
        subcategoryId: 358,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 5: MEDIDAS DE DISPERSIÓN
    // ==========================================
    {
        id: 's5-disp-container',
        label: 'Medidas de Dispersión',
        level: 8,
        type: 'basic',
        requires: ['s2-1-no-agrupados', 's2-2-agrupados'],
        description: 'Entiende qué tan variados son tus datos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's5-1-rango-varianza',
        label: 'Rango y Varianza',
        level: 9,
        type: 'basic',
        requires: ['s5-disp-container'],
        description: 'Cálculo de la desviación respecto a la media.',
        xOffset: -40,
        subcategoryId: 359,
        behavior: 'quiz_list'
    },
    {
        id: 's5-2-desviacion',
        label: 'Desviación Estándar',
        level: 9,
        type: 'critical',
        requires: ['s5-disp-container'],
        description: 'Standard deviation and coefficient of variation.',
        xOffset: 40,
        subcategoryId: 360,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 6: MEDIDAS DE POSICIÓN
    // ==========================================
    {
        id: 's6-pos-container',
        label: 'Medidas de Posición',
        level: 10,
        type: 'basic',
        requires: ['s5-1-rango-varianza', 's5-2-desviacion'],
        description: 'Ubicación de valores dentro de una distribución.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's6-1-cuartiles',
        label: 'Cuartiles',
        level: 11,
        type: 'basic',
        requires: ['s6-pos-container'],
        description: 'Dividiendo los datos en cuatro partes.',
        xOffset: -40,
        subcategoryId: 361,
        behavior: 'quiz_list'
    },
    {
        id: 's6-2-deciles-percentiles',
        label: 'Deciles y Percentiles',
        level: 11,
        type: 'basic',
        requires: ['s6-pos-container'],
        description: 'Posiciones detalladas en el conjunto.',
        xOffset: 40,
        subcategoryId: 362,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 7: PROBABILIDAD
    // ==========================================
    {
        id: 's7-prob-container',
        label: 'Introducción a Probabilidad',
        level: 12,
        type: 'basic',
        requires: ['s1-3-poblacion'],
        description: 'El estudio del azar y la incertidumbre.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's7-1-espacio',
        label: 'Espacio Muestral',
        level: 13,
        type: 'basic',
        requires: ['s7-prob-container'],
        description: 'Eventos y resultados posibles.',
        xOffset: -50,
        subcategoryId: 363,
        behavior: 'quiz_list'
    },
    {
        id: 's7-2-laplace',
        label: 'Probabilidad Clásica',
        level: 13,
        type: 'critical',
        requires: ['s7-prob-container'],
        description: 'Regla de Laplace para eventos equiprobables.',
        xOffset: 0,
        subcategoryId: 364,
        behavior: 'quiz_list'
    },
    {
        id: 's7-3-empirica',
        label: 'Probabilidad Empírica',
        level: 13,
        type: 'basic',
        requires: ['s7-prob-container'],
        description: 'Probabilidad basada en la experimentación.',
        xOffset: 50,
        subcategoryId: 365,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 8: RELACIÓN ENTRE VARIABLES
    // ==========================================
    {
        id: 's8-rel-container',
        label: 'Relación entre Variables',
        level: 14,
        type: 'applied',
        requires: ['s4-1-barras-circular', 's4-2-histograma'],
        description: 'Cómo se afectan dos variables entre sí.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's8-1-correlacion',
        label: 'Correlación Lineal',
        level: 15,
        type: 'basic',
        requires: ['s8-rel-container'],
        description: 'Nubes de puntos y tendencias.',
        xOffset: -50,
        subcategoryId: 366,
        behavior: 'quiz_list'
    },
    {
        id: 's8-2-coeficiente',
        label: 'Coeficiente Correlación',
        level: 15,
        type: 'critical',
        requires: ['s8-rel-container'],
        description: 'Fuerza de la relación entre variables.',
        xOffset: 0,
        subcategoryId: 367,
        behavior: 'quiz_list'
    },
    {
        id: 's8-3-regresion',
        label: 'Recta de Regresión',
        level: 15,
        type: 'applied',
        requires: ['s8-rel-container'],
        description: 'Predicción de valores futuros.',
        xOffset: 50,
        subcategoryId: 368,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 9: METODOLOGÍA
    // ==========================================
    {
        id: 's9-met-container',
        label: 'Metodología',
        level: 16,
        type: 'basic',
        requires: ['s1-3-poblacion'],
        description: 'Cómo recolectar datos científicamente.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 's9-1-recoleccion',
        label: 'Métodos Recolección',
        level: 17,
        type: 'basic',
        requires: ['s9-met-container'],
        description: 'Observación, encuesta y experimento.',
        xOffset: -50,
        subcategoryId: 369,
        behavior: 'quiz_list'
    },
    {
        id: 's9-2-muestreo',
        label: 'Muestreo Aleatorio',
        level: 17,
        type: 'basic',
        requires: ['s9-met-container'],
        description: 'Muestreo aleatorio simple y sistemático.',
        xOffset: 0,
        subcategoryId: 370,
        behavior: 'quiz_list'
    },
    {
        id: 's9-3-encuestas',
        label: 'Encuestas y Cuestionarios',
        level: 17,
        type: 'basic',
        requires: ['s9-met-container'],
        description: 'Diseño de instrumentos de investigación.',
        xOffset: 50,
        subcategoryId: 371,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL FINAL: MAESTRÍA
    // ==========================================
    {
        id: 's-mastery',
        label: 'Maestría en Estadística',
        level: 18,
        type: 'evaluation',
        requires: ['s6-1-cuartiles', 's7-2-laplace', 's8-2-coeficiente'],
        description: 'El desafío final del módulo de estadística.',
        xOffset: 0,
        subcategoryId: 372,
        behavior: 'quiz_list'
    }
];

