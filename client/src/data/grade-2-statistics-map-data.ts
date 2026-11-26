import { ArithmeticNode } from './arithmetic-map-data';

export const grade2StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: RECOLECCIÓN POR ENCUESTAS Y VARIABLES CUALITATIVAS
    // ==========================================
    {
        id: 'g2-stat-u1-encuestas-variables',
        label: 'Recolección por Encuestas y Variables Cualitativas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Aprende a formular preguntas claras, registrar respuestas y clasificar características cualitativas en grupos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-variables-cualitativas-entorno',
        label: 'Variables Cualitativas en el Entorno',
        level: 1,
        type: 'basic',
        requires: ['g2-stat-u1-encuestas-variables'],
        description: 'Identifica características no numéricas: deporte favorito, color de ojos, medio de transporte al colegio.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-diseno-encuesta-escolar',
        label: 'Diseño y Aplicación de Encuestas',
        level: 1,
        type: 'basic',
        requires: ['g2-stat-u1-encuestas-variables'],
        description: 'Formula preguntas con opciones fijas (cerradas) para que los compañeros elijan una sola respuesta sin confusiones.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-organizacion-respuestas-listas',
        label: 'Organización de Respuestas en Listas Ordenadas',
        level: 2,
        type: 'applied',
        requires: ['g2-stat-variables-cualitativas-entorno', 'g2-stat-diseno-encuesta-escolar'],
        description: 'Agrupa respuestas idénticas y cuenta cuántos estudiantes eligieron cada categoría de la encuesta.',
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
        description: 'Formalización del conteo: el número de veces que se repite un dato se llama frecuencia absoluta (f).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-concepto-frecuencia-absoluta',
        label: 'La Frecuencia Absoluta (f)',
        level: 4,
        type: 'basic',
        requires: ['g2-stat-u2-tablas-frecuencia-absoluta'],
        description: 'Comprende que la frecuencia absoluta es simplemente el conteo numérico de cuántas veces aparece cada opción.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-total-observaciones-suma',
        label: 'Suma Total de Datos y Verificación',
        level: 4,
        type: 'basic',
        requires: ['g2-stat-u2-tablas-frecuencia-absoluta'],
        description: 'Suma las frecuencias absolutas para verificar que el total coincida exactamente con la cantidad de encuestados.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-interpretacion-diferencias-tablas',
        label: 'Lectura de Diferencias en Tablas de Frecuencia',
        level: 5,
        type: 'critical',
        requires: ['g2-stat-concepto-frecuencia-absoluta', 'g2-stat-total-observaciones-suma'],
        description: 'Responde preguntas a partir de la tabla: ¿cuál tuvo mayor frecuencia? ¿cuántos votos le faltaron al segundo para ganar?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: PICTOGRAMAS CON ESCALAS Y EQUIVALENCIAS
    // ==========================================
    {
        id: 'g2-stat-u3-pictogramas-escalas',
        label: 'Pictogramas con Escalas y Equivalencias',
        level: 6,
        type: 'basic',
        requires: ['g2-stat-interpretacion-diferencias-tablas'],
        description: 'Evolución visual: un solo dibujo ahora puede representar 2, 5 o 10 objetos o personas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-simbolo-con-equivalencia',
        label: 'Un Símbolo Vale Más de Uno (Escala 2 y 5)',
        level: 7,
        type: 'basic',
        requires: ['g2-stat-u3-pictogramas-escalas'],
        description: 'Aprende a interpretar la clave o leyenda: si cada balón vale 2 goles, 3 balones dibujados significan 6 goles.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-medio-simbolo-fraccion',
        label: 'Medios Símbolos en Pictogramas',
        level: 7,
        type: 'basic',
        requires: ['g2-stat-u3-pictogramas-escalas'],
        description: 'Descubre qué significa medio dibujo: si un árbol completo vale 2 árboles, medio árbol representa 1.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-calculo-totales-pictogramas-escala',
        label: 'Cálculo de Totales con Pictogramas de Escala',
        level: 8,
        type: 'applied',
        requires: ['g2-stat-simbolo-con-equivalencia', 'g2-stat-medio-simbolo-fraccion'],
        description: 'Multiplica o suma reiteradamente para obtener las cantidades reales a partir de pictogramas con leyenda.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: GRÁFICOS DE BARRAS CON ESCALA NUMÉRICA
    // ==========================================
    {
        id: 'g2-stat-u4-barras-escala-numerica',
        label: 'Gráficos de Barras con Escala Numérica',
        level: 9,
        type: 'basic',
        requires: ['g2-stat-calculo-totales-pictogramas-escala'],
        description: 'El eje vertical se gradúa con números (de 1 en 1, de 2 en 2 o de 5 en 5) para leer la altura exacta de las barras.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-eje-frecuencias-escala',
        label: 'El Eje Numérico de Frecuencias',
        level: 10,
        type: 'basic',
        requires: ['g2-stat-u4-barras-escala-numerica'],
        description: 'Sigue la línea horizontal desde el tope de la barra hasta el eje vertical para leer la frecuencia sin contar cuadritos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-construccion-barras-escala',
        label: 'Dibujo de Barras hasta la Altura Correcta',
        level: 10,
        type: 'basic',
        requires: ['g2-stat-u4-barras-escala-numerica'],
        description: 'A partir de una tabla de frecuencia, dibuja y colorea las barras respetando la escala de 2 en 2 o 5 en 5.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-comparacion-entre-categorias',
        label: 'Comparación y Análisis de Barras',
        level: 11,
        type: 'applied',
        requires: ['g2-stat-eje-frecuencias-escala', 'g2-stat-construccion-barras-escala'],
        description: 'Ordena las categorías de mayor a menor frecuencia, encuentra la moda visual y calcula diferencias cuantitativas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PROBABILIDAD INTUITIVA: MÁS Y MENOS PROBABLE
    // ==========================================
    {
        id: 'g2-stat-u5-mas-menos-probable',
        label: 'Probabilidad Intuitiva: Más y Menos Probable',
        level: 12,
        type: 'basic',
        requires: ['g2-stat-comparacion-entre-categorias'],
        description: 'Compara eventos aleatorios para determinar cuál tiene mayor oportunidad de ocurrir según la cantidad de elementos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-comparar-probabilidades-objetos',
        label: 'Mayoría de Objetos y Mayor Posibilidad',
        level: 13,
        type: 'basic',
        requires: ['g2-stat-u5-mas-menos-probable'],
        description: 'Si en una urna hay 8 bolas verdes y 2 amarillas, es más probable sacar verde y menos probable sacar amarilla.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-ruletas-azar-sectores',
        label: 'Ruletas de la Suerte y Tamaño de Sectores',
        level: 13,
        type: 'basic',
        requires: ['g2-stat-u5-mas-menos-probable'],
        description: 'Analiza ruletas divididas en colores: el color con la zona más grande tiene más probabilidad de ganar al girar.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-igualmente-probable-justicia',
        label: 'Sucesos Igualmente Probables y Juegos Justos',
        level: 14,
        type: 'applied',
        requires: ['g2-stat-comparar-probabilidades-objetos', 'g2-stat-ruletas-azar-sectores'],
        description: 'Identifica cuándo dos jugadores tienen la misma posibilidad de ganar (moneda justa, ruleta con mitades iguales).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: CONTEO SISTEMÁTICO Y GRAN CORONA DE 2.°
    // ==========================================
    {
        id: 'g2-stat-u6-conteo-combinaciones-maestria',
        label: 'Conteo Sistemático y Gran Corona de 2.°',
        level: 15,
        type: 'basic',
        requires: ['g2-stat-igualmente-probable-justicia'],
        description: 'Primeras técnicas de conteo combinatorio con dos características y reto supremo del grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g2-stat-combinaciones-dos-conjuntos',
        label: 'Combinar Prendas y Menús (2 Características)',
        level: 16,
        type: 'basic',
        requires: ['g2-stat-u6-conteo-combinaciones-maestria'],
        description: 'Si tengo 2 camisetas y 3 pantalones, encuentra todas las formas posibles de vestirme sin repetir.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-primeros-arboles-dibujo',
        label: 'Diagramas de Árbol Ilustrados con Dibujos',
        level: 16,
        type: 'basic',
        requires: ['g2-stat-u6-conteo-combinaciones-maestria'],
        description: 'Dibuja ramas que conectan la primera elección con la segunda para no olvidar ninguna combinación posible.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g2-stat-corona-maestria-segundo',
        label: 'Gran Corona de Maestría de Estadística de 2.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g2-stat-combinaciones-dos-conjuntos', 'g2-stat-primeros-arboles-dibujo'],
        description: '¡Máximo reto de 2.º! Domina encuestas, tablas de frecuencia absoluta, pictogramas con escala, gráficos de barras y combinatoria básica.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
