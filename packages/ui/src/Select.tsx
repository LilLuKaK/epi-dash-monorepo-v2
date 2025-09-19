import React from "react";
export const Select: React.FC<{ value: string; onChange: (v: string)=>void; options:{value:string;label:string}[]; }> =
({ value, onChange, options }) => (
  <select value={value} onChange={(e)=>onChange(e.target.value)}
    style={{ padding:"6px 8px", borderRadius:8, border:"1px solid rgba(0,0,0,0.2)" }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);