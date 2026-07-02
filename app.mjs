import { METERS, CARDS, TAGS, CARD_TEXT } from './data.mjs';
import { score, analyze, readingCurve } from './engine.mjs';
import { makeEncounter, quality } from './encounter.mjs';
import { bandsFrom, AXES, LABELS } from './read.mjs';

const FULL = { R: 'Relief', C: 'Conviction', L: 'Clarity', G: 'Guilt' };
const AX = ['subject', 'turn', 'wound'];
const BANK_LABEL = { subject: 'they came about', turn: 'what they need', wound: 'what they fear' };
const SITE = 'https://bearsharktopus-dev.github.io/tarotle/';
const DMIN = 0, DMAX = 12;
const pct = (v) => `${Math.max(0, Math.min(100, ((v - DMIN) / (DMAX - DMIN)) * 100))}%`;

const MAG = (a) => (a >= 5 ? 'overwhelmingly' : a >= 3 ? 'strongly' : a >= 2 ? 'moderately' : 'a little');
function pushEffect(tag, ampMeter) {
  const vec = TAGS[tag];
  return METERS
    .map((m, i) => ({ m, c: vec[i] * (m === ampMeter ? 2 : 1) }))
    .filter((x) => x.c !== 0)
    .sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
}
const effectText = (tag, ampMeter) => pushEffect(tag, ampMeter)
  .map(({ m, c }) => `${FULL[m]} ${c > 0 ? 'rises' : 'falls'} ${MAG(Math.abs(c))}`).join('  ·  ');
const effectHTML = (tag, ampMeter) => pushEffect(tag, ampMeter)
  .map(({ m, c }) => `<b>${FULL[m]}</b> ${c > 0 ? 'rises' : 'falls'} ${MAG(Math.abs(c))}`).join(' · ');

function scanForQuality(seedOf, span = 3000) {
  for (let k = 0; k < span; k++) {
    const e = makeEncounter(seedOf(k));
    const a = analyze(e);
    if (quality(a) > 0) return { puzzle: e, analysis: a };
  }
  const e = makeEncounter(seedOf(0));
  return { puzzle: e, analysis: analyze(e) };
}

const dayNumber = () => { const t = new Date(); return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000); };
const dailyEncounter = () => scanForQuality((k) => dayNumber() * 4096 + k);
const practiceEncounter = () => { const start = Math.floor(Math.random() * 9e8) + 1; return scanForQuality((k) => start + k); };

const dailyKey = () => 'tarotle:' + dayNumber();
const dailyRecord = () => { try { return JSON.parse(localStorage.getItem(dailyKey()) || 'null'); } catch { return null; } };

const TUT_KEY = 'tarotle:tutorial-seen';
const showTutorial = () => { document.getElementById('tut-scrim').hidden = false; };
const hideTutorial = () => { document.getElementById('tut-scrim').hidden = true; try { localStorage.setItem(TUT_KEY, '1'); } catch {} };

let S;
const freshRead = () => ({ subject: null, turn: null, wound: null });
const freshHinted = () => ({ subject: false, turn: false, wound: false });
function load(enc, mode) {
  S = { ...enc, slots: [null, null, null], selected: null, read: freshRead(), hinted: freshHinted(), committed: false, mode };
  document.getElementById('scrim').hidden = true;
  renderAll();
}
function clearBoard() {
  S.slots = [null, null, null]; S.selected = null; S.read = freshRead(); S.hinted = freshHinted(); S.committed = false;
  document.getElementById('scrim').hidden = true;
  renderAll();
}
function init() {
  const rec = dailyRecord();
  if (rec) showDone(rec);
  else load(dailyEncounter(), 'daily');
  try { if (!localStorage.getItem(TUT_KEY)) showTutorial(); } catch {}
}
document.getElementById('how').addEventListener('click', showTutorial);
document.getElementById('tut-close').addEventListener('click', hideTutorial);

