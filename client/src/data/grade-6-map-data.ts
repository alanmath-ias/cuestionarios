import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade6MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: NÚCLEO I - LÓGICA, CONJUNTOS Y ALGORITMOS NATURALES (Periodo I)
    // ==========================================
    {
        id: 'g6-u1-logica-naturales',
        label: 'Núcleo I: Lógica, Conjuntos y Algoritmos Naturales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de lógica proposicional, conjuntos, numeración romana, operaciones con naturales, polinomios aritméticos y ecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-logica-proposiciones',
        label: 'Proposiciones Lógicas y Conectores',
        level: 1,
        type: 'basic',
        requires: ['g6-u1-logica-naturales'],
        description: 'Proposiciones simples y compuestas, valores de verdad (V/F), negación (¬), conjunción (∧) y disyunción (∨).',
        xOffset: -45,
        additionalQuizzes: [70, 71, 72, 73], // Quizzes de Lógica Matemática
        behavior: 'quiz_list'
    },
    {
        id: 'g6-conjuntos-operaciones',
        label: 'Conjuntos y Operaciones (Venn)',
        level: 1,
        type: 'basic',
        requires: ['g6-u1-logica-naturales'],
        description: 'Determinación por extensión y comprensión, pertenencia, contenencia, unión (∪), intersección (∩), diferencia y diagramas de Venn.',
        xOffset: 45,
        additionalQuizzes: [991, 992, 993, 994, 995, 996], // Quizzes de Conjuntos de la madre aritmética (Determinación, Clases, Operaciones y Venn)
        behavior: 'quiz_list'
    },
    {
        id: 'g6-sistemas-numeracion',
        label: 'Otros Sistemas de Numeración (Romanos y Bases)',
        level: 2,
        type: 'basic',
        requires: ['g6-logica-proposiciones', 'g6-conjuntos-operaciones'],
        description: 'Sistemas posicionales y no posicionales: numeración romana (reglas, sustracción, vinculum) e introducción al sistema binario.',
        xOffset: -45,
        additionalQuizzes: [853, 854], // Quiz 853: Reglas Básicas Romanos | Quiz 854: Grandes Cifras y Vinculum
        behavior: 'quiz_list'
    },
    {
        id: 'g6-naturales-orden-operaciones',
        label: 'Números Naturales: Orden y Propiedades',
        level: 2,
        type: 'basic',
        requires: ['g6-logica-proposiciones', 'g6-conjuntos-operaciones'],
        description: 'Relaciones de orden (<, >, =), aproximación y redondeo a la decena/centena/millar, y propiedades aditivas y multiplicativas.',
        xOffset: 45,
        additionalQuizzes: [304, 313], // Quiz 304: Suma y Resta Básicos | Quiz 313: Propiedades de las Operaciones
        behavior: 'quiz_list'
    },
    {
        id: 'g6-polinomios-aritmeticos',
        label: 'Polinomios Aritméticos y Jerarquía',
        level: 3,
        type: 'critical',
        requires: ['g6-sistemas-numeracion', 'g6-naturales-orden-operaciones'],
        description: 'Operaciones combinadas con jerarquía estricta (PEMDAS) y destrucción progresiva de paréntesis, corchetes y llaves.',
        xOffset: -45,
        additionalQuizzes: [433, 434, 14, 440, 15, 314], // Jerarquía I, II, Paréntesis en Matemáticas I y II, Jerarquía Combinada
        behavior: 'quiz_list'
    },
    {
        id: 'g6-ecuaciones-basicas',
        label: 'Ecuaciones y Despejes Básicos',
        level: 3,
        type: 'critical',
        requires: ['g6-sistemas-numeracion', 'g6-naturales-orden-operaciones'],
        description: 'Concepto de igualdad, balanza numérica, traducción del lenguaje natural al algebraico y despeje de incógnitas lineales.',
        xOffset: 45,
        additionalQuizzes: [50, 51, 67, 521], // Quiz 50: Ec. Lineales 1 variable | Quiz 51: Con paréntesis | Quiz 67: Despeje de variables | Quiz 521: Lenguaje de ecuaciones
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-naturales',
        label: 'Situaciones Problémicas con Naturales',
        level: 4,
        type: 'applied',
        requires: ['g6-polinomios-aritmeticos', 'g6-ecuaciones-basicas'],
        description: 'Modelado y resolución de problemas cotidianos de compras, distancias, combinatoria y reparto con números naturales.',
        xOffset: 0,
        additionalQuizzes: [306, 307, 308, 644, 53], // Problemas con Naturales Nivel 1, 2, 3, División cotidiana y Problemas con Ecuaciones
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: NÚCLEO II - TEORÍA DE NÚMEROS Y FRACCIONES (Periodo II)
    // ==========================================
    {
        id: 'g6-u2-divisibilidad-fracciones',
        label: 'Núcleo II: Factores Primos y el Universo Fraccionario',
        level: 5,
        type: 'basic',
        requires: ['g6-problemas-naturales'],
        description: 'Múltiplos, divisores, criterios rápidos, factorización prima, MCM, MCD, significado profundo de la fracción y operaciones completas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-multiplos-divisores-criterios',
        label: 'Múltiplos, Divisores y Criterios',
        level: 6,
        type: 'basic',
        requires: ['g6-u2-divisibilidad-fracciones'],
        description: 'Conjuntos de múltiplos y divisores, números perfectos y criterios de divisibilidad del 2, 3, 4, 5, 6, 9 y 10.',
        xOffset: -45,
        additionalQuizzes: [319], // Quiz 319: Múltiplos y Divisores Nivel 2
        behavior: 'quiz_list'
    },
    {
        id: 'g6-primos-descomposicion',
        label: 'Primos, Compuestos y Descomposición',
        level: 6,
        type: 'basic',
        requires: ['g6-u2-divisibilidad-fracciones'],
        description: 'Criba de Eratóstenes, teorema fundamental de la aritmética y descomposición en árbol de factores primos.',
        xOffset: 45,
        additionalQuizzes: [318, 3], // Quiz 318: Primos y Compuestos | Quiz 3: Descomposición Factorial
        behavior: 'quiz_list'
    },
    {
        id: 'g6-mcm-mcd-problemas',
        label: 'MCM, MCD y Problemas de Aplicación',
        level: 7,
        type: 'applied',
        requires: ['g6-multiplos-divisores-criterios', 'g6-primos-descomposicion'],
        description: 'Cálculo simultáneo de MCM y MCD. Resolución de problemas de coincidencias periódicas (MCM) y distribución máxima (MCD).',
        xOffset: 0,
        additionalQuizzes: [322, 694, 698, 700, 699, 701, 325], // MCM/MCD básico, 2 cifras, coincidencias, distribuciones y problemas de aplicación
        behavior: 'quiz_list'
    },
    {
        id: 'g6-significado-clases-fracciones',
        label: 'Significado y Clases de Fracciones',
        level: 8,
        type: 'basic',
        requires: ['g6-mcm-mcd-problemas'],
        description: 'La fracción como parte-todo, operador y cociente. Fracciones propias, impropias, aparentes, mixtas y equivalencias por amplificación y simplificación.',
        xOffset: -45,
        additionalQuizzes: [329, 331, 332, 337, 339], // Interpretación visual, Equivalentes básico/simplificar, Mixtos Nivel 1, 2 y 3
        behavior: 'quiz_list'
    },
    {
        id: 'g6-fracciones-recta-orden',
        label: 'Relaciones de Orden y Recta Numérica',
        level: 8,
        type: 'basic',
        requires: ['g6-mcm-mcd-problemas'],
        description: 'Ubicación exacta de fracciones en la recta graduada, densidad de racionales y comparación de fracciones con distinto denominador.',
        xOffset: 45,
        additionalQuizzes: [330, 436, 437], // Comparación heterogéneas, Fracciones en la Recta I y II
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-fracciones',
        label: 'Operaciones con Fracciones (+, -, ×, ÷)',
        level: 9,
        type: 'critical',
        requires: ['g6-significado-clases-fracciones', 'g6-fracciones-recta-orden'],
        description: 'Suma y resta con MCM, producto de numeradores y denominadores, división en cruz o por fracción inversa, y simplificación de resultados.',
        xOffset: -45,
        additionalQuizzes: [340, 341, 24, 462, 44, 344], // Homogéneas 1 y 2, Heterogéneas 1 y 2, Productos 1 y 2
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-fracciones',
        label: 'Situaciones Problémicas con Fracciones',
        level: 9,
        type: 'applied',
        requires: ['g6-significado-clases-fracciones', 'g6-fracciones-recta-orden'],
        description: 'Problemas de fracciones de una cantidad, repartos proporcionales, mezclas y operaciones combinadas complejas.',
        xOffset: 45,
        additionalQuizzes: [345, 346], // Operaciones combinadas Nivel Medio y Alto con fracciones
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: NÚCLEO III - DECIMALES Y PRECISIÓN NUMÉRICA (Periodo III)
    // ==========================================
    {
        id: 'g6-u3-decimales-precision',
        label: 'Núcleo III: Sistema Decimal y Operaciones de Alta Precisión',
        level: 10,
        type: 'basic',
        requires: ['g6-operaciones-fracciones', 'g6-problemas-fracciones'],
        description: 'Interconversión fracción-decimal, recta numérica decimal, comparación de milésimas y operaciones con división de cociente decimal.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-fracciones-decimales-recta',
        label: 'Fracciones y Decimales en la Recta',
        level: 11,
        type: 'basic',
        requires: ['g6-u3-decimales-precision'],
        description: 'Conversión de fracciones a números decimales (exactos y periódicos) y viceversa. Ubicación de décimas y centésimas en la recta.',
        xOffset: -45,
        additionalQuizzes: [358, 359, 348, 349], // Conversión I y II, Comparación de Decimales Medio y Alto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-decimales',
        label: 'Operaciones con Decimales (+, -, ×, ÷)',
        level: 11,
        type: 'critical',
        requires: ['g6-u3-decimales-precision'],
        description: 'Suma y resta con alineación de la coma, multiplicación de factores decimales, división con divisor decimal y redondeo de resultados.',
        xOffset: 45,
        additionalQuizzes: [350, 351, 352, 353, 354], // Suma/Resta medio y alto, Multiplicación, División, Mixto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-decimales',
        label: 'Situaciones Problémicas con Decimales',
        level: 12,
        type: 'applied',
        requires: ['g6-fracciones-decimales-recta', 'g6-operaciones-decimales'],
        description: 'Problemas contextualizados de compras, facturas, conversiones monetarias, presupuestos familiares y medidas de alta precisión.',
        xOffset: 0,
        additionalQuizzes: [2, 355], // Problemas con Decimales Parte 1 y Parte 2
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: NÚCLEO IV - NÚMEROS ENTEROS Y FINANZAS (Periodo IV)
    // ==========================================
    {
        id: 'g6-u4-enteros-finanzas',
        label: 'Núcleo IV: La Dimensión Entera y Finanzas Cuánticas',
        level: 13,
        type: 'basic',
        requires: ['g6-problemas-decimales'],
        description: 'El conjunto ℤ, números relativos (temperaturas, altitud, saldos), valor absoluto, operaciones con signos, problemas y educación financiera.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-enteros-relativos-recta',
        label: 'Números Relativos, Conjunto ℤ y Valor Absoluto',
        level: 14,
        type: 'basic',
        requires: ['g6-u4-enteros-finanzas'],
        description: 'Concepto de número signado, posición en la recta numérica extendida a la izquierda, opuesto de un número y distancia al origen (|x|).',
        xOffset: -45,
        additionalQuizzes: [315, 288, 316, 317], // Valor Absoluto Nivel 1, Opuestos, Nivel 2 y Nivel 3 Experto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-enteros-signos',
        label: 'Operaciones en ℤ y Ley de Signos',
        level: 14,
        type: 'critical',
        requires: ['g6-u4-enteros-finanzas'],
        description: 'Suma y resta con signos iguales y contrarios, regla de signos para multiplicación y división, y polinomios combinados con paréntesis en ℤ.',
        xOffset: 45,
        additionalQuizzes: [444, 442, 443, 312, 17, 441], // Sumas y Restas Básico, Medio, Alto, Jerarquía Básica, Operaciones Combinadas Enteros
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-enteros',
        label: 'Situaciones Problémicas con Números Enteros',
        level: 15,
        type: 'applied',
        requires: ['g6-enteros-relativos-recta', 'g6-operaciones-enteros-signos'],
        description: 'Aplicación de números enteros en balances comerciales, fluctuaciones de temperatura, trayectorias submarinas y ascensores.',
        xOffset: -45,
        additionalQuizzes: [1, 435], // Problemas con enteros I y II
        behavior: 'quiz_list'
    },
    {
        id: 'g6-educacion-financiera',
        label: 'Educación Financiera: Ahorro, Débito y Crédito',
        level: 15,
        type: 'applied',
        requires: ['g6-enteros-relativos-recta', 'g6-operaciones-enteros-signos'],
        description: 'Presupuesto personal, consumo consciente vs consumismo, ahorro, cálculo de porcentajes aplicados a descuentos e introducción al crédito.',
        xOffset: 45,
        additionalQuizzes: [374, 375, 376, 392, 518, 393], // Porcentajes I, II, III, Interés Simple e Interés Compuesto
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: GRAN ORBE DE MAESTRÍA DE 6°
    // ==========================================
    {
        id: 'g6-mastery',
        label: 'Gran Orbe de Maestría de 6° Grado',
        level: 16,
        type: 'evaluation',
        requires: [],
        description: 'El desafío cumbre de la Ciudadela Ciber-Matemática: integra lógica, ecuaciones, teoría de números, fracciones, decimales, números enteros y finanzas de sexto grado.',
        xOffset: 0,
        additionalQuizzes: [921, 279], // Quiz 921: Desafío Matemático Aplicado | Quiz 279: Diagnóstico de Álgebra y Fundamentos
        behavior: 'quiz_list'
    }
];
