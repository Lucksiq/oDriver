# PRD — oDriver
**Product Requirements Document v1.0**
*Data: 2026-07-02 | Autor: Luciano (via sessão de elicitação com Claude)*

---

## 1. Visão Geral

**oDriver** é um aplicativo web progressivo (PWA) para motoristas de aplicativo e entregadores (Uber, 99, iFood e similares) que centraliza controle financeiro, gestão de corridas, inteligência de dados, mapa em tempo real, rede social competitiva e comunicação por voz — tudo em um único lugar.

### Proposta de Valor
> "Em 3 segundos você registra uma corrida. Em 3 minutos você sabe se o dia valeu a pena. Em 3 semanas você está ganhando mais."

### Problema a Resolver
Motoristas de aplicativo gerenciam seus ganhos, despesas e corridas em planilhas improvisadas ou de cabeça. Não têm visibilidade de lucro real (descontando combustível, depreciação, impostos), não sabem os melhores horários/regiões para trabalhar, e estão isolados — sem comunidade ativa que compartilhe informação de trânsito e dicas em tempo real.

---

## 2. Público-Alvo

| Perfil | Descrição | Necessidade Principal |
|--------|-----------|----------------------|
| Motorista full-time | Vive exclusivamente da plataforma | Controle financeiro preciso, maximizar ganhos |
| Motorista part-time | Trabalha algumas horas por dia/semana | Registro rápido, meta simples de atingir |
| Motoboy/Entregador | iFood, Rappi, etc. | Rastreio de entregas, custo de combustível |

**Plataformas suportadas:** Uber, 99, iFood, Rappi e qualquer plataforma (registro manual agnóstico).

---

## 3. Modelo de Negócio

**Freemium**

| Plano | Preço | Funcionalidades |
|-------|-------|----------------|
| Gratuito | R$ 0 | Registro de ganhos/despesas (últimos 30 dias), metas básicas, mapa de trânsito, ranking público (visualizar), chat de texto na comunidade |
| Premium | R$ 19,90/mês ou R$ 149/ano | Histórico ilimitado, insights de IA, exportação de relatórios (PDF/Excel), canais de voz ao vivo, grupos privados de ranking, badge exclusivo "Pro", suporte prioritário |

**Conversão esperada:** 5–8% dos usuários ativos pagam premium (benchmarks de apps de produtividade no Brasil).

---

## 4. Funcionalidades — MVP (Fase 1)

### 4.1 Dashboard Principal
- Cards de resumo: ganhos do dia, semana, mês
- Lucro real = ganhos − (combustível + manutenção + depreciação + impostos estimados)
- Progresso visual da meta diária (barra de progresso)
- Atalho rápido "+ Corrida" e "+ Despesa" sempre visível
- Gráfico semanal de ganhos vs. despesas

### 4.2 Registro de Corridas
Formulário rápido (máximo 4 campos para não atrasar o motorista):
- **Plataforma** (Uber / 99 / iFood / Outro)
- **Valor recebido** (campo numérico, aceita vírgula)
- **Distância** (km — opcional, pré-preenchido por GPS se autorizado)
- **Observação** (texto livre — opcional)

Campos adicionais disponíveis em "modo detalhado":
- Horário de início/fim (calcula duração)
- Tipo de corrida (passageiro, entrega, pet, etc.)
- Avaliação do passageiro

**Listagem de corridas:** filtro por data, plataforma, valor mínimo/máximo. Edição e exclusão disponíveis.

### 4.3 Registro de Ganhos e Despesas
**Ganhos extras (além de corridas):**
- Bônus de plataforma
- Gorjeta em dinheiro
- Outros

**Despesas:**
- Combustível (litros + valor por litro → calcula custo/km automaticamente)
- Manutenção (categoria: óleo, pneu, freio, lavagem, outros)
- IPVA / Seguro (rateio diário automático)
- Alimentação
- Plataforma (taxa de serviço se aplicável)
- Outros

