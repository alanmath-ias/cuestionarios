import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade3MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CONJUNTOS, NÚMEROS Y ROMANOS (Periodo I)
    // ==========================================
    {
        id: 'g3-u1-conjuntos-romanos',
        label: 'Conjuntos, Operaciones y Romanos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Relaciones de conjuntos, propiedades de la adición, números ordinales y numeración romana.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-pertenencia-contenencia',
        label: 'Pertenencia y Contenencia',
        level: 1,
        type: 'basic',
        requires: ['g3-u1-conjuntos-romanos'],
        description: 'Elementos, subconjuntos y relaciones de inclusión (pertenece ∈, no pertenece ∉, está contenido ⊂).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-union-interseccion',
        label: 'Unión, Intersección y Complemento',
        level: 1,
        type: 'basic',
        requires: ['g3-u1-conjuntos-romanos'],
        description: 'Operaciones entre conjuntos: unión (U), intersección (∩) y complemento.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-lectura-escritura-numeros',
        label: 'Lectura y Escritura de Números',
        level: 2,
        type: 'basic',
        requires: ['g3-pertenencia-contenencia', 'g3-union-interseccion'],
        description: 'Ampliación del sistema numérico decimal, valor posicional y descomposición de números.',
        xOffset: -45,
        additionalQuizzes: [419, 420], // Quiz 419: Valor Posicional | Quiz 420: Descomposición Posicional
        behavior: 'quiz_list'
    },
    {
        id: 'g3-propiedades-adicion',
        label: 'Propiedades de la Adición y Resta',
        level: 2,
        type: 'critical',
        requires: ['g3-pertenencia-contenencia', 'g3-union-interseccion'],
        description: 'Propiedad conmutativa, asociativa y algoritmos de suma y resta con reagrupación.',
        xOffset: 45,
        additionalQuizzes: [313, 304, 305], // Quiz 313: Propiedades | Quiz 304: Suma/Resta Básica | Quiz 305: Suma/Resta Avanzada
        behavior: 'quiz_list'
    },
    {
        id: 'g3-numeros-romanos',
        label: 'El Sistema de Números Romanos',
        level: 3,
        type: 'applied',
        requires: ['g3-lectura-escritura-numeros', 'g3-propiedades-adicion'],
        description: 'Reglas de los símbolos romanos (I, V, X, L, C, D, M) y su equivalencia en el sistema decimal.',
        xOffset: 0,
        additionalQuizzes: [853], // Quiz 853: Escritura de Números Romanos: Fundamentos y Reglas Básicas
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: MULTIPLICACIÓN Y RETOS PROBLÉMICOS (Periodo II)
    // ==========================================
    {
        id: 'g3-u2-multiplicacion-avanzada',
        label: 'Multiplicación y Situaciones Problema',
        level: 4,
        type: 'basic',
        requires: ['g3-numeros-romanos'],
        description: 'Multiplicación como adición, propiedades, múltiplos y situaciones problema.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-mult-como-adicion',
        label: 'La Multiplicación y Tablas',
        level: 5,
        type: 'basic',
        requires: ['g3-u2-multiplicacion-avanzada'],
        description: 'La multiplicación como adición abreviada y agilidad en el dominio de las tablas del 1 al 10.',
        xOffset: -45,
        additionalQuizzes: [515, 626, 548, 549, 550, 551, 588], // Dominio del 1 al 10, V/F 1-20 y aventuras por tablas
        behavior: 'quiz_list'
    },
    {
        id: 'g3-propiedades-multiplicacion',
        label: 'Propiedades y Múltiplos',
        level: 5,
        type: 'basic',
        requires: ['g3-u2-multiplicacion-avanzada'],
        description: 'Propiedades conmutativa, asociativa, distributiva y búsqueda de múltiplos de un número.',
        xOffset: 45,
        additionalQuizzes: [319, 707], // Quiz 319: Múltiplos y Divisores (Nivel 2) | Quiz 707: MCM números de una cifra
        behavior: 'quiz_list'
    },
    {
        id: 'g3-multiplos-tres-cifras',
        label: 'Multiplicación por 3 Cifras',
        level: 6,
        type: 'critical',
        requires: ['g3-mult-como-adicion', 'g3-propiedades-multiplicacion'],
        description: 'Algoritmo y técnica para multiplicar factores de tres cifras con productos intermedios.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-problemas-multiplicacion',
        label: 'Problemas de Multiplicación',
        level: 6,
        type: 'applied',
        requires: ['g3-mult-como-adicion', 'g3-propiedades-multiplicacion'],
        description: 'Resolución de problemas de la vida real con operaciones multiplicativas y compras.',
        xOffset: 45,
        additionalQuizzes: [306, 307], // Quiz 306: Problemas con Naturales Nivel 1 | Quiz 307: Nivel 2
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: DIVISIÓN, CRITERIOS Y SUPERFICIE (Periodo III)
    // ==========================================
    {
        id: 'g3-u3-division-divisibilidad',
        label: 'División, Divisibilidad y Superficie',
        level: 7,
        type: 'basic',
        requires: ['g3-multiplos-tres-cifras', 'g3-problemas-multiplicacion'],
        description: 'Divisiones exactas e inexactas, criterios de divisibilidad, primos y medidas de área.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-division-exacta-inexacta',
        label: 'Divisiones Exactas y su Prueba',
        level: 8,
        type: 'critical',
        requires: ['g3-u3-division-divisibilidad'],
        description: 'Algoritmo de la división entre una cifra, cálculo del residuo, divisiones exactas e inexactas.',
        xOffset: -45,
        additionalQuizzes: [446, 447, 644], // Quiz 446: Básico | Quiz 447: Intermedio/Residuo | Quiz 644: Problemas Cotidianos
        behavior: 'quiz_list'
    },
    {
        id: 'g3-criterios-divisibilidad',
        label: 'Divisores y Criterios',
        level: 8,
        type: 'basic',
        requires: ['g3-u3-division-divisibilidad'],
        description: 'Criterios de divisibilidad rápida por 2, 3, 5 y 10 para identificar divisores sin dividir.',
        xOffset: 45,
        additionalQuizzes: [320], // Quiz 320: Criterios Básicos (2, 3, 4, 5, 7) - Nivel 2
        behavior: 'quiz_list'
    },
    {
        id: 'g3-primos-y-compuestos',
        label: 'Números Primos y Compuestos',
        level: 9,
        type: 'basic',
        requires: ['g3-division-exacta-inexacta', 'g3-criterios-divisibilidad'],
        description: 'Diferencia entre números primos (2 divisores) y números compuestos. Factores primos.',
        xOffset: -45,
        additionalQuizzes: [318, 322], // Quiz 318: Primos y Compuestos | Quiz 322: Descomposición en factores primos básicos
        behavior: 'quiz_list'
    },
    {
        id: 'g3-superficie-arbitraria',
        label: 'Unidades de Superficie y Área',
        level: 9,
        type: 'applied',
        requires: ['g3-division-exacta-inexacta', 'g3-criterios-divisibilidad'],
        description: 'Medida del área contando cuadrículas y unidades arbitrarias de superficie.',
        xOffset: 45,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: FRACCIONES Y MEDIDAS (Periodo IV)
    // ==========================================
    {
        id: 'g3-u4-fracciones-medidas',
        label: 'El Mundo de las Fracciones y Medidas',
        level: 10,
        type: 'basic',
        requires: ['g3-primos-y-compuestos', 'g3-superficie-arbitraria'],
        description: 'Fracciones visuales, lectura, sumas homogéneas y medidas de tiempo y masa.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-concepto-fraccion-conjunto',
        label: 'Fracción como Parte de un Conjunto',
        level: 11,
        type: 'basic',
        requires: ['g3-u4-fracciones-medidas'],
        description: 'Comprensión gráfica y lógica de fracciones como partes de la unidad y de colecciones de objetos.',
        xOffset: -45,
        additionalQuizzes: [329, 331], // Quiz 329: Interpretación VISUAL y LÓGICA | Quiz 331: Fracciones Equivalentes Básicas
        behavior: 'quiz_list'
    },
    {
        id: 'g3-terminos-lectura-fracciones',
        label: 'Términos y Recta de Fracciones',
        level: 11,
        type: 'basic',
        requires: ['g3-u4-fracciones-medidas'],
        description: 'Numerador, denominador, lectura (medios, tercios, cuartos...) y representación en la recta.',
        xOffset: 45,
        additionalQuizzes: [436, 437], // Quiz 436: Recta Numérica I | Quiz 437: Recta Numérica II
        behavior: 'quiz_list'
    },
    {
        id: 'g3-fracciones-homogeneas',
        label: 'Suma y Resta de Fracciones Homogéneas',
        level: 12,
        type: 'critical',
        requires: ['g3-concepto-fraccion-conjunto', 'g3-terminos-lectura-fracciones'],
        description: 'Comparación y operaciones de suma y resta con fracciones de igual denominador.',
        xOffset: -45,
        additionalQuizzes: [340, 341], // Quiz 340: Homogéneas Nivel 1 | Quiz 341: Homogéneas Nivel 2
        behavior: 'quiz_list'
    },
    {
        id: 'g3-unidades-masa-tiempo',
        label: 'Medidas de Masa y Tiempo',
        level: 12,
        type: 'applied',
        requires: ['g3-concepto-fraccion-conjunto', 'g3-terminos-lectura-fracciones'],
        description: 'La libra, el gramo y el kilogramo; horas, minutos, días y semanas en la vida diaria.',
        xOffset: 45,
        additionalQuizzes: [383, 380, 381], // Quiz 383: Tiempo y Horarios | Quiz 380: Masa Directa | Quiz 381: Problemas Cotidianos Masa
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: GRAN MAESTRÍA DE TERCER GRADO
    // ==========================================
    {
        id: 'g3-mastery',
        label: 'Gran Tridente de Maestría de 3°',
        level: 13,
        type: 'evaluation',
        requires: [],
        description: 'La gran prueba que corona el dominio matemático de tercer grado de primaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
