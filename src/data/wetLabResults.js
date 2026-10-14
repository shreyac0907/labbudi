export const SOLUTIONS = [
  { id: 'lemon', name: 'Lemon juice' },
  { id: 'vinegar', name: 'Vinegar' },
  { id: 'water', name: 'Water' },
  { id: 'bicarbonate', name: 'Bicarbonate' },
  { id: 'bleach', name: 'Bleach' },
];

export const INDICATORS = [
  { id: 'universal', name: 'Universal indicator' },
  { id: 'litmus', name: 'Litmus' },
  { id: 'phenolphthalein', name: 'Phenolphthalein' },
];

// Pale tint visible through the glass of each solution bottle.
export const SOLUTION_BOTTLE_COLOR = {
  lemon: '#FFF9C4',
  vinegar: '#FFF8E1',
  water: '#E3F2FD',
  bicarbonate: '#FAFAFA',
  bleach: '#F5F5F5',
};

// Colour a pipette shows once dipped into a solution.
export const SOLUTION_PIPETTE_COLOR = {
  lemon: '#FFF176',
  vinegar: '#FFE082',
  water: '#E1F5FE',
  bicarbonate: '#F5F5F5',
  bleach: '#FAFAFA',
};

// Colour of the liquid inside each indicator bottle.
export const INDICATOR_BOTTLE_COLOR = {
  universal: '#FF8F00',
  litmus: '#6A1B9A',
  phenolphthalein: null, // colourless
};

// Colour a pipette shows once dipped into an indicator.
export const INDICATOR_PIPETTE_COLOR = {
  universal: '#FF8F00',
  litmus: '#7B1FA2',
  phenolphthalein: null, // colourless — no visible fill
};

// Final well colour + label once solution and indicator have reacted.
export const RESULTS = {
  universal: {
    lemon: { color: '#C62828', label: 'Red — pH 2' },
    vinegar: { color: '#EF6C00', label: 'Orange — pH 4' },
    water: { color: '#2E7D32', label: 'Green — pH 7' },
    bicarbonate: { color: '#00695C', label: 'Blue-green — pH 8' },
    bleach: { color: '#4A148C', label: 'Purple — pH 13' },
  },
  litmus: {
    lemon: { color: '#E53935', label: 'Red — acid' },
    vinegar: { color: '#E53935', label: 'Red — acid' },
    water: { color: '#7B1FA2', label: 'Purple — neutral' },
    bicarbonate: { color: '#1565C0', label: 'Blue — alkali' },
    bleach: { color: '#1565C0', label: 'Blue — alkali' },
  },
  phenolphthalein: {
    // No visible colour change — the well stays at its solution colour.
    lemon: { color: SOLUTION_PIPETTE_COLOR.lemon, label: 'Colourless' },
    vinegar: { color: SOLUTION_PIPETTE_COLOR.vinegar, label: 'Colourless' },
    water: { color: SOLUTION_PIPETTE_COLOR.water, label: 'Colourless' },
    bicarbonate: { color: '#FCE4EC', label: 'Faint pink' },
    bleach: { color: '#E91E63', label: 'Bright pink' },
  },
};

// Correct pH values per solution (Universal Indicator column) — used by the
// Screen 6 graph-plotting activity.
export const UNIVERSAL_PH = {
  lemon: 2,
  vinegar: 4,
  water: 7,
  bicarbonate: 8,
  bleach: 13,
};

// Which reaction "flavour" each (indicator, solution) result belongs to, and
// which character + line reacts to it. Categorised by the resulting colour's
// hue — litmus's neutral (water) result uses its own 'neutral' category
// rather than sharing universal indicator's 'purple' (strongly alkaline)
// category, since litmus solution is naturally violet/purple at pH 7 and
// that shade means something chemically different from bleach's purple.
export const REACTION_CATEGORY = {
  universal: { lemon: 'red', vinegar: 'orange', water: 'green', bicarbonate: 'blue', bleach: 'purple' },
  litmus: { lemon: 'red', vinegar: 'red', water: 'neutral', bicarbonate: 'blue', bleach: 'blue' },
  phenolphthalein: { lemon: 'noChange', vinegar: 'noChange', water: 'noChange', bicarbonate: 'pink', bleach: 'pink' },
};

export const CATEGORY_REACTION = {
  red: { character: 'madu', text: "RED! That's strongly acidic — look how dramatic that colour is!" },
  orange: { character: 'pip', text: 'Orange means weakly acidic — like lemon juice is sharp but not dangerous.' },
  green: { character: 'lili', text: 'Green means neutral — pH 7, perfectly balanced. Like pure water should be!' },
  neutral: {
    character: 'lili',
    text: 'Purple here just means neutral — litmus solution is naturally violet at pH 7, so plain water barely changes it.',
  },
  blue: { character: 'lumi', text: 'Blue tells us it’s alkaline — the H⁺ ion concentration is very low here.' },
  purple: {
    character: 'madu',
    text: "Deep purple — strongly alkaline! Bleach is highly caustic, which is why it's so dangerous.",
  },
  pink: {
    character: 'lili',
    text: 'Phenolphthalein only reacts to alkalis — and that bright pink means it’s definitely alkaline!',
  },
  noChange: {
    character: 'pip',
    text: 'Nothing happened — and that’s a result too! No colour change with phenolphthalein means it’s acidic or neutral.',
  },
};

export const TOTAL_COMBOS = SOLUTIONS.length * INDICATORS.length;

export function comboKey(solutionId, indicatorId) {
  return `${solutionId}_${indicatorId}`;
}

export function wetlabResultsKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_results`;
}

export function wetlabProgressKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_wetlab_progress`;
}

export function wetlabCompleteKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_wetlab_complete`;
}
