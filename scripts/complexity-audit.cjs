const fs = require("fs");
const { extractInlineScripts } = require("./audit-html-utils.cjs");

const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const script = extractInlineScripts(html);

const thresholds = {
  maxFunctionLines: 30,
  maxCyclomaticComplexity: 5
};

function estimateComplexity(body) {
  const matches = body.match(/\b(if|for|while|case|catch|\?\s*|&&|\|\|)\b/g) || [];
  return 1 + matches.length;
}

const functions = [...script.matchAll(/function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\n    \}/g)]
  .map((match) => ({
    name: match[1],
    lines: match[2].split("\n").length,
    complexity: estimateComplexity(match[2])
  }));

const offenders = functions
  .filter((item) => item.lines > thresholds.maxFunctionLines || item.complexity > thresholds.maxCyclomaticComplexity)
  .sort((a, b) => (b.lines + b.complexity) - (a.lines + a.complexity));

console.log(JSON.stringify({
  thresholds,
  checked: functions.length,
  offenders: offenders.slice(0, 25)
}, null, 2));
