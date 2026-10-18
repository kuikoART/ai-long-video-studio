# NOTI VIDEO AI — v1.0

Aplicación Android/web experimental para texto→video e imagen→video con Pollinations AI.

## Probar en navegador
Abre `www/index.html` en un navegador o aloja `www/` en cualquier hosting estático HTTPS. Introduce tu propia clave Pollinations en cada sesión.

## APK sin instalar Android Studio
1. Crea un repositorio de GitHub y sube **el contenido** de esta carpeta.
2. En GitHub, abre **Actions → Compilar APK Android → Run workflow** (o sube a `main`).
3. Cuando termine, descarga el artifact **NOTI-VIDEO-AI-APK** y extrae `app-debug.apk`.
4. Instálalo en Android habilitando la instalación desde esa fuente cuando te lo solicite el sistema.

La APK compilada con firma de depuración es apta para pruebas, no para Play Store.

## Limitaciones y seguridad
- El generador y el acceso a video requieren clave y cuota/saldo del proveedor. No prometemos generaciones gratuitas ilimitadas.
- Modo texto: llamada GET al endpoint `/video/{prompt}`.
- Modo imagen: chat multimodal con imagen data URI. La compatibilidad depende del modelo y formato de respuesta. No probado en una cuenta activa; si un motor no soporta esta ruta, devolverá error explicativo.
- No se almacena la clave; nunca se incluye en GitHub, ni en la APK.
- El archivo generado puede descargarse desde la aplicación. Algunas URLs de terceros podrían impedir la descarga por CORS.
- Para producción conviene crear un backend con autenticación propia, colas, límites de uso y política de retención.
