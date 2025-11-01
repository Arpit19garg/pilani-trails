// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AnimatePresence } from "framer-motion";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./styles.css";

// ✅ Get or create the root element safely
let rootElement = document.getElementById("root");
if (!rootElement) {
  rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
  console.error("Root element was missing — created new one automatically.");
}

// 🧩 Global error handlers (for GitHub Pages debugging)
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// 🚀 Render App with motion + router + auth context
try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <AnimatePresence mode="wait" initial={false}>
            <App />
          </AnimatePresence>
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering app:", error);
  // graceful fallback if something breaks
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Error loading app:</h2>
      <pre>${error.message}</pre>
    </div>`;
}
