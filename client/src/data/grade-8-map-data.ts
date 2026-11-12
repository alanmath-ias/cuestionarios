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
        additionalQuizzes: [301, 1107],
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
        additionalQuizzes: [356, 357],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-ecuaciones-lineales',
        label: 'Ecuaciones Lineales y Signos de Agrupación',
        level: 2,
        type: 'critical',
        requires: ['g8-reales-orden-recta', 'g8-notacion-cientifica'],
        description: 'Transposición de términos, eliminación de paréntesis y resolución de ecuaciones lineales de una variable.',
        xOffset: -50,
        additionalQuizzes: [50, 51],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-inecuaciones-lineales',
        label: 'Inecuaciones Lineales y Conjunto Solución',
        level: 2,
        type: 'critical',
        requires: ['g8-reales-orden-recta'],
        description: 'Desigualdades lineales, intervalos en la recta real y propiedades de inversión con coeficientes negativos.',
        xOffset: 50,
        additionalQuizzes: [480],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-problemas-ecuaciones-modelado',
        label: 'Modelado de Problemas Verbales y Móviles',
        level: 3,
        type: 'applied',
        requires: ['g8-ecuaciones-lineales', 'g8-inecuaciones-lineales'],
        description: 'Planteamiento y resolución de problemas verbales de edades, relaciones numéricas, problemas de móviles en MRU y aplicaciones de inecuaciones.',
        xOffset: 0,
        additionalQuizzes: [53, 54, 55, 64, 484],
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
        additionalQuizzes: [428, 429, 430, 475, 476, 702, 703, 705],
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
        additionalQuizzes: [402, 18, 401, 19, 21, 22, 408],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-pascal-cocientes-notables',
        label: 'Triángulo de Pascal, Cocientes Notables y Ecuaciones con Productos',
        level: 6,
        type: 'applied',
        requires: ['g8-operaciones-polinomios'],
        description: 'Coeficientes binomiales de Pascal, expansión de potencias, cocientes notables, identidades algebraicas y ecuaciones/inecuaciones con productos.',
        xOffset: 50,
        additionalQuizzes: [473, 474, 20, 23, 409, 410, 52, 481, 75],
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
        label: 'MCD y mcm de Monomios',
        level: 8,
        type: 'basic',
        requires: ['g8-u3'],
        description: 'Máximo Común Divisor y Mínimo Común Múltiplo de monomios como base para la simplificación y adición racional.',
        xOffset: -70,
        additionalQuizzes: [431, 432],
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
        description: 'Factorización de binomios: diferencias de cuadrados perfectos (básico, especial y polinomios) y cubos perfectos.',
        xOffset: 70,
        additionalQuizzes: [30, 711, 31, 412, 37, 38, 453],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-trinomios-cuadrados',
        label: 'Trinomio Cuadrado Perfecto y Trinomios x²+bx+c y ax²+bx+c',
        level: 9,
        type: 'critical',
        requires: ['g8-factor-comun-agrupacion', 'g8-diferencia-cuadrados-cubos'],
        description: 'Factorización sistemática de trinomios mediante raíces, tanteo, descomposición de coeficientes y adición/sustracción.',
        xOffset: -50,
        additionalQuizzes: [29, 413, 35, 450, 36, 452, 33, 34],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-factorizacion-combinada-aplicaciones',
        label: 'Factorizaciones Combinadas, División Sintética y mcm/MCD Polinómico',
        level: 9,
        type: 'applied',
        requires: ['g8-trinomios-cuadrados', 'g8-descomposicion-primos-mcd'],
        description: 'Combinación de múltiples casos de factoreo, división sintética con el teorema del residuo y cálculo de mcm y MCD de polinomios.',
        xOffset: 50,
        additionalQuizzes: [32, 40, 451, 39, 477, 478, 41, 857, 438, 439],
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
        description: 'Dominio y restricciones en denominadores, simplificación de monomios, polinomios factorizados y fracciones complejas.',
        xOffset: -70,
        additionalQuizzes: [42, 45, 454, 49],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-operaciones-fracciones-algebraicas',
        label: 'Operaciones y Ecuaciones con Fracciones Algebraicas',
        level: 11,
        type: 'critical',
        requires: ['g8-u4'],
        description: 'Suma, resta, multiplicación, operaciones avanzadas y resolución de ecuaciones fraccionarias lineales mediante factorización.',
        xOffset: 0,
        additionalQuizzes: [46, 47, 455, 48, 456, 830, 831, 832, 833, 834],
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
        additionalQuizzes: [392, 393, 518],
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
        requires: [],
        description: 'Máximo galardón del álgebra de 8° grado. Demuestra dominio absoluto en números reales, polinomios, factorización, fracciones y funciones.',
        xOffset: 0,
        additionalQuizzes: [1108],
        behavior: 'quiz_list'
    }
];
