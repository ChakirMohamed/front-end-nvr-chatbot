import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { List, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { VideoEvent } from '../types';
import EventCard from '../components/EventCard';

const OBJECT_OPTIONS = ['person', 'car', 'truck', 'bicycle', 'motorbike', 'van'];

export default function Events() {
  const [cameraId, setCameraId]   = useState('');
  const [objectType, setObjectType] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');
  const [limit, setLimit]         = useState(50);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['events', cameraId, objectType, startTime, endTime, limit],
    queryFn: () => api.events({
      camera_id:   cameraId || undefined,
      object_type: objectType || undefined,
      start_time:  startTime || undefined,
      end_time:    endTime || undefined,
      limit,
    }),
  });

  return (
    <div className="p-8 max-w-4xl w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Événements</h1>
          <p className="text-sm text-slate-600 mt-0.5">Tous les frames détectés indexés dans SQLite</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={isRefetching ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">Filtres</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div>
            <label className="text-xs text-slate-700 font-semibold mb-1 block">Caméra</label>
            <input
              type="text"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              placeholder="Toutes"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label htmlFor="evt-object" className="text-xs text-slate-700 font-semibold mb-1 block">Type d'objet</label>
            <select
              id="evt-object"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            >
              <option value="">Tous</option>
              {OBJECT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="evt-start" className="text-xs text-slate-700 font-semibold mb-1 block">Début</label>
            <input
              id="evt-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label htmlFor="evt-end" className="text-xs text-slate-700 font-semibold mb-1 block">Fin</label>
            <input
              id="evt-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label htmlFor="evt-limit" className="text-xs text-slate-700 font-semibold mb-1 block">Limite</label>
            <select
              id="evt-limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            >
              {[20, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {data && (
        <p className="text-xs text-slate-600 mb-4">
          <span className="text-blue-700 font-semibold">{data.count}</span> événement(s) chargé(s)
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} />
          Erreur lors du chargement. Vérifiez que l'API est démarrée.
        </div>
      )}

      {data?.events.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <List size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-700 text-sm">Aucun événement trouvé.</p>
          <p className="text-slate-500 text-xs mt-1">
            Lancez <code className="text-blue-600 bg-blue-50 px-1 rounded">python demo.py</code> pour ingérer des données.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data?.events.map((ev: VideoEvent) => <EventCard key={ev.id} event={ev} />)}
      </div>
    </div>
  );
}
