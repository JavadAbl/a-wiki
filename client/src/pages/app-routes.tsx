import { Routes, Route } from "react-router";
import Home from "./home/home";
import Layout from "./layout/layout";
import CourseRoutes from "./course/course-routes";
import AdminPanelRoutes from "./admin-panel/admin-panel-routes";
import RoleAuthorizationRoute from "#components/auth/role-authorization-route";
import { Role } from "../features/auth/enums/role";
import About from "./about/about";
import NotFound from "#components/utils/not-found";
import TenantSelect from "./tenants/tenant-select";

// Auth resolution (useAuth) happens in TenantGate before this tree mounts,
// so isAuth is already settled here.
export default function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Courses/*" element={<CourseRoutes />} />
          <Route path="/Tenants" element={<TenantSelect />} />
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
