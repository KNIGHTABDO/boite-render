# Ep06 plates + paintings for ChatGPT. Plates carry a camera + light + size spec (same numbers go to S.calibrate() / S.light()).
# Paintings: style ref + cast refs attached; palettes come from cast.json. Run from the repo root.
import json, math
style = json.load(open('art/plates/ep05/prompts.json'))['_style']
cast = json.load(open('episodes/ep06/cast.json'))['characters']
MODEST = " Architecture stays modest and worn (a poor old medina, not a palace)."

def spec(h, fov, hor, dist, sizes, floor, light, shadows):
    tilt = round(math.degrees(math.atan((50 - hor) / 50 * math.tan(math.radians(fov / 2)))))
    return (f" CAMERA AND LIGHT SPEC (follow exactly: 3D characters will be composited into this painting with the same numbers): "
            f"ordinary lens, vertical field of view {fov} degrees, no fisheye, no wide-angle bulge; straight lines stay straight (no curving). "
            f"Camera height {h} m above the floor, tilted down about {tilt} degrees, so the horizon line (eye level) is a straight horizontal "
            f"line {hor}% down from the top of the image; vertical lines converge only very slightly downward. Distance from the camera to the back wall: {dist} m. Real sizes to respect: {sizes}. "
            f"Acting area: {floor} must stay completely empty, flat and level, with nothing on it. Light: {light}. Shadows: {shadows}.")

# key: (style ref attached, scene, spec)
P = {
 'msid_menage': ('art/plates/msid.png', "the same Koranic school room as the attached image (same camera, same walls, same low wooden estrade at the back), the day of the big cleaning before Achoura: "
   "the straw mats have been taken away, the bare beaten-earth floor is wet with dark puddles, the slates are stacked in a corner, two big wooden buckets of white lime-wash stand by the left wall "
   "with doum-palm hand brooms lying beside them, the lower half of the back wall is freshly whitewashed in bright streaky white while the upper half is still grey and dirty; white splashes on the floor. A long reed with a round brush on its tip leans in a corner." + MODEST,
   spec(1.0, 50, 42, 6.0, "door 1.80 m high, estrade 0.35 m high, buckets 0.45 m high and 0.40 m wide, brooms 0.50 m long",
        "the middle of the wet floor, from the foreground to the estrade", "warm morning light from the small high window at right plus soft daylight from the door behind the camera",
        "soft; a little sheen on the wet floor")),
 'msid_soupente': ('art/plates/msid.png', "the loft (soupente) of the same Koranic school as the attached image: a low wooden mezzanine under the rough cedar ceiling beams, reached by a short ladder at left; on its plank floor "
   "two big glazed green-and-ochre pottery jars side by side at right, rolled old straw mats piled at the back, a small clay bowl and an oil bottle by the jars. Dusty, half-dark, one beam of light from a tiny window." + MODEST,
   spec(0.9, 50, 45, 3.0, "ceiling beams 1.60 m above the loft floor, jars 0.70 m high and 0.50 m wide, rolled mats 0.35 m thick",
        "the plank floor in the middle and left of the loft", "dim warm ambient, one narrow sunbeam from a small window at upper right",
        "soft, dark under the beams")),
 'kissaria': ('art/plates/rue_foule.png', "the Kissaria cloth market of Fes, a narrow covered alley of small raised shops: in the centre one shop, a raised wooden booth 0.80 m above the street with an open front, "
   "its back and side walls hung with amaranth-red kaftans, cherry-red braided boys' gilets on shelves, white burnouses, bolts of white cotton and iridescent tulle; striped awnings and hanging cloth above; "
   "a worn wooden counter step in front. Reed lattice roof letting in stripes of light. The street in front is beaten earth." + MODEST,
   spec(1.1, 45, 42, 5.0, "shop front 2.20 m wide, booth floor 0.80 m above the street, counter step 0.40 m high, gilets 0.40 m wide",
        "the street in front of the shop, left to centre (customers will stand there) and the booth floor (the merchant will sit there)", "dappled warm daylight through the reed roof from above, slightly from the left",
        "soft dappled stripes")),
 'kissaria_rev': ('art/plates/rue_foule.png', "reverse angle in the Kissaria cloth market of Fes: seen from inside a small raised cloth shop looking out over its wooden counter into the narrow covered alley: "
   "in the foreground the counter edge with a folded bolt of white cotton and a pile of cherry-red braided gilets, beyond it the beaten-earth alley and the opposite shops hung with kaftans, burnouses and tulle, reed lattice roof with stripes of light." + MODEST,
   spec(1.1, 45, 44, 3.5, "counter 0.80 m high, alley 2.5 m wide, opposite shop fronts 2.0 m wide",
        "the alley floor beyond the counter, centre (two customers will stand there)", "dappled warm daylight from the reed roof, the shop interior in the foreground in soft shade",
        "soft dappled stripes")),
 'rue_mosquee': ('art/plates/impasse_jour.png', "a narrow medina street of Fes along the side wall of the Sidi Ahmed Tijani mosque: on the right a long plain lime-washed wall with a low stone bench at its foot, "
   "in the middle distance the mosque's richly decorated doorway (carved cedar door with bronze knockers under a green-tiled awning, painted zellige around it); on the left ordinary house walls; a slice of sky." + MODEST,
   spec(1.1, 45, 42, 7.0, "doorway 3.0 m high, bench 0.40 m high, street 3.0 m wide",
        "the street floor in the foreground and the foot of the right wall", "morning sun from the upper left lighting the right wall, the left side in cool shade",
        "crisp shadows across the street")),
 'rue_epices': ('art/plates/rue_foule.png', "the spice and grocers' street near the Attarine medersa in Fes: tiny shop fronts on both sides with sacks and baskets of spices, sugar loaves wrapped in blue paper, candles hanging in bunches; "
   "on the right a shop corner with an empty wooden ledge; in the distance the carved bronze door of the medersa. Festive bunting for Achoura." + MODEST,
   spec(1.1, 45, 42, 8.0, "shop fronts 1.80 m wide and 2.0 m high, ledge 0.70 m high, street 2.8 m wide",
        "the street floor in the centre and in front of the right shop corner", "warm late-morning light from above through gaps in the reed roofing",
        "soft dappled stripes")),
 'rahma_pauvre': ('art/plates/ep03/rahma_chambre.png', "a POOR, DARK single room of a widow in an old Fes house (same doorway and window placement as the attached image, but much poorer and darker): two lumpy worn mattresses with faded "
   "covers along the left and back walls, a small painted wooden shelf on the back wall with a few flowered bowls, a bare packed-earth floor with an old mat, a tiny round wall mirror; only the half-open door at right lets in light. No luxury, no feast, no carpets." + MODEST,
   spec(1.0, 50, 44, 4.0, "door 1.80 m high, mattresses 0.20 m high and 0.80 m deep, shelf 0.80 m wide",
        "the middle of the floor and the back mattress", "dim, a shaft of daylight from the half-open door at right, the room's left side in brown shadow",
        "soft, deep shadows in the corners")),
}

