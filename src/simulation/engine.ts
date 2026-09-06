import {
  CivilizationState,
  CrisisEvent,
  Person,
  ResourceId,
  RoleType,
  Season,
  ThreatLevel,
  YearlyResourceReport,
} from '../types';
import { SeededRandom } from './utils/Random';
import { SimulationContext, createSimulationContext, DEFAULT_CONFIG } from './context';
import { runAutonomySystem } from './systems/autonomy';

const SEASONS_ORDER: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

/**
 * Global RNG instance for simulation determinism
 * Initialized when the world is created with a seed
 */
let globalRng: SeededRandom | null = null;

/**
 * Initialize the global RNG with a seed
 * Must be called before any simulation steps
 */
export function initializeRNG(seed: number): void {
  globalRng = new SeededRandom(seed);
}

/**
 * Get the global RNG instance
 * Throws if not initialized
 */
export function getRNG(): SeededRandom {
  if (!globalRng) {
    throw new Error('RNG not initialized. Call initializeRNG() first.');
  }
  return globalRng;
}

/**
 * Create a simulation context for the current state
 */
function createContext(state: CivilizationState): SimulationContext {
  if (!globalRng) {
    // Auto-initialize with a default seed if not set
    globalRng = new SeededRandom(12345);
  }
  return createSimulationContext(state, globalRng.getSeed(), DEFAULT_CONFIG);
}

export function advanceSimulationSeason(prevState: CivilizationState): CivilizationState {
  const context = createContext(prevState);
  const state = prevState; // Work directly on state to avoid JSON cloning
  
  const currentSeason = state.season;
  const currentYear = state.year;
  const isEndOfYear = currentSeason === 'Winter';
  
  // 1. Weather & Environmental Dynamics for the new season
  simulateSeasonalWeather(state, context.rng);
  
  // 2. Resource Regeneration in Nature
  simulateEcosystemRegeneration(state, context.rng);

  // 2b. Autonomous Decision Loop (Needs -> Problems -> Priorities -> Labor, Construction & Policies)
  runAutonomySystem(context);
  
  // 3. Labor & Production Phase
  const productionThisSeason = simulateProduction(state, context.rng);
  
  // 4. Consumption & Individual Survival Needs Phase
  const consumptionThisSeason = simulateIndividualNeedsAndConsumption(state, context.rng);
  
  // 5. Spoilage and Storage Degradation
  simulateSpoilageAndStorage(state);
  
  // 6. Disease, Injuries, and Healthcare
  simulateHealthAndMedicine(state, context.rng);
  
  // 7. Generational Knowledge & Tech Research
  simulateGenerationalKnowledge(state);
  
  // 8. Exploration & Scouting
  simulateExploration(state, context.rng);
  
  // 9. Crisis Detection & Cascades
  simulateCrisesAndCascades(state);

  // Accumulate annual figures
  state.accumulatedAnnualProduction.foodKg += productionThisSeason.foodKg;
  state.accumulatedAnnualProduction.waterL += productionThisSeason.waterL;
  state.accumulatedAnnualProduction.woodUnits += productionThisSeason.woodUnits;
  state.accumulatedAnnualProduction.stoneUnits += productionThisSeason.stoneUnits;
  state.accumulatedAnnualProduction.fuelUnits += productionThisSeason.fuelUnits;

  state.accumulatedAnnualConsumption.foodKg += consumptionThisSeason.foodKg;
  state.accumulatedAnnualConsumption.waterL += consumptionThisSeason.waterL;
  state.accumulatedAnnualConsumption.fuelUnits += consumptionThisSeason.fuelUnits;

  // 10. End-of-Year Processing (if completed Winter)
  if (isEndOfYear) {
    const report = generateYearlyReport(state);
    state.annualReports.push(report);

    // Preserve last year's demographic totals for HUD velocity tracking
    state.lastYearBirths = state.annualBirths;
    state.lastYearDeaths = state.annualDeaths;
    state.lastYearImmigration = state.annualImmigration || 0;

    // Reset annual counters
    state.accumulatedAnnualProduction = { foodKg: 0, waterL: 0, woodUnits: 0, stoneUnits: 0, fuelUnits: 0 };
    state.accumulatedAnnualConsumption = { foodKg: 0, waterL: 0, fuelUnits: 0 };
    state.annualBirths = 0;
    state.annualDeaths = 0;
    state.annualImmigration = 0;

    // Age all living people by 1 year and graduate adolescents to productive workforce
    for (const person of state.people) {
      if (person.alive) {
        person.age += 1;

        // Adolescent graduation: children reaching age 10 transition into active workforce
        if (person.role === 'idle_child' && person.age >= 10) {
          if (person.skills.hunting > 25) {
            person.role = 'hunter';
          } else if ((person.skills.fishing || 0) > 25) {
            person.role = 'fisherman';
          } else if (person.skills.woodcraft > 25) {
            person.role = 'lumberjack';
          } else {
            person.role = 'forager';
          }
        }

        // Elders reaching age 55+ with declining stamina transition to lorekeepers to safeguard oral knowledge
        if (person.age >= 55 && person.role !== 'elder_lorekeeper' && person.skills.lore >= 30) {
          const currentKeepers = state.people.filter((p) => p.alive && p.role === 'elder_lorekeeper').length;
          if (currentKeepers < 4) {
            person.role = 'elder_lorekeeper';
          }
        }
      }
    }

    state.year += 1;
    state.season = 'Spring';
    state.dayOfYear = 1;
  } else {
    // Advance to next season
    const nextSeasonIndex = (SEASONS_ORDER.indexOf(currentSeason) + 1) % 4;
    state.season = SEASONS_ORDER[nextSeasonIndex];
    state.dayOfYear += 90;
  }

  return state;
}

