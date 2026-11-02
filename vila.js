/* =====================================================================
   VILA DOS GATINHOS — vista de cima, floresta em volta, castelo da
   Rainha Mimosa. Todo o desenho é vetor (SVG) pra poder trocar depois
   pelas artes do Gemini. Depende de: $, esc, LS, toast, burstHearts,
   fb, cozyRef, DB, HEART_PATH (definidos no index.html).
   ===================================================================== */
(function(){
'use strict';

/* ------------------------------------------------------------------
   PALETA + ÍCONES
------------------------------------------------------------------ */
const INK='#6b5440';
const ICON={
  coin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12.6" r="9.6" fill="#c9902f"/><circle cx="12" cy="11.4" r="9.6" fill="#f2c14e" stroke="#8a6224" stroke-width="1.8"/><circle cx="12" cy="11.4" r="5.8" fill="none" stroke="#d29a35" stroke-width="1.6"/><path d="M12 8v6.8" stroke="#8a6224" stroke-width="2" stroke-linecap="round"/></svg>',
  heart:`<svg viewBox="0 0 24 24"><path d="${HEART_PATH}" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/><ellipse cx="8" cy="8" rx="2" ry="1.3" fill="#fff" opacity=".6"/></svg>`,
  crown:'<svg viewBox="0 0 32 32"><path d="M5 23 L4 10 L11 16 L16 7 L21 16 L28 10 L27 23 Z" fill="#f2c14e" stroke="#8a6224" stroke-width="2" stroke-linejoin="round"/><rect x="5" y="23" width="22" height="4" rx="1.5" fill="#e9b24f" stroke="#8a6224" stroke-width="2"/><circle cx="16" cy="18" r="2.2" fill="#e3798a"/></svg>',
  paw:'<svg viewBox="0 0 32 32"><ellipse cx="16" cy="21" rx="7" ry="6" fill="#e3798a" stroke="#a8485a" stroke-width="1.8"/><circle cx="8" cy="13" r="3" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/><circle cx="13" cy="8.5" r="3" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/><circle cx="19" cy="8.5" r="3" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/><circle cx="24" cy="13" r="3" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/></svg>',
  gift:'<svg viewBox="0 0 32 32"><rect x="5" y="13" width="22" height="15" rx="2" fill="#86afcf" stroke="#4e6f8c" stroke-width="2"/><rect x="3" y="9" width="26" height="6" rx="2" fill="#a9c7de" stroke="#4e6f8c" stroke-width="2"/><rect x="14" y="9" width="4" height="19" fill="#e3798a"/><path d="M16 9 C12 3 7 6 11 9 M16 9 C20 3 25 6 21 9" stroke="#c25a6c" stroke-width="2" fill="none"/></svg>',
  music:'<svg viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="#6b5440" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="6.5" cy="18" rx="3" ry="2.4" fill="#e3798a" stroke="#6b5440" stroke-width="1.8"/><ellipse cx="17.5" cy="16" rx="3" ry="2.4" fill="#e3798a" stroke="#6b5440" stroke-width="1.8"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#6b5440" stroke-width="2.6" stroke-linecap="round"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M4 11 L12 4 L20 11" fill="none" stroke="#6b5440" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 10v9h11v-9" fill="#f5efe3" stroke="#6b5440" stroke-width="2.2" stroke-linejoin="round"/><rect x="10" y="13.5" width="4" height="5.5" rx="2" fill="#e9b24f"/></svg>',
  letter:'<svg viewBox="0 0 32 32"><rect x="3" y="7" width="26" height="18" rx="3" fill="#fffaf0" stroke="#6b5440" stroke-width="2"/><path d="M4 9 L16 18 L28 9" fill="none" stroke="#6b5440" stroke-width="2"/><circle cx="16" cy="18" r="4" fill="#e3798a" stroke="#a8485a" stroke-width="1.5"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#f2c14e" stroke="#c38a2b" stroke-width="1.2"/></svg>',
  hammer:'<svg viewBox="0 0 32 32"><rect x="14" y="10" width="4" height="19" rx="2" fill="#b98a5e" stroke="#6b5440" stroke-width="1.8"/><rect x="7" y="5" width="18" height="8" rx="2" fill="#9aa3ad" stroke="#5a6068" stroke-width="1.8"/></svg>'
};
const ic=(k)=>`<span class="vl-ic">${ICON[k]}</span>`;
/* produtos de cada estação (desenhos pequenos, sem emoji) */
const PROD={
  sopa:'<svg viewBox="0 0 32 32"><path d="M8 9c0-3 3-3 3-6M14 9c0-3 3-3 3-6M20 9c0-3 3-3 3-6" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M4 14 H28 C28 22 23 27 16 27 C9 27 4 22 4 14Z" fill="#f2c14e" stroke="#6b5440" stroke-width="2"/><path d="M4 14 H28" stroke="#6b5440" stroke-width="2"/><ellipse cx="16" cy="14" rx="12" ry="2.5" fill="#f4a35c"/><circle cx="12" cy="14" r="1.6" fill="#86a86b"/><circle cx="19" cy="14.5" r="1.4" fill="#e3798a"/></svg>',
  padaria:'<svg viewBox="0 0 32 32"><path d="M6 25 L22 9 C25 8 27 10 25 13 L9 28 C7 29 5 27 6 25Z" fill="#f4a35c" stroke="#6b5440" stroke-width="2"/><path d="M11 20l2 2M15 16l2 2M19 12l2 2" stroke="#d9793a" stroke-width="1.6" stroke-linecap="round"/><path d="M23 9 C22 5 25 3 27 4 M24 10 C27 8 30 10 29 12 M23 9 C21 6 18 6 18 8" fill="none" stroke="#5f824b" stroke-width="2.2" stroke-linecap="round"/></svg>',
  horta:'<svg viewBox="0 0 32 32"><rect x="13" y="16" width="6" height="11" rx="3" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M4 17 C4 8 28 8 28 17 Z" fill="#e3606e" stroke="#6b5440" stroke-width="2"/><circle cx="11" cy="12" r="2" fill="#fff"/><circle cx="19" cy="11" r="1.6" fill="#fff"/><circle cx="23" cy="15" r="1.3" fill="#fff"/></svg>',
  lenha:'<svg viewBox="0 0 32 32"><rect x="4" y="17" width="22" height="9" rx="4.5" fill="#b98a5e" stroke="#6b5440" stroke-width="2"/><ellipse cx="26" cy="21.5" rx="3.5" ry="4.5" fill="#e8d3a8" stroke="#6b5440" stroke-width="2"/><rect x="7" y="7" width="20" height="9" rx="4.5" fill="#c99a6b" stroke="#6b5440" stroke-width="2"/><ellipse cx="27" cy="11.5" rx="3.5" ry="4.5" fill="#e8d3a8" stroke="#6b5440" stroke-width="2"/></svg>',
  pesca:'<svg viewBox="0 0 32 32"><path d="M4 16 C9 8 20 8 25 16 C20 24 9 24 4 16Z" fill="#86afcf" stroke="#4e6f8c" stroke-width="2"/><path d="M25 16 L30 11 L30 21 Z" fill="#86afcf" stroke="#4e6f8c" stroke-width="2" stroke-linejoin="round"/><circle cx="10" cy="14.5" r="1.6" fill="#4e6f8c"/><path d="M15 12c2 2 2 6 0 8" stroke="#4e6f8c" stroke-width="1.4" fill="none"/></svg>',
  fogueira:'<svg viewBox="0 0 32 32"><path d="M4 28 L28 6" stroke="#b98a5e" stroke-width="2.4" stroke-linecap="round"/><rect x="17" y="6" width="8" height="8" rx="3.5" fill="#fffaf2" stroke="#6b5440" stroke-width="1.8" transform="rotate(-42 21 10)"/><rect x="10" y="13" width="8" height="8" rx="3.5" fill="#f9e3cf" stroke="#6b5440" stroke-width="1.8" transform="rotate(-42 14 17)"/></svg>',
  violao:'<svg viewBox="0 0 32 32"><path d="M12 25V8l14-3v15" fill="none" stroke="#6b5440" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="9" cy="25" rx="4" ry="3.2" fill="#a07bb7" stroke="#6b5440" stroke-width="2"/><ellipse cx="23" cy="21" rx="4" ry="3.2" fill="#a07bb7" stroke="#6b5440" stroke-width="2"/></svg>',
  soneca:'<svg viewBox="0 0 32 32"><path d="M11 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M5 12 H23 V20 C23 25 19 27 14 27 C9 27 5 25 5 20Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M23 14 C29 14 29 21 23 21" fill="none" stroke="#6b5440" stroke-width="2"/><ellipse cx="14" cy="12.5" rx="9" ry="1.8" fill="#c99a6b"/></svg>'
};

/* ------------------------------------------------------------------
   DADOS DO JOGO
------------------------------------------------------------------ */
const K=0.6, CX=500, CY=520;            // centro e "achatamento" da ilha (ângulo de câmera)
const dEl=(x,y)=>Math.hypot(x-CX,(y-CY)/K);
const ESTACOES=[
  {id:'sopa',    nome:'panela de sopa',     ciclo:3,  val:2,     abrir:0,      up:10,     x:410,y:565, roof:'#e3798a', prop:'pot',
   gato:{nome:'Nuvem',     cor:'#fffaf3', det:'#ecd6c2'}},
  {id:'padaria', nome:'cozinha',            ciclo:5,  val:9,     abrir:150,    up:70,     x:605,y:580, roof:'#e9b24f', prop:'carrots',
   gato:{nome:'Paçoca',    cor:'#f1d6ae', det:'#c9a072', listras:1}},
  {id:'horta',   nome:'hortinha',           ciclo:7,  val:34,    abrir:1400,   up:480,    x:378,y:470, roof:'#86a86b', prop:'garden',
   gato:{nome:'Azulzinho', cor:'#bccbdc', det:'#8ea3bd', listras:1, chapeu:1}},
  {id:'lenha',   nome:'lenhador',           ciclo:9,  val:130,   abrir:9500,   up:3000,   x:648,y:465, roof:'#c25a6c', prop:'logs', parede:'#d9b48a',
   gato:{nome:'Toco',      cor:'#f3dcb8', det:'#d3a878', xadrez:1}},
  {id:'pesca',   nome:'laguinho',           ciclo:12, val:500,   abrir:60000,  up:18000,  x:318,y:610, roof:'#86afcf', prop:'pond',
   gato:{nome:'Laranjinha',cor:'#f4a35c', det:'#d9793a', listras:1, chapeuVerde:1}},
  {id:'fogueira',nome:'fogueira',           ciclo:15, val:1900,  abrir:380000, up:110000, x:500,y:522, roof:null,      prop:'fire',
   gato:{nome:'Carvão',    cor:'#57514f', det:'#3a3535'}},
  {id:'violao',  nome:'coreto da música',   ciclo:18, val:7200,  abrir:2.3e6,  up:680000, x:528,y:655, roof:'#a07bb7', prop:'gazebo',
   gato:{nome:'Melodia',   cor:'#cfcfcf', det:'#9a9a9a', listras:1}, extra:'a música anima todo mundo: +3% em tudo por nível'},
  {id:'soneca',  nome:'cantinho da soneca', ciclo:22, val:28000, abrir:1.4e7,  up:4.2e6,  x:700,y:608, roof:'#e8c27a', prop:'cushion',
   gato:{nome:'Soninho',   cor:'#f2dcc0', det:'#d8b48c', listras:1}, extra:'gatinhos descansados: +1h de ganho offline por nível'}
];
ESTACOES.forEach(e=>e.d=dEl(e.x,e.y));
const MARCOS_NIVEL=[10,25,50,75,100,150,200];
const FASES=['cabana','casinha','casarão'];
const faseDe=l=>l>=25?2:l>=10?1:0;
const CASTELO_POS={x:500,y:318};
const CASTELO=[
  {nome:'ponte do bosque',  req:3, custo:3000,  desc:'liga a vila ao castelo e espanta um pouco da névoa'},
  {nome:'portão real',      req:5, custo:150000,desc:'reconstrói as muralhas e o grande portão'},
  {nome:'jardim da rainha', req:6, custo:1.2e6, desc:'flores, cercas vivas e um banquinho pra rainha'},
  {nome:'torres de vigia',  req:7, custo:9e6,   desc:'duas torres com telhadinhos cor de rosa'},
  {nome:'salão do trono',   req:8, custo:6e7,   desc:'acende o castelo inteiro (e a última carta)'}
];
const CARTAS=[
  {t:'prólogo: a névoa', premio:3, txt:`queridos viajantes,

meu nome é Mimosa, rainha (um pouco esquecida) deste bosque. faz muito tempo que o reino dos aconchegos adormeceu: a sopa esfriou, a música parou e uma névoa cobriu meu castelo.

mas hoje senti um cheirinho de sopa subindo entre as árvores... foram vocês?

se vocês dois cuidarem da clareira, quem sabe a floresta acorda de novo. os gatinhos do reino estão escondidos por aí, esperando um lugar quentinho pra voltar.`},
  {t:'capítulo 1: a ponte', premio:5, txt:`a ponte voltou!

pela primeira vez em anos desci do castelo e pisei na grama. os gatinhos me contaram que vocês trabalham juntos como quem dança: um começa a frase, o outro termina.

sabem o que eu aprendi olhando vocês? um reino não é feito de pedras. é feito de gente que cuida uma da outra.`},
  {t:'capítulo 2: o portão', premio:5, txt:`o portão real está de pé.

eu deixei ele aberto de propósito. portão fechado protege, mas portão aberto convida. e esta vila agora é de quem chega com carinho.

obrigada por não desistirem nos dias em que as moedinhas demoravam. coisas bonitas costumam ser assim: devagar, mas de verdade.`},
  {t:'capítulo 3: o jardim', premio:8, txt:`plantaram meu jardim!

amor é parecido com jardim, sabiam? precisa de sol, de água, de paciência... e de alguém que lembre de regar quando o outro esquece.

hoje eu sentei no banquinho e fiquei vendo as flores. pensei em vocês dois.`},
  {t:'capítulo 4: as torres', premio:10, txt:`lá do alto das torres dá pra ver a floresta inteira.

e sabe o que mais aparece daqui de cima? não são as casas nem o lago. são vocês dois: pequenininhos, juntos, e a vila inteira girando em volta disso.

falta só uma sala pra acender. eu guardei uma coisa lá dentro.`},
  {t:'capítulo final: o salão aceso', premio:20, final:true, txt:`o castelo inteiro brilha de novo. o reino dos aconchegos acordou, e foram vocês que acordaram.

um certo viajante me pediu um favor faz tempo. ele disse: "quando o castelo acender, entrega isso pra ela". eu prometi. e rainha cumpre promessa.`}
];
const CARTA_FINAL_PADRAO='você é a minha pessoa favorita no mundo inteiro.\n\nobrigado por cada dia, cada risada e cada vez que você escolheu ficar.\n\nte amo hoje, amanhã e sempre.';
const PERKS=[
  {id:'receita',    ic:'sopa',  nome:'receita secreta',    desc:l=>`+10% moedas em tudo por nível (agora +${l*10}%)`, custo:l=>5*(l+1), max:50},
  {id:'despertador',ic:'soneca',nome:'despertador fofinho',desc:l=>`estações 5% mais rápidas por nível (agora ${l*5}%)`, custo:l=>8*(l+1), max:10},
  {id:'sorte',      ic:'horta', nome:'trevo da sorte',     desc:l=>`2% de chance de produção em dobro por nível (agora ${l*2}%)`, custo:l=>6*(l+1), max:15},
  {id:'encomenda',  ic:'gift',  nome:'clientes generosos', desc:l=>`visitantes deixam +50% por nível (agora +${l*50}%)`, custo:l=>4*(l+1), max:20}
];
const DECORS=[
  {id:'lampiao',  nome:'lampião',            x:455,y:500},
  {id:'banco',    nome:'banquinho',          x:548,y:500},
  {id:'flores',   nome:'canteiro de flores', x:452,y:600},
  {id:'correio',  nome:'caixinha de correio',x:575,y:525},
  {id:'poco',     nome:'poço dos desejos',   x:440,y:440},
  {id:'varal',    nome:'varal de bandeirinhas',x:560,y:445},
  {id:'cerejeira',nome:'cerejeira',          x:285,y:520},
  {id:'balanco',  nome:'balanço',            x:735,y:530},
  {id:'cogumelos',nome:'cogumelos gigantes', x:400,y:650},
  {id:'fonte',    nome:'fontezinha',         x:620,y:690},
  {id:'cerca',    nome:'cerca florida',      x:250,y:600},
  {id:'placa',    nome:'placa da vila',      x:500,y:720}
];
DECORS.forEach(d=>d.d=dEl(d.x,d.y));
const NOMES_GATOS=['Bolinha','Mel','Pipoca','Fubá','Nina','Tico','Amora','Pudim','Chico','Luna','Algodão','Canela','Jujuba','Biscoito','Mingau','Pitoco','Café','Bombom','Tapioca','Brigadeiro'];
const CORES_GATOS=[['#f4a35c','#d9793a',1],['#fffaf3','#e2cdb9',0],['#57514f','#3a3535',0],['#cfcfcf','#9a9a9a',1],['#f1d6ae','#c9a072',1],['#bccbdc','#8ea3bd',1],['#e8c9a4','#8a6a4e',0],['#f6e7d6','#e3a568',1]];
const VILA_MARCOS=[
  {n:10,txt:'a clareira começou a crescer!'},{n:30,txt:'já virou um bairro fofo de gatinhos!'},
  {n:70,txt:'uma vila charmosa e cheia de vida!'},{n:150,txt:'a maior vila de gatinhos apaixonados!'},
  {n:300,txt:'lenda: a vila mais amada do bosque'},{n:600,txt:'infinito: amor que não cabe no mapa'}
];
const MISSOES_POOL=[
  {tipo:'taps',txt:n=>`fazer ${n} carinhos nos gatinhos`,meta:()=>[20,35,50][Math.floor(rng()*3)]},
  {tipo:'ups',txt:n=>`melhorar construções ${n} vezes`,meta:()=>[5,10,15][Math.floor(rng()*3)]},
  {tipo:'encomendas',txt:n=>`receber ${n} visitantes`,meta:()=>[2,3,4][Math.floor(rng()*3)]},
  {tipo:'ganhos',txt:n=>`juntar ${fmt(n)} moedas jogando`,meta:()=>Math.max(200,Math.round(vilaRate()*[300,600,900][Math.floor(rng()*3)]))},
  {tipo:'producoes',txt:n=>`produzir ${n} itens`,meta:()=>[60,120,200][Math.floor(rng()*3)]}
];
const CLIENT_ID=Math.random().toString(36).slice(2,10);
let _seed=1; function rng(){ _seed=(_seed*16807)%2147483647; return (_seed-1)/2147483646; }
function seeded(s){ let x=s%2147483647||1; return ()=>{ x=(x*16807)%2147483647; return (x-1)/2147483646; }; }

/* ------------------------------------------------------------------
   ESTADO
------------------------------------------------------------------ */
function novaVila(ts){ return {v:4,moedas:0,coracoes:0,lastTs:ts===undefined?Date.now():ts,est:{sopa:{lvl:1}},decor:0,perks:{},missoes:null,
  stats:{taps:0,ups:0,encomendas:0,ganhos:0,producoes:0},castelo:0,cartas:[],adotados:[]}; }
let vila=novaVila(0);
let csDirty=false, csAberto=false, csBoas=false, buyMode=1;
const prog={};
let R=0, Ralvo=0;

function fmt(n){ n=Math.floor(n); const u=[[1e15,'Q'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'k']]; for(const [v,s] of u){ if(n>=v) return (n/v).toFixed(n/v<10?2:1).replace('.',',')+s; } return String(n); }
const estDef=id=>ESTACOES.find(e=>e.id===id);
const estLvl=id=>(vila.est[id]&&vila.est[id].lvl)||0;
const estAberta=id=>estLvl(id)>0;
const nAbertas=()=>ESTACOES.filter(e=>estAberta(e.id)).length;
const perkLvl=id=>(vila.perks&&vila.perks[id])||0;
function marcoMult(l){ let m=1; MARCOS_NIVEL.forEach(x=>{ if(l>=x) m*=2; }); return m; }
const proxMarco=l=>MARCOS_NIVEL.find(x=>l<x);
function multGlobal(){ return (1+0.03*vila.decor)*(1+0.10*perkLvl('receita'))*(1+0.03*estLvl('violao'))*(1+0.05*vila.adotados.length)*(1+0.05*vila.castelo); }
function estValor(id){ const l=estLvl(id); return l?estDef(id).val*l*marcoMult(l)*multGlobal():0; }
function estCiclo(id){ return estDef(id).ciclo/(1+0.05*perkLvl('despertador')); }
function estRate(id){ return estAberta(id)?estValor(id)/estCiclo(id)*(1+0.02*perkLvl('sorte')):0; }
function vilaRate(){ return ESTACOES.reduce((s,e)=>s+estRate(e.id),0); }
const capHoras=()=>Math.min(24,8+estLvl('soneca'));
function vilaNivel(){ return ESTACOES.reduce((s,e)=>s+estLvl(e.id),0)+vila.decor+vila.adotados.length+vila.castelo*5; }
const custoUp=(id,l)=>Math.round(estDef(id).up*Math.pow(1.16,l-1));
function custoUpN(id,n){
  const l=estLvl(id); let tot=0,k=0; const lim=n==='max'?500:n;
  while(k<lim){ const c=custoUp(id,l+k); if(n==='max'&&tot+c>vila.moedas) break; tot+=c; k++; }
  if(n==='max'&&k===0) return {n:1,custo:custoUp(id,l)};
  return {n:k,custo:tot};
}
const custoDecor=()=>Math.round(120*Math.pow(2.3,vila.decor));
const custoAdocao=()=>Math.round(250*Math.pow(2.2,vila.adotados.length));
function raioAlvo(){ let r=150; ESTACOES.forEach(e=>{ if(estAberta(e.id)) r=Math.max(r,e.d+72); }); return r; }

/* persistência */
function salvarLocal(){ LS.set('vilaCats',vila); }
function normalizar(d){
  const v=novaVila();
  v.moedas=Math.max(0,Number(d.moedas)||0); v.coracoes=Math.max(0,Number(d.coracoes)||0);
  v.lastTs=Number(d.lastTs)||Date.now(); v.decor=Math.max(0,Math.min(DECORS.length,Number(d.decor)||0));
  v.est={}; ESTACOES.forEach(e=>{ const l=d.est&&d.est[e.id]?Number(d.est[e.id].lvl)||0:0; if(l>0) v.est[e.id]={lvl:l}; });
  if(!v.est.sopa) v.est.sopa={lvl:1};
  v.perks={}; PERKS.forEach(p=>{ const l=d.perks?Number(d.perks[p.id])||0:0; if(l>0) v.perks[p.id]=l; });
  v.missoes=d.missoes||null; v.stats=Object.assign(v.stats,d.stats||{});
  v.castelo=Math.max(0,Math.min(CASTELO.length,Number(d.castelo)||0));
  v.cartas=Array.isArray(d.cartas)?d.cartas.filter(n=>Number.isInteger(n)):[];
  v.adotados=Array.isArray(d.adotados)?d.adotados.slice(0,20).map(a=>({nome:String(a.nome||'Gatinho').slice(0,20),c:Math.max(0,Math.min(CORES_GATOS.length-1,Number(a.c)||0))})):[];
  return v;
}
function escrever(){
  vila.lastTs=Date.now(); salvarLocal();
  if(!fb) return;
  cozyRef.set(JSON.parse(JSON.stringify({...vila,by:CLIENT_ID})),{merge:false}).catch(e=>console.error(e));
}
window.carregarVilaLocal=function(){ const v=LS.get('vilaCats',null); if(v&&(v.v===3||v.v===4)) vila=normalizar(v); };
window.catOnRemote=function(data){
  if(!data){ csBoas=true; if(LS.get('vilaCats',null)) escrever(); return; }
  if(data.v===3||data.v===4){
    if(data.by===CLIENT_ID && Number(data.lastTs)<=vila.lastTs) return;
    if(Number(data.lastTs)<vila.lastTs-1500){ csBoas=true; escrever(); return; }
    vila=normalizar(data);
  } else if(!csBoas && (data.v===2||'catsOwned' in data||'banked' in data)){
    const old=data; vila=novaVila();
    vila.moedas=Number(old.moedas||old.banked)||0;
    const ol=old.est&&old.est.padaria?Number(old.est.padaria.lvl)||1:Number(old.potLevel)||1;
    vila.est.sopa={lvl:Math.max(1,ol)};
    vila.coracoes=Math.max(0,(Number(old.gatos||old.catsOwned)||1)-1)*2;
    vila.decor=Math.min(DECORS.length,Number(old.decorLvl||old.toppingLevel)||0);
    vila.lastTs=Number(old.lastTs)||Date.now();
    csBoas=true; escrever();
  } else return;
  csBoas=true; salvarLocal();
  if(csAberto){ montarMundo(); atualizarHud(); }
  window.atualizarTagCozy();
};
window.atualizarTagCozy=function(){ const t=$('cozy-tag'); if(t) t.textContent=`nível ${vilaNivel()} · ${fmt(vila.moedas)} moedas · +${fmt(vilaRate())}/s`; };

/* ------------------------------------------------------------------
   DESENHOS (SVG)
------------------------------------------------------------------ */
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,html){ const e=document.createElementNS(NS,tag); if(attrs) for(const k in attrs) e.setAttribute(k,attrs[k]); if(html!=null) e.innerHTML=html; return e; }

function arvoreSVG(tipo,cor){
  const c=['#8fb874','#9cc27c','#a8c98a','#86ad6b','#b2cf8f'][cor%5], d=['#6f9a58','#7aa35f','#86ad6b','#668f51','#8db86c'][cor%5];
  if(tipo===1){ // pinheiro
    return `<ellipse cx="0" cy="2" rx="18" ry="6" fill="rgba(60,80,40,.25)"/><g class="sway"><rect x="-3" y="-14" width="6" height="16" rx="2" fill="#a07a55" stroke="${INK}" stroke-width="2"/>
      <path d="M0 -70 L18 -38 L9 -38 L22 -14 L-22 -14 L-9 -38 L-18 -38 Z" fill="${d}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M-5 -55 L-10 -45" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  if(tipo===2){ // arbusto com florzinhas
    return `<ellipse cx="0" cy="2" rx="20" ry="6" fill="rgba(60,80,40,.25)"/><g class="sway"><path d="M-20 0 C-26 -14 -12 -26 0 -20 C10 -30 26 -16 20 0 Z" fill="${c}" stroke="${INK}" stroke-width="2.2"/>
      <circle cx="-8" cy="-12" r="2.2" fill="#f7c6d0"/><circle cx="6" cy="-16" r="2.2" fill="#fff"/><circle cx="11" cy="-7" r="2.2" fill="#f7c6d0"/></g>`;
  }
  return `<ellipse cx="0" cy="2" rx="22" ry="7" fill="rgba(60,80,40,.25)"/><g class="sway"><rect x="-4" y="-22" width="8" height="24" rx="3" fill="#a07a55" stroke="${INK}" stroke-width="2"/>
    <path d="M-24 -26 C-34 -42 -20 -62 -6 -56 C-2 -72 22 -70 22 -54 C36 -50 34 -26 20 -22 C12 -14 -16 -14 -24 -26 Z" fill="${c}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-12 -46 C-8 -52 0 -52 4 -48" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="12" cy="-34" r="2.3" fill="${d}"/></g>`;
}

/* gatinho em vetor (3/4, sentado). opts: cor, det, listras, chapeu, chapeuVerde, xadrez, coroa, capa */
function gatoSVG(o,escala){
  const s=escala||1, c=o.cor, d=o.det;
  const listras=o.listras?`<path d="M-4 -37 l1 4 M0 -38 v4 M4 -37 l-1 4" stroke="${d}" stroke-width="1.8" stroke-linecap="round"/><path d="M-11 -10 q3 1 4 4 M11 -10 q-3 1 -4 4" stroke="${d}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`:'';
  const capa=o.capa?`<path d="M-13 -22 C-20 -8 -18 2 -12 2 L12 2 C18 2 20 -8 13 -22 Z" fill="#f2a7b8" stroke="${INK}" stroke-width="2"/><path d="M-12 1 h24" stroke="#fff" stroke-width="3" stroke-dasharray="2 3"/>`:'';
  const chapeu=o.chapeu?`<ellipse cx="0" cy="-41" rx="15" ry="4" fill="#e8c27a" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -42 C-8 -52 8 -52 8 -42 Z" fill="#e8c27a" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -44 h16" stroke="#e3798a" stroke-width="2.4"/>`
    :o.chapeuVerde?`<ellipse cx="0" cy="-41" rx="14" ry="3.6" fill="#5f824b" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -42 C-8 -52 8 -52 8 -42 Z" fill="#6f9a58" stroke="${INK}" stroke-width="1.8"/>`:'';
  const coroa=o.coroa?`<path d="M-8 -43 L-9 -53 L-4 -48 L0 -56 L4 -48 L9 -53 L8 -43 Z" fill="#f2c14e" stroke="#8a6224" stroke-width="1.6" stroke-linejoin="round"/><circle cx="0" cy="-47" r="1.6" fill="#e3798a"/>`:'';
  const xadrez=o.xadrez?`<path d="M-11 -16 Q0 -10 11 -16 L10 -11 Q0 -6 -10 -11 Z" fill="#c25a6c" stroke="${INK}" stroke-width="1.6"/><path d="M-6 -14 v5 M0 -12 v5 M6 -14 v5" stroke="#8e3445" stroke-width="1.2"/>`:'';
  return `<g transform="scale(${s})"><ellipse cx="0" cy="1" rx="13" ry="4" fill="rgba(60,50,30,.22)"/>
   <g class="bodyg">
    <path class="tail" d="M9 -4 C20 -4 22 -14 17 -20" stroke="${INK}" stroke-width="7.5" fill="none" stroke-linecap="round"/>
    <path class="tail" d="M9 -4 C20 -4 22 -14 17 -20" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${capa}
    <ellipse cx="0" cy="-10" rx="12" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="-5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/>
    ${xadrez}
    <path d="M-11 -33 L-10 -46 L-2 -38 Z M11 -33 L10 -46 L2 -38 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-9 -36 L-9 -42 L-5 -38 Z M9 -36 L9 -42 L5 -38 Z" fill="#f4b6b6"/>
    <ellipse cx="0" cy="-29" rx="13" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    ${listras}
    <g class="eyes"><ellipse cx="-4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><ellipse cx="4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><circle cx="-4" cy="-30.3" r=".6" fill="#fff"/><circle cx="5.2" cy="-30.3" r=".6" fill="#fff"/></g>
    <ellipse cx="-8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/><ellipse cx="8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/>
    <path d="M-2 -25.5 q1 1.4 2 0 q1 1.4 2 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${chapeu}${coroa}
   </g></g>`;
}
function rainhaSVG(escala){ return gatoSVG({cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1},escala); }

/* casinha em 3/4. fase 0/1/2 muda tamanho e detalhes */
function casaSVG(e,fase){
  const s=[.82,1,1.16][fase], wall=e.parede||'#fbf3e3', roof=e.roof, rd=shade(roof,-.22);
  const flores=fase>=1?`<rect x="5" y="-23" width="20" height="5" rx="2" fill="#b98a5e" stroke="${INK}" stroke-width="1.6"/><circle cx="9" cy="-25" r="2.4" fill="#e3798a"/><circle cx="15" cy="-26" r="2.4" fill="#f2c14e"/><circle cx="21" cy="-25" r="2.4" fill="#fff"/>`:'';
  const extra=fase>=2?`<path d="M-8 -70 L0 -78 L8 -70 V-62 H-8 Z" fill="${wall}" stroke="${INK}" stroke-width="2"/><rect x="-3.5" y="-71" width="7" height="7" rx="1.5" class="win" stroke="${INK}" stroke-width="1.4"/>
     <path d="M0 -95 V-80" stroke="${INK}" stroke-width="2"/><path d="M0 -95 L13 -91 L0 -87 Z" fill="${shade(roof,.15)}" stroke="${INK}" stroke-width="1.6"/>`:'';
  return `<g transform="scale(${s})">
    <ellipse cx="4" cy="3" rx="44" ry="11" fill="rgba(70,55,35,.2)"/>
    <path d="M28 0 L42 -8 L42 -48 L28 -42 Z" fill="${shade(wall,-.12)}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="-30" y="-44" width="58" height="44" rx="3" fill="${wall}" stroke="${INK}" stroke-width="2.2"/>
    ${e.parede?'<path d="M-30 -32 H28 M-30 -20 H28 M-30 -8 H28" stroke="#b98a5e" stroke-width="1.6"/>':''}
    <path d="M-9 0 V-16 A9 9 0 0 1 9 -16 V0 Z" fill="#b98a5e" stroke="${INK}" stroke-width="2"/><circle cx="5" cy="-8" r="1.3" fill="${INK}"/>
    <rect x="12" y="-36" width="11" height="11" rx="2" class="win" stroke="${INK}" stroke-width="1.8"/><path d="M17.5 -36 v11 M12 -30.5 h11" stroke="${INK}" stroke-width="1.2"/>
    <rect x="-25" y="-36" width="11" height="11" rx="2" class="win" stroke="${INK}" stroke-width="1.8"/><path d="M-19.5 -36 v11 M-25 -30.5 h11" stroke="${INK}" stroke-width="1.2"/>
    ${flores}
    <rect x="12" y="-82" width="10" height="20" rx="1.5" fill="#d9b48a" stroke="${INK}" stroke-width="2"/>
    <g class="smoke"><circle cx="17" cy="-86" r="4" fill="#fff" opacity=".7"/><circle cx="17" cy="-86" r="4" fill="#fff" opacity=".7"/><circle cx="17" cy="-86" r="4" fill="#fff" opacity=".7"/></g>
    <path d="M28 -42 L42 -48 L22 -84 L4 -78 Z" fill="${rd}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-38 -40 L4 -80 L36 -40 Z" fill="${roof}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-26 -46 L4 -74 M-14 -44 L6 -62" stroke="${shade(roof,.18)}" stroke-width="2" stroke-linecap="round"/>
    ${extra}
  </g>`;
}
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255; const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt))); return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1); }

