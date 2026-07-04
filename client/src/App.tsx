import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router";
import { Toaster } from "#components/ui/sonner";
import AppRoutes from "./pages/app-routes";
import { store } from "./features/store";

export default function App() {
  return (
    <ReduxProvider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </ReduxProvider>
  );
}
