/* =====================================================================
   VILA DOS GATINHOS — motor em Canvas 2D
   ---------------------------------------------------------------------
   Desempenho:
   • tudo é desenhado num único <canvas> do tamanho da tela
   • cada desenho vetorial vira um sprite (bitmap) UMA vez e fica em cache
   • o chão da ilha é pré-renderizado e só é refeito quando a ilha cresce
   • só desenha o que está visível (culling) e ordena por profundidade
     numa lista simples (sem mexer no DOM → nada pisca)
   • sem filtros caros; brilhos usam um sprite de gradiente pronto
   • resolução adaptativa: se o aparelho sofrer, baixa a densidade
   Depende de: $, esc, LS, toast, burstHearts, fb, cozyRef, DB, HEART_PATH
   ===================================================================== */
(function(){
'use strict';

/* ------------------------------------------------------------------
   ÍCONES (HTML)
------------------------------------------------------------------ */
const INK='#6b5440';
const S=`stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`;
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
const inner=svg=>svg.replace(/<\/?svg[^>]*>/g,'');
const ic=k=>`<span class="vl-ic">${ICON[k]}</span>`;
const PROD={
  sopa:'<svg viewBox="0 0 32 32"><path d="M8 9c0-3 3-3 3-6M14 9c0-3 3-3 3-6M20 9c0-3 3-3 3-6" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M4 14 H28 C28 22 23 27 16 27 C9 27 4 22 4 14Z" fill="#f2c14e" stroke="#6b5440" stroke-width="2"/><ellipse cx="16" cy="14" rx="12" ry="2.5" fill="#f4a35c"/><circle cx="12" cy="14" r="1.6" fill="#86a86b"/><circle cx="19" cy="14.5" r="1.4" fill="#e3798a"/></svg>',
  padaria:'<svg viewBox="0 0 32 32"><path d="M6 25 L22 9 C25 8 27 10 25 13 L9 28 C7 29 5 27 6 25Z" fill="#f4a35c" stroke="#6b5440" stroke-width="2"/><path d="M11 20l2 2M15 16l2 2M19 12l2 2" stroke="#d9793a" stroke-width="1.6" stroke-linecap="round"/><path d="M23 9 C22 5 25 3 27 4 M24 10 C27 8 30 10 29 12 M23 9 C21 6 18 6 18 8" fill="none" stroke="#5f824b" stroke-width="2.2" stroke-linecap="round"/></svg>',
  horta:'<svg viewBox="0 0 32 32"><rect x="13" y="16" width="6" height="11" rx="3" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M4 17 C4 8 28 8 28 17 Z" fill="#e3606e" stroke="#6b5440" stroke-width="2"/><circle cx="11" cy="12" r="2" fill="#fff"/><circle cx="19" cy="11" r="1.6" fill="#fff"/><circle cx="23" cy="15" r="1.3" fill="#fff"/></svg>',
  lenha:'<svg viewBox="0 0 32 32"><rect x="4" y="17" width="22" height="9" rx="4.5" fill="#b98a5e" stroke="#6b5440" stroke-width="2"/><ellipse cx="26" cy="21.5" rx="3.5" ry="4.5" fill="#e8d3a8" stroke="#6b5440" stroke-width="2"/><rect x="7" y="7" width="20" height="9" rx="4.5" fill="#c99a6b" stroke="#6b5440" stroke-width="2"/><ellipse cx="27" cy="11.5" rx="3.5" ry="4.5" fill="#e8d3a8" stroke="#6b5440" stroke-width="2"/></svg>',
  pesca:'<svg viewBox="0 0 32 32"><path d="M4 16 C9 8 20 8 25 16 C20 24 9 24 4 16Z" fill="#86afcf" stroke="#4e6f8c" stroke-width="2"/><path d="M25 16 L30 11 L30 21 Z" fill="#86afcf" stroke="#4e6f8c" stroke-width="2" stroke-linejoin="round"/><circle cx="10" cy="14.5" r="1.6" fill="#4e6f8c"/></svg>',
  fogueira:'<svg viewBox="0 0 32 32"><path d="M4 28 L28 6" stroke="#b98a5e" stroke-width="2.4" stroke-linecap="round"/><rect x="17" y="6" width="8" height="8" rx="3.5" fill="#fffaf2" stroke="#6b5440" stroke-width="1.8" transform="rotate(-42 21 10)"/><rect x="10" y="13" width="8" height="8" rx="3.5" fill="#f9e3cf" stroke="#6b5440" stroke-width="1.8" transform="rotate(-42 14 17)"/></svg>',
  violao:'<svg viewBox="0 0 32 32"><path d="M12 25V8l14-3v15" fill="none" stroke="#6b5440" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="9" cy="25" rx="4" ry="3.2" fill="#a07bb7" stroke="#6b5440" stroke-width="2"/><ellipse cx="23" cy="21" rx="4" ry="3.2" fill="#a07bb7" stroke="#6b5440" stroke-width="2"/></svg>',
  soneca:'<svg viewBox="0 0 32 32"><path d="M11 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M5 12 H23 V20 C23 25 19 27 14 27 C9 27 5 25 5 20Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M23 14 C29 14 29 21 23 21" fill="none" stroke="#6b5440" stroke-width="2"/><ellipse cx="14" cy="12.5" rx="9" ry="1.8" fill="#c99a6b"/></svg>'
};

/* ------------------------------------------------------------------
   DADOS
------------------------------------------------------------------ */
const K=0.6, CX=500, CY=520;
const dEl=(x,y)=>Math.hypot(x-CX,(y-CY)/K);
/* trabalho: onde o gatinho fica (dx,dy em relação à construção) e o que ele faz */
const ESTACOES=[
  {id:'sopa',    nome:'cozinha da vovó',    ciclo:3,  val:2,     abrir:0,      up:10,     x:405,y:568, work:{dx:-44,dy:10,acao:'mexer'},  fumaca:[[14,-92],[-52,-14]],
   gato:{nome:'Nuvem',cor:'#fffaf3',det:'#ecd6c2'}, pers:'gulosa e carinhosa',
   falas:['essa sopa tá quase... *prova* ...só mais uma provadinha','se o dia tá difícil, toma uma sopinha','não fui eu que comi o pão. juro.','o segredo é mexer com amor (e muito queijo)']},
  {id:'padaria', nome:'barraquinha da feira',ciclo:5, val:9,     abrir:150,    up:70,     x:610,y:582, work:{dx:2,dy:-4,acao:'cortar'},   fumaca:[],
   gato:{nome:'Paçoca',cor:'#f1d6ae',det:'#c9a072',listras:1}, pers:'perfeccionista',
   falas:['cenoura cortada torta é crime','47 rodelinhas. todas iguais. perfeito.','não encosta na minha faca!','organizei as caixas por cor. de nada.']},
  {id:'horta',   nome:'estufa',             ciclo:7,  val:34,    abrir:1400,   up:480,    x:372,y:472, work:{dx:46,dy:12,acao:'regar'},    fumaca:[],
   gato:{nome:'Azulzinho',cor:'#bccbdc',det:'#8ea3bd',listras:1,chapeu:1}, pers:'tímido e sonhador',
   falas:['oi... as plantas gostam quando a gente conversa com elas','esse cogumelo se chama Gérson','*ficou vermelhinho*','um dia quero plantar um jardim que dê pra ver do céu']},
  {id:'lenha',   nome:'serraria',           ciclo:9,  val:130,   abrir:9500,   up:3000,   x:650,y:466, work:{dx:-50,dy:12,acao:'machado'},  fumaca:[[22,-96]],
   gato:{nome:'Toco',cor:'#f3dcb8',det:'#d3a878',xadrez:1}, pers:'forte e brincalhão',
   falas:['olha esse muque!','madeiraaaa!','lenha cortada, coração quentinho','aposto que levanto esse tronco com uma pata só']},
  {id:'pesca',   nome:'cabana do lago',     ciclo:12, val:500,   abrir:60000,  up:18000,  x:318,y:612, work:{dx:-30,dy:-2,acao:'pescar'},  fumaca:[[16,-104]],
   gato:{nome:'Laranjinha',cor:'#f4a35c',det:'#d9793a',listras:1,chapeuVerde:1}, pers:'paciente contador de histórias',
   falas:['uma vez pesquei um peixe deste tamanho... ou era uma bota','pescar é 10% isca e 90% esperar','shhh, os peixes estão ouvindo','o lago brilhou verde ontem à noite. estranho, né?']},
  {id:'fogueira',nome:'acampamento',        ciclo:15, val:1900,  abrir:380000, up:110000, x:500,y:524, work:{dx:-30,dy:20,acao:'tostar'},  fumaca:[],
   gato:{nome:'Carvão',cor:'#57514f',det:'#3a3535'}, pers:'misterioso e noturno',
   falas:['à noite a floresta conta segredos...','vocês viram aquela luz verde no céu?','marshmallow bom é dourado, nem cru nem queimado','tem gente aqui que não é bem o que parece']},
  {id:'violao',  nome:'coreto da música',   ciclo:18, val:7200,  abrir:2.3e6,  up:680000, x:528,y:656, work:{dx:2,dy:6,acao:'tocar'},     fumaca:[],
   gato:{nome:'Melodia',cor:'#cfcfcf',det:'#9a9a9a',listras:1}, pers:'artista dramática',
   falas:['essa se chama "saudade de um lugar que eu nunca fui"','lá-lá-láá~','um dia vou tocar num palco de verdade','aplausos são opcionais. mas bem-vindos.'], extra:'a música anima todo mundo: +3% em tudo por nível'},
  {id:'soneca',  nome:'casa-cogumelo',      ciclo:22, val:28000, abrir:1.4e7,  up:4.2e6,  x:702,y:610, work:{dx:-58,dy:6,acao:'dormir'},   fumaca:[[-6,-92]],
   gato:{nome:'Soninho',cor:'#f2dcc0',det:'#d8b48c',listras:1}, pers:'preguiçoso e filósofo',
   falas:['zzz... cinco minutinhos...','descansar também é trabalhar','sonhei que eu era uma nuvem. ou a nuvem sonhou comigo?','por que correr se a rede tá logo ali?'], extra:'gatinhos descansados: +1h de ganho offline por nível'}
];
ESTACOES.forEach(e=>e.d=dEl(e.x,e.y));
const MARCOS_NIVEL=[10,25,50,75,100,150,200];
const FASES=['simples','caprichada','dos sonhos'];
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
  {id:'despertador',ic:'soneca',nome:'despertador fofinho',desc:l=>`construções 5% mais rápidas por nível (agora ${l*5}%)`, custo:l=>8*(l+1), max:10},
  {id:'sorte',      ic:'horta', nome:'trevo da sorte',     desc:l=>`2% de chance de produção em dobro por nível (agora ${l*2}%)`, custo:l=>6*(l+1), max:15},
  {id:'encomenda',  ic:'gift',  nome:'clientes generosos', desc:l=>`visitantes deixam +50% por nível (agora +${l*50}%)`, custo:l=>4*(l+1), max:20}
];
const DECORS=[
  {id:'lampiao',  nome:'lampião',            x:455,y:500},
  {id:'banco',    nome:'banquinho',          x:552,y:498},
  {id:'flores',   nome:'canteiro de flores', x:455,y:606},
  {id:'correio',  nome:'caixinha de correio',x:578,y:528},
  {id:'poco',     nome:'poço dos desejos',   x:442,y:440},
  {id:'varal',    nome:'varal de bandeirinhas',x:562,y:444},
  {id:'cerejeira',nome:'cerejeira',          x:282,y:522},
  {id:'balanco',  nome:'balanço',            x:738,y:532},
  {id:'cogumelos',nome:'cogumelos gigantes', x:402,y:654},
  {id:'fonte',    nome:'fontezinha',         x:622,y:694},
  {id:'cerca',    nome:'cerca florida',      x:250,y:604},
  {id:'placa',    nome:'placa da vila',      x:500,y:722}
];
DECORS.forEach(d=>d.d=dEl(d.x,d.y));
const NOMES_GATOS=['Bolinha','Mel','Pipoca','Fubá','Nina','Tico','Amora','Pudim','Chico','Luna','Algodão','Canela','Jujuba','Biscoito','Mingau','Pitoco','Café','Bombom','Tapioca','Brigadeiro'];
const CORES_GATOS=[['#f4a35c','#d9793a',1],['#fffaf3','#e2cdb9',0],['#57514f','#3a3535',0],['#cfcfcf','#9a9a9a',1],['#f1d6ae','#c9a072',1],['#bccbdc','#8ea3bd',1],['#e8c9a4','#8a6a4e',0],['#f6e7d6','#e3a568',1]];
const JEITOS=[
  {p:'curioso',falas:['o que tem atrás daquela árvore?','posso ver? posso? posso?']},
  {p:'comilão',falas:['alguém falou em sopa?','meu estômago fez um barulho estranho']},
  {p:'brincalhão',falas:['pega-pega! tá com você!','olha eu rolando!']},
  {p:'tímido',falas:['...oi','*se esconde atrás do rabo*']},
  {p:'dramático',falas:['ninguém me entende!!','esse é o pior melhor dia da minha vida']},
  {p:'aventureiro',falas:['um dia vou ver o mar','ouvi dizer que existe uma feira de viajantes...']}
];
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
   ESTADO + ECONOMIA
------------------------------------------------------------------ */
function novaVila(ts){ return {v:4,moedas:0,coracoes:0,lastTs:ts===undefined?Date.now():ts,est:{sopa:{lvl:1}},decor:0,perks:{},missoes:null,
  stats:{taps:0,ups:0,encomendas:0,ganhos:0,producoes:0},castelo:0,cartas:[],adotados:[]}; }
let vila=novaVila(0);
let csDirty=false, csAberto=false, csBoas=false, buyMode=1;
const prog={};
let R=0, Ralvo=0;
let obras={};

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
function raioAlvo(){ let r=150; ESTACOES.forEach(e=>{ if(estAberta(e.id)||obras[e.id]) r=Math.max(r,e.d+72); }); return r; }
const proximaEstacao=()=>ESTACOES.find(e=>!estAberta(e.id));

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
  v.adotados=Array.isArray(d.adotados)?d.adotados.slice(0,20).map(a=>({nome:String(a.nome||'Gatinho').slice(0,20),c:Math.max(0,Math.min(CORES_GATOS.length-1,Number(a.c)||0)),j:Math.max(0,Math.min(JEITOS.length-1,Number(a.j)||0))})):[];
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
   DESENHOS VETORIAIS (viram sprites; também usados no HTML)
------------------------------------------------------------------ */
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255; const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt))); return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1); }
const sombra=(rx,ry)=>`<ellipse cx="0" cy="3" rx="${rx}" ry="${ry}" fill="rgba(70,55,35,.18)"/>`;

