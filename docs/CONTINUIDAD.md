# Continuidad del proyecto — 18/09/2026

## Publicación de Supabase autorizada — 10/10/2026

- El usuario autoriza publicar la conexión privada de Documentos y Juntas en GitHub y Vercel. Pendiente verificar despliegue concreto tras push.
- Lint/build y comprobaciones simuladas correctas; sigue pendiente prueba de subida real con cuenta FincaFlow del usuario. Ver demostración sigue local. No se migran PDF previos.

## Publicación autorizada — 10/10/2026

- El usuario autoriza guardar en GitHub y Vercel los cambios locales de Documentos (PDF por comunidad), Juntas (convocatoria/acta, edición y prueba por correo), eliminación del historial de Comunicaciones y ajustes de tabla.
- Lint y build correctos antes de publicar; aviso conocido de bundle. Vercel continúa como demo estática: la prueba real de correo requiere servidor local y no funciona en el alojamiento estático. Los PDF locales no se transfieren a Vercel; cada origen/navegador conserva su propia biblioteca.
- Esta autorización es para esta publicación; se mantiene pedir permiso para futuras subidas.

## Correo de prueba desde Juntas — local 10/10/2026

- El usuario elige primero prueba a su propio correo, no envío a propietarios reales. Juntas incorpora Preparar prueba por correo con datos de la reunión y sus PDF. Usa la dirección fija EMAIL_TEST_RECIPIENT, la integración Resend local y revisión/confirmación explícita del usuario.
- Mantiene la restricción a Terrazas de Bel Air, loopback y desactivación en producción. Máximo dos PDF y 5 MB en total en correo; se valida también en servidor. Los archivos de hasta 10 MB siguen siendo válidos para almacenamiento local, pero no para esta prueba por correo.
- Preparar no envía; el botón Enviar prueba real transmite el contenido y PDF a Resend para el único destinatario autorizado. Aceptación no equivale a entrega confirmada. Sin publicación en GitHub/Vercel.
- Comprobaciones con proveedor simulado: restricción de comunidad, destinatario inmutable, validación de PDF y adjuntos enviados correctamente. Prueba real autorizada al correo del usuario con junta y dos PDF ficticios: Resend aceptó el envío, referencia `01a126b6-2d4c-7cbe-8233-ed9c2b013cc2`. Pendiente confirmación del usuario de recepción en buzón. No se envió a propietarios.

## Juntas con PDF — trabajo local 10/10/2026

- Cada junta ofrece Modificar junta: editar título, fecha, hora y lugar; sustituir PDF opcionalmente, conservando los archivos actuales al dejar la selección vacía. En realizadas con convocatoria se permite sustituir también esta. Se conserva el ID y el estado; pasar a realizada sigue utilizando la acción específica con acta.

- Juntas incorpora Próximas juntas y Juntas realizadas, alta con título, fecha, hora/lugar opcionales y PDF de convocatoria o acta (máximo 10 MB). Marcar como realizada exige adjuntar acta y conserva la convocatoria original.
- Datos y PDF guardados en IndexedDB por comunidad, solo en este navegador/origen. No se convierten automáticamente en publicaciones para propietarios ni se copian a Documentos. La agenda ficticia antigua no se migra a juntas con archivos.
- Pendiente de revisión del usuario en local. Sin publicación en GitHub ni Vercel.
- Comprobado en localhost con PDF ficticio: alta de próxima junta, paso a realizada adjuntando acta, conservación de convocatoria y acta tras recarga. Lint y build correctos; persiste aviso conocido de tamaño de bundle.

## Historial de Comunicaciones — cambios locales 10/10/2026

- Se añade selección individual y botón Eliminar seleccionada al historial de simulaciones de la comunidad activa. Persiste el resultado solo si localStorage acepta la escritura. Deshacer eliminación permite recuperar la última entrada eliminada antes de salir de la sección o cambiar de comunidad.
- Cambios pendientes de revisión local; sin publicación en GitHub ni Vercel.

## Trabajo local: PDF por comunidad — 10/10/2026

- Ajuste local de tabla Documentos: proporciones de las cuatro primeras columnas reducidas un 20 %, espacio mínimo de 140 px para Archivo y enlaces sin partir palabras.

