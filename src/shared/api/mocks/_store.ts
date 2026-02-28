/**
 * Централизованное хранилище моков
 * Генерация всех данных с перекрёстными связями между сущностями
 */

import type { OperatingSystem } from "@/entities/operating-system";
import type { Gateway } from "@/entities/gateway";
import type { ObjectGroup } from "@/entities/object-group";
import type { VirtualMachine } from "@/entities/virtual-machine";
import type { IPPool, IP } from "@/entities/ip";
import type { DNSResource } from "@/entities/dns";
import type {
  DBMSGroup,
  DBMSResource,
  Database,
  DatabaseUser,
} from "@/entities/database";
import type { RedisResource, RedisDB } from "@/entities/redis";
import type {
  CephResource,
  CephFolder,
  CephUser,
  CephFolderAccess,
} from "@/entities/ceph";
import type { BalancerGroup, BalancerResource } from "@/entities/balancer";
import type { Domain } from "@/entities/domain";
import type { Project, ProjectResource } from "@/entities/project";
import type { AlternativeClient } from "@/entities/alternative-client";
import type { User } from "@/entities/user";
import type { Role, Permission } from "@/entities/role";
import type { ChangeHistory } from "@/entities/change-history";

import {
  GroupType,
  GROUP_NAME_PREFIX,
  DNSType,
  DBMSType,
  DBAccessType,
  CephAccessType,
  Zone,
  ZoneAccessType,
  ActionType,
} from "@/shared/config/enums";
import type { InfiniteScrollResponse } from "@/shared/api/types";

// ─── Утилиты ───────────────────────────────────────────────────────────────

const pad2 = (n: number) => String(n).padStart(2, "0");

const ts = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d).toISOString();

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];

const randBool = (i: number, mod = 3) => i % mod === 0;

let _uid = 0;
const uid = (prefix: string) => `${prefix}-${String(++_uid).padStart(4, "0")}`;

const base = (id: string, i: number) => ({
  id,
  created_at: ts(2025, ((i * 3) % 12) + 1, (i % 28) + 1),
  updated_at: ts(2026, 2, Math.min(26, (i % 25) + 1)),
});

// ─── 1. Operating Systems (12) ─────────────────────────────────────────────

function generateOS(): OperatingSystem[] {
  const list: Array<[string, string]> = [
    ["Ubuntu", "20.04 LTS"],
    ["Ubuntu", "22.04 LTS"],
    ["Ubuntu", "24.04 LTS"],
    ["Debian", "11 Bullseye"],
    ["Debian", "12 Bookworm"],
    ["CentOS", "8 Stream"],
    ["Rocky Linux", "9.3"],
    ["AlmaLinux", "9.3"],
    ["Astra Linux", "1.7"],
    ["Alt Linux", "10.2"],
    ["Windows Server", "2022"],
    ["Windows Server", "2019"],
  ];
  return list.map(([name, version], i) => ({
    ...base(`os-${pad2(i + 1)}`, i),
    name,
    version,
  }));
}

// ─── 2. Gateways (20) ─────────────────────────────────────────────────────

function generateGateways(): Gateway[] {
  return Array.from({ length: 20 }, (_, i) => ({
    ...base(`gw-${pad2(i + 1)}`, i),
    ip_address: `10.${(i % 4) + 1}.0.1`,
  }));
}

// ─── 3. Object Groups (8 per type = 40) ────────────────────────────────────

function generateObjectGroups(): ObjectGroup[] {
  const groups: ObjectGroup[] = [];
  const types: GroupType[] = [
    GroupType.NSC,
    GroupType.RDC,
    GroupType.DBC,
    GroupType.BLC,
    GroupType.CEPH,
  ];
  for (const t of types) {
    const prefix = GROUP_NAME_PREFIX[t];
    const count = t === GroupType.CEPH ? 6 : 8;
    for (let n = 1; n <= count; n++) {
      const id = `grp-${t.toLowerCase()}-${pad2(n)}`;
      groups.push({
        ...base(id, groups.length),
        type: t,
        name: `${prefix}${pad2(n)}`,
        description: `Группа ${prefix}${pad2(n)} — ${t}`,
        repo_url:
          n % 3 === 0
            ? `https://git.example.com/infra/${prefix}${pad2(n)}`
            : null,
      });
    }
  }
  return groups;
}

// ─── 4. Users (10) ─────────────────────────────────────────────────────────

