import {
  CivilizationState,
  Person,
  RegionZone,
  ResourceId,
  ResourceState,
  RoleType,
  SettlementInfrastructure,
  GenerationalKnowledgeTech,
  Season,
  AutonomousDecision,
  LeaderProfile,
} from '../types';
import { SeededRandom } from './utils/Random';

const FIRST_NAMES_MALE = [
  'Kael', 'Toran', 'Bram', 'Enki', 'Ronak', 'Vael', 'Dak', 'Joran', 'Thul', 'Khor',
  'Oran', 'Brant', 'Galan', 'Korm', 'Zoran', 'Dael', 'Roric', 'Harek', 'Morg', 'Ulan',
  'Torm', 'Kendrik', 'Bael', 'Drak', 'Lorn', 'Vorn', 'Garr', 'Erek', 'Kip', 'Nash',
  'Tarek', 'Jarek', 'Brog', 'Valen', 'Davor', 'Silas', 'Elar', 'Korin', 'Rogan', 'Artek',
  'Hul', 'Zal', 'Karn', 'Branok', 'Geld', 'Oren', 'Malik', 'Torik', 'Jaro', 'Tarn'
];

const FIRST_NAMES_FEMALE = [
  'Mara', 'Sura', 'Osha', 'Naru', 'Tova', 'Dara', 'Kira', 'Lyra', 'Vea', 'Ilka',
  'Shira', 'Rhea', 'Elora', 'Mina', 'Brena', 'Zaya', 'Kessa', 'Rala', 'Sela', 'Vara',
  'Ania', 'Tali', 'Kaia', 'Nesta', 'Yara', 'Mira', 'Vana', 'Iva', 'Kora', 'Lian',
  'Thea', 'Jessa', 'Bria', 'Alba', 'Nila', 'Talia', 'Sena', 'Zula', 'Mirel', 'Kyra',
  'Fiora', 'Leda', 'Orla', 'Nesta', 'Rowa', 'Dalia', 'Hessa', 'Yeva', 'Solan', 'Rina'
];

