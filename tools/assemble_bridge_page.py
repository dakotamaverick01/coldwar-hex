"""Builds mission-bridge.html from look-test.html pieces plus tools/build_bridge_page_*. Run from repo root."""
import re
L = open('look-test.html').read().split('\n')
sl = lambda a, b: '\n'.join(L[a - 1:b])           # 1-indexed inclusive
head = open('tools/build_bridge_page_head.html').read()
noise = sl(101, 119)
render = sl(165, 400)
helpers = sl(563, 596)
maketrees = sl(619, 635)
roof = sl(643, 649)
looks_post = sl(991, 1146)
world = open('tools/build_bridge_page_world.js').read()
scene = open('tools/build_bridge_page_scene.js').read().replace('//@@DETAIL_TREES@@', open('tools/world_trees_detail.js').read())
cam = open('tools/build_bridge_page_cam.js').read()

# ---- render section edits ----
render = render.replace("new THREE.PerspectiveCamera(50, 1, 0.05, 420)", "new THREE.PerspectiveCamera(35, 1, 0.2, 1400)")
render = render.replace("  uHexW:     { value: 2.0 },", "  uHexW:     { value: 10.0 },\n  uGridAll:  { value: 1 },\n  uRoadTex:  { value: null },")
render = render.replace("float tot = 1.0 - exp(-(dist*uFogDens + max(hf, 0.0)));", "float far = pow(dist/470.0, 4.0);\n  float tot = 1.0 - exp(-(max(dist - 90.0, 0.0)*uFogDens*1.6 + max(hf, 0.0) + far));")
render = render.replace("uniform vec3 uTouch; uniform float uTouchAmt; uniform float uHexW;", "uniform vec3 uTouch; uniform float uTouchAmt; uniform float uHexW; uniform float uGridAll;")
render = render.replace("${opt.ground ? 'varying vec4 vKind; uniform float uSandy;' : ''}", "${opt.ground ? 'varying vec4 vKind; uniform float uSandy; uniform sampler2D uRoadTex;' : ''}")
render = render.replace("if (uTouchAmt > 0.001) {", "if (uTouchAmt > 0.001 || uGridAll > 0.001) {")
render = render.replace("float m = uTouchAmt * (1.0 - smoothstep(uHexW*1.3, uHexW*3.3, r));",
  "float inB = step(abs(vWPos.x), 100.0) * step(abs(vWPos.z), 121.24);\n          float m = max(uTouchAmt * (1.0 - smoothstep(uHexW*1.3, uHexW*3.3, r)), uGridAll*0.45) * inB * (1.0 - 0.5*smoothstep(110.0, 230.0, distance(cameraPosition, vWPos)));\n          gl_FragColor.rgb *= mix(1.0, 0.8, uGridAll * (1.0 - inB));")
render = render.replace("sel * uTouchAmt;", "sel * uTouchAmt * inB;")
# new ground detail: roads come from the baked texture
a = render.index("  // roads and railway bed")
b = render.index("  diffuseColor.rgb *= 0.88 + 0.14*n2 + 0.08*n3;")
road = """  // roads and tracks: distance to the nearest road, baked into a texture (units)
  vec2 ruv = (xz - vec2(-140.0, -150.0)) / vec2(280.0, 300.0);
  vec4 rt = texture2D(uRoadTex, ruv);
  float roadD = rt.r, sideD = rt.g;
  vec3 dirtC = vec3(0.30, 0.25, 0.17) * (0.9 + 0.2*n2);
  float roadM = 1.0 - smoothstep(0.27, 0.31 + fwidth(roadD)*1.5, roadD);
  float sideM = 1.0 - smoothstep(0.18, 0.22 + fwidth(sideD)*1.5, sideD);
  float ruts = (1.0 - smoothstep(0.012, 0.035, abs(roadD - 0.14))) * roadM
             + (1.0 - smoothstep(0.010, 0.03, abs(sideD - 0.09))) * sideM;
  diffuseColor.rgb = mix(diffuseColor.rgb, dirtC, max(roadM, sideM));
  diffuseColor.rgb *= 1.0 - 0.3 * ruts;
"""
render = render[:a] + road + render[b:]
# GLSL_GROUND_DETAIL no longer needs the old helper constants
render = render.replace("sun.shadow.mapSize.set(2048, 2048);", "sun.shadow.mapSize.set(2048, 2048);")
render = render.replace("Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });", "Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 400 });")
render = render.replace("new THREE.SphereGeometry(300, 32, 16)", "new THREE.SphereGeometry(900, 32, 16)")

