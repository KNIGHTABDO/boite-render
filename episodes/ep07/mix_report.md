# Ep07 speech-first mix report

**Speech margin gate: PASS.** 179/179 lines >=12 dB; master -16.002 LUFS / -1.532 dBTP.

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
  "score_max_lufs_s": -14.633661386242501,
  "solo_max_lufs_s": -14.633661386242501,
  "solo_median_lufs_s": -19.774805648044474,
  "solo_windows": 248,
  "loudest_narrator_line_lufs": -11.349937334002828,
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
| s10_plans:01 narrator | 364.525 | -29.13 | -41.19 | 12.06 | PASS |
| s19_bain:03 mohammed | 945.068 | -29.48 | -41.56 | 12.08 | PASS |
| s08_menthe:03 narrator | 293.218 | -36.04 | -48.19 | 12.16 | PASS |
| s10_plans:03 narrator | 379.577 | -35.59 | -47.77 | 12.18 | PASS |
| s25_aicha:08 narrator | 1328.898 | -33.62 | -45.89 | 12.26 | PASS |
| s25_aicha:06 narrator | 1305.183 | -29.87 | -42.16 | 12.29 | PASS |
| s11_souk:07 narrator | 477.925 | -34.95 | -47.27 | 12.32 | PASS |
| s20_reveil:06 narrator | 1007.767 | -32.56 | -44.91 | 12.35 | PASS |
| s16_rasoir:09 narrator | 783.312 | -37.25 | -49.62 | 12.36 | PASS |
| s25_aicha:07 aicha | 1315.907 | -30.65 | -43.05 | 12.41 | PASS |

## Every voice line

