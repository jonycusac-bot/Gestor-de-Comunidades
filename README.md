# Gestor de Comunidades

Plataforma web multi-comunidad para administradores de fincas y gestorías.

## Objetivo
Crear un producto comercializable que permita gestionar múltiples comunidades desde un único panel y ofrezca a cada comunidad un portal privado para sus propietarios/residentes.

## Comunidad piloto
**Terrazas de Bel Air**

## Estado
Demo comercial navegable y responsive con datos ficticios, operaciones de ejemplo y modelo de datos multi-comunidad.

## Stack inicial
- Next.js + React + TypeScript.
- PostgreSQL + Prisma ORM.
- CSS propio, sin dependencia de una librería visual.

## Puesta en marcha
1. Copiar `.env.example` como `.env` y configurar PostgreSQL.
2. Ejecutar `npm install`.
3. Ejecutar `npm run db:generate` y `npm run db:push`.
4. Ejecutar `npm run dev` y abrir `http://localhost:3000`.

## Publicación gratuita de la demo
La aplicación genera una exportación estática en la carpeta `out` mediante `npm run build`. Esa carpeta puede publicarse directamente en Cloudflare Pages sin servidor ni base de datos. La demo no contiene datos personales reales.

Documentación:
- `docs/ESPECIFICACION_FUNCIONAL.md`
- `docs/DECISIONES_DOCUMENTOS_Y_JUNTAS.md`
- `docs/ESTADO_Y_PROXIMOS_PASOS.md`
