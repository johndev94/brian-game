import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {CARDS} from '../src/cards.js';
import {CARD_ART} from '../src/card-art.js';

test('every unique playable or Extra Deck card has its own complete artwork asset',async()=>{
  assert.deepEqual(Object.keys(CARD_ART).sort(),Object.keys(CARDS).sort());
  assert.equal(new Set(Object.values(CARD_ART)).size,25);
  for(const file of Object.values(CARD_ART)){
    const png=await readFile(new URL(`../public/cards/${file}.png`,import.meta.url));
    assert.equal(png.subarray(1,4).toString(),'PNG',file);
    assert.equal(png.readUInt32BE(16),1024,file+' width');assert.equal(png.readUInt32BE(20),1536,file+' height');
    const webp=await readFile(new URL(`../public/cards/${file}.webp`,import.meta.url));
    assert.equal(webp.subarray(8,12).toString(),'WEBP',file);
    assert.ok((await stat(new URL(`../public/cards/${file}.webp`,import.meta.url))).size<png.length,file+' optimized copy');
  }
});
