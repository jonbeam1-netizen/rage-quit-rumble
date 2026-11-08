# Large Humanoid Animation Libraries for Rage Quit Rumble

Research date: 2026-11-07. Research only: nothing was downloaded, no code written.

**How to read this.** "Verified" means I read it on the vendor's or licensor's own page during this session. "Reported" means it came from search snippets, forums, resellers or aggregators. Several store pages (Synty, Adobe HelpX, the ActorCore store, Unity Asset Store descriptions, Rokoko pricing details) either blocked the fetcher (403/429) or render client-side and came back empty. Those gaps are listed in the final section.

Ratings are out of 5. **Cov** = coverage of our six needs. **Qual** = motion quality. **Lic** = license safety for a browser game whose files can be extracted. **Fit** = ease of getting onto a Mixamo-compatible rig.

---

## 0. The licensing problem for a browser game (applies to every entry)

Almost every commercial animation license allows use "incorporated into" a game and forbids distributing the files "standalone". A three.js game ships GLB files that anyone can pull out of the browser's network tab. The licenses fall into three groups:

1. **"Not standalone" licenses** (Adobe/Mixamo Content Files, Fab Standard, Unity Asset Store, MoCap Online's redistribution clause). Animation baked into a character GLB and loaded by the game is the end product, not a standalone redistribution. This is the practical industry reading, and the same exposure exists in every WebGL Unity build.
2. **"Not extractable" licenses** (MoCap Online: "Site Materials cannot be extractable in a format that allows their reuse"; "Distribution is allowed only as binary-only"). A GLB is a documented open format, so these clauses are a real problem in a browser. Get written permission before relying on them.
3. **Open licenses** (CC0 Quaternius, CMU "include in commercial products, don't resell"). No problem.

**Mitigations that apply to every paid library:**
- Bake clips into the character GLB, or into one game-specific animation GLB, never into a per-vendor "library" file.
- Strip clips the game doesn't use. Use Draco/Meshopt compression and quantized tracks.
- Don't name files after the vendor pack.
- **Keep the source repository private.** A public GitHub repo containing raw FBX or GLB from any paid pack, or from Mixamo, is a clear standalone redistribution under every license here.

---

## 1. Mixamo (Adobe)

- **URL:** https://www.mixamo.com
- **Price:** Free with an Adobe ID.
- **License, verified:**
  - The Mixamo Additional Terms (effective 23 June 2021; I extracted the PDF text at https://wwwimages2.adobe.com/content/dam/cc/en/legal/servicetou/Mixamo-Addl-Terms-en_US-20210623.pdf) contain only one substantive clause, a ban on AI/ML training. They incorporate the Adobe General Terms.
  - The General Terms §3.6 "Content Files" (https://www.adobe.com/legal/terms.html) grant a license "to use the Content Files to create your end use (i.e., the derivative application or product authored by you) into which the Content Files, or derivations thereof, are embedded". You "may reproduce and distribute Content Files only in connection with your End Use", but "under no circumstances can you distribute the Content Files on a stand-alone basis, outside of the End Use."
  - The separate §3.5 "Sample Files" clause has an explicit anti-extraction rule ("in any way that allows a third party to use, download, extract, or access... as a stand-alone file"). **§3.6 has no such rule.** That difference matters for a browser game.
  - The widely cited Adobe Community licensing FAQ (https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400) lists video games and DLC as allowed. It says "really the only thing you can't do is distribute the raw character and animation files", and it disallows game-engine asset packages that redistribute raw files. **Caveat:** it was written by a community member ("TylerG 3D"), not identified as Adobe staff, and dated 2022.
  - The official HelpX FAQ (helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) returned 403, so I could not read it.
- **Strict reading:** A GLB served to the browser is a standard, trivially extractable file containing the full animation curves. A cautious lawyer could argue that hosting it on a public CDN is functionally distributing the raw file. Adobe has never addressed WebGL or three.js specifically.
- **Practical reading:** Under §3.6 the clips are "embedded" in your End Use (the game) and distributed "only in connection with" it. Nothing in §3.6 requires you to stop extraction, unlike the Sample Files clause. Thousands of shipped WebGL, Unity WebGL and Roblox-style projects do exactly this. My judgement: **realistically permitted** if the clips ship baked into game assets and are never offered as a pack or put in a public repo. Residual risk is low but not zero.
- **Other risks:**
  - The service is reported to be in "maintenance mode", with a June 2025 outage and no new content in years (reported, Cinevva guide; MoCap Online's competitor blog).
  - Downloads are tied to an Adobe account. **Download everything you need now and archive it privately.**
- **Clip count:** About 2,450 to 2,500. A third-party research dataset counted 2,453 (huggingface.co/datasets/jasongzy/Mixamo). Not verified with Adobe.
- **Relevant categories, from my own knowledge of the library (not re-verified this session):**
  - Locomotion including strafes, jumps, crouch walk, sitting, idles.
  - Many dances, taunts and emotes.
  - Boxing, MMA, kicks, blocks, hit reactions, knockdowns, get-ups, some grapple and "thrown" clips.
  - Pistol and rifle idle, run, aim, fire, reload, death.
  - Deaths, victory, defeat.
  - Sports: a few golf clips (drive, putt) and some ball-throw clips. Little or no pool, snowboard or seated-driving content.
  - Verify specific clips on mixamo.com.
- **Native skeleton:** Mixamo rig ("mixamorig:" prefix, 65 bones with fingers). Clips are in place or with root motion. Exports FBX (with or without skin) and DAE.
- **Onto other skeletons:**
  - **Ready Player Me:** native (RPM avatars use Mixamo-compatible bone names).
  - **CC4:** CC4 has a Mixamo retarget profile, so clips can be imported via iClone, or retargeted in Blender.
  - **Unity Humanoid:** automatic.
  - **UE5:** IK Retargeter with a Mixamo IK rig.
  - **Quaternius Universal:** retarget in Blender (Auto-Rig Pro or a Rokoko retarget add-on) or with three.js `SkeletonUtils.retargetClip`.
- **Ratings:** Cov 4.5 · Qual 3 · Lic 3.5 · Fit 5
- **Take:** Still the single biggest free source, and it covers needs 1, 2, 3 and 6 well enough for a party game. Quality is uneven: foot sliding, stiff hands, inconsistent root motion. The license is workable if clips are baked into game GLBs and the repo stays private. The real risk is that the service disappears, so archive now.

---

## 2. Rokoko Motion Library

- **URL:** https://www.rokoko.com/products/motion-library (in the Rokoko Studio app)
- **Price:** Not published clearly anywhere I could read.
  - Rokoko's support pages say "many of the assets... are free", others cost "$3 to $20 USD".
  - Older Unity-blog tiers were $1 standard, $5 plus and $20 pro, with a $10/month subscription.
  - A reseller sells $50 "Motion Library Credits" (Knoxlabs).
  - New accounts get "100 free mocap assets" (verified on the product page).
- **License:** The pricing page (https://www.rokoko.com/pricing, verified) says "Export and use in any of your projects, including commercial ones." I found no full license text, so redistribution terms are unverified.
- **Clip count and categories:** "Thousands" (verified, product page). Assets come from many third-party mocap studios. Filters cover category, gender and loopable. I could not list categories, and found no confirmed golf, pool, snowboard or driving sets.
- **Native skeleton:** Clips are bought as FBX on the publisher's skeleton (HumanIK convention, reported). Rokoko Studio retargets on export to six skeletons, including Rokoko Newton and Mixamo variants (support.rokoko.com export docs, reported). Formats are FBX, BVH and CSV.
- **Onto other skeletons:**
  - **Mixamo/RPM:** export with the Mixamo preset.
  - **CC4:** iClone has a Rokoko plug-in. Otherwise go via the Mixamo preset and the CC4 Mixamo profile.
  - **Unity Humanoid / UE5:** standard import plus retarget.
  - **Quaternius:** Blender retarget.
- **Ratings:** Cov 3 (unknown breadth per category) · Qual 4 (real studio mocap) · Lic 3.5 (commercial use stated, no full text read) · Fit 4.5
- **Take:** Good for gap-filling individual mocap clips cheaply once you are inside the app. It is opaque from outside, so plan to browse it in Rokoko Studio before relying on it for sports.

---

## 3. Reallusion ActorCore and iClone motion packs

- **URL:** https://actorcore.reallusion.com (store renders client-side; I could not read it). iClone packs are at https://marketplace.reallusion.com.
- **Price, reported:**
  - Single motions cost about $1.50 to $12 depending on length (Reallusion forum, older).
  - Packs run roughly $0 to $200.
  - Frequent sales.
  - I could not verify current prices.
- **License:**
  - Reallusion Content License page (https://reallusion.com/license/content.html, verified): with the Standard License, "all exportable 3D Assets... are allowed to be used in games, apps and AR/VR projects."
  - Standard "may not be used for in-app purchases".
  - Content may not be used in ways that compete with Reallusion.
  - Enterprise covers "Embed into any application or service" and AI training.
  - A Reallusion staff forum reply says motions can be used in multiple games with multiple characters on the Standard License (reported). The one-character limit applies to CC character components, not motions.
  - **Two flags for us:**
    - The Standard EULA excerpt quoted on the forum bans "embedding in apps or online services". This probably targets content libraries and character creators, but a browser game is literally an online service. Get a written answer from Reallusion.
    - "No in-app purchases": if motions become paid emotes, Standard does not cover it.
  - Separate "export licenses" are no longer needed for ActorCore downloads. ActorCore exports FBX directly with engine presets. The cheaper in-software "iContent" license does *not* allow external export, so buy the Standard/export version of iClone Marketplace packs.
- **Clip count and categories:**
  - Thousands of motions (Reallusion's own figure; not verified this session).
  - Strengths: stunts and fights (Monkey Chow, Hollywood stunt packs), locomotion, social and conversation, sitting, dance, deaths and hit reactions, animated-prop packs (skateboard; biking announced for 2025).
  - Sports: the iClone "Sport Motion Pack" has a golf drive plus soccer and MMA (marketplace.reallusion.com/sport-motion-pack).
  - Basketball items found were 2D Cartoon Animator content, not 3D.
  - I found no snowboard, pool or seated-driving pack.
- **Native skeleton:** CC3/CC4 "CC_Base" skeleton. That is native for CC4 and AccuRig characters. Formats are FBX (24, 30 or 60 fps) with presets for Blender, Maya, Unity and Unreal (reported). AccuRig 2.0 (free) can browse ActorCore motions.
- **Onto other skeletons:**
  - **CC4:** native.
  - **Mixamo/RPM:** retarget in Blender, or in iClone, then export.
  - **Unity Humanoid:** automatic.
  - **UE5:** IK Retargeter (Reallusion ships UE retarget assets).
  - **Quaternius:** Blender.
- **Ratings:** Cov 4 · Qual 4.5 · Lic 3 (needs a written answer on "online service") · Fit 4 (native for CC4; one retarget for Mixamo)
- **Take:** The best paid library if the character is CC4. The mocap is high quality and the stunt and fight content is strong. The license wording around online services and in-app purchases needs a written yes from Reallusion before you ship.

---

## 4. MoCap Online (sells Motus Digital mocap)

- **URL:** https://mocaponline.com
- **Price:**
  - Packs cost $19.99 to $299.99 (MoCap Online's own comparison page, verified). Bundles go up to $705.
  - Pistol full set $149.99 (868 files, reported). Shooter bundle $299. Halloween bundle $119.
  - Library size: "3,000+ clips across 40+ packs" on its LLM summary page, but "2,500+ clips, 42 packs" on its Mixamo comparison page.
  - A free sampler pack exists.
- **License tiers** (https://mocaponline.com/pages/licensing, verified):

  | Tier | Price | Scope |
  |---|---|---|
  | Standard | Included with every purchase | Up to 1M end users / $1M gross revenue. No AI use, no transfer to clients. |
  | Commercial | Per project; no price listed | Above 1M users; revenue up to $30M |
  | Enterprise | Custom quote | Above $30M or 10M+ users |
  | Additional Usage | $399 | Rights for a second project |
  | AI Usage Permit | Annual | Case by case |

  - "You can't resell or redistribute the raw animation files."
  - Third-party store purchases (Unity Asset Store, Unreal/Fab) "are subject to both the platform's terms AND MoCap Online's license", and Commercial licenses are only sold on mocaponline.com. **So the Unity and Unreal store versions do not escape MoCap Online's terms.**
- **"Cannot be included in other products" clause** (Standard License page, https://mocaponline.com/pages/standard-license, verified):
  - Items may not be "redistributed or resold 'as-is' or as part of any other collection of files".
  - You may "integrate the component in end user applications such as... games".
  - "Distribution is allowed only as binary-only".
  - "Site Materials cannot be extractable in a format that allows their reuse".
  - The last two are the problem for three.js, where GLBs are extractable by design. **Lowest license-safety of the paid options unless they agree in writing.**
- **Categories** (from its LLM summary page; no pack sizes):
  - **Movement and combat:** Mobility (200+ walks, runs, turns, strafes), Walking, Ladder, Rifle, Pistol, Hip Fire, Punch (boxing, blocks, dodges), Ninja (martial arts, takedowns), Death (deaths and hit reactions).
  - **Character and social:** Zombie, Scared, Dance, Bar, Park (bench sitting), Play, Conversation, Desk, Meeting.
  - **No sports, no driving.**
- **Native skeleton:** Motus mocap. Shipped as FBX, 3ds Max BIP, Unreal (Epic skeleton UE4/UE5), Unity (Mecanim Humanoid), Blender (Rigify) and iClone/CC rigs.
- **Onto other skeletons:**
  - **CC4:** use the iClone/CC version.
  - **Unity / UE5:** native versions.
  - **Mixamo:** FBX plus a Blender retarget.
  - **Quaternius:** Blender.
- **Ratings:** Cov 3.5 (strong for guns and locomotion) · Qual 4.5 · Lic 2 (browser extractability clause) · Fit 3.5
- **Take:** The best-quality gun and locomotion mocap for sale. However, its "binary-only, not extractable" wording is the clearest conflict with a browser game of anything here. Buy only after emailing them and getting written permission for WebGL/three.js GLB delivery.

---

## 5. Synty ANIMATION packs

- **URL:** https://syntystore.com (product pages returned 429 to my fetcher; data below is from search snippets and resellers)
- **Price, reported:**
  - **ANIMATION Collection bundle:** $204.99 (from $409.99), shown as sold out. Contains six packs: Base Locomotion, Emotes and Taunts, Idles, Sword Combat, Bow Combat, Goblin Locomotion.
  - **Base Locomotion:** $69.99, 247 clips, Mecanim controllers for masculine and feminine characters.
  - **Idles:** $34.99 to $49.99, 330 FBX files.
  - **Bow Combat:** $99.99, 190 clips.
  - **All Access Pass subscription:** from $30/month (3-month prepaid term); covers 130+ packs.
- **License:** One Time Purchase EULA (formerly "Standard EULA") or Standard Subscription EULA (https://syntystore.com/pages/licences-overview). I could not read the redistribution clause. Synty is generally "use in your game, don't redistribute assets". The subscription lets you keep using assets after you cancel once the project ships (reported).
- **Relevant clips:**
  - Lobby: locomotion including strafes (8-direction not confirmed), plus emotes, taunts and idles.
  - Nothing for guns, sports or driving. Fighting is sword and bow only.
- **Native skeleton:** Synty POLYGON/Sidekick humanoid. Described as "made for Unity", as Unity Humanoid FBX.
- **Onto other skeletons:**
  - **Unity Humanoid:** any humanoid via Mecanim.
  - **Outside Unity:** retarget the FBX from the Synty skeleton in Blender, then export GLB for Mixamo/RPM, CC4 or Quaternius. UE needs an IK Retargeter.
  - I found no confirmation that Synty supports non-Synty rigs outside Unity.
- **Ratings:** Cov 2 · Qual 4 (clean, stylized, well looped) · Lic 3.5 (unread) · Fit 3
- **Take:** Very good lobby locomotion, emotes and taunts with clean loops, but narrow. It's Unity-oriented, so for three.js it costs a retarget step. Worth it only if the emotes and taunts sets beat Mixamo's for your style.

---

## 6. Kevin Iglesias, complete set (new facts only)

- **Human Mega Animations Pack:** **$130** on the Unity Asset Store, v2.0, released 6 May 2026, 200.4 MB, Built-in/URP/HDRP, Single or Multi Entity seats. Listed as an "Extension Asset", so seat-based licensing applies (https://assetstore.unity.com/packages/3d/animations/mega-animations-pack-162341, verified). Also $130 on itch (kevdev.itch.io).
- **Lite bundles:** Mega Pack Lite I $65 (Basic Motions, Crafting, Dance, Melee; 726 files; normally $84 combined) and Lite II $72 (itch/Gumroad, reported).
- **Not verified:** exactly which packs the $130 Mega includes, and whether it covers every pack (Soldier, Throwing, Spellcasting, Archer and others) or whether newer packs sit outside it. Check the "Package Content" tab before buying.
- **Native skeleton:** Unity Humanoid FBX. itch/Gumroad versions are sold outside the Asset Store (license there not read).
- **Ratings:** Cov 3 · Qual 3.5 · Lic 4 (Asset Store EULA) · Fit 4
- **Take:** Buy the $130 Mega rather than the packs one by one. It is the cheapest broad stylized set, but confirm its contents first.

---

## 7. Fighting and martial-arts sets

| Pack | Maker | Price | Clips | Skeleton | Notes |
|---|---|---|---|---|---|
| **Fighter Pack Bundle** | Explosive | **$119.99** (Asset Store, v2.3, 6 May 2025; verified) | Not stated (description empty) | Unity Humanoid | Reported to combine the Female, Male, Heavy and Berserker fighter packs. Free version available. |
| **Frank Fighting Pack 1+2** | Frank Climax | **$39.99** (Unity, reported) | 57 motions, 114 files (root motion and in-place) | Unity Humanoid | Punches, kicks, hits |
| **Frank Climax's Fighting Set** | Frank Climax | Not read (Fab/UE page returned 403) | Reported categories totalling 217 (Fury, Grapple, Soft_Landing, KO, Hit) | UE mannequin | **Has grapple and KO, the Smash/SF essentials** |
| **Fighting Animset Pro** | Kubold | **$80** single seat (Asset Store, verified) | 230+ unarmed (Fab listing, reported): hits, knockouts, get-ups, blocks, dodges, jumps | Unity Humanoid / FBX | Strong reputation for weight |
| **Extreme Fighter Bundle** | MotionDezire | Not stated | 485+ combat clips (80.lv, verified) | Unity Humanoid | Over-the-top superhero moves (aerial strikes, flips). Includes armed moves. |
| **GameDev Hero (GDH) Unarmed Fighting V1 to V4** | GameDev Hero | V4 "Street Fighter Style" $19.99 (itch list; $6.99 on sale). **Unarmed Bundle $52.99 / 167 clips.** **All Animation Bundle $449.99** on itch, "from $104.99" on Fab. | V4: 123 clips | UE5 Manny **plus Mixamo-rig versions** (itch titles say "UE, Unity, Mixamo") | V4 covers jump attacks, knockdowns, **throws, grabs**, Shoryuken and Hadouken-style specials, crouch, defense. **License text not stated on itch; Fab purchases fall under the Fab Standard License.** |
| **Grab & Throw Takedown Pack** | Raise Creation | **$22.99** (Fab, verified) | 23 paired attacker and victim takedowns (47 files) | UE (FBX) | Throws, sweeps, slams. **Paired clips are exactly what grabs need.** |
| **Knockdown & Get-Up Pack** | Raise Creation | **$10.99** (Fab, verified) | 50+ | UE (FBX) | Knockdowns, ground states, get-ups, in-place and root motion |

**Fab license** (https://www.fab.com/eula summary, verified):
- Use "with any compatible tools (usage is not limited to Unreal Engine)".
- "Commercially distribute your Projects with the Fab assets incorporated".
- No standalone redistribution.
- Personal tier for buyers under $100k revenue in the last 12 months, Professional above that (https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab).
- Fab listings bought under Standard can be used in three.js.
- Old "UE-Only" Marketplace-licensed items still exist. Check each listing's license field; the Raise Creation listings showed none in my fetch.

**Ratings:**
- **GDH:** Cov 4 for fighting · Qual 3.5 · Lic 3 (buy via Fab for a clear license) · Fit 5 (Mixamo versions)
- **Kubold FAP:** Cov 4 · Qual 4.5 · Lic 4 · Fit 4
- **Explosive:** Cov 3.5 · Qual 3.5 · Lic 4 · Fit 4
- **Frank:** Cov 4 · Qual 4 · Lic 4 · Fit 3.5
- **Raise Creation:** Cov 3 (narrow but critical) · Qual unverified · Lic 4 (Fab) · Fit 3.5 (UE Manny to Mixamo retarget)

**Take:** For Street Fighter and Smash style, the important parts are **paired grabs and throws, knockdowns and get-ups**, which Mixamo barely covers.
- The cheapest well-licensed fit is **GDH Unarmed Bundle (via Fab) + Raise Creation Grab&Throw + Knockdown/Get-Up, about $85 to $90**.
- Add **Kubold Fighting Animset Pro ($80)** for weightier hits and blocks.

---

## 8. Sports, driving and snowboarding

| Need | Best find | Price | Skeleton/format | License | Verified? |
|---|---|---|---|---|---|
| **Golf** | Motion Cast #05 Golf Vol.1 (Superhive) | **$45** | .blend (Blender 3.x), 30 fps mocap; rig unstated | "Royalty Free" (Superhive) | Verified. 6 putts, 6 irons, 3 drivers, 6 wedges, 5 hybrids, ball placement, 4 spectator clips, plus about 21 humorous clips. **Best golf coverage found.** |
| Golf | Ailive "Golf Animation Pack" (Fab) | **$1.99** | FBX, UE5 Manny | Fab Standard (license field blank) | Verified. Drive, putt, ball placement. |
| Golf | CGTrader "Golf Action Animations" | Not seen | FBX, Unity Humanoid; 15 clips | CGTrader royalty-free (assumed) | Reported |
| Golf | Reallusion Sport Motion Pack | Not seen | iClone/CC | Reallusion Standard | Reported (golf drive only) |
| **Basketball** | Unity "Basketball Animation" (123 clips: shots, dribbles, crossovers) | Was $69.99 | Unity Humanoid | — | **Deprecated, no longer purchasable** (verified) |
| Basketball | CGTrader "Basketball avatars actions" (about 120 clips) | Not seen | FBX | — | Reported |
| Basketball | Araz Creates "Basketball Emotes Mocap" (UE forum) | Not seen | UE | — | Reported |
| Basketball | Xsens free sports set (10 clips incl. a basketball free throw) | Free | FBX, Xsens MVN puppet | Not stated on page | Verified page; license unread |
| **Pool / billiards** | **Nothing found** | — | — | — | Only props and SFX exist |
| **Air hockey** | **Nothing found** | — | — | — | — |
| **Snowboard** | CGTrader "Snow board animations" (50+ clips, male and female) | Not seen | FBX, Unity Humanoid | — | Reported only (page would not load) |
| **Seated driving** | "Car Interaction Animset Vol 01" (Fab) | Not seen | UE5 Manny; 109 clips including 31 driving/riding (steer, reverse, brake), 4 enter/exit, 2 seat switch | Fab | Reported |
| Seated driving | "Tactical Car Driving" (Fab) | Not seen | 278 clips: driver and passenger, enter/exit variants, hijack | Fab | Reported |
| Seated driving | Ultimatrix "Photorealistic Drivable Multiplayer Supercar" (Fab) | $49.99 | UE only; enter, seat, exit, steering hand | Fab | Verified; overkill |

**Take:**
- Golf and seated driving are buyable.
- Basketball and snowboard exist only as small CGTrader or UE-store packs of unknown quality.
- **Pool and air hockey do not exist as products anywhere I searched.**
- The CGTrader golf, basketball and snowboard items share wording ("avatar actions", "humanoid and Generic Animations format flexibility") and appear to come from one mobile-game seller. Preview before buying.

---

## 9. Other libraries and datasets

**Truebones**
- **URL:** truebones.gumroad.com
- **Price:** The "Motherlode" (marketed as the world's largest mocap library, FBX/BVH) has been sold at $45 to $49 in recurring sales. There is a free 500-motion pack and a 10,000-motion "ProBones" bundle.
- **License:** **Not found.** I saw no license text in any listing.
- **Skeleton:** Truebones BVH/FBX skeletons. Mixed quality, including some adult content.
- **Ratings:** Cov 3.5 · Qual 2.5 · Lic 1.5 (unknown) · Fit 3
- **Take:** A cheap raw-mocap haystack, but don't ship anything from it without written license terms.

**Noitom Mocap.Market**
- Free library. You sign up and accept "the specified Creative Commons license" before downloading (Noitom executive interview, 80.lv).
- Which CC variant applies was not verified. If it is NC, it is unusable.
- Ratings: Lic 2 until verified.

**Movella (Xsens)**
- Free assets page (https://www.xsens.com/entertainment/free-xsens-motion-capture-animation-assets, verified): 22 clips in three packs (5 walk/run, **10 sports** including a basketball free throw and a soccer kick, 7 dance). FBX on an MVN puppet.
- License terms not on the page.
- Movella sells no animation store. Its paid product is Xsens hardware and software, which is relevant if you hire a studio.
- A Fab "MetaHuman Cinema Pack" from IM3D includes 562 Xsens clips for $169.99. They are office, sitting and dining clips, no sports.

**CMU Graphics Lab Motion Capture Database**
- About 2,600 raw clips (rancidmilk's conversion is already known to you).
- Terms are as I recall them from mocap.cs.cmu.edu ("free for use in research projects. You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form"). **The site's TLS certificate failed in my fetch, so this was not re-read this session.**
- It includes some sports-ish raw clips (basketball dribbling, golf swings) that would need cleanup.

**Ubisoft La Forge LaFAN1**
- 77 sequences, 496k frames of BVH.
- **CC BY-NC-ND 4.0** (reported via Papers with Code and derived datasets; the GitHub LICENSE was not read). **Non-commercial: unusable.**

**Bandai Namco Research Motion Dataset**
- https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset (verified): **CC BY-NC 4.0, non-commercial: unusable.**
- Dataset 1 has 17 contents (including fighting and dancing) in 15 styles. Dataset 2 is locomotion in 7 styles. BVH.

**Cascadeur** (tool, not a library)
- Physics-assisted keyframe animation with AutoPosing and AI inbetweening. Good for hand-keying pool shots, air hockey and stylized fighting specials on your own rig.
- Free tier and paid tiers exist; I did not verify current pricing this session.

---

## 10. Make-your-own from video (needed for pool, air hockey, possibly snowboard)

| Tool | Price (verification level) | Commercial license | Notes |
|---|---|---|---|
| **DeepMotion Animate 3D** | Freemium: 60 s/month, **non-commercial only** (verified on deepmotion.com/pricing-animate3d). Paid tiers roughly $9 to $48/month on aggregators (conflicting). Studio tier: "unlimited credits, first 7,200/month at priority". | Requires a premium (paid) plan; free credits never grant a commercial license (verified) | 1 credit = 1 second. Hand/face tracking adds 0.5 credit per second. Single-camera. |
| **Move AI (Move One / Move Pro)** | Move One reported at about $14 to $18/month Starter (60 credits), $46 Standard (180 credits), $490 Advanced. Teams $75/user/month (min. 3 users). Move Pro (multi-camera) custom; one report says $995 for 30 days. Credit rate conflicts in Move AI's own docs (1 to 2 vs 6 to 12 credits per second). | Reported: commercial use on Standard and up | Best quality of the AI options. Multi-camera Pro handles fast sports motion better. **Pricing page returned 404; all figures unverified.** |
| **Rokoko Vision** | Free "Starter" tier exists. "Create" tier includes Vision processing quotas (3,000 to 15,000 s/month; conflicting snippets). | Rokoko says exports usable commercially | Single- or dual-camera. Retargets to the Mixamo preset in Rokoko Studio. |
| **Plask Motion** | Free tier; paid $18 to $50/month billed annually (aggregator, May 2026) | Not verified | Browser-based editor |

**Practical note:** Pool and air hockey are mostly upper-body and close to a table. Webcam or phone AI mocap handles them acceptably. The usual problem is the cue or paddle occluding the hands, so expect hand cleanup in Cascadeur or Blender. For snowboard tricks, buy a Rokoko Smartsuit-style capture day or hand-key. Video AI does poorly with a board and fast rotations.

---

## (a) Coverage matrix

Key: **●** strong · **◐** partial · **○** little or none · **?** unverified

| Library | 1 Lobby (8-dir, jump, crouch, emotes, dance, sit) | 2 Fighting (strikes, blocks, hits, KD, get-up, grabs/throws) | 3 Guns (pistol, rifle) | 4 Sports (golf, pool, b-ball, air hockey) | 5 Driving / snowboard | 6 Victory, lose, podium, death, get-up | Cost |
|---|---|---|---|---|---|---|---|
| Mixamo | ● | ◐ (thin on paired grabs) | ● | ◐ (golf only) | ○ / ○ (some sitting) | ● | Free |
| Quaternius UAL 1+2 (known) | ● | ◐ | ◐ | ○ | ○ | ◐ | Free |
| Kevin Iglesias Mega | ● | ◐ (melee) | ◐ (Soldier pack, if included) | ○ | ○ | ◐ | $130 |
| Synty ANIMATION bundle | ● (incl. emotes, taunts) | ○ (sword/bow only) | ○ | ○ | ○ | ◐ | ~$205 or $30/mo |
| ActorCore / iClone | ● | ● (stunts) | ◐ | ◐ (golf drive) | ? / ○ | ● | Per pack, $? |
| MoCap Online | ● (Mobility, Park sitting, Dance) | ◐ (Punch, Ninja) | ● (Pistol, Rifle, Hip Fire) | ○ | ○ | ● (Death) | $20–$705 |
| Rokoko Motion Library | ◐? | ◐? | ◐? | ◐ (12 free sports; others ?) | ? | ◐? | $0–$20/clip |
| GDH Unarmed + Raise Creation | ○ | ● (incl. grabs, throws, KD, get-up) | ○ | ○ | ○ | ◐ (KD/get-up) | ~$86 |
| Kubold Fighting Animset Pro | ○ | ● (no paired throws confirmed) | ○ | ○ | ○ | ◐ | $80 |
| Motion Cast Golf | ○ | ○ | ○ | ● golf only | ○ | ◐ (humorous reactions) | $45 |
| Car Interaction Animset (Fab) | ○ | ○ | ○ | ○ | ● driving / ○ | ○ | $? |
| CGTrader snowboard pack | ○ | ○ | ○ | ○ | ○ / ◐? | ○ | $? |
| Video AI mocap | n/a | n/a | n/a | ● (fill-in) | ◐ | ◐ | $15–$500/mo |

---

## (b) Recommended stacks

### Stack A: Mixamo-compatible skeleton (Ready Player Me, Mixamo characters, or any GLB rigged via Mixamo)

| Need | Source | Cost |
|---|---|---|
| Base lobby, guns, deaths, victory, dances | **Mixamo** (archive the whole library now) + **Quaternius UAL 1+2** | $0 |
| Stylized locomotion, emotes, melee, soldier | **Kevin Iglesias Human Mega Animations Pack** (Unity Humanoid FBX; retarget once in Blender to mixamorig) | $130 |
| Fighting core with Mixamo-native versions | **GDH Unarmed Fighting Bundle** (167 clips; buy on Fab for the clear Fab Standard License) | ~$53 (itch price; Fab price unverified) |
| Grabs and throws (paired) | **Raise Creation Grab & Throw Takedown** (Fab) | $22.99 |
| Knockdown and get-up | **Raise Creation Knockdown & Get-Up** (Fab) | $10.99 |
| Weightier hits and blocks (optional) | **Kubold Fighting Animset Pro** | $80 |
| Golf | **Motion Cast Golf Vol.1** + **Ailive Golf** (Fab) | $46.99 |
| Seated driving | **Car Interaction Animset Vol 01** (Fab) | Unverified (likely $20–$60) |
| Basketball, snowboard | CGTrader packs (preview first), or video mocap | Unverified (likely $20–$60 each) |
| Pool, air hockey, gaps | **Move AI Move One Standard**, 2 months | ~$92 |
| **Verified subtotal** | | **≈ $436 (with optional Kubold)** |
| **Realistic total incl. unverified items** | | **≈ $550–$650** |

Skip MoCap Online in this stack unless they give written WebGL permission. Mixamo's gun set is adequate for a party game.

### Stack B: Reallusion CC4 character

| Need | Source | Cost |
|---|---|---|
| Lobby, fighting, stunts, deaths, victory, sitting | **ActorCore** packs (native CC_Base; no retarget). Pick locomotion, stunt/fight, social/sitting and dance packs. | Unverified; budget **$300–$600** for ~6–10 packs at typical $40–$100 pack prices |
| Free filler | **Mixamo** (retarget via CC4/iClone Mixamo profile or Blender) + **Quaternius** | $0 |
| Guns | **MoCap Online Pistol + Rifle** in **iClone/CC format** (only with written WebGL permission), otherwise Mixamo | $150–$300 or $0 |
| Paired grabs, throws, KD/get-up | **Raise Creation** two packs (UE Manny, retarget to CC4 via iClone or Blender) | $33.98 |
| Golf | Reallusion **Sport Motion Pack** (native) + **Motion Cast Golf** | $45 + unverified |
| Seated driving, snowboard, basketball, pool, air hockey | Same as Stack A, retargeted to CC4 | as above |
| Video mocap | **Rokoko Vision** (pairs with iClone's Rokoko plug-in) or Move AI | ~$50–$100 |
| iClone 8 for retargeting and cleanup (optional; Blender works too) | Reallusion | Not verified this session |
| **Realistic total** | | **≈ $650–$1,200** (excluding iClone, and excluding MoCap Online if not cleared) |

**License action items for Stack B:** get written confirmation from Reallusion that motions in a browser three.js game are not "embedding in an online service". Make no motion a paid in-app purchase on the Standard license. Also note CC4 *character* (not motion) components are limited to one character under Standard; Extended is needed for mass character output. Your design has one shared character, which fits.

---

## (c) What still needs custom animation or video mocap

1. **Pool/billiards cue shots:** address, aim, stroke, follow-through, bridge-hand pose, spectator lean. **No product exists.** Video mocap plus Cascadeur cleanup. Hand IK to the cue at runtime.
2. **Air hockey:** striker push and slide, ready stance, side shuffle. **No product exists.** Simple enough to hand-key or video-capture. Use runtime IK for the hand-to-mallet contact.
3. **Basketball ball handling:** the only big pack (123 clips) is deprecated. Shooting can come from Xsens free, Mixamo or CGTrader, but **dribble cycles synced to a ball** will need video mocap, or procedural hand and ball sync.
4. **Snowboard:** only one unverified CGTrader pack. Stance, carve lean, ollie and grab tricks, fall. Plan to hand-key in Cascadeur or do a capture session. Video AI struggles here.
5. **Smash-style specials and podium poses:** stylized aerial specials can come from GDH V4 and Extreme Fighter. **Podium and placement poses** (1st/2nd/3rd, sulk, clap) are easy to key or capture with phone mocap.
6. **Ragdoll to get-up blending:** get-up clips exist (Raise Creation, Mixamo, Kubold), but you need **face-up and face-down get-ups matched to ragdoll end poses**. That is runtime pose-matching work, not a library purchase.
7. **Golf follow-through to a reaction:** the Motion Cast pack ships no ball or club props for some clips. Attach club bones and sync the ball yourself.
8. **8-direction strafing completeness:** Mixamo and Quaternius have strafes but not a clean 8-way blend-space set with matched cycle lengths. Synty Base Locomotion or MoCap Online Mobility would, at the license costs noted.

---

## What I could not verify

- **Adobe HelpX Mixamo FAQ** (403). The Mixamo reading above rests on the Additional Terms PDF (read), General Terms §3.6 (read) and a community-written FAQ. No Adobe statement on WebGL/three.js exists that I found.
- **Synty** product pages and EULA text (429): prices, clip counts and the redistribution clause came from snippets and resellers. Collection bundle shown as sold out.
- **ActorCore store and license pages** (render client-side, came back empty): no current prices, clip counts or full EULA text.
- **Rokoko:** no current per-clip price list, category list or full license text.
- **Explosive Fighter Pack Bundle and Kubold FAP:** clip lists (Asset Store descriptions didn't render). Kubold's 230+ count is from a Fab snippet.
- **Frank Climax Fighting Set:** UE/Fab page 403; the 217-motion category total is from a search snippet.
- **GDH license terms** (none stated on itch), and the Fab price of the Unarmed bundle.
- **Kevin Iglesias Mega pack:** contents list.
- **Prices of:** Car Interaction Animset, Tactical Car Driving, CGTrader golf, basketball and snowboard packs; Extreme Fighter Bundle; MoCap Online Rifle and Mobility packs.
- **Video-mocap tool pricing:** Move AI's pricing page 404'd and DeepMotion paid tiers were not on the page read, so all paid-tier prices are aggregator figures. Cascadeur pricing was not checked.
- **CMU terms:** quoted from memory (TLS error on fetch). **LaFAN1 license:** from mirrors, not Ubisoft's LICENSE file.
- **Truebones** and **Noitom Mocap.Market** license text: not found.
- **Ready Player Me availability:** I did not check during this session whether RPM is still operating after its reported 2025 acquisition and service wind-down. Verify before choosing it as the base character system.
