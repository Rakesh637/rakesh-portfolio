/* Extracted from the original final portfolio. Behavior unchanged. */

const opening = document.getElementById('opening');
const details = document.getElementById('details');
const openButton = document.getElementById('openButton');
const openBall = document.getElementById('openBall');

const themeToggle = document.getElementById('themeToggle');
const detailsThemeToggle = document.getElementById('detailsThemeToggle');
const savedTheme = localStorage.getItem('rakesh-theme');
function syncThemeToggle(btn, night){
  if(!btn) return;
  btn.setAttribute('aria-pressed', String(night));
  btn.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
  btn.setAttribute('title', night ? 'Switch to day mode' : 'Switch to night mode');
  const icon = btn.querySelector('.theme-toggle-icon');
  if(icon) icon.textContent = night ? '☀' : '☾';
}
function applyTheme(mode){
  const night = mode === 'night';
  document.body.classList.toggle('night-mode', night);
  syncThemeToggle(themeToggle, night);
  syncThemeToggle(detailsThemeToggle, night);
}
applyTheme(savedTheme === 'night' ? 'night' : 'day');
function syncPageThemeControls(showDetailsPage){
  if(themeToggle) themeToggle.style.display = showDetailsPage ? 'none' : 'inline-flex';
  if(detailsThemeToggle) detailsThemeToggle.style.display = showDetailsPage ? 'inline-flex' : 'none';
}
syncPageThemeControls(false);
function toggleTheme(){
  const next = document.body.classList.contains('night-mode') ? 'day' : 'night';
  applyTheme(next);
  localStorage.setItem('rakesh-theme', next);
}
if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
if(detailsThemeToggle) detailsThemeToggle.addEventListener('click', toggleTheme);

function showOpening(){
  details.classList.add('hidden');
  syncPageThemeControls(false);
  opening.classList.remove('hidden');
  opening.classList.remove('opening-out');
  document.querySelectorAll('#details .reveal').forEach(el => el.classList.remove('show'));
  window.scrollTo(0,0);
}

function showDetails(){
  opening.classList.add('hidden');
  syncPageThemeControls(true);
  details.classList.remove('hidden');
  requestAnimationFrame(() => {
    document.querySelectorAll('#details .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('show'), Math.min(i * 60, 360));
    });
  });
  window.scrollTo(0,0);
}

function enterFromBall(){
  if(opening.classList.contains('opening-out')) return;
  opening.classList.add('opening-out');
  setTimeout(showDetails, 1900);
}

openButton.addEventListener('click', enterFromBall);
openBall.addEventListener('click', enterFromBall);
openBall.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault();
    enterFromBall();
  }
});

document.getElementById('detailsBack').addEventListener('click', showOpening);

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    ['navan','ottimate','spikewell'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(tab.dataset.company).classList.remove('hidden');
  });
});


// V24 pointer interaction: smooth parallax plus a short directional shake.
// The shake follows the direction of pointer movement, then quickly settles.
const world = document.getElementById('opening');
const openingRoot = document.documentElement;
const openingContent = document.querySelector('.opening-content');
const ballElement = document.getElementById('openBall');
const mountains = document.querySelector('.opening-mountains');
const hills = document.querySelector('.opening-hills');
const grass = document.querySelector('.opening-grass');
const parallaxLayers = Array.from(document.querySelectorAll('.opening-parallax'));
const clouds = Array.from(document.querySelectorAll('.opening-cloud'));

let pointerX = 0, pointerY = 0;
let smoothX = 0, smoothY = 0;
let lastClientX = null, lastClientY = null;
let shakeX = 0, shakeY = 0;
let shakeTargetX = 0, shakeTargetY = 0;

window.addEventListener('pointermove', (e) => {
  if (opening.classList.contains('hidden')) return;

  pointerX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
  pointerY = e.clientY / Math.max(1, window.innerHeight) - 0.5;

  if (lastClientX !== null) {
    const dx = Math.max(-28, Math.min(28, e.clientX - lastClientX));
    const dy = Math.max(-28, Math.min(28, e.clientY - lastClientY));
    // Same direction as the pointer, with a restrained maximum so it feels playful.
    shakeTargetX = Math.max(-9, Math.min(9, shakeTargetX + dx * 0.42));
    shakeTargetY = Math.max(-7, Math.min(7, shakeTargetY + dy * 0.34));
  }
  lastClientX = e.clientX;
  lastClientY = e.clientY;
});

