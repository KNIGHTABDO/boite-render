#!/usr/bin/env python3
"""Builds ep09 beats.json from script.json + per-line annotations (one beat per script line, same order).
   python3 episodes/ep09/mk_beats.py && python3 tools/lint_beats.py episodes/ep09/beats.json --cast episodes/ep09/cast.json
Rooms (plates, art/plates/ + art/plates/ep09/):
  Reused: chambre (chambre_jour), chambre_penombre, chambre_nuit, patio (patio_matin), escalier, escalier_nuit
  New ep09: rue_tijani, rue_legumes, aicha_pauvre"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
WPS = 2.6


def T(size, room, cast, props, visual, **kw):
    return dict(mode="3d", size=size, room=room, cast=cast, props=props, visual=visual, **kw)


def P(reason, props, visual, **kw):
    assert "move" in kw, visual[:40]
    return dict(mode="painting", reason=reason, props=props, visual=visual, **kw)


A = {
 # ============================================================ HOOK
 "s01_hook": [
  T("CU", "chambre", ["father", "mohammed"], ["sacoche", "faucille", "sac"], "Dawn gloom: the father steps quietly toward the door with his shepherd bag, sickle and provisions sack; from the bed, Mohammed watches in silence.",
    cam="ots", act="father looks back once from the threshold; Mohammed watches still", sfx=["door_open soft"]),
  T("CU", "chambre_nuit", ["mohammed"], ["boite", "cercueil"], "Night: the open Wonder Box sits beside the dark mattress while Mohammed stares motionless into the shadows.",
    cam="low", peak=True, light="night_window", act="slow blink, motionless", sfx=["far city night"]),
 ],

 # ============================================================ ACT I: la fièvre et la ruine
 "s03_reveil": [
  T("W", "chambre_penombre", ["zoubida", "mohammed"], [], "Card LA FIÈVRE. Dense dim room: Mohammed lies on the back mattress; Zoubida leans whispering toward a motionless shadow near the door.",
    cam="master", act="Zoubida whispers, hand near mouth", sfx=["whisper soft"]),
  T("M", "chambre_penombre", ["zoubida", "mohammed"], [], "The two dark silhouettes drift away toward the doorway while the boy lies alone in the dim light.",
    cam="reverse", act="Zoubida steps toward door"),
  P("dream", [], "Fever hallucination: red embers of ash and cold swirling sparks spin in the dark around a blurred boy's silhouette.",
    still="p01_cendres_etincelles", move="slow dizzy swirl, sparks drift outward", sfx=["heartbeat soft", "tinnitus"]),
  T("CU", "chambre_penombre", ["zoubida", "mohammed"], [], "Zoubida steals back silently on tiptoe and bends close over Mohammed, dark and fuzzy like a phantom.",
    cam="ots", act="Zoubida leans forward slowly, motionless", sfx=["soft footsteps"]),
  T("CU", "chambre_penombre", ["mohammed"], [], "'Je suis réveillé... mais j'ai mal.' — weak head turn on the pillow.",
    cam="low", peak=True, act="eyes half open, small wince"),
  T("CU", "chambre_penombre", ["zoubida"], [], "Zoubida softens with relief, leaning closer.", cam="ots", act="hand gently lowers toward blanket"),
  T("CU", "chambre_penombre", ["mohammed"], [], "'Pourquoi fait-il si sombre ?'", cam="low", act="eyes drift toward dark window"),
  T("M", "chambre_penombre", ["zoubida", "mohammed"], [], "Zoubida sits close beside the mattress, wiping a tear with the back of her hand.",
    cam="master", act="head bows, slow breath"),
  T("CU", "chambre_penombre", ["mohammed"], [], "Mohammed whispers softly: 'J'ai faim.'", cam="low", act="slight lift of chin"),
  T("M", "chambre_penombre", ["zoubida"], ["bouillon", "bol"], "Zoubida brightens and hurries out toward the kitchen for a bowl of hot broth.",
    cam="reverse", action="walk", ins=[("bol_bouillon", 1.2)], sfx=["footsteps", "spoon clink"]),
  P("dream", ["bol"], "Vertigo: the bowl blurs as the bedroom walls tilt, roll and spin through cosmic darkness like stars and meteors.",
    still="p02_chambre_tournante", move="slow rotational drift and pull back 10%", sfx=["dizzy whoosh", "heartbeat"]),
 ],

 "s04_remedes": [
  T("M", "chambre_penombre", ["zoubida", "mohammed"], ["lit", "matelas"], "The room settles; Zoubida sits beside Mohammed on a very low mattress.",
    cam="master", act="Zoubida lowers onto low mattress, hands on lap"),
  T("M", "patio", ["rahma"], ["the"], "Cutaway to patio gallery: Rahma leans out of her window, calling kindly with warm advice.",
    cam="high", act="Rahma leans forward, hand cupped near mouth", sfx=["courtyard echo"]),
  T("M", "patio", ["fatma"], ["citron", "menthe"], "Across the courtyard, Fatma leans from her window holding lemon peel and mint sprigs.",
    cam="reverse", ins=[("citron_menthe", 1.2)], act="Fatma gestures with hands"),
  T("CU", "chambre", ["zoubida", "mohammed"], [], "Inside: Zoubida sighs softly, glancing up in resignation, leaving it in God's hands.",
    cam="ots", act="slow upward glance, gentle nod"),
 ],

 "s05_diner_chat": [
  T("M", "chambre_nuit", ["zoubida", "father", "mohammed"], ["lampe", "petrole"], "Evening: Zoubida lights the petrol lamp as the father enters early, flooding the room with warm yellow light.",
    cam="master", light="lamp_on", ins=[("lampe_petrole", 1.1)], sfx=["footsteps_stairs", "match_strike"]),
  T("CU", "chambre_nuit", ["father", "mohammed"], ["front"], "The father's pale, hollow-eyed face bends gently, touches the boy's forehead, nods, then turns away silently.",
    cam="ots", action="touch", act="father reaches gently to forehead then turns away"),
  T("M", "chambre_nuit", ["father", "zoubida", "mohammed"], ["safran", "plat", "legume", "viande"], "The saddest dinner: around the brown earthenware dish of saffron, meat and vegetables, neither parent eats or speaks.",
    cam="master", ins=[("plat_safran", 1.2)], act="both stare down motionless", sfx=["clock quiet", "room stillness"]),
  T("W", "chambre_nuit", ["cat2", "father", "zoubida"], ["chat", "queue", "oreille"], "Zineb's cat creeps in, meows timidly at the two frozen parents, widens its yellow eyes, ears back, hisses and bolts.",
    cam="low", action="cat_flee", sfx=["cat_meow timid", "cat_hiss", "cat_scurry"]),
  T("CU", "chambre_nuit", ["mohammed"], [], "Crushed by the silence, Mohammed bursts into sobs; the father stirs out of his numbness.",
    cam="low", peak=True, action="cry", sfx=["child_sob"]),
  T("CU", "chambre_nuit", ["father"], [], "'Où as-tu mal, mon enfant ?'", cam="ots", act="father turns head gently toward bed"),
  T("CU", "chambre_nuit", ["mohammed"], [], "'Je n'ai pas mal... mais pourquoi ne parlez-vous pas ?'", cam="low", peak=True, act="shoulders tremble"),
  T("M", "chambre_nuit", ["father", "mohammed"], [], "'Nous n'avons rien à dire. Repose-toi, et ne pleure plus.'", cam="master", act="father sits heavy, shoulders low"),
 ],

 "s06_ruine": [
  T("M", "patio_nuit", ["zoubida"], ["plateau", "verre", "the"], "On the dark gallery, Zoubida carries the tea tray and glasses toward the bedroom threshold.",
    cam="master", act="Zoubida holds tray walking softly", sfx=["glass clink"]),
  T("CU", "chambre_nuit", ["zoubida", "father"], ["the"], "'Tu ne prends pas de thé ?' — she finds the father already standing ready for bed.", cam="ots", act="looks up puzzled"),
  T("CU", "chambre_nuit", ["father"], ["sucre", "the"], "Father, grave and flat: 'Ne gaspille plus ton sucre... difficile d'en avoir tous les jours.'",
    cam="ots", act="head still, firm gaze"),
  T("M", "chambre_nuit", ["zoubida", "father"], ["plateau"], "Zoubida turns pale, sets the tray slowly down, and faces him squarely.",
    cam="reverse", act="sets tray down slowly, straightens"),
  T("CU", "chambre_nuit", ["zoubida"], [], "'Je pressens un grand malheur.'", cam="low", peak=True, act="trembling breath, eyes wide"),
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["joue", "cheveu", "terre"], "A sharp slap rings out! Zoubida drops to the floor, beating her cheeks and tearing at her hair in silent despair.",
    cam="master", action="slap", sfx=["slap_cheeks", "cloth rustle"]),
  T("M", "chambre_nuit", ["father", "zoubida"], ["terre"], "The father rushes to catch her wrists; they struggle briefly until Zoubida collapses face down on the floor.",
    cam="reverse", action="struggle", sfx=["struggle rustle", "floor thud"]),
  T("CU", "chambre_nuit", ["father", "zoubida"], ["haik"], "Father speaks softly over her: he lost their entire working capital in the crush of the haïk auctions.",
    cam="ots", act="father kneels gently beside her"),
  T("CU", "chambre_nuit", ["father"], ["mouchoir", "sacoche", "terre"], "He explains the handkerchief full of money must have slipped to the ground when he reached for his pouch.",
    cam="low", ins=[("mouchoir_argent", 1.2)], act="open empty hands"),
 ],

 "s07_decision": [
  T("CU", "chambre_nuit", ["zoubida"], [], "From the floor, hollow whisper: 'Qu'allons-nous faire ?'", cam="low", act="lifts head slightly"),
  T("CU", "chambre_nuit", ["father"], [], "'Je vais travailler.'", cam="ots", act="calm, unshaken nod"),
  T("CU", "chambre_nuit", ["zoubida"], [], "'Combien as-tu perdu ?'", cam="low"),
  T("M", "chambre_nuit", ["father", "zoubida"], [], "All his working capital: not even enough left to pay his apprentice or the workshop rent.",
    cam="master", act="father sits on mat, palms resting on knees"),
  T("CU", "chambre_nuit", ["zoubida"], [], "'Les marchands te connaissent. Ils ne pourraient pas te faire crédit ?'", cam="ots", act="hopeful lean forward"),
  P("dream", [], "Sunlit wheatfields outside Fès: sturdy mountain harvesters bending over golden grain under a vast sky — pride in honest work.",
    still="p03_moissonneurs", move="slow pan left to right 8% across golden harvest", sfx=["wind fields", "sickle swish"]),
  T("CU", "chambre_nuit", ["zoubida"], [], "'Tu oserais m'abandonner avec un enfant malade ?'", cam="low", peak=True, act="hands clasp chest"),
  T("M", "chambre_nuit", ["father", "zoubida"], ["menthe", "soupe"], "Father gently reminds her: would she rather be pitied by neighbours? Make him wild mint soup tomorrow.",
    cam="master", act="steady calming hand gesture"),
  T("CU", "chambre_nuit", ["zoubida"], ["bracelet"], "'Ce sont ces maudits bracelets ! Pourquoi ne les vendrais-tu pas ?'",
    cam="ots", peak=True, act="points sharply toward chest"),
  T("M", "chambre_nuit", ["father", "zoubida"], ["bracelet"], "He will sell the bracelets to feed them; faithful Driss le teigneux will bring groceries every day.",
    cam="reverse", ins=[("bracelets_vente", 1.2)], sfx=["bracelet_clink"]),
  T("CU", "chambre_nuit", ["father"], [], "One month away, saving every coin so he can reopen the weaving workshop upon his return.",
    cam="ots", act="quiet resolved gaze"),
 ],

 "s08_solitude": [
  T("CU", "chambre_nuit", ["mohammed"], [], "A thick, oily, soot-black silence settles over the room; the boy feels suffocated.",
    cam="low", act="eyes wide in darkness"),
  T("M", "chambre_nuit", ["father", "zoubida", "mohammed"], [], "The motionless parents look blurry and monstrous in the lamp shadows, terrifying the feverish boy.",
    cam="master", act="parents completely frozen like statues", sfx=["low drone"]),
  T("CU", "chambre_nuit", ["mohammed"], [], "For the first time he feels absolute void and pitiless solitude; he shuts his eyes and prays with all his strength.",
    cam="low", peak=True, act="eyes tight shut, hands clasped"),
  P("dream", [], "Cosmic solitude: a tiny silhouette standing alone on the edge of vast, silent dead planets where sound dies without an echo.",
    still="p04_planetes_mortes", move="slow zoom out into the dark expanse, 10%", sfx=["void wind low"]),
  P("dream", ["terre"], "Dawn light after winter: warm morning sun breaks over spring wildflowers and nightingales singing in green branches.",
    still="p05_aube_rossignols", move="slow rise toward sunlit blossoms, warm glow", sfx=["nightingale birds", "morning breeze"]),
 ],

 # ============================================================ ACT II: le départ du père
 "s09_depart": [
  P("flashback", ["sacoche", "faucille", "sac"], "Card LE SURLENDEMAIN, À L'AUBE. In cool blue dawn light, the father walks away down the narrow lane with his dwarf-palm shepherd bag, new sickle and canvas provisions sack.",
    still="p06_pere_aube", move="slow push-in along the dawn lane after him", ins=[("sacoche_faucille", 1.3)], sfx=["morning birds", "footsteps receding"]),
  T("M", "chambre", ["zoubida"], ["sac", "olive", "figue", "farine", "pain", "qarchala"], "Earlier packing: the canvas sack stuffed with black olives, dried figs, roasted flour, two anise loaves, and ten sesame qarchalas.",
    cam="master", enum=[("olives noires", "olives"), ("figues sèches", "figues"), ("farine grillée", "farine"), ("dix qarchalas", "qarchalas")],
    ins=[("provisions_olives", 1.3), ("qarchalas", 1.3)], sfx=["cloth pack", "bread rustle"]),
  T("M", "chambre", ["zoubida", "mohammed"], ["porte", "lit"], "Awake as his father crosses the doorway; Zoubida collapses prostrate on her bed, face buried in both hands — orphaned.",
    cam="reverse", peak=False, action="cry", act="Zoubida face in hands; Mohammed watches from bed", sfx=["door close soft", "muffled sob"]),
  T("W", "patio", ["father"], ["porte"], "Cutaway to patio: the quiet dignity of the father as the family's unseen shield — strength, security, and peace.",
    cam="master", action="walk", act="father walks steadily toward exit door"),
  T("CU", "chambre", ["zoubida", "mohammed"], ["porte"], "In the morning light of the bedroom, the boy understands why his mother grieves the empty evening ahead.",
    cam="ots", act="Zoubida sits slumped, Mohammed gazes gently at her"),
 ],

 "s10_quarante_chats": [
  T("W", "chambre", ["mohammed", "zoubida"], ["lit"], "Sunlight pours into the house; the fever has broken and Mohammed sits upright on his bed.",
    cam="master", act="Mohammed sits up, shoulders light", sfx=["morning sparrows"]),
  T("CU", "chambre", ["mohammed"], [], "'Maman, est-ce que c'est long, un mois ?'", cam="low", act="head tilts curiously"),
  T("CU", "chambre", ["zoubida"], [], "Zoubida startles out of her daze: 'Un mois dure un mois... mais pour nous, une éternité.'",
    cam="ots", act="looks up surprised, faint tired smile"),
  T("CU", "chambre", ["mohammed"], [], "'Moi, je sais attendre. J'attends d'être un homme.'", cam="low", act="solemn serious chin lift"),
  T("M", "chambre", ["zoubida", "mohammed"], [], "Zoubida stares at her six-year-old philosopher in genuine astonishment.", cam="master", act="hand to cheek in surprise"),
  P("dream", ["djellaba", "beignet", "beurre", "miel", "chat", "bigaradier"], "Child's future dream: grown Mohammed in spotless white djellaba eating hot honey-butter beignets, surrounded by forty obedient cats under a courtyard bitter-orange tree.",
    still="p07_quarante_chats", move="slow pan across the forty cats and orange blossoms",
    enum=[("belles djellabas blanches", "djellabas"), ("beignets au beurre et au miel", "beignets"), ("quarante chats", "chats"), ("un bigaradier dans la cour", "bigaradier")],
    ins=[("beignets_miel", 1.2)], sfx=["happy purrs", "dream shimmer"]),
  T("CU", "chambre", ["zoubida"], ["chat"], "'Jamais ta femme n'acceptera de veiller sur ton troupeau de chats !'",
    cam="ots", act="warm broad smile"),
  T("CU", "chambre", ["mohammed"], ["chat"], "'Je ne me marie pas ! Toi tu t'en occuperas.'", cam="low", act="firm proud nod"),
  T("M", "chambre", ["zoubida", "mohammed"], [], "Zoubida bursts out laughing; Mohammed claps his hands, then she presses one finger to her lips.",
    cam="master", action="laugh", act="mother laughs then raises finger to lips", sfx=["warm laughter", "claps"]),
  T("CU", "chambre", ["zoubida"], [], "'Chut ! Que diraient les voisins si tu riais le jour du départ de ton père ?'",
    cam="ots", act="finger stays on lips, tender eyes"),
  T("CU", "chambre", ["mohammed"], [], "'Mon père reviendra bientôt, et nous serons très riches !'", cam="low", act="beaming hopeful smile"),
  T("CU", "chambre", ["zoubida"], [], "'Tant que je serai vivante, tu n'auras jamais faim, dussé-je mendier.'",
    cam="ots", peak=True, act="reaches tenderly toward him"),
 ],

 "s11_tadeffi": [
  T("M", "patio", ["zoubida", "fatma"], ["porte"], "At the landing door: a timid scratch; Zoubida steps out into the corridor, whispers briefly, then urges Fatma inside.",
    cam="master", action="walk", sfx=["door scratch", "corridor whispers"]),
  T("CU", "patio", ["zoubida"], [], "'Entre, Fatma ! Donne-le-lui toi-même : à moi, il refusera !'", cam="ots", act="beckons eagerly toward door"),
  T("M", "chambre", ["fatma", "mohammed"], ["bol", "tadeffi", "menthe", "mur"], "Fatma enters carrying a steaming bowl of tadeffi soup; stubborn Mohammed turns his nose straight to the wall.",
    cam="reverse", ins=[("bol_tadeffi", 1.3)], act="boy turns back toward wall", sfx=["soup steam"]),
  T("CU", "chambre", ["fatma"], [], "'Comment te sens-tu ce matin, fqih ?'", cam="ots", act="gentle teasing smile"),
  T("M", "chambre", ["zoubida", "mohammed"], ["beignet"], "Zoubida bribes him gently: 'Après, j'enverrai Zineb t'acheter un beignet.'", cam="master", act="leans down coaxing"),
  T("CU", "chambre", ["mohammed"], ["bol", "soupe"], "He sits up, sniffs the bowl suspiciously, and announces he doesn't like spicy soup.",
    cam="low", act="nose up suspiciously"),
  T("M", "chambre", ["zoubida", "fatma", "mohammed"], ["soupe", "piment"], "Both women swear there isn't a speck of pepper — he catches his mother: how could she know without tasting it?",
    cam="master", act="boy points accusingly, mother freezes"),
  T("W", "chambre", ["zoubida", "fatma", "mohammed"], [], "Caught red-handed, Zoubida rolls her eyes to the ceiling beams and slips away into the kitchen.",
    cam="reverse", action="walk", act="Zoubida exits sheepishly"),
  T("CU", "chambre", ["fatma", "mohammed"], ["fromage", "farine", "bol"], "Fatma coaxes him gently: 'Allons, bonbon acidulé ! Petit fromage blanc ! Vermicelle au lait !'",
    cam="ots", act="holds out bowl warmly"),
  T("M", "chambre", ["fatma", "mohammed"], ["soupe"], "Unable to resist the sweet nicknames, Mohammed grabs the bowl and gulps the whole tadeffi down.",
    cam="master", action="drink", act="tilts bowl eagerly", sfx=["happy slurps"]),
 ],

 "s12_fenetre_rahma": [
  T("M", "chambre", ["mohammed"], ["djellaba"], "Washed and wearing his djellaba, Mohammed feels ready for real school-free holiday days.",
    cam="master", act="stands stretching arms happily"),
  T("M", "patio", ["rahma", "mohammed"], [], "Looking across from the window, Rahma greets him warmly: 'Te voilà rétabli ! Promets de ne plus tomber malade.'",
    cam="high", act="Rahma waves warmly from upper gallery", sfx=["courtyard bright"]),
  T("CU", "chambre", ["zoubida"], [], "From inside the kitchen, Zoubida replies courteously with blessings.", cam="ots"),
  T("M", "patio", ["rahma"], [], "Rahma leans on her window grille: 'Les temps deviennent durs... sachons louer Dieu.'",
    cam="master", act="Rahma sighs piously"),
  T("CU", "patio", ["mohammed"], ["trompette"], "Downstairs someone sneezes three giant sneezes and blows their nose like the Ramadan trumpet — Mohammed bursts laughing!",
    cam="low", ins=[("trompette_ramadan", 1.1)], action="laugh", sfx=["triple sneeze", "trumpet nose blow", "child laugh"]),
  T("M", "chambre", ["zoubida", "mohammed"], ["matelas"], "Zoubida steers him firmly by the shoulders back to the mattress to recite Quran verses for his father.",
    cam="master", act="Zoubida guides boy gently back to mattress"),
 ],

 # ============================================================ ACT III: le cercueil, l'orage et les deux mondes
 "s13_dejeuner_pauvre": [
  T("CU", "chambre", ["mohammed"], ["matelas"], "Sulking cross-legged on the mattress, Mohammed finds even the sunlight gloomy.",
    cam="low", act="chin resting on hands, glum"),
  T("M", "chambre", ["mohammed", "zoubida"], ["beignet", "beurre", "olive", "radis"], "Sparse lunch: two beignets, rancid butter, black olives, radishes from Fatma; the beignet tastes like bland paste.",
    cam="master", action="eat", act="chews slowly without joy"),
  T("CU", "chambre", ["zoubida", "mohammed"], ["theiere", "verre", "plateau", "bouilloire"], "No tray, no kettle: Zoubida places a chipped enamel teapot and two glasses on bare wood — the unmistakable mark of poverty.",
    cam="ots", ins=[("theiere_email", 1.3)], act="sets teapot silently on bare floor", sfx=["ceramic clink quiet"]),
  T("W", "escalier", ["zoubida"], ["haik"], "Wrapped in her white haïk, Zoubida descends the stairs alone to visit her friend Lalla Aïcha.",
    cam="high", action="walk", sfx=["footsteps_stairs"]),
 ],

 "s14_cercueil": [
  T("W", "chambre_penombre", ["mohammed"], ["boite"], "Endless lonely hours in the quiet room; Mohammed opens his Wonder Box.",
    cam="master", act="kneels slowly beside wooden box", sfx=["wood creak"]),
  P("macro", ["boite", "cercueil", "chiffon", "terre"], "Inside the Wonder Box: no magic left — a dark coffin holding the pitiful corpses of his dreams, an old rag beside it.",
    still="p08_boite_cercueil", move="slow push-in over the open box lid, shadows deepening", sfx=["hollow wood thud"]),
  P("macro", ["mur"], "Damp, scaly spots on the bedroom wall: once they danced dazzling ballets for him, now they stay frozen and sickening.",
    still="p09_taches_murs", move="slow cold drift across peeling plaster stains", sfx=["empty room hum"]),
  T("CU", "chambre_penombre", ["mohammed"], [], "Fear grips his chest despite familiar neighbours' brooms outside; exhausted by silent tears, he falls asleep.",
    cam="low", peak=True, action="cry", act="curls on back, eyes closing", sfx=["broom far", "soft sniff"]),
  T("M", "chambre_nuit", ["zoubida", "mohammed"], ["lit"], "Zoubida returns to find his fever back; she tucks him in warmly, sits close and weeps while humming softly.",
    cam="master", light="lamp_on", act="tucks blanket, rocks gently humming", sfx=["soft hum lullaby", "quiet sob"]),
 ],

 "s15_orage_flute": [
  T("M", "chambre_nuit", ["mohammed"], [], "Card LA NUIT. No dinner cooked; Mohammed tosses and turns restlessly in the dark.",
    cam="master", fade=True, act="shifts restlessly under blanket", sfx=["night crickets far"]),
  T("W", "patio_nuit", [], ["porte"], "Suddenly a violent storm breaks! Wind howls into the courtyard and slams every door.",
    cam="high", sfx=["storm wind howl", "door slam x3"]),
  P("dream", ["flute", "djinn"], "Above the storm roofs, an eerie unearthly flute melody drifts in glowing mist — forged underwater by a mad djinn.",
    still="p10_orage_djinn", move="slow tilt through storm clouds and swirling mist", sfx=["eerie flute drone", "wind howl"]),
  T("CU", "chambre_nuit", ["mohammed"], [], "Pleas, hyena laughs, cries of pain and rage echo around the trembling boy in the shadows.",
    cam="low", act="pulls blanket up to chin, eyes wide"),
  T("CU", "chambre_nuit", ["mohammed"], ["coussin"], "Shivering, he recites the Sourate de l'Unité three times, buries his face in the cushion, and drifts asleep.",
    cam="ots", act="head drops into cushion", sfx=["soft whispered prayer", "rain fade"]),
 ],

 "s16_deux_mondes": [
  P("dream", [], "Two opposite worlds: sunlit Fès of morning sparrows and childhood above, dark bottomless abysses of night fears below.",
    still="p11_deux_mondes", move="slow vertical sink from bright daylight into deep indigo shadow", sfx=["sparrows fading into drone"]),
  T("M", "chambre", ["mohammed"], ["pain"], "Morning rebirth: waking into bright sun, sparrows, fresh bread and cool spring water.",
    cam="master", act="opens eyes softly to warm morning beam", sfx=["sparrows", "water trickle"]),
  P("dream", [], "Dark dream paths: parents and the fqih with his quince rod looming in starless night trails as the small boy curls tightly.",
    still="p12_sentiers_nuit", move="slow pan along winding night path", sfx=["nightmare hum low"]),
 ],

 # ============================================================ ACT IV: le lendemain matin et Lalla Aïcha
 "s17_omelette_kanza": [
  T("M", "chambre", ["zoubida", "mohammed"], ["oeuf"], "Card LE LENDEMAIN MATIN. Bright sun floods the room; Zoubida wakes him gently and offers to fry him an egg.",
    cam="master", fade=True, act="Zoubida taps shoulder gently; boy yawns awake", sfx=["morning birds"]),
  T("CU", "chambre", ["mohammed"], ["oeuf", "piment", "persil"], "'J'aime les œufs à l'huile, avec du piment rouge et du persil !'",
    cam="low", ins=[("omelette_epices", 1.1)], act="eager smile, sitting up"),
  T("CU", "chambre", ["zoubida"], ["cumin"], "Zoubida smiles indulgently: 'J'y mettrai même une pincée de cumin.'",
    cam="ots", act="warm grin"),
  T("M", "patio", ["rahma"], ["plat"], "Rahma calls merrily from her window: 'Nous appelons ce plat une omelette juive !'",
    cam="high", act="Rahma laughs leaning out"),
  T("M", "chambre", ["zoubida", "mohammed"], [], "Zoubida laughs back through the window: 'Il a des envies comme une femme enceinte !'",
    cam="reverse", action="laugh", act="Zoubida chuckles warmly"),
  T("M", "patio", ["woman1", "woman2"], ["fromage"], "All the courtyard neighbours laugh together as old Tante Kanza starts a tall tale from her window.",
    cam="master", action="laugh", sfx=["women laughter"]),
  P("flashback", ["fromage"], "Kanza's tale: a stingy milkman refusing a crumb of white cheese — and the newborn baby marked with a dab of cheese on its belly!",
    still="p13_laitier_fromage", move="slow push-in on the dairy shop counter, warm comic ink", sfx=["comic chime"]),
  T("CU", "patio", ["voisine"], ["fromage", "front", "joue"], "A dry-humoured neighbour quips: 'Heureusement que le fromage ne pendait pas à son front ou sur sa joue !'",
    cam="ots", act="deadpan serious nod", sfx=["chuckle"]),
 ],

 "s18_driss_depart": [
  T("M", "chambre", ["zoubida"], ["porte", "pain", "beurre", "olive"], "Driss le teigneux calls from the street door; Zoubida packs bread, rancid butter and olives in greasy paper.",
    cam="master", ins=[("pain_olives", 1.1)], act="wraps parcel briskly", sfx=["door call far", "paper wrap"]),
  T("M", "patio", ["zoubida"], ["seau", "jarre"], "At the courtyard well, she fills Tante Kanza's bucket and carries water back up to fill the clay kitchen jar.",
    cam="reverse", ins=[("jarre_eau", 1.1)], action="walk", sfx=["water pour", "footsteps_stairs"]),
  T("CU", "chambre", ["zoubida", "mohammed"], [], "Zoubida wraps in her haïk: they're going to visit Lalla Aïcha and Qalqlyine — 'Mouche-toi donc !'",
    cam="ots", act="tucks haïk fold, gestures sharply at boy"),
  T("M", "chambre", ["mohammed"], ["mouchoir", "coussin", "djellaba"], "Boy hunts out a crumpled handkerchief under a cushion, blows his nose loudly, and wipes wet fingers on his djellaba.",
    cam="master", act="reaches under cushion, wipes sleeve guiltily", sfx=["nose blow loud"]),
  T("M", "patio", ["fatma", "zoubida"], [], "Out on the gallery, Fatma leans out eagerly: 'Où vas-tu ? Sidi Larbi a-t-il répudié la fille du coiffeur ?'",
    cam="high", act="Fatma leans forward whispering"),
  T("CU", "patio", ["zoubida"], [], "Zoubida lifts her veil proudly to spill every juicy secret about Sidi Larbi's troubled in-laws.",
    cam="ots", act="head high, smug animated hands", sfx=["women chatter"]),
 ],

 "s19_medina": [
  T("W", "rue_tijani", ["mohammed", "zoubida"], ["mosaique", "grille"], "In the medina lane: past Sidi Ahmed Tijani's mosaic wall; Zoubida slips her hand into the bronze alms grille without dropping a coin.",
    cam="master", ins=[("tronc_tijani", 1.2)], action="walk", sfx=["medina murmur", "slippers cobblestone"]),
  T("CU", "rue_tijani", ["zoubida", "mohammed"], ["joue", "grille", "mosaique", "mur"], "Zoubida presses her cheek to the woodwork praying; too small to reach, Mohammed kisses the cold mosaic wall.",
    cam="low", act="Zoubida cheek near grille; boy leans to touch tile"),
  T("CU", "rue_tijani", ["zoubida"], [], "'Viens, mon petit œil, et qu'Allah te préserve de tout mal !'",
    cam="ots", act="looks down tenderly"),
  T("M", "rue_legumes", ["zoubida", "marchand", "mohammed"], ["poivron", "tomate"], "Round the corner: a vegetable stall with neat pyramids of peppers and tomatoes; Zoubida pokes and topples them.",
    cam="master", action="poke", act="Zoubida pokes vegetables; marchand steps forward angry", sfx=["market bustle"]),
  T("CU", "rue_legumes", ["marchand"], [], "Furious vendor snaps: 'Cette marchandise n'est pas à vendre ! Surtout à une cliente aussi ennuyeuse !'",
    cam="ots", peak=True, act="waving hands angrily"),
  T("M", "rue_legumes", ["zoubida", "mohammed", "marchand"], [], "Dignified Zoubida tells him to clear away his rubbish; little Mohammed tugs her sleeve to pull her away.",
    cam="reverse", action="tug", act="boy pulls mother forward past glaring seller"),
  T("W", "rue_tijani", ["zoubida", "mohammed"], ["portail"], "On the left rises a towering monumental doorway studded with bronze nails and heavy knockers.",
    cam="high", ins=[("portail_bronze", 1.2)], act="boy stares up in awe"),
  T("CU", "rue_tijani", ["mohammed"], [], "'Maman, à qui appartient cette grande maison ?'", cam="low", act="points upward"),
  T("CU", "rue_tijani", ["zoubida"], [], "'C'est un bureau de Chrétiens. Ils paient bien ceux qui connaissent leur langue.'",
    cam="ots", act="glances sideways cautiously"),
  T("CU", "rue_tijani", ["mohammed"], [], "'Est-ce que je parlerai la langue des Chrétiens quand je serai grand ?'",
    cam="low", act="wide innocent curiosity"),
  T("CU", "rue_tijani", ["zoubida"], [], "'Dieu te préserve de tout contact avec ces gens-là !'",
    cam="ots", act="quick protective tug of hand"),
 ],

 "s20_aicha_misere": [
  T("M", "aicha_pauvre", ["aicha", "zoubida", "mohammed"], ["bouilloire"], "2nd floor at Zenqat-Hajjama: Lalla Aïcha welcomes them seated beside her steaming kettle in a stripped room.",
    cam="master", act="Aïcha gestures gently from floor", sfx=["kettle hiss"]),
  T("W", "aicha_pauvre", ["aicha", "zoubida", "mohammed"], ["matelas", "cretonne", "carpette", "etagere", "assiette"], "Bleak misery: gone are the bright cretonne, cheerful rugs, painted wooden shelves and decorated porcelain bowls.",
    cam="reverse", act="slow pan across bare room", sfx=["empty silence"]),
  T("CU", "aicha_pauvre", ["aicha", "mohammed"], ["horloge", "mur", "matelas", "crin", "chat"], "A pale rectangle marks where the wall clock once hung; hard straw-stuffed mattresses; outside a starving kitten cries.",
    cam="low", ins=[("tache_horloge", 1.2)], act="boy glances toward empty wall", sfx=["kitten meow far"]),
  T("M", "aicha_pauvre", ["aicha", "zoubida"], ["the", "plateau", "cuivre"], "With quiet, unbroken dignity, Lalla Aïcha pours tea on a small brass tray with worn engravings.",
    cam="master", action="pour", act="Aïcha pours slowly", sfx=["tea pour"]),
 ],

 "s21_sidi_el_arafi": [
  T("M", "aicha_pauvre", ["aicha", "zoubida", "mohammed"], [], "Heavy silence settles; each of the three sinks into private thoughts before Aïcha speaks.",
    cam="master", act="all three still, eyes lowered"),
  P("dream", [], "A sun-dappled narrow lane in quartier Seffah leading toward an arched doorway where blind seer Sidi El Arafi sits waiting.",
    still="p14_seffah_arafi", move="slow push forward down the narrow Seffah alley", sfx=["distant birds", "soft footsteps"]),
  T("CU", "aicha_pauvre", ["aicha"], [], "Aïcha speaks quietly: 'Il est aveugle, mais tout ce qu'il prédit se réalise... Mon nid a été saccagé.'",
    cam="ots", peak=True, act="eyes glisten, gentle nod"),
  T("M", "aicha_pauvre", ["zoubida", "mohammed", "aicha"], [], "Zoubida nods solemnly; Mohammed sighs softly, knowing sighing fits such grown-up moments.",
    cam="reverse", act="Zoubida nods; boy sighs gravely"),
  T("CU", "aicha_pauvre", ["zoubida"], [], "'Je tremble pour ma maison, pour mon mari, pour mon fils. Sidi El Arafi nous aidera.'",
    cam="ots", peak=True, act="leans earnestly toward friend"),
  T("CU", "aicha_pauvre", ["aicha"], [], "'Faisons ce qui est en notre pouvoir, puis remettons-nous-en à Dieu. Ayons confiance.'",
    cam="low", act="calm reassuring palm"),
  T("M", "aicha_pauvre", ["aicha", "zoubida", "mohammed"], ["haik"], "Stout Lalla Aïcha pulls herself painfully off the floor, wraps her haïk, and they step out toward hope.",
    cam="master", action="stand", act="Aïcha rises slowly, takes haïk", sfx=["cloth rustle", "footsteps"]),
 ],

 # ============================================================ FICHE + ENDCARD
 "s22_fiche": [
  dict(mode="title", visual="Fiche: Chapitre IX card — La ruine et le départ, en quatre temps.", room="fiche"),
  dict(mode="title", visual="Four squares: la fièvre & ruine / départ du père / cercueil & orage / misère de Lalla Aïcha.", room="fiche",
       enum=[("la fièvre et la perte du capital", "perte"), ("le départ du père", "départ"), ("le cercueil et l'orage", "cercueil"), ("la misère de Lalla Aïcha", "Aïcha")]),
  dict(mode="title", visual="Detail: Sidi Abdeslem refuses credit -> sells bracelets -> 1 month harvest.", room="fiche"),
  dict(mode="title", visual="Detail: Wonder Box becomes a coffin; decision to see blind Sidi El Arafi.", room="fiche"),
  dict(mode="title", visual="Four themes + teaser for Chapitre X: Sidi El Arafi.", room="fiche",
       enum=[("la ruine et la pauvreté", "ruine"), ("l'absence du père", "absence"), ("la solitude et la peur", "solitude"), ("la solidarité féminine", "solidarité")]),
 ],
}

TITLE = {
 "s02_titre": dict(mode="title", text="La Boîte à Merveilles · Chapitre IX · La ruine et le départ", dur=4.0,
                   visual="ep06 rosette title: zellige rosette blooms in indigo, Arabic + French titles, CHAPITRE IX · LA RUINE ET LE DÉPART"),
 "s23_endcard": dict(mode="title", text="fin", dur=4.0, visual="end card: next episode (chapter 10, Sidi El Arafi) + subscribe; no TikTok/WhatsApp"),
}

PATCH = {}


def main():
    sc = json.load(open(os.path.join(D, "script.json")))["scenes"]
    B, n = [], 0
    for s in sc:
        sid = s["id"]
        if sid in TITLE:
            n += 1
            B.append({"id": f"b{n:03d}", "scene": sid, **TITLE[sid]})
            continue
        ann = A[sid]
        assert len(ann) == len(s["lines"]), f"{sid}: {len(ann)} annotations for {len(s['lines'])} lines"
        for i, (l, a) in enumerate(zip(s["lines"], ann)):
            n += 1
            a = dict(a)
            a = {k: v for k, v in a.items() if v is not None}
            b = {
                "id": f"b{n:03d}",
                "scene": sid,
                "text": l["sub"],
                "speaker": l["who"],
                "dur": round(len(l["sub"].split()) / WPS + .4, 1),
                **a,
            }
            if b["mode"] == "title":
                b["dur"] = min(b["dur"], 4.0)
            for key in ("card", "tag", "music"):
                if key in s and i == (len(s["lines"]) - 1 if key == "tag" else 0):
                    b.setdefault(key, s[key])
            for key in ("ins", "enum"):
                if key in b:
                    b[key] = [list(x) for x in b[key]]
            if "hold" in b:
                b["hold"] = list(b["hold"])
            if b.get("peak") is False:
                del b["peak"]
            if sid in ("s19_medina",) and "zoubida" in b.get("cast", []):
                b["costume"] = {"zoubida": "haik"}
            if sid == "s21_sidi_el_arafi" and i == len(s["lines"]) - 1:
                b["costume"] = {"zoubida": "haik", "aicha": "haik"}
            b.update(PATCH.get(b["id"], {}))
            B.append(b)
    json.dump({"episode": "ep09", "chapter": 9, "lint": {"HOOK_MAX": 14, "TITLE_MAX": 10}, "beats": B},
              open(os.path.join(D, "beats.json"), "w"), ensure_ascii=False, indent=1)
    p = sum(1 for b in B if b.get("mode") == "painting")
    print(len(B), "beats,", p, f"paintings ({p / len(B):.0%}),",
          sum(len(b.get("ins", [])) for b in B), "inserts,",
          sum(1 for b in B if b.get("enum")), "enumerations,",
          len({(b.get('room'), b.get('cam')) for b in B if b.get('mode') == '3d'}), "plate angles")


if __name__ == "__main__":
    main()