export function createInitialPeople(rng: SeededRandom): Person[] {
  const people: Person[] = [];

  for (let i = 0; i < 100; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    const nameList = gender === 'male' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    const nameIndex = Math.floor(i / 2) % nameList.length;
    const suffix = i >= 50 ? ` ${['Clan', 'of-River', 'the Elder', 'Hunter', 'Swift', 'Stone'][i % 6]}` : '';
    const name = `${nameList[nameIndex]}${suffix}`;

    // Realistic prehistoric demographic age distribution
    let age: number;
    if (i < 15) {
      age = 3 + rng.integer(0, 8); // 3 - 11 children
    } else if (i < 50) {
      age = 13 + rng.integer(0, 14); // 13 - 27 prime youth
    } else if (i < 85) {
      age = 28 + rng.integer(0, 16); // 28 - 44 experienced adults
    } else {
      age = 45 + rng.integer(0, 11); // 45 - 56 respected elders
    }

    let role: RoleType = 'forager';
    if (age < 10) {
      role = 'idle_child';
    } else if (age >= 48) {
      role = 'elder_lorekeeper';
    } else {
      const adultRoles: RoleType[] = [
        'hunter', 'hunter',
        'forager', 'forager', 'forager',
        'fisherman', 'fisherman',
        'water_fetcher', 'water_fetcher',
        'lumberjack', 'lumberjack',
        'stonecutter',
        'builder', 'builder',
        'herbalist',
        'toolmaker',
        'scout'
      ];
      role = adultRoles[(i - 15) % adultRoles.length];
    }

    people.push({
      id: `p-${i + 1}`,
      name,
      age,
      gender,
      alive: true,
      health: 88 + rng.integer(0, 9),
      hunger: 5 + rng.integer(0, 10),
      thirst: 5 + rng.integer(0, 10),
      fatigue: 10 + rng.integer(0, 15),
      temperature: 36.9 + (rng.next() * 0.4 - 0.2),
      mentalState: 80 + rng.integer(0, 15),
      injuries: rng.chance(0.08) ? ['Flint Scrape'] : [],
      diseases: [],
      nutrition: 85,
      shelterQuality: 45,
      clothingQuality: 45,
      warmth: 80,
      safety: 80,
      role,
      skills: {
        hunting: role === 'hunter' ? 55 + rng.integer(0, 24) : 20 + rng.integer(0, 19),
        foraging: role === 'forager' ? 55 + rng.integer(0, 24) : 25 + rng.integer(0, 19),
        farming: 5,
        stonecraft: role === 'stonecutter' || role === 'toolmaker' ? 50 + rng.integer(0, 24) : 15,
        woodcraft: role === 'lumberjack' || role === 'builder' ? 50 + rng.integer(0, 24) : 15,
        healing: role === 'herbalist' ? 60 + rng.integer(0, 24) : 10,
        lore: role === 'elder_lorekeeper' ? 70 + rng.integer(0, 19) : 15,
        fishing: role === 'fisherman' ? 60 + rng.integer(0, 24) : 20,
      },
      relationships: {
        parentIds: [],
        childrenIds: [],
      },
    });
  }

  // Generate multi-generational family and marital ties
  for (let i = 0; i < 15; i++) {
    const child = people[i];
    const mother = people[16 + (i % 18)];
    const father = people[36 + (i % 18)];
    child.relationships.parentIds = [mother.id, father.id];
    mother.relationships.childrenIds.push(child.id);
    father.relationships.childrenIds.push(child.id);
    mother.relationships.partnerId = father.id;
    father.relationships.partnerId = mother.id;
  }

  // Pair up additional prime adult partners
  const adultFemales = people.filter(p => p.gender === 'female' && p.age >= 18 && p.age <= 44 && !p.relationships.partnerId);
  const adultMales = people.filter(p => p.gender === 'male' && p.age >= 18 && p.age <= 48 && !p.relationships.partnerId);
  for (let i = 0; i < Math.min(adultFemales.length, adultMales.length); i++) {
    adultFemales[i].relationships.partnerId = adultMales[i].id;
    adultMales[i].relationships.partnerId = adultFemales[i].id;
  }

  return people;
}

