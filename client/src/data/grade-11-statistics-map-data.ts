import { ArithmeticNode } from './arithmetic-map-data';

export const grade11StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: LA DISTRIBUCIÓN NORMAL Y PUNTUACIONES Z
    // ==========================================
    {
        id: 'g11-stat-u1-distribucion-normal-z',
        label: 'La Distribución Normal y Puntuaciones Z',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'La reina de las distribuciones: propiedades de la campana de Gauss, regla empírica 68-95-99.7 y tipificación estandarizada con Z.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-campana-gauss-regla-empirica',
        label: 'Propiedades de la Curva Normal y Regla 68-95-99.7',
        level: 1,
        type: 'basic',
        requires: ['g11-stat-u1-distribucion-normal-z'],
        description: 'Simetría perfecta alrededor de μ: el 68.3% de los datos cae en [μ±σ], el 95.4% en [μ±2σ] y el 99.7% en [μ±3σ]. Puntos de inflexión en μ±σ.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-tipificacion-puntuaciones-z',
        label: 'Estandarización y Puntuaciones Z: Z = (X - μ) / σ',
        level: 1,
        type: 'critical',
        requires: ['g11-stat-u1-distribucion-normal-z'],
        description: 'Transformación a la normal estándar N(0, 1): Z indica a cuántas desviaciones estándar por encima o por debajo de la media se ubica un dato.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-lectura-tablas-normal-calculo-areas',
        label: 'Uso de Tablas de la Normal Estándar y Cálculo de Probabilidades',
        level: 2,
        type: 'applied',
        requires: ['g11-stat-campana-gauss-regla-empirica', 'g11-stat-tipificacion-puntuaciones-z'],
        description: 'Calcula P(X < a), P(X > b) y P(a ≤ X ≤ b) mediante la tabla Z acumulada de cola izquierda y resolución de problemas inversos (hallar X dado un percentil).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: ANÁLISIS BIVARIADO Y CORRELACIÓN DE PEARSON
    // ==========================================
    {
        id: 'g11-stat-u2-analisis-bivariado-correlacion',
        label: 'Análisis Bivariado y Correlación de Pearson',
        level: 3,
        type: 'basic',
        requires: ['g11-stat-lectura-tablas-normal-calculo-areas'],
        description: 'Estudio de la relación conjunta entre dos variables cuantitativas: diagramas de dispersión y fuerza de asociación lineal.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-diagramas-dispersion-nube-puntos',
        label: 'Diagramas de Dispersión y Tipo de Asociación',
        level: 4,
        type: 'basic',
        requires: ['g11-stat-u2-analisis-bivariado-correlacion'],
        description: 'Gráfico bidimensional en el plano cartesiano: identifica visualmente asociaciones lineales positivas, negativas, nulas o relaciones no lineales (curvas).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-coeficiente-correlacion-pearson-r',
        label: 'Coeficiente de Correlación Lineal de Pearson (r)',
        level: 4,
        type: 'critical',
        requires: ['g11-stat-u2-analisis-bivariado-correlacion'],
        description: 'Propiedades del índice r: -1 ≤ r ≤ +1. Interpretación de correlación perfecta (±1), fuerte (|r| > 0.8), moderada, débil y nula (r ≈ 0).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-correlacion-no-implica-causalidad',
        label: 'Principio Fundamental: Correlación NO Implica Causalidad',
        level: 5,
        type: 'critical',
        requires: ['g11-stat-diagramas-dispersion-nube-puntos', 'g11-stat-coeficiente-correlacion-pearson-r'],
        description: 'Pensamiento crítico científico: variables confusoras (lurking variables) y correlaciones espurias (dos variables que suben juntas por una tercera causa común).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: REGRESIÓN LINEAL SIMPLE Y PREDICCIÓN
    // ==========================================
    {
        id: 'g11-stat-u3-regresion-lineal-prediccion',
        label: 'Regresión Lineal Simple y Predicción',
        level: 6,
        type: 'basic',
        requires: ['g11-stat-correlacion-no-implica-causalidad'],
        description: 'Modelación predictiva mediante la recta de mínimos cuadrados ordinarios: ajuste óptimo, pendiente marginal y bondad de ajuste.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-recta-minimos-cuadrados-ajuste',
        label: 'La Recta de Regresión: ŷ = mx + b (o ŷ = β₀ + β₁x)',
        level: 7,
        type: 'basic',
        requires: ['g11-stat-u3-regresion-lineal-prediccion'],
        description: 'Criterio de mínimos cuadrados: minimiza la suma de los errores residuales al cuadrado ∑(yᵢ - ŷᵢ)². Interpretación física de la pendiente m.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-coeficiente-determinacion-r2',
        label: 'Coeficiente de Determinación (R² = r²)',
        level: 7,
        type: 'critical',
        requires: ['g11-stat-u3-regresion-lineal-prediccion'],
        description: 'Porcentaje de la variabilidad de la variable respuesta Y que queda explicada por el modelo lineal de X (ejemplo: R² = 0.84 es el 84% de variabilidad explicada).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-predicciones-interpolacion-extrapolacion',
        label: 'Predicciones: Interpolación Confiable vs. Peligro de Extrapolación',
        level: 8,
        type: 'applied',
        requires: ['g11-stat-recta-minimos-cuadrados-ajuste', 'g11-stat-coeficiente-determinacion-r2'],
        description: 'Usa el modelo para predecir dentro del rango observado de datos (interpolación) y reconoce por qué predecir fuera del rango (extrapolación) puede ser absurdo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: TEORÍA DEL MUESTREO Y SESGOS DE INVESTIGACIÓN
    // ==========================================
    {
        id: 'g11-stat-u4-muestreo-sesgos-representatividad',
        label: 'Teoría del Muestreo y Sesgos de Investigación',
        level: 9,
        type: 'basic',
        requires: ['g11-stat-predicciones-interpolacion-extrapolacion'],
        description: 'Fundamentos del diseño muestral probabilístico: parámetros vs. estadísticos, técnicas de selección y control de sesgos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-parametros-poblacion-vs-estadisticos',
        label: 'Parámetros Poblacionales (μ, σ, p) vs. Estadísticos (x̄, s, p̂)',
        level: 10,
        type: 'basic',
        requires: ['g11-stat-u4-muestreo-sesgos-representatividad'],
        description: 'Distingue entre los valores fijos y desconocidos de la población entera y los estimadores calculados a partir de los datos de la muestra.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-tecnicas-muestreo-probabilistico',
        label: 'Muestreo Aleatorio Simple, Sistemático, Estratificado y Conglomerados',
        level: 10,
        type: 'critical',
        requires: ['g11-stat-u4-muestreo-sesgos-representatividad'],
        description: 'Criterios de aplicación: MAS (todos con igual probabilidad), Sistemático (cada k-ésimo elemento), Estratificado (por grupos homogéneos) y Conglomerados (por áreas).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-sesgos-muestreo-representatividad',
        label: 'Sesgos de Muestreo: Selección, No Respuesta y Voluntarios',
        level: 11,
        type: 'applied',
        requires: ['g11-stat-parametros-poblacion-vs-estadisticos', 'g11-stat-tecnicas-muestreo-probabilistico'],
        description: 'Analiza por qué encuestas telefónicas o de internet suelen fallar estrepitosamente: sesgo del superviviente, auto-selección y falta de representatividad.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: INTERVALOS DE CONFIANZA Y CONTRASTE DE HIPÓTESIS
    // ==========================================
    {
        id: 'g11-stat-u5-intervalos-confianza-hipotesis',
        label: 'Intervalos de Confianza y Contraste de Hipótesis',
        level: 12,
        type: 'basic',
        requires: ['g11-stat-sesgos-muestreo-representatividad'],
        description: 'El corazón de la inferencia estadística: cuantificar la incertidumbre mediante márgenes de error, niveles de confianza y prueba de hipótesis.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-distribucion-muestral-error-estandar',
        label: 'Distribución Muestral y Error Estándar: SE = σ / √n',
        level: 13,
        type: 'critical',
        requires: ['g11-stat-u5-intervalos-confianza-hipotesis'],
        description: 'Comprende que al aumentar el tamaño de muestra n, la variabilidad de las medias muestrales se reduce drásticamente por el factor 1/√n.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-intervalo-confianza-margen-error',
        label: 'Intervalos de Confianza (IC) y Margen de Error: x̄ ± z*·(σ/√n)',
        level: 13,
        type: 'critical',
        requires: ['g11-stat-u5-intervalos-confianza-hipotesis'],
        description: 'Construcción e interpretación: un IC del 95% (z* = 1.96) significa que el 95% de los intervalos construidos con muestras aleatorias capturarán el verdadero parámetro μ.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-contraste-hipotesis-errores-tipo-i-ii',
        label: 'Contraste de Hipótesis Conceptual: H₀ vs. H₁ y Errores Tipo I y II',
        level: 14,
        type: 'applied',
        requires: ['g11-stat-distribucion-muestral-error-estandar', 'g11-stat-intervalo-confianza-margen-error'],
        description: 'Formulación de hipótesis, zona de rechazo, y análisis del Error Tipo I (falsa alarma: rechazar H₀ verdadera) vs. Error Tipo II (falsa calma: no rechazar H₀ falsa).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: PROYECTO CIENTÍFICO Y CORONA SUPREMA DE 11.° (SABER 11)
    // ==========================================
    {
        id: 'g11-stat-u6-proyecto-inferencial-maestria-media',
        label: 'Proyecto Inferencial y Gran Corona Suprema de 11.°',
        level: 15,
        type: 'basic',
        requires: ['g11-stat-contraste-hipotesis-errores-tipo-i-ii'],
        description: 'Máximo reto integrador de la Educación Media: investigación estadística completa, lectura crítica de información en medios y examen Saber 11.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g11-stat-lectura-critica-noticias-encuestas',
        label: 'Lectura Crítica de Medios, Encuestas Electorales e Infografías',
        level: 16,
        type: 'basic',
        requires: ['g11-stat-u6-proyecto-inferencial-maestria-media'],
        description: 'Auditoría ciudadana: analiza fichas técnicas de encuestas presidenciales (margen de error ±3%, nivel de confianza 95%, tamaño n=1200) y detecta conclusiones falsas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-proyecto-estadistico-completo',
        label: 'El Proyecto Estadístico Completo: Del Problema a la Conclusión',
        level: 16,
        type: 'basic',
        requires: ['g11-stat-u6-proyecto-inferencial-maestria-media'],
        description: 'Plantea pregunta, diseña muestra, recolecta datos, calcula estadísticos descriptivos, ajusta regresión e infiere conclusiones éticas con margen de error.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g11-stat-corona-maestria-once',
        label: 'Gran Corona Suprema de Maestría de Probabilidad y Estadística de 11.° Grado • Cima Escolar',
        level: 17,
        type: 'evaluation',
        requires: ['g11-stat-lectura-critica-noticias-encuestas', 'g11-stat-proyecto-estadistico-completo'],
        description: '¡Máximo galardón del pensamiento aleatorio y la inferencia escolar! Domina la distribución normal, correlación de Pearson, regresión lineal, muestreo probabilístico, intervalos de confianza y pensamiento crítico de Saber 11.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
