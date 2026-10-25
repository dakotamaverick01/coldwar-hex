
const GLSL_BUILDING = /* glsl */`{
  vec2 w = vBUv; float t = vBMat.x, len = vBMat.y, fl = vBMat.z, sb = vBMat.w;
  float fw = max(fwidth(w.x), fwidth(w.y)) + 1e-4;
  float det = 1.0 - smoothstep(0.05, 0.25, fw);        // fine detail fades where it would shimmer
  float det2 = 1.0 - smoothstep(0.2, 0.7, fw);         // windows stay visible further out
  vec3 c = diffuseColor.rgb;
  float nz = lt_noise(w * 2.7 + vWPos.xz * 3.0);
  float yy = w.y - sb;
  if (t < 1.5) {                                       // plaster, optionally with a timber frame
    c *= 0.92 + 0.12 * nz;
    c *= 1.0 - 0.22 * (1.0 - smoothstep(0.35, 1.0, w.y));       // splash dirt along the base
    if (t > 0.5) {
      float bay = 1.3, u = fract(w.x / bay), bx = u * bay, bi = floor(w.x / bay), nb = floor(len / bay);
      float post = min(bx, bay - bx);
      float ry = mod(yy, 2.7);
      float rail = min(min(abs(ry - 0.1), abs(ry - 2.6)), abs(ry - 0.92));
      float br = 9.0;
      if (bi < 0.5) br = abs(bx - (ry - 0.1) * 0.5) * 0.9;
      else if (bi > nb - 1.5) br = abs((bay - bx) - (ry - 0.1) * 0.5) * 0.9;
      else if (mod(bi, 3.0) < 0.5 && ry > 0.95) br = abs(bx - (ry - 0.95) * 0.75) * 0.8;
      float tm = min(min(post - 0.085, rail - 0.085), br - 0.07);
      float timber = 1.0 - smoothstep(-0.006, 0.006 + fw, tm);
      c = mix(c, vTimber * (0.85 + 0.3 * nz), timber * det);
      c = mix(c, mix(c, vTimber, 0.25), 1.0 - det);
    }
  } else if (t < 2.5) {                                // vertical boards
    float pb = w.x / 0.22, bid = floor(pb), pu = fract(pb);
    float gap = 1.0 - smoothstep(0.0, 0.07, min(pu, 1.0 - pu));
    c *= (0.82 + 0.32 * lt_hash(vec2(bid, 3.0))) * (0.9 + 0.2 * lt_noise(vec2(bid * 3.1, w.y * 1.7)));
    c *= 1.0 - 0.45 * gap * det;
    c *= 1.0 - 0.25 * (1.0 - smoothstep(0.3, 1.2, w.y));
  } else if (t < 3.5) {                                // rough stone blocks
    float row = floor(w.y / 0.34), bxs = w.x / 0.6 + 0.5 * mod(row, 2.0);
    float bu = fract(bxs), bv = fract(w.y / 0.34);
    float mortar = 1.0 - smoothstep(0.0, 0.08, min(min(bu, 1.0 - bu) * 0.6, min(bv, 1.0 - bv) * 0.34));
    c *= 0.8 + 0.35 * lt_hash(vec2(floor(bxs), row));
    c = mix(c, vec3(0.42, 0.40, 0.36), mortar * 0.6 * det);
  } else if (t < 11.5) {                               // roof tiles (10) or slate (11)
    float rh = t > 10.5 ? 0.2 : 0.33, tw = t > 10.5 ? 0.3 : 0.24;
    float row = floor(w.y / rh), rv = fract(w.y / rh);
    float txs = w.x / tw + 0.5 * mod(row, 2.0), tu = fract(txs);
    c *= 0.82 + 0.3 * lt_hash(vec2(floor(txs), row));
    c *= mix(1.0, 0.68 + 0.32 * smoothstep(0.0, 0.55, rv), det);
    c *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.07, min(tu, 1.0 - tu))) * det;
    c = mix(c, c * vec3(0.7, 0.78, 0.55), smoothstep(0.55, 0.85, lt_noise(w * 0.7 + 3.0)) * 0.5);   // moss and age
  } else if (t < 12.5) {                               // brick chimney
    float row = floor(w.y / 0.09), bu = fract(w.x / 0.25 + 0.5 * mod(row, 2.0)), bv = fract(w.y / 0.09);
    c *= 0.85 + 0.25 * lt_hash(vec2(floor(w.x / 0.25), row));
    c = mix(c, vec3(0.3), (1.0 - smoothstep(0.0, 0.12, min(bv, 1.0 - bv))) * 0.4 * det);
  } else if (t < 14.5) {                               // stacked logs, cut ends showing
    vec2 q = fract(w / 0.2) - 0.5; float id = lt_hash(floor(w / 0.2));
    float r = length(q);
    c *= 0.75 + 0.4 * id;
    c = mix(c, c * 1.45 + vec3(0.03, 0.02, 0.0), (1.0 - smoothstep(0.3, 0.38, r)) * det);
    c *= 1.0 - 0.5 * (smoothstep(0.38, 0.48, r)) * det;
  } else {                                             // manure heap
    c *= 0.7 + 0.5 * nz;
  }
  // windows, shutters and doors on plaster, timber and stone walls
  if (t < 3.5 && bHas(fl, 1.0) + bHas(fl, 8.0) > 0.5 && yy > 0.0) {
    bool tall = bHas(fl, 16.0) > 0.5;
    float sp = tall ? 3.6 : 2.4;
    float k = max(1.0, floor((len - 1.6) / sp) + 1.0);
    float off = (len - (k - 1.0) * sp) * 0.5;
    float i = clamp(floor((w.x - off) / sp + 0.5), 0.0, k - 1.0);
    float dx = abs(w.x - (off + i * sp));
    bool door = bHas(fl, 8.0) > 0.5 && sb < 0.5 && abs(i - floor(k * 0.5)) < 0.5;
    bool win = bHas(fl, 1.0) > 0.5;
    float wy0 = door ? 0.0 : (tall ? 1.8 : 0.85), wy1 = door ? 2.2 : (tall ? 5.6 : 2.0), hw = door ? 0.6 : (tall ? 0.7 : 0.45);
    if (door || win) {
      float inW = step(dx, hw) * step(wy0, yy) * step(yy, wy1);
      if (tall) inW *= step(length(vec2(dx / hw, max(0.0, yy - (wy1 - hw)) / hw)), 1.0);     // round-topped church windows
      float inner = step(dx, hw - 0.08) * step(wy0 + 0.08, yy) * step(yy, wy1 - 0.08);
      vec3 glass = vec3(0.025, 0.032, 0.04) + vec3(0.05, 0.06, 0.07) * smoothstep(wy0, wy1, yy);
      vec3 wood = vec3(0.10, 0.065, 0.04) * (0.8 + 0.4 * nz);
      float mull = (1.0 - step(0.035, dx)) + (1.0 - step(0.035, abs(yy - mix(wy0, wy1, 0.55))));
      vec3 wc = door ? mix(wood * 0.75, wood, inner) : mix(vec3(0.78, 0.76, 0.7), glass, inner * (1.0 - clamp(mull, 0.0, 1.0)));
      c = mix(c, wc, inW * det2);
      if (bHas(fl, 2.0) > 0.5 && !door) {
        float sh = step(hw + 0.02, dx) * step(dx, hw + 0.46) * step(wy0, yy) * step(yy, wy1);
        float slat = 0.85 + 0.15 * step(0.5, fract(yy / 0.12));
        c = mix(c, vec3(0.05, 0.12, 0.06) * slat, sh * det2);
      }
    }
  }
  // barn gate: big plank doors with a Z brace
  if (bHas(fl, 4.0) > 0.5) {
    float gx = abs(w.x - len * 0.5);
    float inG = step(gx, 1.9) * step(yy, 3.8) * step(0.0, yy);
    float zb = min(min(abs(yy - 0.4), abs(yy - 3.4)), abs((w.x - len * 0.5 + 1.9) * 0.8 - (yy - 0.4)));
    c = mix(c, c * 0.62, inG);
    c = mix(c, vTimber, inG * (1.0 - smoothstep(0.08, 0.1 + fw, zb)) * det);
  }
  diffuseColor.rgb = c;
}`;

