import { ArithmeticNode } from './arithmetic-map-data';

export const grade3StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: VARIABLES CUALITATIVAS Y CUANTITATIVAS DISCRETAS
    // ==========================================
    {
        id: 'g3-stat-u1-variables-discretas',
        label: 'Variables Cualitativas y Cuantitativas Discretas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Distingue entre cualidades que se describen con palabras y datos numéricos que provienen de contar objetos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-cualitativas-vs-cuantitativas',
        label: 'Cualidades vs. Números Contables',
        level: 1,
        type: 'basic',
        requires: ['g3-stat-u1-variables-discretas'],
        description: 'Clasifica variables: ¿el color favorito es cualitativo? ¿el número de hermanos es cuantitativo discreto?',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-dato-mayor-menor-orden',
        label: 'Ordenación de Datos: Mayor, Menor y Extremos',
        level: 1,
        type: 'basic',
        requires: ['g3-stat-u1-variables-discretas'],
        description: 'Ordena listas numéricas de menor a mayor, identificando el valor mínimo (xₘᵢₙ) y el valor máximo (xₘₐₓ).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-frecuencias-en-listas-largas',
        label: 'Conteo y Tabulación de Conjuntos Mayores',
        level: 2,
        type: 'applied',
        requires: ['g3-stat-cualitativas-vs-cuantitativas', 'g3-stat-dato-mayor-menor-orden'],
        description: 'Organiza listas de 20 o más datos en tablas limpias con sus respectivas frecuencias absolutas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: FRECUENCIA RELATIVA INTUITIVA Y GRÁFICOS DE LÍNEAS
    // ==========================================
    {
        id: 'g3-stat-u2-frecuencia-relativa-lineas',
        label: 'Frecuencia Relativa Intuitiva y Gráficos de Líneas',
        level: 3,
        type: 'basic',
        requires: ['g3-stat-frecuencias-en-listas-largas'],
        description: 'Comprende la proporción respecto al total y descubre cómo los gráficos de líneas muestran cambios a lo largo del tiempo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-fraccion-del-total-relativa',
        label: 'La Frecuencia Relativa como Fracción del Total',
        level: 4,
        type: 'basic',
        requires: ['g3-stat-u2-frecuencia-relativa-lineas'],
        description: 'Si 4 de cada 10 estudiantes prefieren leer, expresa esa relación como la fracción 4/10 del grupo.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-graficos-de-lineas-tiempo',
        label: 'Gráficos de Líneas y Series Temporales',
        level: 4,
        type: 'basic',
        requires: ['g3-stat-u2-frecuencia-relativa-lineas'],
        description: 'Puntos unidos por segmentos para observar la temperatura durante una semana o la estatura año a año.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-tendencias-sube-baja-estable',
        label: 'Interpretación de Tendencias: Subidas y Bajadas',
        level: 5,
        type: 'critical',
        requires: ['g3-stat-fraccion-del-total-relativa', 'g3-stat-graficos-de-lineas-tiempo'],
        description: 'Analiza si un gráfico de líneas muestra aumento, disminución o estabilidad a lo largo de los días o meses.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: PRIMERAS MEDIDAS: LA MODA Y EL RANGO
    // ==========================================
    {
        id: 'g3-stat-u3-moda-rango',
        label: 'Primeras Medidas: La Moda y el Rango',
        level: 6,
        type: 'basic',
        requires: ['g3-stat-tendencias-sube-baja-estable'],
        description: 'Primeras herramientas matemáticas de resumen: el dato más popular y la separación entre los extremos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-concepto-calculo-moda',
        label: 'La Moda (Mo): El Dato de Mayor Frecuencia',
        level: 7,
        type: 'basic',
        requires: ['g3-stat-u3-moda-rango'],
        description: 'Encuentra el valor que más veces se repite en listas y tablas. Reconoce distribuciones con una moda o dos modas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-calculo-rango-recorrido',
        label: 'El Rango o Recorrido: Mayor Menos Menor',
        level: 7,
        type: 'basic',
        requires: ['g3-stat-u3-moda-rango'],
        description: 'Calcula la distancia numérica entre el valor máximo y el mínimo: R = xₘₐₓ - xₘᵢₙ para ver qué tan dispersos están.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-comparacion-grupos-moda-rango',
        label: 'Comparación de Dos Grupos con Moda y Rango',
        level: 8,
        type: 'applied',
        requires: ['g3-stat-concepto-calculo-moda', 'g3-stat-calculo-rango-recorrido'],
        description: 'Compara dos equipos de baloncesto o dos salones: ¿cuál tiene la moda más alta? ¿cuál tiene mayor rango de edades?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: EL PROMEDIO COMO REPARTO EQUITATIVO
    // ==========================================
    {
        id: 'g3-stat-u4-promedio-equitativo',
        label: 'El Promedio como Reparto Equitativo',
        level: 9,
        type: 'basic',
        requires: ['g3-stat-comparacion-grupos-moda-rango'],
        description: 'Introducción intuitiva a la media aritmética: juntar todo y repartirlo en partes exactamente iguales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-nivelar-torres-bloques',
        label: 'Nivelación de Torres de Bloques',
        level: 10,
        type: 'basic',
        requires: ['g3-stat-u4-promedio-equitativo'],
        description: 'Modelo visual: si pasamos bloques de la torre más alta a la más baja hasta que todas queden a la misma altura.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-sumar-todos-dividir-cantidad',
        label: 'Sumar Todo y Dividir entre el Número de Grupos',
        level: 10,
        type: 'basic',
        requires: ['g3-stat-u4-promedio-equitativo'],
        description: 'Aprende el algoritmo del promedio sumando los valores de 3 o 4 datos y dividiendo por la cantidad de datos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-resolucion-problemas-promedio-basico',
        label: 'Problemas de Promedios de Calificaciones y Goles',
        level: 11,
        type: 'applied',
        requires: ['g3-stat-nivelar-torres-bloques', 'g3-stat-sumar-todos-dividir-cantidad'],
        description: 'Calcula la media de goles por partido o el promedio de notas en tres materias escolares sencillas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: EXPERIMENTOS ALEATORIOS Y FRECUENCIA
    // ==========================================
    {
        id: 'g3-stat-u5-experimentos-aleatorios',
        label: 'Experimentos Aleatorios y Frecuencia Observada',
        level: 12,
        type: 'basic',
        requires: ['g3-stat-resolucion-problemas-promedio-basico'],
        description: 'Aprende a registrar resultados experimentales de monedas, dados y ruletas al repetir lanzamientos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-espacio-resultados-posibles',
        label: 'Listado de Todos los Resultados Posibles',
        level: 13,
        type: 'basic',
        requires: ['g3-stat-u5-experimentos-aleatorios'],
        description: 'Encuentra el conjunto de posibilidades completas: al tirar un dado de 6 caras los resultados posibles son {1, 2, 3, 4, 5, 6}.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-registro-frecuencia-lanzamientos',
        label: 'Frecuencia Observada en 20 Lanzamientos',
        level: 13,
        type: 'basic',
        requires: ['g3-stat-u5-experimentos-aleatorios'],
        description: 'Tira una moneda 20 veces, anota en una tabla las caras y sellos, y compara el conteo final con tus expectativas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-azar-vs-trampa-probabilidad',
        label: 'Juegos Justos y Ruletas Equilibradas',
        level: 14,
        type: 'applied',
        requires: ['g3-stat-espacio-resultados-posibles', 'g3-stat-registro-frecuencia-lanzamientos'],
        description: 'Determina si un juego de azar es justo o si uno de los jugadores tiene ventaja matemática por tener más opciones.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: TABLAS DE DOBLE ENTRADA, ÁRBOLES Y GRAN CORONA DE 3.°
    // ==========================================
    {
        id: 'g3-stat-u6-doble-entrada-arboles-maestria',
        label: 'Tablas de Doble Entrada, Árboles y Gran Corona de 3.°',
        level: 15,
        type: 'basic',
        requires: ['g3-stat-azar-vs-trampa-probabilidad'],
        description: 'Organización de datos con dos criterios cruzados, principios de conteo multiplicativo y reto de maestría.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-tablas-doble-entrada-contingencia',
        label: 'Tablas de Doble Entrada (Filas y Columnas)',
        level: 16,
        type: 'basic',
        requires: ['g3-stat-u6-doble-entrada-arboles-maestria'],
        description: 'Cruza dos variables: género (niño/niña) y preferencia deportiva (fútbol/baloncesto), sumando totales por fila y columna.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-diagramas-arbol-etapas',
        label: 'Diagramas de Árbol de Dos Etapas',
        level: 16,
        type: 'basic',
        requires: ['g3-stat-u6-doble-entrada-arboles-maestria'],
        description: 'Calcula el total de opciones multiplicando: 3 tipos de pan × 4 tipos de relleno = 12 sándwiches posibles.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-corona-maestria-tercero',
        label: 'Gran Corona de Maestría de Estadística de 3.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g3-stat-tablas-doble-entrada-contingencia', 'g3-stat-diagramas-arbol-etapas'],
        description: '¡Consagración de 3.º! Domina moda, rango, promedio intuitivo, gráficos de líneas, tablas de doble entrada y árboles de probabilidad.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
