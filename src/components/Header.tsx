import React from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Vote, 
  CalendarCheck, 
  Wallet, 
  Bell, 
  GitBranch, 
  CheckCircle2, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { TabType, Community, GitHubState } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  community: Community;
  unresolvedIncidentsCount: number;
  gitHubState: GitHubState;
  onOpenNewIncident: () => void;
  onOpenGitHubModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  community,
  unresolvedIncidentsCount,
  gitHubState,
  onOpenNewIncident,
  onOpenGitHubModal,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Resumen', icon: Building2 },
    { id: 'units' as TabType, label: 'Vecinos y Fincas', icon: Users },
    { 
      id: 'incidents' as TabType, 
      label: 'Incidencias', 
      icon: AlertTriangle, 
      badge: unresolvedIncidentsCount > 0 ? unresolvedIncidentsCount : undefined 
    },
    { id: 'meetings' as TabType, label: 'Juntas y Votaciones', icon: Vote },
    { id: 'reservations' as TabType, label: 'Reservas', icon: CalendarCheck },
    { id: 'finances' as TabType, label: 'Contabilidad', icon: Wallet },
    { id: 'notices' as TabType, label: 'Tablón', icon: Bell },
    { 
      id: 'github' as TabType, 
      label: 'Enlace GitHub', 
      icon: GitBranch,
      highlight: true,
      connected: gitHubState.isConnected
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{community.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  CIF: {community.cif}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {community.address}, {community.postalCode} {community.city} · {community.totalUnits} viviendas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* GitHub badge / button */}
            <button
              id="header-github-status-btn"
              onClick={onOpenGitHubModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                gitHubState.isConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              {gitHubState.isConnected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>GitHub: {gitHubState.selectedRepo?.name || gitHubState.user?.login || 'Conectado'}</span>
                </>
              ) : (
                <>
                  <span>Enlazar con GitHub</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </>
              )}
            </button>

            {/* New Incident Quick Button */}
            <button
              id="header-new-incident-btn"
              onClick={onOpenNewIncident}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Avisar Incidencia</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Pestañas de navegación">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && tab.connected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
