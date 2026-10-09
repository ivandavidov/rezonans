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
python3 src/win/make_exe.py            # dist/Rezonans-windows/ (Rezonans-x64.exe + Rezonans-arm64.exe); --zip → и архив
```
И двата скрипта приемат части като `build.py` (`r1 … r7`).

**Mac**
- Само Command Line Tools (`swiftc`, `iconutil`, `codesign`), без Xcode; универсално (arm64 + x86_64), macOS 13+, локален подпис.
- Кодът е в `src/mac/` (`main.swift` — прозорец с WKWebView, `make_app.py` — сглобяване). Проверка без ръце:
  `dist/Резонанс.app/Contents/MacOS/Rezonans --selftest [--snapshot снимка.png]` → JSON (шрифтове, записи, JS грешки).

**Windows**
- Само Go (`brew install go`), без cgo — сглобява се и от Mac; иконата, манифестът и версията се вграждат с go-winres.
- Кодът е в `src/win/` (`main.go` — прозорец с WebView2, `go.mod`/`go.sum`, `make_exe.py`). Играта е вградена в .exe;
  при старт се записва в `%LOCALAPPDATA%\Rezonans\game\`, записите са в `%LOCALAPPDATA%\Rezonans\WebView2`.
- Проверено на Windows (2026-10-08): работи според очакванията; `--selftest` — шрифтовете са налични, без JS грешки,
  записите оцеляват между стартиранията (`runs` расте). Играта се зарежда от `file://` нарочно (go-webview2 няма
  virtual host на високо ниво) — localStorage там работи, не го „поправяй“. На Mac .exe не може да се пусне; самопроверката
  (`Rezonans-x64.exe --selftest` → прозорче с JSON и `%LOCALAPPDATA%\Rezonans\selftest.json`) е само на Windows и не е част
  от обичайната проверка — собственикът не я изисква. Промени в `main.go` на Mac се проверяват само до сглобяването — кажи го.
- Без подпис: SmartScreen пита веднъж („More info“ → „Run anyway“).

**Общо**
- Играта и в двете приложения е `python3 src/build.py --offline`: шрифтовете от `src/fonts/` са вградени,
  без икони/manifest и без връзки навън.
- Нов шрифт в някой `game.json` → `python3 src/fonts/fetch.py` (тегли от Google Fonts, само кирилица и латиница).

## Какво не се пипа на ръка
- **`docs/index.html`**, иконите и **`docs/manifest.webmanifest`** — генерират се. Всяка промяна се прави в `src/` и се пуска сборката.
  Пресглобените файлове се commit-ват заедно с промените в `src/`.
- `docs/.nojekyll` трябва да остане (иначе GitHub Pages прекарва файла през Jekyll).
- **`src/fonts/fonts.css`, `src/fonts/files/`, `src/fonts/licenses/`** — генерират се от `src/fonts/fetch.py`, но се commit-ват
  (офлайн сборката не трябва да зависи от мрежата). Лицензите (SIL OFL) остават до шрифтовете.

## Какво се commit-ва
- Да: `src/` (вкл. `src/fonts/`, `src/mac/`, `src/win/`) и генерираното в `docs/` — сайтът се публикува оттам.
- Не (в `.gitignore`): `build/` и `dist/` (приложенията за Mac и Windows се сглобяват локално), `.DS_Store`, `__pycache__/`,
  старите артефакти в корена, `.claude/`.

## Как е сглобен кодът
- Целият код е обикновен изходен код; `build.py` само сглобява (без замени по кода). Разметката е в
  `src/shell/index.html`, CSS-ът (вкл. тъч подредбите) — в `src/shell/style.css` (влиза на мястото на `/*@@STYLE@@*/`);
  маркерите `@@FONT_FAMILIES@@`, `/*@@GAME_CSS@@*/` и `/*@@FONT_LOADS@@*/` (в `engine/loop.js`) се попълват от
  `game.json` на частите — всеки трябва да се среща точно веднъж.
- Всичко влиза **в едно и също IIFE** (`'use strict'`): основата на двигателя по раздели (`engine/core.js` … `training.js`
  — бившата база, с регистрите `engine/defs.js` и общото съдържание `engine/lib/`: класическите теми и небета) в реда от
  `BASE` в `build.py` → останалият двигател (`series.js`, `campaign.js`, `world.js`, механиките `engine/mech/*.js` по `MECH`,
  `survival.js`, `svsave.js`, `audio.js`; редът на куките на механиките е в `MECH_ORDER`, `engine/mech/core.js`) → игрите по
  `games/series.json` (във всяка — по `files` от `game.json`, `game.js` последен, вика `registerGame`; първата част е
  обикновена част в `games/r1/`) → `engine/loop.js` (цикълът и `window.__rz`).
  Няма модули и `import`: всеки файл вижда глобалните имена на двигателя (`W`, `state`, `centerText`, `store`, …).
  Всяка част е в свой блок `{…}`: вижда двигателя и своите файлове, но не и другите части — с двигателя говори само през
  регистрите (`registerGame`, `def*`, `addUnique`), а двигателят не вика имена от частите.
