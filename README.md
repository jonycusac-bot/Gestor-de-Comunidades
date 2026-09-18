# Gestor de Comunidades / FincaFlow

Aplicación para administradores de fincas con varias comunidades. La comunidad piloto es Terrazas de Bel Air.

**Para retomar el proyecto con cualquier agente, empieza por [docs/CONTINUIDAD.md](docs/CONTINUIDAD.md).** Ese archivo distingue las decisiones del producto de lo que ya funciona en el código. Revisa también el último commit de `main` antes de cambiar nada.

## Versión actual

- React 19, TypeScript y Vite para la interfaz; Express en `server.ts` para API y servidor de desarrollo.
- `src/App.tsx` monta la autenticación y el panel.
- `src/components/dashboard.tsx` contiene el selector y las vistas de gestión.
- `src/data/communitiesData.ts` aporta datos ficticios de demostración.
- Prisma tiene un esquema de diseño, pero la demo no persiste las comunidades en PostgreSQL: usa `localStorage` del navegador.

## Arranque local

Con Node.js y npm instalados:

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`, pulsa **Ver demostración** y selecciona una comunidad. `npm run lint` comprueba TypeScript y `npm run build` genera el paquete de producción.

El acceso real usa Supabase Auth. Configura solo los valores necesarios mediante variables de entorno locales; nunca subas contraseñas, tokens o archivos `.env` a GitHub.

## Documentación

- [Continuidad para otro agente](docs/CONTINUIDAD.md)
- [Especificación funcional](docs/ESPECIFICACION_FUNCIONAL.md)
- [Decisiones sobre documentos y juntas](docs/DECISIONES_DOCUMENTOS_Y_JUNTAS.md)

Los documentos de 2026-09-12 describen decisiones y una base técnica anterior. Para el comportamiento actual, manda el código de `main`.
