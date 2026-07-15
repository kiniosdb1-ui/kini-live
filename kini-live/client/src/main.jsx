import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./styles.css";

const isAdminRoute =
  window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");
const AdminPortal = lazy(() => import("./components/AdminPortal"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      {isAdminRoute ? (
        <Suspense fallback={<div className="admin-checking"><span>Loading secure admin...</span></div>}>
          <AdminPortal />
        </Suspense>
      ) : (
        <App />
      )}
    </HelmetProvider>
  </StrictMode>,
);
