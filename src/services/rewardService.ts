import api from '../lib/axios';
import type { RewardCatalog, RewardTransaction } from '../types';
import {
  mapRewardCatalog,
  mapRewardCatalogs,
  mapRewardTransaction,
  mapRewardTransactions,
} from '../utils/mappers';

export async function getCatalog(companyId: string): Promise<RewardCatalog[]> {
  const { data } = await api.get('/rewards/catalog', { params: { companyId } });
  return mapRewardCatalogs(data);
}

export async function createCatalogItem(item: {
  companyId: string;
  name: string;
  description?: string;
  pointsCost: number;
  stock?: number;
  category: string;
  active?: boolean;
}): Promise<RewardCatalog> {
  const { data } = await api.post('/rewards/catalog', item);
  return mapRewardCatalog(data);
}

export async function getTransactions(employeeId: string): Promise<RewardTransaction[]> {
  const { data } = await api.get('/rewards/transactions', { params: { employeeId } });
  return mapRewardTransactions(data);
}

export async function addTransaction(tx: {
  employeeId: string;
  points: number;
  type: string;
  reason: string;
}): Promise<RewardTransaction> {
  const { data } = await api.post('/rewards/transactions', tx);
  return mapRewardTransaction(data);
}

export async function redeemReward(
  employeeId: string,
  catalogId: string,
): Promise<RewardTransaction> {
  const { data } = await api.post('/rewards/redeem', { employeeId, catalogId });
  return mapRewardTransaction(data);
}
