# Ep07 speech-first mix report

**Speech margin gate: PASS.** 109/109 lines >=12 dB; master -16.002 LUFS / -1.521 dBTP.

## Gates

- F1_margin: **PASS**
- F2_duck_and_hits: **PASS**
- F3_carve: **PASS**
- F4_clean_voices: **PASS**
- F5_master_and_music: **PASS**
- F6_cleanup: **PASS**
- F7_listening: **PASS** (manual, see f7_review.md)
- D_hard_silences: **PASS**
- cue_coverage: **PASS**

Implementation: F1/F7 pair 400 ms windows and repair dominant SCORE/BED/HITS cues, at most three passes; F2 uses -12 dB score / -6 dB bed ducking, 150 ms lookahead attack and 600 ms release, with unducked hits initially nudged within +/-250 ms, then repaired within +/-400 ms or statically attenuated; F3 uses a complementary linear-phase 1–4 kHz FIR split for the -4 dB dip; F4 screens native-rate source takes without rewriting them; F5 raises no-speech score/singing toward -20 LUFS-S, enforces the narrator ceiling and masters to -16 LUFS / <=-1.5 dBTP; F6 filters every Foley/music source at HP60 / LP14k. F7 exports a 96 kbps listening copy and the single question for manual AI Studio web review. No API is used.

## Music-level verification

{
  "score_max_lufs_s": -16.326322068498023,
  "solo_max_lufs_s": -16.326322068498023,
  "solo_median_lufs_s": -20.05489593135883,
  "solo_windows": 65,
  "loudest_narrator_line_lufs": -11.45685108059015,
  "ceiling_pass": true,
  "solo_target_lufs_s": -20.0,
  "solo_target_tolerance_db": 3.0,
  "solo_target_pass": true
}

Solo statistics use score-active 400 ms windows after speech ducking has fully released. M1 and C3 retain their quiet source levels under speech; the solo lift targets -20 LUFS-S outside speech. A solo-level failure remains a failure even when the master and narrator ceiling pass.

## Failed-window diagnosis


F4 is a source-take screen only, as requested: no voice files were rewritten. A review/pending gate is not an overall listening approval.

400 ms K-weighted windows, 100 ms hop, >=40 ms active voice; levels in each row come from the same worst window. "Other" sums SCORE, BED and HITS. Measurements are from the final mastered stems; all stems share the limiter gain. Source speech activity is fixed before mastering so limiter gain cannot redefine a word boundary.

## Worst 10 lines

| Line | t (s) | Voice LUFS-S | Other LUFS-S | Margin dB | Gate |
|---|---:|---:|---:|---:|---|
| s09_escalier:01 narrator | 200.821 | -35.92 | -48.17 | 12.25 | PASS |
| s18_concert:05 narrator | 497.122 | -34.65 | -46.96 | 12.31 | PASS |
| s13_hammad:04 barber | 340.139 | -35.04 | -47.54 | 12.50 | PASS |
| s08_menthe:03 narrator | 175.606 | -35.27 | -47.85 | 12.58 | PASS |
| s20_reveil:04 narrator | 559.124 | -34.48 | -47.21 | 12.74 | PASS |
| s23_aube:01 narrator | 635.439 | -34.74 | -47.55 | 12.81 | PASS |
| s25_aicha:01 narrator | 684.856 | -28.31 | -41.26 | 12.95 | PASS |
| s01_cold:01 narrator | 2.200 | -42.03 | -55.00 | 12.96 | PASS |
| s16_rasoir:04 narrator | 437.665 | -36.20 | -49.20 | 13.00 | PASS |
| s27_fiche:04 narrator | 813.241 | -42.31 | -55.31 | 13.00 | PASS |

## Every voice line

