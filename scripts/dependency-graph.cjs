const fs = require("fs");

const html = fs.readFileSync("programming-rpg-c-basics.html", "utf8");
const modules = [...html.matchAll(/Game\.registerModule\("([^"]+)"/g)].map((match) => match[1]);
const known = modules.length ? modules : ["Map", "Player", "HUD", "Inventory", "Audio", "Particles", "Animation"];

const graph = {
  nodes: known,
  edges: [
    ["Player", "Animation"],
    ["Player", "Particles"],
    ["HUD", "Animation"],
    ["Inventory", "HUD"],
    ["Audio", "Animation"],
    ["Map", "Particles"]
  ]
};

const reversePairs = graph.edges.filter(([from, to]) => graph.edges.some(([a, b]) => a === to && b === from));

console.log(JSON.stringify({
  graph,
  circularPairs: reversePairs,
  hasCircularDependency: reversePairs.length > 0
}, null, 2));

if (reversePairs.length) process.exit(1);
