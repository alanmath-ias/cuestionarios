import nodemailer from "nodemailer";

/**
 * Sends a welcome email to a newly registered user.
 * @param email - The user's email address.
 * @param name - The user's name or username.
 */
export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("⚠️ SMTP not configured. Skipping welcome email.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: parseInt(process.env.SMTP_PORT || "587") === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const bannerUrl = "https://imagenes.alanmath.com/nueva-actividad.jpg";

        await transporter.sendMail({
            from: `"AlanMath" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "¡Bienvenido a la familia AlanMath! 🚀",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${bannerUrl}" alt="Bienvenido a AlanMath" style="max-width: 250px; height: auto; border-radius: 8px;">
                </div>
                
                <h1 style="color: #4F46E5; text-align: center;">¡Hola ${name}!</h1>
                
                <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                  Estamos muy felices de que te hayas unido a <strong>AlanMath</strong>. 
                  Aquí encontrarás un espacio diseñado para potenciar tu aprendizaje de una manera divertida y efectiva.
                </p>

                <div style="background-color: #F3F4F6; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #E5E7EB;">
                  <h3 style="color: #111827; margin-top: 0; font-size: 18px;">Tu Aventura en AlanMath incluye:</h3>
                  <ul style="color: #4B5563; padding-left: 20px; font-size: 15px;">
                    <li style="margin-bottom: 12px;">🧠 <strong>Cuestionarios de Nivel:</strong> Practica con exámenes reales tipo universidad y colegio.</li>
                    <li style="margin-bottom: 12px;">🤖 <strong>IA Personalizada:</strong> Crea tus propios cuestionarios justo de lo que necesitas. ¡Nuestra IA los genera para ti al instante! 🎯</li>
                    <li style="margin-bottom: 12px;">✅ <strong>Aprende de tus Errores:</strong> No solo sabrás si fallaste; te daremos una <strong>explicación paso a paso</strong> para que domines el proceso.</li>
                    <li style="margin-bottom: 12px;">💡 <strong>Pistas Inteligentes:</strong> El empujón exacto que necesitas cuando te atasques en un ejercicio.</li>
                    <li style="margin-bottom: 12px;">🎓 <strong>Refuerzo por WhatsApp:</strong> Chat directo con expertos para resolver tus dudas más difíciles.</li>
                    <li style="margin-bottom: 12px;">📺 <strong>Videoteca Exclusiva:</strong> Contenido en video para profundizar en cada tema matemático.</li>
                  </ul>
                </div>

                <p style="text-align: center; font-weight: bold; color: #4F46E5; font-size: 18px;">
                  ¡Tu camino hacia el dominio de las matemáticas comienza hoy!
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://app.alanmath.com/auth" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Ir a la App</a>
                  <a href="https://alanmath.com/" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visitar Sitio Web</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                <p style="font-size: 12px; color: #6B7280; text-align: center;">Este es un mensaje automático del sistema AlanMath.</p>
              </div>
            `,
        });

        console.log(`📧 Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`❌ Error sending welcome email to ${email}:`, error);
    }
}
