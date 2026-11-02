/* =====================================================================
   CENAS ANIMADAS DA HISTÓRIA — Gabrix e Natalix
   Um palco em canvas (360×260) com câmera, faixas de cinema, atores
   com rabo e piscadinha, expressões, falas, escolhas e música por momento.
   Toque pra adiantar, "pular" encerra.
   Depende de: VilaArte (vila.js), alienSVG/ALIEN_BOX (vila-herois.js)
   ===================================================================== */
(function(){
'use strict';
const SW=360, SH=260, INK='#4a3a2e';
let ov=null, cv=null, ctx=null, esc=1, ox=0, oy=0, raf=null, cena=null, tempo=0, last=0;

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
function sprAtor(a,fech){
  const V=window.VilaArte;
  if(a.heroi) return spr(`h${a.heroi}${a.disf?1:0}${fech?'z':''}r`,window.ALIEN_BOX,()=>window.alienSVG(a.heroi,a.disf,fech,true));
  if(a.gato){ const o=a.gato; return spr('g'+JSON.stringify(o)+(fech?'z':''),BOXC,()=>V.gatoSVG(o,1,fech,true)); }
  if(a.bld) return spr(`b${a.bld}${a.f==null?2:a.f}${a.n?1:0}`,a.bld==='balao'||a.bld==='casinha'?[-104,-170,200,190]:[-104,-126,200,160],()=>V.CONSTRUCAO[a.bld](a.f==null?2:a.f,!!a.n));
  if(a.castelo) return spr('cast'+(a.n?1:0),[-150,-222,300,292],()=>V.casteloSVG(5,!!a.n));
  if(a.svg) return spr(a.svgKey,a.box,()=>a.svg);
  return null;
}
const corAtor=a=>a.heroi?window.peloAlien(a.heroi,a.disf):a.gato?a.gato.cor:null;

const NAVE=`<ellipse cx="0" cy="0" rx="26" ry="9" fill="#c8ccd2" stroke="${INK}" stroke-width="2"/><path d="M-13 -2 C-13 -16 13 -16 13 -2 Z" fill="#cfe9b0" stroke="${INK}" stroke-width="2"/><circle cx="-14" cy="2" r="2" fill="#f2c14e"/><circle cx="0" cy="4" r="2" fill="#f2c14e"/><circle cx="14" cy="2" r="2" fill="#f2c14e"/>`;
const MURAL=`<path d="M-30 0 V-56 M30 0 V-56" stroke="#a07a55" stroke-width="5"/><rect x="-36" y="-64" width="72" height="44" rx="3" fill="#c99a6b" stroke="${INK}" stroke-width="2"/><rect x="-30" y="-58" width="26" height="18" fill="#d3ecf2" stroke="${INK}" stroke-width="1.2" transform="rotate(-5 -17 -49)"/><path d="M-28 -46 q6 -4 12 0 t12 0" stroke="#86afcf" stroke-width="2" fill="none"/><rect x="2" y="-58" width="26" height="14" fill="#fffaf0" stroke="${INK}" stroke-width="1.2"/><path d="M5 -53 h18 M5 -49 h12" stroke="#c2ac88" stroke-width="1.4"/><rect x="-10" y="-38" width="22" height="12" fill="#fbe3ea" stroke="${INK}" stroke-width="1.2" transform="rotate(3 1 -32)"/><path d="M-40 -64 L0 -76 L40 -64" fill="#9b4a58" stroke="${INK}" stroke-width="2"/>`;
const BUQUE=`<path d="M0 14 L-5 0 M0 14 L0 -2 M0 14 L5 0" stroke="#5f824b" stroke-width="2"/><path d="M-7 4 L0 16 L7 4 Z" fill="#f5efe3" stroke="${INK}" stroke-width="1.4"/><circle cx="-5" cy="-3" r="4.4" fill="#e3798a" stroke="${INK}" stroke-width="1.2"/><circle cx="5" cy="-3" r="4.4" fill="#f2c14e" stroke="${INK}" stroke-width="1.2"/><circle cx="0" cy="-8" r="4.4" fill="#f2a7b8" stroke="${INK}" stroke-width="1.2"/>`;
const CARTA=`<rect x="-9" y="-6" width="18" height="12" rx="2" fill="#fffaf0" stroke="${INK}" stroke-width="1.4"/><path d="M-8 -5 L0 1 L8 -5" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="0" cy="1" r="2.2" fill="#e3798a"/>`;
const PRATO=`<ellipse cx="0" cy="0" rx="12" ry="4" fill="#fbf3e3" stroke="${INK}" stroke-width="1.4"/><path d="M-8 -1 L8 -6 L9 -1 Z" fill="#fff4dc" stroke="${INK}" stroke-width="1"/><circle cx="2" cy="-6" r="2" fill="#c2185b"/>`;
const PAO=`<path d="M-11 2 C-14 -8 -4 -13 0 -7 C4 -13 14 -8 11 2 C6 6 -6 6 -11 2 Z" fill="#d9a35e" stroke="${INK}" stroke-width="1.4"/><path d="M-5 -2 q2 -2 4 0 M2 -2 q2 -2 4 0" stroke="#a8743a" stroke-width="1.2" fill="none"/>`;
const PILHA=`${[0,1,2,3].map(i=>`<rect x="${-8+i*1.5}" y="${-4-i*4}" width="16" height="11" rx="2" fill="#fffaf0" stroke="${INK}" stroke-width="1.2" transform="rotate(${(i%2?6:-5)} 0 ${-i*4})"/>`).join('')}<path d="M-6 -14 l6 4 l6 -4" stroke="${INK}" stroke-width="1" fill="none"/>`;
const VARA=`<path d="M0 0 L26 -34" stroke="#8a6a4e" stroke-width="2.6" stroke-linecap="round"/>`;
const TABUAS=`<rect x="-34" y="-6" width="68" height="6" rx="1" fill="#c99a6b" stroke="${INK}" stroke-width="1.4"/><rect x="-30" y="-12" width="60" height="6" rx="1" fill="#d9b48a" stroke="${INK}" stroke-width="1.4" transform="rotate(-3)"/><rect x="-26" y="-18" width="50" height="6" rx="1" fill="#c99a6b" stroke="${INK}" stroke-width="1.4" transform="rotate(4)"/>`;
const OBRA=`<path d="M-4 0 V-120 M4 0 V-120" stroke="#8a6a4e" stroke-width="10"/><ellipse cx="0" cy="-130" rx="70" ry="44" fill="#86a86b" stroke="${INK}" stroke-width="2"/><ellipse cx="-30" cy="-150" rx="36" ry="26" fill="#9cc27c" stroke="${INK}" stroke-width="2"/><path d="M-40 -90 H40 V-70 H-40 Z" fill="#d9b48a" stroke="${INK}" stroke-width="2"/><path d="M-40 -90 V-118 M40 -90 V-118 M-40 -118 H10" stroke="#b98a5e" stroke-width="4"/><path d="M-40 -90 L-20 -118" stroke="#b98a5e" stroke-width="3"/>`;

/* ---------------- elenco ---------------- */
const G={
  nuvem:{cor:'#fffaf3',det:'#ecd6c2'}, toco:{cor:'#f3dcb8',det:'#d3a878',xadrez:1},
  felco:{cor:'#f4a35c',det:'#d9793a',listras:1,bufao:1}, lumi:{cor:'#ddd5ec',det:'#a99cc9',listras:1,oculos:1},
  cereja:{cor:'#f7dfe3',det:'#e8a9b6',avental:'#c25a6c'}, cometa:{cor:'#4a4f6e',det:'#33374f',listras:1},
  rainha:{cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1}, rainhaAnt:{cor:'#fffdf8',det:'#efe2d4',capa:1,antenas:1},
  rainhaBoina:{cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1},
  dengo:{cor:'#fbe9d0',det:'#e8bf8f',listras:1}, pacoca:{cor:'#f1d6ae',det:'#c9a072',listras:1},
  laranjinha:{cor:'#f4a35c',det:'#d9793a',listras:1,chapeuVerde:1}, melodia:{cor:'#cfcfcf',det:'#9a9a9a',listras:1},
  traca:{cor:'#d9c8a9',det:'#a8916b',listras:1,oculos:1}, azul:{cor:'#bccbdc',det:'#8ea3bd',listras:1,chapeu:1}
};

/* ---------------- fundos ---------------- */
const estrelas=[...Array(52)].map((_,i)=>({x:(i*97)%SW,y:(i*53)%160,r:.6+((i*7)%10)/10,f:i}));
function ceuNoite(c,cor1,cor2){ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,cor1||'#1f1d3d'); g.addColorStop(1,cor2||'#3d3a6b'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120);
  for(const s of estrelas){ c.globalAlpha=.5+.5*Math.sin(tempo*2+s.f); c.fillStyle='#fff6c8'; c.beginPath(); c.arc(s.x,s.y,s.r,0,6.283); c.fill(); } c.globalAlpha=1; }
function chao(c,cor,y){ c.fillStyle=cor; c.beginPath(); c.moveTo(-60,y); for(let x=-60;x<=SW+60;x+=20) c.quadraticCurveTo(x+10,y-4,x+20,y); c.lineTo(SW+60,SH+60); c.lineTo(-60,SH+60); c.fill(); }
function arvores(c,cor,y,n,dx){ c.fillStyle=cor; for(let i=0;i<n;i++){ const x=(i+.5)*SW/n+Math.sin(i*3)*8+(dx||0), h=40+((i*13)%20); c.beginPath(); c.arc(x,y-h,22+((i*7)%8),0,6.283); c.fill(); c.fillRect(x-3,y-h,6,h); } }
function lua(c,x,y,r,fase){ c.save(); c.globalCompositeOperation='lighter'; c.fillStyle='rgba(247,233,176,.12)'; c.beginPath(); c.arc(x,y,r*2.2,0,6.283); c.fill(); c.restore(); c.fillStyle='#f7e9b0'; c.beginPath(); c.arc(x,y,r,0,6.283); c.fill(); if(fase<1){ c.fillStyle='#2a2850'; c.beginPath(); c.arc(x+r*2*(fase),y,r*1.02,0,6.283); c.fill(); } }
function lampioes(c,y){ c.strokeStyle='rgba(74,58,46,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(-40,y); for(let x=-40;x<=SW+40;x+=30) c.quadraticCurveTo(x+15,y+12,x+30,y); c.stroke();
  for(let x=-25;x<SW+40;x+=30){ c.globalAlpha=.85+.15*Math.sin(tempo*3+x); c.fillStyle=['#ffd36b','#f2a7b8','#9fd6ff'][((x+25)/30|0)%3]; c.beginPath(); c.arc(x,y+7,4,0,6.283); c.fill(); } c.globalAlpha=1; }
function agua(c,y,cor){ c.fillStyle=cor||'#2e4a6b'; c.fillRect(-60,y,SW+120,SH-y+60); c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.2;
  for(let i=0;i<9;i++){ const yy=y+10+i*7, o=Math.sin(tempo*1.2+i)*10; c.beginPath(); c.moveTo(30+i*37%300+o,yy); c.lineTo(52+i*37%300+o,yy); c.stroke(); } }
const FUNDO={
  noite:c=>{ ceuNoite(c); arvores(c,'#2c3f2e',196,8); chao(c,'#34513a',196); },
  dia:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#cfe6ef'); g.addColorStop(1,'#f5efe3'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120); arvores(c,'#9cc27c',190,7); chao(c,'#b7cf93',190); c.fillStyle='#ead6ad'; c.beginPath(); c.ellipse(SW/2,222,150,26,0,0,6.283); c.fill(); },
  colina:c=>{ ceuNoite(c,'#1b1a36','#3a3766'); lua(c,280,58,22,1); c.fillStyle='#2f4a35'; c.beginPath(); c.moveTo(-60,210); c.quadraticCurveTo(180,150,420,210); c.lineTo(420,320); c.lineTo(-60,320); c.fill(); },
  luas:c=>{ ceuNoite(c,'#1b1a36','#3a3766'); const f=(tempo*.55)%1; lua(c,180,62,20,f<.5?f*2:2-f*2); c.fillStyle='#2f4a35'; c.beginPath(); c.moveTo(-60,206); c.quadraticCurveTo(180,180,420,206); c.lineTo(420,320); c.lineTo(-60,320); c.fill(); },
  feira:c=>{ ceuNoite(c,'#2b2550','#7a4e6e'); arvores(c,'#3a4a3a',200,9); chao(c,'#5c6b48',200); lampioes(c,40); },
  madrugada:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#2d3160'); g.addColorStop(.7,'#c98a8e'); g.addColorStop(1,'#f2c7a0'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120); arvores(c,'#3d4a46',204,8); chao(c,'#5d6b4f',204); },
  padaria:c=>{ c.fillStyle='#f3dfc0'; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='#e8cda6'; for(let y=-40;y<150;y+=18) for(let x=-60+(y/18%2)*14;x<SW+60;x+=28) c.fillRect(x,y,26,16);
    c.fillStyle='#b5523b'; c.beginPath(); c.moveTo(220,190); c.lineTo(220,90); c.quadraticCurveTo(275,40,330,90); c.lineTo(330,190); c.fill(); c.fillStyle='#2b1d1a'; c.beginPath(); c.moveTo(245,190); c.lineTo(245,130); c.quadraticCurveTo(275,104,305,130); c.lineTo(305,190); c.fill();
    c.globalAlpha=.6+.3*Math.sin(tempo*7); c.fillStyle='#f4a35c'; c.beginPath(); c.ellipse(275,180,22,8+Math.sin(tempo*9)*2,0,0,6.283); c.fill(); c.globalAlpha=1;
    c.fillStyle='#a07a55'; c.fillRect(-60,190,SW+120,80); c.fillStyle='#c99a6b'; c.fillRect(-60,186,SW+120,8); },
  lago:c=>{ ceuNoite(c,'#18203f','#3b4a7a'); lua(c,92,54,16,1); arvores(c,'#24363a',150,9); agua(c,150,'#22385a');
    c.fillStyle='rgba(247,233,176,.22)'; c.fillRect(84,154,16,90); c.fillStyle='#8a6a4e'; c.fillRect(150,196,240,10); for(let x=160;x<380;x+=36){ c.fillRect(x,196,6,50); } c.strokeStyle=INK; c.lineWidth=1.4; c.strokeRect(150,196,240,10); },
  salao:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#3b2744'); g.addColorStop(1,'#7c4a5e'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120);
    for(let i=0;i<5;i++){ const x=-20+i*100; c.fillStyle='#e9d9bd'; c.fillRect(x,30,22,180); c.fillStyle='#d1bb94'; c.fillRect(x+16,30,6,180); }
    for(let i=0;i<3;i++){ const x=70+i*110; c.fillStyle='rgba(255,236,170,.25)'; c.beginPath(); c.arc(x,34,26+Math.sin(tempo*3+i)*2,0,6.283); c.fill(); c.fillStyle='#f2c14e'; c.beginPath(); c.arc(x,34,6,0,6.283); c.fill(); }
    c.fillStyle='#e3798a'; c.fillRect(-60,200,SW+120,80); c.fillStyle='#c25a6c'; for(let x=-60;x<SW+60;x+=40){ c.fillRect(x,200+((x/40)%2?0:0),20,80); } c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(-60,200,SW+120,4); },
  janela:c=>{ c.fillStyle='#2b2433'; c.fillRect(-60,-60,SW+120,SH+120); c.save(); c.beginPath(); c.rect(90,30,180,140); c.clip(); ceuNoite(c,'#18203f','#3b4a7a'); lua(c,220,70,14,.7); c.restore();
    c.strokeStyle='#8a6a4e'; c.lineWidth=8; c.strokeRect(90,30,180,140); c.beginPath(); c.moveTo(180,30); c.lineTo(180,170); c.moveTo(90,100); c.lineTo(270,100); c.lineWidth=5; c.stroke();
    c.fillStyle='#5c4a40'; c.fillRect(-60,196,SW+120,80); c.fillStyle='#e9d9bd'; c.fillRect(60,170,240,12); },
  cinema:c=>{ c.fillStyle='#17142a'; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='#f3f1ea'; c.fillRect(40,22,280,128); const k=Math.floor(tempo*1.3)%4, cs=[['#ff6fa8','#6fd6ff'],['#ffd36b','#ff6fa8'],['#6fd6ff','#b9dc4c'],['#f2a7b8','#ffd36b']][k];
    c.fillStyle='#2b2440'; c.fillRect(46,28,268,116); c.globalAlpha=.8; c.fillStyle=cs[0]; c.fillRect(60+(tempo*30)%120,40,60,80); c.fillStyle=cs[1]; c.fillRect(200,56+Math.sin(tempo*2)*8,70,56); c.globalAlpha=.18+Math.random()*.06; c.fillStyle='#fff'; c.fillRect(46,28,268,116); c.globalAlpha=1;
    c.fillStyle='#ffd36b'; c.font='700 11px Fredoka, sans-serif'; c.textAlign='center'; c.fillText('AMORES EXPRESSOS',180,140); c.fillStyle='#3a2444'; c.fillRect(-60,206,SW+120,80); c.fillStyle='#c25a6c'; for(let x=-40;x<SW+40;x+=48){ c.fillRect(x,214,40,10); } },
  cinemaVazio:c=>{ c.fillStyle='#17142a'; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='#f3f1ea'; c.fillRect(40,22,280,128); c.fillStyle='#fffaf0'; c.fillRect(46,28,268,116); c.fillStyle='#3a2444'; c.fillRect(-60,206,SW+120,80); c.fillStyle='#c25a6c'; for(let x=-40;x<SW+40;x+=48){ c.fillRect(x,214,40,10); }
    c.globalAlpha=.12+.04*Math.sin(tempo*9); c.fillStyle='#fff6c8'; c.beginPath(); c.moveTo(180,250); c.lineTo(46,28); c.lineTo(314,28); c.closePath(); c.fill(); c.globalAlpha=1; },
  rua:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#4f5a72'); g.addColorStop(1,'#8a8fa0'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120); arvores(c,'#4d6450',200,7); chao(c,'#6b7a68',200); c.fillStyle='rgba(180,200,220,.35)'; for(let i=0;i<5;i++){ c.beginPath(); c.ellipse(40+i*72,230,26,4,0,0,6.283); c.fill(); } },
  teatro:c=>{ c.fillStyle='#1d1626'; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='#6b2a3a'; c.fillRect(-60,-60,100,270); c.fillRect(320,-60,100,270); c.fillStyle='#fff3d6'; c.fillRect(50,24,260,140);
    c.fillStyle='#2b2230'; c.beginPath(); c.arc(90,164,26,Math.PI,0); c.fill(); c.beginPath(); c.arc(270,164,20,Math.PI,0); c.fill(); c.fillStyle='#3a2a34'; c.fillRect(-60,206,SW+120,80); },
  ceu:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#9fd0ec'); g.addColorStop(1,'#fbe3ea'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120);
    c.fillStyle='rgba(255,255,255,.9)'; for(let i=0;i<6;i++){ const x=((i*90-tempo*24)%(SW+120)+SW+120)%(SW+120)-60, y=40+i*34; c.beginPath(); c.ellipse(x,y,38,12,0,0,6.283); c.ellipse(x+20,y-6,24,10,0,0,6.283); c.fill(); }
    c.fillStyle='#9cc27c'; c.beginPath(); c.moveTo(-60,250); c.quadraticCurveTo(90,232,180,248); c.quadraticCurveTo(270,236,420,250); c.lineTo(420,320); c.lineTo(-60,320); c.fill(); },
  biblio:c=>{ c.fillStyle='#e9d9bd'; c.fillRect(-60,-60,SW+120,SH+120); const cores=['#e3798a','#86afcf','#f2c14e','#86a86b','#a07bb7','#c99a6b'];
    for(let r=0;r<4;r++){ c.fillStyle='#a07a55'; c.fillRect(-50,24+r*44,460,6); for(let i=0;i<44;i++){ c.fillStyle=cores[(i*5+r*3)%6]; const h=26+((i*7+r)%10); c.fillRect(-46+i*10,30+r*44-h+38,8,h-6); } }
    c.fillStyle='#c99a6b'; c.fillRect(-60,206,SW+120,80); c.fillStyle='rgba(255,236,170,.25)'; c.beginPath(); c.arc(180,120,120,0,6.283); c.fill(); },
  cozinha:c=>{ c.fillStyle='#f3e6d2'; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='#e8d3b4'; for(let x=-48;x<SW+60;x+=24) for(let y=-48;y<110;y+=24) c.fillRect(x+1,y+1,22,22);
    c.fillStyle='#c99a6b'; c.fillRect(-60,176,SW+120,30); c.fillStyle='#4a4545'; c.beginPath(); c.moveTo(130,176); c.lineTo(136,150); c.lineTo(194,150); c.lineTo(200,176); c.fill(); c.fillStyle='#f4a35c'; c.fillRect(134,146,62,6); c.fillStyle='#b98a5e'; c.fillRect(-60,206,SW+120,80); },
  nascer:c=>{ const k=Math.min(1,(cena?cena.tBg:0)/14); const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,k<.5?'#3d3a6b':'#f6b98f'); g.addColorStop(1,k<.5?'#c97a8a':'#ffe7b0'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120);
    c.fillStyle='#ffd36b'; c.beginPath(); c.arc(180,210-k*110,30,0,6.283); c.fill(); c.fillStyle='#86a86b'; c.beginPath(); c.moveTo(-60,200); c.quadraticCurveTo(180,176,420,200); c.lineTo(420,320); c.lineTo(-60,320); c.fill(); },
  observ:c=>{ ceuNoite(c,'#141433','#2f2f63'); c.fillStyle='rgba(185,220,76,'+(.4+.4*Math.sin(tempo*6))+')'; c.beginPath(); c.arc(300,40,4+2*Math.sin(tempo*6),0,6.283); c.fill(); chao(c,'#2f4a35',204); },
  tarde:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#f0a98a'); g.addColorStop(1,'#f8dcb4'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120); c.fillStyle='rgba(255,220,150,.5)'; c.beginPath(); c.arc(70,150,40,0,6.283); c.fill(); arvores(c,'#6f8a5a',204,7); chao(c,'#8faa6c',204); },
  casa:c=>{ const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#f6c9a8'); g.addColorStop(1,'#f5efe3'); c.fillStyle=g; c.fillRect(-60,-60,SW+120,SH+120); arvores(c,'#9cc27c',204,6); chao(c,'#b7cf93',204); },
  preto:c=>{ c.fillStyle='#17142a'; c.fillRect(-60,-60,SW+120,SH+120); }
};
const COR_FUNDO={noite:['#1f1d3d','#34513a'],dia:['#cfe6ef','#b7cf93'],colina:['#1b1a36','#2f4a35'],luas:['#1b1a36','#2f4a35'],feira:['#2b2550','#5c6b48'],madrugada:['#2d3160','#5d6b4f'],padaria:['#f3dfc0','#a07a55'],lago:['#18203f','#22385a'],salao:['#3b2744','#c25a6c'],janela:['#2b2433','#5c4a40'],
  cinema:['#17142a','#3a2444'],cinemaVazio:['#17142a','#3a2444'],rua:['#4f5a72','#6b7a68'],teatro:['#1d1626','#3a2a34'],ceu:['#9fd0ec','#9cc27c'],biblio:['#e9d9bd','#c99a6b'],cozinha:['#f3e6d2','#b98a5e'],observ:['#141433','#2f4a35'],tarde:['#f0a98a','#8faa6c'],casa:['#f6c9a8','#b7cf93'],preto:['#17142a','#17142a']};

