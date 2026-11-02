// Stable IDs preserve saved collections and deck lists across balance changes.
export const types = {
  "Earth": "#c1aa77",
  "Wind": "#b3e0d6",
  "Water": "#69b6e2",
  "Fire": "#ec9870",
  "Light": "#eddb99",
  "Dark": "#b39adf",
  "Toxic": "#bbd871",
  "Electric": "#f0ce6e",
  "Nature": "#83c7a1",
  "Neutral": "#bcc6c9"
};
const roster = [
  {
    "id": "squire",
    "name": "Dawn Squire",
    "kind": "creature",
    "type": "Light",
    "cls": "Warrior",
    "cost": 1,
    "hp": 50,
    "damage": 20,
    "magica": 20,
    "stamina": 40,
    "weakness": "Dark",
    "ability": "Steadfast. A faithful first summon.",
    "passive": "",
    "attackName": "Steel strike",
    "category": "Slashing"
  },
  {
    "id": "knight",
    "name": "Ironclad Sentinel",
    "kind": "creature",
    "type": "Earth",
    "cls": "Warrior",
    "cost": 2,
    "hp": 80,
    "damage": 30,
    "magica": 20,
    "stamina": 60,
    "weakness": "Water",
    "ability": "Guard: take 10 less attack damage.",
    "passive": "guard",
    "attackName": "Steel strike",
    "category": "Slashing"
  },
  {
    "id": "ranger",
    "name": "Ironblade Knight",
    "kind": "creature",
    "type": "Earth",
    "cls": "Warrior",
    "cost": 3,
    "hp": 70,
    "damage": 30,
    "magica": 20,
    "stamina": 70,
    "weakness": "Water",
    "ability": "Sharpness: +10 to each Slashing hit.",
    "passive": "sharpness",
    "attackName": "Double Slash",
    "category": "Slashing",
    "archetype": "Knight",
    "hits": 2
  },
  {
    "id": "sentinel",
    "name": "Sunveil Sentinel",
    "kind": "creature",
    "type": "Light",
    "cls": "Warrior",
    "cost": 3,
    "hp": 100,
    "damage": 40,
    "magica": 40,
    "stamina": 80,
    "weakness": "Dark",
    "ability": "Guard: take 10 less attack damage.",
    "passive": "guard",
    "attackName": "Steel strike",
    "category": "Slashing"
  },
  {
    "id": "gryphon",
    "name": "Silver Gryphon",
    "kind": "creature",
    "type": "Wind",
    "cls": "Winged-Beast",
    "cost": 2,
    "hp": 70,
    "damage": 30,
    "magica": 40,
    "stamina": 60,
    "weakness": "Electric",
    "ability": "Sharpness: +10 to Slashing attacks.",
    "passive": "sharpness",
    "attackName": "Steel strike",
    "category": "Slashing"
  },
  {
    "id": "whelp",
    "name": "Ember Whelp",
    "kind": "creature",
    "type": "Fire",
    "cls": "Dragon",
    "cost": 1,
    "hp": 40,
    "damage": 20,
    "magica": 40,
    "stamina": 20,
    "weakness": "Water",
    "ability": "Small wings. A fierce beginning.",
    "passive": "",
    "attackName": "Dragon breath",
    "category": "Elemental"
  },
  {
    "id": "drake",
    "name": "Emberwing Dragon",
    "kind": "creature",
    "type": "Fire",
    "cls": "Dragon",
    "cost": 5,
    "hp": 80,
    "damage": 50,
    "magica": 80,
    "stamina": 30,
    "weakness": "Water",
    "ability": "Fire affinity: +15 damage to Fire attacks.",
    "passive": "firepower",
    "attackName": "Flame Breath",
    "category": "Elemental"
  },
  {
    "id": "tide",
    "name": "Tide Serpent",
    "kind": "creature",
    "type": "Water",
    "cls": "Dragon",
    "cost": 3,
    "hp": 90,
    "damage": 20,
    "magica": 60,
    "stamina": 40,
    "weakness": "Electric",
    "ability": "Guard: take 10 less attack damage.",
    "passive": "guard",
    "attackName": "Dragon breath",
    "category": "Elemental"
  },
  {
    "id": "storm",
    "name": "Storm Wyvern",
    "kind": "creature",
    "type": "Electric",
    "cls": "Dragon",
    "cost": 4,
    "hp": 80,
    "damage": 50,
    "magica": 80,
    "stamina": 60,
    "weakness": "Earth",
    "ability": "Thunder gathers beneath its wings.",
    "passive": "",
    "attackName": "Dragon breath",
    "category": "Elemental"
  },
  {
    "id": "elder",
    "name": "Elder Wyrm",
    "kind": "creature",
    "type": "Dark",
    "cls": "Dragon",
    "cost": 0,
    "hp": 150,
    "damage": 60,
    "magica": 100,
    "stamina": 100,
    "weakness": "Light",
    "ability": "Ritual only. Tribute 2 creatures on your battlefield.",
    "passive": "ritual",
    "attackName": "Dragon breath",
    "category": "Elemental"
  },
  {
    "id": "moss",
    "name": "Mossfang",
    "kind": "creature",
    "type": "Nature",
    "cls": "Beast",
    "cost": 1,
    "hp": 60,
    "damage": 20,
    "magica": 40,
    "stamina": 60,
    "weakness": "Fire",
    "ability": "Vitality: heal 10 HP at the start of your turn.",
    "passive": "vitality",
    "attackName": "Rending bite",
    "category": "Slashing"
  },
  {
    "id": "umbra",
    "name": "Moonbound Shade",
    "kind": "creature",
    "type": "Dark",
    "cls": "Undead",
    "cost": 2,
    "hp": 70,
    "damage": 40,
    "magica": 60,
    "stamina": 40,
    "weakness": "Light",
    "ability": "A whisper from the prison above.",
    "passive": "",
    "attackName": "Steel strike",
    "category": "Slashing"
  },
  {
    "id": "slash",
    "name": "Rending Slash",
    "kind": "attack",
    "type": "Neutral",
    "damage": 40,
    "magica": 0,
    "stamina": 20,
    "classes": [
      "Warrior",
      "Dragon",
      "Beast",
      "Winged-Beast"
    ],
    "category": "Slashing",
    "effect": "",
    "cost": 0
  },
  {
    "id": "lance",
    "name": "Sunpiercer",
    "kind": "attack",
    "type": "Light",
    "damage": 50,
    "magica": 10,
    "stamina": 30,
    "classes": [
      "Warrior"
    ],
    "category": "Piercing",
    "effect": "",
    "cost": 0
  },
  {
    "id": "gale",
    "name": "Flaming Slash",
    "kind": "attack",
    "type": "Fire",
    "damage": 50,
    "magica": 0,
    "stamina": 50,
    "classes": [
      "Warrior",
      "Winged-Beast",
      "Dragon"
    ],
    "category": "Slashing",
    "effect": "burn",
    "cost": 0
  },
  {
    "id": "flame",
    "name": "Fire Breath",
    "kind": "attack",
    "type": "Fire",
    "damage": 60,
    "magica": 80,
    "stamina": 0,
    "classes": [
      "Dragon"
    ],
    "category": "Elemental",
    "effect": "burn",
    "cost": 0,
    "anyOf": [
      {
        "classes": [
          "Dragon"
        ]
      },
      {
        "classes": [
          "Beast"
        ],
        "types": [
          "Fire"
        ]
      }
    ],
    "strongAgainst": [
      "Nature"
    ]
  },
  {
    "id": "thunder",
    "name": "Thunderfall",
    "kind": "attack",
    "type": "Electric",
    "damage": 60,
    "magica": 80,
    "stamina": 0,
    "classes": [
      "Dragon",
      "Mage",
      "Elemental"
    ],
    "category": "Elemental",
    "effect": "",
    "cost": 0
  },
  {
    "id": "frost",
    "name": "Frost Torrent",
    "kind": "attack",
    "type": "Water",
    "damage": 40,
    "magica": 40,
    "stamina": 0,
    "classes": [
      "Dragon",
      "Aquatic",
      "Mage"
    ],
    "category": "Elemental",
    "effect": "",
    "cost": 0
  },
  {
    "id": "venom",
    "name": "Venom Fang",
    "kind": "attack",
    "type": "Toxic",
    "damage": 30,
    "magica": 20,
    "stamina": 20,
    "classes": [
      "Beast",
      "Dragon",
      "Reptile"
    ],
    "category": "Piercing",
    "effect": "poison",
    "cost": 0
  },
  {
    "id": "mend",
    "name": "Healing Rays",
    "kind": "spell",
    "type": "Light",
    "cost": 2,
    "effect": "heal",
    "text": "Restore 30 HP to a friendly creature.",
    "amount": 30,
    "creatureOnly": true
  },
  {
    "id": "insight",
    "name": "Ancient Insight",
    "kind": "spell",
    "type": "Light",
    "cost": 1,
    "effect": "draw",
    "text": "Draw 2 cards."
  },
  {
    "id": "disarm",
    "name": "Disarm",
    "kind": "spell",
    "type": "Light",
    "cost": 2,
    "effect": "remove",
    "text": "Destroy an enemy creature. No overkill damage."
  },
  {
    "id": "rally",
    "name": "Call of the Guard",
    "kind": "spell",
    "type": "Light",
    "cost": 1,
    "effect": "search",
    "text": "Find the next creature in your deck and add it to your hand."
  },
  {
    "id": "rite",
    "name": "Rite of the Ancients",
    "kind": "spell",
    "type": "Light",
    "cost": 2,
    "effect": "ritual",
    "text": "Tribute 2 creatures already on your field. Special summon Elder Wyrm. Does not use your Normal Summon."
  },
  {
    "id": "surge",
    "name": "Aether Surge",
    "kind": "spell",
    "type": "Light",
    "cost": 0,
    "effect": "energy",
    "text": "Recover 1 energy, up to the cap of 5."
  }
];
export const CARDS = Object.fromEntries(roster.map(card=>[card.id,card]));

