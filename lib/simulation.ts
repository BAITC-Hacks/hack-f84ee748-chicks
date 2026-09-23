export const INITIAL_BUDGET = 1_000_000_000;
export const MAX_SELECTIONS = 5;

export type DirectionKey =
  | "transport"
  | "greenery"
  | "social"
  | "safety"
  | "services";

export type DirectionWeights = Record<DirectionKey, number>;

export type DistrictMetrics = Record<DirectionKey, number>;

export type District = {
  id: string;
  name: string;
  metrics: DistrictMetrics;
};

export type InitiativeCategory =
  | "transport"
  | "greenery"
  | "social"
  | "safety"
  | "services";

export type Initiative = {
  id: string;
  name: string;
  description: string;
  category: InitiativeCategory;
  cost: number;
  affectedDistricts: string[];
  effects: Partial<Record<DirectionKey, number>>;
};

export const DIRECTION_LABELS: Record<DirectionKey, string> = {
  transport: "Транспорт",
  greenery: "Озеленение",
  social: "Социальная инфраструктура",
  safety: "Безопасность",
  services: "Городской сервис",
};

export const DIRECTION_WEIGHTS: DirectionWeights = {
  transport: 0.22,
  greenery: 0.18,
  social: 0.24,
  safety: 0.2,
  services: 0.16,
};

export const DISTRICTS: District[] = [
  {
    id: "almaty-micro",
    name: "Алматыкий массив",
    metrics: { transport: 71, greenery: 62, social: 68, safety: 73, services: 69 },
  },
  {
    id: "esil",
    name: "Есиль",
    metrics: { transport: 66, greenery: 58, social: 61, safety: 64, services: 72 },
  },
  {
    id: "saryarka",
    name: "Сарыарка",
    metrics: { transport: 59, greenery: 54, social: 57, safety: 52, services: 60 },
  },
  {
    id: "yesil",
    name: "Есиль-центр",
    metrics: { transport: 75, greenery: 70, social: 80, safety: 77, services: 82 },
  },
  {
    id: "kursy",
    name: "Курчатовский",
    metrics: { transport: 62, greenery: 67, social: 63, safety: 60, services: 66 },
  },
];

