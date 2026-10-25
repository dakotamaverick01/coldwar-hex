/* ============================================================
   16. GAME LAYER (Phase B1): terrain per hex, 11 units, tap to select, reachable hexes, move, 2 action points,
       End turn with a 3-minute clock. No enemy, no shooting yet.
   Hex maths comes from tools/hex.js (inlined by the assemble script as HX.*).
   ============================================================ */
const HXK = HX.hexKey;

/* ---- terrain class per hex, worked out live from the same data the picture is drawn from ---- */
const TERR = new Map();
{
  const hexes = HX.boardHexes();
  const riverHex = new Set(), roadHex = new Set(), bridgeHex = new Set();
  const mark = (set, x, z) => { const h = HX.pointToHex(x, z); set.add(HXK(h.r, h.c)); };
  for (let x = RIV[0][0]; x <= RIV[RIV.length - 1][0]; x += 0.4) mark(riverHex, x, riverZ(x));
  for (const line of [roadA, roadB]) for (const [x, z] of line) mark(roadHex, x, z);
  for (const [x, z] of roadA) if (riverDist(x, z) < 2.4) mark(bridgeHex, x, z);
  const villageHex = new Set();
  for (const l of lots) mark(villageHex, l.x, l.z);
  const ring = [[0, 0]]; for (let k = 0; k < 6; k++) ring.push([Math.cos(k * 1.0472) * 3.6, Math.sin(k * 1.0472) * 3.6]);
  for (const h of hexes) {
    const key = HXK(h.r, h.c);
    let f = 0, y = 0; for (const [dx, dz] of ring) { f += forestAmount(h.x + dx, h.z + dz); y += height(h.x + dx, h.z + dz); }
    f /= ring.length;
    const t = { r: h.r, c: h.c, x: h.x, z: h.z, y: height(h.x, h.z), forest: f, river: riverHex.has(key), bridge: bridgeHex.has(key), road: roadHex.has(key), village: villageHex.has(key) };
    t.woods = f > 0.22 && !t.village;
    t.kind = t.river && !t.bridge ? 'river' : t.bridge ? 'bridge' : t.village ? 'village' : t.road ? 'road' : t.woods ? 'woods' : 'open';
    TERR.set(key, t);
  }
}
const terrAt = (r, c) => TERR.get(HXK(r, c));

/* ---- unit kinds (movement per the locked table: fast 3 off road / 5 road, slower 2 / 4; woods and village 1 per AP) ---- */
const KINDS = {
  CMD: { label: 'Command vehicle', short: 'CMD', fast: false, body: 'm113', hp: 3 },
  M1:  { label: 'M1 Abrams tank', short: 'M1', fast: true, body: 'tank', hp: 3 },
  M60: { label: 'M60A3 tank', short: 'M60', fast: false, body: 'tank', hp: 3 },
  M3:  { label: 'M3 Bradley scout vehicle', short: 'M3', fast: true, body: 'bradley', hp: 3 },
  ITV: { label: 'M901 ITV (TOW)', short: 'ITV', fast: false, body: 'itv', hp: 3 },
  ENG: { label: 'Engineer squad (M113)', short: 'ENG', fast: false, body: 'm113', hp: 3 },
};
const ROSTER = [
  ['CMD', 'Black 6', 'Capt. Dunn'], ['M1', 'Red 1', 'SSG Miller'], ['M60', 'Red 2', 'SSG Reyes'], ['M60', 'Red 3', 'SGT Okafor'],
  ['M3', 'White 1', 'SGT Nowak'], ['M3', 'White 2', 'SGT Brandt'], ['M3', 'White 3', 'SGT Tran'],
  ['ITV', 'Blue 1', 'SGT Hayes'], ['ITV', 'Blue 2', 'SGT Pike'], ['ENG', 'Sapper 1', 'SSG Alvarez'],
];
const AP_MAX = 2;
const rate = (u, road) => (u.kind.fast ? (road ? 5 : 3) : (road ? 4 : 2));    // hexes per action point
function stepCost(u, from, to) {
  if (!to || (to.kind === 'river')) return Infinity;
  if (to.woods || to.village) return 1;
  return 1 / rate(u, to.road && from.road);
}