function generateUsers(): User[] {
  const names = [
    "Иванов Алексей",
    "Петрова Мария",
    "Сидоров Дмитрий",
    "Козлова Анна",
    "Новиков Сергей",
    "Морозова Елена",
    "Волков Артём",
    "Соколова Ольга",
    "Лебедев Максим",
    "Фёдорова Наталья",
  ];
  return names.map((name, i) => ({
    ...base(`user-${pad2(i + 1)}`, i),
    email: `${name.split(" ")[0].toLowerCase()}@university.ru`,
    name,
    is_admin: i === 0,
    is_partial_admin: i === 1,
    role_ids: i < 2 ? [] : [`role-${pad2((i % 5) + 1)}`],
  }));
}

// ─── 5. Roles & Permissions ────────────────────────────────────────────────

function generateRoles(): Role[] {
  const defs: Array<[string, boolean]> = [
    ["Администратор ВМ", false],
    ["Администратор БД", false],
    ["Наблюдатель", true],
    ["Ответственный CEPH", false],
    ["Ответственный проектов", false],
  ];
  return defs.map(([name, full_view], i) => ({
    ...base(`role-${pad2(i + 1)}`, i),
    name,
    user_ids: [],
    full_view,
  }));
}

function generatePermissions(roles: Role[]): Permission[] {
  const perms: Permission[] = [];
  const zoneMap: Record<string, Array<[Zone, ZoneAccessType]>> = {
    "role-01": [
      [Zone.VIRTUAL_MACHINES, ZoneAccessType.GCRUD],
      [Zone.DOMAIN_NAMES, ZoneAccessType.CRUD],
    ],
    "role-02": [
      [Zone.DATABASES, ZoneAccessType.GCRUD],
      [Zone.REDIS, ZoneAccessType.CRUD],
    ],
    "role-03": [
      [Zone.VIRTUAL_MACHINES, ZoneAccessType.R],
      [Zone.DATABASES, ZoneAccessType.R],
      [Zone.CEPH, ZoneAccessType.R],
      [Zone.REDIS, ZoneAccessType.R],
      [Zone.BALANCERS, ZoneAccessType.R],
      [Zone.PROJECTS, ZoneAccessType.R],
      [Zone.DOMAIN_NAMES, ZoneAccessType.R],
    ],
    "role-04": [
      [Zone.CEPH, ZoneAccessType.GCRUD],
      [Zone.BALANCERS, ZoneAccessType.CRU],
    ],
    "role-05": [
      [Zone.PROJECTS, ZoneAccessType.GCRUD],
      [Zone.DOMAIN_NAMES, ZoneAccessType.CRU],
    ],
  };
  for (const role of roles) {
    const entries = zoneMap[role.id] ?? [];
    for (const [zone, access_type] of entries) {
      perms.push({
        ...base(uid("perm"), perms.length),
        role_id: role.id,
        zone,
        access_type,
        group_id: null,
      });
    }
  }
  return perms;
}

// ─── 6. Virtual Machines (600) ─────────────────────────────────────────────

function generateVMs(
  osList: OperatingSystem[],
  gateways: Gateway[],
  nscGroups: ObjectGroup[],
): VirtualMachine[] {
  const vms: VirtualMachine[] = [];
  const descs = [
    "Веб-сервер",
    "API-шлюз",
    "Сервер БД",
    "Сервер мониторинга",
    "Кэш-сервер",
    "Сервер логирования",
    "Сервер бэкапов",
    "CI/CD runner",
    "Сервер приложений",
    "Тестовый стенд",
  ];
  for (let i = 1; i <= 600; i++) {
    const id = `vm-${String(i).padStart(3, "0")}`;
    const isDeleted = i % 30 === 0;
    const isActive = !isDeleted && i % 5 !== 0;
    vms.push({
      ...base(id, i),
      name: `vm-${String(i).padStart(3, "0")}`,
      description: `${pick(descs, i)} #${i}`,
      is_closed_circuit: randBool(i, 7),
      is_active: isActive,
      activation_date: isActive ? ts(2025, (i % 12) + 1, (i % 28) + 1) : null,
      is_deleted: isDeleted,
      deletion_date: isDeleted ? ts(2026, 1, 15) : null,
      dns_group_id: nscGroups.length ? pick(nscGroups, i).id : null,
      gateway_id: pick(gateways, i).id,
      swap_size: pick([2, 4, 8, 16], i),
      rem_size: pick([8, 16, 32, 64], i),
      ram_size: pick([4, 8, 16, 32, 64], i),
      cpu_count: pick([2, 4, 8, 16], i),
      os_id: pick(osList, i).id,
    });
  }
  return vms;
}

