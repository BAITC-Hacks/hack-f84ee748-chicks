(function (root) {
  "use strict";
  const SIZE = 8,
    HOMES = CityData.homes,
    TYPES = CityData.types,
    TIERS = CityData.tiers;
  const distance = (a, b) => {
    const p = CityMap.position(a),
      q = CityMap.position(b);
    return Math.hypot(p.left - q.left, p.top - q.top) / 12.5;
  };
  const road = (x, y) => x === 3 || y === 3;
  const initial = () => ({ decisions: [] });
  function budget(s) {
    return (
      100 - s.decisions.reduce((v, b) => v + (b ? TIERS[b.tier].cost : 0), 0)
    );
  }
  function free(s, x, y) {
    return (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < SIZE &&
      y < SIZE &&
      !road(x, y) &&
      !HOMES.some((h) => h.x === x && h.y === y) &&
      !s.decisions.some((b) => b && b.x === x && b.y === y)
    );
  }
  function covered(b) {
    if (!b) return [];
    const t = TIERS[b.tier];
    return HOMES.filter((h) => distance(h, b) <= t.radius)
      .sort((a, c) => distance(a, b) - distance(c, b) || a.id - c.id)
      .slice(0, t.capacity)
      .map((h) => h.id);
  }
  function evaluate(s) {
    const services = HOMES.map(() => [false, false, false, false, false]);
    s.decisions.forEach((b, i) =>
      covered(b).forEach((h) => {
        services[h][i] = true;
      }),
    );
    const homes = services.map((a) => 20 + a.filter(Boolean).length * 16),
      sectors = TYPES.map((_, i) =>
        Math.round(
          20 + (80 * services.filter((a) => a[i]).length) / HOMES.length,
        ),
      );
    return {
      services,
      homes,
      sectors,
      score: Math.round(homes.reduce((a, b) => a + b, 0) / HOMES.length),
      happy: homes.filter((v) => v >= 68).length,
      coverage: services.reduce((a, b) => a + b.filter(Boolean).length, 0),
    };
  }
  function place(s, p) {
    if (s.decisions.length >= 5) throw Error("Пять дней уже завершены");
    if (!p || !Number.isInteger(p.tier) || p.tier < 0 || p.tier >= TIERS.length)
      throw Error("Выберите размер объекта");
    if (!free(s, p.x, p.y)) throw Error("На этом участке нельзя строить");
    if (TIERS[p.tier].cost > budget(s)) throw Error("Недостаточно бюджета");
    return { decisions: [...s.decisions, { x: p.x, y: p.y, tier: p.tier }] };
  }
  function skip(s) {
    if (s.decisions.length >= 5) throw Error("Пять дней уже завершены");
    return { decisions: [...s.decisions, null] };
  }
  function validate(s) {
    if (!s || !Array.isArray(s.decisions) || s.decisions.length > 5)
      throw Error("Повреждённое сохранение");
    let next = initial();
    for (const p of s.decisions)
      next = p === null ? skip(next) : place(next, p);
    return next;
  }
  const api = {
    SIZE,
    HOMES,
    TYPES,
    TIERS,
    distance,
    road,
    initial,
    budget,
    free,
    covered,
    evaluate,
    place,
    skip,
    validate,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.City = api;
})(globalThis);
