# Arquitectura técnica inicial

Actualización: 12/09/2026

## Decisión
Aplicación monolítica modular con Next.js, React y TypeScript; PostgreSQL como base de datos y Prisma como capa de acceso.

Esta base permite lanzar el MVP con rapidez y separar servicios cuando el volumen lo justifique. Todas las tablas de negocio quedan vinculadas a una organización y/o comunidad para mantener el aislamiento multi-tenant.

## Módulos iniciales
- Organizaciones y comunidades.
- Bloques, viviendas y propietarios.
- Comunicaciones.
- Avisos y noticias.
- Documentos y archivos relacionados.
- Juntas y orden del día.
- Estado económico básico por vivienda.

## Reglas que ya refleja el modelo
- Una vivienda puede existir sin propietario.
- Una vivienda admite copropietarios e historial mediante `Ownership`.
- Una publicación documental admite varios archivos.
- Los archivos no se duplican al relacionarlos con juntas, avisos o comunicaciones.
- El coeficiente de participación es opcional.
- La visibilidad puede dirigirse a comunidad, bloques, viviendas, propietario o administración.
- Las comunicaciones mantienen trazabilidad al convertirse en incidencia.

## Siguientes capas
1. Autenticación y autorización por organización/comunidad.
2. Datos semilla de Terrazas de Bel Air.
3. CRUD real de comunidades, bloques, viviendas y propietarios.
4. Almacenamiento privado de archivos con URLs temporales.
5. Registro de auditoría.
6. Notificaciones por correo y seguimiento de lectura.