// ─── 7. IP Pools (10) & IPs (600) ─────────────────────────────────────────

function generateIPPools(): IPPool[] {
  return Array.from({ length: 10 }, (_, i) => ({
    ...base(`pool-${pad2(i + 1)}`, i),
    name: `mpol${pad2(i + 1)}`,
    description: `Пул IP-адресов #${i + 1}`,
    zones: i % 2 === 0 ? ["DMZ"] : ["Internal", "Management"],
  }));
}

function generateIPs(pools: IPPool[], vms: VirtualMachine[]): IP[] {
  const ips: IP[] = [];
  for (let i = 0; i < 600; i++) {
    const octet3 = Math.floor(i / 254) + 1;
    const octet4 = (i % 254) + 1;
    ips.push({
      ...base(`ip-${String(i + 1).padStart(4, "0")}`, i),
      vm_id: i < vms.length ? vms[i].id : null,
      pool_id: pick(pools, i).id,
      description: `IP ${octet3}.${octet4}`,
      ip_address: `192.168.${octet3}.${octet4}`,
    });
  }
  return ips;
}

// ─── 8. DNS Resources (60) ─────────────────────────────────────────────────

function generateDNS(
  nscGroups: ObjectGroup[],
  vms: VirtualMachine[],
): DNSResource[] {
  const types: DNSType[] = [DNSType.MASTER, DNSType.SLAVE, DNSType.RESERVE];
  const res: DNSResource[] = [];
  for (let i = 0; i < 60; i++) {
    const gr = pick(nscGroups, i);
    res.push({
      ...base(`dns-${pad2(i + 1)}`, i),
      group_id: gr.id,
      name: `mnsc${pad2(i + 1)}`,
      parent_group_id: i > 2 ? pick(nscGroups, i + 3).id : null,
      type: pick(types, i),
      vm_id: pick(vms, i * 3).id,
    });
  }
  return res;
}

// ─── 9. Domains (50) ──────────────────────────────────────────────────────

function generateDomains(blcGroups: ObjectGroup[]): Domain[] {
  const bases = [
    "university.ru",
    "portal.university.ru",
    "lk.university.ru",
    "mail.university.ru",
    "git.university.ru",
    "ci.university.ru",
    "monitor.university.ru",
    "wiki.university.ru",
    "moodle.university.ru",
    "library.university.ru",
  ];
  const domains: Domain[] = [];
  for (let i = 0; i < 50; i++) {
    const baseName = pick(bases, i);
    const suffix = i < 10 ? "" : `-${Math.floor(i / 10)}`;
    domains.push({
      ...base(`domain-${pad2(i + 1)}`, i),
      name:
        i < 10 ? baseName : `${baseName.split(".")[0]}${suffix}.university.ru`,
      is_internal: i % 3 !== 2,
      is_external: i % 3 !== 1,
      is_system: i % 5 === 0,
      balancer_group_ids:
        blcGroups.length > 0
          ? [pick(blcGroups, i).id, pick(blcGroups, i + 3).id].filter(
              (v, idx, a) => a.indexOf(v) === idx,
            )
          : [],
    });
  }
  return domains;
}

// ─── 10. Projects (50) & Project Resources (80) ───────────────────────────

function generateProjects(domains: Domain[]): Project[] {
  const names = [
    "Портал университета",
    "Личный кабинет студента",
    "Электронная библиотека",
    "Система мониторинга",
    "CI/CD платформа",
    "Сервис уведомлений",
    "Хранилище данных",
    "API Gateway",
    "Система авторизации",
    "Аналитическая платформа",
  ];
  const depts = [
    "Отдел разработки",
    "Отдел инфраструктуры",
    "Отдел безопасности",
    "Учебный отдел",
    "Научный отдел",
  ];
  return Array.from({ length: 50 }, (_, i) => ({
    ...base(`proj-${pad2(i + 1)}`, i),
    name: `${pick(names, i)} ${i > 9 ? `v${Math.floor(i / 10) + 1}` : ""}`.trim(),
    description: `Проект: ${pick(names, i)}`,
    responsible_department: pick(depts, i),
    is_boxed: randBool(i, 4),
    domain_id: i < domains.length ? domains[i].id : pick(domains, i).id,
  }));
}

