# Animation assets and retargeting for Rage Quit Rumble

Researched 2026-11-07. Web research only; nothing was downloaded or bought. Facts are tagged **[read]** when I read them on the page cited, and **[unverified]** when they come only from search snippets, forums or memory.

**Scope change applied.** The characters will be realistically proportioned (6 to 8 heads tall), not Toon RTS bodies. So the recommendations below favor packs built for standard humanoid rigs, and retargeting between those rigs. The Polygon Blacksmith findings are kept short.

**Rig confirmed later.** The character will use a standard humanoid skeleton like Synty POLYGON City Characters, so the target is **Unity Humanoid / Mixamo-compatible**.
- **Synty's skeleton** **[unverified, from memory]:** 3 spine bones, neck, head, clavicles, fingers, Unity Humanoid avatar. Bone names follow Synty's own scheme (Hips, Spine_01..03, Clavicle_L, Shoulder_L, Elbow_L, Hand_L...), not `mixamorig:`.
- **What this means:** nothing drops on "with no retargeting" unless it was authored on that exact skeleton. In Unity, anything Humanoid retargets automatically. In Blender/three.js, every non-Synty pack needs one bone map, which is a once-per-source job.
- **Synty's own animation packs** would drop straight on. They are all over budget: [ANIMATION - Base Locomotion](https://syntystore.com/products/animation-base-locomotion) is **$69.99** (247 clips, made for POLYGON and Simple characters) on both the Synty Store and the [Asset Store](https://assetstore.unity.com/packages/3d/animations/animation-base-locomotion-280764). Sword Combat, Idles and the others are separate paid packs, or the Synty subscription from $30/month. **[snippet]** A $29.99 Gumroad listing for it is a third-party seller of unknown legitimacy; avoid.

---

## 0. Polygon Blacksmith rigs (short, since they are no longer the target)