export function simulateSeason(prevState: CivilizationState): { state: CivilizationState; reportGenerated?: YearlyResourceReport } {
  const previousReportCount = prevState.annualReports.length;
  const nextState = advanceSimulationSeason(prevState);
  const reportGenerated = nextState.annualReports.length > previousReportCount ? nextState.annualReports[nextState.annualReports.length - 1] : undefined;
  return { state: nextState, reportGenerated };
}

export function simulateYear(prevState: CivilizationState): { state: CivilizationState; report: YearlyResourceReport } {
  let currentState = prevState;
  let report: YearlyResourceReport | undefined;

  // Run through seasons until a report is produced (up to 4 seasons)
  for (let i = 0; i < 4; i++) {
    const res = simulateSeason(currentState);
    currentState = res.state;
    if (res.reportGenerated) {
      report = res.reportGenerated;
      break;
    }
  }

  // Fallback in case report wasn't generated
  if (!report) {
    report = currentState.annualReports[currentState.annualReports.length - 1] || generateYearlyReport(currentState);
  }

  return { state: currentState, report };
}

function simulateSeasonalWeather(state: CivilizationState, rng: SeededRandom) {
  const s = state.season;
  let baseTemp = 15;
  if (s === 'Spring') baseTemp = 14 + rng.integer(0, 5);
  if (s === 'Summer') baseTemp = 24 + rng.integer(0, 7);
  if (s === 'Autumn') baseTemp = 11 + rng.integer(0, 5);
  if (s === 'Winter') baseTemp = -4 + rng.integer(0, 6);

  const isDrought = s === 'Summer' && rng.chance(0.20);
  const isBlizzard = s === 'Winter' && baseTemp < -1 && rng.chance(0.25);
  const isStorm = (s === 'Spring' || s === 'Autumn') && rng.chance(0.22);
  const isRaining = !isDrought && !isBlizzard && rng.chance(0.35);

  state.weather = {
    currentTempC: baseTemp,
    isDrought,
    isBlizzard,
    isStorm,
    isRaining,
    forecastReliabilityPercent: 55 + rng.integer(0, 29),
  };
}

function simulateEcosystemRegeneration(state: CivilizationState, rng: SeededRandom) {
  const seasonMult = state.season === 'Spring' ? 1.4 : state.season === 'Summer' ? 1.2 : state.season === 'Autumn' ? 0.9 : 0.3;
  const droughtFactor = state.weather.isDrought ? 0.4 : 1.0;

  for (const key of Object.keys(state.resources) as ResourceId[]) {
    const res = state.resources[key];
    if (res.category === 'renewable' && res.regenerationRatePerYear > 0) {
      const seasonalRegen = (res.regenerationRatePerYear / 4) * seasonMult * droughtFactor;
      // Cap at reasonable ecosystem capacity
      res.worldReserve = Math.round(res.worldReserve + seasonalRegen);
    }
  }

  // Wildlife natural birth cycle in Spring/Summer
  const wildlife = state.resources.animals;
  if (state.season === 'Spring' || state.season === 'Summer') {
    const births = Math.round(wildlife.worldReserve * 0.08);
    wildlife.worldReserve = Math.min(2500, wildlife.worldReserve + births);
    wildlife.quantity = wildlife.worldReserve;
  }
}

