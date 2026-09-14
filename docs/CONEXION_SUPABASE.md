# Conexión con Supabase

Actualización: 14/09/2026

## Proyecto

- URL pública: `https://wytejpxqujzazgyfdobt.supabase.co`
- Entorno actual: desarrollo y demostración.
- Comunidad piloto: Terrazas de Bel Air.

## Seguridad

La aplicación utilizará una clave pública `sb_publishable_...` en el navegador, junto con Supabase Auth y políticas Row Level Security (RLS).

Nunca deben guardarse en GitHub:

- Claves `sb_secret_...`.
- Clave heredada `service_role`.
- Contraseña directa de PostgreSQL.
- Archivos `.env` o `.env.local`.

## Siguiente paso

1. Crear el primer usuario administrador en Supabase Auth.
2. Añadir el cliente de autenticación a la aplicación.
3. Crear las tablas iniciales para comunidades, portales, viviendas y propietarios.
4. Activar y validar las políticas RLS antes de usar datos reales.
