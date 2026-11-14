"""대구편 그림: 표지·마무리 풍경과 테마별 작은 그림(SVG). 공식 포스터는 쓰지 않고 제목에서 떠오르는 소재로 새로 그린다."""
V = 'viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"'

def svg(bg, body):
    return f'<svg {V}><rect width="400" height="220" fill="{bg}"/>{body}</svg>'

MOTIF = {
 "노블리스트": svg("#2A1B22", '''<rect x="110" y="40" width="180" height="150" fill="#EFE6D2" transform="rotate(-6 200 115)"/>
<g stroke="#C9B9A0" stroke-width="2" transform="rotate(-6 200 115)">''' + "".join(f'<path d="M122 {y}h156"/>' for y in range(60,185,16)) + '''</g>
<path d="M150 150q20-30 60-20t50 30" stroke="#8B1E2B" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="262" cy="166" r="6" fill="#8B1E2B"/>
<g transform="translate(285 40) rotate(35)"><rect width="16" height="110" rx="4" fill="#1D1D1D"/><path d="M0 110l8 22 8-22z" fill="#C9A36A"/></g>'''),
 "우리 아빠": svg("#1E2430", '''<rect x="0" y="150" width="400" height="70" fill="#151A24"/><rect x="250" y="40" width="90" height="70" fill="#F3D9A0" opacity=".85"/>
<path d="M295 40v70M250 75h90" stroke="#1E2430" stroke-width="5"/>
<circle cx="150" cy="80" r="26" fill="#0B0E14"/><path d="M104 180q0-70 46-70t46 70z" fill="#0B0E14"/><path d="M150 112l-8 14 8 40 8-40z" fill="#8B1E2B"/>
<g fill="#E8E2D2"><circle cx="141" cy="78" r="4"/><circle cx="159" cy="78" r="4"/></g>'''),
 "아이돌 남친": svg("#2B1830", '''<g fill="#FF8FB8" opacity=".25">''' + "".join(f'<circle cx="{x}" cy="{y}" r="3"/>' for x in range(10,400,30) for y in range(10,220,30)) + '''</g>
<path d="M200 190c-80-50-110-90-80-125 20-22 55-16 80 12 25-28 60-34 80-12 30 35 0 75-80 125z" fill="#FF8FB8"/>
<path d="M200 66l-14 40 22 18-16 34 12 32" stroke="#2B1830" stroke-width="7" fill="none"/>
<g transform="translate(300 40)"><circle r="18" fill="#D9D9E3"/><rect x="-6" y="16" width="12" height="60" rx="5" fill="#9A9AAE"/></g>'''),
 "행복 고시원": svg("#22201C", '''<path d="M0 0h400v220H0z" fill="#2E2A24"/><path d="M150 40h100l60 180H90z" fill="#3D372E"/>
<g fill="#5A5144" stroke="#1A1814" stroke-width="3"><rect x="40" y="50" width="70" height="140"/><rect x="290" y="50" width="70" height="140"/><rect x="175" y="60" width="50" height="80"/></g>
<g fill="#F3D9A0" font-family="sans-serif" font-size="16" font-weight="800"><text x="62" y="74">201</text><text x="312" y="74">204</text><text x="187" y="82">207</text></g>
<rect x="196" y="20" width="8" height="18" fill="#F3D9A0"/><path d="M180 38h40l-8 10h-24z" fill="#F3D9A0"/><path d="M175 140l25-92 25 92z" fill="#F3D9A0" opacity=".12"/>'''),
 "너의 겨울은 가고, 봄은 온다": svg("#DDEFF5", '''<rect y="150" width="400" height="70" fill="#FFFFFF"/>
<g fill="#fff">''' + "".join(f'<circle cx="{x}" cy="{y}" r="3"/>' for x,y in [(30,30),(80,60),(140,20),(220,50),(300,25),(360,70),(60,110),(330,120)]) + '''</g>
<path d="M150 150l30-80 30 80z" fill="#E2554A"/><circle cx="180" cy="68" r="12" fill="#fff"/><rect x="146" y="140" width="68" height="16" rx="8" fill="#fff"/>
<g transform="translate(270 150)"><path d="M0 0v-40" stroke="#5FA35A" stroke-width="5"/><path d="M0-30q-24-10-24-30 22 4 24 30zM0-38q22-14 26-34-24 6-26 34z" fill="#7CC36E"/></g><circle cx="300" cy="118" r="7" fill="#FFB7C8"/>'''),
 "X됐다": svg("#FFE45C", '''<g stroke="#1D1D1D" stroke-width="5" stroke-linecap="round"><path d="M60 40l20 20M340 40l-20 20M60 180l20-20M340 180l-20-20"/></g>
<circle cx="200" cy="120" r="62" fill="#fff" stroke="#1D1D1D" stroke-width="5"/>
<g stroke="#1D1D1D" stroke-width="6" stroke-linecap="round"><path d="M172 104l14 14M186 104l-14 14M214 104l14 14M228 104l-14 14"/></g>
<ellipse cx="200" cy="150" rx="18" ry="12" fill="#1D1D1D"/><path d="M262 82q10 14 0 22q-10-8 0-22z" fill="#6EC1FF"/>'''),
 "33: DOOR RUN (도어런)": svg("#1B2440", '''<g fill="#3B4A7A">''' + "".join(f'<rect x="{x}" y="60" width="50" height="110" rx="4"/>' for x in (20,90,300)) + '''</g>
<rect x="160" y="40" width="80" height="140" rx="6" fill="#FF6B57" stroke="#fff" stroke-width="4"/><circle cx="225" cy="112" r="6" fill="#fff"/>
<g stroke="#9FB4FF" stroke-width="5" stroke-linecap="round"><path d="M120 90h-30M130 110h-50M120 130h-30"/></g>
<text x="200" y="125" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="44" fill="#fff">33</text>'''),
 "단잠": svg("#24305A", '''<circle cx="320" cy="60" r="28" fill="#F6E7B0"/><circle cx="332" cy="52" r="26" fill="#24305A"/>
<rect x="0" y="150" width="400" height="70" fill="#1A2242"/><rect x="40" y="60" width="150" height="90" rx="8" fill="#F5F0E6"/><path d="M60 120q40-40 110 0" stroke="#9AA6D6" stroke-width="5" fill="none"/>
<g fill="#F6E7B0" font-family="serif" font-size="26" font-weight="700"><text x="230" y="120">z</text><text x="252" y="100" font-size="32">z</text><text x="280" y="76" font-size="38">Z</text></g>'''),
 "신스틸러": svg("#121418", '''<path d="M120 60L400 20v200L120 140z" fill="#F3D9A0" opacity=".2"/><g transform="translate(70 80)"><rect width="60" height="36" rx="8" fill="#3A3F4A"/><rect x="56" y="4" width="12" height="28" fill="#F3D9A0"/></g>
<g fill="#2C313A">''' + "".join(f'<ellipse cx="{x}" cy="{y}" rx="10" ry="16" transform="rotate(-20 {x} {y})"/>' for x,y in [(200,180),(240,160),(280,185),(320,165)]) + '''</g><rect x="300" y="60" width="50" height="40" rx="4" fill="#E6C14B"/><path d="M325 60v-12" stroke="#E6C14B" stroke-width="4"/>'''),
 "랑슈 뷰티연구소": svg("#F7E3EA", '''<ellipse cx="140" cy="110" rx="60" ry="80" fill="#fff" stroke="#C98BA0" stroke-width="6"/><ellipse cx="140" cy="110" rx="44" ry="62" fill="#EED3DE"/>
<g transform="translate(250 70)"><rect x="10" y="0" width="20" height="16" fill="#C98BA0"/><path d="M0 16h40l8 90H-8z" fill="#FFB7C8" stroke="#C98BA0" stroke-width="4"/></g>
<g fill="#fff">''' + "".join(f'<path d="M{x} {y}l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/>' for x,y in [(330,50),(220,40),(350,150)]) + '</g>'),
 "단디해라": svg("#151A3A", '''<g fill="#fff">''' + "".join(f'<circle cx="{x}" cy="{y}" r="2"/>' for x,y in [(20,20),(70,60),(130,30),(190,80),(260,20),(330,50),(370,100),(40,150),(110,190),(350,190)]) + '''</g>
<circle cx="300" cy="150" r="46" fill="#5FB878"/><ellipse cx="300" cy="150" rx="76" ry="14" fill="none" stroke="#F3D9A0" stroke-width="5"/>
<g transform="translate(110 110) rotate(-30)"><path d="M0-40q20 20 20 50h-40q0-30 20-50z" fill="#E8E2D2"/><circle cy="-6" r="8" fill="#6EC1FF"/><path d="M-20 10l-12 16h12zM20 10l12 16h-12z" fill="#E2554A"/><path d="M-10 12q10 30 20 0" fill="#FFB347"/></g>'''),
 "가이아 기적의땅": svg("#E8F2D6", '''<ellipse cx="200" cy="200" rx="220" ry="50" fill="#7BAA5A"/><path d="M196 190c-4-50 0-80 4-110" stroke="#7A5232" stroke-width="12"/>
<circle cx="200" cy="70" r="52" fill="#5C9A4A"/><circle cx="160" cy="92" r="34" fill="#6CB056"/><circle cx="242" cy="94" r="34" fill="#6CB056"/>
<g fill="#FFE45C">''' + "".join(f'<circle cx="{x}" cy="{y}" r="5"/>' for x,y in [(90,60),(320,50),(300,130),(100,140),(230,30)]) + '</g>'),
 "냥탐정 셜록캣": svg("#2F3A2E", '''<path d="M140 190q-10-80 60-80t60 80z" fill="#1D1D1D"/><circle cx="200" cy="90" r="40" fill="#1D1D1D"/><path d="M168 64l-6-30 24 18zM232 64l6-30-24 18z" fill="#1D1D1D"/>
<g fill="#F3D35C"><ellipse cx="186" cy="88" rx="7" ry="9"/><ellipse cx="214" cy="88" rx="7" ry="9"/></g>
<path d="M160 52h80l-10-16h-60z" fill="#8A6A3A"/><g transform="translate(290 110)"><circle r="26" fill="none" stroke="#E8E2D2" stroke-width="7"/><path d="M18 18l26 26" stroke="#E8E2D2" stroke-width="9" stroke-linecap="round"/></g>'''),
 "접견": svg("#2B2F33", '''<rect x="0" y="0" width="400" height="220" fill="#3A3F44"/><rect x="40" y="30" width="320" height="130" fill="#9FB7C2" opacity=".35" stroke="#C7D3D8" stroke-width="5"/>
<path d="M200 30v130" stroke="#C7D3D8" stroke-width="5"/><g fill="#C7D3D8">''' + "".join(f'<circle cx="{x}" cy="{y}" r="3"/>' for x in (190,200,210) for y in (90,100,110)) + '''</g>
<rect x="0" y="160" width="400" height="60" fill="#22262A"/><g transform="translate(90 120)"><path d="M0 0q-10 30 10 40h20q-14-20-4-36z" fill="#1D1D1D"/></g><g transform="translate(300 120)"><path d="M0 0q10 30-10 40h-20q14-20 4-36z" fill="#1D1D1D"/></g>'''),
 "만월 <<꿈을 훔치는 요괴>>": svg("#1B1F3A", '''<circle cx="200" cy="96" r="70" fill="#F6E7B0"/><circle cx="200" cy="96" r="70" fill="none" stroke="#FFF6D0" stroke-width="3" opacity=".6"/>
<g fill="#E2554A">''' + "".join(f'<ellipse cx="{x}" cy="{y}" rx="16" ry="22"/>' for x,y in [(60,80),(110,60),(300,60),(345,85)]) + '''</g>
<g stroke="#6B1E1E" stroke-width="2">''' + "".join(f'<path d="M{x} {y-28}v8"/>' for x,y in [(60,80),(110,60),(300,60),(345,85)]) + '''</g>
<path d="M0 190q100-30 200 0t200 0v30H0z" fill="#0F1226"/><path d="M180 150q20-40 40 0q-6 20-20 30q-14-10-20-30z" fill="#0F1226"/><g fill="#F6E7B0"><circle cx="193" cy="150" r="3"/><circle cx="207" cy="150" r="3"/></g>'''),
 "뽀득뽀득": svg("#CFE9F5", '''<g stroke="#fff" stroke-width="4" opacity=".7">''' + "".join(f'<path d="M{x} 0v220"/>' for x in range(0,400,40)) + "".join(f'<path d="M0 {y}h400"/>' for y in range(0,220,40)) + '''</g>
<path d="M60 130h280q0 70-140 70T60 130z" fill="#fff" stroke="#7FB6CF" stroke-width="5"/><path d="M60 130h280" stroke="#7FB6CF" stroke-width="5"/>
<g fill="#fff" stroke="#BFE0EE" stroke-width="3">''' + "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x,y,r in [(110,112,18),(140,100,14),(260,108,20),(290,96,12),(300,60,10),(90,70,8)]) + '''</g>
<g transform="translate(190 92)"><ellipse cx="0" cy="20" rx="34" ry="22" fill="#FFD84D"/><circle cx="20" cy="-4" r="16" fill="#FFD84D"/><path d="M34-6l14 4-14 4z" fill="#FF9A3C"/><circle cx="24" cy="-8" r="3" fill="#1D1D1D"/></g>'''),
}

MOTIF.update({
 "춘단화 : 봄을 잘라낸 꽃": svg("#2A1E24", '''<path d="M40 200C120 150 160 100 230 70" stroke="#5A3A2E" stroke-width="10" fill="none"/>
<g fill="#F4B6C2">''' + "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x,y,r in [(110,150,14),(150,118,12),(190,92,13),(90,175,10)]) + '''</g>
<path d="M230 70l50-30" stroke="#5A3A2E" stroke-width="10" stroke-dasharray="4 10"/><path d="M228 52l22 34" stroke="#E8E2D2" stroke-width="4"/>
<g fill="#F4B6C2" opacity=".8"><circle cx="300" cy="150" r="9"/><circle cx="330" cy="190" r="7"/><circle cx="270" cy="200" r="6"/></g>'''),
 "오모테나시": svg("#1E2A2A", '''<rect y="150" width="400" height="70" fill="#2F4A44"/><path d="M60 150h280l-30-60H90z" fill="#3B2A22"/><path d="M40 92h320l-40-34H80z" fill="#1A1210"/>
<g fill="#F3D9A0" opacity=".85"><rect x="110" y="104" width="40" height="40"/><rect x="180" y="104" width="40" height="40"/><rect x="250" y="104" width="40" height="40"/></g>
<g transform="translate(345 120)"><rect x="-14" y="-10" width="28" height="44" rx="12" fill="#E2554A"/><path d="M0-10v-14" stroke="#1A1210" stroke-width="3"/></g>
<g stroke="#E8E2D2" stroke-width="4" fill="none" opacity=".5"><path d="M150 190q-10-14 0-26t0-26M200 196q-10-14 0-26t0-26"/></g>'''),
 "만찬": svg("#2A1A16", '''<rect y="130" width="400" height="90" fill="#5A2E22"/><ellipse cx="200" cy="150" rx="80" ry="26" fill="#F2EAD8"/><ellipse cx="200" cy="148" rx="54" ry="16" fill="#C9572F"/>
<g transform="translate(320 70)"><path d="M-16 0h32q0 34-16 40-16-6-16-40z" fill="#8B1E2B" opacity=".9"/><path d="M0 40v30M-14 70h28" stroke="#E8E2D2" stroke-width="4"/></g>
<g stroke="#C9C3B4" stroke-width="5" stroke-linecap="round"><path d="M100 120v40M90 120v14M110 120v14"/><path d="M300 125v40"/></g>
<g transform="translate(70 40)"><path d="M0 30v-20M-10 30h20" stroke="#F3D9A0" stroke-width="3"/><path d="M0 10q-6-10 0-18 6 8 0 18z" fill="#FFB347"/></g>'''),
 "황금 감옥 : 와캄": svg("#2A2214", '''<rect x="70" y="30" width="260" height="170" fill="#3E3220"/>
<g stroke="#E8C14B" stroke-width="10">''' + "".join(f'<path d="M{x} 30v170"/>' for x in range(100,320,36)) + '''</g><path d="M70 30h260M70 200h260" stroke="#E8C14B" stroke-width="12"/>
<g transform="translate(200 120)"><circle r="18" fill="#E8C14B"/><rect x="-5" y="10" width="10" height="20" fill="#E8C14B"/></g>'''),
 "잉카": svg("#F2C94C", '''<circle cx="200" cy="70" r="40" fill="#FFF3B0"/><g stroke="#FFF3B0" stroke-width="6">''' + "".join(f'<path d="M{200+55*__import__("math").cos(a/6*3.14159)} {70+55*__import__("math").sin(a/6*3.14159)}L{200+75*__import__("math").cos(a/6*3.14159)} {70+75*__import__("math").sin(a/6*3.14159)}"/>' for a in range(12)) + '''</g>
<g fill="#A0703A" stroke="#6B4423" stroke-width="3"><rect x="80" y="180" width="240" height="40"/><rect x="110" y="150" width="180" height="30"/><rect x="140" y="124" width="120" height="26"/><rect x="175" y="104" width="50" height="20"/></g>
<path d="M190 220v-40h20v40z" fill="#3A2614"/>'''),
 "지프리트의 심장 (동성로점)": svg("#1E2238", '''<g fill="none" stroke="#7A86B8" stroke-width="10" opacity=".6"><circle cx="80" cy="170" r="40" stroke-dasharray="14 10"/><circle cx="330" cy="60" r="32" stroke-dasharray="12 9"/></g>
<path d="M200 40l46 50-46 110-46-110z" fill="#6EE7D8"/><path d="M200 40l46 50h-92z" fill="#B8FFF4"/><path d="M200 200l-46-110h92z" fill="#3FB9AC" opacity=".6"/>
<g fill="#fff">''' + "".join(f'<path d="M{x} {y}l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>' for x,y in [(140,60),(270,140),(250,40)]) + '</g>'),
 "박스오피스": svg("#FF8FB8", '''<g stroke="#1D1D1D" stroke-width="4"><rect x="80" y="120" width="100" height="80" fill="#D9A066"/><rect x="190" y="130" width="90" height="70" fill="#C98E52"/><rect x="120" y="50" width="90" height="70" fill="#E0AE76"/><rect x="290" y="150" width="60" height="50" fill="#D9A066"/></g>
<g stroke="#1D1D1D" stroke-width="3"><path d="M130 120v80M235 130v70M165 50v70"/></g><text x="300" y="80" font-family="sans-serif" font-weight="900" font-size="64" fill="#1D1D1D">?</text>'''),
 "사명 : 투쟁의 노래": svg("#30241E", '''<rect x="60" y="40" width="280" height="160" fill="#3E302A"/>
<g stroke="#9A9AA6" stroke-width="8">''' + "".join(f'<path d="M{x} 40v160"/>' for x in range(90,340,40)) + '''</g>
<g transform="translate(200 130)"><path d="M-22 40v-50q0-12 10-12h24q10 0 10 12v50z" fill="#E2554A" stroke="#1D1D1D" stroke-width="4"/><g fill="#E2554A" stroke="#1D1D1D" stroke-width="3"><rect x="-22" y="-34" width="12" height="20" rx="5"/><rect x="-9" y="-38" width="12" height="24" rx="5"/><rect x="4" y="-36" width="12" height="22" rx="5"/></g></g>'''),
})

def motif(name, genre):
    if name in MOTIF: return MOTIF[name]
    return svg("#3A3F4A", f'<text x="200" y="130" text-anchor="middle" font-size="64">{ {"공포":"👻","감성":"🌙","추리":"🔍","판타지":"✨","코믹":"😂","아케이드":"🕹️"}.get(genre,"🗝️") }</text>')

COVER = '''<svg viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB347"/><stop offset=".55" stop-color="#FF7A45"/><stop offset="1" stop-color="#E2554A"/></linearGradient></defs>
<rect width="1080" height="1350" fill="url(#sky)"/><circle cx="760" cy="520" r="190" fill="#FFE27A"/><circle cx="760" cy="520" r="240" fill="#FFE27A" opacity=".25"/>
<g stroke="#FFE27A" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"><path d="M120 470q30-20 60 0t60 0t60 0"/><path d="M160 540q30-20 60 0t60 0t60 0"/></g>
<path d="M0 820q260-90 540-40t540-20V1350H0z" fill="#B8463C"/>
<g transform="translate(830 560)"><rect x="-9" y="0" width="18" height="250" fill="#5A2A2A"/><ellipse cx="0" cy="40" rx="40" ry="22" fill="#5A2A2A"/><rect x="-4" y="-80" width="8" height="80" fill="#5A2A2A"/><circle cy="-84" r="6" fill="#FFE27A"/></g>
<g fill="#9E3A33">''' + "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{1350-y}"/>' for x,y,w in [(0,900,180),(170,960,140),(860,930,220),(700,990,170)]) + '''</g>
<g fill="#C9573F" stroke="#7A2A24" stroke-width="3"><rect x="300" y="860" width="420" height="490"/></g>
<g stroke="#7A2A24" stroke-width="2" opacity=".6">''' + "".join(f'<path d="M300 {y}h420"/>' for y in range(880,1350,26)) + '''</g>
<g fill="#7A2A24"><path d="M380 860l40-130 40 130z"/><path d="M560 860l40-130 40 130z"/><rect x="430" y="930" width="160" height="200" rx="80"/></g>
<g fill="#FFE27A" opacity=".85"><rect x="330" y="960" width="50" height="70" rx="25"/><rect x="640" y="960" width="50" height="70" rx="25"/></g>
</svg>'''
