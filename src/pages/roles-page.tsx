/**
 * Страница управления ролями (заглушка, admin)
 */

import React from "react";
import { Shield } from "lucide-react";

export const RolesPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <Shield className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">Роли и права</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление ролями и правами доступа. Раздел будет реализован в следующей
      фазе.
    </p>
  </div>
);
