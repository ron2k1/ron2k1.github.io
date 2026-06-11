/* ============================================================
   RONIL BASU — COMIC ISSUE · motion layer + live GitHub data
   The page is complete without this file: static text already
   carries the final stat numbers and all content is visible
   when html.js never lands. Every feature is wrapped in its
   own try block so one failure can't take down the rest.
   ============================================================ */
(function () {
  'use strict';

  var motionOK =
    !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- candy-stripe progress (scroll-linked, NOT motion-gated) ---------- */
  try {
    var bar = document.querySelector('.progress i');
    if (bar) {
      var ticking = false;
      var paint = function () {
        ticking = false;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = Math.min(100, Math.max(0, p)) + '%';
      };
      window.addEventListener(
        'scroll',
        function () {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(paint);
          }
        },
        { passive: true }
      );
      paint();
    }
  } catch (e) {
    /* bar stays empty — content unaffected */
  }

  /* ---------- scroll reveals (one-shot) ---------- */
  try {
    var reveals = document.querySelectorAll('.reveal');
    var showAll = function () {
      reveals.forEach(function (el) {
        el.classList.add('in');
      });
    };
    if (!motionOK || !hasIO) {
      showAll();
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    }
  } catch (e) {
    try {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('in');
      });
    } catch (e2) {
      /* CSS only hides under html.js + motion — worst case handled there */
    }
  }

  /* ---------- count-up stats ---------- */
  try {
    var counted = false;

    var countUp = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / 1200, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    /* live public-repo count: update data-count before (or after) the count-up */
    var liveStat = document.querySelector('.num[data-live="repos"]');
    if (liveStat) {
      var ctrl0 = new AbortController();
      var timer0 = setTimeout(function () {
        ctrl0.abort();
      }, 4000);
      fetch('https://api.github.com/users/ron2k1', {
        signal: ctrl0.signal,
        headers: { Accept: 'application/vnd.github+json' }
      })
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (d) {
          clearTimeout(timer0);
          if (!d || typeof d.public_repos !== 'number') return;
          liveStat.setAttribute('data-count', String(d.public_repos));
          if (counted || !motionOK) liveStat.textContent = String(d.public_repos);
        })
        .catch(function () {
          clearTimeout(timer0);
          /* static 11 stands */
        });
    }

    var statsBlock = document.querySelector('.stats');
    if (statsBlock && motionOK && hasIO) {
      var statsIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !counted) {
              counted = true;
              statsBlock.querySelectorAll('.num').forEach(countUp);
              statsIO.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      statsIO.observe(statsBlock);
    }
  } catch (e) {
    /* static numbers already show the final values */
  }

  /* ---------- scramble tagline ---------- */
  try {
    var tag = document.getElementById('scramble-tag');
    if (tag && motionOK) {
      var FINAL = tag.textContent;
      var POOL = '█▓▒░<>/#×';
      var DURATION = 900;
      var t0 = null;
      var scrambleTimer = setInterval(function () {
        if (t0 === null) t0 = Date.now();
        var t = Math.min((Date.now() - t0) / DURATION, 1);
        var keep = Math.floor(FINAL.length * t);
        var out = FINAL.slice(0, keep);
        for (var i = keep; i < FINAL.length; i++) {
          out += FINAL[i] === ' ' ? ' ' : POOL[Math.floor(Math.random() * POOL.length)];
        }
        tag.textContent = out;
        if (t >= 1) {
          clearInterval(scrambleTimer);
          tag.textContent = FINAL;
        }
      }, 30);
    }
  } catch (e) {
    /* markup already holds the plain final text */
  }

  /* ---------- magnetic buttons + hero row tilt ---------- */
  try {
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (motionOK && fine) {
      document.querySelectorAll('.magnetic').forEach(function (el) {
        el.addEventListener('mousemove', function (e) {
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
          dx = Math.max(-10, Math.min(10, dx));
          dy = Math.max(-10, Math.min(10, dy));
          el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        });
        el.addEventListener('mouseleave', function () {
          el.style.transform = '';
        });
      });

      var hero = document.querySelector('.hero');
      var rows = document.querySelectorAll('.h1-3d .row');
      if (hero && rows.length) {
        hero.addEventListener('mousemove', function (e) {
          var x = e.clientX / window.innerWidth - 0.5; /* -0.5 .. 0.5 */
          rows.forEach(function (row, i) {
            row.style.transform = 'translateX(' + (x * 12 * (i + 1)).toFixed(1) + 'px)';
          });
        });
        hero.addEventListener('mouseleave', function () {
          rows.forEach(function (row) {
            row.style.transform = '';
          });
        });
      }
    }
  } catch (e) {
    /* buttons stay put — purely decorative */
  }

  /* ---------- GitHub live data (enhancement only, silent fallback) ---------- */
  try {
    document.querySelectorAll('.live[data-repo]').forEach(function (span) {
      var ctrl = new AbortController();
      var timer = setTimeout(function () {
        ctrl.abort();
      }, 4000);
      fetch('https://api.github.com/repos/ron2k1/' + span.getAttribute('data-repo'), {
        signal: ctrl.signal,
        headers: { Accept: 'application/vnd.github+json' }
      })
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (d) {
          clearTimeout(timer);
          if (!d || typeof d.stargazers_count !== 'number' || !d.pushed_at) return;
          var date = d.pushed_at.slice(0, 10);
          var stars = d.stargazers_count;
          span.textContent = 'updated ' + date + (stars > 0 ? ' · ' + stars + '★' : '');
          span.setAttribute(
            'aria-label',
            'updated ' + date + (stars > 0 ? ', ' + stars + ' stars' : '')
          );
        })
        .catch(function () {
          clearTimeout(timer);
          /* em dash stays */
        });
    });
  } catch (e) {
    /* em dash stays */
  }
})();
