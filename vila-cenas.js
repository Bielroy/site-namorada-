/* =====================================================================
   CENAS ANIMADAS DA HISTÓRIA — Gabrix e Natalix
   Um palco em canvas (360×260) com atores, falas, legendas e efeitos.
   Cada capítulo tem um roteiro curto; toque pra adiantar, "pular" encerra.
   Depende de: VilaArte (vila.js), alienSVG/ALIEN_BOX (vila-herois.js)
   ===================================================================== */
(function(){
'use strict';
const SW=360, SH=260, INK='#4a3a2e';
let ov=null, cv=null, ctx=null, esc=1, ox=0, oy=0, DPRc=1, raf=null, cena=null, tempo=0, last=0;

/* ---------------- sprites (SVG → imagem, com pré-carregamento) ---------------- */
const IMG=new Map();
function spr(key,box,build){
  let s=IMG.get(key); if(s) return s;
  const [x,y,w,h]=box, R=3;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${Math.ceil(w*R)}" height="${Math.ceil(h*R)}">${build()}</svg>`;
  const img=new Image(); s={img,x,y,w,h,ok:false}; s.p=new Promise(r=>{ img.onload=()=>{ s.ok=true; r(); }; img.onerror=()=>r(); });
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); IMG.set(key,s); return s;
}
const BOXC=[-28,-62,56,68];
function sprAtor(a){
  const V=window.VilaArte;
  if(a.heroi) return spr(`h${a.heroi}${a.disf?1:0}${a.fech?'z':''}`,window.ALIEN_BOX,()=>window.alienSVG(a.heroi,a.disf,a.fech));
  if(a.gato){ const o=a.gato; return spr('g'+JSON.stringify(o),BOXC,()=>V.gatoSVG(o,1)); }
  if(a.bld) return spr(`b${a.bld}${a.f||2}${a.n?1:0}`,a.bld==='balao'||a.bld==='casinha'?[-104,-170,200,190]:[-104,-126,200,160],()=>V.CONSTRUCAO[a.bld](a.f==null?2:a.f,!!a.n));
  if(a.castelo) return spr('cast',[-150,-200,300,270],()=>V.casteloSVG(5,true));
  if(a.svg) return spr(a.svgKey,a.box,()=>a.svg);
  return null;
}
const NAVE=`<ellipse cx="0" cy="0" rx="26" ry="9" fill="#c8ccd2" stroke="${INK}" stroke-width="2"/><path d="M-13 -2 C-13 -16 13 -16 13 -2 Z" fill="#cfe9b0" stroke="${INK}" stroke-width="2"/><circle cx="-14" cy="2" r="2" fill="#f2c14e"/><circle cx="0" cy="4" r="2" fill="#f2c14e"/><circle cx="14" cy="2" r="2" fill="#f2c14e"/>`;
const MURAL=`<path d="M-30 0 V-56 M30 0 V-56" stroke="#a07a55" stroke-width="5"/><rect x="-36" y="-64" width="72" height="44" rx="3" fill="#c99a6b" stroke="${INK}" stroke-width="2"/><rect x="-30" y="-58" width="26" height="18" fill="#d3ecf2" stroke="${INK}" stroke-width="1.2" transform="rotate(-5 -17 -49)"/><path d="M-28 -46 q6 -4 12 0 t12 0" stroke="#86afcf" stroke-width="2" fill="none"/><rect x="2" y="-58" width="26" height="14" fill="#fffaf0" stroke="${INK}" stroke-width="1.2"/><path d="M5 -53 h18 M5 -49 h12" stroke="#c2ac88" stroke-width="1.4"/><rect x="-10" y="-38" width="22" height="12" fill="#fbe3ea" stroke="${INK}" stroke-width="1.2" transform="rotate(3 1 -32)"/><path d="M-40 -64 L0 -76 L40 -64" fill="#9b4a58" stroke="${INK}" stroke-width="2"/>`;
const BUQUE=`<path d="M0 14 L-5 0 M0 14 L0 -2 M0 14 L5 0" stroke="#5f824b" stroke-width="2"/><path d="M-7 4 L0 16 L7 4 Z" fill="#f5efe3" stroke="${INK}" stroke-width="1.4"/><circle cx="-5" cy="-3" r="4.4" fill="#e3798a" stroke="${INK}" stroke-width="1.2"/><circle cx="5" cy="-3" r="4.4" fill="#f2c14e" stroke="${INK}" stroke-width="1.2"/><circle cx="0" cy="-8" r="4.4" fill="#f2a7b8" stroke="${INK}" stroke-width="1.2"/>`;
const CARTA=`<rect x="-9" y="-6" width="18" height="12" rx="2" fill="#fffaf0" stroke="${INK}" stroke-width="1.4"/><path d="M-8 -5 L0 1 L8 -5" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="0" cy="1" r="2.2" fill="#e3798a"/>`;
const PRATO=`<ellipse cx="0" cy="0" rx="12" ry="4" fill="#fbf3e3" stroke="${INK}" stroke-width="1.4"/><path d="M-8 -1 L8 -6 L9 -1 Z" fill="#fff4dc" stroke="${INK}" stroke-width="1"/><circle cx="2" cy="-6" r="2" fill="#c2185b"/>`;

/* ---------------- gatos coadjuvantes ---------------- */
const G={
  nuvem:{cor:'#fffaf3',det:'#ecd6c2'}, toco:{cor:'#f3dcb8',det:'#d3a878',xadrez:1},
  felco:{cor:'#f4a35c',det:'#d9793a',listras:1,bufao:1}, lumi:{cor:'#ddd5ec',det:'#a99cc9',listras:1,oculos:1},
  cereja:{cor:'#f7dfe3',det:'#e8a9b6',avental:'#c25a6c'}, cometa:{cor:'#4a4f6e',det:'#33374f',listras:1},
  rainha:{cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1}, rainhaAnt:{cor:'#fffdf8',det:'#efe2d4',capa:1,antenas:1},
  dengo:{cor:'#fbe9d0',det:'#e8bf8f',listras:1}, pacoca:{cor:'#f1d6ae',det:'#c9a072',listras:1}
};

/* ---------------- fundos ---------------- */
const estrelas=[...Array(46)].map((_,i)=>({x:(i*97)%SW,y:(i*53)%150,r:.6+((i*7)%10)/10,f:i}));
function ceuNoite(c,cor1,cor2){ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,cor1||'#1f1d3d'); g.addColorStop(1,cor2||'#3d3a6b'); c.fillStyle=g; c.fillRect(0,0,SW,SH);
  for(const s of estrelas){ c.globalAlpha=.5+.5*Math.sin(tempo*2+s.f); c.fillStyle='#fff6c8'; c.beginPath(); c.arc(s.x,s.y,s.r,0,6.283); c.fill(); } c.globalAlpha=1; }
