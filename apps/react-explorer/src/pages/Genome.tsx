import React from "react";
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
    http<{ mutations: Mutation[] }>(`/api/genome/mutations?gene=${gene}`)
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
      <Card title={`${gene} — Top mutations`}>
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
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Genome track">
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
};