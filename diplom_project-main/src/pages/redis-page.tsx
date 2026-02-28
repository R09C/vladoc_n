/**
 * Страница REDIS (заглушка)
 */

import React from "react";
import { Zap } from "lucide-react";

export const RedisPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <Zap className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">REDIS</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление ресурсами и БД REDIS. Раздел будет реализован в следующей фазе.
    </p>
  </div>
);
