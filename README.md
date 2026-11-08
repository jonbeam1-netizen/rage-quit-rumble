# Rage Quit Rumble

3D browser party game for friends. No install, no build step: open `index.html`
through any static web server (GitHub Pages in production).

- `index.html` + `src/picker.js` - character picker + profile (name, team color, browser save, locked slots).
- `src/profile.js` - profile storage (localStorage key `rqr.profile`).
- `assets/portraits/` - pre-rendered portrait PNGs (regenerate: `python tools/portrait_server.py` then open `/tools/portraits.html`).
- `lobby.html` + `src/lobby/` - the 3D lobby: `world.js` venue layout, `kits.js` kit loader, `player.js` local/remote avatars, `net.js` PeerJS rooms, `main.js` glue + HUD.
- `assets/env/` - one GLB per asset pack (kit) + catalog JSON, built by `tools/blender_kit_export.py` from the Unity packs; `tools/kitsheet.html` previews a kit.
- `viewer.html` - character viewer: 21 Quaternius characters, all animations, part toggles, recolor.
- `src/characters.js` - shared loader (characters, animation packs, playback).
- `assets/characters/` - 21 GLB characters + `manifest.json` (generated).
- `assets/animations/` - extra animation packs (see its README).
- `docs/` - research notes.

Local dev: `python -m http.server 8080` in this folder, then open http://localhost:8080/viewer.html

Characters: Quaternius Ultimate Modular Men + Women, CC0 (see `LICENSES/`).
Venue kits: free Unity Asset Store packs (SimplePoly City, Modular Lowpoly Streets, Low Poly Dungeons Lite, Simple Nature, RPG Poly Lite, Arcade Machines 01/02/PolyPack, DS Air Hockey, Poly Board Games, Toony Tiny City Demo), converted to GLB for this game.

Deploy: run `python tools/bump.py` (cache-busts module URLs), commit, push to main. GitHub Pages serves it.
