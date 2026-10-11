# Prueba privada de Terrazas de Bel Air

Estado: código local; esquema y dos membresías activados en Supabase el 11/10/2026, con pruebas SQL de permisos correctas. Pendiente prueba de sesión autenticada y publicación.

## Activación

1. Crear o identificar dos cuentas distintas de FincaFlow en Supabase Authentication: gestor y propietario. El usuario introduce sus contraseñas fuera del chat. No enviar invitaciones a otros propietarios.
2. Ejecutar `docs/supabase-messages.sql` una vez en SQL Editor del proyecto existente. Mantiene intactos Documentos y Juntas. La migración no concede acceso a ninguna cuenta.
3. Ejecutar `docs/supabase-messages-check.sql`: comprueba propietario, gestor, tercero y anónimo, con datos ficticios en una transacción que termina en ROLLBACK. Si falla, detener la activación y ejecutar ROLLBACK.
4. Identificar los UUID de las dos cuentas. Insertar únicamente esas dos vinculaciones siguiendo los ejemplos comentados al final de la migración. La vivienda la confirma el usuario; no deducirla del censo de demo. Estas vinculaciones solo se crean desde el panel administrativo, nunca desde el navegador del propietario.
5. Probar dos sesiones separadas en local. Propietario: `http://localhost:3000/?portal=propietario`. Gestor: `http://localhost:3000/`, Terrazas de Bel Air → Mensajes. En sesión autenticada se usa Supabase; Ver demostración mantiene la simulación local independiente.
6. Probar mensaje, respuesta, recarga y bloqueo de otra cuenta. No afirmar seguridad probada hasta ejecutar realmente las comprobaciones SQL y de sesión.
7. Publicar en GitHub/Vercel únicamente tras autorización. URL prevista del propietario: `https://fincaflow-phi.vercel.app/?portal=propietario`. Verificar esa versión desde móvil y gestor después del despliegue. Entonces el PC puede apagarse.

## Alcance y límites

- Texto únicamente: asunto de hasta 120 caracteres y mensaje de hasta 4.000. Sin adjuntos, correo ni notificaciones automáticas. Botón Actualizar para consultar respuestas, sin sondeo periódico.
- RLS valida la cuenta, comunidad y destinatario. Las cuentas de propietario se dirigen al portal y no usan el panel del gestor. La URL no concede privilegios.
- Membresías de solo lectura para el usuario. Historial sin modificación ni borrado desde el cliente. El gestor solo actualiza la columna de estado de sus conversaciones.
- Primer mensaje y conversación se crean juntos mediante una función con permisos del usuario; no utiliza service_role. IDs persistentes durante reintentos evitan duplicados si la primera petición llegó al servidor.
- Los cambios de texto tras un error representan un nuevo intento. Las respuestas no cambian automáticamente el estado; el gestor lo controla.
- Supabase Free tiene límites de espacio, transferencia y actividad; no se ha cambiado ni verificado el plan de esta cuenta. La prueba no requiere contratar un plan de pago.
- La comprobación inicial de rol necesita la tabla de membresías antes de publicar esta versión. Un error de conexión/configuración bloquea la entrada autenticada y ofrece Reintentar.

