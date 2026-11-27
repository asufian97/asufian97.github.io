(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof window.THREE === 'undefined') return;

  const THREE = window.THREE;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (_) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050b1a, 0.026);

  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 160);
  camera.position.set(0, 3.6, 19);

  const ambientLight = new THREE.AmbientLight(0x22335a, 1.4);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0xe5c378, 2.2, 50);
  keyLight.position.set(8, 9, 10);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xf5efe3, 1.2, 44);
  rimLight.position.set(-10, -4, 8);
  scene.add(rimLight);

  const waveGroup = new THREE.Group();
  waveGroup.position.set(0, -4.4, -2);
  waveGroup.rotation.x = -0.62;
  scene.add(waveGroup);

  const waveGeo = new THREE.PlaneGeometry(46, 28, 72, 44);
  const basePositions = Float32Array.from(waveGeo.attributes.position.array);

  const waveWireMat = new THREE.MeshBasicMaterial({
    color: 0xd8b467,
    wireframe: true,
    transparent: true,
    opacity: 0.11
  });
  waveGroup.add(new THREE.Mesh(waveGeo, waveWireMat));

  const wavePointsMat = new THREE.PointsMaterial({
    color: 0xf3d794,
    size: 0.07,
    transparent: true,
    opacity: 0.32
  });
  waveGroup.add(new THREE.Points(waveGeo, wavePointsMat));

  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const icoSolidMat = new THREE.MeshStandardMaterial({
    color: 0x101b37,
    emissive: 0x1d1607,
    roughness: 0.3,
    metalness: 0.82,
    flatShading: true
  });
  const icoSolid = new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 1), icoSolidMat);
  coreGroup.add(icoSolid);

  const icoWireMat = new THREE.MeshBasicMaterial({
    color: 0xe5c378,
    wireframe: true,
    transparent: true,
    opacity: 0.46
  });
  const icoWire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.12, 1), icoWireMat);
  coreGroup.add(icoWire);

  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xd8b467,
    transparent: true,
    opacity: 0.38
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.02, 16, 110), ring1Mat);
  ring1.rotation.x = 1.15;
  ring1.rotation.y = 0.35;
  coreGroup.add(ring1);

  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xf5efe3,
    transparent: true,
    opacity: 0.22
  });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.95, 0.016, 16, 110), ring2Mat);
  ring2.rotation.x = -0.75;
  ring2.rotation.y = -0.55;
  coreGroup.add(ring2);

  let mouseX = 0, mouseY = 0;
  let smoothX = 0, smoothY = 0;
  let lastScrollY = window.scrollY || 0;
  let scrollProgress = 0;
  let scrollBoost = 0;
  let pulseEnergy = 0;

  const modes = ['WAVE', 'ORBIT', 'CALM'];
  let modeIndex = 0;
  let userPaused = false;
  let isTabVisible = !document.hidden;
  let rafId = 0;

  function updateLayoutForViewport() {
    if (window.innerWidth < 960) {
      coreGroup.visible = false;
    } else {
      coreGroup.visible = true;
      coreGroup.position.set(5.6, 2.0, 1.2);
      coreGroup.scale.setScalar(1);
    }
  }
  updateLayoutForViewport();

  function applyWaveGeometry(elapsed, ampScale) {
    const posAttr = waveGeo.attributes.position;
    const arr = posAttr.array;
    const cursorWaveX = smoothX * 12;
    const cursorWaveY = -smoothY * 7;

    for (let i = 0; i < arr.length; i += 3) {
      const bx = basePositions[i];
      const by = basePositions[i + 1];
      const dx = bx - cursorWaveX;
      const dy = by - cursorWaveY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const primary = Math.sin(bx * 0.24 + elapsed) * 0.8 + Math.cos(by * 0.3 - elapsed * 0.78) * 0.6;
      const ripple = Math.sin(dist * 0.62 - elapsed * 2.8) * Math.exp(-dist * 0.14) * 1.25;
      arr[i + 2] = (primary + ripple) * ampScale;
    }
    posAttr.needsUpdate = true;
  }

  function renderFrame(elapsed) {
    const currentMode = modes[modeIndex];
    const baseAmp = currentMode === 'CALM' ? 0.38 : (currentMode === 'ORBIT' ? 1.25 : 0.95);
    const dynamicAmp = (1 + scrollBoost * 0.55 + pulseEnergy * 0.65) * baseAmp;

    applyWaveGeometry(elapsed, dynamicAmp);

    waveGroup.rotation.z = smoothX * 0.05;
    waveGroup.position.y = -4.4 + scrollProgress * 1.3;

    icoSolid.rotation.y = elapsed * 0.24 + scrollProgress * 2.8 + smoothX * 0.4;
    icoSolid.rotation.x = elapsed * 0.16 + smoothY * 0.3;
    icoWire.rotation.copy(icoSolid.rotation);
    ring1.rotation.z = elapsed * 0.28 + scrollProgress * 2.2;
    ring2.rotation.z = -elapsed * 0.2 - scrollProgress * 1.8;

    camera.position.x += (smoothX * 1.0 - camera.position.x) * 0.06;
    camera.position.y += (3.6 - smoothY * 0.65 - scrollProgress * 1.4 - camera.position.y) * 0.06;
    camera.lookAt(0, 0.2 - scrollProgress * 1.1, 0);

    renderer.render(scene, camera);
  }

  const clock = new THREE.Clock();

  // Stop the RAF loop completely when paused, hidden, or under prefers-reduced-motion.
  function shouldAnimate() {
    return isTabVisible && !userPaused && !reducedMotionQuery.matches;
  }

  function loop() {
    rafId = 0;
    if (!shouldAnimate()) return;

    const elapsed = clock.getElapsedTime();
    smoothX += (mouseX - smoothX) * 0.055;
    smoothY += (mouseY - smoothY) * 0.055;
    scrollBoost *= 0.92;
    pulseEnergy *= 0.92;

    renderFrame(elapsed);
    rafId = requestAnimationFrame(loop);
  }

  function syncLoopState() {
    if (shouldAnimate()) {
      clock.start();
      if (!rafId) rafId = requestAnimationFrame(loop);
    } else {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      renderFrame(0.6);
    }
  }

  window.addEventListener('pointermove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    const sy = window.scrollY || 0;
    scrollBoost = Math.min(1.4, scrollBoost + Math.abs(sy - lastScrollY) * 0.003);
    lastScrollY = sy;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.min(1, Math.max(0, sy / maxScroll));
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateLayoutForViewport();
    if (!shouldAnimate()) renderFrame(0.6);
  });

  document.addEventListener('visibilitychange', function () {
    isTabVisible = !document.hidden;
    syncLoopState();
  });

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', syncLoopState);
  }

  syncLoopState();

  window.StillwaveScene = {
    cycleMode: function () {
      modeIndex = (modeIndex + 1) % modes.length;
      pulseEnergy = 0.8;
      waveWireMat.opacity = modes[modeIndex] === 'CALM' ? 0.09 : (modes[modeIndex] === 'ORBIT' ? 0.22 : 0.15);
      if (!shouldAnimate()) renderFrame(0.6 + modeIndex * 0.8);
      return modes[modeIndex];
    },
    setPaused: function (paused) {
      userPaused = Boolean(paused);
      syncLoopState();
    },
    setTheme: function (theme) {
      const isLight = theme === 'light';
      scene.fog.color.setHex(isLight ? 0xf5efe3 : 0x050b1a);
      waveWireMat.color.setHex(isLight ? 0x8a651b : 0xd8b467);
      waveWireMat.opacity = isLight ? 0.18 : 0.15;
      wavePointsMat.color.setHex(isLight ? 0x73520e : 0xf3d794);
      icoSolidMat.color.setHex(isLight ? 0xebe1cd : 0x101b37);
      icoWireMat.color.setHex(isLight ? 0x73520e : 0xe5c378);
      ring1Mat.color.setHex(isLight ? 0x73520e : 0xd8b467);
      ring2Mat.color.setHex(isLight ? 0x3d475e : 0xf5efe3);
      if (!shouldAnimate()) renderFrame(0.6);
    },
    pulse: function () {
      pulseEnergy = 0.7;
    }
  };
})();
