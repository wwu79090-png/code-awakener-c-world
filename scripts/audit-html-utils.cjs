function extractInlineScripts(html) {
  return [...String(html).matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n");
}

module.exports = {
  extractInlineScripts
};
