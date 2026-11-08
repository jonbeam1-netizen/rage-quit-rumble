// Shooter arena: the roof of a tall building at night, high above the lobby's city.
// Layout is seeded and point-symmetric (every piece of cover is mirrored through the centre)
// so the eight spawn points are fair. Collision uses 3D boxes (solids) so players can climb.
import * as THREE from 'three';
import { World } from '../lobby/world.js';
import { get } from '../lobby/kits.js';
import { mulberry32 } from './cards.js';

const CITY = 0.62;
const NEON = ['#3dd6ff', '#ff4fd8', '#ff6a3d', '#7cff5a', '#ffd23d'];

export class Arena extends World {
  constructor(scene, seed = 1) {
    super(scene);
    this.seed = seed >>> 0;
    this.rng = mulberry32(this.seed);
    this.solids = [];     // {min:Vector3, max:Vector3}
    this.spawns = [];     // Vector3 (feet positions)
    this.W = 20; this.D = 14; // half extents of the roof
    this.items = [];      // placed cover footprints for spacing checks
  }

  // ------------------------------------------------------------------ overrides
  place(obj, x, z, rotY = 0, { collide = true, pad = 0, y = 0 } = {}) {
    obj.position.set(x, y, z);
    obj.rotation.y = rotY;
    obj.updateMatrixWorld(true);
    obj.traverse((o) => { o.matrixAutoUpdate = false; o.updateMatrix(); });
    this.static.add(obj);
    if (collide) {
      const b = new THREE.Box3().setFromObject(obj);
      if (b.max.y - b.min.y > 0.25) this.solid(b.min.x - pad, b.min.y, b.min.z - pad, b.max.x + pad, b.max.y, b.max.z + pad);
    }
    return obj;
  }
  solid(x0, y0, z0, x1, y1, z1, ghost = false) {
    // ghost solids block players only (invisible boundary); camera and bullets pass through
    this.solids.push({ min: new THREE.Vector3(x0, y0, z0), max: new THREE.Vector3(x1, y1, z1), ghost });
  }
  box(w, h, d, mat, x, y, z, rotY = 0, collide = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true; m.receiveShadow = true;
    this.occluders.push(m);
    return this.place(m, x, z, rotY, { collide, y });
  }
  /** Box resting on yBottom (centre computed). */
  block(w, h, d, mat, x, z, yBottom = 0, rotY = 0, collide = true) { return this.box(w, h, d, mat, x, yBottom + h / 2, z, rotY, collide); }

  // ------------------------------------------------------------------ build
  build() {
    this.makeMaterials();
    this.makeArenaMaterials();
    this.buildRoof();
    this.buildTower();
    this.buildSkyline();
    this.buildFixedCover();
    this.buildSeededCover();
    this.buildDressing();
    this.buildLighting();
    this.scene.fog = new THREE.FogExp2(0x0a0b12, 0.0075);
    this.bounds = Math.max(this.W, this.D) + 2;
  }

