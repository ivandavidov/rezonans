# Резонанс — изходен код на поредицата

```
src/
  build.py              сборка → docs/index.html (един самостоятелен HTML документ)
  icon.py               иконите за начален екран → docs/ (iPhone 180, Android 192/512 + maskable), без зависимости
  fonts/                шрифтовете за офлайн сборката (fetch.py ги тегли веднъж от Google Fonts; SIL OFL в licenses/)
  mac/                  Mac приложение: main.swift (WKWebView) + make_app.py → dist/Резонанс.app
  win/                  Windows приложение: main.go (WebView2) + make_exe.py → dist/Rezonans-windows/ (x64 + arm64 .exe)
  shell/index.html      разметката и CSS (маркерите за шрифтовете и CSS на частите се попълват при сборката)
  engine/legacy/        бившата база по раздели (core, synth, levels, map … training) — двигателят + засега първата част;
                        loop.js — цикълът и window.__rz (реархитектурата ги разнася по engine/ и games/r1/)
  engine/               общ код за всички части
    series.js           регистър на игрите, еднаквото меню, навигация с Esc
    sequel.js           двигател на продълженията: вода, епохи, обръщане, ескорт, HUD, епизоди
    world.js            плочки, небе, фон (+ TILE_HOOKS / BACK_HOOKS за нови стилове)
    mech.js             ехо, плочи, прожектори, терминали, вятър, сняг, ритъм
    mech2.js            тонове (честоти), сонар, застинало време, спомени
    mech3.js            хора в транс, сигнални ракети, светлинни шахти, скрити проходи, водопади, прилепи
    mech4.js            тонът (E): зашеметява враговете, отваря тоновите врати ('t'), куки за босове (R2B_TONE)
    mech5.js            курсори с команди (POKE/PEEK/GOTO/BREAK/RUN) и „касетъчно“ зареждане на ниво
    survival.js         генератор на сектори за „Оцеляване“
    svsave.js           „Оцеляване“: запазен напредък по трудност (продължи · ново начало · изчисти)
    audio.js            звук: музика и ефекти поотделно (M всичко · N музика · B ефекти), изборът се пази
  games/
    series.json         кои части влизат в сборката и в какъв ред
    r1/ … r7/           по една папка за всяка част
```

## Добавяне на нова част (напр. r8)
1. Копирай `games/_template/` като `games/r8/`.
2. В `game.json` изброй файловете (последен е `game.js`), шрифтовете и CSS цветовете.
3. В `game.js` попълни `registerGame({...})`: `id:'r8'`, `order:8`, заглавие, описания,
   нива (`levels`, `chapters`), интро, тренировка, оцеляване (`svPlan`, `svBoss`), цветове.
4. Добави `"r8"` в `games/series.json` и пусни `python3 src/build.py`.
   Резултатът е `docs/index.html` — отваря се директно в браузър и се публикува както е
   (напр. GitHub Pages → Deploy from branch → `main` / `/docs`).

Менюто (ИНТРО · ТРЕНИРОВКА · КАМПАНИЯ · ОЦЕЛЯВАНЕ + връзки към другите части) се
сглобява само — нищо в останалите игри не се променя.

## Какво се публикува
`games/series.json` е само `["r1"]` — по подразбиране се сглобява и публикува първата част.
Всички части: `python3 src/build.py r1 r2 r3 r4 r5 r6 r7` (папките им остават в `games/`).

## Mac приложение
```
python3 src/mac/make_app.py            # dist/Резонанс.app — частите като сайта
python3 src/mac/make_app.py r1 … r7    # с изброените части; --zip → и dist/Rezonans-mac.zip
```
Нужни са само Command Line Tools (`xcode-select --install`), не Xcode. Приложението е универсално
(Apple Silicon + Intel, macOS 13+), с локален подпис: на този Mac се отваря направо, на чужд — десен бутон → Отвори.
Играта вътре е `build.py --offline` (шрифтовете от `src/fonts/` са вградени). Нов шрифт в game.json →
`python3 src/fonts/fetch.py`. Проверка: `dist/Резонанс.app/Contents/MacOS/Rezonans --selftest`.

## Windows приложение
```
python3 src/win/make_exe.py            # dist/Rezonans-windows/ — частите като сайта
python3 src/win/make_exe.py r1 … r7    # с изброените части; --zip → и dist/Rezonans-windows.zip
```
Сглобява се и от Mac: нужен е само Go (`brew install go`), без cgo и без Windows. Получават се
`Rezonans-x64.exe` и `Rezonans-arm64.exe` — по един файл, без инсталация, офлайн. Прозорецът е WebView2
(вграден в Windows 10/11); играта (`build.py --offline`) е вградена в .exe и при старт се записва в
`%LOCALAPPDATA%\Rezonans\game\`, а записите — в `%LOCALAPPDATA%\Rezonans\WebView2`. Иконата и версията се
вграждат с go-winres. Без подпис — SmartScreen пита веднъж („More info“ → „Run anyway“).
Проверка на Windows: `Rezonans-x64.exe --selftest` (показва резултата и го записва в selftest.json).

## Махане на част
Изтрий id-то ѝ от `games/series.json`. Връзките към нея изчезват от всички менюта.
За проба без промяна на файла: `python3 src/build.py r1 r3 --out proba.html`.
(Първата част засега живее в `engine/legacy/` — махането ѝ само я скрива от менютата; реархитектурата я изнася в `games/r1/`.)

## Правила, които пазят частите независими
- Палитри, небета, теми за оцеляване и имена на теми се добавят с `addUnique(...)`:
  дублиран ключ между две игри спира играта с ясна грешка. Давай уникални имена.
- Записите се пазят под `GAME.key` (`rz`, `rz2`, `rz3` …) — всяка част има свои.
- Кодът в `engine/` не знае за конкретни игри; конкретното съдържание е само в `games/<id>/`.
- Глобалните имена (функции и константи) трябва да са уникални — `build.py` спира при дубликат.
