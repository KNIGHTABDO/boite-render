# Ep08 speech-first mix report

**Speech margin gate: PASS.** 153/153 lines >=12 dB; master -16.002 LUFS / -1.608 dBTP.

## Gates

- F1_margin: **PASS**
- F2_duck_and_hits: **PASS**
- F3_carve: **PASS**
- F4_clean_voices: **REVIEW**
- F5_master_and_music: **PASS**
- F6_cleanup: **PASS**
- F7_listening: **PENDING**
- D_hard_silences: **PASS**
- cue_coverage: **PASS**

Implementation: F1/F7 pair 400 ms windows and repair dominant SCORE/BED/HITS cues, at most three passes; F2 uses -12 dB score / -6 dB bed ducking, 150 ms lookahead attack and 600 ms release, with unducked hits initially nudged within +/-250 ms, then repaired within +/-400 ms or statically attenuated; F3 uses a complementary linear-phase 1–4 kHz FIR split for the -4 dB dip; F4 screens native-rate source takes without rewriting them; F5 raises no-speech score/singing toward -20 LUFS-S, enforces the narrator ceiling and masters to -16 LUFS / <=-1.5 dBTP; F6 filters every Foley/music source at HP60 / LP14k. F7 exports a 96 kbps listening copy and the single question for manual AI Studio web review. No API is used.

## Music-level verification

