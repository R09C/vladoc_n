/**
 * Страница баз данных (заглушка)
 */

import React from "react";
import { Database } from "lucide-react";

export const DatabasesPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <Database className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">Базы данных</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление группами СУБД, ресурсами, базами и пользователями БД. Раздел
      будет реализован в следующей фазе.
    </p>
  </div>
);
