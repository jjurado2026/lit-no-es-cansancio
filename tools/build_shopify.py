"""Genera el paquete de Shopify (sección + assets + plantilla) a partir del prototipo.

    python tools/build_shopify.py

Entrada:  prototype/index.html · prototype/assets/css/landing.css · prototype/assets/js/landing.js
Salida:   prototype/shopify/  (estructura de tema: sections/, snippets/, templates/, assets/)
          prototype/lit-landing-shopify.zip

El HTML del prototipo lleva marcas en comentarios (<!--lp2:price ...-->, <!--lp2:if ...-->) que
aquí se convierten en Liquid: los precios salen de las variantes reales de la tienda y la barra
promo y el Discovery Set se pueden activar o desactivar desde el editor de temas.
"""
import hashlib, json, re, shutil, sys, zipfile
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # solo se usa para leer anchos reales de las imágenes del prototipo
    Image = None

ROOT = Path(__file__).resolve().parent.parent
PROTO = ROOT / 'prototype'
OUT = PROTO / 'shopify'
ZIP = PROTO / 'lit-landing-shopify.zip'
PAGES = 'https://jjurado2026.github.io/lit-no-es-cansancio/'
CDN = 'https://cdn.shopify.com/s/files/1/0896/3319/4288/files/'

# ------------------------------------------------------------------ archivos nuevos que hay que subir
NEW_ASSETS = {}
for f in ['sobre-front', 'sobre-front-480', 'sobre-back', 'sobre-back-480',
          'sobre-lemon', 'sobre-watermelon', 'sobre-peach',
          'sobre-lemon-h', 'sobre-watermelon-h', 'sobre-peach-h',
          'g-lemon-0-comp', 'g-lemon-0-comp-t', 'g-watermelon-0-comp', 'g-watermelon-0-comp-t', 'g-peach-0-comp', 'g-peach-0-comp-t',
          'caja-lemon', 'caja-lemon-560', 'caja-watermelon', 'caja-watermelon-560', 'caja-peach', 'caja-peach-560']:
    NEW_ASSETS[f'assets/img/{f}.webp'] = f'nw-lp2-{f}.webp'
for f in ['elmundo', 'menshealth', 'marca', 'glamour', 'europapress', 'okdiario', 'sportlife', 'infosalus',
          'corredor', 'trailrun', 'nutrasalud', 'culturaocio']:
    NEW_ASSETS[f'assets/img/press/{f}.webp'] = f'nw-lp2-press-{f}.webp'
for f in ['bottle-iso', 'bottle-elec']:
    NEW_ASSETS[f'assets/img/{f}.svg'] = f'nw-lp2-{f}.svg'
FONTS = {
    'assets/fonts/clash-display-var.woff2': 'nw-lp2-clash.woff2',
    'assets/fonts/barlow-regular.woff2': 'nw-lp2-barlow-400.woff2',
    'assets/fonts/barlow-medium.woff2': 'nw-lp2-barlow-500.woff2',
    'assets/fonts/barlow-semibold.woff2': 'nw-lp2-barlow-600.woff2',
    'assets/fonts/barlow-bold.woff2': 'nw-lp2-barlow-700.woff2',
}
VENDOR = {
    'assets/js/vendor/gsap.min.js': 'nw-lp2-gsap.min.js',
    'assets/js/vendor/ScrollTrigger.min.js': 'nw-lp2-scrolltrigger.min.js',
}

