const fs = require("fs");

const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const targets = [...html.matchAll(/VISUAL_REGRESSION_TARGETS\s*=\s*Object\.freeze\(([\s\S]*?)\);/g)];

if (!targets.length) {
  throw new Error("VISUAL_REGRESSION_TARGETS is missing");
}

const requiredIds = [
  "mainMenuOverlay",
  "pauseMenuOverlay",
  "editorOverlay",
  "debugOverlay",
  "learningReportOverlay"
];

for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`missing visual target ${id}`);
}

console.log("visual smoke targets are present; run browser screenshot comparison in CI when Playwright is available");
