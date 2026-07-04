import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../hooks/redux-hooks";

export default function PublicOnlyRoute() {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  if (isAuth) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
