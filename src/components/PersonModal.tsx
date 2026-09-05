import React from 'react';
import {
  X,
  Heart,
  Droplet,
  Utensils,
  Moon,
  Thermometer,
  Brain,
  Shield,
  Home,
  Shirt,
  Flame,
  Activity,
  AlertCircle,
  Award,
  Users,
} from 'lucide-react';
import { Person } from '../types';

interface PersonModalProps {
  person: Person | null;
  allPeople?: Person[];
  onClose: () => void;
  onSelectPerson?: (id: string) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({ person, allPeople = [], onClose, onSelectPerson }) => {
  if (!person) return null;

  const getNeedColor = (value: number, inverse = false) => {
    // Normal: higher is better (e.g. Health, Warmth, Safety)
    // Inverse: higher is worse (e.g. Hunger, Thirst, Fatigue)
    const effective = inverse ? 100 - value : value;
    if (effective >= 70) return 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/60';
    if (effective >= 40) return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60';
    return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60';
  };

  return (
    <div
      id="person-inspector-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="person-inspector-card"
        className="bg-stone-900 border border-stone-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border ${
                person.alive
                  ? 'bg-amber-600/20 text-amber-300 border-amber-600/40'
                  : 'bg-stone-800 text-stone-500 border-stone-700'
              }`}
            >
              {person.gender === 'female' ? '👩' : '👨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-stone-100">{person.name}</h3>
                {!person.alive ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                    Deceased (Year {person.deathYear}, {person.deathSeason})
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Living • {person.age} years old
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 capitalize mt-0.5">
                Role: <span className="text-amber-300 font-medium">{person.role.replace('_', ' ')}</span> • Gender:{' '}
                <span className="text-stone-300">{person.gender}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-person-modal"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cause of death banner if deceased */}
        {!person.alive && person.causeOfDeath && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-300">Cause of Death: {person.causeOfDeath}</div>
              <p className="text-xs text-red-200/70 mt-0.5">
                Death is permanent in human civilization. Their accumulated experience and clan relationships are permanently lost.
              </p>
            </div>
          </div>
        )}

        {/* 13 Physical Survival Needs Grid (Section 1) */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            Section 1 • Physical Survival Needs (13 Vitals)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Health */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Heart className="w-3.5 h-3.5 text-red-400" /> Health
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.health)}`}>
                {Math.round(person.health)}%
              </span>
            </div>

