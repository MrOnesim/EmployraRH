import api from '../lib/axios';
import type { Course, Enrollment, Quiz, QuizAttempt, Certificate } from '../types';
import { mapCourse, mapCourses, mapEnrollment, mapEnrollments, mapQuizzes, mapQuizAttempt, mapCertificates } from '../utils/mappers';

export async function getCourses(params: { companyId: string }): Promise<Course[]> {
  const { data } = await api.get('/courses', { params });
  return mapCourses(data);
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await api.get(`/courses/${id}`);
  return mapCourse(data);
}

export async function createCourse(course: {
  title: string; description?: string; category: string;
  duration: number; instructor: string; companyId: string;
}): Promise<Course> {
  const { data } = await api.post('/courses', course);
  return mapCourse(data);
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const { data } = await api.patch(`/courses/${id}`, updates);
  return mapCourse(data);
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function getEnrollmentsByEmployee(employeeId: string): Promise<Enrollment[]> {
  const { data } = await api.get(`/enrollments/employee/${employeeId}`);
  return mapEnrollments(data);
}

export async function getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
  const { data } = await api.get(`/enrollments/course/${courseId}`);
  return mapEnrollments(data);
}

export async function createEnrollment(enrollment: {
  courseId: string; employeeId: string;
}): Promise<Enrollment> {
  const { data } = await api.post('/enrollments', enrollment);
  return mapEnrollment(data);
}

export async function completeLesson(enrollmentId: string, lessonId: string): Promise<Enrollment> {
  const { data } = await api.patch(`/enrollments/${enrollmentId}/complete-lesson/${lessonId}`);
  return mapEnrollment(data);
}

export async function getQuizzes(courseId: string): Promise<Quiz[]> {
  const { data } = await api.get('/quizzes', { params: { courseId } });
  return mapQuizzes(data);
}

export async function submitQuizAttempt(attempt: {
  quizId: string; employeeId: string; answers: number[];
}): Promise<QuizAttempt> {
  const { data } = await api.post('/quiz-attempts/submit', attempt);
  return mapQuizAttempt(data);
}

export async function getCertificatesByEmployee(employeeId: string): Promise<Certificate[]> {
  const { data } = await api.get(`/certificates/employee/${employeeId}`);
  return mapCertificates(data);
}
