import { METERS, CARDS } from './data.mjs';
import { score, analyze } from './engine.mjs';
import { makeEncounter, quality } from './encounter.mjs';
import { bandsFrom, AXES, LABELS } from './read.mjs';

const FULL = { R: 'Relief', C: 'Conviction', L: 'Clarity', G: 'Guilt' };
const AX = ['subject', 'turn', 'wound'];
const DMIN = 0, DMAX = 12;
const pct = (v) => `${Math.max(0, Math.min(100, ((v - DMIN) / (DMAX - DMIN)) * 100))}%`;

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

let S;
const freshRead = () => ({ subject: null, turn: null, wound: null });
function load(enc, mode) {
  S = { ...enc, slots: [null, null, null], selected: null, read: freshRead(), committed: false, mode };
  document.getElementById('scrim').hidden = true;
  renderAll();
}
function clearBoard() {
  S.slots = [null, null, null]; S.selected = null; S.read = freshRead(); S.committed = false;
  document.getElementById('scrim').hidden = true;
  renderAll();
}
function init() {
  const rec = dailyRecord();
  if (rec) return showDone(rec);
  load(dailyEncounter(), 'daily');
}

const placedIds = () => S.slots.filter(Boolean).map((s) => s.cardId);
const reversalUsed = () => S.slots.some((s) => s && s.reversed);
const activeTags = (slot) => (slot.reversed ? CARDS[slot.cardId].rev : CARDS[slot.cardId].up);
const readStarted = () => AX.some((a) => S.read[a]);
const readComplete = () => AX.every((a) => S.read[a]);
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
  document.getElementById('read-banks').innerHTML = AX.map((axis) =>
    `<div class="bank">` + AXES[axis].map((v) =>
      `<button class="read-chip ${S.read[axis] === v ? 'chosen' : ''}" data-axis="${axis}" data-val="${v}" ${S.committed ? 'disabled' : ''}>${LABELS[axis][v]}</button>`
    ).join('') + `</div>`).join('');
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
    const tags = activeTags(slot).map((t) =>
      `<span class="chip ${t === slot.tag ? 'active' : ''}" data-slot="${i}" data-tag="${t}">${t}</span>`).join('');
    const revDisabled = reversalUsed() && !slot.reversed;
    return `
      <div class="slot filled" data-slot="${i}">
        <span class="tab pos-label">${pos.name}</span>
        <span class="pos-amp">×2 ${FULL[pos.amplify]}</span>
        <div class="card ${slot.reversed ? 'reversed' : ''}" data-incard="${i}">
          <div class="card-name">${c.name}</div>
          <div class="tags">${tags}</div>
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
    const tags = c.up.map((t) => `<span class="chip">${t}</span>`).join('');
    return `
      <div class="card ${out} ${sel}" data-card="${id}">
        <div class="card-name">${c.name}</div>
        <div class="tags">${tags}</div>
      </div>`;
  }).join('');
}

document.getElementById('read-banks').addEventListener('click', (e) => {
  if (S.committed) return;
  const chip = e.target.closest('[data-axis]');
  if (!chip) return;
  const { axis, val } = chip.dataset;
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
  const par = S.analysis.par;
  const ratio = Math.round((r.total / par) * 100);
  const hits = AX.filter((a) => S.read[a] === need[a]).length;

  const headline = hits === 3 ? 'You read them clean.'
    : hits === 2 ? 'Almost. One thread slipped past you.'
    : hits === 1 ? 'You caught a piece of them, and missed the rest.'
    : 'You misread them entirely.';

  const g = (axis) => {
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

  const inBand = (m, i) => { const [lo, hi] = S.puzzle.bands[m]; return r.finals[i] >= lo && r.finals[i] <= hi; };
  const pips = METERS.map((m, i) => (inBand(m, i) ? '■' : '□'));
  const readGlyphs = AX.map((a) => (S.read[a] === need[a] ? '●' : '○')).join('');
  const dateStr = new Date().toISOString().slice(0, 10);
  const share = `Tarotle ${dateStr}\nread ${readGlyphs}  ·  ${ratio}% of par  ${pips.join('')}${reversalUsed() ? ' 🔄' : ''}`;

  const pipRows = METERS.map((m, i) => {
    const [lo, hi] = S.puzzle.bands[m]; const ok = inBand(m, i);
    return `<div class="pip-row"><span class="${ok ? 'good' : ''}">${FULL[m]}</span>
      <span class="${ok ? 'good' : ''}">${r.finals[i]} · ${ok ? 'in band' : `needed ${lo}-${hi}`}</span></div>`;
  }).join('');

  const parLines = S.analysis.parSolution.placements.map((p) => {
    const pos = S.puzzle.positions[p.position];
    return `<div><b>${pos.name}</b> · ${CARDS[p.card].name}${p.reversed ? ' (reversed)' : ''} · push "${p.tag}"</div>`;
  }).join('');

  if (S.mode === 'daily') { try { localStorage.setItem(dailyKey(), JSON.stringify({ share })); } catch {} }
  const controls = S.mode === 'daily'
    ? '<button class="verb" id="copy">Copy result</button><button class="verb ghost" id="again">Practice a random one</button>'
    : '<button class="verb" id="copy">Copy result</button><button class="verb ghost" id="retry">Retry this one</button><button class="verb ghost" id="again">New querent</button>';
  const tomorrow = S.mode === 'daily' ? '<p class="tomorrow">A new querent arrives tomorrow.</p>' : '';

  document.getElementById('reveal').innerHTML = `
    <h2>${headline}</h2>
    <p class="verdict">The read: <b>${hits} of 3</b>. The reading: <b>${ratio}% of par</b>.</p>
    <div class="graded">${graded}</div>
    <div class="tells"><div class="tells-h">the tells that gave them away</div>${tells}</div>
    <div class="scoreline"><span class="big">${ratio}%</span><span class="par">of par on the cards</span></div>
    <div class="meter-pips">${pipRows}</div>
    <div class="share" id="share">${share}</div>
    <div class="par-line"><div style="margin-bottom:6px;color:var(--ink)">Par played the cards like this:</div>${parLines}</div>
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
