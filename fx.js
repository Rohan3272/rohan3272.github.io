/* FX layer: boot sequence, code rain, text decode, typing terminal,
   count-ups, scroll progress and card spotlight. Static page works
   without this file; reduced-motion users get the calm version. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = '01<>/{}[]=+*#$%&_-:;ABCDEF0123456789';
  const rand = s => s[(Math.random() * s.length) | 0];

  /* ---------- Boot sequence ---------- */
  const boot = document.querySelector('.boot');
  const log = document.querySelector('.boot-log');
  let bootEnded = false;
  function endBoot() {
    if (bootEnded || !root.classList.contains('booting')) return;
    bootEnded = true;
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
    boot.classList.add('done');
    setTimeout(() => root.classList.remove('booting'), 760);
  }
  // progress bar + ACCESS GRANTED, then glitch out
  function bootFinale(html, cursor) {
    const W = 24;
    let p = 0;
    const tick = () => {
      p = Math.min(100, p + 3 + Math.random() * 9);
      const fill = Math.round(W * p / 100);
      log.innerHTML = html + '<span class="hl">decrypting portfolio</span> [<span class="ok">' + '█'.repeat(fill) + '</span>' + '░'.repeat(W - fill) + '] ' + String(Math.floor(p)).padStart(3) + '%' + cursor;
      if (p < 100) setTimeout(tick, 45 + Math.random() * 60);
      else setTimeout(() => {
        boot.classList.add('granted');
        setTimeout(endBoot, 950);
      }, 180);
    };
    tick();
  }
  if (root.classList.contains('booting') && boot && log) {
    const lines = [
      ['$ ', 'ssh guest@rohan3272.github.io'],
      ['', '<span class="ok">✓</span> connection established'],
      ['$ ', 'load --modules python sql power_bi php ml'],
      ['', '<span class="ok">✓</span> 5 modules loaded · 3 brands · 6 systems shipped'],
      ['$ ', 'whoami'],
      ['', '<span class="hl">rohan_mehta</span> · data analyst · full stack dev @ ilacad'],
      ['$ ', 'open portfolio']
    ];
    let html = '', li = 0;
    const cursor = '<span class="cur"></span>';
    const typeLine = () => {
      if (li >= lines.length) { bootFinale(html, cursor); return; }
      const [prefix, text] = lines[li++];
      if (!prefix) { html += text + '\n'; log.innerHTML = html + cursor; setTimeout(typeLine, 120); return; }
      let i = 0;
      html += '<span class="hl">' + prefix + '</span>';
      const step = () => {
        log.innerHTML = html + text.slice(0, i) + cursor;
        if (i++ < text.length) setTimeout(step, 16 + Math.random() * 22);
        else { html += text + '\n'; setTimeout(typeLine, 140); }
      };
      step();
    };
    boot.addEventListener('click', endBoot);
    addEventListener('keydown', endBoot, { once: true });
    typeLine();
  }

  /* ---------- Scroll progress ---------- */
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Card spotlight follows pointer ---------- */
  document.querySelectorAll('.project,.flow-step,.cert').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if (reduce) return; // everything below is pure motion

  /* ---------- Hero code rain ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    canvas.className = 'code-rain';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const SIZE = 15;
    const WORDS = ['SELECT', 'JOIN', 'WHERE', 'def', 'fit()', 'df[]', '<?php', 'INSERT', 'GROUP BY', 'np.', 'λ', '{ }', '=>'];
    let cols = [], w = 0, h = 0, dpr = 1, running = true, last = 0;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.ceil(w / (SIZE * 1.2));
      cols = Array.from({ length: n }, () => ({ y: Math.random() * -h, speed: .35 + Math.random() * .9, word: null, wi: 0 }));
    };
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(draw); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && running) requestAnimationFrame(draw); });
    function draw(t) {
      if (!running || document.hidden) return;
      if (t - last > 50) { // ~20fps keeps it calm and cheap
        last = t;
        ctx.fillStyle = 'rgba(7,17,31,0.11)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '500 ' + SIZE * .85 + 'px "DM Mono", monospace';
        cols.forEach((c, i) => {
          const x = i * SIZE * 1.2;
          let ch;
          if (c.word) { ch = c.word[c.wi++]; if (c.wi >= c.word.length) c.word = null; }
          else { if (Math.random() < .012) { c.word = rand(WORDS); c.wi = 0; } ch = rand(GLYPHS); }
          const head = Math.random() < .1;
          ctx.shadowBlur = head ? 8 : 0;
          ctx.shadowColor = 'rgba(101,230,255,.9)';
          ctx.fillStyle = head ? 'rgba(220,252,255,1)' : (c.word ? 'rgba(141,255,183,.85)' : 'rgba(101,230,255,.7)');
          ctx.fillText(ch, x, c.y);
          c.y += SIZE * c.speed;
          if (c.y > h + 20 && Math.random() > .96) { c.y = -20; c.speed = .35 + Math.random() * .9; }
        });
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- Text decode (scramble) on reveal ---------- */
  const ORIG = new WeakMap(); // true text per node, so overlapping runs never save scrambled text
  function scramble(el, duration = 900) {
    const nodes = [];
    const walk = n => n.nodeType === 3 ? (n.nodeValue.trim() && nodes.push(n)) : n.childNodes.forEach(walk);
    walk(el);
    nodes.forEach(n => { if (!ORIG.has(n)) ORIG.set(n, n.nodeValue); });
    const originals = nodes.map(n => ORIG.get(n));
    const total = originals.reduce((a, s) => a + s.length, 0);
    const start = performance.now();
    el.classList.add('scrambling');
    const frame = now => {
      const p = Math.min(1, (now - start) / duration);
      let offset = 0;
      nodes.forEach((n, k) => {
        const src = originals[k];
        let out = '';
        for (let i = 0; i < src.length; i++) {
          const ch = src[i];
          const revealAt = (offset + i) / total;
          out += (ch === ' ' || p >= revealAt * .85 + .15) ? ch : rand(GLYPHS);
        }
        n.nodeValue = out;
        offset += src.length;
      });
      if (p < 1) requestAnimationFrame(frame);
      else { nodes.forEach((n, k) => n.nodeValue = originals[k]); el.classList.remove('scrambling'); }
    };
    requestAnimationFrame(frame);
  }
  const decodeTargets = document.querySelectorAll('.section-label, .section-head h2, .case-hero h3, .flow-step h4, .eyebrow, .cert-top span');
  const decodeObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    decodeObs.unobserve(e.target);
    const delay = root.classList.contains('booting') && !bootEnded ? 5600 : 0;
    setTimeout(() => scramble(e.target, e.target.matches('h2,h3') ? 1100 : 750), delay);
  }), { threshold: .6 });
  decodeTargets.forEach(el => decodeObs.observe(el));
  // re-decode headings on hover for a bit of play
  document.querySelectorAll('.flow-step h4, .project-body h3').forEach(h => {
    let busy = false;
    h.closest('.flow-step, .project')?.addEventListener('mouseenter', () => {
      if (busy) return; busy = true; scramble(h, 500); setTimeout(() => busy = false, 700);
    });
  });

  /* ---------- Decrypt text on hover for buttons & links ---------- */
  document.querySelectorAll('.btn, .nav-cta, .project-link, .cert-link, .text-link, .quick-links a').forEach(b => {
    let busy = false;
    b.addEventListener('mouseenter', () => {
      if (busy) return; busy = true;
      // only the label text, not the arrow glyphs
      let span = b.querySelector(':scope > .dec-label');
      if (!span) {
        const label = [...b.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
        if (!label) { busy = false; return; }
        span = document.createElement('span');
        span.className = 'dec-label';
        label.replaceWith(span);
        span.appendChild(label);
      }
      b.style.minWidth = b.offsetWidth + 'px'; // stop width jitter while scrambling
      scramble(span, 420);
      setTimeout(() => { busy = false; }, 500);
    });
  });

  /* ---------- Crosshair cursor follower ---------- */
  const cross = document.querySelector('.crosshair');
  if (cross && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const xy = cross.querySelector('.xy');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const pad = n => String(Math.round(n)).padStart(4, '0');
    const loop = () => {
      cx += (tx - cx) * .22; cy += (ty - cy) * .22;
      cross.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > .3) raf = requestAnimationFrame(loop); else raf = 0;
    };
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      xy.textContent = 'x:' + pad(e.pageX) + ' y:' + pad(e.pageY);
      cross.classList.add('on');
      cross.classList.toggle('hot', !!e.target.closest('a,button,.project,.flow-step,.cert'));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', () => cross.classList.remove('on'));
  }

  /* ---------- Image decrypt on reveal ---------- */
  const shots = document.querySelectorAll('.dashboard-shot, .cert-preview');
  shots.forEach(s => s.classList.add('decrypt-wait'));
  const imgObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    imgObs.unobserve(e.target);
    const s = e.target, img = s.querySelector('img');
    const name = (img?.getAttribute('src') || 'asset').split('/').pop();
    const tag = document.createElement('span');
    tag.className = 'img-load';
    s.appendChild(tag);
    let p = 0;
    s.classList.add('decrypt-run');
    s.classList.remove('decrypt-wait');
    const t = setInterval(() => {
      p = Math.min(100, p + 9 + Math.random() * 14);
      tag.innerHTML = '&gt; decrypt ' + name + ' <b>' + String(Math.floor(p)).padStart(3) + '%</b>';
      if (p >= 100) { clearInterval(t); tag.innerHTML = '&gt; ' + name + ' <b>OK</b>'; setTimeout(() => tag.classList.add('gone'), 500); setTimeout(() => tag.remove(), 950); }
    }, 90);
  }), { threshold: .35 });
  shots.forEach(s => imgObs.observe(s));

  /* ---------- Typing terminal in hero ---------- */
  const typed = document.querySelector('.hero-term .typed');
  if (typed) {
    const words = typed.dataset.words.split('|');
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const word = words[wi];
      if (deleting) {
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(tick, 28);
      } else {
        const next = words[wi];
        ci++;
        typed.textContent = next.slice(0, ci);
        if (ci >= next.length) { deleting = true; setTimeout(tick, 2200); }
        else setTimeout(tick, 45 + Math.random() * 55);
      }
    };
    setTimeout(tick, root.classList.contains('booting') ? 7000 : 2400);
  }

  /* ---------- Count-up for stat numbers ---------- */
  const counters = document.querySelectorAll('.kpi-grid strong, .case-score strong, .metric-row strong, .insight-stats strong');
  const countObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const el = e.target, txt = el.textContent.trim();
    const m = txt.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const comma = num.includes(',');
    const start = performance.now(), dur = 1200;
    const fmt = v => { let s = v.toFixed(decimals); if (comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals }); return pre + s + post; };
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    };
    requestAnimationFrame(step);
  }), { threshold: .7 });
  counters.forEach(el => countObs.observe(el));
})();
