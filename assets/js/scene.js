/* ==========================================================================
   Stillwave Studio — Interactive Three.js 3D WebGL Scene
   Real-time undulating Stillwave Ribbon Mesh + Gyroscopic Crystalline Core
   + Depth Starfield + Cursor & Scroll-Velocity Reactive Lighting
   ========================================================================== */
(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof window.THREE === 'undefined') return;

  const THREE = window.THREE;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03060f, 0.028);

  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 160);
  camera.position.set(0, 3.6, 19);

  // Lighting System (dynamically tinted by hovered game/app cards!)
  const ambientLight = new THREE.AmbientLight(0x1b294b, 1.35);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0xf7dfa4, 2.4, 48);
  keyLight.position.set(8, 9, 10);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x5eead4, 1.6, 44);
  rimLight.position.set(-10, -4, 8);
  scene.add(rimLight);

  const targetAccent = new THREE.Color(0xdfc07c);
  const currentAccent = new THREE.Color(0xdfc07c);

  // --------------------------------------------------------------------------
  // 1. Undulating "Stillwave" Parametric Wave Mesh + Luminous Crest Nodes
  // --------------------------------------------------------------------------
  const waveGroup = new THREE.Group();
  waveGroup.position.set(0, -4.4, -2);
  waveGroup.rotation.x = -0.62;
  scene.add(waveGroup);

  const segX = 76;
  const segY = 46;
  const waveGeo = new THREE.PlaneGeometry(46, 28, segX, segY);
  const basePositions = Float32Array.from(waveGeo.attributes.position.array);

  const waveWireMat = new THREE.MeshBasicMaterial({
    color: 0xdfc07c,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });
  const waveMesh = new THREE.Mesh(waveGeo, waveWireMat);
  waveGroup.add(waveMesh);

  const wavePointsMat = new THREE.PointsMaterial({
    color: 0xf7dfa4,
    size: 0.085,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });
  const wavePoints = new THREE.Points(waveGeo, wavePointsMat);
  waveGroup.add(wavePoints);

  // --------------------------------------------------------------------------
  // 2. Sculpted Gyroscopic Crystalline Core (Hero Interactive 3D Sculpture)
  // --------------------------------------------------------------------------
  const coreGroup = new THREE.Group();
  coreGroup.position.set(5.4, 2.1, 1.5);
  scene.add(coreGroup);

  // Inner faceted metallic-gold icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(2.15, 1);
  const icoSolidMat = new THREE.MeshStandardMaterial({
    color: 0x101935,
    emissive: 0x241a08,
    roughness: 0.25,
    metalness: 0.88,
    flatShading: true
  });
  const icoSolid = new THREE.Mesh(icoGeo, icoSolidMat);
  coreGroup.add(icoSolid);

  const icoWireMat = new THREE.MeshBasicMaterial({
    color: 0xf7dfa4,
    wireframe: true,
    transparent: true,
    opacity: 0.52
  });
  const icoWire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.22, 1), icoWireMat);
  coreGroup.add(icoWire);

  // Counter-rotating brushed-gold & mint-glass orbital rings
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xdfc07c,
    transparent: true,
    opacity: 0.42
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.022, 16, 120), ring1Mat);
  ring1.rotation.x = 1.15;
  ring1.rotation.y = 0.35;
  coreGroup.add(ring1);

  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0.3
  });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.018, 16, 120), ring2Mat);
  ring2.rotation.x = -0.75;
  ring2.rotation.y = -0.55;
  coreGroup.add(ring2);

  // Floating satellite shards around the core
  const satellites = new THREE.Group();
  const shardGeo = new THREE.OctahedronGeometry(0.16, 0);
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xf7dfa4,
    emissive: 0x4b3810,
    metalness: 0.7,
    roughness: 0.2,
    flatShading: true
  });
  const shardData = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(shardGeo, shardMat);
    const radius = 3.0 + Math.random() * 2.2;
    const angle = (i / 14) * Math.PI * 2;
    const ySpread = (Math.random() - 0.5) * 3.2;
    m.position.set(Math.cos(angle) * radius, ySpread, Math.sin(angle) * radius);
    m.scale.setScalar(0.65 + Math.random() * 0.9);
    satellites.add(m);
    shardData.push({ mesh: m, radius, angle, ySpread, speed: 0.2 + Math.random() * 0.35 });
  }
  coreGroup.add(satellites);

  // --------------------------------------------------------------------------
  // 3. Ambient 3D Luminous Dust Field
  // --------------------------------------------------------------------------
  const dustCount = 520;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 48;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 26 - 4;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xf6f0e4,
    size: 0.06,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const dustField = new THREE.Points(dustGeo, dustMat);
  scene.add(dustField);

  // --------------------------------------------------------------------------
  // Interactive State: Mouse, Scroll Velocity & 3D Formation Modes
  // --------------------------------------------------------------------------
  let mouseX = 0, mouseY = 0;
  let smoothX = 0, smoothY = 0;
  let lastScrollY = window.scrollY || 0;
  let scrollProgress = 0;
  let scrollBoost = 0;
  let pulseEnergy = 0;

  const modes = ['WAVE', 'VORTEX', 'CALM'];
  let modeIndex = 0;

  function updateLayoutForViewport() {
    const w = window.innerWidth;
    if (w < 960) {
      coreGroup.position.set(0, 3.2, -2.5);
      coreGroup.scale.setScalar(0.76);
    } else {
      coreGroup.position.set(5.4, 2.1, 1.5);
      coreGroup.scale.setScalar(1);
    }
  }
  updateLayoutForViewport();

  window.addEventListener('pointermove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    const sy = window.scrollY || 0;
    const delta = Math.abs(sy - lastScrollY);
    lastScrollY = sy;
    scrollBoost = Math.min(1.6, scrollBoost + delta * 0.0032);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.min(1, Math.max(0, sy / maxScroll));
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateLayoutForViewport();
  });

  // Pause rendering when browser tab is hidden to save GPU/battery
  let isTabVisible = true;
  document.addEventListener('visibilitychange', function () {
    isTabVisible = !document.hidden;
  });

  // Animation Loop (60fps GPU-friendly)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabVisible) return;

    const elapsed = prefersReduced ? 0.5 : clock.getElapsedTime();
    smoothX += (mouseX - smoothX) * 0.055;
    smoothY += (mouseY - smoothY) * 0.055;
    scrollBoost *= 0.93;
    pulseEnergy *= 0.92;

    // Smoothly interpolate accent lighting color
    currentAccent.lerp(targetAccent, 0.06);
    keyLight.color.copy(currentAccent);
    waveWireMat.color.copy(currentAccent);
    icoWireMat.color.copy(currentAccent);
    ring1Mat.color.copy(currentAccent);

    const currentMode = modes[modeIndex];
    const ampScale = currentMode === 'CALM' ? 0.38 : (currentMode === 'VORTEX' ? 1.35 : 1.0);
    const dynamicAmp = (1 + scrollBoost * 0.65 + pulseEnergy * 0.8) * ampScale;

    // Update 3D Wave Vertices with Cursor Ripple & Multi-Octave Flow
    const posAttr = waveGeo.attributes.position;
    const arr = posAttr.array;
    const cursorWaveX = smoothX * 13;
    const cursorWaveY = -smoothY * 8;

    for (let i = 0; i < arr.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const dx = bx - cursorWaveX;
      const dy = by - cursorWaveY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const primaryWave = Math.sin(bx * 0.24 + elapsed * 1.05) * 0.85 +
                          Math.cos(by * 0.3 - elapsed * 0.8) * 0.65;
      const cursorRipple = Math.sin(dist * 0.65 - elapsed * 3.1) * Math.exp(-dist * 0.14) * 1.45;

      arr[i + 2] = (primaryWave + cursorRipple) * dynamicAmp;
    }
    posAttr.needsUpdate = true;

    // Subtle wave orientation response
    waveGroup.rotation.z = smoothX * 0.06;
    waveGroup.position.y = -4.4 + scrollProgress * 1.4;

    // Gyroscopic Core Choreography
    const coreTargetScale = currentMode === 'VORTEX' ? 1.22 : (currentMode === 'CALM' ? 0.72 : 1.0);
    const viewportFactor = window.innerWidth < 960 ? 0.76 : 1.0;
    const finalScale = coreTargetScale * viewportFactor * (1 + pulseEnergy * 0.08);
    coreGroup.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.07);

    icoSolid.rotation.y = elapsed * 0.26 + scrollProgress * 3.2 + smoothX * 0.45;
    icoSolid.rotation.x = elapsed * 0.18 + smoothY * 0.35;
    icoWire.rotation.copy(icoSolid.rotation);
    icoWire.rotation.z = -elapsed * 0.12;

    ring1.rotation.z = elapsed * 0.32 + scrollProgress * 2.4;
    ring2.rotation.z = -elapsed * 0.24 - scrollProgress * 2.0;
    ring2.rotation.x = -0.75 + smoothY * 0.25;

    for (let s = 0; s < shardData.length; s++) {
      const sd = shardData[s];
      const a = sd.angle + elapsed * sd.speed;
      sd.mesh.position.x = Math.cos(a) * sd.radius;
      sd.mesh.position.z = Math.sin(a) * sd.radius;
      sd.mesh.position.y = sd.ySpread + Math.sin(elapsed * 1.4 + s) * 0.35;
      sd.mesh.rotation.x = elapsed * 0.8 + s;
      sd.mesh.rotation.y = elapsed * 0.6;
    }

    // Drift ambient dust & gentle camera parallax
    dustField.rotation.y = elapsed * 0.025 + smoothX * 0.05;
    dustField.position.y = scrollProgress * 3.2;

    camera.position.x += (smoothX * 1.15 - camera.position.x) * 0.05;
    camera.position.y += (3.6 - smoothY * 0.75 - scrollProgress * 1.6 - camera.position.y) * 0.05;
    camera.lookAt(0, 0.2 - scrollProgress * 1.2, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Public API for DOM UI Integration
  window.StillwaveScene = {
    setAccent: function (hexString) {
      if (!hexString) return;
      try {
        targetAccent.set(hexString);
      } catch (_) {}
    },
    cycleMode: function () {
      modeIndex = (modeIndex + 1) % modes.length;
      pulseEnergy = 0.9;
      waveWireMat.opacity = modes[modeIndex] === 'CALM' ? 0.09 : (modes[modeIndex] === 'VORTEX' ? 0.24 : 0.16);
      return modes[modeIndex];
    },
    pulse: function () {
      pulseEnergy = 0.75;
    }
  };
})();
