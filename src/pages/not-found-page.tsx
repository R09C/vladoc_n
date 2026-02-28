/**
 * 404 — страница не найдена
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "@/shared/ui/button";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <FileQuestion className="h-20 w-20 text-muted-foreground/40" />
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Страница не найдена
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        Вернуться на главную
      </Button>
    </div>
  );
};
