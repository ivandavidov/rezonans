// „Резонанс“ за Windows — прозорец с WebView2 (вграден в Windows 10/11), който зарежда офлайн сборката на играта.
// Сглобява се от make_exe.py (GOOS=windows, без cgo — и от Mac). index.html е вграден в .exe; при старт се записва
// в %LOCALAPPDATA%\Rezonans\game\ и се зарежда оттам. Записите на играта (localStorage) и данните на WebView2 са
// в %LOCALAPPDATA%\Rezonans\WebView2.
//   F11 или Alt+Enter — цял екран (Esc остава за играта: пауза / назад)
//   --selftest — зарежда играта, записва проверките в %LOCALAPPDATA%\Rezonans\selftest.json, показва ги и излиза
package main

import (
	"bytes"
	_ "embed"
	"net/url"
	"os"
	"path/filepath"
	"unsafe"

	webview "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

//go:embed index.html
var gameHTML []byte

var (
	user32           = windows.NewLazySystemDLL("user32.dll")
	getWindowLongPtr = user32.NewProc("GetWindowLongPtrW")
	setWindowLongPtr = user32.NewProc("SetWindowLongPtrW")
	setWindowPos     = user32.NewProc("SetWindowPos")
	getWindowRect    = user32.NewProc("GetWindowRect")
	monitorFromWnd   = user32.NewProc("MonitorFromWindow")
	getMonitorInfo   = user32.NewProc("GetMonitorInfoW")
	getDpiForSystem  = user32.NewProc("GetDpiForSystem")
	getSystemMetrics = user32.NewProc("GetSystemMetrics")
	messageBox       = user32.NewProc("MessageBoxW")
	shellExecute     = windows.NewLazySystemDLL("shell32.dll").NewProc("ShellExecuteW")
)

type rect struct{ L, T, R, B int32 }
type monitorInfo struct {
	Size        uint32
	Monitor, Wk rect
	Flags       uint32
}

const (
	gwlStyle       = ^uintptr(15) // GWL_STYLE (-16)
	wsOverlapped   = 0x00CF0000   // WS_OVERLAPPEDWINDOW
	swpFrame       = 0x0020 | 0x0040
	mbYesNoWarning = 0x04 | 0x30
	mbInfo         = 0x40
)

func msgBox(text, title string, flags uintptr) uintptr {
	t, _ := windows.UTF16PtrFromString(text)
	c, _ := windows.UTF16PtrFromString(title)
	r, _, _ := messageBox.Call(0, uintptr(unsafe.Pointer(t)), uintptr(unsafe.Pointer(c)), flags)
	return r
}

// цял екран без рамка върху монитора на прозореца — и обратно
var full bool
var savedRect rect
var savedStyle uintptr

func toggleFullscreen(h uintptr) {
	if !full {
		savedStyle, _, _ = getWindowLongPtr.Call(h, gwlStyle)
		getWindowRect.Call(h, uintptr(unsafe.Pointer(&savedRect)))
		mon, _, _ := monitorFromWnd.Call(h, 2)
		mi := monitorInfo{Size: uint32(unsafe.Sizeof(monitorInfo{}))}
		getMonitorInfo.Call(mon, uintptr(unsafe.Pointer(&mi)))
		m := mi.Monitor
		setWindowLongPtr.Call(h, gwlStyle, savedStyle&^wsOverlapped)
		setWindowPos.Call(h, 0, uintptr(m.L), uintptr(m.T), uintptr(m.R-m.L), uintptr(m.B-m.T), swpFrame)
	} else {
		r := savedRect
		setWindowLongPtr.Call(h, gwlStyle, savedStyle)
		setWindowPos.Call(h, 0, uintptr(r.L), uintptr(r.T), uintptr(r.R-r.L), uintptr(r.B-r.T), swpFrame)
	}
	full = !full
}

// размер на прозореца според мащаба на екрана, но не по-голям от 90 % от него
func windowSize() (uint, uint) {
	dpi := uintptr(96)
	if getDpiForSystem.Find() == nil {
		dpi, _, _ = getDpiForSystem.Call()
	}
	sw, _, _ := getSystemMetrics.Call(0)
	sh, _, _ := getSystemMetrics.Call(1)
	w, h := 1120*dpi/96, 760*dpi/96
	if w > sw*9/10 {
		w, h = sw*9/10, sw*9/10*760/1120
	}
	if h > sh*9/10 {
		w, h = sh*9/10*1120/760, sh*9/10
	}
	return uint(w), uint(h)
}

func main() {
	selftest := len(os.Args) > 1 && os.Args[1] == "--selftest"
	base, err := os.UserCacheDir() // %LOCALAPPDATA%
	if err != nil {
		base = os.TempDir()
	}
	base = filepath.Join(base, "Rezonans")
	page := filepath.Join(base, "game", "index.html")
	_ = os.MkdirAll(filepath.Dir(page), 0o755)
	if old, err := os.ReadFile(page); err != nil || !bytes.Equal(old, gameHTML) {
		_ = os.WriteFile(page, gameHTML, 0o644)
	}

	ww, wh := windowSize()
	w := webview.NewWithOptions(webview.WebViewOptions{
		DataPath:      filepath.Join(base, "WebView2"),
		AutoFocus:     true,
		WindowOptions: webview.WindowOptions{Title: "Резонанс", Width: ww, Height: wh, IconId: 1, Center: true},
	})
	if w == nil {
		if msgBox("За играта е нужен Microsoft Edge WebView2 Runtime — вграден е в Windows 11 и в обновен Windows 10.\n\n"+
			"Да отворя ли страницата за изтегляне?", "Резонанс", mbYesNoWarning) == 6 {
			u, _ := windows.UTF16PtrFromString("https://go.microsoft.com/fwlink/p/?LinkId=2124703")
			op, _ := windows.UTF16PtrFromString("open")
			shellExecute.Call(0, uintptr(unsafe.Pointer(op)), uintptr(unsafe.Pointer(u)), 0, 0, 1)
		}
		return
	}
	defer w.Destroy()

	hwnd := uintptr(w.Window())
	_ = w.Bind("rzFullscreen", func() { toggleFullscreen(hwnd) })
	w.Init(`window.__errs=[];addEventListener('error',e=>__errs.push(String(e.message)));
addEventListener('keydown',e=>{ if(e.key==='F11'||(e.key==='Enter'&&e.altKey)){ e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat) rzFullscreen(); } },true);`)

	if selftest {
		_ = w.Bind("rzSelftest", func(res string) {
			_ = os.WriteFile(filepath.Join(base, "selftest.json"), []byte(res), 0o644)
			msgBox(res, "Резонанс — самопроверка", mbInfo)
			w.Terminate()
		})
		w.Init(`addEventListener('load',()=>setTimeout(()=>{ const n=(+localStorage.getItem('rz.selftest')||0)+1; localStorage.setItem('rz.selftest',n);
  rzSelftest(JSON.stringify({game:window.__rz&&__rz.GAME.id, state:window.__rz&&__rz.state, games:window.__rz&&__rz.GAMES.map(g=>g.id), runs:n,
    fonts:{russo:document.fonts.check('10px "Russo One"'), plex:document.fonts.check('600 10px "IBM Plex Mono"')},
    audio:!!window.AudioContext, size:[innerWidth,innerHeight], origin:location.origin, errors:window.__errs})); },2500));`)
	}

	w.Navigate((&url.URL{Scheme: "file", Path: "/" + filepath.ToSlash(page)}).String())
	w.Run()
}
