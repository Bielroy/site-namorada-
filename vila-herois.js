/* =====================================================================
   GABRIX E NATALIX — os dois gatos alienígenas (baseados no quadro)
   alienSVG(quem, disfarce, olhosFechados) → conteúdo SVG, âncora nos pés
   quem: 'g' (Gabrix) ou 'n' (Natalix)
   ===================================================================== */
(function(){
const INK='#4a3a2e';
const VERDE='#b9dc4c', VERDE_ESC='#8fb62f', VERDE_CLARO='#d6ee7c';
const CABELO='#24201f', CABELO_BRILHO='#5a5352';
const S=`stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;

/* cabelo da Natalix: longo, liso, com franja (fica atrás e na frente da cabeça) */
const cabeloNatTras=`<path d="M-15 -38 C-20 -26 -20 -14 -18 -6 C-16 -3 -13 -3 -11 -6 L11 -6 C13 -3 16 -3 18 -6 C20 -14 20 -26 15 -38 Z" fill="${CABELO}" ${S}/>`;
const cabeloNatFrente=`<path d="M-15.5 -31 C-17 -45 -6 -48 0 -47.5 C8 -48 17 -45 15.5 -31 C13 -35.5 10 -36 8 -34 C6 -37 2.5 -37.4 0 -34.5 C-2.5 -37.4 -6 -37 -8 -34 C-10 -36 -13 -35.5 -15.5 -31 Z" fill="${CABELO}" ${S}/>
  <path d="M-15 -32 C-17 -24 -17 -16 -16 -9 M15 -32 C17 -24 17 -16 16 -9" stroke="${CABELO}" stroke-width="4.4" stroke-linecap="round"/>
  <path d="M-8 -44 C-4 -46 2 -46 6 -44" stroke="${CABELO_BRILHO}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
/* cabelo do Gabrix: ondulado (não cacheado), meio bagunçado */
const cabeloGab=`<path d="M-15 -33 C-19 -40 -15 -47 -9 -47 C-7 -52 0 -53 3 -49 C7 -53 14 -51 15 -45 C20 -43 19 -36 15 -33 C13 -37 10 -38 8 -35 C6 -39 2 -39 0 -36 C-2 -40 -6 -40 -8 -36 C-10 -39 -13 -38 -15 -33 Z" fill="${CABELO}" ${S}/>
  <path d="M-11 -44 q3 -3 6 0 M2 -47 q3 -3 6 0" stroke="${CABELO_BRILHO}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M15 -42 q5 1 4 6" stroke="${CABELO}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
/* óculos quadrados */
const oculos=`<rect x="-12.5" y="-34" width="10" height="8.5" rx="2.2" fill="rgba(255,255,255,.12)" stroke="${INK}" stroke-width="1.6"/><rect x="2.5" y="-34" width="10" height="8.5" rx="2.2" fill="rgba(255,255,255,.12)" stroke="${INK}" stroke-width="1.6"/><path d="M-2.5 -30 h5" stroke="${INK}" stroke-width="1.6"/>`;
/* bigode + cavanhaque (sem barba) */
const bigode=`<path d="M-5 -22.6 C-3 -24.2 -1 -23.6 0 -22.8 C1 -23.6 3 -24.2 5 -22.6 C3 -21.4 1 -21.8 0 -22.3 C-1 -21.8 -3 -21.4 -5 -22.6 Z" fill="${CABELO}"/>
  <path d="M-2.4 -18.6 C-2 -15.6 2 -15.6 2.4 -18.6 C1 -17.8 -1 -17.8 -2.4 -18.6 Z" fill="${CABELO}"/>`;

function antenas(cor){ return `<path d="M-7 -38 C-9 -46 -11 -50 -13 -53 M7 -38 C9 -46 11 -50 13 -53" stroke="${INK}" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M-7 -38 C-9 -46 -11 -50 -13 -53 M7 -38 C9 -46 11 -50 13 -53" stroke="${cor}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="-13.5" cy="-54.5" r="3.6" fill="${cor}" ${S}/><circle cx="13.5" cy="-54.5" r="3.6" fill="${cor}" ${S}/><circle cx="-14.4" cy="-55.6" r="1.1" fill="#fff" opacity=".8"/><circle cx="12.6" cy="-55.6" r="1.1" fill="#fff" opacity=".8"/>`; }

/* olhos alienígenas: grandes, pretos, brilhantes, levemente inclinados */
function olhosAlien(fech){
  if(fech) return `<path d="M-11 -29 q4.5 3 9 0 M2 -29 q4.5 3 9 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<ellipse cx="-6.6" cy="-29.4" rx="4.6" ry="3.6" transform="rotate(14 -6.6 -29.4)" fill="#151214"/><ellipse cx="6.6" cy="-29.4" rx="4.6" ry="3.6" transform="rotate(-14 6.6 -29.4)" fill="#151214"/>
    <ellipse cx="-7.6" cy="-30.6" rx="1.6" ry="1" fill="#fff" opacity=".9"/><ellipse cx="5.6" cy="-30.6" rx="1.6" ry="1" fill="#fff" opacity=".9"/><circle cx="-4.8" cy="-28" r=".6" fill="#fff" opacity=".6"/><circle cx="8.4" cy="-28" r=".6" fill="#fff" opacity=".6"/>`;
}
/* olhos de gato comum (disfarce) */
function olhosGato(fech){
  if(fech) return `<path d="M-7 -29.5 q2.4 2 4.8 0 M2.2 -29.5 q2.4 2 4.8 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return `<ellipse cx="-4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><ellipse cx="4.6" cy="-29.5" rx="1.7" ry="2.1" fill="${INK}"/><circle cx="-4" cy="-30.3" r=".6" fill="#fff"/><circle cx="5.2" cy="-30.3" r=".6" fill="#fff"/>`;
}
/* nariz: no alien é o triangulozinho escuro do quadro; boca pequena e séria */
const narizAlien=`<path d="M-2.2 -24.6 L2.2 -24.6 L0 -22.6 Z" fill="#2b2326" stroke="#2b2326" stroke-width="1" stroke-linejoin="round"/><path d="M-1 -24.3 h1" stroke="#fff" stroke-width=".7" opacity=".7"/>`;
const bocaAlien=`<path d="M-2.2 -19.6 L0 -21 L2.2 -19.6" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

function alienSVG(quem,disfarce,fech,semRabo){
  const nat=quem==='n';
  // no disfarce: pelo de gato comum (pó de disfarce); revelado: verde-limão do quadro
  const pelo=disfarce?(nat?'#e6d2b8':'#a7896b'):VERDE;
  const det=disfarce?(nat?'#c9ad8c':'#836a51'):VERDE_ESC;
  const roupa=nat
    ? (disfarce?`<path d="M-13 -19 C-17 -10 -16 -1 -12 1 L12 1 C16 -1 17 -10 13 -19 C8 -16 -8 -16 -13 -19 Z" fill="#4b3b35" ${S}/><path d="M-10 -14 v13 M-5 -15 v15 M0 -15 v15 M5 -15 v15 M10 -14 v13" stroke="#5e4b44" stroke-width="1.4"/>`:'')
    : (disfarce?`<path d="M-12 -18 C-16 -10 -15 -1 -12 1 L12 1 C15 -1 16 -10 12 -18 C8 -15 -8 -15 -12 -18 Z" fill="#3c3a40" ${S}/><path d="M-6 -16 L0 -9 L6 -16" fill="#cfe0f0" ${S}/>`:'');
  const listras=disfarce&&!nat?`<path d="M-4 -40 l1 4 M0 -41 v4 M4 -40 l-1 4" stroke="${det}" stroke-width="1.8" stroke-linecap="round"/>`:'';
  const orelhas=`<path d="M-12 -34 L-12 -47 L-3 -40 Z M12 -34 L12 -47 L3 -40 Z" fill="${pelo}" ${S}/><path d="M-10 -37 L-10 -43 L-6 -40 Z M10 -37 L10 -43 L6 -40 Z" fill="${disfarce?'#f4b6b6':VERDE_CLARO}"/>`;
  // disfarce: gorro (ele) ou boina (ela) escondendo as antenas — com uma pontinha verde escapando
  const chapeu=disfarce
    ? (nat?`<path d="M-15 -42 C-18 -52 4 -56 16 -48 C19 -45 15 -41 10 -41 C2 -43 -8 -42 -15 -42 Z" fill="#8c2f3c" ${S}/><circle cx="2" cy="-53" r="1.8" fill="#8c2f3c" ${S}/><circle cx="17" cy="-49" r="2.2" fill="${VERDE}" ${S}/>`
         :`<path d="M-14 -38 C-15 -52 15 -52 14 -38 Z" fill="#2f3a4a" ${S}/><path d="M-15 -38 h30" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M-15 -38 h30" stroke="#3d4a5e" stroke-width="2" stroke-linecap="round"/><path d="M-10 -44 h20 M-11 -41 h22" stroke="#3d4a5e" stroke-width="1.2"/><circle cx="-12" cy="-50" r="2" fill="${VERDE}" ${S}/>`)
    : antenas(VERDE);
  const bochecha=nat?`<ellipse cx="-9" cy="-23.6" rx="3" ry="1.7" fill="#f2a9b4" opacity=".9"/><ellipse cx="9" cy="-23.6" rx="3" ry="1.7" fill="#f2a9b4" opacity=".9"/>`:`<ellipse cx="-9.4" cy="-23.4" rx="2.4" ry="1.3" fill="#f2a9b4" opacity=".55"/><ellipse cx="9.4" cy="-23.4" rx="2.4" ry="1.3" fill="#f2a9b4" opacity=".55"/>`;
  const rosto = disfarce
    ? `${olhosGato(fech)}<path d="M-2 -25.5 q1 1.4 2 0 q1 1.4 2 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    : `${olhosAlien(fech)}${narizAlien}${bocaAlien}`;
  const brilhoAlien=disfarce?'':`<ellipse cx="-6" cy="-37" rx="5" ry="2" fill="${VERDE_CLARO}" opacity=".7"/>`;
  return `<ellipse cx="0" cy="1" rx="14" ry="4" fill="rgba(60,50,30,.22)"/>
   ${nat?cabeloNatTras:''}
   ${semRabo?'':`<path d="M10 -4 C21 -4 23 -14 18 -21" stroke="${INK}" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M10 -4 C21 -4 23 -14 18 -21" stroke="${pelo}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`}
   <ellipse cx="0" cy="-10" rx="12.5" ry="11.5" fill="${pelo}" ${S}/>
   ${roupa}
   <ellipse cx="-5" cy="-1" rx="4" ry="2.6" fill="${pelo}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="5" cy="-1" rx="4" ry="2.6" fill="${pelo}" stroke="${INK}" stroke-width="1.6"/>
   ${disfarce?'':''}
   ${orelhas}
   <ellipse cx="0" cy="-29" rx="14.5" ry="12" fill="${pelo}" ${S}/>${brilhoAlien}${listras}
   ${rosto}${bochecha}
   ${nat?cabeloNatFrente:cabeloGab}
   ${nat?'':oculos+bigode}
   ${chapeu}`;
}
window.alienSVG=alienSVG;
window.peloAlien=(q,disf)=>disf?(q==='n'?'#e6d2b8':'#a7896b'):VERDE;
window.ALIEN_BOX=[-30,-64,60,72];
})();
