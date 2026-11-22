"""ep09 paintings + macro inserts -> art/ep09/prompts.json and out/codex/ep09_batch_{a,b}.txt (Codex image gen)."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STYLE = 'art/ep05/p11b_escalier.png'
BASE = ("Create an image. Wide 16:9 painting for a hand-painted 2D animated feature film, in EXACTLY the same painting style as the first "
        "attached image (gouache and watercolour on textured paper, delicate ink linework, rich luminous colour, torn paper border). "
        "Fes, Morocco, 1920s, historically accurate, modest worn objects and architecture, no text, no letters, no modern objects. ")
INS = ("MACRO INSERT: an extreme close-up still life filling the frame, shallow depth of field, the object sharp in the centre, simple dark warm "
       "background; hands, when present, are a small child's or an adult's as stated, only hands and wrists visible (no faces). ")
DREAM = "Dream painting, the boy's imagination: soft glowing edges, slightly unreal scale, "
NIGHT = "Nightmare/dark fever painting: deep indigo and charcoal-ember palette, expressive shadows, still the same gentle hand-painted style, never gory, "
BOY = "Mohammed, a 6-year-old Fassi boy with a shaved head and a small tuft, in a plain off-white djellaba (match the boy in the attached reference)"
FATHER = "the father, a sturdy bearded artisan in a brown wool djellaba and white turban (match the man in the attached reference)"
MOTHER = "Zoubida, the mother, round face, headscarf, simple grey-blue house kaftan (match the woman in the attached reference)"
R = {
    'boy': 'art/src/mohammed.png',
    'father': 'art/src/father.png',
    'mother': 'art/src/zoubida.png',
    'mother_haik': 'art/src/zoubida_haik.png',
}

P = {
 'p01_cendres_etincelles': ('b006', [], NIGHT + "fever hallucination: soft swirling wisps of glowing red ash and icy blue-white sparks spinning in a tight vortex around a dark blurred child silhouette in a shadowy room."),
 'p02_chambre_tournante': ('b014', [], NIGHT + "fever vertigo: a modest Fes bedroom tilting dramatically as if spinning through deep starry midnight space beside streaks of meteors and constellations."),
 'p03_moissonneurs': ('b041', [R['father']], DREAM + f"sunny harvest fields outside Fes: golden wheat slopes under clear blue hills; sturdy Moroccan peasant harvesters with curved sickles reaping grain, {FATHER} standing tall among them with quiet pride."),
 'p04_planetes_mortes': ('b047', [R['boy']], NIGHT + f"immense cosmic loneliness: tiny {BOY} standing alone on a bare dark stone plain under silent dead moons and vast empty ink-blue space where sound dies."),
 'p05_aube_rossignols': ('b048', [], DREAM + "dawn breaking after winter: golden morning light pouring over blossoming orange boughs, spring wildflowers along stone paths, and two tiny nightingales singing."),
 'p06_pere_aube': ('b049', [R['father']], f"Pre-dawn blue mist in an empty cobblestone Fes alley: {FATHER} walking away into the quiet morning with a woven dwarf-palm shepherd bag slung over his shoulder and a curved sickle in hand, humble and resolute."),
 'p07_quarante_chats': ('b059', [R['boy']], DREAM + f"a joyful sun-drenched Moroccan courtyard with a leafy bitter-orange tree in fruit: a happy older {BOY} in a spotless crisp white djellaba sitting on cushions beside forty plump attentive cats of every colour, smiling."),
 'p08_boite_cercueil': ('b083', [], NIGHT + "high close-up looking down into an open carved wooden Wonder Box: inside, instead of magic treasures, its ordinary buttons, nails and glass shards lie grey and cold like small corpses inside a dark wooden coffin."),
 'p09_taches_murs': ('b084', [], "Close painterly study of damp, flaking, yellowed lime-plaster stains on a dim bedroom wall: once magical shapes, now flat ugly frozen crusted blotches in cold grey light."),
 'p10_orage_djinn': ('b089', [], NIGHT + "violent night storm over Fes rooftops: wind bending cedar shutters and whipping rain; shimmering out of swirling dark water-mist, a ghostly translucent silver-blue reed flute glowing faintly as if forged by a djinn."),
 'p11_deux_mondes': ('b092', [R['boy']], DREAM + f"split poetic composition: warm sunlit rooftop with fluttering sparrows and fresh round bread on top, descending into dark swirling abysses and shadow caves below, small {BOY} suspended between both worlds."),
 'p12_sentiers_nuit': ('b094', [R['boy'], R['father'], R['mother']], NIGHT + f"dark rocky mountain path in starless shadow: {BOY} curled up tiny beside a rock while tall dark silhouettes of {FATHER}, {MOTHER} and a stern turbaned schoolmaster tower along the ridge."),
 'p13_laitier_fromage': ('b108', [], "Warm affectionate folk-tale vignette in a 1920s Fes dairy shop: a grumpy miserly merchant behind clay bowls of fresh white cheese turning away a veiled pregnant woman, humorous old-tale charm."),
 'p14_seffah_arafi': ('b133', [], DREAM + "quiet sun-dappled narrow cul-de-sac in quartier Seffah in Fes, ancient wooden arched doorway ajar with warm amber incense light spilling from inside toward the empty cobblestones."),
}

I = {
 'bol_bouillon': ('b013', "A simple glazed earthenware bowl of steaming clear golden broth on a small wooden tray, gentle steam rising, adult woman's hand steady at the rim."),
 'citron_menthe': ('b017', "A small copper plate holding bright yellow fresh lemon peels and crisp green garden mint leaves against dark wood."),
 'lampe_petrole': ('b019', "An old brass-and-glass 1920s kerosene lamp just lit on a low shelf, warm amber glow blooming outward into a shadowy room."),
 'plat_safran': ('b021', "A humble brown glazed earthenware tajine dish steaming gently with golden saffron sauce, chunks of vegetables and meat, untouched on a low wooden table."),
 'mouchoir_argent': ('b035', "A crumpled patterned cotton handkerchief lying half-open on dusty cobblestones, a few silver coins spilling out beside a woven palm shoulder bag."),
 'bracelets_vente': ('b044', "An adult man's calloused palm holding a pair of sun-and-moon bracelets (one engraved gold, one crescent silver) with quiet sad resolve."),
 'sacoche_faucille': ('b049', "A woven dwarf-palm shepherd's satchel beside a brand-new curved steel harvest sickle with a rough wooden handle on a stone threshold."),
 'provisions_olives': ('b050', "An open coarse cotton drawstring bag revealing shiny black olives, dried figs, and golden toasted flour in folded cloth packets."),
 'qarchalas': ('b050', "Ten small round golden Moroccan sweet buns (qarchalas) glazed and sprinkled with toasted sesame seeds arranged on a woven reed basket."),
 'beignets_miel': ('b059', "A small earthenware plate of steaming golden fried Moroccan sfenj beignets glistening with melted butter and amber honey."),
 'bol_tadeffi': ('b071', "A rustic clay bowl of steaming creamy pale-green tadeffi soup scented with wild mint leaves, wooden spoon resting beside it."),
 'trompette_ramadan': ('b080', "A traditional long hammered brass Moroccan Ramadan horn (nafar) resting on a dark windowsill, comic folkloric shine."),
 'theiere_email': ('b081', "A tiny chipped blue-enamel teapot and two plain glass tumblers set directly onto bare weathered dark floorboards with no tray."),
 'omelette_epices': ('b096', "A sizzling small clay frying pan with a bright golden fried egg topped with scarlet paprika, fresh green parsley and cumin seeds."),
 'pain_olives': ('b110', "A thick wedge of crusty Moroccan bread smeared with butter and a handful of wrinkled black olives wrapped in stained brown grocer paper."),
 'jarre_eau': ('b111', "A tall porous terracotta drinking-water jar in a dim stone corner as cool water pours cleanly into its wide mouth from a wooden bucket."),
 'tronc_tijani': ('b119', "A square alms opening cut into vibrant green-and-blue Fes zellige wall mosaic, framed by carved cedar woodwork and a small wrought-bronze grille."),
 'portail_bronze': ('b125', "Lower corner of a monumental dark cedar portal studded with heavy tarnished bronze dome nails and an ornate iron ring knocker."),
 'tache_horloge': ('b130', "Bare cracked whitewashed plaster wall with a crisp clean pale rectangle where a missing wall clock used to hang, dusty hook still in the nail hole."),
}

out = {'_note': 'ep09 paintings + macro inserts: attach the style ref first, then character refs (art/src/<name>.png)'}
for k, (b, refs, t) in P.items():
    out[k] = {'beat': b, 'kind': 'P', 'refs': [STYLE] + refs, 'prompt': BASE + t}
for k, (b, t) in I.items():
    out['i_' + k] = {'beat': b, 'kind': 'I', 'refs': [STYLE], 'prompt': BASE + INS + t}

os.makedirs(f'{ROOT}/art/ep09', exist_ok=True)
json.dump(out, open(f'{ROOT}/art/ep09/prompts.json', 'w'), ensure_ascii=False, indent=1)
bs = json.load(open(f'{ROOT}/episodes/ep09/beats.json'))['beats']
need = {x['still'] for x in bs if x['mode'] == 'painting'} | {'i_' + n for x in bs for n, _ in x.get('ins') or []}
miss = need - set(out)
extra = set(out) - need - {'_note'}
print(len(out) - 1, 'prompts; missing', sorted(miss), 'unused', sorted(extra))
assert not miss and not extra, f"mismatch! miss={miss} extra={extra}"
keys = [k for k in out if k != '_note']
open(f'{ROOT}/out/codex/ep09_batch_a.txt', 'w').write('\n'.join(keys[::2]) + '\n')
open(f'{ROOT}/out/codex/ep09_batch_b.txt', 'w').write('\n'.join(keys[1::2]) + '\n')