/* ---- code-made models (about 4x real size so they read from the tabletop camera), facing +x ---- */
const UM = {
  hull: patch(new THREE.MeshStandardMaterial({ color: 0x59603f, roughness: 0.85 })),
  dark: patch(new THREE.MeshStandardMaterial({ color: 0x3b4029, roughness: 0.9 })),
  track: patch(new THREE.MeshStandardMaterial({ color: 0x23251c, roughness: 1 })),
  steel: patch(new THREE.MeshStandardMaterial({ color: 0x2f3128, roughness: 0.6, metalness: 0.2 })),
  panel: patch(new THREE.MeshStandardMaterial({ color: 0x8a8f78, roughness: 0.8 })),
};
function part(group, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; group.add(m); return m; }
function buildBody(type) {
  const g = new THREE.Group();
  const B = (w, h, l, mat, x, y, z) => part(g, new THREE.BoxGeometry(l, h, w), mat, x, y, z);   // length along x
  const Cy = (r, len, mat, x, y, z) => { const m = part(g, new THREE.CylinderGeometry(r, r, len, 10), mat, x, y, z); m.rotation.z = Math.PI / 2; return m; };
  if (type === 'tank') {
    B(1.0, 0.34, 2.9, UM.hull, 0, 0.5, 0);                       // hull
    B(0.34, 0.28, 3.1, UM.track, 0, 0.32, 0.62); B(0.34, 0.28, 3.1, UM.track, 0, 0.32, -0.62);
    B(0.96, 0.34, 1.2, UM.hull, 0.2, 0.84, 0);                   // turret
    part(g, new THREE.CylinderGeometry(0.1, 0.1, 2.0, 8), UM.steel, 1.7, 0.9, 0).rotation.z = Math.PI / 2;   // gun
    B(0.3, 0.14, 0.4, UM.dark, -0.2, 1.08, 0.2);
  } else if (type === 'bradley') {
    B(1.0, 0.5, 2.6, UM.hull, 0, 0.62, 0);
    B(0.3, 0.3, 2.8, UM.track, 0, 0.36, 0.6); B(0.3, 0.3, 2.8, UM.track, 0, 0.36, -0.6);
    B(0.8, 0.3, 1.0, UM.dark, 0.1, 1.04, 0);                     // turret
    part(g, new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), UM.steel, 1.0, 1.08, 0).rotation.z = Math.PI / 2;
    B(0.26, 0.2, 0.5, UM.dark, 0.1, 1.28, -0.38);                // TOW box
  } else if (type === 'itv') {
    B(1.0, 0.5, 2.5, UM.hull, 0, 0.62, 0);
    B(0.3, 0.3, 2.7, UM.track, 0, 0.36, 0.6); B(0.3, 0.3, 2.7, UM.track, 0, 0.36, -0.6);
    B(0.7, 0.55, 0.8, UM.dark, 0.1, 1.15, 0);                    // cupola
    B(0.2, 0.2, 0.9, UM.steel, 0.1, 1.6, 0.42); B(0.2, 0.2, 0.9, UM.steel, 0.1, 1.6, -0.42);   // TOW tubes
  } else {                                                       // m113
    B(1.05, 0.7, 2.6, UM.hull, 0, 0.7, 0);
    B(0.3, 0.3, 2.7, UM.track, 0, 0.32, 0.62); B(0.3, 0.3, 2.7, UM.track, 0, 0.32, -0.62);
    B(0.5, 0.2, 0.6, UM.dark, -0.3, 1.18, 0.0);
    part(g, new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), UM.steel, 0.4, 1.3, 0).rotation.z = Math.PI / 2;
  }
  return g;
}
function badgeTexture(text, fill) {
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 90;
  const x = cv.getContext('2d');
  x.fillStyle = 'rgba(15,20,24,0.9)'; x.beginPath(); x.roundRect(4, 4, 152, 82, 16); x.fill();
  x.fillStyle = fill; x.beginPath(); x.roundRect(10, 10, 140, 70, 12); x.fill();
  x.fillStyle = '#10161a'; x.font = '800 44px -apple-system, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 80, 47);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

/* ---- the troop ---- */
const units = [];
const gameState = { turn: 1, minutes: 6 * 60, selected: null, target: null, moving: null, terrainView: false };
function startHexes(n) {
  // open, dry, on your bank, near the village but outside the buildings
  const cx = BX - 6, cz = riverZ(BX) + 30;
  const cand = [...TERR.values()].filter((t) => t.kind === 'open' && !t.woods && t.z > riverZ(t.x) + 12 && riverDist(t.x, t.z) > 9 && slopeAt(t.x, t.z) < 0.2 && !nearLot(t.x, t.z, 1.5));
  cand.sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz));
  return cand.slice(0, n);
}
{
  const spots = startHexes(ROSTER.length);
  ROSTER.forEach(([k, call, leader], i) => {
    const kind = KINDS[k], s = spots[i];
    const group = new THREE.Group(); group.add(buildBody(kind.body));
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture(kind.short, '#8fc2ff'), depthTest: false, transparent: true }));
    sp.scale.set(4.4, 2.5, 1); sp.position.y = 3.6; group.scale.setScalar(1.3); sp.renderOrder = 20; group.add(sp);
    scene.add(group);
    const u = { id: i, kind, call, leader, r: s.r, c: s.c, x: s.x, z: s.z, yaw: -Math.PI / 2, ap: AP_MAX, group, badge: sp, path: null };
    units.push(u);
  });
}
const unitAt = (r, c) => units.find((u) => u.r === r && u.c === c && u !== gameState.moving);
function placeUnit(u) {
  const y = height(u.x, u.z), f = 1.3;
  const hf = height(u.x + Math.cos(u.yaw) * f, u.z + Math.sin(u.yaw) * f), hb = height(u.x - Math.cos(u.yaw) * f, u.z - Math.sin(u.yaw) * f);
  u.group.position.set(u.x, y, u.z);
  u.group.rotation.order = 'YXZ'; u.group.rotation.set(0, -u.yaw, Math.atan2(hf - hb, 2 * f), 'YXZ');
}
units.forEach(placeUnit);