function arvoreSVG(tipo,cor){
  const c=['#8fb874','#9cc27c','#a8c98a','#86ad6b','#b2cf8f'][cor%5], d=['#6f9a58','#7aa35f','#86ad6b','#668f51','#8db86c'][cor%5];
  if(tipo===1) return `<ellipse cx="0" cy="2" rx="18" ry="6" fill="rgba(60,80,40,.25)"/><rect x="-3" y="-14" width="6" height="16" rx="2" fill="#a07a55" ${S}/><path d="M0 -70 L18 -38 L9 -38 L22 -14 L-22 -14 L-9 -38 L-18 -38 Z" fill="${d}" ${S}/><path d="M-5 -55 L-10 -45" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  if(tipo===2) return `<ellipse cx="0" cy="2" rx="20" ry="6" fill="rgba(60,80,40,.25)"/><path d="M-20 0 C-26 -14 -12 -26 0 -20 C10 -30 26 -16 20 0 Z" fill="${c}" ${S}/><circle cx="-8" cy="-12" r="2.2" fill="#f7c6d0"/><circle cx="6" cy="-16" r="2.2" fill="#fff"/><circle cx="11" cy="-7" r="2.2" fill="#f7c6d0"/>`;
  return `<ellipse cx="0" cy="2" rx="22" ry="7" fill="rgba(60,80,40,.25)"/><rect x="-4" y="-22" width="8" height="24" rx="3" fill="#a07a55" ${S}/><path d="M-24 -26 C-34 -42 -20 -62 -6 -56 C-2 -72 22 -70 22 -54 C36 -50 34 -26 20 -22 C12 -14 -16 -14 -24 -26 Z" fill="${c}" ${S}/><path d="M-12 -46 C-8 -52 0 -52 4 -48" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="12" cy="-34" r="2.3" fill="${d}"/>`;
}
function gatoSVG(o,escala,olhosFechados){
  const s=escala||1, c=o.cor, d=o.det;
  const listras=o.listras?`<path d="M-4 -37 l1 4 M0 -38 v4 M4 -37 l-1 4" stroke="${d}" stroke-width="1.8" stroke-linecap="round"/><path d="M-11 -10 q3 1 4 4 M11 -10 q-3 1 -4 4" stroke="${d}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`:'';
  const capa=o.capa?`<path d="M-13 -22 C-20 -8 -18 2 -12 2 L12 2 C18 2 20 -8 13 -22 Z" fill="#f2a7b8" stroke="${INK}" stroke-width="2"/>`:'';
  const chapeu=o.chapeu?`<ellipse cx="0" cy="-41" rx="15" ry="4" fill="#e8c27a" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -42 C-8 -52 8 -52 8 -42 Z" fill="#e8c27a" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -44 h16" stroke="#e3798a" stroke-width="2.4"/>`
    :o.chapeuVerde?`<ellipse cx="0" cy="-41" rx="14" ry="3.6" fill="#5f824b" stroke="${INK}" stroke-width="1.8"/><path d="M-8 -42 C-8 -52 8 -52 8 -42 Z" fill="#6f9a58" stroke="${INK}" stroke-width="1.8"/>`
    :o.capacete?`<path d="M-11 -38 C-11 -52 11 -52 11 -38 Z" fill="#f2c14e" stroke="${INK}" stroke-width="1.8"/><path d="M-13 -38 h26" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`:'';
  const coroa=o.coroa?`<path d="M-8 -43 L-9 -53 L-4 -48 L0 -56 L4 -48 L9 -53 L8 -43 Z" fill="#f2c14e" stroke="#8a6224" stroke-width="1.6" stroke-linejoin="round"/><circle cx="0" cy="-47" r="1.6" fill="#e3798a"/>`:'';
  const xadrez=o.xadrez?`<path d="M-11 -16 Q0 -10 11 -16 L10 -11 Q0 -6 -10 -11 Z" fill="#c25a6c" stroke="${INK}" stroke-width="1.6"/>`:'';
  const olhos=olhosFechados?`<path d="M-7 -29.5 q2.4 2 4.8 0 M2.2 -29.5 q2.4 2 4.8 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    :`<ellipse cx="-4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><ellipse cx="4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><circle cx="-4" cy="-30.3" r=".6" fill="#fff"/><circle cx="5.2" cy="-30.3" r=".6" fill="#fff"/>`;
  return `<g transform="scale(${s})"><ellipse cx="0" cy="1" rx="13" ry="4" fill="rgba(60,50,30,.22)"/>
    <path d="M9 -4 C20 -4 22 -14 17 -20" stroke="${INK}" stroke-width="7.5" fill="none" stroke-linecap="round"/>
    <path d="M9 -4 C20 -4 22 -14 17 -20" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${capa}
    <ellipse cx="0" cy="-10" rx="12" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="-5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/>
    ${xadrez}
    <path d="M-11 -33 L-10 -46 L-2 -38 Z M11 -33 L10 -46 L2 -38 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-9 -36 L-9 -42 L-5 -38 Z M9 -36 L9 -42 L5 -38 Z" fill="#f4b6b6"/>
    <ellipse cx="0" cy="-29" rx="13" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    ${listras}${olhos}
    <ellipse cx="-8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/><ellipse cx="8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/>
    <path d="M-2 -25.5 q1 1.4 2 0 q1 1.4 2 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${chapeu}${coroa}</g>`;
}
function gatoDeitadoSVG(o){
  const c=o.cor, d=o.det;
  return `<ellipse cx="0" cy="1" rx="22" ry="5" fill="rgba(60,50,30,.2)"/>
   <path d="M14 -6 C26 -6 28 2 18 2" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M14 -6 C26 -6 28 2 18 2" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
   <ellipse cx="2" cy="-8" rx="17" ry="10" fill="${c}" stroke="${INK}" stroke-width="2"/>
   <path d="M-2 -16 q2 4 0 8 M6 -17 q2 4 0 8" stroke="${d}" stroke-width="1.8" fill="none"/>
   <path d="M-22 -18 L-21 -29 L-14 -22 Z M-6 -20 L-6 -30 L-12 -23 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
   <ellipse cx="-14" cy="-12" rx="11" ry="9" fill="${c}" stroke="${INK}" stroke-width="2"/>
   <path d="M-20 -13 q2 1.6 4 0 M-12 -13 q2 1.6 4 0" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
   <ellipse cx="-21" cy="-9" rx="2.2" ry="1.3" fill="#f4a6a6"/><ellipse cx="-7" cy="-9" rx="2.2" ry="1.3" fill="#f4a6a6"/>`;
}
function rainhaSVG(escala){ return gatoSVG({cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1},escala); }

