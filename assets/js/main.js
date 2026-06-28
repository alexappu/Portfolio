/**
 * Alex James — Portfolio
 * Dependency-free interactions: theme toggle, nav, scroll-reveal,
 * counters, typing effect, skill bars, project filter, contact form.
 */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = $("#theme-toggle");
  const stored = localStorage.getItem("theme");
  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeBtn) {
      themeBtn.innerHTML = theme === "light"
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon-stars"></i>';
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f6f8fc" : "#0b0f1a");
  };
  setTheme(stored || "dark");
  themeBtn && themeBtn.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* ---------- Navbar: scrolled state + back-to-top ---------- */
  const navbar = $("#navbar");
  const backTop = $(".back-to-top");
  const onScroll = () => {
    const y = window.scrollY;
    navbar && navbar.classList.toggle("scrolled", y > 20);
    backTop && backTop.classList.toggle("show", y > 500);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#nav-toggle");
  const navLinks = $("#nav-links");
  const closeNav = () => {
    if (!navLinks) return;
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="bi bi-list"></i>';
  };
  navToggle && navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
  });

  /* ---------- Smooth scroll + active link ---------- */
  $$(".scrollto").forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return;
      const target = $(hash);
      if (!target) return;
      e.preventDefault();
      closeNav();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  const sections = $$("section[id]");
  const navAnchors = $$("#nav-links a");
  const spy = () => {
    const pos = window.scrollY + 120;
    let current = sections[0] ? sections[0].id : "";
    sections.forEach((sec) => {
      if (pos >= sec.offsetTop) current = sec.id;
    });
    navAnchors.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current)
    );
  };
  spy();
  window.addEventListener("scroll", spy, { passive: true });

  /* ---------- Scroll-reveal (IntersectionObserver) ---------- */
  const revealEls = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);
          setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$(".stat-num");
  const yearsSince = (iso) => {
    const start = new Date(iso);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years--;
    return Math.max(0, years);
  };
  const runCounter = (el) => {
    const target = el.dataset.since
      ? yearsSince(el.dataset.since)
      : parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) { el.textContent = target + suffix; return; }
    const dur = 1400;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Skill bars ---------- */
  const fills = $$(".fill");
  if ("IntersectionObserver" in window) {
    const fio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.width + "%"; fio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    fills.forEach((f) => fio.observe(f));
  } else {
    fills.forEach((f) => (f.style.width = f.dataset.width + "%"));
  }

  /* ---------- Typing effect ---------- */
  const typed = $(".typed");
  if (typed && !prefersReduced) {
    const items = (typed.dataset.typedItems || "").split(",").map((s) => s.trim()).filter(Boolean);
    let i = 0, j = 0, deleting = false;
    const tick = () => {
      const word = items[i];
      typed.textContent = word.substring(0, j);
      if (!deleting && j < word.length) { j++; setTimeout(tick, 90); }
      else if (!deleting && j === word.length) { deleting = true; setTimeout(tick, 1700); }
      else if (deleting && j > 0) { j--; setTimeout(tick, 45); }
      else { deleting = false; i = (i + 1) % items.length; setTimeout(tick, 350); }
    };
    if (items.length) tick();
  } else if (typed) {
    typed.textContent = (typed.dataset.typedItems || "").split(",")[0].trim();
  }

  /* ---------- Project filter ---------- */
  const filterBar = $("#filters");
  if (filterBar) {
    const projects = $$(".project");
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      $$(".filter", filterBar).forEach((f) => f.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      projects.forEach((p) => {
        const show = filter === "all" || (p.dataset.category || "").split(" ").includes(filter);
        p.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------- Contact form (Google Script, no redirect) ---------- */
  const form = $(".contact-form");
  const status = $("#form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      const label = $(".btn-label", btn);
      const original = label ? label.innerHTML : "";
      btn.classList.add("is-loading");
      if (label) label.innerHTML = '<i class="bi bi-arrow-repeat"></i> Sending…';
      status.textContent = "";
      status.className = "form-status";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then((res) => res.json().catch(() => ({})).then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (ok && data.success) {
            status.textContent = "Thanks! Your message has been sent — I'll be in touch soon.";
            status.classList.add("ok");
            form.reset();
          } else {
            throw new Error(data.message || "Request failed");
          }
        })
        .catch(() => {
          status.textContent = "Something went wrong. Please email alexjames2909@gmail.com directly.";
          status.classList.add("err");
        })
        .finally(() => {
          btn.classList.remove("is-loading");
          if (label) label.innerHTML = original;
        });
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
