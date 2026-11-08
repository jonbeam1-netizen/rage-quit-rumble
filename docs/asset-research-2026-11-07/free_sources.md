# Free 3D asset candidates: hand-painted, human-proportioned characters for Rage Quit Rumble

Scope: free sources only. This version includes both user corrections:
- The target is realistic adult proportions (about 6 to 8 heads), like the body type of Synty POLYGON City Characters, on a standard Humanoid or Mixamo-compatible rig.
- The look must be a WoW / Torchlight / Battle Chasers **hand-painted diffuse with painted facial features**. Flat-colour, dot-eye, vertex-colour packs (Synty, Kenney, KayKit, and similar) are out.

## How I checked, and what I could not verify

- Sketchfab facts (license, face count, animation count, rig notes, thumbnail URLs) come from Sketchfab's public API (`api.sketchfab.com/v3/models/{uid}`). Sketchfab "faceCount" is about the triangle count.
- **I could not view preview images.** Every proportions and face rating for a Sketchfab model is inferred from its tags, description and artist type, and is marked "(unverified)". Opening the thumbnails takes about 2 minutes per model and should come before any decision.
- OpenGameArt returned HTTP 403 to my fetcher, so OGA licenses are from search snippets only.
- The reference atlas `scratchpad\ref\barbarians_tex.png` does not exist, so I could not compare palettes.
- Sketchfab "CC Attribution" means CC BY 4.0: commercial use is OK and credit is required. That is fine for a shipped web game.

**Ratings (each /5):**
- **Style:** match to the Toon RTS Units *texture and colour* style.
- **Prop:** proportions, 5 = realistic adult.
- **Face:** 5 = painted eyes, brows and mouth at WoW quality; 1 = dots or blank.
- **Qual:** quality.
- **Cust:** customization value.

**Ranking:** the user says faces can be repainted in Blender, so the Face rating is informational only. Nothing here was cut for a weak face. Candidates are ranked on proportions, standard humanoid rig, painted style (or how easy a repaint is), and customization value.

**Rig field:** "Std" means Mixamo / Unity-Humanoid-compatible as shipped. "Retarget" means a standard biped hierarchy with non-Mixamo names (easy in Blender or three.js retargeting). "None" means you must rig it yourself; Mixamo auto-rigger is fine below 10k triangles.

---

## 0. Re-rated base bodies (the brief now favours these)

### Quaternius Universal Base Characters (regular and superhero)
- **License:** CC0
- **Rig:** Std-ish. A Quaternius humanoid skeleton that previous research found retargetable with UAL; Mixamo retarget works.
- **Ratings:** Style 1, Prop 5, Face 1 to 2, Qual 4, Cust 5.
- **Repaint needed:** a full hand-painted diffuse per body, with painted eyes, brows, lips and painted-in AO. Budget about a day per body plus a day per face variant. The head topology is simple, so the painted eyes need a clean UV island on the face; check this before committing.
- **Take:** It matches the City Characters body brief best and is legally the cleanest. **It is still the top base.**

### MakeHuman 1.x / MPFB2 for Blender
- **URLs:** http://www.makehumancommunity.org and the FAQ at https://static.makehumancommunity.org/mpfb/faq/use_in_closed_source.html
- **License:** exports are CC0, and core assets (mesh, targets, skins) are CC0. Community hair and clothes are CC0 or CC-BY, per pack.
- **Rig:** Std. A "game engine" skeleton option; Mixamo-compatible export is commonly done.
- **Ratings:** Style 1, Prop 5, Face 2 (realistic photo skin), Qual 3, Cust 4.
- **Repaint needed:** a full repaint, plus stylizing the head (larger eyes and jaw), because photo skin and realistic faces clash with painted style.
- **Take:** Low-poly proxies exist, but I did not verify their triangle counts. Use it to generate extra body types (heavy, slim, female) that match a Quaternius body, not as the hero look.

### Polygon Blacksmith Toon RTS Units, Orcs Demo (official, free)
- **URL:** https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/toon-rts-units-orcs-demo-101359
- **Key image:** `https://assetstorev1-prd-cdn.unity3d.com/key-image/666351c4-1583-4146-9ec1-5bdcabe69f03.jpg`
- **License:** Standard Unity Asset Store EULA. Unity's support article says Asset Store assets may be used in other engines when embedded in a product and not redistributed standalone.
- **Rig:** Std (the full pack is described as Mecanim Humanoid).
- **Ratings:** Style 5, Prop 1, Face 3, Qual 4, Cust 1.
- **Take:** It is exactly the target *texture* style, but stubby, so use it **as a palette and brushwork reference only**. Contents are unverified: 1.8 MB, v1.0 from 2017, and a reviewer says it is a small subset.

