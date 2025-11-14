## Installation des dépendances

Prérequis :
- Node.js (LTS recommandé — v21+)
- Git
- npm (fourni avec Node) — ou yarn (optionnel, le dépôt indique yarn dans packageManager)

## Variables d'environement

- Mettre l'adresse IP de votre machine dans le fichier .env.local
```powershell
VITE_LOCAL_IP=x.x.x.x

Prérequis :
- Node.js (LTS recommandé — v21+)
- Git
- npm (fourni avec Node) — ou yarn (optionnel, le dépôt indique yarn dans packageManager)

Installation (PowerShell / Windows) :
```powershell
# depuis le dossier du projet
cd c:\Users\oscos\Desktop\deluge-extensions

# installer les dépendances avec npm
npm install
```

(Si vous préférez yarn)
```powershell
yarn install
```

## Exécution du projet (développement & production)

Lancer l'environnement de développement (serveur frontend + serveur de streaming) :
```powershell
npm run dev:all
```

Autres scripts utiles :
```powershell
# serveur de développement frontend seul
npm run dev

# démarrer le serveur backend de streaming seul
npm run dev:server

# build de production
npm run build

# servir la build localement pour tests
npm run preview

# vérification de types
npm run typecheck

# lancer les tests
npm run test
```

Notes :
- Le script de développement combiné est `dev:all` (exécute simultanément le frontend et le serveur de stream).
- Adaptez la commande si vous utilisez yarn : `yarn dev:all`.

## Modifications apportées dans ce fork

Ajout dde la fonction Remote de l'ecran pour l'avoir sur son smartphone et sans Latence

# ![DEx Logo](https://github.com/user-attachments/assets/f10ef2df-f569-49a0-a20c-0716f2e33579)

# DEx: Deluge EXtensions ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Web MIDI API](https://img.shields.io/badge/Web_MIDI_API-Compatible-green)](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) [![Platform](https://img.shields.io/badge/Platform-Web/Mobile-blue)](https://github.com/silicakes/deluge-extensions) [![Synthstrom Deluge](https://img.shields.io/badge/Synthstrom-Deluge-orange)](https://synthstrom.com/product/deluge/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![Made with JavaScript](https://img.shields.io/badge/Made_with-JavaScript-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Live Demo](https://img.shields.io/badge/Live_Demo-Available-ff69b4)](https://dex.silicak.es) [![PWA](https://img.shields.io/badge/PWA-Enabled-5E35B1)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/silicakes/deluge-extensions)

Unlock the full potential of your Synthstrom Deluge with **DEx**! This web-based powerhouse connects directly to your Deluge via USB MIDI, offering a crystal-clear view of its displays and a suite of tools for monitoring, debugging, and advanced control. 🚀

**See your Deluge like never before!** Whether you're performing live, teaching, or just exploring, DEx mirrors the Deluge's displays directly in your browser - on desktop or mobile devices!

## ✨ [Try the Live Demo at dex.silicak.es!](https://dex.silicak.es) ✨

No installation needed - just visit [dex.silicak.es](https://dex.silicak.es) in a WebMIDI-compatible browser and connect your Deluge!

### Web Demo

https://github.com/user-attachments/assets/590b5b20-30ba-4cc3-8fdb-a0af7f2b97a2

### Mobile (Android) Demo

https://github.com/user-attachments/assets/be507463-47b3-4adc-a98c-2b184429e9fa

## Key Features 🌟

- **👀 Dual Display Mirroring**: View _both_ the OLED and the classic 7-Segment displays in real-time. Perfect for seeing intricate details or getting a quick overview.
- **📱 Fullscreen Mode**: Enter a distraction-free fullscreen view that works beautifully on both desktop and mobile devices! Perfect for performances or when projecting your Deluge's display to an audience.
- **🎨 Customizable OLED View**: Tailor the OLED display to your liking! Adjust pixel scaling (size) and choose custom foreground/background colors. Settings are saved automatically!
- **↔️ Resizable Display**: Instantly resize the mirrored display canvas with dedicated buttons for the perfect fit on your screen.
- **⚙️ Advanced Settings Drawer**: Access technical controls like display customization, manual refresh triggers, ping tests, and decoding tests.
- **🕵️‍♂️ UI Monitor Mode**: Track _every_ pixel change on the Deluge display. Great for understanding UI behavior or debugging complex patches.
- **🐛 Live Debug Output**: See internal debug messages directly from your Deluge, complete with timestamps. Activate 'Auto Debug' to poll for messages automatically.
- **ℹ️ Device Information**: Quickly query your Deluge for its firmware version and the status of community features.
- **🔌 Auto-Connect**: Remembers your MIDI device and connects automatically on load (toggleable).
- **✉️ Custom SysEx Commands**: Send _any_ SysEx command directly to your Deluge. Includes clickable examples for common commands!
- **✅ Ping Test**: Quickly check the connection status to your Deluge.
- **📸 Screenshot**: Capture the current display as a PNG image; click the camera button or press 's' to save.
- **📋 Copy Base64**: Copy the current OLED display as a gzipped, base64-encoded string (in a markdown directive) by clicking the copy icon or pressing 'c'.
- **❓ Keyboard Shortcuts Help**: Quickly view all available keyboard shortcuts by pressing '?' or clicking the help button.
- **📱 Progressive Web App**: Install DEx directly to your home screen and use it offline. UI components work without an internet connection!
- **🔄 Update Notifications**: When a new version is available, you'll get a notification allowing you to update instantly.
- **🔄 Display Type Toggle**: Switch between the OLED (right) and 7-Segment (left) displays using the convenient slider.
- **🗂️ SD-Card File Browser** _(requires Deluge **Community Firmware ≥ 1.3.0** – currently in **beta**)_:

  - Explore your card with a **lazy-loaded tree view** that only requests directory contents on demand.
  - **🔍 Fuzzy Search**: Instantly find files with intelligent search that handles typos and partial matches. Press `Ctrl+F` to start searching!
  - **Sidebar UI** with file-type icons, single-selection highlight, and keyboard navigation.
  - **Drag-and-drop** inside the tree to move files & folders.
  - **Upload** files from your computer by dropping them onto the browser; **download** any file back with one click.
  - Full **CRUD**: create new folders/files, rename items inline (F2 or double-click), and delete with confirmation dialogs.
  - Built-in transfer queue, visual progress bar, and conflict-resolution prompts ensure safe operations.
  - Works entirely over MIDI – no additional drivers or SD-card removal required!

  <img width="1871" alt="image" src="https://github.com/user-attachments/assets/8ba53855-ec9b-4226-812e-bde4d5bf2e06" />

## Getting Started 🚀

### Prerequisites

- A modern web browser with **WebMIDI support** (like Chrome, Edge, or Opera).
- Your Synthstrom Deluge connected to your computer or mobile device via **USB**.
- For mobile use: An Android device with USB OTG support or iOS device (with appropriate adapters).
- **Deluge running Community Firmware 1.3.0 or later** is required _only_ for the File Browser feature (all other functionality works on any firmware).

### Setup

1.  🔌 Connect your Deluge to your computer or mobile device via USB.
2.  📂 Open [dex.silicak.es](https://dex.silicak.es) in a compatible web browser.
3.  🔐 When prompted by the browser, **Allow** MIDI access.
4.  🖱️ Select your Deluge from the MIDI **input** and **output** dropdown menus.
    - ✨ **Pro Tip:** If a device named `Deluge Port 3` is found, DEx will try to select it automatically if 'Connect Automatically' is checked!
5.  📱 **PWA Installation** (Optional): On compatible browsers, look for the "Add to Home Screen" prompt or use the browser's install option to install DEx as a standalone app.

## How to Use 🎛️

### Main Controls

- **Auto Display**: Automatically begins polling the Deluge display as soon as a valid MIDI output is connected (toggleable).
- **Start Display Refresh**: Manually begins polling the Deluge for display updates (OLED or 7-Segment).
- **Display Type Toggle**: Switch between the OLED (right) and 7-Segment (left) displays using the convenient slider.
- **Get Debug Messages**: Manually requests the latest debug info from the Deluge.
- **Monitor UI Changes**: Toggles the UI monitoring mode on/off.
- **Full Screen**: Enters a distraction-free fullscreen mode that optimizes the display for your current device and screen size. Press 'ESC' or tap the button again to exit.
- **📸 Screenshot**: Download a snapshot of the current canvas as a PNG by clicking the camera icon or pressing 's'.
- **📋 Copy Base64**: Copy the current OLED display as a gzipped, base64-encoded string (in a markdown directive) by clicking the copy icon or pressing 'c'.
- **❓ Keyboard Help**: View all available keyboard shortcuts by clicking the question mark icon or pressing '?'.
- **⚙️ (Gear Icon)**: Opens the Advanced Settings Drawer.

### Keyboard Shortcuts

DEx provides convenient keyboard shortcuts for common actions:

- **S**: Capture screenshot
- **C**: Copy canvas as base64
- **F**: Toggle fullscreen
- **+ / =**: Increase canvas size
- **-**: Decrease canvas size
- **Ctrl+F / Cmd+F**: Focus file browser search (when file browser is open)
- **Escape**: Clear file browser search
- **?**: Toggle keyboard shortcuts help overlay

### Advanced Settings Drawer

- **OLED Display Settings**: Customize pixel size and colors. Click 'Apply Settings' to see changes and save them.
- **Display Controls**: Manually trigger OLED/7-Segment updates, run a Ping test, or test internal decoding functions.
- **Deluge Info**: Get Firmware Version and Features Status.
- **Custom SysEx**: Input field and 'Send' button for arbitrary commands. Clickable examples provided!
- **Debug Output**: Shows incoming debug messages, version info, etc. Features 'Clear' and 'Auto Debug' buttons.

### Mobile Usage Tips

**iOS currently doesn't support WebMIDI in its common browsers (Safari, Chrome, etc.).
Although some third-party browsers claim patched support, I can't recommend any because I don't use iPhone.**

- For the best experience on mobile devices, use the **Full Screen** button to maximize the display.
- On Android, you may need a USB OTG (On-The-Go) adapter to connect your Deluge.
  Although for me, it works with a regular USB-C to USB-B cable.
-
- Rotate your device to landscape orientation for an optimal viewing experience.
- Press 'f' on external keyboards or tap the Full Screen button again to exit fullscreen mode.

### PWA & Offline Features

DEx is built as a Progressive Web App (PWA), providing these benefits:

- **📴 Offline Access**: The app's interface will load even without an internet connection.
- **⚡ Faster Loading**: Assets are cached for quicker startup times on subsequent visits.
- **🏠 Installable**: Add DEx to your home screen for app-like access without opening a browser.
- **🔔 Update Notifications**: When a new version is available, you'll see a prompt to update.
- **💻 Desktop Support**: Install on desktop computers too for quick access.

To install:

1. In Chrome/Edge (desktop): Click the install icon in the address bar
2. On Android: Select "Add to Home Screen" from the browser menu
3. On iOS: Use Safari's share menu and select "Add to Home Screen"

Note: While the UI works offline, MIDI connectivity naturally requires your Deluge to be physically connected.

## Technical Tidbits 🤓

DEx leverages the **WebMIDI API** to communicate with the Deluge using MIDI System Exclusive (SysEx) messages. It sends commands to request information and receives data back, including display states and debug messages.

- **Display Rendering**: The OLED display (128×48 pixels) data is received in a compressed 7-to-8 bit RLE format. DEx unpacks this efficiently and renders it onto an HTML `<canvas>` element. Delta updates are used for smoother refreshes.
- **Copy Base64**: The OLED buffer can be copied as a gzipped, base64-encoded string (not a PNG) for sharing or embedding. The output is a markdown directive like `::screen[BASE64]{alt="Canvas Image"}`.
- **Responsive Design**: The fullscreen mode uses adaptive scaling to provide optimal visibility on displays of all sizes, from mobile phones to large projector screens.
- **Progressive Web App**: DEx uses service workers and a web app manifest to enable offline capabilities, app installation, and background updates.
- **SysEx Format**: Deluge commands generally follow the format `F0 7D [command] [parameters] F7`.
  - Ping: `F0 7D 00 F7`
  - Request OLED: `F0 7D 02 00 01 F7`
  - Request 7-Segment: `F0 7D 02 01 00 F7`
  - Request Debug: `F0 7D 03 00 01 F7`
  - Request Features: `F0 7D 03 01 01 F7`
  - Request Version: `F0 7D 03 02 01 F7`

## Testing Guidelines 🧪

To keep DEx reliable and prevent regressions, **every new feature _must_ ship with automated tests**. Our testing philosophy is driven by five core rules:

1. **Test everything that ships** › If a user can click it, see it or rely on it, it **needs a test**. Missing coverage is treated as technical debt.
2. **vitest + @testing-library** › All unit and integration tests are written with [Vitest](https://vitest.dev/) and the [`@testing-library/*`](https://testing-library.com/) family (DOM, Vue/React, user-event&hairsp;…). Do **not** mix in other frameworks unless explicitly discussed in an ADR.
3. **Integration over mocks** › Favour realistic user-flow tests that exercise multiple components together. Only mock when talking to _irreversible_ side-effects (e.g. `window.open`) or external services that are offline during CI.
4. **Make code testable** › Prefer pure, side-effect-free functions, clear separation of concerns and deterministic logic. If something is hard to test, rewrite it rather than sprinkle mocks.
5. **Hardware I/O is tested on the real Deluge** › For SysEx communication (see `plans/file-browser/000-Sysex-deluge-filesystem-overview.md` & `plans/file-browser/tmp_smsysex_spec.md`) we run **end-to-end hardware tests** that send and receive messages to an attached Synthstrom Deluge. These tests are flagged with `@hardware` and are excluded from the default CI matrix (run them locally with the device connected or in the dedicated "hardware-ci" job).

### Directory layout

```
└─ tests/
   ├─ unit/          # Fast, pure, no DOM
   ├─ integration/   # Render components, exercise user flows
   └─ hardware/      # Requires a connected Deluge (tagged @hardware)
```

### Running tests

```bash
# All fast tests (unit + integration)
pnpm test

# Include slow hardware tests (requires Deluge connected)
pnpm test -- --hardware
```

Vitest configuration lives in `vitest.config.ts`; refer to it for aliasing, globals and coverage thresholds.

## Contributing 🤝

Pull Requests are welcome! If you have ideas for improvements or find bugs, feel free to open an issue or submit a PR.

## License 📜

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Disclaimer**: This is an unofficial tool and is not affiliated with Synthstrom Audible.

## Acknowledgments 🙏

- Built for the amazing Synthstrom Deluge community.
- Inspired by the original [bfredl/delugeclient](https://github.com/bfredl/delugeclient).
- Uses an RLE unpacking algorithm adapted for Deluge display data.

Happy Deluging! 🎉
