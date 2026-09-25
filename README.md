<h1 align="center">IntelliSupply</h1>

<p align="center">
  <b>AI digital twins that stress-test your supply chain before the real world does.</b><br/>
  🏆 Winner (1st Place): 100 Agents Hackathon, out of 600+ teams
</p>

<p align="center">
  <a href="https://intellisupply.vercel.app/"><b>Live Demo</b></a> ·
  <a href="public/demo-video.webm"><b>Demo Video</b></a> ·
  <a href="https://www.sumanlabs.in/blog/ai-agent-system-supply-chain-intellisupply"><b>Build Write-up</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React_19-20232a?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel_AI_SDK-000?logo=vercel" />
  <img src="https://img.shields.io/badge/Gemini-8e75b2?logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ecf8e?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Upstash_Redis-00e9a3?logo=redis&logoColor=white" />
</p>

---

## The problem

A port strike, a typhoon or a new tariff hits one supplier, and the damage cascades through every tier after it. Most teams find out when orders are already late.

## What IntelliSupply does

You map your supply chain as a **digital twin**: suppliers, factories, ports, warehouses, distributors and retailers, all connected on a live canvas. A team of AI agents then watches it, breaks it on purpose and tells you how to fix it.

1. **Build the twin.** Drag-and-drop canvas, or start from industry templates (automotive, electronics, pharma, energy, fashion, food & beverage). You can also just ask the copilot: *"add a port in Singapore between the supplier and the warehouse."*
2. **Monitor it live.** The Intelligence agent scans news, weather and market data for every node and scores risk from 0 to 100, with sources.
3. **Simulate disruptions.** The Scenario agent generates realistic "what if" events. The Impact agent shows how the failure cascades node by node.
4. **Get a plan.** The Strategy agent returns immediate (0–24h), short-term (1–30 days) and long-term mitigation plans with costs, then tracks execution on a kanban and Gantt timeline.

## The agent system

```
                        ┌──────────────────────┐
     user query ──────▶ │  Master Orchestrator │  (Vercel AI SDK, multi-step tool calling)
                        └──────────┬───────────┘
          ┌───────────────┬────────┴──────┬────────────────┬───────────────┐
          ▼               ▼               ▼                ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
   │Intelligence │ │  Scenario   │ │   Impact    │ │   Strategy   │ │  Forecast   │
   │ news·weather│ │ what-if gen │ │  cascade    │ │  mitigation  │ │   trends    │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬───────┘ └──────┬──────┘
          └───────────────┴───────┬───────┴───────────────┴────────────────┘
                                  ▼
        Tavily search · OpenWeather · Mem0 memory · Upstash Redis cache · Supabase
```

- **Grounded, not guessed.** Every risk event carries its sources, a severity score and a confidence score.
- **Memory.** Mem0 stores past intelligence, so agents track whether a risk is rising or fading over time.
- **Fast.** Parallel fetches, 2–3s timeouts on external APIs and a Redis cache keep scenario generation under ~10s.
- **Resilient.** Retries with backoff and tiered fallbacks, so one dead API degrades the answer instead of breaking it.
- **Copilot on the canvas.** CopilotKit actions let the assistant edit nodes, edges, risks and templates directly.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind, shadcn/ui, React Flow, Recharts, D3, Framer Motion, Zustand |
| AI | Vercel AI SDK, Gemini, CopilotKit, Mem0, Tavily |
| Data | Supabase (Postgres + Auth), Upstash Redis |
| Ops | Vercel, Sentry |

## Run it locally

```bash
git clone https://github.com/rocker1166/aignite_2025.git
cd aignite_2025
pnpm install
# create .env.local with the keys below
pnpm dev
```

```env
GOOGLE_GENERATIVE_AI_API_KEY=
TAVILY_API_KEY=
OPENWEATHER_API_KEY=
MEM0_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
OLA_MAPS_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The database schema is in [`docs/database.md`](docs/database.md). Agent deep-dives are in [`docs/agents/`](docs/agents) and [`docs/STRATEGY_AGENT_README.md`](docs/STRATEGY_AGENT_README.md).

## Team

Built in a hackathon sprint by
[Suman Jana](https://github.com/rocker1166) ·
[Arnab Mondal](https://github.com/codewarnab) ·
[Sutanuka](https://github.com/sutanukaa) ·
[Anirban Majumder](https://github.com/Anirban-Majumder) ·
[@shreyashaw05](https://github.com/shreyashaw05)
