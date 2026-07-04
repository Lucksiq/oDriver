export interface VoiceChannel {
  id: string;
  name: string;
  topic: string;
}

export const VOICE_CHANNELS: VoiceChannel[] = [
  { id: "sp-geral", name: "são-paulo-geral", topic: "Canal geral dos motoristas de São Paulo" },
  { id: "alertas-transito", name: "alertas-trânsito", topic: "Bloqueios, blitz e acidentes em tempo real" },
  { id: "dicas-plataformas", name: "dicas-plataformas", topic: "Estratégias para Uber, 99 e iFood" },
  { id: "bate-papo", name: "bate-papo", topic: "Conversa livre entre corridas" },
];
