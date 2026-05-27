// Nav scroll shadow
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 10 ? '#333' : 'var(--border)';
}, { passive: true });
