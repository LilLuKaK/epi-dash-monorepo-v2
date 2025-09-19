import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Overview from "./pages/Overview";
import TimeSeries from "./pages/TimeSeries";
import Lineages from "./pages/Lineages";
import Genome from "./pages/Genome";
import Geography from "./pages/Geography";
import "./styles.css";

const router = createBrowserRouter([{
  path: "/", element: <App />,
  children: [
    { index: true, element: <Overview /> },
    { path: "timeseries", element: <TimeSeries /> },
    { path: "lineages", element: <Lineages /> },
    { path: "genome", element: <Genome /> },
    { path: "geography", element: <Geography /> }
  ]
}]);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);