/* ---- construções únicas (âncora = chão, centro). n = noite (janelas acesas) ---- */
const jan=n=>n?'#ffd36b':'#fff4d0';
function bSopa(f,n){ // casinha de pedra com telhado de palha e caldeirão
  const pedras=[[-26,-30],[-14,-12],[-22,-6],[20,-26],[26,-10],[8,-34],[-6,-22]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="5" ry="3" fill="#d8c8b4"/>`).join('');
  return `${sombra(58,13)}
   ${f>=2?`<g transform="translate(44,-2)"><path d="M-12 0 V-26 H22 V0 Z" fill="#efe4d4" ${S}/><path d="M-18 -24 Q5 -52 28 -24 Z" fill="#e8c27a" ${S}/><rect x="0" y="-18" width="9" height="9" rx="2" fill="${jan(n)}" ${S}/></g>`:''}
   <path d="M-36 0 V-40 Q0 -46 36 -40 V0 Z" fill="#ebe0cf" ${S}/>${pedras}
   <path d="M-8 0 V-18 A8 8 0 0 1 8 -18 V0 Z" fill="#a37a55" ${S}/>
   <circle cx="-20" cy="-22" r="7" fill="${jan(n)}" ${S}/><path d="M-20 -29 v14 M-27 -22 h14" stroke="${INK}" stroke-width="1.2"/>
   <rect x="16" y="-28" width="12" height="11" rx="2" fill="${jan(n)}" ${S}/>
   <rect x="8" y="-92" width="13" height="34" rx="2" fill="#d4c6b2" ${S}/>
   <path d="M-46 -34 C-40 -80 40 -84 46 -34 C30 -40 -30 -40 -46 -34 Z" fill="#e8c27a" ${S}/>
   <path d="M-34 -46 C-24 -66 20 -70 32 -48 M-22 -60 C-8 -74 12 -74 22 -62" stroke="#c9a053" stroke-width="2" fill="none"/>
   ${f>=1?`<g transform="translate(-30,2)"><rect x="-6" y="-8" width="12" height="8" rx="2" fill="#c99a6b" ${S}/><circle cx="-2" cy="-11" r="3" fill="#e3798a"/><circle cx="3" cy="-12" r="3" fill="#f2c14e"/></g><g transform="translate(30,2)"><rect x="-6" y="-8" width="12" height="8" rx="2" fill="#c99a6b" ${S}/><circle cx="-2" cy="-11" r="3" fill="#fff"/><circle cx="3" cy="-12" r="3" fill="#e3798a"/></g>`:''}
   <g transform="translate(-58,10)"><path d="M-14 -14 C-15 -2 -10 2 0 2 C10 2 15 -2 14 -14 Z" fill="#4a4545" ${S}/><ellipse cx="0" cy="-14" rx="14" ry="4" fill="#f4a35c" ${S}/><path d="M-8 2 l-3 4 M8 2 l3 4" stroke="${INK}" stroke-width="2.4"/></g>`;
}
function bFeira(f,n){ // barraca de feira com toldo listrado
  let toldo=''; for(let i=0;i<7;i++) toldo+=`<path d="M${-42+i*12} -54 L${-30+i*12} -54 L${-28+i*12} -36 L${-44+i*12} -36 Z" fill="${i%2?'#fbf3e3':'#e9b24f'}"/>`;
  let fest=''; for(let i=0;i<7;i++) fest+=`<path d="M${-42+i*12} -36 q6 7 12 0" fill="${i%2?'#fbf3e3':'#e9b24f'}" ${S}/>`;
  return `${sombra(58,13)}
   ${f>=2?`<g transform="translate(0,-30)"><path d="M-30 0 V-36 H30 V0" fill="#f0e2c6" ${S}/><path d="M-38 -34 L0 -62 L38 -34 Z" fill="#c25a6c" ${S}/><rect x="-6" y="-26" width="12" height="12" rx="2" fill="${jan(n)}" ${S}/><rect x="14" y="-74" width="9" height="20" fill="#d9b48a" ${S}/></g>`:''}
   <path d="M-40 -36 V2 M40 -36 V2" stroke="#a07a55" stroke-width="4"/>
   <rect x="-40" y="-22" width="80" height="22" rx="3" fill="#c99a6b" ${S}/><path d="M-40 -12 H40" stroke="#a37a55" stroke-width="2"/>
   <path d="M-44 -54 H40 L44 -36 H-46 Z" fill="#e9b24f" ${S}/>${toldo}${fest}
   <path d="M-44 -54 H40 L44 -36 H-46 Z" fill="none" ${S}/>
   <g transform="translate(-24,-24)"><rect x="-10" y="-8" width="20" height="9" rx="2" fill="#a37a55" ${S}/><path d="M-6 -8 l3 -9 M0 -8 l1 -10 M6 -8 l-1 -9" stroke="#f4a35c" stroke-width="4.4" stroke-linecap="round"/></g>
   <g transform="translate(24,-24)"><rect x="-10" y="-8" width="20" height="9" rx="2" fill="#a37a55" ${S}/><circle cx="-5" cy="-11" r="4" fill="#e3606e" ${S}/><circle cx="4" cy="-11" r="4" fill="#86a86b" ${S}/></g>
   ${f>=1?`<g transform="translate(-54,2)"><rect x="-10" y="-14" width="20" height="14" rx="2" fill="#c99a6b" ${S}/><path d="M-6 -14 l2 -8 M2 -14 l1 -9" stroke="#f4a35c" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(54,0)"><path d="M0 0 V-34" stroke="#a07a55" stroke-width="3"/><rect x="-14" y="-46" width="28" height="14" rx="3" fill="#fbf3e3" ${S}/><circle cx="0" cy="-39" r="4" fill="#f4a35c"/></g>`:''}`;
}
function bEstufa(f,n){ // estufa de vidro
  const w=f>=2?44:36;
  let vidros=''; for(let i=-w+10;i<w;i+=12) vidros+=`<path d="M${i} 0 V-34" stroke="#fff" stroke-width="2.4"/>`;
  return `${sombra(w+16,13)}
   <rect x="${-w}" y="-34" width="${w*2}" height="34" fill="#cfe6ef" fill-opacity=".85" ${S}/>
   <g opacity=".9">${[[-w+12,-8],[-6,-12],[w-14,-9],[8,-6]].map(p=>`<path d="M${p[0]} 0 c-6 -10 -2 -16 0 -18 c2 2 6 8 0 18" fill="#86a86b" ${S}/>`).join('')}</g>
   ${vidros}<path d="M${-w} -17 H${w}" stroke="#fff" stroke-width="2"/>
   <path d="M${-w} -34 C${-w} -70 ${w} -70 ${w} -34 Z" fill="#dff0f5" fill-opacity=".9" ${S}/>
   <path d="M${-w+14} -36 C${-w+16} -58 -4 -64 -4 -64 M${w-14} -36 C${w-16} -58 4 -64 4 -64 M0 -66 V-34" stroke="#fff" stroke-width="2.4" fill="none"/>
   <path d="M${-w} -34 C${-w} -70 ${w} -70 ${w} -34" fill="none" ${S}/>
   <path d="M-7 0 V-22 H7 V0" fill="#a37a55" ${S}/>
   <g transform="translate(${-w-14},4)"><rect x="-4" y="-14" width="8" height="14" rx="4" fill="#fbf3e3" ${S}/><path d="M-14 -12 C-14 -28 14 -28 14 -12 Z" fill="#e3606e" ${S}/><circle cx="-5" cy="-19" r="2.2" fill="#fff"/><circle cx="5" cy="-21" r="1.8" fill="#fff"/></g>
   ${f>=1?`<g transform="translate(${w+14},2)"><path d="M-9 0 V-16 H9 V0 Z" fill="#86afcf" ${S}/><ellipse cx="0" cy="-16" rx="9" ry="3" fill="#a9c7de" ${S}/></g>`:''}
   ${f>=2?`<g transform="translate(${w+10},-30)"><path d="M0 30 V-4 M-12 6 H12" stroke="#a07a55" stroke-width="3"/><circle cx="0" cy="-8" r="6" fill="#e8c27a" ${S}/><path d="M-10 -12 h20" stroke="#c9a053" stroke-width="3"/></g>`:''}`;
}
function bSerraria(f,n){ // cabana de toras
  let toras=''; for(let y=-6;y>-46;y-=8) toras+=`<rect x="-36" y="${y-7}" width="72" height="8" rx="4" fill="#c99a6b" ${S}/><circle cx="-36" cy="${y-3}" r="4" fill="#e8d3a8" ${S}/><circle cx="36" cy="${y-3}" r="4" fill="#e8d3a8" ${S}/>`;
  return `${sombra(60,13)}
   ${toras}
   <path d="M-8 0 V-26 H8 V0 Z" fill="#8a6a4e" ${S}/>
   <rect x="-28" y="-34" width="12" height="11" rx="2" fill="${jan(n)}" ${S}/><rect x="16" y="-34" width="12" height="11" rx="2" fill="${jan(n)}" ${S}/>
   <rect x="16" y="-98" width="12" height="36" rx="2" fill="#bdb3a6" ${S}/>
   <path d="M-46 -46 L0 -84 L46 -46 Z" fill="#9b4a58" ${S}/><path d="M-30 -52 L0 -76 M-14 -50 L4 -64" stroke="#b9606f" stroke-width="2.6" stroke-linecap="round"/>
   ${f>=1?`<g transform="translate(54,4)"><rect x="-14" y="-8" width="28" height="8" rx="4" fill="#b98a5e" ${S}/><rect x="-11" y="-16" width="24" height="8" rx="4" fill="#c99a6b" ${S}/><rect x="-6" y="-24" width="16" height="8" rx="4" fill="#b98a5e" ${S}/></g>`:''}
   ${f>=2?`<g transform="translate(-2,-84)"><path d="M0 0 V-16" stroke="${INK}" stroke-width="2"/><path d="M0 -16 L14 -12 L0 -8 Z" fill="#86a86b" ${S}/></g><g transform="translate(-60,2)"><path d="M-12 0 L-4 -16 M12 0 L4 -16 M-10 -14 H10" stroke="#a07a55" stroke-width="3"/></g>`:''}
   <g transform="translate(-50,12)"><ellipse cx="0" cy="-4" rx="12" ry="6" fill="#d9b48a" ${S}/><path d="M-12 -4 V3 A12 6 0 0 0 12 3 V-4" fill="#a37a55" ${S}/><ellipse cx="0" cy="-4" rx="6" ry="3" fill="none" stroke="#b98a5e" stroke-width="1.4"/></g>`;
}
function bLago(f,n){ // cabana sobre palafitas na beira do lago
  return `<g transform="translate(-34,18)"><ellipse cx="0" cy="0" rx="62" ry="26" fill="#c7dfe9" ${S}/><ellipse cx="-4" cy="-2" rx="50" ry="19" fill="#9fc6dc"/><path d="M-30 -2 q6 -3 12 0 M4 6 q6 -3 12 0 M-10 -10 q5 -3 10 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
     <circle cx="-34" cy="6" r="5" fill="#86a86b" ${S}/><circle cx="-32" cy="5" r="1.8" fill="#f7c6d0"/><circle cx="22" cy="12" r="4" fill="#86a86b" ${S}/>
     ${f>=2?`<g transform="translate(-12,-4)"><path d="M-14 0 Q0 9 14 0 Z" fill="#c25a6c" ${S}/><path d="M0 0 V-14" stroke="${INK}" stroke-width="1.6"/><path d="M0 -14 L9 -4 H0 Z" fill="#fbf3e3" ${S}/></g>`:''}</g>
   ${sombra(30,8)}
   <path d="M-18 2 V-18 M18 2 V-18 M0 4 V-18" stroke="#8a6a4e" stroke-width="4"/>
   <rect x="-30" y="-24" width="60" height="7" rx="2" fill="#c99a6b" ${S}/>
   <path d="M-24 -24 V-60 H24 V-24 Z" fill="#e7eff2" ${S}/><path d="M-24 -48 H24 M-24 -36 H24" stroke="#c7d6dc" stroke-width="2"/>
   <path d="M-6 -24 V-42 H6 V-24 Z" fill="#86afcf" ${S}/><circle cx="14" cy="-48" r="5" fill="${jan(n)}" ${S}/>
   <path d="M-34 -58 L0 -86 L34 -58 Z" fill="#86afcf" ${S}/><path d="M-20 -62 L0 -78" stroke="#a9c7de" stroke-width="2.6" stroke-linecap="round"/>
   <rect x="10" y="-108" width="10" height="30" rx="2" fill="#bdb3a6" ${S}/>
   <g transform="translate(-44,-18)"><rect x="-24" y="-4" width="30" height="7" fill="#c99a6b" ${S}/><path d="M-18 -4 v7 M-10 -4 v7 M-2 -4 v7" stroke="${INK}" stroke-width="1.2"/><path d="M-22 3 V14 M4 3 V14" stroke="#8a6a4e" stroke-width="3"/></g>
   ${f>=1?`<path d="M24 -56 q8 10 0 20" fill="none" stroke="#c9b18a" stroke-width="1.6" stroke-dasharray="3 2"/><circle cx="30" cy="-30" r="4" fill="#e3606e" ${S}/>`:''}`;
}
function bAcampamento(acesa,f){ // fogueira + barracas
  const pedras=[...Array(9)].map((_,i)=>{ const a=i/9*Math.PI*2; return `<ellipse cx="${(Math.cos(a)*24).toFixed(1)}" cy="${(Math.sin(a)*11).toFixed(1)}" rx="6.5" ry="4.5" fill="#bdb3a6" ${S}/>`; }).join('');
  const tenda=(x,y,c,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M-22 0 L0 -36 L22 0 Z" fill="${c}" ${S}/><path d="M0 -36 L-6 0 H6 Z" fill="${shade(c,-.25)}" ${S}/><path d="M0 -36 V-44" stroke="${INK}" stroke-width="2"/><path d="M0 -44 l8 3 l-8 3" fill="#f2c14e" ${S}/></g>`;
  return `<ellipse cx="0" cy="2" rx="74" ry="30" fill="rgba(70,55,35,.1)"/>
   ${acesa?tenda(-66,-14,'#86afcf',.9)+(f>=1?tenda(64,-12,'#e3798a',.85):'')+(f>=2?tenda(-40,-34,'#e9b24f',.7):''):''}
   ${acesa||f?`<g transform="translate(-36,22)"><rect x="-14" y="-6" width="28" height="9" rx="4.5" fill="#b98a5e" ${S}/></g><g transform="translate(40,20)"><rect x="-14" y="-6" width="28" height="9" rx="4.5" fill="#b98a5e" ${S}/></g>`:''}
   <ellipse cx="0" cy="0" rx="28" ry="13" fill="#8f8378" opacity=".45"/>${pedras}
   <path d="M-13 4 L13 -5 M-13 -5 L13 4" stroke="${acesa?'#8a6a4e':'#7a6d62'}" stroke-width="6" stroke-linecap="round"/>`;
}
function bCoreto(f,n){
  const s=[.9,1,1.1][f];
  return `<g transform="scale(${s})">${sombra(48,14)}<ellipse cx="0" cy="0" rx="40" ry="12" fill="#e8d3a8" ${S}/>
   <path d="M-34 -2 V-44 M34 -2 V-44 M-14 6 V-40 M14 6 V-40" stroke="#fbf3e3" stroke-width="5"/><path d="M-34 -2 V-44 M34 -2 V-44 M-14 6 V-40 M14 6 V-40" stroke="${INK}" stroke-width="1.2" opacity=".6"/>
   ${f>=1?`<path d="M-40 -40 Q-20 -30 0 -38 Q20 -30 40 -40" stroke="${INK}" stroke-width="1" fill="none"/>${[-30,-15,0,15,30].map((x,i)=>`<circle cx="${x}" cy="${-35+Math.abs(x)/8}" r="2.6" fill="${n?'#ffd36b':['#e3798a','#f2c14e','#86afcf','#86a86b','#a07bb7'][i]}"/>`).join('')}`:''}
   <path d="M-46 -42 C-30 -60 30 -60 46 -42 C30 -36 -30 -36 -46 -42 Z" fill="#a07bb7" ${S}/><path d="M-46 -42 L0 -78 L46 -42" fill="#b391c6" ${S}/>
   <circle cx="0" cy="-80" r="4" fill="#f2c14e" ${S}/>
   ${f>=2?`<g transform="translate(-58,4)"><rect x="-8" y="-18" width="16" height="18" rx="3" fill="#6b5440"/><circle cx="0" cy="-12" r="4" fill="#bdb3a6"/><circle cx="0" cy="-4" r="2.4" fill="#bdb3a6"/></g>`:''}</g>`;
}
function bCogumelo(f,n){ // casa-cogumelo + rede
  return `${sombra(64,13)}
   <g transform="translate(-58,6)"><path d="M-22 0 V-30 M22 0 V-30" stroke="#a07a55" stroke-width="4"/><path d="M-22 -26 Q0 -6 22 -26" stroke="#e8c27a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-22 -26 Q0 -6 22 -26" stroke="${INK}" stroke-width="1.4" fill="none" stroke-dasharray="4 3"/></g>
   ${f>=2?`<g transform="translate(46,4) scale(.6)"><path d="M-14 0 V-30 Q0 -34 14 -30 V0 Z" fill="#fbf3e3" ${S}/><path d="M-34 -26 C-34 -62 34 -62 34 -26 Q0 -18 -34 -26 Z" fill="#e9b24f" ${S}/><circle cx="-12" cy="-42" r="4" fill="#fff"/></g>`:''}
   <path d="M-20 0 V-40 Q0 -46 20 -40 V0 Z" fill="#fbf3e3" ${S}/>
   <path d="M-7 0 V-16 A7 7 0 0 1 7 -16 V0 Z" fill="#a37a55" ${S}/>
   <circle cx="10" cy="-28" r="5" fill="${jan(n)}" ${S}/>
   <path d="M-48 -36 C-48 -96 48 -96 48 -36 Q0 -24 -48 -36 Z" fill="#e3606e" ${S}/>
   ${[[-26,-58,7],[4,-74,6],[26,-50,6],[-6,-48,4],[30,-68,4]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="#fff"/>`).join('')}
   <rect x="-12" y="-98" width="9" height="16" rx="2" fill="#d9b48a" ${S}/>
   ${f>=1?`<g transform="translate(32,4)"><rect x="-7" y="-12" width="14" height="4" rx="2" fill="#b98a5e" ${S}/><path d="M-4 -8 v8 M4 -8 v8" stroke="${INK}" stroke-width="2"/><rect x="-4" y="-19" width="8" height="7" rx="2" fill="#fbf3e3" ${S}/></g>`:''}`;
}
const CONSTRUCAO={sopa:bSopa,padaria:bFeira,horta:bEstufa,lenha:bSerraria,pesca:bLago,violao:bCoreto,soneca:bCogumelo};

function placaSVG(){
  return `<ellipse cx="0" cy="3" rx="16" ry="5" fill="rgba(60,50,30,.25)"/><rect x="-3" y="-30" width="6" height="32" rx="2" fill="#a07a55" ${S}/>
   <rect x="-24" y="-48" width="48" height="24" rx="5" fill="#f5efe3" ${S}/><g transform="translate(-18,-46) scale(.7)">${inner(ICON.hammer)}</g><path d="M6 -42 q0 -4 4 -4 q4 0 4 4 q0 3 -4 4 v3 M10 -31 v1" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}
