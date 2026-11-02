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
  book:'<svg viewBox="0 0 32 32"><path d="M4 7 C9 5 13 6 16 9 C19 6 23 5 28 7 V26 C23 24 19 25 16 27 C13 25 9 24 4 26 Z" fill="#fffaf0" stroke="#6b5440" stroke-width="2" stroke-linejoin="round"/><path d="M16 9 V27" stroke="#6b5440" stroke-width="2"/><path d="M7 11 h6 M7 15 h6 M19 11 h6 M19 15 h6" stroke="#c2ac88" stroke-width="1.6" stroke-linecap="round"/><circle cx="22" cy="20" r="2.4" fill="#b9dc4c" stroke="#6b5440" stroke-width="1.2"/></svg>',
  hammer:'<svg viewBox="0 0 32 32"><rect x="14" y="10" width="4" height="19" rx="2" fill="#b98a5e" stroke="#6b5440" stroke-width="1.8"/><rect x="7" y="5" width="18" height="8" rx="2" fill="#9aa3ad" stroke="#5a6068" stroke-width="1.8"/></svg>',
  trophy:'<svg viewBox="0 0 32 32"><path d="M9 5 H23 V12 C23 18 19 21 16 21 C13 21 9 18 9 12 Z" fill="#f2c14e" stroke="#8a6224" stroke-width="2" stroke-linejoin="round"/><path d="M9 8 H5 C5 13 7 15 10 15 M23 8 H27 C27 13 25 15 22 15" fill="none" stroke="#8a6224" stroke-width="2"/><rect x="14" y="21" width="4" height="4" fill="#e9b24f" stroke="#8a6224" stroke-width="1.6"/><rect x="9" y="25" width="14" height="4" rx="1.5" fill="#c99a6b" stroke="#6b5440" stroke-width="1.8"/><path d="M13 9 v5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>',
  mail:'<svg viewBox="0 0 32 32"><path d="M6 14 V27 H26 V14" fill="#e3798a" stroke="#a8485a" stroke-width="2"/><path d="M5 15 C5 7 27 7 27 15 Z" fill="#f2a7b8" stroke="#a8485a" stroke-width="2"/><rect x="10" y="17" width="12" height="5" rx="1" fill="#fffaf0" stroke="#a8485a" stroke-width="1.4"/><path d="M27 15 V9 h4 v3 h-4" fill="#f2c14e" stroke="#8a6224" stroke-width="1.6"/></svg>',
  seta:'<svg viewBox="0 0 24 24"><path d="M5 12 H17 M12 6 L18 12 L12 18" fill="none" stroke="#6b5440" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sol:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#f2c14e" stroke="#c38a2b" stroke-width="1.6"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#e9b24f" stroke-width="2" stroke-linecap="round"/></svg>',
  lua:'<svg viewBox="0 0 24 24"><path d="M15 3 A9 9 0 1 0 21 15 A7 7 0 0 1 15 3 Z" fill="#f7e9b0" stroke="#c9a53a" stroke-width="1.6"/></svg>',
  nuvem:'<svg viewBox="0 0 24 24"><path d="M6 18 H18 A4 4 0 0 0 18 10 A6 6 0 0 0 7 9 A4.5 4.5 0 0 0 6 18 Z" fill="#eef1f4" stroke="#8b97a3" stroke-width="1.6"/></svg>',
  chuva:'<svg viewBox="0 0 24 24"><path d="M6 14 H18 A4 4 0 0 0 18 6 A6 6 0 0 0 7 5 A4.5 4.5 0 0 0 6 14 Z" fill="#dfe6ec" stroke="#7d8b98" stroke-width="1.6"/><path d="M8 17 l-1 3 M12 17 l-1 3 M16 17 l-1 3" stroke="#5f8db1" stroke-width="2" stroke-linecap="round"/></svg>',
  nevoa:'<svg viewBox="0 0 24 24"><path d="M3 8 H17 M6 12 H21 M3 16 H15 M8 20 H20" stroke="#a9b4be" stroke-width="2.2" stroke-linecap="round"/></svg>',
  festa:'<svg viewBox="0 0 24 24"><path d="M3 4 Q12 10 21 4" stroke="#6b5440" stroke-width="1.4" fill="none"/><path d="M5 5 l2 5 l2-4 Z" fill="#e3798a"/><path d="M10 6.5 l2 5 l2-5 Z" fill="#f2c14e"/><path d="M15 6 l2 4 l2-5 Z" fill="#86afcf"/><path d="M12 14 C9 11 5 13 8 17 L12 21 L16 17 C19 13 15 11 12 14 Z" fill="#e3798a" stroke="#a8485a" stroke-width="1.2"/></svg>',
  olho:'<svg viewBox="0 0 24 24"><path d="M2 12 C6 5 18 5 22 12 C18 19 6 19 2 12 Z" fill="#fffaf0" stroke="#6b5440" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="#86a86b" stroke="#6b5440" stroke-width="1.4"/></svg>',
  play:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e3798a" stroke="#a8485a" stroke-width="1.6"/><path d="M10 8 L16 12 L10 16 Z" fill="#fff"/></svg>'
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
  cafe:'<svg viewBox="0 0 32 32"><path d="M8 10 H20 L18 28 H10 Z" fill="#f2c14e" stroke="#6b5440" stroke-width="2"/><path d="M15 10 L19 2" stroke="#e3798a" stroke-width="2.4" stroke-linecap="round"/><path d="M18 14 H26 L24.5 28 H19 Z" fill="#f2a7b8" stroke="#6b5440" stroke-width="2"/><path d="M22 14 L25 7" stroke="#86a86b" stroke-width="2.2" stroke-linecap="round"/></svg>',
  cinema:'<svg viewBox="0 0 32 32"><path d="M7 12 H25 L22 29 H10 Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M10 12 L12 29 M16 12 V29 M22 12 L20 29" stroke="#e3606e" stroke-width="2.2"/><circle cx="10" cy="10" r="3.4" fill="#fff8e0" stroke="#6b5440" stroke-width="1.6"/><circle cx="16" cy="8" r="3.6" fill="#fff8e0" stroke="#6b5440" stroke-width="1.6"/><circle cx="22" cy="10" r="3.4" fill="#fff8e0" stroke="#6b5440" stroke-width="1.6"/></svg>',
  balao:'<svg viewBox="0 0 32 32"><rect x="4" y="7" width="24" height="18" rx="2" fill="#fffaf0" stroke="#6b5440" stroke-width="2"/><rect x="19" y="10" width="6" height="7" fill="#f2a7b8" stroke="#6b5440" stroke-width="1.4"/><path d="M8 13 h8 M8 17 h8 M8 21 h12" stroke="#c2ac88" stroke-width="1.6" stroke-linecap="round"/></svg>',
  soneca:'<svg viewBox="0 0 32 32"><path d="M11 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M5 12 H23 V20 C23 25 19 27 14 27 C9 27 5 25 5 20Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M23 14 C29 14 29 21 23 21" fill="none" stroke="#6b5440" stroke-width="2"/><ellipse cx="14" cy="12.5" rx="9" ry="1.8" fill="#c99a6b"/></svg>',
  observatorio:'<svg viewBox="0 0 32 32"><path d="M5 22 L22 8 L26 12 L9 26 Z" fill="#86afcf" stroke="#4e6f8c" stroke-width="2" stroke-linejoin="round"/><path d="M14 22 L11 30 M15 22 L19 30" stroke="#6b5440" stroke-width="2" stroke-linecap="round"/><path d="M26 2 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z" fill="#f2c14e"/></svg>',
  biblioteca:'<svg viewBox="0 0 32 32"><rect x="5" y="6" width="6" height="21" rx="1" fill="#e3798a" stroke="#6b5440" stroke-width="1.8"/><rect x="11" y="9" width="6" height="18" rx="1" fill="#86afcf" stroke="#6b5440" stroke-width="1.8"/><rect x="18" y="7" width="6" height="20" rx="1" fill="#f2c14e" stroke="#6b5440" stroke-width="1.8" transform="rotate(10 21 17)"/><path d="M4 28 H28" stroke="#6b5440" stroke-width="2"/></svg>',
  pomar:'<svg viewBox="0 0 32 32"><circle cx="11" cy="18" r="7" fill="#c9a2d6" stroke="#6b5440" stroke-width="2"/><circle cx="9" cy="16" r="1.3" fill="#fff" opacity=".7"/><path d="M22 12 C28 12 28 22 22 27 C16 22 16 12 22 12 Z" fill="#e3606e" stroke="#6b5440" stroke-width="2"/><path d="M19 12 l3 -3 l3 3" fill="#86a86b" stroke="#5f824b" stroke-width="1.4"/><circle cx="21" cy="17" r=".9" fill="#fff4b0"/><circle cx="23.5" cy="20" r=".9" fill="#fff4b0"/></svg>',
  casinha:'<svg viewBox="0 0 32 32"><path d="M5 15 L16 5 L27 15" fill="#c25a6c" stroke="#6b5440" stroke-width="2" stroke-linejoin="round"/><path d="M8 14 V27 H24 V14" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><path d="M16 23 C13 20 11 18 13.5 16.5 C15 15.8 16 17 16 17 C16 17 17 15.8 18.5 16.5 C21 18 19 20 16 23 Z" fill="#e3798a"/></svg>'
};
/* cardápio dos pedidos (ícones) */
const MENU=[
  {id:'sopa',nome:'sopinha',est:'sopa',svg:PROD.sopa},
  {id:'pao',nome:'pão de cenoura',est:'padaria',svg:'<svg viewBox="0 0 32 32"><path d="M4 20 C4 11 28 11 28 20 C28 25 4 25 4 20 Z" fill="#e8b46a" stroke="#6b5440" stroke-width="2"/><path d="M10 15 l2 4 M16 14 l1 4 M22 15 l-1 4" stroke="#c98a3a" stroke-width="1.8" stroke-linecap="round"/></svg>'},
  {id:'pizza',nome:'pizza vegetariana',est:'padaria',svg:'<svg viewBox="0 0 32 32"><path d="M16 4 L28 26 C20 29 12 29 4 26 Z" fill="#f2c14e" stroke="#6b5440" stroke-width="2" stroke-linejoin="round"/><path d="M4 26 C12 29 20 29 28 26" stroke="#c99a6b" stroke-width="4" fill="none"/><circle cx="14" cy="16" r="2.4" fill="#e3606e"/><circle cx="19" cy="21" r="2.4" fill="#e3606e"/><circle cx="12" cy="22" r="1.8" fill="#86a86b"/></svg>'},
  {id:'salada',nome:'saladinha da estufa',est:'horta',svg:'<svg viewBox="0 0 32 32"><path d="M4 16 H28 C28 24 22 28 16 28 C10 28 4 24 4 16 Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><circle cx="11" cy="14" r="4" fill="#86a86b" stroke="#5f824b" stroke-width="1.4"/><circle cx="18" cy="13" r="4" fill="#9cc27c" stroke="#5f824b" stroke-width="1.4"/><circle cx="22" cy="15" r="2.6" fill="#e3606e"/></svg>'},
  {id:'marsh',nome:'marshmallow tostado',est:'fogueira',svg:PROD.fogueira},
  {id:'cafezinho',nome:'cafezinho',est:'cafe',svg:'<svg viewBox="0 0 32 32"><path d="M10 8c0-2 2-2 2-4M15 8c0-2 2-2 2-4" stroke="#c2ac88" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M6 11 H22 V19 C22 25 18 27 14 27 C10 27 6 25 6 19Z" fill="#fbf3e3" stroke="#6b5440" stroke-width="2"/><ellipse cx="14" cy="11.5" rx="8" ry="1.8" fill="#7a4e2e"/><path d="M22 13 C28 13 28 20 22 20" fill="none" stroke="#6b5440" stroke-width="2"/></svg>'},
  {id:'maracuja',nome:'suco de maracujá',est:'cafe',svg:'<svg viewBox="0 0 32 32"><path d="M9 9 H23 L21 28 H11 Z" fill="#f2c14e" stroke="#6b5440" stroke-width="2"/><circle cx="14" cy="18" r="1" fill="#3a2a20"/><circle cx="17.5" cy="21" r="1" fill="#3a2a20"/><circle cx="15" cy="24" r="1" fill="#3a2a20"/><path d="M17 9 L21 2" stroke="#86a86b" stroke-width="2.4" stroke-linecap="round"/></svg>'},
  {id:'morango',nome:'suco de morango',est:'cafe',svg:'<svg viewBox="0 0 32 32"><path d="M9 9 H23 L21 28 H11 Z" fill="#f2a7b8" stroke="#6b5440" stroke-width="2"/><path d="M17 9 L21 2" stroke="#e3798a" stroke-width="2.4" stroke-linecap="round"/><path d="M20 6 C24 6 24 12 20 14 C16 12 16 6 20 6 Z" fill="#e3606e" stroke="#6b5440" stroke-width="1.4"/></svg>'},
  {id:'cheesecake',nome:'cheesecake de cereja',est:'cafe',svg:'<svg viewBox="0 0 32 32"><path d="M4 20 L26 12 L28 22 L6 28 Z" fill="#fff4dc" stroke="#6b5440" stroke-width="2" stroke-linejoin="round"/><path d="M4 20 L26 12 L27 15 L5 23 Z" fill="#e3606e" stroke="#6b5440" stroke-width="1.6"/><circle cx="16" cy="12" r="3" fill="#c2185b" stroke="#6b5440" stroke-width="1.2"/><path d="M16 9 q2 -4 5 -4" stroke="#5f824b" stroke-width="1.6" fill="none"/></svg>'},
  {id:'pipoca',nome:'pipoca',est:'cinema',svg:PROD.cinema}
];
const menuDef=id=>MENU.find(m=>m.id===id);

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
   falas:['zzz... cinco minutinhos...','descansar também é trabalhar','sonhei que eu era uma nuvem. ou a nuvem sonhou comigo?','por que correr se a rede tá logo ali?'], extra:'gatinhos descansados: +1h de ganho offline por nível'},
  {id:'cafe',    nome:'cafeteria da chuva', ciclo:26, val:110000, abrir:8e7,  up:2.6e7, x:272,y:452, work:{dx:40,dy:12,acao:'servir'},  fumaca:[[24,-100]], hist:'chuva',
   gato:{nome:'Cereja',cor:'#f7dfe3',det:'#e8a9b6',avental:'#c25a6c'}, pers:'doceira apaixonada por cheesecake',
   falas:['cheesecake de cereja saindo!','aqui tudo é vegetariano, viu?','um de maracujá e um de morango, como sempre?','dizem que a chuva daqui revela segredos...']},
  {id:'cinema',  nome:'cine cultura',       ciclo:30, val:420000, abrir:4.5e8,up:1.4e8, x:744,y:452, work:{dx:-50,dy:16,acao:'projetar'}, fumaca:[], hist:'chuva',
   gato:{nome:'Lumi',cor:'#ddd5ec',det:'#a99cc9',listras:1,oculos:1}, pers:'projecionista cinéfila',
   falas:['hoje tem sessão de Amores Expressos','silêncio, o filme vai começar','já fechei o cinema pra uma ocasião especial, sabia?','pipoca vegetariana, claro']},
  {id:'balao',   nome:'balão dos viajantes',ciclo:40, val:1.6e6,  abrir:2.5e9,up:8e8,   x:420,y:714, work:{dx:44,dy:6,acao:'mapa'},    fumaca:[], hist:'pedido',
   gato:{nome:'Bússola',cor:'#e8c9a4',det:'#8a6a4e',chapeuVerde:1}, pers:'navegador sonhador',
   falas:['próxima parada: China!','já pensou o Japão na primavera?','no Peru tem montanhas que tocam as nuvens','na Itália tem pizza vegetariana de verdade']},
  {id:'observatorio',nome:'observatório das estrelas',ciclo:45,val:7e6, abrir:1e10,  up:3e9,   x:290,y:370, work:{dx:42,dy:12,acao:'olhar'}, fumaca:[], hist:'mundo',
   gato:{nome:'Cometa',cor:'#4a4f6e',det:'#33374f',listras:1}, pers:'astrônoma que nunca dorme',
   falas:['achei uma estrela nova! vou chamar de Natalix','aquela luz verde de novo... vem de Veluma?','as estrelas piscam em código, sabia?','shh, a Ursa Menor tá dormindo'], extra:'à noite as estrelas rendem o dobro aqui'},
  {id:'biblioteca',nome:'biblioteca do bosque',ciclo:50,val:3e7, abrir:4e10,  up:1.2e10, x:710,y:370, work:{dx:-48,dy:12,acao:'ler'}, fumaca:[[22,-106]], hist:'veluma',
   gato:{nome:'Traça',cor:'#d9c8a9',det:'#a8916b',listras:1,oculos:1}, pers:'leitor que sabe de tudo',
   falas:['tem um livro aqui sobre gatos que caíram do céu...','silêncio é o barulho preferido dos livros','já li esse 14 vezes. o final ainda me pega','a Rainha guarda um diário trancado na última estante']},
  {id:'pomar',   nome:'pomar de maracujá e morango',ciclo:55,val:1.2e8,abrir:1.6e11,up:5e10, x:160,y:540, work:{dx:44,dy:10,acao:'colher'}, fumaca:[], hist:'rainha',
   gato:{nome:'Moranguinho',cor:'#f6c9b8',det:'#e0957e'}, pers:'jardineira animada',
   falas:['um maracujá pra ele, um morango pra ela!','plantei de propósito um do lado do outro','esse aqui tá docinho, prova!','o segredo é cantar pros morangos'], extra:'deixa os sucos da cafeteria 25% mais valiosos'},
  {id:'casinha', nome:'casa da árvore dos dois',ciclo:60,val:5e8, abrir:6e11,  up:1.8e11, x:840,y:540, work:{dx:-50,dy:12,acao:'varrer'}, fumaca:[[10,-122]], hist:'atraso',
   gato:{nome:'Dengo',cor:'#fbe9d0',det:'#e8bf8f',listras:1}, pers:'filhotinho adotado pelos dois',
   falas:['papai Gabrix! mamãe Natalix!','eu varri tudo sozinho, olha!','por que vocês têm antenas e eu não?','posso dormir no meio de vocês hoje?']}
];
ESTACOES.forEach(e=>e.d=dEl(e.x,e.y));
const MARCOS_NIVEL=[10,25,50,75,100,150,200];
const FASES=['simples','caprichada','dos sonhos'];
const faseDe=l=>l>=25?2:l>=10?1:0;
const CASTELO_POS={x:500,y:318};
const CASTELO=[
  {nome:'ponte do bosque', art:'a', req:3, custo:3000,  desc:'liga a vila ao castelo e espanta um pouco da névoa'},
  {nome:'portão real', art:'o', req:5, custo:150000,desc:'reconstrói as muralhas e o grande portão'},
  {nome:'jardim da rainha', art:'o', req:6, custo:1.2e6, desc:'flores, cercas vivas e um banquinho pra rainha'},
  {nome:'torres de vigia', art:'as', req:7, custo:9e6,   desc:'duas torres com telhadinhos cor de rosa'},
  {nome:'salão do trono', art:'o', req:8, custo:6e7,   desc:'acende o castelo inteiro (e a última carta)'}
];
/* cartas da Rainha Mimosa: uma por parte do castelo restaurada (índice = parte-1) */
const CARTAS=[
  {t:'a ponte do bosque', premio:4, txt:`querido viajante,

a ponte voltou! pela primeira vez em muitas luas desci do castelo e pisei na grama.

vi um gatinho novo na clareira, de gorro. e outra, do outro lado do bosque, de boina. curioso... no meu tempo eu também usava chapéu pra esconder umas coisinhas.

um reino não é feito de pedras. é feito de quem cuida.

— Mimosa`},
  {t:'o portão real', premio:5, txt:`o portão está de pé, e eu deixei ele aberto de propósito.

portão fechado protege, mas portão aberto convida. esta floresta agora é de quem chega com carinho, venha de onde vier. até de muito, muito longe.

coisas bonitas são assim: devagar, mas de verdade.

— Mimosa`},
  {t:'o jardim da rainha', premio:6, txt:`plantaram o meu jardim!

amor é parecido com jardim. precisa de sol, de água, de paciência... e de alguém que lembre de regar quando o outro esquece.

hoje sentei no banquinho e uma flor brilhou verde no escuro. faz tempo que eu não via isso. desde que eu cheguei aqui.

— Mimosa`},
  {t:'as torres de vigia', premio:8, txt:`do alto das torres dá pra ver a floresta inteira.

e vi uma coisa que eu já tinha visto uma vez, há muitos e muitos invernos: duas luzes verdes caindo do céu, em lugares diferentes do bosque.

não contei pra ninguém. rainha também guarda segredo.

— Mimosa`},
  {t:'o salão do trono', premio:12, txt:`o castelo inteiro brilha de novo. o reino dos aconchegos acordou, e foram vocês que acordaram.

dentro do salão tem uma estante trancada. a chave está comigo, e um dia vai ser de vocês. quando a biblioteca do bosque abrir, eu conto a minha história inteira.

até lá: cuidem um do outro. é a única magia que eu conheço que nunca falha.

— Mimosa`}
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
const NOMES_GATOS=['Bolinha','Mel','Pipoca','Fubá','Nina','Tico','Amora','Pudim','Chico','Luna','Algodão','Canela','Jujuba','Biscoito','Mingau','Pitoco','Café','Bombom','Tapioca','Brigadeiro','Pamonha','Pequi','Cocada','Paçoquinha','Quindim','Cuscuz'];
const CORES_GATOS=[['#f4a35c','#d9793a',1],['#fffaf3','#e2cdb9',0],['#57514f','#3a3535',0],['#cfcfcf','#9a9a9a',1],['#f1d6ae','#c9a072',1],['#bccbdc','#8ea3bd',1],['#e8c9a4','#8a6a4e',0],['#f6e7d6','#e3a568',1]];
const JEITOS=[
  {p:'curioso',falas:['o que tem atrás daquela árvore?','posso ver? posso? posso?']},
  {p:'comilão',falas:['alguém falou em sopa?','meu estômago fez um barulho estranho']},
  {p:'brincalhão',falas:['pega-pega! tá com você!','olha eu rolando!']},
  {p:'tímido',falas:['...oi','*se esconde atrás do rabo*']},
  {p:'dramático',falas:['ninguém me entende!!','esse é o pior melhor dia da minha vida']},
  {p:'aventureiro',falas:['um dia vou ver o mar','ouvi dizer que existe uma feira de viajantes...']},
  {p:'romântico',falas:['viu como o Gabrix olha pra Natalix?','escrevi um poema pra lua. ela não respondeu']},
  {p:'fofoqueiro',falas:['dizem que a Rainha tem antenas embaixo da coroa...','eu vi! eu vi os dois de mãozinha dada!']},
  {p:'cinéfilo',falas:['meu filme favorito? todos da Lumi','pipoca é 50% do filme']},
  {p:'dorminhoco',falas:['zzz... hã? já é de manhã?','acordei só pra comer']},
  {p:'atrasado',falas:['tô atrasado! tô atrasado!','cinco minutinhos e eu chego!']},
  {p:'cozinheiro',falas:['hoje tem sopa de abóbora sem nada de carne','a Nuvem me ensinou o segredo: queijo']}
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
  {tipo:'producoes',txt:n=>`produzir ${n} itens`,meta:()=>[60,120,200][Math.floor(rng()*3)]},
  {tipo:'pedidos',txt:n=>`atender ${n} pedidos do cardápio`,meta:()=>[3,5,7][Math.floor(rng()*3)]}
];
const CLIENT_ID=Math.random().toString(36).slice(2,10);
let _seed=1; function rng(){ _seed=(_seed*16807)%2147483647; return (_seed-1)/2147483646; }
function seeded(s){ let x=s%2147483647||1; return ()=>{ x=(x*16807)%2147483647; return (x-1)/2147483646; }; }

/* ------------------------------------------------------------------
   ESTADO + ECONOMIA
------------------------------------------------------------------ */
function novaVila(ts){ return {v:5,moedas:0,coracoes:0,lastTs:ts===undefined?Date.now():ts,est:{sopa:{lvl:1}},decor:0,perks:{},missoes:null,
  stats:{taps:0,ups:0,encomendas:0,ganhos:0,producoes:0,pedidos:0,erros:0,presentes:0,recebidos:0,visitas:0,cenas:0,chuva:0,noite:0,festa:0},castelo:0,cartas:[],adotados:[],cap:[],postais:[],conq:[],tut:0}; }
let vila=novaVila(0);
let CLIMA={tipo:'sol',nome:'sol'}, FESTA=null, ESTACAO='primavera';
let visitando=false, minhaVila=null;
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
/* bônus do momento: clima, noite, festa e o pomar (mostrados na folha da estação) */
function bonusEst(id){
  let b=1;
  if(CLIMA.tipo==='chuva'&&(id==='cafe'||id==='pesca')) b*=1.5;
  if(id==='cafe'&&estAberta('pomar')) b*=1.25;
  if(id==='observatorio'&&NOITE>.5) b*=2;
  if(FESTA) b*=2;
  return b;
}
function estValor(id){ const l=estLvl(id); return l?estDef(id).val*l*marcoMult(l)*multGlobal()*bonusEst(id):0; }
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
const liberada=e=>!e.hist||vila.cap.includes(HIST.findIndex(h=>h.id===e.hist));
const proximaEstacao=()=>ESTACOES.find(e=>!estAberta(e.id)&&liberada(e));

function salvarLocal(){ if(perfil&&!visitando) LS.set(chaveLocal(),vila); }
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
  v.cap=Array.isArray(d.cap)?d.cap.filter(n=>Number.isInteger(n)&&n>=0&&n<HIST.length):[];
  v.postais=Array.isArray(d.postais)?d.postais.filter(x=>POSTAIS.some(p=>p.id===x)):[];
  v.adotados=Array.isArray(d.adotados)?d.adotados.slice(0,20).map(a=>({nome:String(a.nome||'Gatinho').slice(0,20),c:Math.max(0,Math.min(CORES_GATOS.length-1,Number(a.c)||0)),j:Math.max(0,Math.min(JEITOS.length-1,Number(a.j)||0))})):[];
  v.conq=Array.isArray(d.conq)?d.conq.filter(x=>typeof x==='string').slice(0,200):[];
  v.tut=Math.max(0,Number(d.tut)||0);
  v.cartas=(Number(d.v)||0)<5?[]:v.cartas.filter(n=>n>=0&&n<CARTAS.length);  // cartas da Rainha foram reescritas na v5
  Object.keys(v.stats).forEach(k=>{ v.stats[k]=Math.max(0,Number(v.stats[k])||0); });
  return v;
}
function escrever(){
  if(visitando) return;
  vila.lastTs=Date.now(); salvarLocal();
  if(!fb||!refEu||!perfil) return;
  refEu.set(JSON.parse(JSON.stringify({...vila,by:CLIENT_ID,perfil})),{merge:false}).catch(e=>console.error(e));
}
window.carregarVilaLocal=function(){ if(perfil) conectarPerfil(); };
window.catOnRemote=function(data){ legado=data; };  // save antigo do casal (só pra migração)
window.atualizarTagCozy=function(){ const t=$('cozy-tag'); if(t) t.textContent=!perfil?'escolham: Gabrix ou Natalix?':`${HEROIS[perfil].nome} · nível ${vilaNivel()} · ${fmt(vila.moedas)} moedas · +${fmt(vilaRate())}/s`; };