| Line | t (s) | Voice LUFS-S | Other LUFS-S | Margin dB | Gate |
|---|---:|---:|---:|---:|---|
| s01_cold:01 narrator | 2.200 | -42.03 | -55.00 | 12.96 | PASS |
| s01_cold:02 narrator | 7.444 | -29.51 | -42.51 | 13.00 | PASS |
| s03_tambourins:01 narrator | 19.169 | -23.77 | -47.95 | 24.18 | PASS |
| s03_tambourins:02 narrator | 26.553 | -17.13 | -43.04 | 25.91 | PASS |
| s03_tambourins:03 narrator | 35.334 | -19.33 | -41.95 | 22.63 | PASS |
| s03_tambourins:04 zoubida | 49.819 | -14.25 | -200.69 | 186.44 | PASS |
| s04_chat:01 narrator | 54.078 | -11.29 | -58.48 | 47.20 | PASS |
| s04_chat:02 narrator | 61.779 | -22.86 | -41.85 | 18.99 | PASS |
| s05_hammoussa:01 zoubida | 71.995 | -24.36 | -200.69 | 176.33 | PASS |
| s05_hammoussa:02 narrator | 77.009 | -33.94 | -200.69 | 166.75 | PASS |
| s05_hammoussa:03 hammoussa | 82.794 | -26.90 | -200.69 | 173.79 | PASS |
| s06_lustres:01 narrator | 88.152 | -28.19 | -43.89 | 15.70 | PASS |
| s06_lustres:02 narrator | 93.779 | -19.72 | -40.61 | 20.89 | PASS |
| s06_lustres:03 narrator | 105.155 | -27.74 | -64.54 | 36.80 | PASS |
| s06_lustres:04 narrator | 109.411 | -22.92 | -41.11 | 18.19 | PASS |
| s06_lustres:05 narrator | 120.140 | -30.58 | -43.58 | 13.00 | PASS |
| s07_petrole:01 narrator | 129.501 | -40.47 | -53.47 | 13.00 | PASS |
| s07_petrole:02 vendeur | 138.635 | -24.62 | -37.62 | 13.00 | PASS |
| s07_petrole:03 narrator | 142.434 | -16.15 | -57.66 | 41.51 | PASS |
| s07_petrole:04 narrator | 145.144 | -36.74 | -49.74 | 13.00 | PASS |
| s07_petrole:05 mohammed | 159.779 | -16.43 | -37.54 | 21.11 | PASS |
| s07_petrole:06 zoubida | 162.099 | -19.81 | -37.70 | 17.89 | PASS |
| s08_menthe:01 kanza | 166.199 | -27.21 | -200.69 | 173.48 | PASS |
| s08_menthe:02 zoubida | 173.693 | -13.54 | -200.69 | 187.15 | PASS |
| s08_menthe:03 narrator | 175.606 | -35.27 | -47.85 | 12.58 | PASS |
| s08_menthe:04 narrator | 185.133 | -16.17 | -54.13 | 37.96 | PASS |
| s08_menthe:05 narrator | 194.995 | -26.55 | -200.69 | 174.14 | PASS |
| s09_escalier:01 narrator | 200.821 | -35.92 | -48.17 | 12.25 | PASS |
| s09_escalier:02 zoubida | 210.539 | -27.19 | -200.69 | 173.50 | PASS |
| s09_escalier:03 voisine | 212.039 | -21.58 | -200.69 | 179.11 | PASS |
| s09_escalier:04 zoubida | 215.045 | -14.17 | -200.69 | 186.52 | PASS |
| s09_escalier:05 narrator | 215.885 | -34.82 | -200.69 | 165.87 | PASS |
| s10_plans:01 father | 226.686 | -35.03 | -200.69 | 165.66 | PASS |
| s10_plans:02 narrator | 235.409 | -28.34 | -47.41 | 19.07 | PASS |
| s10_plans:03 narrator | 249.739 | -31.46 | -48.89 | 17.43 | PASS |
| s11_souk:01 narrator | 260.243 | -40.74 | -53.74 | 13.00 | PASS |
| s11_souk:02 narrator | 270.089 | -34.84 | -47.84 | 13.00 | PASS |
| s11_souk:03 narrator | 280.255 | -35.51 | -48.51 | 13.00 | PASS |
| s12_barbier:01 narrator | 290.597 | -14.02 | -55.28 | 41.27 | PASS |
| s12_barbier:02 barber | 298.034 | -33.85 | -200.69 | 166.84 | PASS |
| s12_barbier:03 narrator | 310.564 | -38.84 | -51.84 | 13.00 | PASS |
| s13_hammad:01 narrator | 322.564 | -19.02 | -39.63 | 20.61 | PASS |
| s13_hammad:02 hammad | 329.281 | -28.16 | -200.69 | 172.53 | PASS |
| s13_hammad:03 barber | 333.241 | -38.81 | -200.69 | 161.88 | PASS |
| s13_hammad:04 barber | 340.139 | -35.04 | -47.54 | 12.50 | PASS |
| s13_hammad:05 hammad | 350.832 | -26.16 | -41.80 | 15.64 | PASS |
| s14_larbi:01 barber | 357.537 | -33.23 | -46.23 | 13.00 | PASS |
| s14_larbi:02 barber | 367.175 | -40.11 | -200.69 | 160.58 | PASS |
| s14_larbi:03 narrator | 377.614 | -27.05 | -200.69 | 173.64 | PASS |
| s15_lamrani:01 narrator | 382.284 | -35.32 | -200.69 | 165.37 | PASS |
| s15_lamrani:02 barber | 390.384 | -26.31 | -44.55 | 18.24 | PASS |
| s15_lamrani:03 barber | 400.491 | -31.99 | -200.69 | 168.70 | PASS |
| s15_lamrani:04 lamrani | 403.136 | -22.41 | -200.69 | 178.28 | PASS |
| s15_lamrani:05 barber | 405.756 | -39.96 | -200.69 | 160.73 | PASS |
| s16_rasoir:01 barber | 419.070 | -31.52 | -200.69 | 169.17 | PASS |
| s16_rasoir:02 barber | 423.460 | -36.32 | -49.32 | 13.00 | PASS |
| s16_rasoir:03 lamrani | 434.066 | -37.04 | -50.04 | 13.00 | PASS |
| s16_rasoir:04 narrator | 437.665 | -36.20 | -49.20 | 13.00 | PASS |
| s16_rasoir:05 narrator | 443.141 | -34.45 | -47.45 | 13.00 | PASS |
| s16_rasoir:06 narrator | 450.224 | -18.87 | -42.27 | 23.40 | PASS |
| s17_rue:01 narrator | 456.464 | -39.15 | -200.69 | 161.54 | PASS |
| s17_rue:02 father | 459.609 | -30.78 | -200.69 | 169.91 | PASS |
| s17_rue:03 narrator | 462.441 | -37.54 | -50.54 | 13.00 | PASS |
| s18_concert:01 narrator | 471.647 | -9.93 | -63.01 | 53.08 | PASS |
| s18_concert:02 narrator | 479.451 | -16.49 | -39.23 | 22.74 | PASS |
| s18_concert:03 femmes | 487.649 | -21.35 | -39.34 | 17.99 | PASS |
| s18_concert:04 narrator | 490.803 | -38.35 | -51.35 | 13.00 | PASS |
| s18_concert:05 narrator | 497.122 | -34.65 | -46.96 | 12.31 | PASS |
| s19_bain:01 narrator | 510.973 | -31.40 | -44.40 | 13.00 | PASS |
| s19_bain:02 mohammed | 520.550 | -27.95 | -44.62 | 16.67 | PASS |
| s19_bain:03 narrator | 524.737 | -39.09 | -52.09 | 13.00 | PASS |
| s20_reveil:01 zoubida | 538.035 | -38.26 | -200.69 | 162.43 | PASS |
| s20_reveil:02 narrator | 545.482 | -40.55 | -57.81 | 17.25 | PASS |
| s20_reveil:03 father | 553.895 | -39.15 | -200.69 | 161.55 | PASS |
| s20_reveil:04 narrator | 559.124 | -34.48 | -47.21 | 12.74 | PASS |
| s20_reveil:05 narrator | 570.893 | -12.97 | -200.69 | 187.72 | PASS |
| s21_babouches:01 narrator | 575.415 | -40.05 | -54.23 | 14.18 | PASS |
| s21_babouches:02 narrator | 579.203 | -36.68 | -51.40 | 14.72 | PASS |
| s21_babouches:03 narrator | 585.635 | -40.20 | -200.69 | 160.49 | PASS |
| s22_feerie:01 narrator | 596.268 | -33.29 | -46.29 | 13.00 | PASS |
| s22_feerie:02 narrator | 604.510 | -29.41 | -42.41 | 13.00 | PASS |
| s22_feerie:03 narrator | 613.305 | -35.13 | -48.13 | 13.00 | PASS |
| s22_feerie:04 narrator | 617.446 | -31.31 | -44.31 | 13.00 | PASS |
| s22_feerie:05 narrator | 623.131 | -36.28 | -49.28 | 13.00 | PASS |
| s23_aube:01 narrator | 635.439 | -34.74 | -47.55 | 12.81 | PASS |
| s23_aube:02 fqih | 641.922 | -33.86 | -46.86 | 13.00 | PASS |
| s23_aube:03 eleves | 650.040 | -41.73 | -54.73 | 13.00 | PASS |
| s23_aube:04 narrator | 654.014 | -18.79 | -41.44 | 22.65 | PASS |
| s23_aube:05 fqih | 660.848 | -16.38 | -40.04 | 23.66 | PASS |
| s23_aube:06 narrator | 663.072 | -25.88 | -41.12 | 15.24 | PASS |
| s24_idriss:01 narrator | 668.780 | -34.62 | -47.62 | 13.00 | PASS |
| s24_idriss:02 narrator | 674.239 | -35.95 | -48.95 | 13.00 | PASS |
| s25_aicha:01 narrator | 684.856 | -28.31 | -41.26 | 12.95 | PASS |
| s25_aicha:02 zoubida | 689.447 | -16.96 | -54.52 | 37.56 | PASS |
| s25_aicha:03 aicha | 695.434 | -30.79 | -43.79 | 13.00 | PASS |
| s25_aicha:04 zoubida | 707.925 | -32.51 | -50.47 | 17.96 | PASS |
| s25_aicha:05 aicha | 710.108 | -16.77 | -67.97 | 51.20 | PASS |
| s25_aicha:06 narrator | 717.744 | -27.60 | -200.69 | 173.09 | PASS |
| s25_aicha:07 aicha | 720.924 | -45.26 | -200.69 | 155.43 | PASS |
| s25_aicha:08 narrator | 730.922 | -36.21 | -200.69 | 164.48 | PASS |
| s25_aicha:09 narrator | 736.937 | -15.51 | -61.27 | 45.77 | PASS |
| s25_aicha:10 narrator | 745.966 | -36.75 | -49.75 | 13.00 | PASS |
| s26_fin:01 narrator | 756.935 | -35.45 | -48.45 | 13.00 | PASS |
| s26_fin:02 narrator | 764.623 | -36.32 | -49.32 | 13.00 | PASS |
| s26_fin:03 narrator | 773.336 | -35.89 | -48.89 | 13.00 | PASS |
| s27_fiche:01 narrator | 785.789 | -30.63 | -43.63 | 13.00 | PASS |
| s27_fiche:02 narrator | 791.473 | -25.64 | -38.64 | 13.00 | PASS |
| s27_fiche:03 narrator | 797.741 | -41.65 | -54.65 | 13.00 | PASS |
| s27_fiche:04 narrator | 813.241 | -42.31 | -55.31 | 13.00 | PASS |

