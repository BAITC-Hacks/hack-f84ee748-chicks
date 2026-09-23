/* Бюджет, индекс, пять дней и показатели направлений. */
GameFeatures.progress = function (ctx) {
  const { C, $ } = ctx;
  return {
    render() {
      const day = ctx.current(),
        e = C.evaluate(ctx.state);
      $("money").textContent = C.budget(ctx.state);
      $("score").textContent = e.score;
      $("undo").disabled = !day;
      $("days").innerHTML = C.TYPES.map(
        (t, i) =>
          `<div class="day ${i === day ? "active" : i < day ? "done" : ""}" ${i === day ? 'aria-current="step"' : ""}><span class="day-icon">${i < day ? "✓" : t.icon}</span><div><b>ДЕНЬ ${i + 1}</b><span>${t.name}</span></div></div>`,
      ).join("");
      $("stats").innerHTML = C.TYPES.map(
        (t, i) =>
          `<div class="stat"><span>${t.icon} ${t.name}</span><div class="bar"><span style="width:${e.sectors[i]}%"></span></div><strong>${e.sectors[i]}</strong></div>`,
      ).join("");
    },
  };
};
