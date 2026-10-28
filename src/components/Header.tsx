import React from 'react';
import { Bell, Volume2, VolumeX, ShieldAlert, LogOut, User } from 'lucide-react';
import { useAmbulance } from '../context/AmbulanceContext';

export const Header: React.FC = () => {
  const {
    isAudioMuted,
    setIsAudioMuted,
    alerts,
    setShowSosModal,
    isAuthenticated,
    currentDoctor,
    logoutDoctor,
    setActiveTab,
  } = useAmbulance();

  return (
    <header className="bg-[#0b1328] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg select-none">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
          <span>AMBULANCE - LIVE MONITORING</span>
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Emergency Badge */}
        <button
          onClick={() => setShowSosModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-md tracking-wider flex items-center gap-1.5 transition-colors sos-btn-pulse cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>EMERGENCY</span>
        </button>

        {/* Online Status */}
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse-dot"></span>
          <span>Online</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          title={isAudioMuted ? 'Unmute Audio Beeps' : 'Mute Audio Beeps'}
        >
          {isAudioMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Notifications Icon */}
        <div className="relative cursor-pointer" onClick={() => setActiveTab('alerts')}>
          <div className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </div>

        {/* Doctor Profile & Login Control */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <img
                src={currentDoctor.avatarUrl}
                alt={currentDoctor.name}
                className="w-9 h-9 rounded-full object-cover border border-blue-500/40"
              />
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-slate-100">{currentDoctor.name}</div>
                <div className="text-[11px] text-slate-400">{currentDoctor.title.split('&')[0]}</div>
              </div>

              <button
                onClick={logoutDoctor}
                className="p-1.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700/80 transition-all cursor-pointer"
                title="Sign Out Doctor / Switch User"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/30"
            >
              <User className="w-4 h-4" />
              <span>Doctor Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
