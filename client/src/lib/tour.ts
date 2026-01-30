import { driver, Config } from "driver.js";
import "driver.js/dist/driver.css";

const driverConfig: Config = {
    showProgress: true,
    animate: true,
    stagePadding: 10, // Larger highlight circles
    allowClose: true,
    doneBtnText: 'Finalizar',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    popoverClass: 'driverjs-theme',
};

export const startDashboardTour = () => {
    // 1. Determine which alert element is visible
    const getStartedAlert = document.getElementById('tour-get-started-alert');
    const pendingAlert = document.getElementById('tour-pending-alert');

    let alertStep = null;
    if (getStartedAlert) {
        alertStep = {
            element: '#tour-get-started-alert',
            popover: {
                title: 'Tus Alertas',
                description: 'Aquí aparecerán las notificaciones de nuevos cuestionarios asignados y comentarios de tus profesores. ¡Mantente atento!',
                side: "bottom",
                align: 'start'
            }
        };
    } else if (pendingAlert) {
        alertStep = {
            element: '#tour-pending-alert',
            popover: {
                title: 'Tus Alertas',
                description: 'Aquí tienes notificaciones importantes sobre tus actividades pendientes. ¡Revísalas para estar al día!',
                side: "bottom",
                align: 'start'
            }
        };
    }

    // 2. Define base steps
    const steps: any[] = [
        {
            element: '#tour-welcome',
            popover: {
                title: 'Bienvenido',
                description: 'Aquí puedes ver cuantos Créditos de Pistas te quedan y la alerta de tus Actividades Pendientes',
                side: "bottom",
                align: 'start'
            }
        }
    ];

    if (alertStep) {
        steps.push(alertStep);
    }

    steps.push(
        {
            element: '#tour-pending',
            popover: {
                title: 'Actividades Pendientes',
                description: 'Aquí aparecerán tus cuestionarios asignados. Cuando tengas tareas, podrás elegir entre:\n\n1. **Mini:** Versión corta.\n2. **Normal:** Versión completa.',
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
    );

    // 3. Define Sidebar Sequence
    steps.push({
        element: '#tour-sidebar-extras',
        popover: {
            title: 'Recursos Adicionales',
            description: 'Aquí encontrarás enlaces a nuestras redes sociales, eBook exclusivo, sitio web y la Zona de Descanso para relajarte.',
            side: "left",
            align: 'start'
        }
    });

    const driverObj = driver({
        ...driverConfig,
        steps: steps
    });

    driverObj.drive();

    // Mark as seen when tour actually starts (or finishes? The content says "starts" is better for opt-in so they don't get the toast again if they abandon it)
    // Actually, let's mark it as seen immediately so the toast stops appearing.
    fetch('/api/user/tour-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourType: 'dashboard' })
    }).then(res => {
        if (res.ok) {
            // We need queryClient here. Importing it might be circular or messy if not careful.
            // However, simple fetch is sidebar logic. Invalidating query is for the UI.
            // Let's import queryClient from lib/queryClient
            import("@/lib/queryClient").then(({ queryClient }) => {
                queryClient.invalidateQueries({ queryKey: ["current-user"] });
            });
        }
    });
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
