/* ---- Starfield Close (footer) ---- */
(function () {
  var canvas = document.getElementById('starfield');
  if (!canvas || !window.THREE) return;
  var host = canvas.parentElement;
  var C = { colorA: '#aef6cf', colorB: '#5fe6a0', colorC: '#eafff2', bgColor: '#0a0a24',
    pointSize: 50, brightness: 1.85, drift: 2.35, scrollDrift: 6, spin: 0.03, scrollSpin: 0.1,
    scrollPush: 8, parallax: 0.6, repelRadius: 5, repelStrength: 0.35, opacity: 2, twinkle: 1,
    count: 4200, depth: 30 };

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(new THREE.Color(C.bgColor), 1);
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 0, 15);
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  camera.position.set(0, 0, 5);

  function hexToVec3(hex) { var n = parseInt(hex.slice(1), 16);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); }

  var N = C.count;
  var positions = new Float32Array(N * 3), palette = new Float32Array(N), bright = new Float32Array(N),
      scales = new Float32Array(N), phases = new Float32Array(N);
  for (var i = 0; i < N; i++) {
    var i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 24;
    positions[i3 + 1] = (Math.random() - 0.5) * 16;
    positions[i3 + 2] = (Math.random() - 0.5) * C.depth;
    palette[i] = Math.floor(Math.random() * 3);
    bright[i] = 0.7 + Math.random() * 0.6;
    scales[i] = 0.5 + Math.pow(Math.random(), 1.4) * 2.5;
    phases[i] = Math.random();
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
  geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  geo.setAttribute('aPalette', new THREE.Float32BufferAttribute(palette, 1));
  geo.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));

  var uniforms = {
    uTime: { value: 0 }, uSize: { value: C.pointSize }, uOpacity: { value: 0 }, uDrift: { value: 0 },
    uDepth: { value: C.depth }, uTwinkle: { value: C.twinkle }, uCursor: { value: new THREE.Vector3(0, 0, 0) },
    uRepelRadius: { value: C.repelRadius }, uRepelStrength: { value: C.repelStrength }, uActivity: { value: 0 },
    uColorA: { value: hexToVec3(C.colorA) }, uColorB: { value: hexToVec3(C.colorB) },
    uColorC: { value: hexToVec3(C.colorC) }, uBrightness: { value: C.brightness }
  };

  var vert = [
    'uniform float uTime; uniform float uSize; uniform float uDrift; uniform float uDepth; uniform float uTwinkle;',
    'uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;',
    'uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;',
    'attribute float aScale; attribute float aPhase; attribute float aPalette; attribute float aBright;',
    'varying vec3 vColor; varying float vTwinkle;',
    'void main() {',
    '  vec3 pos = position;',
    '  pos.z = mod(pos.z + uDrift + (uDepth * 0.5), uDepth) - (uDepth * 0.5);',
    '  float tw = sin(uTime * 1.6 + aPhase * 6.2831);',
    '  vTwinkle = (1.0 - uTwinkle) + uTwinkle * (0.55 + 0.45 * tw);',
    '  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);',
    '  vec3 toParticle = modelPosition.xyz - uCursor;',
    '  float dist = length(toParticle);',
    '  float falloff = smoothstep(uRepelRadius, 0.0, dist);',
    '  modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;',
    '  vec4 viewPosition = viewMatrix * modelPosition;',
    '  gl_Position = projectionMatrix * viewPosition;',
    '  gl_PointSize = uSize * aScale;',
    '  gl_PointSize *= (1.0 / -viewPosition.z);',
    '  vec3 base = aPalette < 0.5 ? uColorA : (aPalette < 1.5 ? uColorB : uColorC);',
    '  vColor = base * aBright;',
    '}'].join('\n');
  var frag = [
    'uniform float uOpacity; uniform float uBrightness;',
    'varying vec3 vColor; varying float vTwinkle;',
    'void main() {',
    '  vec2 uv = gl_PointCoord - 0.5;',
    '  float d = length(uv);',
    '  if (d > 0.5) discard;',
    '  float strength = pow(1.0 - d * 2.0, 4.0);',
    '  vec3 color = mix(vec3(0.0), vColor, strength);',
    '  gl_FragColor = vec4(color * uBrightness, strength * uOpacity * vTwinkle);',
    '}'].join('\n');

  var mat = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  var group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  var ndc = { x: 0, y: 0 }, mouse = { x: 0, y: 0 }, pointerWorld = new THREE.Vector3(),
      pointerTarget = new THREE.Vector3(), pointerActivity = 0, active = false, lastMove = -99;
  host.addEventListener('mousemove', function (e) {
    var r = host.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    active = true; lastMove = performance.now() / 1000;
  });
  host.addEventListener('mouseleave', function () { active = false; });

  var scrollTarget = 0, scrollSmooth = 0, scrollCurrent = 0;
  function updateScrollTarget() {
    var r = host.getBoundingClientRect();
    scrollTarget = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (r.height + window.innerHeight)));
  }
  addEventListener('scroll', updateScrollTarget, { passive: true });

  function resize() {
    var w = canvas.clientWidth, hgt = canvas.clientHeight;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt; camera.updateProjectionMatrix();
    updateScrollTarget();
  }
  addEventListener('resize', resize);
  resize();

  var visible = true;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(host);

  var t0 = performance.now() / 1000, start = t0;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    var now = performance.now() / 1000, dt = Math.min(0.05, now - t0); t0 = now;

    scrollSmooth += (scrollTarget - scrollSmooth) * 0.10;
    scrollCurrent += (scrollSmooth - scrollCurrent) * 0.06;
    mouse.x += (ndc.x - mouse.x) * 0.06; mouse.y += (ndc.y - mouse.y) * 0.06;

    var dir = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
    if (active && Math.abs(dir.z) > 1e-4) {
      var tt = -camera.position.z / dir.z;
      if (tt > 0) pointerTarget.copy(camera.position).add(dir.multiplyScalar(tt));
      else pointerTarget.set(0, 0, 0);
    } else pointerTarget.set(0, 0, 0);
    pointerWorld.lerp(pointerTarget, 0.12);
    var idle = now - lastMove, want = (active && idle < 3) ? 1 : 0;
    pointerActivity += (want - pointerActivity) * 0.06;

    uniforms.uCursor.value.copy(pointerWorld);
    uniforms.uActivity.value = pointerActivity;
    uniforms.uTime.value = now;
    uniforms.uDrift.value += dt * (C.drift + scrollCurrent * C.scrollDrift);
    uniforms.uOpacity.value = Math.max(0, Math.min(1, ((now - start) - 0.3) / 1.4)) * C.opacity;

    camera.position.set(mouse.x * C.parallax, mouse.y * C.parallax, 5 - scrollCurrent * C.scrollPush);
    camera.lookAt(mouse.x * C.parallax, mouse.y * C.parallax, -10);
    group.rotation.z += dt * (C.spin + scrollCurrent * C.scrollSpin);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
