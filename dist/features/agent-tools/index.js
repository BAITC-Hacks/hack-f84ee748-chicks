/* Необязательные WebMCP инструменты. Игра работает и в браузерах без WebMCP. */
GameFeatures.agentTools = function (ctx) {
  if (!document.modelContext?.registerTool) return;
  const tools = [
    {
      name: "read_city",
      description: "Read game decisions, budget and quality metrics.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => ({
        completedDays: ctx.current(),
        budget: ctx.C.budget(ctx.state),
        decisions: ctx.state.decisions,
        metrics: ctx.C.evaluate(ctx.state),
      }),
    },
    {
      name: "build_city_service",
      description:
        "Commit one building on a marked game plot, spend budget, and finish the current day.",
      inputSchema: {
        type: "object",
        properties: {
          x: { type: "integer", minimum: 0, maximum: 7 },
          y: { type: "integer", minimum: 0, maximum: 7 },
          tier: { type: "integer", minimum: 0, maximum: 2 },
        },
        required: ["x", "y", "tier"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (p) => {
        ctx.state = ctx.C.place(ctx.state, p);
        ctx.afterDecision("Объект построен");
        return {
          completedDays: ctx.current(),
          budget: ctx.C.budget(ctx.state),
          score: ctx.C.evaluate(ctx.state).score,
        };
      },
    },
  ];
  for (const t of tools)
    try {
      Promise.resolve(document.modelContext.registerTool(t)).catch(() => {});
    } catch {}
};
