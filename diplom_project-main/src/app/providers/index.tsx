/**
 * App Providers - все глобальные провайдеры приложения
 */

import React, { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/app/context/AuthContext";
import { queryClient } from "./query-client";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { queryClient };
