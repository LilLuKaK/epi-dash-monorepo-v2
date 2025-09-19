// scaffold.mjs
// Crea el monorepo v2 (React + Vue + Go) con datos simulados, mapa MapLibre y genome track.

import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

const files = {
  // --- root ---
  "package.json": `{
    "name": "epi-dash-monorepo",
    "private": true,
    "packageManager": "pnpm@9.0.0",
    "scripts": {
      "build": "turbo build",
      "dev": "turbo run dev --parallel",
      "lint": "turbo run lint",
      "test": "turbo run test"
    },
    "devDependencies": {
      "turbo": "^2.5.6"
    }
  }`,
  "pnpm-workspace.yaml": `packages:
  - apps/*
  - packages/*
  - services/*`,
  "turbo.json": `{
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
      "build": { "dependsOn": ["^build"], "outputs": ["dist/**", "build/**"] },
      "dev": { "cache": false, "persistent": true },
      "lint": {},
      "test": {}
    }
  }`,
  ".gitignore": `node_modules
dist
build
.vscode
.DS_Store
.env
.env.*
coverage
**/*.log
pnpm-lock.yaml`,
  ".editorconfig": `root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true`,
  "tsconfig.base.json": `{
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "jsx": "react-jsx",
      "strict": true,
      "resolveJsonModule": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "types": []
    }
  }`,
  "README.md": `# Epi Dash Monorepo (v2)

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
- Vue Gallery:  http://localhost:5174`,

  // --- packages/ui ---
  "packages/ui/package.json": `{
    "name": "@epi/ui",
    "version": "0.2.0",
    "private": true,
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
      "build": "tsc -p tsconfig.json",
      "dev": "tsc -w -p tsconfig.json",
      "lint": "echo 'no lint configured in ui'",
      "test": "echo 'no tests yet'"
    },
    "devDependencies": {
      "typescript": "^5.6.2"
    }
  }`,
  "packages/ui/tsconfig.json": `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": { "outDir": "dist", "declaration": true },
    "include": ["src"]
  }`,
  "packages/ui/src/index.ts": `export * from "./Button";
export * from "./Card";
export * from "./Select";
export * from "./Checkbox";
export * from "./Slider";`,
  "packages/ui/src/Button.tsx": `import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };
export const Button: React.FC<Props> = ({ variant = "primary", children, ...rest }) => (
  <button {...rest} style={{
    padding:"8px 12px", borderRadius:8,
    border: variant==="ghost" ? "1px solid rgba(0,0,0,0.15)" : "none",
    background: variant==="primary" ? "black" : "transparent",
    color: variant==="primary" ? "white" : "inherit", cursor:"pointer"
  }}>{children}</button>
);`,
  "packages/ui/src/Card.tsx": `import React from "react";
export const Card: React.FC<React.PropsWithChildren<{ title?: string; footer?: React.ReactNode }>> =
({ title, footer, children }) => (
  <div style={{ border:"1px solid rgba(0,0,0,0.1)", borderRadius:12, padding:16, background:"white" }}>
    {title && <div style={{ fontWeight:600, marginBottom:8 }}>{title}</div>}
    {children}
    {footer && <div style={{ marginTop:8, fontSize:12, color:"#666" }}>{footer}</div>}
  </div>
);`,
  "packages/ui/src/Select.tsx": `import React from "react";
export const Select: React.FC<{ value: string; onChange: (v: string)=>void; options:{value:string;label:string}[]; }> =
({ value, onChange, options }) => (
  <select value={value} onChange={(e)=>onChange(e.target.value)}
    style={{ padding:"6px 8px", borderRadius:8, border:"1px solid rgba(0,0,0,0.2)" }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);`,
  "packages/ui/src/Checkbox.tsx": `import React from "react";
export const Checkbox: React.FC<{ label:string; checked:boolean; onChange:(v:boolean)=>void; }> =
({ label, checked, onChange }) => (
  <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
    <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);`,
  "packages/ui/src/Slider.tsx": `import React from "react";
export const Slider: React.FC<{ min?:number; max?:number; step?:number; value:number; onChange:(v:number)=>void; }> =
({ min=0, max=100, step=1, value, onChange }) => (
  <input type="range" min={min} max={max} step={step} value={value}
    onChange={(e)=>onChange(Number(e.target.value))} style={{ width:200 }} />
);`,

  // --- packages/utils ---
  "packages/utils/package.json": `{
    "name": "@epi/utils",
    "version": "0.2.0",
    "private": true,
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
      "build": "tsc -p tsconfig.json",
      "dev": "tsc -w -p tsconfig.json",
      "lint": "echo 'no lint configured in utils'",
      "test": "echo 'no tests yet'"
    },
    "devDependencies": { "typescript": "^5.6.2" }
  }`,
  "packages/utils/tsconfig.json": `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": { "outDir": "dist", "declaration": true },
    "include": ["src"]
  }`,
  "packages/utils/src/index.ts": `export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (typeof process !== "undefined" ? (process as any).env?.VITE_API_BASE : undefined) ||
  "http://localhost:8080";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : \`\${API_BASE}\${path}\`;
  const res = await fetch(url, { ...init, headers: { "Content-Type":"application/json", ...(init?.headers||{}) } });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<T>;
}
export const fmtNumber = (n:number) => new Intl.NumberFormat().format(n);
export const fmtDate = (iso:string) => new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"2-digit"}).format(new Date(iso));`,

  // --- apps/react-explorer ---
  "apps/react-explorer/package.json": `{
    "name": "react-explorer",
    "version": "0.2.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite --port 5173",
      "build": "tsc -p tsconfig.json && vite build",
      "lint": "echo 'no lint yet'",
      "test": "echo 'no tests yet'"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.26.2",
      "recharts": "^2.12.7",
      "maplibre-gl": "^3.6.1",
      "@epi/ui": "workspace:*",
      "@epi/utils": "workspace:*"
    },
    "devDependencies": {
      "typescript": "^5.6.2",
      "vite": "^5.4.8",
      "@types/react": "^18.3.5",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1"
    }
  }`,
  "apps/react-explorer/tsconfig.json": `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": { "outDir": "dist" },
    "include": ["src", "vite-env.d.ts"]
  }`,
  "apps/react-explorer/vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins:[react()], server:{ port:5173 }, preview:{ port:4173 } });`,
  "apps/react-explorer/index.html": `<!doctype html>
<html lang="es">
  <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Epi Explorer</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>`,
  "apps/react-explorer/src/styles.css": `:root { color-scheme: light dark; }
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; background: #f7f7f9; color: #111; }
@media (prefers-color-scheme: dark) {
  html, body, #root { background: #0f1115; color: #eaeaea; }
}
a { color: inherit; }`,
  "apps/react-explorer/src/main.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Overview from "./pages/Overview";
import TimeSeries from "./pages/TimeSeries";
import Lineages from "./pages/Lineages";
import Genome from "./pages/Genome";
import Geography from "./pages/Geography";
import "./styles.css";

const router = createBrowserRouter([{
  path: "/", element: <App />,
  children: [
    { index: true, element: <Overview /> },
    { path: "timeseries", element: <TimeSeries /> },
    { path: "lineages", element: <Lineages /> },
    { path: "genome", element: <Genome /> },
    { path: "geography", element: <Geography /> }
  ]
}]);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);`,
  "apps/react-explorer/src/App.tsx": `import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@epi/ui";

