export const motivationalQuotes = [
    "¡Cada paso cuenta! Sigue avanzando hacia tus metas.",
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "No te detengas, estás más cerca de lo que crees.",
    "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
    "Cree en ti mismo y en todo lo que eres.",
    "Tu único límite es tu mente.",
    "Hoy es un buen día para aprender algo nuevo.",
    "La perseverancia es la clave del éxito.",
    "Convierte los obstáculos en oportunidades.",
    "Tu esfuerzo de hoy es el éxito de mañana.",
    "Sigue brillando, el mundo necesita tu luz.",
    "Aprender es crecer, y tú estás creciendo a pasos agigantados.",
    "No sueñes con el éxito, trabaja para conseguirlo.",
    "La disciplina es el puente entre metas y logros.",
    "Eres capaz de cosas increíbles."
];

export const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
};
