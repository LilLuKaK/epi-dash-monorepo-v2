import React from "react";
import { Card } from "@epi/ui";
import { http } from "@epi/utils";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Feature = { type:"Feature"; properties:{ name:string; value:number }; geometry:{ type:"Point"; coordinates:[number,number] } };
type FC = { type:"FeatureCollection"; features: Feature[] };

export default function Geography() {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapObj = React.useRef<maplibregl.Map | null>(null);

  React.useEffect(()=>{
    if(!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-3.7, 40.4], zoom: 4.5
    });
    mapObj.current = map;
    (async ()=>{
      const geo = await http<FC>("/api/geography/points");
      map.on("load", ()=>{
        map.addSource("cases", { type:"geojson", data: geo });
        map.addLayer({
          id:"cases-circles", type:"circle", source:"cases",
          paint:{
            "circle-radius": ["interpolate", ["linear"], ["get","value"], 0,2, 1000,10, 10000,20, 30000,28],
            "circle-color": ["interpolate", ["linear"], ["get","value"], 0,"#88c", 1000,"#5a9", 10000,"#fb3", 30000,"#e55"]
          }
        });
        map.addLayer({
          id:"cases-label", type:"symbol", source:"cases",
          layout:{ "text-field":["get","name"], "text-size":10, "text-offset":[0,1.2] },
          paint:{ "text-color":"#111" }
        });
      });
    })();
    return ()=>{ map.remove(); };
  },[]);

  return <Card title="Geography — Incidence by city (simulada)">
    <div ref={mapRef} style={{ height:480, borderRadius:12, overflow:"hidden" }} />
  </Card>;
}