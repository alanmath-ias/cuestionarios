import { ArithmeticNode } from './arithmetic-map-data';

export const grade1GeometryNodes: ArithmeticNode[] = [
    // ==========================================
    // UNIDAD 1: MI ESPACIO Y MI ALREDEDOR (ORIENTACIÓN ESPACIAL)
    // ==========================================
    {
        id: 'g1-geo-u1-espacio',
        label: 'Mi Espacio y Orientación',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Aprende a ubicarte a ti mismo y a las cosas en tu entorno.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-geo-arriba-abajo',
        label: 'Arriba, Abajo, Encima y Debajo',
        level: 1,
        type: 'basic',
        requires: ['g1-geo-u1-espacio'],
        description: 'Reconoce posiciones espaciales arriba/abajo y encima/debajo con objetos cotidianos.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-dentro-fuera',
        label: 'Dentro, Fuera y al Borde',
        level: 1,
        type: 'basic',
        requires: ['g1-geo-u1-espacio'],
        description: 'Identifica si un objeto o juguete está en el interior, exterior o en el borde.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-izquierda-derecha',
        label: 'Izquierda y Derecha',
        level: 2,
        type: 'critical',
        requires: ['g1-geo-arriba-abajo', 'g1-geo-dentro-fuera'],
        description: 'Descubre tu mano izquierda, tu mano derecha y hacia dónde miran las cosas.',
        xOffset: 0,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-delante-detras',
        label: 'Delante, Detrás, Cerca y Lejos',
        level: 3,
        type: 'applied',
        requires: ['g1-geo-izquierda-derecha'],
        description: 'Compara distancias y posiciones en fila: quién está delante, detrás, más cerca o más lejos.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 2: EL MUNDO DE LAS LÍNEAS Y TRAZOS MÁGICOS
    // ==========================================
    {
        id: 'g1-geo-u2-lineas',
        label: 'Líneas y Trazos Mágicos',
        level: 4,
        type: 'basic',
        requires: ['g1-geo-delante-detras'],
        description: 'Exploración de caminos, huellas, trazos libres y tipos de líneas.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-geo-rectas-curvas',
        label: 'Líneas Rectas y Líneas Curvas',
        level: 5,
        type: 'basic',
        requires: ['g1-geo-u2-lineas'],
        description: 'Líneas derechas como una regla y onduladas o curvas como una serpiente.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-abiertas-cerradas',
        label: 'Líneas Abiertas y Cerradas',
        level: 5,
        type: 'basic',
        requires: ['g1-geo-u2-lineas'],
        description: 'Caminos abiertos por donde se puede salir y caminos cerrados que encierran una región.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-horiz-vert',
        label: 'Líneas Horizontales y Verticales',
        level: 6,
        type: 'critical',
        requires: ['g1-geo-rectas-curvas', 'g1-geo-abiertas-cerradas'],
        description: 'Líneas acostadas como el horizonte o el suelo y líneas de pie como un árbol o edificio.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 3: FIGURAS PLANAS EN MI ENTORNO
    // ==========================================
    {
        id: 'g1-geo-u3-figuras',
        label: 'Figuras Planas',
        level: 7,
        type: 'basic',
        requires: ['g1-geo-horiz-vert'],
        description: 'Reconoce las figuras geométricas planas en juguetes, casas y la naturaleza.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-geo-circulo',
        label: 'El Círculo Redondito',
        level: 8,
        type: 'basic',
        requires: ['g1-geo-u3-figuras'],
        description: 'La figura curva sin esquinas: monedas, platos, ruedas y el sol.',
        xOffset: -50,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-cuadrado-rect',
        label: 'Cuadrado y Rectángulo',
        level: 8,
        type: 'basic',
        requires: ['g1-geo-u3-figuras'],
        description: 'Figuras de 4 esquinas rectas: dados, ventanas, cuadros, puertas y cuadernos.',
        xOffset: 50,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-triangulo',
        label: 'El Triángulo y sus 3 Puntas',
        level: 9,
        type: 'critical',
        requires: ['g1-geo-circulo', 'g1-geo-cuadrado-rect'],
        description: 'Figura de 3 lados y 3 puntitas: techos, banderines y trozos de pizza.',
        xOffset: 0,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-detectives-figuras',
        label: 'Detectives de Figuras',
        level: 10,
        type: 'applied',
        requires: ['g1-geo-triangulo'],
        description: 'Misión visual: descubre qué figuras forman los dibujos y objetos de la casa.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 4: CUERPOS GEOMÉTRICOS Y SÓLIDOS
    // ==========================================
    {
        id: 'g1-geo-u4-solidos',
        label: 'Cuerpos Geométricos',
        level: 11,
        type: 'basic',
        requires: ['g1-geo-detectives-figuras'],
        description: 'Cuerpos en 3D que ocupan un lugar en el espacio y tienen volumen.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-geo-esfera-cubo',
        label: 'La Esfera y el Cubo',
        level: 12,
        type: 'basic',
        requires: ['g1-geo-u4-solidos'],
        description: 'Pelotas redondas como la esfera y cajas perfectas con caras cuadradas como el cubo.',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-cilindro-cono',
        label: 'El Cilindro y el Cono',
        level: 12,
        type: 'basic',
        requires: ['g1-geo-u4-solidos'],
        description: 'Latas y tambores cilíndricos, y conos de helado o gorros de fiesta.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-ruedan-apilan',
        label: '¿Ruedan o se Apilan?',
        level: 13,
        type: 'applied',
        requires: ['g1-geo-esfera-cubo', 'g1-geo-cilindro-cono'],
        description: 'Experimento sensorial: cuáles ruedan por tener curvas y cuáles se pueden apilar en torres.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 5: PATRONES Y SIMETRÍA DIVERTIDA
    // ==========================================
    {
        id: 'g1-geo-u5-patrones',
        label: 'Patrones y Simetría',
        level: 14,
        type: 'basic',
        requires: ['g1-geo-ruedan-apilan'],
        description: 'Descubre secuencias de figuras, mitades mágicas y tamaños comparados.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'g1-geo-secuencias-formas',
        label: 'Secuencias de Formas',
        level: 15,
        type: 'basic',
        requires: ['g1-geo-u5-patrones'],
        description: 'Descubre qué figura sigue en collares y trenes: círculo, cuadrado, círculo, ¿qué sigue?',
        xOffset: -45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-simetria-espejo',
        label: 'Mitades Iguales y Espejo',
        level: 15,
        type: 'basic',
        requires: ['g1-geo-u5-patrones'],
        description: 'Doblar por la mitad: descubre las dos alas iguales de una mariposa y la simetría intuitiva.',
        xOffset: 45,
        behavior: 'quiz_list'
    },
    {
        id: 'g1-geo-comparar-tamanos',
        label: 'Grande, Mediano y Pequeño',
        level: 16,
        type: 'applied',
        requires: ['g1-geo-secuencias-formas', 'g1-geo-simetria-espejo'],
        description: 'Compara y ordena figuras y objetos por su tamaño y grosor en el espacio.',
        xOffset: 0,
        behavior: 'quiz_list'
    },

    // ==========================================
    // UNIDAD 6: GRAN MAESTRÍA DE GEOMETRÍA DE 1°
    // ==========================================
    {
        id: 'g1-geo-mastery',
        label: 'Corona Mágica de las Formas',
        level: 17,
        type: 'evaluation',
        requires: [],
        description: '¡El gran desafío final de los pequeños geómetras! Demuestra todo lo que aprendiste sobre formas, líneas y el espacio.',
        xOffset: 0,
        behavior: 'quiz_list'
    }
];

