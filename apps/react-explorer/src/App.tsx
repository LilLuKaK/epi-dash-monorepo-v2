import React from "react";
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
}