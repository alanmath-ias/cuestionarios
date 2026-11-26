import { ArithmeticNode } from './arithmetic-map-data';

export const grade1StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CLASIFICACIÓN Y RECOLECCIÓN DE OBJETOS
    // ==========================================
    {
        id: 'g1-stat-u1-clasificacion-colecciones',
        label: 'Clasificación y Recolección de Objetos',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Aprende a observar, clasificar y ordenar objetos de tu entorno según color, forma, tamaño y características comunes.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-clasificar-color-forma',
        label: 'Agrupación por Color, Forma y Tamaño',
        level: 1,
        type: 'basic',
        requires: ['g1-stat-u1-clasificacion-colecciones'],
        description: 'Junta juguetes rojos con rojos, círculos con círculos y separa elementos grandes de pequeños en grupos ordenados.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-criterio-pertenencia',
        label: 'Criterios de Pertenencia y el Intruso',
        level: 1,
        type: 'basic',
        requires: ['g1-stat-u1-clasificacion-colecciones'],
        description: 'Descubre qué elemento no pertenece a la colección y explica qué característica comparten todos los demás.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-recoleccion-preguntas-simples',
        label: 'Primeras Preguntas y Recolección de Datos',
        level: 2,
        type: 'applied',
        requires: ['g1-stat-clasificar-color-forma', 'g1-stat-criterio-pertenencia'],
        description: 'Pregunta a tus compañeros sobre sus preferencias (fruta favorita, mascota) y aprende a reunir respuestas ordenadas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: CONTEO SISTEMÁTICO Y PRIMERAS TABLAS DE MARCAS
    // ==========================================
    {
        id: 'g1-stat-u2-conteo-tablas-marcas',
        label: 'Conteo Sistemático y Tablas de Marcas',
        level: 3,
        type: 'basic',
        requires: ['g1-stat-recoleccion-preguntas-simples'],
        description: 'Pasa de contar objetos dispersos a registrar cantidades mediante marcas, palitos y tablas de doble columna.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-conteo-uno-a-uno',
        label: 'Conteo Uno a Uno sin Repeticiones',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-conteo-tablas-marcas'],
        description: 'Técnica de señalamiento: cuenta cada objeto una sola vez tachando o separando para no omitir ninguno.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-marcas-de-conteo',
        label: 'Marcas de Conteo y Palitos Agrupados',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-conteo-tablas-marcas'],
        description: 'Utiliza rayas y marcas en grupos de 5 para llevar el control rápido de votos y elementos contados.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-tabla-conteo-simple',
        label: 'Construcción de Tablas de Conteo',
        level: 5,
        type: 'critical',
        requires: ['g1-stat-conteo-uno-a-uno', 'g1-stat-marcas-de-conteo'],
        description: 'Organiza tablas con dos columnas: en la primera el dibujo de la opción y en la segunda el número total correspondiente.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: PICTOGRAMAS CON ESCALA UNITARIA
    // ==========================================
    {
        id: 'g1-stat-u3-pictogramas-escala-unitaria',
        label: 'Pictogramas con Escala Unitaria',
        level: 6,
        type: 'basic',
        requires: ['g1-stat-tabla-conteo-simple'],
        description: 'Descubre los gráficos visuales donde cada dibujo o icono representa exactamente un elemento o una preferencia.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-lectura-pictogramas-unitarios',
        label: 'Lectura e Interpretación de Pictogramas',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-pictogramas-escala-unitaria'],
        description: 'Observa filas de figuras: cada estrella o carita vale 1 voto. Cuenta cuántas hay en cada fila para responder preguntas.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-completar-pictogramas',
        label: 'Completar y Dibujar Pictogramas',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-pictogramas-escala-unitaria'],
        description: 'Dibuja la cantidad correcta de símbolos en una fila según los datos dados en una tabla o lista.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-comparar-pictogramas',
        label: 'Comparación: ¿Quién Tiene Más y Quién Menos?',
        level: 8,
        type: 'applied',
        requires: ['g1-stat-lectura-pictogramas-unitarios', 'g1-stat-completar-pictogramas'],
        description: 'Compara la longitud visual de las filas de dibujos para identificar la opción más elegida, la menos elegida y empates.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: GRÁFICOS DE BLOQUES Y BARRAS SIMPLES
    // ==========================================
    {
        id: 'g1-stat-u4-graficos-barras-bloques',
        label: 'Gráficos de Bloques y Barras Simples',
        level: 9,
        type: 'basic',
        requires: ['g1-stat-comparar-pictogramas'],
        description: 'Construye torres y barras de cuadritos coloreados para comparar cantidades de forma clara y directa.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-barras-verticales-bloques',
        label: 'Torres y Barras Verticales',
        level: 10,
        type: 'basic',
        requires: ['g1-stat-u4-graficos-barras-bloques'],
        description: 'Torres de bloques apilados de abajo hacia arriba: la barra más alta representa la mayor cantidad.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-barras-horizontales-bloques',
        label: 'Filas y Barras Horizontales',
        level: 10,
        type: 'basic',
        requires: ['g1-stat-u4-graficos-barras-bloques'],
        description: 'Tiras de cuadritos que avanzan de izquierda a derecha para comparar resultados de recolecciones.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-preguntas-graficos-barras',
        label: 'Preguntas y Diferencias con Gráficos de Barras',
        level: 11,
        type: 'applied',
        requires: ['g1-stat-barras-verticales-bloques', 'g1-stat-barras-horizontales-bloques'],
        description: 'Calcula cuántos hay en total sumando las barras y cuántos más tiene una barra respecto a otra.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: AZAR COTIDIANO: SEGURO, POSIBLE E IMPOSIBLE
    // ==========================================
    {
        id: 'g1-stat-u5-azar-seguro-posible-imposible',
        label: 'Azar Cotidiano: Seguro, Posible e Imposible',
        level: 12,
        type: 'basic',
        requires: ['g1-stat-preguntas-graficos-barras'],
        description: 'Descubre que hay situaciones donde sabemos con certeza lo que pasará y otras que dependen de la suerte.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-distinguir-seguro-imposible',
        label: 'Acontecimientos Seguros e Imposibles',
        level: 13,
        type: 'basic',
        requires: ['g1-stat-u5-azar-seguro-posible-imposible'],
        description: 'Identifica sucesos que ocurrirán con total seguridad (mañana saldrá el sol) y sucesos que jamás pueden ocurrir (un pez volando en el espacio).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-sucesos-posibles-bolsas',
        label: 'Sucesos Posibles y Bolsas de Colores',
        level: 13,
        type: 'basic',
        requires: ['g1-stat-u5-azar-seguro-posible-imposible'],
        description: 'Extracción sin mirar: si en una bolsa hay bolas rojas y azules, sacar una roja es posible pero no seguro.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-predicciones-juegos-azar',
        label: 'Predicciones y Juegos de Azar con Dados y Monedas',
        level: 14,
        type: 'applied',
        requires: ['g1-stat-distinguir-seguro-imposible', 'g1-stat-sucesos-posibles-bolsas'],
        description: 'Anticipa resultados al lanzar una moneda (cara o sello) o un dado, reconociendo que no podemos controlar el resultado.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: PEQUEÑOS INVESTIGADORES Y GRAN CORONA DE 1.°
    // ==========================================
    {
        id: 'g1-stat-u6-investigadores-maestria',
        label: 'Pequeños Investigadores y Gran Corona de 1.°',
        level: 15,
        type: 'basic',
        requires: ['g1-stat-predicciones-juegos-azar'],
        description: 'Integración de todo el pensamiento estadístico: recolecta, clasifica, grafica y razona sobre el azar.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-proyecto-investigacion-aula',
        label: 'Mini-Proyecto: La Encuesta de Nuestra Clase',
        level: 16,
        type: 'basic',
        requires: ['g1-stat-u6-investigadores-maestria'],
        description: 'Plantea una pregunta, haz marcas de conteo, arma la tabla y construye el gráfico de barras final.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-conclusiones-toma-decisiones',
        label: 'Lectura de Conclusiones y Toma de Decisiones',
        level: 16,
        type: 'basic',
        requires: ['g1-stat-u6-investigadores-maestria'],
        description: 'Usa los resultados del gráfico para resolver situaciones reales (qué sabor de helado comprar para la fiesta).',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-corona-maestria-primero',
        label: 'Gran Corona de Maestría de Estadística de 1.° Grado',
        level: 17,
        type: 'evaluation',
        requires: ['g1-stat-proyecto-investigacion-aula', 'g1-stat-conclusiones-toma-decisiones'],
        description: '¡Desafío supremo de 1.º! Demuestra tu maestría en clasificación de datos, tablas de conteo, pictogramas, gráficos de barras y nociones de azar.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
