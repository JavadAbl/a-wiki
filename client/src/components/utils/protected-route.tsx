import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../hooks/redux-hooks";

export default function ProtectedRoute() {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  if (!isAuth) {
    return <Navigate to="/Login" replace />;
  }
  return <Outlet />;
}
