#!/usr/bin/env python3
"""Сборка на поредицата „Резонанс“ в един HTML файл.

  python3 src/build.py                 → docs/index.html (игрите от games/series.json)
  python3 src/build.py r1 r3           → само изброените игри (за проба)
  python3 src/build.py --out x.html …  → друго име на изхода
  python3 src/build.py --offline …     → без връзки навън: шрифтовете (src/fonts/) са вградени, без икони/manifest
                                         (за Mac/Windows приложенията — src/mac/make_app.py, src/win/make_exe.py)

Изходът е самостоятелен HTML документ (doctype, <head>, <body>) — готов за отваряне
в браузър и за публикуване (напр. GitHub Pages от папка docs/). До него се записват
иконите за начален екран (icon.py) и manifest.webmanifest (Android: инсталиране като приложение).

Части (обикновен код — сборката само ги сглобява, без замени по кода):
  shell/index.html        разметката; /*@@STYLE@@*/ ← shell/style.css (целият CSS); @@FONT_FAMILIES@@ и /*@@GAME_CSS@@*/ — от game.json
  engine/*.js             двигателят: основата по раздели (BASE; engine/lib/ — общи теми и небета), после регистърът на
                          игрите, кампанията, плочките, механиките (engine/mech/), оцеляването и звукът
  games/<id>/game.json    манифест: файлове, шрифтове, CSS на играта
  games/<id>/*.js         съдържанието на играта; последният файл вика registerGame({...})
  engine/loop.js          главният цикъл и window.__rz; /*@@FONT_LOADS@@*/ — шрифтовете на частите
Всичко е в едно IIFE ('use strict'): BASE (по реда долу) → останалият двигател → игрите (по games/series.json, всяка в свой
блок) → loop.js.
Проверки: маркерите, повтарящи се части и липсващи файлове, остатъци от старата архитектура, ключовете на записите
(списъкът в engine/core.js), уникални глобални имена.
Първата част е обикновена част (games/r1/) — сборката не я третира по-специално.

Добавяне на нова част: нова папка games/<id>/ с game.json и game.js (registerGame с order),
после id-то в games/series.json. Махане: изтрий id-то от series.json — нищо друго не се променя.
"""
import collections, json, os, re, sys
from urllib.parse import quote
ROOT=os.path.dirname(os.path.abspath(__file__))
P=lambda *a: os.path.join(ROOT,*a)
def rd(*p): return open(P(*p),encoding='utf-8').read()
args=sys.argv[1:]; out=os.path.join(os.path.dirname(ROOT),'docs','index.html')
if '--out' in args: i=args.index('--out'); out=args[i+1]; del args[i:i+2]
offline='--offline' in args
if offline: args.remove('--offline')
series=args or json.load(open(P('games','series.json')))
if len(set(series))!=len(series): raise SystemExit('частите се повтарят: '+', '.join(sorted({g for g in series if series.count(g)>1})))
for gid in series:
    if not os.path.exists(P('games',gid,'game.json')): raise SystemExit(f'няма games/{gid}/game.json')
games=[(gid,json.load(open(P('games',gid,'game.json'),encoding='utf-8'))) for gid in series]
for gid,g in games:
    miss=[f for f in g['files'] if not os.path.exists(P('games',gid,f))]
    if miss: raise SystemExit(f'games/{gid}/game.json: няма файловете '+', '.join(miss))
def fill(t,mark,val):
    if t.count(mark)!=1: raise SystemExit(f'маркерът {mark} се среща {t.count(mark)} пъти (очаква се веднъж)')
    return t.replace(mark,val)

