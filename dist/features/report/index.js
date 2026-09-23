/* Модуль: report. Получает состояние через ctx; не хранит отдельную копию. */
GameFeatures.report = function (ctx) {
  const {
    C,
    $,
    coord,
    notify,
    current,
    forecast,
    afterDecision,
    render,
    renderMap,
  } = ctx;
  function renderFinal() {
    const done = current() === 5;
    $("final").hidden = !done;
    if (!done) return;
    const e = C.evaluate(ctx.state),
      alt = C.counterfactual(ctx.state),
      worst = Math.min(...e.homes),
      unserved = e.homes.filter((v) => v === 20).length;
    const weak = C.TYPES[e.sectors.indexOf(Math.min(...e.sectors))].name;
    $("final").innerHTML =
      `<div class="final-row"><div><span class="eyebrow" style="color:#dff092">Твой первый район</span><h2>${e.score >= 68 ? "Город, в котором хочется жить" : e.score >= 44 ? "Район растёт. Есть куда стремиться" : "Городу нужна твоя забота"}</h2><p>${e.happy} из 12 домов достигли комфортного уровня — 68 баллов. ${unserved ? "Без новых услуг осталось домов: " + unserved + "." : "У каждого дома появилась хотя бы одна новая услуга."}</p></div><div class="final-score">${e.score}<small style="font-size:22px"> / 100</small></div></div><div class="final-log">${C.TYPES.map(
        (t, i) => {
          const b = ctx.state.decisions[i];
          return `<div class="log">${t.icon} ${t.name}<strong>${b ? coord(b) + " · " + C.TIERS[b.tier].cost + " млрд" : "Пропуск"}</strong>${b ? C.covered(b).length + " домов" : "Нет новой услуги"}</div>`;
        },
      ).join(
        "",
      )}</div><p>Слабое направление: <strong>${weak}</strong>. Минимальный комфорт дома: ${worst}/100. Резерв: ${C.budget(ctx.state)} млрд ₸.</p><div class="alt"><h3>А что, если поставить иначе?</h3>${alt ? `<p>Перенеси объект «${C.TYPES[alt.day].object}» из ${coord(ctx.state.decisions[alt.day])} на ${coord(alt)}: с тем же бюджетом индекс станет <strong>${alt.score}/100</strong> (${alt.gain >= 0 ? "+" : ""}${alt.gain}). Это лучшая найденная перестановка одного объекта.</p><button class="outline" id="show-alt">Показать альтернативный участок</button>` : "<p>Перестановка одного из построенных объектов не увеличит общий охват. Другой размер или распределение бюджета всё ещё могут изменить результат.</p>"}</div><p class="final-note">Расчёт по игровой модели. AI не подключён. Сравнение не изменяет твой город.</p><button class="outline" id="export">Скачать отчёт</button>`;
    if (alt)
      $("show-alt").onclick = () => {
        ctx.altShown = alt;
        ctx.staged = null;
        renderMap();
        $("map").scrollIntoView({ behavior: "smooth", block: "center" });
      };
    $("export").onclick = exportReport;
  }
  function exportReport() {
    const e = C.evaluate(ctx.state),
      text =
        `МОЯ АСТАНА — ИТОГ ИГРЫ\n\nКачество жизни: ${e.score}/100\nОстаток бюджета: ${C.budget(ctx.state)} млрд ₸\nКомфортных домов: ${e.happy}/12\n\n` +
        C.TYPES.map((t, i) => {
          const b = ctx.state.decisions[i];
          return `${i + 1}. ${t.name}: ${b ? coord(b) + ", " + C.TIERS[b.tier].name + ", " + C.TIERS[b.tier].cost + " млрд, охват " + C.covered(b).length + " домов" : "пропуск"}`;
        }).join("\n") +
        "\n\nЧисла условные. Индекс — среднее комфорта домов; каждый дом получает 20 базовых баллов и по 16 за каждую доступную услугу. AI не подключён.";
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
      );
    a.href = url;
    a.download = "Моя-Астана-отчёт.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { render: renderFinal };
};