/* ============================================================
   8. BUILDINGS KIT: a Franconian farm village, made entirely by code (shared by every map)
      Courtyard farms (half-timbered house, plank barn, stone stable, woodpile, henhouse, outhouse,
      manure heap) laid out along the roads, plus a church with a pointed spire.
      All buildings are merged into one mesh; timber frames, windows, shutters, doors, roof tiles,
      planks and stonework are painted per pixel by the building shader below.
   ============================================================ */
const MU = 1 / MPU;                                    // metres -> world units
const BT = { PLASTER: 0, TIMBER: 1, PLANKS: 2, STONE: 3, TILE: 10, SLATE: 11, BRICK: 12, LOGS: 14, MUCK: 15 };
const BF = { WIN: 1, SHUT: 2, GATE: 4, DOOR: 8, TALL: 16 };
const BLD = { pos: [], nor: [], uv: [], col: [], mat: [], tim: [] };
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _vn = new THREE.Vector3();
function bTri(a, b, c, ua, ub, uc, col, mat, tim) {
  _v1.subVectors(b, a); _v2.subVectors(c, a); _vn.crossVectors(_v1, _v2).normalize();
  for (const [p, u] of [[a, ua], [b, ub], [c, uc]]) {
    BLD.pos.push(p.x, p.y, p.z); BLD.nor.push(_vn.x, _vn.y, _vn.z); BLD.uv.push(u[0], u[1]);
    BLD.col.push(col.r, col.g, col.b); BLD.mat.push(mat[0], mat[1], mat[2], mat[3]); BLD.tim.push(tim.r, tim.g, tim.b);
  }
}
function bQuad(a, b, c, d, ua, ub, uc, ud, col, mat, tim) { bTri(a, b, c, ua, ub, uc, col, mat, tim); bTri(a, c, d, ua, uc, ud, col, mat, tim); }
// a local frame: metres, origin at (x, baseY, z) in world units, rotated by yaw
function bFrame(x, z, y, yaw) {
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  return (lx, ly, lz) => new THREE.Vector3(x + (lx * cs + lz * sn) * MU, y + ly * MU, z + (-lx * sn + lz * cs) * MU);
}
function groundBase(P, hx, hz) {       // lowest ground under the four corners
  let m = 1e9;
  for (const [a, b] of [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz], [0, 0]]) { const p = P(a, 0, b); m = Math.min(m, height(p.x, p.z)); }
  return m;
}
// walls of a box between heights y0 and y1 (metres); four sides, uv in metres
function bWalls(P, L, B, y0, y1, type, flagsLong, flagsEnd, col, tim, sb = y0) {
  const x = L / 2, z = B / 2;
  const sides = [
    [[-x, z], [x, z], L, flagsLong], [[x, -z], [-x, -z], L, flagsLong],
    [[x, z], [x, -z], B, flagsEnd], [[-x, -z], [-x, z], B, flagsEnd],
  ];
  for (const [[ax, az], [bx, bz], len, fl] of sides) {
    bQuad(P(ax, y0, az), P(bx, y0, bz), P(bx, y1, bz), P(ax, y1, az), [0, y0], [len, y0], [len, y1], [0, y1], col, [type, len, fl, sb], tim);
  }
}
/* A gable-roofed building. Ridge runs along local x. storeys: [{h, type, flagsLong, flagsEnd}] from the plinth up. */
function gableBuilding(o) {
  const P0 = bFrame(o.x, o.z, 0, o.yaw);
  const base = groundBase(P0, o.L / 2, o.B / 2);
  const P = bFrame(o.x, o.z, base, o.yaw);
  const tim = o.timber || lin(0x4a2e1e), col = o.wall || lin(0xe6e0d0), roofCol = o.roof || lin(0x8a3a24);
  bWalls(P, o.L, o.B, -2.0, 0.35, BT.STONE, 0, 0, lin(0x8f887a), tim);                   // stone plinth, runs into the ground
  let y = 0.35;
  for (const s of o.storeys) { bWalls(P, o.L, o.B, y, y + s.h, s.type, s.flagsLong || 0, s.flagsEnd || 0, s.col || col, tim, y); y += s.h; }
  const H = y, pitch = THREE.MathUtils.degToRad(o.pitch || 50), ov = o.over ?? 0.45, t = Math.tan(pitch);
  const Hr = H + (o.B / 2) * t, He = H - ov * t;
  const top = o.storeys[o.storeys.length - 1];
  const gt = o.gableType ?? top.type;
  for (const sx of [1, -1]) {      // gable triangles, painted like the top storey
    const a = P(sx * o.L / 2, H, sx * o.B / 2), b = P(sx * o.L / 2, H, -sx * o.B / 2), c = P(sx * o.L / 2, Hr, 0);
    bTri(a, b, c, [0, H], [o.B, H], [o.B / 2, Hr], top.col || col, [gt, o.B, o.gableFlags || 0, H], tim);
  }
  const xr = o.L / 2 + ov, sl = (o.B / 2 + ov) / Math.cos(pitch);
  const rt = o.roofType ?? BT.TILE;
  bQuad(P(-xr, He, o.B / 2 + ov), P(xr, He, o.B / 2 + ov), P(xr, Hr, 0), P(-xr, Hr, 0), [0, 0], [2 * xr, 0], [2 * xr, sl], [0, sl], roofCol, [rt, 2 * xr, 0, 0], tim);
  bQuad(P(xr, He, -o.B / 2 - ov), P(-xr, He, -o.B / 2 - ov), P(-xr, Hr, 0), P(xr, Hr, 0), [0, 0], [2 * xr, 0], [2 * xr, sl], [0, sl], roofCol, [rt, 2 * xr, 0, 0], tim);
  let chimTop = null;
  if (o.chimney) {
    const cx = o.L * 0.22, cz = -0.6, ch = Hr + 1.1;
    const Pc = bFrame(P(cx, 0, cz).x, P(cx, 0, cz).z, base, o.yaw);
    bWalls(Pc, 0.6, 0.6, H, ch, BT.BRICK, 0, 0, lin(0x8a4a38), tim);
    bQuad(Pc(-0.3, ch, 0.3), Pc(0.3, ch, 0.3), Pc(0.3, ch, -0.3), Pc(-0.3, ch, -0.3), [0, 0], [0.6, 0], [0.6, 0.6], [0, 0.6], lin(0x2a2522), [BT.BRICK, 0.6, 0, 0], tim);
    chimTop = Pc(0, ch, 0);
  }
  return { base, chimTop, P, H, Hr };
}
function boxThing(x, z, yaw, L, B, h, type, col, topType = type, topCol = col) {   // woodpiles, manure heaps
  const P0 = bFrame(x, z, 0, yaw), base = groundBase(P0, L / 2, B / 2), P = bFrame(x, z, base, yaw), tim = lin(0x3a2a1e);
  bWalls(P, L, B, -0.5, h, type, 0, 0, col, tim, -0.5);
  bQuad(P(-L / 2, h, B / 2), P(L / 2, h, B / 2), P(L / 2, h, -B / 2), P(-L / 2, h, -B / 2), [0, 0], [L, 0], [L, B], [0, B], topCol, [topType, L, 0, 0], tim);
}
function pyramid(P, w, y0, y1, type, col, tim) {   // a four-sided spire
  const h = w / 2, apex = P(0, y1, 0), sl = Math.hypot(h, y1 - y0);
  for (const [a, b] of [[[-h, h], [h, h]], [[h, h], [h, -h]], [[h, -h], [-h, -h]], [[-h, -h], [-h, h]]]) {
    bTri(P(a[0], y0, a[1]), P(b[0], y0, b[1]), apex, [0, 0], [w, 0], [w / 2, sl], col, [type, w, 0, 0], tim);
  }
}

