/**
 * Страница истории изменений (заглушка)
 */

import React from "react";
import { History } from "lucide-react";

export const HistoryPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <History className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">История изменений</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Глобальный журнал изменений с фильтрами по типу объекта, пользователю и
      действию. Раздел будет реализован в следующей фазе.
    </p>
  </div>
);
