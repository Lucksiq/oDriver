import { startOfDay, subDays } from "date-fns";
import { DEMO_CITY } from "./geo";
import type { Post, RankingEntry, VoiceChannel } from "./types";

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

/** Shape of a row in the real `goals` table, also used by the Goals UI. */
export interface GoalHistoryEntry {
  id: string;
  date: string;
  amount: number;
  achieved: boolean;
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

export const seedPosts = generatePosts();
