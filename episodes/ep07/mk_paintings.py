# Ep07 paintings (dream / crowd / flashback / montage) + 2D macro inserts (R6: hands-on props as painted inserts).
# Output: art/ep07/prompts.json  {key: {beat, refs:[style, cast refs...], prompt}}. Files go to art/ep07/<key>.png.
# Run from the repo root: python3 episodes/ep07/mk_paintings.py
import json
STYLE_REF = 'art/ep05/p11b_escalier.png'
PSTYLE = ("Create an image. Wide 16:9 painting for a hand-painted 2D animated feature film, in EXACTLY the same painting style as the first attached image (gouache and watercolour on textured paper, "
          "delicate ink linework, rich luminous colour, torn paper border). Fes, Morocco, 1920s, historically accurate, modest worn objects and architecture, no text, no modern objects. ")
MACRO = ("MACRO INSERT: an extreme close-up still life filling the frame, shallow depth of field, the object sharp in the centre, simple dark warm background; "
         "hands, when present, are a small child's or an adult's as stated, only hands and wrists visible (no faces). ")
MOH = "Mohammed, a 6-year-old boy with a shaved head and a small tuft (exactly like the attached Mohammed reference)"
MOHF = "Mohammed, a 6-year-old boy with a shaved head, new white djellaba, red gilet and red chechia (exactly like the attached reference)"

