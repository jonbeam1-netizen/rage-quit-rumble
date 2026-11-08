import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadManifest } from '../characters.js';
import { loadProfile, colorHex } from '../profile.js';
import { loadKits } from './kits.js';
import { World, KITS } from './world.js';
import { LocalPlayer, RemotePlayer } from './player.js';
import { Net } from './net.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const profile = loadProfile();
if (!profile) location.replace('index.html');

const MINIGAMES = [
  ['Shooter', 'STRAFTAT meets ROUNDS. Phase 3.'],
  ['Mini golf', 'Phase 5.'],
  ['Kart race', 'Later.'],
  ['Anti-grav racer', 'Later.'],
  ['Dogfight', 'Later.'],
  ['Brawl', 'Smash-style, rollback. Later.'],
];

// ---------------------------------------------------------------- renderer
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.info.autoReset = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.45, 0.95);
composer.addPass(bloom);
composer.addPass(new OutputPass());
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- camera orbit
const cam = { yaw: Math.PI, pitch: 0.32, dist: 6.5, dragging: false, lx: 0, ly: 0 };
canvas.addEventListener('pointerdown', (e) => { cam.dragging = true; cam.lx = e.clientX; cam.ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', (e) => { cam.dragging = false; canvas.releasePointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!cam.dragging) return;
  cam.yaw -= (e.clientX - cam.lx) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - cam.ly) * 0.004, -0.1, 1.2);
  cam.lx = e.clientX; cam.ly = e.clientY;
});
canvas.addEventListener('wheel', (e) => { cam.dist = THREE.MathUtils.clamp(cam.dist + Math.sign(e.deltaY) * 0.6, 2.5, 12); }, { passive: true });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// ---------------------------------------------------------------- state
let world, me, manifest;
const players = new Map(); // id -> RemotePlayer
const net = new Net();
const status = (t) => { $('loading').style.display = t ? 'grid' : 'none'; $('loadtext').textContent = t || ''; };
const toast = (text, ms = 3500) => { const el = document.createElement('div'); el.className = 'toast'; el.textContent = text; $('toasts').appendChild(el); setTimeout(() => el.remove(), ms); };

function playerList() {
  const rows = [[net.id, profile, net.isHost ? 'host' : `${net.ping} ms`]];
  for (const [id, p] of players) rows.push([id, p.profile, net.isHost ? `${net.pings.get(id) ?? '…'} ms` : '']);
  $('players').innerHTML = rows.map(([id, p, meta]) => `<div class="pl"><span class="dot" style="background:${colorHex(p.color)}"></span><span class="pn">${esc(p.name)}</span><span class="pm">${meta}</span></div>`).join('');
  $('count').textContent = `${rows.length}/8`;
  if (net.isHost) screen();
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let picked = -1;
function screenData() {
  return { title: 'RAGE QUIT RUMBLE', code: net.code, highlight: picked < 0 ? -1 : picked + 1, lines: [`${players.size + 1} of 8 players in the lobby · host picks the game`, ...MINIGAMES.map(([n, d], i) => `${i + 1}. ${n}  —  ${d}`)] };
}
function screen() { const d = screenData(); world.drawHostScreen(d); if (net.isHost) net.broadcast({ t: 'screen', d }); }

function addRemote(id, prof) {
  if (players.has(id) || id === net.id) return players.get(id);
  const rp = new RemotePlayer(scene, manifest, prof);
  players.set(id, rp);
  playerList();
  toast(`${prof.name} joined`);
  return rp;
}
function removeRemote(id) {
  const rp = players.get(id);
  if (!rp) return;
  toast(`${rp.profile.name} left`);
  rp.dispose(); players.delete(id); playerList();
}

// ---------------------------------------------------------------- network wiring
function wireHost() {
  net.on('join', (id, prof) => {
    const rp = addRemote(id, prof);
    const list = [{ id: net.id, profile, s: me.state() }];
    for (const [pid, p] of players) if (pid !== id) list.push({ id: pid, profile: p.profile, s: p.buffer.at(-1) ? { p: p.buffer.at(-1).p.toArray(), r: p.buffer.at(-1).r, a: p.buffer.at(-1).a } : null });
    net.sendTo(id, { t: 'welcome', id, code: net.code, players: list, screen: screenData() });
    net.broadcast({ t: 'join', player: { id, profile: prof } }, id);
    rp.push({ p: world.spawn.toArray(), r: 0, a: 'Idle' }, performance.now());
  });
  net.on('leave', (id) => removeRemote(id));
  net.on('state', (id, s) => players.get(id)?.push(s, performance.now()));
  net.on('emote', (id, e) => players.get(id)?.emote(e));
  setInterval(() => {
    const snap = { t: 'S', players: { [net.id]: me.state() } };
    for (const [id, p] of players) { const b = p.buffer.at(-1); if (b) snap.players[id] = { p: b.p.toArray(), r: b.r, a: b.a }; }
    net.broadcast(snap);
    if (me.pendingEmote) { net.broadcast({ t: 'E', id: net.id, e: me.pendingEmote }); me.pendingEmote = null; }
  }, 50);
  setInterval(playerList, 1000);
}
function wireClient() {
  net.on('welcome', (msg) => {
    for (const p of msg.players) { if (p.id === net.id) continue; const rp = addRemote(p.id, p.profile); if (p.s) rp.push(p.s, performance.now()); }
    world.drawHostScreen(msg.screen);
  });
  net.on('join', (id, prof) => addRemote(id, prof));
  net.on('leave', (id) => removeRemote(id));
  net.on('snapshot', (msg) => { const now = performance.now(); for (const [id, s] of Object.entries(msg.players)) { if (id === net.id) continue; (players.get(id) || null)?.push(s, now); } });
  net.on('emote', (id, e) => players.get(id)?.emote(e));
  net.on('toast', (text) => toast(text));
  net.on('message', (msg) => { if (msg.t === 'screen') world.drawHostScreen(msg.d); });
  net.on('disconnected', () => { toast('Host left. Back to the picker…', 4000); setTimeout(() => location.replace('index.html'), 2500); });
  net.on('error', (e) => toast(e.message || String(e), 5000));
  setInterval(() => { net.send({ t: 's', ...me.state() }); if (me.pendingEmote) { net.send({ t: 'e', e: me.pendingEmote }); me.pendingEmote = null; } }, 50);
  setInterval(playerList, 1000);
}

// ---------------------------------------------------------------- HUD
function hud() {
  const link = `${location.origin}${location.pathname.replace(/lobby\.html$/, '')}index.html?join=${net.code}`;
  $('code').textContent = net.code;
  $('copy').onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Invite link copied'); } catch { prompt('Copy this link', link); } };
  $('lag').oninput = () => { net.lagMs = +$('lag').value; $('lagv').textContent = net.lagMs ? `+${net.lagMs} ms` : 'off'; };
  $('bloomtoggle').onchange = () => { bloom.enabled = $('bloomtoggle').checked; };
  $('leave').onclick = () => { net.destroy(); location.href = 'index.html'; };
  if (net.isHost) {
    $('hostpanel').style.display = 'block';
    $('games').innerHTML = MINIGAMES.map(([n, d], i) => `<button data-i="${i}"><b>${n}</b><small>${d}</small></button>`).join('');
    $('games').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      picked = +b.dataset.i;
      const text = `Host picked ${MINIGAMES[picked][0]}. ${MINIGAMES[picked][1]}`;
      toast(text); net.broadcast({ t: 'toast', text }); screen();
    };
  }
  $('hud').style.display = 'block';
}

