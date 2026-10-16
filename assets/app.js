(function () {
  'use strict';

  var THEME_KEY = 'os-notes-theme';
  var root = document.documentElement;

  function getPreferredTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.theme-toggle');
    if (!toggle) return;
    var current = root.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  var progressBar = document.querySelector('.reading-progress-bar');
  if (progressBar) {
    var updateProgress = function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  var backBtn = document.querySelector('.back-to-top');
  var themeToggleBtn = document.querySelector('.theme-toggle');
  if (backBtn) {
    var toggleBackBtn = function () {
      if (window.scrollY > 400) {
        backBtn.classList.add('visible');
        if (themeToggleBtn) themeToggleBtn.classList.remove('alone');
      } else {
        backBtn.classList.remove('visible');
        if (themeToggleBtn) themeToggleBtn.classList.add('alone');
      }
    };
    window.addEventListener('scroll', toggleBackBtn, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleBackBtn();
  }

  var tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length) {
    var sections = [];
    tocLinks.forEach(function (l) {
      var sec = document.querySelector(l.getAttribute('href'));
      if (sec && sections.indexOf(sec) === -1) sections.push(sec);
    });

    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var offset = 20;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.pushState) {
          history.pushState(null, '', link.getAttribute('href'));
        }
      });
    });

    var onScroll = function () {
      var pos = window.scrollY + 120;
      var current = 0;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= pos) current = i;
      }
      tocLinks.forEach(function (l) {
        var target = l.getAttribute('href');
        var isActive = sections[current] && ('#' + sections[current].id) === target;
        l.classList.toggle('active', isActive);
      });
    };

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    onScroll();
  }

  var fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  var searchInput = document.querySelector('.search-input');
  if (searchInput) {
    var cards = document.querySelectorAll('.part-card');
    var emptyState = document.querySelector('.search-empty');

    var filterCards = function () {
      var query = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = (card.textContent || '').toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden', !match);
        if (match) visibleCount++;
      });
      if (emptyState) {
        emptyState.classList.toggle('visible', visibleCount === 0);
      }
    };

    searchInput.addEventListener('input', filterCards);
  }

  var prevBtn = document.querySelector('.part-nav .part-nav-btn:not(.home):not(.disabled):first-child');
  var nextBtn = document.querySelector('.part-nav .part-nav-btn:not(.home):not(.disabled):last-child');
  var prevHref = prevBtn && prevBtn.tagName === 'A' ? prevBtn.getAttribute('href') : null;
  var nextHref = nextBtn && nextBtn.tagName === 'A' ? nextBtn.getAttribute('href') : null;

  if (prevHref || nextHref) {
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && prevHref) {
        window.location.href = prevHref;
      } else if (e.key === 'ArrowLeft' && nextHref) {
        window.location.href = nextHref;
      }
    });
  }

})();
