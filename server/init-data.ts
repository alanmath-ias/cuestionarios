import { storage } from "./storage";

// Función para inicializar datos de ejemplo en la base de datos
export async function initializeTestData() {
  try {
    console.log("Inicializando datos de ejemplo...");
    
    // Verificar si ya existen usuarios para evitar duplicados
    const existingUsers = await storage.getUsers();
    
    if (existingUsers.length === 0) {
      // Crear usuarios
      const admin = await storage.createUser({
        username: "admin",
        password: "admin123",
        name: "Administrador",
        email: "admin@alanmath.com"
      });
      console.log(`Usuario creado: ${admin.username}, ID: ${admin.id}`);
      
      const student = await storage.createUser({
        username: "estudiante",
        password: "estudiante123",
        name: "María González",
        email: "maria@example.com"
      });
      console.log(`Usuario creado: ${student.username}, ID: ${student.id}`);
      
      // Crear categorías
      const categories = await storage.getCategories();
      
      if (categories.length === 0) {
        // Crear categorías
        const algebra = await storage.createCategory({
          name: "Álgebra",
          description: "Ecuaciones, polinomios y sistemas lineales",
          colorClass: "primary"
        });
        console.log(`Categoría creada: ${algebra.name}, ID: ${algebra.id}`);
        
        const geometria = await storage.createCategory({
          name: "Geometría",
          description: "Figuras, ángulos y teoremas básicos",
          colorClass: "secondary"
        });
        console.log(`Categoría creada: ${geometria.name}, ID: ${geometria.id}`);
        
        const calculo = await storage.createCategory({
          name: "Cálculo",
          description: "Límites, derivadas e integrales",
          colorClass: "accent"
        });
        console.log(`Categoría creada: ${calculo.name}, ID: ${calculo.id}`);
        
        // Crear quizzes para Álgebra
        const ecuacionesQuiz = await storage.createQuiz({
          title: "Ecuaciones de primer grado",
          description: "Resuelve ecuaciones lineales con una incógnita.",
          categoryId: algebra.id,
          timeLimit: 15,
          difficulty: "basic",
          totalQuestions: 10
        });
        console.log(`Quiz creado: ${ecuacionesQuiz.title}, Categoría ID: ${ecuacionesQuiz.categoryId}`);
        
        const sistemasQuiz = await storage.createQuiz({
          title: "Sistemas de ecuaciones",
          description: "Resuelve sistemas lineales de dos ecuaciones.",
          categoryId: algebra.id,
          timeLimit: 20,
          difficulty: "intermediate",
          totalQuestions: 8
        });
        console.log(`Quiz creado: ${sistemasQuiz.title}, Categoría ID: ${sistemasQuiz.categoryId}`);
        
        const polinomiosQuiz = await storage.createQuiz({
          title: "Polinomios",
          description: "Operaciones con polinomios y factorización.",
          categoryId: algebra.id,
          timeLimit: 25,
          difficulty: "intermediate",
          totalQuestions: 12
        });
        console.log(`Quiz creado: ${polinomiosQuiz.title}, Categoría ID: ${polinomiosQuiz.categoryId}`);
        
        // Crear quizzes para Geometría
        const triangulosQuiz = await storage.createQuiz({
          title: "Triángulos",
          description: "Propiedades y cálculos con triángulos.",
          categoryId: geometria.id,
          timeLimit: 20,
          difficulty: "basic",
          totalQuestions: 10
        });
        console.log(`Quiz creado: ${triangulosQuiz.title}, Categoría ID: ${triangulosQuiz.categoryId}`);
        
        const circulosQuiz = await storage.createQuiz({
          title: "Círculos y áreas",
          description: "Cálculo de áreas y perímetros.",
          categoryId: geometria.id,
          timeLimit: 25,
          difficulty: "intermediate",
          totalQuestions: 8
        });
        console.log(`Quiz creado: ${circulosQuiz.title}, Categoría ID: ${circulosQuiz.categoryId}`);
        
        // Crear quizzes para Cálculo
        const limitesQuiz = await storage.createQuiz({
          title: "Límites",
          description: "Cálculo y propiedades de límites.",
          categoryId: calculo.id,
          timeLimit: 30,
          difficulty: "intermediate",
          totalQuestions: 10
        });
        console.log(`Quiz creado: ${limitesQuiz.title}, Categoría ID: ${limitesQuiz.categoryId}`);
        
        const derivadasQuiz = await storage.createQuiz({
          title: "Derivadas",
          description: "Reglas de derivación y aplicaciones.",
          categoryId: calculo.id,
          timeLimit: 35,
          difficulty: "advanced",
          totalQuestions: 12
        });
        console.log(`Quiz creado: ${derivadasQuiz.title}, Categoría ID: ${derivadasQuiz.categoryId}`);
        
        // Crear preguntas y respuestas para el quiz de ecuaciones
        const q1 = await storage.createQuestion({
          quizId: ecuacionesQuiz.id,
          content: "Resuelve la siguiente ecuación: {a}x + {b} = {c}",
          type: "equation",
          difficulty: 1,
          points: 5,
          variables: {
            a: { min: 1, max: 10 },
            b: { min: 1, max: 20 },
            c: { min: 10, max: 50 }
          }
        });
        
        await storage.createAnswer({
          questionId: q1.id,
          content: "x = {answer}",
          isCorrect: true,
          explanation: "Para resolver {a}x + {b} = {c}, despejamos x: {a}x = {c} - {b}, entonces x = ({c} - {b}) / {a}"
        });
        
        await storage.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer1}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Debes despejar x correctamente."
        });
        
        await storage.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer2}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Recuerda que debes despejar la variable x."
        });
        
        await storage.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer3}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Revisa tus cálculos."
        });
        
        // Crear más preguntas para el quiz de ecuaciones
        const q2 = await storage.createQuestion({
          quizId: ecuacionesQuiz.id,
          content: "Resuelve: {a}x - {b} = {c}",
          type: "equation",
          difficulty: 1,
          points: 5,
          variables: {
            a: { min: 1, max: 10 },
            b: { min: 1, max: 20 },
            c: { min: -10, max: 30 }
          }
        });
        
        // Crear progreso de estudiante
        await storage.createStudentProgress({
          userId: student.id,
          quizId: ecuacionesQuiz.id,
          status: "completed",
          score: 90,
          completedQuestions: 10,
          timeSpent: 720, // 12 minutos en segundos
          completedAt: new Date()
        });
        
        await storage.createStudentProgress({
          userId: student.id,
          quizId: sistemasQuiz.id,
          status: "in_progress",
          completedQuestions: 4,
          timeSpent: 480, // 8 minutos en segundos
        });
      }
    }
    
    console.log("Inicialización de datos completada");
  } catch (error) {
    console.error("Error al inicializar datos de ejemplo:", error);
  }
}