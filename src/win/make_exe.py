#!/usr/bin/env python3
"""Windows приложение „Резонанс“ — от Mac (или от където и да е): нужен е само Go (`brew install go`).

  python3 src/win/make_exe.py              → dist/Rezonans-windows/ (частите като сайта: games/series.json)
  python3 src/win/make_exe.py r1 r2 … r7   → с изброените части
  python3 src/win/make_exe.py --zip …      → и dist/Rezonans-windows.zip за споделяне

Получават се Rezonans-x64.exe (обикновени компютри) и Rezonans-arm64.exe (Windows на ARM, вкл. виртуална машина
на Mac с Apple Silicon). Вътре: main.go (прозорец с WebView2), офлайн сборката на играта (build.py --offline),
иконата и данните за версията (go-winres). Подпис няма — SmartScreen пита веднъж: „More info“ → „Run anyway“.
Проверка на Windows: Rezonans-x64.exe --selftest
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE); ROOT = os.path.dirname(SRC)
WORK = os.path.join(ROOT, 'build', 'win'); OUT = os.path.join(ROOT, 'dist', 'Rezonans-windows')
WINRES = 'github.com/tc-hib/go-winres@v0.3.3'
ARCHS = {'amd64': 'x64', 'arm64': 'arm64'}
README = """Резонанс за Windows
===================

Rezonans-x64.exe   — за обикновени компютри (Intel / AMD)
Rezonans-arm64.exe — за Windows на ARM (напр. Surface Pro X, Copilot+ PC, виртуална машина на Mac с Apple Silicon)

Не е нужна инсталация — просто стартирай файла. Работи без интернет.
При първо пускане Windows може да покаже „Windows protected your PC“ — натисни „More info“ → „Run anyway“
(файлът не е подписан със сертификат).

Нужен е Microsoft Edge WebView2 Runtime — вграден е в Windows 11 и в обновен Windows 10; ако липсва,
играта предлага да отвори страницата за изтегляне.

F11 или Alt+Enter — цял екран. Esc — пауза / назад.
Записите (прогрес, рекорди, настройки) са в %LOCALAPPDATA%\\Rezonans.
Проверка: Rezonans-x64.exe --selftest → показва резултат и го записва в %LOCALAPPDATA%\\Rezonans\\selftest.json.

Шрифтовете са под SIL Open Font License (виж папката Font Licenses).
"""

def run(*cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)

def main():
    args = sys.argv[1:]; zipit = '--zip' in args; games = [a for a in args if a != '--zip']
    if not shutil.which('go'): raise SystemExit('няма Go — инсталирай: brew install go')
    os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)

    # 1. изходен код + играта (офлайн) в работната папка — go:embed иска index.html до main.go
    for f in ('main.go', 'go.mod', 'go.sum'): shutil.copy2(os.path.join(HERE, f), WORK)
    run(sys.executable, '-B', os.path.join(SRC, 'build.py'), *games, '--offline', '--out', os.path.join(WORK, 'index.html'))

    # 2. иконата и ресурсите (икона #1, манифест, версия)
    sys.path.insert(0, SRC); sys.dont_write_bytecode = True
    import icon
    icon.win_ico(os.path.join(WORK, 'icon.ico'))
    try: n = subprocess.run(['git', '-C', ROOT, 'rev-list', '--count', 'HEAD'], capture_output=True, text=True).stdout.strip() or '0'
    except OSError: n = '0'
    ver = f'1.0.0.{n}'
    info = {'CompanyName': '', 'FileDescription': 'Резонанс', 'FileVersion': ver, 'InternalName': 'Rezonans',
            'LegalCopyright': 'Резонанс · шрифтове: SIL Open Font License', 'OriginalFilename': 'Rezonans.exe',
            'ProductName': 'Резонанс', 'ProductVersion': ver}
    json.dump({
        'RT_GROUP_ICON': {'#1': {'0000': 'icon.ico'}},
        'RT_MANIFEST': {'#1': {'0409': {'identity': {'name': 'Rezonans', 'version': ver}, 'description': 'Резонанс',
            'minimum-os': 'win10', 'execution-level': 'as invoker', 'dpi-awareness': 'per monitor v2',
            'long-path-aware': True, 'use-common-controls-v6': True}}},
        'RT_VERSION': {'#1': {'0000': {'fixed': {'file_version': ver, 'product_version': ver}, 'info': {'0409': info}}}},
    }, open(os.path.join(WORK, 'winres.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    run('go', 'run', WINRES, 'make', '--in', 'winres.json', '--arch', ','.join(ARCHS), cwd=WORK)

    # 3. програмата — без cgo, затова се сглобява от всяка система
    env = dict(os.environ, GOOS='windows', CGO_ENABLED='0')
    for arch, name in ARCHS.items():
        exe = os.path.join(OUT, f'Rezonans-{name}.exe')
        run('go', 'build', '-trimpath', '-ldflags', '-H windowsgui -s -w', '-o', exe, '.', cwd=WORK, env=dict(env, GOARCH=arch))
        print(f'готово: {exe}  ({os.path.getsize(exe) // 1024} KB)')
    open(os.path.join(OUT, 'README.txt'), 'w', encoding='utf-8-sig', newline='\r\n').write(README)
    lic = os.path.join(OUT, 'Font Licenses'); shutil.rmtree(lic, ignore_errors=True)
    shutil.copytree(os.path.join(SRC, 'fonts', 'licenses'), lic)

    if zipit:
        z = os.path.join(ROOT, 'dist', 'Rezonans-windows')
        if os.path.exists(z + '.zip'): os.remove(z + '.zip')
        shutil.make_archive(z, 'zip', os.path.dirname(OUT), os.path.basename(OUT)); print('архив:', z + '.zip')

if __name__ == '__main__':
    main()