/* ---- reachable hexes (cheapest cost, within the unit's remaining action points) ---- */
function reachable(u) {
  const best = new Map(), prev = new Map(), start = HXK(u.r, u.c);
  best.set(start, 0);
  const open = [[0, u.r, u.c]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = open.shift();
    if (d > best.get(HXK(r, c)) + 1e-9) continue;
    const from = terrAt(r, c);
    for (const n of HX.neighbors(r, c)) {
      const to = terrAt(n.r, n.c); if (!to) continue;
      if (unitAt(n.r, n.c)) continue;
      const nd = d + stepCost(u, from, to);
      if (nd > u.ap + 1e-6) continue;
      const k = HXK(n.r, n.c);
      if (!best.has(k) || nd < best.get(k) - 1e-9) { best.set(k, nd); prev.set(k, [r, c]); open.push([nd, n.r, n.c]); }
    }
  }
  best.delete(start);
  return { best, prev };
}
function pathTo(u, reach, r, c) {
  const out = [{ r, c }]; let k = HXK(r, c);
  while (reach.prev.has(k)) { const p = reach.prev.get(k); out.unshift({ r: p[0], c: p[1] }); k = HXK(p[0], p[1]); }
  return out;                                 // starts at the unit's own hex
}

/* ---- hex highlights draped on the ground ---- */
const hlMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, toneMapped: false });
const hlMesh = new THREE.Mesh(new THREE.BufferGeometry(), hlMat); hlMesh.frustumCulled = false; hlMesh.renderOrder = 5; scene.add(hlMesh);
function setHighlights(list) {      // list of {r, c, col:[r,g,b,a]}
  const pos = [], colr = [], RAD = 5.1, SUB = 3, idx = [];
  for (const h of list) {
    const ctr = HX.hexCenter(h.r, h.c), base = pos.length / 3;
    const corner = (k) => [ctr.x + Math.cos(Math.PI / 6 + k * Math.PI / 3) * RAD, ctr.z + Math.sin(Math.PI / 6 + k * Math.PI / 3) * RAD];
    // fan of 6 triangles, each cut into SUB x SUB small triangles so it follows the ground
    for (let k = 0; k < 6; k++) {
      const a = corner(k), b = corner((k + 1) % 6), o = [ctr.x, ctr.z], b0 = pos.length / 3;
      for (let i = 0; i <= SUB; i++) for (let j = 0; j <= SUB - i; j++) {
        const u1 = i / SUB, v1 = j / SUB, w1 = 1 - u1 - v1;
        const x = o[0] * w1 + a[0] * u1 + b[0] * v1, z = o[1] * w1 + a[1] * u1 + b[1] * v1;
        pos.push(x, height(x, z) + 0.12, z);
        const edge = Math.max(u1 + v1, 0) ;                       // 0 at centre, 1 at rim: stronger rim reads as a hex outline
        colr.push(h.col[0], h.col[1], h.col[2], h.col[3] * (0.55 + 0.45 * edge));
      }
      const id = (i, j) => b0 + (i * (SUB + 1) - (i * (i - 1)) / 2) + j;
      for (let i = 0; i < SUB; i++) for (let j = 0; j < SUB - i; j++) {
        idx.push(id(i, j), id(i + 1, j), id(i, j + 1));
        if (j < SUB - i - 1) idx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colr), 4));
  g.setIndex(idx);
  hlMesh.geometry.dispose(); hlMesh.geometry = g;
}
const TCOL = { river: [0.1, 0.25, 0.8, 0.5], bridge: [0.9, 0.6, 0.05, 0.6], road: [0.6, 0.45, 0.2, 0.4], woods: [0.0, 0.3, 0.05, 0.45], village: [0.8, 0.15, 0.1, 0.45] };
function refreshHighlights() {
  const list = [];
  if (gameState.terrainView) for (const t of TERR.values()) if (TCOL[t.kind]) list.push({ r: t.r, c: t.c, col: TCOL[t.kind] });
  const u = gameState.selected;
  if (u) {
    const reach = gameState.reach;
    for (const [k, d] of reach.best) { const [r, c] = k.split(',').map(Number); list.push({ r, c, col: d <= 1 + 1e-6 ? [0.2, 0.55, 0.95, 0.5] : [0.15, 0.4, 0.9, 0.45] }); }
    const t = gameState.target;
    if (t) for (const p of t.path.slice(1)) list.push({ r: p.r, c: p.c, col: p === t.path[t.path.length - 1] ? [0.95, 0.7, 0.1, 0.85] : [0.9, 0.9, 0.9, 0.6] });
    list.push({ r: u.r, c: u.c, col: [0.9, 0.55, 0.05, 0.7] });
  }
  setHighlights(list);
}

