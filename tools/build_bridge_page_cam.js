
/* ============================================================
   14. CAMERA: drag to turn, pinch to zoom, swoop low when close
   ============================================================ */
const cam = { yaw: 1.75, pitchOff: 0, dist: 95, tx: 0, tz: 4 };
let camAnim = null;
const DMIN = 4, DMAX = 150;
function autoPitch(dist) { const t = smooth(0, 1, (dist - DMIN) / (DMAX - DMIN)); return mix(0.1, cur.pitchMax, Math.pow(t, 0.7)); }
let groundY = height(cam.tx, cam.tz), camPitchUsed = 0.5;
function updateCamera(dt) {
  if (camAnim) {
    camAnim.t = Math.min(1, camAnim.t + dt / camAnim.dur);
    const e = camAnim.t < 0.5 ? 4 * camAnim.t ** 3 : 1 - Math.pow(-2 * camAnim.t + 2, 3) / 2;
    for (const k of ['yaw', 'pitchOff', 'dist', 'tx', 'tz']) cam[k] = mix(camAnim.from[k], camAnim.to[k], e);
    if (camAnim.t >= 1) camAnim = null;
  }
  cam.tx = Math.max(-BOARD.hx, Math.min(BOARD.hx, cam.tx)); cam.tz = Math.max(-BOARD.hz, Math.min(BOARD.hz, cam.tz));
  cam.dist = Math.max(DMIN, Math.min(DMAX, cam.dist));
  let pitch = Math.max(0.04, Math.min(1.35, autoPitch(cam.dist) + cam.pitchOff));
  groundY += (height(cam.tx, cam.tz) - groundY) * Math.min(1, dt * 4);
  const ty = groundY + 0.3;
  const dist = cam.dist * cur.distMul;
  let px, py, pz;
  for (let it = 0; it < 40; it++) {
    const cp = Math.cos(pitch);
    px = cam.tx + Math.cos(cam.yaw) * cp * dist; pz = cam.tz + Math.sin(cam.yaw) * cp * dist;
    py = ty + Math.sin(pitch) * dist;
    let clear = py > height(px, pz) + 0.6 + 1.8 * forestAmount(px, pz);
    for (let f = 0.25; clear && f < 0.95; f += 0.25) {
      const sx = mix(px, cam.tx, f), sz = mix(pz, cam.tz, f);
      clear = mix(py, ty, f) > height(sx, sz) + 0.3;
    }
    if (clear || pitch > 1.3) break;
    pitch += 0.03;
  }
  camPitchUsed += (pitch - camPitchUsed) * Math.min(1, dt * 5);
  { const cp = Math.cos(camPitchUsed);
    px = cam.tx + Math.cos(cam.yaw) * cp * dist; pz = cam.tz + Math.sin(cam.yaw) * cp * dist;
    py = Math.max(ty + Math.sin(camPitchUsed) * dist, height(px, pz) + 0.5); }
  camera.position.set(px, py, pz);
  camera.lookAt(cam.tx, ty, cam.tz);
  // the shadow box follows what you are looking at, snapped to its own pixel grid so it does not shimmer
  const half = Math.max(16, Math.min(80, cam.dist * 0.5));
  const stp = (2 * half) / 2048;
  const sx = Math.round(cam.tx / stp) * stp, sz = Math.round(cam.tz / stp) * stp;
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, far: 400 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.target.position.set(sx, groundY, sz);
  sun.position.copy(sunDir).multiplyScalar(160).add(sun.target.position);
}
function flyTo(to, dur = 1.6) { camAnim = { t: 0, dur, from: { ...cam }, to: { ...cam, ...to } }; }
const VIEWS = {
  over: { dist: 95, pitchOff: 0, tx: 0, tz: 4, yaw: 1.75 },
  low:  { dist: 15, pitchOff: -0.08, tx: BX, tz: BZ - 1.5, yaw: 1.05 },
};
document.getElementById('vOver').addEventListener('click', () => flyTo(VIEWS.over, 2.2));
document.getElementById('vLow').addEventListener('click', () => flyTo(VIEWS.low, 2.2));
const gridBtn = document.getElementById('vGrid');
let gridOn = true;
gridBtn.addEventListener('click', () => { gridOn = !gridOn; gridBtn.classList.toggle('on', gridOn); });

const ndc = new THREE.Vector2(), ray = new THREE.Raycaster();
function pickGround(clientX, clientY) {
  ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const o = ray.ray.origin, d = ray.ray.direction;
  let prev = 0;
  for (let t = 0.3; t < 700; t += 0.3 + t * 0.012) {
    const x = o.x + d.x * t, z = o.z + d.z * t, y = o.y + d.y * t;
    if (y < height(x, z)) {
      let lo = prev, hi = t;
      for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; (o.y + d.y * m < height(o.x + d.x * m, o.z + d.z * m)) ? hi = m : lo = m; }
      return new THREE.Vector3(o.x + d.x * hi, o.y + d.y * hi, o.z + d.z * hi);
    }
    prev = t;
  }
  return null;
}
let touchHeld = false, touchFade = 0;
function showHexAt(p) { if (p) { U.uTouch.value.copy(p); touchHeld = true; } }

