// Kit loader: each kit is one GLB (assets/env/<kit>.glb) holding every piece of an asset pack
// as a named node, plus a catalog JSON with sizes. get() hands back a fresh clone to place.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const kits = new Map();
const textures = new Map();

export async function loadKits(names, onProgress) {
  let done = 0;
  await Promise.all(names.map(async (name) => {
    const [gltf, catalog] = await Promise.all([
      new Promise((res, rej) => loader.load(`assets/env/${name}.glb`, res, undefined, rej)),
      fetch(`assets/env/${name}.json`).then((r) => r.json()),
    ]);
    const byName = new Map();
    gltf.scene.traverse((o) => { if (o.name) byName.set(o.name, o); });
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 4; }
          m.roughness = Math.min(1, (m.roughness ?? 0.9));
          m.metalness = 0;
        }
      }
    });
    kits.set(name, { scene: gltf.scene, byName, catalog, sizes: new Map(catalog.pieces.map((p) => [p.name, p])) });
    done++; onProgress?.(done / names.length);
  }));
}

/** Clone a piece. opts: { scale, fitHeight, fitWidth, shadow:true, rotX } */
export function get(kit, piece, opts = {}) {
  const k = kits.get(kit);
  if (!k) throw new Error(`kit ${kit} not loaded`);
  const src = k.byName.get(piece);
  if (!src) { console.warn(`piece ${kit}/${piece} missing`); return new THREE.Group(); }
  const obj = src.clone(true);
  // Reset transform the source had inside its kit scene.
  obj.position.set(0, 0, 0); obj.rotation.set(0, 0, 0); obj.scale.set(1, 1, 1);
  if (opts.rotX) obj.rotation.x = opts.rotX;
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  let s = opts.scale ?? 1;
  if (opts.fitHeight && size.y > 0) s = opts.fitHeight / size.y;
  if (opts.fitWidth && size.x > 0) s = opts.fitWidth / size.x;
  if (opts.fitDepth && size.z > 0) s = opts.fitDepth / size.z;
  obj.scale.setScalar(s);
  obj.updateMatrixWorld(true);
  // Rest the piece on y=0 and centre it on x/z (unless told to keep origin).
  if (!opts.keepOrigin) {
    const b = new THREE.Box3().setFromObject(obj);
    const c = b.getCenter(new THREE.Vector3());
    const wrap = new THREE.Group();
    obj.position.set(-c.x, -b.min.y, -c.z);
    wrap.add(obj);
    wrap.userData.size = b.getSize(new THREE.Vector3());
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = opts.shadow !== false; o.receiveShadow = true; } });
    return wrap;
  }
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = opts.shadow !== false; o.receiveShadow = true; } });
  return obj;
}

export function pieceSize(kit, piece) {
  return kits.get(kit)?.sizes.get(piece)?.size;
}

export function texture(path) {
  if (!textures.has(path)) {
    const t = texLoader.load(path);
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false; // glTF convention, matches the kit UVs
    textures.set(path, t);
  }
  return textures.get(path);
}

/** Replace materials on a clone with a skin texture (arcade cabinets). */
export function skin(obj, texPath, { emissive = 0.35 } = {}) {
  const map = texture(texPath);
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const m = new THREE.MeshStandardMaterial({ map, roughness: 0.7, metalness: 0, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: emissive });
    o.material = m;
  });
  return obj;
}