function simulateProduction(state: CivilizationState, rng: SeededRandom) {
  const livingPeople = state.people.filter((p) => p.alive);
  const season = state.season;
  const weather = state.weather;

  let producedFoodKg = 0;
  let collectedWaterL = 0;
  let gatheredWood = 0;
  let quarriedStone = 0;
  let collectedFuel = 0;

  // Tech bonuses
  const hasFlintKnapping = state.technologies.find((t) => t.id === 'tech-flint')?.discovered;
  const hasBaskets = state.technologies.find((t) => t.id === 'tech-baskets')?.discovered;
  const hasAgriculture = state.technologies.find((t) => t.id === 'tech-agri')?.discovered;
  const hasCopper = state.technologies.find((t) => t.id === 'tech-copper')?.discovered;

  const toolEfficiency = (hasFlintKnapping ? 1.35 : 1.0) * (hasCopper ? 1.4 : 1.0);
  const carryEfficiency = hasBaskets ? 1.30 : 1.0;

  for (const person of livingPeople) {
    // Health and stamina efficiency factor
    const efficiency = Math.max(0.2, (person.health / 100) * (1 - person.fatigue / 200));

    if (person.age < 10) {
      if (person.age >= 6) {
        // Older children assist with light camp chores: gathering dry kindling and wild berries
        const kidFood = Math.round(35 * efficiency);
        const kidFuel = Math.round(18 * efficiency);
        state.resources.fruit.quantity += Math.round(kidFood * 0.6);
        state.resources.plants.quantity += Math.round(kidFood * 0.4);
        state.resources.fuel.quantity += kidFuel;
        producedFoodKg += kidFood;
        collectedFuel += kidFuel;
        person.skills.foraging = Math.min(40, person.skills.foraging + 0.3);
        person.skills.woodcraft = Math.min(40, person.skills.woodcraft + 0.3);
      }
      continue;
    }

    switch (person.role) {
      case 'forager': {
        const seasonFactor = state.resources.fruit.seasonality[season];
        const droughtPen = weather.isDrought ? 0.65 : 1.0;

        // Realistic wild gathering (berries, tubers, roots, nuts, wild greens): 220-380kg/season
        const baseForaged = (220 + person.skills.foraging * 2.2) * seasonFactor * droughtPen * carryEfficiency * efficiency;
        const foragedKg = Math.round(Math.max(45, baseForaged));
        const berryPart = Math.round(foragedKg * 0.45);
        const rootPart = Math.round(foragedKg * 0.35);
        const plantPart = foragedKg - berryPart - rootPart;

        state.resources.fruit.quantity += berryPart;
        state.resources.grains.quantity += rootPart;
        state.resources.plants.quantity += plantPart;
        producedFoodKg += foragedKg;

        person.skills.foraging = Math.min(100, person.skills.foraging + 0.5);
        break;
      }
      case 'hunter': {
        const gameReserve = state.resources.animals.worldReserve;
        if (gameReserve > 10) {
          const huntingSkill = person.skills.hunting;
          const successChance = Math.min(0.85, 0.40 + (huntingSkill / 100) * 0.35 + (hasFlintKnapping ? 0.15 : 0.05));
          const winterPenalty = season === 'Winter' ? 0.85 : 1.0;

          if (rng.chance(successChance * winterPenalty)) {
            // Large game bagged (deer, elk, wild boar): dense caloric protein, bones, hides
            const meatKg = Math.round((160 + huntingSkill * 1.8) * toolEfficiency * efficiency);
            state.resources.meat.quantity += meatKg;
            state.resources.bone.quantity += Math.round(meatKg * 0.15);
            state.resources.fibers.quantity += Math.round(meatKg * 0.1);
            state.resources.animals.worldReserve = Math.max(0, state.resources.animals.worldReserve - 2);
            state.resources.animals.quantity = state.resources.animals.worldReserve;
            producedFoodKg += meatKg;
          } else {
            // Small game trapping (hares, waterfowl, small burrowers)
            const smallMeatKg = Math.round((45 + huntingSkill * 0.6) * efficiency);
            state.resources.meat.quantity += smallMeatKg;
            producedFoodKg += smallMeatKg;

            if (rng.chance(0.04)) {
              person.injuries.push('Boar Tusk Gash');
              person.health = Math.max(15, person.health - 20);
            }
          }
          person.skills.hunting = Math.min(100, person.skills.hunting + 0.5);
        }
        break;
      }
      case 'fisherman': {
        // River fishing along the Red River: vital continuous protein
        const seasonFactor = state.resources.fish.seasonality[season];
        const droughtPen = weather.isDrought ? 0.70 : 1.0;
        const fishingSkill = person.skills.fishing || 25;
        const fishKg = Math.round((180 + fishingSkill * 2.0) * seasonFactor * droughtPen * carryEfficiency * efficiency);
        state.resources.fish.quantity += fishKg;
        producedFoodKg += fishKg;
        if (!person.skills.fishing) person.skills.fishing = 25;
        person.skills.fishing = Math.min(100, person.skills.fishing + 0.6);
        break;
      }
      case 'farmer': {
        if (hasAgriculture) {
          let farmYield = 0;
          if (season === 'Autumn') {
            const droughtPenalty = weather.isDrought ? 0.45 : 1.0;
            farmYield = Math.round((420 + person.skills.farming * 3.5) * droughtPenalty * toolEfficiency * efficiency);
            state.resources.grains.quantity += farmYield;
            producedFoodKg += farmYield;
          } else if (season === 'Spring') {
            // Planting season: consumes seeds from grains stockpile
            state.resources.grains.quantity = Math.max(0, state.resources.grains.quantity - 15);
          } else {
            // Summer weeding & early green harvest
            const summerYield = Math.round((90 + person.skills.farming * 1.2) * efficiency);
            state.resources.grains.quantity += summerYield;
            producedFoodKg += summerYield;
          }
          person.skills.farming = Math.min(100, person.skills.farming + 0.8);
        } else {
          // Primitive wild grain harvesting
          const wildYield = Math.round((110 + person.skills.farming * 1.2) * efficiency);
          state.resources.grains.quantity += wildYield;
          producedFoodKg += wildYield;
          person.skills.farming = Math.min(100, person.skills.farming + 0.3);
        }
        break;
      }
      case 'water_fetcher': {
        const baseWater = (weather.isDrought ? 2400 : 4200) * carryEfficiency * efficiency;
        const fetched = Math.round(baseWater);
        state.resources.fresh_water.quantity += fetched;
        collectedWaterL += fetched;
        break;
      }
      case 'lumberjack': {
        const cutWood = Math.round((150 + person.skills.woodcraft * 1.4) * toolEfficiency * efficiency);
        const cutFuel = Math.round((130 + person.skills.woodcraft * 1.2) * efficiency);
        state.resources.wood.quantity += cutWood;
        state.resources.fuel.quantity += cutFuel;
        state.resources.wood.worldReserve = Math.max(0, state.resources.wood.worldReserve - cutWood);
        gatheredWood += cutWood;
        collectedFuel += cutFuel;
        person.skills.woodcraft = Math.min(100, person.skills.woodcraft + 0.5);
        break;
      }
      case 'stonecutter': {
        const quarried = Math.round((140 + person.skills.stonecraft * 1.5) * toolEfficiency * efficiency);
        state.resources.stone.quantity += quarried;
        state.resources.stone.worldReserve = Math.max(0, state.resources.stone.worldReserve - quarried);
        quarriedStone += quarried;

        // Occasional ore nodule discovery
        if (rng.chance(0.2)) {
          state.resources.ores.quantity += 3;
        }
        person.skills.stonecraft = Math.min(100, person.skills.stonecraft + 0.5);
        break;
      }
      case 'builder': {
        // Builds or repairs settlement infrastructure
        if (state.resources.wood.quantity >= 30 && state.resources.stone.quantity >= 15) {
          state.resources.wood.quantity -= 30;
          state.resources.stone.quantity -= 15;
          if (state.infrastructure.leafHuts < 30) {
            state.infrastructure.leafHuts += 1;
          } else if (state.infrastructure.thatchedCabins < 10 && state.resources.timber.quantity >= 10) {
            state.resources.timber.quantity -= 10;
            state.infrastructure.thatchedCabins += 1;
          } else if (state.infrastructure.granaryBins < 8) {
            state.infrastructure.granaryBins += 1;
          } else if (state.infrastructure.waterCisterns < 8) {
            state.infrastructure.waterCisterns += 1;
          } else if (state.infrastructure.smokingRacks < 6) {
            state.infrastructure.smokingRacks += 1;
          }
        }
        break;
      }
      case 'herbalist': {
        const collectedPlants = Math.round((50 + person.skills.healing * 0.8) * efficiency);
        state.resources.plants.quantity += collectedPlants;
        person.skills.healing = Math.min(100, person.skills.healing + 0.6);
        break;
      }
      case 'toolmaker': {
        if (state.resources.stone.quantity >= 20 && state.resources.bone.quantity >= 5) {
          state.resources.stone.quantity -= 20;
          state.resources.bone.quantity -= 5;
          // Enhances tool efficiency across tribe
          person.skills.stonecraft = Math.min(100, person.skills.stonecraft + 0.7);
        }
        break;
      }
      case 'scout': {
        // Will be handled in exploration phase
        break;
      }
    }
  }

  return {
    foodKg: producedFoodKg,
    waterL: collectedWaterL,
    woodUnits: gatheredWood,
    stoneUnits: quarriedStone,
    fuelUnits: collectedFuel,
  };
}