export function createInitialResources(): Record<string, ResourceState> {
  return {
    wood: {
      id: 'wood',
      name: 'Wood',
      category: 'renewable',
      quantity: 1650,
      worldReserve: 48000,
      regenerationRatePerYear: 2400,
      quality: 85,
      location: 'Valley & Whispering Forest',
      accessibility: 90,
      seasonality: { Spring: 1.0, Summer: 1.1, Autumn: 0.9, Winter: 0.6 },
      unit: 'bundles',
      spoilageRatePerSeason: 0.02,
    },
    timber: {
      id: 'timber',
      name: 'Timber Logs',
      category: 'renewable',
      quantity: 180,
      worldReserve: 12000,
      regenerationRatePerYear: 800,
      quality: 80,
      location: 'Deep Forest',
      accessibility: 75,
      seasonality: { Spring: 1.0, Summer: 1.0, Autumn: 0.9, Winter: 0.5 },
      unit: 'hewn logs',
      spoilageRatePerSeason: 0.01,
    },
    stone: {
      id: 'stone',
      name: 'Field Stone & Flint',
      category: 'non_renewable',
      quantity: 2800,
      worldReserve: 150000,
      regenerationRatePerYear: 0,
      quality: 80,
      location: 'Granite Ridge & River Bed',
      accessibility: 85,
      seasonality: { Spring: 1.0, Summer: 1.0, Autumn: 0.9, Winter: 0.6 },
      unit: 'stones',
      spoilageRatePerSeason: 0.0,
    },
    bone: {
      id: 'bone',
      name: 'Animal Bone',
      category: 'renewable',
      quantity: 240,
      worldReserve: 3000,
      regenerationRatePerYear: 350,
      quality: 75,
      location: 'Camp Stores & Hunting Trails',
      accessibility: 95,
      seasonality: { Spring: 0.9, Summer: 1.0, Autumn: 1.2, Winter: 0.8 },
      unit: 'pieces',
      spoilageRatePerSeason: 0.01,
    },
    plants: {
      id: 'plants',
      name: 'Wild Herbs & Edibles',
      category: 'renewable',
      quantity: 550,
      worldReserve: 8500,
      regenerationRatePerYear: 4200,
      quality: 85,
      location: 'River Meadows',
      accessibility: 90,
      seasonality: { Spring: 1.4, Summer: 1.2, Autumn: 0.8, Winter: 0.2 },
      unit: 'kg',
      spoilageRatePerSeason: 0.20,
    },
    meat: {
      id: 'meat',
      name: 'Raw Game Meat',
      category: 'renewable',
      quantity: 1200,
      worldReserve: 12500,
      regenerationRatePerYear: 3800,
      quality: 90,
      location: 'Hills & Woodlands',
      accessibility: 70,
      seasonality: { Spring: 0.9, Summer: 1.1, Autumn: 1.3, Winter: 0.7 },
      unit: 'kg',
      spoilageRatePerSeason: 0.35, // High spoilage without smoking/salting!
    },
    fish: {
      id: 'fish',
      name: 'River Fish',
      category: 'renewable',
      quantity: 850,
      worldReserve: 9000,
      regenerationRatePerYear: 4500,
      quality: 85,
      location: 'Red River Streams',
      accessibility: 85,
      seasonality: { Spring: 1.2, Summer: 1.3, Autumn: 1.0, Winter: 0.4 },
      unit: 'kg',
      spoilageRatePerSeason: 0.40,
    },
    fruit: {
      id: 'fruit',
      name: 'Wild Berries & Fruits',
      category: 'renewable',
      quantity: 800,
      worldReserve: 6000,
      regenerationRatePerYear: 5000,
      quality: 88,
      location: 'Forest Margin Thickets',
      accessibility: 90,
      seasonality: { Spring: 0.8, Summer: 1.8, Autumn: 1.1, Winter: 0.05 },
      unit: 'kg',
      spoilageRatePerSeason: 0.30,
    },
    grains: {
      id: 'grains',
      name: 'Wild Einkorn & Seeds',
      category: 'renewable',
      quantity: 2400,
      worldReserve: 14000,
      regenerationRatePerYear: 6000,
      quality: 80,
      location: 'Sunken Steppe Plains',
      accessibility: 75,
      seasonality: { Spring: 0.5, Summer: 1.2, Autumn: 1.8, Winter: 0.2 },
      unit: 'kg',
      spoilageRatePerSeason: 0.08, // Relatively stable grain
    },
    fresh_water: {
      id: 'fresh_water',
      name: 'Fresh Spring & River Water',
      category: 'renewable',
      quantity: 32000, // Stored in camp skins/pools
      worldReserve: 5000000, // River volume
      regenerationRatePerYear: 4000000,
      quality: 92,
      location: 'Red River Basin',
      accessibility: 95,
      seasonality: { Spring: 1.2, Summer: 0.9, Autumn: 1.0, Winter: 0.8 },
      unit: 'Liters',
      spoilageRatePerSeason: 0.05,
    },
    salt: {
      id: 'salt',
      name: 'Rock Salt & Brine Crust',
      category: 'non_renewable',
      quantity: 65,
      worldReserve: 18000,
      regenerationRatePerYear: 50,
      quality: 85,
      location: 'Salt Flats (12 km)',
      accessibility: 40,
      seasonality: { Spring: 1.0, Summer: 1.1, Autumn: 1.0, Winter: 0.7 },
      unit: 'kg',
      spoilageRatePerSeason: 0.0,
    },
    clay: {
      id: 'clay',
      name: 'Riverbed Clay',
      category: 'renewable',
      quantity: 420,
      worldReserve: 60000,
      regenerationRatePerYear: 1200,
      quality: 85,
      location: 'Riverbank Mud',
      accessibility: 85,
      seasonality: { Spring: 0.9, Summer: 1.2, Autumn: 1.0, Winter: 0.3 },
      unit: 'kg',
      spoilageRatePerSeason: 0.0,
    },
    ores: {
      id: 'ores',
      name: 'Native Copper & Pyrite',
      category: 'non_renewable',
      quantity: 35,
      worldReserve: 8500,
      regenerationRatePerYear: 0,
      quality: 75,
      location: 'Granite Outcrops (7 km)',
      accessibility: 35,
      seasonality: { Spring: 0.9, Summer: 1.0, Autumn: 0.9, Winter: 0.3 },
      unit: 'kg',
      spoilageRatePerSeason: 0.0,
    },
    fuel: {
      id: 'fuel',
      name: 'Dry Firewood & Peat',
      category: 'renewable',
      quantity: 1850,
      worldReserve: 35000,
      regenerationRatePerYear: 4000,
      quality: 80,
      location: 'Campwood Stockpile',
      accessibility: 90,
      seasonality: { Spring: 1.0, Summer: 1.0, Autumn: 1.1, Winter: 0.5 },
      unit: 'bundles',
      spoilageRatePerSeason: 0.04,
    },
    fibers: {
      id: 'fibers',
      name: 'Plant Reed & Tendon Fibers',
      category: 'renewable',
      quantity: 290,
      worldReserve: 12000,
      regenerationRatePerYear: 2800,
      quality: 80,
      location: 'River Marsh Reeds',
      accessibility: 85,
      seasonality: { Spring: 1.1, Summer: 1.3, Autumn: 1.0, Winter: 0.3 },
      unit: 'spools',
      spoilageRatePerSeason: 0.03,
    },
    animals: {
      id: 'animals',
      name: 'Wild Fauna (Deer, Boar, Hare)',
      category: 'renewable',
      quantity: 1400, // Animal population count in ecosystem
      worldReserve: 1400,
      regenerationRatePerYear: 320,
      quality: 90,
      location: 'Surrounding Biosphere',
      accessibility: 65,
      seasonality: { Spring: 1.3, Summer: 1.1, Autumn: 1.0, Winter: 0.7 },
      unit: 'wild heads',
      spoilageRatePerSeason: 0.0,
    },
  };
}

