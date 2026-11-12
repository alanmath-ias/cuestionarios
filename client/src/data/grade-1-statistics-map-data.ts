import { ArithmeticNode } from './arithmetic-map-data';

export const grade1StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CLASIFICACIÓN Y AGRUPACIÓN DE OBJETOS
    // ==========================================
    {
        id: 'g1-stat-u1-clasificar',
        label: 'Clasificación de Objetos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Aprende a ordenar y agrupar colecciones de cosas según sus características.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-color-forma',
        label: 'Agrupar por Color y Forma',
        level: 1,
        type: 'basic',
        requires: ['g1-stat-u1-clasificar'],
        description: 'Junta objetos rojos con rojos, círculos con círculos y aprende a separarlos en grupos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-tamano-tipo',
        label: 'Agrupar por Tamaño y Tipo',
        level: 1,
        type: 'basic',
        requires: ['g1-stat-u1-clasificar'],
        description: 'Separa juguetes grandes de pequeños, frutas de animales y lápices de juguetes.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-pertenece-no',
        label: '¿Cuál no Pertenece al Grupo?',
        level: 2,
        type: 'critical',
        requires: ['g1-stat-color-forma', 'g1-stat-tamano-tipo'],
        description: 'Juego del intruso: descubre qué elemento es diferente y no pertenece al conjunto.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: CONTEO Y PRIMERAS TABLAS CON MARCAS
    // ==========================================
    {
        id: 'g1-stat-u2-conteo',
        label: 'Conteo y Primeras Tablas',
        level: 3,
        type: 'basic',
        requires: ['g1-stat-pertenece-no'],
        description: 'Pasa de mirar un desorden de objetos a contarlos de forma ordenada.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-conteo-uno-a-uno',
        label: 'Contar Uno a Uno',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-conteo'],
        description: 'Cuenta juguetes, frutas y personas señalando uno por uno sin repetir ninguno.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-marcas-palitos',
        label: 'Contar con Palitos y Marcas',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-conteo'],
        description: 'Usa marcas o palitos para registrar cuántas cosas vas contando poco a poco.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-tabla-simple',
        label: 'Mi Primera Tabla de Conteo',
        level: 5,
        type: 'critical',
        requires: ['g1-stat-conteo-uno-a-uno', 'g1-stat-marcas-palitos'],
        description: 'Organiza filas con el dibujo del objeto y el número total que contaste.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: PICTOGRAMAS DIVERTIDOS
    // ==========================================
    {
        id: 'g1-stat-u3-pictogramas',
        label: 'Pictogramas Divertidos',
        level: 6,
        type: 'basic',
        requires: ['g1-stat-tabla-simple'],
        description: 'Descubre gráficos mágicos donde los dibujos representan información real.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-leer-pictogramas',
        label: 'Lectura de Pictogramas',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-pictogramas'],
        description: 'Mira un dibujo: cada estrella o carita vale 1 juguete o 1 fruta favorita.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-completar-pictogramas',
        label: 'Dibuja tu Pictograma',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-pictogramas'],
        description: 'Agrega caritas, estrellas o círculos para completar la información de una encuesta.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-mas-menos',
        label: '¿Quién Tiene Más y Quién Menos?',
        level: 8,
        type: 'applied',
        requires: ['g1-stat-leer-pictogramas', 'g1-stat-completar-pictogramas'],
        description: 'Compara filas de dibujos para saber qué opción es la más votada o preferida.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: GRÁFICOS DE BARRAS DE BLOQUES
    // ==========================================
    {
        id: 'g1-stat-u4-barras',
        label: 'Gráficos de Barras de Bloques',
        level: 9,
        type: 'basic',
        requires: ['g1-stat-mas-menos'],
        description: 'Construye torres y filas de colores para comparar cantidades visualmente.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-torres-verticales',
        label: 'Torres y Barras Verticales',
        level: 10,
        type: 'basic',
        requires: ['g1-stat-u4-barras'],
        description: 'Torres apiladas de bloques: la torre más alta tiene más, la más baja tiene menos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-filas-horizontales',
        label: 'Filas y Barras Horizontales',
        level: 10,
        type: 'basic',
        requires: ['g1-stat-u4-barras'],
        description: 'Tiras acostadas de cuadritos que muestran cuántas cosas recolectó cada amigo.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-preguntas-graficos',
        label: 'Preguntas y Respuestas con Gráficos',
        level: 11,
        type: 'applied',
        requires: ['g1-stat-torres-verticales', 'g1-stat-filas-horizontales'],
        description: 'Responde cuántos hay en total, cuál tiene más y cuántos faltan para empatar.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: SEGURO, POSIBLE E IMPOSIBLE
    // ==========================================
    {
        id: 'g1-stat-u5-azar',
        label: 'Seguro, Posible e Imposible',
        level: 12,
        type: 'basic',
        requires: ['g1-stat-preguntas-graficos'],
        description: 'Primeros pasos para entender qué cosas pueden pasar y qué cosas no.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-seguro-imposible',
        label: '¿Es Seguro o Imposible?',
        level: 13,
        type: 'basic',
        requires: ['g1-stat-u5-azar'],
        description: '¿Puede salir el sol de noche? ¿Puede volar un pez? Descubre qué es seguro y qué es imposible.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-juegos-suerte',
        label: 'Bolsas Mágicas y Colores',
        level: 13,
        type: 'basic',
        requires: ['g1-stat-u5-azar'],
        description: 'Si en una bolsa solo hay bolitas rojas, ¿qué color saldrá seguro al sacar una?',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-misiones-investigador',
        label: 'Misiones de Pequeños Investigadores',
        level: 14,
        type: 'applied',
        requires: ['g1-stat-seguro-imposible', 'g1-stat-juegos-suerte'],
        description: 'Resuelve retos y acertijos combinando conteo, tablas, gráficos y probabilidad cotidiana.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: GRAN MAESTRÍA DE ESTADÍSTICA DE 1°
    // ==========================================
    {
        id: 'g1-stat-mastery',
        label: 'Medalla de Oro del Conteo',
        level: 15,
        type: 'evaluation',
        requires: [],
        description: '¡El gran reto final de datos! Organiza, cuenta y demuestra que eres un maestro investigador de 1° de primaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];