# ------------------------------------------------------------------ material que ya está en Shopify
# Fotos de la carpeta Archivos (Contenido > Archivos): se piden al CDN con el ancho justo
FILES = {
    'b-corredora': '3-2_8.jpg', 'b-preparando': '3-2_6.jpg', 'b-flexiones': 'chico_flexion.png', 'b-grupo': 'DON_2370.jpg',
    'aporta-bg': 'Lit_Superior_Hydration.8.jpg', 'runners-costa': 'nw-home-problema-runners.webp',
    'runners-hierba': 'nw-about-hero-runners_ddaf8ba4-2e5b-4840-8392-b32eb2568135.webp',
    'gafas': 'nw-home-momentos-portrait.webp', 'vaso': 'Lit-64029_1.png', 'm-ciclista': 'nw-home-rutina-0700.webp',
    'm-jornada': 'Kiko.png', 'm-noche': 'DSCF4729_copy_cropped.jpg', 'salto-mar': 'nw-home-reviews-coast.webp',
    'salto-cielo': 'nw-about-ciencia-athlete.webp',
    'art-elmundo': 'nw-pdp-prensa-elmundo_e7739468-38de-47be-9cfd-44e60ac35a0f.webp',
    'art-menshealth': 'nw-pdp-prensa-menshealth_edcf0b82-b233-4dc3-85c5-aa7aff6f6701.webp',
}
# Assets que ya existen en el tema actual (los usa la landing de hoy)
THEME = {
    'assets/img/hero-poster-1600.webp': 'nw-hero-peach-poster.webp',
    'assets/img/hero-poster-800.webp': 'nw-hero-peach-poster.webp',
    'assets/img/hero-poster-m.webp': 'nw-hero-peach-poster-mobile.webp',
    'assets/img/como-poster-1600.webp': 'nw-comotomarlo-poster.webp',
    'assets/img/como-poster-800.webp': 'nw-comotomarlo-poster.webp',
    'assets/video/hero.mp4': 'nw-hero-peach-opt.mp4',
    'assets/video/hero-m.mp4': 'nw-hero-peach-mobile.mp4',
    'assets/video/como.mp4': 'nw-comotomarlo-opt.mp4',
}


def img_width(rel):
    if Image is None:
        return None
    with Image.open(PROTO / rel) as im:
        return im.width


def files_url(rel):
    """assets/img/b-corredora-600.webp -> CDN de Archivos con width=600."""
    name = rel.split('/')[-1].rsplit('.', 1)[0]
    m = re.match(r'^(.*?)(?:-(\d{3,4}))?$', name)
    base = m.group(1)
    if base not in FILES:
        return None
    w = img_width(rel)
    return f'{CDN}{FILES[base]}?width={w}'


def map_url(rel):
    if rel in NEW_ASSETS:
        return "{{ '%s' | asset_url }}" % NEW_ASSETS[rel]
    if rel in THEME:
        return "{{ '%s' | asset_url }}" % THEME[rel]
    u = files_url(rel)
    if u:
        return u
    raise SystemExit(f'Sin destino en Shopify para {rel}')


# ------------------------------------------------------------------ Liquid: datos de producto
LIQUID_HEAD = r"""{%- liquid
  # Productos: se eligen en los ajustes de la sección (la plantilla trae los de hoy)
  assign s = section.settings
  assign p_l = s.p_sub_lemon
  assign p_w = s.p_sub_watermelon
  assign p_p = s.p_sub_peach
  assign o_l = s.p_ot_lemon
  assign o_w = s.p_ot_watermelon
  assign o_p = s.p_ot_peach
  assign k_s = s.p_pack_sub
  assign k_o = s.p_pack_ot
  assign lp2_disc_p = s.p_discovery

  # Suscripción de 1 caja = la variante «30» (30 sobres) de cada producto de sabor
  assign lp2_v_sl = p_l.variants | where: 'title', '30' | first
  if lp2_v_sl == blank
    assign lp2_v_sl = p_l.selected_or_first_available_variant
  endif
  assign lp2_v_sw = p_w.variants | where: 'title', '30' | first
  if lp2_v_sw == blank
    assign lp2_v_sw = p_w.selected_or_first_available_variant
  endif
  assign lp2_v_sp = p_p.variants | where: 'title', '30' | first
  if lp2_v_sp == blank
    assign lp2_v_sp = p_p.selected_or_first_available_variant
  endif
  assign lp2_v_ol = o_l.selected_or_first_available_variant
  assign lp2_v_ow = o_w.selected_or_first_available_variant
  assign lp2_v_op = o_p.selected_or_first_available_variant
  assign lp2_v_ks = k_s.variants.first
  assign lp2_v_ko = k_o.variants.first

  # Precios en céntimos (los mismos para los tres sabores)
  assign lp2_sub1_now = lp2_v_sl.price | default: 0
  assign lp2_ot1_now = lp2_v_ol.price | default: 0
  assign lp2_sub1_was = lp2_v_sl.compare_at_price | default: lp2_ot1_now
  assign lp2_sub4_now = lp2_v_ks.price | default: 0
  assign lp2_ot4_now = lp2_v_ko.price | default: 0
  assign lp2_sub4_was = lp2_v_ks.compare_at_price | default: lp2_v_ko.compare_at_price | default: lp2_ot4_now
  # €/sobre redondeado al céntimo con aritmética entera: (precio + unidades/2) / unidades
  assign lp2_sub1_per = lp2_sub1_now | plus: 15 | divided_by: 30
  assign lp2_ot1_per = lp2_ot1_now | plus: 15 | divided_by: 30
  assign lp2_sub4_per = lp2_sub4_now | plus: 60 | divided_by: 120
  assign lp2_from_per = lp2_sub4_per
  assign lp2_sub4_save = lp2_sub4_was | minus: lp2_sub4_now
  assign lp2_sub1_save_pct = 0
  if lp2_sub1_was > 0
    assign lp2_half = lp2_sub1_was | divided_by: 2
    assign lp2_sub1_save_pct = lp2_sub1_was | minus: lp2_sub1_now | times: 100 | plus: lp2_half | divided_by: lp2_sub1_was
  endif
  assign lp2_disc = lp2_disc_p.price | default: 0

  assign lp2_alts = 'Hidratación superior: chico bebiendo LIT al sol|La fórmula, sin rodeos: sodio, potasio y magnesio|Resultados del estudio a los 7 y a los 30 días|Caja abierta con 30 sobres de {n}|Información nutricional e ingredientes de {n}|Tu día no para, tú tampoco' | split: '|'

  assign lp2_missing = ''
  if p_l == blank or p_w == blank or p_p == blank or o_l == blank or o_w == blank or o_p == blank or k_s == blank or k_o == blank
    assign lp2_missing = 'productos'
  endif
-%}"""


