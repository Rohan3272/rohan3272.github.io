const glow=document.querySelector('.cursor-glow');
// transform (not left/top) and one write per frame, so moving the mouse never triggers layout
let glowX=0,glowY=0,glowRaf=0;
window.addEventListener('pointermove',e=>{glowX=e.clientX;glowY=e.clientY;if(!glowRaf)glowRaf=requestAnimationFrame(()=>{glow.style.transform='translate3d('+glowX+'px,'+glowY+'px,0) translate(-50%,-50%)';glowRaf=0})},{passive:true});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce){document.documentElement.style.scrollBehavior='auto'}
const lightbox=document.getElementById('dashboard-lightbox');
const lightboxImage=document.getElementById('lightbox-image');
const lightboxCaption=document.getElementById('lightbox-caption');
const openLightbox=btn=>{lightboxImage.src=btn.dataset.lightbox;lightboxImage.alt=btn.dataset.caption||'Dashboard preview';lightboxCaption.textContent=btn.dataset.caption||'';lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open')};
const closeLightbox=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');setTimeout(()=>{lightboxImage.src=''},250)};
document.querySelectorAll('.dashboard-shot').forEach(btn=>btn.addEventListener('click',()=>openLightbox(btn)));
document.querySelector('.lightbox-close')?.addEventListener('click',closeLightbox);
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox?.classList.contains('open'))closeLightbox()});

// Profile photo viewer. The actual image is intentionally loaded from assets/profile-photo.jpg.
const profileTrigger = document.querySelector('.profile-trigger');
const profileLightbox = document.getElementById('profile-lightbox');
const profileClose = document.querySelector('.profile-close');
function openProfile(){ if(!profileLightbox) return; profileLightbox.classList.add('open'); profileLightbox.setAttribute('aria-hidden','false'); document.body.classList.add('lightbox-open'); }
function closeProfile(){ if(!profileLightbox) return; profileLightbox.classList.remove('open'); profileLightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('lightbox-open'); }
profileTrigger?.addEventListener('click', openProfile);
profileClose?.addEventListener('click', closeProfile);
profileLightbox?.addEventListener('click', e => { if(e.target === profileLightbox) closeProfile(); });
