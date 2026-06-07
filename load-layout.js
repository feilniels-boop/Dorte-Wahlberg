/**
 * Indlæser fælles header/footer fra fragments/ (kræver http-server — ikke file://).
 */
(function () {
  var headerRoot = document.getElementById("site-header-root");
  var footerRoot = document.getElementById("site-footer-root");
  if (!headerRoot || !footerRoot) return;

  function currentFile() {
    var parts = (location.pathname || "").split("/").filter(function (s) {
      return s;
    });
    var p = parts.length ? parts[parts.length - 1] : "index.html";
    if (!p || p.indexOf(".") === -1) return "index.html";
    return p;
  }

  function setFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function markCurrentPage() {
    var file = currentFile();
    var nav = document.getElementById("site-nav");
    if (!nav) return;
    nav.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("http") === 0) return;
      if (href === file) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  function showFileProtocolHint() {
    headerRoot.innerHTML =
      '<p class="layout-fallback" style="padding:1rem;background:#fff3cd;border:1px solid #ccc;margin:0;font-size:0.9rem;">' +
      "Åbn siden via en lokal server (fx <code>python3 -m http.server</code> i projektmappen), " +
      "så menu og bundtekst kan indlæses.</p>";
    footerRoot.innerHTML =
      '<footer class="site-footer"><div class="wrap footer-bottom"><p class="footer-copy">© Dorte Wahlberg Feil</p></div></footer>';
  }

  function inject() {
    if (location.protocol === "file:") {
      showFileProtocolHint();
      if (typeof window.DWInitNav === "function") window.DWInitNav();
      return;
    }

    Promise.all([
      fetch("fragments/header.html").then(function (r) {
        if (!r.ok) throw new Error("header");
        return r.text();
      }),
      fetch("fragments/footer.html").then(function (r) {
        if (!r.ok) throw new Error("footer");
        return r.text();
      }),
    ])
      .then(function (parts) {
        headerRoot.outerHTML = parts[0];
        footerRoot.outerHTML = parts[1];
        markCurrentPage();
        setFooterYear();
        if (typeof window.DWInitNav === "function") window.DWInitNav();
      })
      .catch(function () {
        headerRoot.innerHTML =
          '<p class="layout-fallback" style="padding:1rem;">Kunne ikke indlæse menu. Tjek at fragments/header.html findes.</p>';
        footerRoot.innerHTML = "";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
