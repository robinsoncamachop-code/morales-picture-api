/*
 * Punto de entrada: inicia la API local en el puerto 3000.
 * No requiere modificar rutas para ejecutarse desde Windows o macOS.
 */
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createUserRepository } from "./repositories/users.js";

const dataPath = fileURLToPath(new URL("../data/usuarios.json", import.meta.url));
const repository = createUserRepository(dataPath);
const app = createApp(repository);
const port = Number(process.env.PORT || 3000);

// Escucha solo en este computador: práctica local, no publicación en Internet.
const server = app.listen(port, "127.0.0.1", () => {
  console.log("API Morales Picture: http://localhost:" + port);
  console.log("Use Postman para POST /api/registro y POST /api/login.");
});

// Explica el caso habitual de tener otra evidencia abierta en el mismo puerto.
server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE"
    ? "El puerto está ocupado. Detenga la otra aplicación con Control + C."
    : "No fue posible iniciar la API: " + error.message);
  process.exitCode = 1;
});

