const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "programming-rpg-c-basics.html");
const outDir = path.join(root, "dist");
const outPath = path.join(outDir, "programming-rpg-c-basics.secure.html");

function optionalRequire(name) {
  try {
    return require(name);
  } catch (error) {
    return null;
  }
}

function extractMainScript(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
  if (!match) throw new Error("Main inline script not found");
  return match[1];
}

function replaceMainScript(html, script) {
  return html.replace(/<script>([\s\S]*?)<\/script>\s*<\/body>/, `<script>${script}</script></body>`);
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

function basicMinify(script) {
  return script
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\n\s+/g, "\n")
    .replace(/\s{2,}/g, " ");
}

async function terserMinify(script) {
  const terser = optionalRequire("terser");
  if (!terser) return basicMinify(script);
  const result = await terser.minify(script, {
    compress: { passes: 3, unsafe: true, unsafe_arrows: true },
    mangle: { toplevel: true, properties: { regex: /^_/ } },
    format: { comments: false }
  });
  if (result.error) throw result.error;
  return result.code || script;
}

function obfuscateScript(script) {
  const JavaScriptObfuscator = optionalRequire("javascript-obfuscator");
  if (!JavaScriptObfuscator) return script;
  return JavaScriptObfuscator.obfuscate(script, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.18,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.8,
    splitStrings: true,
    reservedStrings: ["__GAME_SCRIPT_HASH__"],
    transformObjectKeys: false
  }).getObfuscatedCode();
}

function hashSha256(text) {
  return crypto.createHash("sha256").update(text).digest("base64");
}

function refreshSecurityHashes(html) {
  const script = extractMainInlineScript(html);
  const selfHash = hashSha256(normalizeScriptForSelfCheck(script));
  let next = String(html).replace(/(expectedScriptHash\s*:\s*)["'][^"']+["']/, `$1"${selfHash}"`);
  next = replaceCspHash(next, "script-src", hashSha256(extractMainInlineScript(next)));
  next = replaceCspHash(next, "style-src", hashSha256(extractInlineBlock(next, "style")));
  return next;
}

async function build() {
  fs.mkdirSync(outDir, { recursive: true });
  const html = fs.readFileSync(sourcePath, "utf8");
  const script = extractMainScript(html);
  const minified = await terserMinify(normalizeScriptForSelfCheck(script));
  const hardened = obfuscateScript(minified);
  const compactHtml = replaceMainScript(html, hardened)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .trim();
  const securedHtml = refreshSecurityHashes(compactHtml);
  fs.writeFileSync(outPath, securedHtml);
  fs.writeFileSync(`${outPath}.sha256`, hashSha256(securedHtml));
  console.error(`secure build written: ${path.relative(root, outPath)}`);
  console.error("Tip: install terser and javascript-obfuscator for full production hardening.");
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
