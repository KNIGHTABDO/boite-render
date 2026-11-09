"""ep08 paintings + macro inserts -> art/ep08/prompts.json and out/codex/ep08_batch_{a,b}.txt (Codex image gen, see out/codex/img_brief.md).
Paintings: art/ep08/<still>.png. Inserts: art/ep08/i_<name>.png. Style ref first, then character refs."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STYLE = 'art/ep05/p11b_escalier.png'
BASE = ("Create an image. Wide 16:9 painting for a hand-painted 2D animated feature film, in EXACTLY the same painting style as the first "
        "attached image (gouache and watercolour on textured paper, delicate ink linework, rich luminous colour, torn paper border). "
        "Fes, Morocco, 1920s, historically accurate, modest worn objects and architecture, no text, no letters, no modern objects. ")
INS = ("MACRO INSERT: an extreme close-up still life filling the frame, shallow depth of field, the object sharp in the centre, simple dark warm "
       "background; hands, when present, are a small child's or an adult's as stated, only hands and wrists visible (no faces). ")
DREAM = "Dream painting, the boy's imagination: soft glowing edges, slightly unreal scale, "
NIGHT = "Nightmare painting: deep indigo and ember palette, expressive shadows, still the same gentle hand-painted style, never gory, "
BOY = "Mohammed, a 6-year-old Fassi boy with a shaved head and a small tuft, in a plain off-white djellaba (match the boy in the attached reference)"
FATHER = "the father, a sturdy bearded artisan in a brown wool djellaba and white turban (match the man in the attached reference)"
MOTHER = "Zoubida, the mother, round face, headscarf, simple house kaftan (match the woman in the attached reference)"
R = {'boy': 'art/src/mohammed.png', 'father': 'art/src/father.png', 'mother': 'art/src/zoubida.png', 'fqih': 'art/src/fqih.png',
     'mother_haik': 'art/src/zoubida_haik.png'}

P = {  # still: (beat, refs, text)
 'p01_ete_patio': ('b004', [], "Summer heat over a traditional Fes house: looking down through the open sky-square into the tiled patio, shimmering hot air, "
                   "a few flies circling in a single slanting sunbeam, whitewashed walls, cedar beams, a sleepy afternoon stillness. Leave the top third as bright sky."),
 'p05_savant': ('b020', [R['fqih']], DREAM + "comic and affectionate: a child's idea of a learned scholar — an enormously stout man with a beard framing a huge round "
                "face under a monumental white turban, puffing up like a balloon, sitting cross-legged on a mat with a tiny book; warm ochres."),
 'p06_envol': ('b024', [R['boy']], DREAM + f"{BOY} flies out of a school window with arms spread, high above Fes: the small white domed mausoleum shrinks below, "
               "the green tiled roofs of the city spread to the hills, swallows around him, golden late-morning light."),
 'p07_homme': ('b025', [R['boy']], DREAM + "the man the boy dreams of becoming: a simple, sturdy young man in raw undyed wool, eyes full of fire, gently holding a "
               "small child's hand, both seen from a low angle under an immense open sky with towering clouds, wind in the wool."),
 'p08_ilots_noirs': ('b026', [R['boy']], NIGHT + f"{BOY} asleep under a striped wool blanket, a faint glowing dream above him (a tiny man walking under a big sky) "
                     "being swallowed by huge black ink islands that spread like stains across the image."),
 'p09_soleil_lune': ('b031', [], "Two bracelets on deep blue velvet, glowing like a sun and a moon: a broad engraved GOLD bangle radiating warm light like the sun, "
                     "and a SILVER bangle shaped like a crescent moon with a cool glow; a few chiselled flowers on each; reverent, magical, centred composition."),
 'p10_fleurs_champs': ('b046', [], "Triptych in one wide image, three vertical panels separated by soft painted borders, left to right: orange marigolds and red poppies "
                       "on grassy spring graves under olive trees / plump white daisies opening golden hearts to the sun / white bindweed climbing over the "
                       "stony Bab Guissa hillside with the Fes walls far behind."),
 'p11_fleurs_terrasse': ('b047', [], "A Fes rooftop terrace at morning: three broken clay pots and an old cooking pot in a row on the parapet, holding a red geranium, "
                         "pink carnations and lush Ispahan roses; laundry line, other terraces behind, soft light; the three pots evenly spaced left to right."),
 'p12_genies': ('b048', [], DREAM + "an underground palace with vaulted halls: friendly genies in turbans forge jewels at anvils beside rivers of molten gold, "
                "the finished bracelets and necklaces still glowing with the colour of the flames, sparks rising, deep reds and golds."),
 'p13_princesse': ('b049', [], DREAM + "a legendary Andalusian-Moroccan princess in flowing silks walking barefoot along a garden path at dusk; under each of her steps a "
                   "jewel-like flower blooms out of the earth (rubies, pearls, emeralds as petals), a trail of them behind her."),
 'p18_fourmiliere': ('b074', [], "The jewellers' souk of Fes seen from above like an anthill: a dense river of white turbans and white haiks in a narrow lane under "
                     "split-reed shade, bright blades of sunlight cutting through the dust, tiny shop niches glittering with silver on both sides."),
 'p20_humiliation': ('b078', [], "Flash-forward, muted ochre and grey palette: a grown man in his thirties in raw wool, ashamed, letting a pair of bracelets (one gold, "
                     "one silver) slip from his open hands into a merchant's palm in a souk; his face half in shadow, the merchant counting coins."),
 'p22_mer_foule': ('b091', [], "A crowd in a narrow souk lane seen from slightly above, heads and turbans rising and falling like waves of a stormy sea, shouts "
                   "from the far end suggested by motion, dust and swirling reed-shade light."),
 'p23_course': ('b092', [], "Panic in the souk: everyone runs in the same direction, djellabas flying, a few yellow babouches tumbling through the air in the "
                "foreground, strong diagonal composition, motion lines painted into the dust."),
 'p28_etincelles': ('b108', [], NIGHT + "pure darkness of a closed room: vague monstrous shapes forming from shadow, morphing, and dissolving into huge floating green sparks."),
 'p29_monstres': ('b123', [R['boy'], R['father'], R['mother']], NIGHT + f"a narrow night street; {BOY}, {MOTHER} and {FATHER} flee hand in hand; behind them looming "
                  "shadow monsters with burning hateful eyes hunt them."),
 'p30_foule_hideuse': ('b124', [R['boy']], NIGHT + f"a hideous grasping crowd with long arms chases {BOY}, who clutches a small carved wooden box (the Wonder Box) to his chest."),
 'p31_cheval_noir': ('b125', [R['father']], NIGHT + f"{FATHER} gallops on a great black horse through the parting crowd, the small carved wooden box under his arm, heroic."),
 'p32_criniere': ('b126', [], DREAM + "close on the galloping black horse: its long mane unfurls like a banner across the whole width of the image against a moonlit sky."),
 'p33_colline': ('b127', [R['father']], DREAM + f"a deserted countryside of sand and stones in summer light, utterly quiet; far away on a rounded hill, {FATHER} stands and waits."),
 'p34_offre': ('b128', [R['father']], DREAM + f"on the sunny hilltop, {FATHER} holds out the small carved wooden box with both hands toward the viewer, kind smile."),
 'p35_tresor': ('b129', [], DREAM + "a small carved wooden box open in the sun: inside, on freshly cut carnations and roses, lie gold jewels and precious stones, light blooming."),
 'p36_mon_tresor': ('b130', [R['boy']], DREAM + f"{BOY} on the hilltop proudly lifts the open treasure box high with both arms to show it, flowers and jewels glinting."),
 'p37_mauvais_augure': ('b131', [R['mother']], DREAM + f"{MOTHER}, face suddenly cold and stern, close portrait; the warm colours drain to grey-blue around her; she warns that beautiful jewels bring misfortune."),
 'p38_froid': ('b132', [R['boy']], NIGHT + f"{BOY} kneels and closes the treasure box, sobbing; a great cold falls, frost crystals creep in from the edges of the image."),
 'p39_fievre': ('b153', [R['boy']], NIGHT + f"fever: {BOY} lies on a mattress in a dim room that tilts and swims, walls bending, colours melting in hot reds and sickly greens."),
 'p40_tambour': ('b155', [R['boy']], NIGHT + f"blurred neighbour women crowd around {BOY} lying feverish, his eyelids closing; above them a gigantic hourglass clay drum beats in the dark."),
}
I = {  # name: (beat, refs, text)
 'punaises_macro': ('b005', "Cracks in an old dark cedar ceiling beam: tiny bedbugs waking and crawling out of the splintered wood, a fly at the edge, warm light."),
 'chaux': ('b006', "A worn wooden bucket of white quicklime with a wet whitewash brush across it, chalky steam, an adult woman's hand gripping the brush."),
 'soufre_fume': ('b006', "A small clay dish of burning yellow sulphur on a tiled floor, thick white-yellow fumes curling up."),
 'petrole_bidon': ('b006', "An old dented tin petrol can tilted by an adult woman's hand, a thin stream sprinkling onto a floor crack."),
 'talisman_porte': ('b007', "An adult woman's hands pinning a small folded paper talisman wrapped in leather above a carved wooden door frame (no readable writing)."),
 'poudre_souffle': ('b007', "An adult woman's palm with a pinch of reddish powder being blown into a dark corner, a soft cloud of dust."),
 'poutre_survivants': ('b008', "High ceiling beam seen from below: a few bedbugs hiding deep in a crack of the painted cedar, safe out of reach."),
 'ablutions_mains': ('b014', "Small hands of several boys washing under the thin stream of a tiny zellige wall fountain in a school corner, water splashing."),
 'planche_10_15': ('b017', "A child's wooden writing slate (louh) covered in neat lines of brown ink calligraphy-like strokes (abstract, not readable), more lines than space, a reed pen beside it."),
 'baguette_cognassier': ('b022', "A thin quince-wood switch resting across an old man's knee on a straw mat, a fold of a white djellaba."),
 'soleil_matin': ('b023', "Morning: bright white sunlight falling on a child's hands holding a wooden slate, fresh and fervent."),
 'soleil_apresmidi': ('b023', "Afternoon: the same child's hands holding the slate idle, warm low orange light and long shadows from a window."),
 'haik_rouleau': ('b028', "A bolt of white cotton haik cloth partly unrolled on a low round wooden table, an adult man's weaver hand smoothing it."),
 'bassine_pieds': ('b052', "A copper basin of water, a small child's feet being washed, a woman's hands pouring from a jug."),
 'priere_copie': ('b052', "On a prayer mat: an adult man's hands and a small child's hands side by side in the same prayer gesture."),
 'doigt_levres': ('b052', "Close on a neighbour woman's finger raised to her lips under a headscarf edge, only the lips and finger visible, shh."),
 'coffre_claque': ('b071', "A painted wooden chest lid slamming shut, a puff of dust and the glint of a hidden cloth bundle inside."),
 'bijoux_ferblanc': ('b076', "A shop tray of cheap flat stamped jewels that look cut from tin, dull and lifeless under harsh light."),
 'bracelets_mains': ('b080', "An adult man's rough hands holding a pair of bracelets: one broad engraved gold bangle, one silver crescent-moon bangle, glowing."),
 'main_au_dessus': ('b082', "Above a sea of white turbans, a single raised hand holds up a gold bangle and a silver bangle, travelling over the heads."),
 'fruits_secs_pyramides': ('b099', "A dried-fruit stall: neat pyramids of dates, dried figs and almonds in baskets, a scoop, warm lantern light."),
}
out = {'_note': 'ep08 paintings + macro inserts: attach the style ref first, then the character refs (art/src/<name>.png)'}
for k, (b, refs, t) in P.items(): out[k] = {'beat': b, 'kind': 'P', 'refs': [STYLE] + refs, 'prompt': BASE + t}
for k, (b, t) in I.items(): out['i_' + k] = {'beat': b, 'kind': 'I', 'refs': [STYLE], 'prompt': BASE + INS + t}
os.makedirs(f'{ROOT}/art/ep08', exist_ok=True)
json.dump(out, open(f'{ROOT}/art/ep08/prompts.json', 'w'), ensure_ascii=False, indent=1)
# check every painting still / insert referenced in beats.json has a prompt
bs = json.load(open(f'{ROOT}/episodes/ep08/beats.json'))['beats']
need = {x['still'] for x in bs if x['mode'] == 'painting'} | {'i_' + n for x in bs for n, _ in x.get('ins') or []}
miss = need - set(out); extra = set(out) - need - {'_note'}
print(len(out) - 1, 'prompts; missing', sorted(miss), 'unused', sorted(extra))
keys = [k for k in out if k != '_note']
open(f'{ROOT}/out/codex/ep08_batch_a.txt', 'w').write('\n'.join(keys[::2]) + '\n')
open(f'{ROOT}/out/codex/ep08_batch_b.txt', 'w').write('\n'.join(keys[1::2]) + '\n')
