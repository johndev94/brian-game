# The Outer Realm

A playable browser RPG prototype based on the revised game concept. Explore the Verdant Expanse, meet the Fall Guard in Fallhaven, recover lost soul cards, investigate the old celestial wards, customize a 40-card deck and command summoned creatures in 3D battles.

## Play

Double-click **Play Outer Realm.cmd** on Windows, or run `npm install` then `npm run dev`. Open the local URL printed in the terminal, usually http://127.0.0.1:5173. Keep the terminal open. Node.js 20.19+ or 22.12+ is recommended.

- WASD / arrows: move. Shift: sprint. Drag the scenery: turn the camera.
- E: interact with a nearby person, trial, soul or memory.
- B: collection and deck editor. M: map and tracking. J: quest and lore journal. H: guide.
- Escape: close a panel or clear a battle selection.

Speak to the Wanderer, then meet Captain Mara in **Fallhaven**, east of the starting path. The settlement has four buildings, banners, a central fire, an archive and a medic. Recover three lost soul cards for Mara, and read at least two memory sites for Ilyan. Both quests grant card rewards. Seren also offers Healing Rays. Rewards are awarded once and progress saves automatically in browser local storage.

Investigate the grove, Emberfall ruins and Moonlit Shrine. Joining the Guard, winning those three trials and reading two memory sites unlocks the World Tree confrontation. The story follows an ordinary newly arrived soul; Solara, Lux, Nox, Umbra, the hollow Moon and the celestial ward are revealed through characters and discoveries. Existing saved collections, deck lists and victories are retained, with new journal fields added automatically.

## Revised combat and deck rules

- Main decks contain exactly 40 owned cards. The two starter ratios remain 20 creatures / 12 attacks / 8 spells. Archetypes such as Knight are separate from capability Classes.
- Start with 200 Life, 5 cards and 5 energy. Recover +1 energy per turn while keeping unspent energy. The earlier prototype's cap of 5 is retained because the revised brief does not explicitly replace it.
- One Normal Summon per turn. No summoning sickness; the first player cannot attack on the opening turn.
- Creatures may equip **multiple Attack Cards**. Their combined Magica requirements must fit the creature's Magica, and their combined Stamina requirements must fit its Stamina. Capacities are reserved by equipped cards, never consumed by attacks. Equips cost no energy.
- Choose the built-in attack or **one** equipped attack for a creature's action. Equip eligibility supports Class, Type and alternatives such as Dragon **OR** Fire-type Beast.
- **Ironblade Knight:** 70 HP, 3 energy, 20 Magica, 70 Stamina; Double Slash deals 30 twice, with +10 to each Slashing hit. The two hits are one action.
- **Emberwing Dragon:** 80 HP, 5 energy, 80 Magica, 30 Stamina; Flame Breath deals 50, and Fire attacks gain +15.
- **Flaming Slash:** 50 Stamina, 50 Fire damage, Burn. **Fire Breath:** 80 Magica, 60 Fire damage, Burn; Dragon or Fire-type Beast. **Healing Rays:** 2 energy, restore 30 creature HP.
- Burn deals 10 damage at the start of the affected player's next two turns. Poison deals 10 each affected turn until the creature leaves the field.
- Same-type bonus +10 per hit; weakness or an explicit Type advantage +20 per hit, once. Sharpness and Fire affinity are additional modifiers. Guard reduces each hit by 10. Multi-hit actions stay on their chosen target; excess total damage tramples into Life. Direct attacks require an empty defending field.
- **Rite of the Ancients requires two creatures already on your battlefield.** Select the spell, click two offerings, then confirm. It special summons Elder Wyrm without consuming the Normal Summon. Hand cards are ineligible. All equips follow a sacrificed or destroyed creature into the graveyard. The AI follows these same rules.

The prototype still uses four field slots, fatigue of 10/20/30… for empty draws, no instant response stack, no additional resistance chart, and no finite Extra Deck inventory. Those unresolved rules are explicit prototype choices rather than claims about final balance. AI simulation verifies legality and termination; it does not establish competitive balance.

## Cards and presentation

All 25 cards retain custom dark fantasy illustrations, with a new fire-themed illustration for Flaming Slash. **Current names, costs, capacities, attacks and rules are rendered as live text** over those illustrations so balance changes stay accurate. The original full-card PNGs contain earlier concept statistics and are labeled as original concept art in the gallery. Source PNGs and lightweight WebP copies are in `public/cards/`; the artwork prompts are in `art-prompts.md`, `art-prompts-complete.md`, and `art-prompts-revised.md`.

Battles include creature summoning, attack lunges, elemental projectiles, floating damage/healing and a brief camera push during attacks. The player has a leather gauntlet with a blue crystal and visible deck slot. Characters now use articulated knees, arms, breathing, and moving capes, with layered armour, face details, shield heraldry, swords, and a soul-card gauntlet. Dragons have shaped necks, jaws, teeth, claws, dorsal spines, curved tails, and ribbed animated wing membranes. The gryphon has layered feathers, Mossfang has a living mane and antlers, the Tide Serpent has a finned tail, and the Moonbound Shade has a floating hood and spectral hands. NPC equipment distinguishes guards, the Wanderer, the archivist, and the medic. Terrain has a procedural surface texture and irregular foliage. Graphics reduce automatically on slower devices.

## Scope

This remains a JavaScript / Three.js browser prototype, not a migrated Unity project. No Unity project was present in the workspace. It demonstrates the revised systems and one short regional story, rather than a complete open-world commercial RPG. Characters, creatures and scenery are original procedural meshes with articulated animation rather than imported, skinned production assets. A larger world, voice acting and multiplayer are not included.

## Verify

```sh
npm test
npm run build
```

For browser checks, start the development server, install Chromium with `npx playwright install chromium`, and run `npm run test:browser`. Tests cover pooled equipment limits, attack choices, Class/Type alternatives, multi-hit damage, burn, ritual selection and graveyards, reward idempotency, old-save migration, quest gating and complete AI matches. Browser checks exercise movement, dialogue, exploration, collection, live card artwork and combat.

The production build is in `dist/` and should be served over HTTP. Optional Google Fonts have system fallbacks. No accounts, API keys or backend are required.