/* ---- the little HUD ---- */
const hudCss = document.createElement('style');
hudCss.textContent = `
#gTurn { position:fixed; left:16px; top:calc(env(safe-area-inset-top,0px) + 52px); background:var(--panel); border:1px solid var(--panel-edge); border-radius:12px; padding:7px 12px; font-weight:700; font-size:14px; -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); pointer-events:none; }
#gTurn small { display:block; font-weight:500; font-size:11px; color:var(--ink-dim); }
#gEnd { position:fixed; right:16px; bottom:calc(env(safe-area-inset-bottom,0px) + 72px); min-height:48px; padding:0 20px; border-radius:24px; border:0; background:var(--accent); color:var(--accent-ink); font:700 15px/1 inherit; font-family:inherit; }
#gCard { position:fixed; left:16px; right:16px; bottom:calc(env(safe-area-inset-bottom,0px) + 130px); background:var(--panel); border:1px solid var(--panel-edge); border-radius:14px; padding:10px 14px; -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); display:none; pointer-events:none; }
#gCard b { font-size:15px; } #gCard .l2 { font-size:12px; color:var(--ink-dim); margin-top:2px; } #gCard .pips { float:right; font-size:18px; letter-spacing:3px; color:var(--accent); }
`;
document.head.appendChild(hudCss);
const mk = (tag, id, html) => { const e = document.createElement(tag); e.id = id; if (html) e.innerHTML = html; document.body.appendChild(e); return e; };
const gTurn = mk('div', 'gTurn'), gCard = mk('div', 'gCard'), gEnd = mk('button', 'gEnd', 'End turn');
const tBtn = document.createElement('button'); tBtn.textContent = 'Terrain'; document.querySelector('.views').appendChild(tBtn);
tBtn.addEventListener('click', () => { gameState.terrainView = !gameState.terrainView; tBtn.classList.toggle('on', gameState.terrainView); refreshHighlights(); });
document.getElementById('note').textContent = 'Tap a vehicle, tap a blue hex to preview the route, tap it again to drive there.';
function hud() {
  const m = gameState.minutes, hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
  gTurn.innerHTML = `Turn ${gameState.turn} of 12<small>${hh}:${mm} · day 1</small>`;
  const u = gameState.selected;
  if (!u) { gCard.style.display = 'none'; return; }
  const t = gameState.target;
  const pips = '●'.repeat(Math.max(0, Math.ceil(u.ap - 1e-6))) + '○'.repeat(Math.max(0, AP_MAX - Math.ceil(u.ap - 1e-6)));
  gCard.style.display = 'block';
  gCard.innerHTML = `<span class="pips">${pips}</span><b>${u.call}</b> · ${u.kind.label}<div class="l2">${u.leader} · ${rate(u, false)} hexes per action point off road, ${rate(u, true)} on road, 1 in woods or village${t ? ` · <b style="color:var(--accent)">Tap again to drive (${t.cost.toFixed(1)} AP)</b>` : ''}</div>`;
}
function select(u) {
  gameState.selected = u; gameState.target = null;
  gameState.reach = u ? reachable(u) : null;
  refreshHighlights(); hud();
}
function endTurn() {
  if (gameState.moving) return;
  gameState.turn++; gameState.minutes += 3;
  for (const u of units) u.ap = AP_MAX;
  select(null); hud();
}
gEnd.addEventListener('click', endTurn);

