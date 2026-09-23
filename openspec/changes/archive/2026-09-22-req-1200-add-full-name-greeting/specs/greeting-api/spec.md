# Delta de especificación — REQ-1200

## ADDED Requirements

### Requirement: Generar un saludo con nombre completo

El sistema DEBE (MUST) exponer `POST /greetings/full-name` y aceptar un cuerpo `application/json` con las propiedades textuales obligatorias `name` y `lastName`. Cuando ambas sean válidas, el sistema DEBE (MUST) responder `201 Created` con `application/json` y un cuerpo cuyo valor de `message` sea exactamente `Hola {name} {lastName}`, sustituyendo los marcadores por los valores enviados sin alterarlos y con un único espacio entre ambos componentes. El comportamiento de `POST /greetings` DEBE (MUST) permanecer sin cambios.

#### Scenario: Nombre y apellido válidos generan un saludo JSON

- **WHEN** un cliente envía `POST /greetings/full-name` con `{ "name": "Marco", "lastName": "Gallegos" }`
- **THEN** el sistema responde `201 Created` y `{ "message": "Hola Marco Gallegos" }` como JSON

#### Scenario: El endpoint de saludo existente se conserva

- **WHEN** un cliente envía `POST /greetings` con `{ "name": "Marco" }`
- **THEN** el sistema responde como antes con `201 Created` y `{ "message": "Hola Marco" }` como JSON

### Requirement: Validar los componentes del nombre completo

El sistema DEBE (MUST) aceptar `name` y `lastName` en `POST /greetings/full-name` únicamente si cada campo contiene entre 5 y 20 caracteres, ambos límites incluidos, y está compuesto exclusivamente por letras Unicode con espacios simples únicamente entre partes. Cada campo ausente, no textual, fuera de ese rango, con dígitos o con símbolos y puntuación —incluidos `#`, `@`, `!`, `$`, `%`, `^`, `&`, guiones y apóstrofes— DEBE (MUST) rechazarse con `400 Bad Request` y un error de validación JSON que identifique el campo inválido.

#### Scenario: Componentes Unicode válidos con espacios simples

- **WHEN** un cliente envía `POST /greetings/full-name` con `{ "name": "José María", "lastName": "De la Cruz" }`
- **THEN** el sistema responde `201 Created` y `{ "message": "Hola José María De la Cruz" }` como JSON

#### Scenario: Nombre inválido en el saludo completo

- **WHEN** un cliente envía `POST /greetings/full-name` con un `name` ausente, no textual, fuera de rango, con dígitos o con símbolos, y un `lastName` válido
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica `name`

#### Scenario: Apellido inválido en el saludo completo

- **WHEN** un cliente envía `POST /greetings/full-name` con un `lastName` ausente, no textual, fuera de rango, con dígitos o con símbolos, y un `name` válido
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica `lastName`
