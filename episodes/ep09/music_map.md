# Ep09 music map (R10), 2026-11-27

Runtime 23.4 min (timing.json, 1403.154 s). Cue sheet: cuesheet.md (`python3 tools/cuesheet.py episodes/ep09 --strict`, 0 gaps / 0 unknown). Mixer: tools/audio/mix_ep09.py.
Rule (as ep07): score music only in a few places; everything else is diegetic sound, Foley or silence. No new Lyria cue was generated: ep09 reuses the ep06 box theme and ep07 cues. The one swell is the coffin (the box's last colour, then a hard cut). s06_ruine stays unscored (the slap, the struggle, the lost capital). s09_depart stays on birds, receding steps, the door and the sob.

## A. Score (all reused, audio/music/ep07/*.wav)
| # | Where | t (s) | Use | Out |
|---|---|---|---|---|
| T0 | s02_titre | 21.595-30.595 | ep06 rosette box theme under the title card. | Fade 1 s at the scene end |
| M2 | s14_cercueil b089 -> b090 | 825.66-834.38 | The last look into the box: the one swell of the episode (oud + qanun colour, ducked under speech, lifts in the pauses), under "Je jetai un coup d'œil dans ma Boîte à Merveilles." | **Hard cut** at b090 ("Ce n'était plus une boîte à merveilles, mais un cercueil"), then the empty-room drone at b091 |
| M3 | s22_fiche | 1332.123-1372.123 | Soft study bed under the Fiche de révision (M3_fiche.wav is 40 s; the scene runs to 1395.154). | 3 s fade |
| E0 | s23_endcard | 1395.154-1403.154 | Box-theme reprise on the end card. | 2.5 s fade |

## B. Subjective drone (M1_drone loop, sound design on the bed, -28 dB under the voice, 7.4 s max)
b048 (s08_solitude, 414.07-421.47, the parents become nightmare shapes), b091 (s14_cercueil, 849.44-856.84, the empty room after the coffin), b096 (s15_orage_flute, 909.69-917.09, the djinn flute), b099 (s16_deux_mondes, 946.23-953.63, sparrows fading into the two worlds) and b101 (s16_deux_mondes, 971.14-978.54, the night paths with the parents and the fqih).

## C. Synthetic sound design (no CC0 sample exists)
Heartbeat (b006 soft, b014), tinnitus (b006): generated in mix_ep09.py, on the bed bus (ducked -6 dB under speech).

## D. Hard silences (score + beds at zero, 15 ms/100 ms fades; breaths and hits remain)
- s08_solitude start (402.179 s) until the low drone at b048 (414.07 s): after the decision to leave, the room goes dead ("Un grand silence s'établit… J'étouffais"); only then the nightmare drone.
- s20_aicha_misere b128 (1220.1 s, "empty silence") until the kitten at b129 (1232.46 s): the stripped room, no clock, no cretonne.

## E. Instruments as score
None. The Foley is diegetic only (the cheek slap = bendir_hit, the sickle = cloth rustle, bracelet clinks = metal_clinks). The daydream shimmer (b062) and the mother's hum (b093, women_songs_far) are not scored.

## F. Speech-first mix rules (user, 2026-11-04: "no noisy voices or music surpassing speeches")
Hard gates, identical to ep07 (see episodes/ep07/music_map.md §F; implemented in tools/audio/mix_ep09.py):
1. Speech always wins: the music + Foley bed is >= 12 dB under the voice in LUFS-S (400 ms windows) wherever a voice line plays.
2. Ducking: score -12 dB, Foley beds -6 dB (attack 150 ms, release 600 ms). Single hits are not ducked but are placed between words.
3. Speech-band carve: -4 dB at 1-4 kHz on music and beds while a voice plays.
4. Clean voices: noise-floor / click / clipping check on every take; no reverb on narration.
5. Music levels: music alone ~ -20 LUFS-S, never louder than the loudest narrator line; master -16 LUFS, <= -1.5 dBTP.
6. Lossy sources: HP 60 Hz / LP 14 kHz before mixing.
7. Check: per-line margin table in mix_report.md; then a Gemini listening pass (F7) with timestamps.
