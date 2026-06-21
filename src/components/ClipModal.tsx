import { useEffect } from 'react';
import { X, Download, Clock, Film } from 'lucide-react';

interface ClipModalProps {
  clipUrl: string;
  timestamp?: string;
  objects?: string[];
  onClose: () => void;
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

export default function ClipModal({ clipUrl, timestamp, objects, onClose }: ClipModalProps) {
  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lecteur de clip vidéo"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      {/* Card — stop propagation so clicks inside don't close the modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[800px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Film size={16} className="text-blue-600" />
            Clip vidéo
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video */}
        <video
          controls
          autoPlay
          src={clipUrl}
          className="block w-full bg-black"
          style={{ maxHeight: '60vh' }}
        />

        {/* Meta + actions */}
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} className="text-slate-400" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>

          {objects && objects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {objects.map((obj) => (
                <span
                  key={obj}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                >
                  {obj}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <a
              href={clipUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Download size={15} />
              Télécharger .mp4
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
