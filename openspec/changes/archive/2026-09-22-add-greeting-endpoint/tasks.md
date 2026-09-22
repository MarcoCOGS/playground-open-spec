# Tareas

## 1. Migración a Jest

- [x] 1.1 Sustituir dependencias, scripts, configuraciones y tipos de Vitest por Jest, `ts-jest` y sus tipos compatibles con ESM/NodeNext; verificar que `pnpm install --frozen-lockfile` y el descubrimiento de pruebas de Jest finalicen correctamente.
- [x] 1.2 Migrar las pruebas unitarias y de extremo a extremo existentes al nuevo flujo de Jest sin alterar sus aserciones funcionales; verificar que `pnpm test` y `pnpm test:e2e` preservan la cobertura de `GET /`.

## 2. Dominio y aplicación de saludos

- [x] 2.1 Crear el objeto de valor de dominio para el nombre, sus límites reutilizables, la regla de letras Unicode con espacios simples y la composición del saludo sin dependencias de NestJS o Joi; verificar con Jest que acepta 5 y 20 caracteres, `José María`, y rechaza 4, 21, dígitos y símbolos.
- [x] 2.2 Implementar el caso de uso de aplicación que recibe el nombre y entrega el mensaje de saludo mediante contratos primitivos; verificar con Jest que `Marco` produce `{ message: 'Hola Marco' }`.

## 3. Infraestructura HTTP y composición

- [x] 3.1 Añadir Joi como dependencia de ejecución e implementar el DTO y adaptador o pipe HTTP que valida `name` obligatorio, textual, entre 5 y 20 caracteres y compuesto solo por letras Unicode con espacios simples; verificar con Jest que longitudes inválidas, dígitos y símbolos se traducen a un error HTTP 400 que identifica `name`.
- [x] 3.2 Implementar el controlador `POST /greetings` y su mapeo de respuesta, manteniendo el controlador dependiente del caso de uso y del adaptador HTTP; verificar con Jest que delega el nombre validado y devuelve el mensaje del caso de uso.
- [x] 3.3 Crear el módulo de la funcionalidad y registrarlo en `AppModule` sin modificar `GET /`; verificar que el módulo de pruebas de NestJS compila y que la prueba raíz existente continúa pasando.

## 4. Verificación del contrato

- [x] 4.1 Añadir una prueba de extremo a extremo de `POST /greetings` con `{ "name": "Marco" }`; verificar `201 Created`, contenido JSON y `{ "message": "Hola Marco" }`.
- [x] 4.2 Añadir pruebas de extremo a extremo para nombres de 4 y 21 caracteres, con dígitos, con símbolos, ausentes y no textuales; verificar en cada caso `400 Bad Request` y un error JSON que identifica la entrada inválida.
- [x] 4.3 Ejecutar `pnpm test`, `pnpm test:e2e`, `pnpm lint` y `pnpm build`; verificar que todas las comprobaciones pasan antes de la entrega.
