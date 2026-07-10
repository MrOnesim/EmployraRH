import api from '../lib/axios';
import type { JobOffer, Candidate } from '../types';
import { mapJobOffer, mapJobOffers, mapCandidate, mapCandidates } from '../utils/mappers';

export async function getJobOffers(params: { companyId: string }): Promise<JobOffer[]> {
  const { data } = await api.get('/job-offers', { params });
  return mapJobOffers(data);
}

export async function getOpenJobOffers(): Promise<JobOffer[]> {
  const { data } = await api.get('/job-offers/open');
  return mapJobOffers(data);
}

export async function createJobOffer(offer: {
  title: string; department: string; description: string;
  requirements: string; salary?: number; location?: string;
  type?: string; companyId: string;
}): Promise<JobOffer> {
  const { data } = await api.post('/job-offers', offer);
  return mapJobOffer(data);
}

export async function publishJobOffer(id: string): Promise<JobOffer> {
  const { data } = await api.patch(`/job-offers/${id}/publish`);
  return mapJobOffer(data);
}

export async function closeJobOffer(id: string): Promise<JobOffer> {
  const { data } = await api.patch(`/job-offers/${id}/close`);
  return mapJobOffer(data);
}

export async function updateJobOffer(id: string, updates: Partial<JobOffer>): Promise<JobOffer> {
  const { data } = await api.patch(`/job-offers/${id}`, updates);
  return mapJobOffer(data);
}

export async function deleteJobOffer(id: string): Promise<void> {
  await api.delete(`/job-offers/${id}`);
}

export async function getCandidates(params: { companyId?: string; jobOfferId?: string }): Promise<Candidate[]> {
  const { data } = await api.get('/candidates', { params });
  return mapCandidates(data);
}

export async function getCandidate(id: string): Promise<Candidate> {
  const { data } = await api.get(`/candidates/${id}`);
  return mapCandidate(data);
}

export async function updateCandidateStatus(id: string, status: string): Promise<Candidate> {
  const { data } = await api.patch(`/candidates/${id}/status`, { status });
  return mapCandidate(data);
}

export async function scheduleInterview(id: string, interviewDate: string): Promise<Candidate> {
  const { data } = await api.patch(`/candidates/${id}/schedule-interview`, { interviewDate });
  return mapCandidate(data);
}

export async function rejectCandidate(id: string): Promise<Candidate> {
  const { data } = await api.patch(`/candidates/${id}/reject`);
  return mapCandidate(data);
}