/* ---------------- efeitos ---------------- */
let chuva=[], coracoes=[], puffs=[], flash=0, confete=[], parts=[], lagrimas=[];
function efeitoChuva(on){ chuva=on?[...Array(90)].map(()=>({x:Math.random()*(SW+80)-40,y:Math.random()*SH,v:260+Math.random()*120})):[]; }
function burst(x,y,n,conf){ for(let i=0;i<n;i++){ const a=Math.random()*6.283, v=30+Math.random()*60; (conf?confete:coracoes).push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,cor:['#e3798a','#f2c14e','#86afcf','#b9dc4c','#f2a7b8'][i%5],r:Math.random()*6}); } }
function coracao(c,x,y,s){ c.beginPath(); c.moveTo(x,y+s*.35); c.bezierCurveTo(x-s,y-s*.3,x-s*.5,y-s,x,y-s*.45); c.bezierCurveTo(x+s*.5,y-s,x+s,y-s*.3,x,y+s*.35); c.fill(); }
function puff(x,y,n){ for(let i=0;i<n;i++){ const a=Math.random()*6.283; puffs.push({x,y,vx:Math.cos(a)*30,vy:Math.sin(a)*20-10,r:4+Math.random()*5,t:0}); } }
const PARTS={
  vagalumes:()=>({x:Math.random()*SW,y:60+Math.random()*150,f:Math.random()*6,tipo:'vaga'}),
  petalas:()=>({x:Math.random()*(SW+60)-30,y:-10,f:Math.random()*6,tipo:'petala',vy:18+Math.random()*14}),
  folhas:()=>({x:Math.random()*(SW+60)-30,y:-10,f:Math.random()*6,tipo:'folha',vy:22+Math.random()*16}),
  brilhos:()=>({x:Math.random()*SW,y:Math.random()*SH,f:Math.random()*6,tipo:'brilho',vida:1+Math.random()}),
  poeira:()=>({x:Math.random()*SW,y:Math.random()*SH,f:Math.random()*6,tipo:'poeira'}),
  cadentes:()=>({x:Math.random()*SW+60,y:Math.random()*60,f:0,tipo:'cadente',vida:1})
};

