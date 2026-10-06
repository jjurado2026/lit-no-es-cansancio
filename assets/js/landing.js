/* LIT · landing v2 — interacción y movimiento.
   Solo se animan transform y opacity. Sin GSAP o con movimiento reducido,
   todo queda visible y funcional. */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SS = /[?&]ss\b/.test(location.search); // modo captura: estado final, sin vídeo
  const isMobile = () => matchMedia('(max-width: 767px)').matches;

  /* ------------------------------------------------------------------
     Catálogo real (litsalt.com, 5-oct-2026)
     ------------------------------------------------------------------ */
  const IMG = 'assets/img/';
  const SHARED = {
    quemehace: ['g-lemon-2-quemehace', 'Hidratación superior: chico bebiendo LIT al sol'],
    funciona: ['g-lemon-4-funciona', 'Resultados del estudio a los 7 y a los 30 días'],
    encaja: ['g-lemon-7-encaja', 'Tu día no para, tu tampoco: LIT en la pista de tenis'],
  };
  const FLAVORS = {
    lemon: {
      name: 'Salty Lemon', short: 'Lemon', color: 'var(--lemon)', aroma: 'limón',
      sub: '63887092154717', ot: '64634112213341', sachet: IMG + 'sobre-lemon.webp',
      gallery: [
        ['g-lemon-0-comp', 'Caja y sobre de LIT Salty Lemon'],
        SHARED.quemehace,
        ['g-lemon-3-formula', 'La fórmula, sin rodeos: sodio, potasio y magnesio'],
        SHARED.funciona,
        ['g-lemon-5-caja', 'Caja abierta con 30 sobres de Salty Lemon'],
        ['g-lemon-6-quelleva', 'Información nutricional e ingredientes de Salty Lemon'],
        SHARED.encaja,
      ],
    },
    watermelon: {
      name: 'Salty Watermelon', short: 'Watermelon', color: 'var(--watermelon)', aroma: 'sandía',
      sub: '65046727459165', ot: '65046758818141', sachet: IMG + 'sobre-watermelon.webp',
      gallery: [
        ['g-watermelon-0-comp', 'Caja y sobre de LIT Salty Watermelon'],
        ['g-wm-2-quemehace', 'Hidratación superior: chico bebiendo LIT al sol'],
        ['g-wm-3-formula', 'La fórmula, sin rodeos: sodio, potasio y magnesio'],
        ['g-wm-4-funciona', 'Resultados del estudio a los 7 y a los 30 días'],
        ['g-wm-5-caja', 'Caja abierta con 30 sobres de Salty Watermelon'],
        ['g-wm-6-quelleva', 'Información nutricional e ingredientes de Salty Watermelon'],
        ['g-wm-7-encaja', 'Tu día no para, tu tampoco'],
      ],
    },
    peach: {
      name: 'Salty Peach', short: 'Peach', color: 'var(--peach)', aroma: 'melocotón',
      sub: '65046790537565', ot: '65046823600477', sachet: IMG + 'sobre-peach.webp',
      gallery: [
        ['g-peach-0-comp', 'Caja y sobre de LIT Salty Peach'],
        ['g-peach-2-quemehace', 'Hidratación superior: chico bebiendo LIT al sol'],
        ['g-peach-3-formula', 'La fórmula, sin rodeos: sodio, potasio y magnesio'],
        ['g-peach-4-funciona', 'Resultados del estudio a los 7 y a los 30 días'],
        ['g-peach-5-caja', 'Caja abierta con 30 sobres de Salty Peach'],
        ['g-peach-6-quelleva', 'Información nutricional e ingredientes de Salty Peach'],
        ['g-peach-7-encaja', 'Tu día no para, tu tampoco'],
      ],
    },
  };
  const ORDER = ['lemon', 'watermelon', 'peach'];
  // Variante del pack según el recuento limón-sandía-melocotón
  const PACK = {
    sub: { '4-0-0': '65636234625373', '3-1-0': '65636234658141', '2-2-0': '65636234690909', '1-3-0': '65636234723677', '0-4-0': '65636234756445', '3-0-1': '65753050612061', '2-1-1': '65753050677597', '2-0-2': '65753050743133', '1-2-1': '65753050775901', '1-1-2': '65753051136349', '1-0-3': '65753051431261', '0-3-1': '65753051627869', '0-2-2': '65753051660637', '0-1-3': '65753051726173', '0-0-4': '65753051791709' },
    ot: { '4-0-0': '65636236788061', '3-1-0': '65636236820829', '2-2-0': '65636236853597', '1-3-0': '65636236886365', '0-4-0': '65636236919133', '3-0-1': '65753051824477', '2-1-1': '65753051857245', '2-0-2': '65753051890013', '1-2-1': '65753051922781', '1-1-2': '65753051955549', '1-0-3': '65753053299037', '0-3-1': '65753053364573', '0-2-2': '65753053528413', '0-1-3': '65753053561181', '0-0-4': '65753053593949' },
  };
  // Céntimos
  const PRICES = {
    1: { sub: { now: 2835, was: 3780 }, ot: { now: 3780 } },
    4: { sub: { now: 8505, was: 15120 }, ot: { now: 11340 } },
  };
  const UNITS = { 1: 30, 4: 120 };
  const DEFAULT_PLAN = { 1: '691259867485', 4: '691260031325' }; // 45 días · 6 meses (config actual)
  const MAX_QTY = 10;
  const SLOT_NAMES = ['Caja 1', 'Caja 2', 'Caja 3', 'Caja regalo'];
  const TXT = {
    note1: 'Cada caja incluye 30 sobres de 3,5 g. LIT Daily Hydration es una mezcla esencial de electrolitos que ayuda a combatir la fatiga, mejorar la concentración y mantener una hidratación constante a lo largo del día.',
    note4: 'El pack incluye 4 cajas de 30 sobres de 3,5 g: 120 sobres en total. Pagas 3 cajas y la cuarta es tu caja regalo.',
    det1: '30 sobres de 3,5 g por caja. Sin azúcar ni edulcorantes artificiales. Hecho en España.',
    det4: '4 cajas de 30 sobres de 3,5 g: 120 sobres en total. Eliges el sabor de cada caja. Sin azúcar ni edulcorantes artificiales. Hecho en España.',
    ingr: (aroma) => `Acidulante (ácido cítrico), cloruro de sodio, malato de magnesio, cloruro de potasio, aroma de ${aroma}, edulcorante (glucósidos de esteviol procedentes de estevia).`,
  };

  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const fmt = (c) => money.format(c / 100);
  const perSachet = (c, units) => fmt(Math.round(c / units));

  /* ------------------------------------------------------------------
     Odómetro: cada dígito es una columna 0-9 que se desplaza en Y
     ------------------------------------------------------------------ */
  function odometer(el) {
    let sig = null;
    const isDigit = (ch) => ch >= '0' && ch <= '9';
    function build(str) {
      el.textContent = '';
      for (const ch of str) {
        if (isDigit(ch)) {
          const col = d.createElement('span');
          col.className = 'odo__col';
          const strip = d.createElement('span');
          strip.className = 'odo__strip';
          for (let i = 0; i < 10; i++) {
            const n = d.createElement('span');
            n.textContent = i;
            strip.appendChild(n);
          }
          col.appendChild(strip);
          el.appendChild(col);
        } else {
          const c = d.createElement('span');
          c.className = 'odo__ch';
          c.textContent = ch === ' ' ? ' ' : ch;
          el.appendChild(c);
        }
      }
    }
    return {
      set(str, animate = true) {
        const s = [...str].map((ch) => (isDigit(ch) ? 'd' : ch)).join('');
        const rebuilt = s !== sig;
        if (rebuilt) { build(str); sig = s; }
        const strips = el.querySelectorAll('.odo__strip');
        let i = 0;
        for (const ch of str) {
          if (!isDigit(ch)) continue;
          const st = strips[i++];
          if (!animate || RM) { st.style.transition = 'none'; st.style.transform = `translateY(${-Number(ch) * 1.2}em)`; void st.offsetHeight; st.style.transition = ''; continue; }
          if (rebuilt) { st.style.transition = 'none'; st.style.transform = 'translateY(0)'; void st.offsetHeight; st.style.transition = ''; }
          st.style.transform = `translateY(${-Number(ch) * 1.2}em)`;
        }
      },
    };
  }

  /* ------------------------------------------------------------------
     Caja de compra
     ------------------------------------------------------------------ */
  function initBuy() {
    const cfg = $('.cfg');
    if (!cfg) return;
    // Tres ofertas como en la versión B: suscripción 1 caja, suscripción 3+1, compra única
    const OFFERS = {
      sub1: { pack: 1, plan: 'sub' },
      sub4: { pack: 4, plan: 'sub' },
      ot1: { pack: 1, plan: 'ot' },
    };
    const state = { flavor: 'lemon', offer: 'sub1', qty: 1, slots: ['lemon', 'lemon', 'lemon', 'lemon'], gi: 0 };

    const form = $('[data-cart]');
    const fId = form.elements.id;
    const fQty = form.elements.quantity;
    const fPlan = form.elements.selling_plan;
    const odo = odometer($('[data-odo]'));
    const totalSr = $('[data-total-sr]');
    const qtyOut = $('[data-qty-out]');
    const mix = $('[data-mix]');
    const mixSlots = $('#mix-slots');
    const mixToggle = $('[data-mix-toggle]');
    const mixSummary = $('[data-mix-summary]');
    const mixBoxes = $$('[data-mix-boxes] i');
    const stickThumb = $('[data-stick-thumb]');
    const cfgThumb = $('[data-cfg-thumb]');
    const freqs = { sub1: $('[data-freq="sub1"]'), sub4: $('[data-freq="sub4"]') };
    let firstRender = true;

    // Ranuras del pack (4 cajas)
    SLOT_NAMES.forEach((label, si) => {
      const fs = d.createElement('fieldset');
      fs.className = 'slot';
      fs.innerHTML = `<legend>${label}</legend><div class="slot__opts">${ORDER.map((k) => `
        <label class="opt" style="--fc:${FLAVORS[k].color}">
          <input type="radio" name="slot${si}" value="${k}"${k === 'lemon' ? ' checked' : ''}>
          <span class="opt__box"><i></i>${FLAVORS[k].short}</span>
        </label>`).join('')}</div>`;
      mixSlots.appendChild(fs);
    });

    const offer = () => OFFERS[state.offer];
    const variant = () => {
      const o = offer();
      if (o.pack === 1) return FLAVORS[state.flavor][o.plan];
      const c = { lemon: 0, watermelon: 0, peach: 0 };
      state.slots.forEach((s) => c[s]++);
      return PACK[o.plan][`${c.lemon}-${c.watermelon}-${c.peach}`];
    };

    function render() {
      const f = FLAVORS[state.flavor];
      const o = offer();
      $$('[data-flavor-name]').forEach((el) => { el.textContent = f.name; });
      $('[data-gal-badge]').style.setProperty('--flavor', f.color);
      $$('[data-offer]').forEach((el) => el.classList.toggle('is-on', el.dataset.offer === state.offer));

      // Pack 3+1: mezcla de sabores
      mix.hidden = o.pack !== 4;
      const counts = {};
      state.slots.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
      const keys = Object.keys(counts);
      mixSummary.textContent = keys.length === 1
        ? `Las 4 cajas en ${FLAVORS[keys[0]].name}`
        : ORDER.filter((k) => counts[k]).map((k) => `${counts[k]} ${FLAVORS[k].name}`).join(' · ');
      mixBoxes.forEach((b, i) => b.style.setProperty('--c', FLAVORS[state.slots[i]].color));
      state.slots.forEach((s, i) => { const r = $(`input[name="slot${i}"][value="${s}"]`); if (r) r.checked = true; });

      // Textos que cambian con el pack o el sabor
      $('[data-box-note]').textContent = o.pack === 1 ? TXT.note1 : TXT.note4;
      $('[data-acc-details]').textContent = o.pack === 1 ? TXT.det1 : TXT.det4;
      const ingr = $('[data-acc-ingr]');
      if (o.pack === 1) ingr.textContent = TXT.ingr(f.aroma);
      else ingr.innerHTML = ORDER.map((k) => `<p><strong>${FLAVORS[k].name}:</strong> ${TXT.ingr(FLAVORS[k].aroma)}</p>`).join('');

      // Total y formulario
      const total = PRICES[o.pack][o.plan].now * state.qty;
      odo.set(fmt(total), !firstRender);
      firstRender = false;
      totalSr.textContent = fmt(total);
      qtyOut.textContent = state.qty;
      $('[data-qty="-1"]').disabled = state.qty <= 1;
      $('[data-qty="1"]').disabled = state.qty >= MAX_QTY;
      fId.value = variant();
      fQty.value = state.qty;
      fPlan.disabled = o.plan !== 'sub';
      if (o.plan === 'sub') fPlan.value = freqs[state.offer].value;
      if (stickThumb) stickThumb.src = f.sachet;
      if (cfgThumb) cfgThumb.src = `${IMG}g-${state.flavor}-0-comp-t.webp`;
    }

    const setFlavor = (value, withFlip = true) => {
      state.flavor = value;
      state.slots = [value, value, value, value];
      const r = $(`input[name="flavor"][value="${value}"]`);
      if (r) r.checked = true;
      render();
      gallery.reset(withFlip);
    };

    // Eventos
    $$('input[name="flavor"]').forEach((r) => r.addEventListener('change', () => setFlavor(r.value)));
    $$('input[name="offer"]').forEach((r) => r.addEventListener('change', () => { state.offer = r.value; render(); }));
    Object.entries(freqs).forEach(([key, sel]) => {
      const pickOffer = () => {
        if (state.offer === key) return;
        const r = $(`input[name="offer"][value="${key}"]`);
        r.checked = true;
        state.offer = key;
        render();
      };
      sel.addEventListener('focus', pickOffer);
      sel.addEventListener('change', () => { pickOffer(); render(); });
    });
    mixSlots.addEventListener('change', (e) => {
      const m = e.target.name && e.target.name.match(/^slot(\d)$/);
      if (!m) return;
      state.slots[Number(m[1])] = e.target.value;
      render();
    });
    mixToggle.addEventListener('click', () => {
      const open = mixSlots.hidden;
      mixSlots.hidden = !open;
      mixToggle.setAttribute('aria-expanded', String(open));
      mixToggle.textContent = open ? 'Listo' : 'Mezclar sabores';
    });
    $$('[data-qty]').forEach((b) => b.addEventListener('click', () => {
      state.qty = Math.min(MAX_QTY, Math.max(1, state.qty + Number(b.dataset.qty)));
      render();
    }));
    form.addEventListener('submit', () => { render(); });

    // Galería
    const gallery = (() => {
      const stage = $('.gal__stage');
      const flip = $('[data-gal-flip]');
      const img = $('[data-gal-img]');
      const thumbs = $('[data-gal-thumbs]');
      const count = $('[data-gal-count]');
      const list = () => FLAVORS[state.flavor].gallery;

      function drawThumbs() {
        thumbs.innerHTML = list().map(([file, alt], i) => `<button class="gal__thumb" type="button" aria-label="Ver imagen ${i + 1}: ${alt}" aria-current="${i === state.gi}" data-i="${i}"><img src="${IMG}${file}-t.webp" alt="" width="260" height="325" loading="lazy"></button>`).join('');
      }
      function load(file) {
        const pre = new Image();
        pre.src = `${IMG}${file}.webp`;
        return (pre.decode ? pre.decode() : Promise.resolve()).catch(() => {}).then(() => pre.src);
      }
      function show(i, mode) {
        const L = list();
        state.gi = (i + L.length) % L.length;
        const [file, alt] = L[state.gi];
        $$('.gal__thumb', thumbs).forEach((t, k) => t.setAttribute('aria-current', String(k === state.gi)));
        if (count) count.textContent = `${state.gi + 1} / ${L.length}`;
        const swap = (src) => { img.src = src; img.alt = alt; };
        if (RM || !flip.animate) { load(file).then(swap); return; }
        if (mode === 'flip') {
          const out = flip.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 230, easing: 'cubic-bezier(.55,0,.8,.3)', fill: 'forwards' });
          Promise.all([load(file), out.finished]).then(([src]) => {
            swap(src);
            flip.animate([{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }], { duration: 640, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });
          });
        } else if (mode) {
          const dir = mode === 'prev' ? -1 : 1;
          const out = img.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-dir * 24}px)` }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
          Promise.all([load(file), out.finished]).then(([src]) => {
            swap(src);
            img.animate([{ opacity: 0, transform: `translateX(${dir * 24}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
          });
        } else {
          load(file).then(swap);
        }
      }
      thumbs.addEventListener('click', (e) => {
        const b = e.target.closest('.gal__thumb');
        if (b) show(Number(b.dataset.i), Number(b.dataset.i) < state.gi ? 'prev' : 'next');
      });
      $('[data-gal-prev]').addEventListener('click', () => show(state.gi - 1, 'prev'));
      $('[data-gal-next]').addEventListener('click', () => show(state.gi + 1, 'next'));
      let x0 = null;
      stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
      stage.addEventListener('pointerup', (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 40) show(state.gi + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
      });
      drawThumbs();
      return {
        reset(withFlip) { state.gi = 0; drawThumbs(); show(0, withFlip ? 'flip' : null); },
      };
    })();

    // Precarga ligera de las fotos principales de los otros sabores
    const warm = () => ORDER.forEach((k) => { const i = new Image(); i.src = `${IMG}${FLAVORS[k].gallery[0][0]}.webp`; });
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 2500);

    // El bloque «Elige tu sabor» elige el sabor aquí y baja a la compra
    window.__litPickFlavor = (value) => {
      setFlavor(value, false);
      const target = $('#ficha');
      if (target) target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    };

    render();
  }

  /* ------------------------------------------------------------------
     Elige tu sabor: pestañas y botones de elegir
     ------------------------------------------------------------------ */
  function initFlavPick() {
    $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      if (window.__litPickFlavor) window.__litPickFlavor(b.dataset.pick);
    }));
  }

  /* ------------------------------------------------------------------
     Vídeos: carga diferida, pausa accesible
     ------------------------------------------------------------------ */
  function initHeroVideo() {
    const v = $('.hero__video');
    if (!v || RM || SS) return;
    const start = () => {
      v.src = isMobile() ? v.dataset.srcM : v.dataset.src;
      v.addEventListener('canplay', () => { v.play().then(() => v.classList.add('is-ready')).catch(() => {}); }, { once: true });
      v.load();
    };
    if (d.readyState === 'complete') setTimeout(start, 150); else addEventListener('load', () => setTimeout(start, 150), { once: true });
  }

  function initToggles() {
    $$('[data-toggle-video]').forEach((btn) => {
      const v = $(btn.dataset.toggleVideo);
      if (!v) return;
      if (RM || SS) { btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Reproducir vídeo'); }
      btn.addEventListener('click', () => {
        const paused = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(paused));
        btn.setAttribute('aria-label', paused ? 'Reproducir vídeo' : 'Pausar vídeo');
        v.dataset.userPaused = paused ? '1' : '';
        if (paused) v.pause();
        else {
          if (!v.src && (v.dataset.src || v.dataset.srcM)) { v.src = isMobile() && v.dataset.srcM ? v.dataset.srcM : v.dataset.src; }
          v.play().then(() => v.classList.add('is-ready')).catch(() => {});
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Cómo tomarlo: pasos sincronizados con el vídeo
     ------------------------------------------------------------------ */
  function initHow() {
    const v = $('[data-how-video]');
    const steps = $$('[data-step]');
    if (!v || !steps.length) return;
    const SEG = [[0, 6.6], [6.6, 8.2], [8.2, 11.8], [11.8, 14.84]];
    const SEEK = [4.3, 6.6, 8.2, 11.8];
    const bars = steps.map((s) => $('.step__prog', s));
    let raf = 0;
    let active = 0;
    let loaded = false;

    const ensure = () => { if (!loaded) { v.src = v.dataset.src; loaded = true; } };
    function paint() {
      const t = v.currentTime;
      let idx = SEG.findIndex(([a, b]) => t >= a && t < b);
      if (idx < 0) idx = 3;
      if (idx !== active) { steps[active].classList.remove('is-active'); steps[idx].classList.add('is-active'); active = idx; }
      const [a, b] = SEG[idx];
      bars[idx].style.transform = `scaleX(${Math.min(1, Math.max(0, (t - a) / (b - a)))})`;
      bars.forEach((bar, i) => { if (i !== idx) bar.style.transform = 'scaleX(0)'; });
      if (!v.paused) raf = requestAnimationFrame(paint);
    }
    v.addEventListener('play', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); v.previousElementSibling && (v.previousElementSibling.style.opacity = '0'); });
    v.addEventListener('pause', () => cancelAnimationFrame(raf));
    v.addEventListener('seeked', paint);

    steps.forEach((s, i) => s.addEventListener('click', () => {
      ensure();
      const go = () => { v.currentTime = SEEK[i]; v.play().catch(() => {}); };
      if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
      const btn = $('[data-toggle-video="[data-how-video]"]');
      if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Pausar vídeo'); v.dataset.userPaused = ''; }
    }));

    if (RM || SS) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { ensure(); if (!v.dataset.userPaused) v.play().catch(() => {}); }
      else v.pause();
    }, { threshold: 0.45 });
    io.observe(v);
  }

  /* ------------------------------------------------------------------
     Rodillo «Para los que…»
     ------------------------------------------------------------------ */
  function initRotor() {
    const list = $('[data-rotor]');
    if (!list || RM || SS) return;
    const n = list.children.length - 1;
    let i = 0;
    let timer = 0;
    const step = () => {
      i += 1;
      list.style.transition = 'transform .75s cubic-bezier(.34,1.56,.64,1)';
      list.style.transform = `translateY(${-i * 1.15}em)`;
      if (i === n) setTimeout(() => { list.style.transition = 'none'; list.style.transform = 'translateY(0)'; i = 0; }, 800);
    };
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = setInterval(step, 1900);
    }).observe(list);
  }

  /* ------------------------------------------------------------------
     Sobre: girar en móvil / sin movimiento
     ------------------------------------------------------------------ */
  function initFlip() {
    const btn = $('[data-flip]');
    const mech = $('.mech');
    const inner = $('[data-sachet]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const on = !mech.classList.contains('is-flipped');
      mech.classList.toggle('is-flipped', on);
      btn.setAttribute('aria-pressed', String(on));
      $('span', btn).textContent = on ? 'Ver el frontal' : 'Ver el reverso';
      const to = on ? 'rotateY(180deg) rotateZ(3deg)' : 'rotateY(-16deg) rotateZ(-5deg)';
      if (RM || !inner.animate) { inner.style.transform = to; return; }
      const from = getComputedStyle(inner).transform;
      inner.animate([{ transform: from === 'none' ? 'rotateY(0deg)' : from }, { transform: to }], { duration: 900, easing: 'cubic-bezier(.34,1.3,.64,1)', fill: 'forwards' });
    });
  }

  /* ------------------------------------------------------------------
     Barra fija de compra
     ------------------------------------------------------------------ */
  function initStick() {
    const stick = $('[data-stick]');
    const heroBuy = $('.hero__buy');
    const buy = $('#ficha .buy__grid');
    const end = $('.end');
    if (!stick || !heroBuy) return;
    const link = $('a', stick);
    const seen = { hero: true, buy: false, end: false };
    const sync = () => {
      const heroGone = !seen.hero && heroBuy.getBoundingClientRect().top < 0;
      const on = heroGone && !seen.buy && !seen.end;
      stick.classList.toggle('is-on', on);
      stick.setAttribute('aria-hidden', String(!on));
      link.tabIndex = on ? 0 : -1;
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === heroBuy) seen.hero = e.isIntersecting;
        else if (e.target === buy) seen.buy = e.isIntersecting;
        else if (e.target === end) seen.end = e.isIntersecting;
      });
      sync();
    }, { threshold: 0 });
    [heroBuy, buy, end].forEach((el) => el && io.observe(el));
  }

  /* ------------------------------------------------------------------
     Elige tu sabor: se cambia con un clic (o con las flechas), no con el scroll
     ------------------------------------------------------------------ */
  function initFlav() {
    const tabs = $$('[data-flav-tab]');
    const items = $$('.flav__item');
    const bgs = $$('.flav__bg');
    const words = $$('.flav__word');
    if (!tabs.length || items.length < 3) return;
    let active = 0;
    let z = 2;
    const running = new Set();
    const desk = () => matchMedia('(min-width: 1024px)').matches;
    // Cada animación se limpia una sola vez: al terminar o cuando se cambia de sabor antes de tiempo
    const anim = (el, frames, opts, done) => {
      const a = el.animate(frames, opts);
      const cleanup = () => {
        if (!running.has(a)) return;
        running.delete(a);
        if (done) done();
        a.cancel();
      };
      a.onfinish = cleanup;
      a.cleanup = cleanup;
      running.add(a);
      return a;
    };

    function go(i) {
      if (i === active) return;
      [...running].forEach((a) => a.cleanup());
      const prev = active;
      active = i;
      tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
      const settle = () => [items, bgs, words].forEach((list) => list.forEach((el, k) => el.classList.toggle('is-active', k === active)));
      if (RM || !desk() || !items[i].animate) { settle(); return; }

      // Fondo: el color nuevo entra por encima del anterior
      z += 1;
      bgs[i].style.zIndex = z;
      bgs[i].classList.add('is-active');
      anim(bgs[i], [{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-out' }, () => {
        bgs.forEach((b, k) => { if (k !== active) b.classList.remove('is-active'); });
      });

      // Palabra gigante de fondo
      words[i].classList.add('is-active');
      anim(words[prev], [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-5%)' }], { duration: 340, easing: 'ease-in', fill: 'forwards' }, () => {
        if (prev !== active) words[prev].classList.remove('is-active');
      });
      anim(words[i], [{ opacity: 0, transform: 'translateX(5%)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 700, delay: 120, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });

      // Producto, nombre y botón
      items[i].classList.add('is-active');
      anim(items[prev], [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-56px)' }], { duration: 280, easing: 'cubic-bezier(.55,0,.8,.3)', fill: 'forwards' }, () => {
        if (prev !== active) items[prev].classList.remove('is-active');
      });
      anim(items[i], [{ opacity: 0, transform: 'translateX(56px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 720, delay: 250, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      anim($('.flav__sachet', items[i]), [{ transform: 'rotate(20deg) translateY(8%)' }, { transform: 'rotate(-8deg) translateY(0)' }], { duration: 900, delay: 280, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
    }

    tabs.forEach((t, k) => {
      t.addEventListener('click', () => go(k));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = (k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus();
        go(n);
      });
    });
  }

  /* ------------------------------------------------------------------
     Movimiento (GSAP + ScrollTrigger)
     ------------------------------------------------------------------ */
  function initMotion() {
    if (root.classList.contains('no-anim') || !window.gsap || !window.ScrollTrigger) {
      root.classList.add('no-anim');
      return;
    }
    window.__litAnim = true;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Apertura del hero: entra «no es cansancio», se tacha, entra «es deshidratación»
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .to('.hero__logo', { opacity: 1, duration: 1 }, 0)
      .to('.hero__line--off .hero__line-in', { y: 0, duration: 1.2 }, 0.1)
      .to('.hero__strike', { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, 0.8)
      .fromTo('.hero__struck-word', { opacity: 1 }, { opacity: 0.42, duration: 0.7, ease: 'power2.out' }, 1.05)
      .to('.hero__line--on .hero__line-in', { y: 0, duration: 1.2 }, 1.0)
      .fromTo('.hero__row > *', { y: 18 }, { y: 0, opacity: 1, duration: 1, stagger: 0.07 }, 1.25);

    gsap.to('[data-hero-frame]', { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Titulares: líneas que suben desde su máscara
    $$('.h2').forEach((h) => {
      if (h.closest('.hero') || h.closest('.mech__back')) return;
      const lines = $$('.ln__in', h);
      if (!lines.length) return;
      gsap.from(lines, { yPercent: 135, duration: 1.15, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
    });
    $$('.stat__hero .ln__in, .news__quote .ln__in').forEach((el, i) => {
      gsap.from(el, { yPercent: 135, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: el.closest('.stat, .news__quote'), start: 'top 82%', once: true } });
    });

    // Bloques que suben en tanda
    gsap.set('[data-rise]', { y: 40, opacity: 0 });
    ScrollTrigger.batch('[data-rise]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    });

    // Parallax de fotos
    $$('[data-parallax]').forEach((img) => {
      const amt = Number(img.dataset.parallax) || 7;
      gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    const mm = gsap.matchMedia();

    // Escena del sobre — escritorio: fijada y ligada al scroll
    mm.add('(min-width: 1024px)', () => {
      gsap.set('.mineral', { opacity: 0, y: 30 });
      gsap.set('.mineral__bar', { scaleX: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.mech', start: 'top top', end: '+=150%', pin: '.mech__pin', scrub: 0.9, anticipatePin: 1 } });
      tl.fromTo('[data-sachet]', { rotateY: -38, rotateZ: -11, y: 80, scale: 0.88 }, { rotateY: -12, rotateZ: -5, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0)
        .fromTo('.mech__glow', { scale: 0.7, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .to('.mineral', { opacity: 1, y: 0, duration: 0.6, stagger: 0.36, ease: 'power2.out' }, 0.3)
        .to('.mineral__bar', { scaleX: 1, duration: 0.5, stagger: 0.36, ease: 'power2.out' }, 0.45)
        .to('[data-sachet]', { rotateY: 0, rotateZ: -2, duration: 0.8, ease: 'power1.inOut' }, 1.0)
        .to('[data-sachet]', { rotateY: 180, rotateZ: 3, duration: 1.3, ease: 'power2.inOut' }, 2.0)
        .to('.mech__front', { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 2.1)
        .fromTo('.mech__back', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 2.65)
        .to({}, { duration: 0.5 });
    });

    // Escena del sobre — móvil y tableta: sin fijar, con un balanceo ligado al scroll
    mm.add('(max-width: 1023px)', () => {
      gsap.fromTo('.sachet', { rotateZ: -8, y: 30 }, { rotateZ: 5, y: -20, ease: 'none', scrollTrigger: { trigger: '.mech__stage', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.set('.mineral', { opacity: 0, y: 30 });
      ScrollTrigger.batch('.mineral', { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }) });
    });

    // Banda cinética: las dos filas se cruzan con el scroll
    $$('[data-kine]').forEach((row) => {
      const toLeft = Number(row.dataset.kine) < 0;
      gsap.fromTo(row, { xPercent: toLeft ? 0 : -24 }, { xPercent: toLeft ? -24 : 0, ease: 'none', scrollTrigger: { trigger: '.kine', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    // Datos: barras, segmentos y la mancuerna de fatiga
    const dataTl = gsap.timeline({ scrollTrigger: { trigger: '.data__grid', start: 'top 75%', once: true }, defaults: { ease: 'expo.out' } });
    dataTl
      .from('.dumb__link', { scaleX: 0, duration: 1.3 }, 0.2)
      .from('[data-end], [data-end-label]', { x: () => $('.dumb__plot').clientWidth * 0.572, duration: 1.3 }, 0.2)
      .from('.bar__fill', { scaleX: 0, duration: 1.2, stagger: 0.12 }, 0.35)
      .from('.stack__seg', { scaleX: 0, duration: 1, stagger: 0.14 }, 0.35)
      .from('.units__row img', { yPercent: 40, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.5);

    // Comparativa
    gsap.from('.vs__hl', { scaleY: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.vs__table', start: 'top 80%', once: true } });
    gsap.from('.vs__table tbody tr', { opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: '.vs__table', start: 'top 80%', once: true } });

    // Recortes de prensa
    gsap.from('[data-clip]', { y: 70, opacity: 0, rotate: (i) => (i ? 7 : -7), duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.news__clips', start: 'top 85%', once: true } });

    // Cierre
    gsap.fromTo('[data-end-bg]', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.end', start: 'top bottom', end: 'bottom top', scrub: true } });

    const refresh = () => ScrollTrigger.refresh();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
    addEventListener('load', refresh, { once: true });
  }

  initBuy();
  initFlavPick();
  initFlav();
  initToggles();
  initHeroVideo();
  initHow();
  initRotor();
  initFlip();
  initStick();
  initMotion();
})();
