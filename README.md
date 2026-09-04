# Morales Picture — API de registro e inicio de sesión

**Aprendiz:** Robinson Camacho  
**Evidencia:** GA7-220501096-AA5-EV01  
**Herramientas:** Visual Studio Code, Node.js, Express, Postman y Git.

## Qué hace

Registra un usuario y comprueba su contraseña al iniciar sesión. Responde con JSON.
Es un servicio web, no una página con botones. En el navegador solo verá el mensaje
informativo; las operaciones se envían desde Postman.

- Registro correcto: HTTP 201.
- Inicio de sesión correcto: HTTP 200 y "Autenticación satisfactoria".
- Credenciales incorrectas: HTTP 401 y "Error en la autenticación".
- Usuario repetido: HTTP 409.
- Datos inválidos: HTTP 400.
- Contraseñas guardadas con hash y sal, nunca en texto visible.
- Usuarios conservados en `data/usuarios.json` al reiniciar.

## 1. Ejecutar en Visual Studio Code

1. Instale Node.js 22 o superior.
2. Descomprima el ZIP.
3. Abra **Archivo → Abrir carpeta** y seleccione **ROBINSON_CAMACHO_AA5_EV01**.
4. Abra **Terminal → Nueva terminal**.
5. Asegúrese de que la terminal está en la carpeta que contiene `package.json`.
6. Ejecute, uno por uno:

```bash
node -v
npm -v
npm install
npm start
```

La terminal mostrará `API Morales Picture: http://localhost:3000`.
Déjela abierta mientras usa Postman. Para detenerla presione **Control + C**.

No ejecute `npx create-react-app`: esta entrega es una API de Express independiente
del front-end de la evidencia anterior.

### Si aparece ENOENT o no encuentra package.json

La terminal está en otra carpeta. En macOS escriba `pwd` y `ls`; en Windows
use `cd` y `dir` para verificar. Abra una terminal desde la carpeta del proyecto,
o escriba `cd ` y arrastre esa carpeta desde Finder a la terminal en macOS.

### Si el puerto 3000 está ocupado

Detenga la página de la evidencia anterior desde su terminal con Control + C.
Solo una aplicación puede usar el mismo puerto y dirección a la vez.
También puede cambiar el puerto mediante la variable de entorno PORT, y luego
actualizar `base_url` en Postman.

## 2. Prueba manual con Postman

Con la API encendida, cree una petición y configure:

- Método: **POST**.
- Dirección: **http://localhost:3000/api/registro**.
- Pestaña **Body → raw → JSON**.
- Encabezado `Content-Type: application/json`.

Escriba datos ficticios como:

```json
{
  "usuario": "robinson",
  "contrasena": "ClaveDemo2026!"
}
```

Presione **Send**. Debe recibir HTTP **201 Created** y:

```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id": "identificador-generado-por-el-servidor",
    "nombre": "robinson"
  }
}
```

El identificador del ejemplo representa un valor variable.

### Inicio de sesión correcto

Cambie la dirección a **http://localhost:3000/api/login**, conserve POST,
Body → raw → JSON y el mismo usuario y contraseña. Presione **Send**.

```json
{
  "mensaje": "Autenticación satisfactoria"
}
```

Código esperado: **200 OK**.

### Inicio de sesión incorrecto

En la misma petición cambie la contraseña por `OtraClave2026!` y envíe:

```json
{
  "mensaje": "Error en la autenticación"
}
```

Código esperado: **401 Unauthorized**.

### Colección lista para importar

1. En Postman seleccione **Import**.
2. Seleccione `postman/Morales_Picture.postman_collection.json`.
3. Ejecute las seis peticiones en orden, o use el ejecutor de colecciones.
4. La primera petición genera un usuario ficticio único para cada ejecución.
5. Consulte **Test Results**: cada petición comprueba automáticamente su código HTTP.

Si se repite manualmente el registro con el mismo usuario, HTTP 409 es el
resultado correcto, no un fallo del programa.

