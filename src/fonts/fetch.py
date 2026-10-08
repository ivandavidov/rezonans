#!/usr/bin/env python3
"""Еднократно изтегляне на шрифтовете за офлайн сборката (build.py --offline, Mac приложението).

  python3 src/fonts/fetch.py

Шрифтовете на всички части (основните + `fonts` от games/*/game.json) се теглят от Google Fonts
като woff2 — само кирилица и латиница — в src/fonts/files/, описанието им отива в src/fonts/fonts.css,
а лицензите (SIL OFL) — в src/fonts/licenses/. Пуска се отново само ако някоя част смени шрифта си.
"""
import glob, json, os, re, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
BASE = ['IBM Plex Mono:wght@400;600', 'Russo One']
SUBSETS = {'cyrillic', 'latin'}   # разширените не съдържат нищо, което играта ползва
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()

def families():
    fams = list(BASE)
    for p in sorted(glob.glob(os.path.join(SRC, 'games', '*', 'game.json'))):
        for f in json.load(open(p, encoding='utf-8')).get('fonts', []):
            if f not in fams: fams.append(f)
    return fams

def main():
    os.makedirs(os.path.join(HERE, 'files'), exist_ok=True); os.makedirs(os.path.join(HERE, 'licenses'), exist_ok=True)
    for f in glob.glob(os.path.join(HERE, 'files', '*.woff2')): os.remove(f)
    seen = {}   # променливите шрифтове дават един файл за няколко дебелини
    out, total = ['/* генерира се от fetch.py — Google Fonts, SIL Open Font License (виж licenses/) */'], 0
    for fam in families():
        css = get('https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(fam, safe=':;@') + '&display=swap').decode()
        name = fam.split(':')[0]; slug = name.lower().replace(' ', '')
        for subset, block in re.findall(r'/\* ([\w-]+) \*/\s*(@font-face\s*\{[^}]*\})', css):
            if subset not in SUBSETS: continue
            url = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
            w = re.search(r'font-weight:\s*(\d+)', block).group(1)
            fn = seen.get(url)
            if not fn:
                fn = seen[url] = f'{slug}-{w}-{subset}.woff2'; data = get(url); total += len(data)
                open(os.path.join(HERE, 'files', fn), 'wb').write(data)
            out.append(f'/* {subset} */\n' + block.replace(url, 'files/' + fn))
        lic = os.path.join(HERE, 'licenses', slug + '-OFL.txt')
        if not os.path.exists(lic): open(lic, 'wb').write(get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/OFL.txt'))
        print('  ', name)
    open(os.path.join(HERE, 'fonts.css'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print(f'fonts.css: {len(out) - 1} @font-face, {total // 1024} KB woff2')

if __name__ == '__main__':
    main()
