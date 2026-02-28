/**
 * Страница балансировщиков (заглушка)
 */

import React from "react";
import { Scale } from "lucide-react";

export const BalancersPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <Scale className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">Балансировщики</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление группами и ресурсами балансировки. Раздел будет реализован в
      следующей фазе.
    </p>
  </div>
);
