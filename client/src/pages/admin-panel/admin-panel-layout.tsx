// admin-panel-layout.tsx
import { Outlet } from "react-router";
import { AdminSidebar } from "./admin-sidebar/admin-sidebar";

export default function AdminPanelLayout() {
  return (
    <div className="h-screen flex fade-in-up bg-surface-300 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-2">
        <Outlet />
      </main>
    </div>
  );
}
