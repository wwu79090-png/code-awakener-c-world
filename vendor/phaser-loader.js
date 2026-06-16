(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : globalThis);
  var globalRoot = typeof globalThis !== "undefined" ? globalThis : root;

  function publish(name, value) {
    var targets = [root, globalRoot, typeof self !== "undefined" ? self : null];
    for (var i = 0; i < targets.length; i += 1) {
      var target = targets[i];
      if (!target) continue;
      try { target[name] = value; } catch (error) { void error; }
    }
  }

  if (root.Phaser || globalRoot.Phaser) {
    publish("__phaserCoreStatus", { ok: true, source: "./vendor/phaser.min.js" });
    return;
  }

  var nonce = "code-awakener-inline";
  var fallbacks = [
    "./dist/vendor/phaser.min.js",
    "../vendor/phaser.min.js"
  ];

  function writeGuardedFallback(src) {
    var escapedSrc = String(src).replace(/"/g, "&quot;");
    var scriptTag = [
      '<script src="' + escapedSrc + '"><\\/script>',
      '<script nonce="' + nonce + '">',
      'var root=typeof window!=="undefined"?window:(typeof self!=="undefined"?self:globalThis);',
      'var globalRoot=typeof globalThis!=="undefined"?globalThis:root;',
      'if(root.Phaser||globalRoot.Phaser){(function(){try{root.__phaserCoreStatus={ok:true,source:' + JSON.stringify(src) + '};}catch(e){} try{globalRoot.__phaserCoreStatus={ok:true,source:' + JSON.stringify(src) + '};}catch(e){}}());}',
      '<\\/script>'
    ].join("");
    var inlineScript = [
      "var root=typeof window!=='undefined'?window:(typeof self!=='undefined'?self:globalThis);",
      "var globalRoot=typeof globalThis!=='undefined'?globalThis:root;",
      "if(!root.Phaser&&!globalRoot.Phaser){",
      "try{root.__phaserCoreStatus={ok:false,source:" + JSON.stringify(src) + "};}catch(e){}",
      "try{globalRoot.__phaserCoreStatus={ok:false,source:" + JSON.stringify(src) + "};}catch(e){}",
      "document.write(" + JSON.stringify(scriptTag) + ");",
      "}"
    ].join("");
    document.write(
      '<script nonce="' + nonce + '">' +
        inlineScript +
      '<\\/script>'
    );
  }

  for (var i = 0; i < fallbacks.length; i += 1) writeGuardedFallback(fallbacks[i]);
}());