# ---------- HTML / CSS / шрифтове ----------
shell=fill(fill(rd('shell','index.html'),'/*@@STYLE@@*/',rd('shell','style.css')),'@@FONT_FAMILIES@@',''.join('&family='+f.replace(' ','+') for _,g in games for f in g.get('fonts',[])))
if offline:   # шрифтовете от src/fonts/ (fetch.py) се вграждат като data: — нищо не се тегли отвън
    import base64
    if not os.path.exists(P('fonts','fonts.css')): raise SystemExit('няма src/fonts/fonts.css — пусни python3 src/fonts/fetch.py')
    need={'IBM Plex Mono','Russo One'}|{f.split(':')[0] for _,g in games for f in g.get('fonts',[])}
    blocks=[b for b in re.findall(r'@font-face\s*\{[^}]*\}',rd('fonts','fonts.css')) if re.search(r"font-family:\s*'([^']+)'",b).group(1) in need]
    if {re.search(r"font-family:\s*'([^']+)'",b).group(1) for b in blocks}!=need: raise SystemExit('src/fonts/ няма всички шрифтове — пусни python3 src/fonts/fetch.py')
    ff=re.sub(r'url\(files/([^)]+)\)',lambda m:'url(data:font/woff2;base64,'+base64.b64encode(open(P('fonts','files',m.group(1)),'rb').read()).decode()+')','\n'.join(blocks))
    a=shell.index('<link rel="preconnect" href="https://fonts.googleapis.com">'); b=shell.index('rel="stylesheet">',a)+len('rel="stylesheet">')
    shell=shell[:a]+'<style>\n'+ff+'\n</style>'+shell[b:]
shell=fill(shell,'/*@@GAME_CSS@@*/','\n'.join(l for _,g in games for l in g.get('css',[])))
loads=''.join(",document.fonts.load('"+f+"')" for _,g in games for f in g.get('fontLoad',[]))

# ---------- код: двигател + игрите от поредицата ----------
# основата на двигателя по раздели (бившата база), регистрите (defs.js) и споделеното съдържание (lib/) — в този ред
BASE=['core.js','defs.js','difficulty.js','synth.js','lib/themes.js','map.js','prerender.js','sky.js','input.js','state.js','fx.js',
      'combat.js','player.js','enemies.js','lifts.js','crushers.js','trains.js','bosses.js','missiles.js','survgen.js','flow.js',
      'update.js','render.js','training.js']
# механиките (engine/mech/) — core.js първи; редът на куките е в MECH_ORDER (core.js), не тук
MECH=['core','water','levers','escort','flips','shifters','allies','eras','gens','chase','sun','winds','echo','plates','cams','terms','snow',
      'freqsonar','trance','tone','cursors']
code=['/* ================= ДВИГАТЕЛ ================= */']+[rd('engine',f) for f in ['series.js','campaign.js','world.js']+['mech/'+m+'.js' for m in MECH]+['survival.js','svsave.js','audio.js','cheats.js']]
for gid,g in games:   # всяка част — в свой блок: имената ѝ не се виждат от другите части (с двигателя говори само през регистрите)
    code+=[f'/* ================= ИГРА: {gid} ================= */','{']+[rd('games',gid,f) for f in g['files']]+['}']
code.append("if(!GAMES.length) throw new Error('Няма регистрирани игри'); setGame(GAMES[0].id);")
s=(shell+"<script>\n(()=>{\n'use strict';\n"+''.join(rd('engine',f) for f in BASE)+'\n'.join(code)+'\n'
   +fill(rd('engine','loop.js'),'/*@@FONT_LOADS@@*/',loads)+'})();\n</script>\n')

allcode=''.join(rd('engine',f) for f in BASE)+'\n'.join(code)+rd('engine','loop.js')
left=[w for w in ['R3','R2','r2title',"state='mode'","'r2intro'",'LEVELS2','unlocked2','MO','SEQ','R2B','R2UPD','R2DRAW','R2_TAKE','R2_PDRAW','R2B_TONE','R2B_CMD','R2BAR',
                    'TILE_HOOKS','BACK_HOOKS','BOSS_NORM','drawHUD2','renderEps2','r2EpsInput','r2Tile','r2BackDeco','r2SkyLayer',
                    'r2T','r2Load','r2SetCp','r2PreRespawn','r2Respawn','r2ExitOk','r2Move','r2Wind','r2BuildEras','r2Update','r2DrawBack',
                    'r2DrawWorld','r2Lights','r2PostFx','mechLoad','mechRespawn','mechUpdate','mechDrawBack','mechDrawWorld','mechLights','mechChips',
                    'svTry2','genSector','r1GenSector','r1SvPlan','SV_TG','THEME_MUSIC','r2Sel','r2ToTitle','leaveR2'] if re.search(r'(?<![\w])'+re.escape(w)+r'(?![\w])',allcode)]
