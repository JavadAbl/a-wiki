import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../hooks/redux-hooks";
import { Role } from "../../features/auth/enums/role";

interface Props {
  allowedRoles: Role[];
}
export default function RoleAuthorizationRoute({ allowedRoles }: Props) {
  const { isAuth, user } = useAppSelector((s) => s.auth);

  if (!isAuth || !user || !allowedRoles.includes(user?.role as Role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
