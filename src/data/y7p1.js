export const y7p1 = {
  id: 'y7_0',
  title: 'Testing pH Using Indicators',
  subject: 'chemistry',
  year: 'y7',
  screens: {
    intro: {
      title: 'What are we investigating?',
      concept:
        'Some substances are acidic, some are alkaline, and some are neutral. Scientists use indicators — special dye solutions — to tell them apart by the colour they turn. Today we are going to test five different solutions using three different indicators and build a colour reference chart.',
      analogy:
        "Think of indicators like mood rings for chemicals — they change colour based on how acidic or alkaline the solution is. Except these ones actually work!",
      gpsSkill: 'Make accurate observations',
    },
    riskAssessment: {
      title: 'Before we start — stay safe',
      pipIntro: "Every scientist checks safety before touching anything. Lili's going to walk you through this.",
      gpsSkill: 'Use equipment safely',
      hazards: [
        {
          id: 'corrosive',
          name: 'Corrosive',
          subtitle: 'bleach',
          rule: 'Wear safety goggles and gloves. Do not let it touch your skin.',
        },
        {
          id: 'irritant',
          name: 'Irritant',
          subtitle: 'acids',
          rule: 'Avoid contact with eyes and skin. Wash immediately if spilled.',
        },
        {
          id: 'general',
          name: 'General lab safety',
          subtitle: '',
          rule: 'No eating or drinking in the lab. Tie back long hair.',
        },
        {
          id: 'disposal',
          name: 'Disposal',
          subtitle: '',
          rule: 'Dispose of solutions down the sink with plenty of water. Never mix waste chemicals.',
        },
      ],
    },
    equipment: {
      title: 'What do we need?',
      gpsSkill: 'Follow instructions carefully',
      introText: "Drag each item over to its name — I'll tell you something cool when you get it right!",
      wrongMatchText: 'Not quite — have another look!',
      items: [
        {
          id: 'test_tube',
          name: 'Test tube',
          fact: 'Test tubes are made of borosilicate glass — it can handle sudden temperature changes without cracking!',
        },
        {
          id: 'dropper_pipette',
          name: 'Dropper pipette',
          fact: 'One drop from a dropper is about 0.05ml — precision matters in chemistry!',
        },
        {
          id: 'indicator_universal',
          name: 'Universal indicator',
          fact: 'Universal indicator is actually a MIX of several different indicators!',
        },
        {
          id: 'indicator_litmus',
          name: 'Litmus',
          fact: 'Litmus comes from lichens — tiny organisms that are part fungus, part algae!',
        },
        {
          id: 'indicator_phenolphthalein',
          name: 'Phenolphthalein',
          fact: 'Phenolphthalein is colourless in acid but turns bright pink in alkali!',
        },
        {
          id: 'solution_tray',
          name: 'Solution tray',
          fact: 'Keeping solutions in a tray means any spills are contained — always lab safe!',
        },
      ],
    },
    methodology: {
      title: 'How do we do it?',
      gpsSkill: 'Follow instructions carefully',
      steps: [
        {
          text: 'Label your test tubes 1 to 5 — one for each solution you will test.',
          character: 'Pip',
          line: 'Labelling is the first thing a real chemist does — unlabelled solutions caused famous lab accidents!',
        },
        {
          text: 'Pour a small amount (about 2cm) of each solution into its labelled test tube.',
          character: 'Lili',
          line: "2cm depth is enough — you don't need much for an indicator to work.",
        },
        {
          text: 'Add 3 drops of Universal Indicator to the first row of test tubes. Record the colour you observe.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Add 3 drops of Litmus solution to the second row. Record the colour.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Add 3 drops of Phenolphthalein to the third row. Record the colour.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Compare your colours to the pH scale reference chart and record the pH of each solution.',
          character: 'Pip',
          line: null,
        },
      ],
    },
    results: {
      title: 'What did we find?',
      gpsSkill: 'Record results in tables · Draw simple graphs · Identify patterns',
      graphErrorText: 'Nearly — check your Universal Indicator result for that solution.',
    },
    theory: {
      title: 'Why does this happen?',
      maduLine:
        'The indicator is basically a molecular mood ring — it changes colour based on how many H⁺ ions are floating around in the solution. More H⁺ = more acidic = lower pH!',
      lumiDeepDive:
        "pH stands for 'potential of Hydrogen'. It's defined as the negative logarithm of the H⁺ ion concentration: pH = -log[H⁺]. At pH 7, [H⁺] = 10⁻⁷ mol/dm³. Every unit change in pH represents a 10× change in acidity.",
      gpsSkill: 'Write conclusions',
      cards: [
        {
          character: 'madu',
          front: 'Why did the indicator change colour?',
          back: "It's basically a molecular mood ring — it changes colour based on how many H⁺ ions are floating around in the solution. More H⁺ = more acidic = lower pH!",
        },
        {
          character: 'lili',
          front: 'Why do we need THREE different indicators?',
          back: "Litmus only tells you acid or alkali. Universal indicator shows the WHOLE pH scale from 1–14. Phenolphthalein is extra picky — colourless in acid, bright pink in alkali. Together they give a much fuller picture than any one alone!",
        },
        {
          character: 'pip',
          front: "Why did Phenolphthalein sometimes seem to do... nothing?",
          back: "No colour change is still a result! Phenolphthalein only reacts to alkalis — if a solution stayed the same colour, that's a clue it's acidic or neutral, not a mistake.",
        },
        {
          character: 'lumi',
          deep: true,
          front: 'Go deeper: what does "pH" actually mean?',
          back: "pH stands for 'potential of Hydrogen'. It's defined as the negative logarithm of the H⁺ ion concentration: pH = -log[H⁺]. At pH 7, [H⁺] = 10⁻⁷ mol/dm³. Every unit change in pH represents a 10× change in acidity.",
        },
      ],
    },
    summary: {
      aim: {
        body: 'We wanted to find out whether different solutions are acidic, neutral, or alkaline — and by how much. We used three indicators to test five solutions and record their colours and pH values.',
        line: 'Every time you check if something is safe to drink, someone is doing this test.',
      },
      keyResult: {
        character: 'madu',
        body: "The solutions ranged from strongly acidic (lemon juice, pH 2 — red with Universal Indicator) to strongly alkaline (bleach, pH 13 — purple). Water was neutral at pH 7 and turned the indicator green. Each indicator responded differently: litmus only showed acid or alkali, while Universal Indicator showed the full range.",
        line: 'Indicators like litmus are used in swimming pools to check the water is safe to swim in.',
      },
      pattern: {
        body: 'The lower the pH, the more acidic the solution — and the warmer the colour of the Universal Indicator (red, orange). The higher the pH, the more alkaline — and the cooler the colour (blue, purple). This colour pattern is not a coincidence — it was designed into the indicator to make the pH scale intuitive.',
        line: 'pH is logarithmic. pH 2 is not twice as acidic as pH 4 — it is one hundred times more acidic.',
      },
      keyPoints: {
        bullets: [
          'Indicators change colour in acids and alkalis — each responds differently',
          'Universal Indicator shows the full pH scale (1–14)',
          'pH below 7 = acid, pH 7 = neutral, pH above 7 = alkali',
          'Litmus only shows acid OR alkali — it cannot give a specific pH',
          'Phenolphthalein is colourless in acid, bright pink in alkali',
        ],
        line: "You tested five solutions and built a real pH reference chart. That's analytical chemistry.",
      },
    },
    reflection: {
      title: 'Your turn to think',
      pipIntro:
        "You've just done a real chemistry investigation. No seriously — that's actual science. I'm proud of you. Now, one last thing from me...",
      prompts: [
        'What pattern did you notice between the pH number and the colour of Universal Indicator?',
        'If you repeated this experiment, what would you do differently to make your results more reliable?',
      ],
      completeMessage: "DONE! You've completed your first LabBudi practical. Head back to the notebook to see your stamp!",
      gpsSkill: 'Suggest improvements to investigations',
    },
  },
  wetLabDialogue: {
    welcome: [
      'Pick up a pipette, dip it in a solution, and squeeze it into the right well!',
      'Ready to be a chemical detective? Grab a pipette to get started.',
    ],
    celebrate: [
      "Yes! See that colour change? That's the indicator reacting to pH!",
      'Perfect technique — exactly right!',
      "Beautiful! You're reading the pH scale like a pro.",
    ],
    error: [
      'Select a solution first — the test tube needs something to react with!',
      "You've already tested that one! Move to the next combination.",
      "Hmm, that's not quite right — let's have another look before we pour.",
    ],
    fact: [
      "Universal indicator shows the FULL pH scale from 1 to 14 — it's like a mood ring for acidity!",
      "Litmus only tells you acid or alkali — it can't tell you HOW acidic. That's why universal indicator is more useful.",
      'Phenolphthalein is colourless in acid and pink in alkali — it\'s used in titrations in GCSE chemistry!',
      "Phenolphthalein itself turns colourless in acid — but lemon juice and vinegar already have their own colour, so the well won't actually turn colourless, it'll just keep its original tint!",
      "Clear and colourless aren't the same thing! Clear means you can see through it — colourless means it has no colour tint at all. Something can be clear AND coloured, like apple juice!",
    ],
    checkpoint: [
      "Checkpoint saved! You've completed the first indicator test.",
      'Great progress — saved! You can close the tab and come back anytime.',
    ],
  },
};
