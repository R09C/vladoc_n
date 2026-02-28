/**
 * Страница CEPH-ресурсов (заглушка)
 */

import React from "react";
import { HardDrive } from "lucide-react";

export const CephPage: React.FC = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex items-center gap-3">
      <HardDrive className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">CEPH</h1>
    </div>
    <p className="text-sm text-muted-foreground">
      Управление ресурсами, папками, пользователями и доступами CEPH. Раздел
      будет реализован в следующей фазе.
    </p>
  </div>
);
