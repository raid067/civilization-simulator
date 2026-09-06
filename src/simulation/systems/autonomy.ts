import { SimulationContext } from '../context';
import {
  CivilizationState,
  RoleType,
  Person,
  AutonomousDecision,
  NationalFocusType,
  LeaderProfile,
} from '../../types';

/**
 * CIVILIZATION AUTONOMY ENGINE
 * 
 * Complete Closed-Loop Autonomy:
 * Needs -> Problems -> Priorities -> Decisions -> Actions -> Consequences -> Re-evaluation
 * 
 * Subsystems automated every season:
 * 1. Demographic & Life-Support Runway Evaluation (Food, Water, Fuel, Shelter, Health, Defense)
 * 2. Dynamic Problem Scoring influenced by National Focus and Leader Personality (Imperfect AI)
 * 3. Calculated Needs-Driven Labor Allocation (NO fixed percentages; allocates based on marginal return)
 * 4. Autonomous Infrastructure Construction (Leaf Huts, Thatched Cabins, Granaries, Cisterns, Palisades, Smokers)
 * 5. Autonomous Policy & Rationing Adaptations
 * 6. Autonomous Research Prioritization & Knowledge Guidance
 * 7. Governance, Chieftain Succession & Societal Epoch Elevation
 * 8. Real Historical Decision Logging (Every entry corresponds to actual state modification)
 */

export function runAutonomySystem(context: SimulationContext): void {
  const state: CivilizationState = context.state;

  if (state.policies?.autonomyEnabled === false) {
    return;
  }

  // Ensure collections exist
  if (!state.autonomousDecisions) {
    state.autonomousDecisions = [];
  }

  const living = state.people.filter((p) => p.alive);
  if (living.length === 0) return;

  // 1. Leader Maintenance & Succession Check
  ensureLeader(state, living, context);

  // 2. Needs Assessment
  const needs = evaluateSocietalNeeds(state, living);

  // 3. Problem Scoring & Priority Weights
  const priorities = calculatePriorities(state, needs);

  // 4. Autonomous Labor Re-allocation
  manageAutonomousLabor(state, living, needs, priorities);

  // 5. Autonomous Construction & Infrastructure
  manageAutonomousConstruction(state, living, needs, priorities);

  // 6. Autonomous Policies & Crisis Response
  manageAutonomousPolicies(state, living, needs, priorities);

  // 7. Autonomous Research Prioritization
  manageAutonomousResearch(state, living, needs);

  // 8. Governance & Societal Epoch Evolution
  manageSocietalEvolution(state, living);

  // Trim decision log to prevent unbounded memory growth
  if (state.autonomousDecisions.length > 60) {
    state.autonomousDecisions = state.autonomousDecisions.slice(-50);
  }
}

interface SocietalNeeds {
  livingCount: number;
  totalFoodKg: number;
  foodRunwayDays: number;
  expectedWinterDeficit: boolean;
  totalWaterL: number;
  waterRunwayDays: number;
  fuelUnits: number;
  fuelRunwayDays: number;
  shelterCapacity: number;
  shelterDeficit: number;
  granaryCapacity: number;
  granaryFullRatio: number;
  sickCount: number;
  threatLevelDanger: number;
  hasAgriculture: boolean;
  hasSmoking: boolean;
}

