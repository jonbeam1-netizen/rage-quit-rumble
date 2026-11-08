// PeerJS networking for the lobby. The host's browser is the server: clients send their own
// state 20x a second, the host rebroadcasts everyone's state. Room code = 4 letters.
/* global Peer */

const PREFIX = 'rqr-v1-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const makeCode = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

export class Net {
  constructor() {
    this.isHost = false;
    this.code = null;
    this.id = null;              // our player id (peer id)
    this.peer = null;
    this.conns = new Map();      // host: peerId -> DataConnection ; client: 'host' -> conn
    this.handlers = {};
    this.lagMs = 0;              // lag simulator (applied to incoming messages)
    this.ping = 0;
    this.pings = new Map();      // host: id -> ping
    this.maxPlayers = 8;
  }
  on(type, fn) { this.handlers[type] = fn; return this; }
  emit(type, ...a) { this.handlers[type]?.(...a); }

  // ---- host -------------------------------------------------------------------
  host(code = makeCode()) {
    return new Promise((resolve, reject) => {
      const peer = new Peer(PREFIX + code, { debug: 0 });
      peer.on('open', (id) => {
        this.peer = peer; this.isHost = true; this.code = code; this.id = id;
        peer.on('connection', (conn) => this._accept(conn));
        peer.on('error', (e) => this.emit('error', e));
        resolve(code);
      });
      peer.on('error', (e) => {
        if (e.type === 'unavailable-id') { peer.destroy(); this.host(makeCode()).then(resolve, reject); }
        else reject(e);
      });
    });
  }
  _accept(conn) {
    conn.on('open', () => {
      if (this.conns.size >= this.maxPlayers - 1) { conn.send({ t: 'full' }); setTimeout(() => conn.close(), 200); return; }
      this.conns.set(conn.peer, conn);
      conn.on('data', (msg) => this._delay(() => this._hostRecv(conn.peer, msg)));
      conn.on('close', () => { this.conns.delete(conn.peer); this.pings.delete(conn.peer); this.emit('leave', conn.peer); this.broadcast({ t: 'leave', id: conn.peer }); });
      conn.on('error', () => {});
    });
  }
  _hostRecv(id, msg) {
    switch (msg.t) {
      case 'hello': this.emit('join', id, msg.profile); break;
      case 's': this.emit('state', id, msg); break;
      case 'e': this.emit('emote', id, msg.e); this.broadcast({ t: 'E', id, e: msg.e }, id); break;
      case 'p': this.conns.get(id)?.send({ t: 'P', ts: msg.ts }); break;
      case 'pingreport': this.pings.set(id, msg.ping); break;
    }
  }
  broadcast(msg, exceptId = null) {
    for (const [id, c] of this.conns) if (id !== exceptId && c.open) c.send(msg);
  }
  sendTo(id, msg) { const c = this.conns.get(id); if (c?.open) c.send(msg); }

  // ---- client -----------------------------------------------------------------
  join(code, profile) {
    return new Promise((resolve, reject) => {
      const peer = new Peer({ debug: 0 });
      const timer = setTimeout(() => reject(new Error('Could not reach the host. Check the code.')), 12000);
      peer.on('open', (id) => {
        this.peer = peer; this.id = id; this.code = code.toUpperCase();
        const conn = peer.connect(PREFIX + this.code, { reliable: true, serialization: 'json' });
        conn.on('open', () => {
          this.conns.set('host', conn);
          conn.send({ t: 'hello', profile });
          conn.on('data', (msg) => this._delay(() => this._clientRecv(msg, resolve)));
          conn.on('close', () => this.emit('disconnected'));
          this._pingTimer = setInterval(() => conn.open && conn.send({ t: 'p', ts: performance.now() }), 1000);
        });
        conn.on('error', (e) => { clearTimeout(timer); reject(e); });
      });
      peer.on('error', (e) => { clearTimeout(timer); reject(e.type === 'peer-unavailable' ? new Error('No room with that code.') : e); });
      this._welcomeTimer = timer;
    });
  }
  _clientRecv(msg, resolve) {
    switch (msg.t) {
      case 'welcome': clearTimeout(this._welcomeTimer); this.emit('welcome', msg); resolve?.(msg); break;
      case 'full': this.emit('error', new Error('Room is full (8 players).')); break;
      case 'join': this.emit('join', msg.player.id, msg.player.profile, msg.player); break;
      case 'leave': this.emit('leave', msg.id); break;
      case 'S': this.emit('snapshot', msg); break;
      case 'E': this.emit('emote', msg.id, msg.e); break;
      case 'P': this.ping = Math.round(performance.now() - msg.ts); this.conns.get('host')?.send({ t: 'pingreport', ping: this.ping }); break;
      case 'toast': this.emit('toast', msg.text); break;
      default: this.emit('message', msg);
    }
  }
  send(msg) { const c = this.conns.get('host'); if (c?.open) c.send(msg); }

  _delay(fn) { if (this.lagMs > 0) setTimeout(fn, this.lagMs + Math.random() * this.lagMs * 0.3); else fn(); }

  destroy() { clearInterval(this._pingTimer); this.peer?.destroy(); }
}