# ---- looks: keep only D, drop smoke hooks, no buttons ----
lp = looks_post
lp = re.sub(r"  A: \{ // Misty dawn.*?\n  \},\n  B: \{ // Tilt-shift.*?\n  \},\n  C: \{ // Painterly.*?\n  \},\n", "", lp, flags=re.S)
lp = lp.replace("  document.querySelectorAll('#looks button').forEach((b) => b.classList.toggle('on', b.dataset.look === name));\n  try { localStorage.setItem('lt-look2', name); } catch (e) {}\n", "")
lp = lp.replace("document.querySelectorAll('#looks button').forEach((b) => b.addEventListener('click', () => setLook(b.dataset.look)));\n", "")
lp = lp.replace("  sun.position.copy(sunDir).multiplyScalar(80); sun.target.position.set(0, 0, 0);\n", "")
lp = lp.replace("""    smoke.material.uniforms.uPx.value = innerHeight * pr * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);\n""", "")
lp = lp.replace("hexW", "hexW")
# shared ground look replaces the old block wholesale
import re as _re
_g = open('tools/world_look_ground.glsl').read().strip()
render = _re.sub(r"const GLSL_GROUND_DETAIL = /\* glsl \*/`\{.*?\n\}`;", lambda m: _g, render, flags=_re.S)
# hex grid: soft dark halo plus a thin light core, so it reads on light and dark ground without shouting
render = render.replace("float line = 1.0 - smoothstep(fw*0.5, fw*1.5 + 0.008, e);",
  "float line = 1.0 - smoothstep(fw*0.3, fw*1.1 + 0.004, e);\n          float halo = 1.0 - smoothstep(fw*0.5, fw*2.0 + 0.03, e);")
render = render.replace("gl_FragColor.rgb = mix(gl_FragColor.rgb, lc, line * m * 0.65);",
  "gl_FragColor.rgb *= 1.0 - 0.35 * halo * m;\n          gl_FragColor.rgb = mix(gl_FragColor.rgb, lc, line * m * 0.6);")
# drifting cloud shadows on everything that uses our fog (shared across maps)
render = render.replace("  uTuftFar:  { value: 26 },", "  uTuftFar:  { value: 26 },\n  uCloud:    { value: 0.22 },")
render = render.replace("vec3 fogColAt(vec3 rd){", "uniform float uCloud;\nfloat cloudShade(vec3 wp){ vec2 p = wp.xz*0.011 + vec2(uTime*0.006, uTime*0.0025);\n  float n = lt_noise(p)*0.6 + lt_noise(p*2.3 + 5.0)*0.4;\n  return 1.0 - uCloud * smoothstep(0.5, 0.72, n); }\nvec3 fogColAt(vec3 rd){", 1)
render = render.replace("gl_FragColor.rgb = applyFog(gl_FragColor.rgb, vWPos);", "gl_FragColor.rgb = applyFog(gl_FragColor.rgb * cloudShade(vWPos), vWPos);")
# leaf flutter for detailed tree leaves
render = render.replace("        ${opt.tuft ? `{\n          #ifdef USE_INSTANCING\n            vec3 ipos", "        ${opt.flutter ? `transformed += vec3(sin(uTime*5.0 + position.x*45.0 + position.y*30.0), sin(uTime*6.1 + position.z*40.0)*0.5, cos(uTime*4.3 + position.z*45.0)) * 0.004 * max(transformed.y, 0.0);` : ''}\n        ${opt.tuft ? `{\n          #ifdef USE_INSTANCING\n            vec3 ipos", 1)
out = head + noise + '\n' + render + '\n' + world + '\n' + helpers + '\n' + maketrees + '\n' + roof + '\n' + scene + '\n' + lp + '\n' + cam
open('mission-bridge.html', 'w').write(out)
print('written', len(out))

t=open('mission-bridge.html').read()
t=t.replace("vec2 fid = floor(fr / vec2(2.3, 1.5));","vec2 fid = floor(fr / vec2(6.0, 4.0));")
t=t.replace("fogDens: 0.0014","fogDens: 0.0006")
t=t.replace("exposure: 1.0, sat: 1.06, contrast: 1.06","exposure: 0.96, sat: 1.12, contrast: 1.12")
open('mission-bridge.html','w').write(t)

t=open('mission-bridge.html').read()
t=t.replace("(rowsW - 0.5) * 0.35 * vKind.y * fadeR","(rowsW - 0.5) * 0.2 * vKind.y * fadeR")
open('mission-bridge.html','w').write(t)