function chao(c,cor,y){ c.fillStyle=cor; c.beginPath(); c.moveTo(0,y); for(let x=0;x<=SW;x+=20) c.quadraticCurveTo(x+10,y-4,x+20,y); c.lineTo(SW,SH); c.lineTo(0,SH); c.fill(); }
function arvores(c,cor,y,n){ c.fillStyle=cor; for(let i=0;i<n;i++){ const x=(i+.5)*SW/n+Math.sin(i*3)*8, h=40+((i*13)%20); c.beginPath(); c.arc(x,y-h,22+((i*7)%8),0,6.283); c.fill(); c.fillRect(x-3,y-h,6,h); } }
function lua(c,x,y,r,fase){ c.fillStyle='#f7e9b0'; c.beginPath(); c.arc(x,y,r,0,6.283); c.fill(); if(fase<1){ c.fillStyle='#2a2850'; c.beginPath(); c.arc(x+r*2*(fase),y,r*1.02,0,6.283); c.fill(); } }
function lampioes(c,y){ c.strokeStyle='rgba(74,58,46,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(0,y); for(let x=0;x<=SW;x+=30) c.quadraticCurveTo(x+15,y+12,x+30,y); c.stroke();
  for(let x=15;x<SW;x+=30){ c.globalAlpha=.85+.15*Math.sin(tempo*3+x); c.fillStyle=['#ffd36b','#f2a7b8','#9fd6ff'][(x/30|0)%3]; c.beginPath(); c.arc(x,y+7,4,0,6.283); c.fill(); } c.globalAlpha=1; }
const FUNDO={
  noite:c=>{ ceuNoite(c); arvores(c,'#2c3f2e',196,8); chao(c,'#34513a',196); },
  dia:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#cfe6ef'); g.addColorStop(1,'#f5efe3'); c.fillStyle=g; c.fillRect(0,0,SW,SH); arvores(c,'#9cc27c',190,7); chao(c,'#b7cf93',190); c.fillStyle='#ead6ad'; c.beginPath(); c.ellipse(SW/2,222,150,26,0,0,6.283); c.fill(); },
  colina:c=>{ ceuNoite(c,'#1b1a36','#3a3766'); lua(c,280,58,22,1); c.fillStyle='#2f4a35'; c.beginPath(); c.moveTo(0,210); c.quadraticCurveTo(180,150,360,210); c.lineTo(360,260); c.lineTo(0,260); c.fill(); },
  luas:c=>{ ceuNoite(c,'#1b1a36','#3a3766'); const f=(tempo*.55)%1; lua(c,180,62,20,f<.5?f*2:2-f*2); c.fillStyle='#2f4a35'; c.beginPath(); c.moveTo(0,206); c.quadraticCurveTo(180,180,360,206); c.lineTo(360,260); c.lineTo(0,260); c.fill(); },
  feira:c=>{ ceuNoite(c,'#2b2550','#7a4e6e'); arvores(c,'#3a4a3a',200,9); chao(c,'#5c6b48',200); lampioes(c,40); },
  cinema:c=>{ c.fillStyle='#17142a'; c.fillRect(0,0,SW,SH); c.fillStyle='#f3f1ea'; c.fillRect(40,22,280,128); const k=Math.floor(tempo*1.3)%4, cs=[['#ff6fa8','#6fd6ff'],['#ffd36b','#ff6fa8'],['#6fd6ff','#b9dc4c'],['#f2a7b8','#ffd36b']][k];
    c.fillStyle='#2b2440'; c.fillRect(46,28,268,116); c.globalAlpha=.8; c.fillStyle=cs[0]; c.fillRect(60+(tempo*30)%120,40,60,80); c.fillStyle=cs[1]; c.fillRect(200,56+Math.sin(tempo*2)*8,70,56); c.globalAlpha=.18+Math.random()*.06; c.fillStyle='#fff'; c.fillRect(46,28,268,116); c.globalAlpha=1;
    c.fillStyle='#ffd36b'; c.font='700 11px Fredoka, sans-serif'; c.textAlign='center'; c.fillText('AMORES EXPRESSOS',180,140); c.fillStyle='#3a2444'; c.fillRect(0,206,SW,54); c.fillStyle='#c25a6c'; for(let x=20;x<SW;x+=48){ c.fillRect(x,214,40,10); } },
  cinemaVazio:c=>{ c.fillStyle='#17142a'; c.fillRect(0,0,SW,SH); c.fillStyle='#f3f1ea'; c.fillRect(40,22,280,128); c.fillStyle='#fffaf0'; c.fillRect(46,28,268,116); c.fillStyle='#3a2444'; c.fillRect(0,206,SW,54); c.fillStyle='#c25a6c'; for(let x=20;x<SW;x+=48){ c.fillRect(x,214,40,10); }
    c.globalAlpha=.12+.04*Math.sin(tempo*9); c.fillStyle='#fff6c8'; c.beginPath(); c.moveTo(180,250); c.lineTo(46,28); c.lineTo(314,28); c.closePath(); c.fill(); c.globalAlpha=1; },
  rua:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#4f5a72'); g.addColorStop(1,'#8a8fa0'); c.fillStyle=g; c.fillRect(0,0,SW,SH); arvores(c,'#4d6450',200,7); chao(c,'#6b7a68',200); c.fillStyle='rgba(180,200,220,.35)'; for(let i=0;i<5;i++){ c.beginPath(); c.ellipse(40+i*72,230,26,4,0,0,6.283); c.fill(); } },
  teatro:c=>{ c.fillStyle='#1d1626'; c.fillRect(0,0,SW,SH); c.fillStyle='#6b2a3a'; c.fillRect(0,0,40,210); c.fillRect(320,0,40,210); c.fillStyle='#fff3d6'; c.fillRect(50,24,260,140);
    c.fillStyle='#2b2230'; c.beginPath(); c.arc(90,164,26,Math.PI,0); c.fill(); c.beginPath(); c.arc(270,164,20,Math.PI,0); c.fill(); c.fillStyle='#3a2a34'; c.fillRect(0,206,SW,54); },
  ceu:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#9fd0ec'); g.addColorStop(1,'#fbe3ea'); c.fillStyle=g; c.fillRect(0,0,SW,SH);
    c.fillStyle='rgba(255,255,255,.9)'; for(let i=0;i<6;i++){ const x=((i*90-tempo*24)%(SW+120)+SW+120)%(SW+120)-60, y=40+i*34; c.beginPath(); c.ellipse(x,y,38,12,0,0,6.283); c.ellipse(x+20,y-6,24,10,0,0,6.283); c.fill(); }
    c.fillStyle='#9cc27c'; c.beginPath(); c.moveTo(0,250); c.quadraticCurveTo(90,232,180,248); c.quadraticCurveTo(270,236,360,250); c.lineTo(360,260); c.lineTo(0,260); c.fill(); },
  biblio:c=>{ c.fillStyle='#e9d9bd'; c.fillRect(0,0,SW,SH); const cores=['#e3798a','#86afcf','#f2c14e','#86a86b','#a07bb7','#c99a6b'];
    for(let r=0;r<4;r++){ c.fillStyle='#a07a55'; c.fillRect(10,24+r*44,340,6); for(let i=0;i<34;i++){ c.fillStyle=cores[(i*5+r*3)%6]; const h=26+((i*7+r)%10); c.fillRect(14+i*10,30+r*44-h+38,8,h-6); } }
    c.fillStyle='#c99a6b'; c.fillRect(0,206,SW,54); c.fillStyle='rgba(255,236,170,.25)'; c.beginPath(); c.arc(180,120,120,0,6.283); c.fill(); },
  cozinha:c=>{ c.fillStyle='#f3e6d2'; c.fillRect(0,0,SW,SH); c.fillStyle='#e8d3b4'; for(let x=0;x<SW;x+=24) for(let y=0;y<110;y+=24) c.fillRect(x+1,y+1,22,22);
    c.fillStyle='#c99a6b'; c.fillRect(0,176,SW,30); c.fillStyle='#4a4545'; c.beginPath(); c.moveTo(130,176); c.lineTo(136,150); c.lineTo(194,150); c.lineTo(200,176); c.fill(); c.fillStyle='#f4a35c'; c.fillRect(134,146,62,6); c.fillStyle='#b98a5e'; c.fillRect(0,206,SW,54); },
  nascer:c=>{ const k=Math.min(1,(cena?cena.t:0)/14); const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,k<.5?'#3d3a6b':'#f6b98f'); g.addColorStop(1,k<.5?'#c97a8a':'#ffe7b0'); c.fillStyle=g; c.fillRect(0,0,SW,SH);
    c.fillStyle='#ffd36b'; c.beginPath(); c.arc(180,210-k*110,30,0,6.283); c.fill(); c.fillStyle='#86a86b'; c.beginPath(); c.moveTo(0,200); c.quadraticCurveTo(180,176,360,200); c.lineTo(360,260); c.lineTo(0,260); c.fill(); },
  observ:c=>{ ceuNoite(c,'#141433','#2f2f63'); c.fillStyle='rgba(185,220,76,'+(.4+.4*Math.sin(tempo*6))+')'; c.beginPath(); c.arc(300,40,4+2*Math.sin(tempo*6),0,6.283); c.fill(); chao(c,'#2f4a35',204); },
  casa:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#f6c9a8'); g.addColorStop(1,'#f5efe3'); c.fillStyle=g; c.fillRect(0,0,SW,SH); arvores(c,'#9cc27c',204,6); chao(c,'#b7cf93',204); },
  preto:c=>{ c.fillStyle='#17142a'; c.fillRect(0,0,SW,SH); }
};

