import { Routes, Route } from "react-router";
import { useAppSelector } from "../hooks/redux-hooks";
import { useAuth } from "../hooks/use-auth";
import { Spinner } from "#components/ui/spinner";
import Home from "./home/home";
import Layout from "./layout/layout";
import CourseRoutes from "./course/course-routes";
import AdminPanelRoutes from "./admin-panel/admin-panel-routes";
import RoleAuthorizationRoute from "#components/auth/role-authorization-route";
import { Role } from "../features/auth/enums/role";

export default function AppRoutes() {
  // const theme = useAppSelector((s) => s.app.theme);
  const { isAuthDone } = useAuth();

  /* useLayoutEffect(() => {
    const currentTheme = storage.getTheme();
    if (currentTheme) dis(appActions.setTheme({ theme: currentTheme }));
    else dis(appActions.setTheme({ theme: "light" }));
  }, [dis]);

  if (!theme) return null; */
  if (!isAuthDone) return <Spinner />;
  return (
    <div /* data-theme={theme} */>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Courses/*" element={<CourseRoutes />} />
        </Route>

        <Route
          element={
            <RoleAuthorizationRoute
              allowedRoles={[Role.SuperAdmin, Role.Admin]}
            />
          }
        >
          <Route path="/Admin/*" element={<AdminPanelRoutes />} />
        </Route>

        {/*  <Route element={<PublicOnlyRoute />}>
          <Route path="/Login" element={<Login />} />
        </Route>

        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}
