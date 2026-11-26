import { ArithmeticNode } from './arithmetic-map-data';

export const grade9StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: DIAGRAMAS DE CAJA Y BIGOTES (BOXPLOTS) Y OUTLIERS
    // ==========================================
    {
        id: 'g9-stat-u1-diagramas-caja-outliers',
        label: 'Diagramas de Caja (Boxplots) y Detección de Outliers',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Construcción del resumen de 5 números (Mín, Q₁, Me, Q₃, Máx), representación visual de la dispersión y regla de detección de valores atípicos.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-resumen-cinco-numeros-caja',
        label: 'El Resumen de Cinco Números y la Caja Central',
        level: 1,
        type: 'basic',
        requires: ['g9-stat-u1-diagramas-caja-outliers'],
        description: 'Dibuja la caja que contiene el 50% central de los datos delimitada por Q₁ y Q₃, con la línea de la mediana (Q₂) en su interior.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-regla-1-5-iqr-outliers',
        label: 'Regla del 1.5 × IQR para Valores Atípicos (Outliers)',
        level: 1,
        type: 'critical',
        requires: ['g9-stat-u1-diagramas-caja-outliers'],
        description: 'Fórmula de barreras: límite inferior Q₁ - 1.5×IQR y límite superior Q₃ + 1.5×IQR. Todo dato fuera de estos límites se marca como atípico con un asterisco.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-lectura-simetria-sesgo-boxplots',
        label: 'Interpretación de Simetría, Sesgo y Bigotes en Boxplots',
        level: 2,
        type: 'applied',
        requires: ['g9-stat-resumen-cinco-numeros-caja', 'g9-stat-regla-1-5-iqr-outliers'],
        description: 'Analiza la longitud de los bigotes y la posición de la mediana: bigote derecho largo indica sesgo positivo; bigote izquierdo largo indica sesgo negativo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: COEFICIENTE DE VARIACIÓN Y DISPERSIÓN RELATIVA
    // ==========================================
    {
        id: 'g9-stat-u2-coeficiente-variacion-homogeneidad',
        label: 'Coeficiente de Variación y Dispersión Relativa',
        level: 3,
        type: 'basic',
        requires: ['g9-stat-lectura-simetria-sesgo-boxplots'],
        description: 'Comparación de la variabilidad entre poblaciones con diferentes medias o medidas en distintas unidades mediante el Coeficiente de Variación (CV).',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-calculo-coeficiente-variacion-formula',
        label: 'El Coeficiente de Variación: CV = (s / x̄) × 100%',
        level: 4,
        type: 'critical',
        requires: ['g9-stat-u2-coeficiente-variacion-homogeneidad'],
        description: 'Cociente adimensional entre la desviación estándar y la media aritmética, expresado en porcentaje: cuantifica el riesgo o variabilidad relativa.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-criterio-homogeneidad-poblacional',
        label: 'Criterio de Homogeneidad: CV ≤ 15% vs. CV > 30%',
        level: 4,
        type: 'basic',
        requires: ['g9-stat-u2-coeficiente-variacion-homogeneidad'],
        description: 'Clasifica poblaciones: si CV < 15% los datos son homogéneos y la media es muy confiable; si CV > 30% los datos son heterogéneos.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-comparacion-variables-distintas-escalas',
        label: 'Comparación entre Variables con Distintas Escalas o Unidades',
        level: 5,
        type: 'applied',
        requires: ['g9-stat-calculo-coeficiente-variacion-formula', 'g9-stat-criterio-homogeneidad-poblacional'],
        description: 'Determina si en un grupo escolar hay mayor dispersión en el peso (kg) o en la estatura (cm), comparando sus respectivos coeficientes de variación.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: TÉCNICAS COMBINATORIAS AVANZADAS Y TEOREMA DEL BINOMIO
    // ==========================================
    {
        id: 'g9-stat-u3-combinatoria-avanzada-binomio',
        label: 'Combinatoria Avanzada, Pascal y Binomio de Newton',
        level: 6,
        type: 'basic',
        requires: ['g9-stat-comparacion-variables-distintas-escalas'],
        description: 'Estructuras combinatorias profundas: combinaciones con repetición, simetría del Triángulo de Pascal y desarrollo del Teorema del Binomio.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-combinaciones-con-repeticion-cr',
        label: 'Combinaciones con Repetición: CR(n, k) = C(n + k - 1, k)',
        level: 7,
        type: 'critical',
        requires: ['g9-stat-u3-combinatoria-avanzada-binomio'],
        description: 'Selección de k objetos donde se pueden repetir elementos sin importar el orden: comprar 5 bolas de helado entre 4 sabores disponibles.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-triangulo-pascal-propiedades-numeros-combinatorios',
        label: 'El Triángulo de Pascal y Propiedades de C(n, k)',
        level: 7,
        type: 'basic',
        requires: ['g9-stat-u3-combinatoria-avanzada-binomio'],
        description: 'Simetría C(n, k) = C(n, n-k) y relación recursiva de Pascal: C(n, k) = C(n-1, k-1) + C(n-1, k). Suma de cada fila igual a 2ⁿ.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-teorema-binomio-newton-conteo',
        label: 'El Teorema del Binomio de Newton: (a + b)ⁿ = ∑ C(n, k)·aⁿ⁻ᵏ·bᵏ',
        level: 8,
        type: 'applied',
        requires: ['g9-stat-combinaciones-con-repeticion-cr', 'g9-stat-triangulo-pascal-propiedades-numeros-combinatorios'],
        description: 'Conecta el álgebra con la combinatoria: usa coeficientes binomiales para expandir polinomios y encontrar términos específicos sin multiplicar todo.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: TABLAS DE CONTINGENCIA Y PROBABILIDAD DE SUCESOS COMPUESTOS
    // ==========================================
    {
        id: 'g9-stat-u4-contingencia-sucesos-compuestos',
        label: 'Tablas de Contingencia y Sucesos Compuestos',
        level: 9,
        type: 'basic',
        requires: ['g9-stat-teorema-binomio-newton-conteo'],
        description: 'Cálculo de probabilidades conjuntas y marginales en tablas de doble entrada (contingencia) y aplicación de la regla general de la adición.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-tablas-contingencia-frecuencias-marginales',
        label: 'Tablas de Contingencia: Frecuencias Conjuntas y Marginales',
        level: 10,
        type: 'basic',
        requires: ['g9-stat-u4-contingencia-sucesos-compuestos'],
        description: 'Cruza dos variables cualitativas (fumar / no fumar vs. afección pulmonar): identifica intersecciones y totales marginales por fila y columna.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-probabilidades-conjuntas-marginales',
        label: 'Cálculo de Probabilidad Conjunta P(A ∩ B) y Marginal P(A)',
        level: 10,
        type: 'critical',
        requires: ['g9-stat-u4-contingencia-sucesos-compuestos'],
        description: 'Divide la casilla interior entre el gran total para la probabilidad conjunta, o el total de la fila/columna para la probabilidad marginal.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-regla-adicion-en-contingencia',
        label: 'Regla de la Suma con Tablas de Doble Entrada',
        level: 11,
        type: 'applied',
        requires: ['g9-stat-tablas-contingencia-frecuencias-marginales', 'g9-stat-probabilidades-conjuntas-marginales'],
        description: 'Aplica P(A ∪ B) = P(A) + P(B) - P(A ∩ B) sumando filas y columnas y restando la celda de intersección para evitar la doble contabilización.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PROBABILIDAD CONDICIONAL E INDEPENDENCIA
    // ==========================================
    {
        id: 'g9-stat-u5-probabilidad-condicional-independencia',
        label: 'Probabilidad Condicional e Independencia',
        level: 12,
        type: 'basic',
        requires: ['g9-stat-regla-adicion-en-contingencia'],
        description: 'Formalización matemática de la probabilidad dado que ya ocurrió otro suceso: P(A|B), criterio formal de independencia y regla del producto.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-definicion-probabilidad-condicional-formula',
        label: 'La Fórmula de la Probabilidad Condicional: P(A|B) = P(A ∩ B) / P(B)',
        level: 13,
        type: 'critical',
        requires: ['g9-stat-u5-probabilidad-condicional-independencia'],
        description: 'El espacio muestral se reduce a la condición B: calcula la probabilidad de A mirando únicamente dentro de la fila o columna correspondiente a B.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-criterio-formal-independencia-estocastica',
        label: 'Criterio Formal de Independencia: P(A ∩ B) = P(A) · P(B)',
        level: 13,
        type: 'basic',
        requires: ['g9-stat-u5-probabilidad-condicional-independencia'],
        description: 'Dos sucesos son estocásticamente independientes si y solo si la ocurrencia de B no altera la probabilidad de A: P(A|B) = P(A).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-regla-multiplicacion-dependencia-arboles',
        label: 'Regla de la Multiplicación en Árboles de Probabilidad',
        level: 14,
        type: 'applied',
        requires: ['g9-stat-definicion-probabilidad-condicional-formula', 'g9-stat-criterio-formal-independencia-estocastica'],
        description: 'Multiplica a lo largo de ramas: P(A ∩ B) = P(B) · P(A|B). Resuelve problemas médicos, de control de calidad y producción en serie.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: SÍNTESIS DE SECUNDARIA BÁSICA Y GRAN CORONA DE 9.°
    // ==========================================
    {
        id: 'g9-stat-u6-sintesis-maestria-secundaria',
        label: 'Cierre de Secundaria Básica y Gran Corona de 9.°',
        level: 15,
        type: 'basic',
        requires: ['g9-stat-regla-multiplicacion-dependencia-arboles'],
        description: 'Reto supremo de culminación del ciclo básico escolar (1.° a 9.°): integración de boxplots, CV, combinatoria y probabilidad condicional.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g9-stat-analisis-integral-boxplots-cv',
        label: 'Análisis Multivariado: Boxplots Comparativos y CV',
        level: 16,
        type: 'basic',
        requires: ['g9-stat-u6-sintesis-maestria-secundaria'],
        description: 'Evalúa simultáneamente la tendencia central, la dispersión relativa y la presencia de valores atípicos en tres grupos en competencia.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-problemas-integrados-probabilidad-contingencia',
        label: 'Resolución de Problemas Complejos de Decisión con Probabilidad',
        level: 16,
        type: 'basic',
        requires: ['g9-stat-u6-sintesis-maestria-secundaria'],
        description: 'Toma de decisiones en contextos de riesgo financiero, diagnóstico de fallas y pruebas diagnósticas con tablas de contingencia.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g9-stat-corona-maestria-noveno',
        label: 'Gran Corona de Maestría de Estadística de 9.° Grado • Cima de Secundaria Básica',
        level: 17,
        type: 'evaluation',
        requires: ['g9-stat-analisis-integral-boxplots-cv', 'g9-stat-problemas-integrados-probabilidad-contingencia'],
        description: '¡Máximo galardón de la Educación Básica Secundaria! Domina diagramas de caja (outliers), coeficiente de variación, binomio de Newton, tablas de contingencia y probabilidad condicional.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
