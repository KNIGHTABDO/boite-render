# HANDOFF: ep06 (Chapitre VI), 2026-10-21

## State
- ep01–ep05 are **published** on YouTube. ep05 is closed: don't patch it.
- Ep06 = **Chapitre VI**, `source/boite.txt` lines 1478–1818. It covers:
  - The Msid cleaned and whitewashed before Achoura. A crowd of kids with whitewash buckets and doum brooms. Mohammed grabs a broom and is mobbed.
  - Then the home part: ma mère (19 mentions), Rahma (14), **Si Othman** (13), Lalla Khadija, Lalla Kanza, Lalla Aicha, Zineb, Fatma, Lalla Mira, Driss, and the **cat** (5 mentions).
- The master plan is `WORKFLOW-V2.md`. Read §1 (engine), §2 (pipeline), §2b (Jev) and the "Status 2026-10-21" section at the end.
- The engine work for the new pipeline is done (see the next section). Ep06 is the first episode made with it.

## New tools (all tested)
| Tool | What it does |
|---|---|
| `tools/new_episode.sh ep06` | Creates `episodes/ep06/` from the ep05 runtime (film.html/js, lib, `_3d.js`, `_pt.js`) plus the template `beats.example.json` / `cast.example.json`. |
| `tools/lint_beats.py episodes/ep06/beats.json --cast episodes/ep06/cast.json` | Beat-sheet lint. The schema is in its docstring. Fix every ERROR before staging. Writes `beats.lint.json`. |
| `tools/dash.html` | `node tools/serve.mjs` → `http://localhost:8123/tools/dash.html?ep=ep06`. Timeline by mode, lint, cast, Jev rows, `frames/<beat>.jpg`. Reloads every 5 s. |
| `tools/jev.py` | TypeSafe Jev checker. Modes: `beats` (J0 text), `paint` (J1), `frame` (J3). Key is in `~/.typesafe` only, never in the repo. Exit code 0 = pass, 1 = FAIL, 2 = uncertain (look yourself). About 1.3k input tokens per frame. |
| `tools/qa_prompt.md` | Gate K: whole-episode Gemini audit in AI Studio (Agentic mode). Save the answer as `episodes/ep06/qa_gemini.txt`. |
| `shot({ cover: [...] })` in `_3d.js` | E2 auto coverage: `cover: [{t, size:'W'|'M'|'CU', on:'<actor name>', dx, dy}]`. Each entry is a hard cut to a framing on that actor's head. `view()` wins if it returns something. `S.draw` renders zoomed crops at full resolution, so close-ups are sharp. Verified on ep05 s13 (`?cover`). |
| `engine/clips.js` | E3: `runPose`, `travel(a, [[x,z],...], t, {t0, speed, gait:'walk'|'run', exit})` (foot-locked travel along a path, real exits instead of pops), `fallClip(a)` built in `build()`, then `.at(k)` (stand → stumble → knees → lying). Pilot: ep05 s13 `?clips` / `?fall` (verified; the fall's final pose props on straight arms, and the legs land where he stood, so leave room). |
| `skirt()` / `robeColor()` in `_3d.js` | A seated drape in the actor's own robe colour (no white eggs). |
| Hard cuts | `film.js` fades only when a scene module sets `fadeIn` / `fadeOut`. `_pt.js` segments hard-cut unless `dissolve: true`. Painting re-framing splits are gone. |

## Ep06 order (WORKFLOW-V2 §2)
1. `tools/new_episode.sh ep06`, then read Chapitre VI and write `plan.md` (scenes) + `script.json` the same way as ep05. Darija + French, same narrator.
2. **beats.json**: one beat per line, with mode / size / room / cast / props / action / peak. Then run `lint_beats.py` until clean, and `jev.py beats` (J0).
3. **cast.json**: every named character gets its **own model** (lint enforces this). Extras must vary at least 2 of cap/robe/scale.
   - Existing models: abdallah, aicha, aicha_haik, chouafa, driss, father, fatma, fqih, guerrab, man1, mohammed, mohammed_gris, moqadma, rahma, woman1, woman2, zineb, zoubida, zoubida_haik.
   - **Missing for ep06:** Si Othman (the father's friend? check the text), Lalla Khadija, Lalla Kanza, Lalla Mira (or map them onto woman1/woman2 if each appears in a separate shot and looks distinct), and the **cat**.
   - **Rodin costs credits: ask the user before any `rodin_generate`** (list the exact models and the cost first). For the Msid kids, use the extras mohammed_gris + man1 scaled down, with varied caps and robes.
4. **Darija review** in AI Studio (Gemini 3.8 Flash, see memory "workflow-boite"), then TTS in AI Studio. Ear-check the voices, then voices.py + lipsync.py.
5. Plates (ChatGPT). New sets: the Msid interior during the cleaning (soupente, jarres, nattes) and whatever the home part needs. Check each plate with `jev.py paint`. Calibrate (cal.json) before staging.
6. Scenes: 3D first. Paintings only for dream / flashback / crowd / macro (≤20%). Use `cover:` on every 3D shot (≤15 s per framing), `travel()` for every entrance or exit, and `fallClip` / run for actions.
7. Gate J3: render 2 fps low-res per scene and run `jev.py frame --say ... --speaker ...`. FAIL → fix; uncertain → look yourself; at most 3 loops per scene.
8. Audio mix, then a preview mp4, then Gate K (Gemini, `qa_prompt.md`), then fixes, then the vast.ai render (memory "vast-render"), then the YouTube kit.

## Known engine issues (work around them, don't sink time)
- **Far-arm webbing** ("black wedge or wing" under the arm on robed actors). It comes from the 2D capsule skinning (z is ignored). Staging rule: raise the **camera-side** arm and keep the far arm below about 60°. Jev `intact` catches it (0.11–0.14 on bad frames).
- The cross-legged `skirt()` drape is round. Feet or the robe can poke through at the front. Hide it behind a prop (tray, low table, blanket) when the shot is close.
- The `'objectNormal' undeclared` ink-shader warning is harmless.
- Jev's `distinct` question is soft (0.64–0.79 even on clones). Trust lint + cast.json for identity, not Jev.
- Machine: 7.7 GB RAM. One render at a time (`free -h` first).

## Not done (later, optional)
- **E1 projected sets (2.5D parallax)**: not piloted. With E2 coverage and sharp crops, close-ups work from one plate, so E1 is only needed if a shot must dolly. A reverse-angle plate per dialogue set is the cheap substitute.
- Retargeted mocap clips (the procedural clips.js is the fallback that shipped). 3D cat: no model; needs Rodin (ask) or a free Sketchfab/Poly Pizza model via Blender MCP.
- Foley library + ambience beds (J).

## How to work
- Server: `node tools/serve.mjs` (port 8123). Render frames: `node tools/shot.mjs "episodes/ep06/film.html?query" out.jpg t1,t2` (global seconds).
- In the browser: `await reloadScene('sXX')`, `await drawAt(t)`.
- Speed over perfection: one solve per scene, key numbers in `st.M`, one sheet per scene.
