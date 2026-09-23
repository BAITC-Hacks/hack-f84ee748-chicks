const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
require("../dist/features/map/config.js");
require("../dist/features/residents/data.js");
require("../dist/features/building/catalog.js");
const C = (globalThis.City = require("../dist/core/engine.js"));
require("../dist/features/advisor/logic.js");
require("../dist/features/report/logic.js");
let s = C.initial();
assert.equal(C.budget(s), 100);
assert.equal(C.evaluate(s).score, 20);
assert.throws(() => C.place(s, { x: 3, y: 0, tier: 0 }));
assert.throws(() => C.place(s, { x: 1, y: 0, tier: 0 }));
assert.throws(() => C.place(s, { x: -1, y: 0, tier: 0 }));
assert.throws(() => C.place(s, { x: 1, y: 1, tier: 9 }));
const p = { x: 1, y: 1, tier: 0 },
  n = C.place(s, p);
assert.equal(C.budget(n), 88);
assert.equal(C.budget(s), 100);
assert(C.covered(p).length <= 4);
assert(C.covered(p).every((id) => C.distance(C.HOMES[id], p) <= 2));
assert.throws(() => C.place(n, p));
for (let day = 0; day < 5; day++) {
  const best = C.best(s, 1);
  assert(best);
  s = C.place(s, best);
}
assert.equal(C.budget(s), 0);
assert.throws(() => C.skip(s));
assert.throws(() => C.place(s, { x: 0, y: 0, tier: 0 }));
assert.deepEqual(C.validate(s), s);
assert.throws(() => C.validate({ decisions: [{ x: 3, y: 0, tier: 0 }] }));
let count = 0;
for (let a = 0; a < 3; a++)
  for (let b = 0; b < 3; b++)
    for (let c = 0; c < 3; c++)
      for (let d = 0; d < 3; d++)
        for (let e = 0; e < 3; e++) {
          let st = C.initial();
          for (const tier of [a, b, c, d, e]) {
            const p = C.best(st, tier);
            st = p ? C.place(st, p) : C.skip(st);
          }
          const ev = C.evaluate(st);
          assert(C.budget(st) >= 0);
          assert(ev.homes.every((v) => v >= 20 && v <= 100));
          assert.equal(
            ev.score,
            Math.round(ev.homes.reduce((a, b) => a + b) / 12),
          );
          const alt = C.counterfactual(st);
          if (alt) {
            const copy = structuredClone(st);
            copy.decisions[alt.day] = { x: alt.x, y: alt.y, tier: alt.tier };
            C.validate(copy);
            assert.equal(C.evaluate(copy).score, alt.score);
            assert.equal(C.budget(copy), C.budget(st));
          }
          count++;
        }
console.log(
  "PASS: 243 tier strategies; placement, capacity, coverage, immutable preview, budget, five-day limit, persistence validation, counterfactual recomputation. Best medium-tier run:",
  C.evaluate(s).score,
);

const html = fs.readFileSync(
  path.join(__dirname, "../dist/index.html"),
  "utf8",
);
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (!/^(?:https?:|data:|#)/.test(m[1]))
    assert(
      fs.existsSync(path.join(__dirname, "../dist", m[1])),
      "Missing asset: " + m[1],
    );
}
console.log("PASS: all local HTML asset references exist");
