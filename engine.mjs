import { TAGS, CARDS } from './data.mjs';
import { METERS, BAND_POINTS, PENALTY } from './core.mjs';

function scoreMeter(value, [lo, hi]) {
  const outside = Math.max(0, lo - value, value - hi);
  return Math.max(0, BAND_POINTS - PENALTY * outside);
}

function placement(cardId, reversed, tagId, position) {
  const card = CARDS[cardId];
  const tags = reversed ? card.rev : card.up;
  if (!tags.includes(tagId)) throw new Error(`${cardId} cannot push ${tagId}`);
  const base = TAGS[tagId];
  const ampIdx = METERS.indexOf(position.amplify);
  return base.map((d, i) => (i === ampIdx ? d * 2 : d));
}

export function score(puzzle, placements) {
  const finals = [...puzzle.baseline];
  for (const p of placements) {
    const delta = placement(p.card, p.reversed, p.tag, puzzle.positions[p.position]);
    for (let i = 0; i < METERS.length; i++) finals[i] += delta[i];
  }
  const perMeter = METERS.map((m, i) => scoreMeter(finals[i], puzzle.bands[m]));
  return { total: perMeter.reduce((a, b) => a + b, 0), finals, perMeter };
}

export function* enumerate(puzzle) {
  const { hand, positions } = puzzle;
  const k = positions.length;

  function* injections(chosen) {
    if (chosen.length === k) { yield chosen; return; }
    for (const c of hand) {
      if (chosen.includes(c)) continue;
      yield* injections([...chosen, c]);
    }
  }

  for (const cards of injections([])) {

    for (let rev = -1; rev < k; rev++) {
      const orient = cards.map((_, i) => i === rev);

      const tagOptions = cards.map((c, i) =>
        (orient[i] ? CARDS[c].rev : CARDS[c].up));
      const counts = tagOptions.map((t) => t.length);
      const total = counts.reduce((a, b) => a * b, 1);
      for (let n = 0; n < total; n++) {
        let x = n;
        const placements = cards.map((c, i) => {
          const t = x % counts[i]; x = Math.floor(x / counts[i]);
          return { card: c, position: i, tag: tagOptions[i][t], reversed: orient[i] };
        });
        yield { placements, result: score(puzzle, placements) };
      }
    }
  }
}

export function analyze(puzzle) {
  let count = 0;
  let best = null;
  let bestNoRev = null;
  const hist = new Map();
  let parWinners = 0;

  for (const sol of enumerate(puzzle)) {
    count++;
    const t = sol.result.total;
    hist.set(t, (hist.get(t) ?? 0) + 1);
    if (!best || t > best.result.total) best = sol;
    const reversedUsed = sol.placements.some((p) => p.reversed);
    if (!reversedUsed && (!bestNoRev || t > bestNoRev.result.total)) bestNoRev = sol;
  }
  for (const sol of enumerate(puzzle)) {
    if (sol.result.total === best.result.total) parWinners++;
  }

  const greedy = greedySolve(puzzle);

  return {
    solutions: count,
    par: best.result.total,
    parSolution: best,
    parWinners,
    bestNoReversal: bestNoRev.result.total,
    reversalValue: best.result.total - bestNoRev.result.total,
    greedy: greedy.total,
    skillHeadroom: best.result.total - greedy.total,
    histogram: [...hist.entries()].sort((a, b) => a[0] - b[0]),
  };
}

function greedySolve(puzzle) {
  const k = puzzle.positions.length;
  const used = new Set();
  const placements = [];
  for (let slot = 0; slot < k; slot++) {
    let bestAdd = null;
    for (const c of puzzle.hand) {
      if (used.has(c)) continue;
      for (const tag of CARDS[c].up) {
        const trial = [...placements, { card: c, position: slot, tag, reversed: false }];
        const s = score(puzzle, trial).total;
        if (!bestAdd || s > bestAdd.s) bestAdd = { card: c, tag, s };
      }
    }
    used.add(bestAdd.card);
    placements.push({ card: bestAdd.card, position: slot, tag: bestAdd.tag, reversed: false });
  }
  return { total: score(puzzle, placements).total, placements };
}
