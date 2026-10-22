#!/usr/bin/env python3
"""Builds beats.json from script.json + the per-line annotations below (one beat per script line, same order).
   python3 episodes/ep06/mk_beats.py && python3 tools/lint_beats.py episodes/ep06/beats.json --cast episodes/ep06/cast.json"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
KIDS = ["kid1", "kid2", "kid3", "kid4"]


def T(size, room, cast, props, visual, **kw):   # 3D beat
    return dict(mode="3d", size=size, room=room, cast=cast, props=props, visual=visual, **kw)


def P(reason, props, visual, **kw):             # painting beat
    return dict(mode="painting", reason=reason, props=props, visual=visual, **kw)


A = {
 "s01_hook": [
  T("M", "msid", ["mohammed", "kid1", "kid2", "kid3"], ["balayette", "seau"], "Mohammed (6) runs at the whitewashed wall with a dripping doum broom; three boys' hands grab the broom.", action="run", peak=False),
 ],
 "s03_preparatifs": [
  T("W", "msid", ["fqih", "mohammed", "kid1", "kid2"], ["marches", "soupente"], "Wide of the long rustic Msid: four steps up from the door, the vast soupente (loft) above; kids enter up the steps.", action="walk"),
  T("M", "msid_haut", ["fqih", "grand1"], ["jarre", "soupente", "bouteille", "bol"], "In the loft, the fqih sets two glazed pottery jars; a big pupil pours oil from a bottle; a bowl beside."),
  P("macro", ["ane", "chaux", "natte"], "A donkey loaded with sacks of lime at the Msid door; the lime-burner father beside it (one donkey)."),
  T("M", "msid", ["fqih", "grand1", "grand2", "mohammed", "kid1"], ["natte", "seau", "balayette", "soupente"], "Big pupils carry rolled old mats up into the loft; the fqih points, naming team leaders; buckets and doum brooms on the floor.", action="carry"),
 ],
 "s04_badigeon": [
  P("crowd", ["roseau", "tete de loup"], "Chaos: about ten boys, round brushes (têtes de loup) on long reeds sweep cobwebs off the ceiling; shouting, laughing, one crying."),
  P("crowd", ["balayette", "seau", "chaux"], "About ten boys whitewashing the walls with doum brooms from two huge buckets of lime-wash; splashes; a boy screams with lime in his eyes."),
  T("M", "msid", ["fqih"], [], "The fqih roars from his estrade, rod raised.", cam="estrade"),
  T("M", "msid", ["mohammed"], ["balayette", "seau", "chaux"], "Mohammed grabs a broom, dips it in the lime bucket, beaming, and runs at the wall.", action="run"),
  T("CU", "msid", ["mohammed", "kid1", "kid2", "kid3"], ["balayette"], "Close: a wall of arms, open mouths, furious eyes; hands grip his broom.", peak=True, action="grab"),
  T("M", "msid", ["mohammed", "kid1", "kid2"], ["balayette", "flaque"], "Tug of war; he lets go and falls sitting in a puddle of water.", action="fall"),
  T("W", "msid", ["mohammed", "kid1", "kid2", "kid3"], ["balayette"], "He gets up, no tears, and throws himself back into the scrum.", action="run"),
  T("CU", "msid", ["fqih"], [], "The fqih: one thunderous word.", cam="estrade", peak=True),
  T("W", "msid", ["mohammed", "kid1", "kid2", "kid3", "fqih"], [], "Everyone frozen, trembling with anger; then all explain at once, arms out, fingers spread.", action="gesture"),
  T("M", "msid", ["kid1", "mohammed"], [], "A boy points at Mohammed, pleading to the fqih.", action="point"),
  T("M", "msid", ["kid2"], ["balayette"], "Another boy clutches the broom to his chest, pleading."),
  T("M", "msid", ["fqih"], ["baguette", "chaux"], "The fqih imposes silence and gives the verdict, rod pointing to the corner.", cam="estrade"),
  T("W", "msid", ["mohammed", "kid1", "kid2", "kid3", "grand1", "grand2"], [], "The small ones sulk in a corner while the big ones whitewash; the light turns to evening.", light="evening"),
 ],
 "s05_frotteurs": [
  T("M", "msid", ["mohammed", "fqih"], ["balayette"], "Next morning: the fqih hands Mohammed a broom; he puffs up his chest — chief of the scrubbers.", light="morning"),
  P("crowd", ["seau", "fontaine"], "About twenty boys with huge buckets at the fountain of a zaouïa, fifty steps from the school; the Msid floor flooded.", room="zaouia"),
  T("M", "msid", ["mohammed"], ["balayette"], "Mohammed scrubs the wet earth floor with energy, then straightens up, red-faced, hand on his back.", action="scrub"),
  T("CU", "msid", ["mohammed"], ["balayette"], "Close: barefoot, ankle-deep in water, jostled, beaming with happiness.", action="scrub"),
  T("M", "msid", ["kid1", "kid2"], ["balayette"], "A boy holds his eye after an elbow.", action="scrub"),
  T("M", "msid", ["kid2", "kid3"], ["seau"], "A boy soaked to the waist shouts at another.", cam="b"),
  T("W", "msid", ["kid1", "driss", "kid2", "kid3"], ["seau"], "Driss has fallen into a bucket, legs kicking; a boy points and laughs.", action="fall"),
  T("M", "msid", ["kid2", "kid3", "driss"], ["seau"], "The boys laugh, pointing at Driss in the bucket.", cam="b"),
  T("M", "msid", ["mohammed"], ["balayette"], "Mohammed, chief, orders the others, broom like a sceptre."),
  T("M", "msid", ["kid2", "mohammed"], ["balayette"], "A boy answers back, pointing at his own clean corner.", cam="b"),
  T("W", "msid", ["mohammed", "kid1", "kid2", "driss"], ["chiffon"], "The boys wipe everything with jute rags.", action="wipe"),
 ],
 "s06_soir": [
  T("W", "chambre_nuit", ["mohammed", "zoubida", "father"], ["lampe"], "Evening, lamp-lit room: Mohammed comes in, dead tired but proud.", action="walk", light="night", fade=True),
  T("M", "chambre_nuit", ["mohammed"], [], "Mohammed boasting, arms wide.", action="gesture"),
  T("M", "chambre_nuit", ["father", "zoubida"], [], "Father and mother listen, amused.", cam="reverse"),
  T("CU", "chambre_nuit", ["father"], [], "The father congratulates him, turning to Zoubida.", cam="reverse"),
  T("M", "chambre_nuit", ["mohammed", "zoubida"], ["matelas", "couverture"], "Night: Mohammed sits up in his sleep shouting orders; Zoubida lays him back down tenderly.", action="sit_up"),
  T("CU", "chambre_nuit", ["mohammed"], ["couverture"], "Close: Mohammed shouting in his sleep, eyes closed."),
 ],
 "s07_matin": [
  T("W", "chambre_jour", ["mohammed", "zoubida"], ["planchette"], "Morning: Mohammed ready with his slate; Zoubida stops him at the door.", light="morning"),
  T("M", "chambre_jour", ["zoubida"], [], "Zoubida announces the Kissaria trip.", cam="reverse"),
  T("M", "chambre_jour", ["mohammed"], [], "Mohammed claps with enthusiasm.", action="clap"),
  T("CU", "chambre_jour", ["mohammed"], [], "Mohammed asks, hopeful."),
  T("M", "chambre_jour", ["zoubida"], [], "Zoubida answers, amused.", cam="reverse"),
  T("CU", "chambre_jour", ["mohammed"], ["gilet"], "Mohammed, more excited."),
  T("M", "chambre_jour", ["zoubida"], ["gilet"], "Zoubida answers, smiling.", cam="reverse"),
  T("CU", "chambre_jour", ["mohammed"], ["djellaba", "coffre"], "Mohammed glances at the chest where his white djellaba is kept."),
  T("M", "chambre_jour", ["zoubida", "mohammed"], ["babouche", "sacoche", "djellaba"], "Zoubida lists the babouches from Moulay Larbi and an embroidered satchel."),
  T("W", "chambre_jour", ["mohammed", "zoubida"], [], "Mohammed stands tall, chest out, and does a little wild dance; Zoubida raises a hand.", action="dance"),
  T("CU", "chambre_jour", ["zoubida"], [], "Zoubida: 'un peu de dignité', holding back a smile.", cam="reverse"),
 ],
 "s08_pardon": [
  T("M", "fenetre_fatma", ["fatma"], [], "Fatma Bziouya laughs heartily at her window."),
  P("dream", ["chat", "or", "baguette"], "Imagination: floating vignettes he forgives — Zineb's face, her grey cat (no collar), a gold chain, a quince rod — in soft light."),
  T("CU", "patio", ["mohammed"], [], "Mohammed beaming, magnanimous."),
 ],
 "s09_cavalier": [
  T("W", "terrasse", ["mohammed"], ["baguette"], "Alone on the terrace, Mohammed runs, sings, beats the low walls with a stick.", action="run"),
  T("M", "terrasse", ["mohammed"], ["baguette"], "The stick is a sabre: he slashes invisible enemies.", action="slash"),
  P("dream", ["djellaba", "gilet", "sacoche", "baguette"], "Dream: Mohammed as a brave horseman in a spotless white djellaba and red braided gilet, embroidered satchel heavy with cartridges, riding a stick that becomes a horse."),
 ],
 "s10_appels": [
  T("M", "escalier", ["zoubida"], [], "Zoubida at the foot of the stairs, calling sweetly upward."),
  T("CU", "escalier", ["zoubida"], [], "Zoubida again, sharper.", figurative=["tete", "mule", "ane"]),
  T("CU", "escalier", ["zoubida"], [], "Zoubida screaming insults up the stairs.", peak=True, figurative=["chien"], cam="b"),
  T("M", "terrasse", ["mohammed"], ["baguette", "escalier"], "On the terrace he freezes, drops the stick and tumbles down the stairs.", action="run", cam="b", figurative=["chien"]),
  T("M", "escalier", ["mohammed", "zoubida"], [], "He reaches her, ear low, elbow up as a shield; she takes him by the shoulders and shakes him.", action="shake"),
  T("W", "patio", ["zoubida", "mohammed"], ["haik", "babouche", "voile", "cotonnade"], "Zoubida draped in her white haïk, black babouches, veils her face with white cotton; they leave.", action="walk"),
 ],
 "s11_kanza": [
  T("M", "patio", ["rahma", "zoubida"], [], "Rahma at her door calls after Zoubida about the cloth prices."),
  T("W", "impasse", ["zoubida", "mohammed", "kanza"], [], "In the alley, near the corner; far back at the house door, the chouafa calls.", action="walk"),
  T("M", "impasse", ["kanza"], ["satinette"], "The chouafa (Lalla Kanza) at the house door, listing her needs for the spirits.", cam="reverse"),
  T("M", "impasse", ["zoubida", "mohammed"], [], "Zoubida answers from afar and pushes the boy back toward the house."),
  T("M", "impasse", ["kanza", "mohammed"], ["argent", "satinette"], "The chouafa gives the money to Mohammed.", action="give", cam="reverse"),
 ],
 "s12_voisine": [
  T("M", "rue_mosquee", ["voisine", "zoubida", "mohammed"], ["porte", "voile"], "By the richly decorated doors of the Sidi Ahmed Tijani mosque, a veiled woman rushes at Zoubida and presses her rough veil on Mohammed's cheek.", action="hug"),
  T("W", "rue_mosquee", ["voisine", "zoubida", "mohammed"], [], "The two women lean on the mosque wall, talking; Mohammed waits."),
  T("M", "rue_mosquee", ["voisine"], [], "The neighbour, venomous on the last words.", cam="reverse"),
  T("CU", "rue_mosquee", ["zoubida"], [], "Zoubida, sententious."),
 ],
 "s13_souk": [
  P("crowd", ["ane", "bougie", "sucre", "cotonnade"], "A festive crowd of townspeople and country folk in the grocers' street; scrawny donkeys loaded with sugar, candles and bales of cotton."),
  T("M", "rue_foule", ["mohammed", "zoubida"], ["babouche", "capuchon"], "Mohammed barefoot, his babouches in his hood bouncing on his back, walking behind his mother.", action="walk"),
  T("M", "rue_foule", ["zoubida"], ["babouche"], "Zoubida turns back, warning him.", cam="reverse"),
  P("dream", ["caftan", "gilet"], "The Kissaria as Solomon's treasure: silks and kaftans glowing like a treasure cave, seen through the boy's eyes."),
  T("W", "kissaria", ["zoubida", "mohammed", "marchand"], ["caftan", "gilet", "burnous", "tulle"], "Kissaria alley: amaranth kaftans, braided gilets, burnouses, iridescent tulle hung on the awnings.", action="walk"),
  T("M", "kissaria", ["marchand"], [], "A young, handsome, well-groomed merchant, patient and courteous.", cam="reverse"),
 ],
 "s14_poisson": [
  T("M", "kissaria", ["zoubida", "mohammed", "marchand"], ["cotonnade"], "Zoubida buys three cubits of white cotton."),
  dict(mode="insert", size="insert", room="kissaria", props=["cotonnade", "poisson"], visual="3D insert (cloth prop, top-down): a blue fish with all its scales printed on white cotton."),
 ],
 "s15_gilet": [
  T("M", "kissaria_rev", ["zoubida", "mohammed"], ["gilet"], "A pile of red gilets; Zoubida picks a cherry gilet with braid scrolls and fleurons.", cam="rev"),
  T("M", "kissaria", ["zoubida", "mohammed"], ["djellaba", "gilet"], "She takes off his djellaba, buttons the gilet to his neck, steps back, makes him turn right then left, balls it up into the merchant's hands.", action="turn"),
  T("CU", "kissaria", ["marchand"], ["gilet"], "The merchant, smiling.", cam="reverse"),
  T("CU", "kissaria_rev", ["zoubida"], [], "Zoubida, poker-faced.", cam="rev"),
  T("M", "kissaria", ["marchand"], ["gilet"], "The merchant folds the gilet, offering a 'discount'.", cam="reverse"),
  T("M", "kissaria_rev", ["zoubida", "mohammed"], [], "Zoubida, flat and firm.", cam="rev"),
  T("CU", "kissaria", ["marchand"], [], "The merchant swears, hand on heart, theatrical.", cam="reverse"),
  T("M", "kissaria_rev", ["zoubida", "mohammed"], [], "Zoubida pleads, hand on the boy's shoulder.", cam="rev"),
  T("M", "kissaria", ["marchand", "mohammed"], [], "The merchant smiles at the boy and holds out his hand.", cam="reverse"),
  T("W", "kissaria", ["zoubida", "mohammed", "marchand"], [], "Zoubida turns her back, takes Mohammed by the wrist and drags him a few steps.", action="walk"),
  T("M", "kissaria_rev", ["zoubida", "mohammed"], ["gilet"], "Zoubida walking away, loud.", cam="rev"),
  T("M", "kissaria", ["marchand"], ["gilet"], "The merchant calls after them, holding up the gilet's seams and buttons.", cam="reverse"),
  T("CU", "kissaria", ["zoubida"], ["chiffon"], "Flattered, Zoubida pulls out a rag knotted many times and fights to untie it.", action="untie"),
  T("M", "kissaria", ["zoubida", "marchand", "mohammed"], ["argent"], "She hands over two and a half réaux without a word, grabs the parcel and drags the boy off.", action="give", cam="reverse"),
 ],
 "s16_satinette": [
  T("M", "rue_epices", ["mohammed", "zoubida"], ["satinette"], "Near the Attarine medersa, Mohammed tugs at her haïk, remembering."),
  T("M", "rue_epices", ["zoubida"], ["poche"], "At a shop corner she searches her pockets, cursing.", action="search", cam="b"),
  T("CU", "rue_epices", ["zoubida"], ["argent", "satinette"], "She finds the money deep in her kaftan pocket.", action="search"),
  T("M", "escalier", ["zoubida", "kanza"], ["satinette", "escalier"], "Home: she hands the black satinette to the chouafa, then climbs the stairs groaning at each step.", action="climb"),
 ],
 "s17_rahma": [
  T("W", "rahma_chambre", ["rahma", "zoubida", "mohammed", "zineb"], ["matelas", "etagere", "bol"], "Rahma's poor dark room: lumpy mattresses, a painted shelf with flowered bowls.", action="walk"),
  T("M", "rahma_chambre", ["zineb"], ["chat", "miroir", "glace", "verre"], "In a corner Zineb holds a tiny round mirror up to her grey cat; the cat paws the glass, claws scratching, then peers behind the mirror.", cam="coin"),
  T("CU", "rahma_chambre", ["zineb"], ["chat"], "The grey cat spits, tail bristling, and bolts out of frame like an arrow; Zineb bursts out laughing.", cam="coin", action="run"),
  T("M", "rahma_chambre", ["rahma", "mohammed"], ["gilet"], "Rahma admires the gilet held against Mohammed."),
  T("CU", "rahma_chambre", ["mohammed"], ["gilet"], "Close: the red gilet turns deep crimson velvet in the dark; Mohammed glows with pride (imagination glow)."),
  T("M", "rahma_chambre", ["zoubida", "rahma", "zineb", "mohammed"], [], "The mothers whisper; Zineb makes a horrible face at Mohammed; he makes a worse one.", cam="coin"),
  T("CU", "rahma_chambre", ["zineb"], [], "Zineb screams for her mother.", peak=True, cam="coin"),
  T("CU", "rahma_chambre", ["mohammed"], [], "Mohammed, desperate.", peak=True),
  T("M", "rahma_chambre", ["zoubida", "mohammed"], [], "He bursts into sobs; Zoubida grabs his arm and drags him out.", action="drag"),
  T("M", "galerie", ["zoubida", "mohammed"], [], "On the gallery Zoubida laments loudly, dragging him to their room.", action="walk"),
 ],
 "s18_prince": [
  T("M", "chambre_jour", ["mohammed"], [], "Alone in a corner, sniffling; the kitchen curtain closes."),
  T("W", "chambre_jour", ["mohammed"], ["matelas"], "He lies on his back on the mattress, staring at the ceiling, dreaming.", action="lie"),
  P("dream", ["gilet", "djellaba", "babouche", "bonnet"], "Dream: Prince Mohammed in white with a red conical cap serves a feast to beggars and psalmists, handing out red gilets, milk-white djellabas, saffron babouches."),
 ],
 "s19_navets": [
  T("M", "chambre_jour", ["zoubida", "mohammed"], ["table"], "Zoubida sets down the low round table; he sits up.", action="sit_up"),
  T("CU", "table", ["mohammed"], ["table", "navet", "viande"], "Meat with turnips; he grimaces, then eats with hunger.", action="eat"),
 ],
 "s20_chant": [
  T("M", "chambre_jour", ["zoubida", "mohammed"], ["table"], "Zoubida stops chewing, listening up."),
  T("W", "terrasse", [], [], "Empty terrace in the spring breeze; a far voice sings (no one visible).", light="day"),
  T("M", "galerie", ["zoubida"], ["fenetre"], "Zoubida leans out of the window, calling across the courtyard.", action="lean"),
  T("M", "fenetre_fatma", ["fatma"], ["fenetre"], "Fatma answers from her window.", cam="fatma"),
  T("M", "galerie", ["zoubida"], ["fenetre"], "Zoubida, surprised."),
  T("M", "fenetre_fatma", ["fatma"], [], "Fatma laughs, knowing.", cam="fatma"),
  T("CU", "galerie", ["zoubida"], [], "Zoubida, mischievous."),
  T("W", "patio_balcons", ["zoubida", "fatma", "rahma"], [], "All the neighbours burst out laughing at their windows."),
  T("M", "patio_balcons", ["rahma"], [], "Rahma, teasing, at her balcony.", cam="rahma"),
  T("W", "patio_balcons", ["zoubida", "fatma", "kanza"], [], "Women on several balconies beg together."),
 ],
 "s21_recit": [
  T("W", "patio_balcons", ["zoubida", "mohammed", "fatma", "kanza"], ["tapis", "balustrade"], "Women lean on their balcony rails; Lalla Kanza spreads an old prayer rug in the patio; Mohammed beside his mother.", action="sit"),
  T("M", "patio_balcons", ["rahma"], [], "Rahma, seen to the chest at her balcony, starts her story.", cam="rahma"),
  T("CU", "patio_balcons", ["rahma"], [], "Rahma, lowering her voice, mock-serious.", cam="rahma"),
 ],
 "s22_othman": [
  T("M", "patio_balcons", ["rahma"], ["cabas"], "Rahma acts out Si Othman swinging his basket, hand on heart, greeting everyone.", cam="rahma", action="mime"),
  P("flashback", ["hache", "coutelas"], "Story: Joutyia, one butcher open — Salem, brandishing an axe — and a crowd around his stall."),
  P("flashback", ["hache"], "Story: Si Othman waving both arms, grinning, shouting; Salem threatens him with the axe."),
  T("W", "patio_balcons", ["zoubida", "mohammed", "fatma", "kanza"], [], "The women laugh to tears on their balconies."),
  P("flashback", ["babouche", "chien"], "Story: a dog runs off with Si Othman's babouche in its teeth; he hobbles after it on one shoe."),
  T("CU", "patio_balcons", ["rahma"], ["babouche", "chat", "chechia"], "Rahma mimes the dozing butcher, head tilted, chechia over the ear; the women giggle.", cam="rahma", action="mime"),
  P("flashback", ["alose"], "Story: shad fish passing over heads in a packed fondouk; Si Othman waiting, nose itching."),
  T("M", "patio_balcons", ["mohammed", "zoubida"], [], "Mohammed stamps with enthusiasm beside his laughing mother.", action="stamp"),
  T("CU", "galerie", ["zoubida"], [], "Zoubida, laughing: 'Continue !'"),
  P("flashback", ["rose"], "Story: at the mint-seller's, Si Othman stops before a magnificent rose."),
  P("flashback", ["porte", "rose", "turban"], "Story: the door reopens — the rose crushed underfoot, the turban flying out, then Si Othman himself, pale."),
  P("flashback", ["turban", "rose"], "Story: Si Othman picks up his turban, sniffs the rose, and gives a big smile."),
 ],
 "s23_fin": [
  T("W", "patio_balcons", ["zoubida", "fatma", "rahma", "kanza"], [], "Everyone doubled up with laughter, complimenting Rahma.", cam="rahma"),
  T("M", "chambre_nuit", ["mohammed"], ["couverture"], "Night: Mohammed in bed, smiling in his sleep.", light="night", fade=True),
 ],
}

TITLE = {"s02_titre": dict(mode="title", text="La Boîte à merveilles — Chapitre VI", dur=3.5, visual="title card"),
         "s24_fin": dict(mode="title", text="fin", dur=4, visual="end card")}


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
            if b.get("peak") is False: del b["peak"]
            B.append(b)
    json.dump({"episode": "ep06", "chapter": 6, "beats": B}, open(os.path.join(D, "beats.json"), "w"), ensure_ascii=False, indent=1)
    print(len(B), "beats")


if __name__ == "__main__":
    main()
