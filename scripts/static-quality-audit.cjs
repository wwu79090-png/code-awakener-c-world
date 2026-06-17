const fs = require("fs");
const { extractInlineScripts } = require("./audit-html-utils.cjs");

const htmlPath = "programming-rpg-c-basics.html";
const html = fs.readFileSync(htmlPath, "utf8");
const script = extractInlineScripts(html);

const report = [];

function add(level, message) {
  report.push({ level, message });
}

const consoleLogCount = (script.match(/\bconsole\.log\s*\(/g) || []).length;
if (consoleLogCount > 0) add("warn", `console.log count: ${consoleLogCount}`);

const longFunctions = [...script.matchAll(/function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\n    \}/g)]
  .map((match) => ({ name: match[1], lines: match[2].split("\n").length }))
  .filter((item) => item.lines > 60);

longFunctions.forEach((item) => add("warn", `long function ${item.name}: ${item.lines} lines`));

const forbiddenWorldLeak = /C\+\+/.test(html);
if (forbiddenWorldLeak) add("error", "first world contains a non-C language marker");

const localStorageWrites = (script.match(/localStorage\.setItem/g) || []).length;
if (localStorageWrites > 0 && !/createSaveEnvelope/.test(script)) {
  add("error", "localStorage writes must use versioned save envelopes");
}

if (!report.length) add("ok", "static quality audit passed");

console.table(report);
if (report.some((item) => item.level === "error")) process.exit(1);
