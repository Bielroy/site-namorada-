/* =====================================================================
   JOGUINHOS DA VILA
   - fornada da Paçoca (barraquinha da feira): tirar o pão do forno no ponto
   - pescaria do Laranjinha (cabana do lago): fisgar e segurar o peixe na faixa
   - baile da Rainha (castelo): tocar a valsa no ritmo enquanto os dois dançam
   VilaMini.jogar(id,{perfil,recorde,fim(res)})  res={pontos,nota(0..1),estrelas,extra}
   ===================================================================== */
(function(){
'use strict';
const SW=360, SH=560, INK='#4a3a2e';
let ov=null, cv=null, ctx=null, esc=1, ox=0, oy=0, raf=null, last=0, J=null, tempo=0;

/* ---------- sprites ---------- */
const IMG=new Map();
function spr(key,box,build){ let s=IMG.get(key); if(s) return s; const [x,y,w,h]=box, R=3;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${Math.ceil(w*R)}" height="${Math.ceil(h*R)}">${build()}</svg>`;
  const img=new Image(); s={img,x,y,w,h,ok:false}; img.onload=()=>{ s.ok=true; }; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); IMG.set(key,s); return s; }
const gato=(o,f)=>spr('g'+JSON.stringify(o)+(f?'z':''),[-28,-62,56,68],()=>window.VilaArte.gatoSVG(o,1,f,true));
const heroi=(q,f)=>spr('h'+q+(f?'z':''),window.ALIEN_BOX,()=>window.alienSVG(q,false,f,true));
function ator(c,s,x,y,e,dir,cor,alien,t,extra){
  if(!s||!s.ok) return; c.save(); c.translate(x,y); c.rotate(extra&&extra.rot||0); c.scale(e*(dir||1),e*(extra&&extra.sy||1));
  window.VilaArte.rabo(c,cor,Math.sin(t)*.25,alien); c.drawImage(s.img,s.x,s.y,s.w,s.h); c.restore(); }
const PACOCA={cor:'#f1d6ae',det:'#c9a072',listras:1}, LARANJA={cor:'#f4a35c',det:'#d9793a',listras:1,chapeuVerde:1}, RAINHA={cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1}, MELODIA={cor:'#cfcfcf',det:'#9a9a9a',listras:1};

/* ---------- efeitos ---------- */
let pops=[], parts=[];
function pop(x,y,txt,cor,g){ pops.push({x,y,txt,cor:cor||'#a0711f',t:0,g:g||1}); }
function faisca(x,y,n,cor){ for(let i=0;i<n;i++){ const a=Math.random()*6.283, v=40+Math.random()*80; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,cor:cor||['#f2c14e','#e3798a','#86afcf'][i%3],tipo:'f'}); } }
function coracoes(x,y,n){ for(let i=0;i<n;i++) parts.push({x:x+(Math.random()-.5)*40,y,vx:(Math.random()-.5)*30,vy:-40-Math.random()*40,t:0,cor:'#e3798a',tipo:'c'}); }
function fumaca(x,y){ parts.push({x,y,vx:(Math.random()-.5)*12,vy:-30,t:0,cor:'#5c5550',tipo:'s',r:5}); }
function coracao(c,x,y,s){ c.beginPath(); c.moveTo(x,y+s*.35); c.bezierCurveTo(x-s,y-s*.3,x-s*.5,y-s,x,y-s*.45); c.bezierCurveTo(x+s*.5,y-s,x+s,y-s*.3,x,y+s*.35); c.fill(); }
function rr(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }
function som(){ return window.VilaArte&&window.VilaArte.som; }
function blip(k){ try{ som().blip(k); }catch(e){} }
function chime(){ try{ som().chime(); }catch(e){} }
function lerp(a,b,k){ return a+(b-a)*k; }
function mix(c1,c2,k){ const a=parseInt(c1.slice(1),16), b=parseInt(c2.slice(1),16); const r=Math.round(lerp(a>>16,b>>16,k)), g=Math.round(lerp(a>>8&255,b>>8&255,k)), bl=Math.round(lerp(a&255,b&255,k)); return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1); }

/* =====================================================================
   FORNADA
   ===================================================================== */
