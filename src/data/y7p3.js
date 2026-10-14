export const y7p3 = {
  id: 'y7_2',
  title: 'Heating Substances Using a Bunsen Burner',
  subject: 'chemistry',
  year: 'y7',
  screens: {
    intro: {
      title: 'What are we investigating?',
      concept:
        'When substances are heated, they can change in two very different ways. A physical change alters the appearance of a substance but can be reversed. A chemical change creates an entirely new substance that cannot easily be changed back. Today we are going to heat copper sulfate crystals and work out which type of change heating causes.',
      analogy:
        'Madu: Blue copper sulfate is one of my favourite substances in the whole of chemistry — and what happens to it when you heat it is genuinely one of the most satisfying things you will ever see in a lab. Trust me.',
      gpsSkill: 'Make accurate observations',
    },
    riskAssessment: {
      title: 'Before we start — stay safe',
      pipIntro: "Every scientist checks safety before touching anything. Madu and Lili are going to walk you through this.",
      gpsSkill: 'Use equipment safely',
      hazards: [
        {
          id: 'naked_flame',
          name: 'Naked flame',
          subtitle: '',
          rule: 'Tie back long hair before lighting the Bunsen burner. Keep flammable materials away from the flame at all times.',
        },
        {
          id: 'hot_equipment',
          name: 'Hot equipment',
          subtitle: '',
          rule: 'Heated equipment looks exactly the same as cold equipment. Always wait at least 5 minutes before touching anything that has been heated.',
        },
        {
          id: 'copper_sulfate',
          name: 'Copper sulfate',
          subtitle: '',
          rule: 'Copper sulfate is harmful if swallowed and can irritate skin. Wear gloves and wash hands thoroughly after handling.',
        },
        {
          id: 'glass_equipment',
          name: 'Glass equipment',
          subtitle: '',
          rule: 'Heated glassware can crack if cooled too quickly. Place hot glassware on a heat-proof mat, not directly on the bench.',
        },
        {
          id: 'lighting_bunsen',
          name: 'Lighting the Bunsen',
          subtitle: '',
          rule: 'Always set the collar to the CLOSED position (safety flame) before lighting. Never leave a lit Bunsen unattended.',
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
          id: 'bunsen_burner',
          name: 'Bunsen burner',
          icon: 'bunsen_burner',
          fact: "Robert Bunsen didn't actually invent the Bunsen burner — his lab assistant Peter Desaga did. Bunsen improved it!",
        },
        {
          id: 'tripod',
          name: 'Tripod',
          icon: 'tripod',
          fact: 'The tripod distributes the weight of the evaporating dish evenly over the gauze.',
        },
        {
          id: 'gauze_mat',
          name: 'Gauze mat',
          icon: 'gauze_mat',
          fact: 'The ceramic centre of the gauze spreads heat evenly — without it the dish could crack from a concentrated hot spot.',
        },
        {
          id: 'evaporating_dish',
          name: 'Evaporating dish',
          icon: 'evaporating_dish',
          fact: 'Evaporating dishes are designed to withstand high temperatures — regular glass dishes would shatter.',
        },
        {
          id: 'heat_proof_mat',
          name: 'Heat-proof mat',
          icon: 'heat_proof_mat',
          fact: "Cork and ceramic mats are used because they don't conduct heat to the bench beneath.",
        },
        {
          id: 'safety_goggles',
          name: 'Safety goggles',
          icon: 'safety_goggles',
          fact: 'Copper sulfate can spit small particles when strongly heated — goggles protect your eyes.',
        },
        {
          id: 'spatula',
          name: 'Spatula',
          icon: 'spatula',
          fact: 'A spatula lets you transfer a small, controlled amount of crystals — precision matters even in seemingly simple steps.',
        },
      ],
    },
    methodology: {
      title: 'How do we do it?',
      gpsSkill: 'Follow instructions carefully',
      steps: [
        {
          text: 'Place the Bunsen burner on the heat-proof mat. Set up the tripod and gauze above it.',
          character: 'Lili',
          line: 'Check that the tripod is stable before placing anything on it.',
        },
        {
          text: 'Use the spatula to transfer a small amount of blue copper sulfate crystals into the evaporating dish. Place the dish on the gauze.',
          character: 'Madu',
          line: "Just a small amount — you don't need much for this reaction to be visible.",
        },
        {
          text: 'Put on your safety goggles. Set the Bunsen collar to CLOSED (safety flame) before lighting.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Light the Bunsen burner using a match or splint. Confirm the safety flame is burning (yellow).',
          character: 'Pip',
          line: 'Yellow flame = safety flame = closed collar. Blue flame = roaring flame = open collar. Never mix these up!',
        },
        {
          text: 'Open the collar to produce the roaring blue flame. Begin heating the copper sulfate.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Observe and record any changes to the appearance of the crystals. Note the colour, texture, and any other observations.',
          character: 'Madu',
          line: 'WATCH CAREFULLY. This is the good bit.',
        },
        {
          text: 'Once the colour change is complete, close the collar back to safety flame. Allow to cool completely before touching.',
          character: 'Pip',
          line: null,
        },
      ],
    },
    results: {
      title: 'What did we find?',
      gpsSkill: 'Record results in tables · Identify patterns',
      graphErrorText: "That property belongs somewhere else — think about whether it's reversible and whether a new substance formed.",
    },
    theory: {
      title: 'Why does this happen?',
      layer1Character: 'madu',
      layer1Line:
        "The blue colour in copper sulfate doesn't come from the copper or the sulfate — it comes from WATER molecules bonded inside the crystal! When you heat it, the water escapes as steam, and the blue disappears. Add water back — blue returns. That is a physical change: reversible, no new substance.",
      lumiDeepDive:
        'The full name is copper(II) sulfate pentahydrate: CuSO₄·5H₂O. The ·5H₂O indicates 5 molecules of water of crystallisation per formula unit. On heating: CuSO₄·5H₂O → CuSO₄ + 5H₂O. The anhydrous form (CuSO₄) is white. This reaction is used as a test for water — anhydrous copper sulfate turns blue in the presence of water.',
      gpsSkill: 'Write conclusions',
      cards: [
        {
          character: 'madu',
          front: 'Why did the blue crystals turn white when heated?',
          back: "The blue colour doesn't come from the copper or the sulfate — it comes from WATER molecules bonded inside the crystal! When you heat it, the water escapes as steam, and the blue disappears.",
        },
        {
          character: 'lili',
          front: 'Why did the white crystals turn blue again with water?',
          back: 'Because nothing was permanently destroyed — the water molecules just left and came back. That reversibility is the biggest clue that this is a physical change, not a chemical one.',
        },
        {
          character: 'pip',
          front: 'Why did we need to close the collar before lighting the burner?',
          back: 'A closed collar gives a yellow "safety" flame — cooler, visible, and safe to leave burning. Only once it\'s lit safely do you open the collar for the hot roaring blue flame you actually heat with.',
        },
        {
          character: 'lumi',
          front: 'Go deeper: what is the actual chemical formula?',
          back: 'The full name is copper(II) sulfate pentahydrate: CuSO₄·5H₂O. On heating: CuSO₄·5H₂O → CuSO₄ + 5H₂O. This reaction is even used as a test for water — anhydrous copper sulfate turns blue in its presence.',
        },
      ],
    },
    summary: {
      aim: {
        body: 'We wanted to find out what happens to copper sulfate crystals when they are heated — and whether the change is physical or chemical.',
        line: 'You just used chemistry to reveal something hidden inside a crystal.',
      },
      keyResult: {
        character: 'madu',
        body: 'The blue copper sulfate crystals turned white when heated. Steam was produced during heating. When water was added to the white crystals, they turned blue again. This reversal confirms the change was physical, not chemical.',
        line: 'This same test — adding anhydrous copper sulfate — is used in chemistry labs to detect water in unknown substances.',
      },
      pattern: {
        body: 'The fact that the reaction was reversible is the key pattern. Reversibility is the defining feature of a physical change — no new substance was permanently formed. The pattern: colour disappeared when water left, colour returned when water came back.',
        line: 'CuSO₄·5H₂O → CuSO₄ + 5H₂O. Five water molecules, trapped in a crystal. Heat set them free.',
      },
      keyPoints: {
        bullets: [
          'Copper sulfate crystals are blue because they contain water molecules',
          'Heating drives off the water — crystals turn white',
          'Adding water reverses the change — crystals turn blue again',
          'This is a PHYSICAL change: reversible, no new substance formed',
          'Anhydrous copper sulfate is used as a test for water',
        ],
        line: "You reversed a chemical reaction with a drop of water and proved it was physical. That's detective science.",
      },
    },
    reflection: {
      title: 'Your turn to think',
      pipIntro:
        'You heated a blue solid and watched it turn white, then you added water and watched it turn blue again. You just proved a reversible physical change with your own hands.',
      prompts: [
        'Was heating copper sulfate a physical or chemical change? What evidence from your experiment supports your answer?',
        'Suggest one way you could use anhydrous copper sulfate as a scientific test — what would you test for, and how?',
      ],
      completeMessage: "DONE! You've completed Y7 Practical 3. Head back to the notebook to see your stamp!",
      gpsSkill: 'Suggest improvements to investigations',
    },
  },
  wetLabDialogue: {
    welcome: ['Welcome to the best experiment in Y7 chemistry. Get your goggles ready.'],
    celebrate: ['Recorded! Great observation work.'],
    error: ['Check the safety steps before continuing.'],
    fact: [
      'The formula for blue copper sulfate is CuSO₄·5H₂O — the ·5H₂O means 5 water molecules are trapped in every formula unit. Heating drives them out.',
    ],
    checkpoint: ['Progress saved! You can come back to this whenever you need.'],
  },
};
