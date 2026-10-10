#!/usr/bin/env python3
"""Сравнение A/B на сборките: работното копие срещу commit (по подразбиране HEAD).

  python3 tools/ab.py [ref] [--suite] [--pixels] [--keep]

1. Изважда src/ на ref (git archive) във временна папка и сглобява двете версии: само публикуваните части
   (games/series.json), всички части, които ги има и в двете версии, и същите с --offline.
2. Сравнява изходите байт по байт. Стъпките, които само местят код, трябва да дават същия файл.
3. С --suite пуска `node tools/run.js <сборка> suite` (отпечатъци на оцеляването за всички части + smoke)
   върху двете сборки с всички части и показва разликите. Проверките са от работното копие и за двете версии.
   Отпечатъците на секторите са същите като в браузъра (генераторът не зависи от JS двигателя).
4. С --pixels записва двете сборки с всички части като docs/_ab_old.html и docs/_ab_new.html (не се commit-ват) за проверката
   `pixels` в браузъра. Вмъква се кука, която създава канвите с willReadFrequently: така Chrome ги рисува с процесора от
   самото начало и картината не зависи от това кога би ги прехвърлил от видеокартата. В конзолата на всяка проба:
     await import('/tools/checks.js'); rzChecks.run('pixels', {ref:'save'})      // на _ab_old.html
     await import('/tools/checks.js'); rzChecks.run('pixels', {ref:'compare'})   // на _ab_new.html → rzChecks.result.разлики
   За пълна картина на менюто на епизодите отключи епизодите преди зареждане (напр. localStorage 'rz.unlocked'='23').
"""
import difflib, glob, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
suite = '--suite' in args; keep = '--keep' in args; pixels = '--pixels' in args
args = [a for a in args if not a.startswith('--')]
ref = args[0] if args else 'HEAD'

tmp = tempfile.mkdtemp(prefix='rz-ab-')
old = os.path.join(tmp, 'old')
os.makedirs(old)
arch = subprocess.Popen(['git', 'archive', '--format=tar', ref, 'src'], cwd=ROOT, stdout=subprocess.PIPE)
subprocess.run(['tar', '-x', '-C', old], stdin=arch.stdout, check=True)
if arch.wait(): sys.exit('git archive ' + ref + ' не успя')
# всички части, които ги има и в ref, и в работното копие (новата част няма с какво да се сравни)
part = lambda d: sorted((g for g in os.listdir(os.path.join(d, 'src', 'games')) if re.fullmatch(r'r\d+', g)), key=lambda g: int(g[1:]))
ALL = [g for g in part(old) if g in part(ROOT)]; NA = f'всички {len(ALL)}'

def build(src_root, name, extra):
    out_dir = os.path.join(tmp, name); os.makedirs(out_dir, exist_ok=True)
    for f in glob.glob(os.path.join(ROOT, 'docs', '*.png')): shutil.copy(f, out_dir)   # иконите вече ги има — без прерисуване
    out = os.path.join(out_dir, 'index.html')
    r = subprocess.run([sys.executable, os.path.join(src_root, 'src', 'build.py'), *extra, '--out', out], capture_output=True, text=True)
    if r.returncode: sys.exit(f'сборката {name} не успя:\n{r.stdout}{r.stderr}')
    return out

def first_diff(a, b):
    la, lb = open(a, encoding='utf-8').read().split('\n'), open(b, encoding='utf-8').read().split('\n')
    d = list(difflib.unified_diff(la, lb, 'преди', 'сега', n=0, lineterm=''))
    return '\n'.join(x[:300] for x in d[:12]) + (f'\n… ({len(d)} реда разлика)' if len(d) > 12 else '')

print(f'A = {ref}   B = работното копие   (временни файлове: {tmp})')
same = True
for name, extra in [('публикуваните', []), (NA, ALL), (NA + ' --offline', ALL + ['--offline'])]:
    key = name.replace(' ', '_')
    a, b = build(old, 'a_' + key, extra), build(ROOT, 'b_' + key, extra)
    eq = open(a, 'rb').read() == open(b, 'rb').read(); same &= eq
    print(f'  {name:20s} ' + ('байт по байт същото' if eq else 'РАЗЛИКА'))
    if not eq: print('    ' + first_diff(a, b).replace('\n', '\n    '))

if suite:
    def run(html):
        r = subprocess.run(['node', os.path.join(ROOT, 'tools', 'run.js'), html, 'suite'], capture_output=True, text=True)
        return (r.stdout + r.stderr).strip().split('\n')
    k = NA.replace(' ', '_'); sa, sb = run(os.path.join(tmp, 'a_' + k, 'index.html')), run(os.path.join(tmp, 'b_' + k, 'index.html'))
    d = [x for x in difflib.unified_diff(sa, sb, 'преди', 'сега', n=0, lineterm='') if not x.startswith(('---', '+++', '@@'))]
    print('  suite (Node): ' + ('същите отпечатъци' if not d else f'{len(d)} реда разлика'))
    for x in d[:40]: print('    ' + x)
    for x in sb:
        if x.startswith(('baseline', 'smoke', 'грешка')): print('    ' + x)

if pixels:   # канвите — с willReadFrequently (процесорът рисува от самото начало)
    hook = ("<script>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){"
            "return g.call(this,t,t==='2d'?Object.assign({},o,{willReadFrequently:true}):o)}}</script>")
    for src, dst in [('a_' + NA.replace(' ', '_'), '_ab_old.html'), ('b_' + NA.replace(' ', '_'), '_ab_new.html')]:
        h = open(os.path.join(tmp, src, 'index.html'), encoding='utf-8').read()
        i = h.index('<head>') + len('<head>')
        open(os.path.join(ROOT, 'docs', dst), 'w', encoding='utf-8').write(h[:i] + hook + h[i:])
    print('  проби за pixels: docs/_ab_old.html (A) и docs/_ab_new.html (B) — не се commit-ват')

if not keep: shutil.rmtree(tmp, ignore_errors=True)
sys.exit(0 if same else 1)
