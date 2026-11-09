#!/usr/bin/env python3
"""Builds ep08 beats.json from script.json + the per-line annotations below (one beat per script line, same order).
   python3 episodes/ep08/mk_beats.py && python3 tools/lint_beats.py episodes/ep08/beats.json --cast episodes/ep08/cast.json
Keys as ep07 (cam / pov / ins / sfx / cut / label / hold) plus:
   enum   [(item, word)]  enumeration items, each shown on its own visual, synced to the spoken word (user rule ep07→ep08)
   act    acting notes for the 3D layer (engine/acting.js): gaze targets, idle seed, gestures on words
   move   slow painting camera ("push 6% toward the box", "pan L→R 8%, parallax 3 layers"): paintings are never static
Rooms (plates, art/plates/ep08/): chambre (day), chambre_nuit, escalier, patio, mausolee, souk_bijoux (+_rev), souk_mur."""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
WPS = 2.6


def T(size, room, cast, props, visual, **kw):   # 3D beat
    return dict(mode="3d", size=size, room=room, cast=cast, props=props, visual=visual, **kw)


def P(reason, props, visual, **kw):             # painting beat (slow, creative camera: move= is mandatory)
    assert "move" in kw, visual[:40]
    return dict(mode="painting", reason=reason, props=props, visual=visual, **kw)