/* ---- village plan (runs before trees and fields, so they keep clear of the farms) ---- */
const lots = [];
function planVillage() {
  const near = (x, z, r) => lots.some((l) => Math.hypot(l.x - x, l.z - z) < r + l.r);
  const tryLot = (x, z, yaw, r, kind) => {
    if (riverDist(x, z) < r + 2.6 || Math.hypot(x - BX, z - BZ) < r + 4.5 || near(x, z, r + 0.15) || roadDistAt(x, z) < r * 0.75) return false;
    if (slopeAt(x, z) > 0.28) return false;
    lots.push({ x, z, yaw, r, kind, seed: hash2(Math.round(x * 7), Math.round(z * 7)) }); return true;
  };
  // the church first, beside the road nearest the village centre
  const lineDir = (line, k) => { const a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)]; return Math.atan2(b[0] - a[0], b[1] - a[1]); };
  const slots = [];
  for (const line of [roadA, roadB]) for (let k = 2; k < line.length - 2; k += 3) {
    const [x, z] = line[k], dv = Math.hypot(x - VIL.x, z - VIL.z);
    if (dv > VIL.r * 1.6) continue;
    const ang = lineDir(line, k), nx = Math.cos(ang), nz = -Math.sin(ang);     // normal to the road
    for (const sd of [-1, 1]) slots.push({ x: x + nx * sd * 1.62, z: z + nz * sd * 1.62, yaw: ang - sd * Math.PI / 2, dv });
  }
  slots.sort((p, q) => p.dv - q.dv);
  for (const s of slots) if (tryLot(s.x, s.z, s.yaw, 1.25, 'church')) break;
  for (const s of slots) tryLot(s.x, s.z, s.yaw, 1.02, 'farm');
  // the lone farm on the enemy bank, facing its track
  const k = Math.floor(trackC.length * 0.8), ang = lineDir(trackC, k);
  for (const off of [1.6, 2.2, 2.8]) if (tryLot(trackC[k][0] + Math.cos(ang) * off, trackC[k][1] - Math.sin(ang) * off, ang - Math.PI / 2, 1.02, 'farm')) break;
}
planVillage();
const nearLot = (x, z, pad = 0) => { for (const l of lots) if (Math.hypot(l.x - x, l.z - z) < l.r + pad) return true; return false; };
const lotAmount = (x, z) => { let m = 0; for (const l of lots) m = Math.max(m, 1 - smooth(l.r * 0.85, l.r * 1.25, Math.hypot(l.x - x, l.z - z))); return m; };
//@@END_PLAN@@