**Relatório mensal:** receita bruta, total de despesas por categoria, lucro líquido, lucro/hora trabalhada, lucro/km rodado.

### 4.4 Metas Financeiras
- Meta diária, semanal e mensal (em R$)
- Progresso em tempo real conforme corridas são registradas
- Notificação push ao atingir a meta (PWA notification)
- Projeção: "No ritmo atual, você vai atingir a meta às 18h42"
- Histórico de metas atingidas / não atingidas por mês

### 4.5 Mapa e Trânsito em Tempo Real
Powered by **Google Maps API**:
- Mapa interativo com camada de trânsito ao vivo
- Marcadores de acidentes (fonte: Google Maps + dados da comunidade oDriver)
- Marcadores de congestionamento com estimativa de tempo
- **Zonas de risco** — marcadas pelos próprios motoristas da comunidade (votação para confirmar/remover)
- **Hotspots de demanda** — áreas com maior probabilidade de corridas (heurística baseada em horário + histórico agregado anônimo da comunidade)
- Botão "Reportar Ocorrência": acidente, bloqueio, radar, zona de risco, ponto quente

### 4.6 Rede Social — Comunidade oDriver

#### Feed da Comunidade
- Posts curtos (máximo 280 caracteres) filtrados por cidade/região
- Tipos de post: dica, alerta de trânsito, conquista, pergunta
- Reações (👍 útil, ⚠️ alerta, 🔥 quente)
- Comentários simples
- Moderação: denúncia de post + bloqueio de usuário

#### Sistema de Ranking
| Ranking | Descrição |
|---------|-----------|
| Global | Todos os usuários oDriver |
| Por cidade/região | Filtro por localização declarada |
| Grupos privados | Criados por motoristas (ex: "Turma da Uber SP") — até 50 membros no free, ilimitado no premium |

**Métricas do ranking** (configurável por grupo):
- Total de corridas no período
- Total de ganhos no período
- Lucro líquido no período
- Km rodados no período

**Períodos:** diário, semanal, mensal, histórico geral.

#### Conquistas e Badges
| Badge | Critério |
|-------|----------|
| 🚗 Primeira Corrida | Registrar a primeira corrida |
| 🎯 Meta Atingida | Atingir a meta do dia |
| 🔥 Semana Perfeita | Meta atingida 7 dias seguidos |
| 💰 Mil Reais | Ganhar R$ 1.000 em uma semana |
| 🗺️ Explorador | Reportar 10 ocorrências no mapa |
| 👑 Top 10 Cidade | Entrar no top 10 do ranking da cidade |
| ⭐ oDriver Pro | Assinar o plano Premium |
| 🏆 Veterano | 1 ano de uso ativo |

Badges exibidos no perfil público do motorista.

### 4.7 Comunicação por Voz — Canais ao Vivo
Modelo **Discord-like** adaptado para motoristas (uso enquanto dirigem):

