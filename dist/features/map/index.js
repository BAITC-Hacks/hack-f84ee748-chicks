/* Фоновая карта и все географические метки. UI не меняет правила расчёта. */
GameFeatures.map = function (ctx) {
  const { C, $, coord, notify } = ctx;
  let zoom = 1;
  function render() {
    const e = C.evaluate(ctx.state),
      p = ctx.staged,
      served = p ? C.covered(p) : [];
    const parts = [
      `<img class="map-image" src="${CityMap.image}" alt="Карта центра Астаны: улицы, кварталы и река Есиль" draggable="false">`,
    ];
    if (p) {
      const pos = CityMap.position(p),
        radius = C.TIERS[p.tier].radius * 12.5;
      parts.push(
        `<div class="service-radius" style="left:${pos.left}%;top:${pos.top}%;width:${radius * 2}%;height:${radius * 2}%" aria-hidden="true"></div>`,
      );
    }
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        if (C.road(x, y)) continue;
        const pos = CityMap.position({ x, y }),
          h = C.HOMES.find((h) => h.x === x && h.y === y),
          bi = ctx.state.decisions.findIndex(
            (b) => b && b.x === x && b.y === y,
          ),
          built = bi >= 0,
          ghost = p && p.x === x && p.y === y,
          alt = ctx.altShown && ctx.altShown.x === x && ctx.altShown.y === y;
        const label = h
          ? `Игровой дом ${h.id + 1}, комфорт ${e.homes[h.id]} из 100`
          : built
            ? C.TYPES[bi].object
            : "Игровой участок для строительства";
        const icon = h
          ? "🏠"
          : built
            ? C.TYPES[bi].icon
            : ghost
              ? C.TYPES[ctx.current()].icon
              : "+";
        parts.push(
          `<button class="map-marker ${h ? "home-marker" : built ? "building-marker" : "plot-marker"} ${ghost ? "staged-marker" : ""} ${h && served.includes(h.id) ? "served-marker" : ""} ${h && h.id === ctx.inspected ? "inspected-marker" : ""} ${alt ? "alternative-marker" : ""}" data-x="${x}" data-y="${y}" style="left:${pos.left}%;top:${pos.top}%" aria-label="${coord({ x, y })}. ${label}" title="${coord({ x, y })} · ${label}"><span aria-hidden="true">${icon}</span>${h ? `<b class="house-number">${h.id + 1}</b><i class="home-dot ${e.homes[h.id] >= 68 ? "good" : e.homes[h.id] >= 36 ? "okay" : "poor"}"></i>` : ""}</button>`,
        );
      }
    $("map").innerHTML = parts.join("");
    $("map").querySelector("img").onerror = () => {
      if (!$("map").querySelector(".map-error"))
        $("map").insertAdjacentHTML(
          "afterbegin",
          '<p class="map-error">Картинка карты не загрузилась. Проверьте папку features/map/assets. Игровые метки доступны.</p>',
        );
    };
    $("map-caption").textContent = ctx.altShown
      ? `Альтернативное место: ${C.TYPES[ctx.altShown.day].object}, ${coord(ctx.altShown)}. Город не изменён.`
      : p
        ? `${coord(p)} · Услугу получат ${served.length} домов с зелёным контуром. Круг показывает условный радиус.`
        : "Нажми на «+», чтобы разместить объект, или на дом, чтобы узнать потребности жителей.";
  }
  $("map").onclick = (event) => {
    const b = event.target.closest("[data-x]");
    if (!b) return;
    const x = Number(b.dataset.x),
      y = Number(b.dataset.y),
      h = C.HOMES.find((h) => h.x === x && h.y === y);
    if (h) {
      ctx.inspected = h.id;
      ctx.render();
      return;
    }
    const bi = ctx.state.decisions.findIndex(
      (v) => v && v.x === x && v.y === y,
    );
    if (bi >= 0) {
      const v = ctx.state.decisions[bi];
      notify(`${C.TYPES[bi].object} · обслужено домов: ${C.covered(v).length}`);
      return;
    }
    if (ctx.current() === 5) {
      notify(
        "Все пять решений приняты. Можно отменить последнее или начать заново.",
      );
      return;
    }
    if (C.TIERS[ctx.tier].cost > C.budget(ctx.state)) {
      notify("Бюджета не хватает. Выбери меньший объект или пропусти день.");
      return;
    }
    if (C.free(ctx.state, x, y)) {
      ctx.staged = { x, y, tier: ctx.tier };
      ctx.altShown = null;
      ctx.render();
    }
  };
  function resize() {
    $("map").style.width = `${zoom * 100}%`;
    $("zoom-label").textContent = Math.round(zoom * 100) + "%";
    $("zoom-in").disabled = zoom >= 2;
    $("zoom-out").disabled = zoom <= 1;
  }
  $("zoom-in").onclick = () => {
    zoom = Math.min(2, zoom + 0.25);
    resize();
  };
  $("zoom-out").onclick = () => {
    zoom = Math.max(1, zoom - 0.25);
    resize();
  };
  return { render };
};
