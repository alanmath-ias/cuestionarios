import { ArithmeticNode } from './arithmetic-map-data';

export const grade6GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: ELEMENTOS FUNDAMENTALES, PARALELISMO Y ÁNGULOS ENTRE SECANTES
    // ==========================================
    {
        id: 'g6-geo-u1-paralelismo-angulos',
        label: 'Elementos, Paralelismo y Ángulos entre Secantes',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Formalización de axiomas euclidianos, notación matemática rigurosa, relaciones angulares con álgebra y rectas paralelas cortadas por secante.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-elementos-primitivos-notacion',
        label: 'Elementos Primitivos, Notación Formal y Posiciones de Rectas',
        level: 1,
        type: 'basic',
        requires: ['g6-geo-u1-paralelismo-angulos'],
        description: 'Define punto, recta, plano, rayo y segmento. Emplea notación simbólica formal y clasifica rectas secantes, paralelas, perpendiculares y coincidentes.',
        xOffset: -45,
        subcategoryId: 719,
        additionalQuizzes: [1233],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-relaciones-angulares-ecuaciones',
        label: 'Relaciones Angulares y Ecuaciones Lineales Básicas',
        level: 1,
        type: 'basic',
        requires: ['g6-geo-u1-paralelismo-angulos'],
        description: 'Analiza ángulos adyacentes, complementarios (90°), suplementarios (180°) y opuestos por el vértice resolviendo ecuaciones de primer grado sencillas.',
        xOffset: 45,
        subcategoryId: 720,
        additionalQuizzes: [1234],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-paralelas-transversal-angulos',
        label: 'Rectas Paralelas Cortadas por una Secante (Transversal)',
        level: 2,
        type: 'basic',
        requires: ['g6-geo-elementos-primitivos-notacion', 'g6-geo-relaciones-angulares-ecuaciones'],
        description: 'Deduce y clasifica los 8 ángulos formados entre paralelas y transversal: alternos internos, alternos externos, correspondientes y conjugados.',
        xOffset: 0,
        subcategoryId: 721,
        additionalQuizzes: [1235],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: GEOMETRÍA DEL TRIÁNGULO: TEOREMAS Y PUNTOS NOTABLES
    // ==========================================
    {
        id: 'g6-geo-u2-geometria-triangulo-teoremas',
        label: 'Geometría del Triángulo y Teoremas Fundamentales',
        level: 3,
        type: 'basic',
        requires: ['g6-geo-paralelas-transversal-angulos'],
        description: 'Profundiza en la desigualdad triangular, demostración de la suma angular (180°), teorema del ángulo exterior y los 4 puntos notables.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-triangulos-clasificacion-desigualdad',
        label: 'Clasificación Cruzada y Desigualdad Triangular',
        level: 4,
        type: 'basic',
        requires: ['g6-geo-u2-geometria-triangulo-teoremas'],
        description: 'Clasifica triángulos simultáneamente por lados y ángulos, y aplica el criterio de existencia: la suma de dos lados siempre supera al tercero (a + b > c).',
        xOffset: -45,
        subcategoryId: 722,
        additionalQuizzes: [1236],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-suma-angular-angulo-exterior',
        label: 'Suma Angular (180°) y Teorema del Ángulo Exterior',
        level: 4,
        type: 'basic',
        requires: ['g6-geo-u2-geometria-triangulo-teoremas'],
        description: 'Demuestra y aplica que la suma de ángulos internos es 180° y que todo ángulo exterior es igual a la suma de los dos ángulos interiores no adyacentes.',
        xOffset: 45,
        subcategoryId: 723,
        additionalQuizzes: [1237],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-lineas-puntos-notables-triangulo',
        label: 'Líneas y Puntos Notables del Triángulo',
        level: 5,
        type: 'basic',
        requires: ['g6-geo-triangulos-clasificacion-desigualdad', 'g6-geo-suma-angular-angulo-exterior'],
        description: 'Construye y diferencia mediatrices (circuncentro), bisectrices (incentro), medianas (baricentro, centro de gravedad 2:1) y alturas (ortocentro).',
        xOffset: 0,
        subcategoryId: 724,
        additionalQuizzes: [1238],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: POLÍGONOS, CUADRILÁTEROS Y DIAGONALES
    // ==========================================
    {
        id: 'g6-geo-u3-poligonos-cuadrilateros-diagonales',
        label: 'Polígonos, Cuadriláteros y Relaciones Angulares',
        level: 6,
        type: 'basic',
        requires: ['g6-geo-lineas-puntos-notables-triangulo'],
        description: 'Familias completas de cuadriláteros, propiedades analíticas de diagonales, suma interior y conteo algebraico de diagonales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-cuadrilateros-propiedades-diagonales',
        label: 'Familias de Cuadriláteros y Propiedades de Diagonales',
        level: 7,
        type: 'basic',
        requires: ['g6-geo-u3-poligonos-cuadrilateros-diagonales'],
        description: 'Analiza paralelogramos, trapecios y deltoides. Determina cuándo las diagonales son congruentes, se bisecan o se cortan a 90°.',
        xOffset: -45,
        subcategoryId: 725,
        additionalQuizzes: [1239],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-suma-angulos-interiores-exteriores',
        label: 'Suma de Ángulos Interiores y Exteriores de Polígonos',
        level: 7,
        type: 'basic',
        requires: ['g6-geo-u3-poligonos-cuadrilateros-diagonales'],
        description: 'Triangula polígonos convexos deduciendo S_int = (n - 2) × 180° y verifica la constante universal de los ángulos exteriores S_ext = 360°.',
        xOffset: 45,
        subcategoryId: 726,
        additionalQuizzes: [1240],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-poligonos-regulares-conteo-diagonales',
        label: 'Polígonos Regulares y Conteo de Diagonales',
        level: 8,
        type: 'basic',
        requires: ['g6-geo-cuadrilateros-propiedades-diagonales', 'g6-geo-suma-angulos-interiores-exteriores'],
        description: 'Calcula ángulos interiores [(n-2)×180°]/n, centrales 360°/n, diagonales desde un vértice (n - 3) y diagonales totales D = n(n - 3)/2.',
        xOffset: 0,
        subcategoryId: 727,
        additionalQuizzes: [1241],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: PLANO CARTESIANO COMPLETO, ISOMETRÍAS Y SEMEJANZA
    // ==========================================
    {
        id: 'g6-geo-u4-plano-cartesiano-isometrias',
        label: 'Plano Cartesiano Completo, Isometrías y Semejanza',
        level: 9,
        type: 'basic',
        requires: ['g6-geo-poligonos-regulares-conteo-diagonales'],
        description: 'Geometrización analítica en los cuatro cuadrantes con enteros, transformaciones rígidas en el plano cartesiano y escalas de semejanza.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-plano-cartesiano-cuatro-cuadrantes',
        label: 'El Plano Cartesiano en los Cuatro Cuadrantes (Z × Z)',
        level: 10,
        type: 'basic',
        requires: ['g6-geo-u4-plano-cartesiano-isometrias'],
        description: 'Ubica coordenadas con signos en los cuadrantes I, II, III y IV, dibuja polígonos por vértices y calcula distancias horizontales y verticales.',
        xOffset: -45,
        subcategoryId: 728,
        additionalQuizzes: [1242],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-transformaciones-isometricas-vectores',
        label: 'Isometrías: Traslaciones, Reflexiones y Rotaciones',
        level: 10,
        type: 'basic',
        requires: ['g6-geo-u4-plano-cartesiano-isometrias'],
        description: 'Aplica traslaciones con vectores enteros (x + a, y + b), reflexiones sobre los ejes coordenados y rotaciones de 90°, 180° y 270° preservando forma y tamaño.',
        xOffset: 45,
        subcategoryId: 729,
        additionalQuizzes: [1243],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-congruencia-semejanza-escalas',
        label: 'Congruencia, Semejanza y Factores de Escala',
        level: 11,
        type: 'basic',
        requires: ['g6-geo-plano-cartesiano-cuatro-cuadrantes', 'g6-geo-transformaciones-isometricas-vectores'],
        description: 'Distingue congruencia (≅) de semejanza (~), calcula razones de semejanza k e interpreta escalas numéricas y gráficas en planos y mapas.',
        xOffset: 0,
        subcategoryId: 730,
        additionalQuizzes: [1244],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: SISTEMA MÉTRICO DECIMAL, ÁREAS Y REGIONES CIRCULARES
    // ==========================================
    {
        id: 'g6-geo-u5-sistema-metrico-areas-circulo',
        label: 'Sistema Métrico, Áreas de Polígonos y Círculos',
        level: 12,
        type: 'basic',
        requires: ['g6-geo-congruencia-semejanza-escalas'],
        description: 'Conversiones del Sistema Métrico Decimal (lineales y cuadradas), fórmulas formales de área con apotema y regiones circulares sombreadas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-sistema-metrico-longitud-superficie',
        label: 'Sistema Métrico: Longitud, Superficie y Hectáreas',
        level: 13,
        type: 'basic',
        requires: ['g6-geo-u5-sistema-metrico-areas-circulo'],
        description: 'Realiza conversiones métricas de longitud (de 10 en 10) y superficie (de 100 en 100), dominando el uso de la hectárea (1 ha = 10 000 m²).',
        xOffset: -45,
        subcategoryId: 731,
        additionalQuizzes: [1245],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-formulas-area-trapecio-apotema',
        label: 'Áreas de Triángulos, Cuadriláteros y Polígonos con Apotema',
        level: 13,
        type: 'basic',
        requires: ['g6-geo-u5-sistema-metrico-areas-circulo'],
        description: 'Aplica fórmulas deductivas de área en rombos [(D×d)/2], trapecios {[(B+b)×h]/2} y polígonos regulares mediante semiperímetro y apotema [(P×a)/2].',
        xOffset: 45,
        subcategoryId: 732,
        additionalQuizzes: [1246],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-circunferencia-circulo-regiones-sombreadas',
        label: 'Circunferencia, Círculo, Sectores y Coronas Circulares',
        level: 14,
        type: 'basic',
        requires: ['g6-geo-sistema-metrico-longitud-superficie', 'g6-geo-formulas-area-trapecio-apotema'],
        description: 'Calcula la longitud C = 2πr y el área circular A = πr². Resuelve coronas circulares π(R² - r²), sectores y áreas compuestas por sustracción.',
        xOffset: 0,
        subcategoryId: 733,
        additionalQuizzes: [1247],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS GEOMÉTRICOS, ÁREA SUPERFICIAL, VOLUMEN Y CAPACIDAD
    // ==========================================
    {
        id: 'g6-geo-u6-solidos-area-volumen-capacidad',
        label: 'Cuerpos Geométricos, Superficie, Volumen y Capacidad',
        level: 15,
        type: 'basic',
        requires: ['g6-geo-circunferencia-circulo-regiones-sombreadas'],
        description: 'Estudio de poliedros y cuerpos redondos, teorema de Euler, área total con redes planas, volumen de prismas y cilindros, y equivalencias de capacidad.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-geo-poliedros-cuerpos-redondos-euler',
        label: 'Poliedros, Cuerpos Redondos y Teorema de Euler',
        level: 16,
        type: 'basic',
        requires: ['g6-geo-u6-solidos-area-volumen-capacidad'],
        description: 'Clasifica prismas, pirámides y sólidos de revolución (cilindro, cono, esfera). Aplica el Teorema de Euler C + V = A + 2 en poliedros convexos.',
        xOffset: -45,
        subcategoryId: 734,
        additionalQuizzes: [1248],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-desarrollos-planos-area-superficial',
        label: 'Desarrollos Planos y Área Superficial Total',
        level: 16,
        type: 'basic',
        requires: ['g6-geo-u6-solidos-area-volumen-capacidad'],
        description: 'Calcula el área lateral y total de prismas y cilindros a partir de sus redes planas: A_total = A_lateral + 2 × A_base.',
        xOffset: 45,
        subcategoryId: 735,
        additionalQuizzes: [1249],
        behavior: 'quiz_list'
    },
    {
        id: 'g6-geo-volumen-prismas-cilindros-gran-corona',
        label: 'Volumen de Prismas y Cilindros, Capacidad y Gran Corona de 6°',
        level: 17,
        type: 'evaluation',
        requires: ['g6-geo-poliedros-cuerpos-redondos-euler', 'g6-geo-desarrollos-planos-area-superficial'],
        description: 'Aplica V = A_base × h en prismas y cilindros (V = πr²h), conecta volumen con capacidad (1 dm³ = 1 L, 1 m³ = 1000 L) y conquista la Gran Corona de Geometría de 6°.',
        xOffset: 0,
        subcategoryId: 736,
        additionalQuizzes: [1250],
        behavior: 'quiz_list'
    }
];
