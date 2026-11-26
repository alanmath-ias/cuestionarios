import { ArithmeticNode } from './arithmetic-map-data';

export const grade8StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: MEDIDAS DE DISPERSIÓN I: VARIANZA Y DESVIACIÓN ESTÁNDAR
    // ==========================================
    {
        id: 'g8-stat-u1-dispersion-varianza-desviacion',
        label: 'Medidas de Dispersión: Varianza y Desviación Estándar',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Cuantificación matemática de la dispersión de los datos alrededor de la media: varianza muestral (s²) y desviación estándar (s).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-desviaciones-respecto-media-suma-cero',
        label: 'Desviaciones Respecto a la Media: dᵢ = (xᵢ - x̄)',
        level: 1,
        type: 'basic',
        requires: ['g8-stat-u1-dispersion-varianza-desviacion'],
        description: 'Demuestra algebraicamente por qué la suma de las desviaciones simples siempre es cero (∑(xᵢ - x̄) = 0) y por qué se elevan al cuadrado.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-calculo-varianza-muestral-s2',
        label: 'La Varianza Muestral: s² = ∑(xᵢ - x̄)² / (n - 1)',
        level: 1,
        type: 'critical',
        requires: ['g8-stat-u1-dispersion-varianza-desviacion'],
        description: 'Cálculo paso a paso de la suma de cuadrados de las diferencias y división por los grados de libertad (n - 1) para corregir el sesgo.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-desviacion-estandar-interpretacion',
        label: 'La Desviación Estándar (s = √s²) y sus Unidades',
        level: 2,
        type: 'applied',
        requires: ['g8-stat-desviaciones-respecto-media-suma-cero', 'g8-stat-calculo-varianza-muestral-s2'],
        description: 'Raíz cuadrada de la varianza: recupera las unidades originales de la variable (metros, kilogramos o puntos) para interpretar la dispersión.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: MEDIDAS DE POSICIÓN: CUARTILES Y RANGO INTERCUARTÍLICO
    // ==========================================
    {
        id: 'g8-stat-u2-medidas-posicion-cuartiles',
        label: 'Medidas de Posición: Cuartiles y Rango Intercuartílico',
        level: 3,
        type: 'basic',
        requires: ['g8-stat-desviacion-estandar-interpretacion'],
        description: 'División de la distribución ordenada en cuatro partes iguales (25% cada una): Q₁, Q₂ (mediana) y Q₃, y el rango intercuartílico (IQR).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-calculo-primer-tercer-cuartil',
        label: 'Cálculo de Cuartiles: Q₁ (25%) y Q₃ (75%)',
        level: 4,
        type: 'basic',
        requires: ['g8-stat-u2-medidas-posicion-cuartiles'],
        description: 'Determina las posiciones exactas de Q₁ (el dato que deja el 25% por debajo) y Q₃ (el dato que deja el 75% por debajo).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-rango-intercuartilico-iqr',
        label: 'El Rango Intercuartílico: IQR = Q₃ - Q₁',
        level: 4,
        type: 'critical',
        requires: ['g8-stat-u2-medidas-posicion-cuartiles'],
        description: 'Medida robusta de dispersión que abarca el 50% central de la población, completamente inmune a la influencia de valores atípicos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-interpretacion-dispersion-iqr-desviacion',
        label: 'Comparación: Desviación Estándar vs. Rango Intercuartílico',
        level: 5,
        type: 'applied',
        requires: ['g8-stat-calculo-primer-tercer-cuartil', 'g8-stat-rango-intercuartilico-iqr'],
        description: 'Evalúa cuándo usar s (distribuciones simétricas sin outliers) y cuándo usar IQR (distribuciones sesgadas o con datos extremos).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: COMBINATORIA I: PERMUTACIONES CON REPETICIÓN Y CIRCULARES
    // ==========================================
    {
        id: 'g8-stat-u3-permutaciones-avanzadas',
        label: 'Combinatoria: Permutaciones con Repetición y Circulares',
        level: 6,
        type: 'basic',
        requires: ['g8-stat-interpretacion-dispersion-iqr-desviacion'],
        description: 'Técnicas combinatorias cuando hay elementos idénticos repetidos en la colección o cuando el orden se dispone en ciclo cerrado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-permutaciones-con-repeticion-pr',
        label: 'Permutaciones con Repetición: PR(n; a, b, c) = n! / (a!·b!·c!)',
        level: 7,
        type: 'critical',
        requires: ['g8-stat-u3-permutaciones-avanzadas'],
        description: 'Anagramas con letras repetidas (ejemplo: MATEMATICAS o MISSISSIPPI) y caminos sobre una cuadrícula paso a paso.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-permutaciones-circulares-pc',
        label: 'Permutaciones Circulares: PC(n) = (n - 1)!',
        level: 7,
        type: 'basic',
        requires: ['g8-stat-u3-permutaciones-avanzadas'],
        description: 'Disposición de personas alrededor de una mesa redonda o cuentas en un collar: fijar una referencia inicial para eliminar rotaciones equivalentes.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-problemas-ordenamientos-complejos',
        label: 'Problemas de Ordenamiento con Bloques y Separaciones',
        level: 8,
        type: 'applied',
        requires: ['g8-stat-permutaciones-con-repeticion-pr', 'g8-stat-permutaciones-circulares-pc'],
        description: 'Arreglos donde ciertos elementos deben permanecer siempre juntos (método del bloque único) o nunca juntos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: COMBINATORIA II: COMBINACIONES SIN REPETICIÓN
    // ==========================================
    {
        id: 'g8-stat-u4-combinaciones-sin-repeticion',
        label: 'Combinatoria: Combinaciones sin Repetición',
        level: 9,
        type: 'basic',
        requires: ['g8-stat-problemas-ordenamientos-complejos'],
        description: 'Selección de subconjuntos de k elementos a partir de n disponibles donde el orden NO tiene importancia.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-combinaciones-formula-binomial',
        label: 'Fórmula de Combinaciones: C(n, k) = n! / [k! · (n - k)!]',
        level: 10,
        type: 'critical',
        requires: ['g8-stat-u4-combinaciones-sin-repeticion'],
        description: 'Deducción: se divide V(n, k) entre k! para eliminar el orden de los elementos seleccionados. Formación de comités de trabajo.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-diferencia-permutacion-variacion-combinacion',
        label: 'El Árbol de Decisión: Permutación, Variación o Combinación',
        level: 10,
        type: 'critical',
        requires: ['g8-stat-u4-combinaciones-sin-repeticion'],
        description: 'Aplica rigurosamente las 3 preguntas: 1) ¿Importa el orden? 2) ¿Entran todos los elementos? 3) ¿Se repiten elementos?',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-problemas-seleccion-equipos-comites',
        label: 'Problemas de Selección con Subgrupos Condicionados',
        level: 11,
        type: 'applied',
        requires: ['g8-stat-combinaciones-formula-binomial', 'g8-stat-diferencia-permutacion-variacion-combinacion'],
        description: 'Seleccionar un comité de 5 personas que tenga exactamente 3 mujeres y 2 hombres multiplicando combinaciones C(7, 3) × C(6, 2).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PROBABILIDAD EN EXPERIMENTOS COMPUESTOS Y REEMPLAZO
    // ==========================================
    {
        id: 'g8-stat-u5-probabilidad-experimentos-compuestos',
        label: 'Probabilidad en Experimentos Compuestos y Reemplazo',
        level: 12,
        type: 'basic',
        requires: ['g8-stat-problemas-seleccion-equipos-comites'],
        description: 'Extracción sucesiva de elementos: efecto drástico de reponer el objeto en la urna (con reemplazo) vs. no reponerlo (sin reemplazo).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-extraccion-con-y-sin-reemplazo',
        label: 'Extracciones Con Reemplazo vs. Sin Reemplazo',
        level: 13,
        type: 'critical',
        requires: ['g8-stat-u5-probabilidad-experimentos-compuestos'],
        description: 'Con reemplazo el espacio muestral se mantiene constante (independiente). Sin reemplazo el total disminuye en 1 para la siguiente extracción.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-arboles-probabilidad-ponderados',
        label: 'Diagramas de Árbol Ponderados con Fracciones',
        level: 13,
        type: 'basic',
        requires: ['g8-stat-u5-probabilidad-experimentos-compuestos'],
        description: 'Asigna probabilidades a cada rama del árbol y multiplica a lo largo de un camino para hallar la probabilidad de una secuencia.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-calculo-probabilidades-con-combinatoria',
        label: 'Cálculo de Probabilidades Hipergeométricas Básicas',
        level: 14,
        type: 'applied',
        requires: ['g8-stat-extraccion-con-y-sin-reemplazo', 'g8-stat-arboles-probabilidad-ponderados'],
        description: 'Aplica Laplace con combinaciones: probabilidad de sacar 2 ases al repartir 5 cartas de una baraja de 52 cartas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: SÍNTESIS COMBINATORIO-ESTADÍSTICA Y GRAN CORONA DE 8.°
    // ==========================================
    {
        id: 'g8-stat-u6-sintesis-maestria-octavo',
        label: 'Síntesis Combinatorio-Estadística y Gran Corona de 8.°',
        level: 15,
        type: 'basic',
        requires: ['g8-stat-calculo-probabilidades-con-combinatoria'],
        description: 'Integración superior: análisis de variabilidad, selección combinatoria óptima y reto de maestría de octavo grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g8-stat-comparacion-dispersiones-grupos',
        label: 'Comparación Formal de la Homogeneidad entre Dos Grupos',
        level: 16,
        type: 'basic',
        requires: ['g8-stat-u6-sintesis-maestria-octavo'],
        description: 'Determina cuál grupo es más consistente mediante el contraste simultáneo de varianzas, desviaciones estándar e IQRs.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-desafios-probabilisticos-avanzados',
        label: 'Desafíos Probabilísticos de Selección Múltiple',
        level: 16,
        type: 'basic',
        requires: ['g8-stat-u6-sintesis-maestria-octavo'],
        description: 'Resuelve problemas complejos de loterías, claves de seguridad y probabilidades en juegos de mesa con combinatoria.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g8-stat-corona-maestria-octavo',
        label: 'Gran Corona de Maestría de Estadística de 8.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g8-stat-comparacion-dispersiones-grupos', 'g8-stat-desafios-probabilisticos-avanzados'],
        description: '¡Máximo galardón de 8.º! Domina varianza, desviación estándar, cuartiles, IQR, permutaciones avanzadas, combinaciones y probabilidad con árboles ponderados.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
