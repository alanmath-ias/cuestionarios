import { db } from "../server/db.js";
import { quizzes, questions, answers } from "../shared/schema.js";

async function addFunctionsQuizzes() {
  console.log("Iniciando inserción de cuestionarios de Funciones...");

  try {
    // --- QUIZ 500: Concepto de Función: Fundamentos ---
    const quiz500 = await db.insert(quizzes).values({
      id: 500,
      title: "Concepto de Función: Fundamentos",
      description: "Aprende a identificar funciones mediante diagramas, tablas y gráficas. ¡La base de todo!",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Básica",
      totalQuestions: 12,
      timeLimit: 2700,
      order: 1
    }).returning();

    // Pregunta 1
    const q5931 = await db.insert(questions).values({
      id: 5931,
      quizId: 500,
      content: "¿Es la relación mostrada en el diagrama de Venn una función?",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5931_Q1_No_Funcion_Venn.png",
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27164, questionId: 5931, content: "No, porque un elemento del dominio tiene múltiples imágenes.", isCorrect: true },
      { id: 27165, questionId: 5931, content: "Sí, todos los elementos tienen salida.", isCorrect: false },
      { id: 27166, questionId: 5931, content: "Sí, es una función inyectiva.", isCorrect: false },
      { id: 27167, questionId: 5931, content: "No, le faltan elementos al codominio.", isCorrect: false }
    ]);

    // Pregunta 2
    const q5932 = await db.insert(questions).values({
      id: 5932,
      quizId: 500,
      content: "Determine si el conjunto de pares ordenados ¡\{(1, 2), (2, 3), (1, 4)\}¡ representa una función.",
      type: "multiple_choice",
      difficulty: 1,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27168, questionId: 5932, content: "No es una función porque el ¡1¡ se repite con diferentes salidas.", isCorrect: true },
      { id: 27169, questionId: 5932, content: "Sí es una función, hay ¡3¡ pares ordenados.", isCorrect: false },
      { id: 27170, questionId: 5932, content: "Sí, es una función lineal.", isCorrect: false },
      { id: 27171, questionId: 5932, content: "No, porque falta el ¡0¡.", isCorrect: false }
    ]);

    // Pregunta 3
    const q5933 = await db.insert(questions).values({
      id: 5933,
      quizId: 500,
      content: "Complete la definición: Una función es una relación donde a cada entrada le corresponde...",
      type: "multiple_choice",
      difficulty: 1,
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27172, questionId: 5933, content: "exactamente una salida.", isCorrect: true },
      { id: 27173, questionId: 5933, content: "al menos dos salidas.", isCorrect: false },
      { id: 27174, questionId: 5933, content: "cualquier número de salidas.", isCorrect: false },
      { id: 27175, questionId: 5933, content: "ninguna salida.", isCorrect: false }
    ]);

    // Pregunta 4
    const q5934 = await db.insert(questions).values({
      id: 5934,
      quizId: 500,
      content: "Si una persona tiene el mismo nombre que otra, pero viven en ciudades distintas, ¿es el domicilio una función del nombre?",
      type: "multiple_choice",
      difficulty: 1,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27176, questionId: 5934, content: "No, porque una misma entrada (nombre) puede tener diferentes salidas (ciudades).", isCorrect: true },
      { id: 27177, questionId: 5934, content: "Sí, cada persona tiene un nombre.", isCorrect: false },
      { id: 27178, questionId: 5934, content: "Sí, siempre que no se muden.", isCorrect: false },
      { id: 27179, questionId: 5934, content: "No, el nombre no es un número.", isCorrect: false }
    ]);

    // Pregunta 5
    const q5935 = await db.insert(questions).values({
      id: 5935,
      quizId: 500,
      content: "Según la prueba de la línea vertical, si una línea vertical cruza la gráfica en dos o más puntos, la gráfica:",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5932_Q5_Test_Linea_Vertical.png",
      order: 5
    }).returning();

    await db.insert(answers).values([
      { id: 27180, questionId: 5935, content: "no representa una función.", isCorrect: true },
      { id: 27181, questionId: 5935, content: "representa una función cuadrática.", isCorrect: false },
      { id: 27182, questionId: 5935, content: "es una función constante.", isCorrect: false },
      { id: 27183, questionId: 5935, content: "sigue siendo una función.", isCorrect: false }
    ]);

    // Pregunta 6
    const q5936 = await db.insert(questions).values({
      id: 5936,
      quizId: 500,
      content: "¿Es la relación constante ¡f(x) = 5¡ una función?",
      type: "multiple_choice",
      difficulty: 1,
      order: 6
    }).returning();

    await db.insert(answers).values([
      { id: 27184, questionId: 5936, content: "Sí, porque a cada ¡x¡ le corresponde una única salida (el ¡5¡).", isCorrect: true },
      { id: 27185, questionId: 5936, content: "No, porque todas las ¡x¡ tienen la misma ¡y¡.", isCorrect: false },
      { id: 27186, questionId: 5936, content: "No, porque no hay una variable ¡y¡ en la expresión.", isCorrect: false },
      { id: 27187, questionId: 5936, content: "Sí, es una función inyectiva.", isCorrect: false }
    ]);

    // Pregunta 7
    const q5937 = await db.insert(questions).values({
      id: 5937,
      quizId: 500,
      content: "Analice la relación: ¡\{(Manzana, 2 €), (Pera, 2 €), (Uva, 3 €)\}¡. ¿Es función?",
      type: "multiple_choice",
      difficulty: 1,
      order: 7
    }).returning();

    await db.insert(answers).values([
      { id: 27188, questionId: 5937, content: "Sí, cada fruta tiene un precio único asignado.", isCorrect: true },
      { id: 27189, questionId: 5937, content: "No, porque ¡2 €¡ se repite como salida.", isCorrect: false },
      { id: 27190, questionId: 5937, content: "No, falta el precio del banano.", isCorrect: false },
      { id: 27191, questionId: 5937, content: "Sí, es una relación biyectiva.", isCorrect: false }
    ]);

    // Pregunta 8
    const q5938 = await db.insert(questions).values({
      id: 5938,
      quizId: 500,
      content: "Si aplicamos la prueba de la línea vertical a un círculo centrado en el origen, concluimos que:",
      type: "multiple_choice",
      difficulty: 1,
      order: 8
    }).returning();

    await db.insert(answers).values([
      { id: 27192, questionId: 5938, content: "no es una función porque la línea vertical lo corta en dos puntos.", isCorrect: true },
      { id: 27193, questionId: 5938, content: "es una función circular.", isCorrect: false },
      { id: 27194, questionId: 5938, content: "es una función periódica.", isCorrect: false },
      { id: 27195, questionId: 5938, content: "es una función con dominio restringido.", isCorrect: false }
    ]);

    // Pregunta 9
    const q5939 = await db.insert(questions).values({
      id: 5939,
      quizId: 500,
      content: "Al conjunto de todos los valores de salida o posibles resultados de una función se le conoce como:",
      type: "multiple_choice",
      difficulty: 1,
      order: 9
    }).returning();

    await db.insert(answers).values([
      { id: 27196, questionId: 5939, content: "Rango o Imagen.", isCorrect: true },
      { id: 27197, questionId: 5939, content: "Dominio.", isCorrect: false },
      { id: 27198, questionId: 5939, content: "Abscisa.", isCorrect: false },
      { id: 27199, questionId: 5939, content: "Pendiente.", isCorrect: false }
    ]);

    // Pregunta 10
    const q5940 = await db.insert(questions).values({
      id: 5940,
      quizId: 500,
      content: "En una máquina de funciones, si ingresa el número ¡3¡ y la máquina produce simultáneamente el ¡6¡ y el ¡7¡, podemos afirmar que:",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5933_Q10_Maquina_Funciones.png",
      order: 10
    }).returning();

    await db.insert(answers).values([
      { id: 27200, questionId: 5940, content: "el proceso no describe una función.", isCorrect: true },
      { id: 27201, questionId: 5940, content: "es una función de valor doble.", isCorrect: false },
      { id: 27202, questionId: 5940, content: "la máquina está realizando una suma.", isCorrect: false },
      { id: 27203, questionId: 5940, content: "es una función creciente.", isCorrect: false }
    ]);

    // Pregunta 11
    const q5941 = await db.insert(questions).values({
      id: 5941,
      quizId: 500,
      content: "Si un elemento del dominio no tiene asignada ninguna salida en el codominio, ¿se cumple la definición de función?",
      type: "multiple_choice",
      difficulty: 1,
      order: 11
    }).returning();

    await db.insert(answers).values([
      { id: 27204, questionId: 5941, content: "No, todos los elementos del dominio deben tener una salida.", isCorrect: true },
      { id: 27205, questionId: 5941, content: "Sí, es una función nula.", isCorrect: false },
      { id: 27206, questionId: 5941, content: "Sí, si el codominio está vacío.", isCorrect: false },
      { id: 27207, questionId: 5941, content: "No, porque es una función inversa.", isCorrect: false }
    ]);

    // Pregunta 12
    const q5942 = await db.insert(questions).values({
      id: 5942,
      quizId: 500,
      content: "Dada la tabla: ¡x: 1, 2, 3¡ e ¡y: 4, 4, 4¡. ¿Representa esta tabla una función?",
      type: "multiple_choice",
      difficulty: 1,
      order: 12
    }).returning();

    await db.insert(answers).values([
      { id: 27208, questionId: 5942, content: "Sí, cada ¡x¡ tiene una única salida propia.", isCorrect: true },
      { id: 27209, questionId: 5942, content: "No, porque la ¡y¡ se repite.", isCorrect: false },
      { id: 27210, questionId: 5942, content: "No, es una relación constante pero no es función.", isCorrect: false },
      { id: 27211, questionId: 5942, content: "Faltan más datos para decidir.", isCorrect: false }
    ]);


    // --- QUIZ 501: Dominio y Codominio ---
    const quiz501 = await db.insert(quizzes).values({
      id: 501,
      title: "Dominio y Codominio",
      description: "Descubre las restricciones de las funciones. ¿Qué valores puede tomar la variable x?",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 2900,
      order: 2
    }).returning();

    // Pregunta 1
    const q5943 = await db.insert(questions).values({
      id: 5943,
      quizId: 501,
      content: "¿Cuál es el dominio de la función ¡f(x) = \\frac{1}{x - 3}¡?",
      type: "multiple_choice",
      difficulty: 1,
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27212, questionId: 5943, content: "Todos los reales excepto el ¡3¡.", isCorrect: true },
      { id: 27213, questionId: 5943, content: "Cualquier número real.", isCorrect: false },
      { id: 27214, questionId: 5943, content: "Solo números positivos.", isCorrect: false },
      { id: 27215, questionId: 5943, content: "Todos los reales excepto el ¡-3¡.", isCorrect: false }
    ]);

    // Pregunta 2
    const q5944 = await db.insert(questions).values({
      id: 5944,
      quizId: 501,
      content: "Determine el dominio de la función ¡g(x) = \\sqrt{x - 5}¡ en los números reales.",
      type: "multiple_choice",
      difficulty: 1,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27216, questionId: 5944, content: "¡x \\geq 5¡", isCorrect: true },
      { id: 27217, questionId: 5944, content: "¡x > 5¡", isCorrect: false },
      { id: 27218, questionId: 5944, content: "¡x \\leq 5¡", isCorrect: false },
      { id: 27219, questionId: 5944, content: "Cualquier número real.", isCorrect: false }
    ]);

    // Pregunta 3
    const q5945 = await db.insert(questions).values({
      id: 5945,
      quizId: 501,
      content: "El dominio natural de cualquier función polinomial como ¡P(x) = x^3 - 4x + 1¡ es:",
      type: "multiple_choice",
      difficulty: 1,
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27220, questionId: 5945, content: "el conjunto de todos los números reales.", isCorrect: true },
      { id: 27221, questionId: 5945, content: "solo los números reales positivos.", isCorrect: false },
      { id: 27222, questionId: 5945, content: "números reales distintos de ¡0¡.", isCorrect: false },
      { id: 27223, questionId: 5945, content: "el intervalo ¡(0, \\infty)¡.", isCorrect: false }
    ]);

    // Pregunta 4
    const q5946 = await db.insert(questions).values({
      id: 5946,
      quizId: 501,
      content: "¿Qué valor de ¡x¡ NO pertenece al dominio de ¡h(x) = \\frac{x + 2}{x^2 - 4}¡?",
      type: "multiple_choice",
      difficulty: 1,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27224, questionId: 5946, content: "¡x = 2¡ y ¡x = -2¡", isCorrect: true },
      { id: 27225, questionId: 5946, content: "Solo ¡x = 2¡", isCorrect: false },
      { id: 27226, questionId: 5946, content: "Cualquier valor es válido.", isCorrect: false },
      { id: 27227, questionId: 5946, content: "¡x = 0¡", isCorrect: false }
    ]);

    // Pregunta 5
    const q5947 = await db.insert(questions).values({
      id: 5947,
      quizId: 501,
      content: "En la gráfica de una función, un círculo abierto (hueco) en un valor de ¡x¡ indica que:",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5947_Q5_Grafica_Hueco.png",
      order: 5
    }).returning();

    await db.insert(answers).values([
      { id: 27228, questionId: 5947, content: "ese valor de ¡x¡ no pertenece al dominio.", isCorrect: true },
      { id: 27229, questionId: 5947, content: "la función vale ¡0¡ en ese punto.", isCorrect: false },
      { id: 27230, questionId: 5947, content: "es un punto máximo.", isCorrect: false },
      { id: 27231, questionId: 5947, content: "la función es infinita allí.", isCorrect: false }
    ]);

    // Pregunta 6
    const q5948 = await db.insert(questions).values({
      id: 5948,
      quizId: 501,
      content: "¿Cuál es el dominio de la función logarítmica básica ¡f(x) = \\log(x)¡?",
      type: "multiple_choice",
      difficulty: 1,
      order: 6
    }).returning();

    await db.insert(answers).values([
      { id: 27232, questionId: 5948, content: "¡x > 0¡", isCorrect: true },
      { id: 27233, questionId: 5948, content: "¡x \\geq 0¡", isCorrect: false },
      { id: 27234, questionId: 5948, content: "Todos los reales.", isCorrect: false },
      { id: 27235, questionId: 5948, content: "¡x \\neq 0¡", isCorrect: false }
    ]);

    // Pregunta 7
    const q5949 = await db.insert(questions).values({
      id: 5949,
      quizId: 501,
      content: "¿Por qué el valor que hace ¡0¡ al denominador debe excluirse del dominio?",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5949_Q7_Denominador_Cero.png",
      order: 7
    }).returning();

    await db.insert(answers).values([
      { id: 27236, questionId: 5949, content: "Porque la división por cero no está definida.", isCorrect: true },
      { id: 27237, questionId: 5949, content: "Porque el resultado sería muy grande.", isCorrect: false },
      { id: 27238, questionId: 5949, content: "Porque la calculadora da error.", isCorrect: false },
      { id: 27239, questionId: 5949, content: "Porque la función se vuelve negativa.", isCorrect: false }
    ]);

    // Pregunta 8
    const q5950 = await db.insert(questions).values({
      id: 5950,
      quizId: 501,
      content: "Defina Codominio de una función:",
      type: "multiple_choice",
      difficulty: 1,
      order: 8
    }).returning();

    await db.insert(answers).values([
      { id: 27240, questionId: 5950, content: "Es el conjunto de 'llegada' que contiene a todas las posibles salidas.", isCorrect: true },
      { id: 27241, questionId: 5950, content: "Es el conjunto de solo los valores de salida alcanzados.", isCorrect: false },
      { id: 27242, questionId: 5950, content: "Es el conjunto de valores de entrada.", isCorrect: false },
      { id: 27243, questionId: 5950, content: "Es el eje de las abscisas.", isCorrect: false }
    ]);

    // Pregunta 11
    const q5953 = await db.insert(questions).values({
      id: 5953,
      quizId: 501,
      content: "¿Qué sucede con el dominio de una raíz cuadrada si el argumento es negativo (ej. ¡\\sqrt{-4}¡)?",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5953_Q11_Raiz_Negativa.png",
      order: 11
    }).returning();

    await db.insert(answers).values([
      { id: 27252, questionId: 5953, content: "No hay una solución real, por lo que el valor no está en el dominio.", isCorrect: true },
      { id: 27254, questionId: 5953, content: "La función se vuelve imaginaria pero sigue en el dominio real.", isCorrect: false },
      { id: 27255, questionId: 5953, content: "El resultado es siempre ¡0¡.", isCorrect: false }
    ]);


    // --- QUIZ 502: Evaluación e Interpretación ---
    const quiz502 = await db.insert(quizzes).values({
      id: 502,
      title: "Evaluación e Interpretación",
      description: "Domina el arte de evaluar funciones y entiende el significado de los cambios en x.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 2800,
      order: 3
    }).returning();

    // Pregunta 1
    const q5955 = await db.insert(questions).values({
      id: 5955,
      quizId: 502,
      content: "Si ¡f(x) = x^2 + 3¡, halle el valor de ¡f(2)¡.",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5955_Q1_Sustitucion_Variable.png",
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27260, questionId: 5955, content: "¡7¡", isCorrect: true },
      { id: 27261, questionId: 5955, content: "¡4¡", isCorrect: false },
      { id: 27262, questionId: 5955, content: "¡5¡", isCorrect: false },
      { id: 27263, questionId: 5955, content: "¡9¡", isCorrect: false }
    ]);

    // Pregunta 2
    const q5956 = await db.insert(questions).values({
      id: 5956,
      quizId: 502,
      content: "Dada la función ¡g(x) = 5x - 4¡, determine ¡g(a + 1)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27264, questionId: 5956, content: "¡5a + 1¡", isCorrect: true },
      { id: 27265, questionId: 5956, content: "¡5a - 4¡", isCorrect: false },
      { id: 27266, questionId: 5956, content: "¡5a - 3¡", isCorrect: false },
      { id: 27267, questionId: 5956, content: "¡a + 1¡", isCorrect: false }
    ]);

    // Pregunta 3
    const q5957 = await db.insert(questions).values({
      id: 5957,
      quizId: 502,
      content: "La expresión ¡\\frac{f(x + h) - f(x)}{h}¡ es fundamental en cálculo. Si ¡f(x) = 2x¡, ¿cuál es su valor simplificado?",
      type: "multiple_choice",
      difficulty: 3,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5957_Q3_Cociente_Diferencia.png",
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27268, questionId: 5957, content: "¡2¡", isCorrect: true },
      { id: 27269, questionId: 5957, content: "¡2h¡", isCorrect: false },
      { id: 27270, questionId: 5957, content: "¡x¡", isCorrect: false },
      { id: 27271, questionId: 5957, content: "¡0¡", isCorrect: false }
    ]);

    // Pregunta 4
    const q5958 = await db.insert(questions).values({
      id: 5958,
      quizId: 502,
      content: "Sea ¡f(x) = x^2¡. Encuentre la expresión de ¡f(x + h)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27272, questionId: 5958, content: "¡x^2 + 2xh + h^2¡", isCorrect: true },
      { id: 27273, questionId: 5958, content: "¡x^2 + h^2¡", isCorrect: false },
      { id: 27274, questionId: 5958, content: "¡x + h¡", isCorrect: false },
      { id: 27275, questionId: 5958, content: "¡x^2 + h¡", isCorrect: false }
    ]);

    // Pregunta 5
    const q5959 = await db.insert(questions).values({
      id: 5959,
      quizId: 502,
      content: "Si ¡f(x) = 10¡ para cualquier valor de ¡x¡, halle ¡f(x + 5) - f(x)¡.",
      type: "multiple_choice",
      difficulty: 1,
      order: 5
    }).returning();

    await db.insert(answers).values([
      { id: 27276, questionId: 5959, content: "¡0¡", isCorrect: true },
      { id: 27277, questionId: 5959, content: "¡5¡", isCorrect: false },
      { id: 27278, questionId: 5959, content: "¡10¡", isCorrect: false },
      { id: 27279, questionId: 5959, content: "¡x¡", isCorrect: false }
    ]);

    // Pregunta 6
    const q5960 = await db.insert(questions).values({
      id: 5960,
      quizId: 502,
      content: "Evalúe ¡f(x) = |x - 4|¡ cuando ¡x = 1¡.",
      type: "multiple_choice",
      difficulty: 1,
      order: 6
    }).returning();

    await db.insert(answers).values([
      { id: 27280, questionId: 5960, content: "¡3¡", isCorrect: true },
      { id: 27281, questionId: 5960, content: "¡-3¡", isCorrect: false },
      { id: 27282, questionId: 5960, content: "¡4¡", isCorrect: false },
      { id: 27283, questionId: 5960, content: "¡1¡", isCorrect: false }
    ]);

    // Pregunta 7
    const q5961 = await db.insert(questions).values({
      id: 5961,
      quizId: 502,
      content: "Considere ¡f(x) = \sqrt{x}¡ e ¡i(x) = x + 4¡. Evalúe ¡f(i(5))¡.",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5961_Q7_Evaluacion_Compuesta.png",
      order: 7
    }).returning();

    await db.insert(answers).values([
      { id: 27284, questionId: 5961, content: "¡3¡", isCorrect: true },
      { id: 27285, questionId: 5961, content: "¡9¡", isCorrect: false },
      { id: 27286, questionId: 5961, content: "¡\sqrt{5}¡", isCorrect: false },
      { id: 27287, questionId: 5961, content: "¡7¡", isCorrect: false }
    ]);

    // Pregunta 8
    const q5962 = await db.insert(questions).values({
      id: 5962,
      quizId: 502,
      content: "¿Qué representa físicamente un cambio en ¡f(x) / \Delta x¡ si ¡f¡ es posición?",
      type: "multiple_choice",
      difficulty: 3,
      order: 8
    }).returning();

    await db.insert(answers).values([
      { id: 27288, questionId: 5962, content: "Velocidad promedio.", isCorrect: true },
      { id: 27289, questionId: 5962, content: "Aceleración.", isCorrect: false },
      { id: 27290, questionId: 5962, content: "Masa.", isCorrect: false },
      { id: 27291, questionId: 5962, content: "Distancia total.", isCorrect: false }
    ]);


    // --- QUIZ 503: Representaciones Múltiples ---
    const quiz503 = await db.insert(quizzes).values({
      id: 503,
      title: "Representaciones Múltiples",
      description: "Aprende a pasar de una gráfica a una tabla o a una expresión algebraica con facilidad.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 2900,
      order: 4
    }).returning();

    // Pregunta 1
    const q5967 = await db.insert(questions).values({
      id: 5967,
      quizId: 503,
      content: "Dada la gráfica de una línea que pasa por los puntos ¡(0, 2)¡ e ¡(1, 4)¡, ¿cuál es su ecuación algebraica?",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5967_Q1_Grafica_Lineal.png",
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27308, questionId: 5967, content: "¡y = 2x + 2¡", isCorrect: true },
      { id: 27309, questionId: 5967, content: "¡y = 4x + 2¡", isCorrect: false },
      { id: 27310, questionId: 5967, content: "¡y = x + 2¡", isCorrect: false },
      { id: 27311, questionId: 5967, content: "¡y = 2x + 4¡", isCorrect: false }
    ]);

    // Pregunta 2
    const q5968 = await db.insert(questions).values({
      id: 5968,
      quizId: 503,
      content: "Si una tabla de valores muestra que para cada ¡x¡, el valor de ¡y¡ es el triple de ¡x¡ menos uno, la expresión es:",
      type: "multiple_choice",
      difficulty: 1,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27312, questionId: 5968, content: "¡f(x) = 3x - 1¡", isCorrect: true },
      { id: 27313, questionId: 5968, content: "¡f(x) = x^3 - 1¡", isCorrect: false },
      { id: 27314, questionId: 5968, content: "¡f(x) = 3(x - 1)¡", isCorrect: false },
      { id: 27315, questionId: 5968, content: "¡f(x) = \\frac{x}{3} - 1¡", isCorrect: false }
    ]);

    // Pregunta 3
    const q5969 = await db.insert(questions).values({
      id: 5969,
      quizId: 503,
      content: "Observe la tabla de la imagen. ¿Qué patrón o fórmula describe la relación entre ¡x¡ e ¡y¡?",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5969_Q3_Tabla_Valores.png",
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27316, questionId: 5969, content: "¡y = 2x + 1¡", isCorrect: true },
      { id: 27317, questionId: 5969, content: "¡y = x + 2¡", isCorrect: false },
      { id: 27318, questionId: 5969, content: "¡y = 3x¡", isCorrect: false },
      { id: 27319, questionId: 5969, content: "¡y = x^2¡", isCorrect: false }
    ]);

    // Pregunta 4
    const q5970 = await db.insert(questions).values({
      id: 5970,
      quizId: 503,
      content: "Una función que interseca el eje ¡y¡ en el punto ¡(0, -5)¡ y tiene pendiente ¡3¡ se representa como:",
      type: "multiple_choice",
      difficulty: 2,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27320, questionId: 5970, content: "¡f(x) = 3x - 5¡", isCorrect: true },
      { id: 27321, questionId: 5970, content: "¡f(x) = -5x + 3¡", isCorrect: false },
      { id: 27322, questionId: 5970, content: "¡f(x) = 3(x - 5)¡", isCorrect: false },
      { id: 27323, questionId: 5970, content: "¡f(x) = x^3 - 5¡", isCorrect: false }
    ]);

    // Pregunta 5
    const q5971 = await db.insert(questions).values({
      id: 5971,
      quizId: 503,
      content: "Al realizar el bosquejo de la función ¡f(x) = x^2 + 1¡, esperamos ver una parábola que:",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5971_Q5_Bosquejo_Grafica.png",
      order: 5
    }).returning();

    await db.insert(answers).values([
      { id: 27324, questionId: 5971, content: "abre hacia arriba y tiene su vértice en ¡(0, 1)¡.", isCorrect: true },
      { id: 27325, questionId: 5971, content: "es una línea recta que pasa por el ¡1¡.", isCorrect: false },
      { id: 27326, questionId: 5971, content: "abre hacia abajo y pasa por el origen.", isCorrect: false },
      { id: 27327, questionId: 5971, content: "se desplaza ¡1¡ unidad hacia la derecha.", isCorrect: false }
    ]);

    // Pregunta 6
    const q5972 = await db.insert(questions).values({
      id: 5972,
      quizId: 503,
      content: "¿Qué representación de una función suele ser la más útil para observar el comportamiento final (infinito) de la misma?",
      type: "multiple_choice",
      difficulty: 1,
      order: 6
    }).returning();

    await db.insert(answers).values([
      { id: 27328, questionId: 5972, content: "Representación gráfica.", isCorrect: true },
      { id: 27329, questionId: 5972, content: "Tabla de valores.", isCorrect: false },
      { id: 27330, questionId: 5972, content: "Descripción verbal.", isCorrect: false },
      { id: 27331, questionId: 5972, content: "El nombre de la función.", isCorrect: false }
    ]);


    // --- QUIZ 504: Transformaciones de Funciones ---
    const quiz504 = await db.insert(quizzes).values({
      id: 504,
      title: "Transformaciones de Funciones",
      description: "Aprende a mover y deformar funciones sin necesidad de recalcular todos sus puntos.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Avanzada",
      totalQuestions: 12,
      timeLimit: 3000,
      order: 5
    }).returning();

    // Pregunta 1
    const q5977 = await db.insert(questions).values({
      id: 5977,
      quizId: 504,
      content: "Si la gráfica de ¡f(x)¡ se desplaza ¡2¡ unidades hacia la derecha, la nueva expresión es:",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5977_Q1_Traslacion_Horizontal.png",
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27348, questionId: 5977, content: "¡f(x - 2)¡", isCorrect: true },
      { id: 27349, questionId: 5977, content: "¡f(x + 2)¡", isCorrect: false },
      { id: 27350, questionId: 5977, content: "¡f(x) - 2¡", isCorrect: false },
      { id: 27351, questionId: 5977, content: "¡f(x) + 2¡", isCorrect: false }
    ]);

    // Pregunta 2
    const q5978 = await db.insert(questions).values({
      id: 5978,
      quizId: 504,
      content: "La transformación ¡g(x) = f(x) + 5¡ representa un desplazamiento de la gráfica de ¡f¡ de:",
      type: "multiple_choice",
      difficulty: 1,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27352, questionId: 5978, content: "¡5¡ unidades hacia arriba.", isCorrect: true },
      { id: 27353, questionId: 5978, content: "¡5¡ unidades hacia abajo.", isCorrect: false },
      { id: 27354, questionId: 5978, content: "¡5¡ unidades hacia la izquierda.", isCorrect: false },
      { id: 27355, questionId: 5978, content: "¡5¡ unidades hacia la derecha.", isCorrect: false }
    ]);

    // Pregunta 3
    const q5979 = await db.insert(questions).values({
      id: 5979,
      quizId: 504,
      content: "¿Qué efecto tiene sobre la gráfica de ¡f(x)¡ la transformación ¡h(x) = -f(x)¡?",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5979_Q3_Reflexion_Eje.png",
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27356, questionId: 5979, content: "Reflexión respecto al eje ¡x¡.", isCorrect: true },
      { id: 27357, questionId: 5979, content: "Reflexión respecto al eje ¡y¡.", isCorrect: false },
      { id: 27358, questionId: 5979, content: "Desplazamiento horizontal.", isCorrect: false },
      { id: 27359, questionId: 5979, content: "Giro de ¡90^\\circ¡.", isCorrect: false }
    ]);

    // Pregunta 4
    const q5980 = await db.insert(questions).values({
      id: 5980,
      quizId: 504,
      content: "Dada la función ¡f(x) = |x|¡, la expresión ¡g(x) = |x + 3| - 2¡ indica un desplazamiento de:",
      type: "multiple_choice",
      difficulty: 3,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27360, questionId: 5980, content: "¡3¡ a la izquierda y ¡2¡ hacia abajo.", isCorrect: true },
      { id: 27361, questionId: 5980, content: "¡3¡ a la derecha y ¡2¡ hacia arriba.", isCorrect: false },
      { id: 27362, questionId: 5980, content: "¡3¡ hacia arriba y ¡2¡ a la izquierda.", isCorrect: false },
      { id: 27363, questionId: 5980, content: "¡3¡ a la izquierda y ¡2¡ hacia arriba.", isCorrect: false }
    ]);

    // Pregunta 5
    const q5981 = await db.insert(questions).values({
      id: 5981,
      quizId: 504,
      content: "Si queremos reflejar una función ¡f(x)¡ respecto al eje ¡y¡, la nueva función debe ser:",
      type: "multiple_choice",
      difficulty: 1,
      order: 5
    }).returning();

    await db.insert(answers).values([
      { id: 27364, questionId: 5981, content: "¡f(-x)¡", isCorrect: true },
      { id: 27365, questionId: 5981, content: "-¡f(x)¡", isCorrect: false },
      { id: 27366, questionId: 5981, content: "¡f(x + 1)¡", isCorrect: false },
      { id: 27367, questionId: 5981, content: "¡1/f(x)¡", isCorrect: false }
    ]);

    // Pregunta 6
    const q5982 = await db.insert(questions).values({
      id: 5982,
      quizId: 504,
      content: "Si ¡f(x) = x^2¡, ¿cómo se ve la gráfica de ¡g(x) = 0.5x^2¡ comparada con ¡f¡?",
      type: "multiple_choice",
      difficulty: 2,
      order: 6
    }).returning();

    await db.insert(answers).values([
      { id: 27368, questionId: 5982, content: "Es 'más ancha' (compresión vertical).", isCorrect: true },
      { id: 27369, questionId: 5982, content: "Es 'más estrecha' (estiramiento vertical).", isCorrect: false },
      { id: 27370, questionId: 5982, content: "Se desplazó hacia abajo.", isCorrect: false },
      { id: 27371, questionId: 5982, content: "Se reflejó en el eje ¡x¡.", isCorrect: false }
    ]);

    // Pregunta 7
    const q5983 = await db.insert(questions).values({
      id: 5983,
      quizId: 504,
      content: "La transformación ¡h(x) = 3f(x)¡ produce un:",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5983_Q7_Escalamiento_Vertical.png",
      order: 7
    }).returning();

    await db.insert(answers).values([
      { id: 27372, questionId: 5983, content: "estiramiento vertical por un factor de ¡3¡.", isCorrect: true },
      { id: 27373, questionId: 5983, content: "estiramiento horizontal por un factor de ¡3¡.", isCorrect: false },
      { id: 27374, questionId: 5983, content: "desplazamiento vertical de ¡3¡ unidades.", isCorrect: false },
      { id: 27375, questionId: 5983, content: "estrechamiento horizontal.", isCorrect: false }
    ]);

    // Pregunta 8
    const q5984 = await db.insert(questions).values({
      id: 5984,
      quizId: 504,
      content: "Si la gráfica de ¡f(x) = \sqrt{x}¡ se desplaza ¡4¡ unidades a la izquierda y se refleja en el eje ¡x¡, la expresión es:",
      type: "multiple_choice",
      difficulty: 3,
      order: 8
    }).returning();

    await db.insert(answers).values([
      { id: 27376, questionId: 5984, content: "¡-\sqrt{x + 4}¡", isCorrect: true },
      { id: 27377, questionId: 5984, content: "¡\sqrt{-x + 4}¡", isCorrect: false },
      { id: 27378, questionId: 5984, content: "¡-\sqrt{x - 4}¡", isCorrect: false },
      { id: 27379, questionId: 5984, content: "¡\sqrt{x} - 4¡", isCorrect: false }
    ]);


    // --- QUIZ 505: Operaciones entre Funciones ---
    const quiz505 = await db.insert(quizzes).values({
      id: 505,
      title: "Operaciones entre Funciones",
      description: "Aprende a combinar funciones mediante suma, resta, producto y división.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 3000,
      order: 6
    }).returning();

    // Pregunta 1
    const q5989 = await db.insert(questions).values({
      id: 5989,
      quizId: 505,
      content: "Si ¡f(x) = 2x + 1¡ y ¡g(x) = x - 3¡, halle la expresión de ¡(f + g)(x)¡.",
      type: "multiple_choice",
      difficulty: 1,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5989_Q1_Suma_Grafica.png",
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27380, questionId: 5989, content: "¡3x - 2¡", isCorrect: true },
      { id: 27381, questionId: 5989, content: "¡x + 4¡", isCorrect: false },
      { id: 27382, questionId: 5989, content: "¡3x + 4¡", isCorrect: false },
      { id: 27383, questionId: 5989, content: "¡2x^2 - 5x - 3¡", isCorrect: false }
    ]);

    // Pregunta 2
    const q5990 = await db.insert(questions).values({
      id: 5990,
      quizId: 505,
      content: "Dadas ¡f(x) = x^2¡ y ¡g(x) = x¡, halle ¡(f - g)(5)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27384, questionId: 5990, content: "¡20¡", isCorrect: true },
      { id: 27385, questionId: 5990, content: "¡25¡", isCorrect: false },
      { id: 27386, questionId: 5990, content: "¡30¡", isCorrect: false },
      { id: 27387, questionId: 5990, content: "¡5¡", isCorrect: false }
    ]);

    // Pregunta 3
    const q5991 = await db.insert(questions).values({
      id: 5991,
      quizId: 505,
      content: "Al realizar la división ¡(f/g)(x)¡, ¿qué restricción adicional debemos considerar respecto al dominio?",
      type: "multiple_choice",
      difficulty: 2,
      imageUrl: "https://imagenes.alanmath.com/algebra/C2_P5991_Q3_Division_Restriccion.png",
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27388, questionId: 5991, content: "Todos los valores de ¡x¡ tales que ¡g(x) = 0¡ deben excluirse.", isCorrect: true },
      { id: 27389, questionId: 5991, content: "Solo los valores negativos de ¡x¡.", isCorrect: false },
      { id: 27390, questionId: 5991, content: "No hay restricciones adicionales.", isCorrect: false },
      { id: 27391, questionId: 5991, content: "Solo los valores donde ¡f(x) = 0¡.", isCorrect: false }
    ]);

    // Pregunta 4
    const q5992 = await db.insert(questions).values({
      id: 5992,
      quizId: 505,
      content: "Si ¡f(x) = \sqrt{x}¡ y ¡g(x) = x - 2¡, el dominio de ¡(f + g)(x)¡ es:",
      type: "multiple_choice",
      difficulty: 3,
      order: 4
    }).returning();

    await db.insert(answers).values([
      { id: 27392, questionId: 5992, content: "¡x \\geq 0¡", isCorrect: true },
      { id: 27393, questionId: 5992, content: "¡x \\geq 2¡", isCorrect: false },
      { id: 27394, questionId: 5992, content: "Todos los reales.", isCorrect: false },
      { id: 27395, questionId: 5992, content: "¡x > 0¡", isCorrect: false }
    ]);


    // --- QUIZ 506: Composición de Funciones ---
    const quiz506 = await db.insert(quizzes).values({
      id: 506,
      title: "Composición de Funciones",
      description: "Entiende cómo 'encadenar' funciones. Vital para la regla de la cadena en cálculo.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Avanzada",
      totalQuestions: 12,
      timeLimit: 3200,
      order: 7
    }).returning();

    // Pregunta 1
    const q5999 = await db.insert(questions).values({
      id: 5999,
      quizId: 506,
      content: "Dadas ¡f(x) = x^2¡ y ¡g(x) = x + 3¡, halle ¡(f \circ g)(x)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27430, questionId: 5999, content: "¡(x + 3)^2¡", isCorrect: true },
      { id: 27431, questionId: 5999, content: "¡x^2 + 3¡", isCorrect: false },
      { id: 27432, questionId: 5999, content: "¡x^2 + 9¡", isCorrect: false },
      { id: 27433, questionId: 5999, content: "¡2x + 3¡", isCorrect: false }
    ]);

    // Pregunta 2
    const q6000 = await db.insert(questions).values({
      id: 6000,
      quizId: 506,
      content: "En la composición ¡(g \circ f)(x)¡, ¿qué función se aplica primero a la variable ¡x¡?",
      type: "multiple_choice",
      difficulty: 1,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27434, questionId: 6000, content: "La función ¡f¡ (la más interna).", isCorrect: true },
      { id: 27435, questionId: 6000, content: "La función ¡g¡ (la más externa).", isCorrect: false },
      { id: 27436, questionId: 6000, content: "Ambas simultáneamente.", isCorrect: false },
      { id: 27437, questionId: 6000, content: "Ninguna, la composición es una suma.", isCorrect: false }
    ]);

    // Pregunta 3
    const q6001 = await db.insert(questions).values({
      id: 6001,
      quizId: 506,
      content: "Si ¡f(x) = \sqrt{x}¡ y ¡g(x) = x - 4¡, halle ¡(f \circ g)(5)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 3
    }).returning();

    await db.insert(answers).values([
      { id: 27438, questionId: 6001, content: "¡1¡", isCorrect: true },
      { id: 27439, questionId: 6001, content: "¡\sqrt{5} - 4¡", isCorrect: false },
      { id: 27440, questionId: 6001, content: "¡\sqrt{9} = 3¡", isCorrect: false },
      { id: 27441, questionId: 6001, content: "No está definido.", isCorrect: false }
    ]);


    // --- QUIZ 507: Función Inversa ---
    const quiz507 = await db.insert(quizzes).values({
      id: 507,
      title: "Función Inversa",
      description: "Aprende a deshacer lo hecho por una función. Conceptos de inyectividad y cálculo de f⁻¹.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 3000,
      order: 8
    }).returning();

    // Pregunta 1
    const q6011 = await db.insert(questions).values({
      id: 6011,
      quizId: 507,
      content: "¿Cuál es la condición necesaria para que una función admita una función inversa?",
      type: "multiple_choice",
      difficulty: 2,
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27500, questionId: 6011, content: "Debe ser una función uno a uno (inyectiva).", isCorrect: true },
      { id: 27501, questionId: 6011, content: "Debe ser una función cuadrática.", isCorrect: false },
      { id: 27502, questionId: 6011, content: "Debe pasar por el origen.", isCorrect: false },
      { id: 27503, questionId: 6011, content: "Debe tener un dominio infinito.", isCorrect: false }
    ]);

    // Pregunta 2
    const q6012 = await db.insert(questions).values({
      id: 6012,
      quizId: 507,
      content: "Si ¡f(x) = 2x + 4¡, halle su función inversa ¡f^{-1}(x)¡.",
      type: "multiple_choice",
      difficulty: 2,
      order: 2
    }).returning();

    await db.insert(answers).values([
      { id: 27504, questionId: 6012, content: "¡f^{-1}(x) = \\frac{x - 4}{2}¡", isCorrect: true },
      { id: 27505, questionId: 6012, content: "¡f^{-1}(x) = 2x - 4¡", isCorrect: false },
      { id: 27506, questionId: 6012, content: "¡f^{-1}(x) = \\frac{x}{2} + 4¡", isCorrect: false },
      { id: 27507, questionId: 6012, content: "¡f^{-1}(x) = 4x + 2¡", isCorrect: false }
    ]);


    // --- QUIZ 508: Crecimiento y Comportamiento ---
    const quiz508 = await db.insert(quizzes).values({
      id: 508,
      title: "Crecimiento y Comportamiento",
      description: "Identifica intervalos de crecimiento, máximos y mínimos de forma intuitiva.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Básica",
      totalQuestions: 12,
      timeLimit: 2900,
      order: 9
    }).returning();

    // Pregunta 1
    const q6021 = await db.insert(questions).values({
      id: 6021,
      quizId: 508,
      content: "Se dice que una función es creciente en un intervalo si, al aumentar ¡x¡:",
      type: "multiple_choice",
      difficulty: 1,
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27540, questionId: 6021, content: "el valor de ¡f(x)¡ también aumenta.", isCorrect: true },
      { id: 27541, questionId: 6021, content: "el valor de ¡f(x)¡ disminuye.", isCorrect: false },
      { id: 27542, questionId: 6021, content: "el valor de ¡f(x)¡ permanece constante.", isCorrect: false },
      { id: 27543, questionId: 6021, content: "la función cruza el eje ¡x¡.", isCorrect: false }
    ]);


    // --- QUIZ 509: El Alfabeto de las Funciones ---
    const quiz509 = await db.insert(quizzes).values({
      id: 509,
      title: "El Alfabeto de las Funciones",
      description: "Reconoce las funciones típicas: polinomiales, racionales, exponenciales y logarítmicas.",
      categoryId: 2,
      subcategoryId: 431,
      difficulty: "Promedio",
      totalQuestions: 12,
      timeLimit: 3100,
      order: 10
    }).returning();

    // Pregunta 1
    const q6031 = await db.insert(questions).values({
      id: 6031,
      quizId: 509,
      content: "¿Cuál de las siguientes es una función racional?",
      type: "multiple_choice",
      difficulty: 2,
      order: 1
    }).returning();

    await db.insert(answers).values([
      { id: 27580, questionId: 6031, content: "¡f(x) = \\frac{x^2 + 1}{x - 1}¡", isCorrect: true },
      { id: 27581, questionId: 6031, content: "¡f(x) = 3x^2 + 4¡", isCorrect: false },
      { id: 27582, questionId: 6031, content: "¡f(x) = \sqrt{x + 3}¡", isCorrect: false },
      { id: 27583, questionId: 6031, content: "¡f(x) = 2^x¡", isCorrect: false }
    ]);

    console.log("Todos los cuestionarios (500-509) insertados exitosamente.");

  } catch (error) {
    console.error("Error insertando cuestionarios:", error);
  } finally {
    process.exit();
  }
}

addFunctionsQuizzes();