{
  "score_max_lufs_s": -14.82928337981137,
  "solo_max_lufs_s": -14.82928337981137,
  "solo_median_lufs_s": -19.785317146980297,
  "solo_windows": 178,
  "loudest_narrator_line_lufs": -11.87054170250459,
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
| s18_cauchemar:07 narrator | 977.340 | -32.39 | -44.40 | 12.00 | PASS |
| s17_retour:13 narrator | 900.433 | -38.02 | -50.17 | 12.16 | PASS |
| s04_mausolee:05 narrator | 118.654 | -38.37 | -50.70 | 12.32 | PASS |
| s14_bagarre:06 narrator | 700.778 | -32.98 | -45.36 | 12.37 | PASS |
| s12_souk:08 narrator | 601.656 | -32.50 | -45.03 | 12.53 | PASS |
| s13_attente:03 narrator | 644.019 | -34.46 | -47.01 | 12.55 | PASS |
| s12_souk:09 narrator | 611.604 | -33.05 | -45.73 | 12.68 | PASS |
| s22_fiche:01 narrator | 1195.511 | -36.89 | -49.89 | 13.00 | PASS |
| s09_escalier:03 narrator | 359.080 | -38.35 | -51.35 | 13.00 | PASS |
| s18_cauchemar:05 narrator | 959.072 | -37.51 | -50.51 | 13.00 | PASS |

## Every voice line

| Line | t (s) | Voice LUFS-S | Other LUFS-S | Margin dB | Gate |
|---|---:|---:|---:|---:|---|
| s01_hook:01 narrator | 1.500 | -30.83 | -50.53 | 19.70 | PASS |
| s01_hook:02 narrator | 8.926 | -24.01 | -44.07 | 20.06 | PASS |
| s03_mouches:01 narrator | 28.673 | -37.83 | -56.48 | 18.65 | PASS |
| s03_mouches:02 narrator | 37.723 | -39.30 | -52.30 | 13.00 | PASS |
| s03_mouches:03 narrator | 46.274 | -30.39 | -60.90 | 30.51 | PASS |
| s03_mouches:04 narrator | 54.481 | -28.16 | -47.23 | 19.07 | PASS |
| s03_mouches:05 narrator | 63.937 | -36.63 | -60.31 | 23.68 | PASS |
| s03_mouches:06 narrator | 74.408 | -29.66 | -51.93 | 22.27 | PASS |
| s04_mausolee:01 narrator | 87.018 | -34.54 | -54.75 | 20.21 | PASS |
| s04_mausolee:02 narrator | 94.020 | -37.72 | -64.02 | 26.30 | PASS |
| s04_mausolee:03 narrator | 101.958 | -33.19 | -58.40 | 25.21 | PASS |
| s04_mausolee:04 narrator | 113.671 | -32.27 | -51.41 | 19.14 | PASS |
| s04_mausolee:05 narrator | 118.654 | -38.37 | -50.70 | 12.32 | PASS |
| s04_mausolee:06 narrator | 128.351 | -34.79 | -49.58 | 14.80 | PASS |
| s05_memoire:01 narrator | 140.204 | -33.06 | -200.69 | 167.63 | PASS |
| s05_memoire:02 narrator | 147.382 | -37.52 | -200.69 | 163.17 | PASS |
| s05_memoire:03 narrator | 154.788 | -32.31 | -200.69 | 168.38 | PASS |
| s05_memoire:04 father | 161.409 | -42.12 | -200.69 | 158.58 | PASS |
| s05_memoire:05 narrator | 168.295 | -14.58 | -39.19 | 24.61 | PASS |
| s05_memoire:06 narrator | 178.654 | -24.66 | -200.69 | 176.04 | PASS |
| s06_reves:01 narrator | 185.434 | -32.22 | -62.63 | 30.41 | PASS |
| s06_reves:02 narrator | 192.431 | -41.66 | -56.20 | 14.54 | PASS |
| s06_reves:03 narrator | 205.607 | -33.58 | -48.49 | 14.90 | PASS |
| s06_reves:04 narrator | 213.008 | -36.72 | -49.72 | 13.00 | PASS |
| s06_reves:05 narrator | 222.851 | -37.28 | -50.28 | 13.00 | PASS |
| s07_lundi:01 narrator | 237.290 | -27.75 | -50.69 | 22.94 | PASS |
| s07_lundi:02 father | 244.142 | -36.25 | -49.37 | 13.12 | PASS |
| s07_lundi:03 father | 256.090 | -31.47 | -200.69 | 169.22 | PASS |
| s07_lundi:04 father | 261.764 | -40.53 | -200.69 | 160.16 | PASS |
| s07_lundi:05 narrator | 270.012 | -28.86 | -52.52 | 23.66 | PASS |
| s07_lundi:06 father | 275.095 | -20.63 | -42.43 | 21.80 | PASS |
| s07_lundi:07 zoubida | 281.195 | -20.51 | -200.69 | 180.18 | PASS |
| s07_lundi:08 father | 283.455 | -38.58 | -200.69 | 162.11 | PASS |
| s07_lundi:10 father | 295.578 | -33.84 | -200.69 | 166.85 | PASS |
| s07_lundi:11 father | 304.063 | -37.20 | -200.69 | 163.49 | PASS |
| s08_fleurs:01 mohammed | 310.768 | -33.81 | -200.69 | 166.88 | PASS |
| s08_fleurs:02 father | 317.565 | -21.60 | -200.69 | 179.10 | PASS |
| s08_fleurs:03 narrator | 319.637 | -26.31 | -200.69 | 174.38 | PASS |
| s08_fleurs:05 narrator | 325.871 | -24.38 | -46.27 | 21.88 | PASS |
| s08_fleurs:06 narrator | 329.168 | -28.79 | -200.69 | 171.90 | PASS |
| s09_escalier:01 narrator | 340.746 | -37.29 | -200.69 | 163.41 | PASS |
| s09_escalier:02 narrator | 352.445 | -32.99 | -200.69 | 167.70 | PASS |
| s09_escalier:03 narrator | 359.080 | -38.35 | -51.35 | 13.00 | PASS |
| s09_escalier:04 narrator | 373.794 | -41.37 | -54.37 | 13.00 | PASS |
| s09_escalier:05 narrator | 382.757 | -36.67 | -49.67 | 13.00 | PASS |
| s09_escalier:06 narrator | 396.121 | -38.58 | -51.58 | 13.00 | PASS |
| s09_escalier:07 narrator | 409.427 | -42.83 | -55.83 | 13.00 | PASS |
| s09_escalier:08 narrator | 414.422 | -39.04 | -52.45 | 13.41 | PASS |
| s09_escalier:09 narrator | 423.595 | -32.69 | -47.15 | 14.46 | PASS |
| s09_escalier:10 narrator | 435.031 | -33.44 | -47.02 | 13.58 | PASS |
| s10_roi:01 zoubida | 447.187 | -12.21 | -200.69 | 188.48 | PASS |
| s10_roi:03 zoubida | 450.651 | -13.04 | -200.69 | 187.65 | PASS |
| s10_roi:04 mohammed | 452.538 | -19.38 | -200.69 | 181.31 | PASS |
| s10_roi:05 zoubida | 454.109 | -23.27 | -200.69 | 177.42 | PASS |
| s10_roi:06 narrator | 459.793 | -20.91 | -45.93 | 25.02 | PASS |
| s10_roi:07 rahma | 462.311 | -12.65 | -54.74 | 42.10 | PASS |
| s10_roi:08 narrator | 467.538 | -23.67 | -200.69 | 177.02 | PASS |
| s10_roi:09 narrator | 473.168 | -15.70 | -43.09 | 27.39 | PASS |
| s10_roi:10 rahma | 485.358 | -25.41 | -61.80 | 36.39 | PASS |
| s10_roi:11 zoubida | 492.084 | -34.71 | -200.69 | 165.98 | PASS |
| s10_roi:12 femmes | 498.216 | -18.03 | -59.82 | 41.79 | PASS |
| s11_depart:01 narrator | 504.269 | -27.59 | -56.44 | 28.85 | PASS |
| s11_depart:02 mohammed | 508.712 | -14.37 | -62.32 | 47.95 | PASS |
| s11_depart:03 zoubida | 511.508 | -25.52 | -66.64 | 41.12 | PASS |
| s11_depart:04 narrator | 516.476 | -37.56 | -63.46 | 25.90 | PASS |
| s11_depart:05 fatma | 526.036 | -18.64 | -54.05 | 35.41 | PASS |
| s11_depart:06 narrator | 528.254 | -36.00 | -52.23 | 16.23 | PASS |
| s11_depart:07 father | 533.682 | -34.60 | -48.37 | 13.77 | PASS |
| s12_souk:01 narrator | 544.107 | -28.63 | -56.47 | 27.84 | PASS |
| s12_souk:02 narrator | 549.894 | -22.93 | -57.59 | 34.66 | PASS |
| s12_souk:03 narrator | 556.143 | -34.78 | -54.44 | 19.66 | PASS |
| s12_souk:04 narrator | 568.183 | -40.72 | -54.32 | 13.60 | PASS |
| s12_souk:05 narrator | 573.821 | -41.14 | -54.14 | 13.00 | PASS |
| s12_souk:06 narrator | 585.210 | -30.64 | -48.02 | 17.38 | PASS |
| s12_souk:07 narrator | 592.811 | -36.18 | -54.03 | 17.85 | PASS |
| s12_souk:08 narrator | 601.656 | -32.50 | -45.03 | 12.53 | PASS |
| s12_souk:09 narrator | 611.604 | -33.05 | -45.73 | 12.68 | PASS |
| s13_attente:01 narrator | 627.536 | -45.50 | -200.69 | 155.19 | PASS |
| s13_attente:02 narrator | 636.974 | -23.47 | -48.31 | 24.84 | PASS |
| s13_attente:03 narrator | 644.019 | -34.46 | -47.01 | 12.55 | PASS |
| s13_attente:04 narrator | 650.794 | -34.20 | -47.25 | 13.05 | PASS |
| s13_attente:05 narrator | 658.224 | -38.42 | -52.25 | 13.83 | PASS |
| s13_attente:06 zoubida | 665.768 | -34.85 | -53.96 | 19.11 | PASS |
| s13_attente:07 narrator | 672.547 | -23.05 | -51.79 | 28.73 | PASS |
| s14_bagarre:01 narrator | 678.634 | -32.32 | -55.92 | 23.59 | PASS |
| s14_bagarre:02 narrator | 683.806 | -36.56 | -52.09 | 15.53 | PASS |
| s14_bagarre:03 narrator | 691.797 | -15.89 | -47.21 | 31.32 | PASS |
| s14_bagarre:04 zoubida | 694.178 | -31.21 | -48.43 | 17.22 | PASS |
| s14_bagarre:05 fatma | 697.644 | -29.55 | -54.60 | 25.05 | PASS |
| s14_bagarre:06 narrator | 700.778 | -32.98 | -45.36 | 12.37 | PASS |
| s14_bagarre:07 narrator | 710.255 | -17.56 | -39.71 | 22.16 | PASS |
| s14_bagarre:08 narrator | 719.853 | -22.14 | -53.46 | 31.32 | PASS |
| s15_fruits_secs:01 narrator | 726.249 | -46.48 | -59.48 | 13.00 | PASS |
| s15_fruits_secs:02 narrator | 733.853 | -35.12 | -63.73 | 28.61 | PASS |
| s15_fruits_secs:03 narrator | 739.518 | -37.83 | -63.75 | 25.92 | PASS |
| s15_fruits_secs:04 narrator | 753.433 | -35.51 | -60.98 | 25.47 | PASS |
| s15_fruits_secs:05 zoubida | 759.966 | -34.28 | -61.77 | 27.48 | PASS |
| s16_noir:01 narrator | 770.261 | -35.75 | -48.75 | 13.00 | PASS |
| s16_noir:02 narrator | 782.649 | -30.16 | -53.06 | 22.90 | PASS |
| s16_noir:03 narrator | 796.111 | -25.78 | -47.44 | 21.66 | PASS |
| s16_noir:04 narrator | 805.743 | -35.43 | -48.43 | 13.00 | PASS |
| s16_noir:05 narrator | 813.516 | -36.04 | -68.86 | 32.82 | PASS |
| s16_noir:06 narrator | 821.307 | -35.03 | -48.63 | 13.60 | PASS |
| s17_retour:01 narrator | 835.116 | -22.05 | -47.08 | 25.03 | PASS |
| s17_retour:02 narrator | 841.713 | -34.92 | -54.56 | 19.64 | PASS |
| s17_retour:03 father | 849.994 | -33.77 | -200.69 | 166.93 | PASS |
| s17_retour:04 zoubida | 854.321 | -36.65 | -200.69 | 164.04 | PASS |
| s17_retour:05 father | 858.183 | -33.78 | -200.69 | 166.91 | PASS |
| s17_retour:06 mohammed | 861.503 | -25.93 | -200.69 | 174.76 | PASS |
| s17_retour:07 father | 864.462 | -17.32 | -200.69 | 183.37 | PASS |
| s17_retour:08 mohammed | 866.725 | -20.45 | -200.69 | 180.24 | PASS |
| s17_retour:09 narrator | 869.046 | -17.33 | -42.70 | 25.37 | PASS |
| s17_retour:10 father | 875.902 | -23.28 | -42.75 | 19.47 | PASS |
| s17_retour:11 zoubida | 885.040 | -35.82 | -67.38 | 31.55 | PASS |
| s17_retour:12 father | 893.703 | -37.09 | -71.16 | 34.07 | PASS |
| s17_retour:13 narrator | 900.433 | -38.02 | -50.17 | 12.16 | PASS |
| s17_retour:14 zoubida | 907.377 | -34.90 | -66.20 | 31.30 | PASS |
| s18_cauchemar:01 narrator | 919.825 | -33.45 | -50.38 | 16.93 | PASS |
| s18_cauchemar:02 narrator | 933.721 | -28.62 | -51.42 | 22.81 | PASS |
| s18_cauchemar:03 narrator | 942.871 | -35.64 | -52.06 | 16.42 | PASS |
| s18_cauchemar:04 narrator | 952.096 | -31.73 | -48.13 | 16.40 | PASS |
| s18_cauchemar:05 narrator | 959.072 | -37.51 | -50.51 | 13.00 | PASS |
| s18_cauchemar:06 father | 972.724 | -34.73 | -49.75 | 15.02 | PASS |
| s18_cauchemar:07 narrator | 977.340 | -32.39 | -44.40 | 12.00 | PASS |
| s18_cauchemar:08 mohammed | 989.561 | -17.80 | -32.32 | 14.52 | PASS |
| s18_cauchemar:09 zoubida | 993.039 | -38.58 | -51.58 | 13.00 | PASS |
| s18_cauchemar:10 narrator | 1000.170 | -39.05 | -52.05 | 13.00 | PASS |
| s19_matin:01 father | 1009.889 | -35.16 | -200.69 | 165.53 | PASS |
| s19_matin:02 narrator | 1017.927 | -36.88 | -71.14 | 34.26 | PASS |
| s19_matin:03 father | 1025.291 | -38.19 | -200.69 | 162.50 | PASS |
| s19_matin:04 zoubida | 1030.610 | -33.88 | -200.69 | 166.81 | PASS |
| s19_matin:05 father | 1036.554 | -35.17 | -200.69 | 165.52 | PASS |
| s19_matin:06 zoubida | 1042.289 | -35.23 | -200.69 | 165.46 | PASS |
| s19_matin:07 father | 1049.897 | -41.89 | -200.69 | 158.80 | PASS |
| s19_matin:08 zoubida | 1054.384 | -32.65 | -200.69 | 168.04 | PASS |
| s19_matin:09 narrator | 1059.748 | -39.28 | -200.69 | 161.41 | PASS |
| s19_matin:10 narrator | 1068.249 | -33.55 | -200.69 | 167.14 | PASS |
| s20_aicha:01 narrator | 1080.556 | -14.25 | -47.68 | 33.42 | PASS |
| s20_aicha:02 narrator | 1087.350 | -24.02 | -47.63 | 23.61 | PASS |
| s20_aicha:03 narrator | 1100.023 | -18.16 | -44.82 | 26.66 | PASS |
| s20_aicha:04 zoubida | 1108.357 | -28.73 | -200.69 | 171.96 | PASS |
| s20_aicha:05 narrator | 1112.271 | -37.10 | -50.10 | 13.00 | PASS |
| s20_aicha:08 zoubida | 1137.116 | -34.13 | -200.69 | 166.56 | PASS |
| s20_aicha:09 narrator | 1147.040 | -30.54 | -46.58 | 16.04 | PASS |
| s21_fievre:01 narrator | 1156.631 | -41.72 | -200.69 | 158.97 | PASS |
| s21_fievre:02 narrator | 1167.090 | -33.04 | -47.10 | 14.05 | PASS |
| s21_fievre:03 zoubida | 1173.190 | -24.52 | -53.12 | 28.61 | PASS |
| s21_fievre:04 narrator | 1181.157 | -33.95 | -46.95 | 13.00 | PASS |
| s22_fiche:01 narrator | 1195.511 | -36.89 | -49.89 | 13.00 | PASS |
| s22_fiche:02 narrator | 1203.656 | -37.27 | -50.27 | 13.00 | PASS |
| s22_fiche:03 narrator | 1211.923 | -34.80 | -47.80 | 13.00 | PASS |
| s22_fiche:04 narrator | 1222.695 | -27.97 | -40.97 | 13.00 | PASS |
| s22_fiche:05 narrator | 1229.379 | -41.25 | -54.25 | 13.00 | PASS |

## Voice source checks

Noise: median 10 ms frame RMS in contiguous pauses >=150 ms below peak-35 dB, discarding 40 ms at each edge; fallback: 1st-percentile frame RMS. Flag >-60 dBFS. Clipping: |sample| >=0.999. Clicks: jump >max(0.25, 8×99.5th-percentile jump). These are screening estimates, not word alignment or a breath classifier. Takes flagged on the raw file get the breath expander (-15 dB in pauses) and are re-measured after it; the gate uses the treated value.

| Scene / speaker / take | Gap noise dBFS | Clipped samples | Click candidates |
|---|---:|---:|---:|
| s10_roi / narrator / 8d54f6e38961.wav | -57.45 | 0 | 0 |
| s14_bagarre / fatma / f81b2b53741c.wav | -55.77 | 0 | 0 |
| s19_matin / zoubida / c3d36a7a4989.wav | -56.39 | 0 | 0 |

Offenders: 3; noise-flagged takes: 3. Full per-take results are in mix_report.json.

## Placement / sources

Word timing uses measured 10 ms activity islands; no forced word alignment is supplied. Hits are not ducked; auto-fix may move or statically trim individual cues.

Missing IDs: none. Duration-classified IDs (explicit >1.5 s fallback): ['chair_wood_creak', 'cloth_rustle_stiff', 'door_wood_old', 'footsteps_stairs', 'ladder_wood_creak', 'leather_tap', 'man_groan', 'powder_hiss'].

Hard-silence windows (beds zero, 100 ms outside fades): [(767.861, 813.52), (1155.231, 1167.09)]. Each map timestamp holds until the next sound cue or scene end; breaths/hits remain.

### Auto-fix actions

- Pass 0: 27 failures; worst -9.14 dB.
  - {"line": "s03_mouches:02", "window_start_s": 40.993, "margin_before_db": 10.442518457231792, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -48.190761730686376, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.5574815427682083, "margin_after_db": 12.999999634617893}
  - {"line": "s04_mausolee:05", "window_start_s": 120.014, "margin_before_db": 6.860626072913526, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.47029690516305, "hits": -48.708676521691274}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.139373927086474, "margin_after_db": 9.986223258444376}
  - {"line": "s04_mausolee:05", "window_start_s": 120.014, "margin_before_db": 9.986223258444376, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -51.60967066709256, "hits": -48.708676521691274}, "action": "attenuate_cue", "id": "water_bucket_splash", "gain_db": -3.013776741555624, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.724862494753715}
  - {"line": "s04_mausolee:05", "window_start_s": 120.014, "margin_before_db": 11.724862494753715, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -51.60967066709256, "hits": -51.72245290427364}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.2751375052462848, "margin_after_db": 12.324974139358993}
  - {"line": "s06_reves:04", "window_start_s": 218.87800000000001, "margin_before_db": 9.820919175381185, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.9934769878841, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.179080824618815, "margin_after_db": 12.999999793767415}
  - {"line": "s06_reves:05", "window_start_s": 224.911, "margin_before_db": 10.980243668755719, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -46.70609309218577, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.019756331244281, "margin_after_db": 13.000000002016236}
  - {"line": "s09_escalier:03", "window_start_s": 369.24, "margin_before_db": 9.588446274842674, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -46.3843776469188, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.411553725157326, "margin_after_db": 12.999999448058787}
  - {"line": "s09_escalier:04", "window_start_s": 377.054, "margin_before_db": 5.200809238382568, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.026349559985285, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.799190761617432, "margin_after_db": 13.000000269967842}
  - {"line": "s09_escalier:05", "window_start_s": 389.527, "margin_before_db": 10.697212132788238, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.82278436631869, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.3027878672117623, "margin_after_db": 12.999999970146789}
  - {"line": "s09_escalier:06", "window_start_s": 406.871, "margin_before_db": 11.996396411114702, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -49.02703984184905, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.0036035888852979, "margin_after_db": 13.000000131892769}
  - {"line": "s09_escalier:07", "window_start_s": 410.887, "margin_before_db": 10.04701224051204, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -51.33258899439381, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.9529877594879608, "margin_after_db": 12.999999746929632}
  - {"line": "s12_souk:05", "window_start_s": 576.381, "margin_before_db": 10.731698228362994, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -50.323506442833214, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.268301771637006, "margin_after_db": 13.000000182809579}
  - {"line": "s12_souk:08", "window_start_s": 603.9159999999999, "margin_before_db": 10.02093694208802, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -50.32219543338565, "hits": -41.50078838098162}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -2.9790630579119792, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.530529657929264}
  - {"line": "s14_bagarre:06", "window_start_s": 701.448, "margin_before_db": 8.626087884517748, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -40.06043802418461}, "action": "attenuate_cue", "id": "man_groan", "gain_db": -4.373912115482252, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.640759720167143}
  - {"line": "s14_bagarre:06", "window_start_s": 701.448, "margin_before_db": 11.640759720167143, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -43.07510985983393}, "action": "attenuate_cue", "id": "man_groan", "gain_db": -1.3592402798328571, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.371589328431629}
  - {"line": "s15_fruits_secs:01", "window_start_s": 727.009, "margin_before_db": 3.428991804406479, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -48.355095559326315}, "action": "attenuate_cue", "id": "child_whimper", "gain_db": -9.571008195593521, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 13.000000568262656}
  - {"line": "s16_noir:01", "window_start_s": 770.9209999999999, "margin_before_db": 8.32005687104796, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -42.52060744437371}, "action": "attenuate_cue", "id": "child_whimper", "gain_db": -4.67994312895204, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.999999672689704}
  - {"line": "s16_noir:04", "window_start_s": 807.403, "margin_before_db": 11.49534331466571, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -45.37408989636044}, "action": "attenuate_cue", "id": "child_whimper", "gain_db": -1.5046566853342895, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 13.000000014819491}
  - {"line": "s17_retour:13", "window_start_s": 901.1129999999999, "margin_before_db": 9.17450611329172, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -68.82394287486014, "hits": -45.66488275489684}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -3.82549388670828, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.168032347985665}
  - {"line": "s17_retour:13", "window_start_s": 901.1129999999999, "margin_before_db": 11.168032347985665, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -68.82394287486014, "hits": -47.66874489829584}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -1.8319676520143346, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.825307905949714}
  - {"line": "s17_retour:13", "window_start_s": 901.1129999999999, "margin_before_db": 11.825307905949714, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -68.82394287486014, "hits": -48.33029200182618}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -1.174692094050286, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.155885407293631}
  - {"line": "s18_cauchemar:05", "window_start_s": 969.432, "margin_before_db": 8.253154096593988, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.2108230619302, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.746845903406012, "margin_after_db": 12.999999566455855}
  - {"line": "s18_cauchemar:07", "window_start_s": 982.7, "margin_before_db": -1.9715760657821235, "dominant_bus": "score", "bus_lufs_s": {"score": -29.912571569505257, "bed": -43.118384824304044, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -14.971576065782124, "margin_after_db": 8.354738342646243}
  - {"line": "s18_cauchemar:07", "window_start_s": 979.4, "margin_before_db": 8.354738342646243, "dominant_bus": "hits", "bus_lufs_s": {"score": -44.22627332335301, "bed": -59.59523427648258, "hits": -40.88113172181979}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -4.645261657353757, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 10.922177123488666}
  - {"line": "s18_cauchemar:07", "window_start_s": 979.4, "margin_before_db": 10.922177123488666, "dominant_bus": "score", "bus_lufs_s": {"score": -44.22627332335301, "bed": -59.59523427648258, "hits": -45.52634167986169}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.077822876511334, "margin_after_db": 12.001793604830944}
  - {"line": "s18_cauchemar:09", "window_start_s": 997.299, "margin_before_db": 6.902245552156238, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.930386521290515, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.097754447843762, "margin_after_db": 12.99999958759075}
  - {"line": "s18_cauchemar:10", "window_start_s": 1001.9499999999999, "margin_before_db": 7.06181370941578, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.565161039660296, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.93818629058422, "margin_after_db": 12.999999737973447}
  - {"line": "s20_aicha:05", "window_start_s": 1113.031, "margin_before_db": 5.925320965299406, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -41.47701249168986}, "action": "attenuate_cue", "id": "child_whimper", "gain_db": -7.074679034700594, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.999999893983798}
  - {"line": "s21_fievre:04", "window_start_s": 1185.5269999999998, "margin_before_db": 9.06946209313125, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.472439949545006, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.93053790686875, "margin_after_db": 13.000000179095998}
  - {"line": "s22_fiche:01", "window_start_s": 1199.141, "margin_before_db": -9.136465940284317, "dominant_bus": "score", "bus_lufs_s": {"score": -26.202380973415586, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.136465940284317, "margin_after_db": 12.999998440518553}
  - {"line": "s22_fiche:02", "window_start_s": 1209.176, "margin_before_db": -5.571519497774098, "dominant_bus": "score", "bus_lufs_s": {"score": -30.14595157162018, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -18.571519497774098, "margin_after_db": 13.000000099732532}
  - {"line": "s22_fiche:03", "window_start_s": 1216.093, "margin_before_db": -3.6713643365559676, "dominant_bus": "score", "bus_lufs_s": {"score": -29.577974809401944, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -16.671364336555968, "margin_after_db": 13.000000166384346}
  - {"line": "s22_fiche:04", "window_start_s": 1226.855, "margin_before_db": 6.797608167778293, "dominant_bus": "score", "bus_lufs_s": {"score": -33.22240842285308, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.202391832221707, "margin_after_db": 12.999999582020237}
  - {"line": "s22_fiche:05", "window_start_s": 1229.7389999999998, "margin_before_db": -5.846262170209641, "dominant_bus": "score", "bus_lufs_s": {"score": -33.85192432573862, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -18.84626217020964, "margin_after_db": 12.999999552831866}
- Pass 1: 0 failures; worst 12.00 dB.

### Hit nudges

- b002 child_whimper: 8.997 -> 8.981 s (-15.9 ms)
- b005 chair_wood_creak: 38.000 -> 37.918 s (-81.8 ms)
- b020 child_breath_in: 168.787 -> 168.790 s (+3.4 ms)
- b086 man_groan: 651.331 -> 651.329 s (-2.0 ms)
- b103 child_whimper: 770.327 -> 770.316 s (-10.9 ms)
- b118 metal_clinks: 878.230 -> 878.207 s (-23.3 ms)
- b134 metal_clinks: 1020.094 -> 1020.082 s (-11.5 ms)
- b147 child_whimper: 1112.337 -> 1112.326 s (-10.9 ms)

### Unresolved hit placement

[]

### Voice treatment

- MISSING VOICE TAKE s07_lundi mohammed @ 289.0 s: Mais... je ne peux pas manquer le Msid ! J'ai ma l
- MISSING VOICE TAKE s08_fleurs mohammed @ 321.7 s: Les bijoux, c'est beau comme les fleurs.
- MISSING VOICE TAKE s10_roi mohammed @ 449.3 s: Je joue.
- s10_roi zoubida line 3: shout trim -0.9 dB.
- s10_roi rahma line 7: shout trim -0.8 dB.
- s10_roi femmes: four resampled/panned voices; single-take LUFS matched.
- s11_depart mohammed line 2: shout trim -3.0 dB.
- s11_depart zoubida line 3: shout trim -0.2 dB.
- s11_depart father line 7: shout trim -0.9 dB.
- s11_depart father: patio, wet 0.040.
- MISSING VOICE TAKE s11_depart kanza @ 537.1 s: Passe, maalem Abdeslem.
- s13_attente zoubida line 6: shout trim -1.0 dB.
- s14_bagarre zoubida line 4: shout trim -1.2 dB.
- s14_bagarre fatma line 5: shout trim -1.5 dB.
- s17_retour mohammed line 6: shout trim -3.0 dB.
- s19_matin zoubida line 4: shout trim -2.1 dB.
- s19_matin zoubida line 6: shout trim -0.7 dB.
- s20_aicha zoubida line 4: shout trim -0.1 dB.
- MISSING VOICE TAKE s20_aicha aicha @ 1118.6 s: Zoubida, je n'ai plus personne au monde. Tu es ma 
- MISSING VOICE TAKE s20_aicha aicha @ 1124.9 s: Le fils du péché, pour qui j'ai tout donné, m'a ab

## Gemini listening pass

{
  "status": "pending: run manually in AI Studio web (no API)",
  "question": "is any word hard to understand because of music or effects?",
  "timestamp_request": "Include timestamps for any masked words.",
  "audio": "audio/ep08_mix_listen.mp3"
}

## Listen priorities

- s14 bagarre crowd / stampede under the narrator (677-725 s).
- s18 cauchemar: drone, crowd, M2 façade swell then hard cut (917-1008 s).
- s03 fly buzz (procedural) and s21 giant heartbeat (procedural).
- Source-check offenders and any unresolved hit placements listed above.

Runtime: 1254.324 s. Render time: 749.6 s.
