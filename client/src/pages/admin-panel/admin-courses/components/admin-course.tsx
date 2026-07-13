import { useParams } from "react-router";
import { useCourseGetByIdQuery } from "../../../../features/course/course-api";
import { skipToken } from "@reduxjs/toolkit/query";

export default function AdminCourse() {
  const { id } = useParams();

  //Data Hooks
  const { data: course } = useCourseGetByIdQuery(courseId ?? skipToken);

  console.log(course);

  return <div>AdminCourse</div>;
}
