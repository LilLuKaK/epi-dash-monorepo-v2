import React from "react";
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
}