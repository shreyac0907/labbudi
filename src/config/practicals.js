export const YEAR_LABELS = { y7: 'Year 7', y8: 'Year 8', y9: 'Year 9' };

export const SUBJECT_META = {
  chem: { label: 'Chemistry', color: 'var(--color-chem)' },
  bio: { label: 'Biology', color: 'var(--color-bio)' },
  phys: { label: 'Physics', color: 'var(--color-phys)' },
};

// Pin colours used across the corkboard theme wherever something needs to
// read as "belonging" to a subject (practical cards, journey titles, etc).
export const SUBJECT_PIN = { chem: 'yellow', bio: 'green', phys: 'blue' };

export const PRACTICALS = {
  y7: {
    available: true,
    list: [
      {
        title: 'Testing pH Using Indicators',
        subject: 'chem',
        teaser: 'Test five solutions with three indicators and build your own colour reference chart.',
      },
      {
        title: 'Measuring Force on a Ramp',
        subject: 'phys',
        teaser: 'Slide the ramp to different angles and discover how force changes.',
      },
      {
        title: 'Heating Substances Using a Bunsen Burner',
        subject: 'chem',
        teaser: 'Light the burner safely and watch copper sulfate transform before your eyes.',
      },
      {
        title: 'Using a Microscope: Observing Cheek Cells',
        subject: 'bio',
        teaser: 'Prepare a slide, focus the microscope, and label the parts of a plant cell.',
      },
      {
        title: 'Building Simple Circuits',
        subject: 'phys',
        teaser: 'Snap components together and light up your very first circuit.',
      },
    ],
  },
  y8: {
    available: false,
    list: [
      {
        title: "Food Tests: Iodine, Benedict's, Biuret",
        subject: 'bio',
        teaser: 'Identify starch, sugar and protein hiding in everyday foods.',
      },
      {
        title: 'Flame Tests: Identifying Metal Ions',
        subject: 'chem',
        teaser: 'Burn metal salts and read the colourful fingerprint of each element.',
      },
      {
        title: 'Enzyme Activity: Amylase on Starch',
        subject: 'bio',
        teaser: 'Watch temperature change how fast an enzyme gets its job done.',
      },
      {
        title: 'Investigating Metal Reactivity',
        subject: 'chem',
        teaser: 'Drop metals into water and acid to rank them by reactivity.',
      },
      {
        title: 'Reflection & Refraction',
        subject: 'phys',
        teaser: 'Bounce and bend light with mirrors and glass blocks.',
      },
    ],
  },
  y9: {
    available: false,
    list: [
      {
        title: 'Food Tests: Full IGCSE Level',
        subject: 'bio',
        teaser: 'A full IGCSE-level nutrient analysis, including the test for fats.',
      },
      {
        title: 'Investigating Light Intensity and the Rate of Photosynthesis',
        subject: 'bio',
        teaser: 'Move the lamp and measure how light powers photosynthesis.',
      },
      {
        title: 'Investigating Osmosis in Potato Discs',
        subject: 'bio',
        teaser: 'Track how potato discs change mass in different sugar concentrations.',
      },
      {
        title: 'Paper Chromatography',
        subject: 'chem',
        teaser: 'Separate a mixture of dyes and calculate Rf values.',
      },
      {
        title: 'Force-Extension of a Spring',
        subject: 'phys',
        teaser: 'Load a spring and graph the relationship between force and extension.',
      },
    ],
  },
};
