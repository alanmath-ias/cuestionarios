import { ArithmeticNode } from './arithmetic-map-data';

export const grade3GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: ÁNGULOS, GIROS Y ABERTURAS
    // ==========================================
    {
        id: 'g3-geo-u1-angulos',
        label: 'Ángulos, Giros y Aberturas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Descubre qué es un ángulo, reconoce sus lados y vértice, y compara con el ángulo recto.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-nocion-angulo',
        label: '¿Qué es un Ángulo? Vértice y Lados',
        level: 1,
        type: 'basic',
        requires: ['g3-geo-u1-angulos'],
        description: 'Identifica la abertura entre dos semirrectas unidas en un vértice y encuentra ángulos en objetos cotidianos.',
        xOffset: -45,
        subcategoryId: 665,
        additionalQuizzes: [1179],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-angulo-recto-escuadra',
        label: 'El Ángulo Recto y la Escuadra',
        level: 1,
        type: 'basic',
        requires: ['g3-geo-u1-angulos'],
        description: 'Aprende la esquina recta perfecta de 90 grados, el uso de la escuadra y su presencia en marcos y ventanas.',
        xOffset: 45,
        subcategoryId: 666,
        additionalQuizzes: [1180],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-agudos-obtusos-llanos',
        label: 'Ángulos Agudos, Obtusos y Llanos',
        level: 2,
        type: 'critical',
        requires: ['g3-geo-nocion-angulo', 'g3-geo-angulo-recto-escuadra'],
        description: 'Clasifica ángulos comparándolos con el recto: agudos (más cerrados), obtusos (más abiertos) y llanos.',
        xOffset: 0,
        subcategoryId: 667,
        additionalQuizzes: [1181],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: EL MUNDO DE LOS TRIÁNGULOS
    // ==========================================
    {
        id: 'g3-geo-u2-triangulos',
        label: 'El Mundo de los Triángulos',
        level: 3,
        type: 'basic',
        requires: ['g3-geo-agudos-obtusos-llanos'],
        description: 'Clasifica triángulos según la medida de sus lados y según el tipo de ángulos que contienen.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-triangulos-por-lados',
        label: 'Triángulos: Equilátero, Isósceles y Escaleno',
        level: 4,
        type: 'basic',
        requires: ['g3-geo-u2-triangulos'],
        description: 'Mide y clasifica: 3 lados iguales (equilátero), 2 lados iguales (isósceles) y 3 lados distintos (escaleno).',
        xOffset: -45,
        subcategoryId: 668,
        additionalQuizzes: [1182],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-triangulos-por-angulos',
        label: 'Triángulos: Rectángulo, Acutángulo y Obtusángulo',
        level: 4,
        type: 'basic',
        requires: ['g3-geo-u2-triangulos'],
        description: 'Descubre triángulos con un ángulo recto (rectángulos), con tres ángulos agudos o con un ángulo obtuso.',
        xOffset: 45,
        subcategoryId: 669,
        additionalQuizzes: [1183],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-base-altura-triangulo',
        label: 'Base, Altura y Construcción de Triángulos',
        level: 5,
        type: 'critical',
        requires: ['g3-geo-triangulos-por-lados', 'g3-geo-triangulos-por-angulos'],
        description: 'Identifica la base, la altura y comprueba que al juntar los tres ángulos de un triángulo se forma una línea recta.',
        xOffset: 0,
        subcategoryId: 670,
        additionalQuizzes: [1184],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: CUADRILÁTEROS Y POLÍGONOS
    // ==========================================
    {
        id: 'g3-geo-u3-cuadrilateros',
        label: 'Cuadriláteros y Polígonos',
        level: 6,
        type: 'basic',
        requires: ['g3-geo-base-altura-triangulo'],
        description: 'Explora familias de figuras de cuatro o más lados, el paralelismo y los polígonos regulares.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-paralelogramos',
        label: 'Los Paralelogramos: Cuadrado, Rectángulo y Rombo',
        level: 7,
        type: 'basic',
        requires: ['g3-geo-u3-cuadrilateros'],
        description: 'Cuadriláteros con lados opuestos paralelos e iguales dos a dos: cuadrado, rectángulo, rombo y romboide.',
        xOffset: -45,
        subcategoryId: 671,
        additionalQuizzes: [1185],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-trapecios-trapezoides',
        label: 'Trapecios y Trapezoides: No Paralelogramos',
        level: 7,
        type: 'basic',
        requires: ['g3-geo-u3-cuadrilateros'],
        description: 'Distingue trapecios con solo dos lados paralelos y trapezoides sin ningún lado paralelo.',
        xOffset: 45,
        subcategoryId: 672,
        additionalQuizzes: [1186],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-poligonos-regulares',
        label: 'Polígonos de 5 a 8 Lados: Regulares e Irregulares',
        level: 8,
        type: 'applied',
        requires: ['g3-geo-paralelogramos', 'g3-geo-trapecios-trapezoides'],
        description: 'Identifica pentágonos, hexágonos y octágonos, y reconoce cuándo un polígono tiene todos sus lados iguales.',
        xOffset: 0,
        subcategoryId: 673,
        additionalQuizzes: [1187],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: LONGITUD, REGLA MÉTRICA Y PERÍMETRO
    // ==========================================
    {
        id: 'g3-geo-u4-perimetro',
        label: 'Longitud, Regla Métrica y Perímetro',
        level: 9,
        type: 'basic',
        requires: ['g3-geo-poligonos-regulares'],
        description: 'Pasa a la medición con unidades estandarizadas en centímetros y metros, y calcula perímetros formales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-metro-centimetro-regla',
        label: 'Medición con Regla: El Metro y el Centímetro',
        level: 10,
        type: 'basic',
        requires: ['g3-geo-u4-perimetro'],
        description: 'Usa correctamente la regla graduada midiendo desde el cero y aplica la relación 1 metro = 100 centímetros.',
        xOffset: -45,
        subcategoryId: 674,
        additionalQuizzes: [1188],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-perimetro-poligonos',
        label: 'Cálculo Formal del Perímetro: Suma de Lados',
        level: 10,
        type: 'critical',
        requires: ['g3-geo-u4-perimetro'],
        description: 'Calcula el perímetro sumando las medidas de todos los lados en triángulos, rectángulos y cuadrados.',
        xOffset: 45,
        subcategoryId: 675,
        additionalQuizzes: [1189],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-problemas-perimetro',
        label: 'Problemas Reales de Perímetro y Vallas',
        level: 11,
        type: 'applied',
        requires: ['g3-geo-metro-centimetro-regla', 'g3-geo-perimetro-poligonos'],
        description: 'Resuelve situaciones de la vida real: cercar huertos, colocar zócalos y hallar lados desconocidos.',
        xOffset: 0,
        subcategoryId: 676,
        additionalQuizzes: [1190],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: SUPERFICIE, ÁREA Y CUADRÍCULAS
    // ==========================================
    {
        id: 'g3-geo-u5-area',
        label: 'Superficie, Área y Cuadrículas',
        level: 12,
        type: 'basic',
        requires: ['g3-geo-problemas-perimetro'],
        description: 'Mide la superficie recubriendo con baldosas cuadradas y relaciona el área con la multiplicación.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-area-recubrimiento',
        label: 'Noción de Área: Recubrimiento con Baldosas (cm²)',
        level: 13,
        type: 'basic',
        requires: ['g3-geo-u5-area'],
        description: 'Mide superficies contando baldosas cuadradas de 1 cm² sin dejar huecos ni encimar baldosas.',
        xOffset: -45,
        subcategoryId: 677,
        additionalQuizzes: [1191],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-area-rectangulo-cuadrado',
        label: 'Área del Rectángulo y Cuadrado: Filas por Columnas',
        level: 13,
        type: 'critical',
        requires: ['g3-geo-u5-area'],
        description: 'Calcula el área multiplicando la base por la altura en rectángulos y el lado por lado en cuadrados.',
        xOffset: 45,
        subcategoryId: 678,
        additionalQuizzes: [1192],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-perimetro-vs-area',
        label: 'Perímetro vs Área y Figuras Compuestas',
        level: 14,
        type: 'applied',
        requires: ['g3-geo-area-recubrimiento', 'g3-geo-area-rectangulo-cuadrado'],
        description: 'Compara contorno (cm) con superficie (cm²), analiza figuras con igual perímetro y descompone figuras en L.',
        xOffset: 0,
        subcategoryId: 679,
        additionalQuizzes: [1193],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS 3D, DESARROLLOS Y PLANO CARTESIANO
    // ==========================================
    {
        id: 'g3-geo-u6-espacio-coordenadas',
        label: 'Cuerpos 3D, Desarrollos y Plano Cartesiano',
        level: 15,
        type: 'basic',
        requires: ['g3-geo-perimetro-vs-area'],
        description: 'Explora prismas, pirámides, sus plantillas desplegadas en cartulina y coordenadas (x, y) en el plano.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-geo-prismas-piramides',
        label: 'Prismas y Pirámides: Bases, Caras y Elementos',
        level: 16,
        type: 'basic',
        requires: ['g3-geo-u6-espacio-coordenadas'],
        description: 'Distingue prismas de pirámides contando bases, caras laterales, aristas y vértices en 3 dimensiones.',
        xOffset: -45,
        subcategoryId: 680,
        additionalQuizzes: [1194],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-desarrollos-planos',
        label: 'Desarrollos Planos: De la Cartulina al Sólido',
        level: 16,
        type: 'basic',
        requires: ['g3-geo-u6-espacio-coordenadas'],
        description: 'Identifica la plantilla desplegada en 2D que permite armar cubos, prismas y pirámides al doblar la cartulina.',
        xOffset: 45,
        subcategoryId: 681,
        additionalQuizzes: [1195],
        behavior: 'quiz_list'
    },
    {
        id: 'g3-geo-coordenadas-maestria',
        label: 'Coordenadas (x, y), Giros y Gran Corona de 3°',
        level: 17,
        type: 'evaluation',
        requires: ['g3-geo-prismas-piramides', 'g3-geo-desarrollos-planos'],
        description: 'Ubica pares ordenados (x, y) en el primer cuadrante y conquista la gran corona de maestría geométrica de 3°.',
        xOffset: 0,
        subcategoryId: 682,
        additionalQuizzes: [1196],
        behavior: 'quiz_list'
    }
];

