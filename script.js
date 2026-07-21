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

/* ── 3D Card Tilt + shine overlay ────────────────────────────────────
     Hvert kort tilter op til ±8° i begge akser baseret på musens position
     relativt til kortets centrum. Et radial-gradient shine-lag følger musen.
     Touch-enheder og reduced-motion springes over.
  ─────────────────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var TILT = 8; /* max grader */

    document.querySelectorAll(".home-about-art").forEach(function (art) {
      var TILT = 5;
      art.addEventListener("mouseenter", function () {
        art.style.transition = "box-shadow 0.3s var(--ease-out)";
      });
      art.addEventListener("mousemove", function (e) {
        var r  = art.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width  * 0.5)) / (r.width  * 0.5);
        var dy = (e.clientY - (r.top  + r.height * 0.5)) / (r.height * 0.5);
        art.style.transform =
          "perspective(900px)" +
          " rotateY(" + (dx * TILT).toFixed(2) + "deg)" +
          " rotateX(" + (-dy * TILT).toFixed(2) + "deg)" +
          " scale(1.02)";
      });
      art.addEventListener("mouseleave", function () {
        art.style.transition = "transform 0.5s var(--ease-out), box-shadow 0.4s var(--ease-out)";
        art.style.transform = "";
      });
    });

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

/* ── Nyhedsbrev: fælles tilmeldings-kald ────────────────────────────── */
  function dwSubscribe(payload) {
    return fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r
        .json()
        .then(function (json) {
          return { ok: r.ok && json && json.ok, error: json && json.error };
        })
        .catch(function () {
          return { ok: false };
        });
    });
  }
  window.DWSubscribe = dwSubscribe;

/* ── Nyhedsbrev pop-up ───────────────────────────────────────────────
     Dukker op efter en kort forsinkelse. Huskes i localStorage, saa den
     ikke plager: skjules i 30 dage hvis den lukkes, og aldrig igen naar
     man har tilmeldt sig. Vises ikke paa selve nyhedsbrev-siden.
  ───────────────────────────────────────────────────────────────────── */
  function initNewsletterPopup() {
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("nyhedsbrev") !== -1) return;

    var STORE_DONE = "dw_nl_done";
    var STORE_DISMISS = "dw_nl_dismissed";
    var DISMISS_DAYS = 30;
    var DELAY = 7000; /* ms — vises efter 7 sekunder */

    function get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function set(key, val) {
      try { localStorage.setItem(key, val); } catch (e) {}
    }

    if (get(STORE_DONE)) return;
    var dismissedAt = parseInt(get(STORE_DISMISS) || "0", 10);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 864e5) return;

    var popup, card, lastFocus;

    function build() {
      popup = document.createElement("div");
      popup.className = "nl-popup";
      popup.setAttribute("role", "dialog");
      popup.setAttribute("aria-modal", "true");
      popup.setAttribute("aria-labelledby", "nl-popup-title");
      popup.hidden = true;
      popup.innerHTML =
        '<div class="nl-popup-backdrop" data-close></div>' +
        '<div class="nl-popup-card">' +
        '<button type="button" class="nl-popup-close" aria-label="Luk" data-close>&times;</button>' +
        '<h2 id="nl-popup-title">Vær med på nyhedslisten</h2>' +
        "<p>Få nyt om kurser, events og små tekster om craft psykologi — direkte i din indbakke. Afmeld når som helst.</p>" +
        '<form class="newsletter-form nl-popup-form" novalidate>' +
        '<div class="field">' +
        '<label for="nlp-email">E-mail</label>' +
        '<input id="nlp-email" name="email" type="email" required autocomplete="email" placeholder="dig@eksempel.dk" />' +
        "</div>" +
        '<div class="field-hp" aria-hidden="true"><input name="website" type="text" tabindex="-1" autocomplete="off" /></div>' +
        '<label class="consent"><input type="checkbox" name="consent" value="ja" required /><span>Ja tak, jeg vil gerne modtage nyhedsbreve fra Dorte Wahlberg.</span></label>' +
        '<button type="submit" class="btn btn-primary newsletter-submit">Tilmeld mig</button>' +
        '<p class="form-status" role="status" aria-live="polite"></p>' +
        "</form>" +
        "</div>";
      document.body.appendChild(popup);
      card = popup.querySelector(".nl-popup-card");

      popup.querySelectorAll("[data-close]").forEach(function (el) {
        el.addEventListener("click", close);
      });
      popup.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
        else if (e.key === "Tab") trapFocus(e);
      });
      popup.querySelector("form").addEventListener("submit", onSubmit);
    }

    function trapFocus(e) {
      var f = Array.prototype.filter.call(
        card.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])'),
        function (el) { return !el.disabled && el.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open() {
      if (!popup) build();
      lastFocus = document.activeElement;
      popup.hidden = false;
      void popup.offsetWidth; /* reflow, saa transitionen kan koere */
      popup.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var email = popup.querySelector("#nlp-email");
      if (email) email.focus();
    }

    function close() {
      if (!popup) return;
      popup.classList.remove("is-open");
      document.body.style.overflow = "";
      if (!get(STORE_DONE)) set(STORE_DISMISS, String(Date.now()));
      window.setTimeout(function () { popup.hidden = true; }, 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onSubmit(e) {
      e.preventDefault();
      var form = e.target;
      var status = form.querySelector(".form-status");
      var submit = form.querySelector(".newsletter-submit");
      status.textContent = "";
      status.className = "form-status";

      var data = {
        email: form.email.value.trim(),
        consent: form.consent.checked,
        website: form.website.value,
      };
      if (!data.email) {
        status.textContent = "Skriv din e-mailadresse.";
        status.className = "form-status is-error";
        form.email.focus();
        return;
      }
      if (!data.consent) {
        status.textContent = "Sæt flueben i samtykket for at tilmelde dig.";
        status.className = "form-status is-error";
        return;
      }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = "Sender …";

      dwSubscribe(data)
        .then(function (res) {
          if (res.ok) {
            set(STORE_DONE, "1");
            form.reset();
            status.textContent = "Tak! Tjek din indbakke og bekræft din tilmelding.";
            status.className = "form-status is-success";
            window.setTimeout(close, 2600);
          } else {
            status.textContent =
              res.error || "Noget gik galt. Prøv igen, eller skriv til info@dortewahlberg.dk.";
            status.className = "form-status is-error";
          }
        })
        .catch(function () {
          status.textContent = "Kunne ikke få forbindelse. Prøv igen senere.";
          status.className = "form-status is-error";
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = original;
        });
    }

    window.setTimeout(open, DELAY);
  }

  function init() {
    bindNav();
    initReveal();
    initSparkEffect();
    initCardTilt();
    initNewsletterPopup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
