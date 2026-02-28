/**
 * React Query configuration
 */

import { QueryClient } from "@tanstack/react-query";
import { APP_CONFIG } from "@/shared/config/constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: APP_CONFIG.QUERY_RETRY_COUNT,
      retryDelay: APP_CONFIG.QUERY_RETRY_DELAY,
    },
    mutations: {
      retry: 1,
    },
  },
});
