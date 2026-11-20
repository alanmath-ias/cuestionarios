import { ArithmeticNode } from './arithmetic-map-data';

export const grade4GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: ÁNGULOS, EL TRANSPORTADOR Y RELACIONES DE RECTAS
    // ==========================================
    {
        id: 'g4-geo-u1-angulos-rectas',
        label: 'Ángulos, Transportador y Rectas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Domina la medición en grados con el transportador, clasifica ángulos y descubre las rectas paralelas y perpendiculares.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-transportador-grados',
        label: 'El Transportador y Grados Sexagesimales',
        level: 1,
        type: 'basic',
        requires: ['g4-geo-u1-angulos-rectas'],
        description: 'Aprende a ubicar el centro y la línea de base del transportador para medir ángulos exactos de 0° a 180°.',
        xOffset: -45,
        subcategoryId: 683,
        additionalQuizzes: [1197],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-clasificacion-construccion-angulos',
        label: 'Estimación y Construcción de Ángulos',
        level: 1,
        type: 'basic',
        requires: ['g4-geo-u1-angulos-rectas'],
        description: 'Clasifica y traza ángulos agudos, rectos, obtusos y llanos, y reconoce ángulos complementarios y suplementarios.',
        xOffset: 45,
        subcategoryId: 684,
        additionalQuizzes: [1198],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-rectas-paralelas-perpendiculares',
        label: 'Rectas Paralelas, Secantes y Perpendiculares',
        level: 2,
        type: 'critical',
        requires: ['g4-geo-transportador-grados', 'g4-geo-clasificacion-construccion-angulos'],
        description: 'Identifica y traza rectas que nunca se cruzan (paralelas) y rectas que forman esquinas de 90° (perpendiculares).',
        xOffset: 0,
        subcategoryId: 685,
        additionalQuizzes: [1199],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TRIÁNGULOS, SUMA ANGULAR Y CUADRILÁTEROS
    // ==========================================
    {
        id: 'g4-geo-u2-triangulos-cuadrilateros',
        label: 'Triángulos y Cuadriláteros Avanzados',
        level: 3,
        type: 'basic',
        requires: ['g4-geo-rectas-paralelas-perpendiculares'],
        description: 'Clasificación cruzada de triángulos, la suma mágica de 180° y propiedades de cuadriláteros y diagonales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-clasificacion-cruzada-triangulos',
        label: 'Clasificación Cruzada de Triángulos',
        level: 4,
        type: 'basic',
        requires: ['g4-geo-u2-triangulos-cuadrilateros'],
        description: 'Combina lados y ángulos al mismo tiempo: descubre triángulos rectángulos isósceles, obtusángulos escalenos y más.',
        xOffset: -45,
        subcategoryId: 686,
        additionalQuizzes: [1200],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-suma-angulos-triangulo',
        label: 'Suma Angular de Triángulos (180°)',
        level: 4,
        type: 'critical',
        requires: ['g4-geo-u2-triangulos-cuadrilateros'],
        description: 'Descubre que los tres ángulos internos de cualquier triángulo siempre suman 180° y calcula ángulos desconocidos.',
        xOffset: 45,
        subcategoryId: 687,
        additionalQuizzes: [1201],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-cuadrilateros-diagonales',
        label: 'Cuadriláteros, Diagonales y Suma (360°)',
        level: 5,
        type: 'applied',
        requires: ['g4-geo-clasificacion-cruzada-triangulos', 'g4-geo-suma-angulos-triangulo'],
        description: 'Paralelogramos, trapecios, propiedades de sus diagonales y la suma de sus 4 ángulos internos igual a 360°.',
        xOffset: 0,
        subcategoryId: 688,
        additionalQuizzes: [1202],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: POLÍGONOS REGULARES, DIAGONALES Y SIMETRÍA
    // ==========================================
    {
        id: 'g4-geo-u3-poligonos-simetria',
        label: 'Polígonos Regulares y Simetría',
        level: 6,
        type: 'basic',
        requires: ['g4-geo-cuadrilateros-diagonales'],
        description: 'Descubre polígonos de 3 a 10 lados, traza diagonales desde un vértice y halla múltiples ejes de simetría.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-poligonos-regulares-nombres',
        label: 'Polígonos de 3 a 10 Lados',
        level: 7,
        type: 'basic',
        requires: ['g4-geo-u3-poligonos-simetria'],
        description: 'Pentágonos, hexágonos, heptágonos, octágonos, eneágonos y decágonos: lados y ángulos iguales.',
        xOffset: -45,
        subcategoryId: 689,
        additionalQuizzes: [1203],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-diagonales-triangulacion',
        label: 'Vértices, Lados y Diagonales',
        level: 7,
        type: 'basic',
        requires: ['g4-geo-u3-poligonos-simetria'],
        description: 'Une vértices no consecutivos para trazar diagonales y divide polígonos en triángulos para entender sus ángulos.',
        xOffset: 45,
        subcategoryId: 690,
        additionalQuizzes: [1204],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-ejes-simetria-axial',
        label: 'Ejes de Simetría en Polígonos',
        level: 8,
        type: 'applied',
        requires: ['g4-geo-poligonos-regulares-nombres', 'g4-geo-diagonales-triangulacion'],
        description: 'Identifica todos los ejes de simetría de figuras regulares y completa dibujos simétricos en cuadrícula.',
        xOffset: 0,
        subcategoryId: 691,
        additionalQuizzes: [1205],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: TRANSFORMACIONES EN EL PLANO Y COORDENADAS
    // ==========================================
    {
        id: 'g4-geo-u4-transformaciones-plano',
        label: 'Transformaciones y Coordenadas',
        level: 9,
        type: 'basic',
        requires: ['g4-geo-ejes-simetria-axial'],
        description: 'Mueve figuras en el plano cartesiano mediante traslaciones vectoriales, giros de 90° y 180°, y reflexiones en espejo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-plano-cartesiano-coordenadas',
        label: 'Plano Cartesiano y Pares (x, y)',
        level: 10,
        type: 'basic',
        requires: ['g4-geo-u4-transformaciones-plano'],
        description: 'Ejes X e Y ampliados de 0 a 10: ubica puntos, lee coordenadas precisas y une vértices para formar polígonos.',
        xOffset: -45,
        subcategoryId: 692,
        additionalQuizzes: [1206],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-traslacion-figuras',
        label: 'Traslación en Cuadrícula y Vectores',
        level: 10,
        type: 'basic',
        requires: ['g4-geo-u4-transformaciones-plano'],
        description: 'Desplaza polígonos siguiendo instrucciones de movimiento (derecha/izquierda, arriba/abajo) manteniendo forma y tamaño.',
        xOffset: 45,
        subcategoryId: 693,
        additionalQuizzes: [1207],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-rotacion-reflexion',
        label: 'Rotaciones (Giros) y Reflexiones',
        level: 11,
        type: 'applied',
        requires: ['g4-geo-plano-cartesiano-coordenadas', 'g4-geo-traslacion-figuras'],
        description: 'Aplica giros de 90° y 180° en sentido horario y antihorario, y realiza reflexiones respecto a un eje.',
        xOffset: 0,
        subcategoryId: 694,
        additionalQuizzes: [1208],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PERÍMETRO, FÓRMULAS DE ÁREA Y MEDICIÓN MÉTRICA
    // ==========================================
    {
        id: 'g4-geo-u5-perimetro-area-compuestas',
        label: 'Fórmulas de Perímetro y Área',
        level: 12,
        type: 'basic',
        requires: ['g4-geo-rotacion-reflexion'],
        description: 'Fórmulas de perímetro y área para rectángulos, cuadrados y triángulos, conversión métrica y superficies compuestas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-formulas-perimetro',
        label: 'Fórmulas Formales de Perímetro',
        level: 13,
        type: 'basic',
        requires: ['g4-geo-u5-perimetro-area-compuestas'],
        description: 'Calcula perímetros con fórmulas formales (P = 2b + 2h, P = n × l) y homogeneiza unidades métricas (m, cm, km).',
        xOffset: -45,
        subcategoryId: 695,
        additionalQuizzes: [1209],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-formulas-area-triangulo',
        label: 'Áreas: Rectángulo, Cuadrado y Triángulo',
        level: 13,
        type: 'critical',
        requires: ['g4-geo-u5-perimetro-area-compuestas'],
        description: 'Aplica A = b × h, A = l² y deduce que el área de cualquier triángulo es la mitad de un rectángulo: (b × h) / 2.',
        xOffset: 45,
        subcategoryId: 696,
        additionalQuizzes: [1210],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-areas-compuestas-terrenos',
        label: 'Áreas Compuestas y Problemas Reales',
        level: 14,
        type: 'applied',
        requires: ['g4-geo-formulas-perimetro', 'g4-geo-formulas-area-triangulo'],
        description: 'Descompón figuras en L y polígonos complejos en rectángulos y triángulos, y halla áreas sombreadas en terrenos reales.',
        xOffset: 0,
        subcategoryId: 697,
        additionalQuizzes: [1211],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS GEOMÉTRICOS 3D, DESARROLLOS Y NOCIÓN DE VOLUMEN
    // ==========================================
    {
        id: 'g4-geo-u6-solidos-volumen',
        label: 'Cuerpos 3D, Desarrollos y Volumen',
        level: 15,
        type: 'basic',
        requires: ['g4-geo-areas-compuestas-terrenos'],
        description: 'Poliedros, relación de Euler, plantillas complejas de prismas y pirámides, y volumen en cubos unidad (cm³).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-geo-poliedros-euler',
        label: 'Poliedros, Elementos y Relación de Euler',
        level: 16,
        type: 'basic',
        requires: ['g4-geo-u6-solidos-volumen'],
        description: 'Cuenta caras, vértices y aristas en prismas y pirámides, y comprueba la fórmula mágica: Caras + Vértices = Aristas + 2.',
        xOffset: -45,
        subcategoryId: 698,
        additionalQuizzes: [1212],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-desarrollos-planos-avanzados',
        label: 'Desarrollos Planos de Prismas y Pirámides',
        level: 16,
        type: 'basic',
        requires: ['g4-geo-u6-solidos-volumen'],
        description: 'Analiza plantillas de plegado desplegadas en cartulina e identifica qué desarrollos forman sólidos válidos.',
        xOffset: 45,
        subcategoryId: 699,
        additionalQuizzes: [1213],
        behavior: 'quiz_list'
    },
    {
        id: 'g4-geo-volumen-cubos-maestria',
        label: 'Noción de Volumen (cm³) y Corona de 4°',
        level: 17,
        type: 'evaluation',
        requires: ['g4-geo-poliedros-euler', 'g4-geo-desarrollos-planos-avanzados'],
        description: 'Mide el espacio ocupado contando cubos unidad de 1 cm³ (pisos × filas × columnas) y conquista la Gran Corona de 4°.',
        xOffset: 0,
        subcategoryId: 700,
        additionalQuizzes: [1214],
        behavior: 'quiz_list'
    }
];

