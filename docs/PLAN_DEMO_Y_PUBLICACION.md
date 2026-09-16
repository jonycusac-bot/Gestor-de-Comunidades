# Plan de demo pública y evolución comercial

Actualización: 12/09/2026

## Fase actual: demostración sin coste
- Aplicación estática publicada en Cloudflare Pages.
- Datos completamente ficticios.
- Operaciones de demostración guardadas en el navegador.
- Restauración inmediata del estado inicial.
- Sin documentos reales ni información personal.

## Objetivo de la demo
Permitir que un administrador de fincas recorra el producto, entienda sus módulos y pruebe altas básicas sin crear cuentas ni depender de una base de datos.

## Paso a producto piloto
- Supabase para PostgreSQL, autenticación y archivos privados.
- Aislamiento por organización y comunidad.
- Autorización en servidor y políticas por fila.
- Auditoría de acciones.
- Copias de seguridad y cumplimiento RGPD.

## Paso a producto comercial
- Entorno de producción independiente.
- Dominio propio.
- Suscripción y facturación.
- Planes por número de comunidades o viviendas.
- Soporte, monitorización y recuperación.

La interfaz y el modelo funcional creados para la demo se conservarán. El almacenamiento local de demostración se sustituirá por repositorios conectados a la API, evitando rehacer las pantallas.
