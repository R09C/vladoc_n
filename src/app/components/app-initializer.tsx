/**
 * App Initializer - проверка сессии при загрузке
 */

import React, { useEffect } from "react";
import { useAuthContext } from "@/app/context/AuthContext";

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { checkSession, isCheckingSession } = useAuthContext();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Показываем loading пока проверяем сессию
  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
