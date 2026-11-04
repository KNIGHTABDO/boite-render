# Ep07 plates (empty backgrounds for 3D staging). Same format as ep06/mk_plates.py: camera + light + size spec per plate
# (same numbers go to S.calibrate() / S.light()). Run from the repo root: python3 episodes/ep07/mk_plates.py
# Reused as-is: chambre_jour, chambre_nuit (+ ep03 lamp variants), escalier, patio_matin, terrasse, ep03/terrasse_coucher.
import json, math
style = json.load(open('art/plates/ep05/prompts.json'))['_style']
MODEST = " Architecture stays modest and worn (a poor old medina, not a palace)."
DARK = " This is a NIGHT scene: keep the whole image genuinely dark (most of the frame in deep blue-black shadow), only the stated light sources are bright."

def spec(h, fov, hor, dist, sizes, floor, light, shadows):
    tilt = round(math.degrees(math.atan((50 - hor) / 50 * math.tan(math.radians(fov / 2)))))
    return (f" CAMERA AND LIGHT SPEC (follow exactly: 3D characters will be composited into this painting with the same numbers): "
            f"ordinary lens, vertical field of view {fov} degrees, no fisheye, no wide-angle bulge; straight lines stay straight (no curving). "
            f"Camera height {h} m above the floor, tilted down about {tilt} degrees, so the horizon line (eye level) is a straight horizontal "
            f"line {hor}% down from the top of the image; vertical lines converge only very slightly downward. Distance from the camera to the back wall: {dist} m. Real sizes to respect: {sizes}. "
            f"Acting area: {floor} must stay completely empty, flat and level, with nothing on it. Light: {light}. Shadows: {shadows}.")

BARBER = ("the tiny shop of an old medina barber in Fes, about 3 m wide and 3.5 m deep, one step up from the street: rough lime-washed walls stained by years of smoke, "
          "a low wooden estrade (bench platform) covered with a worn mat along the LEFT wall for waiting customers, a short wooden stool for the client in the middle of the floor, "
          "on the right wall a small wooden shelf with razors in a row, an ebony-handled razor beside a dark oily whetstone, a copper basin, a brass water jug, small tin cupping cups, "
          "folded red-and-yellow striped towels, a small round mirror in a wooden frame hanging on the right wall; a little brass lamp hangs from a nail.")
MSID = "the same Koranic school room as the attached image (same walls, same low wooden estrade at the back, same high window)"
FEERIE = ("for the night of Achoura it is transformed into a fairyland: from the cedar ceiling hang three big wrought-iron lustres, each holding dozens of small glasses "
          "half water half oil with a floating wick, glowing red, green, yellow and blue; more glasses of coloured light line the walls and the estrade; fresh new straw mats on the floor, "
          "everything bathed in warm flickering multicoloured light, golden haze.")

