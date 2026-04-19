/* =========================================================
   Landing Animation — Controller
   ---------------------------------------------------------
   Handles:
     • Dismiss on Skip button / Escape / wheel / touchmove
     • Auto-dismiss after the walk finishes
     • Scroll lock while overlay is up (prevents jumpy UX)
     • Once-per-session playback via sessionStorage
     • Respect for prefers-reduced-motion

   To REPLAY every page load (e.g. during development),
   set storageKey to null in the CONFIG below.
   ========================================================= */

(function () {
  'use strict';

  /* ---- Config (tweak freely) ---- */
  const CONFIG = {
    overlayId:        'landing',
    skipBtnId:        'landingSkip',
    autoDismissMs:    3400,          // ~ walk (3s) + settle (0.4s)
    reducedDismissMs: 1200,          // shorter for reduced motion
    leaveMs:          600,           // fade-out duration (match CSS)
    storageKey:       'landingSeen', // set to null to replay every load
  };

  const overlay = document.getElementById(CONFIG.overlayId);
  if (!overlay) return;

  /* ---- Skip if already seen this session ---- */
  try {
    if (CONFIG.storageKey && sessionStorage.getItem(CONFIG.storageKey)) {
      overlay.remove();
      return;
    }
    if (CONFIG.storageKey) {
      sessionStorage.setItem(CONFIG.storageKey, '1');
    }
  } catch (_) { /* sessionStorage may be blocked — just proceed */ }

  /* ---- Detect reduced-motion preference ---- */
  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) overlay.classList.add('landing--reduced');

  /* ---- Lock the page scroll while overlay is visible ---- */
  const docEl = document.documentElement;
  const prevOverflow = docEl.style.overflow;
  docEl.style.overflow = 'hidden';

  /* ---- Dismiss routine (runs at most once) ---- */
  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;

    overlay.classList.add('landing--leaving');
    docEl.style.overflow = prevOverflow;

    // Remove listeners so they don't linger
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('wheel', onScrollIntent);
    window.removeEventListener('touchmove', onScrollIntent);

    // Remove the overlay from the DOM after the fade-out
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, CONFIG.leaveMs);
  }

  /* ---- Dismiss triggers ---- */
  // 1. Skip button — also auto-focused for keyboard users
  const skipBtn = document.getElementById(CONFIG.skipBtnId);
  if (skipBtn) {
    skipBtn.addEventListener('click', dismiss);
    requestAnimationFrame(() => {
      try { skipBtn.focus({ preventScroll: true }); } catch (_) {}
    });
  }

  // 2. Escape key
  function onKey(e) { if (e.key === 'Escape' || e.key === 'Esc') dismiss(); }
  document.addEventListener('keydown', onKey);

  // 3. Any scroll attempt → dismiss (so the overlay never blocks a hurried user)
  function onScrollIntent() { dismiss(); }
  window.addEventListener('wheel',     onScrollIntent, { passive: true });
  window.addEventListener('touchmove', onScrollIntent, { passive: true });

  // 4. Auto-dismiss once the animation completes
  setTimeout(
    dismiss,
    reducedMotion ? CONFIG.reducedDismissMs : CONFIG.autoDismissMs
  );
})();
