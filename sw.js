const CACHE="workbench-v17";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","ref/shield-backs.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function keep(req,res){
  const url=new URL(req.url);
  if(res.ok&&(url.origin===location.origin||url.host.endsWith("fonts.googleapis.com")||url.host.endsWith("fonts.gstatic.com"))){
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy));
  }
  return res;
}
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||(url.origin===location.origin&&/\/(index\.html)?$/.test(url.pathname));
  if(isPage){
    // The app itself: always try the network first so updates show straight away; fall back to the saved copy offline.
    e.respondWith(fetch(req,{cache:"no-cache"}).then(res=>keep(req,res)).catch(()=>caches.match(req).then(h=>h||caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>keep(req,res)).catch(()=>caches.match("index.html"))));
});
