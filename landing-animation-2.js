/* =========================================================
   Landing Animation — Cinematic v2.2 Controller
   ---------------------------------------------------------
   v2.2 fix: the post-intro ScrollTrigger parallax was
   overriding the hero's .reveal opacity on return visits
   (leaving the name / tagline / photo invisible). That whole
   block is now disabled — the site's existing IntersectionObserver
   handles hero reveals cleanly on its own.
   ========================================================= */

(function () {
  'use strict';

  /* ------------- CONFIG ------------- */
  const CFG = {
    overlayId:    'landing',
    skipBtnId:    'landingSkip',
    walkStep:     0.56,
    walkInDur:    3.0,
    autoSkipMs:   8000,
    leaveMs:      700,
    storageKey:   'landingSeenV21',
  };

  const JOINT_ORIGINS = {
    'thigh-front': '108 158',
    'thigh-back':  '92 158',
    'calf-front':  '108 225',
    'calf-back':   '92 225',
    'upper-front': '120 60',
    'upper-back':  '80 60',
    'fore-front':  '120 115',
    'fore-back':   '80 115'
  };

  const overlay = document.getElementById(CFG.overlayId);
  if (!overlay) return;

  /* ------------- ONCE PER SESSION ------------- */
  try {
    if (CFG.storageKey && sessionStorage.getItem(CFG.storageKey)) {
      overlay.remove();
      return;  // <- no post-intro stuff; let .reveal handle the hero
    }
    if (CFG.storageKey) sessionStorage.setItem(CFG.storageKey, '1');
  } catch (_) {}

  /* ------------- REDUCED MOTION ------------- */
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) overlay.classList.add('landing--reduced');

  /* ------------- SCROLL LOCK ------------- */
  const docEl = document.documentElement;
  const prevOverflow = docEl.style.overflow;
  docEl.style.overflow = 'hidden';

  /* ------------- GSAP GATE ------------- */
  if (typeof window.gsap === 'undefined') {
    overlay.classList.add('landing--no-gsap');
    setTimeout(dismiss, 2200);
    wireDismissTriggers();
    return;
  }

  const gsap = window.gsap;

  /* ------------- JOINT ORIGINS ------------- */
  Object.entries(JOINT_ORIGINS).forEach(([joint, origin]) => {
    gsap.set(`[data-joint="${joint}"]`, {
      svgOrigin: origin,
      rotation: 0
    });
  });

  const walker = overlay.querySelector('.walker');
  const body   = overlay.querySelector('.walker__body');
  const shadow = overlay.querySelector('.walker__shadow');

  /* ------------- WALK CYCLE ------------- */
  const STEP = CFG.walkStep;
  let cycle = null;

  if (!reducedMotion) {
    cycle = gsap.timeline({
      repeat: -1,
      defaults: { ease: 'sine.inOut', duration: STEP }
    });

    cycle
      .to('[data-joint="thigh-front"]', { rotation:  25 }, 0)
      .to('[data-joint="calf-front"]',  { rotation: -12 }, 0)
      .to('[data-joint="thigh-back"]',  { rotation: -22 }, 0)
      .to('[data-joint="calf-back"]',   { rotation:  18 }, 0)
      .to('[data-joint="upper-front"]', { rotation: -22 }, 0)
      .to('[data-joint="fore-front"]',  { rotation: -14 }, 0)
      .to('[data-joint="upper-back"]',  { rotation:  22 }, 0)
      .to('[data-joint="fore-back"]',   { rotation:  14 }, 0);

    cycle
      .to('[data-joint="thigh-front"]', { rotation: -22 }, STEP)
      .to('[data-joint="calf-front"]',  { rotation:  18 }, STEP)
      .to('[data-joint="thigh-back"]',  { rotation:  25 }, STEP)
      .to('[data-joint="calf-back"]',   { rotation: -12 }, STEP)
      .to('[data-joint="upper-front"]', { rotation:  22 }, STEP)
      .to('[data-joint="fore-front"]',  { rotation:  14 }, STEP)
      .to('[data-joint="upper-back"]',  { rotation: -22 }, STEP)
      .to('[data-joint="fore-back"]',   { rotation: -14 }, STEP);

    gsap.to(body, {
      y: -4, duration: STEP / 2, ease: 'sine.inOut',
      repeat: -1, yoyo: true
    });

    if (shadow) {
      gsap.set(shadow, { svgOrigin: '100 310' });
      gsap.to(shadow, {
        scaleX: 0.88, opacity: 0.28,
        duration: STEP / 2, ease: 'sine.inOut',
        repeat: -1, yoyo: true
      });
    }

    gsap.from(walker, {
      x: '-55vw', duration: CFG.walkInDur, ease: 'power2.out'
    });
  }

  /* ------------- HEADLINE REVEAL ------------- */
  if (!reducedMotion) {
    gsap.to('.landing__eyebrow', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 1.5
    });
    gsap.to('.landing__title .word', {
      opacity: 1, y: 0, duration: 0.85, stagger: 0.11,
      ease: 'power3.out', delay: 1.65
    });
    gsap.to('.landing__sub', {
      opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 2.4
    });
    gsap.to('.landing__scroll-hint', {
      opacity: 1, duration: 0.8, ease: 'power1.out', delay: 3.0
    });
  } else {
    gsap.set(['.landing__eyebrow', '.landing__title .word',
              '.landing__sub', '.landing__scroll-hint'],
             { opacity: 1, y: 0 });
  }

  /* ------------- CURSOR PARALLAX ------------- */
  if (!reducedMotion) {
    const glow = overlay.querySelector('.landing__glow');
    const head = overlay.querySelector('.walker .head');
    let queued = false;
    let lastX = 0, lastY = 0;

    overlay.addEventListener('mousemove', (e) => {
      lastX = (e.clientX / window.innerWidth  - 0.5) * 2;
      lastY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        if (head) gsap.to(head, { x: lastX * 3, y: lastY * 2,
                                  duration: 1.1, ease: 'power2.out' });
        if (glow) gsap.to(glow, { x: lastX * 30, y: lastY * 22,
                                  duration: 1.3, ease: 'power2.out' });
        queued = false;
      });
    }, { passive: true });
  }

  /* ------------- DISMISS ------------- */
  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;

    docEl.style.overflow = prevOverflow;
    teardownDismissTriggers();

    if (typeof window.gsap === 'undefined' || reducedMotion) {
      overlay.classList.add('landing--leaving');
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, CFG.leaveMs);
      return;
    }

    const exit = gsap.timeline({
      onComplete: () => { if (overlay.parentNode) overlay.remove(); }
    });
    exit
      .to(walker,                   { x: '60vw', duration: 0.85, ease: 'power2.in' }, 0)
      .to('.landing__copy',         { y: -25, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to('.landing__skip',         { opacity: 0, duration: 0.3 }, 0)
      .to('.landing__scroll-hint',  { opacity: 0, duration: 0.3 }, 0)
      .to(overlay,                  { opacity: 0, duration: 0.55, ease: 'power1.out' }, 0.25);

    if (cycle) cycle.timeScale(1.6);
  }

  const skipBtn = document.getElementById(CFG.skipBtnId);

  function onKey(e)    { if (e.key === 'Escape' || e.key === 'Esc') dismiss(); }
  function onScroll()  { dismiss(); }
  function onClick(e)  { if (skipBtn && skipBtn.contains(e.target)) return; dismiss(); }

  function wireDismissTriggers() {
    if (skipBtn) {
      skipBtn.addEventListener('click', dismiss);
      requestAnimationFrame(() => {
        try { skipBtn.focus({ preventScroll: true }); } catch (_) {}
      });
    }
    document.addEventListener('keydown',   onKey);
    window.addEventListener('wheel',       onScroll, { passive: true });
    window.addEventListener('touchmove',   onScroll, { passive: true });
    overlay.addEventListener('click',      onClick);
    setTimeout(dismiss, CFG.autoSkipMs);
  }

  function teardownDismissTriggers() {
    if (skipBtn) skipBtn.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('wheel', onScroll);
    window.removeEventListener('touchmove', onScroll);
    overlay.removeEventListener('click', onClick);
  }

  wireDismissTriggers();
})();
