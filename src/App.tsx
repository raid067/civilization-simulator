import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Boxes,
  Map,
  BookOpen,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { CivilizationState, RoleType } from './types';
import { createInitialCivilization } from './simulation/generator';
import { simulateSeason, simulateYear, initializeRNG, getRNG } from './simulation/engine';
import { TimelineBar } from './components/TimelineBar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { FullRosterView } from './components/FullRosterView';
import { LaborManager } from './components/LaborManager';
import { ResourcesView } from './components/ResourcesView';
import { GeographyMap } from './components/GeographyMap';
import { TechTree } from './components/TechTree';
import { YearlyReportView } from './components/YearlyReportView';
import { PersonModal } from './components/PersonModal';
import { ExtinctionModal } from './components/ExtinctionModal';
import { runAutonomySystem } from './simulation/systems/autonomy';
import { createSimulationContext, DEFAULT_CONFIG } from './simulation/context';

const STORAGE_KEY = 'ai_civ_sim_state_v1';
const SEED_KEY = 'ai_civ_sim_seed_v1';

export default function App() {
  const [civState, setCivState] = useState<CivilizationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedSeed = localStorage.getItem(SEED_KEY);
      
      if (saved && savedSeed) {
        const seed = parseInt(savedSeed, 10);
        initializeRNG(seed);
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
    
    // Generate new seed for new simulation run
    const seed = Math.floor(Math.random() * 1000000);
    localStorage.setItem(SEED_KEY, seed.toString());
    initializeRNG(seed);
    
    return createInitialCivilization(getRNG());
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [inspectingPersonId, setInspectingPersonId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [annualNotification, setAnnualNotification] = useState<string | null>(null);
  const [showExtinctionModal, setShowExtinctionModal] = useState<boolean>(true);

  // Debounced save state to localStorage to eliminate jank during auto-play
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(civState));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [civState]);

  // Guarantee state is saved when closing/reloading the browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(civState));
      } catch (e) {
        console.warn('Flush before unload failed:', e);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [civState]);

  // Keyboard navigation and simulation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when focusing inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleStepSeason();
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleStepYear();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleStepDecade();
      } else if (e.key === '1') {
        setPlaySpeed(1);
      } else if (e.key === '2') {
        setPlaySpeed(2);
      } else if (e.key === '3') {
        setPlaySpeed(5);
      } else if (e.key === '4') {
        setPlaySpeed(10);
      } else if (e.key === 'Escape') {
        setInspectingPersonId(null);
        setShowExtinctionModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulation loop when continuous mode is active
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = playSpeed === 10 ? 300 : playSpeed === 5 ? 700 : playSpeed === 2 ? 1500 : 3000;
    const timer = setInterval(() => {
      setCivState((prev) => {
        const { state: nextState, reportGenerated } = simulateSeason(prev);
        
        // Run autonomy system if enabled
        if (nextState.policies?.autonomyEnabled !== false) {
          try {
            const context = createSimulationContext(nextState, parseInt(localStorage.getItem(SEED_KEY) || '12345', 10), DEFAULT_CONFIG);
            runAutonomySystem(context);
          } catch (e) {
            console.warn('Autonomy system error:', e);
          }
        }
        
        if (reportGenerated) {
          setAnnualNotification(`Solar cycle ${reportGenerated.year} complete! Forensic Annual Report compiled.`);
        }
        return nextState;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  // Handler to advance 1 season
  const handleStepSeason = () => {
    setCivState((prev) => {
      const { state: nextState, reportGenerated } = simulateSeason(prev);
      
      if (nextState.policies?.autonomyEnabled !== false) {
        try {
          const context = createSimulationContext(nextState, parseInt(localStorage.getItem(SEED_KEY) || '12345', 10), DEFAULT_CONFIG);
          runAutonomySystem(context);
        } catch (e) {
          console.warn('Autonomy system error:', e);
        }
      }
      
      if (reportGenerated) {
        setAnnualNotification(`Solar cycle ${reportGenerated.year} complete! Forensic Annual Report compiled.`);
      }
      return nextState;
    });
  };

  // Handler to advance 1 year
  const handleStepYear = () => {
    setCivState((prev) => {
      const { state: nextState, report } = simulateYear(prev);
      
      if (nextState.policies?.autonomyEnabled !== false) {
        try {
          const context = createSimulationContext(nextState, parseInt(localStorage.getItem(SEED_KEY) || '12345', 10), DEFAULT_CONFIG);
          runAutonomySystem(context);
        } catch (e) {
          console.warn('Autonomy system error:', e);
        }
      }
      
      setAnnualNotification(`Solar cycle ${report.year} concluded with Environmental Threat Level: ${report.threatLevel}`);
      return nextState;
    });
  };

  // Handler to advance 1 full decade (10 solar cycles / 40 seasons)
  const handleStepDecade = () => {
    setCivState((prev) => {
      let currentState = prev;
      let lastReport: any = null;
      for (let y = 0; y < 10; y++) {
        const { state: nextState, report } = simulateYear(currentState);
        currentState = nextState;
        lastReport = report;
        if (currentState.policies?.autonomyEnabled !== false) {
          try {
            const context = createSimulationContext(
              currentState,
              parseInt(localStorage.getItem(SEED_KEY) || '12345', 10) + y,
              DEFAULT_CONFIG
            );
            runAutonomySystem(context);
          } catch (e) {
            console.warn('Autonomy system error:', e);
          }
        }
        if (currentState.people.filter((p) => p.alive).length === 0) break;
      }
      if (lastReport) {
        setAnnualNotification(`Decade epoch concluded! Reached Solar Cycle Year ${lastReport.year} (Active Cohort: ${currentState.people.filter(p => p.alive).length}).`);
      }
      return currentState;
    });
  };

  // Handler to reset simulation
  const handleReset = () => {
    if (window.confirm('Re-initialize simulation cohort to Year 0 with 100 autonomous humans? All empirical observations will be reset.')) {
      setIsPlaying(false);
      const fresh = createInitialCivilization();
      setCivState(fresh);
      setAnnualNotification(null);
      setShowExtinctionModal(true);
    }
  };

  // Policy updater
  const handleUpdatePolicy = (key: keyof CivilizationState['policies'], value: any) => {
    setCivState((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [key]: value,
      },
    }));
  };

  // Labor role distribution modifier
  const handleUpdateRoleDistribution = (targetRole: RoleType, delta: number) => {
    setCivState((prev) => {
      const livingPeople = [...prev.people];
      const eligibleAdults = livingPeople.filter((p) => p.alive && p.age >= 10);

      if (delta > 0) {
        // Reassign someone from a larger pool (e.g. forager or hunter) to targetRole
        const candidate = eligibleAdults.find((p) => p.role !== targetRole && p.role !== 'elder_lorekeeper');
        if (candidate) {
          candidate.role = targetRole;
        }
      } else if (delta < 0) {
        // Reassign someone from targetRole to forager (default)
        const workerInRole = eligibleAdults.find((p) => p.role === targetRole);
        if (workerInRole) {
          workerInRole.role = 'forager';
        }
      }

      return {
        ...prev,
        people: livingPeople,
      };
    });
  };

  // Quick labor preset applicator
  const handleApplyPreset = (preset: 'balanced' | 'food' | 'winter' | 'lore') => {
    setCivState((prev) => {
      const livingPeople = [...prev.people];
      const eligibleAdults = livingPeople.filter((p) => p.alive && p.age >= 10);
      if (eligibleAdults.length === 0) return prev;

      let distribution: { role: RoleType; weight: number }[] = [];
      if (preset === 'balanced') {
        distribution = [
          { role: 'forager', weight: 0.30 },
          { role: 'water_fetcher', weight: 0.20 },
          { role: 'hunter', weight: 0.15 },
          { role: 'lumberjack', weight: 0.15 },
          { role: 'farmer', weight: 0.05 },
          { role: 'builder', weight: 0.05 },
          { role: 'herbalist', weight: 0.05 },
          { role: 'elder_lorekeeper', weight: 0.05 },
        ];
      } else if (preset === 'food') {
        distribution = [
          { role: 'forager', weight: 0.50 },
          { role: 'hunter', weight: 0.30 },
          { role: 'water_fetcher', weight: 0.20 },
        ];
      } else if (preset === 'winter') {
        distribution = [
          { role: 'lumberjack', weight: 0.35 },
          { role: 'forager', weight: 0.25 },
          { role: 'hunter', weight: 0.20 },
          { role: 'water_fetcher', weight: 0.15 },
          { role: 'herbalist', weight: 0.05 },
        ];
      } else if (preset === 'lore') {
        distribution = [
          { role: 'elder_lorekeeper', weight: 0.25 },
          { role: 'scout', weight: 0.20 },
          { role: 'forager', weight: 0.25 },
          { role: 'water_fetcher', weight: 0.20 },
          { role: 'hunter', weight: 0.10 },
        ];
      }

      let currentIndex = 0;
      distribution.forEach((item, idx) => {
        const isLast = idx === distribution.length - 1;
        const count = isLast
          ? eligibleAdults.length - currentIndex
          : Math.floor(eligibleAdults.length * item.weight);

        for (let i = 0; i < count && currentIndex < eligibleAdults.length; i++) {
          eligibleAdults[currentIndex].role = item.role;
          currentIndex++;
        }
      });

      return {
        ...prev,
        people: livingPeople,
      };
    });
  };

  const inspectedPerson = inspectingPersonId
    ? civState.people.find((p) => p.id === inspectingPersonId) || null
    : null;

  const livingCount = civState.people.filter((p) => p.alive).length;
  const isExtinct = livingCount === 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Simulation Header & Timeline Controls */}
      <TimelineBar
        state={civState}
        isPlaying={isPlaying}
        playSpeed={playSpeed}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onChangeSpeed={setPlaySpeed}
        onStepSeason={handleStepSeason}
        onStepYear={handleStepYear}
        onStepDecade={handleStepDecade}
        onReset={handleReset}
        onOpenLatestReport={() => setActiveTab('reports')}
      />

      {/* Extinction Alert Banner if cohort collapsed */}
      {isExtinct && (
        <div className="bg-red-950/80 border-b border-red-800 px-4 py-3 text-center text-red-200 text-sm animate-pulse flex items-center justify-center gap-3">
          <span className="font-bold">☠️ DEMOGRAPHIC EXTINCTION EVENT:</span>
          <span>All 100 cohort members have perished from physiological or environmental collapse. Simulation run concluded.</span>
          <button
            onClick={() => setShowExtinctionModal(true)}
            className="underline font-bold text-red-300 hover:text-white"
          >
            Examine Forensic Mortality Etiology
          </button>
        </div>
      )}

      {/* Annual Notification Toast */}
      {annualNotification && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2 text-center text-amber-200 text-xs flex items-center justify-center gap-3">
          <span>{annualNotification}</span>
          <button
            onClick={() => {
              setActiveTab('reports');
              setAnnualNotification(null);
            }}
            className="underline hover:text-amber-100 font-semibold"
          >
            View Ledger
          </button>
          <button onClick={() => setAnnualNotification(null)} className="text-amber-400 hover:text-amber-100 ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <nav role="tablist" aria-label="Civilization Dashboard Tabs" className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          <button
            id="tab-overview"
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="panel-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Telemetry & Vitals
          </button>

          <button
            id="tab-roster"
            role="tab"
            aria-selected={activeTab === 'roster'}
            aria-controls="panel-roster"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'roster'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Demographic Census ({livingCount})
          </button>

          <button
            id="tab-labor"
            role="tab"
            aria-selected={activeTab === 'labor'}
            aria-controls="panel-labor"
            onClick={() => setActiveTab('labor')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'labor'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Division of Labor
          </button>

          <button
            id="tab-resources"
            role="tab"
            aria-selected={activeTab === 'resources'}
            aria-controls="panel-resources"
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'resources'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Ecological Stockpiles
          </button>

          <button
            id="tab-geography"
            role="tab"
            aria-selected={activeTab === 'geography'}
            aria-controls="panel-geography"
            onClick={() => setActiveTab('geography')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'geography'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Spatial Biomes & Habitats
          </button>

          <button
            id="tab-tech-lore"
            role="tab"
            aria-selected={activeTab === 'tech_lore'}
            aria-controls="panel-tech_lore"
            onClick={() => setActiveTab('tech_lore')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'tech_lore'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Cultural Transmission & Tech
          </button>

          <button
            id="tab-reports"
            role="tab"
            aria-selected={activeTab === 'reports'}
            aria-controls="panel-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Empirical Annual Reports ({civState.annualReports.length})
          </button>
        </div>
      </nav>

      {/* Main Viewport Content */}
      <main
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6"
      >
        {activeTab === 'overview' && (
          <OverviewDashboard
            state={civState}
            onUpdatePolicy={handleUpdatePolicy}
            onInspectPerson={(id) => setInspectingPersonId(id)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'roster' && (
          <FullRosterView
            state={civState}
            onInspectPerson={(id) => setInspectingPersonId(id)}
          />
        )}

        {activeTab === 'labor' && (
          <LaborManager
            state={civState}
            onUpdateRoleDistribution={handleUpdateRoleDistribution}
            onInspectPerson={(id) => setInspectingPersonId(id)}
            onToggleAutonomy={(enabled) => handleUpdatePolicy('autonomyEnabled', enabled)}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {activeTab === 'resources' && <ResourcesView state={civState} />}

        {activeTab === 'geography' && <GeographyMap state={civState} />}

        {activeTab === 'tech_lore' && <TechTree state={civState} />}

        {activeTab === 'reports' && (
          <YearlyReportView
            reports={civState.annualReports}
            currentYear={civState.year}
          />
        )}
      </main>

      {/* Person Inspection Modal (Section 1: 13 Physical Needs & Kinship) */}
      <PersonModal
        person={inspectedPerson}
        allPeople={civState.people}
        onClose={() => setInspectingPersonId(null)}
        onSelectPerson={(id) => setInspectingPersonId(id)}
      />

      {/* Extinction Postmortem Modal */}
      {isExtinct && showExtinctionModal && (
        <ExtinctionModal
          state={civState}
          onReset={handleReset}
          onClose={() => setShowExtinctionModal(false)}
        />
      )}
    </div>
  );
}
