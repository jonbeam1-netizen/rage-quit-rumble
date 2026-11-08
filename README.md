# Rage Quit Rumble

3D browser party game for friends. No install, no build step: open `index.html`
through any static web server (GitHub Pages in production).

- `viewer.html` - character viewer: 21 Quaternius characters, all animations, part toggles, recolor.
- `src/characters.js` - shared loader (characters, animation packs, playback).
- `assets/characters/` - 21 GLB characters + `manifest.json` (generated).
- `assets/animations/` - extra animation packs (see its README).
- `docs/` - research notes.

Local dev: `python -m http.server 8080` in this folder, then open http://localhost:8080/viewer.html

Characters: Quaternius Ultimate Modular Men + Women, CC0 (see `LICENSES/`).
