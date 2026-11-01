# Auditoría del repositorio de referencia

Repositorio auditado: `https://github.com/FRYCHICKEN7/FRYCHICKEN8`

## Estructura y navegación

El repositorio usa Expo Router con rutas basadas en archivos. `app/_layout.tsx` monta los proveedores globales, `GestureHandlerRootView`, `QueryClientProvider`, `ThemeProvider`, `SafeAreaProvider`, `Stack` y `StatusBar`. La navegación principal vive en `app/(tabs)/_layout.tsx` y usa tabs inferiores con rutas para menú, carrito, pedidos, premios y perfil; además existen grupos de rutas para administración, sucursales, repartidores, autenticación y modales.

La base TypeScript se organiza en `app/` para pantallas, `components/` para componentes reutilizables, `providers/` para estado global, `hooks/` para hooks, `lib/` para servicios y utilidades, `constants/` para tokens, `server/` para API/tRPC y Firebase Admin, `drizzle/` para persistencia auxiliar y `types/`/`shared/` para contratos. El proyecto usa alias `@/*` y `expo-router/entry` como entrada.

Para EUFORIA se conserva el árbol Expo Router y la separación por responsabilidades, pero la navegación se sustituye por cuatro tabs de negocio: Resumen, Clientes, Avisar y Ajustes. Las vistas cliente y empleado se agregan como rutas protegidas y modales, manteniendo el mismo patrón de Stack + tabs.

## Sistema visual extraído

El repositorio de referencia define inicialmente una paleta oscura de negocio: `primary #f3bb06`, `secondary #000000`, `accent #D01714`, `success #21A118`, `background #0A0A0A`, `surface #1A1A1A`, `surfaceLight #2A2A2A`, `border #333333`, `textPrimary #FFFFFF`, `textSecondary #B0B0B0`, `textMuted #707070`, `whatsapp #25D366`, `error #FF4444` y overlay negro con 70% de opacidad.

En componentes, las tarjetas usan `borderRadius: 24`, `padding` entre 12 y 16, sombra/elevación baja y `overflow: hidden`. Los chips usan `borderRadius: 24`, `paddingHorizontal: 14`, `paddingVertical: 10`, borde de 1 px y separación aproximada de 10 px. Los botones compactos usan radios de 10 px; las acciones principales se presentan como contenedores redondeados y de alto contraste. Los textos base comienzan en 13–16 px y los títulos en 16–17 px con peso 700–800. La configuración de fuentes usa familias del sistema: sans, serif, rounded y mono.

El contrato visual de EUFORIA reemplaza los valores de marca del repositorio por: fondo `#FFF5F7`, superficie `#FFFFFF`, primario fucsia `#D85C7A`, vino `#5C1A2E`, bordes rosados suaves, éxito verde y WhatsApp `#25D366`. Se mantienen la jerarquía, los radios suaves, las sombras ligeras, el espaciado respirado y los tamaños legibles del referente.

## Componentes base revisados

- **ProductCard**: tarjeta horizontal con nombre, descripción, precio, imagen, acciones y estado; se reutiliza conceptualmente para `ServiceCard` y `ClientCard`.
- **CategoryChip**: chip con icono, selección animada con `Animated.spring`, borde y estado activo; se reutiliza para filtros y servicios.
- **OrderCard**: tarjeta de estado con icono, badge, fecha, total, acciones y modales; se reutiliza conceptualmente para `AppointmentCard`.
- **ScreenContainer**: combina `View`, `SafeAreaView` y fondo temático; se conserva para todas las pantallas.
- **IconSymbol**: abstrae SF Symbols en iOS y Material Icons en Android/Web; se conserva como fallback, complementándolo con Lucide para iconografía de negocio.
- **ThemeProvider**: aplica paletas light/dark y variables NativeWind; se extiende con la paleta rosa de EUFORIA.
- **Providers/Auth/API**: el starter trae providers de autenticación y cliente tRPC. Firebase será la fuente de verdad para Auth/Firestore/FCM; la infraestructura existente se conserva para compatibilidad del runtime y las rutas OAuth del starter.

## Configuración Expo/EAS

El starter usa `expo ~57`, Expo Router, NativeWind, React Native Web, `expo-notifications`, `expo-secure-store`, `expo-local-authentication`, `expo-document-picker`, `expo-sharing` y Firebase. `app.config.ts` contiene identificadores generados que deben preservarse, orientación portrait, adaptive icon, splash screen, permisos de notificaciones y plugins Expo. El build Android solicitado queda documentado como `eas build -p android --profile preview`; la ejecución real del build depende de credenciales/configuración EAS fuera del Sandbox.

Para EUFORIA se actualizan `name`, `slug`, colores del adaptive icon, icono, splash y `logoUrl`, sin cambiar el esquema ni los identificadores generados. El icono proporcionado se usa en `assets/images/icon.png`, `splash-icon.png` y las variantes Android. La imagen se dejó en lienzo cuadrado 1024×1024 con margen seguro aproximado de 112 px por lado para evitar recortes por máscaras circulares o redondeadas.

## Decisiones de implementación

1. La moneda se centraliza en `lib/formatCurrency.ts` y siempre produce `L. X,XXX.XX`.
2. La reserva se ejecuta únicamente mediante Cloud Function callable y transacción Firestore para evitar carreras.
3. Las reglas Firestore bloquean escrituras directas de `citas` desde clientes.
4. Los datos de demostración se separan de la capa Firebase para que la UI pueda previsualizarse sin credenciales.
5. El diseño de EUFORIA conserva el lenguaje del referente, pero aplica la identidad visual solicitada y navegación de cuatro tabs.
