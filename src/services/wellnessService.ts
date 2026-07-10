import api from '../lib/axios';
import type { WellnessSurvey, WellnessResponse } from '../types';
import { mapWellnessSurvey, mapWellnessSurveys, mapWellnessResponse } from '../utils/mappers';

export async function getWellnessSurveys(params: { companyId: string }): Promise<WellnessSurvey[]> {
  const { data } = await api.get('/wellness-surveys', { params });
  return mapWellnessSurveys(data);
}

export async function getActiveSurveys(companyId: string): Promise<WellnessSurvey[]> {
  const { data } = await api.get(`/wellness-surveys/active/${companyId}`);
  return mapWellnessSurveys(data);
}

export async function getWellnessSurvey(id: string): Promise<WellnessSurvey> {
  const { data } = await api.get(`/wellness-surveys/${id}`);
  return mapWellnessSurvey(data);
}

export async function getSurveyResults(id: string): Promise<any> {
  const { data } = await api.get(`/wellness-surveys/${id}/results`);
  return data;
}

export async function createWellnessSurvey(survey: {
  title: string; description: string; questions: any[]; companyId: string;
}): Promise<WellnessSurvey> {
  const { data } = await api.post('/wellness-surveys', survey);
  return mapWellnessSurvey(data);
}

export async function submitWellnessResponse(response: {
  surveyId: string; employeeId: string; answers: Record<string, any>; anonymous?: boolean;
}): Promise<WellnessResponse> {
  const { data } = await api.post('/wellness-responses', response);
  return mapWellnessResponse(data);
}
