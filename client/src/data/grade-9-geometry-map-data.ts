import { ArithmeticNode } from './arithmetic-map-data';

export const grade9GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: SEMEJANZA AVANZADA, HOMOTECIAS Y PROPORCIONALIDAD AÉREA Y VOLUMÉTRICA
    // ==========================================
    {
        id: 'g9-geo-u1-semejanza-homotecia-proporcionalidad',
        label: 'Semejanza Avanzada, Homotecias y Proporcionalidad Aérea y Volumétrica',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Homotecias en el plano cartesiano con centro arbitrario, relación cuadrática de áreas (k²), relación cúbica de volúmenes (k³), razón áurea y noción de autosimilitud fractal.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-homotecias-centro-arbitrario',
        label: 'Homotecias con Centro Arbitrario en ℝ²',
        level: 1,
        type: 'basic',
        requires: ['g9-geo-u1-semejanza-homotecia-proporcionalidad'],
        description: 'Construcción y reglas analíticas de homotecias directas e inversas con centro fuera del origen P(x₀, y₀), factor de escala k y preservación de paralelismo.',
        xOffset: -45,
        subcategoryId: 773,
        additionalQuizzes: [1287],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-proporcionalidad-areas-volumenes',
        label: 'Teorema de Proporcionalidad de Áreas (k²) y Volúmenes (k³)',
        level: 1,
        type: 'basic',
        requires: ['g9-geo-u1-semejanza-homotecia-proporcionalidad'],
        description: 'Relación entre factores de escala lineales k, razones de áreas k² y razones de volúmenes k³, modelos a escala, maquetas e impacto en el peso y capacidad.',
        xOffset: 45,
        subcategoryId: 774,
        additionalQuizzes: [1288],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-razon-aurea-fractales-autosimilitud',
        label: 'La Razón Áurea (Φ), Rectángulo Dorado e Introducción a la Autosimilitud',
        level: 2,
        type: 'critical',
        requires: ['g9-geo-homotecias-centro-arbitrario', 'g9-geo-proporcionalidad-areas-volumenes'],
        description: 'El número áureo Φ ≈ 1.618, división áurea de segmentos, rectángulos y espirales doradas, y nociones de autosimilitud en fractales geométricos (Sierpinski y Koch).',
        xOffset: 0,
        subcategoryId: 775,
        additionalQuizzes: [1289],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: ÁNGULOS Y RELACIONES MÉTRICAS EN LA CIRCUNFERENCIA
    // ==========================================
    {
        id: 'g9-geo-u2-angulos-relaciones-circunferencia',
        label: 'Ángulos y Relaciones Métricas en la Circunferencia',
        level: 3,
        type: 'basic',
        requires: ['g9-geo-razon-aurea-fractales-autosimilitud'],
        description: 'Teoremas angulares en la circunferencia (central, inscrito, semi-inscrito, interior, exterior), potencia de un punto, cuerdas secantes y cuadriláteros cíclicos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-angulo-central-inscrito',
        label: 'Teorema del Ángulo Central y Ángulo Inscrito',
        level: 4,
        type: 'basic',
        requires: ['g9-geo-u2-angulos-relaciones-circunferencia'],
        description: 'Deducción y cálculo: el ángulo inscrito subtiende la mitad del ángulo central correspondiente, arco común y ángulo recto en semicircunferencias (Tales en el círculo).',
        xOffset: -45,
        subcategoryId: 776,
        additionalQuizzes: [1290],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-angulos-semiinscrito-interior-exterior',
        label: 'Ángulos Semi-inscrito, Interior y Exterior en la Circunferencia',
        level: 4,
        type: 'basic',
        requires: ['g9-geo-u2-angulos-relaciones-circunferencia'],
        description: 'Cálculo angular por intersección de cuerdas, tangentes y secantes: semisuma de arcos interiores y semidiferencia de arcos exteriores.',
        xOffset: 45,
        subcategoryId: 777,
        additionalQuizzes: [1291],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-teorema-cuerdas-secantes-cuadrilateros-ciclicos',
        label: 'Teoremas de Cuerdas, Secantes, Tangentes y Cuadriláteros Cíclicos',
        level: 5,
        type: 'applied',
        requires: ['g9-geo-angulo-central-inscrito', 'g9-geo-angulos-semiinscrito-interior-exterior'],
        description: 'Potencia de un punto: producto de segmentos de cuerdas secantes PA·PB = PC·PD, teorema tangente-secante PT² = PA·PB y cuadriláteros cíclicos suplementarios.',
        xOffset: 0,
        subcategoryId: 778,
        additionalQuizzes: [1292],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: INTRODUCCIÓN A LA TRIGONOMETRÍA EN EL TRIÁNGULO RECTÁNGULO
    // ==========================================
    {
        id: 'g9-geo-u3-trigonometria-triangulo-rectangulo',
        label: 'Introducción a la Trigonometría en el Triángulo Rectángulo',
        level: 6,
        type: 'basic',
        requires: ['g9-geo-teorema-cuerdas-secantes-cuadrilateros-ciclicos'],
        description: 'Razones trigonométricas fundamentales (seno, coseno, tangente), triángulos rectángulos notables (30°-60°-90° y 45°-45°-90°), y ángulos de elevación y depresión.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-razones-trigonometricas-seno-coseno-tangente',
        label: 'Razones Trigonométricas Fundamentales: Seno, Coseno y Tangente',
        level: 7,
        type: 'basic',
        requires: ['g9-geo-u3-trigonometria-triangulo-rectangulo'],
        description: 'Definición de sen(θ), cos(θ) y tan(θ) como cocientes de lados invariantes por semejanza, cofunciones de ángulos complementarios y relación tan = sen/cos.',
        xOffset: -45,
        subcategoryId: 779,
        additionalQuizzes: [1293],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-triangulos-notables-valores-exactos',
        label: 'Triángulos Rectángulos Notables y Valores Exactos',
        level: 7,
        type: 'basic',
        requires: ['g9-geo-u3-trigonometria-triangulo-rectangulo'],
        description: 'Valores exactos sin calculadora para ángulos de 30°, 45° y 60° deducidos de triángulos equiláteros e isósceles, e identidad pitagórica sen²(θ) + cos²(θ) = 1.',
        xOffset: 45,
        subcategoryId: 780,
        additionalQuizzes: [1294],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-angulos-elevacion-depresion-medicion-indirecta',
        label: 'Ángulos de Elevación, Depresión y Medición Indirecta',
        level: 8,
        type: 'critical',
        requires: ['g9-geo-razones-trigonometricas-seno-coseno-tangente', 'g9-geo-triangulos-notables-valores-exactos'],
        description: 'Línea visual vs. horizontal, resolución de triángulos rectángulos en situaciones reales: cálculo de alturas inaccesibles, sombras, torres y navegación.',
        xOffset: 0,
        subcategoryId: 781,
        additionalQuizzes: [1295],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: GEOMETRÍA ANALÍTICA DE LA RECTA Y SISTEMAS DE POSICIÓN
    // ==========================================
    {
        id: 'g9-geo-u4-geometria-analitica-recta',
        label: 'Geometría Analítica de la Recta y Sistemas de Posición',
        level: 9,
        type: 'basic',
        requires: ['g9-geo-angulos-elevacion-depresion-medicion-indirecta'],
        description: 'Formas algebraicas de la recta (punto-pendiente, canónica y general), condiciones analíticas de paralelismo y perpendicularidad, y cálculo de distancia punto-recta.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-formas-ecuacion-recta',
        label: 'Formas de la Ecuación de la Recta: Punto-Pendiente, Canónica y General',
        level: 10,
        type: 'basic',
        requires: ['g9-geo-u4-geometria-analitica-recta'],
        description: 'Ecuación punto-pendiente y - y₁ = m(x - x₁), pendiente-intercepto y = mx + b, y forma general Ax + By + C = 0. Conversión entre formas e interceptos axiales.',
        xOffset: -45,
        subcategoryId: 782,
        additionalQuizzes: [1296],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-posiciones-relativas-paralelismo-perpendicularidad',
        label: 'Posiciones Relativas de Rectas: Paralelismo, Perpendicularidad y Coincidencia',
        level: 10,
        type: 'basic',
        requires: ['g9-geo-u4-geometria-analitica-recta'],
        description: 'Criterios analíticos rigurosos: rectas paralelas (m₁ = m₂, b₁ ≠ b₂), perpendiculares (m₁·m₂ = -1), coincidentes (infinitas soluciones) y secantes oblicuas.',
        xOffset: 45,
        subcategoryId: 783,
        additionalQuizzes: [1297],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-distancia-punto-recta-intersecciones',
        label: 'Intersección de Rectas y Distancia de un Punto a una Recta',
        level: 11,
        type: 'applied',
        requires: ['g9-geo-formas-ecuacion-recta', 'g9-geo-posiciones-relativas-paralelismo-perpendicularidad'],
        description: 'Punto de intersección mediante sistemas 2×2 geométricos y fórmula analítica de distancia perpendicular de P(x₀, y₀) a la recta general d = |Ax₀ + By₀ + C| / √(A² + B²).',
        xOffset: 0,
        subcategoryId: 784,
        additionalQuizzes: [1298],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: LUGARES GEOMÉTRICOS Y ECUACIÓN DE LA CIRCUNFERENCIA
    // ==========================================
    {
        id: 'g9-geo-u5-lugares-geometricos-conicas',
        label: 'Lugares Geométricos y Ecuación de la Circunferencia',
        level: 12,
        type: 'basic',
        requires: ['g9-geo-distancia-punto-recta-intersecciones'],
        description: 'Concepto formal de lugar geométrico, deducción analítica de mediatriz y bisectriz, ecuación canónica y ordinaria de la circunferencia y secciones cónicas del cono.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-nocion-lugar-geometrico-mediatriz-bisectriz',
        label: 'Lugares Geométricos en el Plano: Mediatriz y Bisectriz Analítica',
        level: 13,
        type: 'basic',
        requires: ['g9-geo-u5-lugares-geometricos-conicas'],
        description: 'Definición de lugar geométrico como conjunto de puntos con propiedad invariante, deducción analítica de la mediatriz (equidistancia a dos puntos) y bisectriz.',
        xOffset: -45,
        subcategoryId: 785,
        additionalQuizzes: [1299],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-ecuacion-canonica-ordinaria-circunferencia',
        label: 'Ecuación Canónica y Ordinaria de la Circunferencia',
        level: 13,
        type: 'basic',
        requires: ['g9-geo-u5-lugares-geometricos-conicas'],
        description: 'Circunferencia con centro en el origen x² + y² = r² y centro trasladado (h, k): (x - h)² + (y - k)² = r². Identificación de centro y radio y puntos interiores/exteriores.',
        xOffset: 45,
        subcategoryId: 786,
        additionalQuizzes: [1300],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-secciones-conicas-cortes-del-cono',
        label: 'Secciones Cónicas: Cortes del Cono de Revolución y Propiedades',
        level: 14,
        type: 'applied',
        requires: ['g9-geo-nocion-lugar-geometrico-mediatriz-bisectriz', 'g9-geo-ecuacion-canonica-ordinaria-circunferencia'],
        description: 'Generación tridimensional de las cónicas cortando un cono con un plano: circunferencia, elipse, parábola e hipérbola. Noción de focos y aplicaciones ópticas y astronómicas.',
        xOffset: 0,
        subcategoryId: 787,
        additionalQuizzes: [1301],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS TRUNCADOS, GEOMETRÍA ESPACIAL Y GRAN CORONA DE 9.°
    // ==========================================
    {
        id: 'g9-geo-u6-solidos-truncados-espacio-corona',
        label: 'Cuerpos Truncados, Geometría Espacial y Gran Corona de 9.°',
        level: 15,
        type: 'basic',
        requires: ['g9-geo-secciones-conicas-cortes-del-cono'],
        description: 'Tronco de pirámide y tronco de cono, áreas de superficies compuestas, partes de la esfera (casquete, zona y cuña) y la Gran Corona de Maestría de 9.° Grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-geo-tronco-piramide-cono',
        label: 'Tronco de Pirámide y Tronco de Cono: Áreas y Volumen',
        level: 16,
        type: 'basic',
        requires: ['g9-geo-u6-solidos-truncados-espacio-corona'],
        description: 'Sólidos truncados por planos paralelos a la base: generatriz y apotema del tronco, áreas de bases desiguales y fórmula de volumen V = ⅓h(A₁ + A₂ + √(A₁A₂)).',
        xOffset: -45,
        subcategoryId: 788,
        additionalQuizzes: [1302],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-partes-esfera-solidos-compuestos',
        label: 'Partes de la Esfera y Sólidos Compuestos Complejos',
        level: 16,
        type: 'basic',
        requires: ['g9-geo-u6-solidos-truncados-espacio-corona'],
        description: 'Zona esférica, casquete esférico, huso y cuña; resolución de cuerpos espaciales combinados (silos cilíndricos con cúpula hemisférica y piezas mecánicas).',
        xOffset: 45,
        subcategoryId: 789,
        additionalQuizzes: [1303],
        behavior: 'quiz_list'
    },
    {
        id: 'g9-geo-gran-corona-maestria-noveno',
        label: 'Gran Corona de Maestría de 9.° Grado • Desafío Sintético-Analítico',
        level: 17,
        type: 'boss',
        requires: ['g9-geo-tronco-piramide-cono', 'g9-geo-partes-esfera-solidos-compuestos'],
        description: 'Reto supremo de culminación de la secundaria básica: problemas integradores que vinculan trigonometría, circunferencia, rectas analíticas y volúmenes tridimensionales.',
        xOffset: 0,
        subcategoryId: 790,
        additionalQuizzes: [1304],
        behavior: 'quiz_list'
    }
];
