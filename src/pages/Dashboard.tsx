import { useQuery } from '@tanstack/react-query';
import { Activity, Camera, Database, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';
import type { Camera as CameraType, VideoEvent } from '../types';
import StatCard from '../components/StatCard';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const health  = useQuery({ queryKey: ['health'],         queryFn: api.health,                          refetchInterval: 10_000 });
  const cameras = useQuery({ queryKey: ['cameras'],        queryFn: api.cameras });
  const events  = useQuery({ queryKey: ['events-recent'],  queryFn: () => api.events({ limit: 6 }) });

  const isOnline = health.data?.status === 'ok';

  return (
    <div className="p-8 max-w-5xl w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-dot' : 'bg-rose-500'}`} />
          <span className={`text-xs font-medium ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isOnline ? 'Système opérationnel' : 'Hors ligne'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-600 text-sm mt-1">
          Surveillance vidéo intelligente — Université Mohammed V Rabat
        </p>
      </div>

      {/* Performance metrics banner */}
      <div className="card p-5 mb-6">
        <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-medium">Performances du système</p>
        <div className="flex flex-wrap gap-8">
          {[
            { label: 'Précision Intent Classifier', value: '91,7 %',  color: 'text-blue-700' },
            { label: 'Latence recherche FAISS',      value: '< 300 ms', color: 'text-emerald-700' },
            { label: 'Gain mAP50 YOLOv8',            value: '× 16',    color: 'text-amber-700' },
            { label: 'Réduction frames (MOG2)',       value: '− 90 %',  color: 'text-violet-700' },
          ].map((m) => (
            <div key={m.label}>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-600 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard
          label="Frames indexées"
          value={health.data?.indexed_frames.toLocaleString('fr-FR') ?? '—'}
          sub="vecteurs FAISS 512d"
          icon={<Database size={18} />}
          accent="blue"
        />
        <StatCard
          label="Caméras actives"
          value={cameras.data?.cameras.length ?? '—'}
          sub="flux RTSP monitorés"
          icon={<Camera size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Inférence YOLO"
          value="~8 fps"
          sub="Intel Iris Xe + OpenVINO"
          icon={<Zap size={18} />}
          accent="amber"
        />
        <StatCard
          label="Intent Classifier"
          value="91,7 %"
          sub="PyTorch · 300 phrases FR"
          icon={<Activity size={18} />}
          accent="violet"
        />
      </div>

      {/* Cameras table */}
      {cameras.data && cameras.data.cameras.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Caméras enregistrées
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Identifiant', 'Frames', 'Première vue', 'Dernière vue'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-700 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cameras.data.cameras.map((cam: CameraType) => (
                  <tr key={cam.camera_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-600 font-medium">{cam.camera_id}</td>
                    <td className="px-4 py-2.5 text-slate-700">{cam.frame_count.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-2.5 text-slate-600">{new Date(cam.first_seen).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-2.5 text-slate-600">{new Date(cam.last_seen).toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Événements récents
          </h2>
          {events.isRefetching && <RefreshCw size={12} className="text-slate-400 animate-spin" />}
        </div>

        {events.isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {events.isError && (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-4 bg-rose-50 border border-rose-200 rounded-xl px-4">
            <AlertCircle size={16} />
            Impossible de charger les événements. L'API est-elle démarrée ?
          </div>
        )}

        {events.data && events.data.events.length === 0 && (
          <p className="text-slate-700 text-sm py-4">
            Aucun événement indexé. Lancez <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">python demo.py</code> pour ingérer des données.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {events.data?.events.map((ev: VideoEvent) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </div>
  );
}