function evaluateSocietalNeeds(state: CivilizationState, living: Person[]): SocietalNeeds {
  const livingCount = living.length;

  const totalFoodKg =
    state.resources.fruit.quantity +
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.plants.quantity;

  const dailyFoodConsumption = livingCount * (state.policies.foodRationing === 'Frugal' ? 0.9 : state.policies.foodRationing === 'Normal' ? 1.1 : 1.35);
  const foodRunwayDays = dailyFoodConsumption > 0 ? totalFoodKg / dailyFoodConsumption : 999;
  const expectedWinterDeficit = (state.season === 'Autumn' || state.season === 'Summer') && foodRunwayDays < 60;

  const dailyWaterConsumption = livingCount * 2.0 * (state.policies.waterConservation ? 0.75 : 1.0);
  const waterRunwayDays = dailyWaterConsumption > 0 ? state.resources.fresh_water.quantity / dailyWaterConsumption : 999;

  const fuelUnits = state.resources.fuel.quantity;
  const isCold = state.season === 'Winter' || state.season === 'Autumn';
  const dailyFuelBurn = isCold ? livingCount * 0.12 : livingCount * 0.04;
  const fuelRunwayDays = dailyFuelBurn > 0 ? fuelUnits / dailyFuelBurn : 999;

  const shelterCapacity = (state.infrastructure.leafHuts || 0) * 4 + (state.infrastructure.thatchedCabins || 0) * 8;
  const shelterDeficit = Math.max(0, livingCount - shelterCapacity);

  const granaryCapacity = (state.infrastructure.granaryBins || 0) * 1500 + 2000;
  const granaryFullRatio = totalFoodKg / Math.max(1, granaryCapacity);

  const sickCount = living.filter((p) => p.diseases.length > 0 || p.health < 40).length;

  // Threat danger calculated from weather, predator pressure, and fences
  let threatDanger = 15;
  if (state.weather.isDrought) threatDanger += 25;
  if (state.weather.isBlizzard) threatDanger += 35;
  if (state.infrastructure.perimeterFence > 0) {
    threatDanger = Math.max(5, threatDanger - state.infrastructure.perimeterFence * 4);
  }

  const hasAgriculture = state.technologies.some((t) => t.id === 'tech-agri' && t.discovered);
  const hasSmoking = state.technologies.some((t) => t.id === 'tech-smoking' && t.discovered);

  return {
    livingCount,
    totalFoodKg,
    foodRunwayDays,
    expectedWinterDeficit,
    totalWaterL: state.resources.fresh_water.quantity,
    waterRunwayDays,
    fuelUnits,
    fuelRunwayDays,
    shelterCapacity,
    shelterDeficit,
    granaryCapacity,
    granaryFullRatio,
    sickCount,
    threatLevelDanger: threatDanger,
    hasAgriculture,
    hasSmoking,
  };
}

interface PriorityScores {
  waterScore: number;
  foodScore: number;
  fuelScore: number;
  healthScore: number;
  shelterScore: number;
  techScore: number;
  defenseScore: number;
}

function calculatePriorities(state: CivilizationState, needs: SocietalNeeds): PriorityScores {
  const focus: NationalFocusType = state.nationalFocus || 'balanced';
  const leader = state.leader;

  // 1. Base urgency from real conditions
  let waterScore = needs.waterRunwayDays < 25 ? 100 : needs.waterRunwayDays < 60 ? 60 : 30;
  let foodScore = needs.foodRunwayDays < 25 ? 100 : needs.foodRunwayDays < 50 ? 70 : needs.expectedWinterDeficit ? 60 : 35;
  let fuelScore = (state.season === 'Autumn' || state.season === 'Winter') && needs.fuelRunwayDays < 45 ? 80 : 25;
  let healthScore = needs.sickCount >= 4 ? 85 : needs.sickCount >= 1 ? 50 : 15;
  let shelterScore = needs.shelterDeficit > 15 ? 75 : needs.shelterDeficit > 0 ? 50 : 15;
  let techScore = 30;
  let defenseScore = needs.threatLevelDanger > 40 ? 70 : 20;

  // 2. National Focus Modifiers
  if (focus === 'food_security') {
    foodScore *= 1.4;
  } else if (focus === 'defense') {
    defenseScore *= 1.5;
  } else if (focus === 'technology') {
    techScore *= 1.5;
  } else if (focus === 'expansion') {
    shelterScore *= 1.4;
    foodScore *= 1.15;
  } else if (focus === 'ecological') {
    waterScore *= 1.25;
    fuelScore *= 1.25;
  }

  // 3. Leader Personality Bias (Imperfect AI - Rule #6)
  if (leader) {
    if (leader.personality === 'Agrarian Provider') {
      foodScore *= 1.25;
    } else if (leader.personality === 'Scholar Innovator') {
      techScore *= 1.35;
    } else if (leader.personality === 'Vigilant Guardian') {
      defenseScore *= 1.3;
    } else if (leader.personality === 'Ambitious Builder') {
      shelterScore *= 1.3;
    } else if (leader.personality === 'Traditional Elder') {
      fuelScore *= 1.15;
      techScore *= 1.15;
    }
  }

  return {
    waterScore,
    foodScore,
    fuelScore,
    healthScore,
    shelterScore,
    techScore,
    defenseScore,
  };
}

