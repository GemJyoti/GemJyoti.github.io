'use strict';

// ─── Theme ─────────────────────────────────────────────────────────────────

class ThemeManager {
  constructor() {
    this.btn    = document.getElementById('theme-toggle');
    this.sunIcon  = this.btn.querySelector('.sun-icon');
    this.moonIcon = this.btn.querySelector('.moon-icon');
    this.current  = localStorage.getItem('theme') || 'auto';
    this.apply(this.current);
    this.btn.addEventListener('click', () => this.toggle());
  }

  apply(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-color-scheme', 'dark');
      this.sunIcon.classList.add('hidden');
      this.moonIcon.classList.remove('hidden');
    } else if (theme === 'light') {
      root.setAttribute('data-color-scheme', 'light');
      this.sunIcon.classList.remove('hidden');
      this.moonIcon.classList.add('hidden');
    } else {
      root.removeAttribute('data-color-scheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.sunIcon.classList.add('hidden');
        this.moonIcon.classList.remove('hidden');
      } else {
        this.sunIcon.classList.remove('hidden');
        this.moonIcon.classList.add('hidden');
      }
    }
    this.current = theme;
    localStorage.setItem('theme', theme);
  }

  toggle() {
    const next = this.current === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }
}

// ─── Page Navigation ───────────────────────────────────────────────────────

class PageNav {
  constructor() {
    this.pages   = document.querySelectorAll('.page');
    this.navLinks = document.querySelectorAll('[data-page]');
    this.current  = 'home';

    this.navLinks.forEach(el => {
      el.addEventListener('click', () => this.goto(el.dataset.page));
    });

    // restore from hash
    const hash = window.location.hash.replace('#', '');
    if (hash) this.goto(hash, false);
  }

  goto(name, pushState = true) {
    if (name === this.current) return;

    this.pages.forEach(p => p.classList.remove('active'));
    this.navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById(`${name}-page`);
    if (!target) return;
    target.classList.add('active');

    this.navLinks.forEach(l => {
      if (l.dataset.page === name) l.classList.add('active');
    });

    if (pushState) {
      window.history.pushState({ page: name }, '', `#${name}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.current = name;
    MobileNav.close();
  }
}

// ─── Mobile Navigation ─────────────────────────────────────────────────────

const MobileNav = {
  menu:   document.getElementById('nav-menu'),
  toggle: document.getElementById('nav-toggle'),
  close_: document.getElementById('nav-close'),

  init() {
    this.toggle.addEventListener('click', () => this.open());
    this.close_.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    document.addEventListener('click', e => {
      if (this.menu.classList.contains('show') &&
          !this.menu.contains(e.target) &&
          !this.toggle.contains(e.target)) {
        this.close();
      }
    });
  },
  open()  { this.menu.classList.add('show'); },
  close() { this.menu.classList.remove('show'); },
};

// ─── Header scroll effect ──────────────────────────────────────────────────

function initHeaderScroll() {
  const header = document.getElementById('header');
  let ticking  = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ─── Footer year ───────────────────────────────────────────────────────────

function initFooterYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  const pageNav = new PageNav();
  MobileNav.init();
  initHeaderScroll();
  initFooterYear();

  // back/forward navigation
  window.addEventListener('popstate', e => {
    const page = (e.state && e.state.page) || 'home';
    pageNav.goto(page, false);
  });
});
