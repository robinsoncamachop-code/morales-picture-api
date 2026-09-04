# Diseño del servicio web — GA7-220501096-AA5-EV01

## Identificación y objetivo

Aprendiz: Robinson Camacho. Proyecto: Morales Picture.
Implementar una API REST sencilla con Node.js y Express para registrar usuarios y
comprobar credenciales. Corresponde a un módulo nuevo e independiente del front-end.

## Requisitos y trazabilidad

| Requisito del caso | Implementación | Verificación |
|---|---|---|
| Registrar usuario y contraseña | POST /api/registro | HTTP 201 |
| Autenticación correcta | POST /api/login | HTTP 200, mensaje satisfactorio |
| Autenticación incorrecta | Comparación de hash | HTTP 401, mensaje de error |
| Código comentado | Comentarios en archivos JavaScript propios | Lectura del código |
| Proyecto organizado | Rutas, servicio, repositorio y pruebas separados | Estructura README |
| Versionamiento | Git, rama main, respaldo bundle | git log |
| Uso de Postman | Colección de seis peticiones con comprobaciones | Ejecutar colección |
| Entrega y enlace | ZIP y ENLACE_REPOSITORIO.txt | Completar enlace real de GitHub |

## Diseño por responsabilidades

Postman → aplicación Express → validación → ruta de registro/login.
La ruta usa el servicio de contraseñas y el repositorio de usuarios.
El repositorio lee y escribe data/usuarios.json.
La respuesta vuelve al cliente en JSON con su código HTTP.

- server.js: configura el archivo de datos e inicia el servidor.
- app.js: define rutas y traduce los resultados a HTTP.
- password.js: genera sal, deriva hash y comprueba la contraseña.
- users.js: busca e inserta usuarios sin duplicados.
- api.test.js: comprueba el servicio por HTTP.

## Modelo de datos

| Campo | Tipo | Uso |
|---|---|---|
| id | texto UUID | Identificador generado |
| usuario | texto | Nombre normalizado, único |
| salt | texto hexadecimal | Sal aleatoria de 16 bytes |
| hash | texto hexadecimal | Derivación scrypt de 64 bytes |
| creadoEn | texto ISO | Fecha del registro |

La contraseña original se procesa para derivar el hash y nunca se escribe en
el archivo de usuarios ni se devuelve en las respuestas.

## Contrato de entrada

Ambas operaciones reciben Content-Type: application/json y un objeto:

```json
{
  "usuario": "robinson",
  "contrasena": "ClaveDemo2026!"
}
```

- usuario: texto de 3 a 30 caracteres, letras ASCII, números o guion bajo.
- Se quitan espacios exteriores del usuario y se convierte a minúsculas.
- contrasena: texto de 8 a 128 caracteres y no compuesto solo por espacios.
- La contraseña es sensible a mayúsculas y espacios; no se modifica.
- Se usan nombres de campos sin tildes para facilitar la práctica.
- El límite del cuerpo de la petición es 4 KB.
- Un campo inválido devuelve 400; credenciales válidas en formato pero incorrectas devuelven 401.

## Contrato de salida

| Método y ruta | Resultado | HTTP | Mensaje |
|---|---|---:|---|
| GET / | Estado del servicio | 200 | API Morales Picture en funcionamiento |
| POST /api/registro | Usuario nuevo | 201 | Usuario registrado correctamente |
| POST /api/registro | Duplicado | 409 | El usuario ya se encuentra registrado |
| POST /api/login | Credenciales correctas | 200 | Autenticación satisfactoria |
| POST /api/login | Contraseña incorrecta o usuario desconocido | 401 | Error en la autenticación |
| POST, cualquiera de las dos rutas | Campos inválidos | 400 | Explicación de formato esperado |
| POST, cualquiera de las dos rutas | JSON incorrecto | 400 | El cuerpo JSON no es válido |
| POST, cualquiera de las dos rutas | Tipo incorrecto | 415 | Utilice Content-Type: application/json |
| POST, cualquiera de las dos rutas | Cuerpo mayor al límite | 413 | La petición supera el tamaño permitido |
| Ruta desconocida | No encontrada | 404 | Ruta no encontrada |
| Error imprevisto | Fallo interno | 500 | Error interno del servidor |

## Algoritmos

Registro:
1. Validar JSON y campos.
2. Normalizar el usuario.
3. Generar sal aleatoria y hash con scrypt.
4. Comprobar duplicidad e insertar de forma serializada.
5. Responder 201 con mensaje, identificador y nombre.

Login:
1. Validar campos y normalizar el usuario.
2. Buscar al usuario.
3. Derivar la clave de la contraseña recibida usando su sal.
4. Comparar mediante timingSafeEqual.
5. Responder 200 si coincide; de lo contrario, 401.

## Decisiones de alcance

No se crean interfaces gráficas, tokens ni sesiones porque no son necesarios para
el caso solicitado. El servidor escucha solamente en 127.0.0.1. Los datos se
conservan al reiniciar y se excluyen del repositorio.

La serialización evita duplicados por solicitudes concurrentes dentro de un solo
proceso. No sirve para varias instancias compartiendo el mismo archivo. Una futura
versión productiva necesitaría una base de datos, límites de intentos, HTTPS,
gestión de sesiones y revisión de seguridad. Esta evidencia usa datos ficticios.

