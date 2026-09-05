import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Heart,
  Utensils,
  Droplet,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { CivilizationState, Person, RoleType } from '../types';

interface FullRosterViewProps {
  state: CivilizationState;
  onInspectPerson: (personId: string) => void;
}

export const FullRosterView: React.FC<FullRosterViewProps> = ({ state, onInspectPerson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'living' | 'deceased' | 'sick'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredPeople = state.people.filter((p) => {
    // Search
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter === 'living' && !p.alive) return false;
    if (statusFilter === 'deceased' && p.alive) return false;
    if (statusFilter === 'sick' && (!p.alive || (p.diseases.length === 0 && p.injuries.length === 0 && p.health >= 60))) {
      return false;
    }

    // Role filter
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;

    return true;
  });

  const livingCount = state.people.filter((p) => p.alive).length;
  const deadCount = state.people.length - livingCount;

  return (
    <div id="full-roster-view" className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Clan Member Census (100 Humans at Year 0)
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Every individual has distinct physical needs, relationships, and skillset. Death is permanent.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-stone-950 px-3.5 py-1.5 rounded-lg border border-stone-800">
            <span className="text-emerald-400 font-bold">{livingCount} Living</span>
            <span className="text-stone-600">|</span>
            <span className="text-red-400 font-bold">{deadCount} Fallen</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-stone-200 placeholder-stone-600 focus:outline-hidden focus:border-amber-600"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800">
            {(['all', 'living', 'deceased', 'sick'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  statusFilter === st ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-300 focus:outline-hidden focus:border-amber-600"
          >
            <option value="all">All Roles</option>
            <option value="hunter">Hunters</option>
            <option value="forager">Foragers</option>
            <option value="farmer">Farmers</option>
            <option value="water_fetcher">Water Fetchers</option>
            <option value="lumberjack">Lumberjacks</option>
            <option value="stonecutter">Stonecutters</option>
            <option value="builder">Builders</option>
            <option value="herbalist">Herbalists</option>
            <option value="toolmaker">Toolmakers</option>
            <option value="scout">Scouts</option>
            <option value="elder_lorekeeper">Lorekeepers</option>
            <option value="idle_child">Children</option>
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredPeople.map((person) => {
          const isAiling = person.alive && (person.health < 50 || person.hunger > 60 || person.diseases.length > 0);

          return (
            <div
              key={person.id}
              onClick={() => onInspectPerson(person.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${
                !person.alive
                  ? 'bg-stone-950/60 border-stone-800/80 text-stone-500 opacity-60'
                  : isAiling
                  ? 'bg-red-950/20 border-red-900/60 hover:border-red-600 text-stone-200'
                  : 'bg-stone-900/90 border-stone-800 hover:border-amber-600/70 text-stone-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{person.gender === 'female' ? '👩' : '👨'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-100 truncate max-w-[130px]">{person.name}</h4>
                      <span className="text-[10px] text-stone-400 capitalize">
                        {person.role.replace('_', ' ')} • {person.age}y
                      </span>
                    </div>
                  </div>

                  {!person.alive ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                      Fallen
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        person.health >= 70
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : 'text-amber-400 bg-amber-950/60'
                      }`}
                    >
                      {Math.round(person.health)}% HP
                    </span>
                  )}
                </div>

                {/* Quick Vitals Indicators */}
                {person.alive ? (
                  <div className="grid grid-cols-4 gap-1 text-[10px] my-2 bg-stone-950 p-1.5 rounded border border-stone-800">
                    <div className="flex flex-col items-center">
                      <span className="text-stone-500 flex items-center gap-0.5">
                        <Utensils className="w-2.5 h-2.5" /> Hng
                      </span>
                      <span className={`font-mono ${person.hunger > 60 ? 'text-red-400 font-bold' : 'text-stone-300'}`}>
                        {Math.round(person.hunger)}%
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-stone-500 flex items-center gap-0.5">
                        <Droplet className="w-2.5 h-2.5" /> Thr
                      </span>
                      <span className={`font-mono ${person.thirst > 60 ? 'text-red-400 font-bold' : 'text-stone-300'}`}>
                        {Math.round(person.thirst)}%
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-stone-500 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Wrm
                      </span>
                      <span className={`font-mono ${person.warmth < 35 ? 'text-blue-400 font-bold' : 'text-stone-300'}`}>
                        {Math.round(person.warmth)}%
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-stone-500 flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> Mor
                      </span>
                      <span className="font-mono text-stone-300">{Math.round(person.mentalState)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="my-2 p-1.5 bg-stone-950 rounded border border-stone-800 text-[10px] text-stone-400 italic">
                    Died Year {person.deathYear}: {person.causeOfDeath || 'Unknown'}
                  </div>
                )}

                {/* Active Diseases or Injuries */}
                {person.alive && (person.diseases.length > 0 || person.injuries.length > 0) && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1 truncate">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{person.diseases[0] || person.injuries[0]}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-amber-400/80 font-medium text-right mt-1">
                Click to inspect 13 vitals →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
