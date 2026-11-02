/* service worker: deixa o site abrir sem internet e mais rápido.
   - páginas e scripts do site: rede primeiro, cópia guardada se cair a internet
   - vídeos, imagens e fontes: cópia guardada primeiro (atualiza por trás)
   - Firestore e ntfy nunca passam por aqui (são dados ao vivo) */
const V='vila-v6';
const BASE=['./','index.html','vila.js','vila.css','vila-herois.js','vila-cenas.js','manifest.webmanifest','icons/icon-192.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(/firestore|googleapis\.com\/google\.firestore|ntfy\.sh|imgbb|identitytoolkit/.test(u.href)) return;
  const mesmo=u.origin===location.origin;
  const estatico=/\.(mp4|webp|png|jpg|jpeg|svg|woff2?)$/i.test(u.pathname)||/fonts\.(googleapis|gstatic)\.com/.test(u.host)||/gstatic\.com\/firebasejs/.test(u.href);
  if(r.headers.get('range')) return; // vídeo pedindo pedaço: deixa o navegador cuidar
  if(estatico){
    e.respondWith(caches.open(V).then(async c=>{ const h=await c.match(r); const rede=fetch(r).then(res=>{ if(res&&(res.ok||res.type==='opaque')) c.put(r,res.clone()); return res; }).catch(()=>h); return h||rede; }));
    return;
  }
  if(mesmo){
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; }).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
  }
});
