#!/usr/bin/env python3
"""ep09 (2026-11-22): Chapitre IX — La ruine et le départ.
   Builds script.json for ep09 from source/boite.txt lines 2630-3046.
   ' | ' = <short pause>. Every line carries a consistent persona + per-line acting direction.
   PHON respells Fassi/Arabic names for TTS pronunciation only; subtitles ('sub') keep exact book spelling.
   Narrator uses live AI Studio voice 'Jett' (Gacrux was removed from AI Studio)."""
import json, os, re

V = {
    "narrator": ("Jett", "Moroccan man in his 50s from Fès, speaks French with a light Fassi accent, warm nostalgic storyteller, measured pace, close to the microphone"),
    "mohammed": ("Sola", "shy 6-year-old Moroccan boy from Fès, soft high childlike voice, speaks French with a light Moroccan accent"),
    "zoubida": ("Cleo", "Moroccan mother from Fès, about 22, speaks French with a Fassi accent, fast, expressive, dramatic"),
    "father": ("Neno", "Moroccan man from Fès, about 45, calm, gentle, deep low voice, speaks French with a Fassi accent, few words"),
    "fatma": ("Hali", "poor but generous Moroccan neighbour from Fès, about 35, warm, gentle, speaks French with a Fassi accent"),
    "rahma": ("Kira", "Moroccan woman from Fès, about 35, lively, expressive neighbour, speaks French with a Fassi accent"),
    "kanza": ("Tova", "old Moroccan woman, a fortune-teller from Fès, about 60, raspy, slow, honeyed and mysterious, speaks French with a Fassi accent"),
    "aicha": ("Fola", "plump Moroccan noblewoman from Fès, about 50, dignified, warm, sad but resilient, speaks French with a Fassi accent"),
    "marchand": ("Arlo", "angry Moroccan vegetable seller in Fès, about 40, loud, sharp, speaks French with a Fassi accent"),
    "voisine": ("Nika", "Moroccan neighbour woman from Fès, deadpan, matter-of-fact, speaks French with a Fassi accent"),
}

# TTS respellings (TTS input only; subtitles keep exact literary spelling).
PHON = {
    "Abdeslem": "Abdesslam",
    "Msid": "M'sid",
    "fqih": "fquih",
    "Zineb": "Zinèbe",
    "Kanza": "Kenza",
    "Aïcha": "Aïcha",
    "tadeffi": "tadèffi",
    "qarchalas": "qarchalas",
    "Qalqlyine": "Qalqlyine",
    "Qalklyine": "Qalqlyine",
    "Tijani": "Tidjani",
    "Zenqat-Hajjama": "Zenqate-Hadjama",
    "Seffah": "Sèffah",
    "El Arafi": "El Ârafi",
    "Khadouj Lalaouia": "Khaddoudj Lalaouiya",
    "Driss": "Drisse",
    "djinn": "djinne",
    "haïk": "haïk",
    "haïks": "haïks",
    "Fès": "Fès",
}

