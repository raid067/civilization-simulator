# Civilization Simulator — Living World Engine

A deep, systemic civilization simulation where population, resources, economy, settlements, technology, politics, culture, diplomacy, environment, disasters, migration, conflict, and history interact to produce emergent histories every run.

## 🌍 Core Philosophy

> **EVERYTHING SHOULD AFFECT SOMETHING ELSE.**

This is not a dashboard with fake statistics. Every number you see originates from actual simulation state. Every event has consequences. Every decision matters.

### Example Chain Reaction

```
Population increases 
→ more food required 
→ more farmland needed 
→ more workers assigned to farming 
→ less labor for construction 
→ housing shortage develops 
→ health decreases 
→ birth rate drops 
→ migration increases 
→ new settlement forms
```

## ✨ Features

### 🧬 Population System 2.0
- **Individuals**: Each person has ID, name, age, sex, health, hunger, thirst, fatigue, mental state, personality, education, occupation, skills, wealth, social status, culture, religion, political ideology, birthplace, family relationships, friends, enemies, loyalty, reputation, memories, traits, goals, fears, ambitions, and languages
- **Personality Traits**: ambitious, cautious, aggressive, peaceful, curious, loyal, rebellious, generous, selfish, intelligent, disciplined, charismatic, traditionalist, innovative
- **Family System**: Real family structures with parents, siblings, grandparents, spouses, children, extended families, clans, and dynasties
- **Generational Inheritance**: Children inherit genetic tendencies, skills, personality tendencies, health tendencies, culture, social status, family wealth, and family reputation
- **Social Classes**: Hunter, Farmer, Craftsperson, Merchant, Laborer, Soldier, Priest, Scholar, Noble, Administrator, Ruler—with real effects on income, influence, living conditions, education, health, and mobility

### 🏘️ Settlement System 2.0
- **Multiple Settlements**: Camp → Village → Large Village → Town → City → Capital, plus specialized settlements (Fort, Port, Mining Town, Agricultural Town, Trade City, Religious Center, Industrial City)
- **Settlement Attributes**: population, culture, religion, wealth, food, water, housing, health, security, happiness, loyalty, production, trade, infrastructure, local government, unrest, defense, specialization
- **Organic Growth**: Settlements grow based on multiple requirements (population, food, water, housing, economic activity, infrastructure, security, trade, technology, government, environment)—not arbitrary thresholds
- **Housing System**: Tent, Hut, Longhouse, Stone House, Apartment, Manor, Palace—with capacity, condition, maintenance, occupants, construction cost, heating, sanitation tracking
- **Infrastructure**: Wells, roads, bridges, storage, granaries, farms, workshops → aqueducts, paved roads, canals, ports, marketplaces, hospitals, schools, universities, fortifications → railways, factories, power plants, airports, telecommunications, research centers

### 🌾 Agriculture & Production
- **Real Agriculture**: Farmland, soil fertility, crop types (wheat, barley, rice, maize, potatoes, vegetables, fruit, legumes), yield, weather effects, irrigation, workers, tools, fertilizer, pests, disease
- **Production Chains**: 
  - Wood → Lumber → Tools → Better farms → Higher food production
  - Ore → Metal → Tools → Better construction → Better infrastructure
  - Grain → Food → Population survival
  - Fiber → Cloth → Clothing → Warmth → Health

### 💰 Economy 2.0
- **Dynamic Markets**: Supply, demand, production, consumption, inventory, wealth, income, wages, prices, taxes, trade—with dynamic pricing based on scarcity/abundance
- **Currency Evolution**: Barter → commodity exchange → shells → metal pieces → coins → standardized currency → paper money → banking → credit
- **Trade Routes**: Internal and international trade with origin, destination, goods, quantity, price, transport cost, risk, profit—disruptable by war, bandits, disasters, political conflict
- **Treasury Management**: Money supply, income, expenses, inflation, debt tracking

