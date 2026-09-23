/* Инструкция и подтверждение новой игры. */
GameFeatures.help = function (ctx) {
  const { $ } = ctx;
  $("help").onclick = () => $("help-dialog").showModal();
  $("reset").onclick = () => $("reset-dialog").showModal();
  $("confirm-reset").onclick = () => {
    ctx.state = ctx.C.initial();
    ctx.tier = 1;
    ctx.staged = null;
    ctx.inspected = 0;
    ctx.altShown = null;
    $("reset-dialog").close();
    ctx.persist();
    ctx.render();
    $("advice").textContent =
      "Новый город, тот же бюджет. Попробуй другую стратегию.";
    ctx.notify("Новая игра: 100 млрд ₸ и пять решений.");
  };
  return {};
};
