"""Builds data/bridge_heights.bin + data/bridge_map.json: a rotated crop of the real Hof elevation around a Saale reach.
World units: 1 unit = 12.5 m. World +x runs UPSTREAM along the river (SSE), +z points WSW (your bank). North is -z-ish. No mirror.
Run: python3 tools/make_bridge_map.py"""
import numpy as np, json, heapq
from scipy.ndimage import map_coordinates, gaussian_filter1d
a=np.fromfile('data/hof_heights.bin',dtype='<u2').reshape(600,600)*0.1+449
H=W=600
# fill depressions + follow steepest descent downstream from the start cell
filled=a.copy(); vis=np.zeros_like(a,bool); pq=[]
for i in range(H):
    for j in (0,W-1): heapq.heappush(pq,(a[i,j],i,j)); vis[i,j]=True
for j in range(W):
    for i in (0,H-1):
        if not vis[i,j]: heapq.heappush(pq,(a[i,j],i,j)); vis[i,j]=True
nb=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
while pq:
    h,i,j=heapq.heappop(pq)
    for di,dj in nb:
        y,x=i+di,j+dj
        if 0<=y<H and 0<=x<W and not vis[y,x]:
            vis[y,x]=True; filled[y,x]=max(a[y,x],h+1e-3); heapq.heappush(pq,(filled[y,x],y,x))
acc=np.load('/tmp/acc.npy') if False else None
def down(i,j):
    best=None;bd=0
    for di,dj in nb:
        y,x=i+di,j+dj
        if 0<=y<H and 0<=x<W:
            d=(filled[i,j]-filled[y,x])/np.hypot(di,dj)
            if d>bd: bd=d;best=(y,x)
    return best
# start in the river south of the reach: climb to the main channel by snapping to the local lowest cell
i,j=397,396
win=a[i-6:i+7,j-6:j+7]; k=np.unravel_index(win.argmin(),win.shape); i,j=i-6+k[0],j-6+k[1]
path=[(i,j)]
while len(path)<400:
    n=down(*path[-1])
    if not n or n[0]<250: break
    path.append(n)
    if n[0]<=262: break
P=np.array(path,float)                      # (row,col)
E=-7500+12.5+25*P[:,1]; N=7500-12.5-25*P[:,0]     # metres east / north of the data centre
E=gaussian_filter1d(E,6,mode='nearest'); N=gaussian_filter1d(N,6,mode='nearest')
# overall river direction from the smoothed path (flow direction), world +x = upstream = reverse of flow
d=np.array([E[0]-E[-1],N[0]-N[-1]]); d/=np.hypot(*d)   # points upstream (towards the start, SSE)
right=np.array([d[1],-d[0]])                            # clockwise 90 degrees from d (viewed with north up)
mid=len(E)//2; O=np.array([E[mid],N[mid]])
U=12.5
def to_world(e,n): v=np.array([e,n])-O; return (v@d)/U,(v@right)/U
wx,wz=zip(*[to_world(e,n) for e,n in zip(E,N)])
wx=np.array(wx); wz=np.array(wz)
print('path cells',len(path),'world x range',wx.min(),wx.max(),'z range',wz.min(),wz.max())
# regular world grid, 2 units per sample
R=280; S=2.0; n=int(2*R/S)+1
gx=np.linspace(-R,R,n); gz=np.linspace(-R,R,n)
GX,GZ=np.meshgrid(gx,gz)                                  # rows = z, cols = x
e=O[0]+(GX*d[0]+GZ*right[0])*U; nn=O[1]+(GX*d[1]+GZ*right[1])*U
col=(e+7500-12.5)/25; row=(7500-12.5-nn)/25
hm=map_coordinates(a,[row,col],order=3,mode='nearest')
print('height range m',hm.min(),hm.max())
base=float(np.floor(hm.min()))
q=np.round((hm-base)*10).astype('<u2')
q.tofile('data/bridge_heights.bin')
# river polyline in world units, resampled every 2 units along its length, ordered by increasing x
order=np.argsort(wx); px=wx[order]; pz=wz[order]
xs=np.arange(max(px.min(),-R+10),min(px.max(),R-10),2.0); zs=np.interp(xs,px,pz)
zs=gaussian_filter1d(zs,3,mode='nearest')
json.dump({"name":"Bridge map crop (Hof Saale reach), rotated","file":"bridge_heights.bin","encoding":"uint16 little-endian, row-major, row 0 = world z=-R, col 0 = world x=-R","size":n,"spacing_units":S,"half_extent_units":R,"metres_per_unit":U,"base_m":base,"metres_per_value":0.1,
 "frame":"world +x runs upstream along the river (towards SSE), world +z points WSW (your bank), no mirroring. world origin = river point at path middle.",
 "centre_data_metres_east_north":[float(O[0]),float(O[1])],"axis_x_en":[float(d[0]),float(d[1])],"axis_z_en":[float(right[0]),float(right[1])],
 "river":[[round(float(x),2),round(float(z),2)] for x,z in zip(xs,zs)],
 "credit":"Terrain data from AWS Terrain Tiles (Copernicus EU-DEM, SRTM). River line traced from the elevation by code."},open('data/bridge_map.json','w'))
print('river pts',len(xs),'z of river at x=0',np.interp(0,xs,zs),'base',base,'size',n)
