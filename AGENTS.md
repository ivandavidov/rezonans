# AGENTS.md — указания за работа по „Резонанс“

Браузърна игра (поредица от 7 части) на чист JavaScript + Canvas, без зависимости и без npm.
Архитектурата и добавянето на нови части са описани в [src/README.md](src/README.md) — прочети го първо.

## Сборка
```
python3 src/build.py
```
Изходът е `docs/index.html` — един самостоятелен HTML документ, който GitHub Pages публикува от `docs/`.
До него сборката записва иконите за начален екран (`apple-touch-icon.png` за iPhone, `icon-*.png` за Android —
рисуват се от `src/icon.py`) и `manifest.webmanifest` (Android: инсталиране като приложение).
За проба с част от игрите: `python3 src/build.py r1 r3 --out /tmp/proba.html`.
По подразбиране (`games/series.json`) се публикува само `r1`; всички части: `python3 src/build.py r1 r2 r3 r4 r5 r6 r7`.

## Mac / Windows приложения и офлайн сборка
```
python3 src/mac/make_app.py            # dist/Резонанс.app (частите като сайта); --zip → и архив
```
- Само Command Line Tools (`swiftc`, `iconutil`, `codesign`), без Xcode; универсално (arm64 + x86_64), macOS 13+, локален подпис.
- Играта вътре е `python3 src/build.py --offline`: шрифтовете от `src/fonts/` са вградени, без икони/manifest и без връзки навън.
- Кодът е в `src/mac/` (`main.swift` — прозорец с WKWebView, `make_app.py` — сглобяване). Проверка без ръце:
  `dist/Резонанс.app/Contents/MacOS/Rezonans --selftest [--snapshot снимка.png]` → JSON (шрифтове, записи, JS грешки).
- Нов шрифт в някой `game.json` → `python3 src/fonts/fetch.py` (тегли от Google Fonts, само кирилица и латиница).
- Windows: `python3 src/win/make_exe.py` → `dist/Rezonans-windows/` (x64 + arm64 .exe; само Go, без cgo — сглобява се и от Mac).
  Кодът е в `src/win/` (`main.go` — прозорец с WebView2, `go.mod`/`go.sum`, `make_exe.py`). Тук не може да се пусне —
  проверка на Windows с `Rezonans-x64.exe --selftest`.

## Какво не се пипа на ръка
- **`docs/index.html`**, иконите и **`docs/manifest.webmanifest`** — генерират се. Всяка промяна се прави в `src/` и се пуска сборката.
  Пресглобените файлове се commit-ват заедно с промените в `src/`.
- **`src/base/rezonans_v21.html`** — оригиналният двигател. Промени в него се правят като
  точкови замени `rep(старо, ново)` в `build.py`, не в самия файл.
- `docs/.nojekyll` трябва да остане (иначе GitHub Pages прекарва файла през Jekyll).
- **`src/fonts/fonts.css`, `src/fonts/files/`, `src/fonts/licenses/`** — генерират се от `src/fonts/fetch.py`, но се commit-ват
  (офлайн сборката не трябва да зависи от мрежата). Лицензите (SIL OFL) остават до шрифтовете.

## Какво се commit-ва
- Да: `src/` (вкл. `src/fonts/`, `src/mac/`, `src/win/`) и генерираното в `docs/` — сайтът се публикува оттам.
- Не (в `.gitignore`): `build/` и `dist/` (приложенията за Mac и Windows се сглобяват локално), `.DS_Store`, `__pycache__/`,
  старите артефакти в корена, `.claude/`.

## Как е сглобен кодът
- Всички `engine/*.js` и `games/<id>/*.js` се вмъкват **в едно и също IIFE** на базовия файл
  (`'use strict'`, преди маркера `/* ================= LOOP`). Няма модули и `import`:
  всеки файл вижда глобалните имена на двигателя (`W`, `state`, `centerText`, `store`, …) и на другите файлове.
- Редът на зареждане: `engine/` по списъка в `build.py`, после игрите по `games/series.json`,
  а във всяка игра — по `files` от `game.json` (`game.js` винаги последен, вика `registerGame`).
- Шрифтове и CSS на играта се декларират в `game.json`, не в JS.

## Правила, които сборката проверява (и спира при нарушение)
- `rep(a, b)` очаква `a` да се среща точно веднъж (или `cnt` пъти). Ако базовият код се промени
  и съвпадението изчезне, сборката спира — оправи куката, не я заобикаляй.
- Глобалните `function` / `const` / `let` имена трябва да са уникални в целия сглобен файл.
  Давай на функциите в една игра префикс с id-то ѝ (`r8Logo`, `r8Win`).
- Забранени остатъци от старата архитектура: `R2`, `R3`, `LEVELS2`, `r2title`, `unlocked2`, `MO` и др.
  (списъкът е в `build.py`).
- Общите речници (`TH`, `SKIES`, `SV_THEMES`, `THEME_NAME`…) се пълнят само с `addUnique(...)`.
- Записите в `localStorage` минават през `store` и `KEY(...)` — всяка част е под свой `GAME.key`.
- `engine/` не знае за конкретни игри; конкретното съдържание е само в `games/<id>/`.

## Проверка на промяна
Няма автоматични тестове. След сборката:
1. Отвори `docs/index.html` през локален сървър (`python3 -m http.server -d docs`) или директно.
2. Конзолата трябва да е без грешки; менюто трябва да показва всички части от `series.json`.
3. За проверки от конзолата има `window.__rz` (`GAMES`, `GAME`, `state`, `enterGame(id)`, `toMenu()`,
   `startEpisode`, `setDiff`, …); всяка игра може да добави свои полета чрез `debug` в `registerGame`.

## Стил
- Код, коментари и текстове в играта — на български, както в съществуващите файлове.
- Сбит стил: кратки имена, много неща на ред, коментари само където логиката не е очевидна.
  Пиши като околния код, не го преформатирай.
- Файловете в корена `rezonans.html`, `test.html`, `rezonans_src.zip` са стари локални артефакти
  (в `.gitignore`) — не ги използвай като източник.
