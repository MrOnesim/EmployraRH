import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  CheckCircle,
  XCircle,
  Scan,
  UserCheck,
  Terminal,
  Smartphone,
  Key,
} from 'lucide-react';
import {
  scanAttendanceWithToken,
  registerTerminal,
  getTerminals,
  getGuards,
} from '../services/securityGuardService';

async function generateDeviceFingerprint(): Promise<string> {
  const raw = navigator.userAgent + navigator.language + navigator.platform;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `DF-${hashHex.slice(0, 16).toUpperCase()}`;
}

const SCAN_METHODS = [
  { value: 'qr', label: 'QR Code', icon: Scan },
  { value: 'nfc', label: 'NFC', icon: Smartphone },
  { value: 'manual', label: 'Manuel', icon: Key },
] as const;

export default function GuardScanPage() {
  const { currentUser, currentCompany } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [terminalId, setTerminalId] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState(false);
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error'; message?: string }>({
    status: 'idle',
  });
  const [cooldown, setCooldown] = useState(0);
  const [scanMethod, setScanMethod] = useState<(typeof SCAN_METHODS)[number]['value']>('qr');
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  useEffect(() => {
    generateDeviceFingerprint().then(setDeviceFingerprint);
  }, []);

  useEffect(() => {
    if (!currentCompany || !deviceFingerprint) return;
    getTerminals(currentCompany.id)
      .then((terminals) => {
        const existing = terminals.find((t: any) => t.deviceFingerprint === deviceFingerprint);
        if (existing) {
          setTerminalId(existing.id);
        } else {
          return registerTerminal(
            `Terminal ${currentUser?.firstName || currentUser?.lastName || 'Guard'}`,
            deviceFingerprint,
            currentCompany.id,
          ).then((term) => setTerminalId(term.id));
        }
      })
      .catch(() => setTerminalError(true));
  }, [currentCompany, currentUser, deviceFingerprint]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleScan = useCallback(async () => {
    if (!qrToken.trim() || !currentCompany || !terminalId || cooldown > 0) return;
    setScanning(true);
    setResult({ status: 'idle' });
    try {
      const guard = await getGuards(currentCompany.id);
      const myGuard = guard.find((g: any) => g.employee.userId === currentUser?.id);
      if (!myGuard) {
        setResult({ status: 'error', message: "Vous n'êtes pas autorisé comme agent de sécurité" });
        return;
      }
      const checkedIn = await scanAttendanceWithToken({
        qrToken: qrToken.trim(),
        guardId: myGuard.id,
        terminalId,
        deviceFingerprint,
        scanMethod,
      });
      setResult({
        status: 'success',
        message: `Pointage enregistré pour ${checkedIn.employee.firstName} ${checkedIn.employee.lastName}`,
      });
      setQrToken('');
      setCooldown(3);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors du scan';
      setResult({ status: 'error', message: msg });
    } finally {
      setScanning(false);
    }
  }, [qrToken, currentCompany, currentUser, terminalId, cooldown, deviceFingerprint, scanMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan();
  };

  if (terminalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
          <XCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Erreur de terminal</h2>
          <p className="text-sm text-red-400/80">
            Impossible d'enregistrer le terminal. Vérifiez votre connexion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Scan Agent de Sécurité</h1>
            <p className="text-sm text-white/60 mt-1">
              Scannez le badge employé pour enregistrer le pointage
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Token QR Code
              </label>
              <input
                ref={inputRef}
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Scannez ou saisissez le token QR..."
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Méthode de scan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCAN_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setScanMethod(m.value)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
                        scanMethod === m.value
                          ? 'bg-primary/20 border-primary/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      <Icon size={16} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={scanning || !qrToken.trim() || !terminalId || cooldown > 0}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {scanning ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Scan size={18} />
              )}
              {scanning
                ? 'Scan en cours...'
                : cooldown > 0
                  ? `Attendez ${cooldown}s...`
                  : 'Valider le pointage'}
            </button>
          </form>

          {result.status !== 'idle' && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
                result.status === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {result.status === 'success' ? (
                <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {result.status === 'success' ? 'Pointage validé' : 'Erreur'}
                </p>
                <p
                  className={`text-xs mt-0.5 ${result.status === 'success' ? 'text-emerald-400/80' : 'text-red-400/80'}`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <UserCheck size={14} />
                Connecté en tant qu'agent de sécurité
              </div>
            </div>
            {terminalId && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Terminal size={14} />
                  Terminal: {terminalId.slice(0, 8)}...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
