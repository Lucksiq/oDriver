# oDriver

PWA de controle financeiro e comunidade para motoristas de aplicativo (Uber, 99, iFood). Implementação baseada no [PRD.md](./PRD.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Use o botão **"Entrar com conta demonstração"** na tela de login para explorar o app já populado com dados de exemplo (corridas, despesas, posts, ranking, badges).

## Estado atual: frontend com dados mockados

Esta primeira versão implementa **todas as telas e fluxos do MVP (PRD seção 4)** rodando inteiramente no navegador, sem backend:

- Autenticação, onboarding, dashboard, corridas, finanças, metas, comunidade (feed/ranking/badges) e canais de voz funcionam com **Zustand + localStorage** (`stores/`), não com Supabase.
- O **mapa** (`app/(app)/map`) é um placeholder ilustrativo com marcadores mockados — ainda não usa a Google Maps API.
- Os **canais de voz** (`app/(app)/community/voice`) simulam presença e "quem está falando", mas não fazem áudio real (sem LiveKit/Agora).
- A tela **Premium** (`app/(app)/premium`) simula a assinatura localmente — não há integração com Stripe.

Nada disso está mockado como "stub morto": os stores em `stores/` espelham os campos das tabelas do PRD (seção 8), então trocar por chamadas reais ao Supabase é uma substituição direta store por store, sem redesenhar as telas.

## Próximos passos para produção (ver PRD seções 7–8 e 15)

Para ligar os serviços reais, crie um `.env.local` com:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXTAUTH_SECRET=
SENTRY_DSN=
```

E então:
1. Rodar o schema SQL da seção 8 do PRD no Supabase e trocar os stores por queries/Realtime.
2. Trocar `components/map/MapMock.tsx` pelo Google Maps JavaScript API (`@vis.gl/react-google-maps`).
3. Trocar `stores/voiceStore.ts` + `components/voice/*` por um client real (LiveKit ou Agora).
4. Integrar Stripe na tela `app/(app)/premium`.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · React Hook Form + Zod · Recharts · next-themes.