function generateProjectResources(
  projects: Project[],
  vms: VirtualMachine[],
): ProjectResource[] {
  const res: ProjectResource[] = [];
  for (let i = 0; i < 80; i++) {
    res.push({
      ...base(`psrv-${pad2(i + 1)}`, i),
      name: `msrv${pad2(i + 1)}`,
      vm_id: pick(vms, i * 5).id,
      project_id: pick(projects, i).id,
    });
  }
  return res;
}

// ─── 11. DBMS Groups, Resources, Databases, Users ─────────────────────────

function generateDBMSGroups(dbcGroups: ObjectGroup[]): DBMSGroup[] {
  const types: DBMSType[] = [
    DBMSType.POSTGRESQL,
    DBMSType.MYSQL,
    DBMSType.MARIADB,
    DBMSType.MSSQL,
  ];
  return dbcGroups.map((g, i) => ({
    ...base(`dbmsgrp-${pad2(i + 1)}`, i),
    group_id: g.id,
    port: String(pick([5432, 3306, 3307, 1433], i)),
    dbms_type: pick(types, i),
    version: pick(["16.2", "8.0.36", "11.3", "2022"], i),
  }));
}

function generateDBMSResources(
  dbmsGroups: DBMSGroup[],
  vms: VirtualMachine[],
): DBMSResource[] {
  const res: DBMSResource[] = [];
  for (let i = 0; i < 30; i++) {
    res.push({
      ...base(`dbmsres-${pad2(i + 1)}`, i),
      dbms_group_id: pick(dbmsGroups, i).id,
      name: `mbds${pad2(i + 1)}`,
      vm_id: pick(vms, i * 7).id,
    });
  }
  return res;
}

function generateDatabases(
  dbcGroups: ObjectGroup[],
  projects: Project[],
): Database[] {
  const prefixes = [
    "app_db",
    "analytics",
    "users",
    "logs",
    "sessions",
    "cache_db",
    "audit",
    "reports",
    "media",
    "config",
  ];
  return Array.from({ length: 120 }, (_, i) => ({
    ...base(`db-${String(i + 1).padStart(3, "0")}`, i),
    name: `${pick(prefixes, i)}_${i + 1}`,
    group_id: pick(dbcGroups, i).id,
    project_id: i % 3 === 0 ? pick(projects, i).id : null,
  }));
}

function generateDatabaseUsers(
  databases: Database[],
  projects: Project[],
): DatabaseUser[] {
  const accessTypes: DBAccessType[] = [
    DBAccessType.S,
    DBAccessType.SU,
    DBAccessType.SI,
    DBAccessType.SIU,
    DBAccessType.FC,
  ];
  const res: DatabaseUser[] = [];
  for (let i = 0; i < 200; i++) {
    res.push({
      ...base(`dbuser-${String(i + 1).padStart(3, "0")}`, i),
      database_id: pick(databases, i).id,
      username: `dbuser_${i + 1}`,
      password: "••••••••",
      access_type: pick(accessTypes, i),
      project_id: i % 4 === 0 ? pick(projects, i).id : null,
    });
  }
  return res;
}

// ─── 12. Redis ─────────────────────────────────────────────────────────────

function generateRedisResources(
  rdcGroups: ObjectGroup[],
  vms: VirtualMachine[],
): RedisResource[] {
  const res: RedisResource[] = [];
  for (let i = 0; i < 30; i++) {
    res.push({
      ...base(`rdres-${pad2(i + 1)}`, i),
      group_id: pick(rdcGroups, i).id,
      vm_id: pick(vms, i * 11).id,
      name: `mrds${pad2(i + 1)}`,
    });
  }
  return res;
}

function generateRedisDBs(
  rdcGroups: ObjectGroup[],
  projects: Project[],
): RedisDB[] {
  return Array.from({ length: 60 }, (_, i) => ({
    ...base(`rddb-${pad2(i + 1)}`, i),
    group_id: pick(rdcGroups, i).id,
    port: String(6379 + i),
    password: "••••••••",
    project_id: i % 3 === 0 ? pick(projects, i).id : null,
  }));
}

// ─── 13. CEPH ──────────────────────────────────────────────────────────────

function generateCephResources(
  cephGroups: ObjectGroup[],
  vms: VirtualMachine[],
): CephResource[] {
  return Array.from({ length: 24 }, (_, i) => ({
    ...base(`cephres-${pad2(i + 1)}`, i),
    name: `ceph${pad2(i + 1)}`,
    group_id: pick(cephGroups, i).id,
    vm_id: pick(vms, i * 13).id,
  }));
}

