import { Route, Routes, Navigate } from "react-router";
import AdminPanelCourses from "./admin-courses/admin-panel-courses";
import AdminPanelLayout from "./admin-panel-layout";
import AdminCourse from "./admin-courses/components/admin-course";
import AdminPanelCategories from "./admin-categories/admin-panel-categories";
import AdminPanelUsers from "./admin-users/admin-panel-users";

export default function AdminPanelRoutes() {
  return (
    <Routes>
      <Route element={<AdminPanelLayout />}>
        <Route path="/" element={<Navigate to="Courses" replace />} />
        <Route path="Courses" element={<AdminPanelCourses />} />
        <Route path="Users" element={<AdminPanelUsers />} />
        <Route path="Categories" element={<AdminPanelCategories />} />
        <Route path="Courses/:id" element={<AdminCourse />} />
      </Route>
    </Routes>
  );
}
