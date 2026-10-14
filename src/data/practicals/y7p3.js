// Y7 P3 — Heating Substances Using a Bunsen Burner: dehydrating copper
// sulfate crystals. Written directly in the native checkpoint/subStep
// shape (no legacy adapter needed) — six checkpoints: Safety, Setup, Light
// the Bunsen, Heat, Observe, Understand.

export const y7p3 = {
  id: 'y7_p3',
  title: 'Heating Substances Using a Bunsen Burner',
  subject: 'chemistry',
  year: 'y7',
  character: 'madu',

  evaluation: { goldThreshold: 90, silverThreshold: 70, bronzeThreshold: 50 },

  checkpoints: [
    {
      id: 'safety',
      name: 'Safety',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_safety',
          iconType: 'hazard',
          title: 'Safety Check',
          instruction: 'Tap each hazard card before we begin.',
          type: 'tap',
          parameters: {
            targets: [
              { id: 'naked_flame', label: 'Naked Flame', rule: 'Tie back hair and loose clothing. Never leave a lit burner unattended.' },
              { id: 'hot_equipment', label: 'Hot Equipment', rule: 'The gauze and dish get very hot. Never touch them right after heating.' },
              { id: 'eye_protection', label: 'Eye Protection', rule: 'Wear safety goggles the whole time the burner is lit.' },
            ],
            requiredTaps: 3,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lili',
          feedback: { success: "Safety checks done. Let's set up the apparatus.", failure: 'Tap every hazard card.' },
        },
      ],
    },
    {
      id: 'setup',
      name: 'Setup',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_place_mat',
          iconType: 'drag',
          title: 'Place the Heat-Proof Mat',
          instruction: 'Drag the heat-proof mat onto the bench, first.',
          type: 'drag',
          parameters: {
            objectId: 'heat_mat_3d',
            stack: 'mat', // lands exactly where the stack draws the mat
            hints: ['The heat-proof mat protects the bench. The burner gets very hot, and without the mat it could scorch or crack the bench, and a spilled solution would be harder to clean up.'],
            noTip: true, // the hint says why this piece matters, so no "Tip:" repeating the instruction
            fromZone: { x: 50, y: 24, w: 100, h: 60 },
            toZone: { x: 45, y: 80, w: 120, h: 60 },
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: 'The mat protects the bench. Now the Bunsen burner goes on top of it.', failure: 'Drag the mat onto the bench.' },
        },
        {
          id: 'p3_place_bunsen',
          iconType: 'drag',
          title: 'Place the Bunsen Burner',
          instruction: 'Drag the Bunsen burner onto the bench.',
          type: 'drag',
          parameters: {
            objectId: 'bunsen_burner_3d',
            stack: 'burner', // on the middle of the mat
            hints: ['The Bunsen burner is our heat source. The rubber tube on its base connects it to the gas tap, so gas can flow in and burn. Always check the tube is on tight before you light it.'],
            noTip: true, // the hint says why this piece matters, so no "Tip:" repeating the instruction
            fromZone: { x: 14, y: 46, w: 80, h: 100 },
            toZone: { x: 45, y: 78, w: 80, h: 100 },
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: 'Burner in place. Now the tripod goes over it.', failure: 'Drag the burner onto the bench.' },
        },
        {
          id: 'p3_place_tripod',
          iconType: 'drag',
          title: 'Place the Tripod',
          instruction: 'Drag the tripod so it stands over the burner.',
          type: 'drag',
          parameters: {
            objectId: 'tripod_3d',
            stack: 'tripod', // straddling the burner
            hints: ['The tripod holds everything steady, above the flame. Its three legs stand around the burner so nothing can wobble or tip over, and its ring holds the gauze at the right height.'],
            noTip: true, // the hint says why this piece matters, so no "Tip:" repeating the instruction
            fromZone: { x: 85, y: 46, w: 90, h: 90 },
            toZone: { x: 45, y: 55, w: 100, h: 90 },
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: 'Tripod steady. Next, the gauze goes on the ring.', failure: 'Drag the tripod over the burner.' },
        },
        {
          id: 'p3_place_gauze',
          iconType: 'drag',
          title: 'Place the Gauze',
          instruction: "Drag the gauze onto the tripod's ring.",
          type: 'drag',
          parameters: {
            objectId: 'gauze_3d',
            stack: 'gauze', // on the tripod's ring
            hints: ["The wire gauze sits on the tripod\'s ring and spreads the flame\'s heat out evenly. Without it, one hot spot could crack the dish."],
            noTip: true, // the hint says why this piece matters, so no "Tip:" repeating the instruction
            fromZone: { x: 85, y: 28, w: 80, h: 50 },
            toZone: { x: 45, y: 40, w: 80, h: 50 },
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: 'Gauze spreads the heat evenly. Now the dish.', failure: 'Drag the gauze onto the ring.' },
        },
        {
          id: 'p3_place_dish',
          iconType: 'drag',
          title: 'Place the Evaporating Dish',
          instruction: 'Drag the dish of copper sulfate solution onto the gauze.',
          type: 'drag',
          parameters: {
            objectId: 'evaporating_dish_3d',
            stack: 'dish', // on the gauze
            hints: ['The evaporating dish holds the blue copper sulfate solution, the material we are going to heat. It is made of ceramic, which can take the heat while the water evaporates away.'],
            noTip: true, // the hint says why this piece matters, so no "Tip:" repeating the instruction
            fromZone: { x: 85, y: 28, w: 70, h: 40 },
            toZone: { x: 45, y: 28, w: 70, h: 40 },
            snapDistance: 80,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: "Apparatus built. Before we light it for real, let's compare the two flame types.", failure: 'Drag the dish onto the gauze.' },
        },
      ],
    },
    {
      id: 'flame_types',
      name: 'Flame Types',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_flame_types',
          iconType: 'flame',
          title: 'Yellow vs Blue',
          instruction: 'Tap the collar and zoom in, then twist the collar hole open and closed and watch the flame change.',
          type: 'flame_education',
          parameters: { timeLimit: 30 },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
          character: 'madu',
          feedback: {
            success: "Now you know why we use the blue flame for heating.",
            failure: 'Open and close the collar to see both flames.',
          },
        },
      ],
    },
    {
      id: 'light_bunsen',
      name: 'Light the Bunsen',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_light',
          iconType: 'flame',
          title: 'Light the Bunsen Burner',
          instruction: 'Strike the match, turn on the gas, light the barrel, then open the collar.',
          type: 'light_bunsen',
          parameters: { timeLimit: 30 },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
          character: 'madu',
          feedback: {
            success: 'Blue flame, that means it\'s burning cleanly and hot enough to heat the dish.',
            failure: 'Strike the match fast, then turn the gas on and light the barrel before it burns out.',
          },
        },
      ],
    },
    {
      id: 'heat',
      name: 'Heat',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_heat',
          iconType: 'flame',
          title: 'Heat the Copper Sulfate',
          instruction: 'Press the clock and watch closely as the solution heats. Tap the dish any time to zoom in.',
          type: 'heat_observe',
          parameters: { timeLimit: 20 },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: 'The water has boiled off, the crystals are turning white.', failure: 'Keep watching closely until the dish is fully heated.' },
        },
      ],
    },
    {
      id: 'reverse',
      name: 'Reverse It',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_reverse',
          iconType: 'pull',
          title: 'Add Water Back',
          instruction: 'Draw up water and squeeze 3 drops onto the white crystals.',
          type: 'reverse_reaction',
          parameters: { timeLimit: 20 },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'madu',
          feedback: { success: "IT'S BLUE AGAIN! Reversible. Physical change confirmed!", failure: 'Squeeze drops above the dish.' },
        },
      ],
    },
    {
      id: 'understand',
      name: 'Understand',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p3_understand',
          iconType: 'notepad',
          title: 'What Does It Mean?',
          instruction: 'Read each slide to understand the experiment.',
          type: 'tap',
          parameters: {
            targets: [
              { id: 'setup', label: 'Setting Up the Bunsen Burner', content: "First the heat-proof mat goes down to protect the bench. The Bunsen burner sits on the mat, joined to the gas tap by a rubber tube. The tripod stands over the burner and holds the wire gauze, which spreads the heat out evenly. The dish of solution sits on the gauze. Always check that the tube is on tight and the collar is closed before you light the match." },
              { id: 'flames', label: 'Why the Flame Type Matters', content: "The collar on the burner lets air into the barrel, and air contains oxygen. With the collar closed, no extra oxygen gets in, so you get the yellow safety flame. It is cooler, easy to see, and used for lighting. With the collar open, the most oxygen gets in and you get the blue roaring flame. It is much hotter and leaves no soot, so it is the one we use for heating." },
              { id: 'observe', label: 'Observing Physical Changes', content: "To observe a change, look carefully and write down what you see. Check the colour, whether it is a solid, a liquid or a gas, and whether anything is given off, like steam. In the dish, the water left as steam and the blue solution became a white powder solid. Changes like this, where the substance can be got back again, are physical changes. Ice melting and water boiling are physical changes too." },
              { id: 'reversible', label: 'Reversible Changes', content: "Physical changes can be reversed. Melted ice can be frozen again, and when we added water to the white powder it turned blue again. Chemical changes cannot be reversed. When wood burns it turns into ash, smoke and gases, and you can never turn it back into wood. So if you can get the original substance back, it is a physical change. If you cannot, it is a chemical change." },
            ],
            requiredTaps: 4,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'madu',
          feedback: { success: 'You understood the chemistry. That\'s the whole point.', failure: 'Tap every card.' },
        },
      ],
    },
  ],

  unlocks: ['y7_p4'],
};

export default y7p3;