const FORNOS=[{x:72},{x:180},{x:288}];
const Fornada={
  nome:'fornada da Paçoca', dur:45, alvo:600,
  como:'toque num forno vazio pra colocar a massa. quando o pão ficar <b>douradinho</b> (a faixa amarela do relógio), toque de novo pra tirar. cru ou queimado não vale!',
  iniciar(){ return {pts:0,combo:0,melhorCombo:0,fornos:FORNOS.map(f=>({...f,y:290,pao:null})),acertos:0,queimados:0,perfeitos:0,emo:null}; },
  toque(x,y){
    const E=J.e; const f=E.fornos.find(f=>Math.abs(x-f.x)<52&&y>170&&y<360); if(!f) return;
    if(!f.pao){ const cor=Math.random()<.16; f.pao={k:0,dur:(cor?3.4:4.4+Math.random()*1.1)/(J.t>J.def.dur*.5?1.22:1),cor,fum:0}; blip(.6); E.pacoca=.5; return; }
    const k=f.pao.k; let msg, pts=0, cor='#a0711f';
    if(k<.56){ msg='cru!'; E.combo=0; cor='#86afcf'; }
    else if(k<=.82){ const perf=k>=.63&&k<=.75; pts=perf?15:10; msg=perf?'perfeito!':'douradinho!'; E.combo++; E.acertos++; if(perf) E.perfeitos++; cor=perf?'#c25a6c':'#a0711f'; faisca(f.x,f.y-30,perf?14:8); blip(perf?1.6:1.2); if(perf) E.emo={e:'estrela',t:1.2}; }
    else if(k<1.04){ pts=4; msg='passou um pouco'; E.combo=0; }
    else { msg='queimou...'; E.combo=0; }
    const mult=1+Math.min(4,Math.floor(E.combo/3))*.5;
    if(pts){ pts=Math.round(pts*mult*(f.pao.cor?2:1)); E.pts+=pts; pop(f.x,f.y-70,'+'+pts,cor,1.2); if(mult>1) pop(f.x,f.y-92,'combo ×'+mult,'#86a86b',.8); }
    pop(f.x,f.y-50,msg,cor,.9); E.melhorCombo=Math.max(E.melhorCombo,E.combo);
    f.pao=null;
  },
  passo(dt){
    const E=J.e; if(E.pacoca>0) E.pacoca-=dt; if(E.emo){ E.emo.t-=dt; if(E.emo.t<=0) E.emo=null; }
    E.fornos.forEach(f=>{ if(!f.pao) return; f.pao.k+=dt/f.pao.dur; if(f.pao.k>1&&Math.random()<dt*8) fumaca(f.x+(Math.random()-.5)*20,f.y-40);
      if(f.pao.k>1.25){ E.queimados++; E.combo=0; pop(f.x,f.y-50,'queimou!','#5c5550'); E.emo={e:'exclama',t:1.2}; f.pao=null; } });
  },
  desenhar(c){
    const E=J.e;
    c.fillStyle='#f3dfc0'; c.fillRect(-100,-100,SW+200,SH+200);
    c.fillStyle='#e8cda6'; for(let y=60;y<380;y+=18) for(let x=-40+(y/18%2)*14;x<SW+40;x+=28) c.fillRect(x,y,26,16);
    // prateleira com pães
    c.fillStyle='#a07a55'; c.fillRect(20,96,320,8); for(let i=0;i<8;i++){ desenharPao(c,48+i*38,92,.7,.68+((i*7)%5)/30,i%4===0); }
    // balcão
    c.fillStyle='#a07a55'; c.fillRect(-100,360,SW+200,300); c.fillStyle='#c99a6b'; c.fillRect(-100,352,SW+200,12);
    E.fornos.forEach(f=>{
      c.fillStyle='#b5523b'; c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(f.x-50,350); c.lineTo(f.x-50,250); c.quadraticCurveTo(f.x,180,f.x+50,250); c.lineTo(f.x+50,350); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#a3452f'; for(let i=0;i<4;i++){ c.fillRect(f.x-44+i*24,266+(i%2)*20,18,8); }
      c.fillStyle='#2b1d1a'; c.beginPath(); c.moveTo(f.x-34,340); c.lineTo(f.x-34,290); c.quadraticCurveTo(f.x,256,f.x+34,290); c.lineTo(f.x+34,340); c.closePath(); c.fill();
      const brasa=.5+.3*Math.sin(tempo*6+f.x); c.fillStyle=`rgba(244,163,92,${brasa})`; c.beginPath(); c.ellipse(f.x,334,26,6,0,0,6.283); c.fill();
      if(f.pao){ desenharPao(c,f.x,326,1.25,f.pao.k,f.pao.cor);
        // relógio do ponto
        const R=15, cx=f.x, cy=226; c.fillStyle='#fffdf8'; c.beginPath(); c.arc(cx,cy,R+4,0,6.283); c.fill(); c.stroke();
        const a0=-Math.PI/2, ang=k=>a0+Math.min(1.25,k)/1.25*6.283;
        c.lineWidth=6; c.strokeStyle='#f2c14e'; c.beginPath(); c.arc(cx,cy,R-2,ang(.56),ang(.82)); c.stroke(); c.strokeStyle='#e3798a'; c.beginPath(); c.arc(cx,cy,R-2,ang(.63),ang(.75)); c.stroke();
        c.strokeStyle='#5c5550'; c.beginPath(); c.arc(cx,cy,R-2,ang(1.04),ang(1.25)); c.stroke();
        c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(cx,cy); const a=ang(f.pao.k); c.lineTo(cx+Math.cos(a)*(R-1),cy+Math.sin(a)*(R-1)); c.stroke(); c.lineWidth=2.4;
      } else { c.globalAlpha=.55+.35*Math.sin(tempo*4); c.fillStyle='#fbf7ef'; c.font='800 13px Nunito, sans-serif'; c.textAlign='center'; c.fillText('toque',f.x,312); c.globalAlpha=1; }
    });
    // Paçoca no balcão
    ator(c,gato(PACOCA,E.pacoca>0),300,470,1.6,-1,PACOCA.cor,false,tempo*2,{sy:1-(E.pacoca>0?.05:0)});
    if(E.emo) window.VilaArte.desenharEmo(c,284,354,E.emo.e,Math.min(1,E.emo.t*3));
    const h=window.__vilaPerfil||'g'; ator(c,heroi(h),70,480,1.5,1,window.peloAlien(h,false),true,tempo*1.6);
    c.fillStyle='#fffdf8'; rr(c,108,402,150,40,12); c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
    c.fillStyle=INK; c.font='800 12px Nunito, sans-serif'; c.textAlign='center';
    c.fillText(E.combo>=3?`combo ${E.combo}! continua!`:E.queimados>2?'atenção no relógio!':'tira no douradinho!',183,427);
  }
};
function desenharPao(c,x,y,s,k,cor){
  const cr=k<.65?mix('#f3e3c3','#e0a95a',k/.65):k<.9?mix('#e0a95a','#a8662e',(k-.65)/.25):mix('#a8662e','#3d2c25',Math.min(1,(k-.9)/.2));
  c.save(); c.translate(x,y); c.scale(s,s); c.fillStyle=cr; c.strokeStyle=INK; c.lineWidth=1.6;
  if(cor){ c.beginPath(); c.moveTo(0,4); c.bezierCurveTo(-16,-6,-10,-18,0,-10); c.bezierCurveTo(10,-18,16,-6,0,4); c.fill(); c.stroke(); }
  else { c.beginPath(); c.ellipse(0,-5,15,8,0,0,6.283); c.fill(); c.stroke(); c.strokeStyle=mix(cr,'#6b4a2e',.4); c.lineWidth=1.4; [-6,0,6].forEach(d=>{ c.beginPath(); c.moveTo(d-3,-9); c.lineTo(d+3,-3); c.stroke(); }); }
  if(k>.5&&k<.85){ c.fillStyle='rgba(255,246,200,.5)'; c.beginPath(); c.ellipse(-4,-9,5,2,0,0,6.283); c.fill(); }
  c.restore();
}

