// CLONE: the lab. A dot field a scan band rolls down, headings that decode out of noise, the you | your clone wipe in
// the hero (it sweeps by itself; hover or drag it), a split-flap board, the face scanner, voice bars, answers typed out,
// a rail that fills as you scroll, scan-in reveals. Illustrations, not data. Sleeps when hidden; still under reduced motion.
(function () {
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const NOISE = '01<>/\\|=+*#%$&?ABCDEFGHJKLMNPRSTUVXYZ';
  const rnd = s => s[(Math.random() * s.length) | 0];

  // ---------- the field ----------
  (function field() {
    const cv = $('#field'); if (!cv || !cv.getContext) return;
    const x = cv.getContext('2d'), S = 26; let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, lit = null, on = false, last = 0;
    const t0 = performance.now();
    function size() { dpr = Math.min(1.5, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr); cols = Math.ceil(W / S) + 1; rows = Math.ceil(H / S) + 1; lit = new Float32Array(cols * rows); }
    const A = ['rgba(238,242,232,.06)', 'rgba(238,242,232,.11)', 'rgba(198,255,46,.28)', 'rgba(198,255,46,.55)', 'rgba(198,255,46,.9)'];
    function draw(now) {
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      const band = ((((now - t0) / 1000) % 8) / 8) * (H + 240) - 120;
      for (let k = 0; k < 5; k++) lit[(Math.random() * lit.length) | 0] = 1;            // churn: sparks that flare and fade
      const bins = [[], [], [], [], []];
      for (let j = 0; j < rows; j++) {
        const y = j * S + 6, d = Math.abs(y - band), b = d < 26 ? 2 : d < 70 ? 1 : 0;
        for (let i = 0; i < cols; i++) {
          const n = j * cols + i; if (b === 2 && Math.random() < .015) lit[n] = 1;
          const L = lit[n]; if (L > .02) lit[n] = L * .9;
          const lvl = L > .6 ? 4 : L > .3 ? 3 : b === 2 ? 2 : (b === 1 || L > .1) ? 1 : 0;
          bins[lvl].push(i * S + 6, y);
        }
      }
      for (let l = 0; l < 5; l++) { const p = bins[l]; if (!p.length) continue; x.fillStyle = A[l]; const s = l > 1 ? 2.5 : 2; for (let q = 0; q < p.length; q += 2) x.fillRect(p[q], p[q + 1], s, s); }
    }
    function loop(now) { if (!on) return; if (now - last > 41) { last = now; draw(now); } requestAnimationFrame(loop); }
    function play() { if (on || calm) return; on = true; requestAnimationFrame(loop); }
    size(); draw(performance.now());
    addEventListener('resize', () => { size(); if (calm) draw(performance.now()); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) on = false; else play(); });
    play();
  })();

  // ---------- decode: text resolves out of noise ----------
  function decode(el, ms) {
    if (!el || el.dataset.done) return; el.dataset.done = '1';
    if (calm) return;
    const nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) nodes.push(w.currentNode);
    const orig = nodes.map(n => n.nodeValue), total = orig.reduce((a, s) => a + s.length, 0) || 1, at = [];
    for (let k = 0; k < total; k++) at.push((k / total) * .65 + Math.random() * .35);
    const t0 = performance.now(); ms = ms || 900; let lastF = 0;
    (function step(now) {
      const p = (now - t0) / ms;
      if (now - lastF > 40 || p >= 1) {
        lastF = now; let k = 0;
        nodes.forEach((n, i) => { const s = orig[i]; let out = ''; for (let c = 0; c < s.length; c++, k++) { const ch = s[c]; out += (ch === ' ' || p >= at[k]) ? ch : rnd(NOISE); } n.nodeValue = out; });
      }
      if (p < 1) requestAnimationFrame(step); else nodes.forEach((n, i) => { n.nodeValue = orig[i]; });
    })(t0);
  }
  $$('.h1 [data-dec]').forEach((el, i) => setTimeout(() => decode(el, 1100), 150 + i * 260));

  // ---------- the hero: you | your clone ----------
  (function wipe() {
    const box = $('#cmp'); if (!box) return;
    const you = $('#cmpYou'), cl = $('#cmpClone');
    const pairs = [['ivy', 'ivy-clone'], ['theo', 'theo-clone']]; let pi = 0;
    pairs.flat().forEach(n => { const im = new Image(); im.src = '/assets/img/faces/' + n + '.jpg'; });
    let xv = 50, auto = true, hold = 0, t = 0, prev = performance.now(), vis = true, on = false, over = false;
    const set = v => { xv = Math.max(0, Math.min(100, v)); box.style.setProperty('--x', xv.toFixed(2) + '%'); };
    const at = e => { const r = box.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') over = true; });
    box.addEventListener('pointerleave', () => { over = false; hold = performance.now(); });
    box.addEventListener('pointerdown', e => { auto = false; hold = performance.now(); try { box.setPointerCapture(e.pointerId); } catch {} set(at(e)); });
    box.addEventListener('pointermove', e => { if (over || (box.hasPointerCapture && box.hasPointerCapture(e.pointerId))) { auto = false; hold = performance.now(); set(at(e)); } });
    function loop(now) {
      if (!on) return;
      const dt = Math.min(.05, (now - prev) / 1000); prev = now;
      if (!auto && !over && now - hold > 2200) { auto = true; t = Math.asin(Math.max(-1, Math.min(1, (xv - 50) / 38))) / .8; }
      if (auto) { t += dt; set(50 + Math.sin(t * .8) * 38); }
      requestAnimationFrame(loop);
    }
    function play() { if (on || calm || !vis || document.hidden) return; on = true; prev = performance.now(); requestAnimationFrame(loop); }
    const stop = () => { on = false; };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[es.length - 1].isIntersecting; vis ? play() : stop(); }).observe(box);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : play(); });
    play();
    if (calm) return;
    setInterval(() => {
      if (document.hidden || !vis || over) return;
      pi = (pi + 1) % pairs.length;
      box.classList.remove('glx'); void box.offsetWidth; box.classList.add('glx');
      setTimeout(() => { you.src = '/assets/img/faces/' + pairs[pi][0] + '.jpg'; cl.src = '/assets/img/faces/' + pairs[pi][1] + '.jpg'; }, 110);
      setTimeout(() => box.classList.remove('glx'), 560);
    }, 8000);
    // scroll: the words drift apart as you leave the hero
    const w1 = $('.w1'), w2 = $('.w2'); let ticking = false;
    addEventListener('scroll', () => {
      if (ticking || innerWidth < 900) return; ticking = true;
      requestAnimationFrame(() => { ticking = false; const y = Math.min(scrollY, innerHeight); if (w1) w1.style.transform = `translateX(${(-y * .18).toFixed(1)}px)`; if (w2) w2.style.transform = `translateX(${(y * .18).toFixed(1)}px)`; });
    }, { passive: true });
  })();

  // ---------- the split-flap board ----------
  (function flap() {
    const el = $('#flap'); if (!el) return;
    const WORDS = ['MONACO', 'TOKYO', 'IBIZA', 'DUBAI', 'MALIBU', 'PARIS', 'MYKONOS', 'ASPEN', 'MIAMI', 'BALI', 'CANNES', 'LONDON'], N = 7;
    const cells = Array.from({ length: N }, () => { const b = document.createElement('b'); b.textContent = ' '; el.appendChild(b); return b; });
    const put = (c, ch) => { c.textContent = ch === ' ' ? ' ' : ch; c.classList.remove('f'); void c.offsetWidth; c.classList.add('f'); };
    function show(word) {
      const pad = Math.floor((N - word.length) / 2), s = (' '.repeat(pad) + word).padEnd(N, ' ');
      cells.forEach((c, i) => {
        if (calm) { c.textContent = s[i] === ' ' ? ' ' : s[i]; return; }
        let n = 2 + i + ((Math.random() * 3) | 0);
        const tick = () => { if (n-- > 0) { put(c, rnd('ABCDEFGHIJKLMNOPQRSTUVWXYZ')); setTimeout(tick, 60); } else put(c, s[i]); };
        setTimeout(tick, i * 45);
      });
    }
    let w = 0; show(WORDS[0]);
    if (!calm) setInterval(() => { if (!document.hidden) { w = (w + 1) % WORDS.length; show(WORDS[w]); } }, 2900);
  })();

  // ---------- the face scanner ----------
  (function scanner() {
    const d = $('#drop'), pts = $('#pts'), img = $('#picImg'); if (!d || !pts || !img) return;
    const P = [[.37, .43], [.63, .43], [.5, .56], [.41, .69], [.59, .69], [.5, .73], [.29, .52], [.71, .52], [.5, .88], [.34, .31], [.66, .31], [.5, .21]];
    pts.innerHTML = P.map((p, k) => `<i style="left:${p[0] * 100}%;top:${p[1] * 100}%;--k:${k}"></i>`).join('');
    let tm = 0;
    new MutationObserver(() => {
      d.classList.remove('scanning', 'done'); void d.offsetWidth; d.classList.add('scanning');
      clearTimeout(tm); tm = setTimeout(() => d.classList.add('done'), calm ? 0 : 2900);
    }).observe(img, { attributes: true, attributeFilter: ['src'] });
  })();

  // ---------- voice bars, and the waveform while it talks ----------
  $$('#vstyles .chip').forEach(c => { const s = document.createElement('span'); s.className = 'vw'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; c.prepend(s); });
  if ('speechSynthesis' in window && $('.ask .wv')) setInterval(() => { document.body.classList.toggle('speaking', !!speechSynthesis.speaking); }, 150);

  // ---------- its answers are typed out ----------
  const said = $('#said');
  if (said && !calm) new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1 || !n.classList.contains('it') || n.classList.contains('sys')) return;
    const s = n.textContent; n.textContent = ''; n.classList.add('typing'); let i = 0; const step = Math.max(1, Math.ceil(s.length / 70));
    const iv = setInterval(() => { i += step; n.textContent = s.slice(0, i); said.scrollTop = said.scrollHeight; if (i >= s.length) { clearInterval(iv); n.classList.remove('typing'); } }, 24);
  }))).observe(said, { childList: true });

  // ---------- step 02: opinions, typed ----------
  (function tw() {
    const el = $('#tw'); if (!el) return;
    const L = ['pineapple on pizza is a personality test.', 'gym at 5am or don’t talk to me.', 'sunsets are free. so is my opinion.'];
    if (calm) { el.textContent = L[0]; return; }
    let li = 0, i = 0, dir = 1;
    (function step() {
      const s = L[li]; i += dir; el.textContent = s.slice(0, i);
      if (dir > 0 && i >= s.length) { dir = -1; return setTimeout(step, 1800); }
      if (dir < 0 && i <= 0) { dir = 1; li = (li + 1) % L.length; return setTimeout(step, 400); }
      setTimeout(step, dir > 0 ? 45 + Math.random() * 50 : 18);
    })();
  })();

  // ---------- how it works: the rail fills as you scroll ----------
  (function rail() {
    const box = $('.howw'), fill = $('.rail i'), lis = $$('.how li'); if (!box || !fill) return;
    if (calm) { lis.forEach(li => li.classList.add('lit')); return; }
    let tk = false;
    function upd() {
      tk = false; const r = box.getBoundingClientRect(), mid = innerHeight * .62;
      fill.style.transform = `scaleY(${Math.max(0, Math.min(1, (mid - r.top) / r.height)).toFixed(3)})`;
      lis.forEach(li => { const q = li.getBoundingClientRect(); li.classList.toggle('lit', q.top + q.height * .45 < mid); });
    }
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  })();

  // ---------- reveals; section heads decode as they arrive; the nav follows ----------
  (function reveal() {
    const io = !calm && 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; const t = en.target; t.classList.add('seen'); io.unobserve(t);
      if (t.matches('.sh')) decode(t.querySelector('h2'), 800);
    }), { rootMargin: '0px 0px -8% 0px' }) : null;
    $$('.sh, .lab, .board, .split, .faq details, .prof, .cgrid .panel').forEach(el => { if (!io) { el.classList.add('seen'); return; } if (!el.matches('.sh, .split')) el.classList.add('rv'); io.observe(el); });
    const links = $$('.nav a');
    if (links.length && 'IntersectionObserver' in window) {
      const nio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
      ['make', 'roster', 'feed', 'how'].forEach(id => { const s = document.getElementById(id); if (s) nio.observe(s); });
    }
  })();

  // ---------- new posts scan in (once each, not on every refresh) ----------
  (function posts() {
    const box = $('#posts'); if (!box || calm) return; const seen = new Set();
    new MutationObserver(() => { let k = 0; box.querySelectorAll('.post:not(.ghost)').forEach(p => { const im = p.querySelector('img'), key = im && im.getAttribute('src'); if (key && !seen.has(key)) { seen.add(key); p.style.setProperty('--i', k++ % 12); p.classList.add('new'); } }); }).observe(box, { childList: true });
  })();
})();