def flavor_json(key, short, name, color, aroma, p, v_sub, v_ot):
    return f"""    "{key}": {{
      "name": "{name}", "short": "{short}", "color": "var(--{key})", "aroma": "{aroma}",
      "sub": {{{{ {v_sub}.id | json }}}}, "ot": {{{{ {v_ot}.id | json }}}},
      "sachet": {{{{ 'nw-lp2-sobre-{key}.webp' | asset_url | json }}}},
      "gallery": [
        {{"src": {{{{ 'nw-lp2-g-{key}-0-comp.webp' | asset_url | json }}}}, "thumb": {{{{ 'nw-lp2-g-{key}-0-comp-t.webp' | asset_url | json }}}}, "alt": "Caja y sobre de LIT {name}"}}
        {{%- comment -%}} La 1.ª foto del producto muestra el sobre anterior (1000 mg de sodio): se salta {{%- endcomment -%}}
        {{%- for img in {p}.images offset: 1 limit: 6 -%}}
          ,{{"src": {{{{ img | image_url: width: 1000 | json }}}}, "thumb": {{{{ img | image_url: width: 260 | json }}}}, "alt": {{{{ lp2_alts[forloop.index0] | replace: '{{n}}', '{name}' | json }}}}}}
        {{%- endfor %}}
      ]
    }}"""


def pack_json(var):
    return f"""{{
      {{%- for v in {var}.variants -%}}
        {{%- liquid
          assign nl = 0
          assign nw = 0
          assign np = 0
          assign parts = v.title | split: ' + '
          for part in parts
            assign n = part | split: ' ' | first | plus: 0
            if part contains 'Watermelon'
              assign nw = n
            elsif part contains 'Peach'
              assign np = n
            elsif part contains 'Lemon'
              assign nl = n
            endif
          endfor
        -%}}
        "{{{{ nl }}}}-{{{{ nw }}}}-{{{{ np }}}}": {{{{ v.id | json }}}}{{% unless forloop.last %}},{{% endunless %}}
      {{%- endfor %}}
    }}"""


