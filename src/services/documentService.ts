import api from '../lib/axios';

interface AppDocument {
  id: string;
  companyId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  department?: string;
  category?: string;
}

export async function getDocuments(params?: {
  department?: string;
  category?: string;
}): Promise<AppDocument[]> {
  const { data } = await api.get('/documents', { params });
  return data;
}

export async function createDocument(doc: Omit<AppDocument, 'id'>): Promise<AppDocument> {
  const { data } = await api.post('/documents', doc);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export const uploadDocument = createDocument;