function simulateIndividualNeedsAndConsumption(state: CivilizationState, rng: SeededRandom) {
  const livingPeople = state.people.filter((p) => p.alive);
  const season = state.season;
  const weather = state.weather;
  const rationing = state.policies.foodRationing;

  let totalConsumedFoodKg = 0;
  let totalConsumedWaterL = 0;
  let totalConsumedFuel = 0;

  // Calculate shelter capacity
  const shelterCapacity = (state.infrastructure.leafHuts || 0) * 4 + (state.infrastructure.thatchedCabins || 0) * 8;

  for (let personIndex = 0; personIndex < livingPeople.length; personIndex++) {
    const person = livingPeople[personIndex];
    const hasShelter = personIndex < shelterCapacity;
    // 1. Differentiated Caloric Food Need by Age & Rationing Policy
    let baseFoodNeed = 100; // Adult baseline: ~1.11 kg/day
    if (person.age <= 2) {
      baseFoodNeed = 30; // Infant/toddler
    } else if (person.age <= 9) {
      baseFoodNeed = 55; // Growing child
    } else if (person.age <= 15) {
      baseFoodNeed = 85; // Adolescent
    } else if (person.age >= 50) {
      baseFoodNeed = 88; // Elder
    }

    const rationingMult = rationing === 'Frugal' ? 0.80 : rationing === 'Generous' ? 1.25 : 1.0;
    const targetFood = Math.round(baseFoodNeed * rationingMult);

    let foodGiven = 0;
    // Consume from food sources in order: Berries/Fruit -> Meat -> Fish -> Grains -> Plants
    const foodSources: ResourceId[] = ['fruit', 'meat', 'fish', 'grains', 'plants'];
    for (const f of foodSources) {
      if (foodGiven >= targetFood) break;
      const needed = targetFood - foodGiven;
      const take = Math.min(needed, state.resources[f].quantity);
      state.resources[f].quantity -= take;
      foodGiven += take;
    }

    totalConsumedFoodKg += foodGiven;
    const foodDeficitRatio = foodGiven / Math.max(1, targetFood);

    if (foodDeficitRatio < 0.5) {
      // Severe Starvation
      person.hunger = Math.min(100, person.hunger + 30);
      person.health = Math.max(0, person.health - 22);
      person.mentalState = Math.max(0, person.mentalState - 25);
      person.nutrition = Math.max(10, person.nutrition - 20);
    } else if (foodDeficitRatio < 0.85) {
      // Malnourished
      person.hunger = Math.min(100, person.hunger + 12);
      person.health = Math.max(0, person.health - 6);
      person.mentalState = Math.max(0, person.mentalState - 8);
    } else {
      // Well nourished
      person.hunger = Math.max(0, person.hunger - 20);
      person.health = Math.min(100, person.health + 4);
      person.mentalState = Math.min(100, person.mentalState + 4);
    }

    // 2. Water Consumption
    let baseWaterNeed = person.age < 10 ? 120 : (weather.currentTempC > 25 ? 240 : 180);
    if (state.policies.waterConservation) baseWaterNeed = Math.round(baseWaterNeed * 0.75);
    const targetWater = baseWaterNeed;

    const waterAvailable = state.resources.fresh_water.quantity;
    const waterGiven = Math.min(targetWater, waterAvailable);
    state.resources.fresh_water.quantity -= waterGiven;
    totalConsumedWaterL += waterGiven;

    const waterRatio = waterGiven / Math.max(1, targetWater);
    if (waterRatio < 0.5) {
      person.thirst = Math.min(100, person.thirst + 40);
      person.health = Math.max(0, person.health - 30); // Acute dehydration
      person.mentalState = Math.max(0, person.mentalState - 30);
    } else if (waterRatio < 0.85) {
      person.thirst = Math.min(100, person.thirst + 15);
      person.health = Math.max(0, person.health - 8);
    } else {
      person.thirst = Math.max(0, person.thirst - 25);
    }

    // 3. Communal Hearth & Shelter Thermal Physics
    const isWinter = season === 'Winter';
    let baseFuelPerCapita = isWinter ? 10 : season === 'Autumn' ? 5 : season === 'Spring' ? 4 : 2;
    if (weather.isBlizzard) baseFuelPerCapita += 4;
    const shelterInsulation = hasShelter ? 0.75 : 1.0;
    const fuelMultiplier = state.policies.firewoodPriority === 'Maximum Warmth' ? 1.3 : state.policies.firewoodPriority === 'Minimum' ? 0.7 : 1.0;
    const targetFuel = Math.max(1, Math.round(baseFuelPerCapita * shelterInsulation * fuelMultiplier));

    const fuelAvailable = state.resources.fuel.quantity;
    const fuelGiven = Math.min(targetFuel, fuelAvailable);
    state.resources.fuel.quantity -= fuelGiven;
    totalConsumedFuel += fuelGiven;

    const fuelRatio = fuelGiven / Math.max(1, targetFuel);
    person.shelterQuality = hasShelter ? 80 : 30;
    const warmthScore = (fuelRatio * 55) + (person.shelterQuality * 0.25) + (season === 'Summer' ? 25 : season === 'Winter' ? -15 : 5);
    person.warmth = Math.max(0, Math.min(100, Math.round(warmthScore)));

    if (isWinter && person.warmth < 35) {
      // Hypothermia Danger
      person.health = Math.max(0, person.health - 22);
      if (!person.diseases.includes('Hypothermia')) {
        person.diseases.push('Hypothermia');
      }
      person.temperature = 35.2;
    } else {
      person.temperature = 37.0;
      person.diseases = person.diseases.filter((d) => d !== 'Hypothermia');
    }

    // 4. Fatigue Recovery
    person.fatigue = Math.max(0, person.fatigue - 20);

    // 5. Mortality Check (Acute Trauma, Dehydration, or Starvation)
    if (person.health <= 0 || person.hunger >= 95 || person.thirst >= 95) {
      person.alive = false;
      state.annualDeaths += 1;
      person.deathYear = state.year;
      person.deathSeason = state.season;

      if (person.thirst >= 90) {
        person.causeOfDeath = 'Acute Dehydration';
      } else if (person.hunger >= 90) {
        person.causeOfDeath = 'Starvation & Malnutrition';
      } else if (person.diseases.length > 0) {
        person.causeOfDeath = `Fatality from ${person.diseases[0]}`;
      } else if (person.warmth < 30 && isWinter) {
        person.causeOfDeath = 'Severe Hypothermia & Exposure';
      } else {
        person.causeOfDeath = 'Physical Exhaustion & Trauma';
      }

      // Generational knowledge loss if lorekeeper dies
      if (person.role === 'elder_lorekeeper') {
        for (const tech of state.technologies) {
          if (tech.discovered && tech.activeKeepersCount > 0) {
            tech.activeKeepersCount = Math.max(0, tech.activeKeepersCount - 1);
          }
        }
      }
    }

    // 5b. Natural Senescence Curve for Elders (Long-Term Anthropological Lifespan)
    if (person.alive && person.age >= 50) {
      // Annualized natural hazard evaluated seasonally (risk / 4)
      const ageHazard = person.age >= 70 ? 0.035 : person.age >= 60 ? 0.018 : 0.007;
      const vitalityBuffer = (person.health / 100) * (person.warmth / 100);
      const seasonalMortalityChance = ageHazard * Math.max(0.4, 1.6 - vitalityBuffer);

      if (rng.chance(seasonalMortalityChance)) {
        person.alive = false;
        state.annualDeaths += 1;
        person.deathYear = state.year;
        person.deathSeason = state.season;
        person.causeOfDeath = 'Natural Old Age Senescence';

        if (person.role === 'elder_lorekeeper') {
          for (const tech of state.technologies) {
            if (tech.discovered && tech.activeKeepersCount > 0) {
              tech.activeKeepersCount = Math.max(0, tech.activeKeepersCount - 1);
            }
          }
        }
      }
    }
  }

  // 6. Natural Births & Kinship Mating (Demographic Expansion & Equilibrium)
  // Evaluate reproduction across all 4 seasons with seasonal fertility curve
  const livingMales = livingPeople.filter((p) => p.gender === 'male' && p.age >= 16 && p.age <= 55 && p.alive && p.health >= 40);
  const fertileFemales = livingPeople.filter(
    (p) => p.gender === 'female' && p.age >= 16 && p.age <= 45 && p.alive && p.health >= 45 && p.hunger < 50
  );

  // Pair unpartnered adults efficiently (O(N))
  const unpartneredMales = livingMales.filter((m) => !m.relationships.partnerId);
  let maleIdx = 0;
  for (const female of fertileFemales) {
    if (!female.relationships.partnerId && maleIdx < unpartneredMales.length) {
      const eligiblePartner = unpartneredMales[maleIdx++];
      female.relationships.partnerId = eligiblePartner.id;
      eligiblePartner.relationships.partnerId = female.id;
    }
  }

  // Create fast ID lookup map for living people
  const livingPeopleMap = new Map<string, Person>();
  for (const p of livingPeople) {
    livingPeopleMap.set(p.id, p);
  }

  // Seasonal base conception chance:
  // Spring: 0.16 (peak vitality & thaw)
  // Summer: 0.14 (bountiful harvest)
  // Autumn: 0.12 (pre-winter preparation)
  // Winter: 0.08 (harsh cold)
  const seasonalFertility = season === 'Spring' ? 0.16 : season === 'Summer' ? 0.14 : season === 'Autumn' ? 0.12 : 0.08;

  // Food abundance factor: scales from 0.5x up to 2.0x when food reserves are vast
  const totalFoodKg =
    state.resources.fruit.quantity +
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.plants.quantity;

  const foodAbundanceFactor = Math.min(2.0, Math.max(0.5, totalFoodKg / Math.max(1, livingPeople.length * 60)));
  const shelterAdequacyFactor = livingPeople.length < shelterCapacity ? 1.25 : 0.75;
  const hasAgri = state.technologies.some((t) => t.id === 'tech-agri' && t.discovered);
  const agriBonus = hasAgri ? 1.3 : 1.0;

  // Regional carrying capacity: smooth Sigmoid/logistic dampening as population approaches density ceiling
  const maxDensity = 1000;
  const crowdingFactor =
    livingPeople.length >= maxDensity ? 0.02 :
    livingPeople.length > shelterCapacity * 1.5 ? 0.20 :
    livingPeople.length > shelterCapacity ? 0.55 :
    1.20;
  const birthChance = seasonalFertility * foodAbundanceFactor * crowdingFactor * agriBonus;

  for (const mom of fertileFemales) {
    // Morale & individual health bonus
    const personalVitality = (mom.health / 100) * 0.5 + (mom.mentalState / 100) * 0.5;
    if (rng.chance(birthChance * personalVitality)) {
      const babyGender = rng.chance(0.5) ? 'female' : 'male';
      const babyNames = babyGender === 'male'
        ? ['Kip', 'Arlo', 'Tari', 'Orin', 'Baelin', 'Duran', 'Bran', 'Keld', 'Jarek', 'Torm', 'Eldar', 'Sven', 'Roric', 'Finn', 'Merek']
        : ['Tara', 'Shani', 'Lila', 'Nemi', 'Vani', 'Mira', 'Kora', 'Sela', 'Brena', 'Zaya', 'Faye', 'Kaelen', 'Yara', 'Astrid', 'Vespera'];

      const dad = mom.relationships.partnerId
        ? livingPeopleMap.get(mom.relationships.partnerId)
        : (livingMales.length > 0 ? livingMales[rng.integer(0, livingMales.length - 1)] : undefined);

      const parentName = mom.name.split(' ')[0];

      const baby: Person = {
        id: `p-${state.people.length + 1}`,
        name: `${rng.pick(babyNames)} of-${parentName}`,
        age: 0,
        gender: babyGender,
        alive: true,
        health: 94,
        hunger: 5,
        thirst: 5,
        fatigue: 5,
        temperature: 37.0,
        mentalState: 90,
        injuries: [],
        diseases: [],
        nutrition: 85,
        shelterQuality: 70,
        clothingQuality: 40,
        warmth: 85,
        safety: 85,
        role: 'idle_child',
        skills: {
          hunting: dad ? Math.round(dad.skills.hunting * 0.15) : 5,
          foraging: Math.round(mom.skills.foraging * 0.20),
          farming: hasAgri ? 15 : 5,
          stonecraft: 5,
          woodcraft: 5,
          healing: 5,
          lore: Math.max(10, Math.round(mom.skills.lore * 0.15)),
          fishing: 10,
        },
        relationships: {
          parentIds: dad ? [mom.id, dad.id] : [mom.id],
          childrenIds: [],
        },
      };

      state.people.push(baby);
      mom.relationships.childrenIds.push(baby.id);
      if (dad) {
        dad.relationships.childrenIds.push(baby.id);
      }
      state.annualBirths += 1;
    }
  }

  // 6b. Nomadic Integration & Immigrant Influx (Prosperity Attraction)
  // Prosperous, secure societies attract neighboring hunter-gatherers, wanderers, and refugees
  const waterRunwayDays = (state.resources.fresh_water.quantity / Math.max(1, livingPeople.length * 2.0));
  const foodRunwayDays = (totalFoodKg / Math.max(1, livingPeople.length * 1.5));
  const isSafe = !state.weather.isBlizzard && !state.weather.isDrought && (!state.crises || state.crises.filter((c) => !c.resolved).length === 0);
  const isProsperous = foodRunwayDays > 45 && waterRunwayDays > 35 && isSafe;

  if (isProsperous && livingPeople.length < maxDensity && season !== 'Winter' && rng.chance(0.20)) {
    const migrantCount = rng.integer(1, 3);
    const wandererNamesMale = ['Toran', 'Bram', 'Enki', 'Ronak', 'Vael', 'Khor', 'Brant', 'Galan', 'Korm', 'Zoran'];
    const wandererNamesFemale = ['Mara', 'Sura', 'Osha', 'Naru', 'Tova', 'Dara', 'Kira', 'Lyra', 'Vea', 'Ilka'];

    for (let m = 0; m < migrantCount; m++) {
      const migrantGender = rng.chance(0.5) ? 'female' : 'male';
      const namePool = migrantGender === 'male' ? wandererNamesMale : wandererNamesFemale;
      const migrantAge = 16 + rng.integer(0, 22);

      const migrant: Person = {
        id: `p-${state.people.length + 1}`,
        name: `${rng.pick(namePool)} Wanderer`,
        age: migrantAge,
        gender: migrantGender,
        alive: true,
        health: 80 + rng.integer(0, 15),
        hunger: 15,
        thirst: 15,
        fatigue: 20,
        temperature: 36.9,
        mentalState: 75,
        injuries: [],
        diseases: [],
        nutrition: 80,
        shelterQuality: 50,
        clothingQuality: 40,
        warmth: 75,
        safety: 75,
        role: rng.chance(0.4) ? 'forager' : rng.chance(0.5) ? 'hunter' : 'fisherman',
        skills: {
          hunting: 30 + rng.integer(0, 25),
          foraging: 35 + rng.integer(0, 25),
          farming: 10,
          stonecraft: 15,
          woodcraft: 20,
          healing: 10,
          lore: 15,
          fishing: 25 + rng.integer(0, 25),
        },
        relationships: {
          parentIds: [],
          childrenIds: [],
        },
      };

      state.people.push(migrant);
      state.annualImmigration = (state.annualImmigration || 0) + 1;
    }

    // Log decision / event in autonomous feed
    if (state.autonomousDecisions) {
      state.autonomousDecisions.unshift({
        id: `dec-${state.year}-${state.season}-mig-${state.autonomousDecisions.length + 1}`,
        year: state.year,
        season: state.season,
        category: 'Migration',
        problem: 'Displaced nomadic wanderers from outer wilderness observed our thriving campfires.',
        action: `Welcomed ${migrantCount} nomadic wanderers into our communal hearth.`,
        consequence: 'Expanded workforce with able hunter-gatherers; assimilated into clan society.',
        reasoning: 'Abundant food stockpiles and open dwellings permit peaceful clan expansion.',
        importance: 'notable',
      });
      if (state.autonomousDecisions.length > 50) {
        state.autonomousDecisions.pop();
      }
    }
  }

  return {
    foodKg: totalConsumedFoodKg,
    waterL: totalConsumedWaterL,
    fuelUnits: totalConsumedFuel,
  };
}

