"use strict";

const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const ROOT_DIR = path.resolve(__dirname, "..");
const GAME_HTML = path.join(ROOT_DIR, "programming-rpg-c-basics.html");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#050816",
    webPreferences: {
      preload: path.join(__dirname, "electron-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(GAME_HTML);
}

function getCodeDir() {
  const dir = path.join(app.getPath("documents"), "CodeAwakenerC");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

ipcMain.handle("code-awakener:save-c-file", (_event, filename, source) => {
  const safeName = String(filename || "lesson.c").replace(/[^\w.-]/g, "_");
  const target = path.join(getCodeDir(), safeName.endsWith(".c") ? safeName : `${safeName}.c`);
  fs.writeFileSync(target, String(source || ""), "utf8");
  return { ok: true, path: target };
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
