import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

function sanitizeNodeOptions(nodeOptions = "") {
  return nodeOptions
    .replace(/--localstorage-file(?:[=\s]+(?:"[^"]*"|'[^']*'|[^\s]+))?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const env = { ...process.env };
const cleaned = sanitizeNodeOptions(env.NODE_OPTIONS || "");
env.NODE_NO_WARNINGS = "1";

if (cleaned) {
  env.NODE_OPTIONS = cleaned;
} else {
  delete env.NODE_OPTIONS;
}

const vitestPkgPath = require.resolve("vitest/package.json");
const vitestBin = join(dirname(vitestPkgPath), "vitest.mjs");
const args = [vitestBin, "run", ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
