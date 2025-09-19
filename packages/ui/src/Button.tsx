import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };
export const Button: React.FC<Props> = ({ variant = "primary", children, ...rest }) => (
  <button {...rest} style={{
    padding:"8px 12px", borderRadius:8,
    border: variant==="ghost" ? "1px solid rgba(0,0,0,0.15)" : "none",
    background: variant==="primary" ? "black" : "transparent",
    color: variant==="primary" ? "white" : "inherit", cursor:"pointer"
  }}>{children}</button>
);