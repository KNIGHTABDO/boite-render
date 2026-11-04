#!/usr/bin/env python3
"""Builds script.json for ep07 (Chapitre VII, l'Achoura). ' | ' = <short pause>.
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
}

S = [
 # ------------------------------------------------------------------ cold open (s01) + roadmap (s02)
 ("s01_cold", {"lead": 2.2, "tail": 1.2, "music": "drone"}, [
  ("narrator", "Ce jour-là, | sous le rasoir de Si Abderrahman, | j'ai connu la peur."),
  ("narrator", "Et quelques heures plus tard, | la plus belle nuit de mon enfance."),
 ]),
 ("s02_roadmap", {"lead": 0, "tail": 0, "hold": 4.0}, []),

 # ------------------------------------------------------------------ ACT I: J-2
 ("s03_tambourins", {"card": "DEUX JOURS AVANT L'ACHOURA", "lead": 0.6}, [
  ("narrator", "Deux jours avant l'Achoura, | les femmes de la maison s'achetèrent toutes des tambourins. | Ma mère essaya son bendir."),
  ("narrator", "Des coups graves et des coups secs | parlèrent un dialecte rude, | mélange de soleil | et de vent de haute montagne."),
  ("narrator", "Zineb tapait comme une sourde | sur un minuscule tambourin de pacotille. | Moi, | j'avais une trompette en fer-blanc. | Elle éclatait dans la maison comme un cri d'alarme, | parfois, | comme un sanglot d'agonisant."),
  ("zoubida", "Va donc braire sur la terrasse !", "mother with her hands over her ears, exasperated but amused"),
 ]),
 ("s04_chat", {}, [
  ("narrator", "Je gonflai mes joues, | et soufflai de toutes mes forces. | On aurait dit un bébé qui perce ses premières dents."),
  ("narrator", "Le chat de Zineb fit un saut d'épouvante, | et s'engouffra dans une gouttière. | Une tête inquiète surgit du mur voisin, | et disparut."),
 ]),
 ("s05_hammoussa", {}, [
  ("zoubida", "Un de tes camarades t'attend dans le patio. | Prends tes babouches : | le fqih a besoin de toi !", "mother calling up the stairs, loud, from far below"),
  ("narrator", "C'était Hammoussa, | « pois chiche », | le plus petit élève de l'école."),
  ("hammoussa", "Dépêche-toi ! | Il faut préparer les lustres de l'Achoura !"),
 ]),
 ("s06_lustres", {}, [
  ("narrator", "Au Msid, | on découpait de minuscules mèches | dans une vieille cotonnade blanche."),
  ("narrator", "Chaque mèche était agrafée à une lamelle de fer-blanc, | posée sur le bord d'un verre : | moitié eau, | moitié huile d'olive. | Et dans l'eau, | des poudres de couleur."),
  ("narrator", "Les poudres, | en petits paquets, | reposaient dans les babouches du fqih."),
  ("narrator", "Les grands, | suspendus à une échelle branlante, | accrochaient au plafond les lustres en fer forgé. | Hammoussa se coupa le pouce avec une lamelle, | et partit en pleurnichant doucement."),
  ("narrator", "Le soir, | nous chantâmes des cantiques, | et le maître pria, | même pour le Sultan, | prince des Croyants."),
 ]),
 ("s07_petrole", {}, [
  ("narrator", "À la maison, | ma mère était très ennuyée : | plus de pétrole dans la lampe ! | Driss El Aouad, | notre voisin, | accepta d'aller en acheter."),
  ("vendeur", "Des bougies | et des allumettes !", "street seller crying his goods far away in the alley, echoing"),
  ("narrator", "Les bougies ? | C'était bon pour les pauvres."),
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
 ]),
 ("s09_escalier", {}, [
  ("narrator", "Il faisait noir dans l'escalier. | Mais le vide devant moi n'était vide qu'en apparence. | Des présences muettes s'écartaient pour me laisser passer."),
  ("zoubida", "Dieu est le plus grand.", "mother speaking calmly from the next room, solemn, quiet, clear voice (wall muffling is added in the mix)"),
  ("voisine", "Est-ce le muezzin de l'Achaa que j'entends ?", "woman asking quietly from another room, heard through a wall"),
  ("zoubida", "Oui.", "mother answering calmly from the next room, a soft, warm, clearly spoken yes"),
  ("narrator", "Je retenais mon souffle. | Je n'entendais aucun muezzin. | Les femmes, | dit-on, | ont l'oreille plus fine que les hommes."),
 ]),
 ("s10_plans", {}, [
  ("father", "Demain matin, | nous irons au souk choisir tes jouets. | Et à Bab Moulay Idriss, | nous achèterons un cierge pour ton maître.", "father at night by the lamp, gentle, smiling"),
  ("narrator", "J'étais heureux. | Une seule chose m'ennuyait : | je n'échapperais pas au coiffeur, | Si Abderrahman. | Je savais qu'un jour, | c'est lui qui me circoncirait. | Je redoutais ce jour."),
  ("narrator", "Je rêvai longtemps de cierges monumentaux, | de rasoirs étincelants, | et de lustres chargés de godets de cristal."),
 ]),

 # ------------------------------------------------------------------ ACT II: la veille
 ("s11_souk", {"card": "LA VEILLE"}, [
  ("narrator", "Mon père ne connaissait rien à l'art de marchander. | Dans chaque rue | résonnaient les tambourins, | les grelots des hochets, | et le chant des flûtiaux."),
  ("narrator", "Je m'accrochais à sa main. | J'eus mon tambour en forme de sablier, | un petit chariot en bois, | et une nouvelle trompette. | Il payait sans discuter."),
  ("narrator", "Pour finir, | un cierge d'une livre. | Et tout près, | sous un pied de vigne séculaire, | la boutique de Si Abderrahman."),
 ]),
 ("s12_barbier", {}, [
  ("narrator", "Il pratiquait une saignée. | Il planta deux ventouses de fer-blanc sur la nuque d'un inconnu. | Je détournai les yeux."),
  ("barber", "Je vois que ce jeune homme a été gâté ! | Un tambour, | une trompette, | un chariot, | et un cierge pour le fqih. | Il faut toujours être bien avec son maître... | sinon, | gare à la baguette de cognassier !", "barber teasing a child, jovial, fishing for laughs"),
  ("narrator", "Tout le monde se mit à rire. | Moi, | je rougissais d'indignation. | Ces messieurs n'avaient jamais reçu la baguette sur la plante des pieds. | Ils pouvaient rire."),
 ]),
 ("s13_hammad", {}, [
  ("narrator", "Un homme sec, | avec une barbe de bouc et un turban monumental, | s'écroula sur une chaise."),
  ("hammad", "Si Abderrahman... | je vais mourir.", "old man collapsing on a chair, groaning, theatrical"),
  ("barber", "Ne dis pas ça, oncle Hammad ! | Allah seul connaît les secrets de la vie et de la mort. | Il te faut un fortifiant.", "barber, mock-solemn, then curious"),
  ("barber", "Fais frire un oignon blanc dans du beurre. | Ajoute deux cuillerées de miel, | de l'anis, | du sésame, | du gingembre, | de la cannelle, | et trois clous de girofle. | Une bouchée chaque matin !", "barber rattling off a remedy at top speed, like a recipe he has said a hundred times"),
  ("hammad", "Dieu te récompensera, | le jour du jugement !", "old man getting up with great effort, groaning, grateful"),
 ]),
 ("s14_larbi", {"tag": "À RETENIR : Moulay Larbi, le babouchier, n'a pas d'enfants"}, [
  ("barber", "Hier, | j'ai fait une saignée à Moulay Larbi, | le babouchier. | Un homme digne. | Ce qui m'étonne, | c'est qu'il n'ait point d'enfants.", "barber gossiping while honing a razor, lowered confidential voice"),
  ("barber", "On dit que sa femme est une Chérifa au cœur généreux. | Grâce à elle, | il a payé ses dettes. | Ne crois-tu pas... | qu'il devrait prendre une nouvelle épouse ?", "barber gossiping, sly, insinuating, slow on the last words"),
  ("narrator", "Mon père écoutait, | indifférent."),
 ]),
 ("s15_lamrani", {}, [
  ("narrator", "Un nouveau client entra : | jeune, | la peau d'une blancheur de cire, | la barbe plus noire que l'aile du corbeau."),
  ("barber", "Sidi Ahmed ! | Comment va ton vénéré père ? | Son genou ? | Mon onguent a agi ! | Et toi, | je sais déjà : | tu épouses la fille de Si Omar le notaire !", "barber overjoyed, flattering, answering his own questions, very fast"),
  ("barber", "Que deviennent tes études ? | Te voilà un savant !", "barber flattering, fast"),
  ("lamrani", "Je ne suis qu'un mendiant de la science.", "young scholar finally getting a word in, modest, quick, almost a whisper"),
  ("barber", "Se marier, | c'est créer des liens avec une autre famille. | Moi, | j'ai une fille en âge d'être mariée. | Mon futur gendre sera un peu mon fils.", "barber suddenly serious and dreamy, slow, meaningful"),
 ]),
 ("s16_rasoir", {}, [
  ("barber", "Je vais commencer par cet enfant. | Il préférerait sans doute être dans la rue.", "barber turning to a child, friendly"),
  ("barber", "La rue ! | La rue avec la foule et ses odeurs, | ses chants, | et ses cris d'enfants... | La rue où trottine le petit âne gris, | où tourbillonnent des vols de moineaux...", "barber lost in a reverie, lyrical, slowing down, a poem to the street"),
  ("lamrani", "Tu es un poète, | Si Abderrahman !", "young man, sincerely amazed"),
  ("narrator", "Il choisit un rasoir à manche d'ébène, | et le passa sur une pierre gluante d'huile."),
  ("narrator", "Le rasoir me brûlait un peu. | Je ne disais rien. | Une torpeur m'envahit. | Je m'endormis."),
  ("narrator", "Ma tête s'en alla de travers... | et la lame me mordit."),
 ]),
 ("s17_rue", {}, [
  ("narrator", "Je me sentis léger, | comme saigné à blanc."),
  ("father", "Viens. | L'air frais te fera du bien.", "father worried, gentle, helping a child up"),
  ("narrator", "Nous voici de nouveau dans la rue. | Jamais elle ne me parut aussi belle, | aussi enchantée, | que ce jour-là."),
 ]),
 ("s18_concert", {}, [
  ("narrator", "À la maison, | Zineb tapait sans rythme sur sa tarifa de quatre sous. | J'avais hâte de la faire mourir de jalousie."),
  ("narrator", "Je m'équipai en homme-orchestre : | le tambour par terre, | la trompette entre les genoux. | Zineb me rejoignit."),
  ("femmes", "Grâce ! | Pitié pour nos oreilles !", "women laughing and shouting together over loud drumming"),
  ("narrator", "Ma mère m'essaya une chemise neuve. | Elle craquait d'apprêt, | et tombait jusqu'au sol."),
  ("narrator", "Sur la terrasse, | deux filles et un garçon nous attendaient. | Le garçon tira de ma trompette des rugissements inattendus. | Des femmes se perchèrent sur les murs pour nous admirer."),
 ]),
 ("s19_bain", {}, [
  ("narrator", "Au coucher du soleil, | ma mère m'emmena à la cuisine. | L'auge de bois débordait d'eau bouillante. | Elle y versa un seau d'eau fraîche, | et me plongea dedans."),
  ("mohammed", "Aïe ! | Arrête de frotter si fort !", "small boy screaming and struggling while being scrubbed hard"),
  ("narrator", "Elle me frotta avec une rondelle de liège. | Et je sombrai dans le noir. | Un noir peuplé de petites filles taquines, | et de barbiers bavards."),
 ]),

 # ------------------------------------------------------------------ ACT III: la nuit
 ("s20_reveil", {"card": "LA NUIT DE L'ACHOURA"}, [
  ("zoubida", "Réveille-toi ! | Il est trois heures du matin ! | Je t'ai préparé ton beau gilet, | ta chemise neuve, | et ta sacoche brodée !", "mother waking a child in the middle of the night, insistent, excited, whispering loudly"),
  ("narrator", "Je pleurnichai. | Ma mère fut impitoyable : | elle se mouilla la main, | et me la passa sur la figure."),
  ("father", "Prépare-toi pour fêter l'Achoura au Msid. | Du courage ! | Du courage !", "father smiling, warm, encouraging, at night"),
  ("narrator", "La chemise neuve me grattait horriblement, | et craquait comme du papier froissé. | Puis le gilet rouge, | la sacoche, | et la djellaba blanche, | parfumée à la fleur d'oranger."),
  ("narrator", "Me voilà devenu un autre homme !"),
 ]),
 ("s21_babouches", {}, [
  ("narrator", "Je perdais mes babouches tous les trois pas. | Mais j'étais heureux."),
  ("narrator", "Dans le noir, | l'appel d'un mendiant, | et le bruit de sa canne. | Sûrement un aveugle."),
  ("narrator", "Mon père me glissa dans la main une pièce de cinq francs, | et me mit dans les bras le cierge. | Mes cadeaux de nouvel an, | pour le maître."),
 ]),
 ("s22_feerie", {"music": "feerie"}, [
  ("narrator", "Je faillis lâcher mon cierge. | Des grappes de lumière transformaient la façade de l'école | en un décor de féerie."),
  ("narrator", "Je n'étais plus le prince unique au gilet amarante, | mais un membre d'une congrégation de jeunes seigneurs, | chantant sous la direction d'un roi de légende."),
  ("narrator", "Je remis solennellement mon cierge, | et ma pièce de cinq francs."),
  ("narrator", "La chaleur devenait étouffante. | Un élève saigna du nez sur ses beaux habits."),
  ("narrator", "Je levai les yeux. | Les petites flammes dansaient, | grésillaient. | Je me taisais pour les entendre psalmodier, | comme nous, | la parole de Dieu."),
 ]),
 ("s23_aube", {}, [
  ("narrator", "À l'approche du jour, | la lumière des veilleuses s'anémiait. | Deux moineaux voletèrent autour des lustres."),
  ("fqih", "Seigneur, | fais régner sur cette terre | l'ordre, | la justice, | et la compassion.", "schoolmaster praying aloud, eyes to the ceiling, hands open, fervent, slow"),
  ("eleves", "Amine ! | Amine !", "crowd of boys answering a prayer together, fervent"),
  ("narrator", "C'était la première fois que je voyais le fqih sans sa baguette de cognassier. | Il me parut beau."),
  ("fqih", "Je vous donne trois jours de repos.", "schoolmaster, kind for once, a small smile"),
  ("narrator", "Et comme la rentrée tombait un jeudi : | quatre jours !"),
 ]),

 # ------------------------------------------------------------------ ACT IV: le jour
 ("s24_idriss", {"card": "LE JOUR DE L'ACHOURA"}, [
  ("narrator", "À la maison, | ma mère avait mis sa belle mansouria à rayures de satin jaune."),
  ("narrator", "Puis mon père m'emmena à Moulay Idriss, | le patron de la ville. | Sur la place des notaires, | il acheta un plat de céramique bleue."),
 ]),
 ("s25_aicha", {"tag": "À RETENIR : le mari de Lalla Aïcha, c'est Moulay Larbi"}, [
  ("narrator", "À la fin du déjeuner, | Lalla Aïcha vint nous surprendre."),
  ("zoubida", "Lalla Aïcha, | installe-toi sur le grand divan, | à la place d'honneur !", "hostess insisting warmly, delighted"),
  ("aicha", "Dans la maison voisine, | toutes les femmes s'appellent Khadija ! | Il serait plus simple de dire : | Khadija la sourde, | Khadija la louchonne !", "gossiping guest telling a joke, delighted with herself, laughing at the end"),
  ("zoubida", "Et ton homme ? | Ses affaires ?", "friend asking over tea, curious"),
  ("aicha", "Il emploie trois ouvriers. | Les babouches se vendent bien. | Il m'a promis un caftan de drap abricot.", "proud, content, then trailing off"),
  ("narrator", "Puis, | subitement, | Lalla Aïcha se tut."),
  ("aicha", "Nous sommes de bien faibles créatures, | nous les femmes. | Gardons-nous de faire confiance aux hommes. | Ils sont... | Ils sont...", "woman whispering a secret worry to a friend, sad, unable to find the word"),
  ("narrator", "Ma mère m'envoya jouer sur la terrasse. | Je compris : | elles avaient des secrets."),
  ("narrator", "Seul sur la terrasse, | j'inventais les rythmes les plus barbares. | Et en bas, | les deux femmes papotaient, | papotaient, | papotaient."),
  ("narrator", "Le soir, | le soleil en robe d'or baignait la ville de rose fané. | La première étoile clignota. | Lalla Aïcha partit."),
 ]),
 ("s26_fin", {"tail": 2.5}, [
  ("narrator", "La lampe fut allumée. | Nous étions sans entrain. | Mon tambour et ma trompette gisaient sur un matelas."),
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
        scenes.append({"id": sid, "lines": L, **extra})
    doc = {"episode": 7, "title": "La nuit de l'Achoura", "chapter": 7, "gap": 0.3,
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
