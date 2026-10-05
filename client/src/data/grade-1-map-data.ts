import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade1MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: EL MUNDO DE LOS CONJUNTOS Y COMPARACIONES
    // ==========================================
    {
        id: 'g1-u1-conjuntos',
        label: 'Conjuntos y Comparación',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Primeros pasos en la clasificación, pertenencia y relaciones pre-numéricas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-nocion-conjuntos',
        label: 'Conjuntos y Pertenencia',
        level: 1,
        type: 'basic',
        requires: ['g1-u1-conjuntos'],
        description: 'Noción de conjunto, agrupación de objetos y símbolo de pertenencia.',
        xOffset: -45,
        additionalQuizzes: [991], // Quiz 991: Noción de Conjunto, Elementos y Pertenencia
        behavior: 'quiz_list'
    },
    {
        id: 'g1-comparaciones',
        label: 'Más, Menos y Tantos Como',
        level: 1,
        type: 'basic',
        requires: ['g1-u1-conjuntos'],
        description: 'Comparación visual y cuantitativa de colecciones de objetos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-ordinales',
        label: 'Números Ordinales (1° al 10°)',
        level: 2,
        type: 'basic',
        requires: ['g1-nocion-conjuntos', 'g1-comparaciones'],
        description: 'Orden de llegada, posiciones y secuencias del primero al décimo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: EL UNIVERSO DEL 0 AL 9 Y PRIMERAS OPERACIONES
    // ==========================================
    {
        id: 'g1-u2-digitos',
        label: 'Números hasta el 9',
        level: 3,
        type: 'basic',
        requires: ['g1-ordinales'],
        description: 'Lectura, escritura, conteo y primeras operaciones con los dígitos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-suma-9',
        label: 'Sumas hasta el 9',
        level: 4,
        type: 'basic',
        requires: ['g1-u2-digitos'],
        description: 'Adición básica con dibujos, términos de la suma y saltos en la recta numérica.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-resta-9',
        label: 'Restas hasta el 9',
        level: 4,
        type: 'basic',
        requires: ['g1-u2-digitos'],
        description: 'Sustracción elemental, términos de la resta, recta y comprobación.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-tres-sumandos',
        label: 'Suma con 3 Sumandos',
        level: 5,
        type: 'basic',
        requires: ['g1-suma-9'],
        description: 'Adiciones encadenadas sencillas como 2 + 3 + 1 = 6.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-problemas-9',
        label: 'Problemas de Suma y Resta',
        level: 5,
        type: 'applied',
        requires: ['g1-suma-9', 'g1-resta-9'],
        description: 'Resolución de situaciones cotidianas infantiles con sumas y restas hasta 9.',
        xOffset: 45,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: EL SALTO A LA DECENA Y NÚMEROS HASTA EL 99
    // ==========================================
    {
        id: 'g1-u3-decenas',
        label: 'La Decena (hasta el 99)',
        level: 6,
        type: 'basic',
        requires: ['g1-tres-sumandos', 'g1-problemas-9'],
        description: 'Descubrimiento de la decena, el sistema posicional y cálculo hasta el 99.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-decenas-exactas',
        label: 'Decenas Exactas',
        level: 7,
        type: 'basic',
        requires: ['g1-u3-decenas'],
        description: 'Conteo de 10 en 10 (10, 20, 30...) y cálculo mental de decenas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-desagrupacion-dec',
        label: 'Unidades y Decenas',
        level: 7,
        type: 'basic',
        requires: ['g1-u3-decenas'],
        description: 'Valor posicional en el ábaco: 1 decena = 10 unidades.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-suma-99',
        label: 'Sumas hasta el 99',
        level: 8,
        type: 'critical',
        requires: ['g1-decenas-exactas', 'g1-desagrupacion-dec'],
        description: 'Adición sin reagrupación y con reagrupación ("llevando").',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-resta-99',
        label: 'Restas hasta el 99',
        level: 8,
        type: 'critical',
        requires: ['g1-decenas-exactas', 'g1-desagrupacion-dec'],
        description: 'Sustracción sin desagrupación y con desagrupación ("prestando").',
        xOffset: 45,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: CENTENAS Y NÚMEROS GRANDES (999 Y 9999)
    // ==========================================
    {
        id: 'g1-u4-centenas',
        label: 'Centenas y Números Grandes',
        level: 9,
        type: 'basic',
        requires: ['g1-suma-99', 'g1-resta-99'],
        description: 'Entrando a las centenas y unidades de mil en primer grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-ident-centena',
        label: 'La Centena y Números a 999',
        level: 10,
        type: 'basic',
        requires: ['g1-u4-centenas'],
        description: 'Identificación de la centena, lectura y escritura de números hasta 999.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-suma-resta-999',
        label: 'Operaciones hasta 999',
        level: 10,
        type: 'basic',
        requires: ['g1-u4-centenas'],
        description: 'Sumas y restas con tres cifras, centenas exactas y desagrupación.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-unidad-mil',
        label: 'Unidad de Mil (hasta 9999)',
        level: 11,
        type: 'basic',
        requires: ['g1-ident-centena', 'g1-suma-resta-999'],
        description: 'Aproximación a los millares, lectura y operaciones elementales hasta 9999.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: EXPLORADORES DEL TIEMPO Y LA MEDIDA
    // ==========================================
    {
        id: 'g1-u5-medidas',
        label: 'El Tiempo y la Medida',
        level: 12,
        type: 'basic',
        requires: ['g1-unidad-mil'],
        description: 'Medición del tiempo y de longitudes en el entorno del niño.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-tiempo',
        label: 'Días, Calendario y Reloj',
        level: 13,
        type: 'basic',
        requires: ['g1-u5-medidas'],
        description: 'Días de la semana, meses del año, fechas del calendario y lectura del reloj.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-longitud',
        label: 'Longitud: Pasos, Regla y Metro',
        level: 13,
        type: 'basic',
        requires: ['g1-u5-medidas'],
        description: 'Patrones arbitrarios (pasos, palmos), el centímetro, decímetro y el metro.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-problemas-medida',
        label: 'Retos de Medidas y Tiempo',
        level: 14,
        type: 'applied',
        requires: ['g1-tiempo', 'g1-longitud'],
        description: 'Desafíos prácticos de estimación, horarios y distancias cotidianas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: GRAN MAESTRÍA DE PRIMER GRADO
    // ==========================================
    {
        id: 'g1-mastery',
        label: 'Maestría de 1° Grado',
        level: 15,
        type: 'evaluation',
        requires: [],
        description: 'El desafío final que corona todo el aprendizaje de primer grado de primaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
