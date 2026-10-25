"""Build data/hof_heights.bin and data/hof_heights.json from AWS terrain tiles.

Usage: python3 -I tools/make_heights.py <folder with t_<x>_<y>.png z12 tiles>
Tiles come from https://s3.amazonaws.com/elevation-tiles-prod/terrarium/12/<x>/<y>.png
Terrarium encoding: metres = R*256 + G + B/256 - 32768.
"""
import json, math, sys, os
import numpy as np
from PIL import Image

tiles_dir = sys.argv[1]
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
Z = 12
TX0, TY0, NT = 2182, 1382, 3          # 3 x 3 tiles
LAT0, LON0 = 50.3325, 11.8955         # box centre
HALF = 7500.0                          # half-size in metres (box is 15 x 15 km)
N = 600                                # samples per side -> 25 m spacing
R = 6371008.8

# stitch tiles
mosaic = np.zeros((NT * 256, NT * 256), dtype=np.float64)
for dx in range(NT):
    for dy in range(NT):
        im = np.asarray(Image.open(os.path.join(tiles_dir, f"t_{TX0+dx}_{TY0+dy}.png")).convert("RGB"), dtype=np.float64)
        h = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
        mosaic[dy*256:(dy+1)*256, dx*256:(dx+1)*256] = h

def to_pixel(lat, lon):
    n = 2 ** Z * 256
    px = (lon + 180) / 360 * n
    py = (1 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2 * n
    return px - TX0 * 256, py - TY0 * 256

step = 2 * HALF / N
xs = -HALF + step / 2 + step * np.arange(N)          # east, west to east
ys = HALF - step / 2 - step * np.arange(N)           # north, north to south
X, Y = np.meshgrid(xs, ys)
lat = LAT0 + np.degrees(Y / R)
lon = LON0 + np.degrees(X / (R * math.cos(math.radians(LAT0))))
px, py = to_pixel(lat, lon)
# bilinear sample (pixel centres sit at +0.5)
fx, fy = px - 0.5, py - 0.5
x0, y0 = np.floor(fx).astype(int), np.floor(fy).astype(int)
tx, ty = fx - x0, fy - y0
x0 = np.clip(x0, 0, mosaic.shape[1] - 2); y0 = np.clip(y0, 0, mosaic.shape[0] - 2)
h = (mosaic[y0, x0] * (1-tx) * (1-ty) + mosaic[y0, x0+1] * tx * (1-ty)
     + mosaic[y0+1, x0] * (1-tx) * ty + mosaic[y0+1, x0+1] * tx * ty)

base = math.floor(h.min())
q = np.round((h - base) * 10).astype("<u2")
assert q.max() < 65535
q.tofile(os.path.join(out_dir, "hof_heights.bin"))

lat_s, lat_n = LAT0 - math.degrees(HALF / R), LAT0 + math.degrees(HALF / R)
dlon = math.degrees(HALF / (R * math.cos(math.radians(LAT0))))
meta = {
  "name": "Hof Gap height grid",
  "file": "hof_heights.bin",
  "encoding": "uint16 little-endian, row-major, row 0 = north edge, column 0 = west edge",
  "width": N, "height": N,
  "sample_spacing_m": step,
  "metres_per_unit": 0.1,
  "base_m": base,
  "how_to_read": "height_m = base_m + value * metres_per_unit",
  "min_m": round(float(h.min()), 1), "max_m": round(float(h.max()), 1),
  "box": {"south": round(lat_s, 5), "north": round(lat_n, 5),
          "west": round(LON0 - dlon, 5), "east": round(LON0 + dlon, 5)},
  "centre": {"lat": LAT0, "lon": LON0},
  "local_metres": "x = east metres, y = north metres from the centre: x = R*cos(lat0)*dlon_rad, y = R*dlat_rad, R = 6371008.8 m. Box is x,y in [-7500, 7500]. Sample (col i, row j) is at x = -7500 + 12.5 + 25*i, y = 7500 - 12.5 - 25*j.",
  "source": "AWS Terrain Tiles (Terrarium PNG, zoom 12, about 24 m per pixel at this latitude), resampled to 25 m",
  "credit": "Terrain data from AWS Terrain Tiles. Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers. SRTM data courtesy of the U.S. Geological Survey."
}
with open(os.path.join(out_dir, "hof_heights.json"), "w") as f:
    json.dump(meta, f, indent=1)
print("min/max/mean", h.min(), h.max(), h.mean())
# Hof town centre sample
i = int((11.917 - (LON0 - dlon)) / (2*dlon) * N); j = int((lat_n - 50.317) / (lat_n - lat_s) * N)
print("Hof (50.317,11.917) col,row", i, j, "height", h[j, i])
