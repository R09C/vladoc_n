/**
 * Все перечисления (enum) из PRD
 * Централизованное хранение для переиспользования во всех сущностях
 */

// ─── Типы групп объектов ───────────────────────────────────────────────────

/** Тип группы объектов */
export const GroupType = {
  /** DNS-серверы */
  NSC: "NSC",
  /** REDIS */
  RDC: "RDC",
  /** Базы данных */
  DBC: "DBC",
  /** Балансировщики */
  BLC: "BLC",
  /** Распределённое хранилище */
  CEPH: "CEPH",
} as const;

export type GroupType = (typeof GroupType)[keyof typeof GroupType];

/** Префиксы именования групп по типам */
export const GROUP_NAME_PREFIX: Record<GroupType, string> = {
  [GroupType.NSC]: "mnsc",
  [GroupType.RDC]: "mrdc",
  [GroupType.DBC]: "mdbc",
  [GroupType.BLC]: "mblc",
  [GroupType.CEPH]: "ceph",
} as const;

// ─── Типы DNS ──────────────────────────────────────────────────────────────

/** Тип ресурса DNS */
export const DNSType = {
  MASTER: "MASTER",
  SLAVE: "SLAVE",
  RESERVE: "RESERVE",
} as const;

export type DNSType = (typeof DNSType)[keyof typeof DNSType];

export const DNS_TYPE_LABELS: Record<DNSType, string> = {
  [DNSType.MASTER]: "Мастер",
  [DNSType.SLAVE]: "Слейв",
  [DNSType.RESERVE]: "Резерв",
} as const;

// ─── Типы СУБД ─────────────────────────────────────────────────────────────

/** Тип системы управления базами данных */
export const DBMSType = {
  MYSQL: "MySQL",
  POSTGRESQL: "PostgreSQL",
  MARIADB: "MariaDB",
  MSSQL: "MSSQL",
} as const;

export type DBMSType = (typeof DBMSType)[keyof typeof DBMSType];

// ─── Типы доступа к БД ────────────────────────────────────────────────────

/** Тип доступа пользователя к базе данных */
export const DBAccessType = {
  /** SELECT */
  S: "S",
  /** SELECT + UPDATE */
  SU: "SU",
  /** SELECT + INSERT */
  SI: "SI",
  /** SELECT + INSERT + UPDATE */
  SIU: "SIU",
  /** Full Control */
  FC: "FC",
} as const;

export type DBAccessType = (typeof DBAccessType)[keyof typeof DBAccessType];

export const DB_ACCESS_TYPE_LABELS: Record<DBAccessType, string> = {
  [DBAccessType.S]: "SELECT",
  [DBAccessType.SU]: "SELECT + UPDATE",
  [DBAccessType.SI]: "SELECT + INSERT",
  [DBAccessType.SIU]: "SELECT + INSERT + UPDATE",
  [DBAccessType.FC]: "Полный доступ (Full Control)",
} as const;

// ─── Типы доступа CEPH ────────────────────────────────────────────────────

/** Тип доступа к папке CEPH */
export const CephAccessType = {
  /** Чтение */
  R: "R",
  /** Запись */
  W: "W",
  /** Чтение и запись */
  RW: "RW",
} as const;

export type CephAccessType =
  (typeof CephAccessType)[keyof typeof CephAccessType];

export const CEPH_ACCESS_TYPE_LABELS: Record<CephAccessType, string> = {
  [CephAccessType.R]: "Чтение",
  [CephAccessType.W]: "Запись",
  [CephAccessType.RW]: "Чтение и запись",
} as const;

// ─── Зоны доступа (RBAC) ──────────────────────────────────────────────────

/** Зона доступа для ролевой модели */
export const Zone = {
  REDIS: "REDIS",
  DATABASES: "DATABASES",
  BALANCERS: "BALANCERS",
  CEPH: "CEPH",
  PROJECTS: "PROJECTS",
  VIRTUAL_MACHINES: "VIRTUAL_MACHINES",
  DOMAIN_NAMES: "DOMAIN_NAMES",
} as const;

export type Zone = (typeof Zone)[keyof typeof Zone];

export const ZONE_LABELS: Record<Zone, string> = {
  [Zone.REDIS]: "REDIS",
  [Zone.DATABASES]: "Базы данных",
  [Zone.BALANCERS]: "Балансировщики",
  [Zone.CEPH]: "CEPH",
  [Zone.PROJECTS]: "Проекты",
  [Zone.VIRTUAL_MACHINES]: "Виртуальные машины",
  [Zone.DOMAIN_NAMES]: "Доменные имена",
} as const;

// ─── Уровни доступа (RBAC) ────────────────────────────────────────────────

/** Уровень доступа роли */
export const ZoneAccessType = {
  /** Чтение */
  R: "R",
  /** Чтение + изменение */
  RU: "RU",
  /** Чтение + изменение + создание */
  CRU: "CRU",
  /** Чтение + изменение + создание + удаление */
  CRUD: "CRUD",
  /** CRUD + управление группами */
  GCRUD: "GCRUD",
} as const;

export type ZoneAccessType =
  (typeof ZoneAccessType)[keyof typeof ZoneAccessType];

export const ZONE_ACCESS_TYPE_LABELS: Record<ZoneAccessType, string> = {
  [ZoneAccessType.R]: "Чтение",
  [ZoneAccessType.RU]: "Чтение + изменение",
  [ZoneAccessType.CRU]: "Чтение + изменение + создание",
  [ZoneAccessType.CRUD]: "CRUD (полный)",
  [ZoneAccessType.GCRUD]: "GCRUD (полный + группы)",
} as const;

// ─── Типы действий (история изменений) ────────────────────────────────────

/** Тип действия в истории изменений */
export const ActionType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  [ActionType.CREATE]: "Создание",
  [ActionType.UPDATE]: "Изменение",
  [ActionType.DELETE]: "Удаление",
} as const;

// ─── Префиксы именования ресурсов ─────────────────────────────────────────

/** Префиксы для автогенерации имён ресурсов */
export const RESOURCE_NAME_PREFIX = {
  IP_POOL: "mpol",
  PROJECT_RESOURCE: "msrv",
  BALANCER_RESOURCE: "mbls",
  CEPH_RESOURCE: "ceph",
  DBMS_RESOURCE: "mbds",
  REDIS_RESOURCE: "mrds",
  DNS_RESOURCE: "mnsc",
} as const;
