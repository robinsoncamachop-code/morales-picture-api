/*
 * Pruebas automáticas de la API real mediante peticiones HTTP.
 * Usan una carpeta temporal y no alteran los usuarios de la práctica.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { createUserRepository } from "../src/repositories/users.js";

test("Registro y autenticación de Morales Picture", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "morales-api-test-"));
  const file = join(directory, "usuarios.json");
  const server = createApp(createUserRepository(file)).listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseUrl = "http://127.0.0.1:" + server.address().port;
  const credentials = { usuario: "robinson_prueba", contrasena: "robinson123" };

  // Cierra el servidor y elimina únicamente la carpeta temporal de esta prueba.
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    await rm(directory, { recursive: true, force: true });
  });

  async function post(path, body) {
    const response = await fetch(baseUrl + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  await t.test("GET / informa que la API está activa", async () => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    assert.match((await response.json()).mensaje, /Morales Picture/);
  });

  await t.test("Registro válido devuelve 201 y no expone la contraseña", async () => {
    const result = await post("/api/registro", credentials);
    assert.equal(result.status, 201);
    assert.equal(result.body.usuario.nombre, credentials.usuario);
    assert.deepEqual(Object.keys(result.body.usuario).sort(), ["id", "nombre"]);
    assert.equal(JSON.stringify(result.body).includes(credentials.contrasena), false);
  });

  await t.test("La contraseña se guarda con hash y sal", async () => {
    const text = await readFile(file, "utf8");
    const users = JSON.parse(text);
    assert.equal(text.includes(credentials.contrasena), false);
    assert.equal(users[0].hash.length, 128);
    assert.equal(users[0].salt.length, 32);
  });

  await t.test("Un usuario duplicado, incluso en mayúsculas, devuelve 409", async () => {
    assert.equal((await post("/api/registro", {
      ...credentials, usuario: credentials.usuario.toUpperCase(),
    })).status, 409);
  });

  await t.test("Login correcto devuelve 200 y mensaje satisfactorio", async () => {
    const result = await post("/api/login", credentials);
    assert.equal(result.status, 200);
    assert.equal(result.body.mensaje, "Autenticación satisfactoria");
  });

  await t.test("Contraseña incorrecta devuelve 401", async () => {
    const result = await post("/api/login", { ...credentials, contrasena: "Incorrecta2026" });
    assert.equal(result.status, 401);
    assert.equal(result.body.mensaje, "Error en la autenticación");
  });

  await t.test("Usuario inexistente devuelve el mismo error 401", async () => {
    const result = await post("/api/login", { ...credentials, usuario: "no_existe" });
    assert.equal(result.status, 401);
    assert.equal(result.body.mensaje, "Error en la autenticación");
  });

  await t.test("Campos faltantes, tipos incorrectos y límites devuelven 400", async () => {
    for (const body of [
      {}, { usuario: 12, contrasena: "12345678" },
      { usuario: "ab", contrasena: "12345678" },
      { usuario: "nombre con espacios", contrasena: "12345678" },
      { usuario: "valido", contrasena: "corta" },
      { usuario: "valido", contrasena: " ".repeat(8) },
      { usuario: "valido", contrasena: "a".repeat(129) },
    ]) {
      assert.equal((await post("/api/registro", body)).status, 400);
      assert.equal((await post("/api/login", body)).status, 400);
    }
  });

  await t.test("JSON inválido devuelve 400", async () => {
    const response = await fetch(baseUrl + "/api/registro", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{mal",
    });
    assert.equal(response.status, 400);
  });

  await t.test("Tipo de contenido incorrecto devuelve 415", async () => {
    const response = await fetch(baseUrl + "/api/login", { method: "POST", body: "texto" });
    assert.equal(response.status, 415);
  });

  await t.test("Petición demasiado grande devuelve 413", async () => {
    assert.equal((await post("/api/registro", {
      usuario: "valido", contrasena: "a".repeat(5000),
    })).status, 413);
  });

  await t.test("Ruta desconocida devuelve 404", async () => {
    assert.equal((await fetch(baseUrl + "/ruta-inexistente")).status, 404);
  });

  await t.test("Registros simultáneos no duplican ni pierden usuarios", async () => {
    const repeated = { usuario: "concurrente", contrasena: "ClaveDemo2026!" };
    const results = await Promise.all([
      post("/api/registro", repeated), post("/api/registro", repeated),
      post("/api/registro", { ...repeated, usuario: "otro_cliente" }),
    ]);
    assert.deepEqual(results.slice(0, 2).map((item) => item.status).sort(), [201, 409]);
    assert.equal(results[2].status, 201);
    assert.equal(JSON.parse(await readFile(file, "utf8")).length, 3);
  });

  await t.test("Los usuarios siguen disponibles en una nueva instancia", async () => {
    const anotherServer = createApp(createUserRepository(file)).listen(0, "127.0.0.1");
    await once(anotherServer, "listening");
    try {
      const response = await fetch("http://127.0.0.1:" + anotherServer.address().port + "/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      assert.equal(response.status, 200);
    } finally {
      await new Promise((resolve) => anotherServer.close(resolve));
    }
  });

  await t.test("Una falla de almacenamiento devuelve 500 sin detalles privados", async () => {
    const broken = createApp({ find: async () => { throw new Error("detalle privado"); } })
      .listen(0, "127.0.0.1");
    await once(broken, "listening");
    try {
      const response = await fetch("http://127.0.0.1:" + broken.address().port + "/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { mensaje: "Error interno del servidor" });
    } finally {
      await new Promise((resolve) => broken.close(resolve));
    }
  });
});

