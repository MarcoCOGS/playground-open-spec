# Propuesta

## Motivo

La aplicación inicial solo expone un saludo fijo mediante `GET /` y no ofrece una forma validada de saludar a una persona. Se necesita un contrato HTTP para ese comportamiento y una estructura que preserve las reglas de dominio fuera de NestJS e infraestructura.

## Cambios propuestos

- Incorporar `POST /greetings`, que recibe un cuerpo JSON con `name` y responde JSON con `message: "Hola {name}"`.
- Validar que `name` tenga entre 5 y 20 caracteres y esté compuesto solo por letras Unicode y espacios simples entre partes; las entradas inválidas responden `400 Bad Request` con un error de validación JSON.
- Usar Joi en el límite HTTP para validar la entrada y mantener las reglas de formato y longitud en el dominio.
- Organizar la funcionalidad en las capas de dominio, aplicación e infraestructura/presentación conforme a Clean Architecture y DDD.
- Migrar la configuración y las pruebas existentes de Vitest a Jest, elegido como marco de pruebas del proyecto, y añadir cobertura unitaria y de extremo a extremo del nuevo contrato.

## Capacidades

### Nuevas capacidades

- `greeting-api`: Expone un saludo HTTP JSON validado a partir de un nombre proporcionado por el cliente.

### Capacidades modificadas

- Ninguna.

## Impacto

- Añade la API pública `POST /greetings` sin modificar el endpoint raíz existente.
- Añade un módulo de la funcionalidad de saludos, sus adaptadores HTTP y el cableado correspondiente en NestJS.
- Añade Joi como dependencia de ejecución y sustituye las dependencias, scripts y archivos de configuración de Vitest por su equivalente en Jest para TypeScript.