- **Canais públicos por cidade** (ex: #são-paulo-geral, #rio-centro, #curitiba)
- **Canais temáticos** (ex: #alertas-trânsito, #dicas-plataformas, #bate-papo)
- Entrar/sair do canal com um toque
- **Push-to-talk opcional** para quem prefere controle total
- Indicador visual de quem está falando
- Silenciar microfone individualmente ou silenciar canal
- Histórico de quem passou pelo canal (últimas 24h)
- Canais privados para grupos de ranking (Premium)

**Tecnologia recomendada:** LiveKit (open-source, self-hostable, WebRTC) ou Agora.io (managed, mais simples de integrar). Avaliar custo antes de escolher.

---

## 5. Funcionalidades de Inteligência (IA / Insights)

> Disponível no plano Premium. Alimentado por dados agregados e anônimos da comunidade + histórico individual.

- **Melhor horário para trabalhar:** baseado nos ganhos históricos do usuário por faixa de horário
- **Melhor região da cidade:** mapa de calor dos ganhos por bairro/zona
- **Custo real por km:** atualizado automaticamente com os abastecimentos registrados
- **Projeção de imposto:** estimativa simples de IR (Carnê-leão) e contribuição ao INSS opcional
- **Alertas inteligentes:** "Você gastou 40% mais com combustível essa semana — cheque o preço do posto"
- **Comparativo com a comunidade:** "Você ganhou 12% mais que a média dos motoristas da sua cidade essa semana" (dados anônimos)

---

## 6. Autenticação e Perfil

- Login por **e-mail + senha** ou **Google OAuth**
- Onboarding de 3 passos: plataformas que usa → cidade → meta inicial
- Perfil público: nome/apelido, cidade, badges conquistadas, estatísticas públicas (configurável)
- Perfil privado: dados financeiros, corridas, despesas (nunca públicos)
- Configurações: moeda (R$), fuso horário, notificações, privacidade do ranking

---

## 7. Stack Tecnológica

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Estado global:** Zustand
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Mapas:** Google Maps JavaScript API + @vis.gl/react-google-maps
- **PWA:** next-pwa (manifest, service worker, notificações push)

### Backend
- **BaaS:** Supabase
  - PostgreSQL (banco de dados)
  - Auth (e-mail + Google OAuth)
  - Realtime (feed da comunidade, ranking ao vivo)
  - Storage (fotos de perfil)
  - Edge Functions (lógica de IA, webhooks)
- **API Routes:** Next.js API Routes para lógica customizada

### Comunicação por Voz
- **Opção A:** LiveKit Cloud (open-source, SDK disponível para React)
- **Opção B:** Agora.io (plano gratuito generoso, fácil integração)
- Decisão final: avaliar custo/complexidade antes de implementar

### Infraestrutura
- **Hospedagem:** Vercel (deploy automático via GitHub)
- **Repositório:** GitHub
- **CI/CD:** GitHub Actions + Vercel preview deployments
- **Domínio:** a definir (sugestão: odriver.app)
- **Analytics:** Vercel Analytics + PostHog (self-hosted ou cloud)
- **Monitoramento de erros:** Sentry

### Variáveis de Ambiente Necessárias
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
LIVEKIT_API_KEY= (ou AGORA_APP_ID=)
LIVEKIT_API_SECRET= (ou AGORA_APP_CERTIFICATE=)
NEXTAUTH_SECRET=
SENTRY_DSN=
```

---

## 8. Esquema do Banco de Dados (Supabase / PostgreSQL)

```sql
-- Usuários (estende auth.users do Supabase)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE,
  display_name text,
  city text,
  state text,
  avatar_url text,
  platforms text[], -- ['uber', '99', 'ifood']
  daily_goal numeric(10,2),
  weekly_goal numeric(10,2),
  monthly_goal numeric(10,2),
  is_premium boolean DEFAULT false,
  premium_until timestamptz,
  show_earnings_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Corridas
rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  platform text, -- 'uber' | '99' | 'ifood' | 'other'
  amount numeric(10,2) NOT NULL,
  distance_km numeric(8,2),
  duration_minutes int,
  started_at timestamptz,
  ended_at timestamptz,
  ride_type text DEFAULT 'passenger', -- 'passenger' | 'delivery' | 'pet'
  notes text,
  created_at timestamptz DEFAULT now()
)

-- Despesas
expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  category text, -- 'fuel' | 'maintenance' | 'food' | 'tax' | 'other'
  subcategory text,
  amount numeric(10,2) NOT NULL,
  liters numeric(8,3), -- para combustível
  price_per_liter numeric(6,3), -- para combustível
  description text,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
)

-- Ganhos extras
extra_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  category text, -- 'bonus' | 'tip' | 'other'
  amount numeric(10,2) NOT NULL,
  description text,
  occurred_at timestamptz DEFAULT now()
)

-- Metas
goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  type text, -- 'daily' | 'weekly' | 'monthly'
  amount numeric(10,2) NOT NULL,
  period_start date,
  period_end date,
  achieved boolean DEFAULT false,
  achieved_at timestamptz,
  created_at timestamptz DEFAULT now()
)

