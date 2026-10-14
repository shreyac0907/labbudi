# -*- coding: utf-8 -*-
# Generates the flat circuit diagrams used by the P5 "Understand" scrapbook, one file per language:
#   public/assets/understand/<name>.<lang>.svg   (4:3, 400 x 300)
# Run: python3 scripts/gen-circuit-diagrams.py
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'understand')
T = {
  'en': dict(battery='Battery', switch='Switch', bulb='Bulb', on='ON', off='OFF', gap='Gap', series='Series', parallel='Parallel', ammeter='Ammeter', voltmeter='Voltmeter', torch='Torch', home='Home lights', one_path='One path', two_paths='Two paths', all_off='All off', others_on='Others stay on', in_loop='In the loop', across='Across the bulb', open='Open', closed='Closed'),
  'zh': dict(battery='电池', switch='开关', bulb='灯泡', on='亮', off='灭', gap='缺口', series='串联', parallel='并联', ammeter='电流表', voltmeter='电压表', torch='手电筒', home='家里的灯', one_path='一条路径', two_paths='两条路径', all_off='全灭', others_on='其余仍亮', in_loop='接在回路中', across='并在灯泡两端', open='断开', closed='闭合'),
  'ko': dict(battery='건전지', switch='스위치', bulb='전구', on='켜짐', off='꺼짐', gap='틈', series='직렬', parallel='병렬', ammeter='전류계', voltmeter='전압계', torch='손전등', home='집 안의 전등', one_path='길 하나', two_paths='길 두 개', all_off='모두 꺼짐', others_on='나머지는 켜짐', in_loop='회로 안에', across='전구 양쪽에', open='열림', closed='닫힘'),
  'ms': dict(battery='Bateri', switch='Suis', bulb='Mentol', on='HIDUP', off='MATI', gap='Jurang', series='Siri', parallel='Selari', ammeter='Ammeter', voltmeter='Voltmeter', torch='Lampu suluh', home='Lampu rumah', one_path='Satu laluan', two_paths='Dua laluan', all_off='Semua mati', others_on='Yang lain menyala', in_loop='Dalam litar', across='Merentasi mentol', open='Terbuka', closed='Tertutup'),
  'hi': dict(battery='बैटरी', switch='स्विच', bulb='बल्ब', on='चालू', off='बंद', gap='खाली जगह', series='श्रेणी', parallel='समानांतर', ammeter='ऐमीटर', voltmeter='वोल्टमीटर', torch='टॉर्च', home='घर की बत्तियाँ', one_path='एक रास्ता', two_paths='दो रास्ते', all_off='सब बुझे', others_on='बाकी जलते हैं', in_loop='लूप के अंदर', across='बल्ब के आर-पार', open='खुला', closed='बंद'),
}
FONT = "font-family=\"Inter, 'Noto Sans', system-ui, sans-serif\" font-weight=\"800\""
INK = '#2D3A45'
WIRE = '#D62828'  # thin red leads, like the ones in the lab
AMBER = '#FFB300'
GREEN = '#1E9E5A'
RED = '#D32F2F'


def text(x, y, s, size=24, anchor='middle', fill=INK):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" {FONT} fill="{fill}" stroke="#fff" stroke-width="5" paint-order="stroke">{s}</text>'


def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="#fff"/>{body}</svg>'


def wire(*pts, dash=False):
    d = 'M' + ' L'.join(f'{x},{y}' for x, y in pts)
    extra = ' stroke-dasharray="3 12"' if dash else ''
    return f'<path d="{d}" fill="none" stroke="{WIRE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"{extra}/>'


def arrow(x, y, direction):
    # a small amber arrow showing the way the current goes: direction is r, l, u or d
    pts = {'r': f'{x-8},{y-9} {x+9},{y} {x-8},{y+9}', 'l': f'{x+8},{y-9} {x-9},{y} {x+8},{y+9}', 'u': f'{x-9},{y+8} {x},{y-9} {x+9},{y+8}', 'd': f'{x-9},{y-8} {x},{y+9} {x+9},{y-8}'}[direction]
    return f'<polygon points="{pts}" fill="{AMBER}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'


def battery(cx, cy):
    return (f'<rect x="{cx-9}" y="{cy-44}" width="18" height="8" rx="2" fill="#B0B8C0" stroke="{INK}" stroke-width="2.5"/>'
            f'<rect x="{cx-20}" y="{cy-38}" width="40" height="78" rx="7" fill="{RED}" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="{cx-20}" y="{cy-2}" width="40" height="14" fill="#fff" opacity="0.9"/>'
            f'<text x="{cx}" y="{cy-16}" text-anchor="middle" font-size="22" {FONT} fill="#fff">+</text>'
            f'<text x="{cx}" y="{cy+31}" text-anchor="middle" font-size="26" {FONT} fill="#fff">−</text>')


