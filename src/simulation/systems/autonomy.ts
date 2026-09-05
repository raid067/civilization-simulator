import { SimulationContext } from '../context';
import { JobType, ResourceType, BuildingType, TechnologyId } from '../../types';

/**
 * AUTONOMY SYSTEM
 * 
 * This system acts as the "AI Brain" of the civilization.
 * It automatically makes decisions so the player can watch the simulation run without input.
 * 
 * Priorities:
 * 1. Survival (Food, Water, Health)
 * 2. Shelter (Housing)
 * 3. Economic Growth (Tools, Production)
 * 4. Expansion (New Buildings, Settlements)
 * 5. Knowledge (Research)
 * 6. Diplomacy/Military
 */

export function runAutonomySystem(context: SimulationContext): void {
  const { state, rng } = context;
  const { civilization, world } = state;

  // Only run autonomy checks occasionally (e.g., every season) to save performance
  // and prevent erratic rapid changes.
  
  manageLaborForce(context);
  manageConstruction(context);
  manageResearch(context);
  manageGovernmentPolicies(context);
  manageDiplomacyAndWar(context);
}

/**
 * 1. LABOR ALLOCATION
 * Automatically assigns unemployed citizens to critical jobs.
 */
function manageLaborForce(context: SimulationContext): void {
  const { state } = context;
  const { civilization } = state;

  // Calculate needs
  const foodPerPerson = civilization.resources.food / Math.max(1, civilization.population.length);
  const isHungry = foodPerPerson < 10; // Critical threshold
  
  const housingCapacity = civilization.settlements.reduce((acc, s) => acc + s.housingCapacity, 0);
  const isHomeless = civilization.population.length > housingCapacity;

  // Iterate through unemployed people
  const unemployed = civilization.population.filter(p => !p.occupation && p.age >= 14 && p.health > 0.5);

  for (const person of unemployed) {
    let preferredJob: JobType | null = null;

    // Priority 1: Farming if hungry
    if (isHungry) {
      preferredJob = 'Farmer';
    } 
    // Priority 2: Building if homeless
    else if (isHomeless) {
      preferredJob = 'Builder';
    }
    // Priority 3: Basic resource gathering if low stock
    else if (civilization.resources.wood < 50) {
      preferredJob = 'Logger';
    }
    else if (civilization.resources.stone < 50) {
      preferredJob = 'Miner';
    }
    // Priority 4: Fill other gaps
    else {
      // Simple round-robin or random fill for other jobs
      const availableJobs: JobType[] = ['Craftsperson', 'Merchant', 'Soldier', 'Scholar'];
      preferredJob = availableJobs[Math.floor(context.rng.next() * availableJobs.length)];
    }

    if (preferredJob) {
      // Assign job directly in state
      person.occupation = preferredJob;
      // Log event? Maybe too noisy.
    }
  }
}

/**
 * 2. CONSTRUCTION
 * Automatically queues/builds necessary buildings if resources allow.
 */
function manageConstruction(context: SimulationContext): void {
  const { state } = context;
  const { civilization } = state;
  
  // Find primary settlement
  const capital = civilization.settlements[0];
  if (!capital) return;

  const pop = civilization.population.length;
  const housingCap = capital.housingCapacity;
  const foodStock = civilization.resources.food;
  const woodStock = civilization.resources.wood;
  const stoneStock = civilization.resources.stone;

  // Rule: Build houses if population > capacity
  if (pop > housingCap && woodStock >= 20) {
    // Check if already building a house
    const buildingHouse = capital.activeProjects.some(p => p.type === 'Building' && p.buildingType === 'House');
    if (!buildingHouse) {
      capital.activeProjects.push({
        id: `proj_${Date.now()}_${Math.floor(context.rng.next() * 1000)}`,
        type: 'Building',
        buildingType: 'House',
        progress: 0,
        cost: { wood: 20, stone: 0 },
        assignedWorkers: 0
      });
      // Deduct resources immediately or on completion? Let's do on completion for simplicity, 
      // but reserve them logically. For now, just queue.
    }
  }

  // Rule: Build Farm if food is low and we have workers
  const foodPerPerson = foodStock / Math.max(1, pop);
  if (foodPerPerson < 20 && woodStock >= 30) {
    const buildingFarm = capital.activeProjects.some(p => p.type === 'Building' && p.buildingType === 'Farm');
    if (!buildingFarm) {
      capital.activeProjects.push({
        id: `proj_${Date.now()}_${Math.floor(context.rng.next() * 1000)}`,
        type: 'Building',
        buildingType: 'Farm',
        progress: 0,
        cost: { wood: 30, stone: 5 },
        assignedWorkers: 0
      });
    }
  }
}

/**
 * 3. RESEARCH
 * Automatically picks the next technology.
 */
function manageResearch(context: SimulationContext): void {
  const { state } = context;
  const { civilization } = state;

  // If already researching, continue
  if (civilization.currentResearch) return;

  // Find available techs
  const knownTechs = new Set(civilization.technologies);
  
  // Simple priority list for demo purposes
  const techPriority: TechnologyId[] = [
    'Agriculture', 'Pottery', 'Mining', 'Bronze_Working', 'Writing', 'Iron_Working'
  ];

  for (const techId of techPriority) {
    if (!knownTechs.has(techId)) {
      // Check prerequisites (simplified)
      // In a full implementation, check the tech tree graph
      civilization.currentResearch = techId;
      civilization.researchProgress = 0;
      break;
    }
  }
}

/**
 * 4. GOVERNMENT POLICIES
 * Adjusts taxes and laws based on stability.
 */
function manageGovernmentPolicies(context: SimulationContext): void {
  const { state } = context;
  const { government } = state.civilization;

  // If stability is low, lower taxes to appease population
  if (government.stability < 30 && government.taxRate > 0.1) {
    government.taxRate -= 0.01;
  } 
  // If treasury is huge and stability high, raise taxes slightly for surplus
  else if (government.treasury > 1000 && government.stability > 70 && government.taxRate < 0.3) {
    government.taxRate += 0.01;
  }

  // Cap tax rates
  government.taxRate = Math.max(0.05, Math.min(0.5, government.taxRate));
}

/**
 * 5. DIPLOMACY & WAR
 * Simple AI for interacting with other civilizations.
 */
function manageDiplomacyAndWar(context: SimulationContext): void {
  const { state, rng } = context;
  const { civilization, otherCivilizations } = state;

  if (!otherCivilizations || otherCivilizations.length === 0) return;

  for (const other of otherCivilizations) {
    const relation = civilization.relations[other.id] || 50; // Default neutral

    // If relation is very low and we are strong, maybe declare war?
    // If relation is high, maybe propose alliance?
    
    // Simple random drift in relations to simulate organic interaction
    const drift = (rng.next() - 0.5) * 2; // -1 to 1
    civilization.relations[other.id] = Math.max(0, Math.min(100, relation + drift));

    // War Logic
    if (relation < 20 && !civilization.atWar.includes(other.id)) {
      // Chance to declare war if desperate or aggressive
      if (rng.chance(0.05)) { // 5% chance per season when hostile
        civilization.atWar.push(other.id);
        // Add historical event handled by history system
      }
    } else if (relation > 60 && civilization.atWar.includes(other.id)) {
      // Chance to make peace
      if (rng.chance(0.1)) {
        civilization.atWar = civilization.atWar.filter(id => id !== other.id);
      }
    }
  }
}
