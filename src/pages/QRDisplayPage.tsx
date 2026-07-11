import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, RefreshCw, Smartphone, Clock, Sun, Coffee, Sunset, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useQRCode } from '../context/QRCodeContext';
import { generateQrToken } from '../services/securityGuardService';
import type { QRCodeType } from '../types';

const QR_TYPES: { type: QRCodeType; label: string; icon: React.ElementType }[] = [
  { type: 'arrival', label: 'Arrivée', icon: Sun },
  { type: 'lunch_start', label: 'Déjeuner', icon: Coffee },
  { type: 'lunch_end', label: 'Retour', icon: Sunset },
  { type: 'departure', label: 'Départ', icon: Moon },
];

export default function QRDisplayPage() {
  const navigate = useNavigate();
  const { currentUser, currentCompany } = useApp();
  const { getCodeForType } = useQRCode();
  const [token, setToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(45);
  const [loading, setLoading] = useState(true);
  const [useLocalCodes, setUseLocalCodes] = useState(false);

  const fetchToken = useCallback(async () => {
    if (!currentUser?.id || !currentCompany?.id) return;
    setLoading(true);
    try {
      const res = await generateQrToken(currentUser.id, currentCompany.id);
      setToken(res.token);
      setExpiresIn(Math.floor(res.expiresInMs / 1000));
      setUseLocalCodes(false);
    } catch {
      setUseLocalCodes(true);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentCompany]);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 30_000);
    const countdown = setInterval(() => {
      setExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [fetchToken]);

  const remainingRatio = expiresIn / 45;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Smartphone size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Mon QR Code Dynamique</h1>
          <p className="text-sm text-white/60 mb-6">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>

          {loading && !token ? (
            <div className="bg-white/5 rounded-xl p-4 inline-block mx-auto mb-4">
              <div className="w-56 h-56 flex items-center justify-center">
                <RefreshCw size={32} className="text-white/40 animate-spin" />
              </div>
            </div>
          ) : token ? (
            <>
              <div className="bg-white rounded-xl p-3 inline-block mx-auto mb-4 shadow-lg">
                <QRCodeSVG value={token} size={224} level="M" />
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-white/60 mb-4">
                <Clock size={14} />
                <span>
                  Expire dans <span className="font-mono font-bold text-white">{expiresIn}s</span>
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000"
                  style={{ width: `${remainingRatio * 100}%` }}
                />
              </div>

              <button
                onClick={fetchToken}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Rafraîchir
              </button>
            </>
          ) : useLocalCodes ? (
            <div className="space-y-3">
              <p className="text-sm text-white/60">Scannez le QR correspondant à votre action :</p>
              <div className="grid grid-cols-2 gap-3">
                {QR_TYPES.map(({ type, label, icon: Icon }) => {
                  const code = getCodeForType(type);
                  return (
                    <div key={type} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-2 text-white/80 text-xs font-medium">
                        <Icon size={14} />
                        <span>{label}</span>
                      </div>
                      {code ? (
                        <div className="bg-white rounded-lg p-2 inline-block mx-auto">
                          <QRCodeSVG value={code} size={100} level="M" />
                        </div>
                      ) : (
                        <div className="h-[100px] flex items-center justify-center text-white/30 text-xs">
                          Indisponible
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={fetchToken}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm font-medium transition-all"
              >
                <RefreshCw size={14} className="inline mr-2" />
                Actualiser les codes
              </button>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              Impossible de générer le QR Code
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
