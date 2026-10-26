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
        description: 'Estructura de los enteros, valor absoluto, recta numérica, operatoria con ley de signos, potencias, raíces exactas, polinomios aritméticos y ecuaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-enteros-relativos-orden',
        label: 'Números Relativos, Recta y Valor Absoluto',
        level: 1,
        type: 'basic',
        requires: ['g7-u1'],
        description: 'Números signados, recta numérica extendida, orden en ℤ, opuestos, comparación y valor absoluto (niveles 1, 2 y 3).',
        xOffset: -36,
        additionalQuizzes: [309, 311, 315, 316, 317],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-adicion-sustraccion',
        label: 'Adición, Sustracción y Problemas en ℤ',
        level: 1,
        type: 'basic',
        requires: ['g7-u1'],
        description: 'Suma y resta de enteros con signos iguales y distintos, y resolución de problemas aditivos en contextos reales.',
        xOffset: 36,
        additionalQuizzes: [442, 443, 1, 435],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-multiplicacion-division',
        label: 'Multiplicación, División y Ley de Signos',
        level: 2,
        type: 'basic',
        requires: ['g7-enteros-relativos-orden', 'g7-enteros-adicion-sustraccion'],
        description: 'Productos, cocientes y operaciones combinadas multiplicativas en ℤ aplicando estrictamente la ley de signos.',
        xOffset: -50,
        additionalQuizzes: [1074, 1075, 312],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-potencias-raices',
        label: 'Potenciación y Radicación en ℤ',
        level: 2,
        type: 'critical',
        requires: ['g7-enteros-adicion-sustraccion'],
        description: 'Potencias de base entera con exponentes pares e impares, propiedades de las potencias y cálculo de raíces exactas en ℤ.',
        xOffset: 50,
        additionalQuizzes: [43, 327, 1076],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-enteros-polinomios-ecuaciones',
        label: 'Polinomios Aritméticos y Ecuaciones en ℤ',
        level: 3,
        type: 'critical',
        requires: ['g7-enteros-multiplicacion-division', 'g7-enteros-potencias-raices'],
        description: 'Signos de agrupación (paréntesis, corchetes, llaves), jerarquía combinada estricta y ecuaciones de primer grado en ℤ.',
        xOffset: 0,
        additionalQuizzes: [14, 440, 314, 17, 521],
        behavior: 'quiz_list'
    },

    // ==========================================
    // BASTIÓN II: NÚMEROS RACIONALES (ℚ) Y DECIMALES SIGNADOS (Periodo II)
    // ==========================================
    {
        id: 'g7-u2',
        label: 'BASTIÓN II • Números Racionales (ℚ), Decimales Signados y Ecuaciones',
        level: 4,
        type: 'basic',
        requires: ['g7-enteros-polinomios-ecuaciones'],
        description: 'El conjunto ℚ, fracciones y decimales positivos y negativos, fracción generatriz, operatoria con signos, potencias y ecuaciones racionales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-racionales-concepto-orden',
        label: 'Conjunto ℚ, Recta Numérica y Decimales',
        level: 5,
        type: 'basic',
        requires: ['g7-u2'],
        description: 'Fracciones negativas y positivas en la recta numérica extendida, relaciones de orden, comparación, densidad y fracción generatriz de decimales signados.',
        xOffset: -60,
        additionalQuizzes: [1077, 1078],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-operaciones',
        label: 'Operaciones Combinadas en ℚ (+, -, ×, ÷)',
        level: 5,
        type: 'critical',
        requires: ['g7-u2'],
        description: 'Suma, resta, multiplicación, división y polinomios aritméticos combinados con fracciones y números decimales signados.',
        xOffset: 60,
        additionalQuizzes: [1079, 1080, 1081],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-problemas',
        label: 'Situaciones Problémicas con Racionales (ℚ)',
        level: 6,
        type: 'applied',
        requires: ['g7-racionales-concepto-orden', 'g7-racionales-operaciones'],
        description: 'Modelado y resolución de problemas cotidianos de balance, trayectorias, mezclas y presupuestos con fracciones y decimales en ℚ.',
        xOffset: -50,
        additionalQuizzes: [1082],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-racionales-potencias-ecuaciones',
        label: 'Potenciación y Ecuaciones Lineales en ℚ',
        level: 6,
        type: 'critical',
        requires: ['g7-racionales-operaciones'],
        description: 'Potencias con base racional y exponentes enteros, propiedades algebraicas y resolución de ecuaciones de primer grado con coeficientes fraccionarios.',
        xOffset: 50,
        additionalQuizzes: [1083, 1084],
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
        description: 'Razones, proporciones, constante k, proporcionalidad directa e inversa, regla de tres simple y compuesta, repartos y factores de conversión métrica.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-razones-proporciones',
        label: 'Razones y Propiedades de las Proporciones',
        level: 8,
        type: 'basic',
        requires: ['g7-u3'],
        description: 'Razón matemática, antecedente y consecuente, proporción geométrica, propiedad fundamental y cálculo de términos desconocidos.',
        xOffset: -70,
        additionalQuizzes: [1085],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-proporcionalidad-directa-inversa',
        label: 'Proporcionalidad Directa, Inversa y Regla de 3',
        level: 8,
        type: 'critical',
        requires: ['g7-u3'],
        description: 'Magnitudes directa e inversamente proporcionales, constante de proporcionalidad, modelado con tablas y problemas aplicados de regla de tres simple.',
        xOffset: 0,
        additionalQuizzes: [1086, 369],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-regla-tres-compuesta',
        label: 'Regla de Tres Compuesta',
        level: 8,
        type: 'critical',
        requires: ['g7-u3'],
        description: 'Problemas avanzados con múltiples magnitudes directa e inversamente proporcionales en niveles intermedio, avanzado y experto.',
        xOffset: 70,
        additionalQuizzes: [371, 372, 373],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-repartos-proporcionales',
        label: 'Repartos Proporcionales Directos e Inversos',
        level: 9,
        type: 'applied',
        requires: ['g7-razones-proporciones', 'g7-proporcionalidad-directa-inversa'],
        description: 'Distribución de cantidades en partes proporcionales directas e inversas mediante el método de la constante de reparto.',
        xOffset: -50,
        additionalQuizzes: [1087],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-unidades-magnitudes',
        label: 'Unidades de Superficie, Volumen, Masa y Tiempo',
        level: 9,
        type: 'applied',
        requires: ['g7-proporcionalidad-directa-inversa', 'g7-regla-tres-compuesta'],
        description: 'Factores de conversión del sistema métrico decimal para superficie, volumen, masa y tiempo, y resolución de problemas cotidianos de medida.',
        xOffset: 50,
        additionalQuizzes: [379, 380, 381, 382, 383],
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
        description: 'Iniciación al álgebra simbólica, monomios, reducción de términos semejantes, despeje de fórmulas, porcentajes comerciales e inteligencia financiera.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-algebra-lenguaje-expresiones',
        label: 'Lenguaje Algebraico y Evaluación de Fórmulas',
        level: 11,
        type: 'basic',
        requires: ['g7-u4'],
        description: 'Traducción de lenguaje verbal a simbólico, variables, modelado con letras y cálculo del valor numérico de fórmulas matemáticas.',
        xOffset: -60,
        additionalQuizzes: [421, 1088, 65, 66],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-algebra-terminos-ecuaciones',
        label: 'Términos Semejantes, Monomios y Despeje',
        level: 11,
        type: 'critical',
        requires: ['g7-u4'],
        description: 'Suma y resta de monomios, reducción de términos semejantes y despeje de variables en fórmulas lineales elementales.',
        xOffset: 60,
        additionalQuizzes: [425, 445, 426, 67],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-finanzas-porcentajes-interes',
        label: 'Porcentajes Comerciales e Interés Simple',
        level: 12,
        type: 'applied',
        requires: ['g7-algebra-lenguaje-expresiones', 'g7-algebra-terminos-ecuaciones'],
        description: 'Cálculo de porcentajes aplicados a compras, facturación con IVA, descuentos comerciales y modelos de interés simple.',
        xOffset: -50,
        additionalQuizzes: [1089, 518],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-finanzas-presupuesto-credito',
        label: 'Presupuesto, Ahorro, Débito y Crédito',
        level: 12,
        type: 'applied',
        requires: ['g7-algebra-terminos-ecuaciones'],
        description: 'Educación financiera integral: presupuesto familiar, balance de ingresos y gastos, metas de ahorro, medios de pago y consumo inteligente.',
        xOffset: 50,
        additionalQuizzes: [1090],
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
        description: '¡Prueba cumbre de los Titanes! Supera la evaluación integral de 7° grado (enteros, racionales signados, proporcionalidad, álgebra y finanzas) y asciende victorioso a Álgebra.',
        xOffset: 0,
        additionalQuizzes: [1091],
        behavior: 'quiz_list'
    }
];
