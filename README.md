# LIT — «No es cansancio, es deshidratación» (landing v2)

Nueva versión de la landing de producto de **LIT Daily Hydration** (`litsalt.com/pages/no-es-cansancio-es-deshidratacion`).

**Objetivo nº 1: vender.** Misma identidad (logo, Clash Display + Barlow, navy / crema / lima), más premium y con movimiento orquestado.

- Prototipo: https://jjurado2026.github.io/lit-no-es-cansancio/
- Paquete para Shopify: https://jjurado2026.github.io/lit-no-es-cansancio/shopify/ ([README](prototype/shopify/README.md) · [zip](https://jjurado2026.github.io/lit-no-es-cansancio/lit-landing-shopify.zip))

## Dirección: «Película»
- **Fotograma de apertura.** El vídeo ocupa todo el hero y el titular va encima, sobre un degradado: «NO ES ~~CANSANCIO~~. ES DESHIDRATACIÓN.». El peso de la letra lleva el mensaje: fino y tachado en lima = apagado; grueso = LIT.
- **El sobre como protagonista.** En «Hidratarse no es solo beber agua» el sobre real queda fijado mientras haces scroll: entran sodio, potasio y magnesio, y el sobre gira y enseña su reverso. En móvil se gira con un botón.
- **Elige tu sabor.** Tres botones con el sobre de cada sabor cambian fondo, palabra gigante y producto con un clic.
- **Fondos con recorrido**: fotos translúcidas en los capítulos oscuros y el logo «lit» como marca de agua en los claros.

## Decisiones de conversión
- Titular, prueba social y botón en el primer pantallazo del móvil.
- Barra fija de compra desde que sale el hero; se oculta en la caja de compra y en el cierre.
- Prueba (minerales, beneficios, estudio, sabores) **antes** de la oferta; objeciones (comparativa, momentos, modo de uso, prensa, reseñas, FAQ) **después**.
- Caja de compra con la estructura de la versión B (suscripción 1 caja · suscripción 3+1 gratis · compra única), entera sin scroll en 1440×900, 1366×657 y 390×844.
- El botón envía la variante y el plan de suscripción reales a `/cart/add` y lleva al checkout.

## Stack
HTML, CSS y JS sin build. GSAP 3.15 + ScrollTrigger autoalojados. Clash Display y Barlow autoalojadas. Imágenes en WebP.

Todo cuelga de `<div class="lp2" id="lp2">` con clases `lp2-*`, atributos `data-lp2-*` y variables CSS en `.lp2`, para que la misma landing funcione dentro del tema de Shopify sin chocar con él. Los datos de producto (variantes, precios, galería) van en el bloque JSON `#lp2-data`.

## Estructura
```
prototype/                 Prototipo navegable (se publica en gh-pages con git subtree)
  index.html
  assets/css/landing.css · assets/js/landing.js · assets/js/vendor/
  assets/img/ · assets/video/ · assets/fonts/
  shopify/                 Paquete para el tema (generado: no editar a mano)
  lit-landing-shopify.zip
tools/
  build_shopify.py         Genera prototype/shopify/ y el zip a partir del prototipo
  SHOPIFY_README.md        Instrucciones que acompañan al paquete
```

## Flujo
1. Cambiar el prototipo (`prototype/`).
2. `python tools/build_shopify.py` → regenera el paquete de Shopify y el zip.
3. Commit, push y `git subtree push --prefix prototype origin gh-pages`.

## Ver en local
```bash
cd prototype && python -m http.server 8000
```
Parámetro `?ss`: estado final sin animaciones ni vídeo (para capturas).
