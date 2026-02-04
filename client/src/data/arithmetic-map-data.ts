
export interface ArithmeticNode {
    id: string;
    label: string;
    level: number;
    type: 'basic' | 'critical' | 'evaluation' | 'applied';
    requires: string[];
    subcategoryId?: number; // Maps to existing database subcategory ID if available
    additionalSubcategories?: number[]; // Additional subcategories to include content from
    description?: string;
    xOffset?: number; // Horizontal positioning adjustment (-100 to 100)
    filterKeywords?: string[]; // Keywords to filter quizzes by title
    excludeKeywords?: string[]; // Keywords to EXCLUDE quizzes
    behavior?: 'container' | 'quiz_list';
}

export const arithmeticMapNodes: ArithmeticNode[] = [
    // ==========================================
    // NIVEL 0: SISTEMA NUMÉRICO
    // ==========================================
    {
        id: 'n1-naturales',
        label: 'Números Naturales',
        level: 0,
        type: 'basic',
        requires: [],
        description: 'Los bloques de construcción básicos del conteo.',
        xOffset: 0,
        subcategoryId: 1,
        filterKeywords: ['naturales'],
        behavior: 'container'
    },

    // ==========================================
    // NIVEL 1: OPERACIONES BÁSICAS
    // ==========================================
    {
        id: 'n2-suma',
        label: 'Suma y Resta',
        level: 1,
        type: 'basic',
        requires: ['n1-naturales'],
        description: 'Adición y sustracción fundamental.',
        xOffset: -50,
        subcategoryId: 1,
        filterKeywords: ['suma', 'resta', 'adición', 'sustracción'],
        behavior: 'quiz_list'
    },
    {
        id: 'n2-multi',
        label: 'Multiplicación y División',
        level: 1,
        type: 'basic',
        requires: ['n1-naturales'],
        description: 'Operaciones multiplicativas básicas.',
        xOffset: 50,
        subcategoryId: 1,
        filterKeywords: ['multiplicación', 'división', 'division', 'divisiones', 'producto', 'cociente'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 2: ENTEROS
    // ==========================================
    {
        id: 'n4-enteros',
        label: 'Números Enteros',
        level: 2,
        type: 'basic',
        requires: ['n2-suma', 'n2-multi'],
        description: 'El mundo de los números negativos.',
        xOffset: 0,
        subcategoryId: 1,
        filterKeywords: ['entero'],
        behavior: 'container'
    },

    // Children of Enteros
    {
        id: 'n1-recta',
        label: 'Recta Numérica',
        level: 3,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Ubicación y orden en la línea.',
        xOffset: -60,
        behavior: 'quiz_list'
    },
    {
        id: 'n3-jerarquia',
        label: 'Jerarquía',
        level: 3,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Orden correcto (PEMDAS).',
        xOffset: 0,
        subcategoryId: 6,
        filterKeywords: ['jerarquía', 'combinada', 'orden'],
        behavior: 'quiz_list'
    },
    {
        id: 'n3-propiedades',
        label: 'Propiedades',
        level: 3,
        type: 'basic',
        requires: ['n4-enteros'],
        description: 'Conmutativa, Asociativa, Distributiva.',
        xOffset: 60,
        subcategoryId: 5,
        filterKeywords: ['propiedad'],
        behavior: 'quiz_list'
    },

    // Standard Enteros Content
    {
        id: 'n4-intro-neg',
        label: 'Intro a Negativos',
        level: 4,
        type: 'basic',
        requires: ['n1-recta'],
        description: 'Concepto de deuda y temperatura.',
        xOffset: -40,
        subcategoryId: 1,
        filterKeywords: ['introducción', 'concepto'],
        behavior: 'quiz_list'
    },
    {
        id: 'n4-ops-enteros',
        label: 'Operaciones Enteros',
        level: 4,
        type: 'basic',
        requires: ['n3-propiedades'],
        description: 'Suma, resta, mult y div con signos.',
        xOffset: 40,
        subcategoryId: 1,
        filterKeywords: ['problema', 'division', 'resta', 'suma'],
        behavior: 'quiz_list'
    },
    {
        id: 'n4-parentesis',
        label: 'Uso de Paréntesis',
        level: 5,
        type: 'critical',
        requires: ['n4-ops-enteros'],
        description: 'Signos de agrupación en enteros.',
        xOffset: 0,
        subcategoryId: 5,
        filterKeywords: ['paréntesis'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 6: FRACCIONES
    // ==========================================
    {
        id: 'n5-fracciones',
        label: 'Fracciones',
        level: 6,
        type: 'critical',
        requires: ['n4-parentesis'],
        description: 'Partes de un todo.',
        xOffset: 0,
        subcategoryId: 3,
        filterKeywords: ['fracci'],
        behavior: 'container'
    },
    {
        id: 'n5-concepto',
        label: 'Concepto',
        level: 7,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Numerador y denominador.',
        xOffset: -50,
        subcategoryId: 3,
        filterKeywords: ['intro', 'concepto'],
        behavior: 'quiz_list'
    },
    {
        id: 'n5-equiv',
        label: 'Equivalencia',
        level: 7,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Simplificación y amplificación.',
        xOffset: 0,
        subcategoryId: 3,
        filterKeywords: ['equivalente', 'simplific'],
        behavior: 'quiz_list'
    },
    {
        id: 'n5-ops',
        label: 'Operaciones',
        level: 7,
        type: 'basic',
        requires: ['n5-fracciones'],
        description: 'Suma, resta, prod, div.',
        xOffset: 50,
        subcategoryId: 3,
        filterKeywords: ['producto', 'suma', 'resta', 'heterogénea', 'división'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 8: DECIMALES
    // ==========================================
    {
        id: 'n6-decimales',
        label: 'Decimales',
        level: 8,
        type: 'basic',
        requires: ['n5-ops'],
        description: 'Números con punto decimal.',
        xOffset: 0,
        subcategoryId: 2,
        filterKeywords: ['decimal'],
        behavior: 'container'
    },
    {
        id: 'n6-ops',
        label: 'Cálculo Decimal',
        level: 9,
        type: 'basic',
        requires: ['n6-decimales'],
        description: 'Operaciones con punto.',
        xOffset: 0,
        subcategoryId: 2,
        filterKeywords: ['problema', 'operacion'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 10: PORCENTAJES
    // ==========================================
    {
        id: 'n7-porcentajes',
        label: 'Porcentajes',
        level: 10,
        type: 'basic',
        requires: ['n6-ops'],
        description: 'Tanto por ciento (%).',
        xOffset: 0,
        filterKeywords: ['porcentaje'],
        behavior: 'container'
    },

    // ==========================================
    // NIVEL 11: RAZONES Y PROPORCIONES
    // ==========================================
    {
        id: 'n8-razones',
        label: 'Razones',
        level: 11,
        type: 'basic',
        requires: ['n7-porcentajes'],
        description: 'Comparación y escala.',
        xOffset: -30,
        filterKeywords: ['razon'],
        behavior: 'quiz_list'
    },
    {
        id: 'n8-prop',
        label: 'Proporciones',
        level: 11,
        type: 'basic',
        requires: ['n7-porcentajes'],
        description: 'Regla de tres.',
        xOffset: 30,
        filterKeywords: ['proporcion'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 12: POTENCIAS Y RAÍCES
    // ==========================================
    {
        id: 'n9-main',
        label: 'Potencias y Raíces',
        level: 12,
        type: 'basic',
        requires: ['n8-prop', 'n8-razones'],
        description: 'Exponentes y radicales.',
        xOffset: 0,
        subcategoryId: 8,
        filterKeywords: ['potencia', 'radical'],
        behavior: 'container'
    },
    {
        id: 'n9-potencias',
        label: 'Potencias',
        level: 13,
        type: 'basic',
        requires: ['n9-main'],
        description: 'Leyes de exponentes.',
        xOffset: -40,
        subcategoryId: 8,
        filterKeywords: ['potencia', 'exponente'],
        behavior: 'quiz_list'
    },
    {
        id: 'n9-radicales',
        label: 'Radicales',
        level: 13,
        type: 'basic',
        requires: ['n9-main'],
        description: 'Raíces y racionalización.',
        xOffset: 40,
        subcategoryId: 7,
        filterKeywords: ['radical', 'raíz', 'transformación', 'racionalización'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 14: ESTRUCTURA NUMÉRICA & ALGEBRA
    // ==========================================
    {
        id: 'n10-estruct',
        label: 'Estructura',
        level: 14,
        type: 'basic',
        requires: ['n9-potencias', 'n9-radicales'],
        description: 'Divisibilidad y factorización.',
        xOffset: 0,
        subcategoryId: 4,
        filterKeywords: ['factor', 'primo'],
        behavior: 'container'
    },
    {
        id: 'n10-mcd',
        label: 'MCM y MCD',
        level: 15,
        type: 'basic',
        requires: ['n10-estruct'],
        description: 'Problemas de aplicación.',
        xOffset: -30,
        subcategoryId: 4,
        filterKeywords: ['mcm', 'mcd', 'problema'],
        behavior: 'quiz_list'
    },
    {
        id: 'n10-plano',
        label: 'Plano Cartesiano',
        level: 15,
        type: 'applied',
        requires: ['n10-estruct'],
        description: 'Coordenadas y transformación.',
        xOffset: 30,
        subcategoryId: 11,
        filterKeywords: ['plano', 'transformación'],
        behavior: 'quiz_list'
    },

    // ==========================================
    // NIVEL 16: APLICACIONES
    // ==========================================
    {
        id: 'n11-aplica',
        label: 'Aplicaciones',
        level: 16,
        type: 'applied',
        requires: ['n10-mcd'],
        description: 'Matemáticas en la vida real.',
        xOffset: 0,
        behavior: 'container'
    },
    {
        id: 'n11-finanzas',
        label: 'Finanzas',
        level: 17,
        type: 'applied',
        requires: ['n11-aplica'],
        description: 'Interés y dinero.',
        xOffset: -40,
        filterKeywords: ['finanza', 'dinero'],
        behavior: 'quiz_list'
    },
    {
        id: 'n11-conv',
        label: 'Conversión',
        level: 17,
        type: 'applied',
        requires: ['n11-aplica'],
        description: 'Unidades de medida.',
        xOffset: 40,
        filterKeywords: ['conversión', 'unidad'],
        behavior: 'quiz_list'
    },

    // Final Evaluation
    {
        id: 'n12-master',
        label: 'Dominio Aritmético',
        level: 18,
        type: 'evaluation',
        requires: ['n11-finanzas', 'n11-conv'],
        description: 'Prueba final de todo el módulo.',
        xOffset: 0,
        filterKeywords: ['final', 'evaluación'],
        behavior: 'quiz_list'
    }
];