function setShake(el, x, y) {
  if (!el) return;
  el.style.setProperty('--pointer-shake-x', `${x}px`);
  el.style.setProperty('--pointer-shake-y', `${y}px`);
}

function animateWorldDepth(){
  smoothX += (pointerX - smoothX) * 0.045;
  smoothY += (pointerY - smoothY) * 0.045;

  shakeTargetX *= 0.78;
  shakeTargetY *= 0.78;
  shakeX += (shakeTargetX - shakeX) * 0.22;
  shakeY += (shakeTargetY - shakeY) * 0.22;

  openingRoot.style.setProperty('--world-x', `${smoothX * 8}px`);
  openingRoot.style.setProperty('--world-y', `${smoothY * 5}px`);

  setShake(openingContent, shakeX, shakeY);
  setShake(mountains, shakeX * 0.62, shakeY * 0.62);
  setShake(hills, shakeX * 0.48, shakeY * 0.48);
  setShake(grass, shakeX * 0.28, shakeY * 0.28);
  parallaxLayers.forEach((el, i) => {
    const depth = i === 0 ? 0.22 : i === 1 ? 0.32 : 0.42;
    setShake(el, shakeX * depth, shakeY * depth);
  });
  clouds.forEach((el, i) => {
    const depth = i === 0 ? 0.42 : 0.34;
    setShake(el, shakeX * depth, shakeY * depth);
  });

  requestAnimationFrame(animateWorldDepth);
}
animateWorldDepth();

// Ball gets a small positional/rotational response to pointer position.
let bx = 0, by = 0, br = 0, tbx = 0, tby = 0, tbr = 0;
window.addEventListener('pointermove', (e) => {
  if (opening.classList.contains('hidden')) return;
  const nx = e.clientX / Math.max(1, window.innerWidth) - 0.5;
  const ny = e.clientY / Math.max(1, window.innerHeight) - 0.5;
  tbx = nx * 3.5;
  tby = ny * 2.5;
  tbr = nx * 1.2;
});
function animateBall(){
  bx += (tbx - bx) * 0.07;
  by += (tby - by) * 0.07;
  br += (tbr - br) * 0.07;
  if (ballElement && openingContent) {
    openingContent.style.setProperty('--ball-x', `${bx}px`);
    openingContent.style.setProperty('--ball-y', `${by}px`);
    openingContent.style.setProperty('--ball-r', `${br}deg`);
  }
  requestAnimationFrame(animateBall);
}
animateBall();


/* V31 — subtle card pointer depth, scoped to desktop/fine pointer. */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cards = Array.from(document.querySelectorAll('#details .details-card, #details .details-profile'));
  cards.forEach(card => {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--card-rx', `${(-y * 1.15).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(x * 1.15).toFixed(2)}deg`);
        card.style.transform = `translateY(-3px) perspective(900px) rotateX(var(--card-rx)) rotateY(var(--card-ry))`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform='';
    });
  });
})();

showOpening();

// Footer Pokémon interaction: click keeps a Pokémon lifted; hover/focus shows its name.
(function(){
  const footer = document.querySelector('#details .footer-v15');
  if (!footer) return;
  const buttons = Array.from(footer.querySelectorAll('.footer-pokemon'));
  buttons.forEach(button => button.addEventListener('click', () => {
    const wasSelected = button.classList.contains('is-selected');
    buttons.forEach(b => b.classList.remove('is-selected'));
    if (!wasSelected) button.classList.add('is-selected');
  }));
})();

