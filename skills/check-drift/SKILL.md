---
name: check-drift
description: Analiza posibles desalineaciones entre cambios recientes de Git y requirements OpenSpec archivados, usando el script local de drift y Serena para confirmar impacto semántico a nivel de símbolos.
---

# Check Drift

Usar este skill cuando el usuario quiera:

- verificar si un hotfix, commit, merge o cambio reciente pudo afectar requirements anteriores;
- revisar posibles desalineaciones entre código actual y requirements OpenSpec archivados;
- identificar qué requirements podrían requerir una nueva verificación;
- analizar drift antes de iniciar un nuevo cambio OpenSpec.

## Flujo

1. Ejecutar:

   ```bash
   pnpm check:drift