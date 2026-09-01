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
        id: 'c0-fundamentos',
        label: 'Fundamentos de Funciones',
        level: 1,
        type: 'basic',
        requires: ['c0-funciones'],
        description: 'Conceptos y fundamentos de funciones.',
        xOffset: 0,
        subcategoryId: 499,
        behavior: 'quiz_list'
    },
    {
        id: 'c0-polinomicas',
        label: 'Polinómicas',
        level: 2,
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
        level: 2,
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
        level: 3,
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
        level: 3,
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
        level: 3,
        type: 'basic',
        requires: ['c0-polinomicas', 'c0-explog'],
        description: 'f(g(x))',
        xOffset: 60,
        subcategoryId: 443, // Composición - Funciones
        behavior: 'quiz_list'
    },

    // LEVEL 3: Inversas y Transformaciones (Centrados)
    {
        id: 'c0-inversas',
        label: 'Inversas',
        level: 4,
        type: 'basic',
        requires: ['c0-trigo'],
        description: 'f^-1(x)',
        xOffset: -30,
        subcategoryId: 103, // Funciones Inversas
        behavior: 'quiz_list'
    },
    {
        id: 'c0-transformaciones',
        label: 'Transformaciones',
        level: 4,
        type: 'critical',
        requires: ['c0-radicales', 'c0-composicion'],
        description: 'Desplazamientos y reflexiones.',
        xOffset: 30,
        subcategoryId: 481, // Transformaciones - Funciones
        behavior: 'quiz_list'
    },

    // LEVEL 4: Simetría, Dominio y Rango, Miscelánea Funciones
    {
        id: 'c0-simetria',
        label: 'Simetría (Par/Impar)',
        level: 5,
        type: 'basic',
        requires: ['c0-transformaciones'],
        description: 'Funciones pares e impares.',
        xOffset: -50,
        subcategoryId: 489, // Simetría - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-dom-rango',
        label: 'Dominio y Rango',
        level: 5,
        type: 'critical',
        requires: ['c0-composicion', 'c0-inversas'],
        description: 'Análisis completo.',
        xOffset: 0,
        subcategoryId: 444, // Dominio y Rango - Funciones
        behavior: 'quiz_list'
    },
    {
        id: 'c0-miscelanea-funciones',
        label: 'Miscelánea Funciones',
        level: 5,
        type: 'basic',
        requires: ['c0-dom-rango'],
        description: 'Repaso general y miscelánea de funciones.',
        xOffset: 50,
        subcategoryId: 441, // Miscelánea Funciones - Funciones
        additionalSubcategories: [100], // Repaso de Funciones
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C1: LÍMITES (DESPLAZADO AL NIVEL 5)
    // ==========================================
    {
        id: 'c1-limites-intro',
        label: 'Límites',
        level: 6,
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
        level: 7,
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
        level: 7,
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
        level: 7,
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
        level: 7,
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
        level: 8,
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
        level: 8,
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
        level: 9,
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
        level: 10,
        type: 'critical',
        requires: ['c1-2-continuidad'],
        description: 'Cálculo Diferencial.',
        xOffset: 0,
        subcategoryId: 111, // Reglas de Diferenciación (container aggregate)
        behavior: 'container'
    },

    // LEVEL 10: Definición, Nociones, Diferenciabilidad
    {
        id: 'c3-derivada-origen',
        label: 'Definición Derivada',
        level: 11,
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
        level: 11,
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
        level: 11,
        type: 'critical',
        requires: ['c3-derivada-origen'],
        description: 'Esquinas, cúspides y continuidad.',
        xOffset: 60,
        subcategoryId: 486, // Diferenciabilidad
        behavior: 'quiz_list'
    },

    // LEVEL 11: Reglas/Potencias, Trigonométricas, Exp y Log, Inv / Trig Inv
    {
        id: 'c2-reglas',
        label: 'Reglas Básicas',
        level: 12,
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
        level: 12,
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
        level: 12,
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
        level: 12,
        type: 'applied',
        requires: ['c2-trigo'],
        description: 'Arcoseno...',
        xOffset: 90,
        subcategoryId: 449, // Inv / Trig Inv - Derivadas (NEW)
        behavior: 'quiz_list'
    },

    // LEVEL 12: Dif. Implícita, Regla de la Cadena, Hiperbólicas
    {
        id: 'c2-implicita',
        label: 'Dif. Implícita',
        level: 13,
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
        level: 13,
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
        level: 13,
        type: 'applied',
        requires: ['c2-explog', 'c2-cadena'],
        description: 'sinh, cosh.',
        xOffset: 60,
        subcategoryId: 450, // Hiperbólicas - Derivadas (NEW)
        behavior: 'quiz_list'
    },

    // LEVEL 13: Orden Superior, Dif. Logarítmica
    {
        id: 'c2-orden-superior',
        label: 'Orden Superior',
        level: 14,
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
        level: 14,
        type: 'applied',
        requires: ['c2-implicita', 'c2-explog'],
        description: 'Derivación de f(x)^g(x).',
        xOffset: 30,
        subcategoryId: 488, // Dif. Logarítmica
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL C3: APLICACIONES
    // ==========================================
    {
        id: 'c3-aplicaciones',
        label: 'Aplicaciones',
        level: 15,
        type: 'critical',
        requires: [],
        description: 'Uso de la derivada.',
        xOffset: 0,
        behavior: 'container'
    },

    // LEVEL 15: Tasas, Valor Medio, Aprox
    {
        id: 'c3-tasas',
        label: 'Tasas Relacionadas',
        level: 16,
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
        level: 16,
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
        level: 16,
        type: 'applied',
        requires: ['c3-aplicaciones'],
        description: 'Diferenciales.',
        xOffset: 60,
        subcategoryId: 113, // Aproximación Lineal y Diferenciales
        behavior: 'quiz_list'
    },

    // LEVEL 16: Criterios, MaxMin
    {
        id: 'c3-criterios',
        label: 'Criterios 1ra/2da',
        level: 17,
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
        level: 17,
        type: 'basic',
        requires: ['c3-tasas', 'c6-2-valor-medio', 'c3-aprox'],
        description: 'Extremos.',
        xOffset: 30,
        subcategoryId: 114, // Máximos y Mínimos
        behavior: 'quiz_list'
    },

    // LEVEL 17: Trazado de Curvas
    {
        id: 'c3-trazado-curvas',
        label: 'Trazado de Curvas',
        level: 18,
        type: 'critical',
        requires: ['c3-criterios', 'c3-maxmin'],
        description: 'Análisis cualitativo y gráfico.',
        xOffset: 0,
        subcategoryId: 490, // Trazado de Curvas - Aplicaciones Derivadas
        behavior: 'quiz_list'
    },

    // LEVEL 18: Optimización
    {
        id: 'c3-optimizacion',
        label: 'Optimización',
        level: 19,
        type: 'applied',
        requires: ['c3-trazado-curvas'],
        description: 'Problemas reales.',
        xOffset: 0,
        subcategoryId: 118, // Problemas de Optimización
        behavior: 'quiz_list'
    },

    // LEVEL 19: L'Hopital, Newton
    {
        id: 'c3-lhopital',
        label: 'Regla L\'Hôpital',
        level: 20,
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
        level: 20,
        type: 'applied',
        requires: ['c3-optimizacion'],
        description: 'Raíces.',
        xOffset: 40,
        subcategoryId: 120, // Método de Newton
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL CP: COORDENADAS POLARES
    // Prerequisitos: Funciones Trigonométricas + Diferenciación Implícita
    // ==========================================
    {
        id: 'cp-polares',
        label: 'Coordenadas Polares',
        level: 21,
        type: 'applied',
        requires: ['c0-trigo', 'c2-implicita'],
        description: 'Sistema de referencia polar y su cálculo.',
        xOffset: 0,
        subcategoryId: 505,
        behavior: 'container'
    },

    // ── Nivel 1 del árbol polar: Fundamentos de representación ──
    {
        id: 'cp-conversion',
        label: 'Conversión Cart.↔Polar',
        level: 22,
        type: 'basic',
        requires: ['cp-polares'],
        description: 'r, θ, x=r cosθ, y=r sinθ.',
        xOffset: -60,
        subcategoryId: 506,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-curvas',
        label: 'Curvas Polares',
        level: 22,
        type: 'basic',
        requires: ['cp-polares'],
        description: 'Graficación y trazado en el plano polar.',
        xOffset: 0,
        subcategoryId: 507,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-simetria',
        label: 'Simetría Polar',
        level: 22,
        type: 'basic',
        requires: ['cp-polares'],
        description: 'Simetría respecto a ejes y polo.',
        xOffset: 60,
        subcategoryId: 508,
        behavior: 'quiz_list'
    },

    // ── Nivel 2: Curvas especiales ──
    {
        id: 'cp-curvas-especiales',
        label: 'Curvas Especiales',
        level: 23,
        type: 'applied',
        requires: ['cp-curvas', 'cp-simetria'],
        description: 'Cardioide, limaçon, rosa, lemniscata, espiral.',
        xOffset: -30,
        subcategoryId: 515,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-interseccion',
        label: 'Intersección de Curvas',
        level: 23,
        type: 'applied',
        requires: ['cp-curvas', 'cp-conversion'],
        description: 'Puntos de intersección entre curvas polares.',
        xOffset: 30,
        subcategoryId: 516,
        behavior: 'quiz_list'
    },

    // ── Nivel 3: Límites y Continuidad en polares ──
    {
        id: 'cp-limites',
        label: 'Límites en Polares',
        level: 24,
        type: 'critical',
        requires: ['cp-curvas-especiales'],
        description: 'lim(r,θ)→(r₀,θ₀) f(r,θ).',
        xOffset: -40,
        subcategoryId: 509,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-continuidad',
        label: 'Continuidad en Polares',
        level: 24,
        type: 'critical',
        requires: ['cp-limites'],
        description: 'Análisis de continuidad de funciones polares.',
        xOffset: 40,
        subcategoryId: 510,
        behavior: 'quiz_list'
    },

    // ── Nivel 4: Derivadas en polares ──
    {
        id: 'cp-derivadas',
        label: 'Derivadas en Polares',
        level: 25,
        type: 'critical',
        requires: ['cp-continuidad', 'cp-interseccion'],
        description: 'dy/dx en curvas polares, dr/dθ.',
        xOffset: -40,
        subcategoryId: 511,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-tangentes',
        label: 'Tangentes y Normales',
        level: 25,
        type: 'applied',
        requires: ['cp-derivadas'],
        description: 'Rectas tangentes y normales a curvas polares.',
        xOffset: 40,
        subcategoryId: 512,
        behavior: 'quiz_list'
    },

    // ── Nivel 5: Aplicaciones geométricas ──
    {
        id: 'cp-longitud-arco',
        label: 'Longitud de Arco',
        level: 26,
        type: 'applied',
        requires: ['cp-derivadas'],
        description: 'L = ∫√(r² + (dr/dθ)²) dθ.',
        xOffset: -50,
        subcategoryId: 513,
        behavior: 'quiz_list'
    },
    {
        id: 'cp-area',
        label: 'Área de Regiones Polares',
        level: 26,
        type: 'applied',
        requires: ['cp-derivadas'],
        description: 'A = ½∫r² dθ. Puente a Cálculo Integral.',
        xOffset: 0,
        subcategoryId: 514,
        behavior: 'quiz_list'
    },

    // ── Nivel 6: Aplicaciones físicas e ingeniería ──
    {
        id: 'cp-aplicaciones',
        label: 'Aplicaciones Físicas',
        level: 27,
        type: 'evaluation',
        requires: ['cp-longitud-arco', 'cp-area', 'cp-tangentes'],
        description: 'Órbitas, fuerzas, movimiento angular.',
        xOffset: 0,
        subcategoryId: 517,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL FINAL: MAESTRÍA — Nodo independiente
    // ==========================================
    {
        id: 'c-mastery',
        label: 'Maestría en Cálculo',
        level: 28,
        type: 'evaluation',
        requires: [],
        description: 'El desafío definitivo de todo el módulo.',
        xOffset: 0,
        subcategoryId: 119,
        behavior: 'quiz_list'
    },
];