function simulateSpoilageAndStorage(state: CivilizationState) {
  const hasSmokehouse = state.technologies.find((t) => t.id === 'tech-smoking')?.discovered;
  const hasPottery = state.technologies.find((t) => t.id === 'tech-pottery')?.discovered;

  // Infrastructure storage facilities directly mitigate natural decay
  const hasSmokingFacility = hasSmokehouse || (state.infrastructure.smokingRacks > 0);
  const granaryBinsBonus = Math.min(0.04, state.infrastructure.granaryBins * 0.008);

  const meatSpoilageRate = hasSmokingFacility ? 0.08 : 0.28;
  const fishSpoilageRate = hasSmokingFacility ? 0.09 : 0.32;
  const grainSpoilageRate = Math.max(0.02, (hasPottery ? 0.03 : 0.06) - granaryBinsBonus);

  state.resources.meat.quantity = Math.max(0, Math.round(state.resources.meat.quantity * (1 - meatSpoilageRate)));
  state.resources.fish.quantity = Math.max(0, Math.round(state.resources.fish.quantity * (1 - fishSpoilageRate)));
  state.resources.grains.quantity = Math.max(0, Math.round(state.resources.grains.quantity * (1 - grainSpoilageRate)));
  state.resources.fruit.quantity = Math.max(0, Math.round(state.resources.fruit.quantity * 0.72));
}

