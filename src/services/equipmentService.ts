import api from '../lib/axios';
import type { Equipment, EquipmentAssignment } from '../types';
import { mapEquipment, mapEquipments, mapEquipmentAssignment } from '../utils/mappers';

export async function getEquipmentList(params: { companyId: string }): Promise<Equipment[]> {
  const { data } = await api.get('/equipment', { params });
  return mapEquipments(data);
}

export async function getAvailableEquipment(companyId: string): Promise<Equipment[]> {
  const { data } = await api.get(`/equipment/available/${companyId}`);
  return mapEquipments(data);
}

export async function createEquipment(equipment: {
  name: string; type: string; serialNumber: string;
  purchaseDate?: string; purchasePrice?: number; condition?: string;
  notes?: string; companyId: string;
}): Promise<Equipment> {
  const { data } = await api.post('/equipment', equipment);
  return mapEquipment(data);
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  const { data } = await api.patch(`/equipment/${id}`, updates);
  return mapEquipment(data);
}

export async function updateEquipmentStatus(id: string, status: string): Promise<Equipment> {
  const { data } = await api.patch(`/equipment/${id}/status`, { status });
  return mapEquipment(data);
}

export async function assignEquipment(equipmentId: string, employeeId: string, condition?: string): Promise<EquipmentAssignment> {
  const { data } = await api.post(`/equipment/${equipmentId}/assign`, { employeeId, conditionAtAssignment: condition });
  return mapEquipmentAssignment(data);
}

export async function returnEquipment(assignmentId: string, condition?: string): Promise<EquipmentAssignment> {
  const { data } = await api.patch(`/equipment/assignments/${assignmentId}/return`, { conditionAtReturn: condition });
  return mapEquipmentAssignment(data);
}

export async function deleteEquipment(id: string): Promise<void> {
  await api.delete(`/equipment/${id}`);
}
