"""Шрифтовете на „Резонанс в космоса“ → fonts/fonts.css с вградени data: URI (пуска се на ръка, иска мрежа).

Защо вградени: при отваряне от file:// браузърите блокират @font-face към файлове (CORS), а data: минава.
Взимат се само поднаборите cyrillic и latin от Google Fonts; лицензите (SIL OFL) — от github.com/google/fonts.
  python3 dev/fonts.py
"""
import base64, os, re, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'fonts')
CSS = 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300..800&family=Russo+One&display=block'
LIC = {'Exo2': 'exo2', 'RussoOne': 'russoone'}
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()

def main():
    css = get(CSS).decode()
    out = ['/* генерира се от dev/fonts.py — не се пипа на ръка; лицензи: OFL-*.txt */']
    for sub, block in re.findall(r'/\* (\S+) \*/\s*(@font-face\s*{[^}]*})', css):
        if sub not in ('cyrillic', 'latin'): continue
        url = re.search(r'url\((\S+?)\)', block).group(1)
        data = base64.b64encode(get(url)).decode()
        out.append(block.replace(url, 'data:font/woff2;base64,' + data))
        print(sub, re.search(r"font-family: '([^']+)'", block).group(1), len(data) // 1024, 'KB')
    open(os.path.join(OUT, 'fonts.css'), 'w').write('\n'.join(out) + '\n')
    for name, d in LIC.items():
        open(os.path.join(OUT, 'OFL-%s.txt' % name), 'wb').write(get('https://raw.githubusercontent.com/google/fonts/main/ofl/%s/OFL.txt' % d))

if __name__ == '__main__': main()
