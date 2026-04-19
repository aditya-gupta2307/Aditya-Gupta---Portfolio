/* =========================================================
   Aditya Gupta — Portfolio JavaScript
   ---------------------------------------------------------
   Handles:
     1. Dark / light theme toggle (remembers choice)
     2. Mobile navigation menu
     3. Highlighting the current page in the nav
     4. Subtle fade-in animation when sections scroll into view
     5. Automatic year in the footer
   No external libraries — just plain JavaScript.
   ========================================================= */


/* ---------- 1. THEME TOGGLE (dark / light mode) ---------- */
(function setupTheme() {
  const root   = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  // On page load: apply saved theme (or follow the device setting)
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  // Flip theme on click and remember the choice
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
})();


/* ---------- 2. MOBILE NAVIGATION ---------- */
(function setupMobileNav() {
  const burger = document.getElementById("navBurger");
  const links  = document.getElementById("navLinks");
  if (!burger || !links) return;

  burger.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the menu after tapping any link (mobile UX)
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );
})();


/* ---------- 3. HIGHLIGHT CURRENT PAGE IN NAV ---------- */
(function highlightActiveLink() {
  const here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === here) link.classList.add("is-active");
  });
})();


/* ---------- 4. FADE-IN ANIMATIONS ON SCROLL ---------- */
(function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
})();


/* ---------- 5. FOOTER YEAR (auto-updates) ---------- */
(function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();
