# Pixel statistics distinguish pre-existing raster variation from a new rendering change.
from pathlib import Path
from PIL import Image,ImageChops
import json
root=Path('out/e1');m=json.loads((root/'legacy-manifest.json').read_text())
decoded={s['file']:Image.open(root/s['file']).convert('RGBA') for s in m['samples']}
assert all(im.getchannel('A').getextrema()==(255,255) for im in decoded.values()),'Legacy frame alpha changed'
images={k:im.convert('RGB') for k,im in decoded.items()}
old=[s for s in m['samples'] if s['kind']=='before'];new=[s for s in m['samples'] if s['kind']=='after'];base=images[old[0]['file']]
def stats(d):
 h=d.histogram();mask=ImageChops.lighter(ImageChops.lighter(*d.split()[:2]),d.split()[2]);n=d.width*d.height
 return {'different_pixels':n-mask.histogram()[0],'mean_abs_255':sum((i%256)*v for i,v in enumerate(h))/(n*3),'max_channel_diff':max(v[1] for v in d.getextrema()),'bbox':d.getbbox()}
def diff(a,b):return stats(ImageChops.difference(a,b))
lo=base.copy();hi=base.copy()
for s in old:
 im=images[s['file']];lo=ImageChops.darker(lo,im);hi=ImageChops.lighter(hi,im)
self_diffs=[{'a':old[0]['file'],'b':s['file'],**diff(base,images[s['file']])} for s in old[1:]]
cross=[]
for s in new:
 im=images[s['file']];outside=ImageChops.lighter(ImageChops.subtract(lo,im),ImageChops.subtract(im,hi))
 cross.append({'a':old[0]['file'],'b':s['file'],**diff(base,im),'outside_baseline_envelope':stats(outside)})
pixel_nondeterministic=any(x['different_pixels'] for x in self_diffs);nondeterministic=len({s['sha256'] for s in old})>1;regression=any(x['outside_baseline_envelope']['different_pixels'] for x in cross)
result={**m,'baseline_nondeterministic':nondeterministic,'baseline_pixel_nondeterministic':pixel_nondeterministic,'byte_identical':len({s['sha256'] for s in m['samples']})==1,'baseline_repeats':self_diffs,'before_after':cross,'regression':regression,'status':'FAIL' if regression else 'PASS: baseline variation only' if nondeterministic else 'PASS: byte identical'}
(root/'legacy-proof.json').write_text(json.dumps(result,indent=2)+'\n');ImageChops.difference(base,images[new[0]['file']]).save(root/'legacy-diff.png')
print(json.dumps({k:result[k] for k in ['baseline_nondeterministic','byte_identical','regression','status']}));assert not regression,'Current pixels exceeded the observed pre-E1 envelope'
