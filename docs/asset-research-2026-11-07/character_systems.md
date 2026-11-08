# Base Character Systems for Rage Quit Rumble (three.js / browser)

Research date: 2026-11-07. Nothing was downloaded. Prices and terms come from the pages listed under each entry. "Unverified" means I could not read a primary source for that fact.

## Read this first: three findings that change the shortlist

1. **Ready Player Me is gone.** Netflix bought it in December 2025 and shut down the public services and developer APIs and SDKs on 31 Jan 2026. Only GLBs exported before the shutdown still work. Do not build on it. Sources: https://avatarsdk.com/blog/2026/08/31/avatar-platforms-2026-whos-alive-whos-gone/ , https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me
2. **Almost every commercial license forbids shipping assets in a form players can extract, and a GLB served to a browser can be extracted.**
   - Reallusion's Content EULA (updated 1 Nov 2026, §6.3) requires content to be "packaged in proprietary, compiled, or encrypted formats". It also bans any setup that "permits end-users to extract standalone 3D meshes, textures".
   - Daz's Interactive addendum requires content to be "not available to end users in their native formats" and protected by "every effort", encryption included.
   - Unity's support article says "Users of your project cannot access or extract the raw asset files."
   - Human Generator bans sharing its assets in "easily extractable formats" such as .fbx.
   - Only CC0 or MIT content (MPFB/MakeHuman core assets, Quaternius, Microsoft Rocketbox) is clean for plain GLB shipping. For paid content, the likely workaround is a custom encrypted or obfuscated mesh container that is decrypted in JS at load. That arguably meets the "encrypted format" wording. **Get the vendor's written OK before you rely on it.**
3. **Reallusion now explicitly bans in-game character creators under the Standard license.** Its EULA §1.16 and §2.1(C)(2) cover runtime systems that "generate, morph, or customize characters". Those need a negotiated Enterprise License. Simply equipping predefined clothing, hair or accessories is excluded from that definition, but face morph sliders are not. Reallusion staff confirmed this in Aug–Dec 2025: recolored store assets still count, and the unmodified base body also counts. Sources: https://reallusion.com/Content/EULA/EULA.htm , https://discussions.reallusion.com/t/clarification-on-eula-for-using-character-creator-with-custom-assets-and-edited-morphs-in-game-with-character-customization-system/14770

Rating scale: 1–5. "Web" means web readiness (polycount plus export). "License" means license safety for a browser game where the GLB can be downloaded.

---

## 1. Reallusion Character Creator 5 (CC4 successor)
- **Maker / URL:** Reallusion. https://www.reallusion.com/character-creator/ , game pipeline: https://www.reallusion.com/character-creator/game-pipeline.html
- **Price:**
  - CC5: $299 recommended, perpetual. It launched 27 Aug 2025 and is backward-compatible with CC4 content. A CC4→CC5 upgrade cost $229 at launch.
  - CC5 Deluxe bundle (CC5 + ActorMixer Pro + another tool): $499. ActorMixer Pro alone: $199.
  - Headshot 3 (photo-to-head plugin, Apr 2026): $199 list ($129 early-bird, now over).
  - SkinGen: price not checked.
  - Store content: roughly $5–$40 per pack historically (one hair item seen at $7.50).
  - Under the old scheme Extended licenses cost about 1–3× Standard. The 1 Aug 2025 policy says Standard now covers export to engines and "game titles", but the FAQ on the same page still mentions Extended for "mass character output". The page contradicts itself.
  - **An in-game character creator needs a negotiated Enterprise license (price on request).**
  - Sources: https://www.cgchannel.com/2025/07/reallusion-unveils-character-creator-5/ , https://digitalproduction.com/2026/04/28/reallusion-ships-headshot-3-for-cc5/
