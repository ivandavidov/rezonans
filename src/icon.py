"""Икони за начален екран, без зависимости (build.py: icon.write_all(папка)).

Вълната от фавиконата (path „M3 16h5l3-9 5 18 4-14 3 5h6“ в кутия 32×32) — кехлибарена, със сияние
и зелено/червено отместване като заглавието на играта, върху тъмен фон. Непрозрачни квадрати:
iOS и Android сами заоблят/изрязват формата.
  apple-touch-icon.png      180×180  iPhone („Добави към началния екран“)
  icon-192.png, icon-512.png         Android, purpose „any“ (manifest)
  icon-maskable-192/512.png          Android, purpose „maskable“ — вълната е в безопасния кръг (80 %)
  mac_icns(път)                      macOS: заоблен квадрат 824/1024 със сянка, прозрачни полета (src/mac/make_app.py)
  win_ico(път)                       Windows: заоблен квадрат почти до ръба, 16–256 (src/win/make_exe.py)
Рисува се в 512 и се смалява; прерисува се само ако icon.py е по-нов от файловете.
"""
import math, os, struct, zlib

WAVE = [(3, 16), (8, 16), (11, 7), (16, 25), (20, 11), (23, 16), (29, 16)]

def _dist(px, py, segs):
    best = 1e9
    for (ax, ay), (bx, by) in segs:
        vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
        t = max(0.0, min(1.0, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
        d = math.hypot(wx - t * vx, wy - t * vy)
        if d < best: best = d
    return best

def _mix(c, col, a):
    return tuple(c[i] + (col[i] - c[i]) * a for i in range(3))

def render(S, fit=1.0):
    """RGB редове S×S; fit < 1 смалява вълната към центъра (за maskable)."""
    k = S / 32 * fit
    def segs(dx=0.0, dy=0.0):
        pts = [(S / 2 + (x + dx - 16) * k, S / 2 + (y + dy - 16) * k) for x, y in WAVE]
        return list(zip(pts, pts[1:]))
    main, green, red = segs(), segs(-0.35, -0.1), segs(0.35, 0.15)
    half, glow = 1.5 * k, 15 * S / 180 * fit    # дебелина на линията — както във фавиконата
    amber, hot = (255, 166, 43), (255, 214, 140)
    out = []
    for y in range(S):
        row = []
        for x in range(S):
            # фон: тъмен вертикален градиент с лек кехлибарен ореол в центъра
            g = y / S
            c = (14 - 8 * g, 19 - 11 * g, 23 - 14 * g)
            r = math.hypot(x - S / 2, y - S / 2) / (S / 2)
            c = _mix(c, (60, 36, 8), max(0.0, 1 - r) ** 2 * 0.55)
            cx, cy = x + 0.5, y + 0.5
            d = _dist(cx, cy, main)
            c = _mix(c, amber, math.exp(-(d / glow) ** 2) * 0.32)        # сияние
            for sg, col, a in ((green, (120, 255, 90), 0.5), (red, (255, 70, 50), 0.45)):
                c = _mix(c, col, max(0.0, min(1.0, half - _dist(cx, cy, sg) + 0.5)) * a)
            cov = 0.0                           # линията — с 3×3 подточки за гладки ръбове
            if d < half + 1.5:
                for sy in range(3):
                    for sx in range(3):
                        if _dist(x + (sx + 0.5) / 3, y + (sy + 0.5) / 3, main) <= half: cov += 1 / 9
            if cov:
                c = _mix(c, _mix(amber, hot, max(0.0, 1 - d / half) * 0.6), cov)
            row.append(c)
        out.append(row)
    return out

def shrink(img, T):
    """смаляване с усредняване по площ (RGB или RGBA с предварително умножена прозрачност)"""
    S = len(img); f = S / T; out = []; n = len(img[0][0])
    for ty in range(T):
        y0, y1 = ty * f, (ty + 1) * f; row = []
        for tx in range(T):
            x0, x1 = tx * f, (tx + 1) * f; acc = [0.0] * n; wsum = 0.0
            for sy in range(int(y0), min(S, math.ceil(y1))):
                wy = min(y1, sy + 1) - max(y0, sy)
                for sx in range(int(x0), min(S, math.ceil(x1))):
                    w = wy * (min(x1, sx + 1) - max(x0, sx)); p = img[sy][sx]
                    if n == 4: w *= p[3] / 255; acc[3] += w * 255
                    acc[0] += p[0] * w; acc[1] += p[1] * w; acc[2] += p[2] * w; wsum += w if n == 3 else 0
            if n == 4: a = acc[3] / (f * f); row.append(tuple(v / (acc[3] / 255) for v in acc[:3]) + (a,) if acc[3] else (0, 0, 0, 0))
            else: row.append(tuple(v / wsum for v in acc))
        out.append(row)
    return out

def png(img):
    S = len(img)
    raw = b''.join(b'\x00' + bytes(max(0, min(255, round(v))) for p in row for v in p) for row in img)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', S, S, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def png4(img):
    S = len(img)
    raw = b''.join(b'\x00' + bytes(max(0, min(255, round(v))) for p in row for v in p) for row in img)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', S, S, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def mac_icon(S=1024, inner=824 / 1024, rr=0.2237, shadow=0.3):
    """иконата за macOS по шаблона на Apple: заоблен квадрат 824/1024, мека сянка отдолу, прозрачно около него"""
    A = round(S * inner); h, rad, off = A / 2, A * rr, (S - A) // 2
    art = render(A)
    def sd(px, py):                             # разстояние до заобления квадрат (отрицателно вътре)
        qx, qy = abs(px) - (h - rad), abs(py) - (h - rad)
        return math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - rad
    img = []
    for y in range(S):
        row = []
        for x in range(S):
            px, py = x + 0.5 - S / 2, y + 0.5 - S / 2
            cov = max(0.0, min(1.0, 0.5 - sd(px, py)))
            sh = shadow * max(0.0, min(1.0, 0.5 - sd(px, py - S * 0.012) / (S * 0.022))) if shadow else 0.0
            a = cov + sh * (1 - cov)
            if not a: row.append((0, 0, 0, 0)); continue
            c = art[min(A - 1, max(0, y - off))][min(A - 1, max(0, x - off))] if cov else (0, 0, 0)
            row.append(tuple(v * cov / a for v in c) + (a * 255,))
        img.append(row)
    return img

def mac_icns(path):
    """AppIcon.icns (iconutil); прерисува се само ако icon.py е по-нов"""
    import shutil, subprocess, tempfile
    if os.path.exists(path) and os.path.getmtime(path) >= os.path.getmtime(__file__): return
    img = mac_icon(1024); sizes = {1024: img}
    for n in (512, 256, 128, 64, 32, 16): sizes[n] = shrink(sizes[n * 2], n)
    d = tempfile.mkdtemp(); iset = os.path.join(d, 'AppIcon.iconset'); os.mkdir(iset)
    for n in (16, 32, 128, 256, 512):
        open(os.path.join(iset, f'icon_{n}x{n}.png'), 'wb').write(png4(sizes[n]))
        open(os.path.join(iset, f'icon_{n}x{n}@2x.png'), 'wb').write(png4(sizes[n * 2]))
    subprocess.run(['iconutil', '-c', 'icns', iset, '-o', path], check=True); shutil.rmtree(d)

FILES = ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png']

def write_all(folder):
    paths = [os.path.join(folder, f) for f in FILES]
    if all(os.path.exists(p) and os.path.getmtime(p) >= os.path.getmtime(__file__) for p in paths): return
    full, mask = render(512), render(512, fit=0.8)   # 0.8: краищата на вълната (с дебелината) са на 185 px от центъра < 205 (40 %)
    for name, img in [('apple-touch-icon.png', shrink(full, 180)), ('icon-192.png', shrink(full, 192)), ('icon-512.png', full),
                      ('icon-maskable-192.png', shrink(mask, 192)), ('icon-maskable-512.png', mask)]:
        open(os.path.join(folder, name), 'wb').write(png(img))

def win_ico(path):
    """icon.ico с PNG вътре (Windows Vista+); прерисува се само ако icon.py е по-нов"""
    if os.path.exists(path) and os.path.getmtime(path) >= os.path.getmtime(__file__): return
    big = mac_icon(256, inner=240 / 256, rr=0.18, shadow=0); imgs = [png4(big)]
    for n in (64, 48, 32, 24, 16): imgs.append(png4(shrink(big, n)))
    sizes = [256, 64, 48, 32, 24, 16]
    head = struct.pack('<HHH', 0, 1, len(imgs)); off = 6 + 16 * len(imgs); ents = b''
    for n, d in zip(sizes, imgs):
        ents += struct.pack('<BBBBHHII', n % 256, n % 256, 0, 0, 1, 32, len(d), off); off += len(d)
    open(path, 'wb').write(head + ents + b''.join(imgs))

if __name__ == '__main__':
    import sys
    write_all(sys.argv[1] if len(sys.argv) > 1 else '.')
