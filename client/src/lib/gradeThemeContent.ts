// client/src/lib/gradeThemeContent.ts

export function isFeminineTheme(themeId?: string | null): boolean {
  return themeId === 'amethyst-rose' || themeId === 'nebula-indigo';
}

export interface GradeThemeMeta {
  badge: string;
  title: string;
  emoji: string;
  description: string;
  legend: {
    title: string;
    unit: string;
    ready: string;
    inProgress: string;
    completed: string;
    locked: string;
    mastery: string;
  };
}

const GRADE_METAS: Record<string, { standard: GradeThemeMeta; feminine: GradeThemeMeta }> = {
  '1': {
    standard: {
      badge: 'Mundo de Exploradores • 1° de Primaria',
      title: 'Mundo de Exploradores • 1° de Primaria',
      emoji: '🗺️',
      description: 'Ruta de aprendizaje lúdica para 1° de Primaria: Conjuntos, Números hasta 999, Suma, Resta y Medidas.',
      legend: {
        title: 'Guía del Explorador',
        unit: '🏰 Unidad Temática',
        ready: '🚀 Listo para Jugar',
        inProgress: '🎯 En Progreso',
        completed: '⭐ ¡Misión Cumplida!',
        locked: '🔒 Nivel Bloqueado',
        mastery: '👑 Maestría de 1°'
      }
    },
    feminine: {
      badge: '🌸 Reino de Exploradoras • 1° de Primaria',
      title: 'Reino de Exploradoras • 1° de Primaria',
      emoji: '🌸',
      description: 'Ruta mágica para 1° de Primaria: Conjuntos, Números hasta 999, Suma, Resta y el mundo de las Medidas.',
      legend: {
        title: '🌸 Guía de la Exploradora',
        unit: '🏰 Palacio Temático',
        ready: '✨ Lista para Jugar',
        inProgress: '🎯 En Progreso',
        completed: '⭐ ¡Misión Superada, Campeona!',
        locked: '🔒 Nivel Bloqueado',
        mastery: '👑 Corona de Maestría de 1°'
      }
    }
  },
  '2': {
    standard: {
      badge: 'Misión Cósmica • 2° de Primaria',
      title: 'Misión Cósmica • 2° de Primaria',
      emoji: '🚀',
      description: '¡Viaja por la galaxia matemática, domina las tablas del 1 al 10, números hasta 99.999 y conquista las estrellas!',
      legend: {
        title: '🛰️ Radar Cósmico',
        unit: '🪐 Base Espacial / Sector',
        ready: '🚀 Nave Lista',
        inProgress: '🛸 En Órbita',
        completed: '🌟 Estrella Conquistada',
        locked: '🔒 Sector Bloqueado',
        mastery: '👑 Corona Galáctica de 2°'
      }
    },
    feminine: {
      badge: '✨ Odisea Estelar • 2° de Primaria',
      title: 'Odisea Estelar • 2° de Primaria',
      emoji: '✨',
      description: '¡Viaja por las constelaciones mágicas, domina las tablas del 1 al 10, números hasta 99.999 y brilla entre las estrellas!',
      legend: {
        title: '✨ Brújula Estelar',
        unit: '🌌 Sector de las Estrellas',
        ready: '🚀 Lista para el Despegue',
        inProgress: '🛸 En Constelación',
        completed: '🌟 Estrella Mágica Conquistada',
        locked: '🔒 Sector Bloqueado',
        mastery: '👑 Corona Estelar de 2°'
      }
    }
  },
  '3': {
    standard: {
      badge: 'Expedición Submarina • 3° de Primaria',
      title: 'Expedición Submarina • 3° de Primaria',
      emoji: '🌊',
      description: '¡Sumérgete en los misterios del océano matemático, domina la división, números romanos, fracciones y tesoros numéricos!',
      legend: {
        title: '🧭 Brújula Marina',
        unit: '🫧 Arrecife / Base Marina',
        ready: '🐬 Explorador en Marcha',
        inProgress: '🌊 En Inmersión',
        completed: '💎 Perla Conquistada',
        locked: '🔒 Gruta Cerrada',
        mastery: '👑 Tridente de Maestría de 3°'
      }
    },
    feminine: {
      badge: '🧜‍♀️ Reino del Océano Mágico • 3° de Primaria',
      title: 'Reino del Océano de Cristal • 3°',
      emoji: '🧜‍♀️',
      description: '¡Sumérgete en el océano de cristal, domina la división, números romanos, fracciones y descubre perlas matemáticas!',
      legend: {
        title: '🧜‍♀️ Guía Marina de Cristal',
        unit: '🫧 Arrecife de Coral Mágico',
        ready: '🐬 Exploradora en Marcha',
        inProgress: '🌊 En Inmersión Mágica',
        completed: '💎 Perla Luminosa Conquistada',
        locked: '🔒 Gruta Bloqueada',
        mastery: '👑 Corona del Océano de 3°'
      }
    }
  },
  '4': {
    standard: {
      badge: 'Templo de Exploradores • 4° de Primaria',
      title: 'Templo de los Exploradores • 4° de Primaria',
      emoji: '🏛️',
      description: '¡Descubre los misterios de los templos antiguos, domina la división formal, MCM/MCD, fracciones, decimales y conquista el Gran Cetro!',
      legend: {
        title: '🗺️ Mapa del Explorador',
        unit: '🏛️ Templo / Santuario',
        ready: '🧭 Misión Lista',
        inProgress: '🏺 En Exploración',
        completed: '🏆 Reliquia Conquistada',
        locked: '🔒 Cámara Bloqueada',
        mastery: '👑 Cetro de Maestría de 4°'
      }
    },
    feminine: {
      badge: '💎 Santuario de las Aventureras • 4° de Primaria',
      title: 'Santuario de las Aventureras • 4° de Primaria',
      emoji: '💎',
      description: '¡Descubre los templos de gemas y luz, domina la división formal, MCM/MCD, fracciones, decimales y conquista el Gran Cetro!',
      legend: {
        title: '🗺️ Mapa de la Aventurera',
        unit: '🏛️ Santuario de Gemas',
        ready: '🧭 Aventurera Lista',
        inProgress: '🏺 En Exploración',
        completed: '💎 Reliquia Conquistada',
        locked: '🔒 Cámara Bloqueada',
        mastery: '👑 Cetro de Maestría de 4°'
      }
    }
  },
  '5': {
    standard: {
      badge: 'Mundo de Aventuras • 5° de Primaria',
      title: 'Mundo de Aventuras • 5° de Primaria',
      emoji: '🗺️',
      description: '¡Explora los temas, supera cada misión matemática y conquista la Gran Corona de Maestría!',
      legend: {
        title: 'Guía del Explorador',
        unit: '🏰 Unidad Temática',
        ready: '🚀 Listo para Jugar',
        inProgress: '🎯 En Progreso',
        completed: '⭐ ¡Misión Cumplida!',
        locked: '🔒 Nivel Bloqueado',
        mastery: '👑 Gran Corona de 5°'
      }
    },
    feminine: {
      badge: '👑 Reino de Aventuras • 5° de Primaria',
      title: 'Reino de Aventuras Matemáticas • 5°',
      emoji: '👑',
      description: '¡Explora los reinos matemáticos, supera cada desafío con ingenio y conquista la Gran Corona de Maestría!',
      legend: {
        title: '👑 Guía de la Aventurera',
        unit: '🏰 Castillo Temático',
        ready: '✨ Lista para Jugar',
        inProgress: '🎯 En Progreso',
        completed: '⭐ ¡Misión Superada, Campeona!',
        locked: '🔒 Nivel Bloqueado',
        mastery: '👑 Gran Corona de Maestría de 5°'
      }
    }
  },
  '6': {
    standard: {
      badge: 'Ciber-Nexo Matemático • 6° Grado',
      title: 'La Ciudadela Cuántica • 6° Grado',
      emoji: '⚡',
      description: '¡Bienvenido a la secundaria cuántica! Domina proposiciones lógicas, polinomios, ecuaciones, divisibilidad, fracciones, decimales, enteros y educación financiera.',
      legend: {
        title: '🗺️ Terminal Cuántica',
        unit: '⚡ Núcleo / Bastión Cuántico',
        ready: '🔋 Misión en Línea',
        inProgress: '⚙️ En Decodificación',
        completed: '💎 Algoritmo Conquistado',
        locked: '🔒 Cortafuegos Bloqueado',
        mastery: '👑 Núcleo Cuántico Supremo'
      }
    },
    feminine: {
      badge: '⚡ Nexo Cuántico • 6° Grado',
      title: 'La Ciudadela Cuántica • 6° Grado',
      emoji: '⚡',
      description: '¡Bienvenida a la secundaria cuántica! Domina proposiciones lógicas, polinomios, ecuaciones, divisibilidad, fracciones, decimales, enteros y educación financiera.',
      legend: {
        title: '🗺️ Terminal de la Conquistadora',
        unit: '⚡ Núcleo de Energía Cuántica',
        ready: '🔋 Misión Lista',
        inProgress: '⚙️ En Decodificación',
        completed: '💎 Algoritmo Conquistado',
        locked: '🔒 Cortafuegos Bloqueado',
        mastery: '👑 Corona Cuántica de 6°'
      }
    }
  },
  '7': {
    standard: {
      badge: 'La Forja Titánica • 7° Grado',
      title: 'La Forja de los Titanes • 7° Grado',
      emoji: '🛡️',
      description: '¡Desafío titánico de 7° grado! Domina los números enteros (ℤ), racionales (ℚ), proporcionalidad, regla de tres, magnitudes y el despertar del álgebra.',
      legend: {
        title: '🗺️ Códice de los Titanes',
        unit: '🛡️ Bastión / Fortaleza Titánica',
        ready: '⚔️ Misión Forjada',
        inProgress: '🌋 En Fundición',
        completed: '🏆 Reliquia Conquistada',
        locked: '🔒 Sello Rúnico Bloqueado',
        mastery: '👑 Corona Titánica de 7°'
      }
    },
    feminine: {
      badge: '🛡️ La Forja de las Titanes • 7° Grado',
      title: 'La Forja de las Titanes • 7° Grado',
      emoji: '🛡️',
      description: '¡Gran desafío de 7° grado! Domina los números enteros (ℤ), racionales (ℚ), proporcionalidad, regla de tres, magnitudes y el despertar del álgebra.',
      legend: {
        title: '🗺️ Códice de las Titanes',
        unit: '🛡️ Bastión / Fortaleza de las Titanes',
        ready: '⚔️ Misión Lista',
        inProgress: '🌋 En Creación',
        completed: '🏆 Reliquia Conquistada',
        locked: '🔒 Sello Rúnico Bloqueado',
        mastery: '👑 Corona de las Titanes'
      }
    }
  },
  '8': {
    standard: {
      badge: 'La Odisea del Álgebra • 8° Grado',
      title: 'La Odisea del Álgebra • 8° Grado',
      emoji: '🌀',
      description: '¡Inmersión en el álgebra formal! Domina números reales (ℝ), notación científica, operaciones de polinomios, productos notables, factorización sistemática, fracciones algebraicas y funciones.',
      legend: {
        title: '🗺️ Códice del Álgebra',
        unit: '🌀 Dominio / Bloque Algebraico',
        ready: '⚔️ Misión Algebraica',
        inProgress: '🔮 En Resolución',
        completed: '🏆 Desafío Conquistado',
        locked: '🔒 Dominio Bloqueado',
        mastery: '👑 Cetro del Álgebra de 8°'
      }
    },
    feminine: {
      badge: '🔮 La Odisea del Álgebra • 8° Grado',
      title: 'La Odisea del Álgebra • 8° Grado',
      emoji: '🔮',
      description: '¡Inmersión en el álgebra formal! Domina números reales (ℝ), notación científica, operaciones de polinomios, productos notables, factorización sistemática, fracciones algebraicas y funciones.',
      legend: {
        title: '🔮 Códice de la Conquistadora',
        unit: '🌀 Dominio Algebraico',
        ready: '✨ Misión Algebraica Lista',
        inProgress: '🔮 En Resolución',
        completed: '🏆 Desafío Conquistado',
        locked: '🔒 Dominio Bloqueado',
        mastery: '👑 Cetro del Álgebra de 8°'
      }
    }
  },
  '9': {
    standard: {
      badge: 'El Vórtice del Álgebra Superior • 9° Grado',
      title: 'El Vórtice del Álgebra Superior • 9° Grado',
      emoji: '✨',
      description: '¡Desafío culminante de secundaria! Domina radicales, sistemas 2x2, la recta analítica, ecuaciones cuadráticas, exponenciales, logaritmos, sucesiones y finanzas.',
      legend: {
        title: '🗺️ Códice del Álgebra Superior',
        unit: '🌀 Dominio / Bloque Algebraico',
        ready: '⚔️ Misión de Álgebra Superior',
        inProgress: '🔮 En Resolución',
        completed: '🏆 Desafío Conquistado',
        locked: '🔒 Dominio Bloqueado',
        mastery: '👑 Corona Suprema de Secundaria'
      }
    },
    feminine: {
      badge: '👑 Vórtice del Álgebra Superior • 9° Grado',
      title: 'El Vórtice del Álgebra Superior • 9° Grado',
      emoji: '✨',
      description: '¡Desafío culminante de secundaria! Domina radicales, sistemas 2x2, la recta analítica, ecuaciones cuadráticas, exponenciales, logaritmos, sucesiones y finanzas.',
      legend: {
        title: '👑 Códice Supremo del Álgebra',
        unit: '🌀 Dominio Algebraico',
        ready: '✨ Misión Superior Lista',
        inProgress: '🔮 En Resolución',
        completed: '🏆 Desafío Conquistado',
        locked: '🔒 Dominio Bloqueado',
        mastery: '👑 Corona Suprema de Secundaria'
      }
    }
  }
};

