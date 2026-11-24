const C='planb-8.0.2',F=['./','index.html','content.js','content5.js','content7.js','pvgis7.js','fichas.js','habil.js','rne.js','lib/qrcode.js','lib/jsQR.js','sync.js','app.js','app5.js','app6.js','app7.js','content8.js','app8.js','content801.js','app801.js','content802.js','app802.js','manifest.webmanifest','icon-180.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','splash.png','fonts/Jost.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(e.request,{cache:'no-store'}));return}
 if(e.request.mode==='navigate'){e.respondWith(caches.match('index.html').then(r=>r||fetch(e.request)));return}
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
