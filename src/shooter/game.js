// The shooter minigame (STRAFTAT pace, ROUNDS upgrade cards). Runs inside the lobby page on
// the lobby's PeerJS connections. Host is authoritative for rounds, health and scores; the
// shooter's own machine judges bullet hits and reports them (shooter-side hit judgement).
//
// Messages: client -> host  { t:'g', k, ... }   host -> everyone  { t:'G', k, ... }
import * as THREE from 'three';
import { Arena, slab } from './arena.js';
import { ShooterAvatar } from './avatar.js';
import { Bullets, Particles } from './bullets.js';
import { Sfx } from './sfx.js';
import { CARD_BY_ID, computeStats, dealCards, mulberry32 } from './cards.js';
import { TEAM_COLORS } from '../profile.js';

const R = 0.35, H = 1.7, GRAV = 24, JUMP_V = 8.6, DASH_V = 15, DASH_T = 0.2, STEP = 0.45;
const ROUND_TIME = 75, COUNTDOWN = 3, TARGET_WINS = 3, CARD_TIME = 15, INTERP = 100;
const UP = new THREE.Vector3(0, 1, 0);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const arr = (v) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];

export class ShooterGame {
  /**
   * ctx: { net, manifest, profile, camera, canvas, roster: Map(id -> profile) of the other players,
   *        seed, info (late-join state from the host, optional), onExit(reason, seed), toast(text) }
   */
  constructor(ctx) {
    this.net = ctx.net; this.manifest = ctx.manifest; this.profile = ctx.profile; this.camera = ctx.camera; this.canvas = ctx.canvas;
    this.isHost = ctx.net.isHost; this.onExit = ctx.onExit; this.toast = ctx.toast || (() => {});
    this.seed = (ctx.seed ?? 1) >>> 0;
    this.hud = $('ghud');
    this.scene = new THREE.Scene();
    this.arena = new Arena(this.scene, this.seed);
    this.arena.build();
    this.bullets = new Bullets(this.scene, this.arena);
    this.particles = new Particles(this.scene);
    this.sfx = new Sfx();
    this.players = new Map();
    this.dummies = [];
    this.timers = new Set();
    this.phase = 'waiting';
    this.round = 0;
    this.targetWins = TARGET_WINS;
    this.offers = null;
    this.pending = new Set();
    this.specIdx = 0;
    this.time = 0;
    this.sens = +(localStorage.getItem('rqr.sens') || 1);
    this.input = { keys: new Set(), dx: 0, dy: 0, down: false, locked: false, jump: false, dash: false, reload: false };
    this.flash = new THREE.PointLight(0xffd0a0, 0, 7, 2);
    this.scene.add(this.flash);

    this.me = this.addPlayer(this.net.id, this.profile, true);
    this.me.yaw = Math.PI; this.me.pitch = 0.08;
    this.me.pos.copy(this.arena.spawns[0]);
    for (const [id, prof] of ctx.roster) this.addPlayer(id, prof, false);
    if (ctx.info) this.applyInfo(ctx.info);

    this.buildHud();
    this.setupInput();
    this.me.avatar.ready.then(() => { this.sendG({ k: 'ready' }); });
    if (this.isHost) { this.readyIds = new Set(); this.after(8000, () => this.hostBegin()); }
    this.msg(ctx.info ? 'Spectating until the next round' : 'Waiting for players…', 0);
  }

  // =============================================================== players
  addPlayer(id, profile, local) {
    if (this.players.has(id)) return this.players.get(id);
    const avatar = new ShooterAvatar(this.scene, this.manifest, profile, { tag: !local });
    const p = {
      id, profile, local, avatar, pos: avatar.group.position, vel: new THREE.Vector3(), yaw: 0, pitch: 0, grounded: true,
      hp: 100, maxHp: 100, alive: false, cards: [], stats: computeStats([]), wins: 0, kills: 0, roundKills: 0, shieldUsed: false,
      buffer: [], dashT: 0, dashCd: 0, ammo: 8, reloadT: 0, nextShot: 0, lastFire: 0, anim: 'Idle_Gun',
    };
    avatar.group.visible = false;
    this.players.set(id, p);
    this.hudScores();
    return p;
  }
  onJoin(id, profile) {
    this.addPlayer(id, profile, false);
    this.toast(`${profile.name} joined — in next round`);
  }
  onLeave(id) {
    const p = this.players.get(id);
    if (!p) return;
    p.avatar.dispose();
    this.players.delete(id);
    this.hudScores();
    if (this.isHost) {
      this.pending.delete(id);
      if (this.phase === 'cards' && this.pending.size === 0) { this.clearTimer(this.cardTimer); this.after(500, () => this.hostStartRound()); }
      if (this.players.size < 2 && this.phase !== 'practice' && this.phase !== 'results') { this.clearAll(); this.hostPractice(); this.toast('Everyone left. Practice mode until someone joins.'); }
      else if (this.phase === 'play') this.hostCheckRound();
    }
  }
  /** Host: state a late joiner needs. */
  joinInfo() {
    const players = {};
    for (const p of this.players.values()) players[p.id] = { wins: p.wins, kills: p.kills, cards: p.cards };
    return { seed: this.seed, phase: this.phase, round: this.round, targetWins: this.targetWins, players };
  }
  applyInfo(info) {
    this.round = info.round || 0; this.targetWins = info.targetWins || TARGET_WINS;
    for (const [id, s] of Object.entries(info.players || {})) {
      const p = this.players.get(id); if (!p) continue;
      p.wins = s.wins; p.kills = s.kills; p.cards = s.cards || []; p.stats = computeStats(p.cards); p.maxHp = p.stats.hp;
    }
    this.setPhase(info.phase === 'practice' ? 'waiting' : info.phase);
  }

