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
 # ============================================================ v2 OPENING: calm hook, then the ep06 rosette title (s02_titre)
 "s01_hook": [
  P("crowd", ["tambourin", "terrasse"], "Establishing painting, slow drift right: the white terraces of Fès in late-afternoon gold, women on the rooftops trying tambourines; the city hums.",
    still="h01_ville_tambourins", sfx=["tambourine city hum bed (far, many)", "pigeons"], hold=(1.5, "establishing")),
  P("dream", ["lustre"], "Night falls over the medina (painting): far away, a glow of coloured lights in an alley; a small boy's silhouette on a roof watches it. Fade to the title.",
    still="h02_nuit_promesse", sfx=["night wind", "tambourines fade far"]),
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
# v2 (2026-11-05): the 72 new narration/dialogue lines, keyed (scene, index in the v2 scene). They keep the v1 beat ids stable:
# a new beat is numbered after the beat before it (b005 -> b005a) and marked new=True, so scene code that indexes lines('sXX')
# by v1 line keeps working (beatscene.js lines() = v1 lines only). Default staging of a new beat = its still (paintings),
# else the previous beat's shot, re-covered at its size on its cast[0] (E2 coverage cut) + its inserts.
N = {
 ("s03_tambourins", 1): T("CU", "chambre", ["zoubida"], ["tambourin", "bendir"], "Zoubida turns the bendir in her hands; insert of the drum shapes: long blue ceramic, pot-bellied pottery, bare wooden frames with skin.", cam="master", ins=[("formes_tambourins", 3.0)], sfx=["bendir_hit soft", "tambourine_shake"]),
 ("s03_tambourins", 3): P("crowd", ["tambourin", "tambour"], "The neighbours on the galleries around the patio, each playing for herself, murmuring a dance song.", still="p12_voisines", sfx=["women tuning tambourines, many", "murmured song far"]),
 ("s03_tambourins", 5): T("CU", "terrasse_rampe", ["mohammed"], ["trompette", "tambour", "hochet"], "Mohammed lowers his trumpet and dreams (insert: a clay hourglass drum and a flowered rattle glowing).", cam="reverse", ins=[("hochet_fleurs", 1.6)], sfx=["dream shimmer", "darbouka_hit far @tambour"]),
 ("s05_hammoussa", 1): T("M", "escalier", ["mohammed"], ["trompette", "babouche"], "He drops the trumpet with regret and tumbles down the stairs.", cam="low", action="walk", sfx=["footsteps_stairs fast", "babouche flap"]),
 ("s05_hammoussa", 3): T("CU", "patio", ["hammoussa"], [], "Hammoussa, tiny in his too-big djellaba (the name card stays).", cam="master"),
 ("s06_lustres", 0): T("W", "msid_lustres", ["mohammed", "kid1", "kid2"], ["lustre"], "The Msid in full bustle: every hand at work; Mohammed kisses the master's hand (insert) and sits down to work.", cam="master", ins=[("baise_main", 1.2)], sfx=["pupils murmur bed", "kiss"]),
 ("s06_lustres", 4): T("M", "msid_lustres", ["mohammed", "kid1"], ["lustre", "verre", "meche", "huile"], "Insert: a wrought-iron hoop chandelier on the mat, glasses set in its rings, each with its wick.", cam="master", ins=[("cerceau_lustre", 2.2)], sfx=["glass clink", "metal clinks"]),
 ("s06_lustres", 6): T("M", "msid_lustres", ["kid1", "kid2", "kid3"], [], "Five or six rowdy boys go from group to group; a little scuffle.", cam="low", sfx=["kids squabble", "pupils murmur bed"]),
 ("s06_lustres", 8): T("M", "msid_lustres", ["mohammed", "fqih"], ["babouche"], "His turn: he kisses the master's hand, slips on his babouches and leaves.", cam="reverse", ins=[("baise_main", 1.0)], sfx=["babouche flap"]),
 ("s07_petrole", 3): T("M", "chambre_nuit", ["mohammed"], ["fenetre", "petrole"], "At the grille, Mohammed listens to the vendor's patter (still nobody in the alley).", cam="pov_fenetre", pov="mohammed", speaker_off=True, figurative=["explosion"]),
 ("s08_menthe", 5): T("CU", "patio_nuit", ["mohammed"], ["sesame"], "He brushes the rest off with his fingertips, very serious.", cam="ots"),
 ("s09_escalier", 1): P("dream", ["escalier"], "Dream painting: gentle shadow-presences on the walls step aside as he climbs.", still="p13_presences", sfx=["whispers panned", "low drone"]),
 ("s10_plans", 0): T("M", "chambre_nuit", ["father", "mohammed"], ["lampe"], "The father comes home; an ordinary dinner under the lamp (insert: tagine, bread, glasses).", cam="master", ins=[("diner", 1.6)], sfx=["door", "spoon clicks", "oil_lamp_hiss"]),
 ("s10_plans", 3): T("CU", "chambre_nuit", ["mohammed"], ["couverture"], "In bed, eyes wide open in the dark: sleep has fled.", cam="high"),
 ("s11_souk", 1): P("crowd", ["tambourin", "trompette"], "Close crowd painting: around one stall everyone tries an instrument; tambourines hang like grapes.", still="p14_souk_essais", sfx=["crowd_souk_walla", "tambourine_shake", "toy_trumpet far"]),
 ("s11_souk", 2): P("crowd", ["paquet"], "Countryfolk with bundles and a laden donkey clog the street.", still="p15_campagnards", sfx=["donkey bray far", "crowd_souk_walla"]),
 ("s11_souk", 4): T("CU", "souk_jouets", ["mohammed", "father"], ["tambour"], "Mohammed chatters up at his father, who smiles and hardly answers.", cam="ots", action="walk", sfx=["crowd_souk_walla bed"]),
 ("s11_souk", 6): P("flashback", ["the"], "Sepia flashback: the young barber serving tea to guests at Mohammed's naming feast; the parents with the newborn.", still="p16_bapteme", sfx=["warm room murmur", "tea pour"]),
 ("s11_souk", 7): T("CU", "barbier_ext", ["mohammed"], ["cierge", "rasoir", "ciseaux"], "Mohammed, the big candle in his arms, shivers at the barber's door.", cam="master"),
 ("s12_barbier", 3): T("CU", "barbier", ["mohammed"], ["baguette"], "Mohammed, still red; insert: the fqih's quince rod on the mat (callback).", cam="ots", ins=[("baguette_cognassier", 2.2)], sfx=["rod swish soft"]),
 ("s13_hammad", 3): T("CU", "barbier", ["hammad"], [], "Hammad, suddenly greedy for the recipe, hand on his heart.", cam="ots"),
 ("s13_hammad", 6): T("M", "barbier", ["hammad", "barber"], ["rideau"], "He leaves, groaning softly, through the curtain.", cam="reverse", sfx=["groans fading", "curtain rustle"]),
 ("s14_larbi", 0): P("dream", ["prison"], "Comic painting over the barber's complaint: his aide's empty stool, and the sulking apprentice behind the bars of an old Fès jail.", still="p25_apprenti", sfx=["barber voice continues", "jail door clank soft"]),
 ("s14_larbi", 3): T("M", "barbier", ["barber", "father"], [], "The barber, dreamy and scandalised at once: women at the hairdresser's! The father hardly listens.", cam="master"),
 ("s14_larbi", 5): T("M", "barbier", ["mohammed"], ["banquette", "rasoir", "miroir", "chaise"], "Mohammed on the bench, feet dangling; his eyes travel over the wall (insert: racks of razors, hand mirrors, the painted chair).", cam="reverse", pov="mohammed", ins=[("panoplie_miroirs", 2.0)]),
 ("s15_lamrani", 1): T("M", "barbier", ["lamrani", "barber"], [], "Sidi Ahmed greets them, hand on his chest.", cam="reverse"),
 ("s15_lamrani", 2): T("M", "barbier", ["barber", "lamrani"], [], "The barber answers with a flood of blessings.", cam="reverse"),
 ("s15_lamrani", 4): T("M", "barbier", ["lamrani", "barber"], [], "Sidi Ahmed opens his mouth, closes it; the barber answers for him.", cam="high"),
 ("s15_lamrani", 5): P("flashback", ["the"], "Barber's-tale painting (warm sepia): El Haj Ali Lamrani, the old tea merchant and three-time pilgrim, in his shop among chests of tea and sugar loaves.", still="p24_haj_ali", sfx=["barber voice continues", "souk murmur soft"]),
 ("s15_lamrani", 8): T("M", "barbier", ["lamrani", "barber"], [], "Sidi Ahmed, shy, eyes down.", cam="reverse"),
 ("s15_lamrani", 9): T("M", "barbier", ["barber", "lamrani"], ["ventouse", "livre"], "The barber, triumphant, wagging a finger.", cam="master"),
 ("s16_rasoir", 1): T("CU", "barbier", ["mohammed"], ["serviette", "savon"], "Wrapped in the striped towel; the barber soaps his head, his gaze elsewhere (insert).", cam="pov_mirror", ins=[("savon_tete", 1.4)], sfx=["lather squish"]),
 ("s16_rasoir", 4): T("CU", "barbier", ["barber"], [], "The barber, modest and pleased: he can barely read.", cam="ots"),
 ("s16_rasoir", 5): T("M", "barbier", ["father"], [], "The father, amused, from the bench.", cam="reverse"),
 ("s16_rasoir", 6): T("CU", "barbier", ["barber"], [], "The barber, hand on heart: we speak well of what we love.", cam="ots"),
 ("s16_rasoir", 8): T("M", "barbier", ["barber", "mohammed"], ["serviette"], "His nose pushed down to his knees; small scraping strokes at the nape (off-screen sound).", cam="master", sfx=["razor scrape small x6"]),
 ("s16_rasoir", 11): T("M", "barbier", ["mohammed", "barber"], ["serviette"], "Awake with a start; the barber is still talking; sweat runs down his nose.", cam="reverse", sfx=["barber voice muffled"]),
 ("s17_rue", 1): T("CU", "barbier", ["mohammed"], [], "Nauseous, he looks for his father.", cam="pov_mirror"),
 ("s17_rue", 3): T("M", "barbier", ["father", "barber"], [], "The father takes his leave with a blessing for everyone.", cam="reverse"),
 ("s17_rue", 5): T("W", "barbier_ext", ["father", "mohammed"], ["vigne", "tambourin"], "Outside, he breathes again; the tambourines hum from every terrace.", cam="reverse", sfx=["tambourine city hum bed", "street ambience"], action="walk"),
 ("s18_concert", 1): T("CU", "chambre", ["mohammed"], ["tambour", "baton"], "Two sticks, drum on a strap: his own nouba, loud enough to burst the whole quarter's eardrums.", cam="low", action="drum", sfx=["darbouka_hit fast"]),
 ("s18_concert", 4): T("M", "patio", ["zoubida", "rahma"], [], "The women, laughing, wave them up to the terrace.", cam="low", sfx=["women_laughing_group"]),
 ("s18_concert", 6): T("M", "chambre", ["mohammed"], ["chemise", "tambour"], "Lost in the huge sleeves, he only looks at his drum.", cam="master", sfx=["darbouka_hit soft @tambour"]),
 ("s18_concert", 8): T("M", "chambre", ["mohammed", "zineb"], ["tambour", "tarifa"], "Drunk on noise: both drumming, eyes closed.", cam="master", action="drum", sfx=["darbouka_hit", "tambourine_hit"]),
 ("s19_bain", 0): P("crowd", ["tambour"], "Dusk over the terraces: the children still drumming; Zoubida calls him down from the stair door.", still="p17_crepuscule", sfx=["drums fade", "evening swallows"]),
 ("s20_reveil", 0): P("dream", [], "Red light full of sparks and wandering stars (his closed eyelids).", still="p18_lumiere_rouge", sfx=["voice through sleep: lowpass"], light="red_dream"),
 ("s20_reveil", 4): T("CU", "chambre_nuit", ["mohammed"], ["aiguiere"], "Sleepwalking, he washes his eyes and rinses his mouth (insert: the copper ewer).", cam="ots", ins=[("aiguiere", 1.4)], sfx=["water pour", "splash small"]),
 ("s20_reveil", 7): T("M", "chambre_nuit", ["mohammed", "father"], ["djellaba"], "All new, full of dignity, he walks ahead of his father to the stairs.", cam="low", action="walk", costume="fete"),
 ("s21_babouches", 0): T("W", "rue_nuit", ["father", "mohammed"], ["fenetre"], "Every window lit in the black street.", cam="master", action="walk", costume="fete", sfx=["night street, far voices"]),
 ("s21_babouches", 4): T("W", "rue_nuit", ["father", "mohammed"], ["cierge", "fenetre"], "Passers-by smile; shops open; far off, the school's windows glow.", cam="reverse", action="walk", costume="fete", sfx=["footsteps_stone", "pupils' chant far"]),
 ("s22_feerie", 1): T("M", "msid_facade", ["mohammed", "father"], ["lustre", "huile"], "The pupils' voices rise clear in the cool morning; insert: the tiny flames dancing in their coloured glasses.", cam="master", ins=[("flammes_verres", 1.8)], sfx=["chant far + clear", "candle_flame crackle"], costume="fete"),
 ("s22_feerie", 4): T("M", "msid_feerie", ["mohammed", "kid1", "kid2"], [], "The children squeeze up to make room; he chants with conviction.", cam="ots", costume="fete", sfx=["chant (sung)"]),
 ("s22_feerie", 5): T("CU", "msid_feerie", ["mohammed"], ["chemise"], "His shirt sticks to his back; unbearable prickles; he squirms.", cam="ots", costume="fete"),
 ("s22_feerie", 8): P("dream", ["natte", "lampe"], "Dream painting: the mats, lamps, sandals, a sparrow, a cat and a beggar all sing with the children.", still="p19_louange", sfx=["chant swells", "sparrows"]),
 ("s23_aube", 0): P("crowd", [], "The fathers chant canticles among the children, as in their own childhood.", still="p20_peres", sfx=["cantique chant (sung)"]),
 ("s23_aube", 5): T("CU", "msid_feerie", ["fqih"], ["djellaba", "burnous"], "The fqih's striped djellaba and grey burnous, hands empty.", cam="ots", costume="fete"),
 ("s23_aube", 8): T("M", "msid_feerie", ["mohammed", "fqih"], [], "Mohammed kisses the fqih's hand (insert); the fqih blesses his parents.", cam="reverse", ins=[("baise_main", 1.2)], costume="fete", sfx=["kisses_cheek @embrass"]),
 ("s24_idriss", 0): P("crowd", [], "Bright morning street: almost everyone in new clothes.", still="p21_rue_fete", sfx=["crowd walla festive", "water seller bell"]),
 ("s24_idriss", 2): T("M", "chambre", ["zoubida", "mohammed"], ["bouilloire", "galette"], "The kettle sings on the brazier; the pile of galettes (insert).", cam="master", ins=[("bouilloire", 1.6)], sfx=["kettle sing"], costume="fete"),
 ("s24_idriss", 4): P("crowd", [], "Inside the sanctuary: father and son pray among the crowd.", still="p22_sanctuaire", sfx=["sanctuary murmur", "prayer far"]),
 ("s25_aicha", 1): T("M", "salon", ["aicha", "zoubida"], ["divan"], "Pointed kisses; behind them the father slips away.", cam="master", sfx=["kisses"]),
 ("s25_aicha", 2): T("M", "salon", ["zoubida", "aicha"], ["divan"], "Zoubida wriggles with curiosity beside her guest.", cam="reverse"),
 ("s25_aicha", 4): T("M", "salon", ["aicha", "zoubida"], ["divan"], "Aïcha talks and talks, losing her own thread.", cam="master"),
 ("s25_aicha", 5): P("crowd", ["petrole"], "Painted gallery of the neighbourhood wives, each beside her husband's trade.", still="p23_voisines_metiers", sfx=["alley murmur", "women laughing soft"]),
 ("s25_aicha", 7): T("M", "salon", ["aicha", "zoubida", "mohammed"], ["theiere"], "They laugh heartily; Zoubida reaches for the teapot.", cam="reverse", sfx=["women_laughing_group"]),
 ("s25_aicha", 10): T("M", "salon", ["zoubida", "aicha"], [], "Zoubida, kind: difficulties always smooth out.", cam="reverse"),
 ("s25_aicha", 11): T("CU", "salon", ["aicha"], [], "Aïcha, distant: 'Oui...'", cam="ots", sfx=["room tone"]),
 ("s25_aicha", 13): T("M", "salon", ["zoubida", "aicha"], [], "Zoubida leans in, worried.", cam="reverse"),
 ("s25_aicha", 15): T("M", "salon", ["aicha", "zoubida"], [], "Aïcha's hands flutter at her shoulders; her eyes go up to the sky.", cam="master"),
 ("s26_fin", 1): T("CU", "chambre_nuit", ["mohammed"], ["vetement"], "Disgusted with finery, he pulls his old clothes back on, relieved.", cam="ots"),
}


TITLE = {
 "s02_titre": dict(mode="title", text="La Boîte à Merveilles · Chapitre VII · La nuit de l'Achoura", dur=9.0,
                   visual="ep06 rosette title: zellige rosette blooms in indigo, Arabic + French titles, CHAPITRE VII · LA NUIT DE L'ACHOURA"),
 "s28_endcard": dict(mode="title", text="fin", dur=12, visual="end card: TikTok @la.boite.a.bac + WhatsApp community + next episode"),
}


def main():
    sc = json.load(open(os.path.join(D, "script.json")))["scenes"]
    v1 = {}   # scene -> [(text, id)] of the v1 beats, in order
    for b in json.load(open(os.path.join(D, "beats_v1.json")))["beats"]:
        if b["scene"] not in ("s02_roadmap", "s28_endcard"): v1.setdefault(b["scene"], []).append((b["text"], b["id"]))
    B, prev, hook, used = [], "b000", iter("abcdefgh"), set()
    for s in sc:
        sid = s["id"]
        if sid in TITLE:
            bid = f"b000{next(hook)}" if sid < "s03" else f"b{int(prev[1:4]) + 1:03d}"
            B.append({"id": bid, "scene": sid, **TITLE[sid]}); prev = bid; continue
        old, ann, k, suf = v1.get(sid, []), A[sid], 0, iter("abcdefghij")
        for i, l in enumerate(s["lines"]):
            if (sid, i) in N:
                a, new = N[(sid, i)], True; bid = next(prev[:4] + x for x in "abcdefghij" if prev[:4] + x not in used)
            elif sid == "s01_hook":
                a, bid, new = ann[i], f"b000{next(hook)}", False
            else:
                assert k < len(old) and k < len(ann), f"{sid}: line {i} is neither new nor v1"
                assert ann[k].get("mode") == "title" or old[k][0] == l["sub"], f"{sid}:{i} v1 text changed: {old[k][0][:40]!r} -> {l['sub'][:40]!r}"
                a, bid, new = ann[k], old[k][1], False; k += 1; suf = iter("abcdefghij")
            b = {"id": bid, "scene": sid, "text": l["sub"], "speaker": l["who"], **a}
            if new and sid != "s01_hook": b["new"] = True
            for key in ("card", "tag", "music"):
                if key in s and l is s["lines"][0 if key != "tag" else -1]:
                    b.setdefault(key, s[key])
            if b.get("peak") is False: del b["peak"]
            if "ins" in b: b["ins"] = [list(x) for x in b["ins"]]
            if "hold" in b: b["hold"] = list(b["hold"])
            B.append(b); prev = bid; used.add(bid)
        if sid != "s01_hook": assert k == len(old) == len(ann), f"{sid}: {k} v1 lines matched of {len(old)} ({len(ann)} annotations)"
    json.dump({"episode": "ep07", "chapter": 7, "lint": {"HOOK_MAX": 14, "TITLE_MAX": 10}, "beats": B}, open(os.path.join(D, "beats.json"), "w"), ensure_ascii=False, indent=1)
    ins = sum(len(b.get("ins", [])) for b in B)
    print(len(B), "beats,", sum(1 for b in B if b.get("new")), "new,", ins, "inserts,",
          len({(b.get('room'), b.get('cam')) for b in B if b.get('mode') == '3d'}), "plate angles")


if __name__ == "__main__":
    main()
