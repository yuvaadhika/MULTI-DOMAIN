import React from 'react';
import { SimulationProvider, useSimulation } from './simulation/simulationStore';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { PresentationOverlay } from './components/PresentationOverlay';
import { LandingPage } from './features/landing/LandingPage';
import { SessionLobby } from './features/lobby/SessionLobby';
import { LiveSimulationWorkspace } from './features/simulation/LiveSimulationWorkspace';
import { InstructorDashboard } from './features/instructor/InstructorDashboard';
import { ScenarioBuilder } from './features/scenarios/ScenarioBuilder';
import { ScenarioLibrary } from './features/scenarios/ScenarioLibrary';
import { EventLibrary } from './features/events/EventLibrary';
import { AfterActionReview } from './features/aar/AfterActionReview';
import { DecisionReplay } from './features/aar/DecisionReplay';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { ScenarioVariationEngine } from './features/variation/ScenarioVariationEngine';

const AppContent: React.FC = () => {
  const { currentView, presentationMode, toast, setToast } = useSimulation();

  const renderActiveView = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage />;
      case 'SESSION_LOBBY':
        return <SessionLobby />;
      case 'LIVE_SIMULATION':
        return <LiveSimulationWorkspace />;
      case 'INSTRUCTOR_DASHBOARD':
        return <InstructorDashboard />;
      case 'SCENARIO_BUILDER':
        return <ScenarioBuilder />;
      case 'SCENARIO_LIBRARY':
        return <ScenarioLibrary />;
      case 'EVENT_LIBRARY':
        return <EventLibrary />;
      case 'AAR_VIEW':
        return <AfterActionReview />;
      case 'REPLAY':
        return <DecisionReplay />;
      case 'ANALYTICS':
        return <AnalyticsDashboard />;
      case 'VARIATION_ENGINE':
        return <ScenarioVariationEngine />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Top Bar */}
      <TopBar />

      {/* Presentation Mode HUD Banner */}
      <PresentationOverlay />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (Hidden in full Presentation Mode if desired or on Landing) */}
        {!presentationMode && currentView !== 'LANDING' && <Sidebar />}

        {/* View Surface */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc]">
          {renderActiveView()}
        </main>
      </div>


      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs border flex items-center space-x-2 ${
            toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            toast.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            'bg-white text-slate-800 border-slate-200 shadow-md'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              toast.type === 'error' ? 'bg-rose-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
            }`} />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-700 font-bold text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
};

export default App;
