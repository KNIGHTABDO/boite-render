#!/usr/bin/env python3
"""ep08 (2026-11-08): Chapitre VIII, les bracelets soleil et lune. Every line carries an acting direction (ep07 feedback #4).
   "enum" = items the narration lists: each one gets its own visual, timed to its word (ep07 feedback #3).
   Builds script.json for ep08. ' | ' = <short pause>.
   python3 episodes/ep07/mk_script.py
   PHON respells names for the TTS input only; subtitles ("sub") keep the book's spelling (POSTMORTEM R11).
   Scene extras: card = day card burned over the first shot; tag = "À retenir" card; music = designed score cue (R10)."""
import json, os, re

V = {
    "narrator": ("Gacrux", "Moroccan man in his 50s from Fès, speaks French with a light Fassi accent, warm nostalgic storyteller, lively pace, close to the microphone"),
    "mohammed": ("Leda", "shy 6-year-old Moroccan boy from Fès, soft voice, speaks French with a light Moroccan accent"),
    "zoubida": ("Kore", "Moroccan mother from Fès, about 22, speaks French with a Fassi accent, fast, expressive, dramatic"),
    "father": ("Charon", "Moroccan man from Fès, about 45, calm, gentle, low voice, speaks French with a Fassi accent, few words"),
    "fqih": ("Schedar", "Moroccan Koranic schoolmaster from Fès, about 50, grave, nasal, speaks French with a Fassi accent"),
    "kanza": ("Vindemiatrix", "old Moroccan woman, a fortune-teller from Fès, about 60, raspy, slow, honeyed and mysterious, speaks French with a Fassi accent"),
    "femmes": ("Aoede", "a group of Moroccan women in a courtyard house shouting together, laughing and begging for mercy, loud"),
    "aicha": ("Pulcherrima", "plump Moroccan noblewoman from Fès, about 50, affected, sugary, a bit pompous, loves to gossip, speaks French with a Fassi accent, breathy"),
    "fatma": ("Despina", "poor but generous Moroccan neighbour from Fès, about 35, warm, laughing, speaks French with a Fassi accent"),
    "rahma": ("Autonoe", "Moroccan woman from Fès, about 35, loud, a gifted comic storyteller, speaks French with a Fassi accent"),
}

# TTS respellings (the TTS input only).
PHON = {
    "Abderrahman": "Abderrahmane", "Msid": "M'sid", "fqih": "fquih", "Zineb": "Zinèbe", "Kanza": "Kenza",
    "Hammad": "Hammade", "Achaa": "Icha", "Azzouz": "Azzouze", "Bnou Achir": "Bnou Achire",
    "Lamrani": "Lamrani", "Chérifa": "Chérifa", "tarifa": "tarifa", "Aïcha": "Aïcha",
    "Abdeslem": "Abdesslam", "Haj": "Hadj", "Berrada": "Berrada",
}

