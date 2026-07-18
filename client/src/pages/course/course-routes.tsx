import { Route, Routes } from "react-router";
import Courses from "./courses/courses";
import CourseBrowser from "./course-browser/course-browser";

export default function CourseRoutes() {
  return (
    <Routes>
      <Route index element={<Courses />} />
      <Route path=":id" element={<CourseBrowser />} />
    </Routes>
  );
}
