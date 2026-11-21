import { BrowserRouter } from "react-router";
import { useAuth } from "../../hooks/use-auth";
import { useAppSelector } from "#hooks/redux-hooks";
import { Role } from "../../features/auth/enums/role";
import { storage } from "../../utils/storage";
import TenantSelect from "./tenant-select";
import AppRoutes from "../app-routes";
import { Spinner } from "#components/ui/spinner";

/**
 * Blocks the whole app behind an instance selection:
 * until a tenant is picked (storage) the user only sees the TenantSelect screen.
 * The global SuperAdmin (logs in without a tenant) passes through.
 */
export default function TenantGate() {
  const { isAuthDone } = useAuth();
  const user = useAppSelector((s) => s.auth.user);

  const tenant = storage.getTenant();

  if (!isAuthDone) return <Spinner />;

  if (!tenant && user?.role !== Role.SuperAdmin) {
    return <TenantSelect />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
