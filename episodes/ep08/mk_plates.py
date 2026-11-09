# Ep08 plates (empty backgrounds for 3D staging), same format as ep07/mk_plates.py. Run from the repo root.
# Reused: chambre_jour, ep05/chambre_penombre, chambre_nuit, patio_matin, ep05/patio_vide, escalier, ep07/escalier_nuit, msid.
import json, math
style = json.load(open('art/plates/ep05/prompts.json'))['_style']
MODEST = " Architecture stays modest and worn (a poor old medina, not a palace)."

def spec(h, fov, hor, dist, sizes, floor, light, shadows):
    tilt = round(math.degrees(math.atan((50 - hor) / 50 * math.tan(math.radians(fov / 2)))))
    return (f" CAMERA AND LIGHT SPEC (follow exactly: 3D characters will be composited into this painting with the same numbers): "
            f"ordinary lens, vertical field of view {fov} degrees, no fisheye, no wide-angle bulge; straight lines stay straight (no curving). "
            f"Camera height {h} m above the floor, tilted down about {tilt} degrees, so the horizon line (eye level) is a straight horizontal "
            f"line {hor}% down from the top of the image; vertical lines converge only very slightly downward. Distance from the camera to the back wall: {dist} m. Real sizes to respect: {sizes}. "
            f"Acting area: {floor} must stay completely empty, flat and level, with nothing on it. Light: {light}. Shadows: {shadows}.")

MAUS = ("the inside of a small whitewashed saint's mausoleum (marabout) in Fes used by a Koranic school in summer: a big cool square room of white lime walls "
        "under a white dome, green-painted wooden doors, a catafalque draped in green cloth embroidered with gold in a wooden railing on one side, "
        "old straw mats on the floor, a tiny zellige wall fountain with a thin singing stream in a corner, ostrich eggs and small glass lamps hanging from the dome; "
        "cool green shadows, a breeze through the open door.")
SOUK = ("the jewellers' souk of Fes: a narrow lane under split-reed roofing, on both sides tiny open shop niches one step up, their back walls hung with "
        "silver necklaces, bangles and fibulae glittering, small glass display boxes on the counters, a merchant's low stool in each niche; dust in the light blades.")
P = {
 'mausolee': ('art/plates/zaouia_cour.png', "Interior of " + MAUS + " Seen from near the door: the catafalque with its green drape and railing on the LEFT, the fountain in the RIGHT back corner, "
   "the open floor in the middle where boys will sit and pray." + MODEST,
   spec(1.0, 50, 44, 6.0, "room 6 m square, catafalque 1.8 m long and 0.9 m high, railing 1.0 m high, fountain basin 0.5 m wide at 0.6 m, doors 1.90 m",
        "the middle of the floor and the mats in front of the camera", "cool soft daylight from the open door behind the camera and a small high window, white walls bouncing light",
        "very soft, faint green tint")),
 'mausolee_rev': ('art/plates/zaouia_cour.png', "Reverse angle inside " + MAUS + " Seen from the back wall toward the open green door: bright summer street light in the doorway, "
   "the catafalque now on the RIGHT edge, straw mats in the middle, a low wooden lectern near the wall." + MODEST,
   spec(1.0, 50, 44, 5.5, "door 1.90 m high and 1.1 m wide, catafalque 0.9 m high, mats 1 m wide", "the middle of the floor",
        "the doorway bright, the room in cool soft shade", "soft")),
 'souk_bijoux': ('art/plates/ep07/souk_jouets.png', "The " + SOUK + " Looking down the lane, which recedes to a bright far end; shops on both sides; "
   "no people at all, completely empty lane." + MODEST,
   spec(1.1, 45, 42, 10.0, "shop niches 1.80 m wide and 2.0 m high, counters 0.80 m high, step 0.30 m, lane 2.6 m wide", "the lane floor in the centre, from the foreground to the middle",
        "hot midday light filtering through the reed roof", "crisp striped light blades")),
 'souk_bijoux_rev': ('art/plates/ep07/souk_jouets.png', "The " + SOUK + " Close angle across the lane on ONE shop niche: a jeweller's counter at chest height with velvet trays, "
   "a small brass scale, bangles hanging on a cord, the lane floor in front; nobody in the shop." + MODEST,
   spec(1.1, 45, 44, 3.5, "counter 0.80 m high and 1.6 m wide, niche 2.0 m high, step 0.30 m", "the lane floor in front of the counter",
        "warm dappled light from the reed roof", "soft stripes")),
 'souk_mur': ('art/plates/ep06/rue_epices.png', "A narrow medina lane in Fes next to the jewellers' souk: on the LEFT a tall bare lime-washed wall with a low stone bench at its foot "
   "(people get pushed against it), on the right a dried-fruit stall with neat pyramids of dates, figs and almonds in round baskets, a scale; reed roofing above." + MODEST,
   spec(1.1, 45, 42, 7.0, "wall 4 m high, bench 0.40 m high and 0.35 m deep, stall counter 0.80 m high, lane 2.6 m wide", "the lane floor in the centre and in front of the wall",
        "warm midday light through the reed roof", "soft dappled stripes")),
}
out = {'_style': style, '_note': 'ep08 plates: numbers = S.calibrate()/S.light(); ref = image to attach'}
for k, (r, scene, sp) in P.items(): out[k] = {'ref': r, 'prompt': style + ' ' + scene + sp}
json.dump(out, open('art/plates/ep08/prompts.json', 'w'), indent=1, ensure_ascii=False)
open('out/codex/ep08_plates.txt', 'w').write('\n'.join(P) + '\n')
print(len(P), 'plates')
