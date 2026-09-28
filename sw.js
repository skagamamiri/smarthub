const CACHE='smart-hub-shell-v11';
const SHELL=['./','./index.html','./manifest.json','./app.js','./large-upload.js','./supabase-config.js','./smart-hub-logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE && k.startsWith('smart-hub-shell-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || u.origin!==location.origin) return;

  // Append the large-file patch after app.js without changing the locked app.js baseline.
  if(u.pathname.endsWith('/app.js')){
    e.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const original=await cache.match(e.request) || await fetch(e.request);
      try{
        const patch=await cache.match('./large-upload.js') || await fetch('./large-upload.js');
        const source=await original.text()+'\n;\n'+await patch.text();
        return new Response(source,{status:original.status,statusText:original.statusText,headers:new Headers(original.headers)});
      }catch(_){return original;}
    })());
    return;
  }

  e.respondWith(caches.match(e.request).then(cached=>cached || fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>cached)));
});
