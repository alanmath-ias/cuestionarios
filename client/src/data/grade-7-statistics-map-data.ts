import { ArithmeticNode } from './arithmetic-map-data';

export const grade7StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: DATOS AGRUPADOS EN INTERVALOS DE CLASE
    // ==========================================
    {
        id: 'g7-stat-u1-datos-agrupados-intervalos',
        label: 'Datos Agrupados en Intervalos de Clase',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Construcción sistemática de tablas para variables continuas y muestras numerosas mediante intervalos de clase.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-reglas-agrupacion-amplitud',
        label: 'Rango (R), Número de Clases (k) y Amplitud (c)',
        level: 1,
        type: 'basic',
        requires: ['g7-stat-u1-datos-agrupados-intervalos'],
        description: 'Cálculo del recorrido R = x_máx - x_mín, determinación del número de intervalos k (regla de Sturges o √n) y amplitud c = R / k.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-limites-reales-marca-clase',
        label: 'Límites, Fronteras y Marca de Clase (xᵢ)',
        level: 1,
        type: 'basic',
        requires: ['g7-stat-u1-datos-agrupados-intervalos'],
        description: 'Límites inferiores y superiores [Lᵢ, Lₛ), fronteras de clase continuas y el punto medio representativo: marca de clase xᵢ = (Lᵢ + Lₛ) / 2.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-tabla-completa-intervalos',
        label: 'Construcción de la Tabla de Frecuencias Agrupadas',
        level: 2,
        type: 'applied',
        requires: ['g7-stat-reglas-agrupacion-amplitud', 'g7-stat-limites-reales-marca-clase'],
        description: 'Clasificación de datos en sus intervalos respectivos, conteo de frecuencias absolutas, relativas, porcentuales y acumuladas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: HISTOGRAMAS, POLÍGONOS DE FRECUENCIA Y OJIVAS
    // ==========================================
    {
        id: 'g7-stat-u2-graficos-continuos-ojivas',
        label: 'Histogramas, Polígonos de Frecuencia y Ojivas',
        level: 3,
        type: 'basic',
        requires: ['g7-stat-tabla-completa-intervalos'],
        description: 'Representación visual de distribuciones agrupadas continuas y curvas de frecuencia acumulada.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-histograma-intervalos-continuos',
        label: 'Construcción del Histograma de Intervalos Continuos',
        level: 4,
        type: 'basic',
        requires: ['g7-stat-u2-graficos-continuos-ojivas'],
        description: 'Dibuja rectángulos contiguos cuyas bases son los intervalos [Lᵢ, Lₛ) y cuyas alturas corresponden a las frecuencias de clase.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-ojiva-porcentual-acumulada',
        label: 'La Ojiva Ascendente (Curva de Frecuencias Acumuladas)',
        level: 4,
        type: 'basic',
        requires: ['g7-stat-u2-graficos-continuos-ojivas'],
        description: 'Trazado de la curva poligonal acumulativa que une las fronteras superiores con las frecuencias acumuladas (Fᵢ o %Fᵢ).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-estimacion-grafica-percentiles-ojiva',
        label: 'Estimación de la Mediana y Porcentajes desde la Ojiva',
        level: 5,
        type: 'applied',
        requires: ['g7-stat-histograma-intervalos-continuos', 'g7-stat-ojiva-porcentual-acumulada'],
        description: 'Usa la ojiva para estimar visualmente qué valor acumula el 50% de los datos (mediana gráfica) o el 75% del conjunto.',
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
        description: 'Cálculo de la media ponderada por marcas de clase y determinación analítica de los intervalos modal y mediano.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-media-agrupados-marcas-clase',
        label: 'Media para Datos Agrupados: x̄ = ∑(xᵢ·fᵢ) / n',
        level: 7,
        type: 'basic',
        requires: ['g7-stat-u3-mtc-datos-agrupados'],
        description: 'Multiplica la marca de clase de cada intervalo por su frecuencia absoluta, suma los productos y divide por el total de observaciones.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-intervalo-modal-y-mediano',
        label: 'Identificación del Intervalo Modal e Intervalo Mediano',
        level: 7,
        type: 'basic',
        requires: ['g7-stat-u3-mtc-datos-agrupados'],
        description: 'Halla el intervalo de mayor frecuencia absoluta (clase modal) y el primer intervalo donde Fᵢ supera n/2 (clase mediana).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-analisis-forma-asimetria-intuitiva',
        label: 'Forma de la Distribución: Simetría y Sesgo Intuitivo',
        level: 8,
        type: 'applied',
        requires: ['g7-stat-media-agrupados-marcas-clase', 'g7-stat-intervalo-modal-y-mediano'],
        description: 'Compara la posición relativa de media, mediana y moda: sesgo hacia la derecha (cola positiva) vs. distribución simétrica.',
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
        description: 'Operaciones de la teoría de conjuntos aplicadas a la probabilidad: unión, intersección, diferencia y diagramas de Venn.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-union-interseccion-probabilidad',
        label: 'La Unión (A ∪ B) y la Intersección (A ∩ B)',
        level: 10,
        type: 'basic',
        requires: ['g7-stat-u4-algebra-sucesos-venn'],
        description: 'Identifica la región donde ocurre al menos uno de los sucesos (unión) y la región donde ocurren ambos simultáneamente (intersección).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-regla-suma-general-compatibles',
        label: 'Regla General de la Suma: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
        level: 10,
        type: 'basic',
        requires: ['g7-stat-u4-algebra-sucesos-venn'],
        description: 'Evita contar dos veces los elementos de la intersección restando P(A ∩ B) al calcular la probabilidad de la unión de eventos compatibles.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-diagramas-venn-tres-conjuntos',
        label: 'Resolución de Problemas de Probabilidad con Diagramas de Venn',
        level: 11,
        type: 'applied',
        requires: ['g7-stat-union-interseccion-probabilidad', 'g7-stat-regla-suma-general-compatibles'],
        description: 'Ubica datos en diagramas de Venn de dos y tres conjuntos iniciando desde la intersección triple hacia las regiones exteriores.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: VARIACIONES Y CONTEO CON RESTRICCIONES
    // ==========================================
    {
        id: 'g7-stat-u5-estructuras-conteo-variaciones',
        label: 'Variaciones y Conteo con Restricciones',
        level: 12,
        type: 'advanced',
        requires: ['g7-stat-diagramas-venn-tres-conjuntos'],
        description: 'Selecciones ordenadas de k elementos tomados de un conjunto total de n elementos (donde el orden sí importa).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g7-stat-variaciones-sin-repeticion-formula',
        label: 'Variaciones Ordinarias: V(n, k) = n! / (n - k)!',
        level: 13,
        type: 'basic',
        requires: ['g7-stat-u5-estructuras-conteo-variaciones'],
        description: 'Elegir presidente, vicepresidente y secretario de un grupo de 10: el orden asigna cargos diferentes. V(10, 3) = 10 × 9 × 8 = 720.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-variaciones-con-repeticion-vr',
        label: 'Variaciones con Repetición: VR(n, k) = nᵏ (Códigos y Claves)',
        level: 13,
        type: 'basic',
        requires: ['g7-stat-u5-estructuras-conteo-variaciones'],
        description: 'Cuando los elementos pueden repetirse en cada casilla: claves de candados de 4 dígitos (10⁴ = 10.000 combinaciones posibles).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-problemas-conteo-con-restricciones',
        label: 'Problemas de Ordenamiento con Restricciones (Elementos Fijos)',
        level: 14,
        type: 'applied',
        requires: ['g7-stat-variaciones-sin-repeticion-formula', 'g7-stat-variaciones-con-repeticion-vr'],
        description: 'Calcula cuántos números pares de 3 cifras se pueden formar o arreglos donde dos personas específicas deben quedar juntas.',
        xOffset: -30,
        behavior: 'quiz_list'
    },
    {
        id: 'g7-stat-aplicacion-conteo-probabilidad-laplace',
        label: 'Cálculo de Probabilidades usando Técnicas de Variación',
        level: 14,
        type: 'advanced',
        requires: ['g7-stat-variaciones-sin-repeticion-formula', 'g7-stat-variaciones-con-repeticion-vr'],
        description: 'Aplica Laplace calculando los casos favorables y posibles mediante fórmulas combinatorias V(n, k) en juegos y claves.',
        xOffset: 30,
        behavior: 'quiz_list'
    }
];
