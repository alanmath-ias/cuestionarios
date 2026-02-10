
export interface ArithmeticNode {
    id: string;
    label: string;
    level: number;
    type: 'basic' | 'critical' | 'evaluation' | 'applied';
    requires: string[];
    subcategoryId?: number; // Maps to existing database subcategory ID if available
    additionalSubcategories?: number[]; // Additional subcategories to include content from
    description?: string;
    xOffset?: number; // Horizontal positioning adjustment (-100 to 100)
    behavior?: 'container' | 'quiz_list';
}

export const arithmeticMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL 0: CLASIFICACIÓN
    // ==========================================
    {
        id: 'n0-clasificacion',
        label: 'Clasificación de los Números',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Mapa general de los conjuntos numéricos.',
        xOffset: 0,
        subcategoryId: 299,
        behavior: 'container'
    },

    // ==========================================
    // NIVEL 1: SISTEMA NUMÉRICO
    // ==========================================
    {
        id: 'n1-naturales',
        label: 'Números Naturales',
        level: 1,
        type: 'basic',
        requires: ['n0-clasificacion'],
        description: 'Los bloques de construcción básicos del conteo.',
        xOffset: 0,
        subcategoryId: 300,
        behavior: 'container'
    },

    // ==========================================
    // NIVEL 1: OPERACIONES BÁSICAS
    // ==========================================
    {
        id: 'n2-suma',
        label: 'Suma y Resta',
        level: 2,
        type: 'basic',
        requires: ['n1-naturales'],
        description: 'Adición y sustracción fundamental.',
        xOffset: 0,
        subcategoryId: 301,
        behavior: 'quiz_list'
    },
    {
        id: 'n2-multi',
        label: 'Multiplicación y División',
        level: 2,
        type: 'critical',
        requires: ['n1-naturales'],
        description: 'Operaciones multiplicativas básicas.',
        xOffset: 60,
        subcategoryId: 1,
        behavior: 'quiz_list'
    },
    {
        id: 'n0-recta',
        label: 'Recta Numérica y Comparación',
        level: 2,
        type: 'basic',
        requires: ['n1-naturales'],
        description: 'Orden en los naturales.',
        xOffset: -60,
        subcategoryId: 302,
        behavior: 'quiz_list'
    },

    // Grandchildren of Naturales
    {
        id: 'n0-problemas',
        label: 'Solución de Problemas',
        level: 3,
        type: 'applied',
        requires: ['n2-suma', 'n2-multi', 'n0-recta'],
        description: 'Aplicación de operaciones básicas.',
        xOffset: 0,
        subcategoryId: 303,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 2: ENTEROS
    // ==========================================
    {
        id: 'n4-enteros',
        label: 'Números Enteros',
        level: 4,
        type: 'basic',
        requires: ['n0-problemas'],
        description: 'El mundo de los números negativos.',
        xOffset: 0,
        subcategoryId: 304,
        behavior: 'container'
    },

    // Children of Enteros
    {
        id: 'n1-recta',
        label: 'Recta Numérica y Comparación',
        level: 5,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Ubicación y orden en la línea.',
        xOffset: -60,
        subcategoryId: 305,
        behavior: 'quiz_list'
    },
    {
        id: 'n3-jerarquia',
        label: 'Jerarquía y Propiedades',
        level: 5,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Orden correcto (PEMDAS) y leyes numéricas.',
        xOffset: 0,
        subcategoryId: 6,
        behavior: 'quiz_list'
    },
    {
        id: 'n4-ops-enteros',
        label: 'Operaciones Enteros',
        level: 5,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Suma, resta y mult con signos.',
        xOffset: 60,
        subcategoryId: 5,
        additionalSubcategories: [5],
        behavior: 'quiz_list'
    },

    // Grandchildren of Enteros
    {
        id: 'n4-valor-absoluto',
        label: 'Valor Absoluto',
        level: 6,
        type: 'basic',
        requires: ['n1-recta'],
        description: 'Distancia al origen.',
        xOffset: -40,
        subcategoryId: 306,
        behavior: 'quiz_list'
    },
    {
        id: 'n4-problemas-enteros',
        label: 'Problemas con Enteros',
        level: 6,
        type: 'critical',
        requires: ['n4-ops-enteros'],
        description: 'Ejercicios de aplicación con enteros.',
        xOffset: 40,
        subcategoryId: 307,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 7: DIVISIBILIDAD Y FACTORIZACIÓN
    // ==========================================
    {
        id: 'n5-divisibilidad',
        label: 'Divisibilidad y Factorización',
        level: 7,
        type: 'basic',
        requires: ['n4-valor-absoluto', 'n4-problemas-enteros'],
        description: 'Propiedades de los números and descomposición.',
        xOffset: 0,
        subcategoryId: 308,
        behavior: 'container'
    },

    // Children of Divisibilidad
    {
        id: 'n6-primos',
        label: 'Primos, múltiplos y divisores',
        level: 8,
        type: 'basic',
        requires: ['n5-divisibilidad'],
        description: 'Conceptos básicos de divisibilidad.',
        xOffset: -60,
        subcategoryId: 309,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-criterios',
        label: 'Criterios de Divisibilidad',
        level: 8,
        type: 'basic',
        requires: ['n5-divisibilidad'],
        description: 'Reglas para dividir rápidamente.',
        xOffset: 0,
        subcategoryId: 310,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-descomposicion',
        label: 'Descomposición Factorial',
        level: 8,
        type: 'basic',
        requires: ['n5-divisibilidad'],
        description: 'Factores primos de un número.',
        xOffset: 60,
        subcategoryId: 4,
        behavior: 'quiz_list'
    },

    // Grandchildren of Divisibilidad
    {
        id: 'n7-mcd',
        label: 'MCM y MCD',
        level: 9,
        type: 'basic',
        requires: ['n6-descomposicion'],
        description: 'Cálculo de múltiplos y divisores comunes.',
        xOffset: -40,
        subcategoryId: 311,
        behavior: 'quiz_list'
    },
    {
        id: 'n7-problemas-aplicacion',
        label: 'Problemas de Aplicación',
        level: 9,
        type: 'applied',
        requires: ['n6-descomposicion'],
        description: 'Problemas de MCM y MCD.',
        xOffset: 40,
        subcategoryId: 312,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 10: POTENCIAS Y RAÍCES
    // ==========================================
    {
        id: 'n9-main',
        label: 'Potencias y Raíces',
        level: 10,
        type: 'basic',
        requires: ['n7-mcd', 'n7-problemas-aplicacion'],
        description: 'Exponentes y radicales.',
        xOffset: 0,
        subcategoryId: 313,
        behavior: 'container'
    },
    {
        id: 'n9-potencias',
        label: 'Potencias',
        level: 11,
        type: 'basic',
        requires: ['n9-main'],
        description: 'Leyes de exponentes.',
        xOffset: -40,
        subcategoryId: 8,
        behavior: 'quiz_list'
    },
    {
        id: 'n9-radicales',
        label: 'Radicales',
        level: 11,
        type: 'critical',
        requires: ['n9-main'],
        description: 'Raíces y racionalización.',
        xOffset: 40,
        subcategoryId: 7,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 12: FRACCIONES
    // ==========================================
    {
        id: 'n5-fracciones',
        label: 'Fracciones\n(Números Racionales)',
        level: 12,
        type: 'critical',
        requires: ['n9-potencias', 'n9-radicales'],
        description: 'Partes de un todo.',
        xOffset: 0,
        subcategoryId: 314,
        behavior: 'container'
    },
    // Children of Fracciones (Level 12)
    {
        id: 'n5-concepto',
        label: 'Concepto, dibujos',
        level: 13,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Numerador y denominador.',
        xOffset: -50,
        subcategoryId: 315,
        behavior: 'quiz_list'
    },
    {
        id: 'n5-equiv',
        label: 'Fracciones Equivalentes',
        level: 13,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Simplificación y amplificación.',
        xOffset: 0,
        subcategoryId: 316,
        behavior: 'quiz_list'
    },
    {
        id: 'n5-mixtos',
        label: 'Números Mixtos',
        level: 13,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Enteros y fracciones combinados.',
        xOffset: 50,
        subcategoryId: 317,
        behavior: 'quiz_list'
    },

    // Grandchildren of Fracciones (Level 12)
    {
        id: 'n5-sumas-restas',
        label: 'Sumas y Restas',
        level: 14,
        type: 'critical',
        requires: ['n5-concepto', 'n5-equiv', 'n5-mixtos'],
        description: 'Adición y sustracción de fracciones.',
        xOffset: -60,
        subcategoryId: 318,
        behavior: 'quiz_list'
    },
    {
        id: 'n5-multi-div',
        label: 'Productos y Divisiones',
        level: 14,
        type: 'basic',
        requires: ['n5-concepto', 'n5-equiv', 'n5-mixtos'],
        description: 'Multiplicación and división de fracciones.',
        xOffset: 0,
        subcategoryId: 319,
        behavior: 'quiz_list'
    },
    {
        id: 'n5-combinadas',
        label: 'Operaciones Combinadas',
        level: 14,
        type: 'basic',
        requires: ['n5-concepto', 'n5-equiv', 'n5-mixtos'],
        description: 'Mezcla de sumas, productos y parentesis.',
        xOffset: 60,
        subcategoryId: 320,
        behavior: 'quiz_list'
    },

    // Great-Grandchild of Fracciones (Level 13)
    {
        id: 'n13-problemas-frac',
        label: 'Problemas con Fracciones',
        level: 15,
        type: 'applied',
        requires: ['n5-sumas-restas', 'n5-multi-div', 'n5-combinadas'],
        description: 'Ejercicios de aplicación con fracciones.',
        xOffset: 0,
        subcategoryId: 3,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 16: NÚMEROS CON DECIMALES
    // ==========================================
    {
        id: 'n6-decimales',
        label: 'Números con decimales',
        level: 16,
        type: 'basic',
        requires: ['n13-problemas-frac'],
        description: 'Números con punto decimal.',
        xOffset: 0,
        subcategoryId: 321,
        behavior: 'container'
    },

    // Children of Decimales (Level 17)
    {
        id: 'n6-comp',
        label: 'Comparación de Decimales y Redondeo',
        level: 17,
        type: 'basic',
        requires: ['n6-decimales'],
        description: 'Orden, magnitud y redondeo decimal.',
        xOffset: -50,
        subcategoryId: 322,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-suma-resta',
        label: 'Suma y Resta',
        level: 17,
        type: 'basic',
        requires: ['n6-decimales'],
        description: 'Adición and sustracción decimal.',
        xOffset: 0,
        subcategoryId: 323,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-prod-div',
        label: 'Producto y División',
        level: 17,
        type: 'critical',
        requires: ['n6-decimales'],
        description: 'Multiplicación and división decimal.',
        xOffset: 50,
        subcategoryId: 324,
        behavior: 'quiz_list'
    },

    // Grandchildren of Decimales (Level 18 & 19)
    {
        id: 'n6-problemas',
        label: 'Problemas de Aplicación',
        level: 18,
        type: 'applied',
        requires: ['n6-comp', 'n6-suma-resta', 'n6-prod-div'],
        description: 'Ejercicios reales con decimales.',
        xOffset: -40,
        subcategoryId: 2,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-notacion',
        label: 'Notación Científica',
        level: 18,
        type: 'basic',
        requires: ['n6-prod-div'],
        description: 'Potencias de 10 para números grandes and pequeños.',
        xOffset: 40,
        subcategoryId: 325,
        behavior: 'quiz_list'
    },
    {
        id: 'n6-decimales-frac',
        label: 'Decimales y Fracciones',
        level: 19,
        type: 'basic',
        requires: ['n6-problemas', 'n6-notacion'],
        description: 'Conversión entre sistemas.',
        xOffset: 0,
        subcategoryId: 326,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 20: PLANO CARTESIANO 
    // ==========================================
    {
        id: 'n10-plano-parent',
        label: 'Plano Cartesiano',
        level: 20,
        type: 'basic',
        requires: ['n6-decimales-frac'],
        description: 'Coordenadas and el sistema cartesiano.',
        xOffset: 0,
        subcategoryId: 327,
        behavior: 'container'
    },
    {
        id: 'n10-puntos',
        label: 'Puntos en el Plano',
        level: 21,
        type: 'basic',
        requires: ['n10-plano-parent'],
        description: 'Ubicación de coordenadas (x, y).',
        xOffset: -40,
        subcategoryId: 328,
        behavior: 'quiz_list'
    },
    {
        id: 'n10-plano',
        label: 'Transformaciones Rígidas',
        level: 21,
        type: 'critical',
        requires: ['n10-plano-parent'],
        description: 'Rotación, traslación and simetría.',
        xOffset: 40,
        subcategoryId: 11,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 22: REGLA DE TRES 
    // ==========================================
    {
        id: 'n7-regla-tres',
        label: 'Regla de Tres',
        level: 22,
        type: 'basic',
        requires: ['n10-puntos', 'n10-plano'],
        description: 'Relaciones de proporcionalidad.',
        xOffset: 0,
        subcategoryId: 329,
        behavior: 'container'
    },

    // Children of Regla de Tres (Level 23)
    {
        id: 'n7-razones-prop',
        label: 'Razones y Proporciones',
        level: 23,
        type: 'basic',
        requires: ['n7-regla-tres'],
        description: 'Comparación and escala.',
        xOffset: -60,
        subcategoryId: 330,
        behavior: 'quiz_list'
    },
    {
        id: 'n7-simple',
        label: 'Simple',
        level: 23,
        type: 'basic',
        requires: ['n7-regla-tres'],
        description: 'Proporcionalidad directa and inversa.',
        xOffset: 0,
        subcategoryId: 331,
        behavior: 'quiz_list'
    },
    {
        id: 'n7-compuesta',
        label: 'Compuesta',
        level: 23,
        type: 'critical',
        requires: ['n7-regla-tres'],
        description: 'Múltiples magnitudes relacionadas.',
        xOffset: 60,
        subcategoryId: 332,
        behavior: 'quiz_list'
    },

    // Grandchild of Regla de Tres (Level 24)
    {
        id: 'n7-porc-calc',
        label: 'Cálculo de Porcentajes',
        level: 24,
        type: 'basic',
        requires: ['n7-simple', 'n7-compuesta'],
        description: 'Aplicación de la regla de tres al %.',
        xOffset: 0,
        subcategoryId: 333,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 25: CONVERSIÓN DE UNIDADES
    // ==========================================
    {
        id: 'n11-conversion-parent',
        label: 'Conversión de Unidades',
        level: 25,
        type: 'basic',
        requires: ['n7-porc-calc'],
        description: 'Medidas y sus transformaciones.',
        xOffset: 0,
        subcategoryId: 334,
        behavior: 'container'
    },
    {
        id: 'n11-longitud',
        label: 'Unidades de Longitud',
        level: 26,
        type: 'basic',
        requires: ['n11-conversion-parent'],
        description: 'Metros, kilómetros y más.',
        xOffset: -60,
        subcategoryId: 335,
        behavior: 'quiz_list'
    },
    {
        id: 'n11-masa',
        label: 'Unidades de Masa',
        level: 26,
        type: 'basic',
        requires: ['n11-conversion-parent'],
        description: 'Gramos, kilogramos y toneladas.',
        xOffset: 0,
        subcategoryId: 336,
        behavior: 'quiz_list'
    },
    {
        id: 'n11-volumen',
        label: 'Unidades de Volumen',
        level: 26,
        type: 'basic',
        requires: ['n11-conversion-parent'],
        description: 'Litros, mililitros y capacidad.',
        xOffset: 60,
        subcategoryId: 337,
        behavior: 'quiz_list'
    },
    {
        id: 'n11-tiempo',
        label: 'Unidades de Tiempo',
        level: 27,
        type: 'basic',
        requires: ['n11-longitud', 'n11-masa', 'n11-volumen'],
        description: 'Horas, minutos y segundos.',
        xOffset: 0,
        subcategoryId: 338,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 28: PATRONES ARITMÉTICOS
    // ==========================================
    {
        id: 'n12-patrones-parent',
        label: 'Patrones Aritméticos',
        level: 28,
        type: 'basic',
        requires: ['n11-tiempo'],
        description: 'Secuencias y regularidades numéricas.',
        xOffset: 0,
        subcategoryId: 339,
        behavior: 'container'
    },
    {
        id: 'n12-prog-arit',
        label: 'Progresión Aritmética',
        level: 29,
        type: 'basic',
        requires: ['n12-patrones-parent'],
        description: 'Sucesiones con diferencia constante.',
        xOffset: -40,
        subcategoryId: 340,
        behavior: 'quiz_list'
    },
    {
        id: 'n12-prog-geom',
        label: 'Progresión Geométrica',
        level: 29,
        type: 'basic',
        requires: ['n12-patrones-parent'],
        description: 'Sucesiones con razón constante.',
        xOffset: 40,
        subcategoryId: 341,
        behavior: 'quiz_list'
    },
    {
        id: 'n12-problemas-prog',
        label: 'Problemas de Progresiones',
        level: 30,
        type: 'applied',
        requires: ['n12-prog-arit', 'n12-prog-geom'],
        description: 'Aplicación de sucesiones.',
        xOffset: -30,
        subcategoryId: 342,
        behavior: 'quiz_list'
    },
    {
        id: 'n12-promedios',
        label: 'Cálculo de Promedios',
        level: 30,
        type: 'basic',
        requires: ['n12-prog-arit', 'n12-prog-geom'],
        description: 'Media, mediana y moda descriptiva.',
        xOffset: 30,
        subcategoryId: 343,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 31: APLICACIONES FINANCIERAS
    // ==========================================
    {
        id: 'n14-aplicaciones-parent',
        label: 'Aplicaciones',
        level: 31,
        type: 'applied',
        requires: ['n12-problemas-prog', 'n12-promedios'],
        description: 'Matemáticas del dinero y el crecimiento.',
        xOffset: 0,
        subcategoryId: 344,
        behavior: 'container'
    },
    {
        id: 'n14-interes-simple',
        label: 'Interés Simple',
        level: 32,
        type: 'applied',
        requires: ['n14-aplicaciones-parent'],
        description: 'Crecimiento lineal del capital.',
        xOffset: -40,
        subcategoryId: 345,
        behavior: 'quiz_list'
    },
    {
        id: 'n14-interes-compuesto',
        label: 'Interés Compuesto',
        level: 32,
        type: 'critical',
        requires: ['n14-aplicaciones-parent'],
        description: 'Interés sobre interés (crecimiento exponencial).',
        xOffset: 40,
        subcategoryId: 346,
        behavior: 'quiz_list'
    },

    // Final Mastery Evaluation (Level 33)
    {
        id: 'n13-mastery',
        label: 'Maestría en Aritmética',
        level: 33,
        type: 'evaluation',
        requires: ['n14-interes-simple', 'n14-interes-compuesto'],
        description: 'El desafío definitivo de todo el módulo.',
        xOffset: 0,
        subcategoryId: 347,
        behavior: 'quiz_list'
    }
];
