import { Provider as ReduxProvider } from "react-redux";
import { Toaster } from "#components/ui/sonner";
import { store } from "./features/store";
import TenantGate from "./pages/tenants/tenant-gate";

export default function App() {
  return (
    <ReduxProvider store={store}>
      {/* TenantGate renders the instance-selection screen until a tenant is
          chosen, then mounts the router with the normal routes. */}
      <TenantGate />
      <Toaster />
    </ReduxProvider>
  );
}