def ref(n): return cast[n].get('ref', '')
PSTYLE = ("Create an image. Wide 16:9 painting for a hand-painted 2D animated feature film, in EXACTLY the same painting style as the first attached image (gouache and watercolour on textured paper, "
          "delicate ink linework, rich luminous colour, torn paper border). Fes, Morocco, 1920s, historically accurate, modest worn architecture, no text, no modern objects. ")
MOH = "Mohammed is a 6-year-old boy with a shaved head and a small tuft, white djellaba (exactly like the attached Mohammed reference)"
OTH = "Si Othman is a cheerful old man with a short white beard, white turban, worn beige djellaba, straw basket (same Si Othman in every picture)"
SAL = "Salem is a big Black butcher with a red chechia and a blood-stained white apron"
# key: (beat, [refs], scene)
Q = {
 'p01_ane': ('b005', [], "Macro: the low door of the Koranic school; ONE thin donkey loaded with two sacks of white lime, white dust on its legs, a weathered lime-burner man in a dusty brown djellaba beside it holding the rope. Close framing, no other people."),
 'p02a_toiles': ('b007', [], "Chaos in the Koranic school: about ten small boys in white and brown djellabas sweep cobwebs off the dark cedar ceiling with round brushes on long reeds; dust falling, some laughing, one crying, open mouths. Bare earth floor, no mats."),
 'p02b_chaux': ('b008', [], "About ten small boys whitewash the walls of the Koranic school with doum-palm hand brooms dipped in two huge wooden buckets of white lime-wash; white splashes everywhere, one boy screams with his hands on his eyes (lime in his eyes)."),
 'p03_fontaine': ('b021', [], "About twenty small boys carry big wooden buckets of water from the stone fountain of a zaouia (green tiles, a bronze tap, a modest courtyard), a line of boys running back toward a little school door fifty steps away, water slopping."),
 'p04_pardon': ('b049', ['zineb'], "Imagination vignette, soft golden haze, floating images in a dreamy circle: the face of a little 5-year-old girl with black hair and green dress (Zineb, exactly like the attached reference), a small GREY cat with no collar, a thin gold chain, and a quince-wood rod. Gentle, forgiving mood."),
 'p05_cavalier': ('b053', ['mohammed'], f"Dream: {MOH} rides as a brave horseman on a white horse that grows out of his wooden stick, wearing a spotless white djellaba and a cherry-red braided gilet, an embroidered leather satchel heavy with cartridges at his side, galloping across a golden plain under a big sky, proud."),
 'p06_souk': ('b069', [], "A festive crowd of townspeople and country folk in a narrow Fes grocers' street before Achoura; two scrawny donkeys loaded with sugar loaves in blue paper, bunches of candles and bales of white cotton; colourful djellabas, women in white haiks."),
 'p07_tresor': ('b072', [], "The Kissaria cloth market seen through a small boy's eyes as the treasure of King Solomon: silks, amaranth kaftans, cherry-red braided gilets, iridescent tulle glowing like jewels in a magical cave of cloth, golden light, wonder."),
 'p08_prince': ('b107', ['mohammed'], f"Dream: {MOH}, as a little prince in milk-white with a red conical cap, serving a feast to beggars and psalm-singers sitting on mats in a courtyard, handing out red gilets, white djellabas and saffron-yellow babouches; big dishes of food, warm festive light."),
 'p09a_joutyia': ('b124', [], f"Story: the butchers' street of Joutyia in Fes, all shops shut except one; {SAL} brandishes an axe over his block; a small crowd presses around his stall."),
 'p09b_salem': ('b125', [], f"Story: {OTH}, waves both arms, grinning and shouting at the butcher's stall; {SAL} threatens him with his raised axe. Comic, not violent."),
 'p09c_chien': ('b127', [], f"Story, comic: a scrawny street dog runs off with a yellow babouche in its teeth along a medina alley; {OTH}, hobbles after it on one shoe, basket swinging."),
 'p09d_fondouk': ('b129', [], f"Story: a packed fish fondouk (courtyard market) in Fes, silver shad fish passed over people's heads from hand to hand; {OTH}, squeezed in the crowd, waits with an itching nose, about to sneeze."),
 'p09e_rose': ('b132', [], f"Story: at a mint-seller's stall heaped with fresh mint, {OTH}, stops, delighted, in front of one magnificent pink rose."),
 'p09f_porte': ('b133', [], f"Story, comic: a house door bursts open: a pink rose crushed on the doorstep, a white turban flying out through the air, then {OTH} himself thrown out, pale, startled. Only a woman's arm in a teal sleeve visible at the door."),
 'p09g_sourire': ('b134', [], f"Story: in a quiet alley {OTH}, bareheaded, picks up his white turban from the ground, sniffs the slightly crushed pink rose, and gives a big contented smile."),
}
out = {'_style': style, '_note': 'ep06 plates: numbers = S.calibrate()/S.light(); _ref = image to attach'}
for k, (r, scene, sp) in P.items(): out[k] = {'ref': r, 'prompt': style + ' ' + scene + sp}
json.dump(out, open('art/plates/ep06/prompts.json', 'w'), indent=1, ensure_ascii=False)
outp = {'_note': 'ep06 paintings: attach art/ep05/p11b_escalier.png (style) first, then the refs'}
for k, (b, refs, scene) in Q.items(): outp[k] = {'beat': b, 'refs': ['art/ep05/p11b_escalier.png'] + [ref(n) for n in refs], 'prompt': PSTYLE + scene}
json.dump(outp, open('art/ep06/prompts.json', 'w'), indent=1, ensure_ascii=False)
print(len(P), 'plates;', len(Q), 'paintings')
