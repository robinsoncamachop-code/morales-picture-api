/*
 * Seguridad de contraseñas con herramientas incluidas en Node.js.
 * Se guarda una derivación (hash), nunca la contraseña original.
 */
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
// Parámetros compartidos para crear y comprobar el hash.
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** Genera una sal aleatoria distinta para cada registro. */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64, options);
  return { salt, hash: key.toString("hex") };
}

/** Compara las claves sin utilizar una comparación de texto normal. */
export async function verifyPassword(password, saved) {
  const key = await deriveKey(password, saved.salt, 64, options);
  return timingSafeEqual(key, Buffer.from(saved.hash, "hex"));
}

