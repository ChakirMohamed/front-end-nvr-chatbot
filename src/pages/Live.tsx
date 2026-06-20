import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Radio,
  Video,
  VideoOff,
  RefreshCw,
  AlertCircle,
  Maximize2,
  Cctv,
} from 'lucide-react';
import { api } from '../api';
import type { LiveCamera } from '../types';

type Resolution = { w: number; h: number } | null;

/** Ticking clock used for the NVR timestamp overlay. */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** NVR-style burned-in timestamp: YYYY-MM-DD HH:MM:SS */
function fmtStamp(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Large primary video viewer with live overlays — the NVR "spot monitor". */
function MainViewer({
  cam,
  now,
  res,
  onResolution,
}: {
  cam: LiveCamera;
  now: Date;
  res: Resolution;
  onResolution: (r: Resolution) => void;
}) {
  // cacheBust changes force the <img> to reopen a fresh MJPEG connection.
  const [cacheBust, setCacheBust] = useState(() => Date.now());
  const [errored, setErrored] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const reload = () => {
    setErrored(false);
    onResolution(null);
    setCacheBust(Date.now());
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapRef.current?.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg"
    >
      {/* Video surface */}
      {!errored ? (
        <img
          key={cacheBust}
          src={api.liveUrl(cam.camera_id, cacheBust)}
          alt={`Flux ${cam.camera_id}`}
          className="w-full h-full object-contain"
          onLoad={(e) =>
            onResolution({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
          onError={() => {
            setErrored(true);
            onResolution(null);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm px-4 text-center">
          <VideoOff size={36} />
          <p>Flux indisponible — caméra injoignable ou réseau coupé.</p>
          <button
            onClick={reload}
            className="mt-1 text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Top overlay — REC + camera id (left), LIVE + timestamp (right) */}
      <div className="absolute top-0 inset-x-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 pulse-dot" />
            <span className="text-[11px] font-semibold tracking-wider text-rose-300">REC</span>
          </span>
          <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm font-mono text-xs text-sky-300">
            {cam.camera_id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {cam.connected ? (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-600/90 text-white text-[11px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" />
              LIVE
            </span>
          ) : (
            <span className="px-2 py-1 rounded bg-slate-700/90 text-slate-200 text-[11px] font-semibold tracking-wider">
              HORS LIGNE
            </span>
          )}
        </div>
      </div>

      {/* Bottom overlay — timestamp + stream info (left), controls (right) */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm font-mono text-xs text-emerald-300 tabular-nums">
            {fmtStamp(now)}
          </span>
          <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm font-mono text-xs text-slate-300">
            MJPEG · {res ? `${res.w}×${res.h}` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={reload}
            title="Recharger le flux"
            className="p-1.5 rounded bg-black/40 backdrop-blur-sm text-slate-200 hover:bg-black/70 hover:text-white transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Plein écran"
            className="p-1.5 rounded bg-black/40 backdrop-blur-sm text-slate-200 hover:bg-black/70 hover:text-white transition-colors"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small live preview used in the channel list. */
function CameraThumb({
  cam,
  active,
  onClick,
}: {
  cam: LiveCamera;
  active: boolean;
  onClick: () => void;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`group relative w-full aspect-video rounded-lg overflow-hidden border-2 text-left transition-colors ${
        active
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
        {!errored ? (
          <img
            src={api.liveUrl(cam.camera_id)}
            alt={`Aperçu ${cam.camera_id}`}
            className="w-full h-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <VideoOff size={20} className="text-slate-600" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
        <span className="font-mono text-[11px] text-white truncate">{cam.camera_id}</span>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            cam.connected ? 'bg-emerald-400 pulse-dot' : 'bg-rose-500'
          }`}
        />
      </div>
    </button>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right">{children}</span>
    </div>
  );
}

export default function Live() {
  const now = useClock();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [res, setRes] = useState<Resolution>(null);

  const live = useQuery({
    queryKey: ['live-cameras'],
    queryFn: api.liveCameras,
    refetchInterval: 5_000,
  });

  const cameras = live.data?.cameras ?? [];

  // Keep a valid active camera selected as the camera list changes.
  useEffect(() => {
    if (cameras.length === 0) {
      setActiveId(null);
      return;
    }
    if (!activeId || !cameras.some((c) => c.camera_id === activeId)) {
      const firstConnected = cameras.find((c) => c.connected) ?? cameras[0];
      setActiveId(firstConnected.camera_id);
    }
  }, [cameras, activeId]);

  // Resolution is reported by the main viewer; reset it when switching cameras.
  useEffect(() => {
    setRes(null);
  }, [activeId]);

  const activeCam = cameras.find((c) => c.camera_id === activeId) ?? null;
  const connectedCount = cameras.filter((c) => c.connected).length;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Radio size={13} className="text-rose-500" />
            <span className="text-[11px] font-medium text-rose-600 uppercase tracking-widest">
              Live
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Vue en direct</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-slate-800 tabular-nums leading-tight">
              {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              {now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
            <Cctv size={14} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-700">
              {connectedCount}/{cameras.length}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Main viewer area */}
        <div className="flex-1 p-4 min-w-0 flex">
          {live.isLoading ? (
            <div className="w-full h-full rounded-xl bg-slate-200 animate-pulse" />
          ) : live.isError ? (
            <div className="m-auto flex items-center gap-2 text-rose-600 text-sm py-4 bg-rose-50 border border-rose-200 rounded-xl px-4">
              <AlertCircle size={16} />
              Impossible de joindre l'API. Est-elle démarrée (uvicorn src.api.api:app) ?
            </div>
          ) : !activeCam ? (
            <div className="m-auto card p-8 flex flex-col items-center gap-3 text-center max-w-md">
              <Video size={32} className="text-slate-300" />
              <p className="text-slate-700 text-sm">Aucune caméra live active.</p>
              <p className="text-slate-500 text-xs">
                Vérifie{' '}
                <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">RTSP_URLS</code>{' '}
                dans le fichier{' '}
                <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">.env</code> et
                démarre l'API avec{' '}
                <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  INGEST_ON_STARTUP=true
                </code>
                .
              </p>
            </div>
          ) : (
            <MainViewer
              key={activeCam.camera_id}
              cam={activeCam}
              now={now}
              res={res}
              onResolution={setRes}
            />
          )}
        </div>

        {/* Right rail — only shown when there are multiple cameras to switch between */}
        {cameras.length > 1 && (
        <aside className="w-72 shrink-0 border-l border-slate-200 bg-white flex flex-col">
          {/* Channel list */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Caméras
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 gap-3">
              {cameras.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Aucune caméra</p>
              )}
              {cameras.map((cam: LiveCamera) => (
                <CameraThumb
                  key={cam.camera_id}
                  cam={cam}
                  active={cam.camera_id === activeId}
                  onClick={() => setActiveId(cam.camera_id)}
                />
              ))}
            </div>
          </div>

          {/* Stream info */}
          {activeCam && (
            <div className="border-t border-slate-200 p-4">
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Informations du flux
              </h2>
              <InfoRow label="Caméra">
                <span className="font-mono text-blue-600">{activeCam.camera_id}</span>
              </InfoRow>
              <InfoRow label="État">
                <span className={activeCam.connected ? 'text-emerald-600' : 'text-rose-600'}>
                  {activeCam.connected ? 'En direct' : 'Déconnectée'}
                </span>
              </InfoRow>
              <InfoRow label="Résolution">
                <span className="font-mono">{res ? `${res.w}×${res.h}` : '—'}</span>
              </InfoRow>
              <InfoRow label="Flux">MJPEG / HTTP</InfoRow>
              <InfoRow label="Source">RTSP</InfoRow>
              <InfoRow label="Horodatage">
                <span className="font-mono tabular-nums">{fmtStamp(now)}</span>
              </InfoRow>
            </div>
          )}
        </aside>
        )}
      </div>
    </div>
  );
}
