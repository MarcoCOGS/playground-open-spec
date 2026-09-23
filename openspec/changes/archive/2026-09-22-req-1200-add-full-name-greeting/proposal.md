# Propuesta: REQ-1200 — saludo por nombre completo

## Motivo

La API solo permite saludar usando un único nombre mediante `POST /greetings`. REQ-1200 incorpora un contrato para saludar con nombre y apellido manteniendo intacto el contrato ya publicado.

## Cambios propuestos

- Incorporar `POST /greetings/full-name`, que recibe un cuerpo JSON con `name` y `lastName` y responde `Hola {name} {lastName}` en JSON.
- Exigir para ambos campos la misma regla vigente de nombre: texto obligatorio de 5 a 20 caracteres, letras Unicode y espacios simples entre partes; cualquier valor inválido devuelve `400 Bad Request` con un error JSON de validación.
- Mantener sin cambios el comportamiento, la validación y la respuesta de `POST /greetings`.

## Capacidades

### Nuevas capacidades

- Ninguna.

### Capacidades modificadas

- `greeting-api`: ampliar el contrato de saludos con el endpoint de nombre completo y sus reglas de validación, preservando el endpoint existente.

## Impacto

### Affected code

- `src/greetings/domain/name.ts` — `Name`, reutilizado para validar cada componente del nombre completo.
- `src/greetings/domain/greeting.ts` — `Greeting`, extendido para componer el saludo con dos componentes válidos.
- `src/greetings/application/generate-full-name-greeting.use-case.ts` — `GenerateFullNameGreetingUseCase`, que aísla el flujo de aplicación de dos componentes.
- `src/greetings/infrastructure/http/create-full-name-greeting.request.ts` — `CreateFullNameGreetingRequest`, contrato de entrada HTTP del nuevo endpoint.
- `src/greetings/infrastructure/http/create-full-name-greeting.schema.ts` — `createFullNameGreetingSchema`, validación local de los dos campos.
- `src/greetings/infrastructure/http/greetings.controller.ts` — `GreetingsController`, que expone los endpoints bajo `/greetings`.
- `src/greetings/greetings.module.ts` — `GreetingsModule`, que compone los controladores y casos de uso de la funcionalidad.
- `src/greetings/domain/greeting.spec.ts` — `describe('Greeting') callback`, que prueba la composición de dominio.
- `src/greetings/application/generate-full-name-greeting.use-case.spec.ts` — `describe('GenerateFullNameGreetingUseCase') callback`, que prueba el nuevo flujo de aplicación.
- `src/greetings/infrastructure/http/create-full-name-greeting.schema.spec.ts` — `describe('createFullNameGreetingSchema') callback`, que prueba la validación por campo.
- `src/greetings/infrastructure/http/greetings.controller.spec.ts` — `describe('GreetingsController') callback`, que prueba la delegación de ambos manejadores.
- `src/greetings/greetings.module.spec.ts` — `describe('GreetingsModule') callback`, que prueba el registro de los dos casos de uso.
- `test/app.e2e-spec.ts` — `describe('AppController (e2e)') callback`, que cubre los contratos HTTP actuales.

### Affected specs

- `greeting-api`: capability existente que recibirá los requisitos del saludo con nombre completo y su validación.
