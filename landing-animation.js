/* =========================================================
   Landing Animation — Cinematic v2 (Controller)
   ---------------------------------------------------------
   Requires GSAP + ScrollTrigger, loaded from CDN just before
   this script in index.html. If GSAP is missing, we fall back
   to a simple CSS fade-in.

   Flow:
     1. Character walks in from the left (articulated limbs)
     2. Headline words stagger in mid-walk
     3. Scroll hint appears at ~3s
     4. On Skip / Esc / scroll / click — character exits stage
        right, overlay fades, page takes over
     5. Post-intro: ScrollTrigger gently parallaxes the hero

   Config constants are at the top — edit to taste.
   ========================================================= */

(function () {
  'use strict';

  /* ------------- CONFIG ------------- */
  const CFG = {
    overlayId:    'landing',
    skipBtnId:    'landingSkip',
    walkStep:     0.56,    // seconds per step (one leg-swing direction)
    walkInDur:    3.0,     // total walk-in duration
    autoSkipMs:   8000,    // safety auto-dismiss (if user never scrolls)
    leaveMs:      700,     // exit duration — must match CSS var
    storageKey:   'landingSeenV2',  // set to null to replay every load
  };

  const overlay = document.getElementById(CFG.overlayId);
  if (!overlay) return;

  /* ------------- ONCE PER SESSION ------------- */
  try {
    if (CFG.storageKey && sessionStorage.getItem(CFG.storageKey)) {
      overlay.remove();
      runPostIntroEnhancements();
      return;
    }
    if (CFG.storageKey) sessionStorage.setItem(CFG.storageKey, '1');
  } catch (_) { /* sessionStorage blocked — proceed normally */ }

  /* ------------- REDUCED-MOTION GUARD ------------- */
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) overlay.classList.add('landing--reduced');

  /* ------------- SCROLL LOCK ------------- */
  const docEl = document.documentElement;
  const prevOverflow = docEl.style.overflow;
  docEl.style.overflow = 'hidden';

  /* ------------- GSAP FALLBACK GATE ------------- */
  // If GSAP didn't load (CDN blocked, offline), run a simple fade
  // and dismiss early.
  if (typeof window.gsap === 'undefined') {
    overlay.classList.add('landing--no-gsap');
    setTimeout(dismiss, 2200);
    wireDismissTriggers();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ------------- WALK CYCLE (articulated) -------------
     Each joint is a <g data-joint="..."> that rotates about
     its anchor point (set inline in the SVG markup). Arms
     and legs are counter-phased; forearms/calves lag slightly
     to mimic how real limbs bend as they swing.               */
  const STEP = CFG.walkStep;

  function walkCycle() {
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: 'sine.inOut', duration: STEP }
    });

    // Step A — front leg forward, back leg back
    tl
      .to('[data-joint="thigh-front"]', { rotation:  25 }, 0)
      .to('[data-joint="calf-front"]',  { rotation: -12 }, 0)
      .to('[data-joint="thigh-back"]',  { rotation: -22 }, 0)
      .to('[data-joint="calf-back"]',   { rotation:  18 }, 0)   // trailing knee bends as foot lifts
      .to('[data-joint="upper-front"]', { rotation: -22 }, 0)   // arms counter to legs
      .to('[data-joint="fore-front"]',  { rotation: -14 }, 0)
      .to('[data-joint="upper-back"]',  { rotation:  22 }, 0)
      .to('[data-joint="fore-back"]',   { rotation:  14 }, 0);

    // Step B — mirrored
    tl
      .to('[data-joint="thigh-front"]', { rotation: -22 }, STEP)
      .to('[data-joint="calf-front"]',  { rotation:  18 }, STEP)
      .to('[data-joint="thigh-back"]',  { rotation:  25 }, STEP)
      .to('[data-joint="calf-back"]',   { rotation: -12 }, STEP)
      .to('[data-joint="upper-front"]', { rotation:  22 }, STEP)
      .to('[data-joint="fore-front"]',  { rotation:  14 }, STEP)
      .to('[data-joint="upper-back"]',  { rotation: -22 }, STEP)
      .to('[data-joint="fore-back"]',   { rotation: -14 }, STEP);

    return tl;
  }

  const walker = overlay.querySelector('.walker');
  const body   = overlay.querySelector('.walker__body');

  let cycle = null;
  if (!reducedMotion) {
    cycle = walkCycle();

    // Vertical bob at 2× step frequency
    gsap.to(body, {
      y: -4,
      duration: STEP / 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // Shadow pulses opposite the bob (flatter when figure is high)
    gsap.to(overlay.querySelector('.walker__shadow'), {
      scaleX: 0.88,
      opacity: 0.28,
      transformOrigin: 'center',
      duration: STEP / 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // Walk IN from off-screen left
    gsap.from(walker, {
      x: '-55vw',
      duration: CFG.walkInDur,
      ease: 'power2.out'
    });
  }

  /* ------------- HEADLINE REVEAL ------------- */
  if (!reducedMotion) {
    gsap.to('.landing__eyebrow', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      delay: 1.5
    });
    gsap.to('.landing__title .word', {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.11,
      ease: 'power3.out',
      delay: 1.65
    });
    gsap.to('.landing__sub', {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power2.out',
      delay: 2.4
    });
    gsap.to('.landing__scroll-hint', {
      opacity: 1,
      duration: 0.8,
      ease: 'power1.out',
      delay: 3.0
    });
  } else {
    // Reduced motion: instant show
    gsap.set(['.landing__eyebrow', '.landing__title .word',
              '.landing__sub', '.landing__scroll-hint'],
             { opacity: 1, y: 0 });
  }

  /* ------------- CURSOR PARALLAX (subtle) ------------- */
  if (!reducedMotion) {
    const glow = overlay.querySelector('.landing__glow');
    const head = overlay.querySelector('.walker .head');
    let moveQueued = false;
    let lastX = 0, lastY = 0;

    overlay.addEventListener('mousemove', (e) => {
      lastX = (e.clientX / window.innerWidth  - 0.5) * 2;  // -1..1
      lastY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (moveQueued) return;
      moveQueued = true;
      requestAnimationFrame(() => {
        if (head) gsap.to(head, { x: lastX * 3, y: lastY * 2,
                                  duration: 1.1, ease: 'power2.out' });
        if (glow) gsap.to(glow, { x: lastX * 30, y: lastY * 22,
                                  duration: 1.3, ease: 'power2.out' });
        moveQueued = false;
      });
    }, { passive: true });
  }

  /* ------------- DISMISSAL ------------- */
  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;

    docEl.style.overflow = prevOverflow;
    teardownDismissTriggers();

    if (typeof window.gsap === 'undefined' || reducedMotion) {
      overlay.classList.add('landing--leaving');
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, CFG.leaveMs);
      runPostIntroEnhancements();
      return;
    }

    // Cinematic exit: character strides off to the right,
    // copy drifts up, overlay fades.
    const exit = gsap.timeline({
      onComplete: () => {
        if (overlay.parentNode) overlay.remove();
        runPostIntroEnhancements();
      }
    });
    exit
      .to(walker,              { x: '60vw', duration: 0.85, ease: 'power2.in' }, 0)
      .to('.landing__copy',    { y: -25, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to('.landing__skip',    { opacity: 0, duration: 0.3 }, 0)
      .to('.landing__scroll-hint', { opacity: 0, duration: 0.3 }, 0)
      .to(overlay,             { opacity: 0, duration: 0.55, ease: 'power1.out' }, 0.25);

    if (cycle) cycle.timeScale(1.6);  // feet move a bit faster on exit
  }

  /* ------------- DISMISS TRIGGERS ------------- */
  const skipBtn = document.getElementById(CFG.skipBtnId);

  function onKey(e)    { if (e.key === 'Escape' || e.key === 'Esc') dismiss(); }
  function onScroll()  { dismiss(); }
  function onClick()   { dismiss(); }

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
    // Tap anywhere on the overlay (but not the Skip button) also dismisses
    overlay.addEventListener('click', (e) => {
      if (skipBtn && skipBtn.contains(e.target)) return;
      onClick();
    });

    // Safety timeout — if the user leaves the tab idle, still move on
    setTimeout(dismiss, CFG.autoSkipMs);
  }

  function teardownDismissTriggers() {
    if (skipBtn) skipBtn.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('wheel', onScroll);
    window.removeEventListener('touchmove', onScroll);
  }

  wireDismissTriggers();


  /* =========================================================
     POST-INTRO ENHANCEMENTS
     Scroll-linked polish for the home page. Runs whether the
     intro played or was skipped via sessionStorage.
     ========================================================= */
  function runPostIntroEnhancements() {
    if (typeof window.gsap === 'undefined' || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gsap = window.gsap;

    // Hero avatar: gentle parallax + fade as the user scrolls down.
    // Scrub-linked, so it feels tied to the scroll gesture.
    const avatar = document.querySelector('.hero__avatar');
    if (avatar) {
      gsap.to(avatar, {
        y: 70,
        scale: 0.9,
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end:   'bottom top',
          scrub: 0.8
        }
      });
    }

    // Hero text rises slightly as it leaves the viewport
    gsap.utils.toArray('.hero__name, .hero__tagline, .hero__intro, .hero__actions')
      .forEach((el, i) => {
        gsap.to(el, {
          y: -30 - i * 6,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end:   '+=60%',
            scrub: 0.8
          }
        });
      });
  }
})();
