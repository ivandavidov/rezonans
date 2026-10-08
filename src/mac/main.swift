// „Резонанс“ за macOS — прозорец с WKWebView, който зарежда офлайн сборката на играта (Resources/index.html).
// Сглобява се от make_app.py (swiftc, без Xcode). Записите (localStorage) са под произхода https://rezonans.local/
// и се пазят в контейнера на приложението.
//   --selftest            зарежда играта, отпечатва JSON с проверки (шрифтове, записи, грешки) и излиза
//   --snapshot <файл.png> заедно с --selftest: снимка на прозореца
import Cocoa
import WebKit

let ORIGIN = URL(string: "https://rezonans.local/")!

// без системния звук „бип“ при клавиши, които играта не ползва
final class GameWindow: NSWindow {
    override func noResponder(for eventSelector: Selector) {
        if eventSelector == #selector(NSResponder.keyDown(with:)) { return }
        super.noResponder(for: eventSelector)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var window: GameWindow!
    var web: WKWebView!
    let args = CommandLine.arguments

    func applicationDidFinishLaunching(_ note: Notification) {
        buildMenu()
        let cfg = WKWebViewConfiguration()
        cfg.websiteDataStore = .default()
        cfg.mediaTypesRequiringUserActionForPlayback = []
        cfg.userContentController.addUserScript(WKUserScript(
            source: "window.__errs=[];addEventListener('error',e=>__errs.push(String(e.message)));",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: cfg)
        web.navigationDelegate = self
        web.allowsMagnification = false
        web.setValue(false, forKey: "drawsBackground")      // без бял кадър преди първото изрисуване

        window = GameWindow(contentRect: NSRect(x: 0, y: 0, width: 1120, height: 760),
                            styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Резонанс"
        window.backgroundColor = NSColor(red: 8 / 255, green: 11 / 255, blue: 13 / 255, alpha: 1)
        window.contentView = web
        window.contentMinSize = NSSize(width: 640, height: 420)
        window.collectionBehavior = [.fullScreenPrimary]
        if !window.setFrameUsingName("main") { window.center() }
        window.setFrameAutosaveName("main")
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(web)

        let url = Bundle.main.url(forResource: "index", withExtension: "html")!
        web.loadHTMLString(try! String(contentsOf: url, encoding: .utf8), baseURL: ORIGIN)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }

    // външни връзки — в браузъра по подразбиране
    func webView(_ w: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let u = action.request.url, ["http", "https"].contains(u.scheme ?? ""), u.host != ORIGIN.host {
            NSWorkspace.shared.open(u); decisionHandler(.cancel); return
        }
        decisionHandler(.allow)
    }

    func webView(_ w: WKWebView, didFinish nav: WKNavigation!) {
        window.makeFirstResponder(web)
        if args.contains("--selftest") { DispatchQueue.main.asyncAfter(deadline: .now() + 2) { self.selftest() } }
    }

    func selftest() {
        let js = """
        (()=>{ const n=(+localStorage.getItem('rz.selftest')||0)+1; localStorage.setItem('rz.selftest',n);
          return JSON.stringify({game:window.__rz&&__rz.GAME.id, state:window.__rz&&__rz.state, games:window.__rz&&__rz.GAMES.map(g=>g.id),
            runs:n, fonts:{russo:document.fonts.check('10px "Russo One"'), plex:document.fonts.check('600 10px "IBM Plex Mono"')},
            audio:!!(window.AudioContext||window.webkitAudioContext), size:[innerWidth,innerHeight], origin:location.origin, errors:window.__errs}); })()
        """
        web.evaluateJavaScript(js) { res, err in
            print(res as? String ?? "грешка: \(String(describing: err))")
            if let i = self.args.firstIndex(of: "--snapshot"), i + 1 < self.args.count {
                self.web.takeSnapshot(with: nil) { img, _ in
                    if let img = img, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                       let png = rep.representation(using: .png, properties: [:]) {
                        try? png.write(to: URL(fileURLWithPath: self.args[i + 1]))
                    }
                    self.quitSoon()
                }
            } else { self.quitSoon() }
        }
    }
    func quitSoon() {     // localStorage се записва асинхронно — малко време преди изхода
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { NSApp.terminate(nil) }
    }

    func buildMenu() {
        let main = NSMenu()
        let appItem = NSMenuItem(); main.addItem(appItem)
        let am = NSMenu()
        am.addItem(withTitle: "За „Резонанс“", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        am.addItem(.separator())
        am.addItem(withTitle: "Скрий „Резонанс“", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        am.addItem(withTitle: "Изход от „Резонанс“", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = am
        let viewItem = NSMenuItem(); main.addItem(viewItem)
        let vm = NSMenu(title: "Изглед")
        vm.addItem(withTitle: "Цял екран", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
            .keyEquivalentModifierMask = [.command, .control]
        viewItem.submenu = vm
        let winItem = NSMenuItem(); main.addItem(winItem)
        let wm = NSMenu(title: "Прозорец")
        wm.addItem(withTitle: "Смали", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        wm.addItem(withTitle: "Затвори", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        winItem.submenu = wm
        NSApp.mainMenu = main
        NSApp.windowsMenu = wm
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