S = [
 # ------------------------------------------------------------------ HOOK + ROSETTE TITLE
 ("s01_hook", {"lead": 1.5, "tail": 1.5}, [
  ("narrator", "À l'aube, | mon père partit vers l'inconnu, | sans argent, | avec sa sacoche, | une faucille neuve | et un sac de provisions.", "soft, intimate, hushed grief, slow"),
  ("narrator", "Et ma Boîte à Merveilles | n'était plus qu'un cercueil | où dormaient mes rêves.", "darker, slower, heavy pause before 'cercueil'"),
 ]),
 ("s02_titre", {"lead": 0, "tail": 0, "hold": 9}, []),

 # ------------------------------------------------------------------ ACT I: la fièvre et la ruine
 ("s03_reveil", {"card": "LA FIÈVRE"}, [
  ("narrator", "Il n'a rien mangé depuis son déjeuner d'hier. | Cette phrase, | dite dans un soupir, | suffit pour me réveiller.", "whispered opening, waking from a heavy sleep, slow"),
  ("narrator", "Une pénombre épaisse remplissait la chambre. | Ma mère chuchotait à une forme immobile, | debout dans le noir. | Puis les deux ombres m'abandonnèrent.", "hushed, eerie, feverish twilight"),
  ("narrator", "Un tambour battait dans mon crâne. | Des traînées de cendre rouge | et des étincelles froides | tournoyaient autour de mon visage.", "tight, dizzy, feverish hallucination, rhythmic beat"),
  ("narrator", "Ma mère revint à pas furtifs, | si silencieuse qu'elle ne semblait plus respirer, | comme un fantôme prêt à se dissoudre.", "soft, awe-struck, fragile"),
  ("mohammed", "Je suis réveillé... | mais j'ai mal.", "weak, tiny sick child's voice, faint"),
  ("zoubida", "Cela va mieux | puisque tu me parles.", "relieved, tender, holding back tears"),
  ("mohammed", "Pourquoi fait-il si sombre ?", "faint, confused, slow"),
  ("zoubida", "C'est le soir. | Tu as eu la fièvre toute la nuit et toute la matinée. | Mes yeux n'ont pas cessé de pleurer.", "gentle, exhausted, tearful warmth"),
  ("mohammed", "J'ai faim.", "small, hopeful whisper"),
  ("zoubida", "Louange à Dieu ! | Je vais te chercher un bol de bouillon.", "sudden bright relief, warm energy"),
  ("narrator", "Mais rien que l'odeur me soulevait le cœur. | La pièce roula, | tangua dans l'espace comme les astres et les météores. | Ma mère rattrapa le bol à temps | et me rallongea doucement.", "spinning, nauseous rhythm slowing down softly at the end"),
 ]),

 ("s04_remedes", {}, [
  ("narrator", "Les objets cessèrent de tourner. | Ma mère s'assit près de mon lit, | sur un matelas très bas.", "calm settling after dizziness"),
  ("rahma", "Zoubida, | comment va Sidi Mohammed ? | Couvre-le bien et donne-lui du thé chaud, | il a dû attraper froid.", "calling kindly from across the courtyard window, warm concern"),
  ("fatma", "Je crois plutôt qu'il a pris une insolation. | Entoure-lui la tête d'écorces de citron | et de feuilles de menthe.", "helpful, practical neighbour calling from her window"),
  ("zoubida", "Vous avez peut-être raison, mes sœurs... | Mais si Dieu ne soulage pas ses souffrances, | tous mes soins restent inutiles.", "tired, pious resignation, soft sigh"),
 ]),

 ("s05_diner_chat", {"tag": "À RETENIR : le silence pesant annonce la ruine"}, [
  ("narrator", "Mon père rentra plus tôt que d'habitude. | Ma mère se hâta d'allumer la lampe à pétrole, | et la chambre fut inondée de lumière jaune.", "tense anticipation, quiet footsteps"),
  ("narrator", "Son visage était pâle et fatigué, | ses yeux creusés de deux trous noirs. | Il me toucha doucement le front, | hocha la tête, | et me tourna le dos sans un mot.", "grave, worried, slow on 'sans un mot'"),
  ("narrator", "Ce fut le dîner le plus triste de leur vie. | L'odeur du safran me donnait la nausée. | Ni mon père ni ma mère | ne mangeaient, | ne parlaient.", "heavy, suffocating stillness, slow"),
  ("narrator", "Le chat de Zineb entra à pas feutrés. | Il miaula timidement devant ces deux statues immobiles. | Mais la frayeur le saisit : | il écarquilla ses yeux jaunes, | cracha un juron, | et fila tous poils dehors !", "quiet eerie buildup breaking into a sharp comic hiss on 'fila'"),
  ("narrator", "Une angoisse de fin du monde pesait sur la chambre. | Je fondis en sanglots. | Mon père sortit de sa torpeur.", "broken, tight throat, child crying"),
  ("father", "Où as-tu mal, | mon enfant ?", "deep, gentle, suddenly attentive"),
  ("mohammed", "Je n'ai pas mal... | mais pourquoi ne parlez-vous pas ?", "sobbing between hiccups, bewildered child"),
  ("father", "Nous n'avons rien à dire. | Repose-toi, | et ne pleure plus.", "heavy, tired tenderness, holding back sorrow"),
 ]),

 ("s06_ruine", {}, [
  ("narrator", "Ma mère apporta le plateau et les verres pour le thé. | Elle trouva mon père debout, | prêt à se coucher.", "quiet tension, clink of glasses"),
  ("zoubida", "Tu ne prends pas de thé ?", "tentative, soft question"),
  ("father", "Non. | Et dorénavant, | ne gaspille plus ton sucre. | À partir de demain, | il nous sera difficile d'avoir du sucre et du thé tous les jours.", "flat, grave, slow, every word heavy"),
  ("narrator", "Ma mère devint toute pâle. | Elle posa le plateau | et regarda mon père bien en face.", "breath held, tense"),
  ("zoubida", "Je pressens un grand malheur.", "broken whisper, trembling"),
  ("narrator", "Soudain, | un claquement sec me fit sursauter ! | Ma mère s'était frappé les deux joues. | Assise par terre, | elle se griffait le visage et s'arrachait les cheveux sans un cri.", "shocked, sharp on 'claquement', rapid breathless horror"),
  ("narrator", "Mon père se jeta sur elle pour retenir ses mains. | Ils luttèrent un long moment, | puis elle s'écroula, | face contre terre.", "urgent struggle, then sudden heavy collapse"),
  ("father", "Ô femme ! | Aie confiance en la miséricorde de Dieu. | J'ai perdu dans la cohue des enchères aux haïks | tout notre maigre capital.", "calm, steady, comforting but devastated"),
  ("father", "J'avais mis l'argent dans un mouchoir. | J'ai dû le laisser tomber par terre | en croyant le glisser dans ma sacoche.", "quiet confession, weary, resigned"),
 ]),

 ("s07_decision", {"tag": "À RETENIR : Sidi Abdeslem refuse le crédit et part aux moissons"}, [
  ("zoubida", "Qu'allons-nous faire ?", "hollow, exhausted whisper from the floor"),
  ("father", "Je vais travailler.", "simple, firm, unshaken"),
  ("zoubida", "Combien as-tu perdu ?", "anxious, tight"),
  ("father", "Tout mon fonds de roulement. | Je n'ai même plus de quoi payer mon ouvrier, | ni le mois de loyer de l'atelier.", "grave, honest, low"),
  ("zoubida", "Les marchands te connaissent. | Ils ne pourraient pas te faire crédit ?", "pleading, hopeful"),
  ("father", "Jamais je ne mendierai du coton à ces voleurs, | et je ne veux pas non plus d'un salaire de misère. | Je suis un montagnard et un paysan : | j'irai faire la moisson aux environs de Fès.", "proud, noble, rising strength, firm on 'montagnard et un paysan'"),
  ("zoubida", "Tu oserais m'abandonner | avec un enfant malade ?", "shocked, hurt, voice breaking"),
  ("father", "Aimerais-tu devenir un objet de pitié pour tes voisines ? | Sidi Mohammed ira mieux demain. | Fais-lui une soupe à la menthe sauvage.", "gentle but resolute, reassuring"),
  ("zoubida", "C'est un châtiment de Dieu ! | Ce sont ces maudits bracelets qui ont semé le malheur ! | Pourquoi ne les vendrais-tu pas ?", "bitter, angry, crying out"),
  ("father", "Je compte les vendre pour vous nourrir. | Driss le teigneux viendra chaque jour faire les courses. | Donne-lui à manger, | il n'a personne.", "calm, practical, compassionate on 'il n'a personne'"),
  ("father", "Je vous laisse seuls pendant un mois. | Je tâcherai de ne rien dépenser, | pour rouvrir l'atelier dès mon retour.", "steady, quiet resolve, soft promise"),
 ]),

 ("s08_solitude", {}, [
  ("narrator", "Un grand silence s'établit, | lourd, | huileux | et noir comme la suie. | J'étouffais.", "suffocating quiet, slow, spaced words"),
  ("narrator", "Mes parents ne bougeaient plus. | Ils se transformaient devant mes yeux | en figures de cauchemar, | fluides, | insaisissables.", "eerie, dreamlike dread"),
  ("narrator", "Pour la première fois, | je connus le vide absolu, | la solitude sans pitié. | Je fermai les yeux | et je priai de toutes mes forces.", "deep childhood terror, trembling voice"),
  ("narrator", "Seigneur ! | Je me souviens encore de cette solitude vaste comme les planètes mortes, | où le son meurt sans écho.", "lyrical adult memory, soaring sorrow, slow"),
  ("narrator", "Je n'étais qu'un enfant, | Seigneur ! | Je ne savais pas encore que le jour naît de la nuit, | et qu'après l'hiver, | la terre sourit de toutes ses fleurs | et chante par ses rossignols.", "tender, luminous hope breaking gently through the dark"),
 ]),

 # ------------------------------------------------------------------ ACT II: le départ du père
 ("s09_depart", {"card": "LE SURLENDEMAIN, À L'AUBE", "enum": ["sacoche de berger", "faucille neuve", "olives noires", "figues sèches", "farine grillée", "dix qarchalas"]}, [
  ("narrator", "Mon père partit le surlendemain à l'aube. | Tout son bagage tenait en trois choses : | une sacoche de berger en palmier nain, | une faucille neuve, | et un sac de toile.", "hushed dawn voice, solemn, crisp on the objects"),
  ("narrator", "Ma mère lui avait cousu un sac de toile | bourré de provisions : | olives noires, | figues sèches, | farine grillée et sucrée, | deux pains à l'anis, | et dix qarchalas parfumées à la fleur d'oranger.", "tender, counting each provision softly with a beat between them"),
  ("narrator", "J'étais réveillé quand il franchit la porte. | Ma mère resta prostrée sur son lit, | le visage caché dans ses deux mains. | J'avais l'impression que nous étions devenus orphelins.", "quiet grief, slow, heavy on 'orphelins'"),
  ("narrator", "Tout le quartier devait savoir. | Dans une famille comme la nôtre, | le père est une protection invisible. | Son prestige donne force, | sécurité | et paix.", "grave, reflective, warm respect"),
  ("narrator", "Je compris la peine de ma mère ce matin-là. | Le soir, | personne ne pousserait plus notre porte | avec la bonne odeur du travail.", "intimate, tender sorrow, slow"),
 ]),

 ("s10_quarante_chats", {"enum": ["belles djellabas blanches", "beignets au beurre et au miel", "quarante chats", "un bigaradier dans la cour"]}, [
  ("narrator", "La maison s'éveilla au soleil. | Ma fièvre était tombée. | Je m'assis dans mon lit.", "lighter, morning warmth returning"),
  ("mohammed", "Maman, | est-ce que c'est long, | un mois ?", "innocent, curious child's question"),
  ("zoubida", "Un mois dure un mois, mon fils... | Mais pour nous, | ce mois sera une éternité.", "startled out of stupor, tender, sad"),
  ("mohammed", "Moi, je sais attendre. | J'attends d'être un homme. | Toi, tu n'attends plus rien.", "solemn, serious little philosopher"),
  ("narrator", "Ma mère me regarda, | stupéfaite.", "amused surprise"),
  ("mohammed", "Quand je serai grand, | je porterai de belles djellabas blanches. | Je mangerai chaque matin des beignets chauds au beurre et au miel. | J'aurai quarante chats qui m'obéiront toujours, | et un bigaradier dans notre cour.", "dreamy, delighted, building each wish like treasure"),
  ("zoubida", "Jamais ta femme n'acceptera de veiller sur ton troupeau de chats !", "sudden bright smile breaking into warmth"),
  ("mohammed", "Je ne me marie pas ! | Toi tu aimes les chats, | tu t'en occuperas.", "matter-of-fact, earnest child logic"),
  ("narrator", "Elle éclata franchement de rire ! | Je ris plus fort qu'elle en battant des mains. | Aussitôt, | elle posa un doigt sur ses lèvres.", "joyful burst, then playful hush"),
  ("zoubida", "Chut ! | Que diraient les voisins s'ils t'entendaient rire | le jour du départ de ton père ?", "hushed, smiling through duty"),
  ("mohammed", "Mon père reviendra bientôt, | et nous serons très riches !", "bright, full of faith"),
  ("zoubida", "Repose-toi, mon petit. | Tant que je serai vivante, | tu n'auras jamais faim, | dussé-je mendier.", "fierce maternal love, warm, soft"),
 ]),

 ("s11_tadeffi", {"tag": "À RETENIR : le tadeffi, potage à la menthe sauvage"}, [
  ("narrator", "Quelqu'un gratta timidement à la porte. | Après un long conciliabule dans le couloir, | ma mère pressa la visiteuse d'entrer.", "playful curiosity, tiptoeing"),
  ("zoubida", "Entre, Fatma ! | Donne-le-lui toi-même : | à moi, il refusera, | il est si entêté !", "whispered urgency, amused"),
  ("narrator", "Fatma Bziouya parut avec un bol fumant de tadeffi, | ce potage parfumé à la menthe sauvage. | Par principe, | je tournai le nez contre le mur.", "warm comic storytelling, wry on 'par principe'"),
  ("fatma", "Comment te sens-tu ce matin, | fqih ?", "smiling, coaxing, playful"),
  ("zoubida", "Prends-le, mon fils. | Après, j'enverrai Zineb t'acheter un beignet.", "gentle bribery, persuasive"),
  ("narrator", "Je finis par me redresser, | flairai le bol d'une narine méfiante, | et déclarai que je n'aimais pas la soupe piquante.", "pompous little king, deadpan comic"),
  ("narrator", "Les deux femmes jurèrent qu'il n'y avait pas une pincée de piment ! | Je regardai ma mère droit dans les yeux : | comment pouvait-elle le savoir, | puisqu'elle n'y avait même pas goûté ?", "triumphant, mischievous catch"),
  ("narrator", "Prise au piège, | elle leva les yeux au plafond | et s'enfuit dans la cuisine.", "light, laughing"),
  ("fatma", "Allons, bonbon acidulé ! | Petit fromage blanc ! | Vermicelle au lait ! | Goûte vite, je te dis que c'est bon !", "tender, cajoling, singing the sweet nicknames"),
  ("narrator", "À des mots si câlins, | je ne pus résister : | j'avalai toute la soupe à grandes goulées.", "contented, funny, warm"),
 ]),

 ("s12_fenetre_rahma", {}, [
  ("narrator", "Je me débarbouillai et mis ma djellaba. | Pour quelques jours, | j'allais jouir de vraies vacances.", "cheerful relief"),
  ("rahma", "Louange à Dieu ! | Sidi Mohammed te voilà rétabli ! | Promets-moi de ne plus tomber malade, | j'en perds l'appétit !", "warm, booming cheerfully from her window across the patio"),
  ("zoubida", "Qu'Allah te garde en bonne santé, | ma sœur Rahma.", "courteous, calling back from the kitchen"),
  ("rahma", "Sidi Abdeslem est parti ce matin ? | Les temps deviennent durs pour les pauvres gens... | mais sachons louer Dieu dans l'adversité.", "chatty, leaning on her window bars, pious sigh"),
  ("narrator", "Pour toute réponse, | quelqu'un au rez-de-chaussée éternua trois fois, | puis se moucha comme la trompette du Ramadan ! | J'éclatai de rire.", "sudden comic burst, laughing"),
  ("narrator", "Ma mère me prit par les épaules, | me ramena sur le matelas | et m'ordonna de réciter le Coran | pour attirer la bénédiction sur mon père.", "firm, gentle, restoring order"),
 ]),

 # ------------------------------------------------------------------ ACT III: le cercueil, l'orage et les deux mondes
 ("s13_dejeuner_pauvre", {}, [
  ("narrator", "Installé sur le matelas, | l'air renfrogné, | je n'avais plus envie de rien. | Même le soleil paraissait sombre.", "sullen, heavy mood returning"),
  ("narrator", "Au déjeuner, | deux beignets, | du beurre rance, | des olives noires, | et des radis offerts par Fatma Bziouya. | Le beignet était pâteux et sans goût.", "flat, joyless, chewing slowly"),
  ("narrator", "La table débarrassée, | ma mère posa à même le bois | une petite théière d'émail ébréchée et deux verres. | Sans plateau, | sans bouilloire : | comme chez les plus misérables.", "quiet shock, poignant poverty"),
  ("narrator", "Puis elle me recommanda d'être sage, | enfila son haïk, | et partit voir son amie Lalla Aïcha.", "quiet departure, lonely"),
 ]),

 ("s14_cercueil", {}, [
  ("narrator", "Je me souviens de ces heures affreuses passées seul. | Je jetai un coup d'œil dans ma Boîte à Merveilles.", "quiet, aching dread"),
  ("narrator", "Ce n'était plus une boîte à merveilles, | mais un cercueil où gisaient les cadavres de mes rêves. | Je me mouchai dans un vieux chiffon qui traînait par terre.", "bitter sorrow, slow, heavy on 'cercueil'"),
  ("narrator", "Couché sur le dos, | je fixai les taches du mur. | Autrefois elles dansaient des ballets pour moi ; | aujourd'hui elles restaient figées | et me donnaient la nausée.", "disillusioned, weary, empty"),
  ("narrator", "Mon cœur battait de tristesse et de peur. | Épuisé par mes larmes silencieuses, | je finis par m'endormir.", "small, worn out, fading"),
  ("narrator", "Quand ma mère rentra, | la fièvre m'avait repris. | Elle me couvrit chaudement, | s'assit près de mon lit, | et pleura en chantonnant doucement.", "soft, tender, mournful lullaby"),
 ]),

 ("s15_orage_flute", {"card": "LA NUIT"}, [
  ("narrator", "Le soir, | elle ne prépara pas de dîner. | Je me tournais et retournais sans trouver le sommeil.", "restless, feverish dark"),
  ("narrator", "Brusquement, | l'orage se déchaîna ! | Le vent hurla sur la maison | et fit claquer toutes les portes.", "sudden dramatic surge, fearful"),
  ("narrator", "Au milieu de la rafale s'éleva un chant de flûte étrange. | Pas une flûte humaine : | un instrument forgé au fond des eaux par un djinn fou.", "haunted, hypnotic, eerie wonder"),
  ("narrator", "Il mêlait des appels, | des rires d'hyène, | de longs cris de douleur | et des phrases de colère.", "oscillating between terror and plaintive song"),
  ("narrator", "Tremblant de tous mes membres, | je récitai trois fois la sourate de l'Unité, | j'enfouis mon visage dans un coussin, | et je m'endormis.", "hushed, breathless prayer fading into sleep"),
 ]),

 ("s16_deux_mondes", {}, [
  ("narrator", "Ma vie s'écoulait dans deux mondes opposés. | Le jour, | je subissais les contraintes des grands. | La nuit, | j'étais lancé dans le vide des abîmes.", "philosophical, grave, contrasting the two halves"),
  ("narrator", "Je mourais chaque soir | pour renaître chaque matin | avec le soleil, | le chant des moineaux, | le pain | et la fraîcheur de l'eau.", "serene, grateful breath on the simple mornings"),
  ("narrator", "Pourtant, | la nuit, | je rencontrais mes parents et le fqih | dans des pays sans lumière, | sur des sentiers pleins de dangers. | Alors je me blottissais en chien de fusil, | sans pouvoir m'échapper.", "quiet, haunted, curling small"),
 ]),

 # ------------------------------------------------------------------ ACT IV: le lendemain matin et Lalla Aïcha
 ("s17_omelette_kanza", {"card": "LE LENDEMAIN MATIN"}, [
  ("zoubida", "Sidi Mohammed, réveille-toi ! | Tu es mal couché, | tu vas attraper le torticolis. | Va faire tes ablutions, | je vais te cuire un œuf.", "warm morning energy, brisk and loving"),
  ("mohammed", "J'aime les œufs à l'huile, | avec du piment rouge et du persil !", "bright, eager, appetite back"),
  ("zoubida", "Je sais. | Je mettrai même une pincée de cumin.", "indulgent, smiling"),
  ("rahma", "Nous appelons ce plat une omelette juive ! | C'est délicieux !", "calling merrily from her window"),
  ("zoubida", "Sidi Mohammed est encore malade : | il a des envies comme une femme enceinte !", "laughing back warmly"),
  ("narrator", "Toutes les voisines rirent. | Tante Kanza la chouafa raconta l'histoire d'un laitier avare | qui avait refusé une miette de fromage blanc à une femme enceinte.", "lively storytelling rhythm, amused"),
  ("kanza", "Quelques mois plus tard, | le bébé naquit avec un vrai morceau de fromage blanc sur le ventre ! | Je l'ai vu, | de mes propres yeux vu !", "raspy, solemn folk-tale wonder, dead serious"),
  ("voisine", "Heureusement que le fromage ne pendait pas à son front, | ou sur sa joue !", "dry comic timing, straight-faced"),
 ]),

 ("s18_driss_depart", {}, [
  ("narrator", "Driss le teigneux appela à la porte d'entrée. | Ma mère coupa un gros quartier de pain avec du beurre rance et des olives noires | dans un papier graisseux.", "warm, bustling morning routine"),
  ("narrator", "Avant de remonter, | elle emprunta le seau de tante Kanza au puits | et remplit la grande jarre d'eau potable de notre cuisine.", "rhythmic, hardworking mother"),
  ("zoubida", "Prépare-toi, | nous allons sortir ! | Nous passerons prendre Lalla Aïcha | pour aller dans le quartier Qalqlyine. | Et mouche-toi donc !", "brisk, wrapping her haïk, affectionate scolding"),
  ("narrator", "Je retrouvai mon mouchoir froissé sous un coussin, | me mouchai si fort que mes doigts furent tout mouillés, | et m'essuyai à même ma djellaba.", "cheeky child confession, funny"),
  ("fatma", "Lalla Zoubida ! Où vas-tu ? | Est-ce que Sidi Larbi a répudié la fille du coiffeur ?", "curious, leaning out as they leave"),
  ("zoubida", "Lalla Aïcha nous a invités pour la journée, | elle est si seule ! | Et non, il ne l'a pas répudiée, | mais sa belle-famille lui rend les jours amers, | elle l'accuse de laisser sa jeune femme souffrir de faim.", "lifted veil, delighted to know more than the neighbours, gossipy triumph"),
 ]),

 ("s19_medina", {}, [
  ("narrator", "Nous partîmes enfin, | moi devant, | dévorant des yeux tous les étalages. | Devant le sanctuaire de Sidi Ahmed Tijani, | ma mère introduisit sa main dans le trou aux offrandes | sans rien y déposer.", "lively walk, observant child's eyes"),
  ("narrator", "Elle frotta sa joue contre la boiserie. | Trop petit pour atteindre la grille, | je collai mes lèvres sur la mosaïque froide du mur.", "tender piety, innocent"),
  ("zoubida", "Viens, mon petit œil, | et qu'Allah te préserve de tout mal !", "soft, deeply proud, loving"),
  ("narrator", "Un peu plus loin, | un marchand exposait ses poivrons et ses tomates en jolies pyramides. | Ma mère tâta, | tripota, | et sema partout le désordre.", "playful build-up to comic clash"),
  ("marchand", "Cette marchandise n'est pas à vendre ! | Surtout à une cliente aussi ennuyeuse !", "furious, shouting, insulted"),
  ("narrator", "Très digne, | ma mère lui conseilla de ramasser ses ordures s'il ne voulait pas vendre. | Je tirai sa main pour l'arracher à sa colère.", "mock-solemn dignity, hurried pull"),
  ("narrator", "À gauche s'ouvrait un portail monumental orné de clous et de marteaux de bronze.", "awestruck child looking up"),
  ("mohammed", "Maman, à qui appartient cette grande maison ?", "curious, whispered"),
  ("zoubida", "Ce n'est pas une maison : | c'est un bureau de Chrétiens. | Ils paient bien ceux qui connaissent leur langue.", "cautious, slightly hushed"),
  ("mohammed", "Est-ce que je parlerai la langue des Chrétiens quand je serai grand ?", "innocent wonder"),
  ("zoubida", "Dieu te préserve de tout contact avec ces gens-là !", "quick, startled maternal protection"),
 ]),

 ("s20_aicha_misere", {"tag": "À RETENIR : la misère de Lalla Aïcha à Zenqat-Hajjama"}, [
  ("narrator", "Rue Zenqat-Hajjama, | Lalla Aïcha nous accueillit de sa chambre du deuxième étage, | assise devant sa bouilloire.", "quiet shift, entering a dim stairwell"),
  ("narrator", "La chambre suait la misère et l'ennui. | Plus de cretonne sur les matelas, | plus de carpettes gaies, | plus d'étagères de bois peint ni d'assiettes décorées.", "shocked, sad inventory, slowing down"),
  ("narrator", "L'horloge avait laissé une tache claire sur le mur. | Les matelas, bourrés de crin végétal, | étaient froids et durs. | Sur la terrasse, | un petit chat miaulait désespérément.", "bleak, desolate, quiet pain"),
  ("narrator", "Lalla Aïcha servit le thé avec beaucoup de dignité, | sur un petit plateau de cuivre jaune aux gravures effacées.", "quiet respect for her fallen pride"),
 ]),

 ("s21_sidi_el_arafi", {}, [
  ("narrator", "Personne ne disait rien. | Chacun de nous trois s'absorbait dans ses pensées. | Lalla Aïcha rompit enfin le silence.", "still, heavy pause"),
  ("aicha", "Le fqih de Qalqlyine est parti en voyage dans le djebel. | Nous irons plutôt dans le quartier Seffah, | consulter Sidi El Arafi.", "quiet, serious, sharing a secret hope"),
  ("aicha", "Il est aveugle, | mais tout ce qu'il prédit se réalise point par point. | Mon nid a été saccagé... | avec lui, | je retrouverai la paix.", "earnest, weary hope, soft catch on 'mon nid a été saccagé'"),
  ("narrator", "Ma mère hocha la tête ; | moi, je soupirai, | parce que je savais qu'il convenait de soupirer.", "gentle childlike observation, soft smile"),
  ("zoubida", "Moi aussi, j'ai grand besoin de conseils. | Je tremble pour ma maison, | pour mon mari, | pour mon fils. | Sidi El Arafi nous aidera sûrement.", "earnest, anxious, leaning forward"),
  ("aicha", "Il est permis de faire ce qui est en notre pouvoir, | puis de s'en remettre à Dieu. | Ayons confiance.", "noble, serene wisdom, calm"),
  ("narrator", "Lalla Aïcha s'arracha péniblement du sol, | reprit son haïk, | et nous sortîmes vers un nouvel espoir.", "slow, dignified rise, closing softly"),
 ]),

 # ------------------------------------------------------------------ FICHE + ENDCARD
 ("s22_fiche", {"lead": 0.8, "music": "fiche"}, [
  ("narrator", "Fiche de révision. | Chapitre neuf : | la ruine et le départ, | en quatre temps.", "clear, friendly teacher summing up for students, crisp"),
  ("narrator", "La fièvre et la perte du capital. | Le départ du père aux moissons. | Le cercueil des rêves et l'orage. | Et la misère de Lalla Aïcha.", "teacher summing up, crisp, rhythmic"),
  ("narrator", "Les détails à retenir : | Sidi Abdeslem refuse l'endettement par fierté, | vend les bracelets | et part travailler un mois aux moissons.", "teacher, clear, stressing key ideas"),
  ("narrator", "Pour l'enfant, | la Boîte à Merveilles devient un cercueil. | Et les deux femmes décident de consulter Sidi El Arafi, | le voyant aveugle.", "teacher, crisp, linking to next chapter"),
  ("narrator", "Thèmes : | la ruine et la pauvreté, | l'absence du père, | la solitude et la peur, | la solidarité féminine. | Au chapitre dix : | les prédictions de Sidi El Arafi.", "teacher, warm, ending on a soft teaser"),
 ]),
 ("s23_endcard", {"lead": 0, "tail": 0, "hold": 8}, []),
]


