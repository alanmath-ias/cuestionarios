import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade4MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: SANTUARIO DE CONJUNTOS, OPERACIONES Y SISTEMAS (Periodo I)
    // ==========================================
    {
        id: 'g4-u1-conjuntos-operaciones-sistemas',
        label: 'Santuario de Conjuntos y Sistemas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Misterios de conjuntos, adición, sustracción con grandes números, algoritmos multiplicativos y numeración romana.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-teoria-conjuntos',
        label: 'Conjuntos: Determinación y Relaciones',
        level: 1,
        type: 'basic',
        requires: ['g4-u1-conjuntos-operaciones-sistemas'],
        description: 'Determinación por extensión y comprensión. Relaciones de pertenencia (∈, ∉) y contenencia (⊂, ⊄).',
        xOffset: -45,
        additionalQuizzes: [991, 992, 993], // Quiz 991: Pertenencia | Quiz 992: Extensión/Comprensión | Quiz 993: Clases y Cardinalidad
        behavior: 'quiz_list'
    },
    {
        id: 'g4-operaciones-conjuntos',
        label: 'Operaciones entre Conjuntos',
        level: 1,
        type: 'basic',
        requires: ['g4-u1-conjuntos-operaciones-sistemas'],
        description: 'Unión (∪), intersección (∩), diferencia (A - B) y diagramas de Venn.',
        xOffset: 45,
        additionalQuizzes: [994, 995, 996], // Quiz 994: Unión/Intersección | Quiz 995: Diferencia/Complemento | Quiz 996: Problemas Venn
        behavior: 'quiz_list'
    },
    {
        id: 'g4-adicion-sustraccion-propiedades',
        label: 'Adición, Sustracción y Propiedades',
        level: 2,
        type: 'critical',
        requires: ['g4-teoria-conjuntos', 'g4-operaciones-conjuntos'],
        description: 'Operaciones con grandes números naturales y propiedades conmutativa, asociativa y elemento neutro.',
        xOffset: -45,
        additionalQuizzes: [305, 313], // Quiz 305: Suma y Resta Avanzado | Quiz 313: Propiedades de las Operaciones
        behavior: 'quiz_list'
    },
    {
        id: 'g4-mult-div-propiedades',
        label: 'Multiplicación, División y Propiedades',
        level: 2,
        type: 'critical',
        requires: ['g4-teoria-conjuntos', 'g4-operaciones-conjuntos'],
        description: 'Propiedad distributiva, productos de múltiples factores y divisiones entre una y dos cifras.',
        xOffset: 45,
        additionalQuizzes: [446, 448, 644], // Quiz 446: División 1 cifra | Quiz 448: División 2 cifras | Quiz 644: Problemas Cotidianos
        behavior: 'quiz_list'
    },
    {
        id: 'g4-otros-sistemas-numeracion',
        label: 'Otros Sistemas de Numeración (Romanos y Más)',
        level: 3,
        type: 'applied',
        requires: ['g4-adicion-sustraccion-propiedades', 'g4-mult-div-propiedades'],
        description: 'Sistemas de base distinta: numeración romana (reglas, símbolos y vinculum) y noción de sistemas posicionales.',
        xOffset: 0,
        additionalQuizzes: [853, 854], // Quiz 853: Reglas Básicas Romanos | Quiz 854: Grandes Cifras y Vinculum
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: CÁMARA DE FACTORES, PRIMOS Y DIVISIBILIDAD (Periodo II)
    // ==========================================
    {
        id: 'g4-u2-divisibilidad-factores-mcm-mcd',
        label: 'Cámara de Factores, Primos y Divisibilidad',
        level: 4,
        type: 'basic',
        requires: ['g4-otros-sistemas-numeracion'],
        description: 'Enigmas de división formal, números primos, descomposición factorial y secretos de MCM y MCD.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-algoritmos-mult-div',
        label: 'Técnica de División Formal',
        level: 5,
        type: 'critical',
        requires: ['g4-u2-divisibilidad-factores-mcm-mcd'],
        description: 'Divisiones exactas e inexactas de varias cifras con cálculo riguroso del residuo.',
        xOffset: -45,
        additionalQuizzes: [5, 6, 447], // Quiz 5: División 1 cifra | Quiz 6: División 2 cifras | Quiz 447: Intermedio
        behavior: 'quiz_list'
    },
    {
        id: 'g4-multiplos-divisores-criterios',
        label: 'Múltiplos, Divisores y Criterios',
        level: 5,
        type: 'basic',
        requires: ['g4-u2-divisibilidad-factores-mcm-mcd'],
        description: 'Conjunto de múltiplos y divisores. Criterios de divisibilidad rápida por 2, 3, 4, 5, 6, 9 y 10.',
        xOffset: 45,
        additionalQuizzes: [319, 320, 321], // Quiz 319: Múltiplos/Divisores | Quiz 320: Criterios Básicos | Quiz 321: Criterios Avanzados
        behavior: 'quiz_list'
    },
    {
        id: 'g4-primos-factores',
        label: 'Números Primos y Descomposición Factorial',
        level: 6,
        type: 'basic',
        requires: ['g4-algoritmos-mult-div', 'g4-multiplos-divisores-criterios'],
        description: 'Criba de Eratóstenes, números primos y compuestos, descomposición de enteros en factores primos.',
        xOffset: -45,
        additionalQuizzes: [318, 3, 323], // Quiz 318: Primos y Compuestos | Quiz 3: Descomposición Factorial | Quiz 323: Descomposición y Errores
        behavior: 'quiz_list'
    },
    {
        id: 'g4-mcm-mcd-problemas',
        label: 'MCM, MCD y Problemas de Aplicación',
        level: 6,
        type: 'applied',
        requires: ['g4-primos-factores'],
        description: 'Cálculo del MCM y MCD mediante descomposición simultánea. Problemas de coincidencias periódicas y reparto óptimo.',
        xOffset: 45,
        additionalQuizzes: [322, 707, 698, 700], // Quiz 322: Básico | Quiz 707: MCM 1 cifra | Quiz 698: MCM Coincidencias | Quiz 700: MCD Distribución
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TEMPLO SAGRADO DE LAS FRACCIONES (Periodo III)
    // ==========================================
    {
        id: 'g4-u3-reino-fracciones',
        label: 'Templo Sagrado de las Fracciones',
        level: 7,
        type: 'basic',
        requires: ['g4-mcm-mcd-problemas'],
        description: 'Clases de fracciones, comparación en la recta, números mixtos, conversiones y operaciones combinadas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-clases-fracciones-equivalentes',
        label: 'Clases de Fracciones y Equivalencia',
        level: 8,
        type: 'basic',
        requires: ['g4-u3-reino-fracciones'],
        description: 'Fracciones propias, impropias, homogéneas, heterogéneas. Fracciones equivalentes por amplificación y simplificación.',
        xOffset: -45,
        additionalQuizzes: [329, 331, 332], // Quiz 329: Interpretación visual | Quiz 331: Equivalentes básico | Quiz 332: Simplificar
        behavior: 'quiz_list'
    },
    {
        id: 'g4-comparacion-recta-fracciones',
        label: 'Comparación y Recta Numérica',
        level: 8,
        type: 'basic',
        requires: ['g4-u3-reino-fracciones'],
        description: 'Ubicación precisa en la recta numérica y comparación de fracciones heterogéneas con productos cruzados.',
        xOffset: 45,
        additionalQuizzes: [330, 436, 437], // Quiz 330: Comparación heterogéneas | Quiz 436: Recta I | Quiz 437: Recta II
        behavior: 'quiz_list'
    },
    {
        id: 'g4-conversiones-mixtos',
        label: 'Conversiones y Números Mixtos',
        level: 9,
        type: 'basic',
        requires: ['g4-clases-fracciones-equivalentes', 'g4-comparacion-recta-fracciones'],
        description: 'Transformación de fracciones impropias a números mixtos y viceversa con representaciones gráficas.',
        xOffset: -45,
        additionalQuizzes: [337, 339], // Quiz 337: Mixtos Nivel 1 y 2 | Quiz 339: Mixtos Nivel 3
        behavior: 'quiz_list'
    },
    {
        id: 'g4-operaciones-fracciones',
        label: 'Operaciones: Suma, Resta, Multiplicación y División',
        level: 9,
        type: 'critical',
        requires: ['g4-conversiones-mixtos'],
        description: 'Suma y resta de fracciones homogéneas y heterogéneas (mcm), producto en línea y división por recíproco o en cruz.',
        xOffset: 45,
        additionalQuizzes: [340, 341, 342, 44, 344], // Sumas/restas homogéneas (340, 341), heterogéneas (342), productos (44, 344)
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: BÓVEDA DE DECIMALES Y LOS TIEMPOS (Periodo IV)
    // ==========================================
    {
        id: 'g4-u4-decimales-tiempo',
        label: 'Bóveda de Decimales y los Tiempos',
        level: 10,
        type: 'basic',
        requires: ['g4-operaciones-fracciones'],
        description: 'Fracciones decimales, valor posicional con coma, operaciones aritméticas de decimales y medición del tiempo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-fracciones-decimales',
        label: 'Fracciones Decimales y Valor Posicional',
        level: 11,
        type: 'basic',
        requires: ['g4-u4-decimales-tiempo'],
        description: 'Décimas, centésimas y milésimas. Lectura, escritura, comparación y conversión entre fracción decimal y número con coma.',
        xOffset: -45,
        additionalQuizzes: [358, 348], // Quiz 358: Conversión Decimal-Fracción | Quiz 348: Comparación de Decimales
        behavior: 'quiz_list'
    },
    {
        id: 'g4-operaciones-decimales',
        label: 'Operaciones con Decimales',
        level: 11,
        type: 'critical',
        requires: ['g4-fracciones-decimales'],
        description: 'Suma y resta alineando la coma, multiplicación con decimales, divisiones y resolución de problemas cotidianos de compras.',
        xOffset: 45,
        additionalQuizzes: [350, 351, 352, 353, 2], // Quiz 350, 351: Suma/Resta | Quiz 352: Producto | Quiz 353: División | Quiz 2: Problemas
        behavior: 'quiz_list'
    },
    {
        id: 'g4-unidades-tiempo',
        label: 'Medición con la Unidad de Tiempo',
        level: 12,
        type: 'applied',
        requires: ['g4-operaciones-decimales'],
        description: 'Equivalencias entre días, horas, minutos y segundos. Cálculo de duraciones, horarios y problemas de la vida real.',
        xOffset: 0,
        additionalQuizzes: [383], // Quiz 383: Unidades de Tiempo: Conversiones y Horarios
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: GRAN CETRO DE MAESTRÍA DE 4°
    // ==========================================
    {
        id: 'g4-mastery',
        label: 'Gran Cetro de Maestría de 4°',
        level: 13,
        type: 'evaluation',
        requires: [],
        description: 'El desafío cumbre del Templo: integra la teoría de números, fracciones, decimales y resolución de grandes problemas matemáticos.',
        xOffset: 0,
        additionalQuizzes: [308, 921], // Quiz 308: Problemas Avanzados Nivel 3 | Quiz 921: Desafío Matemático Aplicado
        behavior: 'quiz_list'
    }
];
