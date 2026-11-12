import { ArithmeticNode } from './arithmetic-map-data';

export const geometryMapNodes: ArithmeticNode[] = [
    // ==========================================
    // DOMINIO I: PERCEPCIÓN ESPACIAL Y FIGURAS FUNDAMENTALES (1° - 2°)
    // ==========================================
    {
        id: 'geom-d1',
        label: 'Dominio I: Percepción Espacial y Figuras Fundamentales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Fundamentos de orientación en el espacio, líneas, figuras planas básicas y primeros cuerpos geométricos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-orientacion-lineas-1',
        label: 'Orientación Espacial y Tipos de Líneas',
        level: 1,
        type: 'basic',
        requires: ['geom-d1'],
        description: 'Relaciones espaciales (arriba/abajo, delante/detrás, dentro/fuera) y trazo de líneas rectas, curvas, horizontales y verticales.',
        xOffset: -50,
        subcategoryId: 609,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-figuras-planas-solidos-1',
        label: 'Figuras Planas y Cuerpos del Entorno',
        level: 1,
        type: 'basic',
        requires: ['geom-d1'],
        description: 'Reconocimiento visual de círculo, triángulo, cuadrado, rectángulo y sólidos cotidianos (cubo, esfera, cilindro, cono).',
        xOffset: 50,
        subcategoryId: 610,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-lados-vertices-simetria-2',
        label: 'Lados, Vértices, Composición y Simetría',
        level: 2,
        type: 'applied',
        requires: ['geom-orientacion-lineas-1', 'geom-figuras-planas-solidos-1'],
        description: 'Conteo de lados y vértices, caras y aristas en sólidos, composición de figuras y noción intuitiva de simetría.',
        xOffset: 0,
        subcategoryId: 611,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO II: ÁNGULOS, POLÍGONOS Y MEDICIÓN DE ÁREAS (3° - 4°)
    // ==========================================
    {
        id: 'geom-d2',
        label: 'Dominio II: Ángulos, Polígonos y Superficies Planas',
        level: 3,
        type: 'basic',
        requires: ['geom-lados-vertices-simetria-2'],
        description: 'Concepto formal de ángulo, uso del transportador, clasificación de polígonos y primeras fórmulas de perímetro y área.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-angulos-transportador-rectas',
        label: 'Ángulos, Transportador y Relaciones de Rectas',
        level: 4,
        type: 'basic',
        requires: ['geom-d2'],
        description: 'Medición de ángulos en grados sexagesimales (agudo, recto, obtuso, llano) y rectas paralelas, perpendiculares y secantes.',
        xOffset: -60,
        subcategoryId: 612,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-triangulos-cuadrilateros-planos',
        label: 'Triángulos, Cuadriláteros y Suma Angular',
        level: 4,
        type: 'critical',
        requires: ['geom-d2'],
        description: 'Clasificación de triángulos por lados y ángulos, cuadriláteros (paralelogramos, trapecios) y propiedad fundamental: suma de ángulos internos = 180°.',
        xOffset: 60,
        subcategoryId: 613,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-perimetros-areas-coordenadas',
        label: 'Perímetros, Fórmulas de Área y Plano Cartesiano',
        level: 5,
        type: 'applied',
        requires: ['geom-angulos-transportador-rectas', 'geom-triangulos-cuadrilateros-planos'],
        description: 'Fórmulas de área para cuadrado, rectángulo y triángulo (b×h/2), unidades métricas (m², cm²) y ubicación de puntos (x, y) en el primer cuadrante.',
        xOffset: 0,
        subcategoryId: 614,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO III: POLÍGONOS REGULARES, CÍRCULO Y VOLUMEN (5° - 6°)
    // ==========================================
    {
        id: 'geom-d3',
        label: 'Dominio III: Polígonos Regulares, Circunferencia y Cuerpos 3D',
        level: 6,
        type: 'basic',
        requires: ['geom-perimetros-areas-coordenadas'],
        description: 'Elementos de polígonos regulares, número π, áreas avanzadas, desarrollos planos y noción de volumen.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-poligonos-regulares-circunferencia',
        label: 'Polígonos Regulares, Apotema y Circunferencia (π)',
        level: 7,
        type: 'basic',
        requires: ['geom-d3'],
        description: 'Centro, radio, diámetro, cuerda, recta tangente/secante, el número π y fórmulas de longitud (2πr) y área (πr² y P×ap/2).',
        xOffset: -60,
        subcategoryId: 615,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-poliedros-volumen-redondos',
        label: 'Poliedros, Cuerpos Redondos y Volumen',
        level: 7,
        type: 'critical',
        requires: ['geom-d3'],
        description: 'Prismas, pirámides, cilindros, conos, esferas, Teorema de Euler (C+V=A+2) y volumen de cubos y prismas rectos en m³ y litros.',
        xOffset: 60,
        subcategoryId: 616,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-angulos-paralelas-transversal',
        label: 'Ángulos entre Paralelas, Secante y Polígonos',
        level: 8,
        type: 'applied',
        requires: ['geom-poligonos-regulares-circunferencia', 'geom-poliedros-volumen-redondos'],
        description: 'Ángulos alternos internos, alternos externos, correspondientes, conjugados y suma de ángulos interiores de polígonos: (n-2)×180°.',
        xOffset: 0,
        subcategoryId: 617,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO IV: CONSTRUCCIONES, PUNTOS NOTABLES Y CONGRUENCIA (7°)
    // ==========================================
    {
        id: 'geom-d4',
        label: 'Dominio IV: Construcciones Geométricas y Congruencia',
        level: 9,
        type: 'basic',
        requires: ['geom-angulos-paralelas-transversal'],
        description: 'Trazados clásicos con regla y compás, líneas notables del triángulo, criterios de congruencia y transformaciones isométricas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-construcciones-lineas-notables',
        label: 'Regla y Compás: Mediatriz, Bisectriz y Puntos Notables',
        level: 10,
        type: 'basic',
        requires: ['geom-d4'],
        description: 'Trazado de mediatrices (circuncentro), bisectrices (incentro), alturas (ortocentro) y medianas (baricentro en razón 2:1).',
        xOffset: -55,
        subcategoryId: 618,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-congruencia-isometrias',
        label: 'Criterios de Congruencia e Isometrías en ℝ²',
        level: 10,
        type: 'critical',
        requires: ['geom-d4'],
        description: 'Criterios LLL, LAL, ALA en triángulos; traslaciones vectoriales, rotaciones con centro/ángulo y reflexiones axiales en 4 cuadrantes.',
        xOffset: 55,
        subcategoryId: 619,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO V: TEOREMAS FUNDAMENTALES, SEMEJANZA Y TALES (8°)
    // ==========================================
    {
        id: 'geom-d5',
        label: 'Dominio V: Teoremas de Pitágoras, Tales y Semejanza',
        level: 11,
        type: 'basic',
        requires: ['geom-construcciones-lineas-notables', 'geom-congruencia-isometrias'],
        description: 'Demostración y aplicaciones del Teorema de Pitágoras, proporcionalidad de Tales, semejanza y cuerpos compuestos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-teorema-pitagoras-notables',
        label: 'Teorema de Pitágoras y Triángulos Especiales',
        level: 12,
        type: 'critical',
        requires: ['geom-d5'],
        description: 'Demostración geométrica (a²+b²=c²), cálculo de catetos/hipotenusa, triángulos notables 30°-60°-90° y 45°-45°-90°, y problemas de distancias.',
        xOffset: -65,
        subcategoryId: 620,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-tales-semejanza-escalas',
        label: 'Teorema de Tales, Semejanza y Escalas',
        level: 12,
        type: 'critical',
        requires: ['geom-d5'],
        description: 'Proporcionalidad de segmentos paralelos (Tales), criterios de semejanza (AA, LLL, LAL), escalas y cálculo de alturas inaccesibles mediante sombras.',
        xOffset: 65,
        subcategoryId: 621,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-esfera-cuerpos-compuestos',
        label: 'Área y Volumen de la Esfera y Cuerpos Compuestos',
        level: 13,
        type: 'applied',
        requires: ['geom-teorema-pitagoras-notables', 'geom-tales-semejanza-escalas'],
        description: 'Superficie esférica (4πr²), volumen esférico (4/3 πr³) y modelado de sólidos combinados (cilindros con semiesferas y conos).',
        xOffset: 0,
        subcategoryId: 622,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VI: RELACIONES MÉTRICAS, TRIGONOMETRÍA Y CÓNICAS (9°)
    // ==========================================
    {
        id: 'geom-d6',
        label: 'Dominio VI: Relaciones Métricas, Trigonometría y Secciones Cónicas',
        level: 14,
        type: 'basic',
        requires: ['geom-esfera-cuerpos-compuestos'],
        description: 'Teoremas de la altura y del cateto, razones trigonométricas, lugares geométricos, secciones cónicas y sólidos truncados.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-metricas-trigonometria-basica',
        label: 'Relaciones Métricas en Triángulos y Trigonometría Básica',
        level: 15,
        type: 'basic',
        requires: ['geom-d6'],
        description: 'Teorema de la altura (h²=m·n), teorema del cateto (a²=c·m) e iniciación a razones trigonométricas: seno, coseno y tangente.',
        xOffset: -60,
        subcategoryId: 623,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-lugares-conicas-truncados',
        label: 'Lugares Geométricos, Cónicas Intuitivas y Cuerpos Truncados',
        level: 15,
        type: 'applied',
        requires: ['geom-d6'],
        description: 'Cortes de un cono con un plano (circunferencia, elipse, parábola, hipérbola), áreas y volúmenes de troncos de pirámide y cono.',
        xOffset: 60,
        subcategoryId: 624,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VII: GEOMETRÍA ANALÍTICA DEL PLANO (10° - 11°)
    // ==========================================
    {
        id: 'geom-d7',
        label: 'Dominio VII: Geometría Analítica del Plano y las Cónicas',
        level: 16,
        type: 'basic',
        requires: ['geom-metricas-trigonometria-basica', 'geom-lugares-conicas-truncados'],
        description: 'Estudio algebraico de la recta, distancia entre puntos, punto medio y ecuaciones analíticas de las secciones cónicas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-recta-analitica-plano',
        label: 'La Recta Analítica: Pendiente, Ecuaciones y Paralelismo',
        level: 17,
        type: 'critical',
        requires: ['geom-d7'],
        description: 'Distancia euclidiana, punto medio, pendiente m, ecuación punto-pendiente, general y condiciones m₁=m₂ y m₁·m₂=-1.',
        xOffset: -55,
        subcategoryId: 625,
        behavior: 'quiz_list'
    },
    {
        id: 'geom-conicas-analiticas-circunferencia',
        label: 'Ecuaciones de la Circunferencia, Parábola y Elipse',
        level: 17,
        type: 'applied',
        requires: ['geom-d7'],
        description: 'Ecuación ordinaria y general de la circunferencia (x-h)²+(y-k)²=r², focos, directriz y elementos canónicos de cónicas.',
        xOffset: 55,
        subcategoryId: 626,
        behavior: 'quiz_list'
    },

    // ==========================================
    // DOMINIO VIII: GEOMETRÍA ESPACIAL 3D Y VECTORES (11°)
    // ==========================================
    {
        id: 'geom-d8',
        label: 'Dominio VIII: Vectores y Geometría en el Espacio ℝ³',
        level: 18,
        type: 'applied',
        requires: ['geom-recta-analitica-plano', 'geom-conicas-analiticas-circunferencia'],
        description: 'Espacio euclidiano tridimensional ℝ³, rectas y planos en el espacio, producto escalar y vectorial.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'geom-espacio-vectores-3d',
        label: 'Coordenadas en ℝ³, Planos, Rectas y Producto Vectorial',
        level: 19,
        type: 'evaluation',
        requires: ['geom-d8'],
        description: 'Ecuaciones paramétricas de rectas en el espacio, ecuación general del plano y aplicaciones con vectores tridimensionales.',
        xOffset: 0,
        subcategoryId: 627,
        behavior: 'quiz_list'
    },

    // ==========================================
    // CORONA SUPREMA DE MAESTRÍA EN GEOMETRÍA (DESVINCULADA)
    // ==========================================
    {
        id: 'geom-mastery',
        label: 'Pantocrátor de la Geometría Universal • Maestría de 1° a 11°',
        level: 20,
        type: 'evaluation',
        requires: [],
        description: 'Máximo galardón del pensamiento espacial y métrico. Domina la geometría euclidiana, transformaciones, teoremas de Pitágoras y Tales, trigonometría, sólidos 3D y geometría analítica.',
        xOffset: 0,
        subcategoryId: 628,
        behavior: 'quiz_list'
    }
];