def phon(txt):
    for a, b in PHON.items():
        if a != b:
            txt = re.sub(r"\b%s\b" % re.escape(a), b, txt)
    return txt


HOLD_IN = {
    "s03_reveil": 2.0,
    "s05_diner_chat": 2.0,
    "s09_depart": 2.2,
    "s14_cercueil": 2.0,
    "s15_orage_flute": 2.0,
    "s20_aicha_misere": 2.4,
}


def main():
    scenes = []
    for sid, extra, lines in S:
        L = []
        for t in lines:
            who, txt = t[0], t[1]
            d = {"who": who, "text": phon(txt).replace(" | ", " <short pause> ")}
            if len(t) > 2:
                d["style"] = V[who][1] + ". In this line: " + t[2]
            d["sub"] = re.sub(r"\s+", " ", txt.replace(" | ", " "))
            L.append(d)
        sc = {"id": sid, "lines": L, **extra}
        if L:
            sc.setdefault("lead", 1.4)
            sc.setdefault("tail", 1.4)
            if "card" in sc:
                sc["lead"] = max(sc["lead"], 2.6)
            sc["lead"] = max(sc["lead"], HOLD_IN.get(sid, 0))
        scenes.append(sc)
    doc = {
        "episode": 9,
        "title": "La ruine et le départ",
        "chapter": 9,
        "gap": 0.8,
        "voices": {k: {"voice": v, "style": s} for k, (v, s) in V.items()},
        "scenes": scenes,
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json")
    json.dump(doc, open(out, "w"), ensure_ascii=False, indent=1)
    n = sum(len(l["sub"].split()) for s in scenes for l in s["lines"])
    hold = sum(s.get("hold", 0) for s in scenes)
    print(
        f"{out}: {len(scenes)} scenes, {sum(len(s['lines']) for s in scenes)} lines, {n} words "
        f"(~{n / 2.42 / 60 + hold / 60:.1f} min at 145 wpm + holds, before gaps)"
    )
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
