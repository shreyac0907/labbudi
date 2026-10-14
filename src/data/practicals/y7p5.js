// Y7 P5 — Building Simple Circuits. Native checkpoint format: Safety, then
// one checkpoint per circuit (Simple Circuit / Adding a Switch / Reading
// Current), then Understand.

export const y7p5 = {
  id: 'y7_p5',
  title: 'Building Simple Circuits',
  subject: 'physics',
  year: 'y7',
  character: 'lumi',

  evaluation: { goldThreshold: 90, silverThreshold: 70, bronzeThreshold: 50 },

  checkpoints: [
    {
      id: 'safety',
      name: 'Safety',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5_safety',
          iconType: 'hazard',
          title: 'Safety Check',
          instruction: 'Tap each hazard card before we begin.',
          type: 'tap',
          parameters: {
            targets: [
              { id: 'wet_hands', label: 'Wet Hands', rule: 'Never handle a circuit with wet hands.' },
              { id: 'battery_orientation', label: 'Battery Orientation', rule: 'Check + and − before connecting, the wrong way round can damage the battery.' },
              { id: 'open_circuit', label: 'Open the Circuit First', rule: 'Disconnect a wire before rearranging any part of the circuit.' },
            ],
            requiredTaps: 3,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lili',
          feedback: { success: "Safety checks done. Let's build your first circuit.", failure: 'Tap every hazard card.' },
        },
      ],
    },
    {
      id: 'circuit_simple',
      name: 'Simple Circuit',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5c1_build',
          iconType: 'drag',
          title: 'Build the Circuit',
          instruction: 'Drag each part onto its dashed spot, then drag a wire from one connector to the next.',
          type: 'circuit_builder',
          parameters: {
            components: [
              { id: 'battery', kind: 'battery', label: 'Battery', slot: { x: 12, y: 56 } },
              { id: 'switch', kind: 'switch', label: 'Switch', slot: { x: 38, y: 16 } },
              { id: 'bulb', kind: 'bulb', label: 'Bulb', slot: { x: 84, y: 76 }, labelPos: 'above' },
            ],
            wires: [
              ['battery.R', 'switch.L'],
              ['switch.R', 'bulb.L'],
              ['bulb.R', 'battery.L'],
            ],
            schematic: {
              // standard circuit symbols; a segment lights up when its real wire is made (segment i is wire i)
              symbols: [
                { type: 'battery', x: 18, y: 55, orient: 'v' },
                { type: 'switch', x: 55, y: 20 },
                { type: 'bulb', x: 92, y: 55, orient: 'v' },
              ],
              segments: ['M18,47 L18,20 L47,20', 'M63,20 L92,20 L92,47', 'M92,63 L92,90 L18,90 L18,63'],
              flow: [[18, 47], [18, 20], [92, 20], [92, 90], [18, 90], [18, 63]],
            },
            meterRead: null,
            timeLimit: 40,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lumi',
          feedback: { success: 'THE BULB IS ON! The circuit is complete, electrons are flowing!', failure: 'Wire every connector, then close the switch.' },
        },
      ],
    },
    {
      id: 'circuit_ammeter',
      name: 'Adding an Ammeter',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5c2_build',
          iconType: 'drag',
          title: 'Add the Ammeter',
          instruction: 'Place the ammeter in series, wire it in, then close the switch and read it.',
          type: 'circuit_builder',
          parameters: {
            components: [
              { id: 'battery', kind: 'battery', label: 'Battery', slot: { x: 12, y: 56 } },
              { id: 'switch', kind: 'switch', label: 'Switch', slot: { x: 24, y: 16 } },
              { id: 'ammeter', kind: 'ammeter', label: 'Ammeter', slot: { x: 52, y: 16 }, reading: 0.3, maxReading: 1 },
              { id: 'bulb', kind: 'bulb', label: 'Bulb', slot: { x: 84, y: 76 }, labelPos: 'above' },
            ],
            wires: [
              ['battery.R', 'switch.L'],
              ['switch.R', 'ammeter.L'],
              ['ammeter.R', 'bulb.L'],
              ['bulb.R', 'battery.L'],
            ],
            schematic: {
              symbols: [
                { type: 'battery', x: 14, y: 55, orient: 'v' },
                { type: 'switch', x: 36, y: 20 },
                { type: 'ammeter', x: 68, y: 20 },
                { type: 'bulb', x: 95, y: 55, orient: 'v' },
              ],
              segments: ['M14,47 L14,20 L28,20', 'M44,20 L60,20', 'M76,20 L95,20 L95,47', 'M95,63 L95,90 L14,90 L14,63'],
              flow: [[14, 47], [14, 20], [95, 20], [95, 90], [14, 90], [14, 63]],
            },
            meterRead: {
              unit: 'A',
              correctReading: 0.3,
              maxReading: 1,
              options: [0.1, 0.3, 0.6, 0.9],
              successMsg: '0.3 amperes. Same current everywhere in a series circuit.',
            },
            timeLimit: 45,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lumi',
          feedback: { success: '0.3A, that current is the same everywhere in this loop.', failure: 'An ammeter must sit in series, in the loop itself.' },
        },
      ],
    },
    {
      id: 'circuit_voltmeter',
      name: 'Adding a Voltmeter',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5c3_build',
          iconType: 'drag',
          title: 'Add the Voltmeter',
          instruction: 'Place the voltmeter ACROSS the bulb, both its terminals connect to the bulb, not the main loop.',
          type: 'circuit_builder',
          parameters: {
            components: [
              { id: 'battery', kind: 'battery', label: 'Battery', slot: { x: 12, y: 56 } },
              { id: 'switch', kind: 'switch', label: 'Switch', slot: { x: 24, y: 16 } },
              { id: 'ammeter', kind: 'ammeter', label: 'Ammeter', slot: { x: 52, y: 16 }, reading: 0.3, maxReading: 1 },
              // the bulb sits at the bottom right with the voltmeter straight above it, so the voltmeter's two wires are short and go straight down to the bulb
              { id: 'bulb', kind: 'bulb', label: 'Bulb', slot: { x: 84, y: 76 }, labelPos: 'above' }, // its name goes above, clear of the wire that runs underneath
              { id: 'voltmeter', kind: 'voltmeter', label: 'Voltmeter', slot: { x: 84, y: 40 }, reading: 1.5, maxReading: 5 },
            ],
            wires: [
              ['battery.R', 'switch.L'],
              ['switch.R', 'ammeter.L'],
              ['ammeter.R', 'bulb.L'],
              ['bulb.R', 'battery.L'],
              ['voltmeter.L', 'bulb.L', 'parallel'], // wires on a parallel branch are drawn in green
              ['voltmeter.R', 'bulb.R', 'parallel'],
            ],
            schematic: {
              symbols: [
                { type: 'battery', x: 12, y: 55, orient: 'v' },
                { type: 'switch', x: 30, y: 20 },
                { type: 'ammeter', x: 58, y: 20 },
                { type: 'bulb', x: 84, y: 55, orient: 'v' },
                { type: 'voltmeter', x: 102, y: 55, orient: 'v' },
              ],
              // the voltmeter's two wires (4 and 5) go to the two ends of the bulb: it is in parallel with it
              segments: ['M12,47 L12,20 L22,20', 'M38,20 L50,20', 'M66,20 L84,20 L84,47', 'M84,63 L84,90 L12,90 L12,63', 'M84,47 L84,36 L102,36 L102,47', 'M84,63 L84,74 L102,74 L102,63'],
              dots: [[84, 47], [84, 63]],
              flow: [[12, 47], [12, 20], [84, 20], [84, 90], [12, 90], [12, 63]],
            },
            meterRead: {
              unit: 'V',
              correctReading: 1.5,
              maxReading: 5,
              options: [0.5, 1.0, 1.5, 3.0],
              successMsg: 'V = IR. 1.5 ÷ 0.3 = 5 ohms. That’s the bulb’s resistance.',
            },
            timeLimit: 50,
          },
          evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
          character: 'lumi',
          feedback: { success: '1.5V across the bulb, a voltmeter always connects in parallel.', failure: 'The voltmeter needs both terminals on the bulb, not the main loop.' },
        },
      ],
    },
    {
      // Bonus challenge (Prompt 3) — after the 3 required circuits, a
      // parallel-wiring puzzle the student hasn't seen before. Its own
      // onComplete result is fixed/neutral (see CircuitBuilderGame's
      // challengeMode branch of finish()) so it can never touch the real
      // checkpoint medal — only the live score + CIRCUIT MASTER badge.
      id: 'circuit_challenge',
      name: 'Bonus: Mystery Circuit',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5_challenge',
          iconType: 'drag_connect',
          title: 'Bonus: Build the Mystery Circuit!',
          instruction: 'Replicate the diagram, a bulb in PARALLEL with a motor.',
          type: 'circuit_builder',
          parameters: {
            challengeMode: true,
            components: [
              { id: 'battery', kind: 'battery', label: 'Battery', slot: { x: 16, y: 52 } },
              { id: 'bulb', kind: 'bulb', label: 'Bulb', slot: { x: 60, y: 24 } },
              { id: 'motor', kind: 'motor', label: 'Motor', slot: { x: 60, y: 76 } },
            ],
            wires: [
              ['battery.R', 'bulb.L'],
              ['bulb.R', 'battery.L'],
              ['battery.R', 'motor.L', 'parallel'],
              ['motor.R', 'battery.L', 'parallel'],
            ],
            schematic: {
              symbols: [
                { type: 'battery', x: 14, y: 55, orient: 'v' },
                { type: 'bulb', x: 58, y: 24 },
                { type: 'motor', x: 58, y: 76 },
              ],
              // the bulb and the motor each have their own path from the battery: they are in parallel
              segments: ['M14,47 L14,24 L50,24', 'M66,24 L90,24 L90,92 L14,92 L14,63', 'M14,47 L30,47 L30,76 L50,76', 'M66,76 L90,76'],
              dots: [[14, 47], [90, 76]],
              flows: [
                [[14, 47], [14, 24], [90, 24], [90, 92], [14, 92], [14, 63]],
                [[14, 47], [30, 47], [30, 76], [90, 76], [90, 92], [14, 92], [14, 63]],
              ],
            },
            hints: ['The motor connects across the bulb, not in series.'],
            bonusPoints: 500,
            timeLimit: 60,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lumi',
          feedback: { success: 'CIRCUIT MASTER!', failure: 'CIRCUIT MASTER!' },
        },
      ],
    },
    {
      id: 'understand',
      name: 'Understand',
      isSavePoint: true,
      subSteps: [
        {
          id: 'p5_understand',
          iconType: 'notepad',
          title: 'What Does It Mean?',
          instruction: 'Read each slide to understand your circuits.',
          type: 'tap',
          parameters: {
            targets: [
              { id: 'circuit', label: 'What Is a Circuit?', content: "An electric circuit is a loop that electricity can travel all the way around. The battery pushes the electricity, the wires carry it, and the bulb uses it to make light. If there is a gap anywhere in the loop, the electricity stops. That is why a torch only works when everything inside it is joined up in one complete loop." },
              { id: 'switch', label: 'Switches', content: "A switch is a gap in the circuit that you can open or close. When it is closed, the loop is complete and the bulb lights up. When it is open, there is a gap and everything switches off. You use switches all day: the light switch on the wall, the button on a torch and the power button on a game controller." },
              { id: 'series', label: 'Series Circuits', content: "In a series circuit, everything is on one single loop, like children holding hands in a ring. The same current goes through every part. If one part breaks, the whole loop stops. Old strings of fairy lights are wired like this, so one broken bulb can switch off the whole string. Add more bulbs to the loop and each one gets dimmer." },
              { id: 'parallel', label: 'Parallel Circuits', content: "In a parallel circuit, the electricity has more than one path to follow, like a road that splits in two. Each bulb has its own path, so if one bulb breaks, the others stay on. The lights in your home are wired in parallel. That is why you can switch off the kitchen light and the living room light stays on." },
              { id: 'meters', label: 'Ammeters and Voltmeters', content: "An ammeter measures current, which is how much electricity flows past each second. It goes in series, inside the loop. A voltmeter measures voltage, which is how hard the battery pushes. It goes in parallel, across the part you want to check. A phone charger is a real example, because it has its volts and amps printed on it." },
              { id: 'real_life', label: 'Circuits Around You', content: "Circuits are everywhere. A torch, a bicycle light, a doorbell, a toy car and your phone all use circuits. The electricity from a wall socket is much stronger than a battery, so never poke anything into a socket and never touch a plug with wet hands. Fuses and circuit breakers switch a circuit off if too much electricity flows, to keep us safe." },
            ],
            requiredTaps: 6,
            timeLimit: 0,
          },
          evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
          character: 'lumi',
          feedback: { success: "You understood the physics. That's the whole point.", failure: 'Tap every card.' },
        },
      ],
    },
  ],

  unlocks: [],
};

export default y7p5;
