/* ============================================================
   MAIN.JS - Global Utilities & Shared Behavior
   ============================================================ */

// ── THEME MANAGEMENT ──
const ThemeManager = {
  key: 'cf-theme',

  init() {
    const saved = localStorage.getItem(this.key) || 'dark';
    this.apply(saved);
    document.querySelectorAll('#themeToggle, .theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.key, theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  get current() {
    return document.documentElement.getAttribute('data-theme');
  }
};

// ── NAVBAR SCROLL ──
const NavManager = {
  init() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('navMobile');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
    }
  }
};

// ── TOAST SYSTEM ──
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    const icons = {
      success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      danger: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };

    const colors = { success: '#34d399', warning: '#fbbf24', danger: '#f87171', info: '#818cf8' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="color:${colors[type]};flex-shrink:0">${icons[type]}</span>
      <span style="flex:1">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;padding:2px;color:var(--text-muted);display:flex;align-items:center;justify-content:center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── MODAL SYSTEM ──
const Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  close(id) {
    const overlay = id ? document.getElementById(id) : document.querySelector('.modal-overlay.open');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  init() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close(overlay.id);
      });
    });

    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => this.open(btn.dataset.modalOpen));
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close(btn.dataset.modalClose));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }
};

// ── DROPDOWN SYSTEM ──
const Dropdown = {
  init() {
    document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = document.getElementById(btn.dataset.dropdownToggle);
        if (target) {
          const dropdown = target.closest('.dropdown');
          dropdown.classList.toggle('open');
        }
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }
};

// ── TABS ──
const Tabs = {
  init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('[data-tabs]');
        if (!group) return;
        const target = btn.dataset.tab;

        group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll(`[data-tab-panel]`).forEach(panel => {
          panel.style.display = panel.dataset.tabPanel === target ? 'block' : 'none';
        });
      });
    });
  }
};

// ── SIDEBAR TOGGLE (dashboard) ──
const Sidebar = {
  init() {
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.querySelector('.sidebar-collapse-btn');
    const mobileToggle = document.querySelector('.sidebar-mobile-toggle');
    const overlay = document.querySelector('.sidebar-mobile-overlay');

    if (!sidebar) return;

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        localStorage.setItem('cf-sidebar-collapsed', isCollapsed);
      });

      const savedState = localStorage.getItem('cf-sidebar-collapsed');
      if (savedState === 'true') sidebar.classList.add('collapsed');
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay && overlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      });
    }

    // Active nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', function() {
        if (this.dataset.page) {
          document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });
  }
};

// ── ANIMATE ON SCROLL ──
const ScrollAnimator = {
  init() {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-delay]').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
};

// ── PROGRESS BARS ──
const ProgressBars = {
  init() {
    document.querySelectorAll('[data-progress]').forEach(bar => {
      const fill = bar.querySelector('.progress-fill');
      if (fill) {
        const pct = bar.dataset.progress;
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = pct + '%'; }, 200);
      }
    });
  }
};

// ── COUNTER ANIMATION ──
const Counters = {
  init() {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
  },

  animate(el) {
    const target = parseFloat(el.dataset.counter);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavManager.init();
  Toast.init();
  Modal.init();
  Dropdown.init();
  Tabs.init();
  Sidebar.init();
  ScrollAnimator.init();
  ProgressBars.init();
  Counters.init();
});
