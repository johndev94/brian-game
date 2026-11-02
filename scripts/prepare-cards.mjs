// Prepare lightweight web copies without altering the full-resolution originals.
import { chromium } from '@playwright/test';
import { writeFile,access } from 'node:fs/promises';
import { CARD_ART } from '../src/card-art.js';
const browser=await chromium.launch();
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5173');
  for(const name of Object.values(CARD_ART)){
    if(await access(`public/cards/${name}.webp`).then(()=>true,()=>false))continue;
    if(!await access(`public/cards/${name}.png`).then(()=>true,()=>false))continue;
    const encoded=await page.evaluate(async name=>{
      const img=new Image();img.src=`/cards/${name}.png`;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1152;canvas.getContext('2d').drawImage(img,0,0,768,1152);
      return canvas.toDataURL('image/webp',.9).split(',')[1];
    },name);
    await writeFile(`public/cards/${name}.webp`,Buffer.from(encoded,'base64'));
    console.log(`Prepared ${name}.webp`);
  }
}finally{await browser.close();}