const Link = ({ to, label }:{to:string;label:string}) => (
  <NavLink to={to} style={({isActive})=>({
    display:"block", padding:"8px 12px", borderRadius:8, textDecoration:"none",
    background: isActive ? "rgba(0,0,0,0.08)" : "transparent", color:"inherit"
  })}>{label}</NavLink>
);

export default function App(){
  return (
    <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", minHeight:"100vh" }}>
      <aside style={{ padding:16, borderRight:"1px solid rgba(0,0,0,0.1)" }}>
        <div style={{ fontWeight:700, marginBottom:12 }}>Epi Explorer</div>
        <div style={{ display:"grid", gap:4 }}>
          <Link to="/" label="Overview" />
          <Link to="/timeseries" label="Time Series" />
          <Link to="/lineages" label="Lineages" />
          <Link to="/genome" label="Genome" />
          <Link to="/geography" label="Geography" />
        </div>
        <div style={{ marginTop:16 }}>
          <Button onClick={()=>window.open("http://localhost:5174","_blank")}>Open Gallery (Vue)</Button>
        </div>
      </aside>
      <main style={{ padding:16 }}><Outlet /></main>
    </div>
  );
}`,
  "apps/react-explorer/src/pages/Overview.tsx": `import React from "react";
import { Card } from "@epi/ui";
import { http, fmtNumber } from "@epi/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, BarChart, Bar, Legend } from "recharts";

