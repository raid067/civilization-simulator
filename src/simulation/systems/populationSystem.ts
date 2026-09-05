/**
 * Population System - Manages births, deaths, aging, and demographic simulation
 */

import { Person, Civilization, RoleType, Season, PersonalityTrait, SocialClass } from '../../types';
import { SeededRandom } from '../utils/Random';
import { SIMULATION_CONFIG } from '../../types';

const PERSONALITY_TRAITS: PersonalityTrait[] = [
  'ambitious', 'cautious', 'aggressive', 'peaceful', 'curious',
  'loyal', 'rebellious', 'generous', 'selfish', 'intelligent',
  'disciplined', 'charismatic', 'traditionalist', 'innovative',
  'brave', 'cowardly', 'patient', 'impulsive'
];

const FIRST_NAMES_MALE = [
  'Kael', 'Toran', 'Bram', 'Enki', 'Ronak', 'Vael', 'Dak', 'Joran', 'Thul', 'Khor',
  'Oran', 'Brant', 'Galan', 'Korm', 'Zoran', 'Dael', 'Roric', 'Harek', 'Morg', 'Ulan',
  'Torm', 'Kendrik', 'Bael', 'Drak', 'Lorn', 'Vorn', 'Garr', 'Erek', 'Kip', 'Nash',
];

const FIRST_NAMES_FEMALE = [
  'Mara', 'Sura', 'Osha', 'Naru', 'Tova', 'Dara', 'Kira', 'Lyra', 'Vea', 'Ilka',
  'Shira', 'Rhea', 'Elora', 'Mina', 'Brena', 'Zaya', 'Kessa', 'Rala', 'Sela', 'Vara',
  'Ania', 'Tali', 'Kaia', 'Nesta', 'Yara', 'Mira', 'Vana', 'Iva', 'Kora', 'Lian',
];

export class PopulationSystem {
  private random: SeededRandom;

  constructor(random: SeededRandom) {
    this.random = random;
  }

  /**
   * Process aging for all living people
   */
  processAging(civ: Civilization): void {
    const livingPeople = civ.people.filter(p => p.alive);
    for (const person of livingPeople) {
      // Age-related health decline after 40
      if (person.age >= 40) {
        const declineRate = (person.age - 40) * 0.3;
        person.health = Math.max(0, person.health - declineRate);
      }
      
      // Elder wisdom bonus to lore
      if (person.age >= 50 && person.role === 'elder_lorekeeper') {
        person.skills.lore = Math.min(100, person.skills.lore + 0.2);
      }
    }
  }

  /**
   * Process births based on population conditions
   */
  processBirths(civ: Civilization, season: Season): number {
    let births = 0;
    const livingPeople = civ.people.filter(p => p.alive);
    
    // Only birth in Spring and Autumn (optimal seasons)
    if (season !== 'Spring' && season !== 'Autumn') {
      return 0;
    }

    // Find fertile females with good conditions
    const fertileFemales = livingPeople.filter(p => 
      p.gender === 'female' && 
      p.age >= 18 && 
      p.age <= 40 && 
      p.health >= 60 && 
      p.hunger < 50 &&
      p.thirst < 50
    );

    for (const female of fertileFemales) {
      // Base birth chance modified by conditions
      const baseChance = SIMULATION_CONFIG.baseBirthRate / 4; // Per season
      const conditionModifier = (female.health / 100) * ((100 - female.hunger) / 100);
      const housingModifier = this.getHousingModifier(civ, female.currentSettlementId);
      
      const birthChance = baseChance * conditionModifier * housingModifier;
      
      if (this.random.chance(birthChance)) {
        const baby = this.createBaby(female, civ);
        civ.people.push(baby);
        
        // Update mother's relationships
        female.relationships.childrenIds.push(baby.id);
        
        // Update father if partner exists
        if (female.relationships.partnerId) {
          const partner = civ.people.find(p => p.id === female.relationships.partnerId);
          if (partner) {
            partner.relationships.childrenIds.push(baby.id);
          }
        }
        
        births++;
        
        // Record historical event for important births
        if (births <= 3 || this.random.chance(0.05)) {
          if (!civ.history) civ.history = [];
          civ.history.push({
            id: `birth-${civ.year}-${births}`,
            year: civ.year,
            season,
            type: 'birth',
            title: `New Life: ${baby.name}`,
            description: `${baby.name} was born to ${female.name}.`,
            importance: 2,
            people: [baby.id, female.id]
          });
        }
      }
    }

    return births;
  }