/* ---------------- roteiros ---------------- */
// p = perfil de quem está jogando ('g' ou 'n'); o = o outro
function roteiro(id,p){
  const nome=q=>q==='g'?'Gabrix':'Natalix', eu=p, ele=p==='g';
  const R={
  /* ------------------------------------------------------------ prólogo */
  queda:[
    {titulo:'prólogo',sub:'a queda',d:2.6},
    {bg:'noite'},{musica:'tensa'},{fx:'vagalumes',on:1},
    {cam:{x:180,y:90,z:1.25}},
    {leg:'em algum lugar muito longe daqui, a nave de um cadete da Academia Estelar de Veluma perdeu o rumo.',d:3.6},
    {nave:1,x0:-30,y0:10,x1:180,y1:196,d:2.4},
    {junto:[{fx:'flash'},{fx:'treme',d:.8},{cam:{x:180,y:170,z:1.5},d:.6}]},
    {fx:'puff',x:180,y:190,n:16},{espera:1},
    {add:p,heroi:p,disf:false,x:180,y:206,s:1.5,fech:1},
    {espera:1.2},{acorda:p},{olha:p,dir:-1},{espera:.6},{olha:p,dir:1},
    {diz:p,txt:'onde... eu tô?'},
    {emo:p,e:'exclama'},{cam:{x:180,y:150,z:1.1},d:1.6},
    {leg:`${nome(p)} olhou em volta: árvores fofas, um cheiro de sopa no ar, e nenhuma outra nave no céu.`,d:3.4},
    {musica:'triste'},
    {pensa:p,txt:ele?'ninguém respondeu no rádio. ninguém.':'procurei sinal de outra nave por horas. nada.'},
    {pensa:p,txt:'sou o único que sobrou?'},
    {senta:p,on:1},{espera:1.2},
    {leg:'e se os gatos daqui descobrissem o que ele era?'.replace('ele',ele?'ele':'ela'),d:2.8},
    {senta:p,on:0},{diz:p,txt:'ninguém aqui pode saber.'},
    {musica:'cena'},
    {set:p,disf:true},
    {cam:{x:180,y:160,z:1.6},d:1},
    {diz:p,txt:ele?'pronto. um gato comum... de óculos.':'boina, cabelo solto, antena escondida.'},
    {diz:p,txt:ele?'ninguém desconfia de um gato de óculos, né? pode não?':'de longe pareço uma gata normal. de perto... melhor ninguém chegar perto.'},
    {cam:{x:180,y:130,z:1},d:2},
    {leg:'e foi assim que começou a vida mais estranha (e mais bonita) da floresta.',d:3.4}
  ],
  /* ------------------------------------------------------------ 1 */
  disfarce:[
    {titulo:'capítulo 1',sub:'ninguém me vê',d:2.4},
    {bg:'dia'},{musica:'alegre'},
    {add:'nuvem',gato:G.nuvem,x:80,y:214,s:1.3},{add:'toco',gato:G.toco,x:280,y:214,s:1.3,dir:-1},
    {add:p,heroi:p,disf:true,x:180,y:220,s:1.4},
    {cam:{x:180,y:170,z:1.2}},
    {diz:'nuvem',txt:'conta aquela do peixe de novo!'},
    {diz:p,txt:ele?'tá. o peixe chega no banco e fala: "tô nadando em dívidas".':'ah não. eu só sei contar como organizei as caixas por cor.'},
    {junto:[{pulo:'nuvem'},{pulo:'toco'},{emo:'nuvem',e:'risada'},{emo:'toco',e:'risada'}]},
    {diz:'toco',txt:ele?'HAHAHA! esse gato é demais!':'por COR? que gata organizada!'},
    {diz:p,txt:'hehe...'},
    {cam:{x:180,y:160,z:1.8},d:1.4},
    {pensa:p,txt:'eles riem do gato engraçado de gorro. mas não sabem quem tá embaixo dele.'.replace('gorro',ele?'gorro':'boina')},
    {musica:'triste'},{fx:'escurece',on:1},
    {leg:'quanto mais os outros riam, mais sozinho ficava o cadete escondido embaixo do disfarce.'.replace('sozinho',ele?'sozinho':'sozinha').replace('o cadete escondido',ele?'o cadete escondido':'a cadete escondida'),d:3.6},
    {bg:'colina'},{fx:'escurece',on:0},{tira:'nuvem'},{tira:'toco'},{mov:p,x:150,y:206,d:.01},{cam:{x:180,y:130,z:1.05},d:0},
    {fx:'cadentes',on:1},
    {espera:1.2},{senta:p,on:1},
    {pensa:p,txt:'às vezes dá vontade de ir embora.'},
    {pensa:p,txt:'só não sei pra onde.'},
    {cam:{x:200,y:90,z:1.3},d:3},
    {leg:'do outro lado do bosque, alguém olhava pras mesmas estrelas, pensando a mesmíssima coisa.',d:3.6}
  ],
  /* ------------------------------------------------------------ 2 */
  mural:[
    {titulo:'capítulo 2',sub:'o mural de postais',d:2.4},
    {bg:'dia'},{musica:'cena'},{fx:'petalas',on:1},
    {add:'mural',svg:MURAL,svgKey:'mural',box:[-44,-80,88,84],x:180,y:208,s:1.5},
    {cam:{x:180,y:150,z:1.4}},
    {leg:'na praça tinha um mural onde os viajantes penduravam cartões-postais.',d:3},
    {add:'n',heroi:'n',disf:true,x:400,y:226,s:1.25,dir:-1},
    {mov:'n',x:240,y:226,d:1.8},
    {diz:'n',txt:'"lembrança do Rio das Estrelas." pronto.'},
    {pensa:'n',txt:'ninguém nunca comenta nada aqui mesmo.'},
    {mov:'n',x:420,y:226,d:1.6},
    {leg:'no dia seguinte...',d:1.6},
    {add:'g',heroi:'g',disf:true,x:-30,y:226,s:1.25},
    {mov:'g',x:120,y:226,d:1.8},
    {emo:'g',e:'exclama'},{cam:{x:150,y:160,z:1.7},d:1},
    {pensa:'g',txt:'um desenho do mar... assinado só com uma boina.'},
    {escolha:[
      {txt:'escrever uma piada',r:[{diz:'g',txt:'"essas ondas são do tamanho do meu cabelo de manhã."'}]},
      {txt:'escrever um elogio',r:[{diz:'g',txt:'"que mar bonito. ...e essas ondas têm o tamanho do meu cabelo de manhã."'}]}
    ]},
    {mov:'g',x:-40,y:226,d:1.4},{cam:{x:180,y:150,z:1.2},d:1},
    {leg:'na manhã seguinte, a dona da boina voltou.',d:2.4},
    {mov:'n',x:240,y:226,d:1.6},
    {espera:.6},{emo:'n',e:'pontos'},{espera:.8},
    {junto:[{pulo:'n'},{treme:'n',d:.8}]},
    {diz:'n',txt:'hahahaha besta'},
    {rubor:'n',on:1},
    {pensa:'n',txt:'essa letra torta... eu conheço de algum lugar.'},
    {cam:{x:220,y:170,z:1.8},d:1.6},
    {leg:'nenhum dos dois sabia quem tinha escrito. ainda.',d:3}
  ],
  /* ------------------------------------------------------------ 3 */
  feira:[
    {titulo:'capítulo 3',sub:'a feira dos viajantes',d:2.4},
    {bg:'feira'},{musica:'festa'},
    {add:'barraca',bld:'padaria',f:2,n:1,x:180,y:190,s:.95},
    {add:'felco',gato:G.felco,x:180,y:214,s:1.3},
    {fx:'malabares',on:1},{cam:{x:180,y:150,z:1.3}},
    {diz:'felco',txt:'boa noite, viajantes! preparem a barriga pra rir!'},
    {add:'g',heroi:'g',disf:true,x:-30,y:232,s:1.3},{add:'n',heroi:'n',disf:true,x:390,y:232,s:1.3,dir:-1},
    {junto:[{mov:'g',x:86,y:232,d:1.8},{mov:'n',x:274,y:232,d:1.8},{cam:{x:180,y:160,z:1},d:1.6}]},
    {diz:'felco',txt:'por que o gato foi pra escola? pra fazer miau-temática!'},
    {junto:[{pulo:'g'},{pulo:'n'},{emo:'g',e:'risada'},{emo:'n',e:'risada'}]},
    {leg:'os dois riram da mesma piada, na mesma hora, do mesmo jeito.',d:2.8},
    {junto:[{olha:'g',dir:1},{olha:'n',dir:-1}]},{espera:.6},
    {fx:'malabares',on:0},{tira:'felco'},{musica:'romance'},
    {junto:[{mov:'g',x:150,y:232,d:1.2},{mov:'n',x:210,y:232,d:1.2},{cam:{x:180,y:180,z:1.7},d:1.4}]},
    {espera:.5},
    {diz:'g',txt:'...Natalix? da academia?'},
    {emo:'n',e:'exclama'},
    {diz:'n',txt:'Gabrix?! o do cabelo bagunçado?'},
    {diz:'g',txt:'o cabelo é proposital. é... estilo.'},
    {diz:'n',txt:'é um ninho de passarinho, isso sim.'},
    {junto:[{rubor:'g',on:1},{emo:'n',e:'risada'}]},
    {pensa:p,txt:ele?'ela ria das minhas piadas de longe. hoje riu de perto.':'será que ele também caiu aqui? será que também se esconde?'},
    {fx:'coracoes',x:180,y:150,n:10},
    {cam:{x:180,y:140,z:1.1},d:2},
    {leg:'desde a sexta órbita na mesma academia. e só agora, rindo do mesmo show.',d:3.4}
  ],
  /* ------------------------------------------------------------ 4 (novo) */
  fornada:[
    {titulo:'capítulo 4',sub:'a primeira fornada',d:2.4},
    {bg:'madrugada'},{musica:'cena'},
    {leg:'na saída da feira, alguém puxou o Gabrix pelo gorro.',d:2.6},
    {add:'g',heroi:'g',disf:true,x:150,y:230,s:1.3},
    {add:'pacoca',gato:G.pacoca,x:230,y:230,s:1.3,dir:-1},
    {cam:{x:190,y:180,z:1.6}},
    {diz:'pacoca',txt:'quem quer ver a Natalix de novo precisa de um motivo.'},
    {diz:'g',txt:'eu... não falei nada de Natalix nenhuma.'},
    {diz:'pacoca',txt:'nem precisou. pão é um ótimo motivo. vem.'},
    {bg:'padaria'},{musica:'alegre'},{mov:'g',x:120,y:236,d:.01},{mov:'pacoca',x:190,y:236,d:.01},{cam:{x:180,y:160,z:1.2},d:0},
    {leg:'e o Gabrix passou a madrugada inteira sovando massa.',d:2.6},
    {add:'pao',svg:PAO,svgKey:'pao',box:[-14,-14,28,22],x:156,y:206,s:1.2},
    {junto:[{treme:'g',d:1.2},{emo:'g',e:'pontos'}]},
    {diz:'pacoca',txt:'torto. de novo.'},
    {treme:'g',d:1},
    {diz:'pacoca',txt:'torto. de novo.'},
    {junto:[{treme:'g',d:1},{emo:'g',e:'zz'}]},
    {diz:'g',txt:'pronto! um coração!'},
    {cam:{x:156,y:200,z:2.4},d:1},{espera:.8},
    {diz:'pacoca',txt:'...isso é uma batata.'},
    {cam:{x:170,y:170,z:1.4},d:.8},
    {bg:'dia'},{tira:'pacoca'},{tira:'pao'},{musica:'romance'},
    {mov:'g',x:-40,y:228,d:.01},{cam:{x:180,y:160,z:1.2},d:0},
    {add:'n',heroi:'n',disf:true,x:240,y:228,s:1.3,dir:-1},
    {add:'pao2',svg:PAO,svgKey:'pao',box:[-14,-14,28,22],x:-40,y:200,s:1},
    {junto:[{mov:'g',x:150,y:228,d:1.6},{mov:'pao2',x:166,y:198,d:1.6}]},
    {diz:'g',txt:'fiz pra você. é um coração.'},
    {emo:'n',e:'pontos'},
    {diz:'n',txt:'é uma batata?'},
    {diz:'g',txt:'é um coração.'},
    {espera:.8},
    {diz:'n',txt:'...é o coração mais feio que eu já vi.'},
    {tira:'pao2'},{espera:.6},
    {junto:[{pulo:'n'},{emo:'n',e:'coracao'}]},
    {leg:'e comeu inteiro, sem deixar uma migalha.',d:2.8},
    {rubor:'g',on:1},{fx:'coracoes',x:195,y:160,n:8},
    {leg:'(dá pra ajudar a Paçoca na fornada: toque na barraquinha da feira)',d:3}
  ],
  /* ------------------------------------------------------------ 5 */
  lua:[
    {titulo:'capítulo 5',sub:'uma lua cheia por mês',d:2.4},
    {bg:'luas'},{musica:'triste'},
    {add:'g',heroi:'g',disf:true,x:50,y:224,s:1.2},{add:'n',heroi:'n',disf:true,x:310,y:224,s:1.2,dir:-1},
    {cam:{x:180,y:120,z:1}},
    {leg:'o Gabrix foi estudar com os sábios do outro lado do bosque.',d:2.8},
    {leg:'agora era uma lua cheia por mês. só uma.',d:2.8},
    {cam:{x:300,y:180,z:1.8},d:1.2},
    {pensa:'n',txt:'faltam 26 dias.'},{pensa:'n',txt:'não que eu esteja contando.'},
    {cam:{x:60,y:180,z:1.8},d:1.2},
    {pensa:'g',txt:'será que ela lembra de mim quando eu não tô?'},
    {cam:{x:180,y:150,z:1.1},d:1.4},{musica:'romance'},
    {leg:'e a lua cheia chegou.',d:2},
    {junto:[{mov:'g',x:150,y:220,d:2},{mov:'n',x:210,y:220,d:2}]},
    {diz:'n',txt:'demorou.'},
    {diz:'g',txt:'foram só trinta dias.'},
    {diz:'n',txt:'trinta dias é muita coisa, sabia?'},
    {espera:.5},
    {diz:'n',txt:'seu cabelo tá parecendo um ninho de passarinho.'},
    {diz:'g',txt:'pode não?'},
    {junto:[{pulo:'g'},{pulo:'n'},{emo:'n',e:'risada'}]},
    {cam:{x:180,y:170,z:1.6},d:1.6},
    {leg:'ela guardava o lugar do lado dela. e sempre perguntava "pode não?" quando já sabia que ele ia dizer sim.',d:3.8},
    {fx:'coracoes',x:180,y:150,n:6}
  ],
  /* ------------------------------------------------------------ 6 (novo) */
  saudade:[
    {titulo:'capítulo 6',sub:'saudade tem cheiro de lago',d:2.4},
    {bg:'lago'},{musica:'triste'},{fx:'vagalumes',on:1},
    {add:'g',heroi:'g',disf:true,x:200,y:198,s:1.2},
    {add:'vara',svg:VARA,svgKey:'vara',box:[-4,-38,34,42],x:210,y:180,s:1},
    {add:'laranjinha',gato:G.laranjinha,x:250,y:198,s:1.2},
    {cam:{x:180,y:130,z:1}},
    {leg:'um mês é tempo demais.',d:2.2},
    {leg:'toda noite, o Gabrix descia pro lago só pra ter o que fazer com as patas.',d:3},
    {cam:{x:225,y:160,z:1.8},d:2},
    {espera:1},
    {diz:'laranjinha',txt:'saudade é igual pescaria, sabia?'},
    {olha:'g',dir:1},
    {diz:'laranjinha',txt:'a gente não manda na hora que o peixe vem.'},
    {diz:'laranjinha',txt:'só fica ali, esperando, porque sabe que vale a pena.'},
    {espera:.8},{emo:'g',e:'risada'},{espera:.6},
    {chora:'g',on:1},{espera:2},
    {olha:'laranjinha',dir:1},
    {leg:'o Laranjinha fingiu que estava muito concentrado na boia.',d:3},
    {chora:'g',on:0},
    {bg:'janela'},{tira:'g'},{tira:'vara'},{tira:'laranjinha'},{cam:{x:180,y:130,z:1},d:0},
    {add:'n',heroi:'n',disf:true,x:180,y:196,s:1.3},
    {add:'pilha',svg:PILHA,svgKey:'pilha',box:[-12,-26,26,32],x:240,y:172,s:1.4},
    {leg:'do outro lado do bosque, a Natalix escrevia cartas que não mandava.',d:3},
    {pensa:'n',txt:'"hoje a sopa da Nuvem tava sem sal."'},
    {pensa:'n',txt:'"vi um filme. você ia odiar o final."'},
    {pensa:'n',txt:'"volta logo, besta."'},
    {leg:'dezessete cartas.',d:2.2},
    {bg:'lago'},{tira:'pilha'},{musica:'romance'},{mov:'n',x:-40,y:198,d:.01},
    {add:'g',heroi:'g',disf:true,x:240,y:198,s:1.2},{add:'laranjinha',gato:G.laranjinha,x:330,y:198,s:1.1,dir:-1},
    {cam:{x:200,y:150,z:1.3},d:0},
    {leg:'e a lua cheia chegou de novo.',d:2.2},
    {mov:'n',x:196,y:198,d:2},
    {voo:1,x0:196,y0:170,x1:236,y1:170,d:1.2,carta:1},
    {leg:'ele leu uma por uma, no píer, sem falar nada.',d:2.8},
    {pensa:'n',txt:'não olha pra cara dele. não olha pra cara dele.'},
    {leg:'na última, ele riu tanto que...',d:2},
    {junto:[{treme:'g',d:.6},{emo:'g',e:'risada'}]},
    {mov:'g',x:262,y:240,d:.5},{fx:'splash',x:262,y:236},{tira:'g'},
    {junto:[{pulo:'n'},{diz:'n',txt:'GABRIX!'}]},
    {diz:'laranjinha',txt:'eu vi. eu sou testemunha.'},
    {leg:'(no lago agora dá pra pescar com o Laranjinha)',d:3}
  ],
  /* ------------------------------------------------------------ 7 */
  pegou:[
    {titulo:'capítulo 7',sub:'"você me pegou"',d:2.4},
    {bg:'noite'},{musica:'cena'},{fx:'vagalumes',on:1},
    {add:'g',heroi:'g',disf:true,x:70,y:220,s:1.3},{add:'n',heroi:'n',disf:true,x:290,y:220,s:1.3,dir:-1},
    {cam:{x:70,y:170,z:1.8}},
    {pensa:'g',txt:'e se eu perguntar? e se eu estiver errado?'},
    {pensa:'g',txt:'...e se eu estiver certo?'},
    {diz:'g',txt:'vagalume-correio, leva essa carta pra ela?'},
    {cam:{x:180,y:150,z:1},d:1.2},
    {voo:1,x0:90,y0:150,x1:270,y1:150,d:2.4,carta:1},
    {cam:{x:290,y:170,z:1.9},d:1},
    {diz:'n',txt:'"Natalix, acho que você gosta de mim."'},
    {junto:[{rubor:'n',on:1},{treme:'n',d:1}]},
    {pensa:'n',txt:'ele não fez isso. ele NÃO fez isso.'},
    {escolha:[
      {txt:'admitir',r:[{diz:'n',txt:'"você me pegou. que vergonha."'}]},
      {txt:'disfarçar',r:[{diz:'n',txt:'"que absurdo. ...tá. você me pegou. que vergonha."'}]}
    ]},
    {cam:{x:180,y:150,z:1},d:1},
    {voo:1,x0:270,y0:150,x1:90,y1:150,d:2.2,carta:1},
    {cam:{x:70,y:170,z:1.9},d:1},
    {espera:.6},{emo:'g',e:'exclama'},
    {pensa:'g',txt:'...ela gosta.'},
    {pensa:'g',txt:'e eu... eu também. faz tempo.'},
    {rubor:'g',on:1},
    {cam:{x:180,y:150,z:1.1},d:1.4},
    {leg:'e chegou outro vagalume: "então vamos ver uma história juntos. só nós dois. pode não?"',d:3.8},
    {diz:'n',txt:'pode sim.'},
    {fx:'coracoes',x:180,y:160,n:12}
  ],
  /* ------------------------------------------------------------ 8 */
  sombras:[
    {titulo:'capítulo 8',sub:'o teatro de sombras',d:2.4},
    {bg:'teatro'},{musica:'tensa'},
    {add:'g',heroi:'g',disf:true,x:150,y:236,s:1.3},{add:'n',heroi:'n',disf:true,x:210,y:236,s:1.3,dir:-1},
    {cam:{x:180,y:110,z:1}},
    {leg:'teatro de sombras do castelo. história de terror. escolha dele.',d:2.8},
    {pensa:'n',txt:'eu sei que vou me assustar. vim mesmo assim.'},
    {espera:1.2},
    {junto:[{fx:'monstro',d:1.6},{cam:{x:180,y:120,z:1.3},d:.4}]},
    {junto:[{pulo:'n'},{treme:'n',d:.8},{diz:'n',txt:'aaaaah!'}]},
    {mov:'n',x:186,y:236,d:.35},
    {cam:{x:172,y:200,z:2.2},d:1.2},
    {leg:'ela segurou a pata dele.',d:2.2},
    {pensa:'n',txt:'foi sem querer. (não foi.)'},
    {leg:'e não soltou mais.',d:2.2},
    {bg:'noite'},{musica:'romance'},{fx:'vagalumes',on:1},{cam:{x:180,y:160,z:1.4},d:0},{mov:'n',x:200,y:226,d:.01},{mov:'g',x:150,y:226,d:.01},
    {leg:'na saída, a lua tava enorme.',d:2.2},
    {pensa:'g',txt:'é agora. é agora ou nunca.'},
    {mov:'g',x:178,y:226,d:1.2},
    {emo:'n',e:'exclama'},
    {diz:'n',txt:'no próximo.'},
    {espera:.4},{olha:'g',dir:-1},{rubor:'g',on:1},
    {diz:'n',txt:'(sorrindo) prometo.'},
    {pulo:'g'},
    {cam:{x:180,y:130,z:1},d:2},
    {leg:'ele voltou pra casa flutuando. nem precisava de nave.',d:3}
  ],
  /* ------------------------------------------------------------ 9 */
  chuva:[
    {titulo:'capítulo 9',sub:'amores expressos',d:2.6},
    {bg:'cinema'},{musica:'romance'},
    {add:'g',heroi:'g',disf:true,x:150,y:240,s:1.3},{add:'n',heroi:'n',disf:true,x:212,y:240,s:1.3,dir:-1},
    {cam:{x:180,y:110,z:1}},
    {leg:'dois meses depois, o cinema da Rainha passou um filme antigo de outro mundo.',d:3},
    {leg:'luzes de neon. uma música que gruda na cabeça.',d:2.6},
    {cam:{x:181,y:200,z:2},d:2},
    {pensa:'n',txt:'"no próximo." eu prometi.'},
    {junto:[{mov:'g',x:172,y:240,d:1.4},{mov:'n',x:190,y:240,d:1.4}]},
    {fx:'coracoes',x:181,y:180,n:18},
    {leg:'o próximo tinha chegado.',d:2.4},
    {bg:'rua'},{musica:'chuva'},{fx:'chuva',on:1},{cam:{x:180,y:150,z:1.1},d:0},
    {add:'cafe',bld:'cafe',f:2,x:250,y:200,s:.9},
    {mov:'g',x:-30,y:236,d:.01},{mov:'n',x:-60,y:236,d:.01},
    {junto:[{mov:'g',x:140,y:236,d:1.2,corre:1},{mov:'n',x:100,y:236,d:1.2,corre:1}]},
    {diz:'g',txt:'um de maracujá, por favor!'},
    {diz:'n',txt:'e um de morango!'},
    {espera:.6},
    {diz:'n',txt:'...me dá um gole do seu?'},
    {diz:'g',txt:'você sempre faz isso.'},
    {diz:'n',txt:'porque o seu é sempre melhor. pode não?'},
    {cam:{x:120,y:190,z:1.9},d:1.4},{musica:'tensa'},
    {leg:'mas a chuva estava lavando o pó de disfarce...',d:2.8},
    {set:'n',disf:false},
    {emo:'g',e:'exclama'},{espera:.6},
    {set:'g',disf:false},
    {espera:.8},
    {diz:'g',txt:'você... também?!'},
    {diz:'n',txt:'verde. igualzinho a você.'},
    {musica:'romance'},
    {espera:.5},
    {junto:[{emo:'g',e:'risada'},{emo:'n',e:'risada'},{pulo:'g'},{pulo:'n'}]},
    {leg:'pingando, verdes, de antena de fora... e rindo.',d:2.6},
    {fx:'coracoes',x:120,y:150,n:22},
    {cam:{x:180,y:140,z:1},d:2.2},
    {leg:'nunca foram os únicos. só estavam se procurando no lugar errado.',d:3.6}
  ],
  /* ------------------------------------------------------------ 10 */
  pedido:[
    {titulo:'capítulo 10',sub:'o cinema fechado',d:2.6},
    {bg:'cinemaVazio'},{musica:'cena'},
    {add:'n',heroi:'n',disf:false,x:180,y:244,s:1.3},
    {cam:{x:180,y:130,z:1}},
    {leg:'o cinema inteiro, fechado só pra ela.',d:2.4},
    {pensa:'n',txt:'por que ele fechou o cinema? e cadê ele?'},
    {tela:'g',d:3.4},
    {cam:{x:180,y:90,z:1.5},d:1.6},
    {leg:'na tela, ele falou tudo o que sentia.',d:3},
    {cam:{x:180,y:210,z:2.2},d:1.4},
    {chora:'n',on:1},
    {musica:'romance'},
    {leg:'depois tocou a música do primeiro beijo.',d:3},
    {cam:{x:180,y:170,z:1.2},d:1.4},
    {add:'lumi',gato:G.lumi,x:400,y:244,s:1.2,dir:-1,leva:'buque'},
    {mov:'lumi',x:250,y:244,d:1.6},
    {add:'g',heroi:'g',disf:false,x:-40,y:244,s:1.3},
    {mov:'g',x:128,y:244,d:1.8},
    {olha:'n',dir:-1},
    {joelho:'g'},
    {cam:{x:155,y:200,z:2},d:1.2},
    {diz:'g',txt:'Natalix...'},
    {diz:'g',txt:'quer namorar comigo?'},
    {espera:1},
    {diz:'n',txt:'SIM!'},
    {junto:[{pulo:'n'},{chora:'n',on:0},{fx:'coracoes',x:160,y:170,n:26},{fx:'confete',x:180,y:120,n:40},{cam:{x:180,y:150,z:1},d:1.2}]},
    {leg:'claro que ela disse sim.',d:2.8}
  ],
  /* ------------------------------------------------------------ 11 */
  mundo:[
    {titulo:'capítulo 11',sub:'o mundo inteiro',d:2.4},
    {bg:'ceu'},{musica:'alegre'},
    {balao:1,d:9},
    {leg:'a nave virou balão. e o balão virou casa.',d:2.8},
    {postais:1},
    {leg:'China. Peru. Japão. Chile. Canadá. Itália (pizza!). França. Rússia...',d:3.4},
    {leg:'e cada cafeteria pelo caminho: ele pede maracujá, ela pede morango, e ela sempre fica com o dele.',d:3.8},
    {musica:'romance'},
    {leg:'ele passou a vida querendo ir embora sem saber pra onde.',d:3},
    {leg:'agora sabe: pra qualquer lugar, desde que seja com ela.',d:3},
    {leg:'casa não é um planeta. é uma pessoa.',d:3.4}
  ],
  /* ------------------------------------------------------------ 12 */
  veluma:[
    {titulo:'capítulo 12',sub:'o sinal de Veluma',d:2.4},
    {bg:'observ'},{musica:'tensa'},
    {add:'obs',bld:'observatorio',f:2,n:1,x:110,y:200,s:.95},
    {add:'cometa',gato:G.cometa,x:190,y:220,s:1.2},
    {add:'g',heroi:'g',disf:false,x:250,y:228,s:1.25,dir:-1},{add:'n',heroi:'n',disf:false,x:300,y:230,s:1.25,dir:-1,fech:1},
    {cam:{x:300,y:40,z:2}},
    {espera:1.4},
    {cam:{x:220,y:170,z:1.4},d:2},
    {diz:'cometa',txt:'tem um sinal piscando... é código da academia!'},
    {leg:'"cadetes perdidos, respondam. a nave de resgate passa na próxima lua nova."',d:3.6},
    {cam:{x:250,y:190,z:2},d:1.2},
    {pensa:'g',txt:'o caminho de volta. aquele que eu procurei a vida inteira.'},
    {acorda:'n'},
    {diz:'n',txt:'...o que foi? por que você tá com essa cara?'},
    {diz:'g',txt:'é Veluma. eles podem levar a gente de volta.'},
    {musica:'triste'},
    {espera:1},
    {cam:{x:300,y:190,z:2.2},d:1},
    {pensa:'n',txt:'meu quarto. a academia. as estrelas de lá.'},
    {pensa:'n',txt:'...a cafeteria. o cinema da Lumi. as feiras de lua cheia.'},
    {pensa:'n',txt:'o cabelo bagunçado dele.'},
    {musica:'romance'},
    {cam:{x:275,y:180,z:1.6},d:1},
    {diz:'n',txt:'a gente fica. pode não?'},
    {espera:.5},
    {diz:'g',txt:'pode não.'},
    {leg:'ele respondeu o sinal com uma frase só: "obrigado, mas eu já cheguei."',d:3.6},
    {fx:'coracoes',x:275,y:160,n:12}
  ],
  /* ------------------------------------------------------------ 13 (novo) */
  baile:[
    {titulo:'capítulo 13',sub:'o baile do castelo',d:2.4},
    {bg:'salao'},{musica:'valsa'},{fx:'brilhos',on:1},
    {add:'rainha',gato:G.rainha,x:292,y:212,s:1.25,dir:-1},
    {add:'melodia',gato:G.melodia,x:62,y:216,s:1.1},
    {cam:{x:180,y:120,z:1}},
    {diz:'rainha',txt:'depois de cem invernos... o baile do castelo está aberto!'},
    {add:'g',heroi:'g',disf:false,x:-40,y:236,s:1.3},{add:'n',heroi:'n',disf:false,x:400,y:236,s:1.3,dir:-1},
    {junto:[{mov:'g',x:160,y:236,d:1.8},{mov:'n',x:200,y:236,d:1.8},{cam:{x:180,y:190,z:1.6},d:1.8}]},
    {pensa:'g',txt:'um, dois, três. um, dois, três. ensaiei com o Toco. eu consigo.'},
    {gira:['g','n'],d:2,r:30},
    {junto:[{treme:'n',d:.4},{emo:'n',e:'exclama'}]},
    {diz:'n',txt:'ai! meu pé!'},
    {gira:['g','n'],d:1.6,r:30},
    {junto:[{treme:'n',d:.4},{diz:'n',txt:'de novo!'}]},
    {gira:['g','n'],d:1.4,r:30},
    {junto:[{treme:'n',d:.4},{diz:'n',txt:'TRÊS vezes, Gabrix!'}]},
    {diz:'g',txt:'desculpa! eu tô contando os passos!'},
    {cam:{x:180,y:200,z:2.2},d:1},
    {diz:'n',txt:'para de contar os passos.'},
    {diz:'n',txt:'olha pra mim.'},
    {espera:.8},{rubor:'g',on:1},
    {musica:'romance'},
    {cam:{x:180,y:170,z:1.3},d:2},
    {junto:[{gira:['g','n'],d:5,r:34,voltas:2},{fx:'coracoes',x:180,y:170,n:14}]},
    {leg:'e o salão ficou pequeno, e ele esqueceu que não sabia dançar.',d:3.2},
    {fx:'boina'},
    {set:'rainha',gato:{...G.rainha,boina:1}},
    {diz:'rainha',txt:'oh! combina com a coroa, não acham?'},
    {junto:[{emo:'g',e:'risada'},{emo:'n',e:'risada'}]},
    {fx:'vagalumes',on:1},
    {leg:'no fim, os vagalumes entraram pelas janelas. ele disse que tinha combinado com eles. era mentira. foi lindo do mesmo jeito.',d:4.2},
    {leg:'(no castelo agora tem baile: toque no castelo pra dançar)',d:3}
  ],
  /* ------------------------------------------------------------ 14 */
  rainha:[
    {titulo:'capítulo 14',sub:'o segredo da Rainha',d:2.4},
    {bg:'biblio'},{musica:'cena'},{fx:'poeira',on:1},
    {add:'rainha',gato:G.rainha,x:180,y:220,s:1.6},
    {add:'g',heroi:'g',disf:false,x:80,y:236,s:1.25},{add:'n',heroi:'n',disf:false,x:280,y:236,s:1.25,dir:-1},
    {cam:{x:180,y:130,z:1}},
    {leg:'a Rainha chamou os dois na biblioteca e abriu a estante trancada.',d:3},
    {diz:'rainha',txt:'eu também guardo um segredo...'},
    {cam:{x:180,y:150,z:2.2},d:1.6},{musica:'triste'},
    {espera:.8},
    {set:'rainha',gato:G.rainhaAnt},
    {espera:1},
    {emo:'n',e:'exclama'},{emo:'g',e:'exclama'},
    {diz:'rainha',txt:'eu caí aqui há muitos invernos.'},
    {diz:'rainha',txt:'tive medo de ninguém gostar de mim do jeito que eu era.'},
    {diz:'rainha',txt:'demorei pra entender...'},
    {cam:{x:180,y:160,z:1.4},d:1.4},
    {diz:'rainha',txt:'que quem gosta de verdade gosta do jeito que a gente é.'},
    {musica:'romance'},
    {chora:'n',on:1},{espera:1},
    {chora:'g',on:1},
    {pensa:'g',txt:'eu não tô chorando. é poeira de livro.'},
    {diz:'n',txt:'você tá chorando.'},
    {diz:'g',txt:'é poeira de livro.'},
    {junto:[{chora:'g',on:0},{chora:'n',on:0},{pulo:'g'},{pulo:'n'},{fx:'coracoes',x:180,y:140,n:14}]},
    {cam:{x:180,y:130,z:1},d:1.6},
    {leg:'e a Rainha deixou a coroa no trono e foi passear pela vila de antena de fora.',d:3.4}
  ],
  /* ------------------------------------------------------------ 15 */
  cozinha:[
    {titulo:'capítulo 15',sub:'a receita sem carne',d:2.4},
    {bg:'cozinha'},{musica:'alegre'},
    {add:'g',heroi:'g',disf:false,x:120,y:230,s:1.3},
    {cam:{x:150,y:170,z:1.5}},
    {leg:'ela é vegetariana. ele... nem tanto. mas hoje ele quis fazer o jantar pra ela.',d:3.2},
    {fx:'fumacaPreta',on:1},
    {junto:[{treme:'g',d:1},{emo:'g',e:'exclama'}]},
    {diz:'g',txt:'era pra ser uma sopa de abóbora...'},
    {diz:'g',txt:'por que o pão tá pegando fogo?!'},
    {add:'n',heroi:'n',disf:false,x:400,y:230,s:1.3,dir:-1},
    {junto:[{mov:'n',x:220,y:230,d:1.4},{cam:{x:180,y:160,z:1.2},d:1.4}]},{fx:'fumacaPreta',on:0},
    {diz:'n',txt:'...o que aconteceu aqui? caiu outra nave?'},
    {diz:'g',txt:'fiz o jantar! sem carne nenhuma!'},
    {emo:'n',e:'pontos'},
    {diz:'n',txt:'*prova*'},
    {espera:1.2},
    {cam:{x:220,y:190,z:2},d:.8},
    {diz:'n',txt:'tá horrível.'},
    {espera:.8},
    {musica:'romance'},
    {diz:'n',txt:'faz de novo amanhã? pode não?'},
    {cam:{x:180,y:160,z:1.2},d:1},
    {add:'cereja',gato:G.cereja,x:400,y:236,s:1.15,dir:-1,leva:'prato'},
    {mov:'cereja',x:300,y:236,d:1.2},
    {diz:'cereja',txt:'trouxe cheesecake de cereja. eu sabia.'},
    {junto:[{emo:'g',e:'risada'},{emo:'n',e:'risada'}]},
    {mov:'n',x:150,y:230,d:.7},
    {cam:{x:136,y:180,z:2},d:1},
    {fx:'coracoes',x:132,y:150,n:8},
    {rubor:'g',on:1},
    {leg:'um beijinho na orelha. ele ficou vermelho até a ponta das antenas.',d:3.2},
    {leg:'e fez de novo no outro dia. e no outro. e no outro.',d:3}
  ],
  /* ------------------------------------------------------------ 16 */
  atraso:[
    {titulo:'capítulo 16',sub:'cinco minutinhos',d:2.4},
    {bg:'nascer'},{musica:'alegre'},
    {add:'n',heroi:'n',disf:false,x:220,y:220,s:1.3,dir:-1},
    {cam:{x:220,y:170,z:1.6}},
    {leg:'combinaram de ver o nascer do sol do balão.',d:2.6},
    {junto:[{pulo:'n'},{diz:'n',txt:'a gente tá atrasado!!'}]},
    {treme:'n',d:1.2},
    {add:'g',heroi:'g',disf:false,x:-40,y:222,s:1.3},
    {junto:[{mov:'g',x:150,y:222,d:1.4,corre:1},{cam:{x:185,y:170,z:1.3},d:1.4}]},
    {diz:'g',txt:'desculpa! eu tava arrumando o cabelo!'},
    {diz:'n',txt:'e NÃO ADIANTOU NADA!'},
    {emo:'n',e:'exclama'},
    {leg:'ela ficou brava. brava de verdade, de bico e tudo.',d:2.8},
    {espera:.6},
    {diz:'g',txt:'olha... o sol também se atrasou.'},
    {cam:{x:220,y:190,z:2.2},d:1},
    {leg:'ela segurou o riso por um segundo...',d:1.8},
    {leg:'dois...',d:1.2},
    {leg:'três...',d:1.2},
    {junto:[{pulo:'n'},{emo:'n',e:'risada'},{diz:'n',txt:'hahahaha besta'}]},
    {musica:'romance'},
    {cam:{x:180,y:150,z:1.1},d:2},
    {mov:'n',x:176,y:220,d:.7},
    {fx:'coracoes',x:166,y:150,n:12},
    {leg:'o sol nasceu do mesmo jeito, com ela no ombro dele reclamando do cabelo.',d:3.4},
    {pensa:'n',txt:'às vezes eu acho que ele se atrasa de propósito, só pra me fazer rir depois.'}
  ],
  /* ------------------------------------------------------------ 17 (novo) */
  medo:[
    {titulo:'capítulo 17',sub:'o medo de perder',d:2.6},
    {bg:'observ'},{musica:'tensa'},
    {add:'n',heroi:'n',disf:false,x:180,y:228,s:1.3},
    {cam:{x:300,y:40,z:2}},
    {espera:1.4},
    {cam:{x:180,y:180,z:1.6},d:2},
    {leg:'o sinal de Veluma voltou a piscar no céu.',d:2.6},
    {leg:'e o Gabrix começou a sumir toda tarde.',d:2.6},
    {pensa:'n',txt:'ele tá consertando a nave.'},
    {pensa:'n',txt:'ele vai embora.'},
    {musica:'triste'},
    {senta:'n',on:1},{chora:'n',on:1},
    {leg:'três noites sem dormir, fingindo que tava tudo bem.',d:3},
    {bg:'tarde'},{senta:'n',on:0},{chora:'n',on:0},{musica:'tensa'},{fx:'folhas',on:1},
    {add:'obra',svg:OBRA,svgKey:'obra',box:[-80,-180,160,186],x:250,y:206,s:1},
    {add:'g',heroi:'g',disf:false,x:236,y:206,s:1.1,dir:-1},
    {add:'dengo',gato:G.dengo,x:286,y:214,s:.8,dir:-1},
    {mov:'n',x:-40,y:230,d:.01},{cam:{x:180,y:140,z:1},d:0},
    {leg:'no quarto dia, ela seguiu ele pela floresta.',d:2.6},
    {mov:'n',x:120,y:230,d:2.2},
    {cam:{x:220,y:120,z:1.5},d:1.6},
    {leg:'ele estava construindo uma casa. em cima da árvore mais alta.',d:3},
    {diz:'dengo',txt:'*carregando prego na boca*'},
    {cam:{x:150,y:180,z:1.8},d:1.2},
    {chora:'n',on:1},{treme:'n',d:1},
    {emo:'g',e:'exclama'},
    {mov:'g',x:160,y:230,d:1.4},
    {diz:'g',txt:'Natalix?! você... você odiou?'},
    {diz:'n',txt:'eu achei que você tava consertando a nave.'},
    {diz:'n',txt:'que você ia embora.'},
    {musica:'romance'},
    {espera:.8},
    {cam:{x:145,y:185,z:1.9},d:1.2},
    {mov:'g',x:132,y:230,d:.6},
    {diz:'g',txt:'eu não sei voltar pra um lugar onde você não está.'},
    {espera:1},
    {chora:'n',on:0},{fx:'coracoes',x:126,y:170,n:16},
    {cam:{x:180,y:150,z:1.1},d:2},
    {leg:'"medo de perder é só o amor olhando pro escuro", a Rainha disse depois.',d:3.6},
    {leg:'agora dá pra terminar a casa da árvore dos dois.',d:2.8}
  ],
  /* ------------------------------------------------------------ epílogo */
  casa:[
    {titulo:'epílogo',sub:'a nossa casa',d:2.8},
    {bg:'casa'},{musica:'romance'},{fx:'petalas',on:1},
    {add:'casa',bld:'casinha',f:2,x:180,y:200,s:.95},
    {cam:{x:180,y:60,z:1.6}},
    {cam:{x:180,y:150,z:1.05},d:3},
    {add:'g',heroi:'g',disf:false,x:110,y:232,s:1.25},{add:'n',heroi:'n',disf:false,x:250,y:232,s:1.25,dir:-1},
    {add:'dengo',gato:G.dengo,x:180,y:240,s:.9},
    {diz:'dengo',txt:'papai! mamãe!'},
    {pulo:'dengo'},
    {diz:'dengo',txt:'por que vocês têm antena e eu não?'},
    {junto:[{emo:'g',e:'risada'},{emo:'n',e:'risada'}]},
    {leg:'o disfarce a gente não usa mais. a vila conhece a gente de verdade: verdinhos, de antena, de óculos e de cabelo bagunçado.',d:4},
    {add:'nuvem',gato:G.nuvem,x:-30,y:244,s:1},{add:'pacoca',gato:G.pacoca,x:390,y:244,s:1,dir:-1},{add:'rainha',gato:G.rainhaAnt,x:-60,y:248,s:1.1},
    {junto:[{mov:'nuvem',x:50,y:244,d:1.6},{mov:'pacoca',x:310,y:244,d:1.6},{mov:'rainha',x:22,y:248,d:1.8}]},
    {junto:[{pulo:'nuvem'},{pulo:'pacoca'}]},
    {junto:[{mov:'g',x:158,y:232,d:1.2},{mov:'n',x:204,y:232,d:1.2},{cam:{x:180,y:190,z:1.8},d:1.6}]},
    {espera:.6},
    {diz:p,txt:ele?'passei a vida achando que tinha caído no lugar errado.':'eu vivia querendo fugir. agora eu só quero ficar.'},
    {diz:p==='g'?'n':'g',txt:'e agora?'},
    {diz:p,txt:ele?'eu caí exatamente onde você estava.':'todo lugar que eu quero ir, eu quero ir com você.'},
    {fx:'coracoes',x:180,y:160,n:24},{fx:'confete',x:180,y:100,n:30},
    {cam:{x:180,y:130,z:1},d:3},
    {leg:'fim. (ou começo.)',d:3}
  ]
  };
  return R[id];
}