### Out under the new brief
KayKit, Kenney, Synty, 100Avatars, drazenk "Rigged low poly male & female" (untextured), and any vertex-colour pack.

---

## 1. Rigged humanoid characters with painted textures and faces

### 1a. "Girl with clothes. Worker set" (the best modular find)
- **Author:** cattleya
- **URL:** https://sketchfab.com/3d-models/4cf10e2dde6d4b12b6dccd25a4cf3b77
- **License:** CC BY 4.0
- **Inside:** 2,469 faces. **Separate meshes for arms, body, boots, face, hair and pants.** One idle animation. Diffuse-only painted PNGs: body 2048, clothes 1024, hair 1024. FBX, plus Sketchfab glTF. Paid archer, wizard, warrior and witch outfits exist elsewhere.
- **Rig:** Std. The author says it works with any humanoid and demonstrates Mixamo animations on it.
- **Preview:** https://media.sketchfab.com/models/4cf10e2dde6d4b12b6dccd25a4cf3b77/thumbnails/deff98f2a8074375bece9bd12711006a/dac1fbf22c3b43bcb12982a674fe2029.jpeg
- **Ratings:** Style 4, Prop 3 to 4 (unverified), Face 3 to 4 (separate face mesh with painted 2048 body texture, unverified), Qual 3, Cust 4.
- **Take:** It is the only free asset I found that is painted, diffuse-only, on a Mixamo-compatible rig **and** already split into swappable parts. It is female only.
- **Compat:** It is a template for how to cut up a Quaternius body. Its hair and boots can be shrinkwrapped onto a Quaternius base.

### 1b. vappex set: 70's Terry, Beka, Lia
- **Author:** vappex
- **License:** CC BY 4.0
- **URLs and previews:**
  - Terry: https://sketchfab.com/3d-models/d6664d2b52dc43368484d2fcce67d59b. 1,662 faces, 1 animation. Preview: https://media.sketchfab.com/models/d6664d2b52dc43368484d2fcce67d59b/thumbnails/c87010ee6a8b4a099ad64fdca70def35/f9ba4307f10f4ceb8ce6e4b04407119b.jpeg
  - Beka: https://sketchfab.com/3d-models/41f153b386524655998996966d5f68eb. 5,778 faces, 1 animation. Preview: https://media.sketchfab.com/models/41f153b386524655998996966d5f68eb/thumbnails/f739fab955ed49ec836df882ed2ebe3a/ba79c9ef224e498e857be345c9ec2bda.jpeg
  - Lia: https://sketchfab.com/3d-models/c1f44b8560bb40f3b266374b55ba4d32. 9,760 faces, 2 animations. Preview: https://media.sketchfab.com/models/c1f44b8560bb40f3b266374b55ba4d32/thumbnails/9a740cb0c779487a8b2bd3abc6bf0230/f46583e4398147f9addb46d170803b09.jpeg
  - Ivan (17k faces) is too heavy. Skip.
- **Inside:** "Hand painted" in Substance, delivered as metalness PBR sets (use the base colour only).
- **Rig:** Retarget. A standard Blender metarig (Rigify names), not Mixamo names; it is a clean biped, so retargeting is straightforward.
- **Ratings:** Style 3 (painted, but brighter, tagged "fortnite"), Prop 4 (unverified), Face 3 to 4 (unverified), Qual 4, Cust 2 (single mesh each).
- **Take:** Well-proportioned painted presets. Terry, at 1.6k faces, is an excellent budget example of a male in this direction.

### 1c. CG-Moon medieval villager series
- **Author:** CG-Moon
- **License:** CC BY 4.0
- **Models** (each at `sketchfab.com/3d-models/<uid>`):
  - Nobleman `eab176a4a5a644eea446114f3bc19403`
  - Monk `999aac12a3354a10862ae87f1eaee31c`
  - Wise Man `4903fccbe4d94eeda581e7fd3870d90d`
  - Scholar `a8efd688ec4b472f90558331d59c0573`
  - Old Man `e3001a8cc0174c5ebf15df115a4132a9`
  - Woman `294813c1f91f4f4398a6892a0eac9e94`
  - Several children
