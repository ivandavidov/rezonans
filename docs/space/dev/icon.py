"""Иконите на „Резонанс в космоса“ (пуска се на ръка при промяна; нужен е numpy).

Корабът „Камертон“ (същите многоъгълници като в js/art.js) в неоново синьо върху тъмен фон със звезди.
  apple-touch-icon.png   180×180  iPhone („Добави към началния екран“)
  icon-192.png, icon-512.png       Android, purpose „any“
  icon-maskable-192/512.png        Android, purpose „maskable“ — корабът е в безопасния кръг (80 %)
Рисува се в 1024 и се смалява.
  python3 dev/icon.py
"""
import os, struct, zlib
import numpy as np

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
HULL = [(-30, 0), (-24, -7), (-8, -9), (6, -6), (13, 0), (6, 6), (-8, 9), (-24, 7)]
TINE = [(-2, -8), (8, -13.5), (30, -11.5), (34, -9.2), (30, -7), (10, -7)]
WING = [(-9, -9), (-21, -19.5), (-31, -20), (-25, -7.5)]
mir = lambda P: [(x, -y) for x, y in P]
POLYS = [HULL, TINE, mir(TINE), WING, mir(WING)]
ACCENT = [((10, -7), (30, -7)), ((10, 7), (30, 7)), ((-21, -19.5), (-31, -20)), ((-21, 19.5), (-31, 20)), ((30, -11.5), (34, -9.2)), ((30, 11.5), (34, 9.2))]
CY = np.array([0.40, 0.94, 1.0])

def inside(X, Y, P):
    c = np.zeros(X.shape, bool)
    for i in range(len(P)):
        (x1, y1), (x2, y2) = P[i], P[(i + 1) % len(P)]
        cond = (y1 > Y) != (y2 > Y)
        xi = (x2 - x1) * (Y - y1) / ((y2 - y1) if y2 != y1 else 1e-9) + x1
        c ^= cond & (X < xi)
    return c

def segd(X, Y, a, b):
    ax, ay = a; bx, by = b; vx, vy = bx - ax, by - ay
    t = np.clip(((X - ax) * vx + (Y - ay) * vy) / (vx * vx + vy * vy), 0, 1)
    return np.hypot(ax + vx * t - X, ay + vy * t - Y)

def render(N, fit):
    """RGB N×N (float 0..1); fit — дял от ширината, който заема корабът."""
    j, i = np.meshgrid(np.arange(N), np.arange(N))
    u = (j + 0.5) / N - 0.5; v = (i + 0.5) / N - 0.5
    r = np.hypot(u, v)
    img = np.zeros((N, N, 3))
    img += np.array([0.035, 0.08, 0.15]) * np.clip(1 - r * 1.6, 0, 1)[..., None] + np.array([0.012, 0.018, 0.035])
    rng = np.random.default_rng(7)  # звезди
    for _ in range(70):
        sx, sy, b = rng.random(), rng.random(), rng.random() ** 3
        d2 = ((j / N - sx) ** 2 + (i / N - sy) ** 2) * N * N
        img += (0.25 + 0.9 * b) * np.exp(-d2 / (0.8 + 2.5 * b) / (N / 512) ** 2)[..., None] * np.array([0.8, 0.9, 1.0])
    s = N * fit / 66.0
    X = u * N / s + 1.5; Y = v * N / s   # единици на кораба (центърът е малко вдясно от носа)
    px = 1.0 / s
    fill = np.zeros(X.shape, bool)
    for P in POLYS: fill |= inside(X, Y, P)
    d = np.full(X.shape, 1e9)
    for P in POLYS:
        for k in range(len(P)): d = np.minimum(d, segd(X, Y, P[k], P[(k + 1) % len(P)]))
    da = np.full(X.shape, 1e9)
    for a, b in ACCENT: da = np.minimum(da, segd(X, Y, a, b))
    # пламък и излъчвател
    img += np.array([0.3, 0.8, 1.0]) * (0.9 * np.exp(-(((X + 40) / 11) ** 2 + (Y / 3.2) ** 2)))[..., None]
    body = (np.array([0.10, 0.17, 0.30]) * np.clip(1 - (Y + 12) / 30, 0.25, 1)[..., None])
    img = np.where(fill[..., None], body, img)
    glow = 0.38 * np.exp(-d / 3.2) + 0.75 * np.exp(-da / 3.0)
    core = np.clip(1.3 - d / (1.1 * max(px, 0.35)), 0, 1) * 0.6 + np.clip(1.4 - da / (1.2 * max(px, 0.35)), 0, 1)
    img += CY * glow[..., None] + np.array([0.75, 0.98, 1.0]) * np.clip(core, 0, 1)[..., None]
    img += np.array([0.7, 1.0, 1.0]) * (1.1 * np.exp(-(((X - 27) / 4) ** 2 + (Y / 4) ** 2)))[..., None]
    img += np.array([0.6, 0.95, 1.0]) * (0.8 * np.exp(-(((X + 5) / 6) ** 2 + (Y / 2.4) ** 2)))[..., None]
    return np.clip(img, 0, 1)

def png(path, rgb):
    h, w, _ = rgb.shape
    raw = b''.join(b'\0' + bytes(row) for row in (rgb * 255 + 0.5).astype(np.uint8).reshape(h, w * 3))
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def down(img, n):
    k = img.shape[0] // n
    return img[:n * k, :n * k].reshape(n, k, n, k, 3).mean(axis=(1, 3))

if __name__ == '__main__':
    big = render(1024, 0.78); mask = render(1024, 0.6)
    for name, src, n in [('apple-touch-icon.png', big, 180), ('icon-192.png', big, 192), ('icon-512.png', big, 512), ('icon-maskable-192.png', mask, 192), ('icon-maskable-512.png', mask, 512)]:
        png(os.path.join(OUT, name), down(src, n) if 1024 % n == 0 else np.array([[src[int(y * 1024 / n), int(x * 1024 / n)] for x in range(n)] for y in range(n)]))
        print(name, n)
