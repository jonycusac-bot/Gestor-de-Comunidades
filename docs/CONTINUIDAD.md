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
2. Convertir el censo piloto a 12 portales y hacer funcional el alta/importación Excel, con estructuras variables.
3. Completar el flujo gestor publica aviso/documento → propietario lo consulta, con datos demo y límites de acceso claros.
4. Solo después, conectar almacenamiento real, políticas RLS y avisos por correo; mantener los correos desactivados en la demo.

## Mensaje breve para OmniRoute u otro agente

> Continúa el único proyecto `jonycusac-bot/Gestor-de-Comunidades` desde la rama `main`. Lee primero `AGENTS.md`, `docs/CONTINUIDAD.md`, `README.md` y los últimos commits. No uses ZIP antiguos ni supongas que AI Studio o Cloudflare reflejan GitHub. Revisa el código actual y ejecuta la demo local en `http://localhost:3000` antes de cambiarla. El usuario quiere una demo comercial multi-comunidad para administradores, con Terrazas de Bel Air como piloto. Indica qué funciona realmente, implementa la tarea que te dé y actualiza el documento de continuidad si cambias el estado.