const placedIds = () => S.slots.filter(Boolean).map((s) => s.cardId);
const reversalUsed = () => S.slots.some((s) => s && s.reversed);
const activeTags = (slot) => (slot.reversed ? CARDS[slot.cardId].rev : CARDS[slot.cardId].up);
const readStarted = () => AX.some((a) => S.read[a]);
const readComplete = () => AX.every((a) => S.read[a]);
const hintsUsed = () => AX.filter((a) => S.hinted[a]).length;
const believedBands = () => bandsFrom(S.read.turn, S.read.wound);
const placements = () => S.slots.map((s, i) => s && { card: s.cardId, position: i, tag: s.tag, reversed: s.reversed }).filter(Boolean);
const resultVs = (bands) => score({ ...S.puzzle, bands }, placements());

function renderAll() {
  document.getElementById('dateline').textContent =
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  renderStatements();
  renderRead();
  renderMeters();
  renderSpread();
  renderHand();
  document.getElementById('deliver').disabled = !readComplete() || placedIds().length < 3 || S.committed;
}

function renderStatements() {
  const sts = S.puzzle.querent.testimony;
  document.getElementById('statements').innerHTML =
    '<p class="testimony-lead">A stranger sits, shuffles your deck, and after a while says:</p>'
    + sts.map((s) => `<p class="statement">"${s.text}"</p>`).join('');
}

function renderRead() {
  const slot = (axis) => {
    const v = S.read[axis];
    return `<span class="read-slot ${v ? 'filled' : ''}">${v ? LABELS[axis][v] : '_____'}</span>`;
  };
  document.getElementById('read-sentence').innerHTML =
    `You came about ${slot('subject')}. What you truly need is ${slot('turn')} - because underneath, you fear ${slot('wound')}.`;
  document.getElementById('read-banks').innerHTML = AX.map((axis) => {
    const hinted = S.hinted[axis];
    const chips = AXES[axis].map((v) =>
      `<button class="read-chip ${S.read[axis] === v ? 'chosen' : ''}" data-axis="${axis}" data-val="${v}" ${S.committed || hinted ? 'disabled' : ''}>${LABELS[axis][v]}</button>`
    ).join('');
    const aside = S.committed ? ''
      : hinted ? '<span class="hint-used">revealed &#10022;</span>'
      : `<button class="hint-btn" data-hint="${axis}">reveal (hint)</button>`;
    return `<div class="bank-row"><div class="bank-head"><span class="bank-name">${BANK_LABEL[axis]}</span>${aside}</div><div class="bank">${chips}</div></div>`;
  }).join('');
}

function renderMeters() {
  const host = document.getElementById('meters');
  const lead = document.getElementById('meters-lead');
  if (!readStarted()) {
    lead.textContent = '';
    host.innerHTML = '<div class="meters-locked panel">Read them, then start filling your read above. The meters will slide to <em>the need you name</em> - you\'re betting the cards on it.</div>';
    return;
  }
  lead.innerHTML = readComplete()
    ? 'If your read is right, this is where the cards must land:'
    : 'The need your read implies - it sharpens as you fill Turn and Wound:';
  const bands = believedBands();
  const r = resultVs(bands);
  host.innerHTML = METERS.map((m, i) => {
    const [lo, hi] = bands[m];
    const val = r.finals[i];
    const inBand = val >= lo && val <= hi;
    return `
      <div class="meter panel ${inBand ? 'in' : 'out'}">
        <span class="tab name">${FULL[m]}</span>
        <div class="reading">
          <span class="need">they need ${lo}-${hi}</span>
          <span class="now">now <b class="val">${val}</b></span>
        </div>
        <div class="track">
          <div class="band" style="left:${pct(lo)};width:calc(${pct(hi)} - ${pct(lo)})"></div>
          <div class="needle" style="left:${pct(val)}"></div>
        </div>
      </div>`;
  }).join('');
}

