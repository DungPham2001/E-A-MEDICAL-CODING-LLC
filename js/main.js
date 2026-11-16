(function () {
  'use strict';

  var COMPANY_EMAIL = 'mehdipilarski@gmail.com';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll-driven UI (one rAF-throttled handler) ----------
     Header shadow, reading progress bar, back-to-top button, parallax. */
  var header = document.querySelector('.header');
  var progress = document.querySelector('.scroll-progress');
  var toTop = document.querySelector('.to-top');
  var parallaxEls = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;

  function updateOnScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('header--scrolled', y > 8);
    progress.style.setProperty('--progress', max > 0 ? Math.min(y / max, 1) : 0);
    toTop.classList.toggle('is-shown', y > 600);

    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      // Only while near the viewport; `translate` composes with CSS transform animations.
      if (y < window.innerHeight * 1.5) el.style.translate = '0 ' + (y * speed).toFixed(1) + 'px';
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  }

  updateOnScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var iconMenu = toggle.querySelector('.icon-menu');
  var iconClose = toggle.querySelector('.icon-close');

  function setNav(open) {
    nav.classList.toggle('nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    iconMenu.hidden = open;
    iconClose.hidden = !open;
  }

  toggle.addEventListener('click', function () {
    setNav(!nav.classList.contains('nav--open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* ---------- FAQ: only one item open at a time ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Reveal on scroll (staggered) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var observed = document.querySelectorAll('[data-observe]');

  // Once revealed, drop the reveal classes so the element's own hover transitions apply again.
  function cleanupReveal(el) {
    el.classList.remove('reveal', 'reveal--left', 'reveal--right', 'reveal--zoom', 'is-visible');
    el.style.transitionDelay = '';
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(cleanupReveal);
    observed.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // Stagger siblings that reveal together (e.g. cards in a grid).
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('reveal');
      });
      var index = siblings.indexOf(el);
      if (siblings.length > 1 && index > 0) {
        el.style.transitionDelay = Math.min(index * 90, 450) + 'ms';
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        io.unobserve(el);

        if (el.classList.contains('reveal')) {
          var done = function (e) {
            if (e && (e.target !== el || e.propertyName !== 'opacity')) return;
            el.removeEventListener('transitionend', done);
            cleanupReveal(el);
          };
          el.addEventListener('transitionend', done);
          setTimeout(done, 1600); // fallback if transitionend never fires
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    observed.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scrollspy: highlight the nav link of the section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav ul a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          var active = a.getAttribute('href') === id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Contact form (mailto, no backend) ---------- */
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var rules = {
    name: function (v) { return v ? '' : 'Please enter your name.'; },
    email: function (v) {
      if (!v) return 'Please enter your email.';
      return EMAIL_RE.test(v) ? '' : 'Please enter a valid email address.';
    },
    message: function (v) { return v ? '' : 'Please tell us a little about your needs.'; }
  };

  function setError(field, msg) {
    var input = form.elements[field];
    var err = document.getElementById('f-' + field + '-err');
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', err.id);
      err.textContent = msg;
      err.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      err.textContent = '';
      err.hidden = true;
    }
  }

  /* Message character counter */
  var message = form.elements.message;
  var counter = document.getElementById('msg-count');
  var maxLen = Number(message.getAttribute('maxlength'));
  function updateCount() {
    counter.textContent = message.value.length + ' / ' + maxLen;
    counter.classList.toggle('field__count--near', message.value.length > maxLen * 0.9);
  }
  message.addEventListener('input', updateCount);

  Object.keys(rules).forEach(function (field) {
    form.elements[field].addEventListener('input', function () {
      if (this.getAttribute('aria-invalid')) setError(field, '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    ['name', 'practice', 'email', 'phone', 'message'].forEach(function (k) {
      data[k] = form.elements[k].value.trim();
    });
    data.service = Array.prototype.map.call(
      form.querySelectorAll('input[name="service"]:checked'),
      function (el) { return el.value; }
    ).join(', ');

    var firstInvalid = null;
    Object.keys(rules).forEach(function (field) {
      var msg = rules[field](data[field]);
      setError(field, msg);
      if (msg && !firstInvalid) firstInvalid = form.elements[field];
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var subject = 'Consultation request — ' + (data.practice || data.name);
    var body = [
      'Name: ' + data.name,
      'Practice: ' + (data.practice || '-'),
      'Email: ' + data.email,
      'Phone: ' + (data.phone || '-'),
      'Service of interest: ' + (data.service || '-'),
      '',
      data.message
    ].join('\n');

    window.location.href = 'mailto:' + COMPANY_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    document.getElementById('success-name').textContent = data.name.split(' ')[0];
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.getElementById('send-another').addEventListener('click', function () {
    form.reset();
    updateCount();
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