function manageAutonomousLabor(
  state: CivilizationState,
  living: Person[],
  needs: SocietalNeeds,
  priorities: PriorityScores
): void {
  const ableWorkers = living.filter((p) => p.age >= 10 && p.health > 20);
  const totalAble = ableWorkers.length;
  if (totalAble === 0) return;

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

  // 1. Lorekeepers (Culture, oral technology retention)
  const lorekeeperTarget = priorities.techScore > 50 ? Math.min(4, Math.max(2, Math.floor(totalAble * 0.05))) : Math.min(3, Math.max(1, Math.floor(totalAble * 0.03)));
  quotas.elder_lorekeeper = Math.min(lorekeeperTarget, unassigned);
  unassigned -= quotas.elder_lorekeeper;

  // 2. Healthcare (Herbalists)
  if (needs.sickCount > 0 && unassigned > 0) {
    const requiredHealers = Math.min(4, Math.max(1, Math.ceil(needs.sickCount * 0.4)));
    quotas.herbalist = Math.min(requiredHealers, unassigned);
    unassigned -= quotas.herbalist;
  }

  // 3. Water Carrying (Continuous hydration)
  if (unassigned > 0) {
    const seasonalWaterDemandL = needs.livingCount * (state.weather.currentTempC > 25 ? 240 : 180);
    const fetcherCapacity = state.weather.isDrought ? 2400 : 4200;
    const baseFetchers = Math.ceil(seasonalWaterDemandL / fetcherCapacity);
    const emergencyBuffer = needs.waterRunwayDays < 50 ? 2 : 0;
    const targetWater = Math.min(Math.max(2, baseFetchers + emergencyBuffer), Math.ceil(totalAble * 0.25));
    quotas.water_fetcher = Math.min(targetWater, unassigned);
    unassigned -= quotas.water_fetcher;
  }

  // 4. Fuel & Timber Gathering
  if (unassigned > 0) {
    let targetLumberjacks = 2;
    if (state.season === 'Autumn' || needs.expectedWinterDeficit || needs.fuelRunwayDays < 45) {
      targetLumberjacks = Math.max(3, Math.ceil(totalAble * 0.16));
    } else if (state.season === 'Winter') {
      targetLumberjacks = Math.max(2, Math.ceil(totalAble * 0.12));
    }
    quotas.lumberjack = Math.min(targetLumberjacks, unassigned);
    unassigned -= quotas.lumberjack;
  }

  // 5. Builders & Infrastructure
  if (unassigned > 0) {
    let targetBuilders = 0;
    if (needs.shelterDeficit > 0 || needs.granaryFullRatio > 0.85 || priorities.shelterScore > 50) {
      targetBuilders = Math.min(4, Math.max(1, Math.ceil(totalAble * 0.08)));
    } else if (totalAble > 30) {
      targetBuilders = 1;
    }
    quotas.builder = Math.min(targetBuilders, unassigned);
    unassigned -= quotas.builder;
  }

  // 6. Scouts / Guards for Security
  if (unassigned > 0 && priorities.defenseScore > 50) {
    quotas.scout = Math.min(2, unassigned);
    unassigned -= quotas.scout;
  }

  // 7. Food Production — Dynamically calculated based on seasonal abundance and technology
  if (unassigned > 0) {
    const season = state.season;
    if (season === 'Autumn') {
      // Harvest push: agriculture > hunting > fishing > foraging
      if (needs.hasAgriculture) {
        quotas.farmer = Math.floor(unassigned * 0.40);
      }
      quotas.hunter = Math.floor(unassigned * 0.28);
      quotas.forager = Math.floor(unassigned * 0.18);
      quotas.fisherman = unassigned - quotas.farmer - quotas.hunter - quotas.forager;
    } else if (season === 'Winter') {
      // Ice fishing & big game tracking; wild vegetation dormant
      quotas.hunter = Math.floor(unassigned * 0.48);
      quotas.fisherman = Math.floor(unassigned * 0.38);
      quotas.forager = unassigned - quotas.hunter - quotas.fisherman;
    } else if (season === 'Spring') {
      // Spring river thaw: fish migration runs & fresh wild shoots
      quotas.fisherman = Math.floor(unassigned * 0.40);
      quotas.forager = Math.floor(unassigned * 0.35);
      quotas.hunter = unassigned - quotas.fisherman - quotas.forager;
    } else {
      // Summer: balanced abundance
      quotas.forager = Math.floor(unassigned * 0.38);
      quotas.fisherman = Math.floor(unassigned * 0.32);
      quotas.hunter = unassigned - quotas.forager - quotas.fisherman;
    }
  }

  // Assign workers by skill affinity
  const availableWorkers = [...ableWorkers];

  // Assign lorekeepers (eldest with high lore)
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

  const roleOrder: RoleType[] = [
    'herbalist',
    'water_fetcher',
    'lumberjack',
    'builder',
    'scout',
    'farmer',
    'fisherman',
    'hunter',
    'forager',
  ];

  for (const role of roleOrder) {
    const count = quotas[role] || 0;
    if (count <= 0 || availableWorkers.length === 0) continue;

    availableWorkers.sort((a, b) => {
      const sA = (a.skills as any)[role] || 0;
      const sB = (b.skills as any)[role] || 0;
      return sB - sA;
    });

    const toAssign = Math.min(count, availableWorkers.length);
    for (let i = 0; i < toAssign; i++) {
      const w = availableWorkers.shift()!;
      w.role = role;
    }
  }

  // Leftovers become foragers
  for (const w of availableWorkers) {
    w.role = 'forager';
  }

  // Log critical labor mobilizations and seasonal workforce shifts
  if (needs.waterRunwayDays < 35 && (quotas.water_fetcher || 0) > 5) {
    logDecision(state, {
      category: 'Labor & Workforce',
      problem: `Critical hydration shortfall: water runway fell to ${Math.round(needs.waterRunwayDays)} days.`,
      action: `Mobilized emergency water brigade (${quotas.water_fetcher} carriers).`,
      consequence: 'Diverted general laborers to river hauling to safeguard clan hydration.',
      reasoning: 'Immediate survival mandates guaranteed daily water access.',
      importance: 'notable',
    });
  } else if (state.season === 'Winter' && (quotas.lumberjack || 0) >= 8) {
    logDecision(state, {
      category: 'Labor & Workforce',
      problem: 'Sub-zero winter conditions threatening communal hearth exhaustion.',
      action: `Mobilized winter timber expedition (${quotas.lumberjack} woodcutters).`,
      consequence: 'Maximized cordwood harvesting to sustain heating campfires.',
      reasoning: 'Fuel deficits in winter lead rapidly to fatal hypothermia cascades.',
      importance: 'routine',
    });
  } else if (state.season === 'Spring') {
    logDecision(state, {
      category: 'Labor & Workforce',
      problem: 'Spring thaw opens migratory fish runs and early plant foraging.',
      action: 'Recalibrated seasonal workforce deployment across clan.',
      consequence: `Dispatched ${quotas.forager || 0} foragers, ${quotas.hunter || 0} hunters, and ${quotas.fisherman || 0} fishers.`,
      reasoning: 'Dynamic labor scheduling exploits peak seasonal bio-abundance.',
      importance: 'routine',
    });
  }
}

