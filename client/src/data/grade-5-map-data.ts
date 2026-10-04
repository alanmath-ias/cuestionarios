import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade5MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: TEORÍA DE CONJUNTOS
    // ==========================================
    {
        id: 'g5-conjuntos',
        label: 'Conjuntos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de la teoría de conjuntos y relaciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-det-conjuntos',
        label: 'Determinación y Clases',
        level: 1,
        type: 'basic',
        requires: ['g5-conjuntos'],
        description: 'Extensión, comprensión, pertenencia y clases de conjuntos.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-ops-conjuntos',
        label: 'Operaciones entre Conjuntos',
        level: 1,
        type: 'basic',
        requires: ['g5-conjuntos'],
        description: 'Unión, intersección, diferencia y diagramas de Venn.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-producto-cartesiano',
        label: 'Producto Cartesiano',
        level: 2,
        type: 'basic',
        requires: ['g5-det-conjuntos', 'g5-ops-conjuntos'],
        description: 'Pares ordenados y relaciones entre conjuntos.',
        xOffset: 0,
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
        description: 'Estructura decimal y operaciones con naturales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-posicional',
        label: 'Valor Posicional',
        level: 4,
        type: 'basic',
        requires: ['g5-naturales'],
        description: 'Valor posicional y descomposición de números grandes.',
        xOffset: -40,
        subcategoryId: 300,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-recta',
        label: 'Recta y Comparación',
        level: 4,
        type: 'basic',
        requires: ['g5-naturales'],
        description: 'Ubicación en la recta numérica y relaciones de orden.',
        xOffset: 40,
        subcategoryId: 302,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-suma-resta',
        label: 'Suma y Resta',
        level: 5,
        type: 'basic',
        requires: ['g5-posicional', 'g5-recta'],
        description: 'Adición, sustracción y sus propiedades.',
        xOffset: -40,
        subcategoryId: 301,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-multi-div',
        label: 'Multiplicación y División',
        level: 5,
        type: 'critical',
        requires: ['g5-posicional', 'g5-recta'],
        description: 'Operaciones multiplicativas y sus propiedades.',
        xOffset: 40,
        subcategoryId: 1,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-tablas',
        label: 'Tablas de Multiplicar',
        level: 6,
        type: 'basic',
        requires: ['g5-multi-div'],
        description: 'Práctica y dominio de tablas de multiplicar.',
        xOffset: -75,
        subcategoryId: 483,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-jerarquia',
        label: 'Jerarquía de Operaciones',
        level: 6,
        type: 'basic',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Orden de las operaciones (PEMDAS) en naturales.',
        xOffset: -25,
        subcategoryId: 434,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-igualdades',
        label: 'Igualdades y Ecuaciones',
        level: 6,
        type: 'basic',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Equilibrio de balanzas y término desconocido.',
        xOffset: 25,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-nat',
        label: 'Resolución de Problemas',
        level: 6,
        type: 'applied',
        requires: ['g5-suma-resta', 'g5-multi-div'],
        description: 'Estrategias de resolución con naturales.',
        xOffset: 75,
        subcategoryId: 303,
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
        description: 'Divisibilidad, números primos y descomposición.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-primos',
        label: 'Primos, Múltiplos y Divisores',
        level: 8,
        type: 'basic',
        requires: ['g5-divisibilidad'],
        description: 'Conceptos fundamentales de divisibilidad.',
        xOffset: -50,
        subcategoryId: 309,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-criterios',
        label: 'Criterios de Divisibilidad',
        level: 8,
        type: 'basic',
        requires: ['g5-divisibilidad'],
        description: 'Reglas para reconocer divisibilidad rápidamente.',
        xOffset: 50,
        subcategoryId: 310,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-descomposicion',
        label: 'Factores Primos',
        level: 9,
        type: 'basic',
        requires: ['g5-primos', 'g5-criterios'],
        description: 'Descomposición factorial de un número.',
        xOffset: 0,
        subcategoryId: 4,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-mcm-mcd',
        label: 'MCM y MCD',
        level: 10,
        type: 'basic',
        requires: ['g5-descomposicion'],
        description: 'Mínimo común múltiplo y máximo común divisor.',
        xOffset: -40,
        subcategoryId: 311,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-mcm-mcd',
        label: 'Problemas de MCM y MCD',
        level: 10,
        type: 'applied',
        requires: ['g5-descomposicion'],
        description: 'Aplicación de múltiplos y divisores en problemas reales.',
        xOffset: 40,
        subcategoryId: 312,
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
        description: 'El mundo de las partes y repartos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-concepto-frac',
        label: 'Significados y Representación',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Concepto, numerador, denominador y dibujos.',
        xOffset: -60,
        subcategoryId: 315,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-equiv-frac',
        label: 'Fracciones Equivalentes',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Simplificación y amplificación de fracciones.',
        xOffset: 0,
        subcategoryId: 316,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-mixtos-frac',
        label: 'Clases y Números Mixtos',
        level: 12,
        type: 'basic',
        requires: ['g5-fracciones'],
        description: 'Fracciones propias, impropias y mixtas.',
        xOffset: 60,
        subcategoryId: 317,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-suma-resta-frac',
        label: 'Sumas y Restas',
        level: 13,
        type: 'critical',
        requires: ['g5-concepto-frac', 'g5-equiv-frac', 'g5-mixtos-frac'],
        description: 'Adición y sustracción de fracciones y mixtos.',
        xOffset: -40,
        subcategoryId: 318,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-multi-div-frac',
        label: 'Productos y Divisiones',
        level: 13,
        type: 'basic',
        requires: ['g5-concepto-frac', 'g5-equiv-frac', 'g5-mixtos-frac'],
        description: 'Multiplicación y división de fracciones y números mixtos.',
        xOffset: 40,
        subcategoryId: 319,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-polinomios-frac',
        label: 'Operaciones Combinadas',
        level: 14,
        type: 'basic',
        requires: ['g5-suma-resta-frac', 'g5-multi-div-frac'],
        description: 'Polinomios aritméticos con fracciones y paréntesis.',
        xOffset: -40,
        subcategoryId: 320,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-problemas-frac',
        label: 'Problemas con Fracciones',
        level: 14,
        type: 'applied',
        requires: ['g5-suma-resta-frac', 'g5-multi-div-frac'],
        description: 'Resolución de problemas cotidianos con fracciones.',
        xOffset: 40,
        subcategoryId: 3,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: MAESTRÍA DE QUINTO GRADO
    // ==========================================
    {
        id: 'g5-mastery',
        label: 'Maestría de 5° Grado',
        level: 15,
        type: 'evaluation',
        requires: [],
        description: 'El desafío final que corona todo el aprendizaje de 5° de primaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
