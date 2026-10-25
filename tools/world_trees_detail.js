
/* ============================================================
   7b. DETAILED TREES NEAR THE CAMERA
       Shapes made with EZ-Tree (MIT, at build time: tools/make_trees.mjs -> data/trees.*).
       Leaf and bark textures are drawn here in code. Close trees swap from the simple shapes to these,
       far trees stay simple so the phone keeps its frame rate. Works on any map that uses chunked().
   ============================================================ */
const TREEJ = await (await fetch('./data/trees.json')).json();
const TREEB = await (await fetch('./data/trees.bin')).arrayBuffer();
const tf32 = ([o, n]) => new Float32Array(TREEB, o, n), tu16 = ([o, n]) => new Uint16Array(TREEB, o, n);

const leafTex = (() => {      // left half: spruce sprigs, right half: broad-leaf cluster
  const W = 512, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let sd = 12345; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  g.lineCap = 'round';
  for (let k = 0; k < 9; k++) {               // sprigs fanning up from the bottom
    const x0 = 128 + (r() - 0.5) * 40, ang = (r() - 0.5) * 1.3, len = 150 + r() * 90;
    let x = x0, y = 255, a = -Math.PI / 2 + ang;
    const steps = 22;
    for (let s = 0; s < steps; s++) {
      const nx = x + Math.cos(a) * len / steps, ny = y + Math.sin(a) * len / steps;
      const v = 110 + r() * 60; g.strokeStyle = `rgb(${v * 0.82},${v},${v * 0.7})`; g.lineWidth = 3.2 - s * 0.1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke();
      const nl = 26 * (1 - s / steps * 0.6);
      for (const sideA of [-1, 1]) for (let m = 0; m < 3; m++) {
        const na = a + sideA * (0.8 + r() * 0.4), px = x + (nx - x) * m / 3, py = y + (ny - y) * m / 3;
        const vv = 130 + r() * 80; g.strokeStyle = `rgb(${vv * 0.85},${vv},${vv * 0.72})`; g.lineWidth = 1.6 + r();
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(na) * nl * (0.7 + r() * 0.5), py + Math.sin(na) * nl * (0.7 + r() * 0.5)); g.stroke();
      }
      x = nx; y = ny; a += (r() - 0.5) * 0.12;
    }
  }
  for (let k = 0; k < 46; k++) {              // broad leaves: ovals with a midrib, clustered
    const rr = Math.sqrt(r()) * 105, t = r() * Math.PI * 2;
    const cx = 384 + Math.cos(t) * rr, cy = 120 + Math.sin(t) * rr * 0.95;
    const L = 22 + r() * 22, Wd = L * (0.45 + r() * 0.2), rot = r() * Math.PI * 2;
    const v = 185 + r() * 70;
    g.save(); g.translate(cx, cy); g.rotate(rot);
    g.fillStyle = `rgb(${v},${v * 0.97},${v * 0.86})`;
    g.beginPath(); g.ellipse(0, 0, L / 2, Wd / 2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(90,80,60,0.55)`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-L / 2, 0); g.lineTo(L / 2, 0); g.stroke();
    g.restore();
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
})();
const barkTex = (() => {
  const W = 64, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'), img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const f = 0.5 + 0.5 * Math.sin(x * 0.6 + Math.sin(y * 0.05 + x * 0.3) * 2.0) * (0.6 + 0.4 * vnoise(x * 0.3, y * 0.05));
    const v = 120 + 110 * f * (0.8 + 0.2 * vnoise(x * 0.9, y * 0.9));
    const k = (y * W + x) * 4; img.data[k] = v; img.data[k + 1] = v * 0.95; img.data[k + 2] = v * 0.88; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
})();
function leafMaterial() {
  const m = patch(new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: 0.42, side: THREE.DoubleSide, alphaToCoverage: true }), { wind: true, flutter: true });
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, rr) => {     // keep the soft crown lighting on both sides of each leaf card
    prev(sh, rr);
    sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n normal = normalize(vNormal);');
  };
  return m;
}
const detailSets = { spruce: [], broad: [] };
const DETAIL_CAP = { spruce: 42, broad: 30 };   // per shape variant
{
  const barkMatS = patch(new THREE.MeshLambertMaterial({ map: barkTex, vertexColors: true, color: 0x8a6e58 }), { wind: true });
  const barkMatB = patch(new THREE.MeshLambertMaterial({ map: barkTex, vertexColors: true, color: 0x8f8678 }), { wind: true });
  const leafMat = leafMaterial();
  const leafDepth = addFade(patchDepth(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: 0.42 })));
  const barkDepth = addFade(patchDepth(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })));
  addFade(barkMatS); addFade(barkMatB); addFade(leafMat);
  for (const v of TREEJ.variants) {
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(tf32(v.bark.pos), 3));
    bg.setAttribute('normal', new THREE.BufferAttribute(tf32(v.bark.nor), 3));
    bg.setAttribute('uv', new THREE.BufferAttribute(tf32(v.bark.uv), 2));
    const sh = tf32(v.bark.shade), col = new Float32Array(sh.length * 3);
    for (let i = 0; i < sh.length; i++) col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = sh[i];
    bg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    bg.setIndex(new THREE.BufferAttribute(tu16(v.bark.idx), 1));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(tf32(v.leaves.pos), 3));
    lg.setAttribute('normal', new THREE.BufferAttribute(tf32(v.leaves.nor), 3));
    const uv = new Float32Array(tf32(v.leaves.uv));
    for (let i = 0; i < uv.length; i += 2) uv[i] = uv[i] * 0.5 + (v.kind === 'broad' ? 0.5 : 0);
    lg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    lg.setIndex(new THREE.BufferAttribute(tu16(v.leaves.idx), 1));
    const cap = DETAIL_CAP[v.kind];
    const bark = new THREE.InstancedMesh(bg, v.kind === 'spruce' ? barkMatS : barkMatB, cap);
    const leaves = new THREE.InstancedMesh(lg, leafMat, cap);
    bg.setAttribute('aFade', new THREE.InstancedBufferAttribute(new Float32Array(cap).fill(1), 1));
    lg.setAttribute('aFade', new THREE.InstancedBufferAttribute(new Float32Array(cap).fill(1), 1));
    leaves.customDepthMaterial = leafDepth; bark.customDepthMaterial = barkDepth;
    for (const m of [bark, leaves]) { m.count = 0; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; scene.add(m); }   // the simple tree keeps casting the shadow (much cheaper)
    leaves.setColorAt(0, new THREE.Color(1, 1, 1)); leaves.instanceColor.needsUpdate = true;
    detailSets[v.kind].push({ bark, leaves, cap });
  }
}
// spatial buckets of every simple tree, so the nearest ones can be found quickly
const LOD_CELL = 8, lodBuckets = new Map();
for (const kind of ['spruce', 'broad']) for (const ref of lodRefs[kind]) {
  ref.kind = kind; ref.v = Math.floor(hash2(Math.round(ref.x * 10), Math.round(ref.z * 10)) * detailSets[kind].length);
  const key = Math.floor(ref.x / LOD_CELL) + ',' + Math.floor(ref.z / LOD_CELL);
  (lodBuckets.get(key) || lodBuckets.set(key, []).get(key)).push(ref);
}
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
const lodFrustum = new THREE.Frustum(), lodPM = new THREE.Matrix4(), lodSphere = new THREE.Sphere(new THREE.Vector3(), 2.2);
let lodScale = 1;   // drops automatically if the phone struggles (see the frame loop)
let lodWant = new Set(), lodActive = new Set(), lodLast = { t: -1, x: 1e9, z: 1e9, d: 0 }, lodTris = 0, lodPrevT = 0;
const FADE_S = 0.7;     // seconds for a tree to cross-fade between its simple and detailed shape
function selectTrees(now) {
  const camX = camera.position.x, camZ = camera.position.z;
  const on = cam.dist < 44;
  const cx = mix(cam.tx, camX, 0.25), cz = mix(cam.tz, camZ, 0.25);
  if (now - lodLast.t < 250 || (Math.hypot(cx - lodLast.x, cz - lodLast.z) < 1.5 && Math.abs(cam.dist - lodLast.d) < 2 && now - lodLast.t < 1500)) return;
  lodLast = { t: now, x: cx, z: cz, d: cam.dist };
  const R = on ? Math.min(40, 14 + cam.dist * 0.7) : 0;
  const pick = { spruce: [], broad: [] };
  if (on) {
    camera.updateMatrixWorld(); lodPM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); lodFrustum.setFromProjectionMatrix(lodPM);
    const c0 = Math.floor((cx - R) / LOD_CELL), c1 = Math.floor((cx + R) / LOD_CELL), r0 = Math.floor((cz - R) / LOD_CELL), r1 = Math.floor((cz + R) / LOD_CELL);
    for (let a = c0; a <= c1; a++) for (let b = r0; b <= r1; b++) {
      const list = lodBuckets.get(a + ',' + b); if (!list) continue;
      for (const ref of list) { const d = Math.hypot(ref.x - cx, ref.z - cz); if (d >= R) continue; lodSphere.center.set(ref.x, height(ref.x, ref.z) + 0.8, ref.z); if (lodFrustum.intersectsSphere(lodSphere)) pick[ref.kind].push([d, ref]); }
    }
  }
  lodWant = new Set();
  for (const kind of ['spruce', 'broad']) {
    pick[kind].sort((p, q) => p[0] - q[0]);
    const used = detailSets[kind].map(() => 0);
    for (const [, ref] of pick[kind]) { const cap = Math.round(detailSets[kind][ref.v].cap * lodScale * 0.85); if (used[ref.v] >= cap) continue; used[ref.v]++; lodWant.add(ref); }
  }
  for (const ref of lodWant) lodActive.add(ref);
}
function updateTreeLOD(now) {
  selectTrees(now);
  const dt = Math.min(0.1, (now - lodPrevT) / 1000); lodPrevT = now;
  const counts = { spruce: detailSets.spruce.map(() => 0), broad: detailSets.broad.map(() => 0) };
  const col = new THREE.Color(), touched = new Set(), gone = [];
  for (const ref of lodActive) {
    const target = lodWant.has(ref) ? 1 : 0;
    ref.f = Math.max(0, Math.min(1, ref.f + (target ? 1 : -1) * dt / FADE_S));
    if (!ref.saved) { ref.saved = new THREE.Matrix4(); ref.im.getMatrixAt(ref.i, ref.saved); }
    const lowFade = ref.im.geometry.attributes.aFade;
    if (lowFade.array[ref.i] !== 1 - ref.f) { lowFade.array[ref.i] = 1 - ref.f; touched.add(lowFade); }
    if (ref.f <= 0 && !target) { gone.push(ref); continue; }
    const set = detailSets[ref.kind][ref.v], k = counts[ref.kind][ref.v];
    if (k >= set.cap) continue;
    set.bark.setMatrixAt(k, ref.saved); set.leaves.setMatrixAt(k, ref.saved);
    ref.im.getColorAt(ref.i, col); set.leaves.setColorAt(k, col.multiplyScalar(ref.kind === 'spruce' ? 1.15 : 1.3));
    set.bark.geometry.attributes.aFade.array[k] = ref.f; set.leaves.geometry.attributes.aFade.array[k] = ref.f;
    counts[ref.kind][ref.v] = k + 1;
  }
  for (const ref of gone) lodActive.delete(ref);
  for (const a of touched) a.needsUpdate = true;
  lodTris = 0;
  for (const kind of ['spruce', 'broad']) detailSets[kind].forEach((set, vi) => {
    const n = counts[kind][vi];
    if (n === 0 && set.bark.count === 0) return;
    set.bark.count = set.leaves.count = n;
    set.bark.instanceMatrix.needsUpdate = set.leaves.instanceMatrix.needsUpdate = true;
    set.bark.geometry.attributes.aFade.needsUpdate = set.leaves.geometry.attributes.aFade.needsUpdate = true;
    if (set.leaves.instanceColor) set.leaves.instanceColor.needsUpdate = true;
    lodTris += n * TREEJ.variants.filter((v) => v.kind === kind)[vi].tris;
  });
}
