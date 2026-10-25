
/* ============================================================
   5. TERRAIN: one mesh, fine over the board, stretched out to the horizon
   ============================================================ */
const lin = (hex) => new THREE.Color(hex);
const COL = {
  meadow: lin(0x657838), pasture: lin(0x536b30), plowed: lin(0x4a3a2a), stubble: lin(0x9c8650),
  wheat: lin(0x6c8838), fallow: lin(0x7d6c45), forest: lin(0x2b2a1b), rock: lin(0x726c62),
  road: lin(0x8c8271), mud: lin(0x3b3226), village: lin(0x675d47), ridge: lin(0x4b4a2c),
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
    const fieldZone = (1 - smooth(12, 20, d)) * smooth(2.2, 3.2, d) * (1 - smooth(0.07, 0.17, slope));
    wet[k] = 0;
    if (fieldZone > 0) {
      const ca = Math.cos(0.35), sa = Math.sin(0.35);
      const fu = Math.floor((x * ca - z * sa) / 6.0), fv = Math.floor((x * sa + z * ca) / 4.0);
      const r = hash2(fu, fv);
      const fc = r < 0.25 ? COL.plowed : r < 0.45 ? COL.stubble : r < 0.65 ? COL.wheat : r < 0.82 ? COL.pasture : COL.fallow;
      tmp.copy(fc).multiplyScalar(0.92 + 0.16 * hash2(fu * 7 + 3, fv * 5 + 1));
      c.lerp(tmp, fieldZone);
      wet[k] = fc === COL.plowed ? 0.75 : 0.35;
    }
    wet[k] = Math.max(wet[k], 1 - smooth(0.8, 2.2, d));
    c.lerp(COL.mud, 1 - smooth(0.8, 1.6, d));
    c.lerp(COL.forest, fa * 0.9);
    c.lerp(COL.rock, smooth(0.35, 0.7, slope) * 0.7);
    const vd = Math.hypot(x - VIL.x, z - VIL.z);
    c.lerp(COL.village, (1 - smooth(2.5, VIL.r * 0.9, vd)) * 0.6);
    const far = smooth(112, 150, Math.max(Math.abs(x) * 1.2, Math.abs(z)));
    c.lerp(COL.forest, far * 0.7);
    kind[k * 4] = (1 - fieldZone) * (1 - fa) * smooth(1.4, 2.0, d) * (1 - smooth(0.25, 0.5, slope)) * smooth(2.5, VIL.r, vd) * (1 - far);
    kind[k * 4 + 1] = Math.max(0, fieldZone) * (1 - fa);
    c.multiplyScalar(0.9 + 0.2 * vnoise(x * 0.9, z * 0.9));
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
        vec3 deep = vec3(0.012, 0.024, 0.020);
        vec3 c = mix(deep, skyC, fres*0.6);
        c += uSunCol * pow(max(dot(r, uSunDir), 0.0), 220.0) * 2.5;
        float streak = smoothstep(0.62, 0.9, lt_noise(vec2(vUv.x*3.0 - uTime*1.1, vUv.y*9.0)));
        c += vec3(0.05) * streak * (1.0 - abs(vUv.y*2.0-1.0));
        vec3 mud = vec3(0.05, 0.04, 0.025) + uSunCol * 0.035;
        c = mix(c, mud, smoothstep(0.30, 0.5, abs(vUv.y - 0.5)) * 0.8);
        gl_FragColor = vec4(applyFog(c, vWPos), 1.0);
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
const treeSpots = { spruce: [], broad: [] };
{
  const X0 = -150, X1 = 150, Z0 = -170, Z1 = 170, step = 1.15;
  for (let z = Z0; z < Z1; z += step) for (let x = X0; x < X1; x += step) {
    const jx = x + (rand() - 0.5) * step * 0.95, jz = z + (rand() - 0.5) * step * 0.95;
    const f = forestAmount(jx, jz);
    if (rand() > f * 0.95) continue;
    const h = height(jx, jz);
    const lowness = 1 - smooth(1.5, 7.0, h - waterY(jx));
    ((rand() < 0.06 + 0.2 * lowness) ? treeSpots.broad : treeSpots.spruce).push([jx, h, jz]);
  }
  // lone broadleaf trees along roads, field edges and the river for autumn colour
  for (let i = 0; i < 700; i++) {
    const x = (rand() - 0.5) * 240, r = rand(), side = rand() < 0.5 ? -1 : 1;
    const z = r < 0.5 ? riverZ(x) + side * (1.6 + rand() * 1.0) : riverZ(x) + (rand() - 0.5) * 36;
    if (riverDist(x, z) < 1.4 || roadDistAt(x, z) < 0.5 || Math.hypot(x - VIL.x, z - VIL.z) < 3 || Math.hypot(x - BX, z - BZ) < 3) continue;
    if (forestAmount(x, z) > 0.4) continue;
    treeSpots.broad.push([x, height(x, z), z]);
  }
}
function chunked(geo, spots, palette, scaleRange) {
  const CH = 60, cells = new Map();
  for (const s of spots) { const key = Math.floor(s[0] / CH) + ',' + Math.floor(s[2] / CH); (cells.get(key) || cells.set(key, []).get(key)).push(s); }
  const out = [];
  for (const list of cells.values()) { const im = makeTrees(geo, list, palette, scaleRange); im.frustumCulled = true; im.computeBoundingSphere(); out.push(im); }
  return out;
}
const spruces = chunked(spruceGeo, treeSpots.spruce, [lin(0x284422), lin(0x30502a), lin(0x213a1c), lin(0x3a5530)], [1.3, 2.2]);
const broads = chunked(broadGeo, treeSpots.broad, [lin(0xb5651d), lin(0xc98a2b), lin(0x9c3d1c), lin(0xd4a73c), lin(0x6f7a2c), lin(0x8e5a22)], [1.0, 1.7]);
spruces.concat(broads).forEach((m) => scene.add(m));
window.__propCounts = { spruce: treeSpots.spruce.length, broad: treeSpots.broad.length };

/* ============================================================
   8. VILLAGE, FARM AND BRIDGE (all stand-ins, labelled on screen)
   ============================================================ */
const houses = [];
function placeHouses(cx, cz, n, rad, roadYawZ) {
  for (let t = 0; t < 500 && n > 0; t++) {
    const a = rand() * Math.PI * 2, r = 1.8 + Math.sqrt(rand()) * rad;
    const x = cx + Math.cos(a) * r * 1.2, z = cz + Math.sin(a) * r * 0.9;
    if (riverDist(x, z) < 3 || roadDistAt(x, z) < 0.7 || Math.hypot(x - BX, z - BZ) < 4) continue;
    if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < 1.9)) continue;
    const yaw = -Math.atan2(riverDZ(x), 1) + (rand() < 0.5 ? 0 : Math.PI / 2);
    const big = rand() < 0.25;
    houses.push({ x, z, y: height(x, z), yaw, w: (big ? 0.56 : 0.37) * 1.7, d: (big ? 0.8 : 0.5) * 1.7, hgt: (big ? 0.3 : 0.27) * 1.7 });
    n--;
  }
}
placeHouses(VIL.x, VIL.z, 20, 4.2);
placeHouses(farmX, farmZ, 4, 2.2);
{
  const wallMat = patch(new THREE.MeshLambertMaterial({ color: 0xffffff }));
  const roofMat = patch(new THREE.MeshLambertMaterial({ color: 0xffffff }));
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), wallMat, houses.length);
  const roofs = new THREE.InstancedMesh(roofGeometry(), roofMat, houses.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const wallCols = [lin(0xe6e0d0), lin(0xd9cfb8), lin(0xcbbf9f), lin(0xe8e4da)];
  const roofCols = [lin(0x7a3324), lin(0x5b2a20), lin(0x3e3a38), lin(0x8a4630)];
  houses.forEach((h, i) => {
    q.setFromAxisAngle(up, h.yaw);
    m4.compose(p.set(h.x, h.y - 0.08, h.z), q, s.set(h.w, h.hgt + 0.08, h.d)); walls.setMatrixAt(i, m4);
    walls.setColorAt(i, wallCols[i % 4]);
    m4.compose(p.set(h.x, h.y + h.hgt, h.z), q, s.set(h.w * 1.22, h.w * 0.85, h.d * 1.12)); roofs.setMatrixAt(i, m4);
    roofs.setColorAt(i, roofCols[(i * 3) % 4]);
  });
  [walls, roofs].forEach((m) => { m.castShadow = m.receiveShadow = true; scene.add(m); });

  // church: nave, tower and spire (scaled up so it reads from the overview)
  const cy = VIL.y;
  const white = patch(new THREE.MeshLambertMaterial({ color: 0xe9e3d3 }));
  const dark = patch(new THREE.MeshLambertMaterial({ color: 0x3b3735 }));
  const nave = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.9).translate(0, 0.17, 0), white);
  const naveRoof = new THREE.Mesh(roofGeometry(), dark); naveRoof.scale.set(0.48, 0.32, 0.95); naveRoof.position.y = 0.34;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.26).translate(0, 0.375, 0), white); tower.position.z = -0.55;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4).rotateY(Math.PI / 4).translate(0, 0.3, 0), dark); spire.position.set(0, 0.75, -0.55);
  const church = new THREE.Group(); church.add(nave, naveRoof, tower, spire);
  church.scale.setScalar(2.2);
  church.position.set(VIL.x, cy - 0.08, VIL.z); church.rotation.y = 0.3;
  church.traverse((o) => { o.castShadow = o.receiveShadow = true; });
  scene.add(church);
}
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
const bridgeLabelPos = new THREE.Vector3(BX, bridgeTop + 0.6, BZ);
const villageLabelPos = new THREE.Vector3(VIL.x, VIL.y + 3.2, VIL.z);
const farmLabelPos = new THREE.Vector3(farmX, height(farmX, farmZ) + 1.6, farmZ);
