# EUFORIA Beauty Studio

Aplicación móvil para la gestión de citas y clientas de EUFORIA Beauty Studio, Honduras. Está construida sobre el starter administrado de Expo Router, React Native, TypeScript y NativeWind.

## Estado de esta entrega

La primera entrega deja lista la identidad visual, la navegación principal de cuatro secciones y los flujos visuales de resumen, clientes, avisos por WhatsApp, ajustes, catálogo cliente y agenda empleado. La UI usa datos demo para funcionar en Preview sin credenciales externas. La auditoría del repositorio de referencia está en `AUDITORIA.md` y las decisiones técnicas en `plan.md`.

## Logo e icono

El logo proporcionado está en `assets/images/icon.png` y en las variantes nativas de Android, splash y favicon. Se preparó en un lienzo cuadrado de 1024×1024 con margen seguro para que Android no recorte el borde, el rostro ni el texto al usar máscaras circulares o redondeadas. `app.config.ts` apunta a esos archivos y contiene el `logoUrl` HTTPS para el metadato de proyecto.

## Moneda

La aplicación usa exclusivamente lempiras hondureños. La utilidad `lib/formatCurrency.ts` produce `L. X,XXX.XX`; no deben agregarse `$` ni `HNL` a la interfaz.

## Firebase

Copia `.env.example` como `.env` y coloca las variables públicas de Firebase para el cliente. En una build nativa, agrega `google-services.json` y `GoogleService-Info.plist` según la configuración de tu proyecto Firebase. No se deben subir claves privadas ni el service account al repositorio. Activa Auth por teléfono y email/password, Firestore, FCM y persistencia offline.

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
| Resumen administrador | Implementado con datos demo |
| Clientes y seguimiento | Implementado con datos demo |
| Avisos WhatsApp y variables | Implementado visualmente |
| Ajustes y moneda bloqueada | Implementado visualmente |
| Catálogo cliente y agenda empleado | Prototipo navegable |
| Firebase Auth/Firestore/FCM | Configuración y contratos pendientes de credenciales |
| Anti-solapamiento transaccional | Functions y rules en preparación |
| APK EAS | Requiere credenciales/proyecto Firebase y EAS |

## Pendientes honestos

Faltan conectar credenciales reales de Firebase, activar Auth/FCM, implementar la persistencia completa de clientes y citas, desplegar Cloud Functions, probar notificaciones en dispositivo y ejecutar un build EAS real. La previsualización web no valida por sí sola permisos nativos, FCM, huella/PIN ni el comportamiento final del launcher Android.
