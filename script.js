(function () {
  function bindNav() {
    var nav = document.getElementById("site-nav");
    var toggle = document.querySelector(".nav-toggle");
    var header = document.querySelector(".site-header");
    var backdrop = document.querySelector(".menu-backdrop");
    if (!nav || !toggle || !header) return;
    if (toggle.dataset.dwBound === "1") return;
    toggle.dataset.dwBound = "1";

    function isMobile() {
      return window.matchMedia("(max-width: 959px)").matches;
    }

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
      document.body.style.overflow = open && isMobile() ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (isMobile()) {
          setOpen(false);
        }
      });
    });

    document.addEventListener("keydown", function onEscape(e) {
      if (e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (!isMobile()) setOpen(false);
    });
  }

  window.DWInitNav = bindNav;

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document
      .querySelectorAll(
        ".cred-grid, .offer-grid, .partner-grid, .blog-grid, .gallery-grid"
      )
      .forEach(function (el) {
        el.classList.add("reveal-stagger");
      });

    document
      .querySelectorAll(
        ".home-section-title, .section-lead, .hero-copy, .why-craft-card, .quote-card, " +
          ".home-about-text, .activity-card, .contact-card, .highlight-card, " +
          ".om-feature-photo, .dream-card, .poem, .home-partners-foot, .home-offers-foot"
      )
      .forEach(function (el) {
        el.classList.add("reveal");
      });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".reveal, .reveal-stagger").forEach(function (t) {
      io.observe(t);
    });
  }

  function init() {
    bindNav();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
