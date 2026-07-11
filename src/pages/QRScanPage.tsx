import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useQRCode } from '../context/QRCodeContext';
import { CheckCircle, XCircle, Camera, MapPin, Shield, Loader2, ShieldAlert } from 'lucide-react';
import type { QRCodeType } from '../types';

const QR_TYPE_KEYWORDS: Record<string, QRCodeType> = {
  ARRIVEE: 'arrival',
  ARRIVAL: 'arrival',
  PAUSE: 'lunch_start',
  DEJEUNER: 'lunch_start',
  LUNCH: 'lunch_start',
  RETOUR: 'lunch_end',
  REPRISE: 'lunch_end',
  DEPART: 'departure',
  DEPARTURE: 'departure',
};

function decodeQRData(
  code: string,
  sessions: { type: QRCodeType; code: string }[],
): { type: QRCodeType } | null {
  const session = sessions.find((s) => s.code === code);
  if (session) return { type: session.type };
  const parts = code.split('-');
  if (parts.length < 2) return null;
  const suffix = parts[1];
  for (const [key, type] of Object.entries(QR_TYPE_KEYWORDS)) {
    if (suffix.startsWith(key.charAt(0)) || suffix.includes(key.slice(0, 2))) {
      return { type };
    }
  }
  return { type: 'arrival' };
}

export default function QRScanPage() {
  const { currentUser } = useApp();
  const { sessions, validateScan, recordScan } = useQRCode();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'csp';
    message?: string;
  }>({ status: 'idle' });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualCode, setManualCode] = useState('');

  const getPosition = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Géolocalisation non disponible'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 10000, enableHighAccuracy: true },
      );
    });
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleScan = useCallback(
    async (decodedText: string) => {
      stopCamera();
      setScanning(false);

      const decoded = decodeQRData(decodedText, sessions);
      if (!decoded) {
        setResult({ status: 'error', message: 'QR Code invalide' });
        return;
      }

      const validation = validateScan(decodedText, decoded.type, coords?.lat, coords?.lng);
      if (!validation.valid) {
        setResult({ status: 'error', message: validation.reason });
        return;
      }

      const sessionId = `${new Date().toISOString().split('T')[0]}-${decoded.type}`;
      if (currentUser) {
        recordScan(currentUser.id, sessionId, decoded.type, coords?.lat, coords?.lng);
      }

      setResult({ status: 'success', message: 'Pointage enregistré ✓' });
      setTimeout(() => navigate('/employee-dashboard'), 2000);
    },
    [coords, currentUser, navigate, sessions, validateScan, recordScan, stopCamera],
  );

  const scanFrame = async () => {
    if (!videoRef.current || !('BarcodeDetector' in window)) return;
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        handleScan(barcodes[0].rawValue);
        return;
      }
    } catch {
      /* noop */
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  };

  const startScanner = async () => {
    setResult({ status: 'idle' });

    if (!('BarcodeDetector' in window)) {
      setResult({
        status: 'csp',
        message: 'Votre navigateur ne supporte pas le scan natif. Utilisez Chrome ou Edge récent.',
      });
      return;
    }

    setScanning(true);
    setGpsStatus('loading');
    try {
      const pos = await getPosition();
      setCoords(pos);
      setGpsStatus('ok');
    } catch {
      setGpsStatus('error');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        rafRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      setScanning(false);
      setResult({ status: 'error', message: "Impossible d'accéder à la caméra" });
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <Camera size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Scan QR Code</h1>
          <p className="text-blue-200 text-sm">Scannez le QR Code affiché dans votre entreprise</p>
        </div>

        {result.status === 'idle' && !scanning && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 text-center">
            {'BarcodeDetector' in window ? (
              <>
                <Shield size={48} className="mx-auto text-blue-300 mb-4" />
                <p className="text-gray-300 mb-6">
                  Pointez votre téléphone vers le QR Code affiché à l'entrée
                </p>
                <button
                  onClick={startScanner}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/50"
                >
                  Scanner maintenant
                </button>
              </>
            ) : (
              <div className="mb-6">
                <Camera size={40} className="mx-auto text-yellow-400 mb-3" />
                <p className="text-yellow-300 font-medium mb-1">Scan non disponible</p>
                <p className="text-gray-400 text-sm">
                  Votre navigateur ne supporte pas le scan natif. Utilisez Chrome ou Edge, ou
                  saisissez le code manuellement.
                </p>
              </div>
            )}

            <div
              className={'BarcodeDetector' in window ? 'mt-6 pt-6 border-t border-white/10' : ''}
            >
              <p className="text-sm text-gray-400 mb-3">Saisissez le code du QR Code :</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualCode.trim()) handleScan(manualCode.trim());
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="EP-XXXXXXXX"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  Valider
                </button>
              </form>
            </div>
          </div>
        )}

        {scanning && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
            <div className="flex items-center justify-center gap-2 mt-4">
              {gpsStatus === 'loading' && (
                <Loader2 size={16} className="animate-spin text-blue-300" />
              )}
              {gpsStatus === 'ok' && <MapPin size={16} className="text-green-400" />}
              {gpsStatus === 'error' && <MapPin size={16} className="text-yellow-400" />}
              <span className="text-sm text-gray-400">
                {gpsStatus === 'loading'
                  ? 'Vérification GPS...'
                  : gpsStatus === 'ok'
                    ? 'Position validée'
                    : gpsStatus === 'error'
                      ? 'GPS indisponible (scan non-géolocalisé)'
                      : 'En attente...'}
              </span>
            </div>
          </div>
        )}

        {result.status === 'success' && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 text-center animate-in">
            <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Présence confirmée</h2>
            <p className="text-green-200">{result.message}</p>
          </div>
        )}

        {result.status === 'csp' && (
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-yellow-500/30 text-center">
            <ShieldAlert size={64} className="mx-auto text-yellow-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Blocage de sécurité</h2>
            <p className="text-yellow-200 mb-4">{result.message}</p>
            <ul className="text-sm text-yellow-200/80 text-left space-y-1 mb-6 max-w-sm mx-auto">
              <li>• Désactivez les extensions de blocage (uBlock, NoScript)</li>
              <li>• Utilisez Chrome, Edge ou Firefox récent</li>
              <li>• Contactez votre administrateur réseau</li>
            </ul>
            <div className="mb-6 pt-4 border-t border-yellow-500/20">
              <p className="text-sm text-yellow-200/70 mb-3">Ou saisissez le code manuellement :</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualCode.trim()) handleScan(manualCode.trim());
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="EP-XXXXXXXX"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-yellow-500/30 text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-3 bg-yellow-600 text-white rounded-xl font-medium text-sm hover:bg-yellow-700 disabled:opacity-50 transition-all"
                >
                  Valider
                </button>
              </form>
            </div>
            <button
              onClick={() => setResult({ status: 'idle' })}
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Réessayer
            </button>
          </div>
        )}

        {result.status === 'error' && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 text-center">
            <XCircle size={64} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Pointage refusé</h2>
            <p className="text-red-200 mb-6">{result.message}</p>
            <button
              onClick={() => setResult({ status: 'idle' })}
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
