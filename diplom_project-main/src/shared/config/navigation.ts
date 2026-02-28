/**
 * Конфигурация навигации и меню
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Server,
  Globe,
  HardDrive,
  Database,
  Zap,
  Scale,
  FolderKanban,
  Link,
  Network,
  Router,
  Monitor,
  Boxes,
  Users2,
  History,
  UserCog,
  Shield,
  Settings,
} from "lucide-react";

export interface NavItem {
  /** Уникальный ключ */
  key: string;
  /** Текст пункта меню */
  label: string;
  /** Путь маршрута */
  href: string;
  /** Lucide-иконка */
  icon: LucideIcon;
  /** Доступен только администраторам */
  adminOnly?: boolean;
}

export interface NavSection {
  /** Заголовок секции (отображается в sidebar) */
  title: string;
  /** Пункты меню */
  items: NavItem[];
}

/** Основная навигация — сгруппирована по секциям */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Основное",
    items: [
      { key: "dashboard", label: "Главная", href: "/", icon: LayoutDashboard },
      { key: "vms", label: "Виртуальные машины", href: "/vms", icon: Server },
      { key: "dns", label: "DNS", href: "/dns", icon: Globe },
      { key: "ceph", label: "CEPH", href: "/ceph", icon: HardDrive },
      {
        key: "databases",
        label: "Базы данных",
        href: "/databases",
        icon: Database,
      },
      { key: "redis", label: "REDIS", href: "/redis", icon: Zap },
      {
        key: "balancers",
        label: "Балансировщики",
        href: "/balancers",
        icon: Scale,
      },
      {
        key: "projects",
        label: "Проекты",
        href: "/projects",
        icon: FolderKanban,
      },
      { key: "domains", label: "Домены", href: "/domains", icon: Link },
      { key: "ips", label: "IP-адреса", href: "/ips", icon: Network },
    ],
  },
  {
    title: "Справочники",
    items: [
      { key: "gateways", label: "Шлюзы", href: "/gateways", icon: Router },
      {
        key: "os",
        label: "Операционные системы",
        href: "/operating-systems",
        icon: Monitor,
      },
      {
        key: "object-groups",
        label: "Группы объектов",
        href: "/object-groups",
        icon: Boxes,
      },
      {
        key: "alt-clients",
        label: "Альт. клиенты",
        href: "/alt-clients",
        icon: Users2,
      },
    ],
  },
  {
    title: "Журнал",
    items: [
      {
        key: "history",
        label: "История изменений",
        href: "/history",
        icon: History,
      },
    ],
  },
  {
    title: "Администрирование",
    items: [
      {
        key: "users",
        label: "Пользователи",
        href: "/admin/users",
        icon: UserCog,
        adminOnly: true,
      },
      {
        key: "roles",
        label: "Роли и права",
        href: "/admin/roles",
        icon: Shield,
        adminOnly: true,
      },
    ],
  },
];

/** Плоский список навигационных пунктов (для поиска по ключу / href) */
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/** Иконка раздела «Администрирование» для заголовка секции */
export const ADMIN_SECTION_ICON = Settings;
