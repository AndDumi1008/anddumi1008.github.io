/* Andrei Dumitrescu · portfolio interactions
   Everything here is progressive: without JS the page is fully readable.
   Respects prefers-reduced-motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  $('year').textContent = new Date().getFullYear();

  /* ---------- stamp: a short message in the corner ---------- */
  var stampEl = $('stamp'), stampTimer;
  function stamp(text) {
    stampEl.textContent = text;
    stampEl.classList.add('show');
    clearTimeout(stampTimer);
    stampTimer = setTimeout(function () { stampEl.classList.remove('show'); }, 2600);
  }

  /* ---------- confetti: hard-edged squares, three colors ---------- */
  var canvas = $('confetti'), ctx = canvas.getContext('2d'), bits = [], raf = null;
  var colors = ['#ff4d00', '#141413', '#55534c', '#ff4d00'];
  function sizeCanvas() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  function confetti(x, y, count) {
    if (reduce) return;
    sizeCanvas();
    for (var i = 0; i < (count || 90); i++) {
      var a = Math.random() * Math.PI * 2, v = 5 + Math.random() * 9;
      bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, s: 5 + Math.random() * 9,
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, c: colors[i % colors.length], life: 1 });
    }
    canvas.classList.add('on');
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += .35; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= .012;
      if (b.life <= 0 || b.y > window.innerHeight + 20) { bits.splice(i, 1); continue; }
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.globalAlpha = Math.min(1, b.life * 2); ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s); ctx.restore();
    }
    if (bits.length) raf = requestAnimationFrame(tick);
    else { raf = null; canvas.classList.remove('on'); ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
  function centerOf(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ---------- scroll progress ---------- */
  var progress = $('progress'), ticking = false;
  function paint() {
    var max = root.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();

  /* ---------- gate: slide to open the work ---------- */
  var gate = $('gate'), track = $('gate-track'), knob = $('gate-knob'), label = $('gate-label'), work = $('work');
  var opened = false;
  gate.hidden = false;
  work.classList.add('locked');

  function openWork(fromEl) {
    if (opened) return;
    opened = true;
    work.classList.remove('locked');
    gate.classList.add('done');
    label.textContent = 'Opened';
    knob.textContent = '✓';
    knob.style.transform = 'translateX(' + maxX() + 'px)';
    var c = centerOf(fromEl || knob);
    confetti(c.x, c.y, 110);
    stamp('Nice. Four projects, no fluff.');
    setTimeout(function () { gate.classList.add('collapsed'); }, 900);
  }
  function maxX() { return track.clientWidth - knob.offsetWidth - 8; }

  var dragging = false, startX = 0, moved = 0;
  knob.addEventListener('pointerdown', function (e) {
    if (opened) return;
    dragging = true; moved = 0; startX = e.clientX;
    knob.setPointerCapture(e.pointerId);
    knob.classList.add('grab');
  });
  knob.addEventListener('pointermove', function (e) {
    if (!dragging || opened) return;
    moved = Math.max(0, Math.min(maxX(), e.clientX - startX));
    knob.style.transform = 'translateX(' + moved + 'px)';
    label.style.opacity = String(Math.max(0, 1 - moved / (maxX() * .6)));
    if (moved >= maxX() * .92) { dragging = false; openWork(); }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false; knob.classList.remove('grab');
    if (opened) return;
    if (moved < 6) { openWork(); return; }          /* a plain tap opens too */
    knob.style.transform = ''; label.style.opacity = '';
  }
  knob.addEventListener('pointerup', endDrag);
  knob.addEventListener('pointercancel', endDrag);
  knob.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); openWork(); }
  });
  track.addEventListener('click', function (e) { if (e.target === track || e.target === label) openWork(); });
  work.addEventListener('click', function () { openWork(work.querySelector('.section-head')); });
  document.querySelectorAll('a[href="#work"], .toc a').forEach(function (a) { a.addEventListener('click', function () { openWork(); }); });

  /* ---------- experience: behind a veil until asked ---------- */
  var exp = $('experience'), veil = $('exp-veil'), expBtn = $('exp-open'), expOpen = false;
  veil.hidden = false;
  exp.classList.add('veiled');
  function openExp(quiet) {
    if (expOpen) return;
    expOpen = true;
    exp.classList.remove('veiled');
    veil.classList.add('gone');
    if (!quiet) { var c = centerOf(expBtn); confetti(c.x, c.y, 70); stamp('Good call. Four years, two promotions.'); }
    setTimeout(function () { veil.hidden = true; }, 500);
  }
  expBtn.addEventListener('click', function () { openExp(false); });
  document.querySelectorAll('a[href="#experience"]').forEach(function (a) { a.addEventListener('click', function () { openExp(true); }); });

  /* Never trap anyone: once the reader reaches the stack, both sections open quietly. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { if (!opened) { opened = true; work.classList.remove('locked'); gate.classList.add('collapsed'); } openExp(true); io.disconnect(); } });
    }, { rootMargin: '0px 0px -40% 0px' });
    io.observe($('stack'));
  }

  /* ---------- stack tags filter the work ---------- */
  var rows = Array.prototype.slice.call(document.querySelectorAll('#work .row, #experience .row'));
  var bar = $('filter-bar'), text = $('filter-text'), jump = $('filter-jump'), clear = $('filter-clear'), hint = $('stack-hint');
  var active = null;
  function norm(s) { return s.replace(/\s+/g, ' ').trim().toLowerCase(); }
  function rowTags(row) { return Array.prototype.map.call(row.querySelectorAll('.tags li'), function (li) { return norm(li.textContent); }); }
  function related(tag) {
    var t = norm(tag), alias = { 'hibernate / jpa': 'hibernate', 'rest / soap': 'rest', 'junit': 'junit', 'node.js': 'node' };
    var key = alias[t] || t;
    return rows.filter(function (r) { return rowTags(r).some(function (x) { return x === t || x.indexOf(key) === 0; }) || norm(r.textContent).indexOf(t) !== -1; });
  }
  function setFilter(btn) {
    document.querySelectorAll('#stack .tags button').forEach(function (b) { b.classList.remove('on'); });
    rows.forEach(function (r) { r.classList.remove('match', 'dim'); });
    if (!btn) { active = null; bar.hidden = true; hint.hidden = false; return; }
    active = btn; btn.classList.add('on');
    var hits = related(btn.textContent);
    rows.forEach(function (r) { r.classList.add(hits.indexOf(r) !== -1 ? 'match' : 'dim'); });
    var n = hits.length;
    text.textContent = n ? n + (n === 1 ? ' place I used ' : ' places I used ') + btn.textContent.trim() : 'Used ' + btn.textContent.trim() + ' outside the listed projects';
    jump.hidden = !n;
    if (n) { jump.href = '#' + (hits[0].id || (hits[0].id = 'hit-' + Math.random().toString(36).slice(2, 7))); }
    bar.hidden = false; hint.hidden = true;
    if (n && !opened) { opened = true; work.classList.remove('locked'); gate.classList.add('collapsed'); }
    if (n && hits.some(function (r) { return exp.contains(r); })) openExp(true);
  }
  document.querySelectorAll('#stack .tags button').forEach(function (b) {
    b.addEventListener('click', function () { setFilter(active === b ? null : b); });
  });
  clear.addEventListener('click', function () { setFilter(null); });

  /* ---------- hero: "break them." ---------- */
  var hero = document.querySelector('.hero'), breakBtn = $('break-btn');
  breakBtn.addEventListener('click', function () {
    if (!reduce) { hero.classList.remove('shake'); void hero.offsetWidth; hero.classList.add('shake'); setTimeout(function () { hero.classList.remove('shake'); }, 600); }
    stamp('Kidding. 470+ tests say otherwise.');
  });

  /* ---------- slides: one section per screen ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var snav = $('slides-nav'), counter = $('counter'), current = 0;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  slides.forEach(function (s, i) {
    var a = document.createElement('a');
    a.href = '#' + s.id; a.textContent = pad(i + 1); a.title = s.getAttribute('data-title') || ''; a.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + a.title);
    snav.appendChild(a);
  });
  var nextBtn = document.createElement('a');
  nextBtn.href = '#' + (slides[1] ? slides[1].id : slides[0].id); nextBtn.className = 'next'; nextBtn.textContent = '↓'; nextBtn.setAttribute('aria-label', 'Next slide');
  snav.appendChild(nextBtn);
  snav.hidden = false;
  var navLinks = Array.prototype.slice.call(snav.querySelectorAll('a:not(.next)'));

  function setCurrent(i) {
    current = i;
    navLinks.forEach(function (a, k) { a.classList.toggle('on', k === i); });
    counter.textContent = pad(i + 1) + ' / ' + pad(slides.length);
    nextBtn.href = '#' + slides[Math.min(slides.length - 1, i + 1)].id;
    nextBtn.style.visibility = i === slides.length - 1 ? 'hidden' : '';
  }
  function whichSlide() {
    var line = window.innerHeight * .4, best = 0;
    slides.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) best = i; });
    return best;
  }
  window.addEventListener('scroll', function () { var i = whichSlide(); if (i !== current) setCurrent(i); }, { passive: true });
  setCurrent(whichSlide());

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    var s = slides[current], r = s.getBoundingClientRect(), headerH = 60, vh = window.innerHeight;
    var moreBelow = r.bottom > vh + 8, moreAbove = r.top < headerH - 8;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault();
      if (moreBelow) window.scrollBy({ top: Math.min(r.bottom - vh, vh * .8), behavior: reduce ? 'auto' : 'smooth' }); else go(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      if (moreAbove) window.scrollBy({ top: -Math.min(headerH - r.top, vh * .8), behavior: reduce ? 'auto' : 'smooth' }); else go(current - 1);
    } else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });

  /* ---------- CV download: a small reward ---------- */
  document.querySelectorAll('a[download]').forEach(function (a) {
    a.addEventListener('click', function () { var c = centerOf(a); confetti(c.x, c.y, 50); stamp('Thanks for reading. Talk soon?'); });
  });
})();
