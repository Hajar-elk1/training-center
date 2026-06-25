/* ============================================================
   VANTAGE ACADEMY — Main Script v3.0
   No cursor, no preloader, no typewriter, no blob parallax.
   Word-stagger animation is pure CSS (.hw class + --wi variable).
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initNav();
  initReveal();
  initCounters();
  initTestimonials();
  initMagneticButtons();
  initFAQ();
  initProgramsFan();
  initContactForm();
  initSubForm();
  smoothScrollAnchors();
  initHeroCollage();
  setNavActive();
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const update = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
  };

  window.addEventListener('scroll', update, { passive: true });
}

/* ============================================================
   NAVIGATION — scroll state + active section + mobile menu
   ============================================================ */
function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  // Scroll state
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Scroll-spy: highlight anchor-section links while on index.html
  const anchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (anchorLinks.length === 0) return;

  const sections = [...anchorLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Clear ALL nav active states so only one link is ever active at once
        document.querySelectorAll('.nav-links a:not(.btn), .mobile-menu a:not(.btn)')
          .forEach(l => l.classList.remove('active'));
        const id = entry.target.id;
        const desktopMatch = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (desktopMatch) desktopMatch.classList.add('active');
        const mobileMatch  = document.querySelector(`.mobile-menu a[href="#${id}"]`);
        if (mobileMatch)  mobileMatch.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeObserver.observe(s));
}

/* ============================================================
   SCROLL REVEAL  — selective, not every element
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (els.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length === 0) return;

  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animateCounter = (el, target) => {
    const duration = 1800;
    const start = performance.now();

    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(ease(progress) * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   TESTIMONIALS SLIDER
   ============================================================ */
function initTestimonials() {
  const track = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsEl = document.getElementById('testiDots');
  if (!track) return;

  const cards = [...track.querySelectorAll('.testi-card')];
  if (cards.length === 0) return;

  let perView = window.innerWidth < 680 ? 1 : window.innerWidth < 1000 ? 2 : 3;
  let current = 0;
  let autoTimer;

  const maxIndex = () => Math.max(0, cards.length - perView);

  const buildDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => go(i));
      dotsEl.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  };

  const go = idx => {
    current = Math.max(0, Math.min(idx, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => { go(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { go(current + 1); resetAuto(); });

  const startAuto = () => {
    autoTimer = setInterval(() => {
      current = current >= maxIndex() ? 0 : current + 1;
      go(current);
    }, 5000);
  };

  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? go(current + 1) : go(current - 1); resetAuto(); }
  });

  const onResize = () => {
    perView = window.innerWidth < 680 ? 1 : window.innerWidth < 1000 ? 2 : 3;
    current = Math.min(current, maxIndex());
    buildDots();
    go(current);
  };

  window.addEventListener('resize', onResize, { passive: true });
  buildDots();
  startAuto();
}

/* ============================================================
   MAGNETIC BUTTONS  — subtle, not overbearing
   ============================================================ */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.22;
      const dy = (e.clientY - cy) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (items.length === 0) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const body = item.querySelector('.faq-body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-body');
        const t = i.querySelector('.faq-trigger');
        if (b) { b.style.maxHeight = '0'; b.setAttribute('aria-hidden', 'true'); }
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        body.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ============================================================
   PROGRAMS FAN STACK — 3D card deck
   Click a side card, use ← → arrow keys, swipe, or tap prev/next to navigate.
   ============================================================ */
