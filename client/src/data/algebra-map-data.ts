
import { ArithmeticNode } from './arithmetic-map-data.js';

// Reuse the interface, just distinct variable name
export const algebraMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL A0: TRANSICIÓN A ÁLGEBRA
    // ==========================================
    {
        id: 'a0-transicion',
        label: 'Transición a Álgebra',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Del pensamiento numérico al algebraico.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a0-1-letras',
        label: 'Uso de Letras',
        level: 1,
        type: 'basic',
        requires: ['a0-transicion'],
        description: 'Incógnitas y variables como números generalizados.',
        xOffset: -40,
        subcategoryId: 374,
        behavior: 'quiz_list'
    },
    {
        id: 'a0-2-igualdad',
        label: 'Igualdad y Despeje',
        level: 1,
        type: 'critical',
        requires: ['a0-transicion'],
        description: 'Principio fundamental de la balanza.',
        xOffset: 40,
        subcategoryId: 375,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A1: EXPRESIONES ALGEBRAICAS
    // ==========================================
    {
        id: 'a1-expresiones',
        label: 'Expresiones Algebraicas',
        level: 2,
        type: 'basic',
        requires: ['a0-1-letras', 'a0-2-igualdad'],
        description: 'El lenguaje del álgebra.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a1-1-terminos',
        label: 'Términos',
        level: 3,
        type: 'basic',
        requires: ['a1-expresiones'],
        description: 'Coeficiente, variable y grado.',
        xOffset: -30,
        subcategoryId: 423,
        behavior: 'quiz_list'
    },
    {
        id: 'a1-2-polinomios',
        label: 'Polinomios',
        level: 3,
        type: 'basic',
        requires: ['a1-expresiones'],
        description: 'Monomios, binomios y clasificación.',
        xOffset: 30,
        subcategoryId: 424,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A2: OPERACIONES CON POLINOMIOS
    // ==========================================
    {
        id: 'a2-operaciones',
        label: 'Operaciones Polinomios',
        level: 4,
        type: 'basic',
        requires: ['a1-1-terminos', 'a1-2-polinomios'],
        description: 'Aritmética con letras.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a2-1-suma-resta',
        label: 'Suma y Resta',
        level: 5,
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'Reducción de términos semejantes.',
        xOffset: -60,
        subcategoryId: 425,
        behavior: 'quiz_list'
    },
    {
        id: 'a2-2-multi',
        label: 'Multiplicación',
        level: 5,
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'Propiedad distributiva aplicada.',
        xOffset: 0,
        subcategoryId: 426,
        behavior: 'quiz_list'
    },
    {
        id: 'a2-3-mcm-mcd',
        label: 'mcm y MCD',
        level: 5,
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'mcm y MCD - Operaciones Polinomios.',
        xOffset: 60,
        subcategoryId: 432,
        behavior: 'quiz_list'
    },
    {
        id: 'a2-4-problemas',
        label: 'Problemas',
        level: 6,
        type: 'applied',
        requires: ['a2-operaciones'],
        description: 'Problemas - Operaciones Polinomios.',
        xOffset: 0,
        subcategoryId: 433,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A3: PRODUCTOS NOTABLES
    // ==========================================
    {
        id: 'a3-notables',
        label: 'Productos Notables',
        level: 7,
        type: 'critical',
        requires: ['a2-2-multi'],
        description: 'Patrones multiplicativos esenciales.',
        xOffset: 0,
        subcategoryId: 382,
        behavior: 'container'
    },
    // Children of Productos Notables
    {
        id: 'a3-1-basicos',
        label: 'Básicos',
        level: 8,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Binomio al cuadrado y conjugados.',
        xOffset: -50,
        subcategoryId: 383,
        behavior: 'quiz_list'
    },
    {
        id: 'a3-3-avanzados',
        label: 'Avanzados',
        level: 8,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Identidades complejas.',
        xOffset: 50,
        subcategoryId: 384,
        behavior: 'quiz_list'
    },
    // Grandchild of Productos Notables (Empty content, educational structure)
    {
        id: 'a3-2-pascal',
        label: 'Triángulo Pascal',
        level: 9, // Grandchild level (7 -> 8 -> 9)
        type: 'basic',
        requires: ['a3-1-basicos'], // Parent is now Básicos to make it a grandchild of Notables
        description: 'Coeficientes binomiales (Referencia).',
        xOffset: 0,
        subcategoryId: 427,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A4: DIVISIÓN ALGEBRAICA
    // ==========================================
    {
        id: 'a4-division',
        label: 'División Algebraica',
        level: 10, // Shifted down
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Algoritmos de división y Ruffini.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a4-1-cocientes',
        label: 'Cocientes Notables',
        level: 11,
        type: 'basic',
        requires: ['a4-division'],
        description: 'Divisiones exactas especiales.',
        xOffset: 0,
        subcategoryId: 428,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A5: FACTORIZACIÓN (CRITICAL)
    // ==========================================
    {
        id: 'a5-factorizacion',
        label: 'Factorización',
        level: 12,
        type: 'critical',
        requires: ['a4-1-cocientes', 'a3-notables'],
        description: 'El corazón del álgebra.',
        xOffset: 0,
        subcategoryId: 388,
        behavior: 'container'
    },

    // CHILDREN (Level 13)
    {
        id: 'a5-1-mcd',
        label: 'Factor Común',
        level: 13,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Monomio y Polinomio.',
        xOffset: -75,
        subcategoryId: 389,
        behavior: 'quiz_list'
    },
    {
        id: 'a5-2-diff',
        label: 'Diferencia Cuadrados',
        level: 13,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'a² - b².',
        xOffset: -25,
        subcategoryId: 390,
        behavior: 'quiz_list'
    },
    {
        id: 'a5-3-tcp',
        label: 'Trinomio Cuadrado',
        level: 13,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Perfecto (TCP).',
        xOffset: 25,
        subcategoryId: 391,
        behavior: 'quiz_list'
    },
    {
        id: 'a5-4-x2',
        label: 'Forma x²+bx+c',
        level: 13,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Trinomio simple.',
        xOffset: 75,
        subcategoryId: 392,
        behavior: 'quiz_list'
    },

    // GRANDCHILDREN (Level 14) - Special Cases & Mixed
    {
        id: 'a5-5-combinada',
        label: 'Combinada',
        level: 14,
        type: 'applied',
        requires: ['a5-1-mcd', 'a5-2-diff', 'a5-3-tcp', 'a5-4-x2'], // Requires understanding of basics
        description: 'Estrategias mixtas.',
        xOffset: -60,
        subcategoryId: 393,
        behavior: 'quiz_list'
    },
    // Special Cases Group (Listed individually as requested)
    {
        id: 'a5-6-ax2',
        label: 'Forma ax²+bx+c',
        level: 14,
        type: 'basic',
        requires: ['a5-4-x2'], // Extension of x^2
        description: 'Coeficiente principal > 1.',
        xOffset: -20,
        subcategoryId: 394,
        behavior: 'quiz_list'
    },
    {
        id: 'a5-7-cubos',
        label: 'Cubos Perfectos',
        level: 14,
        type: 'basic',
        requires: ['a5-2-diff'], // Related to powers
        description: 'Suma y diferencia de cubos.',
        xOffset: 20,
        subcategoryId: 395,
        behavior: 'quiz_list'
    },
    {
        id: 'a5-8-adicion',
        label: 'Adición/Sustracción',
        level: 14,
        type: 'basic',
        requires: ['a5-3-tcp'], // Variation of TCP
        description: 'Completar cuadrados.',
        xOffset: 60,
        subcategoryId: 396,
        behavior: 'quiz_list'
    },

    // MASTERY (Level 15)
    {
        id: 'a5-9-division',
        label: 'Por División',
        level: 15,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Método de Ruffini y residuos.',
        xOffset: -30,
        subcategoryId: 422,
        behavior: 'quiz_list'
    },

    {
        id: 'a5-mastery',
        label: 'Maestría Final',
        level: 15,
        type: 'evaluation',
        requires: ['a5-5-combinada', 'a5-6-ax2', 'a5-7-cubos', 'a5-8-adicion'],
        description: 'Prueba de factorización total.',
        xOffset: 30,
        subcategoryId: 397,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A6: FRACCIONES ALGEBRAICAS
    // ==========================================
    // ==========================================
    // NIVEL A6: FRACCIONES ALGEBRAICAS
    // ==========================================
    // ==========================================
    // NIVEL A6: FRACCIONES ALGEBRAICAS
    // ==========================================
    {
        id: 'a6-fracciones',
        label: 'Fracciones Alg.',
        level: 16, // Shifted UP (15 gap 1)
        type: 'basic',
        requires: ['a5-mastery'],
        description: 'Simplificación y operaciones racionales.',
        xOffset: 0,
        subcategoryId: 398,
        behavior: 'container'
    },
    {
        id: 'a6-1-simple',
        label: 'Simplificación',
        level: 17,
        type: 'basic',
        requires: ['a6-fracciones'],
        description: 'Reducción a mínima expresión.',
        xOffset: -40,
        subcategoryId: 399,
        behavior: 'quiz_list'
    },
    {
        id: 'a6-2-ops',
        label: 'Operaciones',
        level: 17,
        type: 'basic',
        requires: ['a6-fracciones'],
        description: 'Suma, resta, mult, div.',
        xOffset: 40,
        subcategoryId: 400,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A7: ECUACIONES LINEALES
    // ==========================================
    {
        id: 'a7-ecuaciones',
        label: 'Ecuaciones 1 Var',
        level: 18, // Gap of 1 level (17 -> 18)
        type: 'basic',
        requires: ['a6-fracciones', 'a2-operaciones'],
        description: 'Hallando el valor de x.',
        xOffset: -50,
        subcategoryId: 401,
        behavior: 'container'
    },
    {
        id: 'a7-1-teoria',
        label: 'Resolución',
        level: 19,
        type: 'basic',
        requires: ['a7-ecuaciones'],
        description: 'Despeje y conjunto solución.',
        xOffset: -70,
        subcategoryId: 402,
        behavior: 'quiz_list'
    },
    {
        id: 'a7-2-problemas',
        label: 'Problemas Verbales',
        level: 19,
        type: 'applied',
        requires: ['a7-ecuaciones'],
        description: 'Planteamiento de ecuaciones.',
        xOffset: -30,
        subcategoryId: 403,
        behavior: 'quiz_list'
    },
    {
        id: 'a9-ec-frac',
        label: 'Ec. Fraccionarias',
        level: 19,
        type: 'critical',
        requires: ['a7-ecuaciones', 'a6-fracciones'],
        xOffset: 20,
        description: 'Variables en denominador.',
        subcategoryId: 404,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A9.5: ECUACIONES INDETERMINADAS (NEW)
    // ==========================================
    {
        id: 'a9-5-indet',
        label: 'Ec. Indeterminadas',
        level: 20, // Shifted UP (Children 19 -> 20)
        type: 'basic',
        requires: ['a7-ecuaciones'], // Requires basic equations
        description: 'Infinitas soluciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a9-5-res',
        label: 'Resolución',
        level: 21,
        type: 'basic',
        requires: ['a9-5-indet'],
        description: 'Identidades.',
        xOffset: -40,
        subcategoryId: 406,
        behavior: 'quiz_list'
    },
    {
        id: 'a9-5-prob',
        label: 'Problemas',
        level: 21,
        type: 'applied',
        requires: ['a9-5-indet'],
        description: 'En contexto.',
        xOffset: 40,
        subcategoryId: 407,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A8: INECUACIONES (Shifted Down)
    // ==========================================
    {
        id: 'a8-inecuaciones',
        label: 'Inecuaciones',
        level: 22, // Shifted UP (Children 21 -> 22)
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'Desigualdades.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a8-1-lineales',
        label: 'Lineales',
        level: 23,
        type: 'basic',
        requires: ['a8-inecuaciones'],
        description: '1er grado > <',
        xOffset: -65,
        subcategoryId: 409,
        behavior: 'quiz_list'
    },
    {
        id: 'a8-3-simultaneas',
        label: 'Simultáneas',
        level: 23,
        type: 'applied',
        requires: ['a8-inecuaciones'],
        description: 'Sistemas desigualdades.',
        xOffset: 0,
        subcategoryId: 410,
        behavior: 'quiz_list'
    },
    {
        id: 'a8-2-cuadraticas',
        label: 'Cuadráticas',
        level: 23,
        type: 'basic',
        requires: ['a8-inecuaciones'],
        description: '2do grado.',
        xOffset: 65,
        subcategoryId: 429,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A10: SISTEMAS DE ECUACIONES (Shifted Down)
    // ==========================================
    {
        id: 'a10-sistemas',
        label: 'Sistemas 2x2',
        level: 24, // Shifted UP (Children 23 -> 24)
        type: 'critical',
        requires: ['a7-ecuaciones'],
        description: 'Dos variables, dos condiciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a10-1-teoria',
        label: 'Teoría Sistemas',
        level: 25,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Compatible, Incompatible.',
        xOffset: -40,
        subcategoryId: 413,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-2-metodos',
        label: 'Métodos Alg.',
        level: 25,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Sustitución, Igualación.',
        xOffset: 0,
        subcategoryId: 414,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-3-grafico',
        label: 'Método Gráfico',
        level: 25,
        type: 'applied',
        requires: ['a10-sistemas'],
        description: 'Intersección de rectas.',
        xOffset: 40,
        subcategoryId: 415,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-4-cramer',
        label: 'Cramer',
        level: 25,
        type: 'critical',
        requires: ['a10-sistemas'],
        description: 'Determinantes.',
        xOffset: 80,
        subcategoryId: 416,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A11: ECUACIONES CUADRÁTICAS (Shifted Down)
    // ==========================================
    {
        id: 'a11-cuadraticas',
        label: 'Ec. Cuadráticas',
        level: 26, // Shifted UP (Children 25 -> 26)
        type: 'critical',
        requires: ['a10-sistemas', 'a5-factorizacion'],
        description: 'Segundo grado.',
        xOffset: -40,
        subcategoryId: 417,
        behavior: 'container'
    },
    {
        id: 'a11-1-solucion',
        label: 'Resolución',
        level: 27,
        type: 'basic',
        requires: ['a11-cuadraticas'],
        description: 'Fórmula general y factores.',
        xOffset: -40,
        subcategoryId: 430,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A12: FUNCIONES (Shifted Down)
    // ==========================================
    {
        id: 'a12-funciones',
        label: 'Funciones',
        level: 26, // Parallel to Quadratic
        type: 'evaluation',
        requires: ['a10-sistemas'],
        description: 'Relaciones funcionales.',
        xOffset: 40,
        subcategoryId: 419,
        behavior: 'container'
    },
    {
        id: 'a12-1-lineal',
        label: 'Función Lineal',
        level: 27,
        type: 'basic',
        requires: ['a12-funciones'],
        description: 'y = mx + b',
        xOffset: 20,
        subcategoryId: 420,
        behavior: 'quiz_list'
    },
    {
        id: 'a12-2-concepto',
        label: 'Conceptos',
        level: 27,
        type: 'critical',
        requires: ['a12-funciones'],
        description: 'Dominio y rango.',
        xOffset: 60,
        subcategoryId: 431,
        behavior: 'quiz_list'
    }
];
