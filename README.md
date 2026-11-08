# Rage Quit Rumble

3D browser party game for friends. No install, no build step: open `index.html`
through any static web server (GitHub Pages in production).

- `index.html` + `src/picker.js` - character picker + profile (name, team color, browser save, locked slots).
- `src/profile.js` - profile storage (localStorage key `rqr.profile`).
- `assets/portraits/` - pre-rendered portrait PNGs (regenerate: `python tools/portrait_server.py` then open `/tools/portraits.html`).
- `lobby.html` + `src/lobby/` - the 3D lobby: `world.js` venue layout, `kits.js` kit loader, `player.js` local/remote avatars, `net.js` PeerJS rooms, `main.js` glue + HUD.
- `src/shooter/` - the Shooter minigame (runs inside lobby.html on the lobby's PeerJS connections): `arena.js` seeded night-rooftop arena with 3D box collision, `game.js` host-authoritative rounds/health/scores + shooter-side hit judgement + card picks, `avatar.js` armed characters with name/health tags, `bullets.js` instanced bullets and particles, `cards.js` upgrade cards and stats, `sfx.js` synthesized sounds. Host picks "Shooter" in the lobby; everyone switches scenes without reconnecting. Rounds: last one standing (75 s limit), first to 3 round wins; everyone who did not win a round picks one of three upgrade cards (ROUNDS style). Alone = practice mode with target dummies. Controls: WASD, Space jump, Shift dash, click shoot (pointer lock), R reload, Esc frees the mouse.
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