type Kpi = { label: string; value: number };
type TrendPoint = { date: string; cases: number; positivity: number };
type TopLin = { name: string; pct: number };
type TopReg = { region: string; value: number };

export default function Overview() {
  const [kpis, setKpis] = React.useState<Kpi[]>([]);
  const [trend, setTrend] = React.useState<TrendPoint[]>([]);
  const [topLineages, setTopLineages] = React.useState<TopLin[]>([]);
  const [topRegions, setTopRegions] = React.useState<TopReg[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    http<{ kpis: Kpi[]; trend: TrendPoint[]; top_lineages: TopLin[]; top_regions: TopReg[] }>("/api/overview")
      .then((d) => { setKpis(d.kpis); setTrend(d.trend); setTopLineages(d.top_lineages); setTopRegions(d.top_regions); })
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))" }}>
      {error && <div role="alert">Error: {error}</div>}
      {kpis.map((k,i)=>(
        <Card key={i} title={k.label}><div style={{ fontSize:28, fontWeight:700 }}>{fmtNumber(k.value)}</div></Card>
      ))}
      <Card title="Trend (Cases & Positivity)">
        <div style={{ width:"100%", height:260 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" />
              <Tooltip /><Legend />
              <Line yAxisId="left" type="monotone" dataKey="cases" dot={false} name="Cases" />
              <Line yAxisId="right" type="monotone" dataKey="positivity" dot={false} name="Positivity %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Top lineages (share)">
        <div style={{ width:"100%", height:260, display:"flex", justifyContent:"center" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={topLineages} dataKey="pct" nameKey="name" outerRadius={90} label /></PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Top regions (weekly cases)">
        <div style={{ width:"100%", height:260 }}>
          <ResponsiveContainer>
            <BarChart data={topRegions}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" /><YAxis /><Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Notes on interpretation">
        <ul>
          <li>Datos simulados para demostrar funcionalidad.</li>
          <li>Frecuencias calculadas semanalmente; tendencia suavizada.</li>
          <li>Las tasas pueden variar por cobertura y retrasos.</li>
        </ul>
      </Card>
    </div>
  );
}`,
  "apps/react-explorer/src/pages/TimeSeries.tsx": `import React from "react";
import { http, fmtDate } from "@epi/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Select, Slider, Card } from "@epi/ui";

type Point = { date: string; value: number };

export default function TimeSeries() {
  const [metric, setMetric] = React.useState("cases");
  const [smooth, setSmooth] = React.useState(0);
  const [data, setData] = React.useState<Point[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    http<{ series: Point[] }>(\`/api/timeseries?metric=\${metric}&smooth=\${smooth}\`)
      .then((d) => setData(d.series))
      .catch((e) => setError(String(e)));
  }, [metric, smooth]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display:"grid", gap:12 }}>
      <Card title="Controls">
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <label>Metric:</label>
          <Select value={metric} onChange={setMetric} options={[
            { value: "cases", label: "Cases" },
            { value: "positivity", label: "Positivity %" },
            { value: "tests", label: "Tests" }
          ]} />
          <label>Smoothing:</label>
          <Slider min={0} max={10} value={smooth} onChange={setSmooth} />
        </div>
      </Card>
      <div style={{ width:"100%", height:420 }}>
        {error && <div role="alert">Error: {error}</div>}
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d)=>fmtDate(d)} /><YAxis />
            <Tooltip labelFormatter={(d)=>fmtDate(String(d))} />
            <Line type="monotone" dataKey="value" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}`,
  "apps/react-explorer/src/pages/Lineages.tsx": `import React from "react";
import { http } from "@epi/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Checkbox, Card } from "@epi/ui";

type Row = { date: string; [key: string]: string | number };

export default function Lineages() {
  const [data, setData] = React.useState<Row[]>([]);
  const [keys, setKeys] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    http<{ data: Row[]; lineages: string[] }>("/api/lineages/frequencies?norm=pct")
      .then((d) => {
        setData(d.data); setKeys(d.lineages);
        const sel: Record<string, boolean> = {}; d.lineages.forEach(k => sel[k]=true); setSelected(sel);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const toggle = (k: string) => setSelected((s)=>({ ...s, [k]: !s[k] }));

  return (
    <div style={{ display:"grid", gap:12 }}>
      {error && <div role="alert">Error: {error}</div>}
      <Card title="Lineage filters">
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {keys.map((k)=> <Checkbox key={k} label={k} checked={!!selected[k]} onChange={()=>toggle(k)} />)}
        </div>
      </Card>
      <div style={{ width:"100%", height:420 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
            {keys.filter(k=>selected[k]).map((k)=> <Area key={k} type="monotone" dataKey={k} stackId="1" />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}`,
  "apps/react-explorer/src/pages/Genome.tsx": `import React from "react";
import { http } from "@epi/utils";
import { Card, Select } from "@epi/ui";

type Gene = { name: string; start: number; end: number };
type Mutation = { pos: number; gene: string; aa_change: string; pct: number };

const GENOME_LENGTH = 29903;

export default function Genome() {
  const [genes, setGenes] = React.useState<Gene[]>([]);
  const [mutations, setMutations] = React.useState<Mutation[]>([]);
  const [gene, setGene] = React.useState<string>("Spike");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    http<{ genes: Gene[] }>("/api/genome/genes").then((d)=>setGenes(d.genes)).catch((e)=>setError(String(e)));
  }, []);

  const loadMut = React.useCallback(() => {
    http<{ mutations: Mutation[] }>(\`/api/genome/mutations?gene=\${gene}\`)
      .then((d)=>setMutations(d.mutations)).catch((e)=>setError(String(e)));
  }, [gene]);

  React.useEffect(()=>{ loadMut(); }, [loadMut]);

  return (
    <div style={{ display:"grid", gap:12 }}>
      {error && <div role="alert">Error: {error}</div>}
      <Card title="Genome track">
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <label>Gene:</label>
          <Select value={gene} onChange={setGene} options={genes.map(g=>({value:g.name,label:g.name}))} />
        </div>
        <div style={{ marginTop:12 }}>
          <GenomeTrack genes={genes} mutations={mutations} />
        </div>
      </Card>
      <Card title={\`\${gene} — Top mutations\`}>
        <ul>
          {mutations.slice(0,12).map((m,i)=>(
            <li key={i}>{m.gene} {m.aa_change} (pos {m.pos}) — {Math.round(m.pct*1000)/10}%</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const GenomeTrack: React.FC<{ genes: Gene[]; mutations: Mutation[] }> = ({ genes, mutations }) => {
  const width = 900, height = 160, pad = 24;
  const scale = (pos:number) => pad + (pos / GENOME_LENGTH) * (width - 2*pad);
  return (
    <svg width="100%" viewBox={\`0 0 \${width} \${height}\`} role="img" aria-label="Genome track">
      <line x1={pad} y1={40} x2={width-pad} y2={40} stroke="currentColor" strokeWidth="2" />
      {genes.map((g)=>(
        <g key={g.name}>
          <rect x={scale(g.start)} y={30} width={Math.max(2, scale(g.end)-scale(g.start))} height={20}
            fill="rgba(0,0,0,0.15)" rx="4" />
          <text x={(scale(g.start)+scale(g.end))/2} y={26} fontSize="10" textAnchor="middle">{g.name}</text>
        </g>
      ))}
      {mutations.map((m,i)=>{
        const x = scale(m.pos); const y = 120 - Math.min(80, m.pct*100);
        return (<g key={i}><line x1={x} y1={120} x2={x} y2={y} stroke="currentColor" />
          <circle cx={x} cy={y} r={3} fill="currentColor" /></g>);
      })}
    </svg>
  );
};`,
  "apps/react-explorer/src/pages/Geography.tsx": `import React from "react";
import { Card } from "@epi/ui";
import { http } from "@epi/utils";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Feature = { type:"Feature"; properties:{ name:string; value:number }; geometry:{ type:"Point"; coordinates:[number,number] } };
type FC = { type:"FeatureCollection"; features: Feature[] };

export default function Geography() {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapObj = React.useRef<maplibregl.Map | null>(null);

  React.useEffect(()=>{
    if(!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-3.7, 40.4], zoom: 4.5
    });
    mapObj.current = map;
    (async ()=>{
      const geo = await http<FC>("/api/geography/points");
      map.on("load", ()=>{
        map.addSource("cases", { type:"geojson", data: geo });
        map.addLayer({
          id:"cases-circles", type:"circle", source:"cases",
          paint:{
            "circle-radius": ["interpolate", ["linear"], ["get","value"], 0,2, 1000,10, 10000,20, 30000,28],
            "circle-color": ["interpolate", ["linear"], ["get","value"], 0,"#88c", 1000,"#5a9", 10000,"#fb3", 30000,"#e55"]
          }
        });
        map.addLayer({
          id:"cases-label", type:"symbol", source:"cases",
          layout:{ "text-field":["get","name"], "text-size":10, "text-offset":[0,1.2] },
          paint:{ "text-color":"#111" }
        });
      });
    })();
    return ()=>{ map.remove(); };
  },[]);

  return <Card title="Geography — Incidence by city (simulada)">
    <div ref={mapRef} style={{ height:480, borderRadius:12, overflow:"hidden" }} />
  </Card>;
}`,
  "apps/react-explorer/vite-env.d.ts": `/// <reference types="vite/client" />`,

  // --- apps/vue-gallery ---
  "apps/vue-gallery/package.json": `{
    "name": "vue-gallery",
    "version": "0.2.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite --port 5174",
      "build": "vite build",
      "lint": "echo 'no lint yet'",
      "test": "echo 'no tests yet'"
    },
    "dependencies": { "vue": "^3.5.11", "vue-router": "^4.4.5" },
    "devDependencies": { "typescript": "^5.6.2", "vite": "^5.4.8", "@vitejs/plugin-vue": "^5.1.4" }
  }`,
  "apps/vue-gallery/tsconfig.json": `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": { "outDir": "dist", "allowJs": true },
    "include": ["src", "vite-env.d.ts"]
  }`,
  "apps/vue-gallery/vite.config.ts": `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({ plugins:[vue()], server:{ port:5174 }, preview:{ port:4174 } });`,
  "apps/vue-gallery/index.html": `<!doctype html>
<html lang="es">
  <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Epi Gallery</title></head>
  <body><div id="app"></div><script type="module" src="/src/main.ts"></script></body>
</html>`,
  "apps/vue-gallery/src/main.ts": `import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
const routes = [{ path:"/", component: App }];
const router = createRouter({ history: createWebHistory(), routes });
createApp(App).use(router).mount("#app");`,
  "apps/vue-gallery/src/App.vue": `<template>
  <main style="padding: 16px">
    <h1 style="margin-bottom: 12px;">Dashboard Gallery</h1>
    <section style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
      <div v-for="item in items" :key="item.id" style="border:1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 12px;">
        <h3 style="margin: 0 0 6px 0;">{{ item.title }}</h3>
        <p style="margin: 0 0 8px 0; color: #555;">{{ item.desc }}</p>
        <a :href="item.href" target="_blank" rel="noreferrer">Open</a>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
const items = [
  { id: "overview", title: "Global Overview", desc: "KPIs + trend + top lineages/regions", href: "http://localhost:5173/" },
  { id: "timeseries", title: "Time Series", desc: "Cases / positivity / tests + smoothing", href: "http://localhost:5173/timeseries" },
  { id: "lineages", title: "Species Frequency", desc: "Stacked area + filtros", href: "http://localhost:5173/lineages" },
  { id: "genome", title: "Genome", desc: "Track + lollipops de mutaciones", href: "http://localhost:5173/genome" },
  { id: "geography", title: "Geography", desc: "Mapa con MapLibre", href: "http://localhost:5173/geography" }
];
</script>`,
  "apps/vue-gallery/vite-env.d.ts": `/// <reference types="vite/client" />`,

  // --- services/api-go ---
  "services/api-go/go.mod": `module example.com/epi-dash-api

go 1.22

require github.com/go-chi/chi/v5 v5.0.12`,
  "services/api-go/cmd/server/main.go": `package main

import (
  "log"
  "net/http"
  "os"
  "example.com/epi-dash-api/internal/server"
)

func main() {
  port := os.Getenv("PORT")
  if port == "" { port = "8080" }
  h := server.New()
  log.Printf("API listening on :%s", port)
  if err := http.ListenAndServe(":"+port, h); err != nil { log.Fatal(err) }
}`,
  "services/api-go/internal/server/server.go": `package server

import (
  "encoding/json"
  "math/rand"
  "net/http"
  "os"
  "strings"
  "time"

  "github.com/go-chi/chi/v5"
  "github.com/go-chi/chi/v5/middleware"
)

var rng = rand.New(rand.NewSource(42))

func New() http.Handler {
  r := chi.NewRouter()
  r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer, cors())
  r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK); w.Write([]byte("ok")) })
  r.Get("/api/overview", getOverview)
  r.Get("/api/timeseries", getTimeSeries)
  r.Get("/api/lineages/frequencies", getLineageFrequencies)
  r.Get("/api/genome/genes", getGenomeGenes)
  r.Get("/api/genome/mutations", getGenomeMutations)
  r.Get("/api/geography/points", getGeoPoints)
  return r
}

func cors() func(http.Handler) http.Handler {
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      origins := os.Getenv("CORS_ORIGIN")
      if origins == "" { origins = "http://localhost:5173,http://localhost:5174" }
      origin := r.Header.Get("Origin")
      for _, o := range strings.Split(origins, ",") {
        if o == origin { w.Header().Set("Access-Control-Allow-Origin", origin); break }
      }
      w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS")
      w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
      next.ServeHTTP(w, r)
    })
  }
}

func writeJSON(w http.ResponseWriter, v any) {
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(v)
}

func getOverview(w http.ResponseWriter, r *http.Request) {
  kpis := []map[string]any{
    {"label":"Total cases","value":1234567},
    {"label":"Weekly cases","value":3456},
    {"label":"Positivity %","value":6.7},
  }
  now := time.Now()
  trend := make([]map[string]any, 20)
  pos := 5.0
  for i:=0;i<20;i++{
    pos += rng.Float64()*0.6 - 0.3; if pos<1 { pos=1 }
    trend[i] = map[string]any{
      "date": now.AddDate(0,0,-19+i).Format("2006-01-02"),
      "cases": 2000 + i*80 + rng.Intn(200),
      "positivity": pos,
    }
  }
  topLineages := []map[string]any{
    {"name":"XBB","pct":38},{"name":"BA.5","pct":27},{"name":"EG.5","pct":18},{"name":"BA.2","pct":12},{"name":"Others","pct":5},
  }
  topRegions := []map[string]any{
    {"region":"Madrid","value":18230},{"region":"Cataluña","value":15900},{"region":"Andalucía","value":14820},
    {"region":"C. Valenciana","value":9900},{"region":"Euskadi","value":6200},
  }
  writeJSON(w, map[string]any{"kpis":kpis,"trend":trend,"top_lineages":topLineages,"top_regions":topRegions})
}

func getTimeSeries(w http.ResponseWriter, r *http.Request) {
  q := r.URL.Query()
  metric := q.Get("metric"); if metric=="" { metric="cases" }
  now := time.Now()
  series := make([]map[string]any, 40)
  for i:=0;i<40;i++{
    val := 500.0 + float64(i)*15 + float64(rng.Intn(100))
    switch metric {
    case "positivity": val = 3 + 0.1*float64(i) + float64(rng.Intn(20))/10.0
    case "tests": val = 10000 + 50*float64(i) + float64(rng.Intn(400))
    }
    series[i] = map[string]any{
      "date": now.AddDate(0,0,-39+i).Format("2006-01-02"),
      "value": val,
    }
  }
  writeJSON(w, map[string]any{"series":series})
}

func getLineageFrequencies(w http.ResponseWriter, r *http.Request) {
  weeks := []string{"2025-05-25","2025-06-01","2025-06-08","2025-06-15","2025-06-22","2025-06-29","2025-07-06","2025-07-13"}
  lineages := []string{"BA.2","BA.5","XBB","EG.5","JN.1"}
  data := make([]map[string]any, 0, len(weeks))
  pcts := []float64{20,30,35,10,5}
  for _, wk := range weeks {
    row := map[string]any{"date": wk}
    for i, ln := range lineages {
      p := pcts[i] + rng.Float64()*2 - 1; if p<0 { p=0 }
      row[ln] = p; pcts[i] = p
    }
    var sum float64; for _, ln := range lineages { sum += row[ln].(float64) }
    for _, ln := range lineages { row[ln] = (row[ln].(float64)/sum)*100.0 }
    data = append(data, row)
  }
  writeJSON(w, map[string]any{"data":data,"lineages":lineages})
}

func getGenomeGenes(w http.ResponseWriter, r *http.Request) {
  genes := []map[string]any{
    {"name":"ORF1a","start":266,"end":13468},
    {"name":"ORF1b","start":13468,"end":21555},
    {"name":"Spike","start":21563,"end":25384},
    {"name":"ORF3a","start":25393,"end":26220},
    {"name":"M","start":26523,"end":27191},
    {"name":"ORF6","start":27202,"end":27387},
    {"name":"ORF7a","start":27394,"end":27759},
    {"name":"ORF7b","start":27756,"end":27887},
    {"name":"ORF8","start":27894,"end":28259},
    {"name":"N","start":28274,"end":29533},
    {"name":"ORF10","start":29558,"end":29674}
  }
  writeJSON(w, map[string]any{"genes":genes})
}

func getGenomeMutations(w http.ResponseWriter, r *http.Request) {
  q := r.URL.Query()
  gene := q.Get("gene"); if gene=="" { gene="Spike" }
  windows := map[string][2]int{
    "ORF1a": {266,13468}, "ORF1b": {13468,21555}, "Spike": {21563,25384}, "ORF3a": {25393,26220},
    "M": {26523,27191}, "ORF6": {27202,27387}, "ORF7a": {27394,27759}, "ORF7b": {27756,27887},
    "ORF8": {27894,28259}, "N": {28274,29533}, "ORF10": {29558,29674},
  }
  wdw, ok := windows[gene]; if !ok { wdw = [2]int{21563,25384} }
  muts := make([]map[string]any, 0, 30)
  for i:=0;i<30;i++{
    pos := wdw[0] + rng.Intn(wdw[1]-wdw[0]+1)
    pct := rng.Float64()*0.9
    muts = append(muts, map[string]any{ "pos":pos, "gene":gene, "aa_change": randomAA(), "pct": pct })
  }
  writeJSON(w, map[string]any{"mutations":muts})
}

func randomAA() string {
  letters := []rune("ACDEFGHIKLMNPQRSTVWY")
  return string([]rune{ letters[rng.Intn(len(letters))], letters[rng.Intn(len(letters))], letters[rng.Intn(len(letters))] })
}

func getGeoPoints(w http.ResponseWriter, r *http.Request) {
  features := []map[string]any{
    {"type":"Feature","properties":map[string]any{"name":"Madrid","value":18000},"geometry":map[string]any{"type":"Point","coordinates":[]float64{-3.7038,40.4168}}},
    {"type":"Feature","properties":map[string]any{"name":"Barcelona","value":15000},"geometry":map[string]any{"type":"Point","coordinates":[]float64{2.1734,41.3851}}},
    {"type":"Feature","properties":map[string]any{"name":"Valencia","value":9500},"geometry":map[string]any{"type":"Point","coordinates":[]float64{-0.3763,39.4699}}},
    {"type":"Feature","properties":map[string]any{"name":"Sevilla","value":8200},"geometry":map[string]any{"type":"Point","coordinates":[]float64{-5.9845,37.3891}}},
    {"type":"Feature","properties":map[string]any{"name":"Bilbao","value":6100},"geometry":map[string]any{"type":"Point","coordinates":[]float64{-2.9350,43.2630}}}
  }
  fc := map[string]any{"type":"FeatureCollection","features":features}
  writeJSON(w, fc)
}
`,

};

function ensureDir(path) {
  const dir = dirname(path);
  if (dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
}

for (const [path, content] of Object.entries(files)) {
  ensureDir(path);
  writeFileSync(path, content, { encoding: "utf-8" });
}

console.log("✅ Proyecto generado");
