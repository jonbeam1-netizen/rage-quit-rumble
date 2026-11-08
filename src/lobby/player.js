// Local player (input + movement) and remote players (interpolated from snapshots).
import * as THREE from 'three';
import { loadCharacter, applyColors, play } from '../characters.js';
import { makeNameTag } from '../nametag.js';
import { colorHex } from '../profile.js';

export const EMOTES = { 1: 'Wave', 2: 'Punch_Right', 3: 'Kick_Right', 4: 'Interact', 5: 'Roll' };
const RUN = 5.2, WALK = 2.0, ACCEL = 24, TURN = 12, RADIUS = 0.38;

export class Avatar {
  constructor(scene, manifest, profile) {
    this.scene = scene;
    this.manifest = manifest;
    this.profile = profile;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.character = null;
    this.anim = 'Idle';
    this.tag = makeNameTag(profile.name, colorHex(profile.color));
    this.tag.sprite.position.y = 2.15;
    this.group.add(this.tag.sprite);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex(profile.color)).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
    this.group.add(ring);
    this.ready = this.load();
  }
  async load() {
    const info = this.manifest.characters.find((c) => c.id === this.profile.characterId) || this.manifest.characters[0];
    this.character = await loadCharacter(info);
    applyColors(this.character, this.profile.colors?.[info.id]);
    this.group.add(this.character.root);
    const box = new THREE.Box3().setFromObject(this.character.root);
    this.tag.sprite.position.y = box.max.y + 0.3;
    this.setAnim('Idle', true);
  }
  setAnim(name, force = false) {
    if (!this.character) return;
    if (!force && name === this.anim) return;
    const clip = this.character.clips.find((c) => c.name === name);
    if (!clip) return;
    this.anim = name;
    const oneShot = !['Idle', 'Walk', 'Run', 'Run_Back', 'Run_Left', 'Run_Right', 'Idle_Neutral'].includes(name);
    const action = play(this.character, clip, { loop: !oneShot, fade: oneShot ? 0.08 : 0.18, speed: name === 'Walk' ? 1.1 : 1 });
    if (oneShot) {
      this.busyUntil = performance.now() + clip.duration * 1000 - 120;
      const done = (e) => { if (e.action !== action) return; this.character.mixer.removeEventListener('finished', done); if (this.anim === name) this.setAnim('Idle', true); };
      this.character.mixer.addEventListener('finished', done);
    } else this.busyUntil = 0;
  }
  get busy() { return (this.busyUntil || 0) > performance.now(); }
  update(dt) { this.character?.mixer.update(dt); }
  dispose() { this.scene.remove(this.group); }
}

export class LocalPlayer extends Avatar {
  constructor(scene, manifest, profile, world, camera) {
    super(scene, manifest, profile);
    this.world = world; this.camera = camera;
    this.vel = new THREE.Vector3();
    this.keys = new Set();
    this.yaw = 0;
    this.pendingEmote = null;
    this.group.position.copy(world.spawn).add(new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4));
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      this.keys.add(e.code);
      if (EMOTES[e.key] && !this.busy) { this.setAnim(EMOTES[e.key], true); this.pendingEmote = EMOTES[e.key]; }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }
  update(dt) {
    super.update(dt);
    const k = this.keys;
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const walk = k.has('ShiftLeft') || k.has('ShiftRight');
    const dir = new THREE.Vector3();
    if ((f || s) && !this.busy) {
      const camYaw = Math.atan2(this.camera.position.x - this.group.position.x, this.camera.position.z - this.group.position.z);
      const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
      dir.addScaledVector(fwd, f).addScaledVector(right, s).normalize();
    }
    const target = dir.multiplyScalar(walk ? WALK : RUN);
    this.vel.lerp(target, Math.min(1, ACCEL * dt / (walk ? WALK : RUN)));
    if (this.vel.lengthSq() > 0.0004) {
      const p = this.group.position.clone().addScaledVector(this.vel, dt);
      this.world.resolve(p, RADIUS);
      this.group.position.copy(p);
      const targetYaw = Math.atan2(this.vel.x, this.vel.z);
      let d = targetYaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, TURN * dt);
      this.group.rotation.y = this.yaw;
    }
    if (!this.busy) {
      const sp = this.vel.length();
      this.setAnim(sp > 3.2 ? 'Run' : sp > 0.4 ? 'Walk' : 'Idle');
    }
  }
  /** Compact state for the network. */
  state() {
    const p = this.group.position;
    return { p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], r: +this.yaw.toFixed(3), a: this.anim };
  }
}

export class RemotePlayer extends Avatar {
  constructor(scene, manifest, profile) {
    super(scene, manifest, profile);
    this.buffer = []; // {t, p, r, a}
    this.lastAnim = 'Idle';
  }
  push(s, t) {
    this.buffer.push({ t, p: new THREE.Vector3(...s.p), r: s.r, a: s.a });
    if (this.buffer.length > 20) this.buffer.shift();
    if (this.buffer.length === 1) { this.group.position.copy(this.buffer[0].p); this.group.rotation.y = s.r; }
  }
  emote(name) { this.setAnim(name, true); }
  update(dt, now) {
    super.update(dt);
    const delay = 100; // render 100 ms behind the host for smooth interpolation
    const rt = now - delay;
    const b = this.buffer;
    if (b.length === 0) return;
    let i = b.length - 1;
    while (i > 0 && b[i - 1].t > rt) i--;
    const a = b[Math.max(0, i - 1)], c = b[i];
    const span = Math.max(1, c.t - a.t);
    const k = THREE.MathUtils.clamp((rt - a.t) / span, 0, 1);
    this.group.position.lerpVectors(a.p, c.p, k);
    let d = c.r - a.r; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.group.rotation.y = a.r + d * k;
    if (!this.busy && c.a !== this.anim && ['Idle', 'Walk', 'Run'].includes(c.a)) this.setAnim(c.a);
  }
}
