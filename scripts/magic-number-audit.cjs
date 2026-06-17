const fs = require("fs");
const { extractInlineScripts } = require("./audit-html-utils.cjs");

const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const script = extractInlineScripts(html);

const allowed = new Set(["0", "1", "2", "3", "4", "5", "8", "10", "12", "16", "20", "24", "30", "40", "60", "80", "100", "120", "200", "300", "500", "1000"]);
const numbers = [...script.matchAll(/(?<![\w.])(\d{2,5})(?![\w.])/g)]
  .map((match) => match[1])
  .filter((value) => !allowed.has(value));

const counts = numbers.reduce((acc, value) => {
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  uniqueMagicNumbers: Object.keys(counts).length,
  top: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 30)
}, null, 2));
