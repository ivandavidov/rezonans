#!/usr/bin/env python3
"""Mac приложение „Резонанс“ — без Xcode, само Command Line Tools (swiftc, iconutil, codesign).

  python3 src/mac/make_app.py              → dist/Резонанс.app (частите като сайта: games/series.json)
  python3 src/mac/make_app.py r1 r2 … r7   → с изброените части
  python3 src/mac/make_app.py --zip …      → и dist/Rezonans-mac.zip за споделяне

Вътре: main.swift (прозорец с WKWebView), офлайн сборката на играта (build.py --offline — шрифтовете
са вградени, нищо не се тегли отвън), AppIcon.icns (icon.py) и лицензите на шрифтовете.
Подписът е локален (ad-hoc): на този Mac се отваря направо; на чужд — с десен бутон → Отвори.
Проверка без ръце: dist/Резонанс.app/Contents/MacOS/Rezonans --selftest [--snapshot снимка.png]
"""
import os, plistlib, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE); ROOT = os.path.dirname(SRC)
WORK = os.path.join(ROOT, 'build', 'mac'); DIST = os.path.join(ROOT, 'dist')
APP = os.path.join(DIST, 'Резонанс.app'); EXE = 'Rezonans'; MIN_OS = '13.0'   # с Command Line Tools x86_64 се свързва от 13 нагоре

def run(*cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)

def newer(target, *sources):
    return os.path.exists(target) and all(os.path.getmtime(target) >= os.path.getmtime(s) for s in sources)

def main():
    args = sys.argv[1:]; zipit = '--zip' in args; games = [a for a in args if a != '--zip']
    os.makedirs(WORK, exist_ok=True); os.makedirs(DIST, exist_ok=True)

    # 1. играта — офлайн
    html = os.path.join(WORK, 'index.html')
    run(sys.executable, '-B', os.path.join(SRC, 'build.py'), *games, '--offline', '--out', html)

    # 2. иконата
    sys.path.insert(0, SRC); sys.dont_write_bytecode = True
    import icon
    icns = os.path.join(WORK, 'AppIcon.icns'); icon.mac_icns(icns)

    # 3. програмата — за Apple Silicon и Intel, ако може (иначе само за този Mac)
    swift = os.path.join(HERE, 'main.swift'); exe = os.path.join(WORK, EXE)
    if not newer(exe, swift, __file__):
        bins = []
        for arch in ('arm64', 'x86_64'):
            b = f'{exe}-{arch}'
            r = subprocess.run(['swiftc', '-O', '-target', f'{arch}-apple-macos{MIN_OS}', swift, '-o', b], capture_output=True, text=True)
            if r.returncode == 0: bins.append(b)
            else: print(f'  {arch}: не се сглобява — пропускам', file=sys.stderr)
        if not bins: raise SystemExit('swiftc не успя — нужни са Command Line Tools: xcode-select --install')
        run('lipo', '-create', *bins, '-output', exe)
        for b in bins: os.remove(b)

    # 4. пакетът
    shutil.rmtree(APP, ignore_errors=True)
    mac, res = os.path.join(APP, 'Contents', 'MacOS'), os.path.join(APP, 'Contents', 'Resources')
    os.makedirs(mac); os.makedirs(res)
    shutil.copy2(exe, os.path.join(mac, EXE)); shutil.copy2(html, res); shutil.copy2(icns, res)
    shutil.copytree(os.path.join(SRC, 'fonts', 'licenses'), os.path.join(res, 'Font Licenses'))
    try: build_no = subprocess.run(['git', '-C', ROOT, 'rev-list', '--count', 'HEAD'], capture_output=True, text=True).stdout.strip() or '1'
    except OSError: build_no = '1'
    plistlib.dump({
        'CFBundleName': 'Резонанс', 'CFBundleDisplayName': 'Резонанс', 'CFBundleIdentifier': 'com.ivandavidov.rezonans',
        'CFBundleExecutable': EXE, 'CFBundleIconFile': 'AppIcon', 'CFBundlePackageType': 'APPL',
        'CFBundleShortVersionString': '1.0', 'CFBundleVersion': build_no, 'CFBundleDevelopmentRegion': 'bg',
        'LSMinimumSystemVersion': MIN_OS, 'LSApplicationCategoryType': 'public.app-category.action-games',
        'NSHighResolutionCapable': True, 'NSPrincipalClass': 'NSApplication',
        'NSHumanReadableCopyright': 'Резонанс · шрифтове: SIL Open Font License',
    }, open(os.path.join(APP, 'Contents', 'Info.plist'), 'wb'))

    # 5. подпис (локален) и по желание архив
    run('codesign', '--force', '--sign', '-', '--timestamp=none', APP)
    archs = subprocess.run(['lipo', '-archs', os.path.join(mac, EXE)], capture_output=True, text=True).stdout.strip()
    print(f'готово: {APP}  ({archs})')
    if zipit:
        z = os.path.join(DIST, 'Rezonans-mac.zip')
        if os.path.exists(z): os.remove(z)
        run('ditto', '-c', '-k', '--keepParent', APP, z); print('архив:', z)

if __name__ == '__main__':
    main()