- **License summary (read):**
  - https://www.reallusion.com/license/content.html (policy dated 2025-08-01) and https://reallusion.com/Content/EULA/EULA.htm (updated 1 Nov 2026).
  - Commercial games are fine if content is "fully integrated, compiled, or packaged" (§2.1B).
  - DLC or asset packs require Enterprise (§2.2).
  - Content must not be extractable (§6.3).
  - A character generation system requires Enterprise (§1.16, §2.1C2).
  - Characters you sculpt and texture entirely yourself on your own topology are not restricted. However, the CC base mesh is Reallusion content.
- **Body / proportion:** Realistic adult male and female. Morphs can push it toward heroic or stylized, and many stylized "toon" base packs exist in the store.
- **Face variety:** Excellent.
  - Morph-based head and face sliders, plus thousands of store morph packs.
  - Headshot photo-to-head.
  - ActorMixer blends up to 6 heads; the Pro version adds a 40+ scanned-head library.
  - ARKit-style facial expression blendshapes.
  - Beards and eyebrows via hair cards, plus separate brow and beard systems.
- **Hairstyles:** Hundreds of card-based hair assets in the store and marketplace (exact count unverified). A few ship in the box.
- **Clothing:** The largest catalog of any option here: many thousands of items, with plenty of modern casual (hoodies, jeans, sneakers, jackets).
  - Custom path: model the clothing in Blender, Marvelous Designer or ZBrush, then use "Transfer Skin Weights" or conform it in CC.