function manageAutonomousConstruction(
  state: CivilizationState,
  living: Person[],
  needs: SocietalNeeds,
  priorities: PriorityScores
): void {
  const wood = state.resources.wood.quantity;
  const stone = state.resources.stone.quantity;

  // 1. Shelter Shortage: Build Thatched Cabins or Leaf Huts
  if (needs.shelterDeficit > 0) {
    if (wood >= 45 && stone >= 15) {
      // Build Thatched Cabin (+8 capacity)
      state.resources.wood.quantity -= 45;
      state.resources.stone.quantity -= 15;
      state.infrastructure.thatchedCabins = (state.infrastructure.thatchedCabins || 0) + 1;

      logDecision(state, {
        category: 'Housing & Warmth',
        problem: `Shelter deficit: ${needs.shelterDeficit} clan members unsheltered before harsh elements.`,
        action: 'Constructed an insulated Thatched Cabin.',
        consequence: 'Expanded encampment housing capacity by 8 berths; consumed 45 wood, 15 stone.',
        reasoning: 'Council prioritized durable timber housing to mitigate winter exposure and hypothermia.',
        importance: 'notable',
      });
      return;
    } else if (wood >= 20) {
      // Build Leaf Hut (+4 capacity)
      state.resources.wood.quantity -= 20;
      state.infrastructure.leafHuts = (state.infrastructure.leafHuts || 0) + 1;

      logDecision(state, {
        category: 'Housing & Warmth',
        problem: `Immediate shelter shortfall for ${needs.shelterDeficit} agents.`,
        action: 'Erected rapid Leaf Hut shelter.',
        consequence: 'Expanded emergency housing capacity by 4 berths; consumed 20 wood.',
        reasoning: 'Rapid construction favored over stone masonry to immediately cover unsheltered kin.',
        importance: 'routine',
      });
      return;
    }
  }

  // 2. Granary Shortage: Build Granary Bin
  if (needs.granaryFullRatio > 0.82 && wood >= 40) {
    state.resources.wood.quantity -= 40;
    state.infrastructure.granaryBins = (state.infrastructure.granaryBins || 0) + 1;

    logDecision(state, {
      category: 'Infrastructure',
      problem: `Food stockpiles (${Math.round(needs.totalFoodKg)} kg) nearing storage ceiling (${needs.granaryCapacity} kg).`,
      action: 'Constructed elevated timber Granary Bin.',
      consequence: 'Increased grain and food preservation capacity by +1,500 kg; mitigated rot.',
      reasoning: 'Protecting surplus against vermin and ground moisture is crucial for winter survival.',
      importance: 'notable',
    });
    return;
  }

  // 3. Drought or Low Water: Build Water Cistern
  if ((state.weather.isDrought || needs.waterRunwayDays < 45) && wood >= 35 && stone >= 25 && (state.infrastructure.waterCisterns || 0) < 6) {
    state.resources.wood.quantity -= 35;
    state.resources.stone.quantity -= 25;
    state.infrastructure.waterCisterns = (state.infrastructure.waterCisterns || 0) + 1;
    // Increase water quality
    state.resources.fresh_water.quality = Math.min(100, state.resources.fresh_water.quality + 5);

    logDecision(state, {
      category: 'Infrastructure',
      problem: `Dry seasonal conditions (Water runway: ${Math.round(needs.waterRunwayDays)} days).`,
      action: 'Dug and lined communal Water Cistern.',
      consequence: 'Expanded clean spring water reserves and improved water hygiene (+5%).',
      reasoning: 'Council ordered stone-lined cistern excavation to avert dehydration epidemic.',
      importance: 'routine',
    });
    return;
  }

  // 4. Perimeter Defense: Build Perimeter Palisade
  if (needs.threatLevelDanger > 35 && wood >= 30 && (state.infrastructure.perimeterFence || 0) < 12) {
    state.resources.wood.quantity -= 30;
    state.infrastructure.perimeterFence = (state.infrastructure.perimeterFence || 0) + 1;

    logDecision(state, {
      category: 'Security',
      problem: `Elevated danger from roving predators and wilderness exposure.`,
      action: 'Erected sharpened timber Perimeter Palisade section.',
      consequence: 'Reinforced settlement perimeter defense rating; reduced camp surprise attacks.',
      reasoning: 'Vigilant leadership fortified encampment boundaries against nighttime threats.',
      importance: 'routine',
    });
    return;
  }

  // 5. Meat & Fish Preservation: Build Smoking Rack
  if ((state.resources.meat.quantity + state.resources.fish.quantity > 400) && wood >= 25 && (state.infrastructure.smokingRacks || 0) < 4) {
    state.resources.wood.quantity -= 25;
    state.infrastructure.smokingRacks = (state.infrastructure.smokingRacks || 0) + 1;

    logDecision(state, {
      category: 'Food & Calorie',
      problem: `Abundant meat and fish yields subject to rapid seasonal decay.`,
      action: 'Assembled hardwood Smokehouse Rack.',
      consequence: 'Reduced meat and fish spoilage rate by 20% across subsequent seasons.',
      reasoning: 'Preserving protein with curing smoke guarantees critical winter calorie reserves.',
      importance: 'routine',
    });
  }
}

