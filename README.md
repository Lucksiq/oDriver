# oDriver

PWA de controle financeiro e comunidade para motoristas de aplicativo (Uber, 99, iFood). Implementação baseada no [PRD.md](./PRD.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Use o botão **"Entrar com conta demonstração"** na tela de login para explorar o app já populado com dados de exemplo (o primeiro clique cria a conta demo de verdade no Supabase e a preenche com corridas/despesas de amostra).

Você precisa de um `.env.local` com as credenciais do seu projeto Supabase, uma chave da TomTom Maps SDK, uma chave da OpenWeather API e um projeto LiveKit Cloud:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TOMTOM_API_KEY=
OPENWEATHER_API_KEY=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

`OPENWEATHER_API_KEY` e as variáveis `LIVEKIT_*` não têm o prefixo `NEXT_PUBLIC_` de propósito — nunca vão para o bundle do cliente. A OpenWeather é usada pela API route `app/api/weather/route.ts`; as do LiveKit são usadas por `lib/livekit.ts` para gerar tokens de acesso (`app/api/voice-token/route.ts`) e consultar contagem de participantes (`app/api/voice-rooms/route.ts`) — o navegador só recebe o token já assinado e a URL pública de WebSocket, nunca a API secret.

## Estado atual

**Autenticação, dados financeiros, admin, mapa, comunidade e voz são reais**, com Supabase Postgres + Supabase Auth + TomTom Maps + LiveKit:

- `profiles`, `rides`, `expenses`, `extra_earnings`, `goals`, `map_reports`, `posts` e `post_reactions` são tabelas reais com RLS — ver `supabase/migrations/`. As financeiras são owner-only; `map_reports` e `posts` são intencionalmente públicas (dado de comunidade, como no Waze), com Realtime habilitado.
- **Feed da comunidade** (`hooks/useCommunityPosts.ts`) é real e compartilhado: posts e reações (👍/⚠️/🔥) ficam no Supabase, com Realtime. Cada usuário só pode ter uma reação por post (toggle, igual ao comportamento antigo mockado); a troca de reação passa pela função `react_to_post()` (SECURITY DEFINER), que mantém os contadores em `posts.reactions` consistentes.
- **Ranking global/cidade** (`hooks/useRankingStats.ts`) é real e agregado, com opt-in explícito: só aparecem motoristas que ativaram "Mostrar ganhos no ranking público" no Perfil. A view `public.ranking_stats` roda com privilégio de dono (ignora o RLS owner-only de `rides`/`extra_earnings` de propósito) mas só expõe a soma semanal de ganhos por usuário optado — nunca corridas individuais de terceiros.
- **Grupos de ranking** (`hooks/useRankingGroups.ts`, `hooks/useGroupRanking.ts`) são reais: criar grupo (público ou privado, com métrica/período configuráveis), descobrir grupos públicos, entrar por código de convite, sair. `ranking_groups`/`ranking_group_members` com RLS; criação/entrada/ranking passam por funções `SECURITY DEFINER` (`create_ranking_group`, `join_ranking_group`, `get_group_ranking`) que mantêm o limite de membros e o cálculo por métrica (ganhos/corridas/lucro/km) consistentes sem expor dados de fora do grupo. Estar num grupo privado é o próprio consentimento do usuário para compartilhar aquele dado com aquele grupo específico — independente do opt-in global do ranking público.
- **Badges** (`components/community/BadgeGrid.tsx`) continuam calculadas no cliente a partir dos dados reais (corridas, metas, reports do mapa, posição no ranking, premium) — não há tabela `user_badges` ainda, já que não existe hoje nenhuma tela que precise mostrar conquistas de outro usuário.
- Login/registro usam `supabase.auth.signUp` / `signInWithPassword`; um trigger em `auth.users` cria automaticamente o `profiles` correspondente.
- `hooks/useRides.ts`, `hooks/useFinances.ts`, `hooks/useGoals.ts`, `hooks/useMapReports.ts` e `providers/AuthProvider.tsx` substituem os antigos stores de Zustand para esses domínios.
- `profiles.is_admin` + RLS somente-leitura para admins + painel em `/admin` (`app/admin/page.tsx`) com estatísticas da plataforma e lista de usuários.
- `/map` (`components/map/TomTomMap.tsx`) usa `@tomtom-international/web-sdk-maps`: mapa real com camada de trânsito ao vivo e um marcador pulsante de "você está aqui", centralizado no GPS do navegador (fallback: geocodifica a cidade cadastrada no perfil via TomTom Search API; último fallback: São Paulo). Um aviso aparece quando não é possível usar o GPS, com botão para tentar de novo. Toque no mapa para marcar o local de uma ocorrência — os reports (acidente/bloqueio/radar/zona de risco/ponto quente) são compartilhados em tempo real entre todos os usuários. `components/map/GoogleMap.tsx` (integração original com `@vis.gl/react-google-maps`) foi mantido no repositório sem uso, a pedido, caso queiram voltar a ele — foi descartado por bloqueio de billing no Google Cloud do projeto, não por limitação técnica.
- O dashboard (`components/dashboard/WeatherBadge.tsx`) mostra cidade + temperatura atual via OpenWeather, usando o mesmo GPS-com-fallback-de-perfil (`hooks/useWeather.ts`, `app/api/weather/route.ts`).
- **Login com Google** está com o botão funcional (`signInWithOAuth`), mas só funciona depois de configurar o provedor Google no dashboard do Supabase (Authentication → Providers → Google) com um client OAuth do Google Cloud Console — isso é uma configuração manual, não automatizável por aqui.
- Por padrão, novos projetos Supabase exigem confirmação de e-mail antes do primeiro login funcionar. Se estiver testando localmente sem um provedor de e-mail configurado, desative "Confirm email" em Authentication → Sign In / Providers → Email.
- **Canais de voz** (`hooks/useVoiceRoom.ts`, `components/voice/*`) usam LiveKit de verdade: 4 canais fixos (por enquanto — `lib/voice-channels.ts`), entrar/sair com áudio real via WebRTC, indicador de quem está falando (detecção real de nível de áudio do LiveKit, não mais simulado), push-to-talk, silenciar microfone. `app/api/voice-token/route.ts` gera um token de acesso assinado no servidor (nunca expõe `LIVEKIT_API_SECRET` ao cliente) e valida o canal contra a lista fixa antes de emitir o token; `app/api/voice-rooms/route.ts` expõe a contagem de participantes online por canal via `RoomServiceClient`.

**Ainda mockado** — fora do escopo desta rodada:

- **Premium** (`app/(app)/premium`) — simula a assinatura direto no `profiles.is_premium`, sem Stripe.

## Próximos passos para produção

1. Integrar Stripe na tela `app/(app)/premium`.
2. Configurar o provedor Google no Supabase Auth (ver acima) se o login social for necessário.
3. `@tomtom-international/web-sdk-maps` está descontinuado pela TomTom em favor do `@tomtom-org/maps-sdk` (API bem diferente, baseada em módulos) — vale reavaliar a migração quando o novo pacote atingir 1.0 e tiver documentação madura.
4. Canais de voz privados para grupos de ranking (Premium, PRD seção 4.7) e histórico de quem passou pelo canal nas últimas 24h — ambos exigiriam armazenar eventos de presença (webhooks do LiveKit), fora do escopo desta rodada.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth + Realtime) · TomTom Maps (`@tomtom-international/web-sdk-maps`) · LiveKit (`livekit-client` + `livekit-server-sdk`) · React Hook Form + Zod · Recharts · next-themes.
