const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const sourcePath = path.join(root, "programming-rpg-c-basics.html");
const officialSitePath = path.join(root, "official-site.html");
const outDir = path.join(root, "dist");
const outPath = path.join(outDir, "programming-rpg-c-basics.production.html");
const gamePagePath = path.join(outDir, "programming-rpg-c-basics.html");
const officialSiteOutPath = path.join(outDir, "official-site.html");
const indexPath = path.join(outDir, "index.html");
const nojekyllPath = path.join(outDir, ".nojekyll");
const vendorDir = path.join(root, "vendor");
const vendorOutDir = path.join(outDir, "vendor");

function createInlineProductionBundle(htmlSource) {
  const compact = String(htmlSource)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n\s+/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();
  return refreshSecurityHashes(compact);
}

function hashSha256(text) {
  return crypto.createHash("sha256").update(text).digest("base64");
}

function extractInlineBlock(html, tag) {
  const match = String(html).match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1] : "";
}

function extractMainInlineScript(html) {
  const scripts = [...String(html).matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  return scripts.length ? scripts[scripts.length - 1][1] : "";
}

function normalizeScriptForSelfCheck(script) {
  return String(script).replace(/(expectedScriptHash\s*:\s*)["'][^"']+["']/, '$1"__GAME_SCRIPT_HASH__"');
}

function replaceCspHash(html, directive, hash) {
  const pattern = new RegExp(`(${directive}[^;"]*'sha256-)[^']+(')`);
  return String(html).replace(pattern, `$1${hash}$2`);
}

function refreshSecurityHashes(html) {
  const initialScript = extractMainInlineScript(html);
  const selfHash = hashSha256(normalizeScriptForSelfCheck(initialScript));
  let next = String(html).replace(/(expectedScriptHash\s*:\s*)["'][^"']+["']/, `$1"${selfHash}"`);
  const styleHash = hashSha256(extractInlineBlock(next, "style"));
  const scriptHash = hashSha256(extractMainInlineScript(next));
  next = replaceCspHash(next, "script-src", scriptHash);
  next = replaceCspHash(next, "style-src", styleHash);
  return next;
}

fs.mkdirSync(outDir, { recursive: true });
const html = fs.readFileSync(sourcePath, "utf8");
const gameOutput = createInlineProductionBundle(html);
const officialSite = fs.readFileSync(officialSitePath, "utf8");
const officialOutput = createInlineProductionBundle(officialSite);
fs.writeFileSync(outPath, gameOutput);
fs.writeFileSync(gamePagePath, gameOutput);
fs.writeFileSync(officialSiteOutPath, officialOutput);
fs.writeFileSync(indexPath, officialOutput);
fs.writeFileSync(nojekyllPath, "");
if (fs.existsSync(vendorDir)) {
  fs.cpSync(vendorDir, vendorOutDir, { recursive: true, force: true });
}

console.log(`built ${path.relative(root, outPath)} (${gameOutput.length} bytes)`);
console.log(`built ${path.relative(root, gamePagePath)} (${gameOutput.length} bytes)`);
console.log(`built ${path.relative(root, officialSiteOutPath)} (${officialOutput.length} bytes)`);
console.log(`built ${path.relative(root, indexPath)} (${officialOutput.length} bytes)`);
if (fs.existsSync(vendorOutDir)) console.log(`copied ${path.relative(root, vendorOutDir)}`);
