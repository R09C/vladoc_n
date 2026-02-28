/**
 * Tabs — простой компонент вкладок
 */

import React from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => (
  <div className={cn("flex gap-1 border-b border-border", className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={cn(
          "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
          activeTab === tab.id
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
