import { ArithmeticNode } from './arithmetic-map-data';

export const grade8GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: RAZONAMIENTO DEDUCTIVO, POSTULADOS Y ÁNGULOS ENTRE PARALELAS
    // ==========================================
    {
        id: 'g8-geo-u1-razonamiento-paralelas-angulos',
        label: 'Razonamiento Deductivo y Rectas Paralelas Cortadas por Transversal',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Términos primitivos, axiomas, el 5.° postulado de Euclides, relaciones entre ángulos alternos, correspondientes, conjugados y teorema del ángulo exterior.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-metodo-deductivo-axiomas-teoremas',
        label: 'El Método Deductivo en Geometría: Términos Primitivos, Axiomas y Teoremas',
        level: 1,
        type: 'basic',
        requires: ['g8-geo-u1-razonamiento-paralelas-angulos'],
        description: 'Punto, recta y plano como términos indefinidos, postulados de incidencia y orden, y estructura de una demostración deductiva formal (Hipótesis implica Tesis).',
        xOffset: -45,
        subcategoryId: 755,
        additionalQuizzes: [1269],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-paralelas-transversal-relaciones-angulares',
        label: 'Rectas Paralelas Cortadas por una Transversal: Relaciones Angulares',
        level: 1,
        type: 'basic',
        requires: ['g8-geo-u1-razonamiento-paralelas-angulos'],
        description: 'Pares angulares entre paralelas y secante: alternos internos, alternos externos, correspondientes congruentes y conjugados suplementarios (suma 180°).',
        xOffset: 45,
        subcategoryId: 756,
        additionalQuizzes: [1270],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-teorema-angulo-exterior-poligonos',
        label: 'Teorema del Ángulo Exterior y Relaciones Angulares Avanzadas en Polígonos',
        level: 2,
        type: 'basic',
        requires: ['g8-geo-metodo-deductivo-axiomas-teoremas', 'g8-geo-paralelas-transversal-relaciones-angulares'],
        description: 'Medida del ángulo exterior igual a la suma de interiores no adyacentes, suma de ángulos interiores de polígonos convexos S = (n-2)×180° y suma exterior constante de 360°.',
        xOffset: 0,
        subcategoryId: 757,
        additionalQuizzes: [1271],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: CONGRUENCIA FORMAL Y RELACIONES MÉTRICAS EN TRIÁNGULOS
    // ==========================================
    {
        id: 'g8-geo-u2-congruencia-formal-relaciones-triangulares',
        label: 'Congruencia Formal y Relaciones Métricas en Triángulos',
        level: 3,
        type: 'basic',
        requires: ['g8-geo-teorema-angulo-exterior-poligonos'],
        description: 'Demostraciones formales en dos columnas, criterios para triángulos rectángulos, y aplicaciones a la base media y lugares geométricos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-demostracion-criterios-congruencia',
        label: 'Demostración Formal de Criterios de Congruencia (LLL, LAL, ALA, LLA mayor)',
        level: 4,
        type: 'basic',
        requires: ['g8-geo-u2-congruencia-formal-relaciones-triangulares'],
        description: 'Pruebas rigurosas de congruencia en dos columnas, justificación por partes homólogas (CPCTC) y análisis del contraejemplo Lado-Lado-Ángulo menor.',
        xOffset: -45,
        subcategoryId: 758,
        additionalQuizzes: [1272],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-congruencia-triangulos-rectangulos',
        label: 'Congruencia en Triángulos Rectángulos: Criterios Especializados',
        level: 4,
        type: 'basic',
        requires: ['g8-geo-u2-congruencia-formal-relaciones-triangulares'],
        description: 'Criterios simplificados para triángulos rectángulos: Cateto-Cateto (CC), Hipotenusa-Cateto (HC), Hipotenusa-Ángulo Agudo (HA) y Cateto-Ángulo Agudo (CA).',
        xOffset: 45,
        subcategoryId: 759,
        additionalQuizzes: [1273],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-aplicaciones-congruencia-base-media',
        label: 'Aplicaciones de la Congruencia: Teorema de la Base Media y Lugares Geométricos',
        level: 5,
        type: 'basic',
        requires: ['g8-geo-demostracion-criterios-congruencia', 'g8-geo-congruencia-triangulos-rectangulos'],
        description: 'Teorema del segmento medio en el triángulo (paralelo y de longitud la mitad de la base), cuadrilátero de Varignon y demostración de equidistancia en bisectrices y mediatrices.',
        xOffset: 0,
        subcategoryId: 760,
        additionalQuizzes: [1274],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: EL TEOREMA DE PITÁGORAS: DEMOSTRACIÓN, RECÍPROCO Y APLICACIONES 2D
    // ==========================================
    {
        id: 'g8-geo-u3-teorema-pitagoras-reciproco-aplicaciones',
        label: 'El Teorema de Pitágoras: Demostración, Recíproco y Aplicaciones',
        level: 6,
        type: 'basic',
        requires: ['g8-geo-aplicaciones-congruencia-base-media'],
        description: 'La gran relación métrica del triángulo rectángulo: justificación geométrica de Bhaskara, cálculo algebraico de catetos e hipotenusa y el teorema recíproco.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-pitagoras-demostracion-disecciones',
        label: 'El Teorema de Pitágoras: Demostración Geométrica y Disecciones',
        level: 7,
        type: 'basic',
        requires: ['g8-geo-u3-teorema-pitagoras-reciproco-aplicaciones'],
        description: 'Fundamento geométrico de a² + b² = c² como igualdad de áreas de cuadrados construidos sobre los lados, demostraciones por reordenamiento de Bhaskara y disección euclidiana.',
        xOffset: -45,
        subcategoryId: 761,
        additionalQuizzes: [1275],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-calculo-catetos-hipotenusa-figuras-planas',
        label: 'Cálculo de Hipotenusa, Catetos y Aplicaciones en Figuras Planas',
        level: 7,
        type: 'basic',
        requires: ['g8-geo-u3-teorema-pitagoras-reciproco-aplicaciones'],
        description: 'Despejes algebraicos c = √(a² + b²) y a = √(c² - b²), cálculo de la altura del triángulo equilátero h = (l√3)/2, apotemas de polígonos regulares y diagonales de rectángulos.',
        xOffset: 45,
        subcategoryId: 762,
        additionalQuizzes: [1276],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-reciproco-pitagoras-clasificacion-ternas',
        label: 'Teorema Recíproco de Pitágoras, Clasificación Angular y Ternas Pitagóricas',
        level: 8,
        type: 'basic',
        requires: ['g8-geo-pitagoras-demostracion-disecciones', 'g8-geo-calculo-catetos-hipotenusa-figuras-planas'],
        description: 'Clasificación de triángulos por sus lados (acutángulo si c² < a² + b², rectángulo si c² = a² + b², obtusángulo si c² > a² + b²) y uso de ternas pitagóricas primitivas (3,4,5), (5,12,13), (8,15,17).',
        xOffset: 0,
        subcategoryId: 763,
        additionalQuizzes: [1277],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: TEOREMA DE TALES, SEMEJANZA Y TEOREMAS DE EUCLIDES
    // ==========================================
    {
        id: 'g8-geo-u4-tales-semejanza-teoremas-euclides',
        label: 'Teorema de Tales, Semejanza Formal y Relaciones de Euclides',
        level: 9,
        type: 'basic',
        requires: ['g8-geo-reciproco-pitagoras-clasificacion-ternas'],
        description: 'Proporcionalidad geométrica de Tales, criterios AA~, LLL~ y LAL~ de semejanza, medición indirecta y teoremas de la altura y del cateto de Euclides.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-teorema-tales-segmentos-proporcionales',
        label: 'El Teorema Fundamental de Tales y Segmentos Proporcionales',
        level: 10,
        type: 'basic',
        requires: ['g8-geo-u4-tales-semejanza-teoremas-euclides'],
        description: 'Segmentos determinados en transversales cortadas por rectas paralelas, división de segmentos en razones dadas y rectas paralelas a un lado en el triángulo.',
        xOffset: -45,
        subcategoryId: 764,
        additionalQuizzes: [1278],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-criterios-semejanza-medicion-indirecta',
        label: 'Criterios Formales de Semejanza de Triángulos y Medición Indirecta',
        level: 10,
        type: 'basic',
        requires: ['g8-geo-u4-tales-semejanza-teoremas-euclides'],
        description: 'Criterios AA~, LLL~ y LAL~, relación de semejanza entre perímetros (k) y áreas (k²), y problemas de medición indirecta de alturas de árboles y edificios por proyección de sombras.',
        xOffset: 45,
        subcategoryId: 765,
        additionalQuizzes: [1279],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-teoremas-euclides-triangulo-rectangulo',
        label: 'Teoremas de Euclides en el Triángulo Rectángulo: Altura y Cateto',
        level: 11,
        type: 'basic',
        requires: ['g8-geo-teorema-tales-segmentos-proporcionales', 'g8-geo-criterios-semejanza-medicion-indirecta'],
        description: 'Relaciones métricas por semejanza al trazar la altura relativa a la hipotenusa: Teorema de la altura h² = m·n, Teorema del cateto a² = c·m, b² = c·n y producto a·b = c·h.',
        xOffset: 0,
        subcategoryId: 766,
        additionalQuizzes: [1280],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: GEOMETRÍA ANALÍTICA BÁSICA: DISTANCIA, PENDIENTE Y TRANSFORMACIONES
    // ==========================================
    {
        id: 'g8-geo-u5-analitica-distancia-pendiente-transformaciones',
        label: 'Geometría Analítica Básica: Distancia, Pendiente y Transformaciones',
        level: 12,
        type: 'basic',
        requires: ['g8-geo-teoremas-euclides-triangulo-rectangulo'],
        description: 'Conexión cartesiana: distancia euclidiana por Pitágoras, pendiente m como inclinación de la recta, paralelismo y perpendicularidad analítica, y composición de isometrías.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-distancia-euclidiana-punto-medio',
        label: 'Distancia Euclidiana entre Dos Puntos y Coordenadas del Punto Medio',
        level: 13,
        type: 'basic',
        requires: ['g8-geo-u5-analitica-distancia-pendiente-transformaciones'],
        description: 'Fórmula de distancia d = √((x₂ - x₁)² + (y₂ - y₁)²) derivada de Pitágoras, cálculo de perímetros en el plano y fórmula del punto medio M = ((x₁+x₂)/2, (y₁+y₂)/2).',
        xOffset: -45,
        subcategoryId: 767,
        additionalQuizzes: [1281],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-pendiente-recta-paralelismo-perpendicularidad',
        label: 'Pendiente de una Recta, Ecuación Lineal, Paralelismo y Perpendicularidad',
        level: 13,
        type: 'basic',
        requires: ['g8-geo-u5-analitica-distancia-pendiente-transformaciones'],
        description: 'Cálculo de la pendiente m = (y₂ - y₁)/(x₂ - x₁), condición de rectas paralelas (m₁ = m₂) y condición de rectas perpendiculares (m₁ · m₂ = -1).',
        xOffset: 45,
        subcategoryId: 768,
        additionalQuizzes: [1282],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-composicion-isometrias-homotecias-algebraicas',
        label: 'Composición de Isometrías y Homotecias en el Plano Cartesiano',
        level: 14,
        type: 'basic',
        requires: ['g8-geo-distancia-euclidiana-punto-medio', 'g8-geo-pendiente-recta-paralelismo-perpendicularidad'],
        description: 'Composiciones de reflexiones, traslaciones y rotaciones en secuencia, y dilataciones algebraicas (x, y) ↦ (kx, ky) con factor de escala k y centro en el origen.',
        xOffset: 0,
        subcategoryId: 769,
        additionalQuizzes: [1283],
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CUERPOS REDONDOS Y GEOMETRÍA DEL ESPACIO: CILINDRO, CONO Y ESFERA
    // ==========================================
    {
        id: 'g8-geo-u6-cuerpos-redondos-espacio-volumenes',
        label: 'Cuerpos Redondos y Geometría del Espacio: Cilindro, Cono y Esfera',
        level: 15,
        type: 'basic',
        requires: ['g8-geo-composicion-isometrias-homotecias-algebraicas'],
        description: 'Sólidos de revolución, desarrollo plano, área total y volumen de cilindros, conos rectos y esferas, sólidos compuestos y evaluación de maestría de 8.° Grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-geo-cilindro-recto-desarrollo-area-volumen',
        label: 'El Cilindro Recto: Desarrollo Plano, Área Superficial y Volumen',
        level: 16,
        type: 'basic',
        requires: ['g8-geo-u6-cuerpos-redondos-espacio-volumenes'],
        description: 'Sólido generado al rotar un rectángulo, desarrollo con rectángulo 2πr × h y bases circulares, área total A = 2πr(h + r), volumen V = πr²h y equivalencia a capacidad en litros.',
        xOffset: -45,
        subcategoryId: 770,
        additionalQuizzes: [1284],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-cono-recto-pitagoras-espacio-volumen',
        label: 'El Cono Recto y el Teorema de Pitágoras en el Espacio',
        level: 16,
        type: 'basic',
        requires: ['g8-geo-u6-cuerpos-redondos-espacio-volumenes'],
        description: 'Rotación de un triángulo rectángulo, relación métrica de la generatriz g² = r² + h², sector circular del desarrollo plano, área total A = πr(g + r) y volumen V = (1/3)πr²h.',
        xOffset: 45,
        subcategoryId: 771,
        additionalQuizzes: [1285],
        behavior: 'quiz_list'
    },
    {
        id: 'g8-geo-esfera-solidos-compuestos-gran-corona',
        label: 'La Esfera, Sólidos Compuestos y Gran Corona de Maestría de 8.°',
        level: 17,
        type: 'evaluation',
        requires: ['g8-geo-cilindro-recto-desarrollo-area-volumen', 'g8-geo-cono-recto-pitagoras-espacio-volumen'],
        description: 'Sólido generado por rotación de semicírculo, área superficial A = 4πr², volumen V = (4/3)πr³, resolución de sólidos compuestos y Gran Corona de Maestría de Geometría de 8.° Grado.',
        xOffset: 0,
        subcategoryId: 772,
        additionalQuizzes: [1286],
        behavior: 'quiz_list'
    }
];
