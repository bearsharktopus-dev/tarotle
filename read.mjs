import { METERS, clamp, BASELINE, BAND_HALFWIDTH, rng } from './core.mjs';

export const AXES = {
  subject: ['partner', 'ex', 'departed', 'self', 'work', 'road'],
  turn:    ['act', 'hold', 'release'],
  wound:   ['villain', 'alone', 'wasted', 'nothing'],
};

export const VALID_TURNS = {
  partner:  ['act', 'hold'],
  ex:       ['act', 'release'],
  departed: ['hold', 'release'],
  self:     ['act', 'hold', 'release'],
  work:     ['act', 'hold', 'release'],
  road:     ['act', 'release'],
};
export const isValid = (need) => VALID_TURNS[need.subject].includes(need.turn);

const TURN_CONTRIB = {
  act:     { C: +3 },
  hold:    { C: -2, R: +1, L: +2 },
  release: { R: +3, C: -3 },
};
const WOUND_CONTRIB = {
  villain: { G: -3 },
  alone:   { R: +2 },
  wasted:  { L: +2, C: +1 },
  nothing: { L: +3, G: -2 },
};

export function bandsFrom(turn, wound) {
  const center = { R: BASELINE, C: BASELINE, L: BASELINE, G: BASELINE };
  if (turn) for (const [m, d] of Object.entries(TURN_CONTRIB[turn])) center[m] += d;
  if (wound) for (const [m, d] of Object.entries(WOUND_CONTRIB[wound])) center[m] += d;
  const bands = {};
  for (const m of METERS) { const c = clamp(center[m]); bands[m] = [clamp(c - BAND_HALFWIDTH), clamp(c + BAND_HALFWIDTH)]; }
  return bands;
}
export const bandsOf = (need) => bandsFrom(need.turn, need.wound);

export const LABELS = {
  subject: { partner: 'your partner', ex: 'an ex', departed: 'the one you lost', self: 'yourself', work: 'your work', road: 'a road not taken' },
  turn:    { act: 'to act on it', hold: 'to hold on', release: 'to let it go' },
  wound:   { villain: 'being the villain', alone: 'ending up alone', wasted: 'wasted years', nothing: 'being nothing' },
};

