const V='dex51-pwa-44-hands';
const MPFILES=['./mp/hands.js','./mp/hands_solution_packed_assets_loader.js','./mp/hands_solution_packed_assets.data','./mp/hands_solution_simd_wasm_bin.js','./mp/hands_solution_simd_wasm_bin.wasm','./mp/hands_solution_simd_wasm_bin.data','./mp/hands.binarypb','./mp/hand_landmark_lite.tflite'];
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./layer.js','./dex-work-bridge.js',
 './work.html','./wdea-hu-voice.js','./wdea-ai-command-bridge.css','./wdea-ai-command-bridge.js','./wdea-ai.css','./wdea-ai.js','./wdea-dex-link.js','./wdea-drive-voice-adapter.js','./wdea-robot-blue.png'].concat(MPFILES);
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=='dex-hands-1').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;
 if(r.method==='GET'&&new URL(r.url).hostname==='cdn.jsdelivr.net'){e.respondWith(caches.open('dex-hands-1').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone()).catch(()=>{});return res}))));return}
 if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))))});