/* =====================================================================
   PESCARIA
   ===================================================================== */
const PEIXES=[
  {id:'lambari',nome:'lambari',pts:8,vel:1,zona:110,cor:'#c9d6e0',peso:30},
  {id:'tilapia',nome:'tilápia',pts:14,vel:1.4,zona:96,cor:'#9fb3a6',peso:26},
  {id:'pacu',nome:'pacu',pts:18,vel:1.7,zona:88,cor:'#7c8f9c',peso:16},
  {id:'tucunare',nome:'tucunaré',pts:26,vel:2.2,zona:80,cor:'#d9b44a',peso:11},
  {id:'bota',nome:'uma bota velha',pts:2,vel:.5,zona:120,cor:'#6b5440',peso:9},
  {id:'verde',nome:'peixe verde que brilha',pts:60,vel:2.8,zona:74,cor:'#b9dc4c',peso:4,raro:1}
];
function sortearPeixe(){ const tot=PEIXES.reduce((s,p)=>s+p.peso,0); let r=Math.random()*tot; for(const p of PEIXES){ r-=p.peso; if(r<=0) return p; } return PEIXES[0]; }
const Pesca={
  nome:'pescaria do Laranjinha', dur:60, alvo:85,
  como:'toque na água pra jogar a linha. quando a boia afundar e aparecer o <b>!</b>, toque rápido. depois <b>segure o dedo</b> pra subir a faixa verde e manter o peixe dentro dela até a barra encher.',
  iniciar(){ return {pts:0,estado:'lancar',boia:null,t:0,peixe:null,zonaY:300,vz:0,prog:.3,fy:300,fv:0,ft:0,segura:false,pegos:[],fala:null,cardT:0}; },
  solta(){ J.e.segura=false; },
  toque(x,y){
    const E=J.e;
    E.segura=true;
    if(E.estado==='lancar'){ E.boia={x:Math.max(40,Math.min(250,x)),y:Math.max(240,Math.min(380,y)),voo:0}; E.estado='voando'; blip(.5); return; }
    if(E.estado==='espera'){ E.estado='lancar'; E.boia=null; pop(x,y,'assustou o peixe','#86afcf',.8); E.fala='calma... devagar.'; E.falaT=1.6; return; }
    if(E.estado==='fisgou'){ E.peixe=sortearPeixe(); E.estado='briga'; E.prog=.32; E.fy=300; E.fv=0; E.zonaY=300; E.vz=0; blip(1.4); return; }
  },
  passo(dt){
    const E=J.e; E.t+=dt; if(E.falaT>0){ E.falaT-=dt; if(E.falaT<=0) E.fala=null; } if(E.cardT>0) E.cardT-=dt;
    if(E.estado==='voando'){ E.boia.voo+=dt*2.6; if(E.boia.voo>=1){ E.estado='espera'; E.esperaT=1.2+Math.random()*2.6; E.belisca=0; } }
    else if(E.estado==='espera'){ E.esperaT-=dt; if(Math.random()<dt*.9) E.belisca=.25; if(E.belisca>0) E.belisca-=dt; if(E.esperaT<=0){ E.estado='fisgou'; E.fisgT=.85; blip(.3); } }
    else if(E.estado==='fisgou'){ E.fisgT-=dt; if(E.fisgT<=0){ E.estado='lancar'; E.boia=null; pop(180,260,'escapou!','#86afcf'); E.fala='esse foi rápido. o próximo é nosso.'; E.falaT=2; } }
    else if(E.estado==='briga'){
      const P=E.peixe, top=120, bot=470;
      // peixe: muda de direção de vez em quando, mais rápido nos difíceis
      E.ft-=dt; if(E.ft<=0){ E.ft=.35+Math.random()*(1.1/P.vel); E.alvoF=top+20+Math.random()*(bot-top-40); }
      E.fv+=((E.alvoF-E.fy)*2.4*P.vel-E.fv*2.2)*dt; E.fy=Math.max(top+10,Math.min(bot-10,E.fy+E.fv*dt));
      // faixa: sobe segurando, cai soltando
      E.vz+=(E.segura?-620:520)*dt; E.vz*=Math.pow(.2,dt); E.zonaY+=E.vz*dt; const h=P.zona;
      if(E.zonaY<top+h/2){ E.zonaY=top+h/2; E.vz=0; } if(E.zonaY>bot-h/2){ E.zonaY=bot-h/2; E.vz=0; }
      const dentro=Math.abs(E.fy-E.zonaY)<h/2;
      E.prog+=(dentro?.34:-.24)*dt;
      if(E.prog>=1){ E.pts+=P.pts; E.pegos.push(P.id); E.card=P; E.cardT=1.8; pop(150,260,'+'+P.pts,'#c25a6c',1.3); faisca(150,300,P.raro?26:12,P.raro?'#b9dc4c':null); chime();
        E.fala=P.raro?'VERDE?! será que veio de Veluma?!':P.id==='bota'?'...pelo menos é uma bota bonita.':['boa!','que peixão!','assim que se faz!','olha o tamanho!'][Math.floor(Math.random()*4)]; E.falaT=2.2;
        E.estado='lancar'; E.boia=null; }
      else if(E.prog<=0){ E.estado='lancar'; E.boia=null; pop(150,260,'escapou...','#86afcf'); E.fala='saudade é igual pescaria. o próximo vem.'; E.falaT=2.4; }
    }
  },
  desenhar(c){
    const E=J.e;
    const g=c.createLinearGradient(0,0,0,220); g.addColorStop(0,'#f0a98a'); g.addColorStop(1,'#f8dcb4'); c.fillStyle=g; c.fillRect(-100,-100,SW+200,330);
    c.fillStyle='rgba(255,220,150,.6)'; c.beginPath(); c.arc(260,170,34,0,6.283); c.fill();
    c.fillStyle='#6f8a5a'; for(let i=0;i<9;i++){ const x=i*46-10; c.beginPath(); c.arc(x,200,26+(i*7)%10,0,6.283); c.fill(); }
    c.fillStyle='#3f6a8a'; c.fillRect(-100,212,SW+200,SH+100);
    c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=1.4; for(let i=0;i<14;i++){ const y=230+i*20, o=Math.sin(tempo*1.1+i)*14; c.beginPath(); c.moveTo(20+(i*61)%280+o,y); c.lineTo(48+(i*61)%280+o,y); c.stroke(); }
    // píer
    c.fillStyle='#8a6a4e'; c.fillRect(-100,470,SW+200,24); for(let x=-10;x<SW+20;x+=40){ c.fillRect(x,470,8,120); } c.strokeStyle=INK; c.lineWidth=2; c.strokeRect(-100,470,SW+200,24);
    const h=window.__vilaPerfil||'g';
    ator(c,gato(LARANJA),96,474,1.5,1,LARANJA.cor,false,tempo*1.4);
    ator(c,heroi(h),200,474,1.5,-1,window.peloAlien(h,false),true,tempo*1.6);
    // vara e linha
    const px=176, py=416; c.strokeStyle='#8a6a4e'; c.lineWidth=3; c.beginPath(); c.moveTo(200,440); c.lineTo(px,py); c.stroke();
    if(E.boia){ const B=E.boia, k=Math.min(1,B.voo||1), bx=lerp(px,B.x,k), by=lerp(py,B.y,k)-Math.sin(k*Math.PI)*80*(E.estado==='voando'?1:0);
      let dy=E.estado==='espera'?Math.sin(tempo*2)*1.5+(E.belisca>0?3:0):E.estado==='fisgou'?6+Math.sin(tempo*30)*2:0;
      c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=1; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo((px+bx)/2,(py+by)/2+30,bx,by+dy); c.stroke();
      c.fillStyle='#e3606e'; c.beginPath(); c.arc(bx,by+dy,5,0,6.283); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(bx,by+dy-2,2.6,0,6.283); c.fill();
      if(E.estado!=='voando'){ c.strokeStyle='rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(bx,by+6,10+Math.sin(tempo*2)*3,3,0,0,6.283); c.stroke(); }
      if(E.estado==='fisgou'){ c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(bx,by-30,14,0,6.283); c.fill(); c.stroke(); c.fillStyle='#c25a6c'; c.font='900 20px Fredoka, sans-serif'; c.textAlign='center'; c.fillText('!',bx,by-22); }
    } else if(E.estado==='lancar'){ c.globalAlpha=.6+.3*Math.sin(tempo*4); c.fillStyle='#fbf7ef'; c.font='800 14px Nunito, sans-serif'; c.textAlign='center'; c.fillText('toque na água pra jogar a linha',150,330); c.globalAlpha=1; }
    if(E.estado==='briga'){
      const P=E.peixe, top=120, bot=470, X=316;
      c.fillStyle='rgba(30,40,60,.55)'; rr(c,X-20,top-8,40,bot-top+16,14); c.fill(); c.strokeStyle='#fbf7ef'; c.lineWidth=2; c.stroke();
      c.fillStyle='rgba(134,168,107,.85)'; rr(c,X-16,E.zonaY-P.zona/2,32,P.zona,10); c.fill(); c.strokeStyle='#d6ee7c'; c.stroke();
      c.save(); c.translate(X,E.fy); c.fillStyle=P.cor; c.strokeStyle=INK; c.lineWidth=1.6; c.beginPath(); c.ellipse(0,0,11,6,0,0,6.283); c.fill(); c.stroke(); c.beginPath(); c.moveTo(9,0); c.lineTo(16,-6); c.lineTo(16,6); c.closePath(); c.fill(); c.stroke(); c.fillStyle=INK; c.beginPath(); c.arc(-5,-1,1.4,0,6.283); c.fill();
      if(P.raro){ c.globalCompositeOperation='lighter'; c.fillStyle='rgba(185,220,76,.35)'; c.beginPath(); c.arc(0,0,16+Math.sin(tempo*8)*3,0,6.283); c.fill(); c.globalCompositeOperation='source-over'; } c.restore();
      c.fillStyle='rgba(30,40,60,.55)'; rr(c,X-36,top,10,bot-top,5); c.fill(); c.fillStyle='#f2c14e'; rr(c,X-36,bot-(bot-top)*E.prog,10,(bot-top)*E.prog,5); c.fill();
      c.fillStyle='#fbf7ef'; c.font='800 12px Nunito, sans-serif'; c.textAlign='center'; c.fillText(E.segura?'segurando...':'segure pra subir',160,140);
    }
    if(E.card&&E.cardT>0){ const a=Math.min(1,E.cardT*3); c.globalAlpha=a; c.fillStyle='#fffdf8'; rr(c,70,150,220,54,14); c.fill(); c.strokeStyle=INK; c.lineWidth=2; c.stroke();
      c.fillStyle=INK; c.font='700 16px Fredoka, sans-serif'; c.textAlign='center'; c.fillText(E.card.nome,180,175); c.font='800 12px Nunito, sans-serif'; c.fillStyle='#a0711f'; c.fillText('+'+E.card.pts+' pontos',180,194); c.globalAlpha=1; }
    if(E.fala){ fala(c,110,400,E.fala); }
  }
};
function fala(c,x,y,txt){ c.font='800 12px Nunito, sans-serif'; const w=Math.min(220,c.measureText(txt).width+20); const bx=Math.max(8,Math.min(SW-w-8,x-w/2));
  c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=2; rr(c,bx,y-30,w,26,10); c.fill(); c.stroke(); c.fillStyle=INK; c.textAlign='center'; c.fillText(txt,bx+w/2,y-12); }

/* =====================================================================
   BAILE (ritmo em 3/4)
   ===================================================================== */
const BPM=96, BEAT=60/BPM, LANES=[96,180,264], LINHA=505, VEL=175; // px por segundo
const ACORDES=[[53,57,60],[48,52,55],[50,53,57],[46,50,53],[53,57,60],[45,48,52],[46,50,53],[48,52,55]];
const Baile={
  nome:'baile da Rainha', dur:42, alvo:1,
  como:'as patinhas descem no ritmo da valsa. toque na <b>coluna certa</b> quando a patinha passar pela linha. cada acerto toca uma nota da música, e o casal dança melhor!',
  iniciar(){
    // partitura: compassos de 3 tempos, ficando mais cheia com o tempo
    const notas=[]; const comp=Math.floor((this.dur-4)/(BEAT*3));
    const pads=[[0],[0,2],[0,1,2],[0,2],[0,1.5,2],[0,1,2],[0,2,2.5],[0,1,1.5,2]];
    let ultLane=1;
    for(let b=0;b<comp;b++){ const nivel=Math.min(pads.length-1,Math.floor(b/comp*pads.length*1.1)), pd=pads[Math.max(0,nivel-(b%3===0?1:0))];
      const ac=ACORDES[b%ACORDES.length];
      pd.forEach((bt,i)=>{ let lane=Math.floor(Math.random()*3); if(lane===ultLane&&Math.random()<.6) lane=(lane+1+Math.floor(Math.random()*2))%3; ultLane=lane;
        notas.push({t:2+(b*3+bt)*BEAT,lane,m:ac[(i+b)%3]+24,ok:null}); }); }
    return {notas,pts:0,combo:0,melhorCombo:0,perf:0,bom:0,erro:0,giro:0,vgiro:1,flash:[0,0,0],t0:null,agendado:0,comp,brilho:0};
  },
  agora(){ const E=J.e, S=som(); const ac=S&&S.ctx&&S.ctx(); if(ac&&S.ligado2&&S.ligado2()&&E.t0!=null) return ac.currentTime-E.t0; return J.t; },
  aoComecar(){ const E=J.e, S=som(); const ac=S&&S.ctx&&S.ctx(); if(ac){ try{ S.pausar(); ac.resume(); }catch(e){} E.t0=ac.currentTime+.05; } },
  aoTerminar(){ try{ som().retomar(); }catch(e){} },
  toque(x,y){
    const E=J.e; if(y<290) return; const lane=LANES.reduce((b,lx,i)=>Math.abs(x-lx)<Math.abs(x-LANES[b])?i:b,0);
    E.flash[lane]=1; const t=this.agora();
    let melhor=null, md=1; for(const n of E.notas){ if(n.ok!==null||n.lane!==lane) continue; const d=Math.abs(n.t-t); if(d<md){ md=d; melhor=n; } }
    if(melhor&&md<.16){ const perf=md<.075; melhor.ok=perf?2:1; E.combo++; E.melhorCombo=Math.max(E.melhorCombo,E.combo); if(perf) E.perf++; else E.bom++;
      const p=(perf?3:2)*(1+Math.min(3,Math.floor(E.combo/8))*.25); E.pts+=p; pop(LANES[lane],LINHA-30,perf?'perfeito':'bom',perf?'#c25a6c':'#a0711f',.9);
      faisca(LANES[lane],LINHA,perf?10:5); E.vgiro=Math.min(3,E.vgiro+.12); E.brilho=1;
      try{ const S=som(), ac=S.ctx(); if(ac) S.nota(melhor.m,ac.currentTime,.9,'triangle',.07,true); }catch(e){}
      if(E.combo%10===0){ coracoes(180,230,8); pop(180,200,`${E.combo} seguidos!`,'#86a86b',1.1); }
    } else { E.combo=0; E.vgiro=Math.max(.6,E.vgiro-.3); }
  },
  passo(dt){
    const E=J.e, t=this.agora(), S=som(); E.giro+=dt*E.vgiro*1.6; E.vgiro+=(1-E.vgiro)*dt*.3; E.brilho=Math.max(0,E.brilho-dt*2); E.flash=E.flash.map(f=>Math.max(0,f-dt*4));
    for(const n of E.notas){ if(n.ok===null&&t-n.t>.2){ n.ok=0; E.erro++; E.combo=0; E.vgiro=Math.max(.6,E.vgiro-.2); } }
    // acompanhamento da valsa (baixo no 1, acorde no 2 e no 3)
    try{ const ac=S&&S.ctx&&S.ctx(); if(ac&&E.t0!=null){ const ate=t+.4; while(E.agendado<E.comp*3+3&&2+E.agendado*BEAT<ate){ const i=E.agendado, bt=i%3, ac2=ACORDES[Math.floor(i/3)%ACORDES.length], tt=E.t0+2+i*BEAT;
        if(bt===0) S.nota(ac2[0]-12,tt,BEAT*2.6,'sine',.13,false); else ac2.forEach(m=>S.nota(m+12,tt,BEAT*.7,'triangle',.028,false)); E.agendado++; } } }catch(e){}
  },
  fimAntes(){ const E=J.e; return E.notas.length&&E.notas.every(n=>n.ok!==null)&&this.agora()>E.notas[E.notas.length-1].t+1; },
  nota(){ const E=J.e, n=E.notas.length||1; return Math.min(1,(E.perf*3+E.bom*2)/(n*3)/.85); },
  desenhar(c){
    const E=J.e, t=this.agora();
    const g=c.createLinearGradient(0,0,0,SH); g.addColorStop(0,'#3b2744'); g.addColorStop(1,'#7c4a5e'); c.fillStyle=g; c.fillRect(-100,-100,SW+200,SH+200);
    for(let i=0;i<4;i++){ const x=20+i*107; c.fillStyle='#e9d9bd'; c.fillRect(x,40,20,250); c.fillStyle='#d1bb94'; c.fillRect(x+14,40,6,250); }
    for(let i=0;i<3;i++){ const x=80+i*100; c.fillStyle=`rgba(255,236,170,${.2+E.brilho*.2})`; c.beginPath(); c.arc(x,52,24+Math.sin(tempo*3+i)*2,0,6.283); c.fill(); c.fillStyle='#f2c14e'; c.beginPath(); c.arc(x,52,6,0,6.283); c.fill(); }
    c.fillStyle='#c25a6c'; c.fillRect(-100,288,SW+200,SH); c.fillStyle='#e3798a'; for(let x=-100;x<SW+100;x+=40) c.fillRect(x,288,20,SH);
    // Rainha e Melodia assistindo
    ator(c,gato(RAINHA),48,250,1.3,1,RAINHA.cor,false,tempo*1.4); ator(c,gato(MELODIA),314,250,1.2,-1,MELODIA.cor,false,tempo*1.4);
    // o casal girando
    const cx=180, cy=236, r=30; ['g','n'].forEach((q,i)=>{ const a=E.giro+i*Math.PI; const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.32; E['p'+q]={x,y,z:Math.sin(a)}; });
    ['g','n'].sort((a,b)=>E['p'+a].z-E['p'+b].z).forEach(q=>{ const P=E['p'+q]; ator(c,heroi(q,E.brilho>.7),P.x,P.y,1.7,Math.cos(E.giro+(q==='n'?Math.PI:0))>0?-1:1,window.peloAlien(q,false),true,tempo*3,{rot:Math.sin(E.giro*2)*.06}); });
    // pistas
    c.fillStyle='rgba(20,14,30,.35)'; rr(c,48,296,264,244,20); c.fill();
    LANES.forEach((x,i)=>{ c.fillStyle=`rgba(255,246,200,${.06+E.flash[i]*.25})`; rr(c,x-34,300,68,236,16); c.fill(); });
    c.strokeStyle='#f2c14e'; c.lineWidth=3; c.beginPath(); c.moveTo(56,LINHA); c.lineTo(304,LINHA); c.stroke();
    LANES.forEach((x,i)=>{ c.strokeStyle='#fbf7ef'; c.lineWidth=2.4; c.beginPath(); c.arc(x,LINHA,22+E.flash[i]*5,0,6.283); c.stroke(); });
    for(const n of E.notas){ if(n.ok) continue; const y=LINHA-(n.t-t)*VEL; if(y<290||y>LINHA+30) continue; c.globalAlpha=Math.min(1,(y-290)/30); const x=LANES[n.lane];
      if(n.ok===0) c.globalAlpha=.3; c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(x,y,17,0,6.283); c.fill(); c.stroke();
      c.fillStyle=['#e3798a','#86afcf','#f2c14e'][n.lane]; c.beginPath(); c.ellipse(x,y+3,6.5,5.5,0,0,6.283); c.fill(); [[-7,-5],[-2.5,-8],[2.5,-8],[7,-5]].forEach(([dx,dy])=>{ c.beginPath(); c.arc(x+dx,y+dy,2.6,0,6.283); c.fill(); }); c.globalAlpha=1; }
    if(E.combo>=4){ c.fillStyle='#fbf7ef'; c.font='700 15px Fredoka, sans-serif'; c.textAlign='center'; c.fillText(`${E.combo} seguidos`,180,286); }
    if(t<2&&E.notas.length){ c.globalAlpha=1-Math.max(0,t-1.4)/.6; c.fillStyle='#fbf7ef'; c.font='700 20px Fredoka, sans-serif'; c.textAlign='center'; c.fillText(t<.7?'um, dois, três...':'agora!',180,140); c.globalAlpha=1; }
  }
};

const JOGOS={fornada:Fornada,pesca:Pesca,baile:Baile};

/* =====================================================================
   moldura comum
   ===================================================================== */
function montar(){
  if(ov) return;
  const raiz=document.getElementById('cozy-wrap')||document.body;
  ov=document.createElement('div'); ov.id='vl-mini-ov';
  ov.innerHTML=`<canvas></canvas><div class="mhud"><div class="mt"><b></b><span class="pts"></span></div><div class="mbar"><i></i></div><button class="sair">sair</button></div>
    <div class="mstart"><div class="mcard"><h2></h2><p></p><small></small><button class="vl-btn rose comecar">começar</button><button class="linkish voltar">agora não</button></div></div>`;
  raiz.appendChild(ov); cv=ov.querySelector('canvas'); ctx=cv.getContext('2d');
  const pos=e=>{ const r=cv.getBoundingClientRect(), k=cv.width/Math.max(1,r.width); return {x:((e.clientX-r.left)*k-ox)/esc, y:((e.clientY-r.top)*k-oy)/esc}; };
  cv.addEventListener('pointerdown',e=>{ e.preventDefault(); if(!J||!J.rodando) return; const p=pos(e); J.def.toque(p.x,p.y,'down'); });
  const up=e=>{ if(!J||!J.rodando||!J.def.solta) return; const p=pos(e); J.def.solta(p.x,p.y); };
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); cv.addEventListener('pointerleave',up);
  ov.querySelector('.sair').addEventListener('click',e=>{ e.stopPropagation(); if(J&&J.rodando) acabar(true); });
  ov.querySelector('.comecar').addEventListener('click',()=>comecar());
  ov.querySelector('.voltar').addEventListener('click',()=>{ const f=J&&J.fim; fechar(); if(f) f(null); });
  window.addEventListener('resize',()=>{ if(J) medir(); });
}
function medir(){
  const W=ov.clientWidth, H=ov.clientHeight, DPR=Math.min(2,window.devicePixelRatio||1);
  const k=Math.min(W/SW,H/SH); esc=k*DPR;
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px';
  ox=(W*DPR-SW*esc)/2; oy=(H*DPR-SH*esc)/2;
}
function comecar(){
  ov.querySelector('.mstart').classList.remove('on');
  try{ const S=som(); S.init(); }catch(e){}
  J.e=J.def.iniciar(); J.t=0; J.rodando=true; pops=[]; parts=[];
  if(J.def.aoComecar) J.def.aoComecar();
  hud();
}
function hud(){ if(!J) return; ov.querySelector('.mt b').textContent=J.def.nome; ov.querySelector('.pts').textContent=J.e?`${Math.round(J.e.pts)} pts`:''; ov.querySelector('.mbar i').style.width=Math.max(0,100-J.t/J.def.dur*100)+'%'; }
function acabar(saiu){
  if(!J||!J.rodando) return; J.rodando=false;
  if(J.def.aoTerminar) J.def.aoTerminar();
  const E=J.e, d=J.def;
  const nota=saiu?Math.min(.5,(d.nota?d.nota():E.pts/d.alvo)*.6):Math.max(0,Math.min(1,d.nota?d.nota():E.pts/d.alvo));
  const estrelas=nota>=.9?3:nota>=.6?2:nota>=.3?1:0;
  const res={pontos:Math.round(E.pts),nota,estrelas,extra:{combo:E.melhorCombo||0,peixes:E.pegos||[],perfeitos:E.perfeitos||E.perf||0},saiu:!!saiu};
  const f=J.fim; setTimeout(()=>{ fechar(); if(f) f(res); },saiu?0:600);
}
function fechar(){ cancelAnimationFrame(raf); raf=null; last=0; if(J&&J.rodando&&J.def.aoTerminar) J.def.aoTerminar(); J=null; if(ov) ov.classList.remove('on'); }
function loop(ts){
  if(!J) return; raf=requestAnimationFrame(loop);
  const dt=last?Math.min(.05,(ts-last)/1000):0; last=ts; tempo+=dt;
  if(J.rodando){ J.t+=dt; J.def.passo(dt); if(J.t>=J.def.dur||(J.def.fimAntes&&J.def.fimAntes())) acabar(false); if(Math.floor(J.t*10)%2===0) hud(); }
  for(let i=pops.length-1;i>=0;i--){ pops[i].t+=dt; if(pops[i].t>1.1) pops.splice(i,1); }
  for(let i=parts.length-1;i>=0;i--){ const q=parts[i]; q.t+=dt; q.x+=q.vx*dt; q.y+=q.vy*dt; if(q.tipo==='f') q.vy+=160*dt; if(q.tipo==='s'){ q.r+=dt*10; } if(q.t>(q.tipo==='s'?1.2:1)) parts.splice(i,1); }
  desenhar();
}
function desenhar(){
  const c=ctx; c.setTransform(1,0,0,1,0,0); c.fillStyle='#2b2440'; c.fillRect(0,0,cv.width,cv.height);
  c.setTransform(esc,0,0,esc,ox,oy);
  if(J.e) J.def.desenhar(c); else { if(!J.prev) J.prev=J.def.iniciar(); J.e=J.prev; J.def.desenhar(c); J.e=null; }
  for(const q of parts){ const a=Math.max(0,1-q.t); c.globalAlpha=a; c.fillStyle=q.cor; if(q.tipo==='c') coracao(c,q.x,q.y,8); else if(q.tipo==='s'){ c.globalAlpha=a*.6; c.beginPath(); c.arc(q.x,q.y,q.r,0,6.283); c.fill(); } else c.fillRect(q.x-2,q.y-2,4,4); }
  c.globalAlpha=1; c.textAlign='center'; c.lineJoin='round';
  for(const p of pops){ const k=p.t/1.1; c.globalAlpha=k<.15?k/.15:1-Math.max(0,(k-.5)/.5); c.font=`700 ${Math.round(16*p.g)}px Fredoka, Nunito, sans-serif`; c.lineWidth=4; c.strokeStyle='#fbf7ef'; c.strokeText(p.txt,p.x,p.y-k*30); c.fillStyle=p.cor; c.fillText(p.txt,p.x,p.y-k*30); }
  c.globalAlpha=1;
}
window.VilaMini={
  jogar(id,op){
    const def=JOGOS[id]; if(!def) return;
    montar(); fechar();
    window.__vilaPerfil=(op&&op.perfil)||'g';
    J={id,def,fim:op&&op.fim,rodando:false,t:0,e:null};
    ov.classList.add('on'); medir();
    const st=ov.querySelector('.mstart'); st.querySelector('h2').textContent=def.nome; st.querySelector('p').innerHTML=def.como;
    st.querySelector('small').textContent=op&&op.info||''; st.classList.add('on');
    ov.querySelector('.pts').textContent=''; ov.querySelector('.mt b').textContent=def.nome; ov.querySelector('.mbar i').style.width='100%';
    last=0; raf=requestAnimationFrame(loop);
  },
  ativo:()=>!!J,
  _J:()=>J,
  JOGOS
};
})();
