"""Gera o banner 3D do README. Uso: python3 scripts/gen_banner.py assets/readme/banner.svg"""
import math
import sys

W, H = 1000, 300
FRAMES = 72          # quadros da rotação do cubo
DUR_ROT = 14         # segundos por volta
OUT = sys.argv[1]

# identidade "Jalapão": capim dourado, duna ao pôr do sol e fervedouro
BG = "#0d0b0a"
INK = "#f4ede3"
MUTED = "#a69a8b"
TEAL = "#f2b33d"     # dourado (nome antigo mantido para não mexer no resto)
SKY = "#ff6a3d"      # duna
VIOLET = "#3fd6b8"   # fervedouro


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


# ---------- cubo + octaedro em wireframe, projeção em perspectiva ----------
CX, CY = 840, 108
FOCAL = 420
CAM = 5.2


def rot(p, ay, ax, az=0.0):
    x, y, z = p
    # Y
    x, z = x * math.cos(ay) + z * math.sin(ay), -x * math.sin(ay) + z * math.cos(ay)
    # X
    y, z = y * math.cos(ax) - z * math.sin(ax), y * math.sin(ax) + z * math.cos(ax)
    # Z
    x, y = x * math.cos(az) - y * math.sin(az), x * math.sin(az) + y * math.cos(az)
    return x, y, z


def proj(p, scale):
    x, y, z = p
    k = FOCAL / (CAM + z)
    return CX + x * k * scale, CY + y * k * scale, z


