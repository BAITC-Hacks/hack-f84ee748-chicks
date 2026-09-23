/* Только сборка модулей и общее состояние. Функциональность редактируйте в features/. */
(function () {
  "use strict";
  const C = City,
    $ = (id) => document.getElementById(id);
  let timer;
  const modules = [];
  const ctx = {
    C,
    $,
    state: GameFeatures.storage.load(C),
    tier: 1,
    staged: null,
    inspected: 0,
    altShown: null,
    coord: (p) => String.fromCharCode(65 + p.x) + (p.y + 1),
    notify(text) {
      $("toast").textContent = text;
      clearTimeout(timer);
      timer = setTimeout(() => {
        $("toast").textContent = "";
      }, 4500);
    },
    current: () => ctx.state.decisions.length,
    forecast: () =>
      ctx.staged && ctx.current() < 5
        ? C.place(ctx.state, ctx.staged)
        : ctx.state,
    persist: () => GameFeatures.storage.save(ctx.state, $),
    render: () => modules.forEach((module) => module.render?.()),
    renderMap: () => modules[0].render(),
    afterDecision(message) {
      ctx.staged = null;
      ctx.altShown = null;
      if (C.TIERS[ctx.tier].cost > C.budget(ctx.state))
        ctx.tier = Math.max(
          0,
          C.TIERS.findIndex((t) => t.cost <= C.budget(ctx.state)),
        );
      ctx.persist();
      ctx.render();
      $("advice").textContent =
        ctx.current() < 5
          ? "Следующий день готов. Нажми на дом, чтобы узнать его потребности."
          : "Город построен. В отчёте можно проверить альтернативное размещение.";
      ctx.notify(message);
    },
  };
  for (const name of [
    "map",
    "building",
    "residents",
    "progress",
    "advisor",
    "aiAssistant",
    "report",
    "help",
  ])
    modules.push(GameFeatures[name](ctx));
  $("undo").onclick = () => {
    if (!ctx.current()) return;
    ctx.state = { decisions: ctx.state.decisions.slice(0, -1) };
    ctx.staged = null;
    ctx.altShown = null;
    ctx.tier = C.budget(ctx.state) >= 20 ? 1 : 0;
    ctx.persist();
    ctx.render();
    $("advice").textContent = "Последнее решение отменено. Деньги возвращены.";
    ctx.notify("День отменён");
  };
  if (C.TIERS[ctx.tier].cost > C.budget(ctx.state)) ctx.tier = 0;
  ctx.render();
  ctx.persist();
  GameFeatures.agentTools?.(ctx);
})();