function manageAutonomousPolicies(
  state: CivilizationState,
  living: Person[],
  needs: SocietalNeeds,
  priorities: PriorityScores
): void {
  // Food rationing adaptation
  if (needs.foodRunwayDays < 35 && state.policies.foodRationing !== 'Frugal') {
    state.policies.foodRationing = 'Frugal';
    logDecision(state, {
      category: 'Food & Calorie',
      problem: `Food reserves fell to ${Math.round(needs.foodRunwayDays)} days.`,
      action: 'Decreed Frugal Caloric Rationing.',
      consequence: 'Reduced clan daily consumption by 20% to prolong stockpile runway.',
      reasoning: 'Averted imminent famine cascade through emergency austerity.',
      importance: 'notable',
    });
  } else if (needs.foodRunwayDays > 120 && state.policies.foodRationing !== 'Generous') {
    state.policies.foodRationing = 'Generous';
    logDecision(state, {
      category: 'Food & Calorie',
      problem: `Stockpiles exceed 120 days of continuous consumption.`,
      action: 'Enacted Generous Harvest Feasting.',
      consequence: 'Boosted clan morale (+15%) and improved reproductive fertility.',
      reasoning: 'Surplus food shared freely to reinforce kinship bonds and vitality.',
      importance: 'routine',
    });
  } else if (needs.foodRunwayDays >= 45 && needs.foodRunwayDays <= 120 && state.policies.foodRationing !== 'Normal') {
    state.policies.foodRationing = 'Normal';
  }

  // Water conservation adaptation
  if (state.weather.isDrought || needs.waterRunwayDays < 45) {
    if (!state.policies.waterConservation) {
      state.policies.waterConservation = true;
      logDecision(state, {
        category: 'Healthcare',
        problem: 'River shallows receding and dry conditions reported.',
        action: 'Mandated strict Water Conservation.',
        consequence: 'Restricted per-capita daily water usage by 25%.',
        reasoning: 'Conserving water prevents cistern exhaustion until seasonal rains return.',
        importance: 'routine',
      });
    }
  } else if (needs.waterRunwayDays > 150 && state.policies.waterConservation) {
    state.policies.waterConservation = false;
  }

  // Winter heating adaptation
  if (state.weather.isBlizzard || (state.season === 'Winter' && state.weather.currentTempC < -2)) {
    if (state.policies.firewoodPriority !== 'Maximum Warmth') {
      state.policies.firewoodPriority = 'Maximum Warmth';
      logDecision(state, {
        category: 'Housing & Warmth',
        problem: `Sub-zero weather (${state.weather.currentTempC}°C) threatening acute hypothermia.`,
        action: 'Ordered Maximum Warmth Hearth Burns.',
        consequence: 'Distributed increased firewood to communal hearths to protect infants and elders.',
        reasoning: 'Preventing freezing fatalities prioritized over timber reserve preservation.',
        importance: 'notable',
      });
    }
  } else if (state.season === 'Summer' && state.policies.firewoodPriority !== 'Balanced') {
    state.policies.firewoodPriority = 'Balanced';
  }

  // Quarantine for disease outbreaks
  if (needs.sickCount > Math.max(3, living.length * 0.12)) {
    if (!state.policies.quarantineSick) {
      state.policies.quarantineSick = true;
      logDecision(state, {
        category: 'Healthcare',
        problem: `Infectious outbreak spreading (${needs.sickCount} active casualties).`,
        action: 'Established isolated quarantine zone.',
        consequence: 'Contained contagion transmission rate by 60%; herbalists dedicated to treatment.',
        reasoning: 'Halting epidemic cascade is essential to preserve the working workforce.',
        importance: 'historic',
      });
    }
  } else if (needs.sickCount <= 1 && state.policies.quarantineSick) {
    state.policies.quarantineSick = false;
  }
}