  // =============================================================== network plumbing
  sendG(msg) { if (this.isHost) this.hostMsg(this.net.id, msg); else this.net.send({ t: 'g', ...msg }); }
  bcast(msg) { this.net.broadcast({ t: 'G', ...msg }); this.applyG(msg); }
  /** From main.js: a 'g' (at host) or 'G' (at client) message. */
  onMessage(from, msg) { if (msg.t === 'g' && this.isHost) this.hostMsg(from, msg); else if (msg.t === 'G' && !this.isHost) this.applyG(msg); }
  localState() { const m = this.me; return { t: 's', p: arr(m.pos), r: +m.yaw.toFixed(3), a: m.avatar.anim }; }
  onState(id, s) { const p = this.players.get(id); if (p) this.pushState(p, s, performance.now()); }
  hostTick() {
    const snap = { t: 'S', players: { [this.net.id]: this.localState() } };
    for (const p of this.players.values()) { if (p.local) continue; const b = p.buffer.at(-1); if (b) snap.players[p.id] = { p: b.p.toArray(), r: b.r, a: b.a }; }
    this.net.broadcast(snap);
  }
  onSnapshot(msg) { const now = performance.now(); for (const [id, s] of Object.entries(msg.players)) { if (id === this.net.id) continue; const p = this.players.get(id); if (p) this.pushState(p, s, now); } }
  pushState(p, s, t) {
    p.buffer.push({ t, p: new THREE.Vector3(...s.p), r: s.r, a: s.a });
    if (p.buffer.length > 20) p.buffer.shift();
    if (p.buffer.length === 1) { p.pos.copy(p.buffer[0].p); p.avatar.group.rotation.y = s.r; }
  }

  // =============================================================== host authority
  hostMsg(from, msg) {
    const p = this.players.get(from);
    switch (msg.k) {
      case 'ready':
        this.readyIds?.add(from);
        if (!this.begun) { if ([...this.players.keys()].every((id) => this.readyIds.has(id))) this.hostBegin(); }
        else if (this.phase === 'practice' && this.players.size >= 2) { this.clearDummies(); this.hostStartMatch(); }
        break;
      case 'fire':
        if (!p?.alive || !(this.phase === 'play' || this.phase === 'practice')) return;
        if (from !== this.net.id) this.applyG({ k: 'fire', id: from, o: msg.o, d: msg.d, s: msg.s });
        this.net.broadcast({ t: 'G', k: 'fire', id: from, o: msg.o, d: msg.d, s: msg.s }, from);
        break;
      case 'hit': this.hostHit(from, msg.target); break;
      case 'pick': this.hostPick(from, msg.card); break;
    }
  }
  hostBegin() {
    if (this.begun) return;
    this.begun = true;
    if (this.players.size >= 2) this.hostStartMatch(); else this.hostPractice();
  }
  hostPractice() {
    this.round = 0;
    const spawns = {}; for (const p of this.players.values()) spawns[p.id] = this.arena.spawns[0].toArray();
    this.bcast({ k: 'phase', phase: 'practice', spawns });
    this.spawnDummies();
  }
  hostStartMatch() {
    this.round = 0;
    this.bcast({ k: 'match', targetWins: this.targetWins });
    this.hostStartRound();
  }
  hostStartRound() {
    this.clearAll();
    const n = this.round + 1;
    const rng = mulberry32(this.seed + n * 7919);
    const pts = this.arena.spawns.slice();
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const spawns = {}; let i = 0;
    for (const p of this.players.values()) spawns[p.id] = pts[i++ % pts.length].toArray();
    this.bcast({ k: 'round', n, spawns });
    this.after(COUNTDOWN * 1000, () => {
      this.bcast({ k: 'phase', phase: 'play' });
      this.roundTimer = this.after(ROUND_TIME * 1000, () => this.hostTimeUp());
    });
  }
  hostHit(shooterId, targetId) {
    if (this.phase !== 'play') return;
    const s = this.players.get(shooterId), t = this.players.get(targetId);
    if (!s?.alive || !t?.alive || shooterId === targetId) return;
    if (t.stats.shield > 0 && !t.shieldUsed) { t.shieldUsed = true; this.bcast({ k: 'shield', id: targetId }); return; }
    const dmg = s.stats.dmg;
    const hp = Math.max(0, t.hp - dmg);
    this.bcast({ k: 'hp', id: targetId, hp, by: shooterId, dmg });
    if (s.stats.lifesteal > 0) this.bcast({ k: 'hp', id: shooterId, hp: Math.min(s.maxHp, Math.round(s.hp + dmg * s.stats.lifesteal)), by: null, dmg: 0 });
    if (hp <= 0) this.hostKill(targetId, shooterId);
  }
  hostKill(id, by) {
    const kills = {}; for (const p of this.players.values()) kills[p.id] = p.kills;
    if (by && by !== id && by in kills) kills[by]++;
    this.bcast({ k: 'death', id, by, kills });
    this.hostCheckRound();
  }
  hostCheckRound() {
    if (this.phase !== 'play') return;
    const alive = [...this.players.values()].filter((p) => p.alive);
    if (alive.length <= 1) this.hostEndRound(alive[0]?.id ?? null, 'last');
  }
  hostTimeUp() {
    if (this.phase !== 'play') return;
    const alive = [...this.players.values()].filter((p) => p.alive).sort((a, b) => b.roundKills - a.roundKills);
    const winner = alive.length && (alive.length === 1 || alive[0].roundKills > alive[1].roundKills) ? alive[0].id : null;
    this.hostEndRound(winner, 'time');
  }
  hostEndRound(winner, reason) {
    if (this.phase !== 'play') return;
    this.clearTimer(this.roundTimer);
    const wins = {}; for (const p of this.players.values()) wins[p.id] = p.wins;
    if (winner && winner in wins) wins[winner]++;
    this.bcast({ k: 'roundend', winner, wins, reason });
    this.after(3500, () => {
      if (winner && (wins[winner] ?? 0) >= this.targetWins) this.hostResults(winner);
      else this.hostCards(winner);
    });
  }
  hostCards(winner) {
    const pickers = [...this.players.values()].filter((p) => p.id !== winner);
    if (!pickers.length) return this.hostStartRound();
    const rng = mulberry32((this.seed ^ ((this.round + 1) * 104729)) >>> 0);
    const offers = {};
    for (const p of pickers) offers[p.id] = dealCards(p.cards, rng);
    this.pending = new Set(pickers.map((p) => p.id));
    this.offers = offers;
    this.bcast({ k: 'cards', pickers: [...this.pending], offers });
    this.cardTimer = this.after(CARD_TIME * 1000, () => { for (const id of [...this.pending]) this.hostPick(id, offers[id][0]); });
  }
  hostPick(id, card) {
    if (this.phase !== 'cards' || !this.pending.has(id)) return;
    const offer = this.offers?.[id] || [];
    if (!offer.includes(card)) card = offer[0];
    if (!card) return;
    this.pending.delete(id);
    const p = this.players.get(id);
    this.bcast({ k: 'loadout', id, cards: [...(p?.cards || []), card] });
    if (this.pending.size === 0) { this.clearTimer(this.cardTimer); this.after(700, () => this.hostStartRound()); }
  }
  hostResults(winner) {
    this.clearAll();
    const wins = {}, kills = {};
    for (const p of this.players.values()) { wins[p.id] = p.wins; kills[p.id] = p.kills; }
    this.bcast({ k: 'results', winner, wins, kills });
  }

