import { addMinutes, startOfDay, subDays } from "date-fns";
import { DEMO_CITY, jitterNear } from "./geo";
import type {
  Expense,
  ExtraEarning,
  MapReport,
  Post,
  RankingEntry,
  Ride,
  VoiceChannel,
} from "./types";

/** Deterministic PRNG so server and client render identical seed data (avoids hydration mismatch). */
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260702);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const range = (min: number, max: number) => min + rand() * (max - min);

export const ANCHOR = startOfDay(new Date());

const DRIVER_NAMES = [
  "Diego Martins",
  "Fernanda Souza",
  "João Pedro Alves",
  "Marcos Vinícius",
  "Aline Ferreira",
  "Ricardo Lima",
  "Patrícia Gomes",
  "Bruno Rocha",
  "Camila Dias",
  "Eduardo Santos",
  "Juliana Castro",
  "Rafael Nunes",
  "Larissa Pereira",
  "Thiago Barbosa",
  "Vanessa Ramos",
];

function generateRides(): Ride[] {
  const rides: Ride[] = [];
  const platforms: Ride["platform"][] = ["uber", "99", "ifood", "other"];

  for (let daysAgo = 9; daysAgo >= 0; daysAgo--) {
    const day = subDays(ANCHOR, daysAgo);
    const targetCount = daysAgo === 0 ? 6 : Math.floor(range(2, 5));
    let daySum = 0;
    for (let i = 0; i < targetCount; i++) {
      const amount = Number(range(9, 42).toFixed(2));
      const startedAt = addMinutes(day, Math.floor(range(7 * 60, 22 * 60)));
      const durationMinutes = Math.floor(range(8, 35));
      rides.push({
        id: `seed-ride-${daysAgo}-${i}`,
        platform: pick(platforms),
        amount,
        distanceKm: Number(range(2, 18).toFixed(1)),
        durationMinutes,
        startedAt: startedAt.toISOString(),
        endedAt: addMinutes(startedAt, durationMinutes).toISOString(),
        rideType: rand() > 0.85 ? "delivery" : "passenger",
        rating: Math.round(range(4, 5) * 10) / 10,
        createdAt: startedAt.toISOString(),
      });
      daySum += amount;
    }
    // Ensure today comfortably clears the demo daily goal (R$ 200) for the badge/progress demo.
    if (daysAgo === 0) {
      let extra = 0;
      while (daySum + extra < 230) {
        const amount = Number(range(20, 38).toFixed(2));
        extra += amount;
        rides.push({
          id: `seed-ride-boost-${rides.length}`,
          platform: pick(platforms),
          amount,
          distanceKm: Number(range(3, 12).toFixed(1)),
          durationMinutes: Math.floor(range(10, 25)),
          startedAt: day.toISOString(),
          rideType: "passenger",
          createdAt: addMinutes(day, Math.floor(range(60, 20 * 60))).toISOString(),
        });
      }
    }
  }
  return rides;
}

function generateExpenses(): Expense[] {
  const expenses: Expense[] = [];
  for (let daysAgo = 9; daysAgo >= 0; daysAgo -= 3) {
    const day = subDays(ANCHOR, daysAgo);
    const liters = Number(range(28, 38).toFixed(2));
    const pricePerLiter = Number(range(5.79, 6.19).toFixed(2));
    expenses.push({
      id: `seed-fuel-${daysAgo}`,
      category: "fuel",
      subcategory: "gasolina",
      amount: Number((liters * pricePerLiter).toFixed(2)),
      liters,
      pricePerLiter,
      description: "Abastecimento",
      occurredAt: addMinutes(day, 8 * 60).toISOString(),
      createdAt: addMinutes(day, 8 * 60).toISOString(),
    });
  }
  expenses.push({
    id: "seed-maintenance-1",
    category: "maintenance",
    subcategory: "troca de óleo",
    amount: 180,
    description: "Troca de óleo + filtro",
    occurredAt: subDays(ANCHOR, 6).toISOString(),
    createdAt: subDays(ANCHOR, 6).toISOString(),
  });
  expenses.push({
    id: "seed-maintenance-2",
    category: "maintenance",
    subcategory: "lavagem",
    amount: 35,
    description: "Lava-rápido",
    occurredAt: subDays(ANCHOR, 2).toISOString(),
    createdAt: subDays(ANCHOR, 2).toISOString(),
  });
  expenses.push({
    id: "seed-tax-1",
    category: "tax",
    subcategory: "seguro",
    amount: 22.5,
    description: "Rateio diário do seguro",
    occurredAt: subDays(ANCHOR, 1).toISOString(),
    createdAt: subDays(ANCHOR, 1).toISOString(),
  });
  for (let daysAgo = 8; daysAgo >= 0; daysAgo -= 4) {
    expenses.push({
      id: `seed-food-${daysAgo}`,
      category: "food",
      amount: Number(range(15, 32).toFixed(2)),
      description: "Almoço",
      occurredAt: subDays(ANCHOR, daysAgo).toISOString(),
      createdAt: subDays(ANCHOR, daysAgo).toISOString(),
    });
  }
  return expenses;
}

