# Continuidad del proyecto — 18/09/2026

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