export const INITIATIVES: Initiative[] = [
  {
    id: "tr-01",
    name: "Скоростной автобусный коридор",
    description: "Запускает приоритетные линии между жилыми массивами и деловым центром.",
    category: "transport",
    cost: 210_000_000,
    affectedDistricts: ["esil", "yesil"],
    effects: { transport: 14, services: 6 },
  },
  {
    id: "tr-02",
    name: "Электробусы на магистральных маршрутах",
    description: "Модернизирует городской транспорт и сокращает простои на перегруженных линиях.",
    category: "transport",
    cost: 160_000_000,
    affectedDistricts: ["almaty-micro", "saryarka", "kursy"],
    effects: { transport: 11, safety: 4 },
  },
  {
    id: "tr-03",
    name: "Парковки Park & Ride",
    description: "Снижает заторы за счет перераспределения автопотока у входов в центр.",
    category: "transport",
    cost: 125_000_000,
    affectedDistricts: ["yesil", "esil"],
    effects: { transport: 9, services: 5 },
  },
  {
    id: "tr-04",
    name: "Велодорожки и е-байк-пункты",
    description: "Поддерживает низкоуглеродный способ передвижения и повышает связанность районов.",
    category: "transport",
    cost: 88_000_000,
    affectedDistricts: ["almaty-micro", "kursy"],
    effects: { transport: 8, greenery: 3 },
  },
  {
    id: "tr-05",
    name: "Умный светофорный узел",
    description: "Автоматически распределяет сигналы по пиковым нагрузкам и снижает задержки.",
    category: "transport",
    cost: 95_000_000,
    affectedDistricts: ["esil", "saryarka", "kursy"],
    effects: { transport: 10, safety: 3 },
  },
  {
    id: "gr-01",
    name: "Улицы-сады в жилых районах",
    description: "Создает зеленые коридоры и зоны отдыха в жилой застройке.",
    category: "greenery",
    cost: 130_000_000,
    affectedDistricts: ["almaty-micro", "kursy"],
    effects: { greenery: 16, social: 5 },
  },
  {
    id: "gr-02",
    name: "Обновление парковых зон",
    description: "Освежает зоны отдыха и повышает привлекательность города для семей.",
    category: "greenery",
    cost: 145_000_000,
    affectedDistricts: ["yesil", "esil"],
    effects: { greenery: 18, services: 7 },
  },
  {
    id: "gr-03",
    name: "Посадка новых деревьев",
    description: "Увеличивает озеленение магистралей и снижает тепловую нагрузку.",
    category: "greenery",
    cost: 75_000_000,
    affectedDistricts: ["saryarka", "kursy"],
    effects: { greenery: 12, safety: 2 },
  },
  {
    id: "gr-04",
    name: "Вертикальные сады у школ",
    description: "Повышает качество среды вокруг учебных заведений и общественных пространств.",
    category: "greenery",
    cost: 98_000_000,
    affectedDistricts: ["esil", "yesil", "kursy"],
    effects: { greenery: 11, social: 6 },
  },
  {
    id: "gr-05",
    name: "Экологические коридоры",
    description: "Соединяет зеленые зоны и повышает комфорт прогулок по городу.",
    category: "greenery",
    cost: 118_000_000,
    affectedDistricts: ["almaty-micro", "yesil", "saryarka"],
    effects: { greenery: 15, services: 4 },
  },
  {
    id: "so-01",
    name: "Новые школы в быстрорастущих районах",
    description: "Увеличивает доступ к образованию в новых жилых массивах.",
    category: "social",
    cost: 260_000_000,
    affectedDistricts: ["saryarka", "kursy"],
    effects: { social: 18, services: 5 },
  },
  {
    id: "so-02",
    name: "Модернизация поликлиник",
    description: "Улучшает качество первичной медпомощи и сокращает очереди.",
    category: "social",
    cost: 210_000_000,
    affectedDistricts: ["almaty-micro", "esil", "yesil"],
    effects: { social: 16, services: 7 },
  },
  {
    id: "so-03",
    name: "Общественные центры для молодежи",
    description: "Создает площадки для досуга, саморазвития и культурной активности.",
    category: "social",
    cost: 145_000_000,
    affectedDistricts: ["esil", "kursy"],
    effects: { social: 14, services: 8 },
  },
  {
    id: "so-04",
    name: "Профессиональные лицеи и центры навыков",
    description: "Укрепляет кадровый потенциал и доступ к рабочим специальностям.",
    category: "social",
    cost: 180_000_000,
    affectedDistricts: ["saryarka", "yesil"],
    effects: { social: 15, services: 6 },
  },
  {
    id: "so-05",
    name: "Ознакомительные кампании по здоровью",
    description: "Повышает информированность и вовлеченность жителей в профилактику заболеваний.",
    category: "social",
    cost: 70_000_000,
    affectedDistricts: ["almaty-micro", "esil", "kursy"],
    effects: { social: 8, greenery: 3 },
  },
  {
    id: "sa-01",
    name: "Усиление патрулирования",
    description: "Увеличивает присутствие сил правопорядка и детектирует hotspots.",
    category: "safety",
    cost: 175_000_000,
    affectedDistricts: ["esil", "saryarka", "kursy"],
    effects: { safety: 18, services: 4 },
  },
  {
    id: "sa-02",
    name: "Модернизация освещения улиц",
    description: "Улучшают визуальную безопасность и повышают комфорт после темноты.",
    category: "safety",
    cost: 120_000_000,
    affectedDistricts: ["almaty-micro", "yesil", "kursy"],
    effects: { safety: 15, transport: 3 },
  },
  {
    id: "sa-03",
    name: "Системы видеонаблюдения",
    description: "Укрепляет цифровой контроль общественной безопасности.",
    category: "safety",
    cost: 155_000_000,
    affectedDistricts: ["yesil", "esil", "almaty-micro"],
    effects: { safety: 17, services: 5 },
  },
  {
    id: "sa-04",
    name: "Пункты первой помощи",
    description: "Сокращает время реакции на инциденты в общественных местах и транспортных узлах.",
    category: "safety",
    cost: 100_000_000,
    affectedDistricts: ["esil", "saryarka"],
    effects: { safety: 10, transport: 4 },
  },
  {
    id: "sa-05",
    name: "Профилактика ЧС и обучение горожан",
    description: "Снижает риски и повышает устойчивость к чрезвычайным ситуациям.",
    category: "safety",
    cost: 85_000_000,
    affectedDistricts: ["almaty-micro", "yesil", "kursy"],
    effects: { safety: 9, social: 3 },
  },
  {
    id: "sv-01",
    name: "Цифровой городской сервис",
    description: "Легко доступные цифровые услуги для жителей и предпринимателей.",
    category: "services",
    cost: 210_000_000,
    affectedDistricts: ["yesil", "esil", "almaty-micro"],
    effects: { services: 17, social: 4 },
  },
  {
    id: "sv-02",
    name: "Реконструкция общественных пространств",
    description: "Создает удобные площади для встреч, мероприятий и торговых зон.",
    category: "services",
    cost: 190_000_000,
    affectedDistricts: ["yesil", "kursy", "almaty-micro"],
    effects: { services: 15, greenery: 4 },
  },
  {
    id: "sv-03",
    name: "Сервисные точки на остановках",
    description: "Добавляет точки доступа к информации, оплате и помощи в маршрутах города.",
    category: "services",
    cost: 96_000_000,
    affectedDistricts: ["esil", "saryarka", "kursy"],
    effects: { services: 11, transport: 4 },
  },
  {
    id: "sv-04",
    name: "Обновление рынков и общественных объектов",
    description: "Улучшают повседневный городской опыт и удобство сервиса в районах.",
    category: "services",
    cost: 140_000_000,
    affectedDistricts: ["almaty-micro", "saryarka"],
    effects: { services: 13, social: 5 },
  },
  {
    id: "sv-05",
    name: "Многофункциональные общественные локации",
    description: "Комбинирует культурные, торговые и сервисные функции в одном пространстве.",
    category: "services",
    cost: 168_000_000,
    affectedDistricts: ["yesil", "esil", "kursy"],
    effects: { services: 16, social: 6 },
  },
];

