import { Navigate } from "react-router";
import { useAppSelector } from "../../hooks/redux-hooks";
import { Role } from "../../features/auth/enums/role";
import type React from "react";

export default function SARoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  if (user?.role !== Role.SuperAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