| Line | t (s) | Voice LUFS-S | Other LUFS-S | Margin dB | Gate |
|---|---:|---:|---:|---:|---|
| s01_hook:01 narrator | 1.500 | -24.64 | -51.23 | 26.59 | PASS |
| s01_hook:02 narrator | 9.472 | -33.11 | -46.11 | 13.00 | PASS |
| s03_tambourins:01 narrator | 31.106 | -24.13 | -48.44 | 24.31 | PASS |
| s03_tambourins:02 narrator | 39.263 | -16.52 | -40.77 | 24.25 | PASS |
| s03_tambourins:03 narrator | 51.263 | -17.49 | -46.73 | 29.24 | PASS |
| s03_tambourins:04 narrator | 60.870 | -14.88 | -44.48 | 29.60 | PASS |
| s03_tambourins:05 narrator | 70.134 | -35.45 | -56.75 | 21.30 | PASS |
| s03_tambourins:06 narrator | 85.682 | -19.32 | -54.40 | 35.08 | PASS |
| s03_tambourins:07 zoubida | 96.103 | -14.31 | -200.69 | 186.39 | PASS |
| s04_chat:01 narrator | 102.463 | -11.25 | -59.66 | 48.42 | PASS |
| s04_chat:02 narrator | 110.966 | -27.09 | -42.53 | 15.44 | PASS |
| s05_hammoussa:01 zoubida | 122.785 | -26.73 | -200.69 | 173.96 | PASS |
| s05_hammoussa:02 narrator | 128.298 | -19.74 | -47.05 | 27.31 | PASS |
| s05_hammoussa:03 narrator | 133.553 | -32.69 | -200.69 | 168.01 | PASS |
| s05_hammoussa:04 narrator | 140.047 | -30.73 | -200.69 | 169.96 | PASS |
| s05_hammoussa:05 hammoussa | 143.359 | -28.10 | -200.69 | 172.59 | PASS |
| s06_lustres:01 narrator | 150.018 | -26.20 | -64.09 | 37.90 | PASS |
| s06_lustres:02 narrator | 157.625 | -39.67 | -52.22 | 12.56 | PASS |
| s06_lustres:03 narrator | 163.950 | -41.44 | -63.17 | 21.73 | PASS |
| s06_lustres:04 narrator | 176.253 | -33.54 | -62.02 | 28.48 | PASS |
| s06_lustres:05 narrator | 181.162 | -29.78 | -43.46 | 13.68 | PASS |
| s06_lustres:06 narrator | 194.148 | -25.22 | -47.16 | 21.94 | PASS |
| s06_lustres:07 narrator | 205.793 | -34.98 | -47.98 | 13.00 | PASS |
| s06_lustres:08 narrator | 212.507 | -28.20 | -41.20 | 13.00 | PASS |
| s06_lustres:09 narrator | 220.641 | -33.64 | -46.64 | 13.00 | PASS |
| s07_petrole:01 narrator | 230.325 | -40.21 | -200.69 | 160.48 | PASS |
| s07_petrole:02 vendeur | 240.313 | -26.66 | -200.69 | 174.03 | PASS |
| s07_petrole:03 narrator | 244.612 | -30.85 | -200.69 | 169.84 | PASS |
| s07_petrole:04 narrator | 247.903 | -32.09 | -200.69 | 168.60 | PASS |
| s07_petrole:05 narrator | 258.883 | -39.10 | -52.10 | 13.00 | PASS |
| s07_petrole:06 mohammed | 274.591 | -16.50 | -44.32 | 27.82 | PASS |
| s07_petrole:07 zoubida | 277.411 | -19.58 | -44.39 | 24.81 | PASS |
| s08_menthe:01 kanza | 282.811 | -26.98 | -200.69 | 173.71 | PASS |
| s08_menthe:02 zoubida | 290.805 | -14.24 | -200.69 | 186.45 | PASS |
| s08_menthe:03 narrator | 293.218 | -36.04 | -48.19 | 12.16 | PASS |
| s08_menthe:04 narrator | 303.608 | -15.12 | -53.62 | 38.50 | PASS |
| s08_menthe:05 narrator | 314.350 | -32.05 | -200.69 | 168.64 | PASS |
| s08_menthe:06 narrator | 318.810 | -36.73 | -200.69 | 163.96 | PASS |
| s09_escalier:01 narrator | 327.442 | -35.18 | -47.99 | 12.81 | PASS |
| s09_escalier:02 narrator | 338.021 | -37.89 | -50.89 | 13.00 | PASS |
| s09_escalier:03 zoubida | 345.256 | -26.96 | -66.30 | 39.34 | PASS |
| s09_escalier:04 voisine | 347.257 | -23.21 | -200.69 | 177.48 | PASS |
| s09_escalier:05 zoubida | 350.763 | -13.94 | -200.69 | 186.76 | PASS |
| s09_escalier:06 narrator | 352.103 | -38.69 | -200.69 | 162.00 | PASS |
| s10_plans:01 narrator | 364.525 | -29.13 | -41.19 | 12.06 | PASS |
| s10_plans:02 father | 370.354 | -34.79 | -47.79 | 13.00 | PASS |
| s10_plans:03 narrator | 379.577 | -35.59 | -47.77 | 12.18 | PASS |
| s10_plans:04 narrator | 394.955 | -24.65 | -200.69 | 176.04 | PASS |
| s10_plans:05 narrator | 399.340 | -27.06 | -49.01 | 21.95 | PASS |
| s11_souk:01 narrator | 412.663 | -42.04 | -55.04 | 13.00 | PASS |
| s11_souk:02 narrator | 423.382 | -40.01 | -53.01 | 13.00 | PASS |
| s11_souk:03 narrator | 440.727 | -33.15 | -46.15 | 13.00 | PASS |
| s11_souk:04 narrator | 447.104 | -36.02 | -49.02 | 13.00 | PASS |
| s11_souk:05 narrator | 458.156 | -38.90 | -51.90 | 13.00 | PASS |
| s11_souk:06 narrator | 468.767 | -40.17 | -53.17 | 13.00 | PASS |
| s11_souk:07 narrator | 477.925 | -34.95 | -47.27 | 12.32 | PASS |
| s11_souk:08 narrator | 489.073 | -34.86 | -200.69 | 165.83 | PASS |
| s12_barbier:01 narrator | 499.161 | -13.82 | -55.05 | 41.23 | PASS |
| s12_barbier:02 barber | 507.364 | -33.62 | -200.69 | 167.07 | PASS |
| s12_barbier:03 narrator | 520.395 | -36.96 | -49.96 | 13.00 | PASS |
| s12_barbier:04 narrator | 531.280 | -34.60 | -49.42 | 14.82 | PASS |
| s13_hammad:01 narrator | 543.077 | -19.69 | -40.37 | 20.68 | PASS |
| s13_hammad:02 hammad | 550.537 | -27.93 | -200.69 | 172.76 | PASS |
| s13_hammad:03 barber | 554.997 | -38.58 | -200.69 | 162.12 | PASS |
| s13_hammad:04 hammad | 562.395 | -35.11 | -200.69 | 165.58 | PASS |
| s13_hammad:05 barber | 571.496 | -34.80 | -47.33 | 12.52 | PASS |
| s13_hammad:06 hammad | 582.689 | -25.93 | -41.70 | 15.78 | PASS |
| s13_hammad:07 narrator | 587.894 | -20.78 | -40.50 | 19.72 | PASS |
| s14_larbi:01 barber | 597.898 | -35.49 | -48.49 | 13.00 | PASS |
| s14_larbi:02 barber | 605.627 | -36.61 | -53.63 | 17.03 | PASS |
| s14_larbi:03 barber | 615.765 | -39.88 | -200.69 | 160.81 | PASS |
| s14_larbi:04 barber | 626.704 | -34.68 | -200.69 | 166.01 | PASS |
| s14_larbi:05 narrator | 635.335 | -26.80 | -200.69 | 173.89 | PASS |
| s14_larbi:06 narrator | 638.588 | -38.95 | -200.69 | 161.74 | PASS |
| s15_lamrani:01 narrator | 653.559 | -36.60 | -200.69 | 164.09 | PASS |
| s15_lamrani:02 lamrani | 662.469 | -20.58 | -200.69 | 180.11 | PASS |
| s15_lamrani:03 barber | 664.544 | -31.99 | -200.69 | 168.70 | PASS |
| s15_lamrani:04 barber | 669.587 | -26.07 | -44.38 | 18.31 | PASS |
| s15_lamrani:05 narrator | 680.195 | -27.08 | -200.69 | 173.61 | PASS |
| s15_lamrani:06 barber | 689.127 | -31.36 | -49.18 | 17.82 | PASS |
| s15_lamrani:07 barber | 696.291 | -31.76 | -52.86 | 21.11 | PASS |
| s15_lamrani:08 lamrani | 699.437 | -22.18 | -49.43 | 27.25 | PASS |
| s15_lamrani:09 lamrani | 702.556 | -34.49 | -50.31 | 15.82 | PASS |
| s15_lamrani:10 barber | 710.822 | -32.24 | -44.86 | 12.62 | PASS |
| s15_lamrani:11 barber | 717.604 | -37.09 | -71.84 | 34.76 | PASS |
| s16_rasoir:01 barber | 732.218 | -31.29 | -200.69 | 169.40 | PASS |
| s16_rasoir:02 narrator | 737.108 | -37.28 | -50.28 | 13.00 | PASS |
| s16_rasoir:03 barber | 745.778 | -36.09 | -49.09 | 13.00 | PASS |
| s16_rasoir:04 lamrani | 756.884 | -36.81 | -49.81 | 13.00 | PASS |
| s16_rasoir:05 barber | 760.983 | -32.87 | -45.87 | 13.00 | PASS |
| s16_rasoir:06 father | 769.502 | -20.72 | -41.87 | 21.15 | PASS |
| s16_rasoir:07 barber | 771.883 | -32.42 | -45.42 | 13.00 | PASS |
| s16_rasoir:08 narrator | 777.141 | -33.84 | -46.81 | 12.97 | PASS |
| s16_rasoir:09 narrator | 783.312 | -37.25 | -49.62 | 12.36 | PASS |
| s16_rasoir:10 narrator | 793.018 | -33.34 | -46.34 | 13.00 | PASS |
| s16_rasoir:11 narrator | 800.861 | -35.39 | -50.35 | 14.95 | PASS |
| s16_rasoir:12 narrator | 805.747 | -35.39 | -200.69 | 165.30 | PASS |
| s17_rue:01 narrator | 816.473 | -33.94 | -200.69 | 166.75 | PASS |
| s17_rue:02 narrator | 820.222 | -36.07 | -200.69 | 164.62 | PASS |
| s17_rue:03 father | 824.680 | -30.55 | -200.69 | 170.15 | PASS |
| s17_rue:04 father | 828.012 | -34.00 | -200.69 | 166.69 | PASS |
| s17_rue:05 narrator | 835.495 | -38.51 | -51.51 | 13.00 | PASS |
| s17_rue:06 narrator | 843.462 | -25.92 | -39.64 | 13.72 | PASS |
| s18_concert:01 narrator | 853.414 | -9.62 | -40.71 | 31.10 | PASS |
| s18_concert:02 narrator | 862.007 | -22.12 | -69.55 | 47.43 | PASS |
| s18_concert:03 narrator | 872.439 | -16.25 | -41.79 | 25.54 | PASS |
| s18_concert:04 femmes | 881.439 | -21.12 | -43.78 | 22.66 | PASS |
| s18_concert:05 narrator | 885.093 | -33.52 | -46.04 | 12.52 | PASS |
| s18_concert:06 narrator | 890.425 | -37.86 | -50.86 | 13.00 | PASS |
| s18_concert:07 narrator | 897.477 | -17.67 | -41.79 | 24.13 | PASS |
| s18_concert:08 narrator | 903.631 | -32.40 | -45.10 | 12.70 | PASS |
| s18_concert:09 narrator | 916.434 | -16.92 | -42.40 | 25.48 | PASS |
| s19_bain:01 narrator | 925.296 | -33.73 | -46.73 | 13.00 | PASS |
| s19_bain:02 narrator | 934.635 | -34.09 | -46.74 | 12.64 | PASS |
| s19_bain:03 mohammed | 945.068 | -29.48 | -41.56 | 12.08 | PASS |
| s19_bain:04 narrator | 949.755 | -37.09 | -50.09 | 13.00 | PASS |
| s20_reveil:01 narrator | 965.976 | -52.09 | -200.69 | 148.60 | PASS |
| s20_reveil:02 zoubida | 979.449 | -34.41 | -200.69 | 166.29 | PASS |
| s20_reveil:03 narrator | 987.396 | -28.08 | -51.40 | 23.32 | PASS |
| s20_reveil:04 father | 996.622 | -38.91 | -200.69 | 161.78 | PASS |
| s20_reveil:05 narrator | 1002.351 | -29.22 | -45.81 | 16.59 | PASS |
| s20_reveil:06 narrator | 1007.767 | -32.56 | -44.91 | 12.35 | PASS |
| s20_reveil:07 narrator | 1020.484 | -12.77 | -200.69 | 187.92 | PASS |
| s20_reveil:08 narrator | 1023.592 | -32.02 | -200.69 | 168.67 | PASS |
| s21_babouches:01 narrator | 1032.792 | -33.89 | -200.69 | 166.80 | PASS |
| s21_babouches:02 narrator | 1042.844 | -37.25 | -54.00 | 16.75 | PASS |
| s21_babouches:03 narrator | 1047.274 | -36.12 | -52.12 | 16.00 | PASS |
| s21_babouches:04 narrator | 1054.434 | -36.37 | -200.69 | 164.33 | PASS |
| s21_babouches:05 narrator | 1063.891 | -35.59 | -60.18 | 24.59 | PASS |
| s22_feerie:01 narrator | 1077.206 | -35.89 | -48.89 | 13.00 | PASS |
| s22_feerie:02 narrator | 1086.253 | -37.61 | -50.61 | 13.00 | PASS |
| s22_feerie:03 narrator | 1098.897 | -35.90 | -48.90 | 13.00 | PASS |
| s22_feerie:04 narrator | 1108.528 | -34.70 | -47.70 | 13.00 | PASS |
| s22_feerie:05 narrator | 1113.313 | -36.52 | -53.93 | 17.41 | PASS |
| s22_feerie:06 narrator | 1120.254 | -37.06 | -54.38 | 17.32 | PASS |
| s22_feerie:07 narrator | 1127.291 | -33.34 | -55.48 | 22.14 | PASS |
| s22_feerie:08 narrator | 1133.679 | -34.24 | -56.36 | 22.11 | PASS |
| s22_feerie:09 narrator | 1144.880 | -30.63 | -43.63 | 13.00 | PASS |
| s23_aube:01 narrator | 1161.692 | -29.74 | -200.69 | 170.95 | PASS |
| s23_aube:02 narrator | 1172.951 | -32.02 | -47.18 | 15.17 | PASS |
| s23_aube:03 fqih | 1180.178 | -36.31 | -49.31 | 13.00 | PASS |
| s23_aube:04 eleves | 1188.796 | -41.57 | -54.57 | 13.00 | PASS |
| s23_aube:05 narrator | 1193.269 | -32.22 | -45.22 | 13.00 | PASS |
| s23_aube:06 narrator | 1200.863 | -34.14 | -47.14 | 13.00 | PASS |
| s23_aube:07 fqih | 1207.543 | -16.09 | -35.55 | 19.45 | PASS |
| s23_aube:08 narrator | 1210.267 | -27.26 | -40.26 | 13.00 | PASS |
| s23_aube:09 narrator | 1214.602 | -21.78 | -42.50 | 20.72 | PASS |
| s24_idriss:01 narrator | 1223.653 | -33.48 | -46.48 | 13.00 | PASS |
| s24_idriss:02 narrator | 1230.235 | -34.37 | -47.37 | 13.00 | PASS |
| s24_idriss:03 narrator | 1236.407 | -29.95 | -42.95 | 13.00 | PASS |
| s24_idriss:04 narrator | 1247.645 | -30.46 | -46.45 | 15.99 | PASS |
| s24_idriss:05 narrator | 1257.093 | -33.79 | -46.79 | 13.00 | PASS |
| s25_aicha:01 narrator | 1266.318 | -27.77 | -42.33 | 14.56 | PASS |
| s25_aicha:02 narrator | 1271.575 | -14.33 | -56.66 | 42.33 | PASS |
| s25_aicha:03 narrator | 1281.886 | -38.90 | -200.69 | 161.79 | PASS |
| s25_aicha:04 zoubida | 1287.911 | -25.12 | -200.69 | 175.57 | PASS |
| s25_aicha:05 narrator | 1294.398 | -34.04 | -200.69 | 166.65 | PASS |
| s25_aicha:06 narrator | 1305.183 | -29.87 | -42.16 | 12.29 | PASS |
| s25_aicha:07 aicha | 1315.907 | -30.65 | -43.05 | 12.41 | PASS |
| s25_aicha:08 narrator | 1328.898 | -33.62 | -45.89 | 12.26 | PASS |
| s25_aicha:09 zoubida | 1337.948 | -32.28 | -51.01 | 18.74 | PASS |
| s25_aicha:10 aicha | 1340.631 | -15.17 | -76.44 | 61.26 | PASS |
| s25_aicha:11 zoubida | 1348.767 | -33.49 | -200.69 | 167.20 | PASS |
| s25_aicha:12 aicha | 1353.961 | -13.12 | -200.69 | 187.57 | PASS |
| s25_aicha:13 narrator | 1355.506 | -19.78 | -200.69 | 180.91 | PASS |
| s25_aicha:14 zoubida | 1359.296 | -31.23 | -200.69 | 169.47 | PASS |
| s25_aicha:15 aicha | 1363.369 | -45.03 | -200.69 | 155.66 | PASS |
| s25_aicha:16 narrator | 1373.868 | -36.70 | -200.69 | 163.99 | PASS |
| s25_aicha:17 narrator | 1382.425 | -35.77 | -200.69 | 164.92 | PASS |
| s25_aicha:18 narrator | 1389.155 | -15.30 | -40.76 | 25.46 | PASS |
| s25_aicha:19 narrator | 1399.034 | -35.66 | -48.66 | 13.00 | PASS |
| s26_fin:01 narrator | 1411.646 | -29.41 | -42.41 | 13.00 | PASS |
| s26_fin:02 narrator | 1420.122 | -32.67 | -45.67 | 13.00 | PASS |
| s26_fin:03 narrator | 1425.608 | -35.44 | -48.44 | 13.00 | PASS |
| s26_fin:04 narrator | 1435.146 | -36.65 | -49.65 | 13.00 | PASS |
| s27_fiche:01 narrator | 1448.453 | -27.01 | -40.01 | 13.00 | PASS |
| s27_fiche:02 narrator | 1454.846 | -34.86 | -47.86 | 13.00 | PASS |
| s27_fiche:03 narrator | 1461.839 | -39.79 | -52.79 | 13.00 | PASS |
| s27_fiche:04 narrator | 1478.444 | -37.18 | -50.18 | 13.00 | PASS |

