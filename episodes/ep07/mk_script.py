#!/usr/bin/env python3
"""v2 (2026-11-05): full chapter, calm pacing, ep06 hook + rosette title; v1 = mk_script_v1.py.
   Builds script.json for ep07 (Chapitre VII, l'Achoura). ' | ' = <short pause>.
   python3 episodes/ep07/mk_script.py
   PHON respells names for the TTS input only; subtitles ("sub") keep the book's spelling (POSTMORTEM R11).
   Scene extras: card = day card burned over the first shot; tag = "À retenir" card; music = designed score cue (R10)."""
import json, os, re

V = {
    "narrator": ("Gacrux", "Moroccan man in his 50s from Fès, speaks French with a light Fassi accent, warm nostalgic storyteller, lively pace, close to the microphone"),
    "mohammed": ("Leda", "shy 6-year-old Moroccan boy from Fès, soft voice, speaks French with a light Moroccan accent"),
    "zoubida": ("Kore", "Moroccan mother from Fès, about 22, speaks French with a Fassi accent, fast, expressive, dramatic"),
    "father": ("Charon", "Moroccan man from Fès, about 45, calm, gentle, low voice, speaks French with a Fassi accent, few words"),
    "zineb": ("Achernar", "little Moroccan girl of 5 from Fès, shrill, spoiled, speaks French with a Fassi accent"),
    "fqih": ("Schedar", "Moroccan Koranic schoolmaster from Fès, about 50, grave, nasal, speaks French with a Fassi accent"),
    "kanza": ("Vindemiatrix", "old Moroccan woman, a fortune-teller from Fès, about 60, raspy, slow, honeyed and mysterious, speaks French with a Fassi accent"),
    "hammoussa": ("Laomedeia", "the smallest Moroccan schoolboy, 7 years old, from Fès, out of breath, urgent, squeaky, speaks French with a Fassi accent"),
    "vendeur": ("Umbriel", "poor Moroccan street seller calling his goods in a narrow alley at dusk, thin nasal voice, sing-song street cry"),
    "voisine": ("Erinome", "Moroccan woman from Fès, about 50, asking a question from another room, speaks French with a Fassi accent"),
    "barber": ("Fenrir", "Moroccan barber from Fès, about 55, an endless talker, honeyed, fast, flattering, never stops for breath, speaks French with a Fassi accent"),
    "hammad": ("Algenib", "dry old Moroccan man from Fès, about 70, hypochondriac, groaning and whining, speaks French with a Fassi accent"),
    "lamrani": ("Achird", "young Moroccan scholar from Fès, about 25, gentle, shy, modest, speaks French with a Fassi accent"),
    "femmes": ("Aoede", "a group of Moroccan women in a courtyard house shouting together, laughing and begging for mercy, loud"),
    "eleves": ("Puck", "a crowd of Moroccan schoolboys answering together in a Koranic school, loud, in unison"),
    "aicha": ("Pulcherrima", "plump Moroccan noblewoman from Fès, about 50, affected, sugary, a bit pompous, loves to gossip, speaks French with a Fassi accent, breathy"),
}

# TTS respellings (the TTS input only).
PHON = {
    "Abderrahman": "Abderrahmane", "Msid": "M'sid", "fqih": "fquih", "Zineb": "Zinèbe", "Kanza": "Kenza",
    "Hammad": "Hammade", "Achaa": "Icha", "Azzouz": "Azzouze", "Bnou Achir": "Bnou Achire",
    "Lamrani": "Lamrani", "Chérifa": "Chérifa", "tarifa": "tarifa", "Aïcha": "Aïcha",
    "Abdeslem": "Abdesslam", "Haj": "Hadj", "Berrada": "Berrada",
}

