/* Модуль: building. Получает состояние через ctx; не хранит отдельную копию. */
GameFeatures.building = function (ctx) {
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
  function renderBuild() {
    const day = current();
    if (day === 5) {
      $("build-panel").innerHTML =
        `<span class="eyebrow">Пять дней спустя</span><div class="build-title"><span class="big-icon">🏙️</span><h2>Ты построил свой район</h2></div><p class="description">Каждая постройка изменила жизнь домов рядом. Посмотри отчёт и найди, что можно улучшить.</p><button class="primary wide" id="to-report">Смотреть итоги ↓</button>`;
      $("to-report").onclick = () =>
        $("final").scrollIntoView({ behavior: "smooth" });
      return;
    }
    const t = C.TYPES[day],
      before = C.evaluate(ctx.state),
      after = C.evaluate(forecast()),
      count = ctx.staged ? C.covered(ctx.staged).length : 0;
    const remaining = C.budget(ctx.state) - C.TIERS[ctx.tier].cost,
      daysLeft = 4 - day;
    $("build-panel").innerHTML =
      `<span class="eyebrow">День ${day + 1} / 5 · ${t.name}</span><div class="build-title"><span class="big-icon">${t.icon}</span><h2>${t.title}</h2></div><p class="description">${t.description}</p><div class="tiers">${C.TIERS.map((v, i) => `<button class="tier ${ctx.tier === i ? "chosen" : ""}" data-tier="${i}" aria-pressed="${ctx.tier === i}" ${v.cost > C.budget(ctx.state) ? "disabled" : ""}><span><strong>${v.name}</strong><small>Радиус ${v.radius} игр. ед. · до ${v.capacity} домов</small></span><span class="price">${v.cost} <small>млрд ₸</small></span></button>`).join("")}</div><div class="preview">${ctx.staged ? `<strong>${coord(ctx.staged)} · ${count} из 12 домов</strong><br>Качество жизни: ${before.score} → <strong>${after.score}</strong><br>Бюджет после: ${remaining} млрд ₸${remaining < daysLeft * 12 ? "<br><small>На минимальные постройки во все оставшиеся дни денег не хватит.</small>" : ""}` : "Нажми на свободный участок, чтобы увидеть эффект до строительства."}</div><button class="primary wide" id="build" ${!ctx.staged ? "disabled" : ""}>Построить и завершить день</button><button class="quiet skip" id="skip">Пропустить день · сохранить деньги</button>`;
    $("build").onclick = build;
    $("skip").onclick = () => {
      ctx.state = C.skip(ctx.state);
      afterDecision("День пропущен. Бюджет сохранён, услуга не добавлена.");
    };
    document.querySelectorAll("[data-tier]").forEach(
      (b) =>
        (b.onclick = () => {
          ctx.tier = Number(b.dataset.tier);
          if (ctx.staged) ctx.staged = { ...ctx.staged, tier: ctx.tier };
          ctx.altShown = null;
          render();
        }),
    );
  }
  function build() {
    if (!ctx.staged) return;
    const t = C.TYPES[current()],
      n = C.covered(ctx.staged).length;
    try {
      ctx.state = C.place(ctx.state, ctx.staged);
      afterDecision(`${t.object}: обслуживание получили ${n} домов.`);
    } catch (e) {
      notify(e.message);
    }
  }

  return { render: renderBuild };
};
