// Registry of every practical. Only y7_p1 has real content — everything
// else is a stub with empty steps so PracticalSelectScreen can render a
// "coming soon" card without special-casing anything.

import { y7p1 } from './y7p1';
import { y7p2 } from './y7p2';
import { y7p3 } from './y7p3';
import { y7p4 } from './y7p4';
import { y7p5 } from './y7p5';
import { PRACTICALS } from '../../config/practicals';
import { adaptLegacyPractical } from './adaptLegacy';
import { localizePractical } from '../../i18n/dataText';

const SUBJECT_TO_KEY = { chem: 'chemistry', bio: 'biology', phys: 'physics' };

function buildStub(year, index, meta) {
  return {
    id: `${year}_p${index + 1}`,
    title: meta.title,
    subject: SUBJECT_TO_KEY[meta.subject] ?? meta.subject,
    year,
    character: 'pip',
    thumbnail: null,
    stub: true,
    checkpoints: [],
    checkpointGroups: [],
    steps: [],
    unlocks: [],
  };
}

const registry = {};

Object.entries(PRACTICALS).forEach(([year, { list }]) => {
  list.forEach((meta, index) => {
    registry[`${year}_p${index + 1}`] = buildStub(year, index, meta);
  });
});

// Overwrite the real practicals with their full content.
registry[y7p1.id] = y7p1;
registry[y7p2.id] = y7p2;
registry[y7p3.id] = y7p3;
registry[y7p4.id] = y7p4;
registry[y7p5.id] = y7p5;

export function getPractical(practicalId) {
  const practical = registry[practicalId];
  // Text fields come back as live getters that follow the current language.
  return practical ? localizePractical(adaptLegacyPractical(practical)) : null;
}

export function listPracticals(year) {
  return Object.values(registry)
    .filter((p) => p.year === year)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function isPracticalStub(practicalId) {
  return registry[practicalId]?.stub !== false && !!registry[practicalId]?.stub;
}

export default registry;
