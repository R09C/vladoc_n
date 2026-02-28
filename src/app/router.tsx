import { createBrowserRouter } from "react-router-dom";
import { BaseLayout, AuthLayout } from "./layouts";
import { ProtectedRoute } from "./components/protected-route";
import {
  LoginPage,
  DashboardPage,
  VirtualMachinesListPage,
  DnsPage,
  CephPage,
  DatabasesPage,
  RedisPage,
  BalancersPage,
  ProjectsPage,
  DomainsPage,
  IpsPage,
  GatewaysPage,
  OperatingSystemsPage,
  ObjectGroupsPage,
  AltClientsPage,
  HistoryPage,
  UsersPage,
  RolesPage,
  NotFoundPage,
} from "@/pages";

export const router = createBrowserRouter([
  /* ── Auth ───────────────────────────────── */
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },

  /* ── Protected area ─────────────────────── */
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <BaseLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "vms", element: <VirtualMachinesListPage /> },
      { path: "dns", element: <DnsPage /> },
      { path: "ceph", element: <CephPage /> },
      { path: "databases", element: <DatabasesPage /> },
      { path: "redis", element: <RedisPage /> },
      { path: "balancers", element: <BalancersPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "domains", element: <DomainsPage /> },
      { path: "ips", element: <IpsPage /> },
      { path: "gateways", element: <GatewaysPage /> },
      { path: "operating-systems", element: <OperatingSystemsPage /> },
      { path: "object-groups", element: <ObjectGroupsPage /> },
      { path: "alt-clients", element: <AltClientsPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "admin/users", element: <UsersPage /> },
      { path: "admin/roles", element: <RolesPage /> },
    ],
  },

  /* ── 404 ────────────────────────────────── */
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
