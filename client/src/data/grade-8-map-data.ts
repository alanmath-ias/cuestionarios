import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade8MapNodes: ArithmeticNode[] = [
    // ==========================================
    // DOMINIO I: NÚMEROS REALES, NOTACIÓN Y ECUACIONES LINEALES (Periodo I)
    // ==========================================
    {
        id: 'g8-u1',
        label: 'DOMINIO I • Números Reales, Notación y Ecuaciones Lineales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Estructura de los reales (ℝ), notación científica, ecuaciones lineales e inecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-reales-orden-recta',
        label: 'Conjunto ℝ: Racionales, Irracionales y Recta Numérica',
        level: 1,
        type: 'basic',
        requires: ['g8-u1'],
        description: 'Estructura de los números reales, densidad, clasificación y ubicación en la recta.',
        xOffset: -60,
        additionalQuizzes: [951],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-notacion-cientifica',
        label: 'Notación Científica y Operaciones',
        level: 1,
        type: 'basic',
        requires: ['g8-u1'],
        description: 'Conversión a notación científica, potencias de 10 y cálculo de operaciones y aplicaciones.',
        xOffset: 60,
        additionalQuizzes: [952, 953],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-ecuaciones-lineales',
        label: 'Ecuaciones Lineales y Paréntesis',
        level: 2,
        type: 'critical',
        requires: ['g8-reales-orden-recta', 'g8-notacion-cientifica'],
        description: 'Transposición de términos, eliminación de signos de agrupación y ecuaciones de una variable.',
        xOffset: -50,
        additionalQuizzes: [50, 51, 52],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-inecuaciones-lineales',
        label: 'Inecuaciones Lineales y Conjunto Solución',
        level: 2,
        type: 'critical',
        requires: ['g8-reales-orden-recta'],
        description: 'Desigualdades algebraicas, intervalos en la recta real e inecuaciones simultáneas.',
        xOffset: 50,
        additionalQuizzes: [480, 481, 75],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-problemas-ecuaciones-modelado',
        label: 'Modelado de Problemas con Ecuaciones y Fórmulas',
        level: 3,
        type: 'applied',
        requires: ['g8-ecuaciones-lineales', 'g8-inecuaciones-lineales'],
        description: 'Planteamiento y resolución de problemas verbales, razonamiento inductivo, deductivo y despeje.',
        xOffset: 0,
        additionalQuizzes: [53, 54, 484, 65, 66],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO II: POLINOMIOS, PRODUCTOS Y COCIENTES NOTABLES (Periodo II)
    // ==========================================
    {
        id: 'g8-u2',
        label: 'DOMINIO II • Polinomios, Productos y Cocientes Notables',
        level: 4,
        type: 'basic',
        requires: ['g8-problemas-ecuaciones-modelado'],
        description: 'Monomios, polinomios, multiplicación, división, productos notables y triángulo de Pascal.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-polinomios-clasificacion-orden',
        label: 'Expresiones Algebraicas y Clasificación de Polinomios',
        level: 5,
        type: 'basic',
        requires: ['g8-u2'],
        description: 'Grado absoluto y relativo, términos semejantes, ordenación y signos de agrupación.',
        xOffset: -60,
        additionalQuizzes: [423, 424, 427],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-operaciones-polinomios',
        label: 'Multiplicación y División de Polinomios',
        level: 5,
        type: 'critical',
        requires: ['g8-u2'],
        description: 'Producto de polinomios, división sintética, regla de Ruffini y teorema del residuo.',
        xOffset: 60,
        additionalQuizzes: [428, 429, 430, 475, 476, 702],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-productos-notables-fundamentales',
        label: 'Productos Notables Fundamentales',
        level: 6,
        type: 'critical',
        requires: ['g8-polinomios-clasificacion-orden', 'g8-operaciones-polinomios'],
        description: 'Cuadrado y cubo de un binomio, suma por diferencia y producto de binomios con término común.',
        xOffset: -50,
        additionalQuizzes: [18, 19, 21, 22, 23],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-pascal-cocientes-notables',
        label: 'Triángulo de Pascal y Cocientes Notables',
        level: 6,
        type: 'applied',
        requires: ['g8-operaciones-polinomios'],
        description: 'Coeficientes binomiales de Pascal, expansión de potencias algebraicas y fórmulas de cocientes notables.',
        xOffset: 50,
        additionalQuizzes: [473, 474],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO III: FACTORIZACIÓN Y DESCOMPOSICIÓN POLINÓMICA (Periodo III)
    // ==========================================
    {
        id: 'g8-u3',
        label: 'DOMINIO III • Factorización y Descomposición Polinómica',
        level: 7,
        type: 'basic',
        requires: ['g8-productos-notables-fundamentales', 'g8-pascal-cocientes-notables'],
        description: 'Factoreo completo: factor común, agrupación, trinomios, binomios y casos combinados.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-descomposicion-primos-mcd',
        label: 'Descomposición Factorial y Máximo Común Divisor',
        level: 8,
        type: 'basic',
        requires: ['g8-u3'],
        description: 'Descomposición en factores primos y cálculo del MCD numérico como base del factoreo algebraico.',
        xOffset: -70,
        additionalQuizzes: [954, 955, 956],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-factor-comun-agrupacion',
        label: 'Factor Común y Agrupación de Términos',
        level: 8,
        type: 'critical',
        requires: ['g8-u3'],
        description: 'Factor común monomio, factor común polinomio y factorización por agrupación.',
        xOffset: 0,
        additionalQuizzes: [26, 27, 28, 411],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-diferencia-cuadrados-cubos',
        label: 'Diferencia de Cuadrados y Suma/Diferencia de Cubos',
        level: 8,
        type: 'critical',
        requires: ['g8-u3'],
        description: 'Factorización de binomios: diferencias de cuadrados perfectos y cubos perfectos.',
        xOffset: 70,
        additionalQuizzes: [30, 711, 38, 453],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-trinomios-cuadrados',
        label: 'Trinomio Cuadrado Perfecto y Trinomios x²+bx+c y ax²+bx+c',
        level: 9,
        type: 'critical',
        requires: ['g8-factor-comun-agrupacion', 'g8-diferencia-cuadrados-cubos'],
        description: 'Factorización sistemática de trinomios mediante raíces, tanteo y descomposición de coeficientes.',
        xOffset: -50,
        additionalQuizzes: [29, 35, 36, 450, 452],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-factorizacion-combinada-aplicaciones',
        label: 'Factorizaciones Combinadas y Aplicaciones (MCD/mcm de Polinomios)',
        level: 9,
        type: 'applied',
        requires: ['g8-trinomios-cuadrados', 'g8-descomposicion-primos-mcd'],
        description: 'Combinación de múltiples casos de factoreo, simplificación avanzada y cálculo de mcm y MCD de polinomios.',
        xOffset: 50,
        additionalQuizzes: [32, 40, 39, 438, 439],
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO IV: FRACCIONES ALGEBRAICAS, FUNCIONES Y FINANZAS (Periodo IV)
    // ==========================================
    {
        id: 'g8-u4',
        label: 'DOMINIO IV • Fracciones Algebraicas, Funciones y Educación Financiera',
        level: 10,
        type: 'basic',
        requires: ['g8-factorizacion-combinada-aplicaciones'],
        description: 'Operaciones con fracciones algebraicas, funciones lineales, gráficas y modelos financieros.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-fracciones-algebraicas-simplificacion',
        label: 'Fracciones Algebraicas y Simplificación',
        level: 11,
        type: 'basic',
        requires: ['g8-u4'],
        description: 'Dominio y restricciones en denominadores, simplificación de monomios y polinomios factorizados.',
        xOffset: -70,
        additionalQuizzes: [42, 45, 49],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-operaciones-fracciones-algebraicas',
        label: 'Operaciones y Ecuaciones con Fracciones Algebraicas',
        level: 11,
        type: 'critical',
        requires: ['g8-u4'],
        description: 'Suma, resta, multiplicación, división y resolución de ecuaciones fraccionarias lineales.',
        xOffset: 0,
        additionalQuizzes: [46, 47, 48, 830, 831, 833],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-concepto-funcion-graficas',
        label: 'Concepto de Función, Plano Cartesiano y Gráficas',
        level: 11,
        type: 'critical',
        requires: ['g8-u4'],
        description: 'Definición de función, dominio, rango, tabla de valores, gráfica en el plano y representaciones múltiples.',
        xOffset: 70,
        additionalQuizzes: [500, 503, 814, 815],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-funcion-lineal-afin-variacion',
        label: 'Función Lineal, Función Afín y Variación Directa e Inversa',
        level: 12,
        type: 'applied',
        requires: ['g8-concepto-funcion-graficas'],
        description: 'Pendiente, interceptos con los ejes, funciones crecientes/decrecientes y variación directa e inversa.',
        xOffset: -50,
        additionalQuizzes: [817, 820, 76, 400, 957],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-educacion-financiera-algebraica',
        label: 'Modelos de Interés Simple, Compuesto y Educación Financiera',
        level: 12,
        type: 'applied',
        requires: ['g8-operaciones-fracciones-algebraicas', 'g8-funcion-lineal-afin-variacion'],
        description: 'Modelación algebraica del dinero: tasas de interés, valor presente, valor futuro y crecimiento lineal vs exponencial.',
        xOffset: 50,
        additionalQuizzes: [958, 959, 960],
        behavior: 'quiz_list'
    },

    // ==========================================
    // EMBLEMA DE MAESTRÍA DE 8° GRADO
    // ==========================================
    {
        id: 'g8-mastery',
        label: 'Gran Vórtice Algebraico • Maestría de 8° Grado',
        level: 13,
        type: 'evaluation',
        requires: ['g8-funcion-lineal-afin-variacion', 'g8-educacion-financiera-algebraica'],
        description: 'Máximo galardón del álgebra de 8° grado. Demuestra dominio absoluto en números reales, polinomios, factorización, fracciones y funciones.',
        xOffset: 0,
        additionalQuizzes: [486, 493, 494],
        behavior: 'quiz_list'
    }
];
