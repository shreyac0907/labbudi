# -*- coding: utf-8 -*-
# Generates the flat cell diagrams used by the P4 labelling and understand scrapbooks, one file per language:
#   public/assets/understand/<name>.<lang>.svg   (4:3, 400 x 300)
# Run: python3 scripts/gen-cell-diagrams.py
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'understand')
T = {
  'en': dict(membrane='Cell membrane', nucleus='Nucleus', cytoplasm='Cytoplasm', wall='Cell wall', vacuole='Vacuole', chloro='Chloroplasts', animal='Animal cell', plant='Plant cell', cheek='Cheek cell', both='Both', only='Plant only'),
  'zh': dict(membrane='细胞膜', nucleus='细胞核', cytoplasm='细胞质', wall='细胞壁', vacuole='液泡', chloro='叶绿体', animal='动物细胞', plant='植物细胞', cheek='颊细胞', both='都有', only='只有植物'),
  'ko': dict(membrane='세포막', nucleus='핵', cytoplasm='세포질', wall='세포벽', vacuole='액포', chloro='엽록체', animal='동물 세포', plant='식물 세포', cheek='볼 세포', both='둘 다', only='식물만'),
  'ms': dict(membrane='Membran sel', nucleus='Nukleus', cytoplasm='Sitoplasma', wall='Dinding sel', vacuole='Vakuol', chloro='Kloroplas', animal='Sel haiwan', plant='Sel tumbuhan', cheek='Sel pipi', both='Kedua-duanya', only='Tumbuhan sahaja'),
  'hi': dict(membrane='कोशिका झिल्ली', nucleus='केंद्रक', cytoplasm='कोशिकाद्रव्य', wall='कोशिका भित्ति', vacuole='रिक्तिका', chloro='हरितलवक', animal='जंतु कोशिका', plant='पादप कोशिका', cheek='गाल की कोशिका', both='दोनों में', only='सिर्फ़ पादप'),
}
FONT = "font-family=\"Inter, 'Noto Sans', system-ui, sans-serif\" font-weight=\"800\""
INK = '#2D3A45'
AMBER = '#FFB300'

BLOB = 'M110,150 C100,100 150,52 210,56 C275,60 306,102 296,150 C286,205 240,236 190,231 C140,226 116,196 110,150 Z'