/* ---------------- execução ---------------- */
function percorrer(r,fn){ r.forEach(s=>{ (s.junto||[s]).forEach(fn); if(s.escolha) s.escolha.forEach(o=>percorrer(o.r,fn)); }); }
function preparar(r){
  const lista=[], V=window.VilaArte;
  percorrer(r,x=>{
    if(x.add){ lista.push(sprAtor(x)); if(x.heroi) lista.push(sprAtor({heroi:x.heroi,disf:!x.disf}),sprAtor({heroi:x.heroi,disf:x.disf},1),sprAtor({heroi:x.heroi,disf:!x.disf},1)); if(x.gato) lista.push(sprAtor(x,1)); }
    if(x.set&&x.gato) lista.push(sprAtor({gato:x.gato}),sprAtor({gato:x.gato},1));
    if(x.tela) lista.push(sprAtor({heroi:x.tela,disf:false}));
  });
  lista.push(spr('nave',[-30,-20,60,32],()=>NAVE),spr('buque',[-10,-14,20,32],()=>BUQUE),spr('carta',[-10,-8,20,16],()=>CARTA),spr('prato',[-14,-10,28,16],()=>PRATO),spr('balaoV',[-104,-170,200,190],()=>V.CONSTRUCAO.balao(2,false)));
  V.POSTAIS.forEach(pp=>lista.push(spr('p'+pp.id,[0,0,120,80],()=>V.postalSVG(pp,true).replace(/<\/?svg[^>]*>/g,''))));
  return Promise.all(lista.filter(Boolean).map(s=>s.p));
}
function novoEstado(r,p,fim){ return {r:r.slice(),p,fim,i:-1,t:0,tBg:0,atores:new Map(),bg:'preto',legenda:null,aguarda:0,malab:false,fumaca:false,nave:null,voo:null,tela:null,balao:null,postais:null,monstro:0,
  cam:{x:180,y:130,z:1},camMov:null,barras:0,titulo:null,treme:0,escuro:0,escuroAlvo:0,partTipos:new Set(),escolha:null,boina:null}; }
