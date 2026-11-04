# Plan de implementación: EUFORIA Beauty Studio

## Alcance

Construir una app móvil Expo/React Native/TypeScript para un estudio de belleza en Honduras. La primera entrega debe dejar una experiencia navegable y visualmente coherente para administrador, cliente y empleado, con Firebase preparado como backend real. Todas las cantidades deben pasar por `formatCurrency` y mostrarse como `L. X,XXX.XX`.

## Arquitectura

Se conserva el starter Expo Router/NativeWind del proyecto. `app/` contiene el Stack y las cuatro tabs administrativas; las rutas de cliente, empleado, autenticación, agenda y WhatsApp se mantienen como segmentos adicionales. `components/` contiene Header, tarjetas, chips, botones, inputs, bottom sheet, modal y navegación. `constants/` concentra tokens de color y espaciado. `lib/` contiene formatCurrency, Firebase cliente, repositorios Firestore, notificaciones y utilidades. `providers/` gestiona sesión, rol, tema y negocio seleccionado. `functions/` contiene Cloud Functions TypeScript y `firestore.rules`/`firestore.indexes.json` definen seguridad e índices.

La capa Firebase se diseña con interfaces pequeñas para poder trabajar sin credenciales durante la previsualización. Se incluyen datos demo locales para la UI y una ruta de inicialización Firebase documentada; cuando existan credenciales, Auth, Firestore offline y FCM sustituyen los datos demo sin cambiar las pantallas.

## Diseño aprobado

- **Direcciones visuales consideradas**: lujo editorial rosa (0.06), wellness pastel minimalista (0.08), boutique beauty premium (0.07).
- **Elección**: boutique beauty premium.
- **Movimiento**: estética de salón premium con composición editorial, blanco cálido, rosa rubor, vino profundo y acentos dorados tomados del logo.
- **Principios**: lectura inmediata, superficies limpias, acciones grandes para uso con una mano y estados operativos siempre visibles.
- **Color**: `#FFF5F7` como lienzo amable, `#FFFFFF` para elevar contenido, `#D85C7A` para acciones, `#5C1A2E` para marca y texto, `#25D366` para WhatsApp, dorado tenue solo como acento.
- **Layout**: encabezado asimétrico con saludo y campana; tarjetas apiladas con métricas; listas con avatares y barras de regreso; bottom navigation flotante visualmente ligera.
- **Firma**: logo circular en el Header, chips rosados, barras finas de retorno y previews de WhatsApp en verde.
- **Interacción**: feedback inmediato en botones, bottom sheets para edición rápida, estados vacíos claros y confirmaciones para acciones destructivas.
- **Animación**: spring corto para chips y sheets, transiciones suaves de navegación, sin animaciones que oculten datos importantes.
- **Tipografía**: sans del sistema para legibilidad, pesos 700–800 para marca y métricas; mínimo 16 px en entradas y controles principales.
- **Marca**: EUFORIA Beauty Studio; personalidad cálida, premium y organizada. Voz directa y cercana: “Tu próxima visita empieza aquí” y “Avísale a tus clientas con un toque”.
- **Icono**: se utiliza el logo suministrado con área segura para evitar recorte en launcher.

## Datos y reglas

Se modelan negocios, empleados, servicios, clientes, citas y notificaciones según el contrato. `reservarCita` lee citas activas del mismo empleado/negocio dentro del rango y escribe en una transacción atómica. En modo unipersonal el estado inicial es `confirmada`; en multi-empleado es `hold` o `pendiente_de_aprobacion` según el flujo. `expirarHolds` libera holds vencidos y `aprobarCita`/`rechazarCita` cambian estados y disparan push.

### Ampliación derivada del enlace compartido

La colección heredada `users/{uid}` será la fuente de identidad compatible con los perfiles existentes. Se conservarán `email`, `id`, `identityNumber`, `name`, `phone`, `profileImage` y `role`; `role` acepta `cliente`/`customer`, `empleado` y `administrador`/`admin`. Un registro público siempre nace como cliente. El administrador es el único que puede promover un usuario y crear su perfil laboral de empleado.

Los perfiles de empleado tendrán disponibilidad semanal con hora de inicio, hora de fin y `disponible: true|false`. Se interpretan turnos diurnos de 8:00 a. m. a 5:00 p. m. y se soportan turnos que cruzan medianoche. Los servicios tendrán precio en lempiras y `duracionMin`; el cálculo de slots solo mostrará intervalos que caben completos dentro del horario disponible y que no se cruzan con citas activas.

El empleado recibe solicitudes pendientes y puede confirmar, iniciar y finalizar el servicio. Al iniciar se guarda `startedAt`; al finalizar se guarda `completedAt` y `duracionRealMin` para que el administrador pueda medir la ejecución real por empleado y servicio. La confirmación crea o actualiza la cita del cliente de forma inmediata y genera una notificación persistente para el destinatario.

## Build y validación

Se mantendrán los puertos fijos 8081/3000 del starter. Antes del primer checkpoint se colocan los assets nativos, se ejecuta el diagnóstico TypeScript, `pnpm check`, `pnpm lint` y el arranque Metro/API. Se documenta que el APK requiere EAS y credenciales nativas; no se ejecuta un build Android dentro del Sandbox.
