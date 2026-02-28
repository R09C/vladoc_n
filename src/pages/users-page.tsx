/**
 * Страница управления пользователями (заглушка, admin)
 */

import React from "react";
import { UserCog } from "lucide-react";

export const UsersPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <UserCog className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">Пользователи</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление учётными записями пользователей. Раздел будет реализован в
      следующей фазе.
    </p>
  </div>
);
