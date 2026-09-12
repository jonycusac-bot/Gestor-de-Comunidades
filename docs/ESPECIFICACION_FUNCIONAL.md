# Especificación funcional — Gestor de Comunidades

Actualización: 12/09/2026

## Visión
SaaS multi-comunidad comercializable para administradores de fincas/gestorías.

## MVP
- Un Administrador General con acceso completo.
- Panel global con múltiples comunidades.
- Portal privado independiente por comunidad.
- Web responsive/PWA.
- Comunidad piloto: Terrazas de Bel Air.

## Estructura
Comunidad → Bloque/Portal → Vivienda/Puerta → Propietario.
La planta es opcional. Bloques, plantas y puertas admiten etiquetas de texto libre.
Cada bloque puede tener una estructura diferente.
Se permitirá copiar la estructura del bloque anterior.

## Alta e importación
Nueva comunidad:
- Crear manualmente.
- Importar desde Excel.
- Descargar plantilla Excel.
- Previsualización y validación antes de importar.

Columnas mínimas:
Comunidad, Bloque/Portal, Planta opcional, Puerta/Vivienda, Propietario, Email, Teléfono.

## Viviendas y propietarios
Ficha de vivienda:
- Identificación.
- Propietario(s).
- Comunicaciones/incidencias.
- Documentos.

Una vivienda puede existir sin propietario.

Ficha de propietario:
- Datos de contacto.
- Vivienda(s).
- Estado de pago.
- Comunicaciones recientes.
- Incidencias.
- Historial.

Estado económico inicial:
- Al día.
- Pendiente de pago.
Actualización manual en primera fase y preparada para futuras integraciones contables.

Cada comunidad tendrá una pestaña Pendientes de pago.

## Centro de Comunicaciones
Tipos acordados:
- Consulta.
- Queja.
- Incidencia.
- Sugerencia/Mejora.

Cada comunicación incluye persona, comunidad, vivienda, fecha/hora, texto, fotos/adjuntos y estado.
El dashboard global recibe comunicaciones de todas las comunidades.
Una comunicación puede convertirse manualmente en incidencia conservando sus datos y adjuntos.

## Avisos y Noticias
El gestor puede crear, editar, publicar, guardar borrador y archivar.
Puede adjuntar fotos y documentos.
Tipos: Aviso y Noticia.
Prioridades previstas: Normal, Importante, Urgente.
Destinatarios: comunidad completa, bloque(s), vivienda(s) o propietario.
Preparado para seguimiento leído/no leído.
Las notificaciones por email se implementarán posteriormente.

## Documentos
El gestor subirá documentos fácilmente dentro de la comunidad previamente seleccionada.
Detalles completos en `DECISIONES_DOCUMENTOS_Y_JUNTAS.md`.

## Juntas
Gestión conectada con Documentos y Avisos.
Detalles completos en `DECISIONES_DOCUMENTOS_Y_JUNTAS.md`.

## Principios
- Multi-tenant desde el inicio.
- Comercializable y escalable.
- MVP sencillo.
- Evitar duplicar información y archivos.
- Preparar integraciones futuras.
- Seguridad y autorización por usuario/comunidad/vivienda.
- Consultar antes de implementar decisiones funcionales dudosas.
