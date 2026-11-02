# TODO EUFORIA

## Auditoría y branding

- [x] Documentar la estructura, navegación, tokens, componentes base y configuración del repositorio de referencia en `AUDITORIA.md`.
- [x] Integrar el logo proporcionado en icono, splash, favicon, adaptive icon y Header; el logo debe conservarse completo sin recortes al instalar.

## Experiencia móvil

- [x] Reemplazar el demo del starter por las cuatro tabs Resumen, Clientes, Avisar y Ajustes.
- [x] Implementar Header con logo circular, nombre EUFORIA, saludo y campana.
- [x] Implementar tarjetas, chips, botones píldora, inputs, modales, avatares, barras de progreso y estados vacíos con la paleta `#FFF5F7`, `#FFFFFF`, `#D85C7A` y `#5C1A2E`.
- [ ] Implementar Resumen con tabs Semana/Mes, ingresos, visitas, servicio popular y clientas para avisar hoy.
- [ ] Implementar Clientes con búsqueda, historial y Nueva Visita en bottom sheet con servicio, precio, días, recordatorio y notas.
- [x] Implementar Avisar con filtros, preview de WhatsApp, variables `{nombre}`, `{servicio}`, `{precio}`, botón de envío y marcar como avisada.
- [x] Implementar Ajustes con tema, moneda bloqueada a Lempira, notificaciones, exportación JSON/CSV, importación y restablecimiento visual.
- [x] Crear tarjeta de seguridad dentro de Ajustes como indicador de estado; la configuración Firebase vive fuera de la app.
- [x] Crear pantalla de inicio de sesión y registro por email/password con perfiles `usuarios/{uid}` y rol inicial `cliente`.
- [x] Añadir selector de acceso Administrador/Cliente y validar el rol seleccionado contra `usuarios/{uid}.rol` antes de entrar.
- [x] Implementar recuperación de contraseña por correo con `sendPasswordResetEmail` y cambio interno con `updatePassword`/reauthenticate.
- [x] Ajustar el modo oscuro a rosado oscuro con texto blanco y persistir la selección del tema.
- [ ] Implementar los flujos de cliente: catálogo, agenda, citas, cancelación/reprogramación, calendario, llamada, WhatsApp y perfil.
- [ ] Implementar los flujos de empleado: agenda, pendientes y aprobar/rechazar/proponer nueva hora.

## Moneda y datos

- [x] Crear `formatCurrency(value)` y usarlo en tarjetas, listas, inputs, plantillas y estadísticas con formato exacto `L. X,XXX.XX`.
- [ ] Activar en Firebase los proveedores Auth, terminar la recuperación de sesión/rol y conectar persistencia real de usuarios, clientes y citas.
- [x] Crear contratos base para negocios, empleados, servicios, clientes, citas y notificaciones.
- [x] Crear índices `(negocioId, empleadoId, inicio)` y `(negocioId, estado, inicio)`.

## Backend seguro

- [x] Crear `functions/` TypeScript con `reservarCita`, `aprobarCita`, `rechazarCita`, `expirarHolds` y `enviarPush`.
- [x] Implementar la transacción atómica de `reservarCita` y el rechazo de conflictos en la misma franja.
- [x] Implementar los estados hold, pendiente_de_aprobacion, confirmada, en_curso, completada, cancelada, rechazada y expirada en las reglas/contratos.
- [x] Crear `firestore.rules` para bloquear escrituras directas de `citas`.
- [ ] Configurar FCM y notificaciones locales para confirmación, rechazo y recordatorios de 24h/1h.

## Calidad y entrega

- [x] Actualizar `README.md` con logo, Firebase, despliegue de Functions, `eas build -p android --profile preview`, features y pendientes honestos.
- [x] Ejecutar diagnóstico TypeScript, `pnpm check`, `pnpm lint`, build del servidor y verificación de listeners 8081/3000.
- [x] Revisar rutas y estados sin credenciales con ceros y estados vacíos, sin datos demo.
- [ ] Dejar lista la configuración para que el APK se genere en EAS, sin afirmar éxito hasta disponer del resultado real de EAS.
