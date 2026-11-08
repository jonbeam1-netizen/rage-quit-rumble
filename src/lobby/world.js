// Builds the lobby venue: one night-time city block. Plaza in the middle, Rumble Street to the
// north, Arcade west, Game hall east, Board game cafe south-west, Back room south, Court south-east.
// Everything static goes through place(); colliders are axis-aligned boxes on the ground plane.
import * as THREE from 'three';
import { get, skin, pieceSize } from './kits.js';

export const KITS = ['city', 'streets', 'boardgames', 'arcade01', 'arcade02', 'arcadepoly', 'airhockey', 'nature', 'dungeon', 'rpg', 'toony'];
const CITY = 0.62; // SimplePoly City pieces are oversized; this brings doors to human scale

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];      // {minX, maxX, minZ, maxZ}
    this.static = new THREE.Group();
    this.static.name = 'static';
    scene.add(this.static);
    this.lights = [];
    this.occluders = [];      // walls/roofs the camera must not pass through
    this.animated = [];       // {update(dt)}
    this.hostScreen = null;
    this.spawn = new THREE.Vector3(0, 0, 4);
    this.bounds = 46;
  }

  // ------------------------------------------------------------------ helpers
  place(obj, x, z, rotY = 0, { collide = true, pad = 0, y = 0 } = {}) {
    obj.position.set(x, y, z);
    obj.rotation.y = rotY;
    obj.updateMatrixWorld(true);
    obj.traverse((o) => { o.matrixAutoUpdate = false; o.updateMatrix(); });
    this.static.add(obj);
    if (collide) {
      const b = new THREE.Box3().setFromObject(obj);
      if (b.max.y - b.min.y > 0.5 && b.max.y > 0.6) {
        this.colliders.push({ minX: b.min.x - pad, maxX: b.max.x + pad, minZ: b.min.z - pad, maxZ: b.max.z + pad });
      }
    }
    return obj;
  }
  box(w, h, d, mat, x, y, z, rotY = 0, collide = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true; m.receiveShadow = true;
    if (h >= 2.5 || w >= 8 || d >= 8) this.occluders.push(m);
    return this.place(m, x, z, rotY, { collide, y });
  }
  addCollider(minX, maxX, minZ, maxZ) { this.colliders.push({ minX, maxX, minZ, maxZ }); }
  pointLight(color, intensity, x, y, z, distance = 14, decay = 2) {
    const l = new THREE.PointLight(color, intensity, distance, decay);
    l.position.set(x, y, z);
    this.scene.add(l);
    this.lights.push(l);
    return l;
  }

  // ---------------------------------------------------------------- textures
  canvasTexture(w, h, draw, repeat = [1, 1]) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 8;
    return t;
  }
  makeMaterials() {
    const noise = (ctx, w, h, base, amount, n = 2500) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < n; i++) {
        const v = Math.floor(Math.random() * amount);
        ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.25})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 2 + Math.random() * 6);
      }
    };
    const asphalt = this.canvasTexture(512, 512, (ctx, w, h) => noise(ctx, w, h, '#2a2c31', 70), [8, 8]);
    const pavement = this.canvasTexture(512, 512, (ctx, w, h) => {
      noise(ctx, w, h, '#4b4d53', 90, 1500);
      ctx.strokeStyle = '#33353a'; ctx.lineWidth = 4;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(w, i * 128); ctx.stroke(); }
    }, [10, 10]);
    const plaza = this.canvasTexture(512, 512, (ctx, w, h) => {
      noise(ctx, w, h, '#3a3540', 60, 1200);
      ctx.strokeStyle = '#2a2630'; ctx.lineWidth = 5;
      for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * 64); ctx.lineTo(w, i * 64); ctx.stroke(); }
    }, [6, 6]);
    const wood = this.canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#5a3d26'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.25})`; ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 6); }
      ctx.strokeStyle = '#3a2516'; ctx.lineWidth = 6;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(w, i * 128); ctx.stroke(); }
    }, [4, 4]);
    const brick = this.canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#2d2a33'; ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) {
        const off = (r % 2) * 32;
        const v = 60 + Math.random() * 30;
        ctx.fillStyle = `rgb(${v + 20},${v},${v + 10})`;
        ctx.fillRect(c * 64 + off + 2, r * 32 + 2, 60, 28);
      }
    }, [3, 2]);
    const court = this.canvasTexture(1024, 1024, (ctx, w, h) => {
      noise(ctx, w, h, '#3b5a4a', 50, 1500);
      ctx.strokeStyle = '#e8e2c8'; ctx.lineWidth = 10;
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.beginPath(); ctx.moveTo(40, h / 2); ctx.lineTo(w - 40, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 110, 0, Math.PI * 2); ctx.stroke();
      for (const y of [40, h - 40]) { ctx.beginPath(); ctx.arc(w / 2, y, 240, 0, Math.PI * 2); ctx.stroke(); ctx.strokeRect(w / 2 - 160, Math.min(y, h / 2) === 40 ? 40 : h - 40 - 300, 320, 300); }
    });
    const brickTex = (base, light) => this.canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) {
        const off = (r % 2) * 32; const v = Math.random() * 28;
        ctx.fillStyle = `rgb(${light[0] + v},${light[1] + v},${light[2] + v})`;
        ctx.fillRect(c * 64 + off + 2, r * 32 + 2, 60, 28);
      }
    }, [3, 2]);
    const M = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0, ...extra });
    this.mat = {
      asphalt: M(asphalt), pavement: M(pavement), plaza: M(plaza), wood: M(wood), brick: M(brick), court: M(court),
      brickDark: M(brickTex('#1b1a22', [52, 48, 66])), brickWarm: M(brickTex('#2a2420', [120, 86, 70])),
      dark: new THREE.MeshStandardMaterial({ color: 0x1b1c21, roughness: 0.9 }),
      wall: new THREE.MeshStandardMaterial({ color: 0x3a3742, roughness: 0.9 }),
      wallDark: new THREE.MeshStandardMaterial({ color: 0x26242c, roughness: 0.9 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.6, metalness: 0.3 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x8a8f99, roughness: 0.4, metalness: 0.8 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x8fb8ff, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.35 }),
      curb: new THREE.MeshStandardMaterial({ color: 0x5c5e66, roughness: 0.9 }),
      line: new THREE.MeshStandardMaterial({ color: 0xf0e6b0, roughness: 0.8 }),
    };
  }

  neon(text, color, w, x, y, z, rotY = 0, { size = 1, glow = 1.25 } = {}) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = `bold ${Math.floor(150 * size)}px Impact, "Arial Black", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = color; ctx.shadowBlur = 40;
    ctx.fillStyle = color; ctx.fillText(text, 512, 128);
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.3; ctx.fillText(text, 512, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.FrontSide, toneMapped: false, depthWrite: false, color: new THREE.Color(1, 1, 1).multiplyScalar(glow) }));
    m.position.set(x, y, z); m.rotation.y = rotY;
    this.scene.add(m);
    return m;
  }
  bulbRow(color, x1, z1, x2, z2, n, y) {
    const geo = new THREE.SphereGeometry(0.08, 8, 6);
    const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    mat.color.multiplyScalar(2.5);
    const inst = new THREE.InstancedMesh(geo, mat, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1);
      m.setPosition(x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t);
      inst.setMatrixAt(i, m);
    }
    this.scene.add(inst);
  }

  // ------------------------------------------------------------------ build
  build() {
    this.makeMaterials();
    this.buildGround();
    this.buildStreet();
    this.buildPlaza();
    this.buildArcade();
    this.buildGameHall();
    this.buildCafe();
    this.buildBackRoom();
    this.buildCourt();
    this.buildBackdrop();
    this.buildLighting();
    // World boundary
    const B = this.bounds;
    this.addCollider(-B - 5, -B, -B - 5, B + 5); this.addCollider(B, B + 5, -B - 5, B + 5);
    this.addCollider(-B - 5, B + 5, -B - 5, -B); this.addCollider(-B - 5, B + 5, B, B + 5);
  }

  buildGround() {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), this.mat.asphalt);
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true; g.position.y = -0.01;
    this.scene.add(g);
    // pavement everywhere inside the block
    const p = new THREE.Mesh(new THREE.PlaneGeometry(90, 72), this.mat.pavement);
    p.rotation.x = -Math.PI / 2; p.receiveShadow = true; p.position.set(0, 0.0, 10);
    this.scene.add(p);
  }

  buildStreet() {
    // Road z in [-31, -20], sidewalks either side, curbs.
    const road = new THREE.Mesh(new THREE.PlaneGeometry(110, 11), this.mat.asphalt);
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -25.5); road.receiveShadow = true; this.scene.add(road);
    for (const z of [-20, -31]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(110, 0.16, 0.4), this.mat.curb);
      curb.position.set(0, 0.08, z); curb.receiveShadow = true; this.scene.add(curb);
    }
    // dashed centre line
    const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4, 0.18), this.mat.line, 28);
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    for (let i = 0; i < 28; i++) { m.compose(new THREE.Vector3(-54 + i * 4, 0.03, -25.5), q, new THREE.Vector3(1, 1, 1)); dash.setMatrixAt(i, m); }
    this.scene.add(dash);
    // crosswalk in front of the plaza
    const cw = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.8, 9), this.mat.line, 8);
    for (let i = 0; i < 8; i++) { m.compose(new THREE.Vector3(-5.6 + i * 1.6, 0.03, -25.5), q, new THREE.Vector3(1, 1, 1)); cw.setMatrixAt(i, m); }
    this.scene.add(cw);
    // north sidewalk strip
    const nsw = new THREE.Mesh(new THREE.PlaneGeometry(110, 6), this.mat.pavement);
    nsw.rotation.x = -Math.PI / 2; nsw.position.set(0, 0.0, -34); nsw.receiveShadow = true; this.scene.add(nsw);

    // Bus stop + bus (north-east of plaza, on the south kerb)
    this.place(get('city', 'Props_Bus Stop', { scale: CITY }), 16, -17.6, 0, { pad: 0.2 }); // open side to the road
    this.place(get('city', 'Vehicle_Bus', { scale: CITY }), 17, -22.6, Math.PI / 2);
    this.neon('MINIGAMES', '#ffb347', 7, 16, 4.2, -17.4, 0, { size: 0.95 });
    // parked cars along the north kerb
    const cars = ['Vehicle_Car', 'Vehicle_Taxi', 'Vehicle_SUV', 'Vehicle_Pick up Truck', 'Vehicle_Police Car', 'Vehicle_Car'];
    cars.forEach((c, i) => this.place(get('city', c, { scale: CITY }), -34 + i * 11 + (i > 2 ? 14 : 0), -29.2, Math.PI / 2 + (Math.random() - 0.5) * 0.06));
    // street lights both kerbs, with warm point lights
    for (let x = -40; x <= 40; x += 16) {
      this.place(get('city', 'Props_Street Light', { scale: CITY }), x, -19.2, Math.PI, { collide: false });
      this.pointLight(0xffc477, 18, x, 4.6, -20.6, 16);
      this.place(get('city', 'Props_Street Light', { scale: CITY }), x + 8, -31.8, 0, { collide: false });
    }
    // traffic lights, hydrant, bins
    this.place(get('city', 'Props_Traffic Signal_small', { scale: CITY }), -10, -19.3, 0, { collide: false });
    this.place(get('city', 'Props_Hydrant', { scale: CITY }), 8, -18.8, 0, { collide: false });
    this.place(get('city', 'Props_Dustbin', { scale: CITY }), 11, -18.6, 0);
    this.place(get('city', 'Props_Dustbin', { scale: CITY }), -14, -18.6, 0.4);
  }

  buildPlaza() {
    const R = 13;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 64), this.mat.plaza);
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.04; disc.receiveShadow = true; this.scene.add(disc);
    const ring = new THREE.Mesh(new THREE.RingGeometry(R - 0.35, R, 64), this.mat.line);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; this.scene.add(ring);
    const inner = new THREE.Mesh(new THREE.RingGeometry(4.6, 5, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff6a3d').multiplyScalar(1.8), toneMapped: false }));
    inner.rotation.x = -Math.PI / 2; inner.position.set(0, 0.06, 4); this.scene.add(inner);

    // Host screen: big billboard on the north edge facing the plaza
    const frame = this.box(10.4, 5.4, 0.5, this.mat.trim, 0, 5.2, -13.2);
    this.box(0.5, 2.6, 0.5, this.mat.trim, -4.6, 1.3, -13.2); this.box(0.5, 2.6, 0.5, this.mat.trim, 4.6, 1.3, -13.2);
    const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 512;
    this.hostScreen = { canvas: sc, tex: new THREE.CanvasTexture(sc) };
    this.hostScreen.tex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4.8), new THREE.MeshBasicMaterial({ map: this.hostScreen.tex, toneMapped: false }));
    screen.position.set(0, 5.2, -12.9); this.scene.add(screen);
    this.hostScreen.mesh = screen;
    this.drawHostScreen({ title: 'RAGE QUIT RUMBLE', lines: ['Loading…'] });
    this.pointLight(0x7fb0ff, 26, 0, 4, -10.5, 18);
    this.neon('RAGE QUIT RUMBLE', '#ff6a3d', 12, 0, 8.7, -13.0, 0, { size: 1.0 });

    // benches + planters around the plaza
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      if (i === 1 || i === 2) continue; // leave the screen side open
      const x = Math.cos(a) * (R - 1.6), z = Math.sin(a) * (R - 1.6);
      this.place(get('city', 'Props_Bench_2', { scale: CITY * 0.8 }), x, z, -a - Math.PI / 2); // seat faces the plaza
    }
    // trees ringed around the plaza edge
    const trees = ['Tree_01', 'Tree_03', 'Tree_04', 'Tree_02', 'Tree_05'];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.1;
      if (Math.abs(Math.sin(a) + 1) < 0.35) continue; // not in front of the screen
      if (Math.abs(Math.cos(a)) > 0.8 || Math.abs(Math.sin(a)) > 0.8) continue; // keep the four entrances clear
      const x = Math.cos(a) * (R + 3.6), z = Math.sin(a) * (R + 3.6);
      this.place(get('nature', trees[i % trees.length], { fitHeight: 5 + (i % 3) }), x, z, a, { pad: -0.6 });
      if (i % 2 === 0) this.place(get('nature', 'Bush_0' + (1 + (i % 3)), { fitHeight: 0.7 }), x * 0.9, z * 0.9, a, { collide: false });
    }
    // lamp posts on the plaza
    for (const [x, z] of [[-9, -6], [9, -6], [-9, 9], [9, 9]]) {
      this.place(get('streets', 'Poles', { fitHeight: 4.5 }), x, z, 0, { collide: false });
      this.pointLight(0xffd9a0, 30, x, 4.2, z, 18);
    }
  }

  /** Simple open-fronted hall: floor, three walls, roof slab, entrance pillars. front = +x | -x | -z | +z */
  hall(x, z, w, d, h, front, { floor = this.mat.wood, wall = this.mat.wall } = {}) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floor);
    f.rotation.x = -Math.PI / 2; f.position.set(x, 0.05, z); f.receiveShadow = true; this.scene.add(f);
    const t = 0.4;
    const walls = { '+x': [x + w / 2, z, t, d], '-x': [x - w / 2, z, t, d], '+z': [x, z + d / 2, w, t], '-z': [x, z - d / 2, w, t] };
    for (const [side, [wx, wz, ww, wd]] of Object.entries(walls)) {
      if (side === front) {
        // front: two short wall stubs + header beam, leaving a wide opening
        const open = (side.includes('x') ? d : w) * 0.6;
        const stub = ((side.includes('x') ? d : w) - open) / 2;
        if (side.includes('x')) {
          this.box(t, h, stub, wall, wx, h / 2, z - d / 2 + stub / 2);
          this.box(t, h, stub, wall, wx, h / 2, z + d / 2 - stub / 2);
          this.box(t + 0.2, 1.0, open + 0.4, this.mat.trim, wx, h - 0.5, z, 0, false);
        } else {
          this.box(stub, h, t, wall, x - w / 2 + stub / 2, h / 2, wz);
          this.box(stub, h, t, wall, x + w / 2 - stub / 2, h / 2, wz);
          this.box(open + 0.4, 1.0, t + 0.2, this.mat.trim, x, h - 0.5, wz, 0, false);
        }
      } else {
        this.box(ww, h, wd, wall, wx, h / 2, wz);
      }
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.3, d + 0.6), this.mat.trim);
    roof.position.set(x, h + 0.15, z); roof.castShadow = true; this.scene.add(roof); this.occluders.push(roof);
    // roof props
    this.place(get('city', 'Props_Roof prop air', { scale: CITY }), x + w * 0.3, z - d * 0.2, 0, { collide: false, y: h + 0.3 });
    this.place(get('city', 'Props_Roof Antenna', { scale: CITY * 0.7 }), x - w * 0.3, z + d * 0.25, 0, { collide: false, y: h + 0.3 });
  }

  buildArcade() {
    const x = -28, z = -2, w = 20, d = 24, h = 5;
    this.hall(x, z, w, d, h, '+x', { floor: this.mat.dark, wall: this.mat.brickDark });
    this.pointLight(0xc33cff, 30, x + w / 2 + 2.5, 3.5, z, 16);
    this.neon('ARCADE', '#c33cff', 9, x + w / 2 + 0.35, h - 1.2, z, Math.PI / 2, { size: 1.05 });
    this.bulbRow('#c33cff', x + w / 2 + 0.3, z - d / 2, x + w / 2 + 0.3, z + d / 2, 25, h + 0.2);
    this.pointLight(0xc33cff, 22, x + 3, 3.5, z - 6, 16);
    this.pointLight(0x3dd6ff, 22, x + 3, 3.5, z + 6, 16);
    this.pointLight(0xff4d9a, 12, x - 6, 3, z, 14);
    const skins = ['ArcadeStandardAlientoxSCREEN', 'ArcadeStandardAskySCREENTexture', 'ArcadeStandardHotLavaSCREENtexture', 'ArcadeStandardPSquadScreenFBX', 'ArcadeStandardXOXOXOSCREEN'];
    const T = (n) => `assets/env/tex/${n}.png`;
    // back wall: 8 standard cabinets
    for (let i = 0; i < 8; i++) {
      const cab = skin(get('arcade01', 'ArcadeStandardFBX', { fitHeight: 1.9, rotX: -Math.PI / 2 }), T(skins[i % skins.length]));
      this.place(cab, x - w / 2 + 1.0, z - d / 2 + 2.2 + i * 2.6, Math.PI / 2, { pad: 0.1 });
    }
    // north wall: wide cabinets + gun cabinets
    const wide = ['WideStandardCornHoleScreen', 'WideStandardOrangesScreen'];
    for (let i = 0; i < 3; i++) this.place(skin(get('arcade02', 'WideStandardFBX', { fitHeight: 1.95, rotX: -Math.PI / 2 }), T(wide[i % 2])), x - 6 + i * 4.2, z - d / 2 + 1.2, 0, { pad: 0.1 });
    const guns = ['GunCadeZapScreen', 'GunCadeBWScreen'];
    for (let i = 0; i < 2; i++) this.place(skin(get('arcade02', 'GunCadeFBX', { fitHeight: 2.0, rotX: -Math.PI / 2 }), T(guns[i])), x + 6.5 + i * 2.6, z - d / 2 + 1.3, 0, { pad: 0.1 });
    // south wall: driving cabinets with wheels, pinball
    const drv = ['DriverRageRacerScreen', 'DriverTextureRacerScreen'];
    for (let i = 0; i < 2; i++) this.place(skin(get('arcade02', 'DriverFBX', { fitHeight: 1.7, rotX: -Math.PI / 2 }), T(drv[i])), x - 6 + i * 3.6, z + d / 2 - 1.6, Math.PI, { pad: 0.1 });
    for (let i = 0; i < 3; i++) this.place(get('arcadepoly', 'PinballMachineV1', { fitHeight: 1.5 }), x + 2 + i * 1.9, z + d / 2 - 1.3, Math.PI, { pad: 0.1 });
    // centre island: polypack cabinets back to back + table tops with stools
    const poly = ['ArcadeMachineV1', 'ArcadeMachineV2', 'ArcadeMachineV3', 'ArcadeMachineV4'];
    for (let i = 0; i < 4; i++) {
      this.place(get('arcadepoly', poly[i], { fitHeight: 1.8 }), x - 3 + i * 1.5, z - 1.0, 0, { pad: 0.05 });
      this.place(get('arcadepoly', poly[(i + 2) % 4], { fitHeight: 1.8 }), x - 3 + i * 1.5, z + 1.0, Math.PI, { pad: 0.05 });
    }
    for (let i = 0; i < 2; i++) {
      const tx = x + 5.5, tz = z - 4 + i * 8;
      this.place(skin(get('arcade01', 'TableTop', { fitHeight: 0.8, rotX: -Math.PI / 2 }), T(i ? 'TableTopBarred' : 'TableTopNNeutronus')), tx, tz, 0);
      this.place(skin(get('arcade01', 'ChairTallfbx', { fitHeight: 0.75, rotX: -Math.PI / 2 }), T('ChairTallTexture')), tx - 1.1, tz, 0, { collide: false });
      this.place(skin(get('arcade01', 'ChairTallfbx', { fitHeight: 0.75, rotX: -Math.PI / 2 }), T('ChairTallTexture')), tx + 1.1, tz, 0, { collide: false });
    }
    // air hockey x2 near the entrance
    for (let i = 0; i < 2; i++) this.place(get('airhockey', 'AirHockeyTable', { fitHeight: 0.85 }), x + 6.5, z - 1.6 + i * 3.4, Math.PI / 2, { pad: 0.1 });
    this.pointLight(0xffffff, 6, x + 6.5, 2.6, z, 6);
  }

  buildGameHall() {
    const x = 28, z = -2, w = 20, d = 24, h = 5;
    this.hall(x, z, w, d, h, '-x', { floor: this.mat.wood, wall: this.mat.brick });
    this.pointLight(0x3dd6ff, 30, x - w / 2 - 2.5, 3.5, z, 16);
    this.neon('GAME HALL', '#3dd6ff', 9, x - w / 2 - 0.35, h - 1.2, z, -Math.PI / 2, { size: 1.0 });
    this.bulbRow('#3dd6ff', x - w / 2 - 0.3, z - d / 2, x - w / 2 - 0.3, z + d / 2, 25, h + 0.2);
    this.pointLight(0xffe0b0, 24, x - 2, 3.6, z - 6, 15);
    this.pointLight(0xffe0b0, 24, x - 2, 3.6, z + 6, 15);
    this.pointLight(0x55ff99, 8, x + 6, 3, z, 10);
    // 4 pool tables in a 2x2 grid, with cue stands on the back wall
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const px = x - 2 + i * 6.5, pz = z - 6.5 + j * 9;
      this.place(get('boardgames', 'SM_billiard_table', { fitWidth: 2.7 }), px, pz, Math.PI / 2, { pad: 0.15 });
      const lamp = this.box(1.8, 0.25, 0.5, this.mat.trim, px, 2.1, pz, 0, false);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.36), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe9a8').multiplyScalar(2), toneMapped: false }));
      bulb.position.set(px, 1.97, pz); this.scene.add(bulb);
      this.pointLight(0xffe9a8, 5, px, 1.9, pz, 5);
    }
    for (let i = 0; i < 3; i++) this.place(get('boardgames', 'SM_cue_stand', { fitHeight: 1.3 }), x + w / 2 - 0.5, z - 3 + i * 3, -Math.PI / 2, { collide: false });
    // ping pong x2 north side
    for (let i = 0; i < 2; i++) this.place(get('boardgames', 'SM_ping_pong_table', { fitHeight: 0.78 }), x - 5 + i * 5.2, z - d / 2 + 2.6, 0, { pad: 0.1 });
    // table football x2 + punching bags x2 south side
    for (let i = 0; i < 2; i++) this.place(get('boardgames', 'SM_table_football', { fitHeight: 0.95 }), x - 5 + i * 3.4, z + d / 2 - 2.0, 0, { pad: 0.1 });
    for (let i = 0; i < 2; i++) this.place(get('boardgames', 'SM_punching_bag', { fitHeight: 2.6 }), x + 4.5 + i * 2.4, z + d / 2 - 2.4, 0, { pad: 0.05 });
    // bar counter along the east wall with stools
    this.box(0.9, 1.1, 8, this.mat.wood, x + w / 2 - 2.2, 0.55, z + 1, 0);
    this.box(1.1, 0.08, 8.4, this.mat.trim, x + w / 2 - 2.2, 1.14, z + 1, 0, false);
    for (let i = 0; i < 5; i++) this.place(get('dungeon', 'Chair_05', { fitHeight: 0.75 }), x + w / 2 - 3.4, z - 2.4 + i * 1.7, Math.PI / 2, { collide: false });
    for (let i = 0; i < 4; i++) this.place(get('dungeon', 'Bottle_05', { fitHeight: 0.3 }), x + w / 2 - 2.3, z - 2 + i * 1.9, 0, { collide: false, y: 1.18 });
    this.neon('BAR', '#ffd23d', 3, x + w / 2 - 0.3, 3.4, z + 1, -Math.PI / 2, { size: 1.1 });
  }

  buildCafe() {
    const x = -23, z = 24, w = 22, d = 16, h = 4.5;
    this.hall(x, z, w, d, h, '-z', { floor: this.mat.wood, wall: this.mat.brickWarm });
    this.pointLight(0x4de07a, 26, x, 3.5, z - d / 2 - 2.5, 16);
    this.pointLight(0xffd9a0, 18, x - 8, 3.0, z - d / 2 - 1.5, 10);
    this.pointLight(0xffd9a0, 18, x + 8, 3.0, z - d / 2 - 1.5, 10);
    this.neon('BOARD GAME CAFE', '#4de07a', 11, x, h - 1.0, z - d / 2 - 0.35, Math.PI, { size: 0.9 });
    this.bulbRow('#4de07a', x - w / 2, z - d / 2 - 0.3, x + w / 2, z - d / 2 - 0.3, 24, h + 0.2);
    this.pointLight(0xffe4c0, 20, x - 5, 3.4, z + 1, 13);
    this.pointLight(0xffe4c0, 20, x + 5, 3.4, z + 1, 13);
    // 6 game tables (dungeon table + chairs) with a board on each
    const boards = ['SM_chessboard', 'SM_backgammon', 'SM_chessboard', 'SM_chessboard', 'SM_backgammon', 'SM_chessboard'];
    for (let i = 0; i < 6; i++) {
      const tx = x - 7 + (i % 3) * 7, tz = z - 3 + Math.floor(i / 3) * 6;
      const table = this.place(get('dungeon', 'Table_01', { fitHeight: 0.8 }), tx, tz, 0, { pad: 0.1 });
      const ts = table.userData.size;
      this.place(get('boardgames', boards[i], { fitWidth: 0.55 }), tx, tz, i % 2 ? 0 : Math.PI / 2, { collide: false, y: 0.8 });
      if (i % 3 === 0) {
        // chess pieces on the board
        for (let p = 0; p < 6; p++) {
          this.place(get('boardgames', 'SM_white_chess_piece' + (p ? '_' + p : ''), { fitHeight: 0.07 }), tx - 0.2 + p * 0.08, tz + 0.2, 0, { collide: false, y: 0.81 });
          this.place(get('boardgames', 'SM_black_chess_piece' + (p ? '_' + p : ''), { fitHeight: 0.07 }), tx - 0.2 + p * 0.08, tz - 0.2, Math.PI, { collide: false, y: 0.81 });
        }
      }
      for (const [dx, dz, r] of [[0, 1.0, Math.PI], [0, -1.0, 0], [1.1, 0, -Math.PI / 2], [-1.1, 0, Math.PI / 2]]) {
        this.place(get('dungeon', 'Chair_05', { fitHeight: 0.85 }), tx + dx * (ts ? ts.x / 2 + 0.2 : 1), tz + dz * (ts ? ts.z / 2 + 0.3 : 1), r, { collide: false });
      }
      this.place(get('dungeon', 'Candle_01', { fitHeight: 0.18 }), tx + 0.45, tz + 0.35, 0, { collide: false, y: 0.8 });
      this.pointLight(0xffb060, 1.2, tx + 0.45, 1.1, tz + 0.35, 2.5);
    }
    // counter at the back with jugs, pots, books; shelves
    this.box(6, 1.0, 0.8, this.mat.wood, x, 0.5, z + d / 2 - 1.2);
    this.box(6.2, 0.06, 0.9, this.mat.trim, x, 1.03, z + d / 2 - 1.2, 0, false);
    for (let i = 0; i < 4; i++) this.place(get('dungeon', ['Jug_02', 'Pot_01', 'Book_09', 'Bottle_05'][i], { fitHeight: 0.3 }), x - 2 + i * 1.3, z + d / 2 - 1.2, 0, { collide: false, y: 1.06 });
    this.place(get('dungeon', 'Box_02', { fitHeight: 0.8 }), x + w / 2 - 1.2, z + d / 2 - 1.2, 0.3);
    this.place(get('dungeon', 'Box_02', { fitHeight: 0.6 }), x + w / 2 - 2.0, z + d / 2 - 1.0, -0.2);
    this.place(get('dungeon', 'WallDecor_05', { fitHeight: 1.6 }), x - w / 2 + 0.35, 2.2, Math.PI / 2, { collide: false, y: 1.6 });
    // cards table (uno) near the front
    const ct = this.place(get('rpg', 'rpgpp_lt_table_01', { fitHeight: 0.8 }), x + 7, z - 5.5, 0, { pad: 0.1 });
    for (let c = 0; c < 10; c++) this.place(get('boardgames', 'SM_uno_card' + (c ? '_' + c : ''), { fitWidth: 0.09 }), x + 6.4 + (c % 5) * 0.3, z - 5.9 + Math.floor(c / 5) * 0.5, (c * 0.7) % 1, { collide: false, y: 0.81 });
    for (let c = 0; c < 6; c++) this.place(get('boardgames', 'SM_domino' + (c ? '_' + c : ''), { fitWidth: 0.06 }), x + 7.2 + c * 0.08, z - 5.2, 0.3, { collide: false, y: 0.81 });
    for (const [dx, dz, r] of [[0, 1.1, Math.PI], [0, -1.1, 0], [1.6, 0, -Math.PI / 2], [-1.6, 0, Math.PI / 2]]) this.place(get('rpg', 'rpgpp_lt_bench_wood_02', { fitHeight: 0.45 }), x + 7 + dx, z - 5.5 + dz, r, { collide: false });
  }

  buildBackRoom() {
    // Dungeon-walled den between cafe and court. Entrance from the north.
    const x = 0, z = 25, w = 12, d = 14;
    const wallH = 4;
    const seg = (sx, sz, r) => { const o = this.place(get('dungeon', 'Wall_27', { fitWidth: 4 }), sx, sz, r, { pad: 0.05 }); o.traverse((m) => { if (m.isMesh) this.occluders.push(m); }); return o; };
    for (let i = 0; i < 3; i++) { seg(x - w / 2 + 2 + i * 4, z + d / 2, 0); }
    for (let i = 0; i < 3; i++) { seg(x - w / 2, z - d / 2 + 2.3 + i * 4, Math.PI / 2); seg(x + w / 2, z - d / 2 + 2.3 + i * 4, Math.PI / 2); }
    seg(x - w / 2 + 2, z - d / 2, 0); seg(x + w / 2 - 2, z - d / 2, 0); // front wall with 4 m gap
    for (const [cx, cz] of [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x - w / 2, z + d / 2], [x + w / 2, z + d / 2]]) this.place(get('dungeon', 'Column_01', { fitHeight: wallH + 0.3 }), cx, cz, 0);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.mat.dark);
    floor.rotation.x = -Math.PI / 2; floor.position.set(x, 0.05, z); floor.receiveShadow = true; this.scene.add(floor);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.3, d + 0.4), this.mat.trim);
    roof.position.set(x, wallH + 0.15, z); this.scene.add(roof); this.occluders.push(roof);
    // torches at the entrance and inside
    for (const [tx, tz, r] of [[x - 2.3, z - d / 2 - 0.2, 0], [x + 2.3, z - d / 2 - 0.2, 0], [x - w / 2 + 0.3, z + 2, Math.PI / 2], [x + w / 2 - 0.3, z + 2, -Math.PI / 2]]) {
      this.place(get('dungeon', 'Light_08', { fitHeight: 0.7 }), tx, tz, r, { collide: false, y: 1.9 });
      this.pointLight(0xff8a3d, 8, tx, 2.4, tz, 7);
    }
    this.neon('BACK ROOM', '#ff3d3d', 6, x, wallH - 0.6, z - d / 2 - 0.4, Math.PI, { size: 0.9, glow: 1.3 });
    this.pointLight(0xff5a3d, 20, x, 3.2, z - d / 2 - 2.5, 12);
    // two round gambling tables (dungeon table + chairs) + a lottery drum, barrels, crates
    for (let i = 0; i < 2; i++) {
      const tx = x - 2.8 + i * 5.6, tz = z + 1;
      this.place(get('dungeon', 'Table_01', { fitHeight: 0.8 }), tx, tz, Math.PI / 2, { pad: 0.1 });
      this.place(get('boardgames', 'SM_lottery', { fitWidth: 0.4 }), tx, tz, 0, { collide: false, y: 0.8 });
      for (let c = 0; c < 8; c++) this.place(get('boardgames', 'SM_uno_card_' + (10 + c), { fitWidth: 0.09 }), tx - 0.5 + c * 0.14, tz + 0.35, c * 0.2, { collide: false, y: 0.81 });
      for (const [dx, dz, r] of [[0, 1.2, Math.PI], [0, -1.2, 0], [1.4, 0, -Math.PI / 2], [-1.4, 0, Math.PI / 2]]) this.place(get('dungeon', 'Chair_05', { fitHeight: 0.85 }), tx + dx, tz + dz, r, { collide: false });
      this.place(get('dungeon', 'Candle_01', { fitHeight: 0.2 }), tx - 0.5, tz - 0.4, 0, { collide: false, y: 0.8 });
      this.pointLight(0xff9a4d, 3, tx, 1.6, tz, 4);
    }
    this.place(get('rpg', 'rpgpp_lt_barrel_01', { fitHeight: 1.0 }), x - w / 2 + 1, z + d / 2 - 1, 0);
    this.place(get('rpg', 'rpgpp_lt_barrel_02', { fitHeight: 0.8 }), x - w / 2 + 2.1, z + d / 2 - 1, 0.5);
    this.place(get('rpg', 'rpgpp_lt_crate_01', { fitHeight: 0.6 }), x + w / 2 - 1.2, z + d / 2 - 1.1, 0.2);
    this.place(get('dungeon', 'Mud_04', { fitWidth: 1.5 }), x + 2, z - 3, 0, { collide: false, y: 0.06 });
  }

  buildCourt() {
    const x = 25, z = 25, w = 20, d = 15;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.mat.court);
    f.rotation.x = -Math.PI / 2; f.position.set(x, 0.05, z); f.receiveShadow = true; this.scene.add(f);
    // chain-link style fence (thin dark boxes) on three sides, open to the north
    const fence = (fx, fz, len, r) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(len, 3.2, 0.08), new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.6, metalness: 0.6, transparent: true, opacity: 0.55 }));
      this.place(post, fx, fz, r, { y: 1.6 });
    };
    fence(x, z + d / 2, w, 0); fence(x - w / 2, z, d, Math.PI / 2); fence(x + w / 2, z, d, Math.PI / 2);
    // two hoops facing each other
    for (const [hx, dir] of [[x - w / 2 + 1.2, 1], [x + w / 2 - 1.2, -1]]) {
      this.box(0.14, 3.6, 0.14, this.mat.metal, hx, 1.8, z);
      const board = this.box(0.08, 1.1, 1.8, new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }), hx + dir * 0.35, 3.3, z, 0, false);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 8, 24), new THREE.MeshStandardMaterial({ color: 0xff7a1f, roughness: 0.4, metalness: 0.5 }));
      ring.rotation.x = Math.PI / 2; ring.position.set(hx + dir * 0.65, 3.05, z); this.scene.add(ring);
      const net = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.15, 0.4, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, wireframe: true }));
      net.position.set(hx + dir * 0.65, 2.85, z); this.scene.add(net);
    }
    // floodlights
    for (const [lx, lz] of [[x - w / 2 + 0.5, z + d / 2 - 0.5], [x + w / 2 - 0.5, z + d / 2 - 0.5]]) {
      this.box(0.16, 7, 0.16, this.mat.metal, lx, 3.5, lz);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color('#dff3ff').multiplyScalar(2.2), toneMapped: false }));
      head.position.set(lx, 7.1, lz - 0.2); this.scene.add(head);
      this.pointLight(0xdff3ff, 26, lx, 7, lz - 1, 22);
    }
    // bleacher bench + ball rack
    this.place(get('city', 'Props_Bench_1', { scale: CITY * 0.8 }), x - 4, z - d / 2 - 1.2, 0);
    this.place(get('city', 'Props_Bench_1', { scale: CITY * 0.8 }), x + 4, z - d / 2 - 1.2, 0);
    this.neon('COURT', '#ffd23d', 5, x, 4.2, z + d / 2 + 0.2, Math.PI, { size: 1.1 });
  }

  buildBackdrop() {
    // Shops across the street, facing the road.
    const row = ['Building_Bar', 'Building_Pizza', 'Building_Music Store', 'Building_Clothing', 'Building_Fast Food', 'Building_Coffee Shop', 'Building_Books Shop', 'Building_Chicken Shop'];
    let bx = -46;
    for (const name of row) {
      const s = pieceSize('city', name);
      const wdt = (s ? s[0] : 12) * CITY;
      this.place(get('city', name, { scale: CITY }), bx + wdt / 2, -38 - ((s ? s[2] : 10) * CITY) / 2, Math.PI, { pad: 0.2 });
      bx += wdt + 1.2;
    }
    // Tall blocks behind them and at the far sides for a skyline
    const sky = [['Building Sky_big_color01', -40, -62], ['Building_Residential_color01', -16, -60], ['Building Sky_small_color01', 8, -60], ['Building Sky_big_color01', 34, -62], ['Building_Factory', 60, -56],
      ['Building Sky_small_color01', -58, -30], ['Building_Residential_color01', -58, 0], ['Building Sky_big_color01', -60, 30], ['Building Sky_small_color01', 58, -30], ['Building_Residential_color01', 58, 2], ['Building Sky_big_color01', 60, 30],
      ['Building_House_01_color01', -36, 44], ['Building_House_03_color01', -10, 46], ['Building_Super Market', 22, 46], ['Building_House_02_color01', 48, 44]];
    for (const [name, sx, sz] of sky) this.place(get('city', name, { scale: CITY }), sx, sz, sz > 0 ? 0 : Math.PI, { collide: false });
    // Toony demo block dioramas in two far corners for extra life
    this.place(get('toony', 'Demo_Block', { scale: 1.1 }), -64, -64, 0, { collide: false });
    this.place(get('toony', 'Demo_Block', { scale: 1.1 }), 66, 62, Math.PI, { collide: false });
    // Billboards on the plaza corners
    this.place(get('city', 'Props_BillBoard_medium', { scale: CITY }), -18, 14, Math.PI / 4, { pad: 0.1 });
    this.place(get('city', 'Props_BillBoard_medium', { scale: CITY }), 18, 14, -Math.PI / 4, { pad: 0.1 });
    // Grass + trees around the outer edges of the block
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const px = -44 + t * 88;
      this.place(get('nature', 'Tree_0' + (1 + (i % 5)), { fitHeight: 5.5 + (i % 3) }), px, 40 + (i % 2) * 1.5, i, { pad: -0.6 });
      this.place(get('nature', 'Bush_0' + (1 + (i % 3)), { fitHeight: 0.8 }), px + 1.5, 38.5, i, { collide: false });
    }
    for (let i = 0; i < 6; i++) {
      this.place(get('nature', 'Tree_0' + (1 + (i % 5)), { fitHeight: 6 }), -44, -14 + i * 9, i, { pad: -0.6 });
      this.place(get('nature', 'Tree_0' + (1 + ((i + 2) % 5)), { fitHeight: 6 }), 44, -14 + i * 9, i, { pad: -0.6 });
    }
    for (let i = 0; i < 5; i++) this.place(get('nature', 'Rock_0' + (1 + (i % 5)), { fitWidth: 0.8 + i * 0.2 }), -40 + i * 3, 36 + (i % 2), i, { collide: false });
  }

  buildLighting() {
    this.scene.background = new THREE.Color(0x0a0b12);
    this.scene.fog = new THREE.FogExp2(0x0a0b12, 0.011);
    const hemi = new THREE.HemisphereLight(0x5567a0, 0x2e261e, 1.25);
    this.scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xaebcff, 1.4);
    moon.position.set(-30, 50, 20);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.left = moon.shadow.camera.bottom = -50;
    moon.shadow.camera.right = moon.shadow.camera.top = 50;
    moon.shadow.camera.far = 140;
    moon.shadow.bias = -0.0008;
    moon.shadow.normalBias = 0.03;
    this.scene.add(moon);
    this.moon = moon;
    // stars
    const n = 900; const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * 0.45 + 0.05, r = 300;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: true, fog: false })));
  }

  drawHostScreen({ title = 'RAGE QUIT RUMBLE', code = '', lines = [], highlight = -1 }) {
    const c = this.hostScreen.canvas, ctx = c.getContext('2d');
    ctx.fillStyle = '#0d1020'; ctx.fillRect(0, 0, c.width, c.height);
    // scanlines
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let y = 0; y < c.height; y += 6) ctx.fillRect(0, y, c.width, 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff6a3d'; ctx.font = 'bold 64px Impact, "Arial Black", system-ui';
    ctx.fillText(title, 48, 70);
    if (code) { ctx.textAlign = 'right'; ctx.fillStyle = '#e6e8ec'; ctx.font = 'bold 54px system-ui'; ctx.fillText('ROOM ' + code, c.width - 48, 70); ctx.textAlign = 'left'; }
    ctx.fillStyle = '#2a3050'; ctx.fillRect(48, 112, c.width - 96, 4);
    ctx.font = '40px system-ui';
    lines.forEach((l, i) => {
      const y = 170 + i * 58;
      if (i === highlight) { ctx.fillStyle = 'rgba(255,106,61,0.25)'; ctx.fillRect(40, y - 28, c.width - 80, 56); }
      ctx.fillStyle = i === highlight ? '#ffb59a' : '#cfd3dc';
      ctx.fillText(l, 64, y);
    });
    this.hostScreen.tex.needsUpdate = true;
  }

  /** Circle (radius r) vs world colliders: returns corrected position. */
  resolve(pos, r) {
    for (const c of this.colliders) {
      const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
      const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
      const dx = pos.x - cx, dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2); pos.x += (dx / d) * (r - d); pos.z += (dz / d) * (r - d);
        } else {
          // inside the box: push out along the smallest axis
          const l = pos.x - c.minX, rr = c.maxX - pos.x, t = pos.z - c.minZ, b = c.maxZ - pos.z;
          const m = Math.min(l, rr, t, b);
          if (m === l) pos.x = c.minX - r; else if (m === rr) pos.x = c.maxX + r; else if (m === t) pos.z = c.minZ - r; else pos.z = c.maxZ + r;
        }
      }
    }
    return pos;
  }
}
