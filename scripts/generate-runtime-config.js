const fs = require("fs");
const path = require("path");

function normalizeBase(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

const explicitBase = normalizeBase(process.env.ESSU_API_BASE);
const apiOrigin = normalizeBase(process.env.ESSU_API_ORIGIN);
const resolvedBase = explicitBase || (apiOrigin ? `${apiOrigin}/api` : "");

const output = `window.ESSU_API_BASE = ${JSON.stringify(resolvedBase)};\n`;
const outputPath = path.join(process.cwd(), "runtime-config.js");
fs.writeFileSync(outputPath, output, "utf8");

// eslint-disable-next-line no-console
console.log(`Wrote runtime config to ${outputPath}`);
// eslint-disable-next-line no-console
console.log(`ESSU_API_BASE=${resolvedBase || "(empty, frontend fallback will be used)"}`);
