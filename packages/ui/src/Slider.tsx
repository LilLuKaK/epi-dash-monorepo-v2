import React from "react";
export const Slider: React.FC<{ min?:number; max?:number; step?:number; value:number; onChange:(v:number)=>void; }> =
({ min=0, max=100, step=1, value, onChange }) => (
  <input type="range" min={min} max={max} step={step} value={value}
    onChange={(e)=>onChange(Number(e.target.value))} style={{ width:200 }} />
);