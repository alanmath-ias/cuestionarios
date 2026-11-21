import { ArithmeticNode } from './arithmetic-map-data';

export const grade5GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: RELACIONES ANGULARES Y CONSTRUCCIONES CON INSTRUMENTOS
    // ==========================================
    {
        id: 'g5-geo-u1-relaciones-angulares',
        label: 'Relaciones Angulares y Construcciones',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Profundiza en relaciones entre ángulos, ecuaciones para ángulos complementarios/suplementarios y construcciones con regla y compás.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-angulos-opuestos-vertice',
        label: 'Ángulos Opuestos por el Vértice y Adyacentes',
        level: 1,
        type: 'basic',
        requires: ['g5-geo-u1-relaciones-angulares'],
        description: 'Reconoce ángulos consecutivos, adyacentes y demuestra la congruencia entre ángulos opuestos por el vértice al cruzarse dos rectas.',
        xOffset: -45,
        subcategoryId: 701,
        additionalQuizzes: [1215],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-angulos-complementarios-suplementarios',
        label: 'Ángulos Complementarios y Suplementarios',
        level: 1,
        type: 'basic',
        requires: ['g5-geo-u1-relaciones-angulares'],
        description: 'Plantea y resuelve incógnitas angulares donde la suma sea 90° (complementarios) o 180° (suplementarios).',
        xOffset: 45,
        subcategoryId: 702,
        additionalQuizzes: [1216],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-paralelas-secante-construccion',
        label: 'Paralelas, Secante, Bisectriz y Mediatriz',
        level: 2,
        type: 'basic',
        requires: ['g5-geo-angulos-opuestos-vertice', 'g5-geo-angulos-complementarios-suplementarios'],
        description: 'Explora ángulos entre paralelas cortadas por secante y aprende el trazo geométrico de la mediatriz y la bisectriz con compás.',
        xOffset: 0,
        subcategoryId: 703,
        additionalQuizzes: [1217],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: JERARQUÍA DE CUADRILÁTEROS Y SUMA ANGULAR DE POLÍGONOS
    // ==========================================
    {
        id: 'g5-geo-u2-jerarquia-poligonos',
        label: 'Jerarquía de Cuadriláteros y Polígonos',
        level: 3,
        type: 'basic',
        requires: ['g5-geo-paralelas-secante-construccion'],
        description: 'Clasifica cuadriláteros en árboles inclusivos, investiga propiedades de diagonales y generaliza la suma de ángulos internos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-jerarquia-cuadrilateros',
        label: 'Jerarquía Inclusiva de Cuadriláteros',
        level: 4,
        type: 'basic',
        requires: ['g5-geo-u2-jerarquia-poligonos'],
        description: 'Comprende por qué todo cuadrado es rectángulo y rombo, clasificando paralelogramos, trapecios y trapezoides por paralelismo.',
        xOffset: -45,
        subcategoryId: 704,
        additionalQuizzes: [1218],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-diagonales-cuadrilateros',
        label: 'Propiedades de Diagonales en Cuadriláteros',
        level: 4,
        type: 'basic',
        requires: ['g5-geo-u2-jerarquia-poligonos'],
        description: 'Analiza cuándo las diagonales se bisecan, cuándo son de igual longitud y cuándo se cortan perpendicularmente a 90°.',
        xOffset: 45,
        subcategoryId: 705,
        additionalQuizzes: [1219],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-suma-angulos-poligonos',
        label: 'Suma Angular de Polígonos de n Lados',
        level: 5,
        type: 'basic',
        requires: ['g5-geo-jerarquia-cuadrilateros', 'g5-geo-diagonales-cuadrilateros'],
        description: 'Descubre y aplica la fórmula (n - 2) × 180° triangulando polígonos convexos y calcula la medida del ángulo interior en regulares.',
        xOffset: 0,
        subcategoryId: 706,
        additionalQuizzes: [1220],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: CIRCUNFERENCIA, CÍRCULO Y EL NÚMERO PI
    // ==========================================
    {
        id: 'g5-geo-u3-circunferencia-pi',
        label: 'Circunferencia, Círculo y el Número Pi',
        level: 6,
        type: 'basic',
        requires: ['g5-geo-suma-angulos-poligonos'],
        description: 'Distingue circunferencia de círculo, explora elementos lineales y secantes, y calcula perímetros y áreas circulares.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-elementos-circunferencia',
        label: 'Elementos de la Circunferencia',
        level: 7,
        type: 'basic',
        requires: ['g5-geo-u3-circunferencia-pi'],
        description: 'Identifica centro, radio, diámetro, cuerda, arco, recta secante y recta tangente perpendicular al radio.',
        xOffset: -45,
        subcategoryId: 707,
        additionalQuizzes: [1221],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-numero-pi-longitud',
        label: 'El Número π y Longitud de la Circunferencia',
        level: 7,
        type: 'basic',
        requires: ['g5-geo-u3-circunferencia-pi'],
        description: 'Descubre que la razón C/d es constante (π ≈ 3.1416) y calcula perímetros circulares con C = π × d y C = 2π × r.',
        xOffset: 45,
        subcategoryId: 708,
        additionalQuizzes: [1222],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-area-circulo-sectores',
        label: 'El Círculo y Noción de Área Circular',
        level: 8,
        type: 'basic',
        requires: ['g5-geo-elementos-circunferencia', 'g5-geo-numero-pi-longitud'],
        description: 'Aproxima el área del círculo transformándolo en paralelogramo de sectores circulares (A = π × r²) y calcula sectores básicos.',
        xOffset: 0,
        subcategoryId: 709,
        additionalQuizzes: [1223],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: PLANO CARTESIANO CON ESCALA, ISOMETRÍAS Y HOMOTECIA
    // ==========================================
    {
        id: 'g5-geo-u4-plano-homotecia',
        label: 'Coordenadas, Isometrías y Homotecia',
        level: 9,
        type: 'basic',
        requires: ['g5-geo-area-circulo-sectores'],
        description: 'Amplía el plano cartesiano con escalas métricas, combina transformaciones y comprende la ampliación y reducción por homotecia.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-plano-escala-distancias',
        label: 'Plano Cartesiano con Escala y Distancias',
        level: 10,
        type: 'basic',
        requires: ['g5-geo-u4-plano-homotecia'],
        description: 'Lee puntos con escalas y coordenadas decimales, y calcula distancias entre puntos alineados restando coordenadas.',
        xOffset: -45,
        subcategoryId: 710,
        additionalQuizzes: [1224],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-isometrias-combinadas',
        label: 'Isometrías Combinadas en el Plano',
        level: 10,
        type: 'basic',
        requires: ['g5-geo-u4-plano-homotecia'],
        description: 'Aplica traslaciones sucesivas, rotaciones y reflexiones compuestas, verificando que la figura conserva tamaño y ángulos.',
        xOffset: 45,
        subcategoryId: 711,
        additionalQuizzes: [1225],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-homotecias-factor-escala',
        label: 'Homotecias: Ampliación, Reducción y Escala',
        level: 11,
        type: 'basic',
        requires: ['g5-geo-plano-escala-distancias', 'g5-geo-isometrias-combinadas'],
        description: 'Modifica figuras multiplicando coordenadas por un factor k, analizando cómo cambian el perímetro (k) y el área (k²).',
        xOffset: 0,
        subcategoryId: 712,
        additionalQuizzes: [1226],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: ÁREAS DE POLÍGONOS ESPECIALES Y CONVERSIÓN MÉTRICA
    // ==========================================
    {
        id: 'g5-geo-u5-areas-especiales',
        label: 'Áreas Avanzadas y Conversión Métrica',
        level: 12,
        type: 'basic',
        requires: ['g5-geo-homotecias-factor-escala'],
        description: 'Calcula áreas de rombos, romboides, trapecios y polígonos regulares con apotema, dominando la conversión de unidades cuadradas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-area-rombo-romboide',
        label: 'Área del Rombo y Romboide',
        level: 13,
        type: 'basic',
        requires: ['g5-geo-u5-areas-especiales'],
        description: 'Aplica A = b × h en romboides inclinados y A = (D × d) / 2 en rombos a partir de sus diagonales mayor y menor.',
        xOffset: -45,
        subcategoryId: 713,
        additionalQuizzes: [1227],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-area-trapecio-poligonos-regulares',
        label: 'Área del Trapecio y Polígonos con Apotema',
        level: 13,
        type: 'basic',
        requires: ['g5-geo-u5-areas-especiales'],
        description: 'Deduce y aplica A = [(B + b) × h] / 2 para trapecios y A = (Perímetro × apotema) / 2 para polígonos regulares.',
        xOffset: 45,
        subcategoryId: 714,
        additionalQuizzes: [1228],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-conversion-unidades-superficie',
        label: 'Conversión Métrica (mm² a m²) y Áreas Sombreadas',
        level: 14,
        type: 'basic',
        requires: ['g5-geo-area-rombo-romboide', 'g5-geo-area-trapecio-poligonos-regulares'],
        description: 'Convierte unidades de superficie de 100 en 100 y resuelve áreas sombreadas restando figuras compuestas y huecos.',
        xOffset: 0,
        subcategoryId: 715,
        additionalQuizzes: [1229],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS 3D, ÁREA SUPERFICIAL, CAPACIDAD Y VOLUMEN
    // ==========================================
    {
        id: 'g5-geo-u6-solidos-volumen-capacidad',
        label: 'Cuerpos 3D, Superficie y Volumen',
        level: 15,
        type: 'basic',
        requires: ['g5-geo-conversion-unidades-superficie'],
        description: 'Estudia sólidos de revolución, calcula el área superficial total de prismas y formaliza el volumen relacionándolo con capacidad.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-geo-cuerpos-redondos-prismas-piramides',
        label: 'Cuerpos Redondos, Prismas y Pirámides',
        level: 16,
        type: 'basic',
        requires: ['g5-geo-u6-solidos-volumen-capacidad'],
        description: 'Diferencia poliedros de cuerpos redondos (cilindro, cono, esfera), identificando generatrices, radios y secciones planas.',
        xOffset: -45,
        subcategoryId: 716,
        additionalQuizzes: [1230],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-area-superficial-total-prismas',
        label: 'Área Superficial Total de Prismas y Cubos',
        level: 16,
        type: 'basic',
        requires: ['g5-geo-u6-solidos-volumen-capacidad'],
        description: 'Calcula la cantidad de cartulina o pintura requerida sumando el área de las 6 caras de prismas rectangulares y cubos.',
        xOffset: 45,
        subcategoryId: 717,
        additionalQuizzes: [1231],
        behavior: 'quiz_list'
    },
    {
        id: 'g5-geo-volumen-capacidad-gran-corona',
        label: 'Volumen Formal, Capacidad y Gran Corona de 5°',
        level: 17,
        type: 'evaluation',
        requires: ['g5-geo-cuerpos-redondos-prismas-piramides', 'g5-geo-area-superficial-total-prismas'],
        description: 'Domina V = l × w × h = Abase × h, conecta 1 L = 1000 cm³ = 1 dm³ y conquista la Gran Corona de Geometría de 5° de Primaria.',
        xOffset: 0,
        subcategoryId: 718,
        additionalQuizzes: [1232],
        behavior: 'quiz_list'
    }
];
