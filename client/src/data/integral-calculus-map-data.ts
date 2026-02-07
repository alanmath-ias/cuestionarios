
import { ArithmeticNode } from './arithmetic-map-data.js';

export const integralCalculusMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL I0: ÁREA BAJO LA CURVA
    // ==========================================
    {
        id: 'i0-area-curva',
        label: 'Área bajo la curva',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Introducción al concepto de área y estimación.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i0-aprox-rect',
        label: 'Aproximaciones con rectángulos',
        level: 1,
        type: 'basic',
        requires: ['i0-area-curva'],
        description: 'Puntos medios, extremos izquierdo y derecho.',
        xOffset: -50,
        subcategoryId: 130,
        filterKeywords: ['rectángulo', 'rectangulo'],
        behavior: 'quiz_list'
    },
    {
        id: 'i0-riemann',
        label: 'Sumas de Riemann',
        level: 1,
        type: 'basic',
        requires: ['i0-area-curva'],
        description: 'Notación sigma y sumas infinitas.',
        xOffset: 50,
        subcategoryId: 130,
        filterKeywords: ['riemann', 'sigma'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I1: INTEGRAL DEFINIDA
    // ==========================================
    {
        id: 'i1-integral-definida',
        label: 'Integral Definida',
        level: 2,
        type: 'critical',
        requires: ['i0-riemann', 'i0-aprox-rect'],
        description: 'El límite de las sumas de Riemann.',
        xOffset: 0,
        subcategoryId: 131,
        behavior: 'container'
    },
    {
        id: 'i1-limite-riemann',
        label: 'Límite de sumas de Riemann',
        level: 3,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Definición formal de la integral.',
        xOffset: -75,
        subcategoryId: 131,
        filterKeywords: ['límite'],
        behavior: 'quiz_list'
    },
    {
        id: 'i1-propiedades',
        label: 'Propiedades',
        level: 3,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Linealidad, intervalos y comparación.',
        xOffset: -37,
        subcategoryId: 131,
        filterKeywords: ['propiedad'],
        behavior: 'quiz_list'
    },
    {
        id: 'i1-calculo-def',
        label: 'Cálculo e Introducción',
        level: 3,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Evaluación de integrales definidas.',
        xOffset: 0,
        subcategoryId: 131,
        filterKeywords: ['cálculo', 'evaluación', 'definida'],
        behavior: 'quiz_list'
    },
    {
        id: 'i1-tfc',
        label: 'Teorema Fundamental del Cálculo',
        level: 3,
        type: 'critical',
        requires: ['i1-integral-definida'],
        description: 'Relación entre derivada e integral.',
        xOffset: 37,
        subcategoryId: 132,
        behavior: 'quiz_list'
    },
    {
        id: 'i1-area-neta',
        label: 'Área neta',
        level: 3,
        type: 'basic',
        requires: ['i1-integral-definida'],
        description: 'Interpretación geométrica del signo.',
        xOffset: 75,
        subcategoryId: 131,
        additionalSubcategories: [133],
        filterKeywords: ['neta', 'cambio neto'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I2: INTEGRAL INDEFINIDA
    // ==========================================
    {
        id: 'i2-integral-indefinida',
        label: 'INTEGRAL INDEFINIDA',
        level: 4,
        type: 'critical',
        requires: ['i1-tfc'],
        description: 'La antiderivada general.',
        xOffset: 0,
        subcategoryId: 133,
        behavior: 'container'
    },
    {
        id: 'i2-polinomios',
        label: 'Polinomios',
        level: 5,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'Regla de la potencia inversa.',
        xOffset: -75,
        subcategoryId: 133,
        filterKeywords: ['polinomio', 'básica', 'fórmulas básicas', 'potencia'],
        excludeKeywords: ['cambio neto', 'neta'],
        behavior: 'quiz_list'
    },
    {
        id: 'i2-trigo',
        label: 'Integrales trigonométricas',
        level: 5,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'Funciones circulares básicas.',
        xOffset: -25,
        subcategoryId: 133,
        additionalSubcategories: [136],
        filterKeywords: ['trigo', 'sen', 'cos', 'tan', 'arc'],
        behavior: 'quiz_list'
    },
    {
        id: 'i2-explog',
        label: 'Integrales exponenciales y logarítmicas',
        level: 5,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'e^x y 1/x.',
        xOffset: 25,
        subcategoryId: 135,
        additionalSubcategories: [143, 144],
        filterKeywords: ['exponencial', 'logarítmica', 'ln', 'e^', 'crecimiento', 'decaimiento'],
        behavior: 'quiz_list'
    },
    {
        id: 'i2-hiperbolicas',
        label: 'Funciones Hiperbólicas',
        level: 5,
        type: 'basic',
        requires: ['i2-integral-indefinida'],
        description: 'sinh, cosh y sus identidades.',
        xOffset: 75,
        subcategoryId: 145,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I3: TÉCNICAS DE INTEGRACIÓN
    // ==========================================
    {
        id: 'i3-tecnicas',
        label: 'TÉCNICAS DE INTEGRACIÓN',
        level: 6,
        type: 'critical',
        requires: ['i2-integral-indefinida'],
        description: 'Métodos avanzados de resolución.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i3-sustitucion',
        label: 'Sustitución',
        level: 7,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Regla de la cadena inversa (u-sub).',
        xOffset: -75,
        subcategoryId: 134,
        filterKeywords: ['sustitución', 'cambio de variable'],
        behavior: 'quiz_list'
    },
    {
        id: 'i3-partes',
        label: 'Integración por partes',
        level: 7,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Producto de funciones (udv).',
        xOffset: -25,
        filterKeywords: ['partes'],
        behavior: 'quiz_list'
    },
    {
        id: 'i3-fracciones',
        label: 'Integral por fracciones parciales',
        level: 7,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Descomposición de funciones racionales.',
        xOffset: 25,
        filterKeywords: ['parciales'],
        behavior: 'quiz_list'
    },
    {
        id: 'i3-sust-trigo',
        label: 'Integral por sustitución trigonométrica',
        level: 7,
        type: 'basic',
        requires: ['i3-tecnicas'],
        description: 'Uso de identidades para raíces cuadradas.',
        xOffset: 75,
        filterKeywords: ['sustitución trigonométrica'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I4: APLICACIONES GEOMÉTRICAS
    // ==========================================
    {
        id: 'i4-aplic-geo',
        label: 'APLICACIONES GEOMÉTRICAS',
        level: 8,
        type: 'applied',
        requires: ['i1-tfc'],
        description: 'Cálculo de áreas y volúmenes.',
        xOffset: -40,
        behavior: 'container'
    },
    {
        id: 'i4-area-curvas',
        label: 'Área entre curvas',
        level: 9,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Regiones delimitadas por funciones.',
        xOffset: -75,
        subcategoryId: 137,
        filterKeywords: ['entre curvas'],
        behavior: 'quiz_list'
    },
    {
        id: 'i4-volumenes',
        label: 'Volúmenes de Sólidos',
        level: 9,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Rotación alrededor de ejes.',
        xOffset: -25,
        subcategoryId: 138,
        additionalSubcategories: [139],
        behavior: 'container'
    },
    {
        id: 'i4-discos',
        label: 'Método de discos',
        level: 10,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Sólidos sin agujeros.',
        xOffset: -60,
        subcategoryId: 138,
        filterKeywords: ['disco', 'rebanado'], // Included rebanado here
        behavior: 'quiz_list'
    },
    {
        id: 'i4-arandelas',
        label: 'Método de arandelas',
        level: 10,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Sólidos con agujeros.',
        xOffset: -20,
        subcategoryId: 138,
        filterKeywords: ['arandela'],
        behavior: 'quiz_list'
    },
    {
        id: 'i4-cascarones',
        label: 'Método de cascarones',
        level: 10,
        type: 'applied',
        requires: ['i4-volumenes'],
        description: 'Capas cilíndricas.',
        xOffset: 20,
        subcategoryId: 139,
        filterKeywords: ['cascarones'],
        behavior: 'quiz_list'
    },
    {
        id: 'i4-long-area',
        label: 'Longitud y Área Superficial',
        level: 9,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Curvas y superficies.',
        xOffset: 25,
        subcategoryId: 140,
        behavior: 'quiz_list'
    },
    {
        id: 'i4-momentos',
        label: 'Momentos y Centro de Masa',
        level: 9,
        type: 'applied',
        requires: ['i4-aplic-geo'],
        description: 'Centroides de láminas.',
        xOffset: 75,
        subcategoryId: 142,
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I5: APLICACIONES FÍSICAS
    // ==========================================
    {
        id: 'i5-aplic-fisicas',
        label: 'APLICACIONES FÍSICAS Y REALES',
        level: 11,
        type: 'applied',
        requires: ['i4-aplic-geo'], // Increased complexity dependency
        description: 'Física y modelos matemáticos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i5-movimiento',
        label: 'Movimiento rectilíneo',
        level: 12,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Posición, velocidad y aceleración.',
        xOffset: -40,
        filterKeywords: ['movimiento', 'velocidad', 'posición'],
        behavior: 'quiz_list'
    },
    {
        id: 'i5-trabajo',
        label: 'Trabajo-Fuerza variable',
        level: 12,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Cálculo de W = ∫ F dx.',
        xOffset: 0,
        subcategoryId: 141,
        filterKeywords: ['trabajo', 'fuerza'],
        behavior: 'quiz_list'
    },
    {
        id: 'i5-promedio',
        label: 'Promedio de una función',
        level: 12,
        type: 'applied',
        requires: ['i5-aplic-fisicas'],
        description: 'Valor medio en un intervalo.',
        xOffset: 40,
        subcategoryId: 137,
        filterKeywords: ['promedio'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL I6: INTEGRALES IMPROPIAS
    // ==========================================
    {
        id: 'i6-impropias',
        label: 'INTEGRALES IMPROPIAS',
        level: 13,
        type: 'evaluation',
        requires: ['i3-tecnicas'],
        description: 'Integrales con infinitos o asíntotas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'i6-lim-inf',
        label: 'Integrales con límites infinitos',
        level: 14,
        type: 'evaluation',
        requires: ['i6-impropias'],
        description: 'Convergencia y divergencia.',
        xOffset: -40,
        filterKeywords: ['infinito'],
        behavior: 'quiz_list'
    },
    {
        id: 'i6-disc',
        label: 'Integrales con discontinuidades',
        level: 14,
        type: 'evaluation',
        requires: ['i6-impropias'],
        description: 'Asíntotas verticales.',
        xOffset: 40,
        filterKeywords: ['discontinuidad'],
        behavior: 'quiz_list'
    }
];
