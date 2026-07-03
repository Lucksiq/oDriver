# oDriver

PWA de controle financeiro e comunidade para motoristas de aplicativo (Uber, 99, iFood). Implementação baseada no [PRD.md](./PRD.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Use o botão **"Entrar com conta demonstração"** na tela de login para explorar o app já populado com dados de exemplo (o primeiro clique cria a conta demo de verdade no Supabase e a preenche com corridas/despesas de amostra).

Você precisa de um `.env.local` com as credenciais do seu projeto Supabase, uma chave da TomTom Maps SDK e uma chave da OpenWeather API:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TOMTOM_API_KEY=
OPENWEATHER_API_KEY=
```

`OPENWEATHER_API_KEY` não tem o prefixo `NEXT_PUBLIC_` de propósito — ela nunca vai para o bundle do cliente, só é usada pela API route `app/api/weather/route.ts`, que o navegador chama sem nunca ver a chave.

## Estado atual

**Autenticação, dados financeiros, admin e mapa são reais**, com Supabase Postgres + Supabase Auth + TomTom Maps:

- `profiles`, `rides`, `expenses`, `extra_earnings`, `goals` e `map_reports` são tabelas reais com RLS — ver `supabase/migrations/`. As financeiras são owner-only; `map_reports` é intencionalmente pública (dado de comunidade, como no Waze), com Realtime habilitado.
- Login/registro usam `supabase.auth.signUp` / `signInWithPassword`; um trigger em `auth.users` cria automaticamente o `profiles` correspondente.
- `hooks/useRides.ts`, `hooks/useFinances.ts`, `hooks/useGoals.ts`, `hooks/useMapReports.ts` e `providers/AuthProvider.tsx` substituem os antigos stores de Zustand para esses domínios.
- `profiles.is_admin` + RLS somente-leitura para admins + painel em `/admin` (`app/admin/page.tsx`) com estatísticas da plataforma e lista de usuários.
- `/map` (`components/map/TomTomMap.tsx`) usa `@tomtom-international/web-sdk-maps`: mapa real com camada de trânsito ao vivo e um marcador pulsante de "você está aqui", centralizado no GPS do navegador (fallback: geocodifica a cidade cadastrada no perfil via TomTom Search API; último fallback: São Paulo). Um aviso aparece quando não é possível usar o GPS, com botão para tentar de novo. Toque no mapa para marcar o local de uma ocorrência — os reports (acidente/bloqueio/radar/zona de risco/ponto quente) são compartilhados em tempo real entre todos os usuários. `components/map/GoogleMap.tsx` (integração original com `@vis.gl/react-google-maps`) foi mantido no repositório sem uso, a pedido, caso queiram voltar a ele — foi descartado por bloqueio de billing no Google Cloud do projeto, não por limitação técnica.
- O dashboard (`components/dashboard/WeatherBadge.tsx`) mostra cidade + temperatura atual via OpenWeather, usando o mesmo GPS-com-fallback-de-perfil (`hooks/useWeather.ts`, `app/api/weather/route.ts`).
- **Login com Google** está com o botão funcional (`signInWithOAuth`), mas só funciona depois de configurar o provedor Google no dashboard do Supabase (Authentication → Providers → Google) com um client OAuth do Google Cloud Console — isso é uma configuração manual, não automatizável por aqui.
- Por padrão, novos projetos Supabase exigem confirmação de e-mail antes do primeiro login funcionar. Se estiver testando localmente sem um provedor de e-mail configurado, desative "Confirm email" em Authentication → Sign In / Providers → Email.

**Ainda mockados no navegador** (Zustand + localStorage, `stores/`), fora do escopo desta rodada:

- **Comunidade** (`stores/communityStore.ts`) — feed, reações, ranking.
- **Canais de voz** (`stores/voiceStore.ts`, `components/voice/*`) — simula presença e "quem está falando", sem áudio real (sem LiveKit/Agora).
- **Premium** (`app/(app)/premium`) — simula a assinatura direto no `profiles.is_premium`, sem Stripe.

## Próximos passos para produção

1. Migrar comunidade/ranking/badges para tabelas reais com Supabase Realtime (ver PRD seção 8 para o schema completo dessas tabelas).
2. Trocar `stores/voiceStore.ts` + `components/voice/*` por um client real (LiveKit ou Agora) — precisa de `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`.
3. Integrar Stripe na tela `app/(app)/premium`.
4. Configurar o provedor Google no Supabase Auth (ver acima) se o login social for necessário.
5. `@tomtom-international/web-sdk-maps` está descontinuado pela TomTom em favor do `@tomtom-org/maps-sdk` (API bem diferente, baseada em módulos) — vale reavaliar a migração quando o novo pacote atingir 1.0 e tiver documentação madura.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth + Realtime) · TomTom Maps (`@tomtom-international/web-sdk-maps`) · Zustand (community/voice) · React Hook Form + Zod · Recharts · next-themes.