// ---------------------------------------------------------------- boot
(async () => {
  status('Loading characters…');
  manifest = await loadManifest();
  status('Loading the venue…');
  await loadKits(KITS, (p) => status(`Loading the venue… ${Math.round(p * 100)}%`));
  world = new World(scene);
  world.build();
  status('Entering the lobby…');
  me = new LocalPlayer(scene, manifest, profile, world, camera);
  await me.ready;
  if (params.get('room')) {
    status(`Joining room ${params.get('room').toUpperCase()}…`);
    wireClient();
    try { await net.join(params.get('room'), profile); }
    catch (e) { status(''); toast(e.message || 'Could not join', 6000); setTimeout(() => location.replace('index.html?join=' + params.get('room')), 3000); return; }
  } else {
    status('Opening a room…');
    await net.host();
    wireHost();
    screen();
  }
  playerList();
  hud();
  status('');
  window.rqr = { me, cam, world, net, players, camera }; // debug handle
  toast(net.isHost ? `Room ${net.code} is open. Copy the invite link for your friends.` : `Joined room ${net.code}`, 5000);
})().catch((err) => { console.error(err); status('Error: ' + (err.message || err)); });

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
const ray = new THREE.Raycaster();
let fpsT = 0, frames = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(0.05, clock.getDelta());
  const now = performance.now();
  if (me) {
    me.update(dt);
    for (const p of players.values()) p.update(dt, now);
    const target = me.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const off = new THREE.Vector3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)).multiplyScalar(cam.dist);
    let desired = target.clone().add(off);
    // Pull the camera in front of any wall/roof between the player and the camera.
    ray.set(target, off.clone().normalize());
    ray.far = cam.dist + 0.3;
    const hit = ray.intersectObjects(world.occluders, false)[0];
    if (hit) desired = target.clone().addScaledVector(off.clone().normalize(), Math.max(1.2, hit.distance - 0.4));
    camera.position.lerp(desired, Math.min(1, dt * (hit ? 20 : 10)));
    camera.lookAt(target);
  }
  renderer.info.reset();
  composer.render();
  frames++; fpsT += dt;
  if (fpsT >= 1) { $('fps').textContent = `${frames} fps · ${renderer.info.render.calls} calls · ${(renderer.info.render.triangles / 1000).toFixed(0)}k tris`; frames = 0; fpsT = 0; }
});
