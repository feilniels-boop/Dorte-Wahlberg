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

  /* ── Spotlight glow — partner tiles ──────────────────────────────
     Sætter data-glow på .partner-tile__frame og sporer musen via
     CSS custom properties på :root. background-attachment: fixed
     sikrer at gradienten lever i viewport-rum — alle kort deler
     den samme "lyskilde" ved musen.
  ─────────────────────────────────────────────────────────────────── */
  function initGlowCards() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var frames = document.querySelectorAll(".partner-tile__frame");
    if (!frames.length) return;

    frames.forEach(function (frame) {
      frame.setAttribute("data-glow", "");
    });

    var root = document.documentElement;
    var raf = null;

    document.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        root.style.setProperty("--glow-x",  e.clientX.toFixed(1));
        root.style.setProperty("--glow-y",  e.clientY.toFixed(1));
        root.style.setProperty("--glow-xp", (e.clientX / window.innerWidth).toFixed(4));
        raf = null;
      });
    });

    document.addEventListener("mouseleave", function () {
      root.style.setProperty("--glow-x", "-9999");
      root.style.setProperty("--glow-y", "-9999");
    });
  }

  /* ── Spark-effekt (porteret fra SparkEffect React-komponenten) ───────
     Vanilla canvas — ingen afhængigheder. Gnister spawnes med setInterval
     og tegnes via requestAnimationFrame. Sektionen bruges som container
     (position:relative + overflow:hidden sat i CSS), canvaset indsættes
     som første barn, .wrap løftes til z-index:1 (i CSS).
  ───────────────────────────────────────────────────────────────────── */
  function initSparkEffect() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function attachSparks(section, opts) {
      var canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
      section.insertBefore(canvas, section.firstChild);

      var ctx = canvas.getContext("2d");
      var OPT = {
        amount:      90,
        speed:       0.04,
        lifetime:    200,
        direction:   { x: -0.4, y: 1 },
        size:        [4, 4],
        maxopacity:  0.78,
        color:       "92, 127, 106",   /* sage-grøn — --color-accent */
        randColor:   false,
        acceleration:[4, 20]
      };
      if (opts) {
        Object.keys(opts).forEach(function(k) { OPT[k] = opts[k]; });
      }

      var sparks = [];

      function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function resize() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
      }

      function Spark(x, y) {
        this.x   = x;
        this.y   = y;
        this.age = 0;
        this.acc = rand(OPT.acceleration[0], OPT.acceleration[1]);
        this.col = OPT.randColor
          ? rand(0,255)+","+rand(0,255)+","+rand(0,255)
          : OPT.color;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = sparks.length - 1; i >= 0; i--) {
          var s = sparks[i];
          var a = OPT.maxopacity - s.age / OPT.lifetime;
          if (a <= 0) { sparks.splice(i, 1); continue; }
          ctx.fillStyle = "rgba(" + s.col + "," + a.toFixed(3) + ")";
          ctx.fillRect(s.x, s.y, OPT.size[0], OPT.size[1]);
          /* step */
          s.x += OPT.speed * OPT.direction.x * s.acc / 2;
          s.y += OPT.speed * OPT.direction.y * s.acc / 2;
          s.age++;
        }
        requestAnimationFrame(draw);
      }

      resize();
      window.addEventListener("resize", resize);

      setInterval(function () {
        if (sparks.length < OPT.amount) {
          sparks.push(new Spark(
            rand(-20, canvas.width  + 20),
            rand(-20, canvas.height + 20)
          ));
        }
      }, Math.round(1000 / OPT.amount));

      draw();
    }

    var whyCraft   = document.querySelector(".home-why-craft");
    var testimonial = document.querySelector(".testimonial");
    if (whyCraft)    attachSparks(whyCraft);
    if (testimonial) attachSparks(testimonial, { amount: 60, maxopacity: 0.65 });
  }

  /* ── Custom cursor — dot + lerp-ring (kun hover-pointer enheder) ─────
     Et custom cursor-par er et af de mest markante tegn på et premium site.
     Dot sætter sig øjeblikkeligt. Ringen følger efter med en lerp-faktor
     (0.10) så den ser ud til at "hænge" lidt. Hover-state vokser ringen.
  ─────────────────────────────────────────────────────────────────────── */
  function initCustomCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var dot  = document.createElement("div"); dot.className  = "cur-dot";
    var ring = document.createElement("div"); ring.className = "cur-ring";
    document.body.append(dot, ring);

    var mx = -200, my = -200, rx = -200, ry = -200;

    /* Dot følger musen direkte */
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top  = my + "px";
    });

    /* Ring følger med lineær interpolation (lag = premium) */
    (function lerpRing() {
      rx += (mx - rx) * 0.10;
      ry += (my - ry) * 0.10;
      ring.style.left = rx.toFixed(1) + "px";
      ring.style.top  = ry.toFixed(1) + "px";
      requestAnimationFrame(lerpRing);
    })();

    /* Hover-effekt via event-delegation (dækker dynamisk tilføjede elementer) */
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, .partner-tile, .cred-card, .offer-card, .liquid-btn, [role='button']")) {
        dot.classList.add("is-hover");
        ring.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, .partner-tile, .cred-card, .offer-card, .liquid-btn, [role='button']")) {
        dot.classList.remove("is-hover");
        ring.classList.remove("is-hover");
      }
    });

    /* Klik-animation */
    document.addEventListener("mousedown", function () { dot.classList.add("is-down"); });
    document.addEventListener("mouseup",   function () { dot.classList.remove("is-down"); });

    /* Skjul når musen forlader vinduet */
    document.addEventListener("mouseleave", function () {
      dot.classList.add("is-hidden"); ring.classList.add("is-hidden");
    });
    document.addEventListener("mouseenter", function () {
      dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden");
    });
  }

  /* ── 3D Card Tilt + shine overlay ────────────────────────────────────
     Hvert kort tilter op til ±8° i begge akser baseret på musens position
     relativt til kortets centrum. Et radial-gradient shine-lag følger musen.
     Touch-enheder og reduced-motion springes over.
  ─────────────────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var TILT = 8; /* max grader */

    document.querySelectorAll(".cred-card, .offer-card").forEach(function (card) {
      /* Indsæt shine-span som første barn */
      var shine = document.createElement("span");
      shine.className = "card-shine";
      shine.setAttribute("aria-hidden", "true");
      card.insertBefore(shine, card.firstChild);

      card.addEventListener("mouseenter", function () {
        card.style.transition =
          "box-shadow 0.28s var(--ease-out), background 0.3s ease";
      });

      card.addEventListener("mousemove", function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width  * 0.5)) / (r.width  * 0.5);
        var dy = (e.clientY - (r.top  + r.height * 0.5)) / (r.height * 0.5);

        card.style.transform =
          "perspective(700px)" +
          " rotateY(" + (dx * TILT).toFixed(2) + "deg)" +
          " rotateX(" + (-dy * TILT).toFixed(2) + "deg)" +
          " scale(1.04) translateY(-5px)";

        /* Shine følger musens position inden for kortet */
        shine.style.setProperty(
          "--shine-x",
          ((e.clientX - r.left) / r.width  * 100).toFixed(1) + "%"
        );
        shine.style.setProperty(
          "--shine-y",
          ((e.clientY - r.top)  / r.height * 100).toFixed(1) + "%"
        );
      });

      card.addEventListener("mouseleave", function () {
        card.style.transition =
          "transform 0.45s var(--ease-out), " +
          "box-shadow 0.28s var(--ease-out), background 0.3s ease";
        card.style.transform = "";
      });
    });
  }

  function init() {
    bindNav();
    initReveal();
    initGlowCards();
    initSparkEffect();
    initCustomCursor();
    initCardTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