def bulb(cx, cy, lit=True, r=26, missing=False):
    if missing:
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#9AA5B1" stroke-width="4" stroke-dasharray="6 7"/>'
    b = ''
    if lit:
        b += f'<circle cx="{cx}" cy="{cy}" r="{r+16}" fill="#FFE066" opacity="0.35"/><circle cx="{cx}" cy="{cy}" r="{r+8}" fill="#FFE066" opacity="0.4"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{"#FFE066" if lit else "#EEF3F7"}" stroke="{INK}" stroke-width="3.5"/>'
    b += f'<path d="M{cx-9},{cy+14} L{cx-9},{cy-2} L{cx-3},{cy+6} L{cx+3},{cy-4} L{cx+9},{cy+4} L{cx+9},{cy+14}" fill="none" stroke="{"#C77700" if lit else "#7A8794"}" stroke-width="3" stroke-linejoin="round"/>'
    return b


def switch(cx, cy, closed=True):
    s = f'<rect x="{cx-38}" y="{cy+2}" width="76" height="16" rx="6" fill="#E4C9A0" stroke="{INK}" stroke-width="3"/>'
    s += f'<circle cx="{cx-28}" cy="{cy}" r="7" fill="#B0B8C0" stroke="{INK}" stroke-width="2.5"/><circle cx="{cx+28}" cy="{cy}" r="7" fill="#B0B8C0" stroke="{INK}" stroke-width="2.5"/>'
    if closed:
        s += f'<path d="M{cx-28},{cy} L{cx+28},{cy}" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
    else:
        s += f'<path d="M{cx-28},{cy} L{cx+14},{cy-30}" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
    return s


def meter(cx, cy, letter):
    return (f'<circle cx="{cx}" cy="{cy}" r="26" fill="#fff" stroke="{INK}" stroke-width="4"/>'
            f'<text x="{cx}" y="{cy+11}" text-anchor="middle" font-size="32" {FONT} fill="{INK}">{letter}</text>')


L, R, TOP, BOT = 70, 330, 70, 230


def loop_closed(t, lit=True, closed=True, extra=''):
    b = wire((L, 128), (L, TOP), (170, TOP)) + wire((230, TOP), (R, TOP), (R, 124)) + wire((R, 176), (R, BOT), (L, BOT), (L, 172))
    b += battery(L, 150) + switch(200, TOP, closed) + bulb(R, 150, lit)
    if lit:
        b += arrow(120, TOP, 'r') + arrow(R, 100, 'd') + arrow(200, BOT, 'l') + arrow(L, 205, 'u')
    b += text(L, 268, t['battery'], 22) + text(R, 268, t['bulb'], 22)
    return b + extra


def d_closed(t):
    b = loop_closed(t, True, True)
    b += text(200, 120, t['switch'], 22) + text(200, 180, t['on'], 40, fill=GREEN)
    return svg(b)


def d_open(t):
    b = loop_closed(t, False, False)
    b += text(268, 38, t['gap'], 24, 'middle', RED)
    b += f'<path d="M244,46 L230,58" stroke="{RED}" stroke-width="4" stroke-linecap="round"/>'
    b += text(200, 130, t['switch'], 22) + text(200, 190, t['off'], 40, fill=RED)
    return svg(b)


def d_series(t):
    b = wire((L, 128), (L, TOP), (R, TOP), (R, BOT), (L, BOT), (L, 172))
    b += battery(L, 150) + bulb(160, TOP, True, 24) + bulb(250, TOP, True, 24)
    b += arrow(R, 150, 'd') + arrow(200, BOT, 'l') + arrow(L, 205, 'u')
    b += text(200, 34, t['series'], 28) + text(200, 160, t['one_path'], 30, fill=GREEN)
    b += text(L, 270, t['battery'], 22)
    return svg(b)


def d_parallel(t):
    b = wire((50, 128), (50, 60), (340, 60)) + wire((50, 172), (50, 240), (340, 240))
    for x in (170, 280):
        b += wire((x, 60), (x, 124)) + wire((x, 176), (x, 240))
        b += bulb(x, 150, True, 26) + arrow(x, 96, 'd') + arrow(x, 214, 'd')
    b += battery(50, 150)
    b += text(225, 28, t['parallel'], 28) + text(225, 285, t['two_paths'], 28, fill=GREEN)
    b += text(50, 282, t['battery'], 20)
    return svg(b)


def d_compare(t):
    # one bulb out: in a series loop everything goes off; in a parallel one the others stay lit
    b = ''
    # left: series
    b += wire((20, 130), (20, 90), (90, 90)) + wire((130, 90), (190, 90), (190, 230), (20, 230), (20, 170))
    b += battery(20, 150).replace('x="', 'x="')
    b += bulb(110, 90, False, 20) + bulb(190, 150, False, 20, missing=True)
    b += text(100, 34, t['series'], 26) + text(100, 270, t['all_off'], 26, fill=RED)
    # right: parallel
    b += wire((230, 90), (380, 90)) + wire((230, 230), (380, 230))
    b += wire((270, 90), (270, 128)) + wire((270, 172), (270, 230)) + bulb(270, 150, True, 20)
    b += wire((340, 90), (340, 125), dash=True) + wire((340, 175), (340, 230), dash=True) + bulb(340, 150, False, 20, missing=True)
    b += wire((230, 90), (230, 230))
    b += text(305, 34, t['parallel'], 26) + text(300, 270, t['others_on'], 20, fill=GREEN)
    b += f'<line x1="200" y1="20" x2="200" y2="285" stroke="#D9D4CA" stroke-width="3" stroke-dasharray="6 8"/>'
    return svg(b)


