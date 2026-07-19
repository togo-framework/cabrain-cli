#!/usr/bin/env node
// Thin launcher: exec the platform binary that postinstall placed next to this file.
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const bin = path.join(__dirname, process.platform === "win32" ? "cabrain.exe" : "cabrain-bin");

if (!fs.existsSync(bin)) {
  console.error("[cabrain] binary not found — the postinstall step may have failed.");
  console.error("[cabrain] reinstall (`npm i -g cabrain-cli`) or:  go install github.com/togo-framework/cabrain-cli@latest");
  process.exit(1);
}

const r = spawnSync(bin, process.argv.slice(2), { stdio: "inherit" });
if (r.error) { console.error("[cabrain]", r.error.message); process.exit(1); }
process.exit(r.status == null ? 1 : r.status);
