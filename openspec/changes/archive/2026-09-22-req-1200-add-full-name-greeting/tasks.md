# Tareas — REQ-1200

## 1. Dominio y aplicación

- [x] 1.1 Extender `Greeting` con la composición de dos instancias válidas de `Name` sin cambiar la composición actual de un componente; verificar con Jest el mensaje exacto para `Marco` y `Gallegos`.
- [x] 1.2 Crear `GenerateFullNameGreetingUseCase` con contratos `{ name, lastName }` y `{ message }`, validando ambos componentes mediante `Name`; verificar con Jest el saludo completo y la conservación de los errores de dominio.

## 2. Infraestructura HTTP y composición

- [x] 2.1 Añadir el tipo de solicitud y el esquema Joi de nombre completo que aplica a `name` y `lastName` los límites y patrón de `Name`, reutilizando `JoiValidationPipe`; verificar con Jest un caso Unicode válido y errores 400 que identifiquen cada campo inválido.
- [x] 2.2 Añadir el manejador `POST /greetings/full-name` a `GreetingsController` e inyectar el caso de uso nuevo sin modificar el manejador de `POST /greetings`; verificar con Jest la delegación, el resultado y la compatibilidad del manejador existente.
- [x] 2.3 Registrar el caso de uso nuevo en `GreetingsModule`; verificar con el módulo de pruebas de NestJS que ambos casos de uso se resuelven.

## 3. Contrato y regresión

- [x] 3.1 Ampliar las pruebas E2E con `{ "name": "Marco", "lastName": "Gallegos" }` y con componentes Unicode válidos; verificar `201 Created`, contenido JSON y el mensaje exacto en ambos casos.
- [x] 3.2 Añadir pruebas E2E para `name` y `lastName` ausentes, no textuales, fuera de rango, con dígitos o con símbolos; verificar `400 Bad Request` y un diagnóstico JSON que identifica el campo correspondiente.
- [x] 3.3 Mantener y ejecutar la prueba E2E de `POST /greetings` junto con `pnpm test`, `pnpm test:e2e`, `pnpm lint` y `pnpm build`; verificar que el contrato existente y todas las comprobaciones pasan.