-- Posts da comunidade
posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  content text NOT NULL,
  type text DEFAULT 'general', -- 'tip' | 'alert' | 'achievement' | 'question' | 'general'
  city text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  reactions jsonb DEFAULT '{"useful": 0, "alert": 0, "hot": 0}',
  created_at timestamptz DEFAULT now()
)

-- Ocorrências no mapa
map_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  type text, -- 'accident' | 'block' | 'radar' | 'risk_zone' | 'hotspot'
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  description text,
  city text,
  confirmations int DEFAULT 1,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
)

-- Grupos de ranking
ranking_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES profiles,
  is_private boolean DEFAULT false,
  invite_code text UNIQUE,
  max_members int DEFAULT 50,
  metric text DEFAULT 'earnings', -- 'earnings' | 'rides' | 'profit' | 'km'
  period text DEFAULT 'weekly', -- 'daily' | 'weekly' | 'monthly' | 'all_time'
  created_at timestamptz DEFAULT now()
)

-- Membros dos grupos
ranking_group_members (
  group_id uuid REFERENCES ranking_groups,
  user_id uuid REFERENCES profiles,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
)

-- Conquistas/badges do usuário
user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles,
  badge_key text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_key)
)
```

---

## 9. Arquitetura de Pastas (Next.js)

```
odriver/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # Layout com nav bottom (mobile-first)
│   │   ├── dashboard/page.tsx  # Home com resumo financeiro
│   │   ├── rides/
│   │   │   ├── page.tsx        # Listagem de corridas
│   │   │   └── new/page.tsx    # Formulário rápido
│   │   ├── finances/page.tsx   # Ganhos, despesas, relatório
│   │   ├── goals/page.tsx      # Metas
│   │   ├── map/page.tsx        # Mapa + trânsito
│   │   ├── community/
│   │   │   ├── page.tsx        # Feed da comunidade
│   │   │   ├── ranking/page.tsx
│   │   │   └── voice/page.tsx  # Canais de voz
│   │   └── profile/page.tsx
│   └── api/
│       ├── badges/route.ts
│       ├── insights/route.ts
│       └── voice-token/route.ts
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/
│   ├── rides/
│   ├── map/
│   ├── community/
│   └── voice/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts (gerado pelo Supabase CLI)
│   ├── google-maps.ts
│   ├── livekit.ts
│   └── utils.ts
├── hooks/
│   ├── useRides.ts
│   ├── useFinances.ts
│   ├── useGoals.ts
│   └── useVoiceChannel.ts
└── stores/
    └── appStore.ts             # Zustand
```

---

## 10. UX e Design

### Princípios
1. **Mobile-first** — motoristas usam no celular enquanto trabalham
2. **Velocidade** — registrar corrida em ≤ 3 toques
3. **Legibilidade** — fontes grandes, contraste alto (uso ao sol)
4. **Bottom navigation** — máximo 5 itens: Dashboard, Corridas, Mapa, Comunidade, Perfil

### Paleta de Cores (sugestão)
- **Primária:** `#1A1A2E` (azul escuro profundo) + `#E94560` (vermelho energético)
- **Sucesso:** `#00C48C` (verde)
- **Alerta:** `#FFB800` (âmbar)
- **Background:** `#F8F9FA` (claro) / Dark mode: `#0F0F1A`

### Design System
- Usar **shadcn/ui** como base
- Componentes customizados: QuickAddButton (FAB), EarningsCard, GoalProgressBar, RankingCard, VoiceChannelBar

---

## 11. Segurança e Privacidade

- **RLS (Row Level Security)** no Supabase: usuário só acessa próprios dados financeiros
- Dados financeiros **nunca expostos publicamente** — apenas o usuário vê
- Ranking usa dados agregados com opt-in explícito
- LGPD: política de privacidade clara, opção de excluir conta e todos os dados
- Rate limiting nas API routes (Vercel Edge)
- Validação com Zod em todo input do usuário
- Sanitização de posts da comunidade contra XSS

---

## 12. Integrações de Terceiros