export function createInitialRegions(): RegionZone[] {
  return [
    {
      id: 'reg-1',
      name: 'Red River Valley (Home Basin)',
      description: 'Lush alluvial terraces providing clean drinking water, river mud, fish shoals, and reed grasses.',
      terrainType: 'River Valley',
      distanceKm: 0,
      primaryResources: ['Fresh Water', 'Fish', 'Clay', 'Fibers'],
      dangerLevel: 15,
      accessibility: 100,
      explored: true,
    },
    {
      id: 'reg-2',
      name: 'Whispering Forest',
      description: 'Dense deciduous woodland filled with game trails, timber oak, wild mushrooms, and dry fallen timber.',
      terrainType: 'Deep Forest',
      distanceKm: 3,
      primaryResources: ['Wood', 'Game Meat', 'Wild Fruit', 'Fuel'],
      dangerLevel: 35,
      accessibility: 85,
      explored: true,
    },
    {
      id: 'reg-3',
      name: 'Granite Crest & Caverns',
      description: 'Steep rocky bluffs rich in flint nodules, natural shelter caves, and exposed metallic veins.',
      terrainType: 'Mountain Ridge',
      distanceKm: 7,
      primaryResources: ['Flint Stone', 'Native Copper', 'Cave Shelter'],
      dangerLevel: 55,
      accessibility: 50,
      explored: false,
    },
    {
      id: 'reg-4',
      name: 'Golden Grasslands',
      description: 'Vast open savanna populated by migratory ungulate herds and wild cereal grasses.',
      terrainType: 'Plains',
      distanceKm: 9,
      primaryResources: ['Wild Grains', 'Large Game', 'Bone'],
      dangerLevel: 40,
      accessibility: 60,
      explored: false,
    },
    {
      id: 'reg-5',
      name: 'Brine Coast & Tidal Flats',
      description: 'Salty delta with sea bird rookeries, oyster beds, and mineral crusts essential for curing meat.',
      terrainType: 'Coastline',
      distanceKm: 14,
      primaryResources: ['Salt', 'Coastal Fish', 'Shells'],
      dangerLevel: 50,
      accessibility: 40,
      explored: false,
    },
  ];
}