DATA_BLOCK = ('<script type="application/json" id="lp2-data">\n{\n  "order": ["lemon", "watermelon", "peach"],\n  "flavors": {\n'
              + flavor_json('lemon', 'Lemon', 'Salty Lemon', 'lemon', 'limón', 'p_l', 'lp2_v_sl', 'lp2_v_ol') + ',\n'
              + flavor_json('watermelon', 'Watermelon', 'Salty Watermelon', 'watermelon', 'sandía', 'p_w', 'lp2_v_sw', 'lp2_v_ow') + ',\n'
              + flavor_json('peach', 'Peach', 'Salty Peach', 'peach', 'melocotón', 'p_p', 'lp2_v_sp', 'lp2_v_op') + '\n  },\n'
              + '  "pack": {\n    "sub": ' + pack_json('k_s') + ',\n    "ot": ' + pack_json('k_o') + '\n  },\n'
              + '  "prices": {"1": {"sub": {"now": {{ lp2_sub1_now }}, "was": {{ lp2_sub1_was }}}, "ot": {"now": {{ lp2_ot1_now }}}}, '
              + '"4": {"sub": {"now": {{ lp2_sub4_now }}, "was": {{ lp2_sub4_was }}}, "ot": {"now": {{ lp2_ot4_now }}}}},\n'
              + '  "units": {"1": 30, "4": 120},\n  "maxQty": 10\n}\n</script>')

SNIPPET_PRICE = """{%- comment -%}
  nw-lp2-price · céntimos -> «28,35 €» (mismo formato que el JS de la landing, con espacio duro).
  Uso: {% render 'nw-lp2-price', cents: variant.price %}
{%- endcomment -%}
{%- liquid
  assign c = cents | default: 0 | round
  assign e = c | divided_by: 100
  assign d = c | modulo: 100
  if d < 10
    assign d = '0' | append: d
  endif
  echo e | append: ',' | append: d | append: '&nbsp;€'
-%}"""

SCHEMA = {
    'name': 'LIT · Landing v2',
    'class': 'nw-lp2-section',
    'settings': [
        {'type': 'header', 'content': 'Barra superior (promo)'},
        {'type': 'checkbox', 'id': 'promo_show', 'label': 'Mostrar la barra promo', 'default': True},
        {'type': 'inline_richtext', 'id': 'promo_text', 'label': 'Texto en ordenador',
         'default': '<strong>Hasta el 15/10 · LIT × Biotherm:</strong> muestra gratis de Electrolyte Nutri Cream con tu pedido'},
        {'type': 'inline_richtext', 'id': 'promo_text_mobile', 'label': 'Texto en móvil',
         'default': '<strong>Hasta el 15/10:</strong> muestra gratis Biotherm con tu pedido'},
        {'type': 'header', 'content': 'Productos de la caja de compra'},
        {'type': 'paragraph', 'content': 'Precios, variantes y galería salen de estos productos. La plantilla ya trae los de LIT.'},
        {'type': 'product', 'id': 'p_sub_lemon', 'label': 'Salty Lemon · suscripción'},
        {'type': 'product', 'id': 'p_sub_watermelon', 'label': 'Salty Watermelon · suscripción'},
        {'type': 'product', 'id': 'p_sub_peach', 'label': 'Salty Peach · suscripción'},
        {'type': 'product', 'id': 'p_ot_lemon', 'label': 'Salty Lemon · compra única'},
        {'type': 'product', 'id': 'p_ot_watermelon', 'label': 'Salty Watermelon · compra única'},
        {'type': 'product', 'id': 'p_ot_peach', 'label': 'Salty Peach · compra única'},
        {'type': 'product', 'id': 'p_pack_sub', 'label': 'Pack 4 cajas · suscripción'},
        {'type': 'product', 'id': 'p_pack_ot', 'label': 'Pack 4 cajas · compra única'},
        {'type': 'header', 'content': 'Discovery Set'},
        {'type': 'checkbox', 'id': 'discovery_show', 'label': 'Mostrar el enlace bajo el botón de compra', 'default': True},
        {'type': 'product', 'id': 'p_discovery', 'label': 'Producto Discovery Set'},
    ],
}

TEMPLATE = {
    'sections': {
        'main': {
            'type': 'nw-lp2',
            'settings': {
                'promo_show': True,
                'p_sub_lemon': 'lit-daily-hydration',
                'p_sub_watermelon': 'lit-daily-hydration-watermelon',
                'p_sub_peach': 'lit-daily-hydration-peach',
                'p_ot_lemon': 'lit-daily-hydration-compra-unica',
                'p_ot_watermelon': 'lit-daily-hydration-watermelon-compra-unica',
                'p_ot_peach': 'lit-daily-hydration-peach-compra-unica',
                'p_pack_sub': 'lit-pack-4-cajas',
                'p_pack_ot': 'lit-pack-4-cajas-compra-unica',
                'discovery_show': True,
                'p_discovery': 'discovery-set',
            },
        }
    },
    'order': ['main'],
}


