/* ==========================================================================
   Stillwave Studio — Interactive Agency Motion & Showcase Controller
   Handles: Magnetic Cursor, 3D Card Tilt + Spotlight, Live Category Filter &
   Search, Grid/Runway View Toggle, Auto-Playing Spotlight Stage, Counters,
   Scroll Progress, and Three.js Color Synchronization.
   ========================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // --------------------------------------------------------------------------
  // 1. Top Scroll Progress Bar
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    if (!progressBar) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / max));
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // --------------------------------------------------------------------------
  // 2. Custom Magnetic Cursor Follower (Desktop Fine Pointer)
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (isFinePointer && cursorDot && cursorRing && !prefersReduced) {
    let cx = -100, cy = -100;
    let rx = -100, ry = -100;
    let cursorVisible = false;

    window.addEventListener('pointermove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        rx = cx;
        ry = cy;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      cursorVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    function tickCursor() {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      cursorDot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      cursorRing.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      requestAnimationFrame(tickCursor);
    }
    requestAnimationFrame(tickCursor);

    // Contextual hover expansion
    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        const label = el.getAttribute('data-cursor') || '';
        cursorRing.textContent = label;
        if (label) {
          cursorRing.classList.add('is-interactive');
        } else {
          cursorRing.style.borderColor = 'rgba(247, 223, 164, 0.9)';
        }
      });
      el.addEventListener('pointerleave', () => {
        cursorRing.textContent = '';
        cursorRing.classList.remove('is-interactive');
        cursorRing.style.borderColor = '';
      });
    });

    // Magnetic Pull on [data-magnetic] elements
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Hero Emblem 3D Tilt & Dock Icon Quick Jump
  // --------------------------------------------------------------------------
  const heroCard = document.getElementById('hero-emblem-card');
  if (heroCard && isFinePointer && !prefersReduced) {
    heroCard.addEventListener('pointermove', (e) => {
      const r = heroCard.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      heroCard.style.transform = `rotateX(${(-ny * 9).toFixed(2)}deg) rotateY(${(nx * 11).toFixed(2)}deg)`;
    });
    heroCard.addEventListener('pointerleave', () => {
      heroCard.style.transform = '';
    });
  }

  document.querySelectorAll('[data-jump-card]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-jump-card');
      const accent = btn.getAttribute('data-accent');
      if (accent && window.StillwaveScene) window.StillwaveScene.setAccent(accent);
      const card = document.getElementById(targetId);
      if (card) {
        // Ensure 'all' filter is active so target card is visible
        activateFilter('all');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.borderColor = 'rgba(247, 223, 164, 0.95)';
        setTimeout(() => { card.style.borderColor = ''; }, 1600);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Three.js 3D Scene Mode Switcher Button
  // --------------------------------------------------------------------------
  const sceneModeBtn = document.getElementById('scene-mode-btn');
  const sceneModeLabel = document.getElementById('scene-mode-label');
  if (sceneModeBtn && sceneModeLabel) {
    sceneModeBtn.addEventListener('click', () => {
      if (window.StillwaveScene) {
        const nextMode = window.StillwaveScene.cycleMode();
        sceneModeLabel.textContent = '3D: ' + nextMode;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Interactive Featured Spotlight Deck (Auto-Cycling + Pause on Hover)
  // --------------------------------------------------------------------------
  const spotTabs = Array.from(document.querySelectorAll('.spot-tab'));
  const spotSlides = Array.from(document.querySelectorAll('.spotlight-slide'));
  const spotStage = document.getElementById('spotlight-stage');
  let spotIndex = 0;
  let spotPaused = false;
  let spotElapsed = 0;
  const SPOT_DURATION = 5500;

  function showSpotlight(idx, syncScene) {
    spotIndex = (idx + spotSlides.length) % spotSlides.length;
    spotElapsed = 0;

    spotTabs.forEach((tab, i) => {
      const active = i === spotIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      const bar = tab.querySelector('.spot-progress');
      if (bar) bar.style.transform = 'scaleX(0)';
    });

    spotSlides.forEach((slide, i) => {
      const active = i === spotIndex;
      slide.classList.toggle('is-active', active);
      if (active && spotStage) {
        const glowColor = slide.getAttribute('data-glow') || 'rgba(223, 192, 124, 0.24)';
        const accentHex = slide.getAttribute('data-accent') || '#dfc07c';
        spotStage.style.setProperty('--spot-color', glowColor);
        if (syncScene && window.StillwaveScene) {
          window.StillwaveScene.setAccent(accentHex);
          window.StillwaveScene.pulse();
        }
      }
    });
  }

  spotTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showSpotlight(i, true));
  });

  if (spotStage) {
    spotStage.addEventListener('pointerenter', () => { spotPaused = true; });
    spotStage.addEventListener('pointerleave', () => { spotPaused = false; });
  }

  let lastSpotTick = performance.now();
  function tickSpotlight(now) {
    const dt = now - lastSpotTick;
    lastSpotTick = now;

    if (!spotPaused && !prefersReduced && spotSlides.length > 1) {
      spotElapsed += dt;
      const activeTab = spotTabs[spotIndex];
      if (activeTab) {
        const bar = activeTab.querySelector('.spot-progress');
        if (bar) {
          bar.style.transform = `scaleX(${Math.min(1, spotElapsed / SPOT_DURATION).toFixed(3)})`;
        }
      }
      if (spotElapsed >= SPOT_DURATION) {
        showSpotlight(spotIndex + 1, false);
      }
    }
    requestAnimationFrame(tickSpotlight);
  }
  if (spotSlides.length > 0) {
    showSpotlight(0, false);
    requestAnimationFrame(tickSpotlight);
  }

  // --------------------------------------------------------------------------
  // 6. 3D Card Tilt, Cursor Spotlight & Three.js Color Sync on All 12 Cards
  // --------------------------------------------------------------------------
  const allCards = Array.from(document.querySelectorAll('.showcase-card'));
  const catalogSection = document.getElementById('catalog');

  allCards.forEach((card) => {
    const accent = card.getAttribute('data-accent');
    if (accent) {
      card.style.setProperty('--accent', accent);
    }

    card.addEventListener('pointerenter', () => {
      if (accent && window.StillwaveScene) {
        window.StillwaveScene.setAccent(accent);
      }
    });

    card.addEventListener('pointermove', (e) => {
      if (!isFinePointer || prefersReduced) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x.toFixed(0)}px`);
      card.style.setProperty('--my', `${y.toFixed(0)}px`);

      // Subtle 3D tilt (gentler in runway mode)
      const isRunway = catalogSection && catalogSection.classList.contains('is-runway');
      const maxTilt = isRunway ? 2.2 : 5.5;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      card.style.setProperty('--rx', `${(-ny * maxTilt).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(nx * maxTilt).toFixed(2)}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Live Category Filter, Search Input & Grid / Runway View Switcher
  // --------------------------------------------------------------------------
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const searchInput = document.getElementById('catalog-search');
  const viewBtns = Array.from(document.querySelectorAll('.view-btn'));
  const gamesBlock = document.getElementById('games-block');
  const appsBlock = document.getElementById('apps-block');
  const emptyState = document.getElementById('empty-state');
  const resetFilterBtn = document.getElementById('reset-filters');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyCatalogFilters() {
    let visibleGames = 0;
    let visibleApps = 0;
    const q = searchQuery.trim().toLowerCase();

    allCards.forEach((card) => {
      const kind = card.getAttribute('data-kind');       // 'game' | 'app'
      const status = card.getAttribute('data-status');   // 'live' | 'soon'
      const text = card.textContent.toLowerCase();

      let matchFilter = true;
      if (activeFilter === 'game') matchFilter = kind === 'game';
      else if (activeFilter === 'app') matchFilter = kind === 'app';
      else if (activeFilter === 'live') matchFilter = status === 'live';
      else if (activeFilter === 'soon') matchFilter = status === 'soon';

      const matchQuery = !q || text.includes(q);
      const show = matchFilter && matchQuery;

      card.classList.toggle('is-hidden-card', !show);
      if (show) {
        if (kind === 'game') visibleGames++;
        else if (kind === 'app') visibleApps++;
      }
    });

    if (gamesBlock) gamesBlock.style.display = visibleGames > 0 ? '' : 'none';
    if (appsBlock) appsBlock.style.display = visibleApps > 0 ? '' : 'none';
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleGames + visibleApps === 0);
    }
  }

  function activateFilter(filterName) {
    activeFilter = filterName;
    filterBtns.forEach((b) => {
      const on = b.getAttribute('data-filter') === filterName;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (window.StillwaveScene) {
      if (filterName === 'app') window.StillwaveScene.setAccent('#5eead4');
      else window.StillwaveScene.setAccent('#dfc07c');
      window.StillwaveScene.pulse();
    }
    applyCatalogFilters();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateFilter(btn.getAttribute('data-filter') || 'all');
    });
  });

  // Also wire quick-filter triggers from header / hero links
  document.querySelectorAll('[data-trigger-filter]').forEach((link) => {
    link.addEventListener('click', () => {
      const f = link.getAttribute('data-trigger-filter');
      if (f) activateFilter(f);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      applyCatalogFilters();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      activateFilter('all');
    });
  }

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-view');
      viewBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (catalogSection) {
        catalogSection.classList.toggle('is-runway', mode === 'runway');
      }
      if (window.StillwaveScene) window.StillwaveScene.pulse();
    });
  });

  // --------------------------------------------------------------------------
  // 8. Scroll Reveal & Animated Telemetry Counters
  // --------------------------------------------------------------------------
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((el, idx) => {
      el.style.transitionDelay = `${(idx % 4) * 55}ms`;
      io.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add('is-revealed'));
  }

  // Animated Counters
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (prefersReduced || !target) {
      el.innerHTML = `${target}<span>${suffix}</span>`;
      return;
    }
    let start = null;
    const duration = 1100;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(eased * target);
      el.innerHTML = `${val}<span>${suffix}</span>`;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // --------------------------------------------------------------------------
  // 9. Copy Studio Email Micro-Interaction
  // --------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'sufianwp97dot@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(showToast);
      } else {
        showToast();
      }
    });
  }

  function showToast() {
    if (!toast) return;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }
})();
