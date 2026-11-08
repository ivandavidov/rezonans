"""Проверка, че папката е самостоятелна (може да се мести навсякъде):
  - 0 пътища извън папката: '../', абсолютни '/…', 'http(s)://' в src/href/url()
  - 0 Math.random в логиката (js/sim/, js/levels/, js/core.js) — тя е детерминирана
  - всеки файл, зареден от index.html, съществува
  - няма ES модули/fetch/import (не работят при отваряне от file://)
  python3 dev/check.py
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
bad = []

def files(ext):
    for d, _, fs in os.walk(ROOT):
        if os.sep + 'dev' in d[len(ROOT):]: continue
        for f in fs:
            if f.endswith(ext): yield os.path.join(d, f)

html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
refs = re.findall(r'(?:src|href)="([^"]+)"', html)
for r in refs:
    if r.startswith('data:'): continue
    if r.startswith(('/', 'http:', 'https:', '//')) or '..' in r: bad.append('index.html: път навън: ' + r)
    elif not os.path.exists(os.path.join(ROOT, r)): bad.append('index.html: липсва файл: ' + r)

import json
man = json.load(open(os.path.join(ROOT, 'manifest.webmanifest'), encoding='utf-8'))
for ic in man['icons']:
    if ic['src'].startswith(('/', 'http')) or '..' in ic['src'] or not os.path.exists(os.path.join(ROOT, ic['src'])): bad.append('manifest: икона навън или липсва: ' + ic['src'])
for k in ('start_url', 'scope', 'id'):
    if man.get(k) != './': bad.append('manifest: %s не е ./' % k)
for m in re.findall(r"href=\"([^\"]+\.webmanifest)\"", html):
    if not os.path.exists(os.path.join(ROOT, m)): bad.append('index.html: липсва ' + m)
for p in list(files('.js')) + list(files('.css')) + list(files('.webmanifest')):
    s = open(p, encoding='utf-8').read(); rel = os.path.relpath(p, ROOT)
    if p.endswith('.css'):
        for u in re.findall(r'url\(([^)]+)\)', s):
            u = u.strip('\'"')
            if not u.startswith('data:'): bad.append(rel + ': url навън: ' + u[:60])
    else:
        for m in re.finditer(r'https?://(?!www\.w3\.org/2000/svg)[^\s\'"`)]+', s): bad.append(rel + ': адрес навън: ' + m.group(0)[:60])
        if re.search(r'\b(fetch\(|import\s*\(|XMLHttpRequest|type="module")', s): bad.append(rel + ': fetch/import/модул (не работи от file://)')
    if rel.startswith(('js/sim', 'js/levels')) or rel == os.path.join('js', 'core.js'):
        n = len(re.findall(r'Math\.random', re.sub(r'//[^\n]*', '', s)))
        if n: bad.append(rel + ': Math.random ×%d в логиката' % n)

n_js = len(re.findall(r'<script src=', html))
print('файлове от index.html: %d (скриптове %d), всички в папката' % (len([r for r in refs if not r.startswith('data:')]), n_js))
if bad:
    print('\n'.join('✗ ' + b for b in bad)); sys.exit(1)
print('✓ 0 пътища навън, 0 Math.random в логиката, 0 fetch/import')
