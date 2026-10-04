import { ArithmeticNode } from './arithmetic-map-data.js';

export const grade2MapNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CONJUNTOS Y EL UNIVERSO HASTA EL 999 (Periodo I)
    // ==========================================
    {
        id: 'g2-u1-conjuntos-999',
        label: 'Conjuntos y Números a 999',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Bases de conjuntos, la centena, lectura y primeras operaciones hasta 999.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-conjuntos',
        label: 'Conjuntos y Representación',
        level: 1,
        type: 'basic',
        requires: ['g2-u1-conjuntos-999'],
        description: 'Diagramas, elementos, relaciones de pertenencia y agrupaciones.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-centena-lectura',
        label: 'La Centena y Números a 999',
        level: 1,
        type: 'basic',
        requires: ['g2-u1-conjuntos-999'],
        description: 'La centena (100), lectura, escritura y orden de números de tres cifras.',
        xOffset: 45,
        additionalQuizzes: [302, 419], // Quiz 302: Recta Numérica (Nivel 1), Quiz 419: Valor Posicional
        behavior: 'quiz_list'
    },
    {
        id: 'g2-suma-resta-999',
        label: 'Suma y Resta hasta 999',
        level: 2,
        type: 'critical',
        requires: ['g2-conjuntos', 'g2-centena-lectura'],
        description: 'Cálculo de adiciones y sustracciones con números de hasta tres cifras.',
        xOffset: -45,
        additionalQuizzes: [304], // Quiz 304: Suma y Resta Básicos (123+456, 100-35, 22+17) - COHERENTE
        behavior: 'quiz_list'
    },
    {
        id: 'g2-problemas-p1',
        label: 'Problemas Cotidianos (I)',
        level: 2,
        type: 'applied',
        requires: ['g2-conjuntos', 'g2-centena-lectura'],
        description: 'Resolución de problemas cotidianos de suma y resta.',
        xOffset: 45,
        additionalQuizzes: [306, 303], // Quiz 306: Problemas con Naturales (Nivel 1), Quiz 303: Recta Numérica (Nivel 2)
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: GRANDES NÚMEROS Y EL TIEMPO (Periodo II)
    // ==========================================
    {
        id: 'g2-u2-grandes-numeros',
        label: 'Números a 99.999 y el Tiempo',
        level: 3,
        type: 'basic',
        requires: ['g2-suma-resta-999', 'g2-problemas-p1'],
        description: 'Ampliación a cinco cifras, valor posicional, reloj y calendario.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-numeros-99999',
        label: 'Números hasta 99.999',
        level: 4,
        type: 'basic',
        requires: ['g2-u2-grandes-numeros'],
        description: 'Unidades de mil y decenas de mil. Lectura y valor posicional.',
        xOffset: -45,
        additionalQuizzes: [419], // Quiz 419: Valor posicional de unidades, decenas, centenas y millares - COHERENTE
        behavior: 'quiz_list'
    },
    {
        id: 'g2-descomposicion',
        label: 'Descomposición Numérica',
        level: 4,
        type: 'basic',
        requires: ['g2-u2-grandes-numeros'],
        description: 'Descomposición aditiva y posicional de números.',
        xOffset: 45,
        additionalQuizzes: [420], // Quiz 420: Descomposición Posicional (789 = 700 + ... + 9, 1.234, billetes)
        behavior: 'quiz_list'
    },
    {
        id: 'g2-suma-resta-llevando',
        label: 'Operaciones con Reagrupación',
        level: 5,
        type: 'critical',
        requires: ['g2-numeros-99999', 'g2-descomposicion'],
        description: 'Sumas llevando y restas prestando con números grandes.',
        xOffset: -45,
        additionalQuizzes: [305], // Quiz 305: Suma y Resta Avanzado (Nivel 2 - con reserva/llevando)
        behavior: 'quiz_list'
    },
    {
        id: 'g2-tiempo-reloj-cal',
        label: 'El Reloj y el Calendario',
        level: 5,
        type: 'basic',
        requires: ['g2-numeros-99999', 'g2-descomposicion'],
        description: 'Lectura de horas y minutos en reloj, días, semanas y meses en el calendario.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-problemas-p2',
        label: 'Retos y Problemas (II)',
        level: 6,
        type: 'applied',
        requires: ['g2-suma-resta-llevando', 'g2-tiempo-reloj-cal'],
        description: 'Situaciones problémicas que combinan operaciones y nociones de tiempo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: SALTO A LA MULTIPLICACIÓN Y MEDIDAS (Periodo III)
    // ==========================================
    {
        id: 'g2-u3-inicio-multiplicacion',
        label: 'Multiplicación y Longitud',
        level: 7,
        type: 'basic',
        requires: ['g2-problemas-p2'],
        description: 'Sumas repetidas, tablas de multiplicar, repartos y medidas de longitud.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-pares-impares',
        label: 'Números Pares e Impares',
        level: 8,
        type: 'basic',
        requires: ['g2-u3-inicio-multiplicacion'],
        description: 'Identificación de números pares e impares y patrones de dos en dos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-sumandos-iguales',
        label: 'Suma Repetida y Arreglos',
        level: 8,
        type: 'basic',
        requires: ['g2-u3-inicio-multiplicacion'],
        description: 'La adición de sumandos iguales y arreglos rectangulares (filas y columnas).',
        xOffset: 45,
        additionalQuizzes: [548], // Quiz 548: ¡Aventura en la Tabla del 2! (patrones de 2 en 2, suma repetida)
        behavior: 'quiz_list'
    },
    {
        id: 'g2-tablas-1-10',
        label: 'Tablas del 1 al 10',
        level: 9,
        type: 'critical',
        requires: ['g2-pares-impares', 'g2-sumandos-iguales'],
        description: 'Construcción y dominio de la multiplicación de números del 1 al 10.',
        xOffset: -45,
        additionalQuizzes: [515, 549, 551, 588, 626], // Tablas elementales (1-10, tabla 3, tabla 5, tabla 10, V/F)
        behavior: 'quiz_list'
    },
    {
        id: 'g2-repartos-division',
        label: 'Repartos y División',
        level: 9,
        type: 'basic',
        requires: ['g2-pares-impares', 'g2-sumandos-iguales'],
        description: 'Repartos en partes iguales y relación entre multiplicación y división.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-longitud-metro',
        label: 'Metro, Decímetro y Centímetro',
        level: 10,
        type: 'basic',
        requires: ['g2-tablas-1-10', 'g2-repartos-division'],
        description: 'Instrumentos de medida, unidades de longitud y equivalencias básicas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: OPERACIONES AVANZADAS Y MASA (Periodo IV)
    // ==========================================
    {
        id: 'g2-u4-operaciones-avanzadas',
        label: 'Multiplicación, División y Masa',
        level: 11,
        type: 'basic',
        requires: ['g2-longitud-metro'],
        description: 'Propiedades, múltiplos, factores, divisiones exactas y concepto de masa.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-propiedades-mult',
        label: 'Propiedades de la Multiplicación',
        level: 12,
        type: 'basic',
        requires: ['g2-u4-operaciones-avanzadas'],
        description: 'Propiedad conmutativa y asociativa explicadas con dibujos y ejemplos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-division-exacta',
        label: 'División de Números del 1 al 10',
        level: 12,
        type: 'basic',
        requires: ['g2-u4-operaciones-avanzadas'],
        description: 'Cálculo de divisiones exactas utilizando las tablas de multiplicar.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-multiplos-divisores',
        label: 'Múltiplos y Factores',
        level: 13,
        type: 'basic',
        requires: ['g2-propiedades-mult', 'g2-division-exacta'],
        description: 'Múltiplos iniciales (de 2, 3, 5 y 10) y factores de un número.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-masa-peso',
        label: 'Medidas de Masa (Kilo y Gramo)',
        level: 13,
        type: 'basic',
        requires: ['g2-propiedades-mult', 'g2-division-exacta'],
        description: 'Concepto de peso y masa, la balanza, el gramo y el kilogramo.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-problemas-p4',
        label: 'Misiones Matemáticas Integradas',
        level: 14,
        type: 'applied',
        requires: ['g2-multiplos-divisores', 'g2-masa-peso'],
        description: 'Resolución de problemas cotidianos combinando las 4 operaciones y medidas.',
        xOffset: 0,
        additionalQuizzes: [307], // Quiz 307: Solución de Problemas con Naturales (Nivel 2)
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: GRAN MAESTRÍA DE SEGUNDO GRADO
    // ==========================================
    {
        id: 'g2-mastery',
        label: 'Maestría Cósmica de 2° Grado',
        level: 15,
        type: 'evaluation',
        requires: [],
        description: 'El gran reto que corona todo el aprendizaje matemático de segundo de primaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
