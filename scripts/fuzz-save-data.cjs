const samples = [
  "",
  "null",
  "{",
  "[]",
  "{\"version\":0,\"data\":{\"learned\":[\"hello\"]}}",
  "{\"version\":3,\"checksum\":\"bad\",\"data\":{\"learned\":[]}}",
  "{\"learned\":\"not-array\",\"cleared\":null}",
  "{\"settings\":{\"masterVolume\":-999}}"
];

function safeParse(text) {
  try {
    return JSON.parse(text || "null");
  } catch {
    return null;
  }
}

function repairProgress(raw) {
  const data = raw && raw.data ? raw.data : raw;
  return {
    learned: Array.isArray(data?.learned) ? data.learned : [],
    cleared: Array.isArray(data?.cleared) ? data.cleared : []
  };
}

const results = samples.map((sample) => repairProgress(safeParse(sample)));
if (!results.every((item) => Array.isArray(item.learned) && Array.isArray(item.cleared))) {
  throw new Error("save fuzz repair failed");
}

console.log(`fuzzed ${samples.length} save samples without crashing`);
