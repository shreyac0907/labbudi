// Y7 P2 — Measuring Force on a Ramp. Full rebuild: the Newton meter is
// zeroed before it's ever attached, held PARALLEL to the ramp connected to
// the block by a string, and the whole rig (ramp/block/meter/string) lives
// in one component (RampRig) so tilting the ramp carries everything else
// with it. Angle is set by dragging a tilt handle at the ramp's raised
// end (RampAngleGame); each angle checkpoint is exactly 3 sub-steps — set
// angle, pull, read+record fused into one continuous beat — so the
// checkpoint bar shows 3 icons per angle, matching the physical sequence
// a student actually performs.

const ANGLE_ROWS = ['0°', '15°', '30°', '45°', '60°'];
const EXPECTED = { '0°': 0.3, '15°': 1.3, '30°': 2.5, '45°': 3.5, '60°': 4.3 };

function priorValuesBefore(row) {
  const idx = ANGLE_ROWS.indexOf(row);
  const values = {};
  for (let i = 0; i < idx; i += 1) values[ANGLE_ROWS[i]] = EXPECTED[ANGLE_ROWS[i]];
  return values;
}

export const y7p2 = {
  id: 'y7_p2',
  title: 'Measuring Force on a Ramp',
  subject: 'physics',
  tabletop: true, // the whole canvas is the bench's wooden top: the ramp sits on it
  year: 'y7',
  character: 'lumi',

  evaluation: { goldThreshold: 90, silverThreshold: 70, bronzeThreshold: 50 },

  // last step of each named section — Safety / Setup / each angle group / Understand
  checkpoints: [0, 5, 8, 11, 14, 17, 20, 24],

  checkpointGroups: [
    { id: 'safety', name: 'Safety', stepRange: [0, 0] },
    { id: 'setup', name: 'Setup', stepRange: [1, 5] },
    { id: 'angle0', name: 'Measure at 0°', stepRange: [6, 8] },
    { id: 'angle15', name: 'Measure at 15°', stepRange: [9, 11] },
    { id: 'angle30', name: 'Measure at 30°', stepRange: [12, 14] },
    { id: 'angle45', name: 'Measure at 45°', stepRange: [15, 17] },
    { id: 'angle60', name: 'Measure at 60°', stepRange: [18, 20] },
    { id: 'understand', name: 'Understand', stepRange: [21, 24] },
  ],

  steps: [
    // STEP 0 — SAFETY
    {
      id: 'p2_safety',
      iconType: 'hazard',
      title: 'Safety Check',
      instruction: 'Tap each hazard card before we begin.',
      type: 'tap',
      parameters: {
        targets: [
          { id: 'falling_masses', label: 'Falling Masses', rule: 'Stand clear below the block. Masses can fall if the string breaks.' },
          { id: 'sharp_edges', label: 'Sharp Edges', rule: 'The ramp edge can be sharp. Handle carefully.' },
          { id: 'steady_pull', label: 'Steady Pull', rule: 'Pull smoothly, a sudden yank can snap the string.' },
        ],
        requiredTaps: 3,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'lili',
      feedback: { success: "Safety checks done. Let's set up the apparatus.", failure: 'Tap every hazard card.' },
    },

    // STEP 1 — PLACE THE RAMP
    {
      id: 'p2_place_ramp',
      iconType: 'drag',
      title: 'Place the Ramp',
      instruction: 'Place your ramp on the bench.',
      type: 'drag',
      parameters: {
        objectId: 'ramp_3d',
        rig: 'ramp', // lands exactly where RampRig draws the ramp in the angle and pull steps
        fromZone: { x: 24, y: 17, w: 120, h: 80 },
        toZone: { x: 40, y: 55, w: 260, h: 60 },
        snapDistance: 70,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: {
        success: "Great, a flat ramp is our starting point. We'll tilt it to different angles to measure how force changes.",
        failure: 'Drag the ramp onto the bench.',
      },
    },

    // STEP 2 — ZERO THE NEWTON METER (before anything is attached)
    {
      id: 'p2_zero_meter',
      iconType: 'magnifier',
      title: 'Zero the Newton Meter',
      instruction: 'Before we attach anything, tap when the needle hits 0N.',
      type: 'zero_meter',
      parameters: { startOffset: 0.3, maxReading: 5, timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'madu',
      feedback: {
        success: 'Always zero the meter first, otherwise your measurements will all be wrong by the same amount!',
        failure: 'Tap right when the needle crosses 0N.',
      },
    },

    // STEP 3 — PLACE BLOCK ON RAMP
    {
      id: 'p2_place_block',
      iconType: 'drag',
      title: 'Place the Block',
      instruction: 'Place the block at the bottom of the ramp.',
      type: 'drag',
      parameters: {
        objectId: 'block_3d',
        rig: 'block', // on the ramp, at its bottom (hinge) end, where the rig starts it
        fromZone: { x: 24, y: 28, w: 80, h: 60 },
        toZone: { x: 30, y: 68, w: 80, h: 70 },
        snapDistance: 50,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: { success: "The block goes at the bottom, we'll be pulling it up the slope.", failure: 'Place the block at the bottom of the ramp.' },
    },

    // STEP 4 — ATTACH THE (NOW ZEROED) NEWTON METER TO THE BLOCK
    {
      id: 'p2_attach_meter',
      iconType: 'drag',
      title: 'Attach the Newton Meter',
      instruction: 'Attach the Newton meter hook to the front of the block, and hold the handle end.',
      type: 'drag',
      parameters: {
        objectId: 'newton_meter_3d',
        rig: 'meter', // laid along the ramp, hook towards the block, as in the rig
        fromZone: { x: 70, y: 16, w: 300, h: 90 },
        toZone: { x: 55, y: 30, w: 330, h: 90 },
        snapDistance: 70,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: {
        success: "Connected! The Newton meter sits parallel to the ramp surface, that's how we measure the force along the ramp, not vertically.",
        failure: 'Drag the Newton meter above the ramp, near the block.',
      },
    },

    // STEP 5 — TIE THE STRING TO THE BLOCK AND THE METER
    {
      id: 'p2_tie_string',
      iconType: 'knot',
      title: 'Tie the String',
      instruction: 'Tie the string to the block and to the Newton meter, with a knot at each end.',
      type: 'tie_knot',
      parameters: { timeLimit: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: {
        success: "Both ends are knotted. A firm knot means the block can't slip free while we pull.",
        failure: 'Press the glowing spot to keep tying the knot.',
      },
    },

    // 0° GROUP — SET ANGLE / PULL / READ+RECORD
    {
      id: 'p2_angle_0',
      iconType: 'angle',
      title: 'Set Angle: 0°',
      instruction: 'The ramp starts flat. Drag the handle at the top of the ramp until the protractor reads 0°.',
      type: 'ramp_angle',
      parameters: { targetAngle: 0, startAngle: 0, tolerance: 3, timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: '0°. Watch how the force changes at this angle.', failure: 'Drag the handle to reach 0°.' },
    },
    {
      id: 'p2_pull_0',
      iconType: 'pull',
      title: 'Pull the Block at 0°',
      instruction: 'Hold the handle. Pull slowly and smoothly up the ramp, keeping it parallel to the surface.',
      type: 'hold',
      parameters: { duration: 2.2, timeLimit: 0, expectedForce: 0.3, angleDeg: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: { success: 'The Newton meter shows 0.3N. Now zoom in to read it exactly.', failure: 'Keep holding until the block reaches the top!' },
    },
    {
      id: 'p2_read_0',
      iconType: 'magnifier',
      title: 'Read the Newton Meter',
      instruction: 'Tap the Newton meter to zoom in. Read the force in Newtons.',
      type: 'zoom_read',
      parameters: { correctReading: 0.3, readingUnit: 'N', options: [0.0, 0.3, 1.3, 2.5], angleLabel: '0°', allRows: ANGLE_ROWS, priorValues: priorValuesBefore('0°'), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: "0.3N, that's just friction. No slope means almost no pulling force needed.", failure: 'Look at where the indicator points on the scale.' },
    },

    // 15° GROUP
    {
      id: 'p2_angle_15',
      iconType: 'angle',
      title: 'Set Angle: 15°',
      instruction: 'Drag the handle at the top of the ramp until the protractor reads 15°.',
      type: 'ramp_angle',
      parameters: { targetAngle: 15, startAngle: 0, tolerance: 3, timeLimit: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: { success: '15° set. Notice the ramp rising. The block will be harder to pull now.', failure: 'Drag the handle until the protractor reads 15°.' },
    },
    {
      id: 'p2_pull_15',
      iconType: 'pull',
      title: 'Pull the Block at 15°',
      instruction: 'Hold the handle and pull steadily up the 15° ramp.',
      type: 'hold',
      parameters: { duration: 2.4, timeLimit: 0, expectedForce: 1.3, angleDeg: 15 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: { success: 'Block reached the top! Now zoom in and read the Newton meter.', failure: 'Keep holding until the block reaches the top.' },
    },
    {
      id: 'p2_read_15',
      iconType: 'magnifier',
      title: 'Read the Newton Meter at 15°',
      instruction: 'Zoom in and read the force.',
      type: 'zoom_read',
      parameters: { correctReading: 1.3, readingUnit: 'N', options: [0.3, 1.3, 2.5, 3.5], angleLabel: '15°', allRows: ANGLE_ROWS, priorValues: priorValuesBefore('15°'), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: '1.3N, the force increased with the angle, just as predicted.', failure: 'Read the scale carefully where the indicator points.' },
    },

    // 30° GROUP
    {
      id: 'p2_angle_30',
      iconType: 'angle',
      title: 'Set Angle: 30°',
      instruction: 'Drag the handle to reach 30° on the protractor.',
      type: 'ramp_angle',
      parameters: { targetAngle: 30, startAngle: 15, tolerance: 3, timeLimit: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: { success: '30°, halfway steep. Force is rising noticeably.', failure: 'Reach 30° on the protractor.' },
    },
    {
      id: 'p2_pull_30',
      iconType: 'pull',
      title: 'Pull at 30°',
      instruction: 'Hold and pull steadily up the 30° ramp.',
      type: 'hold',
      parameters: { duration: 2.6, timeLimit: 0, expectedForce: 2.5, angleDeg: 30 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: { success: 'Top reached! Now zoom in and read the meter.', failure: 'Hold all the way to the top.' },
    },
    {
      id: 'p2_read_30',
      iconType: 'magnifier',
      title: 'Read at 30°',
      instruction: 'Zoom in and read the Newton meter.',
      type: 'zoom_read',
      parameters: { correctReading: 2.5, readingUnit: 'N', options: [1.3, 2.0, 2.5, 3.5], angleLabel: '30°', allRows: ANGLE_ROWS, priorValues: priorValuesBefore('30°'), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: "2.5N, exactly half the block's weight. sin(30°) = 0.5. Physics working perfectly.", failure: 'Read where the indicator points on the scale.' },
    },

    // 45° GROUP
    {
      id: 'p2_angle_45',
      iconType: 'angle',
      title: 'Set Angle: 45°',
      instruction: 'This is steep. Drag the handle to reach 45°.',
      type: 'ramp_angle',
      parameters: { targetAngle: 45, startAngle: 30, tolerance: 3, timeLimit: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: { success: "45°, steep. You're testing your arm here.", failure: 'Reach 45° on the protractor.' },
    },
    {
      id: 'p2_pull_45',
      iconType: 'pull',
      title: 'Pull at 45°',
      instruction: "Hold steadily. It will feel harder, that's the physics.",
      type: 'hold',
      parameters: { duration: 2.8, timeLimit: 0, expectedForce: 3.5, angleDeg: 45 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: { success: 'Block made it! Now zoom in and read the meter.', failure: 'Hold all the way to the top.' },
    },
    {
      id: 'p2_read_45',
      iconType: 'magnifier',
      title: 'Read at 45°',
      instruction: 'Zoom in and read the force.',
      type: 'zoom_read',
      parameters: { correctReading: 3.5, readingUnit: 'N', options: [2.5, 3.0, 3.5, 4.3], angleLabel: '45°', allRows: ANGLE_ROWS, priorValues: priorValuesBefore('45°'), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: '3.5N, the ramp is losing its mechanical advantage at this angle.', failure: 'Read the indicator on the scale.' },
    },

    // 60° GROUP
    {
      id: 'p2_angle_60',
      iconType: 'angle',
      title: 'Set Angle: 60°',
      instruction: 'This is very steep. Carefully raise the ramp to 60°.',
      type: 'ramp_angle',
      parameters: { targetAngle: 60, startAngle: 45, tolerance: 3, timeLimit: 0 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'lumi',
      feedback: { success: '60°, at this angle the ramp barely helps at all.', failure: 'Reach 60° on the protractor.' },
    },
    {
      id: 'p2_pull_60',
      iconType: 'pull',
      title: 'Pull at 60°',
      instruction: "Hold and pull steadily. You'll feel the most resistance yet.",
      type: 'hold',
      parameters: { duration: 3.0, timeLimit: 0, expectedForce: 4.3, angleDeg: 60 },
      evaluation: { perfectThreshold: 0.9, goodThreshold: 0.7, passThreshold: 0.5 },
      character: 'pip',
      feedback: { success: 'Top! Now zoom in for the final reading.', failure: 'Keep holding. Almost there.' },
    },
    {
      id: 'p2_read_60',
      iconType: 'magnifier',
      title: 'Read at 60°',
      instruction: 'Zoom in for the final reading.',
      type: 'zoom_read',
      parameters: { correctReading: 4.3, readingUnit: 'N', options: [3.5, 4.0, 4.3, 5.0], angleLabel: '60°', allRows: ANGLE_ROWS, priorValues: priorValuesBefore('60°'), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: "4.3N. One more unit of angle and you'd need the full weight of the block.", failure: 'Read where the indicator is pointing.' },
    },

    // WHAT DOES IT MEAN?
    // UNDERSTAND GROUP — RECORD / GRAPH PARTS / BEST FIT / WHAT IT MEANS
    {
      id: 'p2_record_table',
      iconType: 'table',
      title: 'Record Your Results',
      instruction: 'Put each force reading in the table, next to its angle.',
      type: 'force_table',
      parameters: { rows: ANGLE_ROWS.map((angle) => ({ angle, force: EXPECTED[angle] })), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'lumi',
      feedback: { success: 'Your results table is complete. Next, a graph of it.', failure: 'Match each reading to its angle. A steeper ramp means a bigger force.' },
    },
    {
      id: 'p2_graph_parts',
      iconType: 'graph',
      title: 'Parts of a Graph',
      instruction: 'Here is a graph of your results. Pick a word, then tap the numbered badge that points at that part.',
      type: 'graph_parts',
      parameters: { points: ANGLE_ROWS.map((angle) => ({ x: parseInt(angle, 10), y: EXPECTED[angle] })), timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 0.8, passThreshold: 0.6 },
      character: 'madu',
      feedback: { success: 'Scale, axes, plots and units. Now you can read any graph.', failure: 'Pick a word, then tap the badge that points at that part.' },
    },
    {
      id: 'p2_best_fit',
      iconType: 'graph',
      title: 'Line of Best Fit',
      instruction: 'Slide the slider to tilt the line until it goes through every cross.',
      type: 'best_fit',
      parameters: { points: ANGLE_ROWS.map((angle) => ({ x: parseInt(angle, 10), y: EXPECTED[angle] })), startSlope: 0.025, timeLimit: 0 },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'pip',
      feedback: { success: 'A line of best fit shows the pattern: as the angle goes up, the force goes up.', failure: 'Tilt the line until it touches every cross.' },
    },
    {
      id: 'p2_meaning',
      iconType: 'notepad',
      title: 'What Does It Mean?',
      instruction: 'Read each slide to understand what your results are telling you.',
      type: 'tap',
      parameters: {
        targets: [
          { id: 'pattern', label: 'Reading the Newton Meter', content: "First, hold the meter the way you will use it and check that the pointer sits on 0 N. If it does not, zero it before you attach anything. Then pull slowly and steadily along the ramp. Look straight at the scale and read the number the pointer is level with. The unit is newtons, written N." },
          { id: 'simple_machine', label: 'Weight: W = mg', content: "Gravity pulls every object down. That pull is its weight, W. We work it out with W = m × g. W is the weight in newtons (N), m is the mass in kilograms (kg), and g is the pull of gravity, about 10 N for every 1 kg. Our block has a mass of 0.5 kg, so W = 0.5 × 10 = 5 N." },
          { id: 'real_world', label: 'Why the Force Goes Up', content: "On a flat ramp, the ramp holds up all of the block's weight, so you only pull against a little friction. Tilt the ramp and it holds up less of the weight. Your pull has to do more of the work to stop the block sliding back down. The steeper the ramp, the more of the 5 N weight you have to pull against, so the Newton meter reading goes up." },
          { id: 'conclusion', label: 'Conclusion', content: "The steeper the ramp, the bigger the force on the Newton meter. At 0° it was only about 0.3 N, and at 60° it was about 4.3 N. If the ramp were straight up, you would pull with the whole weight, W = mg = 5 N. Your line of best fit shows it: as the angle goes up, the force goes up." },
        ],
        requiredTaps: 4,
        timeLimit: 0,
      },
      evaluation: { perfectThreshold: 1.0, goodThreshold: 1.0, passThreshold: 1.0 },
      character: 'lumi',
      feedback: { success: "You understood the physics. That's the whole point.", failure: 'Tap every card.' },
    },
  ],

  unlocks: ['y7_p3'],
};

export default y7p2;
