import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { types } from './cards.js';
import { humanoid, creature, animateModel } from './models.js';

export const LOCATIONS=[
  {id:'mentor',name:'The Wanderer',subtitle:'A voice in the silence',x:3,z:16,kind:'story'},
  {id:'grove',name:'The Whispering Grove',subtitle:'Wild encounter · Nature',x:-11,z:5,kind:'battle',deck:'Knight',reward:'moss'},
  {id:'ruins',name:'Emberfall Ruins',subtitle:'Fall Guard trial · Fire',x:14,z:-6,kind:'battle',deck:'Dragon',reward:'venom'},
  {id:'shrine',name:'The Moonlit Shrine',subtitle:'A shadow stirs · Dark',x:-15,z:-17,kind:'battle',deck:'Dragon',reward:'umbra'},
  {id:'tree',name:'Heart of the World Tree',subtitle:'The roots remember',x:0,z:-30,kind:'final',deck:'Dragon',reward:'storm'},
  {id:'captain',name:'Captain Mara',subtitle:'Fallhaven · Fall Guard',x:23,z:19,kind:'npc'},
  {id:'archivist',name:'Archivist Ilyan',subtitle:'Fallhaven · Archive',x:18,z:25,kind:'npc'},
  {id:'medic',name:'Seren, Field Medic',subtitle:'Fallhaven · Sanctuary',x:28,z:25,kind:'npc'},
  {id:'echo-grove',name:'A Soul Among the Ferns',subtitle:'Lost soul card',x:-23,z:15,kind:'discovery'},
  {id:'echo-ruins',name:'An Ember in the Ash',subtitle:'Lost skill memory',x:26,z:-17,kind:'discovery'},
  {id:'echo-moon',name:'A Name in the Dark',subtitle:'Lost soul card',x:-25,z:-28,kind:'discovery'},
  {id:'lore-ward',name:'Stones of the Star Ward',subtitle:'Lore memory',x:-7,z:-4,kind:'lore'},
  {id:'lore-roots',name:'The Rootkeeper’s Memory',subtitle:'Lore memory',x:7,z:-19,kind:'lore'},
  {id:'lore-below',name:'A Fracture Beneath the Shrine',subtitle:'Lore memory',x:-23,z:-9,kind:'lore'},
];
export function ground(x,z){return .45*Math.sin(x*.13)*Math.cos(z*.12)+.22*Math.sin(z*.24)+Math.min(1,Math.abs(x)/16)*.5;}
const mat=(c,roughness=.85,metalness=0)=>new T.MeshStandardMaterial({color:c,roughness,metalness});
const glow=(c,strength=1)=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:strength,roughness:.35});
export class Realm{
  constructor(canvas){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
    this.scene=new T.Scene();this.scene.background=new T.Color('#20353d');this.scene.fog=new T.FogExp2('#253c42',.010);
    this.camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,.1,280);
    this.scene.add(new T.HemisphereLight('#b2dadd','#263d2c',2.0));
    const sun=new T.DirectionalLight('#ffe4bb',3.1);sun.position.set(-24,45,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:.5,far:120});sun.shadow.normalBias=.08;this.scene.add(sun);
    const blue=new T.DirectionalLight('#79b9da',1.5);blue.position.set(20,12,-50);this.scene.add(blue);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.composer.addPass(new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.38,.5,.9));
    this.keys=new Set();this.yaw=0;this.position=new T.Vector3(0,0,24);this.moving=false;this.mode='title';this.elapsed=0;this.dragging=false;this.battleUnits=new Map();this.effects=[];this.lowQuality=false;this.slowFrames=0;
    this.obstacles=[];this.seenEvents=new Set();this.buildTerrain();this.buildTree();this.buildRuins();this.buildSky();this.buildArena();this.buildTown();
    this.avatar=this.humanoid('#485964',true);this.avatar.rotation.y=Math.PI;this.scene.add(this.avatar);
    this.markers=LOCATIONS.map((l,i)=>{const g=new T.Group();g.position.set(l.x,ground(l.x,l.z)+.1,l.z);this.scene.add(g);const hue=l.kind==='npc'||i===0?'#edcf8c':l.kind==='lore'?'#b9a6e6':'#80cfc4';const ring=new T.Mesh(new T.TorusGeometry(1.25,.025,6,64),glow(hue,1));ring.rotation.x=Math.PI/2;g.add(ring);const gem=new T.Mesh(new T.OctahedronGeometry(l.kind==='lore'?.2:.28),glow(hue,1.5));gem.position.y=2.2;g.add(gem);if(l.id==='mentor'||l.kind==='npc'){const npc=this.humanoid(l.id==='medic'?'#c8bfa0':l.id==='captain'?'#536b7c':'#7e7971',false,l.id==='mentor'?'wanderer':l.id==='medic'?'medic':l.id==='archivist'?'archivist':'guard');g.add(npc);}if(l.kind==='discovery'){const soul=this.creature(l.id==='echo-grove'?'moss':l.id==='echo-moon'?'umbra':'whelp');soul.scale.setScalar(.55);g.add(soul);}if(l.kind==='lore'){this.mesh(new T.BoxGeometry(.9,1.9,.4),mat('#67777b'),g,[0,.95,0]);for(let k=0;k<4;k++)this.mesh(new T.BoxGeometry(.45-k*.06,.025,.015),glow(hue,1),g,[0,1.6-k*.3,.215]);}return {g,gem,...l};});
    addEventListener('resize',()=>this.resize());this.resize();
  }
  mesh(geo,material,parent,pos=[0,0,0],scale=null){const m=new T.Mesh(geo,material);m.position.set(...pos);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  surfaceTexture(repeat=30){const size=128,data=new Uint8Array(size*size*4);for(let i=0;i<size*size;i++){const x=i%size,z=Math.floor(i/size),v=150+Math.floor((Math.sin(x*12.9898+z*78.233)*43758.5453%1)*30)+Math.sin(x*.4)*10;data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.needsUpdate=true;return t;}
  buildTerrain(){
    const geo=new T.PlaneGeometry(180,180,150,150);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[];const a=new T.Color(), grass=new T.Color('#466350'),path=new T.Color('#79775d');
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,ground(x,z));const trail=(Math.abs(x-Math.sin(z*.1)*2)<2.2&&z>-32&&z<36)||(z>17&&z<25&&x>0&&x<32);const n=(Math.sin(x*3.7+z*7.9)+1)*.045;a.copy(trail?path:grass).multiplyScalar(.88+n);colors.push(a.r,a.g,a.b);}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();this.mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,map:this.surfaceTexture(55)}),this.scene);
    const crown=new T.IcosahedronGeometry(2.5,2);crown.scale(1,1.3,1);const cp=crown.attributes.position;for(let i=0;i<cp.count;i++){const f=1+.12*Math.sin(cp.getX(i)*13+cp.getY(i)*9+cp.getZ(i)*7);cp.setXYZ(i,cp.getX(i)*f,cp.getY(i)*f,cp.getZ(i)*f);}crown.computeVertexNormals();
    const trunks=new T.InstancedMesh(new T.CylinderGeometry(.13,.25,4.8,10),mat('#404e43'),175),leaves=new T.InstancedMesh(crown,mat('#294c40'),350);const dummy=new T.Object3D();let count=0;let seed=37;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    while(count<175){const x=(rand()-.5)*140,z=(rand()-.5)*140;if(Math.abs(x)<9||Math.hypot(x-23,z-23)<16||LOCATIONS.some(l=>Math.hypot(l.x-x,l.z-z)<6)||Math.hypot(x,z+30)<15)continue;const s=.7+rand()*1.3;dummy.position.set(x,ground(x,z)+2.4*s,z);dummy.scale.set(s,s,s);dummy.rotation.y=rand()*6;dummy.updateMatrix();trunks.setMatrixAt(count,dummy.matrix);dummy.position.y=ground(x,z)+5*s;dummy.updateMatrix();leaves.setMatrixAt(count*2,dummy.matrix);dummy.position.y+=2.1*s;dummy.scale.multiplyScalar(.72);dummy.updateMatrix();leaves.setMatrixAt(count*2+1,dummy.matrix);count++;}trunks.castShadow=true;leaves.castShadow=true;this.scene.add(trunks,leaves);
    const rockMat=mat('#657573');for(let i=0;i<65;i++){const x=(rand()-.5)*110,z=(rand()-.5)*110;if(Math.abs(x)<4||Math.hypot(x-23,z-23)<16||LOCATIONS.some(l=>Math.hypot(l.x-x,l.z-z)<3))continue;this.mesh(new T.DodecahedronGeometry(.5+rand()*1.3,0),rockMat,this.scene,[x,ground(x,z),z],[1.3,.8,1]);}
    for(let i=0;i<18;i++){const angle=i/18*Math.PI*2,r=95+rand()*20;const x=Math.sin(angle)*r,z=Math.cos(angle)*r;this.mesh(new T.ConeGeometry(15+rand()*16,25+rand()*24,5),mat(i%2?'#344c51':'#3f5557'),this.scene,[x,7,z]);}
    // Pools of soft cyan flowers through the forest floor.
    const flowers=new T.InstancedMesh(new T.OctahedronGeometry(.055),glow('#a1e4cd',1.2),350);for(let i=0;i<350;i++){const x=(rand()-.5)*80,z=(rand()-.5)*80;dummy.position.set(x,ground(x,z)+.2,z);dummy.scale.setScalar(.5+rand());dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);}this.scene.add(flowers);
  }
  buildTree(){
    const tree=new T.Group();tree.position.set(0,ground(0,-34),-34);this.scene.add(tree);const bark=mat('#4b5951'),mint=glow('#83cdb6',.35);
    const points=[new T.Vector3(0,0,0),new T.Vector3(-1,5,0),new T.Vector3(1,11,-1),new T.Vector3(0,18,0),new T.Vector3(-2,24,-1)];this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),35,1.6,10,false),bark,tree);
    for(let i=0;i<10;i++){const ang=i*2.4,end=new T.Vector3(Math.cos(ang)*(8+i%3*2),19+i%4*1.7,Math.sin(ang)*8);const start=new T.Vector3(0,9+i*.8,0);this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3([start,new T.Vector3(end.x*.4,end.y-2,end.z*.4),end]),12,.4,6),bark,tree);for(let j=0;j<3;j++)this.mesh(new T.IcosahedronGeometry(2.7+(i%3)*.4,1),mint,tree,[end.x+Math.sin(i+j*2)*2.5,end.y+1+j*.9,end.z+Math.cos(i+j*2)*2],[1.2,.7,1]);}
    for(let i=0;i<7;i++){const ang=i*Math.PI*2/7;this.mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,2,0),new T.Vector3(Math.sin(ang)*4,0,Math.cos(ang)*4),new T.Vector3(Math.sin(ang)*8,-.2,Math.cos(ang)*8)]),12,.5,7),bark,tree);}
    const light=new T.PointLight('#7fe6d0',25,30,1.5);light.position.set(0,10,0);tree.add(light);
    const portal=this.mesh(new T.TorusGeometry(2.6,.075,8,80),glow('#9fe9d6',2),tree,[0,4,1.8]);portal.rotation.z=.2;
  }
  buildRuins(){const stone=mat('#74817b');for(const [x,z] of [[14,-6],[-15,-17]]){const baseY=ground(x,z);for(const dx of [-2.3,2.3]){this.mesh(new T.BoxGeometry(.9,4,.9),stone,this.scene,[x+dx,baseY+2,z]);this.mesh(new T.BoxGeometry(1.2,.3,1.2),stone,this.scene,[x+dx,baseY+4,z]);}const arch=this.mesh(new T.TorusGeometry(2.3,.5,5,24,Math.PI),stone,this.scene,[x,baseY+3.8,z]);arch.rotation.z=0;this.mesh(new T.CylinderGeometry(3.5,3.7,.25,32),stone,this.scene,[x,baseY,z]);}
    for(let i=0;i<5;i++)this.mesh(new T.BoxGeometry(1,.6,1.5),stone,this.scene,[10+i*1.4,ground(10+i*1.4,-10),-11-i%2]);
  }
  buildSky(){
    const sky=new T.Mesh(new T.SphereGeometry(240,32,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#102a3b')},bottom:{value:new T.Color('#3a5959')}},vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v; uniform vec3 top; uniform vec3 bottom; void main(){float h=normalize(v).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.1,.8,h)),1.);}'}));this.scene.add(sky);this.sky=sky;
    const moon=this.mesh(new T.SphereGeometry(6,36,24),new T.MeshBasicMaterial({color:'#d9e7d7',fog:false}),this.scene,[-37,53,-98]);const ring=this.mesh(new T.TorusGeometry(8,.07,6,100),new T.MeshBasicMaterial({color:'#99babb',fog:false,transparent:true,opacity:.5}),this.scene,[-37,53,-98]);ring.rotation.x=.3;
    const p=[];for(let i=0;i<300;i++){const x=Math.sin(i*127.1)*100,z=Math.cos(i*311.7)*100,y=18+Math.abs(Math.sin(i*93))*110;p.push(x,y,z);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));this.scene.add(new T.Points(g,new T.PointsMaterial({color:'#dce8df',size:.14,sizeAttenuation:true,transparent:true,opacity:.7})));
    const motes=[];for(let i=0;i<130;i++)motes.push(Math.sin(i*42)*34,1+Math.abs(Math.sin(i*2))*8,Math.cos(i*71)*40);const mg=new T.BufferGeometry();mg.setAttribute('position',new T.Float32BufferAttribute(motes,3));this.motes=new T.Points(mg,new T.PointsMaterial({color:'#b7ead6',size:.07,transparent:true,opacity:.8}));this.scene.add(this.motes);
  }
  buildTown(){
    const walls=mat('#a99d81'),wood=mat('#51463c'),roof=mat('#465d67'),stone=mat('#667471'),gold=mat('#c2a36d',.4,.5);
    for(const [x,z,w,d,h] of [[15,19,4,4,3.8],[21,30,5,4,4],[31,18,5,5,5],[32,29,4,4,3.6]]){
      const y=ground(x,z);this.mesh(new T.BoxGeometry(w,h,d),walls,this.scene,[x,y+h/2,z]);
      const top=this.mesh(new T.ConeGeometry(Math.max(w,d)*.83,2.3,4),roof,this.scene,[x,y+h+1,z]);top.rotation.y=Math.PI/4;
      for(const dx of [-w/2,w/2])this.mesh(new T.BoxGeometry(.16,h+.1,d+.15),wood,this.scene,[x+dx,y+h/2,z]);
      this.mesh(new T.BoxGeometry(w+.1,.17,d+.1),wood,this.scene,[x,y+h*.55,z]);
      this.mesh(new T.BoxGeometry(1.1,2,.1),wood,this.scene,[x,y+1,z+d/2+.03]);
      for(const dx of [-w*.31,w*.31]){this.mesh(new T.BoxGeometry(.6,.7,.08),glow('#b99453',.2),this.scene,[x+dx,y+1.9,z+d/2+.05]);this.mesh(new T.BoxGeometry(.055,.7,.1),wood,this.scene,[x+dx,y+1.9,z+d/2+.1]);}
      this.obstacles.push({x,z,w:w/2+.4,d:d/2+.4});
    }
    const centerY=ground(23,23);this.mesh(new T.CylinderGeometry(1.2,1.3,.5,18),stone,this.scene,[23,centerY+.25,23]);
    const fire=this.mesh(new T.IcosahedronGeometry(.45,1),glow('#e7ac60',2),this.scene,[23,centerY+1,23]);fire.scale.set(.7,1.7,.7);
    const light=new T.PointLight('#ffd6a0',12,11);light.position.set(23,centerY+2,23);this.scene.add(light);
    for(const [x,z] of [[17,15],[29,14],[16,29],[29,30]]){const y=ground(x,z);this.mesh(new T.CylinderGeometry(.065,.1,4.2,8),wood,this.scene,[x,y+2.1,z]);const flag=this.mesh(new T.PlaneGeometry(1.15,1.8,4,6),new T.MeshStandardMaterial({color:'#29475e',side:T.DoubleSide,roughness:.9}),this.scene,[x+.6,y+3,z]);this.mesh(new T.TorusGeometry(.24,.025,6,20),gold,this.scene,[x+.6,y+3,z+.02]);}
    for(let i=0;i<5;i++){this.mesh(new T.BoxGeometry(.8,.65,.8),wood,this.scene,[12+i*.85,ground(12+i*.85,28)+.32,28]);}
  }
  humanoid(color,player=false,role='guard'){return humanoid(color,player,role);}
  creature(id){return creature(id);}
  buildArena(){this.arena=new T.Group();this.arena.position.x=200;this.scene.add(this.arena);const floor=this.mesh(new T.CylinderGeometry(12,13,.8,64),mat('#4c6260'),this.arena,[0,-.45,0]);for(const r of [5,9,11.5]){const ring=this.mesh(new T.TorusGeometry(r,.035,6,100),glow('#91c6bb',.6),this.arena,[0,.015,0]);ring.rotation.x=Math.PI/2;}for(let i=0;i<12;i++){const a=i/12*Math.PI*2;this.mesh(new T.CylinderGeometry(.4,.6,4,7),mat('#627771'),this.arena,[Math.sin(a)*11,1.2,Math.cos(a)*11]);}const light=new T.PointLight('#d9bd83',70,35);light.position.set(0,8,0);this.arena.add(light);this.arena.visible=false;}
  setBattle(b){if(this.mode!=='battle'){this.seenEvents.clear();this.camera.position.set(211,10,15);this.camera.lookAt(200,1,0);}this.mode='battle';this.arena.visible=true;this.avatar.visible=false;this.processEvents(b);const keep=new Set();b.sides.forEach((s,side)=>s.field.forEach((u,i)=>{keep.add(u.uid);let model=this.battleUnits.get(u.uid);if(!model){model=this.creature(u.id);this.arena.add(model);this.battleUnits.set(u.uid,model);model.userData.born=this.elapsed;}model.userData.tx=(i-(s.field.length-1)/2)*2.8;model.userData.tz=side===0?3.6:-3;model.rotation.y=side===0?Math.PI:0;}));for(const [uid,m] of this.battleUnits){if(!keep.has(uid)){this.arena.remove(m);this.battleUnits.delete(uid);}}}
  leaveBattle(){this.mode='explore';this.arena.visible=false;this.avatar.visible=true;for(const m of this.battleUnits.values())this.arena.remove(m);this.battleUnits.clear();}
  burst(uid){const model=this.battleUnits.get(uid);if(model)model.userData.attack=this.elapsed;}
  processEvents(b){for(const event of b.events||[]){if(this.seenEvents.has(event.id))continue;this.seenEvents.add(event.id);const source=this.battleUnits.get(event.uid),target=this.battleUnits.get(event.target);if(source&&event.kind==='attack'){source.userData.attack=this.elapsed;this.cinematicUntil=this.elapsed+1.1;}if(event.kind==='attack'||event.kind==='heal'){
      const from=source?source.position.clone():new T.Vector3(0,1,0),to=target?target.position.clone():event.kind==='heal'?from.clone():new T.Vector3(0,1,-5.5);
      const group=new T.Group();this.arena.add(group);const color=event.kind==='heal'?'#9dd9a0':types[event.type]||'#d7d9b9';
      const orb=this.mesh(new T.SphereGeometry(.16,10,8),glow(color,3),group);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');ctx.textAlign='center';ctx.font='bold 68px Georgia';ctx.lineWidth=7;ctx.strokeStyle='#152b32';ctx.strokeText(event.kind==='heal'?'+'+event.amount:'−'+event.damage,128,88);ctx.fillStyle=color;ctx.fillText(event.kind==='heal'?'+'+event.amount:'−'+event.damage,128,88);const texture=new T.CanvasTexture(canvas),sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(2.1,1.05,1);sprite.position.copy(to).add(new T.Vector3(0,2.5,0));group.add(sprite);this.effects.push({group,orb,sprite,from,to,born:this.elapsed,texture});
    }}
  }
  updateEffects(){for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i],age=this.elapsed-e.born;e.orb.position.lerpVectors(e.from,e.to,Math.min(1,age*3));e.orb.position.y+=1.2+Math.sin(Math.min(1,age*3)*Math.PI)*.6;e.sprite.position.y=e.to.y+2.2+age*.9;e.sprite.material.opacity=Math.min(1,(1.3-age)*2);if(age>1.3){this.arena.remove(e.group);e.orb.geometry.dispose();e.orb.material.dispose();e.sprite.material.dispose();e.texture.dispose();this.effects.splice(i,1);}}}
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer.setSize(innerWidth,innerHeight);}
  setQuality(low){this.lowQuality=low;this.renderer.shadowMap.enabled=!low;this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.6));this.resize();}
  recordFrame(dt){if(!this.lowQuality){this.slowFrames=dt>.085?this.slowFrames+1:Math.max(0,this.slowFrames-1);if(this.slowFrames>8)this.setQuality(true);}}
  update(dt,canMove){this.elapsed+=dt;const t=this.elapsed;this.updateEffects(dt);
    for(const m of this.markers){m.gem.rotation.y=t*.7;m.gem.position.y=2.25+Math.sin(t*1.6)*.15;for(const child of m.g.children)if(child.userData.modelKind)animateModel(child,t);}
    this.motes.rotation.y=t*.008;
    if(this.mode==='battle'){
      const desired=this.cinematicUntil>t?new T.Vector3(207,6.5,11):new T.Vector3(211,10,15);this.camera.position.lerp(desired,Math.min(1,dt*4));this.camera.lookAt(200,1,0);
      for(const m of this.battleUnits.values()){const attack=m.userData.attack===undefined?0:Math.max(0,Math.sin(Math.min(1,(t-m.userData.attack)/.5)*Math.PI));animateModel(m,t,false,attack);m.position.x=T.MathUtils.lerp(m.position.x,m.userData.tx,.15);m.position.z=T.MathUtils.lerp(m.position.z,m.userData.tz,.15);m.position.y=Math.sin(t*2+m.userData.tx)*.035;const born=Math.min(1,(t-m.userData.born)*2);m.scale.setScalar(m.userData.baseScale*born);if(m.userData.attack&&t-m.userData.attack<.5)m.position.z+=Math.sin((t-m.userData.attack)*Math.PI*2)*.8;}
    }else{
      this.moving=false;
      if(canMove){const oldX=this.position.x,oldZ=this.position.z;const f=(this.keys.has('w')||this.keys.has('arrowup')?1:0)-(this.keys.has('s')||this.keys.has('arrowdown')?1:0),r=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0);if(f||r){const speed=this.keys.has('shift')?10:5.5,normal=Math.hypot(f,r);this.position.x+=(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*r)/normal*dt*speed;this.position.z+=(-Math.cos(this.yaw)*f-Math.sin(this.yaw)*r)/normal*dt*speed;this.position.x=T.MathUtils.clamp(this.position.x,-55,55);this.position.z=T.MathUtils.clamp(this.position.z,-53,48);this.avatar.rotation.y=Math.atan2(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*r,-Math.cos(this.yaw)*f-Math.sin(this.yaw)*r);this.moving=true;}if(this.obstacles.some(o=>Math.abs(this.position.x-o.x)<o.w&&Math.abs(this.position.z-o.z)<o.d)){this.position.x=oldX;this.position.z=oldZ;this.moving=false;}}
      this.position.y=ground(this.position.x,this.position.z);this.avatar.position.copy(this.position);animateModel(this.avatar,t,this.moving);if(this.moving){this.avatar.position.y+=Math.sin(t*14)*.05;this.avatar.rotation.z=Math.sin(t*7)*.025;}
      const title=this.mode==='title';const desired=title?new T.Vector3(12,7,30):new T.Vector3(this.position.x+Math.sin(this.yaw)*8, this.position.y+3.5,this.position.z+Math.cos(this.yaw)*8);this.camera.position.lerp(desired,Math.min(1,dt*5));this.camera.lookAt(title?new T.Vector3(0,12,-30):new T.Vector3(this.position.x,this.position.y+3.1,this.position.z));
    }
    this.sky.position.copy(this.camera.position);if(this.lowQuality)this.renderer.render(this.scene,this.camera);else this.composer.render();
  }
  nearest(){return LOCATIONS.map(l=>({...l,distance:Math.hypot(l.x-this.position.x,l.z-this.position.z)})).sort((a,b)=>a.distance-b.distance)[0];}
  ensureWalkable(){for(const o of this.obstacles){const dx=this.position.x-o.x,dz=this.position.z-o.z;if(Math.abs(dx)<o.w&&Math.abs(dz)<o.d){if(o.w-Math.abs(dx)<o.d-Math.abs(dz))this.position.x=o.x+(dx>=0?1:-1)*(o.w+.3);else this.position.z=o.z+(dz>=0?1:-1)*(o.d+.3);}}}
  screenMarkers(){return this.markers.map(m=>{const p=new T.Vector3(m.x,ground(m.x,m.z)+3.1,m.z).project(this.camera);const distance=Math.hypot(m.x-this.position.x,m.z-this.position.z);return {...m,left:(p.x*.5+.5)*innerWidth,top:(-.5*p.y+.5)*innerHeight,visible:p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1&&distance<47,distance};});}
}
