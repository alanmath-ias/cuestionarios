import { driver, Config } from "driver.js";
import "driver.js/dist/driver.css";

const driverConfig: Config = {
    showProgress: true,
    animate: true,
    opacity: 0.75,
    stagePadding: 10, // Larger highlight circles
    allowClose: true,
    overlayClickNext: false,
    doneBtnText: 'Finalizar',
    closeBtnText: 'Cerrar',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    keyboardControl: true,
    popoverClass: 'driverjs-theme',
};

export const startDashboardTour = () => {
    const driverObj = driver({
        ...driverConfig,
        steps: [
            {
                element: '#tour-welcome',
                popover: {
                    title: 'Bienvenido',
                    description: 'Aquí puedes ver cuantos Créditos de Pistas te quedan y la alerta de tus Actividades Pendientes',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#tour-pending',
                popover: {
                    title: 'Actividades Pendientes',
                    description: 'Aquí verás los cuestionarios asignados. Tienes dos opciones:\n\n1. **Mini:** Versión corta (50% preguntas).\n2. **Normal:** Versión completa.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#tour-quiz-list',
                popover: {
                    title: 'Materias Disponibles',
                    description: 'Explora por materias. Encuentra los Videos Explicativos de cada Área y Entrena para prepararte para tus exámenes',
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#tour-stats',
                popover: {
                    title: 'Tu Progreso',
                    description: 'Visualiza tu avance general y por categorías. ¡Mantén esas barras llenas!',
                    side: "left",
                    align: 'start'
                }
            }
        ]
    });

    driverObj.drive();
};

export const startActiveQuizTour = () => {
    const driverObj = driver({
        ...driverConfig,
        steps: [
            {
                element: '#tour-quiz-navigation',
                popover: {
                    title: 'Navegación',
                    description: 'Usa estos círculos para moverte entre las preguntas. Blanco = Actual, Verde = Correcta, Rojo = Errada',
                    side: "top",
                    align: 'center'
                }
            },
            {
                element: '#tour-hint-button',
                popover: {
                    title: '¿Necesitas Ayuda?',
                    description: 'Si te atascas, usa este botón para pedir una pista. Consumirá tus créditos.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#tour-timer',
                popover: {
                    title: 'Tiempo Restante',
                    description: 'Mantén un ojo en el reloj. ¡Administra bien tu tiempo!',
                    side: "bottom",
                    align: 'start'
                }
            }
        ]
    });

    driverObj.drive();
};

export const startQuizResultsTour = () => {
    const driverObj = driver({
        ...driverConfig,
        steps: [
            {
                element: '#tour-score-summary',
                popover: {
                    title: 'Resumen de Resultados',
                    description: 'Aquí ves tu puntuación final, aciertos y tiempo. ¡Intenta mejorar en cada intento!',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#tour-explanation-button',
                popover: {
                    title: 'Entiende tus Errores',
                    description: 'En las preguntas incorrectas, haz clic aquí para recibir una explicación detallada paso a paso.',
                    side: "left",
                    align: 'start'
                }
            }
        ]
    });

    driverObj.drive();
};

export const startTour = (pathname: string) => {
    // Add a small delay to allow menus to close and UI to stabilize
    setTimeout(() => {
        if (pathname === '/' || pathname === '/dashboard' || pathname === '/admin/AdminDashboard') {
            startDashboardTour();
        } else if (pathname.startsWith('/quiz/')) {
            startActiveQuizTour();
        } else if (pathname.startsWith('/results/')) {
            startQuizResultsTour();
        }
    }, 300);
};
