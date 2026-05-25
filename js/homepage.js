/* ============================================================
   HOMEPAGE.JS - Animations & Interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Animate hero on load
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  if (heroContent) heroContent.style.animation = 'fadeUp 0.8s ease both';
  if (heroVisual) heroVisual.style.animation = 'fadeUp 0.8s 0.2s ease both';

  // Pricing hover ripple
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  // Feature cards stagger
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, i) => {
    card.style.animationDelay = (i * 0.1) + 's';
  });

  // Stat counter on scroll
  const stats = document.querySelectorAll('.stat-number');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        const prefix = text.match(/^\D+/) ? text.match(/^\D+/)[0] : '';
        const suffix = text.match(/\D+$/) ? text.match(/\D+$/)[0] : '';
        let current = 0;
        const step = num / 60;
        const interval = setInterval(() => {
          current = Math.min(current + step, num);
          el.textContent = prefix + (Number.isInteger(num) ? Math.round(current) : current.toFixed(1)) + suffix;
          if (current >= num) clearInterval(interval);
        }, 16);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => io.observe(s));

  // Live preview animation
  const chartBars = document.querySelectorAll('.pm-chart-bar');
  setInterval(() => {
    chartBars.forEach(bar => {
      const h = Math.random() * 70 + 20;
      bar.style.height = h + '%';
      bar.style.transition = 'height 0.8s ease';
    });
  }, 2500);
});
