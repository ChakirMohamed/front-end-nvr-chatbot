import { useState } from 'react';
import { Search as SearchIcon, Filter, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { VideoEvent } from '../types';
import EventCard from '../components/EventCard';

const OBJECT_OPTIONS = ['person', 'car', 'truck', 'bicycle', 'motorbike', 'van', 'tricycle', 'bus', 'motor'];

export default function Search() {
  const [query, setQuery]                   = useState('');
  const [topK, setTopK]                     = useState(10);
  const [cameraId, setCameraId]             = useState('');
  const [startTime, setStartTime]           = useState('');
  const [endTime, setEndTime]               = useState('');
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [results, setResults]               = useState<VideoEvent[] | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [showFilters, setShowFilters]       = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.search({
        query,
        top_k: topK,
        camera_id: cameraId || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        object_types: selectedObjects.length ? selectedObjects : undefined,
      });
      setResults(res.results);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleObject(obj: string) {
    setSelectedObjects((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  }

  return (
    <div className="p-8 max-w-4xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Recherche sémantique</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Requête texte → CLIP ViT-B/32 → FAISS IVFFlat → résultats en &lt; 300 ms
        </p>
      </div>

      <form onSubmit={runSearch} className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <SearchIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ex. : "quelqu'un à l'entrée", "voiture suspecte la nuit"…`}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 transition-colors ${
              showFilters
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} />
            Filtres
          </button>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <SearchIcon size={14} />}
            Rechercher
          </button>
        </div>

        {showFilters && (
          <div className="card p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-semibold mb-1 block">Caméra</label>
                <input
                  type="text"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  placeholder="cam-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="filter-start" className="text-xs text-slate-700 font-semibold mb-1 block">Début</label>
                <input
                  id="filter-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label htmlFor="filter-end" className="text-xs text-slate-700 font-semibold mb-1 block">Fin</label>
                <input
                  id="filter-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-semibold mb-2 block">Types d'objets</label>
              <div className="flex flex-wrap gap-2">
                {OBJECT_OPTIONS.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => toggleObject(obj)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedObjects.includes(obj)
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400'
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-700 font-semibold">Résultats max :</label>
              {[5, 10, 20].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTopK(k)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                    topK === k
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 text-sm mb-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {results !== null && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            <span className="text-blue-700 font-semibold">{results.length}</span> résultat(s) pour{' '}
            <span className="text-slate-700">"{query}"</span>
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <SearchIcon size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun événement correspondant.</p>
              <p className="text-xs mt-1">Essayez une requête différente ou élargissez les filtres.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((ev, i) => <EventCard key={ev.id} event={ev} rank={i + 1} />)}
            </div>
          )}
        </div>
      )}

      {results === null && !loading && (
        <div className="text-center py-16 text-slate-400">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Décrivez ce que vous cherchez en français naturel</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {["quelqu'un à l'entrée", 'voiture stationnée', 'activité nocturne', 'personne avec un sac'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