/* ---------------- efeitos ---------------- */
let chuva=[], coracoes=[], puffs=[], flash=0, confete=[];
function efeitoChuva(on){ chuva=on?[...Array(80)].map(()=>({x:Math.random()*SW,y:Math.random()*SH,v:260+Math.random()*120})):[]; }
function burst(x,y,n,conf){ for(let i=0;i<n;i++){ const a=Math.random()*6.283, v=30+Math.random()*60; (conf?confete:coracoes).push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,cor:['#e3798a','#f2c14e','#86afcf','#b9dc4c','#f2a7b8'][i%5],r:Math.random()*6}); } }
function coracao(c,x,y,s){ c.beginPath(); c.moveTo(x,y+s*.35); c.bezierCurveTo(x-s,y-s*.3,x-s*.5,y-s,x,y-s*.45); c.bezierCurveTo(x+s*.5,y-s,x+s,y-s*.3,x,y+s*.35); c.fill(); }

/* ---------------- roteiros ---------------- */
// p = perfil de quem está jogando ('g' ou 'n'); o = o outro
function roteiro(id,p){
  const o=p==='g'?'n':'g', nome=q=>q==='g'?'Gabrix':'Natalix';
  const R={
  queda:[
    {bg:'noite'},
    {nave:1,x0:-30,y0:20,x1:180,y1:196,d:2.2},
    {fx:'flash'},{fx:'puff',x:180,y:190,n:14},
    {add:p,heroi:p,disf:false,x:180,y:204,s:1.5},
    {diz:p,txt:'onde... eu tô?',d:2},
    {leg:`${nome(p)}, da Academia Estelar de Veluma, caiu numa floresta cheia de árvores fofas.`,d:3.4},
    {diz:p,txt:'ninguém aqui pode saber o que eu sou.',d:2.4},
    {set:p,disf:true},
    {diz:p,txt:p==='g'?'pronto. um gato comum... de óculos. ninguém desconfia, né? pode não?':'de longe pareço uma gata normal. de perto... melhor ninguém chegar perto.',d:3.4}
  ],
  disfarce:[
    {bg:'dia'},
    {add:'nuvem',gato:G.nuvem,x:80,y:214,s:1.3},{add:'toco',gato:G.toco,x:280,y:214,s:1.3,dir:-1},
    {add:p,heroi:p,disf:true,x:180,y:220,s:1.4},
    {diz:p,txt:p==='g'?'e aí o peixe disse: "tô nadando em dívidas"':'organizei as caixas por cor, viu?',d:2.4},
    {junto:[{pulo:'nuvem'},{pulo:'toco'},{diz:'nuvem',txt:'hahaha!',d:1.6}]},
    {leg:'todo mundo gosta do gato engraçado de gorro... mas ninguém conhece quem está embaixo dele.',d:3.4},
    {bg:'colina'},{tira:'nuvem'},{tira:'toco'},{mov:p,x:150,y:206,d:.01},
    {diz:p,txt:'às vezes dá vontade de ir embora. só não sei pra onde.',d:3.2}
  ],
  mural:[
    {bg:'dia'},
    {add:'mural',svg:MURAL,svgKey:'mural',box:[-44,-80,88,84],x:180,y:208,s:1.5},
    {add:'g',heroi:'g',disf:true,x:-30,y:226,s:1.25},
    {mov:'g',x:120,y:226,d:1.6},
    {diz:'g',txt:'"essas ondas são do tamanho do meu cabelo de manhã"',d:2.8},
    {mov:'g',x:-40,y:226,d:1.4},
    {leg:'no dia seguinte...',d:1.6},
    {add:'n',heroi:'n',disf:true,x:400,y:226,s:1.25,dir:-1},
    {mov:'n',x:240,y:226,d:1.6},
    {pulo:'n'},{diz:'n',txt:'hahahaha besta',d:2.2},
    {leg:'nenhum dos dois sabia quem tinha escrito. ainda.',d:2.8}
  ],
  feira:[
    {bg:'feira'},
    {add:'barraca',bld:'padaria',f:2,n:1,x:180,y:190,s:.95},
    {add:'felco',gato:G.felco,x:180,y:214,s:1.3},
    {fx:'malabares',on:1},
    {diz:'felco',txt:'boa noite, viajantes! preparem a barriga pra rir!',d:2.4},
    {add:'g',heroi:'g',disf:true,x:-30,y:232,s:1.3},{add:'n',heroi:'n',disf:true,x:390,y:232,s:1.3,dir:-1},
    {junto:[{mov:'g',x:96,y:232,d:1.6},{mov:'n',x:264,y:232,d:1.6}]},
    {junto:[{pulo:'g'},{pulo:'n'},{leg:'os dois riram da mesma piada, na mesma hora.',d:2.4}]},
    {fx:'malabares',on:0},{tira:'felco'},
    {junto:[{mov:'g',x:150,y:232,d:1},{mov:'n',x:210,y:232,d:1}]},
    {diz:'g',txt:'...Natalix? da academia?',d:2},
    {diz:'n',txt:'Gabrix?! o do cabelo bagunçado?',d:2.2},
    {fx:'coracoes',x:180,y:150,n:10},
    {leg:'desde a sexta órbita na mesma academia. e só agora, rindo do mesmo show.',d:3.2}
  ],
  lua:[
    {bg:'luas'},
    {add:'g',heroi:'g',disf:true,x:50,y:224,s:1.2},{add:'n',heroi:'n',disf:true,x:310,y:224,s:1.2,dir:-1},
    {leg:'agora era uma lua cheia por mês.',d:2.6},
    {leg:`${nome(p)} contava os dias. não contava pra ninguém que contava os dias.`,d:3.2},
    {junto:[{mov:'g',x:150,y:220,d:1.8},{mov:'n',x:210,y:220,d:1.8}]},
    {diz:'n',txt:'seu cabelo tá parecendo um ninho de passarinho',d:2.4},
    {diz:'g',txt:'pode não?',d:1.8},
    {junto:[{pulo:'g'},{pulo:'n'}]},
    {fx:'coracoes',x:180,y:150,n:6}
  ],
  pegou:[
    {bg:'noite'},
    {add:'g',heroi:'g',disf:true,x:70,y:220,s:1.3},{add:'n',heroi:'n',disf:true,x:290,y:220,s:1.3,dir:-1},
    {diz:'g',txt:'vagalume-correio, leva essa carta pra ela?',d:2.2},
    {voo:1,x0:90,y0:150,x1:270,y1:150,d:2.4,carta:1},
    {diz:'n',txt:'"Natalix, acho que você gosta de mim"...',d:2.6},
    {pulo:'n'},{diz:'n',txt:'você me pegou. que vergonha.',d:2.4},
    {voo:1,x0:270,y0:150,x1:90,y1:150,d:2.2,carta:1},
    {diz:'g',txt:'...eu também gosto de você. faz tempo.',d:2.6},
    {fx:'coracoes',x:180,y:160,n:12}
  ],
  sombras:[
    {bg:'teatro'},
    {add:'g',heroi:'g',disf:true,x:150,y:236,s:1.3},{add:'n',heroi:'n',disf:true,x:210,y:236,s:1.3,dir:-1},
    {leg:'teatro de sombras do castelo. história de terror.',d:2.4},
    {fx:'monstro',d:1.6},
    {junto:[{pulo:'n'},{diz:'n',txt:'aaaaah!',d:1.4}]},
    {mov:'n',x:192,y:236,d:.4},
    {leg:'ela segurou a pata dele. e não soltou mais.',d:2.8},
    {bg:'noite'},
    {mov:'g',x:174,y:226,d:.8},
    {diz:'n',txt:'no próximo.',d:2.2},
    {pulo:'g'},{leg:'ele voltou pra casa flutuando. nem precisava de nave.',d:2.8}
  ],
  chuva:[
    {bg:'cinema'},
    {add:'g',heroi:'g',disf:true,x:150,y:240,s:1.3},{add:'n',heroi:'n',disf:true,x:212,y:240,s:1.3,dir:-1},
    {leg:'o cinema da Rainha passou um filme antigo de outro mundo.',d:2.8},
    {junto:[{mov:'g',x:170,y:240,d:1.2},{mov:'n',x:192,y:240,d:1.2}]},
    {fx:'coracoes',x:181,y:170,n:16},{leg:'"no próximo" chegou.',d:2.2},
    {bg:'rua'},{fx:'chuva',on:1},
    {add:'cafe',bld:'cafe',f:2,x:250,y:200,s:.9},
    {mov:'g',x:-30,y:236,d:.01},{mov:'n',x:-60,y:236,d:.01},
    {junto:[{mov:'g',x:140,y:236,d:1.1},{mov:'n',x:100,y:236,d:1.1}]},
    {diz:'g',txt:'um de maracujá, por favor',d:1.8},
    {diz:'n',txt:'e um de morango! ...me dá um gole do seu?',d:2.2},
    {leg:'mas a chuva estava lavando o pó de disfarce...',d:2.6},
    {set:'n',disf:false},{set:'g',disf:false},
    {diz:'g',txt:'você... também?!',d:1.8},
    {diz:'n',txt:'verde. igualzinho a você.',d:2},
    {junto:[{pulo:'g'},{pulo:'n'},{fx:'coracoes',x:120,y:150,n:20}]},
    {leg:'nunca foram os únicos. só estavam se procurando no lugar errado.',d:3.4}
  ],
  pedido:[
    {bg:'cinemaVazio'},
    {add:'n',heroi:'n',disf:false,x:180,y:244,s:1.3},
    {leg:'o cinema inteiro, fechado só pra ela.',d:2.4},
    {tela:'g',d:3},
    {leg:'na tela, ele falou tudo o que sentia. depois tocou a música do primeiro beijo.',d:3.4},
    {add:'lumi',gato:G.lumi,x:400,y:244,s:1.2,dir:-1,leva:'buque'},
    {mov:'lumi',x:250,y:244,d:1.6},
    {add:'g',heroi:'g',disf:false,x:-40,y:244,s:1.3},
    {mov:'g',x:128,y:244,d:1.6},
    {joelho:'g'},
    {diz:'g',txt:'Natalix, quer namorar comigo?',d:2.8},
    {diz:'n',txt:'SIM!',d:1.6},
    {junto:[{pulo:'n'},{fx:'coracoes',x:160,y:170,n:26},{fx:'confete',x:180,y:120,n:40}]},
    {leg:'claro que ela disse sim.',d:2.6}
  ],
  mundo:[
    {bg:'ceu'},
    {balao:1,d:9},
    {leg:'a nave virou balão. e o balão virou casa.',d:2.6},
    {postais:1},
    {leg:'China, Peru, Japão, Chile, Canadá, Itália, França, Rússia...',d:3},
    {leg:'casa não é um planeta. é uma pessoa.',d:3.2}
  ],
  veluma:[
    {bg:'observ'},
    {add:'obs',bld:'observatorio',f:2,n:1,x:110,y:200,s:.95},
    {add:'cometa',gato:G.cometa,x:190,y:220,s:1.2},
    {add:'g',heroi:'g',disf:false,x:250,y:228,s:1.25,dir:-1},{add:'n',heroi:'n',disf:false,x:300,y:230,s:1.25,dir:-1,fech:1},
    {diz:'cometa',txt:'tem um sinal piscando... é código da academia!',d:2.4},
    {leg:'"cadetes perdidos, respondam. a nave de resgate passa na próxima lua nova."',d:3.4},
    {acorda:'n'},
    {diz:'g',txt:'é Veluma. podem levar a gente de volta.',d:2.4},
    {diz:'n',txt:'a gente fica. pode não?',d:2},
    {diz:'g',txt:'pode não.',d:1.6},
    {fx:'coracoes',x:275,y:160,n:12}
  ],
  rainha:[
    {bg:'biblio'},
    {add:'rainha',gato:G.rainha,x:180,y:220,s:1.6},
    {add:'g',heroi:'g',disf:false,x:80,y:236,s:1.25},{add:'n',heroi:'n',disf:false,x:280,y:236,s:1.25,dir:-1},
    {diz:'rainha',txt:'eu também guardo um segredo...',d:2.4},
    {set:'rainha',gato:G.rainhaAnt},
    {diz:'rainha',txt:'eu caí aqui há muitos invernos.',d:2.4},
    {diz:'rainha',txt:'quem gosta de verdade gosta do jeito que a gente é.',d:3},
    {junto:[{pulo:'g'},{pulo:'n'},{fx:'coracoes',x:180,y:140,n:14}]},
    {leg:'e a Rainha foi passear pela vila de antena de fora.',d:2.8}
  ],
  cozinha:[
    {bg:'cozinha'},
    {add:'g',heroi:'g',disf:false,x:120,y:230,s:1.3},
    {fx:'fumacaPreta',on:1},
    {diz:'g',txt:'era pra ser uma sopa de abóbora...',d:2.2},
    {add:'n',heroi:'n',disf:false,x:400,y:230,s:1.3,dir:-1},
    {mov:'n',x:220,y:230,d:1.4},{fx:'fumacaPreta',on:0},
    {diz:'n',txt:'*prova* ...tá horrível.',d:2},
    {diz:'n',txt:'faz de novo amanhã? pode não?',d:2.2},
    {add:'cereja',gato:G.cereja,x:400,y:236,s:1.15,dir:-1,leva:'prato'},
    {mov:'cereja',x:300,y:236,d:1.2},
    {diz:'cereja',txt:'trouxe cheesecake. eu sabia.',d:2},
    {mov:'n',x:150,y:230,d:.6},{fx:'coracoes',x:132,y:150,n:8},
    {leg:'um beijinho na orelha. ele ficou vermelho até a ponta das antenas.',d:3}
  ],
  atraso:[
    {bg:'nascer'},
    {add:'n',heroi:'n',disf:false,x:220,y:220,s:1.3,dir:-1},
    {junto:[{pulo:'n'},{diz:'n',txt:'a gente tá atrasado!!',d:1.8}]},
    {add:'g',heroi:'g',disf:false,x:-40,y:222,s:1.3},
    {mov:'g',x:150,y:222,d:1.4},
    {diz:'g',txt:'olha... o sol também se atrasou.',d:2.4},
    {leg:'ela segurou o riso por três segundos...',d:2.4},
    {junto:[{pulo:'n'},{diz:'n',txt:'hahahaha besta',d:2}]},
    {mov:'n',x:182,y:220,d:.6},
    {fx:'coracoes',x:166,y:150,n:12},
    {leg:'o melhor nascer do sol da vida.',d:3}
  ],
  casa:[
    {bg:'casa'},
    {add:'casa',bld:'casinha',f:2,x:180,y:200,s:.95},
    {add:'g',heroi:'g',disf:false,x:110,y:232,s:1.25},{add:'n',heroi:'n',disf:false,x:250,y:232,s:1.25,dir:-1},
    {add:'dengo',gato:G.dengo,x:180,y:240,s:.9},
    {diz:'dengo',txt:'papai! mamãe!',d:1.8},
    {pulo:'dengo'},
    {leg:'o disfarce a gente não usa mais. a vila conhece a gente de verdade.',d:3.2},
    {junto:[{mov:'g',x:156,y:232,d:1},{mov:'n',x:206,y:232,d:1}]},
    {fx:'coracoes',x:180,y:150,n:20},
    {leg:p==='g'?'eu caí exatamente onde você estava.':'todo lugar que eu quero ir, eu quero ir com você.',d:3.4}
  ]
  };
  return R[id];
}