export function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function getDirectionAverage(
  districts: District[],
  direction: DirectionKey,
): number {
  const total = districts.reduce((sum, district) => sum + district.metrics[direction], 0);
  return clampMetric(total / districts.length);
}

export function computeCityScore(districts: District[]): number {
  const averages = (Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).reduce(
    (acc, direction) => {
      acc[direction] = getDirectionAverage(districts, direction);
      return acc;
    },
    {} as Record<DirectionKey, number>,
  );

  const weightedScore = (Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).reduce(
    (sum, direction) => sum + averages[direction] * DIRECTION_WEIGHTS[direction],
    0,
  );

  return clampMetric(Number(weightedScore.toFixed(1)));
}

export function simulateScenario(selectedIds: string[]) {
  const selectedInitiatives = INITIATIVES.filter((initiative) =>
    selectedIds.includes(initiative.id),
  );

  const districtState: District[] = DISTRICTS.map((district) => ({
    ...district,
    metrics: { ...district.metrics },
  }));

  for (const initiative of selectedInitiatives) {
    for (const districtId of initiative.affectedDistricts) {
      const district = districtState.find((item) => item.id === districtId);
      if (!district) continue;

      for (const [direction, value] of Object.entries(initiative.effects) as [
        DirectionKey,
        number,
      ][]) {
        district.metrics[direction] = clampMetric(district.metrics[direction] + value);
      }
    }
  }

  const beforeScore = computeCityScore(DISTRICTS);
  const afterScore = computeCityScore(districtState);

  const directionBefore = Object.fromEntries(
    (Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).map((direction) => [
      direction,
      getDirectionAverage(DISTRICTS, direction),
    ]),
  ) as Record<DirectionKey, number>;

  const directionAfter = Object.fromEntries(
    (Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).map((direction) => [
      direction,
      getDirectionAverage(districtState, direction),
    ]),
  ) as Record<DirectionKey, number>;

  const usedBudget = selectedInitiatives.reduce((sum, initiative) => sum + initiative.cost, 0);
  const remainingBudget = INITIAL_BUDGET - usedBudget;

  return {
    selectedInitiatives,
    districtState,
    beforeScore,
    afterScore,
    scoreDelta: Number((afterScore - beforeScore).toFixed(1)),
    usedBudget,
    remainingBudget,
    directionBefore,
    directionAfter,
    directionDelta: Object.fromEntries(
      (Object.keys(DIRECTION_WEIGHTS) as DirectionKey[]).map((direction) => [
        direction,
        Number((directionAfter[direction] - directionBefore[direction]).toFixed(1)),
      ]),
    ) as Record<DirectionKey, number>,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₸";
}