A = {
 # ============================================================ HOOK (flash-forward, then the ep06 rosette title)
 "s01_hook": [
  T("CU", "patio", ["father", "zoubida"], ["bracelet"], "Noon light: the father's hand opens on two bracelets, gold and silver, in front of Zoubida's delighted face (slow push-in).",
    cam="ots", act="Zoubida's eyes go from the bracelets to his face, a small laugh", sfx=["bracelet_clink"], cut="hard"),
  T("CU", "chambre_nuit", ["zoubida", "mohammed"], ["bracelet"], "Same evening, dark room: Zoubida weeps on her mattress, face in her hands; in the background the boy lies on the bed, eyes open, waiting. The bracelets glint on the floor.",
    cam="master", peak=True, light="night_window", sfx=["soft sobbing", "far city night"], act="Zoubida's shoulders shake (breath idle x3); Mohammed only blinks"),
 ],
 # ============================================================ ACT I: summer
 "s03_mouches": [
  P("macro", ["mouche"], "The house in summer heat: shimmering air above the patio, flies circling in a sunbeam; the camera drifts down from the sky square into the patio.",
    still="p01_ete_patio", move="tilt down 10%, heat shimmer", sfx=["cicadas far", "fly buzz"]),
  T("CU", "chambre", ["zoubida"], ["punaise", "poutre", "mouche"], "Zoubida looks up at the old cedar beams; insert macro: bedbugs waking in the cracks, flies at the doorway.", cam="low", ins=[("punaises_macro", 1.6)], act="squints up, disgusted", sfx=["fly buzz swarm", "wood creak"]),
  T("M", "chambre", ["zoubida"], ["chaux", "soufre", "petrole"], "Zoubida at war: three objects, one per word — a bucket of quicklime with a brush, a dish of burning sulphur, a petrol can she sprinkles.",
    cam="master", enum=[("chaux vive", "Chaux"), ("soufre", "Soufre"), ("pétrole", "Pétrole")], ins=[("chaux", 1.0), ("soufre_fume", 1.0), ("petrole_bidon", 1.0)],
    action="sprinkle", sfx=["brush_whitewash @Chaux", "sulphur hiss @Soufre", "liquid_splash @Pétrole"]),
  T("CU", "chambre", ["zoubida"], ["talisman", "poudre"], "Sly weapons: she pins a folded talisman over the door, blows a pinch of powder into the corner, her lips moving in an invocation.",
    cam="low", enum=[("talismans", "talismans"), ("poudres", "poudres"), ("invocations", "invocations")], ins=[("talisman_porte", 1.0), ("poudre_souffle", 1.0)],
    action="blow", sfx=["paper rustle @talismans", "powder puff @poudres", "whispered invocation @invocations"]),
  T("M", "chambre", ["zoubida"], ["poutre"], "Zoubida on a stool peers up at the ceiling beams; a few survivors hide in the cracks (insert macro).", cam="low", ins=[("poutre_survivants", 1.4)], sfx=["tiny creak"]),
  T("M", "chambre", ["zoubida"], ["torchon", "fenetre"], "Morning: Zoubida whips the air with a dish cloth, the flies stream out of the window in an angry black ribbon.",
    cam="reverse", action="swat", sfx=["cloth_whip x3", "fly buzz angry exit"]),
 ],
 "s04_mausolee": [
  T("M", "msid", ["fqih", "kid1", "kid2", "mohammed"], ["planche"], "The cramped Msid in heat: boys fanning themselves with their slates, the fqih wiping his brow.",
    cam="master", sfx=["pupils murmur tired", "fly buzz"], act="slow fan gestures, heavy idle"),
  T("W", "mausolee", ["fqih", "mohammed", "kid1", "kid3"], ["planche", "encrier"], "Procession of small boys carrying slates and inkwells under their arms, crossing into a little whitewashed sanctuary.",
    cam="master", action="walk", sfx=["many small footsteps", "slates knock"], label="un mausolée : la tombe d'un saint"),
  T("W", "mausolee", ["woman1", "woman2", "fatma"], ["mausolee"], "Memory (warm tint): young women in white haiks circle the green-draped tomb seven times, counting on their fingers.", cam="high", light="flashback", action="walk", enum=[("sept fois", "sept")], sfx=["women whisper count", "slippers on tiles"]),
  T("W", "mausolee", ["mohammed"], [], "The big cool room: green shadows, white lime, a breeze; Mohammed closes his eyes and breathes.", cam="low", action="breathe",
    sfx=["fountain trickle", "cool breeze"], peak=False),
  T("M", "mausolee", ["fqih", "mohammed", "kid2"], ["fontaine"], "Muezzin call; the fqih raises a finger; the boys wash at the small singing fountain in the corner.",
    cam="reverse", action="wash", sfx=["adhan far", "fountain trickle", "water splash hands"], ins=[("ablutions_mains", 1.2)]),
  T("W", "mausolee", ["fqih", "mohammed", "kid1", "kid2", "kid3"], [], "Little and big lined up behind the master, bowing together in prayer.", cam="master", back=["fqih"], action="pray",
    sfx=["prayer rustle"], hold=(1.2, "calm")),
 ],
 "s05_memoire": [
  T("CU", "mausolee", ["fqih"], [], "Soft light on the fqih: for once a kind face, a half smile.", cam="ots", act="slow blink, warm look at Mohammed"),
  T("M", "mausolee", ["mohammed"], ["planche"], "Mohammed's slate: ten lines... then fifteen (insert: lines of ink multiplying).", cam="master", ins=[("planche_10_15", 1.6)],
    enum=[("dix", "dix"), ("quinze", "quinze")], sfx=["reed pen scratch", "sparkle soft @quinze"]),
  T("M", "chambre", ["father", "zoubida"], [], "Friday evening: the father, swollen with pride, tells Zoubida.", cam="master", act="father's chest lifts, hands open"),
  T("CU", "chambre", ["father"], [], "The father quoting the fqih, proud.", cam="ots", act="gaze to Zoubida, nod on 'savant'"),
  P("dream", [], "The child's idea of a 'savant': an obese man with a beard around a huge face and a monumental turban, inflating like a balloon.", still="p05_savant",
    move="slow push-in on the turban, scale grows 1.05→1.12 comic", sfx=["comic inflate", "boy gasp"]),
  T("CU", "chambre", ["mohammed"], [], "Mohammed in the corner pulls a face: certainly not.", cam="low", act="shakes head slowly, lips pressed"),
 ],
 "s06_reves": [
  T("M", "mausolee", ["mohammed", "fqih"], ["baguette"], "Mohammed reciting; behind, the fqih's quince rod resting on his knee.", cam="master", ins=[("baguette_cognassier", 1.0)], sfx=["recitation murmur"]),
  T("M", "mausolee", ["mohammed"], ["planche"], "His programme: morning — fervent recitation, sunlight; afternoon — same pose, eyes drifting to the window.",
    cam="reverse", enum=[("le matin : les versets", "matin"), ("l'après-midi : deux heures de rêve", "L'après-midi")],
    ins=[("soleil_matin", 1.0), ("soleil_apresmidi", 1.0)], sfx=["recitation fervent", "recitation sleepy"]),
  P("dream", [], "His mind leaves the school through the window: the white mausoleum shrinks below, the boy flies over the green roofs of Fès.", still="p06_envol",
    move="slow rise and drift right 10%, parallax roofs", sfx=["wind soft", "dream shimmer"]),
  P("dream", [], "The man he wants to be: simple, sturdy, in raw wool, eyes full of flame, holding a small child's hand under a big sky.", still="p07_homme",
    move="slow push-in to the eyes, 8%", sfx=["dream shimmer", "warm wind"]),
  P("dream", [], "Night, under the blanket the same dream continues... huge black islands spread like ink and swallow it.", still="p08_ilots_noirs",
    move="ink stains grow over the image, slow zoom out", sfx=["ink bloom low", "heartbeat soft"]),
 ],
 # ============================================================ ACT II: Monday, the promise
 "s07_lundi": [
  T("W", "patio", ["father", "mohammed"], ["porte"], "Card UN LUNDI. Noon: against all habit, the father comes through the door at lunchtime; Mohammed looks up surprised.",
    cam="master", action="walk", sfx=["door_open", "footsteps"], label=None),
  T("M", "chambre", ["father", "zoubida", "mohammed"], ["djellaba", "haik"], "Low round table, lunch: the father explains his plan (insert: a bolt of white cotton haik).",
    cam="master", ins=[("haik_rouleau", 1.4)], act="father talks with open hands; Zoubida listens chin on hand", sfx=["spoons", "bread tear"]),
  T("CU", "chambre", ["father"], [], "The father, a twinkle: 'today I take you both to the jewellery souk'.", cam="ots", act="look to Zoubida then wink at Mohammed"),
  T("CU", "chambre", ["father", "zoubida"], ["bracelet"], "Zoubida's breath stops, hand to her chest, as he says 'bracelets soleil et lune'.", cam="reverse", act="Zoubida freezes, then a slow smile",
    sfx=["soft shimmer @bracelets"]),
  P("macro", ["bracelet", "or"], "Sun and moon: a gold bracelet like a sun, a silver one like a crescent moon, turning slowly on dark velvet.", still="p09_soleil_lune",
    move="slow rotation, light sweep left to right", enum=[("or", "or"), ("argent", "argent")], sfx=["bracelet_clink @or", "bracelet_clink high @argent"]),
  T("M", "chambre", ["father", "zoubida"], [], "The father explains his worker left for his mother's funeral.", cam="master", act="father lowers his eyes, softer voice"),
  T("CU", "chambre", ["zoubida"], [], "Zoubida, curious.", cam="ots"),
  T("CU", "chambre", ["father"], [], "Father: mostly old age; a short prayer gesture.", cam="ots", act="open palms up briefly at 'miséricorde'"),
  T("CU", "chambre", ["mohammed"], ["planche"], "Mohammed, alarmed: the Msid! his lesson!", cam="low", act="sits up straight, eyes wide, hands up"),
  T("M", "chambre", ["father", "mohammed"], [], "The father reassures him, hand on his head.", cam="master", act="father's hand rests on the boy's head", action="pat"),
  T("CU", "chambre", ["father"], [], "The father teases: maybe you don't like pretty jewels?", cam="ots", act="eyebrows up, half smile, head tilt"),
 ],
 "s08_fleurs": [
  T("CU", "chambre", ["mohammed"], [], "Mohammed searching for the word, eyes up.", cam="low", act="eyes up-left, mouth half open"),
  T("CU", "chambre", ["father"], [], "Father, amused, leaning in.", cam="ots", act="leans forward"),
  T("CU", "chambre", ["mohammed"], [], "He lowers his eyes.", cam="low", act="look down, hands fidget"),
  T("CU", "chambre", ["mohammed"], ["fleur"], "'Les bijoux, c'est beau comme les fleurs' — said seriously, almost a whisper.", cam="low", peak=True, act="eyes up on 'fleurs'"),
  T("M", "chambre", ["father", "zoubida", "mohammed"], [], "Father and mother burst out laughing; the boy stays serious between them.", cam="master", action="laugh",
    sfx=["laughter two"], act="parents rock back, Mohammed still"),
  T("CU", "chambre", ["mohammed"], [], "Mohammed looks at them sideways, offended: a doubt about their intelligence.", cam="ots", act="slow side-eye left then right", hold=(.8, "comic beat")),
 ],
 "s09_escalier": [
  T("M", "escalier", ["mohammed"], [], "After lunch: Mohammed squats on a stair step, hands on his knees, thinking hard.", cam="low", act="still; breathing idle; one slow blink", sfx=["house afternoon quiet"]),
  T("CU", "escalier", ["mohammed"], [], "His face, serious as a judge.", cam="ots"),
  P("macro", ["fleur", "tombe"], "Flower montage, one flower per word: marigolds and poppies on spring graves / plump daisies opening a golden heart to the sun / bindweed on the Bab Guissa hills.",
    still="p10_fleurs_champs", move="each flower slides in with a slow push, cross-dissolve on the word",
    enum=[("les soucis et les coquelicots", "soucis"), ("les marguerites", "marguerites"), ("les liserons", "liserons")], sfx=["breeze", "bee far"]),
  P("macro", ["terrasse", "poterie"], "On the family terrace in broken pottery: geranium, carnations, roses of Ispahan — each lit in turn.", still="p11_fleurs_terrasse",
    move="slow pan right across three pots, light blooms on each word",
    enum=[("le géranium", "géranium"), ("les œillets", "œillets"), ("les roses d'Ispahan", "roses")], enumSide="left", sfx=["breeze", "pigeons far"]),   # Argon r6: the list sat over the roses; the geranium is on the left
  P("dream", ["or"], "Underground palaces: genies forge jewels in rivers of molten gold; the jewels keep the colour of the flames.", still="p12_genies",
    move="slow descent into the forge, embers drift up", sfx=["forge rumble", "anvil far", "dream shimmer"]),
  P("dream", ["fleur"], "A legendary princess walks; under each step a flower blooms — fragile jewels.", still="p13_princesse",
    move="slow track following her steps, flowers appear one by one", sfx=["dream shimmer", "soft chime per step"]),
  T("CU", "escalier", ["mohammed"], [], "Back on the stair: the boy, small, wordless.", cam="low", act="lips move without sound, then close"),
  T("M", "escalier", ["mohammed"], [], "Him alone on the step, the stairwell huge above him (high angle).", cam="high", act="hugs knees tighter"),
  T("M", "patio", ["zoubida", "father", "woman1"], ["djellaba"], "Three quick images, one per clause: mother with a basin of water / father at prayer with the boy copying / a neighbour finger on lips.",
    cam="master", enum=[("se laver les pieds", "pieds"), ("copier ses gestes", "prière"), ("pas de bruit", "bruit")],
    ins=[("bassine_pieds", 1.0), ("priere_copie", 1.0), ("doigt_levres", 1.0)], sfx=["water splash @pieds", "prayer rustle @prière", "shh @bruit"]),
  T("CU", "escalier", ["mohammed"], [], "Squatting on his step, he repeats it to himself, stubborn.", cam="ots", act="small nod on each word", peak=True),
 ],
 "s10_roi": [
  T("M", "escalier", ["zoubida", "mohammed"], [], "Zoubida leans over the gallery rail above, calling down.", cam="high", act="Zoubida looks down; he looks up"),
  T("CU", "escalier", ["mohammed"], [], "'Je joue.'", cam="low", act="doesn't move"),
  T("CU", "escalier", ["zoubida"], [], "Zoubida, curious, hands on hips.", cam="ots"),
  T("CU", "escalier", ["mohammed"], [], "'Au roi.' — chin up, dignified.", cam="low", act="chin lifts"),
  T("M", "escalier", ["zoubida", "mohammed"], [], "Zoubida laughs, mocking but tender.", cam="high", act="Zoubida hand on cheek, laughing"),
  T("M", "patio", ["woman1", "woman2", "rahma"], [], "Around the gallery the neighbours laugh.", cam="master", action="laugh", sfx=["women laughter"]),
  T("CU", "patio", ["rahma"], [], "Rahma, a sweet-sour smile.", cam="ots", act="head tilt, sugary"),
  T("CU", "escalier", ["mohammed"], [], "Mohammed's withering look up at Rahma.", cam="low", act="narrow eyes"),
  T("M", "patio", ["zoubida", "rahma"], ["bracelet"], "Imagined (dream tint): his mother's wrists shining with the bracelets; Rahma green with jealousy behind a pillar.", cam="master", light="dream", act="Zoubida lifts her wrists slowly; Rahma peeks, stiff", sfx=["bracelet_clink", "comic sting soft"]),
  T("M", "patio", ["rahma"], ["corde", "puits"], "Imagined (dream tint): Rahma complaining by the well, holding up a pitiful frayed rope.", cam="reverse", light="dream", act="whiny head shakes", sfx=["rope creak", "well echo"]),
  T("CU", "patio", ["zoubida"], ["bracelet"], "Imagined (dream tint): Zoubida, pious and gracious, bracelets shining, answers her.", cam="ots", light="dream", act="serene, slow nod", sfx=["soft shimmer"]),
  T("M", "patio", ["woman1", "woman2", "fatma"], [], "Imagined (dream tint): the chorus of neighbours, palms up to the sky.", cam="master", light="dream", action="pray", sfx=["women murmur"]),
 ],
 "s11_depart": [
  T("W", "patio", ["mohammed", "zoubida"], [], "The muezzin calls; the patio light turns amber.", cam="master", sfx=["adhan Asr far"], light="afternoon"),
  T("CU", "patio", ["mohammed"], [], "Mohammed, hopeful.", cam="low"),
  T("M", "patio", ["zoubida", "mohammed"], ["djellaba"], "Zoubida points at the stains on his djellaba.", cam="master", action="point", act="Zoubida pinches the cloth"),
  T("M", "patio", ["fatma"], ["balai", "porte"], "In her room, Fatma Bziouya's little broom stops dead; she pokes her head out of the door.", cam="reverse", action="peek",
    sfx=["broom sweep... stop"], label="Fatma Bziouya, la voisine"),
  T("CU", "patio", ["fatma"], [], "Fatma, eager.", cam="ots"),
  T("M", "patio", ["zoubida"], ["coffre"], "Zoubida nods; a chest lid slams.", cam="master", ins=[("coffre_claque", .8)], sfx=["chest_lid_slam"]),
  T("W", "patio", ["father"], ["porte"], "At the door, the father calls before entering (custom: women may be unveiled).", cam="reverse", act="father waits outside, eyes down",
    sfx=["door_knock", "father voice reverb"]),
  T("W", "patio", ["father"], [], "A woman's voice from upstairs answers: 'Passe'. He enters.", cam="reverse", speaker_off=True, action="walk",
    sfx=["female voice from above, reverb"]),
 ],
 # ============================================================ ACT III: the souk
 "s12_souk": [
  P("crowd", [], "Card LE SOUK DES BIJOUX. The jewellers' souk like an anthill: a river of turbans and haiks under reed shade, sunbeams cutting the dust.", still="p18_fourmiliere",
    move="slow crane down into the crowd, 10%, dust motes", sfx=["souk crowd bed", "jeweller hammers"]),
  T("M", "souk_bijoux", ["zoubida", "fatma", "father", "mohammed"], ["haik"], "Mother and Fatma follow with small steps, wrapped in white haiks, behind father and son.",
    cam="master", action="walk", sfx=["souk crowd bed", "small steps"]),
  T("M", "souk_bijoux", ["mohammed"], [], "Shop windows of tin-like jewels; the boy looks unimpressed (insert: flat stamped jewels).", cam="reverse",
    ins=[("bijoux_ferblanc", 1.2)], act="frowns at the window"),
  T("M", "souk_bijoux", ["man1", "woman2"], ["bijou"], "In a corner, a man and a woman hold back tears, clutching a family jewel.", cam="reverse", act="eyes down, thumbs rub the jewel", sfx=["muffled souk", "sniff"]),
  P("flashback", [], "Older Mohammed (adult, raw wool) years later, selling his own treasure for half its price: the humiliation.", still="p20_humiliation",
    move="slow push-in on his hands letting go", sfx=["heartbeat soft", "muffled bargaining"]),
  T("M", "souk_bijoux", ["marchand"], ["bracelet"], "A big devil of a dellal, ecstatic eyes, shouting a figure at the top of his lungs.", cam="low", action="shout",
    label="le dellal : le courtier des enchères", sfx=["dellal shout", "crowd bed"], act="arm up, head back"),
  T("M", "souk_bijoux", ["father", "marchand"], ["bracelet", "or"], "The father takes the pair from his hands: one gold, one silver.", cam="ots", ins=[("bracelets_mains", 1.2)],
    sfx=["bracelet_clink"]),
  T("M", "souk_bijoux", ["zoubida", "fatma"], ["bracelet", "haik"], "Zoubida tries them on four, five times; Fatma tries them too; endless discussion.", cam="master",
    enum=[("quatre", "quatre"), ("cinq fois", "cinq")], action="try", sfx=["bracelet_clink x4", "women murmur"]),
  T("W", "souk_bijoux", ["father", "marchand"], ["bracelet"], "The father signals; the dellal dives into the crowd; only his hand with the bracelets travels above the heads.", cam="master",
    action="dive", sfx=["dellal shout fading"], ins=[("main_au_dessus", 1.6)]),
 ],
 "s13_attente": [
  T("CU", "souk_mur", ["mohammed"], [], "Mohammed, exhausted, yawns to unhinge his jaw.", cam="low", action="yawn", act="knees bend, body sags"),
  T("M", "souk_bijoux", ["father", "marchand"], [], "The dellal returns; higher figure; father signals; gone again.", cam="master", act="father's small nod", sfx=["dellal shout"]),
  T("W", "souk_bijoux", ["marchand", "man1", "woman1"], [], "The souk at full boil: brokers shouting figures, dragging clients by the hand.", cam="master", action="run", sfx=["souk peak", "shouted numbers"]),
  T("M", "souk_mur", ["zoubida", "fatma", "mohammed"], [], "A wave of delirious men crushes them against the wall, then rolls on.", cam="master", action="crush", sfx=["crowd surge", "grunt"]),
  T("CU", "souk_mur", ["father", "mohammed"], [], "The father lifts the boy in his arms, holds him to his chest; his forehead streams with sweat.", cam="ots", action="lift",
    act="boy's cheek on father's shoulder", peak=True),
  T("CU", "souk_mur", ["zoubida"], ["haik"], "Zoubida, through the haik, cursing the swindler.", cam="ots", act="sharp head movements, hand slices the air"),
  T("M", "souk_bijoux", ["father", "zoubida"], [], "Everyone scans the crowd: the 'mécréant' stays invisible.", cam="reverse", act="all heads turn slowly", hold=(.8, "beat")),
 ],
 "s14_bagarre": [
  T("M", "souk_mur", ["father", "mohammed"], [], "Suddenly the father sets the boy down and vanishes into the crowd.", cam="master", action="run", sfx=["crowd swallow"]),
  P("crowd", [], "Shouts at the far end like a storm; the crowd undulates like a sea (heads as waves).", still="p22_mer_foule",
    move="slow sway of the whole image like a swell, 6%", sfx=["shouts far", "crowd roar rising"]),
  P("crowd", [], "Everyone starts running; babouches fly.", still="p23_course", move="fast diagonal drift with motion streaks", action="run", reason_override="dream",
    sfx=["stampede", "shouts"]),
  T("CU", "souk_mur", ["zoubida"], [], "Zoubida trampled: 'Mes pieds !'", cam="low", act="hops, clutches foot", sfx=["foot stomp"]),
  T("CU", "souk_mur", ["fatma"], ["haik"], "Fatma, her haik dragged: 'Mon haïk !'", cam="ots", act="clutches haik to chest", sfx=["cloth tug"]),
  T("M", "souk_bijoux", ["father", "marchand"], [], "They pass: the father and the dellal holding each other by the collar.", cam="master", action="struggle", sfx=["grunts", "cloth tear"]),
  T("CU", "souk_bijoux", ["father", "marchand"], ["turban"], "Red eyes, foam at the lips; father without his turban; blood on the dellal's cheek.", cam="ots", peak=True,
    enum=[("les yeux rouges", "yeux"), ("l'écume", "écume"), ("le turban perdu", "turban"), ("le sang", "sang")], sfx=["heavy breathing"]),
  T("W", "souk_bijoux", ["man1", "woman1", "woman2"], [], "The whole souk follows them like a procession (backs to camera, receding).", cam="high", action="walk", sfx=["crowd roar receding"]),
 ],
 "s15_fruits_secs": [
  T("M", "souk_mur", ["zoubida", "fatma", "mohammed"], [], "Mother, neighbour and boy burst out crying loudly.", cam="master", action="cry", sfx=["crying three"]),
  T("W", "souk_mur", ["zoubida", "fatma", "mohammed"], [], "They run at random to the dried-fruit souk: pyramids of dates, figs, almonds (insert); no trace of the men.", cam="master", action="run", ins=[("fruits_secs_pyramides", 1.4)], sfx=["souk calm bed", "running steps"]),
  T("W", "souk_mur", ["kid2", "kid3", "man1"], [], "Life goes on: a man sells, urchins sing a fashionable tune, indifferent.", cam="reverse", action="walk", sfx=["kids singing far", "market banter"]),
  T("CU", "souk_mur", ["mohammed"], [], "The boy, very small in the crowd, holding his mother's haik.", cam="high", act="clings, looks around"),
  T("CU", "souk_mur", ["zoubida"], ["haik"], "Zoubida decides: go home, wait and weep.", cam="ots", act="slow defeated nod"),
 ],
 # ============================================================ ACT IV: the dark room
 "s16_noir": [
  T("M", "chambre", ["zoubida"], ["haik", "matelas"], "Home: Zoubida takes off her haik, sits on a mattress, head in both hands, weeping silently.", cam="master", action="sit",
    sfx=["cloth drop", "silent sob"]),
  T("CU", "chambre", ["zoubida"], [], "Tears run down her chin; she doesn't move.", cam="ots", peak=True, act="only breathing; no head motion"),
  T("M", "chambre", ["mohammed"], ["lit"], "He cries too, then lies down on the bed, eyes on the ceiling.", cam="high", action="lie", act="eyes open, slow blinks"),
  T("CU", "chambre", ["zoubida", "mohammed"], [], "Two-shot: she weeps; he waits.", cam="master", act="no gaze between them", light="dusk"),
  T("W", "patio", [], ["fenetre"], "Night: all the windows around the patio light up one by one; theirs stays dark (slow push to the dark window).", cam="high", light="night", sfx=["night far", "door far"]),
  P("dream", [], "In the dark, monstrous figures form, morph, become huge green sparks.", still="p28_etincelles",
    move="slow morph, green sparks drift", sfx=["low drone", "spark crackle"]),
 ],
 "s17_retour": [
  T("M", "escalier", ["father"], [], "Finally the father's voice; his steps on the stairs.", cam="low", action="walk", sfx=["footsteps_stairs", "father voice reverb"], light="night"),
  T("W", "chambre_nuit", ["father"], ["porte"], "The door opens; his silhouette black on the grey wall.", cam="reverse", sfx=["door_open slow"], back=[]),
  T("M", "chambre_nuit", ["father"], ["lampe", "allumette"], "He gropes in the dark for the matches.", cam="master", action="grope"),
  T("CU", "chambre_nuit", ["zoubida"], ["etagere", "boite"], "Zoubida, flat voice, doesn't look up.", cam="ots", act="head stays down"),
  T("M", "chambre_nuit", ["father", "mohammed"], [], "Father turns toward the bed.", cam="master"),
  T("CU", "chambre_nuit", ["mohammed"], [], "'Non, papa. Je ne dors pas.'", cam="low"),
  T("CU", "chambre_nuit", ["father"], [], "Father, puzzled, gentle.", cam="ots"),
  T("CU", "chambre_nuit", ["mohammed"], [], "'J'attendais ton retour.'", cam="low", peak=True),
  T("M", "chambre_nuit", ["father", "zoubida"], ["lampe"], "The lamp catches; Zoubida's face streams with tears.", cam="master", light="lamp_on", sfx=["match_strike", "lamp flame"]),
  T("M", "chambre_nuit", ["father", "zoubida"], ["bracelet"], "Father holds out the bracelets.", cam="ots", action="offer", sfx=["bracelet_clink"]),
  T("CU", "chambre_nuit", ["zoubida"], ["bracelet"], "Zoubida refuses to look: ill-omened jewels.", cam="ots", peak=True, act="turns face away"),
  T("CU", "chambre_nuit", ["father"], ["bracelet"], "Father, firm.", cam="ots", act="hand stays out"),
  T("M", "chambre_nuit", ["zoubida"], ["coffre", "bracelet"], "She takes them without looking, opens her chest, throws them in.", cam="master", action="throw",
    sfx=["chest open", "bracelets drop in", "lid slam"]),
  T("CU", "chambre_nuit", ["zoubida"], [], "'Tu verras... mon cœur ne ment pas.'", cam="low", act="hand on heart"),
 ],
 "s18_cauchemar": [
  P("dream", [], "Nightmare: monsters, eyes burning with hate hunting the three of them.", still="p29_monstres", move="slow push, eyes glow", sfx=["nightmare drone", "growl"]),
  P("dream", ["boite"], "Hideous crowds chasing them to steal their riches — above all the Boîte à merveilles.", still="p30_foule_hideuse", move="slow pan with the chase",
    sfx=["crowd distorted", "heartbeat"]),
  P("dream", ["cheval", "boite"], "The father appears on a black horse, the box under his arm, splitting the crowd at a gallop.", still="p31_cheval_noir",
    move="slow push alongside the gallop", sfx=["horse gallop", "crowd parting"]),
  P("dream", ["cheval"], "The horse's long mane unfurls like a banner.", still="p32_criniere", move="slow track along the mane", sfx=["wind flag"]),
  P("dream", [], "A deserted countryside: sand, stones, summer light; on a hill the father waits.", still="p33_colline", move="slow push to the hill", sfx=["desert wind", "silence"]),
  P("dream", ["boite"], "The father on the hill holds out the box.", still="p34_offre", move="slow push-in on the box", sfx=["wind"]),
  P("dream", ["boite", "fleur", "or"], "The box opens: on fresh-cut carnations and roses lie jewels of gold and precious stones.", still="p35_tresor",
    move="slow crane over the open box, light blooms", sfx=["box open", "dream shimmer", "jewels chime"]),
  P("dream", ["boite"], "The boy lifts his treasure to show them.", still="p36_mon_tresor", move="slow push", sfx=["dream shimmer"]),
  P("dream", [], "Zoubida in the dream, face cold: beautiful jewels bring misfortune.", still="p37_mauvais_augure", move="slow zoom on her eyes, colours drain",
    sfx=["cold wind", "chime detuned"]),
  P("dream", ["boite"], "A great cold: he closes the box and sobs; frost creeps over the image.", still="p38_froid", move="frost grows, slow pull back", sfx=["ice crackle", "child sob"]),
 ],
 "s19_matin": [
  T("CU", "chambre", ["father", "mohammed"], [], "Daylight: the father shakes him awake.", cam="ots", action="shake", fade=True),
  T("M", "chambre", ["father", "mohammed"], ["seau"], "Buckets clink in the patio; the father feels his forehead.", cam="master", action="touch", sfx=["buckets clink far"]),
  T("CU", "chambre", ["father"], [], "Father: no fever.", cam="ots"),
  T("CU", "chambre", ["zoubida"], [], "Zoubida, up in arms.", cam="ots", act="hands chop the air"),
  T("CU", "chambre", ["father"], [], "Father decides: no school today.", cam="ots", act="calm, one raised hand"),
  T("CU", "chambre", ["zoubida"], ["bracelet"], "Zoubida implores God, then refuses the bracelets.", cam="low", peak=True, act="palms up to the ceiling"),
  T("M", "chambre", ["father"], ["porte"], "Father heads for the door.", cam="master", action="walk"),
  T("CU", "chambre", ["zoubida"], [], "Zoubida's bitter line after him.", cam="ots", act="chin up, eyes wet"),
  T("CU", "chambre", ["mohammed"], [], "Mohammed in bed, a silent vow.", cam="low", act="jaw sets, eyes on the door"),
  T("M", "chambre", ["father", "zoubida"], [], "Two temperaments: the father calm at the door, the mother all gesture.", cam="master", act="contrast: father still, Zoubida gesticulates"),
 ],
 "s20_aicha": [
  T("M", "chambre", ["mohammed", "aicha"], ["lit"], "Mohammed in bed; Lalla Aïcha arrives after lunch.", cam="master", action="enter", sfx=["door_open", "greetings"]),
  T("M", "chambre", ["zoubida", "aicha"], [], "Zoubida tells everything: souk, bracelets, drama — sighs, invokes saints.", cam="master",
    enum=[("le souk", "souk"), ("les bracelets", "bracelets"), ("le drame", "drame")], act="Zoubida counts on her fingers"),
  T("CU", "chambre", ["aicha"], [], "Aïcha, politely approving, little taps on her cheek.", cam="ots", act="taps cheek x3"),
  T("CU", "chambre", ["zoubida"], [], "'Et ton mari ?'", cam="ots"),
  T("CU", "chambre", ["aicha"], [], "Aïcha buries her face in her hands and bursts into sobs.", cam="low", peak=True, action="cry"),
  T("CU", "chambre", ["aicha"], [], "'Tu es ma seule famille.'", cam="ots", act="takes Zoubida's hand"),
  T("CU", "chambre", ["aicha"], [], "Aïcha reveals: Sidi Larbi took a second wife, the barber's daughter.", cam="ots", act="bitter laugh in tears"),
  T("CU", "chambre", ["zoubida"], [], "Zoubida, shocked: 'Allah ! Allah !'", cam="low", act="hands to cheeks"),
  T("M", "chambre", ["zoubida", "aicha", "mohammed"], [], "The two women sob in each other's arms; in the background the boy watches from his bed.", cam="master", action="hug"),
 ],
 "s21_fievre": [
  T("CU", "chambre", ["mohammed"], ["lit"], "Heat, the bed, the tragic scenes: he becomes truly ill (sweat, slow zoom).", cam="high", act="eyes heavy"),
  P("dream", [], "Fever: the room tilts, pulses, colours swim.", still="p39_fievre", move="slow warp pulse", sfx=["heartbeat", "tinnitus"]),
  T("CU", "chambre", ["zoubida"], [], "Zoubida panics: 'Mon fils va mourir !'", cam="ots", peak=True, act="clutches head"),
  P("dream", [], "Neighbours flood in, blurring; his eyelids close; a gigantic drum beats.", still="p40_tambour",
    move="image blurs and darkens with each drum beat", sfx=["giant drum heartbeat"]),
 ],
 "s22_fiche": [
  dict(mode="title", visual="Fiche: Chapitre VIII card, four squares appear one per item.", room="fiche"),
  dict(mode="title", visual="Four icons, one per word: mausolée / escalier & fleurs / bagarre / cauchemar.", room="fiche",
       enum=[("l'été au mausolée", "mausolée"), ("l'escalier et les fleurs", "escalier"), ("la bagarre du souk", "bagarre"), ("le cauchemar", "cauchemar")]),
  dict(mode="title", visual="Detail: bracelets → mauvais augure (arrow joy → misfortune).", room="fiche"),
  dict(mode="title", visual="Callback ch.7: Sidi Larbi's second wife.", room="fiche"),
  dict(mode="title", visual="Themes list + teaser for chapter 9.", room="fiche",
       enum=[("l'imaginaire", "imaginaire"), ("la solitude", "solitude"), ("le regard des adultes", "regard"), ("la condition de la femme", "condition")]),
 ],
}

