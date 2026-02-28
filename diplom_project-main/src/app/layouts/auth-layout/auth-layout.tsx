import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col items-center justify-center gap-6 lg:flex">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground text-2xl font-bold">
          D
        </div>
        <h1 className="text-3xl font-bold text-white">Реестр ВМ и ресурсов</h1>
        <p className="text-center text-lg text-slate-400 max-w-xs">
          Система учёта виртуальных машин и ресурсов инфраструктуры
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex w-full flex-col items-center justify-center lg:w-1/2 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
