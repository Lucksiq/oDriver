# oDriver

PWA de controle financeiro e comunidade para motoristas de aplicativo (Uber, 99, iFood). Implementação baseada no [PRD.md](./PRD.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Use o botão **"Entrar com conta demonstração"** na tela de login para explorar o app já populado com dados de exemplo (o primeiro clique cria a conta demo de verdade no Supabase e a preenche com corridas/despesas de amostra).

Você precisa de um `.env.local` com as credenciais do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Estado atual

**Autenticação e dados financeiros são reais**, com Supabase Postgres + Supabase Auth:

- `profiles`, `rides`, `expenses`, `extra_earnings` e `goals` são tabelas reais com RLS (dono só acessa os próprios dados) — ver `supabase/migrations/`.
- Login/registro usam `supabase.auth.signUp` / `signInWithPassword`; um trigger em `auth.users` cria automaticamente o `profiles` correspondente.
- `hooks/useRides.ts`, `hooks/useFinances.ts`, `hooks/useGoals.ts` e `providers/AuthProvider.tsx` substituem os antigos stores de Zustand para esses domínios — cada conta só vê os próprios dados.
- **Login com Google** está com o botão funcional (`signInWithOAuth`), mas só funciona depois de configurar o provedor Google no dashboard do Supabase (Authentication → Providers → Google) com um client OAuth do Google Cloud Console — isso é uma configuração manual, não automatizável por aqui.
- Por padrão, novos projetos Supabase exigem confirmação de e-mail antes do primeiro login funcionar. Se estiver testando localmente sem um provedor de e-mail configurado, desative "Confirm email" em Authentication → Sign In / Providers → Email.

**Ainda mockados no navegador** (Zustand + localStorage, `stores/`), fora do escopo desta rodada:

- **Comunidade** (`stores/communityStore.ts`) — feed, reações, ranking.
- **Mapa** (`stores/mapStore.ts`, `components/map/MapMock.tsx`) — placeholder ilustrativo, ainda não usa a Google Maps API.
- **Canais de voz** (`stores/voiceStore.ts`, `components/voice/*`) — simula presença e "quem está falando", sem áudio real (sem LiveKit/Agora).
- **Premium** (`app/(app)/premium`) — simula a assinatura direto no `profiles.is_premium`, sem Stripe.

## Próximos passos para produção

1. Migrar comunidade/ranking/badges para tabelas reais com Supabase Realtime (ver PRD seção 8 para o schema completo dessas tabelas).
2. Trocar `components/map/MapMock.tsx` pelo Google Maps JavaScript API (`@vis.gl/react-google-maps`) — precisa de `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
3. Trocar `stores/voiceStore.ts` + `components/voice/*` por um client real (LiveKit ou Agora) — precisa de `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`.
4. Integrar Stripe na tela `app/(app)/premium`.
5. Configurar o provedor Google no Supabase Auth (ver acima) se o login social for necessário.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth) · Zustand (community/map/voice) · React Hook Form + Zod · Recharts · next-themes.