/* ------------------------------------------------------------------
   DESENHOS VETORIAIS (viram sprites; também usados no HTML)
------------------------------------------------------------------ */
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255; const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt))); return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1); }
const sombra=(rx,ry)=>`<ellipse cx="0" cy="3" rx="${rx}" ry="${ry}" fill="rgba(70,55,35,.18)"/>`;

/* paleta das árvores por estação do ano (hemisfério sul, Goiânia: chuva no verão, seca e ipês no inverno) */
const PAL_ARV={
  verao:   {c:['#8fb874','#9cc27c','#a8c98a','#86ad6b','#b2cf8f'],d:['#6f9a58','#7aa35f','#86ad6b','#668f51','#8db86c']},
  outono:  {c:['#8fb874','#e0a85a','#a8c98a','#d98c4a','#c9b46a'],d:['#6f9a58','#b9783a','#86ad6b','#a8652f','#9c8a48']},
  inverno: {c:['#9fae74','#f2c94c','#aab67f','#e89ab8','#b5b98a'],d:['#7d8c58','#c9a032','#88955f','#c4728f','#929668']},
  primavera:{c:['#8fb874','#9cc27c','#f6c3cf','#86ad6b','#b2cf8f'],d:['#6f9a58','#7aa35f','#e3909f','#668f51','#8db86c']}
};
function arvoreSVG(tipo,cor,est){
  const P=PAL_ARV[est||ESTACAO]||PAL_ARV.verao;
  const c=P.c[cor%5], d=P.d[cor%5];
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
  const bufao=o.bufao?`<path d="M-12 -38 C-16 -50 -24 -52 -26 -46 C-20 -46 -16 -42 -14 -36 Z M12 -38 C16 -50 24 -52 26 -46 C20 -46 16 -42 14 -36 Z" fill="#e3606e" stroke="${INK}" stroke-width="1.6"/><path d="M-12 -38 C-6 -54 6 -54 12 -38 Z" fill="#86afcf" stroke="${INK}" stroke-width="1.6"/><circle cx="-26" cy="-46" r="2.6" fill="#f2c14e" stroke="${INK}" stroke-width="1"/><circle cx="26" cy="-46" r="2.6" fill="#f2c14e" stroke="${INK}" stroke-width="1"/><circle cx="0" cy="-52" r="2.6" fill="#f2c14e" stroke="${INK}" stroke-width="1"/>`:'';
  const cachecol=o.cachecol?`<path d="M-11 -19 Q0 -13 11 -19 L11 -14 Q0 -8 -11 -14 Z" fill="${o.cachecol}" stroke="${INK}" stroke-width="1.4"/><path d="M6 -14 l3 9 l4 -1 l-2 -9" fill="${o.cachecol}" stroke="${INK}" stroke-width="1.2"/>`:'';
  const oculos=o.oculos?`<circle cx="-4.6" cy="-29.5" r="3.6" fill="none" stroke="${INK}" stroke-width="1.3"/><circle cx="4.6" cy="-29.5" r="3.6" fill="none" stroke="${INK}" stroke-width="1.3"/><path d="M-1 -29.5 h2" stroke="${INK}" stroke-width="1.2"/>`:'';
  const antenas=o.antenas?`<path d="M-6 -38 C-8 -46 -10 -50 -12 -53 M6 -38 C8 -46 10 -50 12 -53" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M-6 -38 C-8 -46 -10 -50 -12 -53 M6 -38 C8 -46 10 -50 12 -53" stroke="#f4f1ea" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-12.5" cy="-54" r="3" fill="#f4f1ea" stroke="${INK}" stroke-width="1.6"/><circle cx="12.5" cy="-54" r="3" fill="#f4f1ea" stroke="${INK}" stroke-width="1.6"/>`:'';
  const avental=o.avental?`<path d="M-8 -16 H8 L9 0 H-9 Z" fill="${o.avental}" stroke="${INK}" stroke-width="1.4"/>`:'';
  const xadrez=o.xadrez?`<path d="M-11 -16 Q0 -10 11 -16 L10 -11 Q0 -6 -10 -11 Z" fill="#c25a6c" stroke="${INK}" stroke-width="1.6"/>`:'';
  const olhos=olhosFechados?`<path d="M-7 -29.5 q2.4 2 4.8 0 M2.2 -29.5 q2.4 2 4.8 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    :`<ellipse cx="-4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><ellipse cx="4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><circle cx="-4" cy="-30.3" r=".6" fill="#fff"/><circle cx="5.2" cy="-30.3" r=".6" fill="#fff"/>`;
  return `<g transform="scale(${s})"><ellipse cx="0" cy="1" rx="13" ry="4" fill="rgba(60,50,30,.22)"/>
    <path d="M9 -4 C20 -4 22 -14 17 -20" stroke="${INK}" stroke-width="7.5" fill="none" stroke-linecap="round"/>
    <path d="M9 -4 C20 -4 22 -14 17 -20" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${capa}
    <ellipse cx="0" cy="-10" rx="12" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="-5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="5" cy="-1" rx="4" ry="2.6" fill="${c}" stroke="${INK}" stroke-width="1.6"/>
    ${xadrez}${avental}${cachecol}
    <path d="M-11 -33 L-10 -46 L-2 -38 Z M11 -33 L10 -46 L2 -38 Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-9 -36 L-9 -42 L-5 -38 Z M9 -36 L9 -42 L5 -38 Z" fill="#f4b6b6"/>
    <ellipse cx="0" cy="-29" rx="13" ry="11" fill="${c}" stroke="${INK}" stroke-width="2"/>
    ${listras}${olhos}${oculos}
    <ellipse cx="-8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/><ellipse cx="8" cy="-25" rx="2.6" ry="1.5" fill="#f4a6a6" opacity=".85"/>
    <path d="M-2 -25.5 q1 1.4 2 0 q1 1.4 2 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${chapeu}${coroa}${bufao}${antenas}</g>`;
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
function bCafe(f,n){ // cafeteria com toldo rosa, mesinha com maracujá e morango e um cheesecake
  let toldo=''; for(let i=0;i<6;i++) toldo+=`<path d="M${-36+i*12} -50 h12 l1 12 h-14 Z" fill="${i%2?'#fff5f5':'#e3798a'}"/>`;
  return `${sombra(60,13)}
   ${f>=2?`<g transform="translate(-42,-4)"><path d="M-14 0 V-28 H14 V0 Z" fill="#f7e6e0" ${S}/><path d="M-20 -26 L0 -46 L20 -26 Z" fill="#c25a6c" ${S}/><rect x="-5" y="-20" width="10" height="10" rx="2" fill="${jan(n)}" ${S}/></g>`:''}
   <path d="M-34 0 V-48 H34 V0 Z" fill="#f7e6e0" ${S}/>
   <path d="M-8 0 V-26 H8 V0 Z" fill="#b98a5e" ${S}/><circle cx="4" cy="-13" r="1.3" fill="${INK}"/>
   <circle cx="-20" cy="-24" r="9" fill="${jan(n)}" ${S}/><path d="M-20 -33 v18 M-29 -24 h18" stroke="${INK}" stroke-width="1.2"/>
   <rect x="13" y="-34" width="14" height="16" rx="2" fill="${jan(n)}" ${S}/>
   <path d="M-40 -48 L0 -82 L40 -48 Z" fill="#c25a6c" ${S}/><rect x="20" y="-94" width="10" height="24" rx="2" fill="#d9b48a" ${S}/>
   ${toldo}<path d="M-36 -50 H36 L37 -38 H-37 Z" fill="none" ${S}/>
   <g transform="translate(0,-62)"><circle r="10" fill="#fbf3e3" ${S}/><path d="M-5 -3 H5 L4 5 H-4 Z" fill="#c99a6b" stroke="${INK}" stroke-width="1.4"/><path d="M5 -1 q4 0 3 3" stroke="${INK}" stroke-width="1.4" fill="none"/></g>
   <g transform="translate(44,8)"><ellipse cx="0" cy="-12" rx="16" ry="5" fill="#fbf3e3" ${S}/><path d="M0 -8 V2 M-8 2 H8" stroke="${INK}" stroke-width="2"/>
     <path d="M-10 -26 h6 l-1 10 h-4 Z" fill="#f2c14e" stroke="${INK}" stroke-width="1.4"/><path d="M-7 -26 l2 -6" stroke="#e3798a" stroke-width="1.6"/>
     <path d="M4 -26 h6 l-1 10 h-4 Z" fill="#f2a7b8" stroke="${INK}" stroke-width="1.4"/><path d="M7 -26 l2 -6" stroke="#86a86b" stroke-width="1.6"/>
     ${f>=1?`<path d="M-3 -15 l6 0 l-3 -5 Z" fill="#fff4dc" stroke="${INK}" stroke-width="1"/><circle cx="0" cy="-21" r="1.8" fill="#c2185b"/>`:''}</g>`;
}
function bCinema(f,n){ // cinema ao ar livre: telão, bancos e cabine do projetor
  const luzes=f>=1?[...Array(9)].map((_,i)=>`<circle cx="${-46+i*11.5}" cy="-104" r="2.6" fill="${n?'#ffd36b':['#e3798a','#f2c14e','#86afcf'][i%3]}" stroke="${INK}" stroke-width=".8"/>`).join(''):'';
  return `${sombra(66,14)}
   <path d="M-48 -40 V-104 M48 -40 V-104" stroke="#8a6a4e" stroke-width="5"/>
   <rect x="-52" y="-102" width="104" height="58" rx="3" fill="#f3f1ea" ${S}/>
   <rect x="-46" y="-96" width="92" height="46" fill="#2b2440" />
   ${luzes}
   <g transform="translate(0,-18)"><rect x="-40" y="-6" width="80" height="8" rx="3" fill="#c25a6c" ${S}/><path d="M-36 2 v6 M36 2 v6" stroke="${INK}" stroke-width="2"/></g>
   <g transform="translate(0,0)"><rect x="-44" y="-6" width="88" height="8" rx="3" fill="#c25a6c" ${S}/><path d="M-40 2 v6 M40 2 v6" stroke="${INK}" stroke-width="2"/></g>
   ${f>=2?`<g transform="translate(62,-2)"><path d="M-12 0 V-26 H12 V0 Z" fill="#efe2c8" ${S}/><path d="M-16 -24 L0 -38 L16 -24 Z" fill="#a07bb7" ${S}/><circle cx="0" cy="-14" r="4" fill="${jan(n)}" ${S}/></g>`:''}`;
}
function bBalao(f,n){ // balão de viagem feito com a nave
  const listras=['#b9dc4c','#f2a7b8','#b9dc4c','#f2a7b8','#b9dc4c'];
  return `${sombra(30,8)}
   <g transform="translate(0,-10)">
    <path d="M-40 -96 C-44 -150 44 -150 40 -96 C38 -78 18 -62 10 -54 H-10 C-18 -62 -38 -78 -40 -96 Z" fill="#b9dc4c" ${S}/>
    ${listras.map((c,i)=>`<path d="M${-30+i*15} -138 C${-34+i*15} -110 ${-22+i*11} -78 ${-8+i*4} -56" stroke="${c==='#b9dc4c'?'#9cc63a':'#f2a7b8'}" stroke-width="7" fill="none" opacity=".8"/>`).join('')}
    <path d="M-40 -96 C-44 -150 44 -150 40 -96 C38 -78 18 -62 10 -54 H-10 C-18 -62 -38 -78 -40 -96 Z" fill="none" ${S}/>
    <path d="M-10 -54 L-16 -30 M10 -54 L16 -30" stroke="${INK}" stroke-width="1.4"/>
    <ellipse cx="0" cy="-26" rx="22" ry="7" fill="#c8ccd2" ${S}/><path d="M-14 -28 C-14 -40 14 -40 14 -28 Z" fill="#dfe8f0" ${S}/>
    ${[-12,-4,4,12].map(x=>`<circle cx="${x}" cy="-24" r="1.6" fill="${n?'#ffd36b':'#f2c14e'}"/>`).join('')}
    ${f>=1?`<path d="M-30 -84 L-50 -60 M30 -84 L50 -60" stroke="${INK}" stroke-width="1"/><path d="M-50 -60 l6 6 l-8 2 Z M50 -60 l-6 6 l8 2 Z" fill="#e3798a"/>`:''}
   </g>
   <path d="M-6 2 L0 -10 L6 2" stroke="#a07a55" stroke-width="3" fill="none"/>`;
}
function bObservatorio(f,n){ // torre redonda com cúpula e telescópio
  const est=[[-60,-110],[52,-118],[70,-80],[-74,-70],[-30,-122]].map((p,i)=>`<path d="M${p[0]} ${p[1]-4} l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill="${n?'#fff4b0':'#f2d98c'}" opacity="${f>=1||i<2?1:0}"/>`).join('');
  return `${sombra(54,13)}${est}
   <path d="M-30 0 V-56 H30 V0 Z" fill="#e4dccf" ${S}/>
   <path d="M-30 -20 H30 M-30 -40 H30" stroke="#cfc4b4" stroke-width="2"/>
   <path d="M-8 0 V-24 A8 8 0 0 1 8 -24 V0 Z" fill="#6b6f8f" ${S}/>
   <rect x="14" y="-36" width="10" height="10" rx="5" fill="${jan(n)}" ${S}/>
   <path d="M-36 -56 C-36 -98 36 -98 36 -56 Z" fill="#6b7aa6" ${S}/>
   <path d="M-6 -94 L6 -94 L6 -58 L-6 -58 Z" fill="#3d4466" opacity=".55"/>
   <path d="M-20 -62 C-18 -80 -8 -88 0 -90" stroke="#8e9cc6" stroke-width="3" fill="none" stroke-linecap="round"/>
   <g transform="translate(4,-84) rotate(-34)"><rect x="-4" y="-34" width="10" height="36" rx="3" fill="#c9a053" ${S}/><rect x="-6" y="-38" width="14" height="7" rx="2" fill="#e9b24f" ${S}/></g>
   ${f>=1?`<g transform="translate(-48,4)"><path d="M-10 0 L0 -26 L10 0" fill="none" stroke="#8a6a4e" stroke-width="3"/><circle cx="0" cy="-30" r="7" fill="#f2c14e" ${S}/><path d="M-3 -32 q3 -3 6 0" stroke="#fff" stroke-width="1.4" fill="none"/></g>`:''}
   ${f>=2?`<g transform="translate(46,2)"><rect x="-12" y="-20" width="24" height="20" rx="3" fill="#f5efe3" ${S}/><path d="M-8 -14 h16 M-8 -8 h12" stroke="#86afcf" stroke-width="2"/><circle cx="6" cy="-30" r="5" fill="#b9dc4c" ${S}/></g>`:''}`;
}
function bBiblioteca(f,n){ // casarão de tijolinho com estante na janela
  const livros=['#e3798a','#86afcf','#f2c14e','#86a86b','#a07bb7','#e3798a'];
  return `${sombra(60,13)}
   ${f>=2?`<g transform="translate(50,0)"><path d="M-14 0 V-40 H14 V0 Z" fill="#c9806a" ${S}/><path d="M-18 -38 L0 -58 L18 -38 Z" fill="#5f824b" ${S}/><rect x="-5" y="-28" width="10" height="12" rx="2" fill="${jan(n)}" ${S}/></g>`:''}
   <path d="M-40 0 V-58 H40 V0 Z" fill="#d8977e" ${S}/>
   ${[...Array(5)].map((_,i)=>`<path d="M-40 ${-10-i*10} H40" stroke="#c9806a" stroke-width="1.4"/>`).join('')}
   <path d="M-10 0 V-30 A10 10 0 0 1 10 -30 V0 Z" fill="#8a6a4e" ${S}/>
   <rect x="-34" y="-46" width="18" height="20" rx="2" fill="${jan(n)}" ${S}/>${livros.slice(0,4).map((c,i)=>`<rect x="${-33+i*4.2}" y="-38" width="3.6" height="11" fill="${c}"/>`).join('')}
   <rect x="16" y="-46" width="18" height="20" rx="2" fill="${jan(n)}" ${S}/>${livros.slice(2).map((c,i)=>`<rect x="${17+i*4.2}" y="-36" width="3.6" height="9" fill="${c}"/>`).join('')}
   <path d="M-48 -56 L0 -96 L48 -56 Z" fill="#5f824b" ${S}/><path d="M-30 -62 L0 -86" stroke="#86a86b" stroke-width="3" stroke-linecap="round"/>
   <rect x="22" y="-108" width="10" height="28" rx="2" fill="#c9806a" ${S}/>
   <g transform="translate(0,-72)"><circle r="9" fill="#fbf3e3" ${S}/><path d="M-5 -2 C-2 -4 0 -3 0 -1 C0 -3 2 -4 5 -2 V4 C2 2 0 3 0 4 C0 3 -2 2 -5 4 Z" fill="#c25a6c"/></g>
   ${f>=1?`<g transform="translate(-54,4)"><rect x="-10" y="-18" width="20" height="18" rx="2" fill="#c99a6b" ${S}/>${livros.slice(0,3).map((c,i)=>`<rect x="${-8+i*5.4}" y="-15" width="4.6" height="12" fill="${c}"/>`).join('')}</g>`:''}`;
}
function bPomar(f,n){ // pomar: treliça de maracujá, canteiro de morango e uma casinha de ferramentas
  const morangos=[[-30,6],[-18,10],[-6,6],[6,10],[18,6],[30,10]].map(p=>`<path d="M${p[0]} ${p[1]} c-5 -1 -6 -8 0 -9 c6 1 5 8 0 9 Z" fill="#e3606e" stroke="${INK}" stroke-width="1"/><path d="M${p[0]-3} ${p[1]-9} l3 -2 l3 2" stroke="#5f824b" stroke-width="1.4" fill="none"/>`).join('');
  const frutas=[[-28,-48],[-10,-56],[8,-50],[26,-56],[-18,-34],[16,-36]].slice(0,f>=1?6:4).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#a07bb7" stroke="${INK}" stroke-width="1.2"/><circle cx="${p[0]-1.5}" cy="${p[1]-1.5}" r="1.2" fill="#fff" opacity=".6"/>`).join('');
  return `${sombra(62,14)}
   <ellipse cx="0" cy="6" rx="46" ry="12" fill="#a37a55" ${S}/>${morangos}
   <path d="M-40 -6 V-70 M40 -6 V-70 M-40 -70 H40 M-40 -48 H40 M-40 -26 H40 M-20 -6 V-70 M0 -6 V-70 M20 -6 V-70" stroke="#c99a6b" stroke-width="3"/>
   <path d="M-44 -66 C-30 -80 -10 -62 0 -72 C12 -82 30 -64 44 -70 C38 -50 20 -60 6 -46 C-8 -34 -26 -52 -44 -40 Z" fill="#86a86b" ${S}/>
   <path d="M-36 -30 C-28 -40 -18 -26 -10 -34 M10 -32 C18 -40 28 -28 36 -34" stroke="#5f824b" stroke-width="3" fill="none" stroke-linecap="round"/>
   ${frutas}
   ${[[-32,-60],[14,-64]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fbf3e3" stroke="${INK}" stroke-width="1"/><circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#a07bb7"/>`).join('')}
   ${f>=2?`<g transform="translate(-60,2)"><path d="M-14 0 V-26 H14 V0 Z" fill="#efe2c8" ${S}/><path d="M-18 -24 L0 -40 L18 -24 Z" fill="#e3606e" ${S}/><path d="M-4 0 V-14 H4 V0" fill="#a37a55" ${S}/></g>`:''}
   ${f>=1?`<g transform="translate(56,4)"><path d="M-10 0 L-8 -14 H8 L10 0 Z" fill="#c99a6b" ${S}/><circle cx="-3" cy="-17" r="4" fill="#f2c14e" ${S}/><circle cx="4" cy="-17" r="4" fill="#e3606e" ${S}/></g>`:''}`;
}
function bCasinha(f,n){ // casa na árvore: tronco grosso, casinha no alto, escada e varal
  return `${sombra(62,14)}
   <path d="M-16 0 C-14 -20 -14 -40 -10 -56 H10 C14 -40 14 -20 16 0 Z" fill="#a07a55" ${S}/>
   <path d="M-16 0 C-24 2 -30 4 -34 2 M16 0 C24 2 30 4 34 2" stroke="#a07a55" stroke-width="6" stroke-linecap="round"/>
   <path d="M-4 -10 q4 -6 8 0" stroke="#8a6a4e" stroke-width="2" fill="none"/>
   <path d="M-60 -60 C-74 -96 -40 -128 -6 -118 C20 -138 66 -116 62 -82 C76 -66 60 -44 36 -50 C10 -40 -36 -40 -60 -60 Z" fill="#9cc27c" ${S}/>
   <path d="M-34 -50 H34 V-56 H-34 Z" fill="#c99a6b" ${S}/>
   <path d="M-26 -56 V-88 H26 V-56 Z" fill="#fbf3e3" ${S}/>
   <path d="M-32 -86 L0 -110 L32 -86 Z" fill="#c25a6c" ${S}/>
   <rect x="-18" y="-80" width="12" height="11" rx="2" fill="${jan(n)}" ${S}/>
   <path d="M4 -56 V-74 A6 6 0 0 1 16 -74 V-56 Z" fill="#a37a55" ${S}/>
   <path d="M2 -98 C-1 -101 -4 -98 0 -94 L2 -92 L4 -94 C8 -98 5 -101 2 -98 Z" fill="#e3798a"/>
   <rect x="16" y="-124" width="9" height="22" rx="2" fill="#d9b48a" ${S}/>
   <path d="M30 -50 L40 0 M42 -50 L52 0 M32 -40 H44 M34 -30 H46 M36 -20 H48 M38 -10 H50" stroke="#c99a6b" stroke-width="2.6" stroke-linecap="round"/>
   ${f>=1?`<g transform="translate(-50,0)"><path d="M-14 0 V-34 M14 0 V-34" stroke="#a07a55" stroke-width="3"/><path d="M-14 -32 Q0 -24 14 -32" stroke="${INK}" stroke-width="1.2" fill="none"/><path d="M-10 -30 v8 h6 v-7 Z" fill="#b9dc4c" stroke="${INK}" stroke-width="1"/><path d="M2 -28 v9 h7 v-8 Z" fill="#f2a7b8" stroke="${INK}" stroke-width="1"/></g>`:''}
   ${f>=2?`<g transform="translate(-24,-56)"><path d="M0 0 V20 M-8 0 V18 M8 0 V18" stroke="${INK}" stroke-width="1"/><rect x="-10" y="18" width="20" height="4" rx="2" fill="#e3798a" stroke="${INK}" stroke-width="1.2"/></g>`:''}`;
}
const CONSTRUCAO={sopa:bSopa,padaria:bFeira,horta:bEstufa,lenha:bSerraria,pesca:bLago,violao:bCoreto,soneca:bCogumelo,cafe:bCafe,cinema:bCinema,balao:bBalao,observatorio:bObservatorio,biblioteca:bBiblioteca,pomar:bPomar,casinha:bCasinha};

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
    case 'cerejeira': return arvoreSVG(0,0,'verao').replace('fill="#8fb874"','fill="#f6c3cf"').replace('stroke="#6f9a58"','stroke="#e3909f"').replace('fill="#6f9a58"','fill="#e3909f"');
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
const BOX={tree:[-40,-84,80,94],bal:[-104,-170,200,190],cat:[-28,-62,56,68],catLie:[-34,-34,66,40],bld:[-104,-126,200,160],camp:[-96,-60,192,100],castle:[-150,-200,300,270],decor:[-40,-70,80,80],sign:[-30,-54,60,62],scaf:[-50,-72,100,82]};
function sprArvore(t){ return sprite('t'+t.tipo+t.cor+ESTACAO,BOX.tree,()=>arvoreSVG(t.tipo,t.cor)); }
function sprGato(o,fech){ const k='c'+o.cor+o.det+(o.listras?1:0)+(o.chapeu?1:0)+(o.chapeuVerde?1:0)+(o.xadrez?1:0)+(o.coroa?1:0)+(o.capacete?1:0)+(o.bufao?1:0)+(o.antenas?1:0)+(o.cachecol||'')+(o.oculos?1:0)+(o.avental||'')+(fech?'z':''); return sprite(k,BOX.cat,()=>gatoSVG(o,1,fech)); }
function sprDeitado(o){ return sprite('L'+o.cor,BOX.catLie,()=>gatoDeitadoSVG(o)); }
const boxDe=id=>(id==='balao'||id==='casinha')?BOX.bal:BOX.bld;
function sprConstrucao(id,f,n){ return sprite(`b${id}${f}${n?'n':''}`,boxDe(id),()=>CONSTRUCAO[id](f,n)); }
function sprHeroi(q,disf,fech){ return sprite(`h${q}${disf?1:0}${fech?'z':''}`,ALIEN_BOX,()=>alienSVG(q,disf,fech)); }
function sprMural(){ return sprite('mural',BOX.decor,()=>`<ellipse cx="0" cy="2" rx="26" ry="6" fill="rgba(60,50,30,.22)"/><path d="M-24 0 V-44 M24 0 V-44" stroke="#a07a55" stroke-width="4"/><rect x="-28" y="-50" width="56" height="34" rx="3" fill="#c99a6b" ${S}/><rect x="-23" y="-46" width="16" height="11" fill="#d3ecf2" stroke="${INK}" stroke-width="1" transform="rotate(-6 -15 -40)"/><rect x="-4" y="-46" width="14" height="12" fill="#fbe3ea" stroke="${INK}" stroke-width="1"/><rect x="12" y="-44" width="12" height="10" fill="#fffaf0" stroke="${INK}" stroke-width="1" transform="rotate(8 18 -39)"/><rect x="-14" y="-31" width="16" height="11" fill="#f8e6c4" stroke="${INK}" stroke-width="1" transform="rotate(4 -6 -26)"/><path d="M-30 -50 L0 -60 L30 -50" fill="#9b4a58" ${S}/>`); }
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
     <button class="vl-round" id="vl-clima" title="clima" onclick="vlClima()">${ic('sol')}</button>
     <button class="vl-round" id="vl-som" title="música" onclick="vlSom()">${ic('music')}</button>
     <button class="vl-round" title="fechar" onclick="fecharJogo()">${ic('close')}</button>
   </div>
   <button class="vl-passo" id="vl-passo" onclick="vlPasso()"></button>
   <div class="vl-hint" id="vl-hint">arraste pra passear · toque nas casinhas e nos gatinhos</div>
   <div class="vl-nav">
     <button onclick="vlPainel('rainha')">${ic('book')}história<span class="vl-dot" id="vl-dot-rainha"></span></button>
     <button onclick="vlPainel('gatos')">${ic('paw')}gatinhos</button>
     <button onclick="vlPainel('mimos')">${ic('heart')}mimos</button>
     <button onclick="vlConquistas()">${ic('trophy')}troféus<span class="vl-dot" id="vl-dot-conq"></span></button>
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
  const k=[Math.round(Math.max(R,Ralvo)),vila.castelo,NOITE>.5?1:0,(proximaEstacao()||{}).id,RES,ESTACAO].join('|');
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
  if(perfil && (vila.cap.includes(1)||capDisponivel(2))) ents.push({tipo:'mural',x:542,y:584,ax:542,ay:584,act:'mural',box:[-30,-62,60,66]});
  // gatinhos: mantém posições dos que já existem
  const antigos=new Map(cats.map(c=>[c.chave,c]));
  cats.length=0;
  ESTACOES.forEach(e=>{ if(estAberta(e.id)){ const k='e'+e.id; const casa={x:e.x+e.work.dx,y:e.y+e.work.dy}; cats.push(antigos.get(k)||novoGato(k,{...e.gato,estacao:e.id,casa,falas:e.falas,acao:e.work.acao,pers:e.pers})); } });
  vila.adotados.forEach((a,i)=>{ const k='a'+i+a.nome; const c=CORES_GATOS[a.c]; cats.push(antigos.get(k)||novoGato(k,{nome:a.nome,cor:c[0],det:c[1],listras:c[2],falas:JEITOS[a.j||0].falas,pers:JEITOS[a.j||0].p})); });
  const re=(k,o,pos)=>{ const c=antigos.get(k); if(c){ c.o=o; return c; } const g=novoGato(k,o); if(pos){ g.x=pos.x; g.y=pos.y; } return g; };
  if(vila.castelo>=1){ const semCoroa=leu('rainha'); cats.push(re('rainha',{nome:'Rainha Mimosa',cor:'#fffdf8',det:'#efe2d4',coroa:semCoroa?0:1,antenas:semCoroa?1:0,capa:1,parado:1,falas:falasRainha(),escala:1.15},{x:CASTELO_POS.x+34,y:CASTELO_POS.y+28})); }
  if(perfil){
    const dono=visitando?outroDe(perfil):perfil, hosp=outroDe(dono);
    cats.push(re('eu',{nome:HEROIS[dono].nome,heroi:dono,disf:!revelado(),falas:visitando?falasParceiro():falasEu(),vel:30},{x:CX-40,y:CY+30}));
    if(visitando || (leu('feira') && parceiro)) cats.push(re('par',{nome:HEROIS[hosp].nome,heroi:hosp,disf:!revelado(),falas:visitando?falasEu():falasParceiro(),parceiro:visitando?0:1},{x:CX+50,y:CY+26}));
  }
  if(ESTACAO==='inverno') cats.forEach((c,i)=>{ if(!c.o.heroi&&!c.o.coroa&&!c.o.cachecol) c.o={...c.o,cachecol:['#c25a6c','#86afcf','#e9b24f','#86a86b'][i%4]}; });
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
    if(c.o.parado) return;
    if(c.alvo){
      const dx=c.alvo.x-c.x, dy=c.alvo.y-c.y, dist=Math.hypot(dx,dy), v=(c.vel||c.o.vel||24)*dt;
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
  for(const g of cats) if(g.pedido&&!g.fala) desenharPedido(c,g);
  desenharSeta(c);
  for(const g of cats) if(g.fala) desenharFala(c,g);
  c.setTransform(DPR,0,0,DPR,0,0); desenharClima(c);
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
      else desenharSprite(c,sp,e.ax,e.id==='balao'?e.ay+Math.sin(tempo*1.2)*3:e.ay);
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
    case 'mural': desenharSprite(c,sprMural(),e.ax,e.ay); break;
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
  if(e.id==='cinema'){ const f=faseDe(estLvl('cinema')); c.save(); c.beginPath(); c.rect(e.x-46,e.y-96,92,46); c.clip();
    const k=Math.floor(tempo*1.2)%4, cores=[['#ff6fa8','#6fd6ff'],['#ffd36b','#ff6fa8'],['#6fd6ff','#b9dc4c'],['#f2a7b8','#ffd36b']][k];
    c.globalAlpha=.85; c.fillStyle=cores[0]; c.fillRect(e.x-46+((tempo*20)%40),e.y-90,22,30); c.fillStyle=cores[1]; c.fillRect(e.x-10,e.y-84+Math.sin(tempo*2)*4,30,24);
    c.fillStyle='#fff'; c.globalAlpha=.25+Math.random()*.1; c.fillRect(e.x-46,e.y-96,92,46); c.restore(); c.globalAlpha=1; }
  if(e.id==='observatorio'&&NOITE>.3){ c.globalAlpha=.25+.2*Math.sin(tempo*2); c.fillStyle='#fff6c8'; c.beginPath(); c.moveTo(e.x+6,e.y-90); c.lineTo(e.x+90,e.y-210); c.lineTo(e.x+120,e.y-190); c.closePath(); c.fill(); c.globalAlpha=1; }
  if(e.id==='casinha'){ const k=((tempo*.3)%1); c.globalAlpha=k<.2?k*5:1-k; c.fillStyle='#e3798a'; const hx=e.x+20+k*14, hy=e.y-120-k*30; c.beginPath(); c.moveTo(hx,hy+3); c.bezierCurveTo(hx-6,hy-2,hx-3,hy-7,hx,hy-3); c.bezierCurveTo(hx+3,hy-7,hx+6,hy-2,hx,hy+3); c.fill(); c.globalAlpha=1; }
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
  const sp=o.heroi?sprHeroi(o.heroi,o.disf,g.blink<0):sprGato(o,g.blink<0); if(!sp) return;
  let bob=0, rot=0, sx=1, sy=1;
  if(andando){ bob=-Math.abs(Math.sin(g.fase*10))*3; rot=Math.sin(g.fase*10)*.05; }
  else if(trab){ bob=-Math.abs(Math.sin(g.fase*5))*1.6; sy=1+Math.sin(g.fase*5)*.02; }
  else sy=1+Math.sin(g.fase*2.6)*.025;
  if(g.pulo>0) bob-=Math.sin(g.pulo*Math.PI)*14;
  const esc=o.escala||(o.visit?.78:o.heroi?.86:.82);
  c.save(); c.translate(g.x,g.y+bob); c.rotate(rot); c.scale(esc*g.dir,esc*sy*(2-sx)); c.drawImage(sp.img,sp.x,sp.y,sp.w,sp.h); c.restore();
  if(trab) ferramenta(c,g);
  if(o.parceiro && parceiroOnline()){ c.fillStyle='#86a86b'; c.beginPath(); c.arc(g.x+14,g.y-50,4,0,6.283); c.fill(); c.strokeStyle='#fbf7ef'; c.lineWidth=1.6; c.stroke(); }
  if(o.heroi && !g.fala && tempo%9<.02) {}
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
  } else if(a==='servir'){ const b=Math.sin(t*3)*1.5; c.fillStyle='#d8dde3'; c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.ellipse(x+12,y-26+b,10,3,0,0,6.283); c.fill(); c.stroke();
    c.fillStyle='#f2c14e'; c.fillRect(x+5,y-36+b,5,9); c.strokeRect(x+5,y-36+b,5,9); c.fillStyle='#f2a7b8'; c.fillRect(x+13,y-36+b,5,9); c.strokeRect(x+13,y-36+b,5,9);
  } else if(a==='projetar'){ c.globalAlpha=.18+Math.random()*.06; c.fillStyle='#fff6c8'; c.beginPath(); c.moveTo(x+6,y-22); c.lineTo(x+60,y-84); c.lineTo(x+86,y-60); c.closePath(); c.fill(); c.globalAlpha=1;
    c.fillStyle='#5c5550'; c.fillRect(x+2,y-28,12,9); c.beginPath(); c.arc(x+5,y-31,4,0,6.283); c.arc(x+12,y-31,4,0,6.283); c.fill();
  } else if(a==='mapa'){ const k=(Math.sin(t*1.5)+1)/2; c.fillStyle='#fffaf0'; c.strokeStyle=INK; c.lineWidth=1.2; c.fillRect(x-14,y-30,18+k*6,13); c.strokeRect(x-14,y-30,18+k*6,13); c.strokeStyle='#e3798a'; c.beginPath(); c.moveTo(x-11,y-21); c.lineTo(x-4,y-26); c.lineTo(x+4+k*4,y-22); c.stroke();
  } else if(a==='olhar'){ // lunetinha pro céu
    c.save(); c.translate(x+8,y-24); c.rotate(-.9+Math.sin(t*.8)*.12); c.fillStyle='#c9a053'; c.strokeStyle=INK; c.lineWidth=1.4; c.fillRect(-2,-16,5,16); c.strokeRect(-2,-16,5,16); c.fillStyle='#e9b24f'; c.fillRect(-3,-19,7,4); c.strokeRect(-3,-19,7,4); c.restore();
    if(Math.sin(t*2.2)>.95){ c.fillStyle='#fff4b0'; c.beginPath(); c.arc(x+30,y-70,2.4,0,6.283); c.fill(); }
  } else if(a==='ler'){ // livrinho aberto, virando página
    const k=(Math.sin(t*1.4)+1)/2; c.fillStyle='#fffaf0'; c.strokeStyle=INK; c.lineWidth=1.2;
    c.beginPath(); c.moveTo(x-10,y-20); c.lineTo(x,y-17); c.lineTo(x,y-27); c.lineTo(x-10,y-30); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x+10,y-20); c.lineTo(x,y-17); c.lineTo(x,y-27); c.lineTo(x+10,y-30); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#c25a6c'; c.fillRect(x-1,y-28,2,11);
    if(k>.9){ c.beginPath(); c.moveTo(x,y-27); c.lineTo(x+6-12*((k-.9)*10),y-31); c.lineTo(x,y-17); c.closePath(); c.fillStyle='#fffaf0'; c.fill(); c.stroke(); }
  } else if(a==='colher'){ // cestinha + fruta subindo
    c.fillStyle='#c99a6b'; c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.ellipse(x-14,y-8,8,4,0,0,6.283); c.fill(); c.stroke(); c.fillRect(x-22,y-8,16,7); c.strokeRect(x-22,y-8,16,7);
    const k=(t*.9)%1; c.fillStyle=Math.floor(t*.9)%2?'#a07bb7':'#e3606e'; c.beginPath(); c.arc(x-14,y-30+k*20,3.4,0,6.283); c.fill(); c.stroke();
  } else if(a==='varrer'){ // vassourinha
    c.save(); c.translate(x+10,y-14); c.rotate(Math.sin(t*4)*.45); c.strokeStyle='#a07a55'; c.lineWidth=2.4; c.beginPath(); c.moveTo(0,-14); c.lineTo(0,10); c.stroke(); c.fillStyle='#e8c27a'; c.strokeStyle=INK; c.lineWidth=1.2; c.beginPath(); c.moveTo(-5,8); c.lineTo(5,8); c.lineTo(7,18); c.lineTo(-7,18); c.closePath(); c.fill(); c.stroke(); c.restore();
    if(Math.random()<.04) fumacas.push({x:x+12,y:y+2,r:2,vida:1,t:0,vx:1});
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
  for(const g of gs){ if(Math.abs(wx-g.x)<17 && wy<g.y+6 && wy>g.y-46){ Som.blip(); if(g.o.visit) pegarVisitante(); else if(g.pedido&&!visitando) abrirPedido(g); else carinhoGato(g); return; } }
  const es=ents.filter(e=>e.act).sort((a,b)=>b.y-a.y);
  for(const e of es){ const [bx,by,bw,bh]=e.box; if(wx>=e.ax+bx&&wx<=e.ax+bx+bw&&wy>=e.ay+by&&wy<=e.ay+by+bh){ Som.blip(); acao(e); return; } }
}
function acao(e){
  const [tipo,arg]=e.act.split(':');
  if(visitando&&tipo!=='est'){ toast(`isso é da vila de ${HEROIS[outroDe(perfil)].nome}: só dá pra olhar`); return; }
  if(tipo==='est'){ e.squish=1; abrirEstacaoSheet(arg); }
  else if(tipo==='abrir') sheetConstruir(arg);
  else if(tipo==='castelo') sheetCastelo();
  else if(tipo==='rainha') vlPainel('rainha');
  else if(tipo==='mural') sheetMural();
  else if(tipo==='praca') toast('a fogueira da praça ainda está apagada... abram mais construções');
}
function carinhoGato(g){
  g.pulo=1;
  if(visitando){ if(g.o.falas&&!g.fala) g.fala={txt:g.o.falas[Math.floor(Math.random()*g.o.falas.length)],t:3}; else ftxt(g.x,g.y-50,'♥','h'); return; }
  avancarTut(2);
  vila.stats.taps++; csDirty=true; progMissao('taps',1);
  if(g.o.estacao) prog[g.o.estacao]=Math.min(.999,(prog[g.o.estacao]||0)+.2);
  if(vila.stats.taps%10===0){ vila.coracoes++; ftxt(g.x,g.y-50,'+1 coração','h'); atualizarHud(); Som.chime(); }
  if(g.o.falas && (!g.fala) && (g.o.heroi||g.o.parado||Math.random()<.7)){ g.fala={txt:g.o.falas[Math.floor(Math.random()*g.o.falas.length)],t:3.2}; }
  else ftxt(g.x,g.y-50,['miau!','prr...','mrrp!','♥'][Math.floor(Math.random()*4)],'h');
}
function popBld(id){ const e=ents.find(x=>x.tipo==='bld'&&x.id===id); if(e) e.pop=1; }

/* ------------------------------------------------------------------
   LOOP
------------------------------------------------------------------ */
let raf=null, last=0, syncT=null, ceuT=null, visitT=null, qualidade=(navigator.hardwareConcurrency||4)<=4?.5:1, lentos=0;
window.abrirCozy=function(){
  montarDOM();
  if(!perfil){ $('game-overlay').classList.add('active'); $('arcade-wrap').style.display='none'; root.classList.add('on'); document.body.style.overflow='hidden'; redimensionar(); R=0; montarMundo(); focar(CX,CY-30,zoomInicial()); NOITE=noite(); desenhar(); setTimeout(()=>{ if(!perfil&&root.classList.contains('on')) desenhar(); },400); escolherPerfil(); return; }
  if(!refEu && fb) conectarPerfil();
  $('game-overlay').classList.add('active'); $('arcade-wrap').style.display='none'; root.classList.add('on');
  document.body.style.overflow='hidden'; csAberto=true;
  redimensionar();
  garantirMissoes();
  const elp=vila.lastTs?Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600):0;
  const ganho=elp>5?vilaRate()*elp:0;
  vila.lastTs=Date.now();
  NOITE=noite(); atualizarClima();
  if(CLIMA.tipo==='chuva') vila.stats.chuva++; if(NOITE>.5) vila.stats.noite++; if(FESTA) vila.stats.festa++;
  R=0; montarMundo(); atualizarHud();
  focar(CX,CY-30,zoomInicial());
  if(FESTA) setTimeout(()=>{ toast(`${FESTA.nome} a vila está em festa: produção ×2`); burstHearts(innerWidth/2,innerHeight/3,20); },1200);
  atualizarPasso(true);
  $('vl-som').classList.toggle('off',!Som.on);
  Som.start();
  if(ganho>=1) mostrarOffline(ganho,elp);
  else if(!vila.cap.includes(0)) setTimeout(()=>abrirCarta(0),700);
  last=0; raf=requestAnimationFrame(loop);
  syncT=setInterval(()=>{ if(csDirty){ escrever(); csDirty=false; } },5000);
  ceuT=setInterval(()=>{ NOITE=noite(); atualizarClima(); atualizarDots(); },5000);
  agendarVisitante();
  setTimeout(esconderDica,7000);
  atualizarDots();
};
window.pararCatLoop=function(){
  if(!csAberto) return;
  if(visitando) vlVoltarVisita();
  if(window.VilaCena) VilaCena.parar();
  csAberto=false; cancelAnimationFrame(raf); clearInterval(syncT); clearInterval(ceuT); clearTimeout(visitT);
  escrever(); csDirty=false; Som.stop();
  if(root){ root.classList.remove('on'); fecharSheet(); fecharModal(); }
  window.atualizarTagCozy();
};
document.addEventListener('visibilitychange',()=>{
  if(!csAberto) return;
  if(document.hidden){ escrever(); csDirty=false; Som.stop(); }
  else { if(!visitando){ const elp=Math.min((Date.now()-vila.lastTs)/1000,capHoras()*3600); if(elp>20){ const g=vilaRate()*elp; vila.moedas+=g; vila.stats.ganhos+=g; vila.lastTs=Date.now(); toast(`+${fmt(g)} moedas enquanto você estava fora`); } } atualizarClima(); last=0; Som.start(); }
});
window.addEventListener('pagehide',()=>{ if(csAberto) escrever(); });

let hudN=0, acc=0, conqN=0;
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
    if(visitando||!estAberta(e.id)) continue;
    prog[e.id]=(prog[e.id]||0)+dt/estCiclo(e.id);
    while(prog[e.id]>=1){ prog[e.id]-=1; produzir(e); mudou=true; }
  }
  const sb=$('vl-sheet-bar'); if(sb&&sb.dataset.id) sb.style.width=((prog[sb.dataset.id]||0)*100).toFixed(1)+'%';
  const agora=Date.now(); if(!visitando) for(const id in obras){ if(agora>=obras[id]) concluirObra(id); }
  moverGatos(dt);
  if(!visitando) atualizarPedidos(dt);
  atualizarChuva(dt);
  if(++conqN%120===0&&!visitando) checarConquistas();
  if(hudN%20===0) atualizarPasso();
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
  const taxa=ESTACAO==='outono'?.7:ESTACAO==='inverno'?.5:.35;
  if(!n && CLIMA.tipo!=='chuva' && Math.random()<dt*taxa){ const fx=$('vl-fx'); if(fx && fx.childElementCount<8){ const l=document.createElement('div'); l.className='vl-leaf'; l.style.left=(Math.random()*110)+'%'; l.style.animationDuration=(7+Math.random()*6)+'s';
    const cores={verao:['#b2cf8f','#9cc27c'],outono:['#e0a85a','#d98c4a','#c9b46a'],inverno:['#f2c94c','#e89ab8','#f2c94c'],primavera:['#f6c3cf','#f6c3cf','#b2cf8f']}[ESTACAO];
    const cor=cores[Math.floor(Math.random()*cores.length)];
    l.innerHTML=ESTACAO==='inverno'||ESTACAO==='primavera'?`<svg viewBox="0 0 20 20"><path d="M10 2 C14 6 14 10 10 18 C6 10 6 6 10 2 Z" fill="${cor}" stroke="${shade(cor,-.25)}" stroke-width="1.2"/></svg>`:`<svg viewBox="0 0 20 20"><path d="M2 18 C2 6 10 2 18 2 C18 10 14 18 2 18Z" fill="${cor}" stroke="${shade(cor,-.3)}" stroke-width="1.2"/></svg>`;
    fx.appendChild(l); setTimeout(()=>l.remove(),13500); } }
}
function produzir(e){
  let v=estValor(e.id), dobro=false;
  if(Math.random()<.02*perkLvl('sorte')){ v*=2; dobro=true; }
  vila.moedas+=v; vila.stats.ganhos+=v; vila.stats.producoes++; csDirty=true;
  progMissao('ganhos',v); progMissao('producoes',1);
  if(e.ciclo>=5||Math.random()<.5) ftxt(e.x,e.y-(e.id==='fogueira'?50:100),(dobro?'sorte! ':'')+'+'+fmt(v),'');
  if(e.id==='balao' && Math.random()<.3){ const falta=POSTAIS.filter(p=>!vila.postais.includes(p.id)); if(falta.length){ const p=falta[Math.floor(Math.random()*falta.length)]; vila.postais.push(p.id); csDirty=true; toast(`o balão voltou com um postal: ${p.nome}!`); Som.chime(); } }
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

/* vídeo do gatinho (as 8 primeiras) ou desenho da construção + gatinho (as novas, até chegar arte do Gemini) */
const COM_VIDEO=['sopa','padaria','horta','lenha','pesca','fogueira','violao','soneca','cafe'];
function midia(id,anim){
  if(COM_VIDEO.includes(id)) return anim?`<video src="gatos/${id}.mp4" poster="gatos/${id}.webp" muted loop playsinline autoplay></video>`:`<img src="gatos/${id}.webp" alt="" style="filter:saturate(.85)">`;
  const e=estDef(id), f=faseDe(Math.max(1,estLvl(id))), b=boxDe(id);
  return `<svg viewBox="${b[0]-10} ${b[1]} ${b[2]+20} ${b[3]+6}" style="width:100%;height:100%;background:radial-gradient(ellipse at 50% 85%,#dfeac4 0,#f5efe3 70%)">${CONSTRUCAO[id](f,false)}<g transform="translate(${e.work.dx},${e.work.dy})">${gatoSVG(e.gato,1)}</g></svg>`;
}
/* --- estação --- */
function abrirEstacaoSheet(id){
  if(visitando){ sheetVisita(id); return; }
  if(id==='sopa') avancarTut(0);
  const e=estDef(id), l=estLvl(id), pm=proxMarco(l), fase=faseDe(l);
  abrirSheet(`
    <div class="vl-video">${midia(id,true)}<span class="tag"><span class="vl-ic">${PROD[id]}</span>${e.gato.nome} trabalhando</span></div>
    <h2>${e.nome}</h2><div class="vl-sub">${e.gato.nome}, ${e.pers} · construção ${FASES[fase]} · nível <b id="vl-s-lvl">${l}</b>${marcoMult(l)>1?` · produção ×${marcoMult(l)}`:''}${bonusEst(id)>1?` · <b style="color:var(--rose-dark)">bônus agora ×${String(+bonusEst(id).toFixed(2)).replace('.',',')}</b>`:''}</div>
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
  vila.moedas-=c.custo; vila.est[id].lvl+=c.n; vila.stats.ups+=c.n; csDirty=true; progMissao('ups',c.n); avancarTut(1);
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
  abrirSheet(`<div class="vl-video">${midia(id,false)}<span class="tag">quem vai morar aqui?</span></div>
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
  vila.moedas-=e.abrir; csDirty=true; obras[id]=Date.now()+5000; if(id==='padaria') avancarTut(3);
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
    modal(`<svg viewBox="-150 -200 300 260" style="width:220px;height:190px">${casteloSVG(vila.castelo,false,true)}</svg><h2>${c.nome} restaurado!</h2><p class="vl-small" style="font-size:14px">a Rainha Mimosa mandou uma carta</p><button class="vl-btn rose" onclick="fecharModal();abrirCartaRainha(${vila.castelo-1})">ler carta</button>`);
    atualizarPasso(true);
    return;
  }
  vila.est[id]={lvl:1}; prog[id]=0; csDirty=true; escrever(); csDirty=false; avisarProgresso();
  Ralvo=raioAlvo(); montarMundo(); Som.fanfarra(); popBld(id);
  const e=estDef(id);
  burstHearts(innerWidth/2,innerHeight/2,22);
  modal(`<div class="vl-video" style="margin-bottom:8px">${midia(id,true)}</div><h2>${e.nome} abriu!</h2><p class="vl-small" style="font-size:14px">${e.gato.nome} voltou pra floresta e já está trabalhando${e.extra?'<br><b>'+e.extra+'</b>':''}</p><button class="vl-btn" onclick="fecharModal()">eba!</button>`);
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
  } else botao='<button class="vl-btn honey" onclick="vlPainel(\'rainha\',\'rainha\')">castelo completo · ler cartas</button>';
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
/* =====================================================================
   HISTÓRIA: GABRIX E NATALIX — dois gatos alienígenas disfarçados
   Cada um joga o seu save; alguns capítulos só acontecem quando os
   DOIS chegam lá (a feira e a chuva).
   ===================================================================== */
const HEROIS={g:{nome:'Gabrix',real:'Gabriel',pron:'ele'},n:{nome:'Natalix',real:'Natália',pron:'ela'}};
const outroDe=p=>p==='g'?'n':'g';
const HIST=[
 {id:'queda', t:'prólogo: a queda', premio:3, meta:{}, txt:{
  g:`a última coisa que eu lembro é o alarme da nave gritando e um monte de luz verde. depois, silêncio. acordei numa floresta cheia de árvores fofas e um cheiro de sopa no ar.

sou o Gabrix, da Academia Estelar de Veluma. e pelo jeito, o único que sobrou.

os gatos daqui não podem saber o que eu sou. passei pó de disfarce no pelo, escondi as antenas num gorro e... os óculos ficaram. ninguém desconfia de um gato de óculos, né?

pode não?`,
  n:`minha nave caiu bem no meio da noite. quando abri a escotilha, só tinha estrelas, árvores e um silêncio enorme.

sou a Natalix, da Academia Estelar de Veluma. procurei sinal de outra nave por horas. nada. sou a única.

passei o pó de disfarce, prendi as antenas embaixo da boina e deixei o cabelo solto pra cobrir o resto. de longe pareço uma gata normal. de perto... melhor ninguém chegar perto.`}},
 {id:'disfarce', t:'1. ninguém me vê', premio:3, meta:{ab:2}, txt:{
  g:`os gatos daqui são gentis. a Nuvem me dá sopa, o Toco me ensina a cortar lenha. eu faço todo mundo rir.

mas tem uma coisa estranha: quanto mais eu faço os outros rirem, mais eu sinto que ninguém me conhece de verdade. eles riem do gato engraçado de óculos. o Gabrix de verdade continua escondido embaixo do gorro.

às vezes olho pro céu e dá vontade de ir embora. só não sei pra onde.`,
  n:`hoje a Paçoca elogiou meu jeito de organizar as caixas. eu sorri, mas por dentro pensei: se ela soubesse...

é cansativo fingir o tempo todo. ninguém aqui sabe o que me faz rir de verdade, nem que eu fico brava quando me atraso, nem que eu choro vendo filme.

à noite eu subo na colina e fico olhando as estrelas. dá vontade de fugir. mas fugir pra onde, se eu nem sei mais de onde eu sou?`}},
 {id:'mural', t:'2. o mural de postais', premio:5, meta:{ab:3}, txt:{
  g:`na praça tem um mural onde os viajantes penduram cartões-postais. hoje apareceu um novo: um desenho do mar, com a legenda "lembrança do Rio das Estrelas".

quem desenhou assinou só com uma boina.

não resisti e escrevi embaixo uma piada sobre o tamanho das ondas. no dia seguinte tinha uma resposta: "hahahaha besta".

não sei quem é. mas faz tempo que eu não fico tão curioso.`,
  n:`pendurei um desenho do mar do Rio das Estrelas no mural da praça. ninguém nunca comenta nada lá.

hoje tinha uma piada escrita embaixo. uma piada boba... e eu ri sozinha no meio da praça, igual uma doida.

respondi "hahahaha besta". a letra dele é toda torta. e isso me lembrou alguém da academia: um menino engraçado que vivia num grupo diferente do meu.`}},
 {id:'feira', t:'3. a feira dos viajantes', premio:8, meta:{ab:4,junto:4}, txt:{
  g:`a Rainha anunciou a Feira dos Viajantes, com o show do Felco, o bufão mais engraçado do bosque. chamei os amigos e, num impulso, deixei um convite no mural pra dona da boina.

nunca que ela ia aceitar.

ela aceitou.

quando a vi, quase derrubei a pipoca: era a Natalix. da academia. desde a sexta órbita a gente estudava junto e nunca tinha conversado direito. ela ria das minhas piadas de longe. hoje riu de perto.`,
  n:`eu nunca aceito convite de desconhecido. mas a letra torta do mural me chamou pro show do Felco e eu... fui.

era o Gabrix. o menino engraçado da academia, com o mesmo cabelo bagunçado de sempre (mesmo disfarçado dá pra ver).

passei a noite pensando: se ele é da academia, será que ele também caiu aqui? será que ele também se esconde? não tive coragem de perguntar. mas rir do lado dele foi bom demais.`}},
 {id:'lua', t:'4. uma lua cheia por mês', premio:5, meta:{ab:5}, txt:{
  g:`tive que me mudar pra uma clareira do outro lado do bosque, pra estudar com os sábios do castelo. agora eu e a Natalix só nos vemos uma vez por mês, na lua cheia, na feira.

como amigos, claro.

mas reparei que ela guarda o lugar do meu lado. e que ela sempre pergunta "pode não?" quando quer alguma coisa e já sabe que eu vou dizer sim.`,
  n:`o Gabrix foi estudar longe. agora é uma lua cheia por mês.

eu conto os dias. não conto pra ninguém que conto os dias.

na última feira ele chegou com o cabelo uma bagunça e eu falei que parecia um ninho de passarinho. ele riu. eu também. e quando ele foi embora, o bosque ficou grande demais de novo.`}},
 {id:'pegou', t:'5. "você me pegou"', premio:5, meta:{cas:1}, txt:{
  g:`mandei uma carta por vagalume-correio, meio brincando: "Natalix, acho que você gosta de mim".

a resposta veio rapidinho, com a letra tremida: "você me pegou. que vergonha."

fiquei olhando pra carta um tempão. aí percebi uma coisa ainda mais estranha: eu também gosto dela. já faz tempo.`,
  n:`eu não acredito que ele perguntou assim, do nada, por carta!

escrevi "você me pegou, que vergonha" e escondi a cara na almofada a noite toda.

depois chegou outro vagalume: "então vamos ver uma história juntos. só nós dois. pode não?"

pode sim.`}},
 {id:'sombras', t:'6. o teatro de sombras', premio:8, meta:{ab:6}, txt:{
  g:`fomos no teatro de sombras do castelo. era uma história de terror, com um monstro de papel que aparecia do nada. ela se assustou e segurou minha pata. não soltou mais.

na saída ela estava tão linda que eu tentei dar um beijo. ela desviou e disse, sorrindo:

"no próximo."

voltei pra minha clareira flutuando. nem precisava de nave.`,
  n:`ele escolheu uma história de terror. eu sabia que ia me assustar e fui mesmo assim, porque era com ele.

segurei a pata dele no primeiro susto e fingi que foi sem querer. não foi.

quando ele tentou me beijar eu fiquei nervosa e disse "no próximo". e cumpri essa promessa na minha cabeça a semana inteira.`}},
 {id:'chuva', t:'7. amores expressos', premio:10, meta:{ab:7,cas:2,junto:7}, txt:{
  g:`dois meses depois, o cinema da Rainha passou um filme antigo de outro mundo: "Amores Expressos". luzes de neon e uma música que gruda na cabeça.

quando acabou, ela me beijou. o próximo tinha chegado.

corremos da chuva pra uma cafeteria. pedi maracujá, ela pediu morango, e em dois minutos ela já tava bebendo o meu.

foi aí que a chuva lavou o pó de disfarce. o pelo dela ficou verde. igual ao meu.

a gente ficou se olhando, pingando, verde... e começou a rir.`,
  n:`"Amores Expressos". eu amo filmes, e esse virou o meu favorito no mesmo instante, porque foi nele que eu dei o beijo que tinha prometido.

na cafeteria eu pedi morango e ele maracujá. o dele, como sempre, era melhor. roubei.

aí a chuva levou o disfarce embora. as antenas dele apareceram. as minhas também.

nunca fui a única. ele também nunca foi o único. a gente só estava se procurando no lugar errado.`}},
 {id:'pedido', t:'8. o cinema fechado', premio:15, meta:{est:'cinema'}, final:true, txt:{
  g:`construí um cinema ao ar livre e pedi pra fecharem só pra nós dois. ela, cinéfila, achou que era só mais uma sessão.

no fim do filme, a lanterna mágica me projetou na tela, falando tudo o que eu sinto. depois tocou a música do nosso primeiro beijo.

a Lumi, do projetor, apareceu com um buquê. eu ajoelhei.

"Natalix, quer namorar comigo?"`,
  n:`ele fechou o cinema inteiro. pra mim.

no final do filme, ele apareceu na tela, falando coisas que eu guardo até hoje. aí começou a música do nosso primeiro beijo e eu já tava chorando antes do buquê chegar.

ele ajoelhou com o cabelo bagunçado de sempre.

claro que eu disse sim.`}},
 {id:'mundo', t:'9. o mundo inteiro', premio:20, meta:{est:'balao'}, txt:{
  g:`a gente consertou uma das naves, mas não pra voltar pra Veluma. transformamos ela num balão de viagem.

primeiro destino? ela quer a China. eu quero o Peru. vamos pros dois. e pro Japão, Chile, Canadá, Itália (pizza!), França e Rússia.

passei a vida querendo ir embora sem saber pra onde. agora eu sei: pra qualquer lugar, desde que seja com ela.

casa não é um planeta. é uma pessoa.`,
  n:`transformamos a nave dele num balão. eu fico com a janela e reclamo do cabelo dele voando.

China primeiro, depois Japão, Peru, Chile, Canadá, Itália, França, Rússia... e cada cafeteria pelo caminho. ele pede maracujá, eu peço morango, e eu sempre fico com o dele.

eu vivia querendo fugir. agora eu só quero ir. é diferente.

casa não é um planeta. é uma pessoa. e a minha tem cabelo bagunçado.`}},
 {id:'veluma', t:'10. o sinal de Veluma', premio:12, meta:{est:'observatorio'}, txt:{
  g:`a Cometa me chamou no observatório no meio da noite. tinha um sinal piscando no céu, verde, no código da academia:

"cadetes perdidos, respondam. a nave de resgate passa na próxima lua nova."

era o caminho de volta pra casa. aquele que eu procurei a vida inteira.

olhei pra Natalix, que tinha ido junto e dormido no segundo minuto, encostada no telescópio.

respondi o sinal com uma frase só: "obrigado, mas eu já cheguei."`,
  n:`acordei no observatório com o Gabrix olhando o telescópio, sério de um jeito que ele quase nunca fica.

"é Veluma", ele disse. "eles podem levar a gente de volta."

pensei na academia, no meu quarto, nas estrelas de lá. depois pensei na cafeteria, no cinema da Lumi, nas feiras de lua cheia. e no cabelo bagunçado dele.

"a gente fica. pode não?", eu falei.

ele riu. "pode não."`}},
 {id:'rainha', t:'11. o segredo da Rainha', premio:12, meta:{est:'biblioteca',cas:5}, txt:{
  g:`a Rainha Mimosa chamou a gente na biblioteca e abriu a estante trancada. lá dentro tinha um diário velhinho e um potinho de pó de disfarce, igualzinho ao nosso.

aí ela tirou a coroa, devagar. embaixo tinha duas antenas, branquinhas de tão antigas.

"eu caí aqui há muitos invernos", ela contou. "tive medo de ninguém gostar de mim do jeito que eu era. demorei pra entender que quem gosta de verdade gosta do jeito que a gente é."

a Natalix chorou. eu fingi que não chorei. (chorei.)`,
  n:`a Rainha também caiu do céu. a vida inteira, embaixo da coroa, ela escondeu as antenas.

ela olhou pra mim e disse: "você vivia querendo fugir, né? eu também. aí eu achei um lugar pra ficar. vocês dois acharam um ao outro, que é melhor ainda."

o Gabrix fingiu que não chorou. chorou sim. eu vi.

na saída a Rainha deixou a coroa no trono e foi passear pela vila de antena de fora. os gatinhos acharam lindo.`}},
 {id:'cozinha', t:'12. a receita sem carne', premio:12, meta:{est:'pomar'}, txt:{
  g:`a Natalix é vegetariana e eu... nem tanto. mas hoje eu quis fazer o jantar pra ela. pedi ajuda pra Nuvem, peguei maracujá e morango no pomar e inventei uma sopa de abóbora com queijo.

queimei o pão. salguei a sopa. a cozinha ficou parecendo que caiu outra nave.

ela provou, fez cara séria e falou: "tá horrível. faz de novo amanhã? pode não?"

fiz. e no outro dia. e no outro.`,
  n:`o Gabrix tentou cozinhar pra mim. sozinho, sem carne nenhuma, só pra eu poder comer de tudo.

tava horrível. e era a coisa mais linda que alguém já fez pra mim.

a sobremesa foi um cheesecake de cereja que a Cereja trouxe escondido, porque ela já sabia que a sopa ia dar errado.

dei um beijinho na orelha dele e ele ficou vermelho até a ponta das antenas.`}},
 {id:'atraso', t:'13. cinco minutinhos', premio:12, meta:{ped:20}, txt:{
  g:`a gente marcou de ver o nascer do sol do balão. a Natalix odeia se atrasar e... a gente se atrasou. muito. culpa minha: fiquei arrumando o cabelo (não adiantou nada).

ela ficou brava. brava de verdade, de bico e tudo.

aí eu fiz uma piada muito besta sobre o sol também estar atrasado. ela segurou o riso por três segundos... e explodiu de rir.

o sol nasceu do mesmo jeito, com ela no meu ombro reclamando do meu cabelo. melhor nascer do sol da vida.`,
  n:`eu odeio me atrasar. odeio. e ele sabe.

mas ele fez uma piada tão besta que eu não consegui ficar brava nem cinco minutinhos.

às vezes eu acho que ele se atrasa de propósito só pra me fazer rir depois.

(não conta pra ele que eu acho isso fofo.)`}},
 {id:'casa', t:'epílogo: a nossa casa', premio:30, meta:{est:'casinha',juntoCap:'atraso'}, txt:{
  g:`a gente construiu uma casa em cima da árvore mais alta da vila. tem uma janela pra cada um, uma rede no meio e um cantinho pro Dengo, o filhote que apareceu na nossa porta numa noite de chuva e nunca mais foi embora.

a nave virou balão. a academia virou história pra contar. o disfarce a gente não usa mais: os gatos da vila conhecem a gente de verdade agora. verdinhos, de antena, de óculos e de cabelo bagunçado.

passei a vida achando que tinha caído no lugar errado.

eu caí exatamente onde você estava.`,
  n:`a nossa casa tem cheiro de café (dele) e de morango (meu).

tem filme toda sexta, briga pelo cobertor, "mozi, cadê minha boina?" e "meu bem, viu meus óculos?" toda manhã.

eu não quero mais fugir pra lugar nenhum. todo lugar que eu quero ir, eu quero ir com você.

e de cada viagem a gente volta pra cá. pra casa. pra gente.`}}
];
const capIdx=id=>HIST.findIndex(h=>h.id===id);
const leu=id=>vila.cap.includes(capIdx(id));
const revelado=()=>leu('chuva');

/* postais trazidos pelo balão */
const POSTAIS=[
  {id:'china',nome:'China',desc:'a Grande Muralha',bg:'#f6d6c8'},
  {id:'japao',nome:'Japão',desc:'cerejeiras e um portal vermelho',bg:'#fbe3ea'},
  {id:'peru',nome:'Peru',desc:'montanhas que tocam as nuvens',bg:'#dbe9cf'},
  {id:'chile',nome:'Chile',desc:'as estrelas do deserto',bg:'#2f3a63'},
  {id:'canada',nome:'Canadá',desc:'lagos e folhas de bordo',bg:'#d7e8f0'},
  {id:'italia',nome:'Itália',desc:'pizza vegetariana de verdade',bg:'#f8e6c4'},
  {id:'franca',nome:'França',desc:'a torre de ferro de Paris',bg:'#e3e3f3'},
  {id:'russia',nome:'Rússia',desc:'cúpulas coloridas',bg:'#f3dcdc'},
  {id:'hongkong',nome:'Hong Kong',desc:'o neon de Amores Expressos',bg:'#2b2440'},
  {id:'rio',nome:'Rio das Estrelas',desc:'o mar do primeiro postal',bg:'#d3ecf2'}
];
function postalSVG(p,ok){
  const I='#4a3a2e';
  const arte={
    china:`<path d="M6 62 L28 46 L48 54 L70 38 L92 48 L114 36" stroke="#b5654a" stroke-width="6" fill="none" stroke-linejoin="round"/><path d="M26 44 v-5 M46 52 v-5 M68 36 v-5 M90 46 v-5" stroke="#b5654a" stroke-width="4"/><path d="M0 70 Q40 52 80 64 T120 60 V80 H0Z" fill="#9cc27c"/>`,
    japao:`<path d="M36 70 V36 M84 70 V36" stroke="#d1453b" stroke-width="5"/><path d="M28 34 Q60 26 92 34" stroke="#d1453b" stroke-width="6" fill="none"/><path d="M34 44 H86" stroke="#d1453b" stroke-width="4"/>${[[18,20],[100,18],[108,30],[12,34]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="6" fill="#f6b6c8"/>`).join('')}`,
    peru:`<path d="M0 72 L30 30 L52 52 L74 20 L120 72 Z" fill="#86a86b" stroke="${I}" stroke-width="1.6"/><path d="M58 50 h30 M54 58 h40 M50 66 h50" stroke="#c9b18a" stroke-width="2.4"/><ellipse cx="96" cy="22" rx="14" ry="5" fill="#fff"/>`,
    chile:`${[[14,14],[34,26],[60,10],[84,22],[104,12],[50,34],[94,40]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="1.8" fill="#fff4b0"/>`).join('')}<path d="M0 66 Q30 50 60 62 T120 58 V80 H0Z" fill="#d9a46b"/>`,
    canada:`<rect x="0" y="54" width="120" height="26" fill="#86afcf"/><path d="M60 14 L64 26 L74 22 L70 34 L80 36 L68 44 L70 52 L60 48 L50 52 L52 44 L40 36 L50 34 L46 22 L56 26 Z" fill="#d1453b" stroke="${I}" stroke-width="1.4"/><path d="M60 48 V60" stroke="${I}" stroke-width="2"/>`,
    italia:`<path d="M30 20 L96 34 L40 70 Z" fill="#f2c14e" stroke="${I}" stroke-width="2"/><path d="M30 20 L96 34" stroke="#c99a6b" stroke-width="6"/>${[[50,36],[66,40],[48,52],[62,30]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#d1453b"/>`).join('')}<circle cx="56" cy="46" r="3" fill="#86a86b"/>`,
    franca:`<path d="M60 10 L48 70 M60 10 L72 70 M52 50 H68 M55 32 H65 M44 70 Q60 52 76 70" stroke="#6b5440" stroke-width="3" fill="none"/>`,
    russia:`${[[34,'#e3798a'],[60,'#86afcf'],[86,'#86a86b']].map((q,i)=>`<rect x="${q[0]-9}" y="${44-i%2*6}" width="18" height="${30+i%2*6}" fill="#f5efe3" stroke="${I}" stroke-width="1.4"/><path d="M${q[0]-12} ${44-i%2*6} C${q[0]-12} ${30-i%2*6} ${q[0]} ${26-i%2*6} ${q[0]} ${18-i%2*6} C${q[0]} ${26-i%2*6} ${q[0]+12} ${30-i%2*6} ${q[0]+12} ${44-i%2*6} Z" fill="${q[1]}" stroke="${I}" stroke-width="1.4"/>`).join('')}`,
    hongkong:`${[[14,30,14,40,'#ff6fa8'],[34,18,16,52,'#6fd6ff'],[56,26,14,44,'#ffd36b'],[76,14,18,56,'#ff6fa8'],[98,28,14,42,'#6fd6ff']].map(q=>`<rect x="${q[0]}" y="${q[1]}" width="${q[2]}" height="${q[3]}" fill="none" stroke="${q[4]}" stroke-width="2.4"/>`).join('')}`,
    rio:`<path d="M0 56 Q20 50 40 56 T80 56 T120 56 V80 H0Z" fill="#86afcf"/><path d="M70 56 C74 30 84 24 92 26 C98 30 100 44 104 56 Z" fill="#86a86b" stroke="${I}" stroke-width="1.4"/><circle cx="24" cy="22" r="9" fill="#f2c14e"/>`
  }[p.id];
  return `<svg viewBox="0 0 120 80"><rect x="1" y="1" width="118" height="78" rx="6" fill="${p.bg}" stroke="${I}" stroke-width="2"/>${ok?arte:'<text x="60" y="48" text-anchor="middle" font-size="26" fill="#c2ac88">?</text>'}<rect x="94" y="6" width="18" height="20" rx="2" fill="#fbf7ef" stroke="#c2ac88" stroke-width="1.4" stroke-dasharray="2 2"/></svg>`;
}

/* falas dos heróis conforme a história avança */
function falasEu(){
  const g=perfil==='g';
  if(revelado()) return g?['maracujá, sempre.','ela roubou meu suco de novo. vale a pena.','casa não é um planeta.','pode não?']:['morango... mas o maracujá dele é melhor','mozi, arruma esse cabelo!','queria um cheesecake de cereja agora','pode não?'];
  if(leu('feira')) return g?['a Natalix riu da minha piada. de novo.','falta quanto pra lua cheia?','será que ela também esconde alguma coisa?','pode não?']:['a letra torta dele é horrível. eu adoro.','o cabelo dele tava uma bagunça de novo','será que ele também é... não, né?','pode não?'];
  return g?['será que tem mais alguém como eu por aqui?','esse gorro coça as antenas...','fiz a Nuvem rir. ponto pro Gabrix.','às vezes dá vontade de ir embora... mas pra onde?']:['ninguém aqui sabe quem eu sou de verdade','essa boina esconde duas antenas, shh','quero fugir... mas pra onde?','já tô atrasada pra alguma coisa, com certeza'];
}
function falasParceiro(){
  const parG=perfil==='n';
  if(revelado()) return parG?['meu bem! trouxe maracujá pra gente','pode não? *faz careta*','*conta uma piada péssima*','meu cabelo tá ótimo, obrigado']:['mozi, seu cabelo tá uma bagunça','me dá um gole do seu? o seu é sempre melhor','*beijinho na orelha*','a gente vai se atrasar!!','pode não?'];
  return parG?['oi, Natalix! viu o show do Felco?','*faz uma piada sobre as ondas do Rio das Estrelas*','guarda um lugar pra mim na próxima lua cheia?']:['hahahaha besta','guardei um lugar pra você','sua letra é horrível, sabia?'];
}
const FALAS_RAINHA=['bem-vindos à minha floresta, viajantes','que gorro curioso... nunca vi um gato de antenas. digo, de gorro.','vocês dois me lembram uma história muito antiga','a feira dos viajantes é a minha festa favorita'];
function falasRainha(){
  if(leu('rainha')) return ['a coroa pesava. as antenas, não','obrigada por me deixarem ser eu mesma','Veluma é longe. aqui é perto do coração','cuidem um do outro: é a única magia que nunca falha'];
  if(revelado()) return ['verdinhos! eu sabia. rainha sabe das coisas','a chuva daqui revela segredos, já disseram?','vocês ficam lindos sem disfarce','um dia eu conto o meu segredo também'];
  return FALAS_RAINHA;
}

/* ---------------- perfis e saves separados ---------------- */
let perfil=LS.get('vilaPerfil',null); if(perfil!=='g'&&perfil!=='n') perfil=null;
let parceiro=null, parceiroDados=null, legado=null, refEu=null, refOutro=null, unsubEu=null, unsubOutro=null;
let refCorreioEu=null, refCorreioOutro=null, unsubCorreio=null, correio=[];
const chaveLocal=()=>'vilaCats_'+perfil;
function deLegado(d){
  if(!d) return null;
  if(d.v===3||d.v===4||d.v===5){ const v=normalizar(d); v.cap=[]; v.postais=[]; return v; }
  if(d.v===2||'catsOwned' in d||'banked' in d){
    const v=novaVila(); v.moedas=Number(d.moedas||d.banked)||0;
    const ol=d.est&&d.est.padaria?Number(d.est.padaria.lvl)||1:Number(d.potLevel)||1;
    v.est.sopa={lvl:Math.max(1,ol)}; v.coracoes=Math.max(0,(Number(d.gatos||d.catsOwned)||1)-1)*2;
    v.decor=Math.min(DECORS.length,Number(d.decorLvl||d.toppingLevel)||0); v.lastTs=Number(d.lastTs)||Date.now(); return v;
  }
  return null;
}
function conectarPerfil(){
  const loc=LS.get(chaveLocal(),null);
  if(loc) vila=normalizar(loc);
  else { vila=deLegado(LS.get('vilaCats',null))||deLegado(legado)||novaVila(0); }
  salvarLocal();
  parceiro=null; parceiroDados=null; correio=[];
  if(unsubEu){ unsubEu(); unsubEu=null; } if(unsubOutro){ unsubOutro(); unsubOutro=null; } if(unsubCorreio){ unsubCorreio(); unsubCorreio=null; }
  if(!fb||typeof mainRef==='undefined'||!mainRef) return;
  refEu=mainRef.collection('extras').doc('vila_'+perfil);
  refOutro=mainRef.collection('extras').doc('vila_'+outroDe(perfil));
  refCorreioEu=mainRef.collection('extras').doc('correio_'+perfil);
  refCorreioOutro=mainRef.collection('extras').doc('correio_'+outroDe(perfil));
  unsubEu=refEu.onSnapshot(s=>remotoEu(s.exists?s.data():null),()=>{});
  unsubOutro=refOutro.onSnapshot(s=>{
    const d=s.exists?s.data():null;
    const antes=parceiro;
    parceiroDados=d;
    parceiro=d?{abertas:ESTACOES.filter(e=>d.est&&d.est[e.id]&&Number(d.est[e.id].lvl)>0).length,cap:Array.isArray(d.cap)?d.cap:[],lastTs:Number(d.lastTs)||0,nivel:0}:null;
    if(antes&&parceiro&&csAberto){ // novidades do outro
      const o=HEROIS[outroDe(perfil)].nome;
      if(parceiro.cap.length>antes.cap.length){ const h=HIST[parceiro.cap[parceiro.cap.length-1]]; if(h) toast(`${o} leu "${h.t}"`); }
      else if(parceiro.abertas>antes.abertas) toast(`${o} abriu uma construção nova`);
    }
    if(visitando&&d){ vila=normalizar(d); montarMundo(); }
    if(csAberto){ if(!visitando) montarMundo(); atualizarDots(); atualizarPasso(true); }
  },()=>{});
  unsubCorreio=refCorreioEu.onSnapshot(s=>{
    const d=s.exists?s.data():null; const antes=correio.length;
    correio=(d&&Array.isArray(d.itens)?d.itens:[]).filter(x=>x&&typeof x==='object'&&PRESENTES[x.tipo]);
    if(csAberto&&correio.length>antes){ toast(`chegou presente de ${HEROIS[outroDe(perfil)].nome}!`); Som.chime(); }
    atualizarDots(); atualizarPasso(true);
  },()=>{});
}
function remotoEu(d){
  if(visitando){ if(d&&!(d.by===CLIENT_ID)) minhaVila=normalizar(d); return; }
  if(!d){ // primeira vez deste jogador na nuvem: herda o save antigo do casal
    if(!LS.get(chaveLocal(),null)){ const v=deLegado(legado); if(v) vila=v; }
    escrever(); if(csAberto){ montarMundo(); atualizarHud(); } return;
  }
  if(d.by===CLIENT_ID && Number(d.lastTs)<=vila.lastTs) return;
  if(Number(d.lastTs)<vila.lastTs-1500){ escrever(); return; }
  vila=normalizar(d); salvarLocal();
  if(csAberto){ montarMundo(); atualizarHud(); }
  window.atualizarTagCozy();
}
function parceiroOk(n){ if(!fb) return true; return !!parceiro && parceiro.abertas>=n; }
const parceiroOnline=()=>parceiro&&Date.now()-parceiro.lastTs<3*60*1000;

/* ---------------- avisos no celular (ntfy, o mesmo dos recados) ---------------- */
function avisar(titulo,texto,chave){
  try{
    if(chave){ const k='vilaAviso_'+perfil+'_'+chave; if(LS.get(k,false)) return; LS.set(k,true); }
    const topic=(typeof DB!=='undefined'&&DB.ntfyTopic)||'';
    if(!topic||!navigator.onLine) return;
    fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`,{method:'POST',body:texto,headers:{'Title':titulo.normalize('NFD').replace(/[^\x20-\x7E]/g,''),'Tags':'cat'}}).catch(()=>{});
  }catch(e){}
}
function avisarProgresso(){
  if(!perfil||!fb) return;
  const eu=HEROIS[perfil].nome, o=HEROIS[outroDe(perfil)].nome;
  HIST.forEach(h=>{ if(h.meta.junto&&nAbertas()>=h.meta.junto) avisar(`${eu} chegou em: ${h.t}`,`se você estava esperando, ${o}, a história de vocês continua na vila!`,'junto_'+h.id); });
}

/* ---------------- presentes (correio entre as duas vilas) ---------------- */
const PRESENTES={
  carta:{nome:'cartinha',desc:'um recadinho seu',ic:ICON.letter,custo:()=>({}),ganho:'+2 corações'},
  buque:{nome:'buquê de flores',desc:'custa 5 corações seus, ela/ele ganha 8',ic:'<svg viewBox="0 0 32 32"><path d="M16 30 L11 17 M16 30 L16 15 M16 30 L21 17" stroke="#5f824b" stroke-width="2"/><path d="M9 20 L16 30 L23 20 Z" fill="#f5efe3" stroke="#6b5440" stroke-width="1.8"/><circle cx="11" cy="13" r="5" fill="#e3798a" stroke="#6b5440" stroke-width="1.6"/><circle cx="21" cy="13" r="5" fill="#f2c14e" stroke="#6b5440" stroke-width="1.6"/><circle cx="16" cy="8" r="5" fill="#f2a7b8" stroke="#6b5440" stroke-width="1.6"/></svg>',custo:()=>({h:5}),ganho:'+8 corações'},
  moedas:{nome:'saquinho de moedas',desc:'manda 25% das suas moedas',ic:ICON.coin,custo:()=>({m:Math.floor(vila.moedas*.25)}),ganho:'moedas'},
  doce:{nome:'cheesecake de cereja',desc:'da cafeteria: custa 3 corações, vale 6',ic:MENU.find(m=>m.id==='cheesecake').svg,req:'cafe',custo:()=>({h:3}),ganho:'+6 corações'}
};
function aplicarPresente(x){
  if(x.tipo==='carta') vila.coracoes+=2;
  else if(x.tipo==='buque') vila.coracoes+=8;
  else if(x.tipo==='doce') vila.coracoes+=6;
  else if(x.tipo==='moedas'){ const v=Math.max(0,Number(x.valor)||0); vila.moedas+=v; vila.stats.ganhos+=v; }
  vila.stats.recebidos++; csDirty=true;
}
let abaCorreio='rec';
window.abrirCorreio=function(aba){
  if(visitando) vlVoltarVisita();
  if(aba) abaCorreio=aba==='enviar'?'env':aba;
  const o=HEROIS[outroDe(perfil)].nome;
  const tabs=`<div class="vl-tabs"><button class="${abaCorreio==='rec'?'on':''}" onclick="abrirCorreio('rec')">recebidos${correio.length?' ('+correio.length+')':''}</button><button class="${abaCorreio==='env'?'on':''}" onclick="abrirCorreio('env')">mandar pra ${o}</button></div>`;
  let corpo='';
  if(!fb) corpo='<p class="vl-small" style="font-size:14px">o correio precisa de internet pra levar os presentes entre as duas vilas.</p>';
  else if(abaCorreio==='rec'){
    corpo=correio.length?correio.slice().sort((a,b)=>a.ts-b.ts).map(x=>{ const P=PRESENTES[x.tipo];
      return `<div class="vl-item"><div class="ic">${P.ic}</div><div class="tx"><b>${P.nome}</b><small>de ${esc(HEROIS[x.de]?HEROIS[x.de].nome:o)}${x.msg?' · "'+esc(String(x.msg).slice(0,40))+(String(x.msg).length>40?'…':'')+'"':''}</small></div><button class="bt leaf" onclick="vlAbrirPresente('${esc(x.id)}')">abrir</button></div>`; }).join('')
      :`<p class="vl-small" style="font-size:14px">nada no correio ainda... que tal mandar algo pra ${o}?</p>`;
  } else {
    const ops=Object.entries(PRESENTES).map(([k,P])=>{ const bloq=P.req&&!estAberta(P.req), c=P.custo(), falta=(c.h&&vila.coracoes<c.h)||(k==='moedas'&&c.m<1);
      return `<div class="vl-item"><div class="ic">${P.ic}</div><div class="tx"><b>${P.nome}</b><small>${bloq?'precisa da cafeteria':P.desc}${k==='moedas'?` (${fmt(c.m)})`:''}</small></div>${bloq?'<span class="bt no">trancado</span>':`<button class="bt ${falta?'no':''}" onclick="vlEnviarPresente('${k}')">mandar</button>`}</div>`; }).join('');
    corpo=`<textarea id="vl-msg" class="vl-txt" maxlength="200" placeholder="escreve um recadinho pra ${o} (opcional)"></textarea>${ops}<p class="vl-small">${o} recebe um aviso no celular (o mesmo dos recados)</p>`;
  }
  abrirSheet(`<span class="vl-ic" style="width:54px;height:54px;display:block;margin:0 auto">${ICON.mail}</span><h2>correio da vila</h2><div class="vl-sub">presentes entre a vila de vocês dois</div>${tabs}${corpo}`,'correio');
};
window.vlEnviarPresente=function(tipo){
  const P=PRESENTES[tipo]; if(!P||!fb||!refCorreioOutro) return;
  if(P.req&&!estAberta(P.req)) return;
  const c=P.custo();
  if(c.h&&vila.coracoes<c.h){ toast('faltam corações'); return; }
  if(tipo==='moedas'&&c.m<1){ toast('você ainda não tem moedas pra mandar'); return; }
  const msg=String(($('vl-msg')||{}).value||'').trim().slice(0,200);
  if(tipo==='carta'&&!msg){ toast('escreve o recadinho primeiro'); return; }
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),de:perfil,tipo,msg,valor:c.m||0,ts:Date.now()};
  if(c.h) vila.coracoes-=c.h; if(c.m) vila.moedas-=c.m;
  vila.stats.presentes++; csDirty=true; escrever(); csDirty=false; atualizarHud();
  refCorreioOutro.set({itens:firebase.firestore.FieldValue.arrayUnion(item)},{merge:true}).then(()=>{
    toast(`${P.nome} enviado pra ${HEROIS[outroDe(perfil)].nome}!`); Som.chime(); burstHearts(innerWidth/2,innerHeight/2,14);
    avisar(`${HEROIS[perfil].nome} te mandou um presente`,`${P.nome} na vila${msg?': "'+msg+'"':''}`);
  }).catch(()=>{ if(c.h) vila.coracoes+=c.h; if(c.m) vila.moedas+=c.m; vila.stats.presentes--; csDirty=true; atualizarHud(); toast('não consegui mandar... tenta de novo'); });
  abrirCorreio('env');
};
window.vlAbrirPresente=function(id){
  const x=correio.find(i=>i.id===id); if(!x) return;
  correio=correio.filter(i=>i!==x);
  aplicarPresente(x); escrever(); csDirty=false; atualizarHud(); atualizarDots(); atualizarPasso(true);
  if(refCorreioEu) refCorreioEu.update({itens:firebase.firestore.FieldValue.arrayRemove(x)}).catch(()=>{});
  const P=PRESENTES[x.tipo], de=HEROIS[x.de]?HEROIS[x.de].nome:'';
  Som.fanfarra(); burstHearts(innerWidth/2,innerHeight/2,24);
  modal(`<span class="vl-ic" style="width:70px;height:70px">${P.ic}</span><h2>${P.nome}</h2><p class="vl-small" style="font-size:14px">de ${esc(de)} · ${x.tipo==='moedas'?fmt(x.valor)+' moedas':P.ganho}</p>${x.msg?`<div class="vl-letter" style="text-align:left"><p>${esc(x.msg)}</p><div class="sig">— ${esc(de)}</div></div>`:''}<button class="vl-btn rose" onclick="fecharModal();abrirCorreio('rec')">${x.de==='g'?'obrigada, mozi':'obrigado, meu bem'}</button>`);
};

/* ---------------- visitar a vila do outro (só olhar) ---------------- */
let obrasBak=null;
window.vlVisitar=function(){
  if(visitando) return;
  if(!parceiroDados){ toast(fb?`${HEROIS[outroDe(perfil)].nome} ainda não tem vila salva`:'visitar precisa de internet'); return; }
  escrever(); csDirty=false;
  vila.stats.visitas++; minhaVila=vila; vila=normalizar(parceiroDados); visitando=true;
  obrasBak=obras; obras={};
  cats.forEach(c=>{ c.pedido=null; }); if(visitante) removerVisitante();
  fecharSheet(); fecharModal(); root.classList.add('visita');
  Ralvo=raioAlvo(); montarMundo(); atualizarHud(); atualizarPasso(true); atualizarDots();
  animarFoco(CX,CY-30,zoomInicial());
  toast(`bem-vindo à vila de ${HEROIS[outroDe(perfil)].nome}!`);
};
window.vlVoltarVisita=function(){
  if(!visitando) return;
  visitando=false; vila=minhaVila; minhaVila=null; obras=obrasBak||{}; obrasBak=null;
  root.classList.remove('visita'); csDirty=true;
  Ralvo=raioAlvo(); montarMundo(); atualizarHud(); atualizarPasso(true); atualizarDots();
  animarFoco(CX,CY-30,zoomInicial());
};
function sheetVisita(id){
  const e=estDef(id), l=estLvl(id), o=HEROIS[outroDe(perfil)].nome;
  abrirSheet(`<div class="vl-video">${midia(id,true)}<span class="tag"><span class="vl-ic">${PROD[id]}</span>${e.gato.nome} trabalhando</span></div>
    <h2>${e.nome}</h2><div class="vl-sub">na vila de ${o} · nível ${l} · construção ${FASES[faseDe(l)]}</div>
    <button class="vl-btn rose" onclick="abrirCorreio('env')">mandar um presente pra ${o}</button><div style="height:10px"></div>
    <button class="vl-btn" onclick="vlVoltarVisita();vlFecharSheet()">voltar pra minha vila</button>`,'visita');
}

/* capítulos disponíveis: em ordem, cumprindo os requisitos (meta) */
function metaOk(m){
  if(m.ab && nAbertas()<m.ab) return false;
  if(m.cas && vila.castelo<m.cas) return false;
  if(m.est && !estAberta(m.est)) return false;
  if(m.ped && (vila.stats.pedidos||0)<m.ped) return false;
  return true;
}
function parceiroLeu(id){ if(!fb) return true; return !!parceiro && parceiro.cap.includes(capIdx(id)); }
function juntoOk(m){ if(m.junto && !parceiroOk(m.junto)) return false; if(m.juntoCap && !parceiroLeu(m.juntoCap)) return false; return true; }
function capDisponivel(i){
  const h=HIST[i]; if(!h) return false;
  if(i>0 && !vila.cap.includes(i-1)) return false;
  return metaOk(h.meta) && juntoOk(h.meta);
}
function cartasNovas(){ if(visitando) return []; return HIST.map((h,i)=>i).filter(i=>!vila.cap.includes(i)&&capDisponivel(i)); }
function textoMeta(m){
  const p=[];
  if(m.ab && nAbertas()<m.ab) p.push(`abra ${m.ab} construções (${nAbertas()}/${m.ab})`);
  if(m.cas && vila.castelo<m.cas) p.push(`restaure ${CASTELO[m.cas-1].art} ${CASTELO[m.cas-1].nome} do castelo`);
  if(m.est && !estAberta(m.est)) p.push(`construa: ${estDef(m.est).nome}`);
  if(m.ped && (vila.stats.pedidos||0)<m.ped) p.push(`atenda ${m.ped} pedidos do cardápio (${vila.stats.pedidos||0}/${m.ped})`);
  return p.join(' e ');
}
function motivoTrava(i){
  const h=HIST[i];
  if(i>0&&!vila.cap.includes(i-1)) return 'leia o capítulo anterior';
  if(!metaOk(h.meta)) return textoMeta(h.meta);
  if(!juntoOk(h.meta)){ const o=HEROIS[outroDe(perfil)].nome;
    if(!parceiro) return `esperando ${o} começar a jogar`;
    if(h.meta.junto) return `esperando ${o} chegar aqui (${parceiro.abertas}/${h.meta.junto} construções)`;
    return `esperando ${o} ler "${HIST[capIdx(h.meta.juntoCap)].t}"`; }
  return '';
}

/* ---------------- painel da história ---------------- */
let abaRainha='cap', abaGatos='album';
window.vlPainel=function(p,aba){
  if(visitando){ toast('volte pra sua vila pra abrir isso'); return; }
  if(p==='rainha'){ if(aba) abaRainha=aba; painelRainha(); }
  else if(p==='gatos'){ if(aba) abaGatos=aba; painelGatos(); }
  else painelMimos();
};
function retrato(q,disf,w){ return `<svg viewBox="${ALIEN_BOX.join(' ')}" style="width:${w||70}px;height:${(w||70)*1.2}px">${alienSVG(q,disf,false)}</svg>`; }
function painelRainha(){
  garantirMissoes();
  const eu=HEROIS[perfil], ot=HEROIS[outroDe(perfil)];
  const tabs=`<div class="vl-tabs"><button class="${abaRainha==='cap'?'on':''}" onclick="vlPainel('rainha','cap')">capítulos${cartasNovas().length?' •':''}</button><button class="${abaRainha==='pedidos'?'on':''}" onclick="vlPainel('rainha','pedidos')">pedidos</button><button class="${abaRainha==='rainha'?'on':''}" onclick="vlPainel('rainha','rainha')">Rainha${cartasRainhaNovas().length?' •':''}</button><button class="${abaRainha==='postais'?'on':''}" onclick="vlPainel('rainha','postais')">postais</button></div>`;
  let corpo='';
  if(abaRainha==='cap'){
    corpo=HIST.map((h,i)=>{ const lido=vila.cap.includes(i), ok=lido||capDisponivel(i), nova=ok&&!lido;
      return `<button class="vl-chap ${ok?'':'lock'}" ${ok?`onclick="abrirCarta(${i})"`:''}><span class="vl-ic" style="width:30px;height:30px">${ok?ICON.letter:ICON.crown}</span><span><b>${ok?h.t:'capítulo trancado'}</b><small>${lido?'lido':ok?'novo! +'+h.premio+' corações':esc(motivoTrava(i))}</small></span>${nova?'<span class="new">novo</span>':''}</button>`; }).join('');
  } else if(abaRainha==='pedidos'){
    const m=vila.missoes;
    corpo=`<p class="vl-small" style="margin:0 0 10px">pedidos da Rainha Mimosa pra hoje</p>`+m.lista.map((x,i)=>{
      const def=MISSOES_POOL.find(p=>p.tipo===x.tipo), pct=Math.min(100,x.prog/x.meta*100);
      return `<div class="vl-item ${x.ok?'done':''}"><div class="tx"><b style="font-size:15px">${def.txt(x.meta)}</b><div class="vl-mbar"><i style="width:${pct}%"></i></div><small>${fmt(x.prog)} / ${fmt(x.meta)}</small></div>
        ${x.ok?'<span class="bt leaf" style="background:none;box-shadow:none;color:var(--leaf-dark)">feito</span>':x.prog>=x.meta?`<button class="bt leaf" onclick="vlResgatar(${i})">+3 ${ic('heart')}</button>`:`<span class="bt no">+3 ${ic('heart')}</span>`}</div>`; }).join('')
      +`<div class="vl-item" style="justify-content:center;flex-direction:column;text-align:center;border-style:dashed;border-color:var(--honey)"><span class="vl-ic" style="width:44px;height:44px">${ICON.gift}</span>${m.bau?'<b>presente de hoje aberto! volta amanhã</b>':m.lista.every(x=>x.ok)?'<button class="vl-btn honey" onclick="vlBau()">abrir presente da rainha</button>':'<small style="font-weight:800;color:var(--ink-soft)">cumpra os 3 pedidos pra ganhar o presente do dia</small>'}</div>`;
  } else if(abaRainha==='rainha'){
    corpo=`<div style="text-align:center"><svg viewBox="-30 -62 60 68" class="vl-queen" style="height:100px">${rainhaSVG(1)}</svg></div><p class="vl-small" style="margin:0 0 10px">a cada parte do castelo restaurada, a Rainha Mimosa manda uma carta</p>`+CARTAS.map((c,i)=>{ const ok=i<vila.castelo, lido=vila.cartas.includes(i);
      return `<button class="vl-chap ${ok?'':'lock'}" ${ok?`onclick="abrirCartaRainha(${i})"`:''}><span class="vl-ic" style="width:30px;height:30px">${ok?ICON.crown:ICON.hammer}</span><span><b>${ok?c.t:'carta selada'}</b><small>${lido?'lida':ok?'nova! +'+c.premio+' corações':'restaure '+CASTELO[i].nome}</small></span>${ok&&!lido?'<span class="new">nova</span>':''}</button>`; }).join('');
  } else {
    const n=vila.postais.length;
    corpo=`<p class="vl-small" style="margin:0 0 10px">${estAberta('balao')?`${n}/${POSTAIS.length} postais · o balão traz um novo de vez em quando`:'o balão dos viajantes ainda não existe... a história vai chegar lá'}</p>
      <div class="vl-postais">${POSTAIS.map(p=>{ const ok=vila.postais.includes(p.id); return `<div class="${ok?'':'lock'}">${postalSVG(p,ok)}<b>${ok?p.nome:'???'}</b><small>${ok?p.desc:'ainda não visitado'}</small></div>`; }).join('')}</div>`;
  }
  const online=parceiro&&parceiroOnline()?` · <b style="color:var(--leaf-dark)">${ot.nome} está jogando agora</b>`:'';
  abrirSheet(`<div class="vl-herois">${retrato(perfil,!revelado(),74)}<div><h2 style="text-align:left">${eu.nome}</h2><div class="vl-sub" style="text-align:left;margin:0">${revelado()?'sem disfarce':'disfarçad'+(perfil==='g'?'o':'a')+' de gato comum'}${online}</div><button class="linkish" style="font-size:13px" onclick="vlTrocarPerfil()">não é você? trocar jogador</button></div></div>
    <div class="vl-duo"><button onclick="vlVisitar()">${ic('olho')}visitar a vila de ${ot.nome}</button><button onclick="abrirCorreio()">${ic('mail')}correio${correio.length?` <span class="n">${correio.length}</span>`:''}</button></div>${tabs}${corpo}`,'rainha');
}
window.abrirCarta=function(i,semCena){
  const h=HIST[i]; if(!h||!(vila.cap.includes(i)||capDisponivel(i))) return;
  // primeiro a cena animada (na primeira vez, ou quando pedir pra ver de novo)
  if(!semCena && window.VilaCena && VilaCena.tem(h.id) && !vila.cap.includes(i)){
    fecharSheet(); vila.stats.cenas++; csDirty=true;
    VilaCena.tocar(h.id,perfil,()=>abrirCarta(i,true)); return;
  }
  let txt=h.txt[perfil];
  if(h.final){
    if(perfil==='n'){ const f=(typeof DB!=='undefined'&&DB.cartaFinal)||''; txt+=`\n\n— o que ele disse na tela —\n\n${f||CARTA_FINAL_PADRAO}`; }
    else { const f=(typeof DB!=='undefined'&&DB.cartaFinalDela)||''; if(f) txt+=`\n\n— o que ela respondeu —\n\n${f}`; }
  }
  const nova=!vila.cap.includes(i);
  if(nova){ vila.cap.push(i); vila.coracoes+=h.premio; csDirty=true; escrever(); csDirty=false; atualizarHud(); setTimeout(()=>{ toast(`+${h.premio} corações`); Som.chime(); },400); if(h.id==='chuva'||h.final) burstHearts(innerWidth/2,innerHeight/2,40); }
  const disf=!revelado();
  const cena=(h.id==='queda'||h.id==='disfarce')?retrato(perfil,true,90)
    :`${retrato('g',disf&&h.id!=='chuva',84)}${retrato('n',disf&&h.id!=='chuva',84)}`;
  abrirSheet(`<div class="vl-cena">${cena}</div><h2>${h.t}</h2><div class="vl-sub">diário de ${HEROIS[perfil].nome}</div>
    <div class="vl-letter"><span class="seal">${ICON.letter}</span><p>${esc(txt)}</p><div class="sig">— ${HEROIS[perfil].nome}</div></div>
    ${h.id==='chuva'?'<p class="vl-small">a cafeteria e o cinema agora podem ser construídos na vila!</p>':''}${h.id==='pedido'?'<p class="vl-small">o balão dos viajantes agora pode ser construído!</p>':''}
    ${window.VilaCena&&VilaCena.tem(h.id)?`<button class="vl-btn honey" onclick="vlVerCena(${i})">${ic('play')} ver a cena de novo</button><div style="height:10px"></div>`:''}
    <button class="vl-btn rose" onclick="vlPainel('rainha','cap')">voltar aos capítulos</button>`,'carta');
  atualizarDots(); atualizarPasso(true); if(nova) montarMundo();
  if(nova&&h.meta.juntoCap===undefined&&HIST.some(x=>x.meta.juntoCap===h.id)) avisar(`${HEROIS[perfil].nome} leu: ${h.t}`,`agora falta pouco pro epílogo de vocês dois na vila!`,'cap_'+h.id);
};
window.vlVerCena=function(i){ const h=HIST[i]; if(!h||!window.VilaCena) return; fecharSheet(); vila.stats.cenas++; csDirty=true; VilaCena.tocar(h.id,perfil,()=>abrirCarta(i,true)); };
window.vlTrocarPerfil=function(){ pararCatLoop(); perfil=null; LS.set('vilaPerfil',null); abrirCozy(); };
function escolherPerfil(){
  modal(`<h2>quem está jogando?</h2><p class="vl-small" style="font-size:14px">cada um tem a sua própria vila. a história junta vocês dois no caminho.</p>
   <div class="vl-escolha">
     <button onclick="vlEscolher('g')">${retrato('g',false,92)}<b>Gabrix</b><small>Gabriel</small></button>
     <button onclick="vlEscolher('n')">${retrato('n',false,92)}<b>Natalix</b><small>Natália</small></button>
   </div>`);
}
window.vlEscolher=function(p){ perfil=p; LS.set('vilaPerfil',p); conectarPerfil(); fecharModal(); abrirCozy(); };

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
  const pode=!visitando&&(cartasNovas().length>0||cartasRainhaNovas().length>0||correio.length>0||(m&&(m.lista.some(x=>x.prog>=x.meta&&!x.ok)||(!m.bau&&m.lista.every(x=>x.ok)))));
  $('vl-dot-rainha').classList.toggle('on',!!pode);
  const dc=$('vl-dot-conq'); if(dc) dc.classList.toggle('on',!visitando&&conqProntas().length>0);
}

/* =====================================================================
   GUIA: "próximo passo" (pílula no topo + setinha no mundo)
   ===================================================================== */
const TUT=[
  {txt:'toque na cozinha da vovó',alvo:()=>estDef('sopa'),acao:()=>abrirEstacaoSheet('sopa')},
  {txt:'melhore a cozinha pra ganhar mais moedas',alvo:()=>estDef('sopa'),acao:()=>abrirEstacaoSheet('sopa')},
  {txt:'faça carinho na Nuvem (toque no gatinho)',alvo:()=>{ const g=cats.find(c=>c.chave==='esopa'); return g?{x:g.x,y:g.y+60}:estDef('sopa'); },acao:null},
  {txt:'toque na plaquinha pra construir a barraquinha',alvo:()=>estDef('padaria'),acao:()=>sheetConstruir('padaria')}
];
function avancarTut(n){ if(vila.tut===n){ vila.tut=n+1; csDirty=true; atualizarPasso(true); } }
function passoConstruir(prefixo){
  const e=proximaEstacao();
  if(!e) return null;
  if(obras[e.id]) return {txt:`obra da ${e.nome} quase pronta...`,ic:'hammer',alvo:e};
  const pode=vila.moedas>=e.abrir;
  return {txt:(prefixo||'')+(pode?`construa: ${e.nome}`:`junte ${fmt(e.abrir)} moedas pra construir ${e.nome}`),sub:pode?'':'melhore as construções pra juntar mais rápido',
    ic:'hammer',prog:pode?null:vila.moedas/e.abrir,alvo:e,pode,acao:()=>{ animarFoco(e.x,e.y-40,Math.max(view.s,1)); sheetConstruir(e.id); }};
}
function passoCastelo(){
  const p=CASTELO[vila.castelo]; if(!p) return null;
  if(obras.castelo) return {txt:'os pedreiros estão no castelo...',ic:'hammer',alvo:{x:CASTELO_POS.x,y:CASTELO_POS.y+40}};
  if(nAbertas()<p.req) return passoConstruir(`castelo pede ${p.req} construções · `);
  const pode=vila.moedas>=p.custo;
  return {txt:pode?`restaure ${p.art} ${p.nome} do castelo`:`junte ${fmt(p.custo)} moedas pra restaurar ${p.art} ${p.nome}`,ic:'crown',prog:pode?null:vila.moedas/p.custo,pode,
    alvo:{x:CASTELO_POS.x,y:CASTELO_POS.y+40},acao:()=>{ animarFoco(CASTELO_POS.x,CASTELO_POS.y-20,Math.max(view.s,1)); sheetCastelo(); }};
}
function proximoPasso(){
  if(visitando) return {txt:`você está visitando a vila de ${HEROIS[outroDe(perfil)].nome}`,ic:'olho',acao:()=>vlVoltarVisita(),sub:'toque pra voltar pra sua vila'};
  const nv=cartasNovas();
  if(nv.length&&nv[0]===0) return {txt:'leia o começo da história',ic:'letter',pode:true,acao:()=>abrirCarta(0)};
  if(vila.tut<TUT.length && vila.cap.includes(0) && nAbertas()<3){ const t=TUT[vila.tut]; if(!(vila.tut===3&&estAberta('padaria'))) return {txt:t.txt,ic:'sparkle',alvo:t.alvo(),pode:true,acao:t.acao,tut:1}; vila.tut=TUT.length; }
  if(nv.length) return {txt:`capítulo novo: ${HIST[nv[0]].t}`,ic:'letter',pode:true,acao:()=>abrirCarta(nv[0])};
  if(correio.length) return {txt:`${correio.length===1?'chegou um presente':'chegaram '+correio.length+' presentes'} de ${HEROIS[outroDe(perfil)].nome}!`,ic:'mail',pode:true,acao:()=>abrirCorreio()};
  const cr=cartasRainhaNovas(); if(cr.length) return {txt:`carta da Rainha: ${CARTAS[cr[0]].t}`,ic:'crown',pode:true,acao:()=>abrirCartaRainha(cr[0])};
  const m=vila.missoes; if(m&&m.lista.some(x=>x.prog>=x.meta&&!x.ok)) return {txt:'pedido da Rainha cumprido! resgate os corações',ic:'gift',pode:true,acao:()=>vlPainel('rainha','pedidos')};
  if(conqProntas().length) return {txt:`conquista nova: ${conqProntas()[0].nome}`,ic:'trophy',pode:true,acao:()=>painelConquistas()};
  const i=HIST.findIndex((h,k)=>!vila.cap.includes(k));
  if(i>=0){
    const h=HIST[i], mm=h.meta;
    if(mm.ab && nAbertas()<mm.ab) return passoConstruir(`pra continuar a história · `);
    if(mm.cas && vila.castelo<mm.cas) return passoCastelo();
    if(mm.est && !estAberta(mm.est)) return passoConstruir(`pra continuar a história · `);
    if(mm.ped && (vila.stats.pedidos||0)<mm.ped) return {txt:`atenda pedidos do cardápio (${vila.stats.pedidos||0}/${mm.ped})`,sub:'toque nos gatinhos com balãozinho de comida',ic:'gift',prog:(vila.stats.pedidos||0)/mm.ped,alvo:(cats.find(c=>c.pedido)||null),pode:!!cats.find(c=>c.pedido)};
    if(!juntoOk(mm)){ const o=HEROIS[outroDe(perfil)].nome;
      return {txt:motivoTrava(i),sub:fb?`mande um presente pra ajudar ${o}`:'',ic:'heart',acao:fb?()=>abrirCorreio('enviar'):null,prog:mm.junto&&parceiro?Math.min(1,parceiro.abertas/mm.junto):null}; }
  }
  const pc=passoConstruir(); if(pc) return pc;
  const ca=passoCastelo(); if(ca) return ca;
  return {txt:'a história toda foi vivida! melhore, enfeite e adote gatinhos',ic:'heart',acao:()=>painelMimos()};
}
let passoAtual=null, passoT=0;
function atualizarPasso(forca){
  const el=$('vl-passo'); if(!el) return;
  const now=performance.now(); if(!forca&&now-passoT<700) return; passoT=now;
  const p=proximoPasso(); passoAtual=p;
  if(!p){ el.style.display='none'; return; }
  el.style.display='';
  el.classList.toggle('pode',!!p.pode); el.classList.toggle('tut',!!p.tut);
  const ico=PROD[p.ic]||ICON[p.ic]||ICON.sparkle;
  const html=`<span class="vl-ic">${ico}</span><span class="tx"><b>${esc(p.txt)}</b>${p.sub?`<small>${esc(p.sub)}</small>`:''}${p.prog!=null?`<i class="bar"><i style="width:${Math.min(100,p.prog*100).toFixed(1)}%"></i></i>`:''}</span>${p.acao?`<span class="vl-ic go">${ICON.seta}</span>`:''}`;
  if(el._h!==html){ el.innerHTML=html; el._h=html; }
}
window.vlPasso=function(){ Som.init(); const p=passoAtual||proximoPasso(); if(!p) return; if(p.acao) p.acao(); else if(p.alvo) animarFoco(p.alvo.x,p.alvo.y-40,Math.max(view.s,1.1)); };
function desenharSeta(c){
  const p=passoAtual; if(!p||!p.alvo||!p.pode||sheetAtual) return;
  const a=p.alvo, b=Math.abs(Math.sin(tempo*3.4))*10, x=a.x, y=(a.y||0)-128-b;
  c.save(); c.translate(x,y); c.fillStyle=p.tut?'#e3798a':'#e9b24f'; c.strokeStyle='#fbf7ef'; c.lineWidth=4; c.lineJoin='round';
  c.beginPath(); c.moveTo(-9,-22); c.lineTo(9,-22); c.lineTo(9,-6); c.lineTo(17,-6); c.lineTo(0,10); c.lineTo(-17,-6); c.lineTo(-9,-6); c.closePath(); c.stroke(); c.fill();
  c.strokeStyle=INK; c.lineWidth=1.6; c.stroke(); c.restore();
}

/* =====================================================================
   ESTAÇÕES DO ANO, CLIMA E DATAS ESPECIAIS
   ===================================================================== */
const NOME_EST={verao:'verão',outono:'outono',inverno:'inverno',primavera:'primavera'};
function estacaoDoAno(d){ const m=d.getMonth()+1; return (m===12||m<=2)?'verao':m<=5?'outono':m<=8?'inverno':'primavera'; }
let climaForcado=null, estForcada=null, festaForcada=null;
function calcClima(){
  const d=new Date(), est=estacaoDoAno(d);
  const bloco=Math.floor(d.getHours()/3), dia=hojeStr();
  const r=seeded([...(dia+'|'+bloco)].reduce((s,c)=>(s*31+c.charCodeAt(0))%2147483647,11))();
  const pChuva={verao:.42,primavera:.32,outono:.2,inverno:.04}[est];
  let tipo='sol';
  if(r<pChuva) tipo='chuva'; else if(r<pChuva+.18) tipo='nublado';
  else if(est==='inverno'&&d.getHours()<9&&r<.8) tipo='nevoa';
  if(climaForcado) tipo=climaForcado;
  return {tipo,est};
}
function calcFesta(){
  const d=new Date();
  try{
    const ini=new Date((typeof DB!=='undefined'&&DB.dataInicio)||'2026-03-15T00:00:00');
    if(d.getDate()===ini.getDate()&&d>ini){
      const meses=(d.getFullYear()-ini.getFullYear())*12+d.getMonth()-ini.getMonth();
      if(meses>0) return meses%12===0?{nome:`${meses/12} ano${meses>12?'s':''} de namoro!`,tipo:'aniv'}:{nome:`mêsversário: ${meses} ${meses===1?'mês':'meses'}!`,tipo:'mes'};
    }
  }catch(e){}
  const m=d.getMonth()+1, dd=d.getDate();
  if(m===6&&dd===12) return {nome:'dia dos namorados!',tipo:'nam'};
  if(m===12&&(dd===24||dd===25)) return {nome:'feliz natal!',tipo:'natal'};
  return null;
}
function atualizarClima(){
  const c=calcClima(), antes=CLIMA.tipo, estAntes=ESTACAO;
  CLIMA={tipo:c.tipo}; ESTACAO=estForcada||c.est; FESTA=festaForcada||calcFesta();
  if(estAntes!==ESTACAO){ camKey=''; }
  const b=$('vl-clima'); if(b){ b.innerHTML=ic(FESTA?'festa':CLIMA.tipo==='sol'?(NOITE>.5?'lua':'sol'):CLIMA.tipo); }
  if(csAberto&&antes!==CLIMA.tipo&&antes){ if(CLIMA.tipo==='chuva') toast('começou a chover na vila... a cafeteria vai lotar'); }
}
window.vlClima=function(){
  const t=CLIMA.tipo, n=NOITE>.5;
  const txt={sol:n?'noite estrelada':'dia de sol',nublado:'dia nublado',chuva:'chuva! cafeteria e cabana do lago rendem +50%',nevoa:'névoa da manhã de inverno'}[t];
  toast(`${NOME_EST[ESTACAO]} · ${txt}${n&&estAberta('observatorio')?' · observatório ×2':''}${FESTA?' · '+FESTA.nome+' produção ×2':''}`);
};
window.vilaClima=function(t,est){ climaForcado=t||null; atualizarClima(); if(est!==undefined){ estForcada=est||null; atualizarClima(); camKey=''; montarMundo(); } precisaDesenhar=true; };   // pra testar
const gotas=[];
function atualizarChuva(dt){
  const alvo=CLIMA.tipo==='chuva'?Math.round(70*(qualidade<1?.6:1)):0;
  while(gotas.length<alvo) gotas.push({x:Math.random()*(W+80)-40,y:Math.random()*H,v:520+Math.random()*260,l:10+Math.random()*10});
  if(gotas.length>alvo) gotas.length=alvo;
  for(const g of gotas){ g.y+=g.v*dt; g.x-=g.v*dt*.18; if(g.y>H+20){ g.y=-20-Math.random()*40; g.x=Math.random()*(W+80)-40; } }
}
function desenharClima(c){
  // chamado em coordenadas de tela
  if(CLIMA.tipo==='chuva'||CLIMA.tipo==='nublado'){ c.fillStyle=CLIMA.tipo==='chuva'?'rgba(70,84,110,.2)':'rgba(120,128,140,.12)'; c.fillRect(0,0,W,H); }
  if(CLIMA.tipo==='nevoa'){ c.globalAlpha=.45; for(let i=0;i<5;i++){ const x=((tempo*12+i*W/4)%(W+300))-150, y=H*(.2+i*.15); c.drawImage(NEVOA,x-160,y-60,320,120); } c.globalAlpha=1; }
  if(gotas.length){ c.strokeStyle='rgba(220,232,245,.65)'; c.lineWidth=1.4; c.beginPath(); for(const g of gotas){ c.moveTo(g.x,g.y); c.lineTo(g.x-g.l*.18,g.y+g.l); } c.stroke(); }
  if(FESTA){ // bandeirinhas no topo
    const Y=128, n=Math.ceil(W/26); c.strokeStyle='rgba(107,84,64,.6)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,Y); for(let i=0;i<=n;i++) c.lineTo(i*26,Y+Math.sin(i*1.3)*3+(i%2?4:0)); c.stroke();
    const cores=['#e3798a','#f2c14e','#86afcf','#86a86b','#a07bb7'];
    for(let i=0;i<n;i++){ const x=i*26+4, y=Y+2+(i%2?4:0)+Math.sin(tempo*2+i)*1.5; c.fillStyle=cores[i%5]; c.beginPath(); c.moveTo(x,y); c.lineTo(x+16,y); c.lineTo(x+8,y+14); c.closePath(); c.fill(); }
  }
}

/* =====================================================================
   PEDIDOS DO CARDÁPIO: gatinhos pedem comida e bebida
   ===================================================================== */
let pedidoT=20;
const FAV={g:['maracuja','cafezinho','pizza','cafezinho','pipoca'],n:['morango','cheesecake','pipoca','salada','morango','pizza']};
const FRASE_PEDIDO={sopa:'uma sopinha bem quentinha, por favor',pao:'tem pão de cenoura saindo?',pizza:'uma fatia de pizza vegetariana!',salada:'uma saladinha fresquinha da estufa',marsh:'um marshmallow dourado, nem cru nem queimado',
  cafezinho:'um cafezinho, por favor. café é vida',maracuja:'um suco de maracujá bem geladinho',morango:'suco de morango! (e depois eu roubo um gole do maracujá)',cheesecake:'um pedaço de cheesecake de cereja...',pipoca:'pipoca pro filme, por favor'};
const menuDisp=()=>MENU.filter(m=>estAberta(m.est));
function spawnPedido(){
  if(visitando||!csAberto) return;
  const disp=menuDisp(); if(!disp.length) return;
  if(cats.filter(c=>c.pedido).length>=2) return;
  const cand=cats.filter(c=>!c.pedido&&!c.o.visit&&!c.o.parado&&!(c.estado==='work'&&c.o.acao==='dormir'));
  if(!cand.length) return;
  const g=cand[Math.floor(Math.random()*cand.length)];
  let ids=disp.map(m=>m.id);
  if(g.o.heroi){ const f=FAV[g.o.heroi].filter(x=>ids.includes(x)); if(f.length) ids=f; }
  g.pedido={id:ids[Math.floor(Math.random()*ids.length)],t:50,ini:tempo};
  precisaDesenhar=true;
}
function atualizarPedidos(dt){
  pedidoT-=dt; if(pedidoT<=0){ pedidoT=28+Math.random()*34; spawnPedido(); }
  for(const g of cats) if(g.pedido){ g.pedido.t-=dt; if(g.pedido.t<=0){ g.pedido=null; if(sheetAtual==='pedido') fecharSheet(); } }
}
function desenharPedido(c,g){
  const m=menuDef(g.pedido.id); if(!m) return;
  const sp=sprite('mn'+m.id,[0,0,32,32],()=>inner(m.svg)); const y=g.y-68+Math.sin(tempo*4+g.fase)*2.5;
  c.fillStyle='#fffdf8'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(g.x,y,15,0,6.283); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(g.x-5,y+13); c.lineTo(g.x,y+21); c.lineTo(g.x+5,y+13); c.fill(); c.stroke(); c.fillStyle='#fffdf8'; c.fillRect(g.x-4,y+11,8,4);
  const k=Math.max(0,g.pedido.t/50); c.strokeStyle=k<.25?'#e3606e':'#86a86b'; c.lineWidth=2.6; c.beginPath(); c.arc(g.x,y,18,-1.5708,-1.5708+6.283*k); c.stroke();
  if(sp) c.drawImage(sp.img,g.x-11,y-11,22,22);
}
let pedidoGato=null;
function abrirPedido(g){
  pedidoGato=g; const m=menuDef(g.pedido.id), nome=esc(g.o.nome);
  const port=g.o.heroi?`<svg viewBox="${ALIEN_BOX.join(' ')}" style="width:76px;height:90px">${alienSVG(g.o.heroi,g.o.disf,false)}</svg>`:`<svg viewBox="-28 -62 56 68" style="width:76px;height:90px">${gatoSVG(g.o,1)}</svg>`;
  abrirSheet(`<div class="vl-herois">${port}<div class="vl-letter" style="margin:0;flex:1;padding:12px 14px"><p style="font-size:15px;line-height:22px">${esc(FRASE_PEDIDO[m.id])}</p><div class="sig" style="font-size:13px">— ${nome}</div></div></div>
    <h2 style="font-size:18px;margin-top:8px">o que ${nome} pediu?</h2>
    <div class="vl-menu">${menuDisp().map(x=>`<button onclick="vlServir('${x.id}')"><span class="vl-ic">${x.svg}</span><small>${x.nome}</small></button>`).join('')}</div>
    <p class="vl-small">mais itens aparecem no cardápio conforme a vila cresce</p>`,'pedido');
}
window.vlServir=function(id){
  const g=pedidoGato; if(!g||!g.pedido) { fecharSheet(); return; }
  if(g.pedido.id!==id){ vila.stats.erros++; csDirty=true; Som.blip(.5); g.fala={txt:['hmm... não era bem isso','isso não é o que eu pedi, né?','quase! tenta de novo','*olha confuso*'][Math.floor(Math.random()*4)],t:2.6}; toast('não era esse...'); return; }
  const rapido=tempo-g.pedido.ini<12;
  const v=Math.max(20,vilaRate()*25)*(rapido?1.5:1), h=g.o.heroi?2:1;
  vila.moedas+=v; vila.coracoes+=h; vila.stats.pedidos++; vila.stats.ganhos+=v; csDirty=true;
  progMissao('pedidos',1); progMissao('ganhos',v);
  const m=menuDef(id); g.pedido=null; g.pulo=1;
  let fala=['obrigadinho!','que delícia!','*ronrona*','tava com saudade disso'][Math.floor(Math.random()*4)];
  if(g.o.heroi==='n'&&id==='morango') fala='hmm... agora me dá um gole do seu maracujá? pode não?';
  if(g.o.heroi==='g'&&id==='cafezinho') fala='café é vida. obrigado, meu bem';
  if(g.o.heroi==='g'&&id==='maracuja') fala='maracujá, sempre. (ela vai roubar, eu sei)';
  if(g.o.heroi==='n'&&id==='cheesecake') fala='cheesecake de cereja!! você me conhece';
  g.fala={txt:fala,t:3.2};
  ftxt(g.x,g.y-60,`+${fmt(v)}${rapido?' rapidinho!':''} +${h} ♥`,'');
  Som.chime(); fecharSheet(); atualizarHud(); atualizarPasso(true);
};

/* =====================================================================
   CONQUISTAS
   ===================================================================== */
const CONQ=[
  {id:'carinho1',nome:'primeiro carinho',desc:'fazer carinho num gatinho',ok:v=>v.stats.taps>=1,p:1},
  {id:'carinho100',nome:'mão de veludo',desc:'100 carinhos',ok:v=>v.stats.taps>=100,p:3},
  {id:'carinho1000',nome:'ronronômetro',desc:'1.000 carinhos',ok:v=>v.stats.taps>=1000,p:8},
  {id:'est5',nome:'vilarejo',desc:'5 construções abertas',ok:()=>nAbertas()>=5,p:3},
  {id:'est10',nome:'cidadezinha',desc:'10 construções abertas',ok:()=>nAbertas()>=10,p:6},
  {id:'esttodas',nome:'a floresta inteira',desc:'todas as construções',ok:()=>nAbertas()>=ESTACOES.length,p:15},
  {id:'castelo',nome:'castelo aceso',desc:'restaurar o castelo inteiro',ok:v=>v.castelo>=CASTELO.length,p:8},
  {id:'rainha',nome:'confidente da Rainha',desc:'ler todas as cartas da Rainha',ok:v=>CARTAS.every((_,i)=>v.cartas.includes(i)),p:5},
  {id:'feira',nome:'encontro na feira',desc:'viver a feira dos viajantes',ok:()=>leu('feira'),p:4},
  {id:'chuva',nome:'a chuva revela',desc:'tirar o disfarce na chuva',ok:()=>leu('chuva'),p:6},
  {id:'pedido',nome:'disse sim',desc:'viver o pedido no cinema',ok:()=>leu('pedido'),p:8},
  {id:'historia',nome:'felizes pra sempre',desc:'ler todos os capítulos',ok:v=>v.cap.length>=HIST.length,p:15},
  {id:'postal5',nome:'turistas',desc:'5 postais do balão',ok:v=>v.postais.length>=5,p:4},
  {id:'postais',nome:'volta ao mundo',desc:'todos os postais',ok:v=>v.postais.length>=POSTAIS.length,p:10},
  {id:'ped10',nome:'garçom fofinho',desc:'atender 10 pedidos',ok:v=>v.stats.pedidos>=10,p:3},
  {id:'ped50',nome:'chef da vila',desc:'atender 50 pedidos',ok:v=>v.stats.pedidos>=50,p:6},
  {id:'visit20',nome:'anfitriões',desc:'receber 20 visitantes',ok:v=>v.stats.encomendas>=20,p:4},
  {id:'adota5',nome:'família grande',desc:'adotar 5 gatinhos',ok:v=>v.adotados.length>=5,p:4},
  {id:'enfeites',nome:'decoradores',desc:'colocar todos os enfeites',ok:v=>v.decor>=DECORS.length,p:6},
  {id:'nivel100',nome:'vila querida',desc:'vila nível 100',ok:()=>vilaNivel()>=100,p:5},
  {id:'nivel500',nome:'lenda do bosque',desc:'vila nível 500',ok:()=>vilaNivel()>=500,p:10},
  {id:'mi',nome:'cofrinho cheio',desc:'juntar 1 milhão de moedas no total',ok:v=>v.stats.ganhos>=1e6,p:3},
  {id:'bi',nome:'tio patinhas',desc:'juntar 1 bilhão de moedas no total',ok:v=>v.stats.ganhos>=1e9,p:6},
  {id:'chuvoso',nome:'dia de chuva',desc:'jogar enquanto chove na vila',ok:v=>v.stats.chuva>=1,p:2},
  {id:'coruja',nome:'corujinhas',desc:'jogar de noite',ok:v=>v.stats.noite>=1,p:2},
  {id:'festa',nome:'festa na vila',desc:'jogar num mêsversário',ok:v=>v.stats.festa>=1,p:5},
  {id:'presente',nome:'presente surpresa',desc:'mandar um presente pro outro',ok:v=>v.stats.presentes>=1,p:3},
  {id:'visita',nome:'visita de surpresa',desc:'visitar a vila do outro',ok:v=>v.stats.visitas>=1,p:3},
  {id:'cenas',nome:'cinéfilos',desc:'assistir 5 cenas da história',ok:v=>v.stats.cenas>=5,p:3}
];
function conqProntas(){ if(!perfil||visitando) return []; return CONQ.filter(c=>!vila.conq.includes(c.id)&&c.ok(vila)); }
const conqAvisadas=new Set();
function checarConquistas(){
  const pr=conqProntas(); let nova=null;
  pr.forEach(c=>{ if(!conqAvisadas.has(c.id)){ conqAvisadas.add(c.id); nova=c; } });
  if(nova&&csAberto){ toast(`conquista: ${nova.nome}! (resgate no troféu)`); Som.chime(); }
  atualizarDots();
}
function painelConquistas(){
  const feitas=vila.conq.length;
  abrirSheet(`<h2>conquistas</h2><div class="vl-sub">${feitas}/${CONQ.length} conquistadas</div><div class="vl-conq">${CONQ.map(c=>{ const tem=vila.conq.includes(c.id), pronta=!tem&&c.ok(vila);
    return `<div class="${tem?'ok':pronta?'pronta':''}"><span class="vl-ic">${ICON.trophy}</span><b>${c.nome}</b><small>${c.desc}</small>${pronta?`<button onclick="vlConq('${c.id}')">+${c.p} ${ic('heart')}</button>`:tem?'<em>feito</em>':`<em>+${c.p} ♥</em>`}</div>`; }).join('')}</div>`,'conq');
}
window.vlConq=function(id){ const c=CONQ.find(x=>x.id===id); if(!c||vila.conq.includes(id)||!c.ok(vila)) return; vila.conq.push(id); vila.coracoes+=c.p; csDirty=true; escrever(); csDirty=false; Som.fanfarra(); painelConquistas(); atualizarHud(); atualizarDots(); };
window.vlConquistas=function(){ painelConquistas(); };

/* =====================================================================
   CARTAS DA RAINHA (uma por parte do castelo)
   ===================================================================== */
function cartasRainhaNovas(){ if(visitando) return []; return CARTAS.map((_,i)=>i).filter(i=>i<vila.castelo&&!vila.cartas.includes(i)); }
window.abrirCartaRainha=function(i){
  const c=CARTAS[i]; if(!c||i>=vila.castelo) return;
  const nova=!vila.cartas.includes(i);
  if(nova){ vila.cartas.push(i); vila.coracoes+=c.premio; csDirty=true; escrever(); csDirty=false; atualizarHud(); setTimeout(()=>{ toast(`+${c.premio} corações`); Som.chime(); },400); }
  abrirSheet(`<svg viewBox="-30 -62 60 68" class="vl-queen">${rainhaSVG(1)}</svg><h2>${c.t}</h2><div class="vl-sub">carta da Rainha Mimosa</div>
    <div class="vl-letter"><span class="seal">${ICON.crown}</span><p>${esc(c.txt)}</p></div>
    <button class="vl-btn rose" onclick="vlPainel('rainha','rainha')">voltar às cartas</button>`,'carta');
  atualizarDots(); atualizarPasso(true);
};

/* --- mural de postais da praça --- */
function sheetMural(){
  const g=perfil==='g';
  abrirSheet(`<h2>mural de postais</h2><div class="vl-sub">os viajantes deixam recados aqui</div>
    <div class="vl-postais" style="grid-template-columns:1fr">
      <div>${postalSVG(POSTAIS.find(p=>p.id==='rio'),true)}<b>lembrança do Rio das Estrelas</b><small>assinado: uma boina</small></div>
    </div>
    <div class="vl-letter" style="margin-top:12px"><p>${vila.cap.includes(2)?(g?'"essas ondas aí são do tamanho da minha vontade de ir embora... ou do meu cabelo de manhã" — escrito numa letra toda torta\n\n"hahahaha besta" — respondeu a boina':'"essas ondas aí são do tamanho da minha vontade de ir embora... ou do meu cabelo de manhã" — escrito numa letra toda torta\n\n"hahahaha besta" — você respondeu'):'tem um postal novo aqui... quem será que desenhou?'}</p></div>
    <button class="vl-btn rose" onclick="vlPainel('rainha','cap')">abrir a história</button>`,'mural');
}

/* --- visitantes --- */
function agendarVisitante(){ clearTimeout(visitT); visitT=setTimeout(spawnVisitante,(30+Math.random()*45)*1000); }
function spawnVisitante(){
  if(!csAberto||visitante||visitando){ agendarVisitante(); return; }
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
  if(!vila.cap.includes(0)) setTimeout(()=>abrirCarta(0),500);
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
    // cama de chuva (ruído filtrado) — volume controlado pelo clima
    const rs=c.createBufferSource(); rs.buffer=buf; rs.loop=true; const rf=c.createBiquadFilter(); rf.type='lowpass'; rf.frequency.value=1500; const rg=c.createGain(); rg.gain.value=0; rs.connect(rf); rf.connect(rg); rg.connect(this.master); rs.start(); this.chuvaG=rg;
  },
  start(){
    if(!this.on) return; this.init(); if(!this.ctx) return;
    this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(.55,this.ctx.currentTime,1.2);
    if(!this.timer){ this.atual=this.escolher(); this.step=0; this.next=this.ctx.currentTime+.15; this.timer=setInterval(()=>this.sched(),110); }
    if(!this.ambT) this.amb();
  },
  stop(){ if(!this.ctx) return; this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.35); clearInterval(this.timer); this.timer=null; clearTimeout(this.ambT); this.ambT=null; },
  toggle(){ this.on=!this.on; LS.set('vilaSom',this.on); if(this.on) this.start(); else this.stop(); const b=$('vl-som'); if(b) b.classList.toggle('off',!this.on); },
  hz:m=>440*Math.pow(2,(m-69)/12),
  /* trilhas: cada uma com tempo, acordes, escala e instrumentação próprios */
  TR:{
    dia:  {bpm:72, passos:16, CH:[[53,57,60,64],[50,53,57,60],[46,50,53,57],[48,52,55,58]], ESC:[65,67,69,72,74,77,79,81], kick:[0,10], hat:[2,6,10,14], baixo:[0,8], mel:.32, voz:'sino'},
    noite:{bpm:56, passos:16, CH:[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]], ESC:[69,72,74,76,79,81,84], kick:[], hat:[], baixo:[0], mel:.22, voz:'caixinha'},
    chuva:{bpm:64, passos:16, CH:[[50,53,57,60,64],[55,59,62,65],[48,52,55,59,62],[57,60,64,67]], ESC:[62,64,65,67,69,72,74,76], kick:[0,7,10], hat:[4,12], escova:1, baixo:[0,6,8], mel:.26, voz:'rhodes'},
    festa:{bpm:100,passos:16, CH:[[48,52,55,60],[55,59,62,67],[57,60,64,69],[53,57,60,65]], ESC:[72,74,76,79,81,84], kick:[0,4,8,12], hat:[2,6,10,14], palma:[4,12], baixo:[0,3,8,11], mel:.5, voz:'pluck'},
    cena: {bpm:78, passos:12, CH:[[53,57,60,64],[52,55,59,64],[50,53,57,62],[55,59,62,65]], ESC:[65,67,69,72,74,76,77,79], kick:[], hat:[], baixo:[0], harpa:1, mel:.3, voz:'sino'}
  },
  forcada:null, atual:'dia',
  escolher(){ if(this.forcada) return this.forcada; if(FESTA) return 'festa'; if(CLIMA.tipo==='chuva') return 'chuva'; if(NOITE>.5) return 'noite'; return 'dia'; },
  forcar(t){ this.forcada=t||null; },
  sched(){
    const c=this.ctx;
    while(this.next<c.currentTime+.6){
      const T=this.TR[this.atual]||this.TR.dia, e=60/T.bpm/2;
      this.tocarPasso(this.step,this.next,e,T); this.next+=e; this.step++;
      if(this.step%T.passos===0){ const n=this.escolher(); if(n!==this.atual){ this.atual=n; this.step=0; } }
    }
  },
  tocarPasso(s,t,e,T){
    const P=T.passos, pos=s%P, ci=Math.floor(s/P)%T.CH.length, ch=T.CH[ci];
    if(pos===0) ch.forEach((m,i)=>this.pad(m,t+i*.03,e*P,T===this.TR.festa?.022:.035));
    if(T.baixo.includes(pos)) this.nota(ch[0]-12,t,e*(T===this.TR.festa?1.6:6),'sine',T===this.TR.noite?.1:.15,false,.02);
    if(T.hat.includes(pos)) T.escova?this.escova(t):this.hat(t);
    if(T.kick.includes(pos)) this.kick(t);
    if(T.palma&&T.palma.includes(pos)) this.palma(t);
    if(T.harpa){ const m=ch[pos%ch.length]+(pos>=ch.length?12:0); this.nota(m+12,t,1.2,'triangle',.035,true,.004); }
    if(pos%2===0 && Math.random()<T.mel){
      const tons=T.ESC.filter(m=>ch.some(x=>(m-x)%12===0)||Math.random()<.4);
      const m=tons[Math.floor(Math.random()*tons.length)], tt=t+(Math.random()<.3?e*.5:0);
      this.voz(T.voz,m,tt);
    }
  },
  voz(v,m,t){
    if(v==='caixinha'){ this.nota(m+12,t,.7,'triangle',.05,true,.002); this.nota(m+24,t,.25,'sine',.012,true,.002); }
    else if(v==='rhodes'){ this.nota(m,t,1.8,'sine',.06,true,.01); this.nota(m+12,t,.9,'sine',.018,false,.01); this.nota(m+19,t,.4,'triangle',.006,false,.01); }
    else if(v==='pluck'){ this.nota(m,t,.32,'triangle',.06,true,.003); this.nota(m+12,t,.18,'square',.008,false,.003); }
    else { this.nota(m,t,1.5,'sine',.07,true,.005); this.nota(m+12,t,0.6,'triangle',.015,true,.005); }
  },
  escova(t){ const c=this.ctx,s=c.createBufferSource(); s.buffer=this.noise; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3500; f.Q.value=.6; const v=c.createGain(); v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(.03,t+.04); v.gain.exponentialRampToValueAtTime(.0001,t+.25); s.connect(f); f.connect(v); v.connect(this.master); s.start(t,Math.random()); s.stop(t+.3); },
  palma(t){ const c=this.ctx; for(let i=0;i<3;i++){ const s=c.createBufferSource(); s.buffer=this.noise; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1400; const v=c.createGain(), ti=t+i*.012; v.gain.setValueAtTime(.05,ti); v.gain.exponentialRampToValueAtTime(.0001,ti+.08); s.connect(f); f.connect(v); v.connect(this.master); s.start(ti,Math.random()); s.stop(ti+.1); } },
  nota(m,t,dur,tipo,g,fx,atk){
    const c=this.ctx,o=c.createOscillator(),v=c.createGain(); o.type=tipo; o.frequency.value=this.hz(m);
    v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+(atk||.01)); v.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(v); v.connect(this.master); if(fx) v.connect(this.fx); o.start(t); o.stop(t+dur+.05);
  },
  pad(m,t,dur,g){
    g=g||.035; const c=this.ctx, f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900; f.Q.value=.3;
    const at=Math.min(1.4,dur*.3);
    const v=c.createGain(); v.gain.setValueAtTime(0,t); v.gain.linearRampToValueAtTime(g,t+at); v.gain.setValueAtTime(g,t+Math.max(at,dur-1.2)); v.gain.linearRampToValueAtTime(0,t+dur+.4);
    [-6,6].forEach(dt=>{ const o=c.createOscillator(); o.type='triangle'; o.frequency.value=this.hz(m); o.detune.value=dt; o.connect(f); o.start(t); o.stop(t+dur+.5); });
    f.connect(v); v.connect(this.master); v.connect(this.fx);
  },
  hat(t){ const c=this.ctx,s=c.createBufferSource(); s.buffer=this.noise; const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000; const v=c.createGain(); v.gain.setValueAtTime(.025,t); v.gain.exponentialRampToValueAtTime(.0001,t+.05); s.connect(f); f.connect(v); v.connect(this.master); s.start(t,Math.random()); s.stop(t+.06); },
  kick(t){ const c=this.ctx,o=c.createOscillator(),v=c.createGain(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(45,t+.18); v.gain.setValueAtTime(.12,t); v.gain.exponentialRampToValueAtTime(.0001,t+.3); o.connect(v); v.connect(this.master); o.start(t); o.stop(t+.32); },
  amb(){
    if(!this.ctx||!this.on){ this.ambT=null; return; }
    const c=this.ctx, t=c.currentTime+.05;
    if(this.chuvaG) this.chuvaG.gain.setTargetAtTime(CLIMA.tipo==='chuva'?.09:0,c.currentTime,1.5);
    if(CLIMA.tipo==='chuva'){ /* só a chuva */ }
    else if(noite()>.5){ // grilos
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
/* ganchos pra testes automáticos (não mudam o jogo) */
window.__vilaDebug={get vila(){ return vila; },get cats(){ return cats; },get obras(){ return obras; },proximoPasso:()=>proximoPasso(),spawnPedido:()=>spawnPedido(),
  festa:f=>{ festaForcada=f||null; atualizarClima(); },get correio(){ return correio; },get parceiro(){ return parceiro; },get visitando(){ return visitando; },get view(){ return view; },focar:(x,y,s)=>focar(x,y,s)};
/* arte e som pra quem desenha as cenas (vila-cenas.js) */
window.VilaArte={gatoSVG,rainhaSVG,arvoreSVG,casteloSVG,decorSVG,postalSVG,CONSTRUCAO,INK,POSTAIS,
  som:{init:()=>Som.init(),forcar:t=>{ Som.forcar(t); if(Som.ctx&&Som.on){ Som.atual=Som.escolher(); Som.step=0; } },chime:()=>Som.chime(),fanfarra:()=>Som.fanfarra(),blip:k=>Som.blip(k),ligado:()=>Som.on}};


})();
