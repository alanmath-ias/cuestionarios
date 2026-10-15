import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade6MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: NÚCLEO I - LÓGICA, CONJUNTOS Y ALGORITMOS NATURALES (Periodo I)
    // ==========================================
    {
        id: 'g6-u1-logica-naturales',
        label: 'Núcleo I: Lógica, Conjuntos y Algoritmos en Números Naturales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de lógica proposicional, teoría de conjuntos, sistemas de numeración, algoritmos en ℕ, potencias, raíces, polinomios aritméticos y ecuaciones lineales básicas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-logica-proposiciones',
        label: 'Proposiciones Lógicas, Conectores y Verdad',
        level: 1,
        type: 'basic',
        requires: ['g6-u1-logica-naturales'],
        description: 'Proposiciones simples y compuestas, valores de verdad (V/F), negación (¬), conjunción (∧), disyunción (∨), tablas de verdad y razonamiento lógico formal.',
        xOffset: -50,
        additionalQuizzes: [1071, 72], // Quiz 1071: Proposiciones Lógicas, Conectores y Tablas de Verdad | Quiz 72: Razonamiento Lógico y Acertijos Formales
        behavior: 'quiz_list'
    },
    {
        id: 'g6-conjuntos-operaciones',
        label: 'Conjuntos y Operaciones (Venn)',
        level: 1,
        type: 'basic',
        requires: ['g6-u1-logica-naturales'],
        description: 'Determinación por extensión y comprensión, pertenencia, contenencia, unión (∪), intersección (∩), diferencia, complemento y diagramas de Venn.',
        xOffset: 50,
        additionalQuizzes: [991, 992, 993, 994, 995, 996], // Serie canónica de Conjuntos (Pertenencia, Comprensión, Clases, Unión, Diferencia y Problemas Venn)
        behavior: 'quiz_list'
    },
    {
        id: 'g6-sistemas-numeracion',
        label: 'Sistemas de Numeración (Romanos y Binario)',
        level: 2,
        type: 'basic',
        requires: ['g6-logica-proposiciones', 'g6-conjuntos-operaciones'],
        description: 'Sistemas no posicionales (numeración romana, reglas aditivas/sustractivas y vinculum) y posicionales (sistema binario en base 2 y conversión decimal).',
        xOffset: -50,
        additionalQuizzes: [853, 854, 1072], // Quiz 853: Fundamentos Romanos | Quiz 854: Grandes Cifras y Vinculum | Quiz 1072: Sistema Binario y Conversión de Bases
        behavior: 'quiz_list'
    },
    {
        id: 'g6-naturales-orden-operaciones',
        label: 'Números Naturales: Estructura y Propiedades',
        level: 2,
        type: 'basic',
        requires: ['g6-logica-proposiciones', 'g6-conjuntos-operaciones'],
        description: 'Estructura posicional hasta millones, valor relativo, relaciones de orden (<, >, =), aproximación a millares y propiedades de las cuatro operaciones.',
        xOffset: 50,
        additionalQuizzes: [419, 420, 313], // Quiz 419: Valor Posicional | Quiz 420: Descomposición Posicional y Comparación | Quiz 313: Propiedades de las Operaciones
        behavior: 'quiz_list'
    },
    {
        id: 'g6-potencias-raices-naturales',
        label: 'Potenciación y Radicación en Naturales',
        level: 3,
        type: 'critical',
        requires: ['g6-sistemas-numeracion', 'g6-naturales-orden-operaciones'],
        description: 'Base y exponente, potencias de base 10, propiedades fundamentales en ℕ (producto y cociente de igual base, potencia de potencia) y raíces cuadradas exactas.',
        xOffset: -60,
        additionalQuizzes: [16, 360, 328, 9], // Quiz 16: Potencias Básicas | Quiz 360: Propiedades de las Potencias | Quiz 328: Descomposición y Simplificación | Quiz 9: Raíces Cuadradas
        behavior: 'quiz_list'
    },
    {
        id: 'g6-polinomios-aritmeticos',
        label: 'Polinomios Aritméticos y Jerarquía en ℕ',
        level: 3,
        type: 'critical',
        requires: ['g6-sistemas-numeracion', 'g6-naturales-orden-operaciones'],
        description: 'Operaciones combinadas con jerarquía estricta (PEMDAS) y destrucción progresiva de paréntesis, corchetes y llaves exclusivamente en el conjunto de los números naturales.',
        xOffset: 60,
        additionalQuizzes: [433, 434], // Quiz 433: Jerarquía I | Quiz 434: Jerarquía II (Signos de agrupación en ℕ)
        behavior: 'quiz_list'
    },
    {
        id: 'g6-ecuaciones-basicas',
        label: 'Ecuaciones y Lenguaje Algebraico',
        level: 4,
        type: 'critical',
        requires: ['g6-potencias-raices-naturales', 'g6-polinomios-aritmeticos'],
        description: 'Concepto de balanza numérica en equilibrio, término desconocido, traducción del lenguaje natural al algebraico y despeje de incógnitas lineales elementales.',
        xOffset: -45,
        additionalQuizzes: [422, 1065, 1066, 521], // Quiz 422: Lenguaje Algebraico | Quiz 1065: Balanzas en Equilibrio | Quiz 1066: Ecuaciones Multiplicativas | Quiz 521: Descifrando Ecuaciones
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-naturales',
        label: 'Situaciones Problémicas con Naturales',
        level: 4,
        type: 'applied',
        requires: ['g6-potencias-raices-naturales', 'g6-polinomios-aritmeticos'],
        description: 'Modelado y resolución de problemas cotidianos de compras, distancias, combinatoria, reparto equitativo y ecuaciones verbales con números naturales.',
        xOffset: 45,
        additionalQuizzes: [307, 308, 644, 53], // Quiz 307: Problemas N2 | Quiz 308: Problemas N3 | Quiz 644: Dividiendo para Resolver | Quiz 53: Problemas con Ecuaciones Lineales
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
        requires: ['g6-ecuaciones-basicas', 'g6-problemas-naturales'],
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
        description: 'Conjuntos de múltiplos y divisores, números perfectos y criterios de divisibilidad fundamentales del 2, 3, 4, 5, 6, 8, 9, 10 y 11.',
        xOffset: -50,
        additionalQuizzes: [319, 1058, 320, 321], // Quiz 319: Múltiplos y Divisores N2 | Quiz 1058: Criterios Fundamentales 2-10 | Quiz 320: Criterios Básicos | Quiz 321: Criterios Avanzados
        behavior: 'quiz_list'
    },
    {
        id: 'g6-primos-descomposicion',
        label: 'Primos, Compuestos y Descomposición',
        level: 6,
        type: 'basic',
        requires: ['g6-u2-divisibilidad-fracciones'],
        description: 'Criba de Eratóstenes, teorema fundamental de la aritmética y descomposición factorial en árbol y divisiones sucesivas.',
        xOffset: 50,
        additionalQuizzes: [318, 3], // Quiz 318: Primos y Compuestos | Quiz 3: Descomposición Factorial
        behavior: 'quiz_list'
    },
    {
        id: 'g6-mcm-mcd-problemas',
        label: 'MCM, MCD y Problemas de Aplicación',
        level: 7,
        type: 'applied',
        requires: ['g6-multiplos-divisores-criterios', 'g6-primos-descomposicion'],
        description: 'Cálculo simultáneo de MCM y MCD. Resolución de problemas contextualizados de coincidencias periódicas (MCM) y distribución o corte máximo (MCD).',
        xOffset: 0,
        additionalQuizzes: [322, 694, 698, 700, 699, 701, 325], // MCM/MCD básico, 2 cifras, coincidencias periódicas, distribuciones y problemas de aplicación
        behavior: 'quiz_list'
    },
    {
        id: 'g6-significado-clases-fracciones',
        label: 'Significado y Clases de Fracciones',
        level: 8,
        type: 'basic',
        requires: ['g6-mcm-mcd-problemas'],
        description: 'La fracción como parte-todo, operador y cociente. Fracciones propias, impropias, aparentes, números mixtos y equivalencia por amplificación y simplificación.',
        xOffset: -50,
        additionalQuizzes: [329, 331, 332, 337, 339], // Interpretación visual, Equivalentes básico/simplificar, Mixtos Nivel 1, 2 y 3
        behavior: 'quiz_list'
    },
    {
        id: 'g6-fracciones-recta-orden',
        label: 'Relaciones de Orden y Recta Numérica',
        level: 8,
        type: 'basic',
        requires: ['g6-mcm-mcd-problemas'],
        description: 'Ubicación exacta de fracciones en la recta graduada, densidad de racionales y comparación de fracciones con distinto denominador (homogenización).',
        xOffset: 50,
        additionalQuizzes: [330, 436, 437], // Comparación heterogéneas, Fracciones en la Recta I y II
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-fracciones',
        label: 'Operaciones con Fracciones (+, -, ×, ÷)',
        level: 9,
        type: 'critical',
        requires: ['g6-significado-clases-fracciones', 'g6-fracciones-recta-orden'],
        description: 'Suma y resta homogénea y heterogénea con MCM, multiplicación de factores, división por fracción inversa o producto cruzado, y simplificación a irreductible.',
        xOffset: -50,
        additionalQuizzes: [340, 341, 24, 462, 44, 344, 1060], // Homogéneas 1 y 2, Heterogéneas 1 y 2, Productos 1 y 2, y Quiz 1060: División de Fracciones y Reparto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-fracciones',
        label: 'Situaciones Problémicas con Fracciones',
        level: 9,
        type: 'applied',
        requires: ['g6-significado-clases-fracciones', 'g6-fracciones-recta-orden'],
        description: 'Problemas de aplicación de fracciones de una cantidad, mezclas, repartos proporcionales fraccionarios y operaciones combinadas con signos de agrupación.',
        xOffset: 50,
        additionalQuizzes: [7, 347, 345, 346], // Quiz 7: Aplicaciones Fracciones 1 | Quiz 347: Aplicaciones Fracciones 2 | Quiz 345: Operaciones Combinadas Medio | Quiz 346: Combinadas Alto
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: NÚCLEO III - DECIMALES Y PROPORCIONALIDAD (Periodo III)
    // ==========================================
    {
        id: 'g6-u3-decimales-proporcionalidad',
        label: 'Núcleo III: Números Decimales y el Universo de la Proporción',
        level: 10,
        type: 'basic',
        requires: ['g6-operaciones-fracciones', 'g6-problemas-fracciones'],
        description: 'Interconversión fracción-decimal, recta numérica decimal, operaciones de precisión, razones, proporciones, proporcionalidad directa/inversa y regla de tres.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-fracciones-decimales-recta',
        label: 'Fracciones y Decimales en la Recta',
        level: 11,
        type: 'basic',
        requires: ['g6-u3-decimales-proporcionalidad'],
        description: 'Conversión de fracciones a números decimales (exactos y periódicos) y viceversa (fracción generatriz). Ubicación de décimas, centésimas y milésimas en la recta.',
        xOffset: -50,
        additionalQuizzes: [358, 359, 348, 349], // Conversión I y II, Comparación de Decimales Medio y Alto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-decimales',
        label: 'Operaciones con Decimales (+, -, ×, ÷)',
        level: 11,
        type: 'critical',
        requires: ['g6-u3-decimales-proporcionalidad'],
        description: 'Suma y resta con alineación de la coma, multiplicación de factores decimales, división con divisor decimal y redondeo de resultados.',
        xOffset: 50,
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
        additionalQuizzes: [2, 355], // Quiz 2: Problemas Decimales Parte 1 | Quiz 355: Problemas Decimales Parte 2
        behavior: 'quiz_list'
    },
    {
        id: 'g6-razones-proporciones',
        label: 'Razones y Propiedades de las Proporciones',
        level: 13,
        type: 'basic',
        requires: ['g6-problemas-decimales'],
        description: 'Concepto de razón geométrica (a/b), antecedente, consecuente, proporción numérica y propiedad fundamental de las proporciones (producto de extremos = producto de medios).',
        xOffset: -50,
        additionalQuizzes: [363, 364, 499, 365, 366], // Quiz 363: Razones Ejercicios | Quiz 364: Propiedades I | Quiz 499: Propiedades II | Quiz 365: Problemas Razones | Quiz 366: Problemas Avanzados
        behavior: 'quiz_list'
    },
    {
        id: 'g6-proporcionalidad-regla-tres',
        label: 'Proporcionalidad, Regla de Tres y Repartos',
        level: 13,
        type: 'applied',
        requires: ['g6-problemas-decimales'],
        description: 'Magnitudes directa e inversamente proporcionales, constante de proporcionalidad, tablas, gráficas, regla de tres simple directa e inversa, regla de tres compuesta y repartos proporcionales.',
        xOffset: 50,
        additionalQuizzes: [860, 367, 368, 370, 870, 871], // Quiz 860: Proporcionalidad Directa e Inversa | Quiz 367: Regla de Tres Conceptos | Quiz 368: Práctica Regla de Tres | Quiz 370: Compuesta Básico | Quiz 870: Repartos Directos e Inversos | Quiz 871: Repartos Compuestos
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: NÚCLEO IV - NÚMEROS ENTEROS (ℤ) Y FINANZAS (Periodo IV)
    // ==========================================
    {
        id: 'g6-u4-enteros-finanzas',
        label: 'Núcleo IV: La Dimensión Entera (ℤ) y Educación Financiera',
        level: 14,
        type: 'basic',
        requires: ['g6-razones-proporciones', 'g6-proporcionalidad-regla-tres'],
        description: 'El conjunto ℤ, números relativos (temperaturas, altitud, saldos), valor absoluto, ley de signos, operaciones combinadas, problemas y educación financiera.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-enteros-relativos-recta',
        label: 'Números Relativos, Conjunto ℤ y Valor Absoluto',
        level: 15,
        type: 'basic',
        requires: ['g6-u4-enteros-finanzas'],
        description: 'Concepto de número signado (deudas, temperaturas, altitudes), posición en la recta numérica extendida, opuesto de un número y distancia al origen (|x|).',
        xOffset: -50,
        additionalQuizzes: [315, 288, 316, 317], // Valor Absoluto Nivel 1, Opuestos, Nivel 2 y Nivel 3 Experto
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-enteros-signos',
        label: 'Operaciones en ℤ y Ley de Signos',
        level: 15,
        type: 'critical',
        requires: ['g6-u4-enteros-finanzas'],
        description: 'Suma y resta con signos iguales y contrarios, regla de signos para multiplicación y división, y polinomios combinados con paréntesis en ℤ.',
        xOffset: 50,
        additionalQuizzes: [444, 442, 443, 312, 17, 441, 14, 440, 15], // Sumas/Restas Básico, Medio, Alto, Jerarquía Básica, Operaciones Combinadas Enteros, Paréntesis I y II
        behavior: 'quiz_list'
    },
    {
        id: 'g6-problemas-enteros',
        label: 'Situaciones Problémicas con Números Enteros',
        level: 16,
        type: 'applied',
        requires: ['g6-enteros-relativos-recta', 'g6-operaciones-enteros-signos'],
        description: 'Aplicación de números enteros en balances comerciales, fluctuaciones térmicas, trayectorias submarinas y ascensores.',
        xOffset: -50,
        additionalQuizzes: [1, 435], // Quiz 1: Problemas con Enteros Parte 1 | Quiz 435: Problemas con Enteros Parte 2
        behavior: 'quiz_list'
    },
    {
        id: 'g6-educacion-financiera',
        label: 'Educación Financiera: Porcentajes, Ahorro e Interés',
        level: 16,
        type: 'applied',
        requires: ['g6-enteros-relativos-recta', 'g6-operaciones-enteros-signos'],
        description: 'Cálculo de porcentajes, descuentos e incrementos comerciales (IVA), nociones de interés simple, presupuesto familiar, consumo responsable, ahorro y crédito.',
        xOffset: 50,
        additionalQuizzes: [374, 375, 376, 392, 518, 393], // Porcentajes I, II, III, Interés Simple e Interés Compuesto
        behavior: 'quiz_list'
    },

    // ==========================================
    // EVALUACIÓN CUMBRE: GRAN ORBE DE MAESTRÍA DE 6° GRADO
    // ==========================================
    {
        id: 'g6-mastery',
        label: 'Gran Orbe de Maestría de 6.° Grado',
        level: 17,
        type: 'evaluation',
        requires: [],
        description: 'El desafío cumbre de la Ciudadela Ciber-Matemática: integra lógica proposicional, conjuntos, numeración romana y binaria, algoritmos y jerarquía en ℕ, teoría de números (MCM/MCD), fracciones, decimales, proporcionalidad, regla de tres, números enteros (ℤ) y finanzas de sexto grado.',
        xOffset: 0,
        additionalQuizzes: [921, 1073], // Quiz 921: Desafío Matemático Aplicado | Quiz 1073: Gran Desafío de Maestría: La Cúspide de 6.° Grado
        behavior: 'quiz_list'
    }
];