/* ---------------- execução ---------------- */
function preparar(r){
  const lista=[];
  const V=window.VilaArte;
  r.forEach(s=>{ const st=s.junto||[s]; st.forEach(x=>{
    if(x.add){ lista.push(sprAtor(x)); if(x.heroi) lista.push(sprAtor({heroi:x.heroi,disf:!x.disf}),sprAtor({heroi:x.heroi,disf:x.disf,fech:1})); }
    if(x.set&&x.gato) lista.push(sprAtor({gato:x.gato}));
    if(x.tela) lista.push(sprAtor({heroi:x.tela,disf:false}));
  }); });
  lista.push(spr('nave',[-30,-20,60,32],()=>NAVE),spr('buque',[-10,-14,20,32],()=>BUQUE),spr('carta',[-10,-8,20,16],()=>CARTA),spr('prato',[-14,-10,28,16],()=>PRATO),spr('balaoV',[-104,-170,200,190],()=>V.CONSTRUCAO.balao(2,false)));
  V.POSTAIS.forEach(pp=>lista.push(spr('p'+pp.id,[0,0,120,80],()=>V.postalSVG(pp,true).replace(/<\/?svg[^>]*>/g,''))));
  return Promise.all(lista.filter(Boolean).map(s=>s.p));
}
function novoEstado(r,p,fim){ return {r,p,fim,i:-1,t:0,atores:new Map(),bg:'preto',legenda:null,passos:[],aguarda:0,malab:false,fumaca:false,nave:null,voo:null,tela:null,balao:null,postais:null,monstro:0}; }
function proximo(){
  const S=cena; S.i++;
  if(S.i>=S.r.length){ S.aguarda=1.2; S.acabando=true; return; }
  const s=S.r[S.i], lista=s.junto||[s];
  let dur=0; lista.forEach(x=>{ dur=Math.max(dur,executar(x)); });
  S.aguarda=dur;
}
function executar(s){
  const S=cena;
  if(s.bg){ S.bg=s.bg; S.fade=1; return .35; }
  if(s.add){ S.atores.set(s.add,{k:s.add,heroi:s.heroi,gato:s.gato,bld:s.bld,f:s.f,n:s.n,svg:s.svg,svgKey:s.svgKey,box:s.box,x:s.x,y:s.y,s:s.s||1,dir:s.dir||1,disf:s.disf,fech:s.fech,leva:s.leva,pulo:0,mov:null,fala:null,alpha:1,joelho:0}); return 0; }
  if(s.tira){ S.atores.delete(s.tira); return 0; }
  const a=S.atores.get(s.mov||s.diz||s.pulo||s.set||s.joelho||s.acorda);
  if(s.mov&&a){ a.mov={x0:a.x,y0:a.y,x1:s.x,y1:s.y,t:0,d:s.d||1}; if(s.x!==a.x) a.dir=s.x<a.x?-1:1; return s.d||1; }
  if(s.diz&&a){ a.fala={txt:s.txt,t:s.d||2}; return s.d||2; }
  if(s.pulo&&a){ a.pulo=1; return .5; }
  if(s.joelho&&a){ a.joelho=1; return .6; }
  if(s.acorda&&a){ a.fech=false; a.pulo=1; return .6; }
  if(s.set&&a){ if(s.gato) a.gato=s.gato; if(s.disf!=null) a.disf=s.disf; puff(a.x,a.y-30*a.s,12); window.VilaArte.som.chime(); return 1; }
  if(s.leg){ S.legenda={txt:s.leg,t:0,d:s.d||2.6}; return s.d||2.6; }
  if(s.fx==='flash'){ flash=1; return .5; }
  if(s.fx==='puff'){ puff(s.x,s.y,s.n||10); return .6; }
  if(s.fx==='chuva'){ efeitoChuva(!!s.on); return .2; }
  if(s.fx==='coracoes'){ burst(s.x,s.y,s.n||10); window.VilaArte.som.chime(); return .9; }
  if(s.fx==='confete'){ burst(s.x,s.y,s.n||30,1); window.VilaArte.som.fanfarra(); return .2; }
  if(s.fx==='malabares'){ S.malab=!!s.on; return 0; }
  if(s.fx==='fumacaPreta'){ S.fumaca=!!s.on; return 0; }
  if(s.fx==='monstro'){ S.monstro=s.d||1.6; window.VilaArte.som.blip(.3); return s.d||1.6; }
  if(s.nave){ S.nave={...s,t:0}; return s.d; }
  if(s.voo){ S.voo={...s,t:0}; return s.d; }
  if(s.tela){ S.tela={q:s.tela,t:0}; return s.d||2; }
  if(s.balao){ S.balao={t:0,d:s.d}; return 1.2; }
  if(s.postais){ S.postais={t:0}; return .2; }
  return 0;
}
function puff(x,y,n){ for(let i=0;i<n;i++){ const a=Math.random()*6.283; puffs.push({x,y,vx:Math.cos(a)*30,vy:Math.sin(a)*20-10,r:4+Math.random()*5,t:0}); } }

