# LIT — «No es cansancio, es deshidratación» (landing v2)

Nueva versión de la landing de producto de **LIT Daily Hydration** (`litsalt.com/pages/no-es-cansancio-es-deshidratacion`).

**Objetivo nº 1: vender.** Misma identidad (logo, Clash Display + Barlow, navy / crema / lima), más premium y con movimiento orquestado.

## Dirección: «Película»
- **Fotograma de apertura.** El vídeo de la piscina queda limpio, sin texto encima, y el titular va debajo como una cartela: «NO ES ~~CANSANCIO~~. ES DESHIDRATACIÓN.» El peso de la letra lleva el mensaje: fino y tachado en lima = apagado; grueso = LIT.
- **El sobre como protagonista.** En la escena «Hidratarse no es solo beber agua» el sobre real queda fijado mientras haces scroll: entran sodio, potasio y magnesio, y el sobre gira y enseña su reverso (ingredientes). En móvil se gira con un botón.
- **Capítulos noche y día**, foto con grano y una sola familia de movimientos: líneas que suben desde su máscara, el tachado, el giro del sobre, barras que crecen y precios con rodillo. Solo `transform` y `opacity`.

## Decisiones de conversión
- Titular, prueba social y botón visibles en el primer pantallazo del móvil (el botón termina a 583 px en 390×844).
- Barra fija de compra desde que sale el hero; se oculta en la caja de compra y en el cierre.
- Orden: prueba (minerales, beneficios, estudio) **antes** de la oferta; objeciones (comparativa, momentos, modo de uso, prensa, reseñas, FAQ) **después**.
- Caja de compra: pack de 4 con sabores **precargados** (antes obligaba a elegir 4), suscripción preseleccionada, ahorro en euros y en €/sobre, precio con rodillo al cambiar de opción.
- **El botón funciona de verdad**: envía la variante y el plan de suscripción correctos a `litsalt.com/cart/add` y lleva al checkout.

## Bloques nuevos (con material real de LIT)
Escena del sobre · «Para los que…» en rodillo · gráfico «9 de cada 10» · ¿Cuándo tomarlo? por momentos del día · ¿Cómo tomarlo? con el vídeo sincronizado con los 4 pasos · cita de El Mundo como eco del titular · enlace al Discovery Set.

## Stack
HTML, CSS y JS sin build. GSAP 3.15 + ScrollTrigger (cdnjs). Clash Display autoalojada; Barlow de Google Fonts. Imágenes en WebP.

## Estructura
```
prototype/          Prototipo navegable (se publica en gh-pages con git subtree)
  index.html
  assets/css/landing.css · assets/js/landing.js
  assets/img/ · assets/video/ · assets/fonts/
```

## Ver en local
```bash
cd prototype && python -m http.server 8000
```
Parámetro `?ss`: estado final sin animaciones ni vídeo (para capturas).
