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
  
  // 3. Labor & Production Phase
  const productionThisSeason = simulateProduction(state, context.rng);
  
  // 4. Consumption & Individual Survival Needs Phase
  const consumptionThisSeason = simulateIndividualNeedsAndConsumption(state, context.rng);
  
  // 5. Spoilage and Storage Degradation
  simulateSpoilageAndStorage(state, context.rng);
  
  // 6. Disease, Injuries, and Healthcare
  simulateHealthAndMedicine(state, context.rng);
  
  // 7. Generational Knowledge & Tech Research
  simulateGenerationalKnowledge(state, context.rng);
  
  // 8. Exploration & Scouting
  simulateExploration(state, context.rng);
  
  // 9. Crisis Detection & Cascades
  simulateCrisesAndCascades(state, context.rng);

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

    // Reset annual counters
    state.accumulatedAnnualProduction = { foodKg: 0, waterL: 0, woodUnits: 0, stoneUnits: 0, fuelUnits: 0 };
    state.accumulatedAnnualConsumption = { foodKg: 0, waterL: 0, fuelUnits: 0 };
    state.annualBirths = 0;
    state.annualDeaths = 0;

    // Age all living people by 1 year
    for (const person of state.people) {
      if (person.alive) {
        person.age += 1;
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

function simulateEcosystemRegeneration(state: CivilizationState) {
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

function simulateProduction(state: CivilizationState) {
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
    if (person.age < 10) continue; // Young children cannot perform heavy labor

    // Health fatigue penalty
    const efficiency = (person.health / 100) * (1 - person.fatigue / 200);

    switch (person.role) {
      case 'forager': {
        const seasonFactor = state.resources.fruit.seasonality[season];
        const plantFactor = state.resources.plants.seasonality[season];
        const droughtPen = weather.isDrought ? 0.5 : 1.0;

        const foragedKg = Math.round((140 + person.skills.foraging * 1.8) * seasonFactor * droughtPen * carryEfficiency * efficiency);
        const berryPart = Math.round(foragedKg * 0.5);
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
        if (gameReserve > 50) {
          const huntingSkill = person.skills.hunting;
          const successChance = Math.min(0.85, (huntingSkill / 100) * 0.7 + (hasFlintKnapping ? 0.15 : 0.05));
          const winterPenalty = season === 'Winter' ? 0.75 : 1.0;

          if (rng.chance(successChance * winterPenalty)) {
            const meatKg = Math.round((90 + huntingSkill * 1.5) * toolEfficiency * efficiency);
            state.resources.meat.quantity += meatKg;
            state.resources.bone.quantity += Math.round(meatKg * 0.15);
            state.resources.fibers.quantity += Math.round(meatKg * 0.1);
            state.resources.animals.worldReserve = Math.max(0, state.resources.animals.worldReserve - 2);
            state.resources.animals.quantity = state.resources.animals.worldReserve;
            producedFoodKg += meatKg;
          } else {
            // Unsuccessful hunt, minor risk of animal counter-attack
            if (rng.chance(0.08)) {
              person.injuries.push('Boar Tusk Gash');
              person.health = Math.max(10, person.health - 25);
            }
          }
          person.skills.hunting = Math.min(100, person.skills.hunting + 0.5);
        }
        break;
      }
      case 'farmer': {
        if (hasAgriculture) {
          let farmYield = 0;
          if (season === 'Autumn') {
            const droughtPenalty = weather.isDrought ? 0.35 : 1.0;
            farmYield = Math.round((280 + person.skills.farming * 3.0) * droughtPenalty * toolEfficiency * efficiency);
            state.resources.grains.quantity += farmYield;
            producedFoodKg += farmYield;
          } else if (season === 'Spring') {
            // Planting season: consumes seeds from grains stockpile
            state.resources.grains.quantity = Math.max(0, state.resources.grains.quantity - 25);
          }
          person.skills.farming = Math.min(100, person.skills.farming + 0.8);
        } else {
          // Primitive hoeing before agriculture yields meager wild tubers
          const wildYield = Math.round(50 * efficiency);
          state.resources.grains.quantity += wildYield;
          producedFoodKg += wildYield;
        }
        break;
      }
      case 'water_fetcher': {
        const baseWater = (weather.isDrought ? 1400 : 2800) * carryEfficiency * efficiency;
        const fetched = Math.round(baseWater);
        state.resources.fresh_water.quantity += fetched;
        collectedWaterL += fetched;
        break;
      }
      case 'lumberjack': {
        const cutWood = Math.round((120 + person.skills.woodcraft * 1.2) * toolEfficiency * efficiency);
        const cutFuel = Math.round((80 + person.skills.woodcraft * 0.8) * efficiency);
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
          } else if (state.infrastructure.granaryBins < 6) {
            state.infrastructure.granaryBins += 1;
          } else if (state.infrastructure.waterCisterns < 8) {
            state.infrastructure.waterCisterns += 1;
          } else if (state.infrastructure.smokingRacks < 4) {
            state.infrastructure.smokingRacks += 1;
          }
        }
        break;
      }
      case 'herbalist': {
        const collectedPlants = Math.round(35 * efficiency);
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

function simulateIndividualNeedsAndConsumption(state: CivilizationState) {
  const livingPeople = state.people.filter((p) => p.alive);
  const season = state.season;
  const weather = state.weather;
  const rationing = state.policies.foodRationing;

  // Daily food per person: Frugal = 1.2kg/day (108kg/season), Normal = 1.8kg/day (162kg/season), Generous = 2.4kg/day (216kg/season)
  const targetFoodPerPerson = rationing === 'Frugal' ? 110 : rationing === 'Normal' ? 165 : 220;
  // Daily water per person: ~2.5L/day = ~225L/season (more in hot summer heat)
  const targetWaterPerPerson = (weather.currentTempC > 25 ? 280 : 225) * (state.policies.waterConservation ? 0.75 : 1.0);

  // Firewood consumption per person per season: Winter 4x higher!
  const baseFuelPerPerson = season === 'Winter' ? 35 : season === 'Autumn' ? 12 : season === 'Spring' ? 10 : 6;
  const fuelMultiplier = state.policies.firewoodPriority === 'Maximum Warmth' ? 1.4 : state.policies.firewoodPriority === 'Minimum' ? 0.6 : 1.0;
  const targetFuelPerPerson = Math.round(baseFuelPerPerson * fuelMultiplier);

  let totalConsumedFoodKg = 0;
  let totalConsumedWaterL = 0;
  let totalConsumedFuel = 0;

  // Calculate shelter capacity
  const shelterCapacity = state.infrastructure.leafHuts * 4 + state.infrastructure.thatchedCabins * 8;
  const hasShelter = livingPeople.length <= shelterCapacity;

  for (const person of livingPeople) {
    // 1. Food Consumption
    let foodGiven = 0;
    // Consume from food sources in order: Berries/Fruit -> Meat -> Fish -> Grains
    const foodSources: ResourceId[] = ['fruit', 'meat', 'fish', 'grains', 'plants'];
    for (const f of foodSources) {
      if (foodGiven >= targetFoodPerPerson) break;
      const needed = targetFoodPerPerson - foodGiven;
      const take = Math.min(needed, state.resources[f].quantity);
      state.resources[f].quantity -= take;
      foodGiven += take;
    }

    totalConsumedFoodKg += foodGiven;
    const foodDeficitRatio = foodGiven / targetFoodPerPerson;

    if (foodDeficitRatio < 0.5) {
      // Starving!
      person.hunger = Math.min(100, person.hunger + 35);
      person.health = Math.max(0, person.health - 25);
      person.mentalState = Math.max(0, person.mentalState - 30);
      person.nutrition = Math.max(10, person.nutrition - 25);
    } else if (foodDeficitRatio < 0.9) {
      // Malnourished
      person.hunger = Math.min(100, person.hunger + 15);
      person.health = Math.max(0, person.health - 8);
      person.mentalState = Math.max(0, person.mentalState - 10);
    } else {
      // Well fed
      person.hunger = Math.max(0, person.hunger - 25);
      person.health = Math.min(100, person.health + 5);
      person.mentalState = Math.min(100, person.mentalState + 5);
    }

    // 2. Water Consumption
    const waterAvailable = state.resources.fresh_water.quantity;
    const waterGiven = Math.min(targetWaterPerPerson, waterAvailable);
    state.resources.fresh_water.quantity -= waterGiven;
    totalConsumedWaterL += waterGiven;

    const waterRatio = waterGiven / targetWaterPerPerson;
    if (waterRatio < 0.5) {
      person.thirst = Math.min(100, person.thirst + 45);
      person.health = Math.max(0, person.health - 35); // Dehydration kills rapidly
      person.mentalState = Math.max(0, person.mentalState - 35);
    } else if (waterRatio < 0.9) {
      person.thirst = Math.min(100, person.thirst + 20);
      person.health = Math.max(0, person.health - 12);
    } else {
      person.thirst = Math.max(0, person.thirst - 30);
    }

    // 3. Fuel & Warmth
    const fuelAvailable = state.resources.fuel.quantity;
    const fuelGiven = Math.min(targetFuelPerPerson, fuelAvailable);
    state.resources.fuel.quantity -= fuelGiven;
    totalConsumedFuel += fuelGiven;

    const fuelRatio = fuelGiven / targetFuelPerPerson;
    person.shelterQuality = hasShelter ? 75 : 25;
    const warmthScore = (fuelRatio * 50) + (person.shelterQuality * 0.3) + (season === 'Summer' ? 30 : season === 'Winter' ? -20 : 0);
    person.warmth = Math.max(0, Math.min(100, warmthScore));

    if (season === 'Winter' && person.warmth < 35) {
      // Hypothermia danger
      person.health = Math.max(0, person.health - 28);
      if (!person.diseases.includes('Hypothermia')) {
        person.diseases.push('Hypothermia');
      }
      person.temperature = 35.1;
    } else {
      person.temperature = 37.0;
      person.diseases = person.diseases.filter((d) => d !== 'Hypothermia');
    }

    // 4. Fatigue & Recovery
    person.fatigue = Math.max(0, person.fatigue - 20);

    // 5. Mortality Check (Permanent Death)
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
      } else if (person.warmth < 30 && season === 'Winter') {
        person.causeOfDeath = 'Severe Hypothermia & Exposure';
      } else if (person.age > 50) {
        person.causeOfDeath = 'Old Age Complications';
      } else {
        person.causeOfDeath = 'Physical Trauma & Sickness';
      }

      // Generational knowledge loss if lorekeeper dies!
      if (person.role === 'elder_lorekeeper') {
        for (const tech of state.technologies) {
          if (tech.discovered && tech.activeKeepersCount > 0) {
            tech.activeKeepersCount = Math.max(0, tech.activeKeepersCount - 1);
          }
        }
      }
    }
  }

  // 6. Natural Births (Spring & Autumn if population well-fed)
  if ((season === 'Spring' || season === 'Autumn') && livingPeople.length < 250) {
    const fertileFemales = livingPeople.filter(
      (p) => p.gender === 'female' && p.age >= 16 && p.age <= 38 && p.health >= 65 && p.hunger < 40
    );

    for (const mom of fertileFemales) {
      if (rng.chance(0.12)) {
        const babyGender = rng.chance(0.5) ? 'female' : 'male';
        const babyNames = babyGender === 'male' ? ['Kip', 'Arlo', 'Tari', 'Orin', 'Baelin'] : ['Tara', 'Shani', 'Lila', 'Nemi', 'Vani'];
        const baby: Person = {
          id: `p-${state.people.length + 1}`,
          name: `${rng.pick(babyNames)} of ${mom.name.split(' ')[0]}`,
          age: 0,
          gender: babyGender,
          alive: true,
          health: 90,
          hunger: 10,
          thirst: 10,
          fatigue: 5,
          temperature: 37.0,
          mentalState: 90,
          injuries: [],
          diseases: [],
          nutrition: 85,
          shelterQuality: 50,
          clothingQuality: 30,
          warmth: 80,
          safety: 85,
          role: 'idle_child',
          skills: {
            hunting: 5,
            foraging: 10,
            farming: 5,
            stonecraft: 5,
            woodcraft: 5,
            healing: 5,
            lore: 10,
          },
          relationships: {
            parentIds: [mom.id],
            childrenIds: [],
          },
        };
        state.people.push(baby);
        mom.relationships.childrenIds.push(baby.id);
        state.annualBirths += 1;
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

  // Meat and fish spoil fast without smoking
  const meatSpoilageRate = hasSmokehouse ? 0.08 : 0.35;
  const fishSpoilageRate = hasSmokehouse ? 0.09 : 0.40;
  const grainSpoilageRate = hasPottery ? 0.03 : 0.08;

  state.resources.meat.quantity = Math.max(0, Math.round(state.resources.meat.quantity * (1 - meatSpoilageRate)));
  state.resources.fish.quantity = Math.max(0, Math.round(state.resources.fish.quantity * (1 - fishSpoilageRate)));
  state.resources.grains.quantity = Math.max(0, Math.round(state.resources.grains.quantity * (1 - grainSpoilageRate)));
  state.resources.fruit.quantity = Math.max(0, Math.round(state.resources.fruit.quantity * 0.70));
}

function simulateHealthAndMedicine(state: CivilizationState) {
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

function simulateExploration(state: CivilizationState) {
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