export function createInitialTechs(): GenerationalKnowledgeTech[] {
  return [
    {
      id: 'tech-fire',
      name: 'Fire Mastery & Friction Drill',
      era: 'Paleolithic',
      description: 'Ability to start and maintain controlled bonfires for warmth, predator deterrence, and meat roasting.',
      costPoints: 0,
      discovered: true,
      activeKeepersCount: 38,
      benefits: 'Enables fuel burning, prevents hypothermia, halves meat parasite illness.',
    },
    {
      id: 'tech-flint',
      name: 'Flint Biface Knapping',
      era: 'Paleolithic',
      description: 'Shaping sharp handaxes and spear tips from brittle flint and river obsidian.',
      costPoints: 0,
      discovered: true,
      activeKeepersCount: 22,
      benefits: '+35% hunting yield and +25% wood chopping efficiency.',
    },
    {
      id: 'tech-herbal',
      name: 'Herbal Poultices & Roots',
      era: 'Paleolithic',
      description: 'Identification of willow bark and marsh herbs for pain relief and wound cleansing.',
      costPoints: 0,
      discovered: true,
      activeKeepersCount: 9,
      benefits: 'Reduces death rate from infected cuts and common dysentery.',
    },
    {
      id: 'tech-smoking',
      name: 'Smokehouse & Meat Curing',
      era: 'Mesolithic',
      description: 'Hanging strips of game meat above smoldering green alder branches to extend shelf life.',
      costPoints: 60,
      discovered: false,
      activeKeepersCount: 0,
      benefits: 'Reduces meat and fish spoilage rate from 35% to 8% per season.',
    },
    {
      id: 'tech-baskets',
      name: 'Woven Reed Baskets & Skin Sacks',
      era: 'Mesolithic',
      description: 'Interlacing dry willow reeds into tight carrying containers.',
      costPoints: 45,
      discovered: false,
      activeKeepersCount: 0,
      benefits: '+30% carrying capacity for foragers and water fetchers.',
    },
    {
      id: 'tech-pottery',
      name: 'Pit-Fired Clay Pottery',
      era: 'Neolithic',
      description: 'Baking molded river clay in hot charcoal pits to form waterproof urns and cooking vessels.',
      costPoints: 100,
      discovered: false,
      activeKeepersCount: 0,
      benefits: 'Protects grains from damp rot; enables boiled clean water.',
    },
    {
      id: 'tech-agri',
      name: 'Broadcast Field Cultivation',
      era: 'Neolithic',
      description: 'Clearing river terrace loam and sowing selected seed grains to produce predictable autumn yields.',
      costPoints: 160,
      discovered: false,
      activeKeepersCount: 0,
      benefits: 'Yields up to 1,200 kg grain per dedicated farmer per year.',
    },
    {
      id: 'tech-domestication',
      name: 'Wild Goat & Boar Penning',
      era: 'Neolithic',
      description: 'Taming docile young herd animals in brush corrals for constant milk and fleece.',
      costPoints: 180,
      discovered: false,
      activeKeepersCount: 0,
      benefits: 'Produces steady animal milk, tallow, and wool independent of hunting luck.',
    },
    {
      id: 'tech-copper',
      name: 'Native Copper Cold-Hammering',
      era: 'Copper Age',
      description: 'Pounding metallic copper nuggets into tough awls, fish hooks, and battle axes.',
      costPoints: 240,
      discovered: false,
      activeKeepersCount: 0,
      benefits: 'Doubles tool durability and boosts mining/quarry yields by 75%.',
    },
  ];
}