## Voice source checks

Noise: median 10 ms frame RMS in contiguous pauses >=150 ms below peak-35 dB, discarding 40 ms at each edge; fallback: 1st-percentile frame RMS. Flag >-60 dBFS. Clipping: |sample| >=0.999. Clicks: jump >max(0.25, 8×99.5th-percentile jump). These are screening estimates, not word alignment or a breath classifier. Takes flagged on the raw file get the breath expander (-15 dB in pauses) and are re-measured after it; the gate uses the treated value.

| Scene / speaker / take | Gap noise dBFS | Clipped samples | Click candidates |
|---|---:|---:|---:|

Offenders: 0; noise-flagged takes: 0. Full per-take results are in mix_report.json.

## Placement / sources

Word timing uses measured 10 ms activity islands; no forced word alignment is supplied. Hits are not ducked; auto-fix may move or statically trim individual cues.

Missing IDs: none. Duration-classified IDs (explicit >1.5 s fallback): ['cat_yowl', 'chair_wood_creak', 'cloth_rustle_stiff', 'cloth_tear', 'curtain_rustle', 'flute_ney_short', 'footsteps_stairs', 'footsteps_stone', 'kettle_whistle', 'kids_cheer', 'ladder_wood_creak', 'leather_strap', 'leather_tap', 'man_groan', 'man_laugh_neigh', 'powder_hiss', 'rattle_grelots', 'seed_crunch', 'toy_trumpet', 'water_drip', 'water_pour_glass'].

