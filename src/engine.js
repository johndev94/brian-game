import { CARDS,canEquip,equippedCards } from './cards.js';
let sequence=0;
export const clone=x=>JSON.parse(JSON.stringify(x));
export function shuffled(list,rng=Math.random){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function side(deck,rng){const pile=shuffled(deck,rng);return {life:200,energy:5,hand:pile.splice(0,5),deck:pile,field:[],discard:[],normal:false,fatigue:0};}
export function createBattle(deck,enemy,rng=Math.random){return {sides:[side(deck,rng),side(enemy,rng)],active:0,ply:1,winner:null,log:['The gauntlets awaken. You take the first turn.'],events:[],revision:0};}
function log(b,text){b.log.push(text);if(b.log.length>60)b.log.shift();b.revision++;}
function emit(b,event){b.events??=[];b.events.push({...event,id:b.revision+':'+b.events.length});if(b.events.length>40)b.events.shift();}
function checkWin(b){const dead=b.sides.map(s=>s.life<=0);if(dead[0]&&dead[1])b.winner='draw';else if(dead[0])b.winner=1;else if(dead[1])b.winner=0;}
function allowed(b,who){return b.winner===null&&b.active===who;}
export function draw(b,who,count=1){const s=b.sides[who];for(let i=0;i<count;i++){if(s.deck.length)s.hand.push(s.deck.shift());else{s.fatigue+=10;s.life=Math.max(0,s.life-s.fatigue);log(b,`Empty deck: ${s.fatigue} fatigue damage.`);}}checkWin(b);}
export function tributes(s){return s.field.map(c=>({zone:'field',uid:c.uid,id:c.id,hp:c.hp})).sort((a,b)=>a.hp-b.hp).slice(0,2);}
function unit(c){return {id:c.id,uid:++sequence,hp:c.hp,equipped:[],acted:false,poison:false,burn:0};}
function discardUnit(s,i){const [u]=s.field.splice(i,1);if(u)s.discard.push(u.id,...equippedCards(u));}
export function playCard(b,who,index,target=null){
  if(!allowed(b,who))return 'Wait for your turn.';
  const s=b.sides[who],foe=b.sides[1-who],c=CARDS[s.hand[index]];
  if(!c)return 'Choose a card.';if(c.cost>s.energy)return 'Not enough energy.';
  if(c.kind==='creature'){
    if(c.passive==='ritual')return 'Use Rite of the Ancients to summon this creature.';
    if(s.normal)return 'One Normal Summon per turn.';if(s.field.length>=4)return 'Your four summoning circles are occupied.';
    const u=unit(c);s.field.push(u);s.normal=true;log(b,`${who===0?'You summon':'Opponent summons'} ${c.name}.`);emit(b,{kind:'summon',uid:u.uid,type:c.type});
  }else if(c.kind==='attack'){
    const u=s.field.find(x=>x.uid===target);if(!u)return 'Choose a friendly creature to equip.';
    if(!canEquip(CARDS[u.id],c,u))return 'Class/type eligibility or remaining Magica / Stamina capacity does not match.';
    u.equipped=[...equippedCards(u),c.id];log(b,`${CARDS[u.id].name} equips ${c.name}. Capacities are reserved, never spent.`);
  }else{
    if(c.effect==='heal'){
      if(target==='hero'&&!c.creatureOnly)s.life=Math.min(200,s.life+(c.amount||40));
      else{const u=s.field.find(x=>x.uid===target);if(!u)return 'Choose a friendly creature to heal.';u.hp=Math.min(CARDS[u.id].hp,u.hp+(c.amount||40));emit(b,{kind:'heal',uid:u.uid,amount:c.amount||40,type:'Light'});}
    }
    if(c.effect==='remove'){const i=foe.field.findIndex(x=>x.uid===target);if(i<0)return 'Choose an enemy creature to disarm.';discardUnit(foe,i);}
    if(c.effect==='ritual'){
      const ids=Array.isArray(target)?target:tributes(s).map(t=>t.uid),ts=ids.map(uid=>s.field.find(u=>u.uid===uid));
      if(ids.length!==2||new Set(ids).size!==2||ts.some(u=>!u))return 'Choose two creatures already on your battlefield. Hand cards cannot be tributed.';
      const names=ts.map(u=>CARDS[u.id].name);for(const uid of ids)discardUnit(s,s.field.findIndex(u=>u.uid===uid));
      const u=unit(CARDS.elder);s.field.push(u);log(b,`Rite of the Ancients: ${names.join(' + ')} become Elder Wyrm. Equipped attacks go to the graveyard.`);emit(b,{kind:'summon',uid:u.uid,type:'Dark'});
    }else log(b,`${who===0?'You cast':'Opponent casts'} ${c.name}.`);
  }
  s.energy-=c.cost;s.hand.splice(index,1);if(c.kind==='spell')s.discard.push(c.id);
  if(c.effect==='draw')draw(b,who,2);if(c.effect==='energy')s.energy=Math.min(5,s.energy+1);
  if(c.effect==='search'){const i=s.deck.findIndex(id=>CARDS[id].kind==='creature');if(i>=0)s.hand.push(s.deck.splice(i,1)[0]);}
  checkWin(b);return null;
}
function chosenAttack(u,choice){const c=CARDS[u.id],eq=equippedCards(u);if(choice===true)choice=0;if(typeof choice==='number')return CARDS[eq[choice]]||null;if(typeof choice==='string')return eq.includes(choice)?CARDS[choice]:null;return {damage:c.damage,type:c.type,category:c.category,hits:c.hits||1,name:c.attackName};}
export function damageBreakdown(attacker,defender,choice=false){const c=CARDS[attacker.id],a=chosenAttack(attacker,choice)||{damage:0,type:c.type};const stab=a.type===c.type?10:0,weak=defender&&(CARDS[defender.id].weakness===a.type||a.strongAgainst?.includes(CARDS[defender.id].type))?20:0,sharp=c.passive==='sharpness'&&a.category==='Slashing'?10:0,affinity=c.passive==='firepower'&&a.type==='Fire'?15:0,guard=defender&&CARDS[defender.id].passive==='guard'?10:0,hits=a.hits||1,perHit=Math.max(0,a.damage+stab+weak+sharp+affinity-guard);return {base:a.damage,stab,weak,sharp,affinity,guard,hits,perHit,total:perHit*hits,type:a.type,effect:a.effect};}
export function attack(b,who,uid,target,choice=false){
  if(!allowed(b,who))return 'Wait for your turn.';if(b.ply===1)return 'The first player cannot attack on turn 1.';
  const s=b.sides[who],foe=b.sides[1-who],u=s.field.find(x=>x.uid===uid);
  if(!u)return 'Select your attacking creature.';if(u.acted)return 'This creature already acted this turn.';
  if(!chosenAttack(u,choice))return 'Choose an equipped Attack Card or the built-in attack.';
  if(target==='hero'&&foe.field.length)return 'Defeat the defending creatures first.';
  const v=foe.field.find(x=>x.uid===target);if(target!=='hero'&&!v)return 'Choose a target.';
  const d=damageBreakdown(u,v,choice);u.acted=true;
  let excess=0;if(v){excess=Math.max(0,d.total-v.hp);v.hp-=d.total;if(d.effect==='poison')v.poison=true;if(d.effect==='burn')v.burn=2;if(v.hp<=0)discardUnit(foe,foe.field.indexOf(v));foe.life=Math.max(0,foe.life-excess);}else foe.life=Math.max(0,foe.life-d.total);
  log(b,`${CARDS[u.id].name} → ${v?CARDS[v.id].name:'summoner'}: ${d.hits>1?d.hits+' × '+d.perHit+' = ':''}${d.total} damage${d.weak?' · advantage +20 / hit':''}${d.affinity?' · Fire affinity +15 / hit':''}${excess?` · ${excess} overkill to Life`:''}${d.effect?' · '+d.effect:''}.`);
  emit(b,{kind:'attack',uid:u.uid,target,type:d.type,damage:d.total,hits:d.hits,killed:!!v&&v.hp<=0});checkWin(b);return null;
}
export function endTurn(b,who){if(!allowed(b,who))return 'Wait for your turn.';b.active=1-who;b.ply++;const s=b.sides[b.active];s.energy=Math.min(5,s.energy+1);s.normal=false;for(let i=s.field.length-1;i>=0;i--){const u=s.field[i];u.acted=false;const dot=(u.poison?10:0)+(u.burn>0?10:0);if(u.burn>0)u.burn--;if(dot){u.hp-=dot;log(b,`${CARDS[u.id].name} takes ${dot} status damage.`);}if(u.hp<=0){discardUnit(s,i);continue;}if(CARDS[u.id].passive==='vitality')u.hp=Math.min(CARDS[u.id].hp,u.hp+10);}log(b,`${b.active===0?'Your':'Opponent’s'} turn · +1 energy.`);draw(b,b.active);return null;}
export function aiStep(b){
  if(b.active!==1||b.winner!==null)return false;const s=b.sides[1],foe=b.sides[0];
  if(!s.normal&&s.field.length<4){const options=s.hand.map((id,i)=>({c:CARDS[id],i})).filter(x=>x.c.kind==='creature'&&x.c.passive!=='ritual'&&x.c.cost<=s.energy).sort((a,v)=>(v.c.hp+v.c.damage)/(v.c.cost+1)-(a.c.hp+a.c.damage)/(a.c.cost+1));if(options.length){playCard(b,1,options[0].i);return true;}}
  for(let i=0;i<s.hand.length;i++){const c=CARDS[s.hand[i]];if(c.cost>s.energy)continue;
    if(c.effect==='energy'&&s.energy<5){playCard(b,1,i);return true;}
    if(c.effect==='ritual'&&s.field.length>=2&&!s.field.some(u=>u.id==='elder')){playCard(b,1,i);return true;}
    if(c.effect==='remove'&&foe.field.length){playCard(b,1,i,[...foe.field].sort((a,v)=>v.hp-a.hp)[0].uid);return true;}
    if(c.effect==='heal'){const u=s.field.find(u=>u.hp<=CARDS[u.id].hp-(c.amount||40));if(u){playCard(b,1,i,u.uid);return true;}}
    if(c.kind==='attack'){const u=s.field.find(u=>canEquip(CARDS[u.id],c,u)&&!equippedCards(u).includes(c.id));if(u){playCard(b,1,i,u.uid);return true;}}
  }
  const u=s.field.find(u=>!u.acted);if(u&&b.ply!==1){let best=null;const targets=foe.field.length?foe.field:[null];for(const target of targets){for(const choice of [false,...equippedCards(u).map((_,i)=>i)]){const d=damageBreakdown(u,target,choice);const score=d.total+(target&&d.total>=target.hp?35:0)+(d.effect?5:0);if(!best||score>best.score)best={target:target?.uid??'hero',choice,score};}}attack(b,1,u.uid,best.target,best.choice);return true;}
  const i=s.hand.findIndex(id=>['draw','search'].includes(CARDS[id].effect)&&CARDS[id].cost<=s.energy);if(i>=0&&s.hand.length<8){playCard(b,1,i);return true;}endTurn(b,1);return false;
}
