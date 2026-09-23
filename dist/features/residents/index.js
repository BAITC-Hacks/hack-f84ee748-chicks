/* Модуль: residents. Получает состояние через ctx; не хранит отдельную копию. */
GameFeatures.residents = function (ctx) {
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
  function renderResident() {
    const h = C.HOMES[ctx.inspected],
      e = C.evaluate(ctx.state),
      needs = e.services[ctx.inspected],
      yes = C.TYPES.filter((_, i) => needs[i]).map((t) => t.need),
      no = C.TYPES.filter((_, i) => !needs[i]).map((t) => t.need);
    let quote = yes.length
      ? `Рядом уже есть ${yes.join(", ")}. `
      : "Нашему дому пока не хватает городских услуг. ";
    quote += no.length
      ? `Особенно ждём: ${no.slice(0, 2).join(" и ")}.`
      : "Теперь всё необходимое рядом. Спасибо за наш район!";
    $("resident-panel").innerHTML =
      `<div class="resident-head"><span class="avatar">${["👩", "👨", "👩‍🎓", "👨‍🏫"][ctx.inspected % 4]}</span><div><strong>${h.name} · дом № ${h.id + 1}</strong><small>${h.role} · ${coord(h)}</small></div></div><p class="quote">«${quote}»</p><div class="needs">${C.TYPES.map((t, i) => `<span class="need ${needs[i] ? "yes" : ""}">${needs[i] ? "✓" : "−"} ${t.name}</span>`).join("")}</div><p class="fine">Комфорт: ${e.homes[ctx.inspected]}/100 · Сценарная реплика по состоянию дома</p>`;
  }

  return { render: renderResident };
};
