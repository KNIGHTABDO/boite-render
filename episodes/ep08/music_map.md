# Ep08 music map (R10), 2026-11-14

Runtime 20.9 min (timing.json). Cue sheet: cuesheet.md (`python3 tools/cuesheet.py episodes/ep08 --strict`, 0 gaps / 0 unknown). Mixer: tools/audio/mix_ep08.py.
Rule (as ep07): score music only in a few places; everything else is diegetic sound, Foley or silence. No new Lyria cue was generated: ep08 reuses the ep06 box theme and ep07 cues.

## A. Score (all reused, audio/music/ep07/*.wav)
| # | Where | t (s) | Use | Out |
|---|---|---|---|---|
| T0 | s02_titre | 17.0-26.3 | ep06 rosette box theme under the title card. | Fade 1 s at the scene end |
| M2 | s18_cauchemar b129 -> b131 | ~977-993 | The dream box opens: the one "reward" swell of the episode (oud + qanun colour, ducked under speech, lifts in the pauses). | **Hard cut** at b131 ("Les beaux bijoux portent toujours malheur"), cold wind + detuned chime take over |
| M3 | s22_fiche | 1195.3-1235 | Soft study bed under the Fiche de révision. | 3 s fade |
| E0 | s23_endcard | 1246.3-1254.4 | Box-theme reprise on the end card. | 2.5 s fade |

## B. Subjective drone (M1_drone loop, sound design on the bed, -28 dB under the voice, 7.4 s max)
b108 (s16, the monstrous shapes in the dark house) and b123 (s18, the nightmare begins).

## C. Synthetic sound design (no CC0 sample exists)
Heartbeat (b026 soft, b078 soft, b124, b153, b155 giant drum), fly buzz (s03, 5 cues), tinnitus (b153): generated in mix_ep08.py, on the bed bus (ducked -6 dB under speech).

## D. Hard silences (score + beds at zero, 15 ms/100 ms fades; breaths and hits remain)
- s16_noir start (768 s) until "night far" at b107 (~814 s): the souk's din ends, the house is silent, only the mother's sobs.
- s21_fievre start (1155 s) until the first heartbeat (b153, ~1167 s): the fever room before the pulse starts.

## E. Instruments as score
None. The Foley is diegetic only (souk hammers = leather_tap, dellal calls = a street-vendor cry).

## F. Speech-first mix rules (user, 2026-11-04: "no noisy voices or music surpassing speeches")
Hard gates, identical to ep07 (see episodes/ep07/music_map.md §F; implemented in tools/audio/mix_ep08.py):
1. Speech always wins: the music + Foley bed is >= 12 dB under the voice in LUFS-S (400 ms windows) wherever a voice line plays.
2. Ducking: score -12 dB, Foley beds -6 dB (attack 150 ms, release 600 ms). Single hits are not ducked but are placed between words.
3. Speech-band carve: -4 dB at 1-4 kHz on music and beds while a voice plays.
4. Clean voices: noise-floor / click / clipping check on every take; no reverb on narration.
5. Music levels: music alone ~ -20 LUFS-S, never louder than the loudest narrator line; master -16 LUFS, <= -1.5 dBTP.
6. Lossy sources: HP 60 Hz / LP 14 kHz before mixing.
7. Check: per-line margin table in mix_report.md; then a Gemini listening pass (F7) with timestamps.
