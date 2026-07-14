// admin-panel-layout.tsx
import { Outlet } from "react-router";
import { AdminSidebar } from "./admin-sidebar/admin-sidebar";

export default function AdminPanelLayout() {
  return (
    <div className="flex h-screen fade-in-up bg-surface-300">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
