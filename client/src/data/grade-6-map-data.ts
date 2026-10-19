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
        additionalQuizzes: [994, 995, 996], // Quiz 994: Unión e Intersección | Quiz 995: Diferencia y Complemento | Quiz 996: Problemas de Conjuntos con Diagramas de Venn
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
        additionalQuizzes: [1092, 1093, 360], // Quiz 1092: Potenciación Base 10 y Propiedades | Quiz 1093: Radicación y Cuadrados Perfectos | Quiz 360: Propiedades de las Potencias
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
        additionalQuizzes: [1094, 422, 521], // Quiz 1094: Ecuaciones Lineales y Modelado Simbólico en 6.° | Quiz 422: Lenguaje Algebraico | Quiz 521: Descifrando Ecuaciones
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
        additionalQuizzes: [308, 644], // Quiz 308: Problemas N3 | Quiz 644: Dividiendo para Resolver
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
        additionalQuizzes: [1095, 319, 320], // Quiz 1095: Criterios Avanzados (4, 6, 8, 9 y 11) | Quiz 319: Múltiplos y Divisores N2 | Quiz 320: Criterios Fundamentales
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
        additionalQuizzes: [1096, 318], // Quiz 1096: Descomposición Factorial y Teorema Fundamental | Quiz 318: Primos y Compuestos
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
        additionalQuizzes: [322, 700, 325], // Quiz 322: Cálculo de MCM y MCD | Quiz 700: Coincidencias Periódicas | Quiz 325: Problemas de Aplicación Avanzados
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
        additionalQuizzes: [329, 332, 337], // Quiz 329: Interpretación Visual de Fracciones | Quiz 332: Fracciones Equivalentes y Simplificación | Quiz 337: Números Mixtos
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
        additionalQuizzes: [330, 436, 437], // Quiz 330: Comparación de Fracciones Heterogéneas | Quiz 436: Fracciones en la Recta I | Quiz 437: Fracciones en la Recta II
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
        additionalQuizzes: [1097, 1098, 24, 462], // Quiz 1097: División de Fracciones e Inverso Multiplicativo | Quiz 1098: Polinomios con Fracciones | Quiz 24: Heterogéneas | Quiz 462: Operaciones y Simplificación
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
        additionalQuizzes: [7, 347], // Quiz 7: Aplicaciones con Fracciones I | Quiz 347: Aplicaciones con Fracciones II
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
        additionalQuizzes: [358, 349], // Quiz 358: Conversión Fracción a Decimal | Quiz 349: Decimales en la Recta y Comparación
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
        additionalQuizzes: [1099, 351, 353], // Quiz 1099: Multiplicación y División Rigurosa con Decimales | Quiz 351: Suma y Resta con Alineación | Quiz 353: División de Decimales
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
        additionalQuizzes: [1100, 363, 365], // Quiz 1100: Razones, Tasas Unitarias y Comparación Multiplicativa | Quiz 363: Concepto de Razón | Quiz 365: Problemas de Razones
        behavior: 'quiz_list'
    },
    {
        id: 'g6-proporcionalidad-regla-tres',
        label: 'Proporcionalidad, Regla de Tres y Repartos',
        level: 13,
        type: 'applied',
        requires: ['g6-problemas-decimales'],
        description: 'Magnitudes directa e inversamente proporcionales, constante de proporcionalidad, tablas, gráficas, regla de tres simple directa e inversa y repartos proporcionales directos.',
        xOffset: 50,
        additionalQuizzes: [860, 368, 870], // Quiz 860: Proporcionalidad Directa e Inversa (12 imgs) | Quiz 368: Práctica de Regla de Tres Simple | Quiz 870: Repartos Proporcionales
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
        description: 'El conjunto ℤ, números relativos (temperaturas, altitud, saldos), valor absoluto, opuestos, adición intuitiva y educación financiera en 6.° Grado.',
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
        additionalQuizzes: [315, 288], // Quiz 315: Valor Absoluto Nivel 1 | Quiz 288: Opuestos y Recta Numérica en ℤ
        behavior: 'quiz_list'
    },
    {
        id: 'g6-operaciones-enteros-signos',
        label: 'Operaciones en ℤ y Ley de Signos',
        level: 15,
        type: 'critical',
        requires: ['g6-u4-enteros-finanzas'],
        description: 'Suma y resta intuitiva con signos iguales y contrarios, valor absoluto y jerarquía básica de operaciones con enteros.',
        xOffset: 50,
        additionalQuizzes: [1101, 444, 312], // Quiz 1101: Iniciación a los Números Enteros y Sumas Intuitivas | Quiz 444: Suma y Resta Básica en ℤ | Quiz 312: Jerarquía Básica en Enteros
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
        additionalQuizzes: [1], // Quiz 1: Problemas con Números Enteros Parte 1
        behavior: 'quiz_list'
    },
    {
        id: 'g6-educacion-financiera',
        label: 'Educación Financiera: Porcentajes, Ahorro e Interés',
        level: 16,
        type: 'applied',
        requires: ['g6-enteros-relativos-recta', 'g6-operaciones-enteros-signos'],
        description: 'Cálculo de porcentajes, descuentos e incrementos comerciales (IVA), nociones de ahorro familiar y crédito responsable en 6.° Grado.',
        xOffset: 50,
        additionalQuizzes: [374, 376, 392], // Quiz 374: Porcentajes I | Quiz 376: Porcentajes III (Descuentos) | Quiz 392: Nociones de Ahorro e Interés
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
        additionalQuizzes: [1073], // Quiz 1073: Gran Desafío de Maestría: La Cúspide de 6.° Grado (10 preguntas, 5 imágenes, 100% explicaciones)
        behavior: 'quiz_list'
    }
];
