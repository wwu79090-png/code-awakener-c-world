"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("codeAwakenerDesktop", {
  saveCFile(filename, source) {
    return ipcRenderer.invoke("code-awakener:save-c-file", filename, source);
  },
  isDesktop: true
});
