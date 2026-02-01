
import { ArithmeticNode } from './arithmetic-map-data';

export const calculusMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL C0: PRE-CÁLCULO FUNCIONAL
    // ==========================================
    // "Pre-Cálculo" parent node. All C0 nodes must behave as children of this block logically.
    {
        id: 'c0-transicion',
        label: 'Pre-Cálculo',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos esenciales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'c0-1-repaso',
        label: 'Funciones',
        level: 1,
        type: 'basic',
        requires: ['c0-transicion'],
        description: 'Dominio, Rango y Gráficas.',
        xOffset: -60,
        subcategoryId: 100, // Repaso de Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-2-clases',
        label: 'Clases Básicas',
        level: 1,
        type: 'basic',
        requires: ['c0-transicion'],
        description: 'Polinómicas, Racionales.',
        xOffset: -20,
        subcategoryId: 101, // Clases Básicas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-3-trigo',
        label: 'Trigonometría',
        level: 1,
        type: 'basic',
        requires: ['c0-transicion'], // Direct child for highlighting
        description: 'Funciones circulares.',
        xOffset: 20,
        subcategoryId: 102, // Funciones Trigonométricas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-4-inversas',
        label: 'Inversas',
        level: 2,
        type: 'basic',
        requires: ['c0-transicion'], // Direct child for highlighting
        description: 'Inyectividad y reflejos.',
        xOffset: -40,
        subcategoryId: 103, // Funciones Inversas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-5-explog',
        label: 'Exp y Log',
        level: 2,
        type: 'basic',
        requires: ['c0-transicion'], // Direct child for highlighting
        description: 'Crecimiento y logaritmos.',
        xOffset: 40,
        subcategoryId: 104, // Exponenciales y Logarítmicas
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C1: LÍMITES
    // ==========================================
    {
        id: 'c1-limites-intro',
        label: 'Límites',
        level: 3,
        type: 'critical',
        requires: ['c0-4-inversas', 'c0-5-explog'], // Gatekeepers from C0
        description: 'Comportamiento local.',
        xOffset: 0,
        subcategoryId: 105, // Introducción a los Límites
        behavior: 'quiz_list'
    },
    {
        id: 'c1-1-leyes',
        label: 'Leyes Límites',
        level: 4,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Álgebra de límites.',
        xOffset: -40,
        subcategoryId: 106, // Leyes de los Límites
        behavior: 'quiz_list'
    },
    {
        id: 'c1-2-continuidad',
        label: 'Continuidad',
        level: 4,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Sin saltos ni huecos.',
        xOffset: 40,
        subcategoryId: 107, // Continuidad
        behavior: 'quiz_list'
    },
    // Added back as minor node to ensure coverage (Quiz 107)
    {
        id: 'c1-x-formal',
        label: 'Def. Formal',
        level: 4,
        type: 'basic',
        requires: ['c1-2-continuidad'],
        description: 'Epsilon-Delta (Opcional).',
        xOffset: 40,
        subcategoryId: 108, // Definición Precisa
        behavior: 'quiz_list'
    },
    {
        id: 'c1-3-infinito',
        label: 'Al Infinito',
        level: 5,
        type: 'applied',
        requires: ['c1-1-leyes'],
        description: 'Asíntotas horizontales.',
        xOffset: 0,
        subcategoryId: 117, // Límites al Infinito y Asíntotas
        behavior: 'quiz_list'
    },

    // Removed c2-formal as requested

    // ==========================================
    // NIVEL C3: ORIGEN DE LA DERIVADA
    // ==========================================
    {
        id: 'c3-derivada-origen',
        label: 'Definición Derivada',
        level: 6,
        type: 'critical',
        requires: ['c1-2-continuidad'], // Connects from Continuity
        description: 'Pendiente tangente.',
        xOffset: -30,
        subcategoryId: 109, // Definición de la Derivada
        behavior: 'quiz_list'
    },
    {
        id: 'c3-1-funcion',
        label: 'Función Derivada',
        level: 6,
        type: 'basic',
        requires: ['c1-3-infinito'],
        description: 'f\'(x) como función.',
        xOffset: 30,
        subcategoryId: 110, // La Derivada como Función
        behavior: 'quiz_list'
    },
    {
        id: 'c3-2-aprox',
        label: 'Aproximación Lineal',
        level: 7,
        type: 'applied',
        requires: ['c3-derivada-origen'],
        description: 'Diferenciales.',
        xOffset: 0,
        subcategoryId: 113, // Aproximación Lineal
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C4: DERIVADAS (Detailed Breakdown)
    // ==========================================
    {
        id: 'c4-reglas',
        label: 'Derivadas', // Renamed from Técnicas Derivación
        level: 8,
        type: 'critical',
        requires: ['c3-1-funcion', 'c3-derivada-origen'],
        description: 'Dominio de reglas.',
        xOffset: 0,
        // Removed subcategoryId: 111 to prevent this container from "stealing" the quizzes.
        // The children below will capture them via specific keywords.
        behavior: 'container'
    },

    // BREAKDOWN OF SUBCATEGORY 111 (7 Quizzes)
    {
        id: 'c4-1-basicas',
        label: 'Reglas Básicas',
        level: 9,
        type: 'basic',
        requires: ['c4-reglas'],
        description: 'Potencia, Producto, Cociente.',
        xOffset: -60,
        subcategoryId: 111,
        filterKeywords: ['potencia', 'producto', 'cociente'], // Matches Q110
        behavior: 'quiz_list'
    },
    {
        id: 'c4-2-trigo',
        label: 'Trigonométricas',
        level: 9,
        type: 'basic',
        requires: ['c4-reglas'],
        description: 'Sen, Cos, Tan...',
        xOffset: -20,
        subcategoryId: 111,
        filterKeywords: ['trigonometricas', 'trigonométricas'], // Matches Q111
        behavior: 'quiz_list'
    },
    {
        id: 'c4-3-cadena',
        label: 'Regla Cadena',
        level: 9,
        type: 'critical',
        requires: ['c4-reglas'],
        description: 'Composición f(g(x)).',
        xOffset: 20,
        subcategoryId: 111,
        filterKeywords: ['cadena'], // Matches Q112
        behavior: 'quiz_list'
    },
    {
        id: 'c4-4-inversas',
        label: 'Inversas/Trig Inv',
        level: 9,
        type: 'applied',
        requires: ['c4-reglas'],
        description: 'Arcoseno, Arcocoseno...',
        xOffset: 60,
        subcategoryId: 111,
        filterKeywords: ['inversas'], // Matches Q113 ("Funciones Inversas y Trigonométricas Inversas")
        behavior: 'quiz_list'
    },
    {
        id: 'c4-5-implicita',
        label: 'Implícita',
        level: 10,
        type: 'applied',
        requires: ['c4-3-cadena'],
        description: 'dy/dx en mezclas.',
        xOffset: -40,
        subcategoryId: 111,
        filterKeywords: ['implicita', 'implícita'], // Matches Q114
        behavior: 'quiz_list'
    },
    {
        id: 'c4-6-trans',
        label: 'Exp y Log (Deriv)',
        level: 10,
        type: 'basic',
        requires: ['c4-3-cadena'],
        description: 'e^x, ln(x).',
        xOffset: 0,
        subcategoryId: 111,
        filterKeywords: ['exponenciales', 'logaritmicas', 'logarítmicas'], // Matches Q115
        behavior: 'quiz_list'
    },
    {
        id: 'c4-7-hiper',
        label: 'Hiperbólicas',
        level: 10,
        type: 'applied',
        requires: ['c4-6-trans'],
        description: 'sinh, cosh.',
        xOffset: 40,
        subcategoryId: 111,
        filterKeywords: ['hiperbolicas', 'hiperbólicas'], // Matches Q116
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C5: GRÁFICAS
    // ==========================================
    {
        id: 'c5-graficas',
        label: 'Gráficas',
        level: 11,
        type: 'applied',
        requires: ['c4-5-implicita'],
        description: 'Forma y Derivada.',
        xOffset: 0,
        subcategoryId: 116,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C6: APLICACIONES
    // ==========================================
    {
        id: 'c6-aplicaciones',
        label: 'Aplicaciones',
        level: 12,
        type: 'applied',
        requires: ['c5-graficas'],
        description: 'Uso real.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'c6-1-minmax',
        label: 'Máx y Mín',
        level: 13,
        type: 'basic',
        requires: ['c6-aplicaciones'],
        description: 'Extremos.',
        xOffset: -40,
        subcategoryId: 114,
        behavior: 'quiz_list'
    },
    {
        id: 'c6-2-valor-medio',
        label: 'Valor Medio',
        level: 13,
        type: 'basic',
        requires: ['c6-aplicaciones'],
        description: 'Teorema Rolle.',
        xOffset: 0,
        subcategoryId: 115,
        behavior: 'quiz_list'
    },
    {
        id: 'c6-3-optimizacion',
        label: 'Optimización',
        level: 13,
        type: 'critical',
        requires: ['c6-aplicaciones'],
        description: 'Problemas reales.',
        xOffset: 40,
        subcategoryId: 118,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C7: DINÁMICAS
    // ==========================================
    {
        id: 'c7-dinamicas',
        label: 'Dinámicas',
        level: 14,
        type: 'applied',
        requires: ['c6-3-optimizacion'],
        description: 'Cambio con tiempo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'c7-1-tasas',
        label: 'Tasas Relac.',
        level: 15,
        type: 'applied',
        requires: ['c7-dinamicas'],
        description: 'Variables conectadas.',
        xOffset: -30,
        subcategoryId: 112,
        behavior: 'quiz_list'
    },
    {
        id: 'c7-2-newton',
        label: 'Método Newton',
        level: 15,
        type: 'applied',
        requires: ['c7-dinamicas'],
        description: 'Raíces numéricas.',
        xOffset: 30,
        subcategoryId: 120,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C8: CASOS ESPECIALES
    // ==========================================
    {
        id: 'c8-lhopital',
        label: 'L\'Hôpital',
        level: 16,
        type: 'evaluation',
        requires: ['c7-1-tasas'],
        description: 'Indeterminaciones.',
        xOffset: 0,
        subcategoryId: 119,
        behavior: 'quiz_list'
    }
];
