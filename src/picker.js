import * as THREE from 'three';
import { loadManifest, loadCharacter, play, applyColors } from './characters.js';
import { TEAM_COLORS, NAME_MAX, defaultProfile, loadProfile, saveProfile, sanitizeName, colorHex } from './profile.js';

const $ = (id) => document.getElementById(id);

// Future cosmetic unlocks. Shown as locked cards so players know there is more to earn.
const LOCKED_SLOTS = [
  { id: 'locked_1', hint: 'Earned in a minigame' },
  { id: 'locked_2', hint: 'Earned in a minigame' },
  { id: 'locked_3', hint: 'Secret' },
];

// --- state -----------------------------------------------------------------
let manifest;
let profile = loadProfile() || defaultProfile();
let character = null;
let dirty = false;

// --- 3D preview --------------------------------------------------------------
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);
scene.fog = new THREE.Fog(0x14161a, 8, 20);
const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 100);
camera.position.set(0.6, 1.7, 3.9);
camera.lookAt(0, 1.15, 0);

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x3a2a20, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -3;
sun.shadow.camera.right = sun.shadow.camera.top = 3;
sun.shadow.bias = -0.0005;
scene.add(sun);
const rim = new THREE.DirectionalLight(0xff8a5c, 0.8);
rim.position.set(-3, 3, -3);
scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.MeshStandardMaterial({ color: 0x1b1e25, roughness: 1 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.12, 48), new THREE.MeshStandardMaterial({ color: 0x262a33, roughness: 0.8 }));
podium.position.y = 0.06;
podium.receiveShadow = true;
podium.castShadow = true;
scene.add(podium);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 12, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.4 }));
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.125;
scene.add(ring);

const pivot = new THREE.Group();
pivot.position.y = 0.12;
scene.add(pivot);

// Name tag: a canvas sprite above the head.
const tagCanvas = document.createElement('canvas');
tagCanvas.width = 512; tagCanvas.height = 128;
const tagTex = new THREE.CanvasTexture(tagCanvas);
tagTex.colorSpace = THREE.SRGBColorSpace;
const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthTest: false }));
tag.scale.set(1.2, 0.3, 1);
tag.renderOrder = 10;
scene.add(tag);

function drawTag() {
  const ctx = tagCanvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  const text = sanitizeName(profile.name);
  ctx.font = 'bold 60px system-ui, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = Math.min(500, ctx.measureText(text).width + 60);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, 256 - w / 2, 20, w, 88, 24);
  ctx.fill();
  ctx.fillStyle = colorHex(profile.color);
  ctx.fillText(text, 256, 66);
  tagTex.needsUpdate = true;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function applyColor() {
  const hex = colorHex(profile.color);
  ring.material.color.set(hex);
  ring.material.emissive.set(hex);
  drawTag();
}

let frameHeight = 2.4;
function frameCamera(height) {
  frameHeight = height;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  // Distance so the full height fits vertically (and horizontally on narrow stages).
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const dist = Math.max(height / (2 * Math.tan(vFov / 2)), 1.6 / (2 * Math.tan(hFov / 2))) * 1.05;
  const cy = height / 2;
  camera.position.set(dist * 0.15, cy + dist * 0.12, dist);
  camera.lookAt(0, cy, 0);
}

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  frameCamera(frameHeight);
}
new ResizeObserver(resize).observe(stage);
resize();

async function showCharacter(id) {
  const info = manifest.characters.find((c) => c.id === id) || manifest.characters[0];
  profile.characterId = info.id;
  $('stage').classList.add('loading');
  const next = await loadCharacter(info);
  if (profile.characterId !== info.id) return; // user clicked something else meanwhile
  if (character) pivot.remove(character.root);
  character = next;
  pivot.add(character.root);
  applyColors(character, profile.colors[character.info.id]);
  buildMaterialColors();
  const box = new THREE.Box3().setFromObject(character.root);
  const top = box.max.y + 0.12;            // podium height included
  tag.position.set(0, top + 0.2, 0);
  frameCamera(top + 0.45);                 // fit floor-to-tag with margin
  // Greet, then settle into idle.
  const wave = character.clips.find((c) => c.name === 'Wave');
  const idle = character.clips.find((c) => c.name === 'Idle');
  if (wave) {
    const action = play(character, wave, { loop: false, fade: 0.1 });
    const onDone = (e) => {
      if (e.action !== action) return;
      character.mixer.removeEventListener('finished', onDone);
      if (idle) play(character, idle, { fade: 0.3 });
    };
    character.mixer.addEventListener('finished', onDone);
  } else if (idle) {
    play(character, idle);
  }
  $('stage').classList.remove('loading');
  markSelected();
}

