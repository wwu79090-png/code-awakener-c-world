# Code Awakener Teaching SDK

The browser runtime exposes `globalThis.CodeAwakenerSDK` for teachers who want to embed a custom C course pack.

## Minimal Embed

```html
<div id="course"></div>
<script src="./programming-rpg-c-basics.html"></script>
<script>
  const sdk = new CodeAwakenerSDK();
  const pack = sdk.createCoursePack({
    world: { id: "my-c-world", title: "My C Course", visualStyle: "vector-flat-neon-cyber-code-book" }
  });
  sdk.mount("#course", pack);
</script>
```

## Course Pack Shape

- `world.id`: stable world id.
- `world.title`: visible title.
- `chapters`: ordered lesson list.
- `map.width` and `map.height`: playable area size.
- `stonePuzzles`: keyword-fill puzzles keyed by chapter id.

The SDK validates content with `validateCoursePack` before mounting so malformed packs fail early with readable errors.