/* V35 — pointer depth only; footer is deliberately excluded. */
(function(){
  const scene=document.getElementById('opening');
  if(!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layers=[
    [scene.querySelector('.opening-mountains'),0.35],
    [scene.querySelector('.opening-hills'),0.22],
    [scene.querySelector('.opening-grass'),0.12],
    [scene.querySelector('.opening-cloud.c1'),0.50],
    [scene.querySelector('.opening-cloud.c2'),0.42]
  ].filter(x=>x[0]);
  let tx=0,ty=0,cx=0,cy=0;
  scene.addEventListener('pointermove',e=>{
    tx=(e.clientX/window.innerWidth-.5)*12;
    ty=(e.clientY/window.innerHeight-.5)*8;
  },{passive:true});
  scene.addEventListener('pointerleave',()=>{tx=0;ty=0},{passive:true});
  function frame(){
    cx+=(tx-cx)*.055; cy+=(ty-cy)*.055;
    layers.forEach(([el,d])=>{
      el.style.setProperty('--final-px',(cx*d).toFixed(2)+'px');
      el.style.setProperty('--final-py',(cy*d).toFixed(2)+'px');
    });
    requestAnimationFrame(frame);
  }
  layers.forEach(([el])=>{
    el.style.translate='var(--final-px,0px) var(--final-py,0px)';
  });
  frame();
})();


/* V56 responsive opening safety
   Keeps the existing cinematic interaction intact while ensuring that
   narrow screens use viewport-safe split distances. */
(function () {
  const opening = document.getElementById('opening');
  if (!opening) return;

  const getSplitDistance = () =>
    Math.min(window.innerHeight * 0.42, 360);

  opening.style.setProperty('--v56-split-distance', `${getSplitDistance()}px`);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      opening.style.setProperty(
        '--v56-split-distance',
        `${getSplitDistance()}px`
      );
    }, 80);
  }, { passive: true });
})();


/* V56 POLISH — responsive opening safety.
   Uses the existing cinematic opening; only adjusts its safe mobile distance. */
(function () {
  const opening = document.getElementById('opening');
  if (!opening) return;

  const updateOpeningBounds = () => {
    const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const safe = Math.min(Math.max(h * 0.38, 180), 340);
    opening.style.setProperty('--safe-opening-split', safe + 'px');
  };

  updateOpeningBounds();
  window.addEventListener('resize', updateOpeningBounds, { passive: true });
})();



/* FINAL CHARACTER HOVER FIX — explicit Pokémon name only */
(function () {
  const selector = '.v53-pokemon[data-name], .v53-pokemon[data-pokemon]';

  const tooltip = document.createElement('div');
  tooltip.className = 'v56-character-name-tooltip';
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltip);

  let active = null;

  function nameFor(el) {
    const name = (el.getAttribute('data-name') || el.getAttribute('data-pokemon') || '').trim();
    if (!name || name === '?' || name === '??') return '';
    return name;
  }

  function clearNativeTooltip(el) {
    if (el.hasAttribute('title')) el.removeAttribute('title');
    const img = el.querySelector('img');
    if (img && img.hasAttribute('title')) img.removeAttribute('title');
  }

  function show(el) {
    const name = nameFor(el);
    if (!name) return;

    clearNativeTooltip(el);
    active = el;
    tooltip.textContent = name;
    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');

    const r = el.getBoundingClientRect();
    const x = Math.max(
      tooltip.offsetWidth / 2 + 8,
      Math.min(window.innerWidth - tooltip.offsetWidth / 2 - 8, r.left + r.width / 2)
    );
    const y = Math.max(tooltip.offsetHeight + 10, r.top - 6);

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hide(el) {
    if (el && active !== el) return;
    active = null;
    tooltip.classList.remove('is-visible');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.textContent = '';
  }

  // Remove native title attributes from every Pokémon wrapper/image once.
  document.querySelectorAll(selector).forEach(clearNativeTooltip);

  document.addEventListener('pointerover', function (event) {
    const el = event.target.closest(selector);
    if (el) show(el);
  }, true);

  document.addEventListener('pointerout', function (event) {
    const el = event.target.closest(selector);
    if (!el) return;
    if (event.relatedTarget && el.contains(event.relatedTarget)) return;
    hide(el);
  }, true);

  document.addEventListener('focusin', function (event) {
    const el = event.target.closest(selector);
    if (el) show(el);
  }, true);

  document.addEventListener('focusout', function (event) {
    const el = event.target.closest(selector);
    if (el) hide(el);
  }, true);
})();
