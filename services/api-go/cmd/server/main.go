package main

import (
  "log"
  "net/http"
  "os"
  "example.com/epi-dash-api/internal/server"
)

func main() {
  port := os.Getenv("PORT")
  if port == "" { port = "8080" }
  h := server.New()
  log.Printf("API listening on :%s", port)
  if err := http.ListenAndServe(":"+port, h); err != nil { log.Fatal(err) }
}