function generateExtraEarnings(): ExtraEarning[] {
  return [
    {
      id: "seed-tip-1",
      category: "tip",
      amount: 10,
      description: "Gorjeta em dinheiro",
      occurredAt: subDays(ANCHOR, 1).toISOString(),
    },
    {
      id: "seed-bonus-1",
      category: "bonus",
      amount: 45,
      description: "Bônus de pico Uber",
      occurredAt: subDays(ANCHOR, 3).toISOString(),
    },
    {
      id: "seed-tip-2",
      category: "tip",
      amount: 6,
      description: "Gorjeta em dinheiro",
      occurredAt: subDays(ANCHOR, 5).toISOString(),
    },
  ];
}

export interface GoalHistoryEntry {
  id: string;
  date: string;
  amount: number;
  achieved: boolean;
}

function generateGoalsHistory(): GoalHistoryEntry[] {
  const entries: GoalHistoryEntry[] = [];
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const achieved = daysAgo <= 6 ? true : rand() > 0.4;
    entries.push({
      id: `seed-goal-${daysAgo}`,
      date: subDays(ANCHOR, daysAgo).toISOString(),
      amount: 200,
      achieved,
    });
  }
  return entries;
}

function generatePosts(): Post[] {
  const templates: { type: Post["type"]; content: string }[] = [
    { type: "alert", content: "Bloqueio na Marginal Tietê sentido Castelo Branco, evitem!" },
    { type: "tip", content: "Sexta à noite na Vila Madalena tá pagando muito bem, corridas curtas e rápidas." },
    { type: "achievement", content: "Bati minha meta semanal com 2 dias de antecedência! 🔥" },
    { type: "question", content: "Alguém sabe se o posto da Rebouças baixou o preço da gasolina?" },
    { type: "alert", content: "Blitz da Lei Seca perto do Ibirapuera, atenção ao passar por lá." },
    { type: "tip", content: "Região da Faria Lima tem hotspot forte no horário de almoço, dias úteis." },
    { type: "general", content: "Bom dia, motoristas! Que o dia de hoje traga corridas boas pra todo mundo 🙏" },
  ];
  return templates.map((t, i) => ({
    id: `seed-post-${i}`,
    authorName: pick(DRIVER_NAMES),
    authorCity: DEMO_CITY.name,
    content: t.content,
    type: t.type,
    city: DEMO_CITY.name,
    reactions: {
      useful: Math.floor(range(2, 40)),
      alert: Math.floor(range(0, 12)),
      hot: Math.floor(range(0, 20)),
    },
    createdAt: subDays(ANCHOR, i * 0.4).toISOString(),
  }));
}

function generateMapReports(): MapReport[] {
  const types: MapReport["type"][] = [
    "accident",
    "block",
    "radar",
    "risk_zone",
    "hotspot",
    "accident",
    "risk_zone",
    "hotspot",
  ];
  return types.map((type, i) => {
    const point = jitterNear(DEMO_CITY, 9);
    return {
      id: `seed-report-${i}`,
      type,
      latitude: point.lat,
      longitude: point.lng,
      description: undefined,
      city: DEMO_CITY.name,
      confirmations: Math.floor(range(1, 9)),
      active: true,
      createdAt: subDays(ANCHOR, range(0, 2)).toISOString(),
    };
  });
}

export function generateRankingEntries(currentUserName: string): RankingEntry[] {
  // Own RNG instance (not the shared module-level one) so this stays
  // deterministic no matter how many times it's called during render.
  const localRand = mulberry32(777);
  const values = Array.from(
    { length: 15 },
    () => Math.floor(300 + localRand() * 1300),
  ).sort((a, b) => b - a);
  const entries: RankingEntry[] = DRIVER_NAMES.slice(0, 15).map((name, i) => ({
    userId: `seed-driver-${i}`,
    displayName: name,
    city: DEMO_CITY.name,
    value: values[i],
  }));
  // Slot the current user comfortably inside the top 10.
  const userValue = Math.round((values[4] + values[5]) / 2);
  entries.splice(5, 0, {
    userId: "current-user",
    displayName: currentUserName,
    city: DEMO_CITY.name,
    value: userValue,
    isCurrentUser: true,
  });
  return entries.sort((a, b) => b.value - a.value);
}

export function generateVoiceChannels(): VoiceChannel[] {
  return [
    {
      id: "sp-geral",
      name: "são-paulo-geral",
      topic: "Canal geral dos motoristas de São Paulo",
      city: DEMO_CITY.name,
      isPrivate: false,
      membersOnline: DRIVER_NAMES.slice(0, 6),
    },
    {
      id: "alertas-transito",
      name: "alertas-trânsito",
      topic: "Bloqueios, blitz e acidentes em tempo real",
      isPrivate: false,
      membersOnline: DRIVER_NAMES.slice(2, 5),
    },
    {
      id: "dicas-plataformas",
      name: "dicas-plataformas",
      topic: "Estratégias para Uber, 99 e iFood",
      isPrivate: false,
      membersOnline: DRIVER_NAMES.slice(4, 9),
    },
    {
      id: "bate-papo",
      name: "bate-papo",
      topic: "Conversa livre entre corridas",
      isPrivate: false,
      membersOnline: DRIVER_NAMES.slice(1, 3),
    },
  ];
}

export const seedRides = generateRides();
export const seedExpenses = generateExpenses();
export const seedExtraEarnings = generateExtraEarnings();
export const seedGoalsHistory = generateGoalsHistory();
export const seedPosts = generatePosts();
export const seedMapReports = generateMapReports();
