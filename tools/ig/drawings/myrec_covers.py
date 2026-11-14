"""운영자 진짜 기록 캐러셀(myrec1~4)의 표지를 새로 그린 SVG 그림으로 바꾼다.
공식 포스터는 쓰지 않고, 제목에서 떠오르는 소재로 가볍게 그린 방탈로그 그림.
사용: python3 tools/ig/drawings/myrec_covers.py tools/ig/templates/myrec*.html
"""
import re, sys

V = 'viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice"'
ART = {
 "짠해": ("#22284A", f'''<svg {V}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3A6E"/><stop offset="1" stop-color="#151A33"/></linearGradient></defs>
<rect width="200" height="300" fill="url(#a)"/><circle cx="150" cy="58" r="22" fill="#F3D9A0"/>
<g fill="#0E1226"><rect x="8" y="150" width="30" height="150"/><rect x="40" y="120" width="26" height="180"/><rect x="150" y="135" width="44" height="165"/></g>
<g fill="#F3D9A0" opacity=".55"><rect x="14" y="160" width="5" height="7"/><rect x="26" y="176" width="5" height="7"/><rect x="46" y="134" width="5" height="7"/><rect x="158" y="150" width="5" height="7"/><rect x="172" y="170" width="5" height="7"/></g>
<g transform="rotate(-14 85 180)"><path d="M70 150h30l-4 52h-22z" fill="#E8F1F2" opacity=".9"/><path d="M73 168h24l-2 32h-20z" fill="#8FD0A8"/></g>
<g transform="rotate(14 120 180)"><path d="M105 150h30l-4 52h-22z" fill="#E8F1F2" opacity=".9"/><path d="M108 168h24l-2 32h-20z" fill="#8FD0A8"/></g>
<g stroke="#F3D9A0" stroke-width="3" stroke-linecap="round"><path d="M102 128v-12M88 132l-6-9M116 132l6-9"/></g></svg>'''),
 "시크릿 왕국의 스캔들(감독판)": ("#2A1420", f'''<svg {V}><defs><radialGradient id="b" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#7A3B3B"/><stop offset="1" stop-color="#1E0E16"/></radialGradient></defs>
<rect width="200" height="300" fill="url(#b)"/><circle cx="100" cy="120" r="44" fill="#E8C37A" opacity=".85"/>
<path d="M40 210V150l10-14 10 14v-20l12-18 12 18v-30l16-24 16 24v30l12-18 12 18v20l10-14 10 14v60z" fill="#120810"/>
<g fill="#E8C37A"><rect x="96" y="132" width="8" height="12" rx="4"/><rect x="66" y="160" width="6" height="9" rx="3"/><rect x="128" y="160" width="6" height="9" rx="3"/></g>
<path d="M75 52l12 14 13-20 13 20 12-14-5 26h-40z" fill="#E8C37A"/>
<path d="M0 210h200v90H0z" fill="#120810"/><path d="M90 300c4-40 8-70 10-90 2 20 6 50 10 90z" fill="#2A1420"/></svg>'''),
 "here i am": ("#2B8FB8", f'''<svg {V}><rect width="200" height="300" fill="#8FD6F0"/><rect y="150" width="200" height="150" fill="#2B8FB8"/>
<g stroke="#E6F7FF" stroke-width="3" opacity=".7" fill="none"><path d="M10 190q15-8 30 0t30 0M110 210q15-8 30 0t30 0M30 240q15-8 30 0t30 0"/></g>
<ellipse cx="100" cy="168" rx="62" ry="16" fill="#F2C987"/><path d="M104 168c2-30 6-52 2-74" stroke="#7A5232" stroke-width="7" fill="none" stroke-linecap="round"/>
<g fill="#3E9E5C"><path d="M106 92c-20-6-38 2-46 14 16-6 30-6 46-14z"/><path d="M106 92c16-12 36-10 46 0-16-2-30 0-46 0z"/><path d="M106 92c-6 14-2 30 8 38-2-14-4-26-8-38z"/></g>
<g transform="translate(140 46) rotate(-10)"><path d="M0 6h40l8-6v12l-8-2H0z" fill="#fff"/><path d="M16 6l-6-12h6l10 12z" fill="#E4544A"/></g>
<circle cx="76" cy="160" r="5" fill="#1D1D1D"/><path d="M76 165v10M70 170h12" stroke="#1D1D1D" stroke-width="3"/></svg>'''),
 "memory of tony": ("#2E4A55", f'''<svg {V}><rect width="200" height="300" fill="#E9D9B5"/><rect x="0" y="0" width="200" height="300" fill="none" stroke="#2E4A55" stroke-width="10"/>
<path d="M30 40h140" stroke="#B5432F" stroke-width="5"/><path d="M30 52h140" stroke="#2E4A55" stroke-width="2"/>
<rect x="128" y="70" width="34" height="140" fill="#2E4A55"/><path d="M124 70l21-26 21 26z" fill="#B5432F"/><circle cx="145" cy="100" r="12" fill="#F6EDD6" stroke="#1D1D1D" stroke-width="2"/><path d="M145 100v-8M145 100l6 3" stroke="#1D1D1D" stroke-width="2"/>
<rect x="34" y="130" width="76" height="80" fill="#B5432F"/><rect x="34" y="122" width="76" height="12" fill="#2E4A55"/><g fill="#F6EDD6"><rect x="44" y="146" width="16" height="22"/><rect x="72" y="146" width="16" height="22"/></g>
<rect x="0" y="210" width="200" height="90" fill="#6E8A7A"/>
<g transform="translate(70 226)"><path d="M0 0h50l-6 40H6z" fill="#F6EDD6" stroke="#1D1D1D" stroke-width="3"/><path d="M50 10q14 2 8 18l-10 2" fill="none" stroke="#1D1D1D" stroke-width="3"/><path d="M14-8q4-8 0-14M28-8q4-8 0-14" stroke="#F6EDD6" stroke-width="3" fill="none"/></g></svg>'''),
 "메모리컴퍼니": ("#163A3A", f'''<svg {V}><rect width="200" height="300" fill="#163A3A"/>
<g fill="none" stroke="#5FC2B0" stroke-width="2" opacity=".35"><path d="M0 60h60v40h80v-30h60M0 230h40v-30h70v50h90"/></g>
<rect x="56" y="96" width="88" height="110" rx="8" fill="#0E2626" stroke="#5FC2B0" stroke-width="4"/>
<g stroke="#5FC2B0" stroke-width="4"><path d="M70 96v-14M86 96v-14M100 96v-14M114 96v-14M130 96v-14M70 206v14M86 206v14M100 206v14M114 206v14M130 206v14"/></g>
<path d="M100 122c-16 0-26 10-26 22 0 10 8 16 8 26h36c0-10 8-16 8-26 0-12-10-22-26-22z" fill="#F3D9A0"/><rect x="86" y="174" width="28" height="10" rx="3" fill="#E9E1CC"/>
<g stroke="#F3D9A0" stroke-width="3" stroke-linecap="round"><path d="M100 108v-6M70 124l-6-4M130 124l6-4"/></g></svg>'''),
 "FILM BY BOB": ("#1C3A2A", f'''<svg {V}><rect width="200" height="300" fill="#1C3A2A"/>
<g fill="#0F2218"><rect x="0" y="0" width="22" height="300"/><rect x="178" y="0" width="22" height="300"/></g>
<g fill="#D9E8C9" opacity=".7">{''.join(f'<rect x="6" y="{y}" width="10" height="12" rx="2"/><rect x="184" y="{y}" width="10" height="12" rx="2"/>' for y in range(10,300,26))}</g>
<circle cx="78" cy="96" r="26" fill="#0F2218" stroke="#D9E8C9" stroke-width="4"/><circle cx="130" cy="96" r="26" fill="#0F2218" stroke="#D9E8C9" stroke-width="4"/>
<g fill="#D9E8C9"><circle cx="78" cy="96" r="6"/><circle cx="130" cy="96" r="6"/></g>
<rect x="52" y="124" width="104" height="66" rx="8" fill="#D9E8C9"/><path d="M156 140l28-14v62l-28-14z" fill="#D9E8C9"/>
<circle cx="80" cy="157" r="8" fill="#E4544A"/><rect x="96" y="148" width="44" height="18" rx="3" fill="#1C3A2A"/>
<path d="M60 220l40-10 40 10" stroke="#D9E8C9" stroke-width="3" fill="none" opacity=".5"/></svg>'''),
 "imagine": ("#3E3010", f'''<svg {V}><rect width="200" height="300" fill="#F2C43D"/>
<g fill="#E8A92A">{''.join(f'<circle cx="{x}" cy="{y}" r="4"/>' for x in range(10,200,20) for y in range(10,300,20))}</g>
<g stroke="#1D1D1D" stroke-width="5" stroke-linecap="round"><path d="M100 46v-18M54 66l-12-12M146 66l12-12M36 110H18M164 110h18"/></g>
<path d="M100 60c-30 0-50 22-50 48 0 22 16 32 20 52h60c4-20 20-30 20-52 0-26-20-48-50-48z" fill="#FFF6D6" stroke="#1D1D1D" stroke-width="5"/>
<rect x="72" y="168" width="56" height="28" rx="6" fill="#9AA0A8" stroke="#1D1D1D" stroke-width="5"/>
<path d="M88 132l12-14 12 14" stroke="#E4544A" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="100" cy="148" r="4" fill="#E4544A"/>
<g fill="#1D1D1D"><path d="M40 230l6 14 14 6-14 6-6 14-6-14-14-6 14-6z"/><path d="M158 226l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/></g></svg>'''),
}
CSS = ".cv svg{position:absolute;inset:0;width:100%;height:100%}.cv b{z-index:1;text-shadow:0 2px 6px rgba(0,0,0,.6)}.cv:after{content:'';position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))}.cv b,.cv .lg{z-index:2}.cv:before{z-index:2}"

pat = re.compile(r'<div class="cv ?" style="background:[^"]*">(<span class=lg>인생테마</span>)?<span class="mo">.*?</span><b>(.*?)</b></div>', re.S)
def sub(m):
    lg, t = m.group(1) or "", m.group(2)
    col, svg = ART[t]
    return f'<div class="cv" style="background:{col}">{svg}{lg}<b>{t}</b></div>'
for p in sys.argv[1:]:
    s = open(p).read()
    s, n = pat.subn(sub, s)
    if CSS not in s: s = s.replace("</style>", CSS + "</style>", 1)
    open(p, "w").write(s); print(p, n)
