//@@VILLAGE_PLAN@@

/* ============================================================
   5. TERRAIN: one mesh, fine over the board, stretched out to the horizon
   ============================================================ */
const lin = (hex) => new THREE.Color(hex);
const COL = {
  meadow: lin(0x6b7546), pasture: lin(0x5a6a3a), plowed: lin(0x4a3a2a), stubble: lin(0x9c8650),
  wheat: lin(0x6c8838), fallow: lin(0x7d6c45), forest: lin(0x2b2a1b), rock: lin(0x726c62),
  road: lin(0x8c8271), mud: lin(0x3b3226), village: lin(0x675d47), ridge: lin(0x5a5838),
};
function axis(inner, outerMax) {
  const a = [];
  for (let v = -inner; v <= inner + 1e-6; v += 1) a.push(v);
  let s = 2, v = inner; const hi = [];
  while (v < outerMax) { v += s; s *= 1.25; hi.push(v); }
  return [...hi.reverse().map((q) => -q), ...a, ...hi.reverse()];
}
const terrain = (() => {
  const xs = axis(112, 560), zs = axis(136, 560);
  const NX = xs.length, NZ = zs.length;
  const cnt = NX * NZ;
  const pos = new Float32Array(cnt * 3), col = new Float32Array(cnt * 3), wet = new Float32Array(cnt), kind = new Float32Array(cnt * 4);
  const c = new THREE.Color(), tmp = new THREE.Color();
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const k = j * NX + i, x = xs[i], z = zs[j];
    const cxm = Math.max(-GR + 1, Math.min(GR - 1, x)), czm = Math.max(-GR + 1, Math.min(GR - 1, z));
    let h = height(cxm, czm);
    if (cxm !== x || czm !== z) h += 0;     // beyond the data the land just carries on flat at the edge height
    pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
    const slope = slopeAt(cxm, czm);
    const d = riverDist(cxm, czm);
    const F = waterY(cxm);
    const fa = forestAmount(x, z);
    c.copy(COL.meadow).lerp(COL.ridge, smooth(2, 9, h - F));
    // field patchwork on the flat valley floor
    const lotA = lotAmount(x, z);
    const fieldZone = (1 - lotA) * smooth(2.2, 3.2, d) * (1 - smooth(0.11, 0.2, slope)) * (1 - smooth(0.25, 0.5, fa)) * smooth(VIL.r * 0.7, VIL.r * 1.1, Math.hypot(x - VIL.x, z - VIL.z)) * (1 - smooth(120, 135, Math.max(Math.abs(x), Math.abs(z))));
    wet[k] = 0;
    if (fieldZone > 0) wet[k] = 0.3 * fieldZone;          // field colours are drawn per pixel in the ground shader
    wet[k] = Math.max(wet[k], 1 - smooth(0.8, 2.2, d));
    c.lerp(COL.mud, 1 - smooth(0.8, 1.6, d));
    c.lerp(COL.forest, fa * 0.5);
    c.lerp(COL.rock, smooth(0.35, 0.7, slope) * 0.7);
    const vd = Math.hypot(x - VIL.x, z - VIL.z);
    c.lerp(COL.village, Math.max((1 - smooth(2.5, VIL.r * 0.9, vd)) * 0.5, lotA * 0.7));
    const far = smooth(112, 150, Math.max(Math.abs(x) * 1.2, Math.abs(z)));
    c.lerp(COL.forest, far * 0.7);
    kind[k * 4] = (1 - fieldZone) * (1 - fa) * smooth(1.4, 2.0, d) * (1 - smooth(0.25, 0.5, slope)) * smooth(2.5, VIL.r, vd) * (1 - far);
    kind[k * 4 + 1] = Math.max(0, fieldZone) * (1 - fa);
    kind[k * 4 + 2] = fa * (1 - far * 0.5);
    // baked ambient occlusion and ridge light: hollows a little darker, crests a little brighter
    if (cxm === x && czm === z && Math.abs(x) < 150 && Math.abs(z) < 170) {
      let r1 = 0, r2 = 0;
      for (const [ox, oz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { r1 += height(x + ox * 3, z + oz * 3); r2 += height(x + ox * 10, z + oz * 10); }
      const cv = h - (r1 / 4) * 0.5 - (r2 / 4) * 0.5;
      c.multiplyScalar(1 + Math.max(-0.28, Math.min(0.14, cv * 0.09)));
    }
    c.multiplyScalar(0.92 + 0.16 * vnoise(x * 0.9, z * 0.9));
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  }
  const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6);
  let t = 0;
  for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) {
    const a = j * NX + i, b = a + 1, cc = a + NX, dd = cc + 1;
    idx[t++] = a; idx[t++] = cc; idx[t++] = b; idx[t++] = b; idx[t++] = cc; idx[t++] = dd;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aWet', new THREE.BufferAttribute(wet, 1));
  g.setAttribute('aKind', new THREE.BufferAttribute(kind, 4));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 }), { wet: true, hex: true, ground: true }));
  m.receiveShadow = true; m.castShadow = true;
  window.__terrainTris = idx.length / 3;
  return m;
})();
scene.add(terrain);

