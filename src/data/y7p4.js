export const y7p4 = {
  id: 'y7_3',
  title: 'Using a Microscope: Observing Onion Cells',
  subject: 'biology',
  year: 'y7',
  screens: {
    intro: {
      title: 'What are we investigating?',
      concept:
        'All living things are made of cells — but we cannot see individual cells with the naked eye. A microscope magnifies objects hundreds of times, making the invisible visible. Today we are going to prepare a microscope slide of onion cells and observe the structures inside them.',
      analogy:
        'Lili: Onion cells are perfect for first-time microscopy — they are large, transparent enough to see through, and stain beautifully with iodine. You are going to see something today that you genuinely cannot see any other way.',
      gpsSkill: 'Make accurate observations',
    },
    riskAssessment: {
      title: 'Before we start — stay safe',
      pipIntro: "Every scientist checks safety before touching anything. Lili's going to walk you through this.",
      gpsSkill: 'Use equipment safely',
      hazards: [
        {
          id: 'glass_slides',
          name: 'Glass slides and coverslips',
          subtitle: '',
          rule: 'Handle with care — glass can break and cut. If a slide breaks, do not touch it. Tell your teacher and dispose of fragments in the sharps bin.',
        },
        {
          id: 'iodine_solution',
          name: 'Iodine solution',
          subtitle: '',
          rule: 'Iodine stains skin, clothing, and surfaces permanently. Wear gloves and work over a tray. If spilled on skin, wash immediately with water.',
        },
        {
          id: 'scalpel',
          name: 'Scalpel / cutting tool',
          subtitle: '',
          rule: 'Always cut away from your fingers. Only use a scalpel when instructed and place it flat on the bench when not in use.',
        },
        {
          id: 'microscope_care',
          name: 'Microscope care',
          subtitle: '',
          rule: 'Never use the coarse focus knob when the high-power objective is in place — you risk cracking the slide. Always start on low power.',
        },
      ],
    },
    equipment: {
      title: 'What do we need?',
      gpsSkill: 'Follow instructions carefully',
      introText: "Drag each item over to its name — I'll tell you something cool when you get it right!",
      wrongMatchText: 'Not quite — have another look!',
      items: [
        { id: 'microscope', name: 'Microscope', icon: 'microscope', fact: "The first microscope was built by Antonie van Leeuwenhoek in the 1670s. He called the tiny living things he saw 'animalcules'." },
        { id: 'glass_slide', name: 'Glass slide', icon: 'glass_slide', fact: 'Standard microscope slides are exactly 75mm × 25mm — the same size worldwide so they fit any microscope stage.' },
        { id: 'coverslip', name: 'Coverslip', icon: 'coverslip', fact: 'The coverslip flattens the specimen and protects the objective lens from touching wet specimens.' },
        { id: 'iodine_bottle', name: 'Iodine', icon: 'iodine_bottle', fact: 'Iodine stains starch and cell nuclei a dark brown — it makes the nucleus visible against the colourless cytoplasm.' },
        { id: 'onion_layer', name: 'Onion layer', icon: 'onion_layer', fact: 'You use the very thin inner layer of the onion — thin enough for light to pass through, so you can see the cells.' },
        { id: 'forceps', name: 'Forceps', icon: 'forceps', fact: 'Forceps let you handle the tissue without introducing oils and bacteria from your fingers onto the slide.' },
        { id: 'dropper', name: 'Dropper', icon: 'dropper', fact: 'You only need ONE drop of iodine — too much and it floods under the coverslip and obscures the cells.' },
      ],
    },
    methodology: {
      title: 'How do we do it?',
      gpsSkill: 'Follow instructions carefully',
      steps: [
        {
          text: 'Use the scalpel to cut a small square (about 1cm²) from an onion. Peel away a thin inner layer using the forceps.',
          character: 'Pip',
          line: 'The inner layers are more transparent than the outer ones — you want the thinnest piece you can get.',
        },
        {
          text: 'Place the onion layer flat onto the centre of the glass slide. Try to avoid wrinkles — a flat specimen gives a clearer image.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Add ONE drop of iodine solution directly onto the onion layer using the dropper.',
          character: 'Lili',
          line: 'The iodine will stain the nucleus dark so you can see it clearly. Without stain, the nucleus is almost invisible.',
        },
        {
          text: 'Lower the coverslip at an angle — touch one edge to the slide first, then slowly lower it down. This prevents air bubbles.',
          character: 'Lili',
          line: 'Air bubbles look like big round circles under the microscope and can be confused for cells. Avoid them!',
        },
        {
          text: 'Place the slide on the microscope stage and secure it with the stage clips. Start on the LOWEST power objective (×4).',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Use the COARSE focus knob to bring the cells into rough focus. Then use the FINE focus knob for a sharp image.',
          character: 'Pip',
          line: 'Coarse first, fine second — never the other way around on high power or you risk cracking the slide.',
        },
        {
          text: 'Switch to the ×10 objective for a more detailed view. Use only the fine focus knob from this point.',
          character: 'Pip',
          line: null,
        },
      ],
    },
    results: {
      title: 'What did we find?',
      gpsSkill: 'Record results in tables · Identify patterns',
      graphErrorText: 'Not quite — check the fact you just read and try again.',
    },
    theory: {
      title: 'Why does this happen?',
      layer1Character: 'lili',
      layer1Line:
        "Every living thing is made of cells — that's Cell Theory, one of the most important ideas in all of biology. Plant cells have some extra features that animal cells don't: a cell wall, a large permanent vacuole, and sometimes chloroplasts (though onion cells don't have those since they don't photosynthesise).",
      lumiDeepDive:
        'Plant cells have: cell wall (cellulose), cell membrane, nucleus (with DNA), cytoplasm, large permanent vacuole, mitochondria, and sometimes chloroplasts. Animal cells have: cell membrane, nucleus, cytoplasm, mitochondria — but NO cell wall, NO large permanent vacuole, and NO chloroplasts. The cell wall gives plant cells their fixed, regular rectangular shape.',
      gpsSkill: 'Write conclusions',
      cards: [
        {
          character: 'lili',
          front: 'Why did we add iodine to the onion cells?',
          back: 'Iodine is a stain — plant cell parts are almost see-through under a microscope. Iodine binds unevenly to different structures, especially the nucleus, making them show up much more clearly against the rest of the cell.',
        },
        {
          character: 'pip',
          front: 'Why does the cell wall give onion cells their neat brick-like shape?',
          back: "The cell wall is a rigid layer made of cellulose sitting outside the cell membrane. It's fixed and doesn't flex, which is exactly why plant cells look like neat regular bricks under a microscope, unlike squishier animal cells.",
        },
        {
          character: 'madu',
          front: "What's the vacuole actually FOR?",
          back: "The large central vacuole stores water and keeps pressure pushing outward against the cell wall — that pressure (turgor) is what keeps a plant's leaves and stems firm instead of wilting.",
        },
        {
          character: 'lumi',
          front: 'Go deeper: plant cells vs animal cells',
          back: 'Plant cells have a cell wall, a large permanent vacuole, and sometimes chloroplasts — animal cells have none of these. Both share a cell membrane, nucleus, cytoplasm, and mitochondria.',
        },
      ],
    },
    summary: {
      aim: {
        body: 'We wanted to observe the internal structure of a plant cell using a microscope — and identify the key organelles visible under light microscopy.',
        line: 'You are one of billions of people who have looked through a microscope and seen this for the first time.',
      },
      keyResult: {
        character: 'lili',
        body: 'The onion cells appeared rectangular and arranged in a regular grid pattern. Each cell showed a clearly visible cell wall, a cell membrane inside it, a large central vacuole, and a dark oval nucleus stained by the iodine solution.',
        line: 'Plant cell walls are what gives wood its strength — the same cellulose you saw today.',
      },
      pattern: {
        body: "The pattern in the cell diagram shows that plant cells have a fixed, regular shape (due to the cell wall) and that most of the cell's internal space is taken up by the vacuole — not the nucleus. This is consistent across all plant cells, which is why they make good microscopy subjects.",
        line: 'Every cell in that onion contains the same DNA. Identical instructions, billions of copies.',
      },
      keyPoints: {
        bullets: [
          'All plant cells have: cell wall, cell membrane, nucleus, cytoplasm, vacuole, mitochondria',
          'Cell wall is made of cellulose — gives the cell its rigid shape',
          'Iodine stains nuclei dark — makes them visible under the microscope',
          'Onion cells have NO chloroplasts — they do not photosynthesise',
          'Total magnification = eyepiece × objective lens',
        ],
        line: 'You prepared a slide from scratch and saw inside a living cell. Biologists spend careers doing this.',
      },
    },
    reflection: {
      title: 'Your turn to think',
      pipIntro: 'You prepared a slide from scratch, focused a microscope, and labelled real cell structures. That is proper practical biology.',
      prompts: [
        'Name two structures you saw in the onion cell that would NOT be found in an animal cell. Explain why each one is absent.',
        'Why was it important to use iodine stain? What would you have seen without it?',
      ],
      completeMessage: "DONE! You've completed Y7 Practical 4. Head back to the notebook to see your stamp!",
      gpsSkill: 'Suggest improvements to investigations',
    },
  },
  wetLabDialogue: {
    welcome: ["Microscopy is one of the most important skills in biology. Let's prepare a proper slide."],
    celebrate: ['Great work — that structure is correctly labelled!'],
    error: ['Look more carefully — which part is that label describing?'],
    fact: [
      "What you're seeing right now is about ×40 magnification. Onion cells are roughly 0.25mm long — you just made the invisible visible.",
    ],
    checkpoint: ['Slide prepared and mounted! Progress saved.'],
  },
};