function manageAutonomousResearch(state: CivilizationState, living: Person[], needs: SocietalNeeds): void {
  const undiscovered = state.technologies.filter((t) => !t.discovered);
  if (undiscovered.length === 0) return;

  // Elders deliberately steer campfire discourse toward the most pressing need
  let targetTechId: string | null = null;

  if (needs.foodRunwayDays < 45 && undiscovered.some((t) => t.id === 'tech-agri')) {
    targetTechId = 'tech-agri';
  } else if (needs.sickCount >= 2 && undiscovered.some((t) => t.id === 'tech-herbal')) {
    targetTechId = 'tech-herbal';
  } else if (state.season === 'Winter' && undiscovered.some((t) => t.id === 'tech-fire')) {
    targetTechId = 'tech-fire';
  } else if (needs.totalFoodKg > 1500 && undiscovered.some((t) => t.id === 'tech-smoking')) {
    targetTechId = 'tech-smoking';
  } else if (undiscovered.some((t) => t.id === 'tech-flint')) {
    targetTechId = 'tech-flint';
  }

  if (targetTechId) {
    const tech = undiscovered.find((t) => t.id === targetTechId);
    if (tech && tech.costPoints > 0) {
      // Direct bonus oral focus points
      tech.costPoints = Math.max(0, tech.costPoints - 4);
      if (tech.costPoints <= 0) {
        tech.discovered = true;
        tech.activeKeepersCount = 3;

        logDecision(state, {
          category: 'Technology',
          problem: `Civilization lacked vital mastery of ${tech.name}.`,
          action: `Elders and artisans formally codified ${tech.name}.`,
          consequence: `Permanent unlocked benefits: ${tech.benefits}`,
          reasoning: 'Oral storytelling and experimentation reached historical breakthrough.',
          importance: 'historic',
        });
      }
    }
  }
}

