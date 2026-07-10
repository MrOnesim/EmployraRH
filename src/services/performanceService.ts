import api from '../lib/axios';
import type { PerformanceReview } from '../types';
import { mapPerformanceReview, mapPerformanceReviews } from '../utils/mappers';

export async function getPerformanceReviews(params: { companyId: string }): Promise<PerformanceReview[]> {
  const { data } = await api.get('/performance-reviews', { params });
  return mapPerformanceReviews(data);
}

export async function getPerformanceReview(id: string): Promise<PerformanceReview> {
  const { data } = await api.get(`/performance-reviews/${id}`);
  return mapPerformanceReview(data);
}

export async function getReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
  const { data } = await api.get(`/performance-reviews/employee/${employeeId}`);
  return mapPerformanceReviews(data);
}

export async function createPerformanceReview(review: {
  employeeId: string; reviewerId: string;
  rating?: number; feedback?: string;
  strengths?: string[]; improvements?: string[];
  companyId: string;
}): Promise<PerformanceReview> {
  const { data } = await api.post('/performance-reviews', review);
  return mapPerformanceReview(data);
}

export async function submitPerformanceReview(id: string): Promise<PerformanceReview> {
  const { data } = await api.patch(`/performance-reviews/${id}/submit`);
  return mapPerformanceReview(data);
}

export async function acknowledgePerformanceReview(id: string, employeeId: string): Promise<PerformanceReview> {
  const { data } = await api.patch(`/performance-reviews/${id}/acknowledge`, { employeeId });
  return mapPerformanceReview(data);
}
