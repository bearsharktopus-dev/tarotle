export const METERS = ['R', 'C', 'L', 'G'];
export const METER_NAMES = { R: 'Relief', C: 'Conviction', L: 'Clarity', G: 'Guilt' };

export const SCALE_MIN = 0;
export const SCALE_MAX = 12;
export const BASELINE = 6;
export const BAND_HALFWIDTH = 1;

export const BAND_POINTS = 25;
export const PENALTY = 5;

export const clamp = (x) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, x));
export const v = (obj) => METERS.map((m) => obj[m] ?? 0);

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
