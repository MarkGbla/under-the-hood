import { curriculum, getCurriculumLesson } from "./curriculum";
import { validateCurriculum } from "./validation";

export const lessons = validateCurriculum(curriculum);

export function getLesson(slug: string) {
  return getCurriculumLesson(slug);
}