function renderSpread() {
  const sel = S.selected;
  document.getElementById('spread').className = 'spread' + (readComplete() ? '' : ' locked');
  document.getElementById('spread').innerHTML = S.puzzle.positions.map((pos, i) => {
    const slot = S.slots[i];
    const droppable = sel && !slot ? 'droppable' : '';
    if (!slot) {
      return `
        <div class="slot ${droppable}" data-slot="${i}">
          <span class="tab pos-label">${pos.name}</span>
          <span class="pos-amp">×2 ${FULL[pos.amplify]}</span>
          <span class="empty-hint">${sel ? 'place here' : 'empty'}</span>
        </div>`;
    }
    const c = CARDS[slot.cardId];
    const amp = pos.amplify;
    const tags = activeTags(slot).map((t) =>
      `<span class="chip ${t === slot.tag ? 'active' : ''}" data-slot="${i}" data-tag="${t}" title="${effectText(t, amp)}">${t}</span>`).join('');
    const revDisabled = reversalUsed() && !slot.reversed;
    return `
      <div class="slot filled" data-slot="${i}">
        <span class="tab pos-label">${pos.name}</span>
        <span class="pos-amp">×2 ${FULL[pos.amplify]}</span>
        <div class="card ${slot.reversed ? 'reversed' : ''}" data-incard="${i}">
          <div class="card-name">${c.name}</div>
          <div class="card-read">${slot.reversed ? CARD_TEXT[slot.cardId].rev : CARD_TEXT[slot.cardId].up}</div>
          <div class="tags-lead">choose a meaning to push</div>
          <div class="tags">${tags}</div>
          <div class="fx">${effectHTML(slot.tag, amp)}</div>
          <button class="reverse" data-reverse="${i}" ${revDisabled ? 'disabled' : ''}>
            ${slot.reversed ? 'reversed' : 'reverse'}
          </button>
        </div>
      </div>`;
  }).join('');
}

function renderHand() {
  const placed = placedIds();
  document.getElementById('hand').className = 'hand' + (readComplete() ? '' : ' locked');
  document.getElementById('hand').innerHTML = S.puzzle.hand.map((id) => {
    const c = CARDS[id];
    const out = placed.includes(id) ? 'placed-out' : '';
    const sel = S.selected === id ? 'selected' : '';
    const tags = c.up.map((t) => `<span class="chip" title="${effectText(t, null)}">${t}</span>`).join('');
    return `
      <div class="card ${out} ${sel}" data-card="${id}" title="${CARD_TEXT[id].up}">
        <div class="card-name">${c.name}</div>
        <div class="tags">${tags}</div>
      </div>`;
  }).join('');
}

document.getElementById('read-banks').addEventListener('click', (e) => {
  if (S.committed) return;
  const hint = e.target.closest('[data-hint]');
  if (hint) {
    const axis = hint.dataset.hint;
    S.read[axis] = S.puzzle.querent.need[axis];
    S.hinted[axis] = true;
    renderAll();
    return;
  }
  const chip = e.target.closest('[data-axis]');
  if (!chip) return;
  const { axis, val } = chip.dataset;
  if (S.hinted[axis]) return;
  S.read[axis] = S.read[axis] === val ? null : val;
  renderAll();
});

document.getElementById('hand').addEventListener('click', (e) => {
  if (S.committed || !readComplete()) return;
  const card = e.target.closest('.card[data-card]');
  if (!card || card.classList.contains('placed-out')) return;
  const id = card.dataset.card;
  S.selected = S.selected === id ? null : id;
  renderSpread(); renderHand();
});

