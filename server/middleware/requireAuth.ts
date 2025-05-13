import { Request, Response, NextFunction } from "express";
import { storage } from "server/storage.js"; // ✅ extensión .js agregada//ajusta si tu path es distinto

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  console.log("🧩 Session userId (auth):", userId);

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ error: "Usuario no válido" });
    }

    req.user = { id: user.id }; // aquí asignamos user.id a req.user
    next();
  } catch (error) {
    console.error("❌ Error en requireAuth:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
