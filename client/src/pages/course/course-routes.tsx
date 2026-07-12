import { Route, Routes } from "react-router";
import Courses from "./courses/courses";

export default function CourseRoutes() {
  return (
    <Routes>
      <Route index element={<Courses />} />
    </Routes>
  );
}
