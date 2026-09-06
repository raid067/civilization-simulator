export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type EraType = 
  | 'Paleolithic'
  | 'Mesolithic'
  | 'Neolithic'
  | 'Copper Age'
  | 'Bronze Age'
  | 'Iron Age'
  | 'Classical'
  | 'Medieval'
  | 'Renaissance'
  | 'Early Modern'
  | 'Industrial'
  | 'Modern'
  | 'Information';

export type SettlementTier = 
  | 'Camp'
  | 'Village'
  | 'Large Village'
  | 'Town'
  | 'City'
  | 'Capital'
  | 'Metropolis';

export type GovernmentType = 
  | 'Tribal Council'
  | 'Chiefdom'
  | 'Monarchy'
  | 'Kingdom'
  | 'Republic'
  | 'Empire'
  | 'Theocracy'
  | 'City-State';

export type SocialClass = 
  | 'Slave'
  | 'Laborer'
  | 'Farmer'
  | 'Hunter'
  | 'Craftsperson'
  | 'Merchant'
  | 'Soldier'
  | 'Priest'
  | 'Scholar'
  | 'Noble'
  | 'Administrator'
  | 'Ruler';

export type PersonalityTrait = 
  | 'ambitious'
  | 'cautious'
  | 'aggressive'
  | 'peaceful'
  | 'curious'
  | 'loyal'
  | 'rebellious'
  | 'generous'
  | 'selfish'
  | 'intelligent'
  | 'disciplined'
  | 'charismatic'
  | 'traditionalist'
  | 'innovative'
  | 'brave'
  | 'cowardly'
  | 'patient'
  | 'impulsive';

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
  | 'elder_lorekeeper'
  | 'soldier'
  | 'merchant'
  | 'priest'
  | 'scholar'
  | 'craftsperson'
  | 'miner'
  | 'fisherman'
  | 'potter'
  | 'weaver'
  | 'sailor'
  | 'administrator';

export interface Family {
  id: string;
  name: string;
  members: string[];
  patriarchId?: string;
  matriarchId?: string;
  wealth: number;
  reputation: number;
  socialClass: SocialClass;
  generation: number;
  foundedYear: number;
}

