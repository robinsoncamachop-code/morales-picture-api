/*
 * API de Morales Picture: registro e inicio de sesión.
 * Express recibe JSON y responde con mensajes y códigos HTTP.
 */
import express from "express";
import { hashPassword, verifyPassword } from "./services/password.js";

/** Construye la aplicación; recibe el repositorio para facilitar las pruebas. */
export function createApp(repository) {
  const app = express();
  app.disable("x-powered-by");
  // Limita el tamaño de las peticiones y acepta únicamente objetos JSON.
  app.use(express.json({ limit: "4kb" }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  // Ruta informativa; no representa una página web con formularios.
  app.get("/", (req, res) => {
    res.json({
      mensaje: "API Morales Picture en funcionamiento",
      registro: "POST /api/registro",
      login: "POST /api/login",
    });
  });

  /** Valida los campos y normaliza solamente el nombre de usuario. */
  function validate(req, res, next) {
    if (!req.is("application/json")) {
      return res.status(415).json({ mensaje: "Utilice Content-Type: application/json" });
    }
    const { usuario, contrasena } = req.body ?? {};
    if (
      typeof usuario !== "string" ||
      !/^[a-zA-Z0-9_]{3,30}$/.test(usuario.trim()) ||
      typeof contrasena !== "string" ||
      contrasena.length < 8 ||
      contrasena.length > 128 ||
      !contrasena.trim()
    ) {
      return res.status(400).json({
        mensaje: "Usuario: 3 a 30 letras, números o guion bajo. Contraseña: 8 a 128 caracteres, no solo espacios.",
      });
    }
    req.credentials = { usuario: usuario.trim().toLowerCase(), contrasena };
    next();
  }

  // Crea el usuario y devuelve solo los datos públicos.
  app.post("/api/registro", validate, async (req, res) => {
    const { usuario, contrasena } = req.credentials;
    const passwordData = await hashPassword(contrasena);
    const user = await repository.add(usuario, passwordData);
    if (!user) {
      return res.status(409).json({ mensaje: "El usuario ya se encuentra registrado" });
    }
    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: { id: user.id, nombre: user.usuario },
    });
  });

  // Compara las credenciales con el usuario guardado.
  app.post("/api/login", validate, async (req, res) => {
    const { usuario, contrasena } = req.credentials;
    const user = await repository.find(usuario);
    if (!user || !(await verifyPassword(contrasena, user))) {
      // El mismo mensaje evita revelar si el usuario existe.
      return res.status(401).json({ mensaje: "Error en la autenticación" });
    }
    return res.status(200).json({ mensaje: "Autenticación satisfactoria" });
  });

  // Responde en JSON cuando la ruta no existe.
  app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
  });

  // Express 5 dirige aquí los errores de las funciones asíncronas.
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ mensaje: "El cuerpo JSON no es válido" });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ mensaje: "La petición supera el tamaño permitido" });
    }
    // No enviar archivos, contraseñas ni detalles internos al cliente.
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  });

  return app;
}

