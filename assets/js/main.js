/* ─── NAV SCROLL BORDER ───────────────────────────────────────────────────── */
const nav = document.querySelector('nav');

/* ─── SCROLL STORY — video scrubbing ─────────────────────────────────────── */
const storyWrapper = document.querySelector('.story-wrapper');
const storyVideo   = document.querySelector('.story__video');

function onScroll() {
  /* nav border */
  nav.style.borderBottomColor = window.scrollY > 10 ? '#333' : 'var(--border)';

  /* scrub story video with scroll */
  if (storyWrapper && storyVideo && storyVideo.duration) {
    const rect       = storyWrapper.getBoundingClientRect();
    const scrollable = storyWrapper.offsetHeight - window.innerHeight;
    const scrolled   = -rect.top;
    const progress   = Math.max(0, Math.min(scrolled / scrollable, 1));
    storyVideo.currentTime = progress * storyVideo.duration;
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
