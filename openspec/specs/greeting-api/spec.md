# Especificación de greeting-api

## Purpose

Proporcionar una API de saludo JSON con un contrato verificable para un nombre válido y para los errores de entrada.

## Requirements

### Requirement: Generar un saludo a partir de un nombre enviado

El sistema DEBE (MUST) exponer `POST /greetings` y aceptar un cuerpo `application/json` con una propiedad de texto obligatoria llamada `name`. Cuando el nombre sea válido, el sistema DEBE (MUST) responder `201 Created` con `application/json` y un cuerpo cuyo valor de `message` sea exactamente `Hola {name}`, sustituyendo `{name}` por el valor enviado sin alterarlo.

#### Scenario: Nombre válido genera un saludo JSON

- **WHEN** un cliente envía `POST /greetings` con `{ "name": "Marco" }`
- **THEN** el sistema responde `201 Created` y `{ "message": "Hola Marco" }` como JSON

### Requirement: Validar el formato y la longitud del nombre

El sistema DEBE (MUST) aceptar `name` únicamente si contiene entre 5 y 20 caracteres, ambos límites incluidos, y está compuesto exclusivamente por letras Unicode. Se permiten espacios simples únicamente entre partes del nombre. Un `name` ausente, no textual, fuera de ese rango, con dígitos o con símbolos y puntuación —incluidos `#`, `@`, `!`, `$`, `%`, `^`, `&`, guiones y apóstrofes— DEBE (MUST) rechazarse como entrada inválida.

#### Scenario: Nombre de menos de cinco caracteres

- **WHEN** un cliente envía `POST /greetings` con un `name` de menos de 5 caracteres
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica la entrada inválida

#### Scenario: Nombre de más de veinte caracteres

- **WHEN** un cliente envía `POST /greetings` con un `name` de más de 20 caracteres
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica la entrada inválida

#### Scenario: Nombre con letras Unicode y espacios simples

- **WHEN** un cliente envía `POST /greetings` con `{ "name": "José María" }`
- **THEN** el sistema responde `201 Created` y `{ "message": "Hola José María" }` como JSON

#### Scenario: Nombre con dígitos

- **WHEN** un cliente envía `POST /greetings` con un `name` que contiene uno o más dígitos
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica la entrada inválida

#### Scenario: Nombre con símbolos o puntuación

- **WHEN** un cliente envía `POST /greetings` con un `name` que contiene `#`, `@`, `!`, `$`, `%`, `^`, `&`, un guion o un apóstrofe
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica la entrada inválida

#### Scenario: Nombre ausente o no textual

- **WHEN** un cliente envía `POST /greetings` sin una propiedad `name` textual
- **THEN** el sistema responde `400 Bad Request` con un error de validación JSON que identifica la entrada inválida
