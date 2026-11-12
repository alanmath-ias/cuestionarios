import { ArithmeticNode } from './arithmetic-map-data';

export const grade9MapNodes: ArithmeticNode[] = [
    // ==========================================
    // DOMINIO I: REALES, POTENCIAS, RADICALES Y COMPLEJOS
    // ==========================================
    {
        id: 'g9-dominio-1',
        label: 'Dominio I: Reales, Potencias y Radicales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de números reales, valor absoluto, leyes de exponentes, operaciones con radicales, racionalización y el sistema de números complejos.',
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
        xOffset: -28,
        additionalQuizzes: [961, 962, 963, 1112],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-potencias-exponentes',
        label: 'Potencias y Exponentes Reales',
        level: 1,
        type: 'basic',
        requires: ['g9-dominio-1'],
        description: 'Leyes y propiedades de las potencias, potencias de potencias y exponentes fraccionarios.',
        xOffset: 28,
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
        xOffset: -55,
        additionalQuizzes: [968, 969, 970, 971, 972],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-racionalizacion-radicales',
        label: 'Racionalización de Radicales',
        level: 2,
        type: 'applied',
        requires: ['g9-radicales-operaciones'],
        description: 'Racionalización de denominadores monomios y binomios conjugados con raíces cuadradas y superiores.',
        xOffset: 55,
        additionalQuizzes: [973, 974, 975, 976, 977],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-complejos-introduccion-operaciones',
        label: 'Sistema de Números Complejos y Operaciones',
        level: 3,
        type: 'applied',
        requires: ['g9-radicales-operaciones', 'g9-racionalizacion-radicales'],
        description: 'Unidad imaginaria i, potencias cíclicas de i, números complejos (a + bi), plano de Argand, operaciones fundamentales y raíces de ecuaciones cuadráticas.',
        xOffset: 0,
        additionalQuizzes: [1117, 1118],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO II: LA RECTA, SISTEMAS 2X2, 3X3 E INECUACIONES
    // ==========================================
    {
        id: 'g9-dominio-2',
        label: 'Dominio II: La Recta, Sistemas e Inecuaciones',
        level: 4,
        type: 'basic',
        requires: ['g9-complejos-introduccion-operaciones'],
        description: 'Geometría analítica de la recta, funciones afines, sistemas lineales 2x2 y 3x3 (Gauss y Cramer) e inecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-funciones-lineales-afines',
        label: 'Funciones Lineales y Afines',
        level: 5,
        type: 'basic',
        requires: ['g9-dominio-2'],
        description: 'Concepto formal de función, dominio, rango, representaciones, operaciones y funciones lineal y afín.',
        xOffset: -68,
        additionalQuizzes: [1113, 505],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-recta-pendiente-ecuaciones',
        label: 'La Recta: Pendiente y Ecuaciones',
        level: 5,
        type: 'basic',
        requires: ['g9-dominio-2'],
        description: 'Cálculo de pendiente, interceptos, ecuación punto-pendiente, dos puntos y forma simétrica de la recta.',
        xOffset: 0,
        additionalQuizzes: [818, 821, 823, 824],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-sistemas-lineales-2x2',
        label: 'Sistemas de Ecuaciones Lineales 2x2',
        level: 5,
        type: 'applied',
        requires: ['g9-dominio-2'],
        description: 'Métodos de sustitución, igualación, eliminación, método gráfico, regla de Cramer 2x2 y problemas de aplicación.',
        xOffset: 68,
        additionalQuizzes: [274, 780, 781, 782, 783, 276, 277, 275, 1114],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-paralelas-perpendiculares-modelado',
        label: 'Rectas Paralelas, Perpendiculares y Modelado',
        level: 6,
        type: 'critical',
        requires: ['g9-funciones-lineales-afines', 'g9-recta-pendiente-ecuaciones'],
        description: 'Criterios de paralelismo y perpendicularidad, casos especiales y modelado de situaciones reales.',
        xOffset: -45,
        additionalQuizzes: [822, 825, 826, 827, 828],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-sistemas-lineales-3x3',
        label: 'Sistemas Lineales 3x3 y Regla de Cramer',
        level: 6,
        type: 'applied',
        requires: ['g9-sistemas-lineales-2x2', 'g9-recta-pendiente-ecuaciones'],
        description: 'Sistemas de 3 ecuaciones lineales con 3 incógnitas: eliminación Gaussiana, determinantes 3x3, regla de Sarrus y regla de Cramer.',
        xOffset: 45,
        additionalQuizzes: [1119, 1120],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-inecuaciones-lineales-sistemas',
        label: 'Inecuaciones Lineales y Aplicaciones',
        level: 7,
        type: 'evaluation',
        requires: ['g9-paralelas-perpendiculares-modelado', 'g9-sistemas-lineales-3x3'],
        description: 'Inecuaciones lineales en una y dos variables, intervalos numéricos, regiones en el plano cartesiano y resolución de problemas.',
        xOffset: 0,
        additionalQuizzes: [74, 479, 485, 1115],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO III: ECUACIONES, FUNCIONES CUADRÁTICAS Y OPTIMIZACIÓN
    // ==========================================
    {
        id: 'g9-dominio-3',
        label: 'Dominio III: Ecuaciones y Funciones Cuadráticas',
        level: 8,
        type: 'basic',
        requires: ['g9-inecuaciones-lineales-sistemas'],
        description: 'Resolución de ecuaciones de segundo grado por factorización y fórmula general, análisis de la función cuadrática, parábolas y optimización.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-cuadraticas-factorizacion',
        label: 'Ecuaciones Cuadráticas por Factorización',
        level: 9,
        type: 'basic',
        requires: ['g9-dominio-3'],
        description: 'Solución de ecuaciones de segundo grado completas e incompletas por factorización y formas reducibles.',
        xOffset: -45,
        additionalQuizzes: [486, 876, 487],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-cuadraticas-formula-fraccionarias',
        label: 'Fórmula Cuadrática y Ecuaciones Complejas',
        level: 9,
        type: 'critical',
        requires: ['g9-dominio-3'],
        description: 'Completación de cuadrados, discriminante, fórmula cuadrática y ecuaciones con denominadores algebraicos.',
        xOffset: 45,
        additionalQuizzes: [488, 498, 835, 836],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-funcion-cuadratica-parabola',
        label: 'Función Cuadrática: Vértice y Parábola',
        level: 10,
        type: 'applied',
        requires: ['g9-cuadraticas-factorizacion', 'g9-cuadraticas-formula-fraccionarias'],
        description: 'Análisis de la parábola: vértice (h, k), eje de simetría, concavidad, raíces y transformaciones de funciones.',
        xOffset: -65,
        additionalQuizzes: [978, 979, 980, 981, 504],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-inecuaciones-cuadraticas-aplicaciones',
        label: 'Inecuaciones Cuadráticas y Aplicaciones Reales',
        level: 10,
        type: 'evaluation',
        requires: ['g9-cuadraticas-formula-fraccionarias'],
        description: 'Inecuaciones cuadráticas por método de intervalos y problemas verbales de modelado cuadrático.',
        xOffset: 65,
        additionalQuizzes: [482, 483, 493, 494],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-optimizacion-cuadratica',
        label: 'Optimización Cuadrática: Máximos y Mínimos',
        level: 11,
        type: 'applied',
        requires: ['g9-funcion-cuadratica-parabola', 'g9-inecuaciones-cuadraticas-aplicaciones'],
        description: 'Optimización cuadrática en contextos reales: ingresos máximos, áreas óptimas, trayectorias de proyectiles y costos mínimos.',
        xOffset: 0,
        additionalQuizzes: [1121],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO IV: EXPONENCIALES, LOGARITMOS, SUCESIONES Y FINANZAS
    // ==========================================
    {
        id: 'g9-dominio-4',
        label: 'Dominio IV: Exponenciales, Logaritmos, Sucesiones y Finanzas',
        level: 12,
        type: 'basic',
        requires: ['g9-optimizacion-cuadratica'],
        description: 'Función inversa, funciones y ecuaciones exponenciales y logarítmicas, análisis gráfico, sucesiones y educación financiera.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-funcion-inversa',
        label: 'Función Inversa',
        level: 13,
        type: 'basic',
        requires: ['g9-dominio-4'],
        description: 'Concepto de función inversa f⁻¹(x), simetría respecto a y = x, despeje algebraico y aplicaciones.',
        xOffset: -68,
        additionalQuizzes: [982, 983, 984],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-exponenciales-ecuaciones-sistemas',
        label: 'Ecuaciones y Sistemas Exponenciales',
        level: 13,
        type: 'critical',
        requires: ['g9-dominio-4'],
        description: 'Ecuaciones exponenciales monómicas, cambio de variable u = aˣ y sistemas de ecuaciones exponenciales.',
        xOffset: 0,
        additionalQuizzes: [877, 878, 879, 880, 881, 882, 883, 884, 885],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-sucesiones-series',
        label: 'Sucesiones Aritméticas y Geométricas',
        level: 13,
        type: 'applied',
        requires: ['g9-dominio-4'],
        description: 'Término general aₙ, razón, sumas parciales Sₙ, progresiones aritméticas, geométricas y series.',
        xOffset: 68,
        additionalQuizzes: [985, 986, 987, 988, 989, 990, 384, 385, 386, 387, 388, 389],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-logaritmos-propiedades-ecuaciones',
        label: 'Propiedades y Ecuaciones Logarítmicas',
        level: 14,
        type: 'applied',
        requires: ['g9-funcion-inversa', 'g9-exponenciales-ecuaciones-sistemas'],
        description: 'Propiedades de logaritmos, cambio de base, ecuaciones logarítmicas e interconversión exponencial-logarítmica.',
        xOffset: -45,
        additionalQuizzes: [886, 887, 888, 889, 890, 891, 892, 893],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-educacion-financiera-avanzada',
        label: 'Educación Financiera y Tasas de Interés',
        level: 14,
        type: 'evaluation',
        requires: ['g9-exponenciales-ecuaciones-sistemas', 'g9-sucesiones-series'],
        description: 'Matemática financiera avanzada: capitalización compuesta exponencial, despeje de tiempo con logaritmos, progresiones de ahorro y depreciación.',
        xOffset: 45,
        additionalQuizzes: [1116],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-funciones-exponenciales-logaritmicas',
        label: 'Funciones Exponenciales y Logarítmicas',
        level: 15,
        type: 'applied',
        requires: ['g9-logaritmos-propiedades-ecuaciones', 'g9-educacion-financiera-avanzada'],
        description: 'Análisis gráfico: comportamiento asintótico (asíntota horizontal y vertical), interceptos, traslaciones y simetría inversa.',
        xOffset: 0,
        additionalQuizzes: [1122],
        behavior: 'quiz_list'
    },

    // ==========================================
    // EMBLEMA DE MAESTRÍA DE 9° GRADO (DESVINCULADO)
    // ==========================================
    {
        id: 'g9-mastery',
        label: 'Gran Vórtice del Álgebra Superior • Maestría de 9° Grado',
        level: 16,
        type: 'evaluation',
        requires: [],
        description: 'Máximo galardón del álgebra de 9° grado. Demuestra dominio absoluto en radicales, sistemas 2x2 y 3x3, funciones cuadráticas, optimización, exponenciales, logaritmos y sucesiones.',
        xOffset: 0,
        additionalQuizzes: [828, 494, 894],
        behavior: 'quiz_list'
    }
];
