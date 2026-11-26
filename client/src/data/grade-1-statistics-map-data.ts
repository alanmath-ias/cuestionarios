import { ArithmeticNode } from './arithmetic-map-data';

export const grade1StatisticsNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: CLASIFICACIÓN Y RECOLECCIÓN DE DATOS
    // ==========================================
    {
        id: 'g1-stat-u1-clasificacion-recoleccion',
        label: 'Clasificación y Recolección de Datos',
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
        requires: ['g1-stat-u1-clasificacion-recoleccion'],
        description: 'Junta juguetes rojos con rojos, círculos con círculos y separa elementos grandes de pequeños en grupos ordenados.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-criterio-pertenencia',
        label: 'Criterios de Pertenencia y el Intruso',
        level: 1,
        type: 'basic',
        requires: ['g1-stat-u1-clasificacion-recoleccion'],
        description: 'Descubre qué elemento no pertenece a la colección y explica qué característica comparten todos los demás.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-recoleccion-preguntas-simples',
        label: 'Preguntas Sencillas y Preferencias del Entorno',
        level: 2,
        type: 'applied',
        requires: ['g1-stat-clasificar-color-forma', 'g1-stat-criterio-pertenencia'],
        description: 'Pregunta a tus compañeros sobre sus preferencias (fruta favorita, mascota) y aprende a reunir respuestas ordenadas.',
        xOffset: -30,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-conteo-marcas-palitos',
        label: 'Conteo Uno a Uno y Marcas de Conteo',
        level: 2,
        type: 'basic',
        requires: ['g1-stat-clasificar-color-forma', 'g1-stat-criterio-pertenencia'],
        description: 'Cuenta cada elemento sin omitir ninguno y utiliza marcas o palitos en grupos de 5 para llevar el registro rápido.',
        xOffset: 30,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: TABLAS Y REPRESENTACIÓN GRÁFICA ELEMENTAL
    // ==========================================
    {
        id: 'g1-stat-u2-tablas-graficos-elementales',
        label: 'Tablas y Representación Gráfica Elemental',
        level: 3,
        type: 'basic',
        requires: ['g1-stat-recoleccion-preguntas-simples', 'g1-stat-conteo-marcas-palitos'],
        description: 'Organiza datos en tablas sencillas y represéntalos visualmente mediante pictogramas y torres de bloques.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-tabla-conteo-simple',
        label: 'Tablas de Conteo Simples de Dos Columnas',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-tablas-graficos-elementales'],
        description: 'Construye tablas con el dibujo o nombre de la categoría en una columna y el número total de marcas en la otra.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-lectura-pictogramas-unitarios',
        label: 'Lectura e Interpretación de Pictogramas',
        level: 4,
        type: 'basic',
        requires: ['g1-stat-u2-tablas-graficos-elementales'],
        description: 'Observa filas de figuras donde cada dibujo o carita vale exactamente 1 elemento para responder preguntas directas.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-completar-pictogramas',
        label: 'Completar y Dibujar Pictogramas',
        level: 5,
        type: 'applied',
        requires: ['g1-stat-tabla-conteo-simple', 'g1-stat-lectura-pictogramas-unitarios'],
        description: 'Dibuja la cantidad correcta de símbolos en una fila a partir de los datos dados en una tabla o lista.',
        xOffset: -30,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-graficos-bloques-barras-simples',
        label: 'Gráficos de Bloques y Barras Simples',
        level: 5,
        type: 'applied',
        requires: ['g1-stat-tabla-conteo-simple', 'g1-stat-lectura-pictogramas-unitarios'],
        description: 'Compara cantidades mediante torres o barras de cuadritos: identifica la más alta (más que), la más baja (menos que) y empates.',
        xOffset: 30,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: AZAR INTUITIVO Y PREDICCIÓN
    // ==========================================
    {
        id: 'g1-stat-u3-azar-intuitivo-prediccion',
        label: 'Azar Intuitivo y Predicción',
        level: 6,
        type: 'basic',
        requires: ['g1-stat-completar-pictogramas', 'g1-stat-graficos-bloques-barras-simples'],
        description: 'Descubre que hay situaciones donde sabemos con certeza lo que pasará y otras que dependen del azar.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-distinguir-seguro-imposible',
        label: 'Acontecimientos Seguros e Imposibles',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-azar-intuitivo-prediccion'],
        description: 'Identifica sucesos que ocurrirán con total seguridad (mañana saldrá el sol) y sucesos que jamás pueden ocurrir (un pez caminando por la calle).',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-sucesos-posibles-bolsas',
        label: 'Sucesos Posibles y Bolsas de Colores',
        level: 7,
        type: 'basic',
        requires: ['g1-stat-u3-azar-intuitivo-prediccion'],
        description: 'Extracción sin mirar: si en una bolsa hay bolas rojas y azules, sacar una roja es posible pero no seguro. Compara más y menos probable.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-predicciones-juegos-azar',
        label: 'Juegos de Azar y Predicciones con Dados y Monedas',
        level: 8,
        type: 'applied',
        requires: ['g1-stat-distinguir-seguro-imposible', 'g1-stat-sucesos-posibles-bolsas'],
        description: 'Anticipa resultados al lanzar una moneda (cara o sello) o un dado de seis caras, reconociendo la incertidumbre.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: CONTEO SISTEMÁTICO Y PEQUEÑAS INVESTIGACIONES
    // ==========================================
    {
        id: 'g1-stat-u4-conteo-sistematico-investigacion',
        label: 'Conteo Sistemático y Pequeñas Investigaciones',
        level: 9,
        type: 'advanced',
        requires: ['g1-stat-predicciones-juegos-azar'],
        description: 'Aplica el pensamiento estadístico completo: combina opciones, realiza una encuesta escolar y extrae conclusiones.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-stat-combinacion-material-concreto',
        label: 'Combinaciones Simples con Material Concreto',
        level: 10,
        type: 'applied',
        requires: ['g1-stat-u4-conteo-sistematico-investigacion'],
        description: 'Encuentra todas las formas posibles de combinar elementos concretos (ejemplo: 2 camisetas × 2 pantalones) organizadamente.',
        xOffset: -40,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-proyecto-encuesta-aula',
        label: 'Mini-Proyecto: La Encuesta de Nuestra Clase',
        level: 10,
        type: 'applied',
        requires: ['g1-stat-u4-conteo-sistematico-investigacion'],
        description: 'Plantea una pregunta a tus compañeros, haz marcas de conteo, arma la tabla y construye el gráfico de barras final.',
        xOffset: 40,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-stat-conclusiones-toma-decisiones',
        label: 'Conclusiones y Toma de Decisiones a partir de Datos',
        level: 11,
        type: 'advanced',
        requires: ['g1-stat-combinacion-material-concreto', 'g1-stat-proyecto-encuesta-aula'],
        description: 'Usa los resultados del gráfico para resolver situaciones reales (elegir el sabor de helado o el juego favorito para una fiesta).',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];
