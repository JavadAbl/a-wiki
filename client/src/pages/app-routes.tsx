import { Routes, Route } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks";
import { useAuth } from "../hooks/use-auth";
import { Spinner } from "#components/ui/spinner";
import Home from "./home/home";
import Layout from "./layout/layout";
import { storage } from "../utils/storage";

export default function AppRoutes() {
  // const theme = useAppSelector((s) => s.app.theme);
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const dis = useAppDispatch();

  useAuth();

  /* useLayoutEffect(() => {
    const currentTheme = storage.getTheme();
    if (currentTheme) dis(appActions.setTheme({ theme: currentTheme }));
    else dis(appActions.setTheme({ theme: "light" }));
  }, [dis]);

  if (!theme) return null; */
  if (isAuth == null) return <Spinner />;
  return (
    <div /* data-theme={theme} */>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/Products/*" element={<ProductsRoutes />} /> */}
        </Route>

        {/*  <Route element={<PublicOnlyRoute />}>
          <Route path="/Login" element={<Login />} />
        </Route>

        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}