            {/* Hunger */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Hunger
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.hunger, true)}`}>
                {Math.round(person.hunger)}%
              </span>
            </div>

            {/* Thirst */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Thirst
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.thirst, true)}`}>
                {Math.round(person.thirst)}%
              </span>
            </div>

            {/* Fatigue */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Moon className="w-3.5 h-3.5 text-purple-400" /> Fatigue
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.fatigue, true)}`}>
                {Math.round(person.fatigue)}%
              </span>
            </div>

            {/* Temperature */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Body Temp
              </span>
              <span className="font-mono font-bold px-1.5 py-0.5 rounded text-amber-300 bg-amber-950/40">
                {person.temperature.toFixed(1)}°C
              </span>
            </div>

            {/* Mental State */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Brain className="w-3.5 h-3.5 text-pink-400" /> Mental State
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.mentalState)}`}>
                {Math.round(person.mentalState)}%
              </span>
            </div>

            {/* Warmth */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Warmth
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.warmth)}`}>
                {Math.round(person.warmth)}%
              </span>
            </div>

            {/* Safety */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Safety
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.safety)}`}>
                {Math.round(person.safety)}%
              </span>
            </div>

            {/* Nutrition */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Utensils className="w-3.5 h-3.5 text-green-400" /> Nutrition
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${getNeedColor(person.nutrition)}`}>
                {Math.round(person.nutrition)}%
              </span>
            </div>

            {/* Shelter */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Home className="w-3.5 h-3.5 text-amber-500" /> Shelter
              </span>
              <span className="font-mono font-semibold px-1.5 py-0.5 text-stone-200">
                {person.shelterQuality > 60 ? 'Thatched Hut' : 'Leaf Lean-to'}
              </span>
            </div>

            {/* Clothing */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <Shirt className="w-3.5 h-3.5 text-indigo-400" /> Clothing
              </span>
              <span className="font-mono font-semibold px-1.5 py-0.5 text-stone-200">
                {person.clothingQuality > 50 ? 'Animal Hide' : 'Foliage/Wrap'}
              </span>
            </div>

            {/* Diseases & Injuries */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-300">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Conditions
              </span>
              <span className="font-mono text-red-400 font-semibold">
                {person.diseases.length + person.injuries.length === 0
                  ? 'Healthy'
                  : `${person.diseases.length + person.injuries.length} Ailments`}
              </span>
            </div>
          </div>

          {(person.diseases.length > 0 || person.injuries.length > 0) && (
            <div className="mt-3 p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs space-y-1">
              {person.diseases.map((d, i) => (
                <div key={i} className="text-red-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Active Disease: <strong className="text-red-200">{d}</strong> (requires herbal care or bed rest)
                </div>
              ))}
              {person.injuries.map((inj, i) => (
                <div key={i} className="text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Physical Injury: <strong className="text-amber-200">{inj}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills & Knowledge */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Skills & Craft Proficiency
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.entries(person.skills).map(([skill, val]) => (
              <div key={skill} className="bg-stone-950 p-2 rounded border border-stone-800">
                <div className="text-stone-400 capitalize">{skill}</div>
                <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">{Math.round(val as number)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Family & Social Relations */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            Kinship Lineage & Family Bonds
          </h4>
          <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 text-xs text-stone-300 space-y-3">
            {/* Parents */}
            <div>
              <span className="text-stone-400 block mb-1">Parents:</span>
              {person.relationships.parentIds && person.relationships.parentIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {person.relationships.parentIds.map((pId) => {
                    const parent = allPeople.find((p) => p.id === pId);
                    return parent ? (
                      <button
                        key={pId}
                        onClick={() => onSelectPerson && onSelectPerson(pId)}
                        className="px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded text-amber-200 transition-colors flex items-center gap-1.5"
                      >
                        <span>{parent.gender === 'female' ? '👩' : '👨'}</span>
                        <span className="font-semibold">{parent.name}</span>
                        <span className="text-stone-400 text-[10px]">
                          ({parent.alive ? `${parent.age}y` : 'Deceased'})
                        </span>
                      </button>
                    ) : (
                      <span key={pId} className="text-stone-500 font-mono">{pId}</span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-stone-500 italic">Original Cohort Founder (Ancestral Elder)</span>
              )}
            </div>

            {/* Partner */}
            <div>
              <span className="text-stone-400 block mb-1">Partner / Spouse:</span>
              {person.relationships.partnerId ? (
                (() => {
                  const partner = allPeople.find((p) => p.id === person.relationships.partnerId);
                  return partner ? (
                    <button
                      onClick={() => onSelectPerson && onSelectPerson(partner.id)}
                      className="px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded text-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>{partner.gender === 'female' ? '👩' : '👨'}</span>
                      <span className="font-semibold">{partner.name}</span>
                      <span className="text-stone-400 text-[10px]">
                        ({partner.alive ? `${partner.age}y` : 'Deceased'})
                      </span>
                    </button>
                  ) : (
                    <span className="text-stone-500 font-mono">{person.relationships.partnerId}</span>
                  );
                })()
              ) : (
                <span className="text-stone-500 italic">Unpaired</span>
              )}
            </div>

            {/* Children */}
            <div>
              <span className="text-stone-400 block mb-1">Offspring ({person.relationships.childrenIds.length}):</span>
              {person.relationships.childrenIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {person.relationships.childrenIds.map((cId) => {
                    const child = allPeople.find((p) => p.id === cId);
                    return child ? (
                      <button
                        key={cId}
                        onClick={() => onSelectPerson && onSelectPerson(cId)}
                        className="px-2 py-0.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-stone-300 hover:text-amber-200 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <span>{child.gender === 'female' ? '👧' : '👦'}</span>
                        <span>{child.name}</span>
                        <span className="text-stone-500 text-[10px]">
                          ({child.alive ? `${child.age}y` : '†'})
                        </span>
                      </button>
                    ) : (
                      <span key={cId} className="text-stone-500 text-[10px] font-mono">{cId}</span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-stone-500 italic">No offspring recorded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
