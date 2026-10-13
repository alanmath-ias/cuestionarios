import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade5MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: TEORÍA DE CONJUNTOS Y SISTEMAS
    // ==========================================
    {
        id: 'g5-conjuntos',
        label: 'Conjuntos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de la teoría de conjuntos, relaciones de pertenencia y operaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-det-conjuntos',
        label: 'Determinación y Clases',
        level: 1,
        type: 'basic',
        requires: ['g5-conjuntos'],
        description: 'Extensión, comprensión, conjunto universal, vacío, unitario, finitos e infinitos.',
        xOffset: -50,
        additionalQuizzes: [992, 993], // Quiz 992: Extensión y Comprensión | Quiz 993: Clases y Cardinalidad
        behavior: 'quiz_list'
    },
    {
        id: 'g5-ops-conjuntos',
        label: 'Operaciones entre Conjuntos',
        level: 1,
        type: 'basic',
        requires: ['g5-conjuntos'],
        description: 'Unión, intersección, diferencia simétrica, complemento y diagramas de Venn.',
        xOffset: 50,
        additionalQuizzes: [994, 995, 996], // Quiz 994: Unión e Intersección | Quiz 995: Diferencia y Complemento | Quiz 996: Problemas Venn
        behavior: 'quiz_list'
    },
    {
        id: 'g5-producto-cartesiano',
        label: 'Producto Cartesiano',
        level: 2,
        type: 'basic',
        requires: ['g5-det-conjuntos', 'g5-ops-conjuntos'],
        description: 'Pares ordenados (x, y), plano cartesiano y relaciones entre conjuntos.',
        xOffset: 0,
        additionalQuizzes: [997, 998], // Quiz 997: Pares Ordenados y Producto Cartesiano | Quiz 998: Representación Gráfica y Relaciones
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: NÚMEROS NATURALES Y OPERACIONES
    // ==========================================
    {
        id: 'g5-naturales',
        label: 'Números Naturales',
        level: 3,
        type: 'basic',
        requires: ['g5-producto-cartesiano'],
        description: 'Estructura posicional hasta millones, algoritmos y jerarquía de operaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-posicional',
        label: 'Valor Posicional',
        level: 4,
        type: 'basic',
        requires: ['g5-naturales'],
        description: 'Valor posicional y descomposición polinómica de números grandes hasta millones.',
        xOffset: -40,
        additionalQuizzes: [419, 420], // Quiz 419: Valor Posicional | Quiz 420: Descomposición Posicional
        behavior: 'quiz_list'
    },
    {
        id: 'g5-recta',
        label: 'Recta y Comparación',
        level: 4,
        type: 'basic',
        requires: ['g5-naturales'],
        description: 'Ubicación en la recta numérica, intervalos, distancias y relaciones de orden.',
        xOffset: 40,
        additionalQuizzes: [302, 303], // Quiz 302: Ubicación y Comparación N1 | Quiz 303: Problemas y Aplicaciones N2
        behavior: 'quiz_list'
    },
    {
        id: 'g5-suma-resta',
        label: 'Suma y Resta',
        level: 5,
        type: 'basic',
        requires: ['g5-posicional', 'g5-recta'],
        description: 'Algoritmos con múltiples reagrupaciones, minuendos con ceros y propiedades.',
        xOffset: -40,
        additionalQuizzes: [304, 305], // Quiz 304: Fundamentos N1 | Quiz 305: Avanzado N2
        behavior: 'quiz_list'
    },
    {
        id: 'g5-multi-div',
        label: 'Multiplicación y División',
        level: 5,
        type: 'critical',
        requires: ['g5-posicional', 'g5-recta'],
        description: 'Algoritmos de multiplicación y división entre dos y tres cifras en el divisor.',
        xOffset: 40,
        additionalQuizzes: [6, 448, 449], // Quiz 6: División 2 cifras | Quiz 448: División 2 cifras Intro | Quiz 449: División 3 cifras (El Reto)
        behavior: 'quiz_list'
    },
    {
        id: 'g5-tablas',
        label: 'Cálculo Mental y Tablas',
        level: 6,
        type: 'basic',
        requires: ['g5-multi-div'],
        description: 'Dominio integral de tablas de multiplicar, estimación y cálculo mental rápido.',
        xOffset: -75,
        additionalQuizzes: [515, 626], // Quiz 515: Desafío de las Tablas 1 al 10 | Quiz 626: Multiplica y Descubre V/F del 1 al 20
        behavior: 'quiz_list'
    },
    {
        id: 'g5-jerarquia',
        label: 'Jerarquía de Operaciones',
        level: 6,
        type: 'basic',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Orden formal de las operaciones (PEMDAS) con signos de agrupación.',
        xOffset: -25,
        additionalQuizzes: [433, 434], // Quiz 433: Jerarquía I | Quiz 434: Jerarquía II
        behavior: 'quiz_list'
    },
    {
        id: 'g5-igualdades',
        label: 'Igualdades y Balanzas',
        level: 6,
        type: 'basic',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Equilibrio de balanzas, término desconocido y ecuaciones aditivas y multiplicativas.',
        xOffset: 25,
        additionalQuizzes: [1065, 1066], // Quiz 1065: Balanzas en Equilibrio y Término Desconocido | Quiz 1066: Ecuaciones Multiplicativas
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-nat',
        label: 'Resolución de Problemas',
        level: 6,
        type: 'applied',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Estrategias de resolución en situaciones cotidianas combinando las cuatro operaciones.',
        xOffset: 75,
        additionalQuizzes: [307, 308, 644], // Quiz 307: Nivel 2 | Quiz 308: Nivel 3 | Quiz 644: Dividiendo para Resolver
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TEORÍA DE NÚMEROS (DIVISIBILIDAD)
    // ==========================================
    {
        id: 'g5-divisibilidad',
        label: 'Teoría de Números',
        level: 7,
        type: 'basic',
        requires: ['g5-jerarquia', 'g5-problemas-nat'],
        description: 'Divisibilidad, números primos, factorización factorial y cálculo de MCM y MCD.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-primos',
        label: 'Primos, Múltiplos y Divisores',
        level: 8,
        type: 'basic',
        requires: ['g5-divisibilidad'],
        description: 'Criba de Eratóstenes, números primos y compuestos, múltiplos y divisores.',
        xOffset: -50,
        additionalQuizzes: [318, 319], // Quiz 318: Primos y Compuestos | Quiz 319: Múltiplos y Divisores
        behavior: 'quiz_list'
    },
    {
        id: 'g5-criterios',
        label: 'Criterios de Divisibilidad',
        level: 8,
        type: 'basic',
        requires: ['g5-divisibilidad'],
        description: 'Reglas para reconocer divisibilidad entre 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 y 12.',
        xOffset: 50,
        additionalQuizzes: [320, 321], // Quiz 320: Criterios Básicos (2, 3, 4, 5, 7) | Quiz 321: Criterios Avanzados (6, 8-12)
        behavior: 'quiz_list'
    },
    {
        id: 'g5-descomposicion',
        label: 'Factores Primos',
        level: 9,
        type: 'basic',
        requires: ['g5-primos', 'g5-criterios'],
        description: 'Descomposición factorial en árbol y divisiones sucesivas hasta factores primos.',
        xOffset: 0,
        additionalQuizzes: [3, 323], // Quiz 3: Descomposición Factorial | Quiz 323: Descomposición y Errores
        behavior: 'quiz_list'
    },
    {
        id: 'g5-mcm-mcd',
        label: 'MCM y MCD',
        level: 10,
        type: 'basic',
        requires: ['g5-descomposicion'],
        description: 'Mínimo común múltiplo y máximo común divisor por descomposición simultánea.',
        xOffset: -45,
        additionalQuizzes: [322, 324, 694], // Quiz 322: Básico N1 | Quiz 324: Avanzado y Mental N3 | Quiz 694: MCM Dos o más de dos cifras
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-mcm-mcd',
        label: 'Problemas de MCM y MCD',
        level: 10,
        type: 'applied',
        requires: ['g5-descomposicion'],
        description: 'Problemas de coincidencia periódica (MCM) y reparto máximo sin sobrantes (MCD).',
        xOffset: 45,
        additionalQuizzes: [4, 470, 325], // Quiz 4: Problemas MCM | Quiz 470: Problemas MCD | Quiz 325: Problemas Combinados MCM y MCD
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: FRACCIONES
    // ==========================================
    {
        id: 'g5-fracciones',
        label: 'Fracciones',
        level: 11,
        type: 'basic',
        requires: ['g5-mcm-mcd', 'g5-problemas-mcm-mcd'],
        description: 'El mundo de las partes y repartos, fracciones equivalentes y operaciones heterogéneas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-concepto-frac',
        label: 'Significados y Recta Numérica',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Comparación de fracciones heterogéneas y densidad en la recta numérica.',
        xOffset: -60,
        additionalQuizzes: [330, 437], // Quiz 330: Comparación Heterogéneas | Quiz 437: Recta Numérica II
        behavior: 'quiz_list'
    },
    {
        id: 'g5-equiv-frac',
        label: 'Fracciones Equivalentes',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Simplificación y amplificación por el MCD hasta la fracción irreducible.',
        xOffset: 0,
        additionalQuizzes: [331, 332], // Quiz 331: Conceptos Básicos | Quiz 332: Completar y Simplificar
        behavior: 'quiz_list'
    },
    {
        id: 'g5-mixtos-frac',
        label: 'Clases y Números Mixtos',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Fracciones propias, impropias e iguales a la unidad. Conversión a números mixtos.',
        xOffset: 60,
        additionalQuizzes: [337, 339], // Quiz 337: Nivel 1 y 2 | Quiz 339: Nivel 3
        behavior: 'quiz_list'
    },
    {
        id: 'g5-suma-resta-frac',
        label: 'Sumas y Restas Heterogéneas',
        level: 13,
        type: 'critical',
        requires: ['g5-concepto-frac', 'g5-equiv-frac', 'g5-mixtos-frac'],
        description: 'Adición y sustracción de fracciones heterogéneas mediante el método del MCM.',
        xOffset: -45,
        additionalQuizzes: [24, 342, 343], // Quiz 24: Heterogéneas | Quiz 342: Heterogéneas N1 | Quiz 343: Heterogéneas N2
        behavior: 'quiz_list'
    },
    {
        id: 'g5-multi-div-frac',
        label: 'Productos y Divisiones',
        level: 13,
        type: 'basic',
        requires: ['g5-concepto-frac', 'g5-equiv-frac', 'g5-mixtos-frac'],
        description: 'Multiplicación con simplificación previa y división por el inverso multiplicativo.',
        xOffset: 45,
        additionalQuizzes: [44, 344], // Quiz 44: Productos Parte 1 | Quiz 344: Productos y Divisiones Parte 2
        behavior: 'quiz_list'
    },
    {
        id: 'g5-polinomios-frac',
        label: 'Operaciones Combinadas',
        level: 14,
        type: 'basic',
        requires: ['g5-suma-resta-frac', 'g5-multi-div-frac'],
        description: 'Polinomios aritméticos con fracciones, productos, divisiones y paréntesis.',
        xOffset: -45,
        additionalQuizzes: [345, 346], // Quiz 345: Nivel Medio | Quiz 346: Nivel Alto
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-frac',
        label: 'Problemas con Fracciones',
        level: 14,
        type: 'applied',
        requires: ['g5-suma-resta-frac', 'g5-multi-div-frac'],
        description: 'Resolución de problemas contextualizados: fracción de un número y repartos sucesivos.',
        xOffset: 45,
        additionalQuizzes: [7, 347], // Quiz 7: Aplicaciones Parte 1 | Quiz 347: Aplicaciones Parte 2
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: NÚMEROS DECIMALES
    // ==========================================
    {
        id: 'g5-decimales',
        label: 'Números Decimales',
        level: 15,
        type: 'basic',
        requires: ['g5-polinomios-frac', 'g5-problemas-frac'],
        description: 'Valor posicional decimal, relación con fracciones y operaciones con coma.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-concepto-dec',
        label: 'Concepto, Orden y Conversión',
        level: 16,
        type: 'basic',
        requires: ['g5-decimales'],
        description: 'Décimas, centésimas y milésimas. Comparación y conversión entre decimal y fracción.',
        xOffset: -50,
        additionalQuizzes: [348, 358], // Quiz 348: Comparación de Decimales | Quiz 358: Conversión Decimales y Fracciones I
        behavior: 'quiz_list'
    },
    {
        id: 'g5-suma-resta-dec',
        label: 'Suma y Resta de Decimales',
        level: 16,
        type: 'basic',
        requires: ['g5-decimales'],
        description: 'Alineación de la coma decimal y adición/sustracción con relleno de ceros.',
        xOffset: 50,
        additionalQuizzes: [350, 351], // Quiz 350: Suma y Resta Nivel Medio | Quiz 351: Suma y Resta Nivel Alto
        behavior: 'quiz_list'
    },
    {
        id: 'g5-multi-div-dec',
        label: 'Multiplicación y División',
        level: 17,
        type: 'critical',
        requires: ['g5-concepto-dec', 'g5-suma-resta-dec'],
        description: 'Multiplicación con decimales, división con cociente decimal y potencias de 10.',
        xOffset: -45,
        additionalQuizzes: [352, 353, 354], // Quiz 352: Multiplicación | Quiz 353: División | Quiz 354: Mixto
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-dec',
        label: 'Problemas con Decimales',
        level: 17,
        type: 'applied',
        requires: ['g5-concepto-dec', 'g5-suma-resta-dec'],
        description: 'Problemas de compras, presupuestos, medidas métricas y situaciones financieras cotidianas.',
        xOffset: 45,
        additionalQuizzes: [2, 355], // Quiz 2: Problemas con Decimales | Quiz 355: Problemas con Decimales Parte 2
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: GRAN MAESTRÍA DE QUINTO GRADO
    // ==========================================
    {
        id: 'g5-mastery',
        label: 'Gran Maestría de 5° Grado',
        level: 18,
        type: 'evaluation',
        requires: [],
        description: 'El desafío cumbre del Olimpo: corona todo el aprendizaje de 5° integrando conjuntos, números naturales, teoría de números, fracciones y decimales.',
        xOffset: 0,
        additionalQuizzes: [1067], // Quiz 1067: Gran Desafío de Maestría: El Olimpo de 5.° Grado
        behavior: 'quiz_list'
    }
];
