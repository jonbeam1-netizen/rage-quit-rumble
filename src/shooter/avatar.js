// Shooter avatar: a Quaternius character holding the pistol, with a name + health tag,
// hit flash and locomotion animations relative to where the player is facing.
import * as THREE from 'three';
import { loadCharacter, applyColors, play } from '../characters.js';
import { colorHex } from '../profile.js';

const LOOP = new Set(['Idle', 'Idle_Gun', 'Idle_Gun_Pointing', 'Idle_Gun_Shoot', 'Run', 'Run_Back', 'Run_Left', 'Run_Right', 'Run_Shoot', 'Walk']);

export class ShooterAvatar {
  constructor(scene, manifest, profile, { tag = true } = {}) {
    this.scene = scene; this.manifest = manifest; this.profile = profile;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.character = null;
    this.anim = '';
    this.lockUntil = 0;
    this.flashT = 0;
    this.color = colorHex(profile.color);
    this.alive = true;
    this.hpFrac = 1;
    // name + hp tag
    this.canvas = document.createElement('canvas'); this.canvas.width = 512; this.canvas.height = 160;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex, transparent: true, depthTest: false, depthWrite: false }));
    this.tag.scale.set(1.6, 0.5, 1); this.tag.renderOrder = 10; this.tag.position.y = 2.25; this.tag.visible = tag;
    this.group.add(this.tag);
    this.drawTag();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.48, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
    this.ring = ring;
    this.group.add(ring);
    this.ready = this.load();
  }
  async load() {
    const info = this.manifest.characters.find((c) => c.id === this.profile.characterId) || this.manifest.characters[0];
    this.character = await loadCharacter(info);
    applyColors(this.character, this.profile.colors?.[info.id]);
    if (this.character.parts.Pistol) this.character.parts.Pistol.visible = true;
    this.group.add(this.character.root);
    const box = new THREE.Box3().setFromObject(this.character.root);
    this.tag.position.y = box.max.y + 0.35;
    this.emissives = [];
    for (const m of this.character.materials.values()) if (m.emissive) this.emissives.push(m);
    this.setAnim('Idle_Gun', true);
  }
  drawTag() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 160);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(56, 10, 400, 140, 24); ctx.fill();
    ctx.font = 'bold 56px system-ui, Segoe UI, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = this.color; ctx.fillText(String(this.profile.name || ''), 256, 56);
    ctx.fillStyle = '#2a2d36'; ctx.beginPath(); ctx.roundRect(96, 100, 320, 26, 10); ctx.fill();
    const f = Math.max(0, Math.min(1, this.hpFrac));
    ctx.fillStyle = f > 0.5 ? '#6fe36a' : f > 0.25 ? '#ffd23d' : '#ff4d4d';
    if (f > 0) { ctx.beginPath(); ctx.roundRect(96, 100, 320 * f, 26, 10); ctx.fill(); }
    this.tex.needsUpdate = true;
  }
  setHp(frac) { this.hpFrac = frac; this.drawTag(); }
  setName(name) { this.profile = { ...this.profile, name }; this.drawTag(); }

  /** Locomotion: pick an animation from velocity relative to the facing yaw. */
  locomotion(vel, yaw, { firing = false, grounded = true } = {}) {
    if (this.lockUntil > performance.now()) return;
    const sp = Math.hypot(vel.x, vel.z);
    if (!grounded && sp > 0.5) { this.setAnim(firing ? 'Run_Shoot' : 'Run'); return; }
    if (sp < 0.5) { this.setAnim(firing ? 'Idle_Gun_Shoot' : 'Idle_Gun'); return; }
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const f = (vel.x * fx + vel.z * fz) / sp;
    const s = (vel.x * -fz + vel.z * fx) / sp; // right of facing is (-cos, sin)
    if (f > 0.55) this.setAnim(firing ? 'Run_Shoot' : 'Run');
    else if (f < -0.55) this.setAnim('Run_Back');
    else this.setAnim(s > 0 ? 'Run_Right' : 'Run_Left');
  }
  setAnim(name, force = false) {
    if (!this.character) return;
    if (!force && name === this.anim) return;
    const clip = this.character.clips.find((c) => c.name === name);
    if (!clip) return;
    this.anim = name;
    const loop = LOOP.has(name);
    const speed = name === 'Roll' ? 1.6 : name.startsWith('Run') ? 1.15 : 1;
    play(this.character, clip, { loop, fade: loop ? 0.15 : 0.06, speed });
    if (!loop && name !== 'Death') this.lockUntil = performance.now() + (clip.duration / speed) * 1000 - 100;
  }
  /** One-shot that cannot be interrupted by locomotion (Roll, HitRecieve). */
  oneShot(name) { this.setAnim(name, true); }
  flash(color = 0xff2222) {
    if (!this.emissives) return;
    this.flashT = 0.14;
    for (const m of this.emissives) { m.emissive.setHex(color); m.emissiveIntensity = 1.4; }
  }
  die() {
    this.alive = false;
    this.lockUntil = Infinity;
    this.setAnim('Death', true);
    this.ring.visible = false;
    this.setHp(0);
  }
  revive() {
    this.alive = true;
    this.lockUntil = 0;
    this.ring.visible = true;
    this.setAnim('Idle_Gun', true);
  }
  update(dt) {
    this.character?.mixer.update(dt);
    if (this.flashT > 0) {
      this.flashT -= dt;
      if (this.flashT <= 0) for (const m of this.emissives) { m.emissive.setHex(0x000000); m.emissiveIntensity = 1; }
    }
  }
  dispose() { this.scene.remove(this.group); }
}