function simulateHealthAndMedicine(state: CivilizationState, rng: SeededRandom) {
  const living = state.people.filter((p) => p.alive);
  const herbalists = living.filter((p) => p.role === 'herbalist' && p.health > 40);
  const hasMedicineTech = state.technologies.find((t) => t.id === 'tech-herbal')?.discovered;
  const cleanWater = state.resources.fresh_water.quality > 80;

  for (const person of living) {
    // Waterborne illness risk
    if (!cleanWater && rng.chance(0.15)) {
      if (!person.diseases.includes('Camp Dysentery')) {
        person.diseases.push('Camp Dysentery');
        person.health = Math.max(10, person.health - 20);
      }
    }

    // Crowd density infections if hygiene is neglected
    if (living.length > 120 && rng.chance(0.08)) {
      if (!person.diseases.includes('Respiratory Fever')) {
        person.diseases.push('Respiratory Fever');
      }
    }

    // Herbal treatment
    if (person.diseases.length > 0 || person.injuries.length > 0) {
      if (herbalists.length > 0 && state.resources.plants.quantity >= 5) {
        state.resources.plants.quantity -= 5;
        const cureChance = hasMedicineTech ? 0.65 : 0.35;
        if (rng.chance(cureChance)) {
          person.diseases.pop();
          person.injuries.pop();
          person.health = Math.min(100, person.health + 15);
        }
      }
    }
  }
}

