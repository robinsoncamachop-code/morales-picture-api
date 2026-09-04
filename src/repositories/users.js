/*
 * Persistencia sencilla en JSON para la práctica local.
 * El archivo no se sube a Git y sus contraseñas están protegidas con hash.
 * Esta solución está pensada para una sola instancia del servidor.
 */
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

export function createUserRepository(filePath) {
  // Serializa registros simultáneos para evitar sobrescribir usuarios.
  let pending = Promise.resolve();

  async function readUsers() {
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      // No reemplazar un archivo dañado: el error debe ser revisado.
      throw error;
    }
  }

  return {
    /** Busca un usuario por su nombre normalizado. */
    async find(username) {
      const users = await readUsers();
      return users.find((user) => user.usuario === username);
    },

    /** Inserta sin duplicados y reemplaza el archivo de forma atómica. */
    async add(username, passwordData) {
      const operation = pending.then(async () => {
        const users = await readUsers();
        if (users.some((user) => user.usuario === username)) return null;

        const user = {
          id: randomUUID(),
          usuario: username,
          ...passwordData,
          creadoEn: new Date().toISOString(),
        };
        users.push(user);
        await mkdir(dirname(filePath), { recursive: true });
        const temporary = filePath + ".tmp";
        await writeFile(temporary, JSON.stringify(users, null, 2), { mode: 0o600 });
        await rename(temporary, filePath);
        return user;
      });
      // Una operación fallida no debe bloquear los siguientes registros.
      pending = operation.catch(() => {});
      return operation;
    },
  };
}

