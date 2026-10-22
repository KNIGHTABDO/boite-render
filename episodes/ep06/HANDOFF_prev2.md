# Handoff — 2026-10-21
## Goal
Produce ep06 (Chapitre VI, « Le gilet cerise », source/boite.txt 1478–1818) on the WORKFLOW-V2 pipeline, then render + YouTube kit.
## Done
- Steps 1–4: plan.md, script.json, beats.json (137 beats, lint clean), cast.json, J0, Darija review, all TTS, timing.json (23.7 min), lipsync.json. Cat model art/models/cat.glb + `loadAnimal` in engine/rig3d.js.
- Step 5 DONE:
  - 7 new plates (ChatGPT) in art/plates/ep06/: msid_menage, msid_soupente, kissaria, kissaria_rev, rue_mosquee, rue_epices, rahma_pauvre. Prompts + camera spec in episodes/ep06/mk_plates.py.
  - 16 paintings in art/ep06/ (p01_ane … p09g_sourire), prompts/beats in art/ep06/prompts.json. 18.8 % of runtime (≤20 %). User OK'd 16.
  - J1 `jev.py paint` run on all 16: only p03_fontaine FAIL on "clean" (tiny background hands in a 25-kid crowd) — reviewed full size, accepted. All "?claude" items were Jev hedging on busy images; accepted.
  - episodes/ep06/cal.json: SEED h/fov/horizon for the 7 new plates (spec numbers, horizon read by eye). rue_mosquee did NOT follow spec: horizon ~58 % (627 px) → re-solve h with the 0.40 m bench when staging. kissaria ~40 %.
  - cast.json refs: si_othman → art/src/si_othman.png, salem → art/src/salem.png (both cropped from p09b), khadija → art/ep06/p09f_porte.png (she's only an arm at the door).
## State
- Reused plates: patio_matin→patio_balcons, ep05 galerie_jour→galerie, ep03 chambre_nuit_lampe/chambre_jour/fenetre_fatma/terrasse/escalier/impasse_jour/rue_foule, zaouia_cour.
- Known accepted flaws: Mohammed looks babyish in p05/p07 (dreams), p01 door a bit fancy.
- 1–2 ChatGPT tabs (p08_prince, p02b_chaux) may still be open in Brave outside the MCP group — close by hand, harmless.
## Next steps
1. Step 6: 3D scenes in episodes/ep06/scenes (follow ep05 pattern + HANDOFF_prev.md): `cover:` on every 3D shot (≤15 s per framing), `travel()` for entrances/exits, fallClip for s04 fall + s05 Driss bucket, s17 3D cat via loadAnimal (b096 Idle/Headbutt paws at mirror, b097 Run bolts). Verify each new plate's cal.json seed with a true-size prop in test/proto/plate.html (drop the "SEED" tag once checked).
2. Step 7: J3 `python3 tools/jev.py frame …` on sampled frames.
3. Step 8: mix, preview, Gate K, vast.ai render (see memory vast-render), YouTube kit. Then update memory episode-status.
## Key files
- episodes/ep06/{plan.md,beats.json,cast.json,cal.json,timing.json,lipsync.json} — episode data (edit mk_*.py generators, not JSON, except cal.json/cast.json)
- episodes/ep06/HANDOFF_prev.md — full step 5–8 rules from the prep session
- episodes/ep05/ — reference for scenes/, film.js, cal.json format
- WORKFLOW-V2.md — pipeline rules
- engine/rig3d.js — loadAnimal for the cat
## Gotchas
- beats.json is {episode,chapter,beats:[...]}; art/ep06/prompts.json has a "_note" key — skip keys starting with "_".
- jev.py reads stdin: in a `while read` loop use `read -u3 … 3<file` and `</dev/null`, or every second line gets eaten.
- ChatGPT pipeline (if more stills needed): helper lib in Brave localStorage.lib6 (eval after each navigation), refs in IndexedDB 'ep06'; pack() → real-click overlay at (600,300) → `python3 tools/unpack_imgpack.py <subdir> ~/Downloads/imgpack6_*.bin`. CDP JS timeout 45 s (keep waits ≤40 s); ChatGPT virtualizes images so fin() may falsely time out — screenshot then save().
- lint: `python3 tools/lint_beats.py episodes/ep06/beats.json`.
- 7.7 GB RAM: one heavy job at a time. Jev key only in ~/.typesafe. Ask before any Rodin credit spend.
