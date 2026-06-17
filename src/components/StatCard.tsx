import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: 'blue' | 'emerald' | 'amber' | 'violet';
}

const accents = {
  blue:    { icon: 'text-blue-600',    bg: 'bg-blue-50',    value: 'text-blue-700' },
  emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', value: 'text-emerald-700' },
  amber:   { icon: 'text-amber-600',   bg: 'bg-amber-50',   value: 'text-amber-700' },
  violet:  { icon: 'text-violet-600',  bg: 'bg-violet-50',  value: 'text-violet-700' },
};

export default function StatCard({ label, value, sub, icon, accent = 'blue' }: Props) {
  const a = accents[accent];
  return (
    <div className="card card-hover p-5 flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center shrink-0 ${a.icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-600 uppercase tracking-wider mb-1 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${a.value} leading-none`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
