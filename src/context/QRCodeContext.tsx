import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { QRCodeConfig, QRCodeSession, QRCodeType, QRScanLog } from '../types';

const DEFAULT_CONFIG: QRCodeConfig = {
  arrivalTime: '09:00',
  lunchStartTime: '13:00',
  lunchEndTime: '14:00',
  departureTime: '18:00',
  lateTolerance: 15,
  gpsRadius: 300,
  requireSelfie: false,
  companyLat: 14.7167,
  companyLng: -17.4677,
};

function generateCode(companyId: string, date: string, type: QRCodeType, salt: string): string {
  const raw = `${companyId}|${date}|${type}|${salt}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `EP-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0')}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getExpiry(time: string, tolerance: number): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m + tolerance + 30, 0, 0);
  return d.toISOString();
}

interface QRCodeContextValue {
  config: QRCodeConfig;
  updateConfig: (cfg: Partial<QRCodeConfig>) => void;
  sessions: QRCodeSession[];
  scanLogs: QRScanLog[];
  validateScan: (code: string, type: QRCodeType, latitude?: number, longitude?: number) => { valid: boolean; reason?: string };
  recordScan: (employeeId: string, sessionId: string, type: QRCodeType, latitude?: number, longitude?: number) => void;
  getCodeForType: (type: QRCodeType) => string | undefined;
}

const QRCodeContext = createContext<QRCodeContextValue | undefined>(undefined);

export function QRCodeProvider({ children }: { children: ReactNode }) {
  const companyId = '1';
  const salt = 'EMPLOYEPRO_SALT_2024';

  const [config, setConfig] = useState<QRCodeConfig>(() => {
    const stored = localStorage.getItem('qr_config');
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  });

  const [sessions, setSessions] = useState<QRCodeSession[]>(() => {
    const stored = localStorage.getItem('qr_sessions');
    return stored ? JSON.parse(stored) : [];
  });

  const [scanLogs, setScanLogs] = useState<QRScanLog[]>(() => {
    const stored = localStorage.getItem('qr_scans');
    return stored ? JSON.parse(stored) : [];
  });

  const updateConfig = useCallback((cfg: Partial<QRCodeConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...cfg };
      localStorage.setItem('qr_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const generateDailySessions = useCallback(() => {
    const today = getTodayStr();
    const existingToday = sessions.filter(s => s.date === today);
    if (existingToday.length === 4) return;

    const types: QRCodeType[] = ['arrival', 'lunch_start', 'lunch_end', 'departure'];
    const times: Record<QRCodeType, string> = {
      arrival: config.arrivalTime,
      lunch_start: config.lunchStartTime,
      lunch_end: config.lunchEndTime,
      departure: config.departureTime,
    };

    const newSessions: QRCodeSession[] = types.map(type => ({
      id: `${today}-${type}`,
      companyId,
      date: today,
      type,
      code: generateCode(companyId, today, type, salt),
      generatedAt: new Date().toISOString(),
      expiresAt: getExpiry(times[type], config.lateTolerance),
    }));

    const updated = [...sessions.filter(s => s.date !== today), ...newSessions];
    setSessions(updated);
    localStorage.setItem('qr_sessions', JSON.stringify(updated));
  }, [config, sessions, companyId]);

  useEffect(() => {
    generateDailySessions();
    const interval = setInterval(() => {
      const today = getTodayStr();
      if (!sessions.some(s => s.date === today)) {
        generateDailySessions();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCodeForType = useCallback((type: QRCodeType): string | undefined => {
    const today = getTodayStr();
    const session = sessions.find(s => s.date === today && s.type === type);
    return session?.code;
  }, [sessions]);

  const validateScan = useCallback((code: string, type: QRCodeType, latitude?: number, longitude?: number) => {
    const today = getTodayStr();
    const session = sessions.find(s => s.date === today && s.type === type);

    if (!session) return { valid: false, reason: 'Aucun QR Code valide pour aujourd\'hui' };
    if (session.code !== code) return { valid: false, reason: 'QR Code invalide ou périmé' };

    const now = new Date();
    const expires = new Date(session.expiresAt);
    if (now > expires) return { valid: false, reason: 'Fenêtre de scan expirée' };

    const existingScan = scanLogs.find(l => l.sessionId === session.id);
    if (existingScan) return { valid: false, reason: 'QR Code déjà scanné' };

    if (latitude !== undefined && longitude !== undefined) {
      const R = 6371000;
      const dLat = (latitude - config.companyLat) * Math.PI / 180;
      const dLng = (longitude - config.companyLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(config.companyLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance > config.gpsRadius) {
        return { valid: false, reason: 'Pointage refusé : vous n\'êtes pas dans la zone autorisée' };
      }
    }

    return { valid: true };
  }, [sessions, scanLogs, config]);

  const recordScan = useCallback((employeeId: string, sessionId: string, type: QRCodeType, latitude?: number, longitude?: number) => {
    const log: QRScanLog = {
      id: `scan-${Date.now()}`,
      employeeId,
      sessionId,
      type,
      scannedAt: new Date().toISOString(),
      latitude,
      longitude,
      status: 'approved',
    };
    const updated = [...scanLogs, log];
    setScanLogs(updated);
    localStorage.setItem('qr_scans', JSON.stringify(updated));
  }, [scanLogs]);

  return (
    <QRCodeContext.Provider value={{ config, updateConfig, sessions, scanLogs, validateScan, recordScan, getCodeForType }}>
      {children}
    </QRCodeContext.Provider>
  );
}

export function useQRCode() {
  const ctx = useContext(QRCodeContext);
  if (!ctx) throw new Error('useQRCode must be used within QRCodeProvider');
  return ctx;
}