/* ---- tap handling (a tap is a short touch that barely moves; drags keep turning the camera) ---- */
let tapStart = null, tapBad = false;
canvas.addEventListener('pointerdown', (e) => { if (pointers.size > 1) tapBad = true; if (pointers.size === 1) { tapBad = false; tapStart = { x: e.clientX, y: e.clientY, t: performance.now() }; } });
canvas.addEventListener('pointerup', (e) => {
  if (!tapStart || tapBad) { tapStart = null; return; }
  const ok = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < 10 && performance.now() - tapStart.t < 450;
  tapStart = null; if (ok) onTap(e.clientX, e.clientY);
});
const _v = new THREE.Vector3();
function onTap(sx, sy) {
  if (gameState.moving) return;
  // nearest vehicle on screen
  let hit = null, bd = 38;
  for (const u of units) {
    _v.set(u.x, height(u.x, u.z) + 1.2, u.z).project(camera);
    if (_v.z > 1) continue;
    const d = Math.hypot((_v.x * 0.5 + 0.5) * innerWidth - sx, (-_v.y * 0.5 + 0.5) * innerHeight - sy);
    if (d < bd) { bd = d; hit = u; }
  }
  if (hit) { select(hit === gameState.selected ? null : hit); return; }
  const p = pickGround(sx, sy); if (!p) { select(null); return; }
  const h = HX.pointToHex(p.x, p.z), k = HXK(h.r, h.c), u = gameState.selected;
  if (u && gameState.reach.best.has(k)) {
    const t = gameState.target;
    if (t && t.r === h.r && t.c === h.c) { startMove(u, t); return; }
    gameState.target = { r: h.r, c: h.c, path: pathTo(u, gameState.reach, h.r, h.c), cost: gameState.reach.best.get(k) };
    refreshHighlights(); hud(); return;
  }
  const occ = unitAt(h.r, h.c); if (occ) { select(occ); return; }
  select(null);
}
function startMove(u, t) {
  const pts = t.path.map((p) => HX.hexCenter(p.r, p.c));
  gameState.moving = u;
  u.path = { pts, i: 0, seg: 0, dest: { r: t.r, c: t.c }, cost: t.cost };
  gameState.target = null; setHighlights([]); gCard.style.display = 'none';
}
window.__lt.camera = camera; window.__lt.hl = hlMesh;
window.__lt.game = { units, TERR, gameState, select, endTurn, reachable, terrAt, onTap, startMove, hex: HX };

/* called every frame from the main loop */
function gameTick(dt) {
  const u = gameState.moving;
  if (u && u.path) {
    const P = u.path, speed = u.kind.fast ? 34 : 24;
    let step = speed * dt;
    while (step > 0 && P.i < P.pts.length - 1) {
      const a = P.pts[P.i], b = P.pts[P.i + 1], L = Math.hypot(b.x - a.x, b.z - a.z) || 1e-6, left = L - P.seg;
      const want = Math.atan2(b.z - a.z, b.x - a.x);
      let dy = want - u.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); u.yaw += dy * Math.min(1, dt * 9);
      if (step >= left) { step -= left; P.i++; P.seg = 0; } else { P.seg += step; step = 0; }
    }
    if (P.i >= P.pts.length - 1) { const e = P.pts[P.pts.length - 1]; u.x = e.x; u.z = e.z; }
    else { const a = P.pts[P.i], b = P.pts[P.i + 1], L = Math.hypot(b.x - a.x, b.z - a.z) || 1, k = P.seg / L; u.x = a.x + (b.x - a.x) * k; u.z = a.z + (b.z - a.z) * k; }
    if (P.i >= P.pts.length - 1) {
      u.r = P.dest.r; u.c = P.dest.c; u.ap = Math.max(0, u.ap - P.cost); if (u.ap < 0.02) u.ap = 0;
      u.path = null; gameState.moving = null;
      select(u);
    }
    placeUnit(u);
  }
  // badges stay about the same size on screen whether zoomed out or in
  const bw = Math.max(1.5, Math.min(5, cam.dist * 0.036));
  for (const v of units) { v.badge.scale.set(bw, bw * 0.56, 1); v.badge.position.y = 2.0 + bw * 0.5; v.badge.material.opacity = v.ap > 0 || v === gameState.selected ? 1 : 0.55; }
}
hud();
