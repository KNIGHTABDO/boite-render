#!/usr/bin/env python3
"""Builds beats.json from script.json + the per-line annotations below (one beat per script line, same order).
   python3 episodes/ep07/mk_beats.py && python3 tools/lint_beats.py episodes/ep07/beats.json --cast episodes/ep07/cast.json
Extra keys (ignored by lint, read by staging, the Foley cue sheet and QA):
   cam    camera setup on that set (master / reverse / pov / low / high / ots): a new cam = a new plate angle (R5)
   pov    whose point of view the shot is (R4)
   ins    2D macro inserts cut into the line: [(what, seconds)] (R6, hands-on props)
   sfx    Foley cues for the line: ids from audio/foley/manifest.json, '@word' = sync to that word (R9)
   cut    grammar into this shot: hard / match / J (sound first) / L (sound carries over) / smash (R4)
   label  on-screen label at a first appearance (R13); hold = designed hold (s, reason)"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))


def T(size, room, cast, props, visual, **kw):   # 3D beat
    return dict(mode="3d", size=size, room=room, cast=cast, props=props, visual=visual, **kw)


def P(reason, props, visual, **kw):             # painting beat
    return dict(mode="painting", reason=reason, props=props, visual=visual, **kw)


KIDS = ["kid1", "kid2", "kid3"]

A = {
 # ============================================================ COLD OPEN
 "s01_cold": [
  T("CU", "barbier", ["mohammed"], ["serviette", "rasoir"], "Pre-roll 2.2 s on black: only the razor on the oily stone, shhk... shhk. Then ECU insert of the ebony razor stroking the stone; cut to a CU of Mohammed (front, yaw < 30°) wrapped to the chin in a red-and-yellow striped towel, eyes huge; behind him the barber's mouth talks, out of focus.",
    cam="pov_mirror", pov="mohammed", peak=True, cut="J", ins=[("rasoir_pierre", 1.6)],
    sfx=["razor_strop x4 (ticking clock)", "barber voice muffled + low drone rising"], badge="CHAPITRE VII · La Boîte à merveilles @0:03"),
  T("CU", "barbier", ["mohammed"], ["rasoir"], "The blade touches the nape (insert); SMASH: a 0.8 s flash of the Msid façade ablaze with coloured lights, then black and total silence on 'la plus belle nuit'.",
    cam="pov_mirror", pov="mohammed", cut="smash", ins=[("lame_nuque", 0.7), ("flash_facade_feerie", 0.8)], sfx=["silence at the touch", "breath in"]),
 ],
 # ============================================================ ACT I: J-2
 "s03_tambourins": [
  T("M", "chambre", ["zoubida", "zineb"], ["bendir", "tambourin"], "Card DEUX JOURS AVANT L'ACHOURA burns in on the first bendir hit. Zoubida weighs a goatskin bendir, taps it; on the balcony behind, Zineb waits with a cheap little tambourine.",
    cam="master", cut="hard", ins=[("grappes_tambourins", 1.2)], sfx=["bendir_hit @tambourins", "women tuning tambourines, off-screen"], action="strike"),
  T("CU", "chambre", ["zoubida"], ["bendir"], "Zoubida plays: deep strokes and dry strokes, her face lit up, eyes half closed (low angle, window light).",
    cam="low", sfx=["bendir_hit pattern synced to 'graves' / 'secs'"], action="strike"),
  T("M", "terrasse_rampe", ["zineb", "mohammed"], ["tambourin", "trompette"], "Zineb bangs her tambourine like a deaf girl; reverse: Mohammed lifts his painted tin trumpet and blows; the sound cracks like an alarm.",
    cam="reverse", sfx=["tambourine_hit (off-beat)", "toy_trumpet @alarme", "toy_trumpet strangled @sanglot"], action="blow"),
  T("M", "chambre", ["zoubida", "mohammed"], ["trompette"], "Zoubida, hands over her ears, points him to the stairs up to the terrace.", cam="master", action="point"),
 ],
 "s04_chat": [
  T("M", "terrasse", ["mohammed", "cat2"], ["trompette", "mur"], "On the terrace, the whole city hums with tambourines; Mohammed puffs his cheeks and blows; the note chokes. On the wall the tabby cat (cat2) dozes in the sun.",
    cam="master", pov="none", sfx=["tambourine city hum bed", "toy_trumpet strangled"], action="blow"),
  T("W", "terrasse", ["cat2", "mohammed"], ["chat", "mur", "gouttiere"], "The cat jumps in terror, nearly falls off the wall, dives into the gutter (3D cat, whole jump in frame). Hold 0.6 s; a worried head pops over the party wall (painted head layer) and drops away.",
    cam="reverse", sfx=["cat_yowl", "cat_jump_land", "gutter rattle"], action="jump", hold=(0.8, "comic timing")),
 ],
 "s05_hammoussa": [
  T("M", "escalier", ["mohammed"], ["babouche"], "Mohammed leans over the stair rail, listening down (high angle from below).", cam="low", speaker_off=True, sfx=["mother's voice from below: reverb 'patio', dist .5"]),
  T("M", "patio", ["hammoussa", "mohammed"], ["babouche"], "In the patio waits the tiniest pupil, Hammoussa (≈1.0 m, too-big djellaba); Mohammed comes down, slipping on his babouches.",
    cam="master", label="Hammoussa (« pois chiche ») = Azzouz Berrada", action="walk"),
  T("CU", "patio", ["hammoussa"], [], "Hammoussa, out of breath, urgent, waves him out.", cam="ots", action="wave", cut="hard", figurative=["lustre"]),
 ],
 "s06_lustres": [
  T("M", "msid_lustres", ["mohammed", "kid1", "kid2"], ["cotonnade", "ciseaux", "meche"], "Msid, afternoon light: Mohammed sits in a group cutting tiny wicks from an old white cloth (seated on the mat: pose solved and checked, or framed above the waist).",
    cam="master", ins=[("meches_ciseaux", 1.0)], sfx=["scissors_cut x3", "cloth_tear", "pupils murmur bed"]),
  P("macro", ["meche", "lamelle", "verre", "huile", "poudre"], "Procedure montage, 1 s each: a rolled wick clipped onto a tin strip / the strip hooked on the rim of a glass, half water, half oil / coloured powder sprinkled, the water turning ruby.",
    sfx=["tin_click", "water_pour_glass", "powder hiss"]),
  P("macro", ["babouche", "poudre"], "Gag insert, held: the paper packets of coloured powder sitting inside the fqih's big yellow babouches.", hold=(1.6, "gag")),
  T("W", "msid_lustres", ["grand1", "grand2", "hammoussa"], ["echelle", "lustre"], "Low angle: the big boys on a wobbly ladder hang wrought-iron chandeliers from the ceiling; insert: Hammoussa cuts his thumb on a tin strip, sucks it, leaves whimpering softly.",
    cam="low", ins=[("pouce_lamelle", 0.8)], sfx=["ladder_wood_creak", "metal clinks", "small whimper"], action="climb"),
  T("M", "msid_lustres", ["fqih", "mohammed"] + KIDS, ["lustre"], "Sunset through the door; the pupils chant canticles, the fqih prays with open hands, chandeliers now hanging above them, still unlit.",
    cam="reverse", sfx=["cantique chant (sung, not TTS)", "fqih prayer murmur"], light="sunset"),
 ],
 "s07_petrole": [
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["lampe"], "The room at dusk: Zoubida shakes the dry petrol lamp, worried; she hurries out to the landing.", cam="master", action="shake", light="dusk", figurative=["petrole"]),
  T("M", "chambre_nuit", ["mohammed"], ["fenetre"], "Mohammed at the window grille, listening to the alley below (his POV: dark alley, nobody visible).", cam="pov_fenetre", pov="mohammed",
    speaker_off=True, sfx=["vendeur cry: street reverb, dist .8"], figurative=["bougie"]),
  T("CU", "chambre_nuit", ["mohammed"], ["lampe"], "Mohammed's proud little face looking at the fine lamp with its mirror (still dark).", cam="ots", figurative=["bougie"]),
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["lampe", "bougie", "bouteille", "petrole", "porte"], "The night falls hard (cut to almost black). A cough at the door. Zoubida comes back with Rahma's bottle; by a candle-stub's light she fills the lamp, cleans the wick, lights it: the room blooms warm.",
    cam="master", ins=[("bout_chandelle", 1.0), ("meche_lampe", 0.8)], sfx=["cough at the front door, dist .7", "footsteps_stairs", "liquid pour", "match_strike", "oil_lamp_hiss"], light="lamp_on", fade=True),
  T("CU", "chambre_nuit", ["mohammed"], ["lampe"], "Mohammed, lamp-lit, solemn.", cam="ots_zoubida"),
  T("CU", "chambre_nuit", ["zoubida"], ["lampe"], "Zoubida answers, tender (reverse).", cam="ots_mohammed"),
 ],
 "s08_menthe": [
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["menthe"], "Lalla Kanza's voice rises from the ground floor (Zoubida turns to the door).", cam="master", speaker_off=True,
    sfx=["kanza from below: reverb patio, dist .6"]),
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["menthe"], "Zoubida hands Mohammed a fresh bunch of mint; he takes it proudly.", cam="reverse", ins=[("menthe_mains", 0.9)]),
  T("M", "patio_nuit", ["mohammed"], ["encens"], "Mohammed's POV dolly at his eye height into the patio, thick incense smoke, lamplight; then a dream painting: an assembly of demons in the half-dark.",
    cam="pov", pov="mohammed", sfx=["incense_crackle", "low drone"], action="walk"),
  T("M", "patio_nuit", ["kanza", "mohammed"], ["sesame"], "Lalla Kanza (old, smiling, her eyes half closed) tips sesame seeds into his palm; he tastes with the tip of his tongue, then eats.",
    cam="ots", ins=[("sesame_paume", 1.0)], sfx=["seed crunch"]),
  T("CU", "patio_nuit", ["mohammed"], ["sesame"], "CU: seeds stuck around his lips and on the tip of his nose; his tongue sweeps what it can reach (painted CU insert for the tongue gag).",
    cam="ots", ins=[("graines_nez", 1.2)]),
 ],
 "s09_escalier": [
  T("M", "escalier_nuit", ["mohammed"], [], "The very dark staircase, rim-lit from above: Mohammed climbs calmly; shadows on the walls seem to step aside.",
    cam="low", sfx=["whispers panned L→R as he passes", "footsteps_stairs barefoot"], action="climb", light="dark"),
  T("M", "escalier_nuit", ["mohammed"], [], "He stops on a step, listening up toward the lit doorway.", cam="high", speaker_off=True, sfx=["mother through the wall: small_room, dist .5"]),
  T("M", "escalier_nuit", ["mohammed"], [], "Same.", cam="high", speaker_off=True),
  T("M", "escalier_nuit", ["mohammed"], [], "Same.", cam="high", speaker_off=True),
  T("CU", "escalier_nuit", ["mohammed"], [], "CU in the dark: he holds his breath and listens; nothing. Total subjective silence where a muezzin would be.",
    cam="ots", pov="mohammed", sfx=["SILENCE (all beds out)"], peak=True),
 ],
 "s10_plans": [
  T("M", "chambre_nuit", ["father", "mohammed"], ["lampe", "matelas"], "Night, lamp, mattresses on the floor: the father, seated by the lamp, tells the plan; Mohammed glows.", cam="master", figurative=["cierge"]),
  T("CU", "chambre_nuit", ["mohammed"], ["couverture"], "Mohammed in bed: his smile fades at 'coiffeur'.", cam="high", peak=True, sfx=["razor_strop x2 under 'je redoutais'"]),
  P("dream", ["bougie", "cierge", "rasoir", "lustre", "tambour"], "Dream painting: monumental candles with paper lace, gleaming razors and hourglass drums swirling around chandeliers of crystal cups.",
    sfx=["razor_strop x3 (motif)", "drone"]),
 ],
 # ============================================================ ACT II: LA VEILLE
 "s11_souk": [
  P("crowd", ["tambourin", "trompette", "hochet"], "Card LA VEILLE. Crowd painting with parallax layers: the toy souk, stalls overflowing with bunches of tambourines and trumpets, a ring of women, men and children trying instruments.",
    sfx=["crowd_souk_walla", "tambourine_shake", "rattles", "flute_ney_short"]),
  T("M", "souk_jouets", ["father", "mohammed"], ["tambour", "chariot", "trompette"], "Mohammed clings to his father's hand (spacing ≥ 0.6 m, hands reach via IK); the father pays without bargaining; Mohammed holds up his hourglass drum, a wooden cart and a new trumpet.",
    cam="master", ins=[("tambour_sablier", 0.9)], action="walk", sfx=["darbouka_hit soft x2 @tambour", "toy_trumpet short @trompette", "crowd_souk_walla bed"]),
  T("W", "barbier_ext", ["father", "mohammed"], ["cierge", "vigne"], "A one-pound candle in Mohammed's arms; they turn into a narrow street; a centuries-old vine over a tiny shop; facing it, Bnou Achir's shop.",
    cam="master", label="Chez Si Abderrahman, le barbier (Chemaïne)", ins=[("cierge_livre", 0.9)], action="walk", figurative=["livre"]),
 ],
 "s12_barbier": [
  T("M", "barbier", ["barber", "client", "mohammed", "father"], ["ventouse"], "Inside the narrow shop: the barber bends over a client's shaved nape (client back to camera, cherry-red ears); insert: two tin cups planted on the nape; Mohammed looks away.",
    cam="master", back=["client"], ins=[("ventouses_nuque", 1.0)], sfx=["cup suction"]),
  T("M", "barbier", ["barber", "mohammed", "father"], ["tambour", "trompette", "chariot", "cierge"], "The barber turns to Mohammed's toys, smiling, wagging a finger at 'cognassier'.", cam="reverse", sfx=["none: toys only named, room tone"], label="Si Abderrahman, le barbier"),
  T("CU", "barbier", ["mohammed"], [], "Men laugh (off); CU Mohammed blushing with indignation (low angle, the laughs echo).", cam="low", pov="mohammed", peak=True,
    sfx=["men_laughing_small_group"], cut="L"),
 ],
 "s13_hammad": [
  T("M", "barbier", ["hammad", "barber"], ["rideau", "chaise"], "The curtain lifts: a dry man, goat beard, monumental turban, groaning; he collapses into a rigid chair (seat pose solved and checked).",
    cam="reverse", label="l'oncle Hammad", sfx=["curtain rustle", "groans", "chair creak"], action="sit"),
  T("CU", "barbier", ["hammad"], [], "CU Hammad, eyes to heaven: 'je vais mourir'.", cam="ots", peak=True),
  T("M", "barbier", ["barber", "hammad"], [], "The barber, mock-solemn, raising a finger.", cam="master"),
  T("M", "barbier", ["barber"], ["oignon", "miel", "sesame"], "The remedy at top speed: rhythmic 0.5 s inserts on each word: onion in butter, honey, anise, sesame, ginger, cinnamon, three cloves.",
    cam="ots", ins=[("oignon_beurre", .5), ("miel", .5), ("anis", .5), ("sesame", .5), ("gingembre", .5), ("cannelle", .5), ("clous_girofle", .7)], sfx=["sizzle", "spoon clicks"]),
  T("M", "barbier", ["hammad"], ["rideau"], "Hammad extracts himself from the chair, blessing him, and leaves groaning.", cam="reverse", action="stand", sfx=["groans fading", "curtain"]),
 ],
 "s14_larbi": [
  P("flashback", ["babouche"], "Barber's-tale flashback (warm sepia): Moulay Larbi, a dignified babouchier, in his shop among stacks of yellow babouches with three workers; the barber cupping his nape; no child anywhere. Exam plant: Aïcha's husband (a CU of his face, reused in s25).",
    sfx=["razor_strop under the voice", "workshop: leather tapping"], label="Moulay Larbi, le babouchier"),
  T("CU", "barbier", ["barber"], [], "Slow push-in on the barber at 'une nouvelle épouse'. Tag À RETENIR burns in.", cam="ots", peak=True, sfx=["room tone drops"]),
  T("M", "barbier", ["father", "mohammed"], [], "The father listens, indifferent; Mohammed on the bench, legs dangling, looks at the razors on the wall.", cam="reverse", pov="none"),
 ],
 "s15_lamrani": [
  T("M", "barbier", ["lamrani"], ["estrade"], "A new client enters: young, waxy-white skin, crow-black beard; he sits on the high platform facing the door.", cam="reverse", label="Sidi Ahmed Lamrani", action="sit"),
  T("M", "barbier", ["barber", "lamrani"], ["ventouse"], "The barber overflows with questions and answers them himself; Sidi Ahmed opens his mouth twice, closes it.", cam="master", sfx=["barber 'neighing' laugh"]),
  T("CU", "barbier", ["barber"], ["ventouse"], "The barber sucks the mouth of a cup (from above, over the client).", cam="high", ins=[("ventouse_bouche", 0.7)]),
  T("CU", "barbier", ["lamrani"], [], "Sidi Ahmed slips his line in while the barber's mouth is busy (the gag).", cam="ots", peak=True),
  T("CU", "barbier", ["barber"], [], "The barber, suddenly dreamy, slow push-in: 'j'ai une fille en âge d'être mariée'. Hold on his eyes (the plant for ch. VIII).", cam="ots", peak=True,
    hold=(0.8, "plant"), sfx=["room tone only"]),
 ],
 "s16_rasoir": [
  T("M", "barbier", ["barber", "mohammed"], ["serviette"], "The barber removes the cups, comes to Mohammed and wraps him in the red-and-yellow striped towel.", cam="master", action="wrap"),
  P("dream", ["ane", "chat", "moineau"], "The hymn to the street as a painted montage over the barber's voice: a little grey donkey trotting, skinny cats, whirling sparrows, a festive procession under vine and plane trees.",
    sfx=["street ambience under the voice", "sparrows"]),
  T("M", "barbier", ["lamrani"], [], "Sidi Ahmed, sincerely amazed.", cam="ots"),
  T("CU", "barbier", ["barber"], ["rasoir", "pierre"], "ECU razor on the oily stone, the cold-open shot, now in context: the ebony razor, wiped, tried on a thumbnail.", cam="ots", ins=[("rasoir_pierre", 1.4), ("rasoir_ongle", 0.8)],
    sfx=["razor_strop x4"], cut="match"),
  T("CU", "barbier", ["mohammed"], ["serviette", "rasoir"], "Mohammed's head bowed to his knees; his eyelids drop; the barber's voice slows into a drone.", cam="pov_mirror", pov="mohammed",
    sfx=["barber voice slowed + lowpass", "drone"], action="sleep"),
  T("CU", "barbier", ["mohammed"], ["rasoir", "lame"], "His head tips sideways; the blade bites (insert); he jolts awake: total silence, a sharp breath, a drop of sweat runs down his nose.",
    cam="pov_mirror", peak=True, ins=[("lame_nuque", 0.6), ("sueur_nez", 0.9)], sfx=["SILENCE", "breath in"], cut="smash"),
 ],
 "s17_rue": [
  T("CU", "barbier", ["mohammed"], ["serviette"], "Unwrapped, pale, light-headed; he looks for his father.", cam="pov_mirror"),
  T("M", "barbier", ["father", "mohammed"], [], "The father stands up and comes to help him.", cam="reverse", action="walk"),
  T("W", "barbier_ext", ["father", "mohammed"], ["vigne"], "They step out: the street overexposed, sound flooding back (vine, light, passers-by); payoff of the hymn.",
    cam="reverse", sfx=["street ambience swells in", "sparrows"], light="overexposed", action="walk", cut="L"),
 ],
 "s18_concert": [
  T("M", "patio", ["zineb"], ["tarifa"], "On the first floor, Zineb beats her little clay tarifa drum without rhythm.", cam="high", sfx=["darbouka_hit (off-beat)"], action="strike"),
  T("M", "chambre", ["mohammed"], ["tambour", "trompette"], "The one-man band: drum on the floor on its rim, trumpet wedged between the knees, sticks flying; Zineb joins him.",
    cam="master", sfx=["darbouka_hit", "toy_trumpet roars"], action="drum"),
  T("M", "patio", ["zoubida", "rahma"], [], "The women in the patio beg for mercy, laughing, hands over their ears.", cam="low", sfx=["women_laughing_group"]),
  T("M", "chambre", ["zoubida", "mohammed"], ["chemise"], "Fitting: the new shirt stiff with starch, falls to the floor; his arms lost in huge sleeves (painted CU insert of the sleeves).",
    cam="master", ins=[("manches_chemise", 1.0)], sfx=["paper-crackle cloth"]),
  P("crowd", ["tambourin", "trompette"], "Terrace concert at sunset: Zineb, two girls and an older boy roaring on the trumpet; richly dressed women perched on the walls, laughing.",
    sfx=["tambourine_hit", "toy_trumpet", "women_laughing_group", "kids"]),
 ],
 "s19_bain": [
  T("M", "cuisine_auge", ["zoubida", "mohammed"], ["auge", "seau"], "Kitchen, steam: the wooden trough overflowing with boiling water; she pours a bucket of cold water in, undresses him (framed above the waist) and plunges him in.",
    cam="master", sfx=["water_bucket_splash", "steam hiss"], action="pour"),
  T("CU", "cuisine_auge", ["mohammed"], ["auge"], "He screams and struggles.", cam="ots", peak=True, sfx=["splash", "scream"]),
  P("dream", ["liege"], "Cork scrub (insert), then black; the black fills with teasing little girls and chattering barbers (1.5 s dream painting).", sfx=["water_scrub", "drone tail"]),
 ],
 # ============================================================ ACT III: LA NUIT
 "s20_reveil": [
  T("CU", "chambre_nuit", ["mohammed", "zoubida"], ["couverture", "chemise", "gilet"], "Card LA NUIT DE L'ACHOURA over a red light full of sparks (his closed eyelids); his eyes open on his mother waking him; insert: the shirt, the red gilet and the satchel laid out on the chest.",
    cam="high", pov="mohammed", light="red_dream", ins=[("habits_poses", 0.9)], sfx=["voice through sleep: lowpass then clear"]),
  T("CU", "chambre_nuit", ["mohammed"], [], "She wets her hand and passes it over his face (insert); he blinks.", cam="ots", ins=[("main_mouillee", 0.8)], sfx=["water drip"]),
  T("M", "chambre_nuit", ["father"], [], "The father in fine wool djellaba, smiling.", cam="reverse"),
  P("macro", ["chemise", "gilet", "djellaba"], "Dressing montage, one insert + one sound each: the stiff shirt crackling like paper / the red embroidered gilet / the embroidered satchel strap / the white djellaba from the chest, orange blossom.",
    sfx=["paper-crackle cloth", "fabric", "leather strap", "chest lid"]),
  T("M", "chambre_nuit", ["mohammed"], ["djellaba", "gilet"], "Mohammed in festival costume (mohammed_fete), chest out: 'un autre homme'.", cam="low", peak=False, costume="fete"),
 ],
 "s21_babouches": [
  T("M", "rue_nuit", ["father", "mohammed"], ["babouche"], "Black street at 3 a.m., shops lit: Mohammed loses his oversized babouches every three steps (3D gag, feet checked).",
    cam="master", sfx=["footsteps_stone slippers", "babouche flap"], action="walk", costume="fete"),
  T("M", "rue_nuit", ["father", "mohammed"], [], "They pass a dark doorway: a beggar's call and the tapping of a cane, never shown.", cam="reverse", sfx=["cane_tap_stone dist .8", "beggar call far"], costume="fete"),
  T("M", "rue_nuit", ["father", "mohammed"], ["cierge", "piece"], "The father slips a five-franc coin into his hand and the candle into his arms.", cam="ots", ins=[("piece_cinq_francs", 0.9)], costume="fete"),
 ],
 "s22_feerie": [
  T("W", "msid_facade", ["mohammed", "father"], ["cierge", "lustre"], "Turn of the corner: the Msid façade ablaze with clusters of coloured oil lights (hero plate, slow push). FIRST MUSIC CUE.",
    cam="master", pov="mohammed", peak=False, sfx=["pupils' chant far + clear"], music="feerie", hold=(2.0, "reveal"), costume="fete"),
  T("W", "msid_feerie", ["fqih"] + KIDS + ["grand1", "grand2", "mohammed"], ["lustre"], "Inside: a congregation of richly dressed young lords chanting under a legendary king (the fqih in festive clothes); light flickers with the chant.",
    cam="low", figurative=["gilet"], sfx=["chant (sung)"], light="chant_driven", costume="fete"),
  T("M", "msid_feerie", ["mohammed", "fqih"], ["cierge", "piece"], "Mohammed solemnly hands over his candle and coin; the pile of candles beside the fqih grows.", cam="reverse", ins=[("pile_cierges", 0.8)], costume="fete"),
  T("M", "msid_feerie", ["mohammed", "kid1"], [], "Heat: he throws back his hood; sweat beads; beside him a pupil's nose bleeds on his fine clothes (painted insert).",
    cam="ots", ins=[("saignement_nez", 0.7)], costume="fete"),
  T("CU", "msid_feerie", ["mohammed"], ["lustre"], "He looks up: tiny flames dance and crackle in their rainbow glasses (POV tilt up); he stops chanting to hear them 'psalmodier'.",
    cam="pov", pov="mohammed", peak=True, sfx=["candle_flame crackle up", "chant ducks"], costume="fete"),
 ],
 "s23_aube": [
  T("W", "msid_facade", [], ["lustre"], "Dawn: the lights turn yellow and weaken; two sparrows flutter around the chandeliers on the window awnings.", cam="reverse", sfx=["sparrows_dawn", "street wakes"], light="dawn"),
  T("M", "msid_feerie", ["fqih"], [], "The fqih, eyes to the ceiling, hands open in offering: the long invocation.", cam="low", costume="fete"),
  T("W", "msid_feerie", KIDS + ["mohammed"], [], "All the pupils: Amine! Amine!", cam="master", sfx=["crowd_kids_school 'Amine'"], costume="fete"),
  T("CU", "msid_feerie", ["fqih"], [], "The first time without his quince rod: his empty hands; black-and-white striped djellaba, grey burnous. Framed like the end of a war.", cam="ots", peak=True, costume="fete"),
  T("M", "msid_feerie", ["fqih"] + KIDS + ["mohammed"], [], "The fqih gives three days off.", cam="master", costume="fete"),
  T("W", "msid_feerie", KIDS + ["mohammed"], [], "Four days! The pupils cheer.", cam="low", sfx=["kids_cheer"], costume="fete"),
 ],
 # ============================================================ ACT IV: LE JOUR
 "s24_idriss": [
  T("M", "chambre", ["zoubida", "mohammed"], ["galette", "theiere"], "Card LE JOUR DE L'ACHOURA. Zoubida in her fine mansouria with yellow satin stripes; square flaky galettes with butter and honey (insert); the kettle sings.",
    cam="master", ins=[("galettes_miel", 0.9)], sfx=["kettle sing"], costume="fete"),
  P("crowd", ["plat"], "Moulay Idriss and the place des notaires: crowds in new clothes; potters' blue ceramics; the father buys a blue dish.", sfx=["crowd walla festive"]),
 ],
 "s25_aicha": [
  T("M", "salon", ["aicha", "zoubida"], ["divan"], "Lalla Aïcha bursts in: pointed kisses, effusions.", cam="master", label="Lalla Aïcha", sfx=["kisses", "laughs"]),
  T("M", "salon", ["zoubida", "aicha"], ["divan"], "Zoubida insists: the big divan, the place of honour (Aïcha flops among cushions: seat pose solved or framed above the waist).", cam="reverse", action="sit"),
  T("M", "salon", ["aicha", "zoubida", "mohammed"], ["theiere"], "The Khadijas joke; Mohammed in his corner laughs; everyone laughs.", cam="master", sfx=["women_laughing_group"]),
  T("M", "salon", ["zoubida"], ["theiere", "verre"], "Zoubida pours the 'thé des grands jours' (sage and wormwood bunch beside), asking.", cam="ots", ins=[("the_sauge", 0.8)], sfx=["tea pour"]),
  T("M", "salon", ["aicha"], ["verre"], "Aïcha proud of her husband's three workers and the apricot caftan; her smile fades.", cam="ots", figurative=["babouche", "drap"]),
  T("CU", "salon", ["aicha"], [], "Silence; Aïcha looks away.", cam="ots", sfx=["room tone"]),
  T("CU", "salon", ["aicha"], [], "She leans to Zoubida and whispers; 'Ils sont... Ils sont...', hands at shoulder height, eyes to the sky. HARD SILENCE 1.2 s. Tag À RETENIR.",
    cam="ots", peak=True, hold=(1.2, "shock line silence"), sfx=["SILENCE"]),
  T("M", "salon", ["zoubida", "mohammed"], ["tambour"], "Zoubida sends Mohammed up with his drum; he understands.", cam="reverse", action="point"),
  T("M", "terrasse", ["mohammed"], ["tambour"], "Cross-cut: alone on the terrace he invents barbaric rhythms on his hourglass drum // below, the two women bent toward each other, whispering (the drum covers their words).",
    cam="master", sfx=["darbouka_hit pattern (loud on terrace, muffled below)"], action="drum", cut="match"),
  P("crowd", ["terrasse"], figurative=["or"], visual="Sunset terraces: bouquets of richly dressed women, tambourines, the gold-robed sun bathing the city in faded rose and mauve; the first star blinks.",
    sfx=["city tambourines far", "songs"]),
 ],
 "s26_fin": [
  T("M", "chambre_nuit", ["zoubida", "father", "mohammed"], ["lampe", "matelas", "tambour", "trompette"], "Lamp lit; nobody has any spirit left; the drum and trumpet lie on a mattress.", cam="master", sfx=["oil_lamp_hiss only"]),
  T("CU", "chambre_nuit", ["mohammed"], ["chemise"], "Back in old clothes, only the new shirt kept, softened by his body heat.", cam="ots"),
  T("CU", "chambre_nuit", ["mohammed"], ["boite", "tambour"], "He opens his Boîte à merveilles (insert); his eyes close; the lamp wick turns down to BLACK.",
    sfx=["darbouka_hit pattern far, dist .8", "tambourine_shake far", "oil_lamp_hiss fades with the wick"], cam="high", ins=[("boite_ouverte", 1.4)], light="lamp_out", peak=True),
 ],
 "s27_fiche": [
  dict(mode="title", text="Fiche de révision — Chapitre VII", visual="Revision sheet (screenshot-ready): 4-step chronology with the day cards", music="fiche"),
  dict(mode="title", text="Chronologie", visual="J-2 tambourins & lustres → La veille: souk & barbier → La nuit: fête au Msid → Le jour: Moulay Idriss & Lalla Aïcha"),
  dict(mode="title", text="Le détail à retenir", visual="Moulay Larbi (sans enfants) = mari de Lalla Aïcha; le barbier: « une nouvelle épouse ? » + « j'ai une fille en âge d'être mariée »; Aïcha: « Ils sont… Ils sont… »"),
  dict(mode="title", text="Thèmes + citations", visual="Thèmes: fête/traditions, regard de l'enfant, condition de la femme. Citations: « décor de féerie », « un autre homme », « Mes yeux, hélas… ». Teaser ch. VIII"),
 ],
}

TITLE = {
 "s02_roadmap": dict(mode="title", text="1 Tambourins et lustres · 2 Le souk et le barbier · 3 La nuit de l'Achoura", dur=4.0,
                     visual="3 panels, 1.5 s each on a bendir hit, + 'Fiche de révision à la fin'"),
 "s28_endcard": dict(mode="title", text="fin", dur=12, visual="end card: TikTok @la.boite.a.bac + WhatsApp community + next episode"),
}


def main():
    sc = json.load(open(os.path.join(D, "script.json")))["scenes"]
    B, n = [], 0
    for s in sc:
        sid = s["id"]
        if sid in TITLE:
            n += 1; B.append({"id": f"b{n:03d}", "scene": sid, **TITLE[sid]}); continue
        ann = A[sid]
        assert len(ann) == len(s["lines"]), f"{sid}: {len(ann)} annotations for {len(s['lines'])} lines"
        for l, a in zip(s["lines"], ann):
            n += 1
            b = {"id": f"b{n:03d}", "scene": sid, "text": l["sub"], "speaker": l["who"], **a}
            for k in ("card", "tag", "music"):
                if k in s and l is s["lines"][0 if k != "tag" else -1]:
                    b.setdefault(k, s[k])
            if b.get("peak") is False: del b["peak"]
            if "ins" in b: b["ins"] = [list(x) for x in b["ins"]]
            if "hold" in b: b["hold"] = list(b["hold"])
            B.append(b)
    json.dump({"episode": "ep07", "chapter": 7, "beats": B}, open(os.path.join(D, "beats.json"), "w"), ensure_ascii=False, indent=1)
    ins = sum(len(b.get("ins", [])) for b in B)
    print(len(B), "beats,", ins, "inserts,", len({(b.get('room'), b.get('cam')) for b in B if b.get('mode') == '3d'}), "plate angles")


if __name__ == "__main__":
    main()