## Voice source checks

Noise: median 10 ms frame RMS in contiguous pauses >=150 ms below peak-35 dB, discarding 40 ms at each edge; fallback: 1st-percentile frame RMS. Flag >-60 dBFS. Clipping: |sample| >=0.999. Clicks: jump >max(0.25, 8×99.5th-percentile jump). These are screening estimates, not word alignment or a breath classifier. Takes flagged on the raw file get the breath expander (-15 dB in pauses) and are re-measured after it; the gate uses the treated value.

| Scene / speaker / take | Gap noise dBFS | Clipped samples | Click candidates |
|---|---:|---:|---:|
| s15_lamrani / barber / 7308633a2fd6.wav | -59.43 | 0 | 0 |

Offenders: 1; noise-flagged takes: 1. Full per-take results are in mix_report.json.

## Placement / sources

Word timing uses measured 10 ms activity islands; no forced word alignment is supplied. Hits are not ducked; auto-fix may move or statically trim individual cues.

Missing IDs: none. Duration-classified IDs (explicit >1.5 s fallback): ['cat_yowl', 'chair_wood_creak', 'cloth_rustle_stiff', 'cloth_tear', 'curtain_rustle', 'donkey_bray', 'door_wood_old', 'flute_ney_short', 'footsteps_stairs', 'footsteps_stone', 'kettle_whistle', 'kids_cheer', 'ladder_wood_creak', 'leather_strap', 'leather_tap', 'man_groan', 'man_laugh_neigh', 'pigeons_wings', 'powder_hiss', 'rattle_grelots', 'seed_crunch', 'toy_trumpet', 'water_drip', 'water_pour_glass'].

