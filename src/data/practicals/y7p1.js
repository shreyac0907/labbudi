// The one fully-built practical. Everything else in the registry is a stub.
//
// `checkpoints` are the step indices that trigger an automatic save (see
// engine/SaveManager + engine/PracticalEngine). `checkpointGroups` describe
// the named sections shown on the roadmap.
//
// Rebuilt per the Cooking Mama principles pass: each sub-practical now
// splits "draw up the indicator" (PipetteDrawGame, Section 2.1's physical
// metaphor beat) from "carry + squeeze" (SqueezeGame) — the dropper leaves
// the drawing step already loaded and is never re-drawn between tubes.
// Litmus is a genuinely different mechanic (no bottle, no dropper — see
// LitmusGame) so its old 6-step pick-up-then-squeeze-5-times sequence
// collapses into one continuous step, same as the spec's "this is the
// entire mechanic" framing.

export const y7p1 = {
  id: 'y7_p1',
  title: 'Testing pH Using Indicators',
  subject: 'chemistry',
  year: 'y7',
  character: 'madu',
  thumbnail: '/assets/cards/y7p1_thumb.png',

  evaluation: {
    goldThreshold: 90,
    silverThreshold: 70,
    bronzeThreshold: 50,
  },

  checkpoints: [0, 7, 9, 16, 17, 18],

  checkpointGroups: [
    { id: 'safety', name: 'Safety', stepRange: [0, 0] },
    { id: 'universal', name: 'Universal Indicator', stepRange: [1, 7] },
    { id: 'litmus', name: 'Litmus Paper', stepRange: [8, 9] },
    { id: 'phenolphthalein', name: 'Phenolphthalein', stepRange: [10, 16] },
    { id: 'understand', name: 'Understand', stepRange: [17, 18] },
  ],

  steps: [
    // STEP 0 — SAFETY CHECK
    {
      id: 'step_safety',
      iconType: 'hazard',
      title: 'Safety First',
      instruction: 'Tap each hazard to learn the safety rule before we begin.',
      type: 'tap',
      parameters: {
        targets: [
          { id: 'corrosive', label: 'Corrosive', rule: 'Wear gloves. Bleach burns skin.' },
          { id: 'irritant', label: 'Irritant', rule: 'Wear goggles. Acids irritate eyes.' },
          { id: 'lab_rules', label: 'Lab Rules', rule: 'No eating or drinking in the lab.' },
        ],
        requiredTaps: 3,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'lili',
      feedback: {
        success: 'All safety rules checked. Now we can start!',
        failure: 'Tap every hazard card before we continue.',
      },
    },

    // STEP 1 — DRAW UP UNIVERSAL INDICATOR (Step A1)
    {
      id: 'step_draw_ui',
      iconType: 'pull',
      title: 'Draw Up the Indicator',
      instruction: 'Hold the pipette bulb to draw up the Universal Indicator.',
      type: 'draw_pipette',
      parameters: {
        indicatorLabel: 'Universal Indicator',
        neutralColor: '#A6D7A8',
        introLine:
          "See this green? Universal Indicator starts green, neutral, like water. When it meets an acid or alkali, the colour tells you how strong it is.",
        timeLimit: 12,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: {
        success: 'The pipette is full! Now drag it above the test tube and squeeze.',
        failure: 'Hold the bulb a little longer to draw it all the way up.',
      },
    },

    // STEP 2 — TEST TUBE 1: LEMON JUICE (Universal Indicator)
    {
      id: 'step_squeeze_ui_lemon',
      iconType: 'pull',
      title: 'Test the Lemon Juice',
      instruction: 'Squeeze the bulb 3 times to drop indicator into the tube.',
      type: 'squeeze',
      parameters: {
        tubeLabel: 'Lemon juice',
        indicatorLabel: 'Universal Indicator',
        targetTube: 'tube_lemon',
        targetZone: { x: 10, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#C62828',
        resultLabel: 'Red, pH 2 (strongly acidic)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'RED! Lemon juice is strongly acidic, pH 2.',
        failure: 'Drag the pipette above the lemon juice tube and squeeze.',
      },
    },

    // STEP 3 — TEST TUBE 2: VINEGAR
    {
      id: 'step_squeeze_ui_vinegar',
      iconType: 'pull',
      title: 'Test the Vinegar',
      instruction: 'Squeeze 3 drops of Universal Indicator into the VINEGAR test tube.',
      type: 'squeeze',
      parameters: {
        tubeLabel: 'Vinegar',
        indicatorLabel: 'Universal Indicator',
        targetTube: 'tube_vinegar',
        targetZone: { x: 26, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#EF6C00',
        resultLabel: 'Orange, pH 4 (weakly acidic)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'Orange! Vinegar is weakly acidic, pH 4.',
        failure: 'Squeeze the dropper over the vinegar tube.',
      },
    },

    // STEP 4 — TEST TUBE 3: WATER
    {
      id: 'step_squeeze_ui_water',
      iconType: 'pull',
      title: 'Test the Water',
      instruction: 'Squeeze 3 drops into the WATER test tube.',
      type: 'squeeze',
      parameters: {
        tubeLabel: 'Water',
        indicatorLabel: 'Universal Indicator',
        targetTube: 'tube_water',
        targetZone: { x: 42, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#2E7D32',
        resultLabel: 'Green, pH 7 (neutral)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: "Green! That's neutral, just like the indicator itself. Water is pH 7.",
        failure: 'Squeeze over the water tube.',
      },
    },

    // STEP 5 — TEST TUBE 4: BICARBONATE
    {
      id: 'step_squeeze_ui_bicarb',
      iconType: 'pull',
      title: 'Test the Bicarbonate',
      instruction: 'Squeeze 3 drops into the BICARBONATE test tube.',
      type: 'squeeze',
      parameters: {
        tubeLabel: 'Bicarbonate',
        indicatorLabel: 'Universal Indicator',
        targetTube: 'tube_bicarb',
        targetZone: { x: 58, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#00695C',
        resultLabel: 'Blue-green, pH 8 (weakly alkaline)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'WOW! Look at that! Blue-green, bicarbonate is weakly alkaline, pH 8.',
        failure: 'Squeeze over the bicarbonate tube.',
      },
    },

    // STEP 6 — TEST TUBE 5: BLEACH
    {
      id: 'step_squeeze_ui_bleach',
      iconType: 'pull',
      title: 'Test the Bleach',
      instruction: "CAREFUL: bleach is corrosive. Squeeze 3 drops into the BLEACH test tube.",
      type: 'squeeze',
      parameters: {
        tubeLabel: 'Bleach',
        indicatorLabel: 'Universal Indicator',
        targetTube: 'tube_bleach',
        targetZone: { x: 74, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#4A148C',
        resultLabel: 'Purple, pH 13 (strongly alkaline)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: "WOW! Look at that! PURPLE, bleach is strongly alkaline, pH 13. That's why it's so dangerous!",
        failure: 'Squeeze carefully over the bleach tube.',
      },
    },

    // STEP 7 — RECORD UNIVERSAL INDICATOR RESULTS
    {
      id: 'step_record_ui',
      iconType: 'notepad',
      title: 'Record Your Results',
      instruction: 'Type the colour you saw in each empty cell.',
      type: 'record',
      parameters: {
        mode: 'colour_picker',
        table: {
          rows: ['Lemon juice', 'Vinegar', 'Water', 'Bicarbonate', 'Bleach'],
          columns: ['Universal Indicator colour'],
        },
        answers: {
          'Lemon juice': { colour: '#C62828', label: 'Red (pH 2)' },
          Vinegar: { colour: '#EF6C00', label: 'Orange (pH 4)' },
          Water: { colour: '#2E7D32', label: 'Green (pH 7)' },
          Bicarbonate: { colour: '#00695C', label: 'Blue-green (pH 8)' },
          Bleach: { colour: '#4A148C', label: 'Purple (pH 13)' },
        },
        colourOptions: [
          { colour: '#C62828', label: 'Red (pH 2)' },
          { colour: '#EF6C00', label: 'Orange (pH 4)' },
          { colour: '#2E7D32', label: 'Green (pH 7)' },
          { colour: '#00695C', label: 'Blue-green (pH 8)' },
          { colour: '#4A148C', label: 'Purple (pH 13)' },
          { colour: '#F9A825', label: 'Yellow (pH 5)' },
        ],
        referenceChart: 'universal',
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lili',
      feedback: {
        success: 'Perfect results table! Now repeat with Litmus.',
        failure: 'Match each colour to the correct solution.',
      },
    },

    // STEP 8 — LITMUS PAPER: all 5 tubes in one continuous mechanic. No
    // bottle, no dropper — Pip holds the paper, the student presses the
    // clock and reads what happens.
    {
      id: 'step_litmus_test',
      iconType: 'pull',
      title: 'Test with Litmus Paper',
      instruction: 'Hold the paper down into each tube.',
      type: 'litmus_test',
      parameters: {
        tubes: [
          { label: 'Lemon juice', resultColor: '#E53935', note: 'Red stays red, litmus paper tells us it’s acidic!' },
          { label: 'Vinegar', resultColor: '#E53935', note: 'Red stays red, vinegar is acidic too.' },
          { label: 'Water', resultColor: '#7B1FA2', note: 'Purple! Water turns the paper purple, neutral.' },
          { label: 'Bicarbonate', resultColor: '#1565C0', note: 'Blue! The alkali turned it blue.' },
          { label: 'Bleach', resultColor: '#1565C0', note: 'Blue! Bleach is a strong alkali too.' },
        ],
        timeLimit: 40,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'All 5 tubes tested with litmus paper!',
        failure: 'Hold the paper down into the next tube.',
      },
    },

    // STEP 9 — RECORD LITMUS RESULTS
    {
      id: 'step_record_litmus',
      iconType: 'notepad',
      title: 'Record Litmus Results',
      instruction: 'Type the colour the paper turned in each empty cell.',
      type: 'record',
      parameters: {
        mode: 'colour_picker',
        table: {
          rows: ['Lemon juice', 'Vinegar', 'Water', 'Bicarbonate', 'Bleach'],
          columns: ['Litmus colour'],
        },
        answers: {
          'Lemon juice': { colour: '#E53935', label: 'Red (acid)' },
          Vinegar: { colour: '#E53935', label: 'Red (acid)' },
          Water: { colour: '#7B1FA2', label: 'Purple (neutral)' },
          Bicarbonate: { colour: '#1565C0', label: 'Blue (alkali)' },
          Bleach: { colour: '#1565C0', label: 'Blue (alkali)' },
        },
        colourOptions: [
          { colour: '#E53935', label: 'Red (acid)' },
          { colour: '#7B1FA2', label: 'Purple (neutral)' },
          { colour: '#1565C0', label: 'Blue (alkali)' },
        ],
        referenceChart: 'litmus',
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lili',
      feedback: { success: 'Litmus results recorded. Now for Phenolphthalein!', failure: 'Match colours to solutions.' },
    },

    // STEP 10 — DRAW UP PHENOLPHTHALEIN
    {
      id: 'step_draw_ph',
      iconType: 'pull',
      title: 'Draw Up Phenolphthalein',
      instruction: 'Hold the pipette bulb to draw up the Phenolphthalein.',
      type: 'draw_pipette',
      parameters: {
        indicatorLabel: 'Phenolphthalein',
        neutralColor: '#FAFAF7',
        introLine:
          'This one is colourless, you can barely see it! Phenolphthalein only reacts to alkalis. Nothing happens in acids.',
        timeLimit: 12,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: {
        success: 'Phenolphthalein ready. This one only reacts to alkalis!',
        failure: 'Hold the bulb a little longer.',
      },
    },

    // STEP 11 — PHENOLPHTHALEIN: LEMON JUICE
    {
      id: 'step_squeeze_ph_lemon',
      iconType: 'pull',
      title: 'Phenolphthalein: Lemon Juice',
      type: 'squeeze',
      instruction: 'Squeeze 3 drops of Phenolphthalein into the LEMON JUICE test tube.',
      parameters: {
        tubeLabel: 'Lemon juice',
        indicatorLabel: 'Phenolphthalein',
        targetTube: 'tube_lemon_ph',
        targetZone: { x: 10, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: 'transparent',
        resultLabel: 'Colourless (acid/neutral)',
        noChangeNote: true,
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'No change, and that’s your result! Colourless = acid or neutral.',
        failure: 'Squeeze over the lemon juice tube.',
      },
    },

    // STEP 12 — PHENOLPHTHALEIN: VINEGAR
    {
      id: 'step_squeeze_ph_vinegar',
      iconType: 'pull',
      title: 'Phenolphthalein: Vinegar',
      type: 'squeeze',
      instruction: 'Squeeze 3 drops into the VINEGAR test tube.',
      parameters: {
        tubeLabel: 'Vinegar',
        indicatorLabel: 'Phenolphthalein',
        targetTube: 'tube_vinegar_ph',
        targetZone: { x: 26, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: 'transparent',
        resultLabel: 'Colourless (acid)',
        noChangeNote: true,
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: { success: 'Colourless again in acid!', failure: 'Squeeze over the vinegar tube.' },
    },

    // STEP 13 — PHENOLPHTHALEIN: WATER
    {
      id: 'step_squeeze_ph_water',
      iconType: 'pull',
      title: 'Phenolphthalein: Water',
      type: 'squeeze',
      instruction: 'Squeeze 3 drops into the WATER test tube.',
      parameters: {
        tubeLabel: 'Water',
        indicatorLabel: 'Phenolphthalein',
        targetTube: 'tube_water_ph',
        targetZone: { x: 42, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: 'transparent',
        resultLabel: 'Colourless (neutral)',
        noChangeNote: true,
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: { success: 'Colourless in neutral water too!', failure: 'Squeeze over the water tube.' },
    },

    // STEP 14 — PHENOLPHTHALEIN: BICARBONATE
    {
      id: 'step_squeeze_ph_bicarb',
      iconType: 'pull',
      title: 'Phenolphthalein: Bicarbonate',
      type: 'squeeze',
      instruction: 'Squeeze 3 drops into the BICARBONATE test tube.',
      parameters: {
        tubeLabel: 'Bicarbonate',
        indicatorLabel: 'Phenolphthalein',
        targetTube: 'tube_bicarb_ph',
        targetZone: { x: 58, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#FCE4EC',
        resultLabel: 'Faint pink (weakly alkaline)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: { success: 'Faint pink! It reacted, bicarbonate is alkaline.', failure: 'Squeeze over the bicarbonate tube.' },
    },

    // STEP 15 — PHENOLPHTHALEIN: BLEACH
    {
      id: 'step_squeeze_ph_bleach',
      iconType: 'pull',
      title: 'Phenolphthalein: Bleach',
      type: 'squeeze',
      instruction: 'Squeeze 3 drops into the BLEACH test tube.',
      parameters: {
        tubeLabel: 'Bleach',
        indicatorLabel: 'Phenolphthalein',
        targetTube: 'tube_bleach_ph',
        targetZone: { x: 74, y: 30, w: 80, h: 200 },
        holdDuration: 0.3,
        requiredDrops: 3,
        resultColour: '#E91E63',
        resultLabel: 'Bright pink (strongly alkaline)',
        timeLimit: 15,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'madu',
      feedback: {
        success: 'BRIGHT PINK! Bleach is strongly alkaline, the strongest reaction yet.',
        failure: 'Squeeze over the bleach tube.',
      },
    },

    // STEP 16 — RECORD PHENOLPHTHALEIN RESULTS
    {
      id: 'step_record_ph',
      iconType: 'notepad',
      title: 'Record Phenolphthalein Results',
      instruction: 'Type what you saw in each empty cell.',
      type: 'record',
      parameters: {
        mode: 'colour_picker',
        table: {
          rows: ['Lemon juice', 'Vinegar', 'Water', 'Bicarbonate', 'Bleach'],
          columns: ['Phenolphthalein colour'],
        },
        answers: {
          'Lemon juice': { colour: 'transparent', label: 'Colourless' },
          Vinegar: { colour: 'transparent', label: 'Colourless' },
          Water: { colour: 'transparent', label: 'Colourless' },
          Bicarbonate: { colour: '#FCE4EC', label: 'Faint pink' },
          Bleach: { colour: '#E91E63', label: 'Bright pink' },
        },
        colourOptions: [
          { colour: 'transparent', label: 'Colourless' },
          { colour: '#FCE4EC', label: 'Faint pink' },
          { colour: '#E91E63', label: 'Bright pink' },
        ],
        referenceChart: 'phenolphthalein',
        timeLimit: 0,
        allowMemoryMode: true, // final of the 3 record steps — offers "record from memory" per Prompt 3's bonus challenge
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lili',
      feedback: {
        success: "Results table complete! Now let's understand what it all means.",
        failure: 'Fill in every cell.',
      },
    },

    // STEP 17 — UNDERSTAND PAGE 1: WHAT DO THE RESULTS TELL US?
    {
      id: 'step_results_meaning',
      iconType: 'notepad',
      title: 'What Does It Mean?',
      instruction: 'Read each slide to see what the data is telling us.',
      type: 'tap',
      parameters: {
        targets: [
          {
            id: 'pattern_card',
            label: 'The Pattern',
            content:
              "Universal Indicator turns a different colour for every strength of acid and alkali, making a rainbow from red to purple. Red means a strong acid, orange and yellow mean weaker acids, and green means neutral. Green is pH 7, the pH of pure water, which is also why the indicator liquid itself looks green in the bottle. Blue and purple mean alkalis, and the deeper the purple, the stronger the alkali. In your results, lemon juice was red, vinegar orange, water green, bicarbonate blue-green and bleach purple, so the colours placed each liquid on the pH scale.",
          },
          {
            id: 'litmus_card',
            label: 'What Litmus Tells Us',
            content:
              "Litmus paper only gives you two possible answers: it turns red in an acid and blue in an alkali. In neutral water it stays purple. It cannot tell you how strong the acid or alkali is, because lemon juice and vinegar both turned it the same red. That is why litmus is a quick first test, while Universal Indicator is better when you need detail. Scientists often use litmus to decide which side of the pH scale a solution is on before they test it more carefully.",
          },
          {
            id: 'phph_card',
            label: 'What Phenolphthalein Tells Us',
            content:
              "Phenolphthalein is completely colourless in acids and in neutral solutions, so it looks as if nothing has happened. It only reacts to alkalis, turning pink. The stronger the alkali, the brighter the pink, so bicarbonate gave a faint pink and bleach gave a bright pink. Because the change is so sudden, chemists use it in titrations to spot the exact moment an acid has been used up. This makes it a very precise tool for alkalis, but it tells you nothing about acids.",
          },
          {
            id: 'conclusion_card',
            label: 'The Conclusion',
            content:
              "Lemon juice and vinegar are acids, water is neutral, and bicarbonate and bleach are alkalis. All three indicators agreed with each other, which makes the conclusion more reliable. Litmus sorted the liquids into acid, neutral and alkali, phenolphthalein picked out only the alkalis, and Universal Indicator gave each liquid its own place on the pH scale. Each indicator is a different tool, and each tells you something the others cannot. Scientists combine evidence from more than one test, just as you did, before they trust a result.",
          },
        ],
        requiredTaps: 4,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'lumi',
      feedback: {
        success: "You've understood the data. That's what science is.",
        failure: 'Tap every card.',
      },
    },

    // STEP 18 — UNDERSTAND PAGE 2: REAL LIFE CONNECTIONS (placeholder)
    {
      id: 'step_understand_page2',
      iconType: 'notepad',
      title: 'Real Life Connections',
      instruction: 'These chemicals are in your home!',
      type: 'scrapbook_placeholder',
      parameters: {},
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'lumi',
      feedback: { success: 'Great work, Testing pH Using Indicators is complete!', failure: '' },
    },
  ],

  unlocks: ['y7_p2'],
};

export default y7p1;