/* ============================================================
   6. RIVER: a ribbon that follows the traced river line
   ============================================================ */
const river = (() => {
  const X0 = WX0 + 1, X1 = WX1 - 1, HALF = 1.0, SEG = Math.round((X1 - X0) / 1.0);
  const pos = new Float32Array((SEG + 1) * 2 * 3), uv = new Float32Array((SEG + 1) * 2 * 2);
  let len = 0, px = X0, pz = riverZ(X0);
  for (let s = 0; s <= SEG; s++) {
    const x = X0 + (X1 - X0) * s / SEG, z = riverZ(x), dz = riverDZ(x);
    len += Math.hypot(x - px, z - pz); px = x; pz = z;
    const n = Math.hypot(1, dz), nx = -dz / n, nz = 1 / n;
    const y = waterY(x) + 0.17;
    for (let side = 0; side < 2; side++) {
      const sgn = side ? 1 : -1, k = s * 2 + side;
      pos.set([x + nx * HALF * sgn, y, z + nz * HALF * sgn], k * 3);
      uv.set([len, side], k * 2);
    }
  }
  const idx = [];
  for (let s = 0; s < SEG; s++) { const a = s * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: Object.assign({}, U),
    vertexShader: `varying vec2 vUv; varying vec3 vWPos;
      void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vWPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${GLSL_FOG}
      uniform vec3 uZenith; uniform vec3 uHorizon;
      varying vec2 vUv; varying vec3 vWPos;
      void main(){
        vec2 p = vec2(vUv.x*1.4 - uTime*0.55, vUv.y*3.0);
        float n1 = lt_noise(p*vec2(1.0, 2.2));
        float n2 = lt_noise(p*vec2(2.7, 5.0) + vec2(-uTime*0.3, 3.0));
        vec3 nrm = normalize(vec3((n1-0.5)*0.35 + (n2-0.5)*0.2, 1.0, (n2-0.5)*0.25));
        vec3 v = normalize(vWPos - cameraPosition);
        vec3 r = reflect(v, nrm);
        float fres = 0.04 + 0.7*pow(1.0 - max(dot(-v, nrm), 0.0), 5.0);
        vec3 skyC = mix(fogColAt(r), mix(uHorizon, uZenith, pow(max(r.y,0.0), 0.55)), smoothstep(0.0, 0.3, r.y));
        vec3 deep = vec3(0.014, 0.034, 0.030);
        vec3 c = mix(deep, skyC, 0.09 + fres*0.6);
        c += uSunCol * pow(max(dot(r, uSunDir), 0.0), 220.0) * 2.5;
        float streak = smoothstep(0.62, 0.9, lt_noise(vec2(vUv.x*3.0 - uTime*1.1, vUv.y*9.0)));
        c += vec3(0.05) * streak * (1.0 - abs(vUv.y*2.0-1.0));
        float edge = abs(vUv.y - 0.5);
        vec3 shallow = vec3(0.055, 0.065, 0.040) + uSunCol * 0.03;
        c = mix(c, shallow, smoothstep(0.22, 0.46, edge) * 0.75);
        float foam = smoothstep(0.7, 0.85, lt_noise(vec2(vUv.x*6.0 - uTime*0.8, vUv.y*14.0))) * smoothstep(0.36, 0.47, edge);
        c += vec3(0.16, 0.17, 0.16) * foam * 0.6;
        gl_FragColor = vec4(applyFog(c * cloudShade(vWPos), vWPos), 1.0);
      }`,
  });
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = false;
  return m;
})();
scene.add(river);

