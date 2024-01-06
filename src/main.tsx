import React from "react";
import ReactDOM from "react-dom/client";
import Entities from "./Pages/entities";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/home";
import NewEntity from "./Pages/new-entity";
import Layout from "./Pages/layout";
import EntityDetail from "./Pages/entity-detail";
import NotFound from "./Pages/not-found";
import NewTransaction from "./Pages/new-transaction";
import TransactionDetail from "./Pages/transaction-detail";
import Restore from "./Pages/restore";
import Backup from "./Pages/backup";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route
            element={<Layout />}
            errorElement={<NotFound />}
          >
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/entities"
              element={<Entities />}
            />
            <Route
              path="/entities/new"
              element={<NewEntity />}
            />
            <Route
              path="/entities/:entityId"
              element={<EntityDetail />}
            />
            <Route
              path="/entities/:entityId/new"
              element={<NewTransaction />}
            />
            <Route
              path="/entities/:entityId/:transactionId"
              element={<TransactionDetail />}
            />
            <Route
              path="/restore"
              element={<Restore />}
            />
            <Route
              path="/backup"
              element={<Backup />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
