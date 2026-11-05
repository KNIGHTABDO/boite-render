# Ep07 music map (R10), 2026-11-04 — **v2 update 2026-11-05**

**v2 (redo, 24.97 min):** the cold open s01_cold is gone. The episode now opens on a calm hook (s01_hook: city of tambourines, the promise of the night) under room tone, pigeons and far tambourines, then the **ep06 rosette logo intro s02_titre with its box-theme music (T0_titre, rendered from tools/audio/score_ep06.py s02)**. M1's opening drone at t=0 is dropped; the subjective razor drone (section B) stays at s16. Every other cue keeps its v1 *line* anchor: `mix_ep07.V2()` maps the v1 times below to the same narrated line in the v2 timeline (e.g. M2 596 → 1074.9 s, C1 120.1 → 204.8 s, M3 785 → 1447.7 s). The times in the tables below are v1 times.

Rule: score music only in 3 places. Everything else is diegetic sound, Foley, or silence.
Times come from timing.json (runtime 13.86 min). The cue sheet (all sound) is cuesheet.md, built by `python3 tools/cuesheet.py episodes/ep07`.

## A. Score (3 cues, from Lyria 3.5 in AI Studio)
| # | Where | t (s) | Brief | Out |
|---|---|---|---|---|
| M1 | s01_cold b001 | 0.0–7.4 | One low drone rising under the razor's *shhk*. No melody. It cuts to **hard silence** at "la peur" / the blade touches (b002, 7.4 s). | Hard cut |
| M2 | s22_feerie b081→b085 | 596–634 | **First real music of the episode** (plan: "music is a reward"). The façade reveal swells (oud + qanun + soft bendir, Fès andalou colour). At b082 it hands over to the pupils' sung chant (C2), and at b085 it ducks so the flames "psalmodient". | Crossfade into C2 |
| M3 | s27_fiche | 785–824 | Soft, calm study bed under the Fiche de révision, low enough for screenshots and reading. It reuses M2's motif as a callback. | Fade to the end card |

**Files (2026-11-04):** audio/music/ep07/{M1_drone,M2_facade,M3_fiche,C1_cantique,C2_chant,C3_women_far}.wav, trims and audit notes in audio/music/ep07/cues.json. M3 does not share M2's motif (separate Lyria takes), so the callback is by instruments only. C1 and C2 do share the 'ya lalli' melody.

## B. Subjective drone motif (sound design, not score)
One sine/organ-like low tone, no melody: the child's fear of the razor. It sits at −28 dB under the voice and is always tied to the razor.
| t (s) | Beat | Use |
|---|---|---|
| 175.6 | b026 s08_menthe | under the demons-dream painting, with incense_crackle |
| 249.7 | b036 s10_plans | "le coiffeur" dread, with razor_strop x3 |
| 443.1 | b060 s16_rasoir | the barber's voice melts into the drone as he falls asleep, then **SILENCE** at b061 (450.2) |
| 524.7 | b072 s19_bain | drone tail, fades within 3 s |

## C. Diegetic singing (real voices, not TTS)
| ID | t (s) | Beat | Source plan |
|---|---|---|---|
| C1 cantique | 120.1 | b017 s06_lustres | Boys' Msid cantique at dusk, "Ah ya lalli" style refrain, room reverb, the fqih's prayer murmur on top. Lyria vocal boys' chant (test a sung TTS take first, plan §117). |
| C2 pupils' chant | 596–634 | b081–b085 | Same melody as C1, many voices, bigger. Far, then clear (b081); full (b082); ducks (b085). The Msid light flicker follows this chant's envelope (plan §26). |
| C3 women's songs far | 746.0 | b103 s25_aicha | Distant women singing from rooftops at dusk, lowpass, dist .8. Lyria or a CC0 field recording. |

## D. Hard silences (no beds at all)
7.4 s (b002) · 215.9 s (b033, the muezzin he can't hear) · 450.2 s (b061) · 720.9 s (b100, "Ils sont… Ils sont…").

## E. Instruments as score (diegetic, from audio/foley)
Tambourines, bendir, darbouka and toy trumpets carry the rhythm from s03 to s18 and in s26. They are never doubled by score music.

## F. Speech-first mix rules (user, 2026-11-04: "no noisy voices or music surpassing speeches")
These are hard gates. The mix fails if any one fails.
1. **Speech always wins.** Wherever a voice line plays, the music + Foley bed is at least **12 dB under the voice** in short-term loudness (400 ms windows, LUFS-S). Diegetic singing (C1/C2/C3) counts as a bed whenever someone speaks over it.
2. **Ducking:** score and singing duck −12 dB under speech (attack 150 ms, release 600 ms). Foley beds (crowds, walla, wind) duck −6 dB. Single hits (razor, drum hit, splash) are not ducked, but are placed between words, never on a word.
3. **Speech-band carve:** while a voice plays, music and crowd beds get a −4 dB dynamic dip at 1–4 kHz, so they don't mask consonants.
4. **Clean voices:** every voice take gets a noise-floor check (gaps between words below −60 dBFS) and a check for clicks and clipping. Any take with hiss, breaths or room tone gets denoised or regenerated. No reverb on narration. Character reverb only where the plan asks for distance (off-screen calls, s09 wall), and kept dry enough to stay intelligible.
5. **Music levels:** music alone (no speech) sits at about −20 LUFS-S, so the "music is a reward" moments (M2 reveal, C2) can swell, but they never get louder than the loudest narrator line (−16 LUFS integrated target).
6. **Lossy sources:** Freesound MP3 previews and Lyria MP3s get a highpass at 60 Hz and a lowpass at 14 kHz before mixing (this removes MP3 swirl and rumble).
7. **Check:** the mix script prints a per-line table: voice LUFS-S, bed LUFS-S, margin. Every line must show a margin of 12 dB or more. Then a Gemini listening pass on the final mix asks one question: "is any word hard to understand because of music or effects?" with timestamps.