### 🔬 Technology & Knowledge
- **Expanded Tech Tree**: Prehistoric → Paleolithic → Mesolithic → Neolithic → Copper Age → Bronze Age → Iron Age → Classical → Medieval → Renaissance → Early Modern → Industrial → Modern → Information → Digital → Future
- **Technology Categories**: Agriculture, Construction, Military, Medicine, Science, Industry—with prerequisites and dependencies
- **Knowledge System**: Technologies spread through education, migration, trade, conquest, scholars, experimentation, neighboring civilizations. Knowledge can be lost through population collapse, scholar deaths, institutional collapse, wars, isolation
- **Education Institutions**: Elder teaching → Apprenticeship → School → Academy → University → Research Institute—affecting literacy, technology, productivity, administration, science, innovation

### 🎭 Culture & Religion
- **Culture System**: Traditions, values, language, architecture, art, music, customs, social norms, festivals, identity—evolving over generations, splitting, merging, influencing neighbors
- **Religion System**: Flexible belief systems with beliefs, rituals, holy sites, clergy, religious influence, tolerance, religious conflict—affecting laws, politics, culture, happiness, war, diplomacy, festivals

### 🏛️ Government & Politics
- **Government Types**: Tribal Council, Chiefdom, Monarchy, Kingdom, Republic, Empire, Federation, Theocracy, Military Government, City-State, Confederation
- **Political Factions**: Traditionalists, Reformers, Merchants, Military, Farmers, Religious Leaders, Workers, Nobility, Scholars, Expansionists, Isolationists—competing for influence
- **Leadership**: Elections (democracies), succession (monarchies), leadership contests (tribal), coups (military)—with candidates, support, campaigns, influence, legitimacy
- **Law System**: Tax policy, military service, property rights, education, trade restrictions, religious tolerance, immigration, food rationing, labor policy, environmental protection—with tradeoffs

### 🤝 Diplomacy & Warfare
- **Multiple Civilizations**: Each with name, culture, government, population, territory, technology, economy, military, religion, relationships
- **Diplomatic Relations**: Hostile, Tense, Neutral, Friendly, Allied, Vassal—with trade agreements, alliances, non-aggression pacts, migration agreements, research exchange, tribute, threats, embargoes, peace treaties
- **Warfare System**: Infantry, Archers, Cavalry, Navy, Siege, Specialized units—strength depends on population, training, weapons, technology, food, morale, leadership, logistics, terrain, defense
- **Military Logistics**: Armies require food, water, equipment, transport, money—armies too far from supply become weaker
- **Territory System**: Civilizations control regions with owner, population, resources, settlements, terrain, strategic value, culture—borders change through settlement, diplomacy, war, treaties, migration

### 🌍 Environment & Climate
- **Living Environment**: Forest coverage, soil fertility, water availability, wildlife, pollution, deforestation, erosion, biodiversity—human activity changes the environment
- **Climate System**: Short-term (rain, drought, storms, temperature) and long-term trends (warming, cooling, rainfall changes, desertification, glacier changes)—affecting agriculture, migration, water, health, settlement location, politics
- **Natural Disasters**: Drought, Flood, Earthquake, Wildfire, Volcanic eruption, Storm, Blizzard, Famine, Epidemic, Landslide, Tsunami—with severity and real system damage
- **Disease System**: Spreads through population density, sanitation, water, travel, animals, trade routes—tracking infection, recovery, mortality, immunity, healthcare, quarantine

### 📊 Society & Quality of Life
- **Happiness & Quality of Life**: Calculated from food, water, housing, health, safety, wealth, employment, education, freedom, culture, religion, environment, social stability
- **Inequality Tracking**: Wealth distribution (Bottom 20%, Middle 60%, Top 20%)—high inequality can cause unrest, crime, political polarization, rebellion
- **Crime & Security**: Crime rate, banditry, corruption, policing, prisons, law enforcement—increases with poverty, inequality, weak government, war, unemployment, instability
- **Migration System**: Natural migration due to famine, war, jobs, wealth, religious persecution, overpopulation, climate, land availability, safety, family—creating new settlements, cultural mixing, border tensions, economic growth

