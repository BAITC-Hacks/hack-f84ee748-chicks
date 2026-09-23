/* Read-only chat companion for the existing algorithmic advisor. */
GameFeatures.aiAssistant = function (ctx) {
  const root = ctx.$("ai-assistant");
  if (!root) return {};

  const unavailable = "AI-консультант временно недоступен. Вы можете продолжить игру.";
  const questions = [
    "Что улучшить в первую очередь?",
    "Почему низкий транспорт?",
    "Что нужно жителям?",
    "Какой объект выбрать?",
  ];
  const history = [];
  let loading = false;
  root.innerHTML = `
    <div class="ai-head"><strong>AI-консультант</strong><span class="badge">ТОЛЬКО СОВЕТЫ</span></div>
    <div class="ai-messages" id="ai-messages" role="log" aria-live="polite" aria-label="Чат с AI-консультантом"></div>
    <div class="ai-suggestions" aria-label="Примеры вопросов">${questions.map((q) => `<button type="button" class="ai-suggestion">${q}</button>`).join("")}</div>
    <form class="ai-form" id="ai-form"><label class="ai-sr-only" for="ai-input">Ваш вопрос</label><input id="ai-input" maxlength="1000" autocomplete="off" placeholder="Задайте вопрос о вашем городе…" required><button class="primary" id="ai-send" type="submit">Отправить</button></form>
    <p class="ai-status" id="ai-status" role="status" aria-live="polite"></p>`;

  const messages = root.querySelector("#ai-messages");
  const status = root.querySelector("#ai-status");
  const input = root.querySelector("#ai-input");
  const send = root.querySelector("#ai-send");
  function addMessage(role, text) {
    const item = document.createElement("div");
    item.className = `ai-message ${role}`;
    const label = document.createElement("strong");
    label.textContent = role === "assistant" ? "AI" : "Вы";
    const body = document.createElement("p");
    body.textContent = text;
    item.append(label, body);
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
  }
  function snapshot() {
    const evaluation = ctx.C.evaluate(ctx.state);
    return {
      day: Math.min(ctx.current() + 1, 5),
      completedDays: ctx.current(),
      budget: ctx.C.budget(ctx.state),
      qualityOfLife: evaluation.score,
      serviceIndicators: ctx.C.TYPES.map((type, i) => ({ name: type.name, score: evaluation.sectors[i] })),
      decisions: ctx.state.decisions.map((decision, i) => decision ? {
        day: i + 1,
        building: ctx.C.TYPES[i]?.object ?? "неизвестно",
        tier: ctx.C.TIERS[decision.tier]?.name ?? "неизвестно",
        cost: ctx.C.TIERS[decision.tier]?.cost ?? null,
        plot: ctx.coord(decision),
      } : { day: i + 1, skipped: true }),
      residentNeeds: ctx.C.HOMES.map((home, i) => ({
        resident: home.name,
        role: home.role,
        plot: ctx.coord(home),
        people: home.people,
        comfort: evaluation.homes[i],
        missingServices: ctx.C.TYPES.filter((_, j) => !evaluation.services[i][j]).map((type) => type.name),
      })),
      selectedBuilding: {
        type: ctx.C.TYPES[ctx.current()]?.object ?? null,
        tier: ctx.C.TIERS[ctx.tier]?.name ?? null,
        cost: ctx.C.TIERS[ctx.tier]?.cost ?? null,
      },
      inspectedResident: ctx.C.HOMES[ctx.inspected]?.name ?? null,
      stagedPreview: ctx.staged ? { plot: ctx.coord(ctx.staged), tier: ctx.C.TIERS[ctx.staged.tier]?.name } : null,
      map: { grid: "8×8 условная игровая сетка", coordinateFormat: "A1–H8", roads: "линии x=3 или y=3 недоступны для строительства" },
    };
  }
  async function ask(question) {
    if (loading || !question.trim()) return;
    loading = true;
    status.textContent = "AI-консультант готовит ответ…";
    send.disabled = true;
    input.disabled = true;
    addMessage("user", question);
    history.push({ role: "user", content: question });
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, gameState: snapshot(), history: history.slice(-8, -1) }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== "string" || !data.answer.trim()) throw new Error("assistant unavailable");
      addMessage("assistant", data.answer);
      history.push({ role: "assistant", content: data.answer });
      status.textContent = "";
    } catch {
      history.pop();
      status.textContent = unavailable;
    } finally {
      loading = false;
      send.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }
  addMessage("assistant", "Я вижу состояние вашего района. Чем помочь?");
  root.querySelector("#ai-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    ask(question);
  });
  root.querySelectorAll(".ai-suggestion").forEach((button) => button.addEventListener("click", () => ask(button.textContent)));
  return { render() {} };
};
