# Marketplace research (not Unity Asset Store): hand-painted characters, accessories, props

Date: 2026-11-07. Scope: itch.io, Sketchfab, CGTrader, Fab, TurboSquid, ArtStation, Gumroad, Cubebrush (plus Superhive where a candidate's seller sells there).
Criteria (after the user's corrections): adult proportions (6 to 8 heads), a standard humanoid rig, hand-painted diffuse textures (WoW / Torchlight / Battle Chasers look), at most $20, and real customization value. Faces can be repainted, so weak faces are noted but nothing was cut for them alone.

## Read this first
- **I could not view any preview images.** WebFetch returns text, and downloading was off-limits. Every style and proportion rating below comes from listing text, tags, tri counts and seller history. Treat them as provisional and open the preview URLs before buying anything.
- **The reference texture** (`scratchpad\ref\barbarians_tex.png`) did not exist, so I made no visual comparison.
- **The market is thin.** Under $20, I found no single pack outside the Unity store that is realistically proportioned, hand-painted, rigged to a standard skeleton *and* modular. The realistic hand-painted work here is mostly single characters or base bodies. The modular kits are mostly flat-color or PBR.
- **The Sketchfab Store is closed.** Paid "Standard license" Sketchfab models can no longer be bought there; sellers had to migrate to Fab, and many didn't. Free Sketchfab downloads (CC licenses) still work.

## Licenses by marketplace

| Marketplace | License on a purchase | Shipping raw GLB/FBX in a three.js browser game? |
|---|---|---|
| **Fab** (fab.com) | Fab Standard License, in Personal and Professional price tiers with the same rights. Personal is for buyers under $100k gross revenue in the last 12 months (figure from Epic docs as quoted on the forums). Free CC-BY items on Fab are under CC-BY instead. https://www.fab.com/eula | **Best fit.** The summary allows you to "commercially distribute your Projects with the Fab assets incorporated" and bans only standalone resale or redistribution. I found no requirement to encrypt or protect files. The full EULA is the binding text; I read the summary page only. |
| **Sketchfab** | Store closed (https://sketchfab.com/blogs/community/sketchfab-update-what-you-need-to-know-now-that-fabs-live/). Free downloads carry CC licenses. | **CC-BY is fine** with credit. CC0 is fine. CC-NC and CC-ND are not usable. |
| **CGTrader** | Royalty Free is the default (T&C sections 20 and 21A). https://www.cgtrader.com/pages/terms-and-conditions | **Problem.** For games the buyer must "take all commercially reasonable measures" to keep end users from reaching the model (proprietary format, encryption). Plain GLB in a browser game breaks this; you would need encryption or obfuscation of the asset files. Avoid unless the seller grants a custom license. |
| **TurboSquid** | Standard royalty-free license. https://blog.turbosquid.com/royalty-free-license/ | **Not allowed without approval.** WebGL is allowed only as exports from Unity, Unreal, Lumberyard or Stingray; "other WebGL approaches" need TurboSquid's approval. Models must not be in an open format. Avoid. |
| **ArtStation Marketplace** | Standard and Extended Commercial. The EULA page returned 403, so this is from listing text: Standard covers one commercial project capped at 2,000 sales or 20,000 views; Extended is unlimited. | **Unverified.** A views cap is a risk for a web game. The raw-file question is unclear. Read https://www.artstation.com/marketplace-product-eula yourself before buying. |
| **itch.io** | Per item. itch has no platform license; each seller states one or doesn't. | **Fine when the seller says CC0 or CC-BY.** Several good candidates (all of Silver Delivery's) state **no license at all**, so ask the seller in writing before shipping. |
| **Gumroad** | Per seller. | Read each product's terms; nothing to generalize. |
| **Cubebrush** | Has a site-wide standard license. | **Not verified.** I found no candidate there worth checking it for. |
| Superhive (Blender Market) | Royalty-free per product. | Not verified; it comes up only because arte_art sells there. |

**Practical rule:** buy from Fab, or use CC0/CC-BY items from itch and Sketchfab. Avoid CGTrader and TurboSquid for a raw-file browser build.

---

## 1. Humanoid characters

Every candidate is rated out of 5 on: style match (hand-painted, realistic WoW-like target), proportions (5 = realistic human), quality and customization value.

### 1. Stylized Handpainted Modular Character Starter Kit: Male & Female + Outfit (CoreCharacters, Fab)
- **URL:** https://www.fab.com/listings/37eceaec-46df-4b44-8cb5-5e7ca92c7de8
- **Price:** **Free** ($0.00, "Add to My Library"). Rated 5.0 from 7 ratings. Flagged as not AI-generated.
- **License:** Fab Standard. The listing's license field shows "-", which is normal for free Fab items.
- **What's inside:**
  - Male and female rigged base bodies; one modular starter outfit and one hairstyle per gender.
  - Material setups for color customization, a comic shader and a cel-shading post-process.
  - 28 meshes, about 18k vertices per character, 70 textures from 512 to 4096 px, 4 materials.
- **Rig (standard humanoid?):** **Yes, the Epic UE5 skeleton (Mannequin).** Mixamo retargeting is routine.
- **Formats:** **Unreal Engine only.** You need UE5 installed to export FBX, then Blender to go to glTF.
- **Add-on outfits from the same seller, same skeleton:**
  - Techwear Hacker: Male or Female $14.99 each, both genders $24.99. These do include FBX.
  - Techwear Runner: Male C or Female $14.99 each.
- **Preview:** the listing gallery; I couldn't extract a direct image URL.
- **Ratings:** style 3 (unverified), proportions 4 (likely), quality 4, customization 3 (starter kit plus paid outfits).
- **Take:** This is the closest match to the user's refined brief: a free, standard-skeleton, hand-painted, modular male and female base with modern outfit packs on the same rig. The downsides are real. It is UE-only, 18k+ vertices with 4K textures (decimate and downscale to 2k), the textures may be multi-map rather than diffuse-only, and the outfits are modern techwear rather than fantasy. Face quality is unknown; plan to repaint.
- **Compatibility:** the Epic skeleton retargets cleanly to Mixamo and Unity Humanoid animations. Hats from other packs should fit a UE-proportioned head with scaling.

### 2. Base Female - Game Ready - Rigged - Low Poly (arte_art / "Colourly", Sketchfab, free) and Colourly characters (Superhive)
- **Free base URL:** https://sketchfab.com/3d-models/base-female-game-ready-rigged-low-poly-5fcef75a94be4ee3a996a0ea91106e4d
- **Paid characters:** https://superhivemarket.com/creators/arteart (Viking, World War Soldier, Modern Soldier, $9.99 each).
- **Not purchasable:** the same artist's Elf Paladin, Elf Mage, Assassin and Cowgirl are on Sketchfab but not downloadable, and I found no store listing for them.
- **Price:** free base female; $9.99 per character on Superhive (no sale seen).
- **License:** base is CC-BY 4.0 (credit required, commercial use OK). Superhive terms not verified.
- **What's inside (base):**
  - 15,386 faces, 8,095 vertices.
  - "Hand painted colors and normals", single material, 2K textures.
  - "Basic FK humanoid rig... ready to be used with any other humanoid animations."
  - GLB, FBX and .blend.
- **Paid characters:** 21k to 28k faces each, with weapons.
- **Rig (standard humanoid?):** Humanoid FK. Bone naming isn't stated; it probably needs a Mixamo retarget map.
- **Preview:** https://media.sketchfab.com/models/5fcef75a94be4ee3a996a0ea91106e4d/thumbnails/97ee195c27e74ab9aa289a9080ffd857/b333727b4e814db5b4a266775de43c4f.jpeg
- **Ratings:** style 3 to 4 (painterly toon; tags say "paintery, toon"), proportions 4, quality 4, customization 2.
- **Take:** Clean, adult-proportioned, painterly characters with a free base, and the artist offers a hand-painted firearms set and props in the same style. They are not modular, but one artist and one rig family means outfits could be kitbashed. The paid characters run 21k to 28k faces, so they need decimating for a party game with 8 players. Faces are painted (not dot eyes) as far as I can tell from tags; verify.

### 3. Silver Delivery "Paint Poly" and "Adventurous" hand-painted characters (itch.io)
- **Characters, all hand-painted per the listings:**
  - Paint Poly - Base Female Body - Rigged, **$12.99+**: https://silver-delivery.itch.io/paint-poly-base-female-body-rigged
    - "Arcane" hand-painted style, Rigify rig with no face rig.
    - Separate hair, brows, teeth, tongue and eyelash meshes; body albedo, body normal and hair albedo maps.
    - Blend and FBX.
  - Adventurous - Base Female Character - Rigged, **$7.99+**: https://silver-delivery.itch.io/adventurous-base-female-character-rigged
    - 9,338 faces, one 2048 albedo map.
    - "Humanoid skeleton"; Blend, FBX, GLB, Godot and Unity.
  - Hand Painted Paladin Knight and Hand Painted Female Paladin Knight, **pay what you want (free)**: https://silver-delivery.itch.io/hand-painted-paladin-knight-rigged-game-ready
    - Albedo, two normal maps and roughness; one skinned mesh.
  - Paint Poly - Female WW2 Private: $29.99, over budget.
- **License:** **None stated on any of these pages.** Comments asking about license went unanswered on the paladin page. You must get written terms from the seller.
- **Rig (standard humanoid?):** Rigify for Paint Poly, which has to be converted or retargeted for Mixamo. The Adventurous rig is "humanoid," naming unknown.
- **Preview images:**
  - Paint Poly base female: https://img.itch.zone/aW1hZ2UvMzE5ODA1My8xOTA5NDUxNi5wbmc=/original/lNCN6%2F.png
  - Adventurous base female: https://img.itch.zone/aW1hZ2UvMjY3MTM2OS8xNTkxOTE0Ni5wbmc=/original/zNP%2Fdh.png
  - Paladin: https://img.itch.zone/aW1hZ2UvMzA5MDQ3OC8xODQ4MTA1My5wbmc=/original/AELz%2BK.png
- **Ratings:** style 4 (painterly, the closest to the brief by description), proportions 4, quality 3 to 4, customization 1 to 2.
- **Take:** This is the best-looking painterly option on itch by description, and the seller also sells matching painterly weapons and props (see section 3). Female bases only, though; a male base appears only in the flat "Low World" line. The missing license is a blocker until the seller answers. Face quality not stated.

### 4. Girl with clothes. Worker set (cattleya, Sketchfab, free)
- **URL:** https://sketchfab.com/3d-models/girl-with-clothes-worker-set-4cf10e2dde6d4b12b6dccd25a4cf3b77
- **Price:** free, CC-BY 4.0.
- **What's inside:**
  - 2,469 faces; hand-painted medieval worker outfit (chest, boots, pants) worn over a shared base.
  - Humanoid rig that the author shows working with Mixamo animations; one idle animation.
- **The other outfits are gone:** the Monk set was ~$10 and Fantasy characters ~$20, both Standard license, on the now-closed Sketchfab Store. **cattleya's Fab storefront has only two unrelated $45+ items**, so the other outfit sets can't currently be bought.
- **Rig (standard humanoid?):** Humanoid, Mixamo-tested by the author.
- **Preview (Monk set, same base):** https://media.sketchfab.com/models/a52f1864c33041c5b296daedd72786b3/thumbnails/6cfcc6850189400b98e5c5fee3c8f314/4379a531e2ce482597d9cf78c5d08251.jpeg
- **Ratings:** style 4 (mobile hand-painted RPG), proportions 4, quality 3, customization 2.
- **Take:** This is the right architecture (one base body, outfits as swappable skinned sets on a Mixamo-compatible rig) at a browser-friendly 2.5k tris, but only the free set is obtainable. Worth emailing the artist about selling the rest. Female only.

### 5. Female Body base for rpg #2 (Ilya.Anchouz.Danilov, Sketchfab, free)
- **URL:** https://sketchfab.com/3d-models/female-body-base-for-rpg-2-aa2b270ddf45446da819a59d1206498b
- **Price:** free, CC-BY 4.0.
- **What's inside:** 12,018 faces; rigged; hand-painted; near-nude base with a separate bikini mesh (the author notes the bikini glitches). No animations.
- **Rig (standard humanoid?):** Rig naming not stated.
- **Ratings:** style 3 to 4, proportions 5 (an RPG base, adult anatomy), quality 3, customization 1 as shipped.
- **Take:** Useful only as a realistic painted base to build clothes onto. It is female only and has no matching male, so it is a fallback, not a pick.

### 6. Animated Low-Poly Cartoon Fantasy Character Asset Pack (Overaction Game Studio, itch.io)
- **URL:** https://overactiongames.itch.io/medieval-cartoon-character-asset-pack
- **Price:** $11.63+ pay what you want (no sale noted).
- **License:** **CC0** per the page; commercial use is fine.
- **What's inside:**
  - 11 characters: Warrior, 2 Archers, Mage, Jester, Queen, Farmer, Peasant, Priest, Goblin, Hero.
  - 1024 textures; Rigify rig, with Mixamo-compatible weapon-free FBXs added later.
  - Idle, Attack, Hit, Die, Walk and Run per character; FBX, OBJ and .blend.
  - Weapons and accessories are separate.
- **Rig (standard humanoid?):** Partly; Rigify plus a "made to work with Mixamo" update.
- **Preview:** https://img.itch.zone/aW1hZ2UvNjIzOTE2LzExMzkxMTcyLnBuZw==/original/z0H0cR.png (my inference)
- **Ratings:** style 2 to 3 (textured, but says "cartoon"; painting not confirmed), proportions 2 to 3 (cartoon, likely stubby), quality 3, customization 2.
- **Take:** The CC0 license is the best feature, and there are lots of townsfolk. It may well be the stubby cartoon look the user now rejects, so check the preview before considering it.

### Cut or rejected (with reason)
- **LOW POLY WARRIORS - Animated & Modular** (Unboring Future, Fab, $19.99): https://www.fab.com/listings/1eac31c7-2a64-4845-b108-47375561992a
  - Superb customization on paper: 62 armor pieces in 8 sets (helmet, shoulders, torso, arms, hands, legs, feet), **22 beard and hair models**, male and female human and orc, 49 animations, Unity and FBX.
  - But "materials can be changed individually" plus the toon tags suggests flat-color materials, not painted textures. Verify the previews: if it's textured it jumps to the top; if flat, it's out.
- **Hero for RPG : Modular HP** (Dungeon Mason, Fab): $24.99 (over budget), UE-only, chunky heroic proportions. 61 parts, about 40 animations, 2K hand-painted textures.
- **Modular character pack** (jeebs, Sketchfab): hand-painted, shared humanoid rig, Unity customizer, 178k faces in total. But it was ~$27.99 (over budget), and since the Sketchfab Store closed I found no Fab listing for it.
- **The Cat Villagers** (S3ART, Gumroad, €16): https://s3artstore.gumroad.com/l/the-cat-villagers. Hand-painted and modular (hats, glasses, outfits), but cat people, not human proportions.
- **FinFunGames $0.99 characters** (Fab): flagged **AI-generated**, PBR textures; they do use UE Mannequin bone names. Out on style.
- **Out as flat/palette, PBR or unrigged:**
  - Standout 7 LOWPO: CC0, one shared 512 atlas, likely a palette.
  - Whitehood (iltaen): color-palette texture.
  - Polytope Studio NPCs: 256px color atlas and $69.99.
  - Alstra PolyMate.
  - Tesseract helmets: PBR.
  - Bitgem Hand Painted Series: free Skeleton Archer only, not human.
- **CGTrader single hand-painted characters** (Handpainted Fantasy Knight, Angelic Warrior and similar): no customization, and the CGTrader license needs asset protection. Skipped.

---

## 2. Hats, hair, beards and accessories (the known gap)
Honest result: **I found no hand-painted hat, hair or accessory pack under $20 sized for realistic heads that I could verify on these marketplaces.** What exists:

### Stylized Armor & Helmets Collection Vol. 1 - 50 Props (Goe Realms Studio, Fab)
- **URL:** https://www.fab.com/listings/f3982d98-9c5e-4ad0-bd7d-7a6c62cf7d62
- **Price:** $14.99 (no sale shown).
- **License:** Fab Standard.
- **What's inside:**
  - 50 static (unrigged) helmets: great helms, visor helms, kettle, nasal, barbute and sallet helms, guard helmets, crowns and ceremonial helms.
  - Described as "consistent hand-painted low-poly style"; one 1024 base-color texture per prop.
  - 151,773 tris in total (about 3k each); Blender, FBX and GLB.
- **Main image:** https://media.fab.com/image_previews/gallery_images/037aad90-43e1-4263-a6f1-d65570d0a3e4/5519cc6b-b9dc-410c-95f5-c19a82245a85.jpg
- **AI flag:** the listing marks it **"Generated with AI: Yes"**.
- **Ratings:** style 3 (unverified), proportions n/a (realistic helmet shapes), quality 2 to 3, customization 4.
- **Take:** It's the only volume headwear find, and static helmets attach to a head bone easily with uniform scaling. But it's AI-generated, which carries quality, consistency and ethics risk, and 50 separate 1024 textures should be atlased down. Medieval helmets only: no casual hats, glasses or beards. The same seller has a tavern furniture pack in the same style.

### Hair that comes inside character packs
- **Silver Delivery Paint Poly Base Female:** separate hair, brows and lashes meshes (see candidate 3).
- **LOW POLY WARRIORS:** 22 beard and hair models in 5 colors, if its texture style passes (see Cut).

### Searched and not usable
- **CGTrader:** Ultimate Cartoon Hats Pack, Hat pack vol1 (9 hats), Low Poly Hair Pack ($14.99, **PBR**), 10 Stylized Low-Poly Male Hairstyles ($8.99). Texture style unverified or PBR, and the CGTrader license requires asset protection.
- **Stylized Headwear Collection** (Blender Ustad, Gumroad https://blenderustad.gumroad.com/l/headwear): $29, over budget, PBR.
- **ArtStation hairstyle packs** (Polina Shaman): $99, PBR hair cards.

**Recommendation:** treat accessories as a make-it-yourself item. Hat, glasses and beard meshes are 100 to 800 tris each and quick to model and paint onto a shared 512 or 1024 accessory atlas matching whichever base is chosen. The marketplaces don't fill this gap at this price and style.

---

## 3. Props (painted style)

| Item | URL | Price | License | Notes | Style / quality |
|---|---|---|---|---|---|
| **Silver Delivery "Adventurous" painterly line** | https://silver-delivery.itch.io/ | $4.99 to $14.99 | **Not stated; ask** | Melee Weapons $4.99, Tools (32 models) $14.99, Food & Utensils $6.99 | 4 / 3 by description |
| **Silver Delivery "Style World - Guns - Rigged & Animated"** | https://silver-delivery.itch.io/style-world-guns-rigged-animated | $9.99 | Not stated | Painterly, rigged and animated guns, good for the shooter. "Adventurous - WW2 Guns Vol 1" is $19.99 | 4 / 3 |
| **Stylized Fantasy Dungeon Props, 17 hand-painted models** (waaachow, itch) | https://waaachow.itch.io/stylized-fantasy-dungeon-props | $5.99 | Check the page | Hand-painted props; the seller also has a sci-fi set at $5.99 | 3 to 4 / unverified |
| **Arcade Machine Lowpoly Handpainted** (CGTrader, also DreyArt on Superhive) | https://www.cgtrader.com/3d-models/electronics/other/arcade-machine-lowpoly-handpainted ; https://superhivemarket.com/products/arcade-machine-lowpoly-handpainted-3d-model | Price not retrieved | CGTrader RF, so the **protection clause applies**; prefer the Superhive copy | About 2.2k tris, 5 color variants, hand-painted, no PBR | 4 / 3 |
| **Stylized Billiard / Pool Table - Game Ready** (LarkArt Store, Fab) | https://www.fab.com/listings/a5104155-fe1b-4546-ac54-d0d67d7b52d2 | $6.99 | Fab Standard | 2 tables, cue, rack, 16 balls; 2K and 4K textures; about 16k faces; **tagged PBR and Fortnite-cartoony**, not hand-painted | 2 / 3 |

- **Mini golf:** I found nothing hand-painted. The OpenGameArt "Minigolf Kit" (CC0) appears to be Kenney's flat kit; that page returned 403, so this is unconfirmed.
- **Pool table:** no hand-painted one found under $20. The LarkArt table is the fallback; it would need its diffuse repainted, or a simple custom model.

---

## Bottom line
1. **For the base body, try CoreCharacters' free Fab kit first.** It is hand-painted, on the standard Epic skeleton, male and female, modular, and has outfit add-ons. Accept the UE-to-FBX export step and the decimation work.
2. **Shortlist for style:**
   - **arte_art / Colourly:** free CC-BY base female; $9.99 characters on Superhive.
   - **Silver Delivery painterly line:** the strongest painted look, but get a license in writing.
3. **Accessories are a real gap.** Goe Realms' helmet pack is the only volume option, and it's AI-generated. Plan on authoring hats, glasses and beards in-house.
4. **Avoid CGTrader and TurboSquid** for a raw-asset three.js build because of their protection and WebGL clauses.
5. **Not verified anywhere:** the visual style of any item (I saw no images), exact Fab license tier prices beyond the first tier, ArtStation and Cubebrush license text, and whether the Overaction or LOW POLY WARRIORS packs are actually painted.
