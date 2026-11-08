# Animation packs

Drop extra animation GLBs here and list them in `assets/characters/manifest.json`
under `animationPacks`, for example:

```json
"animationPacks": [
  { "name": "UAL 1", "file": "assets/animations/ual1.glb", "prefix": "UAL_" }
]
```

Clips must be authored on the Quaternius 62-bone `CharacterArmature` skeleton
(the one shared by all 21 characters). Quaternius Universal Animation Library
clips and Kevin Iglesias clips are retargeted onto that skeleton once in Blender
and exported as a GLB with animations only (no mesh needed). Every clip in every
pack then becomes playable on every character automatically.