export const CLUES = [

  { id: 'tA1', axis: 'turn', on: ['act'],           lines: ["Part of me just wants to walk away.", "I want out. I just need to hear I can."] },
  { id: 'tH1', axis: 'turn', on: ['hold'],          lines: ["I want to stay - I just need it to feel right.", "I'm not going anywhere. I want to be at peace with that."] },
  { id: 'tR1', axis: 'turn', on: ['release'],       lines: ["I need to let this go, and I can't.", "I just want the ache to soften."] },
  { id: 'tAH', axis: 'turn', on: ['act', 'hold'],   lines: ["Stay or go, I flip on it by the hour.", "Every day I decide, and every night I un-decide."] },
  { id: 'tHR', axis: 'turn', on: ['hold', 'release'], lines: ["I don't know whether to hold on or let go.", "Do I keep trying, or do I make my peace?"] },

  { id: 'wV1', axis: 'wound', on: ['villain'],       lines: ["I don't want to be the bad guy here.", "Am I a terrible person for feeling this?"] },
  { id: 'wL1', axis: 'wound', on: ['alone'],         lines: ["What if I end up with no one?", "I'm so scared of being left behind."] },
  { id: 'wW1', axis: 'wound', on: ['wasted'],        lines: ["What if it was all for nothing?", "All those years - I need them to have meant something."] },
  { id: 'wN1', axis: 'wound', on: ['nothing'],       lines: ["I'm not sure I matter at all.", "If I vanished, would anyone really notice?"] },
  { id: 'wVN', axis: 'wound', on: ['villain', 'nothing'], lines: ["Maybe I'm just a bad person.", "Maybe I don't deserve any of it."] },
  { id: 'wWN', axis: 'wound', on: ['wasted', 'nothing'],  lines: ["I've got nothing to show for any of it.", "What was the point of me, in the end?"] },

  { id: 'sP',  axis: 'subject', on: ['partner'],      lines: ["It's him. It's the marriage.", "This is about the person I go home to."] },
  { id: 'sW',  axis: 'subject', on: ['work', 'self'], lines: ["Honestly? I hate my job.", "Work's been swallowing me whole."] },
  { id: 'sS',  axis: 'subject', on: ['self'],         lines: ["The problem is me. It's always me.", "I'm the common thread in all of it."] },
  { id: 'sRd', axis: 'subject', on: ['road'],         lines: ["There's a life I didn't pick, and I can't stop seeing it.", "I keep grieving a version of me that never happened."] },
  { id: 'sD',  axis: 'subject', on: ['departed'],     lines: ["Since the funeral, nothing's landed right.", "They're gone, and I'm still setting a place for them."] },
  { id: 'sHer',axis: 'subject', on: ['partner', 'ex', 'departed'], lines: ["I can't stop thinking about her.", "It always comes back to her."] },
  { id: 'sEx', axis: 'subject', on: ['partner', 'ex'], lines: ["We were good once. I think.", "I keep measuring everyone against what we had."] },
  { id: 'sWk', axis: 'subject', on: ['work'], lines: ["It's the place, not me - a different desk and I'd be fine.", "If I had a different boss, none of this would follow me home."] },
  { id: 'sXx', axis: 'subject', on: ['ex'], lines: ["It's my ex. I ended it, and it won't end in my head.", "We're done, so why am I still standing in the wreckage?"] },

  { id: 'd1', axis: 'disposition', on: [], lines: ["You've got kind eyes. This is easier than I thought.", "You look just like my aunt, it's uncanny."] },
  { id: 'd2', axis: 'disposition', on: [], lines: ["Sorry, I ramble when I'm nervous.", "My sister swears you're the real thing."] },
];

const AXIS_LIST = ['subject', 'turn', 'wound'];
export const cluesFor = (axis) => CLUES.filter((c) => c.axis === axis);

export function survivorsPerAxis(shown) {
  const surv = {};
  for (const axis of AXIS_LIST) {
    let s = [...AXES[axis]];
    for (const c of shown) if (c.axis === axis) s = s.filter((v) => c.on.includes(v));
    surv[axis] = s;
  }
  return surv;
}
export const isPinned = (shown) => AXIS_LIST.every((a) => survivorsPerAxis(shown)[a].length === 1);

export function allNeeds() {
  const out = [];
  for (const subject of AXES.subject)
    for (const turn of AXES.turn)
      for (const wound of AXES.wound) out.push({ subject, turn, wound });
  return out;
}
const consistentClues = (need) => CLUES.filter((c) => c.axis !== 'disposition' && c.on.includes(need[c.axis]));
export const needPinnable = (need) => isPinned(consistentClues(need));
export const PINNABLE_NEEDS = allNeeds().filter(needPinnable);

export const VALID_NEEDS = allNeeds().filter((n) => isValid(n) && needPinnable(n));

const BREADTH = (c) => (c.axis === 'disposition' ? 0 : c.on.length);
const ORDER = {
  open:    (a, b) => BREADTH(a) - BREADTH(b),
  guarded: (a, b) => Math.abs(BREADTH(a) - 2) - Math.abs(BREADTH(b) - 2),
  denial:  (a, b) => BREADTH(b) - BREADTH(a),
};

export function generate(seed, guard) {
  const r = rng(seed);
  const need = VALID_NEEDS[Math.floor(r() * VALID_NEEDS.length)];
  const cands = consistentClues(need).sort(ORDER[guard]);
  const shown = [];
  const narrows = (c) => {
    const before = survivorsPerAxis(shown)[c.axis].length;
    const after = survivorsPerAxis([...shown, c])[c.axis].length;
    return after < before;
  };
  for (const c of cands) { if (isPinned(shown)) break; if (narrows(c)) shown.push(c); }

  const herrings = cluesFor('disposition').sort(() => r() - 0.5).slice(0, 1 + Math.floor(r() * 2));
  const pickLine = (c) => c.lines[Math.floor(r() * c.lines.length)];
  const testimony = [...shown, ...herrings]
    .map((c) => ({ id: c.id, axis: c.axis, on: c.on, text: pickLine(c) }))
    .sort(() => r() - 0.5);
  return { need, guard, shown, testimony, difficulty: shown.length, bands: bandsOf(need) };
}

