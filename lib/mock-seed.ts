import { DEMO_CITY } from "./geo";
import type { VoiceChannel } from "./types";

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
