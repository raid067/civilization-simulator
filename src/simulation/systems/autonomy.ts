import { SimulationContext } from '../context';
import { CivilizationState, RoleType, Person } from '../../types';

/**
 * AUTONOMY SYSTEM — TRIBAL SURVIVAL WISDOM
 * 
 * Automatically balances labor and vital roles so the cohort self-organizes
 * against metabolic and ecological pressures during continuous simulation runs.
 * 
 * Survival Hierarchy of Needs:
 * 1. Water Critical Reserve (< 12 days supply)
 * 2. Food Critical Reserve (< 18 days supply)
 * 3. Winter Firewood Buffer (Sub-zero freeze prevention)
 * 4. Healthcare & Sickness Treatment (Herbalists)
 * 5. Generational Lorekeeper Preservation (Oral tech continuity)
 * 6. Shelter Construction & Maintenance
 */

export function runAutonomySystem(context: SimulationContext): void {
  const state: CivilizationState = context.state;

  // If user has explicitly disabled autonomy, do not override manual allocations
  if (state.policies.autonomyEnabled === false) {
    return;
  }

  manageTribalLabor(state);
  manageEmergencyPolicies(state);
}

/**
 * Automatically adjust worker assignments according to life-support runways, seasonal demands, and skill affinities
 */
function manageTribalLabor(state: CivilizationState): void {
  const living = state.people.filter((p) => p.alive);
  const livingCount = living.length;
  if (livingCount === 0) return;

  const ableAdults = living.filter((p) => p.age >= 10 && p.health > 20);
  const totalAble = ableAdults.length;
  if (totalAble === 0) return;

  // Calculate current survival reserves
  const totalFoodKg =
    state.resources.fruit.quantity +
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.plants.quantity;

  const dailyFoodConsumption = livingCount * (state.policies.foodRationing === 'Frugal' ? 0.85 : 1.1);
  const foodRunwayDays = dailyFoodConsumption > 0 ? totalFoodKg / dailyFoodConsumption : 999;

  const dailyWaterConsumption = livingCount * 2.0 * (state.policies.waterConservation ? 0.75 : 1.0);
  const waterRunwayDays = dailyWaterConsumption > 0 ? state.resources.fresh_water.quantity / dailyWaterConsumption : 999;

  const fuelReserve = state.resources.fuel.quantity;
  const isWinterApproaching = state.season === 'Autumn' || state.season === 'Winter';
  const fuelShortage = isWinterApproaching && fuelReserve < livingCount * 14;

  const sickCount = living.filter((p) => p.diseases.length > 0 || p.health < 40).length;

  // Unified Quota Planning Pass
  const quotas: Record<RoleType, number> = {
    elder_lorekeeper: 0,
    herbalist: 0,
    water_fetcher: 0,
    lumberjack: 0,
    forager: 0,
    hunter: 0,
    fisherman: 0,
    farmer: 0,
    builder: 0,
    toolmaker: 0,
    stonecutter: 0,
    scout: 0,
    idle_child: 0,
    soldier: 0,
    merchant: 0,
    priest: 0,
    scholar: 0,
    craftsperson: 0,
    miner: 0,
    potter: 0,
    weaver: 0,
    sailor: 0,
    administrator: 0,
  };

  let unassigned = totalAble;

  // 1. Mandatory Oral Knowledge Keepers (2-3 elders)
  quotas.elder_lorekeeper = Math.min(Math.min(3, Math.max(1, Math.floor(totalAble * 0.04))), unassigned);
  unassigned -= quotas.elder_lorekeeper;

  // 2. Medical Care for Outbreaks
  if (sickCount >= 2 && unassigned > 0) {
    quotas.herbalist = Math.min(Math.min(3, Math.ceil(sickCount * 0.35)), unassigned);
    unassigned -= quotas.herbalist;
  }

  // 3. Proactive Water Fetchers (Vital continuous hydration)
  if (unassigned > 0) {
    const seasonalWaterDemandL = livingCount * (state.weather.currentTempC > 25 ? 240 : 180);
    const fetcherCapacity = state.weather.isDrought ? 2400 : 4200;
    const requiredFetchers = Math.ceil(seasonalWaterDemandL / fetcherCapacity);
    const buffer = waterRunwayDays < 75 ? 2 : 0;
    const targetWater = Math.min(Math.max(2, requiredFetchers + buffer), Math.ceil(totalAble * 0.25));
    quotas.water_fetcher = Math.min(targetWater, unassigned);
    unassigned -= quotas.water_fetcher;
  }

  // 4. Firewood & Warmth Buffer
  if (unassigned > 0) {
    let targetLumberjacks = 2;
    if (state.season === 'Autumn' || fuelShortage) {
      targetLumberjacks = Math.max(3, Math.ceil(totalAble * 0.16));
    } else if (state.season === 'Winter') {
      targetLumberjacks = Math.max(2, Math.ceil(totalAble * 0.12));
    }
    quotas.lumberjack = Math.min(targetLumberjacks, unassigned);
    unassigned -= quotas.lumberjack;
  }

  // 5. Builders & Infrastructure maintenance
  if (unassigned > 0) {
    const targetBuilders = totalAble > 40 ? 2 : 1;
    quotas.builder = Math.min(targetBuilders, unassigned);
    unassigned -= quotas.builder;
  }

  // 6. Food Production Distribution (Remaining workforce)
  if (unassigned > 0) {
    const hasAgri = state.technologies.some((t) => t.id === 'tech-agri' && t.discovered);

    if (state.season === 'Autumn') {
      // Harvest push!
      if (hasAgri) {
        quotas.farmer = Math.floor(unassigned * 0.35);
      }
      quotas.hunter = Math.floor(unassigned * 0.30);
      quotas.forager = Math.floor(unassigned * 0.20);
      quotas.fisherman = unassigned - quotas.farmer - quotas.hunter - quotas.forager;
    } else if (state.season === 'Winter') {
      // Ice fishing, large game tracking, minimal snow foraging
      quotas.hunter = Math.floor(unassigned * 0.45);
      quotas.fisherman = Math.floor(unassigned * 0.40);
      quotas.forager = unassigned - quotas.hunter - quotas.fisherman;
    } else {
      // Spring & Summer abundance: foraging berries/greens, river fishing runs, hunting
      quotas.forager = Math.floor(unassigned * 0.40);
      quotas.fisherman = Math.floor(unassigned * 0.32);
      quotas.hunter = unassigned - quotas.forager - quotas.fisherman;
    }
  }

  // Step 2: Assign workers to fulfill quotas based on age and skill affinity
  const availableWorkers = [...ableAdults];

  // Assign elder lorekeepers first (eldest candidates with highest lore)
  if (quotas.elder_lorekeeper > 0) {
    availableWorkers.sort((a, b) => {
      if (a.age >= 45 && b.age < 45) return -1;
      if (b.age >= 45 && a.age < 45) return 1;
      return b.skills.lore - a.skills.lore;
    });
    for (let i = 0; i < quotas.elder_lorekeeper && availableWorkers.length > 0; i++) {
      const w = availableWorkers.shift()!;
      w.role = 'elder_lorekeeper';
    }
  }

  // Assign remaining roles
  const rolesToAssign: RoleType[] = ['herbalist', 'water_fetcher', 'lumberjack', 'builder', 'farmer', 'fisherman', 'hunter', 'forager'];
  for (const role of rolesToAssign) {
    const count = quotas[role] || 0;
    if (count <= 0 || availableWorkers.length === 0) continue;

    // Sort available workers by skill for this role
    availableWorkers.sort((a, b) => {
      const skillA = (a.skills as any)[role] || 0;
      const skillB = (b.skills as any)[role] || 0;
      return skillB - skillA;
    });

    const assignCount = Math.min(count, availableWorkers.length);
    for (let i = 0; i < assignCount; i++) {
      const w = availableWorkers.shift()!;
      w.role = role;
    }
  }

  // Any leftover workers become foragers
  for (const w of availableWorkers) {
    w.role = 'forager';
  }
}