export interface Person {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  alive: boolean;
  health: number;
  hunger: number;
  thirst: number;
  fatigue: number;
  temperature: number;
  mentalState: number;
  injuries: string[];
  diseases: string[];
  nutrition: number;
  shelterQuality: number;
  clothingQuality: number;
  warmth: number;
  safety: number;
  role: RoleType;
  skills: {
    hunting: number;
    foraging: number;
    farming: number;
    stonecraft: number;
    woodcraft: number;
    healing: number;
    lore: number;
    combat?: number;
    crafting?: number;
    trading?: number;
    leadership?: number;
    fishing?: number;
    mining?: number;
  };
  relationships: {
    partnerId?: string;
    parentIds: string[];
    childrenIds: string[];
    friendIds?: string[];
    enemyIds?: string[];
  };
  personality?: PersonalityTrait[];
  socialClass?: SocialClass;
  familyId?: string;
  education?: number;
  wealth?: number;
  loyalty?: number;
  happiness?: number;
  birthplace?: string;
  currentSettlementId?: string;
  causeOfDeath?: string;
  deathYear?: number;
  deathSeason?: Season;
  achievements?: string[];
  memories?: string[];
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
  | 'animals'
  | 'copper'
  | 'bronze'
  | 'iron'
  | 'gold'
  | 'silver'
  | 'cloth'
  | 'tools'
  | 'weapons'
  | 'pottery'
  | 'luxury_goods';

export interface ResourceState {
  id: ResourceId;
  name: string;
  category: 'renewable' | 'non_renewable' | 'manufactured';
  quantity: number;
  worldReserve: number;
  regenerationRatePerYear: number;
  quality: number;
  location: string;
  accessibility: number;
  seasonality: Record<Season, number>;
  unit: string;
  spoilageRatePerSeason: number;
  price?: number; // Dynamic market price
}

export interface RegionZone {
  id: string;
  name: string;
  description: string;
  terrainType: 'River Valley' | 'Deep Forest' | 'Mountain Ridge' | 'Plains' | 'Coastline' | 'Arid Foothills' | 'Desert' | 'Tundra' | 'Swamp' | 'Hills';
  distanceKm: number;
  primaryResources: string[];
  dangerLevel: number;
  accessibility: number;
  explored: boolean;
  owner?: string; // Civilization ID
  population?: number;
  settlements?: string[]; // Settlement IDs
}

export interface Building {
  id: string;
  type: string;
  name: string;
  condition: number; // 0-100
  capacity: number;
  occupants: string[]; // Person IDs
  constructionYear: number;
  maintenanceCost: number;
  effects: Record<string, number>; // Bonuses provided
}

export interface SettlementInfrastructure {
  leafHuts: number;
  thatchedCabins: number;
  granaryBins: number;
  waterCisterns: number;
  smokingRacks: number;
  toolWorkBench: number;
  perimeterFence: number;
  buildings?: Building[];
}

export interface Settlement {
  id: string;
  name: string;
  regionId: string;
  tier: SettlementTier;
  population: number;
  families: string[]; // Family IDs
  buildings: Building[];
  infrastructure: SettlementInfrastructure;
  food: number;
  water: number;
  wealth: number;
  health: number;
  happiness: number;
  loyalty: number;
  defense: number;
  culture: number;
  technology: number;
  government: GovernmentType;
  leaderId?: string;
  foundedYear: number;
  specialization?: string;
  tradeRoutes: TradeRoute[];
}

export interface TradeRoute {
  id: string;
  origin: string; // Settlement ID
  destination: string; // Settlement ID or civilization ID
  goods: ResourceId;
  quantity: number;
  frequency: 'daily' | 'weekly' | 'seasonal' | 'yearly';
  active: boolean;
  risk: number; // 0-100
  profit: number;
}

export interface GenerationalKnowledgeTech {
  id: string;
  name: string;
  era: EraType;
  category?: 'agriculture' | 'construction' | 'military' | 'medicine' | 'science' | 'industry' | 'culture' | 'navigation';
  description: string;
  costPoints: number;
  discovered: boolean;
  researched?: boolean;
  mastered?: boolean;
  activeKeepersCount: number;
  prerequisites?: string[]; // Tech IDs required
  benefits: string;
  effects?: Record<string, number>;
}

export interface WeatherCondition {
  currentTempC: number;
  isRaining: boolean;
  isDrought: boolean;
  isBlizzard: boolean;
  isStorm: boolean;
  precipitationMm?: number;
  windSpeed?: number;
  forecastReliabilityPercent: number;
}

export interface ClimateState {
  averageTemp: number;
  rainfallPattern: 'normal' | 'wet' | 'dry';
  trend: 'warming' | 'cooling' | 'stable';
  decade: number;
}

export interface DisasterEvent {
  id: string;
  type: 'drought' | 'flood' | 'earthquake' | 'wildfire' | 'volcanic' | 'storm' | 'blizzard' | 'epidemic' | 'famine' | 'plague';
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  startYear: number;
  endYear?: number;
  affectedRegions: string[];
  affectedSettlements: string[];
  casualties: number;
  damage: number;
  description: string;
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
  effects?: Record<string, number>;
}

export interface PoliticalFaction {
  id: string;
  name: string;
  ideology: string;
  leaderId?: string;
  members: string[]; // Person IDs
  influence: number; // 0-100
  goals: string[];
  satisfaction: number; // 0-100
}

export interface Law {
  id: string;
  name: string;
  description: string;
  enactedYear: number;
  active: boolean;
  effects: Record<string, number>;
  support: number; // 0-100
}

export interface Government {
  type: GovernmentType;
  rulerId?: string;
  legitimacy: number; // 0-100
  stability: number; // 0-100
  corruption: number; // 0-100
  administrativeCapacity: number;
  factions: PoliticalFaction[];
  laws: Law[];
  taxRate: number; // Percentage
  treasury: number;
}

export interface Culture {
  name: string;
  traditions: string[];
  values: string[];
  language: string;
  art: string[];
  festivals: string[];
  identity: number; // 0-100 cohesion
  spread: number; // Number of adherents
}

export interface Religion {
  name: string;
  beliefs: string[];
  rituals: string[];
  holySites: string[];
  clergy: string[]; // Person IDs
  influence: number; // 0-100
  adherents: number;
  tolerance: number; // 0-100
}

export type NationalFocusType = 
  | 'balanced'
  | 'food_security'
  | 'defense'
  | 'technology'
  | 'expansion'
  | 'ecological';

export interface AutonomousDecision {
  id: string;
  year: number;
  season: Season;
  category: 'Food & Calorie' | 'Housing & Warmth' | 'Infrastructure' | 'Healthcare' | 'Technology' | 'Security' | 'Governance' | 'Labor & Workforce' | 'Migration';
  problem: string;
  action: string;
  consequence: string;
  reasoning: string;
  importance: 'routine' | 'notable' | 'historic';
}

export interface LeaderProfile {
  id: string;
  name: string;
  title: string;
  personality: 'Agrarian Provider' | 'Scholar Innovator' | 'Vigilant Guardian' | 'Traditional Elder' | 'Ambitious Builder';
  reignStartYear: number;
  wisdom: number;
  charisma: number;
  aggressiveness: number;
}

export interface Civilization {
  id?: string;
  name?: string;
  seed?: number;
  year: number;
  era?: EraType;
  population?: number;
  dayOfYear?: number;
  settlements?: Settlement[];
  regions: RegionZone[];
  resources: Record<string, ResourceState>;
  technologies: GenerationalKnowledgeTech[];
  infrastructure: SettlementInfrastructure;
  government?: Government;
  culture?: Culture;
  religion?: Religion;
  economy?: EconomyState;
  military?: MilitaryState;
  environment?: EnvironmentState;
  climate?: ClimateState;
  disasters?: DisasterEvent[];
  crises: CrisisEvent[];
  history?: HistoricalEvent[];
  relations?: DiplomaticRelation[];
  weather: WeatherCondition;
  policies: PolicySet;
  people: Person[];
  season: Season;
  annualBirths: number;
  annualDeaths: number;
  annualImmigration?: number;
  lastYearBirths?: number;
  lastYearDeaths?: number;
  lastYearImmigration?: number;
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
  annualReports: YearlyResourceReport[];
  nationalFocus?: NationalFocusType;
  autonomousDecisions?: AutonomousDecision[];
  leader?: LeaderProfile;
}

export interface EconomyState {
  currency: string;
  moneySupply: number;
  inflation: number; // Percentage
  gdp: number;
  production: number;
  consumption: number;
  tradeBalance: number;
  debt: number;
  wealthDistribution: {
    bottom20: number;
    middle60: number;
    top20: number;
  };
}

export interface MilitaryState {
  totalTroops: number;
  armies: Army[];
  strength: number;
  morale: number;
  equipment: number;
  wars: War[];
}

export interface Army {
  id: string;
  name: string;
  size: number;
  composition: Record<string, number>; // Unit types and counts
  location: string; // Region or settlement ID
  commanderId?: string;
  morale: number;
  supplies: number;
  experience: number;
}

export interface War {
  id: string;
  aggressor: string; // Civilization ID
  defender: string;
  startYear: number;
  endYear?: number;
  cause: string;
  battles: Battle[];
  casualties: {
    aggressor: number;
    defender: number;
  };
  territoryChanges: string[];
  outcome?: string;
  treaty?: string;
}

export interface Battle {
  id: string;
  year: number;
  location: string;
  aggressorForces: number;
  defenderForces: number;
  aggressorCasualties: number;
  defenderCasualties: number;
  winner: 'aggressor' | 'defender' | 'draw';
  description: string;
}

export interface EnvironmentState {
  forestCoverage: number; // Percentage
  soilQuality: number; // 0-100
  waterAvailability: number; // 0-100
  wildlife: number; // 0-100
  pollution: number; // 0-100
  biodiversity: number; // 0-100
  erosion: number; // 0-100
}

export interface DiplomaticRelation {
  civilizationId: string;
  civilizationName: string;
  relationship: 'hostile' | 'tense' | 'neutral' | 'friendly' | 'allied' | 'vassal';
  tradeAgreement: boolean;
  alliance: boolean;
  nonAggressionPact: boolean;
  war: boolean;
  trust: number; // 0-100
  history: string[];
}

export interface HistoricalEvent {
  id: string;
  year: number;
  season?: Season;
  type: HistoricalEventType;
  title: string;
  description: string;
  importance: number; // 1-10
  location?: string;
  people?: string[];
  civilizations?: string[];
  causes?: string[];
  consequences?: string[];
}

export type HistoricalEventType =
  | 'birth'
  | 'death'
  | 'discovery'
  | 'invention'
  | 'war_start'
  | 'war_end'
  | 'battle'
  | 'treaty'
  | 'settlement_founded'
  | 'settlement_growth'
  | 'disaster'
  | 'leader_change'
  | 'technology'
  | 'migration'
  | 'trade_route'
  | 'cultural'
  | 'religious'
  | 'economic'
  | 'political'
  | 'environmental';

export type CivilizationState = Civilization;

export interface PolicySet {
  foodRationing: 'Frugal' | 'Normal' | 'Generous';
  waterConservation: boolean;
  firewoodPriority: 'Minimum' | 'Balanced' | 'Maximum Warmth';
  quarantineSick: boolean;
  explorationAggression: 'Cautious' | 'Moderate' | 'Daring';
  teachingFocus: 'Survival' | 'Crafting' | 'Healing' | 'Exploration';
  taxation?: 'Low' | 'Medium' | 'High';
  militaryService?: 'Volunteer' | 'Conscription' | 'Professional';
  tradePolicy?: 'Isolationist' | 'Balanced' | 'Expansionist';
  immigration?: 'Closed' | 'Restricted' | 'Open';
  autonomyEnabled?: boolean;
}

export interface YearlyResourceReport {
  year: number;
  population: {
    current: number;
    births: number;
    deaths: number;
    migration: number;
    lifeExpectancy: number;
    infantMortality: number;
    ageDistribution?: Record<string, number>;
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
    inflation?: number;
  };
  environment: {
    forestCoveragePercent: number;
    soilQualityPercent: number;
    wildlifeAbundancePercent: number;
    pollutionLevelPercent: number;
  };
  politics?: {
    stability: number;
    legitimacy: number;
    factionPower: Record<string, number>;
  };
  military?: {
    armySize: number;
    strength: number;
    casualties: number;
    wars: number;
  };
  threatLevel: ThreatLevel;
  notableHappenings: string[];
  era?: EraType;
  aiChronicle?: {
    saga: string;
    councilDeliberation: string;
    strategicAdvice: string[];
  };
}

export type ThreatLevel = 'Safe' | 'Concern' | 'Crisis' | 'Catastrophic';

export interface SimulationConfig {
  baseBirthRate: number;
  baseDeathRate: number;
  baseMigrationRate: number;
  foodConsumptionPerPerson: number;
  waterConsumptionPerPerson: number;
  housingCapacityPerBuilding: Record<string, number>;
  technologyCostMultiplier: number;
  disasterProbability: number;
  warProbability: number;
  tradeProfitMargin: number;
}

export const SIMULATION_CONFIG: SimulationConfig = {
  baseBirthRate: 0.025,
  baseDeathRate: 0.015,
  baseMigrationRate: 0.01,
  foodConsumptionPerPerson: 1.8,
  waterConsumptionPerPerson: 2.5,
  housingCapacityPerBuilding: {
    leafHut: 4,
    thatchedCabin: 6,
    stoneHouse: 8,
    apartment: 4,
    manor: 15,
    palace: 50,
  },
  technologyCostMultiplier: 1.0,
  disasterProbability: 0.08,
  warProbability: 0.05,
  tradeProfitMargin: 0.15,
};
