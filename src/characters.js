// Rage Quit Rumble - character + animation loading shared by the viewer and the game.
// All 21 Quaternius characters share one 62-bone skeleton ("CharacterArmature"), so an
// animation clip loaded from ANY file (a character GLB or a separate animation pack GLB)
// can be played on ANY character: three.js binds tracks by bone name.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const gltfCache = new Map();

export async function loadManifest(url = 'assets/characters/manifest.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  return res.json();
}

function loadGLTF(url) {
  if (!gltfCache.has(url)) {
    gltfCache.set(url, new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject)));
  }
  return gltfCache.get(url);
}

/** Loads a character GLB. Returns { root, clips, parts, materials, mixer }. */
export async function loadCharacter(info) {
  const gltf = await loadGLTF(info.file);
  // Clone so several instances of the same character can exist (lobby with 8 players).
  const root = cloneSkinned(gltf.scene);
  const parts = {};
  const materials = new Map();
  const partNames = new Set(info.meshNodes || []);
  root.traverse((o) => {
    // Parts are the named glTF nodes (Adventurer_Head, Pistol, ...). GLTFLoader turns a
    // multi-material node into a Group with child meshes, so match on the node name.
    if (partNames.has(o.name)) parts[o.name] = o;
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false; // skinned meshes move far from their rest bounds
      if (!partNames.size) parts[o.name] = o;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) materials.set(m.name, m);
    }
  });
  const mixer = new THREE.AnimationMixer(root);
  return { info, root, clips: gltf.animations.slice(), parts, materials, mixer };
}

/** Loads extra animation packs listed in manifest.animationPacks: [{ name, file }]. */
export async function loadAnimationPacks(packs = []) {
  const clips = [];
  for (const pack of packs) {
    const gltf = await loadGLTF(pack.file);
    for (const clip of gltf.animations) {
      const c = clip.clone();
      c.name = pack.prefix ? `${pack.prefix}${clip.name}` : clip.name;
      clips.push(c);
    }
  }
  return clips;
}

/** Plays a clip on a character with a short crossfade. Returns the action. */
export function play(character, clip, { fade = 0.2, loop = true, speed = 1 } = {}) {
  const { mixer } = character;
  const action = mixer.clipAction(clip);
  action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
  action.clampWhenFinished = !loop;
  action.timeScale = speed;
  if (character.current && character.current !== action) {
    character.current.fadeOut(fade);
  }
  action.reset().fadeIn(fade).play();
  character.current = action;
  return action;
}

/** Clone a glTF scene that contains SkinnedMesh objects (three's SkeletonUtils.clone). */
export function cloneSkinned(source) {
  const sourceLookup = new Map();
  const cloneLookup = new Map();
  const clone = source.clone();
  parallelTraverse(source, clone, (s, c) => { sourceLookup.set(c, s); cloneLookup.set(s, c); });
  clone.traverse((node) => {
    if (!node.isSkinnedMesh) return;
    const src = sourceLookup.get(node);
    const bones = src.skeleton.bones.map((b) => cloneLookup.get(b));
    node.skeleton = src.skeleton.clone();
    node.bindMatrix.copy(src.bindMatrix);
    node.skeleton.bones = bones;
    node.bind(node.skeleton, node.bindMatrix);
  });
  return clone;
}
function parallelTraverse(a, b, cb) {
  cb(a, b);
  for (let i = 0; i < a.children.length; i++) parallelTraverse(a.children[i], b.children[i], cb);
}
