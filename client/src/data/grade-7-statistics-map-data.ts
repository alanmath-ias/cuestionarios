import { ArithmeticNode } from './arithmetic-map-data';

export const grade7StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: AGRUPACIÓN DE DATOS EN INTERVALOS DE CLASE
    // ==========================================
    {
        id: 'g7-stat-u1-datos-agrupados-intervalos',
        label: 'Datos Agrupados en Intervalos de Clase',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Construcción sistemática de tablas para variables continuas y grandes muestras mediante intervalos de clase.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-reglas-agrupacion-amplitud',
        label: 'Rango, Número de Clases (k) y Amplitud (c)',
        level: 1,
        type: 'basic',
        requires: ['g7-stat-u1-datos-agrupados-intervalos'],
        description: 'Cálculo del recorrido R = xₘₐₓ - xₘᵢₙ, determinación del número de intervalos k (regla de Sturges o √n) y cálculo de la amplitud c = R / k.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-limites-reales-marca-clase',
        label: 'Límites, Fronteras y Marca de Clase (xᵢ)',
        level: 1,
        type: 'basic',
        requires: ['g7-stat-u1-datos-agrupados-intervalos'],
        description: 'Límites inferiores y superiores [Lᵢ, Lₛ), límites reales/fronteras y el punto medio representativo: marca de clase xᵢ = (Lᵢ + Lₛ) / 2.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-tabla-completa-intervalos',
        label: 'Construcción de la Tabla de Frecuencias Agrupadas',
        level: 2,
        type: 'applied',
        requires: ['g7-stat-reglas-agrupacion-amplitud', 'g7-stat-limites-reales-marca-clase'],
        description: 'Clasificación de datos en sus respectivos intervalos, conteo de frecuencias absolutas, relativas, porcentuales y acumuladas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: HISTOGRAMAS, POLÍGONOS Y OJIVAS ACUMULADAS
    // ==========================================
    {
        id: 'g7-stat-u2-graficos-continuos-ojivas',
        label: 'Histogramas, Polígonos de Frecuencia y Ojivas',
        level: 3,
        type: 'basic',
        requires: ['g7-stat-tabla-completa-intervalos'],
        description: 'Representación visual de distribuciones agrupadas: el eje horizontal representa la escala continua de los intervalos de clase.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-histograma-intervalos-continuos',
        label: 'Construcción del Histograma de Intervalos',
        level: 4,
        type: 'basic',
        requires: ['g7-stat-u2-graficos-continuos-ojivas'],
        description: 'Dibuja rectángulos contiguos cuyas bases son los intervalos [Lᵢ, Lₛ) y cuyas alturas son proporcionales a las frecuencias absolutas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-ojiva-porcentual-acumulada',
        label: 'La Ojiva Ascendente (Curva de Frecuencias Acumuladas)',
        level: 4,
        type: 'basic',
        requires: ['g7-stat-u2-graficos-continuos-ojivas'],
        description: 'Trazado de la curva acumulativa que une las fronteras superiores con las frecuencias acumuladas (Fᵢ o %Fᵢ).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-estimacion-grafica-percentiles-ojiva',
        label: 'Lectura de Porcentajes y Percentiles desde la Ojiva',
        level: 5,
        type: 'critical',
        requires: ['g7-stat-histograma-intervalos-continuos', 'g7-stat-ojiva-porcentual-acumulada'],
        description: 'Usa la ojiva para estimar rápidamente qué valor acumula el 50% de los datos (mediana gráfica) o el 75%.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TENDENCIA CENTRAL EN DATOS AGRUPADOS
    // ==========================================
    {
        id: 'g7-stat-u3-mtc-datos-agrupados',
        label: 'Tendencia Central en Datos Agrupados',
        level: 6,
        type: 'basic',
        requires: ['g7-stat-estimacion-grafica-percentiles-ojiva'],
        description: 'Cálculo de la media para tablas con intervalos y determinación analítica de los intervalos modal y mediano.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-media-agrupados-marcas-clase',
        label: 'Media para Datos Agrupados: x̄ = ∑(xᵢ·fᵢ) / n',
        level: 7,
        type: 'critical',
        requires: ['g7-stat-u3-mtc-datos-agrupados'],
        description: 'Multiplica la marca de clase de cada intervalo por su frecuencia, suma los productos y divide por el total de observaciones.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-intervalo-modal-y-mediano',
        label: 'Identificación del Intervalo Modal e Intervalo Mediano',
        level: 7,
        type: 'basic',
        requires: ['g7-stat-u3-mtc-datos-agrupados'],
        description: 'Halla el intervalo de mayor frecuencia (clase modal) y el primer intervalo donde la frecuencia acumulada supera n/2 (clase mediana).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-analisis-forma-asimetria-intuitiva',
        label: 'Forma de la Distribución: Simetría y Sesgo Intuitivo',
        level: 8,
        type: 'applied',
        requires: ['g7-stat-media-agrupados-marcas-clase', 'g7-stat-intervalo-modal-y-mediano'],
        description: 'Compara la posición relativa de media, mediana y moda: sesgo a la derecha (cola larga positiva) vs. simetría centrada.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: ÁLGEBRA DE SUCESOS Y DIAGRAMAS DE VENN
    // ==========================================
    {
        id: 'g7-stat-u4-algebra-sucesos-venn',
        label: 'Álgebra de Sucesos y Diagramas de Venn',
        level: 9,
        type: 'basic',
        requires: ['g7-stat-analisis-forma-asimetria-intuitiva'],
        description: 'Operaciones de la teoría de conjuntos aplicadas a la probabilidad: unión, intersección, diferencia y leyes de De Morgan.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-union-interseccion-probabilidad',
        label: 'La Unión (A ∪ B) y la Intersección (A ∩ B)',
        level: 10,
        type: 'basic',
        requires: ['g7-stat-u4-algebra-sucesos-venn'],
        description: 'Identifica la región donde ocurre A o B (unión) y la región donde ocurren ambos simultáneamente (intersección).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-regla-suma-general-compatibles',
        label: 'Regla General de la Suma: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
        level: 10,
        type: 'critical',
        requires: ['g7-stat-u4-algebra-sucesos-venn'],
        description: 'Evita contar dos veces los elementos de la intersección restando P(A ∩ B) al sumar las probabilidades individuales.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-diagramas-venn-tres-conjuntos',
        label: 'Resolución de Problemas de Probabilidad con Venn',
        level: 11,
        type: 'applied',
        requires: ['g7-stat-union-interseccion-probabilidad', 'g7-stat-regla-suma-general-compatibles'],
        description: 'Ubica datos en diagramas de Venn de dos y tres conjuntos empezando desde el centro (intersección triple) hacia afuera.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: ESTRUCTURAS COMBINATORIAS: VARIACIONES Y ORDEN
    // ==========================================
    {
        id: 'g7-stat-u5-estructuras-conteo-variaciones',
        label: 'Estructuras de Conteo: Variaciones y Restricciones',
        level: 12,
        type: 'basic',
        requires: ['g7-stat-diagramas-venn-tres-conjuntos'],
        description: 'Selecciones ordenadas de k elementos tomados de un conjunto total de n elementos (donde el orden sí importa).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-variaciones-sin-repeticion-formula',
        label: 'Variaciones Ordinarias: V(n, k) = n! / (n - k)!',
        level: 13,
        type: 'critical',
        requires: ['g7-stat-u5-estructuras-conteo-variaciones'],
        description: 'Elegir presidente, vicepresidente y secretario de un grupo de 10: el orden define el cargo asignado. V(10, 3) = 10 × 9 × 8 = 720.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-variaciones-con-repeticion-vr',
        label: 'Variaciones con Repetición: VR(n, k) = nᵏ',
        level: 13,
        type: 'basic',
        requires: ['g7-stat-u5-estructuras-conteo-variaciones'],
        description: 'Cuando los elementos pueden repetirse en cada posición: claves de candados de 4 dígitos (10⁴ = 10,000 claves posibles).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-problemas-conteo-con-restricciones',
        label: 'Problemas de Ordenamiento con Restricciones',
        level: 14,
        type: 'applied',
        requires: ['g7-stat-variaciones-sin-repeticion-formula', 'g7-stat-variaciones-con-repeticion-vr'],
        description: 'Calcula cuántos números pares de 3 cifras se pueden formar o arreglos donde dos personas específicas deben quedar juntas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: ANÁLISIS COMPARATIVO Y GRAN CORONA DE 7.°
    // ==========================================
    {
        id: 'g7-stat-u6-analisis-comparativo-maestria',
        label: 'Análisis Comparativo y Gran Corona de 7.°',
        level: 15,
        type: 'basic',
        requires: ['g7-stat-problemas-conteo-con-restricciones'],
        description: 'Integración estadística: comparación rigurosa de dos distribuciones continuas y reto de maestría de séptimo grado.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-comparacion-histogramas-dos-poblaciones',
        label: 'Comparación Simultánea de Dos Histogramas y Ojivas',
        level: 16,
        type: 'basic',
        requires: ['g7-stat-u6-analisis-comparativo-maestria'],
        description: 'Superpone polígonos de frecuencia para comparar el rendimiento de dos turnos de fábrica o estaturas de dos grupos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-aplicacion-conteo-probabilidad-laplace',
        label: 'Cálculo de Probabilidad usando Variaciones y Conteo',
        level: 16,
        type: 'basic',
        requires: ['g7-stat-u6-analisis-comparativo-maestria'],
        description: 'Aplica Laplace calculando los casos posibles y favorables mediante fórmulas combinatorias V(n, k).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-corona-maestria-septimo',
        label: 'Gran Corona de Maestría de Estadística de 7.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g7-stat-comparacion-histogramas-dos-poblaciones', 'g7-stat-aplicacion-conteo-probabilidad-laplace'],
        description: '¡Máximo reto de 7.º! Domina intervalos de clase, histogramas, ojivas, media agrupada, diagramas de Venn y variaciones combinatorias.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
