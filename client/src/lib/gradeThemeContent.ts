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