| Serviço | Uso | Custo estimado |
|---------|-----|----------------|
| Google Maps API | Mapa, trânsito, geocoding | ~$200/mês (10k usuários) |
| Supabase | DB, Auth, Realtime, Storage | Gratuito até 500MB / $25/mês pro |
| LiveKit Cloud | Voz em tempo real | $0 até 10k min/mês, depois por uso |
| Vercel | Hospedagem | Gratuito até limites generosos |
| Sentry | Error tracking | Gratuito até 5k erros/mês |
| PostHog | Analytics | Gratuito até 1M eventos/mês |

---

## 13. Métricas de Sucesso (KPIs)

| Métrica | Meta 3 meses | Meta 6 meses |
|---------|-------------|-------------|
| Usuários cadastrados | 500 | 2.000 |
| DAU (usuários ativos/dia) | 150 | 600 |
| Corridas registradas/dia | 300 | 1.500 |
| Conversão free → premium | 3% | 6% |
| Retenção D30 | 25% | 35% |
| NPS | > 30 | > 50 |

---

## 14. Roadmap

### Fase 1 — MVP (0 a 3 meses)
- [x] Setup: Next.js + Supabase + Vercel + GitHub CI/CD
- [ ] Auth (e-mail + Google)
- [ ] Dashboard com resumo financeiro
- [ ] Registro rápido de corridas
- [ ] Registro de despesas e ganhos
- [ ] Metas com progresso em tempo real
- [ ] Mapa com trânsito (Google Maps)
- [ ] Reportar ocorrências no mapa
- [ ] Feed da comunidade (texto)
- [ ] Sistema de ranking (global + cidade)
- [ ] Badges/conquistas básicos
- [ ] Canais de voz ao vivo (LiveKit)
- [ ] PWA (instalável no celular)
- [ ] Plano Premium + pagamento (Stripe)

### Fase 2 — Crescimento (3 a 6 meses)
- [ ] Insights de IA (melhores horários, regiões)
- [ ] Estimativa de impostos (Carnê-leão)
- [ ] Exportação de relatório PDF/Excel
- [ ] Notificações push avançadas
- [ ] Grupos privados de ranking ilimitados
- [ ] App nativo (React Native / Expo) — avaliar demanda

### Fase 3 — Expansão (6 a 12 meses)
- [ ] Integração direta com APIs da Uber/99 (se disponíveis)
- [ ] Marketplace de serviços para motoristas (seguros, crédito, etc.)
- [ ] Versão em inglês/espanhol (expansão LatAm)

---

## 15. Instruções para o Claude Code

Ao receber este PRD, o Claude Code deve:

1. **Inicializar o projeto:**
   ```bash
   npx create-next-app@latest odriver --typescript --tailwind --eslint --app --src-dir=false
   cd odriver
   npx shadcn@latest init
   ```

2. **Configurar Supabase:**
   - Criar projeto no Supabase Dashboard
   - Executar o schema SQL da Seção 8
   - Ativar RLS em todas as tabelas
   - Configurar Google OAuth no Supabase Auth
   - Copiar URL e chaves para `.env.local`

3. **Configurar Vercel:**
   - Conectar repositório GitHub
   - Adicionar variáveis de ambiente
   - Ativar Vercel Analytics

4. **Ordem de implementação recomendada:**
   1. Setup base + auth + layout mobile
   2. Dashboard + registro de corridas (core do produto)
   3. Despesas + metas
   4. Mapa (Google Maps + ocorrências)
   5. Comunidade (feed + ranking)
   6. Badges/gamificação
   7. Canais de voz (LiveKit)
   8. Premium + Stripe

5. **Convenções de código:**
   - Server Components por padrão, Client Components apenas quando necessário
   - Supabase SSR para autenticação (middleware)
   - Todos os formulários com React Hook Form + Zod
   - Erro handling com toast (sonner)
   - Skeleton loading em todo fetch assíncrono

---

*PRD gerado em 2026-07-02. Versão 1.0.*
