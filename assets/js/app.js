(function () {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  let motionPaused = reducedMotionQuery.matches;

  const progressBar = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    if (!progressBar) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / max));
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  const themeBtns = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.textContent = theme === 'light' ? 'Theme: Ivory' : 'Theme: Midnight';
    });
    if (window.StillwaveScene && window.StillwaveScene.setTheme) {
      window.StillwaveScene.setTheme(theme);
    }
    try {
      localStorage.setItem('stillwave-theme', theme);
    } catch (_) {}
  }

  let initialTheme = 'dark';
  try {
    const saved = localStorage.getItem('stillwave-theme');
    if (saved === 'light' || saved === 'dark') initialTheme = saved;
  } catch (_) {}
  applyTheme(initialTheme);

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });

  const motionBtns = Array.from(document.querySelectorAll('[data-motion-toggle]'));
  function applyMotionState(paused) {
    motionPaused = Boolean(paused);
    document.documentElement.setAttribute('data-motion', motionPaused ? 'paused' : 'active');
    motionBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', motionPaused ? 'true' : 'false');
      btn.textContent = motionPaused ? 'Resume Motion' : 'Pause Motion';
    });
    if (window.StillwaveScene && window.StillwaveScene.setPaused) {
      window.StillwaveScene.setPaused(motionPaused);
    }
  }
  applyMotionState(motionPaused);

  motionBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyMotionState(!motionPaused));
  });

  const sceneBtns = Array.from(document.querySelectorAll('[data-scene-cycle]'));
  sceneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!window.StillwaveScene) return;
      const nextMode = window.StillwaveScene.cycleMode();
      sceneBtns.forEach((b) => { b.textContent = '3D: ' + nextMode; });
    });
  });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  function setMobileMenu(open) {
    if (!mobileMenuBtn || !mobileDrawer) return;
    mobileDrawer.classList.toggle('is-open', open);
    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenuBtn.textContent = open ? 'Close' : 'Menu';
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      setMobileMenu(!isOpen);
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        setMobileMenu(false);
        mobileMenuBtn.focus();
      }
    });
  }

  const heroCard = document.getElementById('hero-emblem-card');
  if (heroCard && isFinePointer) {
    heroCard.addEventListener('pointermove', (e) => {
      if (motionPaused) return;
      const r = heroCard.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      heroCard.style.transform = `rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 9).toFixed(2)}deg)`;
    });
    heroCard.addEventListener('pointerleave', () => {
      heroCard.style.transform = '';
    });
  }

  const spotTabs = Array.from(document.querySelectorAll('.spot-tab'));
  const spotSlides = Array.from(document.querySelectorAll('.spotlight-slide'));
  const spotStage = document.getElementById('spotlight-stage');
  let spotIndex = 0;
  let spotHoverOrFocus = false;
  let spotElapsed = 0;
  const SPOT_DURATION = 6000;

  function showSpotlight(idx, moveFocus) {
    spotIndex = (idx + spotSlides.length) % spotSlides.length;
    spotElapsed = 0;

    spotTabs.forEach((tab, i) => {
      const active = i === spotIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
      const bar = tab.querySelector('.spot-progress');
      if (bar) bar.style.transform = 'scaleX(0)';
      if (active && moveFocus) tab.focus();
    });

    spotSlides.forEach((slide, i) => {
      const active = i === spotIndex;
      slide.classList.toggle('is-active', active);
      slide.hidden = !active;
    });

    if (moveFocus && window.StillwaveScene && !motionPaused) {
      window.StillwaveScene.pulse();
    }
  }

  spotTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showSpotlight(i, false));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showSpotlight(i + 1, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showSpotlight(i - 1, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        showSpotlight(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        showSpotlight(spotSlides.length - 1, true);
      }
    });
  });

  if (spotStage) {
    spotStage.addEventListener('pointerenter', () => { spotHoverOrFocus = true; });
    spotStage.addEventListener('pointerleave', () => { spotHoverOrFocus = false; });
    spotStage.addEventListener('focusin', () => { spotHoverOrFocus = true; });
    spotStage.addEventListener('focusout', (e) => {
      if (!spotStage.contains(e.relatedTarget)) spotHoverOrFocus = false;
    });
  }

  let lastSpotTick = performance.now();
  function tickSpotlight(now) {
    const dt = now - lastSpotTick;
    lastSpotTick = now;

    if (!motionPaused && !spotHoverOrFocus && spotSlides.length > 1) {
      spotElapsed += dt;
      const activeTab = spotTabs[spotIndex];
      if (activeTab) {
        const bar = activeTab.querySelector('.spot-progress');
        if (bar) bar.style.transform = `scaleX(${Math.min(1, spotElapsed / SPOT_DURATION).toFixed(3)})`;
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

  const allCards = Array.from(document.querySelectorAll('.showcase-card'));
  const catalogSection = document.getElementById('catalog');

  allCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (!isFinePointer || motionPaused) return;
      const rect = card.getBoundingClientRect();
      const isRunway = catalogSection && catalogSection.classList.contains('is-runway');
      const maxTilt = isRunway ? 1.8 : 4.5;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--rx', `${(-ny * maxTilt).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(nx * maxTilt).toFixed(2)}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const searchInput = document.getElementById('catalog-search');
  const viewBtns = Array.from(document.querySelectorAll('.view-btn'));
  const gamesBlock = document.getElementById('games-block');
  const appsBlock = document.getElementById('apps-block');
  const emptyState = document.getElementById('empty-state');
  const resetFilterBtn = document.getElementById('reset-filters');
  const catalogStatus = document.getElementById('catalog-status');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyCatalogFilters() {
    let visibleGames = 0;
    let visibleApps = 0;
    const q = searchQuery.trim().toLowerCase();

    allCards.forEach((card) => {
      const kind = card.getAttribute('data-kind');
      const status = card.getAttribute('data-status');
      const text = card.textContent.toLowerCase();

      let matchFilter = true;
      if (activeFilter === 'game') matchFilter = kind === 'game';
      else if (activeFilter === 'app') matchFilter = kind === 'app';
      else if (activeFilter === 'live') matchFilter = status === 'live';
      else if (activeFilter === 'soon') matchFilter = status === 'soon';

      const show = matchFilter && (!q || text.includes(q));
      card.classList.toggle('is-hidden-card', !show);
      if (show) {
        if (kind === 'game') visibleGames++;
        else if (kind === 'app') visibleApps++;
      }
    });

    if (gamesBlock) gamesBlock.style.display = visibleGames > 0 ? '' : 'none';
    if (appsBlock) appsBlock.style.display = visibleApps > 0 ? '' : 'none';

    const total = visibleGames + visibleApps;
    if (emptyState) emptyState.classList.toggle('is-visible', total === 0);
    if (catalogStatus) {
      catalogStatus.textContent = total === 12 && !q && activeFilter === 'all'
        ? 'Showing all 12 releases (7 games and 5 apps).'
        : `Showing ${total} of 12 releases.`;
    }
  }

  function activateFilter(filterName) {
    activeFilter = filterName;
    filterBtns.forEach((b) => {
      const on = b.getAttribute('data-filter') === filterName;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (window.StillwaveScene && !motionPaused) window.StillwaveScene.pulse();
    applyCatalogFilters();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => activateFilter(btn.getAttribute('data-filter') || 'all'));
  });

  document.querySelectorAll('[data-trigger-filter]').forEach((link) => {
    link.addEventListener('click', () => {
      const f = link.getAttribute('data-trigger-filter');
      if (f) activateFilter(f);
    });
  });

  document.querySelectorAll('[data-jump-card]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = document.getElementById(btn.getAttribute('data-jump-card'));
      if (!card) return;
      activateFilter('all');
      card.scrollIntoView({ behavior: motionPaused ? 'auto' : 'smooth', block: 'center' });
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
      viewBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (catalogSection) catalogSection.classList.toggle('is-runway', mode === 'runway');
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !motionPaused) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-revealed'));
  }

  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = 'sufianwp97dot@gmail.com';
      const notify = () => {
        if (!toast) return;
        toast.classList.add('is-visible');
        setTimeout(() => toast.classList.remove('is-visible'), 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(notify).catch(notify);
      } else {
        notify();
      }
    });
  }
})();