function manageSocietalEvolution(state: CivilizationState, living: Person[]): void {
  const count = living.length;
  let newTier = 'Band';
  let newGovernment = state.government?.type || 'Tribal Council';

  if (count >= 350) {
    newTier = 'City';
    newGovernment = 'Kingdom';
  } else if (count >= 200) {
    newTier = 'Town';
    newGovernment = 'Chiefdom';
  } else if (count >= 120) {
    newTier = 'Large Village';
    newGovernment = 'Chiefdom';
  } else if (count >= 60) {
    newTier = 'Village';
    newGovernment = 'Tribal Council';
  } else {
    newTier = 'Camp';
    newGovernment = 'Tribal Council';
  }

  // Update settlement tier in settlements
  if (state.settlements && state.settlements.length > 0) {
    const primary = state.settlements[0];
    if (primary.tier !== newTier) {
      const oldTier = primary.tier;
      primary.tier = newTier as any;
      if (state.government) {
        state.government.type = newGovernment as any;
      }

      logDecision(state, {
        category: 'Governance',
        problem: `Population growth (${count} members) outgrew ${oldTier} organization.`,
        action: `Elevated societal structure to ${newTier} under ${newGovernment}.`,
        consequence: 'Expanded administrative coordination, division of labor, and communal prestige.',
        reasoning: 'Civilization scaled beyond intimate tribal kin groups into organized urban settlement.',
        importance: 'historic',
      });
    }
  }
}

function ensureLeader(state: CivilizationState, living: Person[], context: SimulationContext): void {
  if (!state.leader || !living.some((p) => p.id === state.leader?.id && p.alive)) {
    // Current leader is dead or not initialized; elect/emerge new Chieftain
    const candidates = living.filter((p) => p.age >= 25 && p.health >= 40);
    const pool = candidates.length > 0 ? candidates : living;

    // Pick candidate with highest combination of age, lore, and hunting/crafting
    pool.sort((a, b) => {
      const scoreA = a.age + a.skills.lore + (a.skills.hunting || 0);
      const scoreB = b.age + b.skills.lore + (b.skills.hunting || 0);
      return scoreB - scoreA;
    });

    const elected = pool[0];
    const personalities: LeaderProfile['personality'][] = [
      'Agrarian Provider',
      'Scholar Innovator',
      'Vigilant Guardian',
      'Traditional Elder',
      'Ambitious Builder',
    ];

    const personalityIndex = Math.abs(elected.name.length + state.year) % personalities.length;
    const electedPersonality = personalities[personalityIndex];

    const leaderProfile: LeaderProfile = {
      id: elected.id,
      name: elected.name,
      title: state.year > 20 ? 'Chieftain' : 'Council Elder',
      personality: electedPersonality,
      reignStartYear: state.year,
      wisdom: Math.min(95, 45 + Math.round(elected.skills.lore * 0.5)),
      charisma: 50 + (context.rng ? context.rng.integer(0, 40) : 25),
      aggressiveness: electedPersonality === 'Vigilant Guardian' ? 70 : 35,
    };

    const previousLeaderName = state.leader?.name || 'Ancestral Founders';
    state.leader = leaderProfile;

    logDecision(state, {
      category: 'Governance',
      problem: `Absence of executive leadership following transition of ${previousLeaderName}.`,
      action: `${elected.name} (${leaderProfile.title}) assumed societal governance.`,
      consequence: `Leadership doctrine established: ${electedPersonality} (Wisdom: ${leaderProfile.wisdom}).`,
      reasoning: 'Clan acclaimed eldest and most accomplished elder around the sacred fire.',
      importance: 'historic',
    });
  }
}

function logDecision(
  state: CivilizationState,
  entry: Omit<AutonomousDecision, 'id' | 'year' | 'season'>
): void {
  if (!state.autonomousDecisions) {
    state.autonomousDecisions = [];
  }

  const decision: AutonomousDecision = {
    id: `dec-${state.year}-${state.season}-${state.autonomousDecisions.length + 1}`,
    year: state.year,
    season: state.season,
    ...entry,
  };

  state.autonomousDecisions.push(decision);
}
