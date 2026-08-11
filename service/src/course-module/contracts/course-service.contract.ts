export abstract class CourseServiceContract {
  abstract courseCount(): Promise<number>;
  abstract courseDuration(): Promise<number>;
}