# key: (style ref attached, scene, spec)
P = {
 # ---------------------------------------------------------------- barber (s01, s12–s16)
 'barbier': ('art/plates/ep06/kissaria.png', "Interior of " + BARBER + " Seen from the open shop front looking in at the back wall." + MODEST,
   spec(1.0, 45, 44, 3.5, "estrade 0.40 m high and 0.80 m deep, stool 0.35 m high, shelf 1.30 m above the floor, ceiling 2.40 m",
        "the floor in the middle (around the stool) and the estrade's seat", "warm daylight from the open shop front behind the camera, plus the small lamp; back corners in warm shade",
        "soft")),
 'barbier_rev': ('art/plates/ep06/kissaria.png', "Reverse angle inside " + BARBER + " Seen from the back wall looking OUT through the wide open shop front: the client's stool in the middle ground, "
   "the estrade now on the RIGHT, and through the opening the sunny narrow street with, just opposite, the rival barber's shop of Bnou Achir (a similar tiny open shop) and a very old twisted grapevine "
   "climbing up the wall and spreading over the street on a reed trellis." + MODEST,
   spec(1.0, 45, 44, 3.0, "shop opening 2.20 m wide and 2.10 m high, stool 0.35 m high, street 2.5 m wide",
        "the shop floor around the stool, in the middle", "the interior in soft warm shade, the street outside bright sunlit (a little overexposed)",
        "soft inside, crisp outside")),
 'barbier_ext': ('art/plates/impasse_jour.png', "A narrow medina street in Fes: in the centre the tiny open-fronted barber's shop, one step up from the street, a low estrade with a mat inside, "
   "razors and a small mirror on its back wall; above the shop a centuries-old grapevine with a thick twisted trunk climbs the wall and spreads over the whole street on a reed trellis, "
   "dappled green light. On the far left edge, the front of a second, rival barber's shop facing it." + MODEST,
   spec(1.1, 45, 42, 5.0, "shop opening 2.20 m wide and 2.10 m high, step 0.25 m, street 2.5 m wide, vine trunk 0.25 m thick",
        "the street floor in front of the shop, centre and left", "midday sun filtered through the vine leaves", "soft dappled leaf shadows")),
 'barbier_ext_rev': ('art/plates/impasse_jour.png', "Looking down a narrow medina street of Fes from the doorstep of a barber's shop: the street flooded with dazzling sunlight, "
   "lime-washed walls glowing almost white, a few grapevine leaves at the top edge of frame, sparrows' perch on a ledge (no birds), a far arch. It must feel overexposed and joyful, "
   "as if seen by a child coming out of a dark room. No barber pole, no signs, no modern objects." + MODEST,
   spec(1.1, 45, 42, 10.0, "street 2.5 m wide, doors 1.80 m high", "the street floor in the foreground and middle", "blinding high sun, washed-out bright whites and warm golds",
        "short crisp shadows")),
 # ---------------------------------------------------------------- Msid (s06, s22, s23)
 'msid_lustres': ('art/plates/msid.png', MSID + ", the day before Achoura: the straw mats rolled away to the walls, a tall rickety wooden ladder leaning against the left wall, "
   "two big wrought-iron lustres lying on the floor along the left wall waiting to be hung, a tray of empty small drinking glasses, a pile of cotton tufts, strips of tin, a big jar of oil and small bowls of coloured powder on the estrade." + MODEST,
   spec(1.0, 50, 42, 6.0, "door 1.80 m high, estrade 0.35 m high, ladder 3.0 m long, lustres 0.80 m wide, ceiling 3.2 m",
        "the middle of the floor, from the foreground to the estrade", "warm afternoon light from the small high window at right plus daylight from the door behind the camera",
        "soft")),
 'msid_lustres_rev': ('art/plates/msid.png', "Reverse angle in " + MSID + ": seen from the estrade looking toward the low entrance door, at sunset: the open door shows an orange sky and the alley, "
   "two wrought-iron lustres now hanging from the ceiling beams with their small glasses of oil (not lit yet), a tall ladder leaning against the right wall, mats rolled along the walls." + MODEST,
   spec(1.0, 50, 44, 5.5, "door 1.80 m high and 0.90 m wide, ladder 3.0 m long, lustres 0.80 m wide hanging 2.2 m above the floor",
        "the middle of the floor", "golden-orange sunset light pouring in through the door, the room in warm dusk shade", "long soft shadows from the door")),
 'msid_feerie': ('art/plates/msid.png', MSID + ", " + FEERIE + MODEST,
   spec(1.0, 50, 42, 6.0, "door 1.80 m high, estrade 0.35 m high, lustres 0.90 m wide hanging 2.2 m above the floor, ceiling 3.2 m",
        "the middle of the floor (children will sit on the mats there) and the estrade", "multicoloured warm light from the hundreds of little oil flames; the walls glow",
        "soft, many faint coloured shadows")),
 'msid_feerie_rev': ('art/plates/msid.png', "Reverse angle in " + MSID + ", seen from the estrade toward the low entrance door; " + FEERIE +
   " Through the door: the black night street." + MODEST,
   spec(1.0, 50, 44, 5.5, "door 1.80 m high and 0.90 m wide, lustres 0.90 m wide hanging 2.2 m above the floor", "the middle of the floor",
        "multicoloured warm light from the little oil flames; the door is a black rectangle", "soft, many faint coloured shadows")),
 'msid_facade': ('art/plates/impasse_jour.png', "Night of Achoura in a narrow medina street of Fes: at the end of the street, the modest façade of the Koranic school (Msid) is ABLAZE with light: "
   "clusters of small coloured oil lamps (red, green, yellow, blue glasses) hung in bunches all over the door frame and the wall, garlands of lights above the low door, the door open "
   "on a golden glowing interior. The rest of the street is deep night blue. A magical, overwhelming sight for a child." + MODEST,
   spec(1.0, 45, 44, 8.0, "Msid door 1.80 m high and 0.90 m wide, street 2.5 m wide, light clusters 0.5 m wide",
        "the street floor in the foreground and middle", "the façade's coloured lights are the only light source; warm spill on the street floor; everything else night blue",
        "soft coloured glow")),
 'msid_facade_aube': ('art/plates/impasse_jour.png', "The same narrow medina street of Fes and the same modest Koranic school façade at DAWN after the night of Achoura: the clusters of small coloured oil lamps "
   "on the door frame are dying, most glasses dark and smoky, a few still flickering; pale grey-blue dawn sky, cold light, a little mist; two sparrows' worth of empty ledge. Tired, after-the-party mood." + MODEST,
   spec(1.0, 45, 44, 8.0, "Msid door 1.80 m high and 0.90 m wide, street 2.5 m wide", "the street floor in the foreground and middle",
        "cold pale dawn from the sky above, last weak coloured flames at the door", "very soft")),
 # ---------------------------------------------------------------- house, night (s07–s10, s19, s20)
 'patio_nuit_pov': ('art/plates/patio_nuit.png', "The patio of the same old Fes house as the attached image, at night, seen at a 6-year-old child's eye height from the foot of the stairs: "
   "the patio is FULL of thick bluish incense smoke drifting in layers, small clay braziers glowing on the tiled floor, a few candles, the galleries above lost in darkness; "
   "mysterious, a little frightening." + DARK + MODEST,
   spec(0.9, 50, 46, 7.0, "patio 6 m wide, doors 1.80 m high, braziers 0.25 m high", "the patio floor in the middle", "red-orange glow from the braziers and candles, smoke catching the light",
        "soft, deep shadows")),
 'escalier_nuit': ('art/plates/escalier.png', "The same narrow stone staircase of the old Fes house as the attached image, at NIGHT, almost pitch dark: only a thin cold rim of moonlight "
   "from an opening above outlines the edges of the steps and the walls; the top of the stairs is lost in blackness." + DARK + MODEST,
   spec(0.9, 50, 46, 3.0, "steps 0.20 m high and 0.28 m deep, stair 0.90 m wide", "the steps themselves", "faint cold moonlight from above only",
        "nearly black")),
 'cuisine_auge': ('art/plates/ep04/cuisine_palier.png', "A small wash corner of the old Fes house at night: a big oval wooden trough (washtub) on the stone floor, steam rising, a copper bucket of water beside it, "
   "a brass brazier with a kettle, a cork bath ring, a bar of black soap, a towel on a nail; one oil lamp on a ledge." + DARK + MODEST,
   spec(1.0, 50, 44, 3.0, "trough 1.10 m long, 0.60 m wide and 0.35 m high, bucket 0.35 m high", "the floor in front of the trough and the trough itself",
        "warm lamp light from the ledge at left, steam glowing", "soft, dark corners")),
 'rue_nuit': ('art/plates/ep04/rue_lanterne.png', "A narrow medina street of Fes at 3 o'clock in the morning: black night, closed doors, one weak lantern far away, stars in a slice of sky; "
   "the street climbs gently away from the camera toward a corner." + DARK + MODEST,
   spec(1.0, 45, 44, 10.0, "street 2.5 m wide, doors 1.80 m high", "the street floor in the foreground and middle", "one weak warm lantern far away, cold faint starlight",
        "nearly black")),
 'rue_nuit_rev': ('art/plates/ep04/rue_lanterne.png', "Reverse angle in the same narrow medina street of Fes at 3 a.m.: looking back down the street toward a house door left ajar with warm light inside; "
   "black night, stars." + DARK + MODEST,
   spec(1.0, 45, 44, 9.0, "street 2.5 m wide, doors 1.80 m high", "the street floor in the foreground and middle", "a warm slice of light from the ajar door, the rest cold and dark",
        "nearly black")),
 # ---------------------------------------------------------------- day (s11, s25, s04/s18)
 'souk_jouets': ('art/plates/ep06/kissaria.png', "The toy souk of Fes on the eve of Achoura: a narrow covered alley of tiny open shops overflowing with children's toys: grappes of tambourines and bendirs hanging in bunches, "
   "painted hourglass clay drums (taarija) stacked high, tin trumpets, small wooden chariots with red wheels, rattles, little flutes; at the far end the big candle stalls near Bab Moulay Idriss "
   "with tall decorated candles (cierges). Festive bunting." + MODEST,
   spec(1.1, 45, 42, 9.0, "shop fronts 1.80 m wide and 2.0 m high, counters 0.80 m high, alley 2.8 m wide", "the alley floor in the centre, from the foreground to the middle",
        "dappled warm daylight through the reed roof", "soft dappled stripes")),
 'salon': ('art/plates/chambre_jour.png', "The same room of the poor Fes family as the attached image, dressed for the Achoura visit: the divan along the back wall covered with its best embroidered cushions, "
   "a low round table with a tray of tea glasses, a silver teapot, a plate of galettes and a bowl of honey, a sprig of sage; the floor mat swept. Late-afternoon festive mood." + MODEST,
   spec(1.0, 50, 44, 4.0, "divan 0.35 m high and 0.80 m deep, low table 0.30 m high and 0.70 m wide, door 1.80 m", "the middle of the floor and the divan seat",
        "warm late-afternoon light from the door at right", "soft")),
 'salon_rev': ('art/plates/chambre_jour.png', "Reverse angle in the same room of the poor Fes family, seen from the divan looking toward the door that opens on the patio gallery: "
   "the low round table with the tea tray in the foreground, the door showing warm late light, a niche with a small mirror and a candle." + MODEST,
   spec(1.0, 50, 44, 3.5, "door 1.80 m high and 1.0 m wide, low table 0.30 m high", "the floor between the table and the door",
        "warm late-afternoon light through the door", "soft")),
 'terrasse_rampe': ('art/plates/terrasse.png', "The same roof terrace as the attached image, seen toward its low party wall (rampe, 0.9 m high) with a rain gutter at its foot; "
   "beyond the wall, the neighbours' terraces step down across the medina, some with laundry lines; sunset sky with golden light." + MODEST,
   spec(1.0, 45, 44, 4.0, "party wall 0.90 m high and 0.25 m thick, gutter 0.15 m wide", "the terrace floor in the foreground and the top of the party wall",
        "warm golden sunset from the right", "long soft shadows")),
}

out = {'_style': style, '_note': 'ep07 plates: numbers = S.calibrate()/S.light(); ref = image to attach'}
for k, (r, scene, sp) in P.items(): out[k] = {'ref': r, 'prompt': style + ' ' + scene + sp}
json.dump(out, open('art/plates/ep07/prompts.json', 'w'), indent=1, ensure_ascii=False)
print(len(P), 'plates')
