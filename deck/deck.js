/* Lights, Camera, Agents! — tiny, dependency-free deck engine.
   Keys: → / Space / PgDn  next build · ← / PgUp  previous · Home/End
         F fullscreen · N notes overlay · P presenter window · B / . blackout
         G go to slide number (type digits then G)                         */
(() => {
  const stage = document.getElementById('stage');
  const slides = [...stage.querySelectorAll(':scope > section.slide')];
  const qs = new URLSearchParams(location.search);
  const isPresenter = qs.has('presenter'), isEmbed = qs.has('embed');
  const S = window.SPEAKER || null;
  let idx = 0, step = 0, digits = '', peer = null;

  /* ---------- speaker-config-driven slides ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const patents = () => S ? `${S.patents.count}${S.patents.suffix || ''} ${S.patents.label}` : '';
  const runs = line => line.map(r => {
    const t = esc(r.text).replace('{{patents}}', esc(patents()));
    return r.bold ? `<b>${t}</b>` : t;
  }).join('');
  const ICONS = {
    work:'<path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3"/><path d="M4 13h16"/>',
    author:'<path d="M5 4h10l4 4v12H5z"/><path d="M8 11h8M8 15h6"/>',
    education:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    speaking:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    voice:'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    sport:'<circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L21 21"/><path d="M5 9h8M9 5v8"/>',
    art:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 004-4c0-4.5-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24">${ICONS[k] || ''}</svg>`;

  function renderSpeaker() {
    if (!S) return;
    const base = 'assets/speaker/';
    document.querySelectorAll('[data-speaker="intro"]').forEach(el => {
      el.innerHTML = `
        <div class="intro">
          <div class="intro-left">
            <div class="headshot"><img src="${base}${esc(S.portrait.path)}" alt="${esc(S.portrait.alt)}"><span class="credit mono">DIRECTED BY</span></div>
          </div>
          <div class="intro-right">
            <div class="kicker">${esc(S.intro.kicker)}</div>
            <h2 class="greet">${esc(S.intro.greeting).replace('Tezan', '<span class="it p">Tezan</span>')}</h2>
            <div class="filmo">
              ${S.intro.sections.map((s, i) => `
                <div class="filmo-item f">
                  <div class="ico ${['','l','c','p'][i % 4]}">${icon(s.icon)}</div>
                  <div><h3>${esc(s.heading)}</h3>${s.lines.map(l => `<p>${runs(l)}</p>`).join('')}</div>
                </div>`).join('')}
            </div>
            <div class="offclock f">
              <span class="mono oc-h">${esc(S.interests.heading)}</span>
              ${S.interests.items.map(it => `<span class="pill">${icon(it.icon).replace('<svg', '<svg class="i"')} ${esc(it.label)}</span>`).join('')}
            </div>
          </div>
        </div>`;
    });
    document.querySelectorAll('[data-speaker="closing"]').forEach(el => {
      el.innerHTML = `
        <div class="closing">
          <div class="rings"><div class="ring-text">
            <div class="kicker">${esc(S.closing.kicker)}</div>
            <div class="folks it">${esc(S.closing.signOff)}</div>
            <div class="qs">${esc(S.closing.invitation)}</div>
          </div></div>
          <div class="contacts">
            ${S.contacts.map(c => `
              <div class="contact"><img src="${base}${esc(c.qrImage)}" alt="${esc(c.label)} QR">
                <div><b>${esc(c.label)}</b><span class="mono">${esc(c.displayUrl)}</span></div></div>`).join('')}
          </div>
        </div>`;
    });
  }

  /* ---------- footer: email + reel + take counter ---------- */
  function decorate() {
    const email = S ? S.footer.email : '';
    const reels = slides.filter(s => s.dataset.reel).map(s => s.dataset.reel);
    const uniq = [...new Set(reels)];
    let reel = '';
    slides.forEach((s, i) => {
      if (s.dataset.reel) reel = s.dataset.reel;
      s.dataset.curReel = reel;
      const n = String(i + 1).padStart(2, '0');
      const bar = uniq.map(r => `<i class="${r === reel ? 'on' : ''}"></i>`).join('');
      const label = reel ? (/^\d+$/.test(reel) ? `REEL ${esc(reel)} · ` : reel === '★' ? 'PREMIERE NIGHT · ' : reel === 'FIN' ? 'THE END · ' : `${esc(reel)} · `) : '';
      s.insertAdjacentHTML('beforeend',
        `<footer class="credits"><span>${esc(email)}</span><span class="reelbar">${reel ? bar : ''}</span><span class="take">${label}TAKE <b>${n}</b></span></footer>`);
    });
  }

  /* ---------- navigation ---------- */
  /* .f = one click each, in DOM order · .fw = appears together with the nearest preceding .f · .f1 = frame that appears on the first click */
  const frags = s => [...s.querySelectorAll('.f')];
  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    const fs = frags(slides[idx]);
    fs.forEach((f, i) => f.classList.toggle('on', i < step));
    slides[idx].querySelectorAll('.fw').forEach(w => {
      const k = fs.filter(f => f.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING).length;
      w.classList.toggle('on', k === 0 || k <= step);
    });
    slides[idx].querySelectorAll('.f1').forEach(w => w.classList.toggle('on', step > 0));
    if (!isEmbed) history.replaceState(null, '', `${location.search}#${idx + 1}${step ? '.' + step : ''}`);
    document.getElementById('hud').textContent = `${idx + 1}/${slides.length}${fs.length ? ` · build ${step}/${fs.length}` : ''}`;
    document.getElementById('notesPanel').innerHTML = notesHTML(idx);
    if (isPresenter) presenterUpdate();
  }
  function go(i, st = 0, from) {
    idx = Math.max(0, Math.min(slides.length - 1, i));
    step = Math.max(0, Math.min(frags(slides[idx]).length, st));
    render();
    if (from !== 'peer') sync();
  }
  function next() {
    if (step < frags(slides[idx]).length) go(idx, step + 1);
    else if (idx < slides.length - 1) go(idx + 1, 0);
  }
  function prev() {
    if (step > 0) go(idx, step - 1);
    else if (idx > 0) go(idx - 1, frags(slides[idx - 1]).length);
  }

  /* ---------- presenter sync (postMessage works on file:// too) ---------- */
  function sync() {
    const target = isPresenter ? window.opener : peer;
    if (target && !target.closed) target.postMessage({ lca: 1, idx, step }, '*');
  }
  window.addEventListener('message', e => {
    const d = e.data;
    if (d && d.lca) {
      if (d.hello && !isPresenter) peer = e.source;
      if (typeof d.idx === 'number') go(d.idx, d.step, 'peer');
    }
  });
  function openPresenter() {
    peer = window.open(`${location.pathname}?presenter#${idx + 1}`, 'lca-presenter', 'width=1500,height=900');
  }

  const notesOf = i => {
    const n = slides[i].querySelector('.notes');
    return n ? n.textContent.replace(/^\s+|\s+$/g, '').replace(/\n[ \t]+/g, '\n') : '';
  };
  /* Notes markup (plain text, one idea per line):
     ⏱ timing · ▸ stage cue / click · ✦ source · blank line = new beat · anything else = spoken line */
  const notesHTML = i => notesOf(i).split('\n').map(l => {
    const t = l.trim();
    if (!t) return '<div class="gap"></div>';
    if (t.startsWith('⏱')) return `<p class="n-time">${esc(t)}</p>`;
    if (t.startsWith('▸')) return `<p class="n-cue">${esc(t)}</p>`;
    if (t.startsWith('✦')) return `<p class="n-src">${esc(t)}</p>`;
    return `<p class="n-say">${esc(t)}</p>`;
  }).join('');
  const titleOf = i => {
    const s = slides[i];
    if (!s) return '— end —';
    if (s.dataset.title) return s.dataset.title;
    const h = s.querySelector('h1,h2,.qa,.big-line');
    return h ? h.textContent.trim().replace(/\s+/g, ' ') : `Slide ${i + 1}`;
  };
  let t0 = null;
  function presenterUpdate() {
    const pv = document.getElementById('pv');
    const fs = frags(slides[idx]).length;
    pv.querySelector('.meta').innerHTML =
      `<b>${idx + 1}</b>/${slides.length} · ${esc(titleOf(idx))}<br><span>BUILD ${step}/${fs}${step < fs ? ' · ▸ more clicks on this slide' : ' · ✓ slide complete'}</span>`;
    const pn = pv.querySelector('.pnotes');
    if (pn.dataset.i !== String(idx)) { pn.innerHTML = notesHTML(idx); pn.scrollTop = 0; pn.dataset.i = idx; }
    pv.querySelector('.nxt-t').textContent = titleOf(idx + 1);
    const fr = pv.querySelector('iframe');
    const post = () => fr.contentWindow && fr.contentWindow.postMessage({ lca: 1, idx: Math.min(idx + 1, slides.length - 1), step: 999 }, '*');
    fr.dataset.ready ? post() : (fr.onload = () => { fr.dataset.ready = 1; post(); });
  }
  function buildPresenter() {
    document.getElementById('pv').innerHTML = `
      <div class="pv-left">
        <div class="pv-head"><div class="clock">0:00:00</div><div class="meta"></div></div>
        <div class="pnotes"></div>
        <div class="pv-keys">→ next · ← back · B blackout · T reset timer · + / − text size</div>
      </div>
      <div class="pv-right">
        <div class="pv-lbl">NOW ON SCREEN</div><div class="pv-cur"></div>
        <div class="pv-lbl">UP NEXT ▸ <span class="nxt-t"></span></div>
        <div class="pv-next"><iframe src="${location.pathname}?embed" title="next slide"></iframe></div>
      </div>`;
  }
  function tick() {
    if (!t0) t0 = Date.now();
    const s = Math.floor((Date.now() - t0) / 1000);
    document.querySelector('#pv .clock').textContent =
      `${String(Math.floor(s / 3600)).padStart(1, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  /* ---------- scale ---------- */
  function fit() {
    if (isPresenter) {
      const r = document.querySelector('#pv .pv-cur').getBoundingClientRect(), sc = r.width / 1920;
      Object.assign(stage.style, { left: r.left + 'px', top: r.top + 'px', transform: `scale(${sc})` });
      return;
    }
    const sc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%,-50%) scale(${sc})`;
  }

  /* ---------- input ---------- */
  document.addEventListener('keydown', e => {
    if (isEmbed || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (isPresenter && (k === 't' || k === 'T')) { t0 = Date.now(); tick(); return; }
    if (isPresenter && (k === '+' || k === '=' || k === '-')) {
      const pn = document.querySelector('#pv .pnotes'), fz = parseFloat(getComputedStyle(pn).fontSize);
      pn.style.fontSize = Math.max(18, Math.min(48, fz + (k === '-' ? -2 : 2))) + 'px'; return;
    }
    if (/^[0-9]$/.test(k)) { digits += k; return; }
    if (k === 'g' || k === 'G' || (k === 'Enter' && digits)) { if (digits) go(parseInt(digits, 10) - 1); digits = ''; return; }
    digits = '';
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (k === 'n' || k === 'N') document.body.classList.toggle('show-notes');
    else if (k === 'p' || k === 'P') { if (!isPresenter) openPresenter(); }
    else if (k === 'b' || k === 'B' || k === '.') document.body.classList.toggle('black');
  });
  stage.addEventListener('click', e => {
    if (isPresenter || isEmbed || e.target.closest('a')) return;
    (e.clientX > window.innerWidth / 3) ? next() : prev();
  });
  window.addEventListener('resize', fit);

  /* ---------- boot ---------- */
  renderSpeaker();
  decorate();
  if (isEmbed) document.body.classList.add('embed');
  if (isPresenter) {
    document.body.classList.add('presenter');
    document.title = 'Presenter · ' + document.title;
    buildPresenter();
    setInterval(tick, 1000); tick();
    if (window.opener) window.opener.postMessage({ lca: 1, hello: 1 }, '*');
  }
  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
  fit();
  go(m ? parseInt(m[1], 10) - 1 : 0, m && m[2] ? parseInt(m[2], 10) : 0, 'peer');
  window.deck = { go, next, prev, count: slides.length, frags: i => frags(slides[i]).length };
})();