function proximo(){
  const S=cena; S.i++;
  if(S.i>=S.r.length){ S.aguarda=1.4; S.acabando=true; S.camMov=null; return; }
  const s=S.r[S.i], lista=s.junto||[s];
  let dur=0; lista.forEach(x=>{ dur=Math.max(dur,executar(x)); });
  S.aguarda=dur;
}
const durFala=t=>Math.max(1.7,.9+t.length*.055);
function executar(s){
  const S=cena, V=window.VilaArte;
  if(s.titulo){ S.titulo={t:s.titulo,sub:s.sub,k:0,d:s.d||2.4}; S.bg='preto'; return s.d||2.4; }
  if(s.bg){ S.bg=s.bg; S.fade=1; S.tBg=0; return .35; }
  if(s.cam){ const c=s.cam; if(!s.d){ Object.assign(S.cam,c); S.camMov=null; return 0; } S.camMov={de:{...S.cam},para:{x:c.x??S.cam.x,y:c.y??S.cam.y,z:c.z??S.cam.z},t:0,d:s.d}; return s.bloq?s.d:0; }
  if(s.musica){ try{ V.som.forcar(s.musica); }catch(e){} return 0; }
  if(s.espera) return s.espera;
  if(s.escolha){ mostrarEscolha(s.escolha); return 9999; }
  if(s.add){ S.atores.set(s.add,{k:s.add,heroi:s.heroi,gato:s.gato,bld:s.bld,f:s.f,n:s.n,svg:s.svg,svgKey:s.svgKey,box:s.box,x:s.x,y:s.y,s:s.s||1,dir:s.dir||1,disf:s.disf,fech:s.fech,leva:s.leva,
    pulo:0,mov:null,fala:null,alpha:1,joelho:0,rabo:Math.random()*6,blink:2+Math.random()*3,emo:null,rubor:0,rubAlvo:0,chora:false,treme:0,senta:0,sentaAlvo:0,squash:0,gira:null}); return 0; }
  if(s.tira){ S.atores.delete(s.tira); return 0; }
  const k=s.mov||s.diz||s.pensa||s.pulo||s.set||s.joelho||s.acorda||s.emo||s.rubor||s.chora||s.olha||s.treme||s.senta;
  const a=S.atores.get(k);
  if(s.mov&&a){ a.mov={x0:a.x,y0:a.y,x1:s.x,y1:s.y,t:0,d:s.d||1}; a.corre=!!s.corre; if(s.x!==a.x) a.dir=s.x<a.x?-1:1; return s.d||1; }
  if(s.diz&&a){ const d=s.d||durFala(s.txt); a.fala={txt:s.txt,t:d,d,pensa:false}; return d; }
  if(s.pensa&&a){ const d=s.d||durFala(s.txt)+.3; a.fala={txt:s.txt,t:d,d,pensa:true}; return d; }
  if(s.pulo&&a){ a.pulo=1; return .5; }
  if(s.joelho&&a){ a.joelho=1; return .6; }
  if(s.acorda&&a){ a.fech=false; a.pulo=1; return .6; }
  if(s.emo&&a){ a.emo={e:s.e,t:1.6}; return .5; }
  if(s.rubor&&a){ a.rubAlvo=s.on?1:0; return .3; }
  if(s.chora&&a){ a.chora=!!s.on; return .3; }
  if(s.olha&&a){ a.dir=s.dir||-a.dir; return .35; }
  if(s.treme&&a){ a.treme=s.d||.8; return s.d||.8; }
  if(s.senta&&a){ a.sentaAlvo=s.on?1:0; return .4; }
  if(s.set&&a){ if(s.gato) a.gato=s.gato; if(s.disf!=null) a.disf=s.disf; puff(a.x,a.y-30*a.s,12); V.som.chime(); return 1; }
  if(s.gira){ const [x,y]=s.gira.map(q=>S.atores.get(q)); if(x&&y){ const cx=(x.x+y.x)/2, cy=(x.y+y.y)/2; const g={cx,cy,r:s.r||20,t:0,d:s.d||2,voltas:s.voltas||1,a0:Math.atan2(x.y-cy,x.x-cx)}; x.gira={...g,fase:0}; y.gira={...g,fase:Math.PI}; } return s.d||2; }
  if(s.leg){ S.legenda={txt:s.leg,t:0,d:s.d||2.6}; return s.d||2.6; }
  if(s.fx==='flash'){ flash=1; return .5; }
  if(s.fx==='treme'){ S.treme=s.d||.6; return 0; }
  if(s.fx==='escurece'){ S.escuroAlvo=s.on?.45:0; return .6; }
  if(s.fx==='puff'){ puff(s.x,s.y,s.n||10); return .6; }
  if(s.fx==='splash'){ for(let i=0;i<16;i++){ const a=-Math.PI*Math.random(); puffs.push({x:s.x,y:s.y,vx:Math.cos(a)*50,vy:Math.sin(a)*70,r:3,t:0,agua:1}); } V.som.blip(.4); return .5; }
  if(s.fx==='chuva'){ efeitoChuva(!!s.on); return .2; }
  if(s.fx==='coracoes'){ burst(s.x,s.y,s.n||10); V.som.chime(); return .9; }
  if(s.fx==='confete'){ burst(s.x,s.y,s.n||30,1); V.som.fanfarra(); return .2; }
  if(s.fx==='malabares'){ S.malab=!!s.on; return 0; }
  if(s.fx==='fumacaPreta'){ S.fumaca=!!s.on; return 0; }
  if(s.fx==='boina'){ S.boina={t:0}; return 1.4; }
  if(s.fx==='monstro'){ S.monstro=s.d||1.6; V.som.blip(.3); return s.d||1.6; }
  if(s.fx&&PARTS[s.fx]){ if(s.on) S.partTipos.add(s.fx); else { S.partTipos.delete(s.fx); } return 0; }
  if(s.nave){ S.nave={...s,t:0}; return s.d; }
  if(s.voo){ S.voo={...s,t:0}; return s.d; }
  if(s.tela){ S.tela={q:s.tela,t:0}; return s.d||2; }
  if(s.balao){ S.balao={t:0,d:s.d}; return 1.2; }
  if(s.postais){ S.postais={t:0}; return .2; }
  return 0;
}
/* escolhas: dois botões por cima do palco; a escolhida entra no roteiro */
function mostrarEscolha(ops){
  const S=cena, box=ov.querySelector('.escolha'); box.innerHTML='';
  ops.forEach(o=>{ const b=document.createElement('button'); b.textContent=o.txt; b.addEventListener('click',e=>{ e.stopPropagation(); box.classList.remove('on'); S.r.splice(S.i+1,0,...o.r); S.escolha=null; S.aguarda=0; window.VilaArte.som.blip(1); }); box.appendChild(b); });
  box.classList.add('on'); S.escolha=ops;
}
function passo(dt){
  const S=cena; S.t+=dt; S.tBg+=dt; tempo+=dt;
  if(S.fade>0) S.fade=Math.max(0,S.fade-dt*2.6);
  if(S.titulo){ S.titulo.k+=dt; if(S.titulo.k>S.titulo.d+.5) S.titulo=null; }
  S.barras=Math.min(1,S.barras+dt*.8);
  if(S.camMov){ const m=S.camMov; m.t+=dt; const k=Math.min(1,m.t/m.d), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; S.cam.x=m.de.x+(m.para.x-m.de.x)*e; S.cam.y=m.de.y+(m.para.y-m.de.y)*e; S.cam.z=m.de.z+(m.para.z-m.de.z)*e; if(k>=1) S.camMov=null; }
  if(S.treme>0) S.treme=Math.max(0,S.treme-dt);
  S.escuro+=(S.escuroAlvo-S.escuro)*Math.min(1,dt*2);
  for(const a of S.atores.values()){
    if(a.mov){ a.mov.t+=dt; const k=Math.min(1,a.mov.t/a.mov.d), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; a.x=a.mov.x0+(a.mov.x1-a.mov.x0)*e; a.y=a.mov.y0+(a.mov.y1-a.mov.y0)*e; if(k>=1){ a.mov=null; if(a.heroi||a.gato) a.squash=.8; } }
    if(a.gira){ const g=a.gira; g.t+=dt; const k=Math.min(1,g.t/g.d), ang=g.a0+g.fase+k*Math.PI*2*g.voltas; a.x=g.cx+Math.cos(ang)*g.r; a.y=g.cy+Math.sin(ang)*g.r*.35; a.dir=Math.sin(ang)>0?1:-1; if(k>=1){ a.gira=null; } }
    if(a.pulo>0){ a.pulo=Math.max(0,a.pulo-dt*2.2); if(a.pulo===0) a.squash=1; }
    if(a.squash>0) a.squash=Math.max(0,a.squash-dt*5);
    if(a.treme>0) a.treme=Math.max(0,a.treme-dt);
    a.senta+=(a.sentaAlvo-a.senta)*Math.min(1,dt*5);
    a.rubor+=(a.rubAlvo-a.rubor)*Math.min(1,dt*3);
    a.rabo+=dt*(a.mov?2:a.emo&&a.emo.e==='coracao'?3:1);
    a.blink-=dt; if(a.blink<-.14) a.blink=2+Math.random()*3.5;
    if(a.fala){ a.fala.t-=dt; if(a.fala.t<=0) a.fala=null; }
    if(a.emo){ a.emo.t-=dt; if(a.emo.t<=0) a.emo=null; }
    if(a.chora&&Math.random()<dt*3) lagrimas.push({x:a.x+(Math.random()<.5?-6:6)*a.s*a.dir,y:a.y-28*a.s,vy:10,t:0});
  }
  if(S.legenda){ S.legenda.t+=dt; if(S.legenda.t>S.legenda.d+.4) S.legenda=null; }
  if(S.nave){ S.nave.t+=dt; if(S.nave.t>S.nave.d) S.nave=null; }
  if(S.voo){ S.voo.t+=dt; if(S.voo.t>S.voo.d) S.voo=null; }
  if(S.boina){ S.boina.t+=dt; if(S.boina.t>1.4) S.boina=null; }
  if(S.tela) S.tela.t+=dt;
  if(S.balao) S.balao.t+=dt;
  if(S.postais) S.postais.t+=dt;
  if(S.monstro>0) S.monstro=Math.max(0,S.monstro-dt);
  if(flash>0) flash=Math.max(0,flash-dt*2);
  for(const d of chuva){ d.y+=d.v*dt; d.x-=d.v*dt*.15; if(d.y>SH){ d.y=-10; d.x=Math.random()*(SW+80); } }
  for(const arr of [coracoes,confete]) for(let i=arr.length-1;i>=0;i--){ const h=arr[i]; h.t+=dt; h.x+=h.vx*dt; h.y+=h.vy*dt; h.vy+=arr===confete?60*dt:-10*dt; h.vx*=.98; if(h.t>2.2) arr.splice(i,1); }
  for(let i=puffs.length-1;i>=0;i--){ const f=puffs[i]; f.t+=dt; f.x+=f.vx*dt; f.y+=f.vy*dt; if(f.agua) f.vy+=160*dt; else f.r+=dt*8; if(f.t>.9) puffs.splice(i,1); }
  for(let i=lagrimas.length-1;i>=0;i--){ const l=lagrimas[i]; l.t+=dt; l.vy+=120*dt; l.y+=l.vy*dt; if(l.t>.6) lagrimas.splice(i,1); }
  // partículas de ambiente
  for(const tipo of S.partTipos){ const n=parts.filter(p=>p.tipo===PARTS[tipo]().tipo).length, alvo={vagalumes:16,petalas:12,folhas:10,brilhos:18,poeira:20,cadentes:1}[tipo]; if(n<alvo&&Math.random()<dt*(tipo==='cadentes'?.4:6)) parts.push(PARTS[tipo]()); }
  for(let i=parts.length-1;i>=0;i--){ const q=parts[i]; q.f+=dt;
    if(q.tipo==='vaga'){ q.x+=Math.cos(q.f*.7)*dt*10; q.y+=Math.sin(q.f*.9)*dt*8; if(!S.partTipos.has('vagalumes')&&Math.random()<dt) parts.splice(i,1); }
    else if(q.tipo==='petala'||q.tipo==='folha'){ q.y+=q.vy*dt; q.x+=Math.sin(q.f*1.6)*dt*24; if(q.y>SH+10) parts.splice(i,1); }
    else if(q.tipo==='brilho'){ q.vida-=dt; if(q.vida<=0) parts.splice(i,1); }
    else if(q.tipo==='poeira'){ q.x+=Math.sin(q.f*.4)*dt*4; q.y+=Math.cos(q.f*.3)*dt*3; if(!S.partTipos.has('poeira')&&Math.random()<dt) parts.splice(i,1); }
    else if(q.tipo==='cadente'){ q.x-=dt*220; q.y+=dt*90; q.vida-=dt; if(q.vida<=0) parts.splice(i,1); }
  }
  if(S.fumaca&&Math.random()<dt*8) puffs.push({x:165+Math.random()*10,y:146,vx:(Math.random()-.5)*10,vy:-24,r:5,t:0,preta:1});
  if(S.escolha) return;
  S.aguarda-=dt;
  if(S.aguarda<=0){ if(S.acabando){ terminar(); return; } proximo(); }
}