- **Inside:** 1,037 to 1,471 faces each, one painted texture (GLB max 1024), tagged handpainted, cartoon and anime.
- **Rig:** None in the Sketchfab file. The author's site version uses Auto Rig Pro with Mixamo support, but its license there is unverified.
- **Preview (Nobleman):** https://media.sketchfab.com/models/eab176a4a5a644eea446114f3bc19403/thumbnails/392a4afe432c4abfa0cc2e8fa74b2542/9b16d23e29224f71aaea41e88f480ec2.jpeg
- **Ratings:** Style 3 to 4, Prop 3 (likely 5 to 6 heads, unverified), Face 3 (anime-ish painted, unverified), Qual 3, Cust 2.
- **Take:** Use them for lobby crowds and podium spectators. Mixamo auto-rig them.

### 1d. WoW-style CC-BY portfolio pieces (presets or style targets, not modular)
- **License:** all CC BY 4.0, at `sketchfab.com/3d-models/<uid>`.
- **Models:**
  - **Low Poly "Warrior" handpainted** (TonesomJa) `ab16de5892974fe28deb6e9b69f798e1`. 4,164 faces, rigged in Blender (rig type unstated), painted in Krita. Preview: https://media.sketchfab.com/models/ab16de5892974fe28deb6e9b69f798e1/thumbnails/26e470010c4f4466800a3701def123ea/7dafb4f51fec46d79259bc542f6a892a.jpeg
  - **Ser Skav the eerie highwayman** (emrikkaljo) `850d8e4818b746698ae58db0bccaadca`. 9,060 faces, tagged WoW. **Mixamo rig (Std)** that the author calls weak. Preview: https://media.sketchfab.com/models/850d8e4818b746698ae58db0bccaadca/thumbnails/2f34b811147b4403a38d2da589c6e9f0/1024x576.jpeg
  - **Low Poly Warrior** (gsantos) `23954b0a176a497788dcd3a29204382f`. 1,134 faces, hand-painted, 1 animation (rig type unknown).
  - **Knight Guy** (mmkh) `7ae03180a7494294bb26b6b2dfe77f93`. 2,534 faces, hand-painted "Footman", no rig stated (None).
  - **Jinyu Warlock** (shane.beucler) `c76eb8e06e1a4c5bb6cb8ce45fc7f38f`. 5,983 faces, Blizzard student contest piece, posing rig. It is a fish-man, so useful only as a **brushwork reference**.
- **Ratings:** Style 4 to 5, Prop 3 to 5 (unverified), Face 3 to 4 (helmeted ones lower), Qual 3 to 4, Cust 1.
- **Take:** These are the closest free matches to the WoW brushwork. Ship them as unlockable presets after retargeting, or use them as the "paint like this" target for the Quaternius repaint.

### 1e. Open-source game dumps (realistic, painted, CC BY-SA)
- **0 A.D. (Wildfire Games)**
  - **URL:** https://github.com/0ad/0ad. Art is under `binaries/data/mods/public/art`, as COLLADA plus DDS.
  - **License:** **CC BY-SA 3.0**, per the in-tree LICENSE.txt. Credit Wildfire Games.
  - **Inside:** hundreds of human units on a shared biped skeleton with a large shared animation set. Units are "actors": a body plus head, helmet, shield and weapon **props on attach points**. Painted textures at low resolution.
  - **Rig:** Retarget (biped, non-Mixamo names).
  - **Ratings:** Style 3 (muted semi-realistic paint), Prop 5, Face 2 (tiny RTS-scale face texels), Qual 3, Cust 5.
  - **Unverified:** triangle counts (from memory, about 500 to 2,000).
- **Ryzom (Nevrax / Winch Gate)**
  - **URLs:** Ryzom Core asset repository, plus the converter https://github.com/stephengold/RyzomConverter (converts characters and animations for jMonkeyEngine).
  - **License:** **CC BY-SA 3.0**. Credit "Nevrax SARL / Winch Gate Properties Ltd."
  - **Inside:** realistic humanoid races with **huge modular armour, hair and clothing sets** and painted textures. The native format is 3ds Max / NeL.
  - **Rig:** Retarget.
  - **Ratings:** Style 3, Prop 5, Face 3 to 4, Qual 4, Cust 5. Conversion effort is high.
- **Share-alike warning (both 0 A.D. and Ryzom):** any derived model or texture must be released CC BY-SA. That does not infect your JS, but painting an SA texture onto a CC0 Quaternius mesh makes the result SA. Keep SA assets isolated and labelled, or skip them.
- **MegaGlest:** CC BY-SA 3.0. G3D format, dated quality. Style 2, Prop 4, Face 1, Qual 2, Cust 2. Not worth the conversion.

### 1f. Cut
- **The Ward** (OpenGameArt): CC-BY 3.0 / GPL 3.0, "WC3-ish". Likely chunky, and the author calls the rig crude.
- **silver-delivery Paladin Knight** (itch.io): no license stated, and PBR.
- **Leopard and lizard "Leopard Hunter" pieces:** not human.
- **Shemet_Art "Warrior - Hand Painted Characters" and sch0i "Toad the Frog Rogue":** CC BY-**NC**.

