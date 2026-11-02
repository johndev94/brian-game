import * as T from 'three';
import { CARDS, types } from './cards.js';

// Shared resources keep the articulated models affordable on the battlefield.
const geometries = new Map(), materials = new Map();
function material(color, metalness = 0, emissive = false) {
  const key = `${color}:${metalness}:${emissive}`;
  if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({
    color, metalness, roughness: metalness ? .32 : .8,
    emissive: emissive ? color : '#000000', emissiveIntensity: emissive ? 1.4 : 0,
    side: T.DoubleSide,
  }));
  return materials.get(key);
}
function geometry(kind) {
  if (!geometries.has(kind)) geometries.set(kind, kind === 'sphere' ? new T.SphereGeometry(1, 16, 12)
    : kind === 'cone' ? new T.ConeGeometry(1, 1, 10)
      : kind === 'cylinder' ? new T.CylinderGeometry(1, 1, 1, 12)
        : kind === 'gem' ? new T.OctahedronGeometry(1) : new T.BoxGeometry(1, 1, 1));
  return geometries.get(kind);
}
function part(parent, kind, mat, position, scale) {
  const mesh = new T.Mesh(geometry(kind), mat);
  mesh.position.set(...position); mesh.scale.set(...scale);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function joint(parent, position) {
  const g = new T.Group(); g.position.set(...position); parent.add(g); return g;
}
function bone(parent, a, b, radius, mat, endRadius = radius) {
  const start = new T.Vector3(...a), end = new T.Vector3(...b), direction = end.clone().sub(start);
  const mesh = new T.Mesh(new T.CylinderGeometry(endRadius, radius, direction.length(), 8), mat);
  mesh.position.copy(start.add(end).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function curve(parent, points, radius, mat) {
  const path = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  const mesh = new T.Mesh(new T.TubeGeometry(path, 18, radius, 8, false), mat);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function cloth(parent, points, mat) {
  const shape = new T.Shape(); points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
  shape.closePath(); const mesh = new T.Mesh(new T.ShapeGeometry(shape), mat);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export function humanoid(color, player = false, role = 'guard') {
  const g = new T.Group(); g.name = player ? 'Soulbound adventurer' : role;
  const fabric = material(color), steel = material('#91a4ae', .8), gold = material('#be9455', .65);
  const leather = material('#49392f'), skin = material('#c2a78c'), shadow = material('#1c2932');
  const body = joint(g,[0,.94,0]);
  part(body,'sphere',fabric,[0,.3,0],[.25,.34,.17]);
  if (role !== 'wanderer' && role !== 'medic' && role !== 'archivist') {
    part(body,'sphere',steel,[0,.34,.06],[.25,.28,.15]);
    for (const x of [-.13,.13]) bone(body,[x,.16,.2],[x*.7,.5,.19],.018,gold);
    part(body,'gem',material('#79d9e9',0,true),[0,.42,.205],[.045,.07,.025]);
  }
  part(body,'cylinder',leather,[0,-.05,0],[.23,.1,.19]);
  part(body,'box',gold,[0,-.05,.2],[.09,.08,.035]);
  for (const side of [-1,1]) {
    const skirt = part(body,'box',fabric,[side*.17,-.22,-.015],[.2,.3,.28]); skirt.rotation.z=side*.15;
    part(body,'box',gold,[side*.17,-.35,.132],[.17,.025,.02]);
  }
  const head = joint(body,[0,.61,0]);
  part(head,'cylinder',skin,[0,.015,0],[.075,.15,.075]);
  part(head,'sphere',skin,[0,.23,0],[.16,.21,.155]);
  part(head,'sphere',leather,[0,.32,-.035],[.169,.145,.15]);
  part(head,'sphere',skin,[0,.215,.155],[.035,.045,.045]);
  for (const s of [-1,1]) {
    part(head,'sphere',skin,[s*.16,.22,0],[.035,.06,.035]);
    part(head,'box',shadow,[s*.064,.26,.142],[.045,.014,.015]);
    part(head,'box',leather,[s*.064,.295,.14],[.06,.018,.025]);
  }
  if (role === 'guard' && !player) {
    part(head,'sphere',steel,[0,.32,-.025],[.183,.19,.175]);
    part(head,'box',shadow,[0,.255,.151],[.25,.035,.035]);
    part(head,'box',gold,[0,.3,.18],[.035,.22,.025]);
  }
  const legs = [], arms = [];
  for (const s of [-1,1]) {
    const leg = joint(g,[s*.135,.82,0]); legs.push(leg);
    part(leg,'sphere',shadow,[0,-.18,0],[.105,.23,.1]);
    const knee = joint(leg,[0,-.38,.015]);
    part(knee,'sphere',steel,[0,0,.04],[.105,.105,.075]);
    part(knee,'sphere',leather,[0,-.16,-.015],[.09,.19,.09]);
    part(knee,'box',steel,[0,-.17,.065],[.12,.22,.045]);
    part(knee,'sphere',leather,[0,-.33,.07],[.115,.105,.2]);
    leg.userData.knee = knee;
    const arm = joint(body,[s*.3,.49,0]); arms.push(arm);
    part(arm,'sphere',steel,[s*.035,-.015,0],[.16,.12,.19]);
    part(arm,'sphere',fabric,[s*.025,-.18,0],[.08,.2,.08]);
    part(arm,'sphere',steel,[s*.03,-.32,.01],[.09,.07,.09]);
    part(arm,'sphere',leather,[s*.035,-.43,.035],[.085,.13,.085]);
    part(arm,'sphere',skin,[s*.035,-.59,.04],[.065,.085,.065]);
  }
  const cape = joint(body,[0,.53,-.15]);
  cloth(cape,[[-.23,0],[.23,0],[.36,-1.02],[.12,-.94],[0,-1.04],[-.32,-.98]],material(role==='wanderer'?'#5b6458':color));
  cape.rotation.x = .17;
  if (player) {
    const arm = arms[0];
    part(arm,'box',steel,[-.04,-.46,.05],[.21,.24,.19]);
    part(arm,'gem',material('#69dfff',0,true),[-.04,-.45,.16],[.07,.095,.035]);
    part(arm,'box',shadow,[-.04,-.32,.05],[.16,.025,.14]);
    for (let i=0;i<3;i++) part(arm,'box',gold,[-.04,-.31+i*.012,.05],[.13,.008,.11]);
  }
  if (role === 'wanderer' || role === 'archivist' || role === 'medic') {
    const staff = joint(arms[1],[.07,-.5,.12]);
    bone(staff,[0,-.8,0],[0,1.05,0],.032,leather);
    part(staff,'gem',material(role==='medic'?'#b4ebc3':'#a5cfe7',0,true),[0,1.12,0],[.1,.18,.1]);
    if(role==='wanderer') part(head,'cone',material('#c9c7b8'),[0,.025,.13],[.11,.28,.08]).rotation.z=Math.PI;
  }
  g.userData = { legs, arms, body, cape, head, modelKind:'humanoid', baseScale:1 };
  return g;
}

function wings(parent, color, feathered = false) {
  const result = [], membrane = material(color), rib = material('#4d5965',.3);
  for (const s of [-1,1]) {
    const wing = joint(parent,[s*.3,1.32,-.16]); result.push(wing);
    const outline = [[0,0],[s*.5,.58],[s*1.38,.68],[s*1.17,.21],[s*1.4,-.24],[s*.75,-.13],[s*.7,-.5],[s*.15,-.26]];
    cloth(wing,outline,membrane);
    bone(wing,[0,0,0],[s*.5,.58,0],.055,rib);
    for(const [x,y] of [[1.38,.68],[1.4,-.24],[.7,-.5]]) bone(wing,[s*.5,.58,.015],[s*x,y,.015],.025,rib,.012);
    if(feathered) for(let i=0;i<8;i++) {
      const feather=part(wing,'sphere',material(i%2?'#d6e0df':'#91abb5'),[s*(.38+i*.13),.1-i*.035,.035],[.09,.36-i*.014,.04]);
      feather.rotation.z=-s*(.45+i*.05);
    }
    wing.rotation.y = s*.25;
  }
  return result;
}

export function creature(id) {
  const c=CARDS[id]; if(!c || c.kind!=='creature') throw new Error(`Unknown creature: ${id}`);
  const g=new T.Group(); g.name=c.name;
  const color=types[c.type], hide=material(color,.12), dark=material('#293c48',.3);
  const ivory=material('#e5d4b0'), light=material(color,0,true), limbs=[];
  g.userData={modelKind:c.cls,baseScale:id==='elder'?1.2:id==='whelp'?.78:1};
  if(c.cls==='Warrior') {
    const human=humanoid(color,false,id==='squire'?'squire':'guard'); g.add(human);
    const hand=human.userData.arms[1];
    part(hand,'cone',material('#d0dce3',.9),[.035,-.05,.14],[.075,.85,.035]);
    part(hand,'box',ivory,[.035,-.49,.14],[.31,.045,.06]);
    part(hand,'cylinder',dark,[.035,-.59,.14],[.035,.19,.035]);
    const shield=joint(human.userData.arms[0],[-.04,-.35,.17]);
    const face=cloth(shield,[[-.25,.3],[.25,.3],[.27,-.08],[0,-.4],[-.27,-.08]],material('#536575',.7));
    face.position.z=.03;
    part(shield,'box',ivory,[0,-.02,.065],[.035,.49,.035]);
    part(shield,'box',ivory,[0,.1,.065],[.38,.035,.035]);
    part(shield,'gem',light,[0,.1,.1],[.07,.09,.04]);
    g.userData.human=human;
  } else if(c.cls==='Undead') {
    const body=joint(g,[0,1.1,0]); g.userData.body=body;
    part(body,'cone',dark,[0,-.25,0],[.45,1.3,.3]);
    part(body,'sphere',dark,[0,.55,0],[.27,.3,.23]);
    part(body,'sphere',material('#0e1626'),[0,.52,.16],[.19,.2,.1]);
    for(const s of [-1,1]) {
      part(body,'sphere',light,[s*.075,.57,.248],[.04,.018,.02]);
      curve(body,[[s*.25,.25,0],[s*.5,.05,0],[s*.55,-.2,.14]],.07,dark);
      for(let i=0;i<3;i++) bone(body,[s*(.49+i*.05),-.2,.14],[s*(.5+i*.06),-.4,.2],.015,ivory,.005);
      cloth(body,[[s*.15,.1],[s*.6,-.7],[s*.35,-.5],[s*.2,-.9]],material('#74659a'));
    }
    for(let i=0;i<5;i++) part(body,'gem',light,[Math.sin(i*2.4)*.45,-.7+(i%3)*.16,Math.cos(i*2.4)*.25],[.035,.11,.035]);
  } else {
    const dragon=c.cls==='Dragon', bird=c.cls==='Winged-Beast';
    part(g,'sphere',hide,[0,.88,-.12],[dragon?.43:.36,.45,dragon?.75:.6]);
    part(g,'sphere',dragon?ivory:dark,[0,.79,.26],[.29,.31,.37]);
    const neck=joint(g,[0,1.05,.38]); g.userData.head=neck;
    part(neck,'sphere',hide,[0,.28,.1],[.24,.4,.25]);
    part(neck,'sphere',hide,[0,.55,.29],[.29,.25,.37]);
    part(neck,'sphere',bird?ivory:dark,[0,.44,.56],[.22,.115,bird?.3:.27]);
    if(bird) part(neck,'cone',ivory,[0,.44,.81],[.15,.35,.12]).rotation.x=Math.PI/2;
    for(const s of [-1,1]) {
      part(neck,'sphere',light,[s*.235,.6,.45],[.045,.045,.05]);
      const horn=part(neck,'cone',ivory,[s*.21,.89,.1],[.075,.42,.075]); horn.rotation.z=-s*.3; horn.rotation.x=-.3;
      if(!bird) for(let i=0;i<3;i++) part(neck,'cone',ivory,[s*.14,.4,.47+i*.09],[.027,.08,.027]);
      for(const z of [-.52,.4]) {
        const leg=joint(g,[s*.32,.75,z]); limbs.push(leg);
        bone(leg,[0,0,0],[s*.13,-.3,-.1],.115,hide,.09);
        bone(leg,[s*.13,-.3,-.1],[s*.1,-.57,.05],.075,dark,.06);
        part(leg,'sphere',dark,[s*.1,-.61,.13],[.12,.07,.19]);
        for(let k=0;k<3;k++) part(leg,'cone',ivory,[s*.1+(k-1)*.075,-.62,.3],[.025,.13,.025]).rotation.x=Math.PI/2;
      }
    }
    const tail=joint(g,[0,.85,-.68]);g.userData.tail=tail;
    curve(tail,[[0,0,0],[.2,-.05,-.4],[.4,.1,-.8],[.55,.35,-1.1]],dragon?.12:.065,hide);
    if(dragon) {
      for(let i=0;i<6;i++) part(g,'cone',id==='storm'?light:ivory,[0,1.32-i*.05,.2-i*.19],[.07,.25-i*.02,.12]);
      if(id==='tide') {
        cloth(tail,[[0,.05],[.2,.6],[.4,.12],[.55,.65],[.6,.2]],light);
        g.userData.wings=[];
      } else g.userData.wings=wings(g,id==='elder'?'#77628a':id==='storm'?'#b5a166':'#995f50');
      if(id==='elder') for(const s of [-1,1]) for(let i=0;i<3;i++) part(neck,'cone',ivory,[s*(.12+i*.08),.92+i*.05,.2-i*.07],[.04,.3+i*.1,.04]);
    } else if(bird) g.userData.wings=wings(g,'#b4cac7',true);
    else {
      // Mossfang has a layered mane and living growths instead of dragon anatomy.
      for(let i=0;i<9;i++) {
        const a=i/9*Math.PI*2;
        const tuft=part(neck,'cone',material(i%2?'#416b4d':'#608354'),[Math.sin(a)*.3,.32+Math.cos(a)*.26,-.12],[.13,.45,.14]);
        tuft.rotation.z=-a;
      }
      for(const s of [-1,1]) curve(neck,[[s*.2,.76,.08],[s*.4,1.02,-.04],[s*.34,1.25,.05]],.035,ivory);
    }
    g.userData.limbs=limbs;
  }
  const ring=new T.Mesh(new T.TorusGeometry(.88,.018,6,48),light);ring.rotation.x=Math.PI/2;ring.position.y=.025;g.add(ring);
  g.scale.setScalar(g.userData.baseScale); return g;
}

export function animateModel(model,time,moving=false,attack=0) {
  const d=model.userData;
  if(d.human) animateModel(d.human,time,moving,attack);
  for(const [i,leg] of (d.legs||[]).entries()) {
    leg.rotation.x=moving?Math.sin(time*9+i*Math.PI)*.45:0;
    leg.userData.knee.rotation.x=moving?Math.max(0,Math.sin(time*9+i*Math.PI))*.5:0;
  }
  for(const [i,arm] of (d.arms||[]).entries()) arm.rotation.x=(moving?Math.sin(time*9+i*Math.PI)*-.3:Math.sin(time*1.8)*.035)-attack*(i===1?1.3:.3);
  if(d.cape) {d.cape.rotation.x=.17+Math.sin(time*3)*.045+(moving?.22:0);d.cape.rotation.z=Math.sin(time*2)*.035;}
  if(d.body) {d.body.scale.y=1+Math.sin(time*2)*.012;if(d.modelKind==='Undead')d.body.position.y=1.1+Math.sin(time*2)*.12;}
  if(d.head) d.head.rotation.x=Math.sin(time*1.7)*.035-attack*.2;
  if(d.tail) d.tail.rotation.y=Math.sin(time*2)*.18;
  for(const [i,wing] of (d.wings||[]).entries()) wing.rotation.z=(i===0?-1:1)*(.12+Math.sin(time*2.5)*.12+attack*.3);
  for(const [i,limb] of (d.limbs||[]).entries()) limb.rotation.x=attack*Math.sin(time*12+i)*.2;
}
