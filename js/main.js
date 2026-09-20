/* ==========================================================================
   Bharath Vishnu C J: portfolio (v2)
   Theme toggle, mobile menu, typed roles, scroll reveal, counters,
   layer stack, sticky system cards, experience expand, contact form, back to top.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* Theme -------------------------------------------------------------- */
  function initTheme() {
    const btn = $('#theme-toggle');
    if (!btn) return;

    const sync = () => {
      const dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#0c0a1d' : '#f6f6fc');
    };
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      sync();
    });
    sync();
  }

  /* Header, menu, scroll state ---------------------------------------- */
  function initNav() {
    const toggle = $('#nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !e.target.closest('.nav-bar')) setOpen(false);
    });

    // Active link
    const links = $$('.nav-list a[href^="#"]');
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = map.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });

    // Progress bar + back to top
    const bar = $('#progress');
    const top = $('#to-top');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      top.classList.toggle('show', window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* Typed role line ---------------------------------------------------- */
  function initTyped() {
    const el = $('#typed');
    if (!el || reduceMotion) return;
    const phrases = [
      '.NET & Angular Full Stack Developer',
      'SQL Server Specialist',
      'Microservices & Cloud Engineer',
      'Security-minded Problem Solver',
    ];
    let p = 0, i = 0, deleting = false;
    const tick = () => {
      const word = phrases[p];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
      setTimeout(tick, delay);
    };
    el.textContent = '';
    setTimeout(tick, 700);
  }

  /* Scroll reveal + counters ------------------------------------------ */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  function initCounters() {
    const counters = $$('.count');
    const run = (el) => {
      const to = Number(el.dataset.to);
      if (reduceMotion) { el.textContent = to; return; }
      const start = performance.now();
      const duration = 1200;
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* Images: mark each wrapper as loaded or failed, so fallbacks show only when needed */
  function initImages() {
    $$('.imgwrap').forEach((wrap) => {
      const img = $('img', wrap);
      if (!img) return;
      const ok = () => wrap.classList.add('has-img');
      const bad = () => wrap.classList.add('no-img');
      if (img.complete) { (img.naturalWidth > 0 ? ok : bad)(); }
      else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', bad, { once: true }); }
    });
  }

  /* Lightbox: click a picture to see it uncropped */
  function initLightbox() {
    const dialog = $('#lightbox');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const big = $('#lightbox-img');
    const cap = $('#lightbox-cap');
    $$('.zoomable').forEach((el) => {
      el.addEventListener('click', () => {
        const img = $('img', el);
        if (!img || !el.classList.contains('has-img')) return;
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        cap.textContent = el.dataset.caption || img.alt || '';
        dialog.showModal();
      });
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('.lightbox-close')) dialog.close();
    });
  }

  /* Skills: the stack, layer by layer ---------------------------------- */
  function initStack() {
    const list = $('.layer-list');
    if (!list) return;
    const tabs = $$('[role="tab"]', list);
    const slabs = $$('.slab');
    const paint = (idx) => slabs.forEach((slab) => {
      const k = Number(slab.dataset.i);
      slab.classList.toggle('on', k === idx);
      slab.classList.toggle('above', k > idx);
      slab.classList.toggle('below', k < idx);
    });
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      paint(Number(tab.dataset.i));
      if (focus) tab.focus();
    };
    tabs.forEach((t) => t.addEventListener('click', () => select(t, false)));
    slabs.forEach((slab) => slab.addEventListener('click', () => {
      const match = tabs.find((t) => t.dataset.i === slab.dataset.i);
      if (match) select(match, false);
    }));
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
    paint(Number(tabs[0].dataset.i));
  }

  /* Projects: sticky system cards ease back as the next one slides over --- */
  function initSystems() {
    const cards = $$('.system');
    if (!cards.length || reduceMotion) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next || window.innerWidth <= 900) { card.style.setProperty('--p', 0); return; }
        const top = parseFloat(getComputedStyle(card).top) || 0;
        const gap = next.getBoundingClientRect().top - top;
        card.style.setProperty('--p', Math.min(1, Math.max(0, 1 - gap / card.offsetHeight)).toFixed(3));
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* Experience expand -------------------------------------------------- */
  function initExpand() {
    const list = $('#highlights');
    const btn = $('#show-more');
    if (!list || !btn) return;
    const total = $$('li', list).length;
    const render = (expanded) => {
      list.dataset.collapsed = String(!expanded);
      btn.setAttribute('aria-expanded', String(expanded));
      btn.textContent = expanded ? 'Show fewer highlights' : `Show all ${total} highlights`;
    };
    btn.addEventListener('click', () => render(list.dataset.collapsed === 'true'));
    render(false);
  }

  /* Contact form: opens the visitor's email app ------------------------ */
  function initForm() {
    const form = $('#contact-form');
    if (!form) return;
    const note = $('#form-note');
    const to = 'bharathvishnu2522003@gmail.com';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();

      let valid = true;
      ['name', 'email', 'message'].forEach((key) => {
        const field = form.elements[key].closest('.field');
        const value = String(data.get(key) || '').trim();
        const ok = key === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.length > 0;
        field.classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        note.textContent = 'Please fill in your name, a valid email and a message.';
        note.classList.add('is-error');
        return;
      }
      note.classList.remove('is-error');

      const subject = `Portfolio enquiry from ${name}`;
      const body = `${message}\n\n${name}\n${email}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Opening your email app. If nothing happens, write to ' + to + '.';
    });
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  initTheme();
  initNav();
  initTyped();
  initReveal();
  initCounters();
  initImages();
  initLightbox();
  initStack();
  initSystems();
  initExpand();
  initForm();
})();