// --- roster UI ---------------------------------------------------------------
function card(info) {
  const el = document.createElement('button');
  el.className = 'card';
  el.dataset.id = info.id;
  el.title = info.name.replace(/_/g, ' ');
  const img = document.createElement('img');
  img.src = 'assets/portraits/' + info.id.replace('/', '_') + '.png';
  img.alt = info.name;
  img.loading = 'lazy';
  const label = document.createElement('span');
  label.textContent = info.name.replace(/_/g, ' ');
  el.append(img, label);
  el.onclick = () => { setDirty(); showCharacter(info.id); };
  return el;
}
function lockedCard(slot) {
  const el = document.createElement('div');
  el.className = 'card locked';
  el.title = slot.hint;
  el.innerHTML = '<div class="lock">&#x1F512;</div><span>???</span>';
  return el;
}
function markSelected() {
  document.querySelectorAll('.card[data-id]').forEach((c) => c.classList.toggle('selected', c.dataset.id === profile.characterId));
}

function buildRoster() {
  const men = $('men'), women = $('women'), locked = $('locked');
  for (const info of manifest.characters) (info.group === 'men' ? men : women).appendChild(card(info));
  for (const slot of LOCKED_SLOTS) locked.appendChild(lockedCard(slot));
}

function buildColors() {
  const el = $('colors');
  for (const c of TEAM_COLORS) {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = c.hex;
    b.title = c.id;
    b.dataset.id = c.id;
    b.onclick = () => { profile.color = c.id; setDirty(); applyColor(); markColor(); };
    el.appendChild(b);
  }
  markColor();
}
function markColor() {
  document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('selected', s.dataset.id === profile.color));
}

// --- character material colors ------------------------------------------------
const prettyName = (n) => n.replace(/[_.]/g, ' ').replace(/([a-z])([A-Z0-9])/g, '$1 $2').trim();

function buildMaterialColors() {
  const el = $('tints');
  el.innerHTML = '';
  const id = character.info.id;
  for (const [name, mat] of character.materials) {
    if (!mat.color) continue;
    const l = document.createElement('label');
    l.className = 'tint';
    const c = document.createElement('input');
    c.type = 'color';
    c.value = '#' + mat.color.getHexString();
    c.oninput = () => {
      profile.colors[id] = profile.colors[id] || {};
      profile.colors[id][name] = c.value;
      mat.color.set(c.value);
      $('tintreset').disabled = false;
      setDirty();
    };
    const span = document.createElement('span');
    span.textContent = prettyName(name);
    l.append(c, span);
    el.appendChild(l);
  }
  $('tintreset').disabled = !profile.colors[id];
}

function resetMaterialColors() {
  delete profile.colors[character.info.id];
  applyColors(character, {});
  buildMaterialColors();
  setDirty();
}

function setDirty() {
  dirty = true;
  $('save').textContent = 'Save';
  $('save').disabled = false;
  $('saved').textContent = '';
}

function doSave() {
  profile = saveProfile(profile);
  $('name').value = profile.name;
  drawTag();
  dirty = false;
  $('save').textContent = 'Saved';
  $('save').disabled = true;
  $('saved').textContent = 'Saved in this browser. Lobby arrives in the next phase.';
}

// --- boot --------------------------------------------------------------------
(async () => {
  manifest = await loadManifest();
  buildRoster();
  buildColors();
  $('name').maxLength = NAME_MAX;
  $('name').value = profile.name;
  $('name').oninput = () => { profile.name = $('name').value; setDirty(); drawTag(); };
  $('name').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); doSave(); } };
  $('save').onclick = doSave;
  $('tintreset').onclick = resetMaterialColors;
  $('random').onclick = () => {
    const chars = manifest.characters;
    showCharacter(chars[Math.floor(Math.random() * chars.length)].id);
    setDirty();
  };
  applyColor();
  await showCharacter(profile.characterId);
  if (!loadProfile()) setDirty(); else { $('save').textContent = 'Saved'; $('save').disabled = true; }

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const chars = manifest.characters;
    const i = chars.findIndex((c) => c.id === profile.characterId);
    if (e.key === 'ArrowRight') { showCharacter(chars[(i + 1) % chars.length].id); setDirty(); }
    if (e.key === 'ArrowLeft') { showCharacter(chars[(i - 1 + chars.length) % chars.length].id); setDirty(); }
    if (e.key === 'Enter') doSave();
  });
})().catch((err) => { $('saved').textContent = 'Error: ' + err.message; console.error(err); });

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (character) character.mixer.update(dt);
  // Gentle sway so the character keeps facing the player.
  pivot.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.35;
  renderer.render(scene, camera);
});
