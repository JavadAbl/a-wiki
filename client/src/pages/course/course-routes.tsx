import { Route, Routes } from "react-router";
import Courses from "./courses/courses";
import CourseBrowser from "./course-browser/course-browser";
import AuthenticationRoute from "#components/auth/authentication-route";

export default function CourseRoutes() {
  return (
    <Routes>
      <Route index element={<Courses />} />

      <Route element={<AuthenticationRoute />}>
        <Route path=":id" element={<CourseBrowser />} />
      </Route>
    </Routes>
  );
}