TITLE = {
 "s02_titre": dict(mode="title", text="La Boîte à Merveilles · Chapitre VIII · Les bracelets soleil et lune", dur=4.0,
                   visual="ep06 rosette title: zellige rosette blooms in indigo, Arabic + French titles, CHAPITRE VIII · LES BRACELETS SOLEIL ET LUNE"),
 "s23_endcard": dict(mode="title", text="fin", dur=4.0, visual="end card: next episode (chapter 9) + subscribe; no TikTok/WhatsApp"),
}


# per-beat patches found by lint (ids are stable: one beat per script line)
PATCH = {
 "b001": dict(props=["bracelet", "or"]), "b009": dict(props=["torchon", "fenetre", "mouche"]),
 "b020": dict(props=["turban"]), "b026": dict(props=["couverture"]), "b046": dict(props=["fleur", "tombe", "or"]),
 "b053": dict(figurative=["fleur"]), "b076": dict(figurative=["fleur"]), "b100": dict(props=["babouche"]),
 "b122": dict(props=["bracelet"]), "b144": dict(props=["bracelet"], cam="high"),
 "b088": dict(cam="low"), "b137": dict(cam="low"),
 "b141": dict(room="patio", visual="Father crosses the patio toward the street door (cutaway from the bedroom)."),
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
        for i, (l, a) in enumerate(zip(s["lines"], ann)):
            n += 1
            a = dict(a)
            if a.pop("reason_override", None): a["reason"] = "dream"
            a = {k: v for k, v in a.items() if v is not None}
            b = {"id": f"b{n:03d}", "scene": sid, "text": l["sub"], "speaker": l["who"], "dur": round(len(l["sub"].split()) / WPS + .4, 1), **a}
            if b["mode"] == "title": b["dur"] = min(b["dur"], 4.0)
            for key in ("card", "tag", "music"):
                if key in s and i == (len(s["lines"]) - 1 if key == "tag" else 0): b.setdefault(key, s[key])
            for key in ("ins", "enum"):
                if key in b: b[key] = [list(x) for x in b[key]]
            if "hold" in b: b["hold"] = list(b["hold"])
            if b.get("peak") is False: del b["peak"]
            if sid in ("s12_souk","s13_attente","s14_bagarre","s15_fruits_secs") and "zoubida" in b.get("cast",[]): b["costume"]={"zoubida":"haik"}
            b.update(PATCH.get(b["id"], {}))
            B.append(b)
    json.dump({"episode": "ep08", "chapter": 8, "lint": {"HOOK_MAX": 14, "TITLE_MAX": 10}, "beats": B}, open(os.path.join(D, "beats.json"), "w"), ensure_ascii=False, indent=1)
    p = sum(1 for b in B if b.get("mode") == "painting")
    print(len(B), "beats,", p, f"paintings ({p / len(B):.0%}),", sum(len(b.get("ins", [])) for b in B), "inserts,",
          sum(1 for b in B if b.get("enum")), "enumerations,", len({(b.get('room'), b.get('cam')) for b in B if b.get('mode') == '3d'}), "plate angles")


if __name__ == "__main__":
    main()
