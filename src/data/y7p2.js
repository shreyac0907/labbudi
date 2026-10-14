export const y7p2 = {
  id: 'y7_1',
  title: 'Measuring Force on a Ramp',
  subject: 'physics',
  year: 'y7',
  screens: {
    intro: {
      title: 'What are we investigating?',
      concept:
        'When you push something up a slope, the steeper the slope, the harder it feels. But is that just your muscles telling you that, or can we actually measure it? Today we are going to use a Newton meter to measure the force needed to pull a block up a ramp at five different angles — and find out whether the pattern matches what physics predicts.',
      analogy:
        "Lumi: A ramp is a simple machine. It lets you move something to a higher position using less force — but over a longer distance. The trade-off is always the same in physics: you never get something for nothing.",
      gpsSkill: 'Make accurate observations',
    },
    riskAssessment: {
      title: 'Before we start — stay safe',
      pipIntro: "Every scientist checks safety before touching anything. Lumi's going to walk you through this.",
      gpsSkill: 'Use equipment safely',
      hazards: [
        {
          id: 'falling_masses',
          name: 'Falling masses',
          subtitle: 'block & hanger',
          rule: 'Stand clear below the block and mass hanger. Never lean over the apparatus while masses are attached.',
        },
        {
          id: 'sharp_edges',
          name: 'Sharp edges',
          subtitle: 'ramp & stand',
          rule: 'The ramp edge and clamp stand can be sharp. Handle carefully and do not run fingers along edges.',
        },
        {
          id: 'stand_stability',
          name: 'Clamp stand stability',
          subtitle: '',
          rule: 'Ensure the clamp stand is firmly secured to the bench before attaching the Newton meter. An unstable stand can topple.',
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
          id: 'ramp',
          name: 'Ramp',
          icon: 'ramp',
          fact: 'Ramps are one of the six classical simple machines — humans have used them since the pyramids!',
        },
        {
          id: 'block',
          name: 'Block',
          icon: 'block',
          fact: 'The hook on the block lets us attach the Newton meter so we can measure the pulling force.',
        },
        {
          id: 'newton_meter',
          name: 'Newton meter',
          icon: 'newton_meter',
          fact: 'Named after Isaac Newton — who also had a famous encounter with a falling apple.',
        },
        {
          id: 'clamp_stand',
          name: 'Clamp stand',
          icon: 'clamp_stand',
          fact: 'The clamp stand keeps the Newton meter vertical so we get an accurate reading.',
        },
        {
          id: 'string',
          name: 'String',
          icon: 'string',
          fact: 'String transmits force without adding significant weight of its own.',
        },
      ],
    },
    methodology: {
      title: 'How do we do it?',
      gpsSkill: 'Follow instructions carefully',
      steps: [
        {
          text: 'Set up the ramp at 0° (flat on the bench). Attach the block to the Newton meter using the string.',
          character: 'Lumi',
          line: 'Starting at 0° gives us a baseline — the force at flat tells us how much friction alone contributes.',
        },
        {
          text: 'Hold the Newton meter vertically and pull the block along the ramp at a slow, constant speed. Read the force in Newtons.',
          character: 'Pip',
          line: 'Constant speed is the key — if you accelerate, the reading jumps. Take it slowly!',
        },
        {
          text: 'Record the angle and force reading in your results table.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Increase the ramp angle to 15°. Repeat the pull and record the new reading.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Repeat for 30°, 45°, and 60°. Record each reading carefully.',
          character: 'Lumi',
          line: 'Five data points will let us see a clear pattern — always collect more than two points before drawing conclusions.',
        },
        {
          text: 'Once all five readings are recorded, you will plot them on a graph of Force vs Angle.',
          character: 'Pip',
          line: null,
        },
      ],
    },
    results: {
      title: 'What did we find?',
      gpsSkill: 'Record results in tables · Draw simple graphs · Identify patterns',
      graphErrorText: 'Check your results table — what force did you record at that angle?',
    },
    theory: {
      title: 'Why does this happen?',
      layer1Character: 'pip',
      layer1Line:
        "The steeper the ramp, the more force you need. But a ramp still helps — you'd need even more force to lift the block straight up! That's why ramps are called a simple machine — they make work easier.",
      lumiDeepDive:
        'The force along the ramp equals the component of gravity acting parallel to the surface: F = mg×sin(θ). At 30°, sin(30°) = 0.5, so you only need half the block\'s weight. The ramp resolves the weight vector into two components — one along the slope, one perpendicular to it.',
      gpsSkill: 'Write conclusions',
      cards: [
        {
          character: 'pip',
          front: 'Why does force go UP as the ramp gets steeper?',
          back: "The steeper the ramp, the more force you need. But a ramp still helps — you'd need even more force to lift the block straight up! That's why ramps are called a simple machine — they make work easier.",
        },
        {
          character: 'lumi',
          front: 'What is actually happening with the maths?',
          back: 'The force along the ramp equals the component of gravity acting parallel to the surface: F = mg×sin(θ). At 30°, sin(30°) = 0.5, so you only need half the block\'s weight!',
        },
        {
          character: 'lili',
          front: 'Why did we measure at FIVE different angles, not just one?',
          back: "One reading could be a fluke. Five points let you see a real pattern — and a pattern is what lets you predict what would happen at an angle you never even tested!",
        },
      ],
    },
    summary: {
      aim: {
        body: 'We wanted to find out how the angle of a ramp affects the force needed to pull a block up it. We measured the pulling force in Newtons at five different angles.',
        line: 'Simple machines are in everything — ramps, screws, wedges. You just measured one.',
      },
      keyResult: {
        character: 'lumi',
        body: 'The force required increased as the angle increased — from 0.0N at 0° to 4.3N at 60°. The relationship was not linear but curved, following the pattern F = mg×sin(θ). The ramp reduces the force needed compared to lifting the block straight up (which would require the full 5N).',
        line: 'Engineers use this exact calculation when designing access ramps for wheelchair users.',
      },
      pattern: {
        body: 'The graph shows a positive correlation between angle and force — as angle increases, force increases. The curve is not straight because the relationship involves sine, not a simple multiplier. The ramp reduces effort but increases distance — this is the conservation of energy: you cannot get more work out than you put in.',
        line: 'At exactly 90°, the force would equal the full weight of the block. The ramp has become useless as a machine.',
      },
      keyPoints: {
        bullets: [
          'Ramps are simple machines that reduce the force needed to move objects',
          'The steeper the angle, the greater the force required',
          'Force along a ramp = mg × sin(θ)',
          'A ramp at 0° requires no pulling force (only friction)',
          'At 90°, the ramp offers no advantage — you need the full weight force',
        ],
        line: "You measured a force-angle relationship and saw physics behave exactly as predicted. That's experimental physics.",
      },
    },
    reflection: {
      title: 'Your turn to think',
      pipIntro:
        "You just collected five measurements, spotted a pattern, and plotted a graph. That's a complete scientific investigation. Brilliant. Now, one last thing from me...",
      prompts: [
        'What happened to the force as the angle increased? Describe the pattern in your own words.',
        'How could you make this investigation more accurate? Think about what was hard to control.',
      ],
      completeMessage: "DONE! You've completed Y7 Practical 2. Head back to the notebook to see your stamp!",
      gpsSkill: 'Suggest improvements to investigations',
    },
  },
  wetLabDialogue: {
    welcome: ["Let's measure how force changes with angle. Drag the slider and watch the Newton meter respond."],
    celebrate: ['Recorded! One more data point on the way to a pattern!'],
    error: ['Set the angle first using the slider, then read the Newton meter before recording.'],
    fact: [
      'See how the force went up? Physics is literally working in front of you right now!',
      'At 90° — straight up — the force would equal the full weight of the block. The ramp lets us spread that effort over a longer distance.',
    ],
    checkpoint: ["Checkpoint saved! You're more than halfway through your measurements."],
  },
};
