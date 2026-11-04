# Local PIL only. Contact sheets keep the full canvas visible so edge stretch cannot be hidden.
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,sys,os
if os.environ.get("GITHUB_ACTIONS")!="true": raise SystemExit("E1 sheets render only in GitHub Actions.")
root=Path(__file__).resolve().parents[1];out=root/'out/e1';cal=json.loads((root/'episodes/ep07/cal.json').read_text())
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
names=['barbier','msid_feerie','msid_facade']; selected=([sys.argv[1]] if len(sys.argv)>1 and sys.argv[1] in names else [] if len(sys.argv)>1 else names)
for name in selected:
 e=cal[name]['move_limits'];labels=[(-1,'drawPlate / 1.08 cover'),(0,'calibration / 1.08 cover'),(1,f'push {e["dolly"]/2:g} m'),(2,f'push {e["dolly"]:g} m'),(3,f'orbit -{e["orbit"]:g} deg'),(4,f'orbit +{e["orbit"]:g} deg'),(5,'crane +0.30 m / REJECTED')]
 sheet=Image.new('RGB',(1440,3*300),'#222');d=ImageDraw.Draw(sheet)
 for j,(i,label) in enumerate(labels):
  p=out/f'{name}_{i}.png'
  if p.exists():
   im=Image.open(p).convert('RGB').resize((480,270),Image.Resampling.LANCZOS);x=j%3*480;y=j//3*300;sheet.paste(im,(x,y+30));d.text((x+8,y+6),label,fill='white',font=font)
 sheet.save(out/f'{name}-sheet.jpg',quality=90)
 stress=['push 1 m','push 1.2 m','push 1.5 m','push 2 m','orbit -10 deg','orbit +10 deg','orbit +15 deg','crane +0.1 m','crane +0.3 m','truck +0.1 m','truck +0.3 m']
 sheet=Image.new('RGB',(1440,4*300),'#222');d=ImageDraw.Draw(sheet)
 for j,label in enumerate(stress):
  p=out/f'{name}-stress_{j}.jpg'
  if p.exists():
   x=j%3*480;y=j//3*300;sheet.paste(Image.open(p).resize((480,270)),(x,y+30));d.text((x+8,y+6),label,fill='white',font=font)
 sheet.save(out/f'{name}-stress-sheet.jpg',quality=90)
files=sorted((out/'calibration').glob('*.jpg'))
for k in range(0,len(files),9):
 sheet=Image.new('RGB',(1280,3*270),'#222');d=ImageDraw.Draw(sheet)
 for j,p in enumerate(files[k:k+9]):
  im=Image.open(p).resize((426,240));x=j%3*426;y=j//3*270;sheet.paste(im,(x,y+30));d.text((x+6,y+5),p.stem,fill='white',font=font)
 sheet.save(out/f'calibration-sheet-{k//9+1}.jpg',quality=90)
frames=sorted((out/'barbier-push').glob('frame_???.jpg'))
if len(frames)==36:
 first=Image.open(frames[0]).convert('RGB').quantize(colors=256)
 images=[first]+[Image.open(p).convert('RGB').quantize(palette=first) for p in frames[1:]]
 images[0].save(out/'barbier-push.gif',save_all=True,append_images=images[1:],duration=[80,80,90]*12,loop=0,disposal=2,optimize=False)