  // =============================================================== shared state application
  applyG(msg) {
    const p = msg.id ? this.players.get(msg.id) : null;
    switch (msg.k) {
      case 'phase':
        if (msg.phase === 'practice') {
          this.round = 0;
          this.spawnAll(msg.spawns || {});
          this.setPhase('practice');
          this.msg('Practice', 1800); this.sub('Share the invite link. The match starts when a friend joins.', 6000);
        } else if (msg.phase === 'play') {
          this.setPhase('play');
          this.roundEndsAt = performance.now() + ROUND_TIME * 1000;
          this.msg('FIGHT', 900); this.sfx.go();
        } else this.setPhase(msg.phase);
        break;
      case 'match':
        this.targetWins = msg.targetWins || TARGET_WINS;
        for (const q of this.players.values()) { q.wins = 0; q.kills = 0; q.cards = []; q.stats = computeStats([]); q.maxHp = q.stats.hp; }
        this.round = 0;
        this.hudScores(); this.hudCards();
        break;
      case 'round':
        this.round = msg.n;
        this.spawnAll(msg.spawns);
        this.setPhase('countdown');
        this.hudScores();
        this.msg(`Round ${msg.n}`, 900);
        for (let i = 0; i < COUNTDOWN; i++) this.after(900 + i * 1000 - 300, () => { this.msg(String(COUNTDOWN - i), 800); this.sfx.tick(); });
        break;
      case 'fire':
        if (!p || p.local) return;
        {
          const o = new THREE.Vector3(...msg.o), d = new THREE.Vector3(...msg.d);
          this.spawnShot(p, o, d, msg.s, false);
          if (o.distanceTo(this.me.pos) < 35) this.sfx.shot(p.stats.size);
          p.lastFire = performance.now();
        }
        break;
      case 'hp':
        if (!p) return;
        p.hp = msg.hp;
        if (msg.dmg > 0) {
          p.avatar.flash();
          this.particles.burst(p.pos.clone().add(new THREE.Vector3(0, 1.1, 0)), '#ff5a3d', 8, 4, 0.06, 0.4);
          if (p.local) { this.vignette(); this.sfx.hurt(); }
          else if (msg.by === this.net.id) { this.hitmarker(); this.sfx.hitmarker(); }
        }
        p.avatar.setHp(p.hp / p.maxHp);
        if (p.local) this.hudHp();
        break;
      case 'shield':
        if (!p) return;
        this.particles.ring(p.pos.clone().add(new THREE.Vector3(0, 1, 0)), '#3dd6ff');
        this.sfx.shield();
        if (p.local) this.sub('Shield blocked a hit', 1500);
        break;
      case 'death': {
        if (!p) return;
        p.alive = false; p.hp = 0;
        p.avatar.die();
        if (msg.kills) for (const [id, k] of Object.entries(msg.kills)) { const q = this.players.get(id); if (q) q.kills = k; }
        const by = msg.by ? this.players.get(msg.by) : null;
        if (by && by !== p) by.roundKills++;
        this.feedLine(by ? `<b style="color:${by.avatar.color}">${esc(by.profile.name)}</b> ⟶ <b style="color:${p.avatar.color}">${esc(p.profile.name)}</b>` : `<b style="color:${p.avatar.color}">${esc(p.profile.name)}</b> fell`);
        this.particles.burst(p.pos.clone().add(new THREE.Vector3(0, 1, 0)), p.avatar.color, 26, 7, 0.09, 0.8);
        if (p.local) { this.sfx.death(); this.msg('You died', 1600); this.sub('Click to switch who you watch', 3000); this.specIdx = 0; this.unlockMouseKeepLook(); }
        else if (by === this.me) { this.sfx.kill(); this.msg('KILL', 600); }
        this.hudScores();
        break;
      }
      case 'roundend': {
        this.setPhase('roundend');
        for (const [id, w] of Object.entries(msg.wins)) { const q = this.players.get(id); if (q) q.wins = w; }
        const w = msg.winner ? this.players.get(msg.winner) : null;
        this.msg(w ? `${w.profile.name} wins the round` : 'Draw', 3200, w ? w.avatar.color : '#fff');
        if (msg.reason === 'time') this.sub('Time!', 2000);
        if (w === this.me) this.sfx.win();
        this.hudScores();
        break;
      }
      case 'cards':
        this.setPhase('cards');
        this.offers = msg.offers; this.pending = new Set(msg.pickers);
        if (msg.offers[this.net.id]) this.showPicker(msg.offers[this.net.id]); else this.showWaiting();
        break;
      case 'loadout': {
        if (!p) return;
        const added = msg.cards[msg.cards.length - 1];
        p.cards = msg.cards; p.stats = computeStats(p.cards); p.maxHp = p.stats.hp;
        this.pending.delete(p.id);
        if (p.local) { this.hidePicker(); this.hudCards(); this.sfx.pick(); }
        else if (added) this.feedLine(`<b style="color:${p.avatar.color}">${esc(p.profile.name)}</b> took ${CARD_BY_ID[added]?.icon || ''} ${esc(CARD_BY_ID[added]?.name || added)}`);
        this.showWaiting();
        break;
      }
      case 'results': {
        this.setPhase('results');
        for (const [id, w] of Object.entries(msg.wins)) { const q = this.players.get(id); if (q) { q.wins = w; q.kills = msg.kills[id] ?? q.kills; } }
        this.showResults(msg.winner);
        if (msg.winner === this.net.id) this.sfx.win();
        break;
      }
      case 'rematch': this.onExit('rematch', msg.seed); break;
      case 'lobby': this.onExit('lobby'); break;
    }
  }
  setPhase(ph) {
    this.phase = ph;
    this.hud.dataset.phase = ph;
    if (ph !== 'cards') { this.hidePicker(); $('gwait').style.display = 'none'; }
    if (ph !== 'results') $('gresults').style.display = 'none';
    this.hudRound();
    this.hudLock();
  }
  spawnAll(spawns) {
    this.bullets.clear(); this.particles.clear();
    for (const p of this.players.values()) {
      const s = spawns[p.id];
      if (!s) { p.alive = false; p.avatar.group.visible = false; continue; }
      p.alive = true; p.stats = computeStats(p.cards); p.maxHp = p.stats.hp; p.hp = p.maxHp; p.shieldUsed = false; p.roundKills = 0;
      p.avatar.group.visible = true; p.avatar.revive(); p.avatar.setHp(1);
      p.pos.set(s[0], s[1], s[2]); p.vel.set(0, 0, 0); p.buffer.length = 0;
      const yaw = Math.atan2(-s[0], -s[2]);
      p.yaw = yaw; p.avatar.group.rotation.y = yaw;
      if (p.local) { p.ammo = p.stats.ammo; p.reloadT = 0; p.dashT = 0; p.dashCd = 0; p.pitch = 0.05; this.hudHp(); this.hudAmmo(); }
    }
    $('gfeed').innerHTML = '';
  }

