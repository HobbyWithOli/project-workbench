const CACHE="workbench-v14";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","ref/shield-backs.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    const url=new URL(e.request.url);
    if(res.ok&&(url.origin===location.origin||url.host.endsWith("fonts.googleapis.com")||url.host.endsWith("fonts.gstatic.com"))){
      const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return res;}).catch(()=>caches.match("index.html"))));
});