function passo(dt){
  const S=cena; S.t+=dt; tempo+=dt;
  if(S.fade>0) S.fade=Math.max(0,S.fade-dt*3);
  for(const a of S.atores.values()){
    if(a.mov){ a.mov.t+=dt; const k=Math.min(1,a.mov.t/a.mov.d), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; a.x=a.mov.x0+(a.mov.x1-a.mov.x0)*e; a.y=a.mov.y0+(a.mov.y1-a.mov.y0)*e; if(k>=1) a.mov=null; }
    if(a.pulo>0) a.pulo=Math.max(0,a.pulo-dt*2.2);
    if(a.fala){ a.fala.t-=dt; if(a.fala.t<=0) a.fala=null; }
  }
  if(S.legenda){ S.legenda.t+=dt; if(S.legenda.t>S.legenda.d+.4) S.legenda=null; }
  if(S.nave){ S.nave.t+=dt; if(S.nave.t>S.nave.d) S.nave=null; }
  if(S.voo){ S.voo.t+=dt; if(S.voo.t>S.voo.d) S.voo=null; }
  if(S.tela) S.tela.t+=dt;
  if(S.balao) S.balao.t+=dt;
  if(S.postais) S.postais.t+=dt;
  if(S.monstro>0) S.monstro=Math.max(0,S.monstro-dt);
  if(flash>0) flash=Math.max(0,flash-dt*2);
  for(const d of chuva){ d.y+=d.v*dt; d.x-=d.v*dt*.15; if(d.y>SH){ d.y=-10; d.x=Math.random()*(SW+40); } }
  for(const arr of [coracoes,confete]) for(let i=arr.length-1;i>=0;i--){ const h=arr[i]; h.t+=dt; h.x+=h.vx*dt; h.y+=h.vy*dt; h.vy+=arr===confete?60*dt:-10*dt; h.vx*=.98; if(h.t>2.2) arr.splice(i,1); }
  for(let i=puffs.length-1;i>=0;i--){ const f=puffs[i]; f.t+=dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.r+=dt*8; if(f.t>.9) puffs.splice(i,1); }
  if(S.fumaca&&Math.random()<dt*8) puffs.push({x:165+Math.random()*10,y:146,vx:(Math.random()-.5)*10,vy:-24,r:5,t:0,preta:1});
  S.aguarda-=dt;
  if(S.aguarda<=0){ if(S.acabando){ terminar(); return; } proximo(); }
}

