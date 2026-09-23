# Diseño — REQ-1200

## Contexto

La funcionalidad `greetings` ya separa dominio, aplicación e infraestructura HTTP. `Name` concentra los límites y el patrón Unicode; `Greeting` construye el mensaje actual; `GenerateGreetingUseCase` atiende el caso de un componente; y `GreetingsController` publica el contrato existente. La nueva ruta pertenece a la capability `greeting-api` y debe coexistir con ese contrato. Véanse `proposal.md` y `specs/greeting-api/spec.md` para la motivación y el comportamiento.

## Objetivos y no objetivos

**Objetivos:**

- Añadir el flujo de saludo con dos componentes sin permitir que las reglas de validación diverjan entre `name` y `lastName`.
- Mantener las dependencias orientadas hacia el dominio y conservar intacto el flujo actual de un único nombre.
- Probar el contrato HTTP nuevo y la regresión del contrato existente con Jest.

**No objetivos:**

- Normalizar, recortar, concatenar anticipadamente ni modificar los valores de entrada.
- Crear persistencia, autenticación, una política global de validación ni un endpoint adicional.
- Cambiar los límites, el patrón, el estado HTTP o el cuerpo de respuesta de `POST /greetings`.

## Decisiones

### Reutilizar `Name` para cada componente y extender la composición de dominio

El caso de uso nuevo creará una instancia independiente de `Name` para `name` y otra para `lastName`. `Greeting` incorporará una operación de composición para dos instancias válidas que produzca `Hola {name} {lastName}`; su operación actual para un solo nombre no se modificará. Así, los límites y el patrón permanecen en el dominio y el separador del mensaje no depende del controlador.

Se descarta concatenar las entradas antes de validarlas o reutilizar el caso de uso actual con una cadena compuesta: ambas alternativas impedirían identificar qué campo es inválido y mezclarían la semántica de uno y dos componentes.

### Incorporar un caso de uso específico y conservar el existente

Se añadirá `GenerateFullNameGreetingUseCase` en aplicación, con contratos primitivos de entrada `{ name, lastName }` y salida `{ message }`. El controlador le delegará exclusivamente la generación del saludo completo, mientras `GenerateGreetingUseCase` seguirá atendiendo `POST /greetings`. El módulo registrará el nuevo proveedor.

Se descarta ampliar el contrato del caso de uso actual con un `lastName` opcional porque introduciría una bifurcación de transporte en una operación ya publicada y haría menos explícita la compatibilidad.

### Adaptar el borde HTTP con un esquema Joi dedicado

La infraestructura añadirá un tipo de solicitud y un esquema Joi para el cuerpo de nombre completo. El esquema aplicará a ambos campos los límites y el patrón exportados desde el dominio; reutilizará `JoiValidationPipe` para traducir diagnósticos por campo a `400 Bad Request`. `GreetingsController` incorporará un manejador para `POST /greetings/full-name` y conservará sin cambios su manejador actual.

Se descarta aplicar una validación global o modificar el esquema del endpoint existente: el nuevo contrato requiere ambos campos y una configuración local evita afectar otras rutas.

### Cobertura en los límites arquitectónicos

Jest probará la composición de dominio para dos componentes, el caso de uso nuevo, el esquema y pipe con errores separados para `name` y `lastName`, el controlador y el registro del módulo. Las pruebas E2E cubrirán la respuesta de ejemplo, componentes Unicode válidos, entradas inválidas de cada campo y la regresión de `POST /greetings`.

## Riesgos y compensaciones

- [Las validaciones HTTP de ambos campos podrían divergir del dominio] → el esquema reutiliza los límites y patrón de `Name`, y las pruebas cubren ambos campos.
- [El orden o el espacio de la composición podría cambiar] → aserciones exactas de `{ message: 'Hola Marco Gallegos' }` y del caso Unicode.
- [La nueva inyección podría afectar el endpoint existente] → mantener los casos de uso separados y ejecutar la prueba E2E de regresión de `POST /greetings`.

## Plan de migración

1. Añadir los objetos, adaptadores HTTP, cableado y pruebas definidos en este diseño.
2. Desplegar como una ruta aditiva, sin migración de datos ni cambio de configuración operativa.
3. Para revertir, desplegar la versión previa; no hay datos que recuperar y el endpoint existente permanece compatible durante todo el cambio.