def label(x, y, text, anchor, tx, ty, size=30):
    # a text label with a leader line to the point (tx, ty) it names
    lx = x + (4 if anchor == 'start' else -4)
    return (f'<polyline points="{lx},{y-7} {tx},{ty}" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linejoin="round"/>'
            f'<circle cx="{tx}" cy="{ty}" r="5" fill="{AMBER}" stroke="{INK}" stroke-width="2"/>'
            f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" {FONT} fill="{INK}" stroke="#fff" stroke-width="5" paint-order="stroke">{text}</text>')


def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="#fff"/>{body}</svg>'


def animal(t, hi=None, labels=('membrane', 'nucleus', 'cytoplasm')):
    b = ''
    if hi == 'cytoplasm':
        b += f'<path d="{BLOB}" fill="{AMBER}" opacity="0.35" transform="translate(-4 -3) scale(1.03)" />'
    if hi == 'membrane':
        b += f'<path d="{BLOB}" fill="none" stroke="{AMBER}" stroke-width="20" opacity="0.5" stroke-linejoin="round"/>'
    b += f'<path d="{BLOB}" fill="#D2E8FB" stroke="#5E9BD8" stroke-width="7" stroke-linejoin="round"/>'
    b += '<path d="M130,120 C140,92 170,76 200,78" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.7"/>'
    if hi == 'nucleus':
        b += f'<circle cx="205" cy="146" r="54" fill="none" stroke="{AMBER}" stroke-width="7" stroke-dasharray="12 8"/>'
    b += '<circle cx="205" cy="146" r="40" fill="#2E5FB0" stroke="#1E3F7E" stroke-width="3"/><circle cx="192" cy="132" r="10" fill="#fff" opacity="0.35"/>'
    if 'membrane' in labels:
        b += label(8, 36, t['membrane'], 'start', 124, 96)
    if 'nucleus' in labels:
        b += label(392, 270, t['nucleus'], 'end', 230, 168)
    if 'cytoplasm' in labels:
        b += label(8, 276, t['cytoplasm'], 'start', 150, 190)
    return b


def plant(t, scale=1.0):
    b = '<rect x="86" y="36" width="228" height="208" rx="24" fill="#F2FAEC" stroke="#4C9A4C" stroke-width="13"/>'
    b += '<rect x="98" y="48" width="204" height="184" rx="16" fill="none" stroke="#9BCB9B" stroke-width="3"/>'
    b += '<ellipse cx="226" cy="142" rx="62" ry="68" fill="#CFE8FA" stroke="#8DBEE6" stroke-width="4"/>'
    b += '<circle cx="136" cy="96" r="25" fill="#2E5FB0" stroke="#1E3F7E" stroke-width="3"/>'
    for cx, cy in [(130, 160), (140, 200), (170, 60), (254, 62), (270, 204), (180, 214)]:
        b += f'<ellipse cx="{cx}" cy="{cy}" rx="15" ry="8.5" fill="#3E9B3E" stroke="#2A6E2A" stroke-width="2"/>'
    return b


def plant_labelled(t):
    b = plant(t)
    b += label(392, 30, t['wall'], 'end', 304, 62)
    b += label(8, 28, t['nucleus'], 'start', 128, 90)
    b += label(392, 144, t['vacuole'], 'end', 262, 142)
    b += label(8, 276, t['chloro'], 'start', 132, 200)
    b += label(392, 280, t['cytoplasm'], 'end', 270, 214, 28)
    return b


def compare(t):
    # two small cells, then the parts they share and the parts only the plant cell has
    b = f'<g transform="translate(-4 -4) scale(0.42)">{animal(t, labels=())}</g>'
    b += f'<g transform="translate(224 -2) scale(0.46)">{plant(t)}</g>'
    b += f'<text x="98" y="112" text-anchor="middle" font-size="24" {FONT} fill="#2E5FB0">{t["animal"]}</text>'
    b += f'<text x="302" y="112" text-anchor="middle" font-size="24" {FONT} fill="#2F7F2F">{t["plant"]}</text>'
    rows = [('nucleus', True), ('cytoplasm', True), ('membrane', True), ('wall', False), ('vacuole', False), ('chloro', False)]
    y = 148
    for i, (k, both) in enumerate(rows):
        yy = y + i * 25
        b += f'<rect x="10" y="{yy-18}" width="380" height="23" rx="7" fill="{"#EAF3FC" if both else "#EAF6E6"}"/>'
        b += f'<text x="200" y="{yy}" text-anchor="middle" font-size="19" {FONT} fill="{INK}">{t[k]}</text>'
        b += f'<text x="98" y="{yy}" text-anchor="middle" font-size="21" {FONT} fill="{"#1E9E5A" if both else "#C0392B"}">{"✓" if both else "✗"}</text>'
        b += f'<text x="302" y="{yy}" text-anchor="middle" font-size="21" {FONT} fill="#1E9E5A">✓</text>'
    return b

for lang, t in T.items():
    files = {
        'animal_membrane': animal(t, 'membrane'),
        'animal_nucleus': animal(t, 'nucleus'),
        'animal_cytoplasm': animal(t, 'cytoplasm'),
        'plant_cell': plant_labelled(t),
        'animal_vs_plant': compare(t),
    }
    for name, body in files.items():
        with open(os.path.join(OUT, f'{name}.{lang}.svg'), 'w', encoding='utf-8') as f:
            f.write(svg(body))
print('ok', len(os.listdir(OUT)))
