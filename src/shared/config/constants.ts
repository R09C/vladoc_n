/**
 * Константы приложения
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  USERS: "/users",
  VMS: "/virtual-machines",
  DATABASES: "/databases",
  REDIS: "/redis",
  LOAD_BALANCERS: "/load-balancers",
  CEPH: "/ceph",
  PROJECTS: "/projects",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  THEME: "theme",
} as const;

// App config
export const APP_CONFIG = {
  APP_NAME: "Реестр ВМ и ресурсов",
  APP_VERSION: "1.0.0",
  QUERY_RETRY_COUNT: 3,
  QUERY_RETRY_DELAY: 1000,
} as const;

// Auth credentials для demo
export const DEMO_CREDENTIALS = {
  email: "admin@example.com",
  password: "password",
} as const;
