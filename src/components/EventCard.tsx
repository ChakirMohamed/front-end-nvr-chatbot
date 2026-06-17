import { Download, Clock, Camera, MapPin, Star } from 'lucide-react';
import type { VideoEvent } from '../types';
import { api } from '../api';

interface Props {
  event: VideoEvent;
  rank?: number;
}

const OBJ_COLORS: Record<string, string> = {
  person:    'bg-blue-50 text-blue-700 border-blue-200',
  car:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  truck:     'bg-amber-50 text-amber-700 border-amber-200',
  bicycle:   'bg-violet-50 text-violet-700 border-violet-200',
  motorbike: 'bg-rose-50 text-rose-700 border-rose-200',
};

function objColor(obj: string) {
  return OBJ_COLORS[obj.toLowerCase()] ?? 'bg-slate-50 text-slate-600 border-slate-200';
}

export default function EventCard({ event, rank }: Props) {
  const ts = new Date(event.timestamp);
  const dateStr = ts.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const scorePercent = Math.round(event.score * 100);

  return (
    <div className="card card-hover p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold shrink-0">
              {rank}
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              {dateStr} à {timeStr}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Camera size={10} />
                {event.camera_id}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {event.zone}
              </span>
              {event.score > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={10} />
                  {scorePercent}% similarité
                </span>
              )}
            </div>
          </div>
        </div>
        <a
          href={api.clipUrl(event.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Download size={12} />
          Clip .mp4
        </a>
      </div>

      {event.detected_objects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.detected_objects.map((obj, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${objColor(obj)}`}>
              {obj}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