  /**
   * Process deaths based on health, age, and conditions
   */
  processDeaths(civ: Civilization, season: Season): number {
    let deaths = 0;
    
    for (const person of civ.people) {
      if (!person.alive) continue;

      let shouldDie = false;
      let causeOfDeath = '';

      // Starvation
      if (person.hunger >= 95) {
        shouldDie = true;
        causeOfDeath = 'Starvation';
      }
      
      // Dehydration
      if (person.thirst >= 95) {
        shouldDie = true;
        causeOfDeath = 'Dehydration';
      }
      
      // Critical health
      if (person.health <= 0) {
        shouldDie = true;
        causeOfDeath = person.diseases[0] || 'Critical injuries';
      }
      
      // Old age (chance increases after 50)
      if (person.age >= 50) {
        const ageDeathChance = SIMULATION_CONFIG.baseDeathRate * ((person.age - 50) / 50);
        if (this.random.chance(ageDeathChance)) {
          shouldDie = true;
          causeOfDeath = 'Old age';
        }
      }
      
      // Disease mortality
      if (person.diseases.length > 0) {
        const diseaseSeverity = person.diseases.length * 0.15;
        const healthFactor = (100 - person.health) / 100;
        const deathChance = diseaseSeverity * healthFactor * 0.3;
        
        if (this.random.chance(deathChance)) {
          shouldDie = true;
          causeOfDeath = person.diseases[0];
        }
      }

      if (shouldDie) {
        person.alive = false;
        person.deathYear = civ.year;
        person.deathSeason = season;
        person.causeOfDeath = causeOfDeath;
        deaths++;
        
        // Remove from partner
        if (person.relationships.partnerId) {
          const partner = civ.people.find(p => p.id === person.relationships.partnerId);
          if (partner) {
            partner.relationships.partnerId = undefined;
          }
        }
        
        // Knowledge loss if lorekeeper dies
        if (person.role === 'elder_lorekeeper') {
          for (const tech of civ.technologies) {
            if (tech.discovered && tech.activeKeepersCount > 0) {
              tech.activeKeepersCount = Math.max(0, tech.activeKeepersCount - 1);
            }
          }
        }
      }
    }
    
    return deaths;
  }

  /**
   * Create a new baby person
   */
  private createBaby(mother: Person, civ: Civilization): Person {
    const gender = this.random.chance(0.5) ? 'male' : 'female';
    const nameList = gender === 'male' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    const name = this.random.pick(nameList);
    
    // Inherit some traits from parents
    const personality: PersonalityTrait[] = [];
    const parentTraits = new Set<PersonalityTrait>();
    
    if (mother.personality) {
      mother.personality.forEach(t => parentTraits.add(t));
    }
    if (mother.relationships.partnerId) {
      const father = civ.people.find(p => p.id === mother.relationships.partnerId);
      if (father?.personality) {
        father.personality.forEach(t => parentTraits.add(t));
      }
    }
    
    // Baby inherits 2-4 traits from parents
    const traitArray = Array.from(parentTraits);
    const numTraits = this.random.integer(2, Math.min(4, traitArray.length));
    for (let i = 0; i < numTraits; i++) {
      if (traitArray.length > 0) {
        personality.push(this.random.pick(traitArray));
      }
    }
    
    // Fill remaining traits randomly
    while (personality.length < 3) {
      const trait = this.random.pick(PERSONALITY_TRAITS);
      if (!personality.includes(trait)) {
        personality.push(trait);
      }
    }

    return {
      id: `p-${civ.people.length + 1}`,
      name: `${name} of ${mother.name.split(' ')[0]}`,
      age: 0,
      gender,
      alive: true,
      health: 75 + this.random.integer(0, 20),
      hunger: 10,
      thirst: 10,
      fatigue: 5,
      temperature: 37.0,
      mentalState: 90,
      injuries: [],
      diseases: [],
      nutrition: 80,
      shelterQuality: mother.shelterQuality,
      clothingQuality: 30,
      warmth: 80,
      safety: 85,
      role: 'idle_child' as RoleType,
      skills: {
        hunting: 5,
        foraging: 5,
        farming: 5,
        stonecraft: 5,
        woodcraft: 5,
        healing: 5,
        lore: 5,
        combat: 5,
        crafting: 5,
        trading: 5,
        leadership: 5,
        fishing: 5,
        mining: 5,
      },
      relationships: {
        partnerId: undefined,
        parentIds: [mother.id],
        childrenIds: [],
        friendIds: [],
        enemyIds: [],
      },
      personality,
      socialClass: mother.socialClass,
      familyId: mother.familyId,
      education: 0,
      wealth: 0,
      loyalty: 50,
      happiness: 90,
      currentSettlementId: mother.currentSettlementId,
      achievements: [],
      memories: [],
    };
  }

