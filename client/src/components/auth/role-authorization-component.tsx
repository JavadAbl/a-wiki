import { useAppSelector } from "../../hooks/redux-hooks";
import { Role } from "../../features/auth/enums/role";

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
}
export default function RoleAuthorizationComponent({
  allowedRoles,
  children,
}: Props) {
  const { isAuth, user } = useAppSelector((s) => s.auth);

  if (!isAuth || !user || !allowedRoles.includes(user?.role as Role)) {
    return null;
  }
  return children;
}
