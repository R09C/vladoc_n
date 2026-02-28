import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers";
import { AppInitializer } from "./components/app-initializer";
import { ErrorBoundary } from "./components/error-boundary";
import { router } from "./router";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AppInitializer>
          <RouterProvider router={router} />
        </AppInitializer>
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>,
);