- Preferencia expresa: preparar y mostrar cambios en local; pedir autorización antes de subir a GitHub o Vercel. Un push a main activa Vercel. No publicar automáticamente.
- Documentos permite guardar un PDF de hasta 10 MB con título y categoría en la comunidad seleccionada. Guarda archivo y metadatos en IndexedDB por ID de comunidad, separados del censo de localStorage. Permite abrir y descargar el PDF, y conservarlo al recargar. Los registros anteriores se identifican como ejemplos sin PDF adjunto.
- Almacenamiento exclusivo del navegador/origen, sin subida a un servidor ni acceso desde otros dispositivos. Restaurar demo conserva esta biblioteca independiente; borrar los datos del sitio elimina los PDF locales.
- Implementación local pendiente de revisión del usuario; no subida a GitHub ni Vercel.
- Validación local: lint y build correctos (aviso de bundle conocido). PDF ficticio añadido a Terrazas de Bel Air, visible con enlaces Abrir/Descargar, conservado tras recargar y ausente en Jardines del Sol. La validación del archivo comprueba extensión, tamaño y cabecera PDF; no analiza todo el contenido del PDF.

## Página principal con gestión lateral — 10/10/2026

- El selector inicial incorpora la misma barra lateral de gestión del panel, conservando las tarjetas compactas y la entrada sin comunidad seleccionada. La pantalla de acceso no cambia.
- Antes de seleccionar una comunidad, pulsar un módulo indica que debe elegirse una; al elegirla se abre ese módulo. Volver al selector restablece Comunidades. En móvil la barra se abre con el botón de menú.
- Lint y build correctos, con aviso conocido de tamaño. Comprobado visualmente en localhost: tarjetas y lateral juntos, y Economía → elegir comunidad → Economía de esa comunidad.
- Cambio publicado en `main` con `43c29b0` y comprobado después en https://fincaflow-phi.vercel.app : acceso a demo, tarjetas compactas y menú lateral visibles en la página principal.

## Preparación Vercel — 10/10/2026

- Se añade `vercel.json` para la demo estática Vite: comando `npx vite build`, salida `dist` y recarga de rutas SPA. Las rutas `/api/*` quedan fuera de la reescritura. Express y sus integraciones no se alojan en esta modalidad; la prueba de correo real sigue siendo exclusivamente local.
- `.vercelignore` excluye archivos `.env`, documentación, dependencias y compilaciones locales al subir con CLI. No copiar secretos locales a Vercel. Los datos de demo siguen en localStorage por navegador.
- Lint y build completos correctos, con el aviso conocido de tamaño de bundle. Vercel exige iniciar sesión; todavía no hay despliegue ni URL pública verificados. La configuración está en el árbol local, pendiente de publicar junto con el despliegue.

## Despliegue Vercel completado — 10/10/2026

- Nuevo proyecto `fincaflow` en el equipo `jonaans-projects`, conectado a `jonycusac-bot/Gestor-de-Comunidades`, rama `main`. Los proyectos existentes de racks no se han modificado.
- URL de producción: https://fincaflow-phi.vercel.app . Primer despliegue confirmado por Vercel desde `fcb8df9` (configuración estática publicada en GitHub).
- Comprobado en esa URL: pantalla de acceso, Ver demostración, selector sin comunidad elegida, apertura de Terrazas de Bel Air y recarga. La recarga vuelve a la entrada y permite entrar otra vez en la demo. No se han probado credenciales Supabase ni enviado correos.
- Se mantienen los límites de la demo estática descritos arriba: localStorage por navegador, sin servidor Express ni prueba real de correo en Vercel.

## Fuente de verdad y forma de trabajo

- Repositorio único: https://github.com/jonycusac-bot/Gestor-de-Comunidades, rama `main`.
- Antes de cada tarea, obtener la versión más reciente y leer el último commit. No reconstruir la aplicación desde ZIP antiguos.
- Para revisar sin publicar, ejecutar `npm install` (una vez), `npm run dev` y abrir `http://localhost:3000`. Después comprobar `npm run lint` y `npm run build`.
- GitHub conserva el código; la sesión de chat y sus límites de tokens no son la memoria del proyecto. Un agente con acceso al repositorio puede leer este documento y el código.
- Las URL de AI Studio/Cloud Run y Cloudflare son despliegues independientes. No asumir que una edición local o un commit aparece allí automáticamente.

## Objetivo acordado

Producto web comercial para administradores de fincas: gestionar varias comunidades desde un panel y ofrecer a propietarios una web independiente con novedades. La primera comunidad es **Terrazas de Bel Air**, Málaga. La demo debe ser utilizable sin costes iniciales y con datos ficticios.

## Decisiones del usuario

