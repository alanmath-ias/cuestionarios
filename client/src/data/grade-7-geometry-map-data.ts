import { ArithmeticNode } from './arithmetic-map-data';

export const grade7GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CIMIENTOS EUCLIDIANOS Y CONSTRUCCIONES CON REGLA Y COMPÁS
    // ==========================================
    {
        id: 'g7-geo-u1-construcciones-compas',
        label: 'Cimientos y Construcciones con Regla y Compás',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Postulados euclidianos, congruencia de segmentos, trazado de paralelas y perpendiculares, y construcciones geométricas de precisión con regla y compás.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-postulados-transporte-segmentos',
        label: 'Postulados Euclidianos, Posiciones Relativas y Transporte de Segmentos',
        level: 1,
        type: 'basic',
        requires: ['g7-geo-u1-construcciones-compas'],
        description: 'Axiomas fundamentales, relaciones de incidencia, transporte exacto de segmentos con compás (sin regla graduada) y construcción de rectas paralelas y perpendiculares.',
        xOffset: -45,
        subcategoryId: 737,
        additionalQuizzes: [1251],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-construccion-mediatriz-biseccion',
        label: 'Construcción Formal de la Mediatriz y División de Segmentos',
        level: 1,
        type: 'basic',
        requires: ['g7-geo-u1-construcciones-compas'],
        description: 'Construcción de la mediatriz con arcos secantes, caracterización como lugar geométrico de puntos equidistantes y división de segmentos en potencias de 2 partes congruentes.',
        xOffset: 45,
        subcategoryId: 738,
        additionalQuizzes: [1252],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-construccion-bisectriz-transporte-angulos',
        label: 'Construcción de la Bisectriz y Transporte de Ángulos Congruentes',
        level: 2,
        type: 'basic',
        requires: ['g7-geo-postulados-transporte-segmentos', 'g7-geo-construccion-mediatriz-biseccion'],
        description: 'Trazado exacto de la bisectriz de un ángulo con compás, equidistancia a los lados del ángulo y reproducción fiel de ángulos congruentes sobre semirrectas arbitrarias.',
        xOffset: 0,
        subcategoryId: 739,
        additionalQuizzes: [1253],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: GEOMETRÍA DEL TRIÁNGULO: DESIGUALDADES, ISÓSCELES Y PUNTOS NOTABLES
    // ==========================================
    {
        id: 'g7-geo-u2-triangulos-desigualdad-puntos-notables',
        label: 'Geometría del Triángulo: Desigualdades y Puntos Notables',
        level: 3,
        type: 'basic',
        requires: ['g7-geo-construccion-bisectriz-transporte-angulos'],
        description: 'Propiedades simétricas del triángulo isósceles, teorema de la desigualdad triangular para existencia de triángulos y estudio profundo de los cuatro puntos notables.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-triangulo-isosceles-propiedades-avanzadas',
        label: 'Propiedades Avanzadas del Triángulo Isósceles y Equilátero',
        level: 4,
        type: 'basic',
        requires: ['g7-geo-u2-triangulos-desigualdad-puntos-notables'],
        description: 'Teorema de los ángulos basales congruentes, eje de simetría axial y coincidencia de altura, mediana, mediatriz y bisectriz relativas a la base.',
        xOffset: -45,
        subcategoryId: 740,
        additionalQuizzes: [1254],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-desigualdad-triangular-existencia',
        label: 'Teorema de la Desigualdad Triangular y Existencia de Triángulos',
        level: 4,
        type: 'basic',
        requires: ['g7-geo-u2-triangulos-desigualdad-puntos-notables'],
        description: 'Criterio fundamental de existencia de triángulos (a + b > c, |a - b| < c) y relación de orden entre ángulos y lados opuestos en todo triángulo.',
        xOffset: 45,
        subcategoryId: 741,
        additionalQuizzes: [1255],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-puntos-notables-triangulo-recta-euler',
        label: 'Los Cuatro Puntos Notables del Triángulo y la Recta de Euler',
        level: 5,
        type: 'critical',
        requires: ['g7-geo-triangulo-isosceles-propiedades-avanzadas', 'g7-geo-desigualdad-triangular-existencia'],
        description: 'Circuncentro (mediatrices), Incentro (bisectrices), Baricentro (medianas, centro de gravedad en razón 2:1), Ortocentro (alturas) y su alineación en la Recta de Euler.',
        xOffset: 0,
        subcategoryId: 742,
        additionalQuizzes: [1256],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: CUADRILÁTEROS ESPECIALES (COMETAS Y TRAPECIOS) Y CÍRCULO
    // ==========================================
    {
        id: 'g7-geo-u3-cuadrilateros-cometas-circulo',
        label: 'Cuadriláteros Especiales (Cometas y Trapecios) y Círculo',
        level: 6,
        type: 'basic',
        requires: ['g7-geo-puntos-notables-triangulo-recta-euler'],
        description: 'Paralelogramos y diagonales, trapecios isósceles, deltoides (cometas) con ejes de simetría y perpendicularidad, y teoremas de tangencia en la circunferencia.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-paralelogramos-propiedades-diagonales',
        label: 'Paralelogramos Especiales y Propiedades de sus Diagonales',
        level: 7,
        type: 'basic',
        requires: ['g7-geo-u3-cuadrilateros-cometas-circulo'],
        description: 'Bisección mutua de diagonales, congruencia en rectángulos, perpendicularidad y bisectrices en rombos, y propiedades compuestas en el cuadrado.',
        xOffset: -45,
        subcategoryId: 743,
        additionalQuizzes: [1257],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-trapecios-cometas-deltoides-simetria',
        label: 'Trapecios y Cometas (Deltoides): Ejes de Simetría y Diagonales',
        level: 7,
        type: 'basic',
        requires: ['g7-geo-u3-cuadrilateros-cometas-circulo'],
        description: 'Deltoides/cometas: dos pares de lados consecutivos congruentes, diagonales perpendiculares y eje de simetría. Trapecios escalenos, rectángulos e isósceles.',
        xOffset: 45,
        subcategoryId: 744,
        additionalQuizzes: [1258],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-circulo-circunferencia-tangentes-cuerdas',
        label: 'Círculo y Circunferencia: Radio, Tangentes, Cuerdas y Arcos',
        level: 8,
        type: 'basic',
        requires: ['g7-geo-paralelogramos-propiedades-diagonales', 'g7-geo-trapecios-cometas-deltoides-simetria'],
        description: 'Teorema de la recta tangente perpendicular al radio en el punto de contacto (90°), cuerdas, secantes, ángulos centrales, arcos interceptados y longitud C = 2πr.',
        xOffset: 0,
        subcategoryId: 745,
        additionalQuizzes: [1259],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: EL PLANO CARTESIANO EN ℤ × ℤ Y TRANSFORMACIONES ISOMÉTRICAS
    // ==========================================
    {
        id: 'g7-geo-u4-plano-cartesiano-isometrias-analiticas',
        label: 'El Plano Cartesiano en ℤ × ℤ y Movimientos Rígidos',
        level: 9,
        type: 'basic',
        requires: ['g7-geo-circulo-circunferencia-tangentes-cuerdas'],
        description: 'Geometría de coordenadas en los cuatro cuadrantes con enteros, vectores de traslación, reflexiones analíticas sobre ejes y rotaciones formales alrededor del origen.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-plano-cartesiano-enteros-cuadrantes',
        label: 'El Plano Cartesiano Completo con Coordenadas Enteras (ℤ × ℤ)',
        level: 10,
        type: 'basic',
        requires: ['g7-geo-u4-plano-cartesiano-isometrias-analiticas'],
        description: 'Localización de pares ordenados (x, y) en los cuatro cuadrantes con números enteros negativos y positivos, distancias ortogonales Δx y Δy, y polígonos cartesianos.',
        xOffset: -45,
        subcategoryId: 746,
        additionalQuizzes: [1260],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-traslaciones-vectores-desplazamiento',
        label: 'Traslaciones en el Plano Mediante Vectores Direccionales',
        level: 10,
        type: 'basic',
        requires: ['g7-geo-u4-plano-cartesiano-isometrias-analiticas'],
        description: 'Regla analítica de traslación (x, y) → (x + a, y + b) mediante vectores directores con componentes enteras, desplazamientos sucesivos y congruencia de figuras trasladadas.',
        xOffset: 45,
        subcategoryId: 747,
        additionalQuizzes: [1261],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-reflexiones-axiales-rotaciones-origen',
        label: 'Reflexiones Axiales y Rotaciones Formales Alrededor del Origen',
        level: 11,
        type: 'basic',
        requires: ['g7-geo-plano-cartesiano-enteros-cuadrantes', 'g7-geo-traslaciones-vectores-desplazamiento'],
        description: 'Reflexiones sobre el eje X (x, -y), eje Y (-x, y) y la diagonal y = x. Rotaciones horarias y antihorarias de 90°, 180° y 270° centradas en el origen O(0, 0).',
        xOffset: 0,
        subcategoryId: 748,
        additionalQuizzes: [1262],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: CRITERIOS DE CONGRUENCIA, HOMOTECIAS Y SEMEJANZA
    // ==========================================
    {
        id: 'g7-geo-u5-congruencia-homotecias-semejanza',
        label: 'Criterios de Congruencia, Homotecias y Semejanza',
        level: 12,
        type: 'basic',
        requires: ['g7-geo-reflexiones-axiales-rotaciones-origen'],
        description: 'Criterios formales de congruencia de triángulos, transformaciones no rígidas por homotecia con factor de escala k, semejanza de polígonos y resolución de problemas de escala.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-criterios-congruencia-triangulos',
        label: 'Criterios Formales de Congruencia de Triángulos (LLL, LAL, ALA)',
        level: 13,
        type: 'basic',
        requires: ['g7-geo-u5-congruencia-homotecias-semejanza'],
        description: 'Postulados de congruencia Lado-Lado-Lado (LLL), Lado-Ángulo-Lado (LAL) y Ángulo-Lado-Ángulo (ALA). Deducción de lados y ángulos homólogos correspondientes.',
        xOffset: -45,
        subcategoryId: 749,
        additionalQuizzes: [1263],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-homotecias-centro-factor-escala',
        label: 'Homotecias en el Plano Cartesiano: Centro y Factor de Escala',
        level: 13,
        type: 'basic',
        requires: ['g7-geo-u5-congruencia-homotecias-semejanza'],
        description: 'Transformación (x, y) → (k·x, k·y) con centro en el origen O. Interpretación de ampliaciones (k > 1), reducciones (0 < k < 1) e inversiones simétricas (k < 0).',
        xOffset: 45,
        subcategoryId: 750,
        additionalQuizzes: [1264],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-semejanza-poligonos-medicion-indirecta',
        label: 'Semejanza de Polígonos y Problemas de Medición Indirecta',
        level: 14,
        type: 'basic',
        requires: ['g7-geo-criterios-congruencia-triangulos', 'g7-geo-homotecias-centro-factor-escala'],
        description: 'Condiciones de semejanza: ángulos congruentes y lados homólogos proporcionales (razón de semejanza r). Aplicaciones prácticas a cálculo de sombras, maquetas y alturas.',
        xOffset: 0,
        subcategoryId: 751,
        additionalQuizzes: [1265],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: PENSAMIENTO MÉTRICO: ÁREAS COMPUESTAS, VOLÚMENES Y SÓLIDOS
    // ==========================================
    {
        id: 'g7-geo-u6-metrico-areas-compuestas-volumenes',
        label: 'Pensamiento Métrico: Áreas Compuestas, Volúmenes y Sólidos',
        level: 15,
        type: 'basic',
        requires: ['g7-geo-semejanza-poligonos-medicion-indirecta'],
        description: 'Factores de conversión métrica en longitud, superficie, volumen y capacidad, cálculo de áreas compuestas y regiones sombreadas, y volúmenes de prismas, cilindros y pirámides.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-geo-sistema-metrico-conversion-avanzada',
        label: 'Conversión Avanzada en el Sistema Métrico Decimal',
        level: 16,
        type: 'basic',
        requires: ['g7-geo-u6-metrico-areas-compuestas-volumenes'],
        description: 'Conversión multidireccional en el sistema métrico: superficie (m², cm², mm², ha), volumen (m³, dm³, cm³) y capacidad líquida (1 m³ = 1000 L, 1 dm³ = 1 L, 1 cm³ = 1 mL).',
        xOffset: -45,
        subcategoryId: 752,
        additionalQuizzes: [1266],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-areas-figuras-compuestas-regiones-sombreadas',
        label: 'Áreas de Figuras Compuestas y Regiones Circulares Sombreadas',
        level: 16,
        type: 'basic',
        requires: ['g7-geo-u6-metrico-areas-compuestas-volumenes'],
        description: 'Descomposición aditiva y sustractiva de áreas compuestas por triángulos, trapecios, rombos y sectores/coronas circulares en situaciones de ingeniería y arquitectura.',
        xOffset: 45,
        subcategoryId: 753,
        additionalQuizzes: [1267],
        behavior: 'quiz_list'
    },
    {
        id: 'g7-geo-volumen-prismas-cilindros-gran-corona',
        label: 'Superficie, Volumen de Cuerpos del Espacio y Gran Corona de 7°',
        level: 17,
        type: 'evaluation',
        requires: ['g7-geo-sistema-metrico-conversion-avanzada', 'g7-geo-areas-figuras-compuestas-regiones-sombreadas'],
        description: 'Cálculo de área lateral, área total y volumen de prismas rectos (V = A_b × h), cilindros rectos (V = πr²h) y pirámides (V = (1/3)A_b × h), y Gran Corona de Geometría de 7°.',
        xOffset: 0,
        subcategoryId: 754,
        additionalQuizzes: [1268],
        behavior: 'quiz_list'
    }
];
