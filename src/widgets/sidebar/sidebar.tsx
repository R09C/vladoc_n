/**
 * Sidebar — фиксированная боковая навигация
 */

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import { Button } from "@/shared/ui/button";
import { useAuthContext } from "@/app/context/AuthContext";
import { NAV_SECTIONS, type NavSection, type NavItem } from "@/shared/config/navigation";

/* ────────────────────────────────────────────────────────── */

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout, isLoading } = useAuthContext();
  const location = useLocation();

  const isAdmin = user?.is_admin || user?.is_partial_admin;

  const handleLogout = async () => {
    await logout();
  };

  /** Фильтрация пунктов по правам */
  const filterItems = (items: NavItem[]) =>
    items.filter((item) => !item.adminOnly || isAdmin);

  /** Секция с пунктами */
  const renderSection = (section: NavSection, idx: number) => {
    const visible = filterItems(section.items);
    if (visible.length === 0) return null;

    return (
      <div key={idx} className="mb-2">
        {/* Section title */}
        {!collapsed && (
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {section.title}
          </p>
        )}
        {collapsed && idx > 0 && (
          <div className="mx-3 mb-2 border-t border-border" />
        )}

        <ul className="space-y-0.5">
          {visible.map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              collapsed={collapsed}
              isActive={
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href)
              }
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[68px]" : "w-[250px]",
      )}
    >
      {/* ── Logo ──────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          РВ
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold">
            Реестр ВМ
          </span>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        {NAV_SECTIONS.map((section, i) => renderSection(section, i))}
      </nav>

      {/* ── Footer (user + collapse) ──────────────── */}
      <div className="shrink-0 border-t border-border p-2">
        {/* User row */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2",
            collapsed && "justify-center",
          )}
        >
          {/* Avatar placeholder */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium leading-tight">
                {user?.name || user?.email}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.is_admin ? "Администратор" : "Пользователь"}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoading}
            title="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-center text-muted-foreground"
          onClick={onToggle}
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Свернуть</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

/* ── Single sidebar link ────────────────────────────────── */

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, collapsed, isActive }) => {
  const Icon = item.icon;

  return (
    <li>
      <NavLink
        to={item.href}
        end={item.href === "/"}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    </li>
  );
};
