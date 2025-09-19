package server

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

var rng = rand.New(rand.NewSource(42))

func New() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer, cors())

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Get("/api/overview", getOverview)
	r.Get("/api/timeseries", getTimeSeries)
	r.Get("/api/lineages/frequencies", getLineageFrequencies)
	r.Get("/api/genome/genes", getGenomeGenes)
	r.Get("/api/genome/mutations", getGenomeMutations)
	r.Get("/api/geography/points", getGeoPoints)

	return r
}

func cors() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origins := os.Getenv("CORS_ORIGIN")
			if origins == "" {
				origins = "http://localhost:5173,http://localhost:5174"
			}
			origin := r.Header.Get("Origin")
			for _, o := range strings.Split(origins, ",") {
				if o == origin {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func getOverview(w http.ResponseWriter, r *http.Request) {
	// KPIs
	kpis := []map[string]any{
		map[string]any{"label": "Total cases", "value": 1234567},
		map[string]any{"label": "Weekly cases", "value": 3456},
		map[string]any{"label": "Positivity %", "value": 6.7},
	}

	// Trend (last 20 days)
	now := time.Now()
	trend := make([]map[string]any, 20)
	pos := 5.0
	for i := 0; i < 20; i++ {
		pos += rng.Float64()*0.6 - 0.3
		if pos < 1 {
			pos = 1
		}
		trend[i] = map[string]any{
			"date":       now.AddDate(0, 0, -19+i).Format("2006-01-02"),
			"cases":      2000 + i*80 + rng.Intn(200),
			"positivity": pos,
		}
	}

	// Top lineages and regions
	topLineages := []map[string]any{
		map[string]any{"name": "XBB", "pct": 38},
		map[string]any{"name": "BA.5", "pct": 27},
		map[string]any{"name": "EG.5", "pct": 18},
		map[string]any{"name": "BA.2", "pct": 12},
		map[string]any{"name": "Others", "pct": 5},
	}
	topRegions := []map[string]any{
		map[string]any{"region": "Madrid", "value": 18230},
		map[string]any{"region": "Cataluña", "value": 15900},
		map[string]any{"region": "Andalucía", "value": 14820},
		map[string]any{"region": "C. Valenciana", "value": 9900},
		map[string]any{"region": "Euskadi", "value": 6200},
	}

	writeJSON(w, map[string]any{
		"kpis":         kpis,
		"trend":        trend,
		"top_lineages": topLineages,
		"top_regions":  topRegions,
	})
}

func getTimeSeries(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	metric := q.Get("metric")
	if metric == "" {
		metric = "cases"
	}

	now := time.Now()
	series := make([]map[string]any, 40)
	for i := 0; i < 40; i++ {
		val := 500.0 + float64(i)*15 + float64(rng.Intn(100))
		switch metric {
		case "positivity":
			val = 3 + 0.1*float64(i) + float64(rng.Intn(20))/10.0
		case "tests":
			val = 10000 + 50*float64(i) + float64(rng.Intn(400))
		}
		series[i] = map[string]any{
			"date":  now.AddDate(0, 0, -39+i).Format("2006-01-02"),
			"value": val,
		}
	}
	writeJSON(w, map[string]any{"series": series})
}

func getLineageFrequencies(w http.ResponseWriter, r *http.Request) {
	weeks := []string{"2025-05-25", "2025-06-01", "2025-06-08", "2025-06-15", "2025-06-22", "2025-06-29", "2025-07-06", "2025-07-13"}
	lineages := []string{"BA.2", "BA.5", "XBB", "EG.5", "JN.1"}

	data := make([]map[string]any, 0, len(weeks))
	pcts := []float64{20, 30, 35, 10, 5}

	for _, wk := range weeks {
		row := map[string]any{"date": wk}
		for i, ln := range lineages {
			p := pcts[i] + rng.Float64()*2 - 1
			if p < 0 {
				p = 0
			}
			row[ln] = p
			pcts[i] = p
		}
		var sum float64
		for _, ln := range lineages {
			sum += row[ln].(float64)
		}
		for _, ln := range lineages {
			row[ln] = (row[ln].(float64) / sum) * 100.0
		}
		data = append(data, row)
	}

	writeJSON(w, map[string]any{"data": data, "lineages": lineages})
}

func getGenomeGenes(w http.ResponseWriter, r *http.Request) {
	genes := []map[string]any{
		map[string]any{"name": "ORF1a", "start": 266, "end": 13468},
		map[string]any{"name": "ORF1b", "start": 13468, "end": 21555},
		map[string]any{"name": "Spike", "start": 21563, "end": 25384},
		map[string]any{"name": "ORF3a", "start": 25393, "end": 26220},
		map[string]any{"name": "M", "start": 26523, "end": 27191},
		map[string]any{"name": "ORF6", "start": 27202, "end": 27387},
		map[string]any{"name": "ORF7a", "start": 27394, "end": 27759},
		map[string]any{"name": "ORF7b", "start": 27756, "end": 27887},
		map[string]any{"name": "ORF8", "start": 27894, "end": 28259},
		map[string]any{"name": "N", "start": 28274, "end": 29533},
		map[string]any{"name": "ORF10", "start": 29558, "end": 29674},
	}
	writeJSON(w, map[string]any{"genes": genes})
}

func getGenomeMutations(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	gene := q.Get("gene")
	if gene == "" {
		gene = "Spike"
	}

	windows := map[string][2]int{
		"ORF1a": [2]int{266, 13468},
		"ORF1b": [2]int{13468, 21555},
		"Spike": [2]int{21563, 25384},
		"ORF3a": [2]int{25393, 26220},
		"M":     [2]int{26523, 27191},
		"ORF6":  [2]int{27202, 27387},
		"ORF7a": [2]int{27394, 27759},
		"ORF7b": [2]int{27756, 27887},
		"ORF8":  [2]int{27894, 28259},
		"N":     [2]int{28274, 29533},
		"ORF10": [2]int{29558, 29674},
	}

	wdw, ok := windows[gene]
	if !ok {
		wdw = [2]int{21563, 25384} // default Spike
	}

	muts := make([]map[string]any, 0, 30)
	for i := 0; i < 30; i++ {
		pos := wdw[0] + rng.Intn(wdw[1]-wdw[0]+1)
		pct := rng.Float64() * 0.9
		muts = append(muts, map[string]any{
			"pos":       pos,
			"gene":      gene,
			"aa_change": randomAA(),
			"pct":       pct,
		})
	}

	writeJSON(w, map[string]any{"mutations": muts})
}

func randomAA() string {
	letters := []rune("ACDEFGHIKLMNPQRSTVWY")
	return string([]rune{
		letters[rng.Intn(len(letters))],
		letters[rng.Intn(len(letters))],
		letters[rng.Intn(len(letters))],
	})
}

func getGeoPoints(w http.ResponseWriter, r *http.Request) {
	features := []map[string]any{
		map[string]any{
			"type": "Feature",
			"properties": map[string]any{"name": "Madrid", "value": 18000},
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{-3.7038, 40.4168},
			},
		},
		map[string]any{
			"type": "Feature",
			"properties": map[string]any{"name": "Barcelona", "value": 15000},
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{2.1734, 41.3851},
			},
		},
		map[string]any{
			"type": "Feature",
			"properties": map[string]any{"name": "Valencia", "value": 9500},
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{-0.3763, 39.4699},
			},
		},
		map[string]any{
			"type": "Feature",
			"properties": map[string]any{"name": "Sevilla", "value": 8200},
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{-5.9845, 37.3891},
			},
		},
		map[string]any{
			"type": "Feature",
			"properties": map[string]any{"name": "Bilbao", "value": 6100},
			"geometry": map[string]any{
				"type":        "Point",
				"coordinates": []float64{-2.9350, 43.2630},
			},
		},
	}

	fc := map[string]any{"type": "FeatureCollection", "features": features}
	writeJSON(w, fc)
}