function andaimeSVG(){
  return `<ellipse cx="0" cy="3" rx="44" ry="11" fill="rgba(70,55,35,.18)"/>
   <rect x="-32" y="-30" width="64" height="30" rx="3" fill="#efe2c8" ${S} stroke-dasharray="5 4"/>
   <path d="M-36 0 V-64 M36 0 V-64 M-36 -32 H36 M-36 -60 H36 M-36 -32 L36 -60" stroke="#b98a5e" stroke-width="4" stroke-linecap="round"/>
   <path d="M-26 -8 h16 M-28 -16 h18" stroke="#c99a6b" stroke-width="5" stroke-linecap="round"/>`;
}
function decorSVG(id,n){
  switch(id){
    case 'lampiao': return `<ellipse cx="0" cy="2" rx="8" ry="3" fill="rgba(60,50,30,.25)"/><path d="M0 0 V-40" stroke="#5c5550" stroke-width="3"/><path d="M-7 -40 h14 l-3 -12 h-8 Z" fill="${n?'#ffd36b':'#f2e6bf'}" ${S}/><path d="M-8 -52 h16 l-8 -6 Z" fill="#5c5550"/>`;
    case 'banco': return `<rect x="-18" y="-14" width="36" height="5" rx="2" fill="#b98a5e" ${S}/><rect x="-18" y="-8" width="36" height="5" rx="2" fill="#c99a6b" ${S}/><path d="M-14 -3 v5 M14 -3 v5" stroke="${INK}" stroke-width="2.4"/>`;
    case 'flores': return `<ellipse cx="0" cy="0" rx="20" ry="8" fill="#a37a55" ${S}/>${[[-10,-4,'#e3798a'],[0,-6,'#f2c14e'],[10,-3,'#fff'],[-4,0,'#a07bb7'],[6,1,'#e3798a']].map(f=>`<path d="M${f[0]} ${f[1]} v-6" stroke="#5f824b" stroke-width="1.6"/><circle cx="${f[0]}" cy="${f[1]-7}" r="3.2" fill="${f[2]}" stroke="${INK}" stroke-width="1.2"/>`).join('')}`;
    case 'correio': return `<path d="M0 0 V-22" stroke="#a07a55" stroke-width="4"/><path d="M-10 -22 V-34 A10 8 0 0 1 10 -34 V-22 Z" fill="#e3798a" ${S}/><path d="M10 -34 v-8 h7 v4 h-7" fill="#f2c14e" ${S}/>`;
    case 'poco': return `<ellipse cx="0" cy="-4" rx="16" ry="7" fill="#bdb3a6" ${S}/><path d="M-16 -4 V6 A16 7 0 0 0 16 6 V-4" fill="#d4cabd" ${S}/><ellipse cx="0" cy="-4" rx="11" ry="4" fill="#86afcf"/><path d="M-14 -4 V-30 M14 -4 V-30" stroke="#a07a55" stroke-width="3"/><path d="M-20 -28 L0 -40 L20 -28 Z" fill="#c25a6c" ${S}/>`;
    case 'varal': return `<path d="M-30 0 V-34 M30 0 V-34" stroke="#a07a55" stroke-width="3"/><path d="M-30 -32 Q0 -22 30 -32" stroke="${INK}" stroke-width="1.4" fill="none"/>${[-22,-12,-2,8,18].map((x,i)=>`<path d="M${x} ${-29+Math.abs(x)/6} l4 8 l4 -8 Z" fill="${['#e3798a','#f2c14e','#86afcf','#86a86b','#a07bb7'][i]}" stroke="${INK}" stroke-width="1"/>`).join('')}`;
    case 'cerejeira': return arvoreSVG(0,0).replace('fill="#8fb874"','fill="#f6c3cf"').replace('stroke="#6f9a58"','stroke="#e3909f"').replace('fill="#6f9a58"','fill="#e3909f"');
    case 'balanco': return `<path d="M-18 0 L-12 -44 L12 -44 L18 0" fill="none" stroke="#a07a55" stroke-width="3.5" stroke-linejoin="round"/><path d="M-6 -44 V-14 M6 -44 V-14" stroke="${INK}" stroke-width="1.4"/><rect x="-9" y="-15" width="18" height="4" rx="2" fill="#e3798a" stroke="${INK}" stroke-width="1.4"/>`;
    case 'cogumelos': return `<g transform="translate(-8,0)"><rect x="-4" y="-16" width="8" height="16" rx="4" fill="#fbf3e3" ${S}/><path d="M-16 -14 C-16 -32 16 -32 16 -14 Z" fill="#e3606e" ${S}/><circle cx="-6" cy="-22" r="2.4" fill="#fff"/><circle cx="5" cy="-24" r="2" fill="#fff"/></g><g transform="translate(14,2) scale(.6)"><rect x="-4" y="-16" width="8" height="16" rx="4" fill="#fbf3e3" ${S}/><path d="M-16 -14 C-16 -32 16 -32 16 -14 Z" fill="#e9b24f" ${S}/></g>`;
    case 'fonte': return `<ellipse cx="0" cy="0" rx="24" ry="10" fill="#d4cabd" ${S}/><ellipse cx="0" cy="-1" rx="19" ry="7" fill="#9fc6dc"/><path d="M0 -2 V-20" stroke="#bdb3a6" stroke-width="5"/><ellipse cx="0" cy="-20" rx="8" ry="3" fill="#d4cabd" stroke="${INK}" stroke-width="1.6"/><path d="M0 -22 C-6 -32 -10 -24 -12 -14 M0 -22 C6 -32 10 -24 12 -14" stroke="#9fc6dc" stroke-width="2.2" fill="none"/>`;
    case 'cerca': return `<path d="M-30 -2 H30 M-30 -12 H30" stroke="#d9b48a" stroke-width="3.5"/>${[-28,-14,0,14,28].map(x=>`<path d="M${x} 2 V-18 l-3 -3 l3 -3 l3 3 l-3 3" fill="#fbf3e3" stroke="${INK}" stroke-width="1.6"/>`).join('')}${[-21,7,21].map(x=>`<circle cx="${x}" cy="-14" r="3" fill="#e3798a" stroke="${INK}" stroke-width="1"/>`).join('')}`;
    case 'placa': return `<path d="M0 0 V-30" stroke="#a07a55" stroke-width="4"/><rect x="-30" y="-46" width="60" height="20" rx="5" fill="#f5efe3" ${S}/><path d="M-18 -36 h36" stroke="#e3798a" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4"/>`;
  }
  return '';
}
function casteloSVG(st,n,html){
  const pedra='#e4dccf', pedraEsc='#cfc4b4';
  let g=`<ellipse cx="0" cy="8" rx="132" ry="58" fill="#c9b18a" ${S}/><ellipse cx="0" cy="0" rx="132" ry="56" fill="#b7cf93" stroke="#6b8f52" stroke-width="2.4"/>`;
  if(st>=3){
    g+=`<path d="M-110 10 C-116 0 -100 -6 -92 -2 C-86 -10 -70 -6 -72 4 Z M110 10 C116 0 100 -6 92 -2 C86 -10 70 -6 72 4 Z" fill="#7fa863" ${S}/>`;
    [[-100,-2,'#e3798a'],[-84,4,'#fff'],[90,0,'#f2c14e'],[104,4,'#e3798a'],[-60,24,'#a07bb7'],[60,26,'#e3798a'],[-40,30,'#fff'],[42,32,'#f2c14e']].forEach(f=>g+=`<circle cx="${f[0]}" cy="${f[1]}" r="3.6" fill="${f[2]}" stroke="${INK}" stroke-width="1.2"/>`);
  }
  if(st<2){
    g+=`<path d="M-80 0 V-26 L-70 -32 L-62 -22 L-56 -30 V0 Z" fill="${pedra}" ${S}/>
     <path d="M-36 -10 V-64 L-24 -74 L-14 -60 L-4 -70 L6 -52 L14 -66 L30 -58 V-10 Z" fill="${pedra}" ${S}/>
     <path d="M-10 -10 V-34 A10 10 0 0 1 10 -34 V-10" fill="#8f8378" ${S}/>
     <path d="M56 0 V-20 L64 -28 L74 -18 V0 Z" fill="${pedra}" ${S}/>
     <ellipse cx="-20" cy="10" rx="8" ry="4" fill="${pedraEsc}" ${S}/><ellipse cx="40" cy="14" rx="6" ry="3" fill="${pedraEsc}" ${S}/>
     <path d="M-30 -40 q6 -2 8 4 M16 -48 q5 0 6 5" stroke="#86a86b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    const w=jan(n&&st>=5);
    if(st>=4) [-78,78].forEach(x=>{ g+=`<rect x="${x-16}" y="-96" width="32" height="96" rx="3" fill="${pedra}" ${S}/><rect x="${x-5}" y="-74" width="10" height="14" rx="5" fill="${w}" ${S}/><path d="M${x-22} -94 L${x} -136 L${x+22} -94 Z" fill="#e3798a" ${S}/><path d="M${x} -136 V-154" stroke="${INK}" stroke-width="2"/><path d="M${x} -154 L${x+16} -149 L${x} -144 Z" fill="#f2c14e" ${S}/>`; });
    g+=`<rect x="-58" y="-40" width="116" height="40" fill="${pedra}" ${S}/>${[...Array(8)].map((_,i)=>`<rect x="${-56+i*14}" y="-48" width="8" height="8" fill="${pedra}" ${S}/>`).join('')}
      <rect x="-34" y="-104" width="68" height="64" fill="${pedra}" ${S}/>${[...Array(5)].map((_,i)=>`<rect x="${-33+i*14}" y="-112" width="8" height="8" fill="${pedra}" ${S}/>`).join('')}
      <rect x="-24" y="-88" width="12" height="16" rx="6" fill="${w}" ${S}/><rect x="12" y="-88" width="12" height="16" rx="6" fill="${w}" ${S}/>
      <path d="M-16 0 V-26 A16 16 0 0 1 16 -26 V0 Z" fill="#b98a5e" ${S}/><path d="M0 -42 V0 M-16 -18 H16" stroke="${INK}" stroke-width="1.4"/>`;
    if(st>=5) g+=`<path d="M-30 -104 L0 -146 L30 -104 Z" fill="#e3798a" ${S}/><path d="M0 -146 V-170" stroke="${INK}" stroke-width="2"/><path d="M0 -170 L22 -163 L0 -156 Z" fill="#e3798a" ${S}/><path d="M-20 -40 v26 l6 -4 l6 4 v-26 M8 -40 v26 l6 -4 l6 4 v-26" fill="#e3798a" stroke="${INK}" stroke-width="1.4"/>`;
  }
  if(html && st<3){ const op=[.85,.55,.3][st]; g+=`<g opacity="${op}">${[[-90,-30,70,26],[40,-60,80,28],[-20,-10,110,30],[90,10,60,22],[-60,20,70,20]].map(f=>`<ellipse cx="${f[0]}" cy="${f[1]}" rx="${f[2]}" ry="${f[3]}" fill="#fbf7ef" opacity=".7"/>`).join('')}</g>`; }
  return g;
}

/* ------------------------------------------------------------------
   CACHE DE SPRITES (SVG → bitmap, uma vez só)
------------------------------------------------------------------ */
let RES=2;                      // pixels por unidade do mundo no sprite
const SPR=new Map();
function sprite(key,box,build){
  let s=SPR.get(key); if(s) return s.ok?s:null;
  const [x,y,w,h]=box;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${Math.ceil(w*RES)}" height="${Math.ceil(h*RES)}">${build()}</svg>`;
  const img=new Image();
  s={img,x,y,w,h,ok:false}; SPR.set(key,s);
  img.onload=()=>{ s.ok=true; precisaDesenhar=true; };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  return null;
}
function desenharSprite(ctx,s,x,y,sx,sy){
  if(!s) return;
  if(sx==null){ ctx.drawImage(s.img,x+s.x,y+s.y,s.w,s.h); return; }
  ctx.save(); ctx.translate(x,y); ctx.scale(sx,sy); ctx.drawImage(s.img,s.x,s.y,s.w,s.h); ctx.restore();
}
const BOX={tree:[-40,-84,80,94],cat:[-28,-62,56,68],catLie:[-34,-34,66,40],bld:[-104,-126,200,160],camp:[-96,-60,192,100],castle:[-150,-200,300,270],decor:[-40,-70,80,80],sign:[-30,-54,60,62],scaf:[-50,-72,100,82]};
function sprArvore(t){ return sprite('t'+t.tipo+t.cor,BOX.tree,()=>arvoreSVG(t.tipo,t.cor)); }
function sprGato(o,fech){ const k='c'+o.cor+o.det+(o.listras?1:0)+(o.chapeu?1:0)+(o.chapeuVerde?1:0)+(o.xadrez?1:0)+(o.coroa?1:0)+(o.capacete?1:0)+(fech?'z':''); return sprite(k,BOX.cat,()=>gatoSVG(o,1,fech)); }
function sprDeitado(o){ return sprite('L'+o.cor,BOX.catLie,()=>gatoDeitadoSVG(o)); }
function sprConstrucao(id,f,n){ return sprite(`b${id}${f}${n?'n':''}`,BOX.bld,()=>CONSTRUCAO[id](f,n)); }
function sprAcamp(acesa,f){ return sprite(`camp${acesa?1:0}${f}`,BOX.camp,()=>bAcampamento(acesa,f)); }
function sprCastelo(st,n){ return sprite(`cas${st}${n?'n':''}`,BOX.castle,()=>casteloSVG(st,n)); }
function sprDecor(id,n){ return sprite(`d${id}${n&&id==='lampiao'?'n':''}`,BOX.decor,()=>decorSVG(id,n)); }

/* sprites feitos direto no canvas (brilho, névoa) */
function blob(cor,r){ const c=document.createElement('canvas'); c.width=c.height=r*2; const x=c.getContext('2d'); const g=x.createRadialGradient(r,r,0,r,r,r); g.addColorStop(0,cor); g.addColorStop(1,cor.replace(/[\d.]+\)$/,'0)')); x.fillStyle=g; x.fillRect(0,0,r*2,r*2); return c; }
let GLOW=null, NEVOA=null;

