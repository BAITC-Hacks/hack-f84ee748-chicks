/* Чистый расчёт: можно проверять без браузера. */
(function () {
  const { SIZE, free, TIERS, budget, place, evaluate, covered } = City;
  function best(s, tier) {
    let answer = null;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (
          !free(s, x, y) ||
          TIERS[tier].cost > budget(s) ||
          s.decisions.length >= 5
        )
          continue;
        const p = { x, y, tier },
          next = place(s, p),
          e = evaluate(next),
          count = covered(p).length;
        if (!answer || e.coverage > answer.coverage)
          answer = { ...p, score: e.score, coverage: e.coverage, count };
      }
    return answer;
  }
  City.best = best;
})();
