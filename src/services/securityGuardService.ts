import api from '../lib/axios';

export async function getGuards(companyId: string) {
  const { data } = await api.get('/security-guards', { params: { companyId } });
  return data;
}

export async function assignGuard(employeeId: string, companyId: string) {
  const { data } = await api.post('/security-guards/assign', { employeeId, companyId });
  return data;
}

export async function removeGuard(id: string) {
  const { data } = await api.delete(`/security-guards/${id}`);
  return data;
}

export async function scanAttendance(guardId: string, employeeId: string) {
  const { data } = await api.post('/security-guards/scan', { guardId, employeeId });
  return data;
}

export async function registerTerminal(name: string, deviceFingerprint: string, companyId: string) {
  const { data } = await api.post('/terminals/register', { name, deviceFingerprint, companyId });
  return data;
}

export async function getTerminals(companyId: string) {
  const { data } = await api.get('/terminals', { params: { companyId } });
  return data;
}

export async function generateQrToken(employeeId: string, companyId: string) {
  const { data } = await api.post('/qr-tokens/generate', { employeeId, companyId });
  return data;
}

export async function scanAttendanceWithToken(params: {
  qrToken: string;
  guardId: string;
  terminalId: string;
  deviceFingerprint: string;
  ipAddress?: string;
  scanMethod?: string;
}) {
  const { data } = await api.post('/attendance/scan', params);
  return data;
}
