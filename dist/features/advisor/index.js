/* Алгоритмический советник. Здесь можно позже подключить серверный AI-ответ. */
GameFeatures.advisor = function (ctx) {
  const { C, $, coord, notify } = ctx;
  $("recommend").onclick = () => {
    const p = C.best(ctx.state, ctx.tier);
    if (!p) {
      notify("Нет доступного варианта для текущего бюджета.");
      return;
    }
    ctx.staged = { x: p.x, y: p.y, tier: ctx.tier };
    ctx.altShown = null;
    ctx.render();
    $("advice").textContent =
      `Предлагаю ${coord(p)}: объект обслужит ${p.count} из 12 игровых домов. Это максимальный охват для выбранного размера на доступных участках. Индекс станет ${p.score}/100. Строительство ещё не подтверждено.`;
  };
  return {
    render() {
      $("recommend").disabled =
        ctx.current() >= 5 || C.TIERS[ctx.tier].cost > C.budget(ctx.state);
    },
  };
};
