# Decisiones — Módulos Documentos y Juntas

Actualización: 12/09/2026

## DOCUMENTOS

### Objetivo
El gestor debe poder subir documentos con muy pocos pasos a la comunidad que ya tenga seleccionada. La comunidad se asignará automáticamente para reducir errores.

### Flujo de subida
1. Seleccionar o arrastrar archivo(s).
2. Introducir título.
3. Elegir categoría.
4. Elegir destinatarios/visibilidad.
5. Publicar.

### Archivos
Una misma publicación/documento podrá contener **varios archivos**.

Ejemplo:
- Reparación piscina 2026
  - Presupuesto.pdf
  - Informe técnico.pdf
  - Fotografías.pdf

### Categorías estándar
- Actas
- Convocatorias
- Presupuestos
- Facturas
- Contratos
- Seguros
- Normativas
- Informes técnicos
- Certificados
- Comunicados
- Obras y mantenimiento
- Otros

El gestor podrá crear categorías personalizadas **desde Configuración**, evitando desorden en el uso diario.

### Metadatos
- Título.
- Archivo(s).
- Categoría.
- Comunidad.
- Fecha de publicación.
- Fecha propia del documento, opcional.
- Descripción opcional.
- Visibilidad.
- Usuario que lo subió.
- Estado: borrador / publicado / archivado.

### Visibilidad
- Toda la comunidad.
- Un bloque/portal.
- Varios bloques/portales.
- Una o varias viviendas.
- Un propietario concreto.
- Solo administración.

### Biblioteca
Buscador y filtros por:
- Categoría.
- Año/fecha.
- Estado.
- Bloque/portal.
- Otros criterios futuros.

### Integración con Avisos
Al publicar habrá una opción **Mostrar también como aviso**.
El sistema podrá crear automáticamente un aviso enlazado al documento para evitar duplicar trabajo.
Posteriormente esta acción podrá disparar también notificaciones por email.

### Archivo único y relaciones
No se duplicarán físicamente documentos.
Un mismo documento podrá relacionarse con:
- Junta.
- Aviso.
- Incidencia.
- Otros módulos futuros.

### Seguridad
El acceso a cada archivo debe comprobar autorización real:
usuario → comunidad → vivienda/rol → permiso → documento.
No bastará con conocer o modificar una URL para descargar un documento.

---

## JUNTAS

### Objetivo
Conectar Juntas + Documentos + Avisos para reducir al máximo el trabajo repetitivo del gestor.

### Nueva Junta
Datos iniciales:
- Comunidad seleccionada.
- Nombre/título.
- Tipo.
- Fecha.
- Hora.
- Lugar.
- Orden del día.
- Documentos adjuntos.

### Tipos
Se contemplan inicialmente:
- Junta Ordinaria.
- Junta Extraordinaria.
- Junta Urgente.

La arquitectura quedará preparada para ampliar/configurar tipos en el futuro.

### Orden del día
El gestor podrá crear puntos independientes y ordenarlos.

Ejemplo:
1. Lectura y aprobación del acta anterior.
2. Presentación de cuentas.
3. Presupuesto del ejercicio.
4. Reparación de fachada.
5. Ruegos y preguntas.

### Automatizaciones funcionales
- **Publicar convocatoria**: aparece en el portal del propietario.
- **Guardar convocatoria en Documentos**: se archiva en Documentos > Convocatorias.
- **Publicar acta**: se archiva en Documentos > Actas.
- Los adjuntos se reutilizan, no se duplican.
- Posteriormente se añadirá **Enviar convocatoria por email**.

### Alcance inicial de Juntas
La primera versión debe aportar valor comercial sin sobrecargar el MVP:
- Convocatoria.
- Orden del día.
- Documentos relacionados.
- Acta.
- Asistentes.
- Preparación para votaciones y representaciones.

Las funciones avanzadas de votación, delegaciones/representaciones y cálculo legal de mayorías podrán desarrollarse progresivamente.

### Coeficiente de participación
Se incorpora a la ficha de vivienda como **campo opcional desde el diseño inicial**.
Permitirá en fases posteriores:
- Cálculo de votaciones.
- Mayorías.
- Repartos económicos.
- Cuotas/derrama según coeficiente cuando proceda.

Ejemplo:
Terrazas de Bel Air → Portal 4 → Puerta 2 → Coeficiente X%.

### Evolución prevista
- Registro de asistentes.
- Representaciones/delegaciones.
- Votación por cada punto.
- Coeficientes representados.
- Resultado de votaciones.
- Generación asistida del acta.
- Envío y seguimiento de convocatorias.

---

## CRITERIO COMERCIAL

Estas decisiones se adoptan pensando en que el producto pueda venderse a administradores de fincas y gestorías que gestionen desde unas pocas hasta muchas comunidades.

Prioridades:
- Muy pocos clics para tareas frecuentes.
- Evitar introducir datos dos veces.
- Automatizar relaciones entre módulos.
- Mantener trazabilidad.
- Permitir configuración sin convertir el sistema en algo complejo.
- Preparar crecimiento futuro sin sobredimensionar el MVP.
