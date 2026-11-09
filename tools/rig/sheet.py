"""sheet.py KEY... -> out/rigqa/sheet_<key>.jpg: the bench stills (poses 0,1,3,5,6,7) cropped to the actor, labelled, one row."""
import sys, numpy as np
from PIL import Image, ImageDraw
P = [(0, 'stand'), (1, 'reach R'), (3, 'stool'), (5, 'kneel'), (6, 'relaxed hands'), (7, 'R fist + L point')]
BG = np.array([[0xb9, 0xab, 0x92], [0x9a, 0x8a, 0x70]])
for k in sys.argv[1:]:
    tiles = []
    for i, name in P:
        im = Image.open(f'out/rigqa/bench/{k}_{i}.jpg').convert('RGB'); a = np.asarray(im).astype(int)
        m = np.min([np.abs(a - c).sum(2) for c in BG], 0) > 40
        ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pad = 40; t = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
        t.thumbnail((10000, 640)); d = ImageDraw.Draw(t); d.rectangle((0, 0, t.width, 26), fill=(0, 0, 0)); d.text((6, 6), name, fill=(255, 255, 255))
        tiles.append(t)
    W = sum(t.width for t in tiles) + 8 * len(tiles); S = Image.new('RGB', (W, 640), (40, 40, 40)); x = 0
    for t in tiles: S.paste(t, (x, 640 - t.height)); x += t.width + 8
    S.save(f'out/rigqa/sheet_{k}.jpg', quality=88); print(k, S.size)
