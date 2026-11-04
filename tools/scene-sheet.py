# python3 tools/scene-sheet.py <dir>: contact sheet of <dir>/f_<t>.jpg labelled with scene-local seconds -> <dir>/../<id>-sheet.jpg
import sys, json, os
from PIL import Image, ImageDraw
d = sys.argv[1]; info = json.load(open(os.path.join(d, 'times.json')))
ims = []
for t in info['times']:
    f = os.path.join(d, f'f_{t}.jpg')
    if not os.path.exists(f): f = os.path.join(d, f'f_{t:g}.jpg')
    if os.path.exists(f): ims.append((Image.open(f).convert('RGB').resize((640, 360)), t - info['start']))
cols = 3; rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (640 * cols, 360 * rows), (20, 20, 20))
for i, (im, lt) in enumerate(ims):
    dr = ImageDraw.Draw(im); dr.rectangle([0, 0, 92, 22], fill=(0, 0, 0)); dr.text((4, 5), f"{info['id'][:3]} {lt:.1f}", fill=(255, 230, 0))
    sh.paste(im, ((i % cols) * 640, (i // cols) * 360))
sh.save(os.path.join(os.path.dirname(d.rstrip('/')), info['id'] + '-sheet.jpg'), quality=74); print('sheet', len(ims))