function generateCephFolders(cephGroups: ObjectGroup[]): CephFolder[] {
  const names = [
    "backups",
    "media",
    "static",
    "uploads",
    "logs",
    "configs",
    "temp",
    "archive",
  ];
  return Array.from({ length: 40 }, (_, i) => ({
    ...base(`cephfld-${pad2(i + 1)}`, i),
    name: `${pick(names, i)}_${i + 1}`,
    is_active: !randBool(i, 5),
    group_id: pick(cephGroups, i).id,
  }));
}

function generateCephUsers(
  cephGroups: ObjectGroup[],
  projects: Project[],
): CephUser[] {
  return Array.from({ length: 30 }, (_, i) => ({
    ...base(`cephusr-${pad2(i + 1)}`, i),
    group_id: pick(cephGroups, i).id,
    name: `ceph_user_${i + 1}`,
    is_active: !randBool(i, 4),
    project_id: i % 3 === 0 ? pick(projects, i).id : null,
    key: `AQC${String.fromCharCode(65 + (i % 26))}${String(i).padStart(4, "0")}==`,
  }));
}

function generateCephFolderAccess(
  users: CephUser[],
  folders: CephFolder[],
): CephFolderAccess[] {
  const types: CephAccessType[] = [
    CephAccessType.R,
    CephAccessType.W,
    CephAccessType.RW,
  ];
  const res: CephFolderAccess[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < 80; i++) {
    const u = pick(users, i);
    const f = pick(folders, i * 2);
    const pair = `${u.id}:${f.id}`;
    if (seen.has(pair)) continue;
    seen.add(pair);
    res.push({
      ...base(`cephacc-${pad2(res.length + 1)}`, i),
      user_id: u.id,
      folder_id: f.id,
      access_type: pick(types, i),
    });
  }
  return res;
}

// ─── 14. Balancers ─────────────────────────────────────────────────────────

function generateBalancerGroups(
  blcGroups: ObjectGroup[],
  cephUsers: CephUser[],
): BalancerGroup[] {
  return blcGroups.map((g, i) => ({
    ...base(`balgrp-${pad2(i + 1)}`, i),
    ceph_user_id:
      cephUsers.length > 0 && i % 2 === 0 ? pick(cephUsers, i).id : null,
    group_id: g.id,
  }));
}

function generateBalancerResources(
  balGroups: BalancerGroup[],
  vms: VirtualMachine[],
): BalancerResource[] {
  const res: BalancerResource[] = [];
  for (let i = 0; i < 30; i++) {
    res.push({
      ...base(`balres-${pad2(i + 1)}`, i),
      name: `mbls${pad2(i + 1)}`,
      vm_id: pick(vms, i * 9).id,
      balancer_group_id: pick(balGroups, i).id,
    });
  }
  return res;
}

// ─── 15. Alternative Clients (30) ──────────────────────────────────────────

function generateAltClients(vms: VirtualMachine[]): AlternativeClient[] {
  const names = [
    "Резервный клиент",
    "Тестовый клиент",
    "Отладочный клиент",
    "Мониторинговый агент",
    "Агент обновлений",
  ];
  return Array.from({ length: 30 }, (_, i) => ({
    ...base(`altcl-${pad2(i + 1)}`, i),
    name: `${pick(names, i)} #${i + 1}`,
    vm_id: pick(vms, i * 4).id,
    description: `${pick(names, i)} для ВМ`,
  }));
}

// ─── 16. Change History (600) ──────────────────────────────────────────────

function generateHistory(
  users: User[],
  vms: VirtualMachine[],
): ChangeHistory[] {
  const contentTypes = [
    "VirtualMachine",
    "Database",
    "Project",
    "Domain",
    "CephFolder",
    "RedisDB",
    "DNSResource",
    "ObjectGroup",
    "IP",
    "BalancerResource",
  ];
  const actions: ActionType[] = [
    ActionType.CREATE,
    ActionType.UPDATE,
    ActionType.UPDATE,
    ActionType.UPDATE,
    ActionType.DELETE,
  ];
  return Array.from({ length: 600 }, (_, i) => {
    const ct = pick(contentTypes, i);
    const action = pick(actions, i);
    return {
      ...base(`hist-${String(i + 1).padStart(4, "0")}`, i),
      content_type: ct,
      object_id:
        ct === "VirtualMachine"
          ? pick(vms, i).id
          : `obj-${String(i).padStart(4, "0")}`,
      value:
        action === ActionType.CREATE
          ? { after: { name: `object_${i}` } }
          : action === ActionType.DELETE
            ? { before: { name: `object_${i}` } }
            : {
                before: { name: `object_${i}` },
                after: { name: `object_${i}_updated` },
              },
      user_id: pick(users, i).id,
      timestamp: new Date(
        2025,
        (i * 2) % 12,
        (i % 28) + 1,
        (i * 3) % 24,
        (i * 7) % 60,
      ).toISOString(),
      action,
    };
  });
}

