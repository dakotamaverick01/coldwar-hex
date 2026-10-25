
/* ============================================================
   1b. THE REAL LAND: Hof elevation (rotated crop), river traced from it.
       1 world unit = 12.5 m. +x runs upstream along the river, +z is your bank (WSW), -z is the enemy side.
   ============================================================ */
const MAPJ = await (await fetch('./data/bridge_map.json')).json();
const HB = new Uint16Array(await (await fetch('./data/bridge_heights.bin')).arrayBuffer());
const GN = MAPJ.size, GS = MAPJ.spacing_units, GR = MAPJ.half_extent_units, MPU = MAPJ.metres_per_unit;
const VEX = 1.4;                       // vertical exaggeration: hills read better from a tabletop camera
const BOARD = { hx: 160, hz: 177, hexW: 10 };   // 41 rows x 31-32 hexes (see tools/hex.js), hex = 10 units = 125 m
const gridV = (i, j) => HB[Math.max(0, Math.min(GN - 1, j)) * GN + Math.max(0, Math.min(GN - 1, i))] * 0.1 + MAPJ.base_m;
const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
function rawM(x, z) {                  // metres above sea level, smooth (Catmull-Rom) between the 25 m samples
  const fx = (x + GR) / GS, fz = (z + GR) / GS;
  const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const col = [];
  for (let dj = -1; dj <= 2; dj++) col.push(cr(gridV(i - 1, j + dj), gridV(i, j + dj), gridV(i + 1, j + dj), gridV(i + 2, j + dj), tx));
  return cr(col[0], col[1], col[2], col[3], tz);
}
const RIV = MAPJ.river.slice();
{ // the traced river stops a little short of the bigger board: carry it on upstream along its last direction
  const n = RIV.length, a = RIV[n - 9], b = RIV[n - 1], sl = (b[1] - a[1]) / (b[0] - a[0]);
  for (let x = b[0] + 2; x <= 240; x += 2) RIV.push([x, b[1] + sl * (x - b[0])]);
}
const riverZ = (x) => {
  const f = (x - RIV[0][0]) / 2, i = Math.max(0, Math.min(RIV.length - 2, Math.floor(f))), t = Math.max(0, Math.min(1, f - i));
  return mix(RIV[i][1], RIV[i + 1][1], t);
};
const riverDZ = (x) => (riverZ(x + 0.5) - riverZ(x - 0.5));
const riverDist = (x, z) => { const dz = riverDZ(x); return Math.abs(z - riverZ(x)) / Math.sqrt(1 + dz * dz); };
const REF_M = rawM(0, riverZ(0));
const Yraw = (x, z) => (rawM(x, z) - REF_M) / MPU * VEX;
// water surface follows the lowest ground in the valley, smoothed along the river
const WX0 = Math.round(RIV[0][0]), WX1 = Math.round(RIV[RIV.length - 1][0]);
const waterArr = (() => {
  const n = WX1 - WX0 + 1, a = new Float32Array(n);
  for (let k = 0; k < n; k++) { const x = WX0 + k; let m = 1e9; for (let dz = -2; dz <= 2; dz += 1) m = Math.min(m, Yraw(x, riverZ(x) + dz)); a[k] = m; }
  const b = new Float32Array(n);
  for (let k = 0; k < n; k++) { let s = 0, c = 0; for (let o = -9; o <= 9; o++) { const q = k + o; if (q >= 0 && q < n) { s += a[q]; c++; } } b[k] = s / c; }
  return b;
})();
const waterY = (x) => { const f = Math.max(0, Math.min(waterArr.length - 1.001, x - WX0)), i = Math.floor(f); return mix(waterArr[i], waterArr[i + 1], f - i) - 0.2; };
const WATER_DROP = 0;

const BX = 0, BZ = riverZ(0);          // the bridge
function heightBase(x, z) {
  let h = Yraw(x, z);
  const d = riverDist(x, z), wy = waterY(x);
  // valley floor next to the river: a gentle bank profile that meets the real ground further out
  const bank = wy - 0.18 + 0.75 * smooth(0.5, 1.7, d) + 0.45 * smooth(1.7, 6, d);
  h = mix(h, Math.min(h, bank + 0.6) , 0);          // (real ground wins away from the river)
  const w = 1 - smooth(1.4, 4.0, d);
  h = mix(h, bank, w);
  return h;
}
// the village: the flattest piece of your bank near the bridge
const VIL = (() => {
  let best = null, bs = 1e9;
  for (let x = -40; x <= 40; x += 2) for (let off = 13; off <= 26; off += 2) {
    const z = riverZ(x) + off, hc = heightBase(x, z);
    let s = 0; for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4], [3, 3], [-3, -3]]) s += Math.abs(heightBase(x + dx, z + dz) - hc);
    s += Math.abs(x) * 0.02;
    if (s < bs) { bs = s; best = { x, z }; }
  }
  best.y = heightBase(best.x, best.z); best.r = 7;
  return best;
})();
function height(x, z) {
  let h = heightBase(x, z);
  const vd = Math.hypot(x - VIL.x, z - VIL.z);
  return mix(h, VIL.y, 1 - smooth(VIL.r * 0.55, VIL.r * 1.15, vd));
}
const slopeAt = (x, z) => { const e = 0.8; return Math.hypot(height(x + e, z) - height(x - e, z), height(x, z + e) - height(x, z - e)) / (2 * e); };

