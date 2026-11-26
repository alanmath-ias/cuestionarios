import { ArithmeticNode } from './arithmetic-map-data';

export const grade5StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: INVESTIGACIÓN ESTADÍSTICA Y TABULACIÓN AVANZADA
    // ==========================================
    {
        id: 'g5-stat-u1-investigacion-tabulacion',
        label: 'Investigación Estadística y Tabulación Avanzada',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Planificación de una investigación estadística: formulación de hipótesis simples, recolección de muestras y frecuencias acumuladas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-diseno-muestra-representativa',
        label: 'Diseño de Muestras y Sesgos de Selección',
        level: 1,
        type: 'basic',
        requires: ['g5-stat-u1-investigacion-tabulacion'],
        description: 'Comprende por qué una muestra debe ser representativa y aleatoria para no generar conclusiones erradas o sesgadas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-frecuencias-acumuladas-intro',
        label: 'Frecuencias Absolutas y Relativas Acumuladas',
        level: 1,
        type: 'basic',
        requires: ['g5-stat-u1-investigacion-tabulacion'],
        description: 'Suma sucesiva de frecuencias: ¿cuántos estudiantes obtuvieron nota menor o igual a 4? Cálculo de Fᵢ y Hᵢ.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-tabulacion-datos-cuantitativos',
        label: 'Tabulación Integral de Datos No Agrupados',
        level: 2,
        type: 'applied',
        requires: ['g5-stat-diseno-muestra-representativa', 'g5-stat-frecuencias-acumuladas-intro'],
        description: 'Construye tablas completas con columnas: Dato, fᵢ, hᵢ, %fᵢ, Fᵢ y %Fᵢ, verificando sumas y totales.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: GRÁFICOS CIRCULARES Y DIAGRAMAS DE TALLO Y HOJAS
    // ==========================================
    {
        id: 'g5-stat-u2-graficos-circulares-tallo-hojas',
        label: 'Gráficos Circulares y Diagramas de Tallo y Hojas',
        level: 3,
        type: 'basic',
        requires: ['g5-stat-tabulacion-datos-cuantitativos'],
        description: 'Representación proporcional en grados sexagesimales para sectores circulares y preservación de datos en tallo y hojas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-construccion-grafico-circular',
        label: 'Construcción y Ángulos del Gráfico Circular',
        level: 4,
        type: 'basic',
        requires: ['g5-stat-u2-graficos-circulares-tallo-hojas'],
        description: 'Calcula el ángulo de cada sector con regla de tres: Grados = (% × 360°) / 100 o Grados = hᵢ × 360°.',
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
        label: 'Comparación Gráfica de Dos Distribuciones',
        level: 5,
        type: 'critical',
        requires: ['g5-stat-construccion-grafico-circular', 'g5-stat-diagramas-tallo-hojas'],
        description: 'Compara dos grupos a través de gráficos de sectores o tallo y hojas espalda con espalda (back-to-back).',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: SENSIBILIDAD DE MEDIDAS ANTE VALORES EXTREMOS
    // ==========================================
    {
        id: 'g5-stat-u3-sensibilidad-valores-extremos',
        label: 'Sensibilidad de Medidas y Valores Extremos',
        level: 6,
        type: 'basic',
        requires: ['g5-stat-comparacion-distribuciones-graficas'],
        description: 'Descubre por qué un dato atípico (outlier) distorsiona la media aritmética y cuándo la mediana es más representativa.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-mediana-cantidad-par-datos',
        label: 'Mediana con Cantidad Par de Observaciones',
        level: 7,
        type: 'basic',
        requires: ['g5-stat-u3-sensibilidad-valores-extremos'],
        description: 'Cuando n es par no hay un único dato central: halla el promedio exacto de los dos valores centrales ordenados.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-efecto-outliers-en-promedio',
        label: 'Efecto de Valores Atípicos (Outliers) en la Media',
        level: 7,
        type: 'critical',
        requires: ['g5-stat-u3-sensibilidad-valores-extremos'],
        description: 'Si un salario es 10 veces mayor que los demás, la media se dispara hacia arriba pero la mediana se mantiene firme.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-eleccion-medida-representativa',
        label: 'Elección de la Medida más Representativa',
        level: 8,
        type: 'applied',
        requires: ['g5-stat-mediana-cantidad-par-datos', 'g5-stat-efecto-outliers-en-promedio'],
        description: 'Decide con criterio ético y científico: ¿cuándo reportar la media, cuándo la mediana y cuándo la moda?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: DISPERSIÓN ELEMENTAL Y VARIABILIDAD
    // ==========================================
    {
        id: 'g5-stat-u4-dispersion-variabilidad',
        label: 'Dispersión Elemental y Variabilidad de Datos',
        level: 9,
        type: 'basic',
        requires: ['g5-stat-eleccion-medida-representativa'],
        description: 'Comprende que dos grupos con el mismo promedio pueden ser muy homogéneos o muy dispersos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-rango-interpretacion-dispersion',
        label: 'El Rango como Medida de Variabilidad',
        level: 10,
        type: 'basic',
        requires: ['g5-stat-u4-dispersion-variabilidad'],
        description: 'Calcula R = xₘₐₓ - xₘᵢₙ y explica si los datos están muy concentrados alrededor del centro o muy esparcidos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-desviaciones-respecto-media-intro',
        label: 'Desviaciones Visuales Respecto a la Media',
        level: 10,
        type: 'basic',
        requires: ['g5-stat-u4-dispersion-variabilidad'],
        description: 'Mide la distancia de cada punto hacia la línea de la media: datos cercanos (baja variabilidad) vs. lejanos (alta variabilidad).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-comparacion-estabilidad-grupos',
        label: 'Comparación de Estabilidad y Regularidad entre Dos Grupos',
        level: 11,
        type: 'applied',
        requires: ['g5-stat-rango-interpretacion-dispersion', 'g5-stat-desviaciones-respecto-media-intro'],
        description: 'Analiza dos arqueros con el mismo puntaje promedio: ¿cuál es más consistente y confiable según la dispersión?',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: LEY DE LOS GRANDES NÚMEROS Y PROBABILIDAD COMPUESTA INTUITIVA
    // ==========================================
    {
        id: 'g5-stat-u5-probabilidad-grandes-numeros',
        label: 'Ley de Grandes Números y Probabilidad Compuesta',
        level: 12,
        type: 'basic',
        requires: ['g5-stat-comparacion-estabilidad-grupos'],
        description: 'Simulación y experimentación masiva: cómo las frecuencias relativas se aproximan a la probabilidad teórica al repetir muchas veces.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-ley-grandes-numeros-simulacion',
        label: 'La Ley de los Grandes Números (Noción Experimental)',
        level: 13,
        type: 'critical',
        requires: ['g5-stat-u5-probabilidad-grandes-numeros'],
        description: 'En 10 lanzamientos la moneda puede engañar, pero en 100 o 1000 lanzamientos la proporción de caras se clava en el 50% (0.5).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-sucesos-compuestos-uniones',
        label: 'Sucesos Compuestos y Conectivos "O" e "Y"',
        level: 13,
        type: 'basic',
        requires: ['g5-stat-u5-probabilidad-grandes-numeros'],
        description: 'Calcular la probabilidad de sacar "par O mayor que 4" o la probabilidad de sacar "cara Y un número 6" con moneda y dado.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-comparacion-teorica-experimental-juegos',
        label: 'Contraste entre Esperanza Teórica y Realidad en Juegos',
        level: 14,
        type: 'applied',
        requires: ['g5-stat-ley-grandes-numeros-simulacion', 'g5-stat-sucesos-compuestos-uniones'],
        description: 'Desmonta falacias comunes del jugador: "lleva saliendo 5 veces sello, la próxima tiene que salir cara".',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: COMBINATORIA ELEMENTAL Y GRAN CORONA DE 5.° (FIN DE PRIMARIA)
    // ==========================================
    {
        id: 'g5-stat-u6-conteo-orden-seleccion-maestria',
        label: 'Conteo: Ordenar vs. Seleccionar y Gran Corona de 5.°',
        level: 15,
        type: 'basic',
        requires: ['g5-stat-comparacion-teorica-experimental-juegos'],
        description: 'La gran pregunta combinatoria: ¿importa el orden? Permutaciones intuitivas, selecciones de equipos y reto cumbre de primaria.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g5-stat-diferencia-ordenar-seleccionar',
        label: '¿Importa el Orden? Ordenar vs. Seleccionar',
        level: 16,
        type: 'critical',
        requires: ['g5-stat-u6-conteo-orden-seleccion-maestria'],
        description: 'En una carrera el podio sí importa (1°, 2° y 3°). Al elegir 3 amigos para un equipo, el orden no importa.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-permutaciones-intuitivas-conteo',
        label: 'Ordenamientos Completos de 3 y 4 Elementos',
        level: 16,
        type: 'basic',
        requires: ['g5-stat-u6-conteo-orden-seleccion-maestria'],
        description: '¿De cuántas formas pueden sentarse 3 amigos en 3 sillas? 3 × 2 × 1 = 6 formas. Primer acercamiento al factorial.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g5-stat-corona-maestria-quinto',
        label: 'Gran Corona de Maestría de Estadística de 5.° Grado • Cima de Primaria',
        level: 17,
        type: 'evaluation',
        requires: ['g5-stat-diferencia-ordenar-seleccionar', 'g5-stat-permutaciones-intuitivas-conteo'],
        description: '¡Máximo galardón del pensamiento aleatorio en primaria! Domina investigaciones, frecuencias acumuladas, sectores, sensibilidad de MTC, variabilidad y probabilidad experimental.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