/* ============================================================
   7. FORESTS: spruce cones plus autumn broadleaf, instanced in chunks so far chunks are skipped
   ============================================================ */
const treeSpots = { spruce: [], broad: [] }, alleySpots = [];
{
  const X0 = -150, X1 = 150, Z0 = -170, Z1 = 170, step = 0.98;
  for (let z = Z0; z < Z1; z += step) for (let x = X0; x < X1; x += step) {
    const jx = x + (rand() - 0.5) * step * 0.95, jz = z + (rand() - 0.5) * step * 0.95;
    const f = forestAmount(jx, jz);
    if (rand() > f * 0.95 || nearLot(jx, jz, 0.25)) continue;
    const h = height(jx, jz);
    const lowness = 1 - smooth(1.5, 7.0, h - waterY(jx));
    ((rand() < 0.06 + 0.2 * lowness) ? treeSpots.broad : treeSpots.spruce).push([jx, h, jz]);
  }
  // orchards behind the farms, as around every Franconian village
  for (const l of lots) {
    if (l.kind !== 'farm') continue;
    const sn = Math.sin(l.yaw), cs = Math.cos(l.yaw);
    for (let k = 0; k < 5; k++) {
      const lx = (rand() - 0.5) * 2.2, lz = -1.35 - rand() * 1.1;     // units, behind the yard
      const x = l.x + lx * cs + lz * sn, z = l.z - lx * sn + lz * cs;
      if (nearLot(x, z, 0.1) || roadDistAt(x, z) < 0.5 || riverDist(x, z) < 1.6) continue;
      treeSpots.broad.push([x, height(x, z), z]);
    }
  }
  // lone broadleaf trees along roads, field edges and the river for autumn colour
  for (let i = 0; i < 700; i++) {
    const x = (rand() - 0.5) * 240, r = rand(), side = rand() < 0.5 ? -1 : 1;
    const z = r < 0.5 ? riverZ(x) + side * (1.6 + rand() * 1.0) : riverZ(x) + (rand() - 0.5) * 36;
    if (riverDist(x, z) < 1.4 || roadDistAt(x, z) < 0.5 || Math.hypot(x - VIL.x, z - VIL.z) < 3 || Math.hypot(x - BX, z - BZ) < 3) continue;
    if (forestAmount(x, z) > 0.4 || nearLot(x, z, 0.3)) continue;
    treeSpots.broad.push([x, height(x, z), z]);
  }
}
/* Screen-door fade: a material drops pixels in a fine dither pattern, so two versions of a tree can
   cross-fade without sorting transparent objects. inv = true draws the complementary pixels. */