S = [
 # ------------------------------------------------------------------ v2 opening = ep06 pattern: calm hook + rosette title
 ("s01_hook", {"lead": 1.5, "tail": 1.5}, [
  ("narrator", "Dans toute la ville, | les femmes essayaient leurs tambourins. | Un bourdonnement sourd | couvrait l'espace."),
  ("narrator", "L'Achoura approchait, | le nouvel an. | Et avec elle, | la plus belle nuit de mon enfance."),
 ]),
 ("s02_titre", {"lead": 0, "tail": 0, "hold": 9}, []),

 # ------------------------------------------------------------------ ACT I: J-2
 ("s03_tambourins", {"card": "DEUX JOURS AVANT L'ACHOURA"}, [
  ("narrator", "Deux jours avant l'Achoura, | les femmes de la maison s'achetèrent toutes des tambourins. | Ma mère essaya son bendir."),
  ("narrator", "Chacun de ces instruments avait sa forme, | son langage. | Des longs, | en céramique bleue. | Des ventrus, | en poterie. | De simples cadres de bois, | tendus d'une peau de chèvre."),
  ("narrator", "Des coups graves et des coups secs | parlèrent un dialecte rude, | mélange de soleil | et de vent de haute montagne."),
  ("narrator", "Chacune de nos voisines faisait ses gammes, | jouait pour elle-même un air de danse, | avec des mots murmurés à mi-voix."),
  ("narrator", "Zineb tapait comme une sourde | sur un minuscule tambourin de pacotille. | Moi, | j'avais une trompette en fer-blanc. | Elle éclatait dans la maison comme un cri d'alarme, | parfois, | comme un sanglot d'agonisant."),
  ("narrator", "Pour le jour de l'Achoura, | je rêvais d'autres jouets : | un tambour en terre cuite, | en forme de sablier, | et un hochet décoré de fleurs."),
  ("zoubida", "Va donc braire sur la terrasse !", "mother with her hands over her ears, exasperated but amused"),
 ]),
 ("s04_chat", {}, [
  ("narrator", "Je gonflai mes joues, | et soufflai de toutes mes forces. | On aurait dit un bébé qui perce ses premières dents."),
  ("narrator", "Le chat de Zineb fit un saut d'épouvante, | et s'engouffra dans une gouttière. | Une tête inquiète surgit du mur voisin, | et disparut."),
 ]),
 ("s05_hammoussa", {}, [
  ("zoubida", "Un de tes camarades t'attend dans le patio. | Prends tes babouches : | le fqih a besoin de toi !", "mother calling up the stairs, loud, from far below"),
  ("narrator", "J'abandonnai ma trompette avec regret, | et dégringolai l'escalier."),
  ("narrator", "C'était Hammoussa, | « pois chiche », | le plus petit élève de l'école."),
  ("narrator", "De son vrai nom, | Azzouz Berrada."),
  ("hammoussa", "Dépêche-toi ! | Il faut préparer les lustres de l'Achoura !"),
 ]),
 ("s06_lustres", {}, [
  ("narrator", "Pour la nuit de l'Achoura, | il fallait toutes les mains. | J'embrassai la main du maître, | et me mis au travail."),
  ("narrator", "Au Msid, | on découpait de minuscules mèches | dans une vieille cotonnade blanche."),
  ("narrator", "Chaque mèche était agrafée à une lamelle de fer-blanc, | posée sur le bord d'un verre : | moitié eau, | moitié huile d'olive. | Et dans l'eau, | des poudres de couleur."),
  ("narrator", "Les poudres, | en petits paquets, | reposaient dans les babouches du fqih."),
  ("narrator", "Les lustres étaient de simples cerceaux de fer forgé, | reliés par des tiges. | On y logeait les petites veilleuses : | des verres ordinaires, | avec une mèche | qui nageait dans l'huile."),
  ("narrator", "Les grands, | suspendus à une échelle branlante, | accrochaient au plafond les lustres en fer forgé. | Hammoussa se coupa le pouce avec une lamelle, | et partit en pleurnichant doucement."),
  ("narrator", "Cinq ou six turbulents | allaient d'un groupe à l'autre, | et provoquaient, | çà et là, | quelques disputes."),
  ("narrator", "Le soir, | nous chantâmes des cantiques, | et le maître pria, | même pour le Sultan, | prince des Croyants."),
  ("narrator", "Mon tour vint. | Je baisai la main du maître, | enfilai mes babouches, | et sortis."),
 ]),
 ("s07_petrole", {}, [
  ("narrator", "À la maison, | ma mère était très ennuyée : | plus de pétrole dans la lampe ! | Driss El Aouad, | notre voisin, | accepta d'aller en acheter."),
  ("vendeur", "Des bougies | et des allumettes !", "street seller crying his goods far away in the alley, echoing"),
  ("narrator", "Les bougies ? | C'était bon pour les pauvres."),
  ("narrator", "Et pour les gens arriérés, | qui craignent les explosions, | la fumée, | et la mauvaise odeur. | Autant d'inconvénients | qui n'existent que dans leur imagination."),
  ("narrator", "La nuit tomba brusquement. | Nous attendions dans le noir. | Enfin, | quelqu'un toussa à la porte. | Ma mère courut chercher la bouteille de pétrole, | et à la lumière d'un bout de chandelle, | elle remplit la lampe, | et alluma."),
  ("mohammed", "Soirée de bénédiction.", "small boy, solemn and proud, saying a ritual greeting"),
  ("zoubida", "Que ta soirée soit bénie.", "mother answering softly, tender, smiling"),
 ]),
 ("s08_menthe", {}, [
  ("kanza", "Lalla Zoubida, | bénie soit ta soirée ! | Pourrais-tu me donner un brin de menthe ?", "old woman calling up from the ground floor of a courtyard house, honeyed"),
  ("zoubida", "Sidi Mohammed va te le porter !", "mother calling down the courtyard, cheerful"),
  ("narrator", "Dans le patio, | une odeur d'encens et de benjoin alourdissait l'air. | J'étais persuadé qu'une assemblée de démons | se tenait dans la pénombre."),
  ("narrator", "Lalla Kanza me donna une poignée de sésame. | Un repas offert aux génies ? | J'y goûtai du bout de la langue... | et je mangeai tout."),
  ("narrator", "Les grains se collaient à mes lèvres, | et au bout de mon nez."),
  ("narrator", "Ma langue balayait ce qu'elle pouvait atteindre. | Le reste, | je l'époussetai du bout des doigts."),
 ]),
 ("s09_escalier", {}, [
  ("narrator", "Il faisait noir dans l'escalier. | Mais le vide devant moi n'était vide qu'en apparence. | Des présences muettes s'écartaient pour me laisser passer."),
  ("narrator", "Un jour, | quand j'aurais l'âge, | toutes ces présences | se découvriraient à mes yeux de voyant."),
  ("zoubida", "Dieu est le plus grand.", "mother speaking calmly from the next room, solemn, quiet, clear voice (wall muffling is added in the mix)"),
  ("voisine", "Est-ce le muezzin de l'Achaa que j'entends ?", "woman asking quietly from another room, heard through a wall"),
  ("zoubida", "Oui.", "mother answering calmly from the next room, a soft, warm, clearly spoken yes"),
  ("narrator", "Je retenais mon souffle. | Je n'entendais aucun muezzin. | Les femmes, | dit-on, | ont l'oreille plus fine que les hommes."),
 ]),
 ("s10_plans", {}, [
  ("narrator", "Mon père ne tarda pas à rentrer. | Le dîner se déroula comme à l'ordinaire."),
  ("father", "Demain matin, | nous irons au souk choisir tes jouets. | Et à Bab Moulay Idriss, | nous achèterons un cierge pour ton maître.", "father at night by the lamp, gentle, smiling"),
  ("narrator", "J'étais heureux. | Une seule chose m'ennuyait : | je n'échapperais pas au coiffeur, | Si Abderrahman. | Je savais qu'un jour, | c'est lui qui me circoncirait. | Je redoutais ce jour."),
  ("narrator", "Je me couchai. | Mais le sommeil avait fui mes paupières."),
  ("narrator", "Je rêvai longtemps de cierges monumentaux, | de rasoirs étincelants, | et de lustres chargés de godets de cristal."),
 ]),

 # ------------------------------------------------------------------ ACT II: la veille
 ("s11_souk", {"card": "LA VEILLE"}, [
  ("narrator", "Mon père ne connaissait rien à l'art de marchander. | Dans chaque rue | résonnaient les tambourins, | les grelots des hochets, | et le chant des flûtiaux."),
  ("narrator", "Des tambourins, | des trompettes, | des pipeaux, | pendaient par grappes. | Autour de chaque échoppe, | un peuple de femmes, | d'hommes, | et d'enfants, | essayaient, | jacassaient, | discutaient. | Le marchand ne savait plus où donner de la tête."),
  ("narrator", "Des campagnards, | descendus de leurs villages lointains, | encombraient la rue de leurs paquets."),
  ("narrator", "Je m'accrochais à sa main. | J'eus mon tambour en forme de sablier, | un petit chariot en bois, | et une nouvelle trompette. | Il payait sans discuter."),
  ("narrator", "Je lui tenais de longs discours. | Je lui posais mille questions. | Il répondait rarement. | Il souriait, | de me voir si excité."),
  ("narrator", "Pour finir, | un cierge d'une livre. | Et tout près, | sous un pied de vigne séculaire, | la boutique de Si Abderrahman."),
  ("narrator", "Mon père s'y faisait raser depuis son arrivée à Fès. | À ma naissance, | Si Abderrahman était venu servir les invités. | Et c'est lui | qui m'avait coupé les cheveux pour la première fois."),
  ("narrator", "Je ne l'aimais pas. | Des frissons me parcouraient la peau | quand je le voyais manier le rasoir, | ou les ciseaux."),
 ]),
 ("s12_barbier", {}, [
  ("narrator", "Il pratiquait une saignée. | Il planta deux ventouses de fer-blanc sur la nuque d'un inconnu. | Je détournai les yeux."),
  ("barber", "Je vois que ce jeune homme a été gâté ! | Un tambour, | une trompette, | un chariot, | et un cierge pour le fqih. | Il faut toujours être bien avec son maître... | sinon, | gare à la baguette de cognassier !", "barber teasing a child, jovial, fishing for laughs"),
  ("narrator", "Tout le monde se mit à rire. | Moi, | je rougissais d'indignation. | Ces messieurs n'avaient jamais reçu la baguette sur la plante des pieds. | Ils pouvaient rire."),
  ("narrator", "La baguette de cognassier | inspire à ceux qui la connaissent | un sentiment de crainte, | et de respect."),
 ]),
 ("s13_hammad", {}, [
  ("narrator", "Un homme sec, | avec une barbe de bouc et un turban monumental, | s'écroula sur une chaise."),
  ("hammad", "Si Abderrahman... | je vais mourir.", "old man collapsing on a chair, groaning, theatrical"),
  ("barber", "Ne dis pas ça, oncle Hammad ! | Allah seul connaît les secrets de la vie et de la mort. | Il te faut un fortifiant.", "barber, mock-solemn, then curious"),
  ("hammad", "Un fortifiant ? | Donne-moi vite ta recette ! | Ma mémoire est intacte... | c'est le cœur qui faiblit.", "old man suddenly eager, still groaning, clutching his chest"),
  ("barber", "Fais frire un oignon blanc dans du beurre. | Ajoute deux cuillerées de miel, | de l'anis, | du sésame, | du gingembre, | de la cannelle, | et trois clous de girofle. | Une bouchée chaque matin !", "barber rattling off a remedy at top speed, like a recipe he has said a hundred times"),
  ("hammad", "Dieu te récompensera, | le jour du jugement !", "old man getting up with great effort, groaning, grateful"),
  ("narrator", "L'oncle Hammad s'extirpa de son siège, | et partit, | en poussant de sourds gémissements."),
 ]),
 ("s14_larbi", {"tag": "À RETENIR : Moulay Larbi, le babouchier, n'a pas d'enfants"}, [
  ("barber", "Aujourd'hui, | mon aide est absent, | et l'apprenti est en prison, | pour je ne sais quel méfait. | Je suis seul à travailler !", "barber complaining cheerfully to a customer while checking cupping glasses"),
  ("barber", "Hier, | j'ai fait une saignée à Moulay Larbi, | le babouchier. | Un homme digne. | Ce qui m'étonne, | c'est qu'il n'ait point d'enfants.", "barber gossiping while honing a razor, lowered confidential voice"),
  ("barber", "On dit que sa femme est une Chérifa au cœur généreux. | Grâce à elle, | il a payé ses dettes. | Ne crois-tu pas... | qu'il devrait prendre une nouvelle épouse ?", "barber gossiping, sly, insinuating, slow on the last words"),
  ("barber", "Il paraît que dans certains pays, | les femmes vont se faire coiffer chez le coiffeur ! | Que ne suis-je né | dans l'un de ces pays fabuleux !", "barber dreaming aloud, then a long sigh of regret, comic"),
  ("narrator", "Mon père écoutait, | indifférent."),
  ("narrator", "Assis sur la banquette, | les pieds dans le vide, | je regardais les panoplies de rasoirs, | les miroirs à main, | et la majestueuse chaise peinte, | aux couleurs fanées."),
 ]),
 ("s15_lamrani", {}, [
  ("narrator", "Un nouveau client entra : | jeune, | la peau d'une blancheur de cire, | la barbe plus noire que l'aile du corbeau."),
  ("lamrani", "Le salut sur vous !", "young man entering a shop, polite, soft"),
  ("barber", "Sur vous le salut, | la miséricorde, | et la bénédiction d'Allah !", "barber greeting a favourite customer, delighted, a little neigh of joy"),
  ("barber", "Sidi Ahmed ! | Comment va ton vénéré père ? | Son genou ? | Mon onguent a agi ! | Et toi, | je sais déjà : | tu épouses la fille de Si Omar le notaire !", "barber overjoyed, flattering, answering his own questions, very fast"),
  ("narrator", "Sidi Ahmed ouvrit la bouche plusieurs fois. | Mais le barbier devinait ses réponses, | et lui épargnait la fatigue de les formuler."),
  ("barber", "Sidi Ahmed est le fils d'El Haj Ali Lamrani, | le marchand de thé. | Trois fois, | il a fait le pèlerinage aux Lieux Saints !", "barber turning to another customer to inform him, proud, pious"),
  ("barber", "Que deviennent tes études ? | Te voilà un savant !", "barber flattering, fast"),
  ("lamrani", "Je ne suis qu'un mendiant de la science.", "young scholar finally getting a word in, modest, quick, almost a whisper"),
  ("lamrani", "Si Abderrahman, | tu en sais plus long que moi sur mon mariage. | Mes parents s'en occupent. | Je n'ai pas mon mot à dire.", "young man, shy, half amused, taking advantage of a rare silence"),
  ("barber", "Depuis quand les jeunes gens ont-ils leur mot à dire ? | Ils ont des livres... | mais il leur manque l'expérience des gens mûrs !", "barber lecturing, amused, wagging a finger"),
  ("barber", "Se marier, | c'est créer des liens avec une autre famille. | Moi, | j'ai une fille en âge d'être mariée. | Mon futur gendre sera un peu mon fils.", "barber suddenly serious and dreamy, slow, meaningful"),
 ]),
 ("s16_rasoir", {}, [
  ("barber", "Je vais commencer par cet enfant. | Il préférerait sans doute être dans la rue.", "barber turning to a child, friendly"),
  ("narrator", "Il m'enveloppa dans une large serviette, | rayée rouge et jaune. | Il me savonna la tête. | Son regard était vague."),
  ("barber", "La rue ! | La rue avec la foule et ses odeurs, | ses chants, | et ses cris d'enfants... | La rue où trottine le petit âne gris, | où tourbillonnent des vols de moineaux...", "barber lost in a reverie, lyrical, slowing down, a poem to the street"),
  ("lamrani", "Tu es un poète, | Si Abderrahman !", "young man, sincerely amazed"),
  ("barber", "Comment pourrais-je être poète ? | Je sais à peine lire et écrire. | J'aime simplement | notre bonne ville de Fès.", "barber, modest, touched, warm"),
  ("father", "Tu sais joliment en parler.", "father, quiet, a rare compliment"),
  ("barber", "Si Abdeslem, | on parle toujours bien | des choses qu'on aime.", "barber, gentle, sincere, slow"),
  ("narrator", "Il choisit un rasoir à manche d'ébène, | et le passa sur une pierre gluante d'huile."),
  ("narrator", "Il commença au sommet du crâne. | Il m'obligea à baisser le nez jusqu'aux genoux, | et racla à petits coups | le duvet de ma nuque."),
  ("narrator", "Le rasoir me brûlait un peu. | Je ne disais rien. | Une torpeur m'envahit. | Je m'endormis."),
  ("narrator", "Ma tête s'en alla de travers... | et la lame me mordit."),
  ("narrator", "Je me réveillai en sursaut. | Le coiffeur discutait toujours. | Des gouttes de sueur | coulaient le long de mon nez."),
 ]),
 ("s17_rue", {}, [
  ("narrator", "Je me sentis léger, | comme saigné à blanc."),
  ("narrator", "J'eus mal au cœur. | Je cherchai des yeux mon père."),
  ("father", "Viens. | L'air frais te fera du bien.", "father worried, gentle, helping a child up"),
  ("father", "Si Abderrahman, | je reviendrai ce soir me faire raser. | Messieurs, | je vous laisse dans la paix d'Allah.", "father, polite and calm, already leaving with his child"),
  ("narrator", "Nous voici de nouveau dans la rue. | Jamais elle ne me parut aussi belle, | aussi enchantée, | que ce jour-là."),
  ("narrator", "Je me sentis beaucoup mieux. | De toutes les terrasses, | nous parvenait le bourdonnement des tambourins."),
 ]),
 ("s18_concert", {}, [
  ("narrator", "À la maison, | Zineb tapait sans rythme sur sa tarifa de quatre sous. | J'avais hâte de la faire mourir de jalousie."),
  ("narrator", "Je trouvai deux bâtonnets, | passai mon tambour en bandoulière, | et commençai une nouba de ma composition, | à crever le tympan | de tout le quartier."),
  ("narrator", "Je m'équipai en homme-orchestre : | le tambour par terre, | la trompette entre les genoux. | Zineb me rejoignit."),
  ("femmes", "Grâce ! | Pitié pour nos oreilles !", "women laughing and shouting together over loud drumming"),
  ("narrator", "Elles nous conseillèrent de monter sur la terrasse, | charmer les oreilles des voisins."),
  ("narrator", "Ma mère m'essaya une chemise neuve. | Elle craquait d'apprêt, | et tombait jusqu'au sol."),
  ("narrator", "Mes bras se perdaient dans les immenses manches. | Mais je ne pensais qu'à mon tambour."),
  ("narrator", "Sur la terrasse, | deux filles et un garçon nous attendaient. | Le garçon tira de ma trompette des rugissements inattendus. | Des femmes se perchèrent sur les murs pour nous admirer."),
  ("narrator", "Nous nous abandonnâmes à la joie du rythme. | Nous nous soûlâmes de bruit."),
 ]),
 ("s19_bain", {}, [
  ("narrator", "Nous jouâmes jusqu'au soir. | Ma mère vint me chercher : | demain, | il faudrait se lever à la première heure, | pour commencer l'année au Msid."),
  ("narrator", "Au coucher du soleil, | ma mère m'emmena à la cuisine. | L'auge de bois débordait d'eau bouillante. | Elle y versa un seau d'eau fraîche, | et me plongea dedans."),
  ("mohammed", "Aïe ! | Arrête de frotter si fort !", "small boy screaming and struggling while being scrubbed hard"),
  ("narrator", "Elle me frotta avec une rondelle de liège. | Et je sombrai dans le noir. | Un noir peuplé de petites filles taquines, | et de barbiers bavards."),
 ]),

 # ------------------------------------------------------------------ ACT III: la nuit
 ("s20_reveil", {"card": "LA NUIT DE L'ACHOURA"}, [
  ("narrator", "La voix de ma mère me tira des profondeurs du sommeil. | Je nageai un moment | dans une lumière rouge, | parcourue d'étincelles, | et d'astres errants."),
  ("zoubida", "Réveille-toi ! | Il est trois heures du matin ! | Je t'ai préparé ton beau gilet, | ta chemise neuve, | et ta sacoche brodée !", "mother waking a child in the middle of the night, insistent, excited, whispering loudly"),
  ("narrator", "Je pleurnichai. | Ma mère fut impitoyable : | elle se mouilla la main, | et me la passa sur la figure."),
  ("father", "Prépare-toi pour fêter l'Achoura au Msid. | Du courage ! | Du courage !", "father smiling, warm, encouraging, at night"),
  ("narrator", "Ce fut en somnambule | que je me lavai les yeux, | et me rinçai la bouche."),
  ("narrator", "La chemise neuve me grattait horriblement, | et craquait comme du papier froissé. | Puis le gilet rouge, | la sacoche, | et la djellaba blanche, | parfumée à la fleur d'oranger."),
  ("narrator", "Me voilà devenu un autre homme !"),
  ("narrator", "Tout était neuf. | Plein de dignité, | je précédai mon père dans l'escalier."),
 ]),
 ("s21_babouches", {}, [
  ("narrator", "La lumière brillait à toutes les fenêtres. | Celui qui resterait au lit un matin comme celui-ci | serait paresseux | pendant douze mois."),
  ("narrator", "Je perdais mes babouches tous les trois pas. | Mais j'étais heureux."),
  ("narrator", "Dans le noir, | l'appel d'un mendiant, | et le bruit de sa canne. | Sûrement un aveugle."),
  ("narrator", "Mon père me glissa dans la main une pièce de cinq francs, | et me mit dans les bras le cierge. | Mes cadeaux de nouvel an, | pour le maître."),
  ("narrator", "Les passants nous souriaient. | Les boutiques étaient ouvertes, | les rues éclairées. | Et de loin, | j'aperçus les fenêtres de notre école."),
 ]),
 ("s22_feerie", {"music": "feerie"}, [
  ("narrator", "Je faillis lâcher mon cierge. | Des grappes de lumière transformaient la façade de l'école | en un décor de féerie."),
  ("narrator", "Les voix des élèves montaient, | claires, | dans la fraîcheur du matin. | Elles rivalisaient de gaieté | avec les petites flammes, | dans leur bain d'huile, | et d'eau teintée des couleurs de l'arc-en-ciel."),
  ("narrator", "Je n'étais plus le prince unique au gilet amarante, | mais un membre d'une congrégation de jeunes seigneurs, | chantant sous la direction d'un roi de légende."),
  ("narrator", "Je remis solennellement mon cierge, | et ma pièce de cinq francs."),
  ("narrator", "Les enfants se serrèrent pour me laisser une place. | Je scandai les versets avec conviction."),
  ("narrator", "Ma chemise collait à mon corps. | Des picotements insupportables | me parcouraient le dos."),
  ("narrator", "La chaleur devenait étouffante. | Un élève saigna du nez sur ses beaux habits."),
  ("narrator", "Je levai les yeux. | Les petites flammes dansaient, | grésillaient. | Je me taisais pour les entendre psalmodier, | comme nous, | la parole de Dieu."),
  ("narrator", "Ce matin-là, | les objets les plus ordinaires, | les êtres les plus déshérités, | mêlaient leurs voix aux nôtres, | et clamaient avec nous | la grandeur, | et la miséricorde de Dieu."),
 ]),
 ("s23_aube", {}, [
  ("narrator", "Après le Coran, | nous chantâmes des cantiques. | Des pères psalmodiaient avec nous. | Ils célébraient l'Achoura au Msid, | comme au temps de leur enfance."),
  ("narrator", "À l'approche du jour, | la lumière des veilleuses s'anémiait. | Deux moineaux voletèrent autour des lustres."),
  ("fqih", "Seigneur, | fais régner sur cette terre | l'ordre, | la justice, | et la compassion.", "schoolmaster praying aloud, eyes to the ceiling, hands open, fervent, slow"),
  ("eleves", "Amine ! | Amine !", "crowd of boys answering a prayer together, fervent"),
  ("narrator", "C'était la première fois que je voyais le fqih sans sa baguette de cognassier. | Il me parut beau."),
  ("narrator", "Enveloppé dans sa djellaba à raies blanches et noires, | les épaules couvertes d'un burnous gris."),
  ("fqih", "Je vous donne trois jours de repos.", "schoolmaster, kind for once, a small smile"),
  ("narrator", "Et comme la rentrée tombait un jeudi : | quatre jours !"),
  ("narrator", "J'embrassai la main du fqih. | Il me chargea de ses vœux pour mes parents."),
 ]),

 # ------------------------------------------------------------------ ACT IV: le jour
 ("s24_idriss", {"card": "LE JOUR DE L'ACHOURA"}, [
  ("narrator", "La rue était maintenant très animée. | Presque tous les passants | s'étaient habillés de neuf."),
  ("narrator", "À la maison, | ma mère avait mis sa belle mansouria à rayures de satin jaune."),
  ("narrator", "La bouilloire chantait. | Ma mère avait préparé une pile de galettes feuilletées, | au beurre frais et au miel. | C'était un délice."),
  ("narrator", "Puis mon père m'emmena à Moulay Idriss, | le patron de la ville. | Sur la place des notaires, | il acheta un plat de céramique bleue."),
  ("narrator", "Dans le sanctuaire, | nous fîmes la prière, | puis nous rentrâmes déjeuner."),
 ]),
 ("s25_aicha", {"tag": "À RETENIR : le mari de Lalla Aïcha, c'est Moulay Larbi"}, [
  ("narrator", "À la fin du déjeuner, | Lalla Aïcha vint nous surprendre."),
  ("narrator", "Les deux femmes se prodiguèrent des baisers pointus, | et des mots aimables. | Mon père, | discrètement, | disparut."),
  ("narrator", "Lalla Aïcha avait beaucoup à raconter. | Et ma mère | frétillait de curiosité."),
  ("zoubida", "Lalla Aïcha, | installe-toi sur le grand divan, | à la place d'honneur !", "hostess insisting warmly, delighted"),
  ("narrator", "Ce n'était pas vraiment un récit, | mais une série d'événements, | accolés les uns aux autres. | Parfois, | Lalla Aïcha elle-même | ne savait plus où elle en était."),
  ("narrator", "À côté de chez elle, | pour distinguer les voisines, | on citait le métier du mari : | la femme de l'épicier, | la femme du tailleur, | la femme du marchand de pétrole..."),
  ("aicha", "Dans la maison voisine, | toutes les femmes s'appellent Khadija ! | Il serait plus simple de dire : | Khadija la sourde, | Khadija la louchonne !", "gossiping guest telling a joke, delighted with herself, laughing at the end"),
  ("narrator", "Nous rîmes de bon cœur. | Puis ma mère prépara son thé des grands jours, | avec un bouquet de sauge, | et d'absinthe."),
  ("zoubida", "Et ton homme ? | Ses affaires ?", "friend asking over tea, curious"),
  ("aicha", "Il emploie trois ouvriers. | Les babouches se vendent bien. | Il m'a promis un caftan de drap abricot.", "proud, content, then trailing off"),
  ("zoubida", "Louange à Dieu ! | Les difficultés finissent toujours par s'aplanir.", "friend, warm, relieved, pouring tea"),
  ("aicha", "Oui...", "a long sigh, suddenly sad, one word"),
  ("narrator", "Puis, | subitement, | Lalla Aïcha se tut."),
  ("zoubida", "À quoi penses-tu, | Lalla Aïcha ? | Tu sembles triste.", "friend, worried, gentle, lowering her voice"),
  ("aicha", "Nous sommes de bien faibles créatures, | nous les femmes. | Gardons-nous de faire confiance aux hommes. | Ils sont... | Ils sont...", "woman whispering a secret worry to a friend, sad, unable to find the word"),
  ("narrator", "Elle ne trouva pas le mot juste. | Elle agita les mains à la hauteur de ses épaules, | et leva les yeux au ciel."),
  ("narrator", "Ma mère m'envoya jouer sur la terrasse. | Je compris : | elles avaient des secrets."),
  ("narrator", "Seul sur la terrasse, | j'inventais les rythmes les plus barbares. | Et en bas, | les deux femmes papotaient, | papotaient, | papotaient."),
  ("narrator", "Le soir, | le soleil en robe d'or baignait la ville de rose fané. | La première étoile clignota. | Lalla Aïcha partit."),
 ]),
 ("s26_fin", {"tail": 2.5}, [
  ("narrator", "La lampe fut allumée. | Nous étions sans entrain. | Mon tambour et ma trompette gisaient sur un matelas."),
  ("narrator", "J'en étais dégoûté. | Je retrouvai avec plaisir mes vieux vêtements."),
  ("narrator", "De mes habits neufs, | je ne gardai que la chemise. | Grâce à la chaleur de mon corps, | son tissu s'était humanisé."),
  ("narrator", "Pour échapper au bruit des tambours, | j'ouvris ma Boîte à merveilles. | Mes yeux, | hélas, | n'avaient plus la force de regarder."),
 ]),

 # ------------------------------------------------------------------ student layer + promo
 ("s27_fiche", {"lead": 0.8, "music": "fiche"}, [
  ("narrator", "Fiche de révision. | Chapitre sept : | l'Achoura, | en quatre temps.", "a clear friendly teacher summing up for students, crisp"),
  ("narrator", "Les tambourins, | le barbier, | la nuit au Msid, | et la visite de Lalla Aïcha.", "teacher summing up, crisp, rhythmic"),
  ("narrator", "Le détail à retenir : | chez le barbier, | on parle de Moulay Larbi, | sans enfants, | et d'une nouvelle épouse. | Or Moulay Larbi, | c'est le mari de Lalla Aïcha. | Et le barbier a une fille à marier...", "teacher, conspiratorial, slowing down"),
  ("narrator", "Thèmes : | la fête, | le regard de l'enfant, | la condition de la femme. | Au chapitre huit : | le secret de Lalla Aïcha.", "teacher, crisp, ending on a teaser"),
 ]),
 ("s28_endcard", {"lead": 0, "tail": 0, "hold": 8}, []),
]


def phon(txt):
    for a, b in PHON.items():
        if a != b:
            txt = re.sub(r"\b%s\b" % re.escape(a), b, txt)
    return txt


HOLD_IN = {"s04_chat": 2.2, "s12_barbier": 2.0, "s22_feerie": 3.0, "s23_aube": 2.2}   # establishing shots


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
    doc = {"episode": 7, "title": "La nuit de l'Achoura", "chapter": 7, "gap": 0.8,
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
