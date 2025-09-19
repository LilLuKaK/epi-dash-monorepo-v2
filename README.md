# Epi Dash Monorepo (v2)

App de dashboards epidemiológicos mejorada: más gráficos, Genome track y mapa con MapLibre.

## Requisitos
- Node >= 18  (usa: corepack enable && corepack prepare pnpm@9.0.0 --activate)
- pnpm >= 9
- Go >= 1.22

## Arranque (sin Docker)
pnpm i

# Terminal A
cd services/api-go && go mod tidy && go run ./cmd/server

# Terminal B (raíz)
pnpm dev

- API: http://localhost:8080
- React Explorer: http://localhost:5173
- Vue Gallery:  http://localhost:5174