function addFade(mat, inv = false) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, rr) => {
    if (prev) prev(sh, rr);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aFade; varying float vFade;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFade = aFade;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vFade;\nfloat lt_ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + (inv ? 'if (lt_ign(gl_FragCoord.xy) < 1.0 - vFade) discard;' : 'if (lt_ign(gl_FragCoord.xy) > vFade) discard;'));
  };
  const prevKey = mat.customProgramCacheKey && mat.hasOwnProperty('customProgramCacheKey') ? mat.customProgramCacheKey.bind(mat) : () => (prev ? prev.toString() : '');
  mat.customProgramCacheKey = () => 'fade' + (inv ? 'i' : 'n') + '|' + prevKey();
  return mat;
}
// fuller far-tree shapes so the swap to detailed trees is less of a jump
const spruceFar = merge([
  new THREE.ConeGeometry(0.30, 0.55, 7, 1, true).translate(0, 0.38, 0),
  new THREE.ConeGeometry(0.24, 0.48, 7, 1, true).rotateY(0.45).translate(0, 0.66, 0),
  new THREE.ConeGeometry(0.16, 0.42, 6, 1, true).rotateY(0.9).translate(0, 0.95, 0),
  new THREE.CylinderGeometry(0.03, 0.045, 0.3, 4, 1, true).translate(0, 0.15, 0),
]);
const broadFar = merge([
  blob(0.24, 0, 0.66, 0), blob(0.2, 0.17, 0.55, 0.06), blob(0.19, -0.14, 0.57, -0.1), blob(0.17, 0.02, 0.5, 0.18), blob(0.16, -0.05, 0.82, -0.03),
  new THREE.CylinderGeometry(0.03, 0.045, 0.45, 4, 1, true).translate(0, 0.22, 0),
]);
const lodRefs = { spruce: [], broad: [] };    // every simple tree, so close ones can swap to detailed shapes
function chunked(geo, spots, palette, scaleRange, kind) {
  const CH = 60, cells = new Map();
  for (const s of spots) { const key = Math.floor(s[0] / CH) + ',' + Math.floor(s[2] / CH); (cells.get(key) || cells.set(key, []).get(key)).push(s); }
  const out = [];
  for (const list of cells.values()) { const im = makeTrees(geo.clone(), list, palette, scaleRange);
    im.geometry.setAttribute('aFade', new THREE.InstancedBufferAttribute(new Float32Array(list.length).fill(1), 1));
    addFade(im.material, true); addFade(im.customDepthMaterial, true); im.frustumCulled = true; im.computeBoundingSphere(); out.push(im);
    if (kind) list.forEach((sp, i) => lodRefs[kind].push({ x: sp[0], z: sp[2], im, i, f: 0 })); }
  return out;
}
const spruces = chunked(spruceFar, treeSpots.spruce, [lin(0x284422), lin(0x30502a), lin(0x213a1c), lin(0x3a5530)], [1.3, 2.2], 'spruce');
const broads = chunked(broadFar, treeSpots.broad, [lin(0xb5651d), lin(0xc98a2b), lin(0x9c3d1c), lin(0xd4a73c), lin(0x6f7a2c), lin(0x8e5a22)], [1.0, 1.7], 'broad');
spruces.concat(broads).forEach((m) => scene.add(m));
window.__propCounts = { spruce: treeSpots.spruce.length, broad: treeSpots.broad.length };

/* ============================================================
   8. VILLAGE, FARM AND BRIDGE (all stand-ins, labelled on screen)
   ============================================================ */
//@@BUILDINGS@@
// stand-in stone road bridge over the river
const BR_HALF = 4.6;                                   // half length (units) along z
const groundN = height(BX, BZ - BR_HALF), groundS = height(BX, BZ + BR_HALF);
const bridgeTop = Math.max(waterY(BX) + 1.0, groundN + 0.12, groundS + 0.12);
{
  const stone = patch(new THREE.MeshLambertMaterial({ color: 0x8d8a80 }));
  const g = new THREE.Group();
  const L = BR_HALF * 2, Wd = 0.95;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(Wd, 0.24, L), stone); deck.position.y = bridgeTop - 0.12;
  const pl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, L), stone); pl.position.set(-Wd / 2 + 0.05, bridgeTop + 0.1, 0);
  const pr = pl.clone(); pr.position.x = Wd / 2 - 0.05;
  g.add(deck, pl, pr);
  const wy = waterY(BX);
  // two piers in the water, and an abutment at each end that reaches the ground
  for (const dz of [-1.7, 1.7]) { const hgt = bridgeTop - wy + 0.6; const pier = new THREE.Mesh(new THREE.BoxGeometry(Wd * 0.9, hgt, 0.55), stone); pier.position.set(0, bridgeTop - hgt / 2 - 0.2, dz); g.add(pier); }
  for (const [dz, gy] of [[-BR_HALF + 0.3, groundN], [BR_HALF - 0.3, groundS]]) {
    const hgt = Math.max(0.3, bridgeTop - gy + 0.4); const ab = new THREE.Mesh(new THREE.BoxGeometry(Wd, hgt, 0.7), stone); ab.position.set(0, bridgeTop - hgt / 2 - 0.12, dz); g.add(ab);
  }
  const road = new THREE.Mesh(new THREE.BoxGeometry(Wd - 0.26, 0.02, L), patch(new THREE.MeshLambertMaterial({ color: 0x8c7a5a }))); road.position.y = bridgeTop + 0.01; g.add(road);
  g.position.set(BX, 0, BZ);
  g.traverse((o) => { o.castShadow = o.receiveShadow = true; });
  scene.add(g);
}
// fruit trees lining stretches of road, as on Franconian country roads
for (const line of [roadA, roadB]) {
  for (let k = 0; k < line.length; k += 4) {
    const [x, z] = line[k], [x2, z2] = line[Math.min(line.length - 1, k + 1)];
    if (vnoise(x * 0.05 + 3, z * 0.05) < 0.5) continue;
    const dl = Math.hypot(x2 - x, z2 - z) || 1, nx = -(z2 - z) / dl, nz = (x2 - x) / dl;
    for (const sd of [-1, 1]) {
      const tx = x + nx * sd * 0.62, tz = z + nz * sd * 0.62;
      if (riverDist(tx, tz) < 2 ||  Math.abs(tz - BZ) < 5 && Math.abs(tx - BX) < 3 || nearLot(tx, tz, 0.15) || rand() < 0.15) continue;
      alleySpots.push([tx, height(tx, tz), tz]);
    }
  }
}
if (alleySpots.length) chunked(broadFar, alleySpots, [lin(0x8e9a3a), lin(0xb5651d), lin(0xc98a2b), lin(0x6f7a2c)], [0.7, 0.95], 'broad').forEach((m) => scene.add(m));
window.__propCounts.alley = alleySpots.length;
//@@DETAIL_TREES@@

