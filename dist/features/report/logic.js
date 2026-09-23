/* Чистый расчёт: можно проверять без браузера. */
(function () {
  const { SIZE, free, TIERS, budget, place, evaluate, covered } = City;
  function counterfactual(s) {
    const original = evaluate(s);
    let bestAlt = null;
    for (let i = 0; i < s.decisions.length; i++) {
      const b = s.decisions[i];
      if (!b) continue;
      const others = {
        decisions: s.decisions.map((v, j) => (j === i ? null : v)),
      };
      for (let y = 0; y < SIZE; y++)
        for (let x = 0; x < SIZE; x++) {
          if (!free(others, x, y)) continue;
          const ds = s.decisions.map((v, j) => (j === i ? { ...b, x, y } : v)),
            e = evaluate({ decisions: ds });
          if (
            e.coverage > original.coverage &&
            (!bestAlt || e.coverage > bestAlt.coverage)
          )
            bestAlt = {
              day: i,
              x,
              y,
              tier: b.tier,
              score: e.score,
              coverage: e.coverage,
              gain: e.score - original.score,
            };
        }
    }
    return bestAlt;
  }
  City.counterfactual = counterfactual;
})();