# key: (beat, [cast ref files], kind 'P' painting | 'I' insert, scene)
Q = {
 # ---------------------------------------------------------------- paintings
 'p01a_meche':      ('b014', [], 'I', "A child's fingers clip a rolled cotton wick onto a thin strip of tin, beside a pile of cotton tufts and tin strips on a straw mat."),
 'p01b_verre':      ('b014', [], 'I', "A thin tin strip with its cotton wick hooked on the rim of a small drinking glass filled half with water, half with a layer of golden oil on top."),
 'p01c_poudre':     ('b014', [], 'I', "A pinch of red powder sprinkled from a child's fingers into the glass of water and oil; the water turns ruby red in swirling clouds."),
 'p02_babouches':   ('b015', [], 'I', "A big pair of worn yellow leather babouches (an old schoolmaster's slippers) on a straw mat, both stuffed with small folded paper packets of coloured powder: red, green, yellow, blue. Comic, held still life."),
 'p03_reve_cierges':('b036', [], 'P', "Dream painting: monumental tall candles decorated with paper lace, gleaming open razors and painted hourglass clay drums swirling slowly in the air around chandeliers made of crystal cups, against a deep red-purple night; childlike wonder mixed with dread."),
 'p04_souk_foule':  ('b037', [], 'P', "Crowd painting, deep perspective in layers: the toy souk of Fes on the eve of Achoura, stalls overflowing with bunches of tambourines, tin trumpets and hourglass drums; a ring of women in white haiks, men and children trying instruments, noise you can almost hear."),
 'p05_larbi':       ('b048', [], 'P', "Warm sepia flashback: Moulay Larbi, a dignified bearded babouche-maker of about 40 in a white turban and fine djellaba, sits in his shop among stacks of yellow babouches with three young workers stitching leather; calm, respected, no child anywhere."),
 'p06_hymne_rue':   ('b057', [], 'P', "Painted montage, a lyrical hymn to the street: a little grey donkey trotting, skinny cats on a wall, whirling sparrows, pigeons, a festive procession with banners passing under a grapevine trellis and plane trees; golden light, joyful."),
 'p07_concert':     ('b069', ['zineb', 'girl1', 'girl2', 'teen_trompette'], 'P', "Terrace concert at sunset: a 5-year-old girl in a green dress (Zineb) and two little girls bang tambourines and an hourglass drum, an older boy of 12 blows a tin trumpet with his cheeks puffed; on the neighbouring terrace walls, richly dressed women perch and laugh, covering their ears; warm orange sky over the medina."),
 'p08_noir_reve':   ('b072', [], 'P', "Dream on a black background: out of the darkness emerge teasing little girls laughing and pointing, and chattering barbers with razors and wagging tongues, all floating, painted loosely like a half-asleep vision."),
 'p09a_chemise':    ('b076', [], 'I', "A brand-new child's white cotton shirt so stiff with starch it crackles like paper, a child's hands pulling a sleeve straight; warm red lamplight."),
 'p09b_gilet':      ('b076', [], 'I', "A small cherry-red braided gilet with gold embroidery being buttoned by an adult woman's hands over a child's white shirt; warm red lamplight."),
 'p09c_sacoche':    ('b076', [], 'I', "An embroidered leather satchel strap in green and gold silk thread laid across a small child's chest over the red gilet; warm lamplight."),
 'p09d_djellaba':   ('b076', [], 'I', "A spotless new white djellaba on a child's chest, an adult's hand sprinkling orange-blossom water from a silver flask, droplets catching the light."),
 'p10_idriss':      ('b093', ['father', 'mohammed_fete'], 'P', "The square of the notaries beside the Moulay Idriss sanctuary in Fes on Achoura day: crowds in new clothes, potters' stalls of blue-glazed ceramics; a father in a fine white djellaba and turban buys a blue dish, holding the hand of " + MOHF + "."),
 'p11_terrasses':   ('b103', [], 'P', "Sunset over the terraces of Fes: on every rooftop, bouquets of richly dressed women in colourful caftans with tambourines; the sun in a robe of gold bathes the white city in faded rose and mauve; the first star blinks in the sky."),
 # ---------------------------------------------------------------- macro inserts (R6)
 'i_rasoir_pierre':   ('b001', [], 'I', "An old-fashioned FOLDING straight razor (cut-throat razor: a thin rectangular blade with a rounded tip, hinged on a black ebony handle that is folded open at an angle) held by an old man's fingers and stroked flat on a dark oily whetstone, a sheen of oil, tiny glints on the edge; NOT a knife; tense, ominous."),
 'i_lame_nuque':      ('b002', [], 'I', "The edge of a folding straight razor (black ebony handle) just touching the nape of a small boy whose head is SHAVED completely smooth and bald (no hair at all), a red-and-yellow striped towel at the bottom of frame; the skin has tiny goosebumps."),
 # i_flash_facade: use a crop of art/plates/ep07/msid_facade.png instead
 'x_flash_facade':    ('b002', [], 'I', "A flash glimpse of a medina school door at night blazing with clusters of small coloured oil lights, red, green, yellow, blue, bokeh glow, magical."),
 'i_grappes_tambourins':('b004', [], 'I', "Bunches of small tambourines and bendirs hanging in clusters from a hook in a medina shop, goatskin heads, painted wooden frames, little brass cymbals."),
 'i_meches_ciseaux':  ('b013', [], 'I', "Big iron scissors cutting a strip of cotton into wicks on a straw mat, a child's hands, tufts of cotton and short tin strips around."),
 'i_pouce_lamelle':   ('b016', [], 'I', "A very small child's thumb with a fresh little cut, a drop of blood, the sharp tin strip that did it lying beside it on a mat."),
 'i_bout_chandelle':  ('b021', [], 'I', "A tiny stub of candle burning in the dark on a clay saucer, its small flame the only light, wax drips."),
 'i_meche_lampe':     ('b021', [], 'I', "A woman's fingers cleaning the charred wick of a small brass oil lamp by candlelight, oil gleaming."),
 'i_menthe_mains':    ('b025', [], 'I', "A small child's hands holding a fresh bunch of green mint against a white djellaba, in dim evening light."),
 'i_sesame_paume':    ('b027', [], 'I', "A small child's open palm holding a little heap of golden toasted sesame seeds and a few chickpeas, warm incense-lit gloom."),
 'i_graines_nez':     ('b028', [], 'I', "Comic close-up of a small boy's mouth and nose tip with golden sesame seeds stuck on his lips and the tip of his nose, the tongue reaching for them (lower half of the face only, from the nose down)."),
 'i_tambour_sablier': ('b038', [], 'I', "A painted hourglass-shaped clay drum (taarija) with a goatskin head, held in a man's hand at a souk stall, warm daylight."),
 'i_cierge_livre':    ('b039', [], 'I', "A big one-pound decorated candle (cierge) wrapped in coloured paper lace and gold paper, held upright in a candle-seller's stall beside rows of others."),
 'i_ventouses_nuque': ('b040', [], 'I', "Two small tin cupping cups stuck on the back of a man's shaved neck, the skin bulging red inside them; his ears cherry red."),
 'i_oignon_beurre':   ('b046', [], 'I', "A cut onion and a lump of rancid butter in a small clay bowl on a wooden board."),
 'i_miel':            ('b046', [], 'I', "A spoon dripping thick golden honey into a small clay bowl."),
 'i_anis':            ('b046', [], 'I', "A small heap of green aniseed on a piece of paper."),
 'i_sesame':          ('b046', [], 'I', "A small heap of golden sesame seeds on a piece of paper."),
 'i_gingembre':       ('b046', [], 'I', "A knobbly piece of dried ginger root beside a pinch of ground ginger."),
 'i_cannelle':        ('b046', [], 'I', "A few sticks of cinnamon bark tied with string."),
 'i_clous_girofle':   ('b046', [], 'I', "Exactly three cloves lying on a wooden board, nothing else."),
 'i_ventouse_bouche': ('b053', [], 'I', "An old barber's lips sucking the air from a small tin cupping cup through its little hole, to make it stick; (lower half of the face only, grey beard stubble)."),
 'i_rasoir_ongle':    ('b059', [], 'I', "A barber testing the edge of a straight razor on his thumbnail, a hair-thin shaving of nail curling off."),
 'i_sueur_nez':       ('b061', [], 'I', "A bead of sweat rolling down the tip of a small boy's nose (nose tip and upper lip only), a red-and-yellow striped towel at the bottom of the frame."),
 'i_manches_chemise': ('b068', [], 'I', "A woman's hands fitting the stiff starched sleeve of a new white shirt on a small child's arm; the sleeve stands out like cardboard."),
 'i_habits_poses':    ('b073', [], 'I', "New festive clothes laid out on a mattress in a red-lit room at night: a starched white shirt, a cherry-red gilet, an embroidered satchel, a folded white djellaba, a red chechia and new yellow babouches."),
 'i_main_mouillee':   ('b074', [], 'I', "A woman's wet hand gently pressed on the cheek of a sleeping small child (only the cheek and closed eye corner), drops of water, red light with sparks."),
 'i_piece_cinq_francs':('b080', [], 'I', "A silver five-franc coin in a small child's palm, in the dark, catching a faint warm glow."),
 'i_pile_cierges':    ('b083', [], 'I', "A pile of tall decorated candles offered on the estrade of a Koranic school at night, coloured paper lace, coins scattered among them, coloured flame light."),
 'i_saignement_nez':  ('b084', [], 'I', "A drop of blood falling onto the sleeve of a spotless white djellaba in a crowd of children, multicoloured oil-lamp light; small red stain."),
 'i_galettes_miel':   ('b092', [], 'I', "A plate of warm round Moroccan galettes (msemen) with a bowl of honey and a glass of mint tea on a brass tray."),
 'i_the_sauge':       ('b097', [], 'I', "A woman's hand dropping a sprig of fresh sage into a silver teapot on a brass tray with tea glasses."),
 'i_boite_ouverte':   ('b106', [], 'I', "A small old tin-and-wood box (a child's box of wonders) opened by a child's hands under a weak oil-lamp light: inside, buttons, glass marbles, a brass ring, bits of coloured glass, a little chain; the light is dimming."),
}

out = {'_note': f'ep07 paintings + macro inserts: attach {STYLE_REF} (style) first, then the refs (art/src/<name>.png)'}
for k, (b, refs, kind, scene) in Q.items():
    out[k] = {'beat': b, 'kind': kind, 'refs': [STYLE_REF] + [f'art/src/{n}.png' for n in refs],
              'prompt': PSTYLE + (MACRO if kind == 'I' else '') + scene}
json.dump(out, open('art/ep07/prompts.json', 'w'), indent=1, ensure_ascii=False)
print(sum(v[2] == 'P' for v in Q.values()), 'paintings,', sum(v[2] == 'I' for v in Q.values()), 'inserts')
