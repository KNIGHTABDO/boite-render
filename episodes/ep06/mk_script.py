#!/usr/bin/env python3
"""Builds script.json (ep05 format) from the compact script below. ' | ' = <short pause>.
   python3 episodes/ep06/mk_script.py"""
import json, os, re

V = {
    "narrator": ("Gacrux", "Moroccan man in his 50s from Fès, speaks French with a light Fassi accent, warm, slow, nostalgic storyteller, close to the microphone"),
    "mohammed": ("Leda", "shy 6-year-old Moroccan boy from Fès, soft voice, speaks French with a light Moroccan accent"),
    "zoubida": ("Kore", "Moroccan mother from Fès, about 22, speaks French with a Fassi accent, fast, expressive, dramatic"),
    "father": ("Charon", "Moroccan man from Fès, about 45, calm, gentle, low voice, speaks French with a Fassi accent, few words"),
    "femmes": ("Aoede", "a group of Moroccan women answering together from the balconies of a courtyard house, warm, loud, in unison"),
    "zineb": ("Achernar", "little Moroccan girl of 5 from Fès, shrill, spoiled, speaks French with a Fassi accent"),
    "fqih": ("Schedar", "Moroccan Koranic schoolmaster from Fès, about 50, grave, nasal, a booming voice when angry, speaks French with a Fassi accent"),
    "fatma": ("Despina", "poor but generous Moroccan neighbour from Fès, about 35, warm, laughing, speaks French with a Fassi accent"),
    "rahma": ("Autonoe", "Moroccan woman from Fès, about 35, loud, a gifted comic storyteller, speaks French with a Fassi accent"),
    "kanza": ("Algenib", "old Moroccan fortune-teller from Fès, raspy, slow, mysterious, speaks French with a Fassi accent"),
    "kid1": ("Zephyr", "Moroccan schoolboy of 8 from Fès, loud, cheeky, speaks French with a Fassi accent"),
    "kid2": ("Pulcherrima", "Moroccan schoolboy of 9 from Fès, bossy, quarrelsome, speaks French with a Fassi accent"),
    "voisine": ("Erinome", "talkative Moroccan woman from Fès, about 50, married three times, gossipy, a little venomous, speaks French with a Fassi accent"),
    "marchand": ("Puck", "young handsome cloth merchant in the Kissaria of Fès, about 25, smooth, courteous, theatrical when bargaining, speaks French with a Fassi accent"),
    "khadija": ("Sulafat", "young Moroccan woman from Fès singing far away on a rooftop, warm, nostalgic, Andalusian-style vocalise, no words"),
}

