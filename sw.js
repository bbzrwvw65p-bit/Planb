const C='planb-v5-1',F=['./','index.html','content.js','content5.js','rne.js','lib/qrcode.js','lib/jsQR.js','sync.js','app.js','app5.js','manifest.webmanifest','icon-180.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','splash.png','fonts/Jost.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){e.respondWith(caches.match('index.html').then(r=>r||fetch(e.request)));return}
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