function initProgramsFan() {
  const stage   = document.getElementById('fanStage');
  const track   = document.getElementById('fanTrack');
  const dotsEl  = document.getElementById('fanDots');
  const prevBtn = document.getElementById('fanPrev');
  const nextBtn = document.getElementById('fanNext');
  if (!stage || !track) return;

  const cards = [...track.querySelectorAll('.fan-card')];
  const N = cards.length;
  if (N === 0) return;

  let active = 0;

  // Desktop fan geometry — wide landscape cards
  const SPREAD_X    = 155;  // px horizontal offset per step
  const ROTATE_Z    = 14;   // deg Z-rotation per step
  const DEPTH       = 90;   // px translateZ pushback per step
  const TILT_X      = 3;    // deg X-lean per step
  const ACTIVE_LIFT = -10;  // px translateY for front card (up)
  const SINK_STEP   = 6;    // px additional sink per step behind
  const ACTIVE_SCALE = 1.0;
  const BASE_SCALE   = 0.78;
  const SCALE_STEP   = 0.05;

  function isMob() { return window.innerWidth <= 960; }

  function applyAll() {
    const mob = isMob();
    cards.forEach((card, i) => {
      const off    = i - active;
      const absOff = Math.abs(off);

      if (mob) {
        // Flat slide: active card visible, others off-screen left/right
        const tx = off === 0 ? 0 : off > 0 ? 110 : -110;
        card.style.transform    = `translateX(${tx}%)`;
        card.style.opacity      = off === 0 ? '1' : '0';
        card.style.zIndex       = off === 0 ? '10' : '1';
        card.style.pointerEvents = off === 0 ? 'auto' : 'none';
        card.classList.toggle('is-active', off === 0);
      } else {
        // 3D fan
        const hidden = absOff > 2;
        const scale  = off === 0
          ? ACTIVE_SCALE
          : Math.max(0.7, BASE_SCALE - (absOff - 1) * SCALE_STEP);
        const ty = off === 0 ? ACTIVE_LIFT : absOff * SINK_STEP;
        const tz = -absOff * DEPTH;
        const rz = off * -ROTATE_Z;
        const rx = absOff * TILT_X;
        const tx = off * SPREAD_X;
        const op = hidden ? 0
                 : off === 0 ? 1
                 : absOff === 1 ? 0.88
                 : 0.52;

        card.style.transform = [
          `translateX(${tx}px)`,
          `translateY(${ty}px)`,
          `translateZ(${tz}px)`,
          `rotateX(${rx}deg)`,
          `rotateZ(${rz}deg)`,
          `scale(${scale})`,
        ].join(' ');
        card.style.opacity       = op;
        card.style.zIndex        = 10 - absOff;
        card.style.pointerEvents = hidden ? 'none' : 'auto';
        card.classList.toggle('is-active', off === 0);
      }

      // CTA only keyboard-reachable when card is active
      const cta = card.querySelector('.fc-cta');
      if (cta) cta.setAttribute('tabindex', off === 0 ? '0' : '-1');
    });

    // Sync dot highlights
    if (dotsEl) {
      dotsEl.querySelectorAll('.fan-dot').forEach((d, i) => {
        d.classList.toggle('active', i === active);
        d.setAttribute('aria-selected', String(i === active));
      });
    }
  }

  function go(idx) {
    active = ((idx % N) + N) % N;
    applyAll();
  }

  // Card click → activate
  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (i !== active) go(i); });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && i !== active) {
        e.preventDefault();
        go(i);
      }
    });
  });

  // Stage arrow-key navigation
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(active - 1); }
  });

  // Touch swipe
  let touchX = 0;
  stage.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? go(active + 1) : go(active - 1);
  }, { passive: true });

  // Prev / Next buttons (visible on mobile)
  if (prevBtn) prevBtn.addEventListener('click', () => go(active - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(active + 1));

  // Build dot indicators
  if (dotsEl) {
    cards.forEach((card, i) => {
      const dot = document.createElement('button');
      dot.className = 'fan-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', card.getAttribute('aria-label') || `Program ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => go(i));
      dotsEl.appendChild(dot);
    });
  }

  // Re-apply on resize (desktop ↔ mobile layout switch)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyAll, 120);
  }, { passive: true });

  applyAll();
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const notif = document.getElementById('contactNotif');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const first   = form.querySelector('#cf-first');
    const last    = form.querySelector('#cf-last');
    const email   = form.querySelector('#cf-email');
    const message = form.querySelector('#cf-message');

    if (!first?.value.trim() || !last?.value.trim() ||
        !email?.value.trim() || !message?.value.trim()) {
      showNotif(notif, 'error', 'Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email.value.trim())) {
      showNotif(notif, 'error', 'Please enter a valid email address.');
      return;
    }

    const btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    // Simulate async send
    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      showNotif(notif, 'success',
        'Message sent! We\'ll get back to you within one business day.');
    }, 1200);
  });
}

/* ============================================================
   NEWSLETTER SUBSCRIPTION
   ============================================================ */
function initSubForm() {
  const forms = [
    { form: 'subForm',      notif: 'subNotif' },
    { form: 'subFormAbout', notif: 'subNotifAbout' },
  ];

  forms.forEach(({ form: fId, notif: nId }) => {
    const form  = document.getElementById(fId);
    const notif = document.getElementById(nId);
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      const nameEl  = form.querySelector('input[type="text"]');
      const emailEl = form.querySelector('input[type="email"]');

      if (!nameEl?.value.trim() || !emailEl?.value.trim()) {
        showNotif(notif, 'error', 'Please fill in your name and email.');
        return;
      }

      if (!isValidEmail(emailEl.value.trim())) {
        showNotif(notif, 'error', 'Please enter a valid email address.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Subscribing…';

      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Subscribe Free';
        showNotif(notif, 'success', 'You\'re in! Check your inbox for a welcome email.');
      }, 1000);
    });
  });
}

/* ============================================================
   SMOOTH SCROLL  — for #hash links
   ============================================================ */
function smoothScrollAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 78;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
}

/* ============================================================
   NAV ACTIVE STATE  — set once on page load from current URL
   ============================================================ */
function setNavActive() {
  // Extract the filename from the path; default to index.html for bare / paths
  const page = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a:not(.btn), .mobile-menu a:not(.btn)').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    // Pure anchor links (#programs, #why-us) are handled by scroll-spy, not here
    if (href.startsWith('#')) return;
    // Strip any #anchor suffix and path prefix to get just the filename
    const linkPage = href.split('#')[0].split('/').pop() || 'index.html';
    if (linkPage === page) link.classList.add('active');
  });
}

/* ============================================================
   HERO PHOTO COLLAGE SLIDER
   ============================================================ */
function initHeroCollage() {
  const slots  = [
    document.getElementById('hcMain'),
    document.getElementById('hcTop'),
    document.getElementById('hcBot'),
  ];
  const prevBtn = document.getElementById('hcPrev');
  const nextBtn = document.getElementById('hcNext');
  if (!slots[0] || !prevBtn) return;

  const pool = [
    {
      src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=900&auto=format&fit=crop',
      alt: 'Mentor guiding a student through a project'
    },
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
      alt: 'Professionals collaborating at a workshop table'
    },
    {
      src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop',
      alt: 'Confident professional preparing for a career change'
    },
    {
      src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop',
      alt: 'Instructor presenting technical concepts to students'
    },
    {
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
      alt: 'Small group attending an industry training workshop'
    },
    {
      src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
      alt: 'Career coach in a professional mentorship session'
    },
  ];

  let head = 0;
  let busy = false;

  function render(animate) {
    if (!animate) {
      slots.forEach((el, i) => {
        if (!el) return;
        const p = pool[(head + i) % pool.length];
        el.src = p.src;
        el.alt = p.alt;
      });
      return;
    }
    busy = true;
    slots.forEach(el => { if (el) el.style.opacity = '0'; });

    setTimeout(() => {
      slots.forEach((el, i) => {
        if (!el) return;
        const p = pool[(head + i) % pool.length];
        el.src = p.src;
        el.alt = p.alt;
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slots.forEach(el => { if (el) el.style.opacity = ''; });
        setTimeout(() => { busy = false; }, 300);
      }));
    }, 280);
  }

  render(false);

  nextBtn.addEventListener('click', () => {
    if (busy) return;
    head = (head + 1) % pool.length;
    render(true);
  });

  prevBtn.addEventListener('click', () => {
    if (busy) return;
    head = (head - 1 + pool.length) % pool.length;
    render(true);
  });
}

/* ============================================================
   UTILITIES
   ============================================================ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotif(el, type, message) {
  if (!el) return;
  el.className = `form-notif ${type}`;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}
