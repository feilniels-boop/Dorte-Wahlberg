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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindNav);
  } else {
    bindNav();
  }
})();
