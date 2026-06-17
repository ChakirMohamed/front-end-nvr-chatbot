import { INTENT_LABELS } from '../types';

const BADGE: Record<string, string> = {
  search:       'bg-blue-100 text-blue-700',
  summary:      'bg-emerald-100 text-emerald-700',
  clip_request: 'bg-violet-100 text-violet-700',
  greeting:     'bg-amber-100 text-amber-700',
  unknown:      'bg-slate-100 text-slate-600',
};

const BAR_COLOR: Record<string, string> = {
  search:       'bg-blue-600',
  summary:      'bg-emerald-600',
  clip_request: 'bg-violet-600',
  greeting:     'bg-amber-500',
  unknown:      'bg-slate-400',
};

interface Props {
  scores: Record<string, number>;
  topIntent: string;
  confidence: number;
}

export default function IntentBar({ scores, topIntent, confidence }: Props) {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
          Classificateur d'intentions (ML)
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[topIntent] ?? 'bg-slate-100 text-slate-600'}`}>
          {INTENT_LABELS[topIntent] ?? topIntent} · {Math.round(confidence * 100)}%
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map(([intent, prob]) => {
          const pct = Math.round(prob * 100);
          return (
            <div key={intent} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 w-20 shrink-0 text-right">
                {INTENT_LABELS[intent] ?? intent}
              </span>
              {/* --bar-w is a CSS custom property read by .score-bar in index.css */}
              <div
                className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"
                style={{ '--bar-w': `${pct}%` } as React.CSSProperties}
              >
                <div className={`score-bar ${BAR_COLOR[intent] ?? 'bg-slate-400'}`} />
              </div>
              <span className="text-[10px] text-slate-600 w-8 text-right font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
