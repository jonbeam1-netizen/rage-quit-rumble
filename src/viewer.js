import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadManifest, loadCharacter, loadAnimationPacks, play } from './characters.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');

// --- scene -----------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);
scene.fog = new THREE.Fog(0x14161a, 12, 30);

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
camera.position.set(2.6, 1.6, 3.4);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.95, 0);
controls.enableDamping = true;
controls.autoRotateSpeed = 1.2;

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

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(6, 64),
  new THREE.MeshStandardMaterial({ color: 0x1b1e25, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(12, 24, 0x3a4050, 0x262a33);
grid.position.y = 0.001;
scene.add(grid);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// --- state -----------------------------------------------------------------
let manifest, character = null, extraClips = [], currentClipName = 'Idle';
const status = (t) => { $('status').textContent = t; $('status').style.display = t ? '' : 'none'; };

async function selectCharacter(info) {
  status('Loading ' + info.group + '/' + info.name + '...');
  if (character) scene.remove(character.root);
  character = await loadCharacter(info);
  scene.add(character.root);
  const box = new THREE.Box3().setFromObject(character.root);
  const h = box.max.y - box.min.y;
  controls.target.set(0, h * 0.52, 0);
  document.querySelectorAll('#men button, #women button')
    .forEach((b) => b.classList.toggle('active', b.dataset.id === info.id));
  buildAnimList();
  buildParts();
  buildColors();
  playByName(currentClipName);
  $('hud').innerHTML = '<b>' + info.name + '</b> (' + info.group + ') &middot; ' +
    info.tris.toLocaleString() + ' tris &middot; ' + info.bones + ' bones &middot; ' +
    allClips().length + ' clips &middot; height ' + h.toFixed(2) + ' m';
  status('');
  location.hash = info.id;
}

function allClips() { return [...character.clips, ...extraClips]; }

function playByName(name) {
  const clips = allClips();
  const clip = clips.find((c) => c.name === name) || clips[0];
  if (!clip) return;
  currentClipName = clip.name;
  play(character, clip, { loop: $('loop').checked, speed: parseFloat($('speed').value) });
  document.querySelectorAll('#anims button')
    .forEach((b) => b.classList.toggle('active', b.textContent === clip.name));
}

function buildAnimList() {
  const el = $('anims');
  el.innerHTML = '';
  for (const clip of allClips()) {
    const b = document.createElement('button');
    b.textContent = clip.name;
    b.title = clip.duration.toFixed(2) + 's';
    b.onclick = () => playByName(clip.name);
    el.appendChild(b);
  }
  $('animcount').textContent = '(' + allClips().length + ')';
}

function buildParts() {
  const el = $('parts');
  el.innerHTML = '';
  for (const [name, mesh] of Object.entries(character.parts)) {
    const l = document.createElement('label');
    l.className = 'row';
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = mesh.visible;
    c.onchange = () => { mesh.visible = c.checked; };
    l.append(c, name);
    el.appendChild(l);
  }
}

function buildColors() {
  const el = $('colors');
  el.innerHTML = '';
  for (const [name, mat] of character.materials) {
    if (!mat.color) continue;
    const l = document.createElement('label');
    l.className = 'row';
    const c = document.createElement('input');
    c.type = 'color';
    c.value = '#' + mat.color.getHexString();
    c.oninput = () => mat.color.set(c.value);
    l.append(c, name);
    el.appendChild(l);
  }
}

// --- UI --------------------------------------------------------------------
$('speed').oninput = () => {
  const v = parseFloat($('speed').value);
  $('speedv').textContent = v.toFixed(1);
  if (character && character.current) character.current.timeScale = v;
};
$('loop').onchange = () => playByName(currentClipName);
$('rotate').onchange = () => { controls.autoRotate = $('rotate').checked; };
controls.autoRotate = true;

window.addEventListener('keydown', (e) => {
  if (!manifest || !character || e.target.tagName === 'INPUT') return;
  const chars = manifest.characters;
  const ci = chars.findIndex((c) => c.id === character.info.id);
  const clips = allClips();
  const ai = clips.findIndex((c) => c.name === currentClipName);
  if (e.key === 'ArrowRight') selectCharacter(chars[(ci + 1) % chars.length]);
  if (e.key === 'ArrowLeft') selectCharacter(chars[(ci - 1 + chars.length) % chars.length]);
  if (e.key === 'ArrowDown') playByName(clips[(ai + 1) % clips.length].name);
  if (e.key === 'ArrowUp') playByName(clips[(ai - 1 + clips.length) % clips.length].name);
  if (e.key === ' ') { e.preventDefault(); if (character.current) character.current.paused = !character.current.paused; }
});

// --- boot ------------------------------------------------------------------
(async () => {
  manifest = await loadManifest();
  for (const info of manifest.characters) {
    const b = document.createElement('button');
    b.textContent = info.name.replace(/_/g, ' ');
    b.dataset.id = info.id;
    b.onclick = () => selectCharacter(info);
    $(info.group).appendChild(b);
  }
  extraClips = await loadAnimationPacks(manifest.animationPacks || []);
  const wanted = decodeURIComponent(location.hash.slice(1));
  await selectCharacter(manifest.characters.find((c) => c.id === wanted) || manifest.characters[0]);
})().catch((err) => { status('Error: ' + err.message); console.error(err); });

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (character) character.mixer.update(dt);
  controls.update();
  renderer.render(scene, camera);
});
