import api from '../lib/axios';
import type { Contract } from '../types';
import { mapContract, mapContracts } from '../utils/mappers';

export async function getContractsByEmployee(employeeId: string): Promise<Contract[]> {
  const { data } = await api.get(`/contracts/employee/${employeeId}`);
  return mapContracts(data);
}

export async function createContract(contract: {
  employeeId: string;
  type: string;
  position: string;
  startDate: string;
  endDate?: string;
  salary: number;
  documentUrl?: string;
}): Promise<Contract> {
  const { data } = await api.post('/contracts', contract);
  return mapContract(data);
}

export async function updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
  const { data } = await api.patch(`/contracts/${id}`, updates);
  return mapContract(data);
}
