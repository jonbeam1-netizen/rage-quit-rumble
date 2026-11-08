// Upgrade cards (ROUNDS-style). After each round everyone who did not win picks one of three.
// Stats are recomputed from the full card list so every peer agrees on a player's numbers.

export const BASE = {
  hp: 100,
  dmg: 34,          // three hits with the starter pistol
  fireRate: 0.26,   // seconds between shots
  ammo: 8,
  reload: 1.1,
  bulletSpeed: 42,
  bullets: 1,
  spread: 0,        // radians of random cone
  bounces: 0,
  size: 1,          // bullet radius multiplier (base radius 0.09)
  bulletLife: 1.6,
  speed: 6.5,
  jump: 1,
  gravity: 1,
  dashCd: 2.2,
  dashPower: 1,
  lifesteal: 0,
  shield: 0,
};

export const CARDS = [
  { id: 'heavy', name: 'Heavy Rounds', icon: '🧱', desc: '+50% damage. Bullets fly slower.', apply: (s) => { s.dmg *= 1.5; s.bulletSpeed *= 0.8; } },
  { id: 'rapid', name: 'Rapid Fire', icon: '⚡', desc: 'Shoot 65% faster. −15% damage.', apply: (s) => { s.fireRate *= 0.6; s.dmg *= 0.85; } },
  { id: 'buckshot', name: 'Buckshot', icon: '💥', desc: 'Three bullets per shot in a spread. Each does 60%.', apply: (s) => { s.bullets += 2; s.spread += 0.09; s.dmg *= 0.6; } },
  { id: 'bouncy', name: 'Bouncy', icon: '🏀', desc: 'Bullets bounce twice off walls and floors.', apply: (s) => { s.bounces += 2; s.bulletLife *= 1.7; } },
  { id: 'quick', name: 'Quick Feet', icon: '👟', desc: 'Move 25% faster.', apply: (s) => { s.speed *= 1.25; } },
  { id: 'tank', name: 'Tank', icon: '🛡️', desc: '+60 max health.', apply: (s) => { s.hp += 60; } },
  { id: 'bigmag', name: 'Big Mag', icon: '📦', desc: '+6 ammo and a faster reload.', apply: (s) => { s.ammo += 6; s.reload *= 0.7; } },
  { id: 'glass', name: 'Glass Cannon', icon: '🔮', desc: 'Double damage. Health drops to 60%.', apply: (s) => { s.dmg *= 2; s.hp *= 0.6; } },
  { id: 'vamp', name: 'Lifesteal', icon: '🩸', desc: 'Heal 40% of the damage you deal.', apply: (s) => { s.lifesteal += 0.4; } },
  { id: 'phase', name: 'Phase Dash', icon: '🌀', desc: 'Dash twice as often and 30% further.', apply: (s) => { s.dashCd *= 0.5; s.dashPower *= 1.3; } },
  { id: 'giant', name: 'Giant Bullets', icon: '🎱', desc: 'Huge slow bullets. +20% damage.', apply: (s) => { s.size *= 2.2; s.bulletSpeed *= 0.75; s.dmg *= 1.2; } },
  { id: 'shield', name: 'Shield', icon: '🔰', desc: 'Block the first hit you take each round.', apply: (s) => { s.shield += 1; } },
  { id: 'moon', name: 'Moon Boots', icon: '🌙', desc: 'Jump 45% higher with floaty gravity.', apply: (s) => { s.jump *= 1.45; s.gravity *= 0.75; } },
  { id: 'fast', name: 'Fast Bullets', icon: '🚀', desc: 'Bullets fly 80% faster. +10% damage.', apply: (s) => { s.bulletSpeed *= 1.8; s.dmg *= 1.1; } },
];
export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export function computeStats(cardIds = []) {
  const s = { ...BASE };
  for (const id of cardIds) CARD_BY_ID[id]?.apply(s);
  s.hp = Math.round(s.hp); s.ammo = Math.round(s.ammo); s.dmg = Math.round(s.dmg);
  return s;
}

/** Deal n cards the player does not own yet. */
export function dealCards(owned, rng, n = 3) {
  const pool = CARDS.filter((c) => !owned.includes(c.id));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n).map((c) => c.id);
}

/** Small seeded PRNG so host and clients build the same arena from one number. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
