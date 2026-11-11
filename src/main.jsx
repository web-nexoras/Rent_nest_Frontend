import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App.jsx";
import AppProviders from "@/app/providers.jsx";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
