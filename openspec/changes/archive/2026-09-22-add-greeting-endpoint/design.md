# Diseño

## Contexto

El proyecto es un inicio de NestJS 12 con TypeScript y resolución de módulos `NodeNext`. Actualmente registra un único controlador y servicio en `AppModule`, no cuenta con una validación HTTP reutilizable ni con una estructura de funcionalidades por capas. Las pruebas y scripts vigentes usan Vitest, pero la configuración del proyecto y la decisión del usuario establecen Jest como el marco objetivo. La motivación y el contrato público están definidos en `proposal.md` y `specs/greeting-api/spec.md`.

## Objetivos y no objetivos

**Objetivos:**

- Implementar los saludos como una funcionalidad autocontenida con dependencias dirigidas hacia el dominio.
- Validar la entrada HTTP con Joi antes de ejecutar el caso de uso y convertir los fallos en respuestas HTTP 400.
- Mantener los invariantes de formato y longitud disponibles en el dominio para futuras entradas que no sean HTTP.
- Migrar las pruebas unitarias y de extremo a extremo existentes a Jest con soporte para TypeScript y ESM.

**No objetivos:**

- Persistir saludos o nombres, añadir autenticación o introducir una base de datos.
- Modificar el comportamiento de `GET /` o establecer una política global de validación para endpoints ajenos a esta funcionalidad.
- Normalizar, recortar, traducir o cambiar el valor de `name` antes de componer el mensaje.
- Añadir requisitos funcionales durante la migración de Vitest a Jest.

## Decisiones

### Funcionalidad organizada por capas

La funcionalidad se ubicará bajo una raíz `greetings` con estas capas:

- **Dominio:** un objeto de valor `Nombre` conserva los límites de 5 a 20 caracteres y la regla de letras Unicode con espacios simples entre partes; una política u objeto de valor de saludo compone el mensaje. No importa NestJS, Joi ni tipos HTTP.
- **Aplicación:** un caso de uso recibe un contrato primitivo con el nombre, crea el objeto de valor de dominio y devuelve un contrato primitivo con `message`.
- **Infraestructura/presentación:** un controlador Nest, DTOs HTTP, un adaptador o pipe de validación basado en Joi y un módulo de la funcionalidad adaptan HTTP al caso de uso. `AppModule` actúa como composición de dependencias.

Esta separación permite probar la regla de negocio sin iniciar NestJS y evita que las decisiones de transporte lleguen al dominio. Mantener un controlador que llame directamente al servicio inicial sería más corto, pero acoplaría la regla de saludo y la validación a NestJS y no cumpliría los límites solicitados.

### Joi valida el límite HTTP y el dominio protege su invariante

El controlador validará el cuerpo con un esquema Joi que exige `name` como texto, obligatorio, con mínimo 5 y máximo 20 caracteres, y con un patrón Unicode que permita solo letras y espacios simples entre partes. Por tanto, se rechazan números, símbolos y puntuación. El adaptador de validación convertirá los errores de Joi en `BadRequestException` para que NestJS serialice un error JSON que identifique el campo inválido.

Los límites y la regla de caracteres se declararán en el dominio y se reutilizarán al construir el esquema Joi cuando sea viable. El objeto de valor volverá a comprobar los invariantes de forma defensiva. Validar únicamente mediante Joi fue descartado porque dejaría las reglas sin protección ante una futura entrada no HTTP.

### El controlador conserva el contrato HTTP especificado

El controlador expondrá `POST /greetings`, entregará el nombre validado al caso de uso y devolverá directamente su salida `{ message }`. Se mantendrá el estado por defecto de NestJS para `POST` (`201 Created`), ya incluido en la especificación. No se introduce persistencia ni un puerto de repositorio: el caso de uso es determinista y no tiene dependencias externas.

### Migración de Vitest a Jest compatible con ESM

La migración sustituirá los scripts, configuraciones y dependencias específicos de Vitest por Jest, `ts-jest` y los tipos de Jest. Dado que el paquete usa `type: module`, las configuraciones de Jest serán compatibles con ESM y transformarán los archivos TypeScript respetando `NodeNext`; también resolverán las extensiones `.js` usadas por las importaciones TypeScript del proyecto.

Se conservarán comandos separados para pruebas unitarias, modo observación, cobertura, depuración y pruebas de extremo a extremo. La configuración de tipos de TypeScript cambiará de los globales de Vitest a los de Jest. Los archivos de prueba existentes se migrarán sin cambiar sus aserciones funcionales antes de ampliar la cobertura de saludos. Mantener ambos marcos fue descartado porque duplicaría scripts, tipos y configuración sin aportar valor al proyecto.

### Pruebas en los límites arquitectónicos

Jest cubrirá el objeto de valor de dominio en los límites 5 y 20, con letras Unicode y espacios simples válidos, y con dígitos y símbolos inválidos; también cubrirá el caso de uso sin NestJS y el adaptador de validación. Las pruebas de extremo a extremo con Supertest comprobarán el saludo correcto, los límites inválidos de 4 y 21 caracteres, los números, los símbolos y los valores ausentes o no textuales. Las pruebas existentes de `GET /` se conservarán como regresión durante la migración.

## Riesgos y compensaciones

- [La configuración ESM de Jest puede no resolver las importaciones `.js` de TypeScript] → Configurar la transformación y el mapeo ESM antes de migrar los tests, y verificar tanto la suite unitaria como la de extremo a extremo.
- [La regla Joi y la regla de dominio pueden divergir] → Centralizar los límites en el dominio y probar ambos límites en las dos capas.
- [La migración de marco de pruebas puede ocultar una regresión preexistente] → Migrar primero las pruebas actuales sin modificar su comportamiento y ejecutarlas antes de añadir casos de saludo.
- [Joi puede variar el texto de sus diagnósticos entre versiones] → Verificar estado 400, formato JSON y referencia a `name`, sin acoplar la suite al mensaje completo de la librería.

## Plan de migración

1. Sustituir dependencias, scripts, configuraciones y tipos de Vitest por los equivalentes de Jest; actualizar el lockfile de pnpm.
2. Migrar y ejecutar las pruebas existentes de unidad y extremo a extremo con Jest.
3. Añadir la funcionalidad de saludos, Joi y sus pruebas, y comprobar compilación, lint y cobertura.
4. Desplegar sin migración de datos ni configuración operativa adicional. Para revertir, desplegar la versión anterior; la retirada del endpoint no requiere recuperación de datos.