- **Skeleton:** CC_Base skeleton. Unity Humanoid auto-maps it, CC exports UE4/UE5 skeleton presets including MetaHuman and UEFN bind poses, and characters can be uploaded to Mixamo. ActorCore (Reallusion's own library) is native.
- **Polycount:**
  - Game Base body: 5,610 polys (about 11k tris), per the CC4 manual (marketing says "10K"). The HD Creation Base is LOD0.
  - Built-in InstaLOD and Remesher produce up to 5 LODs and can merge to a single mesh and single material.
  - A dressed Game Base character at about 15–25k tris is realistic. **This number is my estimate, not a verified figure.**
  - Manual: https://manual.reallusion.com/Character-Creator-4/Content/ENU/4.0/05_Character/G1_G3_and_Game_Characters.htm
- **Export:** FBX and OBJ (plus USD per the policy). Blender, Unity and Unreal plugins. GLB via Blender.
- **Preview image:** not captured. See https://www.reallusion.com/character-creator/
- **Ratings:** Face 5 · Hair 5 · Clothes 5 · Web 4 · License 2 (good only with an Enterprise deal plus encrypted delivery) · Look 4 (realistic; stylizable via toon bases and shading)
- **Take:** This is the most complete system by far, and the only one with a deep, actively sold modern-casual wardrobe that already fits the body. The blocker is legal, not technical. A browser character creator built on CC morphs and store hair or clothes is exactly what the EULA reserves for Enterprise. Budget for an Enterprise license plus encrypted GLB delivery and get both approved in writing. Getting a character into three.js is moderate work. Export Game Base FBX, then in Blender merge materials, keep face morphs as shape keys, bake atlas textures and export GLB with meshopt/KTX2. Expect one or two weeks to build a repeatable pipeline.

## 2. MPFB 2 (MakeHuman Plugin for Blender) / MakeHuman
- **Maker / URL:** MakeHuman Community. https://static.makehumancommunity.org/mpfb.html , Blender extension: https://extensions.blender.org/add-ons/mpfb/
- **Price:** Free. v2.0.12 (Sept 2025), Blender 4.2+.
- **License summary (read):**
  - https://static.makehumancommunity.org/about/license.html : "All core assets are shared under Creative Commons, CC0." Code is GPL (MPFB) and AGPL (MakeHuman), which does not affect exported models.
  - Asset packs are CC0 or CC-BY (credit required), per https://static.makehumancommunity.org/assets/assetpacks/faq.html . **Which packs are CC-BY is not listed, so check each one.**
- **Body / proportion:** Realistic adult male and female from continuous sliders (age, weight, muscle, height, proportions, ethnicity blend).
- **Face variety:** Strong morph-based face: hundreds of targets for nose, eyes, jaw, ears and more. Expression shape keys. Skin realism is middling compared with CC or Human Generator, so you need better skin textures.
- **Hairstyles:** Weak. There are 3 official hair packs plus material packs (each holds several styles; exact count unverified). Community assets add more, with varying quality and licenses. Brows and lashes are proxies. Beards: few.
- **Clothing:** 28 official garment packs (dresses, gloves, hats, pants, shirts, shoes, skirts, suits, underwear). Some is casual, but there are no strong hoodie or sneaker sets. MakeClothes and the MPFB clothes editor provide a documented path to author your own garments that fit all body morphs.
- **Skeleton:** Several built-in rigs, including a "game engine" rig, Rigify and a Mixamo-oriented option ("Mixamo in MPFB" doc). Mixamo upload works.
- **Polycount:** Base mesh about 13–14k quads at full resolution (from memory; **unverified**). Proxies or alternate topologies give lower-poly bodies. A dressed proxy character at roughly 10–20k tris is achievable.
- **Export:** Anything Blender exports, including glTF/GLB and FBX.
- **Preview image:** not captured. See https://www.cgchannel.com/2025/03/check-out-open-source-blender-character-generation-plugin-mpfb-2
- **Ratings:** Face 4 · Hair 2 · Clothes 2 · Web 4 · License 5 · Look 2 (dated "MakeHuman look" unless you re-texture)
- **Take:** This is the only system that is both realistic and legally clean for shipping raw GLBs and for a slider-based in-game creator. You could even export the morph targets to glTF and run the face sliders live in three.js. Its weak spots are hair, clothes and skin quality, which you would have to commission or buy as CC0 or custom work. Expect moderate to high art effort. The technical effort is low: Blender → GLB directly.

## 3. Human Generator Ultimate (Blender add-on)
- **Maker / URL:** Human Generator team. https://superhivemarket.com/products/humgen3d , docs: https://publish.obsidian.md/human-generator/Home
- **Price:** $128 commercial (required for games); $68 personal, portfolio or education only. Free updates.
- **License summary (read):**
  - License FAQ: https://publish.obsidian.md/human-generator/FAQ/License+FAQ . "Use in software and video games" is Yes for Commercial and No for Personal.
  - Assets may be shipped "within a closed format like a video game".
  - Sharing or selling base humans, clothing, hair or textures in "easily extractable formats" (for example .fbx) is not allowed. A web GLB is arguably exactly that, so **ask them in writing**.
  - The store page labels the code GPL; the asset license is separate.
- **Body / proportion:** Photoreal adult male and female, contemporary focus.
- **Face variety:** Very good: morph sliders, presets, ethnicity blending, age, expressions.
- **Hairstyles:** Blender particle or curve hair, many presets (count unverified). The "Process" system converts hair to haircards for games, which a game build requires. Includes beards and brows.
- **Clothing:** Modern outfits included. The count is unverified and reviewers call it limited, with some shoulder deformation issues in T-pose. Custom path: Blender, weighted to their rig.
- **Skeleton:** HG rig (Rigify-based) with a "Bone Renaming" process step, which is how you would map it to Mixamo or UE names. **Not verified to match either out of the box.**
- **Polycount:** Base about 25k quads (one reviewer, unofficial), decimatable to about 8k quads. The Process system includes LOD, texture baking and haircards. A dressed game character under 20k tris is plausible after LODs (estimate).
- **Export:** Blender to FBX or glTF via the Process "Export Humans" option.
- **Preview image:** not captured. See the store page.
- **Ratings:** Face 5 · Hair 4 · Clothes 2 · Web 3 · License 3 · Look 4 (photoreal; stylize with toon or painted shading)
- **Take:** It has the best faces per dollar and lives inside Blender, which suits a GLB pipeline. The clothing library is thin, haircard conversion is an extra step, and the "easily extractable" clause has to be cleared with the vendor for a browser game. Effort: moderate. Run the Process recipe (haircards + bake + LOD + bone rename), export GLB, then do a cleanup pass.

## 4. Quaternius Universal Base Characters + Modular Outfits
- **Maker / URL:** Quaternius. https://quaternius.com/packs/universalbasecharacters.html , outfits: https://quaternius.com/packs/modularcharacteroutfitsfantasy.html , older modern-clothes packs: https://quaternius.com/packs/ultimatemodularwomen.html (and the "men" equivalent)
- **Price:** Free "Standard" tier, which is about 60–70% of the content. Source or full tiers via Patreon credits ($10/$20/$50 per month tiers) or a one-time purchase on itch.io (amount not captured).
- **License summary (read):** CC0 ("free for personal, educational, and commercial use"), on the pages above.
- **Body / proportion:** 6 bodies: Superhero, Regular and Teen, each male and female. "Regular" and "Superhero" are adult and roughly Fortnite-like, not chibi.
- **Face variety:** Low. There is one head per body. The Source version adds eye and skin color shaders. **Face morphs, beards and eyebrows are not mentioned (unverified).**
- **Hairstyles:** 20, mixable.
- **Clothing:**
  - Fantasy outfits: 12 outfits from 62 parts, 3 textures each (v2.0, Jan 2026).
  - **No modern-casual pack exists for UBC yet.**
  - The older Ultimate Modular Men/Women (Feb 2022: 10 characters each, 4 swappable parts, humanoid rig) have modern outfits but are a different, older body.
- **Skeleton:** Quaternius Humanoid rig, built to match their Universal Animation Library. Retargetable to Mixamo or UE (needs a retarget map).
- **Polycount:** About 13k tris average for a character. Very web-friendly.
- **Export:** FBX, glTF, OBJ, .blend.
- **Preview image:** https://quaternius.com/assets/images/fullres/universalbasecharacters.jpg and https://quaternius.com/assets/images/fullres/modularcharacteroutfitsfantasy.jpg
- **Ratings:** Face 1 · Hair 3 · Clothes 2 (for modern casual) · Web 5 · License 5 · Look 3 (clean stylized with textures, not Synty-flat, but simple faces)
- **Take:** This is the zero-risk, drop-in-tomorrow option: CC0, glTF-native, around 13k tris, with a matching animation library. It fails your biggest requirement, face variety, and it has no modern-casual wardrobe yet. It is a good fallback or prototyping base. Effort: very low.

## 5. MetaPerson (Avatar SDK / itSeez3D)
- **Maker / URL:** Avatar SDK. https://avatarsdk.com/metaperson-creator/ , pricing: https://avatarsdk.com/pricing-cloud/
- **Price:**
  - Pro: $800/mo (annual discount up to 25%), 1,000 avatars per month, then $0.03 per avatar. Only for companies under $2M revenue and under $2M raised.
  - Enterprise (quoted price) adds offline or local compute, custom topology and blendshapes, custom hair and outfits, and custom terms.
  - The consumer Creator's first avatar is free; after that it uses credits.
- **License summary:** Terms page not found (404). The pricing page links to general terms only. **Rights to ship exported GLBs are unverified, so get custom terms (Enterprise).**
- **Body / proportion:** Realistic adult male and female generated from a selfie, with a stylized or cartoon toggle.
- **Face variety:** Very high (photo-driven, unique per user) plus ARKit-style blendshapes.
- **Hairstyles:** A preset library plus generated haircut (count unverified).
- **Clothing:** A preset outfit library (count unverified; modern casual is typical). Custom outfits are Enterprise only.
- **Skeleton:** "Humanoid rig, Mixamo-compatible".
- **Polycount:**
  - Body: 7k–36k tris across 8 LODs (docs) or 11–42k polys across 2 LODs (product page). The sources conflict.
  - Outfits: 10–15k (LOD2).
  - A dressed character at around 20–25k at low LOD (estimate).
- **Export:** GLB, glTF, FBX. Web SDK and iframe embedding.
- **Preview image:** not captured.
- **Ratings:** Face 5 · Hair 3 · Clothes 3 · Web 4 · License 2 (unverified, SaaS-dependent) · Look 3 (photoreal selfie faces in a cartoon party game look uncanny)
- **Take:** This is the closest surviving replacement for Ready Player Me. Players could even scan themselves. But the price is high, you are back to depending on a service (the RPM shutdown shows the risk), and the terms are opaque. Effort: low technically (embed the iframe, load the GLB), with high business and legal overhead.

## 6. Daz 3D Genesis 9
- **Maker / URL:** Daz 3D. https://www.daz3d.com/genesis-9-starter-essentials , EULA: https://www.daz3d.com/eula
- **Price:**
  - Daz Studio and the G9 base are free.
  - Every product used in the game needs its own Interactive License add-on. These are product-specific; listings I saw showed about $35, and forum users report $5–$50 (**exact G9 base Interactive price unverified**).
  - Products without an Interactive option cannot be used in games at all.
- **License summary (read, EULA Addendum 3.0):**
  - Content must be "not available to end users in their native formats", with "every effort" made to protect it.
  - No product may let content "be separately exported, extracted, or de-compiled into any re-distributable form".
  - Cloud or after-install delivery is limited to entities under $1M annual revenue unless Daz gives written consent.
  - Selling content as in-game items is banned without consent.
  - The addendum does not address character creators.
- **Body / proportion:** Realistic adult; one unified G9 figure covers both male and female.
- **Face variety:** Huge (thousands of store morphs and characters).
- **Hairstyles:** Thousands in the store, but many are dense strand or card hair and not game-ready.
- **Clothing:** Thousands, including a lot of modern casual.
- **Skeleton:** Daz G9 skeleton. It maps to Unity Humanoid, and Mixamo works via retarget or Diffeomorphic tooling. It is not Mixamo or UE native.
- **Polycount:** Base about 25.1k verts at base resolution (forum figure, unofficial). Clothes and hair are often heavy. Hitting 20k tris dressed means aggressive decimation, which breaks morphs.
- **Export:** FBX, plus the Daz-to-Blender, Unity and Unreal bridges. GLB via Blender.
- **Preview image:** not captured.
- **Ratings:** Face 5 · Hair 4 · Clothes 5 · Web 2 · License 1 · Look 4
- **Take:** The content is vast but render-oriented. The per-item interactive licensing, the anti-extraction clause and the $1M cloud-delivery cap make it the worst legal fit for a downloadable-GLB browser game. Not recommended.

## 7. Avaturn
- **Maker / URL:** Goodsize Inc. (also makes in3D). https://avaturn.me , pricing: https://avaturn.me/pricing
- **Price:** PRO $800/mo with up to 1,000 avatars per month, then $0.15 each. It includes white-label, API/SDK, your own user management and custom garment upload. Enterprise is custom. A free tier exists for consumer use.
- **License:** Terms page 404 / not readable. **Unverified.**
- **Specs:**
  - Realistic selfie-based avatars; a preset hair and outfit library (counts unverified).
  - Custom garments: GLB, about 7k tris for top + bottom, 1K PBR textures (https://docs.avaturn.me/docs/ux_customization/assets/general_guidelines/).
  - Skeleton reported Mixamo-compatible (**unverified**). GLB output.
- **Ratings:** Face 5 · Hair 3 · Clothes 3 · Web 4 · License 2 (unverified) · Look 3
- **Take:** It has the same pros and cons as MetaPerson. Its garment pipeline is well documented for web (7k-tri outfits), which is a plus. There is the same SaaS dependency risk, and the license is unknown.

## 8. Unity Asset Store / Fab modular stylized humans
All of these ship under the store EULA. For Unity this means the asset may be used in other engines, but "users of your project cannot access or extract the raw asset files" (https://support.unity.com/hc/en-us/articles/34387186019988). Fab's Standard license allows any engine (https://www.fab.com/eula); I could not read its full clause on extraction.

- **BoZo: Stylized Modular Characters Base Pack**
  - URL: https://assetstore.unity.com/packages/3d/characters/humanoids/humans/bozo-stylized-modular-characters-base-pack-281577
  - $40, v2.6.5 (Oct 2026), Built-in and URP.
  - Stylized cartoon look with PBR. About 24 hairstyles and about 62 outfit pieces (third-party counts). Face blendshapes for unique faces. Simple humanoid rig that works with Mixamo.
  - Ratings: Face 3 · Hair 3 · Clothes 3 · Web 4 · License 2 · Look 3
  - Take: cheap and Mixamo-ready, but cartoonier than your target. Its shaders are Shader Graph, so you would rebuild materials in three.js.
- **N-Hance Studio Stylized Modular Human (Male/Female + Additional Content)**
  - URL: https://forums.unrealengine.com/t/n-hance-studio-stylized-modular-human-male/2670208 (Fab/Unity)
  - Male base: 5 hairstyles, 6 beards, 4 brows. The add-on pack adds 4 faces and 5 hairstyles per gender. Gear is fantasy and medieval.
  - Ratings: Face 2 · Hair 2 · Clothes 1 (modern) · Web 4 · License 2 · Look 3
  - Take: nice painted stylized look, but there is no modern wardrobe and variety is small.
- **CoreCharacters (Fab)**
  - URL: https://www.fab.com/listings/37eceaec-46df-4b44-8cb5-5e7ca92c7de8
  - Free starter kit: male and female on the Epic skeleton, 1 hairstyle and 1 outfit each, hand-painted with a comic/cel shader. Paid outfits such as Techwear at $14.99.
  - The listing names Unreal as the format (no FBX or GLB listed), and its license field is blank.
  - Preview: https://media.fab.com/image_previews/gallery_images/1e021908-6d44-4ba5-a45a-0129767dc50e/377dd8f3-0636-4d88-9436-1e941df01020.jpg
  - Ratings: Face 1 · Hair 1 · Clothes 2 · Web 2 · License 3 · Look 4
  - Take: a nice look but far too little content. You would have to export it out of Unreal yourself.
- **Jordbugg Character Customizer + Modern Clothes Pack**
  - URL: https://assetstore.unity.com/packages/3d/characters/humanoids/character-customizer-modern-clothes-pack-328606
  - $119.99 for the clothes add-on, which requires the Character Customizer base. Tagged photoreal and modular with modern clothing. Specs not visible on the listing.
  - Preview: https://assetstorev1-prd-cdn.unity3d.com/key-image/26bc8d50-0a2a-4e08-8a9b-bcfbab9ac934.jpg
  - Worth a closer look; everything else about it is unverified.
- **Casual Wear Girls Packs 1–3 (David Grette)**
  - URL: https://assetstore.unity.com/packages/3d/characters/humanoids/humans/casual-wear-girls-pack-1-streetwear-modern-realistic-stylized-wo-267405
  - Realistic-stylized modern streetwear, female only, fixed characters.
- **Synty Sidekick**
  - URL: https://syntystore.com/products/modern-civilians-sidekick-modular-characters
  - Modular, ARKit face blendshapes, has a runtime creator, Unity and Unreal packages. The seller says there is no Blender export path. Synty art style.
  - Excluded on your stated dislike of Synty.
- **Alstra Infinite (PolyMate):** low-poly geometric style. Excluded.
- **Polygonal Mind:** I found no relevant current human creator product.

## 9. Microsoft Rocketbox (honorable mention)
- **URL:** https://github.com/microsoft/Microsoft-Rocketbox . **License:** MIT (read on the repo).
- **What it is:** 115 fixed realistic adult avatars (business, workwear, casual and others) with 4 poly levels (hipoly to ultralowpoly). Since 2022 it has 15 visemes, 48 FACS and ARKit blendshapes. FBX with a 3ds Max Biped-style skeleton (Bip01 names), so it needs a retarget map for Mixamo.
- **Preview:** https://github.com/microsoft/Microsoft-Rocketbox/raw/master/Docs/AvatarsSample.jpg?raw=true
- **Ratings:** Face 3 (115 fixed faces, not modular) · Hair 1 (baked in) · Clothes 2 · Web 4 · License 5 · Look 2 (2010s-era realism)
- **Take:** Legally clean and realistic, but these are fixed characters rather than a creator system. Useful for NPCs or crowds.

## 10. Quick verdicts on the rest
- **Ready Player Me:** shut down on 31 Jan 2026. Dead.
- **MB-Lab:** the main fork is archived. The base model license is AGPL-3, which is unclear for closed games. Avoid.
- **VRoid Studio / VRM:** free and outputs are usable commercially, but the anime look and proportions miss the stylized-realistic target. Ruled out.
- **Mixamo characters:** royalty-free in games, but Adobe's FAQ (per Adobe community answers; helpx page returned 403) bars distributing raw files to non-team members. A browser GLB is a gray area. Also the selection is small and dated, with no modularity.
- **UMA 2:** code is MIT and Unity 6.3+ only. Content is UMA's own and its license is unverified. There is no official FBX or glTF export (you could bake a SkinnedMeshRenderer with Unity's FBX Exporter). Not a practical source for three.js.
- **MetaHuman:** Unreal-only by license. Ruled out.
- **Genies:** Unity SDK only. Ruled out.
- **Union Avatars:** offline since July 2026.

---

## Ranked top 5
1. **Reallusion Character Creator 5 + Enterprise license**: the best faces, hair and modern-casual clothes with a proven game export. Conditional on Reallusion agreeing an Enterprise license for an in-browser creator with encrypted GLB delivery.
2. **MPFB 2 (CC0) + commissioned or bought CC0 hair and clothes**: the only realistic, slider-driven system that is legally clean for raw GLBs. Needs an art budget for hair, clothes and skin.
3. **Human Generator Ultimate ($128)**: excellent photoreal faces and a Blender-native game process. Thin wardrobe, and the "extractable formats" clause needs a written waiver.
4. **Quaternius UBC + outfits (CC0)**: instant, web-perfect and safe, but minimal face variety and no modern wardrobe yet. Best as a prototype or fallback.
5. **MetaPerson (Avatar SDK)**: the strongest surviving web avatar SaaS, Mixamo-compatible GLB. $800/mo or more, unverified ship-rights, and the same vendor risk that just killed Ready Player Me.

## Recommendation
Build on **Reallusion Character Creator 5** and pair it with **ActorCore**, Reallusion's mocap library, which plays on the CC skeleton with no retargeting. CC exports also go to **Mixamo** cleanly, and the UE5 skeleton preset opens up UE/Fab animation packs.

Before you buy content at scale, email Reallusion for an **Enterprise license** quote covering:
- an in-browser character creator with face morphs plus swappable hair and clothes
- GLB delivery in an encrypted or obfuscated container

Without that license, the EULA as updated in Nov 2026 bans what you want to build.

If Reallusion says no or the price is unreasonable, use **MPFB 2** (CC0) as the base instead, with its game-engine or Mixamo rig and **Mixamo animations**. Fund custom CC0 or work-for-hire hair cards and a modern-casual wardrobe authored in MPFB's clothes editor, so everything you ship is yours to put in a downloadable GLB.

Either way, ship faces as glTF morph targets driven by `morphTargetInfluences` in three.js. Merge each outfit to one or two materials with KTX2 textures and meshopt compression, which keeps 8 dressed players at about 15–20k tris each within the budget.

## What I could not verify
- Exact current CC5 Enterprise pricing, and whether Reallusion accepts encrypted web GLBs as "encrypted formats".
- The size of CC store hair and clothing catalogs.
- A real triangle count for a dressed CC Game Base character.
- Avaturn and MetaPerson terms of service (pages 404).
- Exact MPFB base polycount and the number of styles inside each hair pack.
- Human Generator's hairstyle and outfit counts and whether its rig matches Mixamo or UE.
- Quaternius UBC eyebrow, beard and face-morph details, and the price of its Source tier.
- The Daz G9 base Interactive License price.
- The UMA content license.
- The live Adobe Mixamo FAQ (403).
- The full Fab EULA extraction clause.
- Most Unity Asset Store item counts (listings rendered without descriptions).
