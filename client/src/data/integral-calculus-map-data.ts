import { ArithmeticNode } from './arithmetic-map-data.js';

export const integralCalculusMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL I0: NOTACIÓN SIGMA Y SUMATORIAS
    // ==========================================
    {
        id: 'i0-sumatorias',
        label: 'NOTACIÓN SIGMA Y SUMATORIAS',
        level: 0,
        type: 'container',
        requires: [],
        description: 'Fundamentos de sumatorias e índice de suma.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i0-conceptos-sigma',
        label: 'Conceptos e Índice de Sumatoria',
        level: 1,
        type: 'basic',
        requires: ['i0-sumatorias'],
        description: 'Definición de notación sigma e índice de sumatoria.',
        xOffset: -48,
        subcategoryId: 501,
        behavior: 'quiz_list'
    },
    {
        id: 'i0-propiedades-sigma',
        label: 'Propiedades de las Sumatorias',
        level: 1,
        type: 'basic',
        requires: ['i0-sumatorias'],
        description: 'Linealidad, constantes y operaciones con sumas.',
        xOffset: 0,
        subcategoryId: 502,
        behavior: 'quiz_list'
    },
    {
        id: 'i0-formulas-sigma',
        label: 'Fórmulas Especiales de Sumas',
        level: 1,
        type: 'basic',
        requires: ['i0-sumatorias'],
        description: 'Fórmulas cerradas para enteros, cuadrados y cubos.',
        xOffset: 48,
        subcategoryId: 503,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I1: ÁREA BAJO LA CURVA
    // ==========================================
    {
        id: 'i0-area-curva',
        label: 'ÁREA BAJO LA CURVA',
        level: 2,
        type: 'basic',
        requires: ['i0-formulas-sigma', 'i0-propiedades-sigma'],
        description: 'Introducción al concepto de área y estimación.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i0-aprox-rect',
        label: 'Aproximaciones con rectángulos',
        level: 3,
        type: 'basic',
        requires: ['i0-area-curva'],
        description: 'Puntos medios, extremos izquierdo y derecho.',
        xOffset: -45,
        subcategoryId: 453,
        behavior: 'quiz_list'
    },
    {
        id: 'i0-riemann',
        label: 'Sumas de Riemann',
        level: 3,
        type: 'basic',
        requires: ['i0-area-curva'],
        description: 'Notación sigma y sumas infinitas.',
        xOffset: 45,
        subcategoryId: 454,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I2: INTEGRAL DEFINIDA
    // ==========================================
    {
        id: 'i1-integral-definida',
        label: 'Integral Definida',
        level: 4,
        type: 'critical',
        requires: ['i0-riemann', 'i0-aprox-rect'],
        description: 'El límite de las sumas de Riemann.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i1-limite-riemann',
        label: 'Límite de sumas de Riemann',
        level: 5,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Definición formal de la integral.',
        xOffset: -80,
        subcategoryId: 455,
        behavior: 'quiz_list'
    },
    {
        id: 'i1-propiedades',
        label: 'Propiedades',
        level: 5,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Linealidad, intervalos y comparación.',
        xOffset: -40,
        subcategoryId: 456,
        behavior: 'quiz_list'
    },
    {
        id: 'i1-calculo-def',
        label: 'Cálculo e Introducción',
        level: 5,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Evaluación de integrales definidas.',
        xOffset: 0,
        subcategoryId: 457,
        behavior: 'quiz_list'
    },
    {
        id: 'i1-tfc',
        label: 'Teorema Fundamental del Cálculo',
        level: 5,
        type: 'critical',
        requires: ['i1-integral-definida'],
        description: 'Relación entre derivada e integral.',
        xOffset: 46,
        subcategoryId: 458,
        behavior: 'quiz_list'
    },
    {
        id: 'i1-area-neta',
        label: 'Área neta',
        level: 5,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Interpretación geométrica del signo.',
        xOffset: 80,
        subcategoryId: 459,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I3: INTEGRAL INDEFINIDA
    // ==========================================
    {
        id: 'i2-integral-indefinida',
        label: 'INTEGRAL INDEFINIDA',
        level: 6,
        type: 'critical',
        requires: ['i1-tfc'],
        description: 'La antiderivada general.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i2-polinomios',
        label: 'Polinomios',
        level: 7,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'Regla de la potencia inversa.',
        xOffset: -75,
        subcategoryId: 460,
        behavior: 'quiz_list'
    },
    {
        id: 'i2-trigo',
        label: 'Integrales trigonométricas',
        level: 7,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'Funciones circulares básicas.',
        xOffset: -25,
        subcategoryId: 461,
        behavior: 'quiz_list'
    },
    {
        id: 'i2-explog',
        label: 'Integrales exponenciales y logarítmicas',
        level: 7,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'e^x y 1/x.',
        xOffset: 25,
        subcategoryId: 462,
        behavior: 'quiz_list'
    },
    {
        id: 'i2-hiperbolicas',
        label: 'Funciones Hiperbólicas',
        level: 7,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'sinh, cosh y sus identidades.',
        xOffset: 75,
        subcategoryId: 463,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I4: TÉCNICAS DE INTEGRACIÓN
    // ==========================================
    {
        id: 'i3-tecnicas',
        label: 'TÉCNICAS DE INTEGRACIÓN',
        level: 8,
        type: 'critical',
        requires: ['i2-integral-indefinida'],
        description: 'Métodos avanzados de resolución.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i3-sustitucion',
        label: 'Sustitución',
        level: 9,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Regla de la cadena inversa (u-sub).',
        xOffset: -75,
        subcategoryId: 464,
        behavior: 'quiz_list'
    },
    {
        id: 'i3-partes',
        label: 'Integración por partes',
        level: 9,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Producto de funciones (udv).',
        xOffset: -25,
        subcategoryId: 465,
        behavior: 'quiz_list'
    },
    {
        id: 'i3-fracciones',
        label: 'Integral por fracciones parciales',
        level: 9,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Descomposición de funciones racionales.',
        xOffset: 25,
        subcategoryId: 466,
        behavior: 'quiz_list'
    },
    {
        id: 'i3-sust-trigo',
        label: 'Integral por sustitución trigonométrica',
        level: 9,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Uso de identidades para raíces cuadradas.',
        xOffset: 75,
        subcategoryId: 467,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I5: APLICACIONES GEOMÉTRICAS
    // ==========================================
    {
        id: 'i4-aplic-geo',
        label: 'APLICACIONES GEOMÉTRICAS',
        level: 10,
        type: 'applied',
        requires: ['i1-tfc'],
        description: 'Cálculo de áreas y volúmenes.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i4-area-curvas',
        label: 'Área entre curvas',
        level: 11,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Regiones delimitadas por funciones.',
        xOffset: -50,
        subcategoryId: 468,
        behavior: 'quiz_list'
    },
    {
        id: 'i4-long-area',
        label: 'Longitud y Área Superficial',
        level: 11,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Curvas y superficies.',
        xOffset: 0,
        subcategoryId: 472,
        behavior: 'quiz_list'
    },
    {
        id: 'i4-momentos',
        label: 'Momentos y Centro de Masa',
        level: 11,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Centroides de láminas.',
        xOffset: 50,
        subcategoryId: 473,
        behavior: 'quiz_list'
    },

    // ==========================================
    // SUB-UNIDAD: VOLÚMENES DE SÓLIDOS (NIVEL 12)
    // ==========================================
    {
        id: 'i4-volumenes',
        label: 'Volúmenes de Sólidos',
        level: 12,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Rotación alrededor de ejes.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i4-discos',
        label: 'Método de discos',
        level: 13,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Sólidos sin agujeros.',
        xOffset: -48,
        subcategoryId: 469,
        behavior: 'quiz_list'
    },
    {
        id: 'i4-arandelas',
        label: 'Método de arandelas',
        level: 13,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Sólidos con agujeros.',
        xOffset: 0,
        subcategoryId: 470,
        behavior: 'quiz_list'
    },
    {
        id: 'i4-cascarones',
        label: 'Método de cascarones',
        level: 13,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Capas cilíndricas.',
        xOffset: 48,
        subcategoryId: 471,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I6: APLICACIONES FÍSICAS
    // ==========================================
    {
        id: 'i5-aplic-fisicas',
        label: 'APLICACIONES FÍSICAS Y REALES',
        level: 14,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Física y modelos matemáticos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i5-movimiento',
        label: 'Movimiento rectilíneo',
        level: 15,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Posición, velocidad y aceleración.',
        xOffset: -48,
        subcategoryId: 474,
        behavior: 'quiz_list'
    },
    {
        id: 'i5-trabajo',
        label: 'Trabajo-Fuerza variable',
        level: 15,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Cálculo de W = ∫ F dx.',
        xOffset: 0,
        subcategoryId: 475,
        behavior: 'quiz_list'
    },
    {
        id: 'i5-promedio',
        label: 'Promedio de una función',
        level: 15,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Valor medio en un intervalo.',
        xOffset: 48,
        subcategoryId: 476,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I7: INTEGRALES IMPROPIAS
    // ==========================================
    {
        id: 'i6-impropias',
        label: 'INTEGRALES IMPROPIAS',
        level: 16,
        type: 'evaluation',
        requires: ['i3-tecnicas'],
        description: 'Integrales con infinitos o asíntotas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i6-lim-inf',
        label: 'Integrales con límites infinitos',
        level: 17,
        type: 'evaluation',
        requires: ['i6-impropias'],
        description: 'Convergencia y divergencia.',
        xOffset: -40,
        subcategoryId: 477,
        behavior: 'quiz_list'
    },
    {
        id: 'i6-disc',
        label: 'Integrales con discontinuidades',
        level: 17,
        type: 'evaluation',
        requires: ['i6-impropias'],
        description: 'Asíntotas verticales.',
        xOffset: 40,
        subcategoryId: 478,
        behavior: 'quiz_list'
    },
    {
        id: 'i-mastery',
        label: 'Maestría en Cálculo Integral',
        level: 18,
        type: 'evaluation',
        requires: [],
        description: 'El desafío definitivo de todo el módulo.',
        xOffset: 0,
        subcategoryId: 477,
        behavior: 'quiz_list'
    }
];
