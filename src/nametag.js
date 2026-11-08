import * as THREE from 'three';

/** Floating name tag sprite: makeNameTag('Jon', '#3dd6ff') -> { sprite, set(name, color) } */
export function makeNameTag(name, color, { width = 1.4, height = 0.35 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  sprite.scale.set(width, height, 1);
  sprite.renderOrder = 10;
  function set(n, c) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    const text = String(n || '');
    ctx.font = 'bold 60px system-ui, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = Math.min(500, ctx.measureText(text).width + 60);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(256 - w / 2, 20, w, 88, 24);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.fillText(text, 256, 66);
    tex.needsUpdate = true;
  }
  set(name, color);
  return { sprite, set };
}