export function createInitialInfrastructure(): SettlementInfrastructure {
  return {
    leafHuts: 24, // Primitive brush lean-tos (96 capacity)
    thatchedCabins: 4, // Insulated communal cabins (32 capacity; 128 total)
    granaryBins: 3, // Elevated platforms for dried grains (6,500 kg capacity)
    waterCisterns: 5, // Deep dug pits lined with river clay
    smokingRacks: 2, // Basic tripod smoking rack
    toolWorkBench: 2, // Shaded knapping rocks
    perimeterFence: 2, // Thorny bramble ditch & sharpened stakes
  };
}

export function createInitialCivilization(rng?: SeededRandom): CivilizationState {
  const effectiveRng = rng || new SeededRandom(12345);
  const people = createInitialPeople(effectiveRng);
  const resources = createInitialResources();
  const regions = createInitialRegions();
  const technologies = createInitialTechs();
  const infrastructure = createInitialInfrastructure();
  // Determine initial Chieftain / Council Leader from prime elders
  const elderCandidates = people.filter(p => p.age >= 35);
  const initialLeaderPerson = elderCandidates.length > 0 ? elderCandidates[0] : people[0];
  const leader: LeaderProfile = {
    id: initialLeaderPerson.id,
    name: initialLeaderPerson.name,
    title: 'Council Elder',
    personality: 'Agrarian Provider',
    reignStartYear: 0,
    wisdom: 65,
    charisma: 70,
    aggressiveness: 30,
  };

  const initialDecisions: AutonomousDecision[] = [
    {
      id: 'dec-0-Spring-1',
      year: 0,
      season: 'Spring',
      category: 'Governance',
      problem: 'Nomadic band establishes permanent seasonal hearth along the riverbank.',
      action: `${initialLeaderPerson.name} proclaimed founding of River Terrace Encampment.`,
      consequence: 'Formed 100-member autonomous society with initial leaf huts and tool benches.',
      reasoning: 'Abundant fresh river water and terrace loess identified as optimal settlement foundation.',
      importance: 'historic',
    }
  ];

  return {
    year: 0,
    season: 'Spring',
    dayOfYear: 1,
    people,
    resources,
    regions,
    infrastructure,
    technologies,
    weather: {
      currentTempC: 15,
      isRaining: false,
      isDrought: false,
      isBlizzard: false,
      isStorm: false,
      forecastReliabilityPercent: 70,
    },
    settlements: [
      {
        id: 'settlement-main',
        name: 'River Terrace Camp',
        regionId: 'reg-river',
        tier: 'Camp',
        population: 100,
        families: [],
        buildings: [],
        infrastructure,
        food: 4200,
        water: 4000,
        wealth: 100,
        health: 85,
        happiness: 80,
        loyalty: 90,
        defense: 25,
        culture: 10,
        technology: 0,
        government: 'Tribal Council',
        foundedYear: 0,
        tradeRoutes: [],
      }
    ],
    government: {
      type: 'Tribal Council',
      rulerId: leader.id,
      legitimacy: 85,
      stability: 90,
      corruption: 0,
      administrativeCapacity: 100,
      factions: [],
      laws: [],
      taxRate: 0,
      treasury: 50,
    },
    crises: [],
    annualReports: [],
    accumulatedAnnualProduction: {
      foodKg: 0,
      waterL: 0,
      woodUnits: 0,
      stoneUnits: 0,
      fuelUnits: 0,
    },
    accumulatedAnnualConsumption: {
      foodKg: 0,
      waterL: 0,
      fuelUnits: 0,
    },
    annualBirths: 0,
    annualDeaths: 0,
    annualImmigration: 0,
    lastYearBirths: 0,
    lastYearDeaths: 0,
    lastYearImmigration: 0,
    policies: {
      foodRationing: 'Normal',
      waterConservation: false,
      firewoodPriority: 'Balanced',
      quarantineSick: true,
      explorationAggression: 'Moderate',
      teachingFocus: 'Survival',
      autonomyEnabled: true,
    },
    nationalFocus: 'balanced',
    autonomousDecisions: initialDecisions,
    leader,
  };
}