---

## 2. Hats, hair, beards, helmets, accessories (the known gap)

Free painted accessories exist only as one-off pieces, not as matched packs. Plan to refit them and do a unifying paint-over. All items below are CC BY 4.0 on Sketchfab at `sketchfab.com/3d-models/<uid>`. **Rig:** none needed; rigid props parented to the head bone (or a Mixamo `HeadTop_End` socket).

| Item | Author / uid | Faces | Style | Qual | Cust | Notes |
|---|---|---|---|---|---|---|
| Cowboy hat, handpainted, lowpoly | cyclocosmia3 / `7e013bb79645433da9bfaffe08f6921a` | 928 | 4 | 3 | 4 | Preview: https://media.sketchfab.com/models/7e013bb79645433da9bfaffe08f6921a/thumbnails/147a18cd6aba409dba92744528f01613/2a2dc1a0dfcb4389b7068b51805dfa16.jpeg |
| Stylized hand painted top hat | levelonesucks / `262d03d11e1044ff9102bebfb914ca79` | 5,760 | 4 | 3 | 4 | Decimate to about 1k. |
| Low Poly Witch's Hat | hadooden / `6d9d1ef475d945adab482f967f4417b8` | 172 | 3 | 3 | 4 | |
| The Witch's Hat | vanillain / `f5aa8f9480934d4fb4550ddc5dfb14f8` | 598 | 3 to 4 | 3 | 4 | Alternative to the one above. |
| Baseball Cap Pack | MadeByYeshe / `1fceba490cc14bbdb7231acb0272f07c` | 12,996 total | 2 to 3 | 3 | 5 | Party staple. Decimate and repaint. |
| Gladiator Helmet Handpainted | pinesradiata / `63b4f41a13aa4c35b5493e2b1cf18308` | 496 | 4 | 3 | 4 | |
| Fantasy Helmet Low Poly | badbanshee / `ecc1611f5087463995e20b36e58d4e01` | 870 | 4 | 3 | 4 | |
| Greek x Templar Hybrid Helmet | LordCinn / `81f46feb78a14efda3cf32e8163a97de` | 492 | 4 | 3 | 4 | |
| Viking helmet | hoanghaiduong18092001 / `96a67828e668466dbb368d7f2c2a0360` | 2,224 | 3 to 4 | 3 | 4 | |
| Horned Helmet | vitatuday997 / `12b7b729f2fd4eef8866835526da6afc` | 4,275 | 3 to 4 | 3 | 4 | |
| Eagle Helmet Hand Painted | joudni / `cdecab59fa394dd1835f88219114c083` | 3,634 | 4 | 4 | 3 | |
| Spanish Comb Morion with Plume | ASanches / `1aeb2c1e65d041bca09fddb14e0aaada` | 2,173 | 3 to 4 | 4 | 3 | |
| Handpainted Dwarven Head | TugayL / `99b0fb74e899497995bf82cf1a7dd99a` | 3,786 | 5 | 4 | 3 | Source for a **painted beard, hair and brow** mesh to cut and refit. Face 4 (unverified). It is also a reference for how painted eyes and brows should look. |
| cattleya hair mesh | see 1a | - | 4 | 3 | 3 | Already separate. |
| Robin Hood hat (OpenGameArt) | https://opengameart.org/content/robin-hood-hat | low | 1 to 2 | 2 | 3 | Listed CC0 (snippet). Untextured. |

- **Cut:** meow-vortex "Hand painted Hat" (CC BY-NC-ND).
- **Not found as free and licensable:** painted glasses, beards or tops. Model them in-house (simple shapes), or take them from Ryzom or 0 A.D. under share-alike.
- **Compat:** helmets made for chunky heads need about 0.8 to 0.9x scale on a realistic head.

---

## 3. Props and weapons (CC BY 4.0, Sketchfab)

- **Weapon Pack (guns)**
  - **Author:** rudolfs
  - **URL:** https://sketchfab.com/3d-models/fdf4611b6bfb4bdb8b404c2cc9107dbd
  - **Inside:** 2,417 faces. "Handpainted lowpoly", **diffuse-only 1024**. SMG, pistol and shotgun, with separate mag, trigger, silencer, stock, slide and hinge.
  - **Preview:** https://media.sketchfab.com/models/fdf4611b6bfb4bdb8b404c2cc9107dbd/thumbnails/f90c6a02e2914170bf6f2330e4cc8354/49d631e0e75247d0ac8543eea023b789.jpeg
  - **Ratings:** Style 4, Qual 3, Cust 3. This is the shooter's weapon set.
