# EUFORIA Beauty Studio

Aplicación móvil para la gestión de citas y clientas de EUFORIA Beauty Studio, Honduras. Está construida sobre el starter administrado de Expo Router, React Native, TypeScript y NativeWind.

## Estado de esta entrega

La entrega deja lista la identidad visual, la navegación principal de cuatro secciones, el acceso por Firebase Authentication y los flujos visuales de resumen, clientes, avisos por WhatsApp, ajustes, catálogo cliente y agenda empleado. No se incluyen nombres, servicios, precios ni estadísticas ficticias: mientras Firebase no entregue datos, la aplicación muestra ceros y estados vacíos. La auditoría del repositorio de referencia está en `AUDITORIA.md` y las decisiones técnicas en `plan.md`.

## Logo e icono

El logo proporcionado está en `assets/images/icon.png` y en las variantes nativas de Android, splash y favicon. Se preparó en un lienzo cuadrado de 1024×1024 con margen seguro para que Android no recorte el borde, el rostro ni el texto al usar máscaras circulares o redondeadas. `app.config.ts` apunta a esos archivos y contiene el `logoUrl` HTTPS para el metadato de proyecto.

## Moneda

La aplicación usa exclusivamente lempiras hondureños. La utilidad `lib/formatCurrency.ts` produce `L. X,XXX.XX`; no deben agregarse `$` ni `HNL` a la interfaz.

## Firebase

Copia `.env.example` como `.env` y coloca las variables públicas de Firebase para el cliente. La tarjeta **Ajustes → Conexión segura con Firebase** solo muestra el estado de la conexión; no captura ni almacena credenciales. Configura las variables `EXPO_PUBLIC_FIREBASE_*` en el entorno local, en los secretos del proyecto o en EAS. Esos valores son configuración pública del cliente, pero nunca deben mezclarse con claves privadas.

La pantalla inicial es `app/auth.tsx`: permite iniciar sesión y registrarse con Firebase Authentication por email y contraseña. Al registrarse se crea el perfil `usuarios/{uid}` con rol inicial `cliente`. Para administrar roles, crea o actualiza ese documento con `rol: administrador`, `empleado` o `cliente` desde un entorno autorizado. Nunca coloques contraseñas, tokens privados, service accounts ni archivos JSON privados en la tarjeta o el repositorio.

En una build nativa, agrega `google-services.json` y `GoogleService-Info.plist` según la configuración de tu proyecto Firebase. Activa Auth por teléfono y email/password, Firestore, FCM y persistencia offline.

El backend previsto se encuentra en `functions/`. `firestore.rules` bloquea la escritura directa de `citas` desde clientes. La función callable `reservarCita` debe ser la única vía para validar solapamiento dentro de una transacción Firestore.

## Desarrollo

```bash
pnpm install --prefer-offline
pnpm check
pnpm lint
pnpm dev
```

Expo Web escucha en 8081 y el servidor del starter en 3000. Para un build Android de preview, configura credenciales y ejecuta desde EAS:

```bash
eas build -p android --profile preview
```

El APK no se afirma como generado hasta contar con el resultado real de EAS.

## Features

| Feature | Estado |
| --- | --- |
| Identidad EUFORIA, logo y iconos seguros | Implementado |
| Resumen administrador | Implementado con ceros y estados vacíos |
| Clientes y seguimiento | Implementado sin datos ficticios |
| Avisos WhatsApp y variables | Implementado visualmente |
| Ajustes y moneda bloqueada | Implementado visualmente |
| Catálogo cliente y agenda empleado | Prototipo navegable |
| Firebase Auth/Firestore/FCM | Auth email/password y tarjeta de conexión implementados; faltan credenciales/FCM |
| Anti-solapamiento transaccional | Functions y rules en preparación |
| APK EAS | Requiere credenciales/proyecto Firebase y EAS |

## Pendientes honestos

Faltan activar FCM, implementar la persistencia completa de clientes y citas, desplegar Cloud Functions, probar notificaciones en dispositivo y ejecutar un build EAS real. La previsualización web no valida por sí sola permisos nativos, FCM, huella/PIN ni el comportamiento final del launcher Android.