/* Roads: splines through control points, baked into a distance texture so edges stay crisp. */
const RX0 = -200, RZ0 = -220, RW_U = 400, RH_U = 440, RRES = 3;     // texture covers 400 x 440 units at 3 texels per unit
const RTW = RW_U * RRES, RTH = RH_U * RRES;
const roadMain = new Float32Array(RTW * RTH).fill(1), roadSide = new Float32Array(RTW * RTH).fill(1);
function spline(pts, step = 0.4) {
  const out = [], P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = Math.hypot(P(i + 1)[0] - P(i)[0], P(i + 1)[1] - P(i)[1]), n = Math.max(2, Math.ceil(seg / step));
    for (let k = 0; k < n; k++) { const t = k / n; out.push([cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0], t), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1], t)]); }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function paint(arr, line) {
  for (let s = 0; s < line.length - 1; s++) {
    const [ax, az] = line[s], [bx, bz] = line[s + 1];
    const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - 1.1 - RX0) * RRES)), i1 = Math.min(RTW - 1, Math.ceil((Math.max(ax, bx) + 1.1 - RX0) * RRES));
    const j0 = Math.max(0, Math.floor((Math.min(az, bz) - 1.1 - RZ0) * RRES)), j1 = Math.min(RTH - 1, Math.ceil((Math.max(az, bz) + 1.1 - RZ0) * RRES));
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-6;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const px = RX0 + (i + 0.5) / RRES, pz = RZ0 + (j + 0.5) / RRES;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2));
      const d = Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
      const k = j * RTW + i; if (d < arr[k]) arr[k] = d;
    }
  }
}
const roadA = spline([[BX + 26, -178], [BX + 20, -128], [BX + 12, -80], [BX + 5, -40], [BX + 1, BZ - 5], [BX, BZ - 2.4], [BX, BZ + 2.4], [BX - 1, BZ + 5],
  [VIL.x + 1, VIL.z - 1.5], [VIL.x, VIL.z + 1], [VIL.x - 14, VIL.z + 45], [VIL.x - 22, 128], [VIL.x - 26, 180]]);
const roadB = (() => {   // valley road along your bank, passing through the village
  const pts = [];
  for (let x = -196; x <= 196; x += 14) pts.push([x, riverZ(x) + 6.5 + 1.2 * Math.sin(x * 0.045)]);
  const near = pts.reduce((b, p, i) => Math.hypot(p[0] - VIL.x, p[1] - VIL.z) < Math.hypot(pts[b][0] - VIL.x, pts[b][1] - VIL.z) ? i : b, 0);
  pts[near] = [VIL.x - 1.5, VIL.z - 1.8];
  return spline(pts);
})();
const farmX = BX + 17, farmZ = riverZ(BX + 17) - 11;
const trackC = spline([[BX + 4, BZ - 30], [farmX - 3, farmZ + 3], [farmX, farmZ + 0.5]]);
paint(roadMain, roadA); paint(roadMain, roadB); paint(roadSide, trackC);
const roadDistAt = (x, z) => {
  const i = Math.floor((x - RX0) * RRES), j = Math.floor((z - RZ0) * RRES);
  if (i < 0 || j < 0 || i >= RTW || j >= RTH) return 9;
  return Math.min(roadMain[j * RTW + i], roadSide[j * RTW + i]);
};
const roadTex = (() => {
  const data = new Uint8Array(RTW * RTH * 4);
  for (let k = 0; k < RTW * RTH; k++) { data[k * 4] = Math.round(roadMain[k] * 255); data[k * 4 + 1] = Math.round(roadSide[k] * 255); data[k * 4 + 2] = 255; data[k * 4 + 3] = 255; }
  const t = new THREE.DataTexture(data, RTW, RTH);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
})();
U.uRoadTex.value = roadTex;

/* Forest amount, computed once on a 1-unit grid: steep and high ground is wooded, the valley floor is open. */
const FG_X0 = -210, FG_Z0 = -230, FG_W = 420, FG_H = 460;
const forestGrid = new Float32Array(FG_W * FG_H);
for (let j = 0; j < FG_H; j++) for (let i = 0; i < FG_W; i++) {
  const x = FG_X0 + i + 0.5, z = FG_Z0 + j + 0.5;
  const d = riverDist(x, z), sl = slopeAt(x, z), up = height(x, z) - waterY(x);
  const fm = fbm(x * 0.045 + 11, z * 0.045 - 4) * 0.8 + 0.55 * smooth(0.10, 0.28, sl) + 0.3 * smooth(3, 10, up);
  let f = smooth(0.50, 0.64, fm);
  f *= smooth(6, 11, d);
  f *= smooth(0.7, 1.4, roadDistAt(x, z));
  const vd = Math.hypot(x - VIL.x, z - VIL.z); f *= smooth(VIL.r * 0.9, VIL.r * 1.5, vd);
  const fd = Math.hypot(x - farmX, z - farmZ); f *= smooth(5, 8, fd);
  f *= smooth(1.4, 2.4, Math.hypot(x - BX, z - BZ));
  forestGrid[j * FG_W + i] = f;
}
function forestAmount(x, z) {
  const i = Math.floor(x - FG_X0), j = Math.floor(z - FG_Z0);
  if (i < 0 || j < 0 || i >= FG_W || j >= FG_H) return smooth(0.3, 0.5, vnoise(x * 0.05, z * 0.05)) * 0.9;   // far land: mostly wooded
  return forestGrid[j * FG_W + i];
}