const smoke = (() => {
  const chimneys = houses.filter((h, i) => i % 3 === 0).slice(0, 8).map((h) => h.chimTop.clone());
  const PER = 34, n = chimneys.length * PER;
  const pos = new Float32Array(n * 3), seed = new Float32Array(n);
  chimneys.forEach((c, ci) => { for (let k = 0; k < PER; k++) { const i = ci * PER + k; pos.set([c.x, c.y, c.z], i * 3); seed[i] = k / PER + rand() * 0.02; } });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uPx: { value: 1 } }, U),
    transparent: true, depthWrite: false,
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPx; uniform vec3 uSunDir;
      varying float vA; varying vec3 vWPos; varying float vLit;
      void main(){
        float age = fract(uTime*0.07 + aSeed);
        float wob = sin(aSeed*91.0 + uTime*0.8);
        vec3 p = position + vec3(age*age*4.2 + wob*0.2*age, age*2.6, age*1.1 + cos(aSeed*53.0)*0.25*age);
        vec4 w = modelMatrix * vec4(p, 1.0); vWPos = w.xyz;
        vec4 mv = viewMatrix * w;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (0.14 + age*1.0) * uPx / max(-mv.z, 0.1);
        vA = smoothstep(0.0, 0.1, age) * (1.0 - age) * (1.0 - age) * 0.3;
        vLit = 0.5 + 0.5*age;
      }`,
    fragmentShader: `${GLSL_FOG}
      varying float vA; varying vec3 vWPos; varying float vLit;
      void main(){
        vec2 q = gl_PointCoord - 0.5; float r = dot(q,q)*4.0;
        float a = (1.0 - r) * vA; if (a <= 0.003) discard;
        vec3 c = mix(vec3(0.12,0.12,0.13), uFogCol*0.75 + uSunCol*0.1, vLit);
        gl_FragColor = vec4(applyFog(c, vWPos), a);
      }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false; pts.renderOrder = 5;
  return pts;
})();
scene.add(smoke);

const bridgeLabelPos = new THREE.Vector3(BX, bridgeTop + 0.6, BZ);
const churchLot = lots.find((l) => l.kind === 'church') || VIL;
const villageLabelPos = new THREE.Vector3(churchLot.x, VIL.y + 3.6, churchLot.z);
const northLot = lots.find((l) => l.z < riverZ(l.x)) || { x: farmX, z: farmZ };
const farmLabelPos = new THREE.Vector3(northLot.x, height(northLot.x, northLot.z) + 1.8, northLot.z);
