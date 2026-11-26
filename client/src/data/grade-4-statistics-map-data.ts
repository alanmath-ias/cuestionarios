import { ArithmeticNode } from './arithmetic-map-data';

export const grade4StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: POBLACIÓN, MUESTRA Y VARIABLES ESTADÍSTICAS
    // ==========================================
    {
        id: 'g4-stat-u1-poblacion-muestra-variables',
        label: 'Población, Muestra y Variables Estadísticas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Diferencia el conjunto total de estudio (población) del subconjunto representativo encuestado (muestra), e identifica tipos de variables.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-stat-concepto-poblacion-muestra',
        label: 'Población, Muestra e Individuo Estadístico',
        level: 1,
        type: 'basic',
        requires: ['g4-stat-u1-poblacion-muestra-variables'],
        description: 'Distingue cuándo es necesario tomar una muestra: todos los niños del colegio (población) vs. 50 encuestados al azar (muestra).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-variables-discretas-continuas-intro',
        label: 'Variables Cuantitativas Discretas vs. Continuas',
        level: 1,
        type: 'basic',
        requires: ['g4-stat-u1-poblacion-muestra-variables'],
        description: 'Variables discretas (conteo con enteros: número de goles) vs. variables continuas (medición con decimales: estatura en metros, peso en kg).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-recoleccion-datos-estructurada',
        label: 'Diseño de Fichas e Instrumentos de Recolección de Datos',
        level: 2,
        type: 'applied',
        requires: ['g4-stat-concepto-poblacion-muestra', 'g4-stat-variables-discretas-continuas-intro'],
        description: 'Elabora formularios y fichas estructuradas para registrar datos ordenados sobre una muestra sin incurrir en sesgos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TABLAS DE FRECUENCIA COMPLETA: f, h Y %
    // ==========================================
    {
        id: 'g4-stat-u2-tablas-frecuencia-completa',
        label: 'Tablas de Frecuencia Completa: f, h y %',
        level: 3,
        type: 'basic',
        requires: ['g4-stat-recoleccion-datos-estructurada'],
        description: 'Construcción formal de tablas estadísticas: calcula frecuencias absolutas, relativas fraccionarias, decimales y porcentuales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-stat-frecuencia-relativa-decimal',
        label: 'Frecuencia Relativa: Cociente h = f / n',
        level: 4,
        type: 'basic',
        requires: ['g4-stat-u2-tablas-frecuencia-completa'],
        description: 'Divide la frecuencia absoluta entre el número total de datos para hallar el número decimal hᵢ (la suma siempre da 1).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-frecuencia-porcentual-calculo',
        label: 'Frecuencia Porcentual (% = h × 100)',
        level: 4,
        type: 'basic',
        requires: ['g4-stat-u2-tablas-frecuencia-completa'],
        description: 'Convierte el decimal a porcentaje multiplicando por 100. Comprende que la suma de todos los porcentajes debe dar el 100%.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-tabla-completa-interpretacion',
        label: 'Interpretación Integral de Tablas Estadísticas Completas',
        level: 5,
        type: 'applied',
        requires: ['g4-stat-frecuencia-relativa-decimal', 'g4-stat-frecuencia-porcentual-calculo'],
        description: 'Extrae conclusiones clave: ¿qué porcentaje prefiere una opción? ¿qué proporción representa más de la mitad del grupo?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: GRÁFICOS COMPARATIVOS Y LECTURA CIRCULAR
    // ==========================================
    {
        id: 'g4-stat-u3-graficos-multiples-circulares',
        label: 'Gráficos Comparativos y Lectura Circular',
        level: 6,
        type: 'basic',
        requires: ['g4-stat-tabla-completa-interpretacion'],
        description: 'Aprende a comparar dos series simultáneas con barras dobles y a interpretar los primeros diagramas de sectores (circulares).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-stat-barras-dobles-comparativas',
        label: 'Gráficos de Barras Dobles o Agrupadas',
        level: 7,
        type: 'basic',
        requires: ['g4-stat-u3-graficos-multiples-circulares'],
        description: 'Compara dos grupos a la vez (ejemplo: niños vs. niñas o ventas de enero vs. febrero) con dos barras de colores por categoría.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-graficos-circulares-lectura',
        label: 'Lectura de Gráficos Circulares o de Torta (50%, 25%, 75%)',
        level: 7,
        type: 'basic',
        requires: ['g4-stat-u3-graficos-multiples-circulares'],
        description: 'El círculo completo representa el 100%: medio círculo es el 50%, un cuarto es el 25% y sectores menores representan proporciones menores.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-eleccion-grafico-adecuado',
        label: 'Selección del Gráfico más Adecuado según el Tipo de Dato',
        level: 8,
        type: 'applied',
        requires: ['g4-stat-barras-dobles-comparativas', 'g4-stat-graficos-circulares-lectura'],
        description: 'Decide cuándo conviene usar barras (comparar categorías), líneas (ver evolución en el tiempo) o sectores (ver partes de un todo).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: MEDIDAS DE TENDENCIA CENTRAL Y RANGO
    // ==========================================
    {
        id: 'g4-stat-u4-tendencia-central-formal',
        label: 'Medidas de Tendencia Central y Rango',
        level: 9,
        type: 'basic',
        requires: ['g4-stat-eleccion-grafico-adecuado'],
        description: 'Cálculo formal de las tres medidas de centro (Media, Mediana y Moda) para conjuntos de datos no agrupados.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-stat-media-aritmetica-formula',
        label: 'Cálculo Formal de la Media Aritmética (x̄ = ∑x / n)',
        level: 10,
        type: 'basic',
        requires: ['g4-stat-u4-tendencia-central-formal'],
        description: 'Aplica la fórmula formal de la media: suma de todos los valores dividida entre la cantidad total de observaciones.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-mediana-moda-posicion',
        label: 'Cálculo de la Mediana (Me) y la Moda (Mo)',
        level: 10,
        type: 'basic',
        requires: ['g4-stat-u4-tendencia-central-formal'],
        description: 'Ordena los datos y halla el valor central exacto (mediana para cantidad impar) y el dato o datos más repetidos (moda).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-comparacion-media-mediana-moda',
        label: 'Comparación y Sensibilidad entre Media, Mediana y Moda',
        level: 11,
        type: 'applied',
        requires: ['g4-stat-media-aritmetica-formula', 'g4-stat-mediana-moda-posicion'],
        description: 'Resuelve problemas prácticos donde los estadísticos difieren y analiza cómo un valor muy alto o bajo altera el promedio.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PROBABILIDAD CLÁSICA Y PRINCIPIOS DE CONTEO
    // ==========================================
    {
        id: 'g4-stat-u5-probabilidad-regla-laplace-conteo',
        label: 'Probabilidad Clásica y Principios de Conteo',
        level: 12,
        type: 'advanced',
        requires: ['g4-stat-comparacion-media-mediana-moda'],
        description: 'Cuantificación matemática formal mediante la regla de Laplace y resolución de conteos por etapas aditivas y multiplicativas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g4-stat-regla-laplace-fraccion',
        label: 'La Regla de Laplace: P = Favorables / Posibles',
        level: 13,
        type: 'basic',
        requires: ['g4-stat-u5-probabilidad-regla-laplace-conteo'],
        description: 'Calcula probabilidades exactas en fracciones y decimales en espacios equiprobables: sacar un 5 en un dado de 6 caras es 1/6.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-escala-probabilidad-cero-uno',
        label: 'La Escala de Probabilidad entre 0 y 1 (o 0% y 100%)',
        level: 13,
        type: 'basic',
        requires: ['g4-stat-u5-probabilidad-regla-laplace-conteo'],
        description: 'Comprende que P(imposible) = 0, P(seguro) = 1, y todos los sucesos posibles tienen una probabilidad comprendida entre 0 y 1.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-frecuencia-experimental-vs-teorica',
        label: 'Estimación Experimental vs. Probabilidad Teórica',
        level: 14,
        type: 'applied',
        requires: ['g4-stat-regla-laplace-fraccion', 'g4-stat-escala-probabilidad-cero-uno'],
        description: 'Compara: ¿por qué lanzar una moneda 10 veces puede dar 7 caras, pero la probabilidad teórica sigue siendo 1/2 (0.5)?',
        xOffset: -30,
        behavior: 'quiz_list'
    },
    {
        id: 'g4-stat-principio-aditivo-multiplicativo',
        label: 'Principio Aditivo vs. Principio Multiplicativo en Árboles',
        level: 14,
        type: 'advanced',
        requires: ['g4-stat-regla-laplace-fraccion', 'g4-stat-escala-probabilidad-cero-uno'],
        description: '¿Opciones alternativas excluyentes (sumar) o elecciones consecutivas en etapas (multiplicar)? Resuelve problemas de rutas y menús.',
        xOffset: 30,
        behavior: 'quiz_list'
    }
];
