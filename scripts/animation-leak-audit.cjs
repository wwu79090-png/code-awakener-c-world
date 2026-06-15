const fs = require("fs");

const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const required = [
  "class TimelineAnimation",
  "detectAnimationDeadlocks",
  "serializeAnimationStates",
  "deserializeAnimationStates",
  "pauseFreezeAnimations",
  "resumeFrozenAnimations",
  "toggleAnimationBudgetOverlay"
];

const missing = required.filter((marker) => !html.includes(marker));
console.log(JSON.stringify({
  checked: required.length,
  missing,
  status: missing.length ? "fail" : "ok"
}, null, 2));

if (missing.length) process.exit(1);
