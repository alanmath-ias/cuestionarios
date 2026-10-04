import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade7MapNodes: ArithmeticNode[] = [
    // ==========================================
    // BASTIÓN I: NÚMEROS ENTEROS (ℤ), OPERACIONES Y ECUACIONES (Periodo I)
    // ==========================================
    {
        id: 'g7-u1',
        label: 'BASTIÓN I • Números Enteros (ℤ), Operatoria y Ecuaciones',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Estructura de los enteros, valor absoluto, polinomios aritméticos y ecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-enteros-relativos-orden',
        label: 'Números Relativos, Recta y Valor Absoluto',
        level: 1,
        type: 'basic',
        requires: ['g7-u1'],
        description: 'Números signados, orden en ℤ y valor absoluto.',
        xOffset: -60,
        additionalQuizzes: [315, 288, 316, 317],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-adicion-sustraccion',
        label: 'Adición, Sustracción y Problemas en ℤ',
        level: 1,
        type: 'basic',
        requires: ['g7-u1'],
        description: 'Suma, resta y situaciones aditivas con enteros.',
        xOffset: 60,
        additionalQuizzes: [442, 443, 1, 435],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-multiplicacion-division',
        label: 'Multiplicación, División y Ley de Signos',
        level: 2,
        type: 'basic',
        requires: ['g7-enteros-relativos-orden', 'g7-enteros-adicion-sustraccion'],
        description: 'Operaciones multiplicativas y ley de signos en ℤ.',
        xOffset: -50,
        additionalQuizzes: [444, 312],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-potencias-raices',
        label: 'Potenciación y Radicación en ℤ',
        level: 2,
        type: 'critical',
        requires: ['g7-enteros-adicion-sustraccion'],
        description: 'Propiedades de potencias de enteros, radicales y simplificación.',
        xOffset: 50,
        additionalQuizzes: [43, 327, 10, 11, 395],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-polinomios-ecuaciones',
        label: 'Polinomios Aritméticos y Ecuaciones en ℤ',
        level: 3,
        type: 'critical',
        requires: ['g7-enteros-multiplicacion-division', 'g7-enteros-potencias-raices'],
        description: 'Signos de agrupación, jerarquía combinada y ecuaciones de primer grado en ℤ.',
        xOffset: 0,
        additionalQuizzes: [14, 440, 15, 17, 314, 50, 51, 521],
        behavior: 'quiz_list'
    },

    // ==========================================
    // BASTIÓN II: NÚMEROS RACIONALES (ℚ) Y ECUACIONES (Periodo II)
    // ==========================================
    {
        id: 'g7-u2',
        label: 'BASTIÓN II • Números Racionales (ℚ), Decimales y Ecuaciones',
        level: 4,
        type: 'basic',
        requires: ['g7-enteros-polinomios-ecuaciones'],
        description: 'El conjunto de los números racionales, decimales, operaciones combinadas y ecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-racionales-concepto-orden',
        label: 'Conjunto ℚ, Fracciones y Recta Numérica',
        level: 5,
        type: 'basic',
        requires: ['g7-u2'],
        description: 'Fracciones en la recta, equivalencias, comparación y expresión decimal.',
        xOffset: -60,
        additionalQuizzes: [301, 358, 359, 330, 436, 437],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-operaciones',
        label: 'Operaciones Combinadas en ℚ y Decimales',
        level: 5,
        type: 'critical',
        requires: ['g7-u2'],
        description: 'Suma, resta, multiplicación y división con fracciones y números decimales.',
        xOffset: 60,
        additionalQuizzes: [24, 462, 44, 344, 345, 346, 350, 351, 352, 353, 354],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-problemas',
        label: 'Situaciones Problémicas con Fracciones y Decimales',
        level: 6,
        type: 'applied',
        requires: ['g7-racionales-concepto-orden', 'g7-racionales-operaciones'],
        description: 'Resolución de problemas contextualizados aditivos y multiplicativos en ℚ.',
        xOffset: -50,
        additionalQuizzes: [7, 347, 2, 355],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-potencias-ecuaciones',
        label: 'Potencias, Radicales y Ecuaciones en ℚ',
        level: 6,
        type: 'critical',
        requires: ['g7-racionales-operaciones'],
        description: 'Potenciación con exponentes fraccionarios, racionalización y ecuaciones fraccionarias.',
        xOffset: 50,
        additionalQuizzes: [394, 418, 12, 13, 61, 457, 62, 458],
        behavior: 'quiz_list'
    },

    // ==========================================
    // BASTIÓN III: PROPORCIONALIDAD, REGLA DE TRES Y MEDIDAS (Periodo III)
    // ==========================================
    {
        id: 'g7-u3',
        label: 'BASTIÓN III • Proporcionalidad, Regla de Tres y Medición',
        level: 7,
        type: 'basic',
        requires: ['g7-racionales-problemas', 'g7-racionales-potencias-ecuaciones'],
        description: 'Razones, proporciones, regla de tres simple y compuesta, repartos proporcionales y magnitudes.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-razones-proporciones',
        label: 'Razones y Propiedades de las Proporciones',
        level: 8,
        type: 'basic',
        requires: ['g7-u3'],
        description: 'Razón matemática, proporción geométrica y propiedades fundamentales.',
        xOffset: -70,
        additionalQuizzes: [363, 364, 499, 365, 366],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-proporcionalidad-directa-inversa',
        label: 'Proporcionalidad Directa, Inversa y Regla de 3',
        level: 8,
        type: 'critical',
        requires: ['g7-u3'],
        description: 'Magnitudes directas e inversas, constantes de proporcionalidad y regla de tres simple.',
        xOffset: 0,
        additionalQuizzes: [860, 367, 368, 369],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-regla-tres-compuesta',
        label: 'Regla de Tres Compuesta',
        level: 8,
        type: 'critical',
        requires: ['g7-u3'],
        description: 'Problemas complejos con múltiples magnitudes directa e inversamente proporcionales.',
        xOffset: 70,
        additionalQuizzes: [370, 371, 372, 373],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-repartos-proporcionales',
        label: 'Repartos Proporcionales Directos e Inversos',
        level: 9,
        type: 'applied',
        requires: ['g7-razones-proporciones', 'g7-proporcionalidad-directa-inversa'],
        description: 'Reparto de cantidades en partes proporcionales simples y compuestas.',
        xOffset: -50,
        additionalQuizzes: [870, 871],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-unidades-magnitudes',
        label: 'Unidades de Capacidad, Masa y Tiempo',
        level: 9,
        type: 'applied',
        requires: ['g7-proporcionalidad-directa-inversa', 'g7-regla-tres-compuesta'],
        description: 'Factores de conversión y resolución de problemas de medición en el sistema métrico.',
        xOffset: 50,
        additionalQuizzes: [380, 381, 463, 382, 383],
        behavior: 'quiz_list'
    },

    // ==========================================
    // BASTIÓN IV: DESPERTAR DEL ÁLGEBRA Y EDUCACIÓN FINANCIERA (Periodo IV)
    // ==========================================
    {
        id: 'g7-u4',
        label: 'BASTIÓN IV • Despertar del Álgebra y Educación Financiera',
        level: 10,
        type: 'basic',
        requires: ['g7-repartos-proporcionales', 'g7-unidades-magnitudes'],
        description: 'Iniciación al álgebra formal, evaluación de expresiones, monomios y finanzas personales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-algebra-lenguaje-expresiones',
        label: 'Lenguaje Algebraico y Evaluación de Fórmulas',
        level: 11,
        type: 'basic',
        requires: ['g7-u4'],
        description: 'Traducción de lenguaje verbal a simbólico, variables y valor numérico de expresiones.',
        xOffset: -60,
        additionalQuizzes: [943, 944, 945, 946],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-algebra-terminos-ecuaciones',
        label: 'Términos Semejantes, Monomios y Ecuaciones',
        level: 11,
        type: 'critical',
        requires: ['g7-u4'],
        description: 'Suma y resta de términos algebraicos y resolución de ecuaciones de primer grado.',
        xOffset: 60,
        additionalQuizzes: [947, 948, 949, 950],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-finanzas-porcentajes-interes',
        label: 'Porcentajes Comerciales e Interés Simple',
        level: 12,
        type: 'applied',
        requires: ['g7-algebra-lenguaje-expresiones', 'g7-algebra-terminos-ecuaciones'],
        description: 'Cálculo de incrementos, descuentos, porcentajes y modelos de interés simple.',
        xOffset: -50,
        additionalQuizzes: [374, 375, 376, 518],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-finanzas-presupuesto-credito',
        label: 'Presupuesto, Ahorro, Débito y Crédito',
        level: 12,
        type: 'applied',
        requires: ['g7-algebra-terminos-ecuaciones'],
        description: 'Educación financiera: presupuesto personal, medios de pago y metas de ahorro.',
        xOffset: 50,
        additionalQuizzes: [392, 393],
        behavior: 'quiz_list'
    },

    // ==========================================
    // GRAN MAESTRÍA DE SÉPTIMO GRADO
    // ==========================================
    {
        id: 'g7-mastery',
        label: 'Gran Emblema Titánico • 7° Grado',
        level: 13,
        type: 'evaluation',
        requires: ['g7-finanzas-porcentajes-interes', 'g7-finanzas-presupuesto-credito'],
        description: '¡Prueba cumbre de los Titanes! Supera la evaluación de 7° grado y asciende a Álgebra.',
        xOffset: 0,
        additionalQuizzes: [921, 279],
        behavior: 'quiz_list'
    }
];