Hard-silence windows (beds zero, 100 ms outside fades): [(352.118, 363.125), (800.077, 800.86), (1358.662, 1389.15)]. Each map timestamp holds until the next sound cue or scene end; breaths/hits remain.

### Auto-fix actions

- Pass 0: 63 failures; worst -9.63 dB.
  - {"line": "s01_hook:02", "window_start_s": 14.152, "margin_before_db": 5.775143192143272, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.129288293263905, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.224856807856728, "margin_after_db": 12.999999772651815}
  - {"line": "s06_lustres:02", "window_start_s": 158.205, "margin_before_db": 6.748813011945572, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -60.68566143949603, "hits": -44.75819681106226}, "action": "attenuate_cue", "id": "cloth_tear", "gain_db": -6.251186988054428, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.559526926748276}
  - {"line": "s06_lustres:07", "window_start_s": 208.663, "margin_before_db": -1.6749349405276384, "dominant_bus": "score", "bus_lufs_s": {"score": -31.591608414675957, "bed": -55.054556262655765, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -14.674934940527638, "margin_after_db": 13.000000142540685}
  - {"line": "s06_lustres:08", "window_start_s": 213.067, "margin_before_db": 1.3046275159177405, "dominant_bus": "score", "bus_lufs_s": {"score": -28.34402205629937, "bed": -36.91929576103323, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.69537248408226, "margin_after_db": 13.000000148225066}
  - {"line": "s06_lustres:09", "window_start_s": 223.801, "margin_before_db": -0.1245998101111283, "dominant_bus": "score", "bus_lufs_s": {"score": -31.77813545440867, "bed": -54.75051478414216, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -13.124599810111128, "margin_after_db": 12.999999404577675}
  - {"line": "s07_petrole:05", "window_start_s": 265.65299999999996, "margin_before_db": 5.642450867397692, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.99235721856154, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.357549132602308, "margin_after_db": 13.000000135740194}
  - {"line": "s09_escalier:01", "window_start_s": 329.60200000000003, "margin_before_db": 11.711708352123644, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.141634471440305, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -1.2882916478763562, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.805839373671986}
  - {"line": "s09_escalier:02", "window_start_s": 338.581, "margin_before_db": 9.866210450777928, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -46.00699025321221, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -3.1337895492220724, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 10.634814114829929}
  - {"line": "s09_escalier:02", "window_start_s": 338.581, "margin_before_db": 10.634814114829929, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -46.77559391726421, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.365185885170071, "margin_after_db": 12.999999900050682}
  - {"line": "s10_plans:02", "window_start_s": 373.514, "margin_before_db": 9.83636220574931, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.875375677200886, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.1636377942506897, "margin_after_db": 13.00000036121056}
  - {"line": "s10_plans:03", "window_start_s": 386.397, "margin_before_db": 3.983626076147303, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.91851865679162, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -9.016373923852697, "margin_after_db": 7.229445962999627}
  - {"line": "s10_plans:03", "window_start_s": 383.697, "margin_before_db": 7.229445962999627, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -51.7027095653667, "hits": -41.482986018479856}, "action": "nudge_cue", "id": "razor_strop", "from_s": 383.52, "to_s": 383.792, "shift_ms": 271.99999999999136, "margin_after_db": 8.664004725487658}
  - {"line": "s10_plans:03", "window_start_s": 383.697, "margin_before_db": 8.664004725487658, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -51.7027095653667, "hits": -43.0706712736564}, "action": "attenuate_cue", "id": "razor_strop", "gain_db": -4.335995274512342, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.178571857630857}
  - {"line": "s11_souk:01", "window_start_s": 415.443, "margin_before_db": -9.320061497060838, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -30.962431750007394, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.320061497060838, "margin_after_db": 12.999999121674264}
  - {"line": "s11_souk:02", "window_start_s": 428.402, "margin_before_db": 5.34838228035445, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.60397041517947, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.65161771964555, "margin_after_db": 12.999999599792247}
  - {"line": "s11_souk:03", "window_start_s": 441.787, "margin_before_db": 11.368235276988234, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.76810985126834, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.6317647230117664, "margin_after_db": 12.9999998141524}
  - {"line": "s11_souk:04", "window_start_s": 454.56399999999996, "margin_before_db": 7.907756447631591, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.177877494678526, "hits": -83.42937779245128}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.092243552368409, "margin_after_db": 12.999946748203214}
  - {"line": "s11_souk:05", "window_start_s": 460.276, "margin_before_db": 4.974785903394249, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.11602055989279, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -8.025214096605751, "margin_after_db": 12.99999985796697}
  - {"line": "s11_souk:06", "window_start_s": 475.127, "margin_before_db": 3.3589235866412253, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.77171214752982, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -9.641076413358775, "margin_after_db": 13.000000117590439}
  - {"line": "s11_souk:07", "window_start_s": 482.08500000000004, "margin_before_db": 11.145072647425991, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -44.34512242974919, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -1.854927352574009, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.947388084493596}
  - {"line": "s11_souk:07", "window_start_s": 482.08500000000004, "margin_before_db": 11.947388084493596, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.147437866816794, "hits": -200.691}, "action": "attenuate_cue", "id": "whispers_group", "gain_db": -1.0526119155064038, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.318428644235212}
  - {"line": "s12_barbier:03", "window_start_s": 523.175, "margin_before_db": 0.13034466099950492, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.33219626792401, "hits": -200.691}, "action": "attenuate_cue", "id": "men_laughing_small_group", "gain_db": -12.869655339000495, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.999998675106582}
  - {"line": "s13_hammad:05", "window_start_s": 577.936, "margin_before_db": 8.570406722323725, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.908650093208266, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.429593277676275, "margin_after_db": 12.524894364489846}
  - {"line": "s14_larbi:01", "window_start_s": 599.988, "margin_before_db": 3.1341732323624782, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -200.691, "hits": -36.87161277285718}, "action": "attenuate_cue", "id": "metal_clinks", "gain_db": -9.865826767637522, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 13.000000051111904}
  - {"line": "s14_larbi:02", "window_start_s": 605.837, "margin_before_db": 8.663349784755805, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -51.74131434838899, "hits": -40.17974729700949}, "action": "nudge_cue", "id": "razor_strop", "from_s": 605.63, "to_s": 605.352, "shift_ms": -278.00000000002, "margin_after_db": 17.02728255987612}
  - {"line": "s16_rasoir:02", "window_start_s": 740.8779999999999, "margin_before_db": 9.583359642122595, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.11002447666856, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.416640357877405, "margin_after_db": 12.999999610063277}
  - {"line": "s16_rasoir:03", "window_start_s": 750.038, "margin_before_db": 11.275495658177228, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.607188763541394, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.7245043418227723, "margin_after_db": 13.000000350325962}
  - {"line": "s16_rasoir:04", "window_start_s": 758.754, "margin_before_db": 4.453025523532389, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -39.50932072331351, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -8.54697447646761, "margin_after_db": 12.999999757003486}
  - {"line": "s16_rasoir:05", "window_start_s": 766.443, "margin_before_db": 10.6216725200565, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.741653000223494, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.3783274799435006, "margin_after_db": 12.999999786268603}
  - {"line": "s16_rasoir:07", "window_start_s": 772.653, "margin_before_db": 7.213526829860584, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.87968599704137, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.786473170139416, "margin_after_db": 12.999999559725822}
  - {"line": "s16_rasoir:08", "window_start_s": 779.7009999999999, "margin_before_db": 6.916584192178874, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -39.008037059129066, "hits": -64.74740600135729}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.083415807821126, "margin_after_db": 12.968382538601865}
  - {"line": "s16_rasoir:09", "window_start_s": 785.202, "margin_before_db": 5.664440075247484, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.49257154991652, "hits": -44.87434431189462}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.335559924752516, "margin_after_db": 8.429337071859472}
  - {"line": "s16_rasoir:09", "window_start_s": 785.202, "margin_before_db": 8.429337071859472, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -50.828131046748155, "hits": -44.87434431189462}, "action": "attenuate_cue", "id": "razor_strop", "gain_db": -4.570662928140528, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.61744357055229}
  - {"line": "s16_rasoir:09", "window_start_s": 785.202, "margin_before_db": 11.61744357055229, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -50.828131046748155, "hits": -49.445007252700606}, "action": "attenuate_cue", "id": "razor_strop", "gain_db": -1.3825564294477104, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.36413072832984}
  - {"line": "s16_rasoir:10", "window_start_s": 798.5980000000001, "margin_before_db": 10.335223848457183, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.91649282750264, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.664776151542817, "margin_after_db": 12.999999706179047}
  - {"line": "s17_rue:05", "window_start_s": 837.045, "margin_before_db": 8.782322239992922, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -45.5378836716764, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.217677760007078, "margin_after_db": 13.000000025441452}
  - {"line": "s18_concert:05", "window_start_s": 885.3729999999999, "margin_before_db": 7.886797097059155, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -39.65291692583925, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -5.113202902940845, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 9.913917312751938}
  - {"line": "s18_concert:05", "window_start_s": 885.3729999999999, "margin_before_db": 9.913917312751938, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.68003714153203, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -3.0860826872480622, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.946399148083803}
  - {"line": "s18_concert:05", "window_start_s": 885.3729999999999, "margin_before_db": 11.946399148083803, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.7125189768639, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -1.0536008519161975, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.523205694155063}
  - {"line": "s18_concert:06", "window_start_s": 892.8349999999999, "margin_before_db": 5.663917330079201, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.76612476109304, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.336082669920799, "margin_after_db": 12.99999968158238}
  - {"line": "s18_concert:08", "window_start_s": 907.111, "margin_before_db": 5.1590960115266, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.80142626729519, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -7.8409039884734, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.945748639057754}
  - {"line": "s18_concert:08", "window_start_s": 907.111, "margin_before_db": 11.945748639057754, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.588078894826495, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -1.0542513609422457, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.701713930890698}
  - {"line": "s19_bain:01", "window_start_s": 929.056, "margin_before_db": 9.625824464789773, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.60492104706006, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.3741755352102274, "margin_after_db": 13.00000009622449}
  - {"line": "s19_bain:02", "window_start_s": 940.605, "margin_before_db": -2.197459112734613, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.663664039740354, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -15.197459112734613, "margin_after_db": 10.353293616105475}
  - {"line": "s19_bain:02", "window_start_s": 935.705, "margin_before_db": 10.353293616105475, "dominant_bus": "hits", "bus_lufs_s": {"score": -200.691, "bed": -52.51791632946886, "hits": -43.14040568461304}, "action": "attenuate_cue", "id": "water_bucket_splash", "gain_db": -2.646706383894525, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.64449895386793}
  - {"line": "s19_bain:03", "window_start_s": 946.328, "margin_before_db": 11.026782858959912, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.058903500163, "hits": -42.63905139748048}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.973217141040088, "margin_after_db": 12.080200391945787}
  - {"line": "s19_bain:04", "window_start_s": 955.835, "margin_before_db": 1.6665705897460938, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.002330988068906, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.333429410253906, "margin_after_db": 13.000000878356566}
  - {"line": "s20_reveil:06", "window_start_s": 1008.6370000000001, "margin_before_db": 5.917771989232243, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.884291909619165, "hits": -50.54759876437868}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.082228010767757, "margin_after_db": 12.345644059902263}
  - {"line": "s22_feerie:01", "window_start_s": 1079.0059999999999, "margin_before_db": -3.2116960929206364, "dominant_bus": "score", "bus_lufs_s": {"score": -30.921063325618587, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -16.211696092920636, "margin_after_db": 13.00000060616022}
  - {"line": "s22_feerie:02", "window_start_s": 1090.6129999999998, "margin_before_db": -6.501613664343779, "dominant_bus": "score", "bus_lufs_s": {"score": -29.370475724598062, "bed": -54.157352860583245, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -19.50161366434378, "margin_after_db": 12.999999897925619}
  - {"line": "s22_feerie:03", "window_start_s": 1101.7669999999998, "margin_before_db": -4.295943700782928, "dominant_bus": "score", "bus_lufs_s": {"score": -29.85978923636065, "bed": -53.25986605111679, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -17.295943700782928, "margin_after_db": 13.000000928996897}
  - {"line": "s22_feerie:04", "window_start_s": 1110.488, "margin_before_db": -0.3303653874469248, "dominant_bus": "score", "bus_lufs_s": {"score": -32.63565518585275, "bed": -51.23356805575021, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -13.330365387446925, "margin_after_db": 12.999999770529321}
  - {"line": "s22_feerie:09", "window_start_s": 1156.65, "margin_before_db": 7.327325537023583, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.198717262782594, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.672674462976417, "margin_after_db": 13.000000009684683}
  - {"line": "s23_aube:03", "window_start_s": 1184.6380000000001, "margin_before_db": 2.3381726197917274, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.89068030381702, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -10.661827380208273, "margin_after_db": 13.000000013540586}
  - {"line": "s23_aube:04", "window_start_s": 1189.756, "margin_before_db": 7.46661889701052, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -47.28148828156756, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.53338110298948, "margin_after_db": 12.999999737959754}
  - {"line": "s23_aube:05", "window_start_s": 1197.849, "margin_before_db": 11.535895403254376, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.99817165429655, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.4641045967456243, "margin_after_db": 12.999999867239548}
  - {"line": "s23_aube:06", "window_start_s": 1204.123, "margin_before_db": 4.941452672649341, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.325442040907674, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -8.05854732735066, "margin_after_db": 12.999999532584852}
  - {"line": "s23_aube:08", "window_start_s": 1212.047, "margin_before_db": 10.347795013421102, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -35.85008385014332, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -2.652204986578898, "margin_after_db": 13.000000092047625}
  - {"line": "s24_idriss:01", "window_start_s": 1224.113, "margin_before_db": 6.003863799357365, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.72765397603952, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.996136200642635, "margin_after_db": 13.000000011087419}
  - {"line": "s24_idriss:02", "window_start_s": 1231.2949999999998, "margin_before_db": -1.3564309213240584, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -31.263746807157442, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -14.356430921324058, "margin_after_db": 12.99999984747253}
  - {"line": "s24_idriss:03", "window_start_s": 1243.547, "margin_before_db": 1.1775216080423299, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -29.37088356956033, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -11.82247839195767, "margin_after_db": 13.000000573312299}
  - {"line": "s24_idriss:05", "window_start_s": 1260.153, "margin_before_db": 5.266180132685335, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -37.30055312481998, "hits": -200.691}, "action": "attenuate_cue", "id": "prayer_murmur_man", "gain_db": -7.733819867314665, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 9.965359594800411}
  - {"line": "s24_idriss:05", "window_start_s": 1260.153, "margin_before_db": 9.965359594800411, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -41.99973258693505, "hits": -200.691}, "action": "attenuate_cue", "id": "prayer_murmur_man", "gain_db": -3.034640405199589, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.151623513302013}
  - {"line": "s24_idriss:05", "window_start_s": 1260.153, "margin_before_db": 11.151623513302013, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.185996505436655, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -1.8483764866979868, "margin_after_db": 13.000000086164412}
  - {"line": "s25_aicha:06", "window_start_s": 1306.143, "margin_before_db": 8.567960510794283, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -36.68348336671163, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -4.432039489205717, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.294620399018601}
  - {"line": "s25_aicha:08", "window_start_s": 1330.7679999999998, "margin_before_db": 8.21027797776128, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -40.07795886762236, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -4.7897220222387205, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 11.47241032557168}
  - {"line": "s25_aicha:08", "window_start_s": 1330.7679999999998, "margin_before_db": 11.47241032557168, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.34009121543276, "hits": -200.691}, "action": "attenuate_cue", "id": "women_laughing_group", "gain_db": -1.5275896744283202, "reason": "No improving whole-cue gap within +/-400 ms", "margin_after_db": 12.263486576705063}
  - {"line": "s25_aicha:19", "window_start_s": 1406.114, "margin_before_db": 6.29479125778991, "dominant_bus": "score", "bus_lufs_s": {"score": -40.1966193210461, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -6.70520874221009, "margin_after_db": 13.000000198537059}
  - {"line": "s26_fin:01", "window_start_s": 1413.146, "margin_before_db": 9.092463771396279, "dominant_bus": "score", "bus_lufs_s": {"score": -38.01554728046368, "bed": -42.83718727810502, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.907536228603721, "margin_after_db": 13.000000375448504}
  - {"line": "s26_fin:02", "window_start_s": 1421.592, "margin_before_db": 7.752377739014069, "dominant_bus": "score", "bus_lufs_s": {"score": -40.98373451398744, "bed": -42.56835286367503, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -5.247622260985931, "margin_after_db": 13.000000861460794}
  - {"line": "s26_fin:03", "window_start_s": 1426.568, "margin_before_db": 9.441912430442187, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -43.12638700811394, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -3.558087569557813, "margin_after_db": 12.999999973914328}
  - {"line": "s26_fin:04", "window_start_s": 1442.306, "margin_before_db": 8.044874402348093, "dominant_bus": "bed", "bus_lufs_s": {"score": -200.691, "bed": -42.94404185974829, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -4.955125597651907, "margin_after_db": 13.000000099708984}
  - {"line": "s27_fiche:01", "window_start_s": 1449.5529999999999, "margin_before_db": 5.012514785235652, "dominant_bus": "score", "bus_lufs_s": {"score": -30.265284404632602, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -7.987485214764348, "margin_after_db": 13.000000438531238}
  - {"line": "s27_fiche:02", "window_start_s": 1455.606, "margin_before_db": -5.029259186142983, "dominant_bus": "score", "bus_lufs_s": {"score": -28.075995985029014, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -18.029259186142983, "margin_after_db": 12.999998728875894}
  - {"line": "s27_fiche:03", "window_start_s": 1465.229, "margin_before_db": -9.633213934297608, "dominant_bus": "score", "bus_lufs_s": {"score": -28.399322548861868, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -22.633213934297608, "margin_after_db": 12.999999721520197}
  - {"line": "s27_fiche:04", "window_start_s": 1481.914, "margin_before_db": -4.578281550401034, "dominant_bus": "score", "bus_lufs_s": {"score": -30.84921199480093, "bed": -200.691, "hits": -200.691}, "action": "attenuate_buses", "buses": ["score", "bed"], "gain_db": -17.578281550401034, "margin_after_db": 12.999999385323171}
- Pass 1: 0 failures; worst 12.06 dB.

### Hit nudges

- b004 tambourine_hit: 31.207 -> 31.191 s (-16.4 ms)
- b016 metal_clinks: 195.424 -> 195.403 s (-20.6 ms)
- b016 child_whimper: 194.217 -> 194.203 s (-13.9 ms)
- b021 man_cough: 258.960 -> 258.948 s (-12.4 ms)
- b021 match_strike: 259.029 -> 258.948 s (-81.5 ms)
- b037a toy_trumpet: 423.546 -> 423.497 s (-49.3 ms)
- b040 cup_suction: 499.346 -> 499.306 s (-40.0 ms)
- b059 razor_strop: 777.200 -> 777.196 s (-4.0 ms)
- b059a razor_strop: 784.930 -> 784.947 s (+17.0 ms)
- b061 child_breath_in: 801.357 -> 801.356 s (-0.6 ms)
- b068a darbouka_hit: 902.336 -> 902.302 s (-34.4 ms)
- b069 tambourine_hit: 903.727 -> 903.706 s (-21.4 ms)
- b094a kisses_cheek: 1271.760 -> 1271.690 s (-70.4 ms)

### Unresolved hit placement

[]

### Voice treatment

- s03_tambourins zoubida line 7: shout trim -0.3 dB.
- s05_hammoussa zoubida line 1: shout trim -2.6 dB.
- s05_hammoussa zoubida: patio, wet 0.040.
- s05_hammoussa hammoussa line 5: shout trim -1.4 dB.
- s07_petrole vendeur line 2: shout trim -2.3 dB.
- s07_petrole vendeur: street, wet 0.064.
- s07_petrole mohammed line 6: shout trim -0.4 dB.
- s08_menthe kanza: patio, wet 0.048.
- s08_menthe zoubida line 2: shout trim -0.9 dB.
- s09_escalier zoubida: small_room, wet 0.060.
- s09_escalier voisine line 4: shout trim -1.9 dB.
- s09_escalier voisine: small_room, wet 0.060.
- s09_escalier zoubida: small_room, wet 0.060.
- s18 femmes: four resampled/panned voices; single-take LUFS matched.
- s19_bain mohammed line 3: shout trim -1.8 dB.
- s23_aube eleves line 4: shout trim -0.1 dB.
- s25_aicha zoubida line 4: shout trim -0.3 dB.
- s25_aicha aicha line 7: shout trim -0.1 dB.
- s25_aicha zoubida line 11: shout trim -0.4 dB.

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

Runtime: 1498.350 s. Render time: 181.7 s.
