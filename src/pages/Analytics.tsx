import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';
import { api } from '../api';

const BAR_CLASSES = [
  'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500',
  'bg-red-600',  'bg-cyan-600',    'bg-lime-600',   'bg-pink-600',
];
const PIE_FILLS = ['#2563eb','#059669','#7c3aed','#d97706','#dc2626','#0891b2','#65a30d','#db2777'];

function fillClass(pct: number) {
  return `fill-${Math.round(pct / 5) * 5}`;
}

const TIP = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 12,
    color: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
};

export default function Analytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api.summary(),
  });

  const hourlyData = data
    ? Array.from({ length: 24 }, (_, h) => ({
        heure: `${h.toString().padStart(2, '0')}h`,
        événements: data.hourly_distribution[h] ?? 0,
      }))
    : [];

  const objectData: { name: string; value: number }[] = data
    ? Object.entries(data.object_counts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 8)
        .map(([name, value]) => ({ name, value: value as number }))
    : [];

  const peakHour = data
    ? Object.entries(data.hourly_distribution).sort(([, a], [, b]) => (b as number) - (a as number))[0]
    : null;

  return (
    <div className="p-8 max-w-5xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytique</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Distribution des événements — endpoint <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">/summary</code>
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={14} />
          Impossible de charger les statistiques.
        </div>
      )}

      {data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
            {[
              { label: 'Total événements',        value: data.total_events.toLocaleString('fr-FR'), color: 'text-blue-700' },
              { label: 'Types d\'objets distincts', value: Object.keys(data.object_counts).length,  color: 'text-emerald-700' },
              {
                label: 'Heure de pointe',
                value: peakHour ? `${parseInt(peakHour[0]).toString().padStart(2,'0')}h` : '—',
                color: 'text-amber-700',
              },
              { label: 'Objet dominant', value: objectData[0]?.name ?? '—', color: 'text-violet-700' },
            ].map((k) => (
              <div key={k.label} className="card p-4 card-hover">
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-1 font-medium">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Hourly chart */}
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-600" />
              Distribution horaire des événements
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData} barSize={14}>
                <XAxis dataKey="heure" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...TIP} />
                <Bar dataKey="événements" fill="#2563eb" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Object breakdown */}
          {objectData.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Répartition par type d'objet</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={objectData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                      {objectData.map((_, i) => <Cell key={i} fill={PIE_FILLS[i % PIE_FILLS.length]} />)}
                    </Pie>
                    <Tooltip {...TIP} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Classement des objets détectés</h2>
                <div className="flex flex-col gap-3">
                  {objectData.map((obj, i) => {
                    const pct = Math.round((obj.value / data.total_events) * 100);
                    return (
                      <div key={obj.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-slate-600">{obj.name}</span>
                          <span className="text-xs text-slate-600">{obj.value} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bar-transition ${fillClass(pct)} ${BAR_CLASSES[i % BAR_CLASSES.length]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {data.total_events === 0 && (
            <div className="text-center py-16">
              <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-700 text-sm font-medium">Aucune donnée disponible.</p>
              <p className="text-slate-500 text-xs mt-1">
                Lancez <code className="text-blue-600 bg-blue-50 px-1 rounded">python demo.py</code> pour ingérer des données.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
