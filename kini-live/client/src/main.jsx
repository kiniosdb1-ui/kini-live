import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import AdminPortal from "./components/AdminPortal";
import "./styles.css";

const isAdminRoute =
  window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");
const RootApp = isAdminRoute ? AdminPortal : App;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <RootApp />
    </HelmetProvider>
  </StrictMode>,
);