export function getGradeThemeMeta(gradeId: string, themeId?: string | null): GradeThemeMeta | null {
  const meta = GRADE_METAS[gradeId];
  if (!meta) return null;
  return isFeminineTheme(themeId) ? meta.feminine : meta.standard;
}

const GEOMETRY_METAS: Record<string, GradeThemeMeta> = {
  '1': {
    badge: '🎨 El Reino de las Formas • 1° de Primaria (6 años)',
    title: 'El Reino de las Formas • 1° Grado',
    emoji: '🎨',
    description: '¡Juega, explora y descubre figuras mágicas! Aprende arriba y abajo, izquierda y derecha, líneas divertidas, círculos, cuadrados y cuerpos que ruedan.',
    legend: {
      title: '🗺️ Guía de los Pequeños Geómetras',
      unit: '🏰 Castillo de las Formas',
      ready: '🎨 Misión de Figuras Lista',
      inProgress: '✏️ En Trazo y Dibujo',
      completed: '⭐ ¡Figura Descubierta!',
      locked: '🔒 Cofre de Formas Bloqueado',
      mastery: '👑 Corona Mágica de las Formas'
    }
  },
  '2': {
    badge: '📐 Elementos y Figuras Planas • 2° de Primaria',
    title: 'El Taller de las Figuras • 2° Grado',
    emoji: '📐',
    description: 'Puntos, líneas, segmentos, figuras planas, lados, vértices, cuerpos geométricos y simetría intuitiva.',
    legend: {
      title: '🗺️ Códice de la Geometría',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '⭐ ¡Misión Geométrica Conquistada!',
      locked: '🔒 Sector Bloqueado',
      mastery: '👑 Corona Geométrica de 2°'
    }
  },
  '3': {
    badge: '📐 Medición y Propiedades • 3° de Primaria',
    title: 'La Brújula Geométrica • 3° Grado',
    emoji: '📐',
    description: 'Semirrectas, segmentos, clasificación de ángulos, polígonos, círculos y perímetros de figuras.',
    legend: {
      title: '🗺️ Códice de la Geometría',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '💎 Reliquia Geométrica',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Geométrica de 3°'
    }
  },
  '4': {
    badge: '📐 Geometría Instrumental y Medición • 4° de Primaria (9 años)',
    title: 'El Templo de las Medidas • 4° Grado',
    emoji: '📐',
    description: 'El transportador, grados sexagesimales, rectas paralelas y perpendiculares, triángulos y suma angular (180°), polígonos, transformaciones en el plano, fórmulas de perímetro y área, y noción de volumen.',
    legend: {
      title: '🗺️ Códice de la Geometría',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Geométrica de 4°'
    }
  },
  '5': {
    badge: '📐 Geometría Analítica, Medición y Volumen • 5° de Primaria (10 años)',
    title: 'La Ciudadela de las Dimensiones • 5° Grado',
    emoji: '📐',
    description: 'Relaciones angulares, jerarquía de cuadriláteros, circunferencia y el número π, plano cartesiano y homotecias, áreas de polígonos especiales, área superficial y cálculo formal de volumen con capacidad.',
    legend: {
      title: '🗺️ Códice de la Geometría',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Gran Corona de la Geometría de 5°'
    }
  },
  '6': {
    badge: '📐 Geometría Euclidiana, Isometrías y Sólidos • 6° de Secundaria (11 años)',
    title: 'El Nexo de la Geometría Euclidiana • 6° Grado',
    emoji: '📐',
    description: 'Ángulos entre paralelas y transversal, teoremas del triángulo y puntos notables, familias de cuadriláteros, plano cartesiano completo (4 cuadrantes), isometrías, áreas con apotema, círculo, área superficial y volumen de prismas y cilindros.',
    legend: {
      title: '🗺️ Códice de la Geometría de 6°',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Teorema Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Gran Corona de la Geometría de 6°'
    }
  },
  '7': {
    badge: '📐 Relaciones Angulares y Métrica • 7° Grado',
    title: 'La Forja de la Proporcionalidad • 7° Grado',
    emoji: '📐',
    description: 'Rectas paralelas cortadas por secante, ángulos en triángulos, semejanza, Teorema de Tales y cuerpos redondos.',
    legend: {
      title: '🗺️ Códice de la Geometría',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Teorema Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Titánica de Geometría de 7°'
    }
  },
  '8': {
    badge: '📐 Razonamiento y Teoremas • 8° Grado',
    title: 'El Universo de la Geometría • 8° Grado',
    emoji: '📐',
    description: 'Demostraciones, criterios de congruencia y semejanza, Teorema de Tales, Teorema de Pitágoras y áreas compuestas.',
    legend: {
      title: '🗺️ CÓDICE DE LA GEOMETRÍA',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Teorema Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Cetro de la Geometría de 8°'
    }
  },
  '9': {
    badge: '📐 Geometría Analítica y Razonamiento • 9° Grado',
    title: 'El Universo de la Geometría • 9° Grado',
    emoji: '📐',
    description: 'Plano cartesiano avanzado, distancia entre puntos, punto medio, pendiente, ecuación de la recta, paralelismo analítico y trigonometría.',
    legend: {
      title: '🗺️ CÓDICE DE LA GEOMETRÍA',
      unit: '📐 Dominio Geométrico',
      ready: '📐 Desafío Geométrico',
      inProgress: '✏️ En Construcción',
      completed: '🏆 Teorema Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Suprema de la Geometría de 9°'
    }
  }
};

