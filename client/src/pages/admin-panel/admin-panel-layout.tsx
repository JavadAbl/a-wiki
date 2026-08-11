// admin-panel-layout.tsx
import { Outlet } from "react-router";
import { AdminSidebar } from "./admin-sidebar/admin-sidebar";

export default function AdminPanelLayout() {
  /*  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const dis = useAppDispatch();

  useEffect(() => {
    if (!isAuth) dis(sharedActions.setIsOpenLogin({ isOpen: true }));
  }, [dis, isAuth]);

  if (!isAuth) return null; */
  return (
    <div className="h-screen flex scale-in bg-surface-300 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-2">
        <Outlet />
      </main>
    </div>
  );
}