**Capturas sugeridas para la sustentación:** registro 201, login 200, error 401 y
resultados de la colección. Deben tomarse al ejecutarlo realmente en su Postman;
esta entrega no incluye capturas simuladas.

## 3. Pruebas automáticas

```bash
npm run check
npm test
```

Las pruebas levantan servidores HTTP temporales en puertos libres, usan datos
ficticios y no necesitan que `npm start` esté ejecutándose.
Revisan registro, login, validaciones, duplicados, persistencia y errores.

## 4. Organización

```text
src/
  server.js                   Inicio del servidor local.
  app.js                      Rutas, validaciones y respuestas.
  services/password.js        Hash y verificación de contraseñas.
  repositories/users.js       Lectura y escritura de usuarios.
data/                         Usuarios generados durante la práctica.
tests/api.test.js             Pruebas HTTP automatizadas.
postman/                      Colección importable.
docs/DISENO_API.md            Diseño, contratos y decisiones.
docs/RESULTADO_PRUEBAS.md     Resultado real de las verificaciones.
ENLACE_REPOSITORIO.txt        Enlace que debe completar antes de entregar.
HISTORIAL_GIT.bundle          Respaldo del historial Git de la implementación.
```

## 5. Publicar en GitHub y completar la entrega

El código ya fue desarrollado con Git; el ZIP de código no incluye una carpeta
`.git` oculta. Se entrega un respaldo portátil del historial. Para restaurarlo,
en una terminal ubicada en la carpeta de la evidencia ejecute:

```bash
git clone HISTORIAL_GIT.bundle ../morales-picture-api-github
cd ../morales-picture-api-github
```

Cree en su cuenta de GitHub un repositorio llamado `morales-picture-api`.
Déjelo vacío: no agregue README, licencia ni .gitignore desde GitHub.
Elija público solo si desea que la profesora pueda verlo sin invitación.

Abra `ENLACE_REPOSITORIO.txt` en la carpeta recién clonada, reemplace la nota
pendiente por el enlace REAL y guarde. Luego ejecute (reemplace los valores
de ejemplo por su correo y usuario reales):

```bash
git config user.name "Robinson Camacho"
git config user.email "TU_CORREO"
git add ENLACE_REPOSITORIO.txt
git commit -m "docs: agregar enlace de GitHub"
git remote set-url origin https://github.com/TU_USUARIO/morales-picture-api.git
git push -u origin main
```

Complete la autenticación de GitHub si se solicita. No escriba claves o tokens
en los archivos del proyecto. No suba `node_modules`, `data/usuarios.json` ni
archivos `.env`; el `.gitignore` los excluye.

Verifique que los archivos aparecen en GitHub. Copie también el enlace real al
`ENLACE_REPOSITORIO.txt` de su carpeta de entrega y vuelva a comprimirla como
**ROBINSON_CAMACHO_AA5_EV01.zip**, sin dependencias ni datos de usuarios.
Puede descargar el código desde GitHub y renombrar su carpeta y ZIP con este nombre.

**Pendiente antes de entregar:** crear/publicar el repositorio y completar su
enlace. No se ha creado un repositorio de GitHub automáticamente.

## Alcance y límites

Práctica académica local para una sola instancia del servidor. No incluye JWT,
cookies de sesión, recuperación de contraseña ni rutas privadas: el caso pide
verificar credenciales y devolver un mensaje. Un login correcto no mantiene una
sesión abierta. No se conecta todavía al front-end anterior.

El archivo JSON sirve para practicar persistencia; no reemplaza una base de
datos para producción. Antes de publicar una API de autenticación real se necesitan,
entre otras medidas, HTTPS, límites de intentos, sesiones seguras y una base de
datos con restricciones de unicidad. Use únicamente credenciales ficticias aquí.

## Referencias

- Express: https://expressjs.com/en/guide/routing.html
- Errores en Express 5: https://expressjs.com/en/guide/error-handling.html
- Node.js, scrypt y timingSafeEqual: https://nodejs.org/api/crypto.html

