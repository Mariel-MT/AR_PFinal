# CCU BUAP WebAR

Prototipo académico de catálogo digital y escáner WebAR con MindAR.js + A-Frame.

## Estado inicial

- Página principal y catálogo: listos como prototipo.
- Escáner: configurado con la tarjeta de demostración oficial de MindAR.
- Ficha técnica: se carga desde `data/obras.json`.
- Obras reales del CCU BUAP: pendientes de investigación, fotografía y autorización.
- Archivo `targets/obras.mind`: se generará cuando estén listas las imágenes de las obras.

## Prueba

La cámara requiere HTTPS o localhost. Para probar rápidamente, publica el repositorio con GitHub Pages o utiliza un servidor local.

En GitHub:
1. Abre Settings > Pages.
2. En Build and deployment, selecciona Deploy from a branch.
3. Selecciona `main` y `/(root)`.
4. Guarda y espera a que se publique.

## Target de demostración

El escáner utiliza temporalmente el target de ejemplo de MindAR:
https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind

Para probarlo, abre la imagen de ejemplo:
https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png

Apunta la cámara de otro dispositivo a esa imagen o muéstrala en una pantalla distinta.

## Cuando se integren las obras del CCU

1. Preparar las imágenes de referencia.
2. Compilarlas en MindAR Image Targets Compiler.
3. Descargar el archivo `.mind` y guardarlo como `targets/obras.mind`.
4. Cambiar `imageTargetSrc` en `escaner.html` a `./targets/obras.mind`.
5. Agregar una entidad `<a-entity mindar-image-target="targetIndex: N">` por cada target.
6. Añadir cada ficha correspondiente a `data/obras.json`, con `targetIndex` coincidente.

## Aviso

No publicar datos personales ni información de obras sin verificar. Solicitar autorización para fotografías y reproducción cuando corresponda.

## Actualización: identidad de aventura

Se incorporó la primera capa visual de **Los guardianes del arte**:
- Inicio renovado con la narrativa de la Esencia Creativa.
- Nueva página `aventura.html` con la estructura conceptual de cinco fragmentos.
- Nueva hoja `css/aventura.css`.
- Se conservaron el catálogo, los datos JSON y el escáner MindAR originales.

## Importante sobre el estado del prototipo

Los cinco fragmentos de `aventura.html` son espacios conceptuales, no misiones activas ni obras confirmadas. El escáner sigue utilizando la tarjeta de demostración oficial de MindAR. Para activar la búsqueda real hacen falta seleccionar y documentar las cinco obras, preparar imágenes de referencia autorizadas, generar el archivo `.mind` y asociar cada índice con su ficha y acertijo.
