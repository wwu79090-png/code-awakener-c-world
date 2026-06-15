"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const productionHtml = path.join(root, "dist", "programming-rpg-c-basics.production.html");
const mainFile = path.join(root, "desktop", "electron-main.cjs");

if (!fs.existsSync(productionHtml)) {
  throw new Error("请先运行 node build-single-html.cjs 生成生产版 HTML。");
}

if (!fs.existsSync(mainFile)) {
  throw new Error("缺少 Electron 主进程入口。");
}

console.log("desktop package preflight passed");
console.log("install electron, then run: npm run desktop:dev");
console.log("production html:", path.relative(root, productionHtml));
