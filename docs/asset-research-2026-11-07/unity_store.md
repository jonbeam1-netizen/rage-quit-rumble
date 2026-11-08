# Unity Asset Store research: hand-painted characters, parts, props (excluding Polygon Blacksmith)

Research date: 2026-11-07. Criteria applied, including the user's later corrections: adult human proportions (about 6 to 8 heads), a standard humanoid rig (Unity Humanoid / Mixamo / Epic skeleton), hand-painted diffuse texture with painted shading, $20 or less, and real customization value. Weak painted faces do not rule a pack out, since the user can repaint them. Flat-color and vertex-color packs (Synty-like) are out.

## Read this first: what I could and could not verify

- **Asset Store pages render client-side.** WebFetch returned only metadata: publisher, price, version, file size and keywords. It returned no Description, Technical Details or screenshots. The built-in browser pane crashed ("renderer process is not running") on every Asset Store page, so I could not open a listing visually.
- **Where the specs come from.** Rig, triangle and texture specs below come from search-engine snippets of the listing text, Sketchfab, Fab and Unreal listings of the same product. Each spec is marked by source. **Proportions are not visually verified for any candidate**, so the proportions ratings are estimates. Check the screenshots before buying.
- **No preview image URLs.** I could not get any (the image CDN links are not in the fetched HTML). Every listing URL is given instead.
- **Prices are the regular USD prices shown on the page on 2026-11-07.** None was on sale when I checked.
- **Bottom line:** the Unity Store has very few hand-painted packs with adult proportions and real modularity at $20 or less. Most hand-painted humanoids there are single characters from 2016 to 2020. Most modular kits there are PBR or flat-color.

---

## 1. Character candidates (ranked)

### 1. RPG Hero PBR HP Polyart (Dungeon Mason): FREE
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/rpg-hero-pbr-hp-polyart-121480
- Price: Free. v1.1 (Mar 2020), 297 MB. Standard Asset Store EULA. Keywords: handpainted, hero, lowpoly, RPG.
- Contents (from the listing text via search snippet):
  - PBR, **HP (hand-painted)** and Polyart versions ship together.
  - 1 body mesh, 1 sword and 1 shield, sharing one texture.
  - About 5,000 tris including weapons.
  - "Fully compatible with Mecanim Humanoid".
  - 9 animations: 2 attacks, idle, get hit, die, die-recover, walk, run, sprint.
  - Texture size not stated. FBX almost certainly included (standard for this publisher), but not confirmed.
- Rig: standard humanoid? **Yes** (Mecanim Humanoid, per listing).
- Ratings: style 4/5, quality 4/5, customization 1/5, proportions 3/5 (estimate: stylized heroic build with big hands and shoulders, not chibi; unverified).
- Take: a free, no-risk test of Dungeon Mason's hand-painted look and rig in three.js. It is effectively the sample of their paid Modular RPG Hero HP kit (below). It is a single mesh, so it offers no customization by itself. Faces are simple painted features; I could not inspect them. Its Humanoid rig should share Mixamo and other Humanoid clips after retargeting.

### 2. Modular RPG Hero HP (Dungeon Mason): $25, OVER BUDGET unless on sale
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/modular-rpg-hero-hp-121219
- Price: $25 regular, no sale on 2026-11-07. v2.0 (Jan 2024), 495.6 MB. Keywords: Customize, Modular, hand painted. 12 reviews.
- Contents (pieced together from the Unreal Marketplace and Fab versions of the same line, via search snippets; the Unity description was not readable):
  - About 5,000 tris for a full character.
  - **Four hand-painted 2048x2048 atlases** (per the Unreal "Modular RPG Heroes HP" listing).
  - About 192 to 200 animations across 6 weapon stances: combos, dash, jump, climb, roll, defend, victory, potion drink, sleep, and more.
  - The sister Polyart version lists **61 modular body parts and 24 weapon parts** plus a mask-tint recolor shader. HP is probably the same part set, but that is not confirmed.
