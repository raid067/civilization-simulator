export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type RoleType =
  | 'forager'
  | 'hunter'
  | 'farmer'
  | 'water_fetcher'
  | 'lumberjack'
  | 'stonecutter'
  | 'builder'
  | 'herbalist'
  | 'toolmaker'
  | 'scout'
  | 'idle_child'
  | 'elder_lorekeeper';

export interface Person {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  alive: boolean;
  health: number; // 0 - 100
  hunger: number; // 0 - 100 (100 is starving)
  thirst: number; // 0 - 100 (100 is severe dehydration)
  fatigue: number; // 0 - 100
  temperature: number; // °C (35.0 - 39.0)
  mentalState: number; // 0 - 100 (sanity/morale)
  injuries: string[];
  diseases: string[];
  nutrition: number; // 0 - 100
  shelterQuality: number; // 0 - 100
  clothingQuality: number; // 0 - 100
  warmth: number; // 0 - 100
  safety: number; // 0 - 100
  role: RoleType;
  skills: {
    hunting: number;
    foraging: number;
    farming: number;
    stonecraft: number;
    woodcraft: number;
    healing: number;
    lore: number;
  };
  relationships: {
    partnerId?: string;
    parentIds: string[];
    childrenIds: string[];
  };
  causeOfDeath?: string;
  deathYear?: number;
  deathSeason?: Season;
}

export type ResourceId =
  | 'wood'
  | 'timber'
  | 'stone'
  | 'bone'
  | 'plants'
  | 'meat'
  | 'fish'
  | 'fruit'
  | 'grains'
  | 'fresh_water'
  | 'salt'
  | 'clay'
  | 'ores'
  | 'fuel'
  | 'fibers'
  | 'animals';

export interface ResourceState {
  id: ResourceId;
  name: string;
  category: 'renewable' | 'non_renewable';
  quantity: number; // current stockpile in camp
  worldReserve: number; // available in surrounding nature
  regenerationRatePerYear: number;
  quality: number; // 0 - 100%
  location: string;
  accessibility: number; // 0 - 100%
  seasonality: Record<Season, number>; // multiplier e.g. Winter food 0.3x
  unit: string;
  spoilageRatePerSeason: number; // fraction e.g. 0.15
}

export interface RegionZone {
  id: string;
  name: string;
  description: string;
  terrainType: 'River Valley' | 'Deep Forest' | 'Mountain Ridge' | 'Plains' | 'Coastline' | 'Arid Foothills';
  distanceKm: number;
  primaryResources: string[];
  dangerLevel: number; // 0 - 100
  accessibility: number; // 0 - 100
  explored: boolean;
}

export interface SettlementInfrastructure {
  leafHuts: number; // capacity 4 each
  thatchedCabins: number; // capacity 6 each
  granaryBins: number; // stores grain/nuts
  waterCisterns: number; // stores L of fresh water
  smokingRacks: number; // preserves meat/fish
  toolWorkBench: number; // boosts crafting speed
  perimeterFence: number; // boosts safety against beasts
}

export interface GenerationalKnowledgeTech {
  id: string;
  name: string;
  era: 'Paleolithic' | 'Mesolithic' | 'Neolithic' | 'Copper Age';
  description: string;
  costPoints: number;
  discovered: boolean;
  activeKeepersCount: number; // How many living members carry this lore!
  benefits: string;
}

export interface WeatherCondition {
  currentTempC: number;
  isRaining: boolean;
  isDrought: boolean;
  isBlizzard: boolean;
  isStorm: boolean;
  forecastReliabilityPercent: number;
}

export interface CrisisEvent {
  id: string;
  year: number;
  season: Season;
  title: string;
  severity: 'mild' | 'moderate' | 'severe' | 'catastrophic';
  description: string;
  cascadeChain: string[];
  resolved: boolean;
}

export type ThreatLevel = 'Safe' | 'Concern' | 'Crisis' | 'Catastrophic';

export interface YearlyResourceReport {
  year: number;
  population: {
    current: number;
    births: number;
    deaths: number;
    migration: number;
    lifeExpectancy: number;
    infantMortality: number;
  };
  food: {
    productionKg: number;
    consumptionKg: number;
    storageKg: number;
    surplusDeficitKg: number;
  };
  water: {
    supplyL: number;
    consumptionL: number;
    qualityPercent: number;
  };
  materials: {
    wood: number;
    stone: number;
    metals: number;
    otherResources: number;
  };
  energy: {
    productionFuel: number;
    consumptionFuel: number;
    mainEnergySources: string;
  };
  infrastructure: {
    homes: number;
    farmsHectares: number;
    roadsKm: number;
    workshops: number;
    storageCapacityKg: number;
  };
  health: {
    diseaseRatePercent: number;
    injuriesActive: number;
    healthcareRating: string;
    mortalityRatePercent: number;
  };
  economy: {
    productionUnits: number;
    tradeVolume: number;
    barterValueIndex: number;
    wealthScore: number;
    employmentPercent: number;
  };
  environment: {
    forestCoveragePercent: number;
    soilQualityPercent: number;
    wildlifeAbundancePercent: number;
    pollutionLevelPercent: number;
  };
  threatLevel: ThreatLevel;
  notableHappenings: string[];
  aiChronicle?: {
    saga: string;
    councilDeliberation: string;
    strategicAdvice: string[];
  };
}

export interface CivilizationState {
  year: number;
  season: Season;
  dayOfYear: number;
  people: Person[];
  resources: Record<ResourceId, ResourceState>;
  regions: RegionZone[];
  infrastructure: SettlementInfrastructure;
  technologies: GenerationalKnowledgeTech[];
  weather: WeatherCondition;
  crises: CrisisEvent[];
  annualReports: YearlyResourceReport[];
  accumulatedAnnualProduction: {
    foodKg: number;
    waterL: number;
    woodUnits: number;
    stoneUnits: number;
    fuelUnits: number;
  };
  accumulatedAnnualConsumption: {
    foodKg: number;
    waterL: number;
    fuelUnits: number;
  };
  annualBirths: number;
  annualDeaths: number;
  policies: {
    foodRationing: 'Frugal' | 'Normal' | 'Generous';
    waterConservation: boolean;
    firewoodPriority: 'Minimum' | 'Balanced' | 'Maximum Warmth';
    quarantineSick: boolean;
    explorationAggression: 'Cautious' | 'Moderate' | 'Daring';
    teachingFocus: 'Survival' | 'Crafting' | 'Healing' | 'Exploration';
  };
}