S = [
 # ------------------------------------------------------------------ opening (ep06 pattern): quiet hook, then the rosette title
 ("s01_hook", {"lead": 1.5, "tail": 1.5}, [
  ("narrator", "Ce lundi-là, | mon père promit à ma mère | des bracelets d'or et d'argent.", "soft, intimate, remembering a day that started happily, slow"),
  ("narrator", "Le soir même, | elle pleurait dans le noir. | Et moi, | j'attendais.", "darker, slower, a small catch in the voice on 'elle pleurait', long pause before 'j'attendais'"),
 ]),
 ("s02_titre", {"lead": 0, "tail": 0, "hold": 9}, []),

 # ------------------------------------------------------------------ ACT I: l'été
 ("s03_mouches", {"card": "L'ÉTÉ", "enum": ["chaux vive", "soufre", "pétrole", "talismans", "poudres", "invocations"]}, [
  ("narrator", "Après les fêtes de l'Achoura, | la vie retomba dans sa grisaille. | La chaleur commença à sévir.", "tired, heavy, the party is over, slow sigh in the voice"),
  ("narrator", "Des colonies de mouches envahirent la maison. | Et dans les vieilles boiseries, | les punaises se réveillèrent.", "amused disgust, a little buzz of mischief"),
  ("narrator", "Ma mère leur déclara une guerre totale. | Chaux vive. | Soufre. | Pétrole.", "mock-epic, like a war chronicle, each weapon hit separately with a beat between them"),
  ("narrator", "Puis des armes plus sournoises : | des talismans, | des poudres de faiseur de miracles, | des invocations.", "lower, conspiratorial, comic, one beat per item"),
  ("narrator", "Seules quelques familles survécurent, | là-haut, | le long des poutres du plafond. | Descendre à portée des doigts de l'homme, | c'était se suicider.", "deadpan tragic, mock-solemn eulogy for the bedbugs"),
  ("narrator", "Chaque matin, | ma mère chassait les mouches à grands coups de torchon. | Elles sortaient par la fenêtre, | en bourdonnant de colère.", "lively, rhythmic like the torchon swings, smiling"),
 ]),
 ("s04_mausolee", {"tag": "À RETENIR : en été, le Msid s'installe dans un mausolée", "music": "mausolee"}, [
  ("narrator", "Les journées devinrent longues. | La salle du Msid, | trop chaude et trop étroite, | fut abandonnée.", "calm, a breath of relief"),
  ("narrator", "Un matin, | nous emportâmes nos planchettes et nos encriers | dans un petit sanctuaire, | deux pas plus loin.", "light, a small adventure, children carrying their things"),
  ("narrator", "Ce mausolée abritait la tombe d'un saint. | Personne ne savait son nom. | Mais le jeudi, | les jeunes filles qui voulaient se marier dans l'année | venaient faire sept fois le tour du tombeau.", "hushed, a little mysterious, tender amusement on the girls"),
  ("narrator", "La grande salle était d'une fraîcheur de paradis.", "wonder, slow, savouring the word paradis"),
  ("narrator", "À l'appel du muezzin, | le fqih nous imposa silence. | Nous fîmes nos ablutions | à la petite fontaine qui chantonnait dans un coin.", "quiet, reverent, gentle, the water sound in the voice"),
  ("narrator", "Petits et grands, | alignés derrière notre maître, | nous fîmes la prière. | Deux fois par jour, | tout l'été.", "grave, serene, slow, very calm"),
 ]),
 ("s05_memoire", {}, [
  ("narrator", "La lumière douce, | le visage plus bienveillant du fqih... | Je me mis à aimer l'école.", "warm surprise, as if confessing something unexpected"),
  ("narrator", "Ma mémoire fit des miracles. | De dix lignes sur ma planchette, | je passai à quinze.", "proud, growing, a little boast on 'quinze'"),
  ("narrator", "Un vendredi, | mon père, | gonflé d'orgueil, | raconta à ma mère ce que le fqih lui avait dit.", "playful, imitating a proud father"),
  ("father", "Si ton fils continue ainsi, | il deviendra un savant. | Un savant dont nous serons fiers.", "proud and tender, trying to stay modest, a smile in the low voice"),
  ("narrator", "Un savant ? | Pour moi, | un savant, | c'était un homme obèse, | une barbe autour d'une très large figure, | et un turban monumental.", "comic horror, building the absurd image piece by piece"),
  ("narrator", "Je n'avais aucune envie de ressembler à cet homme-là.", "deadpan, firm, comic"),
 ]),
 ("s06_reves", {"enum": ["le matin : les versets", "l'après-midi : deux heures de rêve"]}, [
  ("narrator", "J'apprenais ma leçon | parce que mes parents m'en aimaient davantage. | Et pour éviter la baguette de cognassier.", "honest, a little sheepish, wince on 'baguette'"),
  ("narrator", "Je m'étais fait un programme. | Le matin, | j'apprenais mes versets avec ferveur. | L'après-midi, | je m'accordais deux bonnes heures de rêve, | en faisant semblant de réciter.", "conspiratorial, a child's secret plan, sly smile on 'faisant semblant'"),
  ("narrator", "Mon esprit s'échappait de l'école. | Parfois, | je devenais l'homme que je voulais être plus tard.", "dreamy, opening up, the voice lifts"),
  ("narrator", "Simple et robuste, | vêtu de laine grège, | les yeux pleins de flamme, | et le cœur débordant de tendresse.", "tender, heartfelt, slow, each quality given its own breath"),
  ("narrator", "La nuit, | sous ma couverture, | je continuais le même songe... | jusqu'à ce que d'immenses îlots noirs | viennent tout briser.", "hushed bedtime voice that darkens and slows on 'îlots noirs'"),
 ]),

 # ------------------------------------------------------------------ ACT II: les bracelets
 ("s07_lundi", {"card": "UN LUNDI", "tag": "À RETENIR : le haïk, grande étoffe blanche des femmes de Fès"}, [
  ("narrator", "Un lundi, | mon père, | contre toutes ses habitudes, | vint déjeuner à la maison.", "intrigued, something unusual is happening"),
  ("father", "Les djellabas de laine se vendent mal en été. | Je vais fabriquer des haïks de coton. | Été comme hiver, | les femmes de Fès ne sortent qu'enveloppées dedans.", "calm, practical, a man explaining his business plan, quietly pleased with the idea"),
  ("father", "Et aujourd'hui, | je vous emmène tous les deux | au souk des bijoux.", "a gentle surprise, warm, eyes twinkling"),
  ("father", "Zoubida, | il y a longtemps que tu me demandes les bracelets soleil et lune. | Il est temps que je te les offre.", "tender, generous, looking at his wife, soft"),
  ("narrator", "Soleil et lune : | un bracelet d'or, | et un bracelet d'argent.", "explaining clearly, gently, like a footnote"),
  ("father", "Mon ouvrier a perdu sa mère, | à la campagne. | Il est parti pour l'enterrement.", "grave, lower, respectful"),
  ("zoubida", "Elle est morte d'une maladie ?", "quick, curious, a little anxious"),
  ("father", "Surtout de vieillesse, je crois. | Que Dieu la reçoive dans sa miséricorde.", "calm, gentle, a short blessing"),
  ("mohammed", "Mais... | je ne peux pas manquer le Msid ! | J'ai ma leçon à apprendre.", "worried, very serious, a good little pupil"),
  ("father", "Ne te tourmente pas. | J'ai prévenu le fqih. | Tu travailles bien, | cette demi-journée sera ta récompense.", "reassuring, warm, proud"),
  ("father", "Mais peut-être que tu n'aimes pas | les jolis bijoux ?", "teasing gently, playful"),
 ]),
 ("s08_fleurs", {}, [
  ("mohammed", "Oh si ! | Les bijoux, | c'est beau... | c'est beau comme...", "excited then shy, slowing down, losing courage, trailing off"),
  ("father", "Beau comme quoi ?", "soft, encouraging, curious"),
  ("narrator", "Je baissai les yeux.", "very soft, slow, intimate"),
  ("mohammed", "Les bijoux, | c'est beau comme les fleurs.", "whispered confidence, shy, sincere, almost sacred"),
  ("narrator", "Mon père et ma mère éclatèrent de rire.", "flat, a little hurt, pause after it"),
  ("narrator", "Je trouvai leur réaction déplacée. | Un doute se glissa en moi | sur la qualité de leur intelligence.", "offended dignity, dry comic irony"),
 ]),
 ("s09_escalier", {"music": "escalier", "enum": ["les soucis et les coquelicots", "les marguerites", "les liserons", "le géranium", "les œillets", "les roses d'Ispahan"]}, [
  ("narrator", "Après le déjeuner, | j'allai m'asseoir dans l'escalier. | Accroupi sur une marche, | les mains sur les genoux, | je réfléchis profondément.", "slow, thoughtful, a small philosopher"),
  ("narrator", "Ma comparaison exprimait une idée essentielle. | Elle méritait le silence. | Pas le rire.", "firm, quietly wounded, the last two words short and hard"),
  ("narrator", "Je connaissais quelques fleurs. | Les soucis et les coquelicots, | sur les tombes au printemps. | Les marguerites dodues, | qui offrent au soleil leur cœur d'or. | Les liserons, | sur les collines de Bab Guissa.", "loving, lyrical, each flower savoured, smiling"),
  ("narrator", "Et sur notre terrasse, | dans des morceaux de poterie : | du géranium, | des œillets, | et des roses d'Ispahan.", "tender, almost a whisper on 'roses d'Ispahan'"),
  ("narrator", "Les bijoux de fête, | eux, | avaient été forgés par des génies, | dans des palais souterrains. | Ils gardaient encore la couleur des flammes | où leur or avait coulé.", "storyteller's magic voice, wonder, slow, mysterious"),
  ("narrator", "Ils naissaient de l'amour, | pour des princesses de légende. | Et sous les pas de ces princesses, | naissaient d'autres bijoux, | plus fragiles : | les fleurs.", "awe, building softly to the revelation, a breath before 'les fleurs'"),
  ("narrator", "Mais à six ans, | je n'avais pas les mots pour dire tout cela.", "gentle, nostalgic, a little sad"),
  ("narrator", "Je pardonnais aux grandes personnes de me gronder, | même de me frapper. | Mais je leur en voulais à mort | de ne pas essayer de me comprendre.", "rising emotion, the old pain still alive, strong on 'à mort', then quiet"),
  ("narrator", "Pour ma mère, | j'étais parfait | si je me lavais les pieds. | Pour mon père, | si je copiais ses gestes à la prière. | Pour les voisins, | si je ne faisais pas de bruit.", "ironic, rhythmic list, slight bitterness, one beat per person"),
  ("narrator", "Alors, | accroupi sur ma marche, | je me répétais : | les bijoux, | c'est beau comme les fleurs.", "quiet stubbornness, tender, slow, the phrase like a secret prayer"),
 ]),
 ("s10_roi", {}, [
  ("zoubida", "Que fais-tu dans l'escalier ?", "calling from upstairs to the whole house, loud, suspicious"),
  ("mohammed", "Je joue.", "too innocent, a bit hypocritical"),
  ("zoubida", "À quoi tu joues ?", "louder, insisting"),
  ("mohammed", "Au roi.", "small, proud, dead serious"),
  ("zoubida", "Je me demande ce que peut faire un roi | dans l'escalier, | accroupi sur une marche !", "theatrical, taking the whole house as witness, mocking but affectionate"),
  ("narrator", "Les voisines se mirent à rire.", "rueful, flat"),
  ("rahma", "Lalla Zoubida, | ton fils ira loin. | Il se prend déjà pour un roi !", "cheeky, a little insolent, loud laugh in the voice"),
  ("narrator", "Que pouvait comprendre la femme d'un fabricant de charrues | aux princes et aux rois ?", "offended, haughty child, comic"),
  ("narrator", "Ce soir, | ma mère aurait aux poignets les bracelets soleil et lune. | Et Rahma serait verte de jalousie. | Déjà, | dans ma tête, | je l'entendais se plaindre pendant des jours :", "gleeful, a sly little triumph, smiling, then dreamy on 'dans ma tête'"),
  ("rahma", "Je n'ai pas de chance. | Mon mari peut à peine m'offrir une corde pour tirer l'eau du puits !", "imagined, exaggerated self-pity, whining, comic"),
  ("zoubida", "Ma sœur, | à quoi sert d'accuser le destin ? | Dieu donne à chacun selon son cœur.", "overly courteous, sweet with a hidden sting, imagined"),
  ("femmes", "Il n'y a de Dieu que Dieu !", "women together, pious, in unison"),
 ]),
 ("s11_depart", {"tag": "À RETENIR : l'Aâsser, la prière de l'après-midi"}, [
  ("narrator", "Et justement, | le muezzin appela à la prière.", "light, a smiling transition"),
  ("mohammed", "C'est la prière de l'Aâsser, maman ?", "eager, impatient"),
  ("zoubida", "Oui. | Ton père ne va pas tarder. | Change ta djellaba, | celle-ci est pleine de taches.", "busy, practical, quick"),
  ("narrator", "Dans sa chambre, | le petit balai de Fatma Bziouya s'arrêta net. | Elle passa la tête par notre porte.", "playful suspense, tiptoeing rhythm"),
  ("fatma", "Je dois me préparer, moi aussi ?", "whispered, furtive, hopeful"),
  ("narrator", "Ma mère fit oui de la tête. | Un couvercle de coffre claqua.", "quick, comic, snap on 'claqua'"),
  ("father", "Il n'y a personne ? | Je peux passer ?", "calling up the stairwell from the ground floor, polite, resonant"),
  ("kanza", "Passe, | maalem Abdeslem.", "from deep inside her smoky room, slow, raspy"),
 ]),

 # ------------------------------------------------------------------ ACT III: le souk des bijoux
 ("s12_souk", {"card": "LE SOUK DES BIJOUX", "music": "souk", "tag": "À RETENIR : le dellal, courtier des enchères"}, [
  ("narrator", "Le souk des bijoutiers ressemblait à une fourmilière. | On se bousculait dans tous les sens.", "busy, rising energy, a little overwhelmed"),
  ("narrator", "Ma mère et Fatma Bziouya nous suivaient à petits pas, | enveloppées dans leurs haïks blancs.", "lighter, observing, small steps in the rhythm"),
  ("narrator", "Les bijoux des boutiques semblaient coupés dans du fer-blanc. | Ces bijoux-là ne ressemblaient pas aux fleurs. | Des mains humaines les avaient faits | sans amour.", "disappointed, disillusioned, slower and sadder at 'sans amour'"),
  ("narrator", "Dans les coins, | des hommes et des femmes retenaient leurs larmes.", "quiet, compassionate, slow"),
  ("narrator", "Plus tard, | j'ai compris. | J'ai connu moi aussi cette humiliation : | venir vendre ce qu'on a de plus précieux, | pour la moitié de son prix.", "the adult narrator, grave and personal, real old sorrow"),
  ("narrator", "Un grand diable de dellal, | aux yeux extatiques, | criait un chiffre à perdre haleine.", "vivid, a little breathless, comic portrait"),
  ("narrator", "Mon père prit de ses mains | une paire de bracelets : | l'un en or, | l'autre en argent.", "focused, precious, slow on the two metals"),
  ("narrator", "Ma mère les essaya quatre ou cinq fois. | Fatma Bziouya les essaya à son tour. | Un quart d'heure de discussion, | pour chaque détail.", "amused, counting, gently teasing the women"),
  ("narrator", "Mon père fit un signe. | Le chiffre changea. | Et le dellal plongea dans la foule. | Sa main seule voyagea un moment, | au-dessus des têtes, | avec les bracelets.", "suspense, following the hand with the voice, the bracelets floating away"),
 ]),
 ("s13_attente", {}, [
  ("narrator", "Nous attendîmes longtemps. | Mes jambes ne me portaient plus. | Je bâillais à me décrocher les mâchoires.", "exhausted, dragging, a yawn in the voice"),
  ("narrator", "Le dellal revint. | Le chiffre avait augmenté. | Mon père fit signe. | Et le dellal disparut de nouveau.", "impatient, clipped, rhythmic like a game repeating"),
  ("narrator", "Le souk battait son plein. | Les courtiers criaient des chiffres, | couraient, | entraînaient les clients par la main.", "rising chaos, faster, louder"),
  ("narrator", "Parfois, | une vague d'hommes en délire nous écrasait contre le mur, | puis repartait plus loin.", "breathless, pressed, a gasp"),
  ("narrator", "Mon père me souleva dans ses bras | et me serra contre sa poitrine. | Son front ruisselait de sueur.", "warm, safe, tender in the middle of the noise"),
  ("zoubida", "Que tous les saints le punissent, ce mécréant ! | Il nous prend pour des campagnards ? | Nous ne nous laisserons pas rouler !", "furious, cursing, fast, dramatic, hands in the air"),
  ("narrator", "Mais le mécréant restait invisible.", "dry, comic deadpan"),
 ]),
 ("s14_bagarre", {"music": "bagarre"}, [
  ("narrator", "Brusquement, | mon père me posa à terre, | et disparut dans la foule.", "sudden, alarmed, the voice drops"),
  ("narrator", "Des cris éclatèrent à l'autre bout du souk, | comme un orage. | La foule ondula, | comme une mer.", "tense, building like a storm"),
  ("narrator", "Tout le monde se mit à courir.", "urgent, fast"),
  ("zoubida", "Allah ! | Allah ! | Mes pieds !", "panicked, crushed in a crowd, crying out, holding her haïk"),
  ("fatma", "Allah ! | Mon haïk !", "panicked, breathless, crushed in a crowd"),
  ("narrator", "Enfin, | ils passèrent : | mon père et le dellal, | se tenant mutuellement par le collet.", "shocked, slow-motion, every word heavy"),
  ("narrator", "Les yeux rouges. | De l'écume au coin des lèvres. | Mon père avait perdu son turban. | Le dellal avait du sang sur la joue.", "horrified child's eyes, short broken sentences, a beat between each detail"),
  ("narrator", "Et tout le souk leur faisait cortège.", "dazed, quiet"),
 ]),
 ("s15_fruits_secs", {}, [
  ("narrator", "Ma mère, | la voisine | et moi, | nous nous mîmes à pleurer bruyamment.", "a lump in the throat, close to tears"),
  ("narrator", "Nous courûmes au hasard, | jusqu'au souk des fruits secs. | Aucune trace d'eux.", "breathless, lost, searching"),
  ("narrator", "Je m'attendais à des rues désertes, | des babouches perdues dans la panique. | Rien. | On vendait, | on achetait, | on plaisantait. | Des garnements chantaient même des refrains à la mode.", "bitter disbelief, the indifference of the world, slower and colder"),
  ("narrator", "Notre tristesse devenait étouffante. | Nous nous sentions tout seuls.", "lonely, heavy, slow"),
  ("zoubida", "Il ne sert à rien de courir partout. | Rentrons, | pour attendre | et pour pleurer.", "broken, exhausted, resigned, very quiet"),
 ]),

 # ------------------------------------------------------------------ ACT IV: la nuit
 ("s16_noir", {"music": "noir"}, [
  ("narrator", "À la maison, | ma mère enleva son haïk, | s'assit sur un matelas, | la tête dans ses deux mains, | et pleura | en silence.", "very soft, slow, deeply moved, almost a whisper at 'en silence'"),
  ("narrator", "Pour la première fois, | sa douleur me bouleversait. | Ce n'étaient pas ses grands cris habituels. | Ses larmes coulaient sur son menton, | et elle restait là, | sans bouger.", "tender, the child understanding something new, moved, slow"),
  ("narrator", "Je pleurai un moment, moi aussi. | Puis je m'étendis sur le lit, | les yeux au plafond, | et j'attendis.", "quiet, a small sniff in the voice, resigned"),
  ("narrator", "Ma mère pleurait. | Et moi, | j'attendais. | J'étais habitué à cet exercice.", "gentle bitter irony, sad smile"),
  ("narrator", "Le soir tomba. | Toutes les fenêtres de la maison s'allumèrent. | Notre pièce restait obscure.", "dim, hushed, slower"),
  ("narrator", "Dans le noir, | des figures monstrueuses se formaient devant mes yeux, | se transformaient, | devenaient d'immenses étincelles vertes.", "eerie, hypnotic, a child half-dreaming, slow"),
 ]),
 ("s17_retour", {}, [
  ("narrator", "Enfin, | la voix de mon père troua les ténèbres. | Ses pas résonnèrent dans l'escalier.", "relief breaking through, rising hope"),
  ("narrator", "La porte s'ouvrit. | Sa silhouette se détacha, | toute noire, | sur le gris du mur.", "suspense, slow, a held breath"),
  ("father", "Pourquoi n'avez-vous pas allumé la lampe ? | Où sont les allumettes ?", "tired, gruff on the surface, calm"),
  ("zoubida", "Sur l'étagère, | contre la boîte à thé.", "tiny voice like a little girl, broken, sniffling"),
  ("father", "Si Mohammed dort déjà ?", "softer, looking for his son in the dark"),
  ("mohammed", "Non, papa. | Je ne dors pas.", "small, quick, relieved"),
  ("father", "Que faisais-tu dans le noir ?", "gentle, a bit surprised"),
  ("mohammed", "J'attendais ton retour.", "simple, heartfelt, tiny tremble"),
  ("narrator", "La lampe s'alluma. | Le visage de ma mère ruisselait encore de larmes.", "soft, the light revealing the pain"),
  ("father", "Pourquoi tant de larmes ? | Tout est rentré dans l'ordre. | J'ai corrigé ce mécréant. | Et voici les bracelets.", "trying to sound light, proud, reassuring, a little awkward"),
  ("zoubida", "Je ne veux pas les voir, | ces bijoux de mauvais augure. | Avec eux, | le malheur est entré dans cette maison.", "cold, trembling, ominous, slow"),
  ("father", "Ce sont les bracelets que tu désirais. | Prends-les, | et ne dis pas de paroles inconséquentes.", "firm, patient, a little hurt"),
  ("narrator", "Ma mère prit les bijoux sans les regarder, | ouvrit son coffre, | et les jeta dedans.", "tense, curt, a thud at the end"),
  ("zoubida", "Tu verras. | Je ne suis qu'une faible femme, | mais mon cœur ne ment pas. | Ces bracelets ne m'apportent aucune joie.", "bitter prophecy, low, wounded pride"),
 ]),
 ("s18_cauchemar", {"music": "cauchemar"}, [
  ("narrator", "Cette nuit-là, | je fis des cauchemars. | Des monstres. | Des yeux enflammés de haine | qui nous traquaient, | ma mère, | mon père | et moi.", "haunted, low, building fear, one beat per family member"),
  ("narrator", "Des foules aux visages hideux nous poursuivaient | pour nous voler nos richesses. | Ils voulaient surtout | ma Boîte à merveilles.", "fearful, rising, protective on 'ma Boîte à merveilles'"),
  ("narrator", "Alors mon père parut, | sur un cheval noir. | Ma boîte sous le bras. | Il fendit la foule au galop.", "heroic, galloping rhythm, awe"),
  ("narrator", "La longue crinière du cheval | se déployait comme un étendard.", "epic, slow, majestic"),
  ("narrator", "Puis, | une campagne déserte. | Du sable, | des cailloux, | la lumière de l'été. | Sur une colline, | mon père nous attendait.", "sudden calm, dreamy, wide open space, slow"),
  ("father", "Je l'ai sauvée. | Elle est à toi. | Ouvre-la.", "warm, solemn, dreamlike, gentle"),
  ("narrator", "Je l'ouvris avec précaution. | Sur un lit de fleurs fraîchement coupées, | des œillets et des roses, | reposaient des bijoux d'or et de pierres précieuses.", "breathless wonder, dazzled, slow"),
  ("mohammed", "Regardez | mon trésor !", "pure joy, proud, bright"),
  ("zoubida", "Les beaux bijoux | portent toujours malheur | à ceux qui les possèdent.", "cold, distant, dreamlike prophecy, slow, echoing"),
  ("narrator", "Un grand froid m'enveloppa. | Je refermai la boîte, | et je me mis à sangloter.", "chilled, breaking, close to tears"),
 ]),

 # ------------------------------------------------------------------ ACT V: le lendemain
 ("s19_matin", {}, [
  ("father", "Sidi Mohammed, | pourquoi tu pleures ? | Réveille-toi ! | Réveille-toi !", "worried, gently shaking him awake, close"),
  ("narrator", "Il faisait jour. | Les seaux cliquetaient dans le patio. | Mon père me tâtait le front.", "soft morning, relief, daylight"),
  ("father", "Non. | Il n'a pas de fièvre. | Un simple cauchemar.", "calm, reassuring, matter-of-fact"),
  ("zoubida", "Je te dis qu'il est malade ! | Avec l'agitation du souk, | où tu as cru bon de l'entraîner !", "sharp, accusing, anxious, sitting up in bed"),
  ("father", "Cet enfant n'a rien. | Un peu de fatigue. | Qu'il n'aille pas à l'école.", "patient but firm, ending the discussion"),
  ("zoubida", "Mon Dieu, | punis-moi, | mais ne me frappe pas dans mon enfant ! | Homme, | je ne veux pas garder ces bracelets !", "desperate prayer, then turning on her husband, trembling"),
  ("father", "Je m'en vais. | Si je reste, | je vais perdre patience.", "controlled anger, low, tired, putting on his babouches"),
  ("zoubida", "Va. | Tu es un homme. | C'est naturel que tu aies un cœur de pierre.", "bitter, cutting, wounded"),
  ("narrator", "Ma mère ne devait pas dire cela. | Un jour, | je serai un homme. | Et je n'aurai pas un cœur de pierre.", "quiet, determined, a child's vow, heartfelt"),
  ("narrator", "Mon père gardait son sang-froid. | Ma mère, | elle, | voulait le voir crier, | s'agiter, | tout exagérer, | comme elle.", "thoughtful, fair to both, a little smile"),
 ]),
 ("s20_aicha", {"tag": "À RETENIR : Sidi Larbi, le mari de Lalla Aïcha, prend une seconde femme"}, [
  ("narrator", "Je dus quand même garder le lit. | Après le déjeuner, | Lalla Aïcha vint nous rendre visite.", "calm, a little bored, then interested"),
  ("narrator", "Ma mère lui raconta tout : | le souk, | les bracelets, | le drame. | Elle pleura, | soupira, | invoqua les saints, | et prophétisa des catastrophes.", "affectionate irony, rhythmic list, theatrical mother"),
  ("narrator", "Lalla Aïcha, | par politesse, | approuvait, | soupirait, | se donnait de petites tapes sur la joue.", "comic, gentle, polite rhythm"),
  ("zoubida", "Mais toi ? | Tu ne me dis rien. | Comment va ton mari ?", "warm, suddenly attentive, kind"),
  ("narrator", "Lalla Aïcha enfouit son visage dans ses mains, | et éclata en sanglots.", "sudden, shocked, the comedy stops"),
  ("aicha", "Zoubida, | je n'ai plus personne au monde. | Tu es ma seule famille.", "sobbing, nose wet, broken voice, slow"),
  ("aicha", "Le fils du péché, | pour qui j'ai tout donné, | m'a abandonnée. | Il a pris une seconde femme : | la fille d'Abderrahman, | le coiffeur.", "bitter, choking with tears and rage, spitting 'le fils du péché'"),
  ("zoubida", "Allah ! | Allah ! | Ô ma sœur, | ma pauvre sœur ! | Quelle douleur !", "crying out, sobbing with her friend, heartfelt"),
  ("narrator", "Et les deux femmes, | dans les bras l'une de l'autre, | se remirent à sangloter.", "soft, sad, slow"),
 ]),
 ("s21_fievre", {"music": "fievre"}, [
  ("narrator", "La chaleur, | le lit, | ces scènes dont je sentais tout le tragique | sans le comprendre... | me rendirent vraiment malade.", "slowing, feverish, heavy, the voice going far away"),
  ("narrator", "Ma tête cognait. | La fièvre me secoua tout entier.", "weak, trembling"),
  ("zoubida", "Mon fils va mourir ! | Ô mes sœurs, | mon fils ! | Sauvez mon fils !", "terrified scream for help, raw panic, crying"),
  ("narrator", "Les voisines envahirent la chambre. | Mes paupières se fermèrent. | Dans mon crâne, | je n'entendais plus que les battements | d'un gigantesque tambour.", "fading, slower and slower, almost a whisper, the drum in the rhythm"),
 ]),

 # ------------------------------------------------------------------ student layer + teaser
 ("s22_fiche", {"lead": 0.8, "music": "fiche"}, [
  ("narrator", "Fiche de révision. | Chapitre huit : | les bracelets soleil et lune, | en quatre temps.", "a clear friendly teacher summing up for students, crisp"),
  ("narrator", "L'été au mausolée. | L'escalier et les fleurs. | La bagarre du souk. | Et le cauchemar.", "teacher summing up, crisp, rhythmic"),
  ("narrator", "Le détail à retenir : | les bracelets que la mère désirait | deviennent pour elle | des bijoux de mauvais augure. | Le bonheur se transforme en malheur.", "teacher, clear, stressing the key idea"),
  ("narrator", "Et Sidi Larbi, | annoncé chez le barbier au chapitre sept, | prend bien une seconde femme.", "teacher, a knowing smile, linking chapters"),
  ("narrator", "Thèmes : | l'imaginaire de l'enfant, | la solitude, | le regard des adultes, | la condition de la femme. | Au chapitre neuf : | l'enfant malade, | et une maison qui ne dort plus.", "teacher, crisp, ending on a soft teaser"),
 ]),
 ("s23_endcard", {"lead": 0, "tail": 0, "hold": 8}, []),
]

