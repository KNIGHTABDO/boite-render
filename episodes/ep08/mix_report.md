# Ep08 speech-first mix report

**Speech margin gate: PASS.** 159/159 lines >=12 dB; master -16.002 LUFS / -1.528 dBTP.

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
  "score_max_lufs_s": -14.835823183539937,
  "solo_max_lufs_s": -14.835823183539937,
  "solo_median_lufs_s": -19.791857171237623,
  "solo_windows": 178,
  "loudest_narrator_line_lufs": -11.891216627300212,
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
| s18_cauchemar:07 narrator | 977.340 | -32.45 | -44.45 | 12.00 | PASS |
| s17_retour:13 narrator | 900.433 | -38.07 | -50.23 | 12.16 | PASS |
| s04_mausolee:05 narrator | 118.654 | -38.43 | -50.75 | 12.32 | PASS |
| s14_bagarre:06 narrator | 700.778 | -33.04 | -45.41 | 12.37 | PASS |
| s12_souk:08 narrator | 601.656 | -32.55 | -45.08 | 12.53 | PASS |
| s13_attente:03 narrator | 644.019 | -34.52 | -47.07 | 12.55 | PASS |
| s12_souk:09 narrator | 611.604 | -33.11 | -45.79 | 12.68 | PASS |
| s22_fiche:05 narrator | 1229.379 | -41.30 | -54.30 | 13.00 | PASS |
| s09_escalier:03 narrator | 359.080 | -38.40 | -51.40 | 13.00 | PASS |
| s18_cauchemar:09 zoubida | 993.039 | -38.63 | -51.63 | 13.00 | PASS |

## Every voice line