/* ---- building the farms and the church ---- */
const houses = [];             // chimney tops, for the smoke
{
  const WALLS = [lin(0xece6d6), lin(0xe4d9bf), lin(0xdcc9a0), lin(0xe8ddd3), lin(0xd8d2c4)];
  const TIMBERS = [lin(0x3e2618), lin(0x5a2418), lin(0x2e2620), lin(0x4a3020)];
  const ROOFS = [lin(0x8e4a34), lin(0x7c4632), lin(0x86553e), lin(0x5e463c), lin(0x965038)];
  const PLANK = [lin(0x6a5038), lin(0x5a4a3a), lin(0x7a6248)];
  for (const lot of lots) {
    const r = (k) => hash2(Math.round(lot.seed * 9973) + k * 17, k * 31 + 7);
    const L = bFrame(lot.x, lot.z, 0, lot.yaw);         // lot frame in metres; +z faces the road
    const at = (lx, lz) => L(lx, 0, lz);
    const wall = WALLS[Math.floor(r(1) * WALLS.length)], timber = TIMBERS[Math.floor(r(2) * TIMBERS.length)], roof = ROOFS[Math.floor(r(3) * ROOFS.length)];
    if (lot.kind === 'church') {
      const c = at(0, -1), yaw = lot.yaw + Math.PI / 2;
      const nave = gableBuilding({ x: c.x, z: c.z, yaw, L: 20, B: 10.5, storeys: [{ h: 7.5, type: BT.PLASTER, flagsLong: BF.WIN | BF.TALL, flagsEnd: BF.DOOR | BF.WIN | BF.TALL }], pitch: 52, wall: lin(0xeee8da), roof: lin(0x7a3626), timber });
      const tw = bFrame(c.x, c.z, 0, yaw), tp = tw(-12.5, 0, 0);       // tower at the west end
      const Pt0 = bFrame(tp.x, tp.z, 0, yaw), tb = groundBase(Pt0, 3, 3), Pt = bFrame(tp.x, tp.z, tb, yaw);
      bWalls(Pt, 6, 6, -2, 0.4, BT.STONE, 0, 0, lin(0x8f887a), timber);
      bWalls(Pt, 6, 6, 0.4, 21, BT.PLASTER, BF.WIN, BF.WIN, lin(0xeee8da), timber, 15.5);
      bWalls(Pt, 6.3, 6.3, 21, 21.6, BT.STONE, 0, 0, lin(0x9a9284), timber);
      pyramid(Pt, 6.6, 21.6, 36, BT.SLATE, lin(0x3a3f44), timber);
      continue;
    }
    const ty = PLANK[Math.floor(r(4) * PLANK.length)];
    const half = r(5) < 0.25;                          // some farms are fully plastered, no timber frame
    const side = r(6) < 0.5 ? 1 : -1;                  // which side of the yard the house stands on
    const shut = r(7) < 0.55 ? BF.SHUT : 0;
    // farmhouse, gable end to the road (as in Franconian villages)
    const hp = at(-side * 6.5, 2.5);
    const hL = 12 + r(8) * 3, hB = 8.5 + r(9) * 1.5;
    const h = gableBuilding({ x: hp.x, z: hp.z, yaw: lot.yaw + Math.PI / 2, L: hL, B: hB, pitch: 50 + r(10) * 6, wall, timber, roof, chimney: true,
      storeys: [{ h: 3.0, type: BT.PLASTER, flagsLong: BF.WIN | shut | BF.DOOR, flagsEnd: BF.WIN | shut },
                { h: 2.7, type: half ? BT.PLASTER : BT.TIMBER, flagsLong: BF.WIN | shut, flagsEnd: BF.WIN | shut }],
      gableFlags: BF.WIN });
    houses.push({ chimTop: h.chimTop });
    // barn across the back of the yard
    if (r(11) < 0.9) { const bp = at(0, -8.5); gableBuilding({ x: bp.x, z: bp.z, yaw: lot.yaw, L: 18 + r(12) * 5, B: 9, pitch: 45, roof, timber,
      storeys: [{ h: 5.2, type: BT.PLANKS, col: ty, flagsLong: BF.GATE, flagsEnd: 0 }], gableType: BT.PLANKS }); }
    // stable on the other side of the yard
    if (r(13) < 0.75) { const sp = at(side * 7.5, 1.0); gableBuilding({ x: sp.x, z: sp.z, yaw: lot.yaw + Math.PI / 2, L: 11, B: 6.5, pitch: 45, roof, timber,
      storeys: [{ h: 3.0, type: BT.STONE, col: lin(0xa09a8c), flagsLong: BF.WIN | BF.DOOR, flagsEnd: 0 }], gableType: BT.PLANKS, gableFlags: 0 }); }
    // small things around the yard
    const wp = at(r(14) * 6 - 3, -3.2); boxThing(wp.x, wp.z, lot.yaw, 4.5, 1.1, 1.6, BT.LOGS, lin(0x8a6a48), BT.LOGS, lin(0x6a5038));
    if (r(15) < 0.7) { const mp = at(side * 1.5, -1); boxThing(mp.x, mp.z, lot.yaw + 0.3, 3.2, 2.6, 0.9, BT.MUCK, lin(0x3a2c1e)); }
    if (r(16) < 0.6) { const cp = at(-side * 10.5, -6.5); gableBuilding({ x: cp.x, z: cp.z, yaw: lot.yaw, L: 2.6, B: 1.8, pitch: 35, over: 0.2, roof: lin(0x5a4a3a), timber,
      storeys: [{ h: 1.5, type: BT.PLANKS, col: ty, flagsLong: BF.DOOR }], gableType: BT.PLANKS }); }       // henhouse
    if (r(17) < 0.5) { const op = at(side * 11, -11); gableBuilding({ x: op.x, z: op.z, yaw: lot.yaw + 0.1, L: 1.3, B: 1.3, pitch: 40, over: 0.15, roof: lin(0x4a3e34), timber,
      storeys: [{ h: 2.0, type: BT.PLANKS, col: PLANK[0], flagsEnd: BF.DOOR }], gableType: BT.PLANKS }); }  // outhouse
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(BLD.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(BLD.nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(BLD.col, 3));
  g.setAttribute('aBUv', new THREE.Float32BufferAttribute(BLD.uv, 2));
  g.setAttribute('aBMat', new THREE.Float32BufferAttribute(BLD.mat, 4));
  g.setAttribute('aTimber', new THREE.Float32BufferAttribute(BLD.tim, 3));
  const mat = patch(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), { building: true });
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, rr) => {
    prev(sh, rr);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aBUv; attribute vec4 aBMat; attribute vec3 aTimber; varying vec2 vBUv; varying vec4 vBMat; varying vec3 vTimber;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBUv = aBUv; vBMat = aBMat; vTimber = aTimber;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vBUv; varying vec4 vBMat; varying vec3 vTimber;\nfloat bHas(float f, float b){ return mod(floor(f / b + 0.001), 2.0); }')
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GLSL_BUILDING);
  };
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  window.__buildingTris = BLD.pos.length / 9;
}