/**
 * Adjust survival policies automatically under crisis
 */
function manageEmergencyPolicies(state: CivilizationState): void {
  const livingCount = state.people.filter((p) => p.alive).length;
  if (livingCount === 0) return;

  const totalFoodKg =
    state.resources.fruit.quantity +
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.plants.quantity;

  const foodPerPerson = totalFoodKg / Math.max(1, livingCount);

  // If severe food shortage, enact Frugal rationing
  if (foodPerPerson < 35 && state.policies.foodRationing !== 'Frugal') {
    state.policies.foodRationing = 'Frugal';
  } else if (foodPerPerson > 100 && state.policies.foodRationing === 'Frugal') {
    state.policies.foodRationing = 'Normal';
  }

  // If drought or water deficit, conserve water
  if (state.weather.isDrought || state.resources.fresh_water.quantity < livingCount * 90) {
    state.policies.waterConservation = true;
  } else if (state.resources.fresh_water.quantity > livingCount * 300) {
    state.policies.waterConservation = false;
  }

  // If winter blizzard, prioritize maximum warmth
  if (state.weather.isBlizzard || (state.season === 'Winter' && state.weather.currentTempC < -2)) {
    state.policies.firewoodPriority = 'Maximum Warmth';
  } else if (state.season === 'Summer') {
    state.policies.firewoodPriority = 'Balanced';
  }
}