function simulateGenerationalKnowledge(state: CivilizationState) {
  const living = state.people.filter((p) => p.alive);
  const lorekeepers = living.filter((p) => p.role === 'elder_lorekeeper');

  // Passive research points generated per season
  const researchGain = lorekeepers.length * 5 + living.length * 0.5;

  for (const tech of state.technologies) {
    if (!tech.discovered) {
      tech.costPoints = Math.max(0, tech.costPoints - Math.round(researchGain));
      if (tech.costPoints <= 0) {
        tech.discovered = true;
        tech.activeKeepersCount = Math.max(1, lorekeepers.length * 2);
      }
    } else {
      // Tech knowledge can be lost if activeKeepersCount hits 0!
      if (tech.activeKeepersCount <= 0 && tech.id !== 'tech-fire') {
        tech.discovered = false;
        tech.costPoints = 80; // Must be rediscovered!
      }
    }
  }
}

function simulateExploration(state: CivilizationState, rng: SeededRandom) {
  const scouts = state.people.filter((p) => p.alive && p.role === 'scout');
  if (scouts.length === 0) return;

  const unexplored = state.regions.filter((r) => !r.explored);
  if (unexplored.length === 0) return;

  const targetRegion = unexplored[0];
  const explorationPower = scouts.length * 15;

  if (rng.chance(explorationPower / 100)) {
    targetRegion.explored = true;
  }
}

function simulateCrisesAndCascades(state: CivilizationState) {
  const foodStockpile = state.resources.grains.quantity + state.resources.meat.quantity + state.resources.fruit.quantity;
  const livingCount = state.people.filter((p) => p.alive).length;
  const foodPerPerson = foodStockpile / Math.max(1, livingCount);

  // Clear resolved crises
  state.crises = state.crises.filter((c) => !c.resolved);

  // 1. Famine Cascade
  if (foodPerPerson < 30) {
    const existingFamine = state.crises.find((c) => c.title.includes('Famine'));
    if (!existingFamine) {
      state.crises.push({
        id: `crisis-${Date.now()}-famine`,
        year: state.year,
        season: state.season,
        title: 'Severe Food Famine',
        severity: foodPerPerson < 15 ? 'catastrophic' : 'severe',
        description: 'Stockpiles are exhausted. Adults are forfeiting meals, strength is failing, and infant survival is compromised.',
        cascadeChain: [
          'Food production deficit',
          'Rations depleted',
          'Immune compromise',
          'Rising mortality',
          'Labor shortage',
        ],
        resolved: false,
      });
    }
  } else {
    for (const c of state.crises) {
      if (c.title.includes('Famine')) c.resolved = true;
    }
  }

  // 2. Severe Winter Blizzard Cascade
  if (state.weather.isBlizzard && state.resources.fuel.quantity < 300) {
    state.crises.push({
      id: `crisis-${Date.now()}-freeze`,
      year: state.year,
      season: state.season,
      title: 'Freezing Blizzard & Fuel Shortage',
      severity: 'severe',
      description: 'Howling sub-zero winds strike the encampment while firewood stacks dwindle. Hypothermia risk is acute.',
      cascadeChain: [
        'Blizzard sub-zero drop',
        'Firewood depleted',
        'Camp bonfires extinguished',
        'Hypothermia epidemic',
      ],
      resolved: false,
    });
  }

  // 3. Drought Cascade
  if (state.weather.isDrought) {
    const existingDrought = state.crises.find((c) => c.title.includes('Drought'));
    if (!existingDrought) {
      state.crises.push({
        id: `crisis-${Date.now()}-drought`,
        year: state.year,
        season: state.season,
        title: 'Scorching Seasonal Drought',
        severity: 'moderate',
        description: 'River shallows recede and vegetation withers under prolonged heat. Water collection rates dropped by half.',
        cascadeChain: [
          'Rainfall deficit',
          'River drop',
          'Crop and berry withering',
          'Wildlife migration away',
        ],
        resolved: false,
      });
    }
  } else {
    for (const c of state.crises) {
      if (c.title.includes('Drought')) c.resolved = true;
    }
  }
}

