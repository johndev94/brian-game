import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1100},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5173');
await page.evaluate(async()=>{
 const T=await import('/node_modules/three/build/three.module.js');
 const {creature,humanoid,animateModel}=await import('/src/models.js');
 const {CARDS}=await import('/src/cards.js');
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#13232d;color:#e0d7bf;font-family:Georgia';
 const canvas=document.createElement('canvas');document.body.append(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setSize(1600,1100);renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.setScissorTest(true);
 const models=[humanoid('#485964',true),...Object.values(CARDS).filter(c=>c.kind==='creature').map(c=>creature(c.id))];
 const results=[];
 for(let i=0;i<models.length;i++) {
  const m=models[i],col=i%5,row=Math.floor(i/5),w=320,h=350;
  const scene=new T.Scene();scene.background=new T.Color('#192c38');scene.add(new T.HemisphereLight('#d8efff','#5c4834',3));
  const sun=new T.DirectionalLight('#ffdfb6',4);sun.position.set(-3,6,5);scene.add(sun);const rim=new T.DirectionalLight('#729eff',3);rim.position.set(3,3,-4);scene.add(rim);
  scene.add(m);animateModel(m,1.5,true,.4);m.rotation.y=-.42;
  const box=new T.Box3().setFromObject(m),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
  const camera=new T.PerspectiveCamera(35,w/h,.1,100);const distance=Math.max(size.x*h/w,size.y,size.z)*1.9;
  camera.position.set(center.x+distance*.12,center.y+distance*.18,center.z+distance);camera.lookAt(center);
  renderer.setViewport(col*w,1100-(row+1)*h,w-6,h-35);renderer.setScissor(col*w,1100-(row+1)*h,w-6,h-35);renderer.render(scene,camera);
  const label=document.createElement('div');label.textContent=m.name;label.style.cssText=`position:absolute;left:${col*w}px;top:${row*h+330}px;width:314px;text-align:center;font-size:17px`;document.body.append(label);
  results.push({name:m.name,bounds:size.toArray(),meshes:0});m.traverse(o=>{if(o.isMesh)results.at(-1).meshes++});
 }
 window.modelResults=results;
});
console.log(JSON.stringify(await page.evaluate(()=>window.modelResults)));
await page.screenshot({path:'artifacts/upgraded-models.png'});await browser.close();
