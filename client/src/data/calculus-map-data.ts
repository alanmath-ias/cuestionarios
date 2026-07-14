import { ArithmeticNode } from './arithmetic-map-data.js';

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

    // HIJOS directos de Funciones: Polinómicas, Exp y Log
    {
        id: 'c0-polinomicas',
        label: 'Polinómicas',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Lineales, Cuadráticas, Racionales...',
        xOffset: -30,
        subcategoryId: 442, // Polinómicas - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-explog',
        label: 'Exp y Log',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Crecimiento y logaritmos.',
        xOffset: 30,
        subcategoryId: 104, // Funciones Exponenciales y Logarítmicas
        behavior: 'quiz_list'
    },

    // NIETOS de Funciones: Trigonométricas, Radicales, Composición
    {
        id: 'c0-trigo',
        label: 'Trigonométricas',
        level: 2,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Funciones circulares.',
        xOffset: -60,
        subcategoryId: 102, // Funciones Trigonométricas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-radicales',
        label: 'Radicales',
        level: 2,
        type: 'basic',
        requires: ['c0-polinomicas'],
        description: 'Funciones con raíces.',
        xOffset: 0,
        subcategoryId: 480, // Radicales - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-composicion',
        label: 'Composición',
        level: 2,
        type: 'basic',
        requires: ['c0-polinomicas', 'c0-explog'],
        description: 'f(g(x))',
        xOffset: 60,
        subcategoryId: 443, // Composición - Funciones
        behavior: 'quiz_list'
    },

    // BISNIETOS: Inversas, Transformaciones, Dominio y Rango, Miscelánea
    {
        id: 'c0-inversas',
        label: 'Inversas',
        level: 3,
        type: 'basic',
        requires: ['c0-trigo'],
        description: 'f^-1(x)',
        xOffset: -90,
        subcategoryId: 103, // Funciones Inversas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-transformaciones',
        label: 'Transformaciones',
        level: 3,
        type: 'critical',
        requires: ['c0-radicales', 'c0-composicion'],
        description: 'Desplazamientos y reflexiones.',
        xOffset: -30,
        subcategoryId: 481, // Transformaciones - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-dom-rango',
        label: 'Dominio y Rango',
        level: 3,
        type: 'critical',
        requires: ['c0-composicion', 'c0-inversas'],
        description: 'Análisis completo.',
        xOffset: 30,
        subcategoryId: 444, // Dominio y Rango - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-miscelanea-funciones',
        label: 'Miscelánea Funciones',
        level: 3,
        type: 'basic',
        requires: ['c0-dom-rango'],
        description: 'Repaso general y miscelánea de funciones.',
        xOffset: 90,
        subcategoryId: 441, // Miscelánea Funciones - Funciones
        additionalSubcategories: [100], // Repaso de Funciones
        behavior: 'quiz_list'
    },

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
        subcategoryId: 105, // Introducción a los Límites
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
        subcategoryId: 108, // Definición Precisa de un Límite
        behavior: 'quiz_list'
    },
    {
        id: 'c1-algebraico',
        label: 'Cálculo Algebraico',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Leyes y técnicas.',
        xOffset: -20,
        subcategoryId: 106, // Leyes de los Límites
        behavior: 'quiz_list'
    },
    {
        id: 'c1-laterales',
        label: 'Límites Laterales',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Límites por izquierda y derecha.',
        xOffset: 20,
        subcategoryId: 484, // Límites Laterales
        behavior: 'quiz_list'
    },
    {
        id: 'c1-infinitos',
        label: 'Límites al Infinito',
        level: 5,
        type: 'basic',
        requires: ['c1-limites-intro'],
        description: 'Comportamiento en los extremos.',
        xOffset: 60,
        subcategoryId: 117, // Límites al Infinito y Asíntotas
        behavior: 'quiz_list'
    },
    {
        id: 'c1-asintotas',
        label: 'Asíntotas',
        level: 6,
        type: 'critical',
        requires: ['c1-infinitos'],
        description: 'Verticales, Horizontales y Oblicuas.',
        xOffset: -40,
        subcategoryId: 479, // Asíntotas
        behavior: 'quiz_list'
    },
    {
        id: 'c1-limites-trig-esp',
        label: 'Límites Trigonométricos',
        level: 6,
        type: 'basic',
        requires: ['c1-algebraico'],
        description: 'Especiales y emparedado.',
        xOffset: 40,
        subcategoryId: 485, // Límites Trigonométricos
        behavior: 'quiz_list'
    },

    // BRIDGE TO CONTINUITY
    {
        id: 'c1-2-continuidad',
        label: 'Continuidad',
        level: 7, // Increment level since Asíntotas is level 6
        type: 'critical',
        requires: ['c1-def-formal', 'c1-algebraico', 'c1-laterales', 'c1-asintotas', 'c1-limites-trig-esp'],
        description: 'Puente a Derivadas.',
        xOffset: 0,
        subcategoryId: 107, // Continuidad
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C2: DERIVADAS
    // ==========================================
    {
        id: 'c2-derivadas',
        label: 'Derivadas',
        level: 8,
        type: 'critical',
        requires: ['c1-2-continuidad'],
        description: 'Cálculo Diferencial.',
        xOffset: 0,
        subcategoryId: 111, // Reglas de Diferenciación (container aggregate)
        behavior: 'container'
    },

    // LEVEL 1: Definición, Nociones, Diferenciabilidad
    {
        id: 'c3-derivada-origen',
        label: 'Definición Derivada',
        level: 9,
        type: 'basic',
        requires: ['c2-derivadas'],
        description: 'Tasa Instantánea.',
        xOffset: -60,
        subcategoryId: 109, // Definición de la Derivada
        behavior: 'quiz_list'
    },
    {
        id: 'c2-nociones',
        label: 'Nociones Básicas',
        level: 9,
        type: 'basic',
        requires: ['c2-derivadas'],
        description: 'Concepto.',
        xOffset: 0,
        subcategoryId: 452, // Nociones Básicas - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-diferenciabilidad',
        label: 'Diferenciabilidad',
        level: 9,
        type: 'critical',
        requires: ['c3-derivada-origen'],
        description: 'Esquinas, cúspides y continuidad.',
        xOffset: 60,
        subcategoryId: 486, // Diferenciabilidad
        behavior: 'quiz_list'
    },

    // LEVEL 2: Reglas/Potencias, Trigonométricas, Exp y Log, Inv / Trig Inv
    {
        id: 'c2-reglas',
        label: 'Reglas Básicas',
        level: 10,
        type: 'basic',
        requires: ['c2-nociones'],
        description: 'Potencia, Producto, Cociente.',
        xOffset: -90,
        subcategoryId: 445, // Reglas Básicas - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-trigo',
        label: 'Trigonométricas',
        level: 10,
        type: 'basic',
        requires: ['c2-reglas'],
        description: 'Sen, Cos, Tan...',
        xOffset: -30,
        subcategoryId: 446, // Trigonométricas - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-explog',
        label: 'Exp y Log',
        level: 10,
        type: 'basic',
        requires: ['c2-reglas'],
        description: 'e^x, ln(x).',
        xOffset: 30,
        subcategoryId: 448, // Exp y Log - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-inversas',
        label: 'Inv / Trig Inv',
        level: 10,
        type: 'applied',
        requires: ['c2-trigo'],
        description: 'Arcoseno...',
        xOffset: 90,
        subcategoryId: 449, // Inv / Trig Inv - Derivadas (NEW)
        behavior: 'quiz_list'
    },

    // LEVEL 3: Dif. Implícita, Regla de la Cadena, Hiperbólicas
    {
        id: 'c2-implicita',
        label: 'Dif. Implícita',
        level: 11,
        type: 'applied',
        requires: ['c2-cadena'],
        description: 'dy/dx.',
        xOffset: -60,
        subcategoryId: 451, // Dif. Implícita - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-cadena',
        label: 'Regla Cadena',
        level: 11,
        type: 'critical',
        requires: ['c2-reglas'],
        description: 'Composición f(g(x)).',
        xOffset: 0,
        subcategoryId: 447, // Regla Cadena - Derivadas (NEW)
        behavior: 'quiz_list'
    },
    {
        id: 'c2-hiper',
        label: 'Hiperbólicas',
        level: 11,
        type: 'applied',
        requires: ['c2-explog', 'c2-cadena'],
        description: 'sinh, cosh.',
        xOffset: 60,
        subcategoryId: 450, // Hiperbólicas - Derivadas (NEW)
        behavior: 'quiz_list'
    },

    // LEVEL 4 (ÚLTIMO): Orden Superior, Dif. Logarítmica
    {
        id: 'c2-orden-superior',
        label: 'Orden Superior',
        level: 12,
        type: 'basic',
        requires: ['c2-cadena'],
        description: 'Derivadas sucesivas.',
        xOffset: -30,
        subcategoryId: 487, // Derivadas Orden Superior
        behavior: 'quiz_list'
    },
    {
        id: 'c2-dif-logaritmica',
        label: 'Dif. Logarítmica',
        level: 12,
        type: 'applied',
        requires: ['c2-implicita', 'c2-explog'],
        description: 'Derivación de f(x)^g(x).',
        xOffset: 30,
        subcategoryId: 488, // Dif. Logarítmica
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C3: APLICACIONES (SHIFTED DOWN BY 1 LEVEL)
    // ==========================================
    {
        id: 'c3-aplicaciones',
        label: 'Aplicaciones',
        level: 13,
        type: 'critical',
        requires: [],
        description: 'Uso de la derivada.',
        xOffset: 0,
        behavior: 'container'
    },

    // LEVEL 1: Tasas, Valor Medio, Aprox
    {
        id: 'c3-tasas',
        label: 'Tasas Relacionadas',
        level: 14,
        type: 'applied',
        requires: ['c3-aplicaciones'],
        description: 'Cambio temporal.',
        xOffset: -60,
        subcategoryId: 112, // Tasas Relacionadas
        behavior: 'quiz_list'
    },
    {
        id: 'c6-2-valor-medio',
        label: 'Valor Medio',
        level: 14,
        type: 'basic',
        requires: ['c3-aplicaciones'],
        description: 'Teorema Rolle.',
        xOffset: 0,
        subcategoryId: 115, // Teorema del Valor Medio
        behavior: 'quiz_list'
    },
    {
        id: 'c3-aprox',
        label: 'Aprox Lineal',
        level: 14,
        type: 'applied',
        requires: ['c3-aplicaciones'],
        description: 'Diferenciales.',
        xOffset: 60,
        subcategoryId: 113, // Aproximación Lineal y Diferenciales
        behavior: 'quiz_list'
    },

    // LEVEL 2: Criterios, MaxMin
    {
        id: 'c3-criterios',
        label: 'Criterios 1ra/2da',
        level: 15,
        type: 'critical',
        requires: ['c3-tasas', 'c6-2-valor-medio', 'c3-aprox'],
        description: 'Análisis gráfico.',
        xOffset: -30,
        subcategoryId: 116, // Derivadas y Formas de Gráficas
        behavior: 'quiz_list'
    },
    {
        id: 'c3-maxmin',
        label: 'Máximos y Mínimos',
        level: 15,
        type: 'basic',
        requires: ['c3-tasas', 'c6-2-valor-medio', 'c3-aprox'],
        description: 'Extremos.',
        xOffset: 30,
        subcategoryId: 114, // Máximos y Mínimos
        behavior: 'quiz_list'
    },

    // LEVEL 3: Optimización
    {
        id: 'c3-optimizacion',
        label: 'Optimización',
        level: 16,
        type: 'applied',
        requires: ['c3-criterios', 'c3-maxmin'],
        description: 'Problemas reales.',
        xOffset: 0,
        subcategoryId: 118, // Problemas de Optimización
        behavior: 'quiz_list'
    },

    // LEVEL 4: L'Hopital, Newton
    {
        id: 'c3-lhopital',
        label: 'Regla L\'Hôpital',
        level: 17,
        type: 'evaluation',
        requires: ['c3-criterios'],
        description: 'Indeterminaciones.',
        xOffset: -40,
        subcategoryId: 119, // Regla de L'Hôpital
        behavior: 'quiz_list'
    },
    {
        id: 'c3-newton',
        label: 'Método Newton',
        level: 17,
        type: 'applied',
        requires: ['c3-optimizacion'],
        description: 'Raíces.',
        xOffset: 40,
        subcategoryId: 120, // Método de Newton
        behavior: 'quiz_list'
    },
    {
        id: 'c-mastery',
        label: 'Maestría en Cálculo',
        level: 18,
        type: 'evaluation',
        requires: ['c3-lhopital', 'c3-newton'],
        description: 'El desafío definitivo de todo el módulo.',
        xOffset: 0,
        subcategoryId: 119,
        behavior: 'quiz_list'
    }
];
