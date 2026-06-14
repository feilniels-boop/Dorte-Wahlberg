"use strict";

const path = require("path");
const express = require("express");

const app = express();
const root = __dirname;

const PORT = Number(process.env.PORT) || 8081;
const HOST = "0.0.0.0";

app.disable("x-powered-by");

app.use((req, res, next) => {
  const p = req.path || "";
  if (
    p === "/package.json" ||
    p === "/package-lock.json" ||
    p === "/server.js" ||
    p.startsWith("/node_modules")
  ) {
    return res.status(404).end();
  }
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

// Viderestil gamle WordPress-adresser til de nye sider, saa eksterne links
// (fx tilmeldingslinket paa craftpsykologi.dk) stadig virker.
const legacyRedirects = {
  "/aktiviteter-og-kurser-2": "/aktiviteter.html",
  "/kurser": "/",
  "/at-komme-op-paa-sy-hesten-igen": "/at-komme-op-paa-sy-hesten-igen.html",
  "/hva-med-at-lappe-hjerne-og-toej-i-samme-hug": "/hva-med-at-lappe-hjerne-og-toej-i-samme-hug.html",
  "/indrestyret-kreativitet": "/indrestyret-kreativitet.html",
  "/kan-man-virkelig-sy-en-bog-selv-syning-paa-hjemmeskoleskemaet": "/kan-man-virkelig-sy-en-bog-selv-syning-paa-hjemmeskoleskemaet.html",
  "/min-bedstemors-kuffert": "/min-bedstemors-kuffert.html",
  "/min-sidste-vilje-tanker-om-doeden": "/min-sidste-vilje-tanker-om-doeden.html",
  "/solosokker-irriterende-eller-inspirerende": "/solosokker-irriterende-eller-inspirerende.html",
  "/syning-paa-recept-maaske-fremtidens-pille-mod-migraene": "/syning-paa-recept-maaske-fremtidens-pille-mod-migraene.html",
  "/taend-din-indre-kreative-ild-og-lad-den-braende": "/taend-din-indre-kreative-ild-og-lad-den-braende.html",
  "/om-at-redesigne-udvikle-og-sy-videre-paa-droemmedraaber-under-en-coronakrise": "/om-at-redesigne-udvikle-og-sy-videre-paa-droemmedraaber-under-en-coronakrise.html",
};

Object.keys(legacyRedirects).forEach((from) => {
  const to = legacyRedirects[from];
  app.get([from, from + "/"], (req, res) => res.redirect(301, to));
});

app.use(
  express.static(root, {
    index: false,
    dotfiles: "ignore",
  })
);

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