/* ------------------------------------------------------------------
   MUNDO
------------------------------------------------------------------ */
let root=null, cv=null, ctx=null, DPR=1, W=0, H=0, precisaDesenhar=true;
const trees=[]; let ents=[]; const cats=[]; let visitante=null;
const view={s:1,tx:0,ty:0};
let chao=null, chaoR=-1, chaoChave='';

function montarDOM(){
  if(root) return;
  root=$('cozy-wrap');
  root.innerHTML=`
   <div id="vl-view"><canvas id="vl-cv"></canvas><div class="vl-fx" id="vl-fx"></div></div>
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
  cv=$('vl-cv'); ctx=cv.getContext('2d',{alpha:false});
  GLOW=blob('rgba(255,214,120,.85)',64); NEVOA=blob('rgba(251,247,239,.9)',64);
  gerarArvores();
  ligarPanZoom();
  window.addEventListener('resize',()=>{ if(csAberto){ redimensionar(); } });
}
function redimensionar(){
  const v=$('vl-view'); W=v.clientWidth; H=v.clientHeight;
  DPR=Math.min(window.devicePixelRatio||1, qualidade<1?1.25:2);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px';
  const novoRES=Math.min(3,Math.max(1.5,DPR*1.25));
  if(Math.abs(novoRES-RES)>.2){ RES=novoRES; SPR.clear(); }
  chaoChave=''; aplicarView(); precisaDesenhar=true;
}
function gerarArvores(){
  const r=seeded(20251102);
  for(let gy=-160;gy<=1160;gy+=44){
    for(let gx=-200;gx<=1200;gx+=46){
      const x=gx+(r()-.5)*34+(Math.floor(gy/44)%2?23:0), y=gy+(r()-.5)*26;
      const d=dEl(x,y); if(d<165) continue;
      trees.push({x,y,d,tipo:r()<.28?1:r()<.12?2:0,cor:Math.floor(r()*5),s:.85+r()*.45,fase:r()*6.28,a:1,h:false,arvore:1});
    }
  }
}
function ocultaPorOutros(t){
  if(Math.hypot(t.x-CASTELO_POS.x,(t.y-CASTELO_POS.y)/K*.95)<150) return true;
  if(vila.castelo>=1 && Math.abs(t.x-CX)<40 && t.y>CASTELO_POS.y && t.y<CY) return true;
  const p=proximaEstacao(); if(p && Math.hypot(t.x-p.x,(t.y-p.y)/K)<58) return true;
  return false;
}
function arvoreEscondida(t){
  if(t.d<R+20) return true;
  if(Math.hypot(t.x-CASTELO_POS.x,(t.y-CASTELO_POS.y)/K*.95)<150) return true;
  if(vila.castelo>=1 && Math.abs(t.x-CX)<40 && t.y>CASTELO_POS.y && t.y<CY) return true;
  const p=proximaEstacao(); if(p && Math.hypot(t.x-p.x,(t.y-p.y)/K)<58) return true;
  return false;
}
function atualizarArvores(){ const lim=Math.max(R,Ralvo)+55; trees.forEach(t=>{ t.h=arvoreEscondida(t); t.dyn=t.d<lim && !ocultaPorOutros(t); }); }

/* floresta pré-desenhada em duas camadas (atrás e na frente da vila) */
let camT=null, camF=null, camKey='';
const CAM={x0:-230,x1:1230,tY0:-190,tY1:CY+12,fY0:CY-112,fY1:1185};
function refazerCamadas(){
  const k=[Math.round(Math.max(R,Ralvo)),vila.castelo,NOITE>.5?1:0,(proximaEstacao()||{}).id,RES].join('|');
  if(k===camKey) return; 
  const FR=Math.min(1.5,RES);
  const mk=(cv,y0,y1)=>{ cv=cv||document.createElement('canvas'); cv.width=Math.ceil((CAM.x1-CAM.x0)*FR); cv.height=Math.ceil((y1-y0)*FR); cv.y0=y0; cv.hh=y1-y0; const c=cv.getContext('2d'); c.setTransform(FR,0,0,FR,-CAM.x0*FR,-y0*FR); c.clearRect(CAM.x0,y0,CAM.x1-CAM.x0,y1-y0); cv.c=c; return cv; };
  camT=mk(camT,CAM.tY0,CAM.tY1); camF=mk(camF,CAM.fY0,CAM.fY1);
  let faltou=false;
  const itens=trees.filter(t=>!t.dyn&&!t.h).map(t=>({t,y:t.y}));
  itens.push({castelo:1,y:CASTELO_POS.y-60});
  itens.sort((a,b)=>a.y-b.y);
  for(const it of itens){
    if(it.castelo){ const sp=sprCastelo(vila.castelo,NOITE>.5); if(!sp){ faltou=true; continue; } camT.c.drawImage(sp.img,CASTELO_POS.x+sp.x,CASTELO_POS.y+sp.y,sp.w,sp.h); continue; }
    const t=it.t, sp=sprArvore(t); if(!sp){ faltou=true; continue; }
    const c=t.y<CY?camT.c:camF.c;
    c.save(); c.translate(t.x,t.y); c.scale(t.s,t.s); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore();
  }
  camKey=faltou?'':k;
}

/* chão da ilha: pré-renderizado num canvas próprio (refeito só quando muda) */
function chaveChao(){ return Math.round(R)+'|'+ESTACOES.map(e=>estAberta(e.id)?1:0).join('')+'|'+vila.castelo; }
function refazerChao(){
  const ch=chaveChao(); if(ch===chaoChave&&chao) return; chaoChave=ch;
  const pad=30, rx=R+pad, ry=R*K+pad+20, GR=Math.min(2.2,RES);
  if(!chao) chao=document.createElement('canvas');
  chao.width=Math.ceil(rx*2*GR); chao.height=Math.ceil(ry*2*GR); chao.ox=CX-rx; chao.oy=CY-ry; chao.ww=rx*2; chao.hh=ry*2;
  const c=chao.getContext('2d'); c.setTransform(GR,0,0,GR,-chao.ox*GR,-chao.oy*GR);
  c.clearRect(chao.ox,chao.oy,chao.ww,chao.hh);
  c.lineWidth=2.6; c.strokeStyle=INK;
  c.beginPath(); c.ellipse(CX,CY+14,R,R*K,0,0,Math.PI*2); c.fillStyle='#d6b48a'; c.fill(); c.stroke();
  const g=c.createRadialGradient(CX,CY-R*K*.2,10,CX,CY,R); g.addColorStop(0,'#cfe0a8'); g.addColorStop(.75,'#bdd496'); g.addColorStop(1,'#a9c784');
  c.beginPath(); c.ellipse(CX,CY,R,R*K,0,0,Math.PI*2); c.fillStyle=g; c.fill(); c.strokeStyle='#6b8f52'; c.lineWidth=3; c.stroke();
  // tufinhos e florzinhas
  const r=seeded(77); c.lineCap='round';
  for(let i=0;i<Math.round(R*1.1);i++){
    const a=r()*6.283, d=Math.sqrt(r())*(R-14), x=CX+Math.cos(a)*d, y=CY+Math.sin(a)*d*K;
    if(r()<.82){ c.strokeStyle='#9fbd7c'; c.lineWidth=1.6; c.beginPath(); c.moveTo(x-2,y); c.lineTo(x,y-5); c.lineTo(x+2,y); c.stroke(); }
    else { c.fillStyle=['#f7f0d8','#f7c6d0','#fff'][Math.floor(r()*3)]; c.beginPath(); c.arc(x,y,1.6,0,6.283); c.fill(); }
  }
  // praça
  c.beginPath(); c.ellipse(CX,CY+4,72,40,0,0,Math.PI*2); c.fillStyle='#ead6ad'; c.fill(); c.strokeStyle='#d4b98a'; c.lineWidth=3; c.stroke();
  // caminhos
  ESTACOES.forEach(e=>{
    if(!estAberta(e.id)||e.id==='fogueira') return;
    const mx=(CX+e.x)/2+(e.y-CY)*.25, my=(CY+e.y)/2-(e.x-CX)*.12;
    [['#d4b98a',22],['#ead6ad',16]].forEach(([cor,lw])=>{ c.strokeStyle=cor; c.lineWidth=lw; c.beginPath(); c.moveTo(CX,CY+4); c.quadraticCurveTo(mx,my,e.x,e.y+6); c.stroke(); });
    c.fillStyle='#d9c294'; for(let k=0;k<4;k++){ const t=.25+k*.18, px=(1-t)*(1-t)*CX+2*(1-t)*t*mx+t*t*e.x, py=(1-t)*(1-t)*(CY+4)+2*(1-t)*t*my+t*t*(e.y+6); c.beginPath(); c.ellipse(px,py,3,1.8,0,0,6.283); c.fill(); }
  });
}

/* entidades fixas (construções, enfeites, castelo) — refeitas quando o estado muda */
function montarMundo(){
  if(!cv) return;
  Ralvo=raioAlvo(); if(!R) R=Ralvo;
  ents=[];
  ents.push({tipo:'castelo',x:CASTELO_POS.x,y:CASTELO_POS.y-60,ax:CASTELO_POS.x,ay:CASTELO_POS.y,act:'castelo',box:[-130,-170,260,220]});
  if(obras.castelo) ents.push({tipo:'obra',x:CASTELO_POS.x,y:CASTELO_POS.y+40,ax:CASTELO_POS.x,ay:CASTELO_POS.y+40,box:BOX.scaf});
  if(vila.castelo>=1) ents.push({tipo:'rainha',x:CASTELO_POS.x+34,y:CASTELO_POS.y+28,ax:CASTELO_POS.x+34,ay:CASTELO_POS.y+28,act:'rainha',box:[-20,-62,40,64]});
  const prox=proximaEstacao();
  ESTACOES.forEach(e=>{
    const aberta=estAberta(e.id);
    if(e.id==='fogueira'){
      ents.push({tipo:'camp',id:e.id,x:e.x,y:e.y,ax:e.x,ay:e.y,act:aberta?'est:fogueira':(e===prox?'abrir:fogueira':'praca'),box:[-80,-50,160,80]});
      if(!aberta && e===prox && !obras.fogueira) ents.push({tipo:'placa',x:e.x+44,y:e.y-4,ax:e.x+44,ay:e.y-4,act:'abrir:fogueira',box:BOX.sign});
      if(obras.fogueira) ents.push({tipo:'obra',x:e.x,y:e.y,ax:e.x,ay:e.y,box:BOX.scaf});
    } else if(!aberta){
      if(e!==prox) return;
      if(obras[e.id]) ents.push({tipo:'obra',x:e.x,y:e.y,ax:e.x,ay:e.y,box:BOX.scaf});
      else ents.push({tipo:'placa',x:e.x,y:e.y,ax:e.x,ay:e.y,act:'abrir:'+e.id,box:BOX.sign});
    } else ents.push({tipo:'bld',id:e.id,x:e.x,y:e.y,ax:e.x,ay:e.y,act:'est:'+e.id,box:[-70,-110,140,130],pop:0});
  });
  DECORS.forEach((d,i)=>{ if(i<vila.decor && d.d<R-10) ents.push({tipo:'decor',id:d.id,x:d.x,y:d.y,ax:d.x,ay:d.y,box:BOX.decor}); });
  // gatinhos: mantém posições dos que já existem
  const antigos=new Map(cats.map(c=>[c.chave,c]));
  cats.length=0;
  ESTACOES.forEach(e=>{ if(estAberta(e.id)){ const k='e'+e.id; const casa={x:e.x+e.work.dx,y:e.y+e.work.dy}; cats.push(antigos.get(k)||novoGato(k,{...e.gato,estacao:e.id,casa,falas:e.falas,acao:e.work.acao,pers:e.pers})); } });
  vila.adotados.forEach((a,i)=>{ const k='a'+i+a.nome; const c=CORES_GATOS[a.c]; cats.push(antigos.get(k)||novoGato(k,{nome:a.nome,cor:c[0],det:c[1],listras:c[2],falas:JEITOS[a.j||0].falas,pers:JEITOS[a.j||0].p})); });
  if(visitante) cats.push(visitante);
  atualizarArvores();
  precisaDesenhar=true;
}
function novoGato(chave,o){
  const p=o.casa?{...o.casa}:pontoLivre();
  return {chave,o,x:p.x,y:p.y,alvo:null,espera:o.casa?8+Math.random()*20:1+Math.random()*4,dir:1,estado:o.casa?'work':'idle',fase:Math.random()*6.28,pulo:0,blink:3+Math.random()*4,fala:null};
}
function pontoLivre(){
  for(let i=0;i<30;i++){ const a=Math.random()*6.283, r=Math.sqrt(Math.random())*(R-40); const x=CX+Math.cos(a)*r, y=CY+Math.sin(a)*r*K; if(dEl(x,y)<R-34) return {x,y}; }
  return {x:CX,y:CY+30};
}
function moverGatos(dt){
  cats.forEach(c=>{
    c.fase+=dt; if(c.pulo>0) c.pulo=Math.max(0,c.pulo-dt*2.2);
    c.blink-=dt; if(c.blink<-.14) c.blink=2.5+Math.random()*4;
    if(c.fala){ c.fala.t-=dt; if(c.fala.t<=0) c.fala=null; }
    if(c.alvo){
      const dx=c.alvo.x-c.x, dy=c.alvo.y-c.y, dist=Math.hypot(dx,dy), v=(c.vel||24)*dt;
      if(dist<=v){ c.x=c.alvo.x; c.y=c.alvo.y; c.alvo=null;
        if(c.o.casa && Math.hypot(c.x-c.o.casa.x,c.y-c.o.casa.y)<2){ c.estado='work'; c.espera=15+Math.random()*25; c.dir=1; }
        else { c.estado='idle'; c.espera=c.o.visit?999:2+Math.random()*5; }
      } else { c.x+=dx/dist*v; c.y+=dy/dist*v; c.dir=dx<0?-1:1; }
    } else if(!c.o.visit){
      c.espera-=dt;
      if(c.espera<=0){
        c.alvo=c.o.casa?(c.estado==='work'?(Math.random()<.5?{x:CX+(Math.random()-.5)*100,y:CY+18+(Math.random()-.5)*34}:pontoLivre()):{...c.o.casa}):pontoLivre();
        c.estado='walk';
      }
    }
  });
}

/* ------------------------------------------------------------------
   DESENHO DO QUADRO
------------------------------------------------------------------ */
let tempo=0;
const flutuantes=[]; const fumacas=[]; const parts=[];
function ftxt(x,y,txt,cls){ flutuantes.push({x,y,txt,cor:cls==='h'?'#c25a6c':'#a0711f',t:0}); }
function noite(){ const d=new Date(), h=d.getHours()+d.getMinutes()/60; return h<6||h>=19?1:h<7?1-(h-6):h>=18?h-18:0; }
let NOITE=0;

function desenhar(){
  const c=ctx, s=view.s;
  const n=NOITE>.5;
  c.setTransform(DPR,0,0,DPR,0,0);
  c.fillStyle='#7c9a63'; c.fillRect(0,0,W,H);
  c.setTransform(DPR*s,0,0,DPR*s,DPR*view.tx,DPR*view.ty);
  // área visível no mundo (pra culling)
  const vx0=-view.tx/s-90, vy0=-view.ty/s-120, vx1=vx0+W/s+180, vy1=vy0+H/s+240;
  // chão
  refazerChao();
  c.drawImage(chao,chao.ox,chao.oy,chao.ww,chao.hh);
  refazerCamadas();
  c.drawImage(camT,CAM.x0,camT.y0,CAM.x1-CAM.x0,camT.hh);
  // ponte
  if(vila.castelo>=1){ const y0=CASTELO_POS.y+44, y1=CY-R*K+8; if(y1>y0){ c.fillStyle='rgba(163,122,85,.35)'; c.fillRect(CX-26,y0,52,y1-y0); for(let y=y0;y<y1;y+=9){ c.fillStyle='#c99a6b'; c.fillRect(CX-22,y,44,7); c.strokeStyle=INK; c.lineWidth=1.2; c.strokeRect(CX-22,y,44,7); } } }
  // lista ordenada por profundidade
  const lista=[];
  for(const t of trees){
    if(!t.dyn) continue;
    const alvo=t.h?0:1; if(t.a!==alvo){ t.a+= (alvo-t.a)*.12; if(Math.abs(t.a-alvo)<.02) t.a=alvo; }
    if(t.a<=0.01) continue;
    if(t.x<vx0||t.x>vx1||t.y<vy0||t.y>vy1+60) continue;
    lista.push(t);
  }
  for(const e of ents){ if(e.ax+e.box[0]>vx1||e.ax+e.box[0]+e.box[2]<vx0||e.ay+e.box[1]>vy1||e.ay+e.box[1]+e.box[3]<vy0) continue; lista.push(e); }
  for(const g of cats) lista.push(g);
  lista.sort((a,b)=>a.y-b.y);
  for(const o of lista){
    if(o.arvore){
      const sp=sprArvore(o); if(!sp) continue;
      c.globalAlpha=o.a;
      const ang=Math.sin(tempo*1.1+o.fase)*.018;
      c.save(); c.translate(o.x,o.y); c.rotate(ang); c.scale(o.s*(2-o.a),o.s*(2-o.a)); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore();
      c.globalAlpha=1; continue;
    }
    if(o.chave){ desenharGato(c,o); continue; }
    desenharEnt(c,o,n);
  }
  c.drawImage(camF,CAM.x0,camF.y0,CAM.x1-CAM.x0,camF.hh);
  // fumaça
  for(const f of fumacas){ c.globalAlpha=Math.max(0,.65*(1-f.t/f.vida)); c.fillStyle='#fff'; c.beginPath(); c.arc(f.x,f.y,f.r,0,6.283); c.fill(); }
  c.globalAlpha=1;
  // névoa do castelo
  if(vila.castelo<3){ const op=[.9,.6,.32][vila.castelo]; c.globalAlpha=op; [[-90,-30,1.3],[40,-60,1.5],[-20,-10,1.9],[90,10,1.1],[-60,20,1.2]].forEach((f,i)=>{ const dx=Math.sin(tempo*.25+i)*14; const sz=f[2]*110; c.drawImage(NEVOA,CASTELO_POS.x+f[0]+dx-sz/2,CASTELO_POS.y+f[1]-sz*.3,sz,sz*.6); }); c.globalAlpha=1; }
  // noite: tinta + brilhos
  c.setTransform(DPR,0,0,DPR,0,0);
  if(NOITE>0){ c.fillStyle=`rgba(40,46,110,${(NOITE*.36).toFixed(3)})`; c.fillRect(0,0,W,H); }
  c.setTransform(DPR*s,0,0,DPR*s,DPR*view.tx,DPR*view.ty);
  if(NOITE>.3){
    c.globalCompositeOperation='lighter'; c.globalAlpha=Math.min(1,NOITE);
    const brilho=(x,y,r)=>c.drawImage(GLOW,x-r,y-r,r*2,r*2);
    if(estAberta('fogueira')){ c.globalAlpha=.75*Math.min(1,NOITE); brilho(CX,CY-10,62+Math.sin(tempo*9)*4); c.globalAlpha=Math.min(1,NOITE); }
    c.globalAlpha=.42*Math.min(1,NOITE); ents.forEach(e=>{ if(e.tipo==='bld') brilho(e.x,e.y-34,24); if(e.tipo==='decor'&&e.id==='lampiao') brilho(e.x,e.y-46,22); }); c.globalAlpha=Math.min(1,NOITE);
    if(vila.castelo>=5) brilho(CASTELO_POS.x,CASTELO_POS.y-80,110);
    for(const p of parts) if(p.tipo==='vaga'){ const a=.5+.5*Math.sin(tempo*3+p.f); c.globalAlpha=a*NOITE; brilho(p.x,p.y,6); }
    c.globalCompositeOperation='source-over'; c.globalAlpha=1;
  }
  // borboletas (dia)
  if(NOITE<.5) for(const p of parts) if(p.tipo==='borb'){ const fl=Math.abs(Math.sin(tempo*14+p.f)); c.fillStyle=p.cor; c.strokeStyle=INK; c.lineWidth=1; c.beginPath(); c.ellipse(p.x-3*fl,p.y,3.5*fl+.5,4,0,0,6.283); c.ellipse(p.x+3*fl,p.y,3.5*fl+.5,4,0,0,6.283); c.fill(); c.stroke(); }
  // textos flutuando e balões de fala
  c.textAlign='center'; c.lineJoin='round';
  for(const f of flutuantes){ const k=f.t/1.3; c.globalAlpha=k<.15?k/.15:1-Math.max(0,(k-.5)/.5); c.font='700 15px Fredoka, Nunito, sans-serif'; c.lineWidth=4; c.strokeStyle='#fbf7ef'; c.strokeText(f.txt,f.x,f.y-k*34); c.fillStyle=f.cor; c.fillText(f.txt,f.x,f.y-k*34); }
  c.globalAlpha=1;
  for(const g of cats) if(g.fala) desenharFala(c,g);
}
function desenharEnt(c,e,n){
  switch(e.tipo){
    case 'castelo': break; // já está na camada da floresta
    case 'rainha': { const sp=sprGato({cor:'#fffdf8',det:'#efe2d4',coroa:1,capa:1},false); if(sp){ c.save(); c.translate(e.ax,e.ay); const b=1+Math.sin(tempo*2)*.02; c.scale(1.15,1.15*b); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); }
      if(cartasNovas().length){ const y=e.ay-80+Math.sin(tempo*4)*3; c.fillStyle='#fbf7ef'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(e.ax,y,14,0,6.283); c.fill(); c.stroke(); c.fillStyle='#fffaf0'; c.fillRect(e.ax-8,y-5,16,11); c.strokeRect(e.ax-8,y-5,16,11); c.fillStyle='#e3798a'; c.beginPath(); c.arc(e.ax,y+1,3,0,6.283); c.fill(); } break; }
    case 'bld': {
      const f=faseDe(estLvl(e.id)); const sp=sprConstrucao(e.id,f,n);
      if(e.pop>0){ e.pop=Math.max(0,e.pop-.03); const k=1-e.pop; const sc=k<1?.3+.7*k+Math.sin(k*3.14)*.15:1; desenharSprite(c,sp,e.ax,e.ay,sc,sc); }
      else if(e.squish>0){ e.squish=Math.max(0,e.squish-.06); const q=Math.sin(e.squish*3.14)*.06; desenharSprite(c,sp,e.ax,e.ay,1+q,1-q); }
      else desenharSprite(c,sp,e.ax,e.ay);
      desenharExtras(c,e); break; }
    case 'camp': {
      const ac=estAberta('fogueira'), f=faseDe(estLvl('fogueira'));
      desenharSprite(c,sprAcamp(ac,ac?f:0),e.ax,e.ay);
      if(ac) chama(c,e.ax,e.ay-2); break; }
    case 'placa': { const b=Math.sin(tempo*3)*2.5; desenharSprite(c,sprite('placa',BOX.sign,placaSVG),e.ax,e.ay+b-2); break; }
    case 'obra': { desenharSprite(c,sprite('andaime',BOX.scaf,andaimeSVG),e.ax,e.ay);
      const sp=sprGato({cor:'#f2c78f',det:'#c9a072',listras:1,capacete:1},false); desenharSprite(c,sp,e.ax+16,e.ay-1,.8,.8);
      c.save(); c.translate(e.ax+24,e.ay-22); c.rotate(Math.sin(tempo*14)*.5-.2); c.fillStyle='#b98a5e'; c.fillRect(-1.5,-14,3,14); c.fillStyle='#9aa3ad'; c.fillRect(-6,-18,12,6); c.restore();
      if(Math.random()<.05) ftxt(e.ax+30,e.ay-40,'toc!',''); break; }
    case 'decor': desenharSprite(c,sprDecor(e.id,n),e.ax,e.ay); break;
  }
}
function chama(c,x,y){
  const t=tempo*9;
  c.fillStyle='#f4a35c'; c.strokeStyle='#c25a3c'; c.lineWidth=2;
  c.beginPath(); c.moveTo(x-12,y); c.bezierCurveTo(x-16,y-16+Math.sin(t)*2,x-6,y-22,x-3+Math.sin(t*1.3)*2,y-34+Math.sin(t)*3); c.bezierCurveTo(x+2,y-26,x+6,y-30,x+6+Math.sin(t*.8)*2,y-40+Math.cos(t)*3); c.bezierCurveTo(x+14,y-28,x+18,y-16,x+12,y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#f2c14e'; c.beginPath(); c.moveTo(x-6,y); c.bezierCurveTo(x-8,y-10,x-2,y-14,x+Math.sin(t*1.7)*2,y-22); c.bezierCurveTo(x+4,y-14,x+8,y-12,x+6,y); c.closePath(); c.fill();
}
/* detalhes animados de cada construção */
function desenharExtras(c,e){
  const d=estDef(e.id);
  if(e.id==='pesca'){ // brilho na água
    c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=1.6; const o=Math.sin(tempo*1.5)*4;
    c.beginPath(); c.moveTo(e.x-70+o,e.y+14); c.quadraticCurveTo(e.x-64+o,e.y+11,e.x-58+o,e.y+14); c.stroke();
  }
  if(e.id==='violao'){ for(let i=0;i<2;i++){ const k=((tempo*.4+i*.5)%1); c.globalAlpha=k<.2?k*5:1-k; c.fillStyle=INK; const nx=e.x-26+i*50+k*10, ny=e.y-60-k*30; c.beginPath(); c.arc(nx,ny,2.4,0,6.283); c.fill(); c.fillRect(nx+1.4,ny-9,1.4,9); c.fillRect(nx+1.4,ny-9,5,1.6); } c.globalAlpha=1; }
}
function desenharGato(c,g){
  const o=g.o;
  // gatinho dormindo na rede
  if(g.estado==='work' && o.acao==='dormir' && !g.alvo){
    const sp=sprDeitado(o); if(sp){ c.save(); c.translate(g.x,g.y-14); const b=1+Math.sin(g.fase*1.6)*.03; c.scale(.82,.82*b); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore(); }
    const k=(g.fase*.5)%1; c.globalAlpha=1-k; c.fillStyle=INK; c.font='700 11px Fredoka, sans-serif'; c.fillText('z',g.x-10+k*10,g.y-40-k*18); c.fillText('z',g.x-4+k*12,g.y-48-k*22); c.globalAlpha=1;
    return;
  }
  const andando=!!g.alvo, trab=g.estado==='work'&&!andando;
  const sp=sprGato(o,g.blink<0); if(!sp) return;
  let bob=0, rot=0, sx=1, sy=1;
  if(andando){ bob=-Math.abs(Math.sin(g.fase*10))*3; rot=Math.sin(g.fase*10)*.05; }
  else if(trab){ bob=-Math.abs(Math.sin(g.fase*5))*1.6; sy=1+Math.sin(g.fase*5)*.02; }
  else sy=1+Math.sin(g.fase*2.6)*.025;
  if(g.pulo>0) bob-=Math.sin(g.pulo*Math.PI)*14;
  const esc=o.visit?.78:.82;
  c.save(); c.translate(g.x,g.y+bob); c.rotate(rot); c.scale(esc*g.dir,esc*sy*(2-sx)); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore();
  if(trab) ferramenta(c,g);
  if(o.visit){ const y=g.y-58+Math.sin(tempo*4)*3; c.fillStyle='#fbf7ef'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(g.x,y,13,0,6.283); c.fill(); c.stroke(); c.fillStyle='#86afcf'; c.fillRect(g.x-7,y-3,14,10); c.strokeRect(g.x-7,y-3,14,10); c.fillStyle='#e3798a'; c.fillRect(g.x-1.5,y-3,3,10); }
}
/* ferramentas dos gatinhos trabalhando (vistos de cima, como nos vídeos) */
function ferramenta(c,g){
  const x=g.x, y=g.y, t=g.fase, a=g.o.acao;
  c.lineCap='round'; c.strokeStyle=INK; c.lineWidth=2;
  if(a==='mexer'){ // colher girando no caldeirão
    const ang=t*3; c.strokeStyle='#b98a5e'; c.lineWidth=3.4; c.beginPath(); c.moveTo(x-14+Math.cos(ang)*5,y-12+Math.sin(ang)*2); c.lineTo(x-6,y-28); c.stroke();
    if(Math.random()<.04) fumacas.push({x:x-16,y:y-16,r:3,vida:2,t:0,vx:Math.random()-.5});
  } else if(a==='cortar'){ // faca subindo e descendo
    const k=Math.abs(Math.sin(t*6)); c.save(); c.translate(x+10,y-22-k*8); c.rotate(-.5); c.fillStyle='#d8dde3'; c.fillRect(-1,-12,4,12); c.strokeRect(-1,-12,4,12); c.fillStyle='#8a6a4e'; c.fillRect(-1,0,4,7); c.restore();
    if(k<.08 && Math.random()<.5){ c.fillStyle='#f4a35c'; c.beginPath(); c.arc(x+14+Math.random()*6,y-18,2.2,0,6.283); c.fill(); }
  } else if(a==='regar'){ // regador inclinando + gotinhas
    const k=(Math.sin(t*2)+1)/2; c.save(); c.translate(x-14,y-20); c.rotate(-.3-k*.4); c.fillStyle='#e8c27a'; c.fillRect(-6,-6,12,10); c.strokeRect(-6,-6,12,10); c.beginPath(); c.moveTo(-6,-2); c.lineTo(-14,-8); c.stroke(); c.restore();
    if(k>.6){ c.fillStyle='#86afcf'; for(let i=0;i<3;i++){ const dy=((t*40+i*7)%16); c.beginPath(); c.arc(x-28-i*2,y-22+dy,1.6,0,6.283); c.fill(); } }
  } else if(a==='machado'){ // machado batendo no toco
    const k=Math.sin(t*5); c.save(); c.translate(x-8,y-24); c.rotate(-1.1+k*.9); c.strokeStyle='#8a6a4e'; c.lineWidth=3.2; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-18); c.stroke(); c.fillStyle='#9aa3ad'; c.strokeStyle=INK; c.lineWidth=1.4; c.fillRect(-1,-22,9,7); c.strokeRect(-1,-22,9,7); c.restore();
    if(k>.95 && Math.random()<.6){ c.fillStyle='#d9b48a'; c.fillRect(x-22+Math.random()*8,y-14-Math.random()*8,3,2); }
  } else if(a==='pescar'){ // vara + boia balançando
    const bx=x-34, by=y+18+Math.sin(t*2)*1.8; c.strokeStyle='#8a6a4e'; c.lineWidth=2.4; c.beginPath(); c.moveTo(x-6,y-18); c.lineTo(x-30,y-40); c.stroke();
    c.strokeStyle='rgba(107,84,64,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(x-30,y-40); c.lineTo(bx,by); c.stroke();
    c.fillStyle='#e3606e'; c.beginPath(); c.arc(bx,by,3,0,6.283); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(bx,by-1.4,1.6,0,6.283); c.fill();
    c.strokeStyle='rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(bx,by+3,6+Math.sin(t*2)*2,2,0,0,6.283); c.stroke();
  } else if(a==='tostar'){ // marshmallow no fogo
    c.strokeStyle='#b98a5e'; c.lineWidth=2; c.beginPath(); c.moveTo(x+6,y-14); c.lineTo(x+22+Math.sin(t*2)*2,y-26); c.stroke();
    c.fillStyle=Math.sin(t*.5)>.6?'#f2d9a8':'#fffaf2'; c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.ellipse(x+24+Math.sin(t*2)*2,y-27,4,3,0,0,6.283); c.fill(); c.stroke();
  } else if(a==='tocar'){ // violãozinho no colo
    c.save(); c.translate(x+4,y-12); c.rotate(-.6+Math.sin(t*4)*.06); c.fillStyle='#c99a6b'; c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.ellipse(0,0,7,5.5,0,0,6.283); c.fill(); c.stroke(); c.fillStyle='#6b5440'; c.beginPath(); c.arc(0,0,1.8,0,6.283); c.fill(); c.fillStyle='#8a6a4e'; c.fillRect(5,-1.2,14,2.4); c.restore();
  }
}
function desenharFala(c,g){
  const txt=g.fala.txt, k=g.fala.t; c.globalAlpha=Math.min(1,k*3);
  c.font='800 12px Nunito, sans-serif';
  const linhas=quebrar(c,txt,150), lh=15, w=Math.min(160,Math.max(...linhas.map(l=>c.measureText(l).width))+18), h=linhas.length*lh+12;
  const x=g.x, y=g.y-56-h;
  c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=2;
  c.beginPath(); c.roundRect?c.roundRect(x-w/2,y,w,h,10):c.rect(x-w/2,y,w,h); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x-6,y+h); c.lineTo(x,y+h+8); c.lineTo(x+6,y+h); c.fill(); c.stroke();
  c.fillStyle='#fffdf8'; c.fillRect(x-5,y+h-2,10,3);
  c.fillStyle=INK; c.textAlign='center'; linhas.forEach((l,i)=>c.fillText(l,x,y+18+i*lh));
  c.globalAlpha=1;
}
function quebrar(c,t,max){ const p=t.split(' '), out=[]; let l=''; p.forEach(w=>{ const tt=l?l+' '+w:w; if(c.measureText(tt).width>max&&l){ out.push(l); l=w; } else l=tt; }); if(l) out.push(l); return out; }

/* ------------------------------------------------------------------
   PAN / ZOOM
------------------------------------------------------------------ */
function aplicarView(){
  const minS=Math.max(W/1300,H/1150);
  view.s=Math.max(minS,Math.min(2.4,view.s));
  view.tx=Math.min(150*view.s,Math.max(W-1150*view.s,view.tx));
  view.ty=Math.min(80*view.s,Math.max(H-1080*view.s,view.ty));
  precisaDesenhar=true;
}
function focar(x,y,s){ view.s=s||view.s; view.tx=W/2-x*view.s; view.ty=H/2-y*view.s; aplicarView(); }
function zoomInicial(){ return Math.max(.7,Math.min(1.6,W/(2.15*R),H/(2.3*R*K+260))); }
window.vlCentro=function(){ animarFoco(CX,CY-30,zoomInicial()); };
function animarFoco(x,y,s){
  const a={...view}, b={s}; b.tx=W/2-x*s; b.ty=H/2-y*s; const t0=performance.now();
  const step=t=>{ const k=Math.min(1,(t-t0)/450), e=1-Math.pow(1-k,3); view.s=a.s+(b.s-a.s)*e; view.tx=a.tx+(b.tx-a.tx)*e; view.ty=a.ty+(b.ty-a.ty)*e; aplicarView(); if(k<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function ligarPanZoom(){
  const v=$('vl-view'); const pts=new Map(); let moved=0, pinch=null, last=null, downPos=null;
  v.addEventListener('pointerdown',e=>{
    v.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){ moved=0; last={x:e.clientX,y:e.clientY}; downPos={x:e.clientX,y:e.clientY}; }
    if(pts.size===2){ const [a,b]=[...pts.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:view.s}; }
    esconderDica();
  });
  v.addEventListener('pointermove',e=>{
    if(!pts.has(e.pointerId)) return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2&&pinch){ const [a,b]=[...pts.values()], d=Math.hypot(a.x-b.x,a.y-b.y); zoomEm((a.x+b.x)/2,(a.y+b.y)/2,pinch.s*d/pinch.d); moved=99; return; }
    if(pts.size===1&&last){ const dx=e.clientX-last.x, dy=e.clientY-last.y; moved+=Math.abs(dx)+Math.abs(dy); if(moved>7){ v.classList.add('drag'); view.tx+=dx; view.ty+=dy; aplicarView(); } last={x:e.clientX,y:e.clientY}; }
  });
  const up=e=>{
    if(!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId); if(pts.size<2) pinch=null;
    if(pts.size===0){ v.classList.remove('drag'); if(moved<=7&&downPos) tocar(downPos.x,downPos.y); downPos=null; last=null; }
    else { const p=[...pts.values()][0]; last={x:p.x,y:p.y}; }
  };
  v.addEventListener('pointerup',up);
  v.addEventListener('pointercancel',e=>{ pts.delete(e.pointerId); pinch=null; v.classList.remove('drag'); });
  v.addEventListener('wheel',e=>{ e.preventDefault(); zoomEm(e.clientX,e.clientY,view.s*Math.exp(-e.deltaY*.0015)); },{passive:false});
}
function zoomEm(cx,cy,ns){
  const r=$('vl-view').getBoundingClientRect(), px=cx-r.left, py=cy-r.top, wx=(px-view.tx)/view.s, wy=(py-view.ty)/view.s;
  view.s=ns; aplicarView(); view.tx=px-wx*view.s; view.ty=py-wy*view.s; aplicarView();
}
function esconderDica(){ const h=$('vl-hint'); if(h) h.style.opacity='0'; }

/* ------------------------------------------------------------------
   TOQUES (hit-test no mundo)
------------------------------------------------------------------ */
function tocar(sx,sy){
  const r=$('vl-view').getBoundingClientRect(), wx=(sx-r.left-view.tx)/view.s, wy=(sy-r.top-view.ty)/view.s;
  Som.init();
  // gatinhos primeiro (são pequenos), do mais à frente pro mais atrás
  const gs=cats.slice().sort((a,b)=>b.y-a.y);
  for(const g of gs){ if(Math.abs(wx-g.x)<17 && wy<g.y+6 && wy>g.y-46){ Som.blip(); if(g.o.visit) pegarVisitante(); else carinhoGato(g); return; } }
  const es=ents.filter(e=>e.act).sort((a,b)=>b.y-a.y);
  for(const e of es){ const [bx,by,bw,bh]=e.box; if(wx>=e.ax+bx&&wx<=e.ax+bx+bw&&wy>=e.ay+by&&wy<=e.ay+by+bh){ Som.blip(); acao(e); return; } }
}
function acao(e){
  const [tipo,arg]=e.act.split(':');
  if(tipo==='est'){ e.squish=1; abrirEstacaoSheet(arg); }
  else if(tipo==='abrir') sheetConstruir(arg);
  else if(tipo==='castelo') sheetCastelo();
  else if(tipo==='rainha') vlPainel('rainha');
  else if(tipo==='praca') toast('a fogueira da praça ainda está apagada... abram mais construções');
}
function carinhoGato(g){
  g.pulo=1;
  vila.stats.taps++; csDirty=true; progMissao('taps',1);
  if(g.o.estacao) prog[g.o.estacao]=Math.min(.999,(prog[g.o.estacao]||0)+.2);
  if(vila.stats.taps%10===0){ vila.coracoes++; ftxt(g.x,g.y-50,'+1 coração','h'); atualizarHud(); Som.chime(); }
  if(g.o.falas && (!g.fala) && Math.random()<.7){ g.fala={txt:g.o.falas[Math.floor(Math.random()*g.o.falas.length)],t:3.2}; }
  else ftxt(g.x,g.y-50,['miau!','prr...','mrrp!','♥'][Math.floor(Math.random()*4)],'h');
}
function popBld(id){ const e=ents.find(x=>x.tipo==='bld'&&x.id===id); if(e) e.pop=1; }

/* ------------------------------------------------------------------
   LOOP
------------------------------------------------------------------ */
let raf=null, last=0, syncT=null, ceuT=null, visitT=null, qualidade=(navigator.hardwareConcurrency||4)<=4?.5:1, lentos=0;
window.abrirCozy=function(){
  montarDOM();
  $('game-overlay').classList.add('active'); $('arcade-wrap').style.display='none'; root.classList.add('on');
  document.body.style.overflow='hidden'; csAberto=true;
  redimensionar();
  garantirMissoes();
  const elp=vila.lastTs?Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600):0;
  const ganho=elp>5?vilaRate()*elp:0;
  vila.lastTs=Date.now();
  R=0; montarMundo(); atualizarHud(); NOITE=noite();
  focar(CX,CY-30,zoomInicial());
  $('vl-som').classList.toggle('off',!Som.on);
  Som.start();
  if(ganho>=1) mostrarOffline(ganho,elp);
  else if(!vila.cartas.includes(0)) setTimeout(()=>abrirCarta(0),700);
  last=0; raf=requestAnimationFrame(loop);
  syncT=setInterval(()=>{ if(csDirty){ escrever(); csDirty=false; } },5000);
  ceuT=setInterval(()=>{ NOITE=noite(); atualizarDots(); },5000);
  agendarVisitante();
  setTimeout(esconderDica,7000);
  atualizarDots();
};
window.pararCatLoop=function(){
  if(!csAberto) return;
  csAberto=false; cancelAnimationFrame(raf); clearInterval(syncT); clearInterval(ceuT); clearTimeout(visitT);
  escrever(); csDirty=false; Som.stop();
  if(root){ root.classList.remove('on'); fecharSheet(); fecharModal(); }
  window.atualizarTagCozy();
};
document.addEventListener('visibilitychange',()=>{
  if(!csAberto) return;
  if(document.hidden){ escrever(); csDirty=false; Som.stop(); }
  else { const elp=Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600); if(elp>20){ const g=vilaRate()*elp; vila.moedas+=g; vila.stats.ganhos+=g; vila.lastTs=Date.now(); toast(`+${fmt(g)} moedas enquanto você estava fora`); } last=0; Som.start(); }
});
window.addEventListener('pagehide',()=>{ if(csAberto) escrever(); });

let hudN=0, acc=0;
function loop(ts){
  if(!csAberto) return;
  raf=requestAnimationFrame(loop);
  if(!last){ last=ts; return; }
  const dtReal=(ts-last)/1000;
  // modo econômico: em aparelho lento, desenha a ~30fps
  if(qualidade<1){ acc+=dtReal; if(acc<1/31){ last=ts; return; } }
  const dt=Math.min(.1,qualidade<1?acc:dtReal); acc=0; last=ts; tempo+=dt;
  const t0=performance.now();
  if(Math.abs(R-Ralvo)>.3){ R+=(Ralvo-R)*Math.min(1,dt*2.4); if(Math.abs(R-Ralvo)<.4) R=Ralvo; atualizarArvores(); }
  let mudou=false;
  for(const e of ESTACOES){
    if(!estAberta(e.id)) continue;
    prog[e.id]=(prog[e.id]||0)+dt/estCiclo(e.id);
    while(prog[e.id]>=1){ prog[e.id]-=1; produzir(e); mudou=true; }
  }
  const sb=$('vl-sheet-bar'); if(sb&&sb.dataset.id) sb.style.width=((prog[sb.dataset.id]||0)*100).toFixed(1)+'%';
  const agora=Date.now(); for(const id in obras){ if(agora>=obras[id]) concluirObra(id); }
  moverGatos(dt);
  // partículas
  if(Math.random()<dt*1.6) ents.forEach(e=>{ if(e.tipo!=='bld') return; const d=estDef(e.id); d.fumaca.forEach(([fx,fy])=>{ if(Math.random()<.5) fumacas.push({x:e.x+fx*[.82,1,1.1][faseDe(estLvl(e.id))],y:e.y+fy,r:3,vida:2.6,t:0,vx:.4}); }); });
  for(let i=fumacas.length-1;i>=0;i--){ const f=fumacas[i]; f.t+=dt; f.y-=dt*14; f.x+=f.vx*dt*8; f.r+=dt*3; if(f.t>=f.vida) fumacas.splice(i,1); }
  for(let i=flutuantes.length-1;i>=0;i--){ flutuantes[i].t+=dt; if(flutuantes[i].t>1.3) flutuantes.splice(i,1); }
  atualizarParticulas(dt);
  if(mudou||(++hudN%15===0)) atualizarHud();
  desenhar();
  // medidor de desempenho: se o quadro demora, baixa a qualidade
  const custo=performance.now()-t0;
  if(custo>14){ if(++lentos>45&&qualidade===1){ qualidade=.5; redimensionar(); } } else lentos=Math.max(0,lentos-1);
}
function atualizarParticulas(dt){
  const n=NOITE>.5;
  const alvoVaga=n?18:0, alvoBorb=n?0:4;
  const conta=t=>parts.filter(p=>p.tipo===t).length;
  if(conta('vaga')<alvoVaga) parts.push({tipo:'vaga',x:CX+(Math.random()-.5)*R*2,y:CY+(Math.random()-.5)*R*K*2-20,vx:0,vy:0,f:Math.random()*6});
  if(conta('borb')<alvoBorb) parts.push({tipo:'borb',x:CX+(Math.random()-.5)*R*1.6,y:CY+(Math.random()-.5)*R*K*1.6-30,f:Math.random()*6,cor:['#f6c3cf','#f2d98c','#c3d8ec'][Math.floor(Math.random()*3)]});
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i]; p.f+=dt;
    if((p.tipo==='vaga'&&!n)||(p.tipo==='borb'&&n)){ parts.splice(i,1); continue; }
    p.x+=Math.cos(p.f*.7)*dt*(p.tipo==='borb'?22:10); p.y+=Math.sin(p.f*.9)*dt*(p.tipo==='borb'?14:8);
  }
  // folhinhas caindo (camada HTML leve, poucas)
  if(!n && Math.random()<dt*.35){ const fx=$('vl-fx'); if(fx && fx.childElementCount<6){ const l=document.createElement('div'); l.className='vl-leaf'; l.style.left=(Math.random()*110)+'%'; l.style.animationDuration=(7+Math.random()*6)+'s'; l.innerHTML=`<svg viewBox="0 0 20 20"><path d="M2 18 C2 6 10 2 18 2 C18 10 14 18 2 18Z" fill="${Math.random()<.5?'#f6c3cf':'#b2cf8f'}" stroke="#86ad6b" stroke-width="1.2"/></svg>`; fx.appendChild(l); setTimeout(()=>l.remove(),13500); } }
}
function produzir(e){
  let v=estValor(e.id), dobro=false;
  if(Math.random()<.02*perkLvl('sorte')){ v*=2; dobro=true; }
  vila.moedas+=v; vila.stats.ganhos+=v; vila.stats.producoes++; csDirty=true;
  progMissao('ganhos',v); progMissao('producoes',1);
  if(e.ciclo>=5||Math.random()<.5) ftxt(e.x,e.y-(e.id==='fogueira'?50:100),(dobro?'sorte! ':'')+'+'+fmt(v),'');
  const p=$('vl-coin-pill'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
}
function atualizarHud(){
  if(!root) return;
  $('cat-coin').textContent=fmt(vila.moedas);
  $('cat-hearts').textContent=fmt(vila.coracoes);
  const r=vilaRate(); $('cat-rate').textContent=r<10?r.toFixed(1).replace('.',','):fmt(r);
  atualizarBotoesSheet();
}

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
    <h2>${e.nome}</h2><div class="vl-sub">${e.gato.nome}, ${e.pers} · construção ${FASES[fase]} · nível <b id="vl-s-lvl">${l}</b>${marcoMult(l)>1?` · produção ×${marcoMult(l)}`:''}</div>
    <div class="vl-row"><div class="vl-stat"><b>${ic('coin')}<span id="vl-s-val">${fmt(estValor(id))}</span></b>por item</div><div class="vl-stat"><b>${estCiclo(id).toFixed(1).replace('.',',')}s</b>por item</div><div class="vl-stat"><b>${pm||'—'}</b>${pm?'próximo ×2':'nível máx'}</div></div>
    <div class="vl-bar"><i id="vl-sheet-bar" data-id="${id}"></i></div>
    ${e.extra?`<p class="vl-small" style="margin-top:0">${e.extra}</p>`:''}
    <div class="vl-buyx">${[1,10,'max'].map(x=>`<button class="${String(buyMode)===String(x)?'on':''}" onclick="vlBuyX('${x}','${id}')">${x==='max'?'máx':'x'+x}</button>`).join('')}</div>
    <button class="vl-btn" id="vl-up" data-up="${id}" onclick="vlMelhorar('${id}')"></button>
    <p class="vl-small">${fase<2?`no nível ${fase===0?10:25} a construção fica ${FASES[fase+1]}`:'construção completa'} · toque no gatinho na vila pra fazer carinho</p>`,'est:'+id);
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
  if(faseDe(depois)>faseA){ toast(`${e.nome} virou ${FASES[faseDe(depois)]}!`); Som.chime(); montarMundo(); popBld(id); }
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
    modal(`<svg viewBox="-150 -200 300 260" style="width:220px;height:190px">${casteloSVG(vila.castelo,false,true)}</svg><h2>${c.nome} restaurado!</h2><p class="vl-small" style="font-size:14px">a Rainha Mimosa mandou uma carta</p><button class="vl-btn rose" onclick="fecharModal();abrirCarta(${vila.castelo})">ler carta</button>`);
    return;
  }
  vila.est[id]={lvl:1}; prog[id]=0; csDirty=true; escrever(); csDirty=false;
  Ralvo=raioAlvo(); montarMundo(); Som.fanfarra(); popBld(id);
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
  abrirSheet(`<svg viewBox="-150 -200 300 270" style="width:100%;max-height:220px;display:block">${casteloSVG(st,false,true)}</svg>
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
    const todos=ESTACOES.map(e=>({nome:e.gato.nome,o:e.gato,sub:e.pers,ok:estAberta(e.id)})).concat(vila.adotados.map(a=>{ const c=CORES_GATOS[a.c]; return {nome:a.nome,o:{cor:c[0],det:c[1],listras:c[2]},sub:JEITOS[a.j||0].p,ok:true}; }));
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
  vila.moedas-=c; vila.adotados.push({nome,c:Math.floor(Math.random()*CORES_GATOS.length),j:Math.floor(Math.random()*JEITOS.length)}); csDirty=true; escrever(); csDirty=false;
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
  const a=Math.random()*Math.PI*2, cor=CORES_GATOS[Math.floor(Math.random()*CORES_GATOS.length)];
  const g=novoGato('visit',{nome:'visitante',cor:cor[0],det:cor[1],listras:cor[2],visit:1});
  g.x=CX+Math.cos(a)*(R+30); g.y=CY+Math.sin(a)*(R+30)*K; g.vel=34; g.alvo={x:CX+(Math.random()-.5)*80,y:CY+28}; g.estado='walk';
  visitante=g; cats.push(g);
  setTimeout(()=>{ if(visitante===g){ removerVisitante(); agendarVisitante(); } },25000);
}
function removerVisitante(){ const i=cats.indexOf(visitante); if(i>=0) cats.splice(i,1); visitante=null; }
function pegarVisitante(){
  const g=visitante; if(!g) return;
  const v=Math.max(25,vilaRate()*50)*(1+.5*perkLvl('encomenda'));
  vila.moedas+=v; vila.coracoes+=2; vila.stats.encomendas++; vila.stats.ganhos+=v; csDirty=true;
  progMissao('encomendas',1); progMissao('ganhos',v);
  ftxt(g.x,g.y-60,'+'+fmt(v)+' e +2 corações','');
  Som.chime(); removerVisitante(); atualizarHud(); agendarVisitante();
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
