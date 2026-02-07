
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
        subcategoryId: 16,
        filterKeywords: ['formula', 'fórmula', 'solucion', 'solución'], // Captures FÓRMULAS quizzes
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
        subcategoryId: 16,
        filterKeywords: ['despeje', 'despejar', 'variable'], // Captures Despeje quizzes
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
        // No specific subcategory found, mapping generic or placeholder
        filterKeywords: ['termino', 'término', 'coeficiente'],
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
        filterKeywords: ['polinomio', 'monomio', 'grado'],
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
        xOffset: -40,
        filterKeywords: ['suma', 'resta', 'adicion', 'sustraccion'],
        behavior: 'quiz_list'
    },
    {
        id: 'a2-2-multi',
        label: 'Multiplicación',
        level: 5,
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'Propiedad distributiva aplicada.',
        xOffset: 40,
        filterKeywords: ['multiplicacion', 'producto'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A3: PRODUCTOS NOTABLES
    // ==========================================
    {
        id: 'a3-notables',
        label: 'Productos Notables',
        level: 6,
        type: 'critical',
        requires: ['a2-2-multi'],
        description: 'Patrones multiplicativos esenciales.',
        xOffset: 0,
        subcategoryId: 10,
        behavior: 'container'
    },
    // Children of Productos Notables
    {
        id: 'a3-1-basicos',
        label: 'Básicos',
        level: 7,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Binomio al cuadrado y conjugados.',
        xOffset: -50,
        subcategoryId: 10,
        filterKeywords: ['(x+y)^2', '(x-y)^2', '(x+y)(x-y)', 'forma (x+y)', 'forma (x-y)'],
        behavior: 'quiz_list'
    },
    {
        id: 'a3-3-avanzados',
        label: 'Avanzados',
        level: 7,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Identidades complejas.',
        xOffset: 50,
        subcategoryId: 10,
        filterKeywords: ['miscelanea', 'miscelánea', 'avanzado', 'forma (x+a)(x+b)', '(x+y+z)'],
        behavior: 'quiz_list'
    },
    // Grandchild of Productos Notables (Empty content, educational structure)
    {
        id: 'a3-2-pascal',
        label: 'Triángulo Pascal',
        level: 8, // Grandchild level (6 -> 7 -> 8)
        type: 'basic',
        requires: ['a3-1-basicos'], // Parent is now Básicos to make it a grandchild of Notables
        description: 'Coeficientes binomiales (Referencia).',
        xOffset: 0,
        subcategoryId: 10,
        filterKeywords: ['DONOTMATCHANYTHING'], // Empty content requested
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A4: DIVISIÓN ALGEBRAICA
    // ==========================================
    {
        id: 'a4-division',
        label: 'División Algebraica',
        level: 9, // Shifted down
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Algoritmos de división y Ruffini.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a4-1-cocientes',
        label: 'Cocientes Notables',
        level: 10,
        type: 'basic',
        requires: ['a4-division'],
        description: 'Divisiones exactas especiales.',
        xOffset: 0,
        filterKeywords: ['cociente', 'division', 'residuo'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A5: FACTORIZACIÓN (CRITICAL)
    // ==========================================
    {
        id: 'a5-factorizacion',
        label: 'Factorización',
        level: 11,
        type: 'critical',
        requires: ['a4-1-cocientes', 'a3-notables'],
        description: 'El corazón del álgebra.',
        xOffset: 0,
        subcategoryId: 12,
        behavior: 'container'
    },

    // CHILDREN (Level 12)
    {
        id: 'a5-1-mcd',
        label: 'Factor Común',
        level: 12,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Monomio y Polinomio.',
        xOffset: -75,
        subcategoryId: 12,
        filterKeywords: ['factor comun', 'factor común', 'agrupación'],
        behavior: 'quiz_list'
    },
    {
        id: 'a5-2-diff',
        label: 'Diferencia Cuadrados',
        level: 12,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'a² - b².',
        xOffset: -25,
        subcategoryId: 12,
        filterKeywords: ['diferencia de cuadrados'],
        excludeKeywords: ['combinado', 'combinados', 'combiandos', 'combinada', 'combinación', 'combinacion', 'adicion', 'sustraccion', 'adición', 'sustracción'], // Robust exclusion
        behavior: 'quiz_list'
    },
    {
        id: 'a5-3-tcp',
        label: 'Trinomio Cuadrado',
        level: 12,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Perfecto (TCP).',
        xOffset: 25,
        subcategoryId: 12,
        filterKeywords: ['trinomio cuadrado perfecto'],
        excludeKeywords: ['combinado', 'combinados', 'combiandos', 'combinada', 'combinación', 'combinacion', 'adicion', 'sustraccion', 'adición', 'sustracción', 'quitar y poner'], // Robust exclusion
        behavior: 'quiz_list'
    },
    {
        id: 'a5-4-x2',
        label: 'Forma x²+bx+c',
        level: 12,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Trinomio simple.',
        xOffset: 75,
        subcategoryId: 12,
        filterKeywords: ['forma x^2', 'forma x2'],
        behavior: 'quiz_list'
    },

    // GRANDCHILDREN (Level 13) - Special Cases & Mixed
    {
        id: 'a5-5-combinada',
        label: 'Combinada',
        level: 13,
        type: 'applied',
        requires: ['a5-1-mcd', 'a5-2-diff', 'a5-3-tcp', 'a5-4-x2'], // Requires understanding of basics
        description: 'Estrategias mixtas.',
        xOffset: -60,
        subcategoryId: 12,
        filterKeywords: ['combinada', 'combinado', 'combinación', 'combinacion', 'mixto', 'múltiple'], // Broad match
        behavior: 'quiz_list'
    },
    // Special Cases Group (Listed individually as requested)
    {
        id: 'a5-6-ax2',
        label: 'Forma ax²+bx+c',
        level: 13,
        type: 'basic',
        requires: ['a5-4-x2'], // Extension of x^2
        description: 'Coeficiente principal > 1.',
        xOffset: -20,
        subcategoryId: 12,
        filterKeywords: ['forma ax^2', 'aspa simple', 'tijera'], // Keywords for ax^2
        behavior: 'quiz_list'
    },
    {
        id: 'a5-7-cubos',
        label: 'Cubos Perfectos',
        level: 13,
        type: 'basic',
        requires: ['a5-2-diff'], // Related to powers
        description: 'Suma y diferencia de cubos.',
        xOffset: 20,
        subcategoryId: 12,
        filterKeywords: ['cubo'],
        behavior: 'quiz_list'
    },
    {
        id: 'a5-8-adicion',
        label: 'Adición/Sustracción',
        level: 13,
        type: 'basic',
        requires: ['a5-3-tcp'], // Variation of TCP
        description: 'Completar cuadrados.',
        xOffset: 60,
        subcategoryId: 12,
        filterKeywords: ['adicion', 'adición', 'sustraccion', 'sustracción', 'quitar y poner'], // Removed "y" to match individual words if needed
        behavior: 'quiz_list'
    },

    // MASTERY (Level 14)
    {
        id: 'a5-mastery',
        label: 'Maestría Final',
        level: 14,
        type: 'evaluation',
        requires: ['a5-5-combinada', 'a5-6-ax2', 'a5-7-cubos', 'a5-8-adicion'],
        description: 'Prueba de factorización total.',
        xOffset: 0,
        subcategoryId: 12,
        filterKeywords: ['miscelanea', 'miscelánea', 'evaluacion', 'examen'],
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
        level: 15, // Shifted UP (14 gap 1)
        type: 'basic',
        requires: ['a5-mastery'],
        description: 'Simplificación y operaciones racionales.',
        xOffset: 0,
        subcategoryId: 13,
        behavior: 'container'
    },
    {
        id: 'a6-1-simple',
        label: 'Simplificación',
        level: 16,
        type: 'basic',
        requires: ['a6-fracciones'],
        description: 'Reducción a mínima expresión.',
        xOffset: -40,
        subcategoryId: 13,
        filterKeywords: ['simplificacion', 'simplificación'],
        behavior: 'quiz_list'
    },
    {
        id: 'a6-2-ops',
        label: 'Operaciones',
        level: 16,
        type: 'basic',
        requires: ['a6-fracciones'],
        description: 'Suma, resta, mult, div.',
        xOffset: 40,
        subcategoryId: 13,
        filterKeywords: ['suma', 'resta', 'operacion'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A7: ECUACIONES LINEALES
    // ==========================================
    {
        id: 'a7-ecuaciones',
        label: 'Ecuaciones 1 Var',
        level: 17, // Gap of 1 level (16 -> 17)
        type: 'basic',
        requires: ['a6-fracciones', 'a2-operaciones'],
        description: 'Hallando el valor de x.',
        xOffset: -50,
        subcategoryId: 14,
        behavior: 'container'
    },
    {
        id: 'a7-1-teoria',
        label: 'Resolución',
        level: 18,
        type: 'basic',
        requires: ['a7-ecuaciones'],
        description: 'Despeje y conjunto solución.',
        xOffset: -70,
        subcategoryId: 14,
        filterKeywords: ['resolucion', 'solucion'],
        behavior: 'quiz_list'
    },
    {
        id: 'a7-2-problemas',
        label: 'Problemas Verbales',
        level: 18,
        type: 'applied',
        requires: ['a7-ecuaciones'],
        description: 'Planteamiento de ecuaciones.',
        xOffset: -30,
        subcategoryId: 15,
        filterKeywords: ['problema', 'planteamiento', 'móvil'],
        excludeKeywords: ['fraccionario', 'fraccionaria', 'fraccionarios', 'fraccionarias', 'fracciones', 'fraccion', 'fracción'], // Explicit exclusion
        behavior: 'quiz_list'
    },
    {
        id: 'a9-ec-frac',
        label: 'Ec. Fraccionarias',
        level: 18,
        type: 'critical',
        requires: ['a7-ecuaciones', 'a6-fracciones'],
        xOffset: 20,
        description: 'Variables en denominador.',
        subcategoryId: 15,
        filterKeywords: ['fraccion', 'fracción'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A9.5: ECUACIONES INDETERMINADAS (NEW)
    // ==========================================
    {
        id: 'a9-5-indet',
        label: 'Ec. Indeterminadas',
        level: 19, // Shifted UP (Children 18 -> 19)
        type: 'basic',
        requires: ['a7-ecuaciones'], // Requires basic equations
        description: 'Infinitas soluciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a9-5-res',
        label: 'Resolución',
        level: 20,
        type: 'basic',
        requires: ['a9-5-indet'],
        description: 'Identidades.',
        xOffset: -40,
        subcategoryId: 21,
        filterKeywords: ['indeterminada'],
        excludeKeywords: ['problema', 'problemas'], // Exclude word problems
        behavior: 'quiz_list'
    },
    {
        id: 'a9-5-prob',
        label: 'Problemas',
        level: 20,
        type: 'applied',
        requires: ['a9-5-indet'],
        description: 'En contexto.',
        xOffset: 40,
        subcategoryId: 21,
        filterKeywords: ['problema', 'indeterminada'], // Must satisfy logic separately handled or use restrictive filter
        excludeKeywords: [], // Removed 'ecuaciones' exclusion to allow "Problemas sobre Ecuaciones..."
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A8: INECUACIONES (Shifted Down)
    // ==========================================
    {
        id: 'a8-inecuaciones',
        label: 'Inecuaciones',
        level: 21, // Shifted UP (Children 20 -> 21)
        type: 'basic',
        requires: ['a2-operaciones'],
        description: 'Desigualdades.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a8-1-lineales',
        label: 'Lineales',
        level: 22,
        type: 'basic',
        requires: ['a8-inecuaciones'],
        description: '1er grado > <',
        xOffset: -65,
        subcategoryId: 19,
        filterKeywords: ['inecuacion lineal', 'inecuación lineal', 'inecuacion racional', 'inecuaciones lineales'], // Added plural
        excludeKeywords: ['simultanea', 'simultánea', 'cuadratica', 'cuadrática'],
        behavior: 'quiz_list'
    },
    {
        id: 'a8-3-simultaneas',
        label: 'Simultáneas',
        level: 22,
        type: 'applied',
        requires: ['a8-inecuaciones'],
        description: 'Sistemas desigualdades.',
        xOffset: 0,
        subcategoryId: 19,
        filterKeywords: ['simultanea', 'simultánea'],
        behavior: 'quiz_list'
    },
    {
        id: 'a8-2-cuadraticas',
        label: 'Cuadráticas',
        level: 22,
        type: 'basic',
        requires: ['a8-inecuaciones'],
        description: '2do grado.',
        xOffset: 65,
        subcategoryId: 19,
        filterKeywords: ['inecuacion cuadratica', 'inecuación cuadrática'],
        excludeKeywords: ['simultanea', 'simultánea'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A10: SISTEMAS DE ECUACIONES (Shifted Down)
    // ==========================================
    {
        id: 'a10-sistemas',
        label: 'Sistemas 2x2',
        level: 23, // Shifted UP (Children 22 -> 23)
        type: 'critical',
        requires: ['a7-ecuaciones'],
        description: 'Dos variables, dos condiciones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a10-1-teoria',
        label: 'Teoría Sistemas',
        level: 24,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Compatible, Incompatible.',
        xOffset: -40,
        subcategoryId: 49,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-2-metodos',
        label: 'Métodos Alg.',
        level: 24,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Sustitución, Igualación.',
        xOffset: 0,
        subcategoryId: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-3-grafico',
        label: 'Método Gráfico',
        level: 24,
        type: 'applied',
        requires: ['a10-sistemas'],
        description: 'Intersección de rectas.',
        xOffset: 40,
        subcategoryId: 51,
        behavior: 'quiz_list'
    },
    {
        id: 'a10-4-cramer',
        label: 'Cramer',
        level: 24,
        type: 'critical',
        requires: ['a10-sistemas'],
        description: 'Determinantes.',
        xOffset: 80,
        subcategoryId: 52,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A11: ECUACIONES CUADRÁTICAS (Shifted Down)
    // ==========================================
    {
        id: 'a11-cuadraticas',
        label: 'Ec. Cuadráticas',
        level: 25, // Shifted UP (Children 24 -> 25)
        type: 'critical',
        requires: ['a10-sistemas', 'a5-factorizacion'],
        description: 'Segundo grado.',
        xOffset: -40,
        subcategoryId: 15,
        filterKeywords: ['cuadratica', 'cuadrática', 'segundo grado', 'ecuaciones y funciones cuadráticas'],
        behavior: 'container'
    },
    {
        id: 'a11-1-solucion',
        label: 'Resolución',
        level: 26,
        type: 'basic',
        requires: ['a11-cuadraticas'],
        description: 'Fórmula general y factores.',
        xOffset: -40,
        subcategoryId: 15,
        filterKeywords: ['formula general', 'fórmula general', 'factorizacion', 'factorización'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A12: FUNCIONES (Shifted Down)
    // ==========================================
    {
        id: 'a12-funciones',
        label: 'Funciones',
        level: 25, // Parallel to Quadratic
        type: 'evaluation',
        requires: ['a10-sistemas'],
        description: 'Relaciones funcionales.',
        xOffset: 40,
        subcategoryId: 15,
        filterKeywords: ['funcion', 'función', 'polinomio', 'modelado', 'tasa'],
        behavior: 'container'
    },
    {
        id: 'a12-1-lineal',
        label: 'Función Lineal',
        level: 26,
        type: 'basic',
        requires: ['a12-funciones'],
        description: 'y = mx + b',
        xOffset: 20,
        subcategoryId: 20,
        filterKeywords: ['lineal', 'afin', 'grafica', 'gráfica'],
        behavior: 'quiz_list'
    },
    {
        id: 'a12-2-concepto',
        label: 'Conceptos',
        level: 26,
        type: 'critical',
        requires: ['a12-funciones'],
        description: 'Dominio y rango.',
        xOffset: 60,
        subcategoryId: 15,
        filterKeywords: ['dominio', 'rango', 'evaluacion', 'composición', 'inversa', 'racional'],
        behavior: 'quiz_list'
    }
];
