const GLSL_GROUND_DETAIL = /* glsl */`{
  // ---- Shared ground look (any map): macro colour drift, grass, crisp field patchwork with margins,
  //      forest floor, roads with verges, fine grain. Inputs: vertex colour (base), vKind (x open grass,
  //      y field, z forest), uRoadTex (distance to roads). Everything is procedural: no image files.
  vec2 xz = vWPos.xz;
  float camD = distance(cameraPosition, vWPos);
  float near = 1.0 - smoothstep(25.0, 70.0, camD);
  float n1 = lt_noise(xz*1.3), n2 = lt_noise(xz*5.1 + 3.0), n3 = lt_noise(xz*21.0 + 9.0);
  float m1 = lt_noise(xz*0.022 + 2.0), m2 = lt_noise(xz*0.085 - 5.0);
  vec3 base = diffuseColor.rgb;
  base *= mix(vec3(1.08, 1.03, 0.84), vec3(0.88, 1.02, 1.02), m1);   // drier vs lusher ground
  base *= 0.88 + 0.24*m2;
  // open grass: mostly grass, a few small bare patches
  float pm = lt_noise(xz*0.45 + 7.0)*0.55 + n1*0.45;
  vec3 sandC = vec3(0.34, 0.28, 0.17) * (0.9 + 0.2*n2);
  vec3 openC = mix(base * (0.86 + 0.28*n2), sandC, smoothstep(0.63, 0.82, pm) * 0.5 * uSandy);
  // up close: grass streaks and dry tufts
  float n4 = lt_noise(vec2(xz.x*38.0 + xz.y*9.0, xz.y*14.0 - xz.x*3.0));
  openC *= mix(1.0, 0.82 + 0.34*n4, near);
  openC = mix(openC, openC * vec3(1.25, 1.12, 0.7), smoothstep(0.55, 0.8, lt_noise(xz*2.3 + 4.0)) * 0.35);
  base = mix(base, openC, vKind.x);
  // fields: farmland parcels (24 units) with their own direction, cut into long strip fields of varied
  //         width and length, the way Franconian farmland looks from the air; some parcels are whole meadows
  vec2 wq = xz + (vec2(lt_noise(xz*0.04 + 1.7), lt_noise(xz*0.04 - 3.1)) - 0.5) * 3.0;
  float PS = 24.0;
  float prow = floor(wq.y / PS);
  float poff = lt_hash(vec2(prow, 1.7)) * PS;
  vec2 pid = vec2(floor((wq.x + poff) / PS), prow);
  vec2 pl = vec2(fract((wq.x + poff) / PS), fract(wq.y / PS)) * PS;
  float pEdge = min(min(pl.x, PS - pl.x), min(pl.y, PS - pl.y));
  float ang = (lt_hash(pid + 2.3) - 0.5) * 1.4 + 0.35;
  vec2 dir = vec2(cos(ang), sin(ang)), per = vec2(-dir.y, dir.x);
  float sw = 1.6 + 2.6 * lt_hash(pid + 5.1);
  float sA = dot(wq, per) / sw, sid = floor(sA);
  float sl = 7.0 + 9.0 * lt_hash(vec2(sid, pid.x + pid.y * 13.0));
  float sL = dot(wq, dir) / sl + lt_hash(vec2(sid, pid.y)) * 3.0, lid = floor(sL);
  vec2 fidv = vec2(sid + pid.x * 31.0, lid + pid.y * 17.0);
  float meadowParcel = step(lt_hash(pid + 9.9), 0.28);
  float h1 = mix(lt_hash(fidv + 0.37), 0.75, meadowParcel), h2 = lt_hash(fidv + 7.71);
  vec3 fc = h1 < 0.18 ? vec3(0.090, 0.058, 0.034)      // ploughed
          : h1 < 0.36 ? vec3(0.290, 0.218, 0.105)      // stubble
          : h1 < 0.58 ? vec3(0.088, 0.160, 0.042)      // winter crop
          : h1 < 0.85 ? vec3(0.128, 0.170, 0.062)      // pasture
          :             vec3(0.185, 0.150, 0.078);     // fallow
  fc *= 0.86 + 0.28*h2;
  float along = dot(wq, dir);
  float rows = 0.5 + 0.5*sin(along * 30.0);
  float fadeR = 1.0 - smoothstep(0.8, 2.0, fwidth(along) * 30.0);
  fc *= 1.0 + (rows - 0.5) * 0.3 * fadeR * (h1 < 0.58 ? 1.0 : 0.2);
  fc *= 0.9 + 0.2*n2;
  float eA = min(fract(sA), 1.0 - fract(sA)) * sw, eL = min(fract(sL), 1.0 - fract(sL)) * sl;
  float ed = mix(min(min(eA, eL), pEdge), pEdge, meadowParcel), efw = fwidth(ed);
  float vis = 1.0 - smoothstep(0.05, 0.3, efw);
  float margin = (1.0 - smoothstep(0.07, 0.09 + efw*1.5, ed)) * vis;
  float lane = (1.0 - smoothstep(0.18, 0.22 + efw*1.5, pEdge)) * vis;      // wider grass lanes between parcels
  fc = mix(fc, vec3(0.075, 0.115, 0.032) * (0.8 + 0.4*n2), max(margin, lane));
  base = mix(base, fc, vKind.y);
  // forest floor: dark, mottled needle litter and shade
  vec3 floorC = vec3(0.045, 0.052, 0.022) * (0.7 + 0.6*lt_noise(xz*0.8 + 1.0));
  base = mix(base, floorC, smoothstep(0.12, 0.55, vKind.z));
  // roads: packed dirt with wheel ruts and a dry trampled verge
  vec2 ruv = (xz - vec2(-140.0, -150.0)) / vec2(280.0, 300.0);
  vec4 rt = texture2D(uRoadTex, ruv);
  float roadD = rt.r, sideD = rt.g;
  float roadM = 1.0 - smoothstep(0.27, 0.31 + fwidth(roadD)*1.5, roadD);
  float sideM = 1.0 - smoothstep(0.18, 0.22 + fwidth(sideD)*1.5, sideD);
  float verge = (1.0 - smoothstep(0.30, 0.6, min(roadD, sideD + 0.08))) * (1.0 - max(roadM, sideM));
  base = mix(base, base * vec3(1.3, 1.18, 0.82) + vec3(0.02, 0.015, 0.0), verge * 0.55);
  float ruts = (1.0 - smoothstep(0.012, 0.035, abs(roadD - 0.14))) * roadM
             + (1.0 - smoothstep(0.010, 0.03, abs(sideD - 0.09))) * sideM;
  vec3 dirtC = vec3(0.26, 0.21, 0.145) * (0.85 + 0.3*n2) * (0.94 + 0.12*n3);
  base = mix(base, dirtC, max(roadM, sideM));
  base *= 1.0 - 0.28 * ruts;
  // fine grain, only up close where it can be seen without shimmer
  base *= 1.0 + ((n2 - 0.5)*0.14 + (n3 - 0.5)*0.12) * mix(0.35, 1.0, near);
  diffuseColor.rgb = base;
}`;