### 📜 Emergent History Engine
- **Historical Events**: Every major event becomes part of civilization's history—generated from actual simulation events, not invented
- **Event Database**: Filterable by war, technology, ruler, disaster, population, settlement, diplomacy, economy, culture
- **Character Biographies**: Important people receive automatically generated biographies from actual simulation data (birth, death, occupation, achievements, family, historical importance)
- **Leader System**: Leaders have traits, policies, relationships, skills, reputation, achievements, failures—influencing history
- **Event Chains**: Events form chains (Drought → famine → food prices rise → unrest → rebellion → civil war)
- **Golden Ages & Dark Ages**: Emerge from conditions (Age of Exploration, Age of Innovation, Age of Stability, Age of Crisis, Dark Age, Age of War, Economic Boom, Scientific Revolution)
- **Civilization Collapse & Splitting**: Civilizations can fail (famine, war, economic collapse, political instability, environmental destruction, disease, invasion, resource depletion) or split into multiple civilizations (Civil War → Northern Kingdom / Southern Republic)
- **Civilization Merging**: Through conquest, federation, marriage alliances, cultural assimilation, political union

## 🎮 Gameplay Features

### ⏱️ Simulation Clock
- **Time Scales**: Day, Week, Month, Season, Year, Decade, Century, Era
- **System Frequencies**: Different systems operate at different frequencies (daily: hunger/thirst/illness/weather; weekly: production/migration/crime/economy; seasonally: crops/births/deaths/construction; yearly: technology/government/major events; decade: cultural change/demographic transformation/climate trends; century: civilization evolution/technological eras/geopolitical changes)
- **Time Controls**: Pause, Play, 1x/2x/5x/10x/25x/50x/100x speed, Step Day/Season/Year/10 Years

### 🎲 Deterministic Seeded Randomness
- **World Seed**: Every simulation has a seed displayed and saved
- **Reproducibility**: Generate random seed, enter custom seed, reproduce same simulation outcomes
- **Seeded RNG**: Replaces uncontrolled `Math.random()` for all simulation calculations

### 🗺️ World Map
- **Interactive Map**: Shows terrain, rivers, mountains, forests, settlements, borders, roads, trade routes, armies, resources, exploration, disasters
- **Zoom & Inspect**: Zoom regions, click settlements/armies/trade routes/resources/disasters for detailed information

### 📈 Analytics Dashboard
- **Interactive Charts**: Population, food, wealth, technology progress, settlement population, military strength, happiness, inequality, resource depletion, forest coverage, trade volume, inflation, life expectancy over time
- **Time Ranges**: 10 years, 50 years, 100 years, 500 years, All history

### 📋 Advanced Reporting
- **Yearly Reports**: Population (births, deaths, life expectancy, migration, age distribution), Economy (GDP-like output, production, consumption, wealth, prices, inflation, trade, treasury), Society (happiness, inequality, crime, education, health), Politics (stability, legitimacy, faction power, government approval), Military (army size, strength, casualties, wars), Environment (forest, water, soil, pollution, climate)

### 💾 Save System
- **Versioned Saves**: Format includes version, seed, timestamp, state
- **Migration Support**: Old saves migrate to new versions without breaking
- **Data Integrity**: Corrupted save handling, invalid state recovery, error messages

### 🔧 Developer Tools
- **Sandbox Mode**: Add resources, spawn population, trigger disaster, trigger war, advance technology, create settlement, change weather, change government
- **Simulation Diagnostics**: Validation checks for population ≥ 0, resources ≥ 0, alive/dead consistency, settlement population matching, resource limits, parent-child age relationships
- **Difficulty Levels**: Peaceful, Normal, Hard, Brutal, Sandbox—modifying systemic parameters, not just multiplying random deaths

