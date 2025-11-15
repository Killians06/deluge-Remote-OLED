# DEx - Deluge Toolkit (Electron Desktop)

## Mode développement

Lancer l'application Electron en mode développement :

```bash
npm run electron:dev
```

Cette commande :
- Démarre le serveur Vite sur http://localhost:5173
- Lance le serveur WebSocket sur le port 3001
- Ouvre l'application Electron avec DevTools

## Build production

### Build pour votre plateforme actuelle
```bash
npm run electron:build
```

### Build pour une plateforme spécifique
```bash
npm run electron:build:win    # Windows (NSIS installer + portable)
npm run electron:build:mac    # macOS (DMG + ZIP)
npm run electron:build:linux  # Linux (AppImage + DEB)
```

Les builds seront disponibles dans le dossier `release/`.

## Structure Electron

```
electron/
├── main.js      # Process principal (gère la fenêtre, le serveur)
└── preload.js   # Script de préchargement (contexte isolé)

dist-server/     # Serveur WebSocket compilé (production)
release/         # Builds finaux
```

## Fonctionnalités Electron

- ✅ WebMIDI natif (aucune modification du code MIDI)
- ✅ Serveur WebSocket intégré pour le streaming
- ✅ Menu natif (File, Edit, View, Help)
- ✅ DevTools intégré
- ✅ Multi-plateforme (Windows, macOS, Linux)
- ✅ Icône et nom d'application personnalisés

## Notes

- En dev, le serveur WebSocket doit être lancé séparément avec `npm run dev:server` ou via `electron:dev`
- En production, le serveur est automatiquement démarré par Electron
- Le code source de l'app web reste 100% identique (PWA + Desktop)