document.getElementById('spread').addEventListener('click', (e) => {
  if (S.committed || !readComplete()) return;
  const chip = e.target.closest('.chip[data-tag]');
  const rev = e.target.closest('[data-reverse]');
  const slotEl = e.target.closest('.slot');
  if (chip) { S.slots[+chip.dataset.slot].tag = chip.dataset.tag; renderSpread(); renderMeters(); return; }
  if (rev) {
    const i = +rev.dataset.reverse; const slot = S.slots[i];
    if (reversalUsed() && !slot.reversed) return;
    slot.reversed = !slot.reversed;
    slot.tag = activeTags(slot)[0];
    renderSpread(); renderMeters(); return;
  }
  if (slotEl) {
    const i = +slotEl.dataset.slot;
    if (S.slots[i]) S.slots[i] = null;
    else if (S.selected) { S.slots[i] = { cardId: S.selected, tag: CARDS[S.selected].up[0], reversed: false }; S.selected = null; }
    renderAll();
  }
});

document.getElementById('reset').addEventListener('click', () => load(practiceEncounter(), 'practice'));
document.getElementById('deliver').addEventListener('click', () => {
  if (!readComplete() || placedIds().length < 3) return;
  S.committed = true;
  showReveal();
});

function keyClue(axis) {
  const clues = S.puzzle.querent.testimony.filter((t) => t.axis === axis);
  if (!clues.length) return null;
  return [...clues].sort((a, b) => a.on.length - b.on.length)[0].text;
}

