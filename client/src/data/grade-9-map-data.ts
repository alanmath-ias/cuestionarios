import { ArithmeticNode } from './arithmetic-map-data';

export const grade9MapNodes: ArithmeticNode[] = [
    // ==========================================
    // DOMINIO I: REALES, POTENCIAS Y RADICALES
    // ==========================================
    {
        id: 'g9-dominio-1',
        label: 'Dominio I: Reales, Potencias y Radicales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de números reales, valor absoluto, leyes de exponentes y operaciones con radicales y racionalización.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-reales-valor-absoluto',
        label: 'Números Reales y Valor Absoluto',
        level: 1,
        type: 'basic',
        requires: ['g9-dominio-1'],
        description: 'Clasificación de números reales (ℝ, ℚ, 𝕀), densidad, orden y operaciones con valor absoluto.',
        xOffset: -60,
        additionalQuizzes: [301, 961, 962, 963],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-potencias-exponentes',
        label: 'Potencias y Exponentes Reales',
        level: 1,
        type: 'basic',
        requires: ['g9-dominio-1'],
        description: 'Leyes y propiedades de las potencias, potencias de potencias y exponentes fraccionarios.',
        xOffset: 60,
        additionalQuizzes: [964, 965, 966, 967],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-radicales-operaciones',
        label: 'Radicales y Operaciones',
        level: 2,
        type: 'critical',
        requires: ['g9-reales-valor-absoluto', 'g9-potencias-exponentes'],
        description: 'Simplificación de radicales cuadrados y cúbicos, operaciones, raíz de raíz y reducción de índices.',
        xOffset: -50,
        additionalQuizzes: [968, 969, 970, 971, 972],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-racionalizacion-radicales',
        label: 'Racionalización de Radicales',
        level: 2,
        type: 'applied',
        requires: ['g9-potencias-exponentes'],
        description: 'Racionalización de denominadores monomios y binomios conjugados con raíces cuadradas y superiores.',
        xOffset: 50,
        additionalQuizzes: [973, 974, 975, 976, 977],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO II: LA RECTA, SISTEMAS 2X2 E INECUACIONES
    // ==========================================
    {
        id: 'g9-dominio-2',
        label: 'Dominio II: La Recta, Sistemas 2x2 e Inecuaciones',
        level: 3,
        type: 'basic',
        requires: ['g9-radicales-operaciones', 'g9-racionalizacion-radicales'],
        description: 'Geometría analítica de la recta, ecuaciones lineales de dos variables, sistemas 2x2 e inecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-funciones-lineales-afines',
        label: 'Funciones Lineales y Afines',
        level: 4,
        type: 'basic',
        requires: ['g9-dominio-2'],
        description: 'Concepto formal de función, dominio, rango, representaciones y funciones lineal y afín.',
        xOffset: -60,
        additionalQuizzes: [500, 503, 76, 400],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-recta-pendiente-ecuaciones',
        label: 'La Recta: Pendiente y Ecuaciones',
        level: 4,
        type: 'basic',
        requires: ['g9-dominio-2'],
        description: 'Cálculo de pendiente, interceptos, ecuación punto-pendiente, dos puntos y forma simétrica de la recta.',
        xOffset: 60,
        additionalQuizzes: [814, 815, 817, 818, 820, 821, 823, 824],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-paralelas-perpendiculares-modelado',
        label: 'Rectas Paralelas, Perpendiculares y Modelado',
        level: 5,
        type: 'critical',
        requires: ['g9-funciones-lineales-afines', 'g9-recta-pendiente-ecuaciones'],
        description: 'Criterios de paralelismo y perpendicularidad, casos especiales y modelado de situaciones reales.',
        xOffset: -50,
        additionalQuizzes: [822, 825, 826, 827, 828],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-sistemas-lineales-2x2',
        label: 'Sistemas de Ecuaciones Lineales 2x2',
        level: 5,
        type: 'applied',
        requires: ['g9-recta-pendiente-ecuaciones'],
        description: 'Métodos de sustitución, igualación, eliminación, método gráfico y regla de Cramer.',
        xOffset: 50,
        additionalQuizzes: [274, 780, 781, 782, 783, 276, 277, 275],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-inecuaciones-lineales-sistemas',
        label: 'Inecuaciones Lineales y Aplicaciones',
        level: 6,
        type: 'evaluation',
        requires: ['g9-paralelas-perpendiculares-modelado', 'g9-sistemas-lineales-2x2'],
        description: 'Inecuaciones lineales en una y dos variables, intervalos numéricos y resolución de problemas.',
        xOffset: 0,
        additionalQuizzes: [52, 480, 481, 74, 479, 484, 485],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO III: ECUACIONES Y FUNCIONES CUADRÁTICAS
    // ==========================================
    {
        id: 'g9-dominio-3',
        label: 'Dominio III: Ecuaciones y Funciones Cuadráticas',
        level: 7,
        type: 'basic',
        requires: ['g9-inecuaciones-lineales-sistemas'],
        description: 'Resolución de ecuaciones de segundo grado por factorización y fórmula general, análisis de la función cuadrática y parábolas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-cuadraticas-factorizacion',
        label: 'Ecuaciones Cuadráticas por Factorización',
        level: 8,
        type: 'basic',
        requires: ['g9-dominio-3'],
        description: 'Solución de ecuaciones de segundo grado completas e incompletas por factorización y formas reducibles.',
        xOffset: -50,
        additionalQuizzes: [486, 876, 487],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-cuadraticas-formula-fraccionarias',
        label: 'Fórmula Cuadrática y Ecuaciones Complejas',
        level: 8,
        type: 'critical',
        requires: ['g9-dominio-3'],
        description: 'Completación de cuadrados, discriminante, fórmula cuadrática y ecuaciones con denominadores algebraicos.',
        xOffset: 50,
        additionalQuizzes: [488, 498, 835, 836],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-funcion-cuadratica-parabola',
        label: 'Función Cuadrática: Vértice y Parábola',
        level: 9,
        type: 'applied',
        requires: ['g9-cuadraticas-factorizacion', 'g9-cuadraticas-formula-fraccionarias'],
        description: 'Análisis de la parábola: vértice (h, k), eje de simetría, concavidad, raíces y traslaciones gráficas.',
        xOffset: -50,
        additionalQuizzes: [978, 979, 980, 981],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-inecuaciones-cuadraticas-aplicaciones',
        label: 'Inecuaciones Cuadráticas y Aplicaciones Reales',
        level: 9,
        type: 'evaluation',
        requires: ['g9-cuadraticas-formula-fraccionarias'],
        description: 'Inecuaciones cuadráticas por método de intervalos y problemas verbales de modelado cuadrático y optimización.',
        xOffset: 50,
        additionalQuizzes: [482, 483, 493, 494],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO IV: EXPONENCIALES, LOGARITMOS, SUCESIONES Y FINANZAS
    // ==========================================
    {
        id: 'g9-dominio-4',
        label: 'Dominio IV: Exponenciales, Logaritmos, Sucesiones y Finanzas',
        level: 10,
        type: 'basic',
        requires: ['g9-funcion-cuadratica-parabola', 'g9-inecuaciones-cuadraticas-aplicaciones'],
        description: 'Función inversa, funciones y ecuaciones exponenciales y logarítmicas, sucesiones y educación financiera.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-funcion-inversa',
        label: 'Función Inversa',
        level: 11,
        type: 'basic',
        requires: ['g9-dominio-4'],
        description: 'Concepto de función inversa f⁻¹(x), simetría respecto a y = x, despeje algebraico y aplicaciones.',
        xOffset: -60,
        additionalQuizzes: [982, 983, 984],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-exponenciales-ecuaciones-sistemas',
        label: 'Ecuaciones y Sistemas Exponenciales',
        level: 11,
        type: 'critical',
        requires: ['g9-dominio-4'],
        description: 'Ecuaciones exponenciales monómicas, cambio de variable u = aˣ y sistemas de ecuaciones exponenciales.',
        xOffset: 60,
        additionalQuizzes: [877, 878, 879, 880, 881, 882, 883, 884, 885],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-logaritmos-propiedades-ecuaciones',
        label: 'Propiedades y Ecuaciones Logarítmicas',
        level: 12,
        type: 'applied',
        requires: ['g9-funcion-inversa', 'g9-exponenciales-ecuaciones-sistemas'],
        description: 'Propiedades de logaritmos, cambio de base, ecuaciones logarítmicas e interconversión exponencial-logarítmica.',
        xOffset: -60,
        additionalQuizzes: [886, 887, 888, 889, 890, 891, 892, 893, 894],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-sucesiones-series',
        label: 'Sucesiones Aritméticas y Geométricas',
        level: 12,
        type: 'applied',
        requires: ['g9-exponenciales-ecuaciones-sistemas'],
        description: 'Término general aₙ, razón, sumas parciales Sₙ, progresiones aritméticas, geométricas y series.',
        xOffset: 60,
        additionalQuizzes: [985, 986, 987, 988, 989, 990],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-educacion-financiera-avanzada',
        label: 'Educación Financiera y Tasas de Interés',
        level: 13,
        type: 'evaluation',
        requires: ['g9-logaritmos-propiedades-ecuaciones', 'g9-sucesiones-series'],
        description: 'Matemática financiera: interés simple, capitalización compuesta exponencial, tasas y decisiones de ahorro e inversión.',
        xOffset: 0,
        additionalQuizzes: [392, 393, 518],
        behavior: 'quiz_list'
    },

    // ==========================================
    // EMBLEMA DE MAESTRÍA DE 9° GRADO
    // ==========================================
    {
        id: 'g9-mastery',
        label: 'Gran Vórtice del Álgebra Superior • Maestría de 9° Grado',
        level: 14,
        type: 'evaluation',
        requires: ['g9-educacion-financiera-avanzada'],
        description: 'Máximo galardón del álgebra de 9° grado. Demuestra dominio absoluto en radicales, sistemas 2x2, la recta, ecuaciones cuadráticas, exponenciales, logaritmos y sucesiones.',
        xOffset: 0,
        additionalQuizzes: [828, 494, 894],
        behavior: 'quiz_list'
    }
];
