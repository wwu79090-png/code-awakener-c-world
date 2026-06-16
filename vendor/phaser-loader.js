(function () {
  "use strict";

  if (globalThis.Phaser) {
    globalThis.__phaserCoreStatus = { ok: true, source: "./vendor/phaser.min.js" };
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
      'if(globalThis.Phaser){globalThis.__phaserCoreStatus={ok:true,source:' + JSON.stringify(src) + '};}',
      '<\\/script>'
    ].join("");
    var inlineScript = [
      "if(!globalThis.Phaser){",
      "globalThis.__phaserCoreStatus={ok:false,source:" + JSON.stringify(src) + "};",
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
