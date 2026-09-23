import { NextResponse } from "next/server";

export type AIFallbackAnalysis = {
  status: "fallback";
  summary: string;
  strengths: string[];
  risks: string[];
  tradeoffs: string[];
  recommendations: string[];
};

function buildFallbackAnalysis(payload: {
  beforeScore: number;
  afterScore: number;
  scoreDelta: number;
  selectedInitiatives: Array<{ name: string; category: string; cost: number }>;
}) : AIFallbackAnalysis {
  const selectedNames = payload.selectedInitiatives.map((initiative) => initiative.name);

  return {
    status: "fallback",
    summary: `Выбран сценарий с ${selectedNames.length} инициативами: общий индекс качества жизни растет с ${payload.beforeScore} до ${payload.afterScore}. Основной выигрыш достигается за счет фокусировки на ${payload.selectedInitiatives[0]?.category ?? "городских"} приоритетах и сбалансированности бюджета.`,
    strengths: [
      `Программа повышает общий показатель на ${payload.scoreDelta} баллов, что свидетельствует о заметном улучшении городской среды.`,
      "Сценарий усиливает устойчивость ключевых районов, сохраняя баланс между инфраструктурой, безопасностью и сервисами.",
      selectedNames.length > 0
        ? `Выбранные инициативы: ${selectedNames.join(", ")}.`
        : "Выбраны дополнительные меры, которые повышают качество повседневной среды.",
    ],
    risks: [
      "Если увеличить нагрузку на один сектор без параллельного финансирования соседних направлений, возможен дисбаланс в городском развитии.",
      "Рост качества жизни заметен, но требуются дальнейшие меры по поддержанию видимого эффекта в менее развитых районах.",
    ],
    tradeoffs: [
      "Бюджет ограничен, поэтому часть мер приходится приоритетно распределять в наиболее чувствительные районы.",
      "Ускоренное улучшение транспорта и безопасности может временно уступать по эффекту более медленному озеленению и социальной инфраструктуре.",
    ],
    recommendations: [
      "Сохранить текущую структуру приоритетов и отложить часть инвестиций в следующий этап, если бюджет окажется ограничен.",
      "Проверить, какие районы получили максимальный эффект, и распределить поддержку равномернее между центром и периферией.",
      "Следующая фаза должна включать социальную стабилизацию и расширение городских сервисов для поддержания роста качества жизни.",
    ],
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      {
        status: "fallback",
        summary: "Не удалось обработать входные данные, поэтому аналитика рассчитана в безопасном режиме.",
        strengths: ["Данные были недоступны для оценки, но система сохранила стабильность работы."],
        risks: ["Невозможно оценить сценарий без корректных входных метрик."],
        tradeoffs: ["Сценарный анализ временно ограничен менеджерскими ограничениями."],
        recommendations: ["Проверьте корректность входных данных и повторите симуляцию."],
      },
      { status: 200 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(buildFallbackAnalysis(payload), { status: 200 });
  }

  const prompt = `Ты — аналитик городской политики для аналитического дашборда. Тебе дан уже рассчитанный сценарий управления городом. Не рассчитывай Score и не меняй цифры. Твоя задача — объяснить результаты на основе фактов.

Информация:
- Score до: ${payload.beforeScore}
- Score после: ${payload.afterScore}
- Изменение: ${payload.scoreDelta}
- Выбранные инициативы: ${payload.selectedInitiatives
    .map((initiative: { name: string; category: string; cost: number }) => `${initiative.name} (${initiative.category}, ${initiative.cost.toLocaleString("ru-RU")} ₸)`)
    .join("; ") || "нет"}
- Направления: транспорт, озеленение, социальная инфраструктура, безопасность, городской сервис.

Верни JSON только в следующем формате:
{
  "summary": "краткое резюме",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "risks": ["риск 1", "риск 2"],
  "tradeoffs": ["компромисс 1", "компромисс 2"],
  "recommendations": ["рекомендация 1", "рекомендация 2"]
}

Пиши на русском языке. Объясняй сильные стороны, риски, компромиссы, последствия и рекомендации по улучшению сценария.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(buildFallbackAnalysis(payload), { status: 200 });
    }

    const data = await response.json();
    const text =
      data.output?.[0]?.content?.find((item: { type?: string; text?: string }) => item.type === "output_text")?.text ||
      data.output_text ||
      "";

    if (!text) {
      return NextResponse.json(buildFallbackAnalysis(payload), { status: 200 });
    }

    const parsed = JSON.parse(text);

    return NextResponse.json({
      status: "ok",
      ...parsed,
    });
  } catch {
    return NextResponse.json(buildFallbackAnalysis(payload), { status: 200 });
  }
}
