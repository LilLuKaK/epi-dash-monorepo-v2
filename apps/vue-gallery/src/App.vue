<template>
  <main style="padding: 16px">
    <h1 style="margin-bottom: 12px;">Dashboard Gallery</h1>
    <section style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
      <div v-for="item in items" :key="item.id" style="border:1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 12px;">
        <h3 style="margin: 0 0 6px 0;">{{ item.title }}</h3>
        <p style="margin: 0 0 8px 0; color: #555;">{{ item.desc }}</p>
        <a :href="item.href" target="_blank" rel="noreferrer">Open</a>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
const items = [
  { id: "overview", title: "Global Overview", desc: "KPIs + trend + top lineages/regions", href: "http://localhost:5173/" },
  { id: "timeseries", title: "Time Series", desc: "Cases / positivity / tests + smoothing", href: "http://localhost:5173/timeseries" },
  { id: "lineages", title: "Species Frequency", desc: "Stacked area + filtros", href: "http://localhost:5173/lineages" },
  { id: "genome", title: "Genome", desc: "Track + lollipops de mutaciones", href: "http://localhost:5173/genome" },
  { id: "geography", title: "Geography", desc: "Mapa con MapLibre", href: "http://localhost:5173/geography" }
];
</script>