const pointers = new Map();
let lastPinch = null;
const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  camAnim = null; lastPinch = null;
  if (pointers.size === 1) showHexAt(pickGround(e.clientX, e.clientY));
  hideHint();
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (pointers.size === 1) {
    cam.yaw += dx * 0.0065;
    cam.pitchOff = Math.max(-0.35, Math.min(0.45, cam.pitchOff + dy * 0.004));
    showHexAt(pickGround(e.clientX, e.clientY));
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (lastPinch) {
      cam.dist *= lastPinch.dist / Math.max(dist, 1);
      const pdx = mx - lastPinch.mx, pdy = my - lastPinch.my, s = cam.dist * cur.distMul * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.0047;
      const fx = -Math.cos(cam.yaw), fz = -Math.sin(cam.yaw);
      cam.tx += (fz * pdx + fx * pdy) * s; cam.tz += (-fx * pdx + fz * pdy) * s;
    }
    lastPinch = { dist, mx, my };
    touchHeld = false;
  }
});
const endPointer = (e) => { pointers.delete(e.pointerId); lastPinch = null; if (pointers.size === 0) touchHeld = false; };
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); camAnim = null; cam.dist *= Math.exp(e.deltaY * 0.0012); }, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());

const hint = document.getElementById('hint');
let hintGone = false;
function hideHint() { if (!hintGone) { hintGone = true; hint.style.opacity = 0; } }
setTimeout(hideHint, 9000);

/* ============================================================
   15. SIZE, RESOLUTION AND THE FRAME LOOP
   ============================================================ */
const MAX_PR = Math.min(window.devicePixelRatio || 1, 2);
let pr = FIXED_PR || MAX_PR;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(pr); renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const W = Math.floor(w * pr), H = Math.floor(h * pr);
  rtScene.setSize(W, H);
  const qw = Math.max(1, Math.floor(W / 4)), qh = Math.max(1, Math.floor(H / 4));
  rtA.setSize(qw, qh); rtB.setSize(qw, qh);
  downMat.uniforms.uTexel.value.set(1 / W, 1 / H);
  post.uniforms.uRes.value.set(W, H);
  smoke.material.uniforms.uPx.value = H * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
}
addEventListener('resize', resize);
resize();

const stats = document.getElementById('stats');
const frameMs = [], sceneInfo = { calls: 0, tris: 0 };
let lastT = performance.now(), lastAdjust = lastT, frames = 0;
const tags = [[document.getElementById('tag0'), bridgeLabelPos], [document.getElementById('tag1'), villageLabelPos], [document.getElementById('tag2'), farmLabelPos]];
window.__lt = { U, flyTo, VIEWS, cam, height, riverZ, VIL, BX, BZ, BOARD, showHexAt: (x, z) => { U.uTouch.value.set(x, height(x, z), z); touchHeld = true; touchFade = 1; },
  hideHex: () => { touchHeld = false; touchFade = 0; }, setGrid: (on) => { gridOn = on; gridBtn.classList.toggle('on', on); },
  stats: () => ({ avgMs: frameMs.reduce((a, b) => a + b, 0) / Math.max(1, frameMs.length), pr, frames,
    trees: treeSpots.spruce.length + treeSpots.broad.length, calls: sceneInfo.calls, tris: sceneInfo.tris, terrainTris: window.__terrainTris, props: window.__propCounts, houses: houses.length, halfFloat: canHalf }),
  snapLook: () => {} };
const gridTarget = () => (gridOn ? 1 : 0);
function frame() {
  const now = performance.now();
  const dt = Math.min(0.1, (now - lastT) / 1000);
  frameMs.push(now - lastT); if (frameMs.length > 60) frameMs.shift();
  lastT = now; frames++;
  U.uTime.value += dt;
  applyLook();
  touchFade += ((touchHeld ? 1 : 0) - touchFade) * Math.min(1, dt * (touchHeld ? 8 : 1.6));
  U.uTouchAmt.value = touchFade;
  U.uGridAll.value += (gridTarget() - U.uGridAll.value) * Math.min(1, dt * 6);
  updateCamera(dt);
  sky.position.copy(camera.position);

  renderer.setRenderTarget(rtScene);
  renderer.render(scene, camera);
  sceneInfo.calls = renderer.info.render.calls; sceneInfo.tris = renderer.info.render.triangles;
  downMat.uniforms.tSrc.value = rtScene.texture; fsPass(downMat, rtA);
  for (let i = 0; i < 2; i++) {
    blurMat.uniforms.tSrc.value = rtA.texture; blurMat.uniforms.uDir.value.set(1.6 / rtA.width, 0); fsPass(blurMat, rtB);
    blurMat.uniforms.tSrc.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, 1.6 / rtA.height); fsPass(blurMat, rtA);
  }
  fsPass(post, null);

  for (const [el, wp] of tags) {
    const p = wp.clone().project(camera);
    if (p.z > 1 || Math.abs(p.x) > 1.05 || Math.abs(p.y) > 1.05 || cam.dist < 12) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.transform = `translate(${(p.x * 0.5 + 0.5) * innerWidth}px, ${(-p.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -120%)`;
  }

  if (!FIXED_PR && now - lastAdjust > 2500 && frameMs.length >= 60) {
    const avg = frameMs.reduce((a, b) => a + b, 0) / frameMs.length;
    if (avg > 38 && pr > 1) { pr = Math.max(1, pr - 0.25); resize(); lastAdjust = now; }
    else if (avg < 20 && pr < MAX_PR && now - lastAdjust > 8000) { pr = Math.min(MAX_PR, pr + 0.25); resize(); lastAdjust = now; }
  }
  if (frames % 15 === 0) {
    const avg = frameMs.reduce((a, b) => a + b, 0) / frameMs.length;
    stats.textContent = `${Math.round(1000 / avg)} fps · sharpness ${pr.toFixed(2)}x`;
  }
}
renderer.setAnimationLoop(frame);
window.__lt.pause = () => renderer.setAnimationLoop(null);
window.__lt.resume = () => { lastT = performance.now(); renderer.setAnimationLoop(frame); };
</script>
</body>
</html>
