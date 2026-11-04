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
  function endBoot() {
    if (!root.classList.contains('booting')) return;
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
    boot.classList.add('done');
    setTimeout(() => root.classList.remove('booting'), 560);
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
      if (li >= lines.length) { setTimeout(endBoot, 260); return; }
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
      const n = Math.ceil(w / (SIZE * 1.6));
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
        ctx.fillStyle = 'rgba(7,17,31,0.16)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '500 ' + SIZE * .8 + 'px "DM Mono", monospace';
        cols.forEach((c, i) => {
          const x = i * SIZE * 1.6;
          let ch;
          if (c.word) { ch = c.word[c.wi++]; if (c.wi >= c.word.length) c.word = null; }
          else { if (Math.random() < .012) { c.word = rand(WORDS); c.wi = 0; } ch = rand(GLYPHS); }
          const head = Math.random() < .08;
          ctx.fillStyle = head ? 'rgba(200,250,255,.9)' : (c.word ? 'rgba(141,255,183,.55)' : 'rgba(101,230,255,.42)');
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
    const delay = root.classList.contains('booting') ? 900 : 0;
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
    setTimeout(tick, root.classList.contains('booting') ? 4200 : 2400);
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
