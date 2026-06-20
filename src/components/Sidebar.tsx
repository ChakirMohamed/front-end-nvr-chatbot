import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  MessageSquare,
  GitBranch,
} from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/live', icon: Radio, label: 'Vue en direct' },
  { to: '/chat', icon: MessageSquare, label: 'Assistant IA' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline IA' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen overflow-hidden bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="NVR Logo" width={64} height={64} className="object-contain scale-x-[-1]" />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">NVR Intelligent</p>
            <p className="text-[10px] text-slate-500 leading-tight">Surveillance IA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          CHAKIR Mohamed · EL ASRY Soufiane
          <br />
          Université Mohammed V – Rabat
          <br />
          ML &amp; Deep Learning · 2025/2026
        </p>
      </div>
    </aside>
  );
}
