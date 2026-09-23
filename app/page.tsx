"use client";

import { useMemo, useState } from "react";
import {
  DIRECTION_LABELS,
  DIRECTION_WEIGHTS,
  INITIATIVES,
  INITIAL_BUDGET,
  MAX_SELECTIONS,
  formatCurrency,
  simulateScenario,
  type DirectionKey,
} from "@/lib/simulation";

const categoryColors: Record<string, string> = {
  transport: "from-sky-500 to-cyan-400",
  greenery: "from-emerald-500 to-green-400",
  social: "from-violet-500 to-fuchsia-400",
  safety: "from-amber-500 to-orange-400",
  services: "from-pink-500 to-rose-400",
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function HomePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof simulateScenario> | null>(null);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    strengths: string[];
    risks: string[];
    tradeoffs: string[];
    recommendations: string[];
    status?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedInitiatives = useMemo(
    () => INITIATIVES.filter((initiative) => selectedIds.includes(initiative.id)),
    [selectedIds],
  );

  const selectedCost = useMemo(
    () => selectedInitiatives.reduce((sum, initiative) => sum + initiative.cost, 0),
    [selectedInitiatives],
  );

  const remainingBudget = INITIAL_BUDGET - selectedCost;
  const canSelectMore = selectedIds.length < MAX_SELECTIONS;

  const toggleInitiative = (initiativeId: string) => {
    setSelectedIds((current) => {
      const isSelected = current.includes(initiativeId);
      if (isSelected) {
        return current.filter((id) => id !== initiativeId);
      }

      if (current.length >= MAX_SELECTIONS) {
        return current;
      }

      const next = [...current, initiativeId];
      const nextCost = INITIATIVES.filter((initiative) => next.includes(initiative.id)).reduce(
        (sum, item) => sum + item.cost,
        0,
      );

      if (nextCost > INITIAL_BUDGET) {
        return current;
      }

      return next;
    });
  };

  const handleRunSimulation = async () => {
    if (selectedIds.length !== MAX_SELECTIONS) return;

    const scenario = simulateScenario(selectedIds);
    setResult(scenario);
    setLoading(true);

    try {
      const aiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeScore: scenario.beforeScore,
          afterScore: scenario.afterScore,
          scoreDelta: scenario.scoreDelta,
          selectedInitiatives: scenario.selectedInitiatives.map((initiative) => ({
            name: initiative.name,
            category: initiative.category,
            cost: initiative.cost,
          })),
        }),
      });

      const data = await aiResponse.json();
      setAnalysis({
        summary: data.summary || "Анализ завершен в режиме отката на базовые показатели.",
        strengths: data.strengths || [],
        risks: data.risks || [],
        tradeoffs: data.tradeoffs || [],
        recommendations: data.recommendations || [],
        status: data.status,
      });
    } catch {
      setAnalysis({
        summary: "AI-сервис временно недоступен, поэтому показан безопасный fallback-анализ.",
        strengths: ["Структура сценария логична и соответствует приоритетам города."],
        risks: ["Без AI-анализатора не всегда видны скрытые медленные эффекты."],
        tradeoffs: ["Нужно следить за бюджетным балансом и приоритизацией по районам."],
        recommendations: ["Проверить результаты на следующем этапе с дополнительным оценочным циклом."],
        status: "fallback",
      });
    } finally {
      setLoading(false);
    }
  };

  const beforeScore = result ? result.beforeScore : simulateScenario([]).beforeScore;
  const finalScore = result ? result.afterScore : beforeScore;
  const scoreDelta = result ? result.scoreDelta : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">HackAlem AI</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Аким на 5 часов</h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Выбрано</div>
                <div className="mt-2 text-2xl font-bold">{selectedIds.length} / {MAX_SELECTIONS}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Стоимость</div>
                <div className="mt-2 text-lg font-semibold">{formatCurrency(selectedCost)}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Остаток</div>
                <div className="mt-2 text-lg font-semibold">{formatCurrency(remainingBudget)}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Каталог инициатив</h2>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  {selectedIds.length} из {MAX_SELECTIONS} выбрано
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {INITIATIVES.map((initiative) => {
                  const isSelected = selectedIds.includes(initiative.id);
                  const selectedCostAfter = INITIATIVES.filter((item) =>
                    selectedIds.includes(item.id) || item.id === initiative.id,
                  ).reduce((sum, item) => sum + item.cost, 0);
                  const budgetSafe = selectedCostAfter <= INITIAL_BUDGET;

                  return (
                    <button
                      type="button"
                      key={initiative.id}
                      onClick={() => toggleInitiative(initiative.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                          : "border-slate-700 bg-slate-800/70 hover:border-slate-500"
                      } ${!canSelectMore && !isSelected ? "cursor-not-allowed opacity-60" : ""} ${!budgetSafe && !isSelected ? "opacity-50" : ""}`}
                      disabled={(!canSelectMore && !isSelected) || (!budgetSafe && !isSelected)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`inline-flex rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white ${categoryColors[initiative.category]}`}
                          >
                            {DIRECTION_LABELS[initiative.category]}
                          </span>
                          <h3 className="mt-3 text-lg font-semibold text-white">{initiative.name}</h3>
                        </div>
                        <span className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-300">
                          {isSelected ? "Выбрано" : "Не выбрано"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">{initiative.description}</p>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-200">
                        <span>Стоимость</span>
                        <strong>{formatCurrency(initiative.cost)}</strong>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Районы</span>
                        <span>{initiative.affectedDistricts.length} районов</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-xl font-bold">Параметры сценария</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Бюджет</div>
                  <div className="mt-2 text-2xl font-bold">{formatCurrency(INITIAL_BUDGET)}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Выбрано</div>
                    <div className="mt-2 text-xl font-semibold">{selectedIds.length} / {MAX_SELECTIONS}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Остаток</div>
                    <div className="mt-2 text-xl font-semibold">{formatCurrency(remainingBudget)}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>Загрузка бюджета</span>
                    <span>{Math.round((selectedCost / INITIAL_BUDGET) * 100)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${clamp((selectedCost / INITIAL_BUDGET) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-xl font-bold">Результат симуляции</h2>
              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Astana Quality of Life Score</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black">{finalScore.toFixed(1)}</span>
                  <span className={`text-lg font-semibold ${scoreDelta >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {scoreDelta >= 0 ? "+" : ""}{scoreDelta.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {Object.entries(DIRECTION_WEIGHTS).map(([direction, weight]) => {
                  const key = direction as DirectionKey;
                  const before = result ? result.directionBefore[key] : 0;
                  const after = result ? result.directionAfter[key] : 0;
                  const delta = after - before;

                  return (
                    <div key={key} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-200">{DIRECTION_LABELS[key]}</span>
                        <span className="text-slate-400">{weight * 100}%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                        <span>До: {before.toFixed(1)}</span>
                        <span>После: {after.toFixed(1)}</span>
                        <span className={delta >= 0 ? "text-emerald-300" : "text-red-300"}>Δ {delta >= 0 ? "+" : ""}{delta.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={selectedIds.length !== MAX_SELECTIONS || loading}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Считаем сценарий..." : "Запустить симуляцию"}
              </button>
            </div>
          </aside>
        </div>

        {result && (
          <section className="mt-8 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Итоговый сценарий</p>
                <h2 className="mt-2 text-3xl font-black">Результаты управления</h2>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
                +{result.scoreDelta.toFixed(1)} баллов к общему индексу
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">До</div>
                <div className="mt-2 text-3xl font-bold">{result.beforeScore.toFixed(1)}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">После</div>
                <div className="mt-2 text-3xl font-bold">{result.afterScore.toFixed(1)}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Использовано</div>
                <div className="mt-2 text-2xl font-bold">{formatCurrency(result.usedBudget)}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Остаток</div>
                <div className="mt-2 text-2xl font-bold">{formatCurrency(result.remainingBudget)}</div>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="text-xl font-bold">Before / After по направлениям</h3>
                <div className="mt-5 space-y-4">
                  {(Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).map((direction) => {
                    const before = result.directionBefore[direction];
                    const after = result.directionAfter[direction];
                    const delta = after - before;

                    return (
                      <div key={direction}>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                          <span>{DIRECTION_LABELS[direction]}</span>
                          <span className={delta >= 0 ? "text-emerald-300" : "text-red-300"}>
                            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full rounded-full bg-slate-700">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                              style={{ width: `${after}%` }}
                            />
                          </div>
                          <span className="min-w-10 text-right text-sm text-slate-300">{after.toFixed(1)}</span>
                        </div>
                        <div className="mt-1 text-right text-[11px] text-slate-400">До: {before.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                <h3 className="text-xl font-bold">Выбранные инициативы</h3>
                <div className="mt-4 space-y-3">
                  {result.selectedInitiatives.map((initiative) => (
                    <div key={initiative.id} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-white">{initiative.name}</span>
                        <span className="rounded-full border border-slate-600 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                          {DIRECTION_LABELS[initiative.category]}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">{formatCurrency(initiative.cost)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-xl font-bold">AI-анализ сценария</h3>
              {analysis ? (
                <div className="mt-5 space-y-6">
                  <div className="rounded-2xl border border-slate-600 bg-slate-900/80 p-4 text-slate-200">
                    <h4 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Краткое резюме</h4>
                    <p className="mt-3 leading-7">{analysis.summary}</p>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-600 bg-slate-900/80 p-4">
                      <h4 className="text-sm uppercase tracking-[0.2em] text-emerald-300">Сильные стороны</h4>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
                        {(analysis.strengths || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-600 bg-slate-900/80 p-4">
                      <h4 className="text-sm uppercase tracking-[0.2em] text-red-300">Риски</h4>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
                        {(analysis.risks || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-600 bg-slate-900/80 p-4">
                      <h4 className="text-sm uppercase tracking-[0.2em] text-amber-300">Компромиссы</h4>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
                        {(analysis.tradeoffs || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-600 bg-slate-900/80 p-4">
                      <h4 className="text-sm uppercase tracking-[0.2em] text-violet-300">Рекомендации</h4>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
                        {(analysis.recommendations || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-slate-400">Нажмите кнопку запуска симуляции, чтобы получить AI-анализ.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
