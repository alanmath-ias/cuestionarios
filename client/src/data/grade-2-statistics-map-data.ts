import { ArithmeticNode } from './arithmetic-map-data';

export const grade2StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: VARIABLES CUALITATIVAS Y ENCUESTAS ESCOLARES
    // ==========================================
    {
        id: 'g2-stat-u1-encuestas-variables',
        label: 'Variables Cualitativas y Encuestas Escolares',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Aprende a formular preguntas claras con opciones cerradas, registrar respuestas y agrupar características cualitativas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-variables-cualitativas-entorno',
        label: 'Variables Cualitativas en el Entorno Escolar',
        level: 1,
        type: 'basic',
        requires: ['g2-stat-u1-encuestas-variables'],
        description: 'Identifica características no numéricas observables: deporte favorito, color de ojos, medio de transporte al colegio.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-diseno-encuesta-escolar',
        label: 'Diseño y Aplicación de Encuestas con Opciones Cerradas',
        level: 1,
        type: 'basic',
        requires: ['g2-stat-u1-encuestas-variables'],
        description: 'Formula preguntas con opciones fijas para que los encuestados elijan una sola respuesta clara y sin confusiones.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-organizacion-respuestas-listas',
        label: 'Organización de Respuestas en Listados Ordenados',
        level: 2,
        type: 'applied',
        requires: ['g2-stat-variables-cualitativas-entorno', 'g2-stat-diseno-encuesta-escolar'],
        description: 'Agrupa respuestas idénticas y cuenta cuántos estudiantes eligieron cada categoría antes de construir tablas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TABLAS DE FRECUENCIA ABSOLUTA
    // ==========================================
    {
        id: 'g2-stat-u2-tablas-frecuencia-absoluta',
        label: 'Tablas de Frecuencia Absoluta',
        level: 3,
        type: 'basic',
        requires: ['g2-stat-organizacion-respuestas-listas'],
        description: 'Formalización del conteo: el número de veces que se repite un dato se denomina frecuencia absoluta (f).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-concepto-frecuencia-absoluta',
        label: 'La Frecuencia Absoluta (f) como Conteo Numérico',
        level: 4,
        type: 'basic',
        requires: ['g2-stat-u2-tablas-frecuencia-absoluta'],
        description: 'Comprende que la frecuencia absoluta es simplemente el número exacto de veces que se repite una opción o respuesta.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-total-observaciones-suma',
        label: 'Suma Total de Datos y Verificación de Encuestados',
        level: 4,
        type: 'basic',
        requires: ['g2-stat-u2-tablas-frecuencia-absoluta'],
        description: 'Suma todas las frecuencias absolutas para verificar que el total coincida exactamente con la cantidad de personas evaluadas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-interpretacion-diferencias-tablas',
        label: 'Lectura e Interpretación de Diferencias en Tablas',
        level: 5,
        type: 'applied',
        requires: ['g2-stat-concepto-frecuencia-absoluta', 'g2-stat-total-observaciones-suma'],
        description: 'Responde preguntas de análisis: ¿cuál categoría tuvo mayor frecuencia? ¿cuántos votos le faltaron a otra para empatar?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: PICTOGRAMAS Y GRÁFICOS CON ESCALAS NUMÉRICAS
    // ==========================================
    {
        id: 'g2-stat-u3-pictogramas-graficos-escalas',
        label: 'Pictogramas y Gráficos con Escalas Numéricas',
        level: 6,
        type: 'basic',
        requires: ['g2-stat-interpretacion-diferencias-tablas'],
        description: 'Evolución visual: un solo dibujo o una graduación en el eje representa 2, 5 o 10 unidades.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-simbolo-con-equivalencia',
        label: 'Pictogramas con Escala (Un Símbolo Vale 2 o 5)',
        level: 7,
        type: 'basic',
        requires: ['g2-stat-u3-pictogramas-graficos-escalas'],
        description: 'Interpreta la leyenda del gráfico: si cada estrella vale 2 votos, 4 estrellas dibujadas representan 8 votos reales.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-medio-simbolo-fraccion',
        label: 'Medios Símbolos en Pictogramas y Totales',
        level: 7,
        type: 'basic',
        requires: ['g2-stat-u3-pictogramas-graficos-escalas'],
        description: 'Interpreta partes de símbolos: si un árbol completo vale 2 árboles, medio árbol dibujado representa 1 árbol.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-eje-frecuencias-escala',
        label: 'El Eje Numérico de Frecuencias en Gráficos de Barras',
        level: 8,
        type: 'applied',
        requires: ['g2-stat-simbolo-con-equivalencia', 'g2-stat-medio-simbolo-fraccion'],
        description: 'Sigue la línea horizontal desde el tope de la barra hasta el eje vertical graduado de 2 en 2 o 5 en 5 para leer el valor exacto.',
        xOffset: -35,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-comparacion-entre-categorias',
        label: 'Comparación y Análisis Cuantitativo de Barras',
        level: 8,
        type: 'applied',
        requires: ['g2-stat-simbolo-con-equivalencia', 'g2-stat-medio-simbolo-fraccion'],
        description: 'Ordena categorías de mayor a menor frecuencia, identifica la moda visual y calcula diferencias exactas entre barras.',
        xOffset: 35,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: AZAR, POSIBILIDAD Y JUEGOS JUSTOS
    // ==========================================
    {
        id: 'g2-stat-u4-probabilidad-intuitiva-juegos',
        label: 'Azar, Posibilidad y Juegos Justos',
        level: 9,
        type: 'basic',
        requires: ['g2-stat-eje-frecuencias-escala', 'g2-stat-comparacion-entre-categorias'],
        description: 'Compara eventos aleatorios para determinar cuál tiene mayor o menor oportunidad de ocurrir según la cantidad de elementos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-comparar-probabilidades-objetos',
        label: 'Mayoría de Objetos y Mayor Probabilidad',
        level: 10,
        type: 'basic',
        requires: ['g2-stat-u4-probabilidad-intuitiva-juegos'],
        description: 'Si en una bolsa hay 8 bolas verdes y 2 amarillas, explica por qué es más probable sacar verde y menos probable sacar amarilla.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-ruletas-azar-sectores',
        label: 'Ruletas de la Suerte y Tamaño de Sectores',
        level: 10,
        type: 'basic',
        requires: ['g2-stat-u4-probabilidad-intuitiva-juegos'],
        description: 'Analiza ruletas divididas en regiones de distinto tamaño: el sector de mayor área tiene mayor probabilidad de salir.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-igualmente-probable-justicia',
        label: 'Sucesos Igualmente Probables y Noción de Juego Justo',
        level: 11,
        type: 'applied',
        requires: ['g2-stat-comparar-probabilidades-objetos', 'g2-stat-ruletas-azar-sectores'],
        description: 'Identifica cuándo dos jugadores tienen la misma oportunidad matemática de ganar (moneda balanceada o ruleta con partes iguales).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: TÉCNICAS DE CONTEO Y ÁRBOLES CON DIBUJOS
    // ==========================================
    {
        id: 'g2-stat-u5-conteo-sistematico-arboles',
        label: 'Técnicas de Conteo y Árboles con Dibujos',
        level: 12,
        type: 'advanced',
        requires: ['g2-stat-igualmente-probable-justicia'],
        description: 'Estructuras iniciales de conteo combinatorio con dos características y diagramas ramificados ilustrados.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-listados-sistematicos',
        label: 'Listados Sistemáticos para no Repetir ni Omitir Opciones',
        level: 13,
        type: 'basic',
        requires: ['g2-stat-u5-conteo-sistematico-arboles'],
        description: 'Escribe combinaciones siguiendo un orden fijo (fijar una opción y cambiar la otra) para garantizar que la lista esté completa.',
        xOffset: -40,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-combinaciones-dos-conjuntos',
        label: 'Combinar Prendas, Comidas y Rutas (2 Características)',
        level: 13,
        type: 'applied',
        requires: ['g2-stat-u5-conteo-sistematico-arboles'],
        description: 'Resuelve problemas prácticos: si tienes 2 camisetas y 3 pantalones, encuentra las 6 combinaciones posibles.',
        xOffset: 40,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-primeros-arboles-dibujo',
        label: 'Diagramas de Árbol Ilustrados con Ramas y Dibujos',
        level: 14,
        type: 'advanced',
        requires: ['g2-stat-listados-sistematicos', 'g2-stat-combinaciones-dos-conjuntos'],
        description: 'Dibuja ramas que conectan la primera elección con cada una de las segundas elecciones para visualizar todo el espacio de opciones.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
