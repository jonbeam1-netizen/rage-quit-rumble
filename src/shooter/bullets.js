// Bullets and impact particles. Every peer simulates every bullet against the arena so they
// all see the same bounces; only the shooter's own bullets test against players (shooter-side
// hit judgement, forwarded to the host).
import * as THREE from 'three';
import { slab } from './arena.js';

const BASE_R = 0.09;
const tmp = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();

export class Bullets {
  constructor(scene, arena, max = 400) {
    this.arena = arena;
    this.list = [];
    this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    scene.add(this.mesh);
    // glowing trail: a stretched copy behind each bullet
    this.trail = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.35, depthWrite: false }), max);
    this.trail.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trail.frustumCulled = false; this.trail.count = 0;
    scene.add(this.trail);
    this.max = max;
  }
  spawn({ owner, origin, dir, speed, size = 1, bounces = 0, life = 1.6, color = '#ffffff', local = false }) {
    if (this.list.length >= this.max) this.list.shift();
    const c = new THREE.Color(color).multiplyScalar(2.2);
    this.list.push({ owner, pos: origin.clone(), vel: dir.clone().normalize().multiplyScalar(speed), r: BASE_R * size, bounces, life, color: c, local, prev: origin.clone() });
  }
  clear() { this.list.length = 0; this.mesh.count = 0; this.trail.count = 0; }

  /**
   * targets: [{ id, pos (feet Vector3), r, h }] for the local shooter's bullets.
   * onHit(bullet, targetId, point), onImpact(point, normal, bullet, bounced)
   */
  update(dt, targets, onHit, onImpact) {
    const B = this.arena.bounds + 10;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      b.life -= dt;
      if (b.life <= 0 || Math.abs(b.pos.x) > B || Math.abs(b.pos.z) > B || b.pos.y < -5 || b.pos.y > 40) { this.list.splice(i, 1); continue; }
      b.prev.copy(b.pos);
      let remaining = dt, guard = 0, dead = false;
      while (remaining > 1e-5 && guard++ < 4 && !dead) {
        const step = tmp.copy(b.vel).multiplyScalar(remaining);
        const len = step.length();
        // players first (only for the shooter's own bullets)
        if (b.local && targets) {
          let best = null;
          for (const t of targets) {
            const box = { min: { x: t.pos.x - t.r, y: t.pos.y, z: t.pos.z - t.r }, max: { x: t.pos.x + t.r, y: t.pos.y + t.h, z: t.pos.z + t.r } };
            const h = slab(b.pos, step, box, b.r, 1);
            if (h && (!best || h.t < best.t)) best = { t: h.t, id: t.id };
          }
          if (best) {
            const pt = b.pos.clone().addScaledVector(step, best.t);
            onHit?.(b, best.id, pt);
            this.list.splice(i, 1); dead = true; break;
          }
        }
        // arena
        const hit = this.arena.raycast(b.pos, step, 1, b.r);
        if (hit) {
          const pt = b.pos.clone().addScaledVector(step, Math.max(0, hit.t - 1e-3));
          if (b.bounces > 0) {
            b.bounces--;
            b.pos.copy(pt);
            const n = hit.normal;
            const d = b.vel.dot(n);
            b.vel.addScaledVector(n, -2 * d);
            onImpact?.(pt, n, b, true);
            remaining *= (1 - hit.t);
            continue;
          }
          onImpact?.(pt, hit.normal, b, false);
          this.list.splice(i, 1); dead = true; break;
        }
        b.pos.add(step);
        remaining = 0;
        void len;
      }
    }
    // write instances
    const n = this.list.length;
    for (let i = 0; i < n; i++) {
      const b = this.list[i];
      tmpS.setScalar(b.r);
      tmpM.compose(b.pos, tmpQ.identity(), tmpS);
      this.mesh.setMatrixAt(i, tmpM);
      this.mesh.setColorAt(i, b.color);
      // trail: stretched along velocity, centred behind the bullet
      const dir = tmp.copy(b.vel).normalize();
      const len = Math.min(1.2, b.vel.length() * 0.03);
      tmpQ.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      tmpS.set(b.r * 0.7, len, b.r * 0.7);
      tmpM.compose(b.pos.clone().addScaledVector(dir, -len), tmpQ, tmpS);
      this.trail.setMatrixAt(i, tmpM);
      this.trail.setColorAt(i, b.color);
    }
    this.mesh.count = n; this.trail.count = n;
    this.mesh.instanceMatrix.needsUpdate = true; this.trail.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) { this.mesh.instanceColor.needsUpdate = true; this.trail.instanceColor.needsUpdate = true; }
  }
}

export class Particles {
  constructor(scene, max = 600) {
    this.max = max;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false; this.mesh.count = 0;
    scene.add(this.mesh);
    this.list = [];
  }
  burst(pos, color, n = 10, speed = 5, size = 0.07, life = 0.5, normal = null, gravity = 14) {
    const c = new THREE.Color(color).multiplyScalar(2);
    for (let i = 0; i < n; i++) {
      if (this.list.length >= this.max) this.list.shift();
      const v = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
      if (normal) v.addScaledVector(normal, 1.2).normalize();
      v.multiplyScalar(speed * (0.4 + Math.random() * 0.8));
      this.list.push({ pos: pos.clone(), vel: v, life, max: life, size: size * (0.6 + Math.random() * 0.8), color: c, g: gravity, rot: Math.random() * 6 });
    }
  }
  ring(pos, color, n = 24, radius = 0.9) {
    const c = new THREE.Color(color).multiplyScalar(2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a), 0.2, Math.sin(a)).multiplyScalar(radius * 4);
      this.list.push({ pos: pos.clone(), vel: v, life: 0.35, max: 0.35, size: 0.08, color: c, g: 0, rot: a });
    }
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.vel.y -= p.g * dt;
      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < 0.02) { p.pos.y = 0.02; p.vel.y = Math.abs(p.vel.y) * 0.4; p.vel.x *= 0.7; p.vel.z *= 0.7; }
    }
    const n = this.list.length;
    for (let i = 0; i < n; i++) {
      const p = this.list[i];
      const k = p.life / p.max;
      tmpS.setScalar(p.size * (0.3 + 0.7 * k));
      tmpQ.setFromEuler(new THREE.Euler(p.rot + p.life * 6, p.rot, 0));
      tmpM.compose(p.pos, tmpQ, tmpS);
      this.mesh.setMatrixAt(i, tmpM);
      this.mesh.setColorAt(i, p.color);
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  clear() { this.list.length = 0; this.mesh.count = 0; }
}
