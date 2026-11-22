# Ep09 plates (empty backgrounds for 3D staging), same format as ep08/mk_plates.py. Run from the repo root.
# Reused: chambre_jour, ep05/chambre_penombre, chambre_nuit, patio_matin, patio_nuit, ep05/patio_vide, escalier, ep07/escalier_nuit.
import json, math, os
style = json.load(open('art/plates/ep05/prompts.json'))['_style']
MODEST = " Architecture stays modest and worn (a poor old medina, not a palace)."

def spec(h, fov, hor, dist, sizes, floor, light, shadows):
    tilt = round(math.degrees(math.atan((50 - hor) / 50 * math.tan(math.radians(fov / 2)))))
    return (f" CAMERA AND LIGHT SPEC (follow exactly: 3D characters will be composited into this painting with the same numbers): "
            f"ordinary lens, vertical field of view {fov} degrees, no fisheye, no wide-angle bulge; straight lines stay straight (no curving). "
            f"Camera height {h} m above the floor, tilted down about {tilt} degrees, so the horizon line (eye level) is a straight horizontal "
            f"line {hor}% down from the top of the image; vertical lines converge only very slightly downward. Distance from the camera to the back wall: {dist} m. Real sizes to respect: {sizes}. "
            f"Acting area: {floor} must stay completely empty, flat and level, with nothing on it. Light: {light}. Shadows: {shadows}.")

P = {
 'rue_tijani': ('art/plates/ep06/rue_mosquee.png',
   "A quiet cobblestone alley in the Fes medina beside the Sidi Ahmed Tijani shrine: on the RIGHT wall, aged green-and-blue zellige mosaic with an offering hole at chest height framed by carved dark cedar woodwork and a small wrought bronze grille; further down on the LEFT wall, a monumental dark cedar portal studded with big bronze nail heads and twin ring knockers. No people at all." + MODEST,
   spec(1.1, 45, 44, 9.0, "lane 2.6 m wide, shrine offering hole 1.45 m above floor, monumental bronze-studded portal 2.5 m high and 1.6 m wide",
        "the cobblestone lane floor in the centre from foreground to middle",
        "warm midday medina sunlight slanting into the narrow alley", "crisp warm diagonal shadows")),
 'rue_legumes': ('art/plates/ep06/rue_epices.png',
   "A narrow sunny street corner in the Fes medina: on the RIGHT edge, a small open vegetable vendor's spot with woven reed baskets and flat crates displaying neat little pyramids of shiny green-and-red peppers and bright red tomatoes right on a low wooden plank; whitewashed cracked lime wall on the left; reed-slat overhead shade casting striped light. Completely empty, no people at all." + MODEST,
   spec(1.1, 45, 44, 7.0, "lane 2.6 m wide, wooden crate/stall 0.45 m high, pepper & tomato pyramids 0.30 m tall",
        "the street floor in front of the vegetable pyramids",
        "warm late-morning daylight filtered through overhead reed slats", "soft dappled reed stripes")),
 'aicha_pauvre': ('art/plates/ep04/aicha_chambre.png',
   "Inside Lalla Aicha's impoverished 2nd-floor room at Zenqat-Hajjama in Fes: bare cracked whitewashed walls showing a distinct pale rectangular stain where a wall clock used to hang, missing shelves; two thin faded hard mattresses stuffed with dark vegetable-hair along the walls with NO bright cretonne covers and NO floor carpets — only bare worn red floor tiles and a tiny battered copper kettle sitting by a charcoal brazier near the right corner. Completely empty, no people at all." + MODEST,
   spec(1.0, 50, 44, 5.0, "room 4.5 m wide, thin worn mattress 0.16 m thick, pale clock stain 1.8 m high on back wall, small doorway 1.85 m high",
        "the bare red tiled floor in the middle of the room",
        "cold grey diffuse daylight from one small window at left", "very soft dim shadows, bleak muted palette")),
}

os.makedirs('art/plates/ep09', exist_ok=True)
os.makedirs('out/codex', exist_ok=True)
out = {'_style': style, '_note': 'ep09 own plates: numbers = S.calibrate()/S.light(); ref = image to attach'}
for k, (r, scene, sp) in P.items(): out[k] = {'ref': r, 'prompt': style + ' ' + scene + sp}
json.dump(out, open('art/plates/ep09/prompts.json', 'w'), indent=1, ensure_ascii=False)
open('out/codex/ep09_plates.txt', 'w').write('\n'.join(P) + '\n')
print(len(P), 'plates')