- Tras iniciar sesión, mostrar el selector de comunidades **sin ninguna seleccionada**. Solo abrir el panel cuando el usuario elija una. Permitir volver al selector para cambiar de comunidad.
- Empezar por el panel del gestor. Administración general primero; empleados y permisos detallados después.
- Terrazas de Bel Air tiene **12 portales**, con distinto número de viviendas por planta; existe planta -1. Identificar viviendas por portal/bloque, planta opcional y puerta, con nombres como Bajo A o Ático A.
- Importar propietarios y viviendas desde Excel al crear una comunidad; mostrar ficha de vivienda/propietario, historial de comunicaciones y pendientes de pago por comunidad.
- Comunicación del vecino: consulta, queja, incidencia y sugerencia/mejora, con texto y foto. El gestor debe ver la comunidad y el propietario de origen.
- El gestor publica avisos, informes y documentos en la comunidad elegida; los propietarios consultan novedades en su propia web. Preferencias de aviso por correo como demostración **sin envío real**.
- Fuera de alcance por decisión expresa: mensajería interna, reservas y pagos/recibos online.

## Estado comprobado en `main` al crear este documento

- Stack ejecutable actual: React, Vite, TypeScript y Express (`package.json`, `server.ts`). Hay un esquema Prisma heredado, pero la demo no usa la base para las comunidades.
- `AuthGate` ofrece acceso con Supabase Auth y botón **Ver demostración**. Al entrar, `Dashboard` comienza con `selectedCommunityId = null` y muestra `CommunitySelectorHub`; el valor elegido no se restaura al iniciar de nuevo.
- La demo contiene datos ficticios y operaciones locales. Las comunidades personalizadas se guardan en `localStorage`, no se comparten entre navegadores ni usuarios.
- El último cambio de interfaz conocido en este momento es `05fc857` (simplificar navegación y selección de comunidades), posterior a `baad78c` (iniciar sin comunidad seleccionada). Vuelve a comprobar `main`: puede haber commits posteriores.
- Los datos de ejemplo actuales de Terrazas de Bel Air indican **4 portales** en `src/data/communitiesData.ts`; esto no cumple aún el requisito de 12 y debe corregirse cuando se trabaje el censo realista.
- No se ha verificado que la URL de AI Studio muestre todos los commits recientes. No presentar una URL como versión actual sin comprobarla.

## Siguiente trabajo útil

## Supabase privado — preparación local 10/10/2026

- Autorizado conectar Supabase, sin autorización nueva para publicar en GitHub/Vercel. Remoto main comprobado: a7cd0fe, coincide con local.
- Aplicado docs/supabase-storage.sql al proyecto wytejpxqujzazgyfdobt: bucket privado fincaflow-private, PDF máximo 10 MB, tabla fincaflow_files con RLS por auth.uid(). Solo lectura/inserción de objetos bajo carpeta propia y lectura/inserción/edición de metadatos propios. No políticas de borrado. SQL de instalación inicial; no repetir las declaraciones create policy sin comprobar antes.
- Documentos y Juntas usan nube al iniciar sesión y conservan IndexedDB en Ver demostración. No se migran automáticamente archivos locales. Una misma cuenta puede recuperar archivos en otro navegador; comunidades/censo/comunicaciones siguen locales. Usar las comunidades ficticias predefinidas para comprobar entre equipos.
- Acceso REST con clave publicable, sin service_role ni secretos nuevos. Renovación de sesión al expirar. Adjuntos privados descargados como Blob, metadatos guardados después de los PDF; editar sin sustituir conserva archivo. Las versiones sustituidas y subidas sin metadatos por fallo pueden quedar en Storage: pendiente limpieza controlada para uso continuado.
- Lint/build correctos (aviso conocido de bundle), pruebas con fetch simulado: orden de guardado, conservación de adjuntos al editar, recuperación, rechazo de rutas de otra cuenta y renovación. Petición anónima a tabla devuelve lista vacía. Falta prueba real autenticada de subida/recarga/otro equipo: solicitada entrada del usuario en localhost con cuenta FincaFlow. No afirmar que la subida real está verificada.
- La URL de Vercel mantiene la versión anterior hasta autorización y publicación. No se enviaron correos ni PDFs reales.

1. Probar visualmente el flujo entrada → selector vacío de selección → comunidad → volver al selector, en escritorio y móvil.
2. Convertir el censo piloto a 12 portales, con estructuras variables de portal, planta y puerta.
3. Completar el flujo gestor publica aviso/documento → propietario lo consulta, con datos demo y límites de acceso claros.
4. Solo después, conectar almacenamiento real, políticas RLS y avisos por correo; mantener los correos desactivados en la demo.

