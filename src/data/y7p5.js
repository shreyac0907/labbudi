export const y7p5 = {
  id: 'y7_4',
  title: 'Building Simple Circuits',
  subject: 'physics',
  year: 'y7',
  screens: {
    intro: {
      title: 'What are we investigating?',
      concept:
        'Electricity flows through circuits — closed loops of conducting material. By building circuits with different components, we can control how electricity flows and what it does. Today we are going to build three progressively more complex circuits and measure current and voltage using an ammeter and voltmeter.',
      analogy:
        'Lumi: Current is the flow of electrons. Voltage is the push driving them. Resistance is what slows them down. Everything in electronics — from your phone to a power station — runs on those three ideas.',
      gpsSkill: 'Follow instructions carefully',
    },
    riskAssessment: {
      title: 'Before we start — stay safe',
      pipIntro: "Every scientist checks safety before touching anything. Lumi's going to walk you through this.",
      gpsSkill: 'Use equipment safely',
      hazards: [
        {
          id: 'short_circuits',
          name: 'Short circuits',
          subtitle: '',
          rule: 'Never connect a wire directly across the battery terminals without any component in between. This causes a short circuit — the wire gets extremely hot very quickly.',
        },
        {
          id: 'low_voltage',
          name: 'Low voltage only',
          subtitle: '',
          rule: 'Only use the cells and batteries provided. Never use mains electricity. The voltages in this practical are safe — mains electricity is not.',
        },
        {
          id: 'component_handling',
          name: 'Component handling',
          subtitle: '',
          rule: 'Check all connections are secure before closing the switch. Loose connections can cause sparks at higher voltages.',
        },
      ],
    },
    equipment: {
      title: 'What do we need?',
      gpsSkill: 'Follow instructions carefully',
      introText: "Drag each item over to its name — I'll tell you something cool when you get it right!",
      wrongMatchText: 'Not quite — have another look!',
      items: [
        { id: 'circuit_battery', name: 'Battery', icon: 'circuit_battery', fact: 'A single cell produces about 1.5V. Connecting cells in series adds their voltages — that\'s why a 9V battery contains 6 cells inside.' },
        { id: 'circuit_bulb', name: 'Bulb', icon: 'circuit_bulb', fact: 'The filament in an old-style bulb reaches 2,500°C — which is why it glows. LEDs produce light differently and are far more efficient.' },
        { id: 'circuit_switch_open', name: 'Switch', icon: 'circuit_switch_open', fact: 'A switch works by creating or breaking a gap in the circuit. Open gap = no current. Closed gap = current flows.' },
        { id: 'circuit_ammeter', name: 'Ammeter', icon: 'circuit_ammeter', fact: 'An ammeter must be connected in SERIES — in line with the circuit — so all the current flows through it.' },
        { id: 'circuit_voltmeter', name: 'Voltmeter', icon: 'circuit_voltmeter', fact: 'A voltmeter must be connected in PARALLEL — across a component — so it measures the potential difference across that component.' },
        { id: 'circuit_motor', name: 'Motor', icon: 'circuit_motor', fact: 'An electric motor converts electrical energy into kinetic energy — the reverse of what a generator does.' },
        { id: 'wires', name: 'Wires', icon: 'wires', fact: 'Copper is used for connecting wires because it has very low electrical resistance — electrons pass through it almost unimpeded.' },
        { id: 'circuit_mat', name: 'Circuit mat', icon: 'circuit_mat', fact: 'The mat keeps components in place and protects the bench surface.' },
      ],
    },
    methodology: {
      title: 'How do we do it?',
      gpsSkill: 'Follow instructions carefully',
      steps: [
        {
          text: 'Set up Circuit 1: battery → bulb → switch, connected in a loop. Leave the switch open.',
          character: 'Lumi',
          line: 'Always build with the switch open so no current flows while you are connecting components. Close it only to test.',
        },
        {
          text: 'Close the switch. Observe whether the bulb lights. Open the switch again.',
          character: 'Madu',
          line: 'If it lights — YES! If not, check your connections. A loose wire breaks the circuit.',
        },
        {
          text: 'Add the ammeter in SERIES between the battery and the bulb. Close the switch and read the current.',
          character: 'Lumi',
          line: 'In series means in line — the current passes through the ammeter as part of its journey around the circuit.',
        },
        {
          text: 'Add the voltmeter in PARALLEL across the bulb — one terminal each side of the bulb. Close the switch and read the voltage.',
          character: 'Lumi',
          line: 'In parallel means across — the voltmeter sits alongside the bulb, not in its path.',
        },
        {
          text: 'Record your ammeter and voltmeter readings in the results table.',
          character: 'Pip',
          line: null,
        },
        {
          text: 'Optional: replace the bulb with a motor or fan. Close the switch and observe what changes.',
          character: 'Pip',
          line: 'The same current drives completely different effects — that\'s the beauty of circuits. Change the component, change the output.',
        },
      ],
    },
    results: {
      title: 'What did we find?',
      gpsSkill: 'Record results in tables · Identify patterns',
      graphErrorText: 'Check the formula: R = V ÷ I. Divide voltage by current.',
    },
    theory: {
      title: 'Why does this happen?',
      layer1Character: 'pip',
      layer1Line:
        'Current is like water flowing through a pipe. Voltage is the pressure pushing it. Resistance is a narrow section that slows the flow down. More pressure = more flow. Narrower pipe = less flow for the same pressure.',
      lumiDeepDive:
        'Ohm\'s Law: V = IR. Voltage (V, volts) = Current (I, amperes) × Resistance (R, ohms). An ammeter measures current — connected in series, it must have very low resistance so it doesn\'t affect the circuit. A voltmeter measures potential difference — connected in parallel, it must have very high resistance so almost no current flows through it.',
      gpsSkill: 'Write conclusions',
      cards: [
        {
          character: 'pip',
          front: 'Why did the current stay the same everywhere in the circuit?',
          back: "In a series circuit there's only one path for charge to flow — so whatever current leaves the battery has to be the exact same current flowing through every single component, all the way round.",
        },
        {
          character: 'lili',
          front: 'Why does the ammeter go IN the circuit but the voltmeter goes ACROSS it?',
          back: "An ammeter measures the flow passing through, so it must be part of the path (in series). A voltmeter measures the difference in push between two points, so it sits across a component (in parallel) without joining the main loop.",
        },
        {
          character: 'madu',
          front: 'Why did the motor and fan behave differently to the bulb?',
          back: "Same battery, same switch, same current — but completely different output! The component you connect determines what the electrical energy actually becomes: light and heat from a bulb, or motion from a motor or fan.",
        },
        {
          character: 'lumi',
          front: "Go deeper: what's the actual equation?",
          back: "Ohm's Law: V = IR. Voltage (volts) = Current (amperes) × Resistance (ohms). It's the relationship that ties everything you measured together into one formula.",
        },
      ],
    },
    summary: {
      aim: {
        body: 'We wanted to build circuits with increasing complexity and measure how current and voltage behave in a simple series circuit.',
        line: 'The circuit in your phone is this — just thousands of times smaller.',
      },
      keyResult: {
        character: 'lumi',
        body: 'When the circuit was complete and the switch was closed, the bulb lit up. The ammeter read 0.3A — the same current flows through every point in a series circuit. The voltmeter read 1.5V across the bulb.',
        line: 'This is why ammeters are connected in series and voltmeters in parallel in every electrical test ever done.',
      },
      pattern: {
        body: "The pattern shows that in a series circuit, current is the same everywhere — 0.3A through the battery, through the bulb, through the ammeter. But voltage divides: the 1.5V is 'used up' across the bulb. The ratio of V to I is always the same for a given component — that is Ohm's Law.",
        line: 'V = IR. That is the entire relationship. Voltage, current, resistance. Everything in electronics is built on those three letters.',
      },
      keyPoints: {
        bullets: [
          'A complete circuit needs a closed loop with no gaps',
          'Current is the same everywhere in a series circuit',
          'Voltage is shared across components in a series circuit',
          'Ammeter: in series, low resistance',
          'Voltmeter: in parallel, high resistance',
          'V = IR (Ohm\'s Law)',
        ],
        line: "You built three circuits and measured current and voltage. That's electrical engineering.",
      },
    },
    reflection: {
      title: 'Your turn to think',
      pipIntro: 'You built three circuits, measured current and voltage, and used Ohm\'s Law to calculate resistance. That is secondary-school physics — done properly.',
      prompts: [
        'What happened to the bulb when you opened the switch? Why? Explain using the idea of a complete circuit.',
        'If you added a second bulb in series, predict what would happen to the brightness of the first bulb. Explain your prediction.',
      ],
      completeMessage: "DONE! You've completed Y7 Practical 5. Head back to the notebook to see your stamp!",
      gpsSkill: 'Suggest improvements to investigations',
    },
  },
  wetLabDialogue: {
    welcome: ["We're going to build three circuits today, each one more complex than the last. Start by finding the battery."],
    celebrate: ['Circuit complete! Nice work.'],
    error: ["The circuit isn't complete yet — there's a gap. Place all the required components first."],
    fact: [
      'The bulb glows because the filament resists the current — that resistance converts electrical energy into light and heat!',
      '0.3 amperes means 0.3 coulombs of charge passes this point every second. A coulomb is about 6 billion billion electrons.',
    ],
    checkpoint: ['Two circuits down, one to go. Progress saved!'],
  },
};