cube_v = [(x, y, z) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
cube_e = [(a, b) for a in range(8) for b in range(a + 1, 8)
          if sum(1 for i in range(3) if cube_v[a][i] != cube_v[b][i]) == 1]
oct_v = [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]
oct_e = [(a, b) for a in range(6) for b in range(a + 1, 6) if a // 2 != b // 2]


def frames_for(verts, scale, sign, tilt):
    out = []
    for i in range(FRAMES + 1):
        t = i / FRAMES * 2 * math.pi
        out.append([proj(rot(v, sign * t, tilt, sign * t * 0.5 if sign < 0 else 0.0), scale)
                    for v in verts])
    return out


def edge_paths(frames, edges, color, width, op_near, op_far):
    parts = []
    for a, b in edges:
        ds, ops = [], []
        for fr in frames:
            (x1, y1, z1), (x2, y2, z2) = fr[a], fr[b]
            ds.append(f"M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}")
            depth = ((z1 + z2) / 2 + 1.75) / 3.5          # 0 = perto, 1 = longe
            depth = min(max(depth, 0), 1)
            ops.append(f"{op_near - (op_near - op_far) * depth:.2f}")
        parts.append(
            f'<path d="{ds[0]}" stroke="{color}" stroke-width="{width}" stroke-linecap="round">'
            f'<animate attributeName="d" dur="{DUR_ROT}s" repeatCount="indefinite" values="{";".join(ds)}"/>'
            f'<animate attributeName="stroke-opacity" dur="{DUR_ROT}s" repeatCount="indefinite" values="{";".join(ops)}"/>'
            f'</path>')
    return "\n".join(parts)


def vertex_dots(frames, color, r):
    parts = []
    for vi in range(len(frames[0])):
        cx = ";".join(f(fr[vi][0]) for fr in frames)
        cy = ";".join(f(fr[vi][1]) for fr in frames)
        rs = ";".join(f(r * (1.35 - 0.35 * (fr[vi][2] + 1.75) / 3.5)) for fr in frames)
        parts.append(
            f'<circle r="{r}" fill="{color}" filter="url(#glow)">'
            f'<animate attributeName="cx" dur="{DUR_ROT}s" repeatCount="indefinite" values="{cx}"/>'
            f'<animate attributeName="cy" dur="{DUR_ROT}s" repeatCount="indefinite" values="{cy}"/>'
            f'<animate attributeName="r" dur="{DUR_ROT}s" repeatCount="indefinite" values="{rs}"/>'
            f'</circle>')
    return "\n".join(parts)


cube_frames = frames_for(cube_v, 0.56, 1, -0.5)
oct_frames = frames_for(oct_v, 0.44, -1, 0.35)

# ---------- piso em perspectiva (estilo synthwave) ----------
HORIZON = 206
FLOOR_BOTTOM = 286
VP_X = 500
floor = []
for i in range(-22, 23):
    x_far = VP_X + i * 14
    x_near = VP_X + i * 120
    floor.append(f'<line x1="{x_far}" y1="{HORIZON}" x2="{x_near}" y2="{FLOOR_BOTTOM + 60}"/>')

# linhas horizontais andando em direção à câmera: y = horizonte + K / z
K = 800
Z0, DZ, N = 10.0, 7.0, 16
STEPS = 30
for j in range(N):
    ys = []
    for s in range(STEPS + 1):
        z = Z0 + (j - s / STEPS) * DZ
        ys.append(f(HORIZON + K / z) if z > 0.5 else f(FLOOR_BOTTOM + 200))
    vals = ";".join(ys)
    floor.append(
        f'<line x1="0" x2="{W}" y1="{ys[0]}" y2="{ys[0]}">'
        f'<animate attributeName="y1" dur="2.4s" repeatCount="indefinite" values="{vals}"/>'
        f'<animate attributeName="y2" dur="2.4s" repeatCount="indefinite" values="{vals}"/>'
        f'</line>')
floor_svg = "\n".join(floor)

# ---------- título com extrusão 3D (camadas deslocadas que fazem "parallax") ----------
TITLE = "GABRIEL DE SÁ MENDES"
TX, TY = 60, 128
DEPTH = 9
layers = []
for i in range(DEPTH, 0, -1):
    mix = i / DEPTH
    # do teal escuro (perto da face) ao azul-noite (fundo da extrusão)
    r = int(0x6b + (0x1c - 0x6b) * mix)
    g = int(0x32 + (0x10 - 0x32) * mix)
    b = int(0x12 + (0x0a - 0x12) * mix)
    color = f"#{r:02x}{g:02x}{b:02x}"
    dx = i * 0.9
    dy = i * 0.9
    layers.append(
        f'<text x="{TX}" y="{TY}" fill="{color}">{TITLE}'
        f'<animateTransform attributeName="transform" type="translate" dur="9s" repeatCount="indefinite" '
        f'calcMode="spline" keyTimes="0;0.5;1" keySplines=".45 0 .55 1;.45 0 .55 1" '
        f'values="{f(dx)} {f(dy)};{f(-dx)} {f(dy)};{f(dx)} {f(dy)}"/></text>')
title_layers = "\n".join(layers)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Gabriel de Sá Mendes — Desenvolvedor Full Stack. Sistemas, APIs e automações. Do conceito ao deploy.">
<!-- Gerado por um script; animação 100% SMIL/CSS para funcionar dentro do README do GitHub. -->
<style>
  .sans {{ font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; }}
  .mono {{ font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }}
  .serif {{ font-family: Georgia, 'Times New Roman', serif; }}
  .fade-up {{ opacity: 0; animation: fadeUp .9s ease-out forwards; }}
  .d1 {{ animation-delay: .15s; }} .d2 {{ animation-delay: .4s; }}
  .d3 {{ animation-delay: .75s; }} .d4 {{ animation-delay: 1.05s; }}
  .rule {{ transform-box: fill-box; transform-origin: left center; transform: scaleX(0);
          animation: expand 1.1s cubic-bezier(.22,1,.36,1) .6s forwards; }}
  .float {{ animation: float 6s ease-in-out infinite; }}
  .shadow {{ transform-box: fill-box; transform-origin: center; animation: shadow 6s ease-in-out infinite; }}
  .pulse {{ animation: pulse 4s ease-in-out infinite; }}
  .blink {{ animation: blink 1.6s steps(1) infinite; }}
  @keyframes fadeUp {{ from {{ opacity: 0; transform: translateY(12px); }} to {{ opacity: 1; transform: none; }} }}
  @keyframes expand {{ to {{ transform: scaleX(1); }} }}
  @keyframes float {{ 0%,100% {{ transform: translateY(-6px); }} 50% {{ transform: translateY(6px); }} }}
  @keyframes shadow {{ 0%,100% {{ transform: scale(.82); opacity: .35; }} 50% {{ transform: scale(1); opacity: .6; }} }}
  @keyframes pulse {{ 0%,100% {{ opacity: .45; }} 50% {{ opacity: .8; }} }}
  @keyframes blink {{ 50% {{ opacity: 0; }} }}
  @media (prefers-reduced-motion: reduce) {{
    .fade-up, .rule {{ animation: none; opacity: 1; transform: none; }}
    .float, .shadow, .pulse, .blink {{ animation: none; }}
  }}
</style>
<defs>
  <linearGradient id="face" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffd27a"/>
    <stop offset=".45" stop-color="{TEAL}"/>
    <stop offset="1" stop-color="{SKY}"/>
  </linearGradient>
  <linearGradient id="shine" y1="0" y2="0" gradientUnits="userSpaceOnUse" x1="-300" x2="-60">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity=".55"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="1300 0" dur="5s" begin="1.5s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{BG}" stop-opacity="1"/>
    <stop offset=".35" stop-color="{BG}" stop-opacity=".55"/>
    <stop offset="1" stop-color="{BG}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="sideFade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{BG}" stop-opacity="1"/>
    <stop offset=".18" stop-color="{BG}" stop-opacity="0"/>
    <stop offset=".82" stop-color="{BG}" stop-opacity="0"/>
    <stop offset="1" stop-color="{BG}" stop-opacity="1"/>
  </linearGradient>
  <radialGradient id="halo">
    <stop offset="0" stop-color="{SKY}" stop-opacity=".3"/>
    <stop offset=".6" stop-color="{SKY}" stop-opacity=".06"/>
    <stop offset="1" stop-color="{SKY}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="horizonGlow" cx=".5" cy="1" r=".6">
    <stop offset="0" stop-color="{SKY}" stop-opacity=".22"/>
    <stop offset="1" stop-color="{SKY}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{TEAL}"/>
    <stop offset="1" stop-color="{SKY}"/>
  </linearGradient>
  <clipPath id="sky"><rect x="0" y="0" width="{W}" height="{HORIZON}"/></clipPath>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="frame"><rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="14"/></clipPath>
  <clipPath id="floorClip"><rect x="0" y="{HORIZON}" width="{W}" height="{H - HORIZON}"/></clipPath>
</defs>

<g clip-path="url(#frame)">
  <rect width="{W}" height="{H}" fill="{BG}"/>

  <!-- brilho no horizonte -->
  <rect x="0" y="{HORIZON - 90}" width="{W}" height="90" fill="url(#horizonGlow)" class="pulse"/>

  <!-- piso em perspectiva -->
  <g clip-path="url(#floorClip)" stroke="{TEAL}" stroke-opacity=".28" stroke-width="1">
{floor_svg}
  </g>
  <rect x="0" y="{HORIZON}" width="{W}" height="{H - HORIZON}" fill="url(#floorFade)"/>
  <rect x="0" y="{HORIZON}" width="{W}" height="{H - HORIZON}" fill="url(#sideFade)"/>
  <line x1="0" y1="{HORIZON}" x2="{W}" y2="{HORIZON}" stroke="{TEAL}" stroke-opacity=".35"/>

  <!-- sol nascendo no horizonte, com faixas -->
  <g clip-path="url(#sky)">
    <circle cx="{CX}" cy="{HORIZON}" r="78" fill="url(#sun)" opacity=".9"/>
    <g fill="{BG}">
      <rect x="{CX - 80}" y="{HORIZON - 9}" width="160" height="5"/>
      <rect x="{CX - 80}" y="{HORIZON - 21}" width="160" height="4"/>
      <rect x="{CX - 80}" y="{HORIZON - 33}" width="160" height="3"/>
      <rect x="{CX - 80}" y="{HORIZON - 45}" width="160" height="2"/>
    </g>
  </g>

  <!-- sombra do cubo no piso -->
  <ellipse class="shadow" cx="{CX}" cy="{HORIZON + 22}" rx="52" ry="6" fill="{SKY}" opacity=".3" filter="url(#glow)"/>

  <!-- cubo + octaedro girando em 3D -->
  <g class="float">
    <circle cx="{CX}" cy="{CY}" r="95" fill="url(#halo)" class="pulse"/>
    <g fill="none">
{edge_paths(oct_frames, oct_e, VIOLET, 1.4, 0.95, 0.25)}
{edge_paths(cube_frames, cube_e, TEAL, 2, 1.0, 0.22)}
    </g>
{vertex_dots(cube_frames, TEAL, 2.6)}
  </g>

  <!-- textos -->
  <text class="mono fade-up d1" x="{TX + 2}" y="62" font-size="12" letter-spacing="5" fill="{MUTED}">DESENVOLVEDOR FULL STACK</text>

  <g class="sans fade-up d2" font-size="50" font-weight="800" letter-spacing="1">
{title_layers}
    <text x="{TX}" y="{TY}" fill="url(#face)">{TITLE}</text>
    <text x="{TX}" y="{TY}" fill="url(#shine)">{TITLE}</text>
  </g>

  <rect class="rule" x="{TX + 2}" y="149" width="298" height="1.5" fill="url(#face)"/>
  <rect class="fade-up d3" x="{TX + 306}" y="145" width="9" height="9" transform="rotate(45 {TX + 310.5} 149.5)" fill="none" stroke="{SKY}"/>

  <text class="serif fade-up d3" x="{TX + 2}" y="178" font-size="19" font-style="italic" fill="{INK}">Sistemas, APIs e automações. Do conceito ao deploy.<tspan class="blink" fill="{TEAL}" font-style="normal"> ▍</tspan></text>

  <text class="mono fade-up d4" x="{W // 2}" y="{H - 16}" text-anchor="middle" font-size="10" letter-spacing="4" fill="{MUTED}">PALMAS · TOCANTINS · BRASIL</text>
</g>

<rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="14" fill="none" stroke="{TEAL}" stroke-opacity=".25"/>
<rect x="12" y="12" width="{W - 24}" height="{H - 24}" rx="8" fill="none" stroke="{TEAL}" stroke-opacity=".1"/>
</svg>
'''

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(svg)
print(OUT, len(svg.encode()) // 1024, "KB")