def d_ammeter(t):
    b = wire((L, 128), (L, TOP), (160, TOP)) + wire((240, TOP), (R, TOP), (R, 124)) + wire((R, 176), (R, BOT), (L, BOT), (L, 172))
    b += battery(L, 150) + meter(200, TOP, 'A') + bulb(R, 150, True)
    b += arrow(120, TOP, 'r') + arrow(R, 100, 'd') + arrow(200, BOT, 'l') + arrow(L, 205, 'u')
    b += text(200, 124, t['ammeter'], 26) + text(200, 170, t['in_loop'], 24, fill=GREEN) + text(200, 200, t['series'], 24, fill=GREEN)
    b += text(L, 270, t['battery'], 22) + text(R, 270, t['bulb'], 22)
    return svg(b)


def d_voltmeter(t):
    bx = 290
    b = wire((L, 128), (L, TOP), (bx, TOP), (bx, 124)) + wire((bx, 176), (bx, BOT), (L, BOT), (L, 172))
    b += battery(L, 150) + bulb(bx, 150, True)
    # the voltmeter's branch goes across the bulb
    b += wire((bx, 100), (366, 100), (366, 122)) + wire((366, 178), (366, 200), (bx, 200))
    b += meter(366, 150, 'V')
    b += arrow(150, TOP, 'r') + arrow(200, BOT, 'l') + arrow(L, 205, 'u')
    b += text(172, 130, t['voltmeter'], 26) + text(172, 170, t['across'], 22, fill=GREEN) + text(172, 200, t['parallel'], 24, fill=GREEN)
    b += text(L, 270, t['battery'], 22) + text(bx, 270, t['bulb'], 22)
    return svg(b)


def d_torch(t):
    b = ''
    # beam
    b += f'<polygon points="318,120 392,70 392,230 318,180" fill="#FFE066" opacity="0.55"/>'
    # body and head
    b += f'<rect x="30" y="112" width="250" height="76" rx="22" fill="#CFD8E0" stroke="{INK}" stroke-width="4"/>'
    b += f'<path d="M280,100 L322,86 L322,214 L280,200 Z" fill="#AEB9C4" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>'
    # inside: the loop
    b += wire((70, 150), (70, 128), (240, 128), (240, 150), (300, 150))
    b += f'<rect x="52" y="124" width="100" height="52" rx="8" fill="{RED}" stroke="{INK}" stroke-width="3"/>'
    b += f'<text x="70" y="157" text-anchor="middle" font-size="22" {FONT} fill="#fff">+</text><text x="135" y="158" text-anchor="middle" font-size="26" {FONT} fill="#fff">−</text>'
    b += bulb(300, 150, True, 15)
    # switch button on top
    b += f'<rect x="200" y="94" width="40" height="22" rx="8" fill="#2E7D32" stroke="{INK}" stroke-width="3"/>'
    b += text(100, 74, t['battery'], 22) + f'<path d="M100,80 L100,118" stroke="{INK}" stroke-width="3"/>'
    b += text(220, 62, t['switch'], 22) + f'<path d="M220,68 L220,92" stroke="{INK}" stroke-width="3"/>'
    b += text(298, 262, t['bulb'], 22) + f'<path d="M298,236 L298,170" stroke="{INK}" stroke-width="3"/>'
    b += text(150, 262, t['torch'], 30, 'middle', GREEN)
    return svg(b)


def d_house(t):
    b = f'<path d="M40,130 L200,40 L360,130 L360,270 L40,270 Z" fill="#FFF6E0" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
    b += wire((70, 170), (330, 170)) + wire((70, 250), (330, 250))
    for x in (120, 200, 280):
        b += wire((x, 170), (x, 192)) + wire((x, 232), (x, 250)) + bulb(x, 212, True, 20)
    b += text(200, 118, t['home'], 28) + text(200, 152, t['parallel'], 24, fill=GREEN)
    return svg(b)


FILES = {
    'circuit_closed': d_closed,
    'circuit_open': d_open,
    'circuit_series': d_series,
    'circuit_parallel': d_parallel,
    'circuit_compare': d_compare,
    'circuit_ammeter': d_ammeter,
    'circuit_voltmeter': d_voltmeter,
    'circuit_torch': d_torch,
    'circuit_house': d_house,
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in FILES.items():
        for lang, t in T.items():
            with open(os.path.join(OUT, f'{name}.{lang}.svg'), 'w', encoding='utf-8') as f:
                f.write(fn(t))
    print('wrote', len(FILES) * len(T), 'files')
