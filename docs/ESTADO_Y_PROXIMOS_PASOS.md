# Estado y próximos pasos

Actualización: 12/09/2026

## Cerrado
- Producto SaaS multi-comunidad.
- Administrador General único en MVP.
- Comunidad piloto: Terrazas de Bel Air.
- Estructura Comunidad → Bloque/Portal → Vivienda → Propietario.
- Planta opcional.
- Importación Excel.
- Fichas de vivienda/propietario.
- Estado de pago y Pendientes de pago.
- Centro de Comunicaciones con 4 tipos.
- Conversión manual a incidencia.
- Avisos y Noticias.
- Diseño funcional principal de Documentos.
- Integración Documentos ↔ Avisos.
- Diseño funcional principal de Juntas.
- Integración Juntas ↔ Documentos ↔ Avisos.
- Coeficiente de participación opcional preparado desde la ficha de vivienda.
- Email pospuesto hasta tener bien cerrados los flujos internos.
- Stack inicial: Next.js, React, TypeScript, PostgreSQL y Prisma.
- Modelo de datos multi-comunidad validado.
- Panel principal responsive creado y compilado correctamente.

## Pendiente
- Datos exactos iniciales de propietario.
- Copropietarios.
- Historial de cambios de propietario.
- Estados exactos de comunicaciones/incidencias.
- Detalles finales de caducidad/respuesta de avisos.
- Profundizar en asistentes, representaciones y votaciones.
- Economía detallada.
- Autenticación/registro.
- Notificaciones por email.
- Roles y permisos avanzados.
- Conexión a una base PostgreSQL real y datos semilla.

## Próximo paso recomendado
Implementar el primer flujo completo: **Comunidades → Bloques → Viviendas → Propietarios**, con datos semilla de Terrazas de Bel Air y operaciones de alta, edición y consulta.

Después se conectará el módulo Documentos al almacenamiento privado de archivos.