- **Toon RTS Units** ([Asset Store](https://assetstore.unity.com/packages/3d/characters/toon-rts-units-67948)):
  - **Price:** now **$25**, over budget. It rose from $20 a few days before 2026-11-07. The lowest price in the last 6 months was $12.50, and the all-time low was $5 ([gameassetdeals](https://www.gameassetdeals.com/asset/67948/toon-rts-units)). **[read]**
  - **Version:** v1.4, released Aug 24 2026, URP only. **[read]**
  - **Rig:** the publisher's text says "Mecanim ready and Humanoid Rigged (except cavalry units)". The rig is a 3ds Max Biped, as the coordinator found in the owned FBX (Root, Pelvis, Spine, Neck, Head, Clavicle, UpperArm, Forearm, Hand, Toe0). It has a single spine bone and no fingers.
  - **Animations:** 10 unit sets (Infantry, Spearman, Archer, Mage, Worker, Cavalry variants, Catapult).
  - **Should you use them?** Moving them onto a standard humanoid means Biped-to-humanoid retargeting. In Unity, map the Biped as a Humanoid avatar, which works with one spine bone. In Blender, use a bone map in Rokoko or Expy/Retarget. The motions are RTS weapon/unit loops (attack, die, walk) on very stubby proportions. On 6 to 8 head bodies the arm arcs and foot contacts will look off. **Not worth the effort**; use them only as reference.
- **Toon Soldiers** ([Asset Store](https://assetstore.unity.com/packages/3d/characters/humanoids/toon-soldiers-52220)):
  - **Price:** **$20** regular, no sale shown. **[read]**
  - **Version:** v2.2 (Aug 2026), URP only, Standard Unity Asset Store EULA. **[read]**
  - **Animations:** "450+ animations, about 70 per weapon set, root motion included". **[unverified, search snippet]**
  - **Rig:** the publisher replied in reviews that the pack is "rigged as Humanoid" with one spine bone and no finger bones ([reviews](https://assetstore.unity.com/packages/3d/characters/toon-soldiers-demo-69684/reviews)). **[read]**
  - **Do the packs share one skeleton?** Probably the same Biped-style low-bone skeleton across the publisher's packs, but I could not confirm that from the publisher. **[unverified]**
  - **Verdict:** military gun sets on a toon body. Kevin Iglesias Soldier FREE (below) covers the same need on a normal-proportion humanoid rig, and is free.

---

## 1. License baseline you need to know first

- **Unity Asset Store Standard EULA** ([unity.com/legal/as-terms](https://unity.com/legal/as-terms), [EULA FAQ](https://assetstore.unity.com/browse/eula-faq)). **[read]**
  - You may incorporate an asset "together with substantial, original content" as an "embedded component" of your product, and distribute it embedded.
  - You may not distribute it standalone.
  - The FAQ says a product designed so users can pull the assets out separately "is not 'incorporated'".
  - Unity support says Asset Store assets may be used in other engines ([support article](https://support.unity.com/hc/en-us/articles/34387186019988-Can-I-use-assets-from-the-Asset-Store-with-other-engines)).
  - **Practical reading for a three.js game:** retarget the clips onto your own character, bake them into your character GLB files, and don't offer them as a download or a browsable folder. Neither the EULA nor the FAQ says anything about web games specifically. Technically extractable files in a web build are the same situation as any WebGL game, so this is moderate rather than zero risk.
  - This is materially safer than Mixamo, whose terms specifically bar redistributing the raw files.
- **CC0** (Quaternius, KinemIQ's Quaternius clips): no risk.
- **CMU mocap:** the license allows inclusion in commercial products but not reselling the data itself. Quoted below.

---

## 2. Packs

### 2.1 Kevin Iglesias packs (license now confirmed)

**License, confirmed [read].** Kevin's own pack PDFs give the license as "Standard Asset Store EULA". The PDFs list three points:
- "Royalty-free and allowed for commercial use."
- "Resale not allowed."
- "Attribution not required."

Sources: [Melee FREE PDF](https://www.keviniglesias.com/documentation/Human%20Melee%20Animations%20FREE.pdf) and [Basic Motions PDF](https://www.keviniglesias.com/documentation/Human%20Basic%20Motions.pdf). The same terms apply to the itch.io copies ([kevdev.itch.io](https://kevdev.itch.io) links "Full License" to keviniglesias.com/#license). The website's #license section rendered empty to my fetch tool, so I read the terms from the PDFs. The press kit says the assets "may be modified and used commercially without attribution" ([presskit](https://www.keviniglesias.com/presskit.html)). For web use, the conditions are the same as the Unity EULA reading above. If you want it in writing, email support@keviniglesias.com.

**Skeleton (all packs).**
- Kevin's own custom humanoid rig: a feminine (HumanF) and a masculine (HumanM) version. The root bone is `B-root` and bones use "B-" prefixes (per itch comments). **[read, comments]**
- It is Unity Humanoid compatible, and he publishes Unity and Godot retargeting tutorials.
- Each pack ships three downloads: a Unity package, a Godot/Unreal FBX download, and Blender source files.
- Blender's default FBX importer has scale problems with the game-optimized FBX. Commenters recommend working from the Blender source files instead.
- A free [Human Character Dummy](https://kevdev.itch.io/human-character-dummy) is available.
- The free versions are on itch.io and Gumroad.

| Pack | URL | Price (itch.io) | Count | What it covers |
|---|---|---|---|---|
| **Human Basic Motions** (full) | https://kevdev.itch.io/basic-motions (Asset Store "Basic Motions" also $18) | **$18**. Itch showed an "On sale" tag with no discount visible. It has been 50% off at times. | 404 files (about 100 unique × M/F × in-place/root motion) | See the list below this table. **[read, PDF]** |
| Human Basic Motions FREE | https://kevdev.itch.io/basic-motions-free | $0 | 118 files | Idle, walk/run 8-direction, sprint, jump, turn, talk. |
| **Human Dance Animations** | https://kevdev.itch.io/human-dance-animations | **$18** | 90 files (18 dance steps + 7 poses) | Synced to 120 BPM. |
| Human Dance FREE | https://kevdev.itch.io/human-dance-animations-free | $0 | 36 files (6 steps + 2 poses) | Dance steps and poses. |
| **Human Soldier FREE** | https://kevdev.itch.io/human-soldier-animations-free | $0 | 128 files | See the list below this table. |
| Human Soldier (full) | https://kevdev.itch.io/human-soldier-animations | **$30**, over budget. It was 50% off ($15) at some point. | 538 files | Adds precise aim, crouch and prone, sprint, 6 hit reactions and 6 deaths. |
| Human Melee (full) | https://kevdev.itch.io/human-melee-animations | **$23**, over budget at regular price | 284 files | See the list below this table. |
| Human Melee FREE | https://kevdev.itch.io/human-melee-animatons-free | $0 | 94 files | 1H/2H/polearm/shield attack, 1 damage, 1 death, 8-direction run and strafe. No punches or kicks. |
| Human Throwing | https://kevdev.itch.io/human-throwing-animations | **$12** | 251 files | Throws; tagged Sports. Possibly useful for a basketball shot or an air-hockey arm. **[contents not inspected]** |

What the main packs contain:
- **Basic Motions (full):** idles; walk, run, strafe-walk and strafe-run in 8 directions; sprint; crouch and crouch-strafe; turns; jump (begin and land); fall; roll; run-slide; swim and drown. Emotes: Angry, Beg, Cheer ×2, Clap, Wave ×2, Laugh, Cry, Fear, Question, HeadNod and HeadShake, Reverence (bow), Talk ×3, Drink, Eat. **Sit ground, low, medium and high (begin, loop, stop)**. Sleep. **Knockdown fall, ground and stand-up**, Stun, Pain, IdleWounded.
- **Soldier FREE:** idle and military idle; walk and run in 8 directions. Aim, shoot and reload for **assault rifle, handgun, rifle and bazooka**. Grenade throw, 2 hit reactions, 3 deaths.
- **Melee (full):** combat idles, 2 damage reactions, 6 deaths, parries, shield blocks, a stun and a dodge. Weapon attacks: 5 right-hand and 5 left-hand 1H attacks, dual-wield, 2H and polearm attacks. Unarmed: **3 punches, 2 kicks**. Strafe locomotion.

Previews:
- Basic Motions web viewer: https://www.keviniglesias.com/basicMotions/Viewer/demo.html
- Dance image: https://img.itch.zone/aW1hZ2UvMzQ3MzI3Ni8yMDcyMjI3OS5wbmc=/original/PeyWhw.png
- Soldier image: https://img.itch.zone/aW1hZ2UvMzk3NjA0NC8yMzcxMTg4MC5wbmc=/original/jAPRj7.png
- Retargeting tutorial: https://www.youtube.com/watch?v=0o7SzYSsR-o

**Ratings.**

| Pack | Coverage | Quality | License safety |
|---|---|---|---|
| Basic Motions | 4 | 4 | 4 |
| Dance | 3 | 4 | 4 |
| Soldier FREE | 4 for guns | 4 | 4 |
| Melee | 2 for a fighting game | 4 | 4 |

**Take.** Basic Motions ($18) is the single best purchase for need (1). It covers lobby locomotion, strafe, jump, emotes, sitting at four heights, knockdowns and get-ups on one consistent rig. Soldier FREE covers most of need (3) at no cost. Kevin's melee material is weapon-RPG oriented: with only 3 punches and 2 kicks it does not make a Street Fighter moveset.

### 2.2 Free CMU mocap converted to FBX and glTF (rancidmilk) — best free find for sports

- **What it is:** "Massive Library of Free 3D Character Animations" by rancidmilk. https://rancidmilk.itch.io/free-character-animations **[read]**
- **Price:** free (payments disabled).
- **Count:** "over 2,000" clips. These are cgspeed's BVH conversions of the whole CMU database, retargeted with Auto-Rig Pro onto a CC0 Quaternius model. A Blender meta/control rig is included. The page doesn't say which Quaternius skeleton was used.
- **Formats:** FBX (441 MB anims-only), glTF (764 MB), and the Blender scripts (GPL-3.0).
- **License (quoted from the page):** "Free to use/modify/redistribute so long as you don't sell the animations themselves." The page also quotes CMU: "You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form."
  - I could not load mocap.cs.cmu.edu myself because of a TLS certificate error. Other sources consistently describe the CMU data as free for research and commercial use, with credit requested.
- **Coverage:** the CMU database is the only free source I found with the sports and fight moves in the table below.
- **Quality:** raw mocap. Expect foot sliding and jitter, no clean loops, and loose naming. You get the cgspeed index, not a categorized list.

| CMU subject(s) | Moves |
|---|---|
| 06 | Basketball: dribble and shoot (for example 06_14) **[read, HF metadata]** |
| — | Golf swing (CMU-sourced "play golf") **[read, KIT DB]** |
| 13, 14, 15 | Boxing |
| — | Plus dance, sitting, climbing, getting up, falls and lots of everyday actions **[general knowledge, unverified per-clip]** |

**Ratings.** Coverage 4 (sports and odd actions), Quality 2 (raw mocap), License safety 5.

**Take.** This is your free source for golf swings (adapt the swing down to a putt), basketball shots, boxing, falls and sitting variations. Plan on cleanup in Blender: trimming, looping and foot locking. Credit CMU in the game credits.

### 2.3 KinemIQ free animation library

- **What it is:** a browser tool with a free library. https://kinemiq.app/free-game-animations/ and sources at https://kinemiq.app/sources/ **[read]**
- **Count:** 460 clips:
  - 211 locomotion
  - 68 attacks (punches, kicks, combos, sword)
  - 64 idles and stances (fighting stances, crouch)
  - 28 blocks, dodges and jumps
  - 85 other (sit down and stand up, 1 dance, hit reactions, a death)
- **Skeleton:** one shared humanoid skeleton. The built-in character is Quaternius **Universal Base Characters**, which is the same family as UAL.
- **Formats:** FBX, GLB or BVH, in-place or root motion.
- **Sources and licenses:**
  - 175 Quaternius UAL clips: CC0
  - 170 clips from the 100STYLE dataset: CC BY 4.0
  - 115 clips from the ACCAD Open Motion Project: CC BY 3.0
- **Credit:** credit is embedded in each export. The site's Terms page (section 6 covers CC BY clips) was not read.
- **Pricing caveat:** the beta is free until **18 Nov 2026**. The site says "the library and the free account will stay free", but paid plans will follow.

**Ratings.** Coverage 3, Quality 3, License safety 4 (CC BY needs credits; the site's own ToS was not read).

**Take.** Most of the value is UAL clips you already have. The new parts are the ACCAD and 100STYLE mocap (fight moves, styled walks), already retargeted onto the Quaternius base skeleton and exportable as GLB. That makes it a convenient no-retarget source if you adopt that skeleton.

### 2.4 Rokoko free mocap

- **Free sports pack:** "12 free sports animations". https://rokoko.com/resources/rokoko-mocap-12-free-sports-animations **[read]**
  - FBX on a **Mixamo skeleton**, 30 fps.
  - Download needs a sign-up form that includes ticking a marketing-consent box.
  - The page doesn't list which sports.
  - Usage statement: "you can use them in any animation, VFX, game... commercial use." There is no formal license text; it defers to the Rokoko Terms of Service, which I did not read.
- **Free moves in the Motion Library (about 150):** used through Rokoko Studio; exports FBX, BVH or CSV. Reported as licensed for commercial use, but I found no redistribution terms. **[unverified]**

**Ratings.** Coverage 2 (unknown sports list), Quality 4 (clean mocap), License safety 3.

**Take.** Worth the sign-up to see what the 12 sports clips are. Get a written statement on the license terms before shipping them.

### 2.5 Datasets: research-only, do not use

| Dataset | License | Content | URL |
|---|---|---|---|
| Bandai Namco Research Motion Dataset 1 and 2 | **CC BY-NC 4.0** per the repo README; press coverage said BY-NC-ND. Non-commercial either way. **[read]** | Dataset 1: 17 content types including fighting and dance, 36,673 frames. Dataset 2: locomotion and hand actions, 384,931 frames. BVH. | https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset |
| Ubisoft LaForge LAFAN1 | **CC BY-NC-ND 4.0** **[read]** | 77 sequences, 4.6 h: 3 fight, 8 dance, 2 "fight and sports". | https://github.com/ubisoft/ubisoft-laforge-animation-dataset |

Ratings: coverage 2, quality 4, **license safety 0**. Fine if Rage Quit Rumble is a free hobby game you never monetize, but NC terms are a trap for anything with ads, donations or sales. ND also bars retargeting and cleanup. Skip both.

### 2.6 Other Unity Asset Store and marketplace packs checked

| Pack | Author | Price | Notes | Fits budget? |
|---|---|---|---|---|
| RPG Character Mecanim Animation Pack FREE ([reviews](https://assetstore.unity.com/packages/3d/animations/rpg-character-mecanim-animation-pack-free-65284/reviews)) | Explosive | Free | Humanoid. A related listing says Explosive clips are "exported as empty transforms and do not contain bone data, so they are incompatible with Blender and some other game engines" **[snippet]**. Only usable via the Unity bake route. | Yes, but awkward |
| Warrior Pack Bundle 2 FREE ([link](https://assetstore.unity.com/packages/3d/animations/warrior-pack-bundle-2-free-42454)) | Explosive | Free | Sample of the paid warrior packs (2021). Same Unity-only caveat. | Yes |
| Fighter Pack Bundle | Explosive | ~$119.99 **[snippet]** | Unarmed fighting. | No |
| Frank Fighting Pack (1+2) ([link](https://assetstore.unity.com/packages/3d/animations/frank-fighting-pack-1-2-118907)) | Frank Climax | $39.99 **[snippet]** | 57 motions × in-place/root motion; punches, kicks, hits. Last updated 2019. Frank Assassin is $29.99. | No (on sale only, if ever) |
| Basketball Shot Animation ([deals page](https://www.gameassetdeals.com/asset/315129/basketball-shot-animation)) | SoraKazeStudio | **$19.99** (low $9.99) **[read]** | 37 shots: jump shots, fadeaways, blocks, made/missed reactions. The rig is not stated; Unity 2021.3.45+. Standard EULA. | Yes, barely. Check that it is Humanoid. |
| Basketball Animations Humanoid | sugarpixels | ~$50 **[snippet]** | 150 clips, in-place. | No |
| Sitting Animations Pack | (Asset Store) | $9.99 **[snippet]** | Desk sitting: idle, typing, joystick play. | Yes, but Kevin Basic covers sitting |
| Emotes, Taunts and Gestures ([link](https://assetstore.unity.com/packages/3d/animations/emotes-taunts-and-gestures-animation-pack-314186)) | The Mighty Cat Games | **$27.49** **[read]** | 100 emotes, taunts and victory poses. Rig not stated. | No (unless on sale) |
| Emotional Expressions Pack 01: Joy | (Asset Store) | $10 **[snippet]** | 10 mocap joy loops. Victory candidates. | Yes |
| Free Animation Pack ([Fab](https://www.fab.com/listings/8de31c5d-93bc-4bd4-9606-ca789ce91b99)) | Gamma Studio | Free **[read]** | 24 clips on the UE5 Manny/Quinn skeleton: unarmed walk, **rifle idle, walk and ADS walk**, injured, door kick. Unreal .uasset only, so you need UE to export FBX. Fab Standard License (any engine; no standalone redistribution). | Yes, marginal |
| Unarmed Fighting Animations V1 ([itch](https://gamedev-hero.itch.io/unarmed-fighting-animations-v1-uefbx)) | GameDev Hero | $99.99, currently "not for sale" **[read]** | 26 clips, UE5 Mannequin plus a Mixamo version. | No |
| MoCap Online Free pack and starter packs ([legal](https://mocaponline.com/pages/legal)) | MoCap Online | Free sample; full packs ~$149.99; starter prices not read (site rate-limited) | Legal page: animations "must be integrated into a larger project". It also says raw motion capture data files "cannot be included in asset store listings, template projects, or other products", which is risky wording for a web game where the files are fetchable. | License safety 2. Skip. |
| ActorCore free motions | Reallusion | Free | Games need a separate (free) "Mass Distribution License", applied for **[forum, 2020-22]**. Tied to iClone/Character Creator. | Skip unless you get that license in writing |
| Truebones | Truebones | Free promos | The 2019 Gumroad terms say "royalty free... any and all purposes", but I could not read the current TOS. The "free Mixamo 2,400 animations" offer is **Mixamo content: avoid**. | Not recommended |
| CGTrader "snow board animations" | (CGTrader) | Price not read (page empty to my fetch tool) | 50+ snowboard clips, male and female, 70-joint rig with fingers, FBX **[snippet]**. The only snowboard pack I found anywhere. | Unknown |

### 2.7 What exists for the hard categories

| Need | What exists |
|---|---|
| **Golf putt** | No dedicated free putt pack found. Use the CMU golf swing (rancidmilk) cut down, or hand-key it; a putt is easy to hand-key (small pendulum, about 15 keys). A Sketchfab/Fab "Golf lady animated" includes a putt but is a paid model. |
| **Pool cue** | Nothing found anywhere. Hand-key it (a lean pose plus a forearm stroke loop), or adapt a CMU "reach and lean" clip. |
| **Basketball** | CMU subject 06 (free); SoraKazeStudio ($19.99). |
| **Air hockey** | Nothing exists. A lean-over-table idle plus an IK-driven arm in three.js (a two-bone IK hand following the striker) beats any canned clip. |
| **Snowboarding** | Only the CGTrader pack (price unknown). Otherwise hand-key a few stance poses (carve left/right, crouch, air, fall) and drive them by blending. Snowboard games mostly need poses, not cycles. |
| **Seated driving** | No free clip found. Kevin's SitMedium loop plus two-bone IK on the hands to the wheel works. Fab "InCar AnimSet" (18 driving clips) exists, price not seen. |
| **Victory, lose and podium** | Kevin Basic covers Cheer ×2, Clap, Laugh, Cry, Angry, Reverence (bow) and Beg. That is decent lose and victory material. Dedicated podium poses need hand-keying. |
| **Deaths** | Kevin Melee FREE (1), Soldier FREE (3), Basic Knockdown, and Quaternius UAL. |

---

## 3. Retargeting options (Blender-first, output GLB for three.js)

| Option | Cost | Status (read) | Effort | Verdict |
|---|---|---|---|---|
| **Rokoko Studio Live Blender add-on** ([GitHub](https://github.com/Rokoko/rokoko-studio-live-blender)) | Free; **requires a free Rokoko account login** | Built-in retargeting with a bone-list mapping you can save and load. Rokoko documents installing it on Blender 4.2+ (it suggests the Beta build). Needs both rigs in matching rest poses (T vs A). | Low: about 1 hour to set up a bone map per source skeleton, then batch | **Recommended default.** Proven, simple. |
| **Retarget (extension), fork of Expy Kit** ([extensions.blender.org](https://extensions.blender.org/add-ons/retarget/)) | Free, GPL-3.0 | v5.1.1, 13 Jul 2026. **Blender 5+ only.** One review says it broke on 5.1; the developer says it works. | Medium | Good alternative with no login |
| **Expy Kit (original)** ([GitHub](https://github.com/pKrime/Expy-Kit)) | Free | v0.6.1 added Blender 4.0 support. Maintenance status not confirmed. | Medium | Use on Blender 4.x if you avoid Rokoko |
| **Auto-Rig Pro** ([Superhive](https://superhivemarket.com/products/auto-rig-pro/faq)) | **$50 full** (Remap is in full only); $25 Lite has no Remap **[snippet]** | The best Blender retargeter, and what rancidmilk used. | Low | **Over budget.** |
| Easy Retarget Rig | $29.99 | Blender 5.1+ | — | Over budget |
| AXIS Core | $6 | Mixamo/UE to Blender | ? | Not evaluated in depth |
| **Blender built-in** | Free | No native retargeting in core Blender 4 or 5 that I could find. The manual route is Copy Rotation/Copy Transforms constraints per bone, then NLA bake. | High (tedious, but works with no add-ons) | Fallback only |
| **Unity route** | Free (Unity Personal + the `com.unity.formats.fbx` FBX Exporter) | Import source and target as Humanoid, so Mecanim retargets at runtime. Humanoid clips are muscle curves, so you must sample and bake to bone transforms before export. Paid helpers exist (byte-bard "AnimToFBXExporter" etc., price not read). A free way: Unity Recorder's Animation Clip recorder on the target, then FBX Exporter. **[not verified this session]** | Medium-high per batch; FBX then needs a Blender pass to clean up and export GLB | Best for **Explosive** clips (no bone data) and Kevin's Unity packages. Otherwise unneeded. |
| **Godot 4 route** ([docs](https://docs.godotengine.org/en/4.5/tutorials/assets_pipeline/retargeting_3d_skeletons.html)) | Free | The import BoneMap with SkeletonProfileHumanoid renames bones and normalizes rests at import. Kevin has a Godot retarget tutorial. I found **no confirmation** that the retargeted result exports cleanly to glTF for three.js. | Unknown | Not recommended as an export path |
| **three.js runtime** (`SkeletonUtils.retargetClip`) | Free | It works, but the forum consensus is that it is finicky with rest-pose differences, and there is no current official example. | Medium; runtime cost | Avoid. Bake offline instead. |

**Effort, realistically:**
- One bone map per source skeleton (Kevin, CMU/rancidmilk, Mixamo-skeleton Rokoko clips): about 1 to 2 hours each including rest-pose fixes.
- Then batch retarget, then a cleanup pass for foot sliding and finger poses.
- Then export one GLB per character, or one shared animation GLB for the master skeleton.
- Total for the stack below: roughly 2 to 4 days of Blender work, before any hand-keyed animations.

---

## 4. Recommended animation stack

**Master skeleton.** Use one Unity-Humanoid-compatible skeleton for every character: the Synty-style rig the user picked, or a Mixamo-named rig with the same topology (3 spine bones, neck, head, clavicles, fingers). Rig the custom bodies to that skeleton and never deviate. Every clip is retargeted onto it once and exported as GLB, so three.js `AnimationMixer` plays any clip on any player.

**Practical retarget cases (one bone map each, built once):**
- **Mixamo-named → master:** Rokoko auto-detects Mixamo names. This covers Rokoko's free sports clips and any Mixamo-skeleton FBX, such as the GameDev Hero "_Mixamo" variants.
- **Kevin Iglesias rig → master:** use his Blender source files. Alternatively, in Unity both rigs are Humanoid, so the Unity bake route works with zero mapping effort.
- **UE Mannequin (Manny/Quinn) → master:** a standard Mannequin preset map exists in Rokoko and the Expy/Retarget add-ons. Only needed for Fab content.
- **Quaternius Universal rig → master:** needed for UAL 1 and 2, KinemIQ exports, and possibly rancidmilk's CMU library. One map covers all three, and this is the highest-value map because those are the free libraries.

If the user would rather have zero maps for the free libraries, the alternative is to use the Quaternius Universal Base Characters skeleton (CC0) as master instead. Then only Kevin, Mixamo and Mannequin content needs maps.

| # | Pack | Cost | Covers |
|---|---|---|---|
| 1 | Quaternius UAL 1 + 2 (already known) | $0, CC0 | Base locomotion, combat basics, deaths |
| 2 | **Kevin Iglesias Human Basic Motions** | **$18** (≤$20 regular) | (1) strafe, jump, emotes, 4 sit heights, knockdown and get-up; (6) cheer, cry and the other emotes |
| 3 | **Kevin Iglesias Human Dance FREE**, upgrade to full | $0, then **$18** | (1) dances, synced to 120 BPM |
| 4 | **Kevin Iglesias Human Soldier FREE** | $0 | (3) rifle and pistol idle, run, aim, shoot, reload, grenade, hits, deaths |
| 5 | **rancidmilk CMU library** | $0 (credit CMU) | (2) boxing material, falls, get-ups; (4) basketball shoot, golf swing; misc |
| 6 | KinemIQ library (optional) | $0 | (2) extra punches, kicks, blocks and dodges already on the Quaternius skeleton |
| 7 | Rokoko 12 free sports clips (check contents) | $0 | (4) possibly |

Total cost: **$18 to $36**, and every item is ≤$20 at regular price. Optional add-ons:
- SoraKazeStudio Basketball Shot, $19.99 (≤$20).
- Kevin Melee, only on sale (regular $23).
- Kevin Soldier full, only on sale (regular $30, has been $15).

**Gaps that still need custom animation in Blender:**
- **Fighting-game movesets (2):** this is the biggest gap. You need snappy, readable attacks with anticipation, active and recovery frames, plus grabs and throws, blocks, and directional hit stuns. No free or ≤$20 pack delivers a Street Fighter quality set. Mocap punches and kicks (CMU, KinemIQ, Kevin Melee's 3 punches and 2 kicks) are reference at best. Budget hand-keyed time here: about 15 to 25 clips.
- **Golf putt, pool cue stroke, air-hockey lean:** short hand-keys, plus IK in-game for the hands.
- **Seated driving:** a sit loop plus wheel IK and a couple of lean poses.
- **Snowboarding:** a pose set (stance, carve L/R, crouch, air, wipeout) blended in-game, unless the CGTrader pack turns out to be ≤$20.
- **Podium and victory poses:** 3 to 5 held poses (1st, 2nd, 3rd, sulk).
- **Taunts:** Kevin's emotes are polite (wave, clap, laugh). For "Rage Quit" style taunts, hand-key a few.

**Retargeting path.** In Blender, use the **Rokoko Studio Live add-on** (free, account login). If you won't log in, use **Retarget/Expy Kit**. Build one bone map per source:
- Kevin: use his Blender source files, not the FBX.
- CMU/rancidmilk.
- Mixamo-skeleton Rokoko clips.

Bake onto the master skeleton, clean up, and export GLB. Use the Unity bake route only if you ever buy Explosive packs. Skip Godot and runtime retargeting.

---

## What I could not verify

- **Asset Store prices for Kevin's Melee and Soldier packs.** The itch.io prices are confirmed; Basic Motions is $18 on both stores.
- **Text of keviniglesias.com/#license.** The section rendered empty to my fetch tool. I relied on the license page in his PDFs, which points to the Unity Standard EULA.
- **CMU license on CMU's own site.** It failed with a TLS certificate error; I used the CMU text quoted on rancidmilk's page.
- **Other license texts not read:** Rokoko ToS, Truebones current TOS, ActorCore current license, KinemIQ Terms §6, Fab full EULA.
- **Prices not read:** MoCap Online starter packs (rate-limited), CGTrader snowboard pack, Fab InCar AnimSet.
- **Rigs not confirmed:** whether SoraKazeStudio's basketball pack is Humanoid, and which Quaternius skeleton rancidmilk retargeted to (it may not be the Universal Base Characters rig).
- **Untested pipelines:** the Godot export path and the free Unity Recorder bake path.
