# ✂️ Gerente da Cadeira

**Micro-SaaS para barbeiros solo** — Otimizador de cadeira com custo operacional $0.

> O sistema se encaixa na rotina do barbeiro, não o contrário.
> Se ele precisar mudar de hábito para usar, o projeto já falhou.

---

## 📋 Status Atual

| Área | Status | Observações |
| ------ | -------- | ------------- |
| Scaffold (Vite + React + TS) | ✅ Concluído | React 19, TypeScript 6, Vite 8 |
| Design System (Tailwind v4) | ✅ Concluído | Dark theme, tokens de marca, animações |
| Tipagem modular | ✅ Concluído | Arquivos pequenos em `src/types/` |
| Cliente Supabase | ✅ Concluído | Tipado com `Database` genérico |
| Camada de Serviço (SOLID) | ✅ Concluído | `QueueService` + `BarbershopService` |
| QueueModule (UI) | ✅ Concluído | Visão dupla: cliente (anônima) + barbeiro (completa) |
| React Query (leitura + escrita) | ✅ Concluído | `useQuery` + `useMutation` + invalidação |
| Supabase RLS | ✅ Concluído | Políticas de leitura/escrita/update configuradas |
| Realtime (Supabase Channels) | ✅ Concluído | `useQueueRealtime` com invalidação automática |
| Ações do barbeiro na fila | ✅ Concluído | Chamar próximo, finalizar, remover (com confirmação) |
| Zustand (estado global) | ✅ Concluído | viewMode (cliente/barbeiro) persistido via localStorage |
| PIN de acesso (modo gerente) | ✅ Concluído | 4 dígitos, verificado no Supabase, persiste local |
| Semáforo Aberto/Fechado | ✅ Concluído | Toggle funcional no header (só modo barbeiro) |
| Autenticação (Supabase Auth) | ❌ Pendente | Login do barbeiro, proteção de rotas |
| PWA (manifest, SW, offline) | ❌ Pendente | Service Worker, ícones, splash screen |
| Vitrine de Serviços (Capítulo 2) | ❌ Pendente | CRUD de serviços com upload de imagem |
| Deploy (Vercel) | 🟡 Parcial | `vercel.json` criado mas não commitado |

---

## 🏗️ Arquitetura

```markdown
src/
├── core/                    # Infraestrutura central
│   ├── supabase.ts          # Cliente Supabase tipado (singleton)
│   └── ModuleRegistry.tsx   # Context API — padrão "DLC" de módulos
├── store/                   # Estado global (Zustand)
│   └── useAppStore.ts       # viewMode (customer/barber) + persist
├── types/                   # Tipagem modular (arquivos pequenos)
│   ├── barbershop.ts
│   ├── queue.ts
│   ├── service.ts
│   ├── whatsapp.ts
│   ├── user-chapter.ts
│   ├── module.ts
│   ├── database.ts          # Schema Supabase (só pro client genérico)
│   └── index.ts             # Barrel re-export
├── services/                # Camada SOLID sobre o Supabase
│   ├── queueService.ts      # joinQueue, getActiveQueue, callNext, finish, cancel
│   └── barbershopService.ts # getShop, verifyPin, toggleOpen
├── hooks/                   # Custom hooks
│   ├── useQueueRealtime.ts  # Supabase Channels → invalidação React Query
│   └── useQueueMutations.ts # Mutations da fila extraídas do QueueModule
├── modules/                 # "Capítulos DLC" — features independentes
│   └── queue/
│       ├── QueueModule.tsx   # Orquestrador dual-view (~210 linhas)
│       ├── components/
│       │   ├── StatusCard.tsx
│       │   ├── QueueItem.tsx       # Ações: chamar, finalizar, remover
│       │   ├── JoinQueueSheet.tsx
│       │   ├── CustomerQueueView.tsx # Visão anônima (sem nomes)
│       │   ├── PinSheet.tsx         # Input OTP para PIN do barbeiro
│       │   └── ConfirmDialog.tsx    # Modal de confirmação
│       └── utils/
│           └── queueUtils.ts
├── components/              # UI reutilizável (vazio — aguardando growth)
├── App.tsx                  # Provider tree + App Shell + Header funcional
├── main.tsx                 # Entry point
└── index.css                # Design system Tailwind v4
```

### Padrão "Telltale DLC"

