# Miralvento CRM — Ficha de contactos

La ficha de detalle de un contacto de CRM inmobiliario, construida sobre un dataset deliberadamente sucio (cuatro formatos de teléfono, fechas en tres formatos distintos, cualificación con forma variable, un caso de `qualification_data` como string JSON, etc.).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El listado es la puerta de entrada (R1); cada fila abre `/contacts/[id]`, que es la pantalla que importa.

Los datos se sirven vía route handlers (`/api/contacts`, `/api/contacts/[id]`) que leen `src/data/contactos.json` en el servidor con ~350ms de latencia simulada — los estados de carga son reales, no maquetados.

## Qué elegí y por qué

De las 10 user stories abiertas, prioricé estas 3 por ser las que un agente necesitaría el día a día antes de descolgar el teléfono, y porque el propio dataset trae al menos un caso real de cada una:

1. **Teléfonos siempre bien** (`src/lib/normalize.ts`) — normalización a formato internacional legible + acciones de Llamar/WhatsApp/Email en la ficha. Sin esto, ni el resto de requisitos (R2, duplicados) funcionan de forma fiable: la detección de duplicados depende de comparar teléfonos ya normalizados.
2. **Cumplimiento** (`src/lib/derive.ts` → `computeConsent`) — Sofía Marín (`c-013`) pidió por email que dejen de llamarla. Es el caso con más riesgo real (reputacional/legal) del dataset, así que bloquea Llamar y WhatsApp en la UI y deja solo el canal permitido activo, con el motivo visible.
3. **Posibles duplicados** — Carmen Ruiz Delgado (`c-001`) y "carmen ruiz" (`c-009`) son la misma persona: mismo teléfono en dos formatos distintos. La detección compara teléfono normalizado y nombre normalizado (sin acentos/mayúsculas) dentro de la misma organización, y enlaza a la ficha candidata para que la fusión la decida un humano — no fusiono nada automáticamente.

## Decisiones sobre los datos sucios (R6)

- **Teléfonos**: si no llevan prefijo y tienen 9 dígitos, asumo España (`+34`) — todo el dataset es español. `00` inicial se trata como `+`.
- **Fechas**: parser único (`parseFlexibleDate`) que acepta ISO 8601, `DD/MM/YYYY[ HH:mm]` y timestamps unix en segundos. Si no reconoce el formato, degrada a "Fecha desconocida" en vez de lanzar o mostrar `Invalid Date`.
- **Nombres**: `JOSÉ LUIS MARTÍN CABRERA` y `carmen ruiz` se normalizan a Title Case solo si vienen en mayúsculas o minúsculas completas; un nombre ya mixto (`David P.`) se respeta tal cual, porque forzarlo podría romper una inicial o abreviatura intencionada.
- **Fallback de identidad**: nombre → teléfono formateado → email → `Contacto {id}`. El avatar usa un color distinto (gris) cuando el nombre es un fallback, para que el agente sepa de un vistazo que esa "identidad" no está confirmada.
- **`qualification_data` como string** (`c-003`): se parsea con `JSON.parse` defensivo; si fallara, la sección de cualificación muestra un aviso en vez de romper la página.
- **Precedencia humano > IA**: cada hecho de cualificación muestra su procedencia (`explicit` = dicho por el cliente, `manual` = editado por un humano, `import-*` = importado). El caso `c-008` (Roberto) tiene el presupuesto corregido a mano por el agente Mario — ese badge se pinta con un color distinto (índigo) para que destaque frente a los datos "solo IA".
- **Claves desconocidas**: la sección de cualificación no tiene un formulario fijo — itera dinámicamente sobre `qualification.<operación>` y sobre cualquier operación nueva que aparezca, agrupando por esa clave. `net_income`/`income_*` (`c-008`) vienen sueltos en la raíz de `qualification_data`, no anidados — los agrupo en un bloque sintético "Situación financiera" porque describen un mismo hecho.
- **`notes` como dato de primera clase**: `c-006` (David P., Meta Lead Ads) trae presupuesto, plazo de compra y vivienda actual **solo** en `notes`, como texto libre de las respuestas del formulario — no hay equivalente estructurado. Sin una sección de notas, esa información desaparecía de la ficha; me di cuenta al probar ese contacto en el navegador y lo añadí.
- **`interest_preferences`**: es un campo plano que solapa con `qualification_data` (visible en `c-001`, probablemente resto del CRM anterior). No lo renderizo aparte porque duplicaría información sin trazabilidad; `qualification_data` manda por ser más rico.
- **Timeline**: orden cronológico real con más reciente primero — es lo que un agente quiere ver al abrir la ficha antes de llamar, no el historial completo desde el principio.
- **Salud del dato**: completitud ponderada (nombre real 15%, teléfono 15%, email 10%, cualificación 30%, interacciones 20%, agente asignado 10%) con lista explícita de qué falta, no solo un número.

## Dónde se equivocó la IA (y cómo lo cacé)

Al construir el renderizador de cualificación (`parseQualificationData`), la primera versión iteraba sobre todas las claves de `qualification` sin excluir `_meta` a nivel de operación — solo la excluía dentro de cada grupo de hechos. Resultado: el bloque `_meta: { lastSyncedAt, lastSource }` de `c-001` se pintaba como si fuera una operación más ("META") con sus propios "hechos". Lo detecté probando la ficha de Carmen Ruiz Delgado en el navegador real (no solo con `tsc --noEmit`, que no lo habría visto) y corregí el filtro para excluir `_meta` también en el bucle exterior.

## Qué haría con un día más

- Matching con `kb-propiedades.json`: cruzar zona/presupuesto/habitaciones de la cualificación con las 6 propiedades y explicar el porqué de cada match.
- Edición manual de un hecho de cualificación, con el mismo modelo de precedencia (el valor editado pasa a `source: "manual"` y no se pierde el original — se guardaría como historial, no se sobreescribiría).
- Búsqueda/filtros reales en el listado (por zona, presupuesto, origen) — ahora mismo R1 es deliberadamente mínimo, como pide la spec.
- Tests unitarios de los normalizadores (teléfono, fecha, cualificación) — son la parte con más lógica de negocio y ahora mismo solo están verificados manualmente en el navegador.