| Line | t (s) | Voice LUFS-S | Other LUFS-S | Margin dB | Gate |
|---|---:|---:|---:|---:|---|
| s01_hook:01 narrator | 1.500 | -30.89 | -50.58 | 19.70 | PASS |
| s01_hook:02 narrator | 8.926 | -24.07 | -44.13 | 20.06 | PASS |
| s03_mouches:01 narrator | 28.673 | -37.89 | -56.54 | 18.65 | PASS |
| s03_mouches:02 narrator | 37.723 | -39.35 | -52.35 | 13.00 | PASS |
| s03_mouches:03 narrator | 46.274 | -30.45 | -60.96 | 30.51 | PASS |
| s03_mouches:04 narrator | 54.481 | -28.22 | -47.29 | 19.07 | PASS |
| s03_mouches:05 narrator | 63.937 | -36.69 | -60.37 | 23.68 | PASS |
| s03_mouches:06 narrator | 74.408 | -29.72 | -51.99 | 22.27 | PASS |
| s04_mausolee:01 narrator | 87.018 | -34.60 | -54.81 | 20.21 | PASS |
| s04_mausolee:02 narrator | 94.020 | -37.78 | -64.08 | 26.30 | PASS |
| s04_mausolee:03 narrator | 101.958 | -33.25 | -58.46 | 25.21 | PASS |
| s04_mausolee:04 narrator | 113.671 | -32.32 | -51.46 | 19.14 | PASS |
| s04_mausolee:05 narrator | 118.654 | -38.43 | -50.75 | 12.32 | PASS |
| s04_mausolee:06 narrator | 128.351 | -34.84 | -49.64 | 14.80 | PASS |
| s05_memoire:01 narrator | 140.204 | -33.12 | -200.69 | 167.58 | PASS |
| s05_memoire:02 narrator | 147.382 | -37.57 | -200.69 | 163.12 | PASS |
| s05_memoire:03 narrator | 154.788 | -32.37 | -200.69 | 168.32 | PASS |
| s05_memoire:04 father | 161.409 | -42.17 | -200.69 | 158.52 | PASS |
| s05_memoire:05 narrator | 168.295 | -14.64 | -39.25 | 24.61 | PASS |
| s05_memoire:06 narrator | 178.654 | -24.71 | -200.69 | 175.98 | PASS |
| s06_reves:01 narrator | 185.434 | -32.28 | -62.69 | 30.41 | PASS |
| s06_reves:02 narrator | 192.431 | -41.72 | -56.26 | 14.54 | PASS |
| s06_reves:03 narrator | 205.607 | -33.64 | -48.54 | 14.90 | PASS |
| s06_reves:04 narrator | 213.008 | -36.78 | -49.78 | 13.00 | PASS |
| s06_reves:05 narrator | 222.851 | -37.33 | -50.33 | 13.00 | PASS |
| s07_lundi:01 narrator | 237.290 | -27.81 | -50.74 | 22.94 | PASS |
| s07_lundi:02 father | 244.142 | -36.30 | -49.42 | 13.12 | PASS |
| s07_lundi:03 father | 256.090 | -31.53 | -200.69 | 169.16 | PASS |
| s07_lundi:04 father | 261.764 | -40.59 | -200.69 | 160.10 | PASS |
| s07_lundi:05 narrator | 270.012 | -28.91 | -52.58 | 23.66 | PASS |
| s07_lundi:06 father | 275.095 | -20.69 | -42.48 | 21.80 | PASS |
| s07_lundi:07 zoubida | 281.195 | -20.56 | -200.69 | 180.13 | PASS |
| s07_lundi:08 father | 283.455 | -38.64 | -200.69 | 162.05 | PASS |
| s07_lundi:09 mohammed | 288.978 | -30.31 | -200.69 | 170.38 | PASS |
| s07_lundi:10 father | 295.578 | -33.90 | -200.69 | 166.79 | PASS |
| s07_lundi:11 father | 304.063 | -37.26 | -200.69 | 163.43 | PASS |
| s08_fleurs:01 mohammed | 310.768 | -33.87 | -200.69 | 166.82 | PASS |
| s08_fleurs:02 father | 317.565 | -21.65 | -200.69 | 179.04 | PASS |
| s08_fleurs:03 narrator | 319.637 | -26.37 | -200.69 | 174.32 | PASS |
| s08_fleurs:04 mohammed | 321.743 | -34.30 | -200.69 | 166.39 | PASS |
| s08_fleurs:05 narrator | 326.483 | -24.44 | -45.56 | 21.12 | PASS |
| s08_fleurs:06 narrator | 329.168 | -28.85 | -200.69 | 171.84 | PASS |
| s09_escalier:01 narrator | 340.746 | -37.34 | -200.69 | 163.35 | PASS |
| s09_escalier:02 narrator | 352.445 | -33.05 | -200.69 | 167.64 | PASS |
| s09_escalier:03 narrator | 359.080 | -38.40 | -51.40 | 13.00 | PASS |
| s09_escalier:04 narrator | 373.794 | -41.43 | -54.43 | 13.00 | PASS |
| s09_escalier:05 narrator | 382.757 | -36.73 | -49.73 | 13.00 | PASS |
| s09_escalier:06 narrator | 396.121 | -38.64 | -51.64 | 13.00 | PASS |
| s09_escalier:07 narrator | 409.427 | -42.89 | -55.89 | 13.00 | PASS |
| s09_escalier:08 narrator | 414.422 | -39.09 | -52.50 | 13.41 | PASS |
| s09_escalier:09 narrator | 423.595 | -32.75 | -47.21 | 14.46 | PASS |
| s09_escalier:10 narrator | 435.031 | -33.50 | -47.08 | 13.58 | PASS |
| s10_roi:01 zoubida | 447.187 | -12.27 | -200.69 | 188.43 | PASS |
| s10_roi:02 mohammed | 449.280 | -12.12 | -200.69 | 188.57 | PASS |
| s10_roi:03 zoubida | 450.651 | -13.10 | -200.69 | 187.59 | PASS |
| s10_roi:04 mohammed | 452.538 | -19.43 | -200.69 | 181.26 | PASS |
| s10_roi:05 zoubida | 454.109 | -23.33 | -200.69 | 177.36 | PASS |
| s10_roi:06 narrator | 459.793 | -20.97 | -45.99 | 25.02 | PASS |
| s10_roi:07 rahma | 462.311 | -12.71 | -54.80 | 42.10 | PASS |
| s10_roi:08 narrator | 467.538 | -23.73 | -200.69 | 176.96 | PASS |
| s10_roi:09 narrator | 473.168 | -15.75 | -43.15 | 27.39 | PASS |
| s10_roi:10 rahma | 485.358 | -25.46 | -61.86 | 36.39 | PASS |
| s10_roi:11 zoubida | 492.084 | -34.77 | -200.69 | 165.92 | PASS |
| s10_roi:12 femmes | 498.216 | -18.08 | -59.87 | 41.79 | PASS |
| s11_depart:01 narrator | 504.269 | -27.65 | -56.50 | 28.85 | PASS |
| s11_depart:02 mohammed | 508.712 | -14.43 | -62.38 | 47.95 | PASS |
| s11_depart:03 zoubida | 511.508 | -25.57 | -66.70 | 41.12 | PASS |
| s11_depart:04 narrator | 516.476 | -37.61 | -63.52 | 25.90 | PASS |
| s11_depart:05 fatma | 526.036 | -18.70 | -54.10 | 35.41 | PASS |
| s11_depart:06 narrator | 528.254 | -36.06 | -52.29 | 16.23 | PASS |
| s11_depart:07 father | 533.682 | -34.66 | -48.43 | 13.77 | PASS |
| s11_depart:08 kanza | 537.121 | -28.63 | -53.88 | 25.26 | PASS |
| s12_souk:01 narrator | 544.107 | -28.69 | -56.53 | 27.84 | PASS |
| s12_souk:02 narrator | 549.894 | -22.99 | -57.65 | 34.66 | PASS |
| s12_souk:03 narrator | 556.143 | -34.84 | -54.50 | 19.66 | PASS |
| s12_souk:04 narrator | 568.183 | -40.78 | -54.38 | 13.60 | PASS |
| s12_souk:05 narrator | 573.821 | -41.20 | -54.20 | 13.00 | PASS |
| s12_souk:06 narrator | 585.210 | -30.70 | -48.08 | 17.38 | PASS |
| s12_souk:07 narrator | 592.811 | -36.24 | -54.08 | 17.85 | PASS |
| s12_souk:08 narrator | 601.656 | -32.55 | -45.08 | 12.53 | PASS |
| s12_souk:09 narrator | 611.604 | -33.11 | -45.79 | 12.68 | PASS |
| s13_attente:01 narrator | 627.536 | -45.56 | -200.69 | 155.13 | PASS |
| s13_attente:02 narrator | 636.974 | -23.53 | -48.37 | 24.84 | PASS |
| s13_attente:03 narrator | 644.019 | -34.52 | -47.07 | 12.55 | PASS |
| s13_attente:04 narrator | 650.794 | -34.26 | -47.31 | 13.05 | PASS |
| s13_attente:05 narrator | 658.224 | -38.48 | -52.31 | 13.83 | PASS |
| s13_attente:06 zoubida | 665.768 | -34.91 | -54.02 | 19.11 | PASS |
| s13_attente:07 narrator | 672.547 | -23.11 | -51.84 | 28.73 | PASS |
| s14_bagarre:01 narrator | 678.634 | -32.38 | -55.98 | 23.59 | PASS |
| s14_bagarre:02 narrator | 683.806 | -36.62 | -52.15 | 15.53 | PASS |
| s14_bagarre:03 narrator | 691.797 | -15.95 | -47.27 | 31.32 | PASS |
| s14_bagarre:04 zoubida | 694.178 | -31.26 | -48.48 | 17.22 | PASS |
| s14_bagarre:05 fatma | 697.644 | -29.61 | -54.66 | 25.05 | PASS |
| s14_bagarre:06 narrator | 700.778 | -33.04 | -45.41 | 12.37 | PASS |
| s14_bagarre:07 narrator | 710.255 | -17.61 | -39.77 | 22.16 | PASS |
| s14_bagarre:08 narrator | 719.853 | -22.20 | -53.52 | 31.32 | PASS |
| s15_fruits_secs:01 narrator | 726.249 | -46.53 | -59.53 | 13.00 | PASS |
| s15_fruits_secs:02 narrator | 733.853 | -35.18 | -63.79 | 28.61 | PASS |
| s15_fruits_secs:03 narrator | 739.518 | -37.89 | -63.81 | 25.92 | PASS |
| s15_fruits_secs:04 narrator | 753.433 | -35.57 | -61.04 | 25.47 | PASS |
| s15_fruits_secs:05 zoubida | 759.966 | -34.34 | -61.82 | 27.48 | PASS |
| s16_noir:01 narrator | 770.261 | -35.81 | -48.81 | 13.00 | PASS |
| s16_noir:02 narrator | 782.649 | -30.21 | -53.12 | 22.90 | PASS |
| s16_noir:03 narrator | 796.111 | -25.83 | -47.49 | 21.66 | PASS |
| s16_noir:04 narrator | 805.743 | -35.49 | -48.49 | 13.00 | PASS |
| s16_noir:05 narrator | 813.516 | -36.10 | -68.92 | 32.82 | PASS |
| s16_noir:06 narrator | 821.307 | -35.09 | -48.69 | 13.60 | PASS |
| s17_retour:01 narrator | 835.116 | -22.11 | -47.13 | 25.03 | PASS |
| s17_retour:02 narrator | 841.713 | -34.97 | -54.61 | 19.64 | PASS |
| s17_retour:03 father | 849.994 | -33.82 | -200.69 | 166.87 | PASS |
| s17_retour:04 zoubida | 854.321 | -36.71 | -200.69 | 163.98 | PASS |
| s17_retour:05 father | 858.183 | -33.83 | -200.69 | 166.86 | PASS |
| s17_retour:06 mohammed | 861.503 | -25.99 | -200.69 | 174.70 | PASS |
| s17_retour:07 father | 864.462 | -17.38 | -200.69 | 183.31 | PASS |
| s17_retour:08 mohammed | 866.725 | -20.51 | -200.69 | 180.18 | PASS |
| s17_retour:09 narrator | 869.046 | -17.38 | -42.75 | 25.37 | PASS |
| s17_retour:10 father | 875.902 | -23.34 | -42.81 | 19.47 | PASS |
| s17_retour:11 zoubida | 885.040 | -35.88 | -67.44 | 31.55 | PASS |
| s17_retour:12 father | 893.703 | -37.15 | -71.22 | 34.07 | PASS |
| s17_retour:13 narrator | 900.433 | -38.07 | -50.23 | 12.16 | PASS |
| s17_retour:14 zoubida | 907.377 | -34.95 | -66.26 | 31.30 | PASS |
| s18_cauchemar:01 narrator | 919.825 | -33.51 | -50.44 | 16.93 | PASS |
| s18_cauchemar:02 narrator | 933.721 | -28.68 | -51.48 | 22.81 | PASS |
| s18_cauchemar:03 narrator | 942.871 | -35.70 | -52.12 | 16.42 | PASS |
| s18_cauchemar:04 narrator | 952.096 | -31.79 | -48.19 | 16.40 | PASS |
| s18_cauchemar:05 narrator | 959.072 | -37.56 | -50.56 | 13.00 | PASS |
| s18_cauchemar:06 father | 972.724 | -34.79 | -49.81 | 15.02 | PASS |
| s18_cauchemar:07 narrator | 977.340 | -32.45 | -44.45 | 12.00 | PASS |
| s18_cauchemar:08 mohammed | 989.561 | -17.86 | -32.33 | 14.47 | PASS |
| s18_cauchemar:09 zoubida | 993.039 | -38.63 | -51.63 | 13.00 | PASS |
| s18_cauchemar:10 narrator | 1000.170 | -39.11 | -52.11 | 13.00 | PASS |
| s19_matin:01 father | 1009.889 | -35.22 | -200.69 | 165.47 | PASS |
| s19_matin:02 narrator | 1017.927 | -36.94 | -71.20 | 34.26 | PASS |
| s19_matin:03 father | 1025.291 | -38.25 | -200.69 | 162.44 | PASS |
| s19_matin:04 zoubida | 1030.610 | -33.94 | -200.69 | 166.75 | PASS |
| s19_matin:05 father | 1036.554 | -35.23 | -200.69 | 165.46 | PASS |
| s19_matin:06 zoubida | 1042.289 | -35.29 | -200.69 | 165.40 | PASS |
| s19_matin:07 father | 1049.897 | -41.95 | -200.69 | 158.74 | PASS |
| s19_matin:08 zoubida | 1054.384 | -32.71 | -200.69 | 167.98 | PASS |
| s19_matin:09 narrator | 1059.748 | -39.33 | -200.69 | 161.36 | PASS |
| s19_matin:10 narrator | 1068.249 | -33.61 | -200.69 | 167.08 | PASS |
| s20_aicha:01 narrator | 1080.556 | -14.31 | -47.73 | 33.42 | PASS |
| s20_aicha:02 narrator | 1087.350 | -24.08 | -47.69 | 23.61 | PASS |
| s20_aicha:03 narrator | 1100.023 | -18.22 | -44.88 | 26.66 | PASS |
| s20_aicha:04 zoubida | 1108.357 | -28.79 | -200.69 | 171.90 | PASS |
| s20_aicha:05 narrator | 1112.271 | -37.16 | -50.16 | 13.00 | PASS |
| s20_aicha:06 aicha | 1118.573 | -31.31 | -200.69 | 169.38 | PASS |
| s20_aicha:07 aicha | 1124.888 | -36.64 | -200.69 | 164.05 | PASS |
| s20_aicha:08 zoubida | 1137.116 | -34.19 | -200.69 | 166.50 | PASS |
| s20_aicha:09 narrator | 1147.040 | -30.60 | -46.64 | 16.04 | PASS |
| s21_fievre:01 narrator | 1156.631 | -41.78 | -200.69 | 158.91 | PASS |
| s21_fievre:02 narrator | 1167.090 | -33.10 | -47.15 | 14.05 | PASS |
| s21_fievre:03 zoubida | 1173.190 | -24.57 | -53.18 | 28.61 | PASS |
| s21_fievre:04 narrator | 1181.157 | -34.01 | -47.01 | 13.00 | PASS |
| s22_fiche:01 narrator | 1195.511 | -36.95 | -49.95 | 13.00 | PASS |
| s22_fiche:02 narrator | 1203.656 | -37.32 | -50.32 | 13.00 | PASS |
| s22_fiche:03 narrator | 1211.923 | -34.86 | -47.86 | 13.00 | PASS |
| s22_fiche:04 narrator | 1222.695 | -28.03 | -41.03 | 13.00 | PASS |
| s22_fiche:05 narrator | 1229.379 | -41.30 | -54.30 | 13.00 | PASS |

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

