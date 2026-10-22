# ep06 scene-writing brief (shared by all scene agents)

Project: /home/knight/Desktop/projects/boite-a-merveilles (not a git repo; keep edits to YOUR scene files only).
Episode 6 « Le gilet cerise » (Chapitre VI of La Boîte à merveilles). A 3D-on-painted-plate cartoon: three.js Stage3D actors
(Rodin GLBs) staged metrically on a painted background plate, rendered headless at 1920x1080.

## Read first (in this order)
1. episodes/ep06/scenes/s04_badigeon.js: THE reference scene (shot/cover/build/fn pattern, PO poses, props in hands, travel).
2. episodes/ep06/scenes/_3d.js (shot, cover, role, all, breathe, blend), _pt.js (make, st, ac, MOVES), _props.js.
3. WORKFLOW-V2.md (rules R1-R6, §E staging) and episodes/ep06/plan.md (your scenes' rows).
4. episodes/ep06/beats.json: the beats for your scene ids (text, speaker, mode 3d/painting/insert, room, cast, props, visual, action).
5. episodes/ep06/timing.json: your scene's start/end and line timings (scene-local t = global - scene.start). Key events on line starts via L[i] like s04.
6. episodes/ep06/cast.json: role names -> models. ALWAYS get actors with role('<name>'). Never stand in one character for another.
7. episodes/ep05/scenes/*.js: ep05 scenes on the SAME reused plates (chambre, patio, galerie, terrasse, escalier, impasse, rue_foule...) — copy their plate names, cal handling, light and actor spots instead of re-solving.
8. HANDOFF.md (plate reuse map) and episodes/ep06/cal.json (+ episodes/ep05/cal.json for reused plates).

## Rules
- Painting beats: st('<painting id>', [line, frac], move) using art/ep06/pNN_*.png ids (see _pt.js MOVES). Insert beats likewise if an image exists, else 3D.
- Every 3D shot has `cover:` (W/M/CU on the speaker), no framing held >15 s, hard cuts. Speaker's face visible when talking.
  Check that the framing doesn't cut heads of standing people (use dy like s04 does).
- Entrances/exits with travel(); falls with the clips in engine/clips.js. Real contact: feet on floor, seated bodies on seats,
  props in palms (PO.reach + inHand). No floating, no sliced/intersecting bodies, correct scale (kids ~1.1-1.25 m, adults ~1.6-1.75 m).
- Unique cast: each named character uses its own model from cast.json; never two copies of the same model in one shot.
- Keep it simple and fast (speed over perfection): plain idle + look + a few key gestures per line beat beats elaborate choreography.
- Do NOT edit engine/, _3d.js, _pt.js, _props.js, cast.json, other scenes. Need a new prop? Define it inside your scene file
  (toon look like _props.js). Need a shared fix? Describe it in your report instead.
- Scene file = episodes/ep06/scenes/<scene id>.js, `export default make({...})` like s04.

## Checking (the user's PC is slow: NEVER run a full or video render)
- Syntax: cp the file to /tmp/claude-1000/-home-knight-Desktop-projects-boite-a-merveilles/1902eab0-5f30-401d-91d6-337e6afa381f/scratchpad/c_<id>.mjs && node --check it (ESM).
- Visual: ONLY via the queued sheet script (one render at a time machine-wide, it waits on a lock; ~2-4 min incl. queue):
  bash /tmp/claude-1000/-home-knight-Desktop-projects-boite-a-merveilles/1902eab0-5f30-401d-91d6-337e6afa381f/scratchpad/sheetq.sh <scene start (global s)> <scene id> t1,t2,...
  (local times, 4-6 frames, pick frames that prove the key actions). Output: .../scratchpad/<scene id>_sheet.jpg — Read it and look hard.
  Run it with a 1500000 ms timeout. Console errors from your scene appear in its output: fix them.
- Budget: at most 2 sheet renders per scene (one check, one after fixes). If still broken, report it.

## Report back (short)
Per scene: file, sheet path, what's on screen per line block, known remaining issues. No code dumps.
