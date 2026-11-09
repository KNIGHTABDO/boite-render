#!/bin/bash
# bench every real rig in test/proto/rig.html (poses 0 stand,1 reach,3 stool,5 kneel,6 relaxed hands,7 fist+point) -> out/rigqa/bench/<key>_<i>.jpg
cd "$(dirname "$0")/../.."
for k in "$@"; do timeout 180 node tools/shot.mjs "test/proto/rig.html?a=$k&turn=25" out/rigqa/bench/$k.jpg 0,1,3,5,6,7 2>&1 | grep -c jpg | sed "s/^/$k /"; done
