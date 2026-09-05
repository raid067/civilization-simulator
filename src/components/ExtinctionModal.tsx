import React from 'react';
import { Skull, AlertTriangle, RotateCcw, Award, BookOpen, Users, Droplets, Utensils, Thermometer, ShieldAlert } from 'lucide-react';
import { CivilizationState } from '../types';

interface ExtinctionModalProps {
  state: CivilizationState;
  onReset: () => void;
  onClose: () => void;
}

export const ExtinctionModal: React.FC<ExtinctionModalProps> = ({ state, onReset, onClose }) => {
  const deadPeople = state.people.filter((p) => !p.alive);
  const totalGenerations = Math.floor(state.year / 25) + 1;

  const deathCauses: Record<string, number> = {
    starvation: 0,
    dehydration: 0,
    hypothermia: 0,
    infection: 0,
    illness: 0,
    trauma: 0,
    old_age: 0,
    unknown: 0,
  };

  deadPeople.forEach((p) => {
    const cause = (p.causeOfDeath || 'unknown').toLowerCase();
    if (cause.includes('starv') || cause.includes('hunger') || cause.includes('food')) {
      deathCauses.starvation++;
    } else if (cause.includes('thirst') || cause.includes('dehydrat') || cause.includes('water')) {
      deathCauses.dehydration++;
    } else if (cause.includes('cold') || cause.includes('hypotherm') || cause.includes('freez') || cause.includes('winter')) {
      deathCauses.hypothermia++;
    } else if (cause.includes('infect') || cause.includes('wound') || cause.includes('sepsis')) {
      deathCauses.infection++;
    } else if (cause.includes('ill') || cause.includes('diseas') || cause.includes('fever')) {
      deathCauses.illness++;
    } else if (cause.includes('trauma') || cause.includes('injur') || cause.includes('predat') || cause.includes('attack')) {
      deathCauses.trauma++;
    } else if (p.age >= 60 || cause.includes('age') || cause.includes('natural')) {
      deathCauses.old_age++;
    } else {
      deathCauses.unknown++;
    }
  });

  const researchedTechs = state.technologies.filter((t) => t.researched);
  const preservedCount = state.technologies.filter((t) => t.loreOralTraditionCount > 0).length;

  return (
    <div
      id="extinction-postmortem-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extinction-title"
    >
      <div
        id="extinction-postmortem-card"
        className="bg-stone-900 border-2 border-red-900/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-4 border-b border-stone-800 pb-5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
            <Skull className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/80 font-bold uppercase tracking-wider">
                Terminal Demographic Collapse • Run Terminated
              </span>
            </div>
            <h2 id="extinction-title" className="text-2xl font-bold text-stone-100 mt-1">
              Demographic Extinction & Ecological Run Failure
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              The simulated population endured for <span className="text-amber-400 font-bold">{state.year} years</span> and{' '}
              <span className="text-amber-400 font-bold">{state.season}</span> across {totalGenerations} generation(s) before terminal collapse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              Terminal Census
            </div>
            <div className="text-xl font-bold font-mono text-red-400">0 / {state.people.length}</div>
            <div className="text-[10px] text-stone-500">100% deceased</div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Run Duration
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">{state.year}y</div>
            <div className="text-[10px] text-stone-500">Final season: {state.season}</div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              Tech Preserved
            </div>
            <div className="text-xl font-bold font-mono text-purple-300">
              {preservedCount} / {state.technologies.length}
            </div>
            <div className="text-[10px] text-stone-500">{researchedTechs.length} discovered</div>
          </div>
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              Annual Ledgers
            </div>
            <div className="text-xl font-bold font-mono text-orange-300">
              {state.annualReports.length}
            </div>
            <div className="text-[10px] text-stone-500">Section 30 archives</div>
          </div>
        </div>

        <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Forensic Mortality Etiology & Collapse Root Causes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Utensils className="w-3 h-3 text-amber-400" /> Starvation Deficit
              </span>
              <span className="font-mono font-bold text-red-400">{deathCauses.starvation}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Droplets className="w-3 h-3 text-cyan-400" /> Dehydration Deficit
              </span>
              <span className="font-mono font-bold text-red-400">{deathCauses.dehydration}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Thermometer className="w-3 h-3 text-blue-400" /> Thermal Hypothermia
              </span>
              <span className="font-mono font-bold text-red-400">{deathCauses.hypothermia}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Skull className="w-3 h-3 text-pink-400" /> Infection / Pathogen
              </span>
              <span className="font-mono font-bold text-red-400">{deathCauses.infection + deathCauses.illness}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <ShieldAlert className="w-3 h-3 text-orange-400" /> Physical Trauma
              </span>
              <span className="font-mono font-bold text-red-400">{deathCauses.trauma}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Award className="w-3 h-3 text-emerald-400" /> Natural Senescence
              </span>
              <span className="font-mono font-bold text-emerald-400">{deathCauses.old_age}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            id="btn-extinction-cemetery"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Examine Forensic Census Records
          </button>
          <button
            id="btn-extinction-restart"
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-900/30"
          >
            <RotateCcw className="w-4 h-4" />
            Initialize New Simulation Run
          </button>
        </div>
      </div>
    </div>
  );
};
