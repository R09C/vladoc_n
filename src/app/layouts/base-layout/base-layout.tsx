import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/sidebar";

const SIDEBAR_KEY = "sidebar_collapsed";

export const BaseLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === "true",
  );

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem(SIDEBAR_KEY, String(!prev));
      return !prev;
    });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* Content area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