## Actualización — 21/09/2026

- La alta de comunidades ya permite importar propietarios y viviendas desde un archivo `.xlsx` en `dashboard.tsx`, usando la pestaña `Propietarios` y las columnas: Portal / Bloque, Planta, Puerta, Nombre del propietario, DNI/NIF, Email, Teléfono, Coeficiente de propiedad (%), Estado de pago y Observaciones.
- La aplicación valida las columnas obligatorias, las filas incompletas y los correos repetidos. A partir del archivo calcula automáticamente portales y viviendas, y guarda el resultado solo en `localStorage` como el resto de la demo.
- Las plantillas ficticias quedan en `docs/plantillas/`: `plantilla_alta_comunidad.xlsx` y `ejemplo_comunidad_8_portales.xlsx`. El ejemplo contiene 64 viviendas de 8 portales y coeficientes que suman el 100%.
- Se añadió la dependencia de frontend `xlsx`. `npm run lint` y `npm run build` han pasado. La compilación avisa de un paquete JavaScript de más de 500 kB; es una mejora de rendimiento pendiente, no un error funcional.
- La tabla general de propietarios no muestra DNI ni coeficiente de participación; ambos datos quedan reservados para la ficha individual del propietario.
- Se retiró la vista Resumen. Al abrir una comunidad, el panel empieza en Comunidades. El selector inicial muestra al final un globo con todos los avisos y noticias y, al abrirlo, los agrupa por comunidad.
- Desde Comunidades se puede dar de baja una comunidad de la demo. La acción elimina sus datos locales y exige dos confirmaciones consecutivas.

## Mensaje breve para OmniRoute u otro agente

> Continúa el único proyecto `jonycusac-bot/Gestor-de-Comunidades` desde la rama `main`. Lee primero `AGENTS.md`, `docs/CONTINUIDAD.md`, `README.md` y los últimos commits. No uses ZIP antiguos ni supongas que AI Studio o Cloudflare reflejan GitHub. Revisa el código actual y ejecuta la demo local en `http://localhost:3000` antes de cambiarla. El usuario quiere una demo comercial multi-comunidad para administradores, con Terrazas de Bel Air como piloto. Indica qué funciona realmente, implementa la tarea que te dé y actualiza el documento de continuidad si cambias el estado.

## Actualización — 09/10/2026

- El alta de comunidad destaca la importación desde Excel en un bloque verde antes de las opciones manual y de ejemplo, tanto desde el selector inicial como desde el panel. Incluye botón de selección y confirmación del número de viviendas y portales preparados. No cambia el formato ni el almacenamiento de la importación.

- El formulario de alta se adapta a PC con ancho máximo de 720 px, desplazamiento interno limitado al alto de pantalla y cabecera/botones de acción fijos dentro de la ventana para mantener accesible Crear comunidad tras importar Excel.

- Al seleccionar una comunidad se abre su panel exclusivo con tarjetas de Propietarios, Avisos y noticias y Pendientes de pago. Esta última abre propietarios filtrados por pago pendiente; los contadores se calculan de los registros visibles. La lista de comunidades permanece en el selector general, accesible desde Salir o Ver todas.

- Aclaración de navegación: se conserva Comunidades en la barra lateral y abre el listado completo dentro del panel. Al pulsar una tarjeta se abre el panel exclusivo de esa comunidad con sus opciones centrales.

- Se retira el botón lateral Cambiar comunidad / Salir señalado por el usuario. Comunidades sigue abriendo el listado completo.

- El listado de Comunidades usa tarjetas compactas en cuatro columnas para PC ancho, tres hasta 1250 px, dos hasta 1000 px y una en móvil.

- Ajuste solicitado: cuatro columnas desde 851 px de ventana; tres hasta 850 px y dos hasta 700 px (una hasta 600 px).

- La pantalla inicial (CommunitySelectorHub) también muestra cuatro tarjetas por fila desde 851 px, incluida Registrar nueva comunidad, con tarjetas compactas y contenedor máximo de 1440 px.

- Propietarios sustituye Añadir lote de ejemplo por Modificar propietario: selector limitado a la comunidad activa, edición de datos y estado de cuota, validación de correo duplicado y guardado local con recálculo de contadores.

- Los filtros Todos / Al día / Pendientes tienen formato de pestañas con contadores separados, selección accesible y énfasis rojo para pendientes.

## Prototipo de cuotas — 09/10/2026

