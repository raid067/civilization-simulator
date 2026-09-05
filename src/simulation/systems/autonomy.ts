import { SimulationContext } from '../context';
import { CivilizationState, RoleType, Person } from '../../types';

/**
 * AUTONOMY SYSTEM — TRIBAL SURVIVAL WISDOM
 * 
 * Automatically balances labor and vital roles so the tribe does not
 * blindly extinguish itself when the player watches in auto-play mode.
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
 * Automatically adjust worker assignments according to life-support runways
 */
function manageTribalLabor(state: CivilizationState): void {
  const living = state.people.filter((p) => p.alive);
  const livingCount = living.length;
  if (livingCount === 0) return;

  const ableAdults = living.filter((p) => p.age >= 10 && p.health > 20);
  if (ableAdults.length === 0) return;

  // Calculate current survival reserves
  const totalFoodKg =
    state.resources.fruit.quantity +
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.plants.quantity;

  const dailyFoodConsumption = livingCount * (state.policies.foodRationing === 'Frugal' ? 1.2 : 1.8);
  const foodRunwayDays = dailyFoodConsumption > 0 ? totalFoodKg / dailyFoodConsumption : 999;

  const dailyWaterConsumption = livingCount * 2.5 * (state.policies.waterConservation ? 0.75 : 1.0);
  const waterRunwayDays = dailyWaterConsumption > 0 ? state.resources.fresh_water.quantity / dailyWaterConsumption : 999;

  const fuelReserve = state.resources.fuel.quantity;
  const isWinterApproaching = state.season === 'Autumn' || state.season === 'Winter';
  const fuelShortage = isWinterApproaching && fuelReserve < livingCount * 25;

  const sickCount = living.filter((p) => p.diseases.length > 0 || p.health < 40).length;

  // 1. Ensure at least one Elder Lorekeeper to prevent total loss of oral knowledge
  const currentKeepers = living.filter((p) => p.role === 'elder_lorekeeper');
  if (currentKeepers.length === 0) {
    const elderCandidate = ableAdults
      .filter((p) => p.age >= 45)
      .sort((a, b) => b.skills.lore - a.skills.lore)[0];
    if (elderCandidate) {
      elderCandidate.role = 'elder_lorekeeper';
    }
  }

  // 2. Emergency Water Priority (Dehydration kills in days)
  if (waterRunwayDays < 15) {
    const targetWaterFetchers = Math.max(3, Math.ceil(ableAdults.length * 0.28));
    rebalanceRole(ableAdults, 'water_fetcher', targetWaterFetchers);
  }

  // 3. Emergency Food Priority (Famine prevention)
  if (foodRunwayDays < 20) {
    const targetFoodGatherers = Math.max(4, Math.ceil(ableAdults.length * 0.45));
    // Split between foraging and hunting (and farming if Neolithic tech is unlocked)
    const hasAgri = state.technologies.some((t) => t.id === 'tech-agri' && t.discovered);
    const foragerCount = hasAgri && state.season === 'Autumn' ? Math.floor(targetFoodGatherers * 0.4) : Math.floor(targetFoodGatherers * 0.65);
    const hunterCount = targetFoodGatherers - foragerCount;

    rebalanceRole(ableAdults, 'forager', foragerCount);
    rebalanceRole(ableAdults, 'hunter', hunterCount);
  }

  // 4. Winter Fuel Buffer (Hypothermia prevention)
  if (fuelShortage) {
    const targetCutters = Math.max(2, Math.ceil(ableAdults.length * 0.20));
    rebalanceRole(ableAdults, 'lumberjack', targetCutters);
  }

  // 5. Medical Care for Outbreaks
  if (sickCount >= 3) {
    const currentHealers = living.filter((p) => p.role === 'herbalist').length;
    if (currentHealers === 0) {
      const healerCandidate = ableAdults.find((p) => p.role !== 'elder_lorekeeper' && p.role !== 'water_fetcher');
      if (healerCandidate) healerCandidate.role = 'herbalist';
    }
  }
}

/**
 * Rebalances a role to have approximately targetCount adults
 */
function rebalanceRole(adults: Person[], targetRole: RoleType, targetCount: number): void {
  const currentInRole = adults.filter((p) => p.role === targetRole);
  const diff = targetCount - currentInRole.length;

  if (diff > 0) {
    // Need more in this role; take from less critical roles (e.g. toolmaker, stonecutter, scout)
    const candidates = adults.filter(
      (p) => p.role !== targetRole && p.role !== 'elder_lorekeeper' && p.role !== 'water_fetcher'
    );
    for (let i = 0; i < Math.min(diff, candidates.length); i++) {
      candidates[i].role = targetRole;
    }
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
  if (foodPerPerson < 40 && state.policies.foodRationing !== 'Frugal') {
    state.policies.foodRationing = 'Frugal';
  } else if (foodPerPerson > 150 && state.policies.foodRationing === 'Frugal') {
    state.policies.foodRationing = 'Normal';
  }

  // If drought or water deficit, conserve water
  if (state.weather.isDrought || state.resources.fresh_water.quantity < livingCount * 120) {
    state.policies.waterConservation = true;
  } else if (state.resources.fresh_water.quantity > livingCount * 400) {
    state.policies.waterConservation = false;
  }

  // If winter blizzard, prioritize maximum warmth
  if (state.weather.isBlizzard || (state.season === 'Winter' && state.weather.currentTempC < -2)) {
    state.policies.firewoodPriority = 'Maximum Warmth';
  }
}