def build_section(html):
    a = html.index('<div class="lp2" id="lp2">')
    b = html.index('\n</div>\n</body>')
    body = html[a:b] + '\n</div>'

    # datos de producto
    body, n = re.subn(r'<script type="application/json" id="lp2-data">.*?</script>', lambda m: DATA_BLOCK, body, flags=re.S)
    assert n == 1
    # scripts
    for rel, name in list(VENDOR.items()) + [('assets/js/landing.js', 'nw-lp2.js')]:
        t = f'<script src="{rel}" defer></script>'
        assert body.count(t) == 1, t
        body = body.replace(t, "<script src=\"{{ '%s' | asset_url }}\" defer></script>" % name)
    # Discovery Set (producto real)
    body = body.replace('<!--lp2:if discovery-->', '{%- if s.discovery_show and lp2_disc_p != blank -%}')
    body = body.replace('src="assets/img/discovery.webp"', 'src="{{ lp2_disc_p.featured_image | image_url: width: 120 }}"')
    body = body.replace('href="https://litsalt.com/products/discovery-set"', 'href="{{ lp2_disc_p.url }}"')
    # barra promo
    body = body.replace('<!--lp2:if promo-->', '{%- if s.promo_show -%}')
    body = body.replace('<!--/lp2:if-->', '{%- endif -%}')
    body = re.sub(r'<!--lp2:text (\w+)-->.*?<!--/lp2-->', lambda m: '{{ s.%s }}' % m.group(1), body, flags=re.S)
    # precios
    body = re.sub(r'<!--lp2:price (\w+)-->.*?<!--/lp2-->', lambda m: "{% render 'nw-lp2-price', cents: lp2_" + m.group(1) + " %}", body, flags=re.S)
    body = re.sub(r'<!--lp2:pct (\w+)-->.*?<!--/lp2-->', lambda m: '{{ lp2_%s_pct }}' % m.group(1), body, flags=re.S)
    assert '<!--lp2' not in body and '<!--/lp2' not in body
    # carrito y enlaces de la tienda
    body = body.replace('action="https://litsalt.com/cart/add"', 'action="{{ routes.cart_add_url }}"')
    body = body.replace('<input type="hidden" name="id" value="63887092154717">', '<input type="hidden" name="id" value="{{ lp2_v_sl.id }}">')
    body = body.replace('href="https://litsalt.com/policies/', 'href="/policies/')
    assert 'litsalt.com' not in body, re.findall(r'.{40}litsalt\.com.{40}', body)

    # rutas de imágenes y vídeos
    def map_srcset(m):
        entries = [e.strip() for e in m.group(1).split(',')]
        out = []
        for e in entries:
            url, _, desc = e.partition(' ')
            out.append((map_url(url), desc))
        urls = {u for u, _ in out}
        # varios anchos que en Shopify son el mismo archivo: sobra el srcset (el <img> ya tiene src).
        # Un <source> con una sola URL se queda como está: es lo único que tiene.
        if len(out) > 1 and len(urls) == 1:
            return 'data-lp2-drop-srcset'
        return 'srcset="' + ', '.join(f'{u} {d}'.strip() for u, d in out) + '"'
    body = re.sub(r'srcset="([^"]*assets/[^"]*)"', map_srcset, body)
    body = body.replace(' data-lp2-drop-srcset sizes="100vw"', '').replace(' data-lp2-drop-srcset', '')
    body = re.sub(r'(src|poster|data-lp2-src|data-lp2-src-m)="(assets/[^"]+)"', lambda m: f'{m.group(1)}="{map_url(m.group(2))}"', body)
    left = re.findall(r'"assets/[^"]+"', body)
    assert not left, left
    assert 'data-lp2-drop-srcset' not in body

    header = ("{%- comment -%}\n  LIT · Landing v2 «No es cansancio, es deshidratación».\n"
              "  Generado con tools/build_shopify.py desde el prototipo (repo jjurado2026/lit-no-es-cansancio).\n"
              "  Usar una sola vez por página. Todo cuelga de #lp2 con prefijo lp2- para no chocar con el tema.\n"
              "{%- endcomment -%}\n"
              "{{ 'nw-lp2.css' | asset_url | stylesheet_tag }}\n"
              "<link rel=\"preload\" href=\"{{ 'nw-lp2-clash.woff2' | asset_url }}\" as=\"font\" type=\"font/woff2\" crossorigin>\n"
              "<link rel=\"preload\" href=\"{{ 'nw-lp2-barlow-400.woff2' | asset_url }}\" as=\"font\" type=\"font/woff2\" crossorigin>\n"
              + LIQUID_HEAD + "\n"
              "{%- if request.design_mode and lp2_missing != blank -%}\n"
              "  <div style=\"padding:14px 18px;background:#FFF1B8;color:#4A3B00;font:600 14px/1.4 system-ui,sans-serif\">"
              "LIT · Landing v2: falta elegir algún producto en los ajustes de la sección. La caja de compra no funcionará hasta completarlos.</div>\n"
              "{%- endif -%}\n")
    schema = '\n{% schema %}\n' + json.dumps(SCHEMA, ensure_ascii=False, indent=2) + '\n{% endschema %}\n'
    return header + body + '\n' + schema


