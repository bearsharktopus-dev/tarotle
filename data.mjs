import { METERS, v } from './core.mjs';
export { METERS };

export const TAGS = {
  comfort:     v({ R: +3 }),
  hope:        v({ R: +2, C: +1 }),
  reassurance: v({ R: +1, L: +3 }),
  absolution:  v({ G: -3 }),
  permission:  v({ C: +3, G: +1 }),
  clearing:    v({ C: +2, G: -1, R: -1 }),
  devotion:    v({ R: +1, C: +1, G: -1 }),
  vindication: v({ G: -2, C: +1, L: +1 }),
  finality:    v({ C: +2, L: +2, R: -1 }),
  transformation: v({ C: +1, R: +1, L: -1 }),
  surrender:   v({ R: +2, C: -2 }),
  caution:     v({ C: -2, L: +1 }),
  warning:     v({ R: -2, L: +2 }),
  reckoning:   v({ R: -2, L: +2, G: +2 }),
  nostalgia:   v({ R: +1, C: -1, G: +1 }),
  catastrophe: v({ R: -3, C: -1 }),
  doubt:       v({ L: -3 }),

  illusion:    v({ R: -1, L: -2 }),
  compulsion:  v({ R: -2, C: -2, G: +2 }),
};

export const CARDS = {
  fool:           { name: 'The Fool',          up: ['hope', 'permission', 'comfort'],        rev: ['caution', 'warning', 'doubt'] },
  magician:       { name: 'The Magician',      up: ['permission', 'vindication', 'reassurance'], rev: ['illusion', 'warning', 'doubt'] },
  high_priestess: { name: 'The High Priestess',up: ['reassurance', 'surrender', 'caution'],  rev: ['doubt', 'warning', 'nostalgia'] },
  empress:        { name: 'The Empress',       up: ['comfort', 'devotion', 'reassurance'],   rev: ['nostalgia', 'doubt', 'caution'] },
  emperor:        { name: 'The Emperor',       up: ['permission', 'reassurance', 'caution'],  rev: ['warning', 'reckoning', 'compulsion'] },
  hierophant:     { name: 'The Hierophant',    up: ['reassurance', 'devotion', 'caution'],   rev: ['permission', 'clearing', 'doubt'] },
  lovers:         { name: 'The Lovers',        up: ['devotion', 'comfort', 'hope'],          rev: ['reckoning', 'caution', 'illusion'] },
  chariot:        { name: 'The Chariot',       up: ['permission', 'vindication', 'hope'],     rev: ['doubt', 'surrender', 'caution'] },
  strength:       { name: 'Strength',          up: ['permission', 'reassurance', 'absolution'], rev: ['doubt', 'surrender', 'warning'] },
  hermit:         { name: 'The Hermit',        up: ['caution', 'reassurance', 'clearing'],   rev: ['nostalgia', 'caution', 'surrender'] },
  wheel:          { name: 'Wheel of Fortune',  up: ['hope', 'surrender', 'transformation'],  rev: ['catastrophe', 'caution', 'warning'] },
  justice:        { name: 'Justice',           up: ['reckoning', 'finality', 'vindication'], rev: ['illusion', 'warning', 'catastrophe'] },
  hanged_man:     { name: 'The Hanged Man',    up: ['surrender', 'caution', 'transformation'], rev: ['caution', 'doubt', 'compulsion'] },
  death:          { name: 'Death',             up: ['transformation', 'clearing', 'surrender'], rev: ['caution', 'nostalgia', 'warning'] },
  temperance:     { name: 'Temperance',        up: ['reassurance', 'surrender', 'hope'],     rev: ['warning', 'caution', 'compulsion'] },
  devil:          { name: 'The Devil',         up: ['compulsion', 'warning', 'reckoning'],   rev: ['clearing', 'permission', 'absolution'] },
  tower:          { name: 'The Tower',         up: ['catastrophe', 'reckoning', 'clearing'], rev: ['warning', 'caution', 'surrender'] },
  star:           { name: 'The Star',          up: ['hope', 'comfort', 'reassurance'],       rev: ['catastrophe', 'doubt', 'caution'] },
  moon:           { name: 'The Moon',          up: ['illusion', 'doubt', 'warning'],         rev: ['surrender', 'comfort', 'reassurance'] },
  sun:            { name: 'The Sun',           up: ['comfort', 'hope', 'vindication'],       rev: ['nostalgia', 'illusion', 'doubt'] },
  judgement:      { name: 'Judgement',         up: ['absolution', 'permission', 'transformation'], rev: ['doubt', 'caution', 'reckoning'] },
  world:          { name: 'The World',         up: ['finality', 'comfort', 'vindication'],   rev: ['caution', 'nostalgia', 'illusion'] },
};

export const SAMPLE_PUZZLE = {
  id: 'sample-torn',
  baseline: v({ R: 4, C: 3, L: 3, G: 6 }),
  bands: {
    R: [5, 8],
    C: [6, 9],
    L: [6, 9],
    G: [0, 3],
  },
  hand: ['tower', 'lovers', 'star', 'judgement', 'death'],

  positions: [
    { name: 'Heart',    amplify: 'R' },
    { name: 'Crossing', amplify: 'G' },
    { name: 'Outcome',  amplify: 'C' },
  ],
};
