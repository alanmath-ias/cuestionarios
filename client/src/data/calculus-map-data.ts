
import { ArithmeticNode } from './arithmetic-map-data';

export const calculusMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL C0: FUNCIONES (Antiguo Pre-Cálculo)
    // ==========================================
    {
        id: 'c0-funciones',
        label: 'Funciones',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos esenciales.',
        xOffset: 0,
        behavior: 'container'
    },

    // HIJOS directos de Funciones: Polinómicas, Exp y Log, Trigonométricas
    {
        id: 'c0-polinomicas',
        label: 'Polinómicas',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Lineales, Cuadráticas, Racionales...',
        xOffset: -60,
        subcategoryId: 100, // Funciones (General) - FIXED
        filterKeywords: ['lineal', 'cuadra', 'polinomio', 'polin', 'basica', 'básica', 'racional', 'traslacion', 'repaso', 'cuadráticas', 'cuadratica'],
        behavior: 'quiz_list'
    },
    {
        id: 'c0-explog',
        label: 'Exp y Log',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Crecimiento y logaritmos.',
        xOffset: 0,
        subcategoryId: 104,
        additionalSubcategories: [100], // Search mainly in 104, but also check 100
        behavior: 'quiz_list'
    },
    {
        id: 'c0-trigo',
        label: 'Trigonométricas',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Funciones circulares.',
        xOffset: 60,
        subcategoryId: 102,
        additionalSubcategories: [100], // Search 102 + 100
        behavior: 'quiz_list'
    },

    // NIETOS de Funciones: Inversas, Composición
    {
        id: 'c0-composicion',
        label: 'Composición',
        level: 2,
        type: 'basic',
        requires: ['c0-polinomicas', 'c0-explog'],
        description: 'f(g(x))',
        xOffset: -20,
        subcategoryId: 100,
        filterKeywords: ['composición', 'composicion'],
        behavior: 'quiz_list'
    },
    {
        id: 'c0-inversas',
        label: 'Inversas',
        level: 2,
        type: 'basic',
        requires: ['c0-trigo'],
        description: 'f^-1(x)',
        xOffset: 40,
        subcategoryId: 103, // Specific subcategory for Inverse Functions
        additionalSubcategories: [100], // Search 103 + 100 for general review items
        filterKeywords: ['inversa'],
        behavior: 'quiz_list'
    },

    // BISNIETO: Dominio y Rango
    {
        id: 'c0-dom-rango',
        label: 'Dominio y Rango',
        level: 3,
        type: 'critical', // Final step of C0
        requires: ['c0-composicion', 'c0-inversas'], // Convergence
        description: 'Análisis completo.',
        xOffset: 0,
        subcategoryId: 100,
        filterKeywords: ['dominio', 'rango'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C1: LÍMITES
    // ==========================================
    // ==========================================
    // NIVEL C1: LÍMITES
    // ==========================================
    {
        id: 'c1-limites-intro',
        label: 'Límites',
        level: 4,
        type: 'critical',
        requires: ['c0-dom-rango'],
        description: 'Fundamento del Cálculo.',
        xOffset: 0,
        subcategoryId: 105,
        behavior: 'container'
    },
    // HIJOS DE LÍMITES
    {
        id: 'c1-def-formal',
        label: 'Def. Formal',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Epsilon-Delta.',
        xOffset: -60,
        subcategoryId: 108,
        filterKeywords: ['formal', 'definición', 'epsilon'],
        behavior: 'quiz_list'
    },
    {
        id: 'c1-algebraico', // Previously 'c1-1-leyes'
        label: 'Cálculo Algebraico',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Leyes y técnicas.',
        xOffset: 0,
        subcategoryId: 106,
        filterKeywords: ['algebraico', 'leyes', 'calculo'],
        behavior: 'quiz_list'
    },
    {
        id: 'c1-infinitos',
        label: 'Límites Infin/Asíntotas',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Asíntotas.',
        xOffset: 60,
        subcategoryId: 117, // Fallback to 117 as 122 might be wrong
        filterKeywords: ['infinito', 'asintota', 'asíntota'],
        behavior: 'quiz_list'
    },

    // BRIDGE TO CONTINUITY (Now isolated)
    {
        id: 'c1-2-continuidad',
        label: 'Continuidad',
        level: 6,
        type: 'critical', // Must be critical to stop highlighting
        requires: ['c1-def-formal', 'c1-algebraico', 'c1-infinitos'],
        description: 'Puente a Derivadas.',
        xOffset: 0,
        subcategoryId: 107,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C2: DERIVADAS (New Root)
    // ==========================================
    {
        id: 'c2-derivadas',
        label: 'Derivadas',
        level: 7, // Reduced gap (was 8)
        type: 'critical',
        requires: [],
        description: 'Cálculo Diferencial.',
        xOffset: 0,
        subcategoryId: 111, // Reverted to Cluster ID
        behavior: 'container'
    },

    // LEVEL 1: Derivada Origen, Nociones, Reglas
    {
        id: 'c3-derivada-origen', // Kept ID for compatibility
        label: 'Definición Derivada',
        level: 8,
        type: 'basic',
        requires: ['c2-derivadas'],
        description: 'Tasa Instantánea.',
        xOffset: -50,
        subcategoryId: 109, // Kept specific if it was working, or fallback to 111? Step 349 had 109 for Nociones. 
        // Actually Step 349 had 'Definición Derivada' at 109. I will trust 109 is valid for this specific topic.
        behavior: 'quiz_list'
    },
    {
        id: 'c2-nociones',
        label: 'Nociones Básicas',
        level: 8,
        type: 'basic',
        requires: ['c2-derivadas'],
        description: 'Concepto.',
        xOffset: 0,
        subcategoryId: 109, // Reverted to 109
        behavior: 'quiz_list'
    },
    {
        id: 'c2-reglas',
        label: 'Reglas Básicas',
        level: 8,
        type: 'basic',
        requires: ['c2-derivadas'],
        description: 'Potencia, Producto, Cociente.',
        xOffset: 50,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['potencia', 'producto', 'cociente'],
        behavior: 'quiz_list'
    },

    // LEVEL 2: NIETOS (Trigo, Cadena, Exp/Log)
    {
        id: 'c2-trigo',
        label: 'Trigonométricas',
        level: 9, // Reduced level
        type: 'basic',
        requires: ['c2-reglas'],
        description: 'Sen, Cos, Tan...',
        xOffset: -60,
        subcategoryId: 111, // Reverted to 111
        // Removed 'inversa' related keywords to avoid capturing sub 113
        filterKeywords: ['trigonometricas', 'trigonométrica', 'seno', 'coseno', 'tangente', 'secante', 'cosecante', 'cotangente', 'sen', 'cos', 'tan'],
        behavior: 'quiz_list'
    },
    {
        id: 'c2-cadena',
        label: 'Regla Cadena',
        level: 9,
        type: 'critical',
        requires: ['c2-reglas'],
        description: 'Composición f(g(x)).',
        xOffset: 0,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['cadena', 'compuesta', 'composicion'],
        behavior: 'quiz_list'
    },
    {
        id: 'c2-explog',
        label: 'Exp y Log',
        level: 9,
        type: 'basic',
        requires: ['c2-reglas'],
        description: 'e^x, ln(x).',
        xOffset: 60,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['exponencial', 'logaritmica', 'logaritmo', 'euler', 'ln', 'exp'],
        behavior: 'quiz_list'
    },

    // LEVEL 3: BISNIETOS (Inversas, Hiperbólicas)
    {
        id: 'c2-inversas',
        label: 'Inv / Trig Inv',
        level: 10,
        type: 'applied',
        requires: ['c2-trigo', 'c2-cadena'],
        description: 'Arcoseno...',
        xOffset: -40,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['inversa', 'arc'],
        behavior: 'quiz_list'
    },
    {
        id: 'c2-hiper',
        label: 'Hiperbólicas',
        level: 10,
        type: 'applied',
        requires: ['c2-explog', 'c2-cadena'],
        description: 'sinh, cosh.',
        xOffset: 40,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['hiperbolica', 'hiperbólica', 'sinh', 'cosh', 'tanh'],
        behavior: 'quiz_list'
    },

    // STANDALONE
    {
        id: 'c2-implicita',
        label: 'Dif. Implícita',
        level: 10,
        type: 'applied',
        requires: ['c2-cadena'],
        description: 'dy/dx.',
        xOffset: 0,
        subcategoryId: 111, // Reverted to 111
        filterKeywords: ['implicita', 'implícita'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C3: APLICACIONES (New Root)
    // ==========================================
    {
        id: 'c3-aplicaciones',
        label: 'Aplicaciones',
        level: 11, // Reduced gap (was 13)
        type: 'critical',
        requires: [],
        description: 'Uso de la derivada.',
        xOffset: 0,
        behavior: 'container'
    },

    // LEVEL 1: Tasas, Aprox
    {
        id: 'c3-tasas',
        label: 'Tasas Relacionadas',
        level: 12,
        type: 'applied',
        requires: ['c3-aplicaciones'],
        description: 'Cambio temporal.',
        xOffset: -50,
        subcategoryId: 112, // Reverted to 112
        behavior: 'quiz_list'
    },
    {
        id: 'c3-aprox',
        label: 'Aprox Lineal',
        level: 12,
        type: 'applied',
        requires: ['c3-aplicaciones'],
        description: 'Diferenciales.',
        xOffset: 50,
        subcategoryId: 113, // Reverted to 113
        behavior: 'quiz_list'
    },

    // LEVEL 2: MaxMin, Valor Medio, Criterios, Optimizacion
    {
        id: 'c3-maxmin',
        label: 'Máximos y Mínimos',
        level: 13,
        type: 'basic',
        requires: ['c3-aprox', 'c3-tasas'],
        description: 'Extremos.',
        xOffset: -75,
        subcategoryId: 114, // Reverted to 114
        behavior: 'quiz_list'
    },
    {
        id: 'c6-2-valor-medio', // Re-adding Valor Medio
        label: 'Valor Medio',
        level: 13,
        type: 'basic',
        requires: ['c3-aprox', 'c3-tasas'],
        description: 'Teorema Rolle.',
        xOffset: -25,
        subcategoryId: 115, // Reverted to 115
        behavior: 'quiz_list'
    },
    {
        id: 'c3-criterios',
        label: 'Criterios 1ra/2da',
        level: 13,
        type: 'critical',
        requires: ['c3-aprox', 'c3-tasas'],
        description: 'Análisis gráfico.',
        xOffset: 25,
        subcategoryId: 116, // Reverted to 116
        behavior: 'quiz_list'
    },
    {
        id: 'c3-optimizacion',
        label: 'Optimización',
        level: 13,
        type: 'applied',
        requires: ['c3-aprox', 'c3-tasas'],
        description: 'Problemas reales.',
        xOffset: 75,
        subcategoryId: 118, // Reverted to 118
        behavior: 'quiz_list'
    },

    // LEVEL 3: L'Hopital, Newton
    {
        id: 'c3-lhopital',
        label: 'Regla L\'Hôpital',
        level: 14,
        type: 'evaluation',
        requires: ['c3-criterios'],
        description: 'Indeterminaciones.',
        xOffset: -40,
        subcategoryId: 119, // Reverted to 119
        behavior: 'quiz_list'
    },
    {
        id: 'c3-newton',
        label: 'Método Newton',
        level: 14,
        type: 'applied',
        requires: ['c3-optimizacion'],
        description: 'Raíces.',
        xOffset: 40,
        subcategoryId: 120, // Reverted to 120
        behavior: 'quiz_list'
    }
];