function desenharAtor(c,a){
  const vivo=!!(a.heroi||a.gato);
  const fech=vivo&&(a.fech||a.blink<0||(a.emo&&a.emo.e==='risada'));
  let s=sprAtor(a,fech); if(!s||!s.ok){ s=sprAtor(a,false); if(!s||!s.ok) return; }
  const andando=a.mov&&vivo, f=a.corre?16:12;
  const bob=andando?-Math.abs(Math.sin(tempo*f))*(a.corre?4:3):0, pul=a.pulo>0?-Math.sin(a.pulo*Math.PI)*16:0;
  const resp=vivo?1+Math.sin(tempo*2.6+a.x)*.02:1;
  let sx=1, sy=resp, rot=andando?Math.sin(tempo*f)*.05:0;
  if(a.joelho) sy*=.82;
  if(a.senta>0){ sy*=1-.1*a.senta; sx*=1+.05*a.senta; }
  if(a.squash>0){ sy*=1-.13*a.squash; sx*=1+.1*a.squash; }
  if(a.pulo>.85){ sy*=.9; sx*=1.06; } else if(a.pulo>0){ sy*=1+Math.sin(a.pulo*Math.PI)*.07; }
  if(a.fala&&!a.fala.pensa&&vivo) rot+=Math.sin(tempo*7)*.025;
  const tx=a.treme>0?Math.sin(tempo*60)*1.6:0;
  c.save(); c.translate(a.x+tx,a.y+bob+pul); c.rotate(rot); c.scale(a.s*a.dir*sx,a.s*sy);
  if(vivo&&window.VilaArte.rabo){ const ang=Math.sin(a.rabo*(a.mov?4:1.6))*(a.mov?.3:.2)+(a.senta*.25); window.VilaArte.rabo(c,corAtor(a),ang,!!a.heroi); }
  c.drawImage(s.img,s.x,s.y,s.w,s.h);
  if(vivo&&a.rubor>.02){ c.globalAlpha=a.rubor*.75; c.fillStyle='#ef6f86'; c.beginPath(); c.ellipse(-9,-23.4,4.2,2.4,0,0,6.283); c.ellipse(9,-23.4,4.2,2.4,0,0,6.283); c.fill(); c.globalAlpha=1; }
  c.restore();
  if(a.leva){ const L=IMG.get(a.leva); if(L&&L.ok) c.drawImage(L.img,a.x+a.dir*14*a.s-L.w*.6,a.y-30*a.s+bob,L.w*1.2,L.h*1.2); }
}
function desenharFala(c,a){
  const F=a.fala, txt=F.txt, nv=Math.floor(txt.length*Math.min(1,(F.d-F.t)/Math.max(.35,Math.min(1.1,F.d*.4)))), vis=txt.slice(0,Math.max(1,nv));
  c.font='800 11px Nunito, sans-serif';
  const quebra=t=>{ const pal=t.split(' '), lin=[]; let l=''; pal.forEach(w=>{ const tt=l?l+' '+w:w; if(c.measureText(tt).width>150&&l){ lin.push(l); l=w; } else l=tt; }); if(l) lin.push(l); return lin; };
  const linT=quebra(txt), lin=quebra(vis);
  const w=Math.min(170,Math.max(...linT.map(x=>c.measureText(x).width))+18), h=linT.length*13+12;
  const P=naTela(a.x,a.y-64*a.s-(a.pulo>0?10:0)), bh=16*cena.barras;
  const ax=Math.max(26,Math.min(SW-26,P.x));
  let x=Math.max(w/2+19,Math.min(SW-w/2-19,ax)), y=Math.max(bh+4,P.y-h-6);
  c.globalAlpha=Math.min(1,(F.d-F.t)*6,F.t*5);
  c.fillStyle=F.pensa?'rgba(255,253,248,.94)':'#fffdf8'; c.strokeStyle=INK; c.lineWidth=1.6;
  if(F.pensa){ c.setLineDash([3,3]); }
  c.beginPath(); if(c.roundRect) c.roundRect(x-w/2,y,w,h,F.pensa?12:8); else c.rect(x-w/2,y,w,h); c.fill(); c.stroke(); c.setLineDash([]);
  if(F.pensa){ [[0,5,3.4],[4,12,2.2]].forEach(([dx,dy,r])=>{ c.beginPath(); c.arc(ax+dx*a.dir,y+h+dy,r,0,6.283); c.fill(); c.stroke(); }); }
  else { const tx=Math.max(x-w/2+10,Math.min(x+w/2-10,ax)); c.beginPath(); c.moveTo(tx-5,y+h); c.lineTo(tx,y+h+7); c.lineTo(tx+5,y+h); c.fill(); c.stroke(); c.fillRect(tx-4,y+h-2,8,3); }
  c.fillStyle=F.pensa?'#7a6a5e':INK; c.textAlign='center'; c.font=(F.pensa?'italic 700 ':'800 ')+'11px Nunito, sans-serif';
  lin.forEach((t,i)=>c.fillText(t,x,y+16+i*13)); c.globalAlpha=1;
}
function naTela(x,y){ const S=cena; return {x:(x-S.cam.x)*S.cam.z+SW/2, y:(y-S.cam.y)*S.cam.z+SH/2}; }
function desenhar(){
  const c=ctx, S=cena;
  let cf=COR_FUNDO[S.bg]||COR_FUNDO.preto; if(S.bg==='nascer'){ const k=Math.min(1,S.tBg/14); cf=[k<.5?'#3d3a6b':'#f6b98f','#86a86b']; }
  c.setTransform(1,0,0,1,0,0); c.fillStyle=cf[0]; c.fillRect(0,0,cv.width,oy+SH*esc*.5); c.fillStyle=cf[1]; c.fillRect(0,oy+SH*esc*.5,cv.width,cv.height);
  // câmera (com tremidinha)
  const tr=S.treme>0?S.treme*5:0, z=S.cam.z;
  c.setTransform(esc,0,0,esc,ox,oy);
  c.save(); c.beginPath(); c.rect(-200,-200,SW+400,SH+400); c.clip();
  c.translate(SW/2+(tr?Math.sin(tempo*70)*tr:0),SH/2+(tr?Math.cos(tempo*63)*tr:0)); c.scale(z,z); c.translate(-S.cam.x,-S.cam.y);
  (FUNDO[S.bg]||FUNDO.preto)(c);
  if(S.monstro>0){ const k=S.monstro; c.fillStyle='#1d1626'; c.save(); c.translate(180,150-Math.sin(Math.min(1,(1.6-k)*3)*Math.PI/2)*60); c.scale(1.4,1.4); c.beginPath(); c.moveTo(-40,40); c.lineTo(-30,-10); c.lineTo(-44,-30); c.lineTo(-20,-24); c.lineTo(-10,-46); c.lineTo(0,-26); c.lineTo(14,-48); c.lineTo(22,-22); c.lineTo(46,-30); c.lineTo(32,-8); c.lineTo(40,40); c.closePath(); c.fill(); c.fillStyle='#fff3d6'; c.beginPath(); c.arc(-12,-6,5,0,6.283); c.arc(12,-6,5,0,6.283); c.fill(); c.restore(); }
  if(S.tela){ const sp=sprAtor({heroi:S.tela.q,disf:false}); if(sp.ok){ c.save(); c.globalAlpha=.85+Math.random()*.1; c.beginPath(); c.rect(46,28,268,116); c.clip(); c.translate(180,150); c.scale(2.1,2.1); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); c.globalAlpha=1; }
    const k=S.tela.t; for(let i=0;i<2;i++){ const q=((k*.5+i*.5)%1); c.globalAlpha=q<.2?q*5:1-q; c.fillStyle='#e3798a'; c.font='700 16px sans-serif'; c.fillText('♪',90+i*180+q*10,120-q*50); } c.globalAlpha=1; }
  if(S.balao){ const b=IMG.get('balaoV'); const k=Math.min(1,S.balao.t/S.balao.d); const y=250-k*130+Math.sin(tempo*1.2)*4;
    if(b&&b.ok){ c.save(); c.translate(180,y); c.scale(.85,.85); c.drawImage(b.img,b.x,b.y,b.w,b.h); c.restore(); }
    ['g','n'].forEach((q,i)=>{ const sp=sprAtor({heroi:q,disf:false}); if(sp.ok){ c.save(); c.translate(172+i*16,y-30); c.scale(.45*(i?-1:1),.45); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); } }); }
  if(S.postais){ const V=window.VilaArte; V.POSTAIS.forEach((pp,i)=>{ const t=S.postais.t-i*.5; if(t<0||t>5) return; const sp=IMG.get('p'+pp.id); if(!sp||!sp.ok) return; const x=SW+40-t*90, y=40+(i%4)*40+Math.sin(t*2+i)*6; c.save(); c.translate(x,y); c.rotate(Math.sin(t+i)*.2); c.drawImage(sp.img,-30,-20,60,40); c.restore(); }); }
  for(const q of parts) if(q.tipo==='cadente'){ c.strokeStyle=`rgba(255,246,200,${q.vida})`; c.lineWidth=1.6; c.beginPath(); c.moveTo(q.x,q.y); c.lineTo(q.x+24,q.y-10); c.stroke(); }
  const atores=[...S.atores.values()].sort((a,b)=>a.y-b.y);
  atores.forEach(a=>desenharAtor(c,a));
  if(S.malab){ for(let i=0;i<3;i++){ const ang=tempo*4+i*2.09; const a=S.atores.get('felco'); if(!a) break; c.fillStyle=['#e3606e','#f2c14e','#86afcf'][i]; c.beginPath(); c.arc(a.x+Math.cos(ang)*18,a.y-92-Math.abs(Math.sin(ang))*22,4.5,0,6.283); c.fill(); c.strokeStyle=INK; c.lineWidth=1; c.stroke(); } }
  if(S.boina){ const k=Math.min(1,S.boina.t/1.2), r=S.atores.get('rainha'), n=S.atores.get('n'); if(r&&n){ const x=n.x+(r.x-n.x)*k, y=(n.y-60)+(r.y-76*r.s-(n.y-60))*k-Math.sin(k*Math.PI)*60; c.save(); c.translate(x,y); c.rotate(k*12); c.fillStyle='#8c2f3c'; c.strokeStyle=INK; c.lineWidth=1.6; c.beginPath(); c.ellipse(0,0,12,5,0,0,6.283); c.fill(); c.stroke(); c.restore(); } }
  if(S.nave){ const k=Math.min(1,S.nave.t/S.nave.d), x=S.nave.x0+(S.nave.x1-S.nave.x0)*k, y=S.nave.y0+(S.nave.y1-S.nave.y0)*k*k; const n=IMG.get('nave');
    c.strokeStyle='rgba(185,220,76,.7)'; c.lineWidth=6; c.beginPath(); c.moveTo(S.nave.x0,S.nave.y0); c.lineTo(x,y); c.stroke();
    if(n&&n.ok){ c.save(); c.translate(x,y); c.rotate(.5); c.drawImage(n.img,n.x,n.y,n.w,n.h); c.restore(); } }
  if(S.voo){ const k=Math.min(1,S.voo.t/S.voo.d), x=S.voo.x0+(S.voo.x1-S.voo.x0)*k, y=S.voo.y0-Math.sin(k*Math.PI)*40+Math.sin(tempo*10)*2;
    c.globalCompositeOperation='lighter'; c.fillStyle='rgba(255,236,120,.6)'; c.beginPath(); c.arc(x,y,9,0,6.283); c.fill(); c.globalCompositeOperation='source-over'; c.fillStyle='#fff6a8'; c.beginPath(); c.arc(x,y,3.4,0,6.283); c.fill();
    const ct=IMG.get('carta'); if(S.voo.carta&&ct&&ct.ok) c.drawImage(ct.img,x-8,y+4,16,12); }
  for(const f of puffs){ c.globalAlpha=Math.max(0,.8*(1-f.t/.9)); c.fillStyle=f.preta?'#5c5550':f.agua?'#9fd0ec':'#fbf7ef'; c.beginPath(); c.arc(f.x,f.y,f.r,0,6.283); c.fill(); } c.globalAlpha=1;
  c.fillStyle='#9fd0ec'; for(const l of lagrimas){ c.globalAlpha=1-l.t/.6; c.beginPath(); c.ellipse(l.x,l.y,1.6,2.4,0,0,6.283); c.fill(); } c.globalAlpha=1;
  for(const q of parts){
    if(q.tipo==='vaga'){ const a=.5+.5*Math.sin(tempo*3+q.f); c.globalCompositeOperation='lighter'; c.fillStyle=`rgba(255,236,120,${.35*a})`; c.beginPath(); c.arc(q.x,q.y,6,0,6.283); c.fill(); c.globalCompositeOperation='source-over'; c.fillStyle=`rgba(255,250,200,${a})`; c.beginPath(); c.arc(q.x,q.y,1.6,0,6.283); c.fill(); }
    else if(q.tipo==='petala'){ c.fillStyle='#f6c3cf'; c.save(); c.translate(q.x,q.y); c.rotate(q.f*2); c.beginPath(); c.ellipse(0,0,3.4,2,0,0,6.283); c.fill(); c.restore(); }
    else if(q.tipo==='folha'){ c.fillStyle='#e0a85a'; c.save(); c.translate(q.x,q.y); c.rotate(q.f*1.4); c.beginPath(); c.ellipse(0,0,4,2.2,0,0,6.283); c.fill(); c.restore(); }
    else if(q.tipo==='brilho'){ const a=Math.sin(Math.min(1,q.vida)*Math.PI); c.fillStyle=`rgba(255,246,200,${a})`; c.beginPath(); c.moveTo(q.x,q.y-4); c.lineTo(q.x+1,q.y); c.lineTo(q.x,q.y+4); c.lineTo(q.x-1,q.y); c.closePath(); c.moveTo(q.x-4,q.y); c.lineTo(q.x,q.y+1); c.lineTo(q.x+4,q.y); c.lineTo(q.x,q.y-1); c.closePath(); c.fill(); }
    else if(q.tipo==='poeira'){ c.fillStyle='rgba(255,240,200,.5)'; c.beginPath(); c.arc(q.x,q.y,.9,0,6.283); c.fill(); }
  }
  if(chuva.length){ c.fillStyle='rgba(60,70,100,.15)'; c.fillRect(-60,-60,SW+120,SH+120); c.strokeStyle='rgba(220,232,245,.7)'; c.lineWidth=1; c.beginPath(); for(const d of chuva){ c.moveTo(d.x,d.y); c.lineTo(d.x-2,d.y+9); } c.stroke(); }
  for(const h of coracoes){ c.globalAlpha=Math.max(0,1-h.t/2.2); c.fillStyle=h.cor; coracao(c,h.x,h.y,7); } c.globalAlpha=1;
  for(const h of confete){ c.globalAlpha=Math.max(0,1-h.t/2.2); c.fillStyle=h.cor; c.save(); c.translate(h.x,h.y); c.rotate(h.t*6+h.r); c.fillRect(-3,-1.5,6,3); c.restore(); } c.globalAlpha=1;
  c.restore();
  // balões e emoções em cima de tudo, no tamanho da tela
  atores.forEach(a=>{ if(a.emo){ const k=Math.min(1,(1.6-a.emo.t)*5), P=naTela(a.x+a.dir*10*a.s,a.y-62*a.s); c.save(); c.translate(P.x,P.y-12-(1-k)*6); c.scale(1.15,1.15); window.VilaArte.desenharEmo(c,0,0,a.emo.e,Math.min(k,a.emo.t*3)); c.restore(); } });
  atores.forEach(a=>{ if(a.fala) desenharFala(c,a); });
  // fora da câmera: vinheta, escurecer, faixas de cinema, legenda, título
  if(S.escuro>.01){ c.fillStyle=`rgba(23,20,42,${S.escuro})`; c.fillRect(0,0,SW,SH); }
  const vg=c.createRadialGradient(SW/2,SH/2,SH*.42,SW/2,SH/2,SH*.95); vg.addColorStop(0,'rgba(20,14,30,0)'); vg.addColorStop(1,'rgba(20,14,30,.42)'); c.fillStyle=vg; c.fillRect(0,0,SW,SH);
  const bh=16*S.barras; c.fillStyle='#120f1d'; c.fillRect(-200,-200,SW+400,200+bh); c.fillRect(-200,SH-bh,SW+400,200+bh);
  if(S.legenda){ const L=S.legenda, k=Math.min(1,L.t*3); c.globalAlpha=Math.min(k,Math.max(0,(L.d+.4-L.t)*3));
    c.font='700 12px Nunito, sans-serif'; const n=Math.floor(L.txt.length*Math.min(1,L.t/Math.max(.6,L.d*.45))), t=L.txt.slice(0,n);
    const pal=t.split(' '), lin=[]; let l=''; pal.forEach(w=>{ const tt=l?l+' '+w:w; if(c.measureText(tt).width>300&&l){ lin.push(l); l=w; } else l=tt; }); if(l) lin.push(l);
    const h=Math.max(1,lin.length)*16+12; c.fillStyle='rgba(18,15,29,.78)'; c.fillRect(0,SH-bh-h,SW,h); c.fillStyle='#fbf7ef'; c.textAlign='center'; lin.forEach((x,i)=>c.fillText(x,SW/2,SH-bh-h+20+i*16)); c.globalAlpha=1; }
  if(S.titulo){ const T=S.titulo, a=Math.min(1,T.k*1.6,Math.max(0,(T.d+.5-T.k)*2)); c.globalAlpha=a; c.textAlign='center';
    c.fillStyle='#f2c14e'; c.font='700 11px Fredoka, sans-serif'; c.fillText(T.t.toUpperCase(),SW/2,SH/2-14);
    c.fillStyle='#fbf7ef'; c.font='700 22px Fredoka, sans-serif'; c.fillText(T.sub,SW/2,SH/2+14);
    c.strokeStyle='rgba(242,193,78,.6)'; c.lineWidth=1; const w=Math.min(1,T.k)*60; c.beginPath(); c.moveTo(SW/2-w,SH/2+28); c.lineTo(SW/2+w,SH/2+28); c.stroke(); c.globalAlpha=1; }
  if(flash>0){ c.fillStyle=`rgba(230,255,190,${flash})`; c.fillRect(0,0,SW,SH); }
  if(S.fade>0){ c.fillStyle=`rgba(23,20,42,${S.fade})`; c.fillRect(-200,-200,SW+400,SH+400); }
}
function loop(ts){
  if(!cena) return; raf=requestAnimationFrame(loop);
  const dt=last?Math.min(.05,(ts-last)/1000):0; last=ts;
  passo(dt); if(cena) desenhar();
}
function medir(){
  const W=ov.clientWidth, H=ov.clientHeight, DPR=Math.min(1.6,window.devicePixelRatio||1);
  const k=Math.min(W/(SW-30),H/SH); esc=k*DPR;   // corta 15px de cada lado no celular em pé: palco maior
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px';
  ox=(W*DPR-SW*esc)/2; oy=(H*DPR-SH*esc)/2;
}
function montar(){
  if(ov) return;
  const raiz=document.getElementById('cozy-wrap')||document.body;
  ov=document.createElement('div'); ov.id='vl-cena-ov';
  ov.innerHTML='<canvas></canvas><button class="pular">pular ›</button><div class="escolha"></div><div class="dica">toque pra adiantar</div>';
  raiz.appendChild(ov); cv=ov.querySelector('canvas'); ctx=cv.getContext('2d');
  ov.querySelector('.pular').addEventListener('click',e=>{ e.stopPropagation(); terminar(); });
  ov.addEventListener('click',()=>{ if(!cena||cena.escolha) return; const S=cena;
    if(S.titulo){ S.titulo=null; S.aguarda=0; return; }
    for(const a of S.atores.values()){ if(a.mov){ a.x=a.mov.x1; a.y=a.mov.y1; a.mov=null; } if(a.gira){ a.gira.t=a.gira.d; } a.fala=null; }
    if(S.camMov){ Object.assign(S.cam,S.camMov.para); S.camMov=null; }
    S.legenda=null; S.aguarda=0; });
  window.addEventListener('resize',()=>{ if(cena) medir(); });
}
function limpar(){ chuva=[]; coracoes=[]; confete=[]; puffs=[]; parts=[]; lagrimas=[]; flash=0; if(ov){ ov.classList.remove('on'); const e=ov.querySelector('.escolha'); if(e) e.classList.remove('on'); } }
function terminar(){
  if(!cena) return; const fim=cena.fim; cena=null; cancelAnimationFrame(raf); last=0;
  limpar();
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
  ativa:()=>!!cena,
  _estado:()=>cena
};
function terminarSilencioso(){ if(!cena) return; cena=null; cancelAnimationFrame(raf); last=0; limpar(); try{ window.VilaArte.som.forcar(null); }catch(e){} }
})();
