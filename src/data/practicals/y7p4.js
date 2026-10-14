// Y7 P4 — Using a Microscope: Observing Cheek Cells. Native checkpoint
// format: Safety, Slide Prep, Microscope Loading, Meet the Microscope, Focusing, Labelling,
// Understand.

export const y7p4 = {
  id: 'y7_p4',
  title: 'Using a Microscope: Observing Cheek Cells',
  subject: 'biology',
  year: 'y7',
  character: 'pip',

  evaluation: { goldThreshold: 90, silverThreshold: 70, bronzeThreshold: 50 },

  checkpoints: [
    {
      id: 'safety',
      name: 'Safety',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_safety',
          iconType: 'hazard',
          title: 'Safety Check',
          instruction: 'Tap each hazard card before we begin.',
          type: 'tap',
          parameters: {
            showCharacters: false, // plain hazard cards, no characters perched on them
            targets: [
              { id: 'own_swab', label: 'Your Own Swab', rule: 'Only ever use your own clean swab and never share it, germs pass easily from one person to another.' },
              { id: 'glass_slide', label: 'Glass Slide', rule: 'Handle slides and coverslips by the edges, they chip and cut easily.' },
              { id: 'stain', label: 'Methylene Blue Stain', rule: 'The stain marks skin and clothes, use only one drop and wash your hands afterwards.' },
            ],
            requiredTaps: 3,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lili',
          feedback: { success: "Safety checks done. First, let's collect a sample.", failure: 'Tap every hazard card.' },
        },
      ],
    },
    {
      // Fix 9 — Pip's most personal moment: the actual cell sample for
      // the rest of this practical comes from his cheek, not a jar.
      id: 'collect_cells',
      name: 'Collect Cells',
      isSavePoint: true,
      character: 'pip',
      subSteps: [
        {
          id: 'p4_swab_pip_cheek',
          iconType: 'draw_swab',
          title: "Swab Pip's Cheek",
          instruction: 'Gently rub the cotton swab against Pip’s cheek to collect some cells. Use a small circular motion.',
          type: 'draw_swab',
          parameters: {
            mode: 'cheek_swab',
            hints: ['Cheek cells are collected with a clean cotton swab, rubbed gently on the inside of the cheek, because the cells there come off easily and it does not hurt. Use a fresh swab for each person and never share one.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
          character: 'pip',
          feedback: { success: 'Sample collected, those are your cells, ready to look at.', failure: 'Drag the swab up to the highlighted spot on his cheek.' },
        },
      ],
    },
    {
      id: 'slide_prep',
      name: 'Slide Prep',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_place_slide',
          iconType: 'drag',
          title: 'Pick Up a Slide',
          instruction: 'Drag a clean glass slide onto the bench.',
          type: 'drag',
          parameters: {
            objectId: 'slide_3d',
            layout: 'microscope',
            stack: 'slide_bench', // laid in the middle of the bench, in front of you
            fromZone: { x: 18, y: 28, w: 70, h: 30 },
            toZone: { x: 50, y: 62, w: 70, h: 30 },
            hints: ['A glass slide holds the sample flat and thin, so light can shine through it. Always hold it by the edges, so you do not smudge it or cut your fingers.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'pip',
          feedback: { success: 'Slide ready. Now smear on your cheek cells and add a drop of stain.', failure: 'Drag the slide onto the bench.' },
        },
        {
          id: 'p4_smear_swab',
          iconType: 'draw_swab',
          title: 'Smear the Sample',
          instruction: 'Drag the swab back and forth across the slide to smear your cheek cells onto it.',
          type: 'draw_swab',
          parameters: {
            mode: 'surface_smear',
            hints: ['Smearing a thin layer spreads the cells out so they do not pile up on top of each other, which lets light pass through. The used swab goes straight into disinfectant so germs are not spread.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lili',
          feedback: { success: 'Gentle, a thin layer is best. Now stain it so we can see the structures.', failure: 'Drag the swab back and forth across the slide.' },
        },
        {
          id: 'p4_stain_slide',
          iconType: 'pull',
          title: 'Add the Stain',
          instruction: 'Draw up the stain and squeeze one drop onto the smear.',
          type: 'stain_slide',
          parameters: {
            hints: ['Cheek cells are almost see-through. The stain soaks into them and makes the nucleus and the cytoplasm stand out. One drop is enough, because the stain marks skin and clothes.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lili',
          feedback: { success: 'The stain makes the cell structures visible under the microscope.', failure: 'Squeeze one drop above the slide.' },
        },
        {
          id: 'p4_add_coverslip',
          iconType: 'angle',
          title: 'Add the Coverslip',
          instruction: 'Lower the coverslip at the right angle, too steep or too flat traps air bubbles.',
          type: 'coverslip',
          parameters: {
            hints: ['The coverslip flattens the sample and protects the lens. Lower it slowly at an angle, so air bubbles do not get trapped, because bubbles can look like cells and spoil the view.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'pip',
          feedback: { success: 'Slide prepared! Time to load it onto the microscope.', failure: 'Angle the coverslip into the green zone before lowering.' },
        },
      ],
    },
    {
      id: 'microscope_loading',
      name: 'Microscope Loading',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_place_microscope',
          iconType: 'drag',
          title: 'Set Up the Microscope',
          instruction: 'Drag the microscope onto the bench.',
          type: 'drag',
          parameters: {
            objectId: 'microscope_3d',
            layout: 'microscope',
            stack: 'microscope', // in the middle of the bench
            fromZone: { x: 85, y: 46, w: 100, h: 130 },
            toZone: { x: 50, y: 55, w: 100, h: 130 },
            hints: ['The microscope makes tiny things look much bigger, so we can see cells that are far too small for our eyes. Put it on a flat, steady bench, and always carry it with two hands.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            snapDistance: 90,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'pip',
          feedback: { success: 'Microscope set up. Now load your slide onto the stage.', failure: 'Drag the microscope onto the bench.' },
        },
        {
          id: 'p4_load_slide',
          iconType: 'drag',
          title: 'Load the Slide',
          instruction: 'Drag your prepared slide onto the microscope stage.',
          type: 'drag',
          parameters: {
            objectId: 'slide_3d_prepared',
            layout: 'microscope',
            stack: 'slide', // on the microscope's stage
            fromZone: { x: 14, y: 50, w: 70, h: 30 },
            toZone: { x: 50, y: 78, w: 70, h: 30 },
            hints: ['The slide goes flat on the stage, under the clips, so it cannot slip. Light shines up from below through your sample, and the lenses above magnify it.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            snapDistance: 70,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'pip',
          feedback: { success: 'Slide loaded and clipped in place. Now set the lens and the light.', failure: 'Drag the slide onto the stage.' },
        },
      ],
    },
    {
      id: 'microscope_explore',
      name: 'Meet the Microscope',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_microscope_explore',
          iconType: 'magnifier',
          title: 'Explore the Microscope',
          instruction: 'Spin the microscope and tap each part to find out what it does.',
          type: 'microscope_explore',
          parameters: {
            hints: [
              'A microscope makes tiny things look much bigger, so we can see cells that are far too small for our eyes. Drag to spin it, scroll or pinch to zoom, and tap any part to learn about it.',
              'Light shines up from the lamp, through your slide on the stage, and into the lenses. The lenses bend the light to make the picture bigger.',
              'To find the total magnification, multiply the eyepiece by the objective lens. The eyepiece is ×10, so the ×4 lens gives ×40, the ×10 lens gives ×100 and the ×40 lens gives ×400.',
              'When you have explored every part, press Complete and we will use the microscope for real.',
            ],
            noTip: true, // the hints already say what to do
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lili',
          feedback: { success: 'Now you know every part! Time to use the microscope for real.', failure: 'Tap the parts to explore them, then press Complete.' },
        },
      ],
    },
    {
      id: 'microscope_stage',
      name: 'At the Microscope',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_microscope_stage',
          iconType: 'scroll_knob',
          title: 'Find the Cells',
          instruction: 'Turn on the light, select each lens in turn, focus, and centre a cell.',
          type: 'microscope_stage',
          parameters: {
            hints: ['Start with the lowest-power lens to find the cells, then move to a stronger lens and use the focus to make the picture sharp. Never wind the lens down while looking through the eyepiece, because it could hit the slide.'],
            noTip: true, // the hint says why this step matters, so no "Tip:" repeating the instruction
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lili',
          feedback: {
            success: "There they are! Pip's cheek cells, stained blue so we can see the structures.",
            failure: 'Work through each control in order: light, lens, focus, stage.',
          },
        },
      ],
    },
    {
      id: 'labelling',
      name: 'Labelling',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_label',
          iconType: 'notepad',
          title: 'Label the Cell',
          instruction: 'Turn each page to label the parts of your cheek cell.',
          type: 'tap',
          parameters: {
            scrapbook: true, // shown as a scrapbook, one page for each part of the cell
            targets: [
              { id: 'cell_membrane', label: 'Cell Membrane', content: "The cell membrane is the thin skin around the cell. It is soft and bendy, so the edge of a cheek cell looks rounded and a bit wobbly. It also decides what can go in and out of the cell." },
              { id: 'nucleus', label: 'Nucleus', content: "The nucleus is the dark blue dot in the middle. It is the control centre of the cell. It holds the instructions that tell the cell how to work and how to make new cells." },
              { id: 'cytoplasm', label: 'Cytoplasm', content: "The cytoplasm is the pale blue jelly that fills the cell. Most of the cell's jobs happen here. The stain made it blue so you could see it." },
              { id: 'no_wall', label: 'No Cell Wall', content: "Look at the edge of your cell. There is no hard cell wall, only the soft membrane. Plant cells do have a cell wall. That is how we know these are animal cells." },
            ],
            requiredTaps: 4,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'pip',
          feedback: { success: 'Every part labelled correctly!', failure: 'Tap every part of the cell.' },
        },
        // Bonus rapid-fire knowledge check (Prompt 3) — straight after
        // labelling, while it's fresh; distinct from the later "understand"
        // flashcards, which are untimed and explanatory rather than scored.
        {
          id: 'p4_cell_quiz',
          iconType: 'notepad',
          title: 'Quick Quiz',
          instruction: 'Rapid-fire! Answer before the timer runs out.',
          type: 'cell_quiz',
          parameters: {
            questions: [
              { question: 'What controls what enters the cell?', options: ['Cell wall', 'Cell membrane', 'Nucleus'], correct: 'Cell membrane' },
              { question: "What would NOT be found in Pip's cheek cells?", options: ['Nucleus', 'Cell wall', 'Cytoplasm'], correct: 'Cell wall' },
              { question: 'Why is iodine used?', options: ['It adds colour', 'It stains the nucleus to make it visible', 'It kills bacteria'], correct: 'It stains the nucleus to make it visible' },
            ],
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 0.5, passThreshold: 0 },
          character: 'lili',
          feedback: { success: 'Quiz complete!', failure: 'Quiz complete!' },
        },
      ],
    },
    {
      id: 'understand',
      name: 'Understand',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p4_understand',
          iconType: 'notepad',
          title: 'What Does It Mean?',
          instruction: 'Read each slide to understand what you did and saw.',
          type: 'tap',
          parameters: {
            targets: [
              { id: 'collect', label: 'Collecting Animal Cells Safely', content: "Cheek cells are a safe, easy way to see animal cells. Rub a clean cotton swab gently on the inside of your cheek. Always use your own fresh swab and never share one, because germs can pass between people. Once you have smeared the sample on the slide, put the swab straight into disinfectant and wash your hands. Hold glass slides by the edges so they do not cut you." },
              { id: 'microscope', label: 'Using a Microscope', content: "Put the microscope on a flat bench and switch on the light. Start with the lowest-power lens and use the focus knob to make the picture sharp. Then move to a stronger lens to see more detail, and focus again. Always carry the microscope with two hands, and let the light cool down before you pack it away." },
              { id: 'identify', label: 'What We Can See', content: "A microscope lets you see the shape and the parts of a cell. In stained cheek cells you can see a dark blue nucleus in the middle, paler blue cytoplasm around it, and a thin cell membrane at the edge. The stain is needed because cheek cells are almost see-through. Some parts, like mitochondria, are too tiny to see with a school microscope." },
              { id: 'plant_animal', label: 'Animal vs Plant Cells', content: "Let's compare! Animal cells and plant cells both have a nucleus, cytoplasm and a cell membrane. Only plant cells also have a cell wall, a big vacuole and chloroplasts. The cell wall gives plant cells a neat, fixed shape, while animal cells, like your cheek cells, look rounder and less regular. Chloroplasts let plants make food using light, and animal cells never have them." },
            ],
            requiredTaps: 4,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lili',
          feedback: { success: "You understood the biology. That's the whole point.", failure: 'Tap every card.' },
        },
      ],
    },
  ],

  unlocks: ['y7_p5'],
};

export default y7p4;