  /**
   * Get housing modifier for birth rate
   */
  private getHousingModifier(civ: Civilization, settlementId?: string): number {
    if (civ.infrastructure) {
      const housingCapacity = (civ.infrastructure.leafHuts || 0) * 4 + (civ.infrastructure.thatchedCabins || 0) * 8;
      const pop = civ.people.filter(p => p.alive).length;
      if (pop <= housingCapacity) return 1.2;
      if (pop <= housingCapacity * 1.2) return 1.0;
      return 0.6;
    }
    const settlement = civ.settlements?.find(s => s.id === settlementId);
    if (!settlement) return 1.0;
    
    const housingCapacity = settlement.infrastructure.leafHuts * 4 + 
                           settlement.infrastructure.thatchedCabins * 6;
    
    if (settlement.population <= housingCapacity) {
      return 1.2; // Good housing
    } else if (settlement.population <= housingCapacity * 1.2) {
      return 1.0; // Adequate
    } else {
      return 0.6; // Overcrowded
    }
  }

  /**
   * Assign appropriate roles based on age and skills
   */
  assignRoles(civ: Civilization): void {
    for (const person of civ.people) {
      if (!person.alive) continue;
      
      // Children remain idle until age 10
      if (person.age < 10) {
        person.role = 'idle_child';
        continue;
      }
      
      // Elders become lorekeepers
      if (person.age >= 55) {
        person.role = 'elder_lorekeeper';
        continue;
      }
      
      // Prime working age - assign based on skills and needs
      if (person.age >= 10 && person.role === 'idle_child') {
        // Determine best role based on skills
        const skillMap: Record<string, RoleType> = {
          hunting: 'hunter',
          foraging: 'forager',
          farming: 'farmer',
          stonecraft: 'stonecutter',
          woodcraft: 'lumberjack',
          healing: 'herbalist',
          crafting: 'toolmaker',
          combat: 'soldier',
          trading: 'merchant',
          fishing: 'fisherman',
          mining: 'miner',
        };
        
        let bestSkill = 'foraging';
        let bestValue = person.skills.foraging;
        
        for (const [skill, value] of Object.entries(person.skills)) {
          if (value > bestValue) {
            bestValue = value;
            bestSkill = skill;
          }
        }
        
        person.role = (skillMap[bestSkill] as RoleType) || 'forager';
      }
    }
  }

  /**
   * Calculate total living population
   */
  getLivingPopulation(civ: Civilization): number {
    return civ.people.filter(p => p.alive).length;
  }

  /**
   * Get population by age group
   */
  getAgeDistribution(civ: Civilization): Record<string, number> {
    const living = civ.people.filter(p => p.alive);
    
    return {
      '0-14': living.filter(p => p.age < 15).length,
      '15-24': living.filter(p => p.age >= 15 && p.age < 25).length,
      '25-44': living.filter(p => p.age >= 25 && p.age < 45).length,
      '45-64': living.filter(p => p.age >= 45 && p.age < 65).length,
      '65+': living.filter(p => p.age >= 65).length,
    };
  }
}