const GEOMETRY_MOTHER_META: GradeThemeMeta = {
  badge: '📐 El Gran Códice de la Geometría • 1° a 11°',
  title: 'Super Mapa de Geometría',
  emoji: '📐',
  description: 'El universo de las formas, el espacio, las dimensiones, construcciones euclidianas y geometría analítica.',
  legend: {
    title: '🗺️ CÓDICE DE LA GEOMETRÍA',
    unit: '📐 Macro-Dominio Geométrico',
    ready: '📐 Desafío Geométrico',
    inProgress: '✏️ En Construcción',
    completed: '🏆 Teorema Conquistado',
    locked: '🔒 Dominio Bloqueado',
    mastery: '👑 Pantocrátor del Espacio y la Forma'
  }
};

export function getGeometryThemeMeta(gradeId?: string | null, _themeId?: string | null): GradeThemeMeta {
  if (gradeId && GEOMETRY_METAS[gradeId]) {
    return GEOMETRY_METAS[gradeId];
  }
  return GEOMETRY_MOTHER_META;
}

const STATISTICS_METAS: Record<string, GradeThemeMeta> = {
  '1': {
    badge: '🧸 El Club del Conteo y los Datos • 1° de Primaria (6 años)',
    title: 'El Club del Conteo • 1° Grado',
    emoji: '🧸',
    description: '¡Conviértete en un pequeño detective de datos! Aprende a agrupar juguetes por color, contar con palitos, leer dibujos en pictogramas y descubrir qué tiene más o menos.',
    legend: {
      title: '🗺️ Guía del Pequeño Investigador',
      unit: '📊 Rincón de Conteo',
      ready: '🧸 Reto de Conteo Listo',
      inProgress: '🔍 En Búsqueda y Conteo',
      completed: '⭐ ¡Dato Descubierto!',
      locked: '🔒 Rincón Bloqueado',
      mastery: '👑 Medalla de Oro del Conteo'
    }
  },
  '2': {
    badge: '📊 Tablas y Gráficos Básicos • 2° de Primaria',
    title: 'El Mundo de los Datos • 2° Grado',
    emoji: '📊',
    description: 'Tablas de doble entrada, gráficos de barras simples, interpretación y noción intuitiva de probabilidad.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '⭐ ¡Gráfico Conquistado!',
      locked: '🔒 Nivel Bloqueado',
      mastery: '👑 Corona de Estadística de 2°'
    }
  },
  '3': {
    badge: '📊 Frecuencias y Gráficos de Barras • 3° de Primaria',
    title: 'El Mundo de los Datos • 3° Grado',
    emoji: '📊',
    description: 'Tablas de frecuencias simples, gráficos de barras verticales y horizontales, moda intuitiva y eventos seguros o imposibles.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '💎 Reliquia de Datos',
      locked: '🔒 Nivel Bloqueado',
      mastery: '👑 Corona de Estadística de 3°'
    }
  },
  '4': {
    badge: '📊 Organización de Datos y Probabilidad • 4° Grado',
    title: 'El Mundo de los Datos • 4° Grado',
    emoji: '📊',
    description: 'Variables cualitativas y cuantitativas discretas, gráficos de líneas, moda, promedio intuitivo y probabilidad experimental.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Nivel Bloqueado',
      mastery: '👑 Corona de Estadística de 4°'
    }
  },
  '5': {
    badge: '📊 Tendencia Central y Gráficos Circulares • 5° Grado',
    title: 'El Mundo de la Estadística • 5° Grado',
    emoji: '📊',
    description: 'Media aritmética, mediana, moda, gráficos circulares, diagramas de tallo y hojas y cálculo de probabilidades simples.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona de Estadística de 5°'
    }
  },
  '6': {
    badge: '📊 Población, Muestra y Frecuencias • 6° Grado',
    title: 'El Mundo de la Estadística • 6° Grado',
    emoji: '📊',
    description: 'Población y muestra, tablas de frecuencias absolutas y relativas, histogramas, polígonos de frecuencias y probabilidad elemental.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona de Estadística de 6°'
    }
  },
  '7': {
    badge: '📊 Medidas de Tendencia Central y Dispersión • 7° Grado',
    title: 'El Mundo de la Estadística • 7° Grado',
    emoji: '📊',
    description: 'Media, mediana y moda para datos agrupados y no agrupados, rango, diagramas de dispersión y probabilidad teórica.',
    legend: {
      title: '🗺️ Códice de la Estadística',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Titánica de Estadística de 7°'
    }
  },
  '8': {
    badge: '📊 Muestreo, Medidas y Probabilidad • 8° Grado',
    title: 'El Mundo de los Datos y la Estadística • 8° Grado',
    emoji: '📊',
    description: 'Técnicas de muestreo, medidas de posición (cuartiles, percentiles), varianza, desviación estándar y regla de Laplace.',
    legend: {
      title: '🗺️ CÓDICE DE LA ESTADÍSTICA',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Cetro de la Estadística de 8°'
    }
  },
  '9': {
    badge: '📊 Regresión, Inferencia y Probabilidad • 9° Grado',
    title: 'El Mundo de los Datos y la Estadística • 9° Grado',
    emoji: '📊',
    description: 'Correlación lineal, recta de regresión, probabilidad condicional, regla de Bayes y análisis de distribuciones.',
    legend: {
      title: '🗺️ CÓDICE DE LA ESTADÍSTICA',
      unit: '📊 Dominio Estadístico',
      ready: '📈 Misión Estadística',
      inProgress: '🔍 En Análisis',
      completed: '🏆 Desafío Conquistado',
      locked: '🔒 Dominio Bloqueado',
      mastery: '👑 Corona Suprema de Estadística de 9°'
    }
  }
};

const STATISTICS_MOTHER_META: GradeThemeMeta = {
  badge: '📊 El Gran Universo de los Datos y la Probabilidad',
  title: 'Super Mapa de Estadística',
  emoji: '📊',
  description: 'Desde el conteo y la recolección de datos hasta la inferencia estadística, distribuciones y probabilidad avanzada.',
  legend: {
    title: '🗺️ CÓDICE DE LA ESTADÍSTICA',
    unit: '📊 Macro-Dominio Estadístico',
    ready: '📈 Misión Estadística',
    inProgress: '🔍 En Análisis',
    completed: '🏆 Análisis Conquistado',
    locked: '🔒 Dominio Bloqueado',
    mastery: '👑 Oráculo Maestro de los Datos'
  }
};

export function getStatisticsThemeMeta(gradeId?: string | null, _themeId?: string | null): GradeThemeMeta {
  if (gradeId && STATISTICS_METAS[gradeId]) {
    return STATISTICS_METAS[gradeId];
  }
  return STATISTICS_MOTHER_META;
}