function desenharAtor(c,a){
  const s=sprAtor(a); if(!s||!s.ok) return;
  const bob=a.mov&&(a.heroi||a.gato)?-Math.abs(Math.sin(tempo*12))*3:0, pul=a.pulo>0?-Math.sin(a.pulo*Math.PI)*16:0;
  const resp=(a.heroi||a.gato)?1+Math.sin(tempo*2.6+a.x)*.02:1;
  const jy=a.joelho?.82:1;
  c.save(); c.translate(a.x,a.y+bob+pul); c.scale(a.s*a.dir,a.s*resp*jy); c.drawImage(s.img,s.x,s.y,s.w,s.h); c.restore();
  if(a.leva){ const L=IMG.get(a.leva); if(L&&L.ok) c.drawImage(L.img,a.x+a.dir*14*a.s-L.w*.6,a.y-30*a.s+bob,L.w*1.2,L.h*1.2); }
}
function desenharFala(c,a){
  const txt=a.fala.txt; c.font='800 11px Nunito, sans-serif';
  const pal=txt.split(' '), lin=[]; let l=''; pal.forEach(w=>{ const t=l?l+' '+w:w; if(c.measureText(t).width>150&&l){ lin.push(l); l=w; } else l=t; }); if(l) lin.push(l);
  const w=Math.min(170,Math.max(...lin.map(x=>c.measureText(x).width))+16), h=lin.length*13+10;
  let x=Math.max(w/2+4,Math.min(SW-w/2-4,a.x)), y=a.y-70*a.s-h; if(y<4) y=4;
  c.globalAlpha=Math.min(1,a.fala.t*4);
  c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=1.6; c.beginPath(); if(c.roundRect) c.roundRect(x-w/2,y,w,h,8); else c.rect(x-w/2,y,w,h); c.fill(); c.stroke();
  const tx=Math.max(x-w/2+10,Math.min(x+w/2-10,a.x)); c.beginPath(); c.moveTo(tx-5,y+h); c.lineTo(tx,y+h+7); c.lineTo(tx+5,y+h); c.fill(); c.stroke(); c.fillRect(tx-4,y+h-2,8,3);
  c.fillStyle=INK; c.textAlign='center'; lin.forEach((t,i)=>c.fillText(t,x,y+15+i*13)); c.globalAlpha=1;
}
const COR_FUNDO={noite:['#1f1d3d','#34513a'],dia:['#cfe6ef','#b7cf93'],colina:['#1b1a36','#2f4a35'],luas:['#1b1a36','#2f4a35'],feira:['#2b2550','#5c6b48'],cinema:['#17142a','#3a2444'],cinemaVazio:['#17142a','#3a2444'],
  rua:['#4f5a72','#6b7a68'],teatro:['#1d1626','#3a2a34'],ceu:['#9fd0ec','#9cc27c'],biblio:['#e9d9bd','#c99a6b'],cozinha:['#f3e6d2','#b98a5e'],observ:['#141433','#2f4a35'],casa:['#f6c9a8','#b7cf93'],preto:['#17142a','#17142a']};
