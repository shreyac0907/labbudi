// Photos and diagrams for the Understand scrapbook pages, one pair per card, keyed by
// "<step id>:<card id>". `file` is a Wikimedia Commons file name (free licence); `by` is the
// photographer / author for the credit line; `contain: true` shows a diagram uncropped.
export const UNDERSTAND_IMAGES = {
  // Practical 1: testing pH using indicators
  'step_results_meaning:pattern_card': [
    { file: 'PH Indicator Collection.jpg', by: 'Danny William Wilson' },
    { file: 'Universal indicator paper.jpg', by: 'Bordercolliez' },
  ],
  'step_results_meaning:litmus_card': [
    { file: 'Litmus paper.JPG', by: 'Chemicalinterest' },
    { file: 'The result of blue litmus paper reaction with an acid.jpg', by: 'Kanesskong' },
  ],
  'step_results_meaning:phph_card': [
    { file: 'Phenolphthalein indicator.jpg', by: 'Dhivyabsk' },
    { file: 'Phenolphthalein as Indicator.svg', by: 'NadirSH', contain: true },
  ],
  'step_results_meaning:conclusion_card': [
    { file: 'Lemon - whole and split.jpg', by: 'Ivar Leidus' },
    { file: 'Sodium bicarbonate.jpg', by: 'Thavox' },
  ],
  // Practical 2: force and the ramp angle
  'p2_meaning:pattern': [
    { file: 'Spring scale. Made in USSR.jpg', by: 'Bestalex' },
    { file: 'Spring scale - 3241.jpg', by: 'Amada44' },
  ],
  'p2_meaning:simple_machine': [
    { file: 'Mass-on-inclined-plane.svg', by: 'MikeRun', contain: true },
    { file: 'Spring scale - 3241.jpg', by: 'Amada44' },
  ],
  'p2_meaning:real_world': [
    { file: 'Box on an Inclined Plane.png', by: 'SG0039', contain: true },
    { file: 'Hay Inclined Plane 4.jpg', by: 'Ostrich at English Wikipedia' },
  ],
  'p2_meaning:conclusion': [
    { file: 'Beach accessibility mobi-mat and wheelchair ramp.jpg', by: 'Jengod' },
    { file: 'Switchbacks on the road up to Tunel del Cristo Redentor.jpg', by: 'Karora' },
  ],
  // Practical 3: heating copper sulfate
  'p3_understand:setup': [
    { file: 'Bunsen Burner Set Up.jpg', by: 'Zax71' },
    { file: 'Bunsen burner in the classroom.jpg', by: 'Sally V' },
  ],
  'p3_understand:flames': [
    { file: 'Bunsen burner flame types.jpg', by: 'Arthur Jan Fijałkowski' },
    { file: 'LabEqx–Bunsen burner blue.svg', by: 'chris 論', contain: true },
  ],
  'p3_understand:observe': [
    { file: 'Melting ice on water.jpg', by: 'Rosendahl' },
    { file: 'Copper sulfate anhydrous.jpg', by: 'W. Oelen' },
  ],
  'p3_understand:reversible': [
    { file: 'Melting ice thermometer.jpg', by: 'Ulflund' },
    { file: 'Burning wood (fire).jpg', by: 'Shivansh Singh PL' },
  ],
  // Practical 4: cheek cells
  // the labelling scrapbook: our own labelled diagrams ({lang} is filled in with the current language)
  'p4_label:cell_membrane': [
    { src: '/assets/understand/animal_membrane.{lang}.svg', contain: true },
    { file: 'Human Cheek cells.jpg', by: 'Krishna satya 333' },
  ],
  'p4_label:nucleus': [
    { src: '/assets/understand/animal_nucleus.{lang}.svg', contain: true },
    { file: 'Nucleus in human cheek cell.jpg', by: 'Krishna satya 333' },
  ],
  'p4_label:cytoplasm': [
    { src: '/assets/understand/animal_cytoplasm.{lang}.svg', contain: true },
    { file: 'Human epithelial cells stained with methylene blue dye.jpg', by: 'Daliasalloum' },
  ],
  'p4_label:no_wall': [
    { src: '/assets/understand/animal_vs_plant.{lang}.svg', contain: true },
    { src: '/assets/understand/plant_cell.{lang}.svg', contain: true },
  ],
  'p4_understand:collect': [
    { file: 'Cotton swab, package and swabs.jpg', by: 'Jiafei Slay Queen' },
    { file: 'Human Cheek cells.jpg', by: 'Krishna satya 333' },
  ],
  'p4_understand:microscope': [
    { file: 'Parts of a Microscope (english).png', by: 'Thebiologyprimer', contain: true },
    { file: 'Two microsopes labeled.png', by: 'RWhitwam', contain: true },
  ],
  'p4_understand:identify': [
    { file: 'Human epithelial cells stained with methylene blue dye.jpg', by: 'Daliasalloum' },
    { src: '/assets/understand/animal_nucleus.{lang}.svg', contain: true },
  ],
  'p4_understand:plant_animal': [
    { src: '/assets/understand/animal_vs_plant.{lang}.svg', contain: true },
    { src: '/assets/understand/plant_cell.{lang}.svg', contain: true },
  ],
  // Practical 5: circuits: our own flat diagrams ({lang} is filled in with the current language), and two photos
  'p5_understand:circuit': [
    { src: '/assets/understand/circuit_closed.{lang}.svg', contain: true },
    { src: '/assets/understand/circuit_open.{lang}.svg', contain: true },
  ],
  'p5_understand:switch': [
    { file: 'Light Switch 1.jpg', by: 'Gaurav Dhwaj Khadka' },
    { src: '/assets/understand/circuit_open.{lang}.svg', contain: true },
  ],
  'p5_understand:series': [
    { src: '/assets/understand/circuit_series.{lang}.svg', contain: true },
    { file: 'Fairy lights KIngsford 004.jpg', by: 'Sardaka' },
  ],
  'p5_understand:parallel': [
    { src: '/assets/understand/circuit_parallel.{lang}.svg', contain: true },
    { src: '/assets/understand/circuit_compare.{lang}.svg', contain: true },
  ],
  'p5_understand:meters': [
    { src: '/assets/understand/circuit_ammeter.{lang}.svg', contain: true },
    { src: '/assets/understand/circuit_voltmeter.{lang}.svg', contain: true },
  ],
  'p5_understand:real_life': [
    { src: '/assets/understand/circuit_torch.{lang}.svg', contain: true },
    { src: '/assets/understand/circuit_house.{lang}.svg', contain: true },
  ],
};
