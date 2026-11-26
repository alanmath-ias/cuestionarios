import { ArithmeticNode } from './arithmetic-map-data';

export const grade6StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: FORMALIZACIÓN DE VARIABLES Y RECOLECCIÓN CIENTÍFICA
    // ==========================================
    {
        id: 'g6-stat-u1-variables-recoleccion-cientifica',
        label: 'Variables Estadísticas y Recolección Científica',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Inicio formal de la secundaria: taxonomía rigurosa de variables, censos vs. muestreo probabilístico e instrumentos de medición.',
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
        label: 'Censos Poblacionales vs. Muestreo Aleatorio',
        level: 1,
        type: 'basic',
        requires: ['g6-stat-u1-variables-recoleccion-cientifica'],
        description: 'Estudio exhaustivo de toda la población (censo) vs. inferencia a partir de una muestra aleatoria representativa.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-diseno-encuesta-evitar-sesgos',
        label: 'Diseño de Instrumentos y Detección de Preguntas Sesgadas',
        level: 2,
        type: 'applied',
        requires: ['g6-stat-taxonomia-variables-estadisticas', 'g6-stat-censo-vs-muestreo-aleatorio'],
        description: 'Aprende a redactar preguntas neutrales y a identificar cómo el sesgo del encuestador puede inducir respuestas falsas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TABULACIÓN FORMAL Y FRECUENCIAS ACUMULADAS
    // ==========================================
    {
        id: 'g6-stat-u2-tabulacion-frecuencias-acumuladas',
        label: 'Tabulación Formal y Frecuencias Acumuladas',
        level: 3,
        type: 'basic',
        requires: ['g6-stat-diseno-encuesta-evitar-sesgos'],
        description: 'Construcción algebraica de tablas estadísticas no agrupadas con cálculo sistemático de frecuencias acumuladas absolutas y relativas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-frecuencia-absoluta-acumulada-f',
        label: 'Frecuencia Absoluta Acumulada (Fᵢ = ∑f)',
        level: 4,
        type: 'basic',
        requires: ['g6-stat-u2-tabulacion-frecuencias-acumuladas'],
        description: 'Cálculo de la suma acumulativa: Fₖ representa el número de observaciones menores o iguales al valor xₖ.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-frecuencia-relativa-acumulada-h',
        label: 'Frecuencia Relativa Acumulada (Hᵢ) y Porcentual (%Fᵢ)',
        level: 4,
        type: 'basic',
        requires: ['g6-stat-u2-tabulacion-frecuencias-acumuladas'],
        description: 'Cálculo de la proporción acumulada Hᵢ = Fᵢ / n y porcentaje acumulado %Fᵢ (el último renglón alcanza siempre 1.0 y 100%).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-resolucion-problemas-frecuencias-acumuladas',
        label: 'Interpretación de Umbrales y Límites con Frecuencias Acumuladas',
        level: 5,
        type: 'critical',
        requires: ['g6-stat-frecuencia-absoluta-acumulada-f', 'g6-stat-frecuencia-relativa-acumulada-h'],
        description: 'Responde preguntas de corte: ¿qué porcentaje obtuvo al menos 3 aciertos? ¿cuántos tuvieron como máximo 7 fallas?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: HISTOGRAMAS BÁSICOS, POLÍGONOS Y GRÁFICOS ENGAÑOSOS
    // ==========================================
    {
        id: 'g6-stat-u3-histogramas-graficos-enganosos',
        label: 'Histogramas, Polígonos y Detección de Gráficos Engañosos',
        level: 6,
        type: 'basic',
        requires: ['g6-stat-resolucion-problemas-frecuencias-acumuladas'],
        description: 'Visualización estadística formal para datos discretos y cuantitativos continuos, y pensamiento crítico ante gráficas manipuladas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-histogramas-vs-barras-diferencia',
        label: 'El Histograma: Barras Continuas Pegadas',
        level: 7,
        type: 'basic',
        requires: ['g6-stat-u3-histogramas-graficos-enganosos'],
        description: 'Distingue entre barras separadas (variables cualitativas/discretas) e histogramas con barras yuxtapuestas contiguas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-poligono-de-frecuencias',
        label: 'Construcción del Polígono de Frecuencias',
        level: 7,
        type: 'basic',
        requires: ['g6-stat-u3-histogramas-graficos-enganosos'],
        description: 'Unión de los puntos medios de las partes superiores de las barras para trazar la silueta geométrica de la distribución.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-deteccion-graficos-enganosos',
        label: 'Lectura Crítica: Detección de Gráficos Engañosos en Medios',
        level: 8,
        type: 'critical',
        requires: ['g6-stat-histogramas-vs-barras-diferencia', 'g6-stat-poligono-de-frecuencias'],
        description: 'Identifica trucos visuales en prensa y publicidad: ejes verticales truncados que exageran diferencias o escalas distorsionadas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: TENDENCIA CENTRAL Y MEDIA PONDERADA
    // ==========================================
    {
        id: 'g6-stat-u4-tendencia-central-ponderada',
        label: 'Tendencia Central Avanzada y Media Ponderada',
        level: 9,
        type: 'basic',
        requires: ['g6-stat-deteccion-graficos-enganosos'],
        description: 'Deducción y cálculo riguroso de MTC a partir de tablas no agrupadas y resolución de problemas con media ponderada.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-media-desde-tabla-frecuencias',
        label: 'Cálculo de la Media desde Tablas: x̄ = ∑(xᵢ·fᵢ) / n',
        level: 10,
        type: 'critical',
        requires: ['g6-stat-u4-tendencia-central-ponderada'],
        description: 'Agiliza el cálculo multiplicando cada valor por su frecuencia absoluta antes de sumar, evitando escribir todos los datos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-media-ponderada-pesos-creditos',
        label: 'La Media Ponderada: Calificaciones y Pesos Porcentuales',
        level: 10,
        type: 'basic',
        requires: ['g6-stat-u4-tendencia-central-ponderada'],
        description: 'Cuando los exámenes tienen distinto peso (el examen final vale 40% y las tareas 20%): x̄_p = ∑(wᵢ·xᵢ) / ∑wᵢ.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-problemas-inversos-de-promedios',
        label: 'Problemas Inversos: ¿Qué Nota Necesito para Aprobar?',
        level: 11,
        type: 'applied',
        requires: ['g6-stat-media-desde-tabla-frecuencias', 'g6-stat-media-ponderada-pesos-creditos'],
        description: 'Plantea y despeja ecuaciones a partir del promedio deseado: conoce tres notas y halla la cuarta nota necesaria.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: SUCESOS COMPUESTOS Y PROBABILIDAD DEL COMPLEMENTO
    // ==========================================
    {
        id: 'g6-stat-u5-sucesos-compuestos-complemento',
        label: 'Sucesos Compuestos y Probabilidad del Complemento',
        level: 12,
        type: 'basic',
        requires: ['g6-stat-problemas-inversos-de-promedios'],
        description: 'Formalización del espacio muestral (S), sucesos elementales, compuestos y el teorema fundamental del suceso contrario.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-suceso-complementario-formula',
        label: 'El Suceso Complementario: P(Aᶜ) = 1 - P(A)',
        level: 13,
        type: 'critical',
        requires: ['g6-stat-u5-sucesos-compuestos-complemento'],
        description: 'La poderosa regla del complemento: calcular la probabilidad de que "no ocurra A" restando de 1 la probabilidad de que ocurra.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-sucesos-compatibles-incompatibles',
        label: 'Sucesos Compatibles e Incompatibles (Mutuamente Excluyentes)',
        level: 13,
        type: 'basic',
        requires: ['g6-stat-u5-sucesos-compuestos-complemento'],
        description: '¿Pueden ocurrir al mismo tiempo? Al tirar un dado: sacar par y sacar impar son incompatibles; sacar par y sacar primo son compatibles (el 2).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-regla-suma-sucesos-incompatibles',
        label: 'Regla de la Suma para Sucesos Incompatibles',
        level: 14,
        type: 'applied',
        requires: ['g6-stat-suceso-complementario-formula', 'g6-stat-sucesos-compatibles-incompatibles'],
        description: 'Aplica P(A ∪ B) = P(A) + P(B) cuando la intersección es vacía (A ∩ B = ∅) en dados, barajas y urnas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: FACTORIAL Y PERMUTACIONES SIMPLES (GRAN CORONA DE 6.°)
    // ==========================================
    {
        id: 'g6-stat-u6-factorial-permutaciones-maestria',
        label: 'El Factorial (n!), Permutaciones y Gran Corona de 6.°',
        level: 15,
        type: 'basic',
        requires: ['g6-stat-regla-suma-sucesos-incompatibles'],
        description: 'Introducción al simbolismo combinatorio formal: el operador factorial y los ordenamientos completos sin repetición.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g6-stat-concepto-operador-factorial',
        label: 'El Factorial de un Número Natural (n!)',
        level: 16,
        type: 'critical',
        requires: ['g6-stat-u6-factorial-permutaciones-maestria'],
        description: 'Definición n! = n × (n-1) × ... × 1, convención 0! = 1, simplificación de fracciones con factoriales (7! / 5! = 7 × 6 = 42).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-permutaciones-simples-formula',
        label: 'Permutaciones Simples: Pₙ = n!',
        level: 16,
        type: 'basic',
        requires: ['g6-stat-u6-factorial-permutaciones-maestria'],
        description: 'Cálculo de todos los arreglos posibles de n objetos distintos en fila: anagramas de palabras sin letras repetidas y ordenamientos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g6-stat-corona-maestria-sexto',
        label: 'Gran Corona de Maestría de Estadística de 6.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g6-stat-concepto-operador-factorial', 'g6-stat-permutaciones-simples-formula'],
        description: '¡Máximo galardón de 6.º de secundaria! Domina variables, tablas acumuladas, histogramas, media ponderada, probabilidad del complemento y factoriales.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