- Rig: standard humanoid? **Yes** (Mecanim Humanoid in Unity; the Epic skeleton in the Unreal version).
- Ratings: style 4/5, quality 4/5, customization 4/5, proportions 3/5 (estimate, same body as #1).
- Take: the best fit on the store for "modular plus hand-painted plus humanoid rig plus big animation set". It fails the $20 rule at its $25 regular price, so it only qualifies if a sale brings it under $20. Test the free #1 first. If the body proportions are acceptable, this is the strongest customization kit found. Avoid the Polyart variant (flat gradient atlas, poor style match).

### 3. Elven Archer Male - Hand Painted Series (BitGem): $19.99
- URL: https://assetstore.unity.com/packages/3d/characters/elven-archer-male-hand-painted-series-176880
- Sketchfab page: https://sketchfab.com/3d-models/elven-archer-male-hand-painted-series-08f8ee6c8c784c1996a2624ff05754cc
- Price: $19.99 regular. v1.0 (Aug 2020), 27 MB.
- Contents (from Sketchfab): 11.9k triangles, 6.1k vertices. A tribal dark-elf hero with bow and quiver. Animation count and texture size not listed.
- Rig: standard humanoid? **Yes**. Sketchfab says "skinned to an unreal skeleton and mecanim and Mixamo compatible".
- Ratings: style 5/5, quality 4/5, customization 1/5, proportions 4/5 (adult elf hero; estimate).
- Take: closest to the WoW / Torchlight look of anything in budget, on a skeleton that shares animations with Mixamo and other humanoid packs. It is one fixed character, so it works as a premium unlockable skin, not as a creator base. At 11.9k tris it is above the 2k to 10k target but still fine for a few on-screen players.

### 4. Angelic Warrior - Female (BitGem): $14.99
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/angelic-warrior-female-31650
- Price: $14.99 regular. v2.0 (May 2020), 7.6 MB. 8 reviews.
- Contents (from listing snippet): "low poly, hand painted", 5,514 polygons, rigged and textured, **not animated**.
- Rig: standard humanoid? **Unverified**. The rig type is not stated, though BitGem's recent re-releases are usually Mecanim/Mixamo compatible. Reviews of the male version on CGTrader complain about the rig.
- Ratings: style 5/5, quality 3/5, customization 1/5, proportions 4/5 (estimate).
- Take: good painted style and adult proportions, but a single character with no animations and an uncertain rig. Buy only if the rig checks out. Wings would need hiding for most minigames.

### 5. Humans Pack - Mobile characters (Stegobubbles): $19.90
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/humans-pack-mobile-characters-161634
- Price: $19.90 regular. v1.0 (Mar 2020), 23.7 MB.
- Contents (from listing snippet): 4 "low-poly, hand-drawn" humans (Knight, Mage, Shield, Warrior), each with its own weapons. About 3,000 to 5,000 vertices each. HD and LW SRP shaders. **No animations included.**
- Rig: standard humanoid? **Yes**, "rig set up for Mecanim" (Humanoid assumed).
- Ratings: style 3/5 (hand-drawn, palette unknown), quality 3/5, customization 2/5 (4 bodies, no swappable parts confirmed), proportions 3/5 (unverified).
- Take: four painted bodies on one humanoid rig for under $20 works as a "class skins" starter. It is not confirmed modular, and its proportions may be mobile-chunky; check the screenshots. A larger 14-character sibling, Big Fantasy Pack, costs $49.90 (over budget).

### 6. Hand Painted Wizard (Artcitizen): $10
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/fantasy/hand-painted-wizard-94781
- Price: $10 regular. v1.0 (Jul 2017), 5.1 MB.
- Contents (from listing snippet): 3,664 triangles, one 2048x2048 diffuse PNG. 7 animations: idle1, idle2, walk, run, attack, cast, die.
- Rig: standard humanoid? **Yes**, "ready to Mecanim".
- Ratings: style 4/5, quality 3/5, customization 1/5, proportions 3/5 (unverified).
- Take: a cheap, true diffuse-only hand-painted character at the right poly budget. It is a single fixed robed character, so it is useful only as an unlockable skin.

### 7. CenturuK singles: Sorcerer: Female Fantasy Character ($5) and Fantasy Male Character: Armoured Warrior ($5)
- URLs:
  - Sorcerer: https://assetstore.unity.com/packages/slug/69624
  - Armoured Warrior: https://assetstore.unity.com/packages/3d/characters/fantasy-male-charcter-armoured-warrior-84506
- Price: $5 each, regular. 2016 and 2017 releases (Unity 5.4).
- Contents: one snippet describes the Sorcerer as a "low polygonal game animated model ... hand painted texture". Nothing else verified: no tris, rig type or animation list.
- Rig: standard humanoid? **Unverified**.
- Ratings: style 3/5 (likely), quality ?/5, customization 1/5, proportions ?/5 (unverified).
- Take: the user already owns CenturuK's Lizard Man, so these probably match that painted style. At $5 they are cheap to test, but they are old single characters with unknown rigs. Low priority.

### 8. Stylized Character Collection 1 (Hodaart): FREE, contents unverified
- URL: https://assetstore.unity.com/packages/3d/characters/humanoids/stylized-character-collection-1-393976
- Price: Free. v1.0 (Jul 20, 2026), 82.2 MB. Built-in, URP and HDRP.
- Keywords: hand painted, humanoid, humanoid character, fantasy character, Animated.
- Rig: standard humanoid? Probably, from the "humanoid" tag, but unverified.
- Ratings: not rated; I could not see the description or images.
- Take: brand new, free, and tagged exactly right. It costs nothing to open and check. I found no outside coverage of it.

### Cut, and why
- **N-hance Studio Stylized Modular Human Male/Female:** $64.99. The style is close (painted stylized MMO humans with hair, beards and modular gear), but it is far over budget and uses a PBR workflow. Its Stylized Fantasy Outfits packs need the base body.
- **BoZo: Stylized Modular Characters / Fantasy Pack:** $40, PBR, anime-leaning.
- **ATART Character Bundle:** $50 (Casual Warrior alone is $30). Hand-painted but "casual" proportions, over budget.
- **Modular RPG Hero Polyart (Dungeon Mason):** $20. Flat 512 gradient atlas, so a poor style match.
- **Maksim Bugrimov RPG Fantasy (Pack):** $29.99, over budget. A reviewer reports legacy (non-Mecanim) animations and scale problems.
- **LittleSimple Stylized Modular Warriors:** $30, URP only.
- **Synty-style flat packs** (Polytope Studio peasants and NPCs, Blink Low Poly Human RPG at $44.99, LowPolyPros $10 modular, PolySquid Fantasy Character Pack at $11.99 in a Clash-of-Clans chibi style, Rukha93 David): flat-color or chibi, so ruled out by the style rules.
- **GVLT Handpainted Characters Pack ($20, 2017)** and **Blackspire Handpainted Fantasy Knight ($10, "cartoon")**: I could not see the contents. The knight is described as cartoon, so it is likely stubby.

---

## 2. Hats, hair, clothing and accessory packs

- **No good fit on the Unity Store.** I found no hand-painted hat, hair or outfit pack at $20 or less that would sit on a realistic humanoid.
  - The hat packs that turned up (Ultimate Low Poly Hats Bundle $19.99, Mega Hat Pack $10, Cartoon Hats Pack vol.1 and vol.3) are cartoon or flat-color.
  - The hand-painted hairstyle sets found are on CGTrader, not the Unity Store.
- **Fantasy Helmets: $5.** URL: https://assetstore.unity.com/packages/slug/17405
  - A single helmet with feather and floral ornaments in 7 color variations. 956 tris. Hand-painted 1024px color, normal and specular maps. v1.2 (2016).
  - Style 4/5, customization 1/5. Usable only as a one-off unlockable.
- **Realistic source for swappable heads, hair and outfits:** the Modular RPG Hero HP kit (#2), or N-hance if the budget ever rises.

## 3. Props (painted style)

- **Hand Painted Fantasy Furniture Pack Vol.1 (Ivan Geyda Graphics): $4.99.** URL: https://assetstore.unity.com/packages/3d/props/interior/hand-painted-fantasy-furniture-pack-vol-1-184501
  - 26 items, 1,610 tris total, atlased into three 1024 textures.
  - Style 4/5. A good lobby filler.
- **Fantasy Furniture Pack 02: $11.99** (price from snippet; publisher not confirmed). URL: https://assetstore.unity.com/packages/3d/props/interior/fantasy-furniture-pack-02-53339
  - 47 hand-painted furniture prefabs.
  - Style 4/5 (from the description).
- **Handpainted Fantasy Item Pack (Horst-Peter): $10.** URL: https://assetstore.unity.com/packages/3d/props/handpainted-fantasy-item-pack-112650
  - Contents not visible.
- **Billiards: no painted pool set found.**
  - Billard Set - Lowpoly Sport Pack (3D Game Objects), $15: https://assetstore.unity.com/packages/slug/292382. It is PBR/stylized, so the textures would need repainting. Style 2/5.
  - 3D Cartoon Billiard Pack: https://assetstore.unity.com/packages/3d/props/3d-cartoon-billiard-pack-299468. Price not verified.
- **Golf putter: nothing painted found.** It is a simple model to make in-house.
- **Owned packs already cover a lot here.** Tidal Flask FANTASTIC Village and Dungeon are hand-painted environment and prop sets that suit a tavern-style lobby. BoZo Stylized Modular Weapons, Black Rose and Blink cover weapons.

## 4. Owned-pack publishers: do they sell matching humanoid or customization packs at $20 or less?

| Publisher | Humanoid or customization pack at $20 or less in style? | Usefulness of the owned packs |
|---|---|---|
| Meshtint (Treasure Goblin) | No. The catalog is mostly "Cute" chibi and flat "Polygonal" series. | Goblin works as a costume or NPC; its proportions are stubby. |
| Tidal Flask (FANTASTIC Dungeon, Village) | No. The FANTASTIC line is environments only. | High. Painted lobby, props and minigame dressing. |
| GrigoriyArx (Creatures 1 and 2, Golems) | None found. | Monster costume unlocks or NPCs. Custom rigs, so no shared animations. |
| Maksim Bugrimov (Fantasy Characters Vol4 $6.99, Reptil) | RPG Fantasy (Pack) is $29.99 and reported as using legacy animations, so no. | Creature costume unlocks. Painted style reference. |
| PixeliusVita (30 Monsters, Evolution) | None found. | Monster costumes or enemies. |
| Patchmesh (Critter Collection) | None found. | Pets, emote props, party-game critters. |
| BoZo (Modular Weapons) | Stylized Modular Characters at $40 is over budget and PBR. | Weapons for the fighter minigame. Check that its texture style is not PBR-heavy. |
| CenturuK (Lizard Man) | Possibly: Sorcerer Female and Armoured Warrior at $5 each (candidate #7, unverified). | Lizard Man works as a costume. |
| Black Rose, Blink (free weapons) | Blink's humans are flat-style and $44.99, so no. | Weapons. Blink's style is flat, so likely a poor match next to painted characters. |

## 5. Unity Asset Store EULA: use in a non-Unity (three.js) web game

Sources:
- EULA (Terms of Service plus EULA, "Last updated: December 4, 2024"): https://unity.com/legal/as-terms
- Unity support article: https://support.unity.com/hc/en-us/articles/34387186019988-Can-I-use-assets-from-the-Asset-Store-with-other-engines

**Other engines are allowed.**
- The EULA never mentions "engine", "non-Unity" or "Unity Software" as a condition of use. That is from a full-text check of the legal page.
- §2.2.1 grants a "non-exclusive, non-transferable, worldwide, and perpetual license" to incorporate the asset "as an embedded component of that Licensed Product" and to "distribute the Asset as incorporated and embedded in that Licensed Product".
- The asset must not "comprise a substantial portion of the Licensed Product".
- Unity's support article states plainly that you can use Asset Store assets with other engines if you comply with EULA Section 2. The exceptions are assets with separate "Restricted Asset" terms (§2.9) or Unity Companion License items. None of the candidates above showed anything but the Standard EULA.

**The web-exposure problem.** The support article says:
- "Users of your project cannot access or extract the raw asset files."
- "Assets cannot be redistributed as standalone items or in a way that allows others to extract them from your final product."
- EULA §2.2.1.1(b) also bars letting a user "sell, transfer, distribute" the assets.

A three.js game necessarily sends the model and texture files to the browser, so the literal "cannot access or extract" wording cannot be fully met. Unity's own WebGL builds have the same exposure, and the EULA text itself only requires the assets to be "incorporated and embedded" and not distributed standalone. Reasonable mitigations:
- Ship assets only inside the game's own bundles: merged or packed GLB, meshopt or Draco compression, textures packed into atlases, no clean per-asset filenames.
- Never offer a download or "export your character" of the raw meshes.
- Optionally obfuscate or encrypt the bundle.

This is an interpretation, not legal advice. The cautious route is to email Unity Asset Store support, or the specific publisher, for written confirmation that a three.js browser game is acceptable.

**Seats note.** Every listing page I fetched showed "License type: Extension Asset" even for 3D models. Under §2.3.2, Extension Assets are a "single seat license" for "a maximum of 2 computers". That does not matter for a solo developer, but each additional artist would need a seat.