- Pass 0: 27 failures; worst -9.19 dB.
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
  - {"line": "s18_cauchemar:07", "window_start_s": 982.7, "margin_before_db": -2.019973159351302, "dominant_bus": "score", "bus_lufs_s": {"score": -29.861901268592955, "bed": -43.118384824304044, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -15.019973159351302, "margin_after_db": 8.354392181753468}
  - {"line": "s18_cauchemar:07", "window_start_s": 979.4, "margin_before_db": 8.354392181753468, "dominant_bus": "hits", "bus_lufs_s": {"score": -44.22399952412363, "bed": -59.643630781816555, "hits": -40.88113172181979}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -4.645607818246532, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 10.921695556568643}
  - {"line": "s18_cauchemar:07", "window_start_s": 979.4, "margin_before_db": 10.921695556568643, "dominant_bus": "score", "bus_lufs_s": {"score": -44.22399952412363, "bed": -59.643630781816555, "hits": -45.52668724686225}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.0783044434313567, "margin_after_db": 12.001703938971602}
  - {"line": "s18_cauchemar:09", "window_start_s": 997.299, "margin_before_db": 6.902245552156238, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.930386521290515, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.097754447843762, "margin_after_db": 12.999999587590715}
  - {"line": "s18_cauchemar:10", "window_start_s": 1001.9499999999999, "margin_before_db": 7.06181370941578, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.565161039660296, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.93818629058422, "margin_after_db": 12.999999737973447}
  - {"line": "s20_aicha:05", "window_start_s": 1113.031, "margin_before_db": 5.925320965299406, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -41.47701249168986}, "action": "attenuate_cue", "id": "child_whimper", "gain_db": -7.074679034700594, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.999999893983798}
  - {"line": "s21_fievre:04", "window_start_s": 1185.5269999999998, "margin_before_db": 9.06946209313125, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.472439949545006, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.93053790686875, "margin_after_db": 13.000000179095998}
  - {"line": "s22_fiche:01", "window_start_s": 1199.141, "margin_before_db": -9.187137190182945, "dominant_bus": "score", "bus_lufs_s": {"score": -26.15170972351696, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.187137190182945, "margin_after_db": 13.000000532226856}
  - {"line": "s22_fiche:02", "window_start_s": 1209.176, "margin_before_db": -5.622190752302, "dominant_bus": "score", "bus_lufs_s": {"score": -30.09528031709228, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -18.622190752302, "margin_after_db": 13.000000116124959}
  - {"line": "s22_fiche:03", "window_start_s": 1216.093, "margin_before_db": -3.722035590645522, "dominant_bus": "score", "bus_lufs_s": {"score": -29.52730355531239, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -16.722035590645522, "margin_after_db": 13.00000063998845}
  - {"line": "s22_fiche:04", "window_start_s": 1226.855, "margin_before_db": 6.746936922758628, "dominant_bus": "score", "bus_lufs_s": {"score": -33.171737177833414, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.253063077241372, "margin_after_db": 13.0000002429367}
  - {"line": "s22_fiche:05", "window_start_s": 1229.7389999999998, "margin_before_db": -5.896933418790958, "dominant_bus": "score", "bus_lufs_s": {"score": -33.801253077157305, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -18.896933418790958, "margin_after_db": 12.99999920337978}
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

- s07_lundi mohammed line 9: shout trim -1.0 dB.
- s10_roi mohammed line 2: shout trim -0.4 dB.
- s10_roi zoubida line 3: shout trim -0.9 dB.
- s10_roi rahma line 7: shout trim -0.8 dB.
- s10_roi femmes: four resampled/panned voices; single-take LUFS matched.
- s11_depart mohammed line 2: shout trim -3.0 dB.
- s11_depart zoubida line 3: shout trim -0.2 dB.
- s11_depart father line 7: shout trim -0.9 dB.
- s11_depart father: patio, wet 0.040.
- s11_depart kanza: patio, wet 0.040.
- s13_attente zoubida line 6: shout trim -1.0 dB.
- s14_bagarre zoubida line 4: shout trim -1.2 dB.
- s14_bagarre fatma line 5: shout trim -1.5 dB.
- s17_retour mohammed line 6: shout trim -3.0 dB.
- s19_matin zoubida line 4: shout trim -2.1 dB.
- s19_matin zoubida line 6: shout trim -0.7 dB.
- s20_aicha zoubida line 4: shout trim -0.1 dB.

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

Runtime: 1254.324 s. Render time: 581.7 s.
