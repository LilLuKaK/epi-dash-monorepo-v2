import React from "react";
export const Checkbox: React.FC<{ label:string; checked:boolean; onChange:(v:boolean)=>void; }> =
({ label, checked, onChange }) => (
  <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
    <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);