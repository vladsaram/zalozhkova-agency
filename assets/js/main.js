/* ─── NAV SCROLL BORDER ───────────────────────────────────────────────────── */
const nav = document.querySelector('nav');

/* ─── SCROLL STORY — video scrubbing + text reveal ───────────────────────── */
const storyWrapper = document.querySelector('.story-wrapper');
const storyVideo   = document.querySelector('.story__video');
const storyLeft    = document.querySelector('.story__side--left');
const storyRight   = document.querySelector('.story__side--right');

/* linear interpolation helper */
function lerp(a, b, t) { return a + (b - a) * t; }

/* map progress range [in, out] → 0..1, clamped */
function range(progress, inPoint, outPoint) {
  return Math.max(0, Math.min((progress - inPoint) / (outPoint - inPoint), 1));
}

function onScroll() {
  /* nav border */
  nav.style.borderBottomColor = window.scrollY > 10 ? '#333' : 'var(--border)';

  if (!storyWrapper || !storyVideo) return;

  const rect       = storyWrapper.getBoundingClientRect();
  const scrollable = storyWrapper.offsetHeight - window.innerHeight;
  const scrolled   = -rect.top;
  const p          = Math.max(0, Math.min(scrolled / scrollable, 1)); // 0→1

  /* 1. Scrub video */
  if (storyVideo.duration) {
    storyVideo.currentTime = p * storyVideo.duration;
  }

  /* 2. Text: fade in 0→0.12, hold, fade out 0.88→1.0
        translateY: +24px→0 on enter, 0→-24px on exit */
  const fadeIn  = range(p, 0.02, 0.14);          // 0→1 на входе
  const fadeOut = 1 - range(p, 0.86, 0.98);      // 1→0 на выходе
  const opacity = fadeIn * fadeOut;

  const yEnter  = lerp(24, 0, range(p, 0.02, 0.18));   // едет вверх при входе
  const yExit   = lerp(0, -20, range(p, 0.84, 0.98));  // уходит вверх при выходе
  const yOffset = yEnter + yExit;

  if (storyLeft) {
    storyLeft.style.opacity   = opacity;
    storyLeft.style.transform = `translateY(calc(-50% + ${yOffset}px))`;
  }
  if (storyRight) {
    storyRight.style.opacity   = opacity;
    storyRight.style.transform = `translateY(calc(-50% + ${yOffset}px))`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ─── SCROLL REVEAL + GROW ────────────────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.about-photo, .stat-cell, .pain-item, .process-step, .review-card'
);

revealEls.forEach(el => el.classList.add('will-reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    /* stagger siblings */
    const siblings = [...entry.target.parentElement.children];
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 70}ms`;
    entry.target.classList.add('revealed');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ─── COUNTER ANIMATION ───────────────────────────────────────────────────── */
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function runCounter(el, duration) {
  const raw    = el.dataset.target;
  const match  = raw.match(/^(\d+)(.*)/);
  if (!match) return;

  const target = parseInt(match[1], 10);
  const suffix = match[2];
  let start    = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent  = Math.floor(easeOutExpo(progress) * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* store original text as data-target, then zero out for animation */
const counterEls = document.querySelectorAll('.stat-cell__val');
counterEls.forEach(el => {
  el.dataset.target = el.textContent.trim();
  const match = el.textContent.match(/^(\d+)/);
  el.textContent = match ? '0' + el.textContent.replace(/^\d+/, '') : el.textContent;
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    /* duration: bigger numbers run longer, min 900ms max 2200ms */
    const n        = parseInt(entry.target.dataset.target) || 1;
    const duration = Math.min(2200, Math.max(900, n * 2.8));
    runCounter(entry.target, duration);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));
