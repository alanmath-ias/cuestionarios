import { ArithmeticNode } from './arithmetic-map-data';

export const grade5StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: TABULACIÓN CON FRECUENCIAS ACUMULADAS
    // ==========================================
    {
        id: 'g5-stat-u1-investigacion-tabulacion',
        label: 'Tabulación con Frecuencias Acumuladas',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Planificación de una investigación estadística: diseño muestral sin sesgos y cálculo sistemático de frecuencias acumuladas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-diseno-muestra-representativa',
        label: 'Diseño de Muestras Representativas y Prevención de Sesgos',
        level: 1,
        type: 'basic',
        requires: ['g5-stat-u1-investigacion-tabulacion'],
        description: 'Comprende por qué una muestra debe ser representativa y aleatoria para no generar conclusiones erradas o sesgadas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-frecuencias-acumuladas-intro',
        label: 'Frecuencias Absolutas y Relativas Acumuladas (Fᵢ y Hᵢ)',
        level: 1,
        type: 'basic',
        requires: ['g5-stat-u1-investigacion-tabulacion'],
        description: 'Suma acumulativa de frecuencias: responde preguntas de umbral (¿cuántos obtuvieron nota menor o igual a 4?).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-tabulacion-datos-cuantitativos',
        label: 'Tabulación Integral de Datos con Porcentajes Acumulados',
        level: 2,
        type: 'applied',
        requires: ['g5-stat-diseno-muestra-representativa', 'g5-stat-frecuencias-acumuladas-intro'],
        description: 'Construye tablas completas con columnas: Dato, fᵢ, hᵢ, %fᵢ, Fᵢ y %Fᵢ, verificando sumas y totales.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: VISUALIZACIÓN: SECTORES CIRCULARES Y TALLO Y HOJAS
    // ==========================================
    {
        id: 'g5-stat-u2-graficos-circulares-tallo-hojas',
        label: 'Visualización: Sectores Circulares y Tallo y Hojas',
        level: 3,
        type: 'basic',
        requires: ['g5-stat-tabulacion-datos-cuantitativos'],
        description: 'Representación proporcional en grados sexagesimales para sectores circulares y preservación de datos en tallo y hojas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-construccion-grafico-circular',
        label: 'Construcción Geométrica del Gráfico Circular (Ángulo = h × 360°)',
        level: 4,
        type: 'basic',
        requires: ['g5-stat-u2-graficos-circulares-tallo-hojas'],
        description: 'Calcula el ángulo de cada sector con regla de tres: Grados = (% × 360°) / 100 o Grados = hᵢ × 360° con transportador.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-diagramas-tallo-hojas',
        label: 'Diagramas de Tallo y Hojas (Stem-and-Leaf)',
        level: 4,
        type: 'basic',
        requires: ['g5-stat-u2-graficos-circulares-tallo-hojas'],
        description: 'Separa decenas (tallo) de unidades (hojas) para visualizar la forma de la distribución sin perder los datos originales.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-comparacion-distribuciones-graficas',
        label: 'Comparación Gráfica Simultánea de Dos Distribuciones',
        level: 5,
        type: 'applied',
        requires: ['g5-stat-construccion-grafico-circular', 'g5-stat-diagramas-tallo-hojas'],
        description: 'Compara dos grupos a través de gráficos de sectores o diagramas de tallo y hojas espalda con espalda (back-to-back).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: MEDIDAS DE RESUMEN Y SENSIBILIDAD ANTE OUTLIERS
    // ==========================================
    {
        id: 'g5-stat-u3-sensibilidad-valores-extremos',
        label: 'Medidas de Resumen y Sensibilidad ante Outliers',
        level: 6,
        type: 'basic',
        requires: ['g5-stat-comparacion-distribuciones-graficas'],
        description: 'Descubre por qué un dato atípico distorsiona la media aritmética y cuándo la mediana resulta más confiable.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-mediana-cantidad-par-datos',
        label: 'Cálculo de la Mediana (Me) para Cantidades Pares de Datos',
        level: 7,
        type: 'basic',
        requires: ['g5-stat-u3-sensibilidad-valores-extremos'],
        description: 'Cuando n es par no hay un único dato central: halla el promedio exacto de los dos valores centrales ordenados.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-efecto-outliers-en-promedio',
        label: 'Efecto de Valores Atípicos (Outliers) en la Media Aritmética',
        level: 7,
        type: 'basic',
        requires: ['g5-stat-u3-sensibilidad-valores-extremos'],
        description: 'Si un salario es 10 veces mayor que los demás, la media se dispara hacia arriba pero la mediana se mantiene firme.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-eleccion-medida-representativa',
        label: 'Elección Ética y Científica de la Medida más Representativa',
        level: 8,
        type: 'applied',
        requires: ['g5-stat-mediana-cantidad-par-datos', 'g5-stat-efecto-outliers-en-promedio'],
        description: 'Decide con criterio fundamentado: ¿cuándo reportar la media, cuándo la mediana y cuándo la moda?',
        xOffset: -35,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-rango-interpretacion-dispersion',
        label: 'El Rango y las Desviaciones Visuales como Medida de Variabilidad',
        level: 8,
        type: 'applied',
        requires: ['g5-stat-mediana-cantidad-par-datos', 'g5-stat-efecto-outliers-en-promedio'],
        description: 'Calcula R = x_máx - x_mín y observa la distancia de los datos hacia la media para evaluar homogeneidad vs dispersión.',
        xOffset: 35,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: LEY DE GRANDES NÚMEROS Y SUCESOS COMPUESTOS
    // ==========================================
    {
        id: 'g5-stat-u4-probabilidad-grandes-numeros',
        label: 'Ley de Grandes Números y Sucesos Compuestos',
        level: 9,
        type: 'basic',
        requires: ['g5-stat-eleccion-medida-representativa', 'g5-stat-rango-interpretacion-dispersion'],
        description: 'Experimentación masiva y simulación: cómo las frecuencias relativas convergen hacia la probabilidad teórica.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-ley-grandes-numeros-simulacion',
        label: 'La Ley de los Grandes Números mediante Simulaciones Repetidas',
        level: 10,
        type: 'basic',
        requires: ['g5-stat-u4-probabilidad-grandes-numeros'],
        description: 'En 10 lanzamientos la moneda puede engañar, pero en 100 o 1000 repeticiones la proporción de caras se estabiliza en 0.5 (50%).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-sucesos-compuestos-uniones',
        label: 'Sucesos Compuestos y Conectivos "O" (Unión) e "Y" (Intersección)',
        level: 10,
        type: 'basic',
        requires: ['g5-stat-u4-probabilidad-grandes-numeros'],
        description: 'Calcular la probabilidad de sacar "un número par o mayor que 4" o "un as y de picas" en dados y barajas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-comparacion-teorica-experimental-juegos',
        label: 'Contraste Teórico vs. Empírico y Falacias Comunes del Jugador',
        level: 11,
        type: 'applied',
        requires: ['g5-stat-ley-grandes-numeros-simulacion', 'g5-stat-sucesos-compuestos-uniones'],
        description: 'Desmonta mitos: si han salido 5 caras seguidas, ¿la próxima moneda tiene más probabilidad de ser sello? (independencia).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: CONTEO COMBINATORIO: ORDENAR VS. SELECCIONAR
    // ==========================================
    {
        id: 'g5-stat-u5-conteo-orden-seleccion',
        label: 'Conteo Combinatorio: Ordenar vs. Seleccionar',
        level: 12,
        type: 'advanced',
        requires: ['g5-stat-comparacion-teorica-experimental-juegos'],
        description: 'La gran pregunta combinatoria: ¿importa el orden? Permutaciones intuitivas y problemas de selección.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-diferencia-ordenar-seleccionar',
        label: 'La Pregunta Fundamental: ¿Importa el Orden? (Podio vs. Equipo)',
        level: 13,
        type: 'basic',
        requires: ['g5-stat-u5-conteo-orden-seleccion'],
        description: 'En una carrera el podio sí importa (1°, 2° y 3°). Al elegir 3 amigos para un equipo, el orden no altera el grupo resultante.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-permutaciones-intuitivas-conteo',
        label: 'Ordenamientos Completos de 3 y 4 Elementos (Factorial Inicial)',
        level: 13,
        type: 'basic',
        requires: ['g5-stat-u5-conteo-orden-seleccion'],
        description: '¿De cuántas formas pueden sentarse 3 amigos en 3 sillas? 3 × 2 × 1 = 6 formas. Primer acercamiento intuitivo al factorial.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-problemas-seleccion-equipos-intro',
        label: 'Problemas de Selección sin Importar el Orden y Árboles',
        level: 14,
        type: 'applied',
        requires: ['g5-stat-diferencia-ordenar-seleccionar', 'g5-stat-permutaciones-intuitivas-conteo'],
        description: 'Cuenta cuántos pares o tríos distintos se pueden formar a partir de un grupo pequeño de personas eliminando repeticiones.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
