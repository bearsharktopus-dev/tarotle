import { CARDS } from './data.mjs';
import { analyze } from './engine.mjs';
import { generate as makeRead } from './read.mjs';
import { METERS, rng } from './core.mjs';

const DECK = Object.keys(CARDS);
const GUARDS = ['open', 'guarded', 'denial'];

export function makeEncounter(seed) {
  const r = rng(seed);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const irange = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  const guard = pick(GUARDS);
  const read = makeRead(seed, guard);

  const baseline = METERS.map(() => irange(2, 8));
  const amps = [...METERS].sort(() => r() - 0.5).slice(0, 3);
  const positions = [
    { name: 'Heart', amplify: amps[0] },
    { name: 'Crossing', amplify: amps[1] },
    { name: 'Outcome', amplify: amps[2] },
  ];
  const hand = [];
  while (hand.length < 5) { const c = pick(DECK); if (!hand.includes(c)) hand.push(c); }

  return {
    seed,
    querent: { need: read.need, guard: read.guard, testimony: read.testimony, difficulty: read.difficulty },
    bands: read.bands, baseline, hand, positions,
  };
}

export function quality(a) {
  if (a.par !== 100) return -1;
  if (a.skillHeadroom < 15) return -1;
  if (a.reversalValue < 8) return -1;
  if (a.parWinners > 10) return -1;
  return a.skillHeadroom + a.reversalValue * 2 - a.parWinners;
}

export function findEncounter(seedStart, span = 800) {
  for (let s = seedStart; s < seedStart + span; s++) {
    const e = makeEncounter(s);
    const a = analyze(e);
    if (quality(a) > 0) return { encounter: e, analysis: a };
  }
  const e = makeEncounter(seedStart);
  return { encounter: e, analysis: analyze(e) };
}
