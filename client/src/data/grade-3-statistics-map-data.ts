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
        description: 'Distingue entre cualidades que se describen con palabras y datos numéricos que provienen del conteo de elementos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-cualitativas-vs-cuantitativas',
        label: 'Cualidades vs. Números Contables (Discretos)',
        level: 1,
        type: 'basic',
        requires: ['g3-stat-u1-variables-discretas'],
        description: 'Clasifica variables cotidianas: ¿el color favorito es cualitativo? ¿el número de hermanos es cuantitativo discreto?',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-dato-mayor-menor-orden',
        label: 'Ordenación de Datos y Valores Extremos (Mínimo y Máximo)',
        level: 1,
        type: 'basic',
        requires: ['g3-stat-u1-variables-discretas'],
        description: 'Ordena colecciones numéricas de menor a mayor, identificando claramente el dato menor (mínimo) y el dato mayor (máximo).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-frecuencias-en-listas-largas',
        label: 'Tabulación de Listas Numéricas con Frecuencias Absolutas',
        level: 2,
        type: 'applied',
        requires: ['g3-stat-cualitativas-vs-cuantitativas', 'g3-stat-dato-mayor-menor-orden'],
        description: 'Organiza conjuntos de 20 o más datos en tablas limpias con sus respectivas frecuencias absolutas sin cometer omisiones.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: PROPORCIONES Y GRÁFICOS DE LÍNEAS TEMPORALES
    // ==========================================
    {
        id: 'g3-stat-u2-proporciones-lineas-tendencias',
        label: 'Proporciones y Gráficos de Líneas Temporales',
        level: 3,
        type: 'basic',
        requires: ['g3-stat-frecuencias-en-listas-largas'],
        description: 'Comprende la proporción respecto al total y descubre cómo los gráficos de líneas reflejan cambios a través del tiempo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-fraccion-del-total-relativa',
        label: 'La Frecuencia Relativa como Fracción del Total',
        level: 4,
        type: 'basic',
        requires: ['g3-stat-u2-proporciones-lineas-tendencias'],
        description: 'Si 4 de cada 10 estudiantes prefieren leer, expresa esa relación como la fracción 4/10 del grupo total.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-graficos-de-lineas-tiempo',
        label: 'Gráficos de Líneas y Series de Tiempo',
        level: 4,
        type: 'basic',
        requires: ['g3-stat-u2-proporciones-lineas-tendencias'],
        description: 'Puntos unidos por segmentos continuos para registrar la temperatura durante una semana o la estatura año a año.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-tendencias-sube-baja-estable',
        label: 'Interpretación de Tendencias: Subidas, Bajadas y Estabilidad',
        level: 5,
        type: 'applied',
        requires: ['g3-stat-fraccion-del-total-relativa', 'g3-stat-graficos-de-lineas-tiempo'],
        description: 'Analiza si un gráfico de líneas muestra aumento sostenido, disminución o comportamiento estable a lo largo del tiempo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: MEDIDAS ESTADÍSTICAS: MODA, RANGO Y PROMEDIO
    // ==========================================
    {
        id: 'g3-stat-u3-medidas-centro-dispersion',
        label: 'Medidas Estadísticas: Moda, Rango y Promedio',
        level: 6,
        type: 'basic',
        requires: ['g3-stat-tendencias-sube-baja-estable'],
        description: 'Primeras herramientas matemáticas de resumen: el dato más frecuente, la separación de extremos y el reparto equitativo.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-concepto-calculo-moda',
        label: 'La Moda (Mo): Dato de Mayor Frecuencia y Bimodalidad',
        level: 7,
        type: 'basic',
        requires: ['g3-stat-u3-medidas-centro-dispersion'],
        description: 'Encuentra el valor que más veces se repite en listas y tablas. Reconoce distribuciones unimodales y bimodales.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-calculo-rango-recorrido',
        label: 'El Rango o Recorrido (R = x_máx - x_mín) como Dispersión',
        level: 7,
        type: 'basic',
        requires: ['g3-stat-u3-medidas-centro-dispersion'],
        description: 'Calcula la distancia numérica entre el valor máximo y el mínimo para evaluar qué tan separados están los datos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-nivelar-torres-bloques',
        label: 'El Promedio Intuitivo: Reparto Equitativo y Nivelación de Bloques',
        level: 8,
        type: 'applied',
        requires: ['g3-stat-concepto-calculo-moda', 'g3-stat-calculo-rango-recorrido'],
        description: 'Modelo visual concreto: pasar bloques de la torre más alta a la más baja hasta que todas queden exactamente iguales.',
        xOffset: -35,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-sumar-todos-dividir-cantidad',
        label: 'Algoritmo del Promedio y Resolución de Problemas Escolares',
        level: 8,
        type: 'applied',
        requires: ['g3-stat-concepto-calculo-moda', 'g3-stat-calculo-rango-recorrido'],
        description: 'Calcula la media sumando los valores observados y dividiendo entre la cantidad total de datos (promedio de notas y goles).',
        xOffset: 35,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: EXPERIMENTOS ALEATORIOS Y FRECUENCIA OBSERVADA
    // ==========================================
    {
        id: 'g3-stat-u4-experimentos-aleatorios',
        label: 'Experimentos Aleatorios y Frecuencia Observada',
        level: 9,
        type: 'basic',
        requires: ['g3-stat-nivelar-torres-bloques', 'g3-stat-sumar-todos-dividir-cantidad'],
        description: 'Aprende a registrar resultados experimentales de monedas, dados y ruletas al repetir lanzamientos múltiples veces.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-espacio-resultados-posibles',
        label: 'Listado Exhaustivo de Resultados Posibles de un Experimento',
        level: 10,
        type: 'basic',
        requires: ['g3-stat-u4-experimentos-aleatorios'],
        description: 'Encuentra el conjunto completo de posibilidades: al tirar un dado estándar de 6 caras los resultados posibles son {1, 2, 3, 4, 5, 6}.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-registro-frecuencia-lanzamientos',
        label: 'Registro de Frecuencias Observadas en 20 o más Lanzamientos',
        level: 10,
        type: 'applied',
        requires: ['g3-stat-u4-experimentos-aleatorios'],
        description: 'Tira una moneda o dado 20 veces, anota en una tabla los resultados y compara las frecuencias observadas con tus expectativas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-azar-vs-trampa-probabilidad',
        label: 'Juegos Justos vs. Ventajosos con Ruletas y Dados',
        level: 11,
        type: 'applied',
        requires: ['g3-stat-espacio-resultados-posibles', 'g3-stat-registro-frecuencia-lanzamientos'],
        description: 'Determina si las reglas de un juego otorgan las mismas oportunidades a todos o si existe ventaja matemática para alguien.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: TABLAS DE DOBLE ENTRADA Y CONTEO MULTIPLICATIVO
    // ==========================================
    {
        id: 'g3-stat-u5-conteo-tablas-cruzadas-arboles',
        label: 'Tablas de Doble Entrada y Conteo Multiplicativo',
        level: 12,
        type: 'advanced',
        requires: ['g3-stat-azar-vs-trampa-probabilidad'],
        description: 'Organización de datos cruzando dos variables simultáneas y principio multiplicativo mediante árboles.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g3-stat-tablas-doble-entrada-contingencia',
        label: 'Tablas de Doble Entrada (Cruce de Filas y Columnas)',
        level: 13,
        type: 'basic',
        requires: ['g3-stat-u5-conteo-tablas-cruzadas-arboles'],
        description: 'Cruza dos variables: género y deporte preferido, completando totales por fila y por columna de forma ordenada.',
        xOffset: -40,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-diagramas-arbol-etapas',
        label: 'Diagramas de Árbol de Dos Etapas',
        level: 13,
        type: 'applied',
        requires: ['g3-stat-u5-conteo-tablas-cruzadas-arboles'],
        description: 'Construye árboles sistemáticos con dos niveles de decisión (ejemplo: tipo de helado y tipo de cobertura) sin olvidar opciones.',
        xOffset: 40,
        behavior: 'quiz_list'
    },
    {
        id: 'g3-stat-principio-multiplicativo-intuitivo',
        label: 'Principio Multiplicativo Intuitivo (m × n Opciones)',
        level: 14,
        type: 'advanced',
        requires: ['g3-stat-tablas-doble-entrada-contingencia', 'g3-stat-diagramas-arbol-etapas'],
        description: 'Calcula el número total de combinaciones posibles multiplicando las opciones de cada etapa: 3 tipos de pan × 4 rellenos = 12 opciones.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
