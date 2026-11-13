// Muslimah in Business: "Uni and a career aren't enough anymore". Animated text and graphics, 1920x1080.
// Every frame is a pure function of t. Scene lengths and beat times live in timing.js.
(function () {
  'use strict';
  const W = 1920, H = 1080;
  const TM = window.FILM_TIMING;
  const cv = document.getElementById('c'), g = cv.getContext('2d');

  // ---------- brand ----------
  const C = {
    em: '#0F4C45', emD: '#0A3631', emL: '#1C6A60', gold: '#C9A24A', goldL: '#E4C981',
    sand: '#F6EFE4', sandD: '#E8DBC6', rose: '#C97B63', roseL: '#E3A994', ink: '#1E2A2A',
  };
  const SERIF = '"Fraunces", Georgia, serif', SANS = '"DM Sans", "Inter", system-ui, sans-serif';

  // ---------- scenes ----------
  const SCENES = []; let acc = 0;
  for (const s of TM.scenes) { SCENES.push({ key: s.key, name: s.name, t0: acc, t1: acc + s.dur }); acc += s.dur; }
  const DUR = acc;
  window.VH_SCENES = SCENES.map(s => ({ name: s.name, t0: s.t0, t1: s.t1 }));

  // ---------- maths ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const eOut = x => 1 - Math.pow(1 - clamp(x), 3);
  const back = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const inP = (s, at, d = 0.7) => eOut((s - at) / d);          // 0 -> 1 when a beat arrives
  const outP = (s, at, d = 0.5) => 1 - ease((s - at) / d);      // 1 -> 0 when a beat leaves
  const win = (s, a, b, fi = 0.7, fo = 0.5) => Math.min(inP(s, a, fi), outP(s, b, fo)); // visible from a until b

  // ---------- drawing helpers ----------
  function font(size, kind = 'sans', weight = 500) {
    if (kind === 'serif') return `${weight} ${size}px ${SERIF}`;
    if (kind === 'serifI') return `italic ${weight} ${size}px ${SERIF}`;
    return `${weight} ${size}px ${SANS}`;
  }
  function txt(str, x, y, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0.001) return;
    g.save(); g.globalAlpha *= a;
    g.font = font(o.size || 60, o.kind, o.weight); g.fillStyle = o.color || C.sand;
    g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
    if (o.track) g.letterSpacing = o.track + 'px';
    g.fillText(str, x, y + (o.dy || 0));
    g.restore();
  }
  // a line that rises into place: p = 0..1
  const rise = (str, x, y, p, o = {}) => txt(str, x, y, { ...o, alpha: p * (o.alpha == null ? 1 : o.alpha), dy: (1 - p) * (o.lift || 34) });
  // centred line made of coloured parts: [[text, color], ...]
  function rich(parts, x, y, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0.001) return;
    g.save(); g.globalAlpha *= a; g.font = font(o.size || 60, o.kind, o.weight); g.textBaseline = 'middle'; g.textAlign = 'left';
    const widths = parts.map(p => g.measureText(p[0]).width), total = widths.reduce((s, w) => s + w, 0);
    let cx = o.align === 'left' ? x : x - total / 2;
    parts.forEach((p, i) => { g.fillStyle = p[1]; g.fillText(p[0], cx, y + (o.dy || 0)); cx += widths[i]; });
    g.restore();
  }
  function wrap(str, maxW, size, kind, weight) {
    g.save(); g.font = font(size, kind, weight);
    const words = str.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); g.restore(); return lines;
  }
  function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  function card(x, y, w, h, r, fill, o = {}) {
    g.save(); g.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
    if (o.shadow) { g.shadowColor = 'rgba(10,30,28,0.22)'; g.shadowBlur = 40; g.shadowOffsetY = 14; }
    rr(x, y, w, h, r); g.fillStyle = fill; g.fill();
    g.shadowColor = 'transparent';
    if (o.stroke) { g.lineWidth = o.lw || 3; g.strokeStyle = o.stroke; g.stroke(); }
    g.restore();
  }
  function pill(str, cx, cy, p, o = {}) {
    if (p <= 0.001) return;
    const size = o.size || 40;
    g.save(); g.font = font(size, 'sans', 700); const tw = g.measureText(str).width; g.restore();
    const w = tw + size * 1.4, h = size * 1.9, sc = lerp(0.7, 1, back(p));
    g.save(); g.translate(cx, cy); g.scale(sc, sc); g.globalAlpha *= clamp(p * 1.6);
    card(-w / 2, -h / 2, w, h, h / 2, o.fill || C.gold, { stroke: o.stroke });
    txt(str, 0, 2, { size, weight: 700, color: o.color || C.emD });
    g.restore();
  }
  function line(x1, y1, x2, y2, color, lw) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.stroke(); }

  // ---------- icons (line icons centred on 0,0, about 100 px across; scale with s) ----------
  function icon(name, x, y, s, color, p = 1, lw = 7) {
    if (p <= 0.001) return;
    g.save(); g.translate(x, y); const sc = s * lerp(0.6, 1, back(p)); g.scale(sc, sc); g.globalAlpha *= clamp(p * 1.5);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw / s; g.lineCap = 'round'; g.lineJoin = 'round';
    const P = () => g.beginPath(), S = () => g.stroke();
    switch (name) {
      case 'tick': P(); g.moveTo(-30, 2); g.lineTo(-8, 24); g.lineTo(32, -22); S(); break;
      case 'flask': P(); g.moveTo(-14, -48); g.lineTo(-14, -12); g.lineTo(-42, 40); g.quadraticCurveTo(-46, 50, -34, 50); g.lineTo(34, 50); g.quadraticCurveTo(46, 50, 42, 40); g.lineTo(14, -12); g.lineTo(14, -48); S();
        P(); g.moveTo(-24, -48); g.lineTo(24, -48); S(); P(); g.moveTo(-30, 22); g.lineTo(30, 22); S(); break;
      case 'shop': P(); g.moveTo(-46, -10); g.lineTo(-38, -42); g.lineTo(38, -42); g.lineTo(46, -10); g.closePath(); S();
        P(); g.moveTo(-40, -10); g.lineTo(-40, 46); g.lineTo(40, 46); g.lineTo(40, -10); S(); P(); g.rect(-12, 14, 24, 32); S(); break;
      case 'phone': P(); g.roundRect(-26, -48, 52, 96, 10); S(); P(); g.moveTo(-8, 34); g.lineTo(8, 34); S(); break;
      case 'bulb': P(); g.arc(0, -12, 30, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(14, 26); g.lineTo(-14, 26); g.closePath(); S();
        P(); g.moveTo(-12, 38); g.lineTo(12, 38); S(); P(); g.moveTo(-8, 48); g.lineTo(8, 48); S(); break;
      case 'wifi': for (let i = 0; i < 3; i++) { P(); g.arc(0, 30, 20 + i * 22, Math.PI * 1.22, Math.PI * 1.78); S(); } P(); g.arc(0, 30, 5, 0, Math.PI * 2); g.fill(); break;
      case 'clock': P(); g.arc(0, 0, 46, 0, Math.PI * 2); S(); P(); g.moveTo(0, 0); g.lineTo(0, -28); S(); P(); g.moveTo(0, 0); g.lineTo(20, 10); S(); break;
      case 'calc': P(); g.roundRect(-34, -46, 68, 92, 10); S(); P(); g.rect(-20, -32, 40, 18); S();
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { P(); g.arc(-16 + c * 16, 6 + r * 14, 3.5, 0, 7); g.fill(); } break;
      case 'tag': P(); g.moveTo(-40, -40); g.lineTo(8, -40); g.lineTo(46, 0); g.lineTo(6, 40); g.lineTo(-40, -6); g.closePath(); S(); P(); g.arc(-18, -18, 7, 0, 7); S(); break;
      case 'flag': P(); g.moveTo(-30, 50); g.lineTo(-30, -50); S(); P(); g.moveTo(-30, -46); g.lineTo(34, -46); g.lineTo(20, -24); g.lineTo(34, -2); g.lineTo(-30, -2); S(); break;
      case 'sprout': P(); g.moveTo(0, 50); g.lineTo(0, -6); S(); P(); g.moveTo(0, 8); g.quadraticCurveTo(-44, 6, -40, -34); g.quadraticCurveTo(-4, -32, 0, 8); S();
        P(); g.moveTo(0, -6); g.quadraticCurveTo(40, -10, 38, -46); g.quadraticCurveTo(4, -44, 0, -6); S(); break;
      case 'heart': P(); g.moveTo(0, 40); g.bezierCurveTo(-60, 0, -40, -50, 0, -20); g.bezierCurveTo(40, -50, 60, 0, 0, 40); S(); break;
      case 'chat': P(); g.roundRect(-46, -38, 92, 64, 14); S(); P(); g.moveTo(-18, 26); g.lineTo(-26, 46); g.lineTo(4, 26); S(); break;
      case 'play': P(); g.moveTo(-18, -26); g.lineTo(28, 0); g.lineTo(-18, 26); g.closePath(); g.fill(); break;
      case 'book': P(); g.moveTo(0, -30); g.quadraticCurveTo(-26, -44, -50, -36); g.lineTo(-50, 36); g.quadraticCurveTo(-26, 28, 0, 42); g.quadraticCurveTo(26, 28, 50, 36); g.lineTo(50, -36); g.quadraticCurveTo(26, -44, 0, -30); g.lineTo(0, 42); S(); break;
      case 'briefcase': P(); g.roundRect(-46, -22, 92, 66, 10); S(); P(); g.moveTo(-16, -22); g.lineTo(-16, -38); g.lineTo(16, -38); g.lineTo(16, -22); S(); P(); g.moveTo(-46, 4); g.lineTo(46, 4); S(); break;
      case 'house': P(); g.moveTo(-48, -2); g.lineTo(0, -44); g.lineTo(48, -2); S(); P(); g.moveTo(-36, -10); g.lineTo(-36, 44); g.lineTo(36, 44); g.lineTo(36, -10); S(); break;
      case 'sparkle': P(); g.moveTo(0, -46); g.quadraticCurveTo(4, -4, 46, 0); g.quadraticCurveTo(4, 4, 0, 46); g.quadraticCurveTo(-4, 4, -46, 0); g.quadraticCurveTo(-4, -4, 0, -46); g.fill(); break;
    }
    g.restore();
  }

  // ---------- backgrounds ----------
  function bgEmerald(t) {
    g.fillStyle = C.em; g.fillRect(0, 0, W, H);
    const gx = W * (0.5 + 0.25 * Math.sin(t * 0.07)), gy = H * (0.4 + 0.15 * Math.cos(t * 0.05));
    const rg = g.createRadialGradient(gx, gy, 50, gx, gy, 1100); rg.addColorStop(0, 'rgba(40,120,105,0.55)'); rg.addColorStop(1, 'rgba(10,54,49,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,28,25,0.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    // slow gold threads
    g.save(); g.globalAlpha = 0.12; g.strokeStyle = C.gold; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      g.beginPath(); const yb = 140 + i * 210 + Math.sin(t * 0.11 + i) * 30;
      for (let x = -20; x <= W + 20; x += 40) g.lineTo(x, yb + Math.sin(x * 0.003 + t * 0.15 + i * 1.7) * 60);
      g.stroke();
    }
    g.restore();
  }
  function bgSand(t) {
    g.fillStyle = C.sand; g.fillRect(0, 0, W, H);
    g.save();
    const blobs = [[0.12, 0.2, 360, C.sandD, 0.9], [0.9, 0.82, 440, C.sandD, 0.8], [0.85, 0.12, 220, C.roseL, 0.22], [0.08, 0.9, 260, C.goldL, 0.25]];
    blobs.forEach(([bx, by, r, col, a], i) => {
      g.globalAlpha = a; g.fillStyle = col; g.beginPath();
      g.arc(W * bx + Math.sin(t * 0.09 + i) * 40, H * by + Math.cos(t * 0.08 + i * 2) * 30, r, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  // big gold section number + heading, used by scenes 4 to 6
  function sectionTitle(s, num, title, dark, outAt) {
    const p = inP(s, 0, 0.9), q = outAt == null ? 1 : outP(s, outAt, 0.6);
    const a = Math.min(p, q); if (a <= 0) return;
    txt(num, W / 2, 400 + (1 - p) * 60, { size: 300, kind: 'serif', weight: 700, color: C.gold, alpha: a });
    rise(title, W / 2, 640, inP(s, 0.35, 0.8) * q, { size: 110, kind: 'serif', weight: 700, color: dark ? C.sand : C.em });
  }
  // small header that stays at the top after the title moves away
  function cornerTitle(s, num, title, dark, at) {
    const p = inP(s, at, 0.6); if (p <= 0) return;
    rich([[num + '  ', C.gold], [title, dark ? C.sand : C.em]], 110, 96, { size: 40, kind: 'serif', weight: 700, align: 'left', alpha: p });
    g.save(); g.globalAlpha = p; line(110, 132, 110 + 240 * p, 132, C.gold, 4); g.restore();
  }

  // ======================================================================================
  // Scene 1: Hook (emerald)
  function sHook(s, b) {
    bgEmerald(s);
    const fade = outP(s, b.out, 0.6);
    rise('Sisters, we did everything we were told.', W / 2, 230, inP(s, b.told, 0.9) * outP(s, b.why - 0.3), { size: 72, kind: 'serif', weight: 600, color: C.sand });
    // the three ticks, which slowly fall away once the question lands
    const items = [['Go to uni', b.uni], ['Get the degree', b.degree], ['Get the good job', b.job]];
    items.forEach(([label, at], i) => {
      const p = inP(s, at, 0.6), fall = ease((s - b.why - i * 0.25) / 4.5);
      const y = 430 + i * 130 + fall * (260 + i * 60), a = p * (1 - fall * 0.85) * outP(s, b.stay - 0.6);
      if (a <= 0) return;
      g.save(); g.globalAlpha = a; g.translate(W / 2 - 330, y); g.rotate(fall * (i - 1) * 0.06);
      card(-60, -50, 760, 100, 50, 'rgba(246,239,228,0.08)', { stroke: 'rgba(201,162,74,0.5)', lw: 2 });
      g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.fillStyle = C.gold; g.fill();
      icon('tick', 0, 0, 0.62, C.emD, inP(s, at + 0.15, 0.5), 9);
      txt(label, 70, 2, { size: 54, weight: 500, color: C.sand, align: 'left' });
      g.restore();
    });
    const pw = inP(s, b.why, 0.9) * outP(s, b.stay - 0.6);
    rise('So why does it still feel like', W / 2, 330, pw, { size: 80, kind: 'serif', weight: 600, color: C.sand, alpha: inP(s, b.why + 0.6, 0.8) });
    rise("we're falling behind?", W / 2, 450, inP(s, b.why + 1.4, 0.9) * outP(s, b.stay - 0.6), { size: 118, kind: 'serifI', weight: 600, color: C.goldL });
    // stay with me
    const ps = inP(s, b.stay, 0.8) * fade;
    rise('Stay with me for 5 minutes.', W / 2, 440, ps, { size: 84, kind: 'serif', weight: 700, color: C.sand });
    rise('What changed, and what to do about it.', W / 2, 560, inP(s, b.stay + 1.2, 0.8) * fade, { size: 52, weight: 500, color: C.goldL });
    // a 5 minute ring
    const ring = inP(s, b.stay + 0.4, 1.2) * fade;
    if (ring > 0) { g.save(); g.globalAlpha = ring; g.strokeStyle = C.gold; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.arc(W / 2, 760, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
      txt('5:00', W / 2, 762, { size: 40, weight: 700, color: C.sand, alpha: ring }); }
  }

  // Scene 2: Who I am (sand)
  function sMe(s, b) {
    bgSand(s);
    const top = ease((s - b.timeline + 0.8) / 1.2);           // logo moves up when the timeline starts
    const sa = inP(s, b.salaam, 0.8) * outP(s, b.timeline - 0.6);
    rise('Assalamu alaikum', W / 2, 330, sa, { size: 64, kind: 'serifI', weight: 600, color: C.rose });
    // logo lockup
    const lp = inP(s, b.logo, 1);
    const ly = lerp(520, 150, top), ls = lerp(1, 0.55, top);
    if (lp > 0) {
      g.save(); g.translate(W / 2, ly); g.scale(ls, ls);
      rise('Muslimah', 0, -40, lp, { size: 150, kind: 'serif', weight: 700, color: C.em });
      rise('IN BUSINESS', 0, 80, inP(s, b.logo + 0.4, 0.8), { size: 56, weight: 700, color: C.gold, track: 18 });
      const ul = ease((s - b.logo - 0.8) / 1); g.globalAlpha = lp; line(-260 * ul, 140, 260 * ul, 140, C.gold, 5);
      g.restore();
    }
    rise("I'm " + TM.name, W / 2, 760, inP(s, b.name, 0.8) * outP(s, b.timeline - 0.6), { size: 60, weight: 500, color: C.ink });
    // timeline: healthcare scientist -> business owner
    const tp = inP(s, b.timeline, 0.9); if (tp <= 0) return;
    const L = 470, R = 1450, Y = 520, trav = ease((s - b.travel) / 3.2);
    g.save(); g.globalAlpha = tp; g.setLineDash([2, 22]); line(L, Y, R, Y, C.em, 6); g.setLineDash([]);
    line(L, Y, lerp(L, R, trav), Y, C.gold, 8); g.restore();
    // left node
    g.save(); g.globalAlpha = tp; g.beginPath(); g.arc(L, Y, 110, 0, Math.PI * 2); g.fillStyle = C.em; g.fill(); g.restore();
    icon('flask', L, Y, 1.05, C.sand, tp, 7);
    rise('Healthcare scientist', L, Y + 175, tp, { size: 46, kind: 'serif', weight: 700, color: C.em });
    // the chips under the left node
    const chips = [['My time', 0], ['My income', 0.9], ['My future', 1.8]];
    chips.forEach(([c, d], i) => pill(c, L - 210 + i * 210, Y + 290, inP(s, b.chips + d, 0.5) * outP(s, b.payslip - 0.5), { size: 30, fill: C.sandD, color: C.em }));
    rise('One employer. One payslip.', L, Y + 300, inP(s, b.payslip, 0.7), { size: 44, weight: 700, color: C.rose });
    // moving dot
    if (trav > 0 && trav < 1) { g.beginPath(); g.arc(lerp(L, R, trav), Y, 18, 0, Math.PI * 2); g.fillStyle = C.gold; g.fill(); }
    // right node
    const rp = inP(s, b.owner, 0.8);
    g.save(); g.globalAlpha = tp; g.beginPath(); g.arc(R, Y, 110, 0, Math.PI * 2); g.fillStyle = rp > 0 ? C.gold : C.sandD; g.fill();
    if (rp > 0) { g.globalAlpha = tp * (1 - rp) * 0.6; g.beginPath(); g.arc(R, Y, 110 + rp * 80, 0, Math.PI * 2); g.strokeStyle = C.gold; g.lineWidth = 6; g.stroke(); }
    g.restore();
    icon('shop', R, Y, 1.05, rp > 0 ? C.emD : C.em, tp, 7);
    rise('Business owner', R, Y + 175, tp, { size: 46, kind: 'serif', weight: 700, color: C.em });
    rise('Alhamdulillah', R, Y + 250, inP(s, b.owner + 0.6, 0.7), { size: 38, kind: 'serifI', weight: 600, color: C.rose });
    // closing line
    const op = inP(s, b.open, 0.9);
    if (op > 0) { g.save(); g.globalAlpha = op; card(W / 2 - 560, 900, 1120, 110, 55, C.em); g.restore();
      txt('This path is open to you too.', W / 2, 956, { size: 52, kind: 'serif', weight: 700, color: C.sand, alpha: op }); }
  }

  // Scene 3: The old plan isn't enough (emerald)
  function sOld(s, b) {
    bgEmerald(s);
    // part A: education
    const aOut = outP(s, b.jobs - 0.6);
    rise('"Get an education."', W / 2, 360, inP(s, b.edu, 0.9) * aOut, { size: 104, kind: 'serifI', weight: 600, color: C.sand });
    rise('They were right.', W / 2, 500, inP(s, b.right, 0.8) * outP(s, b.moved - 0.5), { size: 60, weight: 500, color: C.goldL });
    rise('Education is still a gift.', W / 2, 600, inP(s, b.gift, 0.8) * outP(s, b.moved - 0.5), { size: 60, weight: 500, color: C.sand });
    rise('But the world has moved on.', W / 2, 560, inP(s, b.moved, 0.8) * aOut, { size: 84, kind: 'serif', weight: 700, color: C.goldL });
    // part B: jobs being reshaped by AI
    const jv = win(s, b.jobs, b.prices - 0.6);
    if (jv > 0) {
      txt('Jobs that felt safe five years ago', W / 2, 200, { size: 56, kind: 'serif', weight: 600, color: C.sand, alpha: jv });
      const icons = ['briefcase', 'calc', 'chat', 'book', 'flask', 'phone'];
      icons.forEach((ic, i) => {
        const x = 410 + i * 220, y = 520, p = inP(s, b.jobs + 0.3 + i * 0.25, 0.5) * jv;
        const sweep = clamp((s - b.jobs - 2.5) * 0.5 - i * 0.12);           // a gold shimmer passes over each card
        const hot = Math.sin(clamp(sweep) * Math.PI);
        g.save(); g.globalAlpha = p; card(x - 90, y - 110, 180, 220, 26, hot > 0.05 ? `rgba(201,162,74,${0.18 + hot * 0.5})` : 'rgba(246,239,228,0.08)', { stroke: 'rgba(201,162,74,0.55)', lw: 2 }); g.restore();
        icon(ic, x, y - 8, 0.85, sweep >= 1 ? C.goldL : C.sand, p, 6);
        if (sweep >= 1) icon('sparkle', x + 62, y - 82, 0.32, C.goldL, p);
      });
      rise('are being reshaped by AI right now.', W / 2, 800, inP(s, b.jobs + 2.2, 0.8) * jv, { size: 60, weight: 700, color: C.goldL });
    }
    // part C: prices vs salaries
    const pv = win(s, b.prices, b.juggle - 0.6);
    if (pv > 0) {
      const X0 = 520, Y0 = 820, Wc = 880, Hc = 520, gr = ease((s - b.prices - 0.5) / 4);
      g.save(); g.globalAlpha = pv; line(X0, Y0, X0 + Wc, Y0, 'rgba(246,239,228,0.5)', 3); line(X0, Y0, X0, Y0 - Hc, 'rgba(246,239,228,0.5)', 3);
      // prices climb steeply, salaries crawl
      g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40 * gr; g.lineTo(X0 + u * Wc, Y0 - 40 - Math.pow(u, 1.6) * (Hc - 80)); } g.strokeStyle = C.rose; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
      g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40 * gr; g.lineTo(X0 + u * Wc, Y0 - 40 - u * 90 + Math.sin(u * 18) * 5); } g.strokeStyle = C.sand; g.lineWidth = 10; g.stroke();
      g.restore();
      icon('tag', X0 + gr * Wc + 60, Y0 - 40 - Math.pow(gr, 1.6) * (Hc - 80), 0.7, C.rose, pv * clamp(gr * 3));
      txt('Prices', X0 + Wc + 70, Y0 - Hc + 30, { size: 46, weight: 700, color: C.roseL, alpha: pv * clamp(gr * 2 - 1), align: 'left' });
      txt('Salaries', X0 + Wc + 70, Y0 - 140, { size: 46, weight: 700, color: C.sand, alpha: pv * clamp(gr * 2 - 1), align: 'left' });
      txt('Prices keep going up while salaries crawl.', W / 2, 170, { size: 56, kind: 'serif', weight: 600, color: C.sand, alpha: pv });
    }
    // part D: juggling everything
    const gv = win(s, b.juggle, b.finish - 0.6);
    if (gv > 0) {
      const cx = W / 2, cy = 560, shrink = ease((s - b.juggle - 3) / 4);
      txt('Raising children. Looking after family. Holding down a career.', W / 2, 170, { size: 46, weight: 500, color: C.sand, alpha: gv });
      const orb = [['Kids', 'heart'], ['Family', 'house'], ['Career', 'briefcase']];
      orb.forEach(([lab, ic], i) => {
        const ang = (s - b.juggle) * 0.5 + i * Math.PI * 2 / 3, r = 300, p = inP(s, b.juggle + 0.3 + i * 0.4, 0.6) * gv;
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * 0.62;
        g.save(); g.globalAlpha = p; g.beginPath(); g.arc(x, y, 92, 0, Math.PI * 2); g.fillStyle = C.emL; g.fill(); g.strokeStyle = C.gold; g.lineWidth = 3; g.stroke(); g.restore();
        icon(ic, x, y - 16, 0.48, C.goldL, p, 5); txt(lab, x, y + 42, { size: 30, weight: 700, color: C.sand, alpha: p });
      });
      const yr = lerp(110, 46, shrink);
      g.save(); g.globalAlpha = gv * inP(s, b.juggle, 0.6); g.beginPath(); g.arc(cx, cy, yr, 0, Math.PI * 2); g.fillStyle = C.rose; g.fill(); g.restore();
      txt('You', cx, cy + 2, { size: lerp(50, 24, shrink), weight: 700, color: C.sand, alpha: gv });
      rise('...with nothing left over for ourselves.', W / 2, 950, inP(s, b.juggle + 4, 0.8) * gv, { size: 52, kind: 'serifI', weight: 600, color: C.goldL });
    }
    // part E: finish line becomes the starting point
    const fv = win(s, b.finish, b.behind - 0.6);
    if (fv > 0) {
      const flip = ease((s - b.finish - 3.2) / 0.9);
      rise('A degree used to be', W / 2, 260, inP(s, b.finish, 0.8) * fv, { size: 64, kind: 'serif', weight: 600, color: C.sand });
      icon('flag', W / 2 - 640, 520, 1.3, C.gold, inP(s, b.finish + 0.5, 0.7) * fv, 6);
      g.save(); g.translate(W / 2 + 120, 520); g.scale(1, Math.abs(Math.cos(flip * Math.PI)) || 0.001); g.globalAlpha = fv * inP(s, b.finish + 0.7, 0.6);
      const after = flip > 0.5;
      txt(after ? 'the starting point.' : 'the finish line.', 0, 0, { size: 120, kind: 'serifI', weight: 600, color: after ? C.goldL : C.sand });
      g.restore();
      rise('Now it is', W / 2 + 120, 390, inP(s, b.finish + 3.6, 0.6) * fv, { size: 44, weight: 700, color: C.goldL });
      // track lines
      g.save(); g.globalAlpha = fv * 0.5; for (let i = 0; i < 4; i++) line(260, 700 + i * 70, 1660, 700 + i * 70, C.sand, 3); g.restore();
    }
    // part F: left behind
    const lv = inP(s, b.behind, 0.8) * outP(s, 49.4, 0.5);
    if (lv > 0) {
      rise("We won't fail.", W / 2, 360, lv, { size: 92, kind: 'serif', weight: 700, color: C.sand });
      rise('But we will get left behind.', W / 2, 500, inP(s, b.behind + 1.4, 0.8) * outP(s, 49.4, 0.5), { size: 92, kind: 'serifI', weight: 600, color: C.goldL });
      rise('And our daughters are watching what we do.', W / 2, 700, inP(s, b.daughters, 0.9) * outP(s, 49.4, 0.5), { size: 52, weight: 500, color: C.sand });
    }
  }

  // Scene 4: Learn AI (sand)
  function sAI(s, b) {
    bgSand(s);
    sectionTitle(s, '01', 'Learn AI', false, b.words - 0.6);
    cornerTitle(s, '01', 'Learn AI', false, b.words - 0.2);
    // the fears, crossed out
    const fv = win(s, b.words, b.tool - 0.5);
    if (fv > 0) {
      ['Too technical?', 'Too scary?', 'Only for Silicon Valley?'].forEach((w, i) => {
        const p = inP(s, b.words + i * 1.4, 0.6) * fv, x = W / 2, y = 350 + i * 170, cut = ease((s - b.words - 4.6 - i * 0.3) / 0.5);
        rise(w, x, y, p, { size: 80, kind: 'serif', weight: 600, color: C.ink });
        if (cut > 0) { g.save(); g.globalAlpha = p; g.font = font(80, 'serif', 600); const tw = g.measureText(w).width; g.restore();
          g.save(); g.globalAlpha = p; line(x - tw / 2 - 20, y + 4, x - tw / 2 - 20 + (tw + 40) * cut, y + 4, C.rose, 9); g.restore(); }
      });
    }
    // it's a tool
    const tv = win(s, b.tool, b.week - 0.5);
    if (tv > 0) {
      rise("It's a tool.", W / 2, 300, inP(s, b.tool, 0.8) * tv, { size: 120, kind: 'serif', weight: 700, color: C.em });
      icon('calc', W / 2 - 220, 540, 1.2, C.em, inP(s, b.tool + 1, 0.6) * tv, 6);
      icon('phone', W / 2, 540, 1.2, C.em, inP(s, b.tool + 1.6, 0.6) * tv, 6);
      icon('sparkle', W / 2 + 220, 540, 0.9, C.gold, inP(s, b.tool + 2.4, 0.6) * tv);
      rise('One of the biggest advantages a busy mum can have.', W / 2, 780, inP(s, b.advantage, 0.8) * tv, { size: 56, weight: 700, color: C.rose });
    }
    // weekly use + clock
    const wv = win(s, b.week, b.course - 0.5);
    if (wv > 0) {
      rise('I use it every single week', 560, 250, inP(s, b.week, 0.8) * wv, { size: 56, kind: 'serif', weight: 700, color: C.em });
      ['Write emails', 'Plan content', 'Organise my week'].forEach((task, i) => {
        const p = inP(s, b.week + 1.5 + i * 1.6, 0.6) * wv, y = 420 + i * 150;
        g.save(); g.globalAlpha = p; card(200, y - 55, 720, 110, 24, '#fff', { shadow: true }); g.restore();
        g.save(); g.globalAlpha = p; g.beginPath(); g.arc(270, y, 30, 0, Math.PI * 2); g.fillStyle = C.em; g.fill(); g.restore();
        icon('tick', 270, y, 0.55, C.sand, inP(s, b.week + 1.8 + i * 1.6, 0.5), 9);
        txt(task, 330, y + 2, { size: 46, weight: 500, color: C.ink, align: 'left', alpha: p });
      });
      // clock: a whole evening shrinks to twenty minutes
      const cp = inP(s, b.clock, 0.8) * wv, sh = ease((s - b.clock - 1.5) / 3);
      if (cp > 0) {
        const cx = 1400, cy = 520, r = 230;
        g.save(); g.globalAlpha = cp; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.strokeStyle = C.em; g.stroke();
        const span = lerp(Math.PI * 2 * (3 / 12), Math.PI * 2 * (20 / 60 / 12) , sh);       // 3 hours down to 20 minutes on a 12 hour face
        g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r - 24, -Math.PI / 2, -Math.PI / 2 + span); g.closePath(); g.fillStyle = sh > 0.5 ? C.gold : C.roseL; g.fill();
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18), cx + Math.cos(a) * (r - 38), cy + Math.sin(a) * (r - 38), C.em, 5); }
        g.restore();
        txt(sh < 0.5 ? 'A whole evening' : '20 minutes', cx, cy + r + 80, { size: 56, kind: 'serif', weight: 700, color: sh < 0.5 ? C.rose : C.em, alpha: cp });
      }
    }
    // no coding course, start with one tool, prompts
    const pv = win(s, b.course, b.ten - 0.5);
    if (pv > 0) {
      rise('No coding course. Start with one tool.', W / 2, 190, inP(s, b.course, 0.8) * pv, { size: 60, kind: 'serif', weight: 700, color: C.em });
      const bx = 360, by = 300, bw = 1200, bh = 600;
      g.save(); g.globalAlpha = inP(s, b.course + 0.8, 0.7) * pv; card(bx, by, bw, bh, 36, '#fff', { shadow: true });
      card(bx, by, bw, 80, [36, 36, 0, 0], C.em);
      [0, 1, 2].forEach(i => { g.beginPath(); g.arc(bx + 50 + i * 36, by + 40, 10, 0, 7); g.fillStyle = i === 0 ? C.rose : i === 1 ? C.gold : C.sandD; g.fill(); });
      g.restore();
      txt('Your AI assistant', bx + 170, by + 41, { size: 30, weight: 700, color: C.sand, align: 'left', alpha: inP(s, b.course + 0.8, 0.7) * pv });
      const prompts = ['Plan our family meals for this week', 'Rewrite my CV for a part-time role', 'Explain how pensions work in simple words'];
      prompts.forEach((pr, i) => {
        const at = b.prompts + i * 5.2, n = Math.floor(clamp((s - at) * 26, 0, pr.length)), p = inP(s, at - 0.3, 0.4) * pv;
        if (p <= 0) return;
        const y = by + 160 + i * 140;
        g.save(); g.globalAlpha = p; g.font = font(40, 'sans', 500); const tw = g.measureText(pr).width; g.restore();
        g.save(); g.globalAlpha = p; card(bx + bw - 80 - tw - 60, y - 45, tw + 60, 90, 45, C.sandD); g.restore();
        const shown = pr.slice(0, n) + (n < pr.length && Math.floor(s * 2.5) % 2 === 0 ? '|' : '');
        txt(shown, bx + bw - 80 - tw - 30, y + 2, { size: 40, weight: 500, color: C.ink, align: 'left', alpha: p });
      });
    }
    // ten minutes a day
    const tn = inP(s, b.ten, 0.8) * outP(s, 59.4, 0.5);
    if (tn > 0) {
      rise('10 minutes a day.', W / 2, 440, tn, { size: 140, kind: 'serif', weight: 700, color: C.em });
      rise("That's how it starts.", W / 2, 600, inP(s, b.ten + 1.2, 0.8) * outP(s, 59.4, 0.5), { size: 60, kind: 'serifI', weight: 600, color: C.rose });
      for (let i = 0; i < 7; i++) { const p = inP(s, b.ten + 1.6 + i * 0.25, 0.4) * tn; g.save(); g.globalAlpha = p; g.beginPath(); g.arc(W / 2 - 270 + i * 90, 760, 22, 0, 7); g.fillStyle = C.gold; g.fill(); g.restore(); }
    }
  }

  // Scene 5: Build something of your own (emerald)
  function sBiz(s, b) {
    bgEmerald(s);
    sectionTitle(s, '02', 'Build something of your own', true, b.quit - 0.6);
    cornerTitle(s, '02', 'Build a business', true, b.quit - 0.2);
    const qv = win(s, b.quit, b.control - 0.5);
    if (qv > 0) {
      rise("You don't have to quit your job tomorrow.", W / 2, 300, inP(s, b.quit, 0.8) * qv, { size: 70, kind: 'serif', weight: 600, color: C.sand });
      rise('Start small. On the side.', W / 2, 430, inP(s, b.small, 0.8) * qv, { size: 70, kind: 'serifI', weight: 600, color: C.goldL });
      const grow = ease((s - b.small - 0.5) / 5);
      icon('sprout', W / 2, 720 - grow * 40, 0.8 + grow * 1.2, C.gold, inP(s, b.small + 0.3, 0.6) * qv, 6);
      g.save(); g.globalAlpha = qv * inP(s, b.small + 0.3, 0.6); line(W / 2 - 220, 820, W / 2 + 220, 820, C.sand, 4); g.restore();
    }
    const cv2 = win(s, b.control, b.startwith - 0.5);
    if (cv2 > 0) {
      rise('A business gives you', W / 2, 300, inP(s, b.control, 0.8) * cv2, { size: 60, weight: 500, color: C.sand });
      rise('control.', W / 2, 440, inP(s, b.control + 0.8, 0.8) * cv2, { size: 170, kind: 'serifI', weight: 600, color: C.goldL });
      ['Your hours', 'Your income', 'Your energy'].forEach((c, i) => pill(c, W / 2 - 430 + i * 430, 680, inP(s, b.control + 2.6 + i * 1.1, 0.5) * cv2, { size: 44 }));
    }
    const sv = win(s, b.startwith, b.ask - 0.5);
    if (sv > 0) {
      rise('Start with almost nothing.', W / 2, 260, inP(s, b.startwith, 0.8) * sv, { size: 72, kind: 'serif', weight: 700, color: C.sand });
      [['phone', 'A phone'], ['bulb', 'A skill you have'], ['wifi', 'The internet']].forEach(([ic, lab], i) => {
        const x = W / 2 - 480 + i * 480, p = inP(s, b.startwith + 1.6 + i * 1.4, 0.6) * sv;
        g.save(); g.globalAlpha = p; g.beginPath(); g.arc(x, 540, 140, 0, 7); g.fillStyle = 'rgba(246,239,228,0.08)'; g.fill(); g.strokeStyle = C.gold; g.lineWidth = 3; g.stroke(); g.restore();
        icon(ic, x, 540, 1.3, C.goldL, p, 6); rise(lab, x, 760, p, { size: 46, weight: 700, color: C.sand });
      });
    }
    const av = win(s, b.ask, b.days - 0.5);
    if (av > 0) {
      rise('What do people already ask you for help with?', W / 2, 190, inP(s, b.ask, 0.8) * av, { size: 62, kind: 'serif', weight: 600, color: C.sand });
      const bubbles = [['Your cooking', 470, 470], ['Your sewing', 1050, 400], ['Getting organised', 1460, 560], ['Health know-how', 700, 720], ['Toddler sleep', 1250, 800]];
      bubbles.forEach(([lab, x, y], i) => {
        const p = inP(s, b.ask + 1.8 + i * 1.2, 0.6) * av, bob = Math.sin(s * 1.2 + i * 1.3) * 10;
        pill(lab, x, y + bob, p, { size: 44, fill: i % 2 ? C.rose : C.gold, color: i % 2 ? C.sand : C.emD });
      });
    }
    const dv = win(s, b.days, b.choices - 0.5);
    if (dv > 0) {
      rise('Somebody out there will pay for that.', W / 2, 360, inP(s, b.days, 0.8) * dv, { size: 72, kind: 'serif', weight: 700, color: C.sand });
      rise('AI helps you package it in days, not months.', W / 2, 500, inP(s, b.days + 1.6, 0.8) * dv, { size: 58, weight: 700, color: C.goldL });
    }
    const ch = inP(s, b.choices, 0.8) * outP(s, 59.4, 0.5);
    if (ch > 0) {
      rise('Earning your own money', W / 2, 340, ch, { size: 70, kind: 'serif', weight: 600, color: C.sand });
      rise("doesn't make you any less of a mother or a wife.", W / 2, 450, inP(s, b.choices + 1, 0.8) * outP(s, 59.4, 0.5), { size: 54, weight: 500, color: C.sand });
      rise('It gives you choices.', W / 2, 620, inP(s, b.choices + 3, 0.8) * outP(s, 59.4, 0.5), { size: 100, kind: 'serifI', weight: 600, color: C.goldL });
    }
  }

  // Scene 6: Raise them your way (sand)
  function sKids(s, b) {
    bgSand(s);
    sectionTitle(s, '03', 'Raise them your way', false, b.doors - 0.6);
    cornerTitle(s, '03', 'Raise them your way', false, b.doors - 0.2);
    const dv = win(s, b.doors, b.list - 0.5);
    if (dv > 0) {
      rise('So many of us feel stuck choosing between', W / 2, 190, inP(s, b.doors, 0.8) * dv, { size: 52, kind: 'serif', weight: 600, color: C.em });
      const open = ease((s - b.third - 0.6) / 1.4);
      const door = (x, lab, ic, col, p, glow) => {
        if (p <= 0) return;
        g.save(); g.globalAlpha = p * dv;
        if (glow > 0) { g.shadowColor = 'rgba(201,162,74,0.8)'; g.shadowBlur = 80 * glow; }
        card(x - 150, 330, 300, 480, [150, 150, 10, 10], col); g.shadowBlur = 0;
        g.restore();
        icon(ic, x, 540, 1, glow > 0 ? C.emD : C.sand, p * dv, 6);
        txt(lab, x, 880, { size: 44, weight: 700, color: C.em, alpha: p * dv });
      };
      const spread = ease((s - b.third) / 0.8) * 220;
      door(W / 2 - 300 - spread, 'A career away', 'briefcase', C.em, inP(s, b.doors + 1, 0.6), 0);
      door(W / 2 + 300 + spread, 'Home, no income', 'house', C.rose, inP(s, b.doors + 2.4, 0.6), 0);
      if (s > b.third) {
        door(W / 2, 'Your own business', 'shop', C.gold, inP(s, b.third, 0.7), open);
        rise('A third option.', W / 2, 270, inP(s, b.third + 1.2, 0.7) * dv, { size: 54, kind: 'serifI', weight: 600, color: C.rose });
      }
    }
    const lv = win(s, b.list, b.stays - 0.5);
    if (lv > 0) {
      ['Be there for the school run', 'Pass on your values at your own kitchen table', 'Let them watch their mum build something real'].forEach((it, i) => {
        const p = inP(s, b.list + i * 4, 0.7) * lv, y = 330 + i * 190;
        g.save(); g.globalAlpha = p; card(260, y - 70, 1400, 140, 30, '#fff', { shadow: true }); g.restore();
        icon(['heart', 'house', 'sparkle'][i], 360, y, 0.6, i === 2 ? C.gold : C.rose, p, 6);
        txt(it, 440, y + 2, { size: 50, weight: 500, color: C.ink, align: 'left', alpha: p });
      });
    }
    const st = inP(s, b.stays, 0.8) * outP(s, 39.4, 0.5);
    if (st > 0) {
      rise('That example stays with them', W / 2, 440, st, { size: 88, kind: 'serif', weight: 700, color: C.em });
      rise('far longer than anything we tell them.', W / 2, 560, inP(s, b.stays + 1.2, 0.8) * outP(s, 39.4, 0.5), { size: 60, kind: 'serifI', weight: 600, color: C.rose });
    }
  }

  // Scene 7: Your first step (emerald)
  function sCTA(s, b) {
    bgEmerald(s);
    const wv = outP(s, b.guide - 0.6);
    rise('So where do you start?', W / 2, 420, inP(s, b.where, 0.8) * wv, { size: 90, kind: 'serif', weight: 700, color: C.sand });
    rise('Bismillah.', W / 2, 570, inP(s, b.bismillah, 0.9) * wv, { size: 110, kind: 'serifI', weight: 600, color: C.goldL });
    // the guide
    const gv = win(s, b.guide, b.comments - 0.5);
    if (gv > 0) {
      const p = inP(s, b.guide, 0.9) * gv, bx = 300, by = 170, bw = 560, bh = 760, tilt = (1 - eOut((s - b.guide) / 0.9)) * -0.12 - 0.03;
      g.save(); g.translate(bx + bw / 2, by + bh / 2); g.rotate(tilt); g.globalAlpha = p;
      card(-bw / 2, -bh / 2, bw, bh, 20, C.sand, { shadow: true });
      card(-bw / 2 + 24, -bh / 2 + 24, bw - 48, bh - 48, 12, C.sand, { stroke: C.gold, lw: 3 });
      txt('MUSLIMAH IN BUSINESS', 0, -bh / 2 + 90, { size: 22, weight: 700, color: C.gold, track: 6 });
      const tl = wrap('From Idea to First Sale', 440, 64, 'serif', 700);
      tl.forEach((l, i) => txt(l, 0, -200 + i * 76, { size: 64, kind: 'serif', weight: 700, color: C.em }));
      const sl = wrap('The 30-Day Side Business Plan for Muslim Mums', 420, 34, 'sans', 500);
      sl.forEach((l, i) => txt(l, 0, -30 + i * 46, { size: 34, weight: 500, color: C.ink }));
      icon('book', 0, 190, 1.1, C.em, 1, 5);
      g.restore();
      pill('FREE', bx + bw - 20, by + 40, inP(s, b.guide + 1.2, 0.6) * gv, { size: 48, fill: C.rose, color: C.sand });
      // right side: the 30 days
      rise('Day by day:', 1340, 230, inP(s, b.guide + 1.8, 0.7) * gv, { size: 52, kind: 'serif', weight: 700, color: C.sand });
      ['what to sell', 'set it up with AI', 'make your first sale'].forEach((st, i) => rise((i + 1) + '.  ' + st, 1010, 320 + i * 70, inP(s, b.guide + 2.6 + i * 1.1, 0.6) * gv, { size: 42, weight: 500, color: C.goldL, align: 'left' }));
      const cp = inP(s, b.calendar, 0.7) * gv, filled = Math.floor(clamp((s - b.calendar - 0.6) / 5) * 30);
      for (let d = 0; d < 30; d++) {
        const c = d % 6, r = Math.floor(d / 6), x = 1040 + c * 100, y = 600 + r * 72;
        g.save(); g.globalAlpha = cp; rr(x - 38, y - 28, 76, 56, 12); g.fillStyle = d < filled ? C.gold : 'rgba(246,239,228,0.1)'; g.fill(); g.restore();
        txt(String(d + 1), x, y + 2, { size: 24, weight: 700, color: d < filled ? C.emD : C.sand, alpha: cp });
      }
      rise('Link in the description', W / 2, 1010, inP(s, b.guide + 2, 0.7) * gv, { size: 40, weight: 700, color: C.sand });
    }
    // comments + subscribe
    const cv3 = win(s, b.comments, b.change - 0.5);
    if (cv3 > 0) {
      icon('chat', W / 2, 300, 1.6, C.goldL, inP(s, b.comments, 0.6) * cv3, 5);
      rise('Tell me in the comments what business you are starting.', W / 2, 470, inP(s, b.comments + 0.4, 0.8) * cv3, { size: 54, kind: 'serif', weight: 600, color: C.sand });
      rise('I read every comment.', W / 2, 560, inP(s, b.comments + 1.8, 0.8) * cv3, { size: 44, weight: 500, color: C.goldL });
      const sp = inP(s, b.subscribe, 0.7) * cv3, pulse = 1 + Math.max(0, Math.sin((s - b.subscribe) * 4)) * 0.04;
      if (sp > 0) {
        g.save(); g.translate(W / 2, 760); g.scale(pulse * lerp(0.7, 1, back(sp)), pulse * lerp(0.7, 1, back(sp))); g.globalAlpha = sp;
        card(-260, -60, 520, 120, 60, C.rose); icon('play', -170, 0, 0.9, C.sand, 1); txt('SUBSCRIBE', 30, 2, { size: 48, weight: 700, color: C.sand, track: 4 });
        g.restore();
        rise('to Muslimah in Business', W / 2, 890, sp, { size: 40, weight: 500, color: C.sand });
      }
    }
    // closing words and end screen space
    const ev = inP(s, b.change, 0.8);
    if (ev > 0) {
      const up = ease((s - b.end) / 1);
      rise('The world is changing, ukhti.', W / 2, lerp(430, 150, up), ev, { size: lerp(84, 54, up), kind: 'serif', weight: 700, color: C.sand });
      rise("Let's change with it, insha'Allah.", W / 2, lerp(560, 230, up), inP(s, b.change + 1.4, 0.8), { size: lerp(70, 46, up), kind: 'serifI', weight: 600, color: C.goldL });
      if (up > 0) {
        // empty frames where YouTube's end screen elements sit (a video, a playlist and the subscribe circle)
        g.save(); g.globalAlpha = up * 0.9;
        [[300, 400], [1020, 400]].forEach(([x, y]) => { rr(x, y, 600, 338, 18); g.strokeStyle = 'rgba(228,201,129,0.55)'; g.lineWidth = 3; g.setLineDash([14, 12]); g.stroke(); });
        g.setLineDash([]); g.restore();
        txt('Watch next', 600, 569, { size: 36, weight: 500, color: 'rgba(246,239,228,0.6)', alpha: up });
        txt('Free guide', 1320, 569, { size: 36, weight: 500, color: 'rgba(246,239,228,0.6)', alpha: up });
        txt('Assalamu alaikum', W / 2, 880, { size: 44, kind: 'serifI', weight: 600, color: C.sand, alpha: up });
      }
    }
  }

  const DRAW = { hook: sHook, me: sMe, old: sOld, ai: sAI, biz: sBiz, kids: sKids, cta: sCTA };
  function drawScene(i, t) { const sc = SCENES[i]; g.save(); DRAW[sc.key](t - sc.t0, TM.beats[sc.key]); g.restore(); }

  window.renderOut = function (t) {
    t = clamp(+t || 0, 0, DUR - 1e-6);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    let i = SCENES.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = SCENES.length - 1;
    const into = t - SCENES[i].t0, TR = 0.8;
    if (i > 0 && into < TR) {
      // circle reveal from the centre over the end of the previous scene
      drawScene(i - 1, SCENES[i - 1].t1 - 1e-3);
      const r = ease(into / TR) * Math.hypot(W, H) / 2;
      g.save(); g.beginPath(); g.arc(W / 2, H / 2, Math.max(1, r), 0, Math.PI * 2); g.clip(); drawScene(i, t); g.restore();
      g.save(); g.globalAlpha = 1 - into / TR; g.beginPath(); g.arc(W / 2, H / 2, Math.max(1, r), 0, Math.PI * 2); g.strokeStyle = C.gold; g.lineWidth = 10; g.stroke(); g.restore();
    } else drawScene(i, t);
    // fade in from black at the very start
    if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(0, 0, W, H); }
  };

  (async () => {
    await Promise.all(['600 40px Fraunces', '700 40px Fraunces', 'italic 600 40px Fraunces', '400 40px "DM Sans"', '500 40px "DM Sans"', '700 40px "DM Sans"'].map(f => document.fonts.load(f)));
    await document.fonts.ready;
    window.renderOut(0);
    window.READY = true;
  })();
})();
