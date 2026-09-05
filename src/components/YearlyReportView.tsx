import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Users,
  Utensils,
  Droplets,
  TreePine,
  Flame,
  Home,
  Activity,
  Coins,
  Globe,
  AlertTriangle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { ThreatLevel, YearlyResourceReport } from '../types';

interface YearlyReportViewProps {
  reports: YearlyResourceReport[];
  currentYear: number;
}

export const YearlyReportView: React.FC<YearlyReportViewProps> = ({ reports, currentYear }) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(reports.length - 1);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // If no reports have been generated yet (e.g. still in Year 0 Spring)
  if (reports.length === 0) {
    return (
      <div id="no-yearly-reports" className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center max-w-2xl mx-auto my-12">
        <FileText className="w-12 h-12 text-amber-500/60 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-100">Year 0 In Progress</h3>
        <p className="text-sm text-stone-400 mt-2 leading-relaxed">
          The clan has just begun its first year of survival. Advance through the four seasons (Spring, Summer, Autumn, Winter)
          or click <strong className="text-amber-300">+1 Year</strong> in the header to compile the first official
          <strong className="text-stone-200"> Section 30 Yearly Resource Report</strong>.
        </p>
      </div>
    );
  }

  const activeIndex = selectedYearIndex >= 0 && selectedYearIndex < reports.length ? selectedYearIndex : reports.length - 1;
  const report = reports[activeIndex];

  const handleRequestAiChronicle = async () => {
    try {
      setAiLoading(true);
      setAiError(null);

      const res = await fetch('/api/ai/chronicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'yearly_epic',
          report,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate AI chronicle');
      }

      // Update the report with the chronicle
      report.aiChronicle = data.data || {
        saga: data.chronicle,
        councilDeliberation: 'The clan elders discussed food preservation and the coming cold.',
        strategicAdvice: [data.recommendation || 'Protect dry grain stores.'],
      };
    } catch (err: any) {
      console.error('AI Chronicle Error:', err);
      setAiError(err.message || 'Error contacting AI engine');
    } finally {
      setAiLoading(false);
    }
  };

  const getThreatBadge = (threat: ThreatLevel) => {
    switch (threat) {
      case 'Safe':
        return <span className="px-3 py-1 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">🟢 Safe</span>;
      case 'Concern':
        return <span className="px-3 py-1 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800">🟡 Concern</span>;
      case 'Crisis':
        return <span className="px-3 py-1 rounded-full font-bold bg-orange-950 text-orange-300 border border-orange-800">🟠 Crisis</span>;
      case 'Catastrophic':
        return <span className="px-3 py-1 rounded-full font-bold bg-red-950 text-red-300 border border-red-800">🔴 Catastrophic</span>;
    }
  };

  return (
    <div id="yearly-report-view" className="space-y-6">
      {/* Year Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider mr-1">Archived Reports:</span>
          {reports.map((r, index) => (
            <button
              key={r.year}
              onClick={() => setSelectedYearIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeIndex === index
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              YEAR {r.year}
            </button>
          ))}
        </div>

        {/* AI Chronicle Generator Button */}
        <button
          id="btn-generate-ai-chronicle"
          onClick={handleRequestAiChronicle}
          disabled={aiLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-800 to-amber-700 hover:from-purple-700 hover:to-amber-600 text-stone-100 rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
        >
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
          {report.aiChronicle ? 'Regenerate AI Chronicle' : 'Consult AI Tribal Chronicler'}
        </button>
      </div>

      {aiError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300">
          {aiError}
        </div>
      )}

      {/* AI Historical Chronicle if available */}
      {report.aiChronicle && (
        <div className="bg-stone-900/95 border border-purple-900/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            AI Chronicler & Campfire Deliberation
          </div>
          <h3 className="text-base font-bold text-stone-100 mb-2">The Saga of Year {report.year}</h3>
          <p className="text-sm text-stone-300 leading-relaxed italic whitespace-pre-line mb-4 font-serif">
            "{report.aiChronicle.saga}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-stone-800/80 pt-3">
            <div>
              <span className="font-semibold text-amber-400">🔥 Elder Council Deliberation:</span>
              <p className="text-stone-300 mt-0.5">{report.aiChronicle.councilDeliberation}</p>
            </div>
            <div>
              <span className="font-semibold text-emerald-400">🛡️ Strategic Priorities for Next Year:</span>
              <ul className="list-disc list-inside text-stone-300 mt-0.5 space-y-0.5">
                {report.aiChronicle.strategicAdvice?.map((advice, i) => (
                  <li key={i}>{advice}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Official Section 30 Yearly Report Layout */}
      <div id="section-30-report-card" className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-md text-stone-200 space-y-6">
        {/* Report Banner */}
        <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs text-amber-400 font-mono font-semibold uppercase tracking-wider">
              Section 30 • Annual Civilizational Ledger
            </span>
            <h2 className="text-2xl font-extrabold text-stone-100 mt-0.5">YEAR {report.year} RESOURCE REPORT</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">Annual Threat Level:</span>
            {getThreatBadge(report.threatLevel)}
          </div>
        </div>

        {/* 9 Category Grids adhering to Section 30 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* 1. Population */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Users className="w-4 h-4 text-amber-400" />
              <span>👥 Population</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Population:</span>
                <span className="font-mono font-bold text-stone-100">{report.population.current} souls</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Births:</span>
                <span className="font-mono text-emerald-400">+{report.population.births}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Deaths:</span>
                <span className="font-mono text-red-400">-{report.population.deaths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Migration:</span>
                <span className="font-mono text-stone-300">{report.population.migration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Life Expectancy:</span>
                <span className="font-mono text-stone-100">{report.population.lifeExpectancy} years</span>
              </div>
            </div>
          </div>

          {/* 2. Food */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>🍖 Food</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Production:</span>
                <span className="font-mono text-emerald-400">+{report.food.productionKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Consumption:</span>
                <span className="font-mono text-red-400">-{report.food.consumptionKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Storage:</span>
                <span className="font-mono font-bold text-stone-100">{report.food.storageKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Surplus / Deficit:</span>
                <span
                  className={`font-mono font-bold ${
                    report.food.surplusDeficitKg >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {report.food.surplusDeficitKg >= 0 ? `+${report.food.surplusDeficitKg.toLocaleString()}` : report.food.surplusDeficitKg.toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>

          {/* 3. Water */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>💧 Water</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Supply:</span>
                <span className="font-mono text-cyan-300">+{report.water.supplyL.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Consumption:</span>
                <span className="font-mono text-stone-300">-{report.water.consumptionL.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Quality:</span>
                <span className="font-mono text-emerald-400 font-bold">{report.water.qualityPercent}% Purity</span>
              </div>
            </div>
          </div>

          {/* 4. Materials */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span>🌲 Materials</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Wood:</span>
                <span className="font-mono text-stone-100">{report.materials.wood.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Stone:</span>
                <span className="font-mono text-stone-100">{report.materials.stone.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Metals / Ores:</span>
                <span className="font-mono text-amber-300">{report.materials.metals} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Other (Bone, Fiber, Clay):</span>
                <span className="font-mono text-stone-300">{report.materials.otherResources} units</span>
              </div>
            </div>
          </div>

          {/* 5. Energy */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>⚡ Energy</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Production:</span>
                <span className="font-mono text-emerald-400">+{report.energy.productionFuel} fuel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Consumption:</span>
                <span className="font-mono text-red-400">-{report.energy.consumptionFuel} fuel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Main Energy Sources:</span>
                <span className="text-amber-200 text-right">{report.energy.mainEnergySources}</span>
              </div>
            </div>
          </div>

          {/* 6. Infrastructure */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Home className="w-4 h-4 text-amber-500" />
              <span>🏠 Infrastructure</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Homes / Shelters:</span>
                <span className="font-mono text-stone-100">{report.infrastructure.homes} huts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Farms:</span>
                <span className="font-mono text-stone-100">{report.infrastructure.farmsHectares} ha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Trails & Paths:</span>
                <span className="font-mono text-stone-100">{report.infrastructure.roadsKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Workshops:</span>
                <span className="font-mono text-stone-100">{report.infrastructure.workshops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Storage Capacity:</span>
                <span className="font-mono text-stone-100">{report.infrastructure.storageCapacityKg.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* 7. Health */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Activity className="w-4 h-4 text-red-400" />
              <span>🦠 Health</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Disease Rate:</span>
                <span className="font-mono text-stone-200">{report.health.diseaseRatePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Injuries:</span>
                <span className="font-mono text-stone-200">{report.health.injuriesActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Healthcare:</span>
                <span className="text-amber-300">{report.health.healthcareRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Mortality:</span>
                <span className="font-mono text-red-400">{report.health.mortalityRatePercent}%</span>
              </div>
            </div>
          </div>

          {/* 8. Economy */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>💰 Economy</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Production Output:</span>
                <span className="font-mono text-stone-100">{report.economy.productionUnits.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Trade:</span>
                <span className="font-mono text-stone-300">Internal Barter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Price Index:</span>
                <span className="font-mono text-stone-300">{report.economy.barterValueIndex} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Wealth:</span>
                <span className="font-mono text-stone-100">{report.economy.wealthScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Employment:</span>
                <span className="font-mono text-emerald-400">{report.economy.employmentPercent}%</span>
              </div>
            </div>
          </div>

          {/* 9. Environment */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-stone-100 font-bold mb-3 pb-2 border-b border-stone-800">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>🌍 Environment</span>
            </div>
            <div className="space-y-1.5 text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Forest Coverage:</span>
                <span className="font-mono text-emerald-400">{report.environment.forestCoveragePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Soil Quality:</span>
                <span className="font-mono text-stone-200">{report.environment.soilQualityPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Wildlife Abundance:</span>
                <span className="font-mono text-stone-200">{report.environment.wildlifeAbundancePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Pollution:</span>
                <span className="font-mono text-stone-400">{report.environment.pollutionLevelPercent}% (Clean)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