def phon(txt):
    for a, b in PHON.items():
        if a != b:
            txt = re.sub(r"\b%s\b" % re.escape(a), b, txt)
    return txt


HOLD_IN = {"s04_mausolee": 2.4, "s09_escalier": 2.0, "s12_souk": 2.6, "s16_noir": 2.4, "s18_cauchemar": 2.6}   # establishing shots


def main():
    scenes = []
    for sid, extra, lines in S:
        L = []
        for t in lines:
            who, txt = t[0], t[1]
            d = {"who": who, "text": phon(txt).replace(" | ", " <short pause> ")}
            if len(t) > 2:
                d["style"] = V[who][1] + ". In this line: " + t[2]   # keep the persona (R11: same timbre/accent on every line)
            d["sub"] = re.sub(r"\s+", " ", txt.replace(" | ", " "))
            L.append(d)
        sc = {"id": sid, "lines": L, **extra}
        if L:   # v2 calm pacing: ~2.8 s between scenes, day cards read twice before the voice, the façade reveal breathes
            sc.setdefault("lead", 1.4); sc.setdefault("tail", 1.4)
            if "card" in sc: sc["lead"] = max(sc["lead"], 2.6)
            sc["lead"] = max(sc["lead"], HOLD_IN.get(sid, 0))
        scenes.append(sc)
    doc = {"episode": 8, "title": "Les bracelets soleil et lune", "chapter": 8, "gap": 0.8,
           "voices": {k: {"voice": v, "style": s} for k, (v, s) in V.items()}, "scenes": scenes}
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json")
    json.dump(doc, open(out, "w"), ensure_ascii=False, indent=1)
    n = sum(len(l["sub"].split()) for s in scenes for l in s["lines"])
    hold = sum(s.get("hold", 0) for s in scenes)
    print(f"{out}: {len(scenes)} scenes, {sum(len(s['lines']) for s in scenes)} lines, {n} words "
          f"(~{n / 2.42 / 60 + hold / 60:.1f} min at 145 wpm + holds, before gaps)")
    per = {}
    for s in scenes:
        for l in s["lines"]:
            per[l["who"]] = per.get(l["who"], 0) + 1
    print("lines per voice:", dict(sorted(per.items(), key=lambda x: -x[1])))
    missing = {l["who"] for s in scenes for l in s["lines"]} - set(V)
    if missing:
        print("MISSING VOICES", missing)


if __name__ == "__main__":
    main()