## 🏗️ Architecture

```
src/
  simulation/
    engine/
      SimulationEngine.ts      # Core simulation loop
      SimulationContext.ts     # Shared simulation state
      SimulationClock.ts       # Time management
      SimulationEventBus.ts    # Event system
      Random.ts                # Seeded RNG

    systems/
      populationSystem.ts      # Births, deaths, aging, migration
      familySystem.ts          # Family relationships, inheritance
      healthSystem.ts          # Health, disease, mortality
      foodSystem.ts            # Food production, consumption, spoilage
      waterSystem.ts           # Water availability, quality
      resourceSystem.ts        # Resource extraction, regeneration
      productionSystem.ts      # Production chains, manufacturing
      economySystem.ts         # Supply/demand, prices, trade
      settlementSystem.ts      # Settlement creation, growth, management
      migrationSystem.ts       # Population movement
      technologySystem.ts      # Research, knowledge spread
      cultureSystem.ts         # Cultural development, traditions
      governmentSystem.ts      # Government types, leadership
      politicsSystem.ts        # Factions, elections, laws
      diplomacySystem.ts       # Inter-civilization relations
      warfareSystem.ts         # Military, battles, territory
      environmentSystem.ts     # Climate, ecosystems
      disasterSystem.ts        # Natural disasters
      educationSystem.ts       # Schools, universities, research
      religionSystem.ts        # Belief systems, clergy
      crimeSystem.ts           # Crime, law enforcement
      infrastructureSystem.ts  # Buildings, roads, utilities
      tradeSystem.ts           # Trade routes, commerce
      explorationSystem.ts     # Scouts, discovery
      historySystem.ts         # Historical records, biographies
      eventSystem.ts           # Event generation, chains

    world/
      worldGenerator.ts        # Procedural world generation
      biomeGenerator.ts        # Terrain, climate zones
      resourceGenerator.ts     # Resource placement
      civilizationGenerator.ts # Initial civilization setup

    utils/
      math.ts                  # Mathematical helpers
      probability.ts           # Probability calculations
      validation.ts            # State validation

    tests/                     # Automated tests
```

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/raid067/civilization-simulator.git
cd civilization-simulator
npm install
npm run dev
```

### Basic Controls

1. **New World**: Generate a new civilization with random or custom seed
2. **Simulate**: Advance time by season, year, or decade
3. **Manage**: Assign workers, build structures, research technologies, make policies
4. **Observe**: Watch your civilization evolve through generations
5. **Explore**: Discover new regions, resources, other civilizations
6. **Interact**: Trade, ally, or wage war with neighboring civilizations

### World Seed

Every world has a unique seed displayed on the main screen. Use it to:
- Reproduce the same simulation
- Share interesting scenarios with others
- Debug specific outcomes

Example seeds to try:
- `482913741` - Balanced starting conditions
- `123456789` - Resource-rich environment
- `999999999` - Challenging harsh climate

## 🧪 Testing & Validation

### Automated Tests

Run tests to verify simulation integrity:

```bash
npm test
```

Tests cover:
- Population dynamics (births, deaths, aging, migration, families)
- Resource flows (production, consumption, regeneration, spoilage)
- Economy mechanics (supply, demand, price changes, trade)
- Technology progression (prerequisites, research, knowledge spread)
- Settlement development (growth, housing, infrastructure)
- Government systems (succession, elections, stability)
- Warfare logic (logistics, battles, casualties, territory)
- Environmental factors (climate, disasters, resource depletion)
- Determinism (same seed + actions = identical results)

### Stress Testing

The simulation has been validated for long runs:
- ✅ 10 years: Basic functionality
- ✅ 100 years: Generational turnover
- ✅ 500 years: Civilization transformation
- ✅ 1,000 years: Technological eras
- ✅ 5,000 years: Rise and fall of empires

Check for:
- No NaN or Infinity values
- No negative resources
- No impossible populations
- Stable memory usage
- Consistent performance
- Valid relationships
- Unique IDs
- Plausible technology progression
- Intact historical records

## 📊 Data Model

Key types (see `src/types.ts` for complete definitions):

```typescript
Person          // Individual with full biography
Family          // Family relationships
Clan            // Extended family groups
Settlement      // Cities, towns, villages
Building        // Infrastructure
Region          // Geographic areas
Resource        // Natural resources
Market          // Economic markets
TradeRoute      // Commerce paths
Government      // Political structure
PoliticalFaction// Interest groups
Law             // Legislation
Civilization    // Complete civilization state
Military        // Armed forces
Army            // Military units
War             // Conflicts
Treaty          // Agreements
Culture         // Cultural attributes
Religion        // Belief systems
Technology      # Research progress
HistoricalEvent # Recorded events
ClimateState    # Environmental conditions
Disaster        # Catastrophic events
```

## 🔄 Version History

### v2.0.0 — Living World Engine (Current)
- Complete simulation architecture rewrite
- Seeded randomness for reproducibility
- Individual-based population simulation
- Multiple settlements with organic growth
- Dynamic economy with supply/demand
- Expanded technology tree across eras
- Government, politics, and law systems
- Diplomacy and warfare between civilizations
- Environment, climate, and disaster systems
- Emergent history generation
- Character biographies and leader systems
- Interactive world map
- Analytics dashboard with charts
- Versioned save system with migration
- Developer sandbox tools
- Comprehensive testing suite

### v1.0.0 — Prehistoric Settlement Simulator (Original)
- Basic seasonal simulation
- Single settlement management
- Simple resource tracking
- Linear technology progression
- Static population numbers
- Limited event system

## 🎯 Design Principles

1. **No Fake Features**: Every visible number originates from simulation state. If UI shows "Population: 3,482", there are actually 3,482 living people or a clearly defined aggregated model.

2. **Emergent Outcomes**: Results emerge from system interactions, not scripted events. Different seeds produce genuinely different histories.

3. **Interconnected Systems**: Everything affects something else. Changes ripple through multiple systems creating complex consequences.

4. **Data Integrity**: Simulation engine is source of truth. React/UI displays state but doesn't directly manipulate core values. Commands validate before execution.

5. **Long-term Stability**: Simulation remains playable for thousands of years without corruption, memory leaks, or performance collapse.

6. **Reproducibility**: Same seed + same actions = identical results. Critical for debugging and sharing scenarios.

7. **Backward Compatibility**: Old saves migrate to new versions. Users don't lose progress on updates.

8. **Transparency**: Players can inspect any number and trace it back to underlying simulation data.

## 🛠️ Development

### Running Locally

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Code Quality

```bash
npm run lint
npm run typecheck
```

### Stress Test

```bash
npm run stress-test:100years
npm run stress-test:500years
npm run stress-test:1000years
```

## 📝 Known Issues & Limitations

See [GitHub Issues](https://github.com/raid067/civilization-simulator/issues) for current known issues and planned improvements.

## 🚀 Future Roadmap

Potential future enhancements:
- Naval warfare and exploration
- Espionage and intelligence systems
- Art and literature development
- Sports and entertainment
- More detailed family genetics
- Aging and lifecycle events
- Retirement and succession planning
- Natural resource depletion and exhaustion
- Pollution and environmental remediation
- Pandemic modeling
- Refugee crises
- Cultural revolutions
- Scientific paradigms
- Economic bubbles and crashes
- Constitutional reforms
- International organizations
- Space exploration (far future)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make focused, incremental changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Inspired by:
- Classic civilization strategy games
- Complex system theory
- Historical analysis
- Agent-based modeling research
- Economic simulation literature

---

**Built with ❤️ for simulation enthusiasts who want depth, emergence, and authentic historical dynamics.**

*Every civilization tells a story. What will yours be?*