/* objetos ao lado das casas */
function propSVG(tipo,ativo){
  switch(tipo){
    case 'pot': return `<g transform="translate(-50,6)"><path d="M-10 -14 h20" stroke="${INK}" stroke-width="2"/><path d="M-15 -14 C-16 -2 -10 2 0 2 C10 2 16 -2 15 -14 Z" fill="#4a4545" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="-14" rx="15" ry="4" fill="#f4a35c" stroke="${INK}" stroke-width="2"/><path d="M4 -16 L12 -30" stroke="#b98a5e" stroke-width="3" stroke-linecap="round"/><g class="smoke"><circle cx="-3" cy="-20" r="4" fill="#fff" opacity=".8"/><circle cx="2" cy="-20" r="4" fill="#fff" opacity=".8"/><circle cx="-1" cy="-20" r="4" fill="#fff" opacity=".8"/></g></g>`;
    case 'carrots': return `<g transform="translate(-50,6)"><path d="M-14 -12 L14 -12 L11 2 L-11 2 Z" fill="#c99a6b" stroke="${INK}" stroke-width="2"/><path d="M-12 -7 H12" stroke="${INK}" stroke-width="1.2"/><path d="M-8 -12 L-4 -24 M0 -12 L1 -26 M7 -12 L6 -23" stroke="#f4a35c" stroke-width="5" stroke-linecap="round"/><path d="M-4 -24 l-3 -5 M-4 -24 l2 -6 M1 -26 l-2 -5 M1 -26 l3 -5 M6 -23 l-1 -6 M6 -23 l4 -4" stroke="#5f824b" stroke-width="2" stroke-linecap="round"/></g>`;
    case 'garden': return `<g transform="translate(-58,8)"><rect x="-18" y="-10" width="36" height="12" rx="4" fill="#a37a55" stroke="${INK}" stroke-width="2"/><path d="M-12 -10 v-6 M-4 -10 v-8 M4 -10 v-6 M12 -10 v-7" stroke="#6f9a58" stroke-width="3" stroke-linecap="round"/><g transform="translate(26,0)"><rect x="-3" y="-12" width="6" height="12" rx="3" fill="#fbf3e3" stroke="${INK}" stroke-width="1.8"/><path d="M-12 -11 C-12 -24 12 -24 12 -11 Z" fill="#e3606e" stroke="${INK}" stroke-width="2"/><circle cx="-5" cy="-16" r="1.8" fill="#fff"/><circle cx="4" cy="-18" r="1.5" fill="#fff"/></g></g>`;
    case 'logs': return `<g transform="translate(-54,6)"><ellipse cx="0" cy="-4" rx="12" ry="6" fill="#d9b48a" stroke="${INK}" stroke-width="2"/><path d="M-12 -4 V4 A12 6 0 0 0 12 4 V-4" fill="#a37a55" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="-4" rx="6" ry="3" fill="none" stroke="#b98a5e" stroke-width="1.4"/><path d="M2 -6 L10 -24" stroke="#b98a5e" stroke-width="3" stroke-linecap="round"/><path d="M6 -26 L15 -22 L13 -16 L6 -20 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="1.6"/><g transform="translate(-22,6)"><rect x="-10" y="-8" width="20" height="8" rx="4" fill="#b98a5e" stroke="${INK}" stroke-width="1.8"/><rect x="-6" y="-15" width="20" height="8" rx="4" fill="#c99a6b" stroke="${INK}" stroke-width="1.8"/></g></g>`;
    case 'pond': return `<g transform="translate(-62,16)"><ellipse cx="0" cy="0" rx="40" ry="18" fill="#c7dfe9" stroke="${INK}" stroke-width="2.2"/><ellipse class="water" cx="-4" cy="-2" rx="30" ry="12" fill="#9fc6dc"/><path d="M-18 -2 q5 -3 10 0 M6 4 q5 -3 10 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><g transform="translate(26,-8)"><rect x="-12" y="-3" width="24" height="9" fill="#c99a6b" stroke="${INK}" stroke-width="1.8"/><path d="M-6 -3 v9 M0 -3 v9 M6 -3 v9" stroke="${INK}" stroke-width="1.2"/></g><circle cx="-16" cy="4" r="3" fill="#86a86b" stroke="${INK}" stroke-width="1.4"/><circle cx="-14" cy="3" r="1.2" fill="#f7c6d0"/></g>`;
    case 'gazebo': return '';
    case 'cushion': return `<g transform="translate(-58,8)"><path d="M-20 -6 C-22 -16 -12 -18 0 -17 C12 -18 22 -16 20 -6 C22 2 12 4 0 3 C-12 4 -22 2 -20 -6 Z" fill="#e8c27a" stroke="${INK}" stroke-width="2"/><path d="M-12 -8 q12 -4 24 0" stroke="#c38a2b" stroke-width="1.6" fill="none"/><g transform="translate(28,0)"><rect x="-7" y="-14" width="14" height="4" rx="2" fill="#b98a5e" stroke="${INK}" stroke-width="1.6"/><path d="M-4 -10 v10 M4 -10 v10" stroke="${INK}" stroke-width="2"/><rect x="-4" y="-21" width="8" height="7" rx="2" fill="#fbf3e3" stroke="${INK}" stroke-width="1.4"/></g></g>`;
    default: return '';
  }
}
function fogueiraSVG(acesa,fase){
  const pedras=[...Array(9)].map((_,i)=>{ const a=i/9*Math.PI*2; return `<ellipse cx="${(Math.cos(a)*26).toFixed(1)}" cy="${(Math.sin(a)*12).toFixed(1)}" rx="7" ry="5" fill="#bdb3a6" stroke="${INK}" stroke-width="1.8"/>`; }).join('');
  const bancos=fase>=1?`<g transform="translate(-50,-4)"><rect x="-14" y="-7" width="28" height="10" rx="5" fill="#b98a5e" stroke="${INK}" stroke-width="2"/></g><g transform="translate(50,4)"><rect x="-14" y="-7" width="28" height="10" rx="5" fill="#b98a5e" stroke="${INK}" stroke-width="2"/></g>`:'';
  const fogo=acesa?`<circle class="glow" cx="0" cy="-8" r="60" fill="url(#vlFireGlow)"/>
    <path d="M-14 4 L14 -6 M-14 -6 L14 4" stroke="#8a6a4e" stroke-width="6" stroke-linecap="round"/>
    <path class="flame" d="M-13 0 C-16 -16 -6 -22 -4 -34 C2 -26 6 -30 6 -40 C14 -28 18 -16 13 0 Z" fill="#f4a35c" stroke="#c25a3c" stroke-width="2"/>
    <path class="flame b" d="M-6 0 C-8 -10 -2 -14 0 -22 C4 -14 8 -12 6 0 Z" fill="#f2c14e"/>`
    :`<path d="M-14 4 L14 -6 M-14 -6 L14 4" stroke="#7a6d62" stroke-width="6" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="12" ry="5" fill="#9b9087"/>`;
  return `<ellipse cx="0" cy="4" rx="56" ry="24" fill="rgba(70,55,35,.12)"/>${bancos}<ellipse cx="0" cy="0" rx="30" ry="14" fill="#8f8378" opacity=".5"/>${pedras}${fogo}`;
}
function coretoSVG(fase){
  const s=[.85,1,1.12][fase];
  return `<g transform="scale(${s})"><ellipse cx="0" cy="4" rx="46" ry="14" fill="rgba(70,55,35,.2)"/><ellipse cx="0" cy="0" rx="40" ry="12" fill="#e8d3a8" stroke="${INK}" stroke-width="2.2"/>
   <path d="M-34 -2 V-44 M34 -2 V-44 M-14 6 V-40 M14 6 V-40" stroke="#fbf3e3" stroke-width="5"/><path d="M-34 -2 V-44 M34 -2 V-44 M-14 6 V-40 M14 6 V-40" stroke="${INK}" stroke-width="1.4" opacity=".6"/>
   <path d="M-46 -42 C-30 -60 30 -60 46 -42 C30 -36 -30 -36 -46 -42 Z" fill="#a07bb7" stroke="${INK}" stroke-width="2.2"/><path d="M-46 -42 L0 -78 L46 -42" fill="#b391c6" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
   <circle cx="0" cy="-80" r="4" fill="#f2c14e" stroke="${INK}" stroke-width="1.6"/>
   <g class="note"><path d="M-30 -60 v-9 l6 -2 v9" stroke="${INK}" stroke-width="1.6" fill="none"/><circle cx="-31" cy="-59" r="2.2" fill="${INK}"/></g>
   <g class="note n2"><path d="M26 -58 v-9 l6 -2 v9" stroke="${INK}" stroke-width="1.6" fill="none"/><circle cx="25" cy="-57" r="2.2" fill="${INK}"/></g></g>`;
}
function placaSVG(){
  return `<g class="bob"><ellipse cx="0" cy="3" rx="16" ry="5" fill="rgba(60,50,30,.25)"/><rect x="-3" y="-30" width="6" height="32" rx="2" fill="#a07a55" stroke="${INK}" stroke-width="2"/>
   <rect x="-24" y="-46" width="48" height="22" rx="5" fill="#f5efe3" stroke="${INK}" stroke-width="2.2"/>
   <g transform="translate(-9,-44) scale(.75)">${ICON.hammer.replace('<svg viewBox="0 0 32 32">','').replace('</svg>','')}</g>
   <text x="9" y="-31" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="${INK}">?</text></g>`;
}
function andaimeSVG(){
  return `<g class="scaf"><ellipse cx="0" cy="3" rx="40" ry="10" fill="rgba(70,55,35,.18)"/>
   <rect x="-30" y="-30" width="60" height="30" rx="3" fill="#efe2c8" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>
   <path d="M-34 0 V-62 M34 0 V-62 M-34 -30 H34 M-34 -58 H34 M-34 -30 L34 -58" stroke="#b98a5e" stroke-width="4" stroke-linecap="round"/>
   <g transform="translate(18,-2)">${gatoSVG({cor:'#f2c78f',det:'#c9a072',listras:1},.8)}<g class="hammer" transform="translate(6,-26) scale(.7)">${ICON.hammer.replace('<svg viewBox="0 0 32 32">','').replace('</svg>','')}</g></g>
   <path d="M-26 -8 h16 M-28 -16 h18" stroke="#c99a6b" stroke-width="5" stroke-linecap="round"/></g>`;
}
function decorSVG(id){
  switch(id){
    case 'lampiao': return `<ellipse cx="0" cy="2" rx="8" ry="3" fill="rgba(60,50,30,.25)"/><path d="M0 0 V-40" stroke="#5c5550" stroke-width="3"/><path d="M-7 -40 h14 l-3 -12 h-8 Z" fill="#f2d98c" class="win" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -52 h16 l-8 -6 Z" fill="#5c5550"/><circle class="glow" cx="0" cy="-46" r="20" fill="url(#vlLampGlow)"/>`;
    case 'banco': return `<rect x="-18" y="-14" width="36" height="5" rx="2" fill="#b98a5e" stroke="${INK}" stroke-width="1.8"/><rect x="-18" y="-8" width="36" height="5" rx="2" fill="#c99a6b" stroke="${INK}" stroke-width="1.8"/><path d="M-14 -3 v5 M14 -3 v5" stroke="${INK}" stroke-width="2.4"/>`;
    case 'flores': return `<ellipse cx="0" cy="0" rx="20" ry="8" fill="#a37a55" stroke="${INK}" stroke-width="1.8"/>${[[-10,-4,'#e3798a'],[0,-6,'#f2c14e'],[10,-3,'#fff'],[-4,0,'#a07bb7'],[6,1,'#e3798a']].map(f=>`<path d="M${f[0]} ${f[1]} v-6" stroke="#5f824b" stroke-width="1.6"/><circle cx="${f[0]}" cy="${f[1]-7}" r="3.2" fill="${f[2]}" stroke="${INK}" stroke-width="1.2"/>`).join('')}`;
    case 'correio': return `<path d="M0 0 V-22" stroke="#a07a55" stroke-width="4"/><path d="M-10 -22 V-34 A10 8 0 0 1 10 -34 V-22 Z" fill="#e3798a" stroke="${INK}" stroke-width="2"/><path d="M10 -34 v-8 h7 v4 h-7" fill="#f2c14e" stroke="${INK}" stroke-width="1.6"/>`;
    case 'poco': return `<ellipse cx="0" cy="-4" rx="16" ry="7" fill="#bdb3a6" stroke="${INK}" stroke-width="2"/><path d="M-16 -4 V6 A16 7 0 0 0 16 6 V-4" fill="#d4cabd" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="-4" rx="11" ry="4" fill="#86afcf"/><path d="M-14 -4 V-30 M14 -4 V-30" stroke="#a07a55" stroke-width="3"/><path d="M-20 -28 L0 -40 L20 -28 Z" fill="#c25a6c" stroke="${INK}" stroke-width="2"/>`;
    case 'varal': return `<path d="M-30 0 V-34 M30 0 V-34" stroke="#a07a55" stroke-width="3"/><path d="M-30 -32 Q0 -22 30 -32" stroke="${INK}" stroke-width="1.4" fill="none"/>${[-22,-12,-2,8,18].map((x,i)=>`<path d="M${x} ${-29+Math.abs(x)/6} l4 8 l4 -8 Z" fill="${['#e3798a','#f2c14e','#86afcf','#86a86b','#a07bb7'][i]}" stroke="${INK}" stroke-width="1"/>`).join('')}`;
    case 'cerejeira': return arvoreSVG(0,0).replace(/fill="#8fb874"/,'fill="#f6c3cf"').replace(/stroke="#6f9a58"/,'stroke="#e3909f"');
    case 'balanco': return `<path d="M-18 0 L-12 -44 L12 -44 L18 0" fill="none" stroke="#a07a55" stroke-width="3.5" stroke-linejoin="round"/><path d="M-6 -44 V-14 M6 -44 V-14" stroke="${INK}" stroke-width="1.4"/><rect x="-9" y="-15" width="18" height="4" rx="2" fill="#e3798a" stroke="${INK}" stroke-width="1.4"/>`;
    case 'cogumelos': return `<g transform="translate(-8,0)"><rect x="-4" y="-16" width="8" height="16" rx="4" fill="#fbf3e3" stroke="${INK}" stroke-width="1.8"/><path d="M-16 -14 C-16 -32 16 -32 16 -14 Z" fill="#e3606e" stroke="${INK}" stroke-width="2"/><circle cx="-6" cy="-22" r="2.4" fill="#fff"/><circle cx="5" cy="-24" r="2" fill="#fff"/></g><g transform="translate(14,2) scale(.6)"><rect x="-4" y="-16" width="8" height="16" rx="4" fill="#fbf3e3" stroke="${INK}" stroke-width="2.4"/><path d="M-16 -14 C-16 -32 16 -32 16 -14 Z" fill="#e9b24f" stroke="${INK}" stroke-width="2.6"/></g>`;
    case 'fonte': return `<ellipse cx="0" cy="0" rx="24" ry="10" fill="#d4cabd" stroke="${INK}" stroke-width="2"/><ellipse class="water" cx="0" cy="-1" rx="19" ry="7" fill="#9fc6dc"/><path d="M0 -2 V-20" stroke="#bdb3a6" stroke-width="5"/><ellipse cx="0" cy="-20" rx="8" ry="3" fill="#d4cabd" stroke="${INK}" stroke-width="1.6"/><path class="water" d="M0 -22 C-6 -32 -10 -24 -12 -14 M0 -22 C6 -32 10 -24 12 -14" stroke="#9fc6dc" stroke-width="2.2" fill="none"/>`;
    case 'cerca': return `<path d="M-30 -2 H30 M-30 -12 H30" stroke="#d9b48a" stroke-width="3.5"/>${[-28,-14,0,14,28].map(x=>`<path d="M${x} 2 V-18 l-3 -3 l3 -3 l3 3 l-3 3" fill="#fbf3e3" stroke="${INK}" stroke-width="1.6"/>`).join('')}${[-21,7,21].map(x=>`<circle cx="${x}" cy="-14" r="3" fill="#e3798a" stroke="${INK}" stroke-width="1"/>`).join('')}`;
    case 'placa': return `<path d="M0 0 V-30" stroke="#a07a55" stroke-width="4"/><rect x="-30" y="-46" width="60" height="20" rx="5" fill="#f5efe3" stroke="${INK}" stroke-width="2"/><text x="0" y="-32" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9" fill="${INK}">vila do amor</text>`;
  }
  return '';
}
/* castelo em ruína → restaurado (5 etapas) */
function casteloSVG(st){
  const pedra='#e4dccf', pedraEsc='#cfc4b4';
  let g=`<ellipse cx="0" cy="8" rx="132" ry="58" fill="#c9b18a" stroke="${INK}" stroke-width="2.4"/><ellipse cx="0" cy="0" rx="132" ry="56" fill="#b7cf93" stroke="#6b8f52" stroke-width="2.4"/>`;
  if(st>=3){ // jardim
    g+=`<path d="M-110 10 C-116 0 -100 -6 -92 -2 C-86 -10 -70 -6 -72 4 Z M110 10 C116 0 100 -6 92 -2 C86 -10 70 -6 72 4 Z" fill="#7fa863" stroke="${INK}" stroke-width="2"/>`;
    [[-100,-2,'#e3798a'],[-84,4,'#fff'],[90,0,'#f2c14e'],[104,4,'#e3798a'],[-60,24,'#a07bb7'],[60,26,'#e3798a'],[-40,30,'#fff'],[42,32,'#f2c14e']].forEach(f=>g+=`<circle cx="${f[0]}" cy="${f[1]}" r="3.6" fill="${f[2]}" stroke="${INK}" stroke-width="1.2"/>`);
  }
  if(st<2){ // ruínas
    g+=`<path d="M-80 0 V-26 L-70 -32 L-62 -22 L-56 -30 V0 Z" fill="${pedra}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
     <path d="M-36 -10 V-64 L-24 -74 L-14 -60 L-4 -70 L6 -52 L14 -66 L30 -58 V-10 Z" fill="${pedra}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
     <path d="M-10 -10 V-34 A10 10 0 0 1 10 -34 V-10" fill="#8f8378" stroke="${INK}" stroke-width="2"/>
     <path d="M56 0 V-20 L64 -28 L74 -18 V0 Z" fill="${pedra}" stroke="${INK}" stroke-width="2.2"/>
     <ellipse cx="-20" cy="10" rx="8" ry="4" fill="${pedraEsc}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="40" cy="14" rx="6" ry="3" fill="${pedraEsc}" stroke="${INK}" stroke-width="1.6"/>
     <path d="M-30 -40 q6 -2 8 4 M16 -48 q5 0 6 5" stroke="#86a86b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    const ameias=x0=>[...Array(8)].map((_,i)=>`<rect x="${x0+i*14}" y="-48" width="8" height="8" fill="${pedra}" stroke="${INK}" stroke-width="1.8"/>`).join('');
    if(st>=4){ // torres
      [-78,78].forEach(x=>{ g+=`<rect x="${x-16}" y="-96" width="32" height="96" rx="3" fill="${pedra}" stroke="${INK}" stroke-width="2.4"/>
        <rect x="${x-5}" y="-74" width="10" height="14" rx="5" class="win" stroke="${INK}" stroke-width="1.6"/>
        <path d="M${x-22} -94 L${x} -136 L${x+22} -94 Z" fill="#e3798a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M${x} -136 V-154" stroke="${INK}" stroke-width="2"/><path d="M${x} -154 L${x+16} -149 L${x} -144 Z" fill="#f2c14e" stroke="${INK}" stroke-width="1.4"/>`; });
    }
    g+=`<rect x="-58" y="-40" width="116" height="40" fill="${pedra}" stroke="${INK}" stroke-width="2.4"/>${ameias(-56)}
      <rect x="-34" y="-104" width="68" height="64" fill="${pedra}" stroke="${INK}" stroke-width="2.4"/>
      ${[...Array(5)].map((_,i)=>`<rect x="${-33+i*14}" y="-112" width="8" height="8" fill="${pedra}" stroke="${INK}" stroke-width="1.8"/>`).join('')}
      <rect x="-24" y="-88" width="12" height="16" rx="6" class="win" stroke="${INK}" stroke-width="1.6"/><rect x="12" y="-88" width="12" height="16" rx="6" class="win" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-16 0 V-26 A16 16 0 0 1 16 -26 V0 Z" fill="#b98a5e" stroke="${INK}" stroke-width="2.4"/><path d="M0 -42 V0 M-16 -18 H16" stroke="${INK}" stroke-width="1.4"/>
      <path d="M-36 -64 h-6 M36 -64 h6" stroke="${INK}" stroke-width="2"/>`;
    if(st>=5){
      g+=`<path d="M-30 -104 L0 -146 L30 -104 Z" fill="#e3798a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 -146 V-170" stroke="${INK}" stroke-width="2"/><path d="M0 -170 L22 -163 L0 -156 Z" fill="#e3798a" stroke="${INK}" stroke-width="1.6"/>
        <path d="M-20 -40 v26 l6 -4 l6 4 v-26 M8 -40 v26 l6 -4 l6 4 v-26" fill="#e3798a" stroke="${INK}" stroke-width="1.4"/>
        <circle class="glow" cx="0" cy="-70" r="120" fill="url(#vlLampGlow)"/>
        ${[[-60,-120],[60,-128],[-100,-60],[104,-50],[0,-190]].map((p,i)=>`<g class="sparkle" style="animation-delay:${i*.3}s" transform="translate(${p[0]},${p[1]}) scale(.6)"><path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="#f2c14e"/></g>`).join('')}`;
    }
  }
  if(st<3){ // névoa
    const op=[.88,.6,.35][st];
    g+=`<g class="fog" opacity="${op}" filter="url(#vlBlur)">${[[-90,-30,70,26],[40,-60,80,28],[-20,-10,110,30],[90,10,60,22],[-60,20,70,20]].map(f=>`<ellipse cx="${f[0]}" cy="${f[1]}" rx="${f[2]}" ry="${f[3]}" fill="#fbf7ef"/>`).join('')}</g>`;
  }
  return g;
}

/* ------------------------------------------------------------------
   MONTAGEM DO MUNDO
------------------------------------------------------------------ */
let root=null, svg=null, gGround=null, gPaths=null, gTreesBack=null, gEnt=null, gTreesFront=null, gFx=null, islandRim=null, islandTop=null, bridgeG=null;
const trees=[]; const cats=[]; let visitante=null;
let obras={}; // construções em andamento: id -> fim(ts)

function montarDOM(){
  if(root) return;
  root=$('cozy-wrap');
  root.innerHTML=`
   <div id="vl-view"><div id="vl-world"></div><div class="vl-tint" id="vl-tint"></div><div class="vl-fx" id="vl-fx"></div></div>
   <div class="vl-hud">
     <span class="vl-pill" id="vl-coin-pill">${ic('coin')}<span id="cat-coin">0</span></span>
     <span class="vl-pill">${ic('heart')}<span id="cat-hearts">0</span></span>
     <span class="vl-pill rate">+<span id="cat-rate">0</span>/s</span>
     <span class="vl-sp"></span>
     <button class="vl-round" id="vl-som" title="música" onclick="vlSom()">${ic('music')}</button>
     <button class="vl-round" title="fechar" onclick="fecharJogo()">${ic('close')}</button>
   </div>
   <div class="vl-hint" id="vl-hint">arraste pra passear · toque nas casinhas e nos gatinhos</div>
   <div class="vl-nav">
     <button onclick="vlPainel('rainha')">${ic('crown')}rainha<span class="vl-dot" id="vl-dot-rainha"></span></button>
     <button onclick="vlPainel('gatos')">${ic('paw')}gatinhos</button>
     <button onclick="vlPainel('mimos')">${ic('heart')}mimos</button>
     <button onclick="vlCentro()">${ic('home')}centro</button>
   </div>
   <div class="vl-sheet-bg" id="vl-sheet-bg" onclick="vlFecharSheet()"></div>
   <div class="vl-sheet" id="vl-sheet"></div>
   <div class="vl-modal" id="vl-modal"><div class="box" id="vl-modal-box"></div></div>`;
  const world=$('vl-world');
  svg=el('svg',{viewBox:'0 0 1000 1000',width:1000,height:1000});
  svg.innerHTML=`<defs>
     <radialGradient id="vlFireGlow"><stop offset="0" stop-color="#ffcf6b" stop-opacity=".75"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/></radialGradient>
     <radialGradient id="vlLampGlow"><stop offset="0" stop-color="#ffe59a" stop-opacity=".7"/><stop offset="1" stop-color="#ffe59a" stop-opacity="0"/></radialGradient>
     <radialGradient id="vlGrass" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#cfe0a8"/><stop offset=".75" stop-color="#bdd496"/><stop offset="1" stop-color="#a9c784"/></radialGradient>
     <pattern id="vlTufts" width="46" height="34" patternUnits="userSpaceOnUse"><path d="M8 20 l2 -6 l2 6 M30 8 l2 -5 l2 5" stroke="#9fbd7c" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="40" cy="26" r="1.4" fill="#f7f0d8"/><circle cx="18" cy="6" r="1.2" fill="#f7c6d0"/></pattern>
     <pattern id="vlForest" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="12" cy="14" r="2" fill="#6f8e5a"/><circle cx="44" cy="40" r="2.4" fill="#6f8e5a"/><path d="M30 10 l2 -5 l2 5" stroke="#6f8e5a" stroke-width="1.6" fill="none"/></pattern>
     <filter id="vlBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
   </defs>
   <rect x="-600" y="-600" width="2200" height="2200" fill="url(#vlForest)"/>`;
  gGround=el('g'); gPaths=el('g'); gTreesBack=el('g'); gEnt=el('g'); gTreesFront=el('g'); gFx=el('g');
  // castelo fica num morrinho próprio, no norte
  bridgeG=el('g');
  islandRim=el('ellipse',{cx:CX,cy:CY+14,fill:'#d6b48a',stroke:INK,'stroke-width':2.6});
  islandTop=el('ellipse',{cx:CX,cy:CY,fill:'url(#vlGrass)',stroke:'#6b8f52','stroke-width':3});
  const tufts=el('ellipse',{cx:CX,cy:CY,fill:'url(#vlTufts)',id:'vl-tufts'});
  const praca=el('ellipse',{cx:CX,cy:CY+4,rx:70,ry:38,fill:'#ead6ad',stroke:'#d4b98a','stroke-width':3});
  gGround.append(islandRim,islandTop,tufts,praca);
  svg.append(gGround,bridgeG,gPaths,gTreesBack,gEnt,gTreesFront,gFx);
  world.appendChild(svg);
  gerarArvores();
  ligarPanZoom();
}

function gerarArvores(){
  const r=seeded(20251102);
  for(let gy=-160;gy<=1160;gy+=44){
    for(let gx=-200;gx<=1200;gx+=46){
      const x=gx+(r()-.5)*34+(Math.floor(gy/44)%2?23:0), y=gy+(r()-.5)*26;
      const d=dEl(x,y);
      if(d<165) continue;
      const tipo=r()<.28?1:r()<.12?2:0, cor=Math.floor(r()*5), s=.85+r()*.45;
      const g=el('g',{class:'tree',transform:`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})`},arvoreSVG(tipo,cor));
      g.querySelector('.sway').style.animationDelay=(-r()*5).toFixed(2)+'s';
      (y<CY?gTreesBack:gTreesFront).appendChild(g);
      trees.push({g,x,y,d});
    }
  }
}
function arvoreEscondida(t){
  if(t.d<R+20) return true;
  const dc=Math.hypot(t.x-CASTELO_POS.x,(t.y-CASTELO_POS.y)/K*.95);
  if(dc<150) return true;                                     // clareira do castelo
  if(vila.castelo>=1 && Math.abs(t.x-CX)<40 && t.y>CASTELO_POS.y && t.y<CY) return true; // trilha da ponte
  const prox=proximaEstacao();
  if(prox && Math.hypot(t.x-prox.x,(t.y-prox.y)/K)<55) return true; // clareirinha da placa
  return false;
}
function atualizarArvores(){ trees.forEach(t=>{ const h=arvoreEscondida(t); if(h!==t.h){ t.h=h; t.g.classList.toggle('gone',h); } }); }
function ajustarIlha(){
  islandRim.setAttribute('rx',R.toFixed(1)); islandRim.setAttribute('ry',(R*K).toFixed(1));
  islandTop.setAttribute('rx',R.toFixed(1)); islandTop.setAttribute('ry',(R*K).toFixed(1));
  const t=$('vl-tufts'); t.setAttribute('rx',(R-6).toFixed(1)); t.setAttribute('ry',(R*K-4).toFixed(1));
  desenharPonte();
}
function desenharPonte(){
  bridgeG.innerHTML='';
  if(vila.castelo<1) return;
  const y0=CASTELO_POS.y+44, y1=CY-R*K+8;
  if(y1<=y0) return;
  let tab=''; for(let y=y0;y<y1;y+=9) tab+=`<rect x="${CX-22}" y="${y}" width="44" height="7" rx="2" fill="#c99a6b" stroke="${INK}" stroke-width="1.4"/>`;
  bridgeG.innerHTML=`<rect x="${CX-26}" y="${y0}" width="52" height="${y1-y0}" fill="#a37a55" opacity=".35"/>${tab}<path d="M${CX-25} ${y0} V${y1} M${CX+25} ${y0} V${y1}" stroke="#8a6a4e" stroke-width="3"/>`;
}
const proximaEstacao=()=>ESTACOES.find(e=>!estAberta(e.id));

/* constrói tudo que depende do estado (chamado ao abrir e quando algo muda muito) */
function montarMundo(){
  if(!svg) return;
  Ralvo=raioAlvo(); if(!R) R=Ralvo;
  ajustarIlha();
  // caminhos da praça até cada estação aberta
  gPaths.innerHTML='';
  ESTACOES.forEach(e=>{
    if(!estAberta(e.id)||e.id==='fogueira') return;
    const mx=(CX+e.x)/2+(e.y-CY)*.25, my=(CY+e.y)/2-(e.x-CX)*.12;
    const d=`M${CX} ${CY+4} Q${mx.toFixed(0)} ${my.toFixed(0)} ${e.x} ${e.y+6}`;
    gPaths.appendChild(el('path',{d,stroke:'#d4b98a','stroke-width':22,fill:'none','stroke-linecap':'round'}));
    gPaths.appendChild(el('path',{d,stroke:'#ead6ad','stroke-width':16,fill:'none','stroke-linecap':'round'}));
  });
  // entidades
  gEnt.innerHTML=''; cats.length=0; visitante=null;
  // castelo
  const cas=el('g',{class:'bld',transform:`translate(${CASTELO_POS.x},${CASTELO_POS.y})`,'data-act':'castelo','data-y':CASTELO_POS.y-60},casteloSVG(vila.castelo));
  gEnt.appendChild(cas);
  if(obras.castelo){ const a=el('g',{transform:`translate(${CASTELO_POS.x},${CASTELO_POS.y+40})`,'data-y':CASTELO_POS.y+40},andaimeSVG()); gEnt.appendChild(a); }
  if(vila.castelo>=1){
    const q=el('g',{class:'cat','data-act':'rainha',transform:`translate(${CASTELO_POS.x+34},${CASTELO_POS.y+28})`,'data-y':CASTELO_POS.y+28},`<g class="flip">${rainhaSVG(1.15)}</g>`);
    if(cartasNovas().length) q.appendChild(el('g',{class:'bubble',transform:'translate(0,-74)'},`<circle r="15" fill="#fbf7ef" stroke="${INK}" stroke-width="2"/><g transform="translate(-11,-11) scale(.7)">${ICON.letter.replace(/<\/?svg[^>]*>/g,'')}</g>`));
    gEnt.appendChild(q);
  }
  // estações
  ESTACOES.forEach(e=>{
    const aberta=estAberta(e.id);
    if(!aberta && e!==proximaEstacao() && e.id!=='fogueira') return;
    if(e.id==='fogueira'){
      const f=el('g',{class:'bld',id:'b-fogueira',transform:`translate(${e.x},${e.y})`,'data-act':aberta?'est:fogueira':(e===proximaEstacao()?'abrir:fogueira':'praca'),'data-y':e.y},`<g class="body">${fogueiraSVG(aberta,faseDe(estLvl('fogueira')))}</g>`);
      gEnt.appendChild(f);
      if(!aberta && e===proximaEstacao()) gEnt.appendChild(el('g',{class:'sign','data-act':'abrir:fogueira',transform:`translate(${e.x+40},${e.y-6})`,'data-y':e.y-6},placaSVG()));
    } else if(!aberta){
      if(obras[e.id]) gEnt.appendChild(el('g',{transform:`translate(${e.x},${e.y})`,'data-y':e.y},andaimeSVG()));
      else gEnt.appendChild(el('g',{class:'sign','data-act':'abrir:'+e.id,transform:`translate(${e.x},${e.y})`,'data-y':e.y},placaSVG()));
      return;
    } else {
      const fase=faseDe(estLvl(e.id));
      const corpo=e.prop==='gazebo'?coretoSVG(fase):casaSVG(e,fase);
      const b=el('g',{class:'bld',id:'b-'+e.id,transform:`translate(${e.x},${e.y})`,'data-act':'est:'+e.id,'data-y':e.y},
        `${e.prop==='pond'?propSVG('pond'):''}<g class="body">${corpo}</g>${e.prop!=='pond'?propSVG(e.prop):''}
         <g transform="translate(${e.prop==='gazebo'?-40:30},${e.prop==='gazebo'?-6:-2})"><rect x="-11" y="-11" width="22" height="22" rx="7" fill="#fbf7ef" stroke="${INK}" stroke-width="1.8"/><g transform="translate(-9,-9) scale(.5625)">${PROD[e.id].replace(/<\/?svg[^>]*>/g,'')}</g></g>`);
      gEnt.appendChild(b);
    }
    if(aberta) criarGato({...e.gato, estacao:e.id, casa:{x:e.x+(e.id==='fogueira'?-26:e.prop==='gazebo'?4:44),y:e.y+(e.id==='fogueira'?18:10)}});
  });
  // enfeites
  DECORS.forEach((d,i)=>{ if(i<vila.decor && d.d<R-10) gEnt.appendChild(el('g',{transform:`translate(${d.x},${d.y})`,'data-y':d.y,class:'decor'},decorSVG(d.id))); });
  // gatinhos adotados
  vila.adotados.forEach((a,i)=>{ const c=CORES_GATOS[a.c]; criarGato({nome:a.nome,cor:c[0],det:c[1],listras:c[2],adotado:i}); });
  ordenar(true);
  atualizarArvores();
  aplicarNoite();
}

/* ------------------------------------------------------------------
   GATINHOS QUE ANDAM
------------------------------------------------------------------ */
function pontoLivre(){
  for(let i=0;i<30;i++){
    const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*(R-40);
    const x=CX+Math.cos(a)*r, y=CY+Math.sin(a)*r*K;
    if(Math.hypot(x-CX,(y-CY)/K)<R-34) return {x,y};
  }
  return {x:CX,y:CY+30};
}
function criarGato(o){
  const start=o.casa?{...o.casa}:pontoLivre();
  const g=el('g',{class:'cat',transform:`translate(${start.x},${start.y})`,'data-act':'gato:'+cats.length,'data-y':start.y},`<g class="flip">${gatoSVG(o,.82)}</g>`);
  g.querySelector('.bodyg').style.animationDelay=(-Math.random()*2).toFixed(2)+'s';
  gEnt.appendChild(g);
  const c={o,g,x:start.x,y:start.y,alvo:null,espera:1+Math.random()*4,dir:1,estado:o.casa?'work':'idle'};
  if(o.casa) g.classList.add('work');
  cats.push(c);
  return c;
}
function moverGatos(dt){
  cats.forEach(c=>{
    if(c.alvo){
      const dx=c.alvo.x-c.x, dy=c.alvo.y-c.y, dist=Math.hypot(dx,dy), v=(c.vel||26)*dt;
      if(dist<=v){ c.x=c.alvo.x; c.y=c.alvo.y; c.alvo=null; c.g.classList.remove('walk');
        if(c.o.casa && Math.hypot(c.x-c.o.casa.x,c.y-c.o.casa.y)<2){ c.estado='work'; c.g.classList.add('work'); c.espera=12+Math.random()*25; }
        else { c.estado='idle'; c.espera=c.o.visit?99:2+Math.random()*5; if(c.o.visit) c.chegou=true; }
      } else { c.x+=dx/dist*v; c.y+=dy/dist*v; const nd=dx<0?-1:1; if(nd!==c.dir){ c.dir=nd; c.g.firstChild.setAttribute('transform',`scale(${nd},1)`); } }
      c.g.setAttribute('transform',`translate(${c.x.toFixed(1)},${c.y.toFixed(1)})`); c.g.dataset.y=c.y;
    } else {
      c.espera-=dt;
      if(c.espera<=0 && !c.o.visit){
        let alvo;
        if(c.o.casa){ alvo = c.estado==='work' ? (Math.random()<.5?{x:CX+(Math.random()-.5)*90,y:CY+20+(Math.random()-.5)*30}:pontoLivre()) : {...c.o.casa}; }
        else alvo=pontoLivre();
        c.alvo=alvo; c.estado='walk'; c.g.classList.remove('work'); c.g.classList.add('walk');
      }
    }
  });
}
let _ordT=0;
function ordenar(forcar){
  const kids=[...gEnt.children];
  const sorted=kids.slice().sort((a,b)=>Number(a.dataset.y||0)-Number(b.dataset.y||0));
  if(forcar || sorted.some((k,i)=>k!==kids[i])) sorted.forEach(k=>gEnt.appendChild(k));
}

/* ------------------------------------------------------------------
   PAN / ZOOM
------------------------------------------------------------------ */
const view={s:1,tx:0,ty:0};
function aplicarView(){
  const v=$('vl-view'), W=v.clientWidth, H=v.clientHeight;
  const minS=Math.max(W,H)/1000*1.02;
  view.s=Math.max(minS,Math.min(2.4,view.s));
  view.tx=Math.min(0,Math.max(W-1000*view.s,view.tx));
  view.ty=Math.min(0,Math.max(H-1000*view.s,view.ty));
  $('vl-world').style.transform=`translate(${view.tx.toFixed(1)}px,${view.ty.toFixed(1)}px) scale(${view.s.toFixed(4)})`;
}
function focar(x,y,s){ const v=$('vl-view'); view.s=s||view.s; aplicarView(); view.tx=v.clientWidth/2-x*view.s; view.ty=v.clientHeight/2-y*view.s; aplicarView(); }
function zoomInicial(){ const v=$('vl-view'); return Math.max(.75,Math.min(1.6,v.clientWidth/(2.15*R),v.clientHeight/(2.3*R*K+260))); }
window.vlCentro=function(){ animarFoco(CX,CY-30,zoomInicial()); };
function animarFoco(x,y,s){
  const v=$('vl-view'); const a={...view}; const b={s}; b.tx=v.clientWidth/2-x*s; b.ty=v.clientHeight/2-y*s;
  const t0=performance.now();
  const step=t=>{ const k=Math.min(1,(t-t0)/450), e=1-Math.pow(1-k,3); view.s=a.s+(b.s-a.s)*e; view.tx=a.tx+(b.tx-a.tx)*e; view.ty=a.ty+(b.ty-a.ty)*e; aplicarView(); if(k<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function ligarPanZoom(){
  const v=$('vl-view'); const pts=new Map(); let moved=0, downT=null, pinch=null, last=null;
  v.addEventListener('pointerdown',e=>{
    v.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){ moved=0; downT=e.target; last={x:e.clientX,y:e.clientY}; }
    if(pts.size===2){ const [a,b]=[...pts.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s}; }
    esconderDica();
  });
  v.addEventListener('pointermove',e=>{
    if(!pts.has(e.pointerId)) return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2 && pinch){
      const [a,b]=[...pts.values()], d=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      zoomEm(mx,my,pinch.s*d/pinch.d); moved=99; return;
    }
    if(pts.size===1 && last){ const dx=e.clientX-last.x, dy=e.clientY-last.y; moved+=Math.abs(dx)+Math.abs(dy); if(moved>6){ v.classList.add('drag'); view.tx+=dx; view.ty+=dy; aplicarView(); } last={x:e.clientX,y:e.clientY}; }
  });
  const up=e=>{
    if(!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if(pts.size<2) pinch=null;
    if(pts.size===0){ v.classList.remove('drag'); if(moved<=6 && downT) tocar(downT,e); downT=null; last=null; }
    else { const p=[...pts.values()][0]; last={x:p.x,y:p.y}; }
  };
  v.addEventListener('pointerup',up); v.addEventListener('pointercancel',e=>{ pts.delete(e.pointerId); pinch=null; v.classList.remove('drag'); });
  v.addEventListener('wheel',e=>{ e.preventDefault(); zoomEm(e.clientX,e.clientY,view.s*Math.exp(-e.deltaY*.0015)); },{passive:false});
  window.addEventListener('resize',()=>{ if(csAberto) aplicarView(); });
}
function zoomEm(cx,cy,ns){
  const r=$('vl-view').getBoundingClientRect(); const px=cx-r.left, py=cy-r.top;
  const wx=(px-view.tx)/view.s, wy=(py-view.ty)/view.s;
  view.s=ns; aplicarView(); view.tx=px-wx*view.s; view.ty=py-wy*view.s; aplicarView();
}
function esconderDica(){ const h=$('vl-hint'); if(h) h.style.opacity='0'; }

/* ------------------------------------------------------------------
   TOQUES
------------------------------------------------------------------ */
function tocar(alvo,ev){
  const n=alvo.closest&&alvo.closest('[data-act]'); if(!n) return;
  const [tipo,arg]=n.dataset.act.split(':');
  Som.init(); Som.blip();
  if(tipo==='est'){ n.classList.remove('tap'); void n.getBBox(); n.classList.add('tap'); setTimeout(()=>n.classList.remove('tap'),320); abrirEstacaoSheet(arg); }
  else if(tipo==='abrir') sheetConstruir(arg);
  else if(tipo==='gato') carinhoGato(Number(arg));
  else if(tipo==='castelo') sheetCastelo();
  else if(tipo==='rainha') vlPainel('rainha');
  else if(tipo==='visit') pegarVisitante();
  else if(tipo==='praca') toast('a fogueira da praça ainda está apagada... abram mais estações');
}
function carinhoGato(i){
  const c=cats[i]; if(!c) return;
  if(c.o.visit){ pegarVisitante(); return; }
  c.g.classList.remove('happy'); void c.g.getBBox(); c.g.classList.add('happy'); setTimeout(()=>c.g.classList.remove('happy'),520);
  vila.stats.taps++; csDirty=true; progMissao('taps',1);
  if(c.o.estacao) prog[c.o.estacao]=Math.min(.999,(prog[c.o.estacao]||0)+.2);
  if(vila.stats.taps%10===0){ vila.coracoes++; ftxt(c.x,c.y-50,'+1 coração','h'); atualizarHud(); Som.chime(); }
  else ftxt(c.x,c.y-50,['miau!','prr...','♥','mrrp!'][Math.floor(Math.random()*4)],'h');
  if(c.o.adotado==null && c.o.estacao && Math.random()<.25) ftxt(c.x,c.y-68,c.o.nome,'');
}
function ftxt(x,y,txt,cls){
  const t=el('text',{x:x.toFixed(1),y:y.toFixed(1),'text-anchor':'middle',class:'ftxt '+(cls||'')}); t.textContent=txt;
  gFx.appendChild(t); setTimeout(()=>t.remove(),1300);
}

/* ------------------------------------------------------------------
   LOOP
------------------------------------------------------------------ */
let raf=null, last=0, syncT=null, ceuT=null, visitT=null, fxT=null;
window.abrirCozy=function(){
  montarDOM();
  $('game-overlay').classList.add('active'); $('arcade-wrap').style.display='none'; root.classList.add('on');
  document.body.style.overflow='hidden'; csAberto=true;
  garantirMissoes();
  const elp=vila.lastTs?Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600):0;
  const ganho=elp>5?vilaRate()*elp:0;
  vila.lastTs=Date.now();
  R=0; montarMundo(); atualizarHud();
  requestAnimationFrame(()=>{ focar(CX,CY-30,zoomInicial()); });
  $('vl-som').classList.toggle('off',!Som.on);
  Som.start();
  if(ganho>=1) mostrarOffline(ganho,elp);
  else if(!vila.cartas.includes(0)) setTimeout(()=>abrirCarta(0),700);
  last=0; raf=requestAnimationFrame(loop);
  syncT=setInterval(()=>{ if(csDirty){ escrever(); csDirty=false; } },5000);
  ceuT=setInterval(()=>{ aplicarNoite(); atualizarDots(); },4000);
  fxT=setInterval(efeitos,900);
  agendarVisitante();
  setTimeout(()=>{ const h=$('vl-hint'); if(h) h.style.opacity='0'; },7000);
};
window.pararCatLoop=function(){
  if(!csAberto) return;
  csAberto=false; cancelAnimationFrame(raf); clearInterval(syncT); clearInterval(ceuT); clearInterval(fxT); clearTimeout(visitT);
  escrever(); csDirty=false; Som.stop();
  if(root){ root.classList.remove('on'); fecharSheet(); fecharModal(); const v=root.querySelector('.vl-video video'); if(v) v.pause(); }
  window.atualizarTagCozy();
};
document.addEventListener('visibilitychange',()=>{
  if(!csAberto) return;
  if(document.hidden){ escrever(); csDirty=false; Som.stop(); }
  else { const elp=Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600); if(elp>20){ const g=vilaRate()*elp; vila.moedas+=g; vila.stats.ganhos+=g; vila.lastTs=Date.now(); toast(`+${fmt(g)} moedas enquanto você estava fora`); } Som.start(); }
});
window.addEventListener('pagehide',()=>{ if(csAberto) escrever(); });

let hudN=0;
function loop(ts){
  if(!csAberto) return;
  if(!last) last=ts;
  const dt=Math.min(.25,(ts-last)/1000); last=ts;
  // ilha crescendo suave
  if(Math.abs(R-Ralvo)>.3){ R+= (Ralvo-R)*Math.min(1,dt*2.2); ajustarIlha(); atualizarArvores(); }
  // produção
  let mudou=false;
  ESTACOES.forEach(e=>{
    if(!estAberta(e.id)) return;
    prog[e.id]=(prog[e.id]||0)+dt/estCiclo(e.id);
    while(prog[e.id]>=1){ prog[e.id]-=1; produzir(e); mudou=true; }
  });
  const sb=$('vl-sheet-bar'); if(sb && sb.dataset.id) sb.style.width=((prog[sb.dataset.id]||0)*100).toFixed(1)+'%';
  // obras
  const agora=Date.now();
  for(const id in obras){ if(agora>=obras[id]) concluirObra(id); }
  moverGatos(dt);
  if((_ordT+=dt)>.35){ _ordT=0; ordenar(); }
  if(mudou||(++hudN%12===0)) atualizarHud();
  raf=requestAnimationFrame(loop);
}
function produzir(e){
  let v=estValor(e.id); let dobro=false;
  if(Math.random()<.02*perkLvl('sorte')){ v*=2; dobro=true; }
  vila.moedas+=v; vila.stats.ganhos+=v; vila.stats.producoes++; csDirty=true;
  progMissao('ganhos',v); progMissao('producoes',1);
  if(e.ciclo>=5||Math.random()<.5) ftxt(e.x+(e.id==='fogueira'?0:4),e.y-(e.id==='fogueira'?50:96),(dobro?'sorte! ':'')+'+'+fmt(v),'');
  const p=$('vl-coin-pill'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
}
function atualizarHud(){
  if(!root) return;
  $('cat-coin').textContent=fmt(vila.moedas);
  $('cat-hearts').textContent=fmt(vila.coracoes);
  const r=vilaRate(); $('cat-rate').textContent=r<10?r.toFixed(1).replace('.',','):fmt(r);
  atualizarBotoesSheet();
}
function noite(){ const d=new Date(), h=d.getHours()+d.getMinutes()/60; return h<6||h>=19?1:h<7?1-(h-6):h>=18?h-18:0; }
function aplicarNoite(){
  if(!root) return;
  const n=noite();
  $('vl-tint').style.background=n?`linear-gradient(rgba(45,50,120,${(n*.38).toFixed(2)}),rgba(60,50,120,${(n*.22).toFixed(2)}))`:'linear-gradient(rgba(255,240,200,.06),rgba(255,255,255,0))';
  svg.classList.toggle('noite',n>.5); root.classList.toggle('noite',n>.5);
}
function efeitos(){
  const fx=$('vl-fx'); if(!fx||document.hidden) return;
  const n=noite()>.5;
  if(n){ if(fx.querySelectorAll('.vl-fly').length<14){ const f=document.createElement('div'); f.className='vl-fly'; f.style.left=Math.random()*100+'%'; f.style.top=(30+Math.random()*60)+'%'; f.style.animationDuration=(5+Math.random()*5)+'s'; fx.appendChild(f); setTimeout(()=>f.remove(),10000); } }
  else {
    if(Math.random()<.45){ const l=document.createElement('div'); l.className='vl-leaf'; l.style.left=(Math.random()*110)+'%'; l.style.animationDuration=(7+Math.random()*6)+'s';
      l.innerHTML=Math.random()<.5?'<svg viewBox="0 0 20 20"><path d="M2 18 C2 6 10 2 18 2 C18 10 14 18 2 18Z" fill="#f6c3cf" stroke="#e3909f" stroke-width="1.4"/></svg>':'<svg viewBox="0 0 20 20"><path d="M2 18 C2 6 10 2 18 2 C18 10 14 18 2 18Z" fill="#b2cf8f" stroke="#86ad6b" stroke-width="1.4"/></svg>';
      fx.appendChild(l); setTimeout(()=>l.remove(),13500); }
    if(fx.querySelectorAll('.vl-bfly').length<3){ const b=document.createElement('div'); b.className='vl-bfly'; b.style.left=(10+Math.random()*75)+'%'; b.style.top=(25+Math.random()*50)+'%'; b.style.animationDelay=(-Math.random()*14)+'s';
      const c=['#f6c3cf','#f2d98c','#c3d8ec'][Math.floor(Math.random()*3)];
      b.innerHTML=`<svg viewBox="0 0 22 18"><g class="w"><ellipse cx="6" cy="7" rx="5.5" ry="6" fill="${c}" stroke="${INK}" stroke-width="1.2"/><ellipse cx="16" cy="7" rx="5.5" ry="6" fill="${c}" stroke="${INK}" stroke-width="1.2"/></g><rect x="10" y="3" width="2" height="12" rx="1" fill="${INK}"/></svg>`;
      fx.appendChild(b); setTimeout(()=>b.remove(),40000); }
  }
}

/* ------------------------------------------------------------------
   SHEETS (folhas de baixo) E MODAIS
------------------------------------------------------------------ */
let sheetAtual=null;
function abrirSheet(html,tipo){
  const s=$('vl-sheet'); s.innerHTML='<div class="vl-grab"></div>'+html; s.classList.add('on'); $('vl-sheet-bg').classList.add('on'); sheetAtual=tipo||null; s.scrollTop=0;
  const v=s.querySelector('video'); if(v) v.play().catch(()=>{});
  atualizarBotoesSheet();
}
function fecharSheet(){ const s=$('vl-sheet'); if(!s) return; s.classList.remove('on'); $('vl-sheet-bg').classList.remove('on'); const v=s.querySelector('video'); if(v) v.pause(); sheetAtual=null; }
window.vlFecharSheet=fecharSheet;
function modal(html){ $('vl-modal-box').innerHTML=html; $('vl-modal').classList.add('on'); }
function fecharModal(){ const m=$('vl-modal'); if(m) m.classList.remove('on'); }
window.fecharModal=fecharModal;

/* --- estação --- */
function abrirEstacaoSheet(id){
  const e=estDef(id), l=estLvl(id), pm=proxMarco(l), fase=faseDe(l);
  abrirSheet(`
    <div class="vl-video"><video src="gatos/${id}.mp4" poster="gatos/${id}.webp" muted loop playsinline autoplay></video><span class="tag"><span class="vl-ic">${PROD[id]}</span>${e.gato.nome} trabalhando</span></div>
    <h2>${e.nome}</h2><div class="vl-sub">${FASES[fase]} · nível <b id="vl-s-lvl">${l}</b>${marcoMult(l)>1?` · produção ×${marcoMult(l)}`:''}</div>
    <div class="vl-row"><div class="vl-stat"><b>${ic('coin')}<span id="vl-s-val">${fmt(estValor(id))}</span></b>por item</div><div class="vl-stat"><b>${estCiclo(id).toFixed(1).replace('.',',')}s</b>por item</div><div class="vl-stat"><b>${pm||'—'}</b>${pm?'próximo ×2':'nível máx'}</div></div>
    <div class="vl-bar"><i id="vl-sheet-bar" data-id="${id}"></i></div>
    ${e.extra?`<p class="vl-small" style="margin-top:0">${e.extra}</p>`:''}
    <div class="vl-buyx">${[1,10,'max'].map(x=>`<button class="${String(buyMode)===String(x)?'on':''}" onclick="vlBuyX('${x}','${id}')">${x==='max'?'máx':'x'+x}</button>`).join('')}</div>
    <button class="vl-btn" id="vl-up" data-up="${id}" onclick="vlMelhorar('${id}')"></button>
    <p class="vl-small">${fase<2?`no nível ${fase===0?10:25} vira ${FASES[fase+1]}`:'casarão completo'} · toque no gatinho na vila pra fazer carinho</p>`,'est:'+id);
}
window.vlBuyX=function(x,id){ buyMode=x==='max'?'max':Number(x); abrirEstacaoSheet(id); };
function atualizarBotoesSheet(){
  const b=$('vl-up');
  if(b){ const c=custoUpN(b.dataset.up,buyMode); b.innerHTML=`melhorar ${c.n>1?'+'+c.n+' ':''}· ${ic('coin')} ${fmt(c.custo)}`; b.classList.toggle('no',vila.moedas<c.custo); }
  document.querySelectorAll('#vl-sheet [data-cost]').forEach(x=>x.classList.toggle('no',vila.moedas<Number(x.dataset.cost)));
  document.querySelectorAll('#vl-sheet [data-hcost]').forEach(x=>x.classList.toggle('no',vila.coracoes<Number(x.dataset.hcost)));
}
window.vlMelhorar=function(id){
  const c=custoUpN(id,buyMode);
  if(vila.moedas<c.custo){ toast('faltam moedinhas'); return; }
  const antes=estLvl(id), faseA=faseDe(antes), nA=vilaNivel();
  vila.moedas-=c.custo; vila.est[id].lvl+=c.n; vila.stats.ups+=c.n; csDirty=true; progMissao('ups',c.n);
  const depois=estLvl(id), e=estDef(id);
  Som.blip(1.5);
  const m=MARCOS_NIVEL.find(x=>antes<x&&depois>=x);
  if(faseDe(depois)>faseA){ toast(`${e.nome} virou ${FASES[faseDe(depois)]}!`); Som.chime(); montarMundo(); const b=$('b-'+id); if(b) b.classList.add('nova'); }
  else if(m){ toast(`${e.nome} nível ${m}: produção em dobro!`); Som.chime(); }
  const vm=VILA_MARCOS.find(x=>nA<x.n&&vilaNivel()>=x.n); if(vm) setTimeout(()=>toast(vm.txt),1200);
  ftxt(e.x,e.y-110,'nível '+depois,'');
  abrirEstacaoSheet(id); atualizarHud();
};
/* --- construir nova estação --- */
function sheetConstruir(id){
  const e=estDef(id);
  if(obras[id]){ toast('os gatinhos pedreiros estão trabalhando!'); return; }
  abrirSheet(`<div class="vl-video"><img src="gatos/${id}.webp" alt="" style="filter:saturate(.85)"><span class="tag">quem vai morar aqui?</span></div>
    <h2>${e.nome}</h2><div class="vl-sub">${e.gato.nome} quer voltar pra floresta</div>
    <div class="vl-row"><div class="vl-stat"><b>${ic('coin')}${fmt(e.val*multGlobal())}</b>por item</div><div class="vl-stat"><b>${e.ciclo}s</b>por item</div></div>
    ${e.extra?`<p class="vl-small">${e.extra}</p>`:''}
    <div style="height:12px"></div>
    <button class="vl-btn rose" data-cost="${e.abrir}" onclick="vlConstruir('${id}')">construir · ${ic('coin')} ${fmt(e.abrir)}</button>
    <p class="vl-small">a vila cresce e a floresta abre espaço quando a obra termina</p>`,'abrir');
}
window.vlConstruir=function(id){
  const e=estDef(id);
  if(vila.moedas<e.abrir){ toast('faltam moedinhas'); return; }
  vila.moedas-=e.abrir; csDirty=true; obras[id]=Date.now()+5000;
  fecharSheet(); montarMundo(); animarFoco(e.x,e.y-30,Math.max(view.s,1.1)); Som.blip(1.2);
  toast('obra começou! 5 segundinhos...');
};
function concluirObra(id){
  delete obras[id];
  if(id==='castelo'){
    vila.castelo++; csDirty=true; escrever(); csDirty=false;
    montarMundo(); Som.fanfarra();
    const c=CASTELO[vila.castelo-1];
    burstHearts(innerWidth/2,innerHeight/2,26);
    modal(`<svg viewBox="-150 -200 300 260" style="width:220px;height:190px">${casteloSVG(vila.castelo)}</svg><h2>${c.nome} restaurado!</h2><p class="vl-small" style="font-size:14px">a Rainha Mimosa mandou uma carta</p><button class="vl-btn rose" onclick="fecharModal();abrirCarta(${vila.castelo})">ler carta</button>`);
    return;
  }
  vila.est[id]={lvl:1}; prog[id]=0; csDirty=true; escrever(); csDirty=false;
  Ralvo=raioAlvo(); montarMundo(); Som.fanfarra();
  const b=$('b-'+id); if(b) b.classList.add('nova');
  const e=estDef(id);
  burstHearts(innerWidth/2,innerHeight/2,22);
  modal(`<div class="vl-video" style="margin-bottom:8px"><video src="gatos/${id}.mp4" poster="gatos/${id}.webp" muted loop playsinline autoplay></video></div><h2>${e.nome} abriu!</h2><p class="vl-small" style="font-size:14px">${e.gato.nome} voltou pra floresta e já está trabalhando${e.extra?'<br><b>'+e.extra+'</b>':''}</p><button class="vl-btn" onclick="fecharModal()">eba!</button>`);
  atualizarHud();
}
/* --- castelo --- */
function sheetCastelo(){
  const st=vila.castelo, prox=CASTELO[st];
  const lista=CASTELO.map((c,i)=>`<div class="vl-item ${i<st?'done':''}"><div class="ic">${i<st?ICON.sparkle:ICON.hammer}</div><div class="tx"><b>${c.nome}</b><small>${c.desc}${i>=st?` · precisa de ${c.req} estações abertas`:''}</small></div></div>`).join('');
  let botao='';
  if(obras.castelo) botao='<button class="vl-btn" disabled>restaurando...</button>';
  else if(prox){
    const ok=nAbertas()>=prox.req;
    botao=ok?`<button class="vl-btn rose" data-cost="${prox.custo}" onclick="vlRestaurar()">restaurar ${prox.nome} · ${ic('coin')} ${fmt(prox.custo)}</button>`
      :`<button class="vl-btn" disabled>abra ${prox.req-nAbertas()} estação(ões) a mais</button>`;
  } else botao='<button class="vl-btn honey" onclick="vlPainel(\'rainha\')">castelo completo · ler cartas</button>';
  abrirSheet(`<svg viewBox="-150 -200 300 270" style="width:100%;max-height:220px;display:block">${casteloSVG(st)}</svg>
    <h2>castelo da Rainha Mimosa</h2><div class="vl-sub">${st===0?'em ruínas, coberto de névoa':st<5?`${st} de 5 partes restauradas · +${st*5}% em tudo`:'todo aceso! +25% em tudo'}</div>
    ${botao}<div style="height:12px"></div>${lista}`,'castelo');
}
window.vlRestaurar=function(){
  const p=CASTELO[vila.castelo]; if(!p||obras.castelo) return;
  if(nAbertas()<p.req){ toast('abram mais estações primeiro'); return; }
  if(vila.moedas<p.custo){ toast('faltam moedinhas'); return; }
  vila.moedas-=p.custo; csDirty=true; obras.castelo=Date.now()+7000;
  fecharSheet(); montarMundo(); animarFoco(CASTELO_POS.x,CASTELO_POS.y-30,Math.max(view.s,1)); Som.blip(1.2);
  toast('os gatinhos pedreiros foram pro castelo!');
};

/* --- painéis da barra --- */
let abaRainha='cartas', abaGatos='album';
window.vlPainel=function(p,aba){
  if(p==='rainha'){ if(aba) abaRainha=aba; painelRainha(); }
  else if(p==='gatos'){ if(aba) abaGatos=aba; painelGatos(); }
  else painelMimos();
};
function cartasDisponiveis(){ return CARTAS.map((c,i)=>i).filter(i=>i<=vila.castelo); }
function cartasNovas(){ return cartasDisponiveis().filter(i=>!vila.cartas.includes(i)); }
function painelRainha(){
  garantirMissoes();
  const tabs=`<div class="vl-tabs"><button class="${abaRainha==='cartas'?'on':''}" onclick="vlPainel('rainha','cartas')">cartas${cartasNovas().length?' •':''}</button><button class="${abaRainha==='pedidos'?'on':''}" onclick="vlPainel('rainha','pedidos')">pedidos do dia</button></div>`;
  let corpo='';
  if(abaRainha==='cartas'){
    corpo=CARTAS.map((c,i)=>{ const ok=i<=vila.castelo, nova=ok&&!vila.cartas.includes(i);
      return `<button class="vl-chap ${ok?'':'lock'}" ${ok?`onclick="abrirCarta(${i})"`:''}><span class="vl-ic" style="width:30px;height:30px">${ok?ICON.letter:ICON.crown}</span><span><b>${ok?c.t:'carta lacrada'}</b><small>${ok?(vila.cartas.includes(i)?'lida':'nova! recompensa: '+c.premio+' corações'):`restaure: ${CASTELO[i-1].nome}`}</small></span>${nova?'<span class="new">nova</span>':''}</button>`; }).join('');
  } else {
    const m=vila.missoes;
    corpo=`<p class="vl-small" style="margin:0 0 10px">a rainha pede ajuda todo dia — vale pros dois!</p>`+m.lista.map((x,i)=>{
      const def=MISSOES_POOL.find(p=>p.tipo===x.tipo), pct=Math.min(100,x.prog/x.meta*100);
      return `<div class="vl-item ${x.ok?'done':''}"><div class="tx"><b style="font-size:15px">${def.txt(x.meta)}</b><div class="vl-mbar"><i style="width:${pct}%"></i></div><small>${fmt(x.prog)} / ${fmt(x.meta)}</small></div>
        ${x.ok?'<span class="bt leaf" style="background:none;box-shadow:none;color:var(--leaf-dark)">feito</span>':x.prog>=x.meta?`<button class="bt leaf" onclick="vlResgatar(${i})">+3 ${ic('heart')}</button>`:`<span class="bt no">+3 ${ic('heart')}</span>`}</div>`; }).join('')
      +`<div class="vl-item" style="justify-content:center;flex-direction:column;text-align:center;border-style:dashed;border-color:var(--honey)"><span class="vl-ic" style="width:44px;height:44px">${ICON.gift}</span>${m.bau?'<b>presente de hoje aberto! volta amanhã</b>':m.lista.every(x=>x.ok)?'<button class="vl-btn honey" onclick="vlBau()">abrir presente da rainha</button>':'<small style="font-weight:800;color:var(--ink-soft)">cumpra os 3 pedidos pra ganhar o presente do dia</small>'}</div>`;
  }
  abrirSheet(`<svg class="vl-queen" viewBox="-40 -64 80 70">${rainhaSVG(1)}</svg><h2>Rainha Mimosa</h2><div class="vl-sub">${vila.castelo<5?'castelo '+vila.castelo+'/5 restaurado':'o reino dos aconchegos acordou'}</div>${tabs}${corpo}`,'rainha');
}
window.abrirCarta=function(i){
  const c=CARTAS[i]; if(!c||i>vila.castelo) return;
  let txt=c.txt;
  if(c.final){ const f=(window.DB&&DB.cartaFinal)||(typeof DB!=='undefined'&&DB.cartaFinal)||''; txt+=`\n\n— carta do viajante —\n\n${f||CARTA_FINAL_PADRAO}`; }
  const nova=!vila.cartas.includes(i);
  if(nova){ vila.cartas.push(i); vila.coracoes+=c.premio; csDirty=true; escrever(); csDirty=false; atualizarHud(); setTimeout(()=>{ toast(`+${c.premio} corações da rainha`); Som.chime(); },400); if(c.final) burstHearts(innerWidth/2,innerHeight/2,40); }
  abrirSheet(`<svg class="vl-queen" viewBox="-40 -64 80 70">${rainhaSVG(1)}</svg><h2>${c.t}</h2><div class="vl-sub">de: Rainha Mimosa · para: vocês dois</div>
    <div class="vl-letter"><span class="seal">${ICON.letter}</span><p>${esc(txt)}</p><div class="sig">com carinho, R. Mimosa</div></div>
    <button class="vl-btn rose" onclick="vlPainel('rainha','cartas')">voltar às cartas</button>`,'carta');
  atualizarDots(); if(nova) montarMundo();
};
function painelGatos(){
  const tabs=`<div class="vl-tabs"><button class="${abaGatos==='album'?'on':''}" onclick="vlPainel('gatos','album')">álbum</button><button class="${abaGatos==='adotar'?'on':''}" onclick="vlPainel('gatos','adotar')">abrigo</button></div>`;
  let corpo='';
  if(abaGatos==='album'){
    const todos=ESTACOES.map(e=>({nome:e.gato.nome,o:e.gato,sub:e.nome,ok:estAberta(e.id)})).concat(vila.adotados.map(a=>{ const c=CORES_GATOS[a.c]; return {nome:a.nome,o:{cor:c[0],det:c[1],listras:c[2]},sub:'adotado',ok:true}; }));
    todos.unshift({nome:'Mimosa',o:{cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1},sub:'rainha',ok:vila.castelo>=1});
    corpo=`<p class="vl-small" style="margin:0 0 10px">${todos.filter(t=>t.ok).length} gatinhos na floresta</p><div class="vl-album">${todos.map(t=>`<div class="${t.ok?'':'lock'}"><svg viewBox="-24 -58 48 62">${gatoSVG(t.o,1)}</svg><b>${t.ok?esc(t.nome):'???'}</b>${t.ok?esc(t.sub):'escondido'}</div>`).join('')}</div>`;
  } else {
    const cheio=vila.adotados.length>=20, c=custoAdocao();
    corpo=`<div class="vl-item"><div class="ic"><svg viewBox="-24 -58 48 62">${gatoSVG({cor:'#f6e7d6',det:'#e3a568',listras:1},1)}</svg></div><div class="tx"><b>adotar um gatinho</b><small>${vila.adotados.length}/20 adotados · cada um passeia pela vila e dá +5% em tudo</small></div>
      ${cheio?'<span class="bt no">cheio</span>':`<button class="bt honey" data-cost="${c}" onclick="vlAdotar()">${ic('coin')} ${fmt(c)}</button>`}</div>
      <p class="vl-small">dica: toque nos gatinhos passeando pra fazer carinho — a cada 10 carinhos ganha 1 coração</p>`;
  }
  abrirSheet(`<h2>gatinhos</h2>${tabs}${corpo}`,'gatos');
}
window.vlAdotar=function(){
  if(vila.adotados.length>=20) return;
  const c=custoAdocao(); if(vila.moedas<c){ toast('faltam moedinhas'); return; }
  const usados=new Set(vila.adotados.map(a=>a.nome)); const livres=NOMES_GATOS.filter(n=>!usados.has(n));
  const nome=livres[Math.floor(Math.random()*livres.length)]||'Gatinho';
  vila.moedas-=c; vila.adotados.push({nome,c:Math.floor(Math.random()*CORES_GATOS.length)}); csDirty=true; escrever(); csDirty=false;
  montarMundo(); Som.chime(); toast(`${nome} chegou na vila!`); painelGatos(); atualizarHud();
};
function painelMimos(){
  const perks=PERKS.map(p=>{ const l=perkLvl(p.id), max=l>=p.max, c=p.custo(l);
    return `<div class="vl-item"><div class="ic">${PROD[p.ic]||ICON[p.ic]}</div><div class="tx"><b>${p.nome} <span style="font-size:12px;color:var(--ink-soft)">nv ${l}</span></b><small>${p.desc(l)}</small></div>
    ${max?'<span class="bt no">máx</span>':`<button class="bt" data-hcost="${c}" onclick="vlPerk('${p.id}')">${ic('heart')} ${c}</button>`}</div>`; }).join('');
  const prox=DECORS[vila.decor], cd=custoDecor();
  const cabe=prox&&prox.d<R-10;
  const dec=prox?`<div class="vl-item"><div class="ic"><svg viewBox="-34 -60 68 68">${decorSVG(prox.id)}</svg></div><div class="tx"><b>${prox.nome}</b><small>enfeite ${vila.decor+1}/${DECORS.length} · +3% em tudo cada${cabe?'':' · a vila precisa crescer mais pra caber'}</small></div>
    ${cabe?`<button class="bt honey" data-cost="${cd}" onclick="vlEnfeitar()">${ic('coin')} ${fmt(cd)}</button>`:'<span class="bt no">em breve</span>'}</div>`:'<p class="vl-small">a vila está toda enfeitada!</p>';
  abrirSheet(`<h2>mimos e enfeites</h2><div class="vl-sub">corações vêm dos carinhos, visitantes, pedidos e cartas</div>${perks}<div style="height:6px"></div>${dec}`,'mimos');
}
window.vlPerk=function(id){
  const p=PERKS.find(x=>x.id===id), l=perkLvl(id), c=p.custo(l);
  if(vila.coracoes<c){ toast('faltam corações — faça carinho nos gatinhos!'); return; }
  vila.coracoes-=c; vila.perks[id]=l+1; csDirty=true; escrever(); csDirty=false; Som.chime(); painelMimos(); atualizarHud();
};
window.vlEnfeitar=function(){
  const prox=DECORS[vila.decor], c=custoDecor(); if(!prox) return;
  if(vila.moedas<c){ toast('faltam moedinhas'); return; }
  vila.moedas-=c; vila.decor++; csDirty=true; escrever(); csDirty=false;
  montarMundo(); Som.chime(); animarFoco(prox.x,prox.y-20,Math.max(view.s,1.2)); toast(`${prox.nome} na vila!`); painelMimos(); atualizarHud();
};

/* --- missões (pedidos da rainha) --- */
function hojeStr(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function garantirMissoes(){
  const h=hojeStr(); if(vila.missoes&&vila.missoes.dia===h) return;
  _seed=[...h].reduce((s,c)=>s*31+c.charCodeAt(0),7)%2147483647||1;
  const pool=MISSOES_POOL.slice(), lista=[];
  for(let i=0;i<3;i++){ const m=pool.splice(Math.floor(rng()*pool.length),1)[0]; lista.push({tipo:m.tipo,meta:m.meta(),prog:0,ok:false}); }
  vila.missoes={dia:h,lista,bau:false}; csDirty=true;
}
function progMissao(tipo,n){
  if(!vila.missoes) return;
  vila.missoes.lista.forEach(m=>{ if(m.tipo===tipo&&m.prog<m.meta){ m.prog=Math.min(m.meta,m.prog+n); if(m.prog>=m.meta){ toast('pedido da rainha cumprido!'); atualizarDots(); } } });
}
window.vlResgatar=function(i){ const x=vila.missoes.lista[i]; if(!x||x.ok||x.prog<x.meta) return; x.ok=true; vila.coracoes+=3; csDirty=true; escrever(); csDirty=false; Som.chime(); painelRainha(); atualizarHud(); atualizarDots(); };
window.vlBau=function(){
  const m=vila.missoes; if(m.bau||!m.lista.every(x=>x.ok)) return;
  const g=Math.max(100,vilaRate()*300); m.bau=true; vila.coracoes+=5; vila.moedas+=g; csDirty=true; escrever(); csDirty=false;
  Som.fanfarra(); burstHearts(innerWidth/2,innerHeight/2,26);
  modal(`<span class="vl-ic" style="width:70px;height:70px">${ICON.gift}</span><h2>presente da rainha!</h2><div class="big">${ic('coin')} ${fmt(g)} + 5 ${ic('heart')}</div><button class="vl-btn rose" onclick="fecharModal()">obrigado, majestade</button>`);
  painelRainha(); atualizarHud(); atualizarDots();
};
function atualizarDots(){
  if(!root) return;
  const m=vila.missoes;
  const pode=cartasNovas().length>0||(m&&(m.lista.some(x=>x.prog>=x.meta&&!x.ok)||(!m.bau&&m.lista.every(x=>x.ok))));
  $('vl-dot-rainha').classList.toggle('on',!!pode);
}

/* --- visitantes --- */
function agendarVisitante(){ clearTimeout(visitT); visitT=setTimeout(spawnVisitante,(30+Math.random()*45)*1000); }
function spawnVisitante(){
  if(!csAberto||visitante){ agendarVisitante(); return; }
  const a=Math.random()*Math.PI*2, sx=CX+Math.cos(a)*(R+30), sy=CY+Math.sin(a)*(R+30)*K;
  const cor=CORES_GATOS[Math.floor(Math.random()*CORES_GATOS.length)];
  const c=criarGato({nome:'visitante',cor:cor[0],det:cor[1],listras:cor[2],visit:1});
  c.x=sx; c.y=sy; c.vel=34; c.alvo={x:CX+(Math.random()-.5)*80,y:CY+28}; c.g.classList.add('walk');
  c.g.setAttribute('data-act','visit');
  c.g.appendChild(el('g',{class:'bubble',transform:'translate(0,-58)'},`<circle r="15" fill="#fbf7ef" stroke="${INK}" stroke-width="2"/><g transform="translate(-11,-11) scale(.69)">${ICON.gift.replace(/<\/?svg[^>]*>/g,'')}</g>`));
  visitante=c;
  setTimeout(()=>{ if(visitante===c){ c.g.remove(); cats.splice(cats.indexOf(c),1); visitante=null; agendarVisitante(); } },25000);
}
function pegarVisitante(){
  const c=visitante; if(!c) return;
  const g=Math.max(25,vilaRate()*50)*(1+.5*perkLvl('encomenda'));
  vila.moedas+=g; vila.coracoes+=2; vila.stats.encomendas++; vila.stats.ganhos+=g; csDirty=true;
  progMissao('encomendas',1); progMissao('ganhos',g);
  ftxt(c.x,c.y-60,`+${fmt(g)} e +2 corações`,'');
  Som.chime();
  c.g.remove(); cats.splice(cats.indexOf(c),1); visitante=null; atualizarHud(); agendarVisitante();
}

/* --- offline --- */
let _off=0;
function mostrarOffline(g,seg){
  _off=g; const h=Math.floor(seg/3600), m=Math.floor((seg%3600)/60);
  const tempo=h?`${h}h${m?` ${m}min`:''}`:`${Math.max(1,m)}min`;
  modal(`<svg viewBox="-30 -60 60 66" style="width:110px;height:120px">${gatoSVG({cor:'#f2dcc0',det:'#d8b48c',listras:1},1)}</svg><h2>bem-vindos de volta!</h2>
    <p class="vl-small" style="font-size:14px">em ${tempo} os gatinhos trabalharam e juntaram:</p><div class="big">${ic('coin')} ${fmt(g)}</div>
    <button class="vl-btn" onclick="vlColetar(1)">coletar</button><button class="vl-btn rose" ${vila.coracoes<3?'disabled':''} onclick="vlColetar(2)">coletar ×2 (3 corações)</button>`);
}
window.vlColetar=function(x){
  if(x===2){ if(vila.coracoes<3) return; vila.coracoes-=3; }
  const g=_off*x; vila.moedas+=g; vila.stats.ganhos+=g; _off=0; csDirty=true; escrever(); csDirty=false;
  fecharModal(); atualizarHud(); Som.chime();
  if(!vila.cartas.includes(0)) setTimeout(()=>abrirCarta(0),500);
};

/* ------------------------------------------------------------------
   MÚSICA E SONS (gerados no navegador, sem arquivos)
------------------------------------------------------------------ */
const Som={
  ctx:null,on:LS.get('vilaSom',true),master:null,fx:null,timer:null,step:0,next:0,noise:null,ambT:null,
  init(){
    if(this.ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    const c=this.ctx=new AC();
    this.master=c.createGain(); this.master.gain.value=0;
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3400;
    this.master.connect(lp); lp.connect(c.destination);
    this.fx=c.createDelay(); this.fx.delayTime.value=.36;
    const fbk=c.createGain(); fbk.gain.value=.3; const wet=c.createGain(); wet.gain.value=.3;
    this.fx.connect(fbk); fbk.connect(this.fx); this.fx.connect(wet); wet.connect(this.master);
    const len=c.sampleRate*2, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    this.noise=buf;
    // chiadinho de vinil
    const vb=c.createBuffer(1,len,c.sampleRate), vd=vb.getChannelData(0);
    for(let i=0;i<len;i++) vd[i]=Math.random()<.0007?(Math.random()*2-1)*.5:(Math.random()*2-1)*.008;
    const vs=c.createBufferSource(); vs.buffer=vb; vs.loop=true; const vg=c.createGain(); vg.gain.value=.5; vs.connect(vg); vg.connect(this.master); vs.start();
  },
  start(){
    if(!this.on) return; this.init(); if(!this.ctx) return;
    this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(.55,this.ctx.currentTime,1.2);
    if(!this.timer){ this.next=this.ctx.currentTime+.15; this.timer=setInterval(()=>this.sched(),110); }
    if(!this.ambT) this.amb();
  },
  stop(){ if(!this.ctx) return; this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.35); clearInterval(this.timer); this.timer=null; clearTimeout(this.ambT); this.ambT=null; },
  toggle(){ this.on=!this.on; LS.set('vilaSom',this.on); if(this.on) this.start(); else this.stop(); const b=$('vl-som'); if(b) b.classList.toggle('off',!this.on); },
  hz:m=>440*Math.pow(2,(m-69)/12),
  CH:[[53,57,60,64],[50,53,57,60],[46,50,53,57],[48,52,55,58]],   // Fmaj7  Dm7  Bbmaj7  C7
  ESC:[65,67,69,72,74,77,79,81],
  sched(){
    const c=this.ctx, e=60/72/2;
    while(this.next<c.currentTime+.6){ this.tocarPasso(this.step,this.next,e); this.next+=e; this.step++; }
  },
  tocarPasso(s,t,e){
    const pos=s%16, ci=Math.floor(s/16)%4, ch=this.CH[ci];
    if(pos===0) ch.forEach((m,i)=>this.pad(m,t+i*.03,e*16));
    if(pos===0||pos===8) this.nota(ch[0]-12,t,e*7,'sine',.16,false,.02);
    if(pos===6||pos===14) this.nota(ch[0]-12+7,t,e*2,'sine',.08,false,.02);
    if(pos%4===2) this.hat(t);
    if(pos===0||pos===10) this.kick(t);
    if(pos%2===0 && Math.random()<.32){
      const tons=this.ESC.filter(m=>ch.some(x=>(m-x)%12===0)||Math.random()<.4);
      const m=tons[Math.floor(Math.random()*tons.length)];
      this.nota(m,t+(Math.random()<.3?e*.5:0),1.5,'sine',.07,true,.005); this.nota(m+12,t,0.6,'triangle',.015,true,.005);
    }
  },
  nota(m,t,dur,tipo,g,fx,atk){
    const c=this.ctx,o=c.createOscillator(),v=c.createGain(); o.type=tipo; o.frequency.value=this.hz(m);
    v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+(atk||.01)); v.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(v); v.connect(this.master); if(fx) v.connect(this.fx); o.start(t); o.stop(t+dur+.05);
  },
  pad(m,t,dur){
    const c=this.ctx, f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900; f.Q.value=.3;
    const v=c.createGain(); v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(.035,t+1.4); v.gain.setValueAtTime(.035,t+dur-1.2); v.gain.linearRampToValueAtTime(0,t+dur+.4);
    [-6,6].forEach(dt=>{ const o=c.createOscillator(); o.type='triangle'; o.frequency.value=this.hz(m); o.detune.value=dt; o.connect(f); o.start(t); o.stop(t+dur+.5); });
    f.connect(v); v.connect(this.master); v.connect(this.fx);
  },
  hat(t){ const c=this.ctx,s=c.createBufferSource(); s.buffer=this.noise; const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000; const v=c.createGain(); v.gain.setValueAtTime(.025,t); v.gain.exponentialRampToValueAtTime(.0001,t+.05); s.connect(f); f.connect(v); v.connect(this.master); s.start(t,Math.random()); s.stop(t+.06); },
  kick(t){ const c=this.ctx,o=c.createOscillator(),v=c.createGain(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(45,t+.18); v.gain.setValueAtTime(.12,t); v.gain.exponentialRampToValueAtTime(.0001,t+.3); o.connect(v); v.connect(this.master); o.start(t); o.stop(t+.32); },
  amb(){
    if(!this.ctx||!this.on){ this.ambT=null; return; }
    const c=this.ctx, t=c.currentTime+.05;
    if(noite()>.5){ // grilos
      for(let i=0;i<3;i++){ const o=c.createOscillator(),v=c.createGain(); o.frequency.value=4300+Math.random()*200; v.gain.setValueAtTime(0,t+i*.09); v.gain.linearRampToValueAtTime(.012,t+i*.09+.01); v.gain.linearRampToValueAtTime(0,t+i*.09+.05); o.connect(v); v.connect(this.master); o.start(t+i*.09); o.stop(t+i*.09+.07); }
    } else { // passarinho
      const n=2+Math.floor(Math.random()*3), base=2300+Math.random()*900;
      for(let i=0;i<n;i++){ const o=c.createOscillator(),v=c.createGain(), ti=t+i*.13; o.type='sine'; o.frequency.setValueAtTime(base,ti); o.frequency.exponentialRampToValueAtTime(base*1.5,ti+.07); v.gain.setValueAtTime(0,ti); v.gain.linearRampToValueAtTime(.018,ti+.015); v.gain.exponentialRampToValueAtTime(.0001,ti+.1); o.connect(v); v.connect(this.master); v.connect(this.fx); o.start(ti); o.stop(ti+.12); }
    }
    if(estAberta('fogueira')){ for(let i=0;i<4;i++){ const ti=t+Math.random()*1.5, s=c.createBufferSource(); s.buffer=this.noise; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1800+Math.random()*2000; const v=c.createGain(); v.gain.setValueAtTime(.05,ti); v.gain.exponentialRampToValueAtTime(.0001,ti+.03); s.connect(f); f.connect(v); v.connect(this.master); s.start(ti,Math.random()); s.stop(ti+.04); } }
    this.ambT=setTimeout(()=>this.amb(),(noite()>.5?1200:3500)+Math.random()*5000);
  },
  blip(k){ if(!this.ctx||!this.on) return; const t=this.ctx.currentTime; this.nota(84*(k?1:1)+(k?5:0),t,.15,'sine',.06,false,.005); this.nota(91+(k?5:0),t+.05,.18,'sine',.05,false,.005); },
  chime(){ if(!this.ctx||!this.on) return; const t=this.ctx.currentTime; [77,81,84,89].forEach((m,i)=>this.nota(m,t+i*.07,.9,'sine',.06,true,.005)); },
  fanfarra(){ if(!this.ctx||!this.on) return; const t=this.ctx.currentTime; [65,69,72,77,81,84].forEach((m,i)=>this.nota(m,t+i*.09,1.4,'triangle',.05,true,.005)); }
};
window.vlSom=()=>{ Som.init(); Som.toggle(); };

})();
