
import { ArithmeticNode } from './arithmetic-map-data';

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
        id: 'a3-2-pascal',
        label: 'Triángulo Pascal',
        level: 7,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Coeficientes binomiales.',
        xOffset: 0,
        subcategoryId: 10,
        filterKeywords: ['pascal', 'cubo', '(x+y)^3'],
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

    // ==========================================
    // NIVEL A4: DIVISIÓN ALGEBRAICA
    // ==========================================
    {
        id: 'a4-division',
        label: 'División Algebraica',
        level: 8,
        type: 'basic',
        requires: ['a3-notables'],
        description: 'Algoritmos de división y Ruffini.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'a4-1-cocientes',
        label: 'Cocientes Notables',
        level: 9,
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
        level: 10,
        type: 'critical',
        requires: ['a4-1-cocientes', 'a3-notables'],
        description: 'El corazón del álgebra.',
        xOffset: 0,
        subcategoryId: 12,
        behavior: 'container'
    },
    {
        id: 'a5-1-mcd',
        label: 'Factor Común',
        level: 11,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'El primer paso siempre.',
        xOffset: -60,
        subcategoryId: 12,
        filterKeywords: ['factor comun', 'factor común', 'agrupación'],
        behavior: 'quiz_list'
    },
    {
        id: 'a5-2-casos',
        label: 'Casos Especiales',
        level: 11,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Binomios y Trinomios comunes.',
        xOffset: 0,
        subcategoryId: 12,
        filterKeywords: ['diferencia de cuadrados', 'trinomio cuadrado', 'cubo', 'forma ax^2', 'forma x^2'],
        behavior: 'quiz_list'
    },
    {
        id: 'a5-3-combinada',
        label: 'Combinada',
        level: 11,
        type: 'applied',
        requires: ['a5-factorizacion'],
        description: 'Estrategias mixtas.',
        xOffset: 60,
        subcategoryId: 12,
        filterKeywords: ['combinada', 'múltiple', 'miscelánea', 'miscelanea'],
        behavior: 'quiz_list'
    },
    {
        id: 'a5-4-evaluacion',
        label: 'Maestría',
        level: 12,
        type: 'evaluation',
        requires: ['a5-1-mcd', 'a5-2-casos', 'a5-3-combinada'],
        description: 'Prueba de factorización total.',
        xOffset: 0,
        subcategoryId: 12,
        filterKeywords: ['evaluacion', 'examen', 'final'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A6: FRACCIONES ALGEBRAICAS
    // ==========================================
    {
        id: 'a6-fracciones',
        label: 'Fracciones Alg.',
        level: 13,
        type: 'basic',
        requires: ['a5-factorizacion'],
        description: 'Simplificación y operaciones racionales.',
        xOffset: 0,
        subcategoryId: 13,
        behavior: 'container'
    },
    {
        id: 'a6-1-simple',
        label: 'Simplificación',
        level: 14,
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
        level: 14,
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
        level: 15,
        type: 'basic',
        requires: ['a6-fracciones', 'a2-operaciones'],
        description: 'Hallando el valor de x.',
        xOffset: -50,
        subcategoryId: 14, // Ecuaciones lineales 1 var
        behavior: 'container'
    },
    {
        id: 'a7-1-teoria',
        label: 'Resolución',
        level: 16,
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
        level: 16,
        type: 'applied',
        requires: ['a7-ecuaciones'],
        description: 'Planteamiento de ecuaciones.',
        xOffset: -30,
        subcategoryId: 15, // Problemas sobre Ecuaciones... (Contains many mixed topics)
        filterKeywords: ['problema', 'planteamiento', 'móvil'], // Specific to word problems
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A8: INECUACIONES
    // ==========================================
    {
        id: 'a8-inecuaciones',
        label: 'Inecuaciones',
        level: 15, // Parallel to Ecuaciones
        type: 'basic',
        requires: ['a7-ecuaciones'],
        description: 'Desigualdades y recta numérica.',
        xOffset: 50,
        subcategoryId: 19,
        filterKeywords: ['inecuacion'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A9: ECUACIONES FRACCIONARIAS
    // ==========================================
    {
        id: 'a9-ec-frac',
        label: 'Ec. Fraccionarias',
        level: 17,
        type: 'critical',
        requires: ['a7-ecuaciones', 'a6-fracciones'],
        xOffset: 0,
        description: 'Ecuaciones con variables en denominador.',
        subcategoryId: 15, // Problemas sometimes has these
        filterKeywords: ['fraccion', 'fracción'], // Mixed into Problemas subcategory
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A10: SISTEMAS DE ECUACIONES
    // ==========================================
    {
        id: 'a10-sistemas',
        label: 'Sistemas 2x2',
        level: 18,
        type: 'critical',
        requires: ['a7-ecuaciones'], // Depends on single var skills
        description: 'Dos variables, dos condiciones.',
        xOffset: 0,
        behavior: 'container'
    },
    // FUSION: Indeterminadas linked here
    {
        id: 'a10-0-indeterminadas',
        label: 'Ec. Indeterminadas',
        level: 18,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Infinitas soluciones.',
        xOffset: -60,
        subcategoryId: 21, // Ecuaciones Indeterminadas
        filterKeywords: ['indeterminada'],
        behavior: 'quiz_list'
    },

    {
        id: 'a10-1-teoria',
        label: 'Teoría Sistemas',
        level: 19,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Compatible, Incompatible.',
        xOffset: -60,
        subcategoryId: 49,
        filterKeywords: ['teoria', 'teoría', 'concepto'],
        behavior: 'quiz_list'
    },
    {
        id: 'a10-2-metodos',
        label: 'Métodos Alg.',
        level: 19,
        type: 'basic',
        requires: ['a10-sistemas'],
        description: 'Sustitución, Igualación.',
        xOffset: -20,
        subcategoryId: 50,
        filterKeywords: ['sustitucion', 'sustitución', 'igualacion', 'igualación', 'eliminacion', 'eliminación'],
        behavior: 'quiz_list'
    },
    {
        id: 'a10-3-grafico',
        label: 'Método Gráfico',
        level: 19,
        type: 'applied',
        requires: ['a10-sistemas'],
        description: 'Intersección de rectas.',
        xOffset: 20,
        subcategoryId: 51,
        filterKeywords: ['grafico', 'gráfico', 'grafica', 'gráfica'],
        behavior: 'quiz_list'
    },
    {
        id: 'a10-4-cramer',
        label: 'Cramer',
        level: 19,
        type: 'critical',
        requires: ['a10-sistemas'],
        description: 'Determinantes.',
        xOffset: 60,
        subcategoryId: 52,
        filterKeywords: ['cramer', 'determinante'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A11: ECUACIONES CUADRÁTICAS
    // ==========================================
    {
        id: 'a11-cuadraticas',
        label: 'Ec. Cuadráticas',
        level: 20,
        type: 'critical',
        requires: ['a10-sistemas', 'a5-factorizacion'],
        description: 'Segundo grado.',
        xOffset: -40,
        // No specific subcategory in dump, generic placeholder
        subcategoryId: 15, // Mapped to Problemas...
        filterKeywords: ['cuadratica', 'cuadrática', 'segundo grado', 'ecuaciones y funciones cuadráticas'],
        behavior: 'container'
    },
    {
        id: 'a11-1-solucion',
        label: 'Resolución',
        level: 21,
        type: 'basic',
        requires: ['a11-cuadraticas'],
        description: 'Fórmula general y factores.',
        xOffset: -40,

        subcategoryId: 15,
        filterKeywords: ['formula general', 'fórmula general', 'factorizacion', 'factorización'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL A12: FUNCIONES
    // ==========================================
    {
        id: 'a12-funciones',
        label: 'Funciones',
        level: 20, // Parallel/Alternative to Quadratic
        type: 'evaluation',
        requires: ['a10-sistemas'], // Graphing requires systems/linear eq skills
        description: 'Relaciones funcionales.',
        xOffset: 40,
        subcategoryId: 15, // Also in Problemas...
        filterKeywords: ['funcion', 'función', 'polinomio', 'modelado', 'tasa'],
        behavior: 'container'
    },
    {
        id: 'a12-1-lineal',
        label: 'Función Lineal',
        level: 21,
        type: 'basic',
        requires: ['a12-funciones'],
        description: 'y = mx + b',
        xOffset: 20,
        subcategoryId: 20, // Ecuaciones lineales 2 variables (Graphics)
        filterKeywords: ['lineal', 'afin', 'grafica', 'gráfica'],
        behavior: 'quiz_list'
    },
    {
        id: 'a12-2-concepto',
        label: 'Conceptos',
        level: 21,
        type: 'critical',
        requires: ['a12-funciones'],
        description: 'Dominio y rango.',
        xOffset: 60,
        subcategoryId: 15,
        filterKeywords: ['dominio', 'rango', 'evaluacion', 'composición', 'inversa', 'racional'],
        behavior: 'quiz_list'
    }
];
