"""Икони за визуализатора (docs/audio/), без зависимости: python3 src/audio/icon.py

Светеща вълнообразна окръжност (кръговата вълна от „Вихрушка“), преливаща от синьо през виолетово
към розово, със сияние и по-бледа вътрешна вълна, върху тъмносин фон. PNG кодерът и смаляването са от
src/icon.py (иконите на играта). Пише в docs/audio/ (папката не се генерира от build.py — файловете се commit-ват):
  apple-touch-icon.png 180, icon-192.png, icon-512.png, icon-maskable-192/512.png (вълната в безопасните 80 %)
и отпечатва SVG пътя за фавиконата (вграден в docs/audio/index.html).
"""
import math, os, sys
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from icon import shrink, png

def R(a):            # радиус на вълната (част от половината размер) при ъгъл a
    return 0.62 * (1 + 0.085 * math.sin(6 * a + 0.4) + 0.035 * math.sin(11 * a + 1.3))

def dR(a):
    return 0.62 * (0.085 * 6 * math.cos(6 * a + 0.4) + 0.035 * 11 * math.cos(11 * a + 1.3))

STOPS = [(90, 230, 255), (150, 140, 255), (235, 120, 220), (120, 200, 255), (90, 230, 255)]

def grad(a):         # цвят по ъгъла — плавно по кръга
    t = (a / (2 * math.pi)) % 1 * (len(STOPS) - 1); i = int(t); f = t - i; f = f * f * (3 - 2 * f)
    return tuple(STOPS[i][k] + (STOPS[i + 1][k] - STOPS[i][k]) * f for k in range(3))

def mix(c, col, a):
    return tuple(c[i] + (col[i] - c[i]) * a for i in range(3))

def render(S, fit=1.0):
    h = S / 2; out = []
    half, glow = 0.028 * h * fit, 0.16 * h * fit                  # дебелина на линията и сиянието
    for y in range(S):
        row = []
        for x in range(S):
            g = y / S
            c = (10 - 4 * g, 13 - 6 * g, 26 - 10 * g)               # тъмносин фон
            px, py = (x + 0.5 - h) / (h * fit), (y + 0.5 - h) / (h * fit)
            r, a = math.hypot(px, py), math.atan2(py, px)
            c = mix(c, (52, 30, 90), max(0.0, 1 - r / 1.1) ** 2 * 0.5)   # виолетов ореол
            col = grad(a)
            for k, amp in ((1.0, 1.0), (0.55, 0.38)):             # основна и вътрешна (по-бледа) вълна
                rr = R(a) * k; d = abs(r - rr) / math.sqrt(1 + (dR(a) * k / max(r, rr * 0.7)) ** 2) * h * fit
                c = mix(c, col, math.exp(-(abs(r - rr) * h * fit / glow) ** 2) * 0.35 * amp * min(1.0, r / 0.3) ** 2)   # сиянието — по радиуса (без лъчи в средата)
                if d < half + 1.5:                                  # линията — с 3×3 подточки
                    cov = 0.0
                    for sy in range(3):
                        for sx in range(3):
                            qx, qy = (x + (sx + .5) / 3 - h) / (h * fit), (y + (sy + .5) / 3 - h) / (h * fit)
                            qr, qa = math.hypot(qx, qy), math.atan2(qy, qx)
                            qd = abs(qr - R(qa) * k) / math.sqrt(1 + (dR(qa) * k / max(qr, R(qa) * k * 0.7)) ** 2) * h * fit
                            if qd <= half: cov += 1 / 9
                    if cov: c = mix(c, mix(col, (255, 255, 255), 0.45 * max(0.0, 1 - d / half)), cov * amp)
            row.append(c)
        out.append(row)
    return out

def svg_path(n=96):
    pts = [(16 + 15 * R(2 * math.pi * i / n) * math.cos(2 * math.pi * i / n), 16 + 15 * R(2 * math.pi * i / n) * math.sin(2 * math.pi * i / n)) for i in range(n)]
    return 'M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'

if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'docs', 'audio')
    full, mask = render(512), render(512, fit=0.8)
    for name, img in [('apple-touch-icon.png', shrink(full, 180)), ('icon-192.png', shrink(full, 192)), ('icon-512.png', full),
                      ('icon-maskable-192.png', shrink(mask, 192)), ('icon-maskable-512.png', mask)]:
        open(os.path.join(folder, name), 'wb').write(png(img))
    print(svg_path())
