import api from '../lib/axios';
import type { EmployeeVaultItem } from '../types';
import { mapVaultItem, mapVaultItems } from '../utils/mappers';

export async function getVaultItems(employeeId: string): Promise<EmployeeVaultItem[]> {
  const { data } = await api.get('/employee-vault', { params: { employeeId } });
  return mapVaultItems(data);
}

export async function createVaultItem(item: {
  employeeId: string;
  type: string;
  name: string;
  fileUrl?: string;
  objectKey?: string;
  expiresAt?: string;
}): Promise<EmployeeVaultItem> {
  const { data } = await api.post('/employee-vault', item);
  return mapVaultItem(data);
}

export async function getUploadUrl(
  employeeId: string,
  filename: string,
): Promise<{ objectKey: string; uploadUrl: string }> {
  const { data } = await api.post('/employee-vault/upload-url', { employeeId, filename });
  return data;
}

export async function getDownloadUrl(id: string): Promise<{ downloadUrl: string }> {
  const { data } = await api.get(`/employee-vault/${id}/download-url`);
  return data;
}

export async function deleteVaultItem(id: string): Promise<void> {
  await api.delete(`/employee-vault/${id}`);
}