function showReveal() {
  const need = S.puzzle.querent.need;
  const r = resultVs(S.puzzle.bands);
  const ratio = Math.round(r.total);
  const grade = ratio >= 90 ? 'A+' : ratio >= 80 ? 'A' : ratio >= 70 ? 'B' : ratio >= 60 ? 'C' : ratio >= 50 ? 'D' : 'F';
  const deduced = AX.filter((a) => !S.hinted[a] && S.read[a] === need[a]).length;
  const hinted = hintsUsed();

  const headline = ratio >= 90 ? 'You read them clean.'
    : ratio >= 75 ? 'A strong reading, a thread or two loose.'
    : ratio >= 60 ? 'You caught the shape of them.'
    : ratio >= 45 ? 'A shaky reading.'
    : 'You misread them.';

  const g = (axis) => {
    if (S.hinted[axis]) return `<span class="g hint">${LABELS[axis][S.read[axis]]} &#10022;</span>`;
    const ok = S.read[axis] === need[axis];
    return ok
      ? `<span class="g ok">${LABELS[axis][S.read[axis]]}</span>`
      : `<span class="g bad">${LABELS[axis][S.read[axis]]}</span> <span class="g truth">${LABELS[axis][need[axis]]}</span>`;
  };
  const graded = `You came about ${g('subject')}. What they needed was ${g('turn')} - because underneath, they feared ${g('wound')}.`;

  const tells = AX.map((axis) => {
    const c = keyClue(axis); if (!c) return '';
    return `<div class="tell"><span>${axis}</span> "${c}"</div>`;
  }).join('');

  const beliefs = [];
  for (const turn of AXES.turn) for (const wound of AXES.wound) {
    const b = bandsFrom(turn, wound);
    if (b && METERS.every((m) => b[m])) beliefs.push(b);
  }
  const pop = readingCurve(S.puzzle, beliefs);
  const BINS = 10, binOf = (s) => Math.max(0, Math.min(BINS - 1, Math.floor(s / 10)));
  const bins = new Array(BINS).fill(0);
  for (const s of pop) bins[binOf(s)]++;
  const maxBin = Math.max(1, ...bins);
  const youBin = binOf(ratio);
  const ahead = pop.length ? Math.round(100 * pop.filter((s) => s < r.total).length / pop.length) : 0;
  const hist = Array.from({ length: BINS }, (_, k) => BINS - 1 - k).map((b) =>
    `<div class="hbar ${b === youBin ? 'you' : ''}"><span class="hbar-lab">${b * 10}</span>`
    + `<span class="hbar-track"><span class="hbar-fill" style="width:${Math.round((bins[b] / maxBin) * 100)}%"></span></span>`
    + `${b === youBin ? '<span class="hbar-mark">you</span>' : ''}</div>`).join('');

  const pipRows = METERS.map((m, i) => {
    const pts = Math.round(r.perMeter[i]); const ok = pts >= 22;
    return `<div class="pip-row"><span class="${ok ? 'good' : ''}">${FULL[m]}</span><span class="${ok ? 'good' : ''}">${pts} / 25</span></div>`;
  }).join('');

  const parLines = S.analysis.parSolution.placements.map((p) => {
    const pos = S.puzzle.positions[p.position];
    return `<div><b>${pos.name}</b> · ${CARDS[p.card].name}${p.reversed ? ' (reversed)' : ''} · push "${p.tag}"</div>`;
  }).join('');

  const readGlyphs = AX.map((a) => (S.hinted[a] ? '✦' : S.read[a] === need[a] ? '●' : '○')).join('');

  const bar = '▁▂▃▄▅▆▇█';
  const spark = bins.map((v, b) => {
    const g = bar[Math.min(7, Math.round((v / maxBin) * 7))];
    return b === youBin ? `[${g}]` : g;
  }).join('');
  const hintTag = hinted ? `  ·  ${hinted} hint${hinted > 1 ? 's' : ''}` : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  const share = `Tarotle ${dateStr}  ${grade}\nread ${readGlyphs}${hintTag}  ·  beat ${ahead}% of reads${reversalUsed() ? '  🔄' : ''}\n${spark}\n${SITE}`;

  if (S.mode === 'daily') { try { localStorage.setItem(dailyKey(), JSON.stringify({ share })); } catch {} }
  const controls = S.mode === 'daily'
    ? '<button class="verb" id="copy">Copy result</button><button class="verb ghost" id="again">Practice a random one</button>'
    : '<button class="verb" id="copy">Copy result</button><button class="verb ghost" id="retry">Retry this one</button><button class="verb ghost" id="again">New querent</button>';
  const tomorrow = S.mode === 'daily' ? '<p class="tomorrow">A new querent arrives tomorrow.</p>' : '';

  document.getElementById('reveal').innerHTML = `
    <h2>${headline}</h2>
    <div class="grade-line"><span class="grade">${grade}</span><span class="grade-sub">${ratio} / 100 on the reading<br>you deduced ${deduced} of 3${hinted ? ` · ${hinted} hint${hinted > 1 ? 's' : ''}` : ''}</span></div>
    <div class="graded">${graded}</div>
    <div class="tells"><div class="tells-h">the tells that gave them away</div>${tells}</div>
    <div class="curve">
      <div class="curve-h">where you fell, of every reading you could have given</div>
      ${hist}
      <div class="curve-foot">ahead of <b>${ahead}%</b> of them</div>
    </div>
    <div class="meter-pips">${pipRows}</div>
    <div class="share" id="share">${share}</div>
    <div class="par-line"><div style="margin-bottom:6px;color:var(--ink)">A perfect reading played the cards like this:</div>${parLines}</div>
    ${tomorrow}
    <div class="controls">${controls}</div>`;
  document.getElementById('scrim').hidden = false;
  document.getElementById('copy').onclick = (ev) => { navigator.clipboard?.writeText(share); ev.target.textContent = 'Copied'; };
  const retryBtn = document.getElementById('retry'); if (retryBtn) retryBtn.onclick = () => clearBoard();
  document.getElementById('again').onclick = () => load(practiceEncounter(), 'practice');
}

function showDone(rec) {
  document.getElementById('dateline').textContent =
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('reveal').innerHTML = `
    <h2>Today's reading is done.</h2>
    <p class="verdict">You've read today's querent. A new one arrives tomorrow.</p>
    <div class="share" id="share">${rec.share}</div>
    <div class="controls">
      <button class="verb" id="copy">Copy result</button>
      <button class="verb ghost" id="again">Practice a random one</button>
    </div>`;
  document.getElementById('scrim').hidden = false;
  document.getElementById('copy').onclick = (ev) => { navigator.clipboard?.writeText(rec.share); ev.target.textContent = 'Copied'; };
  document.getElementById('again').onclick = () => load(practiceEncounter(), 'practice');
}

init();
