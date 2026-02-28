/**
 * Главная страница — Dashboard (сводка)
 */

import React from "react";
import {
  Server,
  Globe,
  HardDrive,
  Database,
  Zap,
  Scale,
  FolderKanban,
  Link,
  Network,
  History,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

const STATS: StatCardProps[] = [
  { label: "Виртуальные машины", value: "—", icon: Server, color: "bg-blue-100 text-blue-600" },
  { label: "DNS-ресурсы", value: "—", icon: Globe, color: "bg-emerald-100 text-emerald-600" },
  { label: "CEPH-ресурсы", value: "—", icon: HardDrive, color: "bg-purple-100 text-purple-600" },
  { label: "Базы данных", value: "—", icon: Database, color: "bg-amber-100 text-amber-600" },
  { label: "REDIS", value: "—", icon: Zap, color: "bg-red-100 text-red-600" },
  { label: "Балансировщики", value: "—", icon: Scale, color: "bg-cyan-100 text-cyan-600" },
  { label: "Проекты", value: "—", icon: FolderKanban, color: "bg-indigo-100 text-indigo-600" },
  { label: "Домены", value: "—", icon: Link, color: "bg-orange-100 text-orange-600" },
  { label: "IP-адреса", value: "—", icon: Network, color: "bg-teal-100 text-teal-600" },
  { label: "История (сегодня)", value: "—", icon: History, color: "bg-slate-100 text-slate-600" },
];

export const DashboardPage: React.FC = () => (
  <div className="flex flex-col gap-6 p-6">
    {/* Title */}
    <div>
      <h1 className="text-2xl font-bold">Главная</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Сводная информация по инфраструктуре
      </p>
    </div>

    {/* Stats grid */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>

    {/* Placeholder for recent activity */}
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Последние изменения</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Здесь будет отображаться лента последних действий в системе.
      </p>
    </div>
  </div>
);
