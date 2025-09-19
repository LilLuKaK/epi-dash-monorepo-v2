import React from "react";
export const Card: React.FC<React.PropsWithChildren<{ title?: string; footer?: React.ReactNode }>> =
({ title, footer, children }) => (
  <div style={{ border:"1px solid rgba(0,0,0,0.1)", borderRadius:12, padding:16, background:"white" }}>
    {title && <div style={{ fontWeight:600, marginBottom:8 }}>{title}</div>}
    {children}
    {footer && <div style={{ marginTop:8, fontSize:12, color:"#666" }}>{footer}</div>}
  </div>
);