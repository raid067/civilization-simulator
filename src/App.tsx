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
import { GlobalVitalsHUD } from './components/GlobalVitalsHUD';

const STORAGE_KEY = 'ai_civ_sim_state_v2';
const SEED_KEY = 'ai_civ_sim_seed_v2';

export default function App() {
  const [civState, setCivState] = useState<CivilizationState>(() => {
    try {
      // Safely clear legacy v1 if any was left behind
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('ai_civ_sim_state_v1');
        localStorage.removeItem('ai_civ_sim_seed_v1');
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      const savedSeed = localStorage.getItem(SEED_KEY);
      
      if (saved && savedSeed) {
        const seed = parseInt(savedSeed, 10);
        initializeRNG(seed);
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.people) && parsed.people.some((p: any) => p.alive)) {
          parsed.people.forEach((p: any) => {
            if (!p.relationships) p.relationships = { parentIds: [], childrenIds: [] };
            if (!Array.isArray(p.relationships.parentIds)) p.relationships.parentIds = [];
            if (!Array.isArray(p.relationships.childrenIds)) p.relationships.childrenIds = [];
          });
          return parsed;
        }
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
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleStepCentury();
      } else if (e.key === '1') {
        setPlaySpeed(1);
      } else if (e.key === '2') {
        setPlaySpeed(2);
      } else if (e.key === '3') {
        setPlaySpeed(5);
      } else if (e.key === '4') {
        setPlaySpeed(10);
      } else if (e.key === '5') {
        setPlaySpeed(25);
      } else if (e.key === '6') {
        setPlaySpeed(50);
      } else if (e.key === '7') {
        setPlaySpeed(100);
      } else if (e.key === '8') {
        setPlaySpeed(1000);
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

    // Determine batching and tick frequency for smooth, lag-free execution across 1x-1000x speeds
    let intervalMs = 2000;
    let seasonsPerTick = 1;

    if (playSpeed === 2) {
      intervalMs = 1000;
      seasonsPerTick = 1;
    } else if (playSpeed === 5) {
      intervalMs = 400;
      seasonsPerTick = 1;
    } else if (playSpeed === 10) {
      intervalMs = 200;
      seasonsPerTick = 1;
    } else if (playSpeed === 25) {
      intervalMs = 120;
      seasonsPerTick = 3;
    } else if (playSpeed === 50) {
      intervalMs = 100;
      seasonsPerTick = 5;
    } else if (playSpeed === 100) {
      intervalMs = 80;
      seasonsPerTick = 8;
    } else if (playSpeed === 1000) {
      intervalMs = 50;
      seasonsPerTick = 50;
    }

    const timer = setInterval(() => {
      setCivState((prev) => {
        let current = prev;
        let lastReport: any = null;
        for (let s = 0; s < seasonsPerTick; s++) {
          const { state: nextState, reportGenerated } = simulateSeason(current);
          current = nextState;
          if (reportGenerated) {
            lastReport = reportGenerated;
          }
          if (current.people.filter((p) => p.alive).length === 0) {
            setIsPlaying(false);
            break;
          }
        }
        if (lastReport) {
          setAnnualNotification(`Solar cycle ${lastReport.year} complete! Forensic Annual Report compiled.`);
        }
        return current;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  // Handler to advance 1 season
  const handleStepSeason = () => {
    setCivState((prev) => {
      const { state: nextState, reportGenerated } = simulateSeason(prev);
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
        if (currentState.people.filter((p) => p.alive).length === 0) break;
      }
      if (lastReport) {
        setAnnualNotification(`Decade epoch concluded! Reached Solar Cycle Year ${lastReport.year} (Active Cohort: ${currentState.people.filter(p => p.alive).length}).`);
      }
      return currentState;
    });
  };

  // Handler to advance 1 full century (100 solar cycles / 400 seasons)
  const handleStepCentury = () => {
    setCivState((prev) => {
      let currentState = prev;
      let lastReport: any = null;
      for (let y = 0; y < 100; y++) {
        const { state: nextState, report } = simulateYear(currentState);
        currentState = nextState;
        lastReport = report;
        if (currentState.people.filter((p) => p.alive).length === 0) break;
      }
      if (lastReport) {
        setAnnualNotification(`Century epoch concluded! Reached Solar Cycle Year ${lastReport.year} (Active Cohort: ${currentState.people.filter(p => p.alive).length}).`);
      }
      return currentState;
    });
  };

  // Handler to set National Focus
  const handleUpdateNationalFocus = (focus: any) => {
    setCivState((prev) => ({
      ...prev,
      nationalFocus: focus,
    }));
  };

  // Handler to generate a fresh seeded world
  const handleNewSeed = (seed: number) => {
    setIsPlaying(false);
    localStorage.setItem(SEED_KEY, seed.toString());
    initializeRNG(seed);
    const fresh = createInitialCivilization(getRNG());
    setCivState(fresh);
    setAnnualNotification(`World seeded with Seed #${seed}. A new autonomous civilization rises.`);
    setShowExtinctionModal(false);
  };

  // Handler to reset simulation
  const handleReset = () => {
    if (window.confirm('Re-initialize simulation cohort to Year 0 with 100 autonomous humans? All empirical observations will be reset.')) {
      setIsPlaying(false);
      const fresh = createInitialCivilization(getRNG());
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
        onStepCentury={handleStepCentury}
        onReset={handleReset}
        onUpdateNationalFocus={handleUpdateNationalFocus}
        onNewSeed={handleNewSeed}
        onOpenLatestReport={() => setActiveTab('reports')}
      />

      {/* Real-time Global Vitals Telemetry HUD */}
      <GlobalVitalsHUD
        state={civState}
        onOpenLedger={() => setActiveTab('reports')}
        onOpenRoster={() => setActiveTab('roster')}
      />

      {/* Extinction Alert Banner if cohort collapsed */}
      {isExtinct && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-3 text-center text-rose-200 text-sm animate-pulse flex items-center justify-center gap-3 shadow-lg">
          <span className="font-bold">☠️ DEMOGRAPHIC EXTINCTION EVENT:</span>
          <span>All cohort members have perished from physiological or environmental collapse. Simulation run concluded.</span>
          <button
            onClick={() => setShowExtinctionModal(true)}
            className="underline font-bold text-rose-300 hover:text-white cursor-pointer"
          >
            Examine Forensic Mortality Etiology
          </button>
        </div>
      )}

      {/* Annual Notification Toast */}
      {annualNotification && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2 text-center text-amber-200 text-xs flex items-center justify-center gap-3 shadow-sm">
          <span>{annualNotification}</span>
          <button
            onClick={() => {
              setActiveTab('reports');
              setAnnualNotification(null);
            }}
            className="underline hover:text-amber-100 font-semibold cursor-pointer"
          >
            View Ledger
          </button>
          <button onClick={() => setAnnualNotification(null)} className="text-amber-400 hover:text-amber-100 ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <nav role="tablist" aria-label="Civilization Dashboard Tabs" className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
          <button
            id="tab-overview"
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="panel-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            Telemetry & Overview
          </button>

          <button
            id="tab-roster"
            role="tab"
            aria-selected={activeTab === 'roster'}
            aria-controls="panel-roster"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Census <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-stone-950 text-stone-300 border border-stone-800">{livingCount}</span>
          </button>

          <button
            id="tab-labor"
            role="tab"
            aria-selected={activeTab === 'labor'}
            aria-controls="panel-labor"
            onClick={() => setActiveTab('labor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'labor'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-orange-400" />
            Division of Labor
          </button>

          <button
            id="tab-resources"
            role="tab"
            aria-selected={activeTab === 'resources'}
            aria-controls="panel-resources"
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            Stockpiles
          </button>

          <button
            id="tab-geography"
            role="tab"
            aria-selected={activeTab === 'geography'}
            aria-controls="panel-geography"
            onClick={() => setActiveTab('geography')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'geography'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-emerald-400" />
            Territory & Biomes
          </button>

          <button
            id="tab-tech-lore"
            role="tab"
            aria-selected={activeTab === 'tech_lore'}
            aria-controls="panel-tech_lore"
            onClick={() => setActiveTab('tech_lore')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tech_lore'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            Tech & Lore <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-stone-950 text-stone-300 border border-stone-800">{civState.technologies.filter(t => t.discovered).length}/9</span>
          </button>

          <button
            id="tab-reports"
            role="tab"
            aria-selected={activeTab === 'reports'}
            aria-controls="panel-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Ledger ({civState.annualReports.length})
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