function generateYearlyReport(state: CivilizationState): YearlyResourceReport {
  const living = state.people.filter((p) => p.alive);
  const totalStockpileFood =
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.fruit.quantity +
    state.resources.plants.quantity;

  const totalWaterStock = state.resources.fresh_water.quantity;
  const totalWoodStock = state.resources.wood.quantity;
  const totalStoneStock = state.resources.stone.quantity;
  const totalMetalStock = state.resources.ores.quantity;

  // Threat Level calculation according to Section 30
  let threat: ThreatLevel = 'Safe';
  const foodReserveDays = totalStockpileFood / Math.max(1, living.length * 1.8);
  const sickCount = living.filter((p) => p.diseases.length > 0 || p.health < 40).length;

  if (living.length < 35 || foodReserveDays < 15 || sickCount > living.length * 0.4) {
    threat = 'Catastrophic';
  } else if (living.length < 65 || foodReserveDays < 35 || state.crises.length >= 2) {
    threat = 'Crisis';
  } else if (foodReserveDays < 60 || sickCount > living.length * 0.2) {
    threat = 'Concern';
  }

  // Calculate life expectancy
  const avgAge = living.length > 0 ? Math.round(living.reduce((acc, p) => acc + p.age, 0) / living.length) : 0;
  const lifeExp = Math.min(48, Math.max(22, 32 + (totalStockpileFood > 4000 ? 5 : -4) - (sickCount > 10 ? 4 : 0)));

  const report: YearlyResourceReport = {
    year: state.year,
    population: {
      current: living.length,
      births: state.annualBirths,
      deaths: state.annualDeaths,
      migration: 0,
      lifeExpectancy: lifeExp,
      infantMortality: Math.round((state.annualDeaths / Math.max(1, state.annualBirths + state.annualDeaths)) * 25),
    },
    food: {
      productionKg: state.accumulatedAnnualProduction.foodKg,
      consumptionKg: state.accumulatedAnnualConsumption.foodKg,
      storageKg: totalStockpileFood,
      surplusDeficitKg: state.accumulatedAnnualProduction.foodKg - state.accumulatedAnnualConsumption.foodKg,
    },
    water: {
      supplyL: state.accumulatedAnnualProduction.waterL,
      consumptionL: state.accumulatedAnnualConsumption.waterL,
      qualityPercent: state.resources.fresh_water.quality,
    },
    materials: {
      wood: totalWoodStock,
      stone: totalStoneStock,
      metals: totalMetalStock,
      otherResources: state.resources.bone.quantity + state.resources.fibers.quantity + state.resources.clay.quantity,
    },
    energy: {
      productionFuel: state.accumulatedAnnualProduction.fuelUnits,
      consumptionFuel: state.accumulatedAnnualConsumption.fuelUnits,
      mainEnergySources: 'Dry Hardwood, Peat & Campfires',
    },
    infrastructure: {
      homes: state.infrastructure.leafHuts + state.infrastructure.thatchedCabins,
      farmsHectares: state.technologies.find((t) => t.id === 'tech-agri')?.discovered ? 4 : 0,
      roadsKm: 1.2,
      workshops: state.infrastructure.toolWorkBench + state.infrastructure.smokingRacks,
      storageCapacityKg: state.infrastructure.granaryBins * 1500 + 2000,
    },
    health: {
      diseaseRatePercent: Math.round((sickCount / Math.max(1, living.length)) * 100),
      injuriesActive: living.reduce((acc, p) => acc + p.injuries.length, 0),
      healthcareRating: state.technologies.find((t) => t.id === 'tech-herbal')?.discovered ? 'Herbal Poultices' : 'None / Bandages',
      mortalityRatePercent: Math.round((state.annualDeaths / Math.max(1, living.length + state.annualDeaths)) * 100),
    },
    economy: {
      productionUnits: Math.round(state.accumulatedAnnualProduction.foodKg + state.accumulatedAnnualProduction.woodUnits),
      tradeVolume: 0,
      barterValueIndex: foodReserveDays < 30 ? 180 : 100, // Scarce food drives barter prices up!
      wealthScore: Math.round(totalStockpileFood * 0.1 + totalWoodStock * 0.2 + totalStoneStock * 0.15),
      employmentPercent: 100,
    },
    environment: {
      forestCoveragePercent: Math.round((state.resources.wood.worldReserve / 48000) * 100),
      soilQualityPercent: 88,
      wildlifeAbundancePercent: Math.round((state.resources.animals.worldReserve / 1400) * 100),
      pollutionLevelPercent: 2,
    },
    threatLevel: threat,
    notableHappenings: [
      `Completed Year ${state.year} with ${living.length} surviving members.`,
      state.annualBirths > 0 ? `${state.annualBirths} children were born into the clan.` : 'No new children survived infancy.',
      state.annualDeaths > 0 ? `Mourned the loss of ${state.annualDeaths} fallen members.` : 'No deaths recorded this full solar cycle.',
    ],
  };

  return report;
}