Cada feature é um **módulo independente** (capítulo) que pode ser ativado/desativado por usuário via `user_chapters` no Supabase. O `ModuleRegistry` gerencia o registro e a ativação dinâmica.

---

## 🛠️ Stack

| Camada | Tecnologia |
| -------- | ----------- |
| Frontend | React 19, TypeScript, Vite 8 |
| Estilização | Tailwind CSS v4 |
| Estado (servidor) | TanStack React Query v5 |
| Estado (cliente) | Zustand (viewMode, persistência via localStorage) |
| Backend/DB | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Ícones | Lucide React |
| Hospedagem | Vercel (planejado) |

---

## 🚀 Rodando Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Rodar o dev server
npm run dev
```

---

## 🗺️ Próximos Passos (por prioridade)

### ~~Fase 1 — Fila Virtual Completa~~ ✅

1. **[x] Ações do barbeiro na fila** — Chamar próximo, finalizar (`finished`), remover (`cancelled`)
2. **[x] Realtime (Supabase Channels)** — `useQueueRealtime` com invalidação automática
3. **[x] Semáforo Aberto/Fechado** — Toggle funcional no header, bloqueia entrada quando fechado
4. **[x] Visão dupla** — Cliente (posições anônimas) vs Barbeiro (nomes, ações, WhatsApp)
5. **[x] PIN de acesso** — 4 dígitos OTP, verificado no Supabase, persistido local

### Fase 2 — Pronto pra Teste Real 🎯

> Objetivo: colocar na mão de um barbeiro real com segurança mínima.

1. **[ ] Autenticação do cliente**
   - Login via WhatsApp (OTP) ou Supabase Auth (magic link)
   - Impede entrada duplicada na fila (1 pessoa = 1 entrada)
   - Barbeiro continua com PIN (sem mudança)

2. **[ ] WhatsApp "Você é o próximo" + Timer de chegada**
   - Ao clicar "Chamar Próximo", abre deep link do WhatsApp com mensagem pronta
   - Mensagem: "Olá {nome}! Você é o próximo. Tem 5 minutos pra chegar!"
   - Timer de 5 min visível no app (contagem regressiva no card do cliente)
   - Se não chegou: botão "Pular" → manda pro final da fila, chama o próximo
   - Custo: $0 (deep link, não API)

3. **[ ] Deploy Vercel**
   - Commitar `vercel.json`
   - Linkar repositório ao Vercel
   - Configurar env vars no painel
   - Testar em celular real

### Fase 3 — PWA e Polish

1. **[ ] PWA Setup**
   - `manifest.json` com ícones e cores
   - Service Worker para cache offline
   - Splash screen e instalação no celular

### Fase 4 — Capítulos DLC

1. **[ ] Vitrine de Serviços (Capítulo 2)**
   - CRUD de serviços (nome, preço, foto)
   - Upload de imagem com compressão < 200KB
   - Galeria pública para o cliente

2. **[ ] Retenção (Capítulo 3)**
   - Botão "Flash Sale" para horários mortos
   - Notificação via WhatsApp Deep Links (custo $0)

3. **[ ] Analytics (Capítulo 4)**
   - Dashboard com métricas de fila, tempo médio, fluxo por dia

---

## 🔀 Git Flow

``` markdown
main ← develop (trabalho diário)
         ↑
       feat/* (só quando precisar isolar algo em paralelo)
```

- **`develop`**: branch de trabalho — commits diretos aqui
- **`feat/*`**: só quando fizer sentido trabalhar em paralelo
- **`main`**: versão estável — merge via PR quando pronto
- **Commits**: Conventional Commits em inglês (`feat:`, `fix:`, `refactor:`, `chore:`)

---

## 📁 Banco de Dados (Supabase)

| Tabela | Propósito |
| -------- | ----------- |
| `barbershops` | Dados da barbearia (nome, status, tempo médio, PIN) |
| `services` | Serviços oferecidos (nome, preço, foto) |
| `queue` | Fila virtual (cliente, WhatsApp, status: waiting/in_progress/finished/cancelled) |
| `user_chapters` | Módulos ativos por usuário (padrão DLC) |

> **Nota**: A barbearia de teste usa o ID `00000000-0000-0000-0000-000000000001`.
> Isso deve ser substituído pelo ID real após implementar autenticação.