- Se incorpora `PaymentsDemo` dentro de Propietarios, separado de la etiqueta manual Al día/Pendiente del censo. No actualiza esos estados ni representa conciliación bancaria.
- Permite cargar un ejemplo ficticio por vivienda (septiembre y noviembre de 2026), descargarlo como Excel e importar una hoja `Cuotas` con Referencia, Vivienda, Concepto, Vencimiento (texto AAAA-MM-DD), Cuota y Cobrado (total acumulado por cuota, euros).
- La vista previa exige confirmación y sustituye el resumen completo de esa comunidad, evitando sumar otra vez un archivo repetido. Se validan referencias únicas, viviendas del censo, fechas e importes (hasta dos decimales; sin negativos ni cobros superiores a cuota). El dinero se calcula en céntimos.
- Resumen: emitido, cobrado, vencido pendiente y pendiente por vencer. Detalle filtrable por vivienda con pagado, parcial, vencido o por vencer. Una cuota vence al terminar su fecha de vencimiento; se usa la fecha de Madrid.
- Persistencia independiente por comunidad en localStorage (`fincaflow-quota-demo-v1-<id>`), solo en este navegador. La importación se cancela si se cambia de comunidad mientras se lee el archivo.
- Comprobado en localhost: cargar ejemplo, vista previa y confirmar (5 viviendas: 1.000 € emitidos, 320 € cobrados, 180 € vencidos, 500 € futuros a 09/10/2026). Pruebas de importes, fechas inválidas, duplicados, viviendas desconocidas y ciclo Excel en memoria. Lint/build correctos; persiste aviso conocido de tamaño de bundle.
- Pendiente para producción: identificadores estables de viviendas, historial de titularidad, saldos iniciales, movimientos y devoluciones, auditoría y almacenamiento compartido. El prototipo muestra saldos acumulados, no un historial de transferencias individuales ni una prueba de estar al día de toda la contabilidad.

- El prototipo de cuotas se traslada a Economía por petición del usuario. Propietarios vuelve a mostrar únicamente el censo; Economía concentra el resumen, ejemplo ficticio e importación Excel con columna Cobrado. Se conservan los datos locales ya cargados.

- La descarga de Economía usa el censo actual de la comunidad y el resumen confirmado (o ejemplo ficticio si no existe). Añade Comunidad y Propietario, hoja Información con origen y límites, y nombre de archivo por comunidad y fecha. No implica censo completo ni cobros bancarios verificados.

- El ejemplo económico usa 240 € por vivienda y trimestre, cuatro cuotas anuales (960 €). Vencimientos ficticios el día 5 de enero/abril/julio/octubre; cuarto trimestre con cobros completos, parciales de 120 € y pendientes. Se actualiza automáticamente solo el antiguo ejemplo generado de septiembre/noviembre; los archivos importados se conservan.

- Comunicaciones incorpora selección de destinatarios de la comunidad activa, deduplicación y validación de correos (excluye .local), plantillas, vista previa y confirmación explícita de simulación. Historial de simulaciones de asunto, cuerpo, destinatarios y fecha guardado por comunidad en localStorage. El envío general no entrega correos; la prueba individual real se describe abajo.

## Prueba real individual por correo — 09/10/2026

- Se autoriza una excepción para enviar pruebas únicamente al correo del usuario, configurado en EMAIL_TEST_RECIPIENT dentro de .env local (ignorado por Git). No se altera ningún titular existente ni se publica su dirección en el código.
- Integración Resend mediante API en servidor; clave RESEND_API_KEY configurada por el usuario exclusivamente en .env local. EMAIL_TEST_ENABLED activa la prueba solo fuera de producción. Remitente onboarding@resend.dev, destinatario fijado en servidor y comunidad bel-air; el navegador no puede cambiar destinatarios.
- La ruta requiere conexión loopback, hostname local, origen local y cabecera explícita; límite de un intento por minuto e idempotencia. UI con revisión independiente y botón Enviar prueba real. El envío general continúa simulado.
- Estado: CORREO ACEPTADO por Resend y recepción confirmada expresamente por el usuario el 09/10/2026. Prueba con asunto [PRUEBA FincaFlow] Comprobación de correo de Terrazas de Bel Air, para portal 4, puerta 2. Identificador del proveedor: 01a121e4-a90c-7340-a270-366863680c47. El servidor local se reinició con la configuración. La aplicación distingue aceptación del proveedor de entrega; la confirmación de recepción de esta prueba procede del usuario.
- Para configurar otro PC: crear cuenta Resend con el correo autorizado, generar clave de envío, pegarla únicamente en .env y reiniciar npm run dev. No compartir la clave por chat ni añadirla a GitHub.