- Реархитектурата по [notes/rearch-plan.md](notes/rearch-plan.md) е изпълнена (стъпки 0–9); ходът и очакваните числа — в
  `notes/handoff.md`. Как се добавя част, враг, механика, тема за оцеляването — в `src/README.md`.
- Шрифтове и CSS на играта се декларират в `game.json`, не в JS.

## Правила, които сборката проверява (и спира при нарушение)
- Всеки маркер на шаблона (`/*@@STYLE@@*/`, `@@FONT_FAMILIES@@`, `/*@@GAME_CSS@@*/`, `/*@@FONT_LOADS@@*/`) се среща точно веднъж.
- Частите в сборката не се повтарят; всеки файл от `files` в `game.json` съществува. `registerGame` спира при зает `id` или `order`.
- Глобалните `function` / `const` / `let` имена трябва да са уникални в целия сглобен файл.
  Давай на функциите в една игра префикс с id-то ѝ (`r8Logo`, `r8Win`).
- Забранени остатъци от старата архитектура: `R2`, `R3`, `LEVELS2`, `r2title`, `unlocked2`, `MO` и др.
  (списъкът е в `build.py`).
- Общите речници (`TH`, `SKIES`, `SV_THEMES`, `THEME_NAME`, `MUT_NAME`) се пълнят само с `addUnique(...)`; враговете,
  босовете, предметите, плочките и фоновете — само с `defFoe`/`defBoss`/`defItem`/`defTile`/`defBack` (`engine/defs.js`), а
  механиките — с `defMech` (`engine/mech/core.js`): вече зададено поле спира играта с ясна грешка.
- Записите в `localStorage` минават през `store` и `KEY(...)` — всяка част е под свой `GAME.key`. Ключовете са изброени в
  `engine/core.js` (`STORE_KEYS` — общите, `STORE_PART` — имената на частта); ключ извън списъка или `localStorage`
  извън `store` спира сборката. Нов вид запис → първо в списъка.
- `engine/` не знае за конкретни игри; конкретното съдържание е само в `games/<id>/`.

## Проверка на промяна
След сборката:
1. Отвори `docs/index.html` през локален сървър (`python3 -m http.server -d docs`) или директно.
2. Конзолата трябва да е без грешки; менюто трябва да показва всички части от `series.json`.
3. За проверки от конзолата има `window.__rz` (`GAMES`, `GAME`, `state`, `enterGame(id)`, `toMenu()`,
   `startEpisode`, `setDiff`, `frame`, `keys`/`pressed`, `levels`, `unl` …); всяка игра може да добави свои полета чрез
   `debug` в `registerGame`.
4. **Предпазна мрежа** (`tools/`; как — в началото на всеки файл; очакваните стойности са в `notes/handoff.md`, раздел 4):
   - `tools/checks.js` — в браузъра, върху самата сборка: `baseline` (отпечатък на генерирането + терен + население),
     `placement`, `reach`, `acidSim`, `smoke` (всяка част: меню, интро, тренировка, всеки епизод, сектори 1 и 5 —
     хваща грешки и дава „златен образец“), `pixels` (отпечатък на картината — само върху пробите от `ab.py --pixels`). Сървър от корена (`python3 -m http.server 8766` или „repo“ от
     `.claude/launch.json`) → `/docs/index.html`, после `await import('/tools/checks.js')`.
   - `node tools/run.js <сборка.html> <проверка|suite|storage>` — същите проверки без браузър (само за разработка,
     без npm) + договорът на записите (`storage`). Секторите не зависят от JS двигателя — Node и браузърът дават същите
     отпечатъци, вкл. `smoke`. Затова не разбърквай със `sort(()=>Math.random()-0.5)` (редът зависи от двигателя) — само с
     Fisher–Yates.
   - `python3 tools/ab.py [ref] [--suite] [--pixels]` — A/B: сглобява ref и работното копие (публикуваните, 7-те части,
     `--offline`), сравнява байт по байт и (с `--suite`) отпечатъците в Node; `--pixels` пише пробите `docs/_ab_old.html` и
     `docs/_ab_new.html` за `pixels` (картината на менютата, екраните, HUD-а и нивата) в браузъра.
   - Промяна, която не цели да мени поведението, запазва всички отпечатъци (`python3 tools/ab.py HEAD --suite`); при
     съзнателна промяна новите числа се записват в `notes/handoff.md` (раздел 4) и в commit съобщението.
   - Пробни файлове в `docs/` (напр. `_proba.html` с всички части) не се commit-ват.

## Стил
- Код, коментари и текстове в играта — на български, както в съществуващите файлове.
- Сбит стил: кратки имена, много неща на ред, коментари само където логиката не е очевидна.
  Пиши като околния код, не го преформатирай.
- Файловете в корена `rezonans.html`, `test.html`, `rezonans_src.zip` са стари локални артефакти
  (в `.gitignore`) — не ги използвай като източник.
