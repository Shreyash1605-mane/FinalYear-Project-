import React from 'react';
import { AmbulanceProvider, useAmbulance } from './context/AmbulanceContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InfoBanner } from './components/InfoBanner';

// Import View Page Components
import { DashboardOverview } from './views/DashboardOverview';
import { PatientManagement } from './views/PatientManagement';
import { VitalsMonitoring } from './views/VitalsMonitoring';
import { EcgMonitorView } from './views/EcgMonitorView';
import { TreatmentsProcedures } from './views/TreatmentsProcedures';
import { MedicationsView } from './views/MedicationsView';
import { AlertsCenter } from './views/AlertsCenter';
import { AmbulanceTracking } from './views/AmbulanceTracking';
import { ReportsAnalytics } from './views/ReportsAnalytics';
import { SettingsView } from './views/SettingsView';
import { LoginPage } from './views/LoginPage';

import { VoiceCallModal } from './components/VoiceCallModal';
import { MessageDrawer } from './components/MessageDrawer';
import { SosModal } from './components/SosModal';

const AppContent: React.FC = () => {
  const { activeTab, databaseStatus, databaseError } = useAmbulance();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patient':
        return <PatientManagement />;
      case 'vitals':
        return <VitalsMonitoring />;
      case 'ecg':
        return <EcgMonitorView />;
      case 'treatments':
        return <TreatmentsProcedures />;
      case 'medications':
        return <MedicationsView />;
      case 'alerts':
        return <AlertsCenter />;
      case 'tracking':
        return <AmbulanceTracking />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SettingsView />;
      case 'login':
        return <LoginPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d19] text-slate-100 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Software Description & Key Features Info Banner */}
        <InfoBanner />

        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Main View Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#090d19]">
          {renderActiveView()}
        </main>
      </div>

      <div className="fixed bottom-3 right-3 z-50 max-w-sm rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-[11px] shadow-xl">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${databaseStatus === 'synced' ? 'bg-emerald-400' : databaseStatus === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-slate-300">
            {databaseStatus === 'synced' ? 'Firebase synced' : databaseStatus === 'error' ? 'Firebase sync failed' : 'Syncing Firebase data...'}
          </span>
        </div>
        {databaseError && <p className="mt-1 break-words text-red-300">{databaseError}</p>}
      </div>

      {/* Modals & Drawers */}
      <VoiceCallModal />
      <MessageDrawer />
      <SosModal />
    </div>
  );
};

export default function App() {
  return (
    <AmbulanceProvider>
      <AppContent />
    </AmbulanceProvider>
  );
}
