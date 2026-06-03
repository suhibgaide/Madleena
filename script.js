// ✅ Scroll fade animation
const faders = document.querySelectorAll('.fade');
window.addEventListener('scroll', () => {
  faders.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add('show');
    }
  });
});

// ✅ Trigger fade on load for visible elements
window.dispatchEvent(new Event('scroll'));
