export const LORE={
  origin:{title:'The One and the Divide',text:'Before sky or soil there was The One. It divided into Lux, creation, and Nox, consumption. Neither began as a mortal enemy; their creations made the conflict real.'},
  solara:{title:'Solara and the Hollow Moon',text:'Lux created the Sun, Solara, and the Stars. Nox brought forth Umbra, a hollow hunger that consumed the Stars. Solara sealed Umbra in a shell of stone. Our Moon is a prison, not a dead world.'},
  ward:{title:'The Celestial Ward',text:'The surviving Stars keep a ward around Umbra. These old stones carry the same pattern. Someone has been removing pieces of it. The dragon tracks lead toward the damaged stones, never away from them.'},
  roots:{title:'Lux Became the World Tree',text:'Lux sacrificed itself to separate Light from Darkness. The barrier became the Outer Realm; Lux became its World Tree. Souls take root here, carrying fragments of the lives they lost. Nobody arrives as a chosen one.'},
  below:{title:'Beyond the Barrier',text:'Nox remains beyond the barrier and influences the Under Realm. Its corruption follows broken wards into this world. The Fall Guard fights to keep those fractures closed, one settlement at a time.'}
};
export const DISCOVERIES={
  'echo-grove':{title:'A Soul Among the Ferns',reward:'moss',count:2,text:'A frightened forest soul rests inside a cracked card. Your gauntlet warms; the creature chooses to come with you.'},
  'echo-ruins':{title:'An Ember in the Ash',reward:'venom',count:2,text:'Beside a fallen banner, a memory of a guardian becomes an attack card. Memories can become skills as well as creatures.'},
  'echo-moon':{title:'A Name in the Dark',reward:'umbra',count:2,text:'A shade remembers the name of a friend. The corruption has not consumed everything it was. You offer it a place in the gauntlet.'},
  'lore-ward':{title:'Stones of the Star Ward',lore:'ward'},
  'lore-roots':{title:'The Rootkeeper’s Memory',lore:'roots'},
  'lore-below':{title:'A Fracture Beneath the Shrine',lore:'below'}
};
export function migrateProgress(p){p.discoveries??=[];p.lore??=p.mentor?['origin']:[];p.joined??=false;p.rewards??=[];return p;}
export function discover(p,id){const entry=DISCOVERIES[id];if(!entry||p.discoveries.includes(id))return false;p.discoveries.push(id);if(entry.lore&&!p.lore.includes(entry.lore))p.lore.push(entry.lore);if(entry.reward)p.owned[entry.reward]=(p.owned[entry.reward]||0)+entry.count;return true;}
export function quests(p){return [
  {id:'guard',title:'A Place Among the Guard',description:'Speak to Captain Mara in Fallhaven after meeting the Wanderer.',done:p.joined},
  {id:'echoes',title:'No Soul Left Behind',description:`Recover the 3 lost soul cards. ${p.discoveries.filter(id=>id.startsWith('echo-')).length}/3 found. Return to Mara for 2 Ironclad Sentinels.`,done:p.rewards.includes('mara')},
  {id:'archive',title:'What the Stars Remember',description:`Find 2 lore sites and return to Archivist Ilyan. ${p.discoveries.filter(id=>id.startsWith('lore-')).length}/2 found. Reward: Thunderfall.`,done:p.rewards.includes('ilyan')},
  {id:'dragon',title:'The Dragon at the Ward',description:'Win the 3 trials and read 2 memories before following the Wanderer to the World Tree.',done:p.finished}
];}
export function npcDialogue(p,id){
  if(id==='captain')return {speaker:'Captain Mara',lines:!p.mentor?['You look lost. Speak to the old Wanderer on the road first. We can offer you shelter when you are ready.']:!p.joined?['No prophecy brought you here. Most of us arrived frightened, just as you did. You can stay in Fallhaven.','We are the Fall Guard. We protect the souls the Tree gives back to us. You earn a place by helping someone, not by being chosen.','Three soul cards are missing in the wilds. Bring them home. And if the Wanderer sends you after that dragon, look at what it is guarding before you strike.']:['You are one of us. Find the lost souls and keep an eye on the old wards. We lost a patrol following the dragon; I will not lose another to a story we have not questioned.']};
  if(id==='archivist')return {speaker:'Archivist Ilyan',lines:['The Wanderer tells a simple story. The records remember a harder one. Lux made Solara and the Stars; Nox made the hunger called Umbra.','Solara sealed Umbra inside the Moon. Lux became this realm and its World Tree. The Stars still hold the prison closed.','Read two of the old memory sites and bring back what you learn. If the dragon follows the ward stones, perhaps it is trying to protect them.']};
  return {speaker:'Seren, Field Medic',lines:['Our last patrol left four empty beds. The Guard still sets a place for each of them at supper. Souls are people before they are cards.','Take these Healing Rays. A creature can carry several attacks, but each reserves part of its Magica or Stamina. Do not ask it to bear more than it can hold.']};
}
export function finishNpc(p,id){
  if(id==='captain'&&p.mentor)p.joined=true;
  if(id==='archivist'&&!p.lore.includes('solara'))p.lore.push('solara');
  let reward=null;
  if(id==='captain'&&p.discoveries.filter(x=>x.startsWith('echo-')).length>=3&&!p.rewards.includes('mara'))reward={flag:'mara',id:'knight',count:2};
  if(id==='archivist'&&p.discoveries.filter(x=>x.startsWith('lore-')).length>=2&&!p.rewards.includes('ilyan'))reward={flag:'ilyan',id:'thunder',count:1};
  if(id==='medic'&&!p.rewards.includes('seren'))reward={flag:'seren',id:'mend',count:2};
  if(reward){p.rewards.push(reward.flag);p.owned[reward.id]=(p.owned[reward.id]||0)+reward.count;}return reward;
}
export function canFaceWanderer(p){return p.joined&&['grove','ruins','shrine'].every(id=>p.wins.includes(id))&&p.discoveries.filter(id=>id.startsWith('lore-')).length>=2;}