if left: raise SystemExit('остатъци от старата архитектура: '+', '.join(left))
# записите: ключове само от списъка в engine/core.js (STORE_KEYS — общите, STORE_PART — на частта); localStorage — само през store
full=allcode
sk=re.search(r"const STORE_KEYS=\[([^\]]*)\], STORE_PART=\[([^\]]*)\];",full)
if not sk: raise SystemExit('няма STORE_KEYS/STORE_PART в engine/core.js')
SK,SP=[re.findall(r"'([^']+)'",x) for x in sk.groups()]
bad=[k for k in re.findall(r"\bKEY\('([^']+)'\)",full) if k not in SP]
bad+=[k for k in re.findall(r"\bstore\.(?:get|set|del)\('([^']+)'",full) if k not in SK and not re.fullmatch(r'rz\d*\.(?:'+'|'.join(SP)+r')\d?',k)]
if bad: raise SystemExit('ключове на записи извън списъка (engine/core.js · STORE_KEYS/STORE_PART): '+', '.join(sorted(set(bad))))
if re.search(r'\blocalStorage\b',full.replace(rd('engine','core.js'),'')): raise SystemExit('localStorage — само през store (engine/core.js)')
# всяко глобално име трябва да е уникално — иначе една игра тихо подменя функция на друга
tops=collections.Counter(a or b for a,b in re.findall(r'^(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=)',s,re.M))
dup=[k for k,v in tops.items() if v>1]
if dup: raise SystemExit('дублирани глобални имена: '+', '.join(dup))

# ---------- изход: пълноценен HTML документ ----------
# shell е фрагмент (title, шрифтове, style, после разметка) — до последния му </style> отива в <head>, останалото в <body>
i=shell.rindex('</style>')+len('</style>')
head,body=s[:i].strip(),s[i:].strip()
icon=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#080b0d"/>'
      '<path d="M3 16h5l3-9 5 18 4-14 3 5h6" fill="none" stroke="#ffa62b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
home='' if offline else '''<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-title" content="Резонанс">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
'''
doc=f'''<!doctype html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Резонанс — поредица ретро екшън игри, които се играят направо в браузъра.">
<meta name="theme-color" content="#080b0d">
<link rel="icon" href="data:image/svg+xml,{quote(icon)}">
{home}{head}
<style>html,body{{margin:0}}</style>
</head>
<body>
{body}
</body>
</html>
'''
os.makedirs(os.path.dirname(os.path.abspath(out)),exist_ok=True)
open(out,'w',encoding='utf-8').write(doc)
# начален екран — до HTML файла: иконите (iPhone: apple-touch-icon; Android: icon-*.png) и manifest-ът за Android
if offline: print('built', out, len(doc), 'games:', ', '.join(g for g,_ in games), '(offline)'); raise SystemExit
sys.dont_write_bytecode=True; import icon; odir=os.path.dirname(os.path.abspath(out)); icon.write_all(odir)
man=json.dumps({'name':'Резонанс','short_name':'Резонанс','description':'Поредица ретро екшън игри, които се играят направо в браузъра.',
  'lang':'bg','id':'./','start_url':'./','scope':'./','display':'fullscreen','background_color':'#080b0d','theme_color':'#080b0d','categories':['games'],
  'icons':[{'src':f'icon-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'any'} for n in (192,512)]
        +[{'src':f'icon-maskable-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'maskable'} for n in (192,512)]},ensure_ascii=False,indent=1)+'\n'
mp=os.path.join(odir,'manifest.webmanifest')
if not os.path.exists(mp) or open(mp,encoding='utf-8').read()!=man: open(mp,'w',encoding='utf-8').write(man)
print('built', out, len(doc), 'games:', ', '.join(g for g,_ in games))