// ─── Build Store ───────────────────────────────────────────────────────────

function buildStore() {
  const operatingSystems = generateOS();
  const gateways = generateGateways();
  const objectGroups = generateObjectGroups();

  const nscGroups = objectGroups.filter((g) => g.type === GroupType.NSC);
  const rdcGroups = objectGroups.filter((g) => g.type === GroupType.RDC);
  const dbcGroups = objectGroups.filter((g) => g.type === GroupType.DBC);
  const blcGroups = objectGroups.filter((g) => g.type === GroupType.BLC);
  const cephGroups = objectGroups.filter((g) => g.type === GroupType.CEPH);

  const users = generateUsers();
  const roles = generateRoles();
  const permissions = generatePermissions(roles);

  const virtualMachines = generateVMs(operatingSystems, gateways, nscGroups);
  const ipPools = generateIPPools();
  const ips = generateIPs(ipPools, virtualMachines);
  const dnsResources = generateDNS(nscGroups, virtualMachines);

  const domains = generateDomains(blcGroups);
  const projects = generateProjects(domains);
  const projectResources = generateProjectResources(projects, virtualMachines);

  const dbmsGroups = generateDBMSGroups(dbcGroups);
  const dbmsResources = generateDBMSResources(dbmsGroups, virtualMachines);
  const databases = generateDatabases(dbcGroups, projects);
  const databaseUsers = generateDatabaseUsers(databases, projects);

  const redisResources = generateRedisResources(rdcGroups, virtualMachines);
  const redisDBs = generateRedisDBs(rdcGroups, projects);

  const cephResources = generateCephResources(cephGroups, virtualMachines);
  const cephFolders = generateCephFolders(cephGroups);
  const cephUsers = generateCephUsers(cephGroups, projects);
  const cephFolderAccess = generateCephFolderAccess(cephUsers, cephFolders);

  const balancerGroups = generateBalancerGroups(blcGroups, cephUsers);
  const balancerResources = generateBalancerResources(
    balancerGroups,
    virtualMachines,
  );

  const alternativeClients = generateAltClients(virtualMachines);

  const changeHistory = generateHistory(users, virtualMachines);

  return {
    operatingSystems,
    gateways,
    objectGroups,
    users,
    roles,
    permissions,
    virtualMachines,
    ipPools,
    ips,
    dnsResources,
    domains,
    projects,
    projectResources,
    dbmsGroups,
    dbmsResources,
    databases,
    databaseUsers,
    redisResources,
    redisDBs,
    cephResources,
    cephFolders,
    cephUsers,
    cephFolderAccess,
    balancerGroups,
    balancerResources,
    alternativeClients,
    changeHistory,
  };
}

export const store = buildStore();

// ─── Общие утилиты для моков ───────────────────────────────────────────────

export const delay = (ms = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Универсальная функция пагинации, сортировки и поиска
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function queryList<T extends Record<string, any>>(
  items: T[],
  params: {
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    searchFields?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters?: Record<string, any>;
  },
): InfiniteScrollResponse<T> {
  let result = [...items];

  // Search
  if (params.search && params.searchFields?.length) {
    const q = params.search.toLowerCase();
    result = result.filter((item) =>
      params.searchFields!.some((f) => {
        const val = item[f];
        return typeof val === "string" && val.toLowerCase().includes(q);
      }),
    );
  }

  // Filters
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          result = result.filter((item) => value.includes(item[key]));
        }
      } else if (typeof value === "boolean") {
        result = result.filter((item) => item[key] === value);
      } else if (typeof value === "string") {
        result = result.filter((item) => item[key] === value);
      }
    }
  }

  // Sort
  if (params.sortBy) {
    const key = params.sortBy;
    result.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null || bVal == null) return 0;
      const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      const bStr =
        typeof bVal === "string" ? (bVal as string).toLowerCase() : bVal;
      if (aStr < bStr) return params.sortOrder === "desc" ? 1 : -1;
      if (aStr > bStr) return params.sortOrder === "desc" ? -1 : 1;
      return 0;
    });
  }

  const totalCount = result.length;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  const data = result.slice(offset, offset + limit);

  return { data, totalCount };
}
