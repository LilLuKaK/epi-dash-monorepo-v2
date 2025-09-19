import React from "react";
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
}