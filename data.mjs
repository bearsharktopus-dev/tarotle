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

export const CARD_TEXT = {
  fool: {
    up: "A clean start is in front of you, and you're allowed to take the step before you can see the whole staircase.",
    rev: "You're either about to leap without looking or refusing to leap at all; be honest about which one it is.",
  },
  magician: {
    up: "You already have everything you need to make this happen; the only thing missing was your permission to begin.",
    rev: "Something here is smoke - a talent you're wasting, or a story someone is selling you. Look at it twice.",
  },
  high_priestess: {
    up: "You already know the answer. Get quiet and stop arguing with the thing your gut keeps telling you.",
    rev: "You've stopped listening to yourself, or something is being kept from you; this quiet isn't peace.",
  },
  empress: {
    up: "There is more care and plenty around you than you are letting yourself feel. Let it hold you a while.",
    rev: "You've been pouring out and taking none back in, and now you're leaning too hard on someone else to fill it.",
  },
  emperor: {
    up: "Set the boundary and build the structure. You are allowed to be the one who is in charge here.",
    rev: "The grip has become the problem, yours or someone's over you; held this tight, it only breaks what it holds.",
  },
  hierophant: {
    up: "There is real comfort in the old way, the shared vow, the thing everyone already agrees on. Lean on it for now.",
    rev: "The rules you inherited don't fit you. You are allowed to keep your own counsel and step outside them.",
  },
  lovers: {
    up: "A real bond, and a choice that honors it. Not just romance; two things that actually line up.",
    rev: "You want different things, and the harmony you are looking at is painted over the crack.",
  },
  chariot: {
    up: "Take the reins and go. You were right to want this, and you have the will to see it through.",
    rev: "You're pulling in two directions at once and going nowhere. Pick one before you spend yourself on both.",
  },
  strength: {
    up: "This asks for the soft kind of strength, not force. You have it, and needing it doesn't make you weak.",
    rev: "You're running on empty and doubting yourself; the strength is still there, just buried under the tiredness.",
  },
  hermit: {
    up: "Step back from the noise. The answer is coming from inside you, and you need the quiet to hear it.",
    rev: "Alone has tipped into lonely. The retreat that was healing you is starting to wall you in.",
  },
  wheel: {
    up: "The wheel is turning, and it's turning your way. Some of this was never in your hands, so let it move.",
    rev: "The luck has run cold and you're gripping the spokes. Fighting the turn is a lot of what hurts right now.",
  },
  justice: {
    up: "The account comes due. What is true will come out, and it lands on the side of what's fair.",
    rev: "Someone isn't being straight and the scales are off. Don't sign off on a story that doesn't add up.",
  },
  hanged_man: {
    up: "Stop struggling for a moment. Hanging here, upside down, is how you finally see the thing differently.",
    rev: "The pause has curdled into stalling. You are stuck, and the waiting has become a way of not choosing.",
  },
  death: {
    up: "A chapter is ending, and it is meant to. This is change, not loss; let the dead thing go.",
    rev: "You are holding onto something that is already over. The change is coming whether you allow it or not.",
  },
  temperance: {
    up: "Take it slow and mix it right. The way through this is patience, not the extreme of anything.",
    rev: "Something has tipped too far - too much, too fast. You're out of balance and part of you knows it.",
  },
  devil: {
    up: "You call it a comfort, but it holds you, and you already know that it does.",
    rev: "The hold was only ever a deal you agreed to. You are allowed to stop agreeing to it.",
  },
  tower: {
    up: "Something you've propped up is about to come down. It won't be gentle, but what falls was already failing.",
    rev: "You can feel it coming. Let the small thing go now, on purpose, before it becomes the large one.",
  },
  star: {
    up: "The worst of it has passed. This is the card that tells you, plainly, that you are going to be alright.",
    rev: "The hope has drained out of it for now, and you're not sure you're allowed to want things anymore.",
  },
  moon: {
    up: "Not everything here is what it looks like. The fear is real, but it is feeding on things that aren't.",
    rev: "The fog is starting to lift. What frightened you in the dark is losing its grip as the light returns.",
  },
  sun: {
    up: "It really is as good as it feels. Plain warmth, and you've earned the right to stand in it.",
    rev: "The warmth is still there, only clouded - or you're painting it brighter than it is to skip past the low.",
  },
  judgement: {
    up: "The reckoning arrives, and it forgives. You can set it down, rise, and answer what's calling you.",
    rev: "The harshest judge in the room is you. You keep hearing the call and talking yourself back out of it.",
  },
  world: {
    up: "The circle closes. This one is finished, finished well, and yours to finally be at peace with.",
    rev: "You are nearly there and reaching for the shortcut. The closure you want still needs the last real step.",
  },
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
