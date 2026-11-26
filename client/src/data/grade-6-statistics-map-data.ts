import { ArithmeticNode } from './arithmetic-map-data';

export const grade6StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: VARIABLES, MUESTREO Y TABULACIÓN ACUMULADA
    // ==========================================
    {
        id: 'g6-stat-u1-variables-recoleccion-cientifica',
        label: 'Variables, Muestreo y Tabulación Acumulada',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Inicio formal de la secundaria: taxonomía rigurosa de variables, censos vs. muestreo probabilístico y frecuencias acumuladas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-taxonomia-variables-estadisticas',
        label: 'Variables Cualitativas (Nominal/Ordinal) y Cuantitativas',
        level: 1,
        type: 'basic',
        requires: ['g6-stat-u1-variables-recoleccion-cientifica'],
        description: 'Diferenciación exacta: cualitativa nominal (sin jerarquía), cualitativa ordinal (con rango/orden), cuantitativa discreta y continua.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-censo-vs-muestreo-aleatorio',
        label: 'Censos Poblacionales vs. Muestreo Aleatorio y Sesgos',
        level: 1,
        type: 'basic',
        requires: ['g6-stat-u1-variables-recoleccion-cientifica'],
        description: 'Estudio exhaustivo de toda la población (censo) vs. inferencia por muestra aleatoria, y diseño de preguntas neutrales sin sesgos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-frecuencia-acumulada-f-h',
        label: 'Frecuencias Acumuladas (Fᵢ, Hᵢ) y Preguntas de Umbral',
        level: 2,
        type: 'applied',
        requires: ['g6-stat-taxonomia-variables-estadisticas', 'g6-stat-censo-vs-muestreo-aleatorio'],
        description: 'Cálculo de la suma acumulativa: Fₖ y Hₖ para responder preguntas de corte (¿qué porcentaje obtuvo al menos 3 aciertos?).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: HISTOGRAMAS, POLÍGONOS Y GRÁFICOS ENGAÑOSOS
    // ==========================================
    {
        id: 'g6-stat-u2-histogramas-graficos-enganosos',
        label: 'Histogramas, Polígonos y Gráficos Engañosos',
        level: 3,
        type: 'basic',
        requires: ['g6-stat-frecuencia-acumulada-f-h'],
        description: 'Visualización estadística formal para datos continuos y pensamiento crítico ante gráficas manipuladas en medios.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-histogramas-vs-barras-diferencia',
        label: 'El Histograma: Barras Continuas Pegadas vs. Separadas',
        level: 4,
        type: 'basic',
        requires: ['g6-stat-u2-histogramas-graficos-enganosos'],
        description: 'Distingue entre barras separadas (variables cualitativas/discretas) e histogramas con barras yuxtapuestas contiguas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-poligono-de-frecuencias',
        label: 'Construcción del Polígono de Frecuencias y Silueta de Datos',
        level: 4,
        type: 'basic',
        requires: ['g6-stat-u2-histogramas-graficos-enganosos'],
        description: 'Unión de los puntos medios superiores de las barras para trazar la silueta geométrica de la distribución de frecuencias.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-deteccion-graficos-enganosos',
        label: 'Lectura Crítica: Detección de Gráficos Engañosos en Prensa',
        level: 5,
        type: 'applied',
        requires: ['g6-stat-histogramas-vs-barras-diferencia', 'g6-stat-poligono-de-frecuencias'],
        description: 'Identifica trucos visuales en prensa y publicidad: ejes verticales truncados que exageran diferencias y escalas distorsionadas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TENDENCIA CENTRAL AVANZADA Y MEDIA PONDERADA
    // ==========================================
    {
        id: 'g6-stat-u3-tendencia-central-ponderada',
        label: 'Tendencia Central Avanzada y Media Ponderada',
        level: 6,
        type: 'basic',
        requires: ['g6-stat-deteccion-graficos-enganosos'],
        description: 'Cálculo algebraico riguroso de MTC a partir de tablas no agrupadas y resolución de problemas con media ponderada.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-media-desde-tabla-frecuencias',
        label: 'Cálculo de la Media desde Tablas: x̄ = ∑(xᵢ·fᵢ) / n',
        level: 7,
        type: 'basic',
        requires: ['g6-stat-u3-tendencia-central-ponderada'],
        description: 'Agiliza el cálculo multiplicando cada valor por su frecuencia absoluta antes de sumar, evitando escribir todos los datos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-mediana-moda-tablas-no-agrupadas',
        label: 'Mediana y Moda a partir de Tablas de Frecuencia',
        level: 7,
        type: 'basic',
        requires: ['g6-stat-u3-tendencia-central-ponderada'],
        description: 'Determina la posición central n/2 en la columna de frecuencias acumuladas para hallar la mediana, y ubica la frecuencia máxima para la moda.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-media-ponderada-pesos-creditos',
        label: 'La Media Ponderada: Calificaciones y Pesos Porcentuales',
        level: 8,
        type: 'applied',
        requires: ['g6-stat-media-desde-tabla-frecuencias', 'g6-stat-mediana-moda-tablas-no-agrupadas'],
        description: 'Cuando las evaluaciones tienen distinto peso (examen final 40%, talleres 20%): x̄_p = ∑(wᵢ·xᵢ) / ∑wᵢ.',
        xOffset: -35,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-problemas-inversos-de-promedios',
        label: 'Problemas Inversos: Despejar la Nota Necesaria para Aprobar',
        level: 8,
        type: 'applied',
        requires: ['g6-stat-media-desde-tabla-frecuencias', 'g6-stat-mediana-moda-tablas-no-agrupadas'],
        description: 'Plantea y despeja ecuaciones a partir del promedio deseado: conoce tres notas y calcula la cuarta nota mínima para aprobar.',
        xOffset: 35,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: FUNDAMENTOS DE PROBABILIDAD Y SUCESOS COMPUESTOS
    // ==========================================
    {
        id: 'g6-stat-u4-sucesos-compuestos-complemento',
        label: 'Fundamentos de Probabilidad y Sucesos Compuestos',
        level: 9,
        type: 'basic',
        requires: ['g6-stat-media-ponderada-pesos-creditos', 'g6-stat-problemas-inversos-de-promedios'],
        description: 'Formalización del espacio muestral (S), sucesos elementales, compuestos y el teorema del suceso complementario.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-espacio-muestral-laplace-formal',
        label: 'Experimentos Aleatorios, Espacio Muestral Formal y Laplace',
        level: 10,
        type: 'basic',
        requires: ['g6-stat-u4-sucesos-compuestos-complemento'],
        description: 'Diferencia experimentos deterministas de aleatorios, define el espacio muestral S y aplica la regla de Laplace con rigor formal.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-suceso-complementario-formula',
        label: 'El Suceso Complementario: P(Aᶜ) = 1 - P(A)',
        level: 10,
        type: 'basic',
        requires: ['g6-stat-u4-sucesos-compuestos-complemento'],
        description: 'La poderosa regla del complemento: calcular la probabilidad de "al menos uno" restando de 1 la probabilidad de "ninguno".',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-sucesos-compatibles-incompatibles',
        label: 'Sucesos Compatibles, Incompatibles y Regla de la Suma',
        level: 11,
        type: 'applied',
        requires: ['g6-stat-espacio-muestral-laplace-formal', 'g6-stat-suceso-complementario-formula'],
        description: '¿Pueden ocurrir a la vez? Aplica P(A ∪ B) = P(A) + P(B) cuando la intersección es vacía (sucesos mutuamente excluyentes).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: EL FACTORIAL (n!) Y TÉCNICAS FORMALES DE CONTEO
    // ==========================================
    {
        id: 'g6-stat-u5-factorial-permutaciones-conteo',
        label: 'El Factorial (n!) y Técnicas Formales de Conteo',
        level: 12,
        type: 'advanced',
        requires: ['g6-stat-sucesos-compatibles-incompatibles'],
        description: 'Introducción al simbolismo combinatorio formal: principios por etapas, el operador factorial y ordenamientos lineales.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-principios-conteo-por-etapas',
        label: 'Principios Aditivo y Multiplicativo en Problemas por Etapas',
        level: 13,
        type: 'basic',
        requires: ['g6-stat-u5-factorial-permutaciones-conteo'],
        description: 'Formalización de diagramas de árbol y tablas cruzadas para resolver problemas combinatorios estructurados en múltiples fases.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-concepto-operador-factorial',
        label: 'El Operador Factorial (n!) y Simplificación de Expresiones',
        level: 13,
        type: 'basic',
        requires: ['g6-stat-u5-factorial-permutaciones-conteo'],
        description: 'Definición n! = n × (n-1) × ... × 1, convención 0! = 1, y simplificación algebraica de cocientes como 8! / 6! = 8 × 7 = 56.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-permutaciones-simples-formula',
        label: 'Permutaciones Simples: Pₙ = n! (Arreglos y Anagramas)',
        level: 14,
        type: 'advanced',
        requires: ['g6-stat-principios-conteo-por-etapas', 'g6-stat-concepto-operador-factorial'],
        description: 'Cálculo de todos los arreglos posibles de n objetos distintos en fila: anagramas de palabras sin letras repetidas y ordenamientos de personas.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