  // =============================================================== shooting
  spawnShot(p, origin, dir, seed, local) {
    const rng = mulberry32(seed >>> 0);
    const s = p.stats;
    for (let i = 0; i < s.bullets; i++) {
      const d = dir.clone();
      if (s.spread > 0) {
        const right = new THREE.Vector3().crossVectors(d, UP).normalize();
        d.applyAxisAngle(UP, (rng() * 2 - 1) * s.spread).applyAxisAngle(right, (rng() * 2 - 1) * s.spread).normalize();
      }
      this.bullets.spawn({ owner: p.id, origin, dir: d, speed: s.bulletSpeed, size: s.size, bounces: s.bounces, life: s.bulletLife, color: p.avatar.color, local });
    }
    if (!p.local) { this.flash.position.copy(origin); this.flash.intensity = 4; }
  }
  lookDir(yaw = this.me.yaw, pitch = this.me.pitch) { return new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)); }
  aimRay() {
    const me = this.me;
    const look = this.lookDir();
    const camPos = this.camera.position;
    let t = 120;
    const hit = this.arena.raycast(camPos, look, t, 0);
    if (hit) t = hit.t;
    for (const q of this.players.values()) {
      if (q === me || !q.alive) continue;
      const box = { min: { x: q.pos.x - R, y: q.pos.y, z: q.pos.z - R }, max: { x: q.pos.x + R, y: q.pos.y + H, z: q.pos.z + R } };
      const h = slab(camPos, look, box, 0, t);
      if (h) t = h.t;
    }
    const aim = camPos.clone().addScaledVector(look, t);
    const right = new THREE.Vector3(-Math.cos(me.yaw), 0, Math.sin(me.yaw));
    const fwd = new THREE.Vector3(Math.sin(me.yaw), 0, Math.cos(me.yaw));
    const origin = me.pos.clone().add(new THREE.Vector3(0, 1.32, 0)).addScaledVector(right, 0.28).addScaledVector(fwd, 0.45);
    const dir = aim.sub(origin);
    if (dir.lengthSq() < 0.25 || dir.clone().normalize().dot(look) < 0.3) dir.copy(look);
    return { origin, dir: dir.normalize() };
  }
  tryFire(now) {
    const me = this.me;
    if (!me.alive || !(this.phase === 'play' || this.phase === 'practice')) return;
    if (me.reloadT > 0 || now < me.nextShot) return;
    if (me.ammo <= 0) { this.startReload(); return; }
    me.ammo--; me.nextShot = now + me.stats.fireRate * 1000; me.lastFire = now;
    const seed = (Math.random() * 4294967295) >>> 0;
    const { origin, dir } = this.aimRay();
    this.spawnShot(me, origin, dir, seed, true);
    this.sendG({ k: 'fire', o: arr(origin), d: arr(dir), s: seed });
    this.flash.position.copy(origin); this.flash.intensity = 9;
    this.sfx.shot(me.stats.size);
    me.pitch = Math.min(1.1, me.pitch + 0.012);
    this.hudAmmo();
    if (me.ammo === 0) this.startReload();
  }
  startReload() { const me = this.me; if (me.reloadT > 0 || me.ammo >= me.stats.ammo) return; me.reloadT = me.stats.reload; this.sfx.reload(); this.hudAmmo(); }
  targetsForMe() {
    const t = [];
    for (const q of this.players.values()) if (q !== this.me && q.alive) t.push({ id: q.id, pos: q.pos, r: R + 0.05, h: H });
    for (const d of this.dummies) if (d.alive) t.push({ id: d.id, pos: d.avatar.group.position, r: R + 0.05, h: H, dummy: d });
    return t;
  }
  onLocalHit(bullet, targetId, point) {
    this.particles.burst(point, bullet.color, 6, 3, 0.05, 0.3);
    const d = this.dummies.find((x) => x.id === targetId);
    if (d) { this.dummyHit(d); return; }
    this.sendG({ k: 'hit', target: targetId });
  }
  onImpact(point, normal, bullet, bounced) {
    this.particles.burst(point, bullet.color, bounced ? 4 : 7, bounced ? 2.5 : 4, 0.05, 0.35, normal);
    if (bounced && point.distanceTo(this.me.pos) < 25) this.sfx.bounce();
  }

  // =============================================================== practice dummies (host alone)
  spawnDummies() {
    this.clearDummies();
    const chars = this.manifest.characters;
    const spots = [[6, -5], [-7, 4], [0, 9]];
    spots.forEach(([x, z], i) => {
      const info = chars[(this.seed + i * 5) % chars.length];
      const prof = { name: ['Target', 'Dummy', 'Punching Bag'][i], color: TEAM_COLORS[(i + 3) % TEAM_COLORS.length].id, characterId: info.id, colors: {} };
      const avatar = new ShooterAvatar(this.scene, this.manifest, prof);
      avatar.group.position.set(x, 0, z);
      const d = { id: 'dummy' + i, avatar, hp: 100, alive: true, home: new THREE.Vector3(x, 0, z) };
      this.dummies.push(d);
    });
  }
  clearDummies() { for (const d of this.dummies) d.avatar.dispose(); this.dummies.length = 0; }
  dummyHit(d) {
    if (!d.alive) return;
    d.hp -= this.me.stats.dmg; d.avatar.flash(); d.avatar.setHp(Math.max(0, d.hp) / 100); this.hitmarker(); this.sfx.hitmarker();
    if (d.hp <= 0) {
      d.alive = false; d.avatar.die(); this.sfx.kill(); this.msg('KILL', 500);
      this.particles.burst(d.avatar.group.position.clone().add(new THREE.Vector3(0, 1, 0)), d.avatar.color, 24, 7, 0.09, 0.8);
      this.after(2500, () => { if (!this.dummies.includes(d)) return; d.hp = 100; d.alive = true; d.avatar.revive(); d.avatar.setHp(1); d.avatar.group.position.copy(d.home).add(new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4)); });
    }
  }

  // =============================================================== input
  setupInput() {
    const i = this.input;
    this.onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); if (!i.keys.has('Space')) i.jump = true; }
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !i.keys.has(e.code)) i.dash = true;
      if (e.code === 'KeyR') i.reload = true;
      i.keys.add(e.code);
    };
    this.onKeyUp = (e) => i.keys.delete(e.code);
    this.onBlur = () => { i.keys.clear(); i.down = false; };
    this.onMouseMove = (e) => { if (i.locked) { i.dx += e.movementX; i.dy += e.movementY; } else if (i.drag) { i.dx += e.movementX; i.dy += e.movementY; i.dragMoved = (i.dragMoved || 0) + Math.abs(e.movementX) + Math.abs(e.movementY); } };
    this.onMouseDown = (e) => {
      if (e.button !== 0) return;
      const onOverlay = e.target.id === 'glock' || (e.target.closest?.('#glock .box') && !['INPUT', 'BUTTON'].includes(e.target.tagName));
      if (e.target !== this.canvas && !onOverlay) return;
      if (!i.locked) { if (!this.lockFailed) this.lock(); i.drag = true; i.dragMoved = 0; return; }
      if (this.me.alive) i.down = true; else this.cycleSpectate();
    };
    this.onMouseUp = (e) => {
      // Fallback (no pointer lock): a click without dragging fires once.
      if (i.drag && this.lockFailed && (i.dragMoved || 0) < 4 && e.target === this.canvas) { if (this.me.alive) this.tryFire(performance.now()); else this.cycleSpectate(); }
      i.down = false; i.drag = false;
    };
    this.onLockChange = () => { i.locked = document.pointerLockElement === this.canvas; i.down = false; this.hudLock(); };
    this.onLockError = () => { i.locked = false; this.lockFailed = true; this.hudLock(); };
    window.addEventListener('keydown', this.onKeyDown); window.addEventListener('keyup', this.onKeyUp); window.addEventListener('blur', this.onBlur);
    window.addEventListener('mousemove', this.onMouseMove); window.addEventListener('mousedown', this.onMouseDown); window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onLockChange); document.addEventListener('pointerlockerror', this.onLockError);
    this.hudLock();
  }
  lock() {
    this.sfx.unlock();
    const plain = () => { try { const r = this.canvas.requestPointerLock(); r?.catch?.(() => { this.lockFailed = true; this.hudLock(); }); } catch { this.lockFailed = true; this.hudLock(); } };
    try {
      const r = this.canvas.requestPointerLock({ unadjustedMovement: true });
      if (r?.catch) r.catch(plain); else if (!r) plain();
    } catch { plain(); }
  }
  unlockMouseKeepLook() { /* keep pointer lock while dead so spectating feels continuous */ }
  cycleSpectate() { this.specIdx++; }
  spectateTarget() {
    const alive = [...this.players.values()].filter((p) => p.alive && !p.local);
    if (!alive.length) return null;
    return alive[this.specIdx % alive.length];
  }

  // =============================================================== update
  update(dt, now) {
    this.time += dt;
    const me = this.me, i = this.input;
    // mouse look
    if (i.dx || i.dy) {
      const k = 0.0022 * this.sens;
      me.yaw -= i.dx * k; me.pitch = THREE.MathUtils.clamp(me.pitch - i.dy * k, -1.05, 1.15);
      i.dx = 0; i.dy = 0;
    }
    if (me.alive) {
      // physics in fixed sub-steps so fast dashes never tunnel through thin walls
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let s = 0; s < steps; s++) this.stepLocal(h);
      if (i.reload) { i.reload = false; this.startReload(); }
      if (me.reloadT > 0) { me.reloadT -= dt; if (me.reloadT <= 0) { me.reloadT = 0; me.ammo = me.stats.ammo; this.hudAmmo(); } }
      if (i.down) this.tryFire(now);
      me.avatar.group.rotation.y = me.yaw;
      me.avatar.locomotion(me.vel, me.yaw, { firing: now - me.lastFire < 350, grounded: me.grounded });
    } else { i.jump = false; i.dash = false; }
    // remotes
    for (const p of this.players.values()) {
      p.avatar.update(dt);
      if (p.local) continue;
      this.interpolate(p, now);
    }
    for (const d of this.dummies) {
      d.avatar.update(dt);
      if (d.alive) { d.avatar.group.rotation.y = Math.atan2(me.pos.x - d.avatar.group.position.x, me.pos.z - d.avatar.group.position.z); }
    }
    // bullets, particles, lights
    this.bullets.update(dt, me.alive ? this.targetsForMe() : null, (b, id, pt) => this.onLocalHit(b, id, pt), (pt, n, b, bounced) => this.onImpact(pt, n, b, bounced));
    this.particles.update(dt);
    this.flash.intensity = Math.max(0, this.flash.intensity - dt * 60);
    for (const a of this.arena.animated) a.update(dt, this.time);
    this.updateCamera(dt);
    this.hudTick(now);
  }
  stepLocal(h) {
    const me = this.me, i = this.input, s = me.stats, k = i.keys;
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const r = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const fwd = new THREE.Vector3(Math.sin(me.yaw), 0, Math.cos(me.yaw));
    const right = new THREE.Vector3(-Math.cos(me.yaw), 0, Math.sin(me.yaw));
    const wish = new THREE.Vector3().addScaledVector(fwd, f).addScaledVector(right, r);
    if (wish.lengthSq() > 0) wish.normalize();
    me.dashCd = Math.max(0, me.dashCd - h);
    if (i.dash) {
      i.dash = false;
      if (me.dashCd <= 0 && (this.phase === 'play' || this.phase === 'practice' || this.phase === 'countdown')) {
        const dir = wish.lengthSq() > 0 ? wish : fwd;
        me.vel.x = dir.x * DASH_V * s.dashPower; me.vel.z = dir.z * DASH_V * s.dashPower;
        if (me.vel.y < 0) me.vel.y = 0;
        me.dashT = DASH_T; me.dashCd = s.dashCd;
        me.avatar.oneShot('Roll'); this.sfx.dash();
        this.particles.burst(me.pos.clone().add(new THREE.Vector3(0, 0.3, 0)), '#ffffff', 10, 3, 0.05, 0.3, null, 4);
      }
    }
    if (me.dashT > 0) me.dashT -= h;
    else {
      const accel = (me.grounded ? 40 : 12) * h;
      const tx = wish.x * s.speed, tz = wish.z * s.speed;
      me.vel.x += THREE.MathUtils.clamp(tx - me.vel.x, -accel, accel);
      me.vel.z += THREE.MathUtils.clamp(tz - me.vel.z, -accel, accel);
    }
    if (i.jump) { i.jump = false; if (me.grounded) { me.vel.y = JUMP_V * Math.sqrt(s.jump); me.grounded = false; } }
    me.vel.y = Math.max(-30, me.vel.y - GRAV * s.gravity * h);
    me.pos.x += me.vel.x * h; this.resolveAxis(me, 'x');
    me.pos.y += me.vel.y * h; me.grounded = false; this.resolveAxis(me, 'y');
    me.pos.z += me.vel.z * h; this.resolveAxis(me, 'z');
    if (me.pos.y < -20) { me.pos.set(0, 0.5, 0); me.vel.set(0, 0, 0); }
  }
  overlaps(p, s, eps = 1e-4) {
    return p.pos.x + R > s.min.x + eps && p.pos.x - R < s.max.x - eps && p.pos.y + H > s.min.y + eps && p.pos.y < s.max.y - eps && p.pos.z + R > s.min.z + eps && p.pos.z - R < s.max.z - eps;
  }
  resolveAxis(p, ax) {
    for (const s of this.arena.solids) {
      if (!this.overlaps(p, s)) continue;
      if (ax === 'y') {
        if (p.vel.y <= 0 && p.pos.y + H / 2 > s.max.y - H / 2) { p.pos.y = s.max.y; p.vel.y = 0; p.grounded = true; }
        else { p.pos.y = s.min.y - H; p.vel.y = Math.min(0, p.vel.y); }
        continue;
      }
      // try to step up onto low ledges first
      const rise = s.max.y - p.pos.y;
      if (p.grounded && rise > 0 && rise <= STEP) {
        const oldY = p.pos.y; p.pos.y = s.max.y + 0.001;
        if (!this.arena.solids.some((o) => o !== s && this.overlaps(p, o))) continue;
        p.pos.y = oldY;
      }
      if (ax === 'x') { if (p.vel.x > 0) p.pos.x = s.min.x - R; else if (p.vel.x < 0) p.pos.x = s.max.x + R; else p.pos.x = (p.pos.x < (s.min.x + s.max.x) / 2) ? s.min.x - R : s.max.x + R; p.vel.x = 0; }
      else { if (p.vel.z > 0) p.pos.z = s.min.z - R; else if (p.vel.z < 0) p.pos.z = s.max.z + R; else p.pos.z = (p.pos.z < (s.min.z + s.max.z) / 2) ? s.min.z - R : s.max.z + R; p.vel.z = 0; }
    }
  }
  interpolate(p, now) {
    const b = p.buffer;
    if (!b.length) return;
    const rt = now - INTERP;
    let i = b.length - 1;
    while (i > 0 && b[i - 1].t > rt) i--;
    const a = b[Math.max(0, i - 1)], c = b[i];
    const span = Math.max(1, c.t - a.t);
    const k = THREE.MathUtils.clamp((rt - a.t) / span, 0, 1);
    p.pos.lerpVectors(a.p, c.p, k);
    let d = c.r - a.r; d = Math.atan2(Math.sin(d), Math.cos(d));
    p.yaw = a.r + d * k;
    p.avatar.group.rotation.y = p.yaw;
    if (p.alive && c.a && c.a !== p.avatar.anim && p.avatar.lockUntil <= now) {
      if (c.a === 'Roll') p.avatar.oneShot('Roll'); else p.avatar.setAnim(c.a);
    }
  }
  updateCamera(dt) {
    const me = this.me;
    let pivot, dist, shoulder;
    if (me.alive) { pivot = me.pos.clone().add(new THREE.Vector3(0, 1.65, 0)); dist = 4.3; shoulder = 0.8; }
    else {
      const t = this.spectateTarget();
      if (t) { pivot = t.pos.clone().add(new THREE.Vector3(0, 1.5, 0)); dist = 4.5; shoulder = 0; }
      else { pivot = new THREE.Vector3(0, 3, 0); dist = 24; shoulder = 0; if (me.pitch < 0.35) me.pitch = 0.35; }
    }
    const look = this.lookDir();
    const right = new THREE.Vector3(-Math.cos(me.yaw), 0, Math.sin(me.yaw));
    const from = pivot.clone().addScaledVector(right, shoulder);
    const back = look.clone().negate();
    let d = dist;
    const hit = this.arena.raycast(from, back, dist + 0.3, 0.22);
    if (hit) d = Math.max(0.5, hit.t - 0.3);
    const desired = from.clone().addScaledVector(back, d);
    if (me.alive) this.camera.position.copy(desired); else this.camera.position.lerp(desired, Math.min(1, dt * 8));
    this.camera.lookAt(from.clone().addScaledVector(look, 10));
    // keep the local body from blocking the view when the camera is pulled in close
    me.avatar.group.visible = me.alive ? d > 1.1 : me.avatar.group.visible;
  }

  // =============================================================== HUD
  buildHud() {
    this.hud = $('ghud');
    this.hud.style.display = 'block';
    $('gsens').value = this.sens;
    $('gsens').oninput = () => { this.sens = +$('gsens').value; localStorage.setItem('rqr.sens', String(this.sens)); };
    for (const b of ['gback', 'gback2']) { $(b).style.display = this.isHost ? '' : 'none'; $(b).onclick = () => { if (this.isHost) this.bcast({ k: 'lobby' }); }; }
    for (const b of ['gquit', 'gquit2']) { $(b).style.display = this.isHost ? 'none' : ''; $(b).onclick = () => { this.net.destroy(); location.href = 'index.html'; }; }
    $('grematch').onclick = () => { if (this.isHost) this.bcast({ k: 'rematch', seed: (Math.random() * 4294967295) >>> 0 }); };
    $('globby').onclick = () => { if (this.isHost) this.bcast({ k: 'lobby' }); };
    $('gresbtns').style.display = this.isHost ? 'flex' : 'none';
    $('greswait').style.display = this.isHost ? 'none' : '';
    $('gmsg').textContent = ''; $('gsub').textContent = ''; $('gfeed').innerHTML = '';
    this.hudHp(); this.hudAmmo(); this.hudCards(); this.hudScores(); this.hudRound();
  }
  hudLock() {
    const locked = this.input.locked;
    const busy = this.phase === 'cards' || this.phase === 'results';
    $('glock').style.display = locked || busy || this.lockFailed ? 'none' : 'grid';
    $('gtopbtns').style.display = this.lockFailed ? 'flex' : 'none';
    $('glocktitle').textContent = this.lockFailed ? 'Click and drag to aim' : 'Click to aim';
    $('xhair').style.display = locked || this.lockFailed ? 'block' : 'none';
  }
  hudHp() { const me = this.me; const f = Math.max(0, me.hp / me.maxHp); $('ghpbar').style.width = `${f * 100}%`; $('ghpbar').style.background = f > 0.5 ? '#6fe36a' : f > 0.25 ? '#ffd23d' : '#ff4d4d'; $('ghpv').textContent = `${Math.max(0, Math.round(me.hp))} / ${me.maxHp}`; }
  hudAmmo() {
    const me = this.me; const n = me.stats.ammo;
    $('gammo').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < me.ammo ? 'on' : ''}"></i>`).join('') + (me.reloadT > 0 ? '<span>reloading…</span>' : '');
  }
  hudCards() { $('gcards').innerHTML = this.me.cards.map((c) => `<span title="${esc(CARD_BY_ID[c]?.desc || '')}">${CARD_BY_ID[c]?.icon || ''} ${esc(CARD_BY_ID[c]?.name || c)}</span>`).join(''); }
  hudScores() {
    const rows = [...this.players.values()].sort((a, b) => b.wins - a.wins || b.kills - a.kills);
    $('gscores').innerHTML = rows.map((p) => `<div class="gs ${p.alive ? '' : 'dead'} ${p.local ? 'me' : ''}"><span class="dot" style="background:${p.avatar.color}"></span><span class="n">${esc(p.profile.name)}</span><span class="w">${'★'.repeat(p.wins)}${'☆'.repeat(Math.max(0, this.targetWins - p.wins))}</span><span class="k">${p.kills}</span></div>`).join('');
  }
  hudRound() {
    const ph = this.phase;
    $('groundtext').textContent = ph === 'practice' ? 'Practice' : ph === 'waiting' ? 'Waiting…' : ph === 'results' ? 'Match over' : `Round ${this.round} · first to ${this.targetWins}`;
    $('gtimer').textContent = '';
  }
  hudTick(now) {
    if (this.phase === 'play' && this.roundEndsAt) { const s = Math.max(0, Math.ceil((this.roundEndsAt - now) / 1000)); $('gtimer').textContent = `${s}s`; }
    if (this.me.reloadT > 0) { const f = 1 - this.me.reloadT / this.me.stats.reload; $('greload').style.width = `${f * 100}%`; $('greload').parentElement.style.opacity = 1; }
    else $('greload').parentElement.style.opacity = 0;
    if (this.me.dashCd > 0) { $('gdash').style.width = `${(1 - this.me.dashCd / this.me.stats.dashCd) * 100}%`; } else $('gdash').style.width = '100%';
    if (this.phase === 'cards' && this.cardsEndAt) { const s = Math.max(0, Math.ceil((this.cardsEndAt - now) / 1000)); $('gpicktime').textContent = `Auto-pick in ${s}s`; }
  }
  msg(text, ms = 1500, color = '#fff') {
    const el = $('gmsg'); el.textContent = text; el.style.color = color; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(this._msgT); if (ms) this._msgT = setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, ms);
  }
  sub(text, ms = 2000) { const el = $('gsub'); el.textContent = text; clearTimeout(this._subT); if (ms) this._subT = setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, ms); }
  feedLine(html) { const el = document.createElement('div'); el.innerHTML = html; $('gfeed').prepend(el); setTimeout(() => el.remove(), 6000); while ($('gfeed').children.length > 6) $('gfeed').lastChild.remove(); }
  vignette() { const v = $('gvig'); v.style.animation = 'none'; void v.offsetWidth; v.style.animation = 'gvig .45s ease-out'; }
  hitmarker() { const m = $('gmark'); m.style.animation = 'none'; void m.offsetWidth; m.style.animation = 'gmark .25s ease-out'; }
  showPicker(options) {
    this.cardsEndAt = performance.now() + CARD_TIME * 1000;
    $('gpick').style.display = 'grid';
    $('gpickcards').innerHTML = options.map((id) => { const c = CARD_BY_ID[id]; return `<button class="gcard" data-id="${id}"><div class="ic">${c.icon}</div><div class="nm">${esc(c.name)}</div><div class="ds">${esc(c.desc)}</div></button>`; }).join('');
    $('gpickcards').onclick = (e) => { const b = e.target.closest('.gcard'); if (!b) return; this.sendG({ k: 'pick', card: b.dataset.id }); $('gpickcards').innerHTML = '<p>Locked in. Waiting for the others…</p>'; this.lock(); };
    if (this.input.locked) document.exitPointerLock();
  }
  hidePicker() { $('gpick').style.display = 'none'; }
  showWaiting() {
    const names = [...this.pending].map((id) => this.players.get(id)?.profile.name).filter(Boolean);
    const el = $('gwait');
    if (this.phase !== 'cards' || !names.length) { el.style.display = 'none'; return; }
    el.style.display = 'block'; el.querySelector('span').textContent = names.join(', ');
  }
  showResults(winnerId) {
    const w = this.players.get(winnerId);
    $('greswin').textContent = w ? `${w.profile.name} wins the match!` : 'Match over';
    $('greswin').style.color = w ? w.avatar.color : '#fff';
    const rows = [...this.players.values()].sort((a, b) => b.wins - a.wins || b.kills - a.kills);
    $('grestable').innerHTML = rows.map((p, i) => `<div class="rr"><span class="pl">${i + 1}</span><span class="dot" style="background:${p.avatar.color}"></span><span class="n">${esc(p.profile.name)}</span><span class="w">${p.wins} rounds</span><span class="k">${p.kills} kills</span><span class="c">${p.cards.map((c) => CARD_BY_ID[c]?.icon || '').join(' ')}</span></div>`).join('');
    $('gresults').style.display = 'grid';
    if (this.input.locked) document.exitPointerLock();
  }

  // =============================================================== timers / teardown
  after(ms, fn) { const t = setTimeout(() => { this.timers.delete(t); fn(); }, ms); this.timers.add(t); return t; }
  clearTimer(t) { if (t) { clearTimeout(t); this.timers.delete(t); } }
  clearAll() { for (const t of this.timers) clearTimeout(t); this.timers.clear(); }
  dispose() {
    this.clearAll();
    clearTimeout(this._msgT); clearTimeout(this._subT);
    window.removeEventListener('keydown', this.onKeyDown); window.removeEventListener('keyup', this.onKeyUp); window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousemove', this.onMouseMove); window.removeEventListener('mousedown', this.onMouseDown); window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.onLockChange); document.removeEventListener('pointerlockerror', this.onLockError);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    for (const p of this.players.values()) p.avatar.dispose();
    this.clearDummies();
    this.hud.style.display = 'none';
    $('gpick').style.display = 'none'; $('gresults').style.display = 'none'; $('gwait').style.display = 'none';
  }
}