S = [
 ("s01_hook", {"lead": 1.0}, [
  ("narrator", "Huit jours avant l'Achoura, | notre Msid devint un champ de bataille. | Et moi, | j'allais me jeter au milieu."),
 ]),
 ("s02_titre", {"lead": 0, "tail": 0, "hold": 9}, []),
 ("s03_preparatifs", {}, [
  ("narrator", "On montait au Msid par quatre marches. | C'était une longue pièce un peu rustique, | avec une vaste soupente."),
  ("narrator", "Là-haut, | le maître installa deux jarres en poterie vernissée, | pour l'huile d'olive que les élèves apportaient, | par bouteilles et par bols."),
  ("narrator", "Pour les nattes neuves, | chacun donna selon ses moyens. | Le père d'un élève, | qui était chaufournier, | offrit à l'école une charge d'âne de chaux."),
  ("narrator", "Le lundi, | huit jours avant la fête, | les vieilles nattes furent montées dans la soupente. | Le maître forma des équipes, | et nomma les chefs. | On emprunta des seaux, | et des balayettes de doum."),
 ]),
 ("s04_badigeon", {}, [
  ("narrator", "Le travail commença, | dans un vacarme d'injures, | de pleurs, | et d'éclats de rire. | Perchées sur de longs roseaux, | des têtes de loup chassaient les toiles d'araignées du plafond."),
  ("narrator", "Une dizaine d'élèves, | armés de balayettes, | badigeonnaient les murs au lait de chaux. | Ils éclaboussaient tout le monde. | La chaux vive leur entrait dans les yeux, | ils hurlaient, | d'autres prenaient leur place. | Tout le monde criait à la fois."),
  ("fqih", "Doucement ! | Doucement, bande de diables !", "schoolmaster roaring over a noisy crowd of children, exasperated, booming"),
  ("narrator", "Je réussis à m'emparer d'une balayette. | Je la plongeai dans le lait de chaux, | et, tout heureux, | je fonçai sur le mur, | pour montrer à ces larves comment on badigeonne sérieusement."),
  ("narrator", "Je me heurtai à un rempart de bras, | de bouches ouvertes, | d'yeux exorbités de fureur. | Des mains s'agrippèrent à ma balayette."),
  ("narrator", "Je résistai de toutes mes forces. | Mais la lutte était inégale. | Je lâchai le précieux instrument, | et je me retrouvai assis dans une flaque d'eau, | qui me gelait le derrière."),
  ("narrator", "Je ne pensai pas à pleurer. | Je me relevai, | décidé à reprendre mon bien, | et je me jetai dans la mêlée."),
  ("fqih", "Silence !", "schoolmaster's voice suddenly dominating a brawl, one thunderous word"),
  ("narrator", "Nous nous arrêtâmes, | frémissants de colère. | Les bras tendus, | les doigts écartés, | nous expliquions tous en même temps, | nous demandions tous justice."),
  ("kid1", "C'est lui ! | C'est lui qui a commencé !", "small boy pleading his case to the schoolmaster, outraged, talking over others"),
  ("kid2", "Non, maître, | la balayette est à moi !", "schoolboy pleading at the same time, indignant"),
  ("fqih", "Assez ! | Seuls les grands passeront les murs à la chaux. | Les petits, | allez attendre dans le coin. | J'aurai besoin de vous plus tard.", "schoolmaster imposing silence, then handing out a stern verdict, slow and final"),
  ("narrator", "Nous attendîmes dans un coin, | jusqu'au soir, | qu'il nous confie le moindre service. | Il n'en fut rien !"),
 ]),
 ("s05_frotteurs", {}, [
  ("narrator", "Le lendemain, | de nouvelles équipes furent formées. | Je devins un personnage important. | Je fus nommé chef des frotteurs !"),
  ("narrator", "Une vingtaine d'élèves, | chargés d'énormes seaux, | allaient chercher l'eau à la fontaine d'une zaouïa, | à cinquante pas de l'école. | Le sol fut inondé."),
  ("narrator", "Je maniais ma balayette avec énergie, | pour donner l'exemple. | J'en avais mal aux reins. | De temps en temps, | je me redressais, | tout rouge."),
  ("narrator", "Dans l'eau jusqu'aux chevilles, | pieds nus, | bousculé par celui-ci, | insulté par celui-là, | j'étais heureux ! | Adieu les leçons, | adieu les planchettes rigides et inhumaines !"),
  ("kid1", "Aïe ! | Tu m'as donné un coup de coude dans l'œil !", "schoolboy scrubbing a floor, hit in the eye by an elbow, whining"),
  ("kid2", "Fais attention ! | Tu m'as mouillé jusqu'à la ceinture !", "schoolboy soaked with water, angry"),
  ("kid1", "Regardez Driss ! | Il est tombé dans le seau !", "schoolboy pointing and laughing, delighted"),
  ("kid2", "Ha ! Ha ! | Il va se noyer ! | Il va se noyer !", "schoolboy laughing hard, teasing"),
  ("mohammed", "Frottez, | paresseux !", "small boy acting as team leader, bossy, proud, a bit ridiculous"),
  ("kid2", "Paresseux toi-même ! | Notre coin est plus propre que le tien !", "schoolboy answering back, cheeky"),
  ("narrator", "Avec des chiffons de jute, | nous essuyâmes partout."),
 ]),
 ("s06_soir", {}, [
  ("narrator", "Le soir, | je revins à la maison mort de fatigue, | mais très fier de ma journée."),
  ("mohammed", "Sans moi, | le Msid serait encore tout sale ! | C'est moi le chef des frotteurs ! | Moi !", "small boy boasting to his parents at dinner, arms wide, very proud"),
  ("narrator", "Je réussis à convaincre mes parents, | que sans moi, | aucun résultat sérieux n'aurait été obtenu."),
  ("father", "C'est bien, mon fils. | Tu vois, Lalla Zoubida, | il devient vraiment un homme.", "father smiling at his wife about their little boy, proud, gentle"),
  ("narrator", "Pendant mon sommeil, | je me mettais sur mon séant, | je hurlais des ordres, | je distribuais des injures. | Ma mère me recouchait, | avec des gestes tendres."),
  ("mohammed", "Frottez ! | Plus vite ! | Paresseux !", "small boy shouting orders in his sleep, half asleep, mumbling then loud"),
 ]),
 ("s07_matin", {}, [
  ("narrator", "Le matin, | je me préparais pour l'école, | quand ma mère m'arrêta."),
  ("zoubida", "Aujourd'hui, | tu ne vas pas au Msid. | Tu m'accompagnes à la Kissaria, | le marché des tissus. | Il est temps de penser à tes habits de fête.", "mother announcing good news to her son in the morning, brisk, a little proud"),
  ("narrator", "J'applaudis avec enthousiasme."),
  ("mohammed", "Est-ce que j'aurai une chemise neuve ?", "small boy, excited, asking his mother, hopeful"),
  ("zoubida", "Tu auras une chemise neuve.", "mother answering patiently, amused"),
  ("mohammed", "Est-ce que je porterai un gilet avec des soutaches ?", "small boy, more and more excited"),
  ("zoubida", "Tu porteras un gilet avec des soutaches.", "mother answering patiently, smiling"),
  ("mohammed", "Et ma djellaba blanche, | celle qui est rangée dans le coffre ?", "small boy, breathless with joy"),
  ("zoubida", "Ta djellaba blanche, | des babouches neuves que te fabrique Moulay Larbi, | et une belle sacoche brodée.", "mother finishing the list grandly, generous"),
  ("narrator", "Je me dressai de toute ma taille. | Je bombai le torse. | J'esquissai même quelques pas d'une danse barbare. | J'allais pousser un hululement, | quand ma mère me rappela à plus de dignité."),
  ("zoubida", "Un peu de dignité, | mon fils !", "mother scolding mildly, holding back a smile"),
 ]),
 ("s08_pardon", {}, [
  ("narrator", "Fatma Bziouya riait à gorge déployée. | Son rire ne me choquait pas. | Ce matin, | j'étais d'une générosité sans bornes."),
  ("narrator", "Je pardonnais à Zineb toutes les misères qu'elle m'avait faites. | Je pardonnais à son chat, | revenu sans son collier, | ma belle chaîne d'or. | Je pardonnais aux mardis d'être trop longs, | et à la baguette de cognassier de mordre mes oreilles."),
  ("narrator", "Je pardonnais tout au monde, | ou du moins, | à ce que je connaissais du monde."),
 ]),
 ("s09_cavalier", {}, [
  ("narrator", "Je montai sur la terrasse, | où personne ne pouvait me voir. | Je courais, | je chantais, | je battais les murs avec une baguette trouvée là."),
  ("narrator", "La baguette devint un sabre. | Je pourfendais des ennemis invisibles. | Je coupais la tête aux pachas, | aux prévôts des marchands, | et à leurs sbires !"),
  ("narrator", "Puis la baguette devint cheval. | J'étais le cavalier courageux, | vêtu d'une djellaba immaculée, | et d'un gilet à soutaches. | Ma sacoche brodée me tirait l'épaule, | tant mes cartouches pesaient lourd."),
 ]),
 ("s10_appels", {}, [
  ("zoubida", "Est-ce que mon chérif a assez joué ? | Descends vite, | mon chérif !", "mother calling sweetly up the stairs to her son on the roof, honeyed"),
  ("zoubida", "Qu'attends-tu pour descendre, | tête de mule ? | Tu ne m'entends pas, | âne à face de goudron ?", "same mother calling again, losing patience, sharper"),
  ("zoubida", "Chien galeux ! | Attends que je monte te chercher, | juif sans dignité !", "same mother screaming up the stairs, furious, insulting"),
  ("narrator", "Dans la fièvre de la cavalcade, | je n'avais rien entendu. | Seuls les mots juif et chien galeux | me jetèrent brutalement dans le monde réel. | Je lâchai ma baguette, | et je dégringolai l'escalier."),
  ("narrator", "Je rejoignis ma mère, | l'oreille basse, | le coude levé en bouclier. | Elle se contenta de me prendre par les épaules, | et de me secouer."),
  ("narrator", "Elle était prête. | Drapée dans son haïk blanc, | des babouches noires aux pieds, | elle se voila le visage de cotonnade blanche, | et nous partîmes."),
 ]),
 ("s11_kanza", {}, [
  ("rahma", "Zoubida ! | Renseigne-toi sur le prix de la mousseline persil, | et du satin bouquet du sultan !", "neighbour calling from a doorway, curious, insistent"),
  ("narrator", "Nous arrivions presque au tournant de la ruelle, | quand Lalla Kanza, | la chouafa, | nous rappela."),
  ("kanza", "Lalla Zoubida ! | Il me faut des coudées de satinette noire, | pour calmer le roi Bel Lahmer. | Et Lalla Mira me ronge, | il me faudrait une robe jaune flamme...", "old fortune-teller calling down an alley, raspy, mysterious, listing her needs for the spirits"),
  ("zoubida", "Donne l'argent à mon fils.", "mother calling back from far, curt, not wanting to walk back"),
  ("narrator", "Ma mère me poussa vers la maison. | La chouafa me donna l'argent. | Finalement, | elle ne voulait plus que la satinette noire."),
 ]),
 ("s12_voisine", {}, [
  ("narrator", "Près de Sidi Ahmed Tijani, | cette mosquée aux portes richement décorées, | une femme se précipita sur ma mère. | Elle colla son voile rêche sur ma joue, | pour m'embrasser."),
  ("narrator", "C'était une voisine de Lalla Aïcha. | Les deux femmes s'appuyèrent au mur de la mosquée, | et parlèrent longtemps de l'affaire Moulay Larbi, | si heureusement terminée."),
  ("voisine", "Mais qui peut se fier aux hommes ? | J'ai été mariée trois fois. | Chaque fois, | mon mari ne pensait qu'à me dépouiller. | Espérons que Lalla Aïcha | n'est pas tombée sur un ingrat.", "gossiping neighbour leaning on a mosque wall, sighing, then venomous on the last sentence"),
  ("zoubida", "Dieu seul est juge.", "mother answering sententiously, dignified, closing the topic"),
 ]),
 ("s13_souk", {}, [
  ("narrator", "Les quartiers commerçants avaient un air de fête. | Une foule de citadins et de campagnards | se pressait dans la rue des épiciers. | Des âniers poussaient des bêtes chétives, | chargées de sucre, | de bougies, | et de ballots de cotonnade."),
  ("narrator", "Pour circuler plus facilement, | j'avais enlevé mes babouches, | et je les avais mises dans mon capuchon. | Je les sentais battre légèrement mon dos."),
  ("zoubida", "Fais attention à tes babouches ! | On va te les voler !", "mother in a crowded souk, worried, raising her voice over the noise"),
  ("narrator", "La Kissaria, | rendez-vous de toutes les élégantes de la ville, | me parut contenir les trésors fabuleux de Soleiman, | fils de David."),
  ("narrator", "Des caftans amarante, | des gilets ornés de passementerie, | des burnous somptueux, | des tulles irisés comme des toiles d'araignée sous la rosée, | des satins moirés, | des cretonnes aux couleurs sauvages."),
  ("narrator", "Les marchands ne ressemblaient pas à ceux des autres souks. | C'étaient des jeunes gens beaux, | soignés, | courtois, | d'une patience sans limite."),
 ]),
 ("s14_poisson", {}, [
  ("narrator", "Après cinq ou six boutiques, | nous achetâmes trois coudées de cotonnade blanche, | pour ma chemise. | La qualité Poisson. | Ma mère ne voulait pas d'autre marque."),
  ("narrator", "Le marchand nous montra, | imprimé en bleu sur la pièce, | un poisson avec toutes ses écailles."),
 ]),
 ("s15_gilet", {}, [
  ("narrator", "Pour le gilet, | ce fut une autre affaire. | Toutes les nuances du rouge défilèrent sous nos yeux. | Enfin, | ma mère choisit un gilet cerise, | orné de serpentins et de fleurons."),
  ("narrator", "Elle m'enleva la djellaba, | me boutonna le gilet jusqu'au cou, | recula pour juger de l'effet, | me fit tourner à droite, | puis à gauche, | puis le roula en boule, | et le fourra dans les mains du marchand."),
  ("marchand", "Cet article te plaît-il ?", "young cloth merchant, polite, smiling, inviting"),
  ("zoubida", "C'est le prix qui en décidera.", "mother bargaining, cool, poker-faced"),
  ("marchand", "Aux clients sérieux, | je fais toujours un rabais. | Je le vends cinq réaux, | je te le laisse à quatre.", "merchant starting a bargaining ritual, generous tone"),
  ("zoubida", "Coupons court. | Je t'en offre deux réaux.", "mother bargaining, flat and firm"),
  ("marchand", "Deux réaux ? | Je te le jure, | ce n'est même pas le prix de revient ! | Devrais-je mendier ce soir pour nourrir mes enfants ?", "merchant swearing theatrically, offended, dramatic"),
  ("zoubida", "Écoute, | je suis mère de famille, | je n'ai pas le temps de marchander. | Deux réaux et un quart. | C'est pour mon fils, | pour le jour de l'Achoura.", "mother pleading cleverly, playing the tired mother"),
  ("marchand", "Ce garçon me plaît. | Pour lui, | trois réaux et demi.", "merchant pretending to soften, holding out his hand"),
  ("narrator", "Ma mère lui tourna le dos, | me prit par le poignet, | et m'entraîna."),
  ("zoubida", "Viens ! | Les gilets ne manquent pas à la Kissaria !", "mother walking away loudly so the merchant hears, proud"),
  ("marchand", "Reviens, Lalla ! | Reviens donc ! | Admire ces coutures, | ces boutons ! | Paie-moi ce que tu veux. | Tu me parais être une chérifa pleine de baraka. | Ne m'oublie pas dans tes prières !", "merchant calling after a leaving customer, urgent, then flattering, honeyed"),
  ("narrator", "Ma mère perdait la tête quand on la traitait de chérifa. | Elle sortit un chiffon noué plusieurs fois, | et s'acharna à le dénouer."),
  ("narrator", "Elle tendit deux réaux et demi au marchand, | sans rien dire, | saisit le paquet, | et m'entraîna."),
 ]),
 ("s16_satinette", {}, [
  ("narrator", "Nous étions près de la médersa Attarine, | quand je rappelai à ma mère | la satinette de Lalla Kanza."),
  ("zoubida", "Que Dieu maudisse toutes les chouafas de la terre ! | Où ai-je mis l'argent de cette sorcière ? | Elle ne peut pas faire ses courses elle-même ?", "mother cursing while searching her pockets in the street, flustered, muttering then loud"),
  ("narrator", "Elle fouilla, | s'énerva, | s'agita, | et finit par retrouver l'argent, | au fond d'une poche de son caftan. | Elle paya la satinette sans discuter."),
  ("narrator", "Sa bonne humeur avait disparu. | Elle me gronda sans raison jusqu'à la maison, | remit la satinette à la chouafa, | et monta l'escalier, | en gémissant à chaque marche."),
 ]),
 ("s17_rahma", {}, [
  ("narrator", "Rahma sortit sur le palier, | et nous invita dans sa chambre, | pour voir nos achats. | Une chambre pauvre, | des matelas bosselés, | et pour seul luxe, | une étagère peinturlurée, | chargée de bols à fleurs."),
  ("narrator", "Zineb jouait dans un coin avec son chat. | Elle lui présentait une minuscule glace ronde. | Le chat allongea la patte. | Ses griffes grattèrent le verre. | Il regarda derrière le miroir. | Le mystère restait entier."),
  ("narrator", "Il se fâcha, | cracha des grossièretés dans son langage, | et partit comme une flèche. | Zineb riait aux éclats."),
  ("rahma", "Qu'il est beau, ce gilet ! | Un vrai gilet de prince !", "neighbour admiring a child's new red waistcoat, warm, flattering"),
  ("narrator", "Il faisait sombre dans cette chambre. | Le rouge du gilet prenait des tons de velours cramoisi. | Ce vêtement était le mien ! | Le jour de l'Achoura, | j'allais éblouir tout le monde. | Je serais un prince de légende."),
  ("narrator", "Ma mère chuchotait, | penchée sur notre voisine. | Zineb me fit une horrible grimace. | Je lui en fis une, | encore plus épouvantable."),
  ("zineb", "Maman ! | Maman ! | Sidi Mohammed me fait des grimaces !", "little girl screaming to alert the whole neighbourhood, whiny, fake tears"),
  ("mohammed", "C'est elle qui a commencé ! | C'est elle !", "small boy defending himself, desperate, nobody believes him"),
  ("narrator", "Personne ne me croyait. | J'éclatai en sanglots. | Ma mère me saisit par le bras, | et m'entraîna jusqu'à notre chambre."),
  ("zoubida", "Quelle vie d'enfer je mène à cause de toi ! | Quel destin cruel !", "mother dragging her crying son away, lamenting loudly to the whole house"),
 ]),
 ("s18_prince", {}, [
  ("narrator", "Elle m'abandonna dans un coin, | et s'enferma dans sa cuisine. | J'eus faim, | à force de pleurer en silence."),
  ("narrator", "Je me mis sur le dos, | et je composai un menu fastueux, | pour le jour où je serais prince. | Je n'inviterais pas les princes. | Ils mangent très bien chez eux."),
  ("narrator", "Mes hôtes seraient les affamés, | les mendiants, | les psalmistes. | Je leur donnerais des gilets rouges, | des djellabas blanches comme le lait, | des babouches safran. | Moi, | je serais en blanc, | avec le bonnet rouge des gens de cour."),
 ]),
 ("s19_navets", {}, [
  ("zoubida", "Voudrais-tu te mettre sur ton séant | pour manger ?", "mother, still cold but softer, putting food down"),
  ("narrator", "Ma mère avait disposé la table ronde, | basse sur pattes. | De la viande aux navets ! | Je n'aimais pas les navets. | Mais je n'eus pas le courage d'une nouvelle crise. | La faim transforma le navet en saveur exquise."),
 ]),
 ("s20_chant", {}, [
  ("narrator", "Quelqu'un sur la terrasse se mit à chanter. | Ma mère s'arrêta de mâcher, | et tendit l'oreille."),
  ("khadija", "Âh, yâ lalli... | âh, yâ lalli, yâ lalli...", "a woman singing an old Andalusian melody far away on a rooftop, slow, nostalgic, carried by the wind"),
  ("zoubida", "Fatma Bziouya ! | Sais-tu qui chante ainsi ?", "mother leaning out of a window, calling across the courtyard, curious"),
  ("fatma", "C'est Lalla Khadija, | la femme de l'oncle Othman !", "neighbour answering from her own window across the courtyard, amused"),
  ("zoubida", "Tant de gaîté, | alors qu'elle a épousé un vieillard qui pourrait être son père ?", "mother gossiping across a courtyard, surprised, a little disapproving"),
  ("fatma", "Elle n'est pas malheureuse ! | L'oncle Othman fait ses quatre volontés. | Il la traite comme sa fille.", "neighbour laughing, knowing"),
  ("zoubida", "Et elle ? | Comment le traite-t-elle ?", "mother asking mischievously"),
  ("narrator", "Toutes les voisines partirent d'un grand rire."),
  ("rahma", "Moi, | je sais comment elle le traite ! | La vieille M'Barka m'a raconté une histoire... | mais elle est trop longue.", "neighbour teasing her audience, playing hard to get"),
  ("femmes", "Raconte-la ! | Raconte-la !", "women on several balconies begging together, laughing, eager"),
 ]),
 ("s21_recit", {}, [
  ("narrator", "Toutes les femmes avaient abandonné leur besogne. | Elles s'accoudaient aux balustrades de leurs balcons. | Lalla Kanza étala un vieux tapis de prière dans le patio, | pour écouter."),
  ("rahma", "Vous connaissez l'oncle Othman. | Ses parents lui ont laissé une grosse fortune. | Il a tout mangé, | capital et bénéfices. | Il ne lui reste que la petite maison collée à la nôtre.", "gifted storyteller starting a comic tale to neighbours, relishing every word"),
  ("rahma", "Il s'est marié plusieurs fois. | Mais seule Lalla Khadija a réussi à le dominer. | Elle le fait manger dans le creux de sa main, | comme un agneau.", "storyteller, mock-serious, lowering her voice"),
 ]),
 ("s22_othman", {}, [
  ("rahma", "Vendredi dernier, | Si Othman sort de bonne heure faire son marché. | Il balance gaiement son cabas, | il salue tout le monde, | la main sur le cœur.", "comic storyteller, lively, imitating a cheerful old man"),
  ("rahma", "À Joutyia, | un seul boucher est ouvert : | Salem. | Il brandit tantôt une hache, | tantôt un coutelas énorme. | Et il y a foule, | je vous dis !", "comic storyteller, building up the scene, dramatic"),
  ("rahma", "Si Othman agite les deux bras, | et crie quelque chose qui peut vouloir dire : | avale ton coutelas, | ou bien : | donne-moi un gigot ! | Salem, furieux, | le menace de sa hache.", "comic storyteller, imitating an old man shouting in a crowd, then the furious butcher"),
  ("narrator", "Tout le monde riait aux larmes. | Rahma savait si bien raconter."),
  ("rahma", "Un chien vient flairer ses talons. | Si Othman lui envoie un grand coup de pied. | Sa babouche saute ! | Le chien l'attrape entre ses crocs, | et se sauve ! | Et Si Othman le suit, | clopin-clopant !", "comic storyteller, acting out a chase, laughing herself"),
  ("rahma", "Il retrouve sa babouche près du pont de Bin Lemdoun. | Il revient à la boucherie : | plus personne. | Salem somnole, | la chéchia sur l'oreille. | Il ne reste que du mou pour les chats !", "storyteller, comic deflation, slower"),
  ("rahma", "Dans un fondouk, | des aloses passent au-dessus des têtes. | Si Othman attend un miracle. | Mais son nez le démange. | Il court chez le marchand de tabac. | À son retour : | plus de poissons !", "storyteller, comic rhythm, punchline"),
  ("narrator", "Les femmes hurlaient de joie. | Moi, | je trépignais d'enthousiasme."),
  ("zoubida", "Continue ! | Continue !", "mother laughing, begging for the rest of a story"),
  ("rahma", "Alors, | chez le marchand de menthe de la rue Sagha, | il voit une rose magnifique. | Il se dit : | si je l'offre à Lalla Khadija, | elle me pardonnera.", "storyteller, tender mock-romantic tone"),
  ("rahma", "J'étais dans la rue quand il est rentré, | tout fier de sa rose. | La porte se referme... | et se rouvre aussitôt ! | La rose s'écrase sous ses pieds. | Puis son turban vole la rejoindre ! | Puis Si Othman lui-même, | pâle et défait !", "storyteller delivering the climax, fast, then a big comic pause"),
  ("rahma", "Il ramasse son turban, | il respire longuement sa rose... | et en me voyant, | il me fait un grand sourire !", "storyteller, final punchline, deadpan then bursting into laughter"),
 ]),
 ("s23_fin", {"tail": 2}, [
  ("narrator", "Nous riions à nous tordre. | Tout le monde félicita Rahma. | Ses histoires avaient du sel."),
  ("narrator", "Le récit de Rahma m'obséda toute la soirée. | Et la nuit, | j'en rêvai encore."),
 ]),
 ("s24_fin", {"lead": 0, "tail": 0, "hold": 17}, []),
]


def main():
    scenes = []
    for sid, extra, lines in S:
        L = []
        for t in lines:
            who, txt = t[0], t[1]
            d = {"who": who, "text": txt.replace(" | ", " <short pause> ")}
            if len(t) > 2:
                d["style"] = t[2]
            d["sub"] = re.sub(r"\s+", " ", txt.replace(" | ", " "))
            L.append(d)
        scenes.append({"id": sid, "lines": L, **extra})
    doc = {"episode": 6, "title": "Le gilet cerise", "chapter": 6,
           "voices": {k: {"voice": v, "style": s} for k, (v, s) in V.items()}, "scenes": scenes}
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json")
    json.dump(doc, open(out, "w"), ensure_ascii=False, indent=1)
    n = sum(len(l["sub"].split()) for s in scenes for l in s["lines"])
    print(f"{out}: {len(scenes)} scenes, {sum(len(s['lines']) for s in scenes)} lines, {n} words (~{n / 2.6 / 60:.1f} min)")
    missing = {l["who"] for s in scenes for l in s["lines"]} - set(V)
    if missing:
        print("MISSING VOICES", missing)


if __name__ == "__main__":
    main()
