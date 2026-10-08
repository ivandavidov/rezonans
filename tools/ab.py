#!/usr/bin/env python3
"""Сравнение A/B на сборките: работното копие срещу commit (по подразбиране HEAD).

  python3 tools/ab.py [ref] [--suite] [--keep]

1. Изважда src/ на ref (git archive) във временна папка и сглобява двете версии: само публикуваните части
   (games/series.json), всичките 7 части и всичките 7 с --offline.
2. Сравнява изходите байт по байт. Стъпките, които само местят код, трябва да дават същия файл.
3. С --suite пуска `node tools/run.js <сборка> suite` (отпечатъци на оцеляването за всички части + smoke)
   върху двете сборки с всички части и показва разликите. Проверките са от работното копие и за двете версии.
   Числата от Node се сравняват само с числа от Node (населението на секторите зависи от JS двигателя).
"""
import difflib, glob, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALL = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7']
args = sys.argv[1:]
suite = '--suite' in args; keep = '--keep' in args
args = [a for a in args if not a.startswith('--')]
ref = args[0] if args else 'HEAD'

tmp = tempfile.mkdtemp(prefix='rz-ab-')
old = os.path.join(tmp, 'old')
os.makedirs(old)
arch = subprocess.Popen(['git', 'archive', '--format=tar', ref, 'src'], cwd=ROOT, stdout=subprocess.PIPE)
subprocess.run(['tar', '-x', '-C', old], stdin=arch.stdout, check=True)
if arch.wait(): sys.exit('git archive ' + ref + ' не успя')

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
for name, extra in [('публикуваните', []), ('всички 7', ALL), ('всички 7 --offline', ALL + ['--offline'])]:
    key = name.replace(' ', '_')
    a, b = build(old, 'a_' + key, extra), build(ROOT, 'b_' + key, extra)
    eq = open(a, 'rb').read() == open(b, 'rb').read(); same &= eq
    print(f'  {name:20s} ' + ('байт по байт същото' if eq else 'РАЗЛИКА'))
    if not eq: print('    ' + first_diff(a, b).replace('\n', '\n    '))

if suite:
    def run(html):
        r = subprocess.run(['node', os.path.join(ROOT, 'tools', 'run.js'), html, 'suite'], capture_output=True, text=True)
        return (r.stdout + r.stderr).strip().split('\n')
    sa, sb = run(os.path.join(tmp, 'a_всички_7', 'index.html')), run(os.path.join(tmp, 'b_всички_7', 'index.html'))
    d = [x for x in difflib.unified_diff(sa, sb, 'преди', 'сега', n=0, lineterm='') if not x.startswith(('---', '+++', '@@'))]
    print('  suite (Node): ' + ('същите отпечатъци' if not d else f'{len(d)} реда разлика'))
    for x in d[:40]: print('    ' + x)
    for x in sb:
        if x.startswith(('baseline', 'smoke', 'грешка')): print('    ' + x)

if not keep: shutil.rmtree(tmp, ignore_errors=True)
sys.exit(0 if same else 1)