def build_css(css):
    for rel, name in FONTS.items():
        pat = re.compile(r"url\((['\"]?)\.\./fonts/" + re.escape(rel.split('/')[-1]) + r"\1\)")
        css, n = pat.subn(f"url('{name}')", css)
        assert n == 1, rel
    css += ("\n/* Shopify: la landing lleva su propio logo en el hero; se oculta la cabecera fija de las landings */\n"
            ".nw-lhead { display: none !important; }\n")
    return css


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    html = (PROTO / 'index.html').read_text(encoding='utf-8')
    css = (PROTO / 'assets/css/landing.css').read_text(encoding='utf-8')
    # vaciar sin borrar la carpeta raíz (en Windows puede estar abierta en una terminal)
    if OUT.exists():
        for child in OUT.iterdir():
            shutil.rmtree(child) if child.is_dir() else child.unlink()
    for d in ('sections', 'snippets', 'templates', 'assets'):
        (OUT / d).mkdir(parents=True, exist_ok=True)

    (OUT / 'sections/nw-lp2.liquid').write_text(build_section(html), encoding='utf-8', newline='\n')
    (OUT / 'snippets/nw-lp2-price.liquid').write_text(SNIPPET_PRICE, encoding='utf-8', newline='\n')
    (OUT / 'templates/page.landing-lp2.json').write_text(json.dumps(TEMPLATE, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    (OUT / 'assets/nw-lp2.css').write_text(build_css(css), encoding='utf-8', newline='\n')
    shutil.copyfile(PROTO / 'assets/js/landing.js', OUT / 'assets/nw-lp2.js')
    for src, name in {**NEW_ASSETS, **FONTS, **VENDOR}.items():
        shutil.copyfile(PROTO / src, OUT / 'assets' / name)

    # manifiesto: cada archivo con su URL pública (para subirlo por URL con la Admin API)
    files = []
    for p in sorted(OUT.rglob('*')):
        if p.is_file() and p.name not in ('manifest.json', 'README.md'):
            key = p.relative_to(OUT).as_posix()
            files.append({'key': key, 'url': PAGES + 'shopify/' + key, 'bytes': p.stat().st_size, 'sha256': sha(p)})
    existing = sorted(set(THEME.values()))
    cdn = sorted({files_url(f'assets/img/{p.name}') for p in (PROTO / 'assets/img').glob('*.webp') if files_url(f'assets/img/{p.name}')})
    manifest = {
        'generated_by': 'tools/build_shopify.py',
        'upload': files,
        'theme_assets_already_in_theme': existing,
        'files_cdn_already_in_store': cdn,
        'template': 'templates/page.landing-lp2.json',
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    readme = ROOT / 'tools' / 'SHOPIFY_README.md'
    if readme.exists():
        shutil.copyfile(readme, OUT / 'README.md')

    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted(OUT.rglob('*')):
            if p.is_file():
                z.write(p, 'lit-landing-shopify/' + p.relative_to(OUT).as_posix())
    total = sum(f['bytes'] for f in files)
    print(f'OK · {len(files)} archivos para subir ({total / 1024:.0f} KB) · zip {ZIP.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
