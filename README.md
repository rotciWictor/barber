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
| Camada de Serviço (SOLID) | ✅ Concluído | `QueueService` com mapeamento DB↔Frontend |
| QueueModule (UI) | ✅ Concluído | StatusCard, QueueItem, JoinQueueSheet |
| React Query (leitura + escrita) | ✅ Concluído | `useQuery` + `useMutation` + invalidação |
| Supabase RLS | ✅ Concluído | Políticas de leitura/escrita configuradas |
| Realtime (Supabase Channels) | ❌ Pendente | Fila não atualiza em tempo real entre dispositivos |
| Autenticação (Supabase Auth) | ❌ Pendente | Login do barbeiro, proteção de rotas |
| Ações do barbeiro na fila | ❌ Pendente | Chamar próximo, finalizar, remover |
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
│   └── queueService.ts      # joinQueue, getActiveQueue, updateStatus
├── modules/                 # "Capítulos DLC" — features independentes
│   └── queue/
│       ├── QueueModule.tsx   # Orquestrador (~125 linhas)
│       ├── components/
│       │   ├── StatusCard.tsx
│       │   ├── QueueItem.tsx
│       │   └── JoinQueueSheet.tsx
│       └── utils/
│           └── queueUtils.ts
├── hooks/                   # Custom hooks (vazio — aguardando Realtime)
├── components/              # UI reutilizável (vazio — aguardando growth)
├── App.tsx                  # Provider tree + App Shell
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
| Estado (cliente) | Zustand (instalado, ainda não utilizado) |
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

### Fase 1 — Fila Virtual Completa

1. **[ ] Ações do barbeiro na fila**
   - Botão "Chamar próximo" → muda status para `in_progress`
   - Botão "Finalizar" → muda status para `finished`
   - Swipe ou botão para remover da fila
   - Confirmação antes de ações destrutivas

2. **[ ] Realtime (Supabase Channels)**
   - Hook `useQueueRealtime` em `src/hooks/`
   - Subscrição em `INSERT`, `UPDATE`, `DELETE` na tabela `queue`
   - Invalidação automática do cache do React Query
   - Atualização da fila em tempo real entre dispositivos

3. **[ ] Semáforo "Aberto/Fechado" funcional**
   - Conectar o indicador do header ao campo `is_open` da barbearia
   - Toggle para o barbeiro abrir/fechar a fila
   - Bloquear entrada quando fechado

### Fase 2 — Autenticação e Proteção

1. **[ ] Supabase Auth**
   - Login simples (email/magic link ou Google)
   - Proteção das rotas do barbeiro
   - Associar `barbershop_id` ao usuário autenticado
   - Remover ID hardcoded `00000000-0000-0000-0000-000000000001`

### Fase 3 — PWA e Deploy

1. **[ ] PWA Setup**
   - `manifest.json` com ícones e cores
   - Service Worker para cache offline
   - Splash screen e instalação no celular

2. **[ ] Deploy Vercel**
   - Commitar `vercel.json`
   - Linkar repositório ao Vercel
   - Configurar env vars no painel

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
main ← develop ← feat/nome-da-feature
```

- **Commits**: Conventional Commits em inglês (`feat:`, `fix:`, `refactor:`, `chore:`)
- **Feature branches**: `feat/queue-realtime`, `feat/auth`, etc.
- **PRs**: feature → develop → main

---

## 📁 Banco de Dados (Supabase)

| Tabela | Propósito |
| -------- | ----------- |
| `barbershops` | Dados da barbearia (nome, status, tempo médio) |
| `services` | Serviços oferecidos (nome, preço, foto) |
| `queue` | Fila virtual (cliente, WhatsApp, status, horário) |
| `user_chapters` | Módulos ativos por usuário (padrão DLC) |

> **Nota**: A barbearia de teste usa o ID `00000000-0000-0000-0000-000000000001`.
> Isso deve ser substituído pelo ID real após implementar autenticação.
