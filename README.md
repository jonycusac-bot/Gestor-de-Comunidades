# Gestor de Comunidades

Plataforma web multi-comunidad para administradores de fincas y gestorías.

## Objetivo
Crear un producto comercializable que permita gestionar múltiples comunidades desde un único panel y ofrezca a cada comunidad un portal privado para sus propietarios/residentes.

## Comunidad piloto
**Terrazas de Bel Air**

## Estado
Demo comercial navegable y responsive con datos ficticios, operaciones de ejemplo y modelo de datos multi-comunidad.

## Stack actual
- React, TypeScript y Vite para la interfaz.
- Express en `server.ts` para el servidor de desarrollo y producción.
- Datos ficticios y comunidades creadas almacenados localmente en el navegador; PostgreSQL y Prisma no intervienen aún en la demo.

## Puesta en marcha
1. Ejecutar `npm install`.
2. Ejecutar `npm run dev` y abrir `http://localhost:3000`.
3. Para validar cambios, ejecutar `npm run lint` y `npm run build`.

## Importación desde Excel

En el alta de una comunidad se puede elegir una plantilla `.xlsx` con la pestaña `Propietarios`. Las plantillas de demostración están en `docs/plantillas/`. La importación calcula los portales y viviendas a partir de las filas y guarda la información en el navegador.

Documentación:
- `docs/ESPECIFICACION_FUNCIONAL.md`
- `docs/DECISIONES_DOCUMENTOS_Y_JUNTAS.md`
- `docs/ESTADO_Y_PROXIMOS_PASOS.md`

## Correo de prueba local

En Comunicaciones, el envío general es una simulación. Terrazas de Bel Air permite además una prueba real individual con Resend, limitada al destinatario configurado en el servidor.

Configurar en `.env` local (excluido de GitHub): `EMAIL_TEST_ENABLED=true`, `EMAIL_TEST_RECIPIENT=tu-correo-de-resend` y `RESEND_API_KEY=tu-clave`. Reiniciar `npm run dev`. No usar variables `VITE_` para la clave ni publicarla. La prueba está desactivada en producción y solo acepta conexiones locales.

Estado comprobado el 09/10/2026: correo aceptado por Resend y recepción confirmada por el usuario. Para cada envío, la aceptación del proveedor no implica por sí sola entrega al buzón.
