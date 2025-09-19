import React from "react";
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
    http<{ series: Point[] }>(`/api/timeseries?metric=${metric}&smooth=${smooth}`)
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
}