const isCli = typeof process !== 'undefined' && process.argv[1]?.includes('read.mjs');
if (isCli) {
  console.log('\n  THE READING - Layer A v3 (Stage 1): the punnett square\n  ' + '-'.repeat(58));
  const all = allNeeds();
  console.log(`  full grid          ${all.length} cells  (${AXES.subject.length} subject x ${AXES.turn.length} turn x ${AXES.wound.length} wound)`);
  console.log(`  coherent + solvable ${VALID_NEEDS.length} cells  (nonsense Subject x Turn pruned; every one pins)`);

  console.log('\n  Subject x Turn validity  (o = coherent, . = excluded):');
  console.log('              ' + AXES.turn.map((t) => t.padEnd(9)).join(''));
  for (const s of AXES.subject)
    console.log('    ' + s.padEnd(10) + AXES.turn.map((t) => (VALID_TURNS[s].includes(t) ? 'o' : '.').padEnd(9)).join(''));

  const GLOSS = {
    'partner/act/villain': 'leave, terrified you are the bad guy',
    'partner/hold/alone': 'stay / commit out of fear of being alone',
    'partner/act/wasted': 'leave after years, mourning the time',
    'ex/release/wasted': 'get over the ex you wasted years on',
    'ex/act/alone': 'crawl back to the ex because alone is worse',
    'departed/release/villain': "survivor's guilt - let go, feel monstrous for the relief",
    'departed/release/alone': 'let them go, terrified of the empty house',
    'departed/hold/nothing': 'cannot let go; without them you are nobody',
    'self/act/nothing': 'change your life while feeling worthless',
    'self/release/villain': 'stop being the villain in your own story',
    'work/hold/wasted': 'endure the job, mourning the career you never had',
    'work/act/nothing': 'quit - but really you just feel like nothing',
    'road/act/alone': 'chase the dream, scared it costs you everyone',
    'road/release/wasted': 'mourn the road not taken, the wasted potential',
  };
  console.log('\n  gold cells (write clue-prose for these first):');
  for (const [k, g] of Object.entries(GLOSS)) console.log(`    ${k.padEnd(26)} ${g}`);

  console.log('\n  difficulty ladder (clues to chain, 200 querents/guard):');
  for (const guard of ['open', 'guarded', 'denial']) {
    const hist = {};
    for (let s = 1; s <= 200; s++) { const d = generate(s, guard).difficulty; hist[d] = (hist[d] || 0) + 1; }
    const avg = (Object.entries(hist).reduce((a, [d, n]) => a + d * n, 0) / 200).toFixed(1);
    console.log(`    ${guard.padEnd(8)} avg ${avg}   [${Object.keys(hist).sort().map((d) => d + ':' + hist[d]).join('  ')}]`);
  }

  console.log('\n  two worked reads (testimony shuffled - the player must SORT):');
  let shown = 0;
  for (let s = 1; s < 500 && shown < 2; s++) {
    const q = generate(s, ['guarded', 'denial'][shown % 2]);
    if (q.difficulty < 3) continue; shown++;
    console.log(`\n  [${q.guard}] need = ${q.need.subject} / ${q.need.turn} / ${q.need.wound}`);
    for (const c of q.testimony) console.log(`     "${c.text}"`);
    const sv = survivorsPerAxis(q.shown);
    console.log(`  -> subject:${sv.subject} turn:${sv.turn} wound:${sv.wound}   bands ${METERS.map((m) => m + q.bands[m].join('-')).join(' ')}`);
  }
  console.log('');
}