  makeArenaMaterials() {
    const roof = this.canvasTexture(1024, 1024, (ctx, w, h) => {
      ctx.fillStyle = '#4a4b52'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) { const v = 50 + Math.random() * 60; ctx.fillStyle = `rgba(${v},${v},${v + 6},${Math.random() * 0.35})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 2 + Math.random() * 5); }
      ctx.strokeStyle = '#26272c'; ctx.lineWidth = 6;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 256, 0); ctx.lineTo(i * 256, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * 256); ctx.lineTo(w, i * 256); ctx.stroke(); }
      // tar patches
      for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(20,20,24,0.5)'; ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 20 + Math.random() * 40, Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }
    }, [5, 3.5]);
    const windows = this.canvasTexture(512, 1024, (ctx, w, h) => {
      ctx.fillStyle = '#0d0e14'; ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 32; r++) for (let c = 0; c < 10; c++) {
        const lit = Math.random() < 0.42;
        const warm = Math.random() < 0.6;
        ctx.fillStyle = lit ? (warm ? `rgb(${230 + Math.random() * 25},${180 + Math.random() * 40},120)` : `rgb(150,${200 + Math.random() * 40},255)`) : '#14161e';
        ctx.fillRect(c * 51 + 10, r * 32 + 6, 31, 20);
      }
    }, [2, 2]);
    const pad = this.canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#2b2c31'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e8d75a'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(256, 256, 200, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e8d75a'; ctx.font = 'bold 300px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', 256, 270);
    });
    const hazard = this.canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#e8c53d'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#17171a';
      for (let i = -4; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64 + 32, 0); ctx.lineTo(i * 64 + 32 + 256, 256); ctx.lineTo(i * 64 + 256, 256); ctx.fill(); }
    }, [3, 1]);
    const M = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0, ...extra });
    Object.assign(this.mat, {
      roof: M(roof),
      windows: new THREE.MeshStandardMaterial({ map: windows, emissive: 0xffffff, emissiveMap: windows, emissiveIntensity: 0.9, roughness: 0.9 }),
      pad: M(pad),
      hazard: M(hazard, { roughness: 0.8 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0x55565c, roughness: 0.95 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x5b626e, roughness: 0.45, metalness: 0.7 }),
      rust: new THREE.MeshStandardMaterial({ color: 0x6b3f2a, roughness: 0.9, metalness: 0.2 }),
      tank: new THREE.MeshStandardMaterial({ color: 0x3f4a5a, roughness: 0.5, metalness: 0.6 }),
      door: new THREE.MeshStandardMaterial({ color: 0x1a1b22, roughness: 0.6, metalness: 0.4 }),
      vent: new THREE.MeshStandardMaterial({ color: 0x8a8e96, roughness: 0.5, metalness: 0.5 }),
    });
  }

  buildRoof() {
    const { W, D } = this;
    // Floor slab (top at y=0)
    this.box(W * 2, 0.6, D * 2, this.mat.roof, 0, -0.3, 0, 0, true);
    // Parapet: low wall all the way round, with a hazard stripe lip
    const t = 0.5, h = 1.05;
    this.block(W * 2 + t * 2, h, t, this.mat.brickDark, 0, -D - t / 2);
    this.block(W * 2 + t * 2, h, t, this.mat.brickDark, 0, D + t / 2);
    this.block(t, h, D * 2, this.mat.brickDark, -W - t / 2, 0);
    this.block(t, h, D * 2, this.mat.brickDark, W + t / 2, 0);
    for (const [x, z, w, d] of [[0, -D - t / 2, W * 2 + t * 2 + 0.1, t + 0.1], [0, D + t / 2, W * 2 + t * 2 + 0.1, t + 0.1], [-W - t / 2, 0, t + 0.1, D * 2], [W + t / 2, 0, t + 0.1, D * 2]]) {
      this.block(w, 0.08, d, this.mat.hazard, x, z, h, 0, false);
    }
    // Invisible walls above the parapet so nobody leaves the roof
    this.solid(-W - 3, 0, -D - 3, W + 3, 12, -D, true); this.solid(-W - 3, 0, D, W + 3, 12, D + 3, true);
    this.solid(-W - 3, 0, -D - 3, -W, 12, D + 3, true); this.solid(W, 0, -D - 3, W + 3, 12, D + 3, true);
    // Landing pad in the centre: a wide low step everyone fights over
    this.block(7, 0.35, 7, this.mat.concrete, 0, 0);
    this.block(6.6, 0.02, 6.6, this.mat.pad, 0, 0, 0.35, 0, false);
    // Neon bulb rows along the parapet lip
    this.bulbRow(NEON[0], -W, -D - 0.25, W, -D - 0.25, 40, h + 0.1);
    this.bulbRow(NEON[1], -W, D + 0.25, W, D + 0.25, 40, h + 0.1);
    this.bulbRow(NEON[2], -W - 0.25, -D, -W - 0.25, D, 28, h + 0.1);
    this.bulbRow(NEON[3], W + 0.25, -D, W + 0.25, D, 28, h + 0.1);
    // Spawn points: corners, side midpoints
    const sx = W - 4.5, sz = D - 4;
    for (const [x, z] of [[-sx, -sz], [sx, sz], [sx, -sz], [-sx, sz], [-sx, 0], [sx, 0], [0, -sz], [0, sz]]) this.spawns.push(new THREE.Vector3(x, 0, z));
  }

  buildTower() {
    const { W, D } = this;
    // The building we stand on: window-lit faces dropping 60 m, plus a big dark ground far below
    const body = new THREE.Mesh(new THREE.BoxGeometry(W * 2 + 1, 60, D * 2 + 1), [this.mat.windows, this.mat.windows, this.mat.wallDark, this.mat.wallDark, this.mat.windows, this.mat.windows]);
    body.position.set(0, -30.4, 0);
    body.receiveShadow = true;
    this.static.add(body);
    // Ledge just under the roof edge
    this.block(W * 2 + 2.2, 0.5, D * 2 + 2.2, this.mat.concrete, 0, 0, -0.9, 0, false);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -62;
    this.scene.add(ground);
    // Street lights far below: a grid of tiny glowing dots
    const n = 400; const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (this.rng() - 0.5) * 400; pos[i * 3 + 1] = -61; pos[i * 3 + 2] = (this.rng() - 0.5) * 400; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd9a0, size: 1.2, sizeAttenuation: true })));
  }

  buildSkyline() {
    // Rings of city buildings below and around the roof; a few tall ones poke above it
    const names = ['Building Sky_big_color01', 'Building Sky_small_color01', 'Building_Residential_color01', 'Building_Factory', 'Building Sky_big_color01', 'Building_Residential_color01', 'Building Sky_small_color01'];
    const rings = [[40, 10, -16, 6], [62, 14, -22, 10], [95, 18, -10, 22]];
    for (const [r, count, yBase, yVar] of rings) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + this.rng() * 0.3;
        const rr = r + (this.rng() - 0.5) * 8;
        const name = names[Math.floor(this.rng() * names.length)];
        const s = CITY * (0.9 + this.rng() * 0.6);
        const obj = get('city', name, { scale: s, shadow: false });
        this.place(obj, Math.cos(a) * rr, Math.sin(a) * rr, this.rng() * Math.PI * 2, { collide: false, y: yBase - this.rng() * yVar - (obj.userData.size?.y ?? 12) });
      }
    }
    // Antennas / lights on the distant roofs are implied by the window texture; add a couple of red beacons
    for (let i = 0; i < 6; i++) {
      const a = this.rng() * Math.PI * 2, rr = 45 + this.rng() * 40;
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false }));
      beacon.material.color.multiplyScalar(2.5);
      beacon.position.set(Math.cos(a) * rr, -2 + this.rng() * 10, Math.sin(a) * rr);
      this.scene.add(beacon);
      this.animated.push({ update: (dt, t) => { beacon.visible = Math.sin(t * 2 + i) > 0; } });
    }
  }

  // Cover that is always there: two stair houses with crate steps up to their roofs, water tanks
  buildFixedCover() {
    const { W, D } = this;
    for (const m of [1, -1]) {
      const x = 12 * m, z = -6 * m;
      // stair house
      this.block(3.8, 3.0, 3.0, this.mat.brickWarm, x, z);
      this.block(4.2, 0.25, 3.4, this.mat.concrete, x, z, 3.0);
      this.block(1.0, 2.1, 0.08, this.mat.door, x - 1.95 * m, z, 0.0, Math.PI / 2, false);
      const ant = get('city', 'Props_Roof Antenna', { scale: CITY * 0.5, shadow: false });
      this.place(ant, x + 1.2 * m, z + 0.9 * m, 0, { collide: false, y: 3.25 });
      // steps: 1.0 and 2.0 high blocks leading to the 3.0 roof
      this.block(1.6, 1.0, 1.6, this.mat.concrete, x, z + 2.9 * m);
      this.block(1.6, 2.0, 1.6, this.mat.concrete, x + 1.7 * m, z + 2.9 * m);
      this.items.push({ x, z, r: 3.5 });
      // water tank on legs
      const tx = -6.5 * m, tz = -10 * m;
      const tank = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.9, 18), this.mat.tank); body.position.y = 1.0 + 0.95; body.castShadow = body.receiveShadow = true;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.5, 18), this.mat.rust); cone.position.y = 1.0 + 1.9 + 0.25; cone.castShadow = true;
      tank.add(body, cone);
      for (const [lx, lz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), this.mat.steel); leg.position.set(lx, 0.5, lz); leg.castShadow = true; tank.add(leg); }
      this.occluders.push(body);
      this.place(tank, tx, tz, 0, { collide: false });
      this.solid(tx - 1.15, 0, tz - 1.15, tx + 1.15, 3.4, tz + 1.15);
      this.items.push({ x: tx, z: tz, r: 1.8 });
    }
    this.items.push({ x: 0, z: 0, r: 4.2 });
  }

  // Random cover in one half, mirrored through the centre
  buildSeededCover() {
    const { W, D } = this;
    const kinds = ['ac', 'vent', 'crates', 'barrels', 'wall', 'ac', 'crates', 'wall', 'vent', 'planter'];
    const count = 7 + Math.floor(this.rng() * 3);
    let tries = 0, placed = 0;
    while (placed < count && tries++ < 200) {
      const kind = kinds[Math.floor(this.rng() * kinds.length)];
      const x = (this.rng() * 2 - 1) * (W - 3.5);
      const z = -2.2 - this.rng() * (D - 5.5);
      const r = { ac: 1.7, vent: 1.2, crates: 1.1, barrels: 1.1, wall: 2.0, planter: 1.5 }[kind];
      if (!this.freeSpot(x, z, r)) continue;
      const rot = Math.floor(this.rng() * 2) * Math.PI / 2;
      this.cover(kind, x, z, rot);
      this.cover(kind, -x, -z, rot);
      this.items.push({ x, z, r }, { x: -x, z: -z, r });
      placed++;
    }
  }
  freeSpot(x, z, r) {
    if (Math.abs(x) > this.W - 2.5 || Math.abs(z) > this.D - 2.5) return false;
    for (const s of this.spawns) if (Math.hypot(s.x - x, s.z - z) < r + 2.2) return false;
    for (const it of this.items) if (Math.hypot(it.x - x, it.z - z) < r + it.r + 0.8) return false;
    if (Math.hypot(x, z) < r + 4.2) return false;
    return true;
  }
  cover(kind, x, z, rot) {
    switch (kind) {
      case 'ac': {
        this.block(2.6, 1.1, 2.0, this.mat.concrete, x, z, 0, rot);
        for (const o of [-0.65, 0.65]) {
          const unit = get('city', 'Props_Roof prop air', { scale: CITY * 0.7, shadow: true });
          const lx = Math.cos(rot) * o, lz = -Math.sin(rot) * o;
          this.place(unit, x + lx, z + lz, rot, { collide: true, y: 1.1 });
        }
        break;
      }
      case 'vent':
        this.block(1.8, 0.75, 0.9, this.mat.vent, x, z, 0, rot);
        this.block(1.9, 0.1, 1.0, this.mat.trim, x, z, 0.75, rot, false);
        break;
      case 'crates': {
        const n = 1 + Math.floor(this.rng() * 2);
        for (let i = 0; i < n; i++) {
          const c = get('rpg', 'rpgpp_lt_box_wood_01', { fitHeight: 0.95 });
          this.place(c, x, z, rot + i * 0.3, { y: i * 0.95 });
        }
        if (this.rng() < 0.5) this.place(get('rpg', 'rpgpp_lt_crate_03', { fitHeight: 0.5 }), x + Math.cos(rot) * 1.0, z - Math.sin(rot) * 1.0, rot);
        break;
      }
      case 'barrels': {
        // oil drums (the rpg barrels import lying on their side)
        const colors = [0x2f5fa8, 0xb33a2e, 0xd9b23a, 0x3f7a46];
        for (const [ox, oz] of [[0, 0], [0.72, 0.1], [0.3, 0.7]]) {
          const drum = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 14), new THREE.MeshStandardMaterial({ color: colors[Math.floor(this.rng() * colors.length)], roughness: 0.55, metalness: 0.5 }));
          body.position.y = 0.45; body.castShadow = body.receiveShadow = true;
          drum.add(body);
          for (const ry of [0.22, 0.68]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.02, 6, 16), this.mat.steel); rim.rotation.x = Math.PI / 2; rim.position.y = ry; drum.add(rim); }
          const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 14), this.mat.steel); lid.position.y = 0.905; drum.add(lid);
          this.place(drum, x + ox - 0.35, z + oz - 0.25, this.rng() * 3);
        }
        break;
      }
      case 'wall':
        this.block(3.4, 1.7, 0.45, this.mat.concrete, x, z, 0, rot);
        this.block(3.5, 0.1, 0.55, this.mat.hazard, x, z, 1.7, rot, false);
        break;
      case 'planter':
        this.block(2.4, 0.6, 1.0, this.mat.brickWarm, x, z, 0, rot);
        for (const o of [-0.7, 0, 0.7]) this.place(get('nature', 'Bush_0' + (1 + Math.floor(this.rng() * 3)), { fitHeight: 0.7 }), x + Math.cos(rot) * o, z - Math.sin(rot) * o, 0, { collide: false, y: 0.55 });
        break;
    }
  }

  buildDressing() {
    const { W, D } = this;
    // Big neon billboards standing just outside the parapet on the long sides
    for (const [z, text, color, rotY] of [[-D - 2.6, 'RAGE QUIT RUMBLE', NEON[1], 0], [D + 2.6, 'ROOFTOP RUMBLE', NEON[0], Math.PI]]) {
      const bb = get('city', 'Props_BillBoard_large', { scale: CITY, shadow: false });
      this.place(bb, 0, z, rotY, { collide: false, y: 0 });
      this.neon(text, color, 9, 0, 3.4, z + (rotY === 0 ? 0.55 : -0.55), rotY, { size: 1, glow: 1.2 });
    }
    // Smaller ads on the short sides
    for (const [x, rotY, text, color] of [[-W - 2.2, Math.PI / 2, 'PLAY', NEON[3]], [W + 2.2, -Math.PI / 2, 'RUMBLE', NEON[2]]]) {
      const bb = get('city', 'Props_BillBoard_medium', { scale: CITY, shadow: false });
      this.place(bb, x, 0, rotY, { collide: false });
      this.neon(text, color, 4.5, x + (rotY > 0 ? 0.5 : -0.5), 3.0, 0, rotY, { size: 1.1, glow: 1.2 });
    }
    // Corner floodlights (coloured) for mood
    const corners = [[-W + 1, -D + 1, NEON[0]], [W - 1, -D + 1, NEON[1]], [-W + 1, D - 1, NEON[2]], [W - 1, D - 1, NEON[3]]];
    for (const [x, z, c] of corners) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), this.mat.steel); pole.position.y = 1.6; pole.castShadow = true;
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.3), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); lamp.position.set(0, 3.3, 0); lamp.material.color.multiplyScalar(1.6);
      const g = new THREE.Group(); g.add(pole, lamp);
      this.place(g, x, z, 0, { collide: false });
      this.pointLight(c, 40, x, 3.4, z, 26, 2);
    }
    // Solar panels and a dustbin or two as non-blocking clutter along the edges
    for (let i = 0; i < 4; i++) {
      const sp = get('city', 'Props_Roof Solar Panel', { scale: CITY * 0.8 });
      this.place(sp, -W + 4 + i * 3.4, D - 1.4, 0, { collide: true, pad: -0.1 });
      const sp2 = get('city', 'Props_Roof Solar Panel', { scale: CITY * 0.8 });
      this.place(sp2, W - 4 - i * 3.4, -D + 1.4, Math.PI, { collide: true, pad: -0.1 });
    }
  }

  buildLighting() {
    super.buildLighting();
    this.moon.intensity = 2.2;
    this.moon.position.set(-25, 45, 15);
    this.moon.shadow.camera.left = this.moon.shadow.camera.bottom = -30;
    this.moon.shadow.camera.right = this.moon.shadow.camera.top = 30;
    this.moon.shadow.camera.far = 120;
    this.moon.shadow.camera.updateProjectionMatrix();
    // Warm fill from the city glow below
    this.scene.add(new THREE.HemisphereLight(0x3a4a80, 0x4a3020, 1.5));
    // Warm lamps over the stair-house doors and a cool light on the landing pad
    for (const m of [1, -1]) this.pointLight(0xffb070, 22, 12 * m - 2.3 * m, 2.6, -6 * m, 14, 2);
    this.pointLight(0xbfd8ff, 18, 0, 3.0, 0, 16, 2);
  }

  // ------------------------------------------------------------------ queries
  /** Ray vs solids: returns {t, normal} of the nearest hit within maxT, or null. Ray dir need not be unit. */
  raycast(o, d, maxT = Infinity, radius = 0) {
    let best = null;
    for (const s of this.solids) {
      if (s.ghost) continue;
      const hit = slab(o, d, s, radius, maxT);
      if (hit && (!best || hit.t < best.t)) best = hit;
    }
    // Roof slab top (y=0) is covered by the floor solid. Nothing else.
    return best;
  }
  /** Highest solid top under (x, z) at or below y (for landing checks). */
  floorAt(x, z, y) {
    let top = -Infinity;
    for (const s of this.solids) if (x >= s.min.x && x <= s.max.x && z >= s.min.z && z <= s.max.z && s.max.y <= y + 1e-3 && s.max.y > top) top = s.max.y;
    return top;
  }
}

/** Segment/ray vs AABB (slab method), box inflated by radius. Returns {t, normal} or null. */
export function slab(o, d, box, radius, maxT) {
  let tmin = 0, tmax = maxT, nAxis = -1, nSign = 0;
  for (const ax of ['x', 'y', 'z']) {
    const lo = box.min[ax] - radius, hi = box.max[ax] + radius;
    if (Math.abs(d[ax]) < 1e-9) { if (o[ax] < lo || o[ax] > hi) return null; continue; }
    const inv = 1 / d[ax];
    let t1 = (lo - o[ax]) * inv, t2 = (hi - o[ax]) * inv, sign = -1;
    if (t1 > t2) { [t1, t2] = [t2, t1]; sign = 1; }
    if (t1 > tmin) { tmin = t1; nAxis = ax; nSign = sign; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  if (nAxis === -1) return null; // started inside
  const normal = new THREE.Vector3(); normal[nAxis] = nSign;
  return { t: tmin, normal };
}
