import { ArithmeticNode } from './arithmetic-map-data';

export const grade2GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: PUNTOS, LÍNEAS Y SEGMENTOS
    // ==========================================
    {
        id: 'g2-geo-u1-lineas',
        label: 'Puntos, Líneas y Segmentos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Explora marcas, huellas, trazos rectos, curvos, inclinados y caminos que se cortan o no.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-puntos-lineas',
        label: 'El Punto y Tipos de Líneas',
        level: 1,
        type: 'basic',
        requires: ['g2-geo-u1-lineas'],
        description: 'Reconoce el punto como marca en el espacio, y distingue líneas rectas, curvas y poligonales.',
        xOffset: -45,
        subcategoryId: 647,
        additionalQuizzes: [1161],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-posicion-lineas',
        label: 'Horizontales, Verticales e Inclinadas',
        level: 1,
        type: 'basic',
        requires: ['g2-geo-u1-lineas'],
        description: 'Identifica la orientación de las rectas: acostadas (horizontales), de pie (verticales) e inclinadas.',
        xOffset: 45,
        subcategoryId: 648,
        additionalQuizzes: [1162],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-paralelas-secantes',
        label: 'Líneas Paralelas y Secantes',
        level: 2,
        type: 'critical',
        requires: ['g2-geo-puntos-lineas', 'g2-geo-posicion-lineas'],
        description: 'Descubre las líneas que nunca se tocan como los rieles del tren y las que se cruzan en un punto.',
        xOffset: 0,
        subcategoryId: 649,
        additionalQuizzes: [1163],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-segmentos',
        label: 'Segmentos de Recta y sus Extremos',
        level: 3,
        type: 'applied',
        requires: ['g2-geo-paralelas-secantes'],
        description: 'Aprende qué es un segmento de recta con su punto de inicio y fin, y cuenta segmentos en figuras.',
        xOffset: 0,
        subcategoryId: 650,
        additionalQuizzes: [1164],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: FIGURAS PLANAS, LADOS Y VÉRTICES
    // ==========================================
    {
        id: 'g2-geo-u2-figuras',
        label: 'Figuras Planas, Lados y Vértices',
        level: 4,
        type: 'basic',
        requires: ['g2-geo-segmentos'],
        description: 'Descubre las partes de los polígonos: lados rectos y esquinas llamadas vértices.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-lados-vertices',
        label: 'Lados y Vértices en Figuras Planas',
        level: 5,
        type: 'basic',
        requires: ['g2-geo-u2-figuras'],
        description: 'Cuenta cuántos lados rectos y cuántos vértices o esquinas tiene cada figura geométrica.',
        xOffset: -45,
        subcategoryId: 651,
        additionalQuizzes: [1165],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-triangulos-formas',
        label: 'El Triángulo: 3 Lados y 3 Vértices',
        level: 5,
        type: 'basic',
        requires: ['g2-geo-u2-figuras'],
        description: 'Explora familias de triángulos en distintas posiciones y tamaños, todos con 3 lados y 3 esquinas.',
        xOffset: 45,
        subcategoryId: 652,
        additionalQuizzes: [1166],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-cuadrilateros',
        label: 'Cuadriláteros: Cuadrado, Rectángulo y Rombo',
        level: 6,
        type: 'critical',
        requires: ['g2-geo-lados-vertices', 'g2-geo-triangulos-formas'],
        description: 'Reconoce figuras de 4 lados: cuadrados con lados iguales, rectángulos alargados y rombos.',
        xOffset: 0,
        subcategoryId: 653,
        additionalQuizzes: [1167],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-poligonos-variados',
        label: 'Pentágonos, Hexágonos y Otros Polígonos',
        level: 7,
        type: 'applied',
        requires: ['g2-geo-cuadrilateros'],
        description: 'Descubre figuras de 5 lados (pentágonos) y 6 lados (hexágonos como los panales de abeja).',
        xOffset: 0,
        subcategoryId: 654,
        additionalQuizzes: [1168],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: EL CÍRCULO Y FIGURAS COMPUESTAS
    // ==========================================
    {
        id: 'g2-geo-u3-circulo',
        label: 'El Círculo y Figuras Compuestas',
        level: 8,
        type: 'basic',
        requires: ['g2-geo-poligonos-variados'],
        description: 'Aprende la diferencia entre borde e interior, y cómo crear figuras uniendo piezas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-circulo-circunferencia',
        label: 'Círculo y Circunferencia',
        level: 9,
        type: 'basic',
        requires: ['g2-geo-u3-circulo'],
        description: 'Distingue la línea exterior curva (circunferencia, como un aro) de la región completa (círculo).',
        xOffset: -45,
        subcategoryId: 655,
        additionalQuizzes: [1169],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-tangram-composicion',
        label: 'Componer y Descomponer Figuras (Tangram)',
        level: 9,
        type: 'applied',
        requires: ['g2-geo-u3-circulo'],
        description: 'Juega a armar casas, barcos y polígonos uniendo triángulos y cuadrados con el Tangram.',
        xOffset: 45,
        subcategoryId: 656,
        additionalQuizzes: [1170],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: CUERPOS GEOMÉTRICOS: CARAS, ARISTAS Y VÉRTICES
    // ==========================================
    {
        id: 'g2-geo-u4-solidos',
        label: 'Cuerpos Geométricos y Sólidos',
        level: 10,
        type: 'basic',
        requires: ['g2-geo-circulo-circunferencia', 'g2-geo-tangram-composicion'],
        description: 'Pasa del papel al mundo 3D: descubre caras planas, filos (aristas) y esquinas (vértices).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-cubo-prismas',
        label: 'El Cubo y los Prismas',
        level: 11,
        type: 'basic',
        requires: ['g2-geo-u4-solidos'],
        description: 'Descubre dados y cajas: cuenta sus 6 caras planas, sus 12 aristas rectas y sus 8 vértices.',
        xOffset: -45,
        subcategoryId: 657,
        additionalQuizzes: [1171],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-piramides',
        label: 'Las Pirámides y sus Caras',
        level: 11,
        type: 'basic',
        requires: ['g2-geo-u4-solidos'],
        description: 'Identifica pirámides con base cuadrada o triangular y caras laterales que suben a una sola punta.',
        xOffset: 45,
        subcategoryId: 658,
        additionalQuizzes: [1172],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-cuerpos-redondos',
        label: 'Cuerpos Redondos: Cilindro, Cono y Esfera',
        level: 12,
        type: 'critical',
        requires: ['g2-geo-cubo-prismas', 'g2-geo-piramides'],
        description: 'Cuerpos que ruedan: el cilindro con 2 bases circulares, el cono con 1 punta y la esfera sin esquinas.',
        xOffset: 0,
        subcategoryId: 659,
        additionalQuizzes: [1173],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: CUADRÍCULA, RECORRIDOS Y SIMETRÍA
    // ==========================================
    {
        id: 'g2-geo-u5-posicion',
        label: 'Cuadrícula, Recorridos y Simetría',
        level: 13,
        type: 'basic',
        requires: ['g2-geo-cuerpos-redondos'],
        description: 'Aprende a ubicar tesoros en mapas cuadriculados, seguir caminos con flechas y doblar en espejo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-coordenadas-cuadricula',
        label: 'Ubicación en la Cuadrícula',
        level: 14,
        type: 'basic',
        requires: ['g2-geo-u5-posicion'],
        description: 'Encuentra objetos usando filas y columnas con letras y números en un plano cuadriculado.',
        xOffset: -45,
        subcategoryId: 660,
        additionalQuizzes: [1174],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-trayectorias-desplazamiento',
        label: 'Trayectorias y Recorridos con Flechas',
        level: 14,
        type: 'basic',
        requires: ['g2-geo-u5-posicion'],
        description: 'Sigue y traza caminos guiados por pasos y flechas direccionales: arriba, abajo, izquierda y derecha.',
        xOffset: 45,
        subcategoryId: 661,
        additionalQuizzes: [1175],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-eje-simetria',
        label: 'El Eje de Simetría y Figuras Simétricas',
        level: 15,
        type: 'critical',
        requires: ['g2-geo-coordenadas-cuadricula', 'g2-geo-trayectorias-desplazamiento'],
        description: 'Descubre la línea del espejo que divide una figura en dos mitades exactamente iguales.',
        xOffset: 0,
        subcategoryId: 662,
        additionalQuizzes: [1176],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: PERÍMETRO Y GRAN MAESTRÍA DE 2°
    // ==========================================
    {
        id: 'g2-geo-u6-perimetro',
        label: 'Perímetro y Gran Maestría de Geometría',
        level: 16,
        type: 'basic',
        requires: ['g2-geo-eje-simetria'],
        description: 'Aprende a medir el contorno de figuras y demuestra tu dominio total en el gran desafío de 2°.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-geo-perimetro-intuitivo',
        label: 'El Perímetro: Contorno y Suma de Lados',
        level: 17,
        type: 'applied',
        requires: ['g2-geo-u6-perimetro'],
        description: 'Mide el contorno de figuras sumando las longitudes de sus lados como si caminaras por su borde.',
        xOffset: -30,
        subcategoryId: 663,
        additionalQuizzes: [1177],
        behavior: 'quiz_list'
    },
    {
        id: 'g2-geo-mastery-2',
        label: 'Corona Geométrica de 2° (Gran Reto)',
        level: 18,
        type: 'evaluation',
        requires: [],
        description: 'El gran reto integrador de 2° de Primaria: demuestra todo lo que sabes sobre líneas, figuras, sólidos y perímetros.',
        xOffset: 0,
        subcategoryId: 664,
        additionalQuizzes: [1178],
        behavior: 'quiz_list'
    }
];

