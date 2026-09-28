const CACHE='smart-hub-shell-v12';
const SHELL=['./','./index.html','./manifest.json','./app.js','./large-upload.js','./supabase-config.js','./smart-hub-logo.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE && k.startsWith('smart-hub-shell-')).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

async function patchedAppJs_(request){
  const cache=await caches.open(CACHE);
  const original=await fetch(request).catch(()=>cache.match(request));
  if(!original) return new Response('',{status:503});
  try{
    const patch=await cache.match(new URL('./large-upload.js',self.location.href).toString()) || await fetch('./large-upload.js');
    const source=await original.text()+'\n;\n'+await patch.text();
    const headers=new Headers(original.headers);
    headers.delete('content-length');
    return new Response(source,{status:original.status,statusText:original.statusText,headers});
  }catch(_){
    return original;
  }
}

async function patchedIndex_(request){
  const cache=await caches.open(CACHE);
  const original=await fetch(request).catch(()=>cache.match(request));
  if(!original) return new Response('SMART HUB offline.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  try{
    let html=await original.text();
    if(!html.includes('large-upload.js')){
      html=html.replace('</body>','<script src="./large-upload.js?v=12"></script></body>');
    }
    const headers=new Headers(original.headers);
    headers.delete('content-length');
    headers.set('Cache-Control','no-store');
    return new Response(html,{status:original.status,statusText:original.statusText,headers});
  }catch(_){
    return original;
  }
}

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || u.origin!==location.origin) return;

  // Always serve a fresh patched application shell. This guarantees that the
  // large-file uploader is actually loaded; a service worker cannot inject a
  // JavaScript file merely by placing it in the cache.
  if(e.request.mode==='navigate' || u.pathname.endsWith('/index.html')){
    e.respondWith(patchedIndex_(e.request));
    return;
  }

  // Keep app.js baseline intact but append the large-file patch at runtime.
  if(u.pathname.endsWith('/app.js')){
    e.respondWith(patchedAppJs_(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(cached=>cached || fetch(e.request).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return r;
      }).catch(()=>cached))
  );
});
