# Miralvento CRM

Un CRM que convierte datos sucios en fichas claras. Parte de un export inmobiliario deliberadamente sucio (cuatro formatos de teléfono, fechas en tres formatos distintos, cualificación con forma variable, un caso de `qualification_data` como string JSON, etc.).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El listado es la puerta de entrada; cada fila abre la ficha del contacto en `/contacts/[id]`.

Los datos se sirven vía route handlers (`/api/contacts`, `/api/contacts/[id]`) que leen `src/data/contactos.json` en el servidor con ~350ms de latencia simulada — los estados de carga son reales, no maquetados.


