# Resultados de verificación

Evidencia: GA7-220501096-AA5-EV01  
Proyecto: API Morales Picture  
Fecha: 4 de septiembre de 2026

## Comprobación de sintaxis

Comando: `npm run check`. Resultado: correcto, sin errores de sintaxis
en los cuatro archivos de implementación.

## Pruebas HTTP con Node.js

Comando: `npm test`. Resultado: 15 casos internos aprobados
más la prueba contenedora (Node informa 16 pruebas), cero fallos.

1. Ruta informativa GET /.
2. Registro correcto y respuesta sin credenciales privadas.
3. Persistencia con hash y sal.
4. Duplicados sin distinción entre mayúsculas y minúsculas.
5. Inicio de sesión correcto.
6. Contraseña incorrecta.
7. Usuario desconocido.
8. Campos faltantes, tipos incorrectos y límites.
9. JSON mal formado.
10. Tipo de contenido no admitido.
11. Tamaño de petición excesivo.
12. Ruta inexistente.
13. Registros concurrentes sin duplicados ni pérdida de datos.
14. Lectura persistente desde una segunda instancia de la aplicación.
15. Respuesta genérica ante fallo de almacenamiento.

Los casos automáticos utilizan carpetas temporales y puertos libres.

## Colección Postman ejecutada con Newman

Se inició realmente la API en localhost:3000 y se ejecutó su colección
mediante Newman (ejecutor de colecciones de Postman). No se utilizó la
interfaz gráfica de Postman para esta comprobación.

| Petición | HTTP observado | Resultado |
|---|---:|---|
| Registrar usuario | 201 | Aprobado |
| Login correcto | 200 | Aprobado |
| Contraseña incorrecta | 401 | Aprobado |
| Usuario inexistente | 401 | Aprobado |
| Registro duplicado | 409 | Aprobado |
| Campos faltantes | 400 | Aprobado |

Total: 6 peticiones, 11 comprobaciones, 0 fallos.
Los datos de demostración generados en esta ejecución no se incluyen en el ZIP.

## Alcance de esta verificación

Se verifica la funcionalidad académica, no una auditoría de seguridad ni
pruebas de carga. El archivo JSON está diseñado para una instancia local.
El README explica cómo repetir la colección en Postman y tomar capturas
reales para la sustentación.

## Pendiente de entrega

Crear el repositorio en GitHub, publicar el código y sustituir la nota pendiente
en ENLACE_REPOSITORIO.txt por la URL real. El historial Git local está preparado.

