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

app.use(
  express.static(root, {
    index: false,
    dotfiles: "ignore",
  })
);

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