- **FREE - Stylized Fantasy RPG Weapons Set**
  - **Author:** DeepZone3D
  - **URL:** https://sketchfab.com/3d-models/90004b4748404e0baa064e9db33a8f90
  - **Inside:** 15,984 faces, 5 textures, tagged hand-painted. Weapon count and texture type are unstated.
  - **Preview:** https://media.sketchfab.com/models/90004b4748404e0baa064e9db33a8f90/thumbnails/89ea855a304c4072bcc76dd93148b3b7/9473c16972454b2a949206a045452ba3.jpeg
  - **Ratings:** Style 4, Qual 4, Cust 3. Melee weapons for the fighter.
- **Stylized Fantasy Prop Pack Hand Painted Low Poly**
  - **Author:** mascotboy
  - **URL:** https://sketchfab.com/3d-models/23e7c5231d9545358dd1cb7b7c3f6143
  - **Inside:** axe, mace, lantern, mushrooms, barrel. Painted in Photoshop, 18,234 faces.
  - **Preview:** https://media.sketchfab.com/models/23e7c5231d9545358dd1cb7b7c3f6143/thumbnails/6e4e69d3e26a41c1a2d5d300ccb4b3bf/2a93f210ad77422d90ef6038bde582d5.jpeg
  - **Ratings:** Style 4, Qual 4, Cust 2.
- **cattleya treasure chest** (392 faces, `ca63751326084866b8df9a6b4c196b3d`) **and Fantasy weapon** (862 faces, `17c63e6799d041be84a818f10a7da175`). Same style as 1a. Style 4.
- **Pool Table, Low Poly**
  - **Author:** DanielGrps
  - **URL:** https://sketchfab.com/3d-models/d7b6111be1c8418284121d20a996a958
  - **Inside:** 18,272 faces. Probably not painted.
  - **Ratings:** Style 2. Geometry only; repaint it.
- **Not found:** free painted putter, cue or arcade cabinet. They are trivial to model and paint with the section 4 textures.

---

## 4. Free hand-painted texture resources

- **"8 handpainted style textures"** (OpenGameArt): https://opengameart.org/content/8-handpainted-style-textures. Wood, rock, ground and fabric. Listed CC0 per the snippet; verify on the page.
- **OpenGameArt "handpainted stone texture"** plus the related painted stone, wood and brick packs: https://opengameart.org/content/handpainted-stone-texture. Listed CC0 per the snippet; verify.
- **Watercolor Terrain Textures** (voxelcorelab): https://voxelcorelab.itch.io/watercolor-terrain-textures. 16 seamless 1024 px PNGs. **CC0**. Softer than WoW.
- **Free Handpainted Seamless Texture Pack** (sunichawa): https://sunichawa.itch.io/seamless-texture-pack. About 100+ textures, mostly 1024 px. **Custom license:** commercial use OK, but no redistribution as standalone assets. Exposed PNGs in a web build make this grey, so use it as painting reference.
- **0 A.D. textures** (CC BY-SA): painted, but share-alike.
- **Poly Haven / ambientCG:** photo PBR only, no stylized painted sets. Skip.

---

## Bottom line

1. **No free asset matches the whole brief.** That brief is City-Characters proportions, a Mixamo rig, WoW-style painted texture with painted faces, and modular parts. The practical route:
   - **Quaternius UBC (CC0, realistic, retargetable)** as the base, with an in-house hand-painted diffuse including painted eyes, brows and mouth.
   - MakeHuman/MPFB for extra body shapes.
2. **Style and face targets to paint toward:**
   - The free Toon RTS Orcs Demo (palette).
   - The 1d WoW pieces.
   - The Dwarven Head.
   - The vappex set.
3. **Ready-to-use painted humanoids on a Mixamo-compatible rig:** cattleya Worker set (modular, Std) and Ser Skav (Std). The vappex models are clean Rigify-metarig retargets.
4. **Accessories:** about a dozen CC-BY painted hats and helmets. Glasses, beards and clothing must be made in-house, or taken from Ryzom or 0 A.D. under CC BY-SA.
5. **Credits:** everything on Sketchfab here is CC BY 4.0, so plan a credits screen (author, title, URL, license).

**Unverified:**
- Visual proportions and face quality of all Sketchfab models (I could not view images).
- OpenGameArt licenses.
- Orcs Demo contents.
- 0 A.D. and Ryzom triangle counts.
- The license of CG-Moon's rigged site versions.
- Fab's current free rotation. I found no confirmed free, painted, human-proportioned character on Fab.