function desenhar(){
  const c=ctx, S=cena;
  // fora do palco: estende o céu (em cima) e o chão (embaixo) pra não ficar tarja preta
  let cf=COR_FUNDO[S.bg]||COR_FUNDO.preto; if(S.bg==='nascer'){ const k=Math.min(1,S.t/14); cf=[k<.5?'#3d3a6b':'#f6b98f','#86a86b']; }
  c.setTransform(1,0,0,1,0,0); c.fillStyle=cf[0]; c.fillRect(0,0,cv.width,oy+SH*esc*.5); c.fillStyle=cf[1]; c.fillRect(0,oy+SH*esc*.5,cv.width,cv.height);
  c.setTransform(esc,0,0,esc,ox,oy);
  (FUNDO[S.bg]||FUNDO.preto)(c);
  if(S.monstro>0){ const k=S.monstro; c.fillStyle='#1d1626'; c.save(); c.translate(180,150-Math.sin(Math.min(1,(1.6-k)*3)*Math.PI/2)*60); c.scale(1.4,1.4); c.beginPath(); c.moveTo(-40,40); c.lineTo(-30,-10); c.lineTo(-44,-30); c.lineTo(-20,-24); c.lineTo(-10,-46); c.lineTo(0,-26); c.lineTo(14,-48); c.lineTo(22,-22); c.lineTo(46,-30); c.lineTo(32,-8); c.lineTo(40,40); c.closePath(); c.fill(); c.fillStyle='#fff3d6'; c.beginPath(); c.arc(-12,-6,5,0,6.283); c.arc(12,-6,5,0,6.283); c.fill(); c.restore(); }
  if(S.tela){ const sp=sprAtor({heroi:S.tela.q,disf:false}); if(sp.ok){ c.save(); c.globalAlpha=.85+Math.random()*.1; c.beginPath(); c.rect(46,28,268,116); c.clip(); c.translate(180,150); c.scale(2.1,2.1); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); c.globalAlpha=1; }
    const k=S.tela.t; for(let i=0;i<2;i++){ const q=((k*.5+i*.5)%1); c.globalAlpha=q<.2?q*5:1-q; c.fillStyle='#e3798a'; c.font='700 16px sans-serif'; c.fillText('♪',90+i*180+q*10,120-q*50); } c.globalAlpha=1; }
  if(S.balao){ const b=IMG.get('balaoV'); const k=Math.min(1,S.balao.t/S.balao.d); const y=250-k*130+Math.sin(tempo*1.2)*4;
    if(b&&b.ok){ c.save(); c.translate(180,y); c.scale(.85,.85); c.drawImage(b.img,b.x,b.y,b.w,b.h); c.restore(); }
    ['g','n'].forEach((q,i)=>{ const sp=sprAtor({heroi:q,disf:false}); if(sp.ok){ c.save(); c.translate(172+i*16,y-30); c.scale(.45*(i?-1:1),.45); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); } }); }
  if(S.postais){ const V=window.VilaArte; V.POSTAIS.forEach((pp,i)=>{ const t=S.postais.t-i*.5; if(t<0||t>5) return; const sp=IMG.get('p'+pp.id); if(!sp||!sp.ok) return; const x=SW+40-t*90, y=40+(i%4)*40+Math.sin(t*2+i)*6; c.save(); c.translate(x,y); c.rotate(Math.sin(t+i)*.2); c.drawImage(sp.img,-30,-20,60,40); c.restore(); }); }
  const atores=[...S.atores.values()].sort((a,b)=>a.y-b.y);
  atores.forEach(a=>desenharAtor(c,a));
  if(S.malab){ for(let i=0;i<3;i++){ const ang=tempo*4+i*2.09; const a=S.atores.get('felco'); if(!a) break; c.fillStyle=['#e3606e','#f2c14e','#86afcf'][i]; c.beginPath(); c.arc(a.x+Math.cos(ang)*18,a.y-92-Math.abs(Math.sin(ang))*22,4.5,0,6.283); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); } }
  if(S.nave){ const k=Math.min(1,S.nave.t/S.nave.d), x=S.nave.x0+(S.nave.x1-S.nave.x0)*k, y=S.nave.y0+(S.nave.y1-S.nave.y0)*k*k; const n=IMG.get('nave');
    c.strokeStyle='rgba(185,220,76,.7)'; c.lineWidth=6; c.beginPath(); c.moveTo(S.nave.x0,S.nave.y0); c.lineTo(x,y); c.stroke();
    if(n&&n.ok){ c.save(); c.translate(x,y); c.rotate(.5); c.drawImage(n.img,n.x,n.y,n.w,n.h); c.restore(); } }
  if(S.voo){ const k=Math.min(1,S.voo.t/S.voo.d), x=S.voo.x0+(S.voo.x1-S.voo.x0)*k, y=S.voo.y0-Math.sin(k*Math.PI)*40+Math.sin(tempo*10)*2;
    c.globalCompositeOperation='lighter'; c.fillStyle='rgba(255,236,120,.6)'; c.beginPath(); c.arc(x,y,9,0,6.283); c.fill(); c.globalCompositeOperation='source-over'; c.fillStyle='#fff6a8'; c.beginPath(); c.arc(x,y,3.4,0,6.283); c.fill();
    const ct=IMG.get('carta'); if(S.voo.carta&&ct&&ct.ok) c.drawImage(ct.img,x-8,y+4,16,12); }
  for(const f of puffs){ c.globalAlpha=Math.max(0,.8*(1-f.t/.9)); c.fillStyle=f.preta?'#5c5550':'#fbf7ef'; c.beginPath(); c.arc(f.x,f.y,f.r,0,6.283); c.fill(); } c.globalAlpha=1;
  if(chuva.length){ c.fillStyle='rgba(60,70,100,.15)'; c.fillRect(0,0,SW,SH); c.strokeStyle='rgba(220,232,245,.7)'; c.lineWidth=1; c.beginPath(); for(const d of chuva){ c.moveTo(d.x,d.y); c.lineTo(d.x-2,d.y+9); } c.stroke(); }
  for(const h of coracoes){ c.globalAlpha=Math.max(0,1-h.t/2.2); c.fillStyle=h.cor; coracao(c,h.x,h.y,7); } c.globalAlpha=1;
  for(const h of confete){ c.globalAlpha=Math.max(0,1-h.t/2.2); c.fillStyle=h.cor; c.save(); c.translate(h.x,h.y); c.rotate(h.t*6+h.r); c.fillRect(-3,-1.5,6,3); c.restore(); } c.globalAlpha=1;
  atores.forEach(a=>{ if(a.fala) desenharFala(c,a); });
  if(S.legenda){ const L=S.legenda, k=Math.min(1,L.t*3); c.globalAlpha=Math.min(k,Math.max(0,(L.d+.4-L.t)*3));
    c.font='700 12px Nunito, sans-serif'; const n=Math.floor(L.txt.length*Math.min(1,L.t/Math.max(.6,L.d*.45))), t=L.txt.slice(0,n);
    const pal=t.split(' '), lin=[]; let l=''; pal.forEach(w=>{ const tt=l?l+' '+w:w; if(c.measureText(tt).width>300&&l){ lin.push(l); l=w; } else l=tt; }); if(l) lin.push(l);
    const h=Math.max(1,lin.length)*16+12; c.fillStyle='rgba(43,36,64,.82)'; c.fillRect(0,SH-h,SW,h); c.fillStyle='#fbf7ef'; c.textAlign='center'; lin.forEach((x,i)=>c.fillText(x,SW/2,SH-h+20+i*16)); c.globalAlpha=1; }
  if(flash>0){ c.fillStyle=`rgba(230,255,190,${flash})`; c.fillRect(0,0,SW,SH); }
  if(S.fade>0){ c.fillStyle=`rgba(23,20,42,${S.fade})`; c.fillRect(0,0,SW,SH); }
}
function loop(ts){
  if(!cena) return; raf=requestAnimationFrame(loop);
  const dt=last?Math.min(.05,(ts-last)/1000):0; last=ts;
  passo(dt); if(cena) desenhar();
}
function medir(){
  const W=ov.clientWidth, H=ov.clientHeight, DPR=Math.min(1.6,window.devicePixelRatio||1); DPRc=DPR;
  const k=Math.min(W/(SW-30),H/SH); esc=k*DPR;   // corta 15px de cada lado no celular em pé: palco maior
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px';
  ox=(W*DPR-SW*esc)/2; oy=(H*DPR-SH*esc)/2;
}
function montar(){
  if(ov) return;
  const raiz=document.getElementById('cozy-wrap')||document.body;
  ov=document.createElement('div'); ov.id='vl-cena-ov';
  ov.innerHTML='<canvas></canvas><button class="pular">pular ›</button><div class="dica">toque pra adiantar</div>';
  raiz.appendChild(ov); cv=ov.querySelector('canvas'); ctx=cv.getContext('2d');
  ov.querySelector('.pular').addEventListener('click',e=>{ e.stopPropagation(); terminar(); });
  ov.addEventListener('click',()=>{ if(!cena) return; const S=cena; for(const a of S.atores.values()){ if(a.mov){ a.x=a.mov.x1; a.y=a.mov.y1; a.mov=null; } a.fala=null; } S.legenda=null; S.aguarda=0; });
  window.addEventListener('resize',()=>{ if(cena) medir(); });
}
function terminar(){
  if(!cena) return; const fim=cena.fim; cena=null; cancelAnimationFrame(raf); last=0;
  chuva=[]; coracoes=[]; confete=[]; puffs=[]; flash=0;
  if(ov) ov.classList.remove('on');
  try{ window.VilaArte.som.forcar(null); }catch(e){}
  if(fim) fim();
}
window.VilaCena={
  tem:id=>!!roteiro(id,'g'),
  tocar(id,p,fim){
    const r=roteiro(id,p); if(!r){ if(fim) fim(); return; }
    montar(); terminarSilencioso();
    ov.classList.add('on'); medir();
    ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#17142a'; ctx.fillRect(0,0,cv.width,cv.height);
    try{ window.VilaArte.som.init(); window.VilaArte.som.forcar('cena'); }catch(e){}
    const S=novoEstado(r,p,fim); cena=S;
    preparar(r).then(()=>{ if(cena!==S) return; last=0; raf=requestAnimationFrame(loop); });
  },
  parar(){ terminarSilencioso(); },
  ativa:()=>!!cena
};
function terminarSilencioso(){ if(!cena) return; cena=null; cancelAnimationFrame(raf); last=0; chuva=[]; coracoes=[]; confete=[]; puffs=[]; if(ov) ov.classList.remove('on'); try{ window.VilaArte.som.forcar(null); }catch(e){} }
})();