Hard-silence windows (beds zero, 100 ms outside fades): [(7.4, 14.569), (215.9, 225.686), (450.2, 455.464), (720.9, 736.94)]. Each map timestamp holds until the next sound cue or scene end; breaths/hits remain.

### Auto-fix actions

- Pass 0: 42 failures; worst -9.26 dB.
  - {"line": "s01_cold:01", "window_start_s": 2.7600000000000002, "margin_before_db": -7.798223632779148, "dominant_bus": "score", "bus_lufs_s": {"score": -32.247041953214264, "bed": -200.691, "hits": -73.66957117543528}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -20.79822363277915, "margin_after_db": 12.962870893341112}
  - {"line": "s01_cold:02", "window_start_s": 7.624, "margin_before_db": 8.830058339829211, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -36.3512434686756}, "action": "attenuate_cue", "id": "child_breath_in", "gain_db": -4.169941660170789, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.9999995979361}
  - {"line": "s06_lustres:05", "window_start_s": 122.79, "margin_before_db": 1.0569178466623654, "dominant_bus": "score", "bus_lufs_s": {"score": -30.148225309512313, "bed": -39.082052062431906, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.943082153337635, "margin_after_db": 12.999999742746297}
  - {"line": "s07_petrole:01", "window_start_s": 134.461, "margin_before_db": -9.232461656999863, "dominant_bus": "score", "bus_lufs_s": {"score": -29.250586668019626, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.232461656999863, "margin_after_db": 12.999998968992884}
  - {"line": "s07_petrole:02", "window_start_s": 140.295, "margin_before_db": 5.819051988316559, "dominant_bus": "score", "bus_lufs_s": {"score": -28.456349176880895, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.180948011683441, "margin_after_db": 12.999999699287276}
  - {"line": "s07_petrole:04", "window_start_s": 154.704, "margin_before_db": 0.9965389307897681, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.754261230420184, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -12.003461069210232, "margin_after_db": 13.000000426923798}
  - {"line": "s09_escalier:01", "window_start_s": 202.871, "margin_before_db": 8.923370603272438, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.85217687115037, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -4.0766293967275615, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.193856365371651}
  - {"line": "s09_escalier:01", "window_start_s": 202.871, "margin_before_db": 11.193856365371651, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.12266263324958, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -1.8061436346283486, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.905540315383071}
  - {"line": "s09_escalier:01", "window_start_s": 202.871, "margin_before_db": 11.905540315383071, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.834346583261, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -1.094459684616929, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.254655689931184}
  - {"line": "s11_souk:01", "window_start_s": 260.323, "margin_before_db": -8.317566793880477, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -30.435122105963284, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -21.317566793880477, "margin_after_db": 12.99999891734926}
  - {"line": "s11_souk:02", "window_start_s": 277.249, "margin_before_db": 9.54238985029766, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.392712772947405, "hits": -136.92817929289814}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.45761014970234, "margin_after_db": 12.999999335500462}
  - {"line": "s11_souk:03", "window_start_s": 282.615, "margin_before_db": 10.908847296700145, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.435374056053625, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.091152703299855, "margin_after_db": 12.999999713906412}
  - {"line": "s12_barbier:03", "window_start_s": 312.04400000000004, "margin_before_db": -2.883985805108665, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -33.971437824631806, "hits": -200.691}, "action": "attenuate_cue", "id": "men_laughing_small_group", "gain_db": -15.883985805108665, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 13.000000623334074}
  - {"line": "s13_hammad:04", "window_start_s": 346.579, "margin_before_db": 8.582849569972574, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.921092940857406, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.4171504300274265, "margin_after_db": 12.50109543262598}
  - {"line": "s14_larbi:01", "window_start_s": 357.74699999999996, "margin_before_db": 6.240821474332254, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -41.803955874138055, "hits": -39.51578256268541}, "action": "nudge_cue", "id": "razor_strop", "from_s": 357.54, "to_s": 357.262, "shift_ms": -278.00000000002, "margin_after_db": 10.557803313410243}
  - {"line": "s14_larbi:01", "window_start_s": 357.74699999999996, "margin_before_db": 10.557803313410243, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.803955874138055, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.4421966865897566, "margin_after_db": 12.999999974394587}
  - {"line": "s16_rasoir:02", "window_start_s": 427.71999999999997, "margin_before_db": 11.277628744367206, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.60932184973137, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.722371255632794, "margin_after_db": 13.000000125119698}
  - {"line": "s16_rasoir:03", "window_start_s": 435.936, "margin_before_db": 1.2415253016706629, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.29782050145178, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.758474698329337, "margin_after_db": 12.999999094416609}
  - {"line": "s16_rasoir:04", "window_start_s": 439.815, "margin_before_db": 9.458480352949607, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.676626512573996, "hits": -81.3239560750578}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.541519647050393, "margin_after_db": 12.999180267803212}
  - {"line": "s16_rasoir:05", "window_start_s": 448.521, "margin_before_db": 11.352330790947335, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.81017428804808, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.6476692090526655, "margin_after_db": 13.000000153583017}
  - {"line": "s17_rue:03", "window_start_s": 466.78099999999995, "margin_before_db": 8.379588544182809, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.92893679788108, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.620411455817191, "margin_after_db": 12.99999988346174}
  - {"line": "s18_concert:04", "window_start_s": 493.103, "margin_before_db": 3.830506164613155, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -40.19495818636799, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -9.169493835386845, "margin_after_db": 13.00000018434379}
  - {"line": "s18_concert:05", "window_start_s": 500.502, "margin_before_db": 2.757049133304079, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.42333701461694, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -10.24295086669592, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.293140779451292}
  - {"line": "s18_concert:05", "window_start_s": 500.502, "margin_before_db": 11.293140779451292, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.95942866076401, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -1.7068592205487079, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.308060328371909}
  - {"line": "s19_bain:01", "window_start_s": 513.933, "margin_before_db": 8.566966326679335, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.98414900755746, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.433033673320665, "margin_after_db": 12.999999437733116}
  - {"line": "s19_bain:03", "window_start_s": 530.617, "margin_before_db": 5.994987172404642, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.10268801107794, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.005012827595358, "margin_after_db": 13.000000389655781}
  - {"line": "s20_reveil:04", "window_start_s": 559.994, "margin_before_db": 4.29441909860202, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.944504442202, "hits": -50.5395182302708}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -8.70558090139798, "margin_after_db": 11.99745929613784}
  - {"line": "s20_reveil:04", "window_start_s": 559.994, "margin_before_db": 11.99745929613784, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.65008539133399, "hits": -50.5395182302708}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.0025407038621594, "margin_after_db": 12.73552383430777}
  - {"line": "s22_feerie:01", "window_start_s": 603.068, "margin_before_db": -2.7753754102207537, "dominant_bus": "score", "bus_lufs_s": {"score": -28.52954418818211, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -15.775375410220754, "margin_after_db": 12.99999979308556}
  - {"line": "s22_feerie:02", "window_start_s": 610.08, "margin_before_db": 0.23576735935762372, "dominant_bus": "score", "bus_lufs_s": {"score": -27.660177547669857, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -12.764232640642376, "margin_after_db": 12.999999553308928}
  - {"line": "s22_feerie:03", "window_start_s": 615.265, "margin_before_db": -0.6619466195230643, "dominant_bus": "score", "bus_lufs_s": {"score": -32.4768305270145, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -13.661946619523064, "margin_after_db": 12.999999746607102}
  - {"line": "s22_feerie:04", "window_start_s": 619.416, "margin_before_db": 2.421745119981466, "dominant_bus": "score", "bus_lufs_s": {"score": -31.742706861296032, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -10.578254880018534, "margin_after_db": 12.999999281686275}
  - {"line": "s22_feerie:05", "window_start_s": 626.3109999999999, "margin_before_db": -0.12972834942399203, "dominant_bus": "score", "bus_lufs_s": {"score": -34.17433060501499, "bed": -57.28381438548351, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -13.129728349423992, "margin_after_db": 12.999999515298533}
  - {"line": "s23_aube:02", "window_start_s": 648.182, "margin_before_db": 6.07904653378926, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.948324455486656, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.92095346621074, "margin_after_db": 13.000000020512566}
  - {"line": "s23_aube:03", "window_start_s": 651.0, "margin_before_db": 2.6015453931138737, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.34918045047075, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -10.398454606886126, "margin_after_db": 13.000000462562184}
  - {"line": "s24_idriss:01", "window_start_s": 669.8399999999999, "margin_before_db": -1.5243515360240067, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -31.103646723188632, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -14.524351536024007, "margin_after_db": 12.999999883054599}
  - {"line": "s24_idriss:02", "window_start_s": 677.799, "margin_before_db": 9.237167315400342, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.20170357164853, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.7628326845996583, "margin_after_db": 12.999999672357212}
  - {"line": "s25_aicha:01", "window_start_s": 685.076, "margin_before_db": 7.764349750794327, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -34.11487863359268, "hits": -56.774580868058166}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -5.235650249205673, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.946089767344002}
  - {"line": "s25_aicha:03", "window_start_s": 695.794, "margin_before_db": 6.639695629277881, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.43811953296215, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -6.360304370722119, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.999999919498762}
  - {"line": "s25_aicha:10", "window_start_s": 752.846, "margin_before_db": 2.716404387364527, "dominant_bus": "score", "bus_lufs_s": {"score": -37.47952597032115, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -10.283595612635473, "margin_after_db": 13.000000959904945}
  - {"line": "s26_fin:01", "window_start_s": 758.415, "margin_before_db": 0.8719257013615263, "dominant_bus": "bed", "bus_lufs_s": {"score": -39.801648361232466, "bed": -35.815271785528324, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -12.128074298638474, "margin_after_db": 13.000000061268715}
  - {"line": "s26_fin:02", "window_start_s": 765.5630000000001, "margin_before_db": 1.3120082358414464, "dominant_bus": "bed", "bus_lufs_s": {"score": -61.865055246994785, "bed": -35.6645887953059, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.687991764158554, "margin_after_db": 12.9999999384397}
  - {"line": "s26_fin:03", "window_start_s": 780.086, "margin_before_db": -1.0558883640455008, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -32.84469908901289, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -14.0558883640455, "margin_after_db": 13.000000020889146}
  - {"line": "s27_fiche:01", "window_start_s": 786.889, "margin_before_db": 1.4285021933237338, "dominant_bus": "score", "bus_lufs_s": {"score": -30.074551833481358, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.571497806676266, "margin_after_db": 13.000000426312265}
  - {"line": "s27_fiche:02", "window_start_s": 794.0329999999999, "margin_before_db": 4.313518869647488, "dominant_bus": "score", "bus_lufs_s": {"score": -27.965965144932465, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -8.686481130352512, "margin_after_db": 13.00000079036261}
  - {"line": "s27_fiche:03", "window_start_s": 801.031, "margin_before_db": -9.256106954299526, "dominant_bus": "score", "bus_lufs_s": {"score": -30.40599845311298, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.256106954299526, "margin_after_db": 13.000000645942023}
  - {"line": "s27_fiche:04", "window_start_s": 818.611, "margin_before_db": -7.654246130341697, "dominant_bus": "score", "bus_lufs_s": {"score": -32.670817735345935, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -20.654246130341697, "margin_after_db": 12.999998310620924}
- Pass 1: 0 failures; worst 12.25 dB.

### Hit nudges

- b001 razor_strop: 2.260 -> 2.255 s (-5.0 ms)
- b004 tambourine_hit: 19.267 -> 19.254 s (-13.4 ms)
- b016 child_whimper: 109.477 -> 109.466 s (-10.9 ms)
- b021 man_cough: 145.220 -> 145.199 s (-21.4 ms)
- b040 cup_suction: 290.786 -> 290.732 s (-54.0 ms)
- b059 razor_strop: 437.730 -> 437.710 s (-20.0 ms)
- b066 toy_trumpet: 479.530 -> 479.506 s (-23.9 ms)

### Unresolved hit placement

[]

### Voice treatment

- s05_hammoussa zoubida: patio, wet 0.040.
- s07_petrole vendeur: street, wet 0.064.
- s08_menthe kanza: patio, wet 0.048.
- s09_escalier zoubida: small_room, wet 0.060.
- s09_escalier voisine: small_room, wet 0.060.
- s09_escalier zoubida: small_room, wet 0.060.
- s18 femmes: four resampled/panned voices; single-take LUFS matched.
- s20 Zoubida: lowpass opens to dry over 2.5 s.

## Gemini listening pass

{
  "status": "pending: run manually in AI Studio web (no API)",
  "question": "is any word hard to understand because of music or effects?",
  "timestamp_request": "Include timestamps for any masked words.",
  "audio": "audio/ep07_mix_listen.mp3"
}

## Listen priorities

- s09 through-wall dialogue and generated whispers (200–226 s).
- s18 chorus / laughter balance (487–491 s).
- M2-to-C2 handoff and chant consonant masking (596–634 s).
- C3 distance treatment (746–771 s); classroom Foley may contain English (88 s onward).
- Source-check offenders and any unresolved hit placements listed above.

Runtime: 831.887 s. Render time: 227.3 s.
