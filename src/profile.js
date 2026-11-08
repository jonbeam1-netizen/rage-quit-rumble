// Player profile: who you are in Rage Quit Rumble. Saved in this browser only.
const KEY = 'rqr.profile';
const VERSION = 1;

export const TEAM_COLORS = [
  { id: 'red', hex: '#ff4d4d' },
  { id: 'orange', hex: '#ff8a3d' },
  { id: 'yellow', hex: '#ffd23d' },
  { id: 'green', hex: '#4de07a' },
  { id: 'cyan', hex: '#3dd6ff' },
  { id: 'blue', hex: '#4d7bff' },
  { id: 'purple', hex: '#b05dff' },
  { id: 'pink', hex: '#ff5db8' },
];

export const NAME_MAX = 14;

export function defaultProfile() {
  return {
    v: VERSION,
    name: 'Player' + String(Math.floor(Math.random() * 90) + 10),
    characterId: 'men/Casual_Hoodie',
    color: TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)].id,
    unlocks: [],
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || p.v !== VERSION) return null;
    return { ...defaultProfile(), ...p };
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  const clean = {
    v: VERSION,
    name: sanitizeName(profile.name),
    characterId: profile.characterId,
    color: TEAM_COLORS.some((c) => c.id === profile.color) ? profile.color : TEAM_COLORS[0].id,
    unlocks: Array.isArray(profile.unlocks) ? profile.unlocks : [],
  };
  try { localStorage.setItem(KEY, JSON.stringify(clean)); } catch { /* private mode etc. */ }
  return clean;
}

export function sanitizeName(name) {
  const s = String(name || '').replace(/[^\w \-'!?.]/g, '').trim().slice(0, NAME_MAX);
  return s || 'Player';
}

export function colorHex(id) {
  return (TEAM_COLORS.find((c) => c.id === id) || TEAM_COLORS[0]).hex;
}