export const STARTERS = {
  Knight: [...['squire','knight','ranger','sentinel','gryphon'].flatMap(id=>Array(4).fill(id)),...['slash','lance','gale'].flatMap(id=>Array(4).fill(id)),...['mend','insight','disarm','rally'].flatMap(id=>Array(2).fill(id))],
  Dragon: [...['whelp','drake','tide','storm'].flatMap(id=>Array(5).fill(id)),...['flame','thunder','frost'].flatMap(id=>Array(4).fill(id)),...['mend','insight','rite','surge'].flatMap(id=>Array(2).fill(id))]
};
export function description(c) {
  if(c.kind==='creature') return c.ability;
  if(c.kind==='spell') return c.text;
  return `${c.damage} ${c.type} damage · ${c.category}${c.effect==='poison'?' · Poison: 10 each turn.':c.effect==='burn'?' · Burn: 10 for 2 turns.':''}`;
}
export const equippedCards=u=>Array.isArray(u.equipped)?u.equipped:u.equipped?[u.equipped]:[];
export function capacityUsed(u){return equippedCards(u).reduce((v,id)=>({magica:v.magica+CARDS[id].magica,stamina:v.stamina+CARDS[id].stamina}),{magica:0,stamina:0});}
export function eligibility(a){return a.anyOf?'Dragon OR Fire-type Beast':`${a.classes.join(' / ')}${a.types?.length?' · '+a.types.join(' / '):''}`;}
export function canEquip(c,a,u=null) {const used=u?capacityUsed(u):{magica:0,stamina:0};const rules=a.anyOf||[{classes:a.classes,types:a.types}];return a.kind==='attack'&&a.magica+used.magica<=c.magica&&a.stamina+used.stamina<=c.stamina&&rules.some(r=>(!r.classes||r.classes.includes(c.cls))&&(!r.types||r.types.includes(c.type)));}
export function validateDeck(deck,owned) { return deck.length===40 && deck.every(id=>CARDS[id]&&id!=='elder'&&deck.filter(x=>x===id).length<=(owned[id]||0)); }
